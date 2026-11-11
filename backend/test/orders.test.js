import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown, addMedicine, addEquipment, isoDate, euDate} from './helpers.js';
import {todayEuropean} from '../db/utils.js';

let api, db;
before(async () => ({api, db} = await setup()));
after(teardown);

async function orderWithItems({medicine = {}, equipment = {}, item = {}} = {}) {
    const lek = await addMedicine(api, medicine);
    const sprzet = await addEquipment(api, equipment);
    const {body: order} = await api.post('/api/zamowienia').send({nazwa: 'Dostawa'}).expect(201);
    await api.post('/api/zamowienia/lek').send({id_zamowienia: order.id, id_leku: lek, ilosc: 5, data_waznosci: isoDate(500), ...item}).expect(201);
    await api.post('/api/zamowienia/sprzet').send({id_zamowienia: order.id, id_sprzetu: sprzet, ilosc: 2, data_waznosci: isoDate(500), ...item}).expect(201);
    return {order: order.id, lek, sprzet};
}

test('create order: defaults (status Nowe, today DD-MM-YYYY) and validation', async () => {
    const {body} = await api.post('/api/zamowienia').send({nazwa: 'Pierwsze'}).expect(201);
    const row = await db.get('SELECT * FROM Zamowienia WHERE id = ?', [body.id]);
    assert.equal(row.status, 'Nowe');
    assert.equal(row.data_zamowienia, todayEuropean());
    await api.post('/api/zamowienia').send({nazwa: '  '}).expect(400);
    // the frontend sends toLocaleDateString('pl-PL')
    const {body: dotted} = await api.post('/api/zamowienia').send({nazwa: 'Kropki', data_zamowienia: '7.11.2026'}).expect(201);
    assert.equal((await db.get('SELECT data_zamowienia AS d FROM Zamowienia WHERE id = ?', [dotted.id])).d, '07-11-2026');
});

test('list is sorted by date (newest first) with item counts', async () => {
    await db.run(`INSERT INTO Zamowienia (nazwa, data_zamowienia) VALUES ('stare', '31-12-2020'), ('nowsze', '01-01-2021')`);
    const {order} = await orderWithItems();
    const {body} = await api.get('/api/zamowienia').expect(200);
    const names = body.map(o => o.nazwa);
    assert.ok(names.indexOf('nowsze') < names.indexOf('stare'), 'chronological, not text order');
    const mine = body.find(o => o.id === order);
    assert.equal(mine.leki_count, 1);
    assert.equal(mine.sprzet_count, 1);
});

test('GET /zamowienia/:id returns items; unknown is 404', async () => {
    const {order, lek} = await orderWithItems();
    const {body} = await api.get(`/api/zamowienia/${order}`).expect(200);
    assert.equal(body.leki[0].id_leku, lek);
    assert.ok(body.sprzet[0].nazwa_sprzetu);
    await api.get('/api/zamowienia/999999').expect(404);
});

test('adding items marks them "W zamówieniu: <name>"', async () => {
    const {lek, sprzet} = await orderWithItems();
    assert.equal((await db.get('SELECT status FROM Leki WHERE id = ?', [lek])).status, 'W zamówieniu: Dostawa');
    assert.equal((await db.get('SELECT ilosc_termin FROM Sprzet WHERE id = ?', [sprzet])).ilosc_termin, 'W zamówieniu: Dostawa');
});

test('status "Zamówione" marks items as ordered', async () => {
    const {order, lek, sprzet} = await orderWithItems();
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Zamówione'}).expect(200);
    assert.equal((await db.get('SELECT status FROM Leki WHERE id = ?', [lek])).status, 'Zamówione');
    assert.equal((await db.get('SELECT ilosc_termin FROM Sprzet WHERE id = ?', [sprzet])).ilosc_termin, 'Zamówione');
});

