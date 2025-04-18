// backend/db/schema.js
import {getDb} from './index.js';

// export async function addPrzechowywanie() {
//     const db = await getDb();
//
//     await db.exec(`
//     ALTER TABLE Utylizacja
//     ADD COLUMN powod_utylizacji TEXT;
//   `);
//
//     console.log('Added przehowywanie column to Leki table');
// }

export async function createTables() {
    const db = await getDb();

    // Create tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Leki
        (
            id                        INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa_leku                TEXT,
            ilosc_wstepna             FLOAT,
            opakowanie                TEXT,
            data_waznosci             DATE,
            status_leku               TEXT,
            ilosc_minimalna           FLOAT,
            rozchod_ilosc             FLOAT,
            status                    TEXT,
            important_status          TEXT,
            kto_zmienil               TEXT,
            id_kategorii              INTEGER,
            id_pod_kategorii          INTEGER,
            id_pod_pod_kategorii      INTEGER,
            przechowywanie            TEXT,
            na_statku_spis_podstawowy BOOLEAN
        );

        CREATE VIEW IF NOT EXISTS LekiView AS
        SELECT
            *,
            (ilosc_wstepna - rozchod_ilosc) AS stan_magazynowy_ilosc
        FROM Leki;


        CREATE TABLE IF NOT EXISTS Kategorie
        (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa TEXT
        );

        CREATE TABLE IF NOT EXISTS Pod_kategorie
        (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa        TEXT,
            id_kategorii INTEGER,
            FOREIGN KEY (id_kategorii) REFERENCES Kategorie (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Pod_pod_kategorie
        (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa            TEXT,
            id_pod_kategorii INTEGER,
            FOREIGN KEY (id_pod_kategorii) REFERENCES Pod_kategorie (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Kategorie_sprzet
        (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa TEXT
        );

        CREATE TABLE IF NOT EXISTS Pod_kategorie_sprzet
        (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa        TEXT,
            id_kategorii INTEGER,
            FOREIGN KEY (id_kategorii) REFERENCES Kategorie_sprzet (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Sprzet
        (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa           TEXT,
            ilosc_wymagana  FLOAT,
            ilosc_aktualna  FLOAT,
            data_waznosci   DATE,
            status          TEXT,
            termin          TEXT,
            ilosc_termin    TEXT,
            kto_zmienil     TEXT,
            id_kategorii   INTEGER,
            id_pod_kategorii  INTEGER,
            na_statku       BOOLEAN DEFAULT true,
            torba_ratownika BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Utylizacja
        (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa            TEXT,
            ilosc            INTEGER,
            opakowanie       TEXT,
            data_waznosci    DATE,
            ilosc_nominalna  TEXT,
            grupa            TEXT,
            powod_utylizacji TEXT
        );

        CREATE TABLE IF NOT EXISTS Leki_spis_min
        (
            id                        INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa_leku                TEXT,
            pakowanie                 TEXT,
            w_opakowaniu              TEXT,
            przechowywanie            TEXT,
            na_statku_spis_podstawowy BOOLEAN,
            id_kategorii              INTEGER,
            id_pod_kategorii          INTEGER,
            id_pod_pod_kategorii      INTEGER
        );

        CREATE TABLE IF NOT EXISTS Sprzet_zgrany_spis
        (
            id                        INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa_sprzetu             TEXT,
            data_waznosci             DATE,
            ilosc                     INTEGER,
            na_statku_spis_podstawowy BOOLEAN,
            id_kategorii              INTEGER,
            id_pod_kategorii          INTEGER,
            kto_zmienil               TEXT
        );

        CREATE TABLE IF NOT EXISTS last_ids_temp
        (
            id INTEGER
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT DEFAULT NULL,
            position TEXT NOT NULL
        );

    `);

    await db.exec(`
    -- Leki_spis_min -> Leki (when adding to min list)
    DROP TRIGGER IF EXISTS add_to_main_leki_from_min;
    CREATE TRIGGER IF NOT EXISTS add_to_main_leki_from_min
    AFTER INSERT ON Leki_spis_min
    WHEN NOT EXISTS (SELECT 1 FROM Leki WHERE nazwa_leku = NEW.nazwa_leku)
    BEGIN
    -- Insert basic medicine info including category IDs directly
    INSERT INTO Leki (
        nazwa_leku,
        opakowanie,
        przechowywanie,
        na_statku_spis_podstawowy,
        id_kategorii,
        id_pod_kategorii,
        id_pod_pod_kategorii
    )
    VALUES (
        NEW.nazwa_leku,
        NEW.pakowanie,
        NEW.przechowywanie,
        NEW.na_statku_spis_podstawowy,
        NEW.id_kategorii,
        NEW.id_pod_kategorii,
        NEW.id_pod_pod_kategorii
    );
    END;

    -- Leki -> Leki_spis_min
    DROP TRIGGER IF EXISTS add_to_min_leki_from_main;
    CREATE TRIGGER IF NOT EXISTS add_to_min_leki_from_main
    AFTER INSERT ON Leki
    WHEN NOT EXISTS (SELECT 1 FROM Leki_spis_min WHERE nazwa_leku = NEW.nazwa_leku)
    BEGIN
    -- Insert with proper initial values
    INSERT INTO Leki_spis_min (
        nazwa_leku,
        pakowanie,
        w_opakowaniu,
        przechowywanie,
        na_statku_spis_podstawowy,
        id_kategorii,
        id_pod_kategorii,
        id_pod_pod_kategorii
    )
    VALUES (
        NEW.nazwa_leku,
        NEW.opakowanie,
        NULL,
        NEW.przechowywanie,
        NEW.na_statku_spis_podstawowy,
        NEW.id_kategorii,
        NEW.id_pod_kategorii,
        NEW.id_pod_pod_kategorii
    );
    END;

    -- Update category triggers to work directly with id fields
    DROP TRIGGER IF EXISTS update_min_leki_category;
    CREATE TRIGGER IF NOT EXISTS update_min_leki_category
    AFTER UPDATE ON Leki
    WHEN NEW.id_kategorii != OLD.id_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_kategorii = NEW.id_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;

    DROP TRIGGER IF EXISTS update_min_leki_subcategory;
    CREATE TRIGGER IF NOT EXISTS update_min_leki_subcategory
    AFTER UPDATE ON Leki
    WHEN NEW.id_pod_kategorii != OLD.id_pod_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_pod_kategorii = NEW.id_pod_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;

    DROP TRIGGER IF EXISTS update_min_leki_subsubcategory;
    CREATE TRIGGER IF NOT EXISTS update_min_leki_subsubcategory
    AFTER UPDATE ON Leki
    WHEN NEW.id_pod_pod_kategorii != OLD.id_pod_pod_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;

    -- Fixed trigger: Update Leki_spis_min when Leki is updated
    DROP TRIGGER IF EXISTS update_min_leki_from_main;
    CREATE TRIGGER IF NOT EXISTS update_min_leki_from_main
    AFTER UPDATE ON Leki
    BEGIN
    UPDATE Leki_spis_min
    SET
    nazwa_leku = NEW.nazwa_leku,
        pakowanie = NEW.opakowanie,
        przechowywanie = NEW.przechowywanie,
        na_statku_spis_podstawowy = NEW.na_statku_spis_podstawowy,
        id_kategorii = NEW.id_kategorii,
        id_pod_kategorii = NEW.id_pod_kategorii,
        id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;

    DROP TRIGGER IF EXISTS sync_categories_to_leki_spis_min;

    DROP TRIGGER IF EXISTS sync_categories_on_leki_kategorie_change;

    -- Remove these triggers as they're no longer needed
    DROP TRIGGER IF EXISTS handle_subcategory_deletion;

    DROP TRIGGER IF EXISTS handle_subsubcategory_deletion;

    DROP TRIGGER IF EXISTS sync_categories_on_leki_pod_pod_kategorie_change;

    DROP TRIGGER IF EXISTS update_main_leki_from_min;
    CREATE TRIGGER IF NOT EXISTS update_main_leki_from_min
    AFTER UPDATE ON Leki_spis_min
    BEGIN
    -- Update the basic information in Leki
    UPDATE Leki
    SET
    nazwa_leku = NEW.nazwa_leku,
        opakowanie = NEW.pakowanie,
        przechowywanie = NEW.przechowywanie,
        na_statku_spis_podstawowy = NEW.na_statku_spis_podstawowy,
        id_kategorii = NEW.id_kategorii,
        id_pod_kategorii = NEW.id_pod_kategorii,
        id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;

    -- Fixed delete triggers
    DROP TRIGGER IF EXISTS delete_main_leki_from_min;
    CREATE TRIGGER IF NOT EXISTS delete_main_leki_from_min
    AFTER DELETE ON Leki_spis_min
    BEGIN
    DELETE FROM Leki
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;

    DROP TRIGGER IF EXISTS delete_min_leki_from_main;
    CREATE TRIGGER IF NOT EXISTS delete_min_leki_from_main
    AFTER DELETE ON Leki
    BEGIN
    DELETE FROM Leki_spis_min
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;
    `);

    console.log('Database tables and triggers created successfully');
}

export async function addExpiryStatusTrigger() {
    const db = await getDb();

    await db.exec(`
        -- Trigger to automatically update status_leku based on expiration date
        DROP TRIGGER IF EXISTS update_medicine_status_on_change;
        CREATE TRIGGER IF NOT EXISTS update_medicine_status_on_change
        AFTER UPDATE OF data_waznosci ON Leki
        FOR EACH ROW
        BEGIN
            UPDATE Leki
            SET status_leku = CASE
                WHEN date(NEW.data_waznosci) < date('now') THEN 'Przeterminowane'
                WHEN date(NEW.data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN date(NEW.data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
            END
            WHERE id = NEW.id;
        END;
        
        -- Trigger for new inserts
        DROP TRIGGER IF EXISTS update_medicine_status_on_insert;
        CREATE TRIGGER IF NOT EXISTS update_medicine_status_on_insert
        AFTER INSERT ON Leki
        FOR EACH ROW
        BEGIN
            UPDATE Leki
            SET status_leku = CASE
                WHEN date(NEW.data_waznosci) < date('now') THEN 'Przeterminowane'
                WHEN date(NEW.data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN date(NEW.data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
            END
            WHERE id = NEW.id;
        END;
        
        -- Trigger to automatically update sprzet_termin based on expiration date
        DROP TRIGGER IF EXISTS update_sprzet_termin_on_change;
        CREATE TRIGGER IF NOT EXISTS update_sprzet_termin_on_change
        AFTER UPDATE OF data_waznosci ON Sprzet
        FOR EACH ROW
        BEGIN
            UPDATE Sprzet
            SET termin = CASE
                WHEN date(NEW.data_waznosci) < date('now') THEN 'Przeterminowane'
                WHEN date(NEW.data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN date(NEW.data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
            END
            WHERE id = NEW.id;
        END;
        
        -- Trigger for new inserts
        DROP TRIGGER IF EXISTS update_sprzet_termin_on_insert;
        CREATE TRIGGER IF NOT EXISTS update_sprzet_termin_on_insert
        AFTER INSERT ON Sprzet
        FOR EACH ROW
        BEGIN
            UPDATE Sprzet
            SET termin = CASE
                WHEN date(NEW.data_waznosci) < date('now') THEN 'Przeterminowane'
                WHEN date(NEW.data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
                WHEN date(NEW.data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
                ELSE 'Ważny'
            END
            WHERE id = NEW.id;
        END;
    `);

    console.log('Expiry status triggers created successfully');
}

export async function updateExpiryStatusTrigger() {
    const db = await getDb();

    await db.run(`
        UPDATE Leki
        SET status_leku = CASE
            WHEN date(data_waznosci) < date('now') THEN 'Przeterminowane'
            WHEN date(data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
            WHEN date(data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
            ELSE 'Ważny'
        END
    `);

    await db.run(`
        UPDATE Sprzet
        SET termin = CASE
            WHEN date(data_waznosci) < date('now') THEN 'Przeterminowane'
            WHEN date(data_waznosci) <= date('now', '+1 month') THEN 'Ważność 1 miesiąc'
            WHEN date(data_waznosci) <= date('now', '+3 month') THEN 'Ważność 3 miesiące'
            ELSE 'Ważny'
        END
    `);

    console.log('Expiry status triggers updated successfully');
}

export async function addStatusMedicineTrigger() {
    const db = await getDb();

    await db.exec(`
        -- First drop the triggers if they exist
        DROP TRIGGER IF EXISTS update_status_on_change_medicine;
        CREATE TRIGGER IF NOT EXISTS update_status_on_change_medicine
        AFTER UPDATE ON Leki
        FOR EACH ROW
        BEGIN
            UPDATE Leki
            SET status = CASE
                WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku != 'Ważny') THEN 'Do zamówienia'
                WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku = 'Ważny') THEN 'Uwaga Ilość'
                WHEN (status_leku = 'Przeterminowane' OR status_leku = 'Ważność 1 miesiąc' OR status_leku = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                ELSE 'W porządku'
            END
            WHERE id = NEW.id;
        END;
    `);

    await db.exec(`
        DROP TRIGGER IF EXISTS update_status_on_insert_medicine;
        CREATE TRIGGER IF NOT EXISTS update_status_on_insert_medicine
        AFTER INSERT ON Leki
        FOR EACH ROW
        BEGIN
            UPDATE Leki
            SET status = CASE
                WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku != 'Ważny') THEN 'Do zamówienia'
                WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku = 'Ważny') THEN 'Uwaga Ilość'
                WHEN (status_leku = 'Przeterminowane' OR status_leku = 'Ważność 1 miesiąc' OR status_leku = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                ELSE 'W porządku'
            END
            WHERE id = NEW.id;
        END;
    `);

    await db.exec(`
        DROP TRIGGER IF EXISTS update_status_on_change_sprzet;
        CREATE TRIGGER IF NOT EXISTS update_status_on_change_sprzet
        AFTER UPDATE ON Sprzet
        FOR EACH ROW
        BEGIN
            UPDATE Sprzet
            SET ilosc_termin = CASE
                WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin != 'Ważny') THEN 'Do zamówienia'
                WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin = 'Ważny') THEN 'Uwaga Ilość'
                WHEN (termin = 'Przeterminowane' OR termin = 'Ważność 1 miesiąc' OR termin = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                ELSE 'W porządku'
            END
            WHERE id = NEW.id;
        END;
    `);

    await db.exec(`
        DROP TRIGGER IF EXISTS update_status_on_insert_sprzet;
        CREATE TRIGGER IF NOT EXISTS update_status_on_insert_sprzet
        AFTER INSERT ON Sprzet
        FOR EACH ROW
        BEGIN
            UPDATE Sprzet
            SET ilosc_termin = CASE
                WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin != 'Ważny') THEN 'Do zamówienia'
                WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin = 'Ważny') THEN 'Uwaga Ilość'
                WHEN (termin = 'Przeterminowane' OR termin = 'Ważność 1 miesiąc' OR termin = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                ELSE 'W porządku'
            END
            WHERE id = NEW.id;
        END;
    `);

    console.log('Medicine status triggers created successfully');
}

export async function updateStatusTrigger() {
    const db = await getDb();

    await db.exec(`
        UPDATE Leki
        SET status = CASE
                         WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku != 'Ważny') THEN 'Do zamówienia'
                         WHEN ((ilosc_wstepna - rozchod_ilosc) < ilosc_minimalna AND status_leku = 'Ważny') THEN 'Uwaga Ilość'
                         WHEN (status_leku = 'Przeterminowane' OR status_leku = 'Ważność 1 miesiąc' OR status_leku = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                         ELSE 'W porządku'
            END;
    `);

    await db.exec(`
        UPDATE Sprzet
        SET ilosc_termin = CASE
                         WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin != 'Ważny') THEN 'Do zamówienia'
                         WHEN ((ilosc_wymagana - ilosc_aktualna) < ilosc_aktualna AND termin = 'Ważny') THEN 'Uwaga Ilość'
                         WHEN (termin = 'Przeterminowane' OR termin = 'Ważność 1 miesiąc' OR termin = 'Ważność 3 miesiące') THEN 'Do zamówienia'
                         ELSE 'W porządku'
            END;
    `);

    console.log('Medicine status triggers updated successfully');
}