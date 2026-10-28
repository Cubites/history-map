import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { WORLD_SCALE_WARS, entryYear } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';
import { inRegionFilter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 지도 왼쪽 위 "주요 사건" 단추와 그 아래 목록 (2026-10-27, 지도의 전쟁 표시 ⚔ 대신, DESIGN.md §4.5).
 * 목록은 전쟁 보기가 있는 전쟁이다. 세계적인 전쟁(WORLD_SCALE_WARS)은 어느 권역을 보든 늘 뜨고,
 * 그 밖의 전쟁은 그 권역(동아시아·유럽)을 보고 있을 때만 뜬다. 세계를 보고 있으면 세계적인 전쟁만.
 * 누르면 그 전쟁의 전쟁 보기를 연다. 전역이 여럿이면 지금 권역의 전역을, 없으면 첫 전역을 연다(세계 개관처럼 hideMarker인 전역은 고르지 않음).
 */
export function MajorEvents({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const regionFilter = useAppStore((s) => s.regionFilter);
  const enterWar = useAppStore((s) => s.enterWar);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      data.wars
        .map((war) => {
          const theaters = war.theaters.filter((t) => !t.hideMarker);
          const inRegion = theaters.filter((t) => inRegionFilter(regionFilter, t.region ?? war.region));
          const shown = WORLD_SCALE_WARS.has(war.id) || (regionFilter !== 'all' && inRegion.length > 0);
          return shown ? { war, theater: (regionFilter !== 'all' && inRegion[0]) || theaters[0] || war.theaters[0] } : null;
        })
        .filter((x) => x !== null)
        .sort((a, b) => a.war.from - b.war.from),
    [data.wars, regionFilter],
  );

  // 목록은 단추 아래에 떠서(absolute) 오른쪽의 화살표 뜻을 밀지 않고 덮는다(2026-10-28). 높이는 지도 아래 끝까지(넘치면 스크롤)
  const listRef = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    const map = list?.closest('.app-main');
    if (!open || !list || !map) return;
    const fit = () => {
      // 휴대폰은 지도 아래 14px가 나라 정보 판 뒤에 있으므로 그만큼 더 띄운다
      const bottomGap = document.querySelector('.panel.sheet') ? 26 : 12;
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
        주요 사건
      </button>
      {open && (
        <ul ref={listRef} id="major-events-list" className="major-events-list">
          {items.length === 0 && <li className="major-events-empty">이 권역의 주요 사건이 없습니다</li>}
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
