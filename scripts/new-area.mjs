// 지역 뼈대 한 명령 (RULES-TOOLS 작업 11(나), 2026-10-21): docs/guides/standards.md 9절 6~10(지역 등록·시대별 파일 틀·빈 땅 설정·정답표 틀)을 한 번에 만든다.
// 사용: npm run new:area -- <지역> [<시대>] [--filter <필터 단위>] [--prefix <사건 파일 앞머리>] [--title <시대·범위 한 줄>] [--dry-run]
//   <지역>: scripts/geo/areas/의 권역 파일 이름(영문 소문자·숫자·줄표). <시대>: 시대 파일 이름(예: pre-qin)
// 하는 일
//   - 등록되지 않은 지역(area-list.mjs의 AREAS에 없음): 권역 파일 scripts/geo/areas/<지역>.mjs 틀(versions·gapZones·voids·sourceOf를 joinEras로 내보냄),
//     area-list.mjs의 import와 AREAS 끝 한 줄(층 순서: 새 권역은 끝), src/schema/regions.ts의 REGION_FILTER_OF 한 줄(--filter 필요)과
//     STORY_FILE_PREFIXES 한 줄(--prefix를 주면), 항목 파일 data/entities/<지역>.yaml(빈 목록), 정답표 data/tests/places/<지역>.yaml(빈 목록)을 만든다.
//   - 이미 등록된 지역: 등록은 건너뛴다.
//   - <시대>를 주면: 시대 파일 scripts/geo/areas/<지역>/<시대>.mjs 틀(export const era = { name, versions: {}, gapZones: [], voids: [] })을 만들고
//     권역 파일이 그것을 가져와 joinEras로 합치게 잇는다(처음이면 권역 파일의 export const versions·gapZones·voids를 own…으로 바꾸고 맨 끝에 joinEras 줄을 더함).
//     짝 항목 파일 data/entities/<지역>-<시대>.yaml(빈 목록)과 REGION_FILTER_OF 한 줄(지역과 같은 필터 단위)도 만든다.
//     정답표는 이미 등록된 지역이면 만들지 않는다(그 필터 단위의 기존 정답표에 더한다).
// 빈 틀은 나라가 없으므로 npm run gen:geo 결과가 바이트까지 그대로여야 한다(git status data/geo 변화 0). 이 명령은 파일을 만들고 고치기만 하고 다른 명령을 부르지 않는다.
// 이미 있는 파일은 덮지 않고 멈춘다(--dry-run이면 무엇을 할지만 보인다). 지역 이름은 이 파일에 없다(인자로 받음).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = {
  areaDir: path.join(ROOT, 'scripts/geo/areas'),
  list: path.join(ROOT, 'scripts/geo/area-list.mjs'),
  regions: path.join(ROOT, 'src/schema/regions.ts'),
  entities: path.join(ROOT, 'data/entities'),
  places: path.join(ROOT, 'data/tests/places'),
};
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const fail = (msg, code = 2) => { console.error(msg); process.exit(code); };
const USAGE = '사용: npm run new:area -- <지역> [<시대>] [--filter <필터 단위>] [--prefix <앞머리->] [--title <시대·범위 한 줄>] [--dry-run]';

// ── 인자 ─────────────────────────────────────────────
const opts = { dry: false };
const pos = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--dry-run') opts.dry = true;
  else if (['--filter', '--prefix', '--title'].includes(a)) {
    if (i + 1 >= argv.length) fail(`${a} 뒤에 값이 없음\n${USAGE}`);
    opts[a.slice(2)] = argv[++i];
  } else if (a.startsWith('-')) fail(`모르는 옵션: ${a}\n${USAGE}`);
  else pos.push(a);
}
if (pos.length < 1 || pos.length > 2) fail(USAGE);
const [area, era] = pos;
const NAME = /^[a-z][a-z0-9-]*$/;
if (!NAME.test(area) || (era !== undefined && !NAME.test(era))) fail(`지역·시대 이름은 영문 소문자로 시작하는 소문자·숫자·줄표: ${pos.join(' ')}`);
if (opts.prefix !== undefined && !/^[a-z]+-$/.test(opts.prefix)) fail(`--prefix는 '영문 소문자-' 꼴(예: me-): ${opts.prefix}`);

