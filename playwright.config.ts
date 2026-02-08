import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_E2E: 'true',
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'AIzaTestKeyForCI',
      VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET:
        process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID:
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
      VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:deadbeef',
    },
  },
});
