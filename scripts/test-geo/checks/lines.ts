// test:geo 선 기준선 검사 `lines` (b. 손그림 선이 실제 강·해안에서 얼마나 떨어졌는지).
// 사용: npm run test:geo -- --only lines   (--region europe|east-asia|korea|china|europe 로 거르기. --years는 영향 없음)
//   환경 변수 TEST_GEO_LINES_VERBOSE=1이면 꼬리표마다 최대·평균 거리를 표준 오류에 보인다(허용 값을 정할 때). TEST_GEO_LINES_DIR=<scripts/geo 사본 경로>는 검사 자체를 시험할 때만 쓴다.
// 하는 일: 국경 생성기 상수(scripts/geo/shared.mjs, scripts/geo/areas/*.mjs) 가운데 꼬리표를 단 선의 꼭짓점과 변 중점마다 기준선까지 최단 거리(국지 등거리 근사, km)를 재어
//   최대가 허용보다 크면 실패로 낸다. 최대·평균은 요약과 보고서에 나온다.
//
// 꼬리표 문법 (상수 선언 바로 위 줄. 한 상수에 여러 개를 이어 달 수 있고, 꼬리표 사이에 다른 줄이 끼면 안 됨):
//   // @기준선 강 <키> [구간 <i>-<j>] [허용 <N>km] [평균 <M>km] [ — 메모]
//   // @기준선 해안 [구간 <i>-<j>] [허용 <N>km] [평균 <M>km] [ — 메모]
//   - <키>: scripts/prep-rivers.mjs의 RIVER_SETS 키(amur·danube 등). 기준 강선은 data/base/rivers/rivers.geojson(Natural Earth v5.1.2, npm run prep:rivers)
//   - 구간 i-j: 선의 i번째~j번째 꼭짓점(0부터, 양끝 포함)과 그 사이 변만 잰다. 강을 떠나 육지·호수를 지나는 구간을 빼려고 쓴다. 없으면 선 전체
//   - 허용: 꼬리표의 값이 늘 우선. 없으면 정밀도 구역 파일(data/tests/zones.yaml)의 tests.lineTolKm — 선의 첫 꼭짓점(구간이 있으면 그 구간 첫 점)이 든 구역의 값(기본 강 3km, 해안 2km). 근사로 그은 선은 지금 수준을 허용으로 적고(메모에 '지도 FIX 후보'), 나중에 선을 고치면 허용도 줄인다
//   - 평균: 최대만 보면 허용 아래에서 선이 나빠져도 통과하므로, 지금 평균(소수 1자리로 올림)을 적어 두면 평균이 그 값을 넘을 때도 실패로 낸다. 없으면 평균은 보지 않는다. 선을 고쳐 평균이 줄면 값도 줄인다
//   - 해안: 기준은 world-atlas land-50m(Natural Earth 4.1.0) 해안선. areas/europe.mjs의 선은 유럽 조각 파일(data/base/fragments/europe.topo.json)의 권역 바깥선.
//     선→해안 최대 거리 외에 반대 방향도 잰다: 선의 시작·끝에 가장 가까운 해안 꼭짓점(5×허용 또는 10km 이내, 같은 링) 사이의 해안을 링을 따라 따라가며, 그 해안 점이 선에서 허용보다 멀면 실패
//       (선이 만 입구를 가로지르거나 곶을 건너뛴 경우를 잡는다. 끝점이 해안 근처가 아니면 반대 방향은 건너뜀)
//   - 꼬리표를 단 상수는 `export`여야 한다. 검사가 모듈을 불러 값을 읽는다. export가 없으면 실패('export 붙일 것'). export를 더해도 data/geo 바이트는 그대로다
// 열쇠: `<파일> <상수> <강 키|해안>[ <i>-<j>]` (예: `shared.mjs L_USSURI ussuri 16-49`). 허용 목록: data/tests/allow/lines.yaml
// 속도: 꼬리표 단 권역 파일을 불러오는 시간(europe.mjs는 도형 계산이 있어 따뜻한 캐시로 10여 초)이 거의 전부다.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { feature } from 'topojson-client';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';
import { loadZones, zoneAt } from '../zones.ts';

