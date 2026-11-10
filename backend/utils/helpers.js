// backend/utils/helpers.js
// Backups, export and import of the SQLite database file.
import fs from 'fs/promises';
import path from 'path';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import {getDb, closeDb, getDbPath} from '../db/index.js';
import {migrate, refreshStatuses} from '../db/schema.js';

const SQLITE_HEADER = 'SQLite format 3\0';
const DAILY_BACKUPS_KEPT = 7;
const PRE_IMPORT_BACKUPS_KEPT = 5;

export function getBackupDir() {
    return path.resolve(process.env.BACKUP_DIR || './backups');
}

// Local time (the container gets TZ from the host), e.g. 20260110_000500.
const pad = (n) => String(n).padStart(2, '0');
const stamp = (d = new Date()) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

/** Consistent copy of the live database (VACUUM INTO never captures a half-written page). */
export async function snapshotDatabase(targetPath) {
    const db = await getDb();
    await fs.mkdir(path.dirname(targetPath), {recursive: true});
    const tmp = `${targetPath}.tmp`;
    await fs.rm(tmp, {force: true});
    await db.run('VACUUM INTO ?', [tmp]);
    await fs.rename(tmp, targetPath);
    return targetPath;
}

async function keepNewest(dir, prefix, count) {
    const files = (await fs.readdir(dir)).filter(f => f.startsWith(prefix) && f.endsWith('.sqlite3')).sort();
    for (const file of files.slice(0, Math.max(0, files.length - count))) {
        await fs.unlink(path.join(dir, file));
    }
}

/** Rolling copy refreshed after every change (debounced by backupMiddleware). */
export function createBackup() {
    return snapshotDatabase(path.join(getBackupDir(), 'db_backup.sqlite3'));
}

/** One file per day, last 7 kept. */
export async function createDailyBackup(now = new Date()) {
    const day = stamp(now).slice(0, 8);
    await snapshotDatabase(path.join(getBackupDir(), `db_backup_${day}.sqlite3`));
    await keepNewest(getBackupDir(), 'db_backup_2', DAILY_BACKUPS_KEPT);
}

/** Nightly job: statuses depend on today's date, then back up the result. */
export async function runNightlyJobs() {
    try {
        await refreshStatuses();
        await createDailyBackup();
    } catch (error) {
        console.error('Nightly job failed:', error);
    }
}

export async function exportDatabase() {
    return snapshotDatabase(path.join(getBackupDir(), 'tmp', `export_${stamp()}.sqlite3`));
}

/** Throws an Error with statusCode 400 if the file is not a usable Nawigator database. */
export async function validateDatabaseFile(filePath) {
    const invalid = (message) => Object.assign(new Error(message), {statusCode: 400});

    const handle = await fs.open(filePath, 'r');
    const header = Buffer.alloc(16);
    await handle.read(header, 0, 16, 0);
    await handle.close();
    if (header.toString('latin1') !== SQLITE_HEADER) throw invalid('Plik nie jest bazą danych SQLite');

    let db;
    try {
        db = await open({filename: filePath, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY});
        const {integrity_check} = await db.get('PRAGMA integrity_check');
        if (integrity_check !== 'ok') throw invalid('Plik bazy danych jest uszkodzony');
        const tables = new Set((await db.all(`SELECT name FROM sqlite_master WHERE type = 'table'`)).map(t => t.name));
        for (const required of ['Leki', 'Sprzet', 'users']) {
            if (!tables.has(required)) throw invalid(`To nie jest baza Nawigatora (brak tabeli ${required})`);
        }
    } catch (error) {
        if (error.statusCode) throw error;
        throw invalid(`Nie można odczytać bazy danych: ${error.message}`);
    } finally {
        await db?.close();
    }
}

/**
 * Replace the live database with an uploaded file and migrate it to the current schema.
 * The previous database is kept in BACKUP_DIR (pre_import_*.sqlite3) and restored if anything fails.
 */
export async function importDatabase(uploadedPath) {
    const dbPath = getDbPath();
    try {
        await validateDatabaseFile(uploadedPath);

        const previous = path.join(getBackupDir(), `pre_import_${stamp()}.sqlite3`);
        await snapshotDatabase(previous);
        await keepNewest(getBackupDir(), 'pre_import_', PRE_IMPORT_BACKUPS_KEPT);

        await closeDb();
        await fs.rm(`${dbPath}-journal`, {force: true});
        await fs.copyFile(uploadedPath, dbPath);
        try {
            await migrate();
        } catch (error) {
            await closeDb();
            await fs.copyFile(previous, dbPath);
            await getDb();
            throw Object.assign(new Error(`Migracja importowanej bazy nie powiodła się: ${error.message}`), {statusCode: 422});
        }
    } finally {
        await fs.rm(uploadedPath, {force: true});
    }
}
