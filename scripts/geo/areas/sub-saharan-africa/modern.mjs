// sub-saharan-africa 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1975~현재: 포르투갈령 독립 뒤 나라들 (F1)
// 짝 항목 파일: data/entities/sub-saharan-africa-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F1 짜임 안내 (F1 뼈대 2026-11-11 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 3~6), F1 창구 ②(질문 0건·기본값 18·D1~D4), 지시문 f1/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(오가덴 1977~78·카게라 1978~79·차드 북부 1983~87·콩고 2차 전쟁 1998~2003은 관계만 — 결정 6).
//   새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(다호메이→베냉 1975·오트볼타→부르키나파소 1984·자이르 1971~1997·스와질란드→에스와티니 2018 등)는 새 버전이 아니다 — 항목 글로(기본값 21).
// 1975 앞 버전 없음: 이 시대 파일이 이 권역의 첫 국경 단계라 첫 해는 F1_START(1975)다. 1975 앞에 성립한 나라도 첫 버전은 1975부터이고(F2 colonial이 같은 id로 앞을 이음),
//   1974 이하에는 이 권역 땅이 비는 것이 정상이다(빈 땅 검사 구역도 1975부터만 — 아래 gapZones).
// 이웃 권역 항목 mauritania: 새 항목이 아니라 서아시아 항목(data/entities/middle-east-modern.yaml, 1960~)이다. 땅은 이 파일 CE 칸 own 줄(MRT 13조각)이 처음 칠하고,
//   항목 블록 글은 CE 칸이 그 자리에서 고친다(옮기지 않음 — 필터 단위는 항목 파일을 따라 서아시아).
// 지역 항목 셋(level: region — 결정 4·D1): somaliland(HN, 1991~, SOL)·rhodesia(SF, 1975~1979, ZWE)·aouzou-strip(CE, 1975~1993, TD-TI)은 법적 주인 색 그대로 칠한다
//   (somalia·uk(유럽 항목 색)·chad 색 — 항목 파일 color가 같음). 같은 색 이웃 열쇠는 data/tests/allow/colors.yaml 칸 머리 아래(예: colors somalia|somaliland).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f1.mjs F1_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F1 WA·EA·SF·CE·HN 머리)과 그 칸 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·EA_·SF_·CE_·HN_, import도 별칭(예: CE_X), ownSplit 묶음 이름도 앞머리(예: 'HN_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f1.mjs에 칸 머리 다섯이 있다(새 칼선 0). 칸이 칼선을 더하면 그 파일 자기 머리 아래에 export const <칸>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <칸>_CUT_… } from './cuts-f1.mjs'로 가져온다.
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F1_START·F1_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F1_START(1975)부터, 해는 늘어난다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(idsOf('SDS'), [[F1_START, 'sudan'], [2011, 'south-sudan']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄 — 세인트헬레나·어센션 SHN, 기본값 4)만. 반투스탄은 남아공 색(기본값 15 — voids 아님).
// 늘림 나라: 없음(F1 창구 ② 자동 승인 0건 — 리비아의 아우조우 띠는 늘림이 아니라 차드 색 지역 항목 + occupied_by, D1). 앞 권역 나라(uk·france·libya 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만.
// 시대 경계 맞물림: 앞 시대 파일이 없다(F2 colonial이 생기면 그 끝 해 = F1_START). 끝까지 이어지는 버전은 to: null(PRESENT 2026년 말 모습 = 2027년 모습).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1 공통·F1 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';
import { F1_WA_IDS, F1_EA_IDS, F1_SF_IDS, F1_CE_IDS, F1_HN_IDS } from './cuts-f1.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('modern');

const F1_START = 1975; // 이 시대 파일의 첫 해(1975년 말 모습). 그 앞(1974 이하)은 F2 시대 파일(colonial) 몫
const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)
const F1_END = PRESENT + 1; // 마지막 표의 끝(미포함)

