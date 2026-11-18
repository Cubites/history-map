// 넓이 재기 도구: 고른 영역·해에서 나라별 영토 넓이, 빈 땅, 겹침, (선택) 원본과 바뀐 넓이를 잰다.
// 쓰임: npm run area:geo -- --year <Y[,Y2…]> (--box 서,남,동,북 | --pieces <조각 id,…> | --poly <geojson 경로>)
//         [--entity <id,…>] [--base <원본 저장소 경로>] [--no-land] [--formula exact|events] [--holes] [--json] [--out <파일>]
//  - 영토: data/geo/<id>.geojson. 그 해 Y에 효력 있는 버전은 properties.from ≤ Y < to(null은 끝없음). 영역 상자와 겹치는 파일만 읽는다(상자 색인은 .cache/area-geo/에 둠).
//  - 영역: --box(경도·위도 상자), --pieces(data/base/fragments/*.topo.json의 조각 id), --poly(Polygon/MultiPolygon geojson). 기본으로 땅(land-50m)과 겹친 부분만 잰다(--no-land면 그대로).
//  - 넓이 공식(--formula, 2026-11-18 개선 ③): 기본 exact = 경위도 직선 변을 따라 cos(위도)를 적분한 넓이(구면 근사, 1도 = 111.32 km).
//    나눠 잰 넓이의 합이 통째 넓이와 같다(더하기가 성립). 예전 기본 events = scripts/test-geo/checks/events.ts의 area()(폴리곤마다 바깥 고리 평균 위도 하나) —
//    작은 도형은 exact와 거의 같지만, 위도 폭이 큰 도형을 나눠 재면 합이 통째와 어긋났다(CA-ON 1776 영역 땅 1,115,296 대 나라 합 1,083,989·빈 땅 0, 멕시코 125조각 1492 약 16만 차).
//    test:geo events의 1만 km² 판단 숫자와 똑같은 값이 필요할 때만 --formula events. 도형 연산은 polyclip-ts.
//  - polyclip이 예외를 내면 영역 쪽 폴리곤을 하나씩 나눠 다시 계산한다(그래도 실패한 것만 '계산 실패'로 센다 — 그 몫은 0으로 빠졌을 수 있음).
//  - 검산: 해마다 '영역 땅 = 나라 합 − 겹침 + 빈 땅'을 견줘, 0.5%와 100 km²를 함께 넘게 어긋나면 [검산 어긋남] 줄을 낸다(세 나라 이상 겹친 곳은 겹침을 덜 셈).
//  - --entity X: X 줄을 맨 위에 "X 땅 · 이웃이 덮은 땅(나라별) · 빈 땅 → X에서 빠진 땅(= 이웃 + 빈 땅)"으로 보인다.
//  - --base <원본 경로>: 같은 영역·해에서 원본의 같은 항목과 비교해 이번에 바뀐 넓이(나라마다 더해진·빠진 따로, 합 = 대칭차). 원본은 읽기만 한다.
//  - 영역 가운데 점의 정밀도 구역은 data/tests/zones.yaml(등급·끝 기준 landKm2)에서 scripts/test-geo/zones.ts로 읽는다. 없으면 일반(1만 km²)으로 본다. 빠진 땅·바뀐 넓이가 끝 기준 이상이면 '끝 기준 넘음'.
//  - --holes(2026-11-18 개선 ⑤): 해마다 '둘레가 모두 칠한 땅인 빈 땅'(칠한 땅 합집합 — 땅으로 자른 것 — 의 안쪽 고리, 호수 빼고)을 조각마다 넓이·상자로 낸다.
//    빈 땅 합 = voids 넓이 합이 맞아도 칼선 밖 voids로 넣은 땅이 사방이 칠해진 구멍이면 칸 땅 재기·합치기가 놓치던 것을 잡는다.
//    한계(잰 것): 사하 F7 레레 띠 11,382 km²는 세 쪽이 칠한 땅이고 북쪽만 좁은 목(북위 16.6~17.0°)으로 내내 비운 사막에 이어진 '만'이라 구멍으로 나오지 않는다
//    (F7 고치기 전 칼선으로 되살린 사본에서 1324·1502 구멍 0 — 빈 땅만 14,751 늘어남). 그런 꼴은 틀 COMMON 5절 '둘레를 본다' 줄(pt-dh 한 점)이 막는다.
//    해안·영역 가장자리에 닿은 빈 땅은 바깥 고리라 세지 않는다(영역을 넉넉히 잡을 것). 1 km² 밑 조각은 뺀다. 결정으로 일부러 비운 둘러싸인 땅(자치 소국 따위)도 나오니 voids 이유와 견준다.
//  - --json: 기계용 JSON 한 덩어리만 표준 출력(인계 폴더 tools/approx-check.mjs가 씀). --out: 자세한 표를 파일로.
// 종료 코드: 0 정상, 2 인자 오류.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pc from 'polyclip-ts';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { loadLand } from './build-data/tasks.ts';
import { area as areaEvents, asMulti, type Multi } from './test-geo/checks/events.ts';
import { DEFAULT_ZONE_ID, ZONES_FILE, ZONES_REL, ZonesError, zoneAt } from './test-geo/zones.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_DIR = path.join(ROOT, '.cache/area-geo');
type BBox = [number, number, number, number];

