// test:geo 검사 years. 옛 연도·기원전 연도 (RULES-TOOLS 작업 9): 글 속 '지도 해' 숫자가 실제 지도 연도와 맞는지, 기원전 연도가 천문 연도로 바르게 옮겨졌는지 본다.
// 글 속 숫자만 본다(사건이 생기고 없어질 때 사건이 있는지는 `test:geo events`가 본다). 도형은 읽지 않아 2~3초에 끝난다. 데이터·사이트 글은 고치지 않는다.
// 사용: npm run test:geo -- --only years [--region europe] [--years 1500-1600]   (--years는 글 속 연도 기준)
// 연도 규칙: 저장소는 천문 연도(기원전 N년 = 1−N). 나라 항목 to는 포함, 영토 버전 to는 미포함(DATA_GUIDE 1절). 글 속 '기원전 N년'은 1−N으로 바꿔 견준다.
//
// 규칙 (항목마다 구별어 `옛연도`·`천문연도`가 열쇠와 msg 머리말에 들어간다)
//  1. 지도 연도 집합 S(나라) = 나라 항목 from·to + 영토 버전 from·(to−1)·to (ctx.geo의 속성만 쓴다).
//  2. 지도 해를 말하는 글 — 나라 foundingNote·summary·details·mapNote·사건 summary에서 '지도' 낱말(지도는/지도에는/지도에서/지도의 …)이 나온 절(괄호 안이면 그 괄호 끝까지,
//     아니면 문장 끝까지)에서, 지도를 바꾸는 해로 적힌 숫자만 센다(괄호 안은 하위 지역 해라 뺌):
//       · 뒤가 `N년부터/까지/이후/이전`·`N년 버전`·`N년에 … 그린다/옮긴다/바꾼다`, 앞이 `지도는 N년`·쉼표/가운뎃점/와·과/을·를 뒤의 `N년`('지도는 외몽골을 1691년, 티베트를 1720년').
//       · 범위 `A~B년`은 지도 낱말 바로 뒤(`지도에는 A~B년 …`)에서만. `… 그리지 않는다`가 뒤따르는 해, 년간·년대·년 동안·년 뒤 같은 기간 말은 제외.
//       · 나라 글은 지도 낱말 뒤 첫 해(범위면 양끝)만 본다. 뒷부분은 하위 지역·표 해('1000년부터는 …')가 많아 틀린 경보가 대부분이었다.
//       · 지도 낱말이 없어도 `N년부터 … 그린다/칠한다/비운다/표시`면 센다(나라 글은 지도 낱말이 없는 글에서만).
//       · '기원전' 뒤의 말 없는 숫자(`기원전 550년부터 …, 547년부터`)는 같은 문장(글 임자가 기원전이면 글 전체) 안에서 앞서 나온 기원전 숫자 이하일 때 기원전으로 읽는다.
//     비교할 나라 = 글 임자(나라 글이면 그 나라, 사건이면 subjects·links) + 그 절에 이름(ko, 두 글자 이상, 앞이 한글이 아닌 자리)이 나온 나라. 한 나라라도 S에 그 해가 있으면 맞는 것.
//     없으면 항목: S에 N±1이 있고 N 또는 그 해가 기원전과 이어지면(N ≤ 0 또는 어긋난 해 ≤ 0) '천문 연도 실수 의심'(열쇠 `years 천문연도 <id> <필드> <N>`),
//     그 밖은 '옛 연도 의심'(`years 옛연도 <id> <필드> <N>`, 서기 해가 1 어긋난 것은 msg에 밝힌다). 필드는 foundingNote·summary·details·mapNote, <id>는 글 임자(나라 id 또는 사건 id),
//     <N>은 글 속 숫자를 천문 연도로 바꾼 값.
//  3. 사건 기원전 해 — year ≤ 0인 사건에서 제목의 기원전 해 모음 T(`(기원전 49~45)와 암살(44)`처럼 기원전 뒤 말 없는 숫자 포함)에 year가 없고 year±1이 있으면
//     '천문 연도 실수 의심'(열쇠 `years 천문연도 <사건 id> year <T의 해>`). endYear와 summary는 견주지 않는다(기간이 제목의 마지막 해보다 뒷일까지 이어지는 일이 많음).
//     사건 id 끝 `-NNNbc`(기원전 NNN년) 또는 서기 `-NNNN`이 [year, endYear 또는 year] 밖이면 항목(기원전이고 1 어긋나면 천문 연도, 그 밖은 옛 연도. 열쇠 `… <사건 id> id <값>`).
//  4. 생성기 주석 — scripts/geo/ 아래 .mjs의 // 주석에서 `N년부터/까지/이후/이전`이 같은 줄에 이름이 나온 나라(ko 이름 또는 따옴표 친 id)의 S에 없는데 N±1이 있고 기원전과
//     이어지면 '천문 연도 실수 의심'(열쇠 `years 천문연도 <나라 id> <파일 이름> <N>`). 생성기 주석은 하위 지역 해(주·섬 따위)가 많이 섞여 '옛 연도'는 내지 않는다.
// 열쇠에는 줄 번호·글자 위치가 없다(글이 옮겨져도 같음). 같은 열쇠가 둘이면 하나로 묶는다.
// 기준선: data/tests/baseline/years.txt (지금 있는 어긋남 전부. 고칠지는 운영자가 정한다). 허용: data/tests/allow/years.yaml에 이유와 함께.
// 한계(틀린 경보가 날 수 있는 곳 / 놓치는 곳):
//  - 글의 해가 지도 버전이 아니라 사건 해·점령 기간·표 해인데 지도 낱말 가까이 있을 때 '옛 연도 의심'이 난다(예: 지도를 책 이름으로 쓴 사건, 하위 지역의 기간).
//  - 해가 우연히 다른 관련 나라의 S에 들어 있으면 맞는 것으로 보아 놓친다. 한 글자 나라 이름(한·진·위·청 등)은 이름 찾기에서 빼 subjects·links로만 잡힌다.
//  - 나라 글은 지도 낱말 뒤 첫 해만 보므로 뒷부분의 옛 연도(하위 지역 설명)는 놓친다. 괄호 안의 해, 쉼표 없이 이어진 `A·B년`의 앞 숫자도 놓친다.
//  - '기원전' 없이 적은 둘째 숫자(기원전 206년과 202년)는 앞서 나온 기원전 숫자 이하일 때만 기원전으로 읽는다. 세기·연호·재위 연수는 보지 않는다.
// 직접 실행: node scripts/test-geo/checks/years.ts [옛연도|천문연도]  → 항목 전부를 출력(보고서 대신 빠르게 보기)
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { ROOT, createContext } from '../context.ts';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

