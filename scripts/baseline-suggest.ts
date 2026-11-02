// 기준선·허용 줄 자동 제안 (npm run baseline:suggest): 에이전트가 허용·기준선 파일을 손으로 고치던 반복(서아시아 기록에서 약 400번)과 임시 도우미(gapbase.mjs)를 줄이려고 만들었다.
// test:geo가 이미 쓴 보고서(.cache/test-geo/report.json)와 월경지 목록 출력 파일을 읽기만 하고 다시 계산하지 않는다. 기존 test:geo·--update-baseline 동작은 건드리지 않는다.
// 사용: npm run baseline:suggest -- [--report <report.json>]… [--write] [--from-exclaves <파일> [--exclaves-before <파일>] [--min-km2 30] [--years 시작-끝] [--bbox 서,남,동,북]]
//                                  [--skip-zone <구역 이름 앞머리,…>] [--gap-tol <km² | N%>] [--prune <검사 id,…>] [--label <글>] [--date YYYY-MM-DD]
// 하는 일 (HANDOFF 'A2·A3a·A3b에서 배운 것'의 세 규칙):
//   규칙 1 낡은 허용 줄 지우기: 범위 '전체' 보고서에서 검사(기본 events)의 staleAllow 열쇠를 data/tests/allow/<검사 id>.yaml에서 지운다('<해> <id> 버전' 줄 등).
//          줄이 모두 빠진 `# ──` 절 머리(와 그 앞 빈 줄)도 지운다(사건 묶음 커밋들이 손으로 하던 꼴). 범위가 '전체'가 아닌 보고서는 이 규칙에 쓰지 않는다(test:geo가 낡음을 계산하지 않음). `--changed`로 돈 보고서도 늘 건너뜀(범위가 좁아 낡음 판정을 안 함, 건너뜀 문구에 적음).
//   규칙 2 다른 권역 옛 빈 땅: gaps 새 실패 가운데 '기준선에 없는 새 빈 땅'만, 같은 구역의 바로 앞 해나 바로 뒤 해 기준선 줄과 견주어 gaps 검사의 '같음' 판정
//          (shapes.ts runGaps: 총넓이 ≤ 그 줄 + 여유, 여유보다 큰 조각의 상자는 모두 그 줄에 있음)을 통과할 때만 그 해 줄을 만든다. 여유는 gapGrowKm2
//          (칸마다 겹치는 구역의 최소라 보고서만으로는 모름 → data/tests/zones.yaml의 가장 작은 값을 써서 검사보다 엄격하거나 같게. --gap-tol로 바꿈).
//          줄 꼴은 shapes.ts baselineText와 같은 `<구역> <해>\t<총넓이>\t<상자;상자>`. '늘어남'·'새 조각'과 앞뒤가 다른 칸(이번에 바꾼 권역의 진짜 새 빈 땅)은 제안하지 않고 목록만 보인다.
//          --skip-zone은 그 앞머리로 시작하는 구역(예: 이번에 바꾼 권역의 구역)을 아예 뺀다. 보고서는 --years로 나눠 돈 것 여러 개를 함께 줄 수 있다(--report를 되풀이).
//   규칙 3 사막 비움 해안 월경지: report.json에는 월경지가 없다(test:geo 검사가 아님). 그래서 `npm run check:exclaves > <파일>`이나 check:data 출력 파일을 --from-exclaves로 받아
//          '확인'(허용 목록에 없음) 조각 가운데 --min-km2(기본 30 = check:data가 경고하는 크기) 이상, --exclaves-before 파일(바꾸기 전 출력)에 똑같이 있던 조각은 빼고,
//          같은 나라·이어진 기간(앞 버전 끝 해 = 뒤 버전 첫 해)·같은 자리(대표점 차이 0.05° 안)를 한 줄로 묶어 A3a 꼴 항목(entity·from·to·at·reason·sources)을 만든다.
//          at은 묶음 첫 조각의 대표점(조각 안의 점). 이유는 규칙 이름·날짜를 넣은 틀 문장이라 쓴 뒤 역사 근거·출처를 사람이 고쳐야 한다. 쓴 뒤 check:exclaves로 맞는지 확인한다.
// 낡음 판단: 보고서·월경지 파일이 data/ 아래 파일(data/tests와 data/exclaves.yaml은 빼고)보다 오래됐으면 알리고 그 입력을 쓰는 규칙은 건너뛴다.
// --write: 파일에 쓴다. 줄바꿈(CRLF/LF)은 파일 원래대로, 기준선 맨 위 `#` 줄은 그대로 두고 새 줄은 끝에 `#` 설명 한 줄과 함께 덧붙인다(gaps.txt·exclaves.yaml의 기존 꼴). 지우기는 그 줄만.
// 출력: 규칙마다 몇 줄 요약. 전체는 .cache/baseline-suggest/(suggest.md, events-remove.txt 꼴의 <검사>-remove.txt, gaps-add.txt, exclaves-add.yaml).
// 종료 코드: 0 제안 없음 또는 --write로 씀, 1 제안 있음(보여 주기만 함), 2 사용법·입력 오류.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.cache/baseline-suggest');
const GAPS_FILE = path.join(ROOT, 'data/tests/baseline/gaps.txt');
const EXCLAVES_FILE = path.join(ROOT, 'data/exclaves.yaml');
/** check:data가 월경지 경고를 내는 크기 (build-data/exclaves.ts의 EXCLAVE_REPORT_KM2와 같음) */
const EXCLAVE_REPORT_KM2 = 30;
/** 같은 자리로 보는 대표점 차이(도) */
const SAME_AT_DEG = 0.05;

