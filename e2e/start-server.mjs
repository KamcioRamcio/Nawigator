// Starts the production server for e2e tests on a fresh database built from the old-schema fixture,
// so every run also exercises the startup migration of an old database.
import fs from 'fs';
import path from 'path';
import {createRequire} from 'module';

const root = path.resolve(import.meta.dirname, '..');
const tmp = path.join(root, 'e2e', '.tmp');
fs.rmSync(tmp, {recursive: true, force: true});
fs.mkdirSync(tmp, {recursive: true});

const require = createRequire(path.join(root, 'backend', 'package.json'));
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.join(tmp, 'db.sqlite3'));
await new Promise((resolve, reject) =>
    db.exec(fs.readFileSync(path.join(root, 'backend/test/fixtures/old-schema.sql'), 'utf8'), e => (e ? reject(e) : resolve())));
await new Promise(resolve => db.close(resolve));

Object.assign(process.env, {
    DB_PATH: path.join(tmp, 'db.sqlite3'),
    BACKUP_DIR: path.join(tmp, 'backups'),
    STATIC_DIR: path.join(root, 'dist'),
    PORT: process.env.PORT || '8899',
});
process.chdir(path.join(root, 'backend'));
await import('../backend/server.js');
