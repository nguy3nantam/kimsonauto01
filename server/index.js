import express from 'express';
import compression from 'compression';
import sharp from 'sharp';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readData, updateData, database, audit } from './db.js';
import { initializeUsers, normalizeRole, norm, hashPassword, verifyPassword, profile, createSession, revokeSessions, logout, currentUser, requireUser, requireRole, inScope, canManage, route, httpError } from './security.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const uploads = process.env.UPLOADS_DIR || path.join(here, 'uploads');
await fs.mkdir(path.join(uploads, 'images'), { recursive: true });
await fs.mkdir(path.join(uploads, 'documents'), { recursive: true });
await initializeUsers();
const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" });
  next();
});
const buckets = new Map();
const limiter = (prefix, limit) => (req, res, next) => {
  const key = `${prefix}:${req.ip}`;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.until <= now) {
    if (buckets.size >= 10000) return res.status(429).json({ error: 'Vui l?ng th? l?i sau' });
    bucket = { until: now + 10 * 60 * 1000, count: 0 }; buckets.set(key, bucket);
  }
  if (++bucket.count > limit) {
    res.set('Retry-After', String(Math.ceil((bucket.until - now) / 1000)));
    return res.status(429).json({ error: 'Qu? nhi?u y?u c?u. Vui l?ng th? l?i sau ?t ph?t.' });
  }
  next();
};
setInterval(() => { for (const [key, value] of buckets) if (value.until < Date.now()) buckets.delete(key); }, 60000).unref();
app.use('/api/auth/login', limiter('login', 30));
app.use('/api/auth/register', limiter('register', 10));
app.post('/api/contacts', limiter('contacts', 20));
app.use('/api', (req, res, next) => {
  const publicRead = ['GET', 'HEAD'].includes(req.method) && (
    ['/branches', '/pillars', '/esg', '/settings'].includes(req.path) ||
    (req.path === '/news' && !req.query.all) ||
    (req.path === '/sliders' && !req.query.all) ||
    /^\/news\/[^/]+$/.test(req.path)
  );
  res.set('Cache-Control', publicRead ? 'public, max-age=60, stale-while-revalidate=300' : 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if (origin) {
      try { if (new URL(origin).host !== req.get('host')) throw new Error(); }
      catch { return res.status(403).json({ error: 'Ngu?n y?u c?u kh?ng h?p l?' }); }
    }
    if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ error: 'Ngu?n y?u c?u kh?ng h?p l?' });
  }
  next();
});
app.use(express.json({ limit: '15mb' }));
app.use('/api', (req, _res, next) => {
  try { req.user = currentUser(req); next(); } catch (error) { next(error); }
});

const text = z.string().trim().max(2000);
const short = z.string().trim().max(250);
const required = short.min(1);
const email = z.union([z.literal(''), z.string().email().max(250)]);
const image = z.string().max(2048).refine(value => !value || /^\/(?!\/)/.test(value) || /^https:\/\//.test(value), '???ng d?n ?nh ph?i l? HTTPS ho?c ???ng d?n n?i b?');
const password = z.string().min(12, 'M?t kh?u c?n ?t nh?t 12 k? t?').max(128);
const role = z.enum(['Admin', 'Leader', 'User']);
const userFields = z.object({ username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9_.-]+$/), password, fullName: required, name: short.optional(), unit: short, department: short, email: email.optional(), phone: short.optional(), role, status: z.enum(['active', 'inactive']) });
const contact = z.object({ name: required, fullName: short.optional(), phone: z.string().trim().min(6).max(30).regex(/^[+\d ()-]+$/), email: email.optional(), company: short.optional(), branch: short.optional(), message: text.optional(), subject: short.optional(), type: z.enum(['contact', 'booking', 'testdrive']).optional(), service: short.optional(), serviceType: short.optional(), carModel: short.optional(), date: short.optional(), timeSlot: short.optional() });
const schemas = {
  branches: z.object({ name: required, area: short.optional(), address: required, hotline: required, email: email.optional(), role: short.optional(), features: z.array(short).max(30).optional(), image: image.optional(), mapsUrl: image.optional() }),
  news: z.object({ title: required, category: short, summary: text, content: z.string().max(100000), image, status: z.enum(['published', 'draft']), date: short.optional(), readTime: short.optional() }),
  pillars: z.object({ title: required, subtitle: short, icon: short, category: short.optional(), badge: short.optional(), tagline: text.optional(), summary: text.optional(), description: z.string().max(10000), capabilities: z.array(text).max(30), image }),
  esg: z.object({ title: required, desc: text, kpi: short }),
  sliders: z.object({ title: required, image: image.refine(Boolean, 'Vui l?ng ch?n ?nh'), order: z.number().int().min(0).max(10000), active: z.boolean() }),
  settings: z.object({ name: short, legalName: short, foundingYear: z.number().int().min(1900).max(2200), headquarters: text, hotline: short, email, website: short, slogan: text, totalEngineers: z.number().nonnegative(), totalCustomers: z.number().nonnegative(), satisfactionRate: short, logo: image, logoWhite: image, favicon: image, siteTitle: short.optional() }),
};
const input = (schema, req) => schema.parse(req.body);
const stamp = () => new Date().toISOString();
const findItem = (items, id) => {
  const item = items.find(x => String(x.id) === id);
  if (!item) throw httpError(404, 'Kh?ng t?m th?y d? li?u');
  return item;
};
const checkUserScope = (actor, target) => {
  if (actor.role === 'Admin') return;
  if (actor.role !== 'Leader' || target.role !== 'User' || !actor.unit || !actor.department || norm(actor.unit) !== norm(target.unit) || norm(actor.department) !== norm(target.department)) throw httpError(403, 'B?n kh?ng c? quy?n qu?n l? ng??i d?ng n?y');
};

