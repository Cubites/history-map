import type { StaticData } from '../data/staticData.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { FrontTimeline } from './FrontTimeline.tsx';
import { activeWarView } from '../lib/wars.ts';

/**
 * 화면 아래 줄 (DESIGN.md D7). 전쟁 보기에서는 그 전쟁의 날짜 축을 보여 준다 (DESIGN.md §4.5).
 * 평소의 연도 조절(세로 연도 막대·연도 입력 칸)은 2026-10-28부터 지도 위(MapYearControls.tsx)로 옮겨, 평소에는 이 줄을 그리지 않는다
 */
export function Timeline({ data }: { data: StaticData }) {
  const inWar = useAppStore((s) => !!activeWarView(data.wars, s.warId, s.theaterId, s.year));
  if (!inWar) return null;
  return (
    <div className="timeline timeline-war">
      <FrontTimeline data={data} />
    </div>
  );
}
