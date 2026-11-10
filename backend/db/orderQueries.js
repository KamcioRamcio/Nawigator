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
    `, [id]);

    const sprzet = await db.all(`
        SELECT zi.*, s.nazwa AS nazwa_sprzetu, s.id_kategorii, s.id_pod_kategorii
        FROM Zamowienia_Sprzet zi
                 JOIN Sprzet s ON zi.id_sprzetu = s.id
        WHERE zi.id_zamowienia = ?
    `, [id]);

    return {...order, leki, sprzet};
}

const isBlank = (value) => value === null || value === undefined || String(value).trim() === '' || value === '0';

/**
 * Received delivery: add the ordered quantity to stock and record "<qty>x<expiry>" in the history field.
 * The main expiry date is only replaced when the item had no stock or no date.
 */
function receivedValues(current, item, stockColumn, historyColumn) {
    const expiry = formatDateToEuropean(item.data_waznosci);
    const hasExpiry = !isBlank(expiry);
    const replaceExpiry = hasExpiry && (isBlank(current[stockColumn]) || current[stockColumn] === 0 || isBlank(current.data_waznosci));

    let history = current[historyColumn] || '';
    if (hasExpiry) {
        const entry = `${item.ilosc}x${expiry}`;
        history = isBlank(current[historyColumn]) ? entry : `${current[historyColumn]}; ${entry}`;
    }
    return {expiry: replaceExpiry ? expiry : current.data_waznosci, history};
}

/** Returns false when the order does not exist. */
export async function updateOrderStatus(orderId, newStatus) {
    const db = await getDb();

    const order = await db.get('SELECT status FROM Zamowienia WHERE id = ?', [orderId]);
    if (!order) return false;

    await inTransaction(db, async () => {
        await db.run('UPDATE Zamowienia SET status = ? WHERE id = ?', [newStatus, orderId]);

        if (newStatus === 'Zamówione') {
            await db.run(`UPDATE Leki SET status = 'Zamówione'
                          WHERE id IN (SELECT id_leku FROM Zamowienia_Leki WHERE id_zamowienia = ?)`, [orderId]);
            await db.run(`UPDATE Sprzet SET ilosc_termin = 'Zamówione'
                          WHERE id IN (SELECT id_sprzetu FROM Zamowienia_Sprzet WHERE id_zamowienia = ?)`, [orderId]);
        }

        // Stock is added only on the transition into "Przyjęte", so re-saving the status cannot double it.
        if (newStatus === 'Przyjęte' && order.status !== 'Przyjęte') {
            for (const item of await db.all('SELECT * FROM Zamowienia_Leki WHERE id_zamowienia = ?', [orderId])) {
                const current = await db.get('SELECT * FROM Leki WHERE id = ?', [item.id_leku]);
                if (!current) continue;
                const {expiry, history} = receivedValues(current, item, 'ilosc_wstepna', 'important_status');
                await db.run(
                    `UPDATE Leki SET ilosc_wstepna = COALESCE(ilosc_wstepna, 0) + ?, data_waznosci = ?, important_status = ?
                     WHERE id = ?`,
                    [item.ilosc, expiry, history, item.id_leku]
                );
            }

            for (const item of await db.all('SELECT * FROM Zamowienia_Sprzet WHERE id_zamowienia = ?', [orderId])) {
                const current = await db.get('SELECT * FROM Sprzet WHERE id = ?', [item.id_sprzetu]);
                if (!current) continue;
                const {expiry, history} = receivedValues(current, item, 'ilosc_aktualna', 'status');
                await db.run(
                    `UPDATE Sprzet SET ilosc_aktualna = COALESCE(ilosc_aktualna, 0) + ?, data_waznosci = ?, status = ?
                     WHERE id = ?`,
                    [item.ilosc, expiry, history, item.id_sprzetu]
                );
            }
        }
    });

    return true;
}

export async function addMedicineToOrder({id_zamowienia, id_leku, ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Zamowienia_Leki (id_zamowienia, id_leku, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_leku, ilosc, uwagi || '', data_waznosci]
    );
    return result.lastID;
}

export async function addEquipmentToOrder({id_zamowienia, id_sprzetu, ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Zamowienia_Sprzet (id_zamowienia, id_sprzetu, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_sprzetu, ilosc, uwagi || '', data_waznosci]
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
        [ilosc, uwagi || null, data_waznosci, orderItemId]
    );
    return result.changes;
}

export async function updateEquipmentInOrder(orderItemId, {ilosc, uwagi, data_waznosci}) {
    const db = await getDb();
    const result = await db.run(
        'UPDATE Zamowienia_Sprzet SET ilosc = ?, uwagi = ?, data_waznosci = ? WHERE id = ?',
        [ilosc, uwagi || null, data_waznosci, orderItemId]
    );
    return result.changes;
}