app.get('/api/health', route((_req, res) => { database.prepare('SELECT 1').get(); res.json({ status: 'ok' }); }));
app.post('/api/auth/login', route(async (req, res) => {
  const data = input(z.object({ username: required, password: z.string().min(1).max(128) }), req);
  const user = readData('users').find(u => norm(u.username) === norm(data.username));
  if (!user || user.status !== 'active' || !await verifyPassword(data.password, user.passwordHash)) throw httpError(401, 'T?i kho?n ho?c m?t kh?u kh?ng ch?nh x?c');
  createSession(req, res, user); audit(user, 'login', user.id); res.json({ user: profile(user) });
}));
app.post('/api/auth/logout', route((req, res) => { logout(req, res); res.json({ success: true }); }));
app.get('/api/auth/me', route((req, res) => res.json(requireUser(req))));
app.post('/api/auth/register', route(async (req, res) => {
  const data = input(userFields.omit({ role: true, status: true }), req);
  const passwordHash = await hashPassword(data.password);
  delete data.password;
  const user = { ...data, id: randomUUID(), role: 'User', status: 'active', passwordHash, createdAt: stamp() };
  updateData('users', users => {
    if (users.some(u => norm(u.username) === norm(user.username))) throw httpError(409, 'T?n t?i kho?n ?? t?n t?i');
    users.push(user);
  });
  createSession(req, res, user); audit(user, 'register', user.id); res.status(201).json({ user: profile(user) });
}));
app.get('/api/users', route((req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader');
  let users = readData('users').map(profile);
  if (actor.role === 'Leader') users = users.filter(u => u.role === 'User' && norm(u.unit) === norm(actor.unit) && norm(u.department) === norm(actor.department));
  for (const field of ['unit', 'department']) if (req.query[field] && req.query[field] !== 'all') users = users.filter(u => norm(u[field]) === norm(req.query[field]));
  if (req.query.search) users = users.filter(u => ['fullName', 'username', 'email', 'phone'].some(k => norm(u[k]).includes(norm(req.query.search))));
  res.json(users);
}));
app.post('/api/users', route(async (req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader');
  const data = input(userFields, req);
  if (actor.role === 'Leader') { data.role = 'User'; data.unit = actor.unit; data.department = actor.department; }
  const passwordHash = await hashPassword(data.password); delete data.password;
  const user = { ...data, id: randomUUID(), passwordHash, createdAt: stamp() };
  updateData('users', users => {
    if (users.some(u => norm(u.username) === norm(user.username))) throw httpError(409, 'T?n t?i kho?n ?? t?n t?i');
    users.push(user);
  });
  audit(actor, 'users.create', user.id); res.status(201).json(profile(user));
}));
app.put('/api/users/:id', route(async (req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader');
  checkUserScope(actor, findItem(readData('users'), req.params.id));
  const data = input(userFields.omit({ username: true }).partial(), req);
  if (data.password) { data.passwordHash = await hashPassword(data.password); delete data.password; }
  const user = updateData('users', users => {
    const target = findItem(users, req.params.id); checkUserScope(actor, target);
    if (actor.role === 'Leader') { data.role = 'User'; data.unit = actor.unit; data.department = actor.department; }
    if (target.role === 'Admin' && target.status === 'active' && (data.role && data.role !== 'Admin' || data.status === 'inactive') && users.filter(u => u.role === 'Admin' && u.status === 'active').length <= 1) throw httpError(400, 'C?n gi? ?t nh?t m?t qu?n tr? vi?n ?ang ho?t ??ng');
    Object.assign(target, data, { updatedAt: stamp() }); return target;
  });
  if (data.passwordHash || data.status || data.role) revokeSessions(user.id);
  audit(actor, 'users.update', user.id); res.json(profile(user));
}));
app.delete('/api/users/:id', route((req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader');
  updateData('users', users => {
    const target = findItem(users, req.params.id); checkUserScope(actor, target);
    if (target.id === actor.id || target.role === 'Admin') throw httpError(400, 'Kh?ng th? x?a t?i kho?n qu?n tr? vi?n');
    users.splice(users.indexOf(target), 1);
  });
  revokeSessions(req.params.id); audit(actor, 'users.delete', req.params.id); res.json({ success: true });
}));