type P = [number, number];
type Line = P[];
interface Seg { a: P; b: P }
/** scripts/fragments/common.mjs의 SegIndex (타입 선언 없음) */
interface SegIdx { add(a: P, b: P, owner: string): number; query(x0: number, y0: number, x1: number, y1: number): Set<number>; segs: Seg[] }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const GEO_DIR = process.env.TEST_GEO_LINES_DIR ? path.resolve(process.env.TEST_GEO_LINES_DIR) : path.join(ROOT, 'scripts/geo');
const RIVERS_FILE = path.join(ROOT, 'data/base/rivers/rivers.geojson');
const FRAGMENTS_FILE = path.join(ROOT, 'data/base/fragments/europe.topo.json');
const KM = 111.32;
const VERBOSE = process.env.TEST_GEO_LINES_VERBOSE === '1';

// ── 꼬리표 ───────────────────────────────────────────────────
interface Tag {
  /** geo 폴더 기준 파일 (예: 'shared.mjs', 'areas/europe.mjs') */
  file: string;
  line: number;
  name: string;
  kind: '강' | '해안';
  river: string | null;
  range: [number, number] | null;
  /** 꼬리표에 적힌 허용(km). 없으면 null → 구역 파일 값 */
  tol: number | null;
  /** 평균 거리 상한(km). 꼬리표에 없으면 null */
  meanCap: number | null;
}

/** 파일 → 권역 필터 단위. --region이 이 단위나 파일 이름(korea·china·europe...)과 같을 때만 그 파일의 꼬리표를 잰다 */
function unitOf(file: string): string | null {
  const base = path.basename(file, '.mjs');
  if (file === 'shared.mjs') return 'east-asia';
  if (base === 'europe') return 'europe';
  return ['korea', 'china', 'inner-asia', 'japan', 'southeast-asia'].includes(base) ? 'east-asia' : null;
}

function readTags(items: Item[]): Tag[] {
  const files = ['shared.mjs', ...readdirSync(path.join(GEO_DIR, 'areas')).filter((f) => f.endsWith('.mjs')).sort().map((f) => 'areas/' + f)];
  const tags: Tag[] = [];
  for (const file of files) {
    const lines = readFileSync(path.join(GEO_DIR, file), 'utf8').split('\n');
    let pending: { text: string; line: number }[] = [];
    lines.forEach((text, i) => {
      const m = text.match(/^\/\/ @기준선 (.*)$/);
      if (m) { pending.push({ text: m[1], line: i + 1 }); return; }
      const decl = text.match(/^(?:export )?(?:const|let) (\w+) =/);
      if (decl) {
        for (const p of pending) {
          const t = parseTag(file, p.line, decl[1], p.text, items);
          if (t) tags.push(t);
        }
      } else {
        for (const p of pending) items.push({ key: `${file}:${p.line} 꼬리표 위치`, msg: `${file}:${p.line} 꼬리표가 상수 선언 바로 위에 있지 않음: // @기준선 ${p.text}` });
      }
      pending = [];
    });
  }
  return tags;
}

function parseTag(file: string, line: number, name: string, text: string, items: Item[]): Tag | null {
  const head = text.split(' — ')[0];
  const words = head.trim().split(/\s+/);
  const bad = (why: string): null => { items.push({ key: `${file}:${line} 꼬리표 문법`, msg: `${file}:${line} ${name}: ${why} (// @기준선 ${text})` }); return null; };
  const kind = words[0];
  if (kind !== '강' && kind !== '해안') return bad("종류는 '강' 또는 '해안'");
  let river: string | null = null;
  if (kind === '강') {
    river = words[1] ?? null;
    if (!river || !/^[a-z][a-z0-9-]*$/.test(river)) return bad('강 꼬리표에는 키(영문 소문자)가 필요함');
  }
  const r = head.match(/구간\s*(\d+)-(\d+)/);
  const tol = head.match(/허용\s*(\d+(?:\.\d+)?)\s*km/);
  const mean = head.match(/평균\s*(\d+(?:\.\d+)?)\s*km/);
  return { file, line, name, kind, river, range: r ? [Number(r[1]), Number(r[2])] : null, tol: tol ? Number(tol[1]) : null, meanCap: mean ? Number(mean[1]) : null };
}

const tagKey = (t: Tag) => `${path.basename(t.file)} ${t.name} ${t.kind === '강' ? t.river : '해안'}${t.range ? ` ${t.range[0]}-${t.range[1]}` : ''}`;

