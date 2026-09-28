import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { database, readData, updateData, dataDir } from './db.js';

const derive = promisify(scrypt);
export const normalizeRole = role => {
  const value = String(role || '').trim().toLowerCase();
  if (['admin', 'super admin', 'quản trị viên', 'quan tri vien'].includes(value)) return 'Admin';
  if (['leader', 'trưởng bộ phận', 'truong bo phan', 'trưởng phòng', 'truong phong', 'quản lý'].includes(value)) return 'Leader';
  return 'User';
};
export const norm = value => String(value || '').trim().toLowerCase();
export function httpError(status, message) { return Object.assign(new Error(message), { status }); }
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, salt, digest] = stored.split('$');
  if (!salt || !/^[a-f0-9]{128}$/.test(digest || '')) return false;
  return timingSafeEqual(await derive(password, salt, 64), Buffer.from(digest, 'hex'));
}
export function profile(user) {
  const { password: _password, passwordHash: _hash, ...safe } = user;
  return { ...safe, role: normalizeRole(user.role), fullName: user.fullName || user.name || user.username };
}
export async function initializeUsers() {
  const users = readData('users');
  for (const user of users) {
    user.role = normalizeRole(user.role);
    user.status ||= 'active';
    if (!user.passwordHash) user.passwordHash = await hashPassword(user.password || randomBytes(32).toString('hex'));
    delete user.password;
  }
  if (!users.length) {
    const password = process.env.ADMIN_PASSWORD || randomBytes(24).toString('base64url');
    if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
    users.push({ id: '1', username: process.env.ADMIN_USERNAME || 'admin', fullName: 'Qu?n tr? vi?n', role: 'Admin', status: 'active', passwordHash: await hashPassword(password), createdAt: new Date().toISOString() });
    if (!process.env.ADMIN_PASSWORD) fs.writeFileSync(path.join(dataDir, 'bootstrap-credentials.txt'), `Username: ${users[0].username}\nPassword: ${password}\n`, { mode: 0o600 });
  }
  updateData('users', data => { data.splice(0, data.length, ...users); });
  // Remove plaintext from the imported legacy file as well. SQLite is authoritative after import.
  const legacy = path.join(dataDir, 'users.json');
  if (fs.existsSync(legacy)) fs.writeFileSync(legacy, JSON.stringify(users, null, 2), { mode: 0o600 });
}
const sessionKey = token => createHash('sha256').update(token).digest('hex');
const cookieName = 'kimson_session';
const maxAge = 8 * 60 * 60 * 1000;
function cookieOptions(req) {
  return { httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true' || req.secure, path: '/' };
}
function getToken(req) {
  return (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
}
export function createSession(req, res, user) {
  const token = randomBytes(32).toString('base64url');
  database.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  database.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').run(sessionKey(token), user.id, Date.now() + maxAge);
  res.cookie(cookieName, token, { ...cookieOptions(req), maxAge });
}
export function revokeSessions(id) { database.prepare('DELETE FROM sessions WHERE user_id = ?').run(id); }
export function logout(req, res) {
  const token = getToken(req);
  if (token) database.prepare('DELETE FROM sessions WHERE token = ?').run(sessionKey(token));
  res.clearCookie(cookieName, cookieOptions(req));
}
export function currentUser(req) {
  const token = getToken(req);
  if (!token || token.length > 100) return null;
  const session = database.prepare('SELECT user_id FROM sessions WHERE token = ? AND expires > ?').get(sessionKey(token), Date.now());
  if (!session) return null;
  const user = readData('users').find(u => u.id === session.user_id);
  return user?.status === 'active' ? profile(user) : null;
}
export function requireUser(req) {
  if (!req.user) throw httpError(401, 'Vui l?ng ??ng nh?p ?? ti?p t?c');
  return req.user;
}
export function requireRole(req, ...roles) {
  const user = requireUser(req);
  if (!roles.includes(user.role)) throw httpError(403, 'B?n kh?ng c? quy?n th?c hi?n thao t?c n?y');
  return user;
}
const isAll = value => !value || ['all', 'tất cả', 'tất cả đơn vị', 'tất cả bộ phận'].includes(norm(value));
export function inScope(item, user) {
  return user.role === 'Admin' || ((isAll(item.targetUnit) || norm(item.targetUnit) === norm(user.unit)) && (isAll(item.targetDepartment) || norm(item.targetDepartment) === norm(user.department)));
}
export function canManage(item, user) {
  return user.role === 'Admin' || (user.role === 'Leader' && inScope(item, user) && (item.authorId === user.id || (!item.authorId && (item.author === user.fullName || item.uploadedBy === user.fullName))));
}
export const route = handler => (req, res, next) => Promise.resolve().then(() => handler(req, res)).catch(next);
