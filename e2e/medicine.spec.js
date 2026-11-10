import {test, expect} from '@playwright/test';
import {login, api, allMedicines, acceptDialogs} from './helpers.js';

// Row actions sit behind a ⚙️ toggle (⬆️ when already open).
const rowActions = async (page, name) => {
    const row = page.getByRole('row', {name: new RegExp(name)});
    const toggle = row.getByRole('button', {name: /⚙/});
    if (await toggle.count()) await toggle.click();
    return row;
};

test('add, edit and delete a medicine from the main list', async ({page}) => {
    acceptDialogs(page);
    await login(page);

    // add
    await page.getByRole('button', {name: 'Dodaj Pozycję'}).click();
    await page.locator('input[name="lek_nazwa"]').fill('Aspiryna E2E');
    await page.locator('input[name="lek_ilosc"]').fill('12');
    await page.locator('input[name="lek_data"]').fill('2031-05-20');
    await page.locator('input[name="lek_ilosc_minimalna"]').fill('3');
    await page.locator('select[name="lek_kategoria"]').selectOption({index: 1});
    await page.getByRole('button', {name: 'Dodaj', exact: true}).click();
    const row = page.getByRole('row', {name: /Aspiryna E2E/});
    await expect(row).toContainText('20-05-2031');
    await expect(row).toContainText('W porządku');

    // single-row edit
    await rowActions(page, 'Aspiryna E2E');
    await row.getByRole('button', {name: /Edytuj/}).click();
    const qty = row.locator('input[type="number"]').first();
    await qty.fill('2');
    await row.getByRole('button', {name: /Zapisz/}).click();
    await expect(row).toContainText('Uwaga Ilość');
    const saved = allMedicines(await api(page, 'leki-kategorie')).find(m => m.lek_nazwa === 'Aspiryna E2E');
    expect(saved.lek_ilosc).toBe(2);
    expect(saved.lek_data).toBe('20-05-2031');

    // delete
    await rowActions(page, 'Aspiryna E2E');
    await row.getByRole('button', {name: /Usuń/}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Potwierdź'}).click();
    await expect(page.getByRole('row', {name: /Aspiryna E2E/})).toHaveCount(0);
    expect(allMedicines(await api(page, 'leki-kategorie')).some(m => m.lek_nazwa === 'Aspiryna E2E')).toBe(false);
});

test('main list PDF is generated and downloaded', async ({page}) => {
    await login(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: /Generuj PDF/}).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/\.pdf$/);
});

test('future status preview lists medicines that will change status', async ({page}) => {
    await login(page);
    await page.getByRole('button', {name: 'Sprawdź statusy w przyszłej dacie'}).click();
    await page.locator('input[type="date"]').last().fill('2099-11-01');
    await expect(page.getByText('Ibuprofen').last()).toBeVisible();
});
