// backend/db/orderQueries.js
import {getDb} from './index.js';
import {formatDateToEuropean} from './utils.js';
import {updateStatusTrigger} from './schema.js';

// Order management queries
export async function createOrder(orderData) {
    const db = await getDb();
    const { nazwa, status, data_zamowienia } = orderData;

    const result = await db.run(
        'INSERT INTO Zamowienia (nazwa, status, data_zamowienia) VALUES (?, ?, ?)',
        [nazwa, status || 'Nowe', data_zamowienia || new Date().toLocaleDateString('pl-PL')]
    );

    return result.lastID;
}

export async function getAllOrders() {
    const db = await getDb();

    const sql = `
        SELECT
            z.*,
            COALESCE(leki_count.count, 0) as leki_count,
            COALESCE(sprzet_count.count, 0) as sprzet_count
        FROM Zamowienia z
                 LEFT JOIN (
            SELECT id_zamowienia, COUNT(*) as count
            FROM Zamowienia_Leki
            GROUP BY id_zamowienia
        ) leki_count ON z.id = leki_count.id_zamowienia
                 LEFT JOIN (
            SELECT id_zamowienia, COUNT(*) as count
            FROM Zamowienia_Sprzet
            GROUP BY id_zamowienia
        ) sprzet_count ON z.id = sprzet_count.id_zamowienia
        ORDER BY z.data_zamowienia DESC
    `;

    return await db.all(sql);
}

// Get order by ID with items
export async function getOrderById(id) {
    const db = await getDb();

    try {
        // Get the order
        const order = await db.get(`
            SELECT * FROM Zamowienia WHERE id = ?
        `, [id]);

        if (!order) return null;

        // Get medicine items
        const medicineItems = await db.all(`
            SELECT zi.*, l.nazwa_leku, l.opakowanie, l.id_kategorii, l.id_pod_kategorii, l.id_pod_pod_kategorii
            FROM Zamowienia_Leki zi
                     JOIN Leki l ON zi.id_leku = l.id
            WHERE zi.id_zamowienia = ?
        `, [id]);

        // Get equipment items - FIX: use correct column name
        const equipmentItems = await db.all(`
            SELECT zi.*, s.nazwa as nazwa_sprzetu, s.id_kategorii, s.id_pod_kategorii
            FROM Zamowienia_Sprzet zi
                     JOIN Sprzet s ON zi.id_sprzetu = s.id
            WHERE zi.id_zamowienia = ?
        `, [id]);

        return {
            ...order,
            leki: medicineItems,
            sprzet: equipmentItems
        };
    } catch (error) {
        console.error("Error retrieving order by ID:", error);
        throw error;
    }
}

