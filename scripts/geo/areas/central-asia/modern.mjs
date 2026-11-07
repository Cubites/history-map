// central-asia 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1865~현재: 러시아 정복 뒤 나라들
// 짝 항목 파일: data/entities/central-asia-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/central-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source·trims 같은 이름은 안 됨: check:generator). 권역 파일 areas/central-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - trims: 앞 권역 나라에서 뺄 땅 { 나라 id: [[from, to, 멀티폴리곤], ...] } (engine.mjs '앞 권역 나라 깎기', 권역 파일 TRIMMABLE의 나라·기간만)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 중앙아시아 C1 짜임 안내 (C1 뼈대 2026-11-05 — 근거: docs/central-asia/00-scope.md, 운영자 결정 1~8, 기본값 15건) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 다섯 구역(taklamakan-desert·karakum-desert·kyzylkum-desert·betpak-dala·ustyurt-plateau) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습, 조약이 있으면 그 해, 없으면 실효 지배가 굳은 해. 원정·되돌려진 점령은 칠하지 않음. 그 나라 땅이 아니면 이웃을 새로 그리지 않고 비운다(voids에 이유).
//   새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름·정체만 바뀌는 해(1919·1920·1926·1973·1978·1992·1996·2001·2021 등)는 새 버전이 아니다(기본값 9) — 항목 글로.
// 운영자 결정 요지: 1 부하라 토후국·히바 칸국·코칸트 칸국은 따로 항목(보호국 vassal_of russia), russia·soviet-union은 그 땅만큼 깎는다(아래 깎기) /
//   2 신장 전체(CN-XJ)를 qing·roc·prc로 늘림(동쪽 띠 기존 모양 그대로) / 3 예티샤르(yettishar) 따로 항목, 그 기간 청은 타림을 칠하지 않음 /
//   4 소련 구성 공화국은 그리지 않음(소련 한 항목), 1992년부터 독립 다섯 나라 / 5 칼라트 밖 발루치스탄은 남아시아 조각 몫이라 이 파일과 무관(비움 그대로) /
//   6 아프가니스탄 1865 약 55만 km²에서 1873·1883·1893·1896 단계 증가 / 7 탈레반 시기 1996~2001은 아프가니스탄 한 덩어리 + 주석.
// 결정 맞춤(c1/COMMON.md 1~13 요지 — 결정을 뒤집지 않고 결정이 말하지 않은 해·땅만):
//   1 와한 골짜기 1883부터 afghanistan(1895 협정으로 붙은 동쪽 끝은 1만 km² 미만이면 1883 모양에 합침) / 2 동부 부하라(히사르·쿨롭·카라테긴·다르바즈)는 1868 보호국 버전부터 부하라, 1865~1867 비움 /
//   3 1865년 말 타슈켄트·침켄트·투르키스탄·아울리에아타 쪽은 비움(러시아 도형은 1866부터), 코칸트 1865는 페르가나 분지 쪽만 / 4 후잔드·우라튜베·지작 1866~1867 비움 /
//   5 부하라·히바 항목 to 1924(1923년까지 칠함), soviet-union 깎기 1918~1923, 코칸트 to 1876(1875년까지) / 6 히바 1873~1923은 아무다리야 왼쪽 오아시스·다쇼구즈 쪽(약 6.7만 km² 과녁), 남쪽 카라쿰 투르크멘 땅은 히바가 아님 /
//   7 예티샤르 끝 해는 사료로(그해 말 카슈가르·호탄 주인, 남은 땅 1만 km² 넘으면 1877 모양) / 8 일리 1865~1880 비움, 1881 청 / 9 동투르키스탄 공화국 1944~1949 세 지구 비움 기본(5만 km² 넘으면 질문 초안) /
//   10 항목 from은 성립 해, 첫 버전 1865(mapNote '지도에는 1865년부터') / 11 슈그난·로샨 오른쪽 기슭 1883~1894 아프가니스탄 점령(1만 km² 넘으면 칠함) / 12 다르바즈 왼쪽 기슭 1895 전(1만 km² 넘으면 부하라) /
//   13 1865년 카자흐스탄 남부(1866 구역 땅) 비움.
// 칸 나눔(부딪침 막기, c1/COMMON.md '구현 칸'): 칸 경계는 조각 경계라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── C1 A …'·'W'·'E')와 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수·깎기 목록 모두). 최상위 이름은 칸 앞머리 A_(서남: 아프가니스탄·히바·투르크멘)·W_(서: 부하라·코칸트·우즈베크·타지크·키르기스)·E_(동: 카자흐·신장),
//   import도 `import { X as W_X } from …`, ownSplit 묶음 이름도 앞머리('W_부하라1868'). 칸 밖 공통 줄(import·도우미·prevMinusOf·BOUNDS·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
//   자기 몫이 아닌 조각은 줄을 적지 않는다(fillTables가 주인 null로 채움, voids도 그 조각 칸 몫).
// 표 경계 해: 칸마다 A_BOUNDS·W_BOUNDS·E_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(C1_START·C1_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 C1_START(1865)부터, 해는 늘어난다. 단위마다 여러 번 이어 적을 수 있다(뒤 줄 첫 해가 앞 줄 마지막 해보다 뒤).
//   줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다. 주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 앞 권역 도형(러시아·소련·청 등)이 덮거나, 일부러 비운 땅(voids에 한 줄).
// 앞 권역 나라 늘리기: 권역 파일 EXTENDABLE의 나라(russia·soviet-union·qing·roc·prc)를 주인 id로 쓰면 joinEras가 그 나라 버전에 더한다(남아시아 S4 서 칸 꼴).
//   늘릴 땅은 그해 원래 도형과 겹치면 안 된다(1 km² 넘게 겹치면 생성기가 멈춤) — 단위를 나눌 때 prevMinusOf로 원래 도형을 떼어 주인 null 부분으로 둔다.
// 앞 권역 나라 깎기: 칸의 A_TRIMS·W_TRIMS에 { russia: [[from, to, 멀티폴리곤], ...], 'soviet-union': [...] }로 뺄 땅을 적는다(권역 파일 TRIMMABLE 기간 안,
//   to는 미포함). 엔진이 그 기간 원래 도형에서 빼고(원래 모양은 data/geo/home/ — 전쟁 화면 그대로), 그 땅의 새 주인(보호국)은 이 파일 소유표에 적는다.
//   뺄 땅 조각은 기간이 겹치는 러시아·소련 원래 버전 모두와 1 km² 넘게 겹쳐야 한다(헛 깎기면 멈춤 — 러시아 버전이 바뀌는 해에 조각을 나눈다). 뺄 땅은 보호국 단위 도형 그대로 써도 된다(겹치지 않는 몫은 차집합에서 사라짐).
//   깎은 땅이 러시아 도형 안의 구멍이 되면(히바처럼 둘러싸인 곳) 같은 해 그 땅에 주인(보호국)이 있거나 voids에 있어야 한다 — 아니면 생성기의 구멍 메우기가 러시아로 다시 메운다.
// 다른 권역 도형 빼기: prevMinusOf(from, to, except)가 [from, to) 동안 이 권역 조각·신장과 겹치는 앞 권역 나라(PREV_IDS)의 원래 버전 도형(권역 바깥선으로 자름)을 돌려준다.
//   세 칸이 모두 이 목록을 그해 주인 땅에서 빼서(주인 null 부분으로 떼어 둠) 겹침 0 — 깎기 구역 안의 보호국 땅만 except에 'russia'·'soviet-union'을 준다(그 땅은 러시아·소련에서 깎으므로).
//   [from, to) 안에서 한 나라의 잘린 도형이 바뀌면(버전이 둘 이상) 멈춘다 — 그 해를 BOUNDS에 넣거나 기간을 나눠 부른다.
// 러시아 구역 링: RU_CA_ZONES(europe.mjs SIBERIA_ZONES의 1854·1864·1866·1868·1873·1881·1884·1895 링 배열 그대로)와 RU_CA_LINES(L_AFG_N·L_TKM_S)를 보호국–러시아 선의 원천으로 쓴다(좌표를 옮겨 적지 않음).
// 신장: XJ(중국 조각 CN-XJ, table.mjs)가 이 꾸러미의 조각 하나다(id 'CN-XJ'). E 칸이 칼선으로 나눠 쓰고, 동쪽 띠·몽골 쪽은 prevMinusOf가 돌려주는 qing·roc·prc·mongolia를 뺀다
//   (inner-asia.mjs의 XJ_E_N·XJ_E_S는 export되지 않았으니 좌표를 베끼지 않는다 — check:generator).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(중앙아시아 첫판)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { RU_CA_ZONES, RU_CA_LINES, versions as EUROPE_VERSIONS } from '../europe.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('modern');

