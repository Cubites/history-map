import { geoEqualEarth, type GeoProjection } from 'd3-geo';
import { zoomIdentity, type ZoomTransform } from 'd3-zoom';

export type Size = { width: number; height: number };
export type LonLatBounds = [[west: number, south: number], [east: number, north: number]];

/** 초기 시점 (DESIGN.md D5: 동아시아) */
export const EAST_ASIA: LonLatBounds = [[73, 15], [150, 56]];

const PADDING = 16;

/** 세계 전체가 화면에 들어오는 Equal Earth 투영 */
export function createProjection({ width, height }: Size): GeoProjection {
  return geoEqualEarth().fitExtent(
    [[PADDING, PADDING], [width - PADDING, height - PADDING]],
    { type: 'Sphere' },
  );
}

/** 경위도 범위가 화면에 꽉 차도록 하는 줌 변환 */
export function transformForBounds(
  projection: GeoProjection,
  { width, height }: Size,
  [[west, south], [east, north]]: LonLatBounds,
  maxScale: number,
): ZoomTransform {
  // Equal Earth는 위선이 곧지만 경선이 휘므로, 모서리와 윗변 중앙을 모두 넣어 범위를 잡는다.
  const points: [number, number][] = [
    [west, south], [west, north], [east, south], [east, north], [(west + east) / 2, north],
  ];
  const projected = points.map((p) => projection(p)!);
  const xs = projected.map((p) => p[0]);
  const ys = projected.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(maxScale, 0.95 * Math.min(width / (x1 - x0), height / (y1 - y0)));
  return zoomIdentity
    .translate(width / 2, height / 2)
    .scale(k)
    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
}
