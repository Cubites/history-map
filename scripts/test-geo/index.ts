// 지형 테스트 러너 (npm run test:geo): 검사 모음(scripts/test-geo/checks/*.ts)을 한 번에 돌리고 결과를 몇 줄로 요약한다.
// 사용: npm run test:geo -- [--region <europe|east-asia|항목 파일 이름>] [--years 1500-1600] [--only places,lines] [--skip islands]
//                         [--ci] [--update-baseline <검사 id>] [--report <경로>]
// - 검사 파일: checks/places.ts(지점)·shapes.ts(도형 품질)·events.ts(사건 연결)·lines.ts(선 기준선)·colors.ts(이웃 색)·years.ts(글 속 해)·spelling.ts(표기 사전). 파일이 아직 없으면 '아직 없음'으로 건너뛴다.
//   각 파일은 `export const checks: Check[]`를 내보낸다(꼴은 types.ts). --only·--skip은 검사 id 또는 파일 이름을 받는다.
// - 판정 순서: 검사가 낸 항목마다 열쇠(key)로 ① 허용 목록(data/tests/allow/<검사 id 또는 파일 이름>.yaml, 사람이 이유와 함께 적음: key·reason·decided,
//   key 끝에 `*` 하나는 앞부분 일치) ② 기준선(data/tests/baseline/<검사 id>.txt, 한 줄에 열쇠 하나, `#`은 주석. --update-baseline이 지금 열쇠를 정렬해 씀) ③ 나머지는 새 실패. 기준선 파일 맨 위 `#` 줄(무엇인지·만든 날)은 다시 쓸 때도 그대로 둔다.
//   아무 항목에도 맞지 않은 허용 줄은 '낡음' 경고(--region·--years 없이 돌렸을 때만). 묶음 파일(예: shapes.yaml)의 줄은 그 묶음의 검사를 모두 돌렸을 때 어느 검사에도 맞지 않은 것만.
// - 출력: 표준 출력에 머리 1줄 + 검사마다 1줄 + 새 실패 위 5줄 + 보고서 경로. 자세한 것은 .cache/test-geo/report.md(사람용)·report.json(기계용).
//   --ci면 report.md를 $GITHUB_STEP_SUMMARY에도 덧붙이고, 느린 검사(gen)도 돌린다. 검사가 사정이 안 맞아 건너뛴 항목(결과가 낡은 전쟁 지점 등)은 머리 줄에 `건너뜀 N`으로 보이고, --ci에서는 검사가 실패로 낸다.
//   검사가 `selfBaseline: true`면(gaps) 기준선 대조를 검사가 하고(줄은 `열쇠<TAB>값`), --update-baseline은 그 검사 파일이 내보낸 baselineText(id)로 기준선 글을 만든다. 기준선 줄은 TAB 앞이 열쇠.
// - 종료 코드: 새 실패가 있으면 1, 인자 오류나 검사 중 예외면 2, 아니면 0.
// - 여러 에이전트가 동시에 돌리면 환경 변수 HISTORY_MAP_WORKERS=4를 권한다(자르기·겹침 worker 수).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { ROOT, createContext } from './context.ts';
import type { Check, Item, Options } from './types.ts';

/** 검사 파일 이름(그룹). 파일이 없으면 '아직 없음' */
const KNOWN_GROUPS = ['places', 'shapes', 'events', 'lines', 'colors', 'years', 'spelling'];
/** 느려서 --ci나 --only로 직접 고를 때만 도는 검사 id */
const CI_ONLY = new Set(['gen']);

const USAGE = `사용: npm run test:geo -- [--region <europe|east-asia|항목 파일 이름>] [--years 1500-1600] [--only places,lines] [--skip islands] [--ci] [--update-baseline <검사 id>] [--report <경로>]`;

class UsageError extends Error {}

