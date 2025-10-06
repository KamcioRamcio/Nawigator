// backend/db/medicineQueries.js
import {getDb} from './index.js';
import {formatDateToEuropean} from './utils.js';

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
        ORDER BY kategoria_id ASC, podkategoria_id, podpodkategoria_id, lek_min_id
    `;

    const rows = await db.all(sql);

    // Track category metadata for sorting later
    const categoryMetadata = {};
    const groupedData = rows.reduce((result, row) => {
        const kategoriaNazwa = row.kategoria_nazwa || 'Uncategorized';
        const podkategoriaNazwa = row.podkategoria_nazwa || "null";
        const podpodkategoriaNazwa = row.podpodkategoria_nazwa || "null";

        // Store the category ID for sorting later
        if (!categoryMetadata[kategoriaNazwa]) {
            categoryMetadata[kategoriaNazwa] = {
                id: row.kategoria_id
            };
        }

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

    // Sort categories by ID and put null values last
    const sortedData = {};
    Object.keys(groupedData)
        .sort((a, b) => {
            const idA = categoryMetadata[a]?.id;
            const idB = categoryMetadata[b]?.id;

            // If both are null/undefined, keep original order
            if (!idA && !idB) return 0;
            // Null values go last
            if (!idA) return 1;
            if (!idB) return -1;
            // Otherwise sort by ID numerically
            return parseInt(idA) - parseInt(idB);
        })
        .forEach(categoryName => {
            sortedData[categoryName] = groupedData[categoryName];
        });

    return sortedData;
}
