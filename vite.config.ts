import { defineConfig } from 'vite';

// Relative base so the built site works from a file:// open, a plain static host,
// or a GitHub Pages project subpath without reconfiguration.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    /*
     * Never inline an asset. The era plates are the only ones there are, and base64-ing the
     * small ones into the bundle cost 38 kB of gzip and made every plate un-cacheable and
     * un-lazy — they would download with the game rather than when an act reaches them.
     */
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
} as never);
