// 지도 시점 (DESIGN.md §3). 면적 보존 도법(Equal Earth)에서 보고 있는 경도를 항상 중앙 경선으로 둔다.
// 옆으로 움직이면 지도를 밀어내는 대신 도법을 회전시키므로, 보는 곳은 늘 왜곡이 가장 작은 중심에 온다.
// 확대하면 람베르트 정적 방위 도법(보는 곳 중심)으로 부드럽게 바뀌어 고위도 지역의 모양도 바로잡는다 (D13, §3.1).
import {
  geoAzimuthalEqualAreaRaw,
  geoEqualEarth,
  geoEqualEarthRaw,
  geoProjection,
  type GeoProjection,
  type GeoRawProjection,
} from 'd3-geo';
import type { LonLat } from '../schema/index.ts';

export type Size = { width: number; height: number };

/**
 * 시점. 세로 위치와 (세계가 화면보다 좁을 때의) 가로 위치는 화면 픽셀로 둔다.
 * 지도 끝을 화면 경계에 붙이는 계산(constrain)을 픽셀 단위로 정확하게 하기 위해서다.
 */
export interface View {
  /** 중앙 경선의 경도 */
  lon: number;
  /** 확대 배율. 1이면 세계 전체가 화면에 들어온다 */
  k: number;
  /** 적도가 놓인 화면 y 좌표(px) */
  ty: number;
  /** 중앙 경선이 화면 가운데에서 벗어난 거리(px). 세계가 화면보다 좁을 때만 0이 아닐 수 있다 */
  dx: number;
}

