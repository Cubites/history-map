// 앵커 바꾸기 (TOOLS-ANALYSIS 2·3절 4번, 2026-11-02): 에이전트마다 새로 짜던 사건 `work/patch.mjs`·`edit2.py`·`fix4.mjs` 같은 '원문 → 새 글' 바꾸기를 한 도구로 굳힌다.
// 사용: npm run anchor-edit -- <쌍 파일(.yaml|.yml|.json)> [--dry-run] [--reapply]
// 쌍 파일 꼴(YAML 또는 JSON, 맨 위가 목록):
//   - { file: data/events/me-06-….yaml, old: "바꿀 원문", new: "새 글" }
//   - file: data/tests/spelling.yaml          # 한 파일에 쌍 여럿
//     pairs:
//       - old: |-                              # 여러 줄은 |- (끝 줄바꿈 없음). | 는 끝에 줄바꿈 하나가 붙는다
//           첫 줄
//           둘째 줄
//         new: |-
//           …
// 하는 일:
//  - file은 저장소 뿌리 기준 경로. 저장소 밖·.git·node_modules(원본으로 가는 정션)·링크를 거쳐 밖으로 나가는 경로는 거부(종료 2).
//    .git·node_modules는 경로 조각마다 소문자로 견준다(Windows에서 .GIT/… 도 같은 폴더).
//  - 줄바꿈: 쌍의 글은 \n으로 적는다. 대상 파일에 \r\n이 하나라도 있으면 CRLF 파일로 보고 쌍의 \n을 \r\n으로 바꿔 찾고 쓴다(파일 줄바꿈 유지). BOM도 그대로 둔다.
//  - 판정(쌍마다, 바꾸기 전 원래 파일에서 센다. 겹쳐 나오는 것도 셈):
//      이미 적용 = new가 비지 않았고 파일에 new가 딱 한 번 있으며 아래 둘 중 하나 → 건너뜀(실패 아님)
//                  (가) old가 1번 이상이고 모두 그 new 안에 있음(old를 품는 new — 덧붙이는 쌍. old가 new 밖에 없으니 이미 바뀐 것)
//                  (나) old가 0번이고 --reapply를 줌. 단 new가 old의 일부인 쌍(줄이는 쌍)은 --reapply여도 안 됨(원래 글에도 new가 있어 구별 불가)
//      바꿈     = 이미 적용이 아니고 old가 딱 한 번 → 바꿀 목록에 넣음
//      실패     = 그 밖(old 0번 또는 2번 이상). 같은 파일의 두 쌍이 같은 곳을 건드려도 실패
//    old 0번은 기본으로 실패다: old 오타와 '이미 적용'은 파일만 봐서는 구별되지 않는다(new가 우연히 한 번 있거나 old 안에 new가 들어 있으면 오타가 성공으로 보임).
//    그래서 같은 쌍 파일을 새 HEAD에서 다시 돌릴 때만 --reapply로 (나)를 허락한다(이미 적용 쌍은 화면에 한 줄씩 보임 — 눈으로 확인).
//    → 쌍이 하나라도 실패면 어느 파일도 쓰지 않고 종료 1. 모두 맞으면 파일마다 원래 글 위치 기준으로 한 번에 바꿔 쓴다(쌍 순서와 상관없음).
//  - 지우기(new가 빈 글)는 다시 돌리면 old 0번이라 실패한다(오타와 구별할 수 없으므로 이미 적용으로 보지 않음). 다시 돌릴 쌍 파일이면 앞뒤 글 일부를 old·new 양쪽에 넣는다.
//  - 쓰기: 바꿀 파일을 모두 임시 파일(<파일>.anchor-edit-<pid>.tmp)에 먼저 쓰고 다시 읽어 확인한 뒤 차례로 바꿔 넣는다. 바꿔 넣다 실패하면
//    이미 바꾼 파일을 원래 글로 되돌리고, 무엇이 바뀌었고 되돌려졌는지 화면에 알린다(종료 1). 임시 파일은 끝에 지운다.
//  - --dry-run: 판정만 하고 파일은 쓰지 않는다(종료 코드는 같음). --reapply: 위 (나)를 허락.
// 출력: 머리 1줄 + 파일마다 1줄 + 실패 위 10줄 + 이미 적용 위 10줄. 쌍마다 판정은 .cache/anchor-edit/report.md.
// 종료 코드: 0 성공(모두 바꿈·이미 적용), 1 실패한 쌍 있음(아무것도 안 씀)·쓰다가 실패(바꾼 것은 되돌림), 2 사용법·쌍 파일·경로 오류.
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_DIR = path.join(ROOT, '.cache/anchor-edit');
const USAGE = '사용: npm run anchor-edit -- <쌍 파일(.yaml|.yml|.json)> [--dry-run] [--reapply]';

