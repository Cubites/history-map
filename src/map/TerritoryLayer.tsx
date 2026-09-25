import { memo } from 'react';
import type { Certainty } from '../schema/index.ts';

export interface DrawnTerritory {
  entityId: string;
  d: string;
  color: string;
  certainty: Certainty;
  /** 투영 좌표계 bbox (확대 전) */
  bounds: [[number, number], [number, number]];
}

interface Props {
  territories: DrawnTerritory[];
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

/** 확대/이동 때마다 다시 그리지 않도록 memo로 감싼다. */
export const TerritoryLayer = memo(function TerritoryLayer({ territories, onHover, onSelect }: Props) {
  return (
    <g className="territories">
      {territories.map((t) => (
        <path
          key={t.entityId}
          className="territory"
          data-certainty={t.certainty}
          d={t.d}
          fill={t.color}
          onMouseEnter={() => onHover(t.entityId)}
          onMouseLeave={() => onHover(null)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(t.entityId);
          }}
        />
      ))}
    </g>
  );
});