const OLD = '옛연도';
const ASTRO = '천문연도';
const LABEL: Record<string, string> = { [OLD]: '옛 연도 의심', [ASTRO]: '천문 연도 실수 의심' };

// ── 글에서 연도 뽑기 ──────────────────────────────────────────

interface YearHit {
  /** 천문 연도 (기원전 N년 = 1−N) */
  n: number;
  /** 글에서 이 숫자가 시작하는 자리 */
  idx: number;
  /** 'N년' 끝(년 다음) 자리 */
  end: number;
  /** 글에 적힌 모양 (msg용) */
  raw: string;
  /** A~B년 범위의 한 끝이면 true */
  range: boolean;
}

// 기간 말(년간·년대·년 동안·년 뒤…)은 해가 아니다. 범위 A~B년의 앞 숫자도 같이 잡는다. 시대 말(기원전·기원후·서기)은 숫자 앞에 올 수 있다.
const NUM_RE = /(?<![\d./·])(\d{1,4})(?:\s*[~∼–-]\s*(기원전|기원후|서기)?\s*(\d{1,4}))?\s?년(?![간대]|\s?(?:동안|째|만에|뒤|후[에는]?|넘|쯤))/g;
const ERA_RE = /기원전|기원후|서기/g;

/** 글 전체에서 연도를 뽑는다. 숫자 앞에 '기원전'이 붙으면 기원전, '기원후·서기'면 서기. 말이 없는 숫자(`기원전 550년부터 …, 547년부터`)는 앞에서 가장 가까이 나온
 *  시대 말을 따르되, 기원전을 따를 때는 그 글에 이미 나온 기원전 숫자 가운데 가장 큰 값 이하일 때만 기원전으로 읽는다(그보다 큰 수는 서기). 자리(idx)는 글 전체 기준 */
