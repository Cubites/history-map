// test:geo 검사 colors. 이웃 나라 색 (standards.md 5절 '같은 해에 맞닿은 나라끼리 색 차이 ΔE 25 이상'): 맞닿은 두 나라의 화면 색이 너무 가까운 쌍을 찾는다.
// 사용: npm run test:geo -- --only colors [--region europe] [--years 1500-1600]
//  - ΔE: CIE76 (sRGB → 선형 → XYZ(D65, IEC 61966-2-1 행렬) → CIELAB(D65 흰색 0.95047·1·1.08883), 유클리드 거리). 기록의 손으로 잰 값과 같음(수아송-서로마 8.0, 옛 마케도니아-아르메니아 21.9).
//  - 색 = 사이트에 실제로 칠해지는 색. 항목 YAML의 `color`, 없으면 빌드의 기본 팔레트(scripts/build-data/index.ts의 colorFor·FALLBACK_PALETTE: 항목 파일을 이름순으로
//    읽어 이은 항목 목록의 순서 index % 8). 빌드 코드를 불러오지 않고 같은 규칙을 여기에 되풀이했으므로, 그쪽 규칙이 바뀌면 여기도 맞출 것(FALLBACK_PALETTE 아래 참고).
//  - 대상: 영토 버전(data/geo)이 있는 모든 항목. 점령 항목(`level: region`)·종속국도 따로 칠해지므로 넣는다(점령 빗금·종속 테두리는 바탕색 위의 덧칠이라 바탕색만 잰다).
//    뺀 것: 귀속 논쟁 지역(claimed_by 관계가 있는 해)은 후보 나라 색 줄무늬로 칠해져 자기 색이 보이지 않으므로 그 해 구간은 뺀다. 같은 항목의 버전끼리(같은 id)는 쌍이 아니다.
//  - 맞닿음: 같은 해에 두 버전이 경계 선분을 함께 씀. 버전의 시간 구간 [from,to)이 겹치는 서로 다른 항목의 버전 쌍 가운데, 원도형(해안선으로 자르기 전)에서
//    꼭짓점 4자리 반올림이 같은 선분(양끝이 같음)을 하나 이상 함께 쓰고, 또 해안선으로 자른 도형에서도 선분을 하나 이상 함께 쓰는 쌍(바다 위에서만 닿는 쌍은 뺌).
//    선분 해시(53비트)를 버전마다 정렬 배열로 두고 합쳐 세므로 해마다 비교하지 않고 버전 쌍당 한 번만 한다.
//  - 열쇠 `colors <id작은쪽>|<id큰쪽>` (쌍당 하나, 해 없음). msg: ΔE·두 색·두 이름(ko)·맞닿은 해 범위(여러 구간이면 앞 3개+외 N). ΔE 25 미만만 항목.
//  - 해 표기는 사람이 읽는 해(기원전 N년 = 천문 1−N), 범위는 양끝 포함. --years를 주면 그 범위 안에서 맞닿은 해만 센다.
//  - 기준선: data/tests/baseline/colors.txt (지금 있는 25 미만 쌍. 색을 바꿀지는 운영자가 정함). 러너의 --update-baseline이 파일 맨 위 # 주석을 그대로 두고 열쇠만 다시 쓴다.
//  - 한계(틀린 경보가 날 수 있는 곳): ① 선분을 함께 쓰는 접점이 아주 짧아도(몇 개 선분) 맞닿음으로 센다. ② 해안선으로 자른 뒤 선분이 반올림으로 어긋나 맞닿은 쌍을
//    놓칠 수 있고(안 잡힘), 반대로 육지 경계가 한 점으로만 만나는 쌍은 잡지 않는다(꼭짓점 하나만 같으면 맞닿음이 아님). ③ 종속국 테두리·점령 빗금은 바탕색만 재서
//    실제 화면은 덧칠 때문에 구별이 쉬울 수 있다. ④ 같은 나라의 이름만 바뀐 항목끼리 같은 색인 것(renames)도 서로 맞닿으면 ΔE 0으로 잡힌다.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Context, GeoVersion, MultiCoords } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

