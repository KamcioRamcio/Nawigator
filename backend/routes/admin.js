// backend/routes/admin.js  (mounted at /api/admin) + POST /api/login
import express from 'express';
import {body} from 'express-validator';
import {fetchUsers, addUser, updateUser, deleteUser, verifyLogin, isLastAdmin} from '../db/queries.js';
import {validate, idParam, affected} from './validate.js';

const router = express.Router();

export const POSITIONS = ['admin', 'user', 'viewer'];
const LAST_ADMIN = 'Musi zostać co najmniej jeden administrator';

router.get('/users', async (req, res) => {
    res.json(await fetchUsers());
});

router.post('/users', validate(
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('position').isIn(POSITIONS).withMessage('Nieprawidłowa rola (admin, user lub viewer)'),
), async (req, res) => {
    const id = await addUser(req.body);
    res.status(201).json({message: 'User created successfully', id});
});

router.put('/users/:id', validate(
    idParam,
    body('position').optional({values: 'falsy'}).isIn(POSITIONS).withMessage('Nieprawidłowa rola (admin, user lub viewer)'),
), async (req, res) => {
    const demotes = req.body.position && req.body.position !== 'admin';
    if (demotes && await isLastAdmin(req.params.id)) return res.status(409).json({error: LAST_ADMIN});
    affected(res, await updateUser(req.params.id, req.body), 'User updated successfully');
});

router.delete('/users/:id', validate(idParam), async (req, res) => {
    if (await isLastAdmin(req.params.id)) return res.status(409).json({error: LAST_ADMIN});
    affected(res, await deleteUser(req.params.id), 'User deleted successfully');
});

export const loginRouter = express.Router();

loginRouter.post('/login', validate(body('username').notEmpty().withMessage('Wybierz użytkownika')), async (req, res) => {
    const user = await verifyLogin(req.body.username, req.body.password ?? '');
    if (!user) return res.status(401).json({error: 'Nieprawidłowe dane logowania'});
    res.json(user);
});

export default router;