export function findYears(text: string, bcOwner = false): YearHit[] {
  const markers = [...text.matchAll(ERA_RE)].map((m) => ({ pos: m.index ?? 0, end: (m.index ?? 0) + m[0].length, bc: m[0] === '기원전' }));
  const out: YearHit[] = [];
  let maxBc = 0;
  const eraAt = (idx: number, v: number): boolean => {
    let last: (typeof markers)[number] | null = null;
    for (const mk of markers) if (mk.pos < idx) last = mk;
    if (!last || !last.bc) return false;
    if (text.slice(last.end, idx).trim() === '') {
      if (v > maxBc) maxBc = v;
      return true; // 바로 앞에 붙은 '기원전'
    }
    // 말 없는 숫자: 앞서 나온 기원전 숫자 이하일 때만. 글 임자가 서기(나라 from>0·사건 year>0)면 '기원전'과 같은 문장 안에서만 따른다
    if (!bcOwner && /\.(?:\s|$)|\n/.test(text.slice(last.end, idx))) return false;
    return v <= maxBc;
  };
  for (const m of text.matchAll(NUM_RE)) {
    const idx = m.index ?? 0;
    const end = idx + m[0].length;
    const a = Number(m[1]);
    const bcA = eraAt(idx, a);
    const conv = (v: number, bc: boolean) => (bc ? 1 - v : v);
    const rawA = `${bcA ? '기원전 ' : ''}${a}`;
    if (m[3] === undefined) {
      out.push({ n: conv(a, bcA), idx, end, raw: `${rawA}년`, range: false });
      continue;
    }
    const b = Number(m[3]);
    // 둘째 숫자: 자기 앞 시대 말이 있으면 그것, 없으면 첫째와 같은 시대
    const bcB = m[2] ? (m[2] === '기원전' ? (b > maxBc && (maxBc = b), true) : false) : bcA;
    const raw = `${rawA}~${bcB !== bcA ? (bcB ? '기원전 ' : '기원후 ') : ''}${b}년`;
    out.push({ n: conv(a, bcA), idx, end, raw, range: true });
    out.push({ n: conv(b, bcB), idx, end, raw, range: true });
  }
  return out;
}

/** 글을 문장으로 자른다(문장 끝 '.'+공백/끝, 줄바꿈). [시작, 끝) 자리 */
function sentences(text: string): [number, number][] {
  const out: [number, number][] = [];
  let s = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '\n' || (c === '.' && (i + 1 >= text.length || /\s/.test(text[i + 1])))) {
      if (i + 1 > s) out.push([s, i + 1]);
      s = i + 1;
    }
  }
  if (s < text.length) out.push([s, text.length]);
  return out;
}

// '지도' 낱말 (지도자·지도층·지도부·지도력, 「대동여지도」처럼 앞이 한글인 것은 제외)
const MAP_RE = /(?<![가-힣])지도(?![자층부력]|\s*[「『])/g;
// 지도를 바꾸는 해로 적힌 꼴: 'N년부터/까지/이후/이전'(앞에 무렵·쯤·경 가능). 'N년'만 있거나 'N년에 …'는 사건 해·점령 기간일 수 있어 뺀다(아래 DRAW_AFTER 예외)
const FROM_TO_RE = /^\s?(?:무렵|쯤|경)?(?:부터|까지|이후|이전|전까지|이후만)/;
// 'N년에 … 그린다·끝낸다·옮긴다'도 지도 해로 본다 (같은 절 40자 안에 이런 말이 있을 때)
const DRAW_AFTER_RE = /^(?:에|에는|에도)[^.)]{0,40}(?:그린|그려|칠|비운|비워|끝낸|끝내|옮|넘겨|넣|뺀|빼|바꾼|바꿔|합친|더한|더해|돌린|돌려)/;
// 'N년 버전'(해마다 한 버전)
const VERSION_RE = /^\s?(?:무렵)?\s?버전/;
const DRAW_RE = /(?:그린|그려|그리며|칠한|칠해|칠하|칠함|비운|비워|표시)/;
// '… 그리지 않는다·표시하지 않음'처럼 안 그린다는 말이 뒤따르는 해는 지도 해가 아니라 안 그리는 기간이다
const NEGATIVE_RE = /^[^.,)]{0,40}(?:지 않|않는)/;