const USAGE =
  '사용: npm run baseline:suggest -- [--report <report.json>]… [--write] [--from-exclaves <파일> [--exclaves-before <파일>] [--min-km2 30] [--years 시작-끝] [--bbox 서,남,동,북]] [--skip-zone <앞머리,…>] [--gap-tol <km²|N%>] [--prune <검사 id,…>] [--label <글>] [--date YYYY-MM-DD]';

class UsageError extends Error {}

interface Args {
  reports: string[];
  write: boolean;
  fromExclaves: string | null;
  exclavesBefore: string | null;
  minKm2: number;
  years: [number, number] | null;
  bbox: [number, number, number, number] | null;
  skipZones: string[];
  gapTol: { km2: number } | { pct: number } | null;
  prune: string[];
  label: string;
  date: string;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { reports: [], write: false, fromExclaves: null, exclavesBefore: null, minKm2: EXCLAVE_REPORT_KM2, years: null, bbox: null, skipZones: [], gapTol: null, prune: ['events'], label: 'baseline:suggest', date: today() };
  const value = (i: number, flag: string) => {
    const v = argv[i + 1];
    if (v === undefined || (v.startsWith('--') && !/^--?\d/.test(v))) throw new UsageError(`${flag}에 값이 필요함`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (f === '--write') a.write = true;
    else if (f === '--report') a.reports.push(value(i++, f));
    else if (f === '--from-exclaves') a.fromExclaves = value(i++, f);
    else if (f === '--exclaves-before') a.exclavesBefore = value(i++, f);
    else if (f === '--min-km2') {
      a.minKm2 = Number(value(i++, f));
      if (!Number.isFinite(a.minKm2) || a.minKm2 < 0) throw new UsageError('--min-km2는 0 이상의 수');
    } else if (f === '--years') {
      const m = value(i++, f).match(/^(-?\d+)-(-?\d+)$/);
      if (!m || Number(m[1]) > Number(m[2])) throw new UsageError('--years는 시작-끝 꼴(예: 632-999, 기원전은 -800-551), 시작 ≤ 끝');
      a.years = [Number(m[1]), Number(m[2])];
    } else if (f === '--bbox') {
      const b = value(i++, f).split(',').map(Number);
      if (b.length !== 4 || b.some((x) => !Number.isFinite(x)) || b[0] > b[2] || b[1] > b[3]) throw new UsageError('--bbox는 서,남,동,북 꼴(예: 20,20,60,40)');
      a.bbox = b as [number, number, number, number];
    } else if (f === '--skip-zone') a.skipZones.push(...value(i++, f).split(',').filter(Boolean));
    else if (f === '--gap-tol') {
      const v = value(i++, f);
      const m = v.match(/^(\d+(?:\.\d+)?)(%?)$/);
      if (!m) throw new UsageError('--gap-tol은 km²(예: 500) 또는 비율(예: 1%)');
      a.gapTol = m[2] ? { pct: Number(m[1]) } : { km2: Number(m[1]) };
    } else if (f === '--prune') a.prune = value(i++, f).split(',').filter(Boolean);
    else if (f === '--label') a.label = value(i++, f);
    else if (f === '--date') {
      a.date = value(i++, f);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) throw new UsageError('--date는 YYYY-MM-DD');
    } else throw new UsageError(`모르는 인자 '${f}'`);
  }
  if (a.exclavesBefore && !a.fromExclaves) throw new UsageError('--exclaves-before는 --from-exclaves와 함께 씀');
  if (!a.reports.length) a.reports.push(path.join(ROOT, '.cache/test-geo/report.json'));
  return a;
}

// ── 공용 ─────────────────────────────────────────────────────

