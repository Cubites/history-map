// 바뀐 것 찾기 (test:geo --changed, finish:border의 gen:wars 자동 건너뜀): 기준 커밋과 지금 작업 트리(스테이지·추적 안 된 새 파일 포함)의 git 차이에서
// 검사 범위를 고른다. 손으로 해 구간을 나누어 돌리던 시간(전체 test:geo 약 6분, gaps가 그 가운데 4분 반)과 고대·중세 단계의 쓸데없는 gen:wars(약 3분)를 줄이려고 만들었다.
// 사용: 직접 실행하지 않는다. scripts/test-geo/index.ts(--changed)와 scripts/finish-border.ts(wars 단계)가 불러 쓴다.
// 하는 일
//  - planChanged(): test:geo --changed의 계획. 해 범위를 좁히는 것은 **gaps·overlap 두 검사만**(RANGE_CHECKS)이고, 나머지 검사는 모두 전체 범위로 돈다.
//      나머지 검사(places·events·colors·years·spelling·lines·strips·zero·islands·gen)는 전체로 돌아도 합쳐 약 1분 반이고,
//      글 속 해(years)·표기 사전(spelling)·사건 ±2년(events)·기본 팔레트 순서(colors)처럼 바뀐 곳과 먼 해에 결과가 생기는 길이 많아 범위를 좁히면 놓칠 수 있다.
//    gaps·overlap의 입력과 범위를 고르는 법:
//      ① data/geo/*.geojson(맨 위 파일만 읽음)의 영토 버전 줄을 기준과 견줘 생기거나 없어지거나 바뀐 (entityId, from, to) → [from, to](to 해까지 넣어 새 경계 해 칸이 걸리게, to 없음은 올해)
//      ② scripts/geo/ 가 바뀌면 빈 땅 검사 구역(collectGapZones)을 기준과 견줌 → 바뀐 구역(그 구역을 minus로 쓰는 뒤 구역 포함)의 [from, to](없으면 처음~올해)
//         기준 쪽은 .cache/geo-base-<커밋>/에 그 커밋의 scripts/geo를 풀어, 지금 쪽은 scripts/geo 그대로 자식 프로세스로 읽는다(lib.mjs의 ../../.cache/geo-ops 캐시를 함께 씀).
//         결과는 .cache/test-geo/changed/에 내용 해시로 둔다. 풀어 둔 geo-base 폴더는 성공·실패와 상관없이 지운다(안에 링크·정션이 없을 때만).
//         두 자식 프로세스는 합쳐 ZONE_BUDGET_MS(90초) 안에 끝나야 한다. 넘으면(연산 캐시 .cache/geo-ops가 비어 구역 계산이 2~3분 걸릴 때) 계산을 끊고 전체 모드로 간다
//         — 명령 하나 5분 안을 지키려고(계획 90초 + 범위 검사 약 2분 반). 끊긴 계산도 연산 캐시에 남아 다음 번은 빨라진다.
//         실패·시간 넘김이면 화면 이유는 오류 첫 줄 요약, 자식 프로세스 오류 꼬리는 .cache/test-geo/changed/zones-error.log.
//      ③ data/tests/allow·baseline의 gaps·overlap·shapes 파일에서 **지워지거나 바뀐** 줄의 열쇠 해(gaps `<구역> <해>`, overlap `겹침 <id>@<해> <id>@<해>`).
//         더한 줄은 실패를 만들 수 없어 보지 않는다. strips·zero·islands(띠·영·섬) 열쇠는 그 검사가 전체로 돌므로 보지 않는다. 해를 읽을 수 없는 열쇠(앞부분 일치 `*` 등)는 전체 모드.
//      범위 = 위 구간들을 모두 덮는 구간 하나(따로 떨어진 두 시대를 고치면 그 사이도 함께 검사한다). 처음~올해를 다 덮으면 전체 모드.
//      ①~③이 하나도 없으면 gaps·overlap을 건너뛴다(나머지는 전체로 돈다).
//    안전 쪽(전체 모드로 돌리고 이유 한 줄): 아래 '보는 곳 밖' 경로가 바뀜 — scripts/(geo 밖)·src/schema·data/base·data/tests/zones.yaml·package*.json 등 —,
//      --region을 손으로 주었는데 data/entities가 바뀜(나라 파일 = 권역이 overlap 쌍 고르기에 쓰임), 빈 땅 구역을 읽지 못함·시간 넘김, 그 밖에 판단이 서지 않음.
//    보는 곳 밖이지만 gaps·overlap에 쓰이지 않아 범위와 무관한 것: data/entities·data/events·data/relations.yaml·data/exclaves.yaml·data/geo/<하위 폴더>·data/tests/places·data/tests/spelling.yaml,
//      data/wars(gaps·overlap은 shapes.ts loadTerritories로 data/geo 맨 위 파일만 읽고 전쟁 자료는 읽지 않는다. 전쟁 자료를 읽는 places·gen은 전체 범위로 돈다 —
//      1·2차 대전 작업에서 gen:wars를 돌린 사본이 늘 전체 모드가 되지 않게),
//      위 ③ 밖의 허용·기준선 파일(모두 전체로 도는 검사의 것), docs·src(schema 밖)·.github·맨 위 *.md 등 화면·문서 파일.
//  - planWars(): finish:border의 gen:wars를 건너뛸지. **견주는 기준은 'gen:wars가 마지막으로 성공했을 때의 입력'**이다(HEAD가 아님:
//      data/geo 고침을 커밋한 뒤 이어 부르거나 메인이 커밋 뒤 돌리면 HEAD와는 같아 보여 data/wars가 어긋난 채 남기 때문).
//      기록: finish:border가 gen:wars 성공 직후 warsGenRecord()를 .cache/finish-border/state.json의 warsGen에 적는다 —
//        그때 HEAD 커밋, data/geo(home/ 포함) geojson 파일마다 내용 해시와 영토 버전 열쇠(entityId·from·to·줄 해시), 나머지 전쟁 생성 입력의 내용 해시.
//      판정 순서:
//        ① 기록이 있고 기록의 커밋이 지금 HEAD의 조상(같은 커밋 포함)이면 기록과 지금 작업 트리를 견준다:
//           전쟁 생성 입력(data/wars·data/base/fragments·scripts/wars·scripts/build-data/geo.ts·package-lock.json·data/geo의 geojson 밖 파일)이 다르면 돈다.
//           아니면 기록 뒤 생기거나 없어지거나 바뀐 영토 버전이 전쟁 기간과 겹치면 돈다, 안 겹치면 건너뜀.
//        ② 기록이 없거나 기록의 커밋이 HEAD의 조상이 아니면 안전 쪽: upstream(@{upstream}, 예: origin/main — CI가 gen을 확인한 쪽)이 있으면
//           그 커밋과 지금 작업 트리(그 사이 커밋 포함)를 같은 규칙으로 견준다. upstream도 없으면 건너뛰지 않는다.
//        판단 중 오류도 돈다. finish:border에서 --wars를 주거나 --only로 wars 단계를 직접 고르면 이 판정을 하지 않고 늘 돈다(finish-border.ts).
//      전쟁 생성 입력 목록은 test:geo gen 검사의 WARS_GEN_INPUT_DIRS·FILES와 같다(data/geo는 영토 버전으로 따로 봄).
//      전쟁 = 생성기가 만드는 것(scripts/wars/<전쟁 id>/ 폴더가 있는 data/wars YAML), 기간은 그 YAML에 나오는 모든 날짜(YYYY-MM-DD)의 첫 해~끝 해. 박아 둔 해는 없다.
// 한계: 기준 커밋에 이미 있던 실패는 범위 밖이면 보이지 않는다(기준은 전체 검사를 통과한 커밋이어야 한다). 단계 끝 메인 검사는 지금처럼 전체로 둔다.
//   이 파일의 판단은 검사 파일(checks/*.ts)이 읽는 것을 2026-11-02에 손으로 따라가 정했다. 검사가 새 입력을 읽게 되면 여기 목록도 고칠 것.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

