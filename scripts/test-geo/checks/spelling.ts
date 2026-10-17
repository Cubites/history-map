// test:geo 검사 `spelling` (표기). 사건·나라의 화면 글에 표기 사전(data/tests/spelling.yaml)의 '쓰지 않을 표기(avoid)'가 있는지 본다.
// 사용: npm run test:geo -- --only spelling [--region europe] [--years 1500-1600]
// 보는 글(화면에 나오는 글): 사건 title.ko·summary.ko·links[].note·places[].name·sources[] / 나라 names.ko·summary·basis.foundingNote·basis.refs[].
//   나라 이름의 별칭 칸은 지금 스키마에 없다(names.en·native는 원어라 보지 않음). 전쟁 보기(data/wars)의 글은 보지 않는다.
// 사전 한 항목: use(바른 표기)·avoid[](쓰지 않을 표기)·note(근거 한 줄)·선택 scope(사람이 읽는 메모, 코드는 쓰지 않음)·선택 except[](avoid가 다른 대상을 가리켜 맞는 글 조각). 형식은 사전 파일 머리 주석에 있다.
// 규칙: 한국어는 조사가 붙으므로 avoid를 부분 문자열로 찾는다. 걸린 자리가 (1) 그 항목 use가 나온 자리 안이거나 (2) except 조각이 나온 자리 안이면 건너뛴다.
//   한 항목 안에서 더 긴 avoid가 같은 자리를 이미 잡았으면(예: 드니스터강과 드니스터) 짧은 쪽은 세지 않는다. 같은 (대상, 필드, avoid)는 한 건으로 묶고 msg에 횟수를 적는다.
// 사전 파일 형식이 틀리면(필드 빠짐·모르는 칸·avoid가 use와 같음·같은 avoid가 두 항목에·except가 avoid를 담지 않음 등) SpellingError를 던져 러너가 종료 코드 2로 끝낸다(zones.ts와 같은 방식).
// 열쇠: `spelling <대상 id> <필드> <avoid 표기>` (위치 없이. 필드는 title·summary·links.note·places.name·sources·names.ko·foundingNote·refs). msg에 바른 표기와 글 앞뒤 15자.
// 기준선: data/tests/baseline/spelling.txt — 지금 섞여 있는 표기. 고치는 것은 사건 글을 손볼 때이고, 고친 뒤 `npm run test:geo -- --only spelling --update-baseline spelling`으로 줄인다.
//   러너의 --update-baseline이 파일 맨 위 # 주석을 그대로 두고 열쇠만 다시 쓴다.
// 한계(틀린 경보가 날 수 있는 곳): 글자만 보므로 같은 글자가 다른 대상을 가리키는 경우(예: 다른 나라 인물의 같은 이름)는 사전 항목의 except로 막아야 한다.
//   시대에 따라 맞는 표기가 갈리는 이름(키예프/키이우, 안티오크/안티오키아)은 글자만으로 가를 수 없어 사전에 넣지 않았다(사전 파일 맨 아래 주석).
//   사건 글 필드는 위 목록뿐이라 tags·id 같은 비표시 칸은 보지 않는다.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { REGION_FILTER_OF, regionOfEventFile } from '../../../src/schema/regions.ts';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
/** 사전 파일의 저장소 안 경로 */
export const SPELLING_REL = 'data/tests/spelling.yaml';
const CONTEXT_CHARS = 15;
const KNOWN_FIELDS = new Set(['use', 'avoid', 'note', 'scope', 'except']);

export interface SpellingEntry {
  use: string;
  avoid: string[];
  note: string;
  scope: string | null;
  except: string[];
}