const rel = (f: string) => path.relative(ROOT, path.resolve(f)).replaceAll('\\', '/');
const yearLabel = (y: number) => (y <= 0 ? `기원전 ${1 - y}` : String(y));
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** 파일의 줄바꿈과 줄 목록 (끝 빈 줄 하나는 뺌) */
function readLines(file: string): { eol: string; lines: string[]; endsWithEol: boolean } {
  const text = readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const endsWithEol = lines.at(-1) === '';
  if (endsWithEol) lines.pop();
  return { eol, lines, endsWithEol };
}
/** 쓰기 전에 .yaml 글이 읽히는지 본다. 안 읽히면 그 까닭(쓰지 않음), 읽히거나 .yaml이 아니면 '' */
function yamlError(file: string, lines: string[]): string {
  if (!file.endsWith('.yaml')) return '';
  try {
    parseYaml(lines.join('\n'));
    return '';
  } catch (e) {
    return `${rel(file)}: 만든 글이 YAML로 읽히지 않아 아무 파일도 쓰지 않음 — ${(e as Error).message.split('\n')[0]}`;
  }
}

/** data/ 아래 가장 새로 바뀐 파일(입력이 낡았는지 보는 기준). data/tests와 data/exclaves.yaml은 이 도구가 쓰는 쪽이라 뺀다 */
function newestData(): { file: string; ms: number } {
  let best = { file: '', ms: 0 };
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      const r = rel(p);
      if (r === 'data/tests' || r === 'data/exclaves.yaml') continue;
      if (e.isDirectory()) walk(p);
      else {
        const ms = statSync(p).mtimeMs;
        if (ms > best.ms) best = { file: r, ms };
      }
    }
  };
  walk(path.join(ROOT, 'data'));
  return best;
}

// ── 보고서 ───────────────────────────────────────────────────

interface ReportItem { key: string; msg: string; warn?: boolean }
interface ReportCheck { id: string; status: string; newFailures: ReportItem[]; staleAllow: string[] }
interface Report { file: string; scope: string; checks: ReportCheck[]; stale: string | null }

function readReport(file: string, newest: { file: string; ms: number }): Report {
  if (!existsSync(file)) throw new UsageError(`보고서 없음: ${rel(file)} (npm run test:geo를 먼저 돌릴 것)`);
  const j = JSON.parse(readFileSync(file, 'utf8')) as { scope?: string; checks?: ReportCheck[] };
  if (typeof j.scope !== 'string' || !Array.isArray(j.checks)) throw new UsageError(`${rel(file)}: test:geo report.json 꼴이 아님`);
  const ms = statSync(file).mtimeMs;
  const stale = newest.ms > ms ? `${newest.file}이(가) 보고서보다 나중에 바뀜` : null;
  return { file, scope: j.scope, checks: j.checks, stale };
}

// ── 규칙 1: 낡은 허용 줄 ─────────────────────────────────────

interface PruneResult { check: string; file: string; keys: string[]; missing: string[]; notes: string[]; newText: string[] | null; eol: string }

/** 허용 파일에서 열쇠 줄(- key: …)과 딸린 들여쓴 줄을 지우고, 비게 된 `# ──` 절 머리와 그 앞 빈 줄도 지운다 */
function pruneAllow(lines: string[], keys: Set<string>): { out: string[]; removed: string[] } {
  const removed: string[] = [];
  const keep: boolean[] = lines.map(() => true);
  // 절 머리 위치와, 그 절에 원래 항목이 있었는지
  const isHead = (l: string) => l.startsWith('# ──');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^- key:\s*(.+)$/);
    if (!m) continue;
    let key: unknown;
    try {
      key = parseYaml(m[1]);
    } catch {
      continue;
    }
    if (typeof key !== 'string' || !keys.has(key)) continue;
    removed.push(key);
    keep[i] = false;
    for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) keep[j] = false;
  }
  // 비게 된 절: 머리부터 다음 머리(또는 끝)까지 남은 항목이 없고, 지운 항목이 있었던 절
  for (let i = 0; i < lines.length; i++) {
    if (!isHead(lines[i])) continue;
    let end = i + 1;
    while (end < lines.length && !isHead(lines[end])) end++;
    const body = [...Array(end - i - 1).keys()].map((k) => i + 1 + k);
    const hadEntry = body.some((k) => lines[k].startsWith('- '));
    const left = body.some((k) => keep[k] && lines[k].startsWith('- '));
    if (!hadEntry || left) continue;
    keep[i] = false;
    for (const k of body) if (lines[k].trim() === '' || lines[k].startsWith('#')) keep[k] = false;
    if (i > 0 && lines[i - 1].trim() === '' && keep[i - 1]) keep[i - 1] = false;
  }
  const out = lines.filter((_, i) => keep[i]);
  while (out.length && out.at(-1)!.trim() === '') out.pop();
  return { out, removed };
}

