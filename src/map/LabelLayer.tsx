import type { GeoProjection } from 'd3-geo';
import type { ZoomTransform } from 'd3-zoom';
import type { LoadedEntity } from '../data/staticData.ts';
import type { LonLat } from '../schema/index.ts';
import type { DrawnTerritory } from './TerritoryLayer.tsx';

interface Props {
  territories: (DrawnTerritory & { anchor: LonLat })[];
  entities: Map<string, LoadedEntity>;
  selectedId: string | null;
  projection: GeoProjection;
  transform: ZoomTransform;
}

/** 화면에서 이 너비(px)보다 좁은 영토는 이름을 숨긴다 */
const MIN_LABEL_WIDTH = 34;

export function LabelLayer({ territories, entities, selectedId, projection, transform }: Props) {
  return (
    <g className="labels" aria-hidden>
      {territories.map((t) => {
        const width = (t.bounds[1][0] - t.bounds[0][0]) * transform.k;
        const p = projection(t.anchor);
        if (!p || (width < MIN_LABEL_WIDTH && t.entityId !== selectedId)) return null;
        const [x, y] = transform.apply(p);
        return (
          <text key={t.entityId} className={t.entityId === selectedId ? 'label label-selected' : 'label'} x={x} y={y} dy="0.35em" textAnchor="middle">
            {entities.get(t.entityId)?.names.ko ?? t.entityId}
          </text>
        );
      })}
    </g>
  );
}
