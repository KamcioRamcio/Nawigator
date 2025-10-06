// backend/db/equipmentQueries.js
import {getDb} from './index.js';
import {formatDateToEuropean} from './utils.js';

// Equipment functions
export async function addEquipment(equipmentData) {
    const db = await getDb();

    try {
        equipmentData.eq_data = formatDateToEuropean(equipmentData.eq_data);
        const result = await db.run(
            `INSERT INTO Sprzet (
                nazwa,
                ilosc_wymagana,
                ilosc_aktualna,
                data_waznosci,
                status,
                termin,
                ilosc_termin,
                kto_zmienil,
                id_kategorii,
                id_pod_kategorii,
                na_statku,
                torba_ratownika
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                equipmentData.eq_nazwa,
                equipmentData.eq_ilosc_wymagana,
                equipmentData.eq_ilosc_aktualna,
                equipmentData.eq_data,
                equipmentData.eq_status,
                equipmentData.eq_termin,
                equipmentData.eq_ilosc_termin,
                equipmentData.kto_zmienil || null,
                equipmentData.eq_kategoria || null,
                equipmentData.eq_podkategoria || null,
                equipmentData.eq_na_statku === "true" ? 1 : 0,
                equipmentData.eq_torba_ratownika === "true" ? 1 : 0
            ]
        );

        return result.lastID;
    } catch (error) {
        throw error;
    }
}

export async function fetchEquipmentByCategory() {
    const db = await getDb();

    const sql = `
        SELECT
            ks.id AS kategoria_sprzet_id,
            ks.nazwa AS kategoria_sprzet_nazwa,
            pks.id AS podkategoria_sprzet_id,
            pks.nazwa AS podkategoria_sprzet_nazwa,
            s.id AS sprzet_id,
            s.nazwa AS sprzet_nazwa,
            s.ilosc_wymagana AS sprzet_ilosc_wymagana,
            s.ilosc_aktualna AS sprzet_ilosc_aktualna,
            s.data_waznosci AS sprzet_data_waznosci,
            s.status AS sprzet_status,
            s.termin AS sprzet_termin,
            s.ilosc_termin AS sprzet_ilosc_termin,
            s.kto_zmienil AS sprzet_kto_zmienil,
            s.na_statku AS sprzet_na_statku,
            s.torba_ratownika AS sprzet_torba_ratownika,
            s.id_kategorii,
            s.id_pod_kategorii
        FROM Sprzet s
                 LEFT JOIN Kategorie_sprzet ks ON s.id_kategorii = ks.id
                 LEFT JOIN Pod_kategorie_sprzet pks ON s.id_pod_kategorii = pks.id
        ORDER BY kategoria_sprzet_id, podkategoria_sprzet_id, sprzet_id
    `;

    const rows = await db.all(sql);

    const groupedData = rows.reduce((result, row) => {
        const kategoriaNazwa = row.kategoria_sprzet_nazwa || 'Uncategorized';
        const podkategoriaNazwa = row.podkategoria_sprzet_nazwa || 'null';

        if (!result[kategoriaNazwa]) {
            result[kategoriaNazwa] = {};
        }

        if (!result[kategoriaNazwa][podkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa] = [];
        }

        const isSprzetAlreadyAdded = result[kategoriaNazwa][podkategoriaNazwa]
            .some(sprzet => sprzet.sprzet_id === row.sprzet_id);

        if (!isSprzetAlreadyAdded && row.sprzet_id) {
            result[kategoriaNazwa][podkategoriaNazwa].push({
                sprzet_id: row.sprzet_id,
                sprzet_nazwa: row.sprzet_nazwa,
                sprzet_ilosc_wymagana: row.sprzet_ilosc_wymagana,
                sprzet_ilosc_aktualna: row.sprzet_ilosc_aktualna,
                sprzet_data_waznosci: row.sprzet_data_waznosci,
                sprzet_status: row.sprzet_status,
                sprzet_termin: row.sprzet_termin,
                sprzet_ilosc_termin: row.sprzet_ilosc_termin,
                sprzet_kto_zmienil: row.sprzet_kto_zmienil,
                sprzet_na_statku: row.sprzet_na_statku,
                sprzet_torba_ratownika: row.sprzet_torba_ratownika,
                id_kategorii: row.id_kategorii,
                id_pod_kategorii: row.id_pod_kategorii
            });
        }

        return result;
    }, {});

    return groupedData;
}

export async function fetchEquipmentsByDate(date) {
    const db = await getDb();

    const sql = `
        SELECT
            e.id,
            e.nazwa,
            e.data_waznosci,
            e.ilosc_wymagana,
            e.ilosc_aktualna,
            e.termin as current_termin,
            CASE
                WHEN datetime(substr(e.data_waznosci, 7, 4) || '-' || substr(e.data_waznosci, 4, 2) || '-' || substr(e.data_waznosci, 1, 2)) < datetime(?) THEN 'Przeterminowane'
                WHEN datetime(substr(e.data_waznosci, 7, 4) || '-' || substr(e.data_waznosci, 4, 2) || '-' || substr(e.data_waznosci, 1, 2)) <= datetime(?, '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN datetime(substr(e.data_waznosci, 7, 4) || '-' || substr(e.data_waznosci, 4, 2) || '-' || substr(e.data_waznosci, 1, 2)) <= datetime(?, '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
                END AS projected_termin
        FROM Sprzet e
        WHERE e.data_waznosci IS NOT NULL
          AND projected_termin != 'Ważny' AND projected_termin != current_termin
        ORDER BY datetime(substr(e.data_waznosci, 7, 4) || '-' || substr(e.data_waznosci, 4, 2) || '-' || substr(e.data_waznosci, 1, 2)) ASC
    `;
    return await db.all(sql, [date, date, date]);
}

export async function updateEquipment(id, equipmentData) {
    const db = await getDb();

    try {
        // First get the current data
        equipmentData.sprzet_data_waznosci = formatDateToEuropean(equipmentData.sprzet_data_waznosci);

        const currentEquipment = await db.get('SELECT * FROM Sprzet WHERE id = ?', [id]);

        // Handle boolean values - preserve existing ones unless explicitly changed
        const na_statku = equipmentData.sprzet_na_statku !== undefined
            ? (equipmentData.sprzet_na_statku === true || equipmentData.sprzet_na_statku === "true" ? 1 : 0)
            : currentEquipment.na_statku;

        const torba_ratownika = equipmentData.sprzet_torba_ratownika !== undefined
            ? (equipmentData.sprzet_torba_ratownika === true || equipmentData.sprzet_torba_ratownika === "true" ? 1 : 0)
            : currentEquipment.torba_ratownika;

        await db.run(
            `UPDATE Sprzet SET
                               nazwa = ?,
                               ilosc_wymagana = ?,
                               ilosc_aktualna = ?,
                               data_waznosci = ?,
                               status = ?,
                               termin = ?,
                               ilosc_termin = ?,
                               kto_zmienil = ?,
                               id_kategorii = ?,
                               id_pod_kategorii = ?,
                               na_statku = ?,
                               torba_ratownika = ?
             WHERE id = ?`,
            [
                equipmentData.sprzet_nazwa ,
                equipmentData.sprzet_ilosc_wymagana ,
                equipmentData.sprzet_ilosc_aktualna ,
                equipmentData.sprzet_data_waznosci ,
                equipmentData.sprzet_status ,
                equipmentData.sprzet_termin,
                equipmentData.sprzet_ilosc_termin,
                equipmentData.sprzet_kto_zmienil,
                equipmentData.id_kategorii !== undefined ? equipmentData.id_kategorii : currentEquipment.id_kategorii,
                equipmentData.id_pod_kategorii !== undefined ? equipmentData.id_pod_kategorii : currentEquipment.id_pod_kategorii,
                na_statku,
                torba_ratownika,
                id
            ]
        );

        return id;
    } catch (error) {
        throw error;
    }
}

export async function deleteEquipment(id) {
    const db = await getDb();

    try {
        await db.run('DELETE FROM Sprzet WHERE id = ?', [id]);
        return {message: 'Equipment deleted successfully'};
    } catch (error) {
        throw error;
    }
}

// Organized Equipment functions
export async function addOrganizedEquipment(data) {
    const db = await getDb();

    const result = await db.run(
        'INSERT INTO Sprzet_zgrany_spis (nazwa_sprzetu, data_waznosci, ilosc, na_statku_spis_podstawowy, kto_zmienil, id_kategorii, id_pod_kategorii) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.nazwa_sprzetu, data.data_waznosci, data.ilosc, data.na_statku, data.kto_zmienil ,data.id_kategorii, data.id_pod_kategorii]
    );
    return result.lastID;
}

export async function updateOrganizedEquipment(id, data) {
    const db = await getDb();

    const currentEquipment = await db.get(
        'SELECT * FROM Sprzet_zgrany_spis WHERE id = ?',
        [id]
    );

    const updateData = {
        nazwa_sprzetu: data.nazwa_sprzetu || currentEquipment.nazwa_sprzetu,
        data_waznosci: data.data_waznosci || currentEquipment.data_waznosci,
        ilosc: data.ilosc || currentEquipment.ilosc,
        na_statku_spis_podstawowy: data.na_statku !== undefined ? data.na_statku : currentEquipment.na_statku,
        kto_zmienil: data.kto_zmienil || currentEquipment.kto_zmienil,

        id_kategorii: data.id_kategorii !== undefined ? data.id_kategorii : currentEquipment.id_kategorii,
        id_pod_kategorii: data.id_pod_kategorii !== undefined ? data.id_pod_kategorii : currentEquipment.id_pod_kategorii
    };

    await db.run(
        'UPDATE Sprzet_zgrany_spis SET nazwa_sprzetu = ?, data_waznosci = ?, ilosc = ?, na_statku_spis_podstawowy = ?, kto_zmienil = ?, id_kategorii = ?, id_pod_kategorii = ? WHERE id = ?',
        [updateData.nazwa_sprzetu, updateData.data_waznosci, updateData.ilosc, updateData.na_statku_spis_podstawowy, updateData.kto_zmienil, updateData.id_kategorii, updateData.id_pod_kategorii, id]
    );

    return id;
}

export async function deleteOrganizedEquipment(id) {
    const db = await getDb();
    await db.run('DELETE FROM Sprzet_zgrany_spis WHERE id = ?', [id]);
    return {message: 'Organized equipment deleted successfully'};
}

export async function fetchOrganizedEquipmentByCategory() {
    const db = await getDb();

    const sql = `
        SELECT kategorie_sprzet.id         AS kategoria_sprzet_id,
               kategorie_sprzet.nazwa      AS kategoria_sprzet_nazwa,
               pod_kategorie_sprzet.id     AS podkategoria_sprzet_id,
               pod_kategorie_sprzet.nazwa  AS podkategoria_sprzet_nazwa,
               sprzet_zgrany.id            AS sprzet_zgrany_id,
               sprzet_zgrany.nazwa_sprzetu AS sprzet_zgrany_nazwa,
               sprzet_zgrany.data_waznosci AS sprzet_zgrany_data_waznosci,
               sprzet_zgrany.ilosc         AS sprzet_zgrany_ilosc,
               sprzet_zgrany.na_statku_spis_podstawowy     AS sprzet_zgrany_na_statku,
               sprzet_zgrany.kto_zmienil   AS sprzet_zgrany_kto_zmienil
        FROM Sprzet_zgrany_spis sprzet_zgrany
                 LEFT JOIN Kategorie_sprzet kategorie_sprzet ON sprzet_zgrany.id_kategorii = kategorie_sprzet.id
                 LEFT JOIN Pod_kategorie_sprzet pod_kategorie_sprzet
                           ON sprzet_zgrany.id_pod_kategorii = pod_kategorie_sprzet.id
        ORDER BY kategoria_sprzet_id, podkategoria_sprzet_id, sprzet_zgrany_id
    `;

    const rows = await db.all(sql);

    const groupedData = rows.reduce((result, row) => {
        const kategoriaNazwa = row.kategoria_sprzet_nazwa || 'Uncategorized';
        const podkategoriaNazwa = row.podkategoria_sprzet_nazwa || 'null';

        if (!result[kategoriaNazwa]) {
            result[kategoriaNazwa] = {};
        }
        if (!result[kategoriaNazwa][podkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa] = [];
        }
        const isSprzetZgranyAlreadyAdded = result[kategoriaNazwa][podkategoriaNazwa]
            .some(sprzet => sprzet.sprzet_zgrany_id === row.sprzet_zgrany_id);

        if (!isSprzetZgranyAlreadyAdded && row.sprzet_zgrany_id) {
            result[kategoriaNazwa][podkategoriaNazwa].push({
                sprzet_zgrany_id: row.sprzet_zgrany_id,
                sprzet_zgrany_nazwa: row.sprzet_zgrany_nazwa,
                sprzet_zgrany_data_waznosci: row.sprzet_zgrany_data_waznosci,
                sprzet_zgrany_ilosc: row.sprzet_zgrany_ilosc,
                sprzet_zgrany_na_statku: row.sprzet_zgrany_na_statku,
                sprzet_zgrany_kto_zmienil: row.sprzet_zgrany_kto_zmienil,
            });
        }
        return result;
    }, {});

    return groupedData;
}