/** 해 범위를 좁혀 돌리는 검사 id. 나머지 검사는 --changed에서도 전체 범위로 돈다 */
export const RANGE_CHECKS: ReadonlySet<string> = new Set(['gaps', 'overlap']);
/** RANGE_CHECKS가 쓰는 허용·기준선 파일 이름(검사 id와 묶음 이름 shapes) */
const RANGE_FILES = new Set(['gaps', 'overlap', 'shapes']);
/** checks/shapes.ts의 RANGE_START(고조선 건국)와 같음 */
const RANGE_START = -2332;
const THIS_YEAR = new Date().getFullYear();
/** checks/shapes.ts의 WARS_GEN_INPUT_DIRS·WARS_GEN_INPUT_FILES와 같아야 한다(전쟁 생성기 입력). data/geo는 영토 버전으로 따로 본다 */
const WARS_INPUT_DIRS = ['data/wars/', 'data/base/fragments/', 'scripts/wars/'];
const WARS_INPUT_FILES = ['scripts/build-data/geo.ts', 'package-lock.json'];

/** 기준 커밋을 찾지 못함 등 사용법 오류 (index.ts가 종료 코드 2로) */
export class ChangedUsageError extends Error {}

export interface ChangedPlan {
  /** 기준 커밋(짧은 해시) */
  base: string;
  /** full: 모든 검사 전체 범위 / range: gaps·overlap만 years / none: gaps·overlap 건너뜀 */
  mode: 'full' | 'range' | 'none';
  years: [number, number] | null;
  /** 머리 줄에 보일 이유(짧게) */
  reasons: string[];
  /** 기준과 다른 파일 수 */
  files: number;
}

// ── git ──────────────────────────────────────────────────────

function git(root: string, args: string[], input?: string | Buffer): Buffer {
  const r = spawnSync('git', args, { cwd: root, input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`git ${args.slice(0, 2).join(' ')} 실패: ${(r.stderr?.toString() || String(r.error)).split('\n')[0]}`);
  return r.stdout;
}

/** 기준 이름 → 커밋 해시 */
export function resolveBase(root: string, ref: string): string {
  const r = spawnSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout.trim()) throw new ChangedUsageError(`기준 커밋 '${ref}'를 찾지 못함`);
  return r.stdout.trim();
}