interface Args extends Options {
  updateBaseline: string | null;
  report: string | null;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { region: null, years: null, only: null, skip: [], ci: false, updateBaseline: null, report: null };
  const value = (i: number, flag: string) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) throw new UsageError(`${flag}에 값이 필요함`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (f === '--ci') a.ci = true;
    else if (f === '--region') a.region = value(i++, f);
    else if (f === '--years') {
      const m = value(i++, f).match(/^(-?\d+)-(-?\d+)$/);
      if (!m || Number(m[1]) > Number(m[2])) throw new UsageError('--years는 시작-끝 꼴(예: 1500-1600, 기원전은 -500-100), 시작 ≤ 끝');
      a.years = [Number(m[1]), Number(m[2])];
    } else if (f === '--only') a.only = [...(a.only ?? []), ...value(i++, f).split(',').filter(Boolean)];
    else if (f === '--skip') a.skip.push(...value(i++, f).split(',').filter(Boolean));
    else if (f === '--update-baseline') a.updateBaseline = value(i++, f);
    else if (f === '--report') a.report = value(i++, f);
    else throw new UsageError(`모르는 인자 '${f}'`);
  }
  if (a.updateBaseline && (a.region || a.years)) throw new UsageError('--update-baseline은 --region·--years와 함께 쓸 수 없음(기준선에서 범위 밖 열쇠가 사라짐)');
  return a;
}

// ── 검사 모으기 ──────────────────────────────────────────────

interface Loaded {
  group: string;
  checks: Check[];
  error: string | null;
  /** 검사 파일이 내보내면 --update-baseline이 쓰는 함수(검사 id → 기준선 글, 모르면 null) */
  baselineText?: (id: string) => string | null;
}

async function loadGroups(): Promise<Map<string, Loaded>> {
  const dir = path.join(ROOT, 'scripts/test-geo/checks');
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => f.replace(/\.ts$/, '')).sort() : [];
  const out = new Map<string, Loaded>();
  for (const group of files) {
    try {
      const mod = (await import(pathToFileURL(path.join(dir, `${group}.ts`)).href)) as { checks?: Check[]; baselineText?: (id: string) => string | null };
      if (!Array.isArray(mod.checks)) out.set(group, { group, checks: [], error: '`export const checks: Check[]`가 없음' });
      else out.set(group, { group, checks: mod.checks, error: null, baselineText: mod.baselineText });
    } catch (e) {
      out.set(group, { group, checks: [], error: `불러오지 못함: ${(e as Error).message.split('\n')[0]}` });
    }
  }
  return out;
}

// ── 허용 목록·기준선 ─────────────────────────────────────────

interface AllowEntry {
  key: string;
  reason: string;
  decided: string;
  used: boolean;
  file: string;
}

function readAllow(check: Check, group: string): AllowEntry[] {
  const out: AllowEntry[] = [];
  const names = [...new Set([check.id, group])];
  for (const n of names) {
    const file = path.join(ROOT, 'data/tests/allow', `${n}.yaml`);
    if (!existsSync(file)) continue;
    const rel = `data/tests/allow/${n}.yaml`;
    const raw = parseYaml(readFileSync(file, 'utf8')) ?? [];
    if (!Array.isArray(raw)) throw new Error(`${rel}: 최상위는 목록이어야 함`);
    raw.forEach((e: Record<string, unknown>, i) => {
      if (!e || typeof e.key !== 'string' || !e.key) throw new Error(`${rel} [${i + 1}]: key 필요`);
      if (typeof e.reason !== 'string' || !e.reason.trim()) throw new Error(`${rel} [${i + 1}] ${e.key}: reason(이유) 필요`);
      const stars = (e.key.match(/\*/g) ?? []).length;
      if (stars > 1 || (stars === 1 && !e.key.endsWith('*'))) throw new Error(`${rel} [${i + 1}] ${e.key}: * 는 끝에 하나만 쓸 수 있음`);
      out.push({ key: e.key, reason: e.reason.trim(), decided: typeof e.decided === 'string' ? e.decided : '', used: false, file: rel });
    });
  }
  return out;
}

const matchAllow = (e: AllowEntry, key: string) => (e.key.endsWith('*') ? key.startsWith(e.key.slice(0, -1)) : e.key === key);
const staleWarning = (e: AllowEntry): Item => ({ key: `낡음 ${e.key}`, msg: `${e.file}: 허용 줄 '${e.key}'에 맞는 항목이 없음 (낡음)`, warn: true });

function baselinePath(id: string) {
  return path.join(ROOT, 'data/tests/baseline', `${id}.txt`);
}

function readBaseline(check: Check, group: string): Set<string> {
  const keys = new Set<string>();
  for (const n of new Set([check.id, group])) {
    const file = baselinePath(n);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) if (line && !line.startsWith('#')) keys.add(line.split('\t')[0]);
  }
  return keys;
}

// ── 실행과 요약 ──────────────────────────────────────────────

