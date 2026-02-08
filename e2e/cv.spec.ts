import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('cv builder export', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Constructor CV');
  await expect(page.getByRole('heading', { name: /Constructor CV/i })).toBeVisible();

  await page.getByPlaceholder('Nombre Completo').fill('E2E Tester');
  await page.getByPlaceholder('Título Profesional').fill('Frontend Dev');

  await page.getByRole('button', { name: 'Descargar PDF' }).click();
  await expect(page.getByRole('heading', { name: /Constructor CV/i })).toBeVisible();
});
