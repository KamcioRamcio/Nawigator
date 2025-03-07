import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import schedule from "node-schedule";
import os from 'os'

const app = express();
const port = 3000;


// Middleware
app.use(cors()); // Enable CORS to allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON request bodies

// Database Connection
const db = new sqlite3.Database('db.sqlite3', (err) => {
    if (err) {
        console.error('Failed to connect to the SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});


// db.run(`CREATE TABLE IF NOT EXISTS Leki_spis_min (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     nazwa_leku TEXT,
//     pakowanie TEXT,
//     w_opakowaniu TEXT
// )`, (err) => {
//     if (err) {
//         console.error('Error creating Leki_spis_min table:', err.message);
//     } else {
//         console.log('Leki_spis_min table created');
//     }
// });


// Create 'Leki' table
// db.run(`CREATE TABLE IF NOT EXISTS Leki (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     nazwa_leku TEXT,
//     ilosc_wstepna INTEGER,
//     opakowanie TEXT,
//     data_waznosci DATE,
//     status_leku TEXT,
//     ilosc_minimalna INTEGER
// )`, (err) => {
//     if (err) {
//         console.error('Error creating Leki table:', err.message);
//     } else {
//         console.log('Leki table created');
//     }
// });
//
// // Create 'Stan_magazynowy' table
// db.run(`CREATE TABLE IF NOT EXISTS Stan_magazynowy (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     id_leku INTEGER,
//     ilosc INTEGER,
//     data DATE,
//     status TEXT,
//     important_status TEXT,
//     FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE
// )`, (err) => {
//     if (err) {
//         console.error('Error creating Stan_magazynowy table:', err.message);
//     } else {
//         console.log('Stan_magazynowy table created');
//     }
// });

// Create 'Rozchod' table
// db.run(`CREATE TABLE IF NOT EXISTS Rozchod (
//                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
//                                                id_leku INTEGER,
//                                                ilosc INTEGER,
//                                                data DATE,
//                                                kto_zmienil TEXT,
//                                                FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE
//     )`, (err) => {
//     if (err) {
//         console.error('Error creating Rozchod table:', err.message);
//     } else {
//         console.log('Rozchod table created');
//     }
// });
// db.run('CREATE TABLE IF NOT EXISTS Kategorie (id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT)', (err) => {
//     if (err) {
//         console.error('Error creating Kategorie table:', err.message);
//     } else {
//         console.log('Kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Pod_kategorie(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, id_kategorii INTEGER, FOREIGN KEY(id_kategorii) REFERENCES Kategorie(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Pod_kategorie table:', err.message);
//     } else {
//         console.log('Pod_kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Pod_pod_kategorie(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, id_pod_kategorii INTEGER, FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Pod_pod_kategorie table:', err.message);
//     } else {
//         console.log('Pod_pod_kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Leki_kategorie(id_leku INTEGER, id_kategorii INTEGER, FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE, FOREIGN KEY(id_kategorii) REFERENCES Kategorie(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Leki_kategorie table:', err.message);
//     } else {
//         console.log('Leki_kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Leki_pod_kategorie(id_leku INTEGER, id_pod_kategorii INTEGER, FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE, FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Leki_pod_kategorie table:', err.message);
//     } else {
//         console.log('Leki_pod_kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Leki_pod_pod_kategorie(id_leku INTEGER, id_pod_pod_kategorii INTEGER, FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE, FOREIGN KEY(id_pod_pod_kategorii) REFERENCES Pod_pod_kategorie(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Leki_pod_pod_kategorie table:', err.message);
//     } else {
//         console.log('Leki_pod_pod_kategorie table created');
//     }
// });

// spis sprzętu tabele
// db.run('CREATE TABLE IF NOT EXISTS Kategorie_sprzet(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT)', (err) => {
//     if (err) {
//         console.error('Error creating Kategorie_sprzet table:', err.message);
//     } else {
//         console.log('Kategorie_sprzet table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Pod_kategorie_sprzet(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, id_kategorii INTEGER, FOREIGN KEY(id_kategorii) REFERENCES Kategorie_sprzet(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Pod_kategorie_sprzet table:', err.message);
//     } else {
//         console.log('Pod_kategorie_sprzet table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Sprzet(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, ilosc_wymagana INTEGER, ilosc_aktualna INTEGER, data_waznosci DATE, status TEXT, termin TEXT, ilosc_termin TEXT, kto_zmienil TEXT)', (err) => {
//     if (err) {
//         console.error('Error creating Sprzet table:', err.message);
//     } else {
//         console.log('Sprzet table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Sprzet_kategorie(id_sprzet INTEGER, id_kategorii INTEGER, FOREIGN KEY(id_sprzet) REFERENCES Sprzet(id) ON DELETE CASCADE, FOREIGN KEY(id_kategorii) REFERENCES Kategorie_sprzet(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Sprzet_kategorie table:', err.message);
//     } else {
//         console.log('Sprzet_kategorie table created');
//     }
// });
//
// db.run('CREATE TABLE IF NOT EXISTS Sprzet_pod_kategorie(id_sprzet INTEGER, id_pod_kategorii INTEGER, FOREIGN KEY(id_sprzet) REFERENCES Sprzet(id) ON DELETE CASCADE, FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie_sprzet(id) ON DELETE CASCADE)', (err) => {
//     if (err) {
//         console.error('Error creating Sprzet_pod_kategorie table:', err.message);
//     } else {
//         console.log('Sprzet_pod_kategorie table created');
//     }
// });

// db.run('CREATE TABLE IF NOT EXISTS Utylizacja(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, ilosc INTEGER, data_waznosci DATE, ilosc_nominalna TEXT, grupa TEXT)', (err) => {
//     if (err) {
//         console.error('Error creating Utylizacja table:', err.message);
//     } else {
//         console.log('Utylizacja table created');
//     }
// });
// Dodawanie leku

// Data look "2021-06-01"
function addMedicine(name, amount, packaging, expirationDate, status, minimalAmount, rozAmount, rozDate, rozChanger, stanAmount, stanDate, stanStatus, stanImpStatus, category, subCategory, subSubCategory) {
    db.run('INSERT INTO Leki (nazwa_leku, ilosc_wstepna, opakowanie, data_waznosci, status_leku, ilosc_minimalna) VALUES (?, ?, ?, ?, ?, ?)', [name, amount, packaging, expirationDate, status, minimalAmount], function (err) {
        if (err) {
            return console.log(err.message);
        }


        const medicineId = this.lastID;

        db.run('INSERT INTO Rozchod (id_leku, ilosc, data, kto_zmienil) VALUES (?, ?, ?, ?)', [medicineId, rozAmount, rozDate, rozChanger,], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Rozchod added");
        });

        db.run('INSERT INTO Stan_magazynowy (id_leku, ilosc, data, status, important_status) VALUES (?, ?, ?, ?,? )', [medicineId, stanAmount, stanDate, stanStatus, stanImpStatus,], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Stan_magazynowy added");
        });
        // Kategoria
        db.run('INSERT INTO Leki_kategorie (id_leku, id_kategorii) VALUES (?, ?)', [medicineId, category,], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Leki_kategorie added");
        });
        // Podkategoria
        db.run('INSERT INTO Leki_pod_kategorie (id_leku, id_pod_kategorii) VALUES (?, ?)', [medicineId, subCategory,], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Leki_pod_kategorie added");
        });
        // Podpodkategoria
        db.run('INSERT INTO Leki_pod_pod_kategorie (id_leku, id_pod_pod_kategorii) VALUES (?, ?)', [medicineId, subSubCategory,], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Leki_pod_pod_kategorie added");
        });
    });

}

