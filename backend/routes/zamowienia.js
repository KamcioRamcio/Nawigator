import express from 'express';
import { body, validationResult } from 'express-validator';
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

const router = express.Router();

// Get all orders
router.get('/zamowienia', async (req, res, next) => {
    try {
        const orders = await getAllOrders();
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

// Get order by ID with items
router.get('/zamowienia/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(id);

        if (!order) {
            return res.status(404).json({ error: 'Zamówienie nie zostało znalezione' });
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
});

// Create a new order
router.post('/zamowienia', [
    body('nazwa').notEmpty().withMessage('Nazwa zamówienia jest wymagana')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderId = await createOrder(req.body);
        res.status(201).json({ id: orderId, message: 'Zamówienie utworzone pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update order status
router.put('/zamowienia/:id/status', [
    body('status').notEmpty().withMessage('Status zamówienia jest wymagany')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { status } = req.body;

        await updateOrderStatus(id, status);
        res.json({ message: 'Status zamówienia zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Add medicine to order
router.post('/zamowienia/lek', [
    body('id_zamowienia').notEmpty().withMessage('ID zamówienia jest wymagane'),
    body('id_leku').notEmpty().withMessage('ID leku jest wymagane'),
    body('ilosc').notEmpty().isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const itemId = await addMedicineToOrder(req.body);
        res.status(201).json({ id: itemId, message: 'Lek dodany do zamówienia pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Add equipment to order
router.post('/zamowienia/sprzet', [
    body('id_zamowienia').notEmpty().withMessage('ID zamówienia jest wymagane'),
    body('id_sprzetu').notEmpty().withMessage('ID sprzętu jest wymagane'),
    body('ilosc').notEmpty().isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const itemId = await addEquipmentToOrder(req.body);
        res.status(201).json({ id: itemId, message: 'Sprzęt dodany do zamówienia pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update medicine in order - Use proper query function
router.put('/zamowienia/lek/:id', [
    body('ilosc').isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateMedicineInOrder(id, req.body);
        res.json({ message: 'Lek w zamówieniu zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update equipment in order - Use proper query function
router.put('/zamowienia/sprzet/:id', [
    body('ilosc').isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateEquipmentInOrder(id, req.body);
        res.json({ message: 'Sprzęt w zamówieniu zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Remove medicine from order
router.delete('/zamowienia/lek/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await removeMedicineFromOrder(id);
        res.json({ message: 'Lek usunięty z zamówienia pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Remove equipment from order
router.delete('/zamowienia/sprzet/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await removeEquipmentFromOrder(id);
        res.json({ message: 'Sprzęt usunięty z zamówienia pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Delete an order
router.delete('/zamowienia/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteOrder(id);
        res.json({ message: 'Zamówienie usunięte pomyślnie' });
    } catch (error) {
        next(error);
    }
});

export default router;