class UsageError extends Error {}

interface Pair {
  /** 쌍 파일 안 자리(1부터): '3' 또는 '3.2'(묶음 3의 둘째 쌍) */
  at: string;
  file: string;
  old: string;
  new: string;
}

type Verdict = 'apply' | 'done' | 'fail';
interface Judged extends Pair {
  verdict: Verdict;
  why: string;
  /** 바꿀 곳(원래 글 위치) */
  start: number;
  end: number;
  text: string;
}

const str = (v: unknown) => typeof v === 'string';

function readPairs(file: string): Pair[] {
  let raw: unknown;
  const text = readFileSync(file, 'utf8');
  try {
    raw = /\.json$/i.test(file) ? JSON.parse(text) : parseYaml(text);
  } catch (e) {
    throw new UsageError(`쌍 파일을 읽지 못함: ${(e as Error).message.split('\n')[0]}`);
  }
  if (!Array.isArray(raw) || raw.length === 0) throw new UsageError('쌍 파일 맨 위는 비지 않은 목록이어야 함');
  const out: Pair[] = [];
  raw.forEach((item: Record<string, unknown>, i) => {
    const n = i + 1;
    if (!item || typeof item !== 'object' || !str(item.file) || !item.file) throw new UsageError(`${n}번째 항목: file(문자열)이 없음`);
    const one = (p: Record<string, unknown>, at: string) => {
      if (!p || !str(p.old) || !str(p.new)) throw new UsageError(`${at}번째 쌍: old·new는 문자열이어야 함(new를 비우려면 new: "")`);
      if (p.old === '') throw new UsageError(`${at}번째 쌍: old가 빈 글`);
      if (p.old === p.new) throw new UsageError(`${at}번째 쌍: old와 new가 같음`);
      out.push({ at, file: String(item.file), old: String(p.old), new: String(p.new) });
    };
    if (Array.isArray(item.pairs)) {
      if ('old' in item || 'new' in item) throw new UsageError(`${n}번째 항목: pairs와 old·new를 함께 쓸 수 없음`);
      if (!item.pairs.length) throw new UsageError(`${n}번째 항목: pairs가 비었음`);
      item.pairs.forEach((p: Record<string, unknown>, j: number) => one(p, `${n}.${j + 1}`));
    } else one(item, String(n));
  });
  return out;
}

/** 저장소 안 실제 파일인지(정션·링크를 따라 밖으로 나가지 않는지) 확인하고 절대 경로를 돌려준다 */
function resolveTarget(rel: string): string {
  if (path.isAbsolute(rel) || /^[a-zA-Z]:/.test(rel)) throw new UsageError(`저장소 뿌리 기준 상대 경로만 받음: ${rel}`);
  const abs = path.resolve(ROOT, rel);
  const relNorm = path.relative(ROOT, abs).replace(/\\/g, '/');
  if (!relNorm || relNorm.startsWith('../') || relNorm === '..') throw new UsageError(`저장소 밖 경로: ${rel}`);
  // 대소문자를 가리지 않는 파일 체계(Windows)에서는 .GIT/… 도 .git이므로 조각마다 소문자로 견준다
  const bad = relNorm.split('/').find((s) => s.toLowerCase() === '.git' || s.toLowerCase() === 'node_modules');
  if (bad) throw new UsageError(`${bad} 안은 고치지 않음: ${rel}`);
  if (!existsSync(abs)) throw new UsageError(`파일이 없음: ${rel}`);
  if (!lstatSync(abs).isFile()) throw new UsageError(`보통 파일이 아님(폴더·링크): ${rel}`);
  const real = path.relative(realpathSync(ROOT), realpathSync(abs)).replace(/\\/g, '/');
  if (real.startsWith('../') || path.isAbsolute(real)) throw new UsageError(`링크·정션을 거쳐 저장소 밖으로 나감: ${rel}`);
  return abs;
}

