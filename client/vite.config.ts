/** Vite 开发配置。浏览器通过同源的 /api 访问 Spring Boot。 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5178,
    // 端口被占用时直接报错，让 README 中的启动地址保持可预期。
    strictPort: true,
    proxy: {
      '/api': {
        // 后端改用其他端口时，可通过 LAB_API_URL 指定代理目标。
        target: process.env.LAB_API_URL || 'http://127.0.0.1:8087',
        changeOrigin: true,
      },
    },
  },
});
