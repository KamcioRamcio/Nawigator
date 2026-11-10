// Shared helpers for route handlers (Express 5 forwards async errors to errorHandler on its own).
import {validationResult, param} from 'express-validator';

/** Run express-validator rules, answer 400 with { errors } when any fails. */
export const validate = (...rules) => [
    ...rules,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
        next();
    },
];

export const idParam = param('id').isInt({min: 1}).withMessage('Nieprawidłowe ID');

/** Reply { message } when a row was affected, 404 { error } otherwise. */
export function affected(res, changes, message, notFound = 'Nie znaleziono rekordu') {
    if (!changes) return res.status(404).json({error: notFound});
    res.json({message});
}