/** 겹쳐 나오는 것까지 모든 위치 */
function positions(hay: string, needle: string): number[] {
  const out: number[] = [];
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) out.push(i);
  return out;
}

const short = (s: string, n = 50) => {
  const one = s.replace(/\r?\n/g, '⏎');
  return one.length > n ? one.slice(0, n) + '…' : one;
};

function judge(pairs: Pair[], text: string, reapply: boolean): Judged[] {
  const crlf = text.includes('\r\n');
  const eol = (s: string) => (crlf ? s.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));
  const out: Judged[] = pairs.map((p) => {
    const o = eol(p.old);
    const nw = eol(p.new);
    const olds = positions(text, o);
    const news = nw ? positions(text, nw) : [];
    const inside = (i: number) => news.some((j) => j <= i && i + o.length <= j + nw.length);
    const base = { ...p, start: -1, end: -1, text: nw };
    // 이미 적용: (가) old가 있고 모두 하나뿐인 new 안 / (나) --reapply이고 old 0번이며 new가 old의 일부가 아님 (머리 주석)
    if (nw && news.length === 1 && olds.length > 0 && olds.every(inside)) return { ...base, verdict: 'done' as Verdict, why: '이미 적용(원문이 새 글 안에만 있음)' };
    if (nw && news.length === 1 && olds.length === 0 && reapply && !o.includes(nw)) return { ...base, verdict: 'done' as Verdict, why: '이미 적용(--reapply: 원문 0번·새 글 1번)' };
    if (olds.length === 1) return { ...base, verdict: 'apply' as Verdict, why: '바꿈', start: olds[0], end: olds[0] + o.length };
    const hint = !nw
      ? ' (지우는 쌍)'
      : news.length !== 1
        ? ` (새 글 ${news.length}번)`
        : o.includes(nw)
          ? ' (새 글 1번이지만 새 글이 원문의 일부라 이미 적용인지 알 수 없음 — 원문 오타?)'
          : reapply
            ? ''
            : ' (새 글 1번 — 이미 바꾼 쌍을 다시 돌린 것이면 --reapply, 아니면 원문 오타)';
    const why = olds.length === 0 ? `원문 0번${hint}` : `원문 ${olds.length}번`;
    return { ...base, verdict: 'fail' as Verdict, why };
  });
  // 같은 파일 안에서 바꿀 곳이 겹치면 둘 다 실패
  const apply = out.filter((j) => j.verdict === 'apply').sort((a, b) => a.start - b.start);
  for (let k = 1; k < apply.length; k++) {
    const a = apply[k - 1];
    const b = apply[k];
    if (b.start < a.end) {
      a.verdict = b.verdict = 'fail';
      a.why = `${b.at}번째 쌍과 같은 곳을 바꿈`;
      b.why = `${a.at}번째 쌍과 같은 곳을 바꿈`;
    }
  }
  return out;
}

