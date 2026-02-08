import type { Page } from '@playwright/test';

export const gotoApp = async (page: Page, loggedIn: boolean = true) => {
  await page.addInitScript((value) => {
    localStorage.setItem('e2e_auth', value);
  }, loggedIn ? 'true' : 'false');
  await page.goto('/');
  if (loggedIn) {
    await page.getByRole('heading', { name: /Hola,/i }).waitFor();
  } else {
    await page.getByRole('heading', { name: /Bienvenido de nuevo/i }).waitFor();
  }
};

export const openNav = async (page: Page, label: string) => {
  const nav = page.locator('aside nav');
  await nav.getByRole('button', { name: label, exact: true }).click();
};
