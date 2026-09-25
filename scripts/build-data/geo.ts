// 빌드용 지오 처리 도우미 (DESIGN.md §5.3 ③)
import * as polyclip from 'polyclip-ts';
import polylabel from 'polylabel';
import type { MultiPolygon, Polygon, Position } from 'geojson';
import type { LonLat } from '../../src/schema/index.ts';

export type Ring = Position[];
export type PolygonCoords = Ring[];
export type MultiCoords = PolygonCoords[];
export type BBox = [west: number, south: number, east: number, north: number];

export function toMulti(geometry: Polygon | MultiPolygon): MultiCoords {
  return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
}

export function bbox(coords: MultiCoords): BBox {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const polygon of coords)
    for (const [x, y] of polygon[0]) {
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    }
  return [w, s, e, n];
}

export function bboxIntersects(a: BBox, b: BBox): boolean {
  return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

/** 경위도 평면에서의 부호 있는 면적 (반시계 방향이면 양수) */
function signedArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return sum / 2;
}

/** 대략적인 면적(km²). 겹침 검사와 가장 큰 조각 고르기에만 쓴다. */
export function areaKm2(coords: MultiCoords): number {
  const KM_PER_DEG = 111.32;
  let total = 0;
  for (const polygon of coords) {
    const lat = polygon[0].reduce((s, p) => s + p[1], 0) / polygon[0].length;
    const scale = KM_PER_DEG * KM_PER_DEG * Math.cos((lat * Math.PI) / 180);
    polygon.forEach((ring, i) => {
      const a = Math.abs(signedArea(ring)) * scale;
      total += i === 0 ? a : -a;
    });
  }
  return total;
}

/**
 * d3-geo는 구면에서 바깥 고리가 시계 방향이어야 한다 (RFC 7946과 반대).
 * 반대로 감긴 폴리곤은 지구 전체를 칠하므로 출력 직전에 방향을 맞춘다.
 */
export function rewindForD3(coords: MultiCoords): MultiCoords {
  return coords.map((polygon) =>
    polygon.map((ring, i) => {
      const clockwise = signedArea(ring) < 0;
      const wantClockwise = i === 0;
      return clockwise === wantClockwise ? ring : [...ring].reverse();
    }),
  );
}

export function intersect(a: MultiCoords, b: MultiCoords): MultiCoords {
  return polyclip.intersection(a as polyclip.Geom, b as polyclip.Geom) as MultiCoords;
}

/** 해안선 클리핑: 영토 폴리곤과 bbox가 겹치는 육지 조각만 골라 교차시킨다. */
export function clipToLand(territory: MultiCoords, land: { coords: PolygonCoords; bbox: BBox }[]): MultiCoords {
  const box = bbox(territory);
  const nearby = land.filter((l) => bboxIntersects(box, l.bbox)).map((l) => l.coords);
  if (nearby.length === 0) return [];
  return intersect(territory, nearby);
}

/** 화살표·이름표 기준점: 가장 큰 조각의 내부에서 경계로부터 가장 먼 점 */
export function anchorPoint(coords: MultiCoords): LonLat {
  const largest = coords.reduce((best, p) => (areaKm2([p]) > areaKm2([best]) ? p : best));
  const [x, y] = polylabel(largest as [number, number][][], 0.01);
  return [round(x, 3), round(y, 3)];
}

export function roundCoords(coords: MultiCoords, digits = 4): MultiCoords {
  return coords.map((polygon) => polygon.map((ring) => ring.map(([x, y]) => [round(x, digits), round(y, digits)])));
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}