// ── 인자 ────────────────────────────────────────────────────

class UsageError extends Error {}
const USAGE = '사용: npm run area:geo -- --year <Y[,Y2…]> (--box 서,남,동,북 | --pieces <조각 id,…> | --poly <geojson 경로>) [--entity <id,…>] [--base <원본 저장소 경로>] [--no-land] [--formula exact|events] [--holes] [--json] [--out <파일>]';

interface Args {
  years: number[];
  box: BBox | null;
  pieces: string[] | null;
  poly: string | null;
  entities: string[];
  base: string | null;
  land: boolean;
  formula: 'exact' | 'events';
  json: boolean;
  holes: boolean;
  out: string | null;
}

function parseArgs(argv: string[]): Args {
  const flags = new Set(['no-land', 'json', 'holes']);
  const vals = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new UsageError(`알 수 없는 인자: ${a}`);
    const eq = a.indexOf('=');
    const key = eq < 0 ? a.slice(2) : a.slice(2, eq);
    if (flags.has(key)) {
      vals.set(key, '1');
      continue;
    }
    if (!['year', 'box', 'pieces', 'poly', 'entity', 'base', 'out', 'formula'].includes(key)) throw new UsageError(`알 수 없는 옵션: --${key}`);
    const v = eq >= 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined) throw new UsageError(`--${key} 값이 없음`);
    vals.set(key, v);
  }
  const list = (s: string | undefined) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);
  const years = list(vals.get('year')).map(Number);
  if (!years.length || years.some((y) => !Number.isFinite(y))) throw new UsageError('--year <해[,해…]>가 필요함');
  let box: BBox | null = null;
  if (vals.has('box')) {
    const b = list(vals.get('box')).map(Number);
    if (b.length !== 4 || b.some((x) => !Number.isFinite(x)) || b[0] >= b[2] || b[1] >= b[3]) throw new UsageError('--box는 서,남,동,북 (서<동, 남<북)');
    box = b as BBox;
  }
  const pieces = vals.has('pieces') ? list(vals.get('pieces')) : null;
  const poly = vals.get('poly') ?? null;
  if ([box, pieces, poly].filter((x) => x != null).length !== 1) throw new UsageError('영역은 --box, --pieces, --poly 중 하나만');
  const formula = vals.get('formula') ?? 'exact';
  if (formula !== 'exact' && formula !== 'events') throw new UsageError('--formula는 exact 또는 events');
  return { years, box, pieces, poly, entities: list(vals.get('entity')), base: vals.get('base') ?? null, land: !vals.has('no-land'), formula, json: vals.has('json'), holes: vals.has('holes'), out: vals.get('out') ?? null };
}

// ── 넓이 ────────────────────────────────────────────────────

