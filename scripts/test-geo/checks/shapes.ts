// test:geo 검사 c. 도형 품질 (설계 3.3c): 빈 땅(gaps)·겹침(overlap)·가는 띠(strips)·넓이 0(zero)·사라진 섬(islands)·생성 일치(gen), 여섯 검사를 내보낸다.
// 사용: npm run test:geo -- --only shapes [--region europe|east-asia|<나라 파일 이름>] [--years 1500-1600] [--skip islands] [--ci]
//  (gen은 국경 생성기와 전쟁 생성기를 임시 폴더에 돌려 data/geo·data/wars와 바이트 비교하므로 --ci이거나 --only gen일 때만 한다. 전쟁 쪽은 입력 해시가 지난 성공과 같으면 건너뜀.) 모든 검사는 --region·--years를 따른다.
//
// - gaps 빈 땅: check:gaps(scripts/check-gaps.ts)와 같은 (구역, 해) 칸·같은 캐시 열쇠로 계산해(그 파일 원문이 열쇠에 들어가므로 이 파일은 check-gaps.ts를 읽어 해시만 넘긴다) 두 명령이 캐시를 공유한다.
//   옛 빚은 data/tests/baseline/gaps.txt(줄마다 `<구역> <해>` TAB `<총넓이 km²>` TAB `<큰 조각 상자 최대 3개, ';'로 이음>`)에 두고, 아래 셋 가운데 하나면 실패한다: ① 기준선에 없는 칸 ② 총넓이가 기준선보다 500km² 넘게 늘어남(고정 여유, 비율 아님)
//   ③ 큰 조각 3개 가운데 기준선에 없는 상자가 나타남(조각이 500km² 넘음. 같은 칸에서 옛 빈 땅이 줄고 다른 곳에 새로 생겨 총넓이가 그대로인 경우를 잡음. 옛 조각이 줄어 4번째가 3위로 올라와도 걸리니, 고친 뒤라면 --update-baseline gaps). 줄어든 칸은 '개선'으로 센다.
//   --years를 좁혀도 범위 시작 해에 이미 효력이 있는 상태(그 전의 가장 늦은 바뀌는 해 칸)를 함께 본다.
//   기준선과 비교는 이 검사가 직접 하므로 항목은 새 실패만 낸다(러너의 기준선 대조에 의존하지 않음). 기준선 만들기: `npm run test:geo -- --only gaps --update-baseline gaps`(러너가 이 파일의 baselineText를 불러 씀. --region·--years와는 함께 못 씀).
// - overlap 겹침: build-data/index.ts의 checkOverlaps와 같은 쌍·같은 'overlap' 캐시. 5km² 초과는 실패(check:data와 같음), 0.5~5km²는 경고.
// - strips 가는 띠: 해안선으로 자른 조각 가운데 폭(≈2×넓이/둘레) 1km 미만이고 넓이 2km² 초과인 것. 같은 조각이 여러 버전에 되풀이되면 한 줄로 묶는다. 열쇠 `띠 @경도,위도 <넓이>km²`.
// - zero 넓이 0: data/geo 원자료 조각의 넓이가 0.01km² 미만이거나 고리 점이 4개 미만. 열쇠 `영 <id>@<from> @경도,위도`.
// - islands 사라진 섬: land-50m 섬(5~30,000km²)의 안쪽 점이 어떤 영토에 덮이다가 어느 해 아무 영토에도 덮이지 않게 된 때. 열쇠 `섬 <해> @경도,위도`.
//   strips·zero·islands는 옛 빚이 많아 러너의 기준선(data/tests/baseline/<검사 id>.txt, 줄마다 열쇠)을 쓰고, 의도한 것은 data/tests/allow/shapes.yaml에 이유와 함께 옮긴다.
// 계산은 build-data의 runCached(worker들에 나눔, HISTORY_MAP_WORKERS로 개수 조절)와 캐시를 쓴다. cache.ts·tasks.ts·geo.ts·check-gaps.ts는 고치지 않는다(캐시 열쇠가 그 원문을 담음).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import polylabel from 'polylabel';
import * as polyclip from 'polyclip-ts';
import { parse as parseYaml } from 'yaml';
import { REGION_FILTER_OF } from '../../../src/schema/regions.ts';
import { hashOf, keyOf, runCached, type Job, type RunStats } from '../../build-data/cache.ts';
import { areaKm2, bbox, bboxIntersects, roundCoords, toMulti, type BBox, type MultiCoords } from '../../build-data/geo.ts';
import { loadLand } from '../../build-data/tasks.ts';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const THIS_YEAR = new Date().getFullYear();
/** index.ts의 RANGE 시작: 고조선 건국 */
const RANGE_START = -2332;
const OVERLAP_FAIL_KM2 = 5;
const OVERLAP_WARN_KM2 = 0.5;
const GAP_MIN_KM2 = 500;
/** 기준선보다 총넓이가 이만큼 넘게 늘면 실패 (고정값: 큰 칸에서 비율 여유가 새 구멍을 가리던 문제를 없앰) */
const GAP_GROW_KM2 = 500;
const STRIP_WIDTH_KM = 1;
const STRIP_MIN_KM2 = 2;
const ZERO_KM2 = 0.01;
const ISLAND_KM2: [number, number] = [5, 30000];

