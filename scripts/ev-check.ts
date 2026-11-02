// 사건 점검 도우미 (npm run ev:check): 사건 초안·반영 에이전트가 묶음마다 새로 짜던 통계·글 길이·인용 저자·새 이름·겹침 즉석 스크립트(stats.mjs·val.mjs·table.mjs 등)와
// 사실 대조가 손으로 잡던 [서지]·[표기]·[겹침] 지적 가운데 기계로 잡을 수 있는 것을 한 번에 미리 본다. 사건 데이터·사이트 글은 고치지 않는다(읽기만).
// 사용: npm run ev:check -- [<사건 파일 이름|id 앞머리> …] [--all] [--base <git rev>]
//   - 인자 없음: 작업 트리의 사건 가운데 기준(--base, 기본 HEAD)과 내용이 다르거나 새로 생긴 사건만 본다(초안·반영 뒤에 돌리는 쓰임). 바뀐 사건이 없으면 그렇게 알리고 끝(0).
//     마지막 커밋의 사건을 보려면 --base HEAD~1. 모든 사건은 --all.
//   - 인자: 사건 파일 이름의 앞부분(me-05, me-05-mamluk…yaml)이면 그 파일의 사건 모두, 아니면 사건 id 앞부분. 맞는 사건이 없는 인자는 사용법 오류(2).
//   - 사건 전문 보기는 하지 않는다(인계 폴더 tools/tabs/ev.mjs). subjects 이름이 본문에 있나는 `test:geo --only subjects`, 표기 사전의 avoid는 `--only spelling`, 글 속 해는 `--only years`가 본다(되풀이하지 않음).
// 하는 일 (고른 사건마다. 견줄 때는 저장소 사건 전부를 쓴다)
//   ① 통계: 파일별·세기별 사건 수, subjects·links 수(최소·중앙값·최대, subjects 0개). 항목을 내지 않는다.
//   ② 글 길이: 제목 글자 수, summary 글자 수·문장 수(문장은 화면과 같은 규칙 — src/panel/aboutText.tsx의 splitSentences를 옮김: 괄호·낫표 밖의 '. '에서 자름).
//      항목: summary 글자 수가 그 사건 파일 머리 주석의 'summary A~B자' 범위 밖(머리에 없으면 보지 않음) · 제목이 저장소 모든 사건 제목 길이의 95번째 백분위보다 긺 ·
//      마침표 뒤에 띄어쓰기가 없어 화면이 문장을 못 나눔('다.그') · summary 끝이 마침표가 아님.
//   ③ 인용 저자: 본문이 사람을 출처로 든 자리('X에 따르면'·'X의 기록에 따르면'·'X의 『책』에 따르면/에서'·'X는 『책』에서'·문장 첫머리 'X는 …다고 적었다/썼다/기록했다')의 X가
//      그 사건 sources에 없음. sources에 X가 한글 그대로 있거나, X의 자음 뼈대(한글 초성·받침 / 로마자 자음을 같은 무리로 묶음: 요세푸스 ≈ Josephus, 타바리 ≈ al-Ṭabarī)가
//      sources의 로마자 낱말 뼈대와 같거나(두 무리 이상) 한쪽이 다른 쪽의 앞부분(세 무리 이상)이면 있는 것으로 본다. '전승·사료·학자' 같은 말과 나라 이름은 X로 치지 않는다.
//   ④ 새 이름 후보: 본문의 '한글 이름(로마자 원어)'(예: 샤바카 석비(Shabaka Stone)) 가운데 표기 사전(data/tests/spelling.yaml의 use·avoid)에도, 저장소의 다른 사건·나라 글에도 없는 한글 표기.
//      같은 원어가 다른 사건·나라 글에서 다른 한글 표기로 쓰였으면 '표기 갈림'으로 따로 낸다. 대문자 줄임말(OPEC)은 이름이 아니라 뺀다.
//   ⑤ 겹침: (가) 「제목」(앞의 사건|뒤의 사건|같은 시기의 사건|같은 해의 사건) 또는 (「제목」, 앞의 사건) 꼴의 제목이 저장소에 없거나, 방향 말이 두 사건 year의 앞뒤와 어긋남(year가 같으면 어느 말이든 받음)(사실 대조 me-05의 '[겹침] 방향' 지적)
//      (나) 같은 subjects 나라를 둘 이상 함께 둔 사건 쌍(OVERLAP_COMMON보다 많은 사건에 든 큰 나라는 세지 않음) 가운데 시작 해가 OVERLAP_YEARS 안이고 서로 「제목」으로 가리키지 않은 것(같은 일을 두 번 쓴 후보).
// 출력: 표준 출력에 몇 줄 요약(갈래별 수와 앞 몇 건). 전체는 .cache/ev-check/report.md(사람용)·report.json(기계용).
// 종료 코드: 0 찾은 것 없음, 1 항목 있음(②~⑤), 2 사용법 오류. (3 예산으로 끊김은 쓰지 않음: 사건 전부 약 1,000개도 수 초)
// 한계: ③은 이름 뼈대가 우연히 같은 다른 저자를 '있음'으로 보아 놓치고, 왕·장군을 '적었다'(비문)로 든 문장도 후보로 낸다(비문 책이 sources에 있으면 빠짐).
//   ④는 괄호 원어가 붙은 이름만 본다(원어 없이 새로 쓴 이름은 못 잡음). 한글 낱말 수는 원어 낱말 수에 맞춰 자르므로 '아시리아 왕 X(…)'에서 앞말이 섞일 수 있다.
//   ⑤(나)는 후보일 뿐 같은 일을 다른 쪽에서 쓴 정상 사건도 나온다.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.cache/ev-check');
const USAGE = '사용: npm run ev:check -- [<사건 파일 이름|id 앞머리> …] [--all] [--base <git rev>]';

