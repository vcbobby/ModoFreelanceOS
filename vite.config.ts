import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

export default defineConfig({
    plugins: [react()],
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
            // Alias for test-time mock to avoid requiring ESM-only dependency
            'html-encoding-sniffer': path.resolve(
                __dirname,
                './test/mocks/html-encoding-sniffer.cjs',
            ),
        },
    },
})
