// 지도 시점 (DESIGN.md §3). 면적 보존 도법(Equal Earth)에서 보고 있는 경도를 항상 중앙 경선으로 둔다.
// 옆으로 움직이면 지도를 밀어내는 대신 도법을 회전시키므로, 보는 곳은 늘 왜곡이 가장 작은 중심에 온다.
import { geoEqualEarth, type GeoProjection } from 'd3-geo';
import type { LonLat } from '../schema/index.ts';

export type Size = { width: number; height: number };

export interface View {
  /** 화면 가운데의 경도 = 중앙 경선 */
  lon: number;
  /** 화면 가운데의 위도 */
  lat: number;
  /** 확대 배율. 1이면 세계 전체가 화면에 들어온다 */
  k: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 60;
const LAT_LIMIT = 75;
const PADDING = 16;

/** 첫 화면과 "동아시아" 버튼이 보여줄 범위 (DESIGN.md D5) */
export const EAST_ASIA_BOUNDS: [[west: number, south: number], [east: number, north: number]] = [[88, 18], [146, 54]];
export const WORLD_VIEW: View = { lon: 117, lat: 0, k: 1 };

/** 경위도 범위가 화면에 꽉 차는 시점. 화면 비율(PC 가로, 모바일 세로)에 따라 배율이 달라진다 */
export function fitBounds(size: Size, s0: number, [[west, south], [east, north]]: typeof EAST_ASIA_BOUNDS): View {
  const center = { lon: (west + east) / 2, lat: (south + north) / 2, k: 1 };
  const projection = createProjection(size, s0, center);
  const points = [[west, south], [west, north], [east, south], [east, north], [center.lon, north], [center.lon, south]]
    .map((p) => projection(p as LonLat)!);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const k = 0.95 * Math.min(size.width / (Math.max(...xs) - Math.min(...xs)), size.height / (Math.max(...ys) - Math.min(...ys)));
  return clampView({ ...center, k });
}

/** 배율 1에서 세계가 화면에 꼭 맞는 축척 */
export function baseScale({ width, height }: Size): number {
  return geoEqualEarth().fitExtent([[PADDING, PADDING], [width - PADDING, height - PADDING]], { type: 'Sphere' }).scale();
}

export function createProjection(size: Size, s0: number, view: View): GeoProjection {
  // 우리 데이터는 점이 이미 촘촘하므로 곡선 보정(적응형 재표본화)을 끈다. 측정 결과 계산이 약 40% 줄었다.
  const projection = geoEqualEarth()
    .rotate([-view.lon, 0])
    .scale(s0 * view.k)
    .translate([size.width / 2, size.height / 2])
    .precision(0);
  const [, y] = projection([view.lon, view.lat])!;
  return projection.translate([size.width / 2, size.height - y]);
}

export function normalizeLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

export function clampView(view: View): View {
  return {
    lon: normalizeLon(view.lon),
    lat: Math.max(-LAT_LIMIT, Math.min(LAT_LIMIT, view.lat)),
    k: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.k)),
  };
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
export function pxPerDegree(projection: GeoProjection, view: View, lat = view.lat): number {
  const a = projection([view.lon - 0.5, lat]);
  const b = projection([view.lon + 0.5, lat]);
  return a && b ? Math.abs(b[0] - a[0]) : 1;
}

/**
 * 화면 좌표 `target`이 새 화면 가운데에 오도록 시점을 옮긴다.
 * d3-zoom이 계산한 이동량(끌기, 휠·핀치 확대의 기준점 보정)을 이 함수로 경위도 변화로 바꾼다.
 */
export function recenter(size: Size, projection: GeoProjection, view: View, target: [number, number], k: number): View {
  const center: [number, number] = [size.width / 2, size.height / 2];
  const hit = invertPoint(projection, target);
  if (hit) return clampView({ lon: hit[0], lat: hit[1], k });
  // 세계 타원 밖(배율이 낮을 때 가장자리)이면 경도·위도를 따로 근사한다
  const lon = view.lon + (target[0] - center[0]) / pxPerDegree(projection, view);
  const column = invertPoint(projection, [center[0], target[1]]);
  return clampView({ lon, lat: column ? column[1] : view.lat, k });
}

export function viewsEqual(a: View, b: View): boolean {
  return a.lon === b.lon && a.lat === b.lat && a.k === b.k;
}
