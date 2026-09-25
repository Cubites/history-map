import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 프로젝트 페이지: https://cubites.github.io/history-map/
export default defineConfig({
  base: '/history-map/',
  plugins: [react()],
});