/** 제목이 이 백분위(저장소 모든 사건 제목 길이 기준)보다 길면 항목. 박은 글자 수 대신 저장소 분포를 쓴다(문서에 제목 길이 규칙이 없어서). 95는 '다른 사건 스무 개 중 하나보다 긴' 정도 */
const TITLE_PERCENTILE = 95;
/** 겹침 후보의 시작 해(year) 차이. 사건 안내서(docs/guides/event.md 3절 잇기 규칙)의 '±2년'과 같게 둠. 기간이 겹치기만 하면 긴 사건(기원전 799~473 등)이 모든 사건과 짝이 되어(서아시아 370개에서 867쌍) 시작 해로 봄 */
const OVERLAP_YEARS = 2;
/** 겹침 후보로 볼 함께 둔 subjects 수. 하나만 같으면 큰 나라(오스만·로마 등) 사건끼리 짝이 너무 많아(서아시아 370개에서 520쌍, 둘이면 108쌍) 둘 */
const OVERLAP_MIN_SHARED = 2;
/** 이보다 많은 사건에 subjects로 든 나라(2026-11-02 기준 프랑스 215·조선 199·영국 171 … 스페인 55, 약 24개)는 함께 둔 수에 넣지 않음. 큰 나라가 함께 든 것만으로 관계없는 사건이 짝이 되어서(서아시아 370개에서 108쌍 → 25쌍) */
const OVERLAP_COMMON = 50;
/** 요약에 갈래마다 보일 줄 수 */
const SHOW = 4;

class UsageError extends Error {}

interface Ev {
  id: string;
  file: string;
  year: number;
  end: number;
  title: string;
  summary: string;
  subjects: string[];
  links: number;
  sources: string[];
  /** 그 파일 머리 주석의 summary 글자 수 범위 */
  range: [number, number] | null;
  raw: string;
}

interface Found {
  kind: 'length' | 'cite' | 'name' | 'ref' | 'overlap';
  id: string;
  msg: string;
}

const s = (v: unknown): string => (typeof v === 'string' ? v : '');
const ko = (v: unknown): string => s((v as { ko?: unknown } | undefined)?.ko);