// ── 공통 읽기 ───────────────────────────────────────────────

/** --region 값이 이 파일 이름(권역)을 고르는가: 파일 이름과 같거나 화면 권역 필터(east-asia·europe)에 속함 */
function regionOk(region: string | null, name: string): boolean {
  return region === null || name === region || REGION_FILTER_OF[name] === region;
}
const yearsOverlap = (opt: Options, from: number, to: number | null) => !opt.years || (from <= opt.years[1] && (to === null || to > opt.years[0]));
const inYears = (opt: Options, y: number) => !opt.years || (y >= opt.years[0] && y <= opt.years[1]);

/** 나라 id → data/entities 파일 이름(권역) */
let regionOfEntity: Map<string, string> | null = null;
function entityRegions(): Map<string, string> {
  if (!regionOfEntity) {
    regionOfEntity = new Map();
    for (const f of readdirSync(path.join(ROOT, 'data/entities')).filter((f) => f.endsWith('.yaml')))
      for (const e of (parseYaml(readFileSync(path.join(ROOT, 'data/entities', f), 'utf8')) as { id: string }[]) ?? []) regionOfEntity.set(e.id, f.replace(/\.yaml$/, ''));
  }
  return regionOfEntity;
}

/** data/geo의 영토 버전 하나 (원자료) */
interface Terr {
  id: string;
  from: number;
  to: number | null;
  coords: MultiCoords;
  where: string;
  /** 나라 파일 이름(권역). 모르면 '' */
  region: string;
}
let terrs: Terr[] | null = null;
function loadTerritories(): Terr[] {
  if (terrs) return terrs;
  terrs = [];
  const regions = entityRegions();
  for (const f of readdirSync(path.join(ROOT, 'data/geo')).filter((f) => f.endsWith('.geojson')).sort()) {
    const fc = JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as { features: { properties: { entityId: string; from: number; to: number | null }; geometry: { type: string } }[] };
    fc.features.forEach((ft, i) => {
      if (ft.geometry.type !== 'Polygon' && ft.geometry.type !== 'MultiPolygon') return;
      const p = ft.properties;
      terrs!.push({ id: p.entityId, from: p.from, to: p.to ?? null, coords: toMulti(ft.geometry as never), where: `data/geo/${f} [${i}]`, region: regions.get(p.entityId) ?? '' });
    });
  }
  return terrs;
}
const selected = (opt: Options) => loadTerritories().filter((t) => regionOk(opt.region, t.region) && yearsOverlap(opt, t.from, t.to));

/** 해안선(1:50m)으로 자른 영토 (check:data의 clipAll과 같은 계산·같은 캐시, 4자리로 반올림) */
interface Clipped extends Terr {
  key: string;
  clipped: MultiCoords;
  box: BBox;
}
let clippedP: Promise<Clipped[]> | null = null;
let clipStats: RunStats = { hits: 0, computed: 0 };
function clippedAll(): Promise<Clipped[]> {
  clippedP ??= (async () => {
    const all = loadTerritories();
    const results = await runCached<MultiCoords>('clip', all.map((t) => ({ args: { g: keyOf(t.coords), land: '50m' }, geoms: new Map([[keyOf(t.coords), t.coords]]) })), '', clipStats);
    return all.flatMap((t, i) => {
      const clipped = roundCoords(results[i]);
      return clipped.length === 0 ? [] : [{ ...t, key: `${t.id}@${t.from}`, clipped, box: bbox(clipped) }];
    });
  })();
  return clippedP;
}
const selectedClipped = async (opt: Options) => (await clippedAll()).filter((t) => regionOk(opt.region, t.region) && yearsOverlap(opt, t.from, t.to));

