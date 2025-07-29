// backend/routes/utylizacja.js
import express from 'express';
import { body, validationResult } from 'express-validator';
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

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const utilizations = await getAllUtilizations();
        res.json(utilizations);
    } catch (error) {
        next(error);
    }
});

// Get utilization by ID with items
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const utilization = await getUtilizationById(id);

        if (!utilization) {
            return res.status(404).json({ error: 'Utylizacja nie została znaleziona' });
        }

        res.json(utilization);
    } catch (error) {
        next(error);
    }
});

// Create a new utilization
router.post('/', [
    body('nazwa').notEmpty().withMessage('Nazwa utylizacji jest wymagana')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const utilizationId = await createUtilization(req.body);
        res.status(201).json({ id: utilizationId, message: 'Utylizacja utworzona pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update utilization status
router.put('/:id/status', [
    body('status').notEmpty().withMessage('Status utylizacji jest wymagany')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { status } = req.body;

        await updateUtilizationStatus(id, status);
        res.json({ message: 'Status utylizacji zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update utilization details
router.put('/:id/details', [
    body('nazwa').notEmpty().withMessage('Nazwa utylizacji jest wymagana')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateUtilizationDetails(id, req.body);
        res.json({ message: 'Szczegóły utylizacji zaktualizowane pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Add medicine to utilization
router.post('/lek', [
    body('id_utylizacji').notEmpty().withMessage('ID utylizacji jest wymagana'),
    body('ilosc').notEmpty().isNumeric().withMessage('Ilość musi być liczbą'),
    body('powod_utylizacji').notEmpty().withMessage('Powód utylizacji jest wymagany')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const itemId = await addMedicineToUtilization(req.body);
        res.status(201).json({ id: itemId, message: 'Lek dodany do utylizacji pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Add equipment to utilization
router.post('/sprzet', [
    body('id_utylizacji').notEmpty().withMessage('ID utylizacji jest wymagana'),
    body('ilosc').notEmpty().isNumeric().withMessage('Ilość musi być liczbą'),
    body('powod_utylizacji').notEmpty().withMessage('Powód utylizacji jest wymagany')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const itemId = await addEquipmentToUtilization(req.body);
        res.status(201).json({ id: itemId, message: 'Sprzęt dodany do utylizacji pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update medicine in utilization
router.put('/lek/:id', [
    body('ilosc').isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateMedicineInUtilization(id, req.body);
        res.json({ message: 'Lek w utylizacji zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Update equipment in utilization
router.put('/sprzet/:id', [
    body('ilosc').isNumeric().withMessage('Ilość musi być liczbą')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateEquipmentInUtilization(id, req.body);
        res.json({ message: 'Sprzęt w utylizacji zaktualizowany pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Remove medicine from utilization
router.delete('/lek/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await removeMedicineFromUtilization(id);
        res.json({ message: 'Lek usunięty z utylizacji pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Remove equipment from utilization
router.delete('/sprzet/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await removeEquipmentFromUtilization(id);
        res.json({ message: 'Sprzęt usunięty z utylizacji pomyślnie' });
    } catch (error) {
        next(error);
    }
});

// Delete a utilization completely
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteUtilizationComplete(id);
        res.json({ message: 'Utylizacja usunięta pomyślnie' });
    } catch (error) {
        next(error);
    }
});


export default router;
