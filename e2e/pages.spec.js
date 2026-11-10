import {test, expect} from '@playwright/test';
import {login} from './helpers.js';

// Data comes from backend/test/fixtures/old-schema.sql, migrated on server start.
const PAGES = [
    ['/Main/Leki', 'Paracetamol'],
    ['/Main/Sprzet', 'Nosze'],
    ['/zestawienie-lekow', 'Ibuprofen'],
    ['/minimum-lekow', 'Bandaż'],
    ['/zestawienie-sprzetu', 'Defibrylator'],
    ['/utylizacja', 'Lista Utylizacji'],
    ['/zamowienia', 'Lista Zamówień'],
    ['/admin', 'Zarządzanie Użytkownikami'],
    ['/dokumentacja', 'Dokumentacja'],
];

for (const width of [1366, 375]) {
    test(`every page renders without errors or sideways page scroll at ${width}px`, async ({page}) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => m.type() === 'error' && errors.push(m.text()));
        await page.setViewportSize({width, height: 800});
        await login(page);
        for (const [path, text] of PAGES) {
            await page.goto(path);
            await expect(page.getByText(text).first()).toBeVisible();
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0);
        }
        expect(errors).toEqual([]);
    });
}

test('migrated old data shows European dates and computed statuses', async ({page}) => {
    await login(page);
    const row = page.getByRole('row', {name: /Paracetamol/});
    await expect(row).toContainText('15-01-2020');
    await expect(row).toContainText('Przeterminowane');
    await expect(row).toContainText('Do zamówienia');
});