const pt2 = (p: number[]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ── gaps ────────────────────────────────────────────────────

interface GapCell { zone: string; year: number; total: number; text: string }
let lastGaps: { cells: GapCell[]; filtered: boolean } | null = null;
const GAPS_BASELINE = path.join(ROOT, 'data/tests/baseline/gaps.txt');
const yearLabel = (y: number) => (y <= 0 ? `기원전 ${1 - y}` : String(y));

/** 칸 글에서 큰 조각들: "[12,345km² 127.5,35.5,128.0,35.9]" → 넓이와 상자 글 */
const piecesOf = (text: string) => [...text.matchAll(/\[([\d,]+)km² ([-\d.,]+)\]/g)].map((m) => ({ km2: Number(m[1].replaceAll(',', '')), box: m[2] }));

interface GapBase {
  total: number;
  /** 기준선의 큰 조각 상자들. 옛 꼴(3번째 칸 없음)이면 null */
  boxes: Set<string> | null;
}
function readGapBaseline(): Map<string, GapBase> {
  const m = new Map<string, GapBase>();
  if (existsSync(GAPS_BASELINE))
    for (const line of readFileSync(GAPS_BASELINE, 'utf8').split(/\r?\n/)) {
      if (!line.trim() || line.startsWith('#')) continue;
      const [k, v, b] = line.split('\t');
      m.set(k, { total: Number(v ?? 0), boxes: b === undefined ? null : new Set(b.split(';').filter(Boolean)) });
    }
  return m;
}

async function runGaps(_ctx: Context, opt: Options): Promise<CheckResult> {
  const { AREAS } = await import('../../geo/area-list.mjs');
  const { collectGapZones } = await import('../../geo/engine.mjs');
  const zones = collectGapZones(AREAS);
  const stats: RunStats = { hits: 0, computed: 0 };
  // check-gaps.ts와 같은 순서·같은 인자: 구역 자르기 → minus를 뺀 구역 → 구역마다 범위 상자가 겹치는 영토(파일 순서) → 해 목록 → 칸
  const clippedZones = await runCached<MultiCoords>('clip', zones.map(({ zone }) => ({ args: { g: keyOf(zone), land: '50m' }, geoms: new Map([[keyOf(zone), zone]]) })), '', stats);
  const regions: [string, MultiCoords][] = [];
  for (const [i, { name, minus }] of zones.entries()) {
    const earlier = minus.map((m) => regions.find(([n]) => n === m)![1] as polyclip.Geom);
    regions.push([name, earlier.length ? (polyclip.difference(clippedZones[i] as polyclip.Geom, ...earlier) as MultiCoords) : clippedZones[i]]);
  }
  const regionBoxes = regions.map(([, r]) => bbox(r));
  const all = loadTerritories();
  const boxes = new Map(all.map((t) => [t, bbox(t.coords)] as const));
  const nearZone = regionBoxes.map((zb) => all.filter((t) => bboxIntersects(boxes.get(t)!, zb)));
  const years = [...new Set([RANGE_START, ...all.flatMap((t) => [t.from, ...(t.to !== null ? [t.to] : [])]), ...zones.flatMap((z) => (z.from !== null ? [z.from] : []))])]
    .filter((y) => y >= RANGE_START && y <= THIS_YEAR)
    .sort((a, b) => a - b);
  // --years로 좁혀도, 범위 시작에 이미 효력이 있는 상태는 그 전의 가장 늦은 바뀌는 해 칸이 나타낸다
  const lead = opt.years ? years.filter((y) => y <= opt.years![0]).at(-1) : undefined;
  const wanted = (y: number) => inYears(opt, y) || y === lead;
  const inZoneYears = (z: (typeof zones)[number], year: number) => (z.from === null || z.from <= year) && (z.to === null || year < z.to);

  const jobs = new Map<string, Job>();
  const cells: { zone: string; year: number; id: string }[] = [];
  for (const year of years) {
    if (!wanted(year)) continue;
    zones.forEach((z, zi) => {
      if (!inZoneYears(z, year) || !regionOk(opt.region, z.area)) return;
      const [name, region] = regions[zi];
      const active = nearZone[zi].filter((t) => t.from <= year && (t.to === null || year < t.to));
      const args = { name, region: keyOf(region), active: active.map((t) => keyOf(t.coords)), minKm2: GAP_MIN_KM2 };
      const id = JSON.stringify(args);
      if (!jobs.has(id)) jobs.set(id, { args, geoms: new Map<string, unknown>([[keyOf(region), region], ...active.map((t): [string, unknown] => [keyOf(t.coords), t.coords])]) });
      cells.push({ zone: name, year, id });
    });
  }
  const ids = [...jobs.keys()];
  const done = await runCached<string | null>('gapsZone', [...jobs.values()], hashOf(readFileSync(path.join(ROOT, 'scripts/check-gaps.ts'))), stats);
  const partOf = new Map(ids.map((id, i) => [id, done[i]]));

  const base = readGapBaseline();
  const found: GapCell[] = [];
  const items: Item[] = [];
  let known = 0;
  let better = 0;
  for (const c of cells) {
    const text = partOf.get(c.id);
    if (!text) continue;
    // "구역 12,345km² [..]" — 총넓이는 글의 머리(로캘 숫자, 쉼표 제거)
    const m = text.slice(c.zone.length + 1).match(/^([\d,]+)km²/);
    const total = m ? Number(m[1].replaceAll(',', '')) : NaN;
    const key = `${c.zone} ${c.year}`;
    found.push({ zone: c.zone, year: c.year, total, text });
    const was = base.get(key);
    const label = `${yearLabel(c.year)}년 ${text}`;
    if (was === undefined) items.push({ key, msg: `${label} (기준선에 없는 새 빈 땅)` });
    else if (!(total <= was.total + GAP_GROW_KM2)) items.push({ key: `${key} 늘어남`, msg: `${label} (기준선 ${fmt(was.total)}km²보다 ${fmt(total - was.total)}km² 늘어남)` });
    else {
      // 총넓이는 그대로여도 큰 조각 3개 가운데 기준선에 없는 상자가 있으면 새 빈 땅(옛 것이 줄고 다른 곳에 새로 생긴 경우)
      const fresh = was.boxes ? piecesOf(text).filter((p) => p.km2 > GAP_GROW_KM2 && !was.boxes!.has(p.box)) : [];
      if (fresh.length) items.push({ key: `${key} 새 조각`, msg: `${label} (기준선에 없는 새 조각 ${fresh.map((p) => `${fmt(p.km2)}km² ${p.box}`).join(', ')})` });
      else {
        known++;
        if (total < was.total) better++;
      }
    }
  }
  lastGaps = { cells: found, filtered: opt.region !== null || opt.years !== null };
  const gone = [...base.keys()].filter((k) => {
    const [z, y] = [k.slice(0, k.lastIndexOf(' ')), Number(k.slice(k.lastIndexOf(' ') + 1))];
    return inYears(opt, y) && zones.some((zz) => zz.name === z && regionOk(opt.region, zz.area)) && !found.some((f) => f.zone === z && f.year === y);
  }).length;
  return {
    checked: cells.length,
    items,
    notes: [`칸 ${cells.length}${cells.length === 0 ? ' (범위 안 칸 없음)' : ''}(계산 ${jobs.size}종, 캐시 ${stats.hits}·새로 ${stats.computed})`, `빈 땅 ${found.length}(기준선 안 ${known}${better ? `, 줄어듦 ${better}` : ''})`, ...(gone ? [`기준선에서 사라짐 ${gone}`] : [])],
  };
}

/** 마지막으로 돌린 gaps의 빈 땅 칸들 (시험·보고서용) */
export const lastGapCells = (): { zone: string; year: number; total: number; text: string }[] => lastGaps?.cells ?? [];

/** 마지막으로 돌린 gaps 결과를 기준선 글로 (러너의 --update-baseline이 쓴다). 다른 검사 id는 null → 러너가 항목 열쇠로 쓴다 */
export function baselineText(id: string): string | null {
  if (id !== 'gaps') return null;
  if (!lastGaps) throw new Error('gaps를 먼저 돌려야 기준선 글을 만들 수 있음');
  if (lastGaps.filtered) throw new Error('gaps 기준선은 --region·--years 없이 돌린 결과로만 만든다');
  return lastGaps.cells.map((c) => `${c.zone} ${c.year}\t${c.total}\t${piecesOf(c.text).map((p) => p.box).join(';')}`).sort().join('\n') + '\n';
}

// ── overlap ─────────────────────────────────────────────────

async function runOverlap(_ctx: Context, opt: Options): Promise<CheckResult> {
  const all = await clippedAll();
  // index.ts의 buildIntervals: 지도가 바뀌는 해로 나눈 구간
  const bounds = new Set<number>([RANGE_START, THIS_YEAR + 1]);
  for (const t of all) {
    if (t.from > RANGE_START && t.from <= THIS_YEAR) bounds.add(t.from);
    if (t.to !== null && t.to > RANGE_START && t.to <= THIS_YEAR) bounds.add(t.to);
  }
  const sorted = [...bounds].sort((a, b) => a - b);
  const checkedPairs = new Set<string>();
  const pairs: { a: Clipped; b: Clipped; from: number }[] = [];
  for (let k = 0; k + 1 < sorted.length; k++) {
    const from = sorted[k];
    if (opt.years && !(from <= opt.years[1] && sorted[k + 1] > opt.years[0])) continue;
    const members = all.filter((t) => t.from <= from && (t.to === null || from < t.to));
    for (let i = 0; i < members.length; i++)
      for (let j = i + 1; j < members.length; j++) {
        const [a, b] = [members[i], members[j]];
        const pair = `${a.where}|${b.where}`;
        if (checkedPairs.has(pair) || !bboxIntersects(a.box, b.box)) continue;
        checkedPairs.add(pair);
        if (regionOk(opt.region, a.region) || regionOk(opt.region, b.region)) pairs.push({ a, b, from });
      }
  }
  const stats: RunStats = { hits: 0, computed: 0 };
  const areas = await runCached<number>('overlap', pairs.map(({ a, b }) => ({ args: { a: keyOf(a.clipped), b: keyOf(b.clipped) }, geoms: new Map([[keyOf(a.clipped), a.clipped], [keyOf(b.clipped), b.clipped]]) })), '', stats);
  const items: Item[] = [];
  pairs.forEach(({ a, b, from }, k) => {
    const v = areas[k];
    if (v > OVERLAP_WARN_KM2)
      items.push({ key: `겹침 ${a.key} ${b.key}`, msg: `${from}년: ${a.id}(${a.from}~)와 ${b.id}(${b.from}~)의 영토가 약 ${fmt(v)}km² 겹침`, warn: v <= OVERLAP_FAIL_KM2 });
  });
  return { checked: pairs.length, items, notes: [`쌍 ${pairs.length}(캐시 ${stats.hits}·새로 ${stats.computed})`] };
}

// ── strips ──────────────────────────────────────────────────

const kmPerLon = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180);
function perimeter(ring: number[][]): number {
  let s = 0;
  for (let i = 1; i < ring.length; i++) {
    const lat = (ring[i][1] + ring[i - 1][1]) / 2;
    s += Math.hypot((ring[i][0] - ring[i - 1][0]) * kmPerLon(lat), (ring[i][1] - ring[i - 1][1]) * 110.57);
  }
  return s;
}