export async function updateOrderStatus(orderId, newStatus) {
    const db = await getDb();

    await db.run(
        'UPDATE Zamowienia SET status = ? WHERE id = ?',
        [newStatus, orderId]
    );

    // If status is "Zamówione", update product statuses
    if (newStatus === 'Zamówione') {
        // Update medicine statuses
        await db.run(`
      UPDATE Leki
      SET status = 'Zamówione'
      WHERE id IN (
        SELECT id_leku FROM Zamowienia_Leki WHERE id_zamowienia = ?
      ) AND status = 'Do zamówienia'
    `, [orderId]);

        // Update equipment statuses
        await db.run(`
      UPDATE Sprzet
      SET ilosc_termin = 'Zamówione'
      WHERE id IN (
        SELECT id_sprzetu FROM Zamowienia_Sprzet WHERE id_zamowienia = ?
      ) AND ilosc_termin = 'Do zamówienia'
    `, [orderId]);
    }

    if (newStatus === 'Przyjęte') {
        const medicines = await db.all(
            'SELECT * FROM Zamowienia_Leki WHERE id_zamowienia = ?',
            [orderId]
        );

        for (const medicine of medicines) {
            const currentMedicine = await db.get(
                'SELECT * FROM Leki WHERE id = ?',
                [medicine.id_leku]
            );

            const formattedNewExpDate = formatDateToEuropean(medicine.data_waznosci);

            const hasExpDate = medicine.data_waznosci && medicine.data_waznosci.trim() !== '';

            const shouldUpdateExpDate = hasExpDate &&
                (currentMedicine.ilosc_wstepna === 0 ||
                 currentMedicine.ilosc_wstepna === null ||
                 currentMedicine.ilosc_wstepna === '' ||
                 !currentMedicine.data_waznosci ||
                 currentMedicine.data_waznosci.trim() === '');

            // Update important_status with the expiry date regardless of quantity
            let newImportantStatus;

            if (hasExpDate) {
                if (!currentMedicine.important_status || currentMedicine.important_status === '' || currentMedicine.important_status === '0') {
                    newImportantStatus = `${medicine.ilosc}x${formattedNewExpDate}`;
                } else {
                    newImportantStatus = `${currentMedicine.important_status}; ${medicine.ilosc}x${formattedNewExpDate}`;
                }
            } else {
                newImportantStatus = currentMedicine.important_status || '';
            }

            await db.run(`
                UPDATE Leki
                SET ilosc_wstepna    = ilosc_wstepna + ?,
                    data_waznosci    = CASE
                                           WHEN ? THEN ?
                                           ELSE data_waznosci
                        END,
                    important_status = ?
                WHERE id = ?
            `, [
                medicine.ilosc,                    // 1. Add to ilosc_wstepna
                shouldUpdateExpDate ? 1 : 0,       // 2. Boolean condition for updating expiry date
                formattedNewExpDate,               // 3. New expiration date if condition is true
                newImportantStatus,                // 4. Updated important_status
                medicine.id_leku                   // 5. WHERE clause
            ]);
        }

        // Update equipment quantities
        const equipment = await db.all(
            'SELECT * FROM Zamowienia_Sprzet WHERE id_zamowienia = ?',
            [orderId]
        );

        for (const item of equipment) {
            // Fetch current equipment data to get original values
            const currentEquipment = await db.get(
                'SELECT * FROM Sprzet WHERE id = ?',
                [item.id_sprzetu]
            );


            const hasExpDate = item.data_waznosci && item.data_waznosci.trim() !== '';

            const shouldUpdateExpDate = hasExpDate &&
                (currentEquipment.ilosc_aktualna === 0 ||
                 currentEquipment.ilosc_aktualna === null ||
                 currentEquipment.ilosc_aktualna === '' ||
                 !currentEquipment.data_waznosci ||
                 currentEquipment.data_waznosci.trim() === '');

            let newStatus;

            if (hasExpDate) {
                if (!currentEquipment.status || currentEquipment.status === '' || currentEquipment.status === '0') {
                    newStatus = `${item.ilosc}x${item.data_waznosci}`;
                } else {
                    newStatus = `${currentEquipment.status}; ${item.ilosc}x${item.data_waznosci}`;
                }
            } else {
                newStatus = currentEquipment.status || '';
            }

            await db.run(`
                UPDATE Sprzet
                SET ilosc_aktualna = ilosc_aktualna + ?,
                    data_waznosci  = CASE
                                         WHEN ? THEN ?
                                         ELSE data_waznosci
                        END,
                    status         = ?
                WHERE id = ?
            `, [
                item.ilosc,
                shouldUpdateExpDate ? 1 : 0,       // Boolean condition for updating expiry date
                item.data_waznosci,
                newStatus,                         // Updated status
                item.id_sprzetu
            ]);
        }
    }

    return true;
}

// Order items management
export async function addMedicineToOrder(orderItemData) {
    const db = await getDb();
    const { id_zamowienia, id_leku, ilosc, uwagi, data_waznosci } = orderItemData;

    const result = await db.run(
        'INSERT INTO Zamowienia_Leki (id_zamowienia, id_leku, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_leku, ilosc, uwagi || '', data_waznosci]
    );

    return result.lastID;
}

export async function addEquipmentToOrder(orderItemData) {
    const db = await getDb();
    const { id_zamowienia, id_sprzetu, ilosc, uwagi , data_waznosci } = orderItemData;

    const result = await db.run(
        'INSERT INTO Zamowienia_Sprzet (id_zamowienia, id_sprzetu, ilosc, uwagi, data_waznosci) VALUES (?, ?, ?, ?, ?)',
        [id_zamowienia, id_sprzetu, ilosc, uwagi || '', data_waznosci]
    );

    return result.lastID;
}

export async function removeMedicineFromOrder(orderItemId) {
    const db = await getDb();
    await db.run('DELETE FROM Zamowienia_Leki WHERE id = ?', [orderItemId]);
    return true;
}

export async function removeEquipmentFromOrder(orderItemId) {
    const db = await getDb();
    await db.run('DELETE FROM Zamowienia_Sprzet WHERE id = ?', [orderItemId]);
    return true;
}

export async function deleteOrder(orderId) {
    const db = await getDb();

    await db.run('DELETE FROM Zamowienia_Leki WHERE id_zamowienia = ?', [orderId]);
    await db.run('DELETE FROM Zamowienia_Sprzet WHERE id_zamowienia = ?', [orderId]);
    await db.run('DELETE FROM Zamowienia WHERE id = ?', [orderId]);
    await updateStatusTrigger();
    return true;
}

export async function updateMedicineInOrder(orderItemId, data) {
    const db = await getDb();
    const { ilosc, uwagi, data_waznosci } = data;

    await db.run(
        'UPDATE Zamowienia_Leki SET ilosc = ?, uwagi = ?, data_waznosci = ? WHERE id = ?',
        [ilosc, uwagi || null, data_waznosci, orderItemId]
    );

    return orderItemId;
}

export async function updateEquipmentInOrder(orderItemId, data) {
    const db = await getDb();
    const { ilosc, uwagi, data_waznosci } = data;

    await db.run(
        'UPDATE Zamowienia_Sprzet SET ilosc = ?, uwagi = ?, data_waznosci = ? WHERE id = ?',
        [ilosc, uwagi || null, data_waznosci, orderItemId]
    );

    return orderItemId;
}