/** 이 값 미만이 항목 */
const MIN_DELTA_E = 25;
/**
 * color가 없는 나라에 쓰는 기본 색: scripts/build-data/index.ts의 FALLBACK_PALETTE와 같아야 한다(colorFor(entity, index) = entity.color ?? FALLBACK_PALETTE[index % 길이],
 * index는 data/entities/*.yaml을 파일 이름순으로 이은 항목 목록의 자리). 빌드 결과물 public/data/entities.json의 color와 맞는지는 만든 날 대조해 확인했다.
 */
const FALLBACK_PALETTE = ['#c8745a', '#7d9b5b', '#d4a93f', '#5b7fa8', '#9a6fb0', '#b86b8a', '#8f8a5a', '#5f9e9a'];

// ── ΔE (CIE76) ──────────────────────────────────────────────

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** '#rrggbb' → CIELAB(D65) */
export function labOf(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16)));
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** 두 '#rrggbb'의 CIE76 색차 */
export function deltaE76(a: string, b: string): number {
  const p = labOf(a);
  const q = labOf(b);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

// ── 화면 색과 관계 읽기 ─────────────────────────────────────

interface Painted {
  color: string;
  ko: string;
  level: string;
}

/** 빌드의 entityList 순서(파일 이름순 + 파일 안 순서)로 화면 색을 정한다 */
function readPainted(root: string): Map<string, Painted> {
  const dir = path.join(root, 'data/entities');
  const out = new Map<string, Painted>();
  let index = 0;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const raw = parseYaml(readFileSync(path.join(dir, f), 'utf8')) as unknown;
    if (!Array.isArray(raw)) continue;
    for (const e of raw as Record<string, unknown>[]) {
      const color = typeof e.color === 'string' ? e.color.toLowerCase() : FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
      out.set(String(e.id), { color, ko: String((e.names as { ko?: string } | undefined)?.ko ?? e.id), level: String(e.level ?? '') });
      index++;
    }
  }
  return out;
}

/** 귀속 논쟁(claimed_by) 구간: 그 지역은 후보 나라 색 줄무늬로 칠해진다. 관계 기간의 to는 포함이라 [from, to+1) */
function readClaimWindows(root: string): Map<string, [number, number][]> {
  const raw = (parseYaml(readFileSync(path.join(root, 'data/relations.yaml'), 'utf8')) ?? []) as { type: string; subject: string; from: number; to: number | null }[];
  const out = new Map<string, [number, number][]>();
  for (const r of raw) {
    if (r.type !== 'claimed_by') continue;
    const list = out.get(r.subject) ?? [];
    list.push([Number(r.from), r.to === null || r.to === undefined ? Infinity : Number(r.to) + 1]);
    out.set(r.subject, list);
  }
  return out;
}

type Span = [number, number];

/** [a,b)에서 막는 구간들을 뺀 나머지 */
function subtractSpans(a: number, b: number, cut: Span[] | undefined): Span[] {
  let rest: Span[] = [[a, b]];
  for (const [c0, c1] of cut ?? []) {
    const next: Span[] = [];
    for (const [s0, s1] of rest) {
      if (c1 <= s0 || c0 >= s1) next.push([s0, s1]);
      else {
        if (s0 < c0) next.push([s0, c0]);
        if (c1 < s1) next.push([c1, s1]);
      }
    }
    rest = next;
  }
  return rest;
}

// ── 선분 해시 ───────────────────────────────────────────────

/** 정수 좌표(4자리 반올림) 한 점의 32비트 섞기 두 가지 */
const mixA = (x: number, y: number) => Math.imul(Math.imul(x, 0x9e3779b1) ^ Math.imul(y, 0x85ebca6b), 0xc2b2ae35) ^ x;
const mixB = (x: number, y: number) => Math.imul(Math.imul(y, 0x27d4eb2f) ^ Math.imul(x, 0x165667b1), 0x9e3779b1) ^ y;

