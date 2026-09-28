import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = fileURLToPath(new URL('../', import.meta.url));
test('API regression checks with isolated data and uploads', { timeout: 30000 }, async t => {
  const temp = await mkdtemp(path.join(tmpdir(), 'kimson-api-'));
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: root, env: { ...process.env, DATA_DIR: path.join(temp, 'data'), UPLOADS_DIR: path.join(temp, 'uploads'), PORT: '0', ADMIN_USERNAME: 'testadmin', ADMIN_PASSWORD: 'test-admin-password-123' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited;
    }
    await rm(temp, { recursive: true, force: true });
  });
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Server startup timed out: ${output}`)), 10000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited ${code}: ${output}`)); });
    let stdout = '';
    child.stdout.on('data', chunk => {
      stdout += chunk;
      const match = stdout.match(/ready on port (\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  const request = (url, { cookie, body, method = 'GET', headers = {} } = {}) => fetch(`http://127.0.0.1:${port}${url}`, {
    method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let admin;
  await t.test('private endpoints reject anonymous requests', async () => {
    for (const url of ['/api/users', '/api/contacts', '/api/announcements', '/api/shared-files', '/api/auth/me', '/api/news?all=true']) {
      assert.equal((await request(url)).status, 401, url);
    }
    assert.equal((await request('/api/users', { method: 'POST', body: { role: 'Admin' } })).status, 401);
  });
  await t.test('invalid inputs return 400 and leave the server available', async () => {
    assert.equal((await request('/api/auth/register', { method: 'POST', body: { fullName: 42 } })).status, 400);
    assert.equal((await request('/api/contacts', { method: 'POST', body: {} })).status, 400);
    assert.equal((await request('/api/health')).status, 200);
    const missing = await request('/api/does-not-exist');
    assert.equal(missing.status, 404); assert.match(missing.headers.get('content-type'), /json/);
  });
  await t.test('public reads use short browser caching while private responses do not', async () => {
    for (const url of ['/api/settings', '/api/branches', '/api/pillars', '/api/esg', '/api/news', '/api/sliders']) {
      assert.match((await request(url)).headers.get('cache-control'), /^public, max-age=60/, url);
    }
    assert.equal((await request('/api/health')).headers.get('cache-control'), 'no-store');
    assert.equal((await request('/api/users')).headers.get('cache-control'), 'no-store');
    assert.equal((await request('/api/news?all=true')).headers.get('cache-control'), 'no-store');
  });
  await t.test('login creates an HttpOnly cookie and never returns password fields', async () => {
    const response = await request('/api/auth/login', { method: 'POST', body: { username: 'testadmin', password: 'test-admin-password-123' } });
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/);
    admin = cookie.split(';')[0];
    const { user } = await response.json();
    assert.equal(user.role, 'Admin'); assert.equal(user.passwordHash, undefined); assert.equal(user.password, undefined);
  });
  await t.test('public registration cannot grant administrator privileges', async () => {
    const response = await request('/api/auth/register', { method: 'POST', body: { username: 'member', fullName: 'Member', password: 'test-member-password', unit: 'A', department: 'Sales', role: 'Admin' } });
    assert.equal(response.status, 201);
    assert.equal((await response.json()).user.role, 'User');
    const cookie = response.headers.get('set-cookie').split(';')[0];
    assert.equal((await request('/api/users?requesterRole=Admin', { cookie })).status, 403);
    assert.equal((await request('/api/news', { cookie, method: 'POST', body: {} })).status, 403);
  });
  await t.test('drafts are private and upload rejects active HTML', async () => {
    const draft = await request('/api/news', { cookie: admin, method: 'POST', body: { title: 'Private draft', category: 'Test', summary: 'Summary', content: 'Private content', image: '', status: 'draft' } });
    assert.equal(draft.status, 201);
    const { id } = await draft.json();
    assert.equal((await (await request('/api/news')).json()).some(item => item.id === id), false);
    assert.equal((await request(`/api/news/${id}`)).status, 404);
    assert.equal((await (await request('/api/news?all=true', { cookie: admin })).json()).some(item => item.id === id), true);
    assert.equal((await request('/api/upload', { cookie: admin, method: 'POST', body: { name: 'test.html', data: Buffer.from('<html>test</html>').toString('base64') } })).status, 400);
  });
  await t.test('storage failures return 500 and concurrent writes persist', async () => {
    const db = new DatabaseSync(path.join(temp, 'data', 'kimsonauto.sqlite'));
    try {
      db.exec("CREATE TRIGGER fail_contacts BEFORE UPDATE ON collections WHEN NEW.name='contacts' BEGIN SELECT RAISE(ABORT, 'test write failure'); END");
      assert.equal((await request('/api/contacts', { method: 'POST', body: { name: 'Test', phone: '0901234567' } })).status, 500);
      db.exec('DROP TRIGGER fail_contacts');
      const responses = await Promise.all(Array.from({ length: 5 }, (_, i) => request('/api/contacts', { method: 'POST', body: { name: `Concurrent ${i}`, phone: '0901234567' } })));
      responses.forEach(response => assert.equal(response.status, 201));
      const contacts = await (await request('/api/contacts', { cookie: admin })).json();
      assert.equal(contacts.filter(item => item.name.startsWith('Concurrent ')).length, 5);
      assert.equal(contacts.some(item => item.name === 'Test'), false);
    } finally { db.close(); }
  });
  await t.test('document downloads require authentication and matching unit and department', async () => {
    const registerMember = async (username, unit, department) => {
      const response = await request('/api/auth/register', {
        method: 'POST', body: { username, fullName: username, password: 'test-document-password', unit, department },
      });
      assert.equal(response.status, 201);
      assert.equal((await response.json()).user.role, 'User');
      return response.headers.get('set-cookie').split(';')[0];
    };
    const member = await registerMember('document-member', 'Biên Hòa', 'Dịch vụ');
    const wrongUnit = await registerMember('document-other-unit', 'Long Thành', 'Dịch vụ');
    const wrongDepartment = await registerMember('document-other-dept', 'Biên Hòa', 'Kinh doanh');
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
    const response = await request('/api/shared-files', {
      cookie: admin, method: 'POST', body: {
        name: 'service-guide.pdf', data: pdf.toString('base64'), description: 'Tài liệu nội bộ',
        category: 'Quy trình', targetUnit: 'Biên Hòa', targetDepartment: 'Dịch vụ',
      },
    });
    assert.equal(response.status, 201);
    const uploaded = await response.json();
    assert.equal(uploaded.available, true);
    assert.equal(uploaded.storageName, undefined);
    assert.equal(uploaded.targetUnit, 'Biên Hòa');
    assert.equal(uploaded.targetDepartment, 'Dịch vụ');
    const downloadUrl = `/api/shared-files/${uploaded.id}/download`;

    const visible = await request('/api/shared-files', { cookie: member });
    assert.equal(visible.status, 200);
    const listed = (await visible.json()).find(item => item.id === uploaded.id);
    assert.equal(listed.name, 'service-guide.pdf');
    assert.equal(listed.available, true);
    assert.equal(listed.storageName, undefined);
    const download = await request(downloadUrl, { cookie: member });
    assert.equal(download.status, 200);
    assert.match(download.headers.get('content-type'), /^application\/pdf/);
    assert.match(download.headers.get('content-disposition'), /^attachment;.*filename="service-guide\.pdf"/);
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf);

    for (const cookie of [wrongUnit, wrongDepartment]) {
      const denied = await request(downloadUrl, { cookie });
      assert.equal(denied.status, 403);
      assert.equal(denied.headers.get('content-disposition'), null);
      const list = await request('/api/shared-files', { cookie });
      assert.equal(list.status, 200);
      assert.equal((await list.json()).some(item => item.id === uploaded.id), false);
    }
    assert.equal((await request(downloadUrl)).status, 401);
    assert.equal((await request('/api/shared-files')).status, 401);

    const db = new DatabaseSync(path.join(temp, 'data', 'kimsonauto.sqlite'));
    let storedFile;
    try {
      const files = JSON.parse(db.prepare('SELECT value FROM collections WHERE name = ?').get('shared-files').value);
      storedFile = files.find(item => item.id === uploaded.id);
      assert.equal(storedFile.downloads, 1, 'Denied downloads must not change the download count');
      files.push({ id: 'legacy-document', name: 'legacy-guide.pdf', targetUnit: 'Biên Hòa', targetDepartment: 'Dịch vụ', downloads: 0 });
      db.prepare('UPDATE collections SET value = ? WHERE name = ?').run(JSON.stringify(files), 'shared-files');
    } finally { db.close(); }
    assert.equal((await request(`/uploads/documents/${storedFile.storageName}`)).status, 404);
    const withLegacy = await (await request('/api/shared-files', { cookie: member })).json();
    assert.equal(withLegacy.find(item => item.id === 'legacy-document').available, false);
    assert.equal((await request('/api/shared-files/legacy-document/download', { cookie: member })).status, 404);
    assert.equal((await request('/api/health')).status, 200);
  });
  await t.test('inactive accounts cannot log in and logout revokes the cookie', async () => {
    const created = await request('/api/users', { cookie: admin, method: 'POST', body: { username: 'inactive', password: 'test-inactive-password', fullName: 'Inactive', role: 'User', status: 'inactive', unit: 'A', department: 'Sales' } });
    assert.equal(created.status, 201);
    assert.equal((await request('/api/auth/login', { method: 'POST', body: { username: 'inactive', password: 'test-inactive-password' } })).status, 401);
    assert.equal((await request('/api/auth/logout', { cookie: admin, method: 'POST' })).status, 200);
    assert.equal((await request('/api/auth/me', { cookie: admin })).status, 401);
  });
});
