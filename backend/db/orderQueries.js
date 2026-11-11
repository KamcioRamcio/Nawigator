// backend/db/orderQueries.js
import {getDb} from './index.js';
import {formatDateToEuropean, todayEuropean, sortableDate, inTransaction} from './utils.js';
import {updateStatusTrigger} from './schema.js';

export async function createOrder({nazwa, status, data_zamowienia}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Zamowienia (nazwa, status, data_zamowienia) VALUES (?, ?, ?)',
        [nazwa, status || 'Nowe', formatDateToEuropean(data_zamowienia) || todayEuropean()]
    );
    return result.lastID;
}

export async function getAllOrders() {
    const db = await getDb();
    return db.all(`
        SELECT z.*,
               (SELECT COUNT(*) FROM Zamowienia_Leki zl WHERE zl.id_zamowienia = z.id)   AS leki_count,
               (SELECT COUNT(*) FROM Zamowienia_Sprzet zs WHERE zs.id_zamowienia = z.id) AS sprzet_count
        FROM Zamowienia z
        ORDER BY ${sortableDate('z.data_zamowienia')} DESC, z.id DESC
    `);
}

export async function getOrderById(id) {
    const db = await getDb();

    const order = await db.get('SELECT * FROM Zamowienia WHERE id = ?', [id]);
    if (!order) return null;

    const leki = await db.all(`
        SELECT zi.*, l.nazwa_leku, l.opakowanie, l.id_kategorii, l.id_pod_kategorii, l.id_pod_pod_kategorii
        FROM Zamowienia_Leki zi
                 JOIN Leki l ON zi.id_leku = l.id
        WHERE zi.id_zamowienia = ?
        ORDER BY zi.id
    `, [id]);

    const sprzet = await db.all(`
        SELECT zi.*, s.nazwa AS nazwa_sprzetu, s.id_kategorii, s.id_pod_kategorii
        FROM Zamowienia_Sprzet zi
                 JOIN Sprzet s ON zi.id_sprzetu = s.id
        WHERE zi.id_zamowienia = ?
        ORDER BY zi.id
    `, [id]);

    return {...order, leki, sprzet};
}

const isBlank = (value) => value === null || value === undefined || String(value).trim() === '' || value === '0';

/** Statuses an order may move to after delivery without undoing the received stock. */
export const KEEPS_RECEIPT = ['Przyjęte', 'Zakończone'];

const ITEM_TABLES = [
    // order item table, stock table, item FK, stock column, history column
    {items: 'Zamowienia_Leki', stock: 'Leki', fk: 'id_leku', qty: 'ilosc_wstepna', history: 'important_status'},
    {items: 'Zamowienia_Sprzet', stock: 'Sprzet', fk: 'id_sprzetu', qty: 'ilosc_aktualna', history: 'status'},
];

/**
 * Received delivery: add the ordered quantity to stock and record "<qty>x<expiry>" in the history field.
 * The main expiry date is only replaced when the item had no stock or no date.
 * What changed is stored on the order item so the receipt can be undone exactly.
 */
async function receiveOrder(db, orderId) {
    for (const t of ITEM_TABLES) {
        for (const item of await db.all(`SELECT * FROM ${t.items} WHERE id_zamowienia = ?`, [orderId])) {
            const current = await db.get(`SELECT * FROM ${t.stock} WHERE id = ?`, [item[t.fk]]);
            if (!current) continue;
            const expiry = formatDateToEuropean(item.data_waznosci);
            const hasExpiry = !isBlank(expiry);
            const replaceExpiry = hasExpiry && (isBlank(current[t.qty]) || current[t.qty] === 0 || isBlank(current.data_waznosci));
            const entry = hasExpiry ? `${item.ilosc}x${expiry}` : '';
            let history = current[t.history] || '';
            if (entry) history = isBlank(current[t.history]) ? entry : `${current[t.history]}; ${entry}`;

            await db.run(
                `UPDATE ${t.stock} SET ${t.qty} = COALESCE(${t.qty}, 0) + ?, data_waznosci = ?, ${t.history} = ? WHERE id = ?`,
                [item.ilosc, replaceExpiry ? expiry : current.data_waznosci, history, current.id]
            );
            await db.run(
                `UPDATE ${t.items} SET przyjeta_ilosc = ?, przyjety_wpis = ?, przed_przyjeciem_data = ?, zmieniono_date = ? WHERE id = ?`,
                [item.ilosc, entry, current.data_waznosci, replaceExpiry ? 1 : 0, item.id]
            );
        }
    }
    await db.run('UPDATE Zamowienia SET data_przyjecia = ? WHERE id = ?', [todayEuropean(), orderId]);
}

/** Remove the last occurrence of a "; "-separated history entry. */
function removeHistoryEntry(history, entry) {
    if (!history || !entry) return history;
    const parts = history.split('; ');
    const i = parts.lastIndexOf(entry);
    if (i === -1) return history;
    parts.splice(i, 1);
    return parts.length ? parts.join('; ') : null;
}

