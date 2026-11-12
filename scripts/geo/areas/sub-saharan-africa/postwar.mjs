// sub-saharan-africa 시대 파일 postwar (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1945~1959: 2차 대전 뒤부터 아프리카의 해 앞까지 (F3)
// 짝 항목 파일: data/entities/sub-saharan-africa-postwar.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 앞 잇는 F2 항목 22는 sub-saharan-africa-decolonization.yaml, F1 항목 12는 sub-saharan-africa-modern.yaml)
//   앞 시대 파일 colonial.mjs(F4, 1910~1944)가 같은 id로 앞을 잇는다(이 파일 항목 23·F2 항목 21·F1 항목 9 중 1910~1944에 있는 것 — 짝 항목 파일 sub-saharan-africa-colonial.yaml은 F4 새 항목 14, 사하라 이남 F4 뼈대 2026-11-12)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F3 짜임 안내 (F3 뼈대 2026-11-12 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 1·3~6), F1 창구 ③ R-Q1·R-Q2, F2 창구 ②·③, 서아시아 A1 창구 ①, F3 창구 ②(질문 0건·자동 승인 0·기본값 13), 지시문 f3/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령·나라 일부의 협정 시정·봉기는 칠하지 않음(오가덴·하우드 영국 시정은 에티오피아 색, 마다가스카르 1947 봉기 반군 지배지는
//   프랑스령 마다가스카르 색 — 기본값 3·11, 관계 줄도 없이 글). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(1946 프랑스 연합 해외 영토·토고·카메룬 위임 →
//   신탁 통치·레위니옹 데파르트망·코모로 해외 영토, 1951 포르투갈 해외 주, 1953 로디지아 니아살랜드 연방, 1958 프랑스 공동체 자치 공화국, 1959 말리 연방·스페인령 기니 두 주)는
//   새 버전이 아니다 — 항목 글로(기본값 9·10·12, 연방은 구성 단위별 항목 — 0단계 결정 3).
// 1945 앞 버전: 이 시대 파일의 첫 해는 F3_START(1945)다. 1945 앞에 성립한 나라·식민지도 이 파일의 첫 버전은 1945부터이고, 1910~1944는 앞 시대 파일 colonial.mjs(F4)가 같은 id로 앞을 이음
//   (1944 말 모양 = 이 파일의 1945 모양 — 오트볼타 세 몫은 GW 블록이 1945~1946도 같은 몫으로, F4 기본값 9). 빈 땅 검사 구역은 이 파일이 1945~1959, colonial.mjs가 1910~1944(아래 gapZones). 1909 이하에는 이 권역 땅이 비는 것이 정상이다.
// 시대 경계 맞물림: 앞 시대 파일 colonial.mjs(F4)의 끝 F4_END = 1945 = 이 파일의 F3_START(그 파일이 손으로 맞춘 확인 줄). 뒤 시대 파일 decolonization.mjs(F2)의 첫 해 F2_START = 1960 = 이 파일의 F3_END(미포함). 이 파일 버전의 끝은 모두 F3_END 이하이고(끝 없음 null 금지),
//   1960에 이어지는 나라(F2 항목 22·F1 항목 12 — 같은 id)는 joinEras가 F2 버전 앞에 붙인다. 1959 말 모양은 F2의 1960 모양과 같아야 한다(결정 점프 — 식민지 18이 1960에
//   F2 독립국으로 바뀜, 도형 같음, somalia는 somalia-italian-trust·british-somaliland 두 항목의 합 — 말고). 권역 파일의 joinEras 목록은 [colonialEra, postwarEra, decolonizationEra, modernEra](과거가 앞 — F4 뼈대 2026-11-12).
// 앞 잇는 항목 34: F2 항목 22(sub-saharan-africa-decolonization.yaml)·F1 항목 12(sub-saharan-africa-modern.yaml) — 같은 id, 블록은 그 자리(파일 소유표 — COMMON 5절, 글만 칸이 고침).
//   항목 from 고침은 rhodesia 1960 → 1923 하나(남로디지아 책임 자치 1923-10-01 — 기본값 2, SF 칸). 짝 항목 파일 밖 id도 주인으로 쓸 수 있다(F2 뼈대 장치 시험 ①, F3 뼈대 장치 시험 ①).
//   서아시아 mauritania는 늘리지 않는다 — 1945~1959 모리타니는 새 식민지 항목 french-mauritania(기본값 8, middle-east-modern.yaml 블록 바이트 그대로).
// 식민지 항목 색: 새 항목 24(프랑스령 세네갈 등)는 본국 색이 아니라 자기 색(뼈대가 같은 해 맞닿는 이웃과 ΔE 26 넘게 — 동남아·서아시아·F2 식민지 선례). 본국은 data/relations.yaml의
//   vassal_of(칸 머리 아래). 같은 땅에서 앞뒤로 이어지는 항목(군정 → 신탁 통치·연방, 식민지 → F2 독립국)은 달라도 된다. 같은 색 이웃 열쇠는 data/tests/allow/colors.yaml 칸 머리 아래.
// 군정 항목: eritrea-british-admin(칠하는 해 1945~1951)·somalia-british-admin(1945~1949)은 level: region·항목 from 1941(서아시아 libya-british-admin 선례 — 이탈리아 식민지에 영국 군정,
//   1947 파리 강화 조약 뒤에도 다음 단위 앞 해까지 occupied_by uk), 이어 eritrea-federation 1952~·somalia-italian-trust 1950~(vassal_of italy). anglo-egyptian-sudan은 관계 줄 없음(공동 통치 — 기본값 7).
// rhodesia 관계 해: vassal_of uk 1923~1964(남로디지아 책임 자치 1923-10-01 — F3 기본값 2, F2 1960~1964 줄의 from만 당김), 1965-11-11 일방 독립 뒤는 관계 없음(결정 4). 관계 to는 독립·반환 해의
//   앞 해(관계 끝 해가 그해를 포함 — src/data/staticData.ts).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f3.mjs F3_*_IDS — F2 여섯 칸과 다른 여섯 칸 WA·GW·CE·HN·EA·SF)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F3 WA·GW·CE·HN·EA·SF 머리)과
//   그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GW_·CE_·HN_·EA_·SF_, import도 별칭(예: GW_X), ownSplit 묶음 이름도 앞머리(예: 'GW_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f3.mjs에 칸 머리 여섯이 있다. 새 칼선 둘 — GW 영국령 토골란드 서쪽 경계(1945~1956, 기본값 4)·CE 북부 영국령 카메룬 띠(시대 내내, 기본값 5). 칸은 그 파일 자기 머리 아래에
//   export const <칸>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <칸>_CUT_… } from './cuts-f3.mjs'로 가져온다. CE 칼선은 F2 decolonization.mjs GU 블록도 별칭(GU_CUT_…)으로 가져와
//   1960 nigeria·british-cameroons 모양을 가른다(CE 칸 예외 — F2 기본값 2 '1960 나이지리아 색'이 이 칼선으로 바뀜). 앞 단계 칼선(cuts-f1.mjs·cuts-f2.mjs — 지금 0)을 쓰면 별칭으로.
// 칸 조각 목록: 칸 머리 안의 import { F3_<칸>_IDS } from './cuts-f3.mjs'는 칸 안 확인용(나라별 묶음 합 = 칸 몫)으로만 쓰고, 나라별 묶음은 칸 안에서 idsOf('<adm0>')·minus(idsOf('CMR'), 'CM-NW', 'CM-SW') 꼴로 다시 적는다.
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F3_START·F3_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인 — GW 토골란드 칼선 { from: F3_START, to: 1957 }은 GW_BOUNDS의 1957).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F3_START(1945)부터, 해는 늘어나고 F3_END(1960) 전이다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(HN_SDN, [[F3_START, 'anglo-egyptian-sudan'], [1956, 'sudan']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄 — 세인트헬레나·어센션 SHN, SF 칸, 0단계 기본값 4)만. F3 땅은 그 밖에 모두 1945부터 주인이 있다.
// 늘림 나라: 앞 권역 나라(uk·france·belgium·italy·portugal·spain 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이 단계에 늘림은 없다(창구 ② 자동 승인 0건).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1 공통·F1 칸 머리·F2 공통·F2 칸 머리·F3 공통·F3 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('postwar');

const F3_START = 1945; // 이 시대 파일의 첫 해(1945년 말 모습). 그 앞(1944 이하)은 F4 시대 파일 몫
const F3_END = 1960; // 마지막 표의 끝(미포함) = 뒤 시대 파일 decolonization.mjs의 F2_START(1960)
const F2_START = 1960; // decolonization.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F3_END !== F2_START) throw new Error(`sub-saharan-africa postwar: F3_END ${F3_END}가 F2 첫 해 ${F2_START}와 다름(1959/1960 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F2 decolonization.mjs와 같은 꼴 — F3 뼈대가 옮김, table.mjs·decolonization.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F3_START || e[0] >= F3_END)) {
    throw new Error(`sub-saharan-africa postwar: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F3_START} 이상 ${F3_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa postwar: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F3_START, to = F3_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa postwar: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa postwar: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa postwar: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa postwar: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa postwar: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F3 WA 서아프리카 대서양 쪽·서사헬 (최상위 이름 WA_) ──
// 조각 F3_WA_IDS(라이베리아 15·시에라리온 4·감비아 6·기니비사우 9·카보베르데 21·세네갈 14·기니 34·모리타니 13·말리 9 = 125), 구현 F3-WA
// 새 항목 4(sub-saharan-africa-postwar.yaml WA 머리): french-senegal(1945~1959 SEN)·french-sudan(1945~1959 MLI)·french-mauritania(1945~1959 MRT — 서아시아 mauritania 대신, 기본값 8)·french-guinea(1945~1957 GIN)
// 앞 잇는 항목 6: F1 liberia·guinea(1958~ — 항목 from 1958) · F2 british-sierra-leone·british-gambia·portuguese-guinea·portuguese-cape-verde(1945~, 1951 해외 주는 글 — 기본값 10)
// 점프: 1958 GIN french-guinea → guinea(245,818), 이음 1960 SEN·MLI·MRT french-senegal·french-sudan·french-mauritania → senegal·mali·mauritania(도형 같음). 말리 연방 1959는 항목 없이 글(기본값 9)
import { F3_WA_IDS } from './cuts-f3.mjs';
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
const WA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// 성립·독립 해(사료 — 결과 노트 2절): 프랑스령 세네갈 1659 생루이 상관(위키 fr Colonie du Sénégal — 1895 프랑스령 서아프리카, 1946 해외 영토, 1958-11-25 자치 공화국)·
//   프랑스령 수단 1890 이름(위키 en French Sudan — 1958-11-24 수단 공화국, 1959-04-04 말리 연방)·프랑스령 모리타니 1904 민정 영토(위키 en Colonial Mauritania — 1920-12-04 식민지, 1958-11-28 이슬람 공화국)·
//   프랑스령 기니 1891(위키 en French Guinea — 1958-09-28 국민 투표 반대, 1958-10-02 독립) — 1945 앞 성립은 모두 첫 버전 F3_START(F4가 같은 id로 앞을 이음)
//   말리 연방(1959-04-04~1960-08-20)은 항목 없이 세네갈·수단 따로(기본값 9), 1951 포르투갈 해외 주는 이름만(기본값 10)
const WA_OWN = [
  ['LBR', [[F3_START, 'liberia']]],
  ['SLE', [[F3_START, 'british-sierra-leone']]],
  ['GMB', [[F3_START, 'british-gambia']]],
  ['GNB', [[F3_START, 'portuguese-guinea']]], // 비자고스 제도 포함
  ['CPV', [[F3_START, 'portuguese-cape-verde']]],
  ['SEN', [[F3_START, 'french-senegal']]], // 이음 1960 senegal(F2, 도형 같음)
  ['GIN', [[F3_START, 'french-guinea'], [1958, 'guinea']]], // 1958-10-02 독립(결정 점프 245,818)
  ['MRT', [[F3_START, 'french-mauritania']]], // 이음 1960 서아시아 mauritania(기본값 8, 도형 같음)
  ['MLI', [[F3_START, 'french-sudan']]], // 이음 1960 mali(F2, 도형 같음)
];
const WA_IDS = WA_OWN.flatMap(([adm0]) => idsOf(adm0));
// 칸 안 확인: 나라별 묶음을 합치면 F3_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음)
if (WA_IDS.length !== F3_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F3_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa postwar: WA 칸 나라별 조각 ${WA_IDS.length}개가 F3_WA_IDS ${F3_WA_IDS.length}개와 다름`);
}
for (const [adm0, line] of WA_OWN) own(idsOf(adm0), line);
// ── F3 WA 끝 ──

