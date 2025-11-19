import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 重要: GitHub Pagesのサブディレクトリでも動作するように相対パスにする
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  }
});