import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    threads: false,
    globalSetup: 'test/vitest-global-setup.cjs',
    setupFiles: ['test/setup-early.cjs', 'src/setupTests.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**', 'src/setupTests.ts'],
      lines: 70,
      statements: 70,
      functions: 70,
      branches: 60,
    },
    deps: {
      optimizer: {
        web: {
          include: ['html-encoding-sniffer'],
        },
      },
    },
    // Alias `html-encoding-sniffer` and `parse5` to small CJS mocks to avoid ESM/CJS interop errors
    alias: {
      'html-encoding-sniffer': path.resolve(__dirname, './test/mocks/html-encoding-sniffer.cjs'),
      parse5: path.resolve(__dirname, './test/mocks/parse5.cjs'),
    },
  },
  // Ensure Vite pre-bundles / inlines problematic deps to avoid loading ESM-only modules via require
  server: {
    deps: {
      inline: ['html-encoding-sniffer', '@exodus/bytes', 'parse5'],
    },
  },
  optimizeDeps: {
    include: ['html-encoding-sniffer', '@exodus/bytes', 'parse5'],
  },
  ssr: {
    noExternal: ['html-encoding-sniffer', '@exodus/bytes', 'parse5'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src/types'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },
});
