import { create } from 'zustand';
import { parseRegionFilter, type RegionFilter } from '../schema/regions.ts';

/** 첫 화면 연도: 삼국 항쟁이 한창인 640년대 */
const DEFAULT_YEAR = 640;

interface AppState {
  year: number;
  selectedId: string | null;
  hoveredEventId: string | null;
  /** 지도의 전투 표시로 고른 사건. 패널에서 그 사건으로 스크롤하고 강조한다 */
  focusedEventId: string | null;
  showAllEvents: boolean;
  /**
   * 전쟁 보기 (DESIGN.md §4.5). 사용자가 지도 표시·패널에서 전쟁을 골랐을 때만 켜진다.
   * 연도만 바꿔서는 켜지지 않는다 (같은 해에 전쟁이 여럿일 수 있으므로).
   */
  warId: string | null;
  /** 전쟁 보기의 전역. null이면 그 해에 진행 중인 첫 전역 */
  theaterId: string | null;
  /** 전쟁 보기에서 고른 전선 날짜 (YYYY-MM-DD). null이면 그 해의 기본 전선 */
  frontDate: string | null;
  /** 전쟁 보기를 닫을 때 돌아갈 연도 */
  returnYear: number | null;
  /**
   * 권역 필터 (DESIGN.md §6.4.2). 시간 막대의 사건 눈금, 지도의 전투·전쟁 표시를 그 권역 것만 보여 주고 검색은 그 권역을 먼저 보여 준다.
   * 영토 그리기와 고른 나라의 사건 패널에는 걸리지 않는다
   */
  regionFilter: RegionFilter;
  /** 권역 단추를 누른 횟수. 누를 때마다(이미 고른 권역을 다시 눌러도) 지도를 그 권역 범위로 한 번 옮긴다 */
  regionFocus: number;
  setYear: (year: number) => void;
  /** 전쟁 보기 안에서 전선 날짜를 고른다. 연도가 다르면 연도도 함께 옮긴다 */
  setFront: (year: number, date: string | null) => void;
  /** 전쟁 보기를 연다. theaterId가 없으면 그 해의 전역, date가 없으면 그 해의 기본 전선 */
  enterWar: (warId: string, theaterId: string | null, year: number, date: string | null) => void;
  /** 전쟁 보기를 닫고 들어오기 전 연도로 돌아간다 */
  exitWar: () => void;
  select: (id: string | null) => void;
  /** 사건의 나라를 고르고 그 사건을 패널에서 보여 준다 (지도의 전투 표시를 눌렀을 때) */
  focusEvent: (entityId: string, eventId: string) => void;
  hoverEvent: (id: string | null) => void;
  setShowAllEvents: (value: boolean) => void;
  /** 권역 필터를 고른다. 지도 이동(regionFocus)도 함께 요청한다 */
  setRegionFilter: (filter: RegionFilter) => void;
}

// 화면 상태는 쿼리 문자열로만 공유한다 (DESIGN.md §13: GitHub Pages는 경로 재작성 불가).
function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const year = Number(params.get('year'));
  const warId = params.get('war');
  return {
    year: params.has('year') && Number.isInteger(year) ? year : DEFAULT_YEAR,
    selectedId: params.get('entity'),
    warId,
    theaterId: warId ? params.get('theater') : null,
    frontDate: warId ? params.get('front') : null,
    returnYear: null,
    // 권역 필터도 다른 화면 상태처럼 쿼리 문자열에 둔다 (전체이면 적지 않음)
    regionFilter: parseRegionFilter(params.get('region')),
  };
}

export const useAppStore = create<AppState>((set) => ({
  ...readUrl(),
  hoveredEventId: null,
  focusedEventId: null,
  showAllEvents: false,
  regionFocus: 0,
  setYear: (year) => set({ year, hoveredEventId: null, focusedEventId: null, frontDate: null }),
  setFront: (year, frontDate) => set({ year, frontDate }),
  enterWar: (warId, theaterId, year, frontDate) =>
    set((s) => ({ warId, theaterId, year, frontDate, hoveredEventId: null, returnYear: s.warId ? s.returnYear : s.year })),
  exitWar: () =>
    set((s) => ({ warId: null, theaterId: null, frontDate: null, hoveredEventId: null, year: s.returnYear ?? s.year, returnYear: null })),
  select: (selectedId) => set({ selectedId, hoveredEventId: null, focusedEventId: null, showAllEvents: false }),
  focusEvent: (selectedId, eventId) => set({ selectedId, hoveredEventId: eventId, focusedEventId: eventId, showAllEvents: false }),
  hoverEvent: (hoveredEventId) => set({ hoveredEventId }),
  setShowAllEvents: (showAllEvents) => set({ showAllEvents }),
  setRegionFilter: (regionFilter) => set((s) => ({ regionFilter, regionFocus: s.regionFocus + 1 })),
}));

useAppStore.subscribe((state, prev) => {
  if (
    state.year === prev.year &&
    state.selectedId === prev.selectedId &&
    state.frontDate === prev.frontDate &&
    state.warId === prev.warId &&
    state.theaterId === prev.theaterId &&
    state.regionFilter === prev.regionFilter
  )
    return;
  const params = new URLSearchParams(window.location.search);
  params.set('year', String(state.year));
  if (state.selectedId) params.set('entity', state.selectedId);
  else params.delete('entity');
  if (state.warId) params.set('war', state.warId);
  else params.delete('war');
  if (state.warId && state.theaterId) params.set('theater', state.theaterId);
  else params.delete('theater');
  if (state.warId && state.frontDate) params.set('front', state.frontDate);
  else params.delete('front');
  if (state.regionFilter !== 'all') params.set('region', state.regionFilter);
  else params.delete('region');
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
});