test('status "Przyjęte" adds stock once, records history, sets expiry only when stock was empty', async () => {
    const {order, lek, sprzet} = await orderWithItems({
        medicine: {lek_ilosc: 0, lek_data: ''},
        equipment: {eq_ilosc_aktualna: 1, eq_data: isoDate(30)},
    });
    for (let i = 0; i < 2; i++) {
        await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    }
    const leki = await db.get('SELECT * FROM Leki WHERE id = ?', [lek]);
    assert.equal(leki.ilosc_wstepna, 5, 'stock added exactly once');
    assert.equal(leki.data_waznosci, euDate(500), 'empty item takes the delivered expiry');
    assert.equal(leki.important_status, `5x${euDate(500)}`);

    const s = await db.get('SELECT * FROM Sprzet WHERE id = ?', [sprzet]);
    assert.equal(s.ilosc_aktualna, 3);
    assert.equal(s.data_waznosci, euDate(30), 'item in stock keeps its own expiry');
    assert.equal(s.status, `2x${euDate(500)}`);
});

test('leaving "Przyjęte" is blocked (409) unless the receipt is undone; undo restores stock, date and history', async () => {
    const {order, lek, sprzet} = await orderWithItems({
        medicine: {lek_ilosc: 0, lek_data: ''},
        equipment: {eq_ilosc_aktualna: 1, eq_data: isoDate(30)},
    });
    await db.run(`UPDATE Leki SET important_status = 'notatka' WHERE id = ?`, [lek]);
    const before = {
        lek: await db.get('SELECT ilosc_wstepna, data_waznosci, important_status FROM Leki WHERE id = ?', [lek]),
        sprzet: await db.get('SELECT ilosc_aktualna, data_waznosci, status FROM Sprzet WHERE id = ?', [sprzet]),
    };
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    assert.equal((await db.get('SELECT ilosc_wstepna AS q FROM Leki WHERE id = ?', [lek])).q, 5);

    const blocked = await api.put(`/api/zamowienia/${order}/status`).send({status: 'Nowe'}).expect(409);
    assert.equal(blocked.body.code, 'ORDER_RECEIVED');
    assert.equal((await db.get('SELECT status FROM Zamowienia WHERE id = ?', [order])).status, 'Przyjęte');

    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Nowe', cofnijPrzyjecie: true}).expect(200);
    assert.deepEqual({...await db.get('SELECT ilosc_wstepna, data_waznosci, important_status FROM Leki WHERE id = ?', [lek])}, {...before.lek});
    assert.deepEqual({...await db.get('SELECT ilosc_aktualna, data_waznosci, status FROM Sprzet WHERE id = ?', [sprzet])}, {...before.sprzet});
    assert.equal((await db.get('SELECT data_przyjecia FROM Zamowienia WHERE id = ?', [order])).data_przyjecia, null);
    assert.equal((await db.get('SELECT status FROM Leki WHERE id = ?', [lek])).status, 'W zamówieniu: Dostawa');

    // received again after the undo: stock added once more (the undo took it off)
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    assert.equal((await db.get('SELECT ilosc_wstepna AS q FROM Leki WHERE id = ?', [lek])).q, 5);
});

test('"Przyjęte" -> "Zakończone" keeps the stock; leaving "Zakończone" of a received order also needs the undo', async () => {
    const {order, lek} = await orderWithItems({medicine: {lek_ilosc: 10}});
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Zakończone'}).expect(200);
    assert.equal((await db.get('SELECT ilosc_wstepna AS q FROM Leki WHERE id = ?', [lek])).q, 15);
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Anulowane'}).expect(409);
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Anulowane', cofnijPrzyjecie: true}).expect(200);
    assert.equal((await db.get('SELECT ilosc_wstepna AS q FROM Leki WHERE id = ?', [lek])).q, 10);
});

test('undo keeps a date changed after the delivery and skips items added later', async () => {
    const {order, lek} = await orderWithItems({medicine: {lek_ilosc: 0, lek_data: ''}});
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Przyjęte'}).expect(200);
    await db.run(`UPDATE Leki SET data_waznosci = '01-01-2040' WHERE id = ?`, [lek]);
    const extra = await addMedicine(api, {lek_ilosc: 3});
    await api.post('/api/zamowienia/lek').send({id_zamowienia: order, id_leku: extra, ilosc: 7}).expect(201);

    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Zamówione', cofnijPrzyjecie: true}).expect(200);
    const row = await db.get('SELECT ilosc_wstepna, data_waznosci FROM Leki WHERE id = ?', [lek]);
    assert.equal(row.ilosc_wstepna, 0);
    assert.equal(row.data_waznosci, '01-01-2040', 'manual change after delivery is kept');
    assert.equal((await db.get('SELECT ilosc_wstepna AS q FROM Leki WHERE id = ?', [extra])).q, 3, 'item never received is untouched');
});

