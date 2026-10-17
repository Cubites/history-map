// test:geo 검사 places (a-지점): 정답표(data/tests/places/*.yaml)의 지점이 그 해(또는 전쟁 보기 장면)에 기대한 소속인지 판정한다.
// 평소 지도는 data/geo 원자료로(빌드 불필요, 인계 pt-dh.mjs와 같은 짝홀 규칙·구멍 포함), 전쟁 보기는 public/data/wars.json과 wars/<id>.json으로 판정한다.
// 정답표 한 줄(YAML 목록의 항목):
//   - name: 서울                       # 필수
//     at: [126.98, 37.57]              # [경도, 위도] 필수
//     year: 1592                       # 평소 지도: year(정수) | years: [..] | range: [시작, 끝](양끝 포함, 주인이 바뀌는 해만 봄)
//     expect: joseon                   # 항목 id | [id, id](이 중 하나라도 덮으면 통과) | none(아무 항목도 덮지 않음)
//     url: https://ko.wikipedia.org/wiki/...   # 필수. 옛 지점을 가져온 것만 `url: 필요` + `legacy: true`
//     from: 세션 I1 결과노트           # 필수: 어느 세션·검토에서 온 지점인지
//     note: 임진왜란 전 한성            # 선택
//     tolerance: 2                     # 선택(km): 기대한 쪽 경계까지 이 거리 안이면 통과(경계에 가까운 지점)
//     region: europe                   # 선택: --region 거르기용(없으면 기대 항목의 권역)
//     (expect: none 지점은 region을 적어야 --region 거르기에 걸린다. 적지 않으면 --region을 줄 때 건너뜀)
//   전쟁 보기는 year 대신 war: world-war-2, date: 1943-07-10(장면 날짜 그대로), theater: europe(선택, 같은 날짜가 여러 전역에 있을 때),
//   expect: 진영 id | [진영 id, ..] | none | front(그 장면의 어느 진영 경계든 tolerance km 안, 기본 5)
// 전쟁 장면 도형은 npm run build:data가 만든다. 결과가 없거나, 빌드 기록(.cache/build-data-wars/built.json, scripts/build-data/war-inputs.ts)의 입력 해시가 지금 입력(전쟁 YAML·손그림 geojson·쓰는 나라 영토·빌드 코드)과 다르면
// 그 전쟁 지점은 건너뛴다. 평소에는 경고(머리 줄에 건너뜀 N, places 줄에 전쟁 건너뜀), --ci에서는 실패다(거짓 통과 방지). 파일 시각은 보지 않는다.
// `_`로 시작하는 파일은 읽지 않는다(검토 대기). 정답표 형식 오류는 실패 항목으로 나온다(허용 목록으로 덮을 수는 있음).
// 사용: npm run test:geo -- --only places [--region europe] [--years 1500-1600]
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Check, CheckResult, Item, Options } from '../types.ts';
import type { BBox, Context, GeoVersion, MultiCoords } from '../context.ts';
import { REGION_FILTER_OF } from '../../../src/schema/regions.ts';
import { readBuilt, shaOf, warInputHashes, type BuiltRecord } from '../../build-data/war-inputs.ts';

type Pt = [number, number];

interface Row {
  file: string;
  idx: number;
  name: string;
  at: Pt;
  years: number[] | null;
  range: [number, number] | null;
  war: string | null;
  date: string | null;
  theater: string | null;
  expect: string[];
  url: string;
  legacy: boolean;
  tolerance: number | null;
  region: string | null;
}

// ── 정답표 읽기와 형식 검사 ─────────────────────────────────

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const DATE_RE = /^-?\d+-\d{2}-\d{2}$/;

function placeFiles(root: string): string[] {
  const dir = path.join(root, 'data/tests/places');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.yaml') && !f.startsWith('_')).sort().map((f) => path.join(dir, f));
}

