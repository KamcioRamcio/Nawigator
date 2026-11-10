// backend/routes/backup.js
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import express from 'express';
import multer from 'multer';
import {exportDatabase, importDatabase} from '../utils/helpers.js';

const router = express.Router();

const upload = multer({
    dest: os.tmpdir(),
    limits: {fileSize: 200 * 1024 * 1024, files: 1},
});

router.get('/export-database', async (req, res, next) => {
    const exportPath = await exportDatabase();
    const date = path.basename(exportPath).slice(7, 15).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    res.download(exportPath, `database_export_${date}.db`, {dotfiles: 'allow'}, (err) => {
        fs.rm(exportPath, {force: true});
        if (err && !res.headersSent) next(err);
    });
});

router.post('/import-database', upload.single('database'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({success: false, error: 'Nie przesłano pliku', message: 'Nie przesłano pliku'});
    }
    await importDatabase(req.file.path);
    res.json({success: true, message: 'Baza danych została pomyślnie zaimportowana'});
});

export default router;
