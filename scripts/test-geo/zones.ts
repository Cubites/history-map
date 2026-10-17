// 정밀도 구역 읽기 (docs/guides/standards.md 2절·11절). 파일 data/tests/zones.yaml의 형식은 그 파일 머리 주석에 있다.
// 쓰는 곳: test:geo의 islands·gaps·lines(checks/shapes.ts·lines.ts), scripts/area-geo.ts, 인계 폴더 도구. 직접 실행하는 파일이 아님.
// 가져다 쓰는 법:
//   import { loadZones, zoneAt } from './zones.ts';
//   const hit = zoneAt(lon, lat);              // { id, grade, gradeValues, tests } — 점이 든 첫 구역, 없으면 기본 등급(id 'default')
//   hit.gradeValues.landKm2 / .lineMaxKm / .islandKm2 …  끝 기준(고칠지 정하는 값)
//   hit.tests.islandKm2 / .gapMinKm2 / .gapGrowKm2 / .lineTolKm['강']  test:geo 검사 값(구역 tests가 기본 tests를 덮어쓴 것)
// - loadZones()는 파일을 읽고 형식을 검사한다(처음 한 번만, 같은 파일은 캐시). 틀리면 ZonesError(분명한 한국어 메시지, 스택 없음)를 던진다.
//   test:geo는 이 예외를 검사 오류로 보여 종료 코드 2로 끝낸다.
// - 지역 이름은 코드에 없다. 구역은 모두 파일에서 온다. 점-다각형 판정은 짝홀(even-odd) 규칙이며 경계 위의 점은 어느 쪽이든 될 수 있다.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

/** 구역 파일의 저장소 안 경로 */
export const ZONES_REL = 'data/tests/zones.yaml';
export const ZONES_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', ZONES_REL);

/** 어느 구역에도 들지 않는 점의 구역 id */
export const DEFAULT_ZONE_ID = 'default';

type Pt = [number, number];

/** 끝 기준 (standards.md 2절 표) */
export interface GradeValues {
  label: string;
  /** 땅(잘못 칠함·빈 땅)을 고칠 최소 넓이 km² */
  landKm2: number;
  /** 해 어긋남: [최소 넓이 km², 햇수] 쌍. 그 넓이 이상이 사료와 그 햇수보다 더 다를 때 고침 */
  shift: [number, number][];
  lineMeanKm: number;
  lineMaxKm: number;
  /** 고칠 섬의 최소 넓이 km². 0이면 크기 무관 */
  islandKm2: number;
}

/** test:geo 검사 값 */
export interface TestValues {
  /** [최소, 최대] km²: 사라진 섬 검사에 넣는 land-50m 섬의 넓이 범위 */
  islandKm2: [number, number];
  gapMinKm2: number;
  gapGrowKm2: number;
  lineTolKm: { 강: number; 해안: number };
}

export interface Zone {
  id: string;
  grade: string;
  note: string;
  polygon: Pt[];
  /** 파일 위쪽 기본 tests에 이 구역의 tests를 덮어 합친 값 */
  tests: TestValues;
}

export interface ZonesConfig {
  /** 읽은 파일 경로 */
  file: string;
  grades: Record<string, GradeValues>;
  defaultGrade: string;
  /** 기본 검사 값 */
  tests: TestValues;
  zones: Zone[];
}

/** 점이 든 구역 */
export interface ZoneHit {
  /** 구역 id. 어느 구역에도 들지 않으면 'default' */
  id: string;
  grade: string;
  gradeValues: GradeValues;
  tests: TestValues;
}

/** 구역 파일 형식 오류. 스택 없이 메시지만 보이게 한다(러너가 스택 앞 3줄을 보임) */
export class ZonesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZonesError';
    this.stack = message;
  }
}