/** 경위도와 배율로 적은 시점 (버튼 이동, 애니메이션용) */
export interface GeoView {
  lon: number;
  lat: number;
  k: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 60;
/** 최대로 축소했을 때 세계가 화면 가로나 세로 한쪽에 꼭 맞도록 여백을 두지 않는다 */
const PADDING = 0;

/** 첫 화면과 "동아시아" 버튼이 보여줄 범위 (DESIGN.md D5) */
export const EAST_ASIA_BOUNDS: [[west: number, south: number], [east: number, north: number]] = [[88, 18], [146, 54]];
export const DEFAULT_LON = 117;

// 축척 1일 때 세계 타원의 반폭·반높이와 적도에서 경도 1°의 폭 (Equal Earth는 적도에서 x가 경도에 비례)
const unit = geoEqualEarth().scale(1).translate([0, 0]);
const HALF_WIDTH = unit([180, 0])![0];
const HALF_HEIGHT = -unit([0, 90])![1];
const EQUATOR_PER_DEGREE = unit([1, 0])![0];

/** 배율 1에서 세계가 화면에 꼭 맞는 축척 */
export function baseScale({ width, height }: Size): number {
  return geoEqualEarth().fitExtent([[PADDING, PADDING], [width - PADDING, height - PADDING]], { type: 'Sphere' }).scale();
}

/**
 * 우리 데이터는 점이 이미 촘촘하므로 기본은 곡선 보정(적응형 재표본화)을 끈다. 측정 결과 계산이 약 40% 줄었다.
 * 점이 적은 지구 테두리와 이음새에서 잘린 면은 곡선 보정이 없으면 직선이 되어 타원이 각지고
 * 육지가 테두리 밖으로 튀어나오므로, 그런 곳에만 `precise`로 곡선 보정을 켠 투영을 쓴다.
 */
export function createProjection(size: Size, s0: number, view: View, precise = false): GeoProjection {
  const t = regionalBlend(size, s0, view.k);
  const world = worldProjection(size, s0, view, precise);
  if (t === 0) return world;
  // 화면 가운데의 땅은 도법이 바뀌어도 그대로 가운데에 있도록, Equal Earth 기준 중심 위도를 구해 그 점을 가운데에 둔다
  const center = world.invert!([size.width / 2 + view.dx, size.height / 2]);
  const lat = center && Number.isFinite(center[1]) ? center[1] : 0;
  const projection = geoProjection(blendRaw(t))
    // Equal Earth는 경도 180° 선(이음새)을 따라 자르지만, 방위 도법에서는 그 선이 한 줄로 겹쳐 지도가 사라진다.
    // 지역 도법이 절반 넘게 섞이면 중심에서 170° 떨어진 원으로 자른다 (이 축척에서는 화면 밖).
    .clipAngle(t >= 0.5 ? 170 : null)
    // 지역 도법이 섞일수록 보는 위도를 도법의 중심으로 옮긴다 (t=1이면 보는 곳이 정중앙, 북쪽이 위)
    .rotate([-view.lon, -lat * t])
    .scale(s0 * view.k)
    .translate([size.width / 2, size.height / 2])
    .precision(precise ? Math.SQRT1_2 : 0);
  const [x, y] = projection([view.lon, lat])!;
  return projection.translate([size.width + view.dx - x, size.height - y]);
}

/** 세계 지도: 가로로만 회전하는 Equal Earth */
function worldProjection(size: Size, s0: number, view: View, precise: boolean): GeoProjection {
  return geoEqualEarth()
    .rotate([-view.lon, 0])
    .scale(s0 * view.k)
    .translate([size.width / 2 + view.dx, view.ty])
    .precision(precise ? Math.SQRT1_2 : 0);
}

// ── 확대하면 지역 도법으로 (DESIGN.md §3.1 D13) ─────────────────
/**
 * 지도 축척(s0·k)이 화면의 긴 변의 이 비율에 이르면 지역 도법을 섞기 시작해서, 끝 비율에서 완전히 바꾼다.
 * 배율(k) 대신 화면 크기에 대한 비율로 정해, 좁은 모바일 화면에서도 지구 반대편 가장자리가 보이기 전에 바뀌지 않게 한다.
 * (PC 2096×1102에서 대략 배율 2.5~3.5, 성능 측정 기준)
 */
const BLEND_START = 0.45;
const BLEND_END = 0.65;

/** 지역 도법이 섞인 정도 (0: Equal Earth, 1: 람베르트 정적 방위 도법) */
export function regionalBlend(size: Size, s0: number, k: number): number {
  const ratio = (s0 * k) / Math.max(size.width, size.height);
  const x = clamp((ratio - BLEND_START) / (BLEND_END - BLEND_START), 0, 1);
  return x * x * (3 - 2 * x); // smoothstep: 양 끝에서 부드럽게
}

const blendCache = new Map<number, GeoRawProjection>();

/**
 * 두 도법의 좌표를 t 비율로 섞는다. 둘 다 면적을 보존하는 도법이라 섞은 도법도 면적 왜곡이 작다.
 * 섞은 도법은 역변환 공식이 없어서 뉴턴법으로 푼다 (나라 클릭, 끌기, 화면 밖 판정에 필요).
 */
function blendRaw(t: number): GeoRawProjection {
  if (t >= 1) return geoAzimuthalEqualAreaRaw;
  const key = Math.round(t * 1000) / 1000;
  const hit = blendCache.get(key);
  if (hit) return hit;
  const raw: GeoRawProjection = (lambda, phi) => {
    const a = geoEqualEarthRaw(lambda, phi);
    const b = geoAzimuthalEqualAreaRaw(lambda, phi);
    return [a[0] * (1 - key) + b[0] * key, a[1] * (1 - key) + b[1] * key];
  };
  raw.invert = (x, y) => {
    // 더 많이 섞인 쪽 도법의 역변환으로 시작점을 잡는다
    const start = (key < 0.5 ? geoEqualEarthRaw.invert! : geoAzimuthalEqualAreaRaw.invert!)(x, y);
    let [lambda, phi] = start;
    const h = 1e-7;
    for (let i = 0; i < 12; i++) {
      const [fx, fy] = raw(lambda, phi);
      const ex = fx - x;
      const ey = fy - y;
      if (Math.abs(ex) < 1e-10 && Math.abs(ey) < 1e-10) break;
      const [ax, ay] = raw(lambda + h, phi);
      const [bx, by] = raw(lambda, phi + h);
      const a = (ax - fx) / h, c = (ay - fy) / h, b = (bx - fx) / h, d = (by - fy) / h;
      const det = a * d - b * c;
      if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return [NaN, NaN];
      lambda -= (d * ex - b * ey) / det;
      phi -= (-c * ex + a * ey) / det;
    }
    return [lambda, phi];
  };
  if (blendCache.size > 256) blendCache.clear();
  blendCache.set(key, raw);
  return raw;
}

export function normalizeLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/**
 * 축소했을 때 지도 밖 빈 곳이 보이지 않도록 지도 끝을 화면 경계에 붙인다 (DESIGN.md §6.6).
 * - 세로: 위·아래 끝이 화면 안으로 들어오면 그 경계에 붙이고, 지도가 화면보다 낮으면 세로 가운데에 둔다.
 * - 가로: 세계가 화면보다 넓으면 좌우가 회전으로 이어지므로 끝이 없다. 세계가 화면보다 좁을 때만
 *   회전 대신 옮기고, 왼쪽·오른쪽 끝이 화면 안으로 들어오면 그 경계에 붙인다.
 */
export function constrain(size: Size, s0: number, view: View): View {
  const k = clamp(view.k, MIN_ZOOM, MAX_ZOOM);
  const halfWidth = HALF_WIDTH * s0 * k;
  const halfHeight = HALF_HEIGHT * s0 * k;
  let { lon, dx, ty } = view;

  if (2 * halfWidth <= size.width) {
    const room = size.width / 2 - halfWidth;
    dx = clamp(dx, -room, room);
  } else if (dx !== 0) {
    // 확대해서 세계가 화면보다 넓어지면 가로 어긋남을 도법 회전으로 넘겨 화면이 튀지 않게 한다
    lon -= dx / (EQUATOR_PER_DEGREE * s0 * k);
    dx = 0;
  }

  if (2 * halfHeight <= size.height) {
    ty = size.height / 2;
  } else {
    // 지역 도법이 섞일수록 끝 제한을 풀어, 다 바뀌면 극점이 화면 가운데까지 올 수 있게 한다.
    // 끝 제한은 Equal Earth 기준이라, 그대로 두면 극지방을 세로로 누르는 세계 도법의 특성 때문에
    // 확대할수록 극점이 화면 밖으로 밀려난다 (확대 10배에서 북극이 화면 위로 약 680px 밖).
    // 극점 바로 위(세계 타원 밖)는 역변환이 불안정하므로 극점에서 0.5px 앞까지만 허용한다
    const slack = regionalBlend(size, s0, k) * (size.height / 2 - 0.5);
    ty = clamp(ty, size.height - halfHeight - slack, halfHeight + slack);
  }
  return { lon: normalizeLon(lon), k, ty, dx };
}

/** 경위도 시점을 화면 시점으로. 해당 위도가 화면 가운데에 오게 한다 */
export function toView(size: Size, s0: number, { lon, lat, k }: GeoView): View {
  // 시점(ty)은 Equal Earth 기준으로 정의되므로 세계 도법으로 계산한다
  const projection = worldProjection(size, s0, { lon, k, ty: 0, dx: 0 }, false);
  const y = projection([lon, lat])![1];
  return constrain(size, s0, { lon, k, ty: size.height / 2 - y, dx: 0 });
}

/** 화면 가운데의 위도 */
export function centerLat(size: Size, s0: number, view: View): number {
  const projection = worldProjection(size, s0, view, false);
  const p = invertPoint(projection, [size.width / 2 + view.dx, size.height / 2]);
  return p ? p[1] : 0;
}

export function toGeoView(size: Size, s0: number, view: View): GeoView {
  return { lon: view.lon, lat: centerLat(size, s0, view), k: view.k };
}

/** 경위도 범위가 화면에 꽉 차는 시점. 화면 비율(PC 가로, 모바일 세로)에 따라 배율이 달라진다 */
export function fitBounds(size: Size, s0: number, [[west, south], [east, north]]: typeof EAST_ASIA_BOUNDS): View {
  const center = { lon: (west + east) / 2, lat: (south + north) / 2 };
  const projection = createProjection(size, s0, toView(size, s0, { ...center, k: 1 }));
  const points = [[west, south], [west, north], [east, south], [east, north], [center.lon, north], [center.lon, south]]
    .map((p) => projection(p as LonLat)!);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const k = 0.95 * Math.min(size.width / (Math.max(...xs) - Math.min(...xs)), size.height / (Math.max(...ys) - Math.min(...ys)));
  return toView(size, s0, { ...center, k });
}

/** 화면 한 점의 경위도. 지도 바깥(세계 타원 밖)이면 null */
export function invertPoint(projection: GeoProjection, point: [number, number]): LonLat | null {
  const p = projection.invert?.(point);
  if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  const back = projection(p);
  // 타원 밖의 점은 역변환이 엉뚱한 값을 돌려주므로 다시 투영해서 확인한다
  if (!back || Math.hypot(back[0] - point[0], back[1] - point[1]) > 1) return null;
  return p as LonLat;
}

/** 해당 위도에서 경도 1°가 화면에서 차지하는 폭(px) */
export function pxPerDegree(projection: GeoProjection, view: View, lat: number): number {
  const a = projection([view.lon - 0.5, lat]);
  const b = projection([view.lon + 0.5, lat]);
  return a && b ? Math.abs(b[0] - a[0]) : 1;
}

/**
 * 확대·축소 (휠·핀치·버튼). `anchor`는 확대 기준점(포인터)의 화면 좌표.
 * 먼저 recenter로 근사한 뒤, 기준점 아래에 있던 땅이 다시 기준점 아래로 오도록 시점을 보정한다.
 * 도법이 회전하고 섞이기 때문에 한 번의 근사로는 땅이 수십 px 밀린다 (측정: 1.25배 확대에 11~60px).
 */
export function zoomAround(size: Size, s0: number, view: View, target: [number, number], k: number, anchor: [number, number]): View {
  const ground = invertPoint(createProjection(size, s0, view), anchor);
  let next = recenter(size, s0, view, target, k);
  if (!ground) return next;
  const center: [number, number] = [size.width / 2, size.height / 2];
  for (let i = 0; i < 3; i++) {
    const now = createProjection(size, s0, next)(ground);
    if (!now) break;
    const [ex, ey] = [now[0] - anchor[0], now[1] - anchor[1]];
    if (Math.hypot(ex, ey) < 0.5) break;
    // 밀린 만큼 반대로 옮긴다 (같은 배율에서의 이동)
    next = recenter(size, s0, next, [center[0] + ex, center[1] + ey], next.k);
  }
  return next;
}

/**
 * d3-zoom의 이동량(끌기, 휠·핀치 확대의 기준점 보정)을 시점 변화로 바꾼다.
 * `target`은 새 화면 가운데에 올 점의 (옮기기 전) 화면 좌표, `k`는 새 배율.
 */
export function recenter(size: Size, s0: number, view: View, target: [number, number], k: number): View {
  const ratio = k / view.k;
  const center: [number, number] = [size.width / 2, size.height / 2];
  const meridianX = center[0] + view.dx;
  // 세로: 적도 줄을 같은 비율로 옮긴다
  const ty = (view.ty - target[1]) * ratio + center[1];
  const halfWidth = HALF_WIDTH * s0 * clamp(k, MIN_ZOOM, MAX_ZOOM);

  if (ratio !== 1 && 2 * halfWidth <= size.width) {
    // 세계가 화면보다 좁을 때 확대·축소하면 회전하지 않고 옮긴다 (끝이 화면 경계에 붙도록 constrain이 제한)
    return constrain(size, s0, { lon: view.lon, k, ty, dx: (meridianX - target[0]) * ratio });
  }
  // 그 밖에는 target 지점의 경위도를 새 화면 가운데로 삼는다 (가로는 도법 회전).
  // 회전은 지도 끝 위치를 바꾸지 않으므로 빈 곳을 만들지 않는다. 지역 도법이 섞여 있어도 같은 방식으로 맞는다.
  const projection = createProjection(size, s0, view);
  const point: [number, number] = [meridianX + (target[0] - center[0]), target[1]];
  const hit = invertPoint(projection, point);
  if (hit) {
    // 극점을 넘어 반대편을 잡으면 경도가 180° 뒤집혀 지도가 갑자기 돌아가므로, 극점에서 멈춘다
    if (regionalBlend(size, s0, view.k) > 0 && Math.abs(hit[1]) > 45 && Math.abs(normalizeLon(hit[0] - view.lon)) > 90) {
      const lat = Math.sign(hit[1] || centerLat(size, s0, view)) * 90;
      return constrain(size, s0, { ...toView(size, s0, { lon: view.lon, lat, k }), dx: view.dx });
    }
    return constrain(size, s0, { ...toView(size, s0, { lon: hit[0], lat: hit[1], k }), dx: view.dx });
  }
  // 지도 바깥(세계 타원 밖)을 잡았으면 Equal Earth 기준으로 근사한다
  const lon = view.lon + (target[0] - center[0]) / (EQUATOR_PER_DEGREE * s0 * view.k);
  return constrain(size, s0, { lon, k, ty, dx: view.dx });
}
