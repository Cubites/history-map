import { create } from 'zustand';

/** 첫 화면 연도: 삼국 항쟁이 한창인 640년대 */
const DEFAULT_YEAR = 640;

interface AppState {
  year: number;
  selectedId: string | null;
  hoveredEventId: string | null;
  showAllEvents: boolean;
  setYear: (year: number) => void;
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
  };
}

export const useAppStore = create<AppState>((set) => ({
  ...readUrl(),
  hoveredEventId: null,
  showAllEvents: false,
  setYear: (year) => set({ year, hoveredEventId: null }),
  select: (selectedId) => set({ selectedId, hoveredEventId: null, showAllEvents: false }),
  hoverEvent: (hoveredEventId) => set({ hoveredEventId }),
  setShowAllEvents: (showAllEvents) => set({ showAllEvents }),
}));

useAppStore.subscribe((state, prev) => {
  if (state.year === prev.year && state.selectedId === prev.selectedId) return;
  const params = new URLSearchParams(window.location.search);
  params.set('year', String(state.year));
  if (state.selectedId) params.set('entity', state.selectedId);
  else params.delete('entity');
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
});