// ── 바꿀 것 모으기 (모두 확인한 뒤 한꺼번에 쓴다) ─────────────
const writes = new Map(); // 절대 경로 → 새 내용
const notes = [];
const read = (p) => (writes.has(p) ? writes.get(p) : readFileSync(p, 'utf8'));
const create = (p, text) => {
  if (existsSync(p) || writes.has(p)) fail(`이미 있음: ${rel(p)} (덮지 않음)`, 1);
  writes.set(p, text);
};
const once = (text, needle, what) => {
  const n = text.split(needle).length - 1;
  if (n !== 1) fail(`${what}: ${JSON.stringify(needle)}를 ${n}번 찾음 (한 번이어야 고칠 수 있음)`, 1);
};
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

const listText = read(P.list);
const areasBlock = listText.match(/^export const AREAS = \[\n([\s\S]*?)^\];/m);
if (!areasBlock) fail('area-list.mjs에서 AREAS 목록을 찾지 못함', 1);
const areaOrder = [...areasBlock[1].matchAll(/\['([a-z0-9-]+)',\s*\w+\]/g)].map((m) => m[1]);
const registered = areaOrder.includes(area);
const regionsText = read(P.regions);
const filterUnits = (regionsText.match(/export const REGION_FILTERS = \[([^\]]*)\]/)?.[1] ?? '').match(/'[^']+'/g)?.map((q) => q.slice(1, -1)) ?? [];
const filterBlock = regionsText.match(/export const REGION_FILTER_OF[^=]*= \{\n([\s\S]*?)\n\};/);
if (!filterBlock) fail('src/schema/regions.ts에서 REGION_FILTER_OF 표를 찾지 못함', 1);
const filterOf = new Map([...filterBlock[1].matchAll(/^\s*'?([a-z0-9-]+)'?:\s*'([a-z0-9-]+)'/gm)].map((m) => [m[1], m[2]]));
const tsKey = (k) => (/^[a-z][a-z0-9]*$/.test(k) ? k : `'${k}'`);
const addFilter = (key, unit) => {
  if (filterOf.has(key)) { notes.push(`REGION_FILTER_OF에 '${key}' 이미 있음 (${filterOf.get(key)})`); return; }
  const text = read(P.regions);
  const m = text.match(/(export const REGION_FILTER_OF[^=]*= \{\n[\s\S]*?)(\n\};)/);
  writes.set(P.regions, text.replace(m[0], () => `${m[1]}\n  ${tsKey(key)}: '${unit}',${m[2]}`));
  filterOf.set(key, unit);
};
// 시대 파일이 가져와도 되는 것: lib·shared와 AREAS에서 이 지역보다 앞 권역, 같은 지역의 다른 도우미 모듈
const lowerAreas = (registered ? areaOrder.slice(0, areaOrder.indexOf(area)) : areaOrder).map((n) => `areas/${n}.mjs`);
const allowed = ['lib.mjs', 'shared.mjs', ...lowerAreas, `areas/${area}/의 다른 도우미 모듈`].join(', ');

