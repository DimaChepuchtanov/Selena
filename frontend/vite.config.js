import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const django = process.env.DJANGO_ORIGIN || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': { target: django, changeOrigin: true },
      '/media': { target: django, changeOrigin: true },
      '/static': { target: django, changeOrigin: true },
      '/user': { target: django, changeOrigin: true },
      // Do not proxy '/' or '/profile' here: routes are rendered by React.
    },
  },
});
