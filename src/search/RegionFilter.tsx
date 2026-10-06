import { useEffect, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { formatYear } from '../lib/year.ts';
import { REGION_FILTERS, REGION_FILTER_INFO, inRegionFilter, type RegionFilter as Filter, type RegionFilterUnit } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

const OPTIONS: Filter[] = ['all', ...REGION_FILTERS];
/** 연도를 옮겼다는 알림을 보여 두는 시간(ms) */
const NOTICE_MS = 4000;

/**
 * 그 권역의 자료가 있는 가장 가까운 연도. 지금 연도에 그 권역 나라의 영토나 사건이 있으면 null(옮기지 않음).
 * 영토가 없는 앞 시대(예: 640년의 유럽)에서는 그 권역의 첫 영토 연도(유럽 1526)가 된다.
 * 사건도 보는 것은 선사 시대(영토 없이 유적 사건만 있음)에서 '한국'을 눌러도 그대로 두기 위해서다
 */
function yearWithData(data: StaticData, unit: RegionFilterUnit, year: number): number | null {
  const last = data.timeline.range[1];
  let best: { distance: number; year: number } | null = null;
  for (const t of data.territories) {
    if (!inRegionFilter(unit, data.entities.get(t.entityId)?.region)) continue;
    const to = t.to === null ? last : t.to - 1;
    const target = Math.min(Math.max(year, t.from), to);
    const distance = Math.abs(target - year);
    if (distance === 0) return null;
    if (!best || distance < best.distance) best = { distance, year: target };
  }
  if (data.events.some((e) => e.year <= year && year <= (e.endYear ?? e.year) && inRegionFilter(unit, e.region))) return null;
  return best?.year ?? null;
}

/**
 * 머리글의 권역 필터 (DESIGN.md §6.4.2): 전체 / 한국·동아시아 / 유럽.
 * 고른 권역의 사건 눈금·전투 표시만 보여 주고, 검색은 그 권역을 먼저 보여 주며, 지도를 그 권역으로 한 번 옮긴다.
 * 지금 연도에 그 권역의 자료가 없으면 자료가 있는 연도로 옮기고 짧게 알린다.
 * 단추마다 aria-pressed로 고른 상태를 알리고, Tab 말고 ←·→·Home·End로도 단추 사이를 옮겨 다닐 수 있다.
 * 휴대폰 너비에서는 짧은 이름(동아시아)을 보이고 aria-label로 긴 이름을 준다.
 */
export function RegionFilter({ data }: { data: StaticData }) {
  const filter = useAppStore((s) => s.regionFilter);
  const setFilter = useAppStore((s) => s.setRegionFilter);
  const groupRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const choose = (id: Filter) => {
    if (id !== 'all') {
      const { year, warId, exitWar, setYear } = useAppStore.getState();
      const target = yearWithData(data, id, year);
      if (target !== null) {
        // 전쟁 보기는 그 전쟁의 연도에 묶여 있으므로 먼저 닫는다
        if (warId) exitWar();
        setYear(target);
        setNotice(`${REGION_FILTER_INFO[id].label} 자료가 있는 ${formatYear(target)}으로 옮겼습니다`);
        window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setNotice(''), NOTICE_MS);
      }
    }
    setFilter(id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // 브라우저·보조 기술의 단축키(Alt·Ctrl·Meta 조합)는 건드리지 않는다
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const buttons = [...(groupRef.current?.querySelectorAll('button') ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: buttons.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    buttons[(next + buttons.length) % buttons.length].focus();
  };

  return (
    <div className="region-filter-wrap">
      <div ref={groupRef} className="region-filter" role="group" aria-label="권역 필터" onKeyDown={onKeyDown}>
        {OPTIONS.map((id) => {
          const { label, short } = REGION_FILTER_INFO[id];
          return (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              aria-label={label}
              title={id === 'all' ? '모든 권역의 사건 보기' : `${label} 사건만 보기 (지도를 ${label} 범위로 옮김)`}
              onClick={() => choose(id)}
            >
              {short === label ? (
                label
              ) : (
                <>
                  <span className="region-filter-long">{label}</span>
                  <span className="region-filter-short">{short}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {/* 연도를 옮긴 알림. 비어 있을 때도 두어야 화면 낭독기가 바뀐 내용을 읽는다 */}
      <div className="region-notice" role="status" aria-live="polite">
        {notice}
      </div>
    </div>
  );
}