for (const name of ['branches', 'news', 'pillars', 'esg', 'sliders']) {
  app.get(`/api/${name}`, route((req, res) => {
    let items = readData(name);
    if (req.query.all) requireRole(req, 'Admin');
    else if (name === 'news') items = items.filter(x => x.status === 'published');
    else if (name === 'sliders') items = items.filter(x => x.active !== false);
    if (name === 'sliders') items.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(items);
  }));
  app.post(`/api/${name}`, route((req, res) => {
    const actor = requireRole(req, 'Admin'); const data = input(schemas[name], req);
    const item = { ...data, id: randomUUID(), createdAt: stamp() };
    if (name === 'news') { item.date ||= new Date().toLocaleDateString('vi-VN'); item.readTime ||= '3 ph?t ??c'; }
    updateData(name, items => { items.push(item); }); audit(actor, `${name}.create`, item.id); res.status(201).json(item);
  }));
  app.put(`/api/${name}/:id`, route((req, res) => {
    const actor = requireRole(req, 'Admin'); const data = input(schemas[name].partial(), req);
    const item = updateData(name, items => { const target = findItem(items, req.params.id); Object.assign(target, data, { updatedAt: stamp() }); return target; });
    audit(actor, `${name}.update`, item.id); res.json(item);
  }));
  app.delete(`/api/${name}/:id`, route((req, res) => {
    const actor = requireRole(req, 'Admin');
    updateData(name, items => { const item = findItem(items, req.params.id); items.splice(items.indexOf(item), 1); });
    audit(actor, `${name}.delete`, req.params.id); res.json({ success: true });
  }));
}
app.post('/api/sliders/reorder', route((req, res) => {
  const actor = requireRole(req, 'Admin');
  const { ids } = input(z.object({ ids: z.array(required).max(1000) }), req);
  const items = updateData('sliders', slides => {
    if (ids.length !== slides.length || new Set(ids).size !== ids.length || ids.some(id => !slides.some(s => s.id === id))) throw httpError(409, 'Danh s?ch slider ?? thay ??i. Vui l?ng t?i l?i.');
    slides.forEach(s => { s.order = ids.indexOf(s.id) + 1; }); return slides;
  });
  audit(actor, 'sliders.reorder'); res.json(items);
}));
app.get('/api/news/:id', route((req, res) => {
  const item = findItem(readData('news'), req.params.id);
  if (item.status !== 'published') throw httpError(404, 'Kh?ng t?m th?y b?i vi?t');
  res.json(item);
}));
app.get('/api/settings', route((_req, res) => res.json(readData('settings'))));
app.put('/api/settings', route((req, res) => {
  const actor = requireRole(req, 'Admin'); const data = input(schemas.settings.partial(), req);
  const settings = updateData('settings', s => Object.assign(s, data)); audit(actor, 'settings.update'); res.json(settings);
}));
app.post('/api/contacts', route((req, res) => {
  const item = { ...input(contact, req), id: randomUUID(), status: 'pending', createdAt: stamp() };
  updateData('contacts', items => { items.unshift(item); }); res.status(201).json({ success: true });
}));
app.get('/api/contacts', route((req, res) => { requireRole(req, 'Admin'); res.json(readData('contacts')); }));
app.put('/api/contacts/:id', route((req, res) => {
  const actor = requireRole(req, 'Admin');
  const data = input(z.object({ status: z.enum(['pending', 'processing', 'resolved', 'completed', 'contacted']) }), req);
  const item = updateData('contacts', items => Object.assign(findItem(items, req.params.id), data));
  audit(actor, 'contacts.update', req.params.id); res.json(item);
}));
app.delete('/api/contacts/:id', route((req, res) => {
  const actor = requireRole(req, 'Admin');
  updateData('contacts', items => { const item = findItem(items, req.params.id); items.splice(items.indexOf(item), 1); });
  audit(actor, 'contacts.delete', req.params.id); res.json({ success: true });
}));
app.get('/api/stats', route((req, res) => {
  requireRole(req, 'Admin'); const settings = readData('settings'); const contacts = readData('contacts');
  res.json({ totalPillars: readData('pillars').length, totalBranches: readData('branches').length, totalNews: readData('news').filter(n => n.status === 'published').length, totalContacts: contacts.length, pendingContacts: contacts.filter(c => c.status === 'pending').length, totalUsers: readData('users').length, totalEngineers: settings.totalEngineers ?? 0, totalCustomers: settings.totalCustomers ?? 0, satisfactionRate: settings.satisfactionRate ?? '' });
}));

