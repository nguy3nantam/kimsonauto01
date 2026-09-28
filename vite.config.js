import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
export default defineConfig({
  base: '/',
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss, autoprefixer] } },
  server: { host: '127.0.0.1', port: 5173, proxy: { '/api': 'http://127.0.0.1:3001', '/uploads': 'http://127.0.0.1:3001' } }
});
