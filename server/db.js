import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const dataDir = process.env.DATA_DIR || path.join(here, 'data');
const bundledSeedDir = path.join(here, 'seeds');
const seedDir = process.env.SEED_DIR || (fs.existsSync(bundledSeedDir) ? bundledSeedDir : path.join(here, 'data'));
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
export const database = new DatabaseSync(path.join(dataDir, 'kimsonauto.sqlite'));
database.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS collections (name TEXT PRIMARY KEY, value TEXT NOT NULL CHECK(json_valid(value)));
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT, action TEXT NOT NULL, target TEXT);
`);
const names = ['users', 'contacts', 'branches', 'news', 'pillars', 'esg', 'settings', 'sliders', 'announcements', 'shared-files'];
const read = database.prepare('SELECT value FROM collections WHERE name = ?');
const write = database.prepare('INSERT INTO collections(name,value) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value');
// Import all collections in one transaction. Invalid source data aborts startup.
database.exec('BEGIN IMMEDIATE');
try {
  for (const name of names) {
    if (read.get(name)) continue;
    const file = path.join(dataDir, `${name}.json`);
    const seed = path.join(seedDir, `${name}.json`);
    const value = JSON.parse(fs.readFileSync(fs.existsSync(file) ? file : seed, 'utf8'));
    if (name === 'settings' ? !value || Array.isArray(value) || typeof value !== 'object' : !Array.isArray(value)) {
      throw new Error(`Invalid collection: ${name}`);
    }
    if (name === 'users') for (const user of value) {
      if (!user.passwordHash) {
        const salt = randomBytes(16).toString('hex');
        user.passwordHash = `scrypt$${salt}$${scryptSync(user.password || randomBytes(32).toString('hex'), salt, 64).toString('hex')}`;
      }
      delete user.password;
    }
    write.run(name, JSON.stringify(value));
  }
  database.exec('COMMIT');
} catch (error) { database.exec('ROLLBACK'); throw error; }

export function readData(name) {
  const row = read.get(name);
  if (!row) throw new Error(`Missing collection: ${name}`);
  return JSON.parse(row.value);
}
// Updaters are synchronous: the read, validation and write are one SQLite transaction.
export function updateData(name, updater) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const data = readData(name);
    const result = updater(data);
    if (result && typeof result.then === 'function') throw new Error('Async database updater is not supported');
    write.run(name, JSON.stringify(data));
    database.exec('COMMIT');
    return result;
  } catch (error) { database.exec('ROLLBACK'); throw error; }
}
export function audit(actor, action, target) {
  database.prepare('INSERT INTO audit(at,actor,action,target) VALUES(?,?,?,?)')
    .run(new Date().toISOString(), actor?.id || null, action, String(target || ''));
}
