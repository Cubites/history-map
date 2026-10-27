import { useEffect, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { formatYear } from '../lib/year.ts';
import { REGION_FILTER_INFO, inRegionFilter, type RegionFilter as Filter, type RegionFilterUnit } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

/** 연도를 옮겼다는 알림을 보여 두는 시간(ms) */
const NOTICE_MS = 4000;

/**
 * 그 권역의 자료가 있는 가장 가까운 연도. 지금 연도에 그 권역 나라의 영토나 사건이 있으면 null(옮기지 않음).
 * 영토가 없는 앞 시대(예: 640년의 유럽)에서는 그 권역의 첫 영토 연도(유럽 1200)가 된다.
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
 * 권역 고르기 (지도 왼쪽 위 세계·동아시아·유럽 단추, DESIGN.md §6.4.2). 2026-10-18 머리글 권역 필터를 없애고 이 단추로 옮김.
 * 고른 권역의 전투 표시만 보여 주고(전쟁 표시 ⚔는 권역과 상관없이 늘 전부, 2026-10-27), 검색은 그 권역을 먼저 보여 주며, 지도를 그 권역으로 한 번 옮긴다.
 * 지금 연도에 그 권역의 자료가 없으면 자료가 있는 연도로 옮기고 짧은 알림 글(notice)을 돌려준다
 */
export function useRegionChoice(data: StaticData) {
  const setFilter = useAppStore((s) => s.setRegionFilter);
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
  return { choose, notice };
}
