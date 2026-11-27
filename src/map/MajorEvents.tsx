import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { entryYear, majorWars } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 지도 왼쪽 위 "주요 전쟁" 단추와 그 아래 목록 (2026-10-27 "주요 사건"으로 만듦, 2026-11-22 이름을 "주요 전쟁"으로, DESIGN.md §4.5).
 * 목록은 전쟁 보기가 있는 전쟁이다. 어떤 전쟁을 넣는지는 lib/wars.ts의 majorWars(권역·고른 나라에 따름).
 * 누르면 그 전쟁의 전쟁 보기를 연다. 같은 전쟁이 지도에도 아이콘으로 뜬다(그 해에 진행 중일 때, WarMarkerLayer.tsx).
 */
export function MajorEvents({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const regionFilter = useAppStore((s) => s.regionFilter);
  const selectedId = useAppStore((s) => s.selectedId);
  const enterWar = useAppStore((s) => s.enterWar);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => majorWars(data.wars, regionFilter, selectedId), [data.wars, regionFilter, selectedId]);

  // 목록은 단추 아래에 떠서(absolute) 오른쪽의 화살표 뜻을 밀지 않고 덮는다(2026-10-28). 높이는 지도 아래 끝까지(넘치면 스크롤)
  const listRef = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    const map = list?.closest('.app-main');
    if (!open || !list || !map) return;
    const fit = () => {
      // 휴대폰은 지도가 나라 정보 판 뒤까지 깔리므로 판이 가리는 높이(--sheet-cover, useBottomSheet.ts)만큼 더 띄운다
      const cover = document.querySelector('.panel.sheet') ? parseFloat(getComputedStyle(map).getPropertyValue('--sheet-cover')) || 0 : 0;
      const bottomGap = 12 + cover;
      list.style.maxHeight = `${Math.max(120, Math.round(map.getBoundingClientRect().bottom - list.getBoundingClientRect().top - bottomGap))}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open]);

  // 목록 밖을 누르면 닫는다
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={boxRef} className="major-events map-ui" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className="major-events-toggle" aria-expanded={open} aria-controls="major-events-list" onClick={() => setOpen((v) => !v)}>
        {/* 바탕 전용 칸(2026-11-27, styles.css .ui-bg): 바탕색을 단추가 아니라 이 칸이 갖는다 */}
        <span className="ui-bg" aria-hidden="true" />
        주요 전쟁
      </button>
      {open && (
        <ul ref={listRef} id="major-events-list" className="major-events-list">
          {items.length === 0 && <li className="major-events-empty">{selectedId ? '이 나라가 관련된 주요 전쟁이 없습니다' : '이 권역의 주요 전쟁이 없습니다'}</li>}
          {items.map(({ war, theater }) => (
            <li key={war.id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  enterWar(war.id, theater.id, entryYear(theater, year), null);
                }}
              >
                <span className="major-events-name">{war.name}</span>
                <span className="major-events-years">
                  {war.from === war.to ? formatYear(war.from, '') : `${formatYear(war.from, '')}–${formatYear(war.to, '')}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
