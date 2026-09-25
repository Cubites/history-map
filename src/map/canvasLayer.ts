// 육지와 영토를 Canvas에 그린다 (DESIGN.md §3). 매 프레임 도법을 다시 계산하므로
// 가장 무거운 이 부분만 Canvas로 두고, 한두 개만 그리는 강조·화살표·이름표는 SVG로 그린다.
import { geoGraticule10, geoPath, type GeoProjection } from 'd3-geo';
import type { BBox, Certainty } from '../schema/index.ts';
import type { LandPiece, TerritoryFeature } from '../data/staticData.ts';
import { invertPoint, normalizeLon, type Size, type View } from './view.ts';

export interface DrawTerritory {
  feature: TerritoryFeature;
  color: string;
  certainty: Certainty;
  bbox: BBox;
}

export interface Palette {
  ocean: string;
  graticule: string;
  land: string;
  landStroke: string;
  territoryStroke: string;
  outline: string;
}

const graticule = geoGraticule10();
const SPHERE = { type: 'Sphere' } as const;

/** 화면에 보이는 경위도 범위 (경도는 중앙 경선 기준 상대값). 화면 격자 점을 역투영해 구한다. */
export function visibleBounds(projection: GeoProjection, size: Size, view: View) {
  let [w, e, s, n] = [Infinity, -Infinity, Infinity, -Infinity];
  let outside = false;
  const steps = 6;
  for (let i = 0; i <= steps; i++)
    for (let j = 0; j <= steps; j++) {
      const p = invertPoint(projection, [(size.width * i) / steps, (size.height * j) / steps]);
      if (!p) {
        outside = true;
        continue;
      }
      const rel = normalizeLon(p[0] - view.lon);
      w = Math.min(w, rel);
      e = Math.max(e, rel);
      s = Math.min(s, p[1]);
      n = Math.max(n, p[1]);
    }
  // 세계 타원 가장자리가 보일 만큼 축소했으면 모두 그린다
  if (outside) return { w: -180, e: 180, s: -90, n: 90, all: true };
  const margin = 2;
  return { w: w - margin, e: e + margin, s: s - margin, n: n + margin, all: false };
}

export function isVisible(bbox: BBox, bounds: ReturnType<typeof visibleBounds>, view: View): boolean {
  if (bounds.all) return true;
  const [west, south, east, north] = bbox;
  if (north < bounds.s || south > bounds.n) return false;
  if (east - west >= 180) return true;
  const rw = normalizeLon(west - view.lon);
  const re = normalizeLon(east - view.lon);
  if (re < rw) return true; // 이음새(중앙 경선의 반대편)에 걸친 영토
  return re >= bounds.w && rw <= bounds.e;
}

export function drawMap(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  size: Size,
  land: LandPiece[],
  territories: DrawTerritory[],
  palette: Palette,
) {
  const path = geoPath(projection, ctx);
  ctx.clearRect(0, 0, size.width, size.height);

  ctx.beginPath();
  path(SPHERE);
  ctx.fillStyle = palette.ocean;
  ctx.fill();

  ctx.beginPath();
  path(graticule);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = palette.graticule;
  ctx.stroke();

  if (land.length) {
    ctx.beginPath();
    for (const piece of land) path(piece.feature);
    ctx.fillStyle = palette.land;
    ctx.fill();
    ctx.strokeStyle = palette.landStroke;
    ctx.stroke();
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.territoryStroke;
  for (const t of territories) {
    ctx.beginPath();
    path(t.feature);
    ctx.fillStyle = t.color;
    ctx.fill();
    // 추정·논쟁 경계는 점선 (DESIGN.md §4.2)
    ctx.setLineDash(t.certainty === 'confirmed' ? [] : [4, 3]);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.beginPath();
  path(SPHERE);
  ctx.strokeStyle = palette.outline;
  ctx.stroke();
}