test('PUT /zamowienia/:id/details changes name and date; fields not sent are kept', async () => {
    const {order} = await orderWithItems();
    await api.put(`/api/zamowienia/${order}/details`).send({nazwa: 'Nowa nazwa', data_zamowienia: '2026-03-05'}).expect(200);
    let row = await db.get('SELECT nazwa, data_zamowienia FROM Zamowienia WHERE id = ?', [order]);
    assert.deepEqual({...row}, {nazwa: 'Nowa nazwa', data_zamowienia: '05-03-2026'});
    await api.put(`/api/zamowienia/${order}/details`).send({uwagi: 'x'}).expect(200);
    row = await db.get('SELECT nazwa, data_zamowienia FROM Zamowienia WHERE id = ?', [order]);
    assert.equal(row.nazwa, 'Nowa nazwa');
    await api.put(`/api/zamowienia/${order}/details`).send({nazwa: '  '}).expect(400);
    await api.put('/api/zamowienia/999999/details').send({nazwa: 'a'}).expect(404);
});

test('order item expiry dates are stored as DD-MM-YYYY', async () => {
    const {order} = await orderWithItems({item: {data_waznosci: '2030-01-31'}});
    const {body} = await api.get(`/api/zamowienia/${order}`);
    assert.equal(body.leki[0].data_waznosci, '31-01-2030');
    await api.put(`/api/zamowienia/sprzet/${body.sprzet[0].id}`).send({ilosc: 1, data_waznosci: '2031-02-28'}).expect(200);
    assert.equal((await db.get('SELECT data_waznosci AS d FROM Zamowienia_Sprzet WHERE id = ?', [body.sprzet[0].id])).d, '28-02-2031');
});

test('status validation and 404', async () => {
    const {order} = await orderWithItems();
    await api.put(`/api/zamowienia/${order}/status`).send({status: 'Coś'}).expect(400);
    await api.put('/api/zamowienia/999999/status').send({status: 'Nowe'}).expect(404);
});

test('edit and remove order items; 404 for unknown items; negative quantity rejected', async () => {
    const {order} = await orderWithItems();
    const {body} = await api.get(`/api/zamowienia/${order}`);
    const [lekItem, sprzetItem] = [body.leki[0], body.sprzet[0]];

    await api.put(`/api/zamowienia/lek/${lekItem.id}`).send({ilosc: 9, uwagi: 'pilne', data_waznosci: '2030-01-01'}).expect(200);
    assert.equal((await db.get('SELECT ilosc FROM Zamowienia_Leki WHERE id = ?', [lekItem.id])).ilosc, 9);
    await api.put(`/api/zamowienia/sprzet/${sprzetItem.id}`).send({ilosc: -1}).expect(400);
    await api.put(`/api/zamowienia/sprzet/${sprzetItem.id}`).send({ilosc: 4}).expect(200);
    await api.put('/api/zamowienia/lek/999999').send({ilosc: 1}).expect(404);

    await api.delete(`/api/zamowienia/lek/${lekItem.id}`).expect(200);
    await api.delete(`/api/zamowienia/sprzet/${sprzetItem.id}`).expect(200);
    await api.delete(`/api/zamowienia/lek/${lekItem.id}`).expect(404);
});

test('adding an item to a missing order is 409, not 500', async () => {
    const lek = await addMedicine(api);
    await api.post('/api/zamowienia/lek').send({id_zamowienia: 999999, id_leku: lek, ilosc: 1}).expect(409);
    await api.post('/api/zamowienia/lek').send({id_zamowienia: 1}).expect(400);
});

test('deleting an order removes its items and frees item statuses', async () => {
    const {order, lek} = await orderWithItems({medicine: {lek_ilosc: 10, lek_ilosc_minimalna: 1}});
    await api.delete(`/api/zamowienia/${order}`).expect(200);
    assert.equal((await db.get('SELECT COUNT(*) AS c FROM Zamowienia_Leki WHERE id_zamowienia = ?', [order])).c, 0);
    assert.equal((await db.get('SELECT status FROM Leki WHERE id = ?', [lek])).status, 'W porządku');
    await api.delete(`/api/zamowienia/${order}`).expect(404);
});
