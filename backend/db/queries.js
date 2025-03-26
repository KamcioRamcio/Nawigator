// backend/db/queries.js
import {getDb} from './index.js';

// Medicine functions
export async function addMedicine(medicineData) {
    const db = await getDb();
    let medicineId = null;

    await db.run('BEGIN TRANSACTION');

    try {
        // Insert into Leki table
        const lekiResult = await db.run(
            'INSERT INTO Leki (nazwa_leku, ilosc_wstepna, opakowanie, data_waznosci, status_leku, ilosc_minimalna, przechowywanie, na_statku_spis_podstawowy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                medicineData.lek_nazwa,
                medicineData.lek_ilosc,
                medicineData.lek_opakowanie,
                medicineData.lek_data,
                medicineData.lek_status,
                medicineData.lek_ilosc_minimalna,
                medicineData.lek_przechowywanie,
                medicineData.lek_na_statku_spis_podstawowy,
            ]
        );

        medicineId = lekiResult.lastID;

        // Insert into Rozchod table
        await db.run(
            'INSERT INTO Rozchod (id_leku, ilosc, data, kto_zmienil) VALUES (?, ?, ?, ?)',
            [
                medicineId,
                medicineData.rozchod_ilosc,
                medicineData.rozchod_data,
                medicineData.rozchod_kto_zmienil
            ]
        );

        // Insert into Stan_magazynowy table
        await db.run(
            'INSERT INTO Stan_magazynowy (id_leku, ilosc, data, status, important_status) VALUES (?, ?, ?, ?, ?)',
            [
                medicineId,
                medicineData.stan_magazynowy_ilosc,
                medicineData.stan_magazynowy_data,
                medicineData.stan_magazynowy_status,
                medicineData.stan_magazynowy_important_status
            ]
        );

        // Insert category relations
        if (medicineData.lek_kategoria) {
            await db.run(
                'INSERT INTO Leki_kategorie (id_leku, id_kategorii) VALUES (?, ?)',
                [medicineId, medicineData.lek_kategoria]
            );
        }

        if (medicineData.lek_podkategoria) {
            await db.run(
                'INSERT INTO Leki_pod_kategorie (id_leku, id_pod_kategorii) VALUES (?, ?)',
                [medicineId, medicineData.lek_podkategoria]
            );
        }

        if (medicineData.lek_podpodkategoria) {
            await db.run(
                'INSERT INTO Leki_pod_pod_kategorie (id_leku, id_pod_pod_kategorii) VALUES (?, ?)',
                [medicineId, medicineData.lek_podpodkategoria]
            );
        }

        await db.run('COMMIT');
        return medicineId;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
}