// ── 조각 소유표 도우미 (동남아 modern.mjs와 같은 꼴, 표가 여럿 — F1 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F1_START || e[0] >= F1_END)) {
    throw new Error(`sub-saharan-africa modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F1_START} 이상 ${F1_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F1_START, to = F1_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F1 WA 서아프리카 대서양 쪽 (최상위 이름 WA_) ──
// 조각 F1_WA_IDS(나이지리아 37·베냉 12·토고 5·가나 10·코트디부아르 19·라이베리아 15·시에라리온 4·기니 34·기니비사우 9·카보베르데 21·세네갈 14·감비아 6 = 186), 구현 F1-WA
// 항목(새 12): nigeria·benin·togo·ghana·ivory-coast·liberia·sierra-leone·guinea·guinea-bissau·cape-verde·senegal·gambia — 모두 1975~ 조각 통째(세네감비아 1982~1989는 두 항목 + 글, 기본값 17·6-B 9)
// 1975 첫 모양 = 2026 끝 모양(이 칸에는 1975~현재 1만 km² 넘는 변화가 없음)
// 독립 해(사료): 나이지리아 1960-10-01·베냉(다호메이) 1960-08-01·토고 1960·가나 1957-03-06·코트디부아르 1960-08·라이베리아 1847-07-26·시에라리온 1961-04-27·
//   기니 1958-10-02·기니비사우 1974-09-10(선언 1973)·카보베르데 1975-07-05·세네갈 1960-08-20·감비아 1965-02-18 — 모두 1975 앞이거나 그해라 첫 버전은 F1_START
// 바카시반도 약 665 km²(1975~2008 나이지리아 실효)는 카메룬 조각 CM-SW 안이라 CE 칸 몫(알려진 근사). 내전(라이베리아·시에라리온·코트디부아르)·보코하람은 칠하지 않음(결정 5)
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
const WA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
const WA_OWN = [
  ['NGA', 'nigeria'], ['BEN', 'benin'], ['TGO', 'togo'], ['GHA', 'ghana'], ['CIV', 'ivory-coast'], ['LBR', 'liberia'],
  ['SLE', 'sierra-leone'], ['GIN', 'guinea'], ['GNB', 'guinea-bissau'], ['CPV', 'cape-verde'], ['SEN', 'senegal'], ['GMB', 'gambia'],
];
const WA_IDS = WA_OWN.flatMap(([adm0]) => idsOf(adm0));
if (WA_IDS.length !== F1_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F1_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa modern: WA 칸 나라별 조각 ${WA_IDS.length}개가 F1_WA_IDS ${F1_WA_IDS.length}개와 다름`);
}
for (const [adm0, id] of WA_OWN) own(idsOf(adm0), [[F1_START, id]]); // 1975~ 끝까지 그 나라 하나(세네감비아 1982~1989도 두 나라 따로 — 6-B 9)
// ── F1 WA 끝 ──

