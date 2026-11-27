import type { GeoProjection } from 'd3-geo';
import type { WarTheater } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';

/**
 * 평소 지도의 전쟁 아이콘 (DESIGN.md §4.5, 2026-10-27에 없앴다가 2026-11-22에 되살림). "주요 전쟁" 목록에 있는 전쟁 가운데 그 해에 진행 중인 것의 주 전장(전역의 marker)에 교차한 칼 모양 표시와 이름을 둔다.
 * 누르면 그 전역의 전쟁 보기가 열린다. 지도 위 SVG 층은 마우스를 통과시키므로 이 표시만 누를 수 있게 한다.
 */
export function WarMarkerLayer({ items, projection, onOpen }: { items: WarTheater[]; projection: GeoProjection; onOpen: (item: WarTheater) => void }) {
  return (
    <g className="war-markers">
      {items.map((item) => {
        const { war, theater } = item;
        const p = projection(theater.marker);
        if (!p) return null;
        const name = war.theaters.length > 1 ? `${war.name} · ${theater.name}` : war.name;
        const open = () => onOpen(item);
        return (
          <g
            key={`${war.id}/${theater.id}`}
            className="war-marker"
            transform={`translate(${p[0]},${p[1]})`}
            role="button"
            tabIndex={0}
            aria-label={`${name} 전쟁 보기`}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
              }
            }}
          >
            <circle className="war-marker-disc" r={13} />
            {/* 교차한 두 칼 */}
            <path className="war-marker-icon" d="M-6,-6 L6,6 M6,-6 L-6,6 M-7,2 L-2,7 M7,2 L2,7" />
            {/* 이름은 아이콘의 세로 가운데에(2026-11-27: 글자 높이의 가운데가 원의 중심에 오게 밑줄을 0.35em 내림). 둘째 줄은 그 아래 */}
            <text className="war-marker-label" x={17} y={0} dy="0.35em">
              {name}
            </text>
            <text className="war-marker-sub" x={17} y={18}>
              {formatYear(theater.from, '')}–{formatYear(theater.to, '')} · 전선 보기
            </text>
          </g>
        );
      })}
    </g>
  );
}