// Dodawanie sprzetu

function addEquipment (name, requiredAmount, currentAmount, expirationDate, status, term, termAmount, category, subCategory) {
    db.run('INSERT INTO Sprzet (nazwa, ilosc_wymagana, ilosc_aktualna, data_waznosci, status, termin, ilosc_termin, na_statku, torba_ratownika) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, requiredAmount, currentAmount, expirationDate, status, term, termAmount], function (err) {
        if (err) {
            return console.log(err.message);
        }

        const equipmentId = this.lastID;

        db.run('INSERT INTO Sprzet_kategorie (id_sprzet, id_kategorii) VALUES (?, ?)', [equipmentId, category], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Sprzet_kategorie added");
        });

        db.run('INSERT INTO Sprzet_pod_kategorie (id_sprzet, id_pod_kategorii) VALUES (?, ?)', [equipmentId, subCategory], function (err) {
            if (err) {
                return console.log(err.message);
            }
            console.log("Sprzet_pod_kategorie added");
        });
    });

}

//addEquipment("Stapler skórny 1 szt (np. Leukoklip sd handle)", 1, 1, "2024-10-3", "ULTIMATE", "Przeterminowane!", "Do zamówienia", 2, null);

// API Endpoints

// Leki
app.post('/api/leki-all', (req, res) => {
    const {
        lek_nazwa,
        lek_ilosc,
        lek_opakowanie,
        lek_data,
        lek_status,
        lek_ilosc_minimalna,
        rozchod_data,
        rozchod_ilosc,
        rozchod_kto_zmienil,
        stan_magazynowy_data,
        stan_magazynowy_ilosc,
        stan_magazynowy_important_status,
        stan_magazynowy_status,
        lek_kategoria,
        lek_podkategoria,
        lek_podpodkategoria
    } = req.body;

    addMedicine(lek_nazwa, lek_ilosc, lek_opakowanie, lek_data, lek_status, lek_ilosc_minimalna, rozchod_ilosc, rozchod_data, rozchod_kto_zmienil, stan_magazynowy_ilosc, stan_magazynowy_data, stan_magazynowy_status, stan_magazynowy_important_status, lek_kategoria, lek_podkategoria, lek_podpodkategoria);

    res.status(201).json({message: 'Medicine added successfully'});
});

