import type { GeoProjection } from 'd3-geo';
import type { ZoomTransform } from 'd3-zoom';
import { anchorAt, type StaticData } from '../data/staticData.ts';
import { linkDirection } from '../lib/events.ts';
import type { HistoryEvent } from '../schema/index.ts';

interface Props {
  data: StaticData;
  event: HistoryEvent;
  selectedId: string;
  projection: GeoProjection;
  transform: ZoomTransform;
}

/** 화살표 끝을 기준점에서 조금 떨어뜨려 이름표와 겹치지 않게 한다 */
const END_GAP = 10;
/** 곡선이 휘는 정도 (선 길이 대비) */
const BEND = 0.2;

/**
 * 사건 화살표 (DESIGN.md §6.3). 화면 좌표로 그려서 확대해도 굵기와 화살촉 크기가 변하지 않는다.
 * 곡선은 진행 방향 왼쪽으로 휘므로 A→B와 B→A가 자동으로 서로 반대쪽으로 갈린다.
 */
export function ArrowLayer({ data, event, selectedId, projection, transform }: Props) {
  const toScreen = (entityId: string) => {
    const lonLat = anchorAt(data.anchors, entityId, event.year);
    const p = lonLat && projection(lonLat);
    return p ? transform.apply(p) : null;
  };

  const arrows = event.links.flatMap((link, i) => {
    const direction = linkDirection(link, selectedId);
    if (direction === 'other') return [];
    const a = toScreen(link.from);
    const b = toScreen(link.to);
    if (!a || !b) return [];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(dx, dy);
    if (len < END_GAP * 3) return [];
    const [ux, uy] = [dx / len, dy / len];
    const control: [number, number] = [a[0] + dx / 2 + uy * len * BEND, a[1] + dy / 2 - ux * len * BEND];
    const start = shorten(a, control, END_GAP);
    const end = shorten(b, control, END_GAP);
    // 2차 베지어 곡선의 t=0.5 지점
    const mid: [number, number] = [(start[0] + 2 * control[0] + end[0]) / 4, (start[1] + 2 * control[1] + end[1]) / 4];
    return [{ key: `${i}`, direction, d: `M${start}Q${control} ${end}`, mid, note: link.note, from: a, to: b }];
  });

  return (
    <g className="arrows" aria-hidden>
      <defs>
        <marker id="arrowhead-in" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0L10,5L0,10z" className="arrowhead-in" />
        </marker>
        <marker id="arrowhead-out" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0L10,5L0,10z" className="arrowhead-out" />
        </marker>
      </defs>
      {arrows.map((a) => (
        <g key={a.key} className={`arrow arrow-${a.direction}`}>
          <path className="arrow-line" d={a.d} markerEnd={`url(#arrowhead-${a.direction})`} />
          <circle className="arrow-origin" cx={a.from[0]} cy={a.from[1]} r={3.5} />
          {a.note && (
            <text className="arrow-note" x={a.mid[0]} y={a.mid[1]} dy="-0.4em" textAnchor="middle">
              {a.note}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

function shorten(point: [number, number], toward: [number, number], by: number): [number, number] {
  const [dx, dy] = [toward[0] - point[0], toward[1] - point[1]];
  const len = Math.hypot(dx, dy) || 1;
  return [point[0] + (dx / len) * by, point[1] + (dy / len) * by];
}
