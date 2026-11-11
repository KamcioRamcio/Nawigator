import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown, addMedicine, isoDate, euDate} from './helpers.js';

let api, db;
before(async () => ({api, db} = await setup()));
after(teardown);

const findMedicine = (tree, id) => Object.values(tree).flatMap(s => Object.values(s)).flatMap(ss => Object.values(ss)).flat().find(l => l.lek_id === id);

test('POST /leki-all stores the medicine with a European date and computed statuses', async () => {
    const id = await addMedicine(api, {lek_nazwa: 'Apap', lek_data: isoDate(-5)});
    const row = await db.get('SELECT * FROM Leki WHERE id = ?', [id]);
    assert.equal(row.nazwa_leku, 'Apap');
    assert.equal(row.data_waznosci, euDate(-5));
    assert.equal(row.status_leku, 'Przeterminowane');
    assert.equal(row.status, 'Do zamówienia');
    assert.ok(await db.get(`SELECT 1 FROM Leki_spis_min WHERE nazwa_leku = 'Apap'`), 'synced to min list');
});

test('POST /leki-all validates input', async () => {
    let res = await api.post('/api/leki-all').send({lek_ilosc: 1});
    assert.equal(res.status, 400);
    assert.equal(res.body.errors[0].path, 'lek_nazwa');
    res = await api.post('/api/leki-all').send({lek_nazwa: 'x', lek_ilosc: 'dużo'});
    assert.equal(res.status, 400);
});

test('GET /leki-kategorie groups by category > subcategory > subsubcategory', async () => {
    const {lastID: cat} = await db.run(`INSERT INTO Kategorie (nazwa) VALUES ('Przeciwbólowe')`);
    const {lastID: sub} = await db.run(`INSERT INTO Pod_kategorie (nazwa, id_kategorii) VALUES ('Doustne', ?)`, [cat]);
    const id = await addMedicine(api, {lek_nazwa: 'Ibuprom', lek_kategoria: cat, lek_podkategoria: sub});
    const {body} = await api.get('/api/leki-kategorie').expect(200);
    assert.equal(body['Przeciwbólowe']['Doustne']['null'][0].lek_id, id);
    assert.ok(findMedicine(body, id).stan_magazynowy_ilosc === 10);
});

test('PUT /leki/:id updates, recomputes status and 404s for unknown id', async () => {
    const id = await addMedicine(api, {lek_nazwa: 'Zmiana'});
    await api.put(`/api/leki/${id}`).send({lek_nazwa: 'Zmiana', lek_ilosc: 10, lek_data: isoDate(400), lek_ilosc_minimalna: 5, rozchod_ilosc: 7})
        .expect(200);
    const row = await db.get('SELECT * FROM Leki WHERE id = ?', [id]);
    assert.equal(row.rozchod_ilosc, 7);
    assert.equal(row.status, 'Uwaga Ilość');
    await api.put('/api/leki/999999').send({lek_nazwa: 'x'}).expect(404);
    await api.put('/api/leki/abc').send({lek_nazwa: 'x'}).expect(400);
});

test('DELETE /leki/delete/:id removes it (and from min list); unknown id is 404', async () => {
    const id = await addMedicine(api, {lek_nazwa: 'DoUsuniecia'});
    await api.delete(`/api/leki/delete/${id}`).expect(200);
    assert.equal(await db.get('SELECT 1 FROM Leki WHERE id = ?', [id]), undefined);
    assert.equal(await db.get(`SELECT 1 FROM Leki_spis_min WHERE nazwa_leku = 'DoUsuniecia'`), undefined);
    await api.delete(`/api/leki/delete/${id}`).expect(404);
});

test('deleting a medicine used in an order answers 409 instead of 500', async () => {
    const id = await addMedicine(api);
    const {body: order} = await api.post('/api/zamowienia').send({nazwa: 'Z'}).expect(201);
    await api.post('/api/zamowienia/lek').send({id_zamowienia: order.id, id_leku: id, ilosc: 1}).expect(201);
    const res = await api.delete(`/api/leki/delete/${id}`).expect(409);
    assert.match(res.body.error, /powiązania/);
});

test('GET /leki/status-by-date/:date lists medicines whose status will change by then', async () => {
    const id = await addMedicine(api, {lek_nazwa: 'Wkrótce', lek_data: isoDate(100)});
    const {body} = await api.get(`/api/leki/status-by-date/${isoDate(95)}`).expect(200);
    const hit = body.find(m => m.id === id);
    assert.equal(hit.current_status, 'Ważny');
    assert.equal(hit.projected_status, 'Ważność 1 miesiąc');
    await api.get('/api/leki/status-by-date/01-01-2025').expect(400);
});

test('min list: add, update (incl. clearing fields), delete, 404s', async () => {
    const {lastID: cat} = await db.run(`INSERT INTO Kategorie (nazwa) VALUES ('Min')`);
    await api.post('/api/leki-min').send({nazwa_leku: 'MinLek'}).expect(400);
    const {body} = await api.post('/api/leki-min').send({nazwa_leku: 'MinLek', pakowanie: 'amp.', w_opakowaniu: '10', id_kategorii: cat}).expect(201);
    assert.ok(await db.get(`SELECT 1 FROM Leki WHERE nazwa_leku = 'MinLek'`), 'synced to main list');

    await api.put(`/api/leki-min/${body.id}`).send({nazwa_leku: 'MinLek', w_opakowaniu: '', id_kategorii: ''}).expect(200);
    const row = await db.get('SELECT * FROM Leki_spis_min WHERE id = ?', [body.id]);
    assert.equal(row.w_opakowaniu, '');
    assert.equal(row.id_kategorii, null);
    assert.equal(row.pakowanie, 'amp.', 'fields not sent are kept');

    const {body: tree} = await api.get('/api/leki-min-kategorie').expect(200);
    assert.ok(Object.values(tree.Uncategorized).flatMap(Object.values).flat().some(l => l.lek_min_id === body.id));

    // edit forms read the category ids from the list
    await api.put(`/api/leki-min/${body.id}`).send({nazwa_leku: 'MinLek', id_kategorii: cat}).expect(200);
    const {body: tree2} = await api.get('/api/leki-min-kategorie').expect(200);
    const item = Object.values(tree2).flatMap(Object.values).flatMap(Object.values).flat().find(l => l.lek_min_id === body.id);
    assert.equal(item.id_kategorii, cat);
    assert.ok('id_pod_kategorii' in item && 'id_pod_pod_kategorii' in item);

    await api.put('/api/leki-min/999999').send({nazwa_leku: 'x'}).expect(404);
    await api.delete(`/api/leki-min/${body.id}`).expect(200);
    await api.delete(`/api/leki-min/${body.id}`).expect(404);
});