function parseRows(ctx: Context): { rows: Row[]; items: Item[] } {
  const rows: Row[] = [];
  const items: Item[] = [];
  const seen = new Set<string>();
  for (const file of placeFiles(ctx.root)) {
    const fname = path.basename(file);
    let raw: unknown;
    try {
      raw = parseYaml(readFileSync(file, 'utf8')) ?? [];
    } catch (e) {
      items.push({ key: `스키마 ${fname}`, msg: `${fname}: YAML 문법 오류 - ${(e as Error).message.split('\n')[0]}` });
      continue;
    }
    if (!Array.isArray(raw)) {
      items.push({ key: `스키마 ${fname}`, msg: `${fname}: 최상위는 목록이어야 함` });
      continue;
    }
    raw.forEach((r: Record<string, unknown>, idx) => {
      const label = `${fname}[${idx + 1}] ${r && typeof r === 'object' ? String(r.name ?? '') : ''}`.trim();
      const bad: string[] = [];
      if (!r || typeof r !== 'object' || Array.isArray(r)) {
        items.push({ key: `스키마 ${fname}[${idx + 1}]`, msg: `${label}: 항목이 매핑이 아님` });
        return;
      }
      if (!nonEmpty(r.name)) bad.push('name 필요');
      const at = r.at;
      if (!(Array.isArray(at) && at.length === 2 && isNum(at[0]) && isNum(at[1]) && Math.abs(at[0]) <= 180 && Math.abs(at[1]) <= 90)) bad.push('at은 [경도, 위도] 두 수');
      const timeKeys = ['year', 'years', 'range'].filter((k) => r[k] !== undefined);
      const isWar = r.war !== undefined || r.date !== undefined;
      let years: number[] | null = null;
      let range: [number, number] | null = null;
      if (isWar) {
        if (timeKeys.length) bad.push('war와 year/years/range는 함께 쓸 수 없음');
        if (!nonEmpty(r.war)) bad.push('war 필요');
        if (!(nonEmpty(r.date) && DATE_RE.test(r.date))) bad.push('date는 YYYY-MM-DD(wars.json 장면 날짜 그대로)');
        if (r.theater !== undefined && !nonEmpty(r.theater)) bad.push('theater는 글');
      } else {
        if (timeKeys.length !== 1) bad.push('year·years·range 가운데 하나(전쟁 지점은 war·date)');
        else if (r.year !== undefined) {
          if (isInt(r.year)) years = [r.year];
          else bad.push('year는 정수');
        } else if (r.years !== undefined) {
          if (Array.isArray(r.years) && r.years.length > 0 && r.years.every(isInt)) years = r.years as number[];
          else bad.push('years는 정수 목록');
        } else if (r.range !== undefined) {
          const g = r.range;
          if (Array.isArray(g) && g.length === 2 && isInt(g[0]) && isInt(g[1]) && g[0] <= g[1]) range = [g[0], g[1]];
          else bad.push('range는 [시작, 끝] 정수(시작 ≤ 끝)');
        }
      }
      let expect: string[] = [];
      if (nonEmpty(r.expect)) expect = [r.expect];
      else if (Array.isArray(r.expect) && r.expect.length > 0 && r.expect.every(nonEmpty)) expect = r.expect as string[];
      else bad.push('expect 필요(항목 id | [id, ..] | none | front)');
      if (expect.includes('none') && expect.length > 1) bad.push('none은 다른 값과 함께 쓸 수 없음');
      if (expect.includes('front') && (expect.length > 1 || !isWar)) bad.push('front는 전쟁 지점에서만, 단독으로');
      if (!isWar) {
        for (const id of expect) if (id !== 'none' && !ctx.entities.has(id)) bad.push(`없는 항목 id '${id}'`);
      }
      const legacy = r.legacy === true;
      if (r.legacy !== undefined && typeof r.legacy !== 'boolean') bad.push('legacy는 true/false');
      const url = r.url;
      if (!nonEmpty(url)) bad.push('url 필수(옛 지점만 `url: 필요` + legacy: true)');
      else if (url === '필요') {
        if (!legacy) bad.push('`url: 필요`는 legacy: true인 옛 지점만');
      } else if (!/^https?:\/\/\S+$/.test(url)) bad.push('url은 http(s):// 주소(또는 legacy의 `필요`)');
      if (!nonEmpty(r.from)) bad.push('from 필요(어느 세션·검토에서 왔는지)');
      if (r.tolerance !== undefined && !(isNum(r.tolerance) && r.tolerance >= 0)) bad.push('tolerance는 0 이상의 수(km)');
      if (r.note !== undefined && typeof r.note !== 'string') bad.push('note는 글');
      if (r.region !== undefined && !nonEmpty(r.region)) bad.push('region은 글');
      const allowed = new Set(['name', 'at', 'year', 'years', 'range', 'war', 'date', 'theater', 'expect', 'url', 'from', 'note', 'tolerance', 'legacy', 'region']);
      for (const k of Object.keys(r)) if (!allowed.has(k)) bad.push(`모르는 필드 '${k}'`);
      if (bad.length) {
        items.push({ key: `스키마 ${fname}[${idx + 1}] ${String(r.name ?? '')}`.trim(), msg: `${label}: ${bad.join(', ')}` });
        return;
      }
      const row: Row = {
        file: fname,
        idx,
        name: r.name as string,
        at: [(at as number[])[0], (at as number[])[1]],
        years,
        range,
        war: isWar ? (r.war as string) : null,
        date: isWar ? (r.date as string) : null,
        theater: typeof r.theater === 'string' ? r.theater : null,
        expect,
        url: url as string,
        legacy,
        tolerance: r.tolerance === undefined ? null : (r.tolerance as number),
        region: typeof r.region === 'string' ? r.region : null,
      };
      const dup = `${row.war ? `${row.war}/${row.theater ?? ''} ${row.date}` : `${row.years ?? row.range}`} ${coordKey(row)}`;
      if (seen.has(dup)) {
        items.push({ key: `스키마 중복 ${fname}[${idx + 1}] ${row.name}`, msg: `${label}: 같은 해·같은 좌표·같은 이름의 지점이 또 있음` });
        return;
      }
      seen.add(dup);
      rows.push(row);
    });
  }
  return { rows, items };
}

