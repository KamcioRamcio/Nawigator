import express from 'express';
import cors from 'cors';
import schedule from 'node-schedule';
import { getDb } from './db/index.js';
import { createTables } from './db/schema.js';
import lekiRoutes from './routes/leki.js';
import sprzetRoutes from './routes/sprzet.js';
import utylizacjaRoutes from './routes/utylizacja.js';
import backupRoutes from './routes/backup.js';
import { backupMiddleware } from './middleware/backup.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createDailyBackup } from './utils/helpers.js';

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
        console.log('Database initialized successfully');
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

// Error handling
app.use(errorHandler);

// Schedule daily backup at 23:59
schedule.scheduleJob('59 23 * * *', createDailyBackup);

// Start the server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
});
