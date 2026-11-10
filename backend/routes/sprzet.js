// backend/routes/sprzet.js
import express from 'express';
import {body, param} from 'express-validator';
import {
    addEquipment,
    updateEquipment,
    deleteEquipment,
    fetchEquipmentByCategory,
    fetchEquipmentsByDate,
    addOrganizedEquipment,
    updateOrganizedEquipment,
    deleteOrganizedEquipment,
    fetchOrganizedEquipmentByCategory,
} from '../db/queries.js';
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

const numeric = (field, label) => body(field).optional({values: 'falsy'}).isNumeric().withMessage(`${label} musi być liczbą`);
const isoDate = param('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data musi mieć format RRRR-MM-DD');

router.get('/sprzet-kategorie', async (req, res) => {
    res.json(await fetchEquipmentByCategory());
});

router.get('/sprzet/status-by-date/:date', validate(isoDate), async (req, res) => {
    res.json(await fetchEquipmentsByDate(req.params.date));
});

router.post('/sprzet-all', validate(
    body('eq_nazwa').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    numeric('eq_ilosc_wymagana', 'Ilość wymagana'),
    numeric('eq_ilosc_aktualna', 'Ilość aktualna'),
), async (req, res) => {
    const id = await addEquipment(req.body);
    res.status(201).json({message: 'Equipment added successfully', id});
});

router.put('/sprzet/:id', validate(
    idParam,
    body('sprzet_nazwa').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    numeric('sprzet_ilosc_wymagana', 'Ilość wymagana'),
    numeric('sprzet_ilosc_aktualna', 'Ilość aktualna'),
), async (req, res) => {
    affected(res, await updateEquipment(req.params.id, req.body), 'Equipment updated successfully');
});

router.delete('/sprzet/delete/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteEquipment(req.params.id), 'Equipment deleted successfully');
});

router.get('/sprzet-zgrany-kategorie', async (req, res) => {
    res.json(await fetchOrganizedEquipmentByCategory());
});

router.post('/sprzet-zgrany-all', validate(
    body('nazwa_sprzetu').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    numeric('ilosc', 'Ilość'),
), async (req, res) => {
    const id = await addOrganizedEquipment(req.body);
    res.status(201).json({message: 'Organized equipment added successfully', id});
});

router.put('/sprzet-zgrany/:id', validate(
    idParam,
    body('nazwa_sprzetu').notEmpty().withMessage('Nazwa sprzętu jest wymagana'),
    numeric('ilosc', 'Ilość'),
), async (req, res) => {
    affected(res, await updateOrganizedEquipment(req.params.id, req.body), 'Organized equipment updated successfully');
});

router.delete('/sprzet-zgrany/delete/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteOrganizedEquipment(req.params.id), 'Organized equipment deleted successfully');
});

export default router;