interface Outcome {
  id: string;
  title: string;
  group: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  why?: string;
  /** 예외의 스택(보고서용) */
  detail?: string;
  checked: number;
  notes: string[];
  newFailures: Item[];
  allowed: { item: Item; entry: AllowEntry }[];
  baselined: number;
  warnings: Item[];
  staleAllow: AllowEntry[];
  staleBaseline: number;
  seconds: number;
  /** 검사가 건너뛴 항목 수 (CheckResult.skipped) */
  skipped: number;
}

const blank = (id: string, title: string, group: string): Outcome => ({
  id, title, group, status: 'pass', checked: 0, notes: [], newFailures: [], allowed: [], baselined: 0, warnings: [], staleAllow: [], staleBaseline: 0, seconds: 0, skipped: 0,
});

function fmtDur(s: number): string {
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)}초`;
  return `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초`;
}

function selected(opt: Options, check: { id: string }, group: string): boolean {
  if (opt.only && !opt.only.includes(check.id) && !opt.only.includes(group)) return false;
  if (opt.skip.includes(check.id) || opt.skip.includes(group)) return false;
  return true;
}

function reportMd(head: string, outs: Outcome[]): string {
  const L: string[] = [`# test:geo 보고서`, '', head, ''];
  for (const o of outs) {
    L.push(`## ${o.id} — ${o.title}`, '');
    if (o.status === 'skip') {
      L.push(`건너뜀: ${o.why}`, '');
      continue;
    }
    if (o.status === 'error') {
      L.push(`오류: ${o.why}`, '', '```', o.detail ?? '', '```', '');
      continue;
    }
    L.push(`- 결과: ${o.status === 'pass' ? '통과' : '실패'} · 검사 ${o.checked.toLocaleString()}${o.notes.length ? ' · ' + o.notes.join(' · ') : ''} · ${fmtDur(o.seconds)}`);
    L.push(`- 새 실패 ${o.newFailures.length} · 허용 ${o.allowed.length} · 기준선 ${o.baselined} · 경고 ${o.warnings.length}${o.skipped ? ` · 건너뜀 ${o.skipped.toLocaleString()}` : ''}`, '');
    if (o.newFailures.length) {
      L.push('### 새 실패', '', ...o.newFailures.map((i) => `- \`${i.key}\` — ${i.msg}`), '');
    }
    if (o.warnings.length) L.push('### 경고', '', ...o.warnings.map((i) => `- ${i.msg}`), '');
    if (o.allowed.length) {
      L.push('### 허용된 예외', '', ...o.allowed.map(({ item, entry }) => `- \`${item.key}\` — ${entry.reason}${entry.decided ? ` (${entry.decided})` : ''}`), '');
    }
    if (o.staleAllow.length) L.push('### 낡은 허용 줄 (맞는 항목이 없음 — 지워도 되는지 확인)', '', ...o.staleAllow.map((e) => `- \`${e.key}\` (${e.file})`), '');
    if (o.staleBaseline) L.push(`기준선에 있으나 이번에 나오지 않은 열쇠 ${o.staleBaseline}개 (고쳐졌으면 --update-baseline으로 줄일 것)`, '');
  }
  return L.join('\n');
}