async function runStrips(_ctx: Context, opt: Options): Promise<CheckResult> {
  const sel = await selectedClipped(opt);
  // 같은 조각(내용 열쇠)은 여러 버전에 되풀이되므로 한 줄로 묶는다
  const groups = new Map<string, { key: string; km2: number; width: number; at: string; users: string[] }>();
  let pieces = 0;
  for (const t of sel)
    for (const p of t.clipped) {
      const a = areaKm2([p]);
      if (a < 0.5) continue; // 빌드가 0.5km² 미만 조각은 버림(index.ts SLIVER_KM2)
      pieces++;
      const w = (2 * a) / p.reduce((s, r) => s + perimeter(r), 0);
      if (!(w < STRIP_WIDTH_KM && a > STRIP_MIN_KM2)) continue;
      const g = keyOf([p]);
      const e = groups.get(g);
      if (e) e.users.push(t.key);
      else groups.set(g, { key: `띠 @${pt2(p[0][0])} ${Math.round(a)}km²`, km2: a, width: w, at: pt2(p[0][0]), users: [t.key] });
    }
  const items: Item[] = [...groups.values()].map((g) => ({
    key: g.key,
    msg: `가는 띠 @${g.at} 넓이 ${g.km2.toFixed(1)}km² 폭 ${g.width.toFixed(2)}km — ${g.users.length}개 버전(${g.users.slice(0, 3).join(', ')}${g.users.length > 3 ? ' …' : ''})`,
  }));
  return { checked: pieces, items, notes: [`조각 ${pieces.toLocaleString('en-US')}`, `띠 ${[...groups.values()].reduce((s, g) => s + g.users.length, 0)}(서로 다른 것 ${groups.size})`] };
}

