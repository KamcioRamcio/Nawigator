import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';
import { getDb } from './db/index.js';
import {
    createTables,
    addExpiryStatusTrigger,
    addStatusMedicineTrigger,
    updateExpiryStatusTrigger,
    updateStatusTrigger,
    updateDateFormatToEuropean
} from './db/schema.js';
import lekiRoutes from './routes/leki.js';
import sprzetRoutes from './routes/sprzet.js';
import utylizacjaRoutes from './routes/utylizacja.js';
import backupRoutes from './routes/backup.js';
import adminRoutes from './routes/admin.js';
import zamowieniaRoutes from './routes/zamowienia.js';

import { backupMiddleware } from './middleware/backup.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createDailyBackup} from './utils/helpers.js';

const app = express();
const port = 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
async function initializeDatabase() {
    try {
        const db = await getDb();
        await createTables();
        await updateExpiryStatusTrigger();
        await updateStatusTrigger();
        console.log('Database initialized successfully');
        await addStatusMedicineTrigger();
        console.log('Status medicine trigger added successfully');
        await addExpiryStatusTrigger();
        console.log('Expiry status trigger added successfully');

    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// Routes
app.use('/api', backupMiddleware);
app.use('/api', lekiRoutes);
app.use('/api', sprzetRoutes);
app.use('/api/utylizacja', utylizacjaRoutes);
app.use('/api', backupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', zamowieniaRoutes);

// Error handling
app.use(errorHandler);

// Add this to your API routes
app.get('/api/leki-min/:id/associations', async (req, res) => {
    try {
        const db = await getDb();
        const id = req.params.id;

        const medicine = await db.get('SELECT * FROM Leki_spis_min WHERE id = ?', [id]);
        const mainMed = await db.get('SELECT id FROM Leki WHERE nazwa_leku = ?', [medicine.nazwa_leku]);

        const categories = await db.all('SELECT * FROM Leki_kategorie WHERE id_leku = ?', [mainMed.id]);
        const subcategories = await db.all('SELECT * FROM Leki_pod_kategorie WHERE id_leku = ?', [mainMed.id]);
        const subsubcategories = await db.all('SELECT * FROM Leki_pod_pod_kategorie WHERE id_leku = ?', [mainMed.id]);

        res.json({
            medicine,
            categories,
            subcategories,
            subsubcategories
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Schedule daily backup at 23:59
schedule.scheduleJob('59 23 * * *', createDailyBackup);
schedule.scheduleJob('59 23 * * *', updateExpiryStatusTrigger);
schedule.scheduleJob('59 23 * * *', updateStatusTrigger);

// Schedule tasks
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
});
