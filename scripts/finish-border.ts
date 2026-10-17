// 국경을 고친 뒤 마무리 한 명령 (npm run finish:border, RULES-TOOLS 작업 13).
// 손으로 하던 순서 gen:geo → (영토 국경이면) gen:wars → test:geo가 '입력이 마지막 빌드 뒤에 바뀜'으로 건너뛴 전쟁만 build:data -- --war <id> → test:geo를 한 명령으로 묶는다.
// test:geo는 검사만 하는 프로그램이라 고치는 일은 여기서 한다(test:geo 안에는 넣지 않음).
// 단계 (이름 → 하는 일):
//   geo      npm run gen:geo      data/geo 다시 만들기(60~90초). 앞뒤 git status 차이로 센 바뀐 파일 수를 보임
//   wars     npm run gen:wars     전쟁 손그림 geojson·YAML 다시 만들기(약 3분). 앞뒤 차이로 센 바뀐 전쟁 파일 수를 보임. --no-wars면 건너뜀
//   rebuild  다시 빌드할 전쟁 찾기 → npm run build:data -- --war <id,…>
//            찾는 판정은 test:geo places와 같은 함수(warStaleReason)·같은 기록(.cache/build-data-wars/built.json, war-inputs.ts)이다:
//            입력 해시가 빌드 기록과 다름 / 기록 없음 / public/data의 결과가 기록과 다름 / wars/<id>.json 없음 / wars.json에 없는 전쟁. 고를 것이 없으면 건너뜀
//   test     npm run test:geo     검사(인자는 그대로 넘김: --ci 등)
// 사용: npm run finish:border -- [--from <단계>] [--only <단계,…>] [--no-wars] [--budget <초>] [test:geo 인자…] [-- test:geo 인자…]
//   --from <단계>    그 단계부터 끝까지(앞 단계는 건너뜀). 예산 때문에 끊긴 뒤 안내대로 이어 부를 때 씀
//   --only <단계,…>  고른 단계만(--from과 함께 쓰지 못함). test:geo의 --only와 이름이 겹치므로 test:geo의 --only·--skip은 `--` 뒤에 쓴다
//   --no-wars        gen:wars를 건너뜀(영토 국경이 아닐 때). rebuild는 그래도 함
//   --budget <초>    이 명령의 시간 예산(기본 270). 다음 단계를 시작하기 전에 (지금까지 시간 + 그 단계의 지난 시간)이 예산을 넘으면 시작하지 않고 이어서 부를 줄과 함께 끝낸다(종료 3)
//   그 밖의 인자는 모두 test:geo로 넘긴다(`--` 뒤는 무엇이든). 이어서 줄도 test:geo 인자 앞에 `--`를 붙여 낸다
// 단계마다 걸린 시간은 .cache/finish-border/state.json에 적는다(처음이면 어림: geo 90초, wars 200초, 전쟁 하나 빌드 30초, test 120초).
//   rebuild는 한 번에 예산 안에서 빌드할 수 있는 만큼의 전쟁만 빌드하고 나머지는 이어서 부르게 한다(다음 호출이 낡은 전쟁을 다시 찾으므로 남은 것만 고른다).
//   아무 단계도 안 한 처음 단계는 예산보다 길어 보여도 한다(안 그러면 이어 부를 수 없음).
// 하위 명령은 package.json scripts를 읽어 `node …` 꼴이면 process.execPath로 직접 부른다(npm.cmd를 거치지 않으므로 Windows에서도 같고, 명령의 원천이 package.json 하나). 출력은 .cache/finish-border/<단계>.log에 받고 화면은 요약만(test:geo 전체는 test-geo.log).
// 종료 코드: 0 성공, 1 test:geo 실패·하위 명령 오류·전체 build:data 필요, 2 사용법 오류, 3 예산 때문에 끊김(이어서 부를 줄을 보임).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { warInputHashes, readBuilt } from './build-data/war-inputs.ts';
import { warStaleReason } from './test-geo/checks/places.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache/finish-border');
const STATE_FILE = path.join(CACHE, 'state.json');
const STEPS = ['geo', 'wars', 'rebuild', 'test'] as const;
type Step = (typeof STEPS)[number];
const LABEL: Record<Step, string> = { geo: 'gen:geo', wars: 'gen:wars', rebuild: 'build:data --war', test: 'test:geo' };
/** 처음일 때 어림(초) */
const GUESS: Record<Step, number> = { geo: 90, wars: 200, rebuild: 30, test: 120 };
const NPM_SCRIPT: Partial<Record<Step, string>> = { geo: 'gen:geo', wars: 'gen:wars', test: 'test:geo' };
const DEFAULT_BUDGET = 270;

