// 국경 생성기 구조·안전장치 검사 (DESIGN.md §5.2). 사용: npm run check:generator [-- 프로젝트 폴더]
// [1] 구조: polyclip-ts는 lib에서만, scripts/geo는 명령줄 인자를 모름, import 층 규칙, 권역 등록(area-list.mjs), data/geo 평면 폴더,
//     타입 선언(.d.mts)과 export가 맞음, 빈 땅 검사(check-gaps.ts)가 좌표를 복사하지 않고 권역 파일의 gapZones를 씀,
//     scripts/geo의 파일끼리 같은 좌표를 이름 없이 되풀이하지 않음('값만 같은 점' 허용 목록 ALLOWED_REPEATS만).
// [2] 안전장치: 잘못된 권역 구성·옵션·인자 오타에서 생성기가 data/geo를 지우기 전에(엉뚱한 폴더에 쓰지 않고) 멈추는지, --prune과 권역 출처(source)가 약속대로 도는지,
//     빈 땅 검사 구역(gapZones)이 AREAS 순서대로 모이고 새 권역의 구역도 저절로 들어가는지, 구역 모양이 틀리면 멈추는지.
// 프로젝트의 data/geo는 건드리지 않는다. data/geo를 임시 폴더에 복사해 그곳에서 시험하고, 끝나면 임시 폴더를 지운다.
// 생성기(scripts/generate-geo.mjs, scripts/geo/)를 고친 뒤와 권역을 더한 뒤에 돌린다. data/geo가 생성기 결과와 맞아야 한다(먼저 npm run gen:geo).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const GEO_SRC = path.join(SCRIPTS, 'geo');
const AREA_DIR = path.join(GEO_SRC, 'areas');
const ENTRY = path.join(SCRIPTS, 'generate-geo.mjs');
const LIST = path.join(GEO_SRC, 'area-list.mjs');
const GAPS = path.join(SCRIPTS, 'check-gaps.ts');
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

// 권역 목록은 scripts/geo/area-list.mjs의 AREAS에서 읽는다 (순서가 곧 층 순서: 앞 권역만 import할 수 있다). 생성기와 빈 땅 검사는 이 목록을 가져다 쓴다
const listText = readFileSync(LIST, 'utf8');
const areasBlock = listText.match(/^export const AREAS = \[([\s\S]*?)^\];/m);
const AREAS = areasBlock ? [...areasBlock[1].matchAll(/\['([a-z0-9-]+)',\s*(\w+)\]/g)].map((m) => ({ name: m[1], ns: m[2] })) : [];
if (!AREAS.length) bad('area-list.mjs에서 AREAS 목록을 읽지 못함');
const order = new Map(AREAS.map((a, i) => [a.name, i]));
for (const { name, ns } of AREAS) {
  if (!listText.includes(`import * as ${ns} from './areas/${name}.mjs';`)) bad(`AREAS의 ${name}: area-list.mjs에 import * as ${ns} from './areas/${name}.mjs'가 없음`);
}
const entryText = readFileSync(ENTRY, 'utf8');
if (entryText.includes("import { AREAS } from './geo/area-list.mjs';") && !entryText.includes("'./geo/areas/")) ok('진입 파일(generate-geo.mjs)은 권역 목록을 area-list.mjs에서 가져옴 (권역 파일을 직접 가져오지 않음)');
else bad("generate-geo.mjs: 권역 목록은 import { AREAS } from './geo/area-list.mjs'로 가져오고 권역 파일을 직접 가져오지 않는다");
const areaEntries = readdirSync(AREA_DIR, { withFileTypes: true });
const areaFiles = areaEntries.filter((e) => e.isFile() && e.name.endsWith('.mjs')).map((e) => e.name.slice(0, -4));
const unlisted = areaFiles.filter((n) => !order.has(n));
const missing = AREAS.filter((a) => !areaFiles.includes(a.name)).map((a) => a.name);
const strayDirs = areaEntries.filter((e) => e.isDirectory() && !order.has(e.name)).map((e) => e.name);
if (unlisted.length || missing.length || strayDirs.length) bad(`권역 등록: AREAS에 없는 파일 [${unlisted}], 파일이 없는 AREAS [${missing}], 권역 이름이 아닌 하위 폴더 [${strayDirs}]`);
else ok(`권역 ${AREAS.length}개가 AREAS 순서대로 등록됨 (${AREAS.map((a) => a.name).join(', ')})`);