// ── 거리 ─────────────────────────────────────────────────────
/** 점 p에서 선분 ab까지 (km, p 위도 기준 등거리 근사)와 선분 위 매개변수 t */
function pointSegKm(p: P, a: P, b: P): { d: number; t: number } {
  const c = Math.cos((p[1] * Math.PI) / 180);
  const ax = (a[0] - p[0]) * c, ay = a[1] - p[1], bx = (b[0] - p[0]) * c, by = b[1] - p[1];
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
  return { d: Math.hypot(ax + t * dx, ay + t * dy) * KM, t };
}

/** 색인 안에서 p와 가장 가까운 선분까지 거리(km). 찾는 반경을 넓혀 가며, 상자 안에서 찾은 값이 상자 밖보다 가까울 때만 확정한다 */
function nearestKm(idx: SegIdx, p: P): number {
  const cosLat = Math.max(0.05, Math.cos((p[1] * Math.PI) / 180));
  for (const rad of [0.3, 1.5, 6]) {
    let best = Infinity;
    for (const i of idx.query(p[0] - rad / cosLat, p[1] - rad, p[0] + rad / cosLat, p[1] + rad)) best = Math.min(best, pointSegKm(p, idx.segs[i].a, idx.segs[i].b).d);
    if (best <= rad * KM * 0.9) return best;
    if (rad === 6) return best;
  }
  return Infinity;
}

/** 꼭짓점 i..j와 이웃한 꼭짓점의 중점 */
function sampleLine(line: Line, from: number, to: number): P[] {
  const out: P[] = [];
  for (let i = from; i <= to; i++) {
    out.push(line[i]);
    if (i < to) out.push([(line[i][0] + line[i + 1][0]) / 2, (line[i][1] + line[i + 1][1]) / 2]);
  }
  return out;
}

interface Measure { max: number; mean: number; at: P; n: number }
function measure(points: P[], dist: (p: P) => number): Measure {
  let max = -1, sum = 0, at = points[0];
  for (const p of points) {
    const d = dist(p);
    sum += d;
    if (d > max) { max = d; at = p; }
  }
  return { max, mean: sum / points.length, at, n: points.length };
}

// ── 기준선 자료 ──────────────────────────────────────────────
let commonCache: any; // scripts/fragments/common.mjs (타입 선언 없음)
async function common(): Promise<any> {
  commonCache ??= await import(pathToFileURL(path.join(ROOT, 'scripts/fragments/common.mjs')).href);
  return commonCache;
}

async function loadRivers(): Promise<Map<string, SegIdx>> {
  const { SegIndex } = await common();
  const json = JSON.parse(readFileSync(RIVERS_FILE, 'utf8')) as { features: { properties: { set: string }; geometry: { coordinates: P[][] } }[] };
  const byKey = new Map<string, SegIdx>();
  for (const f of json.features) {
    let idx = byKey.get(f.properties.set);
    if (!idx) { idx = new SegIndex(0.2) as SegIdx; byKey.set(f.properties.set, idx); }
    for (const l of f.geometry.coordinates) for (let i = 0; i + 1 < l.length; i++) idx.add(l[i], l[i + 1], f.properties.set);
  }
  return byKey;
}

interface Coast { idx: SegIdx; rings: Line[] }

/** 해안 기준 링들: world-atlas land-50m(안쪽 구멍 포함 모든 링) 또는 유럽 조각 파일 권역 바깥선 */
async function loadCoast(europe: boolean): Promise<Coast> {
  const { SegIndex, loadLand } = await common();
  const idx = new SegIndex(0.2) as SegIdx;
  const rings: Line[] = [];
  let polys: P[][][];
  if (europe) {
    const topo = JSON.parse(readFileSync(FRAGMENTS_FILE, 'utf8'));
    const f = feature(topo, topo.objects.domain) as any;
    const g = f.type === 'FeatureCollection' ? f.features.map((x: any) => x.geometry) : [f.geometry ?? f];
    polys = g.flatMap((x: any) => (x.type === 'Polygon' ? [x.coordinates] : x.coordinates));
  } else {
    polys = loadLand('50m');
  }
  for (const poly of polys) for (const r of poly) {
    const ri = rings.push(r as Line) - 1;
    for (let k = 0; k + 1 < r.length; k++) (idx as any).add(r[k], r[k + 1], 'coast', { ri, k });
  }
  return { idx, rings };
}

