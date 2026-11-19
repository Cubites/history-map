// 미니게임용 지도 (2026-11-17). 본 지도(WorldMap)는 건드리지 않고, 같은 육지·영토 도형을 이름표 없이 따로 그린다.
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { geoAzimuthalEqualArea, geoCentroid, geoContains, geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
import { loadLand, type LandPiece, type TerritoryFeature } from '../data/staticData.ts';
import { useElementSize } from '../map/useElementSize.ts';
import type { LonLat } from '../schema/index.ts';

export interface MapShape {
  feature: TerritoryFeature;
  color: string;
  /** 있으면 기준점(anchor)에 이름표를 그린다 (옆 나라 힌트, 정답 공개) */
  name?: string;
  anchor?: LonLat;
  /** 누를 수 있는 도형이면 붙인다 (지도에서 나라 찾기) */
  id?: string;
}

interface Props {
  /** 화면에 맞출 도형(또는 점 묶음). 이것이 가운데에 오고 둘레가 함께 보인다 */
  fit: GeoPermissibleObjects;
  /** 문제의 나라 (맨 위에 진한 테두리로). 나라 찾기에서는 답한 뒤에만 준다 */
  main?: MapShape;
  others?: MapShape[];
  /** 맞춘 크기에서 얼마나 물러나 보일지 (1이면 도형이 화면에 꽉 참) */
  zoomOut?: number;
  /** 주면 지도를 눌렀을 때 그 자리의 도형 id를 알려 준다 (others 가운데 위에 그려진 것부터 찾는다) */
  onPick?: (id: string) => void;
  /** 참이면 문제의 나라 국경선만 그린다: 둘레의 육지·바다도, 나라 색도 없다 (어려움의 처음 모습) */
  bare?: boolean;
}

const NONE: MapShape[] = [];

export function QuizMap({ fit, main, others = NONE, zoomOut = 0.55, onPick, bare = false }: Props) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const proj = useRef<GeoProjection | null>(null);
  const [land, setLand] = useState<LandPiece[] | null>(null);

  useEffect(() => {
    let on = true;
    loadLand('mid').then((l) => on && setLand(l)).catch(() => {});
    return () => {
      on = false;
    };
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !size) return;
    const { width, height } = size;
    const dpr = window.devicePixelRatio || 1;
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    const ctx = el.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(el);
    const v = (name: string) => css.getPropertyValue(name).trim();

    // 맞출 도형을 중심으로 한 정적 방위 도법 (본 지도가 확대했을 때 쓰는 도법과 같다)
    const [lon, lat] = geoCentroid(fit);
    const projection = geoAzimuthalEqualArea().rotate([-lon, -lat]).clipAngle(110).precision(0.3).fitExtent([[0, 0], [width, height]], fit);
    // 작은 나라도 둘레 6°쯤은 함께 보이게 한다
    const maxScale = Math.min(width, height) / ((6 * Math.PI) / 180);
    projection.scale(Math.min(projection.scale() * zoomOut, maxScale)).translate([width / 2, height / 2]);
    proj.current = projection;
    const path = geoPath(projection, ctx);

    if (bare) {
      // 빈 바탕에 국경선만
      ctx.fillStyle = v('--surface');
      ctx.fillRect(0, 0, width, height);
      if (main) {
        ctx.beginPath();
        path(main.feature);
        ctx.lineJoin = 'round';
        ctx.strokeStyle = v('--fg');
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      return;
    }
    ctx.fillStyle = v('--ocean');
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    for (const piece of land ?? []) path(piece.feature);
    ctx.fillStyle = v('--land-unassigned');
    ctx.fill();
    ctx.strokeStyle = v('--land-stroke');
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.lineJoin = 'round';
    for (const s of others) {
      ctx.beginPath();
      path(s.feature);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v('--territory-border');
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (main) {
      ctx.beginPath();
      path(main.feature);
      ctx.fillStyle = main.color;
      ctx.fill();
      ctx.strokeStyle = v('--fg');
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const s of main ? [...others, main] : others) {
      const p = s.name && s.anchor ? projection(s.anchor) : null;
      if (!p) continue;
      ctx.font = `${s === main ? '800 14px' : '600 12px'} Pretendard, "Malgun Gothic", system-ui, sans-serif`;
      ctx.strokeStyle = v('--label-halo');
      ctx.lineWidth = 3;
      ctx.strokeText(s.name!, p[0], p[1]);
      ctx.fillStyle = v('--label');
      ctx.fillText(s.name!, p[0], p[1]);
    }
  }, [size, land, fit, main, others, zoomOut, bare]);

  const click = (ev: MouseEvent<HTMLCanvasElement>) => {
    if (!onPick || !proj.current?.invert) return;
    const r = ev.currentTarget.getBoundingClientRect();
    const at = proj.current.invert([ev.clientX - r.left, ev.clientY - r.top]);
    if (!at) return;
    // 나중에 그린(위에 놓인) 도형부터 찾는다
    for (let i = others.length - 1; i >= 0; i--) {
      const s = others[i];
      if (s.id && geoContains(s.feature, at)) return onPick(s.id);
    }
  };

  return (
    <div ref={ref} className={`mg-map${onPick ? ' pick' : ''}`}>
      <canvas ref={canvas} onClick={click} />
    </div>
  );
}