const USAGE =
  '사용: npm run finish:border -- [--from <단계>] [--only <단계,…>] [--no-wars] [--budget <초>] [test:geo 인자…] [-- test:geo 인자…]  (단계: geo·wars·rebuild·test)';

class UsageError extends Error {}

interface Args {
  from: Step | null;
  only: Step[] | null;
  noWars: boolean;
  budget: number;
  testArgs: string[];
}

function parseStep(v: string | undefined, flag: string): Step {
  if (!v || !(STEPS as readonly string[]).includes(v)) throw new UsageError(`${flag}에는 ${STEPS.join('·')} 중 하나가 필요함 (받은 값: ${v ?? '없음'})`);
  return v as Step;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { from: null, only: null, noWars: false, budget: DEFAULT_BUDGET, testArgs: [] };
  for (let i = 0; i < argv.length; i++) {
    const f = argv[i];
    if (f === '--') {
      a.testArgs.push(...argv.slice(i + 1));
      break;
    }
    if (f === '--from') a.from = parseStep(argv[++i], f);
    else if (f === '--only') {
      const v = argv[++i];
      if (!v) throw new UsageError('--only에 단계 목록이 필요함');
      a.only = [...(a.only ?? []), ...v.split(',').filter(Boolean).map((s) => parseStep(s, '--only'))];
    } else if (f === '--no-wars') a.noWars = true;
    else if (f === '--budget') {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n <= 0) throw new UsageError('--budget에는 0보다 큰 초가 필요함');
      a.budget = n;
    } else if (f === '-h' || f === '--help') throw new UsageError('');
    else a.testArgs.push(f);
  }
  if (a.from && a.only) throw new UsageError('--from과 --only는 함께 쓸 수 없음');
  return a;
}

// ── 상태(.cache/finish-border/state.json) ────────────────────

interface State {
  version: 1;
  /** 단계별 마지막 걸린 시간(초). test는 --ci 여부를 갈라 'test'·'test-ci'로 적는다 */
  steps: Partial<Record<string, { seconds: number; at: string }>>;
  /** 전쟁 하나 빌드에 든 시간(초, 마지막 호출의 평균) */
  rebuildPerWar?: number;
}

function readState(): State {
  try {
    const v = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as State;
    if (v && v.version === 1 && typeof v.steps === 'object') return v;
  } catch {
    /* 없거나 깨졌으면 새로 */
  }
  return { version: 1, steps: {} };
}

function writeState(s: State) {
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 1) + '\n');
}

// ── 하위 명령 ────────────────────────────────────────────────

const rel = (p: string) => path.relative(ROOT, p).replaceAll('\\', '/');
const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초` : `${s < 10 ? s.toFixed(1) : Math.round(s)}초`);

/** package.json scripts[name]이 `node [옵션…] 파일 [인자…]` 꼴이어야 한다 → process.execPath에 줄 인자 */
function scriptArgs(name: string): string[] {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
  const cmd = pkg.scripts?.[name];
  if (!cmd) throw new Error(`package.json scripts에 '${name}'이 없음`);
  const parts = cmd.trim().split(/\s+/);
  if (parts[0] !== 'node' || parts.some((p) => /[&|;<>"'`$]/.test(p))) throw new Error(`scripts.${name}이 'node …' 단순 꼴이 아님: ${cmd}`);
  return parts.slice(1);
}

