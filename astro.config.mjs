import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // '/boundaries' is hidden site-wide for the time being (not back on the
  // table until spring) — see src/pages/_disabled/boundaries.astro.
  redirects: {
    '/boundaries': '/teams',
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
