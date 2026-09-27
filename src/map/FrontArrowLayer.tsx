import type { GeoProjection } from 'd3-geo';
import type { FrontSnapshotOut } from '../schema/index.ts';

/**
 * 전쟁 중 작전 화살표 (DESIGN.md §4.5). 경위도 경로를 화면 좌표로 옮겨 그린다.
 * north 편(선의 북·서쪽)과 south 편을 색과 선 모양으로 구분한다.
 */
export function FrontArrowLayer({ snapshot, projection }: { snapshot: FrontSnapshotOut; projection: GeoProjection }) {
  const arrows = snapshot.arrows.flatMap((a, i) => {
    const points = a.path.map((p) => projection(p)).filter((p): p is [number, number] => !!p);
    if (points.length < 2) return [];
    return [{ key: i, side: a.side, d: `M${points.join('L')}`, end: points[points.length - 1], label: a.label }];
  });
  return (
    <g className="front-arrows" aria-hidden>
      <defs>
        {(['north', 'south'] as const).map((side) => (
          <marker key={side} id={`front-head-${side}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0L10,5L0,10z" className={`front-head-${side}`} />
          </marker>
        ))}
      </defs>
      {arrows.map((a) => (
        <g key={a.key} className={`front-arrow front-arrow-${a.side}`}>
          <path className="front-arrow-line" d={a.d} markerEnd={`url(#front-head-${a.side})`} />
          {a.label && (
            <text className="front-arrow-label" x={a.end[0] + 7} y={a.end[1]} dy="1.1em">
              {a.label}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}