/** 기준과 다른 경로(작업 트리·스테이지 차이 + 추적 안 된 새 파일). '/' 구분 */
export function changedPaths(root: string, base: string): string[] {
  spawnSync('git', ['update-index', '-q', '--refresh'], { cwd: root });
  const split = (b: Buffer) => b.toString('utf8').split('\0').filter(Boolean);
  const tracked = split(git(root, ['diff', '--name-only', '--no-renames', '-z', base, '--']));
  const untracked = split(git(root, ['ls-files', '--others', '--exclude-standard', '-z']));
  return [...new Set([...tracked, ...untracked])].sort();
}

/** 기준 커밋의 파일 글(없으면 null) */
function baseText(root: string, base: string, rel: string): string | null {
  const r = spawnSync('git', ['show', `${base}:${rel}`], { cwd: root, maxBuffer: 1 << 30 });
  return r.status === 0 ? r.stdout.toString('utf8') : null;
}
function nowText(root: string, rel: string): string | null {
  try {
    return readFileSync(path.join(root, rel), 'utf8');
  } catch {
    return null;
  }
}
const lines = (t: string | null) => (t ?? '').split('\n').map((l) => l.replace(/\r$/, ''));

// ── 영토 버전 ─────────────────────────────────────────────────

export interface VersionChange {
  entityId: string;
  from: number;
  to: number | null;
  file: string;
}

/** geojson 한 파일의 영토 버전 줄(생성기는 한 줄에 하나씩 쓴다. 아니면 다시 직렬화한 것) */
function versionLines(text: string | null): string[] {
  if (text === null) return [];
  const ls = lines(text).filter((l) => l.startsWith('{"type":"Feature"')).map((l) => l.replace(/,$/, ''));
  const fc = JSON.parse(text) as { features?: unknown[] };
  const n = fc.features?.length ?? 0;
  return ls.length === n ? ls : (fc.features ?? []).map((f) => JSON.stringify(f));
}
function versionOf(line: string, file: string): VersionChange {
  const m = /^\{"type":"Feature","properties":\{"entityId":"([^"]+)","from":(-?\d+),"to":(-?\d+|null)[,}]/.exec(line);
  if (m) return { entityId: m[1], from: Number(m[2]), to: m[3] === 'null' ? null : Number(m[3]), file };
  const p = (JSON.parse(line) as { properties: { entityId: string; from: number; to?: number | null } }).properties;
  return { entityId: p.entityId, from: p.from, to: p.to ?? null, file };
}

/** 기준과 지금 사이에 생기거나 없어지거나 바뀐 영토 버전(같은 줄이 여럿이면 개수로 견줌) */
export function geoVersionChanges(root: string, base: string, paths: string[]): VersionChange[] {
  const out: VersionChange[] = [];
  for (const rel of paths) {
    const before = versionLines(baseText(root, base, rel));
    const after = versionLines(nowText(root, rel));
    const count = new Map<string, number>();
    for (const l of before) count.set(l, (count.get(l) ?? 0) + 1);
    for (const l of after) count.set(l, (count.get(l) ?? 0) - 1);
    for (const [l, n] of count) if (n !== 0) out.push(versionOf(l, rel));
  }
  return out;
}

const isGeojson = (p: string, sub: boolean) => p.startsWith('data/geo/') && p.endsWith('.geojson') && (sub || !p.slice('data/geo/'.length).includes('/'));

// ── 빈 땅 검사 구역 ───────────────────────────────────────────

interface ZonePrint {
  area: string;
  name: string;
  from: number | null;
  to: number | null;
  minus: string[];
  hash: string;
}

/** 자식 프로세스: <폴더>/area-list.mjs·engine.mjs로 구역을 모아 지문을 표시 줄 뒤에 JSON으로 낸다 */
const ZONE_CHILD = `
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const dir = process.argv[1];
const { AREAS } = await import(pathToFileURL(dir + '/area-list.mjs').href);
const { collectGapZones } = await import(pathToFileURL(dir + '/engine.mjs').href);
const out = collectGapZones(AREAS).map((z) => ({ area: z.area, name: z.name, from: z.from, to: z.to, minus: [...z.minus], hash: createHash('sha256').update(JSON.stringify(z.zone)).digest('hex').slice(0, 16) }));
process.stdout.write('\\n@@ZONES@@' + JSON.stringify(out));
`;

/** 구역 지문 캐시 열쇠: scripts/geo 파일들(경로·내용) + 지금 data/base/fragments + package-lock.json */
function zoneKey(root: string, geoFiles: [string, Buffer][]): string {
  const h = createHash('sha256').update('zones 1\0');
  for (const [p, b] of [...geoFiles].sort((a, b) => (a[0] < b[0] ? -1 : 1))) h.update(p).update('\0').update(b).update('\0');
  const frag = path.join(root, 'data/base/fragments');
  if (existsSync(frag)) for (const f of readdirSync(frag).sort()) h.update(f).update(readFileSync(path.join(frag, f)));
  const lock = path.join(root, 'package-lock.json');
  if (existsSync(lock)) h.update(readFileSync(lock));
  return h.digest('hex').slice(0, 24);
}

