import { defineConfig } from 'vitest/config'
import * as path from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        threads: false,
        setupFiles: 'src/setupTests.ts',
        deps: {
            inline: ['html-encoding-sniffer'],
        },
        // Alias `html-encoding-sniffer` and `parse5` to small CJS mocks to avoid ESM/CJS interop errors
        alias: {
            'html-encoding-sniffer': path.resolve(
                __dirname,
                './test/mocks/html-encoding-sniffer.cjs',
            ),
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
            '@components': path.resolve(__dirname, './src/components'),
            '@views': path.resolve(__dirname, './src/views'),
            '@services': path.resolve(__dirname, './src/services'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@config': path.resolve(__dirname, './src/config'),
            '@types': path.resolve(__dirname, './src/types'),
            '@context': path.resolve(__dirname, './src/context'),
        },
    },
})