// ── 형식 검사 ────────────────────────────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const fin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** 모아 두었다가 한꺼번에 보이는 검사 도우미 */
class Checker {
  errs: string[] = [];
  bad(where: string, why: string): void {
    this.errs.push(`${where}: ${why}`);
  }
  /** 허용한 칸 이름 밖의 칸이 있으면 오류 (이름 오타 잡기) */
  keys(o: Record<string, unknown>, allowed: readonly string[], where: string, required: readonly string[] = []): void {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) this.bad(where, `모르는 칸 '${k}' (쓸 수 있는 칸: ${allowed.join(', ')})`);
    for (const k of required) if (!(k in o)) this.bad(where, `'${k}' 칸이 필요함`);
  }
  num(v: unknown, where: string, min = 0): number {
    if (!fin(v) || v < min) {
      this.bad(where, `${min} 이상의 숫자여야 함 (받은 값: ${JSON.stringify(v)})`);
      return min;
    }
    return v;
  }
}

function parseGrade(c: Checker, id: string, v: unknown): GradeValues {
  const where = `grades.${id}`;
  const out: GradeValues = { label: id, landKm2: 0, shift: [], lineMeanKm: 0, lineMaxKm: 0, islandKm2: 0 };
  if (!isObj(v)) {
    c.bad(where, '칸 이름: 값 꼴(label·landKm2·shift·lineMeanKm·lineMaxKm·islandKm2)이어야 함');
    return out;
  }
  c.keys(v, ['label', 'landKm2', 'shift', 'lineMeanKm', 'lineMaxKm', 'islandKm2'], where, ['label', 'landKm2', 'shift', 'lineMeanKm', 'lineMaxKm', 'islandKm2']);
  if (typeof v.label === 'string' && v.label.trim()) out.label = v.label;
  else if ('label' in v) c.bad(`${where}.label`, '글이어야 함');
  out.landKm2 = c.num(v.landKm2, `${where}.landKm2`);
  out.lineMeanKm = c.num(v.lineMeanKm, `${where}.lineMeanKm`);
  out.lineMaxKm = c.num(v.lineMaxKm, `${where}.lineMaxKm`);
  out.islandKm2 = c.num(v.islandKm2, `${where}.islandKm2`);
  if ('shift' in v) {
    if (!Array.isArray(v.shift) || !v.shift.every((p) => Array.isArray(p) && p.length === 2 && fin(p[0]) && fin(p[1]) && p[0] >= 0 && p[1] >= 0)) c.bad(`${where}.shift`, '[[최소 넓이 km², 햇수], ...] 꼴이어야 함');
    else out.shift = v.shift.map((p) => [p[0], p[1]] as [number, number]);
  }
  return out;
}

const TEST_KEYS = ['islandKm2', 'gapMinKm2', 'gapGrowKm2', 'lineTolKm'] as const;

/** tests 덩어리를 base 위에 덮어 합친다. strict면 모든 칸이 있어야 함(파일 위쪽 기본 tests) */
function parseTests(c: Checker, v: unknown, where: string, base: TestValues | null): TestValues {
  const out: TestValues = base
    ? { islandKm2: [...base.islandKm2], gapMinKm2: base.gapMinKm2, gapGrowKm2: base.gapGrowKm2, lineTolKm: { ...base.lineTolKm } }
    : { islandKm2: [5, 30000], gapMinKm2: 500, gapGrowKm2: 500, lineTolKm: { 강: 3, 해안: 2 } };
  if (v === undefined) {
    if (!base) c.bad(where, '칸이 필요함');
    return out;
  }
  if (!isObj(v)) {
    c.bad(where, '칸 이름: 값 꼴이어야 함');
    return out;
  }
  c.keys(v, TEST_KEYS, where, base ? [] : TEST_KEYS);
  if ('islandKm2' in v) {
    const r = v.islandKm2;
    if (!Array.isArray(r) || r.length !== 2 || !fin(r[0]) || !fin(r[1]) || r[0] < 0 || r[0] >= r[1]) c.bad(`${where}.islandKm2`, '[최소, 최대] 꼴이어야 함 (0 ≤ 최소 < 최대)');
    else out.islandKm2 = [r[0], r[1]];
  }
  if ('gapMinKm2' in v) out.gapMinKm2 = c.num(v.gapMinKm2, `${where}.gapMinKm2`);
  if ('gapGrowKm2' in v) out.gapGrowKm2 = c.num(v.gapGrowKm2, `${where}.gapGrowKm2`);
  if ('lineTolKm' in v) {
    const t = v.lineTolKm;
    if (!isObj(t)) c.bad(`${where}.lineTolKm`, '{ 강: N, 해안: M } 꼴이어야 함');
    else {
      c.keys(t, ['강', '해안'], `${where}.lineTolKm`, base ? [] : ['강', '해안']);
      if ('강' in t) out.lineTolKm.강 = c.num(t.강, `${where}.lineTolKm.강`);
      if ('해안' in t) out.lineTolKm.해안 = c.num(t.해안, `${where}.lineTolKm.해안`);
    }
  }
  return out;
}