export interface MapYear {
  n: number;
  raw: string;
  /** 지도를 말하는 절(msg 앞부분) */
  clause: string;
  /** 절 안에서 이름이 나온 나라 id */
  named: Set<string>;
}

type NameIndex = { name: string; id: string }[];

function namesIn(text: string, names: NameIndex): Set<string> {
  const out = new Set<string>();
  for (const { name, id } of names) {
    let i = text.indexOf(name);
    while (i >= 0) {
      if (i === 0 || !/[가-힣]/.test(text[i - 1])) {
        out.add(id);
        break;
      }
      i = text.indexOf(name, i + 1);
    }
  }
  return out;
}

/** 글 한 편에서 지도 해를 말하는 숫자를 모은다 */
export function mapYears(text: string, names: NameIndex, bcOwner = false, firstOnly = false): MapYear[] {
  const out = new Map<string, MapYear>();
  const add = (y: YearHit, clauseStart: number, clauseEnd: number) => {
    const key = `${y.n}`;
    if (out.has(key)) return;
    const clause = text.slice(clauseStart, clauseEnd);
    out.set(key, { n: y.n, raw: y.raw, clause: clause.replace(/\s+/g, ' ').trim(), named: namesIn(clause, names) });
  };
  const all = findYears(text, bcOwner);
  let sawMapWord = false;
  for (const [s, e] of sentences(text)) {
    const sent = text.slice(s, e);
    const years = all.filter((y) => y.idx >= s && y.idx < e).map((y) => ({ ...y, idx: y.idx - s, end: y.end - s }));
    if (!years.length) continue;
    // ① '지도' 낱말 뒤 같은 절
    for (const m of sent.matchAll(MAP_RE)) {
      const p = m.index ?? 0;
      let depth = 0;
      for (let i = 0; i < p; i++) depth += sent[i] === '(' ? 1 : sent[i] === ')' ? -1 : 0;
      let end = sent.length;
      if (depth > 0) {
        let d = depth;
        for (let i = p; i < sent.length; i++) {
          if (sent[i] === '(') d++;
          else if (sent[i] === ')' && --d < depth) {
            end = i;
            break;
          }
        }
      }
      // 지도 낱말과 같은 괄호 깊이의 해만 센다(괄호 안은 하위 지역·참고 해가 많음)
      const depthAt = (idx: number) => {
        let d = 0;
        for (let i = 0; i < idx; i++) d += sent[i] === '(' ? 1 : sent[i] === ')' ? -1 : 0;
        return d;
      };
      // 지도를 바꾸는 해로 적힌 꼴만 센다(사건 해·점령 기간 같은 해는 뺀다):
      //  · 뒤가 N년부터/까지/이후/이전 · N년 버전 · N년에 … 그린다  · 앞이 '지도는 N년' · 쉼표·가운뎃점·와/과·을/를 뒤의 N년('지도는 외몽골을 1691년, 티베트를 1720년')
      //  · 범위 A~B년은 '지도는/에는 A~B년'처럼 지도 낱말 바로 뒤에 올 때만
      const isMapYear = (y: YearHit) => {
        const rest = sent.slice(y.end);
        if (NEGATIVE_RE.test(rest)) return false;
        const before = sent.slice(p + m[0].length, y.idx).replace(/(?:기원전|기원후|서기)\s*$/, '');
        const directRange = y.range && /^(?:에는|에서는|에서도|에서|에도|에|는|도|가)?\s*$/.test(before);
        if (y.range) return directRange || FROM_TO_RE.test(rest);
        const direct = /^(?:에는|에서는|에서도|에서|에도|에|는|도|가|의|를)?\s*$/.test(before);
        const listed = /(?:,\s*|·|[와과]\s+|[을를]\s*)$/.test(sent.slice(0, y.idx).replace(/(?:기원전|기원후|서기)\s*$/, ''));
        return FROM_TO_RE.test(rest) || VERSION_RE.test(rest) || DRAW_AFTER_RE.test(rest) || direct || listed;
      };
      const el = years.filter((y) => y.idx >= p && y.idx < end && depthAt(y.idx) === depth && isMapYear(y));
      // firstOnly(나라 글): '지도' 낱말 뒤 첫 해(범위면 양끝)만 센다. 뒤쪽 해는 하위 지역·표 해 따위가 많다
      for (const y of firstOnly ? el.filter((v) => v.idx === el[0].idx) : el) add(y, s + p, s + end);
      sawMapWord = true;
    }
    // ② 지도 낱말 없이 'N년부터 … 그린다' 꼴 (나라 글은 지도 낱말이 아예 없을 때만)
    for (const y of firstOnly && (sawMapWord || /(?<![가-힣])지도(?![자층부력])/.test(text)) ? [] : years) {
      const rest = sent.slice(y.end);
      if (!FROM_TO_RE.test(rest)) continue;
      const near = rest.slice(0, 30).split(/[.),]/)[0];
      if (DRAW_RE.test(near)) add(y, s + y.idx, s + y.end + near.length);
    }
  }
  return [...out.values()];
}

