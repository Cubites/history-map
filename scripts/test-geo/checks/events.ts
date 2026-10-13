// test:geo 검사 d. 사건 연결 (설계 3.3d): 나라의 성립·소멸과 영토 버전의 큰 변화가 사건과 이어져 있는지 본다.
// 인계 도구 lifecycle.mjs·versions2.mjs를 그대로 옮긴 것이다(출력 줄이 같아야 함 — 같은 줄을 만드는 lifecycleLines·versionLines를 내보내 둠).
// 사용: npm run test:geo -- --only events [--region europe] [--years 1500-1600]
//  - 성립·소멸: 나라의 from(성립)·to(소멸) ±2년에 사건 기간이 걸치고 그 나라가 사건의 subjects 또는 links에 있어야 한다. 열쇠 `<해> <id> 성립|소멸`
//  - 버전 해: 같은 나라의 앞 영토 버전과 대칭차 넓이가 1만 km² 이상인데 ±2년에 그 나라가 subjects인 사건이 없으면 항목. 열쇠 `<해> <id> 버전`
//    넓이는 versions2.mjs와 같은 평면 근사(고리 평균 위도)이고, 1만 km² 판단이 이 공식으로 내려졌으므로 geo.ts의 areaKm2로 바꾸지 말 것.
//    polyclip이 예외를 내면 `<해> <id> 계산실패` 항목(도구는 -1로 삼키고 줄을 숨김).
//  - 대칭차 넓이는 나라 파일 텍스트 해시로 .cache/test-geo/xor/에 둔다(파일이 바뀐 나라만 다시 계산).
//  - 의도한 예외는 data/tests/allow/events.yaml에 이유와 함께 적는다.
// 직접 실행하면 도구와 같은 줄을 출력한다: node scripts/test-geo/checks/events.ts life|versions <시작 해> <끝 해> [최소 km²]
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import * as pc from 'polyclip-ts';
import { REGION_FILTER_OF } from '../../../src/schema/regions.ts';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const XOR_DIR = path.join(ROOT, '.cache/test-geo/xor');
/** 이 값을 올리면 대칭차 캐시가 모두 무효가 된다(계산 방법을 바꿀 때) */
const XOR_CODE = 'xor 1';
/** 버전 해 판단 기준: 앞 버전과 대칭차가 이 넓이(km²) 이상 */
const BIG_KM2 = 10000;

interface Ent { id: string; from: number | null; to: number | null; names: { ko: string }; file: string; [k: string]: unknown }
interface Ev { id: string; year: number; endYear?: number; subjects: string[]; links?: { from: string; to: string }[]; f: string }

const list = (dir: string) => readdirSync(path.join(ROOT, dir));
const loadEntities = (): Ent[] => list('data/entities').flatMap((f) => (parseYaml(readFileSync(path.join(ROOT, 'data/entities', f), 'utf8')) as Ent[]).map((e) => ({ ...e, file: f })));
const loadEvents = (): Ev[] => list('data/events').flatMap((f) => (parseYaml(readFileSync(path.join(ROOT, 'data/events', f), 'utf8')) as Ev[]).map((e) => ({ ...e, f })));

/** --region 값이 이 나라 파일(data/entities/<이름>.yaml)을 고르는가: 파일 이름이거나 화면 권역 필터(east-asia·europe) */
function regionOk(region: string | null, file: string): boolean {
  if (region === null) return true;
  const name = file.replace(/\.yaml$/, '');
  return name === region || REGION_FILTER_OF[name] === region;
}

// ── lifecycle.mjs ───────────────────────────────────────────

