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
  /** 점령한 나라의 색. 있으면 그 색으로 빗금을 친다 (DESIGN.md §4.3) */
  hatch?: string;
}

const HATCH_SPACING = 7;
const hatchCache = new Map<string, CanvasPattern | null>();

/**
 * 점령지 빗금 무늬. 지도와 함께 움직이지 않는 화면 기준 무늬라 확대해도 간격이 일정하다.
 * 고해상도 화면에서 흐려지지 않도록 기기 픽셀 크기로 그린 뒤 CSS 픽셀로 줄인다.
 */
function hatchPattern(ctx: CanvasRenderingContext2D, color: string): CanvasPattern | null {
  const dpr = window.devicePixelRatio || 1;
  const key = `${color}@${dpr}`;
  if (hatchCache.has(key)) return hatchCache.get(key)!;
  const size = Math.round(HATCH_SPACING * dpr);
  const tile = document.createElement('canvas');
  tile.width = tile.height = size;
  const t = tile.getContext('2d')!;
  t.strokeStyle = color;
  t.lineWidth = 2 * dpr;
  t.lineCap = 'square';
  // 타일 경계에서 끊기지 않도록 대각선을 세 번 그린다
  t.beginPath();
  for (const offset of [-size, 0, size]) {
    t.moveTo(offset, size);
    t.lineTo(offset + size, 0);
  }
  t.stroke();
  const pattern = ctx.createPattern(tile, 'repeat');
  pattern?.setTransform(new DOMMatrix().scale(1 / dpr));
  hatchCache.set(key, pattern);
  return pattern;
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

/** 이음새(중앙 경선의 반대편 경선)에 걸친 도형인가 */
export function crossesSeam(bbox: BBox, view: View): boolean {
  const [west, , east] = bbox;
  if (east - west >= 180) return true;
  return normalizeLon(east - view.lon) < normalizeLon(west - view.lon);
}

/**
 * @param projection 곡선 보정을 끈 빠른 투영 (대부분의 도형)
 * @param preciseProjection 곡선 보정을 켠 투영 (지구 테두리, 경위선, 이음새에 걸친 도형). view.ts의 createProjection 참고
 */
export function drawMap(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  preciseProjection: GeoProjection,
  view: View,
  size: Size,
  land: LandPiece[],
  territories: DrawTerritory[],
  palette: Palette,
) {
  const fast = geoPath(projection, ctx);
  const precise = geoPath(preciseProjection, ctx);
  const pathFor = (bbox: BBox) => (crossesSeam(bbox, view) ? precise : fast);
  ctx.clearRect(0, 0, size.width, size.height);

  ctx.beginPath();
  precise(SPHERE);
  ctx.fillStyle = palette.ocean;
  ctx.fill();

  // 지구 테두리 밖으로는 아무것도 그리지 않는다
  ctx.save();
  ctx.clip();

  ctx.beginPath();
  precise(graticule);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = palette.graticule;
  ctx.stroke();

  if (land.length) {
    ctx.beginPath();
    for (const piece of land) pathFor(piece.bbox)(piece.feature);
    ctx.fillStyle = palette.land;
    ctx.fill();
    ctx.strokeStyle = palette.landStroke;
    ctx.stroke();
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.territoryStroke;
  for (const t of territories) {
    ctx.beginPath();
    pathFor(t.bbox)(t.feature);
    ctx.fillStyle = t.color;
    ctx.fill();
    const hatch = t.hatch && hatchPattern(ctx, t.hatch);
    if (hatch) {
      ctx.fillStyle = hatch;
      ctx.fill();
    }
    // 추정·논쟁 경계는 점선 (DESIGN.md §4.2)
    ctx.setLineDash(t.certainty === 'confirmed' ? [] : [4, 3]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  ctx.beginPath();
  precise(SPHERE);
  ctx.strokeStyle = palette.outline;
  ctx.stroke();
}
