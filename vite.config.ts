// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', 
  // server: {
  //   host: true,              // слушать localhost (и 0.0.0.0 при необходимости)
  //   port: 3000,              // нужный порт
  //   strictPort: true,        // если 3000 занят — упасть с ошибкой (а не выбирать другой)
  //   open: true,              // автоматически открыть в браузере
  // },
})
