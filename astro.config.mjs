import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