// ── F1 EA 대호수·콩고 분지·인도양 (최상위 이름 EA_) ──
// 조각 F1_EA_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 FR-RE·FR-YT = 246), 구현 F1-EA
// 항목(새 12): dr-congo·rwanda·burundi·uganda·kenya·tanzania·madagascar·mauritius·seychelles(vassal_of uk ~1976)·comoros·reunion·mayotte(vassal_of france, 기본값 3) — 모두 1975~ 조각 통째
// 일레미 삼각지대(약 11,000 km²)는 NE 조각대로 KE-700 쪽·SS-EE 쪽(6-B 7, mapNote), 카게라 약 1,900 km²는 TZ-05 안(알려진 근사)
// 콩고 2차 전쟁 점령 1998~2003·M23은 칠하지 않음(6-B 3·결정 6 — 관계를 넣으면 주어가 콩고 전체가 되어 mapNote만), 세이셸 1975~1976은 같은 항목에 vassal_of uk 관계(6-B 12)
const EA_BOUNDS = []; // 조각 통째·1975~현재 주인이 바뀌지 않는 칸이라 표 경계 해를 더하지 않음
const EA_COD = idsOf('COD');
const EA_RWA = idsOf('RWA');
const EA_BDI = idsOf('BDI');
const EA_UGA = idsOf('UGA');
const EA_KEN = idsOf('KEN');
const EA_TZA = idsOf('TZA'); // 본토 + 잔지바르 제도 TZ-06·TZ-07·TZ-10·TZ-11·TZ-15(합친 항목, 기본값 17)
const EA_MDG = idsOf('MDG');
const EA_MUS = idsOf('MUS');
const EA_SYC = idsOf('SYC');
const EA_COM = idsOf('COM'); // 그랑드코모르·모헬리·앙주앙 셋(마요트는 FR-YT로 따로)
const EA_REU = ['FR-RE'];
const EA_MYT = ['FR-YT'];
const EA_ALL = [EA_COD, EA_RWA, EA_BDI, EA_UGA, EA_KEN, EA_TZA, EA_MDG, EA_MUS, EA_SYC, EA_COM, EA_REU, EA_MYT].flat();
// 칸 안 확인: 나라별 묶음을 합치면 F1_EA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음)
if (EA_ALL.length !== F1_EA_IDS.length || new Set(EA_ALL).size !== EA_ALL.length || EA_ALL.some((id) => !F1_EA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa modern: EA 칸 나라별 묶음 ${EA_ALL.length}개가 F1_EA_IDS ${F1_EA_IDS.length}개와 다름`);
}
own(EA_COD, [[F1_START, 'dr-congo']]); // 자이르 1971~1997은 이름만(기본값 21)
own(EA_RWA, [[F1_START, 'rwanda']]);
own(EA_BDI, [[F1_START, 'burundi']]);
own(EA_UGA, [[F1_START, 'uganda']]); // 카게라 돌출부 1978~79 약 1,900 km²는 TZ-05 안 탄자니아 색(되돌려진 점령, 알려진 근사)
own(EA_KEN, [[F1_START, 'kenya']]); // 일레미 삼각지대는 NE대로 KE-700 쪽(6-B 7)
own(EA_TZA, [[F1_START, 'tanzania']]);
own(EA_MDG, [[F1_START, 'madagascar']]);
own(EA_MUS, [[F1_START, 'mauritius']]);
own(EA_SYC, [[F1_START, 'seychelles']]); // 1976-06-29 독립 — 1975~1976은 같은 항목 + vassal_of uk
own(EA_COM, [[F1_START, 'comoros']]); // 1975-07-06 독립
own(EA_REU, [[F1_START, 'reunion']]); // vassal_of france(기본값 3)
own(EA_MYT, [[F1_START, 'mayotte']]); // vassal_of france(기본값 3), 코모로의 귀속 주장은 mapNote
const EA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음(모리셔스 아갈레가·세이셸 바깥 섬 빠짐은 0단계 근사)
// ── F1 EA 끝 ──

// ── F1 SF 남부 (최상위 이름 SF_) ──
// 조각 F1_SF_IDS(앙골라 18·모잠비크 11·잠비아 10·말라위 28·짐바브웨 10·보츠와나 15·레소토 10·에스와티니 4·나미비아 13·남아프리카 9·세인트헬레나 SHN 2 = 130), 구현 F1-SF
// 항목(새 12): angola·mozambique·zambia·malawi·rhodesia(region·uk 색, 1975~1979 ZWE)·zimbabwe(1980~)·botswana·lesotho·eswatini·south-west-africa(1975~1989, vassal_of south-africa)·namibia(1990~)·south-africa
// 점프(결정·기본값): 1980 rhodesia→zimbabwe·1990 south-west-africa→namibia(도형 같고 항목만 바뀜). 세인트헬레나·어센션 SH-HL·SH-AC는 1975~ 내내 주인 null + voids(기본값 4 — 이유 글)
// 월비스베이 1,124 km²(1977~1993 남아공)는 나미비아 쪽 조각 NA-ER 그대로(6-B 11, 알려진 근사). 반투스탄은 남아공 색(기본값 15)
// 앙골라 독립 1975-11-11·모잠비크 1975-06-25라 1975년 말 모습은 두 나라(남아공군 개입 1975~76·1980년대 남부 작전·UNITA 지배지는 원정·내전 — 칠하지 않음)
// 짐바브웨 독립 1980-04-18(로디지아는 1979-12 영국 통치 복귀 해도 같은 항목 — 6-B 10), 나미비아 독립 1990-03-21
const SF_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않음
const SF_IDS = {
  AGO: idsOf('AGO'), // 18(카빈다 AO-CAB 포함 — 콩고 민주 공화국 땅 건너 떨어진 땅)
  MOZ: idsOf('MOZ'), // 11
  ZMB: idsOf('ZMB'), // 10
  MWI: idsOf('MWI'), // 28
  ZWE: idsOf('ZWE'), // 10
  BWA: idsOf('BWA'), // 15
  LSO: idsOf('LSO'), // 10
  SWZ: idsOf('SWZ'), // 4
  NAM: idsOf('NAM'), // 13(월비스베이는 NA-ER 안)
  ZAF: idsOf('ZAF'), // 9(반투스탄은 남아공 색 — 기본값 15)
  SHN: idsOf('SHN'), // 2(SH-HL·SH-AC — 주인 null, voids)
};
{
  // 칸 안 확인: 묶음 합 = F1_SF_IDS(130), 겹침 0
  const all = Object.values(SF_IDS).flat();
  const want = new Set(F1_SF_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa modern: SF 묶음 ${all.length}개가 F1_SF_IDS ${want.size}개와 다름`);
  }
}
own(SF_IDS.AGO, [[F1_START, 'angola']]);
own(SF_IDS.MOZ, [[F1_START, 'mozambique']]);
own(SF_IDS.ZMB, [[F1_START, 'zambia']]);
own(SF_IDS.MWI, [[F1_START, 'malawi']]);
own(SF_IDS.ZWE, [[F1_START, 'rhodesia'], [1980, 'zimbabwe']]); // 결정 4 — 법적 주인 영국 색 지역 항목, 1980-04-18 짐바브웨 독립
own(SF_IDS.BWA, [[F1_START, 'botswana']]);
own(SF_IDS.LSO, [[F1_START, 'lesotho']]);
own(SF_IDS.SWZ, [[F1_START, 'eswatini']]); // 2018 스와질란드 → 에스와티니는 이름만(기본값 21)
own(SF_IDS.NAM, [[F1_START, 'south-west-africa'], [1990, 'namibia']]); // 기본값 16 — vassal_of south-africa, 1990-03-21 독립
own(SF_IDS.ZAF, [[F1_START, 'south-africa']]);
// 세인트헬레나·어센션(SHN): 줄을 적지 않아 시대 내내 주인 null
const SF_voids = () => [V(F1_START, null, ...SF_IDS.SHN)]; // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(기본값 4)
// ── F1 SF 끝 ──

