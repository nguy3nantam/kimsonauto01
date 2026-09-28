import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

test('backup includes WAL commits and documents and fails on missing input', t => {
  const temp = fs.mkdtempSync(path.join(tmpdir(), 'kimson-backup-'));
  const data = path.join(temp, 'data');
  const uploads = path.join(temp, 'uploads');
  const backups = path.join(temp, 'backups');
  fs.mkdirSync(data); fs.mkdirSync(uploads);
  const source = new DatabaseSync(path.join(data, 'kimsonauto.sqlite'));
  t.after(() => { source.close(); fs.rmSync(temp, { recursive: true, force: true }); });
  source.exec("PRAGMA journal_mode=WAL; CREATE TABLE sample(value TEXT); INSERT INTO sample VALUES('committed in WAL');");
  fs.writeFileSync(path.join(uploads, 'document.pdf'), '%PDF-test');
  const run = overrides => spawnSync(process.execPath, ['server/backup.js'], { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8', env: { ...process.env, DATA_DIR: data, UPLOADS_DIR: uploads, BACKUP_DIR: backups, ...overrides } });
  const result = run({});
  assert.equal(result.status, 0, result.stderr);
  const destination = path.join(backups, fs.readdirSync(backups)[0]);
  const restored = new DatabaseSync(path.join(destination, 'data', 'kimsonauto.sqlite'), { readOnly: true });
  try { assert.equal(restored.prepare('SELECT value FROM sample').get().value, 'committed in WAL'); }
  finally { restored.close(); }
  assert.equal(fs.readFileSync(path.join(destination, 'uploads', 'document.pdf'), 'utf8'), '%PDF-test');
  assert.equal(JSON.parse(fs.readFileSync(path.join(destination, 'manifest.json'), 'utf8')).format, 1);
  assert.equal(run({ DATA_DIR: path.join(temp, 'missing') }).status, 1);
  assert.equal(run({ UPLOADS_DIR: path.join(temp, 'missing') }).status, 1);
  assert.equal(run({ BACKUP_DIR: path.join(uploads, 'nested') }).status, 1);
  assert.equal(fs.readdirSync(backups).length, 1);
});