/** 사전 파일 형식 오류. 러너가 예외로 받아 종료 코드 2로 끝낸다(스택 대신 메시지만 보이게 함) */
export class SpellingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpellingError';
    this.stack = message;
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/** 사전 글을 읽어 검사한다. 틀리면 SpellingError(모든 오류를 모아 한 번에 보임) */
export function parseSpelling(text: string, file = SPELLING_REL): SpellingEntry[] {
  let raw: unknown;
  try {
    raw = parseYaml(text);
  } catch (e) {
    throw new SpellingError(`표기 사전 ${file}을 YAML로 읽지 못함: ${(e as Error).message.split('\n')[0]}`);
  }
  if (!Array.isArray(raw)) throw new SpellingError(`표기 사전 ${file}: 최상위는 항목 목록(- use: …)이어야 함`);
  const errs: string[] = [];
  const out: SpellingEntry[] = [];
  const avoidOwner = new Map<string, string>();
  raw.forEach((r, i) => {
    const label = `항목 ${i + 1}${isObj(r) && isText(r.use) ? `(${r.use})` : ''}`;
    if (!isObj(r)) {
      errs.push(`${label}: 항목은 use·avoid·note 칸을 가진 묶음이어야 함`);
      return;
    }
    for (const k of Object.keys(r)) if (!KNOWN_FIELDS.has(k)) errs.push(`${label}: 모르는 칸 '${k}' (있는 칸: ${[...KNOWN_FIELDS].join('·')})`);
    if (!isText(r.use)) errs.push(`${label}: use(바른 표기)가 없거나 글이 아님`);
    if (!isText(r.note)) errs.push(`${label}: note(근거 한 줄)가 없거나 글이 아님`);
    if (r.scope !== undefined && r.scope !== null && !isText(r.scope)) errs.push(`${label}: scope는 글이어야 함`);
    let avoid: string[] = [];
    if (!Array.isArray(r.avoid) || r.avoid.length === 0) errs.push(`${label}: avoid는 쓰지 않을 표기 목록(하나 이상)이어야 함`);
    else {
      for (const a of r.avoid) {
        if (!isText(a)) {
          errs.push(`${label}: avoid에 글이 아닌 값이 있음`);
          continue;
        }
        if (a === r.use) errs.push(`${label}: avoid '${a}'가 use와 같음`);
        const owner = avoidOwner.get(a);
        if (owner !== undefined) errs.push(`${label}: avoid '${a}'가 ${owner}에도 있음(같은 avoid는 한 항목에만)`);
        else avoidOwner.set(a, label);
        avoid.push(a);
      }
    }
    let except: string[] = [];
    if (r.except !== undefined && r.except !== null) {
      if (!Array.isArray(r.except) || !r.except.every(isText)) errs.push(`${label}: except는 글 조각 목록이어야 함`);
      else {
        except = r.except as string[];
        for (const x of except) if (!avoid.some((a) => x.includes(a))) errs.push(`${label}: except '${x}'가 avoid 표기를 포함하지 않아 쓸모가 없음`);
      }
    }
    if (isText(r.use) && isText(r.note)) out.push({ use: r.use, avoid, note: r.note, scope: isText(r.scope) ? r.scope : null, except });
  });
  // 어느 항목의 avoid가 다른 항목의 use와 같으면 서로 부딪힌다
  for (const e of out) for (const a of e.avoid) for (const o of out) if (o !== e && o.use === a) errs.push(`avoid '${a}'(${e.use})가 다른 항목의 use와 같음`);
  if (errs.length) throw new SpellingError([`표기 사전 ${file} 형식 오류 ${errs.length}건 — ${errs[0]}`, ...errs.slice(1, 12), ...(errs.length > 12 ? [`… 외 ${errs.length - 12}건`] : [])].join('\n'));
  return out;
}

/** 사전 파일을 읽어 검사한다(파일이 없으면 SpellingError) */
export function loadSpelling(root = ROOT): SpellingEntry[] {
  let text: string;
  try {
    text = readFileSync(path.join(root, SPELLING_REL), 'utf8');
  } catch {
    throw new SpellingError(`표기 사전 ${SPELLING_REL}을 읽지 못함 — 파일이 없거나 열 수 없음`);
  }
  return parseSpelling(text);
}

interface Text {
  /** 대상(사건·나라) id */
  id: string;
  /** 대상 이름: 사건 제목, 나라 ko */
  label: string;
  field: string;
  text: string;
}

const readList = (file: string): Record<string, unknown>[] => {
  const raw = parseYaml(readFileSync(file, 'utf8')) as unknown;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
};
const s = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);

