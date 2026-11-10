import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {setup, teardown, tmpDir, sqliteFromSql, FIXTURE_SQL, REAL_DUMP, addMedicine, isoDate} from './helpers.js';
import {createBackup, createDailyBackup, getBackupDir, validateDatabaseFile} from '../utils/helpers.js';
import {getDb} from '../db/index.js';

let api;
before(async () => ({api} = await setup()));
after(teardown);

const fixtureDb = async (name = 'old.db') => sqliteFromSql(fs.readFileSync(FIXTURE_SQL, 'utf8'), path.join(tmpDir, name));
const db = () => getDb(); // import swaps the connection, always ask for the current one

test('export downloads a consistent SQLite copy', async () => {
    await addMedicine(api, {lek_nazwa: 'DoEksportu'});
    const res = await api.get('/api/export-database').buffer(true).parse((r, cb) => {
        const chunks = [];
        r.on('data', c => chunks.push(c));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
    }).expect(200);
    assert.match(res.headers['content-disposition'], /database_export_\d{4}-\d{2}-\d{2}\.db/);
    assert.equal(res.body.subarray(0, 15).toString(), 'SQLite format 3');
    const file = path.join(tmpDir, 'exported.db');
    fs.writeFileSync(file, res.body);
    await validateDatabaseFile(file);
});

test('import of an OLD database migrates schema, dates and statuses', async () => {
    const file = await fixtureDb();
    const res = await api.post('/api/import-database').attach('database', file).expect(200);
    assert.equal(res.body.success, true);

    const d = await db();
    const leki = Object.fromEntries((await d.all('SELECT nazwa_leku, data_waznosci, status_leku, status FROM Leki')).map(r => [r.nazwa_leku, r]));
    assert.equal(leki.Paracetamol.data_waznosci, '15-01-2020');
    assert.equal(leki.Paracetamol.status_leku, 'Przeterminowane');
    assert.equal(leki.Paracetamol.status, 'Do zamówienia');
    assert.equal(leki.Ibuprofen.data_waznosci, '31-12-2099');
    assert.equal(leki.Ibuprofen.status, 'W porządku');
    assert.equal((await d.get(`SELECT termin FROM Sprzet WHERE nazwa = 'Defibrylator'`)).termin, 'Przeterminowane');
    assert.equal((await d.get(`SELECT data_waznosci FROM Sprzet_zgrany_spis WHERE nazwa_sprzetu = 'Kask'`)).data_waznosci, '2030-01-01',
        'organized-equipment dates stay ISO (date inputs read them directly)');

    // Old users and passwords keep working
    await api.post('/api/login').send({username: 'kamil', password: 'admin'}).expect(200);
    await api.post('/api/login').send({username: 'view'}).expect(200);
    assert.equal((await d.get(`SELECT COUNT(*) AS c FROM users WHERE username = 'admin'`)).c, 0, 'no admin seeded into imported db');
});

test('imported old database is fully usable: edit, orders, utilization', async () => {
    const d = await db();
    const {id: lek} = await d.get(`SELECT id FROM Leki WHERE nazwa_leku = 'Ibuprofen'`);
    await api.put(`/api/leki/${lek}`).send({lek_nazwa: 'Ibuprofen', lek_ilosc: 20, lek_data: isoDate(10), lek_ilosc_minimalna: 5}).expect(200);
    assert.equal((await d.get('SELECT status_leku FROM Leki WHERE id = ?', [lek])).status_leku, 'Ważność 1 miesiąc');

    const {body: order} = await api.post('/api/zamowienia').send({nazwa: 'Po imporcie'}).expect(201);
    await api.post('/api/zamowienia/lek').send({id_zamowienia: order.id, id_leku: lek, ilosc: 4, data_waznosci: isoDate(300)}).expect(201);
    await api.put(`/api/zamowienia/${order.id}/status`).send({status: 'Przyjęte'}).expect(200);
    assert.equal((await d.get('SELECT ilosc_wstepna FROM Leki WHERE id = ?', [lek])).ilosc_wstepna, 24);

    const {body: u} = await api.post('/api/utylizacja').send({nazwa: 'Po imporcie'}).expect(201);
    await api.post('/api/utylizacja/lek').send({id_utylizacji: u.id, id_leku: lek, ilosc: 1, powod_utylizacji: 'x'}).expect(201);
    await api.get(`/api/utylizacja/${u.id}`).expect(200);
    await api.get('/api/leki-kategorie').expect(200);
    await api.get('/api/leki-min-kategorie').expect(200);
    await api.get('/api/sprzet-zgrany-kategorie').expect(200);
});