// ── zero ────────────────────────────────────────────────────

async function runZero(_ctx: Context, opt: Options): Promise<CheckResult> {
  const sel = selected(opt);
  // 같은 조각(내용 열쇠)이 여러 버전에 되풀이되면 한 줄로 묶는다
  const groups = new Map<string, { key: string; at: string; km2: number; short: boolean; users: string[] }>();
  let pieces = 0;
  let instances = 0;
  for (const t of sel)
    for (const p of t.coords) {
      pieces++;
      const a = areaKm2([p]);
      const short = p.some((r) => r.length < 4);
      if (!(a < ZERO_KM2 || short)) continue;
      instances++;
      const g = keyOf([p]);
      const e = groups.get(g);
      if (e) e.users.push(`${t.id}@${t.from}`);
      else {
        const at = p[0]?.[0] ? pt2(p[0][0]) : '?';
        groups.set(g, { key: `영 @${at} ${a.toFixed(4)}km²`, at, km2: a, short, users: [`${t.id}@${t.from}`] });
      }
    }
  const items = new Map<string, Item>();
  for (const g of groups.values())
    if (!items.has(g.key)) items.set(g.key, { key: g.key, msg: `넓이 0 조각 @${g.at} ${g.km2.toFixed(4)}km²${g.short ? ' (고리 점 4개 미만)' : ''} — ${g.users.length}개 버전(${g.users.slice(0, 3).join(', ')}${g.users.length > 3 ? ' …' : ''})` });
  return { checked: pieces, items: [...items.values()], notes: [`조각 ${pieces.toLocaleString('en-US')}`, `넓이 0 조각 ${instances}(서로 다른 것 ${groups.size})`] };
}