// ── 1. 지역 등록 (등록되지 않은 지역만) ─────────────────────
const areaFile = path.join(P.areaDir, `${area}.mjs`);
if (!registered) {
  const unit = opts.filter;
  if (!unit || !filterUnits.includes(unit)) fail(`새 지역은 --filter <필터 단위>가 필요함 (지금 단위: ${filterUnits.join(', ')}. 새 단위는 REGION_FILTERS·REGION_FILTER_INFO에 먼저 더한다: REGION_GUIDE.md 2절)`);
  create(areaFile, `// ${area} 권역 (DESIGN.md §5.2, 층 ${areaOrder.length + 1}): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/${area}/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/${area}.yaml(시대 파일마다 data/entities/${area}-<시대>.yaml). 정답표: data/tests/places/${area}.yaml.
// 가져와도 되는 것: ${['lib.mjs', 'shared.mjs', ...lowerAreas, `areas/${area}/의 도우미 모듈`].join(', ')}. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { joinEras } from '../shared.mjs';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/${area}/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
export const { versions, gapZones, voids, sourceOf } = joinEras('${area}', { versions: ownVersions, gapZones: [], voids: [] }, []);
`);
  const lastImport = [...listText.matchAll(/^import \* as \w+ from '\.\/areas\/[a-z0-9-]+\.mjs';\n/gm)].at(-1);
  const ns = `${camel(area)}Area`;
  let lt = listText.slice(0, lastImport.index + lastImport[0].length) + `import * as ${ns} from './areas/${area}.mjs';\n` + listText.slice(lastImport.index + lastImport[0].length);
  lt = lt.replace(areasBlock[0], () => areasBlock[0].replace(/\n\];$/, `\n  ['${area}', ${ns}],\n];`));
  writes.set(P.list, lt);
  addFilter(area, unit);
  if (opts.prefix) {
    const text = read(P.regions);
    const m = text.match(/(export const STORY_FILE_PREFIXES[^=]*= \[)([\s\S]*?)(\];)/);
    if (!m) fail('STORY_FILE_PREFIXES를 찾지 못함', 1);
    if (m[2].includes(`'${opts.prefix}'`)) fail(`앞머리 ${opts.prefix}가 이미 있음`, 1);
    writes.set(P.regions, text.replace(m[0], () => `${m[1]}${m[2]}, ['${opts.prefix}', '${area}']${m[3]}`));
  }
  create(path.join(P.entities, `${area}.yaml`), `# ${area} 권역 나라 (npm run new:area가 만든 빈 틀)\n# 나라를 넣을 때 아래 []를 지우고 - id: …로 적는다(docs/DATA_GUIDE.md). 권역 값은 파일 이름에서 정해진다(src/schema/regions.ts REGION_FILTER_OF).\n[]\n`);
  create(path.join(P.places, `${area}.yaml`), `# ${area} 권역 국경 지점 정답표 (평소 지도, npm run new:area가 만든 빈 틀)\n# 읽는 곳: scripts/test-geo (npm run test:geo -- --only places). 꼴은 docs/DATA_GUIDE.md의 정답표 절을 따른다. 나라·시대마다 몇 점인지는 시작 때 정한다(standards.md 9절 10).\n# 지점을 넣을 때 아래 []를 지우고 - name: …로 적는다. 해는 천문 연도(기원전 N년 = 1-N), 새 지점은 url을 반드시 단다.\n[]\n`);
} else notes.push(`지역 ${area}는 이미 등록됨 (AREAS ${areaOrder.indexOf(area) + 1}번째): 등록·정답표는 건너뜀`);

