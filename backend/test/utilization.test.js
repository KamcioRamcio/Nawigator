import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown, addMedicine, addEquipment} from './helpers.js';
import {todayEuropean} from '../db/utils.js';

let api, db;
before(async () => ({api, db} = await setup()));
after(teardown);

const create = async (body = {nazwa: 'Utylizacja'}) => (await api.post('/api/utylizacja').send(body).expect(201)).body.id;

test('create with defaults and validation', async () => {
    const id = await create({nazwa: 'U1', kto_utworzyl: 'kamil'});
    const row = await db.get('SELECT * FROM Utylizacje WHERE id = ?', [id]);
    assert.equal(row.status, 'Nowa');
    assert.equal(row.data_utworzenia, todayEuropean());
    assert.equal(row.kto_utworzyl, 'kamil');
    await api.post('/api/utylizacja').send({}).expect(400);
});

test('items: add medicine + equipment, list counts, details', async () => {
    const id = await create();
    const lek = await addMedicine(api, {lek_nazwa: 'Stary lek'});
    const sprzet = await addEquipment(api, {eq_nazwa: 'Stary sprzęt'});
    await api.post('/api/utylizacja/lek').send({id_utylizacji: id, id_leku: lek, ilosc: 2, powod_utylizacji: 'Przeterminowany', nazwa_leku: 'Stary lek'}).expect(201);
    await api.post('/api/utylizacja/sprzet').send({id_utylizacji: id, id_sprzetu: sprzet, ilosc: 1, powod_utylizacji: 'Uszkodzony', nazwa_sprzetu: 'Stary sprzęt'}).expect(201);
    await api.post('/api/utylizacja/lek').send({id_utylizacji: id, ilosc: 2}).expect(400);

    const list = (await api.get('/api/utylizacja').expect(200)).body;
    const mine = list.find(u => u.id === id);
    assert.equal(mine.leki_count, 1);
    assert.equal(mine.sprzet_count, 1);

    const {body} = await api.get(`/api/utylizacja/${id}`).expect(200);
    assert.equal(body.leki[0].nazwa_leku, 'Stary lek');
    assert.equal(body.sprzet[0].nazwa_sprzetu, 'Stary sprzęt');
});

test('history survives deleting the medicine (name kept)', async () => {
    const id = await create();
    const lek = await addMedicine(api, {lek_nazwa: 'Znikający'});
    await api.post('/api/utylizacja/lek').send({id_utylizacji: id, id_leku: lek, ilosc: 1, powod_utylizacji: 'x', nazwa_leku: 'Znikający'}).expect(201);
    await api.delete(`/api/leki/delete/${lek}`).expect(200);
    const {body} = await api.get(`/api/utylizacja/${id}`).expect(200);
    assert.equal(body.leki[0].nazwa_leku, 'Znikający');
});

test('name is copied from the item when the client does not send it', async () => {
    const id = await create();
    const lek = await addMedicine(api, {lek_nazwa: 'Bez nazwy w żądaniu'});
    await api.post('/api/utylizacja/lek').send({id_utylizacji: id, id_leku: lek, ilosc: 1, powod_utylizacji: 'x', data_waznosci: '2027-05-31'}).expect(201);
    await api.delete(`/api/leki/delete/${lek}`).expect(200);
    const {body} = await api.get(`/api/utylizacja/${id}`).expect(200);
    assert.equal(body.leki[0].nazwa_leku, 'Bez nazwy w żądaniu');
    assert.equal(body.leki[0].data_waznosci, '31-05-2027');
});

test('update status/details (fields not sent are kept) and 404s', async () => {
    const id = await create({nazwa: 'U', uwagi: 'notatka'});
    await api.put(`/api/utylizacja/${id}/status`).send({status: 'Zakończona'}).expect(200);
    await api.put(`/api/utylizacja/${id}/details`).send({nazwa: 'U2'}).expect(200);
    const row = await db.get('SELECT * FROM Utylizacje WHERE id = ?', [id]);
    assert.equal(row.nazwa, 'U2');
    assert.equal(row.status, 'Zakończona');
    assert.equal(row.uwagi, 'notatka');
    await api.put(`/api/utylizacja/${id}/details`).send({}).expect(400);
    await api.put('/api/utylizacja/999999/status').send({status: 'x'}).expect(404);
    await api.get('/api/utylizacja/999999').expect(404);
});

test('edit, remove items and delete whole utilization', async () => {
    const id = await create();
    const {body: l} = await api.post('/api/utylizacja/lek').send({id_utylizacji: id, ilosc: 1, powod_utylizacji: 'x', nazwa_leku: 'L'}).expect(201);
    const {body: s} = await api.post('/api/utylizacja/sprzet').send({id_utylizacji: id, ilosc: 1, powod_utylizacji: 'x', nazwa_sprzetu: 'S'}).expect(201);

    await api.put(`/api/utylizacja/lek/${l.id}`).send({ilosc: 3, powod_utylizacji: 'Zniszczony'}).expect(200);
    await api.put(`/api/utylizacja/sprzet/${s.id}`).send({ilosc: 'abc'}).expect(400);
    await api.put(`/api/utylizacja/sprzet/${s.id}`).send({ilosc: 2}).expect(200);
    const lek = await db.get('SELECT * FROM Utylizacje_Leki WHERE id = ?', [l.id]);
    assert.equal(lek.ilosc, 3);
    assert.equal(lek.powod_utylizacji, 'Zniszczony');

    await api.delete(`/api/utylizacja/lek/${l.id}`).expect(200);
    await api.delete(`/api/utylizacja/lek/${l.id}`).expect(404);

    await api.delete(`/api/utylizacja/${id}`).expect(200);
    assert.equal((await db.get('SELECT COUNT(*) AS c FROM Utylizacje_Sprzet WHERE id_utylizacji = ?', [id])).c, 0);
    await api.delete(`/api/utylizacja/${id}`).expect(404);
});
