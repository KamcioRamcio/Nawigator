import sqlite3 from "sqlite3";
import { open } from 'sqlite'

let db = null;

export async function getDb() {
    if (db) return db;

    db = await open({
        filename: 'db.sqlite3',
        driver: sqlite3.Database,
    });

    await db.run('PRAGMA foreign_keys = ON');
    console.log('Connected to sqlite3 db');

    return db;
}

export async function closeDb() {
    if (db) {
        await db.close();
        db = null;
        console.log('Database connection close');
    }
}

