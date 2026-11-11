import {test, expect} from '@playwright/test';
import {login, api, allMedicines} from './helpers.js';

const ibuprofen = async (page) => allMedicines(await api(page, 'leki-kategorie')).find(m => m.lek_nazwa === 'Ibuprofen');

test('order lifecycle: create from a medicine row, mark as received, stock goes up once', async ({page}) => {
    await login(page);
    const stockBefore = (await ibuprofen(page)).lek_ilosc;

    // 🛒 on the Ibuprofen row -> new order with 5 pcs
    const row = page.getByRole('row', {name: /Ibuprofen/});
    await row.getByRole('button', {name: /⚙/}).click();
    await row.getByRole('button', {name: /Zamów/}).click();
    await page.locator('input[name="orderType"]').nth(1).check();
    await page.getByPlaceholder('Wprowadź nazwę zamówienia').fill('Dostawa E2E');
    await page.getByRole('button', {name: 'Utwórz zamówienie'}).click();
    await page.locator('input[type="number"][min="0"]').fill('5');
    await page.getByRole('button', {name: 'Dodaj do zamówienia'}).last().click();
    await expect.poll(async () => (await ibuprofen(page)).stan_magazynowy_status).toBe('W zamówieniu: Dostawa E2E');

    // order list -> details -> status "Przyjęte"
    await page.goto('/zamowienia');
    const orderRow = page.getByRole('row', {name: /Dostawa E2E/});
    await expect(orderRow).toContainText('Nowe');
    await orderRow.getByRole('button', {name: 'Zobacz szczegóły'}).click();
    await expect(page.getByText('Szczegóły zamówienia')).toBeVisible();
    await expect(page.getByText('Ibuprofen')).toBeVisible();
    await page.getByRole('button', {name: /Opcje/}).click();
    await page.getByRole('button', {name: 'Edytuj'}).click();
    await page.locator('select').filter({has: page.locator('option', {hasText: 'Przyjęte'})}).last().selectOption('Przyjęte');
    await page.getByRole('button', {name: 'Zapisz'}).click();
    await expect.poll(async () => (await ibuprofen(page)).lek_ilosc).toBe(stockBefore + 5);

    // saving the same status again must not add stock twice
    const [order] = (await api(page, 'zamowienia')).filter(o => o.nazwa === 'Dostawa E2E');
    await api(page, `zamowienia/${order.id}/status`, {method: 'PUT', data: {status: 'Przyjęte'}});
    expect((await ibuprofen(page)).lek_ilosc).toBe(stockBefore + 5);
});

test('order PDF can be generated from the details view', async ({page}) => {
    await login(page);
    await page.goto('/zamowienia');
    await page.getByRole('row', {name: /Dostawa E2E/}).getByRole('button', {name: 'Zobacz szczegóły'}).click();
    await page.getByRole('button', {name: /Opcje/}).click();
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: /PDF/}).click();
    expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
});

test('received order: rename + date save, status locked behind the undo card, undo takes the stock back', async ({page}) => {
    await login(page);
    const stockReceived = (await ibuprofen(page)).lek_ilosc;
    await page.goto('/zamowienia');
    await page.getByRole('row', {name: /Dostawa E2E/}).getByRole('button', {name: 'Zobacz szczegóły'}).click();
    await page.getByRole('button', {name: /Opcje/}).click();
    await page.getByRole('button', {name: 'Edytuj'}).click();

    // the stored DD-MM-YYYY date is shown in the date input; name and date are saved
    const [nameInput, dateInput] = [page.locator('.fixed input[type="text"]').first(), page.locator('.fixed input[type="date"]').first()];
    await expect(dateInput).not.toHaveValue('');
    await nameInput.fill('Dostawa E2E zmieniona');
    await dateInput.fill('2026-03-05');
    // only statuses that keep the receipt are offered in the normal select
    await expect(page.locator('.fixed select').first().locator('option')).toHaveText(['Przyjęte', 'Zakończone']);
    await page.getByRole('button', {name: 'Zapisz'}).click();
    await expect(page.getByText('Zamówienie zaktualizowane pomyślnie')).toBeVisible();
    const [order] = (await api(page, 'zamowienia')).filter(o => o.nazwa === 'Dostawa E2E zmieniona');
    expect(order.data_zamowienia).toBe('05-03-2026');

    // undo card: two steps, Anuluj keeps everything
    await page.getByRole('button', {name: 'Edytuj'}).click();
    const card = page.getByRole('region', {name: 'Zamówienie przyjęte'});
    await expect(card).toContainText('zostało już przyjęte');
    await card.getByLabel('Nowy status').selectOption('Nowe');
    await card.getByRole('button', {name: 'Tak, zmień status'}).click();
    await expect(card).toContainText('zostaną cofnięte');
    await expect(card).toContainText('Ibuprofen: −5');
    await card.getByRole('button', {name: 'Anuluj'}).click();
    expect((await ibuprofen(page)).lek_ilosc).toBe(stockReceived);

    await card.getByRole('button', {name: 'Tak, zmień status'}).click();
    await card.getByRole('button', {name: 'Zmień'}).click();
    await expect.poll(async () => (await ibuprofen(page)).lek_ilosc).toBe(stockReceived - 5);
    expect((await api(page, `zamowienia/${order.id}`)).status).toBe('Nowe');
    expect((await ibuprofen(page)).stan_magazynowy_status).toBe('W zamówieniu: Dostawa E2E zmieniona');
});
