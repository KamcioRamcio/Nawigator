import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown, addEquipment, isoDate, euDate} from './helpers.js';

let api, db;
before(async () => ({api, db} = await setup()));
after(teardown);

test('POST /sprzet-all stores equipment, booleans and expiry status', async () => {
    const id = await addEquipment(api, {eq_nazwa: 'Nosze', eq_data: isoDate(20), eq_torba_ratownika: 'true', eq_na_statku: 'false'});
    const row = await db.get('SELECT * FROM Sprzet WHERE id = ?', [id]);
    assert.equal(row.data_waznosci, euDate(20));
    assert.equal(row.termin, 'Ważność 1 miesiąc');
    assert.equal(row.ilosc_termin, 'Do zamówienia');
    assert.equal(row.torba_ratownika, 1);
    assert.equal(row.na_statku, 0);
});

test('POST /sprzet-all validates input', async () => {
    await api.post('/api/sprzet-all').send({}).expect(400);
    await api.post('/api/sprzet-all').send({eq_nazwa: 'x', eq_ilosc_aktualna: 'abc'}).expect(400);
});

test('GET /sprzet-kategorie groups by category > subcategory', async () => {
    const {lastID: cat} = await db.run(`INSERT INTO Kategorie_sprzet (nazwa) VALUES ('Ratunkowy')`);
    const id = await addEquipment(api, {eq_kategoria: cat});
    const {body} = await api.get('/api/sprzet-kategorie').expect(200);
    assert.equal(body['Ratunkowy']['null'][0].sprzet_id, id);
});

test('PUT /sprzet/:id keeps booleans/categories not sent; 404 for unknown id', async () => {
    const {lastID: cat} = await db.run(`INSERT INTO Kategorie_sprzet (nazwa) VALUES ('K')`);
    const id = await addEquipment(api, {eq_kategoria: cat, eq_torba_ratownika: 'true'});
    await api.put(`/api/sprzet/${id}`).send({sprzet_nazwa: 'Nowa nazwa', sprzet_ilosc_wymagana: 5, sprzet_ilosc_aktualna: 1, sprzet_data_waznosci: isoDate(400)})
        .expect(200);
    const row = await db.get('SELECT * FROM Sprzet WHERE id = ?', [id]);
    assert.equal(row.nazwa, 'Nowa nazwa');
    assert.equal(row.id_kategorii, cat);
    assert.equal(row.torba_ratownika, 1);
    assert.equal(row.ilosc_termin, 'Uwaga Ilość');
    await api.put('/api/sprzet/999999').send({sprzet_nazwa: 'x'}).expect(404);
});

test('DELETE /sprzet/delete/:id', async () => {
    const id = await addEquipment(api);
    await api.delete(`/api/sprzet/delete/${id}`).expect(200);
    await api.delete(`/api/sprzet/delete/${id}`).expect(404);
});

test('GET /sprzet/status-by-date/:date', async () => {
    const id = await addEquipment(api, {eq_data: isoDate(100)});
    const {body} = await api.get(`/api/sprzet/status-by-date/${isoDate(95)}`).expect(200);
    assert.equal(body.find(e => e.id === id).projected_termin, 'Ważność 1 miesiąc');
    await api.get('/api/sprzet/status-by-date/jutro').expect(400);
});

test('organized equipment: add, partial update (0 is a valid quantity), delete', async () => {
    await api.post('/api/sprzet-zgrany-all').send({ilosc: 1}).expect(400);
    await api.post('/api/sprzet-zgrany-all').send({nazwa_sprzetu: 'Kask', data_waznosci: '2030-01-01', ilosc: 3, na_statku: 1}).expect(201);
    const {id} = await db.get(`SELECT id FROM Sprzet_zgrany_spis WHERE nazwa_sprzetu = 'Kask'`);

    await api.put(`/api/sprzet-zgrany/${id}`).send({nazwa_sprzetu: 'Kask', ilosc: 0}).expect(200);
    const row = await db.get('SELECT * FROM Sprzet_zgrany_spis WHERE id = ?', [id]);
    assert.equal(row.ilosc, 0);
    assert.equal(row.na_statku_spis_podstawowy, 1, 'not sent -> kept');
    assert.equal(row.data_waznosci, '2030-01-01');

    const {body} = await api.get('/api/sprzet-zgrany-kategorie').expect(200);
    assert.equal(body.Uncategorized.null[0].sprzet_zgrany_nazwa, 'Kask');

    await api.put('/api/sprzet-zgrany/999999').send({nazwa_sprzetu: 'x'}).expect(404);
    await api.delete(`/api/sprzet-zgrany/delete/${id}`).expect(200);
    await api.delete(`/api/sprzet-zgrany/delete/${id}`).expect(404);
});
