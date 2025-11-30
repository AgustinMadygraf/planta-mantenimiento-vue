import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      pinia: fileURLToPath(new URL('./src/shims/pinia.ts', import.meta.url)),
      'vue-router': fileURLToPath(new URL('./src/shims/vue-router.ts', import.meta.url)),
    },
  },
})
