import { createBackup } from '../utils/helpers.js';

// Debounce mechanism to prevent multiple backups
let backupTimer = null;
const BACKUP_DELAY = 2000; // 2 seconds debounce

export const backupMiddleware = async (req, res, next) => {
    try {
        await next();

        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            // Clear any existing timer
            if (backupTimer) {
                clearTimeout(backupTimer);
            }

            // Set a new timer
            backupTimer = setTimeout(async () => {
                try {
                    await createBackup();
                } catch (error) {
                    console.error('Backup creation error:', error);
                }
                backupTimer = null;
            }, BACKUP_DELAY);
        }
    } catch (error) {
        console.error('Backup middleware error:', error);
        next(error);
    }
};