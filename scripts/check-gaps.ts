// 영토 공백 검사 (DESIGN.md §5.4): 연도마다 검사 구역에서 어느 나라에도 속하지 않은 육지를 찾는다.
// 검사 구역은 권역 파일(scripts/geo/areas/<권역>.mjs)이 내보내는 gapZones를 권역 목록(scripts/geo/area-list.mjs의 AREAS) 순서대로 모은 것이다
// (지금은 korea의 한반도, inner-asia의 만주·몽골·알라산·칭하이, europe의 유럽 1789~1945). 새 권역은 AREAS에 등록하고 gapZones만 내보내면 이 파일을 고치지 않아도 여기 들어가고, 구역 이름·순서가 곧 출력의 이름·순서다.
// AREAS에 등록하지 않은 권역 파일은 여기서 보지 못한다(npm run gen:geo와 check:generator가 등록 누락으로 멈춘다).
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
import { AREAS } from './geo/area-list.mjs';
import { collectGapZones } from './geo/engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const MIN_KM2 = Number(process.argv[2] ?? 500);

const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = (feature(topo, topo.objects.land) as unknown as FeatureCollection).features
  .flatMap((f) => toMulti(f.geometry as never))
  .flatMap(unwrapAntimeridian)
  .map((coords) => ({ coords, bbox: bbox([coords]) }));

// 검사 범위: 구역마다 해안선으로 자르고, minus에 적은 앞 구역(자르고 뺀 결과)을 뺀다 (예: 만주는 상자에서 한반도를, 몽골은 동돌궐 영역에서 만주를 뺀 곳)
const zones = collectGapZones(AREAS);
if (!zones.length) throw new Error('빈 땅 검사 구역이 없음 (권역 파일의 gapZones)');
// 구역마다 검사하는 해 [from, to) (2026-10-01): 없으면 모든 해. 그 밖의 해에는 그 구역을 보고하지 않는다
const inYears = (name: string, year: number) => {
  const z = zones.find((x) => x.name === name)!;
  return (z.from === null || z.from <= year) && (z.to === null || year < z.to);
};
const regions: [string, MultiCoords][] = [];
for (const { name, zone, minus } of zones) {
  const clipped = clipToLand(zone, land);
  const earlier = minus.map((m) => regions.find(([n]) => n === m)![1] as polyclip.Geom);
  regions.push([name, earlier.length ? (polyclip.difference(clipped as polyclip.Geom, ...earlier) as MultiCoords) : clipped]);
}

interface T { entityId: string; from: number; to: number | null; coords: MultiCoords }
const territories: T[] = [];
for (const f of readdirSync(path.join(ROOT, 'data/geo')).filter((f) => f.endsWith('.geojson'))) {
  const fc = JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as FeatureCollection;
  for (const ft of fc.features) {
    if (ft.geometry.type === 'GeometryCollection') continue;
    territories.push({ ...(ft.properties as Omit<T, 'coords'>), coords: toMulti(ft.geometry as never) });
  }
}

const years = [...new Set([-2332, ...territories.flatMap((t) => [t.from, ...(t.to !== null ? [t.to] : [])]), ...zones.flatMap((z) => (z.from !== null ? [z.from] : []))])]
  .filter((y) => y >= -2332 && y <= new Date().getFullYear())
  .sort((a, b) => a - b);

for (const year of years) {
  const active = territories.filter((t) => t.from <= year && (t.to === null || year < t.to));
  const covered = active.length ? (polyclip.union(...(active.map((t) => t.coords) as [polyclip.Geom])) as MultiCoords) : [];
  const parts = regions.filter(([name]) => inYears(name, year)).flatMap(([name, region]) => {
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
