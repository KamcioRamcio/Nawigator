// backend/db/utilizationQueries.js
import {getDb} from './index.js';

// Utilization management functions
export async function fetchAllUtylizacja() {
    const db = await getDb();
    return await db.all('SELECT * FROM Utylizacja');
}

export async function createUtilization(utilizationData) {
    const db = await getDb();
    const { nazwa, status, data_utworzenia, uwagi, kto_utworzyl } = utilizationData;

    const result = await db.run(
        'INSERT INTO Utylizacje (nazwa, status, data_utworzenia, uwagi, kto_utworzyl) VALUES (?, ?, ?, ?, ?)',
        [nazwa, status || 'Nowa', data_utworzenia || new Date().toLocaleDateString('pl-PL'), uwagi, kto_utworzyl]
    );

    return result.lastID;
}

export async function getAllUtilizations() {
    const db = await getDb();

    const sql = `
        SELECT
            u.*,
            COALESCE(leki_count.count, 0) as leki_count,
            COALESCE(sprzet_count.count, 0) as sprzet_count
        FROM Utylizacje u
                 LEFT JOIN (
            SELECT id_utylizacji, COUNT(*) as count
            FROM Utylizacje_Leki
            GROUP BY id_utylizacji
        ) leki_count ON u.id = leki_count.id_utylizacji
                 LEFT JOIN (
            SELECT id_utylizacji, COUNT(*) as count
            FROM Utylizacje_Sprzet
            GROUP BY id_utylizacji
        ) sprzet_count ON u.id = sprzet_count.id_utylizacji
        ORDER BY u.data_utworzenia DESC
    `;

    return await db.all(sql);
}

export async function getUtilizationById(id) {
    const db = await getDb();

    try {
        // Get the utilization
        const utilization = await db.get(`
            SELECT * FROM Utylizacje WHERE id = ?
        `, [id]);

        if (!utilization) return null;

        // Get medicine items
        const medicineItems = await db.all(`
            SELECT ul.*, l.nazwa_leku, l.opakowanie, l.id_kategorii, l.id_pod_kategorii, l.id_pod_pod_kategorii
            FROM Utylizacje_Leki ul
                     LEFT JOIN Leki l ON ul.id_leku = l.id
            WHERE ul.id_utylizacji = ?
        `, [id]);

        // Get equipment items
        const equipmentItems = await db.all(`
            SELECT us.*, s.nazwa as nazwa_sprzetu, s.id_kategorii, s.id_pod_kategorii
            FROM Utylizacje_Sprzet us
                     LEFT JOIN Sprzet s ON us.id_sprzetu = s.id
            WHERE us.id_utylizacji = ?
        `, [id]);

        return {
            ...utilization,
            leki: medicineItems,
            sprzet: equipmentItems
        };
    } catch (error) {
        console.error("Error retrieving utilization by ID:", error);
        throw error;
    }
}

export async function updateUtilizationStatus(utilizationId, newStatus) {
    const db = await getDb();

    await db.run(
        'UPDATE Utylizacje SET status = ? WHERE id = ?',
        [newStatus, utilizationId]
    );

    return true;
}

export async function updateUtilizationDetails(id, utilizationData) {
    const db = await getDb();
    const { nazwa, status, data_utworzenia, uwagi } = utilizationData;

    await db.run(
        'UPDATE Utylizacje SET nazwa = ?, status = ?, data_utworzenia = ?, uwagi = ? WHERE id = ?',
        [nazwa, status, data_utworzenia, uwagi, id]
    );

    return id;
}

// Utilization items management
export async function addMedicineToUtilization(utilizationItemData) {
    const db = await getDb();
    const { id_utylizacji, id_leku, ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie, nazwa_leku } = utilizationItemData;

    const result = await db.run(
        'INSERT INTO Utylizacje_Leki (id_utylizacji, id_leku, ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie, nazwa_leku) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id_utylizacji, id_leku, ilosc, uwagi || '', data_waznosci, powod_utylizacji || '', ilosc_nominalna, opakowanie, nazwa_leku]
    );

    return result.lastID;
}

export async function addEquipmentToUtilization(utilizationItemData) {
    const db = await getDb();
    const { id_utylizacji, id_sprzetu, ilosc, uwagi, data_waznosci, powod_utylizacji, nazwa_sprzetu } = utilizationItemData;

    const result = await db.run(
        'INSERT INTO Utylizacje_Sprzet (id_utylizacji, id_sprzetu, ilosc, uwagi, data_waznosci, powod_utylizacji, nazwa_sprzetu) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id_utylizacji, id_sprzetu, ilosc, uwagi || '', data_waznosci, powod_utylizacji || '', nazwa_sprzetu]
    );

    return result.lastID;
}

export async function updateMedicineInUtilization(utilizationItemId, data) {
    const db = await getDb();
    const { ilosc, uwagi, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie } = data;

    await db.run(
        'UPDATE Utylizacje_Leki SET ilosc = ?, uwagi = ?, data_waznosci = ?, powod_utylizacji = ?, ilosc_nominalna = ?, opakowanie = ? WHERE id = ?',
        [ilosc, uwagi || null, data_waznosci, powod_utylizacji, ilosc_nominalna, opakowanie, utilizationItemId]
    );

    return utilizationItemId;
}

export async function updateEquipmentInUtilization(utilizationItemId, data) {
    const db = await getDb();
    const { ilosc, uwagi, data_waznosci, powod_utylizacji } = data;

    await db.run(
        'UPDATE Utylizacje_Sprzet SET ilosc = ?, uwagi = ?, data_waznosci = ?, powod_utylizacji = ? WHERE id = ?',
        [ilosc, uwagi || null, data_waznosci, powod_utylizacji, utilizationItemId]
    );

    return utilizationItemId;
}

export async function removeMedicineFromUtilization(utilizationItemId) {
    const db = await getDb();
    await db.run('DELETE FROM Utylizacje_Leki WHERE id = ?', [utilizationItemId]);
    return true;
}

export async function removeEquipmentFromUtilization(utilizationItemId) {
    const db = await getDb();
    await db.run('DELETE FROM Utylizacje_Sprzet WHERE id = ?', [utilizationItemId]);
    return true;
}

export async function deleteUtilizationComplete(utilizationId) {
    const db = await getDb();

    await db.run('DELETE FROM Utylizacje_Leki WHERE id_utylizacji = ?', [utilizationId]);
    await db.run('DELETE FROM Utylizacje_Sprzet WHERE id_utylizacji = ?', [utilizationId]);
    await db.run('DELETE FROM Utylizacje WHERE id = ?', [utilizationId]);

    return true;
}