// ── 지도 연도 집합 ────────────────────────────────────────────

function mapYearSets(ctx: Context): Map<string, Set<number>> {
  const sets = new Map<string, Set<number>>();
  const get = (id: string) => {
    let s = sets.get(id);
    if (!s) sets.set(id, (s = new Set()));
    return s;
  };
  for (const e of ctx.entities.values()) {
    const s = get(e.id);
    s.add(e.from);
    if (e.to !== null) s.add(e.to);
  }
  for (const g of ctx.geo) {
    const s = get(g.entityId);
    s.add(g.from);
    if (g.to !== null) {
      s.add(g.to - 1);
      s.add(g.to);
    }
  }
  return sets;
}

// ── 자료 읽기 ─────────────────────────────────────────────────

interface EntText { id: string; foundingNote: string; summary: string; details: string; mapNote: string }
interface EvText { id: string; year: number; endYear: number | null; title: string; summary: string; related: string[] }

const readYaml = (file: string) => (parseYaml(readFileSync(file, 'utf8')) as Record<string, unknown>[] | null) ?? [];

function readTexts(root: string): { ents: EntText[]; evs: EvText[] } {
  const ents: EntText[] = [];
  const dirE = path.join(root, 'data/entities');
  for (const f of readdirSync(dirE).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readYaml(path.join(dirE, f))) {
      ents.push({
        id: String(e.id),
        foundingNote: String((e.basis as { foundingNote?: string } | undefined)?.foundingNote ?? ''),
        summary: String(e.summary ?? ''),
        details: String(e.details ?? ''),
        mapNote: String(e.mapNote ?? ''),
      });
    }
  }
  const evs: EvText[] = [];
  const dirV = path.join(root, 'data/events');
  for (const f of readdirSync(dirV).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readYaml(path.join(dirV, f))) {
      const links = (e.links as { from: string; to: string }[] | undefined) ?? [];
      evs.push({
        id: String(e.id),
        year: Number(e.year),
        endYear: e.endYear === undefined || e.endYear === null ? null : Number(e.endYear),
        title: String((e.title as { ko?: string } | undefined)?.ko ?? ''),
        summary: String((e.summary as { ko?: string } | undefined)?.ko ?? ''),
        related: [...new Set([...((e.subjects as string[] | undefined) ?? []).map(String), ...links.flatMap((l) => [String(l.from), String(l.to)])])],
      });
    }
  }
  return { ents, evs };
}