/** 검사할 화면 글 모으기 (--region·--years 거르기 적용) */
function collectTexts(ctx: Context, opt: Options): Text[] {
  const out: Text[] = [];
  const add = (id: string, label: string, field: string, v: unknown) => {
    const t = s(v);
    if (t !== null) out.push({ id, label, field, text: t });
  };
  const dir = path.join(ctx.root, 'data/events');
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const region = regionOfEventFile(f);
    if (opt.region !== null && region !== undefined && region !== opt.region && REGION_FILTER_OF[region] !== opt.region) continue;
    for (const e of readList(path.join(dir, f))) {
      const year = Number(e.year);
      const end = e.endYear === undefined || e.endYear === null ? year : Number(e.endYear);
      if (!ctx.overlapsYears(year, end + 1)) continue;
      const id = String(e.id);
      const title = s((e.title as { ko?: unknown } | undefined)?.ko) ?? id;
      add(id, title, 'title', title);
      add(id, title, 'summary', (e.summary as { ko?: unknown } | undefined)?.ko);
      for (const l of (e.links as { note?: unknown }[] | undefined) ?? []) add(id, title, 'links.note', l.note);
      for (const p of (e.places as { name?: unknown }[] | undefined) ?? []) add(id, title, 'places.name', p.name);
      for (const src of (e.sources as unknown[] | undefined) ?? []) add(id, title, 'sources', src);
    }
  }
  const edir = path.join(ctx.root, 'data/entities');
  for (const f of readdirSync(edir).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readList(path.join(edir, f))) {
      const id = String(e.id);
      if (!ctx.inRegion(id)) continue;
      const from = Number(e.from);
      const to = e.to === null || e.to === undefined ? null : Number(e.to);
      if (!ctx.overlapsYears(from, to)) continue;
      const ko = s((e.names as { ko?: unknown } | undefined)?.ko) ?? id;
      add(id, ko, 'names.ko', ko);
      add(id, ko, 'summary', e.summary);
      const basis = e.basis as { foundingNote?: unknown; refs?: unknown[] } | undefined;
      add(id, ko, 'foundingNote', basis?.foundingNote);
      for (const r of basis?.refs ?? []) add(id, ko, 'refs', r);
    }
  }
  return out;
}

/** text 안에서 needle이 나온 자리 [시작, 끝) 목록 */
function spans(text: string, needle: string): [number, number][] {
  const r: [number, number][] = [];
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1)) r.push([i, i + needle.length]);
  return r;
}
const covered = (a: number, b: number, by: [number, number][]) => by.some(([x, y]) => x <= a && b <= y);

/** 글 하나에서 걸린 자리: 항목 하나의 avoid 표기와 그 자리 */
export function findAvoid(text: string, e: SpellingEntry): { avoid: string; at: number }[] {
  const skip = [...spans(text, e.use), ...e.except.flatMap((x) => spans(text, x))];
  const hits: { avoid: string; a: number; b: number }[] = [];
  for (const avoid of e.avoid) for (const [a, b] of spans(text, avoid)) if (!covered(a, b, skip)) hits.push({ avoid, a, b });
  // 같은 항목에서 더 긴 avoid 안에 든 짧은 avoid는 센 것으로 치지 않는다
  return hits.filter((h) => !hits.some((o) => o !== h && o.a <= h.a && h.b <= o.b && (o.b - o.a > h.b - h.a))).map((h) => ({ avoid: h.avoid, at: h.a }));
}

const spelling: Check = {
  id: 'spelling',
  title: '표기 (표기 사전의 쓰지 않을 표기)',
  async run(ctx: Context, opt: Options): Promise<CheckResult> {
    const dict = loadSpelling(ctx.root);
    const texts = collectTexts(ctx, opt);
    const found = new Map<string, { item: Item; n: number }>();
    for (const t of texts) {
      for (const e of dict) {
        for (const h of findAvoid(t.text, e)) {
          const key = `spelling ${t.id} ${t.field} ${h.avoid}`;
          const hit = found.get(key);
          if (hit) {
            hit.n++;
            continue;
          }
          const before = t.text.slice(Math.max(0, h.at - CONTEXT_CHARS), h.at);
          const after = t.text.slice(h.at + h.avoid.length, h.at + h.avoid.length + CONTEXT_CHARS);
          found.set(key, { item: { key, msg: `${t.label}(${t.id}) ${t.field}: '${h.avoid}' → '${e.use}'. …${before}[${h.avoid}]${after}…`.replace(/\s+/g, ' ') }, n: 1 });
        }
      }
    }
    const items = [...found.values()].map(({ item, n }) => (n > 1 ? { ...item, msg: `${item.msg} (같은 글에 ${n}번)` } : item));
    return { checked: texts.length, items, notes: [`사전 ${dict.length}항목·글 ${texts.length}개`] };
  },
};

export const checks: Check[] = [spelling];

