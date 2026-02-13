import type { Page } from '@playwright/test';

export const gotoApp = async (page: Page, loggedIn: boolean = true) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.addInitScript(
    (value) => {
      localStorage.setItem('e2e_auth', value);
    },
    loggedIn ? 'true' : 'false'
  );
  await page.goto('/?e2e=1');
  const storedFlag = await page.evaluate(() => localStorage.getItem('e2e_auth'));
  if (!storedFlag) {
    await page.evaluate(
      (value) => {
        localStorage.setItem('e2e_auth', value);
      },
      loggedIn ? 'true' : 'false'
    );
    await page.reload();
  }
  const loadingScreen = page.getByText('Cargando ModoFreelanceOS...');
  if (await loadingScreen.isVisible().catch(() => false)) {
    await loadingScreen.waitFor({ state: 'detached', timeout: 20_000 });
  }
  if (loggedIn) {
    const appShellNav = page.locator('aside nav');
    const e2eLoginButton = page.getByTestId('e2e-login');
    const authHeading = page.getByRole('heading', { name: /Bienvenido de nuevo/i });
    const result = await Promise.race([
      appShellNav.waitFor({ timeout: 20_000 }).then(() => 'shell'),
      authHeading.waitFor({ timeout: 20_000 }).then(() => 'auth'),
      e2eLoginButton.waitFor({ timeout: 20_000 }).then(() => 'login'),
    ]).catch(() => null);

    if (result === 'login' || result === 'auth') {
      await e2eLoginButton.click();
    }

    try {
      await appShellNav.waitFor({ timeout: 30_000 });
    } catch (error) {
      const details = [
        pageErrors.length ? `Page errors: ${pageErrors.join(' | ')}` : '',
        consoleErrors.length ? `Console errors: ${consoleErrors.join(' | ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      if (details) {
        throw new Error(`${(error as Error).message}\n${details}`);
      }
      throw error;
    }
  } else {
    await page.getByRole('heading', { name: /Bienvenido de nuevo/i }).waitFor();
  }
};

export const openNav = async (page: Page, label: string) => {
  const nav = page.locator('aside nav');
  await nav.getByRole('button', { name: label, exact: true }).click();
};