// ── F1 CE 사헬·기니만 안쪽 (최상위 이름 CE_) ──
// 조각 F1_CE_IDS(말리 9·모리타니 13·니제르 8·부르키나파소 45·차드 22·중앙아프리카 17·카메룬 10·적도기니 6·상투메 프린시페 2·가봉 9·콩고 공화국 12 = 153), 구현 F1-CE
// 항목(새 11): mali·niger·burkina-faso·chad(1975~1993 TD-TI 뺌·1994~ 통째)·car·cameroon·equatorial-guinea·sao-tome·gabon·republic-of-congo·aouzou-strip(region·chad 색, 1975~1993 TD-TI, occupied_by libya — D1)
// 이웃 권역 항목 mauritania(서아시아 middle-east-modern.yaml 블록 — 땅 처음, CE가 블록 글을 고침): MRT 13조각 1975~(서사하라로 넓히지 않음, 기본값 18)
// 점프(D1): 1994 aouzou-strip→chad. 차드 북부 1983~87·말리 키달 2014~2023은 칠하지 않음(6-B 2·D3). 바카시 665 km²는 카메룬 CM-SW 안(알려진 근사)
// 독립 해(사료): 말리 1960(말리 연방 1960-06-20, 세네갈 이탈 08-20 뒤 말리 공화국)·모리타니 1960-11-28·니제르 1960-08(날짜는 사료마다 다름)·오트볼타 1960-08-05(부르키나파소 이름 1984-08-04)·차드 1960-08-11·
//   중앙아프리카 1960-08-13·카메룬 1960-01-01·적도 기니 1968-10-12·상투메 프린시페 1975-07-12·가봉 1960-08-17·콩고 1960-08-15 — 모두 1975 앞이거나 그해라 첫 버전은 F1_START
// 아우주 띠: 1973 리비아 점령 → 1994-02-03 국제 사법 재판소 판결(차드)·1994-05 리비아군 철수라 1994년 말은 차드(D1 — 표 경계 1994)
const CE_BOUNDS = [1994]; // 아우주 띠가 차드로 돌아가는 해
const CE_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
const CE_OWN = [
  ['MLI', 'mali'], ['MRT', 'mauritania'], ['NER', 'niger'], ['BFA', 'burkina-faso'], ['CAF', 'car'], ['CMR', 'cameroon'],
  ['GNQ', 'equatorial-guinea'], ['STP', 'sao-tome'], ['GAB', 'gabon'], ['COG', 'republic-of-congo'],
];
const CE_CHAD = minus(idsOf('TCD'), 'TD-TI'); // 차드 21조각(티베스티 뺌)
const CE_IDS = [...CE_OWN.flatMap(([adm0]) => idsOf(adm0)), ...CE_CHAD, 'TD-TI'];
if (CE_IDS.length !== F1_CE_IDS.length || new Set(CE_IDS).size !== CE_IDS.length || CE_IDS.some((id) => !F1_CE_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa modern: CE 칸 나라별 조각 ${CE_IDS.length}개가 F1_CE_IDS ${F1_CE_IDS.length}개와 다름`);
}
for (const [adm0, id] of CE_OWN) own(idsOf(adm0), [[F1_START, id]]); // 1975~ 끝까지 그 나라 하나(모리타니는 서사하라로 넓히지 않음 — 기본값 18)
own(CE_CHAD, [[F1_START, 'chad']]); // 리비아·GUNT의 북부 장악 1983~1987은 칠하지 않음(6-B 2 — 되돌려진 점령)
own(['TD-TI'], [[F1_START, 'aouzou-strip'], [1994, 'chad']]); // 차드 색 지역 항목 + occupied_by libya(D1)
// ── F1 CE 끝 ──

// ── F1 HN 뿔·나일 (최상위 이름 HN_) ──
// 조각 F1_HN_IDS(에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·수단 17·남수단 10 = 64), 구현 F1-HN
// 항목(새 7): ethiopia(1975~1992 ETH+ERI·1993~ ETH)·eritrea(1993~, D2)·djibouti(vassal_of france ~1977)·somalia(1975~1990 SOM+SOL·1991~ SOM)·somaliland(region·somalia 색, 1991~ SOL)·sudan(1975~2010 SDN+SDS·2011~ SDN)·south-sudan(2011~)
// 점프(결정·기본값): 1991 somaliland(결정 4)·1993 eritrea(D2)·2011 south-sudan. 아비에이·카피아킨기·헤글리그·일레미는 NE 조각대로(6-B 7), 다르푸르 RSF 2023~는 수단 색(D4)
// 오가덴 1977~78 소말리아군 점령은 되돌려진 점령이라 에티오피아 색(6-B 1), 티그라이 2020~22는 안 그림(6-B 5), 에리트레아 1991-05 EPLF 실효는 글·근사(D2)
// 소말릴란드 SSC-카투모 2023~ 24,642 km²는 쪼개지 않음(6-B 6), 비르타윌은 수단 홍해주 SD-RS 그대로(기본값 5)
const HN_BOUNDS = [1991, 1993, 2011]; // 소말릴란드 선언 1991-05-18·에리트레아 독립 1993-05-24·남수단 독립 2011-07-09
const HN_IDS = {
  ETH: idsOf('ETH'), // 11
  ERI: idsOf('ERI'), // 6(ER-AN·ER-DK·ER-DU·ER-GB·ER-MA·ER-SK — 바드메는 ER-GB 안)
  DJI: idsOf('DJI'), // 6
  SOM: idsOf('SOM'), // 13
  SOL: idsOf('SOL'), // 1(소말릴란드 NE 범위 168,581 km² — 6-B 8)
  SDN: idsOf('SDN'), // 17(다르푸르 5·홍해주 SD-RS(비르타윌)·남코르도판 SD-KS(아비에이·헤글리그)·SDN-5856(카피아킨기))
  SDS: idsOf('SDS'), // 10
};
{
  // 칸 안 확인: 묶음 합 = F1_HN_IDS(64), 겹침 0
  const all = Object.values(HN_IDS).flat();
  const want = new Set(F1_HN_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa modern: HN 묶음 ${all.length}개가 F1_HN_IDS ${want.size}개와 다름`);
  }
}
own(HN_IDS.ETH, [[F1_START, 'ethiopia']]);
own(HN_IDS.ERI, [[F1_START, 'ethiopia'], [1993, 'eritrea']]); // D2 — 1993-05-24 독립(1993-04 주민 투표)
own(HN_IDS.DJI, [[F1_START, 'djibouti']]); // 1977-06-27 독립 전은 vassal_of france(6-B 12) — 땅은 같은 항목
own(HN_IDS.SOM, [[F1_START, 'somalia']]);
own(HN_IDS.SOL, [[F1_START, 'somalia'], [1991, 'somaliland']]); // 결정 4 — 법적 주인 소말리아 색 지역 항목, 관계 없음
own(HN_IDS.SDN, [[F1_START, 'sudan']]); // 아비에이·카피아킨기·헤글리그는 NE 조각대로 수단(6-B 7), 다르푸르 RSF 2023~는 수단 색(D4)
own(HN_IDS.SDS, [[F1_START, 'sudan'], [2011, 'south-sudan']]); // 2011-07-09 독립
const HN_voids = () => []; // 이 칸에는 비우는 땅이 없음
// ── F1 HN 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F1_START, ...WA_BOUNDS, ...EA_BOUNDS, ...SF_BOUNDS, ...CE_BOUNDS, ...HN_BOUNDS, F1_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F1_START || BOUNDS.at(-1) !== F1_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${F1_START}~${F1_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F1_END) throw new Error(`sub-saharan-africa modern: 마지막 표의 끝이 ${joined.TO} (${F1_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝까지 이어지는 버전은 to: null. 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to === F1_END ? null : to, build(list)])]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...EA_voids(), ...SF_voids(), ...CE_voids(), ...HN_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F1_START(1975)부터만 만든다(첫 국경 단계 — 1974 이하에는 이 권역 구역이 없음). 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역은 끝이 없다.
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F1_START, F1_END, ...voids.flatMap(([f, t]) => [f, t ?? F1_END]).filter((y) => F1_START < y && y < F1_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? F1_END)).map(([, , g]) => g);
  const open = to === F1_END;
  return [{ name: open ? `사하라 이남 현대 ${from}~` : `사하라 이남 현대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to: open ? null : to }];
});

void I; void U; void geomOfUnit; // 다섯 칸이 쓰지 않는 이름 경고 막기(F2~F7이 쓰면 그 단계 합치기가 지움)

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F2~F7 시대 파일도 같은 문구를 써야 같은 나라 id를 이어 붙일 수 있음 — joinEras)
};
