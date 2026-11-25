import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        account: resolve(import.meta.dirname, 'account/index.html'),
      },
    },
  },
});
