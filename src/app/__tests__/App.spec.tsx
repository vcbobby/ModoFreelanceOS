import React from 'react';
import { render } from '@testing-library/react';
import { AppProviders } from '@context';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth: unknown, cb: (user: unknown) => void) => {
    // Simulate not authenticated
    cb(null);
    return () => {};
  },
}));
vi.mock('@config/firebase', () => ({ auth: {}, db: {} }));

const loadApp = async () => (await import('../../App')).default;

describe('App smoke', () => {
  it('renders without crashing', async () => {
    const App = await loadApp();
    const { container } = render(
      <AppProviders>
        <App />
      </AppProviders>
    );
    expect(container).toBeTruthy();
  }, 10000);

  it('renders main structure', async () => {
    const App = await loadApp();
    render(
      <AppProviders>
        <App />
      </AppProviders>
    );
    expect(document.body).toBeDefined();
  }, 10000);
});