// ── islands ─────────────────────────────────────────────────

const inRing = (p: number[], r: number[][]): boolean => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const inMulti = (p: number[], m: MultiCoords): boolean => m.some((poly) => inRing(p, poly[0]) && !poly.slice(1).some((h) => inRing(p, h)));

async function runIslands(_ctx: Context, opt: Options): Promise<CheckResult> {
  const sel = await selectedClipped(opt);
  const land = loadLand('50m')
    .pieces.map((p) => ({ coords: p.coords, a: areaKm2([p.coords]) }))
    .filter((p) => p.a > ISLAND_KM2[0] && p.a < ISLAND_KM2[1]);
  const items = new Map<string, Item>();
  let covered = 0;
  for (const isl of land) {
    const pt = polylabel(isl.coords as [number, number][][], 0.001) as unknown as number[];
    // 범위 상자가 점을 품은 조각만 정확히 본다
    const cand = sel.filter((t) => t.box[0] <= pt[0] && pt[0] <= t.box[2] && t.box[1] <= pt[1] && pt[1] <= t.box[3] && inMulti(pt, t.clipped));
    if (!cand.length) continue;
    covered++;
    const yrs = [...new Set(cand.flatMap((t) => [t.from, t.to ?? 9999]))].filter((y) => y <= THIS_YEAR).sort((a, b) => a - b);
    let prev: string | null = null;
    for (const y of yrs) {
      const o = cand.filter((t) => t.from <= y && y < (t.to ?? 9999)).map((t) => t.id).join('+') || null;
      if (prev && !o && inYears(opt, y)) {
        const key = `섬 ${y} @${pt2(pt)}`;
        items.set(key, { key, msg: `${y}년 섬 ${fmt(isl.a)}km² @${pt2(pt)}가 어느 영토에도 덮이지 않게 됨 (앞: ${prev})` });
      }
      prev = o;
    }
  }
  return { checked: land.length, items: [...items.values()], notes: [`섬 ${land.length}(영토에 덮인 적 있음 ${covered})`] };
}

