import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5178,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.LAB_API_URL || 'http://127.0.0.1:8087',
        changeOrigin: true,
      },
    },
  },
});
