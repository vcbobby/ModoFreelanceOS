// Simple CommonJS mock for tests to avoid ESM/CJS issues with real package
module.exports = {
    // html-encoding-sniffer exposes a `sniff` function; we provide a minimal stub
    sniff: function () {
        return 'utf-8'
    },
}
