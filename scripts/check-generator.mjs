// 국경 생성기 구조·안전장치 검사 (DESIGN.md §5.2). 사용: npm run check:generator [-- 프로젝트 폴더]
// [1] 구조: polyclip-ts는 lib에서만, scripts/geo는 명령줄 인자를 모름, import 층 규칙, 권역 등록, data/geo 평면 폴더.
// [2] 안전장치: 잘못된 권역 구성·옵션·인자 오타에서 생성기가 data/geo를 지우기 전에(엉뚱한 폴더에 쓰지 않고) 멈추는지, --prune과 권역 출처(source)가 약속대로 도는지.
// 프로젝트의 data/geo는 건드리지 않는다. data/geo를 임시 폴더에 복사해 그곳에서 시험하고, 끝나면 임시 폴더를 지운다.
// 생성기(scripts/generate-geo.mjs, scripts/geo/)를 고친 뒤와 권역을 더한 뒤에 돌린다. data/geo가 생성기 결과와 맞아야 한다(먼저 npm run gen:geo).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const GEO_SRC = path.join(SCRIPTS, 'geo');
const AREA_DIR = path.join(GEO_SRC, 'areas');
const ENTRY = path.join(SCRIPTS, 'generate-geo.mjs');
// 인자는 생성기와 같은 규칙으로 본다: '-'로 시작하는 인자는 받지 않고, 폴더는 하나만, package.json·data/entities가 있어야 프로젝트 폴더다
const cliArgs = process.argv.slice(2);
if (cliArgs.length > 1 || cliArgs.some((a) => a.startsWith('-'))) {
  console.error(`사용: npm run check:generator [-- 프로젝트 폴더] (받은 인자: ${cliArgs.join(' ')})`);
  process.exit(2);
}
const PROJECT = path.resolve(cliArgs[0] ?? path.join(SCRIPTS, '..'));
const PROJECT_GEO = path.join(PROJECT, 'data/geo');
const notProject = ['package.json', 'data/entities', 'data/geo'].filter((f) => !existsSync(path.join(PROJECT, f)));
if (notProject.length) {
  console.error(`프로젝트 폴더가 아님: ${PROJECT} (${notProject.join('·')} 없음)`);
  process.exit(2);
}

let failed = 0;
const ok = (msg) => console.log(`  통과  ${msg}`);
const bad = (msg) => { console.log(`  실패  ${msg}`); failed++; };
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const short = (s) => (s.length > 150 ? s.slice(0, 150) + '…' : s);

// ── [1] 구조 ─────────────────────────────────────────────
console.log('[1] 구조');
const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.mjs')) files.push({ rel: path.relative(GEO_SRC, p).replaceAll('\\', '/'), text: readFileSync(p, 'utf8') });
  }
};
walk(GEO_SRC);

// 권역 목록은 진입 파일의 AREAS에서 읽는다 (순서가 곧 층 순서: 앞 권역만 import할 수 있다)
const entryText = readFileSync(ENTRY, 'utf8');
const areasBlock = entryText.match(/^const AREAS = \[([\s\S]*?)^\];/m);
const AREAS = areasBlock ? [...areasBlock[1].matchAll(/\['([a-z0-9-]+)',\s*(\w+)\]/g)].map((m) => ({ name: m[1], ns: m[2] })) : [];
if (!AREAS.length) bad('generate-geo.mjs에서 AREAS 목록을 읽지 못함');
const order = new Map(AREAS.map((a, i) => [a.name, i]));
for (const { name, ns } of AREAS) {
  if (!entryText.includes(`import * as ${ns} from './geo/areas/${name}.mjs';`)) bad(`AREAS의 ${name}: generate-geo.mjs에 import * as ${ns} from './geo/areas/${name}.mjs'가 없음`);
}
const areaEntries = readdirSync(AREA_DIR, { withFileTypes: true });
const areaFiles = areaEntries.filter((e) => e.isFile() && e.name.endsWith('.mjs')).map((e) => e.name.slice(0, -4));
const unlisted = areaFiles.filter((n) => !order.has(n));
const missing = AREAS.filter((a) => !areaFiles.includes(a.name)).map((a) => a.name);
const strayDirs = areaEntries.filter((e) => e.isDirectory() && !order.has(e.name)).map((e) => e.name);
if (unlisted.length || missing.length || strayDirs.length) bad(`권역 등록: AREAS에 없는 파일 [${unlisted}], 파일이 없는 AREAS [${missing}], 권역 이름이 아닌 하위 폴더 [${strayDirs}]`);
else ok(`권역 ${AREAS.length}개가 AREAS 순서대로 등록됨 (${AREAS.map((a) => a.name).join(', ')})`);