/** 이름 찾기용 목록: ko 이름(괄호 앞), 두 글자 이상. 긴 이름 먼저 */
function nameIndex(ctx: Context): NameIndex {
  const out: NameIndex = [];
  for (const e of ctx.entities.values()) {
    const name = e.ko.replace(/\s*[(（].*$/, '').trim();
    if (name.length >= 2) out.push({ name, id: e.id });
  }
  return out;
}

// ── 비교 ──────────────────────────────────────────────────────

type Kind = typeof OLD | typeof ASTRO;

interface Found { kind: Kind; key: string; msg: string }

const fmtYear = (n: number) => (n <= 0 ? `기원전 ${1 - n}년(${n})` : `${n}년`);
const short = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** 비교할 나라들의 S에서 n과 가까운 해 몇 개 (msg용) */
function nearYears(ids: string[], sets: Map<string, Set<number>>, n: number): string {
  const all = new Set<number>();
  for (const id of ids) for (const y of sets.get(id) ?? []) all.add(y);
  return [...all].sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b).slice(0, 4).sort((a, b) => a - b).map(fmtYear).join('·');
}

/** 맞으면 null. 없으면 옛 연도 의심, 단 기원전과 이어진 해(n ≤ 0 또는 어긋난 해가 0 이하)가 1 어긋나면 천문 연도 실수 의심.
 *  서기 해가 1 어긋난 것은 천문 연도 문제가 아니므로 '옛 연도 의심'에 넣고 near=true로 알린다(msg용) */
function judge(n: number, ids: string[], sets: Map<string, Set<number>>): { kind: Kind; near: boolean } | null {
  let near = false;
  let astro = false;
  for (const id of ids) {
    const s = sets.get(id);
    if (!s) continue;
    if (s.has(n)) return null;
    for (const y of [n - 1, n + 1]) {
      if (!s.has(y)) continue;
      near = true;
      if (n <= 0 || y <= 0) astro = true;
    }
  }
  return { kind: astro ? ASTRO : OLD, near };
}

function checkTexts(ctx: Context, sets: Map<string, Set<number>>, names: NameIndex, ents: EntText[], evs: EvText[], found: Found[]): number {
  let mentions = 0;
  const ownerIsBc = (id: string) => (ctx.entities.get(id)?.from ?? 1) <= 0;
  const handle = (ownerId: string, field: string, text: string, own: string[], where: string, bcOwner: boolean, firstOnly = false) => {
    if (!text) return;
    for (const y of mapYears(text, names, bcOwner, firstOnly)) {
      if (!ctx.inYears(y.n)) continue;
      const ids = [...new Set([...own, ...y.named])].filter((id) => sets.has(id));
      if (!ids.length) continue;
      mentions++;
      const j = judge(y.n, ids, sets);
      if (!j) continue;
      const kind = j.kind;
      found.push({
        kind,
        key: `years ${kind} ${ownerId} ${field} ${y.n}`,
        msg: `[${LABEL[kind]}] ${where} 글 속 지도 해 ${fmtYear(y.n)}이 관련 나라(${ids.slice(0, 5).join('·')})의 지도 연도(가까운 해 ${nearYears(ids, sets, y.n)})에 없음${j.near && kind === OLD ? '(1년 어긋난 해는 있음)' : ''} — “${short(y.clause)}”`,
      });
    }
  };
  for (const e of ents) {
    if (!ctx.inRegion(e.id)) continue;
    handle(e.id, 'foundingNote', e.foundingNote, [e.id], `나라 ${e.id}의 foundingNote`, ownerIsBc(e.id), true);
    handle(e.id, 'summary', e.summary, [e.id], `나라 ${e.id}의 summary`, ownerIsBc(e.id), true);
    handle(e.id, 'details', e.details, [e.id], `나라 ${e.id}의 details`, ownerIsBc(e.id), true);
    handle(e.id, 'mapNote', e.mapNote, [e.id], `나라 ${e.id}의 mapNote`, ownerIsBc(e.id), true);
  }
  for (const v of evs) {
    if (v.related.length && !v.related.some((id) => ctx.inRegion(id))) continue;
    handle(v.id, 'summary', v.summary, v.related, `사건 ${v.id}의 summary`, v.year <= 0);
  }
  return mentions;
}

// ── 사건 기원전 해 ────────────────────────────────────────────