const announcementSchema = z.object({ title: required, content: z.string().trim().min(1).max(50000), category: short, priority: z.enum(['normal', 'high', 'urgent', 'important']).default('normal'), targetUnit: short.optional(), targetDepartment: short.optional(), pinned: z.boolean().default(false) });
app.get('/api/announcements', route((req, res) => {
  const user = requireUser(req); res.json(readData('announcements').filter(x => inScope(x, user)));
}));
app.post('/api/announcements', route((req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader'); const data = input(announcementSchema, req);
  if (actor.role === 'Leader') { data.targetUnit = actor.unit; data.targetDepartment = actor.department; }
  const item = { ...data, id: randomUUID(), author: actor.fullName, authorId: actor.id, createdAt: stamp() };
  updateData('announcements', items => { items.unshift(item); }); audit(actor, 'announcements.create', item.id); res.status(201).json(item);
}));
for (const name of ['announcements', 'shared-files']) {
  app.delete(`/api/${name}/:id`, route(async (req, res) => {
    const actor = requireRole(req, 'Admin', 'Leader');
    const item = updateData(name, items => {
      const target = findItem(items, req.params.id);
      if (!canManage(target, actor)) throw httpError(403, 'B?n kh?ng c? quy?n x?a n?i dung n?y');
      items.splice(items.indexOf(target), 1); return target;
    });
    if (name === 'shared-files' && item.storageName) await fs.unlink(path.join(uploads, 'documents', path.basename(item.storageName))).catch(error => { if (error.code !== 'ENOENT') console.error('Document cleanup failed', error.code); });
    audit(actor, `${name}.delete`, item.id); res.json({ success: true });
  }));
}
const fileSchema = z.object({ name: required, data: z.string().min(1).max(14 * 1024 * 1024) });
function decodeFile(data) {
  const encoded = data.replace(/^data:[^,]+;base64,/, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) throw httpError(400, 'D? li?u file kh?ng h?p l?');
  const buffer = Buffer.from(encoded, 'base64');
  if (!buffer.length || buffer.length > 10 * 1024 * 1024) throw httpError(400, 'Dung l??ng file ph?i t? 1 byte ??n 10 MB');
  return buffer;
}
app.post('/api/upload', route(async (req, res) => {
  const actor = requireRole(req, 'Admin'); const { data } = input(fileSchema, req); const buffer = decodeFile(data);
  let output;
  try {
    const processor = sharp(buffer, { limitInputPixels: 40000000 });
    const meta = await processor.metadata();
    if (!['jpeg', 'png', 'webp', 'gif', 'avif'].includes(meta.format)) throw new Error();
    output = await processor.rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch { throw httpError(400, 'Ch? ch?p nh?n ?nh PNG, JPEG, WebP, GIF ho?c AVIF h?p l?'); }
  const name = `${randomUUID()}.webp`; await fs.writeFile(path.join(uploads, 'images', name), output, { flag: 'wx' });
  audit(actor, 'image.upload', name); res.status(201).json({ url: `/uploads/images/${name}`, name });
}));
const publicFile = item => { const { storageName: _storage, ...safe } = item; return { ...safe, available: Boolean(item.storageName) }; };
app.get('/api/shared-files', route((req, res) => {
  const user = requireUser(req); res.json(readData('shared-files').filter(x => inScope(x, user)).map(publicFile));
}));
app.post('/api/shared-files', route(async (req, res) => {
  const actor = requireRole(req, 'Admin', 'Leader');
  const data = input(fileSchema.extend({ description: text.optional(), category: short, targetDepartment: short.optional(), targetUnit: short.optional() }), req);
  const buffer = decodeFile(data.data); const ext = path.extname(data.name).toLowerCase();
  const isPdf = ext === '.pdf' && buffer.subarray(0, 5).toString() === '%PDF-';
  const isZip = ['.docx', '.xlsx', '.zip'].includes(ext) && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 3 && buffer[3] === 4;
  if (!isPdf && !isZip) throw httpError(400, 'Ch? ch?p nh?n PDF, DOCX, XLSX ho?c ZIP h?p l?');
  const storageName = `${randomUUID()}${ext}`; const location = path.join(uploads, 'documents', storageName);
  const item = { id: randomUUID(), name: path.basename(data.name), description: data.description || '', category: data.category, fileSize: `${(buffer.length / 1024).toFixed(1)} KB`, fileType: ext.slice(1).toUpperCase(), targetUnit: actor.role === 'Leader' ? actor.unit : data.targetUnit || 'all', targetDepartment: actor.role === 'Leader' ? actor.department : data.targetDepartment || 'all', uploadedBy: actor.fullName, authorId: actor.id, storageName, downloads: 0, createdAt: stamp() };
  await fs.writeFile(location, buffer, { flag: 'wx' });
  try { updateData('shared-files', items => { items.unshift(item); }); } catch (error) { await fs.unlink(location); throw error; }
  audit(actor, 'document.upload', item.id); res.status(201).json(publicFile(item));
}));
app.get('/api/shared-files/:id/download', route(async (req, res) => {
  const user = requireUser(req); const item = findItem(readData('shared-files'), req.params.id);
  if (!inScope(item, user)) throw httpError(403, 'B?n kh?ng c? quy?n t?i t?i li?u n?y');
  if (!item.storageName) throw httpError(404, 'T?i li?u c? ch?a c? file ??nh k?m');
  const file = path.join(uploads, 'documents', path.basename(item.storageName));
  try { await fs.access(file); } catch { throw httpError(404, 'Kh?ng t?m th?y file ??nh k?m'); }
  updateData('shared-files', items => { findItem(items, item.id).downloads = (item.downloads || 0) + 1; });
  res.download(file, item.name);
}));
app.use('/api', (_req, res) => res.status(404).json({ error: 'API kh?ng t?n t?i' }));
app.use('/uploads', (req, res, next) => {
  if (req.path.includes('documents') || !/\.(png|jpe?g|webp|gif|ico|avif)$/i.test(req.path)) return res.sendStatus(404);
  res.set('Content-Security-Policy', "default-src 'none'; sandbox"); next();
}, express.static(uploads, { maxAge: '7d', fallthrough: false }));
app.get('/robots.txt', (_req, res) => res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /login\nDisallow: /register\n'));
app.get('/sitemap.xml', (_req, res) => {
  const base = (process.env.PUBLIC_URL || 'http://localhost:3001').replace(/\/$/, '').replace(/[<>&"']/g, '');
  const urls = ['/', '/about', '/mang-luoi', '/phat-trien-ben-vung', '/tin-tuc', '/lien-he', ...readData('news').filter(n => n.status === 'published').map(n => `/tin-tuc/${encodeURIComponent(n.id)}`)];
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${base}${url}</loc></url>`).join('')}</urlset>`);
});
const distPath = path.join(here, '..', 'dist');
app.use(express.static(distPath, { maxAge: '1y', immutable: true, setHeaders: (res, file) => { if (file.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache'); } }));
app.get('*', (req, res, next) => {
  if (path.extname(req.path)) return res.sendStatus(404);
  res.set('Cache-Control', 'no-cache');
  if (/^\/(admin|login|register)(\/|$)/.test(req.path)) res.set('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(distPath, 'index.html'), error => { if (error) next(error); });
});
app.use((error, _req, res, _next) => {
  if (res.headersSent) return _next(error);
  if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
  const status = error.status || (error instanceof SyntaxError ? 400 : 500);
  if (status >= 500) console.error('Request failed:', error.message);
  res.status(status).json({ error: status >= 500 ? 'Kh?ng th? l?u ho?c t?i d? li?u. Vui l?ng th? l?i.' : status === 413 ? 'File qu? l?n' : error.message });
});
const server = app.listen(process.env.PORT || 80, '0.0.0.0', () => console.log(`Kim Son server ready on port ${server.address().port}`));
process.on('SIGTERM', () => server.close(() => { database.close(); process.exit(0); }));