// import 층 규칙. lib < shared < 권역(AREAS 순서) < area-list 이고 engine은 lib만 쓴다. areas/<권역>/ 아래 도우미 모듈은 그 권역 파일과 같은 규칙을 따른다.
// area-list는 등록된 권역 파일만 가져오고, scripts/geo의 다른 파일은 area-list를 가져오지 않는다(권역 파일이 가져오면 순환)
const importsOf = (text) => [...text.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*'([^']+)'|^\s*import\s*'([^']+)'/gm)].map((m) => m[1] ?? m[2]);
function layerProblems(rel, text) {
  const out = [];
  const area = rel.match(/^areas\/([a-z0-9-]+)(?:\.mjs|\/[^/]+\.mjs)$/)?.[1];
  const known = ['lib.mjs', 'shared.mjs', 'engine.mjs', 'area-list.mjs'].includes(rel) || (area && order.has(area));
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
    else if (rel === 'area-list.mjs') allowed = order.has(target.match(/^areas\/([a-z0-9-]+)\.mjs$/)?.[1]);
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
else ok(`import 층 규칙 (lib < shared < ${AREAS.map((a) => a.name).join(' < ')} < area-list, engine은 lib만): 파일 ${files.length}개`);
// 검사기 자체 시험: 첫 권역이 마지막 권역이나 권역 목록(area-list)을 가져오게 바꾸면 잡아야 한다
if (AREAS.length >= 2) {
  const first = AREAS[0].name;
  const probe = layerProblems(`areas/${first}.mjs`, `import { X } from './${AREAS.at(-1).name}.mjs';\n`);
  if (probe.length) ok(`층 위반을 잡음 (시험: ${first}가 ${AREAS.at(-1).name}를 가져오면 → ${short(probe[0])})`);
  else bad('층 위반 시험: 첫 권역이 마지막 권역을 가져와도 잡지 못함');
}
if (AREAS.length) {
  const probe = layerProblems(`areas/${AREAS[0].name}.mjs`, "import { AREAS } from '../area-list.mjs';\n");
  if (probe.length) ok(`권역 파일이 권역 목록을 가져오면 잡음 (시험 → ${short(probe[0])})`);
  else bad('층 위반 시험: 권역 파일이 area-list.mjs를 가져와도 잡지 못함');
}
const polyclipUsers = files.filter((f) => f.text.includes('polyclip-ts')).map((f) => f.rel);
if (polyclipUsers.join() === 'lib.mjs') ok('polyclip-ts를 불러오는 곳은 lib.mjs 하나');
else bad(`polyclip-ts를 불러오는 곳: [${polyclipUsers}] (lib.mjs 하나여야 함)`);
const argvUsers = files.filter((f) => /\bprocess\.|\bargv\b/.test(f.text)).map((f) => f.rel);
if (!argvUsers.length) ok('scripts/geo는 process·argv를 쓰지 않음 (다른 스크립트가 권역 파일을 가져와도 됨)');
else bad(`process·argv를 쓰는 파일: [${argvUsers}]`);
const helperExports = files.filter((f) => /^areas\/[^/]+\//.test(f.rel)).flatMap((f) => [...f.text.matchAll(/^export\s+(?:const|let|function)\s+(\w+)/gm)].filter((m) => /^(fill|version|source|gap)/i.test(m[1])).map((m) => `${f.rel}의 ${m[1]}`));
if (helperExports.length) bad(`도우미 모듈이 versions·fillSpecs·source·gapZones 같은 이름을 내보냄 (권역 파일에만 둔다): ${helperExports.join(', ')}`);
// 타입 선언(.d.mts): .ts 스크립트가 .mjs를 가져올 때 tsc가 쓴다. 선언한 이름이 짝 .mjs의 export에 있어야 한다(없으면 tsc는 통과해도 실행할 때 멈춘다)
const decls = readdirSync(GEO_SRC).filter((f) => f.endsWith('.d.mts')).map((d) => {
  const mjs = d.slice(0, -'.d.mts'.length) + '.mjs';
  const names = [...readFileSync(path.join(GEO_SRC, d), 'utf8').matchAll(/^export\s+declare\s+(?:const|let|function)\s+(\w+)/gm)].map((m) => m[1]);
  const src = files.find((f) => f.rel === mjs);
  const problems = !src ? [`짝 파일 ${mjs}가 없음`] : !names.length ? ['선언한 export가 없음'] : names.filter((n) => !new RegExp(`^export\\s+(?:const|let|function)\\s+${n}\\b`, 'm').test(src.text)).map((n) => `${n}을(를) ${mjs}가 내보내지 않음`);
  return { d, names, problems };
});
const declProblems = decls.flatMap(({ d, problems }) => problems.map((p) => `${d}: ${p}`));
if (declProblems.length) declProblems.forEach((e) => bad(`타입 선언: ${e}`));
else ok(`타입 선언 ${decls.length}개가 .mjs의 export와 맞음 (${decls.map(({ d, names }) => `${d}: ${names.join('·')}`).join(', ')})`);
// 빈 땅 검사(check-gaps.ts)는 검사 구역을 권역 파일의 gapZones에서 모은다: 좌표를 복사해 두지 않고 권역 목록(AREAS)과 collectGapZones를 쓴다
const gapsText = readFileSync(GAPS, 'utf8');
const copiedPoints = [...gapsText.matchAll(/\[\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\]/g)].map((m) => m[0]);
const gapsUsesList = gapsText.includes("import { AREAS } from './geo/area-list.mjs';") && /\bcollectGapZones\(AREAS\)/.test(gapsText);
if (gapsUsesList && !copiedPoints.length) ok('check-gaps.ts는 권역 목록(AREAS)의 gapZones를 collectGapZones로 모아 검사함 (좌표 복사 없음)');
else bad(`check-gaps.ts: ${gapsUsesList ? '' : 'area-list.mjs의 AREAS와 collectGapZones(AREAS)를 쓰지 않음. '}${copiedPoints.length ? `좌표 리터럴 ${copiedPoints.length}개(${copiedPoints.slice(0, 3).join(' ')}…): 검사 구역은 권역 파일의 gapZones에 둔다` : ''}`);

// 파일 사이 좌표 되풀이 (DESIGN.md §5.2 '파일 사이에서 맞물리는 점'): scripts/geo의 .mjs에서 [수, 수] 좌표 리터럴을 최상위 이름별로 모아,
// 서로 다른 파일의 최상위 이름이 같은 좌표를 되풀이하는 묶음을 찾는다. 맞물리는 점은 좌표를 베끼지 않고 아래층 파일의 이름을 가져다 쓴다.
// 되풀이해도 되는 것은 아래 허용 목록뿐이다. 목록 밖 묶음(새 권역이 다른 파일 좌표를 베낌, 목록의 점을 다른 이름이 또 씀)은 실패이고,
// 목록에 있는데 사라진 묶음도 실패로 알린다(목록과 DESIGN.md §5.2에서 지운다). 주석 안의 좌표는 세지 않는다.
// - '값만 같은 점': 값만 같고 맞물리지 않은 점(바다 쪽 점, 결과에 드러나지 않는 자르기 상자 모서리). 따로 옮겨도 틈·겹침이 생기지 않는다
// - '값으로 맞춘 점': 맞물리지만 이름으로 바꾸면 data/geo 바이트가 달라져 값으로 둔 점(지금은 없다). 함께 옮긴다
// 새로 더할 때는 양쪽 이름 위에 같은 종류의 주석을 달고 DESIGN.md §5.2 목록에도 적는다. 이름은 'scripts/geo 기준 파일 경로:최상위 이름'이다
const ALLOWED_REPEATS = [
  { kind: '값만 같은 점', points: [[135, 43.3], [132.5, 42.4]], names: ['areas/korea.mjs:MARITIME_SEA_719', 'areas/korea.mjs:MARITIME_SEA_818', 'areas/west.mjs:RUSSIA_RAW'], why: '발해의 연해주 앞바다, 바다 쪽 점' },
  { kind: '값만 같은 점', points: [[123, 39]], names: ['shared.mjs:LIAODONG_SEA', 'areas/korea.mjs:GOJOSEON_EARLY', 'areas/china.mjs:YAN_CHINA'], why: '요동 앞바다, 바다 쪽 점' },
  { kind: '값만 같은 점', points: [[125, 41.2]], names: ['shared.mjs:HUABEI_BOX', 'areas/inner-asia.mjs:MAN_WEST'], why: '결과에 드러나지 않는 자르기 상자 모서리' },
  { kind: '값만 같은 점', points: [[120, 44]], names: ['areas/inner-asia.mjs:EASTERN_TURKS', 'areas/korea.mjs:WEST_OF_BAEKDU'], why: '4군 띠만 자르는 상자 모서리' },
  { kind: '값만 같은 점', points: [[141.5, 48.5]], names: ['shared.mjs:PRIMORYE', 'areas/inner-asia.mjs:NE_FAR'], why: '타타르 해협 바다 쪽 점, 쓰이는 때가 다름' },
];
const pointKey = ([x, y]) => `(${x}, ${y})`;
const numberOf = (n) => (ts.isNumericLiteral(n) ? Number(n.text)
  : ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(n.operand) ? -Number(n.operand.text) : null);
// srcFiles: [{ rel, text }] → { byPoint: 좌표 → Set('파일:이름'), groups: '파일:이름 | …' → [좌표…] (둘 이상의 파일이 쓰는 좌표만) }
function repeatedPoints(srcFiles) {
  const byPoint = new Map();
  for (const { rel, text } of srcFiles) {
    const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const st of sf.statements) {
      const named = ts.isVariableStatement(st) ? st.declarationList.declarations.map((d) => [d.name.getText(sf), d])
        : [[st.name?.getText(sf) ?? `${sf.getLineAndCharacterOfPosition(st.getStart(sf)).line + 1}줄 문장`, st]];
      for (const [name, node] of named) {
        const visit = (n) => {
          if (ts.isArrayLiteralExpression(n) && n.elements.length === 2) {
            const xy = n.elements.map(numberOf);
            if (xy.every((v) => v !== null)) {
              const k = pointKey(xy);
              (byPoint.get(k) ?? byPoint.set(k, new Set()).get(k)).add(`${rel}:${name}`);
              return;
            }
          }
          ts.forEachChild(n, visit);
        };
        visit(node);
      }
    }
  }
  const groups = new Map();
  for (const [k, users] of byPoint) {
    if (new Set([...users].map((u) => u.split(':')[0])).size < 2) continue;
    const key = [...users].sort().join(' | ');
    (groups.get(key) ?? groups.set(key, []).get(key)).push(k);
  }
  return { byPoint, groups };
}
// 허용 목록과 대조: extra = 목록 밖 묶음·좌표, gone = 목록에 있는데 지금 없는 묶음·좌표
function compareRepeats(groups) {
  const allowed = new Map(ALLOWED_REPEATS.map((a) => [[...a.names].sort().join(' | '), a.points.map(pointKey)]));
  const extra = [...groups].map(([key, pts]) => [key, pts.filter((p) => !(allowed.get(key) ?? []).includes(p))]).filter(([, pts]) => pts.length);
  const gone = [...allowed].map(([key, pts]) => [key, pts.filter((p) => !(groups.get(key) ?? []).includes(p))]).filter(([, pts]) => pts.length);
  const fmt = ([key, pts]) => `${key} ${pts.join(' ')}`;
  return { extra: extra.map(fmt), gone: gone.map(fmt) };
}
const repeats = repeatedPoints(files);
const repeatCheck = compareRepeats(repeats.groups);
if (repeatCheck.extra.length) repeatCheck.extra.forEach((e) => bad(`파일 사이 좌표 되풀이 (맞물리는 점이면 아래층 파일에서 이름을 export해 가져다 쓰고, 아니면 '값만 같은 점' 주석을 달아 check-generator.mjs의 ALLOWED_REPEATS와 DESIGN.md §5.2에 더한다): ${short(e)}`));
if (repeatCheck.gone.length) repeatCheck.gone.forEach((e) => bad(`허용 목록(ALLOWED_REPEATS)의 되풀이가 사라짐 (목록과 DESIGN.md §5.2에서 지운다): ${short(e)}`));
if (!repeatCheck.extra.length && !repeatCheck.gone.length) ok(`파일 사이 좌표 되풀이는 허용 목록 ${ALLOWED_REPEATS.length}묶음뿐 (파일 ${files.length}개): ${ALLOWED_REPEATS.map((a) => `${a.names.map((n) => n.split(':')[1]).join('·')} ${a.points.map(pointKey).join('·')}(${a.kind})`).join(', ')}`);
// 검사기 자체 시험: 가짜 권역 파일이 다른 파일의 좌표(목록 밖 한 점, 목록의 한 점)를 베끼면 잡아야 한다
{
  const single = [...repeats.byPoint].find(([, users]) => new Set([...users].map((u) => u.split(':')[0])).size === 1);
  const listed = ALLOWED_REPEATS[0];
  for (const [label, from, pt] of [
    ['목록 밖 점', single && [...single[1]][0], single?.[0]],
    ['허용 목록의 점', listed.names[0], pointKey(listed.points[0])],
  ]) {
    if (!pt) { bad(`좌표 되풀이 시험(${label}): 베낄 좌표를 찾지 못함`); continue; }
    const fake = { rel: 'areas/check-copy.mjs', text: `// 시험: 다른 파일의 좌표를 베낌\nexport const CHECK_COPY = [[${pt.slice(1, -1)}]];\n` };
    const probe = compareRepeats(repeatedPoints([...files, fake]).groups);
    const caught = probe.extra.find((e) => e.includes('areas/check-copy.mjs:CHECK_COPY') && e.includes(pt));
    if (caught) ok(`좌표 되풀이를 잡음 (시험: 가짜 권역 파일이 ${from}의 ${label} ${pt}를 베끼면 → ${short(caught)})`);
    else bad(`좌표 되풀이 시험(${label}): 가짜 권역 파일이 ${from}의 ${pt}를 베껴도 잡지 못함`);
  }
}
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
  // 권역 목록을 실제로 불러와, [1]에서 글로 읽은 이름·순서와 같은지, 항목마다 같은 이름의 권역 파일 모듈인지 본다
  const { AREAS: loaded } = await import(pathToFileURL(LIST).href);
  const areas = [];
  const wrongModule = [];
  for (const [name, mod] of loaded) {
    const file = await import(pathToFileURL(path.join(AREA_DIR, `${name}.mjs`)).href).catch(() => null);
    if (file !== mod) wrongModule.push(name);
    areas.push([name, mod]);
  }
  if (loaded.map(([n]) => n).join() !== AREAS.map((a) => a.name).join() || wrongModule.length) bad(`불러온 AREAS [${loaded.map(([n]) => n)}]가 area-list.mjs의 글 [${AREAS.map((a) => a.name)}]과 다르거나, 이름과 모듈이 어긋남 [${wrongModule}]`);
  else ok(`불러온 권역 목록 ${loaded.length}개가 이름·순서·모듈 모두 맞음`);
  const merged = engine.mergeAreas(areas, AREA_DIR);
  ok(`실제 권역 합치기: 나라 ${Object.keys(merged.versions).length}개, 채우기 spec ${merged.fillSpecs.length}개`);

  const [lastName, lastArea] = areas.at(-1);
  const filling = areas.find(([, a]) => a.fillSpecs?.length);
  const owned = new Set(areas.flatMap(([, a]) => Object.keys(a.versions)));
  const fillOnly = filling?.[1].fillSpecs.map((s) => s.id).find((id) => !owned.has(id));
  const zone = filling?.[1].fillSpecs[0].zone;
  const swap = (name, area) => areas.map(([n, a]) => [n, n === name ? area : a]);
  const without = (obj, key) => { const o = { ...obj }; delete o[key]; return o; };
  const sq = (x) => [[[[x, 0], [x + 1, 0], [x + 1, 1], [x, 0]]]]; // 시험용 작은 멀티폴리곤

  expectStop(`AREAS에서 ${lastName}를 빠뜨림(파일은 남음)`, 'AREAS 목록에 없음', () => engine.mergeAreas(areas.slice(0, -1), AREA_DIR));
  // 권역 파일째 없어지면 이름 검사로는 못 잡고, 지우기 전 대조가 잡는다. data/geo에 geojson이 있는 권역 가운데 마지막 것을 뺀다
  // (나라 없이 gapZones만 내보내는 권역은 만드는 파일이 없어 건너뛴다)
  const filesOf = ([, a]) => [...Object.keys(a.versions), ...(a.fillSpecs ?? []).map((s) => s.id).filter((id) => !owned.has(id))].map((id) => `${id}.geojson`).filter((f) => readdirSync(tmpGeo).includes(f));
  const gone = [...areas].reverse().find((e) => filesOf(e).length);
  if (!gone) bad("data/geo에 권역이 만드는 geojson이 없어 '권역 파일째 없어짐' 시험을 못 함 (먼저 npm run gen:geo)");
  else expectStop(`${gone[0]} 권역 파일째 없어짐`, `사라질 파일 ${filesOf(gone).length}개`, () => {
    const m = engine.mergeAreas(areas.filter((e) => e !== gone));
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

  // 빈 땅 검사 구역(gapZones): 권역 목록 순서대로 모여 check:gaps의 구역 이름·순서가 되고, 새 권역은 AREAS에 등록하고 gapZones만 내보내면 끝에 붙는다.
  // 모양이 틀리면 생성기가 data/geo를 지우기 전에 멈춘다(mergeAreas가 collectGapZones로 검사)
  const zones = engine.collectGapZones(areas);
  if (zones.length) ok(`빈 땅 검사 구역 ${zones.length}개 (AREAS 순서 = check:gaps 출력 순서): ${zones.map((z) => `${z.name}←${z.area}${z.minus.length ? `(${z.minus.join('·')} 뺌)` : ''}`).join(', ')}`);
  else bad('빈 땅 검사 구역이 0개 (권역 파일의 gapZones가 모이지 않음)');
  const newZone = { name: 'check-새 구역', zone: sq(0), minus: zones.length ? [zones[0].name] : [] };
  const withNew = engine.collectGapZones([...areas, ['check-new', { versions: {}, gapZones: [newZone] }]]);
  const lastZone = withNew.at(-1);
  if (withNew.length === zones.length + 1 && lastZone.area === 'check-new' && lastZone.name === newZone.name && lastZone.minus.join() === newZone.minus.join()) ok(`새 권역은 AREAS에 등록하고 gapZones만 내보내면 check-gaps.ts를 고치지 않아도 끝에 모임 (시험 권역 check-new → ${withNew.length}번째 구역)`);
  else bad(`새 권역의 gapZones가 끝에 모이지 않음: ${JSON.stringify(withNew.map((z) => `${z.name}←${z.area}`))}`);
  const zoneOwner = areas.find(([, a]) => a.gapZones?.length);
  if (zoneOwner) {
    const [zoneArea, zoneMod] = zoneOwner;
    expectStop('gapZones 이름 오타(gapZone)', "'gapZone'", () => engine.mergeAreas(swap(zoneArea, { ...without(zoneMod, 'gapZones'), gapZone: zoneMod.gapZones })));
    expectStop('gapZones 이름 오타를 검사 구역 모으기(check:gaps)도 잡음', "'gapZone'", () => engine.collectGapZones(swap(zoneArea, { ...without(zoneMod, 'gapZones'), gapZone: zoneMod.gapZones })));
    expectStop('gapZones가 배열이 아님', 'gapZones가 배열이 아님', () => engine.mergeAreas(swap(zoneArea, { ...zoneMod, gapZones: zoneMod.gapZones[0] })));
  } else bad('gapZones를 내보내는 권역이 없어 검사 구역 시험을 못 함');
  const withZone = (gz) => engine.mergeAreas([...areas, ['check-zone', { versions: {}, gapZones: [gz] }]]);
  if (zones.length) expectStop(`검사 구역 이름이 겹침('${zones[0].name}')`, '같은 이름이', () => withZone({ name: zones[0].name, zone: sq(0) }));
  expectStop('검사 구역 zone에 링을 그대로 줌(P를 빠뜨림)', '멀티폴리곤이어야 함', () => withZone({ name: 'check-링', zone: sq(0)[0][0] }));
  expectStop('검사 구역 minus가 앞에 없는 구역', 'minus는 앞에 모은', () => withZone({ name: 'check-뒤', zone: sq(0), minus: ['check-없는 구역'] }));
  expectStop('검사 구역 속성 오타(minsu)', '모르는 속성 minsu', () => withZone({ name: 'check-오타', zone: sq(0), minsu: [] }));

  // areas/ 하위 폴더: 등록된 권역 이름이면 허용(그 권역의 도우미 모듈), 아니면 멈춤
  const fakeDir = path.join(tmp, 'areas');
  mkdirSync(fakeDir);
  for (const { name } of AREAS) writeFileSync(path.join(fakeDir, `${name}.mjs`), '');
  mkdirSync(path.join(fakeDir, AREAS[0].name));
  try { engine.mergeAreas(areas, fakeDir); ok(`areas/${AREAS[0].name}/ 하위 폴더(권역 이름)는 허용`); } catch (e) { bad(`권역 이름 하위 폴더를 막음: ${short(e.message)}`); }
  mkdirSync(path.join(fakeDir, 'check-stray'));
  expectStop('areas/에 권역 이름이 아닌 하위 폴더', '하위 폴더 check-stray/', () => engine.mergeAreas(areas, fakeDir));

  // 권역 출처: source를 내보낸 권역의 나라와 그 권역이 채우기로 새로 만드는 나라만 그 문구, 나머지는 기본 문구
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