test('import keeps a copy of the replaced database', async () => {
    const copies = fs.readdirSync(getBackupDir()).filter(f => f.startsWith('pre_import_'));
    assert.ok(copies.length >= 1);
});

test('import rejects a missing file, non-SQLite files and foreign databases without touching data', async () => {
    const before = (await (await db()).get('SELECT COUNT(*) AS c FROM Leki')).c;

    await api.post('/api/import-database').expect(400);

    const txt = path.join(tmpDir, 'notes.db');
    fs.writeFileSync(txt, 'to nie jest baza');
    let res = await api.post('/api/import-database').attach('database', txt).expect(400);
    assert.match(res.body.error, /SQLite/);

    const foreign = await sqliteFromSql('CREATE TABLE inne (x);', path.join(tmpDir, 'foreign.db'));
    res = await api.post('/api/import-database').attach('database', foreign).expect(400);
    assert.match(res.body.error, /brak tabeli/);

    const truncated = path.join(tmpDir, 'truncated.db');
    const good = fs.readFileSync(await fixtureDb('good.db'));
    fs.writeFileSync(truncated, good.subarray(0, 4096 + 100));
    await api.post('/api/import-database').attach('database', truncated).expect(400);

    assert.equal((await (await db()).get('SELECT COUNT(*) AS c FROM Leki')).c, before);
    await api.get('/api/health').expect(200);
});

test('import of the real 2025-04 export (when present locally)', {skip: !fs.existsSync(REAL_DUMP) && 'dump not present'}, async () => {
    await api.post('/api/import-database').attach('database', REAL_DUMP).expect(200);
    const d = await db();
    assert.equal((await d.get('SELECT COUNT(*) AS c FROM Leki')).c, 132);
    assert.equal((await d.get(`SELECT COUNT(*) AS c FROM Leki WHERE data_waznosci GLOB '[0-9][0-9][0-9][0-9]-*'`)).c, 0);
    assert.equal((await d.get('PRAGMA integrity_check')).integrity_check, 'ok');
    for (const url of ['/api/leki-kategorie', '/api/sprzet-kategorie', '/api/leki-min-kategorie', '/api/sprzet-zgrany-kategorie', '/api/zamowienia', '/api/utylizacja', '/api/admin/users']) {
        await api.get(url).expect(200);
    }
    await api.get(`/api/leki/status-by-date/${isoDate(30)}`).expect(200);
});

test('rolling and daily backups (daily keeps the newest 7)', async () => {
    await createBackup();
    assert.ok(fs.existsSync(path.join(getBackupDir(), 'db_backup.sqlite3')));
    for (let day = 1; day <= 9; day++) await createDailyBackup(new Date(2026, 0, day));
    const daily = fs.readdirSync(getBackupDir()).filter(f => /^db_backup_\d{8}\.sqlite3$/.test(f)).sort();
    assert.equal(daily.length, 7);
    assert.equal(daily[0], 'db_backup_20260103.sqlite3');
});

test('a successful change triggers the debounced rolling backup', async () => {
    const file = path.join(getBackupDir(), 'db_backup.sqlite3');
    fs.rmSync(file, {force: true});
    await addMedicine(api);
    await new Promise(r => setTimeout(r, 2500));
    assert.ok(fs.existsSync(file));
});
