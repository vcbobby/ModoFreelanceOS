import React from 'react';
import { render, act } from '@testing-library/react';
import { AppProviders } from '@context';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth: unknown, cb: (user: unknown) => void) => {
    cb(null);
    return () => {};
  },
}));
vi.mock('@config/firebase', () => ({ auth: {}, db: {} }));

const loadApp = async () => (await import('../../App')).default;

describe('App with providers', () => {
  it('renders app inside providers without crashing', async () => {
    const App = await loadApp();
    let container: HTMLElement | null = null;
    await act(async () => {
      const rendered = render(
        <AppProviders>
          <App />
        </AppProviders>
      );
      container = rendered.container;
    });

    expect(container).toBeTruthy();
  }, 10000);
});