/** Undo receiveOrder: take the quantity back off, drop the history entry, restore the replaced expiry date. */
async function undoReceipt(db, orderId) {
    for (const t of ITEM_TABLES) {
        for (const item of await db.all(`SELECT * FROM ${t.items} WHERE id_zamowienia = ? AND przyjeta_ilosc IS NOT NULL`, [orderId])) {
            const current = await db.get(`SELECT * FROM ${t.stock} WHERE id = ?`, [item[t.fk]]);
            if (current) {
                const receiptExpiry = item.przyjety_wpis ? item.przyjety_wpis.slice(item.przyjety_wpis.indexOf('x') + 1) : null;
                // Restore the date only if nobody changed it after the delivery.
                const restoreDate = item.zmieniono_date === 1 && current.data_waznosci === receiptExpiry;
                await db.run(
                    `UPDATE ${t.stock} SET ${t.qty} = COALESCE(${t.qty}, 0) - ?, data_waznosci = ?, ${t.history} = ? WHERE id = ?`,
                    [item.przyjeta_ilosc, restoreDate ? item.przed_przyjeciem_data : current.data_waznosci,
                        removeHistoryEntry(current[t.history], item.przyjety_wpis), current.id]
                );
            }
            await db.run(
                `UPDATE ${t.items} SET przyjeta_ilosc = NULL, przyjety_wpis = NULL, przed_przyjeciem_data = NULL, zmieniono_date = NULL WHERE id = ?`,
                [item.id]
            );
        }
    }
    await db.run('UPDATE Zamowienia SET data_przyjecia = NULL WHERE id = ?', [orderId]);
}

/**
 * Change order status. Stock is added once, on the first "Przyjęte".
 * Leaving a received order for anything but "Przyjęte"/"Zakończone" requires undoReceipt=true.
 * Returns 'not_found' | 'received' (blocked) | 'ok'.
 */
export async function updateOrderStatus(orderId, newStatus, {undoReceipt: undo = false} = {}) {
    const db = await getDb();

    const order = await db.get('SELECT status, data_przyjecia FROM Zamowienia WHERE id = ?', [orderId]);
    if (!order) return 'not_found';
    const received = order.data_przyjecia != null;
    const leavesReceipt = received && !KEEPS_RECEIPT.includes(newStatus);
    if (leavesReceipt && !undo) return 'received';

    await inTransaction(db, async () => {
        await db.run('UPDATE Zamowienia SET status = ? WHERE id = ?', [newStatus, orderId]);

        if (leavesReceipt) await undoReceipt(db, orderId);

        if (newStatus === 'Zamówione') {
            await db.run(`UPDATE Leki SET status = 'Zamówione'
                          WHERE id IN (SELECT id_leku FROM Zamowienia_Leki WHERE id_zamowienia = ?)`, [orderId]);
            await db.run(`UPDATE Sprzet SET ilosc_termin = 'Zamówione'
                          WHERE id IN (SELECT id_sprzetu FROM Zamowienia_Sprzet WHERE id_zamowienia = ?)`, [orderId]);
        }

        if (newStatus === 'Przyjęte' && !received) await receiveOrder(db, orderId);
    });

    return 'ok';
}

/** Name, date and notes of an order; fields not sent keep their value. Returns number of updated rows. */
export async function updateOrderDetails(id, {nazwa, data_zamowienia, uwagi}) {
    const db = await getDb();
    const result = await db.run(
        `UPDATE Zamowienia
         SET nazwa = COALESCE(NULLIF(TRIM(?), ''), nazwa), data_zamowienia = COALESCE(NULLIF(?, ''), data_zamowienia),
             uwagi = COALESCE(?, uwagi)
         WHERE id = ?`,
        [nazwa ?? null, formatDateToEuropean(data_zamowienia) ?? null, uwagi ?? null, id]
    );
    return result.changes;
}

export async function addMedicineToOrder({id_zamowienia, id_leku, ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Zamowienia_Leki (id_zamowienia, id_leku, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_leku, ilosc, uwagi || '', formatDateToEuropean(data_waznosci)]
    );
    return result.lastID;
}

export async function addEquipmentToOrder({id_zamowienia, id_sprzetu, ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Zamowienia_Sprzet (id_zamowienia, id_sprzetu, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_sprzetu, ilosc, uwagi || '', formatDateToEuropean(data_waznosci)]
    );
    return result.lastID;
}

export async function removeMedicineFromOrder(orderItemId) {
    const db = await getDb();
    return (await db.run('DELETE FROM Zamowienia_Leki WHERE id = ?', [orderItemId])).changes;
}

export async function removeEquipmentFromOrder(orderItemId) {
    const db = await getDb();
    return (await db.run('DELETE FROM Zamowienia_Sprzet WHERE id = ?', [orderItemId])).changes;
}

/** Deletes the order with its items and recomputes item statuses. Returns number of deleted orders. */
export async function deleteOrder(orderId) {
    const db = await getDb();
    const deleted = await inTransaction(db, async () => {
        await db.run('DELETE FROM Zamowienia_Leki WHERE id_zamowienia = ?', [orderId]);
        await db.run('DELETE FROM Zamowienia_Sprzet WHERE id_zamowienia = ?', [orderId]);
        return (await db.run('DELETE FROM Zamowienia WHERE id = ?', [orderId])).changes;
    });
    if (deleted) await updateStatusTrigger();
    return deleted;
}

export async function updateMedicineInOrder(orderItemId, {ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'UPDATE Zamowienia_Leki SET ilosc = ?, uwagi = ?, data_waznosci = ? WHERE id = ?',
        [ilosc, uwagi || null, formatDateToEuropean(data_waznosci), orderItemId]
    );
    return result.changes;
}

export async function updateEquipmentInOrder(orderItemId, {ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'UPDATE Zamowienia_Sprzet SET ilosc = ?, uwagi = ?, data_waznosci = ? WHERE id = ?',
        [ilosc, uwagi || null, formatDateToEuropean(data_waznosci), orderItemId]
    );
    return result.changes;
}
