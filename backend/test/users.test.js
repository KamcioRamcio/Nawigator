import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {setup, teardown} from './helpers.js';

let api, db;
before(async () => {
    ({api, db} = await setup());
    await db.exec(`DELETE FROM users;
        INSERT INTO users (username, password, position) VALUES ('kamil', 'admin', 'admin'), ('view', NULL, 'viewer'), ('pusty', '', 'user');`);
});
after(teardown);

test('GET /admin/users never exposes passwords', async () => {
    const {body} = await api.get('/api/admin/users').expect(200);
    assert.deepEqual(body.map(u => [u.username, u.has_password]), [['kamil', 1], ['view', 0], ['pusty', 0]]);
    assert.ok(body.every(u => !('password' in u)));
});

test('login keeps the old rules: password must match, users without password log in freely', async () => {
    const ok = await api.post('/api/login').send({username: 'kamil', password: 'admin'}).expect(200);
    assert.deepEqual(ok.body, {id: ok.body.id, username: 'kamil', position: 'admin', has_password: true});
    await api.post('/api/login').send({username: 'kamil', password: 'zle'}).expect(401);
    await api.post('/api/login').send({username: 'kamil'}).expect(401);
    await api.post('/api/login').send({username: 'view'}).expect(200);
    await api.post('/api/login').send({username: 'pusty', password: 'cokolwiek'}).expect(200);
    await api.post('/api/login').send({username: 'nikt'}).expect(401);
    await api.post('/api/login').send({}).expect(400);
});

test('create user: validation and duplicate username', async () => {
    await api.post('/api/admin/users').send({username: 'nowy'}).expect(400);
    const {body} = await api.post('/api/admin/users').send({username: 'nowy', password: 'x', position: 'user'}).expect(201);
    assert.ok(body.id);
    await api.post('/api/admin/users').send({username: 'nowy', position: 'user'}).expect(409);
});

test('update user: empty password keeps the old one (admin form sends "")', async () => {
    const {id} = await db.get(`SELECT id FROM users WHERE username = 'kamil'`);
    await api.put(`/api/admin/users/${id}`).send({username: 'kamil', password: '', position: 'admin'}).expect(200);
    let row = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    assert.equal(row.password, 'admin');
    assert.equal(row.position, 'admin');

    await api.put(`/api/admin/users/${id}`).send({password: 'nowe'}).expect(200);
    row = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    assert.equal(row.password, 'nowe');
    assert.equal(row.username, 'kamil');
    await api.put('/api/admin/users/999999').send({position: 'user'}).expect(404);
});

test('delete user', async () => {
    const {id} = await db.get(`SELECT id FROM users WHERE username = 'view'`);
    await api.delete(`/api/admin/users/${id}`).expect(200);
    await api.delete(`/api/admin/users/${id}`).expect(404);
});

test('role must be admin, user or viewer', async () => {
    await api.post('/api/admin/users').send({username: 'zla-rola', position: 'Admin'}).expect(400);
    const {id} = await db.get(`SELECT id FROM users WHERE username = 'pusty'`);
    await api.put(`/api/admin/users/${id}`).send({position: 'manager'}).expect(400);
    await api.put(`/api/admin/users/${id}`).send({position: ''}).expect(200);
});

test('the last admin cannot be deleted or demoted', async () => {
    const {id} = await db.get(`SELECT id FROM users WHERE username = 'kamil'`);
    const res = await api.delete(`/api/admin/users/${id}`).expect(409);
    assert.match(res.body.error, /administrator/);
    await api.put(`/api/admin/users/${id}`).send({position: 'user'}).expect(409);
    assert.equal((await db.get('SELECT position FROM users WHERE id = ?', [id])).position, 'admin');

    // with a second admin both operations are allowed again
    await api.post('/api/admin/users').send({username: 'drugi', position: 'admin'}).expect(201);
    await api.put(`/api/admin/users/${id}`).send({position: 'user'}).expect(200);
});