export async function updateMedicine(id, medicineData) {
    const db = await getDb();

    await db.run('BEGIN TRANSACTION');

    try {
        await db.run(
            'UPDATE Leki SET nazwa_leku = ?, ilosc_wstepna = ?, opakowanie = ?, data_waznosci = ?, status_leku = ?, ilosc_minimalna = ?, przechowywanie = ?, na_statku_spis_podstawowy = ? WHERE id = ?',
            [
                medicineData.lek_nazwa,
                medicineData.lek_ilosc,
                medicineData.lek_opakowanie,
                medicineData.lek_data,
                medicineData.lek_status,
                medicineData.lek_ilosc_minimalna,
                medicineData.lek_przechowywanie,
                medicineData.lek_na_statku_spis_podstawowy,
                id
            ]
        );

        await db.run(
            'UPDATE Rozchod SET ilosc = ?, data = ?, kto_zmienil = ? WHERE id_leku = ?',
            [
                medicineData.rozchod_ilosc,
                medicineData.rozchod_data,
                medicineData.rozchod_kto_zmienil,
                id
            ]
        );

        await db.run(
            'UPDATE Stan_magazynowy SET ilosc = ?, data = ?, status = ?, important_status = ? WHERE id_leku = ?',
            [
                medicineData.stan_magazynowy_ilosc,
                medicineData.stan_magazynowy_data,
                medicineData.stan_magazynowy_status,
                medicineData.stan_magazynowy_important_status,
                id
            ]
        );

        if ('id_kategorii' in medicineData) {
            const categoryExists = await db.get(
                'SELECT id_kategorii FROM Leki_kategorie WHERE id_leku = ?',
                [id]
            );

            if (medicineData.id_kategorii) {
                if (categoryExists) {
                    await db.run(
                        'UPDATE Leki_kategorie SET id_kategorii = ? WHERE id_leku = ?',
                        [medicineData.id_kategorii, id]
                    );
                } else {
                    await db.run(
                        'INSERT INTO Leki_kategorie (id_leku, id_kategorii) VALUES (?, ?)',
                        [id, medicineData.id_kategorii]
                    );
                }
            } else if (categoryExists) {
                await db.run(
                    'DELETE FROM Leki_kategorie WHERE id_leku = ?',
                    [id]
                );
            }

            if (!categoryExists || categoryExists.id_kategorii !== medicineData.id_kategorii) {
                await db.run('DELETE FROM Leki_pod_kategorie WHERE id_leku = ?', [id]);
                await db.run('DELETE FROM Leki_pod_pod_kategorie WHERE id_leku = ?', [id]);
            }
        }

        if ('id_pod_kategorii' in medicineData) {
            const subcategoryExists = await db.get(
                'SELECT id_pod_kategorii FROM Leki_pod_kategorie WHERE id_leku = ?',
                [id]
            );

            if (medicineData.id_pod_kategorii) {
                if (subcategoryExists) {
                    await db.run(
                        'UPDATE Leki_pod_kategorie SET id_pod_kategorii = ? WHERE id_leku = ?',
                        [medicineData.id_pod_kategorii, id]
                    );
                } else {
                    await db.run(
                        'INSERT INTO Leki_pod_kategorie (id_leku, id_pod_kategorii) VALUES (?, ?)',
                        [id, medicineData.id_pod_kategorii]
                    );
                }
            } else if (subcategoryExists) {
                await db.run(
                    'DELETE FROM Leki_pod_kategorie WHERE id_leku = ?',
                    [id]
                );
            }

            if (!subcategoryExists || subcategoryExists.id_pod_kategorii !== medicineData.id_pod_kategorii) {
                await db.run('DELETE FROM Leki_pod_pod_kategorie WHERE id_leku = ?', [id]);
            }
        }

        if ('id_pod_pod_kategorii' in medicineData) {
            const subsubcategoryExists = await db.get(
                'SELECT id_pod_pod_kategorii FROM Leki_pod_pod_kategorie WHERE id_leku = ?',
                [id]
            );

            if (medicineData.id_pod_pod_kategorii) {
                if (subsubcategoryExists) {
                    await db.run(
                        'UPDATE Leki_pod_pod_kategorie SET id_pod_pod_kategorii = ? WHERE id_leku = ?',
                        [medicineData.id_pod_pod_kategorii, id]
                    );
                } else {
                    await db.run(
                        'INSERT INTO Leki_pod_pod_kategorie (id_leku, id_pod_pod_kategorii) VALUES (?, ?)',
                        [id, medicineData.id_pod_pod_kategorii]
                    );
                }
            } else if (subsubcategoryExists) {
                await db.run(
                    'DELETE FROM Leki_pod_pod_kategorie WHERE id_leku = ?',
                    [id]
                );
            }
        }

        await db.run('COMMIT');
        return id;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
}


export async function deleteMedicine(id) {
    const db = await getDb();

    await db.run('DELETE FROM Leki WHERE id = ?', [id]);

    return {message: 'Medicine deleted successfully'};
}

export async function fetchMedicinesByCategory() {
    const db = await getDb();

    const sql = `
        SELECT kategorie.id                     AS kategoria_id,
               kategorie.nazwa                  AS kategoria_nazwa,
               pod_kategorie.id                 AS podkategoria_id,
               pod_kategorie.nazwa              AS podkategoria_nazwa,
               pod_pod_kategorie.id             AS podpodkategoria_id,
               pod_pod_kategorie.nazwa          AS podpodkategoria_nazwa,
               leki.id                          AS lek_id,
               leki.nazwa_leku                  AS lek_nazwa,
               leki.ilosc_wstepna               AS lek_ilosc,
               leki.opakowanie                  AS lek_opakowanie,
               leki.data_waznosci               AS lek_data,
               leki.status_leku                 AS lek_status,
               leki.ilosc_minimalna             AS lek_ilosc_minimalna,
               leki.przechowywanie              AS lek_przechowywanie,
               leki.na_statku_spis_podstawowy   AS lek_na_statku_spis_podstawowy,
               rozchod.ilosc                    AS rozchod_ilosc,
               rozchod.data                     AS rozchod_data,
               rozchod.kto_zmienil              AS rozchod_kto_zmienil,
               stan_magazynowy.ilosc            AS stan_magazynowy_ilosc,
               stan_magazynowy.data             AS stan_magazynowy_data,
               stan_magazynowy.status           AS stan_magazynowy_status,
               stan_magazynowy.important_status AS stan_magazynowy_important_status
        FROM Leki leki
                 LEFT JOIN Leki_kategorie leki_kategorie ON leki.id = leki_kategorie.id_leku
                 LEFT JOIN Kategorie kategorie ON leki_kategorie.id_kategorii = kategorie.id
                 LEFT JOIN Leki_pod_kategorie leki_pod_kategorie ON leki.id = leki_pod_kategorie.id_leku
                 LEFT JOIN Pod_kategorie pod_kategorie ON leki_pod_kategorie.id_pod_kategorii = pod_kategorie.id
                 LEFT JOIN Leki_pod_pod_kategorie leki_pod_pod_kategorie ON leki.id = leki_pod_pod_kategorie.id_leku
                 LEFT JOIN Pod_pod_kategorie pod_pod_kategorie
                           ON leki_pod_pod_kategorie.id_pod_pod_kategorii = pod_pod_kategorie.id
                 LEFT JOIN Rozchod rozchod ON leki.id = rozchod.id_leku
                 LEFT JOIN Stan_magazynowy stan_magazynowy ON leki.id = stan_magazynowy.id_leku
        ORDER BY kategoria_id, podkategoria_id, podpodkategoria_id, lek_id
    `;

    const rows = await db.all(sql);

    const groupedData = rows.reduce((result, row) => {
        const kategoriaNazwa = row.kategoria_nazwa || 'Uncategorized';
        const podkategoriaNazwa = row.podkategoria_nazwa || 'null';
        const podpodkategoriaNazwa = row.podpodkategoria_nazwa || 'null';

        if (!result[kategoriaNazwa]) {
            result[kategoriaNazwa] = {};
        }
        if (!result[kategoriaNazwa][podkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa] = {};
        }
        if (!result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa]) {
            result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa] = [];
        }

        const isLekAlreadyAdded = result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa]
            .some(lek => lek.lek_id === row.lek_id);

        if (!isLekAlreadyAdded && row.lek_id) {
            result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa].push({
                lek_id: row.lek_id,
                lek_nazwa: row.lek_nazwa,
                lek_ilosc: row.lek_ilosc,
                lek_opakowanie: row.lek_opakowanie,
                lek_data: row.lek_data,
                lek_status: row.lek_status,
                lek_ilosc_minimalna: row.lek_ilosc_minimalna,
                lek_przechowywanie: row.lek_przechowywanie,
                lek_na_statku_spis_podstawowy : row.lek_na_statku_spis_podstawowy,
                rozchod_ilosc: row.rozchod_ilosc,
                rozchod_data: row.rozchod_data,
                rozchod_kto_zmienil: row.rozchod_kto_zmienil,
                stan_magazynowy_ilosc: row.stan_magazynowy_ilosc,
                stan_magazynowy_data: row.stan_magazynowy_data,
                stan_magazynowy_status: row.stan_magazynowy_status,
                stan_magazynowy_important_status: row.stan_magazynowy_important_status
            });
        }

        return result;
    }, {});

    return groupedData;
}

