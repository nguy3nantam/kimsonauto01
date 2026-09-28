import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const data = mkdtempSync(path.join(tmpdir(), 'kimson-security-'));
process.env.DATA_DIR = data;
const security = await import('../server/security.js');
const { database, readData, updateData } = await import('../server/db.js');

test('passwords, scopes and transactional storage', async t => {
  t.after(() => { database.close(); rmSync(data, { recursive: true, force: true }); });
  await t.test('password hash verifies only the correct password', async () => {
    const hash = await security.hashPassword('a-test-password-123');
    assert.equal(await security.verifyPassword('a-test-password-123', hash), true);
    assert.equal(await security.verifyPassword('incorrect', hash), false);
    assert.equal(await security.verifyPassword('anything', 'plaintext'), false);
  });
  await t.test('Vietnamese roles and audience labels are recognized', () => {
    assert.equal(security.normalizeRole('Quản trị viên'), 'Admin');
    assert.equal(security.normalizeRole('Trưởng bộ phận'), 'Leader');
    const user = { id: 'member', role: 'User', unit: 'A', department: 'Sales' };
    assert.equal(security.inScope({ targetUnit: 'Tất cả đơn vị', targetDepartment: 'Tất cả bộ phận' }, user), true);
    assert.equal(security.inScope({ targetUnit: 'B', targetDepartment: 'Sales' }, user), false);
    assert.equal(security.inScope({ targetUnit: 'A', targetDepartment: 'HR' }, user), false);
  });
  await t.test('failed updates roll back instead of losing existing data', () => {
    const before = readData('contacts');
    assert.throws(() => updateData('contacts', items => { items.push({ id: 'uncommitted' }); throw new Error('failure'); }), /failure/);
    assert.deepEqual(readData('contacts'), before);
    database.exec('PRAGMA query_only=ON');
    try {
      assert.throws(() => updateData('contacts', items => items.push({ id: 'read-only' })));
      assert.deepEqual(readData('contacts'), before);
    } finally { database.exec('PRAGMA query_only=OFF'); }
  });
});
