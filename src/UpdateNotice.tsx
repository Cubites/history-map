import { useEffect, useState } from 'react';

/** 새 버전을 확인하는 간격 (ms) */
const CHECK_MS = 5 * 60 * 1000;

/**
 * 새 버전 알림 (DESIGN.md §5.x). 배포 뒤에도 예전 화면 코드를 켜 둔 채 새 데이터를 받으면 화면이 멈출 수 있어서,
 * 창으로 돌아올 때와 5분마다 index.html의 화면 코드 파일 이름을 비교해 바뀌었으면 새로 고침을 권한다.
 */
export function UpdateNotice() {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const current = document.querySelector<HTMLScriptElement>('script[src*="assets/index-"]')?.src.match(/assets\/index-[^/]+\.js/)?.[0];
    if (!current) return;
    const check = async () => {
      try {
        const html = await (await fetch(`${import.meta.env.BASE_URL}?check=${Date.now()}`, { cache: 'no-store' })).text();
        const latest = html.match(/assets\/index-[^"']+\.js/)?.[0];
        if (latest && latest !== current) setStale(true);
      } catch {
        // 네트워크가 끊겨도 조용히 넘어간다
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && check();
    const timer = window.setInterval(check, CHECK_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  if (!stale) return null;
  return (
    <div className="update-notice" role="status">
      새 버전이 나왔습니다.
      <button type="button" onClick={() => window.location.reload()}>
        새로 고침
      </button>
    </div>
  );
}