/** 한 도형의 모든 고리(바깥·구멍)의 선분을 방향 없이 해시해 정렬·중복 제거한 배열로 만든다 */
function segmentHashes(coords: MultiCoords): Float64Array {
  const hashes: number[] = [];
  for (const poly of coords) {
    for (const ring of poly) {
      for (let i = 1; i < ring.length; i++) {
        let x1 = Math.round(ring[i - 1][0] * 1e4);
        let y1 = Math.round(ring[i - 1][1] * 1e4);
        let x2 = Math.round(ring[i][0] * 1e4);
        let y2 = Math.round(ring[i][1] * 1e4);
        if (x1 === x2 && y1 === y2) continue;
        if (x1 > x2 || (x1 === x2 && y1 > y2)) [x1, y1, x2, y2] = [x2, y2, x1, y1];
        const h1 = (mixA(x1, y1) + Math.imul(mixB(x2, y2), 31)) | 0;
        const h2 = (mixB(x1, y1) ^ Math.imul(mixA(x2, y2), 0x7feb352d)) | 0;
        hashes.push((h1 >>> 0) * 2097152 + (h2 >>> 11));
      }
    }
  }
  const arr = Float64Array.from(hashes).sort();
  let n = 0;
  for (let i = 0; i < arr.length; i++) if (i === 0 || arr[i] !== arr[i - 1]) arr[n++] = arr[i];
  return arr.subarray(0, n);
}

/** 정렬된 두 배열에 함께 있는 값의 수 (0이 아니면 1에서 멈춰도 되는 곳은 limit로 끊음) */
function sharedCount(a: Float64Array, b: Float64Array, limit = Infinity): number {
  let i = 0;
  let j = 0;
  let n = 0;
  while (i < a.length && j < b.length) {
    if (a[i] < b[j]) i++;
    else if (a[i] > b[j]) j++;
    else {
      if (++n >= limit) return n;
      i++;
      j++;
    }
  }
  return n;
}

// ── 맞닿은 쌍 찾기 ──────────────────────────────────────────

export interface TouchPair {
  a: string;
  b: string;
  /** 맞닿은 해 구간 [시작, 끝) 목록(병합됨, 끝이 Infinity면 지금까지) */
  spans: Span[];
}

const boxesTouch = (p: GeoVersion['box'], q: GeoVersion['box']) => p[0] <= q[2] && q[0] <= p[2] && p[1] <= q[3] && q[1] <= p[3];

