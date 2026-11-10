// Test setup: every test file runs in its own process with its own temp database.
import fs from 'fs';
import os from 'os';
import path from 'path';
import supertest from 'supertest';

export const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nawigator-test-'));
process.env.DB_PATH = path.join(tmpDir, 'db.sqlite3');
process.env.BACKUP_DIR = path.join(tmpDir, 'backups');

const {migrate} = await import('../db/schema.js');
const {getDb, closeDb} = await import('../db/index.js');
const {createApp} = await import('../app.js');

export const FIXTURE_SQL = path.join(import.meta.dirname, 'fixtures', 'old-schema.sql');
export const REAL_DUMP = path.join(import.meta.dirname, '..', '..', 'database_export_2025-04-16.db');

export async function setup() {
    await migrate();
    return {api: supertest(createApp()), db: await getDb()};
}

export async function teardown() {
    await closeDb();
    fs.rmSync(tmpDir, {recursive: true, force: true});
}

/** Build a SQLite file from an SQL script (used for "old database" fixtures). */
export async function sqliteFromSql(sql, file) {
    const sqlite3 = (await import('sqlite3')).default;
    const {open} = await import('sqlite');
    const db = await open({filename: file, driver: sqlite3.Database});
    await db.exec(sql);
    await db.close();
    return file;
}

/** DD-MM-YYYY for today + offset days. */
export function euDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

/** YYYY-MM-DD (what HTML date inputs send) for today + offset days. */
export function isoDate(offsetDays = 0) {
    const [d, m, y] = euDate(offsetDays).split('-');
    return `${y}-${m}-${d}`;
}

export async function addMedicine(api, overrides = {}) {
    const res = await api.post('/api/leki-all').send({
        lek_nazwa: `Lek ${Math.random().toString(36).slice(2, 8)}`,
        lek_ilosc: 10,
        lek_opakowanie: 'tabl.',
        lek_data: isoDate(365),
        lek_ilosc_minimalna: 2,
        ...overrides,
    });
    if (res.status !== 201) throw new Error(`addMedicine failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body.id;
}

export async function addEquipment(api, overrides = {}) {
    const res = await api.post('/api/sprzet-all').send({
        eq_nazwa: `Sprzęt ${Math.random().toString(36).slice(2, 8)}`,
        eq_ilosc_wymagana: 1,
        eq_ilosc_aktualna: 2,
        eq_data: isoDate(365),
        eq_na_statku: 'true',
        ...overrides,
    });
    if (res.status !== 201) throw new Error(`addEquipment failed: ${res.status} ${JSON.stringify(res.body)}`);
    return res.body.id;
}
