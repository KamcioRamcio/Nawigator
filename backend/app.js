// backend/app.js — Express app without side effects (used by server.js and tests).
import fs from 'fs';
import path from 'path';
import express from 'express';
import lekiRoutes from './routes/leki.js';
import sprzetRoutes from './routes/sprzet.js';
import utylizacjaRoutes from './routes/utylizacja.js';
import backupRoutes from './routes/backup.js';
import adminRoutes, {loginRouter} from './routes/admin.js';
import zamowieniaRoutes from './routes/zamowienia.js';
import {backupMiddleware} from './middleware/backup.js';
import {errorHandler} from './middleware/errorHandler.js';

export function createApp({staticDir = process.env.STATIC_DIR} = {}) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({limit: '1mb'}));

    app.get('/api/health', (req, res) => res.json({status: 'ok'}));

    app.use('/api', backupMiddleware);
    app.use('/api', loginRouter);
    app.use('/api', lekiRoutes);
    app.use('/api', sprzetRoutes);
    app.use('/api/utylizacja', utylizacjaRoutes);
    app.use('/api', backupRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api', zamowieniaRoutes);
    app.use('/api', (req, res) => res.status(404).json({error: 'Nie znaleziono'}));

    // Production: serve the built frontend from the same process/port.
    if (staticDir && fs.existsSync(path.join(staticDir, 'index.html'))) {
        app.use(express.static(staticDir, {index: false, maxAge: '7d'}));
        app.get('/{*splat}', (req, res) => res.sendFile(path.resolve(staticDir, 'index.html')));
    }

    app.use(errorHandler);
    return app;
}
