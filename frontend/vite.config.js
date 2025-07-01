import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        timeout: 30000, // Increase timeout for backend startup
      }
    },
    // Add a small delay to allow backend to start

    middlewareMode: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})