function listFiles(dir: string, rel = ''): string[] {
  const out: string[] = [];
  for (const d of readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const r = rel ? `${rel}/${d.name}` : d.name;
    if (d.isDirectory()) out.push(...listFiles(dir, r));
    else out.push(r);
  }
  return out;
}

const cacheFile = (root: string, key: string) => path.join(root, '.cache/test-geo/changed', `zones-${key}.json`);
function readZoneCache(root: string, key: string): ZonePrint[] | null {
  try {
    return JSON.parse(readFileSync(cacheFile(root, key), 'utf8')) as ZonePrint[];
  } catch {
    return null;
  }
}
function writeZoneCache(root: string, key: string, z: ZonePrint[]) {
  mkdirSync(path.dirname(cacheFile(root, key)), { recursive: true });
  writeFileSync(cacheFile(root, key), JSON.stringify(z));
}

/** 두 자식 프로세스(기준·지금 구역 읽기)가 합쳐 쓸 수 있는 시간. 넘으면 전체 모드(머리 주석 ②) */
const ZONE_BUDGET_MS = 90_000;
const zoneErrorLog = (root: string) => path.join(root, '.cache/test-geo/changed/zones-error.log');

/** 자식 프로세스로 <dir>의 구역 지문을 읽는다. 실패·시간 넘김이면 오류 꼬리를 zones-error.log에 적고 한 줄 요약으로 throw */
function zonesInChild(root: string, dir: string, label: string, deadline: number): ZonePrint[] {
  const left = deadline - Date.now();
  if (left < 5_000) throw new Error(`${label} 빈 땅 구역 계산 시간이 남지 않음(합쳐 ${ZONE_BUDGET_MS / 1000}초 한도, 연산 캐시 .cache/geo-ops가 빈 듯)`);
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', ZONE_CHILD, dir.replaceAll('\\', '/')], { cwd: root, maxBuffer: 1 << 28, encoding: 'utf8', timeout: left });
  const mark = r.stdout?.lastIndexOf('@@ZONES@@') ?? -1;
  if (r.status === 0 && mark >= 0) return JSON.parse(r.stdout.slice(mark + '@@ZONES@@'.length)) as ZonePrint[];
  const timedOut = (r.error as NodeJS.ErrnoException | undefined)?.code === 'ETIMEDOUT';
  const errLines = (r.stderr ?? '').split(/\r?\n/).filter((l) => l.trim());
  mkdirSync(path.dirname(zoneErrorLog(root)), { recursive: true });
  writeFileSync(
    zoneErrorLog(root),
    [`# ${new Date().toISOString()} ${label} 빈 땅 구역 읽기 실패 (${dir.replaceAll('\\', '/')})`, `종료 코드 ${r.status} · 신호 ${r.signal ?? '없음'} · ${r.error ? String(r.error) : '오류 객체 없음'}`, '--- stderr 꼬리 ---', ...errLines.slice(-40), ''].join('\n'),
  );
  // 화면 요약: 'Node.js v24…' 같은 꼬리 줄이 아니라 첫 오류 줄
  const first = errLines.find((l) => /^\w*Error\b/.test(l.trim())) ?? errLines.find((l) => /ERR_|오류/.test(l)) ?? errLines.find((l) => !/^Node\.js v/.test(l)) ?? (r.error ? String(r.error) : '이유 모름');
  const why = timedOut ? `${Math.round(left / 1000)}초 안에 끝나지 않아 끊음(연산 캐시 .cache/geo-ops가 빈 듯, 끊긴 계산도 캐시에 남음)` : first.trim().slice(0, 160);
  throw new Error(`${label} 빈 땅 구역을 읽지 못함: ${why} — 자세히 ${path.relative(root, zoneErrorLog(root)).replaceAll('\\', '/')}`);
}

/** 폴더 안에 링크·정션이 없으면 지운다(있으면 남겨 둠 — 정션 너머를 지우지 않게) */
function removePlainDir(dir: string) {
  if (!existsSync(dir)) return;
  const walk = (d: string): boolean => readdirSync(d, { withFileTypes: true }).every((e) => !e.isSymbolicLink() && (!e.isDirectory() || walk(path.join(d, e.name))));
  if (lstatSync(dir).isDirectory() && !lstatSync(dir).isSymbolicLink() && walk(dir)) rmSync(dir, { recursive: true, force: true });
}

/** 지금 작업 트리의 구역 지문 (자식 프로세스: 시간 한도를 걸려고. gaps 검사는 나중에 같은 연산 캐시로 다시 모은다) */
function nowZones(root: string, deadline: number): ZonePrint[] {
  const dir = path.join(root, 'scripts/geo');
  const key = zoneKey(root, listFiles(dir).map((f) => [f, readFileSync(path.join(dir, f))] as [string, Buffer]));
  const hit = readZoneCache(root, key);
  if (hit) return hit;
  const z = zonesInChild(root, dir, '지금', deadline);
  writeZoneCache(root, key, z);
  return z;
}

