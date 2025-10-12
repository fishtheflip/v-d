// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/v-d', 
  server: {
    host: 'localhost', // можно '0.0.0.0' если нужен доступ с других устройств
    port: 3000,
    strictPort: true,  // если порт занят — упадёт с ошибкой, не прыгнет на 3001+
  },
  preview: {
    host: 'localhost',
    port: 3000,
    strictPort: true,
  },
})