const C1_START = 1865; // 이 시대 파일의 첫 해(1865년 말 모습). 그 앞(1500~1864)은 C2 시대 파일 몫
const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)
const C1_END = PRESENT + 1; // 마지막 표의 끝(미포함)

// ── 다른 권역 도형 빼기 ─────────────────────────────
// prevMinusOf·PREV_IDS·prevListOf·deg2는 도우미 모듈 ./prev.mjs(C2 뼈대가 이 파일에서 옮김 — C1·C2가 함께 씀, 칸은 고치지 않음). 측정·쓰는 법은 그 모듈 머리

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·E_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < C1_START || e[0] >= C1_END)) {
    throw new Error(`central-asia modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${C1_START} 이상 ${C1_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = C1_START, to = C1_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── C1 A 서남 (아프가니스탄·히바·투르크멘, 구현 C1-A): 칼선·상수·import·own 줄·voids·깎기는 이 아래에, 최상위 이름은 A_ ──
// 조각: AF 34(AFG-1752·1753·1769·1772 포함)·TM-A·TM-B·TM-D·TM-M·UZ-XO·UZ-QR. 정의 항목 afghanistan·khiva-khanate·turkmenistan, 칠하기만 uzbekistan(UZ-XO·UZ-QR 1992~)
// 짜임(C1-A 2026-11-05): 소유표 단위는 세 무리다.
//   ① 아프가니스탄 34조각: 러시아 도형의 넘침(기본값 5 — 고치지 않음)이 바뀌는 해마다 묶음 하나(A_아프간1865·1868·1884·1895).
//      묶음 안 부분은 넘침(주인 없음, 러시아·소련이 덮음) → 북부 칸국 → 바다흐샨 → 하자라자트 → 카피리스탄 → 본토 차례로 잘라(결정 6 단계 증가) 해마다 주인을 적는다. 1992년부터는 조각 통째.
//   ② 히바 쪽(UZ-XO·UZ-QR·TM-D): 1865~1867·1868~1872(아무다리야 양쪽, 그해 러시아 도형을 뺌)·1873~1923(왼쪽 기슭, 러시아·소련에서 깎음 — A_TRIMS) 묶음 셋. 1924년부터 조각 통째.
//   ③ 투르크멘 땅(TM-A·TM-B·TM-M)은 시대 내내 조각 통째: 1991년까지 주인 없음(러시아 도형이 1881·1884부터 덮음, 그 앞은 비움), 1992년부터 투르크메니스탄.
// 앞 권역 도형: A_prevSpan(from, to)이 [from, to) 동안 이 칸 조각과 겹치는 앞 권역 도형(prevMinusOf를 해마다 불러 칸 땅으로 자름)을 돌려주고, 그 사이 넓이가 바뀌면 멈춘다
//   (prevMinusOf는 권역 전체를 보므로 신장·카자흐 쪽 해에도 멈추지만, 이 칸 땅 안에서는 러시아 구역 해 1854·1868·1873·1881·1884·1895에만 바뀐다).
import { bx as A_bx, rev as A_rev, ring as A_ring } from '../../lib.mjs';
// 칼선·도형 상수와 칸 땅·앞 권역 도형 자르기는 도우미 모듈 ./cuts.mjs(C2 뼈대가 옮김 — 이름·식 그대로)
import { A_AF, A_KH, A_TM, A_DOM_AF, A_DOM_KH, A_prevSpan, A_minus, A_K73, A_K65, A_NORTH, A_BDS, A_HAZ, A_KAF, A_LEBAP_N } from './cuts.mjs';
const A_BOUNDS = [1868, 1873, 1881, 1883, 1884, 1893, 1895, 1896, 1924, 1992]; // 이 칸 표 경계 해: 러시아 구역 해(1868·1873·1881·1884·1895 — 넘침·히바 묶음이 바뀜), 아프가니스탄 단계(1873·1883·1893·1896, 결정 6), 1924 민족 경계 획정, 1992 독립
const A_AF_UNITS = {};
for (const [from, to] of [[1865, 1868], [1868, 1884], [1884, 1895], [1895, 1992]]) {
  // 1895년부터의 넘침은 와한 동쪽 끝(74.891,37.232, 러시아 남쪽 한계 L_AFG_N 꼭짓점)에서 아프간 쪽에 넓이 0 조각을 남겨 그 둘레 0.1 km 네모(약 0.01 km²)를 넘침에 더한다
  const prev = from === 1895 ? U(A_prevSpan(from, to, A_DOM_AF), [[A_bx(74.8905, 37.2312, 74.8915, 37.2322)]]) : A_prevSpan(from, to, A_DOM_AF);
  // 단계 해 y의 줄: 묶음 첫 해에 이미 아프가니스탄이면 처음부터, 묶음 안이면 그 해부터
  const at = (y) => (y <= from ? [[from, 'afghanistan']] : y < to ? [[from, null], [y, 'afghanistan']] : [[from, null]]);
  A_AF_UNITS[from] = ownSplit(`A_아프간${from}`, A_AF, [...(prev.length ? [['넘침', prev]] : []), ['북부칸국', A_NORTH], ['바다흐샨', A_BDS], ['하자라자트', A_HAZ], ['카피리스탄', A_KAF]], '본토', {
    ...(prev.length ? { 넘침: [[from, null]] } : {}),
    북부칸국: at(1873), 바다흐샨: at(1883), 하자라자트: at(1893), 카피리스탄: at(1896), 본토: [[from, 'afghanistan']],
  }, { from, to });
}
own(A_AF, [[1992, 'afghanistan']]);

// 히바 묶음(그해 러시아 도형을 뺀 땅만 히바 — 1873년부터는 러시아·소련에서 깎으므로 빼지 않음)
const A_KH_UNITS = {
  1865: ownSplit('A_히바1865', A_KH, [['히바', A_minus(A_K65, A_prevSpan(1865, 1868, A_DOM_KH))]], '밖', { 히바: [[1865, 'khiva-khanate']] }, { from: 1865, to: 1868 }),
  1868: ownSplit('A_히바1868', A_KH, [['히바', A_minus(A_K65, A_prevSpan(1868, 1873, A_DOM_KH))]], '밖', { 히바: [[1868, 'khiva-khanate']] }, { from: 1868, to: 1873 }),
  1873: ownSplit('A_히바1873', A_KH, [['히바', A_K73]], '밖', { 히바: [[1873, 'khiva-khanate']] }, { from: 1873, to: 1924 }),
};
own(['TM-D'], [[1924, null], [1992, 'turkmenistan']]);
own(['UZ-XO', 'UZ-QR'], [[1924, null], [1992, 'uzbekistan']]);
own(A_TM, [[1865, null], [1992, 'turkmenistan']]);

// 깎기(결정 1 — 영향표 '줄임' 승인): 히바 칸국 1873~1923 땅을 러시아(1873~1917)·소련(1918~1923)에서 뺀다. 뺄 땅은 히바 단위 도형 그대로(러시아가 덮지 않는 몫은 차집합에서 사라짐)
const A_TRIMS = { russia: [[1873, 1884, U(A_K73, A_LEBAP_N)], [1884, 1918, A_K73]], 'soviet-union': [[1918, 1924, A_K73]] };
// 비운 땅(fillTables 뒤에 부름): 그해 이 칸의 주인 없는 단위에서 그해 앞 권역 도형(러시아)을 뺀 땅
const A_voids = () => {
  const G = (u) => geomOfUnit(u);
  const af = A_AF_UNITS;
  const out = [];
  // 아프가니스탄 바깥 땅(결정 6): 북부 칸국(마이마나·안드호이·시베르간·사르이풀 — 우즈베크 칸국들, 1873 전), 바다흐샨·와한(미르가 다스림, 1883 전),
  //   하자라자트(하자라 부족 땅, 1893 전), 카피리스탄(1896 전). 넘침 부분을 뗀 단위라 러시아 도형과 겹치지 않음
  out.push([1865, 1868, U(G(af[1865].북부칸국), G(af[1865].바다흐샨), G(af[1865].하자라자트), G(af[1865].카피리스탄))]);
  out.push([1868, 1873, U(G(af[1868].북부칸국), G(af[1868].바다흐샨), G(af[1868].하자라자트), G(af[1868].카피리스탄))]);
  out.push([1873, 1883, U(G(af[1868].바다흐샨), G(af[1868].하자라자트), G(af[1868].카피리스탄))]);
  out.push([1883, 1884, U(G(af[1868].하자라자트), G(af[1868].카피리스탄))]);
  out.push([1884, 1893, U(G(af[1884].하자라자트), G(af[1884].카피리스탄))]);
  out.push([1893, 1895, G(af[1884].카피리스탄)]);
  out.push([1895, 1896, G(af[1895].카피리스탄)]);
  // 투르크멘 부족 땅(아할·발칸·마리·다쇼구즈 남쪽 카라쿰 — 나라 없음, 러시아 도형은 1881 아할·1884 메르브부터)과
  //   카라칼파크스탄의 히바 밖 땅(우스튜르트 고원·키질쿰·옛 아랄해 기슭 — 카자흐·투르크멘 유목지, 러시아 도형은 1873부터): 그해 러시아 도형을 뺌
  const rest = (from, to, unit) => [from, to, A_minus(U(G(unit), F(...A_TM)), A_prevSpan(from, to, A_DOM_KH))];
  out.push(rest(1865, 1868, A_KH_UNITS[1865].밖));
  out.push(rest(1868, 1873, A_KH_UNITS[1868].밖));
  out.push(rest(1873, 1881, A_KH_UNITS[1873].밖));
  out.push(rest(1881, 1884, A_KH_UNITS[1873].밖));
  // 러시아·소련 도형(유럽 손 도형, 남쪽 한계 L_TKM_S·L_IRN_N)이 이 칸 조각 바깥선과 어긋나 남는 틈(이란·아프가니스탄 국경 쪽 띠, 1884~1991년 합 약 625 km², 가장 큰 조각 93 km²):
  //   기본값 5대로 러시아 도형을 고치지 않으므로 비움(넓이는 결과 노트 7절)
  out.push([1884, 1924, A_minus(D(A_DOM_KH, A_K73), A_prevSpan(1884, 1924, A_DOM_KH))]);
  out.push([1924, 1992, A_minus(A_DOM_KH, A_prevSpan(1924, 1992, A_DOM_KH))]);
  return out.filter(([, , g]) => g.length);
};
// ── C1 A 끝 ──

// ── C1 W 서 (부하라·코칸트·우즈베크·타지크·키르기스, 구현 C1-W): 칼선·상수·import·own 줄·voids·깎기는 이 아래에, 최상위 이름은 W_ ──
// 조각: UZ-AN·BU·FA·JI·NG·NW·QA·SA·SI·SU·TK·TO, TJ-DU·GB·KT·SU·TJK-368, KG-B·C·GB·J·N·O·T·Y, TM-L. 정의 항목 bukhara-emirate·kokand-khanate·uzbekistan·tajikistan·kyrgyzstan, 칠하기만 turkmenistan(TM-L 1992~)
import { P as W_P, ring as W_ring } from '../../lib.mjs';
// 러시아 구역 링·칼선·코칸트·조각 목록·1865 부분 목록은 도우미 모듈 ./cuts.mjs(C2 뼈대가 옮김 — 이름·식 그대로)
import { W_Z_OLD, W_Z66, W_Z68, W_Z73, W_CUT_BUKHARA_KYZYLKUM, W_CUT_LEBAP, W_UZ, W_TJ, W_KG, W_IDS, W_FER_IDS, W_REST_IDS, W_FER_PARTS, W_REST_PARTS_1865 } from './cuts.mjs';
// 표 경계 해: 1866(후잔드·우라튜베·지작 러시아 점령), 1868(사마르칸트 할양·보호국), 1876(코칸트 병합), 1883(아프가니스탄의 슈그난·로샨 점령), 1884(레바프 남쪽 러시아 구역), 1895(파미르 협정), 1918·1924(소련·민족 경계 획정), 1992(독립)
const W_BOUNDS = [1866, 1868, 1876, 1883, 1884, 1895, 1918, 1924, 1992];
// 슈그난·로샨·와한 오른쪽 기슭(고르노바다흐샨 서부 골짜기, 1883~1894 아프가니스탄 점령): 동쪽 변은 무르가브 고원 서쪽 끝 어림. 서쪽 변은 러시아 1868 구역(W_Z68)을 빼서 정해지므로 링의 서쪽 꼭짓점은 그 안 아무 데나
const W_CUT_SHUGNAN = W_P(W_ring([[70.8, 39.3], [72.6, 39.25], [72.7, 38.9], [72.85, 38.45], [72.65, 38.1], [72.85, 37.75], [73.1, 37.45], [73.2, 37.1], [73.2, 36.6], [70.3, 36.4]]));
// 고르노바다흐샨 조각에서 부하라가 가지는 1868 구역 몫은 북위 39.15° 남쪽(다르바즈·반즈)만 — 그 북쪽 알라이 쪽 104 km²는 따로 떨어진 조각이라 파미르와 함께 비움(1895부터 러시아)
const W_GB_SOUTH = W_P(W_ring([[69.5, 36.0], [73.0, 36.0], [73.0, 39.15], [69.5, 39.15]]));
// 페르가나 쪽(코칸트 조각 + 소그드주): 1865~1923 한 묶음 — 코칸트 1865~1875 한 버전, 후잔드·우라튜베 1865 부하라(1866 러시아 점령), 제라프샨 골짜기 1865~1867 부하라(1868 할양)
const W_UF = ownSplit('W_페르가나', W_FER_IDS, [
  ...W_FER_PARTS,
], '나머지', {
  러시아: [[1865, null]],
  알라이남: [[1865, 'kokand-khanate'], [1876, null]],
  코칸트: [[1865, 'kokand-khanate'], [1876, null]],
  후잔드: [[1865, 'bukhara-emirate'], [1866, null]],
  제라프샨: [[1865, 'bukhara-emirate'], [1868, null]],
  나머지: [[1865, null]],
}, { from: 1865, to: 1924 });
// 1865~1867: 1865년 말 모습(타슈켄트 쪽은 러시아가 차지했으나 러시아 도형은 1866부터 — 비움), 1866년 지작 러시아 점령(러시아 도형은 1868부터 — 비움)
const W_U65 = ownSplit('W_1865', W_REST_IDS, [
  ...W_REST_PARTS_1865,
], '나머지', {
  러시아: [[1865, null]],
  타슈켄트쪽: [[1865, null]],
  톈산: [[1865, null]],
  키질쿰북: [[1865, null]],
  동부부하라: [[1865, null]],
  파미르: [[1865, null]],
  레바프남: [[1865, null]],
  지작: [[1865, 'bukhara-emirate'], [1866, null]],
  부하라: [[1865, 'bukhara-emirate']],
  나머지: [[1865, null]],
}, { from: 1865, to: 1868 });
// 1868~1923: 부하라 보호국(동부 부하라 포함 — 결정 맞춤 2). 부하라 땅은 러시아·소련에서 깎는다(W_TRIMS)
const W_U68 = ownSplit('W_1868', W_REST_IDS, [
  ['러시아', U(W_Z_OLD, W_Z66)],
  ['키질쿰북', I(F('UZ-NW', 'UZ-BU'), W_CUT_BUKHARA_KYZYLKUM)],
  ['아프간점령', I(F('TJ-GB'), D(W_CUT_SHUGNAN, W_Z68))],
  ['부하라', U(F('UZ-BU', 'UZ-NW', 'UZ-QA', 'UZ-SU', 'TJ-KT', 'TJK-368', 'TJ-DU'), I(F('TJ-GB'), I(W_Z68, W_GB_SOUTH)), I(F('TM-L'), U(W_Z68, W_CUT_LEBAP)))],
  ['파미르', F('TJ-GB')],
  ['레바프남', F('TM-L')],
], '러시아땅', {
  러시아: [[1868, null]],
  키질쿰북: [[1868, null]],
  아프간점령: [[1868, null], [1883, 'afghanistan'], [1895, null]],
  부하라: [[1868, 'bukhara-emirate']],
  파미르: [[1868, null]],
  레바프남: [[1868, null]],
  러시아땅: [[1868, null]],
}, { from: 1868, to: 1924 });
// 1924~1991 소련 도형 그대로(결정 4 — 구성 공화국 경계는 그리지 않음), 1992년부터 독립 나라(조각 통째, 기본값 11)
own(W_UZ, [[1924, null], [1992, 'uzbekistan']]);
own(W_TJ, [[1924, null], [1992, 'tajikistan']]);
own(W_KG, [[1924, null], [1992, 'kyrgyzstan']]);
own(['TM-L'], [[1924, null], [1992, 'turkmenistan']]);
const W_G = (unit) => geomOfUnit(unit);
// 러시아·소련 원래 도형이 부하라–아프가니스탄 국경(아무다리야·판지) 너머 아프가니스탄 조각으로 넘친 가는 띠(손그림 남쪽 변 L_AFG_N과 조각 국경의 차이).
// 부하라 땅만 깎으면 이 띠가 러시아의 떨어진 가는 조각으로 남으므로 함께 깎는다(그 땅의 주인은 아프가니스탄 조각을 칠하는 칸 몫 — 결과 노트 9절)
const W_AF_BAND = I(F(...idsOf('AFG')), W_P(W_ring([[64.8, 36.0], [71.6, 36.0], [71.6, 38.7], [64.8, 38.7]])));
// (넘친 띠만 따로 오려 빼면 넓이 0 부스러기가 남으므로 그 상자 안 아프가니스탄 조각을 통째로 뺀다 — 러시아·소련 도형이 그 안에 가진 땅은 넘친 띠뿐)
// 깎기(fillTables 뒤에 읽히도록 getter): 부하라 1868~1923(러시아 1868~1917·소련 1918~1923), 코칸트 1868~1875.
// 1868~1894는 고르노바다흐샨 조각 전체를 함께 뺀다(그 동쪽엔 러시아 도형이 없어 결과는 같고, 1868 구역 변을 두 번 그어 생기는 넓이 0 부스러기를 막음). 코칸트도 트랜스알라이 비탈까지(같은 까닭)
const W_TRIMS = {
  // 한 해에 한 조각만(두 조각을 따로 빼면 맞닿은 변에 넓이 0 부스러기가 남음): 1868~1875 부하라+코칸트, 1876~1894 부하라, 1895~1917 부하라(고르노바다흐샨 동쪽은 러시아 그대로)
  get russia() {
    const bukhara = U(W_G(W_U68.부하라), W_AF_BAND);
    // 1868~1875는 알라이 쪽 1868 구역 변 위의 넓이 0 부스러기(72.65,39.39)까지 작은 상자로 함께 뺀다(그 둘레는 코칸트·비운 땅뿐)
    const alayDot = W_P(W_ring([[72.6, 39.35], [72.75, 39.35], [72.75, 39.45], [72.6, 39.45]]));
    return [[1868, 1876, U(bukhara, F('TJ-GB'), W_G(W_UF.코칸트), W_G(W_UF.알라이남), alayDot)], [1876, 1895, U(bukhara, F('TJ-GB'))], [1895, 1918, bukhara]];
  },
  get 'soviet-union'() { return [[1918, 1924, U(W_G(W_U68.부하라), W_AF_BAND)]]; },
};
// 러시아·소련 원래 도형(손그림 바깥 한계)이 톈산 안쪽(악사이·아트바시 쪽)과 알라이–파미르 모퉁이를 덮지 않는 곳(유럽 도형은 바이트 그대로 — 결과 노트 8절 장부 후보)
const W_RU_AT = (y) => EUROPE_VERSIONS.russia.find(([f, t]) => f <= y && y < (t ?? Infinity))[2];
const W_TIAN_BOX = W_P(W_ring([[73.0, 39.2], [80.6, 39.2], [80.6, 42.3], [73.0, 42.3]]));
const W_voids = () => [
  [1865, 1868, D(I(F(...W_IDS), I(W_TIAN_BOX, W_Z_OLD)), W_RU_AT(1865))], // 1865~1867 이식쿨 남쪽 구역 몫 가운데 러시아 손 도형 밖
  [1868, 1992, D(I(F(...W_IDS), W_TIAN_BOX), W_RU_AT(1895))], // 1868~1991 같은 까닭(러시아 1895 모양 = 소련 모양, 이 상자 안에서는 1868 뒤 바뀌지 않음)
  B(1865, 1866, W_U65.타슈켄트쪽), // 타슈켄트(1865년 6월 함락)·침켄트·추강·탈라스: 1865년 말 러시아가 차지했으나 러시아 도형은 1866년 구역부터(결정 맞춤 3)
  B(1865, 1868, W_U65.톈산), // 톈산 안쪽(나린·이식쿨 남쪽·수사미르·앙그렌): 코칸트 내전으로 키르기스 부족이 떨어져 나가 실효 지배가 없음, 러시아는 1868년 나린 요새부터
  B(1865, 1868, W_U65.키질쿰북), // 부하라 북쪽 키질쿰 사막: 1868년 러시아 구역 전에는 어느 나라 땅도 아님(유목민)
  [1868, 1873, I(W_G(W_U68.키질쿰북), W_Z73)], // 그 가운데 러시아 1873 구역 몫(아무다리야 쪽 부스러기)
  B(1865, 1868, W_U65.동부부하라), // 동부 부하라(히사르·쿨롭·카라테긴·다르바즈)·샤흐리삽즈: 부하라가 1868~1878년에 병합한 독립 벡국들(1868 버전에 합침 — 결정 맞춤 2)
  B(1865, 1868, W_U65.파미르), [1868, 1883, W_G(W_U68.아프간점령)], [1868, 1895, W_G(W_U68.파미르)], // 파미르(슈그난·로샨·무르가브): 1895년 파미르 협정 전에는 어느 나라 땅도 아님(1883~1894 서부 골짜기는 아프가니스탄 점령)
  B(1865, 1868, W_U65.레바프남), [1868, 1873, W_G(W_U68.레바프남)], [1873, 1884, W_G(W_U68.레바프남)], // 레바프 남서쪽 카라쿰(1873~1883 북쪽 끝 러시아 1873 구역 부스러기도 — 합칠 때 더함, A_TRIMS 줄 참고): 투르크멘 부족 땅(부하라·히바 땅 아님), 러시아는 1884년 메르브 병합부터
  B(1865, 1866, W_UF.러시아), // 페르가나 북쪽 1866 구역 몫(차트칼 북쪽 비탈): 위와 같은 까닭
  B(1866, 1868, W_U65.지작, W_UF.후잔드), // 후잔드·우라튜베·지작·굶주린 초원: 1866년 러시아 점령, 러시아 도형은 1868년 구역부터(결정 맞춤 4)
  [1876, 1895, W_G(W_UF.알라이남)], // 트랜스알라이 북쪽 비탈: 코칸트 병합 뒤 러시아 도형은 1895년 파미르 구역부터
];
// ── C1 W 끝 ──

// ── C1 E 동 (카자흐·신장, 구현 C1-E): 칼선·상수·import·own 줄·voids는 이 아래에, 최상위 이름은 E_ ──
// 조각: KZ 14·KAZ-3207·KAZ-4829·KAB(바이코누르 — 카자흐스탄 땅으로 칠함), 신장 'CN-XJ'(XJ). 정의 항목 yettishar·kazakhstan, 늘리기 russia·soviet-union(카자흐 동쪽 끝)·qing·roc·prc(신장). 깎기 없음
import { box as E_box, ring as E_ring } from '../../lib.mjs';
// 카자흐 동쪽 끝 상자·신장 칼선과 그 땅은 도우미 모듈 ./cuts.mjs(C2 뼈대가 옮김 — 이름·식 그대로)
import { E_KZ_EAST_IDS, E_KZ_EAST_ZONE, E_S_ILI, E_S_HAMI, E_S_NORTH, E_S_ETR, E_S_URUM, E_S_KASH, E_S_AKSU, E_S_KHOTAN } from './cuts.mjs';
// 표 경계 해: 이 칸은 나눈 조각의 모양이 바뀌는 해만 둔다(주인이 바뀌는 해는 표 안에서 해마다 적을 수 있음).
//   1868·1895: 신장 조각 안 러시아 구역 넘침이 바뀌는 해(9,276 → 9,491 km², 기본값 5로 고치지 않음) / 1921: 몽골(채우기 1921~)이 생겨 신장 조각 안 중화민국 도형이 바뀌는 해 /
//   1992: 소련이 없어져 신장 북서 넘침을 중화인민공화국이 칠하고 카자흐스탄이 생기는 해
const E_BOUNDS = [1868, 1895, 1921, 1992];

// 앞 권역 도형을 땅 zone 안으로만 잘라 [from, to) 동안 하나로 돌려준다(prevMinusOf를 앞 권역 버전이 바뀌는 해마다 나눠 부르고,
// zone 안 모양이 기간 안에서 1 km² 넘게 바뀌면 멈춤 — 권역 다른 곳의 러시아 구역이 바뀌어도 이 땅 안이 같으면 한 기간으로 쓴다)
// 앞 권역 도형의 작은 구멍(약 0.01제곱도 — 대략 100 km² 미만)은 쓰기 단계의 틈새 구멍 메우기가 그 나라로 메우므로 메운 모양으로 뺀다
const E_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]);
// 넓이가 거의 0인 조각(0.01 km² 미만 — 자르기에서 생긴 바늘 모양)을 버림
const E_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6);
const E_prevIn = (zone, from, to) => {
  const T = to ?? Infinity;
  const ys = new Set([from]);
  for (const id of PREV_IDS) for (const [f, t] of prevListOf(id)) for (const y of [f, t]) if (y > from && y < T) ys.add(y);
  const cuts = [...ys].sort((a, b) => a - b);
  let out = null;
  let size = 0;
  cuts.forEach((y, i) => {
    const end = i + 1 < cuts.length ? cuts[i + 1] : to;
    const parts = prevMinusOf(y, end).map((g) => I(E_filled(g), zone)).filter((g) => g.length);
    // 넓이가 거의 0인 조각(0.01 km² 미만 — 자르기에서 생긴 바늘 모양)은 버린다(남기면 그 땅을 뺀 단위에 가시가 생겨 반올림 뒤 고리가 꼬임: 카자흐스탄–러시아 연방 북쪽 국경)
    const g = E_noDust(parts.length > 1 ? U(...parts) : (parts[0] ?? []));
    const s = deg2(g);
    if (out === null) [out, size] = [g, s];
    else if (Math.abs(s - size) > 1e-4) throw new Error(`central-asia modern E_prevIn: [${from}, ${to}) 안 ${y}년에 이 땅의 앞 권역 도형이 바뀜 — 기간을 나눈다`);
  });
  return out;
};
// zone에서 [from, to) 동안의 앞 권역 도형을 뺀 땅. 기간 안 모양이 같은지는 E_prevIn으로 확인하고, 빼기는 앞 권역의 원래 도형(권역 바깥선으로 자르기 전)으로 한 번에 한다
// (자른 도형을 다시 빼면 국경 위에 넓이 0 가시가 남아 반올림 뒤 고리가 꼬임 — 카자흐스탄–러시아 연방 북쪽 국경, 겹침 검사의 polyclip 예외)
const E_rawMinus = (zone, from, to) => {
  E_prevIn(zone, from, to);
  const raw = PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= from && from < t).map(([, , g]) => E_filled(g)));
  return E_noDust(D(zone, ...raw));
};
// 줄 하나를 [from, to) 기간으로 자름(첫 해는 from)
const E_cutLine = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];

// ── 카자흐스탄 (기본값 7·11, 결정 맞춤 13) ──
// 1865~1991년 러시아 제국·소련 손 도형은 1864년 구역의 동쪽 한계(동경 약 80.2~80.6°) 때문에 카자흐스탄 동쪽 끝 25,819 km²를 비웠다
// (알라콜 호 동쪽·바르리크산·타르바가타이산 북쪽 기슭 18,702, 코르고스강 서쪽 이리 골짜기 4,356, 자이산 호 남쪽 사우르산 기슭 2,686, 칸텡그리 북쪽 74 km² — 1865~1991년 해마다 같은 모양).
// 이 땅은 1864년 추구착(타르바가타이) 의정서로 러시아 쪽이 되었고, 1881년 상트페테르부르크 조약·1882~1883년 국경 의정서로 넘어간 코르고스강 서쪽·자이산 쪽(합 1만 km² 미만)은 해를 나누지 않는다(끝 기준 — 버전 없음).
// 그래서 상자(동경 80~86°, 북위 42~47.8°)와 알마티 주·동카자흐스탄 주 조각이 겹치는 땅에서 러시아·소련 원래 도형을 뺀 땅을 1865~1917 russia, 1918~1991 soviet-union으로 늘린다.
const E_KZ_IDS = idsOf('KAZ', 'KAB'); // 카자흐스탄 조각 16 + 바이코누르 임차지(KAB — 카자흐스탄 주권 땅이라 1992년부터 카자흐스탄으로 칠함)
const E_KZ_ALL = F(...E_KZ_IDS);
// 러시아 도형과 떨어진 작은 조각(칸텡그리 북쪽 74 km² 등 300 km² 미만)은 늘리지 않는다(떨어진 섬이 생김 — 비운 땅으로 둠)
const E_KZ_FILL = E_rawMinus(E_KZ_EAST_ZONE, C1_START, 1992).filter((p) => deg2([p]) >= 0.03);
ownSplit('E_카자흐동끝', E_KZ_EAST_IDS, [['메움', E_KZ_FILL]], '나머지', { 메움: [[C1_START, 'russia'], [1918, 'soviet-union']] }, { from: C1_START, to: 1992 });
// 1992년부터 카자흐스탄(1991년 12월 16일 독립, 소련은 1991년 말까지 — 유럽 우크라이나와 같은 꼴). 러시아 연방 도형이 북쪽 가장자리에서 덮는 땅(4,724 km²)은 뺌(러시아 연방 바이트 그대로)
ownSplit('E_카자흐1992', E_KZ_IDS, [['카자흐', E_rawMinus(E_KZ_ALL, 1992, null)]], '앞', { 카자흐: [[1992, 'kazakhstan']] }, { from: 1992, to: C1_END });

// ── 신장 (운영자 결정 2·3, 기본값 1·2·10, 결정 맞춤 7·8·9) ──
// 신장은 중국 조각 CN-XJ 한 덩어리(약 163만 km²)라 시대 경계는 모두 칼선이다. 선은 산줄기 능선·강·오아시스 사이 사막을 따라 손으로 그은 근사(확실성 estimated, 지금 주·현 경계를 기준점으로 삼음).
// 남쪽 쿤룬·알툰산 띠와 몽골 국경 부스러기는 청·중화민국·중화인민공화국·몽골 기존 도형, 북서쪽 알타이·일리·카슈가르 서쪽 가장자리 부스러기(6,537~9,556 km²)는 러시아·소련 기존 도형이 덮는다(기본값 5 — 고치지 않음) — 기간마다 '앞'으로 떼어 둠.
// 주인 줄(그해 말 모습). 결정 맞춤 7: 1877년 12월 카슈가르(17~18일)·야르칸드(21일) 함락, 호탄은 1878년 1월 2일 — 그해 말 예티샤르 땅은 호탄 쪽만(1만 km² 넘음)
const E_XJ_LINES = {
  일리: [[C1_START, null], [1881, 'qing'], [1912, 'roc'], [1944, null], [1949, 'prc']], // 1864~1871 타란치 술탄국·1871~1881 러시아 점령은 비움(기본값 1, 맞춤 8), 1881 상트페테르부르크 조약, 1944년 11월 동투르키스탄 공화국(맞춤 9)
  하미: [[C1_START, null], [1876, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1865~1875 청의 실효 지배를 사료로 못 박지 못해 비움(결과 노트 6절 질문 초안)
  세지구: [[C1_START, null], [1876, 'qing'], [1912, 'roc'], [1945, null], [1949, 'prc']], // 둥간 봉기 지역 1865~1875 비움, 1945년 9월 타르바가타이·알타이까지 세 지구(맞춤 9)
  우루무치: [[C1_START, null], [1870, 'yettishar'], [1876, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1864~1870 우루무치 둥간 정권 비움, 1870 야쿱 벡 점령, 1876년 8월 청 탈환
  북: [[C1_START, null], [1876, 'qing'], [1912, 'roc'], [1949, 'prc']],
  카슈가르: [[C1_START, 'yettishar'], [1877, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1865년 1월 야쿱 벡이 카슈가르에 들어옴, 같은 해 양기히사르·야르칸드
  악수: [[C1_START, null], [1867, 'yettishar'], [1877, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1864~1867 쿠차 라시딘 호자 정권 비움, 1877년 10월 청
  호탄: [[C1_START, null], [1867, 'yettishar'], [1878, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1864~1866 호탄 하비불라 정권 비움, 1867년 1월 야쿱 벡
  동: [[C1_START, null], [1870, 'yettishar'], [1877, 'qing'], [1912, 'roc'], [1949, 'prc']], // 1870 투루판·카라샤르, 1877년 4월 투루판·톡순, 10월 카라샤르·코를라 청
};
const E_XJ_SHAPES = [['일리', E_S_ILI], ['하미', E_S_HAMI], ['세지구', E_S_ETR], ['우루무치', E_S_URUM], ['북', E_S_NORTH], ['카슈가르', E_S_KASH], ['악수', E_S_AKSU], ['호탄', E_S_KHOTAN]];
// 부스러기: 신장 조각에서 앞 권역 도형을 뺀 땅 가운데 떨어진 작은 조각(악사이친 서쪽 가장자리 — 청 남쪽 띠와 잠무 카슈미르 사이 가는 띠 넷, 합 약 56 km²)은
// 칠하지 않고 '앞'(주인 없음)에 둔다(칠하면 가는 띠 조각이 생김 — 늘리기 전에도 비어 있던 땅, 빈 땅 검사 최소 500 km² 아래)
const E_XJ_LAYOUTS = [[C1_START, 1868], [1868, 1895], [1895, 1921], [1921, 1992], [1992, C1_END]].map(([from, to]) => {
  const rest = E_rawMinus(XJ, from, to === C1_END ? null : to); // 앞 권역 도형을 뺀 신장(나머지 '앞'은 주인 없음 — 앞 권역 도형이 덮음)
  let left = rest.filter((p) => deg2([p]) >= 0.03);
  const parts = [];
  for (const [name, shape] of E_XJ_SHAPES) {
    parts.push([name, E_noDust(I(left, shape))]);
    left = E_noDust(D(left, shape));
  }
  parts.push(['동', left]);
  const units = ownSplit(`E_신장${from}`, [XJ_ID], parts, '앞',
    Object.fromEntries(Object.entries(E_XJ_LINES).map(([p, l]) => [p, E_cutLine(l, from, to)])), { from, to });
  return { from, to, units };
});

// 비운 땅(fillTables 뒤에 부름): 신장은 주인 없는 부분, 카자흐스탄은 조각에서 러시아 원래 도형과 동쪽 끝 메움을 뺀 땅
const E_voids = () => {
  const out = [];
  // 신장: 해마다 주인 없는 부분(앞 권역 도형 '앞'은 뺌)이 같은 기간끼리 묶음 — 이유는 E_XJ_LINES 줄 주석(둥간·타란치·쿠차·호탄 정권, 러시아의 이리 점령, 동투르키스탄 공화국)
  for (const { from, to, units } of E_XJ_LAYOUTS) {
    let run = null;
    for (let y = from; y <= to; y++) {
      const nulls = y < to ? Object.keys(E_XJ_LINES).filter((p) => E_cutLine(E_XJ_LINES[p], from, to).filter(([yy]) => yy <= y).at(-1)[1] === null) : null;
      const key = nulls ? nulls.join('|') : '끝';
      if (run && run.key !== key) {
        if (run.nulls.length) out.push(B(run.from, y === C1_END ? null : y, ...run.nulls.map((p) => units[p])));
        run = null;
      }
      if (!run && nulls) run = { key, from: y, nulls };
    }
  }
  // 카자흐스탄 1865: 침켄트·투르키스탄·아울리에아타·시르다리야 아래쪽(러시아가 1864~1865년에 차지 — 러시아 도형은 1866년부터, 맞춤 13)
  // 1866~1872: 아랄해 남쪽·우스튜르트 북쪽(러시아 도형은 1873년 구역부터 — 히바 쪽 유목지, 이 권역 나라가 칠하지 않음), 1866~1867 키질쿰 남쪽 가장자리(1868년 구역 전)
  // 1873~: 러시아 손 도형과 조각 사이 부스러기(1만 km² 미만 — 늘리지 않음)
  for (const [f, t] of [[C1_START, 1866], [1866, 1868], [1868, 1873], [1873, 1881], [1881, 1992]]) {
    const g = D(E_rawMinus(E_KZ_ALL, f, t), E_KZ_FILL);
    if (deg2(g) > 1e-4) out.push([f, t, g]);
  }
  return out;
};
// ── C1 E 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([C1_START, ...A_BOUNDS, ...W_BOUNDS, ...E_BOUNDS, C1_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== C1_START || BOUNDS.at(-1) !== C1_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${C1_START}~${C1_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
    }
  }
  for (const T of TABLES) {
    const splitHere = new Set();
    for (const l of layouts.filter((x) => x.from <= T.FROM && T.TO <= x.to)) {
      l.out = l.out ? T.reuse(l.out) : T.split(l.name, l.ids, l.parts, l.restName);
      for (const u of Object.values(l.units)) T.own([u], lines.has(u) ? sliceLine(u, lines.get(u), T.FROM, T.TO) : [[T.FROM, null]]);
      for (const id of l.ids) splitHere.add(id);
    }
    // 통째 조각: 같은 줄끼리 묶어 한 번에(묶음은 도형에 영향 없음: 버전은 해마다 단위 목록으로 만든다)
    const groups = new Map();
    for (const id of ALL_IDS) {
      if (splitHere.has(id)) {
        const line = lines.get(id);
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
        continue;
      }
      const sliced = lines.has(id) ? sliceLine(id, lines.get(id), T.FROM, T.TO) : [[T.FROM, null]];
      const key = JSON.stringify(sliced);
      if (!groups.has(key)) groups.set(key, { sliced, ids: [] });
      groups.get(key).ids.push(id);
    }
    for (const { sliced, ids } of groups.values()) T.own(T.whole(...ids), sliced);
  }
};
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역·비운 땅·뺄 땅 (공통) ─────────────────────────────
const joined = joinTables(TABLES);
if (joined.TO !== C1_END) throw new Error(`central-asia modern: 마지막 표의 끝이 ${joined.TO} (${C1_END}이어야 함)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to === C1_END ? null : to, build(list)])]));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...A_voids(), ...W_voids(), ...E_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 83개 + 신장)에서 그해 비운 땅(voids)을 뺀 곳 — 앞 권역 도형(러시아·소련·청 등)이 덮는 땅과 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역은 끝이 없다. 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상 — 그 칸 땅임을 결과 노트에 한 줄)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([C1_START, C1_END, ...voids.flatMap(([f, t]) => [f, t ?? C1_END]).filter((y) => C1_START < y && y < C1_END)])].sort((a, b) => a - b);
// 합칠 때 더함: 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다. 비운 땅은 '조각 − 그해 러시아 등 앞 권역 도형'이라 구역 변이 앞 권역 도형 변과 거의 겹치는데,
// 반올림하지 않으면 test:geo gaps의 빈 땅 계산(구역 − 그해 영토)이 polyclip 예외로 멈춤(1865년 우스튜르트 남쪽 54.05,41.63 — 합친 사본에서 처음 확인). 반올림하면 같은 변이 같은 꼭짓점이 됨
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? C1_END)).map(([, , g]) => g);
  const open = to === C1_END;
  return [{ name: open ? `중앙아시아 현대 ${from}~` : `중앙아시아 현대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to: open ? null : to }];
});

// 앞 권역 나라에서 뺄 땅(engine.mjs '앞 권역 나라 깎기'): 칸의 깎기 목록을 모음(빈 목록이면 엔진이 아무것도 안 함)
const TRIMS = { russia: [...A_TRIMS.russia, ...W_TRIMS.russia], 'soviet-union': [...A_TRIMS['soviet-union'], ...W_TRIMS['soviet-union']] };

void U; void CA; void CN; void XJ; void XJ_ID; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void RU_CA_ZONES; void RU_CA_LINES; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
  trims: TRIMS,
};