function rulePrune(args: Args, reports: Report[]): PruneResult[] {
  const results: PruneResult[] = [];
  for (const id of args.prune) {
    const file = path.join(ROOT, 'data/tests/allow', `${id}.yaml`);
    const r: PruneResult = { check: id, file: rel(file), keys: [], missing: [], notes: [], newText: null, eol: '\n' };
    results.push(r);
    const usable = reports.filter((rep) => rep.checks.some((c) => c.id === id && c.status !== 'skip' && c.status !== 'error'));
    if (!usable.length) {
      r.notes.push(`검사 ${id}를 돌린 보고서가 없음 — 건너뜀`);
      continue;
    }
    const full = usable.filter((rep) => rep.scope === '전체');
    if (!full.length) {
      const byChanged = usable.some((u) => u.scope.includes('바뀐 것만'));
      r.notes.push(`범위 '전체' 보고서가 없음(${usable.map((u) => `${rel(u.file)}: ${u.scope}`).join(', ')}) — 낡은 줄은 범위 없이 돌린 test:geo만 셈${byChanged ? " — 범위 전체로 돈 보고서가 필요 — `--changed`는 범위가 좁아 낡음 판정을 안 함" : ''}. 건너뜀`);
      continue;
    }
    const fresh = full.filter((rep) => !rep.stale);
    if (!fresh.length) {
      r.notes.push(`보고서가 낡음(${full[0].stale}) — test:geo를 다시 돌릴 것. 건너뜀`);
      continue;
    }
    if (!existsSync(file)) {
      r.notes.push(`${r.file} 없음 — 건너뜀`);
      continue;
    }
    const keys = new Set(fresh.flatMap((rep) => rep.checks.filter((c) => c.id === id).flatMap((c) => c.staleAllow ?? [])));
    const { eol, lines } = readLines(file);
    const { out, removed } = pruneAllow(lines, keys);
    r.keys = removed;
    r.missing = [...keys].filter((k) => !removed.includes(k));
    r.eol = eol;
    if (removed.length) r.newText = out;
  }
  return results;
}

// ── 규칙 2: 다른 권역 옛 빈 땅 ───────────────────────────────

interface GapLine { zone: string; year: number; total: number; boxes: string[] }
interface GapResult { add: GapLine[]; reasons: Map<string, string>; rejected: { key: string; why: string }[]; notes: string[]; tol: string }

/** 검사의 '늘어남' 여유: zones.yaml의 tests·구역 tests 가운데 가장 작은 gapGrowKm2 (칸마다 값은 그 칸에 겹치는 구역들의 최소라 이 값 이상) */
function minGrow(): number {
  const z = parseYaml(readFileSync(path.join(ROOT, 'data/tests/zones.yaml'), 'utf8')) as { tests?: { gapGrowKm2?: number }; zones?: { tests?: { gapGrowKm2?: number } }[] };
  const all = [z.tests?.gapGrowKm2, ...(z.zones ?? []).map((x) => x.tests?.gapGrowKm2)].filter((v): v is number => typeof v === 'number');
  if (!all.length) throw new UsageError('data/tests/zones.yaml에 gapGrowKm2가 없음');
  return Math.min(...all);
}

function readGapBaseline(lines: string[]): Map<string, GapLine[]> {
  const byZone = new Map<string, GapLine[]>();
  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [k, v, b] = line.split('\t');
    const at = k.lastIndexOf(' ');
    const g: GapLine = { zone: k.slice(0, at), year: Number(k.slice(at + 1)), total: Number(v ?? 0), boxes: (b ?? '').split(';').filter(Boolean) };
    byZone.set(g.zone, [...(byZone.get(g.zone) ?? []), g]);
  }
  for (const list of byZone.values()) list.sort((a, b) => a.year - b.year);
  return byZone;
}

/** gaps 새 실패 msg에서 총넓이와 큰 조각들: "<해>년 <구역> 12,345km² [12,345km² 1,2,3,4] … (기준선에 없는 새 빈 땅)" (shapes.ts piecesOf와 같은 읽기) */
function parseGapMsg(zone: string, msg: string): { total: number; boxes: string[]; pieces: { km2: number; box: string }[] } | null {
  const i = msg.indexOf(`${zone} `);
  if (i < 0) return null;
  const m = msg.slice(i + zone.length + 1).match(/^([\d,]+)km²/);
  if (!m) return null;
  const pieces = [...msg.matchAll(/\[([\d,]+)km² ([-\d.,]+)\]/g)].map((x) => ({ km2: Number(x[1].replaceAll(',', '')), box: x[2] }));
  return { total: Number(m[1].replaceAll(',', '')), boxes: pieces.map((x) => x.box), pieces };
}

