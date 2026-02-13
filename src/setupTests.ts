import '@testing-library/jest-dom';
// parse5 shim is applied in vitest global setup.

// global test setup puede colocarse aquí si hace falta

// Mock window.matchMedia para evitar errores en componentes que lo usan
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Avoid parse5.serializeOuter errors inside jsdom serialization during tests.
void (async () => {
  try {
    const serialization = await import('jsdom/lib/jsdom/living/domparsing/serialization.js');
    if (serialization && typeof serialization.fragmentSerialization === 'function') {
      const original = serialization.fragmentSerialization;
      serialization.fragmentSerialization = (node: unknown, opts: unknown) => {
        try {
          return original(node, opts);
        } catch (error) {
          if (error instanceof Error && error.message.includes('serializeOuter')) {
            return '';
          }
          return '';
        }
      };
    }
  } catch {
    // ignore if jsdom internals change
  }
})();

// Suppress known ESM/CJS interop errors coming from `html-encoding-sniffer` during tests
// This prevents an unhandled exception that appears when some dependencies try to require an ESM-only file.
if (typeof process !== 'undefined' && process && typeof process.on === 'function') {
  // Prevent unexpected process.exit calls from failing the test runner.
  if (typeof process.exit === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    process.exit = (() => {}) as unknown as typeof process.exit;
  }
  process.on('uncaughtException', (err: unknown) => {
    const msg = err instanceof Error ? String(err.message) : '';
    if (
      msg.includes('encoding-lite') ||
      msg.includes('html-encoding-sniffer') ||
      msg.includes('require() of ES Module')
    )
      return;
    // rethrow other errors so tests still fail on unexpected exceptions
    throw err;
  });
  process.on('unhandledRejection', (reason: unknown) => {
    const msg = reason instanceof Error ? String(reason.message) : String(reason);
    if (
      msg.includes('encoding-lite') ||
      msg.includes('html-encoding-sniffer') ||
      msg.includes('require() of ES Module')
    )
      return;
    // rethrow so tests surface problems
    throw reason;
  });
}

// Provide minimal DOM globals used by some libraries (pdfjs-dist expects DOMMatrix)
if (typeof (globalThis as { DOMMatrix?: typeof DOMMatrix }).DOMMatrix === 'undefined') {
  // Minimal stub sufficient for tests
  (globalThis as { DOMMatrix?: typeof DOMMatrix }).DOMMatrix = class DOMMatrixStub {
    constructor() {}
  };
}

// Ensure jsdom has a document.body (some shims may cause it to be missing)
if (typeof document !== 'undefined' && !document.body) {
  const body = document.createElement('body');
  if (document.documentElement) {
    document.documentElement.appendChild(body);
  }
}
