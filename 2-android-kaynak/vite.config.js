import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Listen on all network addresses so Android phone on Wi-Fi can connect
    port: 5173,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  }
});