function ruleGaps(args: Args, reports: Report[]): GapResult {
  const grow = minGrow();
  const tolOf = (total: number) => (args.gapTol && 'pct' in args.gapTol ? (total * args.gapTol.pct) / 100 : args.gapTol ? args.gapTol.km2 : grow);
  const res: GapResult = { add: [], reasons: new Map(), rejected: [], notes: [], tol: args.gapTol ? ('pct' in args.gapTol ? `${args.gapTol.pct}%` : `${args.gapTol.km2}km²`) : `${grow}km²(zones.yaml gapGrowKm2 최소)` };
  const usable = reports.filter((rep) => rep.checks.some((c) => c.id === 'gaps' && c.status !== 'skip' && c.status !== 'error'));
  if (!usable.length) {
    res.notes.push('gaps를 돌린 보고서가 없음 — 건너뜀 (npm run test:geo -- --only gaps [--years …])');
    return res;
  }
  for (const rep of usable.filter((u) => u.stale)) res.notes.push(`${rel(rep.file)} 낡음(${rep.stale}) — 이 보고서는 건너뜀`);
  const { lines } = readLines(GAPS_FILE);
  const base = readGapBaseline(lines);
  const have = new Set([...base.values()].flat().map((g) => `${g.zone} ${g.year}`));
  const seen = new Set<string>();
  for (const rep of usable.filter((u) => !u.stale)) {
    for (const c of rep.checks.filter((x) => x.id === 'gaps')) {
      for (const it of c.newFailures) {
        if (seen.has(it.key)) continue;
        seen.add(it.key);
        const kind = it.msg.endsWith('(기준선에 없는 새 빈 땅)') ? 'new' : it.key.endsWith(' 늘어남') ? '늘어남' : it.key.endsWith(' 새 조각') ? '새 조각' : '기타';
        if (kind !== 'new') {
          res.rejected.push({ key: it.key, why: `${kind} — 이미 기준선에 있는 칸이 바뀜(규칙 밖)` });
          continue;
        }
        const at = it.key.lastIndexOf(' ');
        const zone = it.key.slice(0, at);
        const year = Number(it.key.slice(at + 1));
        if (args.skipZones.some((p) => zone.startsWith(p))) {
          res.rejected.push({ key: it.key, why: '--skip-zone(이번에 바꾼 권역)' });
          continue;
        }
        if (have.has(it.key)) {
          res.rejected.push({ key: it.key, why: '이미 gaps.txt에 있음(보고서 뒤에 더해짐)' });
          continue;
        }
        const p = parseGapMsg(zone, it.msg);
        if (!p) {
          res.rejected.push({ key: it.key, why: '보고서 글에서 넓이·상자를 읽지 못함' });
          continue;
        }
        const list = base.get(zone) ?? [];
        const prev = list.filter((g) => g.year < year).at(-1);
        const next = list.find((g) => g.year > year);
        // gaps 검사가 이 칸을 그 줄과 견줄 때 통과하는가(늘어남 아님·새 조각 아님)
        const tol = tolOf(p.total);
        const same = (g: GapLine | undefined) => !!g && p.total <= g.total + tol && !p.pieces.some((x) => x.km2 > tol && !g.boxes.includes(x.box));
        const hit = same(prev) ? prev! : same(next) ? next! : null;
        if (!hit) {
          const show = (g: GapLine | undefined) => (g ? `${yearLabel(g.year)} ${fmt(g.total)} ${g.boxes.join(';')}` : '없음');
          res.rejected.push({ key: it.key, why: `앞뒤 해와 다름 — 이번 ${fmt(p.total)} ${p.boxes.join(';')} / 앞 ${show(prev)} / 뒤 ${show(next)}` });
          continue;
        }
        res.add.push({ zone, year, total: p.total, boxes: p.boxes });
        res.reasons.set(it.key, `${hit.year < year ? '앞' : '뒤'} 해 ${yearLabel(hit.year)} ${fmt(hit.total)}km²`);
      }
    }
  }
  return res;
}

const gapLineText = (g: GapLine) => `${g.zone} ${g.year}\t${g.total}\t${g.boxes.join(';')}`;

// ── 규칙 3: 사막 비움 해안 월경지 ────────────────────────────

interface Piece { entity: string; name: string; from: number; to: number | null; km2: number; at: [number, number]; mainAt: [number, number] }
interface ExclaveEntry { entity: string; name: string; from: number; to: number | null; at: [number, number]; km2: number; mainAt: [number, number]; pieces: number }
interface ExclaveResult { add: ExclaveEntry[]; skipped: { piece: string; why: string }[]; notes: string[]; found: number }

