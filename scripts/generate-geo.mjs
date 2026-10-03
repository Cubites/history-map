// 국경 생성기 (DESIGN.md §5.2): data/geo/*.geojson 전체를 scripts/geo/ 아래 파일들로 만든다. 사용: npm run gen:geo [-- --prune]
// 주의: 실행할 때마다 data/geo/의 geojson을 모두 지우고 다시 쓴다. 영토를 고칠 때는 geojson이 아니라 scripts/geo/areas/의 권역 파일을 고친다.
// 이 파일은 명령줄 처리만 둔다. 권역 목록(AREAS)은 scripts/geo/area-list.mjs에, 권역 합치기·빈 땅 채우기·쓰기는 scripts/geo/engine.mjs에 있다.
// 이웃 나라가 같은 경계선을 공유하도록 이름 붙인 선으로 폴리곤을 조립한다.
// 바다 쪽 점은 해안선 밖에 찍는다. 빌드 단계에서 육지와 교차시켜 해안선이 맞춰진다.
// 선이 만·반도·해협을 가로지르면 선 반대편 해안이 본토와 떨어진 조각(월경지)으로 남으므로, 물을 건너는 선은 바다 점을 거쳐 돌린다.
// 떨어진 조각은 빌드의 월경지 검사(data/exclaves.yaml, npm run check:exclaves)가 잡아낸다.
// 경계의 근거(geojson의 source)는 권역 파일의 source로 정하고, 없으면 engine.mjs의 기본 문구(한국사 교과서 시대별 지도를 따른 추정)를 쓴다.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// 사용: node scripts/generate-geo.mjs [프로젝트 폴더] [--prune]
// - 프로젝트 폴더: 그 아래 data/geo에 쓴다. 주지 않으면 이 파일이 있는 scripts/의 상위 폴더, 상대 경로는 현재 폴더 기준
// - --prune: 이번에 쓰지 않을 geojson(없앤 나라, id를 바꾼 나라, 생성기 밖에서 그린 파일)을 지워도 됨. 없으면 그런 파일이 있을 때 지우기 전에 멈춘다
// 인자 오타는 채우기·쓰기 전에 멈춘다. '-'로 시작하는 인자는 --prune 말고 모두 모르는 옵션이다(-prune, --purne 등).
// 폴더를 둘 이상 주거나, package.json·data/entities가 없는 폴더를 주어도 멈춘다
// (npm run gen:geo prune처럼 --prune의 줄표를 빠뜨려 prune이 폴더로 읽혀도 엉뚱한 폴더에 geojson을 쓰지 않게)
const args = process.argv.slice(2);
const unknown = args.filter((a) => a.startsWith('-') && a !== '--prune');
if (unknown.length) throw new Error(`모르는 옵션: ${unknown.join(' ')}`);
const prune = args.includes('--prune');
const folders = args.filter((a) => !a.startsWith('-'));
if (folders.length > 1) throw new Error(`프로젝트 폴더는 하나만 준다: ${folders.join(' ')}`);
const project = folders.length ? path.resolve(folders[0]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const notProject = ['package.json', 'data/entities'].filter((f) => !existsSync(path.join(project, f)));
if (notProject.length) throw new Error(`프로젝트 폴더가 아님: ${project} (${notProject.join('·')} 없음)`);

// 권역 목록(AREAS)과 엔진은 인자를 다 본 뒤에 불러온다: 권역 파일은 불러올 때 도형을 계산하므로, 인자 오타로 멈출 때 그 계산을 기다리지 않게 (2026-10-03)
const { AREAS } = await import('./geo/area-list.mjs');
const { mergeAreas, fillEmptyLand, writeGeo } = await import('./geo/engine.mjs');
// 권역 목록(AREAS, scripts/geo/area-list.mjs)의 순서대로 합치고 채운다. AREA_DIR(권역 파일 폴더)에 목록에 없는 권역 파일이 있으면 지우기 전에 멈춘다
const AREA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'geo/areas');
const { versions, fillSpecs, sources } = mergeAreas(AREAS, AREA_DIR);
fillEmptyLand(versions, fillSpecs);
writeGeo(project, versions, { prune, sources });
