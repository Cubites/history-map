// 육지와 영토를 Canvas에 그린다 (DESIGN.md §3). 매 프레임 도법을 다시 계산하므로
// 가장 무거운 이 부분만 Canvas로 두고, 한두 개만 그리는 강조·화살표·이름표는 SVG로 그린다.
import { geoGraticule10, geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
import type { BBox, Certainty } from '../schema/index.ts';
import { invertPoint, normalizeLon, type Size, type View } from './view.ts';

/** 그릴 도형 하나와 그 경위도 범위 */
export interface Shape {
  feature: GeoPermissibleObjects;
  bbox: BBox;
}

/**
 * 칠할 도형과 테두리를 그릴 도형을 따로 받는다. 원래 도형이면 둘이 같고,
 * 격자 조각(DESIGN.md §3.2)이면 칠하기는 조각, 테두리는 선 조각이다 (조각 경계선을 그리지 않기 위해).
 */
export interface DrawShapes {
  fill: Shape[];
  stroke: Shape[];
}

export interface DrawTerritory extends DrawShapes {
  color: string;
  certainty: Certainty;
  /** 점령한 나라의 색. 있으면 그 색으로 빗금을 친다 (DESIGN.md §4.3) */
  hatch?: string;
  /** 종속·간섭한 나라의 색. 있으면 테두리를 그 색으로 굵게 그린다 (DESIGN.md §4.3) */
  border?: string;
  /** 선택(굵게)·hover(가늘게)한 영토의 강조 테두리 두께(px). 지도와 같은 프레임·같은 도형으로 그려야 움직일 때 어긋나지 않는다 */
  highlight?: number;
}

const VASSAL_BORDER_WIDTH = 3;
const FRONT_LINE_WIDTH = 3;

/**
 * 전쟁 중 전선 (DESIGN.md §4.5). 해당 나라들의 영토 대신 두 편의 점령 지역을 칠하고 전선을 굵게 긋는다.
 * 전선은 바다까지 그어진 원래 선을 두 지역 안으로만 잘라 그린다.
 */
export interface DrawFront {
  north: Shape[];
  south: Shape[];
  northColor: string;
  southColor: string;
  line: Shape;
  /** 선택·hover한 편의 강조 테두리 두께(px) */
  highlight?: { side: 'north' | 'south'; width: number }[];
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
  /** 선택·hover 강조 테두리 */
  highlight: string;
  /** 전쟁 중 전선 */
  frontLine: string;
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
  // 극점이 화면 안에 있거나 가까우면 모든 경도가 보일 수 있다 (격자 점만으로는 놓친다)
  const onScreen = (lat: number) => {
    const p = projection([view.lon, lat]);
    return !!p && p[0] >= 0 && p[0] <= size.width && p[1] >= 0 && p[1] <= size.height;
  };
  const north = onScreen(90) || n > 80;
  const south = onScreen(-90) || s < -80;
  if (north || south)
    return { w: -180, e: 180, s: south ? -90 : s - margin, n: north ? 90 : n + margin, all: false };
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
  land: DrawShapes,
  territories: DrawTerritory[],
  palette: Palette,
  front?: DrawFront,
) {
  const fast = geoPath(projection, ctx);
  const precise = geoPath(preciseProjection, ctx);
  /** 도형들을 현재 경로에 더한다. 이음새에 걸친 도형만 곡선 보정을 켠 투영으로 */
  const trace = (shapes: Shape[]) => {
    for (const s of shapes) (crossesSeam(s.bbox, view) ? precise : fast)(s.feature);
  };
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

  // 같은 대상의 조각은 한 경로로 칠해야 조각 사이에 이음매(안티에일리어싱 틈)가 보이지 않는다
  if (land.fill.length) {
    ctx.beginPath();
    trace(land.fill);
    ctx.fillStyle = palette.land;
    ctx.fill();
  }
  if (land.stroke.length) {
    ctx.beginPath();
    trace(land.stroke);
    ctx.strokeStyle = palette.landStroke;
    ctx.stroke();
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.territoryStroke;
  for (const t of territories) {
    ctx.beginPath();
    trace(t.fill);
    ctx.fillStyle = t.color;
    ctx.fill();
    const hatch = t.hatch && hatchPattern(ctx, t.hatch);
    if (hatch) {
      ctx.fillStyle = hatch;
      ctx.fill();
    }
    if (t.stroke !== t.fill) {
      ctx.beginPath();
      trace(t.stroke);
    }
    // 추정·논쟁 경계는 점선 (DESIGN.md §4.2)
    ctx.setLineDash(t.certainty === 'confirmed' ? [] : [4, 3]);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // 종속 관계 테두리는 이웃 영토에 덮이지 않도록 모든 영토를 칠한 뒤 그린다
  ctx.lineWidth = VASSAL_BORDER_WIDTH;
  for (const t of territories) {
    if (!t.border) continue;
    ctx.beginPath();
    trace(t.stroke);
    ctx.strokeStyle = t.border;
    ctx.stroke();
  }

  if (front) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = palette.territoryStroke;
    for (const [shapes, color] of [[front.south, front.southColor], [front.north, front.northColor]] as const) {
      ctx.beginPath();
      trace(shapes);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.stroke();
    }
    // 전선은 두 지역 안에서만 보이게 자른다 (원래 선은 바다까지 그어져 있다)
    ctx.save();
    ctx.beginPath();
    trace([...front.north, ...front.south]);
    ctx.clip();
    ctx.beginPath();
    trace([front.line]);
    ctx.lineWidth = FRONT_LINE_WIDTH;
    ctx.strokeStyle = palette.frontLine;
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = palette.highlight;
    for (const h of front.highlight ?? []) {
      ctx.beginPath();
      trace(h.side === 'north' ? front.north : front.south);
      ctx.lineWidth = h.width;
      ctx.stroke();
    }
  }

  // 선택·hover 강조 테두리는 맨 위에
  ctx.strokeStyle = palette.highlight;
  for (const t of territories) {
    if (!t.highlight) continue;
    ctx.beginPath();
    trace(t.stroke);
    ctx.lineWidth = t.highlight;
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  precise(SPHERE);
  ctx.strokeStyle = palette.outline;
  ctx.stroke();
}
