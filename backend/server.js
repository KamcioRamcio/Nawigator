// backend/server.js — entry point: migrate the database, start HTTP server, schedule nightly jobs.
import schedule from 'node-schedule';
import {createApp} from './app.js';
import {migrate} from './db/schema.js';
import {getDbPath, closeDb} from './db/index.js';
import {runNightlyJobs} from './utils/helpers.js';

const port = Number(process.env.PORT) || 3333;

try {
    await migrate();
    console.log(`Database ready: ${getDbPath()}`);
} catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
}

const server = createApp().listen(port, () => console.log(`Nawigator listening on port ${port}`));

// Statuses depend on today's date: refresh them and take the daily backup just after midnight.
schedule.scheduleJob('5 0 * * *', runNightlyJobs);

async function shutdown() {
    await schedule.gracefulShutdown();
    server.close();
    await closeDb();
    process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
