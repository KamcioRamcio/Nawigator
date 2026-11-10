-- Schema of a real 2025-04 Nawigator export (old version) incl. its triggers, with synthetic data.
-- Dates are YYYY-MM-DD, Zamowienia*/Utylizacje* tables do not exist yet.
CREATE TABLE Uzytkownicy(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT,
    haslo TEXT
, username TEXT);
CREATE TABLE Kategorie (id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT);
CREATE TABLE Pod_pod_kategorie(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, id_pod_kategorii INTEGER, FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie(id) ON DELETE CASCADE);
CREATE TABLE Pod_kategorie(id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa TEXT, id_kategorii INTEGER, FOREIGN KEY(id_kategorii) REFERENCES Kategorie(id) ON DELETE CASCADE);
CREATE TABLE last_ids_temp (id INTEGER);
CREATE TABLE Leki
        (
            id                        INTEGER PRIMARY KEY AUTOINCREMENT,
            nazwa_leku                TEXT,
            ilosc_wstepna             FLOAT,
            opakowanie                TEXT,
            data_waznosci             DATE,
            status_leku               TEXT,
            ilosc_minimalna           FLOAT,
            przechowywanie            TEXT,
            na_statku_spis_podstawowy BOOLEAN
        , rozchod_ilosc FLOAT DEFAULT 0, status TEXT, important_status TEXT, kto_zmienil TEXT, id_kategorii INTEGER, id_pod_kategorii INTEGER, id_pod_pod_kategorii INTEGER);
CREATE TABLE Leki_spis_min
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
CREATE TABLE Sprzet_zgrany_spis
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
CREATE TABLE Utylizacja
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
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT DEFAULT NULL,
            position TEXT NOT NULL
        );
CREATE VIEW LekiView AS
            SELECT
                *,
                (ilosc_wstepna - rozchod_ilosc) AS stan_magazynowy_ilosc
            FROM Leki;
/* LekiView(id,nazwa_leku,ilosc_wstepna,opakowanie,data_waznosci,status_leku,ilosc_minimalna,przechowywanie,na_statku_spis_podstawowy,rozchod_ilosc,status,important_status,kto_zmienil,id_kategorii,id_pod_kategorii,id_pod_pod_kategorii,stan_magazynowy_ilosc) */
CREATE TABLE Kategorie_sprzet (
                                                            id    INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            nazwa TEXT
            );
CREATE TABLE Pod_kategorie_sprzet (
                                                                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                nazwa        TEXT,
                                                                id_kategorii INTEGER,
                                                                FOREIGN KEY (id_kategorii) REFERENCES Kategorie_sprzet (id) ON DELETE CASCADE
            );
CREATE TABLE Sprzet
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
CREATE TRIGGER add_to_main_leki_from_min
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
CREATE TRIGGER add_to_min_leki_from_main
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
CREATE TRIGGER update_min_leki_category
    AFTER UPDATE ON Leki
    WHEN NEW.id_kategorii != OLD.id_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_kategorii = NEW.id_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;
CREATE TRIGGER update_min_leki_subcategory
    AFTER UPDATE ON Leki
    WHEN NEW.id_pod_kategorii != OLD.id_pod_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_pod_kategorii = NEW.id_pod_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;
CREATE TRIGGER update_min_leki_subsubcategory
    AFTER UPDATE ON Leki
    WHEN NEW.id_pod_pod_kategorii != OLD.id_pod_pod_kategorii
    BEGIN
    UPDATE Leki_spis_min
    SET id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
    WHERE nazwa_leku = NEW.nazwa_leku;
    END;
CREATE TRIGGER update_min_leki_from_main
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
CREATE TRIGGER update_main_leki_from_min
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
CREATE TRIGGER delete_main_leki_from_min
    AFTER DELETE ON Leki_spis_min
    BEGIN
    DELETE FROM Leki
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;
CREATE TRIGGER delete_min_leki_from_main
    AFTER DELETE ON Leki
    BEGIN
    DELETE FROM Leki_spis_min
    WHERE nazwa_leku = OLD.nazwa_leku;
    END;
CREATE TRIGGER update_medicine_status_on_change
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
CREATE TRIGGER update_medicine_status_on_insert
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
CREATE TRIGGER update_sprzet_termin_on_change
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
CREATE TRIGGER update_sprzet_termin_on_insert
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
CREATE TRIGGER update_status_on_change_medicine
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
CREATE TRIGGER update_status_on_insert_medicine
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
CREATE TRIGGER update_status_on_change_sprzet
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
CREATE TRIGGER update_status_on_insert_sprzet
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
INSERT INTO users (id, username, password, position) VALUES (1, 'kamil', 'admin', 'admin'), (2, 'view', NULL, 'viewer');
INSERT INTO Kategorie (id, nazwa) VALUES (1, 'Leki przeciwbólowe'), (2, 'Opatrunki');
INSERT INTO Pod_kategorie (id, nazwa, id_kategorii) VALUES (1, 'Doustne', 1);
INSERT INTO Kategorie_sprzet (id, nazwa) VALUES (1, 'Sprzęt ratunkowy');
INSERT INTO Leki (id, nazwa_leku, ilosc_wstepna, opakowanie, data_waznosci, status_leku, ilosc_minimalna, rozchod_ilosc, status, id_kategorii, id_pod_kategorii)
VALUES (1, 'Paracetamol', 10, 'tabl.', '2020-01-15', 'Ważny', 5, 2, 'W porządku', 1, 1),
       (2, 'Ibuprofen', 20, 'tabl.', '2099-12-31', 'Ważny', 5, 0, 'W porządku', 1, 1),
       (3, 'Bandaż', 1, 'szt.', '', 'Ważny', 5, 0, 'W porządku', 2, NULL);
INSERT INTO Sprzet (id, nazwa, ilosc_wymagana, ilosc_aktualna, data_waznosci, termin, ilosc_termin, id_kategorii)
VALUES (1, 'Nosze', 1, 1, '2099-06-01', 'Ważny', 'W porządku', 1),
       (2, 'Defibrylator', 1, 0, '2021-03-10', 'Ważny', 'W porządku', 1);
INSERT INTO Sprzet_zgrany_spis (id, nazwa_sprzetu, data_waznosci, ilosc, id_kategorii) VALUES (1, 'Kask', '2030-01-01', 2, 1);