const D2R = Math.PI / 180;
const R_KM = (111.32 * 180) / Math.PI; // 1도 = 111.32 km(events.ts 공식과 같은 축척)
/** 고리 넓이(km²): 변마다 위도가 경도에 따라 곧게 바뀐다고 보고 ∮ sin(위도) d(경도)를 정확히 적분 */
function ringExact(ring: number[][]): number {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const p1 = ring[j][1] * D2R;
    const h = (ring[i][1] * D2R - p1) / 2;
    const dl = (ring[i][0] - ring[j][0]) * D2R;
    // (cos p1 − cos p2)/(p2 − p1) = sin(평균 위도)·sin(h)/h — 위도 차가 작아도 정밀도를 잃지 않는 꼴
    s += dl * Math.sin(p1 + h) * (h === 0 ? 1 : Math.sin(h) / h);
  }
  return Math.abs(s) * R_KM * R_KM;
}
function areaExact(multi: Multi): number {
  let t = 0;
  for (const poly of multi) poly.forEach((r, i) => { t += (i === 0 ? 1 : -1) * ringExact(r); });
  return t;
}
/** 고른 공식(main이 --formula로 정함) */
let area: (m: Multi) => number = areaExact;

// ── 도형 도우미 ────────────────────────────────────────────

const clone = (m: Multi): pc.Geom => m as unknown as pc.Geom;
function bboxOf(m: Multi): BBox {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const poly of m) for (const [x, y] of poly[0]) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
}
const hit = (a: BBox, b: BBox) => a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
/** 영역 상자와 상자가 겹치는 폴리곤만 남긴다(연산 줄이기) */
const near = (m: Multi, box: BBox): Multi => m.filter((p) => hit(bboxOf([p]), box));

const failures: string[] = [];
function safe<T>(label: string, fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (e) {
    failures.push(`${label}: ${(e as Error).message}`);
    return fallback;
  }
}
/** a를 b로 자르는 연산. 예외가 나면 a의 폴리곤 하나씩 다시 하고 결과를 잇는다(a의 폴리곤끼리 겹치지 않으므로 잇기만 해도 됨) */
function clipOp(op: 'intersection' | 'difference', a: Multi, b: Multi, label: string): Multi {
  try {
    return pc[op](clone(a), clone(b)) as Multi;
  } catch (e) {
    if (a.length < 2) {
      failures.push(`${label}: ${(e as Error).message}`);
      return [];
    }
    const out: Multi = [];
    for (const [i, p] of a.entries()) {
      try {
        out.push(...(pc[op](clone([p]), clone(b)) as Multi));
      } catch (e2) {
        failures.push(`${label} (폴리곤 ${i + 1}/${a.length}): ${(e2 as Error).message}`);
      }
    }
    return out;
  }
}
const intersect = (a: Multi, b: Multi, label: string): Multi => (a.length && b.length ? clipOp('intersection', a, b, label) : []);
const diff = (a: Multi, b: Multi, label: string): Multi => (!a.length ? [] : !b.length ? a : clipOp('difference', a, b, label));
const union = (parts: Multi[], label: string): Multi => {
  const ps = parts.filter((p) => p.length);
  if (!ps.length) return [];
  if (ps.length === 1) return ps[0];
  return safe(label, () => pc.union(clone(ps[0]), ...ps.slice(1).map(clone)) as Multi, []);
};

// ── 영역 ────────────────────────────────────────────────────

function polygonsOf(g: unknown, out: Multi): void {
  const o = g as { type?: string; coordinates?: unknown; geometry?: unknown; features?: unknown[]; geometries?: unknown[] } | null;
  if (!o) return;
  if (o.type === 'Polygon' || o.type === 'MultiPolygon') out.push(...asMulti(o as { type: string; coordinates: unknown }));
  else if (o.type === 'Feature') polygonsOf(o.geometry, out);
  else if (o.type === 'FeatureCollection') (o.features ?? []).forEach((f) => polygonsOf(f, out));
  else if (o.type === 'GeometryCollection') (o.geometries ?? []).forEach((f) => polygonsOf(f, out));
}

function loadPieces(ids: string[]): Multi {
  const dir = path.join(ROOT, 'data/base/fragments');
  const want = new Set(ids);
  const found: Multi[] = [];
  const got = new Set<string>();
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.topo.json')).sort()) {
    const topo = JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as Topology<{ fragments: GeometryCollection }>;
    for (const g of topo.objects.fragments.geometries) {
      const id = g.id == null ? '' : String(g.id);
      if (!want.has(id) || got.has(id)) continue;
      got.add(id);
      const out: Multi = [];
      polygonsOf(feature(topo, g), out);
      found.push(out);
    }
  }
  const missing = ids.filter((i) => !got.has(i));
  if (missing.length) throw new UsageError(`조각 id를 찾지 못함: ${missing.join(',')}`);
  return union(found, '조각 합치기');
}

