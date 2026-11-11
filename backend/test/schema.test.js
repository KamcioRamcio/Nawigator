import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown, euDate} from './helpers.js';
import {migrate, updateDateFormatToEuropean, refreshStatuses, updateStatusTrigger} from '../db/schema.js';

let db;
before(async () => ({db} = await setup()));
after(teardown);

const tables = async () => new Set((await db.all(`SELECT name FROM sqlite_master WHERE type = 'table'`)).map(t => t.name));

test('fresh database gets every table the queries use', async () => {
    const names = await tables();
    for (const t of ['Leki', 'Leki_spis_min', 'Sprzet', 'Sprzet_zgrany_spis', 'Kategorie', 'Pod_kategorie', 'Pod_pod_kategorie',
        'Kategorie_sprzet', 'Pod_kategorie_sprzet', 'users', 'Zamowienia', 'Zamowienia_Leki', 'Zamowienia_Sprzet',
        'Utylizacje', 'Utylizacje_Leki', 'Utylizacje_Sprzet']) {
        assert.ok(names.has(t), `missing table ${t}`);
    }
});

test('migrate is idempotent and keeps data', async () => {
    await db.run(`INSERT INTO Kategorie (nazwa) VALUES ('X')`);
    await migrate();
    await migrate();
    assert.equal((await db.get(`SELECT COUNT(*) AS c FROM Kategorie WHERE nazwa = 'X'`)).c, 1);
});

test('empty users table is seeded with a password-less admin, but only once', async () => {
    const users = await db.all('SELECT username, password, position FROM users');
    assert.deepEqual(users, [{username: 'admin', password: null, position: 'admin'}]);
    await db.run(`DELETE FROM users WHERE username = 'admin'`);
    await db.run(`INSERT INTO users (username, position) VALUES ('ola', 'user')`);
    await migrate();
    assert.deepEqual((await db.all('SELECT username FROM users')).map(u => u.username), ['ola']);
});

test('missing columns of an older table are added without losing rows', async () => {
    await db.exec(`DROP VIEW LekiView; DROP TABLE Leki_spis_min;
                   CREATE TABLE Leki_spis_min (id INTEGER PRIMARY KEY AUTOINCREMENT, nazwa_leku TEXT);
                   INSERT INTO Leki_spis_min (nazwa_leku) VALUES ('stary');`);
    await migrate();
    const cols = (await db.all('PRAGMA table_info(Leki_spis_min)')).map(c => c.name);
    assert.ok(cols.includes('przechowywanie') && cols.includes('id_pod_pod_kategorii'));
    assert.equal((await db.get(`SELECT nazwa_leku FROM Leki_spis_min WHERE nazwa_leku = 'stary'`)).nazwa_leku, 'stary');
});

test('date normalisation: ISO and D.M.YYYY become DD-MM-YYYY, unknown formats are left alone', async () => {
    await db.exec(`DELETE FROM Leki;
        INSERT INTO Leki (nazwa_leku, data_waznosci) VALUES ('a', '2025-04-16'), ('b', '5.3.2026'), ('c', '16-04-2025'), ('d', 'kiedyś'), ('e', ''), ('f', NULL);
        INSERT INTO Zamowienia (nazwa, data_zamowienia) VALUES ('z', '7.11.2026');`);
    await updateDateFormatToEuropean();
    const dates = Object.fromEntries((await db.all('SELECT nazwa_leku, data_waznosci FROM Leki')).map(r => [r.nazwa_leku, r.data_waznosci]));
    assert.deepEqual(dates, {a: '16-04-2025', b: '05-03-2026', c: '16-04-2025', d: 'kiedyś', e: '', f: null});
    assert.equal((await db.get(`SELECT data_zamowienia AS d FROM Zamowienia WHERE nazwa = 'z'`)).d, '07-11-2026');
});