// import 층 규칙. lib < shared < 권역(AREAS 순서) 이고 engine은 lib만 쓴다. areas/<권역>/ 아래 도우미 모듈은 그 권역 파일과 같은 규칙을 따른다
const importsOf = (text) => [...text.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*'([^']+)'|^\s*import\s*'([^']+)'/gm)].map((m) => m[1] ?? m[2]);
function layerProblems(rel, text) {
  const out = [];
  const area = rel.match(/^areas\/([a-z0-9-]+)(?:\.mjs|\/[^/]+\.mjs)$/)?.[1];
  const known = ['lib.mjs', 'shared.mjs', 'engine.mjs'].includes(rel) || (area && order.has(area));
  if (!known) return [`${rel}: 층이 정해지지 않은 파일 (DESIGN.md §5.2의 층 규칙에 넣고 이 검사에 더한다)`];
  for (const spec of importsOf(text)) {
    if (spec.startsWith('node:')) {
      if (rel !== 'lib.mjs' && rel !== 'engine.mjs') out.push(`${rel}: node 내장 모듈 '${spec}'은 lib·engine에서만 쓴다`);
      continue;
    }
    if (!spec.startsWith('.')) { out.push(`${rel}: 패키지 '${spec}'를 직접 가져옴 (polyclip은 lib에서 가져온다)`); continue; }
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
    let allowed;
    if (rel === 'lib.mjs') allowed = false;
    else if (rel === 'shared.mjs' || rel === 'engine.mjs') allowed = target === 'lib.mjs';
    else {
      const t = target.match(/^areas\/([a-z0-9-]+)(\.mjs|\/[^/]+\.mjs)$/);
      allowed = target === 'lib.mjs' || target === 'shared.mjs'
        || (t && t[2] === '.mjs' && order.has(t[1]) && order.get(t[1]) < order.get(area))
        || (t && t[2] !== '.mjs' && t[1] === area && target !== rel);
    }
    if (!allowed) out.push(`${rel}: '${spec}'를 가져옴 (층 규칙 위반: 아래층만 가져온다)`);
  }
  if (rel !== 'lib.mjs' && /\bimport\s*\(/.test(text)) out.push(`${rel}: 동적 import는 lib에서만 쓴다`);
  return out;
}
const layerErrors = files.flatMap((f) => layerProblems(f.rel, f.text));
if (layerErrors.length) layerErrors.forEach((e) => bad(e));
else ok(`import 층 규칙 (lib < shared < ${AREAS.map((a) => a.name).join(' < ')}, engine은 lib만): 파일 ${files.length}개`);
// 검사기 자체 시험: 첫 권역이 마지막 권역을 가져오게 바꾸면 잡아야 한다
if (AREAS.length >= 2) {
  const first = AREAS[0].name;
  const probe = layerProblems(`areas/${first}.mjs`, `import { X } from './${AREAS.at(-1).name}.mjs';\n`);
  if (probe.length) ok(`층 위반을 잡음 (시험: ${first}가 ${AREAS.at(-1).name}를 가져오면 → ${short(probe[0])})`);
  else bad('층 위반 시험: 첫 권역이 마지막 권역을 가져와도 잡지 못함');
}
const polyclipUsers = files.filter((f) => f.text.includes('polyclip-ts')).map((f) => f.rel);
if (polyclipUsers.join() === 'lib.mjs') ok('polyclip-ts를 불러오는 곳은 lib.mjs 하나');
else bad(`polyclip-ts를 불러오는 곳: [${polyclipUsers}] (lib.mjs 하나여야 함)`);
const argvUsers = files.filter((f) => /\bprocess\.|\bargv\b/.test(f.text)).map((f) => f.rel);
if (!argvUsers.length) ok('scripts/geo는 process·argv를 쓰지 않음 (다른 스크립트가 권역 파일을 가져와도 됨)');
else bad(`process·argv를 쓰는 파일: [${argvUsers}]`);
const helperExports = files.filter((f) => /^areas\/[^/]+\//.test(f.rel)).flatMap((f) => [...f.text.matchAll(/^export\s+(?:const|let|function)\s+(\w+)/gm)].filter((m) => /^(fill|version|source)/i.test(m[1])).map((m) => `${f.rel}의 ${m[1]}`));
if (helperExports.length) bad(`도우미 모듈이 versions·fillSpecs·source 같은 이름을 내보냄 (권역 파일에만 둔다): ${helperExports.join(', ')}`);
const geoDirs = readdirSync(PROJECT_GEO, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
if (!geoDirs.length) ok('data/geo에 하위 폴더 없음 (빌드·검사 스크립트는 평면 폴더만 읽음)');
else bad(`data/geo에 하위 폴더: [${geoDirs}]`);

// ── [2] 안전장치 ─────────────────────────────────────────
console.log('[2] 안전장치 (data/geo를 임시 폴더에 복사해 시험)');
const tmp = mkdtempSync(path.join(tmpdir(), 'check-generator-'));
const tmpGeo = path.join(tmp, 'data/geo');
// 생성기는 package.json·data/entities가 있는 폴더만 프로젝트 폴더로 받으므로 임시 폴더에도 둔다(내용은 쓰지 않는다)
writeFileSync(path.join(tmp, 'package.json'), '{}\n');
mkdirSync(path.join(tmp, 'data/entities'), { recursive: true });
const restore = () => {
  rmSync(tmpGeo, { recursive: true, force: true });
  mkdirSync(tmpGeo, { recursive: true });
  for (const f of readdirSync(PROJECT_GEO)) if (f.endsWith('.geojson')) copyFileSync(path.join(PROJECT_GEO, f), path.join(tmpGeo, f));
};
const snapshot = () => readdirSync(tmpGeo).sort().map((f) => `${f} ${sha(readFileSync(path.join(tmpGeo, f)))}`).join('\n');
// 생성기 로그(채우기 기간 수, 나라별 줄)는 시험 결과를 가리므로 감춘다
const quiet = (fn) => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };
// fn이 needle이 든 오류로 멈추고, 임시 data/geo가 그대로여야 통과
const expectStop = (label, needle, fn) => {
  const before = snapshot();
  let err = null;
  try { quiet(fn); } catch (e) { err = e; }
  const same = snapshot() === before;
  if (!err) bad(`${label}: 멈추지 않음`);
  else if (!String(err.message).includes(needle)) bad(`${label}: 다른 오류로 멈춤: ${short(err.message)}`);
  else if (!same) bad(`${label}: 멈췄지만 data/geo가 바뀜`);
  else ok(`${label} → ${short(err.message)}`);
  if (!same) restore();
};
// 현재 폴더를 임시 폴더로 두고 실행한다. 상대 경로 인자를 잘못 받아도 임시 폴더 안에만 쓰게 된다
const runEntry = (...args) => spawnSync(process.execPath, [ENTRY, ...args], { encoding: 'utf8', cwd: tmp });
const firstLine = (s) => s.split('\n').find((l) => /^\w*Error: /.test(l)) ?? s.trim().split('\n')[0] ?? '';

try {
  restore();
  const engine = await import(pathToFileURL(path.join(GEO_SRC, 'engine.mjs')).href);
  const areas = [];
  for (const { name } of AREAS) areas.push([name, await import(pathToFileURL(path.join(AREA_DIR, `${name}.mjs`)).href)]);
  const merged = engine.mergeAreas(areas, AREA_DIR);
  ok(`실제 권역 합치기: 나라 ${Object.keys(merged.versions).length}개, 채우기 spec ${merged.fillSpecs.length}개`);

  const [lastName, lastArea] = areas.at(-1);
  const filling = areas.find(([, a]) => a.fillSpecs?.length);
  const owned = new Set(areas.flatMap(([, a]) => Object.keys(a.versions)));
  const fillOnly = filling?.[1].fillSpecs.map((s) => s.id).find((id) => !owned.has(id));
  const zone = filling?.[1].fillSpecs[0].zone;
  const swap = (name, area) => areas.map(([n, a]) => [n, n === name ? area : a]);
  const without = (obj, key) => { const o = { ...obj }; delete o[key]; return o; };

  expectStop(`AREAS에서 ${lastName}를 빠뜨림(파일은 남음)`, 'AREAS 목록에 없음', () => engine.mergeAreas(areas.slice(0, -1), AREA_DIR));
  // 권역 파일째 없어지면 이름 검사로는 못 잡고, 지우기 전 대조가 잡는다
  const lastIds = [...Object.keys(lastArea.versions), ...(lastArea.fillSpecs ?? []).map((s) => s.id).filter((id) => !owned.has(id))];
  const lastFiles = lastIds.map((id) => `${id}.geojson`).filter((f) => readdirSync(tmpGeo).includes(f));
  if (!lastFiles.length) bad(`${lastName} 권역의 geojson이 data/geo에 없어 '권역 파일째 없어짐' 시험을 못 함 (먼저 npm run gen:geo)`);
  else expectStop(`${lastName} 권역 파일째 없어짐`, `사라질 파일 ${lastFiles.length}개`, () => {
    const m = engine.mergeAreas(areas.slice(0, -1));
    engine.fillEmptyLand(m.versions, m.fillSpecs);
    engine.writeGeo(tmp, m.versions, { sources: m.sources });
  });
  expectStop('채우기 specs를 잘못 모음(쌍을 풀지 않은 flatMap)', 'specs가 0개', () => engine.fillEmptyLand(engine.mergeAreas(areas, AREA_DIR).versions, areas.flatMap((r) => r.fillSpecs ?? [])));
  if (filling) {
    expectStop('fillSpecs 이름 오타(fillSpec)', "'fillSpec'", () => engine.mergeAreas(swap(filling[0], { ...without(filling[1], 'fillSpecs'), fillSpec: filling[1].fillSpecs })));
    const foreign = areas.find(([n]) => n !== filling[0]);
    const foreignId = Object.keys(foreign[1].versions)[0];
    expectStop(`다른 권역(${foreign[0]}) 나라 '${foreignId}'를 채우는 spec`, `${foreign[0]} 권역의 나라임`, () => engine.mergeAreas(swap(filling[0], { ...filling[1], fillSpecs: [...filling[1].fillSpecs, { id: foreignId, zone, from: 100, to: 200 }] })));
    if (fillOnly) expectStop(`같은 채우기 id '${fillOnly}'를 두 권역이 채움`, '두 권역이 채움', () => engine.mergeAreas([...areas, ['check-fill', { versions: {}, fillSpecs: [{ id: fillOnly, zone, from: 100, to: 200 }] }]]));
    expectStop('채우기 spec 모양(to가 null)', 'from < to ≤ 3000', () => engine.mergeAreas(swap(filling[0], { ...filling[1], fillSpecs: [...filling[1].fillSpecs, { id: 'check-spec', zone, from: 100, to: null }] })));
  } else bad('fillSpecs를 내보내는 권역이 없어 채우기 시험을 못 함');
  expectStop('versions 이름 오타(version)', 'versions를 내보내지 않음', () => engine.mergeAreas(swap(lastName, { ...without(lastArea, 'versions'), version: lastArea.versions })));
  const dupId = Object.keys(areas[0][1].versions)[0];
  expectStop(`같은 나라 id '${dupId}'가 두 권역에`, '두 곳에 있음', () => engine.mergeAreas([...areas, ['check-dup', { versions: { [dupId]: [] } }]]));
  expectStop('source 이름 오타(sources)', "'sources'", () => engine.mergeAreas(swap(lastName, { ...lastArea, sources: '시험' })));
  expectStop('source가 빈 문자열', '비어 있지 않은 문자열', () => engine.mergeAreas(swap(lastName, { ...lastArea, source: ' ' })));

  // areas/ 하위 폴더: 등록된 권역 이름이면 허용(그 권역의 도우미 모듈), 아니면 멈춤
  const fakeDir = path.join(tmp, 'areas');
  mkdirSync(fakeDir);
  for (const { name } of AREAS) writeFileSync(path.join(fakeDir, `${name}.mjs`), '');
  mkdirSync(path.join(fakeDir, AREAS[0].name));
  try { engine.mergeAreas(areas, fakeDir); ok(`areas/${AREAS[0].name}/ 하위 폴더(권역 이름)는 허용`); } catch (e) { bad(`권역 이름 하위 폴더를 막음: ${short(e.message)}`); }
  mkdirSync(path.join(fakeDir, 'check-stray'));
  expectStop('areas/에 권역 이름이 아닌 하위 폴더', '하위 폴더 check-stray/', () => engine.mergeAreas(areas, fakeDir));

  // 권역 출처: source를 내보낸 권역의 나라와 그 권역이 채우기로 새로 만드는 나라만 그 문구, 나머지는 기본 문구
  const sq = (x) => [[[[x, 0], [x + 1, 0], [x + 1, 1], [x, 0]]]];
  const s = engine.mergeAreas([['check-a', { versions: { 'check-a1': [[1900, null, sq(0)]] }, fillSpecs: [{ id: 'check-a2', zone: sq(2), from: 1900, to: 3000 }], source: '시험 출처' }], ['check-b', { versions: { 'check-b1': [[1900, null, sq(5)]] } }]]);
  const srcProject = path.join(tmp, 'source-test');
  quiet(() => engine.writeGeo(srcProject, { 'check-a1': [[1900, null, sq(0)]], 'check-b1': [[1900, null, sq(5)]] }, { sources: s.sources }));
  const srcOf = (id) => JSON.parse(readFileSync(path.join(srcProject, 'data/geo', `${id}.geojson`), 'utf8')).features[0].properties.source;
  const sourceOk = s.sources['check-a1'] === '시험 출처' && s.sources['check-a2'] === '시험 출처' && !Object.hasOwn(s.sources, 'check-b1')
    && srcOf('check-a1') === '시험 출처' && typeof srcOf('check-b1') === 'string' && srcOf('check-b1') !== '시험 출처' && srcOf('check-b1').length > 0;
  if (sourceOk) ok(`권역 출처: source를 준 권역의 나라·채우기 나라는 그 문구, 안 준 권역은 기본 문구(${short(srcOf('check-b1')).slice(0, 30)}…)`);
  else bad(`권역 출처가 약속과 다름: ${JSON.stringify(s.sources)} / 쓴 값 ${srcOf('check-a1')} | ${srcOf('check-b1')}`);

  // 진입 파일: 모르는 옵션, 인자 오타, 지우기 전 대조, --prune
  {
    const before = snapshot();
    const r = runEntry(tmp, '--purne');
    if (r.status !== 0 && r.stderr.includes('모르는 옵션') && snapshot() === before) ok(`모르는 옵션(--purne) → ${short(firstLine(r.stderr).trim())}`);
    else { bad(`모르는 옵션: rc=${r.status} ${short(firstLine(r.stderr))}`); restore(); }
  }
  // 한 줄표(-prune)와 줄표 없는 prune(npm run gen:geo prune과 같음)은 폴더로 읽혀 새 폴더에 geojson을 쓰면 안 되고, 멈춰야 한다
  for (const [arg, needle] of [['-prune', '모르는 옵션: -prune'], ['prune', '프로젝트 폴더가 아님']]) {
    const before = snapshot();
    const r = runEntry(arg);
    const made = existsSync(path.join(tmp, arg));
    if (r.status !== 0 && r.stderr.includes(needle) && !made && snapshot() === before) ok(`인자 오타(${arg}) → ${short(firstLine(r.stderr).trim())}`);
    else { bad(`인자 오타(${arg}): rc=${r.status}${made ? `, ${arg}/ 폴더를 만듦` : ''} ${short(firstLine(r.stderr))}`); restore(); }
    rmSync(path.join(tmp, arg), { recursive: true, force: true });
  }
  {
    const stray = 'check-generator-stray.geojson';
    writeFileSync(path.join(tmpGeo, stray), '{}\n');
    const before = snapshot();
    const r1 = runEntry(tmp);
    if (r1.status !== 0 && r1.stderr.includes(`사라질 파일 1개: ${stray}`) && snapshot() === before) ok(`생성기 밖 파일이 있으면 지우기 전에 멈춤 → ${short(firstLine(r1.stderr).trim())}`);
    else bad(`지우기 전 대조: rc=${r1.status} ${short(firstLine(r1.stderr))}`);
    const r2 = runEntry(tmp, '--prune');
    const now = readdirSync(tmpGeo).sort();
    const want = readdirSync(PROJECT_GEO).filter((f) => f.endsWith('.geojson')).sort();
    if (r2.status !== 0) bad(`--prune 실행 실패: rc=${r2.status} ${short(firstLine(r2.stderr))}`);
    else if (now.includes(stray)) bad('--prune인데 생성기 밖 파일이 남음');
    else if (now.join() !== want.join()) bad(`--prune 뒤 파일 목록이 data/geo와 다름 (먼저 npm run gen:geo): 더 있음 [${now.filter((f) => !want.includes(f))}], 없음 [${want.filter((f) => !now.includes(f))}]`);
    else {
      ok(`--prune → 생성기 밖 파일만 지우고 ${now.length}개를 씀`);
      const diff = now.filter((f) => !readFileSync(path.join(tmpGeo, f)).equals(readFileSync(path.join(PROJECT_GEO, f))));
      console.log(diff.length ? `  참고  생성기 결과가 data/geo와 다른 파일 ${diff.length}개 (영토를 고친 뒤 gen:geo를 아직 돌리지 않았으면 정상): ${short(diff.join(', '))}` : `  참고  생성기 결과가 data/geo ${now.length}개와 바이트 단위로 같음`);
    }
  }
} catch (e) {
  bad(`시험 도중 오류: ${e.stack ?? e}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(failed ? `=== 실패 ${failed}개 ===` : '=== 전체 통과 ===');
process.exit(failed ? 1 : 0);