/** lifecycle.mjs와 같은 줄(성립·소멸 + 이어진 사건). hit=false면 subjects에도 links에도 연결 사건이 없는 줄 */
export function lifecycleRows(y0: number, y1: number, region: string | null = null): { line: string; year: number; id: string; kind: string; ko: string; hit: boolean }[] {
  const ents = loadEntities();
  const evs = loadEvents();
  const rows: { line: string; year: number; id: string; kind: string; ko: string; hit: boolean }[] = [];
  for (const e of ents) {
    if (!regionOk(region, e.file)) continue;
    for (const [kind, y] of [['성립', e.from], ['소멸', e.to]] as [string, number | null][]) {
      if (y == null || y < y0 || y > y1) continue;
      const near = (ev: Ev) => ev.year <= y + 2 && (ev.endYear ?? ev.year) >= y - 2;
      const subj = evs.filter((ev) => ev.subjects.includes(e.id) && near(ev));
      const link = evs.filter((ev) => !ev.subjects.includes(e.id) && (ev.links ?? []).some((l) => l.from === e.id || l.to === e.id) && near(ev));
      const fmt = (h: Ev) => `${h.id}(${h.year}${h.endYear ? '~' + h.endYear : ''})`;
      rows.push({
        line: `${kind}\t${y}\t${e.id}\t${e.names.ko}\t${[...subj.map(fmt), ...link.map((h) => fmt(h) + '[links만]')].join(', ') || '없음'}`,
        year: y, id: e.id, kind, ko: e.names.ko, hit: subj.length + link.length > 0,
      });
    }
  }
  rows.sort((a, b) => a.year - b.year);
  return rows;
}
export const lifecycleLines = (y0: number, y1: number, region: string | null = null) => lifecycleRows(y0, y1, region).map((r) => r.line);

// ── versions2.mjs ───────────────────────────────────────────

type Multi = number[][][][];
const asMulti = (g: { type: string; coordinates: unknown }): Multi => (g.type === 'Polygon' ? [g.coordinates as number[][][]] : (g.coordinates as Multi));
function ringArea(ring: number[][]): number {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return Math.abs(s / 2);
}
/** versions2.mjs의 넓이: 폴리곤마다 바깥 고리 평균 위도의 평면 근사 */
function area(multi: Multi): number {
  let t = 0;
  for (const poly of multi) {
    const lat = poly[0].reduce((s, p) => s + p[1], 0) / poly[0].length;
    const k = 111.32 * 111.32 * Math.cos((lat * Math.PI) / 180);
    poly.forEach((r, i) => {
      t += (i === 0 ? 1 : -1) * ringArea(r) * k;
    });
  }
  return t;
}

let polyclipVersion = '';
function polyclipId(): string {
  if (!polyclipVersion) polyclipVersion = (JSON.parse(readFileSync(path.join(ROOT, 'node_modules/polyclip-ts/package.json'), 'utf8')) as { version: string }).version;
  return polyclipVersion;
}

export interface XorStats { hit: number; computed: number }
/** 나라 하나의 버전 해별 대칭차 넓이 [해, 넓이(-1은 계산 실패)] — 그 나라 파일 텍스트가 같으면 캐시에서 읽는다 */
function xorTable(e: Ent, stats: XorStats): [number, number][] | null {
  let text: string;
  try {
    text = readFileSync(path.join(ROOT, 'data/geo', `${e.id}.geojson`), 'utf8');
  } catch {
    return null;
  }
  const key = createHash('sha256').update([XOR_CODE, polyclipId(), String(e.from), text].join('\0')).digest('hex');
  const file = path.join(XOR_DIR, `${key}.json`);
  if (existsSync(file)) {
    try {
      const c = JSON.parse(readFileSync(file, 'utf8')) as { rows: [number, number][] };
      stats.hit++;
      return c.rows;
    } catch {
      // 깨진 캐시는 다시 계산
    }
  }
  const g = JSON.parse(text) as { features: { properties: { from: number; to: number | null }; geometry: { type: string; coordinates: unknown } }[] };
  const fs = g.features.map((f) => ({ from: f.properties.from, to: f.properties.to, geom: asMulti(f.geometry) })).sort((a, b) => a.from - b.from);
  const byFrom = new Map<number, Multi>();
  for (const f of fs) byFrom.set(f.from, (byFrom.get(f.from) ?? []).concat(f.geom));
  const years = [...byFrom.keys()].sort((a, b) => a - b);
  const rows: [number, number][] = [];
  for (const y of years) {
    if (y === e.from) continue;
    const prevYear = [...years].reverse().find((v) => v < y);
    let diff: number;
    try {
      const cur = byFrom.get(y)!;
      const prev = prevYear != null ? byFrom.get(prevYear)! : [];
      diff = area(pc.xor(cur as pc.Geom, prev as pc.Geom) as Multi);
    } catch {
      diff = -1;
    }
    rows.push([y, diff]);
  }
  stats.computed++;
  mkdirSync(XOR_DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ rows }));
  renameSync(tmp, file);
  return rows;
}

