// americas 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1900~현재: 지금 나라와 20세기 국경 마무리 (M1)
// 짝 항목 파일: data/entities/americas-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 다른 도우미 모듈. areas/americas.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/americas/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/americas.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 아메리카 M1 짜임 안내 (M1 뼈대 2026-11-15 — 근거: docs/americas/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 2·3·6, 창구 ② 1·3·7·10, 기본값 1·4·6·7), M1 창구 ②(Q1 (B)·Q2 1933), 기본값 G1~G24, 메인 결정 M-M1-1~8, 지시문 am-m1/m1/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 greenland-ice-sheet(그린란드 빙상 — 기본값 G4) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(점령은 관계 occupied_by usa만 — G14). 새 버전은 1만 km² 넘게 바뀔 때만.
//   이름만 바뀌는 해(영국령 온두라스→벨리즈 1973·수리남 1954 왕국 구성국·그린란드 1953·1979·2009 등)는 새 버전이 아니다 — 항목 글로(P7).
// 1900 앞 버전 없음: 이 시대 파일이 이 권역의 첫 국경 단계라 첫 해는 M1_START(1900, 1900년 말 모습 — G9)다. 1900 앞에 성립한 나라도 첫 버전은 1900부터이고(M2가 같은 id로 앞을 이음),
//   1900 뒤 성립이면 그 해(쿠바 1902·파나마 1903·트리니다드 토바고 1962·가이아나 1966 등). 1899 이하 이 권역 땅은 M2 시대 파일 independence.mjs 몫(이 파일은 russia 1898~1899 늘림만 — 아래, 이 파일의 빈 땅 검사 구역은 1900부터만).
// 결정 점프(P1): 1902 cuba·1903 colombia→panama(PA-*)와 bolivia→brazil(BR-AC)·1909 볼리비아–페루 띠→peru·1918 russia→soviet-union·1929 chile→peru(PE-TAC)·1933 greenland 섬 전체·
//   1938 차코→paraguay·1942 에콰도르–페루 교환 둘·1949 newfoundland→canada·1966 british-guiana→guyana·1975 dutch-suriname→suriname·1992 soviet-union→russia-fed. 그 밖에 1만 km² 넘게 바뀌면 칸 결과 노트 2절에 까닭.
// usa(미국): 항목은 data/entities/americas-modern.yaml US-M1 머리(west.yaml에서 글자 그대로 옮김 — 0단계 기본값 4). 1776~1899는 M2 시대 파일 independence.mjs(조각 바탕 — 옛 손그림은 M2 US-M2가 지움),
//   1900~는 이 파일 US-M1 머리(조각 바탕). 1899 = 1900 모양으로 이어짐(G8 점프 닫힘).
// 늘림 나라(권역 파일 EXTENDABLE — 0단계 창구 ② 결정 3·G6): 유럽 항목 russia [1778, 1918)(1778~1897은 M2 independence.mjs, 이 파일은 1898부터)·soviet-union [1918, 1992)·russia-fed [1992, null). 땅은 추코트카 RU-CHU(US-M1 own 줄)와 180° 틈 띠(US-M1 손 도형).
//   russia 1898~1899는 표 첫 해 앞이라 extra(…, { units: ['RU-CHU'] })로 더한다(M1_EARLY — 1900~ 표 줄과 같은 단위면 한 버전으로 이어져 유럽 1898~1905 버전이 1900에서 갈리지 않음). 다른 앞 권역 나라(uk·denmark·france·netherlands)는 주인으로 쓰지 않는다 — 관계로만(P2).
// 손 도형 둘(조각 밖 — 0단계 기본값 1·6, COMMON 10절 '날짜변경선'): 알류샨 동경 쪽 상자 [172, 51, 180, 54] ∩ 육지(약 2,039 km² → usa)·러시아 손 도형 동변 179.90°~180° 틈 띠(약 3,000 km² → 러시아 계열).
//   US-M1이 cuts-m1.mjs 자기 머리에 US_… 이름으로 두고 이 파일 자기 머리에서 extra(id, from, to, { shape, name })로 더한다(조각 줄 단위와 합집합 — 아래 '표 밖 땅').
// 칸 사이 주인 공유 둘(COMMON 4절 '칸을 넘는 항목'): CA-M1이 PA-* 12조각에 [[M1_START, 'colombia'], [1903, 'panama']](colombia 블록 글은 SA-N-M1) ·
//   SA-N-M1이 페루 북쪽 이음매 다섯(PE-TUM·PE-PIU·PE-CAJ·PE-AMA·PE-LOR)에 peru(peru 블록 글은 SC-M1). 그 밖에 칸은 자기 몫이 아닌 조각에 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-m1.mjs M1_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(M1 NA-M1·US-M1·CA-M1·SA-N-M1·SC-M1·LA-M1 머리)과 그 칸 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·extra 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 NA_·US_·CAM_·SAN_·SC_·LA_, import도 별칭(예: NA_K1), ownSplit 묶음 이름도 앞머리(예: 'SC_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
// 칼선 파일: cuts-m1.mjs에 칸 머리 여섯이 있다(뼈대는 새 칼선 0 — 자리 이름만). 칸이 칼선을 더하면 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고,
//   이 파일 칸 머리 안에서 import { <앞머리>_CUT_… as <앞머리>_… } from './cuts-m1.mjs'로 가져온다(좌표를 베끼지 않음 — check:generator '파일 사이 좌표 되풀이').
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(M1_START·M1_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M1_START(1900)부터, 해는 늘어난다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(idsOf('CAN'), [[M1_START, 'canada']]) · own(['PY-15', 'PY-16', 'PY-19'], [[M1_START, null], [1938, 'paraguay']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(칸 voids에 한 줄과 이유 — 쿠바 1900~1901·그린란드 동·북 1900~1932·차코 1900~1937·볼리비아–페루 띠 1900~1908·속령 섬·작은 앤틸리스 독립 앞)만.
// 시대 경계 맞물림: 앞 시대 파일은 M2 independence.mjs(끝 해 M2_END = M1_START). M2 usa는 1899에서 끝나고 이 파일 usa는 1900부터(아래 확인 줄). 끝까지 이어지는 버전은 to: null(PRESENT 2026년 말 모습 = 2027년 모습).
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 americas.mjs의 sourceOf가 이 권역 나라 모두에 table.mjs AM_SOURCE_TEXT를 붙인다(usa도 같은 문구 — 1776~1899는 M2 independence.mjs).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(아메리카 첫판·M1 공통·M1 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M1_NA_IDS, M1_US_IDS, M1_CAM_IDS, M1_SAN_IDS, M1_SC_IDS, M1_LA_IDS } from './cuts-m1.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('modern');

const M1_START = 1900; // 이 시대 파일의 첫 해(1900년 말 모습). 그 앞(1899 이하)은 M2 시대 파일 independence.mjs 몫
const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)
const M1_END = PRESENT + 1; // 마지막 표의 끝(미포함)

// ── 조각 소유표 도우미 (동남아 modern.mjs와 같은 꼴, 표가 여럿 — 사하라 이남 F1 뼈대 꼴 — M1 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M1_START || e[0] >= M1_END)) {
    throw new Error(`americas modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M1_START} 이상 ${M1_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`americas modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M1_START, to = M1_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`americas modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`americas modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`americas modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`americas modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`americas modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── 표 밖 땅 (M1 뼈대 — 칸 머리에서 부름, 이 도우미는 고치지 않음) ─────────────────────────────
// extra(나라 id, from, to(끝 없음 null), { units, shape, name }): 소유표 밖에서 그 기간 그 나라 버전에 더하는 땅.
//   - units: 조각 id·나눈 부분 이름 목록. 표 첫 해(M1_START) 앞은 M1_EARLY의 나라만(G6 — russia 1898~1899 RU-CHU). 표 줄과 같은 단위 목록이 이어지면 한 버전이 된다
//   - shape·name: 조각 밖 손 도형(멀티폴리곤 — 바다 쪽은 빌드가 육지와 교차)과 그 이름(칸 앞머리로 — 예 'US_ALEUTIAN_E'). 같은 이름은 같은 도형이어야 한다
//   버전 = 그해 표 줄의 단위 ∪ 더하는 단위 ∪ 손 도형(손 도형 하나뿐이면 그 도형 그대로). 버전은 표 줄·더하는 땅의 기간 경계에서 나뉘고 같은 모양이 이어지면 한 버전이다
const M1_EARLY = { russia: 1898 }; // 표 첫 해 앞을 쓸 수 있는 나라와 그 첫 해(1900을 걸치는 유럽 russia 1898~1905 버전 — 권역 파일 EXTENDABLE russia 첫 해는 M2가 1778로 넓힘, 1778~1897은 independence.mjs)
const extras = [];
const extraShapes = new Map(); // 손 도형 이름 → 도형
const extra = (id, from, to, { units = [], shape = null, name = null } = {}) => {
  const end = to ?? M1_END;
  const first = M1_EARLY[id] ?? M1_START;
  if (!Number.isInteger(from) || !Number.isInteger(end) || from >= end || from < first || end > M1_END) throw new Error(`americas modern: ${id}의 표 밖 땅 기간 [${from}, ${to}) (첫 해 ${first} 이상, 끝 ${M1_END} 이하 또는 null)`);
  if (!Array.isArray(units) || (!units.length && !shape)) throw new Error(`americas modern: ${id}의 표 밖 땅 ${from}~에 단위도 손 도형도 없음`);
  if (shape && !name) throw new Error(`americas modern: ${id}의 손 도형에 이름이 없음`);
  if (name && !shape) throw new Error(`americas modern: 손 도형 이름 ${name}에 도형이 없음`);
  if (name && extraShapes.has(name) && extraShapes.get(name) !== shape) throw new Error(`americas modern: 손 도형 이름 ${name}이 다른 도형에 겹침`);
  if (name) extraShapes.set(name, shape);
  extras.push({ id, from, to: end, units: [...units], name });
};

// ── M1 NA-M1 북미 북부·카리브 (최상위 이름 NA_) ──
// 조각 M1_NA_IDS(캐나다 13·그린란드 6·쿠바 16·아이티 10·도미니카 공화국 32·자메이카 14·바하마 22·HOLE-1 + 속령 섬 44(M1_NA_ISLAND_IDS)·FR-GP·FR-MQ = 160), 구현 NA-M1
// 항목(새 8): canada·newfoundland(~1949, CA-NL 통째 1900~1948 — P4)·greenland(1900~1932 서·남, 1933~ 섬 전체 — Q2·결정 1)·cuba(1902~)·haiti·dominican-republic·jamaica·bahamas
// 칼선 자리: NA_CUT_GLSM(K1 — GL-SM 동서 분수령, G4)·NA_CUT_75N(북위 75° — GL-QA, Q2). voids: 쿠바 CU-* 1900~1901(G2)·그린란드 동·북(K1 동쪽·북위 75° 북쪽·GRL-2742·GRL-2738 피투피크) 1900~1932·
//   속령 섬 44와 FR-GP·FR-MQ 내내(G13 — 이유 '1만 km² 미만 섬 — 0단계 기본값 7·M1 G13'). 점프: 1902 cuba·1933 greenland·1949 CA-NL newfoundland→canada
const NA_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음. 나눈 조각 둘(K1·북위 75°)은 시대 내내 같은 모양으로 나누고 주인만 1933에 바뀌어 표 경계 해를 더하지 않음
import { NA_CUT_GLSM as NA_K1, NA_CUT_75N as NA_N75, M1_NA_ISLAND_IDS as NA_ISLAND_IDS } from './cuts-m1.mjs';
const NA_ISLANDS = [...NA_ISLAND_IDS, 'FR-GP', 'FR-MQ']; // 칠하지 않는 속령 섬 44 + 과들루프·마르티니크(G13)
const NA_CA_REST = idsOf('CAN').filter((id) => id !== 'CA-NL'); // 캐나다 12(북극 제도 포함 — G22)
const NA_GL_WS = ['GL-KU', 'GL-QE']; // 그린란드 남부(쿠야레크)·서부(케케타)
const NA_GL_EN = ['GRL-2742', 'GRL-2738']; // 북동 그린란드 국립공원·피투피크(북위 76.5° — C-M1-13)
own(NA_CA_REST, [[M1_START, 'canada']]);
own(['CA-NL'], [[M1_START, 'newfoundland'], [1949, 'canada']]); // 래브라도 내륙도 1900부터(Q1 (B) — 1927-03-01 추밀원 판결), 1949-03-31 캐나다 합류
own(NA_GL_WS, [[M1_START, 'greenland']]);
const NA_GLSM = ownSplit('NA_GLSM', ['GL-SM'], [['동쪽', NA_K1]], '서쪽', { 동쪽: [[M1_START, null], [1933, 'greenland']], 서쪽: [[M1_START, 'greenland']] }); // 세르메르소크 — K1 동쪽은 1933-04-05 판결부터(결정 1)
const NA_GLQA = ownSplit('NA_GLQA', ['GL-QA'], [['북쪽', NA_N75]], '남쪽', { 북쪽: [[M1_START, null], [1933, 'greenland']], 남쪽: [[M1_START, 'greenland']] }); // 카수이추프(지금 아반나타·케케르탈리크) — 북위 75° 북쪽은 1933부터(Q2)
own(NA_GL_EN, [[M1_START, null], [1933, 'greenland']]);
own(idsOf('CUB'), [[M1_START, null], [1902, 'cuba']]); // 1902-05-20 공화국(G2)
own(idsOf('HTI'), [[M1_START, 'haiti']]);
own(idsOf('DOM'), [[M1_START, 'dominican-republic']]);
own(idsOf('JAM'), [[M1_START, 'jamaica']]);
own([...idsOf('BHS'), 'HOLE-1'], [[M1_START, 'bahamas']]); // HOLE-1은 이나과섬 둘레 1 km²
own(NA_ISLANDS, [[M1_START, null]]);
{ // 칸 안 확인: 칸 몫 조각 160을 한 번씩 다 씀(통째 114 + 나눈 조각 2 + 비움 44)
  const used = [...NA_CA_REST, 'CA-NL', ...NA_GL_WS, 'GL-SM', 'GL-QA', ...NA_GL_EN, ...idsOf('CUB', 'HTI', 'DOM', 'JAM', 'BHS'), 'HOLE-1', ...NA_ISLANDS];
  if (used.length !== M1_NA_IDS.length || new Set(used).size !== used.length || used.some((id) => !M1_NA_IDS.includes(id))) throw new Error(`americas modern: NA-M1 칸 조각 ${used.length}개가 M1_NA_IDS ${M1_NA_IDS.length}개와 다름`);
}
const NA_voids = () => [
  B(M1_START, 1933, NA_GLSM.동쪽, NA_GLQA.북쪽), // 그린란드 동·북 — 1933 상설국제사법재판소 판결 앞(결정 1·Q2)
  V(M1_START, 1933, ...NA_GL_EN), // 같은 까닭(북동 국립공원 땅·피투피크)
  V(M1_START, 1902, ...idsOf('CUB')), // 쿠바 1900~1901 — 주권자 없음(미국 군정, G2)
  V(M1_START, null, ...NA_ISLANDS), // 1만 km² 미만 섬 — 0단계 기본값 7·M1 G13(속령)
];
// ── M1 NA-M1 끝 ──

// ── M1 US-M1 미국·추코트카 (최상위 이름 US_) ──
// 조각 M1_US_IDS(미국 50 — 하와이 없음, 워싱턴 D.C. 포함·러시아 RU-CHU 1 = 51) + 손 도형 둘(알류샨 동경 쪽·180° 틈 띠 — 짜임 안내), 구현 US-M1
// 항목: 새 항목 없음 — usa(옮긴 블록, 1900~ 조각 바탕 새 도형)·유럽 russia·soviet-union·russia-fed(늘림 — RU-CHU 1898~, own 줄 [[M1_START, 'russia'], [1918, 'soviet-union'], [1992, 'russia-fed']] 꼴, 1898~1899는 extra)
// usa 1900 첫 모양: 조각 50 + 알류샨 동경 쪽(G12 — 알래스카 경계 1900부터 지금 선). 1899 = 1900 모양(M2 US-M2가 손그림을 없애 G8 점프 닫힘)
const US_BOUNDS = []; // 처음 값: 이 칸 안 앞 권역 도형이 바뀌는 해 없음(M2 usa는 1899에서 끝남 — independence.mjs)
const US_voids = () => [
  B(M1_START, null, US_RUCHU.서경밖), // 조각 RU-CHU의 서경 180° 서쪽 띠(폭 약 10 m) — 경위도 범위 밖 꼭짓점이라 칠하지 않음(합치기)
];
import { US_ALEUT_EAST as US_ALEUT, US_RU_GAP180 as US_GAP, US_CUT_W180 as US_W180 } from './cuts-m1.mjs';
const US_USA = idsOf('USA'); // 미국 50(48주·알래스카·워싱턴 D.C. — 하와이는 오세아니아 몫이라 조각 없음, 푸에르토리코 PRI는 NA-M1 voids)
const US_RU = idsOf('RUS'); // RU-CHU 하나(추코트카 서경 쪽 — 브랑겔섬 서경 쪽 몫 포함)
if (US_USA.length !== 50 || US_RU.length !== 1 || US_RU[0] !== 'RU-CHU' || US_USA.length + US_RU.length !== M1_US_IDS.length || ![...US_USA, ...US_RU].every((id) => M1_US_IDS.includes(id))) throw new Error('americas modern: US-M1 조각 묶음이 M1_US_IDS(51)와 다름');
// usa 1900~: 조각 50 + 알류샨 동경 쪽. 알래스카–캐나다 경계는 1900부터 지금 선(G12 — 1903-10-20 판정은 글). 애투·키스카 일본 점령(1942~1943)은 칠하지 않음(G14 — 전쟁 파일 몫)
own(US_USA, [[M1_START, 'usa']]);
extra('usa', M1_START, null, { shape: US_ALEUT, name: 'US_ALEUTIAN_E' });
// 러시아 계열 늘림(0단계 창구 ② 결정 3·기본값 6, 권역 파일 EXTENDABLE): 추코트카 서경 쪽 RU-CHU와 180° 틈 띠. 1898~1899는 표 첫 해 앞이라 extra(G6 — 유럽 russia 1898~1905 버전이 1900에서 갈리지 않게)
// RU-CHU는 서경 180° 서쪽 띠(조각 자료의 서경 180.0002° 꼭짓점)를 떼어 비우고 나머지를 칠함(합치기 — build:data 경위도 범위 검사)
const US_RUCHU = ownSplit('US_RUCHU', US_RU, [['서경밖', US_W180]], '본토', { 서경밖: [[M1_START, null]], 본토: [[M1_START, 'russia'], [1918, 'soviet-union'], [1992, 'russia-fed']] });
extra('russia', 1898, 1900, { units: [US_RUCHU.본토] });
extra('russia', 1898, 1918, { shape: US_GAP, name: 'US_RU_GAP180' });
extra('soviet-union', 1918, 1992, { shape: US_GAP, name: 'US_RU_GAP180' });
extra('russia-fed', 1992, null, { shape: US_GAP, name: 'US_RU_GAP180' });
// ── M1 US-M1 끝 ──

// ── M1 CA-M1 멕시코·중앙아메리카 (최상위 이름 CAM_) ──
// 조각 M1_CAM_IDS(멕시코 32·과테말라 22·벨리즈 6·온두라스 18·엘살바도르 14·니카라과 17·코스타리카 7·파나마 12 = 128), 구현 CA-M1
// 항목(새 8): mexico·guatemala·belize(vassal_of uk ~1980)·honduras·el-salvador·nicaragua·costa-rica·panama(1903~). PA-* 12조각은 [[M1_START, 'colombia'], [1903, 'panama']](G19 — colombia 블록 글은 SA-N-M1)
// 모스키티아 HN-GD 17,744 km²: G15(온두라스 색 전 기간) — M-M1-3로 니카라과 실효 지배가 문서로 분명하면 [[M1_START, 'honduras'], [1912, 'nicaragua'], [1961, 'honduras']] 꼴(칼선 0)
const CAM_BOUNDS = []; // 처음 값: 이 칸 안 앞 권역 도형이 바뀌는 해 없음(조각 통째 — 주인만 바뀜)
const CAM_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// 나라별 조각 묶음(칸 안에 다시 적음 — 합이 M1_CAM_IDS 128과 같은지 아래 확인 줄)
const CAM_OWN = [['MEX', 'mexico'], ['GTM', 'guatemala'], ['BLZ', 'belize'], ['HND', 'honduras'], ['SLV', 'el-salvador'], ['NIC', 'nicaragua'], ['CRI', 'costa-rica']];
const CAM_PAN = idsOf('PAN'); // 파나마 지협 12조각
{
  const mine = [...CAM_OWN.flatMap(([adm0]) => idsOf(adm0)), ...CAM_PAN];
  if (mine.length !== M1_CAM_IDS.length || new Set(mine).size !== mine.length || mine.some((id) => !M1_CAM_IDS.includes(id))) {
    throw new Error(`americas modern: CA-M1 조각 ${mine.length}개가 M1_CAM_IDS ${M1_CAM_IDS.length}개와 다름`);
  }
}
// 1900~끝까지 그 나라 하나. 벨리즈는 1981-09-21 독립 앞 영국령 온두라스(관계 vassal_of uk 1862~1980 — 땅 같음, 1973 이름만 바뀜)
// 온두라스는 모스키티아 HN-GD 17,744 km²(그라시아스아디오스)까지 전 기간(G15 — 1906-12-23 스페인 왕 판정을 니카라과가 1907 받아들였고 1960-11-18 ICJ가 효력 확인.
//   1912~1960 니카라과 실효 지배는 문서로 닫지 못함(M-M1-3 — 결과 노트 2절·장부 후보), 온두라스는 1957-02-21 그라시아스아디오스주를 만들기 전 이 땅을 행정 구역상 콜론주 이리오나에 넣었음 — 실제 지배 범위는 미확인)
for (const [adm0, id] of CAM_OWN) own(idsOf(adm0), [[M1_START, id]]);
// 파나마 지협: 1903-11-03 콜롬비아에서 갈라짐 — 1900~1902는 콜롬비아(G19, colombia 블록 글은 SA-N-M1). 운하 지대 1,432 km²는 파나마 색(G23)
own(CAM_PAN, [[M1_START, 'colombia'], [1903, 'panama']]);
// ── M1 CA-M1 끝 ──

// ── M1 SA-N-M1 안데스 북부·기아나 (최상위 이름 SAN_) ──
// 조각 M1_SAN_IDS(콜롬비아 32·베네수엘라 25·에콰도르 24·가이아나 10·수리남 10·FR-GF 1·페루 북쪽 이음매 PE-TUM·PE-PIU·PE-CAJ·PE-AMA·PE-LOR 5 = 107), 구현 SA-N-M1
// 항목(새 8): colombia·venezuela·ecuador·british-guiana(~1966)·guyana(1966~)·dutch-suriname(~1975)·suriname(1975~)·french-guiana(vassal_of france). 페루 이음매 다섯의 주인은 peru(블록 글은 SC-M1)
// 칼선 자리: SAN_CUT_1942_EC(에콰도르가 내놓은 땅 약 18,552 — 1900~1941 ecuador, 1942 peru)·SAN_CUT_1942_PE(페루가 내놓은 땅 약 5,072 — 1900~1941 peru, 1942 ecuador)(G17)·
//   SAN_CUT_PUTUMAYO(반영 — 창구 ③ Q-R1: 푸투마요강–카케타강 사이 1900~1929 비움, 1930 colombia. 레티시아 사다리꼴은 1900부터 colombia — 1만 km² 밑 알려진 근사)
// 칼선 이름 꼬리 = 가르는 조각의 나라(cuts-m1.mjs SA-N-M1 머리): SAN_CUT_1942_EC는 에콰도르 조각 안 교환 땅 A(페루가 내놓음), SAN_CUT_1942_PE는 페루 조각 안 교환 땅 B(에콰도르가 내놓음)
import { SAN_CUT_1942_EC as SAN_CUT_A, SAN_CUT_1942_PE as SAN_CUT_B, SAN_CUT_PUTUMAYO as SAN_CUT_FT } from './cuts-m1.mjs';
const SAN_BOUNDS = [1930, 1942]; // 1900~1929 표에서만 푸투마요–카케타 땅을, 1900~1941 표에서만 교환 땅을 나누고, 1930(살로몬–로사노 조약 인계)·1942(리우 의정서 1942-01-29)부터는 조각 통째
const SAN_voids = () => [
  B(M1_START, 1930, SAN_COFT.띠), // 푸투마요강–카케타강 사이 — 1922 살로몬–로사노 조약(1928 발효·1930 인계) 앞, 행정이 문서로 분명하지 않은 띠(창구 ② Q1 (B) 잣대 — 창구 ③ Q-R1)
];
// 조각 묶음(나라별 — 합이 M1_SAN_IDS와 같아야 함)
const SAN_COL = idsOf('COL'); // 콜롬비아 32
const SAN_VEN = idsOf('VEN'); // 베네수엘라 25
const SAN_ECU = idsOf('ECU'); // 에콰도르 24
const SAN_GUY = idsOf('GUY'); // 가이아나 10
const SAN_SUR = idsOf('SUR'); // 수리남 10
const SAN_GUF = ['FR-GF']; // 프랑스령 기아나 1
const SAN_PE = ['PE-TUM', 'PE-PIU', 'PE-CAJ', 'PE-AMA', 'PE-LOR']; // 페루 북쪽 이음매 다섯(주인 peru — 블록 글은 SC-M1)
const SAN_EC_A = ['EC-U', 'EC-D']; // 교환 땅 A를 품는 에콰도르 조각(수쿰비오스·오레야나)
const SAN_PE_B = ['PE-LOR']; // 교환 땅 B를 품는 페루 조각(로레토)
const SAN_CO_FT = ['CO-AMA', 'CO-PUT']; // 푸투마요–카케타 땅을 품는 콜롬비아 조각(아마소나스·푸투마요)
{
  const all = [...SAN_COL, ...SAN_VEN, ...SAN_ECU, ...SAN_GUY, ...SAN_SUR, ...SAN_GUF, ...SAN_PE];
  const want = [[SAN_COL, 32], [SAN_VEN, 25], [SAN_ECU, 24], [SAN_GUY, 10], [SAN_SUR, 10]];
  if (want.some(([ids, n]) => ids.length !== n) || all.length !== M1_SAN_IDS.length || new Set(all).size !== all.length || all.some((id) => !M1_SAN_IDS.includes(id))) {
    throw new Error(`americas modern: SA-N-M1 묶음 합 ${all.length}개가 M1_SAN_IDS ${M1_SAN_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표)
own(SAN_COL.filter((id) => !SAN_CO_FT.includes(id)), [[M1_START, 'colombia']]); // 1831 그란콜롬비아 해체 뒤 누에바그라나다. PA-* 1900~1902는 CA-M1 줄(G19)
const SAN_COFT = ownSplit('SAN_CO_FT', SAN_CO_FT, [['띠', SAN_CUT_FT]], '나머지', {
  띠: [[M1_START, null]], // 푸투마요강–카케타강 사이(페루 정착지·고무 회사 땅, 콜롬비아는 청구뿐) — 1930 인계까지 비움(창구 ③ Q-R1)
  나머지: [[M1_START, 'colombia']], // 카케타강 북쪽·궤피 서쪽 푸투마요 상류·레티시아 사다리꼴(1만 km² 밑 — 알려진 근사)
}, { from: M1_START, to: 1930 });
own(SAN_CO_FT, [[1930, 'colombia']]); // 1930 인계 뒤 지금 경계(통째). 1932~1933 레티시아 점령은 글
own(SAN_VEN, [[M1_START, 'venezuela']]); // 에세키보 재주장 1962는 글(G8)
own(SAN_ECU.filter((id) => !SAN_EC_A.includes(id)), [[M1_START, 'ecuador']]); // 오리엔테 EC-S·EC-Y·EC-Z·EC-N도 1900부터(Q1 (B))
ownSplit('SAN_EC_A', SAN_EC_A, [['교환', SAN_CUT_A]], '나머지', {
  교환: [[M1_START, 'peru']], // 1936 현상 유지선에서 페루가 가진 아과리코 아래쪽 북동 띠(G17) — 1942-01-29 리우 의정서로 에콰도르에
  나머지: [[M1_START, 'ecuador']],
}, { from: M1_START, to: 1942 });
own(SAN_EC_A, [[1942, 'ecuador']]); // 1942~ 지금 경계(통째)
own(SAN_PE.filter((id) => !SAN_PE_B.includes(id)), [[M1_START, 'peru']]); // 툼베스·피우라·카하마르카·아마소나스(1900부터 페루 — 지금 경계)
ownSplit('SAN_PE_B', SAN_PE_B, [['교환', SAN_CUT_B]], '나머지', {
  교환: [[M1_START, 'ecuador']], // 1936 현상 유지선에서 에콰도르가 가진 파스타사·티그레·쿠라라이 위쪽 띠(G17) — 1942-01-29 리우 의정서로 페루에
  나머지: [[M1_START, 'peru']], // 마이나스(Q1 (B) — 1853 로레토 정부, 1936 현상 유지선)
}, { from: M1_START, to: 1942 });
own(SAN_PE_B, [[1942, 'peru']]); // 1942~ 지금 경계(통째)
own(SAN_GUY, [[M1_START, 'british-guiana'], [1966, 'guyana']]); // 1966-05-26 독립. 에세키보는 1899 파리 판정부터(G8), 피라라 1904·티그리는 최종선(G16)
own(SAN_SUR, [[M1_START, 'dutch-suriname'], [1975, 'suriname']]); // 1975-11-25 독립. 1954 왕국 구성국은 이름 글, 마로니 상류는 근사(G16)
own(SAN_GUF, [[M1_START, 'french-guiana']]); // 아마파 1900-12-01 판정 뒤 오야포크선(G7), 1946 해외 데파르트망은 이름 글
// ── M1 SA-N-M1 끝 ──

// ── M1 SC-M1 안데스 중부·남콘·브라질 (최상위 이름 SC_) ──
// 조각 M1_SC_IDS(페루 21·볼리비아 9·칠레 16·아르헨티나 24·우루과이 19·파라과이 18·FLK-5152·브라질 26·SGS·HOLE-2·HOLE-3·HOLE-4 = 138), 구현 SC-M1
// 항목(새 8): peru·bolivia·chile·argentina·uruguay·paraguay·falkland-islands(vassal_of uk)·brazil. 점프: 1903 BR-AC bolivia→brazil(G3)·1909 볼리비아–페루 띠→peru·1929 PE-TAC chile→peru(G18)·1938 차코→paraguay
// 칼선 자리: SC_CUT_1909(볼리비아–페루 1909 앞 볼리비아 청구 땅 — 페루 남쪽 조각 안 약 10.3만 1900~1908 비움, Q1·검토 F1 ㉯. 볼리비아 쪽 약 91,726은 1900부터 bolivia — M-M1-6). voids: 차코 PY-15·PY-16·PY-19 1900~1937·볼리비아–페루 띠 1900~1908·SGS 내내(G13)
import { SC_CUT_1909 as SC_K1909 } from './cuts-m1.mjs';
const SC_BOUNDS = [1909]; // 1900~1908 표에서만 1909 띠를 나누고(반영 — 검토 F1), 1909(폴로–산체스 부스타만테 조약 1909-09-17)부터는 조각 통째
// 조각 묶음(합 138 — 아래 확인 줄)
const SC_PE_TAC = ['PE-TAC']; // 타크나 — 1929-06-03 리마 조약(1929-08-28 발효)으로 페루에 돌아감(G18)
const SC_PE = idsOf('PER').filter((id) => !M1_SAN_IDS.includes(id) && !SC_PE_TAC.includes(id)); // 페루 남쪽 20(북쪽 이음매 다섯은 SA-N-M1)
const SC_PE_1909 = ['PE-MDD', 'PE-UCA', 'PE-CUS', 'PE-PUN']; // 1909 띠를 품는 페루 조각(마드레데디오스·우카얄리·쿠스코·푸노)
const SC_BO = idsOf('BOL'); // 볼리비아 9 — 판도(BO-N) 등 1909 볼리비아 쪽도 1900부터(M-M1-6: 1890 국가 대표부·1893 북서 대표부·1900-03-08 북서 식민 국가 준주)
const SC_BR_AC = ['BR-AC']; // 아크리 — 1903-11-17 페트로폴리스 조약으로 브라질(G3)
const SC_BR = [...idsOf('BRA').filter((id) => !SC_BR_AC.includes(id)), 'HOLE-4']; // 브라질 25 + 연방구 구멍
const SC_CL = idsOf('CHL'); // 칠레 16(안토파가스타 G20·이스터섬 CL-VS 안 — 0단계 기본값 3)
const SC_AR = idsOf('ARG'); // 아르헨티나 24(파타고니아 1902 판정선 1900부터 — G10·G16)
const SC_UY = [...idsOf('URY'), 'HOLE-3']; // 우루과이 19 + 구멍
const SC_PY_CHACO = ['PY-15', 'PY-16', 'PY-19']; // 차코 보레알 — 1938-07-21 부에노스아이레스 평화·우호·국경 조약(Q1·기본값 20)
const SC_PY = idsOf('PRY').filter((id) => !SC_PY_CHACO.includes(id)); // 파라과이 동쪽 15
const SC_FLK = ['FLK-5152']; // 포클랜드 제도(1982 아르헨티나 점령은 글 — G14)
const SC_EMPTY = ['SGS', 'HOLE-2']; // 사우스조지아(1만 km² 미만 속령 — G13)·남부 파타고니아 빙원 미획정 구간(1998 협정에도 선을 긋지 않은 몫)
const SC_ALL = [...SC_PE, ...SC_PE_TAC, ...SC_BO, ...SC_BR_AC, ...SC_BR, ...SC_CL, ...SC_AR, ...SC_UY, ...SC_PY_CHACO, ...SC_PY, ...SC_FLK, ...SC_EMPTY];
if (SC_ALL.length !== M1_SC_IDS.length || new Set(SC_ALL).size !== SC_ALL.length || SC_ALL.some((id) => !M1_SC_IDS.includes(id))) throw new Error(`americas modern SC-M1: 칸 조각 ${SC_ALL.length}개(M1_SC_IDS ${M1_SC_IDS.length}개와 같아야 함)`);
own(SC_PE.filter((id) => !SC_PE_1909.includes(id)), [[M1_START, 'peru']]);
const SC_PE1909 = ownSplit('SC_PE_1909', SC_PE_1909, [['띠', SC_K1909]], '나머지', {
  띠: [[M1_START, null]], // 1909 앞 볼리비아 청구 땅(마드레데디오스·푸루스) — 비움(창구 ② Q1)
  나머지: [[M1_START, 'peru']],
}, { from: M1_START, to: 1909 });
own(SC_PE_1909, [[1909, 'peru']]); // 1909 조약 뒤 지금 경계(통째)
own(SC_PE_TAC, [[M1_START, 'chile'], [1929, 'peru']]);
own(SC_BO, [[M1_START, 'bolivia']]);
own(SC_BR_AC, [[M1_START, 'bolivia'], [1903, 'brazil']]);
own(SC_BR, [[M1_START, 'brazil']]);
own(SC_CL, [[M1_START, 'chile']]);
own(SC_AR, [[M1_START, 'argentina']]);
own(SC_UY, [[M1_START, 'uruguay']]);
own(SC_PY_CHACO, [[M1_START, null], [1938, 'paraguay']]);
own(SC_PY, [[M1_START, 'paraguay']]);
own(SC_FLK, [[M1_START, 'falkland-islands']]);
own(SC_EMPTY, [[M1_START, null]]);
const SC_voids = () => [
  V(1900, 1938, ...SC_PY_CHACO), // 1938 조약 앞 분쟁 띠 — Q1·기본값 20
  B(M1_START, 1909, SC_PE1909.띠), // 1909-09-17 폴로–산체스 부스타만테 조약 앞 볼리비아 청구 땅 — 창구 ② Q1
  V(1900, null, 'SGS'), // 1만 km² 미만 해외 땅 — G13
  V(1900, null, 'HOLE-2'), // 남부 파타고니아 빙원 미획정 구간(칠레–아르헨티나 1998 협정이 선을 긋지 않은 몫 — 1만 km² 미만)
];
// ── M1 SC-M1 끝 ──

// ── M1 LA-M1 작은 앤틸리스 독립국 (최상위 이름 LA_) ──
// 조각 M1_LA_IDS(트리니다드 토바고 16·세인트키츠 네비스 14·세인트루시아 11·바베이도스 11·도미니카 연방 10·앤티가 바부다 7·그레나다 6·세인트빈센트 그레나딘 5 = 80), 구현 LA-M1(2라운드 — M-M1-5)
// 항목(새 8): trinidad-and-tobago(1962~)·barbados(1966~)·grenada(1974~)·dominica(1978~)·saint-lucia(1979~)·saint-vincent-and-the-grenadines(1979~)·antigua-and-barbuda(1981~)·saint-kitts-and-nevis(1983~) — 독립 해부터, 관계 없음
// 독립일(위키 en 정보 상자·본문 첫머리 둘로 닫음 — 결과 노트 2절): 1962-08-31·1966-11-30·1974-02-07·1978-11-03·1979-02-22·1979-10-27·1981-11-01·1983-09-19. 그해 말 모습이라 독립 해부터 칠함
// 섬 나눔: 그레나딘 제도 남쪽(카리아쿠·프티트마르티니크)은 GRD 조각, 북쪽(베키아·무스티크 등)은 VCT 조각 — adm0 그대로. 앵귈라(AIA)는 NA-M1 속령 voids(이 칸 밖)
const LA_STATES = [
  ['TTO', 'trinidad-and-tobago', 1962], // 1962-08-31 독립
  ['BRB', 'barbados', 1966], // 1966-11-30 독립
  ['GRD', 'grenada', 1974], // 1974-02-07 독립
  ['DMA', 'dominica', 1978], // 1978-11-03 독립(공화국)
  ['LCA', 'saint-lucia', 1979], // 1979-02-22 독립
  ['VCT', 'saint-vincent-and-the-grenadines', 1979], // 1979-10-27 독립
  ['ATG', 'antigua-and-barbuda', 1981], // 1981-11-01 독립
  ['KNA', 'saint-kitts-and-nevis', 1983], // 1983-09-19 독립
];
// 칸 안 확인: 여덟 나라 조각을 합치면 M1_LA_IDS 80과 같아야 함
{
  const mine = LA_STATES.flatMap(([a]) => idsOf(a));
  if (mine.length !== M1_LA_IDS.length || mine.some((id) => !M1_LA_IDS.includes(id))) throw new Error(`americas modern: LA-M1 조각 ${mine.length}개가 M1_LA_IDS ${M1_LA_IDS.length}개와 다름`);
}
for (const [a, id, y] of LA_STATES) own(idsOf(a), [[M1_START, null], [y, id]]);
const LA_BOUNDS = []; // 조각 통째 — 주인만 바뀜(독립 해는 own 줄)
// 독립 앞 1만 km² 미만 속령 — 0단계 기본값 7·M-M1-5(영국 식민지 시기는 칠하지 않음)
const LA_voids = () => LA_STATES.map(([a, , y]) => V(M1_START, y, ...idsOf(a)));
// ── M1 LA-M1 끝 ──


// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M1_START, ...NA_BOUNDS, ...US_BOUNDS, ...CAM_BOUNDS, ...SAN_BOUNDS, ...SC_BOUNDS, ...LA_BOUNDS, M1_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M1_START || BOUNDS.at(-1) !== M1_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`americas modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${M1_START}~${M1_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`americas modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`americas modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`americas modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`americas modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`americas modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== M1_END) throw new Error(`americas modern: 마지막 표의 끝이 ${joined.TO} (${M1_END}이어야 함)`);
// 버전: 표 줄의 단위 목록과 표 밖 땅(extra)을 해 구간마다 합쳐, 같은 모양(단위 목록·손 도형 이름)이 이어지는 기간이 한 버전. 끝까지 이어지는 버전은 to: null.
// 앞 권역 도형 빼기는 없다(1900~ 이 권역 조각과 겹치는 앞 권역 도형 없음 — table.mjs 머리)
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
    return [from, to === M1_END ? null : to, geom];
  });
};
const versionIds = [...new Set([...Object.keys(joined.segments), ...extras.map((e) => e.id)])];
const versions = Object.fromEntries(versionIds.map((id) => [id, versionsOf(id, joined.segments[id] ?? [])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M1_START(M1_EARLY 나라는 그 해) 이상에서 시작, usa는 M2 independence.mjs usa(1776~1899)의 끝 해 1900에서 바로 이어짐
for (const [id, list] of Object.entries(versions)) {
  const first = M1_EARLY[id] ?? M1_START;
  if (list.some(([f]) => f < first)) throw new Error(`americas modern: ${id} 버전이 ${first} 앞에서 시작함`);
}
if (versions.usa && versions.usa[0][0] !== M1_START) throw new Error(`americas modern: usa 첫 버전 ${versions.usa[0][0]} — M2 independence.mjs의 usa가 ${M1_START - 1}에서 끝나므로 ${M1_START}부터 이어야 함`);

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...NA_voids(), ...US_voids(), ...CAM_voids(), ...SAN_voids(), ...SC_voids(), ...LA_voids()];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M1_START && (t === null || (Number.isInteger(t) && f < t && t <= M1_END)))) throw new Error(`americas modern: 비운 땅 기간 [${f}, ${t}) (${M1_START} 이상, 끝은 ${M1_END} 이하 또는 null)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 664개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// M1_START(1900)부터만 만든다(첫 국경 단계 — 1899 이하에는 이 권역 구역이 없음, 특별 지시 2). 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역은 끝이 없다.
// 이 권역 나라가 소유표에 하나도 없는 기간(빈 틀·뼈대)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다).
// 손 도형(extra)은 조각 밖 땅이라 구역과 상관없다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([M1_START, M1_END, ...voids.flatMap(([f, t]) => [f, t ?? M1_END]).filter((y) => M1_START < y && y < M1_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? M1_END)).map(([, , g]) => g);
  const open = to === M1_END;
  return [{ name: open ? `아메리카 현대 ${from}~` : `아메리카 현대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to: open ? null : to }];
});

void I; void minus; void geomOfUnit; // 여섯 칸이 쓰지 않는 이름 경고 막기

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 americas.mjs의 sourceOf(table.mjs AM_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