const coordKey = (r: Row) => `${r.name} [${r.at[0].toFixed(2)},${r.at[1].toFixed(2)}]`;

// ── 도형 판정 ────────────────────────────────────────────────

function inRing(p: Pt, ring: number[][]): boolean {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const polyBoxes = new WeakMap<object, BBox>();
function polyBox(poly: number[][][]): BBox {
  let b = polyBoxes.get(poly);
  if (!b) {
    let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
    for (const [x, y] of poly[0]) {
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    }
    b = [w, s, e, n];
    polyBoxes.set(poly, b);
  }
  return b;
}

/** 점이 도형(MultiPolygon) 안인가: 바깥 고리 안이고 구멍 밖 */
function inMulti(p: Pt, m: MultiCoords): boolean {
  for (const poly of m) {
    const b = polyBox(poly);
    if (p[0] < b[0] || p[0] > b[2] || p[1] < b[1] || p[1] > b[3]) continue;
    if (inRing(p, poly[0]) && !poly.slice(1).some((h) => inRing(p, h))) return true;
  }
  return false;
}

/** 점에서 도형 경계까지 거리(km, 국지 등장방형 근사). 위도 차가 2도 넘는 변은 건너뛴다 */
function distKm(p: Pt, m: MultiCoords): number {
  const k = Math.cos((p[1] * Math.PI) / 180) * 111.32;
  const h = 110.57;
  let best = Infinity;
  for (const poly of m) {
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1];
        const b = ring[i];
        if (Math.abs(a[1] - p[1]) > 2 && Math.abs(b[1] - p[1]) > 2) continue;
        const ax = (a[0] - p[0]) * k, ay = (a[1] - p[1]) * h, bx = (b[0] - p[0]) * k, by = (b[1] - p[1]) * h;
        const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
        let t = L ? -(ax * dx + ay * dy) / L : 0;
        t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(ax + t * dx, ay + t * dy);
        if (d < best) best = d;
      }
    }
  }
  return best;
}

const fmtKm = (d: number) => (Number.isFinite(d) ? `${d.toFixed(1)}km` : '멂');
const activeAt = (v: { from: number; to: number | null }, year: number) => v.from <= year && (v.to === null || year < v.to);

// ── 평소 지도 ────────────────────────────────────────────────