/** 기준 커밋의 구역 지문: scripts/geo를 .cache/geo-base-<커밋>/에 풀고(lib.mjs가 ../../.cache/geo-ops를 저장소 캐시로 보게 두 단계 아래) 자식 프로세스로 읽는다 */
function baseZones(root: string, base: string, deadline: number): ZonePrint[] {
  const tree = git(root, ['ls-tree', '-r', '-z', base, '--', 'scripts/geo']).toString('utf8').split('\0').filter(Boolean);
  const entries = tree.map((l) => {
    const [meta, p] = l.split('\t');
    return { blob: meta.split(' ')[2], rel: p.slice('scripts/geo/'.length) };
  });
  const out = git(root, ['cat-file', '--batch'], entries.map((e) => e.blob).join('\n') + '\n');
  const files: [string, Buffer][] = [];
  let at = 0;
  for (const e of entries) {
    const nl = out.indexOf(10, at);
    const size = Number(out.subarray(at, nl).toString('utf8').split(' ')[2]);
    files.push([e.rel, out.subarray(nl + 1, nl + 1 + size)]);
    at = nl + 1 + size + 1;
  }
  const key = zoneKey(root, files);
  const hit = readZoneCache(root, key);
  if (hit) return hit;
  const dir = path.join(root, '.cache', `geo-base-${base.slice(0, 12)}`);
  removePlainDir(dir);
  try {
    for (const [rel, b] of files) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      writeFileSync(path.join(dir, rel), b);
    }
    const z = zonesInChild(root, dir, `기준 ${base.slice(0, 7)}`, deadline);
    writeZoneCache(root, key, z);
    return z;
  } finally {
    removePlainDir(dir);
  }
}

/** 기준과 다른 구역(뒤 구역이 minus로 쓰면 그것도) → 해 구간 */
function zoneChanges(before: ZonePrint[], after: ZonePrint[]): { name: string; span: [number, number] }[] {
  const b = new Map(before.map((z) => [z.name, z]));
  const a = new Map(after.map((z) => [z.name, z]));
  const sig = (z: ZonePrint | undefined) => (z ? JSON.stringify([z.area, z.from, z.to, z.minus, z.hash]) : '');
  const changed = new Set([...new Set([...b.keys(), ...a.keys()])].filter((n) => sig(b.get(n)) !== sig(a.get(n))));
  // 순서도 칸 계산(minus)에 쓰이므로, 앞 구역 목록이 달라진 구역도 바뀐 것으로 본다
  for (let grew = true; grew; ) {
    grew = false;
    for (const z of [...before, ...after]) {
      if (changed.has(z.name) || !z.minus.some((m) => changed.has(m))) continue;
      changed.add(z.name);
      grew = true;
    }
  }
  return [...changed].flatMap((n) => [b.get(n), a.get(n)].filter((z): z is ZonePrint => !!z).map((z) => ({ name: n, span: [z.from ?? RANGE_START, z.to ?? THIS_YEAR] as [number, number] })));
}

// ── 허용·기준선 ───────────────────────────────────────────────

/** 지운 열쇠 하나가 gaps·overlap의 어느 해에 걸리는가. null = 그 두 검사 열쇠가 아님(전체로 도는 검사 것), 'unknown' = 판단 못 함 */
function yearsOfKey(key: string): number[] | null | 'unknown' {
  if (/^(띠|영|섬) /.test(key)) return null;
  if (key.endsWith('*')) return 'unknown';
  if (key.startsWith('겹침 ')) {
    const ys = [...key.matchAll(/@(-?\d+)(?= |$)/g)].map((m) => Number(m[1]));
    return ys.length === 2 ? ys : 'unknown';
  }
  const m = /^.+ (-?\d+)(?: 늘어남| 새 조각)?$/.exec(key);
  return m ? [Number(m[1])] : 'unknown';
}

/** 허용(yaml)·기준선(txt) 파일에서 지워지거나 바뀐 열쇠 */
function removedKeys(root: string, base: string, rel: string): string[] {
  const before = baseText(root, base, rel);
  const after = nowText(root, rel);
  if (rel.endsWith('.yaml')) {
    const keys = (t: string | null) => {
      const raw = t === null ? [] : ((parseYaml(t) ?? []) as { key?: unknown }[]);
      if (!Array.isArray(raw)) throw new Error(`${rel}: 최상위가 목록이 아님`);
      return raw.map((e) => String(e?.key));
    };
    const now = new Set(keys(after));
    return keys(before).filter((k) => !now.has(k));
  }
  const keep = (t: string | null) => lines(t).filter((l) => l.trim() && !l.startsWith('#'));
  const now = new Set(keep(after));
  return keep(before).filter((l) => !now.has(l)).map((l) => l.split('\t')[0]);
}

// ── 경로 나누기 ───────────────────────────────────────────────

type Kind = 'geo' | 'tests' | 'scripts-geo' | 'free' | 'entities' | 'full';

