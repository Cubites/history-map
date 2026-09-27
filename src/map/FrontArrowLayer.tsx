import type { GeoProjection } from 'd3-geo';
import { factionColor, factionIndex } from '../lib/wars.ts';
import type { FrontSnapshotOut, WarIndexEntry } from '../schema/index.ts';

/**
 * 전쟁 보기의 작전 화살표 (DESIGN.md §4.5). 경위도 경로를 화면 좌표로 옮겨 그린다.
 * 진영은 색과 선 모양을 함께 다르게 한다: 첫 진영 실선, 둘째 긴 점선, 셋째부터 진영 색의 짧은 점선.
 */
export function FrontArrowLayer({
  war,
  snapshot,
  projection,
  entityColor,
}: {
  war: WarIndexEntry;
  snapshot: FrontSnapshotOut;
  projection: GeoProjection;
  entityColor: (id: string) => string | undefined;
}) {
  const arrows = snapshot.arrows.flatMap((a, i) => {
    const points = a.path.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
    if (points.length < 2) return [];
    const index = Math.min(factionIndex(war, a.faction), 2);
    // 셋째 진영부터는 진영 색을 쓴다 (첫째·둘째는 지도 위에서 잘 보이는 전용 색)
    const color = index >= 2 ? factionColor(war, a.faction, entityColor) : undefined;
    return [{ key: i, index, color, d: `M${points.join('L')}`, end: points[points.length - 1], label: a.label }];
  });
  return (
    <g className="front-arrows" aria-hidden>
      <defs>
        {[0, 1].map((i) => (
          <marker key={i} id={`front-head-${i}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0L10,5L0,10z" className={`front-head-${i}`} />
          </marker>
        ))}
        {arrows
          .filter((a) => a.color)
          .map((a) => (
            <marker key={`c${a.key}`} id={`front-head-c${a.key}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0L10,5L0,10z" fill={a.color} />
            </marker>
          ))}
      </defs>
      {arrows.map((a) => (
        <g key={a.key} className={`front-arrow front-arrow-${a.index}`}>
          <path className="front-arrow-line" d={a.d} style={a.color ? { stroke: a.color } : undefined} markerEnd={`url(#front-head-${a.color ? `c${a.key}` : a.index})`} />
          {a.label && (
            <text className="front-arrow-label" x={a.end[0] + 7} y={a.end[1]} dy="1.1em" style={a.color ? { fill: a.color } : undefined}>
              {a.label}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}
