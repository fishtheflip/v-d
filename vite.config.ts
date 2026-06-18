// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('@firebase/firestore') ||
            id.includes('/firebase/firestore') ||
            id.includes('@firebase/webchannel-wrapper')
          ) {
            return 'vendor-firestore';
          }

          if (id.includes('@firebase/auth') || id.includes('/firebase/auth')) {
            return 'vendor-firebase-auth';
          }

          if (id.includes('@firebase') || id.includes('/firebase/')) {
            return 'vendor-firebase-core';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  // server: {
  //   host: true,              // слушать localhost (и 0.0.0.0 при необходимости)
  //   port: 3000,              // нужный порт
  //   strictPort: true,        // если 3000 занят — упасть с ошибкой (а не выбирать другой)
  //   open: true,              // автоматически открыть в браузере
  // },
})
