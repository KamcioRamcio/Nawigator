// backend/routes/leki.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    addMedicine,
    updateMedicine,
    deleteMedicine,
    fetchMedicinesByCategory,
    fetchMedicinesByDate,
    addMinMedicine,
    updateMinMedicine,
    deleteMinMedicine,
    fetchMinMedicinesByCategory
} from '../db/queries.js';

const router = express.Router();

// Leki routes
router.get('/leki-kategorie', async (req, res, next) => {
    try {
        const groupedData = await fetchMedicinesByCategory();
        res.json(groupedData);
    } catch (error) {
        next(error);
    }
});

router.get('/leki/status-by-date/:date', async (req, res, next) => {
    try {
        const { date } = req.params;
        const medicines = await fetchMedicinesByDate(date);
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines by date:', error);
        res.status(500).json({ error: error.message });
    }
})

router.post('/leki-all', [
    body('lek_nazwa').notEmpty().withMessage('Nazwa leku jest wymagana'),
    body('lek_ilosc').optional().isNumeric().withMessage('Ilość musi być liczbą'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        await addMedicine(req.body);
        res.status(201).json({ message: 'Medicine added successfully' });
    } catch (error) {
        next(error);
    }
});

router.put('/leki/:id', [
    body('lek_nazwa').notEmpty().withMessage('Nazwa leku jest wymagana'),
    body('lek_ilosc').optional().isNumeric().withMessage('Ilość musi być liczbą'),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateMedicine(id, req.body);
        res.json({ message: 'Medicine updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/leki/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteMedicine(id);
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Leki min routes
router.get('/leki-min-kategorie', async (req, res, next) => {
    try {
        const groupedData = await fetchMinMedicinesByCategory();
        res.json(groupedData);
    } catch (error) {
        next(error);
    }
});

router.post('/leki-min', [
    body('nazwa_leku').notEmpty().withMessage('Nazwa leku jest wymagana'),
    body('id_kategorii').notEmpty().withMessage('Kategoria jest wymagana')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const lastId = await addMinMedicine(req.body);
        res.status(201).json({ message: 'Min medicine added successfully', id: lastId });
    } catch (error) {
        next(error);
    }
});

router.put('/leki-min/:id', [
    body('nazwa_leku').notEmpty().withMessage('Nazwa leku jest wymagana')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateMinMedicine(id, req.body);
        res.json({ message: 'Min medicine updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/leki-min/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteMinMedicine(id);
        res.json({ message: 'Min medicine deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
