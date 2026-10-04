// 무겁고 서로 독립인 계산 (DESIGN.md §5.3, 2026-10-03): cache.ts의 runCached가 worker_threads(worker.ts)에서 돌리고 결과를 캐시에 둔다.
// 모두 같은 입력에 같은 값을 돌려주는 순수 함수다. 육지는 입력으로 받지 않고 이 파일의 loadLand로 읽는다(빌드·검사 스크립트도 같은 함수를 쓴다).
// 여기 계산을 고치면 cache.ts의 열쇠(이 파일의 해시)가 바뀌어 캐시가 저절로 무효가 된다.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as polyclip from 'polyclip-ts';
import { feature } from 'topojson-client';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { areaKm2, bbox, clipToLand, intersect, toMulti, unwrapAntimeridian, type BBox, type MultiCoords, type PolygonCoords } from './geo.ts';

const require = createRequire(import.meta.url);

export type LandScale = '50m' | '110m';
export interface Land {
  fc: FeatureCollection<Polygon | MultiPolygon>;
  pieces: { coords: PolygonCoords; bbox: BBox }[];
}

/** Natural Earth 육지(world-atlas). 해안선 자르기는 평면 계산이므로 날짜 변경선을 넘는 육지를 펴서 쓴다 (geo.ts의 unwrapAntimeridian). 한 번만 읽는다 */
const lands = new Map<LandScale, Land>();
export function loadLand(scale: LandScale): Land {
  let land = lands.get(scale);
  if (!land) {
    const topo = JSON.parse(readFileSync(require.resolve(`world-atlas/land-${scale}.json`), 'utf8')) as Topology<{ land: GeometryCollection }>;
    const fc = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;
    const pieces = fc.features.flatMap((f) => toMulti(f.geometry)).flatMap(unwrapAntimeridian).map((coords) => ({ coords, bbox: bbox([coords]) }));
    lands.set(scale, (land = { fc, pieces }));
  }
  return land;
}

type Get = (key: string) => unknown;

export const TASKS = {
  /** 해안선 자르기: 도형 g를 육지(scale)와 교차 (geo.ts의 clipToLand) */
  clip: ({ g, land }: { g: string; land: LandScale }, get: Get) => clipToLand(get(g) as MultiCoords, loadLand(land).pieces),
  /** 두 영토가 겹친 넓이(km²) */
  overlap: ({ a, b }: { a: string; b: string }, get: Get) => areaKm2(intersect(get(a) as MultiCoords, get(b) as MultiCoords)),
  /**
   * 빈 땅 검사 한 칸(구역 하나 × 한 해, check-gaps.ts, 2026-10-05): 그해 그 구역에 걸칠 수 있는 영토(active, 파일 순서)를 모두 합쳐,
   * 구역(region, 해안선으로 자르고 minus를 뺀 도형)에서 덮이지 않은 육지 가운데 minKm2보다 큰 조각을 적은 글(name은 글의 머리). 공백이 없으면 null.
   * 2026-10-03~10-04에는 한 해의 모든 영토를 합쳐 모든 구역을 함께 검사했다(gapsYear). 구역과 범위 상자가 떨어진 영토는 구역 안의 공백을 바꾸지 않으므로 빼고 넘긴다
   */
  gapsZone: ({ name, region, active, minKm2 }: { name: string; region: string; active: string[]; minKm2: number }, get: Get): string | null => {
    const covered = active.length ? (polyclip.union(...(active.map(get) as [polyclip.Geom])) as MultiCoords) : [];
    const gaps = (polyclip.difference(get(region) as polyclip.Geom, covered as polyclip.Geom) as MultiCoords)
      .map((p) => ({ area: areaKm2([p]), box: bbox([p]) }))
      .filter((g) => g.area > minKm2)
      .sort((a, b) => b.area - a.area);
    if (!gaps.length) return null;
    const total = gaps.reduce((s, g) => s + g.area, 0);
    return `${name} ${Math.round(total).toLocaleString()}km² ` + gaps.slice(0, 3).map((g) => `[${Math.round(g.area).toLocaleString()}km² ${g.box.map((v) => v.toFixed(1)).join(',')}]`).join(' ');
  },
};
export type TaskName = keyof typeof TASKS;