// ── F3 GW 기니만 서쪽·사헬 가운데 (최상위 이름 GW_) ──
// 조각 F3_GW_IDS(코트디부아르 19·가나 10·토고 5·베냉 12·부르키나파소 45·니제르 8 = 99), 구현 F3-GW
// 새 항목 7: french-ivory-coast·french-togoland·french-dahomey·french-upper-volta(BFA 45 — 1947~ 통째. 1945~1946은 1932 분할 세 몫 french-niger·french-sudan·french-ivory-coast, F4 기본값 9가 F3 기본값 6의 통째 근사를 고침)·french-niger(1945~1959) · british-gold-coast·british-togoland(1945~1956 GHA를 칼선 1로 가름 — 기본값 4)
// 앞 잇는 항목 1: F1 ghana(1957~ GHA 통째 — 항목 from 1957)
// 점프: 1957 GHA british-gold-coast·british-togoland → ghana(칼선 1 두 몫이 한 나라로), 이음 1960 CIV·TGO·BEN·BFA·NER → ivory-coast·togo·benin·burkina-faso·niger(도형 같음)
// 칼선 1(영국령 토골란드 서쪽 경계)은 cuts-f3.mjs GW 머리에 export const GW_CUT_…, 여기서 ownSplit('GW_…', idsOf('GHA'), …, { from: F3_START, to: 1957 })
import { F3_GW_IDS } from './cuts-f3.mjs';
const GW_BOUNDS = [1957]; // 1957: 칼선 1 묶음 기간의 끝(1945~1956 토골란드/골드코스트로 가르고 1957~ 가나 통째 — fillTables가 이 해를 확인)
const GW_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
import { GW_CUT_TOGOLAND } from './cuts-f3.mjs';
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F3_GW_IDS 99)
const GW_CIV = idsOf('CIV'); // 코트디부아르 19
const GW_GHA = idsOf('GHA'); // 가나 10(1945~1956 칼선 1로 토골란드/골드코스트)
const GW_TGO = idsOf('TGO'); // 토고 5
const GW_BEN = idsOf('BEN'); // 베냉 12
const GW_BFA = idsOf('BFA'); // 부르키나파소 45
const GW_NER = idsOf('NER'); // 니제르 8
{
  const all = [GW_CIV, GW_GHA, GW_TGO, GW_BEN, GW_BFA, GW_NER].flat();
  if (all.length !== F3_GW_IDS.length || new Set(all).size !== all.length || all.some((id) => !F3_GW_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa postwar: GW 묶음 합 ${all.length}개가 F3_GW_IDS ${F3_GW_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표)
own(GW_CIV, [[F3_START, 'french-ivory-coast']]); // 1893-03-10 식민지, 1958-12-04 자치 공화국(글), 1960-08-07 독립 → ivory-coast
ownSplit('GW_GHA', GW_GHA, [['토골란드', GW_CUT_TOGOLAND]], '골드코스트', {
  토골란드: [[F3_START, 'british-togoland']], // 1922-07-20 위임, 1946-12-13 신탁 통치(글), 1956-05-09 주민 투표 — 1957-03-06 가나에 합침
  골드코스트: [[F3_START, 'british-gold-coast']], // 식민지·아샨티·북부 준주 — 1957-03-06 가나 독립
}, { from: F3_START, to: 1957 });
own(GW_GHA, [[1957, 'ghana']]); // 1957-03-06 독립(옛 영국령 토골란드 포함 통째), 1960 공화국은 정체만 바뀜
own(GW_TGO, [[F3_START, 'french-togoland']]); // 1922 위임, 1946 신탁 통치·1956 자치 공화국(글), 1960-04-27 독립 → togo
own(GW_BEN, [[F3_START, 'french-dahomey']]); // 1894 식민지, 1958-12-04 자치 공화국(글), 1960-08-01 독립 → benin
import { GW_BFA_NER, GW_BFA_SDN, GW_BFA_CIV } from './cuts-f4.mjs'; // 오트볼타 1932~1946 분할 몫(사하라 이남 F4 GW — F4 기본값 9가 F3 기본값 6의 통째 근사를 고침)
own(GW_BFA_NER, [[F3_START, 'french-niger'], [1947, 'french-upper-volta']]); // 1932-09-05 폐지 동안 파다응구르마·도리 서클은 니제르, 1947-09-04 옛 경계로 복원, 1960-08-05 독립 → burkina-faso
own(GW_BFA_SDN, [[F3_START, 'french-sudan'], [1947, 'french-upper-volta']]); // 폐지 동안 와이구야 서클·아리빈다 칸통·데두구 서클 서쪽은 프랑스령 수단, 1947 복원
own(GW_BFA_CIV, [[F3_START, 'french-ivory-coast'], [1947, 'french-upper-volta']]); // 폐지 동안 나머지 서클은 코트디부아르(1937 오트코트디부아르 구역), 1947 복원
own(GW_NER, [[F3_START, 'french-niger']]); // 1922 식민지, 1958-12-19 자치 공화국(글), 1960-08-03 독립 → niger
// ── F3 GW 끝 ──

// ── F3 CE 나이지리아·카메룬·중앙아프리카 (최상위 이름 CE_) ──
// 조각 F3_CE_IDS(나이지리아 37·카메룬 10·차드 22·중앙아프리카 17·가봉 9·콩고 공화국 12·적도 기니 6·상투메 프린시페 2 = 115), 구현 F3-CE
// 새 항목 6: british-nigeria(NGA − 북부 카메룬 띠, 칼선 2)·french-cameroons(CMR − CM-NW·CM-SW 8)·french-chad(TCD 22, TD-TI 포함)·french-ubangi-shari(CAF)·french-gabon(GAB)·french-middle-congo(COG) — 모두 1945~1959
// 앞 잇는 항목 3(+글 1): F2 british-cameroons(CM-NW·CM-SW + 북부 띠 1945~1960)·spanish-guinea(1945~, 1959 두 주는 글)·portuguese-sao-tome(1945~, 1951 해외 주는 글) · F1 nigeria(띠 문장만 — 기본값 5)
// 점프: 이음 1960 NGA(띠 뺀 모양)·CMR 8·TCD·CAF·GAB·COG → nigeria·cameroon·chad·car·gabon·republic-of-congo(도형 같음). 북부 띠는 1960까지 british-cameroons, 1961~ nigeria(F2 GU 블록 — 칸 예외)
// 칼선 2(북부 영국령 카메룬 띠)는 cuts-f3.mjs CE 머리에 export const CE_CUT_…, 여기서 ownSplit('CE_…', idsOf('NGA'), …)(기본 기간), F2 decolonization.mjs GU 블록이 별칭 GU_CUT_…으로 가져옴
import { F3_CE_IDS, CE_CUT_NCAM } from './cuts-f3.mjs';
const CE_BOUNDS = []; // 칼선 2는 시대 내내 같은 나눔(기본 기간)이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F3_CE_IDS 115)
const CE_NGA = idsOf('NGA'); // 나이지리아 37(칼선 2로 본토/북부 카메룬 띠를 가름)
const CE_CM_SOUTH = ['CM-NW', 'CM-SW']; // 영국령 카메룬 남부(지금 북서·남서 지방) 41,940 km²
const CE_CMR = minus(idsOf('CMR'), ...CE_CM_SOUTH); // 프랑스령 카메룬 8
const CE_TCD = idsOf('TCD'); // 차드 22(티베스티 TD-TI는 1931년부터 차드)
const CE_CAF = idsOf('CAF'); // 중앙아프리카 17
const CE_GAB = idsOf('GAB'); // 가봉 9
const CE_COG = idsOf('COG'); // 콩고 공화국 12
const CE_GNQ = idsOf('GNQ'); // 적도 기니 6(비오코·리오무니·아노본)
const CE_STP = idsOf('STP'); // 상투메 프린시페 2
{
  const all = [CE_NGA, CE_CM_SOUTH, CE_CMR, CE_TCD, CE_CAF, CE_GAB, CE_COG, CE_GNQ, CE_STP].flat();
  if (all.length !== F3_CE_IDS.length || new Set(all).size !== all.length || all.some((id) => !F3_CE_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa postwar: CE 묶음 합 ${all.length}개가 F3_CE_IDS ${F3_CE_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표). 1960~은 decolonization.mjs GU 블록(같은 칼선으로 1960 띠 british-cameroons·1961~ nigeria)
ownSplit('CE_NGA', CE_NGA, [['띠', CE_CUT_NCAM]], '본토', {
  띠: [[F3_START, 'british-cameroons']], // 북부 영국령 카메룬(1922 위임·1946 신탁 통치, 나이지리아 북부 지역이 다스림) — 1961-06-01 나이지리아(F2)
  본토: [[F3_START, 'british-nigeria']], // 나이지리아 식민지 및 보호령(1914-01-01 남북 합침, 1954-10-01 연방) — 점프: 1960-10-01 독립 nigeria(F2)
});
own(CE_CM_SOUTH, [[F3_START, 'british-cameroons']]); // 남카메룬 — 1954 준자치, 1961-10-01 카메룬 연방 공화국(F2)
own(CE_CMR, [[F3_START, 'french-cameroons']]); // 1946 프랑스 신탁 통치령, 1957 자치 — 점프: 1960-01-01 독립 cameroon(F2)
own(CE_TCD, [[F3_START, 'french-chad']]); // 프랑스령 적도 아프리카, 1958-11-28 자치 공화국 — 점프: 1960-08-11 독립 chad(F2)
own(CE_CAF, [[F3_START, 'french-ubangi-shari']]); // 1958-12-01 중앙아프리카 공화국(자치) — 점프: 1960-08-13 독립 car(F2)
own(CE_GAB, [[F3_START, 'french-gabon']]); // 1958-11-28 자치 공화국 — 점프: 1960-08-17 독립 gabon(F2)
own(CE_COG, [[F3_START, 'french-middle-congo']]); // 1958-11-28 콩고 공화국(자치) — 점프: 1960-08-15 독립 republic-of-congo(F2)
own(CE_GNQ, [[F3_START, 'spanish-guinea']]); // 1959 적도 지방 두 주(페르난도포·리오무니) — 이름만, 1968 독립(F2)
own(CE_STP, [[F3_START, 'portuguese-sao-tome']]); // 1951 포르투갈 해외 주 — 이름만, 1975 독립(F1)
const CE_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F3 CE 끝 ──

// ── F3 HN 뿔·나일 (최상위 이름 HN_) ──
// 조각 F3_HN_IDS(에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·수단 17·남수단 10 = 64), 구현 F3-HN
// 새 항목 5: eritrea-british-admin(1945~1951 ERI, level region)·somalia-british-admin(1945~1949 SOM, level region)·somalia-italian-trust(1950~1959 SOM)·british-somaliland(1945~1959 SOL)·anglo-egyptian-sudan(1945~1955 SDN+SDS)
// 앞 잇는 항목 4: F1 ethiopia(1945~ ETH — 오가덴·하우드 영국 시정은 에티오피아 색, 기본값 3)·djibouti(1945~)·sudan(1956~ — 항목 from 1956) · F2 eritrea-federation(1952~ — 항목 from 1952)
// 점프: 1950 SOM somalia-british-admin → somalia-italian-trust(474,398)·1952 ERI eritrea-british-admin → eritrea-federation(123,658)·1956 SDN+SDS anglo-egyptian-sudan → sudan(2,546,162),
//   이음 1960 SOM+SOL somalia-italian-trust·british-somaliland → somalia(두 항목의 합)
import { F3_HN_IDS } from './cuts-f3.mjs';
const HN_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨(1950·1952·1956은 own 줄의 해)
// 사료(※ 연도 — 결과 노트 2절): 에리트레아 영국 군정 1941(케렌 싸움 뒤)~1952-09-15 연방(위키 en British Military Administration (Eritrea)),
//   이탈리아령 소말리아 1941 영국 군정~1950-04-01 이탈리아 시정 신탁 통치(위키 en Italian Somaliland·Trust Territory of Somaliland),
//   영국령 소말릴란드 1884 보호령~1960-06-26 독립·07-01 합침(위키 en British Somaliland), 공동 통치 수단 1899-01~1956-01-01(위키 en Anglo-Egyptian Sudan)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F3_HN_IDS 64)
const HN_ETH = idsOf('ETH'); // 11 — 오가덴 ET-SO 포함: 영국군 시정 1941~1948·하우드 영국 시정 1948~1954는 에티오피아 색(기본값 3, 관계 없이 글)
const HN_ERI = idsOf('ERI'); // 6
const HN_DJI = idsOf('DJI'); // 6
const HN_SOM = idsOf('SOM'); // 13 — 옛 이탈리아령 소말리아
const HN_SOL = idsOf('SOL'); // 1 — 영국령 소말릴란드
const HN_SDN = idsOf('SDN', 'SDS'); // 17 + 10 — 공동 통치 수단(남부도 같은 단위)
{
  const all = [HN_ETH, HN_ERI, HN_DJI, HN_SOM, HN_SOL, HN_SDN].flat();
  const want = new Set(F3_HN_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa postwar: HN 나라별 묶음 합 ${all.length}이 F3_HN_IDS ${want.size}와 다름`);
  }
}
own(HN_ETH, [[F3_START, 'ethiopia']]); // 에티오피아 제국(1941 이탈리아 점령에서 벗어남)
own(HN_ERI, [[F3_START, 'eritrea-british-admin'], [1952, 'eritrea-federation']]); // 1952-09-15 연방(유엔 총회 결의 390(V) 1950-12-02)
own(HN_DJI, [[F3_START, 'djibouti']]); // 프랑스령 소말릴란드(1946 해외 영토 — 이름만), vassal_of france는 F1 줄
own(HN_SOM, [[F3_START, 'somalia-british-admin'], [1950, 'somalia-italian-trust']]); // 1950-04-01 이탈리아 시정 유엔 신탁 통치
own(HN_SOL, [[F3_START, 'british-somaliland']]); // 영국 보호령(1960-06-26 독립은 닷새 뒤 합침이라 그해 말 규칙상 없음)
own(HN_SDN, [[F3_START, 'anglo-egyptian-sudan'], [1956, 'sudan']]); // 1956-01-01 독립
const HN_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F3 HN 끝 ──

// ── F3 EA 대호수·인도양 (최상위 이름 EA_) ──
// 조각 F3_EA_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹 FR-RE·마요트 FR-YT 2 = 246), 구현 F3-EA
// 새 항목 2: belgian-congo(1945~1959 COD)·french-madagascar(1945~1959 MDG — 1947 봉기 반군 지배지도 이 색, 기본값 11)
// 앞 잇는 항목 10: F1 seychelles·reunion(1946 데파르트망은 글)·mayotte · F2 ruanda-urundi(RWA+BDI)·british-uganda·british-kenya(해안 띠 포함)·british-tanganyika(본토 25)·sultanate-of-zanzibar(섬 다섯)·british-mauritius·french-comoros(1946 해외 영토는 글)
// 점프: 이음 1960 COD·MDG belgian-congo·french-madagascar → dr-congo·madagascar(도형 같음)
// 사료: 위키 en·fr Belgian Congo / Congo belge(1908-11-15 벨기에 식민지 ~ 1960-06-30 독립), 위키 en French Madagascar·fr Colonie de Madagascar et dépendances(1897 식민지, 1946 해외 영토, 1958 말라가시 공화국),
// 위키 fr Territoire des Comores(1946-10-27 마다가스카르 식민지에서 떼어 낸 해외 영토 — 1945~1946도 코모로 세 섬은 french-comoros 색, 1만 밑), 위키 en Malagasy Uprising(1947-03-29 ~ 1949-02 — 따로 칠하지 않음)
import { F3_EA_IDS } from './cuts-f3.mjs';
const EA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F3_EA_IDS 246)
const EA_COD = idsOf('COD'); // 11 — 벨기에령 콩고
const EA_RWA = idsOf('RWA'); // 5 — 루안다-우룬디(1946 유엔 신탁 통치령)
const EA_BDI = idsOf('BDI'); // 17 — 루안다-우룬디
const EA_UGA = idsOf('UGA'); // 112
const EA_KEN = idsOf('KEN'); // 8 — 해안 16 km 띠(술탄 주권의 케냐 보호령)도 케냐 식민지 색(F2와 같음, 알려진 근사). 마우마우 1952~1960은 따로 칠하지 않음
const EA_ZANZIBAR = ['TZ-06', 'TZ-07', 'TZ-10', 'TZ-11', 'TZ-15']; // 웅구자섬·펨바섬 다섯 조각
const EA_TZ_MAINLAND = minus(idsOf('TZA'), ...EA_ZANZIBAR); // 본토 25 — 영국령 탕가니카(1946 유엔 신탁 통치령)
const EA_MDG = idsOf('MDG'); // 22 — 1947~1949 봉기군이 차지한 땅도 프랑스령 마다가스카르 색(기본값 11)
const EA_MUS = idsOf('MUS'); // 14
const EA_SYC = idsOf('SYC'); // 22
const EA_COM = idsOf('COM'); // 3 — 그랑드코모르섬·앙주앙섬·모엘리섬
const EA_REU = ['FR-RE']; // 레위니옹(1946 해외 데파르트망 — 이름만 바뀜, 기본값 10)
const EA_MYT = ['FR-YT']; // 마요트
{
  const all = [EA_COD, EA_RWA, EA_BDI, EA_UGA, EA_KEN, EA_ZANZIBAR, EA_TZ_MAINLAND, EA_MDG, EA_MUS, EA_SYC, EA_COM, EA_REU, EA_MYT].flat();
  const want = new Set(F3_EA_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa postwar: EA 나라별 묶음 합 ${all.length}이 F3_EA_IDS ${want.size}와 다름`);
  }
}
own(EA_COD, [[F3_START, 'belgian-congo']]); // 1960-06-30 독립 — 1960부터 decolonization.mjs의 dr-congo
own(EA_RWA, [[F3_START, 'ruanda-urundi']]); // 1960~1961은 F2 같은 id
own(EA_BDI, [[F3_START, 'ruanda-urundi']]);
own(EA_UGA, [[F3_START, 'british-uganda']]);
own(EA_KEN, [[F3_START, 'british-kenya']]);
own(EA_TZ_MAINLAND, [[F3_START, 'british-tanganyika']]);
own(EA_ZANZIBAR, [[F3_START, 'sultanate-of-zanzibar']]);
own(EA_MDG, [[F3_START, 'french-madagascar']]); // 1958-10-14 말라가시 공화국(이름만), 1960-06-26 독립 — 1960부터 madagascar
own(EA_MUS, [[F3_START, 'british-mauritius']]);
own(EA_SYC, [[F3_START, 'seychelles']]);
own(EA_COM, [[F3_START, 'french-comoros']]);
own(EA_REU, [[F3_START, 'reunion']]);
own(EA_MYT, [[F3_START, 'mayotte']]);
const EA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F3 EA 끝 ──

// ── F3 SF 남부 (최상위 이름 SF_) ──
// 조각 F3_SF_IDS(잠비아 10·말라위 28·모잠비크 11·짐바브웨 10·앙골라 18·보츠와나 15·레소토 10·에스와티니 4·나미비아 13·남아프리카 9·세인트헬레나 SHN 2 = 130), 구현 F3-SF
// 새 항목 없음
// 앞 잇는 항목 10: F1 rhodesia(1945~ ZWE — 항목 from 1960 → 1923, 기본값 2)·south-west-africa·south-africa · F2 northern-rhodesia·nyasaland(1953 연방은 글 — 기본값 12)·portuguese-mozambique·portuguese-angola·bechuanaland·basutoland·swaziland-protectorate
// 점프: 없음(모두 같은 id로 1960에 이어짐). 세인트헬레나·어센션 SH-HL·SH-AC는 1945~1959 내내 주인 null + voids(0단계 기본값 4 — SF_voids에 V(F3_START, F3_END, ...idsOf('SHN')))
import { F3_SF_IDS } from './cuts-f3.mjs';
const SF_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F3_SF_IDS 130)
const SF_ZMB = idsOf('ZMB'); // 10 — 북로디지아
const SF_MWI = idsOf('MWI'); // 28 — 니아살랜드(말라위호 리코마섬·치주물루섬 포함)
const SF_MOZ = idsOf('MOZ'); // 11
const SF_ZWE = idsOf('ZWE'); // 10 — 남로디지아(영국 자치 식민지, 항목 rhodesia)
const SF_AGO = idsOf('AGO'); // 18 — 카빈다 AO-CAB 포함
const SF_BWA = idsOf('BWA'); // 15
const SF_LSO = idsOf('LSO'); // 10
const SF_SWZ = idsOf('SWZ'); // 4
const SF_NAM = idsOf('NAM'); // 13 — 월비스베이 NA-ER 포함(F1 근사 그대로)
const SF_ZAF = idsOf('ZAF'); // 9
const SF_SHN = idsOf('SHN'); // 2 — SH-HL·SH-AC
{
  const all = [SF_ZMB, SF_MWI, SF_MOZ, SF_ZWE, SF_AGO, SF_BWA, SF_LSO, SF_SWZ, SF_NAM, SF_ZAF, SF_SHN].flat();
  const want = new Set(F3_SF_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa postwar: SF 나라별 묶음 합 ${all.length}이 F3_SF_IDS ${want.size}와 다름`);
  }
}
own(SF_ZMB, [[F3_START, 'northern-rhodesia']]); // 1924~ 영국 보호령, 1953-08-01~1963-12-31 로디지아 니아살랜드 연방 구성 단위(연방은 글 — 결정 3·기본값 12)
own(SF_MWI, [[F3_START, 'nyasaland']]); // 1907~ 영국 보호령, 연방 구성 단위(글)
own(SF_MOZ, [[F3_START, 'portuguese-mozambique']]); // 1951 포르투갈 해외 주는 이름만(기본값 10)
own(SF_ZWE, [[F3_START, 'rhodesia']]); // 1923-10-01~ 영국 책임 자치 식민지 남로디지아(항목 from 1923 — 기본값 2), 연방 구성 단위(글)
own(SF_AGO, [[F3_START, 'portuguese-angola']]); // 1951 포르투갈 해외 주는 이름만(기본값 10)
own(SF_BWA, [[F3_START, 'bechuanaland']]);
own(SF_LSO, [[F3_START, 'basutoland']]);
own(SF_SWZ, [[F3_START, 'swaziland-protectorate']]);
own(SF_NAM, [[F3_START, 'south-west-africa']]); // 1946 유엔 신탁 통치 전환 거부·1949 남아프리카 의회 대표 — 위임 통치 그대로(0단계 기본값 16)
own(SF_ZAF, [[F3_START, 'south-africa']]); // 1948-05-26 국민당 집권·아파르트헤이트는 글
// 세인트헬레나·어센션(SHN): 줄을 적지 않아 시대 내내 주인 null
const SF_voids = () => [V(F3_START, F3_END, ...SF_SHN)]; // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(0단계 기본값 4)
// ── F3 SF 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F3_START, ...WA_BOUNDS, ...GW_BOUNDS, ...CE_BOUNDS, ...HN_BOUNDS, ...EA_BOUNDS, ...SF_BOUNDS, F3_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F3_START || BOUNDS.at(-1) !== F3_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa postwar: 표 경계 해 ${BOUNDS.join(', ')}는 ${F3_START}~${F3_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa postwar: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa postwar: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa postwar: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa postwar: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa postwar: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F3_END) throw new Error(`sub-saharan-africa postwar: 마지막 표의 끝이 ${joined.TO} (${F3_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F3_END(1960) 그대로(끝 없음 null을 쓰지 않음 — 1960~는 decolonization.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GW_voids(), ...CE_voids(), ...HN_voids(), ...EA_voids(), ...SF_voids()];
if (voids.some(([f, t]) => f < F3_START || t === null || t > F3_END)) throw new Error(`sub-saharan-africa postwar: 비운 땅의 기간은 ${F3_START}~${F3_END} 안이어야 함(끝 없음 null 금지 — 1960~는 decolonization.mjs 몫)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F3_START(1945)~F3_END(1960, 미포함)만 만든다(1910~1944는 colonial.mjs 구역 '사하라 이남 식민 …'이, 1960~는 decolonization.mjs 구역 '사하라 이남 탈식민 …'이 이음 — 1909 이하에는 이 권역 구역이 없음).
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역의 끝은 F3_END. 이름 '사하라 이남 전후 <from>~<to-1>'(F2 '사하라 이남 탈식민 …'·F1 '사하라 이남 현대 …'와 겹치지 않음).
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F3_START, F3_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => F3_START < y && y < F3_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `사하라 이남 전후 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void geomOfUnit; // 여섯 칸이 쓰지 않는 이름 경고 막기(합치기가 칸이 쓰기 시작한 이름을 지움)

export const era = {
  name: 'postwar',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F2 decolonization.mjs·F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
