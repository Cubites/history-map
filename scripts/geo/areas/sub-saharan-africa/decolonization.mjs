// sub-saharan-africa 시대 파일 decolonization (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1960~1974: 아프리카의 해부터 포르투갈령 독립 앞까지 (F2)
// 짝 항목 파일: data/entities/sub-saharan-africa-decolonization.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 앞 잇는 F1 항목 44는 sub-saharan-africa-modern.yaml, mauritania는 서아시아 middle-east-modern.yaml)
//   앞 시대 파일 postwar.mjs(F3, 1945~1959)가 같은 id로 앞을 잇는다(F2 항목 22 중 1945~1959에 있는 것·F1 항목 12 — 짝 항목 파일 sub-saharan-africa-postwar.yaml은 F3 새 항목 24)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F2 짜임 안내 (F2 뼈대 2026-11-11 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 3~6), F1 D1·창구 ③ R-Q1·R-Q2, F2 창구 ②(질문 0건·자동 승인 1·기본값 13), 지시문 f2/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령·몇 해 만에 끝난 분리는 칠하지 않음(카탕가·남카사이·비아프라·스탠리빌·시프타 전쟁·PAIGC 해방구 — 결정 5, 관계 줄도 없이 글).
//   새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(수단 공화국→말리 1960·남아프리카 연방→공화국 1961·탕가니카→탄자니아 1964·남로디지아→로디지아 1964·
//   프랑스령 소말릴란드→프랑스령 아파르족 및 이사족 지역 1967·콩고 인민 공화국 1970·자이르 1971)는 새 버전이 아니다 — 항목 글로(기본값 11·21).
// 1960 앞 버전: 이 시대 파일의 첫 해는 F2_START(1960)다. 1960 앞에 성립한 나라·식민지도 이 파일의 첫 버전은 1960부터이고, 1945~1959는 앞 시대 파일
//   postwar.mjs(F3)가 같은 id로 앞을 이음(1959 말 모양 = 이 파일의 1960 모양 — 식민지 18이 1960에 이 파일의 독립국으로 바뀌는 결정 점프 말고). 빈 땅 검사 구역은 이 파일이 1960~1974,
//   postwar.mjs가 1945~1959(아래 gapZones). 1944 이하에는 이 권역 땅이 비는 것이 정상이다.
// 시대 경계 맞물림: 앞 시대 파일 postwar.mjs(F3)의 끝 F3_END = 1960 = 이 파일의 F2_START(그 파일이 손으로 맞춘 확인 줄). 뒤 시대 파일 modern.mjs(F1)의 첫 해 F1_START = 1975 = 이 파일의 F2_END(미포함). 이 파일 버전의 끝은 모두 F2_END 이하이고(끝 없음 null 금지),
//   1975에 이어지는 나라(F1 항목 44 + mauritania)는 joinEras가 F1 버전 앞에 붙인다. 1974 말 모양은 F1의 1975 모양과 같아야 한다(결정 점프 — 포르투갈령 넷·프랑스령 코모로가
//   1975에 F1 angola·mozambique·cape-verde·sao-tome·comoros로 바뀜, 도형 같음 — 말고). 권역 파일의 joinEras 목록은 [postwarEra, decolonizationEra, modernEra](과거가 앞 — F3 뼈대 2026-11-12).
// 앞 잇는 항목: F1 항목 44(같은 id — 블록은 sub-saharan-africa-modern.yaml 그 자리, 글·tanzania from 1961·rhodesia from 1960만 칸이 고침)와
//   이웃 권역 항목 mauritania(서아시아 middle-east-modern.yaml 블록, 1960~1974 MRT 13조각 — 창구 ② 자동 승인 1건, SH 칸 own 줄. 서사하라로 넓히지 않음 — 기본값 18).
//   짝 항목 파일 밖 id도 주인으로 쓸 수 있다(F1 장치 시험 ①, F2 뼈대 장치 시험 ①이 이 파일에서 다시 확인 — f2/SKEL-NOTE.md 5절).
// 식민지 항목 색: 새 식민지 22(영국령 시에라리온 등)는 본국 색이 아니라 자기 색(뼈대가 같은 해 맞닿는 이웃과 ΔE 26 넘게 — 동남아·서아시아 식민지 선례). 본국은 data/relations.yaml의
//   vassal_of(칸 머리 아래). 지역 항목 rhodesia(uk 색)·aouzou-strip(chad 색 — 1973~, F1 D1 연장)은 F1 그대로. 같은 색 이웃 열쇠는 data/tests/allow/colors.yaml 칸 머리 아래.
// rhodesia 관계 해: 1960~1964는 vassal_of uk(남로디지아 자치 식민지 — F2 기본값 3), 1965-11-11 일방 독립 뒤는 관계 없음(결정 4). 같은 id·같은 땅(ZWE 10)이 1960~1979 한 줄로 이어진다
//   (항목 from 1965 → 1960은 SF 칸이 블록에서 고침 — P3). 관계 to는 독립·반환 해의 앞 해(관계 끝 해가 그해를 포함 — src/data/staticData.ts).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f2.mjs F2_*_IDS — F1 다섯 칸과 다른 여섯 칸)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F2 WA·GU·EA·SH·SE·SF 머리)과 그 칸 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GU_·EA_·SH_·SE_·SF_, import도 별칭(예: GU_X), ownSplit 묶음 이름도 앞머리(예: 'EA_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f2.mjs에 칸 머리 여섯이 있다(새 칼선 0). 칸이 칼선을 더하면 그 파일 자기 머리 아래에 export const <칸>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <칸>_CUT_… } from './cuts-f2.mjs'로 가져온다.
//   앞 단계 F1 칼선(cuts-f1.mjs — 지금 0)을 쓰면 별칭으로(import { X as SH_X } from './cuts-f1.mjs'). 앞 시대 F3 칼선(cuts-f3.mjs)도 같은 꼴 — F3 CE 북부 영국령 카메룬 띠 칼선은
//   GU 블록이 import { CE_CUT_… as GU_CUT_… } from './cuts-f3.mjs'로 가져와 1960 띠를 가른다(F3 CE 칸 예외, F3 기본값 5 — 좌표를 베끼지 않음).
// 칸 조각 목록: 칸 머리 안의 import { F2_<칸>_IDS } from './cuts-f2.mjs'는 칸 안 확인용(나라별 묶음 합 = 칸 몫)으로만 쓰고, 나라별 묶음은 칸 안에서 idsOf('<adm0>')·minus(idsOf('TCD'), 'TD-TI') 꼴로 다시 적는다.
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F2_START·F2_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F2_START(1960)부터, 해는 늘어나고 F2_END(1975) 전이다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(EA_TZ_MAINLAND, [[F2_START, 'british-tanganyika'], [1961, 'tanzania']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄 — 세인트헬레나·어센션 SHN, SF 칸, 기본값 4)만. 반투스탄은 남아공 색(기본값 15), 카탕가 등은 그 나라 색(결정 5).
// 늘림 나라: 앞 권역 나라(uk·france·portugal·spain·belgium·libya 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이웃 권역 항목 mauritania만 주인으로 쓴다(SH).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1 공통·F1 칸 머리·F2 공통·F2 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('decolonization');

const F2_START = 1960; // 이 시대 파일의 첫 해(1960년 말 모습). 그 앞(1959 이하)은 F3 시대 파일 몫
const F2_END = 1975; // 마지막 표의 끝(미포함) = 뒤 시대 파일 modern.mjs의 F1_START(1975)
const F1_START = 1975; // modern.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F2_END !== F1_START) throw new Error(`sub-saharan-africa decolonization: F2_END ${F2_END}가 F1 첫 해 ${F1_START}와 다름(1974/1975 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F1 modern.mjs와 같은 꼴 — F2 뼈대가 옮김, table.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F2_START || e[0] >= F2_END)) {
    throw new Error(`sub-saharan-africa decolonization: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F2_START} 이상 ${F2_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa decolonization: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F2_START, to = F2_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa decolonization: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa decolonization: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa decolonization: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa decolonization: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa decolonization: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F2 WA 서아프리카 대서양 쪽 (최상위 이름 WA_) ──
// 조각 F2_WA_IDS(라이베리아 15·시에라리온 4·기니 34·기니비사우 9·세네갈 14·감비아 6·카보베르데 21·코트디부아르 19 = 122), 구현 F2-WA
// 새 항목 4(sub-saharan-africa-decolonization.yaml WA 머리): british-sierra-leone(1960)·british-gambia(1960~1964)·portuguese-guinea(1960~1973)·portuguese-cape-verde(1960~1974)
// 앞 잇는 F1 항목 7: liberia·sierra-leone(1961~)·guinea·guinea-bissau(1974~, 기본값 1)·senegal(1960~ — 말리 연방은 항목 없음, 기본값 9)·gambia(1965~)·ivory-coast
// 점프: 1961 SLE·1965 GMB·1974 GNB(식민지 → 독립국, 도형 같음), 이음 1975 CPV portuguese-cape-verde → cape-verde. PAIGC 해방구는 칠하지 않음(결정 5)
import { F2_WA_IDS } from './cuts-f2.mjs';
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
const WA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// 독립·승인 해(사료 — 결과 노트 2절): 시에라리온 1961-04-27(위키 en Sierra Leone Colony and Protectorate 1808~1961)·감비아 1965-02-18(위키 en Gambia Colony and Protectorate 1821~1965)·
//   기니비사우 1974-09-10 포르투갈 승인(위키 en Portuguese Guinea — 1973-09-24 선언은 글, 기본값 1)·카보베르데 1975-07-05(위키 en Portuguese Cape Verde — 1975는 F1 cape-verde)·
//   라이베리아 1847·기니 1958-10-02·세네갈 1960-08-20(말리 연방 1960-06-20~08-20은 그해 말에 없음 — 기본값 9)·코트디부아르 1960-08-07 — 모두 첫 버전은 F2_START
const WA_OWN = [
  ['LBR', [[F2_START, 'liberia']]],
  ['SLE', [[F2_START, 'british-sierra-leone'], [1961, 'sierra-leone']]],
  ['GIN', [[F2_START, 'guinea']]],
  ['GNB', [[F2_START, 'portuguese-guinea'], [1974, 'guinea-bissau']]], // 비자고스 제도 포함. PAIGC 해방구(1967~1973)는 칠하지 않음(결정 5, 알려진 근사)
  ['SEN', [[F2_START, 'senegal']]],
  ['GMB', [[F2_START, 'british-gambia'], [1965, 'gambia']]],
  ['CPV', [[F2_START, 'portuguese-cape-verde']]], // 1975~는 F1 cape-verde(이음 해 결정 점프, 도형 같음)
  ['CIV', [[F2_START, 'ivory-coast']]],
];
const WA_IDS = WA_OWN.flatMap(([adm0]) => idsOf(adm0));
// 칸 안 확인: 나라별 묶음을 합치면 F2_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음)
if (WA_IDS.length !== F2_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F2_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa decolonization: WA 칸 나라별 조각 ${WA_IDS.length}개가 F2_WA_IDS ${F2_WA_IDS.length}개와 다름`);
}
for (const [adm0, line] of WA_OWN) own(idsOf(adm0), line);
// ── F2 WA 끝 ──