async function main(): Promise<number> {
  const t0 = performance.now();
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`test:geo: ${(e as Error).message}\n${USAGE}`);
    return 2;
  }

  const groups = await loadGroups();
  const known = new Set<string>([...KNOWN_GROUPS, ...groups.keys(), ...[...groups.values()].flatMap((g) => g.checks.map((c) => c.id))]);
  for (const n of [...(args.only ?? []), ...args.skip]) {
    if (!known.has(n)) {
      console.error(`test:geo: 모르는 검사 '${n}' (아는 것: ${[...known].sort().join(', ')})\n${USAGE}`);
      return 2;
    }
  }

  const ctxStart = performance.now();
  const ctx = createContext(args);
  const ctxSec = (performance.now() - ctxStart) / 1000;

  const outs: Outcome[] = [];
  let hadError = false;
  const order = [...new Set([...KNOWN_GROUPS, ...groups.keys()])];
  for (const group of order) {
    const loaded = groups.get(group);
    if (!loaded) {
      if (!args.only || args.only.includes(group)) if (!args.skip.includes(group)) {
        const o = blank(group, '(검사 파일)', group);
        o.status = 'skip';
        o.why = '아직 없음';
        outs.push(o);
      }
      continue;
    }
    if (loaded.error) {
      if (selected(args, { id: group }, group)) {
        const o = blank(group, '(검사 파일)', group);
        o.status = 'error';
        o.why = `scripts/test-geo/checks/${group}.ts ${loaded.error}`;
        hadError = true;
        outs.push(o);
      }
      continue;
    }
    // 묶음 파일(data/tests/allow/<묶음>.yaml)은 같은 묶음의 검사들이 함께 쓰므로, 묶음의 검사를 모두 돌렸을 때 어느 검사에도 맞지 않은 줄만 낡음으로 본다
    const groupFile = `data/tests/allow/${group}.yaml`;
    const groupUsed = new Set<string>();
    const groupStale = new Map<string, { o: Outcome; e: AllowEntry }>();
    let groupComplete = true;
    for (const check of loaded.checks) {
      if (!selected(args, check, group)) {
        groupComplete = false;
        continue;
      }
      const o = blank(check.id, check.title, group);
      if (CI_ONLY.has(check.id) && !args.ci && !args.only?.includes(check.id)) {
        o.status = 'skip';
        o.why = '--ci에서만 (느림)';
        groupComplete = false;
        outs.push(o);
        continue;
      }
      const start = performance.now();
      try {
        const allow = readAllow(check, group);
        const base = check.selfBaseline ? new Set<string>() : readBaseline(check, group);
        const res = await check.run(ctx, args);
        o.checked = res.checked;
        o.notes = res.notes ?? [];
        o.skipped = res.skipped ?? 0;
        const seenKeys = new Set<string>();
        const fresh: Item[] = [];
        for (const item of res.items) {
          seenKeys.add(item.key);
          const entry = allow.find((e) => matchAllow(e, item.key));
          if (entry) {
            entry.used = true;
            o.allowed.push({ item, entry });
          } else if (item.warn) o.warnings.push(item);
          else if (base.has(item.key)) o.baselined++;
          else fresh.push(item);
        }
        o.newFailures = fresh;
        for (const e of allow) if (e.used && e.file === groupFile) groupUsed.add(e.key);
        const unfiltered = args.region === null && args.years === null;
        if (unfiltered) {
          o.staleAllow = allow.filter((e) => !e.used && e.file !== groupFile);
          o.staleBaseline = [...base].filter((k) => !seenKeys.has(k)).length;
          for (const e of o.staleAllow) o.warnings.push(staleWarning(e));
          for (const e of allow) if (!e.used && e.file === groupFile && !groupStale.has(e.key)) groupStale.set(e.key, { o, e });
        } else groupComplete = false;
        if (args.updateBaseline === check.id) {
          const custom = loaded.baselineText?.(check.id) ?? null;
          const keys = [...new Set(res.items.filter((i) => !i.warn && !allow.some((e) => matchAllow(e, i.key))).map((i) => i.key))].sort();
          mkdirSync(path.dirname(baselinePath(check.id)), { recursive: true });
          // 기존 기준선 파일 맨 위의 '#' 줄(무엇인지·만든 날 등)은 그대로 둔다. 없으면 기본 머리 한 줄
          const oldLines = existsSync(baselinePath(check.id)) ? readFileSync(baselinePath(check.id), 'utf8').split(/\r?\n/) : [];
          const firstKey = oldLines.findIndex((l) => !l.startsWith('#'));
          const oldHead = oldLines.slice(0, firstKey < 0 ? oldLines.length : firstKey);
          const head = oldHead.length ? oldHead.join('\n') : `# test:geo 기준선 ${check.id}: 알려진 옛 문제의 열쇠(한 줄에 하나). npm run test:geo -- --update-baseline ${check.id}로 다시 씀`;
          writeFileSync(baselinePath(check.id), custom ?? `${head}\n${keys.join('\n')}${keys.length ? '\n' : ''}`);
          o.baselined += o.newFailures.length;
          o.notes.push(`기준선 갱신 ${custom ? custom.split('\n').filter(Boolean).length : keys.length}`);
          o.newFailures = [];
        }
        o.status = o.newFailures.length ? 'fail' : 'pass';
      } catch (e) {
        o.status = 'error';
        o.why = `예외: ${(e as Error).stack?.split('\n').slice(0, 3).join(' / ') ?? String(e)}`;
        hadError = true;
        groupComplete = false;
      }
      o.seconds = (performance.now() - start) / 1000;
      outs.push(o);
    }
    if (groupComplete) {
      for (const [key, { o, e }] of groupStale) {
        if (groupUsed.has(key)) continue;
        o.staleAllow.push(e);
        o.warnings.push(staleWarning(e));
      }
    }
  }
  if (args.updateBaseline && !outs.some((o) => o.id === args.updateBaseline && o.status !== 'skip' && o.status !== 'error')) {
    console.error(`test:geo: --update-baseline ${args.updateBaseline}: 그 검사를 돌리지 못함 (--only/--skip, 오류 확인)`);
    return 2;
  }

  const total = (performance.now() - t0) / 1000;
  const failures = outs.reduce((n, o) => n + o.newFailures.length, 0);
  const scope = [args.region ? `권역 ${args.region}` : null, args.years ? `${args.years[0]}~${args.years[1]}년` : null].filter(Boolean).join(' ') || '전체';
  const skippedItems = outs.reduce((n, o) => n + o.skipped, 0);
  const head = `test:geo 범위 ${scope} · ${fmtDur(total)} · ${hadError ? `오류 ${outs.filter((o) => o.status === 'error').length} · ` : ''}${failures ? `실패 ${failures}` : '실패 0'}${skippedItems ? ` · 건너뜀 ${skippedItems.toLocaleString()}` : ''}`;

  const lines: string[] = [head];
  const pad = Math.max(6, ...outs.map((o) => o.id.length));
  for (const o of outs) {
    const mark = { pass: '통과', fail: '실패', skip: '건너뜀', error: '오류' }[o.status];
    if (o.status === 'skip' || o.status === 'error') {
      lines.push(`  ${mark} ${o.id.padEnd(pad)}  ${o.why}`.slice(0, 200));
      continue;
    }
    const parts = [`검사 ${o.checked.toLocaleString()}`, ...o.notes];
    if (o.newFailures.length) parts.push(`새 실패 ${o.newFailures.length}${o.allowed.length || o.baselined ? ` (${[o.baselined ? `기준선 ${o.baselined}` : '', o.allowed.length ? `허용 ${o.allowed.length}` : ''].filter(Boolean).join('·')})` : ''}`);
    else {
      if (o.baselined) parts.push(`기준선 ${o.baselined}`);
      if (o.allowed.length) parts.push(`알려진 예외 ${o.allowed.length}`);
    }
    if (o.warnings.length) parts.push(`경고 ${o.warnings.length}`);
    parts.push(fmtDur(o.seconds));
    lines.push(`  ${mark} ${o.id.padEnd(pad)}  ${parts.join(' · ')}`);
  }
  const top = outs.flatMap((o) => o.newFailures.map((i) => ({ id: o.id, msg: i.msg }))).slice(0, 5);
  for (const t of top) lines.push(`  ✗ ${t.id}  ${t.msg}`.slice(0, 220));
  if (failures > top.length) lines.push(`  … 새 실패 ${failures - top.length}건 더 (보고서)`);
  const warnN = outs.reduce((n, o) => n + o.warnings.length, 0);
  // 경고는 실패가 있어도 보인다(건너뜀 경고가 실패 줄에 묻히지 않게). 실패가 있으면 검사마다 1줄만
  if (warnN) for (const o of outs) for (const w of o.warnings.slice(0, failures ? 1 : 2)) lines.push(`  ! ${o.id}  ${w.msg}`.slice(0, 220));

  const reportPath = path.resolve(args.report ?? path.join(ctx.cacheDir, 'report.md'));
  mkdirSync(path.dirname(reportPath), { recursive: true });
  const md = reportMd(head + (ctxSec > 1 ? ` (자료 읽기 ${fmtDur(ctxSec)})` : ''), outs);
  writeFileSync(reportPath, md);
  writeFileSync(
    reportPath.replace(/\.md$/, '') + '.json',
    JSON.stringify(
      {
        scope,
        seconds: Math.round(total * 10) / 10,
        newFailures: failures,
        checks: outs.map((o) => ({
          id: o.id,
          title: o.title,
          status: o.status,
          why: o.why ?? null,
          checked: o.checked,
          notes: o.notes,
          seconds: Math.round(o.seconds * 10) / 10,
          newFailures: o.newFailures,
          allowed: o.allowed.map(({ item, entry }) => ({ key: item.key, reason: entry.reason, decided: entry.decided })),
          baselined: o.baselined,
          skipped: o.skipped,
          warnings: o.warnings,
          staleAllow: o.staleAllow.map((e) => e.key),
          staleBaseline: o.staleBaseline,
        })),
      },
      null,
      1,
    ),
  );
  if (args.ci && process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
  lines.push(`자세히: ${path.relative(process.cwd(), reportPath).replaceAll('\\', '/') || reportPath}`);
  console.log(lines.join('\n'));
  return hadError ? 2 : failures ? 1 : 0;
}

process.exitCode = await main();
