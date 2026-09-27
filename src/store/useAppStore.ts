import { create } from 'zustand';

/** 첫 화면 연도: 삼국 항쟁이 한창인 640년대 */
const DEFAULT_YEAR = 640;

interface AppState {
  year: number;
  selectedId: string | null;
  hoveredEventId: string | null;
  showAllEvents: boolean;
  /** 전쟁 중 고른 전선 날짜 (YYYY-MM-DD). null이면 그 해의 기본 전선 (DESIGN.md §4.5) */
  frontDate: string | null;
  setYear: (year: number) => void;
  /** 전선 날짜를 고른다. 연도가 다르면 연도도 함께 옮긴다 */
  setFront: (year: number, date: string | null) => void;
  select: (id: string | null) => void;
  hoverEvent: (id: string | null) => void;
  setShowAllEvents: (value: boolean) => void;
}

// 화면 상태는 쿼리 문자열로만 공유한다 (DESIGN.md §13: GitHub Pages는 경로 재작성 불가).
function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const year = Number(params.get('year'));
  return {
    year: params.has('year') && Number.isInteger(year) ? year : DEFAULT_YEAR,
    selectedId: params.get('entity'),
    frontDate: params.get('front'),
  };
}

export const useAppStore = create<AppState>((set) => ({
  ...readUrl(),
  hoveredEventId: null,
  showAllEvents: false,
  setYear: (year) => set({ year, hoveredEventId: null, frontDate: null }),
  setFront: (year, frontDate) => set({ year, frontDate }),
  select: (selectedId) => set({ selectedId, hoveredEventId: null, showAllEvents: false }),
  hoverEvent: (hoveredEventId) => set({ hoveredEventId }),
  setShowAllEvents: (showAllEvents) => set({ showAllEvents }),
}));

useAppStore.subscribe((state, prev) => {
  if (state.year === prev.year && state.selectedId === prev.selectedId && state.frontDate === prev.frontDate) return;
  const params = new URLSearchParams(window.location.search);
  params.set('year', String(state.year));
  if (state.selectedId) params.set('entity', state.selectedId);
  else params.delete('entity');
  if (state.frontDate) params.set('front', state.frontDate);
  else params.delete('front');
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
});