/** 두 선분이 (끝점을 공유하지 않고) 엇갈리는가 */
function crosses(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}

function parsePolygon(c: Checker, v: unknown, where: string): Pt[] {
  if (!Array.isArray(v) || v.length < 4 || !v.every((p) => Array.isArray(p) && p.length === 2 && fin(p[0]) && fin(p[1]))) {
    c.bad(where, '[[경도, 위도], ...] 점 4개 이상이어야 함 (처음 점 = 끝 점)');
    return [];
  }
  const ring = v.map((p) => [p[0], p[1]] as Pt);
  const bad = ring.findIndex((p) => p[0] < -180 || p[0] > 180 || p[1] < -90 || p[1] > 90);
  if (bad >= 0) {
    c.bad(where, `${bad + 1}번째 점 [${ring[bad]}]이 범위 밖 (경도 -180~180, 위도 -90~90 — [경도, 위도] 순서인지 볼 것)`);
    return ring;
  }
  const first = ring[0], last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    c.bad(where, `닫히지 않음: 처음 점 [${first}]과 끝 점 [${last}]이 같아야 함`);
    return ring;
  }
  const n = ring.length - 1; // 변 수
  for (let i = 0; i < n; i++)
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // 이웃한 변(닫는 변)
      if (crosses(ring[i], ring[i + 1], ring[j], ring[j + 1])) {
        c.bad(where, `스스로 겹침: ${i + 1}~${i + 2}번째 점 사이와 ${j + 1}~${j + 2}번째 점 사이의 변이 엇갈림`);
        return ring;
      }
    }
  return ring;
}

/** 파일 글을 읽어 검사한 설정. 틀리면 ZonesError */
export function parseZones(text: string, file = ZONES_REL): ZonesConfig {
  const c = new Checker();
  let raw: unknown;
  try {
    raw = parseYaml(text);
  } catch (e) {
    throw new ZonesError(`구역 파일 ${file}을 YAML로 읽지 못함: ${(e as Error).message.split('\n')[0]}`);
  }
  if (!isObj(raw)) throw new ZonesError(`구역 파일 ${file}: 최상위는 grades·defaultGrade·tests·zones 칸을 가진 묶음(매핑)이어야 함`);
  c.keys(raw, ['grades', 'defaultGrade', 'tests', 'zones'], '최상위', ['grades', 'defaultGrade', 'tests', 'zones']);

  const grades: Record<string, GradeValues> = {};
  if (isObj(raw.grades) && Object.keys(raw.grades).length) for (const [id, v] of Object.entries(raw.grades)) grades[id] = parseGrade(c, id, v);
  else if ('grades' in raw) c.bad('grades', '등급 하나 이상이 있어야 함');
  const known = Object.keys(grades).join('·');

  const defaultGrade = typeof raw.defaultGrade === 'string' ? raw.defaultGrade : '';
  if ('defaultGrade' in raw && !(defaultGrade in grades)) c.bad('defaultGrade', `'${String(raw.defaultGrade)}'은 grades에 없는 등급 (있는 등급: ${known})`);

  const tests = parseTests(c, raw.tests, 'tests', null);

  const zones: Zone[] = [];
  if ('zones' in raw && !Array.isArray(raw.zones)) c.bad('zones', '구역 목록이어야 함');
  else
    ((raw.zones as unknown[] | undefined) ?? []).forEach((z, i) => {
      const name = isObj(z) && typeof z.id === 'string' ? z.id : `${i + 1}번째`;
      const where = `zones[${name}]`;
      if (!isObj(z)) return c.bad(where, '칸 이름: 값 꼴이어야 함');
      c.keys(z, ['id', 'grade', 'note', 'polygon', 'tests'], where, ['id', 'grade', 'polygon']);
      if (typeof z.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(z.id)) c.bad(`${where}.id`, '영문 소문자·숫자·-로 된 글이어야 함');
      else if (z.id === DEFAULT_ZONE_ID) c.bad(`${where}.id`, `'${DEFAULT_ZONE_ID}'는 어느 구역에도 들지 않는 곳의 이름이라 쓸 수 없음`);
      else if (zones.some((o) => o.id === z.id)) c.bad(`${where}.id`, '다른 구역과 id가 같음');
      if (typeof z.grade !== 'string' || !(z.grade in grades)) c.bad(`${where}.grade`, `'${String(z.grade)}'은 grades에 없는 등급 (있는 등급: ${known})`);
      if ('note' in z && typeof z.note !== 'string') c.bad(`${where}.note`, '글이어야 함');
      const polygon = parsePolygon(c, z.polygon, `${where}.polygon`);
      const own = parseTests(c, z.tests, `${where}.tests`, tests);
      zones.push({ id: String(z.id), grade: String(z.grade), note: typeof z.note === 'string' ? z.note : '', polygon, tests: own });
    });

  if (c.errs.length) {
    const more = c.errs.length > 3 ? ` (외 ${c.errs.length - 3}건)` : '';
    throw new ZonesError([`구역 파일 ${file} 형식 오류 ${c.errs.length}건${more} — ${c.errs[0]}`, ...c.errs.slice(1)].join('\n'));
  }
  return { file, grades, defaultGrade, tests, zones };
}

