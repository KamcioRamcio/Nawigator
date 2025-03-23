// backend/routes/sprzet.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    addEquipment,
    updateEquipment,
    deleteEquipment,
    fetchEquipmentByCategory
} from '../db/queries.js';

const router = express.Router();

router.get('/sprzet-kategorie', async (req, res, next) => {
    try {
        const groupedData = await fetchEquipmentByCategory();
        res.json(groupedData);
    } catch (error) {
        next(error);
    }
});

router.post('/sprzet-all', [
    body('eq_nazwa').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    body('eq_ilosc_wymagana').optional().isNumeric().withMessage('Ilość wymagana musi być liczbą'),
    body('eq_ilosc_aktualna').optional().isNumeric().withMessage('Ilość aktualna musi być liczbą'),
    body('eq_data').optional().isDate().withMessage('Data musi być w formacie YYYY-MM-DD')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        await addEquipment(req.body);
        res.status(201).json({ message: 'Equipment added successfully' });
    } catch (error) {
        next(error);
    }
});

router.put('/sprzet/:id', [
    body('sprzet_nazwa').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    body('sprzet_ilosc_wymagana').optional().isNumeric().withMessage('Ilość wymagana musi być liczbą'),
    body('sprzet_ilosc_aktualna').optional().isNumeric().withMessage('Ilość aktualna musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateEquipment(id, req.body);
        res.json({ message: 'Equipment updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/sprzet/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteEquipment(id);
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