function classify(p: string): Kind {
  if (isGeojson(p, false)) return 'geo';
  if (p.startsWith('data/geo/')) return 'free';
  if (/^data\/entities\/[^/]+\.yaml$/.test(p)) return 'entities';
  if (/^data\/events\/[^/]+\.yaml$/.test(p) || p === 'data/relations.yaml' || p === 'data/exclaves.yaml' || p === 'data/LICENSE') return 'free';
  // data/wars: gaps·overlap은 읽지 않음(loadTerritories는 data/geo 맨 위 파일만). 전쟁 자료를 읽는 places·gen은 --changed에서도 전체 범위로 돈다
  if (p.startsWith('data/wars/')) return 'free';
  if (p === 'data/tests/spelling.yaml' || p.startsWith('data/tests/places/')) return 'free';
  if (/^data\/tests\/allow\/[^/]+\.yaml$/.test(p) || /^data\/tests\/baseline\/[^/]+\.txt$/.test(p)) return 'tests';
  if (p.startsWith('scripts/geo/')) return 'scripts-geo';
  if (p.startsWith('docs/') || p.startsWith('.github/') || (p.startsWith('src/') && !p.startsWith('src/schema/'))) return 'free';
  if (/^[^/]+\.md$/.test(p) || ['LICENSE', 'index.html', 'vite.config.ts', 'tsconfig.json', 'tsconfig.tsbuildinfo', '.gitignore'].includes(p)) return 'free';
  return 'full';
}

const span = (v: { from: number; to: number | null }): [number, number] => [v.from, v.to ?? THIS_YEAR];
const fmtSpan = ([a, b]: [number, number]) => `${a}~${b}`;

// ── test:geo --changed ──────────────────────────────────────

export async function planChanged(root: string, ref: string, opt: { region: string | null }): Promise<ChangedPlan> {
  const base = resolveBase(root, ref);
  const short = base.slice(0, 7);
  const paths = changedPaths(root, base);
  const plan = (mode: ChangedPlan['mode'], reasons: string[], years: [number, number] | null = null): ChangedPlan => ({ base: short, mode, years, reasons, files: paths.length });
  const kinds = new Map<Kind, string[]>();
  for (const p of paths) kinds.set(classify(p), [...(kinds.get(classify(p)) ?? []), p]);

  const full = kinds.get('full') ?? [];
  if (full.length) return plan('full', [`보는 곳 밖 파일이 바뀜: ${full.slice(0, 3).join(', ')}${full.length > 3 ? ` 외 ${full.length - 3}` : ''}`]);
  if (opt.region !== null && kinds.has('entities')) return plan('full', ['--region을 주었는데 data/entities가 바뀜(권역이 바뀌었을 수 있음)']);

  const spans: [number, number][] = [];
  const reasons: string[] = [];
  const geoPaths = kinds.get('geo') ?? [];
  if (geoPaths.length) {
    const vs = geoVersionChanges(root, base, geoPaths);
    for (const v of vs) spans.push(span(v));
    if (vs.length) reasons.push(`영토 버전 ${vs.length}개(${new Set(vs.map((v) => v.entityId)).size}나라)`);
  }
  if (kinds.has('scripts-geo')) {
    let zs: { name: string; span: [number, number] }[];
    try {
      const deadline = Date.now() + ZONE_BUDGET_MS;
      zs = zoneChanges(baseZones(root, base, deadline), nowZones(root, deadline));
    } catch (e) {
      return plan('full', [`빈 땅 구역을 견주지 못함: ${(e as Error).message.split('\n')[0]}`]);
    }
    for (const z of zs) spans.push(z.span);
    const names = [...new Set(zs.map((z) => z.name))];
    if (names.length) reasons.push(`빈 땅 구역 ${names.length}개(${names.slice(0, 3).join('·')}${names.length > 3 ? ' 외' : ''})`);
  }
  let removed = 0;
  for (const rel of kinds.get('tests') ?? []) {
    if (!RANGE_FILES.has(path.basename(rel).replace(/\.(yaml|txt)$/, ''))) continue;
    let keys: string[];
    try {
      keys = removedKeys(root, base, rel);
    } catch (e) {
      return plan('full', [`${rel}을 읽지 못함: ${(e as Error).message.split('\n')[0]}`]);
    }
    for (const k of keys) {
      const ys = yearsOfKey(k);
      if (ys === null) continue;
      if (ys === 'unknown') return plan('full', [`${rel}에서 지운 줄 '${k}'의 해를 알 수 없음`]);
      removed++;
      spans.push([Math.min(...ys), Math.max(...ys)]);
    }
  }
  if (removed) reasons.push(`gaps·overlap 허용·기준선에서 지운 줄 ${removed}`);
  const others = ['free', 'entities', 'tests'].reduce((n, k) => n + (kinds.get(k as Kind)?.length ?? 0), 0);
  if (others) reasons.push(`그 밖의 파일 ${others}개는 전체 범위로 도는 검사가 봄`);

  if (!spans.length) return plan('none', reasons.length ? reasons : ['기준과 같음']);
  const years: [number, number] = [Math.min(...spans.map((s) => s[0])), Math.max(...spans.map((s) => s[1]))];
  if (years[0] <= RANGE_START && years[1] >= THIS_YEAR) return plan('full', [`범위 ${fmtSpan(years)}가 처음~올해를 다 덮음`, ...reasons]);
  return plan('range', reasons, years);
}

