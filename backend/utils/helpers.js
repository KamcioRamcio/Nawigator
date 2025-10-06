// backend/utils/helpers.js
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { getDb, closeDb } from '../db/index.js';

const DB_PATH = 'db.sqlite3';
const BACKUP_PATH = './protected/db_backup.sqlite3';
const EXPORT_PATH = './temp';

export async function createBackup() {
    try {
        await fs.mkdir('./protected', { recursive: true });
        await fs.copyFile(DB_PATH, BACKUP_PATH);
        console.log('Backup created successfully');
    } catch (error) {
        console.error('Failed to create backup:', error.message);
        throw error;
    }
}

export async function exportDatabase() {
    try {
        await fs.mkdir(EXPORT_PATH, { recursive: true });
        const exportFilePath = path.join(EXPORT_PATH, `export_${Date.now()}.db`);

        await fs.copyFile(DB_PATH, exportFilePath);
        return exportFilePath;
    } catch (error) {
        console.error('Failed to export database:', error.message);
        throw error;
    }
}

export async function importDatabase(importedDbPath) {
    try {
        const currentDbPath = './db.sqlite3';
        const backupDbPath = './db.sqlite3.backup';

        // Close the database connection
        await closeDb();

        // Create a backup of the current database
        await fs.copyFile(currentDbPath, backupDbPath);

        try {
            // Try to copy the new database
            await fs.copyFile(importedDbPath, currentDbPath);

            // Delete the temporary file
            await fs.unlink(importedDbPath);

            // Test the new database connection
            const db = await getDb();

            return { success: true };
        } catch (error) {
            // If there's an error, restore the backup
            if (await fs.access(backupDbPath).then(() => true).catch(() => false)) {
                await fs.copyFile(backupDbPath, currentDbPath);
            }
            throw error;
        } finally {
            // Delete the backup
            if (await fs.access(backupDbPath).then(() => true).catch(() => false)) {
                await fs.unlink(backupDbPath);
            }
        }
    } catch (error) {
        console.error('Failed to import database:', error.message);
        return { success: false, message: error.message };
    }
}

export async function createDailyBackup() {
    try {
        const desktopPath = path.join(os.homedir(), 'Desktop');
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const backupFilename = `db_backup_${year}${month}${day}.sqlite3`;
        const backupPath = path.join(desktopPath, backupFilename);

        await fs.copyFile(DB_PATH, backupPath);
        console.log(`Daily backup created: ${backupFilename}`);

        // Delete old backups (keep last 7 days)
        const files = await fs.readdir(desktopPath);
        const backupFiles = files.filter(file => file.startsWith('db_backup_') && file.endsWith('.sqlite3'));

        if (backupFiles.length > 7) {
            const oldestFiles = backupFiles
                .sort()
                .slice(0, backupFiles.length - 7);

            for (const file of oldestFiles) {
                await fs.unlink(path.join(desktopPath, file));
                console.log(`Deleted old backup: ${file}`);
            }
        }
    } catch (error) {
        console.error('Failed to create daily backup:', error.message);
    }
}

