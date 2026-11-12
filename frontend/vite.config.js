import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// "web" is the Django service name inside Docker; localhost is for running Vite outside Docker.
const django = process.env.DJANGO_ORIGIN || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
    proxy: {
      '/api': { target: django, changeOrigin: true },
      '/media': { target: django, changeOrigin: true },
      '/user': { target: django, changeOrigin: true },
      // Do not proxy /static: Vite serves frontend/public/static itself.
    },
  },
});