function sampleYears(row: Row, covering: GeoVersion[], opt: Options): number[] {
  const within = (y: number) => !opt.years || (y >= opt.years[0] && y <= opt.years[1]);
  if (row.years) return [...new Set(row.years)].filter(within).sort((a, b) => a - b);
  const [a, b] = row.range!;
  const lo = opt.years ? Math.max(a, opt.years[0]) : a;
  const hi = opt.years ? Math.min(b, opt.years[1]) : b;
  if (lo > hi) return [];
  // 주인이 바뀌는 해만: 시작 해와, 그 점을 덮는 버전이 시작·끝나는 해
  const ys = new Set<number>([lo]);
  for (const v of covering) {
    for (const y of [v.from, v.to]) if (y !== null && y > lo && y <= hi) ys.add(y);
  }
  return [...ys].sort((x, y) => x - y);
}

function judgeNormal(ctx: Context, row: Row, opt: Options): { checked: boolean; items: Item[] } {
  const p = row.at;
  const covering = ctx.geo.filter((v) => p[0] >= v.box[0] && p[0] <= v.box[2] && p[1] >= v.box[1] && p[1] <= v.box[3] && inMulti(p, v.coords));
  const out: Item[] = [];
  const years = sampleYears(row, covering, opt);
  const exp = row.expect.join('|');
  for (const year of years) {
    const got = [...new Set(covering.filter((v) => activeAt(v, year)).map((v) => v.entityId))];
    let ok = row.expect[0] === 'none' ? got.length === 0 : row.expect.some((id) => got.includes(id));
    let extra = '';
    if (!ok && row.tolerance !== null && row.tolerance > 0) {
      // 기대한 쪽(none이면 지금 덮는 쪽) 경계까지 거리가 tolerance 안이면 통과
      const near = row.expect[0] === 'none' ? ctx.geo.filter((v) => got.includes(v.entityId) && activeAt(v, year)) : ctx.geo.filter((v) => row.expect.includes(v.entityId) && activeAt(v, year));
      const d = Math.min(Infinity, ...near.map((v) => distKm(p, v.coords)));
      if (d <= row.tolerance) ok = true;
      else extra = ` (경계까지 ${fmtKm(d)}, 허용 ${row.tolerance}km)`;
    } else if (!ok && row.expect[0] !== 'none') {
      const near = ctx.geo.filter((v) => row.expect.includes(v.entityId) && activeAt(v, year));
      if (near.length) extra = ` (기대 쪽 경계까지 ${fmtKm(Math.min(...near.map((v) => distKm(p, v.coords))))})`;
    }
    if (!ok) {
      out.push({
        key: `${year} ${coordKey(row)}`,
        msg: `${year} ${coordKey(row)} 기대 ${exp}, 실제 ${got.length ? got.join('+') : '없음'}${extra} [${row.file}${row.legacy ? ' · 근거 URL 필요' : ''}]`,
      });
    }
  }
  return { checked: years.length > 0, items: out };
}

// ── 전쟁 보기 ────────────────────────────────────────────────

interface WarScene {
  date: string;
  areas: { faction: string; coords: MultiCoords }[];
}
interface WarData {
  id: string;
  region: string;
  factions: Set<string>;
  theaters: Map<string, { region: string; scenes: Map<string, WarScene> }>;
}

type WarLoad = { ok: true; data: WarData } | { ok: false; reason: string };

/**
 * 전쟁 결과가 지금 입력으로 만든 것이 아닌 이유(한국어 한 줄), 맞으면 null. places의 판정이고 npm run finish:border(scripts/finish-border.ts)도 같은 함수로 다시 빌드할 전쟁을 고른다.
 * entry는 wars.json 안 그 전쟁 항목, rec는 빌드 기록의 그 전쟁, inputHash는 warInputHashes의 그 전쟁 값, shapesBytes는 public/data/wars/<id>.json 바이트
 */
export function warStaleReason(entry: unknown, rec: BuiltRecord | undefined, inputHash: string | undefined, shapesBytes: Buffer): string | null {
  return !rec
    ? '빌드 기록(.cache/build-data-wars/built.json)에 없음'
    : rec.inputs !== inputHash
      ? '입력(전쟁 YAML·손그림 geojson·나라 영토·빌드 코드)이 마지막 빌드 뒤에 바뀜'
      : rec.shapes !== shaOf(shapesBytes) || rec.entry !== shaOf(JSON.stringify(entry))
        ? 'public/data의 결과가 마지막 빌드의 것과 다름'
        : null;
}

