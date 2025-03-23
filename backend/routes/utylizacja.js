// backend/routes/utylizacja.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    fetchAllUtylizacja,
    addUtylizacja,
    updateUtylizacja,
    deleteUtylizacja
} from '../db/queries.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const utylizacja = await fetchAllUtylizacja();
        res.json(utylizacja);
    } catch (error) {
        next(error);
    }
});

router.post('/', [
    body('nazwa').notEmpty().withMessage('Nazwa jest wymagana'),
    body('ilosc').optional().isNumeric().withMessage('Ilość musi być liczbą'),
    body('data_waznosci').optional().isDate().withMessage('Data musi być w formacie YYYY-MM-DD')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        await addUtylizacja(req.body);
        res.status(201).json({ message: 'Utylizacja added successfully' });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', [
    body('nazwa').notEmpty().withMessage('Nazwa jest wymagana'),
    body('ilosc').optional().isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateUtylizacja(id, req.body);
        res.json({ message: 'Utylizacja updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteUtylizacja(id);
        res.json({ message: 'Utylizacja deleted successfully' });
    } catch (error) {
        next(error);
    }
});
router.post('/from-medicine', [
    body('nazwa').notEmpty().withMessage('Nazwa jest wymagana'),
    body('ilosc').optional().isNumeric().withMessage('Ilość musi być liczbą'),
    body('data_waznosci').optional(),
    body('ilosc_nominalna').optional(),
    body('grupa').notEmpty().withMessage('Grupa jest wymagana'),
    body('powod_utylizacji').notEmpty().withMessage('Powód utylizacji jest wymagany')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        await addUtylizacja(req.body);
        res.status(201).json({ message: 'Lek został dodany do utylizacji' });
    } catch (error) {
        next(error);
    }
});



export default router;
