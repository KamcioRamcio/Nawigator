// backend/routes/utylizacja.js  (mounted at /api/utylizacja)
import express from 'express';
import {body} from 'express-validator';
import {
    createUtilization,
    getAllUtilizations,
    getUtilizationById,
    updateUtilizationStatus,
    updateUtilizationDetails,
    addMedicineToUtilization,
    addEquipmentToUtilization,
    updateMedicineInUtilization,
    updateEquipmentInUtilization,
    removeMedicineFromUtilization,
    removeEquipmentFromUtilization,
    deleteUtilizationComplete
} from '../db/queries.js';
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

const NOT_FOUND = 'Utylizacja nie została znaleziona';
const quantity = body('ilosc').isFloat({min: 0}).withMessage('Ilość musi być liczbą nieujemną');
const itemRules = [
    body('id_utylizacji').notEmpty().withMessage('ID utylizacji jest wymagane'),
    quantity,
    body('powod_utylizacji').notEmpty().withMessage('Powód utylizacji jest wymagany'),
];
const name = body('nazwa').trim().notEmpty().withMessage('Nazwa utylizacji jest wymagana');

router.get('/', async (req, res) => {
    res.json(await getAllUtilizations());
});

router.post('/', validate(name), async (req, res) => {
    const id = await createUtilization(req.body);
    res.status(201).json({id, message: 'Utylizacja utworzona pomyślnie'});
});

// Item routes come before "/:id" routes; idParam (integer) also keeps "lek"/"sprzet" out of "/:id".
router.post('/lek', validate(...itemRules), async (req, res) => {
    const id = await addMedicineToUtilization(req.body);
    res.status(201).json({id, message: 'Lek dodany do utylizacji pomyślnie'});
});

router.post('/sprzet', validate(...itemRules), async (req, res) => {
    const id = await addEquipmentToUtilization(req.body);
    res.status(201).json({id, message: 'Sprzęt dodany do utylizacji pomyślnie'});
});

router.put('/lek/:id', validate(idParam, quantity), async (req, res) => {
    affected(res, await updateMedicineInUtilization(req.params.id, req.body), 'Lek w utylizacji zaktualizowany pomyślnie');
});

router.put('/sprzet/:id', validate(idParam, quantity), async (req, res) => {
    affected(res, await updateEquipmentInUtilization(req.params.id, req.body), 'Sprzęt w utylizacji zaktualizowany pomyślnie');
});

router.delete('/lek/:id', validate(idParam), async (req, res) => {
    affected(res, await removeMedicineFromUtilization(req.params.id), 'Lek usunięty z utylizacji pomyślnie');
});

router.delete('/sprzet/:id', validate(idParam), async (req, res) => {
    affected(res, await removeEquipmentFromUtilization(req.params.id), 'Sprzęt usunięty z utylizacji pomyślnie');
});

router.get('/:id', validate(idParam), async (req, res) => {
    const utilization = await getUtilizationById(req.params.id);
    if (!utilization) return res.status(404).json({error: NOT_FOUND});
    res.json(utilization);
});

router.put('/:id/status', validate(idParam, body('status').notEmpty().withMessage('Status utylizacji jest wymagany')), async (req, res) => {
    affected(res, await updateUtilizationStatus(req.params.id, req.body.status), 'Status utylizacji zaktualizowany pomyślnie', NOT_FOUND);
});

router.put('/:id/details', validate(idParam, name), async (req, res) => {
    affected(res, await updateUtilizationDetails(req.params.id, req.body), 'Szczegóły utylizacji zaktualizowane pomyślnie', NOT_FOUND);
});

router.delete('/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteUtilizationComplete(req.params.id), 'Utylizacja usunięta pomyślnie', NOT_FOUND);
});

export default router;
