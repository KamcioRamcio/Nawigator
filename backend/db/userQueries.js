// backend/db/userQueries.js
import {getDb} from './index.js';

// User management functions
export async function fetchUsers() {
    const db = await getDb();
    return await db.all('SELECT * FROM users');
}

export async function addUser(userData) {
    const db = await getDb();
    const { username, password, position } = userData;

    const result = await db.run(
        'INSERT INTO users (username, password, position) VALUES (?, ?, ?)',
        [username, password || null, position]
    );

    return result.lastID;
}

export async function updateUser(id, userData) {
    const db = await getDb();
    const { username, password, position } = userData;

    // Check if we're updating the password
    if (password !== undefined) {
        await db.run(
            'UPDATE users SET username = ?, password = ?, position = ? WHERE id = ?',
            [username, password, position, id]
        );
    } else {
        // If not updating password, only update other fields
        await db.run(
            'UPDATE users SET username = ?, position = ? WHERE id = ?',
            [username, position, id]
        );
    }

    return id;
}

export async function deleteUser(id) {
    const db = await getDb();
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'User deleted successfully' };
}
