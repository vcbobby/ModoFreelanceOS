import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('generate proposals (stubbed in E2E)', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Propuestas IA');

  await page.getByPlaceholder('Pega aquí la descripción del proyecto...').fill('Necesito una landing moderna.');
  await page.getByPlaceholder('Resumen de tus habilidades...').fill('Desarrollo front-end, React, UX.');

  await page.getByRole('button', { name: 'Generar Propuestas' }).click();

  await expect(page.getByText('Propuesta Formal (E2E)')).toBeVisible();
});
