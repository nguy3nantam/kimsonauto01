import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(process.env.DATA_DIR || path.join(here, 'data'));
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(here, 'uploads'));
const backupRoot = path.resolve(process.env.BACKUP_DIR || path.join(here, '..', 'backups'));
let destination;
let database;
try {
  // Do not import db.js: a backup must never initialize or migrate source data.
  database = new DatabaseSync(path.join(dataDir, 'kimsonauto.sqlite'), { readOnly: true });
  const uploadsSource = fs.realpathSync(uploadsDir);
  fs.mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
  const backupLocation = fs.realpathSync(backupRoot);
  const relative = path.relative(uploadsSource, backupLocation);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('BACKUP_DIR must be outside UPLOADS_DIR');
  }
  destination = fs.mkdtempSync(path.join(backupLocation, 'kimsonauto-'));
  fs.mkdirSync(path.join(destination, 'data'), { mode: 0o700 });
  const snapshot = path.join(destination, 'data', 'kimsonauto.sqlite');
  // VACUUM INTO includes committed WAL data; copying only the .sqlite file would not.
  database.prepare('VACUUM INTO ?').run(snapshot);
  fs.chmodSync(snapshot, 0o600);
  fs.cpSync(uploadsSource, path.join(destination, 'uploads'), { recursive: true, errorOnExist: true, force: false });
  const check = new DatabaseSync(snapshot, { readOnly: true });
  try {
    const rows = check.prepare('PRAGMA integrity_check').all();
    if (rows.length !== 1 || Object.values(rows[0])[0] !== 'ok') throw new Error('Backup integrity check failed');
  } finally { check.close(); }
  fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify({ format: 1, createdAt: new Date().toISOString(), database: 'data/kimsonauto.sqlite', uploads: 'uploads', note: 'Stop application writes during backup for consistency between documents and database.' }, null, 2), { mode: 0o600 });
  console.log(`Backup created: ${destination}`);
} catch (error) {
  if (destination) fs.rmSync(destination, { recursive: true, force: true });
  console.error(`Backup failed: ${error.message}`);
  process.exitCode = 1;
} finally { database?.close(); }