/** check:exclaves의 '확인' 줄이나 check:data의 '월경지:' 경고 줄을 읽는다 (허용된 조각 줄은 뺌) */
function readPieces(file: string): Piece[] {
  if (!existsSync(file)) throw new UsageError(`월경지 파일 없음: ${rel(file)} (npm run check:exclaves > <파일> 로 만들 것)`);
  const out: Piece[] = [];
  const re = /(?:^\s*확인\s+|월경지:\s+)(.*)\(([a-z0-9-]+)\) (-?\d+)~(-?\d+|현재): ([\d,]+)km² 조각 @(-?[\d.]+),(-?[\d.]+) \(본토 @(-?[\d.]+),(-?[\d.]+)\)/;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(re);
    if (!m) continue;
    out.push({ name: m[1], entity: m[2], from: Number(m[3]), to: m[4] === '현재' ? null : Number(m[4]), km2: Number(m[5].replaceAll(',', '')), at: [Number(m[6]), Number(m[7])], mainAt: [Number(m[8]), Number(m[9])] });
  }
  return out;
}

const near = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) <= SAME_AT_DEG && Math.abs(a[1] - b[1]) <= SAME_AT_DEG;
const pieceKey = (p: Piece) => `${p.entity} ${p.from}~${p.to ?? '현재'} @${p.at.join(',')}`;

function ruleExclaves(args: Args, newest: { file: string; ms: number }): ExclaveResult {
  const res: ExclaveResult = { add: [], skipped: [], notes: [], found: 0 };
  if (!args.fromExclaves) {
    res.notes.push('--from-exclaves 없음 — 건너뜀 (report.json에는 월경지가 없음: npm run check:exclaves > <파일> 뒤 그 파일을 줄 것)');
    return res;
  }
  for (const f of [args.fromExclaves, args.exclavesBefore].filter((x): x is string => !!x)) {
    if (!existsSync(f)) throw new UsageError(`월경지 파일 없음: ${rel(f)}`);
  }
  if (newest.ms > statSync(args.fromExclaves).mtimeMs) {
    res.notes.push(`${rel(args.fromExclaves)} 낡음(${newest.file}이(가) 나중에 바뀜) — check:exclaves를 다시 돌릴 것. 건너뜀`);
    return res;
  }
  const pieces = readPieces(args.fromExclaves);
  res.found = pieces.length;
  if (!pieces.length) res.notes.push(`${rel(args.fromExclaves)}에 '확인' 조각 줄이 없음`);
  const before = new Set(args.exclavesBefore ? readPieces(args.exclavesBefore).map(pieceKey) : []);
  const allow = (parseYaml(readFileSync(EXCLAVES_FILE, 'utf8')) ?? []) as { entity: string; from: number; to: number | null; at: [number, number] }[];
  const overlaps = (a: { from: number; to: number | null }, b: { from: number; to: number | null }) => a.from < (b.to ?? Infinity) && b.from < (a.to ?? Infinity);
  const keep: Piece[] = [];
  for (const p of pieces) {
    const k = pieceKey(p);
    if (p.km2 < args.minKm2) continue; // 작은 조각은 세지 않음(요약에 수만)
    if (before.has(k)) res.skipped.push({ piece: k, why: '바꾸기 전에도 있던 조각(--exclaves-before)' });
    else if (args.years && !overlaps(p, { from: args.years[0], to: args.years[1] + 1 })) res.skipped.push({ piece: k, why: '--years 밖' });
    else if (args.bbox && !(p.at[0] >= args.bbox[0] && p.at[0] <= args.bbox[2] && p.at[1] >= args.bbox[1] && p.at[1] <= args.bbox[3])) res.skipped.push({ piece: k, why: '--bbox 밖' });
    else if (allow.some((a) => a.entity === p.entity && overlaps(a, p) && near(a.at, p.at))) res.skipped.push({ piece: k, why: '이미 비슷한 허용 줄이 있음(파일을 만든 뒤 더해짐)' });
    else keep.push(p);
  }
  const small = pieces.filter((p) => p.km2 < args.minKm2).length;
  if (small) res.notes.push(`${args.minKm2}km² 밑 조각 ${small}개는 보지 않음(--min-km2)`);
  // 같은 나라·같은 자리·이어진 기간을 한 줄로
  keep.sort((a, b) => a.entity.localeCompare(b.entity) || a.from - b.from);
  const open: ExclaveEntry[] = [];
  for (const p of keep) {
    const g = open.find((e) => e.entity === p.entity && e.to === p.from && near(e.at, p.at));
    if (g) {
      g.to = p.to;
      g.km2 = Math.max(g.km2, p.km2);
      g.pieces++;
    } else open.push({ entity: p.entity, name: p.name, from: p.from, to: p.to, at: p.at, km2: p.km2, mainAt: p.mainAt, pieces: 1 });
  }
  res.add = open.sort((a, b) => a.entity.localeCompare(b.entity) || a.from - b.from);
  return res;
}

