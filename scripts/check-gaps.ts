// 영토 공백 검사 (DESIGN.md §5.4): 연도마다 한반도와 만주에서 어느 나라에도 속하지 않은 육지를 찾는다.
// 사용: npm run check:gaps [-- 최소넓이km²] (기본 500)
// 공백이 모두 오류는 아니다. 기록이 없는 시기(고조선 이전 남부 등)나 한국사와 관계없는 초원은 비워 둔다.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import * as polyclip from 'polyclip-ts';
import { areaKm2, bbox, clipToLand, toMulti, unwrapAntimeridian, type MultiCoords } from './build-data/geo.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const MIN_KM2 = Number(process.argv[2] ?? 500);

const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = (feature(topo, topo.objects.land) as unknown as FeatureCollection).features
  .flatMap((f) => toMulti(f.geometry as never))
  .flatMap(unwrapAntimeridian)
  .map((coords) => ({ coords, bbox: bbox([coords]) }));

// 압록강·두만강 이남 한반도 (제주 포함, 쓰시마 제외)
const KOREA_RING = [[123.6, 39.5], [124.4, 40.0], [125.3, 40.6], [126.0, 41.0], [126.8, 41.6], [128.2, 41.5], [128.9, 42.05], [129.7, 42.45], [130.0, 42.9], [130.4, 42.6], [130.7, 42.3], [131.0, 42.1], [131.5, 41.0], [130.6, 37.5], [129.9, 35.6], [129.2, 34.95], [128.6, 34.5], [127.5, 33.0], [126.0, 33.0], [124.5, 34.5], [123.5, 37.5], [123.2, 39.0], [123.6, 39.5]];
const korea = clipToLand([[KOREA_RING]], land);
// 만주: 요서·요동 ~ 흑룡강 이남 (한반도 제외)
const manchuria = polyclip.difference(clipToLand([[[[119, 38.5], [135, 38.5], [135, 48.5], [119, 48.5], [119, 38.5]]]], land) as polyclip.Geom, korea as polyclip.Geom) as MultiCoords;
const regions: [string, MultiCoords][] = [['한반도', korea], ['만주', manchuria]];

interface T { entityId: string; from: number; to: number | null; coords: MultiCoords }
const territories: T[] = [];
for (const f of readdirSync(path.join(ROOT, 'data/geo')).filter((f) => f.endsWith('.geojson'))) {
  const fc = JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as FeatureCollection;
  for (const ft of fc.features) {
    if (ft.geometry.type === 'GeometryCollection') continue;
    territories.push({ ...(ft.properties as Omit<T, 'coords'>), coords: toMulti(ft.geometry as never) });
  }
}

const years = [...new Set([-2332, ...territories.flatMap((t) => [t.from, ...(t.to !== null ? [t.to] : [])])])]
  .filter((y) => y >= -2332 && y <= new Date().getFullYear())
  .sort((a, b) => a - b);

for (const year of years) {
  const active = territories.filter((t) => t.from <= year && (t.to === null || year < t.to));
  const covered = active.length ? (polyclip.union(...(active.map((t) => t.coords) as [polyclip.Geom])) as MultiCoords) : [];
  const parts = regions.flatMap(([name, region]) => {
    const gaps = (polyclip.difference(region as polyclip.Geom, covered as polyclip.Geom) as MultiCoords)
      .map((p) => ({ area: areaKm2([p]), box: bbox([p]) }))
      .filter((g) => g.area > MIN_KM2)
      .sort((a, b) => b.area - a.area);
    if (!gaps.length) return [];
    const total = gaps.reduce((s, g) => s + g.area, 0);
    return [`${name} ${Math.round(total).toLocaleString()}km² ` + gaps.slice(0, 3).map((g) => `[${Math.round(g.area).toLocaleString()}km² ${g.box.map((v) => v.toFixed(1)).join(',')}]`).join(' ')];
  });
  const label = year <= 0 ? `기원전 ${1 - year}` : String(year);
  console.log(`${label}: ${parts.join(' | ') || '공백 없음'}`);
}
