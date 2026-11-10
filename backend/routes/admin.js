// backend/routes/admin.js  (mounted at /api/admin) + POST /api/login
import express from 'express';
import {body} from 'express-validator';
import {fetchUsers, addUser, updateUser, deleteUser, verifyLogin} from '../db/queries.js';
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

router.get('/users', async (req, res) => {
    res.json(await fetchUsers());
});

router.post('/users', validate(
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('position').notEmpty().withMessage('Position is required'),
), async (req, res) => {
    const id = await addUser(req.body);
    res.status(201).json({message: 'User created successfully', id});
});

router.put('/users/:id', validate(idParam), async (req, res) => {
    affected(res, await updateUser(req.params.id, req.body), 'User updated successfully');
});

router.delete('/users/:id', validate(idParam), async (req, res) => {
    affected(res, await deleteUser(req.params.id), 'User deleted successfully');
});

export const loginRouter = express.Router();

loginRouter.post('/login', validate(body('username').notEmpty().withMessage('Wybierz użytkownika')), async (req, res) => {
    const user = await verifyLogin(req.body.username, req.body.password ?? '');
    if (!user) return res.status(401).json({error: 'Nieprawidłowe dane logowania'});
    res.json(user);
});

export default router;
