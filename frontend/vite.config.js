import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // 1. Le decimos a Vite que en producción usaremos la subcarpeta /sistema/
    base: command === 'build' ? '/sistema/' : '/',
    
    server: {
      port: 5173,
      // Esto se queda exactamente igual para que sigas programando en tu PC sin problemas
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    }
  }
})