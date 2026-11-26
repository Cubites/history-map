import type { GeoProjection } from 'd3-geo';
import { factionColor, factionIndex } from '../lib/wars.ts';
import type { FrontSnapshotOut, WarIndexEntry } from '../schema/index.ts';

/** 화살촉 크기(px, 2026-11-23: 11 → 16). 선은 화살촉의 REF 자리에서 끝나고 화살촉 끝은 그 앞으로 TIP만큼 나간다 */
const HEAD = 16;
const HEAD_REF = 6;
const TIP = ((10 - HEAD_REF) * HEAD) / 10;
/** 화살촉 끝과 목표 지점(전투 아이콘 반지름 8px·거점 점 등) 사이의 간격(px, 2026-11-23). 화살촉이 아이콘·이름에 겹쳐 안 보이는 것을 막는다 */
const TARGET_GAP = 13;

/** 꺾은선의 끝을 by(px)만큼 물린다. 마지막 마디가 짧으면 그 마디의 절반까지만 물려 방향을 지킨다 */
export function pullBack(points: [number, number][], by: number): [number, number][] {
  const [p, q] = [points[points.length - 2], points[points.length - 1]];
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  if (!(len > 0)) return points;
  const cut = Math.min(by, len / 2);
  return [...points.slice(0, -1), [q[0] - ((q[0] - p[0]) / len) * cut, q[1] - ((q[1] - p[1]) / len) * cut]];
}

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
    // 선은 목표 지점에 닿기 전에 끝낸다(화살촉 끝이 목표에서 TARGET_GAP만큼 떨어지게). 이름은 원래 끝 지점 옆 그대로
    return [{ key: i, index, color, d: `M${pullBack(points, TARGET_GAP + TIP).join('L')}`, end: points[points.length - 1], label: a.label }];
  });
  return (
    <g className="front-arrows" aria-hidden>
      <defs>
        {/* 흰 테두리(2026-11-23): 같은 선·화살촉을 흰색으로 조금 굵게 먼저 그리고 그 위에 색 선을 그린다 */}
        <marker id="front-head-halo" viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto" overflow="visible">
          <path d="M0,0L10,5L0,10L3,5z" className="front-head-halo" />
        </marker>
        {[0, 1].map((i) => (
          <marker key={i} id={`front-head-${i}`} viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0L10,5L0,10L3,5z" className={`front-head-${i}`} />
          </marker>
        ))}
        {arrows
          .filter((a) => a.color)
          .map((a) => (
            <marker key={`c${a.key}`} id={`front-head-c${a.key}`} viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0L10,5L0,10L3,5z" fill={a.color} />
            </marker>
          ))}
      </defs>
      {arrows.map((a) => (
        <g key={a.key} className={`front-arrow front-arrow-${a.index}`}>
          <path className="front-arrow-line front-arrow-halo" d={a.d} markerEnd="url(#front-head-halo)" />
          <path className="front-arrow-line" d={a.d} style={a.color ? { stroke: a.color } : undefined} markerEnd={`url(#front-head-${a.color ? `c${a.key}` : a.index})`} />
          {a.label && (
            <text className="front-arrow-label" data-label-priority={3} x={a.end[0] + 7} y={a.end[1]} dy="1.1em" style={a.color ? { fill: a.color } : undefined}>
              {a.label}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}