function buildRegion(a: Args): { geom: Multi; label: string } {
  if (a.box) {
    const [w, s, e, n] = a.box;
    return { geom: [[[[w, s], [e, s], [e, n], [w, n], [w, s]]]], label: `상자 ${a.box.join(',')}` };
  }
  if (a.pieces) return { geom: loadPieces(a.pieces), label: `조각 ${a.pieces.length > 3 ? `${a.pieces.slice(0, 3).join(',')} 외 ${a.pieces.length - 3}` : a.pieces.join(',')}` };
  const out: Multi = [];
  polygonsOf(JSON.parse(readFileSync(path.resolve(a.poly!), 'utf8')), out);
  if (!out.length) throw new UsageError('--poly 파일에 Polygon/MultiPolygon이 없음');
  return { geom: out, label: `다각형 ${path.basename(a.poly!)}` };
}

// ── 정밀도 구역 ─────────────────────────────────────────────

interface ZoneInfo { id: string | null; label: string; landKm2: number; source: 'zones.yaml' | '기본'; note: string | null }
/** 점이 든 첫 구역의 등급(scripts/test-geo/zones.ts). 구역 파일이 없으면 일반(기본 1만 km²). 형식 오류는 ZonesError로 나가 종료 코드 2 */
function zoneOf(point: [number, number]): ZoneInfo {
  if (!existsSync(ZONES_FILE)) return { id: null, label: '일반(기본)', landKm2: 10000, source: '기본', note: `${ZONES_REL} 없음 → 일반(기본 1만 km²)으로 봄` };
  const hit = zoneAt(point[0], point[1]);
  return { id: hit.id === DEFAULT_ZONE_ID ? null : hit.id, label: hit.gradeValues.label, landKm2: hit.gradeValues.landKm2, source: 'zones.yaml', note: null };
}

// ── 항목 영토 읽기 ──────────────────────────────────────────

interface Version { from: number; to: number; geom: Multi }
interface Doc { id: string; text: string; versions: Version[] }
interface IndexEntry { size: number; mtime: number; bbox: BBox }

