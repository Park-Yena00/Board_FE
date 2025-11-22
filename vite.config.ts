import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        // 백엔드 API는 /api prefix를 사용하므로 rewrite 불필요
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