function readYaml(text: string): Record<string, unknown>[] {
  const raw = parseYaml(text) as unknown;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

/** 파일 머리 주석의 'summary 800~1,600자' */
function headRange(text: string): [number, number] | null {
  const head = text.split(/\r?\n/).filter((l) => l.startsWith('#')).join('\n');
  const m = head.match(/summary\s*([\d,]+)\s*~\s*([\d,]+)\s*자/);
  return m ? [Number(m[1].replace(/,/g, '')), Number(m[2].replace(/,/g, ''))] : null;
}

function parseEvents(file: string, text: string): Ev[] {
  const range = headRange(text);
  return readYaml(text).map((e) => {
    const year = Number(e.year);
    return {
      id: String(e.id),
      file,
      year,
      end: e.endYear === undefined || e.endYear === null ? year : Number(e.endYear),
      title: ko(e.title),
      summary: ko(e.summary),
      subjects: ((e.subjects as unknown[] | undefined) ?? []).map(String),
      links: ((e.links as unknown[] | undefined) ?? []).length,
      sources: ((e.sources as unknown[] | undefined) ?? []).map(String),
      range,
      raw: JSON.stringify(e),
    };
  });
}

function loadAll(): Ev[] {
  const dir = path.join(ROOT, 'data/events');
  return readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort().flatMap((f) => parseEvents(f, readFileSync(path.join(dir, f), 'utf8')));
}

/** 기준 rev의 사건(id → JSON). git이 없거나 rev가 틀리면 UsageError */
function baseEvents(rev: string): Map<string, string> {
  const git = (args: string[]) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  let list: string;
  try {
    list = git(['ls-tree', '--name-only', rev, 'data/events/']);
  } catch {
    throw new UsageError(`--base ${rev}: git에서 찾지 못함`);
  }
  const out = new Map<string, string>();
  for (const p of list.split('\n').filter((l) => l.endsWith('.yaml'))) for (const e of parseEvents(path.basename(p), git(['show', `${rev}:${p}`]))) out.set(e.id, e.raw);
  return out;
}

/** src/panel/aboutText.tsx의 splitSentences와 같은 규칙(그 파일은 JSX라 node로 불러올 수 없어 옮김) */
function splitSentences(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '「' || c === '『') depth++;
    else if ((c === ')' || c === '」' || c === '』') && depth > 0) depth--;
    else if (c === '.' && depth === 0 && (i + 1 === text.length || text[i + 1] === ' ')) {
      out.push(text.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

const percentile = (xs: number[], p: number) => {
  const a = [...xs].sort((x, y) => x - y);
  return a.length ? a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))] : 0;
};
const median = (xs: number[]) => percentile(xs, 50);
const century = (y: number) => (y <= 0 ? `기원전 ${Math.floor((-y) / 100) + 1}세기` : `${Math.floor((y - 1) / 100) + 1}세기`);

// ── ③ 인용 저자 ───────────────────────────────────────────────────────
/** 출처가 사람이 아닌 말(이 말로 끝나면 X로 치지 않음) */
const GENERIC = ['전승', '사료', '기록', '일화', '연구', '학자', '학자들', '학설', '견해', '추산', '통계', '조사', '보고', '보고서', '비문', '연대기', '문서', '편지', '서한', '전설',
  '이야기', '자료', '집계', '정부', '위원회', '쪽', '측', '설', '책', '글', '역사가들', '저술가들', '작가들', '사람들', '신문', '주장', '인용', '일지', '증언', '사서', '목격담', '출신', '역병', '낙서', '석비', '점토판', '파피루스', '기념비', '명문', '설명', '서술', '해석', '계산', '전통'];
const PRONOUN = new Set(['그', '이', '이들', '그들', '그녀', '이는', '이것', '당시', '뒤', '훗날', '후대', '당대', '일부', '다른', '어떤', '한']);
const isGeneric = (w: string) => PRONOUN.has(w) || GENERIC.some((g) => w === g || w.endsWith(g));