function loadWars(root: string): Map<string, WarLoad> {
  const out = new Map<string, WarLoad>();
  const idx = path.join(root, 'public/data/wars.json');
  if (!existsSync(idx)) return out;
  const built = readBuilt(root);
  const inputs = warInputHashes(root);
  const index = JSON.parse(readFileSync(idx, 'utf8')) as {
    id: string;
    region: string;
    factions: { id: string }[];
    theaters: { id: string; region?: string; snapshots: { date: string; areas: { faction: string }[] }[] }[];
  }[];
  for (const w of index) {
    const shapesFile = path.join(root, 'public/data/wars', `${w.id}.json`);
    if (!existsSync(shapesFile)) {
      out.set(w.id, { ok: false, reason: `public/data/wars/${w.id}.json 없음` });
      continue;
    }
    const rec = built[w.id];
    const shapesBytes = readFileSync(shapesFile);
    const stale = warStaleReason(w, rec, inputs.get(w.id), shapesBytes);
    if (stale) {
      out.set(w.id, { ok: false, reason: stale });
      continue;
    }
    const shapes = JSON.parse(shapesBytes.toString('utf8')) as Record<string, MultiCoords[][]>;
    const theaters = new Map<string, { region: string; scenes: Map<string, WarScene> }>();
    for (const t of w.theaters) {
      const scenes = new Map<string, WarScene>();
      t.snapshots.forEach((s, si) => {
        scenes.set(s.date, { date: s.date, areas: s.areas.map((a, ai) => ({ faction: a.faction, coords: shapes[t.id]?.[si]?.[ai] ?? [] })) });
      });
      theaters.set(t.id, { region: t.region ?? w.region, scenes });
    }
    out.set(w.id, { ok: true, data: { id: w.id, region: w.region, factions: new Set(w.factions.map((f) => f.id)), theaters } });
  }
  return out;
}

const yearOfDate = (d: string) => Number(d.match(/^(-?\d+)-/)![1]);

function warRegionIncluded(opt: Options, region: string): boolean {
  if (opt.region === null) return true;
  const unit = Object.hasOwn(REGION_FILTER_OF, region) ? REGION_FILTER_OF[region] : null;
  return region === opt.region || unit === opt.region;
}

function judgeWar(row: Row, w: WarData): { checked: boolean; item: Item | null } {
  const label = `${row.war}`;
  let theaterId = row.theater;
  if (theaterId === null) {
    const cands = [...w.theaters].filter(([, t]) => t.scenes.has(row.date!)).map(([id]) => id);
    if (cands.length === 1) theaterId = cands[0];
    else {
      const msg = cands.length === 0 ? `전쟁 ${label}에 ${row.date} 장면이 없음` : `전쟁 ${label}의 ${row.date} 장면이 여러 전역(${cands.join(', ')})에 있음 — theater를 적을 것`;
      return { checked: false, item: { key: `${label}/? ${row.date} ${coordKey(row)}`, msg: `${row.date} ${coordKey(row)}: ${msg} [${row.file}]` } };
    }
  }
  const theater = w.theaters.get(theaterId);
  const scene = theater?.scenes.get(row.date!);
  const key = `${label}/${theaterId} ${row.date} ${coordKey(row)}`;
  if (!theater || !scene) {
    return { checked: false, item: { key, msg: `${row.date} ${label}/${theaterId} ${coordKey(row)}: 전역 또는 ${row.date} 장면이 없음 [${row.file}]` } };
  }
  const front = row.expect[0] === 'front';
  if (!front) {
    for (const f of row.expect) {
      if (f !== 'none' && !w.factions.has(f)) return { checked: false, item: { key, msg: `${row.date} ${label}/${theaterId} ${coordKey(row)}: 없는 진영 '${f}' [${row.file}]` } };
    }
  }
  const p = row.at;
  const hit = scene.areas.filter((a) => inMulti(p, a.coords)).map((a) => a.faction);
  // 뒤에 오는 지역이 앞의 지역을 덮는다(빌드와 같은 규칙): 겹치면 마지막
  const got = hit.length ? hit[hit.length - 1] : 'none';
  const tol = row.tolerance ?? (front ? 5 : 0);
  let ok: boolean;
  let extra = '';
  if (front) {
    const d = Math.min(Infinity, ...scene.areas.map((a) => distKm(p, a.coords)));
    ok = d <= tol;
    extra = ` (가장 가까운 진영 경계까지 ${fmtKm(d)}, 허용 ${tol}km)`;
  } else {
    ok = row.expect.includes(got);
    if (!ok) {
      const near = row.expect[0] === 'none' ? scene.areas.filter((a) => a.faction === got) : scene.areas.filter((a) => row.expect.includes(a.faction));
      const d = Math.min(Infinity, ...near.map((a) => distKm(p, a.coords)));
      if (tol > 0 && d <= tol) ok = true;
      else if (Number.isFinite(d)) extra = ` (${row.expect[0] === 'none' ? got : '기대'} 쪽 경계까지 ${fmtKm(d)}${tol > 0 ? `, 허용 ${tol}km` : ''})`;
    }
  }
  if (ok) return { checked: true, item: null };
  return {
    checked: true,
    item: {
      key,
      msg: `${row.date} ${label}/${theaterId} ${coordKey(row)} 기대 ${row.expect.join('|')}, 실제 ${got}${extra} [${row.file}${row.legacy ? ' · 근거 URL 필요' : ''}]`,
    },
  };
}