// Equipment functions
export async function addEquipment(equipmentData) {
    const db = await getDb();
    let equipmentId = null;

    await db.run('BEGIN TRANSACTION');

    try {
        // Insert into Sprzet table
        const sprzetResult = await db.run(
            `INSERT INTO Sprzet (nazwa, ilosc_wymagana, ilosc_aktualna, data_waznosci, status, termin, ilosc_termin,
                                 kto_zmienil, na_statku, torba_ratownika)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                equipmentData.eq_nazwa,
                equipmentData.eq_ilosc_wymagana,
                equipmentData.eq_ilosc_aktualna,
                equipmentData.eq_data,
                equipmentData.eq_status,
                equipmentData.eq_termin,
                equipmentData.eq_ilosc_termin,
                equipmentData.eq_kto_zmienil,
                equipmentData.eq_na_statku,
                equipmentData.eq_torba_ratownika
            ]
        );

        equipmentId = sprzetResult.lastID;

        // Insert category relations
        if (equipmentData.eq_kategoria) {
            await db.run(
                'INSERT INTO Sprzet_kategorie (id_sprzet, id_kategorii) VALUES (?, ?)',
                [equipmentId, equipmentData.eq_kategoria]
            );
        }

        if (equipmentData.eq_podkategoria) {
            await db.run(
                'INSERT INTO Sprzet_pod_kategorie (id_sprzet, id_pod_kategorii) VALUES (?, ?)',
                [equipmentId, equipmentData.eq_podkategoria]
            );
        }

        await db.run('COMMIT');
        return equipmentId;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
}

export async function updateEquipment(id, equipmentData) {
    const db = await getDb();

    await db.run('BEGIN TRANSACTION');

    try {
        // Update Sprzet table
        await db.run(
            `UPDATE Sprzet
             SET nazwa           = ?,
                 ilosc_wymagana  = ?,
                 ilosc_aktualna  = ?,
                 data_waznosci   = ?,
                 status = ?,
                 termin = ?,
                 ilosc_termin = ?,
                 kto_zmienil = ?,
                 na_statku = ?,
                 torba_ratownika = ?
             WHERE id = ?`,
            [
                equipmentData.sprzet_nazwa,
                equipmentData.sprzet_ilosc_wymagana,
                equipmentData.sprzet_ilosc_aktualna,
                equipmentData.sprzet_data_waznosci,
                equipmentData.sprzet_status,
                equipmentData.sprzet_termin,
                equipmentData.sprzet_ilosc_termin,
                equipmentData.sprzet_kto_zmienil,
                equipmentData.sprzet_na_statku,
                equipmentData.sprzet_torba_ratownika,
                id
            ]
        );

        if (equipmentData.id_kategorii) {
            await db.run(
                'UPDATE Sprzet_kategorie SET id_kategorii = ? WHERE id_sprzet = ?',
                [equipmentData.id_kategorii, id]
            );
        }

        if (equipmentData.id_pod_kategorii) {
            await db.run(
                'UPDATE Sprzet_pod_kategorie SET id_pod_kategorii = ? WHERE id_sprzet = ?',
                [equipmentData.id_pod_kategorii, id]
            );
        }

        await db.run('COMMIT');
        return id;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
}

export async function deleteEquipment(id) {
    const db = await getDb();

    await db.run('DELETE FROM Sprzet WHERE id = ?', [id]);

    return {message: 'Equipment deleted successfully'};
}

export async function fetchEquipmentByCategory() {
    const db = await getDb();

    const sql = `
        SELECT kategorie_sprzet.id        AS kategoria_sprzet_id,
               kategorie_sprzet.nazwa     AS kategoria_sprzet_nazwa,
               pod_kategorie_sprzet.id    AS podkategoria_sprzet_id,
               pod_kategorie_sprzet.nazwa AS podkategoria_sprzet_nazwa,
               sprzet.id                  AS sprzet_id,
               sprzet.nazwa               AS sprzet_nazwa,
               sprzet.ilosc_wymagana      AS sprzet_ilosc_wymagana,
               sprzet.ilosc_aktualna      AS sprzet_ilosc_aktualna,
               sprzet.data_waznosci       AS sprzet_data_waznosci,
               sprzet.status              AS sprzet_status,
               sprzet.termin              AS sprzet_termin,
               sprzet.ilosc_termin        AS sprzet_ilosc_termin,
               sprzet.kto_zmienil         AS sprzet_kto_zmienil,
               sprzet.na_statku           AS sprzet_na_statku,
               sprzet.torba_ratownika     AS sprzet_torba_ratownika
        FROM Sprzet sprzet
                 LEFT JOIN Sprzet_kategorie sprzet_kategorie ON sprzet.id = sprzet_kategorie.id_sprzet
                 LEFT JOIN Kategorie_sprzet kategorie_sprzet ON sprzet_kategorie.id_kategorii = kategorie_sprzet.id
                 LEFT JOIN Sprzet_pod_kategorie sprzet_pod_kategorie ON sprzet.id = sprzet_pod_kategorie.id_sprzet
                 LEFT JOIN Pod_kategorie_sprzet pod_kategorie_sprzet
                           ON sprzet_pod_kategorie.id_pod_kategorii = pod_kategorie_sprzet.id
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
                sprzet_torba_ratownika: row.sprzet_torba_ratownika
            });
        }

        return result;
    }, {});

    return groupedData;
}