const INI = ['K', 'K', 'N', 'T', 'T', 'R', 'M', 'P', 'P', 'S', 'S', '', 'S', 'S', 'S', 'K', 'T', 'P', 'H'];
const FIN = ['', 'K', 'K', 'K', 'N', 'N', 'N', 'T', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'M', 'P', 'P', 'S', 'S', 'N', 'S', 'S', 'K', 'T', 'P', 'H'];
const collapse = (x: string) => x.replace(/(.)\1+/g, '$1');
/** 한글 낱말의 자음 뼈대 */
function skelKo(w: string): string {
  let o = '';
  for (const ch of w) {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) continue;
    o += INI[Math.floor(c / 588)] + FIN[c % 28];
  }
  return collapse(o);
}
/** 로마자 낱말의 자음 뼈대 (발음 구별 기호를 떼고 같은 무리로) */
function skelLat(w: string): string {
  let t = w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  t = t.replace(/kh/g, 'H').replace(/gh/g, 'K').replace(/sh/g, 'S').replace(/ch/g, 'K').replace(/th/g, 'T').replace(/ph/g, 'P').replace(/dh/g, 'T').replace(/ts/g, 'S').replace(/ck/g, 'K').replace(/qu/g, 'K').replace(/x/g, 'KS');
  const map: Record<string, string> = { b: 'P', p: 'P', f: 'P', v: 'P', d: 'T', t: 'T', g: 'K', k: 'K', q: 'K', c: 'K', s: 'S', z: 'S', j: 'S', l: 'R', r: 'R', m: 'M', n: 'N', h: 'H' };
  let o = '';
  for (const ch of t) o += /[A-Z]/.test(ch) ? ch : (map[ch] ?? '');
  return collapse(o);
}
const noH = (x: string) => collapse(x.replace(/H/g, ''));
function skelMatch(a: string, b: string): boolean {
  for (const [x, y] of [[a, b], [noH(a), noH(b)]]) {
    if (x.length < 2 || y.length < 2) continue;
    if (x === y) return true;
    if (Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x))) return true;
  }
  return false;
}
/** 아랍어 관사가 붙은 한글 꼴('알마크리지' → '마크리지')도 함께 */
const koForms = (w: string) => {
  const r = [w];
  const m = w.match(/^(?:알|앗|안|아르|아즈|아스|앗|엘)([가-힣]{2,})$/);
  if (m) r.push(m[1]);
  return r;
};

/** 본문에서 사람을 출처로 든 자리의 X 모으기 */
function citedNames(summary: string, countryWords: Set<string>): { name: string; at: string }[] {
  const out: { name: string; at: string }[] = [];
  const push = (raw: string, at: string) => {
    let words = raw.trim().split(/\s+/).filter(Boolean);
    // 'X는 살아남은 …'처럼 둘째 낱말까지 잡혔으면 조사 붙은 첫 낱말에서 끊는다
    const cut = words.findIndex((w) => /[은는]$/.test(w));
    if (cut >= 0) words = [...words.slice(0, cut), words[cut].slice(0, -1)];
    while (words.length && /^(?:그리고|그러나|또|또한|한편|이어|곧|뒤에|훗날|당시)$/.test(words[0])) words.shift();
    if (!words.length) return;
    const last = words[words.length - 1];
    if (isGeneric(last) || words.some((w) => PRONOUN.has(w)) || countryWords.has(last) || last.length < 2) return;
    if (words.some((w) => /(?:에서|에게|에도|부터|까지|으로|에는)$/.test(w))) return; // 'X에서는 …' 같은 장소·때 말
    out.push({ name: words.slice(-2).join(' '), at });
  };
  // 'X에 따르면', 'X의 기록에 따르면'
  for (const m of summary.matchAll(/((?:[가-힣]+ ){0,2}[가-힣]+)에 따르면/g)) {
    const words = m[1].split(' ');
    const last = words[words.length - 1];
    if (isGeneric(last)) {
      const prev = words[words.length - 2];
      if (prev?.endsWith('의')) push(prev.slice(0, -1), m[0]);
      continue;
    }
    push(last, m[0]);
  }
  // 'X의 『책』에 따르면/에서/에는', 'X가 쓴 『책』에 따르면/에서', 'X는 『책』에서'. 'X의 『책』'만으로는 세지 않는다(한국사 사건처럼 책이 사건의 대상인 글이 많아 틀린 경보가 대부분이었음)
  for (const m of summary.matchAll(/([가-힣]{2,}(?: [가-힣0-9]+)?)(?:의|이 쓴|가 쓴|이 지은|가 지은|이 남긴|가 남긴) 『[^』]+』(?:에 따르면|에서|에는)/g)) push(m[1], m[0]);
  for (const m of summary.matchAll(/([가-힣]{2,})(?:은|는) 『[^』]+』에서/g)) push(m[1], m[0]);
  // 문장(또는 쉼표 뒤 마디) 첫머리 'X는 … 다고/라고 적었다'
  for (const sen of splitSentences(summary)) {
    const m = sen.match(/^(?:[^,]*, )?([가-힣]{2,}(?: [가-힣0-9]+)?)(?:은|는) .*(?:다고|라고|이라고) (?:적었다|썼다|기록했다|기록한다|적는다|쓴다|적고 있다)/); // '말했다'·'남겼다'는 사건 속 인물의 말·행동인 일이 많아 뺌
    if (m) push(m[1], sen.slice(0, 40));
  }
  return out;
}