/** versions2.mjs와 같은 줄과 판단 재료. diff<min인 줄은 도구처럼 뺀다(계산 실패 -1 포함) */
export function versionRows(y0: number, y1: number, min = 0, region: string | null = null, stats: XorStats = { hit: 0, computed: 0 }) {
  const ents = loadEntities();
  const evs = loadEvents();
  const rows: { line: string; year: number; id: string; diff: number; hit: string[] }[] = [];
  for (const e of ents) {
    if (!regionOk(region, e.file)) continue;
    const table = xorTable(e, stats);
    if (!table) continue;
    for (const [y, diff] of table) {
      if (y < y0 || y > y1 || diff < min) continue;
      const hit = evs.filter((ev) => ev.subjects.includes(e.id) && ev.year <= y + 2 && (ev.endYear ?? ev.year) >= y - 2).map((h) => h.id);
      rows.push({ line: `${y}\t${e.id}\t${e.names.ko}\t${Math.round(diff)}\t${hit.length ? hit.join(', ') : '없음'}`, year: y, id: e.id, diff, hit });
    }
  }
  rows.sort((a, b) => a.year - b.year);
  return rows;
}
export const versionLines = (y0: number, y1: number, min = 0, region: string | null = null) => versionRows(y0, y1, min, region).map((r) => r.line);

// ── 검사 ────────────────────────────────────────────────────

const events: Check = {
  id: 'events',
  title: '사건 연결 (성립·소멸, 1만 km² 버전 해)',
  async run(_ctx: Context, opt: Options): Promise<CheckResult> {
    const [y0, y1] = opt.years ?? [-Infinity, Infinity];
    const items: Item[] = [];
    const life = lifecycleRows(y0, y1, opt.region);
    for (const r of life) if (!r.hit) items.push({ key: `${r.year} ${r.id} ${r.kind}`, msg: `${r.year}년 ${r.ko}(${r.id}) ${r.kind}: ±2년에 subjects·links로 이어진 사건이 없음` });
    const stats: XorStats = { hit: 0, computed: 0 };
    // 계산 실패(-1)도 보려고 최소 넓이를 -1로 받는다
    const ver = versionRows(y0, y1, -1, opt.region, stats);
    let big = 0;
    for (const r of ver) {
      if (r.diff < 0) {
        items.push({ key: `${r.year} ${r.id} 계산실패`, msg: `${r.year}년 ${r.id}: 앞 버전과 대칭차 계산 실패(polyclip 예외)` });
        continue;
      }
      if (r.diff < BIG_KM2) continue;
      big++;
      if (!r.hit.length) items.push({ key: `${r.year} ${r.id} 버전`, msg: `${r.year}년 ${r.id}: 앞 버전과 대칭차 약 ${Math.round(r.diff).toLocaleString('en-US')}km²인데 ±2년에 subjects 사건이 없음` });
    }
    return {
      checked: life.length + ver.length,
      items,
      notes: [`성립·소멸 ${life.length}줄`, `버전 해 ${ver.length}줄(1만 km² 이상 ${big})`, `대칭차 캐시 ${stats.hit}·계산 ${stats.computed}`],
    };
  },
};

export const checks: Check[] = [events];

// 직접 실행: 도구(lifecycle.mjs·versions2.mjs)와 같은 줄을 출력한다
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [mode, a, b, c] = process.argv.slice(2);
  const [y0, y1] = [Number(a ?? -9999), Number(b ?? 9999)];
  if (mode === 'life') console.log(lifecycleLines(y0, y1).join('\n'));
  else if (mode === 'versions') console.log(versionLines(y0, y1, Number(c ?? 0)).join('\n'));
  else throw new Error('사용: node scripts/test-geo/checks/events.ts life|versions <시작 해> <끝 해> [최소 km²]');
}