// Disposal (Utylizacja) functions
export async function fetchAllUtylizacja() {
    const db = await getDb();
    return await db.all('SELECT * FROM Utylizacja');
}

export async function addUtylizacja(utilizationData) {
    const db = await getDb();
    const {nazwa, ilosc, opakowanie, data_waznosci, ilosc_nominalna, grupa, powod_utylizacji} = utilizationData;

    const result = await db.run(
        `INSERT INTO Utylizacja (nazwa,
                                 ilosc,
                                 opakowanie,
                                 data_waznosci,
                                 ilosc_nominalna,
                                 grupa,
                                 powod_utylizacji)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nazwa, ilosc, opakowanie, data_waznosci, ilosc_nominalna, grupa, powod_utylizacji]
    );

    return result.lastID;
}

export async function updateUtylizacja(id, data) {
    const db = await getDb();

    await db.run(
        'UPDATE Utylizacja SET nazwa = ?, ilosc = ?, opakowanie = ?, data_waznosci = ?, ilosc_nominalna = ?, grupa = ?, powod_utylizacji = ? WHERE id = ?',
        [data.nazwa, data.ilosc, data.opakowanie, data.data_waznosci, data.ilosc_nominalna, data.grupa, data.powod_utylizacji, id]
    );

    return id;
}

export async function deleteUtylizacja(id) {
    const db = await getDb();

    await db.run('DELETE FROM Utylizacja WHERE id = ?', [id]);

    return {message: 'Utylizacja deleted successfully'};
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