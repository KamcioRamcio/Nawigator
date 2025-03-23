// backend/db/schema.js
import { getDb } from './index.js';

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
        CREATE TABLE IF NOT EXISTS Leki (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            nazwa_leku TEXT,
                                            ilosc_wstepna FLOAT,
                                            opakowanie TEXT,
                                            data_waznosci DATE,
                                            status_leku TEXT,
                                            ilosc_minimalna FLOAT,
                                            przechowywanie TEXT
        );

        CREATE TABLE IF NOT EXISTS Stan_magazynowy (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       id_leku INTEGER,
                                                       ilosc FLOAT,
                                                       data DATE,
                                                       status TEXT,
                                                       important_status TEXT,
                                                       FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Rozchod (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               id_leku INTEGER,
                                               ilosc FLOAT,
                                               data DATE,
                                               kto_zmienil TEXT,
                                               FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Kategorie (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 nazwa TEXT
        );

        CREATE TABLE IF NOT EXISTS Pod_kategorie (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     nazwa TEXT,
                                                     id_kategorii INTEGER,
                                                     FOREIGN KEY(id_kategorii) REFERENCES Kategorie(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Pod_pod_kategorie (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         nazwa TEXT,
                                                         id_pod_kategorii INTEGER,
                                                         FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Leki_kategorie (
                                                      id_leku INTEGER,
                                                      id_kategorii INTEGER,
                                                      FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE,
                                                      FOREIGN KEY(id_kategorii) REFERENCES Kategorie(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Leki_pod_kategorie (
                                                          id_leku INTEGER,
                                                          id_pod_kategorii INTEGER,
                                                          FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE,
                                                          FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Leki_pod_pod_kategorie (
                                                              id_leku INTEGER,
                                                              id_pod_pod_kategorii INTEGER,
                                                              FOREIGN KEY(id_leku) REFERENCES Leki(id) ON DELETE CASCADE,
                                                              FOREIGN KEY(id_pod_pod_kategorii) REFERENCES Pod_pod_kategorie(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Kategorie_sprzet (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        nazwa TEXT
        );

        CREATE TABLE IF NOT EXISTS Pod_kategorie_sprzet (
                                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                            nazwa TEXT,
                                                            id_kategorii INTEGER,
                                                            FOREIGN KEY(id_kategorii) REFERENCES Kategorie_sprzet(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Sprzet (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              nazwa TEXT,
                                              ilosc_wymagana FLOAT,
                                              ilosc_aktualna FLOAT,
                                              data_waznosci DATE,
                                              status TEXT,
                                              termin TEXT,
                                              ilosc_termin TEXT,
                                              kto_zmienil TEXT,
                                              na_statku BOOLEAN,
                                              torba_ratownika BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Sprzet_kategorie (
                                                        id_sprzet INTEGER,
                                                        id_kategorii INTEGER,
                                                        FOREIGN KEY(id_sprzet) REFERENCES Sprzet(id) ON DELETE CASCADE,
                                                        FOREIGN KEY(id_kategorii) REFERENCES Kategorie_sprzet(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Sprzet_pod_kategorie (
                                                            id_sprzet INTEGER,
                                                            id_pod_kategorii INTEGER,
                                                            FOREIGN KEY(id_sprzet) REFERENCES Sprzet(id) ON DELETE CASCADE,
                                                            FOREIGN KEY(id_pod_kategorii) REFERENCES Pod_kategorie_sprzet(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS Utylizacja (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  nazwa TEXT,
                                                  ilosc INTEGER,
                                                  data_waznosci DATE,
                                                  ilosc_nominalna TEXT,
                                                  grupa TEXT,
                                                  powod_utylizacji TEXT
        );

        CREATE TABLE IF NOT EXISTS Leki_spis_min (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     nazwa_leku TEXT,
                                                     pakowanie TEXT,
                                                     w_opakowaniu TEXT,
                                                     id_kategorii INTEGER,
                                                     id_pod_kategorii INTEGER,
                                                     id_pod_pod_kategorii INTEGER
        );

        CREATE TABLE IF NOT EXISTS last_ids_temp (
                                                     id INTEGER
        );
    `);

    await db.exec(`
        -- Leki_spis_min -> Leki (when adding to min list)
        DROP TRIGGER IF EXISTS add_to_main_leki_from_min;
        CREATE TRIGGER IF NOT EXISTS add_to_main_leki_from_min
        AFTER INSERT ON Leki_spis_min
        WHEN NOT EXISTS (SELECT 1 FROM Leki WHERE nazwa_leku = NEW.nazwa_leku)
        BEGIN
            -- Insert basic medicine info
            INSERT INTO Leki (
                nazwa_leku,
                opakowanie,
                kto_zmienil
            )
            VALUES (
                NEW.nazwa_leku,
                NEW.pakowanie,
                'SYSTEM'
            );
            
            -- Store the last inserted ID for use in category relations
            INSERT INTO last_ids_temp (id) VALUES (last_insert_rowid());
            
            -- Add category association if provided
            INSERT INTO Leki_kategorie (id_leku, id_kategorii)
            SELECT id, NEW.id_kategorii FROM last_ids_temp
            WHERE NEW.id_kategorii IS NOT NULL;
            
            -- Add subcategory association if provided
            INSERT INTO Leki_pod_kategorie (id_leku, id_pod_kategorii)
            SELECT id, NEW.id_pod_kategorii FROM last_ids_temp
            WHERE NEW.id_pod_kategorii IS NOT NULL;
            
            -- Add sub-subcategory association if provided
            INSERT INTO Leki_pod_pod_kategorie (id_leku, id_pod_pod_kategorii)
            SELECT id, NEW.id_pod_pod_kategorii FROM last_ids_temp
            WHERE NEW.id_pod_pod_kategorii IS NOT NULL;
            
            -- Clean up temp table
            DELETE FROM last_ids_temp;
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
                id_kategorii,
                id_pod_kategorii,
                id_pod_pod_kategorii
            )
            VALUES (
                NEW.nazwa_leku,
                NEW.opakowanie,
                NULL,
                NULL,
                NULL,
                NULL
            );
        END;
        
        -- Add triggers to update Leki_spis_min when categories are added
        DROP TRIGGER IF EXISTS update_min_leki_category;
        CREATE TRIGGER IF NOT EXISTS update_min_leki_category
        AFTER INSERT ON Leki_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_kategorii = NEW.id_kategorii
            WHERE nazwa_leku = (SELECT nazwa_leku FROM Leki WHERE id = NEW.id_leku);
        END;
        
        DROP TRIGGER IF EXISTS update_min_leki_subcategory;
        CREATE TRIGGER IF NOT EXISTS update_min_leki_subcategory
        AFTER INSERT ON Leki_pod_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_pod_kategorii = NEW.id_pod_kategorii
            WHERE nazwa_leku = (SELECT nazwa_leku FROM Leki WHERE id = NEW.id_leku);
        END;
        
        DROP TRIGGER IF EXISTS update_min_leki_subsubcategory;
        CREATE TRIGGER IF NOT EXISTS update_min_leki_subsubcategory
        AFTER INSERT ON Leki_pod_pod_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
            WHERE nazwa_leku = (SELECT nazwa_leku FROM Leki WHERE id = NEW.id_leku);
        END;
        
        -- Fixed trigger: Update Leki_spis_min when Leki is updated
        DROP TRIGGER IF EXISTS update_min_leki_from_main;
        CREATE TRIGGER IF NOT EXISTS update_min_leki_from_main
        AFTER UPDATE ON Leki
        BEGIN
            UPDATE Leki_spis_min
            SET 
                nazwa_leku = NEW.nazwa_leku,
                pakowanie = NEW.opakowanie
            WHERE nazwa_leku = OLD.nazwa_leku;
        END;
        
        DROP TRIGGER IF EXISTS sync_categories_to_leki_spis_min;
        CREATE TRIGGER IF NOT EXISTS sync_categories_to_leki_spis_min
        AFTER UPDATE ON Leki
        FOR EACH ROW
        BEGIN
            UPDATE Leki_spis_min
            SET 
                id_kategorii = (
                    SELECT k.id_kategorii 
                    FROM Leki_kategorie k 
                    WHERE k.id_leku = NEW.id
                    LIMIT 1
                ),
                id_pod_kategorii = (
                    SELECT p.id_pod_kategorii 
                    FROM Leki_pod_kategorie p 
                    WHERE p.id_leku = NEW.id
                    LIMIT 1
                ),
                id_pod_pod_kategorii = (
                    SELECT pp.id_pod_pod_kategorii 
                    FROM Leki_pod_pod_kategorie pp 
                    WHERE pp.id_leku = NEW.id
                    LIMIT 1
                )
            WHERE nazwa_leku = NEW.nazwa_leku;
        END;
        
        DROP TRIGGER IF EXISTS sync_categories_on_leki_kategorie_change;
        CREATE TRIGGER IF NOT EXISTS sync_categories_on_leki_kategorie_change
        AFTER UPDATE ON Leki_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_kategorii = (
                SELECT k.id_kategorii 
                FROM Leki_kategorie k 
                WHERE k.id_leku = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
                LIMIT 1
            )
            WHERE nazwa_leku = (
                SELECT l.nazwa_leku 
                FROM Leki l 
                WHERE l.id = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
            );
        END;
        
        DROP TRIGGER IF EXISTS sync_categories_on_leki_pod_kategorie_change;
        CREATE TRIGGER IF NOT EXISTS sync_categories_on_leki_pod_kategorie_change
        AFTER UPDATE ON Leki_pod_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_pod_kategorii = (
                SELECT p.id_pod_kategorii 
                FROM Leki_pod_kategorie p 
                WHERE p.id_leku = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
                LIMIT 1
            )
            WHERE nazwa_leku = (
                SELECT l.nazwa_leku 
                FROM Leki l 
                WHERE l.id = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
            );
        END;
        
        DROP TRIGGER IF EXISTS sync_categories_on_leki_pod_pod_kategorie_change;
        CREATE TRIGGER IF NOT EXISTS sync_categories_on_leki_pod_pod_kategorie_change
        AFTER UPDATE ON Leki_pod_pod_kategorie
        BEGIN
            UPDATE Leki_spis_min
            SET id_pod_pod_kategorii = (
                SELECT pp.id_pod_pod_kategorii 
                FROM Leki_pod_pod_kategorie pp 
                WHERE pp.id_leku = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
                LIMIT 1
            )
            WHERE nazwa_leku = (
                SELECT l.nazwa_leku 
                FROM Leki l 
                WHERE l.id = 
                    CASE
                        WHEN OLD.id_leku IS NULL THEN NEW.id_leku
                        ELSE OLD.id_leku
                    END
            );
        END;
                
        
        -- Fixed trigger: Update Leki when Leki_spis_min is updated
        DROP TRIGGER IF EXISTS update_main_leki_from_min;
        CREATE TRIGGER IF NOT EXISTS update_main_leki_from_min
        AFTER UPDATE ON Leki_spis_min
        BEGIN
            -- Update the basic information in Leki
            UPDATE Leki
            SET 
                nazwa_leku = NEW.nazwa_leku,
                opakowanie = NEW.pakowanie
            WHERE nazwa_leku = OLD.nazwa_leku;
            
            -- Get the affected Leki IDs
            INSERT INTO last_ids_temp (id)
            SELECT id FROM Leki WHERE nazwa_leku = NEW.nazwa_leku;
            
            -- Update category associations - only if they exist
            UPDATE Leki_kategorie
            SET id_kategorii = NEW.id_kategorii
            WHERE id_leku IN (SELECT id FROM last_ids_temp)
            AND NEW.id_kategorii IS NOT NULL;
            
            -- If no category association exists but one is provided, insert it
            INSERT OR IGNORE INTO Leki_kategorie (id_leku, id_kategorii)
            SELECT id, NEW.id_kategorii
            FROM last_ids_temp
            WHERE NEW.id_kategorii IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM Leki_kategorie WHERE id_leku = last_ids_temp.id);
            
            -- Update subcategory associations
            UPDATE Leki_pod_kategorie
            SET id_pod_kategorii = NEW.id_pod_kategorii
            WHERE id_leku IN (SELECT id FROM last_ids_temp)
            AND NEW.id_pod_kategorii IS NOT NULL;
            
            -- If no subcategory association exists but one is provided, insert it
            INSERT OR IGNORE INTO Leki_pod_kategorie (id_leku, id_pod_kategorii)
            SELECT id, NEW.id_pod_kategorii
            FROM last_ids_temp
            WHERE NEW.id_pod_kategorii IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM Leki_pod_kategorie WHERE id_leku = last_ids_temp.id);
            
            -- Update sub-subcategory associations
            UPDATE Leki_pod_pod_kategorie
            SET id_pod_pod_kategorii = NEW.id_pod_pod_kategorii
            WHERE id_leku IN (SELECT id FROM last_ids_temp)
            AND NEW.id_pod_pod_kategorii IS NOT NULL;
            
            -- If no sub-subcategory association exists but one is provided, insert it
            INSERT OR IGNORE INTO Leki_pod_pod_kategorie (id_leku, id_pod_pod_kategorii)
            SELECT id, NEW.id_pod_pod_kategorii
            FROM last_ids_temp
            WHERE NEW.id_pod_pod_kategorii IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM Leki_pod_pod_kategorie WHERE id_leku = last_ids_temp.id);
            
            -- Clean up temp table
            DELETE FROM last_ids_temp;
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
