import type { GeoProjection } from 'd3-geo';
import { useLayoutEffect, useRef } from 'react';
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
  /**
   * 'hit'이면 글 대신 보이는 이름표마다 투명한 누름 칸(data-entity)을 그린다(2026-11-12). 작은 나라도 이름을 눌러 고를 수 있게 한다.
   * 전투 표시 같은 다른 단추를 가리지 않도록 WorldMap이 그것들보다 아래에 따로 깐다. 글 이름표는 누름을 받지 않는다
   */
  mode?: 'text' | 'hit';
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
export function textWidth(text: string, { size, weight }: { size: number; weight: number }): number {
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

/** 이름표 글자 상자의 반폭·반높이(px, 흰 테두리 포함). 이름표 겹침 판정과 사건 화살표의 끝 띄우기(ArrowLayer)가 함께 쓴다 */
export function labelHalf(text: string, selected: boolean): { w: number; h: number } {
  const font = selected ? FONT_SELECTED : FONT;
  return { w: textWidth(text, font) / 2 + HALO, h: font.size * 0.6 + HALO };
}

/**
 * 나라 이름표. 화면 좌표로 그려서 확대해도 글자 크기가 변하지 않는다.
 * 이름표끼리 겹치면(2026-11-11) 고른 나라 → 화면에서 큰 영토 순으로 먼저 놓고, 앞서 놓은 이름표와 겹치는 것은 숨긴다.
 * 축소할수록 작은 나라 이름부터 사라지고, 확대해서 서로 떨어지면 다시 보인다. 고른 나라의 이름은 늘 보인다
 */
export function LabelLayer({ territories, entities, selectedId, projection, view, size, mode = 'text' }: Props) {
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
    const half = labelHalf(text, selected);
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

  if (mode === 'hit') {
    return (
      <g className="label-hits">
        {shown.map(({ t, p, half }) => (
          <rect key={t.key} className="label-hit" data-entity={t.entityId} x={p[0] - half.w} y={p[1] - half.h} width={half.w * 2} height={half.h * 2} />
        ))}
      </g>
    );
  }
  // 글 이름표는 SVG 글자가 아니라 캔버스에 그린다(2026-11-27). 밝은 사이트를 스스로 어둡게 덧칠하는 브라우저(삼성 브라우저)가 SVG 글자의 색만 밝게 뒤집고
  // 흰 테두리는 그대로 둬서 이름이 테두리에 묻혔다. 캔버스 그림은 덧칠하지 않으므로(지도 그림과 같음) 글자·테두리 색이 사이트가 정한 그대로 나온다.
  // 층 순서를 지키도록 SVG 안의 foreignObject에 캔버스를 둔다. 색·글꼴은 .labels에 적힌 값(--label, --label-halo)을 읽어 쓴다(어두운 화면에서도 따라 바뀜)
  return <LabelCanvas labels={mode === 'text' ? shown : []} size={size} />;
}

function LabelCanvas({ labels, size }: { labels: { p: [number, number]; text: string; selected: boolean }[]; size: Size }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const [w, h] = [Math.round(size.width * dpr), Math.round(size.height * dpr)];
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    const css = getComputedStyle(canvas);
    const family = css.fontFamily;
    ctx.fillStyle = css.getPropertyValue('--label').trim();
    ctx.strokeStyle = css.getPropertyValue('--label-halo').trim();
    ctx.lineWidth = HALO * 2;
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const { p, text, selected } of labels) {
      const font = selected ? FONT_SELECTED : FONT;
      ctx.font = `${font.weight} ${font.size}px ${family}`;
      // SVG 글자의 dy="0.35em"과 같은 자리
      const y = p[1] + font.size * 0.35;
      ctx.strokeText(text, p[0], y);
      ctx.fillText(text, p[0], y);
    }
  });
  return (
    <foreignObject className="labels" x={0} y={0} width={size.width} height={size.height}>
      <canvas ref={canvasRef} className="labels-canvas" style={{ width: size.width, height: size.height }} />
    </foreignObject>
  );
}
