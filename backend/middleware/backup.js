import { createBackup } from '../utils/helpers.js';

export const backupMiddleware = async (req, res, next) => {
    try {
        await next();

        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            await createBackup();
        }
    } catch (error) {
        console.error('Backup middleware error:', error);
        next(error);
    }
};
