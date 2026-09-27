import type { GeoProjection } from 'd3-geo';
import type { HistoryEvent } from '../schema/index.ts';

export interface BattlePin {
  event: HistoryEvent;
  name: string;
  at: [number, number];
}

/**
 * 전투 장소 표시 (DESIGN.md §4.5). 전쟁 보기가 없는 전쟁·전투 사건의 싸운 곳에 작은 ⊗를 둔다.
 * 전쟁 보기로 들어가는 ⚔ 표시와 구별되도록 작게 그리고, 누르면 그 사건을 패널에서 보여 준다.
 */
export function BattlePinLayer({ pins, projection, onOpen }: { pins: BattlePin[]; projection: GeoProjection; onOpen: (pin: BattlePin) => void }) {
  const points = pins.map((pin) => projection(pin.at) ?? null);
  // 표시와 이름이 차지하는 화면 영역. 이름이 다른 표시·이름과 겹치면 이름을 숨긴다 (확대해서 떨어지면 다시 보인다)
  const boxes = points.map((p, i) => (p ? { x0: p[0] - 7, x1: p[0] + 10 + labelWidth(pins[i].name), y0: p[1] - 7, y1: p[1] + 7 } : null));
  const crowded = boxes.map(
    (a, i) => !!a && boxes.some((b, j) => j !== i && !!b && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1),
  );
  return (
    <g className="battle-pins">
      {pins.map((pin, i) => {
        const p = points[i];
        if (!p) return null;
        const open = () => onOpen(pin);
        return (
          <g
            key={`${pin.event.id}/${i}`}
            className="battle-pin"
            transform={`translate(${p[0]},${p[1]})`}
            role="button"
            tabIndex={0}
            aria-label={`${pin.name} · ${pin.event.title.ko}`}
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
            <title>{`${pin.name} · ${pin.event.title.ko}`}</title>
            {/* 손가락으로도 누르기 쉽게 보이지 않는 넓은 판정 영역 */}
            <circle className="battle-pin-hit" r={12} />
            <circle className="battle-pin-disc" r={6.5} />
            <path className="battle-pin-icon" d="M-3.2,-3.2 L3.2,3.2 M3.2,-3.2 L-3.2,3.2" />
            {!crowded[i] && (
              <text className="battle-pin-label" x={10} y={4}>
                {pin.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** 이름표 너비 어림값(px): 한글은 글자당 약 11px, 나머지는 약 6.5px (11.5px 글꼴) */
function labelWidth(name: string): number {
  let w = 0;
  for (const ch of name) w += /[ㄱ-힝]/.test(ch) ? 11 : 6.5;
  return w;
}
