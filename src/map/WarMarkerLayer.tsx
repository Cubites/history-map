import type { GeoProjection } from 'd3-geo';
import type { WarTheater } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';

/**
 * 평소 지도의 전쟁 표시 (DESIGN.md §4.5). 그 해에 진행 중인 전역마다 교차한 칼 모양 표시와 이름을 둔다.
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
            <text className="war-marker-label" x={17} y={-3}>
              {name}
            </text>
            <text className="war-marker-sub" x={17} y={11}>
              {formatYear(theater.from, '')}–{formatYear(theater.to, '')} · 전선 보기
            </text>
          </g>
        );
      })}
    </g>
  );
}
