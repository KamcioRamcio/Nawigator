// backend/routes/backup.js
import express from 'express';
import multer from 'multer';
import { exportDatabase, importDatabase } from '../utils/helpers.js';
import {createTables, updateDateFormatToEuropean, updateExpiryStatusTrigger} from "../db/schema.js";
import { getDb } from '../db/index.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'imported_database.db');
    }
});

const upload = multer({ storage: storage });

router.get('/export-database', async (req, res, next) => {
    try {
        const exportPath = await exportDatabase();

        res.download(exportPath, 'database_export.db', (err) => {
            if (err) {
                console.error('Download error:', err);
                next(err);
            }
        });
    } catch (error) {
        next(error);
    }

});

router.post('/import-database', upload.single('database'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nie przesłano pliku'
            });
        }

        const importResult = await importDatabase(req.file.path);

        if (importResult.success) {
            res.json({
                success: true,
                message: 'Baza danych została pomyślnie zaimportowana'
            });
        } else {
            res.status(500).json({
                success: false,
                message: importResult.message
            });
        }
    } catch (error) {
        next(error);
    }
    try {
        const db = await getDb();
        await updateDateFormatToEuropean(db);
        console.log('Date format updated to European successfully');
    } catch (error) {
        console.error('Date format update error:', error);
        res.status(500).json({
            success: false,
            message: 'Nie udało się zaktualizować formatu daty'
        });
    }
    try {
        const db = await getDb();
        await updateExpiryStatusTrigger(db);
        console.log('Expiry status updated successfully');
    } catch (error) {
        console.error('Expiry status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Nie udało się zaktualizować statusu ważności'
        });
    }
    try {
        const db = await getDb();
        await createTables();
        console.log('Tables created or verified successfully');
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Nie udało się utworzyć lub zweryfikować tabel'
        });
    }


});

export default router;
