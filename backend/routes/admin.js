// routes/admin.js
import express from 'express';
import { fetchUsers, addUser, updateUser, deleteUser } from '../db/queries.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Route to fetch all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await fetchUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

// Create a new user
router.post('/users', [
    body('username').notEmpty().withMessage('Username is required'),
    body('position').notEmpty().withMessage('Position is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = await addUser(req.body);
        res.status(201).json({ message: 'User created successfully', id: userId });
    } catch (error) {
        next(error);
    }
});

// Update an existing user
router.put('/users/:id', [
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('position').optional().notEmpty().withMessage('Position cannot be empty')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        await updateUser(id, req.body);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Delete a user
router.delete('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;