/** p에서 reach km 안에서 가장 가까운 해안 꼭짓점 (링 번호·꼭짓점 번호) */
function nearestCoastVertex(coast: Coast, p: P, reach: number): { ri: number; vi: number; d: number } | null {
  const cosLat = Math.max(0.05, Math.cos((p[1] * Math.PI) / 180));
  const deg = reach / KM;
  let best: { ri: number; vi: number; d: number } | null = null;
  for (const i of coast.idx.query(p[0] - deg / cosLat, p[1] - deg, p[0] + deg / cosLat, p[1] + deg)) {
    const s = coast.idx.segs[i] as Seg & { ri: number; k: number };
    for (const [q, vi] of [[s.a, s.k], [s.b, s.k + 1]] as [P, number][]) {
      const d = pointSegKm(p, q, q).d;
      if (d <= reach && (!best || d < best.d)) best = { ri: s.ri, vi, d };
    }
  }
  return best;
}

/** 해안선 → 선 방향: 선의 시작·끝에 가장 가까운 해안 꼭짓점(5×허용 이내, 같은 링) 사이의 해안(링을 따라 짧은 쪽)의 꼭짓점·중점이 선에서 얼마나 먼지.
 *  끝점이 해안 근처가 아니거나 다른 링이면 잴 수 없어 null (건너편 기슭·섬의 해안은 이어진 해안이 아니라서 세지 않는다) */
function coastToLine(coast: Coast, line: Line, from: number, to: number, tol: number): Measure | null {
  const reach = Math.max(5 * tol, 10);
  const a = nearestCoastVertex(coast, line[from], reach), b = nearestCoastVertex(coast, line[to], reach);
  if (!a || !b || a.ri !== b.ri) return null;
  const ring = coast.rings[a.ri];
  const n = ring.length - 1; // 닫힌 링: 마지막 점 = 첫 점
  const walk = (step: 1 | -1): { pts: P[]; km: number } => {
    const pts: P[] = [ring[a.vi % n]];
    let km = 0;
    for (let i = a.vi % n; i !== b.vi % n; ) {
      const j = (i + step + n) % n;
      km += pointSegKm(ring[i], ring[j], ring[j]).d;
      pts.push([(ring[i][0] + ring[j][0]) / 2, (ring[i][1] + ring[j][1]) / 2], ring[j]);
      i = j;
    }
    return { pts, km };
  };
  const fwd = walk(1), bwd = walk(-1);
  const pts = fwd.km <= bwd.km ? fwd.pts : bwd.pts;
  return measure(pts, (p) => {
    let best = Infinity;
    for (let i = from; i < to; i++) best = Math.min(best, pointSegKm(p, line[i], line[i + 1]).d);
    return best;
  });
}

// ── 검사 ─────────────────────────────────────────────────────
const f1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : '∞');
const pt = (p: P) => `[${p[0].toFixed(2)}, ${p[1].toFixed(2)}]`;

