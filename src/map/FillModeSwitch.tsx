import { useEffect, useRef, useState } from 'react';
import { type FillMode, useAppStore } from '../store/useAppStore.ts';

const MODES: [FillMode, string][] = [
  ['strong', '진하게'],
  ['light', '연하게'],
  ['bloc', '속국만'],
];

/**
 * 지도 나라 칠하기 방식 단추 (2026-11-15, '주요 사건' 단추 아래, DESIGN.md §6.3).
 * 권역 단추처럼 평소에는 고른 방식 단추 하나만 보이고, 누르면 그 아래로 나머지 방식이 펼쳐진다.
 * 하나를 고르면 그 방식으로 바뀌고 다시 접힌다. 밖을 누르거나 Esc를 눌러도 접힌다. PC·휴대폰 같음
 */
export function FillModeSwitch() {
  const fillMode = useAppStore((s) => s.fillMode);
  const setFillMode = useAppStore((s) => s.setFillMode);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  const current = MODES.find(([key]) => key === fillMode) ?? MODES[1];
  return (
    <div ref={boxRef} className="fill-mode map-ui" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="fill-mode-current" aria-expanded={open} aria-label={`나라 색칠: ${current[1]}. 눌러서 바꾸기`} onClick={() => setOpen(!open)}>
        {current[1]}
      </button>
      {open && (
        <div className="fill-mode-list" role="group" aria-label="나라 색칠 방식">
          {MODES.filter(([key]) => key !== fillMode).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFillMode(key);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
