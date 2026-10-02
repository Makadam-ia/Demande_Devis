import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite minimale : React + serveur de développement sur le port 5173.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