// 숫자 뒤에 이런 말이 붙으면 해가 아니다 (제1차·1세·6월·170만 …)
const NOT_YEAR_AFTER = /^\s?(?:세|차|번|명|개|인|km|만|척|월|일|주|호|도|군단|년간)/;

/** 글에 나온 기원전 해를 천문 연도 모음으로. 'inherit'면 '기원전' 뒤에 말 없이 나온 숫자(`(기원전 49~45)와 암살(44)`, `(기원전 112~105)과 … 전쟁(113~101)`)도 '기원후·서기'가 나오기 전까지 기원전으로 읽는다(제목용) */
export function bcYears(text: string, inherit: boolean): Set<number> {
  const out = new Set<number>();
  let markerEnd = -1;
  for (const m of text.matchAll(/기원전|기원후|서기|(?<![\d.])(\d{1,4})(?!\d)/g)) {
    const at = m.index ?? 0;
    if (m[1] === undefined) {
      markerEnd = m[0] === '기원전' ? at + m[0].length : -1;
      continue;
    }
    if (markerEnd < 0 || NOT_YEAR_AFTER.test(text.slice(at + m[0].length))) continue;
    // '기원전' 바로 뒤 숫자는 늘 기원전, 말이 끼어 있으면 inherit일 때만
    if (inherit || text.slice(markerEnd, at).trim() === '') out.add(1 - Number(m[1]));
  }
  return out;
}

function checkEventYears(ctx: Context, evs: EvText[], found: Found[]): number {
  let checked = 0;
  const flag = (kind: Kind, id: string, field: string, value: number, msg: string) =>
    found.push({ kind, key: `years ${kind} ${id} ${field} ${value}`, msg: `[${LABEL[kind]}] 사건 ${id}: ${msg}` });
  /** 글의 기원전 해 모음 T에 stored가 없는데 stored±1이 있으면 그 값(어긋난 글 속 해)을 돌려준다 */
  const offByOne = (stored: number, t: Set<number>): number | null => (t.has(stored) ? null : t.has(stored + 1) ? stored + 1 : t.has(stored - 1) ? stored - 1 : null);
  for (const v of evs) {
    if (v.related.length && !v.related.some((id) => ctx.inRegion(id))) continue;
    if (!ctx.overlapsYears(v.year, (v.endYear ?? v.year) + 1)) continue;
    checked++;
    const hi = v.endYear ?? v.year;
    // 제목의 기원전 해 모음 T와 year를 견준다: T에 year는 없는데 year±1이 있으면 1 어긋남.
    // (endYear는 견주지 않는다: 사건 기간이 제목의 마지막 해보다 뒷일까지 이어지는 일이 많아 틀린 경보가 대부분이었다. summary도 같은 이유로 보지 않는다.)
    if (v.year <= 0) {
      const a = offByOne(v.year, bcYears(v.title, true));
      if (a !== null) flag(ASTRO, v.id, 'year', a, `제목에 기원전 ${1 - a}년(천문 연도 ${a})은 있고 year ${v.year}(기원전 ${1 - v.year}년)는 없음 — 1 어긋남`);
    }
    // id 끝 해: -NNNbc(기원전 NNN년) 또는 -NNNN(서기)가 [year, endYear] 안에 있어야 한다
    const bc = /-(\d{1,4})bc$/.exec(v.id);
    const ad = bc ? null : /-(\d{3,4})$/.exec(v.id);
    const idYear = bc ? 1 - Number(bc[1]) : ad && v.year > 0 ? Number(ad[1]) : null;
    if (idYear !== null && (idYear < v.year || idYear > hi)) {
      const gap = Math.min(Math.abs(idYear - v.year), Math.abs(idYear - hi));
      flag(gap === 1 && bc ? ASTRO : OLD, v.id, 'id', idYear, `id 끝 해가 천문 연도 ${idYear}인데 year는 ${v.year}${v.endYear !== null ? `~${v.endYear}` : ''}${gap === 1 && !bc ? ' (1 어긋남)' : ''}`);
    }
  }
  return checked;
}


// ── 생성기 주석 ───────────────────────────────────────────────

