import {test, expect} from '@playwright/test';
import {login} from './helpers.js';

test('wrong password is rejected, correct one logs in', async ({page}) => {
    await page.goto('/');
    await page.locator('#user-select').selectOption({label: 'kamil'});
    await page.locator('#password').fill('zle');
    await page.getByRole('button', {name: 'Zaloguj się'}).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    await login(page, 'kamil', 'admin');
    await expect(page.getByRole('heading', {name: 'Główny Spis Leków'})).toBeVisible();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('user')));
    expect(stored).toMatchObject({username: 'kamil', position: 'admin'});
    expect(stored.password).toBeUndefined();
});

test('user without password logs in without the password field', async ({page}) => {
    await page.goto('/');
    await page.locator('#user-select').selectOption({label: 'view'});
    await expect(page.locator('#password')).toHaveCount(0);
    await page.getByRole('button', {name: 'Zaloguj się'}).click();
    await page.waitForURL('**/Main/Leki');
});

test('admin panel is only for admins', async ({page}) => {
    await login(page, 'view', null);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/$/);
});
