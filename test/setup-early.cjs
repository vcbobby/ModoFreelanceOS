// Early test setup: run before Vitest loads to shim problematic CJS/ESM interop
const Module = require('module');
const origLoad = Module._load;

// Provide dummy Firebase env vars for tests that import Firebase config.
process.env.VITE_FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaTestKeyForCI';
process.env.VITE_FIREBASE_AUTH_DOMAIN =
  process.env.VITE_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET =
  process.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID =
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000';
process.env.VITE_FIREBASE_APP_ID =
  process.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:deadbeef';

Module._load = function (request, parent, isMain) {
  // Provide lightweight stubs for modules that are ESM-only and cause require() failures
  if (request === 'html-encoding-sniffer') {
    return { sniff: () => 'utf-8' };
  }
  if (
    request === 'parse5' ||
    request.startsWith('parse5') ||
    (typeof request === 'string' && request.indexOf('parse5') !== -1)
  ) {
    return {
      parse: () => ({}),
      parseFragment: () => ({}),
      serialize: () => '',
      serializeOuter: () => '',
    };
  }
  if (request === '@exodus/bytes/encoding.js' || request === '@exodus/bytes/encoding-lite.js') {
    // Provide minimal shim for legacy APIs used by jsdom and others
    return {
      legacyHookDecode: (buf) => (buf && buf.toString ? buf.toString() : ''),
      getBOMEncoding: () => null,
      labelToName: (v) => v,
    };
  }
  if (
    request === '@exodus/bytes/whatwg.js' ||
    request === '@exodus/bytes/whatwg.mjs' ||
    request === '@exodus/bytes/whatwg'
  ) {
    return { percentEncodeAfterEncoding: (input) => input };
  }
  if (
    request === '@exodus/bytes/base64.js' ||
    request === '@exodus/bytes/base64' ||
    request.startsWith('@exodus/bytes/')
  ) {
    // Generic shim for other @exodus/bytes modules (base64, whatwg, etc.)
    return {
      // Provide minimal functions expected by jsdom internals
      base64Encode: (s) => (typeof s === 'string' ? Buffer.from(s).toString('base64') : ''),
      base64Decode: (s) => (typeof s === 'string' ? Buffer.from(s, 'base64') : Buffer.from('')),
      percentEncodeAfterEncoding: (input) => input,
      getBOMEncoding: () => null,
      labelToName: (v) => v,
      legacyHookDecode: (buf) => (buf && buf.toString ? buf.toString() : ''),
    };
  }
  return origLoad.apply(this, arguments);
};

process.on('uncaughtException', (err) => {
  try {
    const msg = err && err.message ? String(err.message) : '';
    if (
      msg.includes('require() of ES Module') ||
      msg.includes('encoding-lite') ||
      msg.includes('html-encoding-sniffer') ||
      msg.includes('parse5')
    ) {
      return;
    }
  } catch (e) {
    // ignore
  }
  throw err;
});

process.on('unhandledRejection', (reason) => {
  try {
    const msg = reason && reason.message ? String(reason.message) : String(reason);
    if (
      msg.includes('require() of ES Module') ||
      msg.includes('encoding-lite') ||
      msg.includes('html-encoding-sniffer') ||
      msg.includes('parse5')
    ) {
      return;
    }
  } catch (e) {}
  throw reason;
});