function listMjs(dir: string): string[] {
  const out: string[] = [];
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...listMjs(p));
    else if (d.name.endsWith('.mjs')) out.push(p);
  }
  return out.sort();
}

const GEN_YEAR_RE = /(?<![\d.])(기원전\s*)?(\d{1,4})\s?년(?:부터|까지|이후|이전)/g;

function checkGenerators(ctx: Context, sets: Map<string, Set<number>>, names: NameIndex, found: Found[]): number {
  let comments = 0;
  const dir = path.join(ctx.root, 'scripts/geo');
  const ids = [...ctx.entities.keys()].filter((id) => id.length >= 4);
  for (const file of listMjs(dir)) {
    const base = path.basename(file);
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const c = line.search(/(?<!:)\/\//);
      if (c < 0) continue;
      const comment = line.slice(c);
      if (!/년(?:부터|까지|이후|이전)/.test(comment)) continue;
      comments++;
      const named = namesIn(comment, names);
      // 따옴표 친 id ('prussia')도 이름으로 센다
      for (const id of ids) if (comment.includes(`'${id}'`) || line.includes(`'${id}'`)) named.add(id);
      const idsHere = [...named].filter((id) => sets.has(id));
      if (!idsHere.length) continue;
      for (const m of comment.matchAll(GEN_YEAR_RE)) {
        const n = m[1] ? 1 - Number(m[2]) : Number(m[2]);
        if (!ctx.inYears(n) || !idsHere.some((id) => ctx.inRegion(id))) continue;
        if (judge(n, idsHere, sets)?.kind !== ASTRO) continue;
        // 가까운 해가 있는 나라 하나를 대표 id로 (사전순 첫째)
        const rep = idsHere.filter((id) => sets.get(id)!.has(n - 1) || sets.get(id)!.has(n + 1)).sort()[0];
        found.push({
          kind: ASTRO,
          key: `years ${ASTRO} ${rep} ${base} ${n}`,
          msg: `[${LABEL[ASTRO]}] 생성기 ${base} 주석의 ‘${m[0]}’(${fmtYear(n)})가 ${rep}의 지도 연도(가까운 해 ${nearYears([rep], sets, n)})와 1 어긋남 — “${short(comment.replace(/^\/\/\s*/, ''), 80)}”`,
        });
      }
    }
  }
  return comments;
}

// ── 검사 ──────────────────────────────────────────────────────

export async function runYears(ctx: Context): Promise<CheckResult> {
  const sets = mapYearSets(ctx);
  const names = nameIndex(ctx);
  const { ents, evs } = readTexts(ctx.root);
  const found: Found[] = [];
  const mentions = checkTexts(ctx, sets, names, ents, evs, found);
  const evChecked = checkEventYears(ctx, evs, found);
  const comments = checkGenerators(ctx, sets, names, found);
  // 같은 열쇠는 하나로 (첫 글의 설명을 쓴다)
  const byKey = new Map<string, Found>();
  for (const f of found) if (!byKey.has(f.key)) byKey.set(f.key, f);
  const items: Item[] = [...byKey.values()].sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).map((f) => ({ key: f.key, msg: f.msg }));
  const nOld = [...byKey.values()].filter((f) => f.kind === OLD).length;
  const nAstro = byKey.size - nOld;
  return {
    checked: mentions + evChecked + comments,
    items,
    notes: [`글 속 지도 해 ${mentions}`, `옛 연도 의심 ${nOld}`, `천문 연도 의심 ${nAstro}`],
  };
}

const years: Check = {
  id: 'years',
  title: '옛 연도·기원전 연도 (글 속 지도 해, 사건 기원전 해, 생성기 주석)',
  run: (ctx: Context, _opt: Options) => runYears(ctx),
};

export const checks: Check[] = [years];

// 직접 실행: 항목 전부를 출력한다
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv[2];
  const opt: Options = { region: null, years: null, only: null, skip: [], ci: false };
  const r = await runYears(createContext(opt, ROOT));
  for (const it of r.items) if (!only || it.key.startsWith(`years ${only} `)) console.log(`${it.key}\t${it.msg}`);
  console.log(`# ${r.notes?.join(' · ')}`);
}
