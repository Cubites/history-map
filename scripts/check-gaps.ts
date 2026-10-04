// 영토 공백 검사 (DESIGN.md §5.4): 연도마다 검사 구역에서 어느 나라에도 속하지 않은 육지를 찾는다.
// 검사 구역은 권역 파일(scripts/geo/areas/<권역>.mjs)이 내보내는 gapZones를 권역 목록(scripts/geo/area-list.mjs의 AREAS) 순서대로 모은 것이다
// (지금은 korea의 한반도, inner-asia의 만주·몽골·알라산·칭하이, europe의 유럽 1789~지금). 새 권역은 AREAS에 등록하고 gapZones만 내보내면 이 파일을 고치지 않아도 여기 들어가고, 구역 이름·순서가 곧 출력의 이름·순서다.
// AREAS에 등록하지 않은 권역 파일은 여기서 보지 못한다(npm run gen:geo와 check:generator가 등록 누락으로 멈춘다).
// 사용: npm run check:gaps [-- 최소넓이km²] (기본 500)
// 공백이 모두 오류는 아니다. 기록이 없는 시기(고조선 이전 남부 등)나 한국사와 관계없는 초원은 비워 둔다.
// 계산 (2026-10-03, 2026-10-05 칸 단위로 나눔): 구역 자르기와 검사는 build-data/tasks.ts의 clip·gapsZone을 worker들에 나눠 하고 결과를 캐시에 둔다(build-data/cache.ts).
// 검사는 (구역, 해) 칸마다 한다. 칸의 입력은 구역 이름, 구역 도형(해안선으로 자르고 minus를 뺀 것)의 내용 해시, 그해 그 구역과 범위 상자가 겹치는 영토(파일 순서)의 내용 해시,
// 최소 넓이이고, 캐시 열쇠에는 여기에 계산 코드 판(cache.ts의 CODE_SALT: tasks.ts 등 원문, polyclip-ts·bignumber.js·splaytree-ts·world-atlas 판과 파일 해시, Node 판, 로캘)과 이 파일 원문이 더해진다.
// 그래서 나라 하나를 고치면 그 나라가 걸친 구역의 그 나라가 있는 해만 다시 계산하고, 한 구역에서 걸친 영토가 같은 해들은 한 번만 계산한다.
// 구역과 범위 상자가 떨어진 영토는 구역 안을 덮지 못하므로 빼도 공백이 같다(한 해의 모든 영토를 합치던 2026-10-04까지와 출력이 바이트 단위로 같음을 확인함).
// 출력은 연도 순서, 한 해 안에서는 구역 순서다. stderr에 칸 수와 캐시에서 읽은 수를 한 줄 적는다. 환경 변수 HISTORY_MAP_CACHE=0이면 계산 캐시(.cache/build-data)를 쓰지 않는다(권역 파일을 불러올 때의 생성기 연산 메모 .cache/geo-ops는 이 변수를 보지 않는다).
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeatureCollection } from 'geojson';
import * as polyclip from 'polyclip-ts';
import { bbox, bboxIntersects, toMulti, type MultiCoords } from './build-data/geo.ts';
import { hashOf, keyOf, runCached, type Job, type RunStats } from './build-data/cache.ts';
import { AREAS } from './geo/area-list.mjs';
import { collectGapZones } from './geo/engine.mjs';

const HERE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(HERE), '..');
const MIN_KM2 = Number(process.argv[2] ?? 500);
// NaN·±Infinity는 캐시 열쇠(JSON)에서 모두 null이 되어 서로 구별되지 않으므로 받지 않는다
if (!Number.isFinite(MIN_KM2)) throw new Error(`최소 넓이(km²)는 유한한 수여야 함: ${process.argv[2]}`);

