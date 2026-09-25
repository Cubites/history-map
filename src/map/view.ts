// 지도 시점 (DESIGN.md §3). 면적 보존 도법(Equal Earth)에서 보고 있는 경도를 항상 중앙 경선으로 둔다.
// 옆으로 움직이면 지도를 밀어내는 대신 도법을 회전시키므로, 보는 곳은 늘 왜곡이 가장 작은 중심에 온다.
import { geoEqualEarth, type GeoProjection } from 'd3-geo';
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
  return geoEqualEarth()
    .rotate([-view.lon, 0])
    .scale(s0 * view.k)
    .translate([size.width / 2 + view.dx, view.ty])
    .precision(precise ? Math.SQRT1_2 : 0);
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

  ty = 2 * halfHeight <= size.height ? size.height / 2 : clamp(ty, size.height - halfHeight, halfHeight);
  return { lon: normalizeLon(lon), k, ty, dx };
}

/** 경위도 시점을 화면 시점으로. 해당 위도가 화면 가운데에 오게 한다 */
export function toView(size: Size, s0: number, { lon, lat, k }: GeoView): View {
  const projection = createProjection(size, s0, { lon, k, ty: 0, dx: 0 });
  const y = projection([lon, lat])![1];
  return constrain(size, s0, { lon, k, ty: size.height / 2 - y, dx: 0 });
}

/** 화면 가운데의 위도 */
export function centerLat(size: Size, s0: number, view: View): number {
  const projection = createProjection(size, s0, view);
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
  // 그 밖에는 가로 이동량만큼 도법을 회전한다. 회전은 지도 끝 위치를 바꾸지 않으므로 빈 곳을 만들지 않는다.
  const projection = createProjection(size, s0, view);
  const point: [number, number] = [meridianX + (target[0] - center[0]), target[1]];
  const hit = invertPoint(projection, point);
  const lon = hit ? hit[0] : view.lon + (target[0] - center[0]) / (EQUATOR_PER_DEGREE * s0 * view.k);
  return constrain(size, s0, { lon, k, ty, dx: view.dx });
}
