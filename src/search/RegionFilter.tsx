import { type RegionFilter as Filter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 권역 고르기 (지도 왼쪽 아래 세계·동아시아·유럽 단추, DESIGN.md §6.4.2). 2026-10-18 머리글 권역 필터를 없애고 이 단추로 옮김.
 * 고른 권역의 전투 표시만 보여 주고(전쟁 표시 ⚔는 권역과 상관없이 늘 전부, 2026-10-27), 검색은 그 권역을 먼저 보여 주며, 지도를 그 권역으로 한 번 옮긴다.
 * 전쟁 보기 중이면 먼저 닫는다. 2026-10-27: 그 권역의 자료가 없는 해이면 자료가 있는 해로 옮기던 기능과 그 알림은 없앰
 */
export function useRegionChoice() {
  const setFilter = useAppStore((s) => s.setRegionFilter);
  return (id: Filter) => {
    const { warId, exitWar } = useAppStore.getState();
    if (warId) exitWar();
    setFilter(id);
  };
}
