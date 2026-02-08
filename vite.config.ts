import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' &&
      visualizer({
        filename: 'bundle-report.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@config': path.resolve(__dirname, './src/config'),
      '@types': path.resolve(__dirname, './src/types'),
      '@context': path.resolve(__dirname, './src/context'),
      // Alias for test-time mock to avoid requiring ESM-only dependency
      'html-encoding-sniffer': path.resolve(__dirname, './test/mocks/html-encoding-sniffer.cjs'),
    },
  },
  build: {
    outDir: mode === 'analyze' ? 'dist-analyze' : undefined,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase';
          if (id.includes('pdfjs-dist')) return 'pdfjs';
          if (
            id.includes('html2pdf.js') ||
            id.includes('html2canvas') ||
            id.includes('jspdf') ||
            id.includes('canvg') ||
            id.includes('pako')
          ) {
            return 'pdf-export';
          }
          if (id.includes('@google/generative-ai')) return 'gen-ai';
          if (id.includes('react-dom') || id.includes('react')) return 'react-vendor';
        },
      },
    },
  },
}));
