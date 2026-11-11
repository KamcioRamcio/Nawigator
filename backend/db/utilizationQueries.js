// backend/db/utilizationQueries.js
import {getDb} from './index.js';
import {formatDateToEuropean, todayEuropean, sortableDate, inTransaction} from './utils.js';

export async function createUtilization({nazwa, status, data_utworzenia, uwagi, kto_utworzyl}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO Utylizacje (nazwa, status, data_utworzenia, uwagi, kto_utworzyl) VALUES (?, ?, ?, ?, ?)',
        [nazwa, status || 'Nowa', formatDateToEuropean(data_utworzenia) || todayEuropean(), uwagi ?? null, kto_utworzyl ?? null]
    );
    return result.lastID;
}

export async function getAllUtilizations() {
    const db = await getDb();
    return db.all(`
        SELECT u.*,
               (SELECT COUNT(*) FROM Utylizacje_Leki ul WHERE ul.id_utylizacji = u.id)   AS leki_count,
               (SELECT COUNT(*) FROM Utylizacje_Sprzet us WHERE us.id_utylizacji = u.id) AS sprzet_count
        FROM Utylizacje u
        ORDER BY ${sortableDate('u.data_utworzenia')} DESC, u.id DESC
    `);
}

export async function getUtilizationById(id) {
    const db = await getDb();

    const utilization = await db.get('SELECT * FROM Utylizacje WHERE id = ?', [id]);
    if (!utilization) return null;

    // LEFT JOIN: items keep their copied name even if the medicine/equipment was deleted later.
    const leki = await db.all(`
        SELECT ul.*, COALESCE(l.nazwa_leku, ul.nazwa_leku) AS nazwa_leku, COALESCE(l.opakowanie, ul.opakowanie) AS opakowanie,
               l.id_kategorii, l.id_pod_kategorii, l.id_pod_pod_kategorii
        FROM Utylizacje_Leki ul
                 LEFT JOIN Leki l ON ul.id_leku = l.id
        WHERE ul.id_utylizacji = ?
        ORDER BY ul.id
    `, [id]);

    const sprzet = await db.all(`
        SELECT us.*, COALESCE(s.nazwa, us.nazwa_sprzetu) AS nazwa_sprzetu, s.id_kategorii, s.id_pod_kategorii
        FROM Utylizacje_Sprzet us
                 LEFT JOIN Sprzet s ON us.id_sprzetu = s.id
        WHERE us.id_utylizacji = ?
        ORDER BY us.id
    `, [id]);

    return {...utilization, leki, sprzet};
}

export async function updateUtilizationStatus(utilizationId, newStatus) {
    const db = await getDb();
    return (await db.run('UPDATE Utylizacje SET status = ? WHERE id = ?', [newStatus, utilizationId])).changes;
}

/** Fields not sent keep their value. */
export async function updateUtilizationDetails(id, {nazwa, status, data_utworzenia, uwagi}) {
    const db = await getDb();
    const result = await db.run(
        `UPDATE Utylizacje
         SET nazwa = ?, status = COALESCE(?, status), data_utworzenia = COALESCE(?, data_utworzenia), uwagi = COALESCE(?, uwagi)
         WHERE id = ?`,
        [nazwa, status ?? null, formatDateToEuropean(data_utworzenia) ?? null, uwagi ?? null, id]
    );
    return result.changes;
}

export async function addMedicineToUtilization(data) {
    const db = await getDb();
    const {id_utylizacji, id_leku, ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie, nazwa_leku} = data;
    const result = await db.run(
        `INSERT INTO Utylizacje_Leki (id_utylizacji, id_leku, ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie, nazwa_leku)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT nazwa_leku FROM Leki WHERE id = ?)))`,
        [id_utylizacji, id_leku ?? null, ilosc, uwagi || '', formatDateToEuropean(data_waznosci) ?? null, powod_utylizacji || '',
            ilosc_nominalna ?? null, opakowanie ?? null, nazwa_leku || null, id_leku ?? null]
    );
    return result.lastID;
}

export async function addEquipmentToUtilization(data) {
    const db = await getDb();
    const {id_utylizacji, id_sprzetu, ilosc, uwagi, data_waznosci, powod_utylizacji, nazwa_sprzetu} = data;
    const result = await db.run(
        `INSERT INTO Utylizacje_Sprzet (id_utylizacji, id_sprzetu, ilosc, uwagi, data_waznosci, powod_utylizacji, nazwa_sprzetu)
         VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, (SELECT nazwa FROM Sprzet WHERE id = ?)))`,
        [id_utylizacji, id_sprzetu ?? null, ilosc, uwagi || '', formatDateToEuropean(data_waznosci) ?? null, powod_utylizacji || '',
            nazwa_sprzetu || null, id_sprzetu ?? null]
    );
    return result.lastID;
}

export async function updateMedicineInUtilization(itemId, {ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie}) {
    const db = await getDb();
    const result = await db.run(
        `UPDATE Utylizacje_Leki
         SET ilosc = ?, uwagi = ?, data_waznosci = COALESCE(?, data_waznosci), powod_utylizacji = COALESCE(?, powod_utylizacji),
             ilosc_nominalna = COALESCE(?, ilosc_nominalna), opakowanie = COALESCE(?, opakowanie)
         WHERE id = ?`,
        [ilosc, uwagi || null, formatDateToEuropean(data_waznosci) ?? null, powod_utylizacji ?? null, ilosc_nominalna ?? null, opakowanie ?? null, itemId]
    );
    return result.changes;
}

export async function updateEquipmentInUtilization(itemId, {ilosc, uwagi, data_waznosci, powod_utylizacji}) {
    const db = await getDb();
    const result = await db.run(
        `UPDATE Utylizacje_Sprzet
         SET ilosc = ?, uwagi = ?, data_waznosci = COALESCE(?, data_waznosci), powod_utylizacji = COALESCE(?, powod_utylizacji)
         WHERE id = ?`,
        [ilosc, uwagi || null, formatDateToEuropean(data_waznosci) ?? null, powod_utylizacji ?? null, itemId]
    );
    return result.changes;
}

export async function removeMedicineFromUtilization(itemId) {
    const db = await getDb();
    return (await db.run('DELETE FROM Utylizacje_Leki WHERE id = ?', [itemId])).changes;
}

export async function removeEquipmentFromUtilization(itemId) {
    const db = await getDb();
    return (await db.run('DELETE FROM Utylizacje_Sprzet WHERE id = ?', [itemId])).changes;
}

export async function deleteUtilizationComplete(utilizationId) {
    const db = await getDb();
    return inTransaction(db, async () => {
        await db.run('DELETE FROM Utylizacje_Leki WHERE id_utylizacji = ?', [utilizationId]);
        await db.run('DELETE FROM Utylizacje_Sprzet WHERE id_utylizacji = ?', [utilizationId]);
        return (await db.run('DELETE FROM Utylizacje WHERE id = ?', [utilizationId])).changes;
    });
}
