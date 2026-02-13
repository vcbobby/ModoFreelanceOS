import { test, expect } from '@playwright/test';
import { gotoApp, openNav } from './helpers';

test('create note and toggle checkbox', async ({ page }) => {
  await gotoApp(page, true);

  await openNav(page, 'Agenda & Notas');

  const noteInput = page.getByPlaceholder('Escribe una nota...');
  await noteInput.click();
  await noteInput.fill('☐ Comprar leche');
  await page.getByRole('button', { name: 'Guardar' }).click();

  await expect(page.getByText('Comprar leche')).toBeVisible();
  const firstNote = page.getByTestId('note-card').first();
  await expect(firstNote).toBeVisible();
  await firstNote.getByText('Comprar leche').click();
  await expect(firstNote.getByText('☑')).toBeVisible();
});