test('refreshStatuses computes expiry (status_leku/termin) and stock status', async () => {
    await db.exec('DELETE FROM Leki; DELETE FROM Sprzet;');
    const rows = [
        ['expired', euDate(-1), 10, 0, 2],
        ['month', euDate(10), 10, 0, 2],
        ['three', euDate(60), 10, 0, 2],
        ['valid', euDate(200), 10, 0, 2],
        ['low', euDate(200), 3, 2, 2],
        ['empty', euDate(200), 5, 5, 2],
    ];
    for (const r of rows) {
        await db.run('INSERT INTO Leki (nazwa_leku, data_waznosci, ilosc_wstepna, rozchod_ilosc, ilosc_minimalna) VALUES (?, ?, ?, ?, ?)', r);
    }
    await db.run(`INSERT INTO Sprzet (nazwa, data_waznosci, ilosc_wymagana, ilosc_aktualna) VALUES ('s1', ?, 1, 1), ('s2', ?, 5, 1), ('s3', '', 1, 0)`, [euDate(-3), euDate(400)]);
    await refreshStatuses();

    const leki = Object.fromEntries((await db.all('SELECT nazwa_leku, status_leku, status FROM Leki')).map(r => [r.nazwa_leku, [r.status_leku, r.status]]));
    assert.deepEqual(leki, {
        expired: ['Przeterminowane', 'Do zamówienia'],
        month: ['Ważność 1 miesiąc', 'Do zamówienia'],
        three: ['Ważność 3 miesiące', 'Do zamówienia'],
        valid: ['Ważny', 'W porządku'],
        low: ['Ważny', 'Uwaga Ilość'],
        empty: ['Ważny', 'Do zamówienia'],
    });
    const sprzet = Object.fromEntries((await db.all('SELECT nazwa, termin, ilosc_termin FROM Sprzet')).map(r => [r.nazwa, [r.termin, r.ilosc_termin]]));
    assert.deepEqual(sprzet, {
        s1: ['Przeterminowane', 'Do zamówienia'],
        s2: ['Ważny', 'Uwaga Ilość'],
        s3: ['Brak na stanie', 'Do zamówienia'],
    });
});

test('Leki and Leki_spis_min stay in sync (insert, update, delete both ways)', async () => {
    await db.exec('DELETE FROM Leki; DELETE FROM Leki_spis_min;');
    await db.run(`INSERT INTO Leki (nazwa_leku, opakowanie) VALUES ('Sync', 'amp.')`);
    assert.equal((await db.get(`SELECT pakowanie FROM Leki_spis_min WHERE nazwa_leku = 'Sync'`)).pakowanie, 'amp.');

    await db.run(`UPDATE Leki_spis_min SET nazwa_leku = 'Sync2' WHERE nazwa_leku = 'Sync'`);
    assert.ok(await db.get(`SELECT 1 FROM Leki WHERE nazwa_leku = 'Sync2'`));

    await db.run(`INSERT INTO Leki_spis_min (nazwa_leku, pakowanie) VALUES ('FromMin', 'szt.')`);
    assert.ok(await db.get(`SELECT 1 FROM Leki WHERE nazwa_leku = 'FromMin'`));

    await db.run(`DELETE FROM Leki WHERE nazwa_leku = 'Sync2'`);
    assert.equal(await db.get(`SELECT 1 FROM Leki_spis_min WHERE nazwa_leku = 'Sync2'`), undefined);
});

test('stock-only change of a medicine does not touch Leki_spis_min; synced fields still propagate', async () => {
    await db.exec('DELETE FROM Leki; DELETE FROM Leki_spis_min;');
    await db.run(`INSERT INTO Leki (nazwa_leku, opakowanie, ilosc_wstepna, rozchod_ilosc) VALUES ('Quiet', 'amp.', 5, 0)`);
    await db.exec('CREATE TEMP TABLE min_writes (n INTEGER); INSERT INTO min_writes VALUES (0);');
    await db.exec(`CREATE TEMP TRIGGER count_min_writes AFTER UPDATE ON Leki_spis_min BEGIN UPDATE min_writes SET n = n + 1; END;`);
    try {
        await db.run(`UPDATE Leki SET rozchod_ilosc = 2 WHERE nazwa_leku = 'Quiet'`);
        assert.equal((await db.get('SELECT n FROM min_writes')).n, 0);

        await db.run(`UPDATE Leki SET opakowanie = 'tabl.' WHERE nazwa_leku = 'Quiet'`);
        assert.equal((await db.get(`SELECT pakowanie FROM Leki_spis_min WHERE nazwa_leku = 'Quiet'`)).pakowanie, 'tabl.');
        await db.run(`UPDATE Leki_spis_min SET przechowywanie = 'lodówka' WHERE nazwa_leku = 'Quiet'`);
        assert.equal((await db.get(`SELECT przechowywanie FROM Leki WHERE nazwa_leku = 'Quiet'`)).przechowywanie, 'lodówka');
    } finally {
        await db.exec('DROP TRIGGER temp.count_min_writes; DROP TABLE temp.min_writes;');
    }
});