// addMedicine("Famotydyna/Ranigast 20mg", 29, "tabl", "2025-6-30",
//     "Ważny", 60, null, null, "kamcio", 29, "2024-11-18",
//     "Uwaga Ilość", null, 10, null, null);


app.get('/api/leki-kategorie', (req, res) => {
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
                 LEFT JOIN Pod_pod_kategorie pod_pod_kategorie ON leki_pod_pod_kategorie.id_pod_pod_kategorii = pod_pod_kategorie.id
                 LEFT JOIN Rozchod rozchod ON leki.id = rozchod.id_leku
                 LEFT JOIN Stan_magazynowy stan_magazynowy ON leki.id = stan_magazynowy.id_leku
        ORDER BY kategoria_id, podkategoria_id, podpodkategoria_id, lek_id;
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        const groupedData = rows.reduce((result, row) => {
            const kategoriaNazwa = row.kategoria_nazwa || 27;
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

        res.json(groupedData);
    });
});

// POST medicines changes

app.put('/api/leki/:id', (req, res) => {
    const {id} = req.params;
    const {
        lek_nazwa,
        lek_ilosc,
        lek_opakowanie,
        lek_data,
        lek_status,
        lek_ilosc_minimalna,
        rozchod_data,
        rozchod_ilosc,
        rozchod_kto_zmienil,
        stan_magazynowy_data,
        stan_magazynowy_ilosc,
        stan_magazynowy_important_status,
        stan_magazynowy_status,
        id_kategorii,
        id_pod_kategorii,
        id_pod_pod_kategorii
    } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run('UPDATE Leki SET nazwa_leku = ?, ilosc_wstepna = ?, opakowanie = ?, data_waznosci = ?, status_leku = ?, ilosc_minimalna = ? WHERE id = ?', [lek_nazwa, lek_ilosc, lek_opakowanie, lek_data, lek_status, lek_ilosc_minimalna, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({error: err.message});
            }
        });

        db.run('UPDATE Rozchod SET ilosc = ?, data = ?, kto_zmienil = ? WHERE id_leku = ?', [rozchod_ilosc, rozchod_data, rozchod_kto_zmienil, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({error: err.message});
            }
        });

        db.run('UPDATE Stan_magazynowy SET ilosc = ?, data = ?, status = ?, important_status = ? WHERE id_leku = ?', [stan_magazynowy_ilosc, stan_magazynowy_data, stan_magazynowy_status, stan_magazynowy_important_status, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({error: err.message});
            }
        });

        db.run('UPDATE Leki_kategorie SET id_kategorii = ? WHERE id_leku = ?', [id_kategorii, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({error: err.message});
            }
        });

        db.run('UPDATE Leki_pod_kategorie SET id_pod_kategorii = ? WHERE id_leku = ?', [id_pod_kategorii, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({error: err.message});
            }
        });

        db.run(`UPDATE Leki_pod_pod_kategorie SET id_pod_pod_kategorii = ? WHERE id_leku = ?`, [id_pod_pod_kategorii, id], function (err) {
        if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({error: err.message});
        }
        });

        db.run('COMMIT', function (err) {
            if (err) {
                return res.status(500).json({error: err.message});
            }

            res.json({message: 'Changes saved successfully'});
        });
    });
});