// ── 검사 ─────────────────────────────────────────────────────

async function runPlaces(ctx: Context, opt: Options): Promise<CheckResult> {
  const { rows, items } = parseRows(ctx);
  const notes: string[] = [];
  let normal = 0;
  let wars = 0;
  let legacy = 0;
  let skippedWar = 0;

  const normalRows = rows.filter((r) => !r.war);
  const warRows = rows.filter((r) => r.war);

  for (const row of normalRows) {
    // 거르기: 권역(명시 region 또는 기대 항목의 권역)
    if (opt.region !== null) {
      const ids = row.expect.filter((e) => e !== 'none');
      const inRegion = row.region ? row.region === opt.region : ids.length > 0 && ids.some((id) => ctx.inRegion(id));
      if (!inRegion) continue;
    }
    const r = judgeNormal(ctx, row, opt);
    if (!r.checked) continue;
    normal++;
    if (row.url === "필요") legacy++;
    items.push(...r.items);
  }

  if (warRows.length) {
    const wd = loadWars(ctx.root);
    const skipped = new Map<string, { n: number; reason: string }>();
    for (const row of warRows) {
      if (!ctx.inYears(yearOfDate(row.date!))) continue;
      const w = wd.get(row.war!);
      if (!w) {
        const s = skipped.get(row.war!) ?? { n: 0, reason: wd.size ? 'wars.json에 그 전쟁이 없음' : 'public/data/wars.json 없음' };
        s.n++;
        skipped.set(row.war!, s);
        continue;
      }
      if (!w.ok) {
        const s = skipped.get(row.war!) ?? { n: 0, reason: w.reason };
        s.n++;
        skipped.set(row.war!, s);
        continue;
      }
      if (opt.region !== null) {
        const region = row.region ? row.region : (row.theater ? w.data.theaters.get(row.theater)?.region : undefined) ?? w.data.region;
        if (!warRegionIncluded(opt, region)) continue;
      }
      const r = judgeWar(row, w.data);
      if (r.checked) {
        wars++;
        if (row.url === "필요") legacy++;
      }
      if (r.item) items.push(r.item);
    }
    for (const [id, s] of skipped) {
      skippedWar += s.n;
      items.push({
        key: `건너뜀 ${id}`,
        msg: `전쟁 ${id} 지점 ${s.n}개 건너뜀 (${s.reason}). 먼저 npm run build:data -- --war ${id} (또는 npm run build:data)`,
        // --ci에서는 건너뛴 채 통과하면 안 되므로 실패로 낸다
        warn: !opt.ci,
      });
    }
  }

  notes.push(`평소 ${normal.toLocaleString()}·전쟁 ${wars.toLocaleString()}${skippedWar ? ` · 전쟁 건너뜀 ${skippedWar.toLocaleString()}` : ''}`);
  if (legacy) notes.push(`근거 URL 필요 ${legacy.toLocaleString()}`);
  return { checked: normal + wars, items, notes, skipped: skippedWar };
}

export const checks: Check[] = [{ id: 'places', title: '지점 정답표 (평소 지도·전쟁 보기)', run: runPlaces }];
