import fs from 'fs';
import path from 'path';
import {createRequire} from 'module';
import {test, expect} from '@playwright/test';
import {login, api, acceptDialogs} from './helpers.js';

const root = path.resolve(import.meta.dirname, '..');
const REAL_DUMP = path.join(root, 'database_export_2025-04-16.db');

/** SQLite file built from the old-schema fixture (what an export of the old app version looks like). */
async function oldDatabaseFile() {
    const file = path.join(root, 'e2e', '.tmp', 'old-version-export.db');
    fs.rmSync(file, {force: true});
    const sqlite3 = createRequire(path.join(root, 'backend', 'package.json'))('sqlite3');
    const db = new sqlite3.Database(file);
    await new Promise((res, rej) => db.exec(fs.readFileSync(path.join(root, 'backend/test/fixtures/old-schema.sql'), 'utf8'), e => (e ? rej(e) : res())));
    await new Promise(res => db.close(res));
    return file;
}

// Import tests replace the whole database: put the fixture back for the other spec files.
test.afterAll(async ({request}) => {
    const file = await oldDatabaseFile();
    const res = await request.post('/api/import-database', {
        multipart: {database: {name: 'fixture.db', mimeType: 'application/octet-stream', buffer: fs.readFileSync(file)}},
    });
    expect(res.ok()).toBeTruthy();
});

test('users: add, edit position without losing the password, log in as the new user, delete', async ({page}) => {
    acceptDialogs(page);
    await login(page);
    await page.goto('/admin');

    await page.getByRole('button', {name: 'Dodaj Nowego Użytkownika'}).click();
    await page.locator('#username').fill('ola');
    await page.locator('#password').fill('tajne');
    await page.locator('#position').selectOption('user');
    await page.getByRole('button', {name: 'Dodaj Użytkownika'}).click();
    const row = page.getByRole('row', {name: /ola/});
    await expect(row).toContainText('user');
    await expect(row).toContainText('••••••••');

    await row.getByRole('button', {name: 'Edytuj'}).click();
    await row.locator('select').selectOption('viewer');
    await row.getByRole('button', {name: 'Zapisz'}).click();
    await expect(row).toContainText('viewer');
    await expect(row).toContainText('••••••••');

    // password survived the edit
    const res = await page.request.post('/api/login', {data: {username: 'ola', password: 'tajne'}});
    expect(res.status()).toBe(200);

    await row.getByRole('button', {name: 'Usuń'}).click();
    await expect(page.getByRole('row', {name: /ola/})).toHaveCount(0);
});

test('export downloads a database file', async ({page}) => {
    await login(page);
    await page.goto('/admin');
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: /Eksportuj bazę/}).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^database_export_.*\.db$/);
    const header = fs.readFileSync(await file.path()).subarray(0, 15).toString();
    expect(header).toBe('SQLite format 3');
});

test('import rejects a file that is not a database', async ({page}) => {
    await page.goto('/');
    const bogus = path.join(root, 'e2e', '.tmp', 'bogus.db');
    fs.writeFileSync(bogus, 'nie baza');
    await page.locator('input[type="file"]').setInputFiles(bogus);
    await expect(page.getByText(/Plik nie jest bazą danych SQLite/)).toBeVisible();
});

test('import of an old-version export from the login page, then work with it', async ({page}) => {
    await page.goto('/');
    await page.locator('input[type="file"]').setInputFiles(await oldDatabaseFile());
    await expect(page.getByText('Database imported successfully')).toBeVisible();

    await login(page);
    await expect(page.getByRole('row', {name: /Paracetamol/})).toContainText('15-01-2020');
    await page.goto('/zamowienia');
    await expect(page.getByText('Brak zamówień')).toBeVisible();
});

test('import of the real 2025-04 export through the admin panel', async ({page}) => {
    test.skip(!fs.existsSync(REAL_DUMP), 'local dump not present');
    await login(page);
    await page.goto('/admin');
    await page.locator('input[type="file"]').setInputFiles(REAL_DUMP);
    await expect(page.getByText('Baza danych zaimportowana pomyślnie!')).toBeVisible();
    const users = await api(page, 'admin/users');
    expect(users.length).toBeGreaterThan(0);
    expect(users.every(u => !('password' in u))).toBe(true);
    await page.goto('/Main/Leki');
    await expect(page.locator('tbody tr').nth(5)).toBeVisible();
});
