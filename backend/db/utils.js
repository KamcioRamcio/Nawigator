// backend/db/utils.js
// Helpers shared by query modules. Dates are stored as DD-MM-YYYY text.

/** YYYY-MM-DD (HTML date input) or D.M.YYYY (toLocaleDateString('pl-PL')) -> DD-MM-YYYY; other values unchanged. */
export function formatDateToEuropean(date) {
    if (typeof date !== 'string') return date;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
    const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date);
    if (dotted) return `${dotted[1].padStart(2, '0')}-${dotted[2].padStart(2, '0')}-${dotted[3]}`;
    return date;
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
