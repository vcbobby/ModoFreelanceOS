import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('website builder publish', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Web Builder');

  await page.getByPlaceholder('tu-nombre').fill('e2e-portfolio');
  await page.getByLabel('Nombre Visible').fill('E2E Portfolio');

  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByText('¡Publicado!')).toBeVisible();
});
