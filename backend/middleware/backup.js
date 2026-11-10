import {createBackup} from '../utils/helpers.js';

const BACKUP_DELAY_MS = 2000;
let timer = null;

/** After a successful change, refresh the rolling backup (debounced so bursts of edits make one copy). */
export function backupMiddleware(req, res, next) {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        res.on('finish', () => {
            if (res.statusCode >= 400) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = null;
                createBackup().catch(error => console.error('Backup failed:', error));
            }, BACKUP_DELAY_MS);
            timer.unref();
        });
    }
    next();
}
