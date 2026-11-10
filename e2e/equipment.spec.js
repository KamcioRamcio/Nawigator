import {test, expect} from '@playwright/test';
import {login, api} from './helpers.js';

const allEquipment = (tree) => Object.values(tree).flatMap(Object.values).flat();

test('add equipment from the minimum equipment list (button used to post an empty form)', async ({page}) => {
    await login(page);
    await page.goto('/Main/Sprzet');
    await page.getByRole('button', {name: 'Dodaj Pozycję'}).click();
    await page.locator('input[name="eq_nazwa"]').fill('Latarka E2E');
    await page.locator('input[name="eq_ilosc_wymagana"]').fill('2');
    await page.locator('input[name="eq_ilosc_aktualna"]').fill('1');
    await page.locator('input[name="eq_data"]').fill('2032-01-10');
    await page.locator('select[name="eq_kategoria"]').selectOption({index: 1});
    await page.getByRole('button', {name: 'Dodaj', exact: true}).click();
    await expect(page.getByRole('row', {name: /Latarka E2E/})).toContainText('10-01-2032');
    const saved = allEquipment(await api(page, 'sprzet-kategorie')).find(e => e.sprzet_nazwa === 'Latarka E2E');
    expect(saved).toMatchObject({sprzet_ilosc_wymagana: 2, sprzet_ilosc_aktualna: 1, sprzet_ilosc_termin: 'Uwaga Ilość'});
});

test('add a medicine to the minimum list, it also appears on the main list', async ({page}) => {
    await login(page);
    await page.goto('/minimum-lekow');
    await page.getByRole('button', {name: 'Dodaj Pozycję'}).click();
    await page.locator('input[name="nazwa_leku"]').fill('Witamina E2E');
    await page.locator('select[name="id_kategorii"]').selectOption({index: 1});
    await page.getByRole('button', {name: 'Dodaj', exact: true}).click();
    await expect(page.getByText('Witamina E2E').first()).toBeVisible();
    await page.goto('/Main/Leki');
    await expect(page.getByRole('row', {name: /Witamina E2E/})).toBeVisible();
});
