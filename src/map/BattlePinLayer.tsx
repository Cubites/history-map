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
  return (
    <g className="battle-pins">
      {pins.map((pin, i) => {
        const p = projection(pin.at);
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
            <text className="battle-pin-label" x={10} y={4}>
              {pin.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