async function run(_ctx: Context, opt: Options): Promise<CheckResult> {
  const items: Item[] = [];
  const all = readTags(items);
  const tags = all.filter((t) => {
    if (!opt.region) return true;
    return unitOf(t.file) === opt.region || path.basename(t.file, '.mjs') === opt.region;
  });
  if (!tags.length) return { checked: 0, items, notes: [opt.region ? `꼬리표 0 (${opt.region} 범위)` : '꼬리표 0'] };

  // export 확인: 꼬리표 단 상수가 export가 아니면 값을 읽을 수 없다
  const exported = new Map<string, Set<string>>();
  const measurable: Tag[] = [];
  for (const t of tags) {
    if (!exported.has(t.file)) {
      const text = readFileSync(path.join(GEO_DIR, t.file), 'utf8');
      exported.set(t.file, new Set([...text.matchAll(/^export (?:const|let) (\w+) =/gm)].map((m) => m[1])));
    }
    if (exported.get(t.file)!.has(t.name)) measurable.push(t);
    else items.push({ key: `${path.basename(t.file)} ${t.name} export 없음`, msg: `${t.file}:${t.line} ${t.name}에 꼬리표가 있는데 export가 아님: export를 붙일 것 (검사가 모듈을 불러 값을 읽음. export를 더해도 data/geo 바이트는 그대로)` });
  }

  const rivers = measurable.some((t) => t.kind === '강')
    ? (existsSync(RIVERS_FILE) ? await loadRivers() : null)
    : new Map<string, SegIdx>();
  if (!rivers) items.push({ key: 'rivers.geojson 없음', msg: 'data/base/rivers/rivers.geojson이 없음: npm run prep:rivers로 만들 것' });
  const coasts = new Map<boolean, Coast>();
  const precision = loadZones();

  const mods = new Map<string, any>();
  let checked = 0;
  let worst: { name: string; ratio: number; max: number; tol: number } | null = null;
  for (const t of measurable) {
    if (t.kind === '강' && !rivers) continue;
    if (!mods.has(t.file)) {
      try { mods.set(t.file, await import(pathToFileURL(path.join(GEO_DIR, t.file)).href)); }
      catch (e) { mods.set(t.file, null); items.push({ key: `${path.basename(t.file)} 불러오기 실패`, msg: `${t.file}을 불러오지 못함: ${(e as Error).message}` }); }
    }
    const mod = mods.get(t.file);
    if (!mod) continue;
    const key = tagKey(t);
    const line = mod[t.name] as Line | undefined;
    if (!Array.isArray(line) || line.length < 2 || !Array.isArray(line[0]) || typeof line[0][0] !== 'number') {
      items.push({ key: `${key} 값 아님`, msg: `${t.file}:${t.line} ${t.name}이 [경도, 위도] 점 배열이 아님` });
      continue;
    }
    const [from, to] = t.range ?? [0, line.length - 1];
    if (!(from >= 0 && to < line.length && from < to)) {
      items.push({ key: `${key} 구간 범위`, msg: `${t.file}:${t.line} ${t.name} 구간 ${from}-${to}이 점 ${line.length}개 선의 범위 밖` });
      continue;
    }
    const tol = t.tol ?? zoneAt(line[from][0], line[from][1], precision).tests.lineTolKm[t.kind];
    const pts = sampleLine(line, from, to);
    let m: Measure;
    let extra = '';
    let over = false;
    if (t.kind === '강') {
      const idx = rivers!.get(t.river!);
      if (!idx) { items.push({ key: `${key} 기준 강 없음`, msg: `${t.file}:${t.line} 기준 강 '${t.river}'가 rivers.geojson에 없음: scripts/prep-rivers.mjs의 RIVER_SETS에 더하고 npm run prep:rivers` }); continue; }
      m = measure(pts, (p) => nearestKm(idx, p));
      over = m.max > tol;
    } else {
      const europe = path.basename(t.file) === 'europe.mjs';
      if (!coasts.has(europe)) coasts.set(europe, await loadCoast(europe));
      const coast = coasts.get(europe)!;
      m = measure(pts, (p) => nearestKm(coast.idx, p));
      over = m.max > tol;
      const back = coastToLine(coast, line, from, to, tol);
      if (back && back.max > tol) {
        over = true;
        extra = ` / 해안→선 최대 ${f1(back.max)}km(해안 ${pt(back.at)})`;
      }
    }
    // 평균 상한: 최대가 허용 안이어도 평균이 꼬리표 값을 넘으면 실패 (부동소수 오차 1e-9는 봐줌)
    const meanOver = t.meanCap !== null && m.mean > t.meanCap + 1e-9;
    if (meanOver) over = true;
    checked++;
    if (VERBOSE) console.error(`lines ${key.padEnd(44)} 점 ${String(m.n).padStart(3)} 최대 ${f1(m.max).padStart(5)} 평균 ${f1(m.mean).padStart(5)} (꼬리표용 ${(Math.ceil(m.mean * 10 - 1e-9) / 10).toFixed(1)}km) 허용 ${tol}`);
    const ratio = m.max / tol;
    if (!worst || ratio > worst.ratio) worst = { name: `${t.name} ${t.kind === '강' ? t.river : '해안'}`, ratio, max: m.max, tol };
    if (over) {
      const range = t.range ? ` 구간 ${from}-${to}` : '';
      items.push({ key, msg: `${t.name}${range} → ${t.kind === '강' ? `강 ${t.river}` : '해안'}: 최대 ${f1(m.max)}km (허용 ${tol}km), 평균 ${f1(m.mean)}km${meanOver ? ` (평균 허용 ${t.meanCap}km 넘음)` : ''}, 가장 먼 곳 ${pt(m.at)}${extra} [${t.file}:${t.line}]` });
    }
  }
  const notes = [`꼬리표 ${tags.length}개 (강 ${tags.filter((t) => t.kind === '강').length}·해안 ${tags.filter((t) => t.kind === '해안').length})`];
  if (worst) notes.push(`허용 대비 가장 큰 선 ${worst.name} ${f1(worst.max)}/${worst.tol}km`);
  return { checked, items, notes };
}

export const checks: Check[] = [{ id: 'lines', title: '손그림 선 기준선 거리 (강·해안)', run }];