// 검사 범위: 구역마다 해안선으로 자르고, minus에 적은 앞 구역(자르고 뺀 결과)을 뺀다 (예: 만주는 상자에서 한반도를, 몽골은 동돌궐 영역에서 만주를 뺀 곳)
const zones = collectGapZones(AREAS);
if (!zones.length) throw new Error('빈 땅 검사 구역이 없음 (권역 파일의 gapZones)');
// 구역마다 검사하는 해 [from, to) (2026-10-01): 없으면 모든 해. 그 밖의 해에는 그 구역을 보고하지 않는다
const inYears = (z: (typeof zones)[number], year: number) => (z.from === null || z.from <= year) && (z.to === null || year < z.to);
const stats: RunStats = { hits: 0, computed: 0 };
const clippedZones = await runCached<MultiCoords>('clip', zones.map(({ zone }) => ({ args: { g: keyOf(zone), land: '50m' }, geoms: new Map([[keyOf(zone), zone]]) })), '', stats);
const regions: [string, MultiCoords][] = [];
for (const [i, { name, minus }] of zones.entries()) {
  const clipped = clippedZones[i];
  const earlier = minus.map((m) => regions.find(([n]) => n === m)![1] as polyclip.Geom);
  regions.push([name, earlier.length ? (polyclip.difference(clipped as polyclip.Geom, ...earlier) as MultiCoords) : clipped]);
}
const regionBoxes = regions.map(([, r]) => bbox(r));

interface T { entityId: string; from: number; to: number | null; coords: MultiCoords }
const territories: T[] = [];
for (const f of readdirSync(path.join(ROOT, 'data/geo')).filter((f) => f.endsWith('.geojson'))) {
  const fc = JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as FeatureCollection;
  for (const ft of fc.features) {
    if (ft.geometry.type === 'GeometryCollection') continue;
    territories.push({ ...(ft.properties as Omit<T, 'coords'>), coords: toMulti(ft.geometry as never) });
  }
}
// 구역마다 범위 상자가 겹치는 영토(파일 순서). 변이나 꼭짓점만 닿아도 겹친 것으로 본다(geo.ts의 bboxIntersects)
const nearZone = regionBoxes.map((zb) => territories.filter((t) => bboxIntersects(bbox(t.coords), zb)));

const years = [...new Set([-2332, ...territories.flatMap((t) => [t.from, ...(t.to !== null ? [t.to] : [])]), ...zones.flatMap((z) => (z.from !== null ? [z.from] : []))])]
  .filter((y) => y >= -2332 && y <= new Date().getFullYear())
  .sort((a, b) => a - b);

// (구역, 해) 칸마다: 그해 그 구역에 걸친 영토를 모두 합쳐 덮이지 않은 육지를 찾는다 (tasks.ts의 gapsZone). 검사하지 않는 해의 구역은 계산하지 않는다.
// 입력이 같은 칸(걸친 영토가 바뀌지 않은 해들)은 계산 하나를 함께 쓴다
const jobs = new Map<string, Job>();
const cells = years.map((year) =>
  zones.flatMap((z, zi) => {
    if (!inYears(z, year)) return [];
    const [name, region] = regions[zi];
    const active = nearZone[zi].filter((t) => t.from <= year && (t.to === null || year < t.to));
    const args = { name, region: keyOf(region), active: active.map((t) => keyOf(t.coords)), minKm2: MIN_KM2 };
    const id = JSON.stringify(args);
    if (!jobs.has(id)) jobs.set(id, { args, geoms: new Map<string, unknown>([[keyOf(region), region], ...active.map((t): [string, unknown] => [keyOf(t.coords), t.coords])]) });
    return [id];
  }),
);
const ids = [...jobs.keys()];
// 열쇠에 이 파일 원문도 넣는다(칸의 입력을 정하는 코드가 바뀌면 다시 계산)
const done = await runCached<string | null>('gapsZone', [...jobs.values()], hashOf(readFileSync(HERE)), stats);
const partOf = new Map(ids.map((id, i) => [id, done[i]]));
years.forEach((year, i) => {
  const parts = cells[i].map((id) => partOf.get(id)).filter((p): p is string => p !== null && p !== undefined);
  const label = year <= 0 ? `기원전 ${1 - year}` : String(year);
  console.log(`${label}: ${parts.join(' | ') || '공백 없음'}`);
});
const cellCount = cells.reduce((s, c) => s + c.length, 0);
console.error(`빈 땅 검사: ${years.length}개 해, 구역·해 칸 ${cellCount}개(서로 다른 계산 ${jobs.size}개), 계산 ${stats.computed}개, 캐시에서 읽음 ${stats.hits}개 (구역 자르기 포함)`);
