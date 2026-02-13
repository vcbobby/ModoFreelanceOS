import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('invoice pdf flow', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Facturación');

  await page.getByPlaceholder('Tu Nombre / Empresa').fill('E2E Studio');
  await page.getByPlaceholder('Nombre Cliente').fill('Cliente Demo');

  await page.getByRole('button', { name: /Descargar Factura/ }).click();
  await expect(page.getByRole('button', { name: /Descargar Factura/ })).toBeVisible();
});