/** 저장소의 data/geo 파일 상자 색인(.cache/area-geo/index-<경로 해시>.json — 읽는 저장소가 아니라 이 사본의 .cache에 둔다) */
function loadIndex(repo: string): Map<string, BBox> {
  const dir = path.join(repo, 'data/geo');
  const key = createHash('sha256').update(path.resolve(repo)).digest('hex').slice(0, 10);
  const file = path.join(INDEX_DIR, `index-${key}.json`);
  let cache: Record<string, IndexEntry> = {};
  try {
    cache = JSON.parse(readFileSync(file, 'utf8')) as Record<string, IndexEntry>;
  } catch {
    // 색인이 없거나 깨졌으면 새로 만든다
  }
  const next: Record<string, IndexEntry> = {};
  const res = new Map<string, BBox>();
  let dirty = false;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.geojson')) continue;
    const st = statSync(path.join(dir, f));
    const old = cache[f];
    let entry: IndexEntry;
    if (old && old.size === st.size && old.mtime === st.mtimeMs) entry = old;
    else {
      const g = JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as { features: { geometry: { type: string; coordinates: unknown } }[] };
      const all: Multi = g.features.flatMap((x) => asMulti(x.geometry));
      entry = { size: st.size, mtime: st.mtimeMs, bbox: all.length ? bboxOf(all) : [0, 0, 0, 0] };
      dirty = true;
    }
    next[f] = entry;
    res.set(f.replace(/\.geojson$/, ''), entry.bbox);
  }
  if (dirty || Object.keys(cache).length !== Object.keys(next).length) {
    try {
      mkdirSync(INDEX_DIR, { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      writeFileSync(tmp, JSON.stringify(next));
      renameSync(tmp, file);
    } catch {
      // 색인을 못 써도 결과는 같다
    }
  }
  return res;
}

const docCache = new Map<string, Doc | null>();
function loadDoc(repo: string, id: string): Doc | null {
  const file = path.join(repo, 'data/geo', `${id}.geojson`);
  const key = `${path.resolve(repo)}|${id}`;
  if (docCache.has(key)) return docCache.get(key)!;
  let doc: Doc | null = null;
  if (existsSync(file)) {
    const text = readFileSync(file, 'utf8');
    const g = JSON.parse(text) as { features: { properties: { from: number; to: number | null }; geometry: { type: string; coordinates: unknown } }[] };
    doc = { id, text, versions: g.features.map((f) => ({ from: f.properties.from, to: f.properties.to ?? Infinity, geom: asMulti(f.geometry) })) };
  }
  docCache.set(key, doc);
  return doc;
}
/** 그 해 효력 있는 버전(from ≤ Y < to)의 영토. 효력 있는 버전이 여럿이면 합친다 */
function territoryAt(doc: Doc | null, year: number, box: BBox): Multi {
  if (!doc) return [];
  const parts = doc.versions.filter((v) => v.from <= year && year < v.to).map((v) => near(v.geom, box));
  return union(parts, `${doc.id} 버전 합치기`);
}

// ── 한 해 재기 ──────────────────────────────────────────────

interface Neighbor { id: string; km2: number }
interface EntityResult { ownKm2: number; otherKm2: number; otherBy: Neighbor[]; emptyKm2: number; missingKm2: number; overLimit: boolean; changed: ChangedRow | null }
interface ChangedRow { id: string; addedKm2: number; removedKm2: number; changedKm2: number }
interface YearResult {
  year: number;
  landKm2: number;
  emptyKm2: number;
  overlapKm2: number;
  checkGapKm2: number;
  byEntity: Neighbor[];
  entities: Record<string, EntityResult>;
  changed: { totalKm2: number; addedKm2: number; removedKm2: number; overLimit: boolean; byEntity: ChangedRow[] } | null;
  /** --holes: 둘레가 모두 칠한 땅인 빈 땅 조각(넓이 큰 순) */
  holes?: { km2: number; box: BBox }[];
}

const round = (x: number) => Math.round(x * 10) / 10;
/** polyclip 부동소수 잡음(1e-12 따위)을 0으로 */
const clean = (x: number) => (Math.abs(x) < 0.01 ? 0 : x);

function measureYear(year: number, L: Multi, box: BBox, ids: string[], baseIds: string[], a: Args, zone: ZoneInfo): YearResult {
  const A = new Map<string, Multi>();
  for (const id of ids) {
    const t = territoryAt(loadDoc(ROOT, id), year, box);
    const clip = intersect(L, t, `${id} ${year} 영역 자르기`);
    if (clip.length) A.set(id, clip);
  }
  const areas = new Map([...A].map(([id, g]) => [id, area(g)] as const));
  const U = union([...A.values()], `${year} 영토 합치기`);
  const landKm2 = area(L);
  const emptyKm2 = clean(area(diff(L, U, `${year} 빈 땅`)));
  // 겹침: 상자가 겹치는 쌍만 교집합을 구해 합친다
  const boxes = new Map([...A].map(([id, g]) => [id, bboxOf(g)] as const));
  const keys = [...A.keys()];
  const overlaps: Multi[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      if (!hit(boxes.get(keys[i])!, boxes.get(keys[j])!)) continue;
      const o = intersect(A.get(keys[i])!, A.get(keys[j])!, `겹침 ${keys[i]}·${keys[j]} ${year}`);
      if (o.length) overlaps.push(o);
    }
  }
  const overlapKm2 = area(union(overlaps, `${year} 겹침 합치기`));

  const byEntity = [...areas].map(([id, km2]) => ({ id, km2 })).sort((p, q) => q.km2 - p.km2);
  // 검산: 영역 땅 = 나라 합 − 겹침 + 빈 땅 (어긋나면 연산 실패나 공식 탓)
  const checkGapKm2 = landKm2 - (byEntity.reduce((s, r) => s + r.km2, 0) - overlapKm2 + emptyKm2);

  const entities: Record<string, EntityResult> = {};
  for (const x of a.entities) {
    const Ax = A.get(x) ?? [];
    const ownKm2 = areas.get(x) ?? 0;
    const otherKm2 = clean(area(diff(U, Ax, `${x} ${year} 이웃이 덮은 땅`)));
    const otherBy: Neighbor[] = [];
    for (const [id, g] of A) {
      if (id === x) continue;
      const bx = Ax.length ? boxes.get(x)! : null;
      const km2 = bx && hit(bx, boxes.get(id)!) ? area(diff(g, Ax, `${id} ${year} 이웃 몫`)) : areas.get(id)!;
      if (km2 >= 0.5) otherBy.push({ id, km2 });
    }
    otherBy.sort((p, q) => q.km2 - p.km2);
    const missingKm2 = otherKm2 + emptyKm2;
    entities[x] = { ownKm2, otherKm2, otherBy, emptyKm2, missingKm2, overLimit: missingKm2 >= zone.landKm2, changed: null };
  }

  let changed: YearResult['changed'] = null;
  if (a.base) {
    const rows: ChangedRow[] = [];
    for (const id of new Set([...ids, ...baseIds])) {
      const cur = loadDoc(ROOT, id);
      const old = loadDoc(a.base, id);
      if (cur && old && cur.text === old.text) continue;
      const Ac = cur ? (A.get(id) ?? []) : [];
      const Ab = intersect(L, territoryAt(old, year, box), `${id} ${year} 원본 영역 자르기`);
      const addedKm2 = area(diff(Ac, Ab, `${id} ${year} 더해진`));
      const removedKm2 = area(diff(Ab, Ac, `${id} ${year} 빠진`));
      if (addedKm2 + removedKm2 > 0.05) rows.push({ id, addedKm2, removedKm2, changedKm2: addedKm2 + removedKm2 });
    }
    rows.sort((p, q) => q.changedKm2 - p.changedKm2);
    const addedKm2 = rows.reduce((s, r) => s + r.addedKm2, 0);
    const removedKm2 = rows.reduce((s, r) => s + r.removedKm2, 0);
    changed = { totalKm2: addedKm2 + removedKm2, addedKm2, removedKm2, overLimit: rows.some((r) => r.changedKm2 >= zone.landKm2), byEntity: rows };
    for (const x of a.entities) entities[x].changed = rows.find((r) => r.id === x) ?? { id: x, addedKm2: 0, removedKm2: 0, changedKm2: 0 };
  }
  let holes: YearResult['holes'];
  if (a.holes) {
    // 칠한 땅 합집합 U의 안쪽 고리 = 사방이 칠한 땅인 빈 곳. 땅과 겹친 부분만(호수 빼기), 그 안에 칠한 섬이 있으면 뺀다
    holes = [];
    for (const poly of U)
      for (const ring of poly.slice(1)) {
        const h = diff(intersect(L, [[ring]], `${year} 구멍 땅`), U, `${year} 구멍 안 섬`);
        const km2 = area(h);
        if (km2 >= HOLE_MIN_KM2) holes.push({ km2: round(km2), box: bboxOf(h).map((v) => Math.round(v * 100) / 100) as BBox });
      }
    holes.sort((p, q) => q.km2 - p.km2);
  }
  return { year, landKm2, emptyKm2, overlapKm2, checkGapKm2, byEntity, entities, changed, ...(holes ? { holes } : {}) };
}
/** --holes에서 이보다 작은 구멍은 뺀다(polyclip 이음매 잡음) */
const HOLE_MIN_KM2 = 1;

