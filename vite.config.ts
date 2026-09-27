import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 프로젝트 페이지: https://cubites.github.io/history-map/
export default defineConfig({
  base: '/history-map/',
  plugins: [react()],
  define: {
    // 데이터 파일(public/data/)은 이름에 해시가 없어 브라우저가 이전 배포본을 잠시 저장해 쓴다.
    // 빌드마다 바뀌는 값을 주소에 붙여, 새 프로그램이 이전 데이터와 섞이지 않게 한다 (staticData.ts의 dataUrl)
    __DATA_VERSION__: JSON.stringify(Date.now().toString(36)),
  },
});