function mergeSpans(spans: Span[]): Span[] {
  const s = [...spans].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const out: Span[] = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

export interface TouchStats {
  versions: number;
  candidates: number;
  origTouch: number;
  seaOnly: number;
}

/** 서로 다른 항목의 버전 쌍 가운데 같은 해에 경계를 함께 쓰는 것을 항목 쌍별로 모은다. claim: 귀속 논쟁 구간(그 구간은 뺌) */
export async function findTouchingPairs(ctx: Context, claim: Map<string, Span[]>, years: [number, number] | null, stats?: TouchStats): Promise<TouchPair[]> {
  // 버전마다 칠해지는 시간 구간(귀속 논쟁 구간과 --years 밖은 뺌)
  const lo = years ? years[0] : -Infinity;
  const hi = years ? years[1] + 1 : Infinity;
  const geo = ctx.geo;
  const spansOf = geo.map((g) => subtractSpans(Math.max(g.from, lo), Math.min(g.to ?? Infinity, hi), claim.get(g.entityId)).filter(([a, b]) => a < b));
  const live = geo.map((_, i) => i).filter((i) => spansOf[i].length > 0 && ctx.geo[i].coords.length > 0);
  if (stats) stats.versions = live.length;

  const origHash = new Map<number, Float64Array>();
  const origOf = (i: number) => {
    let h = origHash.get(i);
    if (!h) origHash.set(i, (h = segmentHashes(geo[i].coords)));
    return h;
  };
  let clippedHash: Map<number, Float64Array> | null = null;
  let clippedAll: Awaited<ReturnType<Context['clipped']>> | null = null;
  const clipOf = async (i: number) => {
    if (!clippedAll) {
      clippedAll = await ctx.clipped();
      clippedHash = new Map();
    }
    let h = clippedHash!.get(i);
    if (!h) clippedHash!.set(i, (h = segmentHashes(clippedAll[i].clipped)));
    return h;
  };

  const byPair = new Map<string, Span[]>();
  // 시작 해 순으로 훑어 시간이 겹치지 않는 쌍은 일찍 건너뛴다
  const order = [...live].sort((p, q) => geo[p].from - geo[q].from);
  for (let x = 0; x < order.length; x++) {
    const i = order[x];
    const gi = geo[i];
    const iEnd = gi.to ?? Infinity;
    for (let y = x + 1; y < order.length; y++) {
      const j = order[y];
      const gj = geo[j];
      if (gj.from >= iEnd) break;
      if (gi.entityId === gj.entityId || !boxesTouch(gi.box, gj.box)) continue;
      // 시간 겹침 ∩ 두 버전이 칠해지는 구간
      const over: Span[] = [];
      for (const [a0, a1] of spansOf[i]) for (const [b0, b1] of spansOf[j]) {
        const s = Math.max(a0, b0);
        const e = Math.min(a1, b1);
        if (s < e) over.push([s, e]);
      }
      if (!over.length) continue;
      if (stats) stats.candidates++;
      if (sharedCount(origOf(i), origOf(j), 1) === 0) continue;
      if (stats) stats.origTouch++;
      if ((sharedCount(await clipOf(i), await clipOf(j), 1)) === 0) {
        if (stats) stats.seaOnly++;
        continue;
      }
      const key = gi.entityId < gj.entityId ? `${gi.entityId}|${gj.entityId}` : `${gj.entityId}|${gi.entityId}`;
      const list = byPair.get(key) ?? [];
      list.push(...over);
      byPair.set(key, list);
    }
  }
  return [...byPair].map(([key, spans]) => {
    const [a, b] = key.split('|');
    return { a, b, spans: mergeSpans(spans) };
  });
}

// ── 글 꾸미기 ───────────────────────────────────────────────

const yearText = (y: number) => (y <= 0 ? `기원전 ${1 - y}` : `${y}`);

/** [시작, 끝) 목록 → '기원전 264~기원전 169, 476~현재' 꼴(끝은 포함). 많으면 앞 3개 + 외 N */
export function spansText(spans: Span[]): string {
  const one = ([a, b]: Span) => (b === Infinity ? `${yearText(a)}~현재` : b - 1 === a ? yearText(a) : `${yearText(a)}~${yearText(b - 1)}`);
  const head = spans.slice(0, 3).map(one).join(', ');
  return spans.length > 3 ? `${head} 외 ${spans.length - 3}구간` : head;
}

// ── 검사 ────────────────────────────────────────────────────

export const colors: Check = {
  id: 'colors',
  title: '이웃 나라 색 (ΔE 25)',
  async run(ctx: Context, opt: Options): Promise<CheckResult> {
    const painted = readPainted(ctx.root);
    const claim = readClaimWindows(ctx.root);
    const stats: TouchStats = { versions: 0, candidates: 0, origTouch: 0, seaOnly: 0 };
    const pairs = await findTouchingPairs(ctx, claim, opt.years, stats);
    const items: Item[] = [];
    let low = 0;
    for (const p of pairs) {
      if (!ctx.inRegion(p.a) && !ctx.inRegion(p.b)) continue;
      const pa = painted.get(p.a);
      const pb = painted.get(p.b);
      if (!pa || !pb) continue;
      const de = deltaE76(pa.color, pb.color);
      if (de >= MIN_DELTA_E) continue;
      low++;
      items.push({
        key: `colors ${p.a}|${p.b}`,
        msg: `ΔE ${de.toFixed(1)}: ${pa.ko}(${p.a}) ${pa.color} · ${pb.ko}(${p.b}) ${pb.color} — 맞닿은 해 ${spansText(p.spans)}`,
      });
    }
    items.sort((x, y) => x.key.localeCompare(y.key));
    const inScope = pairs.filter((p) => ctx.inRegion(p.a) || ctx.inRegion(p.b)).length;
    return {
      checked: inScope,
      items,
      notes: [`쌍 ${inScope}·25 미만 ${low}`],
    };
  },
};

export const checks: Check[] = [colors];
