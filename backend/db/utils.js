// backend/db/utils.js
// Helpers shared by query modules. Dates are stored as DD-MM-YYYY text.

/** Convert YYYY-MM-DD (HTML date input) to DD-MM-YYYY; other values are returned unchanged. */
export function formatDateToEuropean(date) {
    if (typeof date !== 'string') return date;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    return iso ? `${iso[3]}-${iso[2]}-${iso[1]}` : date;
}

/** Today's date as DD-MM-YYYY (server local time). */
export function todayEuropean(now = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
}

/** SQL expression for sorting a DD-MM-YYYY column chronologically. */
export const sortableDate = (col) => `substr(${col}, 7, 4) || substr(${col}, 4, 2) || substr(${col}, 1, 2)`;

/** Run fn inside a transaction on the shared connection. */
export async function inTransaction(db, fn) {
    await db.exec('BEGIN');
    try {
        const result = await fn();
        await db.exec('COMMIT');
        return result;
    } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
    }
}