// ── 출력 ────────────────────────────────────────────────────

const n = (x: number) => Math.round(x).toLocaleString('en-US');
const checkBad = (y: YearResult) => Math.abs(y.checkGapKm2) > Math.max(100, y.landKm2 * 0.005);
const OVER = ' [끝 기준 넘음]';

function summaryLines(y: YearResult, a: Args, zone: ZoneInfo): string[] {
  const out: string[] = [];
  const t = `[${y.year}]`;
  for (const x of a.entities) {
    const e = y.entities[x];
    const nb = e.otherBy.slice(0, 5).map((r) => `${r.id} ${n(r.km2)}`).join(', ') + (e.otherBy.length > 5 ? `, 외 ${e.otherBy.length - 5}개 ${n(e.otherBy.slice(5).reduce((s, r) => s + r.km2, 0))}` : '');
    const ch = e.changed ? ` · 이번에 바뀐 ${n(e.changed.changedKm2)}(+${n(e.changed.addedKm2)} −${n(e.changed.removedKm2)})${e.changed.changedKm2 >= zone.landKm2 ? OVER : ''}` : '';
    out.push(`${t} ${x} 땅 ${n(e.ownKm2)} km² · 이웃이 덮은 땅 ${n(e.otherKm2)} km²${nb ? `(${nb})` : ''} · 빈 땅 ${n(e.emptyKm2)} km² → ${x}에서 빠진 땅 ${n(e.missingKm2)} km²${e.overLimit ? OVER : ''}${ch}`);
  }
  out.push(`${t} ${a.land ? '영역 땅' : '영역(땅 자르기 없음)'} ${n(y.landKm2)} km² · 빈 땅(어느 영토에도 안 덮임) ${n(y.emptyKm2)} km²${y.overlapKm2 >= 0.5 ? ` · 겹침 ${n(y.overlapKm2)} km²` : ''}`);
  if (checkBad(y)) out.push(`${t} [검산 어긋남] 영역 땅 − (나라 합 − 겹침 + 빈 땅) = ${n(y.checkGapKm2)} km²${a.formula === 'events' ? ' — --formula events는 나눠 잰 합이 맞지 않음(기본 exact로 다시 잴 것)' : ' — 계산 실패나 세 나라 이상 겹침'}`);
  if (y.holes) out.push(`${t} ${y.holes.length ? `[구멍] 둘레가 모두 칠한 땅인 빈 땅 ${y.holes.length}조각 · 합 ${n(y.holes.reduce((s, h) => s + h.km2, 0))} km²: ${y.holes.slice(0, 5).map((h) => `${n(h.km2)} (${h.box.join(',')})`).join(' · ')}${y.holes.length > 5 ? ` 외 ${y.holes.length - 5}` : ''} — voids 이유와 견줌(칼선 밖·사막이라 적었으면 구멍)` : '구멍(둘레가 모두 칠한 빈 땅) 0'}`);
  const top = y.byEntity.slice(0, 8).map((r) => `${r.id} ${n(r.km2)}`).join(', ');
  const rest = y.byEntity.slice(8);
  out.push(`${t} 나라별 영역 안: ${top || '(없음)'}${rest.length ? `, 나머지 ${rest.length}개 ${n(rest.reduce((s, r) => s + r.km2, 0))}` : ''}`);
  if (y.changed) {
    const rows = y.changed.byEntity.slice(0, 6).map((r) => `${r.id} +${n(r.addedKm2)} −${n(r.removedKm2)}`).join(', ');
    out.push(`${t} 이번에 바뀐 넓이(--base) 합 ${n(y.changed.totalKm2)} km²(+${n(y.changed.addedKm2)} −${n(y.changed.removedKm2)})${y.changed.byEntity.length ? `: ${rows}${y.changed.byEntity.length > 6 ? `, 외 ${y.changed.byEntity.length - 6}개` : ''}` : ''}${y.changed.overLimit ? OVER : ''}`);
  }
  return out;
}