/** 머리 줄 (index.ts와 finish:border가 그대로 보임) */
export function describePlan(p: ChangedPlan): string {
  const head = `바뀐 것만: 기준 ${p.base} · 바뀐 파일 ${p.files}`;
  if (p.mode === 'full') return `${head} · 전체 모드 — ${p.reasons.join(' · ')}`;
  if (p.mode === 'none') return `${head} · gaps·overlap 건너뜀(영토·빈 땅 구역·그 기준선 그대로), 나머지 검사는 전체 범위 — ${p.reasons.join(' · ')}`;
  return `${head} · gaps·overlap ${fmtSpan(p.years!)}년, 나머지 검사는 전체 범위 — ${p.reasons.join(' · ')}`;
}

// ── finish:border gen:wars ──────────────────────────────────

/** 생성기가 만드는 전쟁(scripts/wars/<id>/ 폴더가 있는 data/wars/*.yaml)과 그 기간(YAML에 나오는 날짜의 첫 해~끝 해) */
export function generatedWarPeriods(root: string): { id: string; from: number; to: number }[] {
  const gen = new Set(readdirSync(path.join(root, 'scripts/wars'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name));
  const out: { id: string; from: number; to: number }[] = [];
  for (const f of readdirSync(path.join(root, 'data/wars')).filter((f) => f.endsWith('.yaml')).sort()) {
    const text = readFileSync(path.join(root, 'data/wars', f), 'utf8');
    const doc = parseYaml(text) as { id?: unknown } | null;
    const id = typeof doc?.id === 'string' ? doc.id : '';
    if (!gen.has(id)) continue;
    const years: number[] = [];
    const walk = (v: unknown) => {
      if (typeof v === 'string') {
        const m = /^(-?\d{1,4})-\d{2}-\d{2}$/.exec(v);
        if (m) years.push(Number(m[1]));
      } else if (v instanceof Date) years.push(v.getUTCFullYear());
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(doc);
    if (!years.length) throw new Error(`data/wars/${f}: 날짜가 없어 기간을 모름`);
    out.push({ id, from: Math.min(...years), to: Math.max(...years) });
  }
  if (gen.size && !out.length) throw new Error('생성기 폴더와 이름이 같은 전쟁 YAML이 없음');
  return out;
}

/** gen:wars가 마지막으로 성공했을 때의 입력 기록 (finish:border가 .cache/finish-border/state.json의 warsGen에 둔다. 규칙은 머리 주석 planWars) */
export interface WarsGenRecord {
  /** 그때 HEAD 커밋(전체 해시) */
  head: string;
  /** 기록한 시각(ISO) */
  at: string;
  /** data/geo 영토 버전 밖의 전쟁 생성 입력 내용 해시(warsInputsHash) */
  inputs: string;
  /** data/geo(home/ 포함) geojson 파일마다 내용 해시와 영토 버전 열쇠 `entityId<TAB>from<TAB>to<TAB>줄 해시` */
  geo: Record<string, { hash: string; versions: string[] }>;
}

const sha = (b: Buffer | string, n = 16) => createHash('sha256').update(b).digest('hex').slice(0, n);

/** data/geo 영토 버전 밖의 전쟁 생성 입력(WARS_INPUT_DIRS·FILES와 data/geo의 geojson 밖 파일) 경로·내용 해시 */
function warsInputsHash(root: string): string {
  const h = createHash('sha256').update('wars-inputs 1\0');
  const under = (d: string) => (existsSync(path.join(root, d)) ? listFiles(path.join(root, d)).map((f) => `${d}${f}`) : []);
  const files = [...WARS_INPUT_DIRS.flatMap(under), ...under('data/geo/').filter((p) => !p.endsWith('.geojson')), ...WARS_INPUT_FILES].sort();
  for (const rel of files) {
    const abs = path.join(root, rel);
    h.update(rel).update('\0').update(existsSync(abs) ? readFileSync(abs) : 'none').update('\0');
  }
  return h.digest('hex').slice(0, 24);
}

/** data/geo(home/ 포함) geojson의 내용 해시와 영토 버전 열쇠. prev에 같은 내용 해시가 있으면 그 열쇠를 다시 씀(바뀐 파일만 해석) */
function geoSnapshot(root: string, prev?: WarsGenRecord['geo']): WarsGenRecord['geo'] {
  const out: WarsGenRecord['geo'] = {};
  for (const f of listFiles(path.join(root, 'data/geo')).filter((f) => f.endsWith('.geojson')).sort()) {
    const rel = `data/geo/${f}`;
    const buf = readFileSync(path.join(root, rel));
    const hash = sha(buf);
    const old = prev?.[rel];
    if (old && old.hash === hash) {
      out[rel] = old;
      continue;
    }
    const versions = versionLines(buf.toString('utf8')).map((l) => {
      const v = versionOf(l, rel);
      return `${v.entityId}\t${v.from}\t${v.to}\t${sha(l, 12)}`;
    });
    out[rel] = { hash, versions };
  }
  return out;
}

/** gen:wars가 막 성공한 지금 작업 트리의 기록 (finish:border가 부름) */
export function warsGenRecord(root: string): WarsGenRecord {
  return { head: resolveBase(root, 'HEAD'), at: new Date().toISOString(), inputs: warsInputsHash(root), geo: geoSnapshot(root) };
}

/** 기록과 지금 사이에 생기거나 없어지거나 바뀐 영토 버전(같은 열쇠가 여럿이면 개수로 견줌) */
function snapshotChanges(before: WarsGenRecord['geo'], after: WarsGenRecord['geo']): VersionChange[] {
  const out: VersionChange[] = [];
  for (const rel of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (before[rel]?.hash === after[rel]?.hash) continue;
    const count = new Map<string, number>();
    for (const k of before[rel]?.versions ?? []) count.set(k, (count.get(k) ?? 0) + 1);
    for (const k of after[rel]?.versions ?? []) count.set(k, (count.get(k) ?? 0) - 1);
    for (const [k, n] of count) {
      if (n === 0) continue;
      const [entityId, from, to] = k.split('\t');
      out.push({ entityId, from: Number(from), to: to === 'null' ? null : Number(to), file: rel });
    }
  }
  return out;
}

/** a가 b의 조상(같은 커밋 포함)인가 */
function isAncestor(root: string, a: string, b: string): boolean {
  return spawnSync('git', ['merge-base', '--is-ancestor', a, b], { cwd: root }).status === 0;
}

/** 바뀐 영토 버전이 전쟁 기간과 겹치는가 → 판정 한 줄 */
function judgeVersions(root: string, vs: VersionChange[], basis: string): { run: boolean; reason: string } {
  if (!vs.length) return { run: false, reason: `data/geo 영토 버전이 같음 (기준: ${basis})` };
  const wars = generatedWarPeriods(root);
  const hit = vs.find((v) => wars.some((w) => v.from <= w.to && (v.to === null || v.to > w.from)));
  const warText = wars.map((w) => `${w.from}~${w.to} ${w.id}`).join(', ');
  if (hit) return { run: true, reason: `바뀐 영토 ${hit.entityId} ${fmtSpan(span(hit))}이 전쟁 기간(${warText})과 겹침 (기준: ${basis})` };
  const all: [number, number] = [Math.min(...vs.map((v) => v.from)), Math.max(...vs.map((v) => span(v)[1]))];
  return { run: false, reason: `바뀐 해 ${fmtSpan(all)}(영토 버전 ${vs.length}개)가 전쟁 기간(${warText})과 안 겹침 (기준: ${basis})` };
}

/** gen:wars를 돌릴지와 그 이유 한 줄. rec = 마지막 gen:wars 성공 기록(없으면 null). 규칙은 머리 주석 planWars */
export function planWars(root: string, rec: WarsGenRecord | null): { run: boolean; reason: string } {
  try {
    const head = resolveBase(root, 'HEAD');
    let why: string;
    if (rec && typeof rec.head === 'string' && rec.geo && typeof rec.inputs === 'string') {
      if (isAncestor(root, rec.head, head)) {
        const basis = `마지막 gen:wars 성공(${rec.head.slice(0, 7)} 위, ${rec.at.slice(0, 16).replace('T', ' ')} UTC)`;
        if (warsInputsHash(root) !== rec.inputs) return { run: true, reason: `전쟁 생성 입력(data/wars·data/base/fragments·scripts/wars 등)이 바뀜 (기준: ${basis})` };
        return judgeVersions(root, snapshotChanges(rec.geo, geoSnapshot(root, rec.geo)), basis);
      }
      why = `gen:wars 성공 기록의 커밋 ${rec.head.slice(0, 7)}이 HEAD의 조상이 아님`;
    } else why = 'gen:wars 성공 기록 없음';
    const up = spawnSync('git', ['rev-parse', '--verify', '--quiet', '@{upstream}^{commit}'], { cwd: root, encoding: 'utf8' });
    if (up.status !== 0 || !up.stdout.trim()) return { run: true, reason: `${why}, upstream도 없어 돌림` };
    const base = up.stdout.trim();
    const basis = `${why} → upstream ${base.slice(0, 7)}`;
    const paths = changedPaths(root, base);
    const input = paths.find((p) => WARS_INPUT_DIRS.some((d) => p.startsWith(d)) || WARS_INPUT_FILES.includes(p) || (p.startsWith('data/geo/') && !p.endsWith('.geojson')));
    if (input) return { run: true, reason: `전쟁 생성 입력 ${input}이 바뀜 (기준: ${basis})` };
    return judgeVersions(root, geoVersionChanges(root, base, paths.filter((p) => isGeojson(p, true))), basis);
  } catch (e) {
    return { run: true, reason: `바뀐 것을 판단하지 못해 돌림: ${(e as Error).message.split('\n')[0]}` };
  }
}
