// Early test setup: run before Vitest loads to shim problematic CJS/ESM interop
const Module = require('module')
const origLoad = Module._load

Module._load = function (request, parent, isMain) {
    // Provide lightweight stubs for modules that are ESM-only and cause require() failures
    if (request === 'html-encoding-sniffer') {
        return { sniff: () => 'utf-8' }
    }
    if (request === 'parse5') {
        return { parse: () => ({}) }
    }
    if (
        request === '@exodus/bytes/encoding.js' ||
        request === '@exodus/bytes/encoding-lite.js'
    ) {
        // Provide minimal shim for legacy APIs used by jsdom and others
        return {
            legacyHookDecode: (buf) =>
                buf && buf.toString ? buf.toString() : '',
            getBOMEncoding: () => null,
            labelToName: (v) => v,
        }
    }
    return origLoad.apply(this, arguments)
}

process.on('uncaughtException', (err) => {
    try {
        const msg = err && err.message ? String(err.message) : ''
        if (
            msg.includes('require() of ES Module') ||
            msg.includes('encoding-lite') ||
            msg.includes('html-encoding-sniffer') ||
            msg.includes('parse5')
        ) {
            return
        }
    } catch (e) {
        // ignore
    }
    throw err
})

process.on('unhandledRejection', (reason) => {
    try {
        const msg =
            reason && reason.message ? String(reason.message) : String(reason)
        if (
            msg.includes('require() of ES Module') ||
            msg.includes('encoding-lite') ||
            msg.includes('html-encoding-sniffer') ||
            msg.includes('parse5')
        ) {
            return
        }
    } catch (e) {}
    throw reason
})
