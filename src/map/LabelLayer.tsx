import type { GeoProjection } from 'd3-geo';
import type { LoadedEntity } from '../data/staticData.ts';
import { useMediaQuery } from '../lib/useMediaQuery.ts';
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

/**
 * 이름표를 숨기는 기준 (2026-11-11). PC와 휴대폰은 화면 크기가 달라 따로 둔다.
 * - minWidth: 화면에서 영토 폭이 이보다 좁으면(px) 이름을 숨긴다
 * - gap: 이름표끼리 이 간격(px)보다 가까우면 겹친 것으로 보고 하나를 숨긴다. 휴대폰은 화면이 좁아 이름표가 빽빽해지므로 더 넓게 띄운다
 */
const LABEL_RULES = {
  pc: { minWidth: 34, gap: 4 },
  mobile: { minWidth: 40, gap: 8 },
};
/** 이름표 글자 크기·굵기 (styles.css의 .label, .label-selected와 같게) */
const FONT = { size: 12, weight: 600 };
const FONT_SELECTED = { size: 13, weight: 800 };
/** 글자 둘레 흰 테두리(.label의 stroke-width 3px)의 한쪽 두께 */
const HALO = 1.5;

let measureCtx: CanvasRenderingContext2D | null | undefined;
const widthCache = new Map<string, number>();
/** 이름표 글자 폭(px). 화면 글꼴로 한 번 재서 기억해 둔다 */
function textWidth(text: string, { size, weight }: { size: number; weight: number }): number {
  const key = `${weight}/${size}/${text}`;
  let width = widthCache.get(key);
  if (width === undefined) {
    measureCtx ??= document.createElement('canvas').getContext('2d');
    if (measureCtx) {
      measureCtx.font = `${weight} ${size}px ${getComputedStyle(document.body).fontFamily}`;
      width = measureCtx.measureText(text).width;
    } else width = text.length * size;
    widthCache.set(key, width);
  }
  return width;
}

/**
 * 나라 이름표. 화면 좌표로 그려서 확대해도 글자 크기가 변하지 않는다.
 * 이름표끼리 겹치면(2026-11-11) 고른 나라 → 화면에서 큰 영토 순으로 먼저 놓고, 앞서 놓은 이름표와 겹치는 것은 숨긴다.
 * 축소할수록 작은 나라 이름부터 사라지고, 확대해서 서로 떨어지면 다시 보인다. 고른 나라의 이름은 늘 보인다
 */
export function LabelLayer({ territories, entities, selectedId, projection, view, size }: Props) {
  const mobile = useMediaQuery('(max-width: 768px)');
  const rule = mobile ? LABEL_RULES.mobile : LABEL_RULES.pc;

  const candidates = territories.flatMap((t) => {
    const p = projection(t.anchor);
    if (!p || p[0] < -40 || p[0] > size.width + 40 || p[1] < -20 || p[1] > size.height + 20) return [];
    const perDegree = pxPerDegree(projection, view, t.anchor[1]);
    const width = (t.bbox[2] - t.bbox[0]) * perDegree;
    const selected = t.entityId === selectedId;
    if (width < rule.minWidth && !selected) return [];
    const text = entities.get(t.entityId)?.names.ko ?? t.entityId;
    const font = selected ? FONT_SELECTED : FONT;
    const half = { w: textWidth(text, font) / 2 + HALO, h: font.size * 0.6 + HALO };
    const area = width * (t.bbox[3] - t.bbox[1]) * perDegree;
    return [{ t, p, text, selected, half, area }];
  });
  candidates.sort((a, b) => Number(b.selected) - Number(a.selected) || b.area - a.area);
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
  const shown = candidates.filter((c) => {
    const box = { x0: c.p[0] - c.half.w, y0: c.p[1] - c.half.h, x1: c.p[0] + c.half.w, y1: c.p[1] + c.half.h };
    const g = rule.gap;
    if (!c.selected && placed.some((o) => box.x0 < o.x1 + g && o.x0 < box.x1 + g && box.y0 < o.y1 + g && o.y0 < box.y1 + g)) return false;
    placed.push(box);
    return true;
  });

  return (
    <g className="labels">
      {shown.map(({ t, p, text, selected }) => (
        <text key={t.key} className={selected ? 'label label-selected' : 'label'} x={p[0]} y={p[1]} dy="0.35em" textAnchor="middle">
          {text}
        </text>
      ))}
    </g>
  );
}
