import {expect} from '@playwright/test';

/** Log in through the real login form. */
export async function login(page, username = 'kamil', password = 'admin') {
    await page.goto('/');
    const select = page.locator('#user-select');
    await expect(select.locator('option', {hasText: username})).toHaveCount(1);
    await select.selectOption({label: username});
    if (password !== null) await page.locator('#password').fill(password);
    await page.getByRole('button', {name: 'Zaloguj się'}).click();
    await page.waitForURL('**/Main/Leki');
}

/** Read JSON from the API in the same browser context. */
export async function api(page, url, options) {
    const res = await page.request.fetch(`/api/${url}`, options);
    expect(res.ok(), `${url} -> ${res.status()}`).toBeTruthy();
    return res.json();
}

export function allMedicines(tree) {
    return Object.values(tree).flatMap(Object.values).flatMap(Object.values).flat();
}

/** Accept native confirm() dialogs the app uses for deletes. */
export function acceptDialogs(page) {
    page.on('dialog', dialog => dialog.accept());
}