// ── gen ─────────────────────────────────────────────────────
// 두 가지를 바이트 비교한다: ① data/geo를 국경 생성기(scripts/generate-geo.mjs)가 만든 것과 ② data/wars의 생성 대상(전쟁 생성기 scripts/wars, npm run gen:wars)을 생성기 결과와.
// ②는 3분 넘게 걸리므로 입력(data/geo·data/wars·data/base/fragments·scripts/wars·scripts/build-data/geo.ts·package-lock.json)의 내용 해시를 .cache/test-geo/wars-gen.json에 두고,
// 지난 성공 때와 같으면 건너뛴다(통과로 치고 notes에 '입력 그대로 — 지난 결과 재사용'). 국경·전쟁 파일·생성기 코드가 바뀐 커밋에서만 돈다. 실패한 실행은 해시를 남기지 않는다.
// (genWars는 전쟁 쪽만 따로 시험·재사용할 수 있게 내보낸다.)

/** 전쟁 생성기가 만드는 data/wars 아래 파일: 맨 위 YAML(머리·europe 전역·overview 전역을 다시 쓰고 손으로 쓴 asia-pacific 전역은 그대로 둠)과 geojson 폴더 넷 */
const WARS_GEN_YAML = ['eu-02-world-war-2.yaml'];
const WARS_GEN_DIRS = ['world-war-1', 'world-war-2/europe', 'world-war-2/asia-pacific', 'world-war-2/overview'];
/** 전쟁 생성이 읽는 입력: 폴더(안의 모든 파일)와 파일 */
const WARS_GEN_INPUT_DIRS = ['data/geo', 'data/wars', 'data/base/fragments', 'scripts/wars'];
const WARS_GEN_INPUT_FILES = ['scripts/build-data/geo.ts', 'package-lock.json'];

function filesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...filesUnder(p));
    else out.push(p);
  }
  return out;
}
/** 전쟁 생성 입력의 내용 해시 (경로와 내용) */
function warsGenInputHash(): string {
  const parts: (string | Uint8Array)[] = [];
  for (const rel of [...WARS_GEN_INPUT_DIRS.flatMap((d) => filesUnder(path.join(ROOT, d)).map((p) => path.relative(ROOT, p))), ...WARS_GEN_INPUT_FILES]) {
    parts.push(rel.split(path.sep).join('/'), readFileSync(path.join(ROOT, rel)));
  }
  return hashOf(...parts);
}