function sourceHas(name: string, sources: string[]): boolean {
  const text = sources.join(' ');
  const words = name.split(' ').filter((w) => !/^(?:이븐|빈|아부|\d+세)$/.test(w));
  if (words.some((w) => text.includes(w))) return true;
  const lat = [...new Set(text.split(/[^A-Za-zÀ-ɏḀ-ỿʿʾ'’-]+/).flatMap((t) => t.split(/[-'’ʿʾ]/)).filter((t) => t.length >= 3))].map(skelLat);
  return words.some((w) => koForms(w).some((f) => lat.some((l) => skelMatch(skelKo(f), l))));
}

// ── ④ 새 이름 ───────────────────────────────────────────────────────
const LATIN_PAREN = /([가-힣0-9][가-힣0-9·\- ]*)\(([A-Za-zÀ-ɏḀ-ỿʿʾ'’][A-Za-zÀ-ɏḀ-ỿʿʾ'’\-. ]*)\)/g;
function originalNames(text: string): { ko: string; orig: string }[] {
  const out: { ko: string; orig: string }[] = [];
  for (const m of text.matchAll(LATIN_PAREN)) {
    const orig = m[2].trim();
    if (/^[A-Z0-9.\- ]+$/.test(orig)) continue; // 줄임말
    const n = Math.min(4, orig.split(/\s+/).length);
    const words = m[1].trim().split(/\s+/);
    const name = words.slice(-n).join(' ');
    if (name.length < 2 || !/[가-힣]/.test(name)) continue;
    out.push({ ko: name, orig });
  }
  return out;
}

function spellingWords(): Set<string> {
  const file = path.join(ROOT, 'data/tests/spelling.yaml');
  const set = new Set<string>();
  if (!existsSync(file)) return set;
  for (const e of readYaml(readFileSync(file, 'utf8'))) {
    if (typeof e.use === 'string') set.add(e.use);
    for (const a of (e.avoid as unknown[] | undefined) ?? []) set.add(String(a));
  }
  return set;
}

interface EntityText {
  ko: string;
  texts: string[];
}
function loadEntities(): Map<string, EntityText> {
  const dir = path.join(ROOT, 'data/entities');
  const map = new Map<string, EntityText>();
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readYaml(readFileSync(path.join(dir, f), 'utf8'))) {
      const basis = e.basis as { foundingNote?: unknown; refs?: unknown[] } | undefined;
      const texts = [ko(e.names), s(e.summary), s(e.details), s(e.mapNote), s(e.endNote), ...((e.features as unknown[] | undefined) ?? []).map(String), s(basis?.foundingNote)].filter(Boolean);
      map.set(String(e.id), { ko: ko(e.names), texts });
    }
  }
  return map;
}

// ── 실행 ───────────────────────────────────────────────────────────
function parseArgs(argv: string[]) {
  const a = { names: [] as string[], all: false, base: 'HEAD' };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (f === '--all') a.all = true;
    else if (f === '--base') {
      const v = argv[++i];
      if (!v || v.startsWith('--')) throw new UsageError('--base 다음에 git rev가 필요');
      a.base = v;
    } else if (f === '--help' || f === '-h') throw new UsageError('');
    else if (f.startsWith('--')) throw new UsageError(`모르는 인자 ${f}`);
    else a.names.push(f);
  }
  if (a.all && a.names.length) throw new UsageError('--all과 사건 이름을 함께 쓸 수 없음');
  return a;
}

