// americas 시대 파일 colonial (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 아메리카 식민 시대(1492~1775)
// 짝 항목 파일: data/entities/americas-colonial.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 땅 없는 항목 muisca·neo-inca-state는 항목 파일에만 있음)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 다른 도우미 모듈. areas/americas.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/americas/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/americas.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다 — 권역 파일 joinEras 차례는 과거 시대가 앞: colonial·independence·modern).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 아메리카 M3 짜임 안내 (M3 뼈대 2026-11-17 — 근거: docs/americas/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 6, 창구 ② 1·4·5·7·8·9·10, 기본값 7·18·19·23),
//    M1 Q1 (B)·G16, M2 Q1 A·M-M2-1·M-M2-2·Q-R1·Q-R2, M3 창구 ②(Q1 A·Q2 C·Q3 A·Q4 A — border-stages/am-m3/decisions.md), 메인 결정 M-M3-1·M-M3-2, 기본값 G3-1~G3-46,
//    지시문 am-m3/m3/COMMON.md 2~4절·notes.md C-M3-1~16) ─────────────────
// 등급(00-scope 3절): 일반(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). '주변'은 data/tests/zones.yaml greenland-ice-sheet 안만(땅 5만·선 25/50 km).
// 해 규칙(P1): 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(점령은 관계 줄 없이 글 — G3-15). 새 버전은 1만 km² 넘게 바뀔 때만.
//   이름만 바뀌는 해(누에바에스파냐 왕국 → 부왕령 1535, 누에바카스티야 총독부 → 페루 부왕령 1542, 쿠바 총독령 → 총사령부 1607, 과테말라 아우디엔시아 → 총사령부 1609, 그랑파라 마라냥 1751 — G3-43)는 새 버전이 아니다 — 항목 글로(P3).
// 1492 앞 버전 없음: 첫 해는 M3_START(1492, 1492년 말 모습). 1492 앞에 성립한 나라(aztec 1428·tarascan 1300·inca 1438)도 첫 버전은 1492부터이고 1491 앞은 M4 몫(빈 땅 검사 구역도 1492부터만).
// 끝 해(이음): 이 파일 표의 주인은 1775까지(M3_END = 1776 = M2 independence.mjs의 M2_START — 아래 확인 줄). 1775 모양 = M2 1776 모양이 원칙(m3/SKEL-NOTE.md 3절 이음 표 — 칸이 그대로 따라 칠함),
//   결정이 만든 1775→1776 바뀜은 주인만 바뀌는 둘 — 13식민지 열한 항목 → usa(1776-07-04)·라플라타 몫 peru-viceroyalty → rio-de-la-plata-viceroyalty(1776-08-01). 모양 점프 0. 그 밖에 1만 km² 넘게 주인이 바뀌면 칸 결과 노트 2절에 까닭.
// 정복기(Q1 A): 같은 계보의 왕령 단위는 항목 from을 사료 성립 해로 앞당겨 칠함 — new-spain-viceroyalty 1521·guatemala-captaincy 1527(칠함 1530)·santo-domingo-captaincy 1492(1496)·cuba-captaincy-general 1511(1515)·
//   peru-viceroyalty 1529(1533). 파나마 1542~1738 peru-viceroyalty, 라플라타 몫 1559부터 M2 1776 모양으로 peru-viceroyalty. 예외 ① 브라질 1500~1548 비움(portuguese-brazil from 1549), 예외 ② 베네수엘라는 M-M3-1
//   (1528~1545 벨저 양허 비움, 1546~1716·1723~1738 카라카스·쿠마나 쪽 new-spain-viceroyalty·메리다·과야나 쪽 peru-viceroyalty, 1717~1722·1739~ new-granada-viceroyalty — 다섯 묶음 C-M3-4).
// 보호지(Q2 C·M-M3-2): indian-reserve(level region, vassal_of uk) 1763~1773 북쪽 몫 → 1774 퀘벡법 province-of-quebec, 켄터키 1763~1767 → 1768 virginia-colony, 테네시 1763~1774 → 1775 north-carolina,
//   미시시피·앨라배마 북위 32°28′ 북쪽 1763~1775 비움(M2 Q-R1과 이어짐).
// 조약·헌장(Q3 A): 상대국이 인정한 조약은 그해부터 안쪽 전부 · 한쪽 문서는 맞선 주장이 없으면 문서 해부터 안쪽 전부(명목이면 mapNote '명목'), 있으면 M1 Q1 (B) · 나눔선(토르데시야스·1750 마드리드)은 쓰지 않음.
//   프랑스령 루이지애나 1712(크로자 특허)·오대호 1701·오하이오 1753 프랑스 색, 조지아 땅 1670~1731 비움, 영국 헌장 '바다에서 바다까지' 서쪽 비움, 브라질 내륙 미나스 1709·고이아스·마투그로수 1746·아마존 1751, 아마파 1713.
// 1492 원주민(Q4 A·C-M3-11·12): 아즈텍 삼각 동맹·타라스코·잉카 셋만 손 도형(나라마다 1492~ 한 버전) — cuts-m3.mjs의 MXC3_CUT_AZTEC·MXC3_CUT_TARASCAN·AND3_CUT_INCA를 칸 머리에서 별칭으로 받아
//   ownSplit(…, { from: M3_START, to: 정복 해 })로 조각을 안/밖으로 가르고, 정복 해(1521·1530·1533)부터 같은 조각을 통째 own 줄로(BOUNDS에 정복 해). muisca·neo-inca-state는 땅 없는 항목(versions 없음).
// 늘림 나라: 없음(권역 파일 EXTENDABLE 그대로 — russia 1778~는 M3 기간 밖, M3 창구 ② 자동 승인 0건). 본국 spain·england(~1706)·uk(1707~)·france·portugal·dutch-republic·denmark-norway는 주인으로 쓰지 않는다 — 관계로만(P2).
// 칸 나눔(부딪침 막기 — 지리 칸 여섯, 두 라운드): 칸 경계는 조각 경계(cuts-m3.mjs M3_*_IDS — 664를 한 번씩)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄('// ── M3 <칸> …')과 그 칸 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·extra 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 NEC3_·SEL3_·NF3_·MXC3_·AND3_·CAB3_, import도 별칭(예: SEL3_K31), ownSplit 묶음 이름도 앞머리(예: 'SEL3_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·확인 줄·빈 땅 검사 구역·끝 void 줄·era)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
// 칸을 넘는 주인 줄(COMMON 4절 '칸을 넘는 항목' — 조각의 own 줄은 그 조각을 가진 칸 하나가 쓰고, 다른 칸 항목을 주인으로 쓸 때 그 항목 글·관계·허용 열쇠는 블록 칸이):
//   french-louisiana·spanish-louisiana(블록 SEL-M3) — NF-M3(US-IL 1712~1762 french-louisiana · US-MN 미시시피 서쪽 1712~ french-louisiana·1762~ spanish-louisiana · CA-AB·CA-SK 북위 49° 북쪽 밀크강 물길 같은 해 — BNW2_CUT_MILK 별칭) ·
//   ruperts-land(블록 NF-M3) — SEL-M3(US-ND·US-SD 레드강 물길 1670~ — US2_CUT_REDRIVER 별칭) · indian-reserve(블록 NF-M3) — SEL-M3(US-KY 1763~1767·US-TN 1763~1774 — M-M3-2) ·
//   new-spain-viceroyalty(블록 MXC-M3) — AND-M3(베네수엘라 카라카스 쪽·쿠마나 쪽 1546(쿠마나는 주 설치 해)~1716·1723~1738, 술리아 1546~1675 — M-M3-1·C-M3-4).
//   그 밖에 칸은 자기 몫이 아닌 조각에 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-m3.mjs에 칸 머리 여섯(뼈대는 새 칼선 0 — 자리 이름만: NF3_CUT_CANSO·MXC3_CUT_AZTEC·MXC3_CUT_TARASCAN·AND3_CUT_INCA·AND3_CUT_CHACAO). 칸이 칼선을 더하면 그 파일 자기 머리 아래 export const <앞머리>_CUT_…으로 쓰고,
//   이 파일 칸 머리에서 import { <앞머리>_CUT_… as <앞머리>_… } from './cuts-m3.mjs'로 가져온다. 앞 단계 M2 칼선(cuts-m2.mjs — FL2_·US2_·BNW2_·BNE2_·SCW2_·SCE2_·ANN2_ …)·M1 칼선·손 도형(cuts-m1.mjs — NA_CUT_GLSM·NA_CUT_75N·SC_CUT_1909·SAN_CUT_1942_PE …)도
//   별칭 import로(예 import { US2_CUT_REDRIVER as SEL3_KRED } from './cuts-m2.mjs'). 좌표를 베끼지 않음(check:generator '파일 사이 좌표 되풀이'). 앞 라운드 칼선 받기는 없음(특별 지시 4).
//   M2 칼선을 1775 앞 해에 다시 쓸 때는 그 선이 그해 문서에 있던 선인지(양쪽 주인이 같은 해에는 가르지 않음 — COMMON 9절, M2 검토 F1).
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(M3_START·M3_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 해마다 다른 모양으로 가르면 기간마다 다른 묶음 이름(M2 BNE2_NL 꼴).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M3_START(1492)부터, 해는 늘어나고 1775 이하(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(['US-VA'], [[M3_START, null], [1607, 'virginia-colony']]) · own(idsOf('CUB'), [[M3_START, null], [1515, 'cuba-captaincy-general']]).
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(칸 voids에 한 줄과 이유 — 정복·정착 앞 원주민 땅·문서 없는 청구·분쟁 띠·1만 km² 미만 속령 섬 등)만.
// 표 밖 땅 extra(id, from, to, { units, shape, name }): 손 도형(조각 밖)과 그 기간 더하는 단위. to는 1776 이하(null은 M3_END). 1492 원주민 손 도형은 조각 안 땅이라 extra가 아니라 ownSplit(C-M3-11).
// 시대 경계 맞물림: 앞 시대 없음(1491 앞은 M4). 뒤 시대 M2 independence.mjs는 1776부터 — 이 파일 버전은 모두 1776 이하에서 끝난다(to: null 없음, 아래 확인 줄). 같은 id(앞 잇는 25 항목)가
//   1775 = 1776 모양이면 joinEras가 두 파일 버전을 이어 붙이고(1776에 버전 경계가 남음 — M2 '1776 <id> 버전' 허용 줄은 사건 검사가 낡았다고 낼 때만 칸이 지움, P6), 모양이 다르면 1776에 갈린다.
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 americas.mjs의 sourceOf가 table.mjs AM_SOURCE_TEXT를 붙인다.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(아메리카 첫판·M1·M2·M3 공통·칸 머리)과 m3/SKEL-NOTE.md 끝 공용 표기표를 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M3_NEC_IDS, M3_SEL_IDS, M3_NF_IDS, M3_MXC_IDS, M3_AND_IDS, M3_CAB_IDS } from './cuts-m3.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('colonial');

const M3_START = 1492; // 이 시대 파일의 첫 해(1492년 말 모습). 그 앞(1491 이하)은 M4 몫
const M3_END = 1776; // 마지막 표의 끝(미포함) = 뒤 시대 M2의 첫 해
const M2_START = 1776; // M2 시대 파일 independence.mjs의 M2_START(그 파일은 export하지 않아 값을 여기 적음 — 둘이 다르면 멈춤)
if (M3_END !== M2_START) throw new Error(`americas colonial: 끝 해 ${M3_END}가 M2 첫 해 ${M2_START}와 다름(시대 경계 맞물림)`);

// ── 조각 소유표 도우미 (M2 independence.mjs와 같은 꼴 — M3 뼈대가 옮김, 이름 M3_START·M3_END만 다름) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M3_START || e[0] >= M3_END)) {
    throw new Error(`americas colonial: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M3_START} 이상 ${M3_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`americas colonial: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M3_START, to = M3_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`americas colonial: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`americas colonial: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`americas colonial: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`americas colonial: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`americas colonial: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형], to는 M3_END 이하(null 없음). 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── 표 밖 땅 (M1·M2 꼴 — 칸 머리에서 부름, 이 도우미는 고치지 않음) ─────────────────────────────
// extra(나라 id, from, to(null = M3_END), { units, shape, name }): 소유표 밖에서 그 기간 그 나라 버전에 더하는 땅.
//   - units: 조각 id·나눈 부분 이름 목록(표 줄과 같은 단위 목록이 이어지면 한 버전)
//   - shape·name: 조각 밖 손 도형(멀티폴리곤 — 바다 쪽은 빌드가 육지와 교차)과 그 이름(칸 앞머리로 — 예 'NF3_…'). 같은 이름은 같은 도형이어야 한다
//   버전 = 그해 표 줄의 단위 ∪ 더하는 단위 ∪ 손 도형(손 도형 하나뿐이면 그 도형 그대로). 버전은 표 줄·더하는 땅의 기간 경계에서 나뉘고 같은 모양이 이어지면 한 버전이다
const extras = [];
const extraShapes = new Map(); // 손 도형 이름 → 도형
const extra = (id, from, to, { units = [], shape = null, name = null } = {}) => {
  const end = to ?? M3_END;
  if (!Number.isInteger(from) || !Number.isInteger(end) || from >= end || from < M3_START || end > M3_END) throw new Error(`americas colonial: ${id}의 표 밖 땅 기간 [${from}, ${to}) (${M3_START} 이상, 끝 ${M3_END} 이하 또는 null)`);
  if (!Array.isArray(units) || (!units.length && !shape)) throw new Error(`americas colonial: ${id}의 표 밖 땅 ${from}~에 단위도 손 도형도 없음`);
  if (shape && !name) throw new Error(`americas colonial: ${id}의 손 도형에 이름이 없음`);
  if (name && !shape) throw new Error(`americas colonial: 손 도형 이름 ${name}에 도형이 없음`);
  if (name && extraShapes.has(name) && extraShapes.get(name) !== shape) throw new Error(`americas colonial: 손 도형 이름 ${name}이 다른 도형에 겹침`);
  if (name) extraShapes.set(name, shape);
  extras.push({ id, from, to: end, units: [...units], name });
};

// ── M3 NEC-M3 뉴잉글랜드·중부 (최상위 이름 NEC3_) ──
// 조각 M3_NEC_IDS(US-NY·US-NJ·US-DE·US-PA·US-MD·US-DC·US-CT·US-MA·US-RI·US-NH·US-ME·US-VT = 12), 구현 NEC-M3(1라운드)
// 항목(새 8): massachusetts-bay [1629, 1776)·connecticut-colony [1636, 1776)·new-hampshire [1679, 1776)·new-netherland [1624, 1664)·province-of-new-york [1664, 1776)·province-of-new-jersey [1664, 1776)·
//   province-of-pennsylvania [1681, 1776)·maryland-colony [1632, 1776). 앞 잇기 없음. 새 칼선 0(조각 통째)
// 1만 km² 미만 식민지(로드아일랜드·델라웨어·뉴스웨덴)는 이웃 색(G3-27), 헌장 땅 G3-10~14(메인 1691 매사추세츠 — G3-11), 버몬트 1763 뉴욕(G3-29), 뉴네덜란드 1624~1663(G3-25 — 1673~1674 재점령은 글), 북미 1492~ 정착 앞 땅 비움(G3-45)
// 이음(1775 = M2 1776): 12조각 통째 — 1776 usa(결정 바뀜: 13식민지 열한 항목 → usa, 모양 같음)
const NEC3_BOUNDS = []; // 조각 통째 줄만 해마다 바뀜(나눈 조각 없음) — 표 경계를 늘리지 않음(M2 US2_BOUNDS 꼴). 버전 해 1624·1629·1632·1636·1641·1664·1679·1681·1682·1691·1763은 주인 줄이 냄
// 칸 조각 확인: 아래 묶음 합이 M3_NEC_IDS 열두 조각과 같아야 함(빠진 조각·남의 조각이 있으면 멈춤)
const NEC3_IDS = ['US-NY', 'US-VT', 'US-NJ', 'US-DE', 'US-PA', 'US-MD', 'US-DC', 'US-CT', 'US-MA', 'US-RI', 'US-NH', 'US-ME'];
if (NEC3_IDS.length !== M3_NEC_IDS.length || NEC3_IDS.some((id) => !M3_NEC_IDS.includes(id))) throw new Error('americas colonial: NEC-M3 조각 묶음이 M3_NEC_IDS와 다름');
// 뉴네덜란드(1624 속주 — 네덜란드 공화국 속주가 된 해, 1614 특허는 3년 교역 독점이라 칠하지 않음) → 1664-08-27 항복 뒤 뉴욕(요크 공작령)·뉴저지(버클리·카터릿에게 넘김).
//   1673-08~1674-11 네덜란드 재점령(1673년 말 네덜란드 손)은 글(G3-25·G3-15 — 1년 한 번, 되돌려진 점령)
own(['US-NY'], [[M3_START, null], [1624, 'new-netherland'], [1664, 'province-of-new-york']]);
own(['US-NJ'], [[M3_START, null], [1624, 'new-netherland'], [1664, 'province-of-new-jersey']]); // 1674~1702 동·서 저지 둘은 한 색(1702 왕령으로 다시 합침)
// 델라웨어(1만 미만 — 이웃 색 G3-27): 뉴스웨덴 1638~1655는 뉴네덜란드 색 안(1655 스타위베산트가 차지), 1664 요크 공작(뉴욕), 1682 펜이 요크 공작에게서 빌린 '하류 세 군'(펜실베이니아 — 1701부터 따로 의회, 총독은 1776까지 같음)
own(['US-DE'], [[M3_START, null], [1624, 'new-netherland'], [1664, 'province-of-new-york'], [1682, 'province-of-pennsylvania']]);
own(['US-PA'], [[M3_START, null], [1681, 'province-of-pennsylvania']]); // 1681-03-04 찰스 2세 헌장(Q3 A ② — 메릴랜드와 맞선 남쪽 띠는 지금 주 경계 = 1767 메이슨 딕슨 선, G16)
own(['US-MD', 'US-DC'], [[M3_START, null], [1632, 'maryland-colony']]); // 1632-06 찰스 1세가 볼티모어 남작에게 준 헌장(첫 정착 1634 세인트메리스시티 — 5만 미만 2년)
own(['US-CT'], [[M3_START, null], [1636, 'connecticut-colony']]); // 1636 하트퍼드·윈저·웨더스필드 정착(1638~1664 뉴헤이븐 식민지는 1662 헌장으로 합침 — 한 색)
// 매사추세츠(1629-03-04 헌장): 로드아일랜드(1636~, 1만 미만)·플리머스(1620~1691)는 이웃 색(G3-27). 뉴햄프셔 마을은 1641 매사추세츠 다스림을 받아들임(1629 메이슨 특허~1640은 비움 — a Z14),
//   1679 찰스 2세 헌장으로 왕령 뉴햄프셔(1686~1689 뉴잉글랜드 자치령은 글). 메인은 1691-10-07 왕령 헌장부터 매사추세츠(G3-11 — 1652 남부 메인 편입·1677~1678 고지스 권리 매입은 글)
own(['US-MA', 'US-RI'], [[M3_START, null], [1629, 'massachusetts-bay']]);
own(['US-NH'], [[M3_START, null], [1641, 'massachusetts-bay'], [1679, 'new-hampshire']]);
own(['US-ME'], [[M3_START, null], [1691, 'massachusetts-bay']]);
own(['US-VT'], [[M3_START, null], [1763, 'province-of-new-york']]); // 1763 파리 조약 뒤 뉴욕 색(G3-29 — 1764-07 국왕 판정이 코네티컷강 서쪽을 뉴욕 땅으로, 1749~1764 뉴햄프셔 특허 땅 다툼은 글)
// 비운 땅: 조각마다 첫 칠하는 해 앞(식민지 앞 원주민 땅 — 레나페·모호크 등 이로쿼이·마히칸·왐파노아그·아베나키·서스쿼해녹. 헌장 '바다에서 바다까지' 서쪽 청구는 Q3 A로 칠하지 않음 — 이 칸 조각 밖)
const NEC3_voids = () => [
  V(M3_START, 1624, 'US-NY', 'US-NJ', 'US-DE'), // 뉴네덜란드 속주 앞(1614~1617 특허 교역소·1621 서인도 회사 헌장은 칠하지 않음)
  V(M3_START, 1629, 'US-MA', 'US-RI'), // 매사추세츠만 헌장 앞(1620~ 플리머스 식민지는 1만 미만)
  V(M3_START, 1632, 'US-MD', 'US-DC'), // 메릴랜드 헌장 앞
  V(M3_START, 1636, 'US-CT'), // 코네티컷 정착 앞(1614 네덜란드 교역소·1633 하우스오브호프 요새는 1만 미만)
  V(M3_START, 1641, 'US-NH'), // 매사추세츠 다스림 앞(1623~ 피스캐터쿼 어촌·1629 메이슨 특허 — a Z14)
  V(M3_START, 1681, 'US-PA'), // 펜실베이니아 헌장 앞(델라웨어강 서안 뉴스웨덴·뉴네덜란드 교역소는 1만 미만)
  V(M3_START, 1691, 'US-ME'), // 매사추세츠 왕령 헌장 앞(G3-11 — 메인 영주 식민지·고지스 권리, 동쪽은 아베나키·프랑스 아카디아와 맞선 땅)
  V(M3_START, 1763, 'US-VT'), // 뉴욕 색 앞(아베나키 땅, 누벨프랑스·뉴욕·뉴햄프셔가 맞선 띠 — M1 Q1 (B) 행정 불분명)
];
// ── M3 NEC-M3 끝 ──

// ── M3 SEL-M3 남부·플로리다·루이지애나 (최상위 이름 SEL3_) ──
// 조각 M3_SEL_IDS(US-VA·US-WV·US-KY·US-TN·US-NC·US-SC·US-GA·US-FL·US-AL·US-MS·US-LA·US-AR·US-MO·US-IA·US-KS·US-NE·US-OK·US-SD·US-ND·US-MT·US-WY·US-CO = 22), 구현 SEL-M3(1라운드)
// 항목(새 6): virginia-colony [1607, 1776)·province-of-carolina [1663, 1712)·north-carolina [1712, 1776)·south-carolina [1712, 1776)·province-of-georgia [1732, 1776)·french-louisiana [1712, 1763).
//   앞 잇기 spanish-louisiana·spanish-florida(첫 버전 1565 — G3-24)·british-florida. 새 칼선 0 — M2 FL2_CUT_31N·FL2_CUT_3228N·FL2_CUT_IBERVILLE·US2_CUT_MISS·US2_CUT_DIVIDE·US2_CUT_REDRIVER·US2_CUT_1819_ARK·US2_CUT_1819_42N 별칭
// 칸을 넘는 주인: indian-reserve(NF 블록 — US-KY 1763~1767·US-TN 1763~1774, M-M3-2) · ruperts-land(NF 블록 — US-ND·US-SD 레드강 물길 1670~)
// 큰 내륙: 루이지애나 1712 크로자 특허부터 french-louisiana(Q3 A), 1762 퐁텐블로 조약 땅 전체 spanish-louisiana(M-M2-2 — 서쪽 끝 1819 선, G3-3), 조지아 땅 1670~1731 비움(G3-13), 헌장 '바다에서 바다까지' 서쪽 비움,
//   미시시피·앨라배마 32°28′ 북쪽 1763~1775 비움(M-M3-2·M2 Q-R1), 31°~32°28′ 띠는 1763 하나만 31°(3년 미만 — 나누지 않음, COMMON 9절)
// 이음(1775 = M2 1776): usa 통째 7(US-VA·WV·KY·TN·NC·SC·GA — 1775는 식민지 항목으로) · spanish-louisiana 통째 5(US-AR·MO·IA·NE·SD) + 나뉨 US-LA·KS·OK·ND·MT·WY·CO · british-florida US-FL 통째 + US-AL·MS 31°~32°28′ 남·US-LA 동쪽 ·
//   ruperts-land US-ND·US-SD 레드강 물길 · 빈 땅 약 48만(US-AL·MS 32°28′ 북·1819 선 밖 평원 서쪽)
import { FL2_CUT_3228N as SEL3_K3228, FL2_CUT_IBERVILLE as SEL3_KIBV } from './cuts-m2.mjs';
import { US2_CUT_DIVIDE as SEL3_KDIV, US2_CUT_REDRIVER as SEL3_KRED, US2_CUT_1819_ARK as SEL3_KARK, US2_CUT_1819_42N as SEL3_K42N } from './cuts-m2.mjs';
// 표 경계 해: 1670(허드슨 베이 회사 헌장 — 레드강 물길을 가름)·1712(크로자 특허 — 루이지애나 서쪽 끝 1819 선 모양, G3-3·M-M2-2)·
//   1762(퐁텐블로 조약 — 이버빌강·호수 선으로 오를레앙섬을 가름)·1763(서플로리다 북 경계 32°28′ — 1764 칙령, 1763 한 해의 31°는 3년 미만이라 나누지 않음)
const SEL3_BOUNDS = [1670, 1712, 1762, 1763];
{ // 칸 안 확인: 이 칸이 쓰는 조각 = M3_SEL_IDS(22)
  const mine = [...['US-VA', 'US-WV', 'US-KY', 'US-TN', 'US-NC', 'US-SC', 'US-GA', 'US-FL'], ...['US-MS', 'US-AL', 'US-LA'], ...['US-AR', 'US-MO', 'US-IA', 'US-NE'],
    ...['US-KS', 'US-OK', 'US-CO', 'US-WY', 'US-MT', 'US-ND', 'US-SD']];
  if (mine.length !== M3_SEL_IDS.length || new Set(mine).size !== mine.length || mine.some((id) => !M3_SEL_IDS.includes(id))) throw new Error('americas colonial: SEL-M3 조각 목록이 M3_SEL_IDS와 다름');
}
// 1712 크로자 특허부터 프랑스령 루이지애나, 1762-11-03 퐁텐블로 조약으로 미시시피강 서쪽과 오를레앙섬을 스페인에(M-M2-2 — 스페인 실효 인수 1769는 글)
const SEL3_LOUISIANA = [[M3_START, null], [1712, 'french-louisiana'], [1762, 'spanish-louisiana']];
// 영국 식민지(헌장 땅은 지금 주 조각까지 — 헌장 '바다에서 바다까지' 서쪽은 청구라 비움, G3-10)
own(['US-VA', 'US-WV'], [[M3_START, null], [1607, 'virginia-colony']]); // 1606 헌장·1607-05 제임스타운
own(['US-KY'], [[M3_START, null], [1763, 'indian-reserve'], [1768, 'virginia-colony']]); // 1763-10-07 왕실 선언 보호지, 1768-11-05 스탠윅스 요새 조약으로 오하이오강 남쪽을 내줌(M-M3-2)
own(['US-TN'], [[M3_START, null], [1763, 'indian-reserve'], [1775, 'north-carolina']]); // 1775-03 시카모어숄스 매입·왓터가 정착지 — 노스캐롤라이나 헌장 땅(M-M3-2)
own(['US-NC'], [[M3_START, null], [1663, 'province-of-carolina'], [1712, 'north-carolina']]); // 1663-03-24 헌장(G3-12), 1712 남북 갈림
own(['US-SC'], [[M3_START, null], [1663, 'province-of-carolina'], [1712, 'south-carolina']]);
own(['US-GA'], [[M3_START, null], [1732, 'province-of-georgia']]); // 1732 헌장 — 1670~1731은 영국·스페인이 맞선 땅이라 비움(Q3 A·G3-12)
own(['US-FL'], [[M3_START, null], [1565, 'spanish-florida'], [1763, 'british-florida']]); // 1565-09 세인트오거스틴(G3-24 — 1513 발견은 청구), 1763 파리 조약
// 미시시피·앨라배마: 1712~1762 통째 프랑스령 루이지애나(모빌 1702 수도), 1763부터 32°28′ 남쪽 영국령 서플로리다·북쪽 보호지 남쪽 끝(이름으로 가리킨 영국 식민 단위 없음 — M-M3-2·M2 Q-R1)
own(['US-MS', 'US-AL'], [[M3_START, null], [1712, 'french-louisiana']]);
const SEL3_MSAL = ownSplit('SEL3_MSAL', ['US-MS', 'US-AL'], [['남', SEL3_K3228]], '북', {
  남: [[1763, 'british-florida']], // 1763 파리 조약 7조로 모빌·미시시피강 동쪽을 영국에 — 서플로리다
  북: [[1763, null]],
}, { from: 1763, to: M3_END });
// 루이지애나: 1762 말 오를레앙섬(이버빌강·모르파·폰차트레인 호수 남쪽)과 강 서쪽은 스페인, 동쪽 플로리다 교구는 1762 말까지 프랑스·1763 영국령 서플로리다
own(['US-LA'], [[M3_START, null], [1712, 'french-louisiana']]);
ownSplit('SEL3_LA', ['US-LA'], [['동', SEL3_KIBV]], '서', {
  동: [[1762, 'french-louisiana'], [1763, 'british-florida']],
  서: [[1762, 'spanish-louisiana']],
}, { from: 1762, to: M3_END });
own(['US-AR', 'US-MO', 'US-IA', 'US-NE'], SEL3_LOUISIANA);
// 대평원: 1712부터 루이지애나 서쪽 끝(1819 선·로키산맥 분수령 — M2 1776 모양과 같은 선, G3-3), 그 밖은 누에바에스파냐 북부 내륙·오리건 쪽이라 내내 비움(G3-41)
own(['US-KS', 'US-OK', 'US-CO', 'US-WY', 'US-MT'], [[M3_START, null]]);
for (const id of ['US-KS', 'US-OK']) ownSplit(`SEL3_${id.slice(3)}`, [id], [['서남', SEL3_KARK]], '루이지애나', { 서남: [[1712, null]], 루이지애나: [[1712, 'french-louisiana'], [1762, 'spanish-louisiana']] }, { from: 1712, to: M3_END });
ownSplit('SEL3_CO', ['US-CO'], [['텍사스청구', SEL3_KARK], ['서쪽', SEL3_K42N]], '루이지애나', { 텍사스청구: [[1712, null]], 서쪽: [[1712, null]], 루이지애나: [[1712, 'french-louisiana'], [1762, 'spanish-louisiana']] }, { from: 1712, to: M3_END });
ownSplit('SEL3_WY', ['US-WY'], [['서남', SEL3_K42N], ['서쪽', SEL3_KDIV]], '동쪽', { 서남: [[1712, null]], 서쪽: [[1712, null]], 동쪽: [[1712, 'french-louisiana'], [1762, 'spanish-louisiana']] }, { from: 1712, to: M3_END });
ownSplit('SEL3_MT', ['US-MT'], [['서쪽', SEL3_KDIV]], '동쪽', { 서쪽: [[1712, null]], 동쪽: [[1712, 'french-louisiana'], [1762, 'spanish-louisiana']] }, { from: 1712, to: M3_END });
// 다코타: 레드강 물길은 1670 허드슨 베이 회사 헌장 땅(ruperts-land — NF 블록), 미주리강 물길은 루이지애나
own(['US-ND', 'US-SD'], [[M3_START, null]]);
for (const id of ['US-ND', 'US-SD']) ownSplit(`SEL3_${id.slice(3)}`, [id], [['레드강', SEL3_KRED]], '미주리강', { 레드강: [[1670, 'ruperts-land']], 미주리강: [[1670, null], [1712, 'french-louisiana'], [1762, 'spanish-louisiana']] }, { from: 1670, to: M3_END });
const SEL3_voids = () => [
  V(M3_START, 1565, 'US-FL'), // 1565 세인트오거스틴 앞 — 1513 폰세 데 레온 발견·이름 붙임은 청구뿐, 원주민 티무쿠아·칼루사 땅
  V(M3_START, 1607, 'US-VA', 'US-WV'), // 1607 제임스타운 앞 — 포와탄 연맹 등 원주민 땅(로어노크 1585~1590은 1만 km² 미만·사라짐)
  V(M3_START, 1663, 'US-NC', 'US-SC'), // 1663 캐롤라이나 헌장 앞 — 원주민 땅
  V(M3_START, 1732, 'US-GA'), // 1732 조지아 헌장 앞 — 1670~1731은 캐롤라이나 헌장(31°)과 스페인 과레 선교가 맞선 땅이라 비움(Q3 A ②·G3-12)
  V(M3_START, 1763, 'US-KY', 'US-TN'), // 1763 왕실 선언 앞 — 버지니아·캐롤라이나 헌장 서쪽 청구(G3-10), 쇼니·체로키 땅
  V(M3_START, 1712, 'US-MS', 'US-AL', 'US-LA', 'US-AR', 'US-MO', 'US-IA', 'US-NE', 'US-KS', 'US-OK', 'US-CO', 'US-WY', 'US-MT'), // 1712 크로자 특허 앞 — 1682 라살 선언은 청구, 빌럭시 1699·모빌 1702는 1만 km² 미만(장부 후보 4)
  V(M3_START, 1670, 'US-ND', 'US-SD'), // 1670 허드슨 베이 회사 헌장 앞 — 원주민 땅
  B(1670, 1712, 'SEL3_ND/미주리강', 'SEL3_SD/미주리강'), // 1712 크로자 특허 앞 미주리강 물길 — 원주민 땅
  B(1712, M3_END, 'SEL3_KS/서남', 'SEL3_OK/서남', 'SEL3_CO/텍사스청구', 'SEL3_CO/서쪽', 'SEL3_WY/서남', 'SEL3_WY/서쪽', 'SEL3_MT/서쪽'), // 루이지애나 서쪽 끝 밖 — 누에바에스파냐 북부 내륙·오리건 쪽 문서 없는 청구(코만치·쇼쇼니 땅, G3-41·M2 1776 비움과 이음)
  B(1763, M3_END, SEL3_MSAL['북']), // 미시시피·앨라배마 32°28′ 북쪽: 1763 왕실 선언 보호지 남쪽 끝 — 이름으로 가리킨 영국 식민 단위 없는 촉토·치카소·크리크 땅(M-M3-2·M2 Q-R1과 이음)
];
// ── M3 SEL-M3 끝 ──

// ── M3 NF-M3 누벨프랑스·허드슨만·오대호·북동 (최상위 이름 NF3_) ──
// 조각 M3_NF_IDS(캐나다 13·그린란드 6·US-OH·US-IN·US-IL·US-MI·US-WI·US-MN·US-AK·RU-CHU = 27), 구현 NF-M3(1라운드)
// 항목(새 4): new-france-canada [1608, 1763)·acadia [1632, 1713)·ile-royale [1713, 1758)·indian-reserve [1763, 1775)(level region — C-M3-5). 앞 잇기 province-of-quebec·nova-scotia·ruperts-land·newfoundland·greenland
// 칼선 자리(cuts-m3.mjs NF-M3 머리): NF3_CUT_CANSO(캔소 해협 — CA-NS). M2 BNW2_CUT_HBS·BNW2_CUT_HBW·BNW2_CUT_ARCTIC·BNW2_CUT_MILK·BNE2_CUT_BELLEISLE·US2_CUT_REDRIVER·US2_CUT_RAINY·US2_CUT_MISS, M1 NA_CUT_GLSM·NA_CUT_75N 별칭
// 칸을 넘는 주인: french-louisiana·spanish-louisiana(SEL 블록 — US-IL 1712~1762·US-MN 미시시피 서쪽 1712~/1762~·CA-AB·CA-SK 밀크강 물길 1712~/1762~)
// 1774 퀘벡법 → province-of-quebec(Q2 C), 래브라도 1763~1773 newfoundland·1774~ province-of-quebec(G3-30), 뉴펀들랜드 섬 1610~, 그린란드 서·남 1721~(G3-23), 알래스카·추코트카 비움(G3-22), 허드슨만 프랑스 요새 근사(G3-28), 오대호 1701·오하이오 1753(Q3 A)
// 이음(1775 = M2 1776): ruperts-land CA-MB 통째 + CA-AB·NT·NU·ON·QC·SK·US-MN 허드슨만 물길 · province-of-quebec 통째 5(US-OH·IN·IL·MI·WI) + CA-NL 래브라도·CA-ON·CA-QC 남쪽·US-MN 동쪽 ·
//   greenland GL-KU·GL-QE 통째 + GL-QA·GL-SM 서·남 · nova-scotia CA-NB·CA-NS 통째 · spanish-louisiana US-MN 서쪽·CA-AB·CA-SK 밀크강 · newfoundland CA-NL 섬 · 빈 땅 약 853만(북서·알래스카·추코트카·그린란드 동·북·CA-PE)
const NF3_BOUNDS = [1713, 1758]; // 케이프브레턴섬 가름(NF3_NS — 캔소 해협)을 쓰는 기간: 1713 위트레흐트 조약(일루아얄) ~ 1758 루이스버그 함락. 그 앞뒤는 CA-NS 조각 통째(M2 1776과 같은 모양)
import { NF3_CUT_CANSO as NF3_KCANSO } from './cuts-m3.mjs';
import { BNW2_CUT_HBS as NF3_K9, BNW2_CUT_HBW as NF3_K10, BNW2_CUT_ARCTIC as NF3_K12, BNW2_CUT_MILK as NF3_KMILK, BNE2_CUT_BELLEISLE as NF3_KBI, US2_CUT_MISS as NF3_KMISS, US2_CUT_REDRIVER as NF3_KRED, US2_CUT_RAINY as NF3_KRAINY } from './cuts-m2.mjs';
import { NA_CUT_GLSM as NF3_KGLSM, NA_CUT_75N as NF3_K75N } from './cuts-m1.mjs';
// 조각 묶음(합 27 — M3_NF_IDS와 같은지 아래 확인)
const NF3_NW_SPLIT = ['CA-SK', 'CA-AB', 'CA-NT', 'CA-NU']; // 허드슨만 분수령·북극 제도·밀크강이 지나는 조각(M2 BNW2_N과 같은 가름)
const NF3_EMPTY = ['CA-YT', 'CA-BC', 'CA-PE', 'GRL-2742', 'GRL-2738', 'US-AK', 'RU-CHU']; // 시대 내내 비움
const NF3_GL_WS = ['GL-KU', 'GL-QE']; // 그린란드 남부·서부 통째
const NF3_LAKES = ['US-MI', 'US-WI']; // 오대호 서쪽(미시간·위스콘신)
const NF3_OHIO = ['US-OH', 'US-IN']; // 오하이오 영토(오하이오·인디애나)
// 주인 줄(그해 말). 허드슨만 물길: 1670-05-02 허드슨 베이 회사 헌장(Q3 A ① — 1713 위트레흐트 조약으로 프랑스도 인정, 1686~1713 프랑스 요새는 1만 km² 미만 근사 G3-28)
const NF3_HB = [[M3_START, null], [1670, 'ruperts-land']];
// 오대호 남·북안(온타리오 남부·미시간·위스콘신·미네소타 미시시피 동쪽): 1701 디트로이트(퐁샤르트랭 요새)·몽트리올 대평화부터 프랑스 색(Q3 A ② — 행정·정착이 분명한 쪽),
//   1760 몬트리올 항복·1763-02-10 파리 조약 뒤 1763-10-07 왕실 선언의 인디언 보호지(Q2 C), 1774-06-22 퀘벡 법으로 퀘벡 주(M2 1776과 이음)
const NF3_GREAT_LAKES = [[M3_START, null], [1701, 'new-france-canada'], [1763, 'indian-reserve'], [1774, 'province-of-quebec']];
const NF3_LOUISIANA = [[M3_START, null], [1712, 'french-louisiana'], [1762, 'spanish-louisiana']]; // 1712 크로자 특허(Q3 A — 일리노이를 루이지애나에 넣음) → 1762-11-03 퐁텐블로 조약(M-M2-2 — 블록 SEL-M3)
// 퀘벡·온타리오: 허드슨만 물길 고리(M2 BNW2_CUT_HBS — 안 = 북쪽 물길)로 물길/남. 퀘벡 남쪽(세인트로렌스강 물길)은 1608 퀘벡 건설부터 누벨프랑스, 1763 퀘벡 주
const NF3_QC = ownSplit('NF3_QC', ['CA-QC'], [['물길', NF3_K9]], '남', { 물길: NF3_HB, 남: [[M3_START, null], [1608, 'new-france-canada'], [1763, 'province-of-quebec']] });
const NF3_ON = ownSplit('NF3_ON', ['CA-ON'], [['물길', NF3_K9]], '남', { 물길: NF3_HB, 남: NF3_GREAT_LAKES });
// 아카디아(G3-31): 1632 생제르맹앙레 조약으로 잉글랜드가 돌려준 뒤 반도·케이프브레턴·지금 뉴브런즈윅 전부(1654~1670 잉글랜드 점령은 1667 브레다 조약으로 돌려준 점령이라 글 — G3-13·15).
//   1713 위트레흐트 조약: 반도는 노바스코샤, 케이프브레턴섬은 일루아얄(캔소 해협 칼선), 뉴브런즈윅은 '옛 경계' 해석이 갈린 땅이라 1713~1757 비움(G3-14). 1758 루이스버그·세인트존강 점령(1763 파리 조약 확인)부터 노바스코샤
own(['CA-NS'], [[M3_START, null], [1632, 'acadia']]);
ownSplit('NF3_NS', ['CA-NS'], [['섬', NF3_KCANSO]], '반도', { 섬: [[1713, 'ile-royale']], 반도: [[1713, 'nova-scotia']] }, { from: 1713, to: 1758 });
own(['CA-NS'], [[1758, 'nova-scotia']]);
own(['CA-NB'], [[M3_START, null], [1632, 'acadia'], [1713, null], [1758, 'nova-scotia']]);
// 뉴펀들랜드·래브라도(벨아일 해협 — M2 BNE2_CUT_BELLEISLE, 안 = 래브라도 본토): 섬은 1610 상인 회사 정착 식민지부터(플레장스 1662~1713 프랑스 정착지는 1만 km² 미만 근사 — G3-28),
//   본토는 1763 왕실 선언이 래브라도 해안을 뉴펀들랜드 총독 관할에 넣고 1774 퀘벡 법이 퀘벡 주로 옮김(G3-30 — M2 Q-R2 1776~1790 퀘벡 주와 이음)
const NF3_NL = ownSplit('NF3_NL', ['CA-NL'], [['본토', NF3_KBI]], '섬', { 본토: [[M3_START, null], [1763, 'newfoundland'], [1774, 'province-of-quebec']], 섬: [[M3_START, null], [1610, 'newfoundland']] });
// 캐나다 서쪽: 매니토바 통째는 허드슨만 물길, 나눈 조각은 M2와 같은 가름(제도 → 밀크 → 물길 → 물길밖)
own(['CA-MB'], NF3_HB);
const NF3_N = ownSplit('NF3_N', NF3_NW_SPLIT, [['제도', NF3_K12], ['밀크', NF3_KMILK], ['물길', NF3_K10]], '물길밖', {
  제도: [[M3_START, null]], // 북극 제도 — 1880 추밀원령 앞은 청구뿐(M2와 같음)
  밀크: NF3_LOUISIANA, // 49°선 북쪽 미주리강 물길(밀크강) — 루이지애나 땅(M2 반영 F1 모양, 1762 퐁텐블로 조약 땅 = 1712 크로자 특허 땅)
  물길: NF3_HB,
  물길밖: [[M3_START, null]], // 매켄지강·유콘강 물길 — 1821 허드슨 베이 회사 독점 허가 앞은 문서 없는 교역(M2와 같음)
});
// 미국 오대호·오하이오 땅. 오하이오·인디애나는 1753 프레스크일·르뵈프 요새(오하이오강으로 가는 요새망 — 위키 en Fort Presque Isle)부터 프랑스 색(Q3 A — 1758~1759 요새를 잃었으나 1760 항복·1763 조약까지 한 색)
own(NF3_OHIO, [[M3_START, null], [1753, 'new-france-canada'], [1763, 'indian-reserve'], [1774, 'province-of-quebec']]);
own(NF3_LAKES, NF3_GREAT_LAKES);
own(['US-IL'], [[M3_START, null], [1712, 'french-louisiana'], [1763, 'indian-reserve'], [1774, 'province-of-quebec']]); // 일리노이 컨트리 — 1712 루이지애나에 들어감(블록 SEL-M3), 1763 파리 조약 7조로 영국
// 미네소타: M2 US2_MN과 같은 가름(레드강 → 레이니강 → 미시시피 동쪽 → 서쪽)
const NF3_MN = ownSplit('NF3_MN', ['US-MN'], [['레드강', NF3_KRED], ['레이니강', NF3_KRAINY], ['동쪽', NF3_KMISS]], '서쪽', { 레드강: NF3_HB, 레이니강: NF3_HB, 동쪽: NF3_GREAT_LAKES, 서쪽: NF3_LOUISIANA });
// 그린란드(G3-23): 1492 노르드 정착은 이미 없음, 1721 한스 에게데 정착부터 서·남 해안(M1 그린란드 동쪽 가름·북위 75° — M2와 같은 모양), 동·북은 1933 판결 앞이라 비움
own(NF3_GL_WS, [[M3_START, null], [1721, 'greenland']]);
const NF3_GLSM = ownSplit('NF3_GLSM', ['GL-SM'], [['동쪽', NF3_KGLSM]], '서쪽', { 동쪽: [[M3_START, null]], 서쪽: [[M3_START, null], [1721, 'greenland']] });
const NF3_GLQA = ownSplit('NF3_GLQA', ['GL-QA'], [['북쪽', NF3_K75N]], '남쪽', { 북쪽: [[M3_START, null]], 남쪽: [[M3_START, null], [1721, 'greenland']] });
own(NF3_EMPTY, [[M3_START, null]]); // 유콘·브리티시컬럼비아·알래스카·추코트카(G3-22 — 러시아령 아메리카 1799~)·북동 그린란드·피투피크·프린스에드워드섬(1만 km² 미만)
{ // 칸 안 확인: 칸 몫 조각 27을 한 번씩 다 씀
  const used = ['CA-QC', 'CA-ON', 'CA-NS', 'CA-NB', 'CA-NL', 'CA-MB', ...NF3_NW_SPLIT, ...NF3_OHIO, ...NF3_LAKES, 'US-IL', 'US-MN', ...NF3_GL_WS, 'GL-SM', 'GL-QA', ...NF3_EMPTY];
  if (used.length !== M3_NF_IDS.length || new Set(used).size !== used.length || used.some((id) => !M3_NF_IDS.includes(id)) || !idsOf('CAN', 'GRL').every((id) => used.includes(id))) throw new Error(`americas colonial: NF-M3 칸 조각 ${used.length}개가 M3_NF_IDS ${M3_NF_IDS.length}개와 다름`);
}
const NF3_voids = () => [
  B(M3_START, 1670, NF3_QC.물길, NF3_ON.물길, NF3_N.물길, NF3_MN.레드강, NF3_MN.레이니강), // 허드슨만 물길 — 1670 허드슨 베이 회사 헌장 앞(문서 없는 원주민 땅)
  V(M3_START, 1670, 'CA-MB'), // 같은 까닭
  B(M3_START, 1608, NF3_QC.남), // 세인트로렌스강 물길 — 1608 퀘벡 건설 앞(1534 카르티에 탐험은 정착이 아님)
  B(M3_START, 1701, NF3_ON.남, NF3_MN.동쪽), // 오대호 북안·미시시피 동쪽 — 1701 디트로이트 건설 앞(교역·선교만)
  V(M3_START, 1701, ...NF3_LAKES), // 같은 까닭(미시간·위스콘신)
  V(M3_START, 1753, ...NF3_OHIO), // 오하이오 영토 — 1753 프랑스 요새망 앞(영국 헌장 '바다에서 바다까지'는 청구라 칠하지 않음 — Q3 A)
  V(M3_START, 1712, 'US-IL'), // 일리노이 컨트리 — 1712 크로자 특허 앞(1699 카호키아 선교 등은 1만 km² 미만)
  B(M3_START, 1712, NF3_MN.서쪽, NF3_N.밀크), // 미시시피 서쪽 미네소타·밀크강 물길 — 루이지애나 특허 앞
  V(M3_START, 1632, 'CA-NS', 'CA-NB'), // 아카디아 — 1632 생제르맹앙레 조약 앞(1604 생크루아·1605 포르루아얄 정착과 1621 스코틀랜드 노바스코샤 헌장이 맞섬 — Q3 A ②)
  V(1713, 1758, 'CA-NB'), // 뉴브런즈윅 — 위트레흐트 조약 '옛 경계'를 영국·프랑스가 달리 읽은 분쟁 땅(G3-14)
  B(M3_START, 1610, NF3_NL.섬), // 뉴펀들랜드섬 — 1610 정착 식민지 앞(어장 철 머묾)
  B(M3_START, 1763, NF3_NL.본토), // 래브라도 본토 — 1763 왕실 선언 앞(문서 없는 땅)
  B(M3_START, M3_END, NF3_N.제도, NF3_N.물길밖), // 북극 제도·허드슨만 물길 밖 북서 본토 — 문서 없는 청구(M2 1776과 이음)
  V(M3_START, M3_END, ...NF3_EMPTY), // 유콘·브리티시컬럼비아·알래스카·추코트카·북동 그린란드·피투피크(문서 없는 땅), 프린스에드워드섬(생장섬 — 1만 km² 미만)
  V(M3_START, 1721, ...NF3_GL_WS), // 그린란드 서·남 — 1721 에게데 정착 앞(노르드 정착은 15세기에 끊김)
  B(M3_START, 1721, NF3_GLSM.서쪽, NF3_GLQA.남쪽), // 같은 까닭
  B(M3_START, M3_END, NF3_GLSM.동쪽, NF3_GLQA.북쪽), // 그린란드 동·북 — 1933 판결 앞(M2와 같음)
];
// ── M3 NF-M3 끝 ──

// ── M3 MXC-M3 멕시코·중앙아메리카·1492 두 나라 (최상위 이름 MXC3_) ──
// 조각 M3_MXC_IDS(멕시코 32·US-TX·US-NM·US-AZ·US-CA·US-NV·US-UT·US-OR·US-WA·US-ID·과테말라 22·벨리즈 6·온두라스 18·엘살바도르 14·니카라과 17·코스타리카 7 = 125), 구현 MXC-M3(2라운드)
// 항목(새 2): aztec [1492, 1521)·tarascan [1492, 1530) — 손 도형. 앞 잇기 new-spain-viceroyalty(from 1521)·yucatan-captaincy·guatemala-captaincy(from 1527, 칠함 1530)·mosquito-kingdom
// 칼선 자리(cuts-m3.mjs MXC-M3 머리): MXC3_CUT_AZTEC·MXC3_CUT_TARASCAN(손 도형 — ownSplit { from: M3_START, to: 1521 / 1530 }, BOUNDS에 1521·1530). M2 US2_CUT_1848 별칭
// 칸을 넘는 주인: 이 칸 조각에는 없음 — new-spain-viceroyalty 줄을 AND-M3가 베네수엘라에 씀(M-M3-1, 블록 글은 이 칸 — 베네수엘라 동쪽 한 구절)
// 북부(G3-3 — 텍사스 1716·뉴멕시코 1598·캘리포니아 1769·애리조나 힐라강 남쪽 — 칸이 사료로 1687·소노라 1614·시날로아 1531로 닫음, 결과 노트 2절 ※ 표), 사빈강 1716(G3-4), 푸에블로 반란 명목(G3-16), 모스키토 해안 1543~1739 과테말라 명목·1740~ mosquito-kingdom(G3-17·18), G3-39~42
// 이음(1775 = M2 1776): new-spain-viceroyalty 통째 31(멕시코 28·US-TX·NM·CA) + US-AZ 남쪽 · guatemala-captaincy 통째 82(MX-CHP 포함) · yucatan-captaincy MX-CAM·ROO·YUC · mosquito-kingdom HN-GD·NI-AN·NI-AS ·
//   빈 땅 약 138만(US-AZ 북·NV·UT·OR·WA·ID)
import { US2_CUT_1848 as MXC3_K7 } from './cuts-m2.mjs';
import { MXC3_CUT_AZTEC as MXC3_AZTEC, MXC3_CUT_TARASCAN as MXC3_TARASCAN } from './cuts-m3.mjs';
const MXC3_BOUNDS = [1521, 1530, 1687]; // 1521 아즈텍 함락·1530 타라스코 정복(손 도형을 쓰는 기간 끝) · 1687 피메리아알타(힐라강 남쪽) 선교 시작 — 그 앞은 애리조나 통째 비움
const MXC3_NS = 'new-spain-viceroyalty';
const MXC3_GT = 'guatemala-captaincy';
// 조각 묶음(합 125 — 아래 확인 줄)
const MXC3_AZ_WHOLE = ['MX-DIF', 'MX-MOR', 'MX-TLA']; // 아즈텍 도형 안에 통째(멕시코 계곡·모렐로스·틀락스칼라 — G3-39)
const MXC3_AZ_PART = ['MX-HID', 'MX-PUE', 'MX-VER', 'MX-OAX']; // 아즈텍 도형이 지나는 조각(Z-A)
const MXC3_BOTH = ['MX-MEX', 'MX-GRO']; // 아즈텍·타라스코 두 도형이 함께 지나는 조각(Z-A — 톨루카 계곡 서쪽 끝·게레로 티에라칼리엔테)
const MXC3_TA_PART = ['MX-MIC', 'MX-JAL', 'MX-GUA']; // 타라스코 도형이 지나는 조각(Z-B)
const MXC3_ZB_REST = ['MX-COL', 'MX-NAY', 'MX-QUE', 'MX-AGU', 'MX-TAB']; // 서부·바히오 나머지와 타바스코 — 1530 누에바갈리시아 정복·타바스코(b 2절 7·9)
// 북부: 그 단위를 세운 해(조각 통째 — 설치 문서·첫 정착, Q3 ②·G3-3·G3-42). 결과 노트 2절 ※ 표
const MXC3_NORTH = {
  'MX-SIN': 1531, // 1531-09-29 산미겔데쿨리아칸 — 누에바갈리시아의 쿨리아칸 주(위키 en Culiacán)
  'MX-ZAC': 1546, // 1546 사카테카스 은광
  'MX-DUR': 1562, 'MX-CHH': 1562, // 1562 이바라의 누에바비스카야
  'MX-NLE': 1582, 'MX-COA': 1582, // 1582 누에보레온 왕국
  'MX-SLP': 1592, // 1592 세로데산페드로 은광·11-03 산루이스포토시 법적 설립(위키 en San Luis Potosí)
  'US-NM': 1598, // 1598-07 오냐테 — 1680~1692 푸에블로 반란도 명목 칠함(총독 정부가 엘파소에 남음 — G3-16)
  'MX-SON': 1614, // 1614 소노라 남부 첫 예수회 선교(위키 en History of Sonora — 1637 누에바안달루시아 주)
  'MX-BCN': 1697, 'MX-BCS': 1697, // 1697 로레토 선교
  'US-TX': 1716, // 1716 동텍사스 선교 재건 — 동쪽 끝 사빈강 = 조각 경계(G3-4)
  'MX-TAM': 1747, // 1747 에스칸돈의 누에보산탄데르
  'US-CA': 1769, // 1769 알타칼리포르니아 해안 선교 — 명목(M2 Q-R4와 이음)
};
const MXC3_YUC = ['MX-YUC', 'MX-CAM', 'MX-ROO']; // 유카탄 반도 — 1546 북부 정복 끝, 1617 총사령부
const MXC3_WEST = ['US-NV', 'US-UT', 'US-OR', 'US-WA', 'US-ID']; // 그레이트베이슨·북서 — 내내 비움(G3-41·M2 1776 비움과 이음)
const MXC3_MOS = ['HN-GD', 'NI-AN', 'NI-AS']; // 모스키토 해안
const MXC3_GT_PE = ['GT-PE']; // 페텐 — 이차 왕국(노헤페텐) 1697-03 항복 앞 비움(Q4 A)
const MXC3_BZ = idsOf('BLZ'); // 벨리즈 6 — 1543 아우디엔시아 관할 명목(G3-40)
const MXC3_CR = idsOf('CRI'); // 코스타리카 7 — 1563 카르타고(위키 en Cartago, Costa Rica)
const MXC3_CA5 = [...idsOf('GTM').filter((id) => !MXC3_GT_PE.includes(id)), ...idsOf('SLV'), ...idsOf('HND').filter((id) => !MXC3_MOS.includes(id)), ...idsOf('NIC').filter((id) => !MXC3_MOS.includes(id))]; // 과테말라 21·엘살바도르 14·온두라스 17·니카라과 15
{
  const all = [...MXC3_AZ_WHOLE, ...MXC3_AZ_PART, ...MXC3_BOTH, ...MXC3_TA_PART, ...MXC3_ZB_REST, ...Object.keys(MXC3_NORTH), ...MXC3_YUC, 'MX-CHP', 'US-AZ', ...MXC3_WEST, ...MXC3_MOS, ...MXC3_GT_PE, ...MXC3_BZ, ...MXC3_CR, ...MXC3_CA5];
  if (all.length !== M3_MXC_IDS.length || new Set(all).size !== all.length || all.some((id) => !M3_MXC_IDS.includes(id))) throw new Error(`americas colonial MXC-M3: 칸 조각 ${all.length}개(M3_MXC_IDS ${M3_MXC_IDS.length}개와 같아야 함)`);
}
// 1492 원주민 두 나라(Q4 A·C-M3-11): 1492~1520 아즈텍 도형 안 = aztec(1521-08-13 테노치티틀란 함락), 1492~1529 타라스코 도형 안 = tarascan(1530-02 타앙가샨 2세 처형)
own(MXC3_AZ_WHOLE, [[M3_START, 'aztec'], [1521, MXC3_NS]]);
const MXC3_A = ownSplit('MXC3_AZ', MXC3_AZ_PART, [['아즈텍', MXC3_AZTEC]], '밖', { 아즈텍: [[M3_START, 'aztec']], 밖: [[M3_START, null]] }, { from: M3_START, to: 1521 });
own(MXC3_AZ_PART, [[1521, MXC3_NS]]); // 1521 누에바에스파냐 왕국(1535 부왕령 — 이름 줄)
const MXC3_B1 = ownSplit('MXC3_BOTH1', MXC3_BOTH, [['아즈텍', MXC3_AZTEC], ['타라스코', MXC3_TARASCAN]], '밖', {
  아즈텍: [[M3_START, 'aztec']], 타라스코: [[M3_START, 'tarascan']], 밖: [[M3_START, null]],
}, { from: M3_START, to: 1521 });
ownSplit('MXC3_BOTH2', MXC3_BOTH, [['타라스코', MXC3_TARASCAN]], '밖', { 타라스코: [[1521, 'tarascan']], 밖: [[1521, MXC3_NS]] }, { from: 1521, to: 1530 });
own(MXC3_BOTH, [[1530, MXC3_NS]]);
const MXC3_T = ownSplit('MXC3_TA', MXC3_TA_PART, [['타라스코', MXC3_TARASCAN]], '밖', { 타라스코: [[M3_START, 'tarascan']], 밖: [[M3_START, null]] }, { from: M3_START, to: 1530 });
own(MXC3_TA_PART, [[1530, MXC3_NS]]); // 1530 타라스코 정복·누에바갈리시아(구스만)
own(MXC3_ZB_REST, [[M3_START, null], [1530, MXC3_NS]]);
for (const [id, y] of Object.entries(MXC3_NORTH)) own([id], [[M3_START, null], [y, MXC3_NS]]);
own(MXC3_YUC, [[M3_START, null], [1546, MXC3_NS], [1617, 'yucatan-captaincy']]);
own(['MX-CHP'], [[M3_START, null], [1528, MXC3_NS], [1543, MXC3_GT]]); // 1528 시우다드레알 · 1543 과테말라 아우디엔시아 관할(b 2절 10)
// 애리조나: 힐라강 남쪽(피메리아알타 — 북쪽 끝이 힐라강, 위키 en Pimería Alta) 1687 키노의 첫 선교부터, 북쪽은 내내 비움. 1687 앞은 양쪽이 같이 비어 가르지 않음
own(['US-AZ'], [[M3_START, null]]);
const MXC3_AZS = ownSplit('MXC3_AZS', ['US-AZ'], [['남쪽', MXC3_K7]], '북쪽', { 남쪽: [[1687, MXC3_NS]], 북쪽: [[1687, null]] }, { from: 1687, to: M3_END });
own(MXC3_WEST, [[M3_START, null]]);
// 중앙아메리카: 1527 과테말라 총독령(1543 아우디엔시아·1609 총사령부 — 이름 줄), 1530 다섯 지방 내륙을 쥠
own(MXC3_CA5, [[M3_START, null], [1530, MXC3_GT]]);
own(MXC3_CR, [[M3_START, null], [1563, MXC3_GT]]);
own(MXC3_GT_PE, [[M3_START, null], [1697, MXC3_GT]]);
own(MXC3_BZ, [[M3_START, null], [1543, MXC3_GT]]); // 명목(영국 벌목 정착은 칠하지 않음 — 1763·1786 조약이 스페인 주권 확인)
own(MXC3_MOS, [[M3_START, null], [1543, MXC3_GT], [1740, 'mosquito-kingdom']]); // 1543~1739 명목(G3-17) · 1740 영국과 동맹(G3-18 — M2 1776 모양과 같음)
const MXC3_voids = () => [
  B(M3_START, 1521, MXC3_A.밖, MXC3_B1.밖), // 아즈텍 도형 밖 정복 앞 원주민 땅(우아스테카 북부·치난틀라·믹세·테우안테펙·투투테펙)
  B(M3_START, 1530, MXC3_T.밖), V(M3_START, 1530, ...MXC3_ZB_REST), // 타라스코 도형 밖 서부·바히오·타바스코 — 1530 정복 앞 원주민 땅
  ...Object.entries(MXC3_NORTH).map(([id, y]) => V(M3_START, y, id)), // 북부 — 그 단위를 세우기 앞 원주민 땅(치치메카·아파체리아 등)
  V(M3_START, 1546, ...MXC3_YUC), // 유카탄 반도 — 1546 북부 정복 끝 앞 마야 소국들
  V(M3_START, 1528, 'MX-CHP'), // 치아파스 — 1528 정복 앞
  V(M3_START, 1687, 'US-AZ'), B(1687, M3_END, MXC3_AZS.북쪽), // 애리조나 — 1687 앞 통째·힐라강 북쪽 내내(아파체리아 — G3-41)
  V(M3_START, M3_END, ...MXC3_WEST), // 그레이트베이슨·북서 — 문서 없는 땅(G3-41·G3-22)
  V(M3_START, 1530, ...MXC3_CA5), // 중앙아메리카 내륙 — 1530 앞 마야·피필·렌카 등 원주민 땅
  V(M3_START, 1563, ...MXC3_CR), // 코스타리카 — 1563 카르타고 앞
  V(M3_START, 1697, ...MXC3_GT_PE), // 페텐 — 1697 노헤페텐 항복 앞 이차 왕국(Q4 A — 비움)
  V(M3_START, 1543, ...MXC3_BZ, ...MXC3_MOS), // 벨리즈·모스키토 해안 — 1543 아우디엔시아 관할 문서 앞
];
// ── M3 MXC-M3 끝 ──

// ── M3 AND-M3 안데스·라플라타·1492 잉카 (최상위 이름 AND3_) ──
// 조각 M3_AND_IDS(콜롬비아 32·베네수엘라 25·에콰도르 24·파나마 12·페루 26·볼리비아 9·BR-AC·칠레 16·FLK-5152·SGS·HOLE-2·아르헨티나 24·우루과이 19·HOLE-3·파라과이 18 = 210), 구현 AND-M3(2라운드)
// 항목(새 3): inca [1492, 1533)(손 도형)·muisca(땅 없음 — level region)·neo-inca-state(땅 없음 — polity). 앞 잇기 peru-viceroyalty(from 1529, 칠함 1533)·new-granada-viceroyalty·mapuche-araucania·spanish-falkland-islands
// 칼선 자리(cuts-m3.mjs AND-M3 머리): AND3_CUT_INCA(손 도형 — ownSplit { from: M3_START, to: 1533 }, BOUNDS에 1533)·AND3_CUT_CHACAO(차카오 해협). M2 SCW2_CUT_BIOBIO·ANN2_CUT_MARANON·SCE2_CUT_ALSINA,
//   M1 SC_CUT_1909·SAN_CUT_1942_PE 별칭(1776 모양을 같은 모양으로 뒤로 늘일 때만)
// 칸을 넘는 주인: new-spain-viceroyalty(MXC 블록 — 베네수엘라 카라카스 쪽·쿠마나 쪽 1546(쿠마나는 주 설치 해)~1716·1723~1738, 술리아 1546~1675 — M-M3-1·C-M3-4)
// 잉카 1533 이음(C-M3-12를 창구 ③ E1이 고침 — 1533부터 페루·에콰도르 잉카 조각 + 키토 북쪽 EC-P·EC-I·EC-C·EC-X 통째 peru-viceroyalty,
//   볼리비아 서쪽 6·PE-PUN 1538, 칠레 마울레강 북쪽 9 1541, 아르헨티나 북서 도형 안 1559 — 그 사이 비움, CO-NAR 1542), 파나마 1542~1738 peru-viceroyalty(G3-5), 누에바그라나다 1717~1722·1739~(G3-7),
//   마이나스 1717 앞 비움(G3-8), 칠레 전쟁 지대 비움·CHACAO(G3-19·C-M3-13), 팜파스·파타고니아·차코 비움(G3-21), 마푸체 1641~(기본값 18)
// 이음(1775 = M2 1776): 1776 rio-de-la-plata-viceroyalty 몫(통째 57 + CL-AN·CL-AT·AR-B·AR-D·AR-M·AR-X 나뉨)은 1775에 같은 모양을 peru-viceroyalty로(결정 바뀜 — 주인만) ·
//   new-granada-viceroyalty 통째 92 + PE-LOR 마이나스 · peru-viceroyalty 통째 31 + PE-CUS·LOR·MDD·PUN·UCA·CL-AN·CL-AT·CL-BI 나뉨 · mapuche-araucania CL-AR + CL-BI 남 · spanish-falkland-islands FLK-5152 ·
//   빈 땅 약 193만(EC-W 갈라파고스·아마존 동쪽·칠레 남부·팜파스·파타고니아·차코·SGS·HOLE-2)
import { AND3_CUT_INCA as AND3_INCA, AND3_CUT_CHACAO as AND3_CHACAO } from './cuts-m3.mjs';
import { SCW2_CUT_BIOBIO as AND3_BIOBIO, ANN2_CUT_MARANON as AND3_MARANON, SCE2_CUT_ALSINA as AND3_ALSINA } from './cuts-m2.mjs';
import { SC_CUT_1909 as AND3_K1909, SAN_CUT_1942_PE as AND3_X42B } from './cuts-m1.mjs';
// 표 경계 해: 1533 잉카 손 도형 끝(쿠스코 함락) · 1550 마울레 남쪽 정착(콘셉시온) — 마울레 나눈 조각 끝 · 1559 차르카스 아우디엔시아 — 아르헨티나 북서 나눈 조각 끝·알시나 나눔 시작 ·
//   1552 발디비아 정착·1567 카스트로(칠로에섬 — 차카오 앞 나눔) · 1600 남부 일곱 도시 가운데 넷이 무너짐(비오비오·차카오 나눔 시작) · 1645 발디비아 재건(차카오 나눔 끝) · 1717·1723·1739 누에바그라나다 설치·폐지·재설치(마라뇬 나눔)
const AND3_BOUNDS = [1533, 1538, 1541, 1550, 1552, 1559, 1567, 1600, 1645, 1717, 1723, 1739];
const AND3_PV = 'peru-viceroyalty';
const AND3_NG = 'new-granada-viceroyalty';
const AND3_NSV = 'new-spain-viceroyalty'; // 블록 글·관계·허용 열쇠는 MXC-M3(베네수엘라 카라카스·쿠마나 쪽 — M-M3-1)
const AND3_NG_LINE = (from) => [[from, AND3_NG], [1723, AND3_PV], [1739, AND3_NG]]; // 누에바그라나다 1717~1722 · 1723~1738 페루 부왕령 색(G3-7) · 1739~
// 조각 묶음(합 210 — 아래 확인 줄)
// 잉카 손 도형이 지나는 조각(1492~1532 안/밖) — 페루·에콰도르 고원·볼리비아 서쪽·칠레 북중부. 1533부터 통째 페루 부왕령(C-M3-12, 이름 '누에바카스티야 총독부' 1533~1541)
const AND3_PE_I = ['PE-AMA', 'PE-ANC', 'PE-APU', 'PE-ARE', 'PE-AYA', 'PE-CAJ', 'PE-CAL', 'PE-HUC', 'PE-HUV', 'PE-ICA', 'PE-JUN', 'PE-LAL', 'PE-LAM', 'PE-MOQ', 'PE-PAS', 'PE-PIU', 'PE-SAM', 'PE-TAC', 'PE-TUM', 'PER-587', 'PER-591'];
const AND3_EC_I = ['EC-A', 'EC-B', 'EC-F', 'EC-G', 'EC-H', 'EC-L', 'EC-N', 'EC-O', 'EC-P', 'EC-R', 'EC-SD', 'EC-X']; // EC-N은 조각 자료 이름표가 'Napo'지만 도형은 퉁구라우아주(암바토·바뇨스 — 안데스 고원)
const AND3_BO_I = ['BO-L', 'BO-O', 'BO-P', 'BO-C', 'BO-H', 'BO-T']; // 라파스·오루로·포토시·코차밤바·추키사카·타리하(차르카스)
const AND3_CL_I = ['CL-TA', 'CL-AP', 'CL-AN', 'CL-AT', 'CL-CO', 'CL-VS', 'CL-RM', 'CL-LI']; // 칠레 북~중부(마울레강 북쪽)
const AND3_INCA_IDS = [...AND3_PE_I, ...AND3_EC_I, ...AND3_BO_I, ...AND3_CL_I];
const AND3_PE_09I = ['PE-CUS', 'PE-PUN']; // 쿠스코·푸노 — 잉카 도형과 1909 앞 볼리비아 청구 띠(M1 SC_CUT_1909)가 함께 지나감
const AND3_PE_09 = ['PE-MDD', 'PE-UCA']; // 마드레데디오스·우카얄리 — 1909 띠를 품는 아마존 조각(잉카 밖)
const AND3_CL_ML = ['CL-ML']; // 마울레 — 마울레강이 잉카 남쪽 끝(강 남쪽은 1550 콘셉시온 뒤)
const AND3_AR_I = ['AR-Y', 'AR-A', 'AR-T', 'AR-K', 'AR-F', 'AR-J']; // 후후이·살타·투쿠만·카타마르카·라리오하·산후안 — 잉카 남동 몫(도형 밖은 1559 라플라타 몫과 같게)
const AND3_EC_N = ['EC-C', 'EC-I', 'EC-E', 'EC-M', 'EC-SE']; // 카르치·임바부라(키토 북쪽 — 와이나 카팍 때)·에스메랄다스·마나비·산타엘레나(해안 저지) — 잉카 밖, 1534 키토 점령은 3년 안
const AND3_EC_O = ['EC-S', 'EC-Y', 'EC-D', 'EC-U', 'EC-Z', 'EC-T']; // 에콰도르 오리엔테(EC-T 도형이 나포주 — 이름표 뒤바뀜)
const AND3_EC_GAL = ['EC-W']; // 갈라파고스(1만 km² 미만)
const AND3_PE_LOR = ['PE-LOR']; // 로레토 — 마라뇬강 북쪽 마이나스(+1942 교환 땅)와 남쪽
const AND3_CO = idsOf('COL'); // 콜롬비아 32(무이스카 땅 COL-1398·COL-1399·CO-BOY·CO-SAN 포함 — 땅 없는 항목이라 1541까지 비움)
const AND3_PA = idsOf('PAN'); // 파나마 12
const AND3_VE_CCS = ['VE-A', 'VE-X', 'VE-M', 'VE-D', 'VE-G', 'VE-U', 'VE-K', 'VE-I', 'VE-H', 'VE-P', 'VE-J', 'VE-T']; // 베네수엘라 주(카라카스 쪽 — 산토도밍고 아우디엔시아)
const AND3_VE_ZUL = ['VE-V']; // 술리아(마라카이보) — 1676-12-31 메리다·라그리타 주와 합침(산타페 쪽)
const AND3_VE_CUM = ['VE-R', 'VE-B', 'VE-N', 'VE-O', 'VE-W']; // 누에바안달루시아(쿠마나)·마르가리타 쪽 — 산토도밍고 아우디엔시아
const AND3_VE_MER = ['VE-L', 'VE-S', 'VE-E', 'VE-C']; // 메리다·타치라·바리나스·아푸레 — 산타페 아우디엔시아
const AND3_VE_GUA = ['VE-F', 'VE-Z', 'VE-Y']; // 과야나 주 — 산타페 아우디엔시아(오리노코 남쪽 내륙 명목 — Q3 ②)
const AND3_BO_E = ['BO-B', 'BO-N', 'BO-S', 'BR-AC']; // 베니·판도·산타크루스·아크리 — 1559 라플라타 몫(M2 1776 모양)
const AND3_AR_CORE = ['AR-C', 'AR-E', 'AR-G', 'AR-N', 'AR-S', 'AR-W']; // 부에노스아이레스시·엔트레리오스·산티아고델에스테로·미시오네스·산타페·코리엔테스
const AND3_AR_ALS = ['AR-B', 'AR-X', 'AR-D', 'AR-M']; // 알시나 선 안/밖(M2 SCE2_CUT_ALSINA — 1776 모양)
const AND3_AR_EMPTY = ['AR-L', 'AR-Q', 'AR-R', 'AR-U', 'AR-Z', 'AR-V', 'AR-H', 'AR-P']; // 라팜파·파타고니아·티에라델푸에고·차코 오스트랄(G3-21)
const AND3_UY = [...idsOf('URY'), 'HOLE-3']; // 우루과이 19 + 구멍
const AND3_PY_CHACO = ['PY-15', 'PY-16', 'PY-19']; // 차코 보레알(G3-21)
const AND3_PY = idsOf('PRY').filter((id) => !AND3_PY_CHACO.includes(id)); // 파라과이 동쪽 15
const AND3_CL_NB = ['CL-NB']; // 뉴블레 — 마울레강 남쪽(1550 뒤 콘셉시온 관할)
const AND3_CL_BI = ['CL-BI']; // 비오비오 — 강 남쪽은 1600~1640 전쟁 지대, 1641 마푸체(M2 비오비오 선)
const AND3_CL_AR = ['CL-AR']; // 아라우카니아
const AND3_CL_LR = ['CL-LR']; // 로스리오스(발디비아)
const AND3_CL_LL = ['CL-LL']; // 로스라고스 — 1600~1644 칠로에섬/본토를 차카오 해협으로 가름
const AND3_CL_EMPTY = ['CL-MA', 'CL-AI', 'SGS', 'HOLE-2']; // 마가야네스·아이센·사우스조지아·남부 빙원(G3-21)
const AND3_FLK = ['FLK-5152'];
const AND3_ALL = [...AND3_INCA_IDS, ...AND3_PE_09I, ...AND3_PE_09, ...AND3_CL_ML, ...AND3_AR_I, ...AND3_EC_N, ...AND3_EC_O, ...AND3_EC_GAL, ...AND3_PE_LOR, ...AND3_CO, ...AND3_PA,
  ...AND3_VE_CCS, ...AND3_VE_ZUL, ...AND3_VE_CUM, ...AND3_VE_MER, ...AND3_VE_GUA, ...AND3_BO_E, ...AND3_AR_CORE, ...AND3_AR_ALS, ...AND3_AR_EMPTY, ...AND3_UY, ...AND3_PY_CHACO, ...AND3_PY,
  ...AND3_CL_NB, ...AND3_CL_BI, ...AND3_CL_AR, ...AND3_CL_LR, ...AND3_CL_LL, ...AND3_CL_EMPTY, ...AND3_FLK];
if (AND3_ALL.length !== M3_AND_IDS.length || new Set(AND3_ALL).size !== AND3_ALL.length || AND3_ALL.some((id) => !M3_AND_IDS.includes(id))) throw new Error(`americas colonial AND-M3: 칸 조각 ${AND3_ALL.length}개(M3_AND_IDS ${M3_AND_IDS.length}개와 같아야 함)`);
// 잉카 1492~1532(손 도형 안) → 1533-11-15 쿠스코 함락 뒤 누에바카스티야 총독부(1529 톨레도 협약 — 1542 페루 부왕령, Q1 A·C-M3-12). 도형 밖도 1533부터(리마 1535·키토 1534 — 3년 안)
const AND3_IN = ownSplit('AND3_INCA', AND3_INCA_IDS, [['안', AND3_INCA]], '밖', { 안: [[M3_START, 'inca']], 밖: [[M3_START, null]] }, { from: M3_START, to: 1533 });
own(AND3_PE_I, [[1533, AND3_PV]]); // 1775 = M2 1776(페루 부왕령·라플라타 부왕령 몫 — 결정 바뀜은 주인만)
own(AND3_BO_I, [[1533, null], [1538, AND3_PV]]); // 창구 ③ E1 — 1538 피사로 형제의 콜라오·차르카스 정복(라플라타 세움), 1533~1537 비움
own(AND3_CL_I, [[1533, null], [1541, AND3_PV]]); // 창구 ③ E1 — 1541-02-12 발디비아의 산티아고 세움, 1533~1540 비움
own(AND3_EC_I, [[1533, AND3_PV], ...AND3_NG_LINE(1717)]); // 키토 아우디엔시아 — 1717~1722·1739~ 누에바그라나다
const AND3_I09 = ownSplit('AND3_INCA_P09', AND3_PE_09I, [['띠', AND3_K1909], ['안', AND3_INCA]], '밖', { 띠: [[M3_START, null]], 안: [[M3_START, 'inca']], 밖: [[M3_START, null]] }, { from: M3_START, to: 1533 });
own(AND3_PE_09, [[M3_START, null]]); // 1532까지 통째 비움(아마존 저지 — 잉카 밖)
const AND3_P09 = ownSplit('AND3_P09', ['PE-CUS', ...AND3_PE_09], [['띠', AND3_K1909]], '나머지', { 띠: [[1533, null]], 나머지: [[1533, AND3_PV]] }, { from: 1533, to: M3_END });
const AND3_PUN = ownSplit('AND3_P09_PUN', ['PE-PUN'], [['띠', AND3_K1909]], '나머지', { 띠: [[1533, null]], 나머지: [[1533, null], [1538, AND3_PV]] }, { from: 1533, to: M3_END }); // 푸노(콜라오) — 창구 ③ E1 1538 // 1909 띠는 내내 비움(M2·M1과 같음), 나머지는 명목(우카얄리 저지)
const AND3_ML = ownSplit('AND3_INCA_ML', AND3_CL_ML, [['안', AND3_INCA]], '밖', { 안: [[M3_START, 'inca'], [1533, null], [1541, AND3_PV]], 밖: [[M3_START, null]] }, { from: M3_START, to: 1550 });
own(AND3_CL_ML, [[1550, AND3_PV]]); // 1550 콘셉시온(마울레강 남쪽 정착 — en Spanish_conquest_of_Chile)
const AND3_AI = ownSplit('AND3_INCA_AR', AND3_AR_I, [['안', AND3_INCA]], '밖', { 안: [[M3_START, 'inca'], [1533, null]], 밖: [[M3_START, null]] }, { from: M3_START, to: 1559 }); // 창구 ③ E1 — 잉카 도형 안도 1559 앞 비움
own(AND3_AR_I, [[1559, AND3_PV]]); // 1559-09-04 차르카스 아우디엔시아 — 라플라타 몫(Q1 A)
own(AND3_EC_N, [[M3_START, null], [1533, AND3_PV], ...AND3_NG_LINE(1717)]);
own(AND3_EC_O, [[M3_START, null], [1563, AND3_PV], ...AND3_NG_LINE(1717)]); // 1563 키토 아우디엔시아(키호스·마카스 — Q3 ② 명목)
own(AND3_EC_GAL, [[M3_START, null]]);
// 마이나스(G3-8): 1717 앞 비움, 1717~ 마라뇬강 북쪽 누에바그라나다·남쪽 페루(M2 1776 모양). 1723~1738은 두 쪽 모두 페루 부왕령이라 가르지 않음(COMMON 9절)
own(AND3_PE_LOR, [[M3_START, null], [1723, AND3_PV]]);
ownSplit('AND3_LOR_A', AND3_PE_LOR, [['교환', AND3_X42B], ['마이나스', AND3_MARANON]], '남쪽', { 교환: [[1717, AND3_NG]], 마이나스: [[1717, AND3_NG]], 남쪽: [[1717, AND3_PV]] }, { from: 1717, to: 1723 });
ownSplit('AND3_LOR_B', AND3_PE_LOR, [['교환', AND3_X42B], ['마이나스', AND3_MARANON]], '남쪽', { 교환: [[1739, AND3_NG]], 마이나스: [[1739, AND3_NG]], 남쪽: [[1739, AND3_PV]] }, { from: 1739, to: M3_END });
// 콜롬비아: 1542 페루 부왕령(1538 보고타·1549 산타페 아우디엔시아 — 무이스카 땅 1540~1541 비움 2년), 파나마 1542~1738 페루(G3-5)·1739 누에바그라나다
own(AND3_CO, [[M3_START, null], [1542, AND3_PV], ...AND3_NG_LINE(1717)]);
own(AND3_PA, [[M3_START, null], [1542, AND3_PV], [1739, AND3_NG]]);
// 베네수엘라(M-M3-1·C-M3-4): 1528~1545 벨저 양허 비움 · 1546 왕실 직할 베네수엘라 주(산토도밍고 아우디엔시아 — 누에바에스파냐 부왕령) · 누에바안달루시아 1568 · 메리다 1558(산타페 — 1607 코레히미엔토) ·
//   과야나 1591(베리오) · 마라카이보 1676-12-31 메리다 쪽에 합침(es Capitanía_General_de_Venezuela)
own(AND3_VE_CCS, [[M3_START, null], [1546, AND3_NSV], [1717, AND3_NG], [1723, AND3_NSV], [1739, AND3_NG]]);
own(AND3_VE_ZUL, [[M3_START, null], [1546, AND3_NSV], [1676, AND3_PV], ...AND3_NG_LINE(1717)]);
own(AND3_VE_CUM, [[M3_START, null], [1568, AND3_NSV], [1717, AND3_NG], [1723, AND3_NSV], [1739, AND3_NG]]);
own(AND3_VE_MER, [[M3_START, null], [1558, AND3_PV], ...AND3_NG_LINE(1717)]);
own(AND3_VE_GUA, [[M3_START, null], [1591, AND3_PV], ...AND3_NG_LINE(1717)]);
// 라플라타 몫(Q1 A — 1559 차르카스 아우디엔시아부터 M2 1776 모양, 1775는 peru-viceroyalty → 1776 rio-de-la-plata-viceroyalty 주인만 바뀜)
own([...AND3_BO_E, ...AND3_AR_CORE, ...AND3_UY, ...AND3_PY], [[M3_START, null], [1559, AND3_PV]]);
own(AND3_AR_ALS, [[M3_START, null]]);
const AND3_AL = ownSplit('AND3_ALSINA', AND3_AR_ALS, [['밖', AND3_ALSINA]], '안', { 밖: [[1559, null]], 안: [[1559, AND3_PV]] }, { from: 1559, to: M3_END });
own([...AND3_AR_EMPTY, ...AND3_PY_CHACO, ...AND3_CL_EMPTY], [[M3_START, null]]);
// 칠레 남부: 1550 콘셉시온·1552 발디비아·라임페리알·비야리카(en Spanish_conquest_of_Chile) → 1598-12 쿠랄라바 뒤 1600년 말 일곱 도시 가운데 넷이 무너짐(en Destruction_of_the_Seven_Cities — C-M3-13)
//   → 1641 킬린 의회 마푸체(기본값 18) · 1645 발디비아 재건(로스리오스·로스라고스 본토) · 칠로에섬은 1600~1644에도 스페인(차카오 칼선)
own([...AND3_CL_NB, ...AND3_CL_BI], [[M3_START, null], [1550, AND3_PV]]);
const AND3_BB = ownSplit('AND3_BIOBIO', AND3_CL_BI, [['남', AND3_BIOBIO]], '북', { 남: [[1600, null], [1641, 'mapuche-araucania']], 북: [[1600, AND3_PV]] }, { from: 1600, to: M3_END });
own(AND3_CL_AR, [[M3_START, null], [1552, AND3_PV], [1600, null], [1641, 'mapuche-araucania']]);
own(AND3_CL_LR, [[M3_START, null], [1552, AND3_PV], [1600, null], [1645, AND3_PV]]);
own(AND3_CL_LL, [[M3_START, null], [1567, AND3_PV]]); // 1552~1566은 아래 나눔(본토만), 1567 카스트로 뒤 통째(오소르노 1558은 10년 안 — 결과 노트 7절)
const AND3_CHA = ownSplit('AND3_CHACAO_A', AND3_CL_LL, [['섬', AND3_CHACAO]], '본토', { 섬: [[1552, null]], 본토: [[1552, AND3_PV]] }, { from: 1552, to: 1567 }); // 칠로에섬은 1567 카스트로 앞 비움
const AND3_CH = ownSplit('AND3_CHACAO', AND3_CL_LL, [['섬', AND3_CHACAO]], '본토', { 섬: [[1600, AND3_PV]], 본토: [[1600, null]] }, { from: 1600, to: 1645 });
own(AND3_FLK, [[M3_START, null], [1767, 'spanish-falkland-islands']]); // 1767-04 푸에르토솔레다드 인수(프랑스 1764·영국 1765 정착은 1만 km² 미만 섬 한쪽 — G-c7)
const AND3_voids = () => [
  B(M3_START, 1533, AND3_IN.밖, AND3_I09.밖, AND3_I09.띠), // 잉카 밖 원주민 땅(안데스 동쪽 저지·에콰도르 서쪽 기슭) — 1533 정복 앞
  V(M3_START, 1533, ...AND3_PE_09, ...AND3_EC_N), // 우카얄리·마드레데디오스 저지, 키토 북쪽·에콰도르 해안 저지 — 정복 앞 원주민 땅
  B(1533, M3_END, AND3_P09.띠, AND3_PUN.띠), // 1909 폴로–산체스 부스타만테 조약 앞 마드레데디오스·푸루스 띠(M2·M1과 같음)
  V(1533, 1538, ...AND3_BO_I), B(1533, 1538, AND3_PUN.나머지), // 옛 잉카 남쪽 — 볼리비아 서쪽·푸노, 1538 콜라오·차르카스 정복 앞(창구 ③ E1)
  V(1533, 1541, ...AND3_CL_I), B(1533, 1541, AND3_ML.안), // 옛 잉카 남쪽 — 칠레 마울레강 북쪽, 1541 산티아고 앞(창구 ③ E1)
  B(1533, 1559, AND3_AI.안), // 옛 잉카 남쪽 — 아르헨티나 북서, 1559 라플라타 몫과 같은 해 앞(창구 ③ E1)
  B(M3_START, 1550, AND3_ML.밖), V(M3_START, 1550, ...AND3_CL_NB, ...AND3_CL_BI), // 마울레강 남쪽 — 1550 콘셉시온 앞 원주민 땅
  B(M3_START, 1559, AND3_AI.밖), // 아르헨티나 북서 잉카 밖(살타 차코 쪽·라리오하·산후안 동쪽) — 1559 앞
  V(M3_START, 1563, ...AND3_EC_O), // 에콰도르 오리엔테 — 1563 키토 아우디엔시아 앞 원주민 땅
  V(M3_START, M3_END, ...AND3_EC_GAL), // 갈라파고스 — 주인 없는 섬(1만 km² 미만, 1832 에콰도르 병합)
  V(M3_START, 1717, ...AND3_PE_LOR), // 마이나스·로레토 — 1717 앞 첫 확인 소속 없음(G3-8)
  V(M3_START, 1542, ...AND3_CO, ...AND3_PA), // 콜롬비아·파나마 — 1542 페루 부왕령 앞(무이스카 땅은 땅 없는 항목, 정복기 카스티야 델 오로·산타마르타는 다른 계보)
  V(M3_START, 1546, ...AND3_VE_CCS, ...AND3_VE_ZUL), // 베네수엘라 주 — 1528~1545 벨저 양허 포함 1546 왕실 직할 앞(M-M3-1)
  V(M3_START, 1568, ...AND3_VE_CUM), // 누에바안달루시아 — 1568 주 설치 앞
  V(M3_START, 1558, ...AND3_VE_MER), // 메리다·타치라·바리나스·아푸레 — 1558 메리다 앞
  V(M3_START, 1591, ...AND3_VE_GUA), // 과야나 — 1591 주 설치 앞(오리노코 남쪽 내륙 원주민 땅)
  V(M3_START, 1559, ...AND3_BO_E, ...AND3_AR_CORE, ...AND3_UY, ...AND3_PY, ...AND3_AR_ALS), // 라플라타 몫 — 1559 차르카스 아우디엔시아 앞
  B(1559, M3_END, AND3_AL.밖), // 알시나 참호선·서쪽 요새선 바깥 팜파스 원주민 땅(M2 Q1 A와 같음)
  V(M3_START, M3_END, ...AND3_AR_EMPTY, ...AND3_PY_CHACO, ...AND3_CL_EMPTY), // 라팜파·파타고니아·차코·마가야네스·아이센·사우스조지아·남부 빙원 원주민 땅·미획정(G3-21)
  V(M3_START, 1552, ...AND3_CL_AR, ...AND3_CL_LR, ...AND3_CL_LL), // 아라우카니아·발디비아·로스라고스 — 1552 정착 앞
  B(1600, 1641, AND3_BB.남), V(1600, 1641, ...AND3_CL_AR), // 비오비오강 남쪽 전쟁 지대 — 쿠랄라바(1598) 뒤 킬린 의회(1641) 앞(G3-19·C-M3-13)
  B(1552, 1567, AND3_CHA.섬), // 칠로에섬 — 1567 카스트로 앞 원주민 땅
  V(1600, 1645, ...AND3_CL_LR), B(1600, 1645, AND3_CH.본토), // 발디비아·오소르노 본토 — 1645 발디비아 재건 앞 전쟁 지대
  V(M3_START, 1767, ...AND3_FLK), // 포클랜드 — 1767 스페인 인수 앞(프랑스·영국 정착은 섬 한쪽 1만 km² 미만)
];
// ── M3 AND-M3 끝 ──

// ── M3 CAB-M3 카리브·브라질·기아나 (최상위 이름 CAB3_) ──
// 조각 M3_CAB_IDS(쿠바 16·아이티 10·도미니카 공화국 32·자메이카 14·바하마 22·HOLE-1 + 칠하지 않는 속령 섬 44·FR-GP·FR-MQ·작은 앤틸리스 80 + 브라질 25·HOLE-4·가이아나 10·수리남 10·FR-GF = 268), 구현 CAB-M3(2라운드)
// 항목(새 2): dutch-brazil [1630, 1654)·state-of-maranhao [1621, 1775). 앞 잇기 cuba-captaincy-general(from 1511, 칠함 1515)·santo-domingo-captaincy(from 1492, 칠함 1496)·saint-domingue(from 1665)·jamaica·bahamas(from 1670)·
//   portuguese-brazil(from 1549 그대로)·dutch-essequibo-berbice(from 1621)·dutch-suriname·french-guiana. 새 칼선 0(조각 통째 — 브라질 내륙은 주 조각 경계)
// 브라질 1500~1548 비움(Q1 예외 ①), 내륙 미나스 1709·고이아스·마투그로수 1746·아마존 1751(Q3 A·G3-37), 아마파 1713(Q3 A), 1만 km² 미만 섬 안 칠함(G3-38 — 카리브 큰 섬 넷·바하마만)
// 이음(1775 = M2 1776): portuguese-brazil 통째 26(브라질 25 + HOLE-4) · dutch-essequibo-berbice 가이아나 10 · dutch-suriname 수리남 10 · cuba-captaincy-general 쿠바 16 · french-guiana FR-GF · santo-domingo-captaincy 도미니카 공화국 32 ·
//   saint-domingue 아이티 10 · bahamas 바하마 22 + HOLE-1 · jamaica 자메이카 14 · 빈 땅 약 2.3만(속령 섬·작은 앤틸리스 — 1만 km² 미만)
const CAB3_BOUNDS = []; // 조각 통째 — 주인만 바뀜(새 칼선 0, 표 경계 해를 늘리지 않음)
import { M1_NA_ISLAND_IDS as CAB3_NA_ISLAND_IDS, M1_LA_IDS as CAB3_LA_IDS } from './cuts-m1.mjs';
// 조각 묶음(합 268 — 아래 확인 줄)
const CAB3_CU = idsOf('CUB'); // 쿠바 16
const CAB3_HT = idsOf('HTI'); // 아이티 10 — 이스파니올라 서쪽(1665~ 생도맹그, 지금 국경 근사)
const CAB3_DO = idsOf('DOM'); // 도미니카 공화국 32 — 이스파니올라 동쪽
const CAB3_JM = idsOf('JAM'); // 자메이카 14
const CAB3_BS = [...idsOf('BHS'), 'HOLE-1']; // 바하마 22 + 이나과섬 둘레 HOLE-1
const CAB3_ISLANDS = [...CAB3_NA_ISLAND_IDS, 'FR-GP', 'FR-MQ', ...CAB3_LA_IDS]; // 칠하지 않는 속령 섬 44·과들루프·마르티니크·작은 앤틸리스 80(푸에르토리코·트리니다드 포함 — 모두 1만 km² 미만)
const CAB3_BR_E = ['BR-BA', 'BR-ES', 'BR-RJ', 'BR-SP']; // 바이아·이스피리투산투·리우데자네이루·상파울루 — 1549 총독령 첫 땅(동·남동 해안)
const CAB3_BR_PE = ['BR-PE']; // 페르남부쿠 — 1630 네덜란드 점령(올린다·헤시피)
const CAB3_BR_PBRN = ['BR-PB', 'BR-RN']; // 파라이바·히우그란지두노르치 — 1635 네덜란드
const CAB3_BR_ALSE = ['BR-AL', 'BR-SE']; // 알라고아스·세르지피 — 1635 네덜란드, 1644~1647 다툼
const CAB3_BR_CE = ['BR-CE']; // 세아라 — 1621 마라냥 주, 1635~1643 네덜란드, 1656 브라질 주
const CAB3_BR_MA = ['BR-MA']; // 마라냥 — 1621 마라냥 주(상루이스), 1641~1643 네덜란드
const CAB3_BR_PA = ['BR-PA']; // 파라 — 1621 마라냥 주(벨렝)
const CAB3_BR_AP = ['BR-AP']; // 아마파 — 1713 위트레흐트 조약(G3-36)
const CAB3_BR_PI = ['BR-PI']; // 피아우이 — 1674 첫 정착
const CAB3_BR_PR = ['BR-PR']; // 파라나 — 1648 파라나과
const CAB3_BR_SC = ['BR-SC']; // 산타카타리나 — 1656(상프란시스쿠두술 1658을 2년 앞으로 — G3-37)
const CAB3_BR_MG = ['BR-MG']; // 미나스제라이스 — 1709 상파울루·미나스두오루 카피타니아
const CAB3_BR_RS = ['BR-RS']; // 히우그란지두술 — 1737 리우그란지 요새(G3-2 통째 브라질)
const CAB3_BR_C = ['BR-GO', 'BR-TO', 'BR-MT', 'BR-MS', 'BR-RO', 'HOLE-4']; // 고이아스·토칸칭스·마투그로수·마투그로수두술·혼도니아 + 연방구 구멍 — 1746(고이아스 1744·마투그로수 1748, G3-37)
const CAB3_BR_AMRR = ['BR-AM', 'BR-RR']; // 아마조나스·호라이마 — 1751 그랑파라·마라냥 주(Q3 A)
const CAB3_BR = [...CAB3_BR_E, ...CAB3_BR_PE, ...CAB3_BR_PBRN, ...CAB3_BR_ALSE, ...CAB3_BR_CE, ...CAB3_BR_MA, ...CAB3_BR_PA, ...CAB3_BR_AP, ...CAB3_BR_PI, ...CAB3_BR_PR, ...CAB3_BR_SC, ...CAB3_BR_MG, ...CAB3_BR_RS, ...CAB3_BR_C, ...CAB3_BR_AMRR];
const CAB3_GY = idsOf('GUY'); // 가이아나 10 — 1899 판정선(지금 국경)을 처음부터(M2 G2-23과 같은 모양)
const CAB3_SR = idsOf('SUR'); // 수리남 10
const CAB3_GF = ['FR-GF']; // 프랑스령 기아나
const CAB3_ALL = [...CAB3_CU, ...CAB3_HT, ...CAB3_DO, ...CAB3_JM, ...CAB3_BS, ...CAB3_ISLANDS, ...CAB3_BR, ...CAB3_GY, ...CAB3_SR, ...CAB3_GF];
if (CAB3_ALL.length !== M3_CAB_IDS.length || new Set(CAB3_ALL).size !== CAB3_ALL.length || CAB3_ALL.some((id) => !M3_CAB_IDS.includes(id)) || [...CAB3_BR].sort().join() !== [...idsOf('BRA').filter((id) => id !== 'BR-AC'), 'HOLE-4'].sort().join()) throw new Error(`americas colonial: CAB-M3 조각 ${CAB3_ALL.length}개(M3_CAB_IDS ${M3_CAB_IDS.length}개와 같아야 함)`);
// 카리브: 산토도밍고 1496 건설(from 1492 — C-M3-9) · 자메이카 1509 세비야라누에바부터 1655 영국 점령 앞까지 산토도밍고 색(10년 규칙 — 항목 안 늘림) · 쿠바 1511 바라코아~1515 정복 끝 ·
//   생도맹그 1665 프랑스 왕의 총독 임명(1697 레이스베이크 조약은 글) · 바하마 1670 캐롤라이나 영주 특허(C-M3-8). 영국의 아바나 점령 1762~1763은 글(G3-15)
own(CAB3_DO, [[M3_START, null], [1496, 'santo-domingo-captaincy']]);
own(CAB3_HT, [[M3_START, null], [1496, 'santo-domingo-captaincy'], [1665, 'saint-domingue']]);
own(CAB3_JM, [[M3_START, null], [1509, 'santo-domingo-captaincy'], [1655, 'jamaica']]);
own(CAB3_CU, [[M3_START, null], [1515, 'cuba-captaincy-general']]);
own(CAB3_BS, [[M3_START, null], [1670, 'bahamas']]);
own(CAB3_ISLANDS, [[M3_START, null]]); // 1만 km² 미만 섬(G3-38·0단계 기본값 7)
// 브라질: 1500~1548 비움(Q1 예외 ① — 1534 카피타니아는 사유 영지), 1549 총독령 사우바도르. 네덜란드령 브라질 1630~1653(1654-01 항복 — G3-35), 마라냥 주 1621~1774(1775 브라질 주에 합침 — G3-34)
//   내륙은 행정 단위 설치 해부터 안쪽 전부(Q3 A ② — 파라나 1648·산타카타리나 1656·피아우이 1674·미나스 1709·리우그란지 1737·고이아스·마투그로수 1746·아마존 1751, 아마파 1713 위트레흐트). 토르데시야스·1750 선은 쓰지 않음(G3-2)
own(CAB3_BR_E, [[M3_START, null], [1549, 'portuguese-brazil']]);
own(CAB3_BR_PE, [[M3_START, null], [1549, 'portuguese-brazil'], [1630, 'dutch-brazil'], [1654, null], [1656, 'portuguese-brazil']]); // 1630-02 올린다·03 헤시피 · 1654-01 항복 뒤 1654~1655 비움(3년 안 — 1656 버전에 몰음)
own(CAB3_BR_PBRN, [[M3_START, null], [1549, 'portuguese-brazil'], [1635, 'dutch-brazil'], [1654, null], [1656, 'portuguese-brazil']]); // 1633 히우그란지·1634 파라이바 점령을 1635에 몰음
own(CAB3_BR_ALSE, [[M3_START, null], [1549, 'portuguese-brazil'], [1635, 'dutch-brazil'], [1644, null], [1648, 'portuguese-brazil']]); // 1635 포르투칼부·1637 상프란시스쿠강 · 1644~1647 비움(1645 반란, 1만~5만 10년 안)
own(CAB3_BR_CE, [[M3_START, null], [1621, 'state-of-maranhao'], [1635, 'dutch-brazil'], [1644, 'state-of-maranhao'], [1656, 'portuguese-brazil']]); // 1637 네덜란드 점령을 1635에 몰음 · 1644 철수 · 1656 브라질 주로(d S5·B5)
own(CAB3_BR_MA, [[M3_START, null], [1621, 'state-of-maranhao'], [1641, 'dutch-brazil'], [1644, 'state-of-maranhao'], [1775, 'portuguese-brazil']]); // 1641-11 상루이스 점령 · 1644-02 철수
own(CAB3_BR_PA, [[M3_START, null], [1621, 'state-of-maranhao'], [1775, 'portuguese-brazil']]); // 1616 벨렝 · 1621 마라냥 주
own(CAB3_BR_AP, [[M3_START, null], [1713, 'state-of-maranhao'], [1775, 'portuguese-brazil']]); // 1713 위트레흐트 조약(G3-36 — M2 1776 통째 브라질과 이음)
own(CAB3_BR_PI, [[M3_START, null], [1674, 'portuguese-brazil']]);
own(CAB3_BR_PR, [[M3_START, null], [1648, 'portuguese-brazil']]);
own(CAB3_BR_SC, [[M3_START, null], [1656, 'portuguese-brazil']]);
own(CAB3_BR_MG, [[M3_START, null], [1709, 'portuguese-brazil']]);
own(CAB3_BR_RS, [[M3_START, null], [1737, 'portuguese-brazil']]); // 미시오네스 오리엔탈레스·콜로니아·1763~1776 스페인 점령은 근사(G3-2·d D11)
own(CAB3_BR_C, [[M3_START, null], [1746, 'portuguese-brazil']]);
own(CAB3_BR_AMRR, [[M3_START, null], [1751, 'state-of-maranhao'], [1775, 'portuguese-brazil']]);
// 기아나: 에세키보 1621 서인도 회사(베르비서 1627 앞 6년은 같은 모양 근사 — d D6) · 수리남 1667 브레다 조약(영국령 1650~1667은 1만 km² 미만 — 글) · 카옌 1643(네덜란드 점령 1660~1664·1676~1677은 글)
own(CAB3_GY, [[M3_START, null], [1621, 'dutch-essequibo-berbice']]);
own(CAB3_SR, [[M3_START, null], [1667, 'dutch-suriname']]);
own(CAB3_GF, [[M3_START, null], [1643, 'french-guiana']]);
const CAB3_voids = () => [
  V(M3_START, 1496, ...CAB3_HT, ...CAB3_DO), // 이스파니올라 — 1496 산토도밍고 건설 앞은 타이노 족장국 땅(정복 앞 원주민 땅)
  V(M3_START, 1509, ...CAB3_JM), // 자메이카 — 1509 세비야라누에바 건설 앞은 타이노 땅
  V(M3_START, 1515, ...CAB3_CU), // 쿠바 — 1511~1514 정복 중, 1515 섬 정복 끝 앞은 타이노 땅
  V(M3_START, 1670, ...CAB3_BS), // 바하마 — 루카야족이 끌려가 비고 1670 영주 특허 앞엔 다스린 나라 없음
  V(M3_START, M3_END, ...CAB3_ISLANDS), // 1만 km² 미만 섬 — 0단계 기본값 7·G3-38(푸에르토리코·트리니다드·작은 앤틸리스·속령)
  V(M3_START, 1549, ...CAB3_BR_E, ...CAB3_BR_PE, ...CAB3_BR_PBRN, ...CAB3_BR_ALSE), // 브라질 해안 — 1500 카브랄 도착 뒤 해안 교역소·1534 사유 카피타니아뿐, 1549 총독령 앞(Q1 예외 ①)
  V(1654, 1656, ...CAB3_BR_PE, ...CAB3_BR_PBRN), // 페르남부쿠·파라이바·히우그란지 — 1654-01 네덜란드 항복 뒤 브라질 주로 다시 묶기 앞(3년 안 — 1656 버전에 몰음)
  V(1644, 1648, ...CAB3_BR_ALSE), // 알라고아스·세르지피 — 1644 나사우 소환·1645 반란으로 네덜란드가 물러난 다툼 땅(1만~5만 10년 안)
  V(M3_START, 1621, ...CAB3_BR_CE, ...CAB3_BR_MA, ...CAB3_BR_PA), // 세아라·마라냥·파라 — 1621 마라냥 주 설치 앞(1612~1615 프랑스 상루이스·1616 벨렝 요새는 1만 km² 미만)
  V(M3_START, 1713, ...CAB3_BR_AP), // 아마파 — 1713 위트레흐트 조약 앞은 포르투갈·프랑스 맞선 주장(Q3 A ② — 비움)
  V(M3_START, 1674, ...CAB3_BR_PI), // 피아우이 — 1674 첫 정착 앞 원주민 땅
  V(M3_START, 1648, ...CAB3_BR_PR), // 파라나 — 1648 파라나과 왕령 도시 앞 원주민 땅
  V(M3_START, 1656, ...CAB3_BR_SC), // 산타카타리나 — 1656(상프란시스쿠두술 1658) 앞 원주민 땅
  V(M3_START, 1709, ...CAB3_BR_MG), // 미나스제라이스 — 1709 카피타니아 설치 앞(1690년대 금 발견·반데이란치 원정은 칠하지 않음)
  V(M3_START, 1737, ...CAB3_BR_RS), // 히우그란지두술 — 1737 리우그란지 요새 앞 원주민 땅·예수회 선교 마을
  V(M3_START, 1746, ...CAB3_BR_C), // 브라질 중서부 — 고이아스 1744·마투그로수 1748 행정 단위 앞 원주민 땅(Q3 A ②)
  V(M3_START, 1751, ...CAB3_BR_AMRR), // 아마조나스·호라이마 — 1751 그랑파라·마라냥 주 앞 원주민 땅(강가 선교 마을뿐)
  V(M3_START, 1621, ...CAB3_GY), // 가이아나 — 1621 서인도 회사 식민지 앞 원주민 땅(1616 교역소는 1만 km² 미만)
  V(M3_START, 1667, ...CAB3_SR), // 수리남 — 1667 브레다 조약 앞(1650~1667 영국 정착은 1만 km² 미만)
  V(M3_START, 1643, ...CAB3_GF), // 프랑스령 기아나 — 1643 카옌 앞 원주민 땅
];
// ── M3 CAB-M3 끝 ──


// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M3_START, ...NEC3_BOUNDS, ...SEL3_BOUNDS, ...NF3_BOUNDS, ...MXC3_BOUNDS, ...AND3_BOUNDS, ...CAB3_BOUNDS, M3_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M3_START || BOUNDS.at(-1) !== M3_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`americas colonial: 표 경계 해 ${BOUNDS.join(', ')}는 ${M3_START}~${M3_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`americas colonial: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`americas colonial: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`americas colonial: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`americas colonial: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`americas colonial: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// ── 소유표 → 버전·빈 땅 검사 구역·비운 땅 (공통) ─────────────────────────────
const joined = joinTables(TABLES);
if (joined.TO !== M3_END) throw new Error(`americas colonial: 마지막 표의 끝이 ${joined.TO} (${M3_END}이어야 함)`);
// 버전: 표 줄의 단위 목록과 표 밖 땅(extra)을 해 구간마다 합쳐, 같은 모양(단위 목록·손 도형 이름)이 이어지는 기간이 한 버전. 끝은 M3_END(1776 — to: null 없음, M2가 1776부터 이음).
// 앞 권역 도형 빼기는 없다(1492~1775 이 권역 조각과 겹치는 앞 권역 도형 0 — m3/SKEL-NOTE.md 3절, prev.mjs 없음)
const versionsOf = (id, segs) => {
  const ex = extras.filter((e) => e.id === id);
  const cuts = [...new Set([...segs.flatMap(([f, t]) => [f, t]), ...ex.flatMap((e) => [e.from, e.to])])].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [a, b] = [cuts[i], cuts[i + 1]];
    const seg = segs.find(([f, t]) => f <= a && b <= t);
    const on = ex.filter((e) => e.from <= a && b <= e.to);
    const units = [...new Set([...(seg?.[2] ?? []), ...on.flatMap((e) => e.units)])].sort();
    const names = [...new Set(on.map((e) => e.name).filter(Boolean))].sort();
    if (!units.length && !names.length) continue;
    const key = JSON.stringify([units, names]);
    const last = out.at(-1);
    if (last && last.to === a && last.key === key) last.to = b;
    else out.push({ from: a, to: b, key, units, names });
  }
  return out.map(({ from, to, units, names }) => {
    const shapes = names.map((n) => extraShapes.get(n));
    const geom = !shapes.length ? build(units) : !units.length && shapes.length === 1 ? shapes[0] : U(...(units.length ? [build(units)] : []), ...shapes);
    return [from, to, geom];
  });
};
const versionIds = [...new Set([...Object.keys(joined.segments), ...extras.map((e) => e.id)])];
const versions = Object.fromEntries(versionIds.map((id) => [id, versionsOf(id, joined.segments[id] ?? [])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M3_START 이상에서 시작해 M3_END 이하에서 끝남(to: null 없음 — M2 independence.mjs가 1776부터 이음, joinEras '기간이 겹침' 앞에 까닭을 밝힘)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < M3_START || !Number.isInteger(t) || t > M3_END)) throw new Error(`americas colonial: ${id} 버전이 ${M3_START}~${M3_END} 밖(끝 ${M3_END} 이하 — M2가 1776부터 이음)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...NEC3_voids(), ...SEL3_voids(), ...NF3_voids(), ...MXC3_voids(), ...AND3_voids(), ...CAB3_voids()];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M3_START && Number.isInteger(t) && f < t && t <= M3_END)) throw new Error(`americas colonial: 비운 땅 기간 [${f}, ${t}) (${M3_START} 이상, 끝은 ${M3_END} 이하 — null 없음, 1776~는 M2)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 664개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// M3_START~M3_END만 만든다(특별 지시 2 — 1491 이하에는 이 권역 구역이 없음, 1492~1564는 북미 거의 전부·남미 대부분이 voids라 구역이 작음이 정상). 비운 땅이 바뀌는 해마다 구역 하나, 모두 끝이 있다(1776~는 M2 구역).
// 이 권역 나라가 소유표에 하나도 없는 기간(빈 틀·뼈대)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다).
// 손 도형(extra)은 조각 밖 땅이라 구역과 상관없다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([M3_START, M3_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => M3_START < y && y < M3_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `아메리카 식민 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

// 쓰이지 않는 이름 경고 막기(여섯 칸을 합친 뒤 남은 이름만)
void geomOfUnit;

export const era = {
  name: 'colonial',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 americas.mjs의 sourceOf(table.mjs AM_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
