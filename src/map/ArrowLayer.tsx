import type { GeoProjection } from 'd3-geo';
import { anchorAt, type StaticData } from '../data/staticData.ts';
import { linkDirection } from '../lib/events.ts';
import type { HistoryEvent } from '../schema/index.ts';
import { labelHalf } from './LabelLayer.tsx';

interface Props {
  data: StaticData;
  event: HistoryEvent;
  selectedId: string;
  projection: GeoProjection;
}

/** 화살표 시작을 기준점(나라 이름표의 가운데, 시작 점 ●)에서 띄우는 거리 */
const END_GAP = 10;
/** 화살촉 크기(px, 2026-11-23: 9 → 14). 모양은 뒤쪽 가운데가 V자로 파인 쐐기(2026-11-26: 삼각형 → 쐐기, 전선 화살표·진군로도 같음). 선은 화살촉의 REF 자리에서 끝나고 화살촉 끝은 그 앞으로 TIP만큼 나간다 */
const HEAD = 14;
const HEAD_REF = 6;
const TIP = ((10 - HEAD_REF) * HEAD) / 10;
/** 화살촉 끝과 목표 나라 이름표 글자 상자 사이의 간격(px, 2026-11-23). 화살촉이 이름에 겹쳐 안 보이는 것을 막는다 */
const TARGET_GAP = 5;
/** 곡선이 휘는 정도 (선 길이 대비) */
const BEND = 0.2;

/**
 * 사건 화살표 (DESIGN.md §6.3). 화면 좌표로 그려서 확대해도 굵기와 화살촉 크기가 변하지 않는다.
 * 곡선은 진행 방향 왼쪽으로 휘므로 A→B와 B→A가 자동으로 서로 반대쪽으로 갈린다.
 */
export function ArrowLayer({ data, event, selectedId, projection }: Props) {
  const toScreen = (entityId: string) => {
    const lonLat = anchorAt(data.territories, entityId, event.year);
    return (lonLat && projection(lonLat)) ?? null;
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
    // 끝(2026-11-23): 목표 나라 이름표의 글자 상자에 간격을 둔 바깥에서 화살촉 끝이 멈추게 곡선을 자른다.
    // 곡선(시작 → 목표 가운데)을 끝에서부터 거슬러 올라가 상자 밖으로 나오는 첫 점이 화살촉 끝, 거기서 TIP만큼 더 앞이 선의 끝
    const name = data.entities.get(link.to)?.names.ko ?? link.to;
    const half = labelHalf(name, link.to === selectedId);
    const at = (t: number): [number, number] => [
      (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * control[0] + t * t * b[0],
      (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * control[1] + t * t * b[1],
    ];
    const inBox = (p: [number, number]) => Math.abs(p[0] - b[0]) <= half.w + TARGET_GAP && Math.abs(p[1] - b[1]) <= half.h + TARGET_GAP;
    const STEPS = 200;
    let k = STEPS;
    while (k > 0 && inBox(at(k / STEPS))) k--;
    const tip = at(k / STEPS);
    while (k > 0 && Math.hypot(at(k / STEPS)[0] - tip[0], at(k / STEPS)[1] - tip[1]) < TIP) k--;
    // 이름표가 길어 곡선이 거의 남지 않으면 그리지 않는다
    if (k < STEPS * 0.25) return [];
    const t = k / STEPS;
    const end = at(t);
    // 곡선의 앞부분(0~t)만 남긴다: 제어점은 시작 → 제어점의 t 지점
    const cut: [number, number] = [start[0] + (control[0] - start[0]) * t, start[1] + (control[1] - start[1]) * t];
    // 2차 베지어 곡선의 t=0.5 지점
    const mid: [number, number] = [(start[0] + 2 * cut[0] + end[0]) / 4, (start[1] + 2 * cut[1] + end[1]) / 4];
    return [{ key: `${i}`, direction, d: `M${start}Q${cut} ${end}`, mid, note: link.note, from: a, to: b }];
  });

  return (
    <g className="arrows" aria-hidden>
      <defs>
        {/* 흰 테두리(2026-11-23): 같은 선·화살촉을 흰색으로 조금 굵게 먼저 그리고 그 위에 색 선을 그린다 */}
        <marker id="arrowhead-halo" viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto" overflow="visible">
          <path d="M0,0L10,5L0,10L3,5z" className="arrowhead-halo" />
        </marker>
        <marker id="arrowhead-in" viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0L10,5L0,10L3,5z" className="arrowhead-in" />
        </marker>
        <marker id="arrowhead-out" viewBox="0 0 10 10" refX={HEAD_REF} refY="5" markerWidth={HEAD} markerHeight={HEAD} markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0L10,5L0,10L3,5z" className="arrowhead-out" />
        </marker>
      </defs>
      {arrows.map((a) => (
        <g key={a.key} className={`arrow arrow-${a.direction}`}>
          <path className="arrow-line arrow-halo" d={a.d} markerEnd="url(#arrowhead-halo)" />
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
