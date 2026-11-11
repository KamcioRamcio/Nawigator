// backend/db/userQueries.js
import {getDb} from './index.js';

// Passwords never leave the server; clients only learn whether one is set.
const PUBLIC_COLUMNS = `id, username, position, (password IS NOT NULL AND password != '') AS has_password`;

export async function fetchUsers() {
    const db = await getDb();
    return db.all(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY id`);
}

/**
 * Same rule the old client-side login used: a user without a password logs in
 * without one, otherwise the password must match. Returns the public user or null.
 */
export async function verifyLogin(username, password) {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || (user.password && user.password !== password)) return null;
    return {id: user.id, username: user.username, position: user.position, has_password: Boolean(user.password)};
}

export async function addUser({username, password, position}) {
    const db = await getDb();
    const result = await db.run(
        'INSERT INTO users (username, password, position) VALUES (?, ?, ?)',
        [username, password || null, position]
    );
    return result.lastID;
}

/** Omitted or empty fields keep their current value (the admin form sends an empty password when unchanged). */
export async function updateUser(id, {username, password, position}) {
    const db = await getDb();
    const result = await db.run(
        `UPDATE users
         SET username = COALESCE(NULLIF(?, ''), username),
             password = COALESCE(NULLIF(?, ''), password),
             position = COALESCE(NULLIF(?, ''), position)
         WHERE id = ?`,
        [username ?? null, password ?? null, position ?? null, id]
    );
    return result.changes;
}

export async function deleteUser(id) {
    const db = await getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes;
}

/** True when this user is the only admin left (removing or demoting them would lock everyone out of the admin panel). */
export async function isLastAdmin(id) {
    const db = await getDb();
    const user = await db.get('SELECT position FROM users WHERE id = ?', [id]);
    if (user?.position !== 'admin') return false;
    const {count} = await db.get(`SELECT COUNT(*) AS count FROM users WHERE position = 'admin'`);
    return count === 1;
}
