import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.BUILD_VERSION || 'dev'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_SHA__: JSON.stringify(process.env.COMMIT_SHA || 'local'),
  },
  server: {
    port: 5180,
    host: true,
  },
  optimizeDeps: {
    exclude: ['motion'],
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  base: process.env.GITHUB_ACTIONS ? '/peercord/' : '/',
})