function main(argv: string[]): number {
  const dry = argv.includes('--dry-run');
  const reapply = argv.includes('--reapply');
  const rest = argv.filter((a) => a !== '--dry-run' && a !== '--reapply');
  if (rest.length !== 1 || rest[0].startsWith('-')) throw new UsageError(USAGE);
  const pairFile = path.resolve(rest[0]);
  if (!existsSync(pairFile)) throw new UsageError(`쌍 파일이 없음: ${rest[0]}`);
  const pairs = readPairs(pairFile);

  // 파일별로 모은다(경로는 실제 절대 경로로 같은 파일을 하나로)
  const byFile = new Map<string, { rel: string; pairs: Pair[] }>();
  for (const p of pairs) {
    const abs = resolveTarget(p.file);
    const key = abs.toLowerCase();
    const g = byFile.get(key) ?? { rel: path.relative(ROOT, abs).replace(/\\/g, '/'), pairs: [] };
    g.pairs.push(p);
    byFile.set(key, g);
  }

  const results: { abs: string; rel: string; text: string; judged: Judged[] }[] = [];
  for (const [, g] of byFile) {
    const abs = path.resolve(ROOT, g.rel);
    const text = readFileSync(abs, 'utf8');
    results.push({ abs, rel: g.rel, text, judged: judge(g.pairs, text, reapply) });
  }
  const all = results.flatMap((r) => r.judged);
  const count = (v: Verdict, list = all) => list.filter((j) => j.verdict === v).length;
  const failed = count('fail');

  let written = 0;
  let writeError: string | null = null;
  if (!failed && !dry) {
    // 모두 임시 파일에 먼저 쓰고 확인 → 차례로 바꿔 넣기. 바꿔 넣다 실패하면 바꾼 것을 원래 글로 되돌린다(머리 주석 '쓰기')
    const todo: { r: (typeof results)[number]; t: string; tmp: string }[] = [];
    for (const r of results) {
      const apply = r.judged.filter((j) => j.verdict === 'apply').sort((a, b) => b.start - a.start);
      if (!apply.length) continue;
      let t = r.text;
      for (const j of apply) t = t.slice(0, j.start) + j.text + t.slice(j.end);
      todo.push({ r, t, tmp: `${r.abs}.anchor-edit-${process.pid}.tmp` });
    }
    const swapped: typeof todo = [];
    try {
      for (const w of todo) {
        writeFileSync(w.tmp, w.t, 'utf8');
        if (readFileSync(w.tmp, 'utf8') !== w.t) throw new Error(`임시 파일 확인 실패: ${w.r.rel}`);
      }
      for (const w of todo) {
        renameSync(w.tmp, w.r.abs);
        swapped.push(w);
      }
      written = swapped.length;
    } catch (e) {
      const restored: string[] = [];
      const stuck: string[] = [];
      for (const w of swapped) {
        try {
          writeFileSync(w.r.abs, w.r.text, 'utf8');
          restored.push(w.r.rel);
        } catch {
          stuck.push(w.r.rel);
        }
      }
      writeError = `쓰다가 실패: ${(e as Error).message.split('\n')[0]} — 바꿔 넣은 ${swapped.length}개 중 되돌림 ${restored.length}${restored.length ? `(${restored.join(', ')})` : ''}${stuck.length ? ` · 되돌리지 못해 바뀐 채 남음 ${stuck.join(', ')}` : ''}, 나머지 파일은 안 바뀜`;
    } finally {
      for (const w of todo) rmSync(w.tmp, { force: true });
    }
  }

  // 보고서
  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, 'report.md');
  const md = [
    `# anchor-edit ${new Date().toISOString()}`,
    `쌍 파일: ${pairFile.replace(/\\/g, '/')}${dry ? ' (--dry-run)' : ''}`,
    '',
    '| 자리 | 파일 | 판정 | 원문 앞부분 |',
    '|---|---|---|---|',
    ...results.flatMap((r) => r.judged.map((j) => `| ${j.at} | ${r.rel} | ${j.why} | ${short(j.old, 80).replace(/\|/g, '\\|')} |`)),
    '',
  ].join('\n');
  writeFileSync(reportPath, md, 'utf8');

  const state = failed ? '실패 — 아무 파일도 쓰지 않음' : writeError ? writeError : dry ? '확인만(--dry-run)' : `파일 ${written}개 씀`;
  console.log(`anchor-edit: 쌍 ${all.length}개 · 바꿈 ${count('apply')} · 이미 적용 ${count('done')} · 실패 ${failed} — ${state}`);
  for (const r of results) {
    console.log(`  ${r.rel}${r.text.includes('\r\n') ? ' (CRLF)' : ''}: 바꿈 ${count('apply', r.judged)} · 이미 적용 ${count('done', r.judged)} · 실패 ${count('fail', r.judged)}`);
  }
  const fails = all.filter((j) => j.verdict === 'fail');
  for (const j of fails.slice(0, 10)) console.log(`  실패 ${j.at}번째 쌍(${j.file}): ${j.why} — "${short(j.old)}"`);
  if (fails.length > 10) console.log(`  … 외 ${fails.length - 10}건`);
  // 이미 적용으로 건너뛴 쌍도 한 줄씩(오타가 성공으로 보이지 않았는지 눈으로 확인)
  const done = all.filter((j) => j.verdict === 'done');
  for (const j of done.slice(0, 10)) console.log(`  이미 적용 ${j.at}번째 쌍(${j.file}): ${j.why} — "${short(j.new)}"`);
  if (done.length > 10) console.log(`  … 외 ${done.length - 10}건`);
  console.log(`  자세히: ${path.relative(ROOT, reportPath).replace(/\\/g, '/')}`);
  return failed || writeError ? 1 : 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  if (e instanceof UsageError) {
    console.error(e.message);
    process.exitCode = 2;
  } else throw e;
}
