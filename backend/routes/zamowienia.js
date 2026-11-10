// backend/routes/zamowienia.js
import express from 'express';
import {body} from 'express-validator';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    addMedicineToOrder,
    addEquipmentToOrder,
    removeMedicineFromOrder,
    removeEquipmentFromOrder,
    deleteOrder,
    updateMedicineInOrder,
    updateEquipmentInOrder
} from '../db/queries.js';
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

export const ORDER_STATUSES = ['Nowe', 'W trakcie', 'Zamówione', 'Przyjęte', 'Zakończone', 'Anulowane'];
const NOT_FOUND = 'Zamówienie nie zostało znalezione';
const quantity = body('ilosc').isFloat({min: 0}).withMessage('Ilość musi być liczbą nieujemną');

router.get('/zamowienia', async (req, res) => {
    res.json(await getAllOrders());
});

router.get('/zamowienia/:id', validate(idParam), async (req, res) => {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({error: NOT_FOUND});
    res.json(order);
});

router.post('/zamowienia', validate(body('nazwa').trim().notEmpty().withMessage('Nazwa zamówienia jest wymagana')), async (req, res) => {
    const id = await createOrder(req.body);
    res.status(201).json({id, message: 'Zamówienie utworzone pomyślnie'});
});

router.put('/zamowienia/:id/status', validate(
    idParam,
    body('status').isIn(ORDER_STATUSES).withMessage('Nieprawidłowy status zamówienia'),
), async (req, res) => {
    const ok = await updateOrderStatus(req.params.id, req.body.status);
    affected(res, ok, 'Status zamówienia zaktualizowany pomyślnie', NOT_FOUND);
});

router.post('/zamowienia/lek', validate(
    body('id_zamowienia').notEmpty().withMessage('ID zamówienia jest wymagane'),
    body('id_leku').notEmpty().withMessage('ID leku jest wymagane'),
    quantity,
), async (req, res) => {
    const id = await addMedicineToOrder(req.body);
    res.status(201).json({id, message: 'Lek dodany do zamówienia pomyślnie'});
});

router.post('/zamowienia/sprzet', validate(
    body('id_zamowienia').notEmpty().withMessage('ID zamówienia jest wymagane'),
    body('id_sprzetu').notEmpty().withMessage('ID sprzętu jest wymagane'),
    quantity,
), async (req, res) => {
    const id = await addEquipmentToOrder(req.body);
    res.status(201).json({id, message: 'Sprzęt dodany do zamówienia pomyślnie'});
});

router.put('/zamowienia/lek/:id', validate(idParam, quantity), async (req, res) => {
    affected(res, await updateMedicineInOrder(req.params.id, req.body), 'Lek w zamówieniu zaktualizowany pomyślnie');
});

router.put('/zamowienia/sprzet/:id', validate(idParam, quantity), async (req, res) => {
    affected(res, await updateEquipmentInOrder(req.params.id, req.body), 'Sprzęt w zamówieniu zaktualizowany pomyślnie');
});

router.delete('/zamowienia/lek/:id', validate(idParam), async (req, res) => {
    affected(res, await removeMedicineFromOrder(req.params.id), 'Lek usunięty z zamówienia pomyślnie');
});

router.delete('/zamowienia/sprzet/:id', validate(idParam), async (req, res) => {
    affected(res, await removeEquipmentFromOrder(req.params.id), 'Sprzęt usunięty z zamówienia pomyślnie');
});

router.delete('/zamowienia/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteOrder(req.params.id), 'Zamówienie usunięte pomyślnie', NOT_FOUND);
});

export default router;
