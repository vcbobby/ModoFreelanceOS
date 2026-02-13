import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('register finance transaction', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Finanzas');

  await page.getByPlaceholder('0.00').fill('120');
  await page.getByPlaceholder('Descripción').fill('Pago cliente');
  await page.getByRole('button', { name: 'Registrar' }).click();

  await expect(page.getByText('Pago cliente')).toBeVisible();
});
