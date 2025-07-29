// backend/db/queries.js
import {getDb} from './index.js';
import {updateStatusTrigger} from "./schema.js";

function formatDateToEuropean(date) {
    if (!date) return date;

    // Check if already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return date; // Already in correct format
    }

    // Check if in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    }

    // Return original if format is unknown
    return date;
}


// Medicine functions
export async function addMedicine(medicineData) {
    const db = await getDb();

    try {
        medicineData.lek_data = formatDateToEuropean(medicineData.lek_data);
        // Insert into consolidated Leki table
        const result = await db.run(
            `INSERT INTO Leki (
                nazwa_leku,
                ilosc_wstepna,
                opakowanie,
                data_waznosci,
                status_leku,
                ilosc_minimalna,
                rozchod_ilosc,
                status,
                important_status,
                kto_zmienil,
                id_kategorii,
                id_pod_kategorii,
                id_pod_pod_kategorii,
                przechowywanie,
                na_statku_spis_podstawowy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                medicineData.lek_nazwa,
                medicineData.lek_ilosc,
                medicineData.lek_opakowanie,
                medicineData.lek_data,
                medicineData.lek_status,
                medicineData.lek_ilosc_minimalna,
                medicineData.rozchod_ilosc || 0,
                medicineData.stan_magazynowy_status || 'W porządku',
                medicineData.stan_magazynowy_important_status || false,
                medicineData.rozchod_kto_zmienil || null,
                medicineData.lek_kategoria || null,
                medicineData.lek_podkategoria || null,
                medicineData.lek_podpodkategoria || null,
                medicineData.lek_przechowywanie || null,
                medicineData.lek_na_statku_spis_podstawowy || false
            ]
        );

        return result.lastID;
    } catch (error) {
        throw error;
    }
}

export async function updateMedicine(id, medicineData) {
    const db = await getDb();

    try {
        medicineData.lek_data = formatDateToEuropean(medicineData.lek_data);
        await db.run(
            `UPDATE Leki SET
                             nazwa_leku = ?,
                             ilosc_wstepna = ?,
                             opakowanie = ?,
                             data_waznosci = ?,
                             status_leku = ?,
                             ilosc_minimalna = ?,
                             rozchod_ilosc = ?,
                             status = ?,
                             important_status = ?,
                             kto_zmienil = ?,
                             id_kategorii = ?,
                             id_pod_kategorii = ?,
                             id_pod_pod_kategorii = ?,
                             przechowywanie = ?,
                             na_statku_spis_podstawowy = ?
             WHERE id = ?`,
            [
                medicineData.lek_nazwa,
                medicineData.lek_ilosc,
                medicineData.lek_opakowanie,
                medicineData.lek_data,
                medicineData.lek_status,
                medicineData.lek_ilosc_minimalna,
                medicineData.rozchod_ilosc || 0,
                medicineData.stan_magazynowy_status || 'W porządku',
                medicineData.stan_magazynowy_important_status || false,
                medicineData.rozchod_kto_zmienil || null,
                medicineData.id_kategorii || null,
                medicineData.id_pod_kategorii || null,
                medicineData.id_pod_pod_kategorii || null,
                medicineData.lek_przechowywanie || null,
                medicineData.lek_na_statku_spis_podstawowy || false,
                id
            ]
        );
        return id;
    } catch (error) {
        throw error;
    }
}

export async function fetchMedicinesByCategory() {
    const db = await getDb();

    const sql = `
        SELECT
            k.id AS kategoria_id,
            k.nazwa AS kategoria_nazwa,
            pk.id AS podkategoria_id,
            pk.nazwa AS podkategoria_nazwa,
            ppk.id AS podpodkategoria_id,
            ppk.nazwa AS podpodkategoria_nazwa,
            l.id AS lek_id,
            l.nazwa_leku AS lek_nazwa,
            l.ilosc_wstepna AS lek_ilosc,
            l.opakowanie AS lek_opakowanie,
            l.data_waznosci AS lek_data,
            l.status_leku AS lek_status,
            l.ilosc_minimalna AS lek_ilosc_minimalna,
            l.przechowywanie AS lek_przechowywanie,
            l.na_statku_spis_podstawowy AS lek_na_statku_spis_podstawowy,
            l.rozchod_ilosc AS rozchod_ilosc,
            l.kto_zmienil AS rozchod_kto_zmienil,
            (l.ilosc_wstepna - l.rozchod_ilosc) AS stan_magazynowy_ilosc,
            l.status AS stan_magazynowy_status,
            l.important_status AS stan_magazynowy_important_status
        FROM Leki l
                 LEFT JOIN Kategorie k ON l.id_kategorii = k.id
                 LEFT JOIN Pod_kategorie pk ON l.id_pod_kategorii = pk.id
                 LEFT JOIN Pod_pod_kategorie ppk ON l.id_pod_pod_kategorii = ppk.id
        ORDER BY k.id, pk.id, ppk.id, l.id
    `;

    const rows = await db.all(sql);

    // First, collect all categories, subcategories, and subsubcategories with their IDs
    const categories = {};
    const subcategories = {};
    const subsubcategories = {};

    rows.forEach(row => {
        if (row.kategoria_id && !categories[row.kategoria_id]) {
            categories[row.kategoria_id] = row.kategoria_nazwa || 'Uncategorized';
        }

        if (row.podkategoria_id) {
            const key = `${row.kategoria_id}-${row.podkategoria_id}`;
            if (!subcategories[key]) {
                subcategories[key] = row.podkategoria_nazwa || 'Uncategorized';
            }
        }

        if (row.podpodkategoria_id) {
            const key = `${row.kategoria_id}-${row.podkategoria_id}-${row.podpodkategoria_id}`;
            if (!subsubcategories[key]) {
                subsubcategories[key] = row.podpodkategoria_nazwa || 'Uncategorized';
            }
        }
    });

    // Create an ordered structure
    const orderedResult = {};

    // Sort categories by ID and create structure
    Object.keys(categories)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(catId => {
            const catName = categories[catId];
            orderedResult[catName] = {};
        });

    // Initialize subcategories and subsubcategories
    rows.forEach(row => {
        const categoryName = row.kategoria_nazwa || 'Uncategorized';
        const subcategoryName = row.podkategoria_nazwa || 'null';
        const subsubcategoryName = row.podpodkategoria_nazwa || 'null';

        // Ensure category exists
        if (!orderedResult[categoryName]) {
            orderedResult[categoryName] = {};
        }

        // Ensure subcategory exists
        if (!orderedResult[categoryName][subcategoryName]) {
            orderedResult[categoryName][subcategoryName] = {};
        }

        // Ensure subsubcategory exists with an empty array
        if (!orderedResult[categoryName][subcategoryName][subsubcategoryName]) {
            orderedResult[categoryName][subcategoryName][subsubcategoryName] = [];
        }
    });

    // Now populate the structure with medicines
    rows.forEach(row => {
        const categoryName = row.kategoria_nazwa || 'Uncategorized';
        const subcategoryName = row.podkategoria_nazwa || 'null';
        const subsubcategoryName = row.podpodkategoria_nazwa || 'null';

        if (row.lek_id) {
            const medicine = {
                lek_id: row.lek_id,
                lek_nazwa: row.lek_nazwa,
                lek_ilosc: row.lek_ilosc,
                lek_opakowanie: row.lek_opakowanie,
                lek_data: row.lek_data,
                lek_status: row.lek_status,
                lek_ilosc_minimalna: row.lek_ilosc_minimalna,
                lek_przechowywanie: row.lek_przechowywanie,
                lek_na_statku_spis_podstawowy: row.lek_na_statku_spis_podstawowy,
                rozchod_ilosc: row.rozchod_ilosc,
                rozchod_kto_zmienil: row.rozchod_kto_zmienil,
                stan_magazynowy_ilosc: row.stan_magazynowy_ilosc,
                stan_magazynowy_status: row.stan_magazynowy_status,
                stan_magazynowy_important_status: row.stan_magazynowy_important_status,
                id_kategorii: row.kategoria_id,
                id_pod_kategorii: row.podkategoria_id,
                id_pod_pod_kategorii: row.podpodkategoria_id
            };

            // Check if medicine is already added
            const alreadyExists = orderedResult[categoryName][subcategoryName][subsubcategoryName]
                .some(lek => lek.lek_id === row.lek_id);

            if (!alreadyExists) {
                orderedResult[categoryName][subcategoryName][subsubcategoryName].push(medicine);
            }
        }
    });

    return orderedResult;
}

export async function fetchMedicinesByDate(date) {
    const db = await getDb();

    const sql = `
        SELECT
            l.id,
            l.nazwa_leku,
            l.data_waznosci,
            l.ilosc_minimalna,
            (l.ilosc_wstepna - l.rozchod_ilosc) AS stan_magazynowy_ilosc,
            l.status_leku as current_status,
            CASE
                WHEN datetime(substr(l.data_waznosci, 7, 4) || '-' || substr(l.data_waznosci, 4, 2) || '-' || substr(l.data_waznosci, 1, 2)) < datetime(?) THEN 'Przeterminowane'
                WHEN datetime(substr(l.data_waznosci, 7, 4) || '-' || substr(l.data_waznosci, 4, 2) || '-' || substr(l.data_waznosci, 1, 2)) <= datetime(?, '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN datetime(substr(l.data_waznosci, 7, 4) || '-' || substr(l.data_waznosci, 4, 2) || '-' || substr(l.data_waznosci, 1, 2)) <= datetime(?, '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
                END AS projected_status
        FROM Leki l
        WHERE l.data_waznosci IS NOT NULL
          AND projected_status != 'Ważny' AND projected_status != current_status
        ORDER BY datetime(substr(l.data_waznosci, 7, 4) || '-' || substr(l.data_waznosci, 4, 2) || '-' || substr(l.data_waznosci, 1, 2)) ASC
    `;
    return await db.all(sql, [date, date, date]);
}

export async function deleteMedicine(id) {
    const db = await getDb();

    try {
        await db.run('DELETE FROM Leki WHERE id = ?', [id]);
        return {message: 'Medicine deleted successfully'};
    } catch (error) {
        throw error;
    }
}

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

// Disposal (Utylizacja) functions
export async function fetchAllUtylizacja() {
    const db = await getDb();
    return await db.all('SELECT * FROM Utylizacja');
}

// Min medicines functions
export async function addMinMedicine(data) {
    const db = await getDb();

    const result = await db.run(
        'INSERT INTO Leki_spis_min (nazwa_leku, pakowanie, w_opakowaniu, przechowywanie, na_statku_spis_podstawowy, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [data.nazwa_leku, data.pakowanie, data.w_opakowaniu, data.przechowywanie, data.na_statku_spis_podstawowy, data.id_kategorii, data.id_pod_kategorii, data.id_pod_pod_kategorii]
    );

    return result.lastID;
}

export async function updateMinMedicine(id, data) {
    const db = await getDb();

    const currentMedicine = await db.get('SELECT * FROM Leki_spis_min WHERE id = ?', [id]);

    const processedData = {
        nazwa_leku: data.nazwa_leku || currentMedicine.nazwa_leku,
        pakowanie: data.pakowanie || currentMedicine.pakowanie,
        w_opakowaniu: data.w_opakowaniu || currentMedicine.w_opakowaniu,
        przechowywanie: data.przechowywanie !== undefined ? data.przechowywanie : currentMedicine.przechowywanie,
        na_statku_spis_podstawowy: data.na_statku_spis_podstawowy !== undefined ?
            data.na_statku_spis_podstawowy : currentMedicine.na_statku_spis_podstawowy,

        id_kategorii: 'id_kategorii' in data ?
            (data.id_kategorii === "" ? null : data.id_kategorii) :
            currentMedicine.id_kategorii,

        id_pod_kategorii: 'id_pod_kategorii' in data ?
            (data.id_pod_kategorii === "" ? null : data.id_pod_kategorii) :
            currentMedicine.id_pod_kategorii,

        id_pod_pod_kategorii: 'id_pod_pod_kategorii' in data ?
            (data.id_pod_pod_kategorii === "" ? null : data.id_pod_pod_kategorii) :
            currentMedicine.id_pod_pod_kategorii
    };

    console.log('Update data:', processedData);

    await db.run(
        'UPDATE Leki_spis_min SET nazwa_leku = ?, pakowanie = ?, w_opakowaniu = ?, przechowywanie = ?, ' +
        'na_statku_spis_podstawowy = ?, id_kategorii = ?, id_pod_kategorii = ?, id_pod_pod_kategorii = ? WHERE id = ?',
        [
            processedData.nazwa_leku,
            processedData.pakowanie,
            processedData.w_opakowaniu,
            processedData.przechowywanie,
            processedData.na_statku_spis_podstawowy,
            processedData.id_kategorii,
            processedData.id_pod_kategorii,
            processedData.id_pod_pod_kategorii,
            id
        ]
    );

    return id;
}


export async function deleteMinMedicine(id) {
    const db = await getDb();
    await db.run('DELETE FROM Leki_spis_min WHERE id = ?', [id]);
    return {message: 'Min medicine deleted successfully'};
}

export async function fetchMinMedicinesByCategory() {
    const db = await getDb();

    const sql = `
        SELECT kategorie.id            AS kategoria_id,
               kategorie.nazwa         AS kategoria_nazwa,
               pod_kategorie.id        AS podkategoria_id,
               pod_kategorie.nazwa     AS podkategoria_nazwa,
               pod_pod_kategorie.id    AS podpodkategoria_id,
               pod_pod_kategorie.nazwa AS podpodkategoria_nazwa,
               leki_min.id             AS lek_min_id,
               leki_min.nazwa_leku     AS lek_min_nazwa,
               leki_min.pakowanie      AS lek_min_pakowanie,
               leki_min.w_opakowaniu   AS lek_min_w_opakowaniu,
               leki_min.przechowywanie AS leki_min_przechowywanie,
               leki_min.na_statku_spis_podstawowy AS leki_min_na_statku_spis_podstawowy
        FROM Leki_spis_min leki_min
                 LEFT JOIN Kategorie kategorie
                           ON leki_min.id_kategorii = kategorie.id
                 LEFT JOIN Pod_kategorie pod_kategorie
                           ON leki_min.id_pod_kategorii = pod_kategorie.id
                 LEFT JOIN Pod_pod_kategorie pod_pod_kategorie
                           ON leki_min.id_pod_pod_kategorii = pod_pod_kategorie.id
        ORDER BY kategoria_id, podkategoria_id, podpodkategoria_id, lek_min_id
    `;

    const rows = await db.all(sql);

    const groupedData = rows.reduce((result, row) => {
        const kategoriaNazwa = row.kategoria_nazwa || 'Uncategorized';
        const podkategoriaNazwa = row.podkategoria_nazwa || "null";
        const podpodkategoriaNazwa = row.podpodkategoria_nazwa || "null";

        if (!result[kategoriaNazwa]) {
            result[kategoriaNazwa] = {};
        }
        if (!result[kategoriaNazwa][podkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa] = {};
        }
        if (!result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa] = [];
        }

        const isLekMinAlreadyAdded = result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa]
            .some(lek => lek.lek_min_id === row.lek_min_id);

        if (!isLekMinAlreadyAdded && row.lek_min_id) {
            result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa].push({
                lek_min_id: row.lek_min_id,
                lek_min_nazwa: row.lek_min_nazwa,
                lek_min_pakowanie: row.lek_min_pakowanie,
                lek_min_w_opakowaniu: row.lek_min_w_opakowaniu,
                leki_min_przechowywanie: row.leki_min_przechowywanie,
                leki_min_na_statku_spis_podstawowy: row.leki_min_na_statku_spis_podstawowy
            });
        }

        return result;
    }, {});

    return groupedData;
}

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

export async function fetchUsers() {
    const db = await getDb();
    return await db.all('SELECT * FROM users');
}

export async function addUser(userData) {
    const db = await getDb();
    const { username, password, position } = userData;

    const result = await db.run(
        'INSERT INTO users (username, password, position) VALUES (?, ?, ?)',
        [username, password || null, position]
    );

    return result.lastID;
}

export async function updateUser(id, userData) {
    const db = await getDb();
    const { username, password, position } = userData;

    // Check if we're updating the password
    if (password !== undefined) {
        await db.run(
            'UPDATE users SET username = ?, password = ?, position = ? WHERE id = ?',
            [username, password, position, id]
        );
    } else {
        // If not updating password, only update other fields
        await db.run(
            'UPDATE users SET username = ?, position = ? WHERE id = ?',
            [username, position, id]
        );
    }

    return id;
}

export async function deleteUser(id) {
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'User deleted successfully' };
}

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

// New Utilization functions (similar to orders)
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