const cache = new Map<string, ZonesConfig>();

/** 구역 파일을 읽어 검사한다 (같은 파일은 한 번만). 파일이 없으면 ZonesError */
export function loadZones(file = ZONES_FILE): ZonesConfig {
  const hit = cache.get(file);
  if (hit) return hit;
  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    throw new ZonesError(`구역 파일 ${ZONES_REL}을 읽지 못함 (${file}) — 파일이 없거나 열 수 없음`);
  }
  const cfg = parseZones(text, file === ZONES_FILE ? ZONES_REL : file);
  cache.set(file, cfg);
  return cfg;
}

// ── 구역 찾기 ────────────────────────────────────────────────

/** 점 (lon, lat)이 닫힌 고리 안인가 (짝홀 판정) */
export function pointInPolygon(lon: number, lat: number, ring: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** 등급 값 얻기: 구역 파일의 등급 id → 끝 기준 */
export function gradeValues(grade: string, cfg: ZonesConfig = loadZones()): GradeValues {
  const g = cfg.grades[grade];
  if (!g) throw new ZonesError(`등급 '${grade}'이 ${ZONES_REL}의 grades에 없음 (있는 등급: ${Object.keys(cfg.grades).join('·')})`);
  return g;
}

/** 어느 구역에도 들지 않는 곳의 구역 */
export function defaultZone(cfg: ZonesConfig = loadZones()): ZoneHit {
  return { id: DEFAULT_ZONE_ID, grade: cfg.defaultGrade, gradeValues: gradeValues(cfg.defaultGrade, cfg), tests: cfg.tests };
}

/** 점 (경도, 위도)이 드는 첫 구역. 없으면 기본 등급(id 'default')과 기본 검사 값 */
export function zoneAt(lon: number, lat: number, cfg: ZonesConfig = loadZones()): ZoneHit {
  for (const z of cfg.zones) if (pointInPolygon(lon, lat, z.polygon)) return { id: z.id, grade: z.grade, gradeValues: gradeValues(z.grade, cfg), tests: z.tests };
  return defaultZone(cfg);
}

/** 요약 줄용 짧은 글 (예: `구역 파일 zones.yaml(구역 1+기본)`) */
export function describeZones(cfg: ZonesConfig = loadZones()): string {
  return `구역 파일 ${path.basename(cfg.file)}(구역 ${cfg.zones.length}+기본)`;
}
