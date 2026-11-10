import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export function getDbPath() {
    return path.resolve(process.env.DB_PATH || './data/db.sqlite3');
}

export async function getDb() {
    if (db) return db;

    const filename = getDbPath();
    fs.mkdirSync(path.dirname(filename), { recursive: true });

    db = await open({ filename, driver: sqlite3.Database });
    await db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    return db;
}

export async function closeDb() {
    if (db) {
        await db.close();
        db = null;
    }
}
