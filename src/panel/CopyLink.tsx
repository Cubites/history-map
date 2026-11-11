import { useEffect, useState, type ReactNode } from 'react';

/** 복사했다는 표시를 보여 줄 시간(ms) */
const DONE_MS = 1600;

/** 클립보드에 글을 넣는다. 클립보드 API를 쓸 수 없으면(오래된 브라우저 등) 숨긴 글 칸으로 복사한다 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/**
 * 바로 가기 링크 복사 단추 (2026-11-11). 글(나라 이름·사건 제목)과 그 끝의 복사 아이콘을 한 단추로 묶어,
 * 글이나 아이콘을 누르면 링크(url()이 돌려준 주소)를 클립보드에 넣고 잠깐 '링크 복사됨'을 보여 준다.
 * 누름은 바깥(사건 펼침·접힘)으로 넘기지 않는다. 아이콘 높이는 글자 높이(1em)에 맞춘다
 */
export function CopyLink({ url, label, children }: { url: () => string; label: string; children: ReactNode }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');
  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), DONE_MS);
    return () => window.clearTimeout(timer);
  }, [state]);
  return (
    <button
      type="button"
      className="copy-link"
      title="링크 복사"
      aria-label={`${label} 링크 복사`}
      onClick={(e) => {
        e.stopPropagation();
        void copyText(url()).then((ok) => setState(ok ? 'done' : 'failed'));
      }}
    >
      {children}
      <svg className="copy-link-icon" viewBox="0 0 16 16" aria-hidden>
        {state === 'done' ? (
          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 3.5V3a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10H4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </>
        )}
      </svg>
      <span className="copy-link-done" role="status" data-show={state !== 'idle' || undefined}>
        {state === 'failed' ? '복사하지 못했습니다' : state === 'done' ? '링크 복사됨' : ''}
      </span>
    </button>
  );
}
