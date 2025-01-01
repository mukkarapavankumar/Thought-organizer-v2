import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  define: {
    // Remove environment variables from the build
    'process.env.VITE_OPENAI_API_KEY': '""',
    'process.env.VITE_PERPLEXITY_API_KEY': '""',
    'import.meta.env.VITE_OPENAI_API_KEY': '""',
    'import.meta.env.VITE_PERPLEXITY_API_KEY': '""'
  }
});