/** node 스크립트를 부르고 출력을 로그 파일에 받는다 */
function run(logName: string, args: string[]): { status: number; seconds: number; log: string } {
  mkdirSync(CACHE, { recursive: true });
  const log = path.join(CACHE, `${logName}.log`);
  const fd = openSync(log, 'w');
  const t = Date.now();
  let status: number;
  try {
    const r = spawnSync(process.execPath, args, { cwd: ROOT, stdio: ['ignore', fd, fd], env: process.env });
    status = r.status ?? (r.error ? 1 : 1);
    if (r.error) writeFileSync(log, `실행 실패: ${String(r.error)}\n`, { flag: 'a' });
  } finally {
    closeSync(fd);
  }
  return { status, seconds: (Date.now() - t) / 1000, log };
}

function tailLines(file: string, n: number): string[] {
  try {
    return readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).slice(-n);
  } catch {
    return [];
  }
}

/** git status 바뀐 파일마다 상태와 내용 해시. 단계 앞뒤를 견주어 그 단계가 바꾼 파일을 센다(미리 고쳐 둔 파일은 빼고, 새 폴더 안 파일도 하나씩) */
function snapshot(): Map<string, string> {
  const r = spawnSync('git', ['status', '--porcelain', '--untracked-files=all', '-z'], { cwd: ROOT, encoding: 'utf8' });
  const out = new Map<string, string>();
  if (r.status !== 0) return out;
  const rows = r.stdout.split('\0');
  for (let i = 0; i < rows.length; i++) {
    const l = rows[i];
    if (!l) continue;
    // 이름 바꿈(R·C)은 -z에서 옛 이름이 다음 칸에 따로 온다
    if (l[0] === 'R' || l[0] === 'C') i++;
    const p = l.slice(3);
    let h = 'none';
    try {
      h = createHash('sha256').update(readFileSync(path.join(ROOT, p))).digest('hex');
    } catch {
      /* 지워진 파일 */
    }
    out.set(p, `${l.slice(0, 2)} ${h}`);
  }
  return out;
}

/** 앞뒤가 다른 파일 경로 */
function changedBy(before: Map<string, string>, after: Map<string, string>): string[] {
  return [...new Set([...before.keys(), ...after.keys()])].filter((p) => before.get(p) !== after.get(p));
}

// ── 다시 빌드할 전쟁 찾기 (test:geo places와 같은 판정) ─────────

interface StaleResult {
  /** 다시 빌드할 전쟁 id와 이유 */
  stale: { id: string; reason: string }[];
  /** wars.json에는 있는데 전쟁 YAML이 없는 id (부분 빌드로는 못 고침) */
  orphans: string[];
}

function findStale(): StaleResult {
  const built = readBuilt(ROOT);
  const inputs = warInputHashes(ROOT);
  const stale: StaleResult['stale'] = [];
  const orphans: string[] = [];
  let index: { id: string }[] = [];
  try {
    index = JSON.parse(readFileSync(path.join(ROOT, 'public/data/wars.json'), 'utf8')) as { id: string }[];
  } catch {
    /* 호출하는 쪽이 wars.json 유무를 먼저 확인한다 */
  }
  const inIndex = new Set<string>();
  for (const w of index) {
    inIndex.add(w.id);
    if (!inputs.has(w.id)) {
      orphans.push(w.id);
      continue;
    }
    const shapesFile = path.join(ROOT, 'public/data/wars', `${w.id}.json`);
    if (!existsSync(shapesFile)) {
      stale.push({ id: w.id, reason: `public/data/wars/${w.id}.json 없음` });
      continue;
    }
    const reason = warStaleReason(w, built[w.id], inputs.get(w.id), readFileSync(shapesFile));
    if (reason) stale.push({ id: w.id, reason });
  }
  for (const id of inputs.keys()) if (!inIndex.has(id)) stale.push({ id, reason: 'wars.json에 없는 전쟁' });
  return { stale: stale.sort((a, b) => a.id.localeCompare(b.id)), orphans };
}

