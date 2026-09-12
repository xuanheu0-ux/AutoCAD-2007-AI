import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Allow the sandbox preview hosts (https://{port}-{sandboxId}.e2b.app)
    allowedHosts: ['.e2b.app'],
  },
});
