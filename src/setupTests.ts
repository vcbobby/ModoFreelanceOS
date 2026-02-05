import '@testing-library/jest-dom'

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
    })
}

// Suppress known ESM/CJS interop errors coming from `html-encoding-sniffer` during tests
// This prevents an unhandled exception that appears when some dependencies try to require an ESM-only file.
if (
    typeof process !== 'undefined' &&
    process &&
    typeof process.on === 'function'
) {
    process.on('uncaughtException', (err: any) => {
        const msg = err && err.message ? String(err.message) : ''
        if (
            msg.includes('encoding-lite') ||
            msg.includes('html-encoding-sniffer') ||
            msg.includes('require() of ES Module')
        )
            return
        // rethrow other errors so tests still fail on unexpected exceptions
        throw err
    })
    process.on('unhandledRejection', (reason: any) => {
        const msg =
            reason && reason.message ? String(reason.message) : String(reason)
        if (
            msg.includes('encoding-lite') ||
            msg.includes('html-encoding-sniffer') ||
            msg.includes('require() of ES Module')
        )
            return
        // rethrow so tests surface problems
        throw reason
    })
}

// Provide minimal DOM globals used by some libraries (pdfjs-dist expects DOMMatrix)
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
    // Minimal stub sufficient for tests
    ;(globalThis as any).DOMMatrix = class DOMMatrixStub {
        constructor() {}
    }
}

// Ensure jsdom has a document.body (some shims may cause it to be missing)
if (typeof document !== 'undefined' && !document.body) {
    const body = document.createElement('body')
    if (document.documentElement) {
        document.documentElement.appendChild(body)
    }
}
