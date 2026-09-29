// 영토 공백 검사 (DESIGN.md §5.4): 연도마다 한반도·만주·몽골 초원·알라산·칭하이 북부에서 어느 나라에도 속하지 않은 육지를 찾는다.
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
// 몽골 초원: 동돌궐 영역(생성기의 EASTERN_TURKS)에서 만주 검사 범위를 뺀 곳
const STEPPE_RING = [[118.5, 41.5], [116.0, 41.2], [113.5, 41.0], [111.0, 41.0], [108.5, 41.3], [106.5, 40.5], [104.5, 39.0], [101.0, 42.5], [100.1, 42.67], [99.47, 42.57], [98.25, 42.68], [97.2, 42.79], [96.4, 42.72], [95.86, 43.28], [95.47, 43.99], [95.05, 44.26], [93.66, 44.9], [92.9, 45.02], [91.2, 45.15], [90.67, 45.6], [90.9, 45.95], [90.95, 46.75], [90.3, 47.65], [89.6, 47.92], [88.8, 48.12], [88.2, 48.5], [87.5, 49.2], [90.0, 50.0], [95.0, 51.0], [102.0, 51.5], [108.0, 50.5], [114.0, 50.2], [116.7, 49.85], [117.8, 47.9], [119.0, 47.0], [120.0, 44.0], [118.5, 41.5]];
const steppe = polyclip.difference(clipToLand([[STEPPE_RING]], land) as polyclip.Geom, manchuria as polyclip.Geom) as MultiCoords;
// 알라산·칭하이 북부 (2026-09-29): 생성기의 ALXA(중국 북쪽 경계·허시 회랑·신장 동쪽 경계·몽골 국경 사이)와
// QH_N(허시 회랑 남쪽·티베트 북쪽·신장 동쪽 경계 사이). 알라산은 기원전 318년 전, 칭하이 북부는 328년까지·843~1226년·1368~1508년에 비어 있는 것이 의도한 것
const ALXA_RING = [[104.5, 39.0], [102.5, 38.0], [100.0, 39.2], [98.0, 40.1], [95.0, 40.6], [93.0, 41.0], [94.5, 41.3], [95.3, 41.8], [96.4, 42.72], [97.2, 42.79], [98.25, 42.68], [99.47, 42.57], [100.1, 42.67], [101.0, 42.5], [104.5, 39.0]];
const QH_N_RING = [[93.0, 39.5], [98.0, 38.5], [101.5, 36.8], [102.5, 35.5], [98.5, 36.5], [95.0, 36.5], [90.0, 36.5], [89.6, 36.476], [89.6, 37.3], [89.8, 38.0], [90.8, 38.7], [92.0, 39.2], [93.0, 39.5]];
const alxaQinghai = clipToLand([[ALXA_RING], [QH_N_RING]], land);
const regions: [string, MultiCoords][] = [['한반도', korea], ['만주', manchuria], ['몽골', steppe], ['알라산·칭하이', alxaQinghai]];

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
