import { test, expect } from '@playwright/test';
import { gotoApp } from './helpers';

test('login/logout flow (E2E)', async ({ page }) => {
  await gotoApp(page, true);

  await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
  await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();

  await page.getByTestId('e2e-login').click();
  await expect(page.getByText('Hola,')).toBeVisible();
});
