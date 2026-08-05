import { defineConfig } from 'vite';

// Relative base so the built site works from a file:// open, a plain static host,
// or a GitHub Pages project subpath without reconfiguration.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 100_000,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
} as never);
