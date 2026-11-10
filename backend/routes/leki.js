// backend/routes/leki.js
import express from 'express';
import {body, param} from 'express-validator';
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
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

const isoDate = param('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data musi mieć format RRRR-MM-DD');
const medicineRules = [
    body('lek_nazwa').notEmpty().withMessage('Nazwa leku jest wymagana'),
    body('lek_ilosc').optional({values: 'falsy'}).isNumeric().withMessage('Ilość musi być liczbą'),
];

router.get('/leki-kategorie', async (req, res) => {
    res.json(await fetchMedicinesByCategory());
});

router.get('/leki/status-by-date/:date', validate(isoDate), async (req, res) => {
    res.json(await fetchMedicinesByDate(req.params.date));
});

router.post('/leki-all', validate(...medicineRules), async (req, res) => {
    const id = await addMedicine(req.body);
    res.status(201).json({message: 'Medicine added successfully', id});
});

router.put('/leki/:id', validate(idParam, ...medicineRules), async (req, res) => {
    affected(res, await updateMedicine(req.params.id, req.body), 'Medicine updated successfully');
});

router.delete('/leki/delete/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteMedicine(req.params.id), 'Medicine deleted successfully');
});

router.get('/leki-min-kategorie', async (req, res) => {
    res.json(await fetchMinMedicinesByCategory());
});

router.post('/leki-min', validate(
    body('nazwa_leku').notEmpty().withMessage('Nazwa leku jest wymagana'),
    body('id_kategorii').notEmpty().withMessage('Kategoria jest wymagana'),
), async (req, res) => {
    const id = await addMinMedicine(req.body);
    res.status(201).json({message: 'Min medicine added successfully', id});
});

router.put('/leki-min/:id', validate(idParam, body('nazwa_leku').notEmpty().withMessage('Nazwa leku jest wymagana')), async (req, res) => {
    affected(res, await updateMinMedicine(req.params.id, req.body), 'Min medicine updated successfully');
});

router.delete('/leki-min/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteMinMedicine(req.params.id), 'Min medicine deleted successfully');
});

export default router;
