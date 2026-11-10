import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 8888,
        // dev: frontend on :8888, API from `npm run dev:backend` on :3333
        proxy: { '/api': 'http://localhost:3333' },
    },
    build: {
        chunkSizeWarningLimit: 700,
    },
});
