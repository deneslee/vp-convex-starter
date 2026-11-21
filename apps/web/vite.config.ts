import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { varlockVitePlugin } from '@varlock/vite-integration';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: 'cross-env NODE_ENV=production vp build',
        cache: {
          env: ['VITE_CONVEX_URL'],
          input: [{ auto: true }, '!**/dist/**', '!**/*.tsbuildinfo', '!**/node_modules/.vite/**'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    devtools({
      consolePiping: { enabled: false },
    }),
    varlockVitePlugin(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
  ],
});