// DELETE medicine
app.delete('/api/leki/delete/:id', (req, res) => {
    const {id} = req.params;

    db.run('DELETE FROM Leki WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json({message: 'Medicine deleted successfully'});
    });

});

// Sprzet

app.get('/api/sprzet-kategorie', (req, res) => {
    const sql = `
        SELECT
            kategorie_sprzet.id AS kategoria_sprzet_id,
            kategorie_sprzet.nazwa AS kategoria_sprzet_nazwa,
            pod_kategorie_sprzet.id AS podkategoria_sprzet_id,
            pod_kategorie_sprzet.nazwa AS podkategoria_sprzet_nazwa,
            sprzet.id AS sprzet_id,
            sprzet.nazwa AS sprzet_nazwa,
            sprzet.ilosc_wymagana AS sprzet_ilosc_wymagana,
            sprzet.ilosc_aktualna AS sprzet_ilosc_aktualna,
            sprzet.data_waznosci AS sprzet_data_waznosci,
            sprzet.status AS sprzet_status,
            sprzet.termin AS sprzet_termin,
            sprzet.ilosc_termin AS sprzet_ilosc_termin,
            sprzet.kto_zmienil AS sprzet_kto_zmienil,
            sprzet.na_statku AS sprzet_na_statku,
            sprzet.torba_ratownika AS sprzet_torba_ratownika
            
        FROM Sprzet sprzet
                 LEFT JOIN Sprzet_kategorie sprzet_kategorie ON sprzet.id = sprzet_kategorie.id_sprzet
                 LEFT JOIN Kategorie_sprzet kategorie_sprzet ON sprzet_kategorie.id_kategorii = kategorie_sprzet.id
                 LEFT JOIN Sprzet_pod_kategorie sprzet_pod_kategorie ON sprzet.id = sprzet_pod_kategorie.id_sprzet
                 LEFT JOIN Pod_kategorie_sprzet pod_kategorie_sprzet ON sprzet_pod_kategorie.id_pod_kategorii = pod_kategorie_sprzet.id
        ORDER BY kategoria_sprzet_id, podkategoria_sprzet_id, sprzet_id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err.message });
        }

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

        res.json(groupedData);
    });
});

app.post('/api/sprzet-all', (req, res) => {
    const {
        eq_nazwa,
        eq_ilosc_wymagana,
        eq_ilosc_aktualna,
        eq_data,
        eq_status,
        eq_termin,
        eq_ilosc_termin,
        eq_na_satku,
        eq_torba_ratownka,
        eq_kategoria,
        eq_podkategoria
    } = req.body;

    addEquipment(eq_nazwa, eq_ilosc_wymagana, eq_ilosc_aktualna, eq_data, eq_status, eq_termin, eq_ilosc_termin, eq_na_satku, eq_torba_ratownka,eq_kategoria, eq_podkategoria);

    res.status(201).json({message: 'Equipment added successfully'});
});

app.put('/api/sprzet/:id', (req, res) => {
    const { id } = req.params;
    const {
        sprzet_nazwa,
        sprzet_ilosc_wymagana,
        sprzet_ilosc_aktualna,
        sprzet_data_waznosci,
        sprzet_status,
        sprzet_termin,
        sprzet_ilosc_termin,
        sprzet_kto_zmienil,
        sprzet_na_satku,
        sprzet_torba_ratownka,
        id_kategorii,
        id_pod_kategorii
    } = req.body;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const sql = `
            UPDATE Sprzet
            SET nazwa = ?, ilosc_wymagana = ?, ilosc_aktualna = ?, data_waznosci = ?, status = ?, termin = ?, ilosc_termin = ?, kto_zmienil = ?,na_statku = ?, torba_ratownka = ?
            WHERE id = ?
        `;

        const params = [
            sprzet_nazwa,
            sprzet_ilosc_wymagana,
            sprzet_ilosc_aktualna,
            sprzet_data_waznosci,
            sprzet_status,
            sprzet_termin,
            sprzet_ilosc_termin,
            sprzet_kto_zmienil,
            sprzet_na_satku,
            sprzet_torba_ratownka,
            id
        ];

        db.run(sql, params, function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
        });

        db.run('UPDATE Sprzet_kategorie SET id_kategorii = ? WHERE id_sprzet = ?', [id_kategorii, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
        });

        db.run('UPDATE Sprzet_pod_kategorie SET id_pod_kategorii = ? WHERE id_sprzet = ?', [id_pod_kategorii, id], function (err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }
        });

        db.run('COMMIT', function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Equipment updated successfully' });
        });
    });
});

app.delete('/api/sprzet/delete/:id', (req, res) => {
    const {id} = req.params

    db.run(`DELETE FROM Sprzet WHERE id = ?`, [id], (err) => {
        if (err){
            return res.status(500).json({error: err.message})
        }

        res.json({message: 'Equipmnet deleted succesfullu'})
    })
});

// Utylizacja
app.get('/api/utylizacja', (req, res) => {
    db.all('SELECT * FROM Utylizacja', [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json(rows);
    });
});

app.post('/api/utylizacja', (req, res) => {
    const {nazwa, ilosc ,data_waznosci, ilosc_nominalna, grupa} = req.body;

    db.run('INSERT INTO Utylizacja (nazwa, ilosc,data_waznosci, ilosc_nominalna, grupa) VALUES (?, ?, ?, ?, ?)', [nazwa, ilosc, data_waznosci, ilosc_nominalna, grupa], function (err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.status(201).json({message: 'Utylizacja added successfully'});
    });
});

app.delete('/api/utylizacja/delete/:id', (req, res) => {
    const {id} = req.params;

    db.run('DELETE FROM Utylizacja WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json({message: 'Utylizacja deleted successfully'});
    });
});

app.put('/api/utylizacja/:id', (req, res) => {
    const {id} = req.params;
    const {nazwa, ilosc, data_waznosci, ilosc_nominalna, grupa} = req.body;

    const sql = `
        UPDATE Utylizacja
        SET nazwa = ?, ilosc = ?, data_waznosci = ?, ilosc_nominalna = ?, grupa = ?
        WHERE id = ?
    `;

    const params = [nazwa, ilosc, data_waznosci, ilosc_nominalna, grupa, id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }

        res.json({message: 'Utylizacja updated successfully'});
    });
});

db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
        console.error('Failed to enable foreign keys:', err.message);
    } else {
        console.log('Foreign keys enabled');
    }
});

import fs from 'fs/promises';
import path from 'path';

// db_backup
const DB_PATH = 'db.sqlite3';
const BACKUP_PATH = './protected/db_backup.sqlite3';
const EXPORT_PATH = './temp'

export async function createBackup() {
    try {
        await fs.mkdir('./protected', { recursive: true });

        await fs.copyFile(DB_PATH, BACKUP_PATH);
        console.log('Backup created successfully');
    }catch (error) {
        console.error('Failed to create backup:', error.message);
    }
}

export function exportDatabase() {
    return new Promise((resolve, reject) => {
        fs.mkdir(EXPORT_PATH, { recursive: true })
            .then(() => {
                const exportFilePath = path.join(EXPORT_PATH, `export_${Date.now()}.db`);

                fs.copyFile(DB_PATH, exportFilePath)
                    .then(() => resolve(exportFilePath))
                    .catch(reject);
            })
            .catch(reject);
    });
}

app.get('/api/export-database', async (req, res) => {
    try {
        const exportPath = await exportDatabase();

        res.download(exportPath, 'database_export.db', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            fs.unlink(exportPath).catch(console.error);
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Błąd podczas eksportu bazy danych' });
    }
});

const backupMiddleware = async (req, res, next) => {
    await next();

    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        try {
            await createBackup();
        } catch (error) {
            console.error('Backup middleware error:', error);
        }
    }
};
app.use('/api/leki', backupMiddleware);
app.use('/api/utilizations', backupMiddleware);
app.use('/api/equipment', backupMiddleware);


const desktopPath = path.join(os.homedir(), 'Desktop');

// Function to create dated backup filename
function getBackupFilename() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `db_backup_${year}${month}${day}.sqlite3`;
}

// Function to create daily backup
async function createDailyBackup() {
    try {
        const backupFilename = getBackupFilename();
        const backupPath = path.join(desktopPath, backupFilename);

        await fs.copyFile(DB_PATH, backupPath);
        console.log(`Daily backup created: ${backupFilename}`);

        // Delete old backups (keep last 7 days)
        const files = await fs.readdir(desktopPath);
        const backupFiles = files.filter(file => file.startsWith('db_backup_') && file.endsWith('.sqlite3'));

        if (backupFiles.length > 7) {
            const oldestFiles = backupFiles
                .sort()
                .slice(0, backupFiles.length - 7);

            for (const file of oldestFiles) {
                await fs.unlink(path.join(desktopPath, file));
                console.log(`Deleted old backup: ${file}`);
            }
        }
    } catch (error) {
        console.error('Failed to create daily backup:', error.message);
    }
}

// Schedule daily backup at 23:59
schedule.scheduleJob('59 23 * * *', createDailyBackup);



const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'imported_database.db');
    }
});

const upload = multer({ storage: storage });

const closeDatabase = (db) => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

app.post('/api/import-database', upload.single('database'), async (req, res) => {
    let db = null;
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nie przesłano pliku'
            });
        }

        const currentDbPath = './db.sqlite3';
        const importedDbPath = req.file.path;
        const backupDbPath = './db.sqlite3.backup';

        // Zamknij obecne połączenie z bazą danych
        if (global.db) {
            await closeDatabase(global.db);
            global.db = null;
        }

        // Utwórz kopię zapasową
        await fs.copyFile(currentDbPath, backupDbPath);

        try {
            // Spróbuj skopiować nową bazę danych
            await fs.copyFile(importedDbPath, currentDbPath);

            // Usuń plik tymczasowy
            await fs.unlink(importedDbPath);

            // Sprawdź czy nowa baza działa
            db = new sqlite3.Database(currentDbPath);

            // Zainicjuj nowe połączenie globalne
            global.db = db;

            res.json({
                success: true,
                message: 'Baza danych została pomyślnie zaimportowana'
            });

        } catch (error) {
            // W przypadku błędu, przywróć kopię zapasową
            if (await fs.access(backupDbPath).then(() => true).catch(() => false)) {
                await fs.copyFile(backupDbPath, currentDbPath);
            }
            throw error;
        } finally {
            // Usuń kopię zapasową
            if (await fs.access(backupDbPath).then(() => true).catch(() => false)) {
                await fs.unlink(backupDbPath);
            }
        }

    } catch (error) {
        console.error('Błąd podczas importowania bazy danych:', error);
        res.status(500).json({
            success: false,
            message: 'Wystąpił błąd podczas importowania bazy danych: ' + error.message
        });
    }
});

// Leki min

function addMinMedicine(nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO Leki_spis_min (nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii) VALUES (?, ?, ?, ?, ?, ?)',
            [nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    id: this.lastID,
                    nazwa_leku,
                    pakowanie,
                    w_opakowaniu,
                    id_kategorii,
                    id_pod_kategorii,
                    id_pod_pod_kategorii
                });
            }
        );
    });
}

app.post('/api/leki-min', (req, res) => {
    const { nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii } = req.body;

    if (!nazwa_leku) {
        return res.status(400).json({ error: "Nazwa leku jest wymagana" });
    }

    addMinMedicine(nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii)
        .then(data => {
            res.status(201).json({
                message: "Min medicine added successfully",
                data
            });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.put('/api/leki-min/:id', (req, res) => {
    const { id } = req.params;
    const { nazwa_leku, pakowanie, w_opakowaniu, id_kategorii, id_pod_kategorii, id_pod_pod_kategorii } = req.body;

    if (!nazwa_leku) {
        return res.status(400).json({ error: "Nazwa leku jest wymagana" });
    }

    db.get('SELECT * FROM Leki_spis_min WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: "Entry not found" });
        }

        const updatedValues = {
            nazwa_leku: nazwa_leku || row.nazwa_leku,
            pakowanie: pakowanie !== undefined ? pakowanie : row.pakowanie,
            w_opakowaniu: w_opakowaniu !== undefined ? w_opakowaniu : row.w_opakowaniu,
            id_kategorii: id_kategorii !== undefined ? id_kategorii : row.id_kategorii,
            id_pod_kategorii: id_pod_kategorii !== undefined ? id_pod_kategorii : row.id_pod_kategorii,
            id_pod_pod_kategorii: id_pod_pod_kategorii !== undefined ? id_pod_pod_kategorii : row.id_pod_pod_kategorii
        };

        const sql = `
            UPDATE Leki_spis_min
            SET nazwa_leku = ?, pakowanie = ?, w_opakowaniu = ?, id_kategorii = ?, id_pod_kategorii = ?, id_pod_pod_kategorii = ?
            WHERE id = ?
        `;

        db.run(sql, [
            updatedValues.nazwa_leku,
            updatedValues.pakowanie,
            updatedValues.w_opakowaniu,
            updatedValues.id_kategorii,
            updatedValues.id_pod_kategorii,
            updatedValues.id_pod_pod_kategorii,
            id
        ], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Min medicine updated successfully",
                changes: this.changes
            });
        });
    });
});

app.get('/api/leki-min-kategorie', (req, res) => {
    const sql = `
        SELECT
            kategorie.id AS kategoria_id,
            kategorie.nazwa AS kategoria_nazwa,
            pod_kategorie.id AS podkategoria_id,
            pod_kategorie.nazwa AS podkategoria_nazwa,
            pod_pod_kategorie.id AS podpodkategoria_id,
            pod_pod_kategorie.nazwa AS podpodkategoria_nazwa,
            leki_min.id AS lek_min_id,
            leki_min.nazwa_leku AS lek_min_nazwa,
            leki_min.pakowanie AS lek_min_pakowanie,
            leki_min.w_opakowaniu AS lek_min_w_opakowaniu
        FROM Leki_spis_min leki_min
                 LEFT JOIN Kategorie kategorie
                           ON leki_min.id_kategorii = kategorie.id
                 LEFT JOIN Pod_kategorie pod_kategorie
                           ON leki_min.id_pod_kategorii = pod_kategorie.id
                 LEFT JOIN Pod_pod_kategorie pod_pod_kategorie
                           ON leki_min.id_pod_pod_kategorii = pod_pod_kategorie.id
        ORDER BY kategoria_id, podkategoria_id, podpodkategoria_id, lek_min_id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const groupedData = rows.reduce((result, row) => {
            const kategoriaNazwa = row.kategoria_nazwa || 27;
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

            if (!isLekMinAlreadyAdded) {
                result[kategoriaNazwa][podkategoriaNazwa][podpodkategoriaNazwa].push({
                    lek_min_id: row.lek_min_id,
                    lek_min_nazwa: row.lek_min_nazwa,
                    lek_min_pakowanie: row.lek_min_pakowanie,
                    lek_min_w_opakowaniu: row.lek_min_w_opakowaniu
                });
            }

            return result;
        }, {});

        res.json(groupedData);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