function main(): number {
  const args = parseArgs(process.argv.slice(2));
  const t0 = Date.now();
  const all = loadAll();
  let picked: Ev[];
  let how: string;
  if (args.all) {
    picked = all;
    how = '모든 사건';
  } else if (args.names.length) {
    const set = new Set<Ev>();
    for (const n of args.names) {
      const fname = n.replace(/\.yaml$/, '');
      const byFile = all.filter((e) => e.file.replace(/\.yaml$/, '').startsWith(fname));
      const hit = byFile.length ? byFile : all.filter((e) => e.id.startsWith(n));
      if (!hit.length) throw new UsageError(`'${n}'에 맞는 사건 파일·사건 id가 없음`);
      for (const e of hit) set.add(e);
    }
    picked = [...set];
    how = `인자 ${args.names.join(' ')}`;
  } else {
    const base = baseEvents(args.base);
    picked = all.filter((e) => base.get(e.id) !== e.raw);
    how = `기준 ${args.base}에서 바뀐 사건(새 사건 ${picked.filter((e) => !base.has(e.id)).length})`;
    if (!picked.length) {
      console.log(`ev:check: 기준 ${args.base}에서 바뀐 사건이 없음 — 모든 사건은 --all, 특정 사건은 파일 이름·id 앞머리를 인자로`);
      return 0;
    }
  }
  const found: Found[] = [];
  const entities = loadEntities();
  const countryWords = new Set<string>();
  for (const e of entities.values()) for (const w of e.ko.replace(/\s*\([^)]*\)/g, '').split(/\s+/)) countryWords.add(w);

  // ① 통계
  const byFile = new Map<string, number>();
  const byCentury = new Map<string, { n: number; y: number }>();
  for (const e of picked) {
    byFile.set(e.file, (byFile.get(e.file) ?? 0) + 1);
    const c = century(e.year);
    const v = byCentury.get(c) ?? { n: 0, y: e.year };
    v.n++;
    byCentury.set(c, v);
  }
  const subjN = picked.map((e) => e.subjects.length);
  const linkN = picked.map((e) => e.links);
  const stats = [
    `사건 ${picked.length}개 (${how}) · 파일 ${byFile.size}개`,
    `세기별: ${[...byCentury].sort((a, b) => a[1].y - b[1].y).map(([c, v]) => `${c} ${v.n}`).join(' · ')}`,
    `subjects 수: 최소 ${Math.min(...subjN)} · 중앙값 ${median(subjN)} · 최대 ${Math.max(...subjN)} · 0개 ${subjN.filter((n) => n === 0).length} / links 수: 중앙값 ${median(linkN)} · 최대 ${Math.max(...linkN)}`,
  ];

  // ② 글 길이
  const titleMax = percentile(all.map((e) => e.title.length), TITLE_PERCENTILE);
  const lens = picked.map((e) => ({ e, t: e.title.length, n: e.summary.length, k: splitSentences(e.summary).length }));
  stats.push(`글 길이: 제목 중앙값 ${median(lens.map((x) => x.t))}자(저장소 ${TITLE_PERCENTILE}% ${titleMax}자) · summary 중앙값 ${median(lens.map((x) => x.n))}자 · 최소 ${Math.min(...lens.map((x) => x.n))} · 최대 ${Math.max(...lens.map((x) => x.n))} · 문장 중앙값 ${median(lens.map((x) => x.k))}`);
  for (const { e, t, n, k } of lens) {
    if (e.range && (n < e.range[0] || n > e.range[1])) found.push({ kind: 'length', id: e.id, msg: `summary ${n.toLocaleString()}자(문장 ${k}) — 파일 머리 기준 ${e.range[0]}~${e.range[1].toLocaleString()}자 밖${n < e.range[0] ? '(주변 등급 땅만의 일이면 개관 분량 300~500자도 됨)' : ''}` });
    if (t > titleMax) found.push({ kind: 'length', id: e.id, msg: `제목 ${t}자 — 저장소 제목의 ${TITLE_PERCENTILE}%(${titleMax}자)보다 긺: ${e.title}` });
    const glued = e.summary.match(/[가-힣)」』]\.(?=[가-힣「『(])/g);
    if (glued) found.push({ kind: 'length', id: e.id, msg: `마침표 뒤 띄어쓰기 없음 ${glued.length}곳 — 화면이 문장을 나누지 못함` });
    if (e.summary && !/\.$/.test(e.summary.trim())) found.push({ kind: 'length', id: e.id, msg: `summary 끝이 마침표가 아님: …${e.summary.trim().slice(-15)}` });
  }

  // ③ 인용 저자
  for (const e of picked) {
    const seen = new Set<string>();
    for (const c of citedNames(e.summary, countryWords)) {
      if (seen.has(c.name)) continue;
      seen.add(c.name);
      if (!sourceHas(c.name, e.sources)) found.push({ kind: 'cite', id: e.id, msg: `본문이 '${c.name}'을(를) 출처로 들었으나 sources에 없어 보임 — "${c.at}"` });
    }
  }

  // ④ 새 이름
  const dict = spellingWords();
  const allText = [...all.map((x) => `${x.title}\n${x.summary}`), ...[...entities.values()].flatMap((x) => x.texts)].join('\n');
  const count = (text: string, needle: string) => {
    let n = 0;
    for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1)) n++;
    return n;
  };
  const origUse = new Map<string, Map<string, string>>(); // 원어(소문자) → 한글 표기 → 처음 쓴 곳
  for (const x of all) for (const o of originalNames(`${x.title}\n${x.summary}`)) {
    const k = o.orig.toLowerCase();
    if (!origUse.has(k)) origUse.set(k, new Map());
    if (!origUse.get(k)!.has(o.ko)) origUse.get(k)!.set(o.ko, x.id);
  }
  for (const [id, x] of entities) for (const t of x.texts) for (const o of originalNames(t)) {
    const k = o.orig.toLowerCase();
    if (!origUse.has(k)) origUse.set(k, new Map());
    if (!origUse.get(k)!.has(o.ko)) origUse.get(k)!.set(o.ko, `나라 ${id}`);
  }
  for (const e of picked) {
    const seen = new Set<string>();
    for (const o of originalNames(`${e.title}\n${e.summary}`)) {
      if (seen.has(o.ko)) continue;
      seen.add(o.ko);
      const variants = [...(origUse.get(o.orig.toLowerCase()) ?? new Map<string, string>())].filter(([k, where]) => k !== o.ko && where !== e.id);
      if (variants.length) {
        found.push({ kind: 'name', id: e.id, msg: `표기 갈림: '${o.ko}'(${o.orig}) ↔ ${variants.map(([k, w]) => `'${k}'(${w})`).join(', ')}` });
        continue;
      }
      if (dict.has(o.ko)) continue;
      // 저장소 전체 글에서 나온 수가 이 사건 글에서 나온 수보다 많으면 다른 글에도 있는 것
      if (count(allText, o.ko) > count(`${e.title}\n${e.summary}`, o.ko)) continue;
      found.push({ kind: 'name', id: e.id, msg: `새 이름 후보: '${o.ko}'(${o.orig}) — 표기 사전·다른 글에 없음(사전에 더할지 확인)` });
    }
  }

  // ⑤ 겹침
  const byTitle = new Map<string, Ev[]>();
  // 제목 끝의 해 괄호('(1916~1928)')를 뗀 꼴로도 찾는다(본문이 해를 빼고 가리키는 일이 많음)
  const plain = (title: string) => title.replace(/\s*\([^()]*\)$/, '');
  for (const x of all) for (const k of new Set([x.title, plain(x.title)])) byTitle.set(k, [...(byTitle.get(k) ?? []), x]);
  const refs = new Map<string, Set<string>>(); // 사건 id → 「제목」으로 가리킨 사건 id
  for (const x of all) {
    const set = new Set<string>();
    for (const m of x.summary.matchAll(/「([^」]+)」/g)) for (const y of byTitle.get(m[1]) ?? []) set.add(y.id);
    refs.set(x.id, set);
  }
  for (const e of picked) {
    for (const m of e.summary.matchAll(/「([^」]+)」(?:\(|, ?)(앞의|뒤의|같은 시기의|같은 해의) 사건/g)) {
      const hits = byTitle.get(m[1]) ?? [];
      if (!hits.length) {
        found.push({ kind: 'ref', id: e.id, msg: `가리킨 「${m[1].slice(0, 40)}」(${m[2]} 사건)의 제목이 저장소에 없음` });
        continue;
      }
      const y = hits[0].year;
      if (y === e.year) continue; // 같은 해는 달 순서로 앞·뒤를 쓰기도 해 어느 말이든 받음
      const want = y < e.year ? '앞의' : '뒤의';
      const got = m[2];
      if (want !== got) found.push({ kind: 'ref', id: e.id, msg: `「${m[1].slice(0, 30)}…」(${m[2]} 사건) — 그 사건 year ${y}, 이 사건 year ${e.year}라 '${want} 사건'` });
    }
  }
  const subjFreq = new Map<string, number>();
  for (const x of all) for (const sid of x.subjects) subjFreq.set(sid, (subjFreq.get(sid) ?? 0) + 1);
  const pairs = new Set<string>();
  for (const e of picked) {
    for (const x of all) {
      if (x.id === e.id) continue;
      const pk = [e.id, x.id].sort().join(' ');
      if (pairs.has(pk)) continue;
      const shared = e.subjects.filter((sid) => x.subjects.includes(sid) && (subjFreq.get(sid) ?? 0) <= OVERLAP_COMMON);
      if (shared.length < OVERLAP_MIN_SHARED) continue;
      if (Math.abs(x.year - e.year) > OVERLAP_YEARS) continue;
      if (refs.get(e.id)?.has(x.id) || refs.get(x.id)?.has(e.id)) continue;
      pairs.add(pk);
      found.push({ kind: 'overlap', id: e.id, msg: `겹침 후보: ${x.id}(${x.file}, ${x.year}~${x.end}) — 함께 둔 subjects ${shared.join('·')}, 서로 「」로 가리키지 않음` });
    }
  }

  // 출력
  const KINDS: [Found['kind'], string][] = [['length', '② 글 길이'], ['cite', '③ 인용 저자가 sources에 없음'], ['name', '④ 새 이름·표기 갈림'], ['ref', '⑤ 「제목」 가리킴'], ['overlap', '⑤ 겹침 후보']];
  mkdirSync(OUT_DIR, { recursive: true });
  const md: string[] = [`# ev:check 보고 (${new Date().toISOString().slice(0, 16)})`, '', '## ① 통계', '', ...stats.map((l) => `- ${l}`), `- 파일별: ${[...byFile].map(([f, n]) => `${f} ${n}`).join(' · ')}`, ''];
  for (const [k, label] of KINDS) {
    const xs = found.filter((f) => f.kind === k);
    md.push(`## ${label} (${xs.length})`, '', ...xs.map((f) => `- \`${f.id}\` ${f.msg}`), '');
  }
  const perEvent = lens.map(({ e, t, n, k }) => `| ${e.id} | ${e.year}~${e.end} | ${t} | ${n} | ${k} | ${e.subjects.length} | ${e.sources.length} |`);
  md.push('## 사건별 수', '', '| id | 해 | 제목 자 | summary 자 | 문장 | subjects | sources |', '|---|---|---|---|---|---|---|', ...perEvent, '');
  writeFileSync(path.join(OUT_DIR, 'report.md'), md.join('\n'));
  writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify({ how, events: picked.map((e) => e.id), stats, found }, null, 1));

  console.log(`ev:check: ${stats[0]} · 항목 ${found.length} · ${((Date.now() - t0) / 1000).toFixed(1)}초`);
  console.log(`  ${stats[1]}`);
  console.log(`  ${stats[2]}`);
  console.log(`  ${stats[3]}`);
  for (const [k, label] of KINDS) {
    const xs = found.filter((f) => f.kind === k);
    if (!xs.length) continue;
    console.log(`${label} ${xs.length}`);
    for (const f of xs.slice(0, SHOW)) console.log(`  - ${f.id} ${f.msg}`.slice(0, 220));
  }
  console.log(`자세한 것: ${path.relative(ROOT, path.join(OUT_DIR, 'report.md')).replace(/\\/g, '/')}`);
  return found.length ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (e) {
  if (e instanceof UsageError) {
    if (e.message) console.error(`ev:check: ${e.message}`);
    console.error(USAGE);
    process.exitCode = 2;
  } else throw e;
}