// ── F2 GU 기니만·적도 (최상위 이름 GU_) ──
// 조각 F2_GU_IDS(가나 10·토고 5·나이지리아 37·베냉 12·카메룬 10·중앙아프리카 17·가봉 9·콩고 공화국 12·적도 기니 6·상투메 프린시페 2 = 120), 구현 F2-GU
// 새 항목 3: british-cameroons(1960 — 남부 CM-NW·CM-SW 41,940)·spanish-guinea(1960~1967)·portuguese-sao-tome(1960~1974)
// 앞 잇는 F1 항목 9: ghana·togo·nigeria·benin·cameroon(1960 CMR − CM-NW·CM-SW, 1961~ 통째)·car·gabon·republic-of-congo·equatorial-guinea(1968~)
// 점프: 1961 CM-NW·CM-SW british-cameroons → cameroon(41,940)·1968 GNQ, 이음 1975 STP portuguese-sao-tome → sao-tome. 영국령 카메룬 북부 띠는 F3 CE 칼선 2로 가름 — 1960 british-cameroons, 1961 nigeria(+약 4.87만 km² — F3 기본값 5가 F2 기본값 2를 바꿈), 비아프라는 나이지리아 색(결정 5)
import { F2_GU_IDS } from './cuts-f2.mjs';
import { CE_CUT_NCAM as GU_CUT_NCAM } from './cuts-f3.mjs'; // F3 CE 칼선 2(북부 영국령 카메룬 띠) — 좌표는 cuts-f3.mjs 한 곳
const GU_BOUNDS = [1961]; // 1961: 북카메룬 띠 나눔(F3 CE 칼선 2)이 1960 한 해뿐이라 묶음 기간의 끝 — 1961~ 나이지리아는 통째(합친 도형 이음매가 생기지 않게). 1968은 own 줄의 해
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F2_GU_IDS 120)
const GU_GHA = idsOf('GHA'); // 가나 10
const GU_TGO = idsOf('TGO'); // 토고 5
const GU_NGA = idsOf('NGA'); // 나이지리아 37(영국령 카메룬 북부 띠는 칼선 2로 가름 — 1960 영국령 카메룬, 1961~ 나이지리아)
const GU_BEN = idsOf('BEN'); // 베냉 12
const GU_CM_SOUTH = ['CM-NW', 'CM-SW']; // 영국령 카메룬 남부(지금 북서·남서 지방, 바카시는 CM-SW 안) 41,940 km²
const GU_CMR = minus(idsOf('CMR'), ...GU_CM_SOUTH); // 프랑스 신탁 통치령에서 독립한 카메룬 8
const GU_CAF = idsOf('CAF'); // 중앙아프리카 17
const GU_GAB = idsOf('GAB'); // 가봉 9
const GU_COG = idsOf('COG'); // 콩고 공화국 12
const GU_GNQ = idsOf('GNQ'); // 적도 기니 6(비오코·리오무니·아노본)
const GU_STP = idsOf('STP'); // 상투메 프린시페 2
{
  const all = [GU_GHA, GU_TGO, GU_NGA, GU_BEN, GU_CM_SOUTH, GU_CMR, GU_CAF, GU_GAB, GU_COG, GU_GNQ, GU_STP].flat();
  if (all.length !== F2_GU_IDS.length || new Set(all).size !== all.length || all.some((id) => !F2_GU_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa decolonization: GU 묶음 합 ${all.length}개가 F2_GU_IDS ${F2_GU_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표)
own(GU_GHA, [[F2_START, 'ghana']]); // 1957-03-06 독립(1960 앞은 F3 몫), 1960 공화국은 정체만 바뀜
own(GU_TGO, [[F2_START, 'togo']]); // 1960-04-27 독립
ownSplit('GU_NGA', GU_NGA, [['띠', GU_CUT_NCAM]], '본토', {
  띠: [[F2_START, 'british-cameroons']], // 1961-02-11 주민 투표, 1961-06-01 나이지리아 사르다우나주
  본토: [[F2_START, 'nigeria']], // 1960-10-01 독립
}, { from: F2_START, to: 1961 });
own(GU_NGA, [[1961, 'nigeria']]); // 1961~ 띠를 합친 지금 나이지리아 땅(통째). 비아프라 1967~1970은 칠하지 않음(결정 5)
own(GU_BEN, [[F2_START, 'benin']]); // 1960-08-01 다호메이 공화국 독립(1975 베냉은 이름만)
own(GU_CMR, [[F2_START, 'cameroon']]); // 1960-01-01 독립
own(GU_CM_SOUTH, [[F2_START, 'british-cameroons'], [1961, 'cameroon']]); // 1961-02-11 주민 투표, 1961-10-01 카메룬 연방 공화국에 합침
own(GU_CAF, [[F2_START, 'car']]); // 1960-08-13 독립
own(GU_GAB, [[F2_START, 'gabon']]); // 1960-08-17 독립
own(GU_COG, [[F2_START, 'republic-of-congo']]); // 1960-08-15 독립
own(GU_GNQ, [[F2_START, 'spanish-guinea'], [1968, 'equatorial-guinea']]); // 1968-10-12 독립
own(GU_STP, [[F2_START, 'portuguese-sao-tome']]); // 1975-07-12 독립 — 1975부터 modern.mjs의 sao-tome
const GU_voids = () => [];
// ── F2 GU 끝 ──

// ── F2 EA 대호수·동아프리카 (최상위 이름 EA_) ──
// 조각 F2_EA_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30 = 183), 구현 F2-EA
// 새 항목 5: ruanda-urundi(1960~1961 RWA+BDI — 기본값 4)·british-uganda(1960~1961)·british-kenya(1960~1962)·british-tanganyika(1960 — 본토 25)·sultanate-of-zanzibar(1960~1963 — 섬 다섯 TZ-06·TZ-07·TZ-10·TZ-11·TZ-15, 기본값 6)
// 앞 잇는 F1 항목 6: dr-congo(1960~ — 카탕가·남카사이·스탠리빌은 그 나라 색, 결정 5)·rwanda·burundi(1962~)·uganda(1962~)·kenya(1963~)·tanzania(1961~ 본토, 1964~ 잔지바르 더함 — from 1964 → 1961은 이 칸이 블록에서)
// 점프: 1961 본토 → tanzania·1962 RWA·BDI·UGA·1963 KEN·1964 섬 다섯 → tanzania(+2,608 — 1만 밑이라 버전 열쇠 없음). 케냐 해안 16 km(10마일) 띠는 케냐 식민지 색(기본값 7, 알려진 근사)
import { F2_EA_IDS } from './cuts-f2.mjs';
const EA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않음
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F2_EA_IDS 183)
const EA_COD = idsOf('COD'); // 11 — 카탕가 CD-KA 포함(카탕가국 1960-07-11~1963-01-21·남카사이국·스탠리빌 정권은 콩고 색, 결정 5)
const EA_RWA = idsOf('RWA'); // 5
const EA_BDI = idsOf('BDI'); // 17
const EA_UGA = idsOf('UGA'); // 112
const EA_KEN = idsOf('KEN'); // 8 — 해안 16 km 띠(케냐 보호령, 술탄 주권)도 케냐 식민지 색(기본값 7, 알려진 근사)
const EA_ZANZIBAR = ['TZ-06', 'TZ-07', 'TZ-10', 'TZ-11', 'TZ-15']; // 웅구자섬·펨바섬 다섯 조각 2,608 km²
const EA_TZ_MAINLAND = minus(idsOf('TZA'), ...EA_ZANZIBAR); // 본토 25
{
  const all = [EA_COD, EA_RWA, EA_BDI, EA_UGA, EA_KEN, EA_ZANZIBAR, EA_TZ_MAINLAND].flat();
  const want = new Set(F2_EA_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa decolonization: EA 나라별 묶음 합 ${all.length}이 F2_EA_IDS ${want.size}와 다름`);
  }
}
own(EA_COD, [[F2_START, 'dr-congo']]); // 1960-06-30 벨기에에서 독립
own(EA_RWA, [[F2_START, 'ruanda-urundi'], [1962, 'rwanda']]); // 1962-07-01 신탁 통치 끝, 둘로 갈라져 독립
own(EA_BDI, [[F2_START, 'ruanda-urundi'], [1962, 'burundi']]); // 1962-07-01
own(EA_UGA, [[F2_START, 'british-uganda'], [1962, 'uganda']]); // 1962-10-09 독립
own(EA_KEN, [[F2_START, 'british-kenya'], [1963, 'kenya']]); // 1963-12-12 독립
own(EA_TZ_MAINLAND, [[F2_START, 'british-tanganyika'], [1961, 'tanzania']]); // 1961-12-09 탕가니카 독립(같은 항목 tanzania — 0단계 기본값 17)
own(EA_ZANZIBAR, [[F2_START, 'sultanate-of-zanzibar'], [1964, 'tanzania']]); // 1963-12-10 독립·1964-01-12 혁명·1964-04 탕가니카와 합침(+2,608 — 1만 밑)
const EA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F2 EA 끝 ──

// ── F2 SH 사헬·뿔·나일 (최상위 이름 SH_) ──
// 조각 F2_SH_IDS(말리 9·모리타니 13·니제르 8·부르키나파소 45·차드 22·에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·수단 17·남수단 10 = 161), 구현 F2-SH
// 새 항목 1: eritrea-federation(1960~1961 ERI 6, vassal_of ethiopia — 기본값 5)
// 앞 잇는 F1 항목 9: mali·niger·burkina-faso·chad(1960~1972 통째, 1973~ TD-TI 뺌)·aouzou-strip(1973~ TD-TI, F1 D1 연장 — 기본값 10)·ethiopia(1960~1961 ETH, 1962~ ETH+ERI)·djibouti·somalia(SOM+SOL)·sudan(SDN+SDS)
//   + 이웃 권역 항목 mauritania(서아시아 블록, 1960~ MRT 13 — 자동 승인 1건, 서사하라로 넓히지 않음)
// 점프: 1962 ERI eritrea-federation → ethiopia(123,658)·1973 TD-TI chad → aouzou-strip(120,941). 수단 남부 자치·시프타 전쟁은 칠하지 않음(기본값 13)
import { F2_SH_IDS } from './cuts-f2.mjs';
const SH_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않음(1962·1973 점프는 own 줄의 해로 충분)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F2_SH_IDS 161)
const SH_MLI = idsOf('MLI'); // 9
const SH_MRT = idsOf('MRT'); // 13 — 서아시아 항목 mauritania(스페인령 사하라 쪽 서아시아 조각은 건드리지 않음 — 기본값 18)
const SH_NER = idsOf('NER'); // 8
const SH_BFA = idsOf('BFA'); // 45
const SH_TIBESTI = ['TD-TI']; // 티베스티 120,941 km² — 1973~ 아우주 띠(F1 D1 연장, 기본값 10)
const SH_TCD = minus(idsOf('TCD'), ...SH_TIBESTI); // 21
const SH_ETH = idsOf('ETH'); // 11
const SH_ERI = idsOf('ERI'); // 6 — 1960~1961 에리트레아 연방, 1962~ 에티오피아(기본값 5)
const SH_DJI = idsOf('DJI'); // 6
const SH_SOM = idsOf('SOM', 'SOL'); // 13 + 1 — 1960-07-01 합침 뒤 한 나라(영국령 소말릴란드 닷새 독립은 그해 말 규칙상 없음)
const SH_SDN = idsOf('SDN', 'SDS'); // 17 + 10 — 남부 반군 지배·1972~ 남부 자치는 수단 색(기본값 13)
{
  const all = [SH_MLI, SH_MRT, SH_NER, SH_BFA, SH_TIBESTI, SH_TCD, SH_ETH, SH_ERI, SH_DJI, SH_SOM, SH_SDN].flat();
  const want = new Set(F2_SH_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa decolonization: SH 나라별 묶음 합 ${all.length}이 F2_SH_IDS ${want.size}와 다름`);
  }
}
own(SH_MRT, [[F2_START, 'mauritania']]); // 1960-11-28 프랑스에서 독립(서아시아 항목 — 자동 승인 앞 버전)
own(SH_MLI, [[F2_START, 'mali']]); // 1960-06-20 말리 연방 독립, 1960-08-20 세네갈 이탈, 1960-09-22 말리 공화국(말리 연방은 그해 말 규칙상 없음 — 기본값 9)
own(SH_NER, [[F2_START, 'niger']]); // 1960-08-03 독립
own(SH_BFA, [[F2_START, 'burkina-faso']]); // 1960-08-05 오트볼타 공화국 독립(이름만 1984 — 기본값 11)
own(SH_TCD, [[F2_START, 'chad']]); // 1960-08-11 독립
own(SH_TIBESTI, [[F2_START, 'chad'], [1973, 'aouzou-strip']]); // 1973 리비아군이 차지(차드 색 지역 항목 + occupied_by libya — F1 D1)
own(SH_ETH, [[F2_START, 'ethiopia']]); // 에티오피아 제국
own(SH_ERI, [[F2_START, 'eritrea-federation'], [1962, 'ethiopia']]); // 1952-09-15 연방, 1962-11-15 의회 해산·병합
own(SH_DJI, [[F2_START, 'djibouti']]); // 프랑스령 소말릴란드(1967 프랑스령 아파르족 및 이사족 지역 — 이름만), vassal_of france는 F1 줄
own(SH_SOM, [[F2_START, 'somalia']]); // 1960-07-01 두 옛 식민지가 합쳐 독립
own(SH_SDN, [[F2_START, 'sudan']]); // 1956-01-01 독립
const SH_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F2 SH 끝 ──

// ── F2 SE 남동·인도양 (최상위 이름 SE_) ──
// 조각 F2_SE_IDS(잠비아 10·말라위 28·모잠비크 11·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹 FR-RE·마요트 FR-YT = 112), 구현 F2-SE
// 새 항목 5: northern-rhodesia(1960~1963)·nyasaland(1960~1963)·portuguese-mozambique(1960~1974)·british-mauritius(1960~1967)·french-comoros(1960~1974 COM 3 — 마요트 FR-YT는 mayotte)
// 앞 잇는 F1 항목 7: zambia·malawi(1964~)·madagascar·mauritius(1968~)·seychelles(vassal_of uk 줄은 F1 그대로)·reunion·mayotte
// 점프: 1964 ZMB·MWI·1968 MUS, 이음 1975 MOZ portuguese-mozambique → mozambique·COM french-comoros → comoros. 영국령 인도양 지역 1965(세이셸에서 떼어 낸 섬)는 알려진 근사
import { F2_SE_IDS } from './cuts-f2.mjs';
const SE_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않음
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F2_SE_IDS 112)
const SE_ZMB = idsOf('ZMB'); // 10
const SE_MWI = idsOf('MWI'); // 28 — 말라위호 리코마섬·치주물루섬 포함(모잠비크 물 안의 말라위 땅)
const SE_MOZ = idsOf('MOZ'); // 11
const SE_MDG = idsOf('MDG'); // 22
const SE_MUS = idsOf('MUS'); // 14
const SE_SYC = idsOf('SYC'); // 22 — 1965~1976 영국령 인도양 지역으로 떼어 낸 알다브라·파르쿠하르·데로슈는 지도 자료에 없음(재면 0 km²)
const SE_COM = idsOf('COM'); // 3 — 그랑드코모르섬·앙주앙섬·모엘리섬
const SE_REU = ['FR-RE']; // 레위니옹(조각 하나)
const SE_MYT = ['FR-YT']; // 마요트(조각 하나)
{
  const all = [SE_ZMB, SE_MWI, SE_MOZ, SE_MDG, SE_MUS, SE_SYC, SE_COM, SE_REU, SE_MYT].flat();
  const want = new Set(F2_SE_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa decolonization: SE 나라별 묶음 합 ${all.length}이 F2_SE_IDS ${want.size}와 다름`);
  }
}
own(SE_ZMB, [[F2_START, 'northern-rhodesia'], [1964, 'zambia']]); // 1964-10-24 잠비아 독립(연방 1963-12-31 해체)
own(SE_MWI, [[F2_START, 'nyasaland'], [1964, 'malawi']]); // 1964-07-06 말라위 독립
own(SE_MOZ, [[F2_START, 'portuguese-mozambique']]); // 1975-06-25 독립 — 1975~ mozambique는 F1
own(SE_MDG, [[F2_START, 'madagascar']]); // 1960-06-26 말라가시 공화국 독립
own(SE_MUS, [[F2_START, 'british-mauritius'], [1968, 'mauritius']]); // 1968-03-12 독립
own(SE_SYC, [[F2_START, 'seychelles']]); // 영국 식민지(관계 vassal_of uk 1814~1975는 F1), 1976-06-29 독립
own(SE_COM, [[F2_START, 'french-comoros']]); // 1975-07-06 독립 선언 — 1975~ comoros는 F1
own(SE_REU, [[F2_START, 'reunion']]); // 프랑스 해외 데파르트망(관계 F1)
own(SE_MYT, [[F2_START, 'mayotte']]); // 프랑스령 코모로의 한 섬, 1974·1976 주민 투표로 잔류(관계 F1)
const SE_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F2 SE 끝 ──

// ── F2 SF 남부 (최상위 이름 SF_) ──
// 조각 F2_SF_IDS(짐바브웨 10·앙골라 18·보츠와나 15·레소토 10·에스와티니 4·나미비아 13·남아프리카 9·세인트헬레나 SHN 2 = 81), 구현 F2-SF
// 새 항목 4: portuguese-angola(1960~1974 AGO 18, 카빈다 포함)·bechuanaland(1960~1965)·basutoland(1960~1965)·swaziland-protectorate(1960~1967)
// 앞 잇는 F1 항목 6: rhodesia(1960~ ZWE — from 1965 → 1960은 이 칸이 블록에서, 기본값 3)·botswana·lesotho(1966~)·eswatini(1968~)·south-west-africa(1960~ NAM, vassal_of 그대로 — 기본값 12)·south-africa(반투스탄은 남아공 색)
// 점프: 1966 BWA·LSO·1968 SWZ, 이음 1975 AGO portuguese-angola → angola. 세인트헬레나·어센션 SH-HL·SH-AC는 1960~1974 내내 주인 null + voids(기본값 4 — SF_voids에 V(F2_START, F2_END, …))
import { F2_SF_IDS } from './cuts-f2.mjs';
const SF_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않음
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F2_SF_IDS 81)
const SF_ZWE = idsOf('ZWE'); // 10 — 남로디지아·로디지아(영국 색 지역 항목)
const SF_AGO = idsOf('AGO'); // 18 — 카빈다 AO-CAB 포함
const SF_BWA = idsOf('BWA'); // 15
const SF_LSO = idsOf('LSO'); // 10
const SF_SWZ = idsOf('SWZ'); // 4
const SF_NAM = idsOf('NAM'); // 13 — 월비스베이 NA-ER 포함(F1 근사 그대로)
const SF_ZAF = idsOf('ZAF'); // 9 — 반투스탄(트란스케이 1963 자치 등)은 남아공 색(0단계 기본값 15)
const SF_SHN = idsOf('SHN'); // 2 — SH-HL·SH-AC
{
  const all = [SF_ZWE, SF_AGO, SF_BWA, SF_LSO, SF_SWZ, SF_NAM, SF_ZAF, SF_SHN].flat();
  const want = new Set(F2_SF_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa decolonization: SF 나라별 묶음 합 ${all.length}이 F2_SF_IDS ${want.size}와 다름`);
  }
}
own(SF_ZWE, [[F2_START, 'rhodesia']]); // 1960~1964 영국 자치 식민지 남로디지아(vassal_of uk), 1964-10 로디지아라 부름, 1965-11-11 일방적 독립 — 도형·색 같음(결정 4·기본값 3)
own(SF_AGO, [[F2_START, 'portuguese-angola']]); // 1975-11-11 독립 — 1975부터 F1 angola(같은 도형)
own(SF_BWA, [[F2_START, 'bechuanaland'], [1966, 'botswana']]); // 1966-09-30 독립
own(SF_LSO, [[F2_START, 'basutoland'], [1966, 'lesotho']]); // 1966-10-04 독립
own(SF_SWZ, [[F2_START, 'swaziland-protectorate'], [1968, 'eswatini']]); // 1968-09-06 독립
own(SF_NAM, [[F2_START, 'south-west-africa']]); // 1966-10-27 유엔 총회 위임 종료 결의 뒤에도 남아공이 다스림 — 그대로(기본값 12)
own(SF_ZAF, [[F2_START, 'south-africa']]); // 1961-05-31 남아프리카 연방 → 공화국은 이름만(기본값 11)
// 세인트헬레나·어센션(SHN): 줄을 적지 않아 시대 내내 주인 null
const SF_voids = () => [V(F2_START, F2_END, ...SF_SHN)]; // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(0단계 기본값 4)
// ── F2 SF 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F2_START, ...WA_BOUNDS, ...GU_BOUNDS, ...EA_BOUNDS, ...SH_BOUNDS, ...SE_BOUNDS, ...SF_BOUNDS, F2_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F2_START || BOUNDS.at(-1) !== F2_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa decolonization: 표 경계 해 ${BOUNDS.join(', ')}는 ${F2_START}~${F2_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa decolonization: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa decolonization: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa decolonization: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa decolonization: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa decolonization: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F2_END) throw new Error(`sub-saharan-africa decolonization: 마지막 표의 끝이 ${joined.TO} (${F2_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F2_END(1975) 그대로(끝 없음 null을 쓰지 않음 — 1975~는 modern.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GU_voids(), ...EA_voids(), ...SH_voids(), ...SE_voids(), ...SF_voids()];
if (voids.some(([f, t]) => f < F2_START || t === null || t > F2_END)) throw new Error(`sub-saharan-africa decolonization: 비운 땅의 기간은 ${F2_START}~${F2_END} 안이어야 함(끝 없음 null 금지 — 1975~는 modern.mjs 몫)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F2_START(1960)~F2_END(1975, 미포함)만 만든다(1945~1959는 postwar.mjs 구역 '사하라 이남 전후 …'가, 1975~는 modern.mjs 구역 '사하라 이남 현대 …'가 이음 — 1944 이하에는 이 권역 구역이 없음).
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역의 끝은 F2_END. 이름 '사하라 이남 탈식민 <from>~<to-1>'(F1 '사하라 이남 현대 …'와 겹치지 않음).
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F2_START, F2_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => F2_START < y && y < F2_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `사하라 이남 탈식민 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void geomOfUnit; // 여섯 칸이 쓰지 않는 이름 경고 막기(합치기가 칸이 쓰기 시작한 이름을 지움)

export const era = {
  name: 'decolonization',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