// ── 2. 시대 파일 ────────────────────────────────────────
if (era) {
  const eraFile = path.join(P.areaDir, area, `${era}.mjs`);
  const entityName = `${area}-${era}`;
  create(eraFile, `// ${area} 시대 파일 ${era} (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: ${opts.title ?? '(여기에 시대(해는 "기원전 N년(천문 1−N)"처럼 둘 다)와 공간 범위를 적는다)'}
// 짝 항목 파일: data/entities/${entityName}.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: ${allowed}. areas/${area}.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/${area}/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/${area}.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
export const era = {
  name: '${era}',
  versions: {},
  gapZones: [],
  voids: [],
};
`);
  // 권역 파일에 잇기
  let at = read(areaFile);
  const id = `${camel(era)}Era`;
  const eraImport = `import { era as ${id} } from './${area}/${era}.mjs';\n`;
  if (at.includes(eraImport)) fail(`${rel(areaFile)}: 이미 ${era}를 가져옴`, 1);
  const joinRe = new RegExp(`joinEras\\('${area}', (\\{[^\\n]*\\}), \\[([^\\]\\n]*)\\]\\);`);
  if (!joinRe.test(at)) {
    // 처음 잇는 권역 파일: 자기 versions·gapZones·voids를 own…으로 바꾸고 맨 끝에 joinEras 줄을 더한다(값은 그대로라 생성 결과가 같다)
    const own = [];
    for (const [k, v] of [['versions', 'ownVersions'], ['gapZones', 'ownGapZones'], ['voids', 'ownVoids']]) {
      const needle = `\nexport const ${k} = `;
      if (!at.includes(needle)) continue;
      once(at, needle, rel(areaFile));
      if (new RegExp(`\\b${v}\\b`).test(at)) fail(`${rel(areaFile)}: 이름 ${v}가 이미 있음`, 1);
      at = at.replace(needle, () => `\nconst ${v} = `);
      own.push(`${k}: ${v}`);
    }
    if (!own.length) fail(`${rel(areaFile)}: export const versions를 찾지 못함`, 1);
    if (/^export (const|let) (sourceOf|gapZones|voids)\b/m.test(at) || /^export \{/m.test(at)) fail(`${rel(areaFile)}: gapZones·voids·sourceOf를 다른 꼴로 내보내고 있어 자동으로 잇지 못함(손으로 joinEras 줄을 쓴다)`, 1);
    at = at.replace(/\n*$/, '\n') + `\n// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/${area}/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)\nexport const { versions, gapZones, voids, sourceOf } = joinEras('${area}', { ${own.join(', ')} }, []);\n`;
    const imports = [...at.matchAll(/^import [^\n]*;\n/gm)];
    const last = imports.at(-1);
    at = at.slice(0, last.index + last[0].length) + `import { joinEras } from '../shared.mjs';\n` + at.slice(last.index + last[0].length);
    notes.push(`${rel(areaFile)}: export const ${own.map((o) => o.split(':')[0]).join('·')}를 own…으로 바꾸고 joinEras로 내보냄(처음 잇기)`);
  }
  {
    const m = at.match(joinRe);
    const list = m[2].trim() ? `${m[2].trim()}, ${id}` : id;
    at = at.replace(m[0], () => `joinEras('${area}', ${m[1]}, [${list}]);`);
    const imports = [...at.matchAll(/^import [^\n]*;\n/gm)];
    const last = imports.at(-1);
    at = at.slice(0, last.index + last[0].length) + eraImport + at.slice(last.index + last[0].length);
  }
  writes.set(areaFile, at);
  // 짝 항목 파일
  const unit = filterOf.get(area) ?? opts.filter;
  if (!unit) fail(`REGION_FILTER_OF에 ${area}가 없어 ${entityName}의 필터 단위를 모름: --filter <필터 단위>를 준다`);
  create(path.join(P.entities, `${entityName}.yaml`), `# ${area} ${era} 나라 (시대 파일 scripts/geo/areas/${area}/${era}.mjs의 짝 항목 파일, npm run new:area가 만든 빈 틀)\n# 시대·범위: ${opts.title ?? '(시대 파일 머리 주석 참고)'}\n# 나라를 넣을 때 아래 []를 지우고 - id: …로 적는다(docs/DATA_GUIDE.md). 권역 값은 파일 이름에서 정해진다(src/schema/regions.ts REGION_FILTER_OF의 '${entityName}').\n[]\n`);
  addFilter(entityName, unit);
  if (registered) notes.push(`정답표는 만들지 않음: 기존 data/tests/places/${unit}.yaml에 더한다`);
}
if (!writes.size) { console.log(`할 일 없음: ${notes.join('; ')}`); process.exit(0); }

// ── 쓰기와 보고 ─────────────────────────────────────────
for (const [p, text] of writes) {
  if (opts.dry) continue;
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text);
}
console.log(`${opts.dry ? '(--dry-run: 쓰지 않음) ' : ''}new:area ${area}${era ? ' ' + era : ''}: 파일 ${writes.size}개 ${opts.dry ? '쓸 예정' : '씀'}`);
for (const p of writes.keys()) console.log(`  ${rel(p)}`);
for (const n of notes) console.log(`  참고: ${n}`);
if (!opts.dry) console.log('  다음: npm run gen:geo 뒤 git status --short data/geo 변화 0, npm run typecheck (빈 틀이라 지도는 그대로여야 함)');