test('status refresh repairs a drifted Leki_spis_min row from Leki', async () => {
    await db.exec('DELETE FROM Leki; DELETE FROM Leki_spis_min;');
    await db.run(`INSERT INTO Leki (nazwa_leku, opakowanie, przechowywanie) VALUES ('Drift', 'amp.', 'szafa')`);
    // Simulate an old database where the lists diverged (sync triggers off while writing).
    await db.exec(`PRAGMA recursive_triggers = OFF; DROP TRIGGER update_main_leki_from_min;`);
    await db.run(`UPDATE Leki_spis_min SET pakowanie = 'zły', przechowywanie = NULL WHERE nazwa_leku = 'Drift'`);
    await migrate(); // recreates the trigger and refreshes statuses
    const row = await db.get(`SELECT pakowanie, przechowywanie FROM Leki_spis_min WHERE nazwa_leku = 'Drift'`);
    assert.deepEqual({...row}, {pakowanie: 'amp.', przechowywanie: 'szafa'});
    assert.equal((await db.get(`SELECT opakowanie FROM Leki WHERE nazwa_leku = 'Drift'`)).opakowanie, 'amp.');
});

test('item in two open orders shows the order it was added to first', async () => {
    await db.exec('DELETE FROM Zamowienia_Leki; DELETE FROM Zamowienia; DELETE FROM Leki;');
    const {lastID: lek} = await db.run(`INSERT INTO Leki (nazwa_leku, ilosc_wstepna, rozchod_ilosc, ilosc_minimalna) VALUES ('Two', 1, 0, 5)`);
    const {lastID: first} = await db.run(`INSERT INTO Zamowienia (nazwa) VALUES ('Pierwsze')`);
    const {lastID: second} = await db.run(`INSERT INTO Zamowienia (nazwa) VALUES ('Drugie')`);
    await db.run('INSERT INTO Zamowienia_Leki (id_zamowienia, id_leku, ilosc) VALUES (?, ?, 1), (?, ?, 1)', [second, lek, first, lek]);
    await updateStatusTrigger();
    assert.equal((await db.get('SELECT status FROM Leki WHERE id = ?', [lek])).status, 'W zamówieniu: Drugie');
});

test('orders received by an older version are marked received; undo takes quantity and history entry back', async () => {
    const {updateOrderStatus} = await import('../db/orderQueries.js');
    await db.exec('DELETE FROM Zamowienia_Leki; DELETE FROM Zamowienia; DELETE FROM Leki;');
    const {lastID: lek} = await db.run(`INSERT INTO Leki (nazwa_leku, ilosc_wstepna, rozchod_ilosc, data_waznosci, important_status)
                                        VALUES ('Legacy', 15, 0, '31-12-2030', 'stare; 5x31-12-2030')`);
    const {lastID: order} = await db.run(`INSERT INTO Zamowienia (nazwa, status, data_zamowienia) VALUES ('Stare', 'Przyjęte', '01-03-2025')`);
    await db.run(`INSERT INTO Zamowienia_Leki (id_zamowienia, id_leku, ilosc, data_waznosci) VALUES (?, ?, 5, '2030-12-31')`, [order, lek]);
    await migrate();
    await migrate(); // idempotent
    assert.equal((await db.get('SELECT data_przyjecia AS d FROM Zamowienia WHERE id = ?', [order])).d, '01-03-2025');

    assert.equal(await updateOrderStatus(order, 'Nowe'), 'received');
    assert.equal(await updateOrderStatus(order, 'Nowe', {undoReceipt: true}), 'ok');
    const row = await db.get('SELECT ilosc_wstepna, data_waznosci, important_status FROM Leki WHERE id = ?', [lek]);
    assert.deepEqual({...row}, {ilosc_wstepna: 10, data_waznosci: '31-12-2030', important_status: 'stare'});
});

test('migration fills missing name copies of utilization items', async () => {
    await db.exec('DELETE FROM Utylizacje_Leki; DELETE FROM Utylizacje; DELETE FROM Zamowienia_Leki; DELETE FROM Leki;');
    const {lastID: lek} = await db.run(`INSERT INTO Leki (nazwa_leku) VALUES ('Kopia')`);
    const {lastID: u} = await db.run(`INSERT INTO Utylizacje (nazwa) VALUES ('U')`);
    await db.run('INSERT INTO Utylizacje_Leki (id_utylizacji, id_leku, ilosc) VALUES (?, ?, 1)', [u, lek]);
    await migrate();
    assert.equal((await db.get('SELECT nazwa_leku AS n FROM Utylizacje_Leki WHERE id_utylizacji = ?', [u])).n, 'Kopia');
});