function detailTable(years: YearResult[], a: Args, head: string): string {
  const L: string[] = [`# area:geo 자세한 표`, '', head, ''];
  for (const y of years) {
    L.push(`## ${y.year}년`, '', `- 영역 땅 ${n(y.landKm2)} km² · 빈 땅 ${n(y.emptyKm2)} km² · 겹침 ${n(y.overlapKm2)} km² · 검산 차 ${n(y.checkGapKm2)} km²${checkBad(y) ? ' [검산 어긋남]' : ''}`, '', '| 나라 | 영역 안 km² |', '| --- | ---: |');
    for (const r of y.byEntity) L.push(`| ${r.id} | ${n(r.km2)} |`);
    L.push('');
    for (const x of a.entities) {
      const e = y.entities[x];
      L.push(`### ${x}`, '', `- 땅 ${n(e.ownKm2)} km² · 이웃이 덮은 땅 ${n(e.otherKm2)} km² · 빈 땅 ${n(e.emptyKm2)} km² → 빠진 땅 ${n(e.missingKm2)} km²${e.overLimit ? OVER : ''}`);
      for (const r of e.otherBy) L.push(`  - ${r.id}: ${n(r.km2)} km²`);
      L.push('');
    }
    if (y.changed) {
      L.push('### 이번에 바뀐 넓이 (--base)', '', '| 나라 | 더해진 | 빠진 | 합(대칭차) |', '| --- | ---: | ---: | ---: |');
      for (const r of y.changed.byEntity) L.push(`| ${r.id} | ${n(r.addedKm2)} | ${n(r.removedKm2)} | ${n(r.changedKm2)} |`);
      L.push('');
    }
  }
  return L.join('\n');
}