async function genGeo(): Promise<CheckResult> {
  const tmp = mkdtempSync(path.join(tmpdir(), 'test-geo-gen-'));
  try {
    writeFileSync(path.join(tmp, 'package.json'), '{}\n');
    mkdirSync(path.join(tmp, 'data/entities'), { recursive: true });
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/generate-geo.mjs'), tmp], { encoding: 'utf8', cwd: tmp, timeout: 280000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) return { checked: 0, items: [{ key: '생성 실패', msg: `생성기 실행 실패(코드 ${r.status}): ${(r.stderr || String(r.error)).split('\n').find((l) => l.trim()) ?? ''}` }] };
    const mine = path.join(ROOT, 'data/geo');
    const made = path.join(tmp, 'data/geo');
    const want = readdirSync(mine).filter((f) => f.endsWith('.geojson')).sort();
    const got = readdirSync(made).filter((f) => f.endsWith('.geojson')).sort();
    const items: Item[] = [];
    for (const f of want) {
      if (!got.includes(f)) items.push({ key: `생성 없음 ${f}`, msg: `${f}: data/geo에 있지만 생성기가 만들지 않음` });
      else if (!readFileSync(path.join(mine, f)).equals(readFileSync(path.join(made, f)))) items.push({ key: `생성 다름 ${f}`, msg: `${f}: data/geo가 생성기 결과와 다름 (npm run gen:geo를 돌렸는지)` });
    }
    for (const f of got) if (!want.includes(f)) items.push({ key: `생성 더 있음 ${f}`, msg: `${f}: 생성기는 만드는데 data/geo에 없음` });
    return { checked: want.length, items, notes: [`파일 ${want.length}개를 생성기 결과와 바이트 비교`] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export async function genWars(ctx: Context): Promise<CheckResult> {
  const hash = warsGenInputHash();
  const stateFile = path.join(ctx.cacheDir, 'wars-gen.json');
  let last: string | null = null;
  try {
    last = (JSON.parse(readFileSync(stateFile, 'utf8')) as { hash?: string }).hash ?? null;
  } catch {
    // 지난 기록이 없거나 깨졌으면 새로 돌린다
  }
  const listed = (dir: string) => (existsSync(path.join(ROOT, 'data/wars', dir)) ? readdirSync(path.join(ROOT, 'data/wars', dir)).filter((f) => f.endsWith('.geojson')) : []);
  const total = WARS_GEN_YAML.length + WARS_GEN_DIRS.reduce((n, d) => n + listed(d).length, 0);
  if (last === hash) return { checked: total, items: [], notes: [`전쟁 생성: 입력 그대로 — 지난 결과 재사용(파일 ${total}개)`] };

  const tmp = mkdtempSync(path.join(tmpdir(), 'test-geo-gen-wars-'));
  try {
    // 저장소 data/wars는 건드리지 않고 임시 폴더의 data/wars에 쓴다 (--out). 한 번 돌리는 데 3분 안팎(CI는 2~4배)
    const r = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'scripts/wars/index.mjs'), ROOT, '--out', tmp], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) return { checked: 0, items: [{ key: '전쟁 생성 실패', msg: `전쟁 생성기 실행 실패(코드 ${r.status}): ${(r.stderr || String(r.error)).split('\n').find((l) => l.trim()) ?? ''}` }] };
    const items: Item[] = [];
    const compare = (rel: string, mine: string | null, made: string | null) => {
      if (mine === null) items.push({ key: `생성 더 있음 ${rel}`, msg: `${rel}: 전쟁 생성기는 만드는데 data/wars에 없음` });
      else if (made === null) items.push({ key: `생성 없음 ${rel}`, msg: `${rel}: data/wars에 있지만 전쟁 생성기가 만들지 않음 (옛 판이 남았거나 생성기 밖에서 만든 파일)` });
      else if (!readFileSync(mine).equals(readFileSync(made))) items.push({ key: `생성 다름 ${rel}`, msg: `${rel}: 전쟁 생성기 결과와 다름 (npm run gen:wars를 돌렸는지)` });
    };
    const warsDir = path.join(ROOT, 'data/wars');
    const outDir = path.join(tmp, 'data/wars');
    for (const f of WARS_GEN_YAML) compare(`data/wars/${f}`, existsSync(path.join(warsDir, f)) ? path.join(warsDir, f) : null, existsSync(path.join(outDir, f)) ? path.join(outDir, f) : null);
    for (const d of WARS_GEN_DIRS) {
      const list = (base: string) => (existsSync(path.join(base, d)) ? readdirSync(path.join(base, d)).sort() : []);
      const mine = list(warsDir), made = list(outDir);
      for (const f of new Set([...mine, ...made]))
        compare(`data/wars/${d}/${f}`, mine.includes(f) ? path.join(warsDir, d, f) : null, made.includes(f) ? path.join(outDir, d, f) : null);
    }
    if (!items.length) {
      mkdirSync(ctx.cacheDir, { recursive: true });
      writeFileSync(stateFile, JSON.stringify({ hash }) + '\n');
    }
    return { checked: total, items, notes: [`전쟁 생성: 파일 ${total}개를 생성기 결과와 바이트 비교`] };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

async function runGen(ctx: Context, opt: Options): Promise<CheckResult> {
  if (!opt.ci && !opt.only?.includes('gen')) return { checked: 0, items: [], notes: ['건너뜀(--ci이거나 --only gen일 때만)'] };
  const wars = await genWars(ctx);
  const geo = await genGeo();
  return { checked: geo.checked + wars.checked, items: [...geo.items, ...wars.items], notes: [...(geo.notes ?? []), ...(wars.notes ?? [])] };
}

export const checks: Check[] = [
  { id: 'gaps', title: '빈 땅 (check:gaps와 같은 칸·캐시, 기준선 대조)', selfBaseline: true, run: runGaps },
  { id: 'overlap', title: '영토 겹침 (5km² 초과 실패)', run: runOverlap },
  { id: 'strips', title: '가는 띠 (폭 1km 미만·넓이 2km² 초과)', run: runStrips },
  { id: 'zero', title: '넓이 0 조각', run: runZero },
  { id: 'islands', title: '사라진 섬', run: runIslands },
  { id: 'gen', title: 'data/geo·data/wars가 생성기 결과와 같은가', run: runGen },
];
