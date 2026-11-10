import {test, expect} from '@playwright/test';
import {login, api} from './helpers.js';

test('utilization lifecycle: dispose a medicine, review it, remove item and the whole record', async ({page}) => {
    await login(page);

    // "Utylizuj" on the expired Paracetamol -> new utilization
    const row = page.getByRole('row', {name: /Paracetamol/});
    await row.getByRole('button', {name: /⚙/}).click();
    await row.getByRole('button', {name: 'Utylizuj'}).click();
    await page.locator('input[name="utilizationType"]').nth(1).check();
    await page.getByPlaceholder('Wprowadź nazwę utylizacji').fill('Utylizacja E2E');
    await page.getByRole('button', {name: 'Utwórz utylizację'}).click();
    // the form is reset once the new utilization is selected
    await expect(page.locator('select').filter({hasText: 'Utylizacja E2E (Nowa)'})).toBeVisible();
    await page.locator('input[name="ilosc_nominalna"]').fill('2');
    await page.locator('textarea[name="powod_utylizacji"]').fill('Przeterminowany');
    await page.getByRole('button', {name: /🗑️ Utylizuj/}).click();
    await expect(page.getByText('Utylizacja została przeprowadzona pomyślnie!')).toBeVisible();

    const [created] = (await api(page, 'utylizacja')).filter(u => u.nazwa === 'Utylizacja E2E');
    expect(created).toMatchObject({leki_count: 1, status: 'Nowa', kto_utworzyl: 'kamil'});

    // list -> details
    await page.goto('/utylizacja');
    await page.getByRole('button', {name: 'Zobacz szczegóły'}).first().click();
    await expect(page.getByText('Szczegóły utylizacji')).toBeVisible();
    await expect(page.getByRole('cell', {name: 'Paracetamol'})).toBeVisible();

    // remove the item (used a wrong URL before)
    await page.getByRole('row', {name: /Paracetamol/}).getByRole('button', {name: 'Usuń'}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Potwierdź'}).click();
    await expect(page.getByRole('cell', {name: 'Paracetamol'})).toHaveCount(0);
    expect((await api(page, `utylizacja/${created.id}`)).leki).toHaveLength(0);

    // delete the whole utilization
    await page.getByRole('button', {name: /Opcje/}).click();
    await page.getByRole('button', {name: 'Usuń'}).first().click();
    await page.getByRole('dialog').getByRole('button', {name: 'Potwierdź'}).click();
    await expect.poll(async () => (await api(page, 'utylizacja')).some(u => u.id === created.id)).toBe(false);
});

test('create an empty utilization from the list page', async ({page}) => {
    await login(page);
    await page.goto('/utylizacja');
    await page.getByRole('button', {name: /Nowa utylizacja/}).click();
    await page.getByPlaceholder('Wprowadź nazwę utylizacji').fill('Pusta E2E');
    await page.getByRole('button', {name: 'Utwórz utylizację'}).click();
    await expect(page.getByText('Pusta E2E').first()).toBeVisible();
});