// ── 실행 ────────────────────────────────────────────────────

function main(): number {
  let a: Args;
  try {
    a = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    console.error(`${e.message}\n${USAGE}`);
    return 2;
  }
  try {
    const t0 = Date.now();
    if (a.formula === 'events') area = areaEvents;
    const region = buildRegion(a);
    const box = bboxOf(region.geom);
    const center: [number, number] = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
    const zone = zoneOf(center);
    // 땅과 겹친 부분만
    let L = region.geom;
    if (a.land) {
      const nearLand = loadLand('50m').pieces.filter((p) => hit(p.bbox, box)).map((p) => p.coords);
      L = nearLand.length ? intersect(near(region.geom, box), nearLand, '땅 자르기') : [];
    }
    const index = loadIndex(ROOT);
    const ids = [...index].filter(([, b]) => hit(b, box)).map(([id]) => id).sort();
    let baseIds: string[] = [];
    if (a.base) {
      if (!existsSync(path.join(a.base, 'data/geo'))) throw new UsageError(`--base 경로에 data/geo가 없음: ${a.base}`);
      baseIds = [...loadIndex(path.resolve(a.base))].filter(([, b]) => hit(b, box)).map(([id]) => id);
    }
    const unknown = a.entities.filter((x) => !index.has(x) && !baseIds.includes(x));
    if (unknown.length) throw new UsageError(`항목 파일이 없음: ${unknown.join(',')}`);
    const years = a.years.map((y) => measureYear(y, L, box, ids, baseIds, a, zone));

    const head = `${region.label} · ${a.land ? '땅 50m 자름' : '땅 자르기 없음'}${a.formula === 'events' ? ' · 넓이 공식 events(예전)' : ''} · 구역 ${zone.id ?? '(구역 밖)'} ${zone.label} 끝 기준 ${n(zone.landKm2)} km²${a.base ? ' · 원본과 비교' : ''}`;
    const sec = ((Date.now() - t0) / 1000).toFixed(1);
    if (a.out) {
      mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
      writeFileSync(a.out, detailTable(years, a, head), 'utf8');
    }
    if (a.json) {
      const json = {
        tool: 'area-geo',
        region: { label: region.label, bbox: box, center, land: a.land },
        formula: a.formula,
        zone,
        base: a.base,
        entityFiles: ids.length,
        failures,
        years: years.map((y) => ({ ...y, landKm2: round(y.landKm2), emptyKm2: round(y.emptyKm2), overlapKm2: round(y.overlapKm2), checkGapKm2: round(y.checkGapKm2) })),
      };
      if (zone.note) console.error(zone.note);
      console.log(JSON.stringify(json));
      return 0;
    }
    const lines = [`area:geo ${head} · 항목 파일 ${ids.length}개 · ${sec}초`];
    if (zone.note) lines.push(`알림: ${zone.note}`);
    for (const y of years) lines.push(...summaryLines(y, a, zone));
    if (failures.length) lines.push(`[계산 실패 ${failures.length}건 — 그 몫은 0으로 빠졌을 수 있음, 값을 믿지 말 것] ${failures.slice(0, 3).join(' | ')}`);
    if (a.out) lines.push(`자세한 표: ${a.out}`);
    console.log(lines.join('\n'));
    return 0;
  } catch (e) {
    if (e instanceof ZonesError) {
      console.error(e.message);
      return 2;
    }
    if (!(e instanceof UsageError)) throw e;
    console.error(`${e.message}\n${USAGE}`);
    return 2;
  }
}

process.exitCode = main();
