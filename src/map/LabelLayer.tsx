import type { GeoProjection } from 'd3-geo';
import type { LoadedEntity } from '../data/staticData.ts';
import type { TerritoryIndexEntry } from '../schema/index.ts';
import { pxPerDegree, type Size, type View } from './view.ts';

interface Props {
  territories: TerritoryIndexEntry[];
  entities: Map<string, LoadedEntity>;
  selectedId: string | null;
  projection: GeoProjection;
  view: View;
  size: Size;
}

/** 화면에서 이 너비(px)보다 좁은 영토는 이름을 숨긴다 */
const MIN_LABEL_WIDTH = 34;

/** 나라 이름표. 화면 좌표로 그려서 확대해도 글자 크기가 변하지 않는다. */
export function LabelLayer({ territories, entities, selectedId, projection, view, size }: Props) {
  return (
    <g className="labels">
      {territories.map((t) => {
        const p = projection(t.anchor);
        if (!p || p[0] < -40 || p[0] > size.width + 40 || p[1] < -20 || p[1] > size.height + 20) return null;
        const width = (t.bbox[2] - t.bbox[0]) * pxPerDegree(projection, view, t.anchor[1]);
        if (width < MIN_LABEL_WIDTH && t.entityId !== selectedId) return null;
        return (
          <text key={t.key} className={t.entityId === selectedId ? 'label label-selected' : 'label'} x={p[0]} y={p[1]} dy="0.35em" textAnchor="middle">
            {entities.get(t.entityId)?.names.ko ?? t.entityId}
          </text>
        );
      })}
    </g>
  );
}