// ── 본체 ─────────────────────────────────────────────────────

function main(): number {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    console.error(e.message ? `${e.message}\n${USAGE}` : USAGE);
    return e.message ? 2 : 0;
  }

  const wanted: Step[] = args.only ? STEPS.filter((s) => args.only!.includes(s)) : args.from ? STEPS.slice(STEPS.indexOf(args.from)) : [...STEPS];
  const plan = wanted.filter((s) => !(s === 'wars' && args.noWars));
  if (plan.length === 0) {
    console.error(`할 단계가 없음 (${args.only ? '--only로 고른 단계가 모두 --no-wars로 빠짐' : '--from 이후 단계가 없음'})
${USAGE}`);
    return 2;
  }
  const t0 = Date.now();
  const elapsed = () => (Date.now() - t0) / 1000;
  const state = readState();
  const say = (l: string) => console.log(l);

  // 전쟁 부분 빌드는 wars.json이 있어야 한다. 오래 걸리는 단계에 들어가기 전에 알린다
  if (plan.includes('rebuild') && !existsSync(path.join(ROOT, 'public/data/wars.json'))) {
    console.error('finish:border: public/data/wars.json이 없어 전쟁 부분 빌드를 할 수 없음 — 전체 `npm run build:data`가 필요');
    return 1;
  }

  /** 이어서 부를 줄 */
  const resumeLine = (from: Step) => {
    const q = (s: string) => (/\s/.test(s) ? `"${s}"` : s);
    const parts = ['npm run finish:border --', ...(args.only ? ['--only', plan.slice(plan.indexOf(from)).join(',')] : ['--from', from])];
    if (args.noWars) parts.push('--no-wars');
    if (args.budget !== DEFAULT_BUDGET) parts.push('--budget', String(args.budget));
    if (args.testArgs.length) parts.push('--', ...args.testArgs.map(q));
    return `이어서: ${parts.join(' ')}`;
  };

  let ran = 0;
  let testFailed = false;
  let testRan = false;
  /** 예산 때문에 이 단계는 시작하지 않는다 */
  const overBudget = (est: number) => ran > 0 && elapsed() + est > args.budget;
  const stopForBudget = (step: Step, est: number): number => {
    say(`예산 ${fmt(args.budget)} 중 ${fmt(elapsed())} 썼고 ${LABEL[step]}에 약 ${fmt(est)} 더 필요해 여기서 멈춤`);
    say(resumeLine(step));
    return 3;
  };
  const stepFailed = (step: Step, r: { status: number; log: string }): number => {
    say(`${LABEL[step]} 실패 (종료 코드 ${r.status}) — 단계 ${step}, 로그 ${rel(r.log)}`);
    for (const l of tailLines(r.log, 4)) say(`  | ${l.slice(0, 180)}`);
    return 1;
  };
  /** test 시간은 --ci(느린 gen 검사 포함) 여부를 갈라 적는다 */
  const key = (step: Step) => (step === 'test' && args.testArgs.includes('--ci') ? 'test-ci' : step);
  const record = (step: Step, seconds: number) => {
    state.steps[key(step)] = { seconds: Math.round(seconds * 10) / 10, at: new Date().toISOString() };
    writeState(state);
  };
  /** 다음 실행의 어림: 지난 성공 시간과 바닥(처음 어림의 절반) 중 큰 값. 좁힌 실행·빨리 끝난 실행이 어림을 깎아 5분을 넘기지 않게 */
  const est = (step: Step) => Math.max(state.steps[key(step)]?.seconds ?? GUESS[step], GUESS[step] / 2);

  for (const step of plan) {
    if (step === 'geo' || step === 'wars') {
      if (overBudget(est(step))) return stopForBudget(step, est(step));
      const before = snapshot();
      const r = run(step, [...scriptArgs(NPM_SCRIPT[step]!)]);
      ran++;
      if (r.status !== 0) return stepFailed(step, r);
      record(step, r.seconds);
      const changed = changedBy(before, snapshot());
      if (step === 'geo') {
        const geo = changed.filter((p) => p.startsWith('data/geo/')).length;
        say(`① gen:geo        ${fmt(r.seconds)} · 이 단계가 바꾼 파일 ${changed.length}${geo === changed.length ? '' : ` (data/geo ${geo})`}${changed.length ? '' : ' (생성물 변화 없음)'}`);
      } else {
        const wars = changed.filter((p) => p.startsWith('data/wars/')).length;
        say(`② gen:wars       ${fmt(r.seconds)} · 이 단계가 바꾼 전쟁 파일 ${wars}`);
      }
    } else if (step === 'rebuild') {
      const found = findStale();
      if (found.orphans.length) say(`  ! wars.json에는 있는데 전쟁 YAML이 없는 전쟁 ${found.orphans.join(', ')} — 부분 빌드로 못 고침(전체 build:data)`);
      if (found.stale.length === 0) {
        say('③ 전쟁 재빌드    건너뜀 · 낡은 전쟁 없음');
        continue;
      }
      const per = Math.max(state.rebuildPerWar ?? GUESS.rebuild, GUESS.rebuild / 3);
      const room = args.budget - elapsed();
      let take = Math.floor(room / per);
      if (ran === 0) take = Math.max(take, 1);
      take = Math.min(take, found.stale.length);
      if (take < 1) return stopForBudget(step, per);
      const ids = found.stale.slice(0, take).map((s) => s.id);
      const r = run('rebuild', [...scriptArgs('build:data'), '--war', ids.join(',')]);
      ran++;
      if (r.status !== 0) return stepFailed(step, r);
      state.rebuildPerWar = Math.max(1, Math.round((r.seconds / ids.length) * 10) / 10);
      record(step, r.seconds);
      const left = findStale().stale;
      say(`③ 전쟁 재빌드    ${fmt(r.seconds)} · ${ids.length}개: ${ids.join(', ')}`);
      const still = left.filter((s) => ids.includes(s.id));
      if (still.length) say(`  ! 다시 빌드했는데도 낡음: ${still.map((s) => `${s.id}(${s.reason})`).join(', ')}`);
      const rest = left.filter((s) => !ids.includes(s.id));
      if (rest.length) {
        say(`남은 낡은 전쟁 ${rest.length}개: ${rest.map((s) => s.id).join(', ')}`);
        say(resumeLine('rebuild'));
        return 3;
      }
    } else {
      if (overBudget(est(step))) return stopForBudget(step, est(step));
      const r = run('test-geo', [...scriptArgs('test:geo'), ...args.testArgs]);
      ran++;
      testRan = true;
      if (r.status === 0 || r.status === 1) record(step, r.seconds);
      const out = (() => {
        try {
          return readFileSync(r.log, 'utf8').split(/\r?\n/);
        } catch {
          return [];
        }
      })();
      const head = out.find((l) => l.startsWith('test:geo ')) ?? '';
      if (r.status !== 0 && r.status !== 1) {
        say(`④ test:geo       ${fmt(r.seconds)} · ${head || '요약 없음'}`);
        return stepFailed(step, r);
      }
      testFailed = r.status === 1;
      say(`④ test:geo       ${fmt(r.seconds)} · ${head || (testFailed ? '실패' : '통과')}`);
      for (const l of out) if (/^\s+(✗|…|실패 |오류 )/.test(l)) say(l.slice(0, 220));
      say(`  전체 출력: ${rel(path.join(CACHE, 'test-geo.log'))}`);
    }
  }

  const skippedNote = testRan ? '' : ' (test:geo는 안 돌림)';
  if (testFailed) {
    say(`판정: 실패 — test:geo가 새 실패를 냄 · 합계 ${fmt(elapsed())}`);
    return 1;
  }
  say(`판정: 통과${skippedNote} — 합계 ${fmt(elapsed())}`);
  return 0;
}

process.exitCode = main();