function exclaveText(e: ExclaveEntry, args: Args): string[] {
  const reason = `사막 비움 해안(baseline:suggest 규칙 3, ${args.date} 제안): 같은 육지 위 본토(@${e.mainAt.join(',')})와 칠하지 않은 땅을 사이에 두고 떨어진 조각(약 ${fmt(e.km2)}km²${e.pieces > 1 ? `, 버전 ${e.pieces}개` : ''}). 실제로 해안 길·바닷길로 이어졌는지 근거를 확인해 이유와 출처를 고쳐 쓸 것`;
  // 이유에 ': '가 있어 작은따옴표로 감싼다(YAML 일반 글에서 ': '는 쓸 수 없음)
  return [`- entity: ${e.entity}`, `  from: ${e.from}`, `  to: ${e.to ?? 'null'}`, `  at: [${e.at.join(', ')}]`, `  reason: '${reason.replaceAll("'", "''")}'`, '  sources: []'];
}

// ── 실행 ─────────────────────────────────────────────────────

function main(): number {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`baseline:suggest: ${(e as Error).message}\n${USAGE}`);
    return 2;
  }
  let prune: PruneResult[], gaps: GapResult, excl: ExclaveResult;
  try {
    const newest = newestData();
    const reports = args.reports.map((f) => readReport(path.resolve(f), newest));
    prune = rulePrune(args, reports);
    gaps = ruleGaps(args, reports);
    excl = ruleExclaves(args, newest);
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`baseline:suggest: ${e.message}`);
      return 2;
    }
    throw e;
  }

  mkdirSync(OUT, { recursive: true });
  const md: string[] = ['# baseline:suggest 제안', '', `보고서: ${args.reports.map(rel).join(', ')} · 날짜 ${args.date}${args.write ? ' · --write로 씀' : ' · 보여 주기만'}`, ''];
  const lines: string[] = [];
  let found = 0;

  // 규칙 1
  for (const r of prune) {
    found += r.keys.length;
    lines.push(`규칙 1 낡은 허용 줄(${r.file}): ${r.notes.length ? r.notes.join(' / ') : `지울 줄 ${r.keys.length}${r.missing.length ? ` · 파일에 없는 낡음 열쇠 ${r.missing.length}` : ''}`}`);
    for (const k of r.keys.slice(0, 3)) lines.push(`  - ${k}`);
    if (r.keys.length > 3) lines.push(`  … ${r.keys.length - 3}줄 더`);
    md.push(`## 규칙 1 낡은 허용 줄 — ${r.file}`, '', ...r.notes.map((n) => `- ${n}`), ...r.keys.map((k) => `- 지움 \`${k}\``), ...r.missing.map((k) => `- 파일에 없음(다른 허용 파일 줄일 수 있음) \`${k}\``), '');
    writeFileSync(path.join(OUT, `${r.check}-remove.txt`), r.keys.join('\n') + (r.keys.length ? '\n' : ''));
  }

  // 규칙 2
  found += gaps.add.length;
  lines.push(`규칙 2 옛 빈 땅(gaps.txt): ${gaps.notes.length ? gaps.notes.join(' / ') + ' · ' : ''}더할 줄 ${gaps.add.length} · 제안 안 함 ${gaps.rejected.length} (넓이 여유 ${gaps.tol})`);
  for (const g of gaps.add.slice(0, 3)) lines.push(`  + ${gapLineText(g).replaceAll('\t', ' | ')}  (${gaps.reasons.get(`${g.zone} ${g.year}`)})`);
  if (gaps.add.length > 3) lines.push(`  … ${gaps.add.length - 3}줄 더`);
  for (const r of gaps.rejected.slice(0, 2)) lines.push(`  · 안 함 ${r.key}: ${r.why}`.slice(0, 220));
  md.push('## 규칙 2 다른 권역 옛 빈 땅 — data/tests/baseline/gaps.txt', '', `넓이 여유 ${gaps.tol}, 판정은 gaps 검사와 같음(총넓이 ≤ 앞뒤 해 줄 + 여유, 여유보다 큰 조각의 상자는 그 줄에 있음)`, '', ...gaps.notes.map((n) => `- ${n}`));
  md.push(...gaps.add.map((g) => `- 더함 \`${gapLineText(g).replaceAll('\t', ' | ')}\` — ${gaps.reasons.get(`${g.zone} ${g.year}`)}`), '');
  if (gaps.rejected.length) md.push('### 제안 안 함 (사람이 볼 것)', '', ...gaps.rejected.map((r) => `- \`${r.key}\` — ${r.why}`), '');
  writeFileSync(path.join(OUT, 'gaps-add.txt'), gaps.add.map(gapLineText).join('\n') + (gaps.add.length ? '\n' : ''));

  // 규칙 3
  found += excl.add.length;
  lines.push(`규칙 3 사막 비움 해안 월경지(exclaves.yaml): ${excl.notes.length ? excl.notes.join(' / ') + ' · ' : ''}${args.fromExclaves ? `확인 조각 ${excl.found} → 더할 항목 ${excl.add.length}(조각 ${excl.add.reduce((n, e) => n + e.pieces, 0)}) · 뺌 ${excl.skipped.length}` : ''}`);
  for (const e of excl.add.slice(0, 3)) lines.push(`  + ${e.name}(${e.entity}) ${e.from}~${e.to ?? '현재'} @${e.at.join(',')} ${fmt(e.km2)}km²`);
  if (excl.add.length > 3) lines.push(`  … ${excl.add.length - 3}항목 더`);
  md.push('## 규칙 3 사막 비움 해안 월경지 — data/exclaves.yaml', '', ...excl.notes.map((n) => `- ${n}`));
  md.push(...excl.add.map((e) => `- 더함 ${e.name}(${e.entity}) ${e.from}~${e.to ?? '현재'} @${e.at.join(',')} 최대 ${fmt(e.km2)}km², 버전 ${e.pieces}개`), '');
  if (excl.skipped.length) md.push('### 뺀 조각', '', ...excl.skipped.map((s) => `- ${s.piece} — ${s.why}`), '');
  const exclBlock = excl.add.length
    ? [`# ── ${args.label} (${args.date}): 사막 비움 해안 월경지 ${excl.add.length}항목 — baseline:suggest 규칙 3 제안, 이유·출처는 근거를 확인해 고칠 것 ──`, ...excl.add.flatMap((e, i) => [...(i ? [''] : []), ...exclaveText(e, args)])]
    : [];
  writeFileSync(path.join(OUT, 'exclaves-add.yaml'), exclBlock.join('\n') + (exclBlock.length ? '\n' : ''));

  // 쓰기
  if (args.write) {
    // 모두 만들어 YAML이 읽히는지 본 뒤에 한꺼번에 쓴다(하나라도 안 되면 아무것도 쓰지 않음)
    const pending: { file: string; eol: string; lines: string[]; what: string }[] = [];
    for (const r of prune) if (r.newText) pending.push({ file: path.join(ROOT, r.file), eol: r.eol, lines: r.newText, what: `${r.file} −${r.keys.length}` });
    if (gaps.add.length) {
      const { eol, lines: old } = readLines(GAPS_FILE);
      const zones = [...new Set(gaps.add.map((g) => g.zone))].join('·');
      const years = [...new Set(gaps.add.map((g) => g.year))].sort((a, b) => a - b).map(yearLabel).join('·');
      const head = `# ${args.label}(${args.date}): 새 버전 해(${years}년)가 드러낸 ${zones} 옛 빈 땅 ${gaps.add.length}줄 — 같은 상자·넓이가 앞뒤 해 기준선에 이미 있음 (baseline:suggest 규칙 2)`;
      pending.push({ file: GAPS_FILE, eol, lines: [...old, head, ...gaps.add.map(gapLineText)], what: `data/tests/baseline/gaps.txt +${gaps.add.length}` });
    }
    if (exclBlock.length) {
      const { eol, lines: old } = readLines(EXCLAVES_FILE);
      while (old.length && old.at(-1)!.trim() === '') old.pop();
      pending.push({ file: EXCLAVES_FILE, eol, lines: [...old, '', ...exclBlock], what: `data/exclaves.yaml +${excl.add.length}` });
    }
    const bad = pending.map((p) => yamlError(p.file, p.lines)).filter(Boolean);
    if (bad.length) {
      console.error(`baseline:suggest: ${bad.join(' / ')}`);
      return 2;
    }
    for (const p of pending) writeFileSync(p.file, p.lines.join(p.eol) + p.eol);
    lines.push(pending.length ? `씀: ${pending.map((p) => p.what).join(' · ')}${excl.add.length ? ' — npm run check:exclaves로 맞는지, 이유·출처를 확인할 것' : ''}` : '쓸 것 없음');
  }
  writeFileSync(path.join(OUT, 'suggest.md'), md.join('\n'));
  lines.push(`자세히: ${rel(path.join(OUT, 'suggest.md'))}`);
  console.log(lines.join('\n'));
  return args.write || found === 0 ? 0 : 1;
}

process.exitCode = main();
