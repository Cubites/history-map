// sub-saharan-africa 시대 파일 colonial (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1910~1944: 남아프리카 연방부터 2차 대전 끝 앞까지 (F4)
// 짝 항목 파일: data/entities/sub-saharan-africa-colonial.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 앞 잇는 F3 항목 23은 sub-saharan-africa-postwar.yaml, F2 항목 21은
//   sub-saharan-africa-decolonization.yaml, F1 항목 9는 sub-saharan-africa-modern.yaml)
//   앞 시대 파일 partition.mjs(F5, 1885~1909)가 같은 id로 앞을 잇는다(이 파일 항목 14·F3·F2·F1 항목 중 1885~1909에 있는 것 — 짝 항목 파일 sub-saharan-africa-partition.yaml은 F5 새 항목 27, 사하라 이남 F5 뼈대 2026-11-13)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F4 짜임 안내 (F4 뼈대 2026-11-12 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 1·3~6), F1 창구 ③ R-Q1·R-Q2, F2·F3 창구 ②·③, 서아시아 A1 창구 ①, F4 창구 ②(질문 2건 Q1·Q2·자동 승인 0·기본값 31·M-F4-1~7), 지시문 f4/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령·나라 일부의 협정 시정·봉기는 칠하지 않음(영국령 소말릴란드 1940~1941 이탈리아 점령·카살라 1940·마다가스카르 1942 영국 점령은
//   그 땅 주인 색 — 기본값 20·29, 관계 줄도 없이 글). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(1910 프랑스령 적도 아프리카·1910 니제르 군사 영토·1920 케냐 식민지·
//   탕가니카 영토·모리타니 식민지·1921 프랑스령 수단·1922 니제르 식민지·1936 이탈리아령 동아프리카·1940~1942 비시/자유 프랑스)는 새 버전이 아니다 — 항목 글로(기본값 12·13·30, 연방은 글 — 0단계 결정 3).
// 1910 앞 버전: 이 시대 파일의 첫 해는 F4_START(1910)다. 1910 앞에 성립한 나라·식민지도 이 파일의 첫 버전은 1910부터이고, 1885~1909는 앞 시대 파일 partition.mjs(F5)가 같은 id로 앞을 이음
//   (1909 말 모양 = 이 파일의 1910 모양 — 결정 점프 셋 남아프리카 연방·라도와 서나일 이관·투르카나만 예외, F5 P1). 빈 땅 검사 구역은 이 파일이 1910~1944, partition.mjs가 1885~1909(아래 gapZones). 1884 이하에는 이 권역 땅이 비는 것이 정상이다.
// 시대 경계 맞물림: 앞 시대 파일 partition.mjs(F5)의 끝 F5_END = 1910 = 이 파일의 F4_START(그 파일이 손으로 맞춘 확인 줄). 뒤 시대 파일 postwar.mjs(F3)의 첫 해 F3_START = 1945 = 이 파일의 F4_END(미포함). 이 파일 버전의 끝은 모두 F4_END 이하이고(끝 없음 null 금지),
//   1945에 이어지는 나라(F3 항목 23·F2 항목 21·F1 항목 9 — 같은 id)는 joinEras가 이 파일 버전 뒤에 F3·F2·F1 버전을 붙인다. 1944 말 모양은 F3의 1945 모양과 같아야 한다(결정 점프 없음 —
//   오트볼타 세 몫은 GW 칸 예외 ①로 F3 1945~1946도 같은 몫). 권역 파일의 joinEras 목록은 [partitionEra, colonialEra, postwarEra, decolonizationEra, modernEra](과거가 앞 — F5 뼈대 2026-11-13).
// 앞 잇는 항목 53: F3 항목 23(sub-saharan-africa-postwar.yaml)·F2 항목 21(sub-saharan-africa-decolonization.yaml)·F1 항목 9(sub-saharan-africa-modern.yaml) — 같은 id, 블록은 그 자리(파일 소유표 — COMMON 5절, 글과 from 고침만 칸이).
//   항목 from 고침은 아홉: 위임 통치 여섯(british-togoland·french-togoland·british-cameroons·french-cameroons·british-tanganyika·ruanda-urundi) 1922 → 1920(기본값 2)·french-niger 1922 → 1900·
//   french-chad 1920 → 1900(기본값 8)·british-kenya 1920 → 1895(기본값 30 — 항목 from 앞 버전은 생성기가 받지 않으므로 필수). 짝 항목 파일 밖 id도 주인으로 쓸 수 있다(F2·F3·F4 뼈대 장치 시험 ①).
// 식민지 항목 색: 새 항목 14(독일령 토고 등)는 본국 색이 아니라 자기 색(뼈대가 같은 해 맞닿는 이웃과 ΔE 26 넘게 — F2·F3 식민지 선례, COMMON P4). 본국은 data/relations.yaml의
//   vassal_of·occupied_by(칸 머리 아래). 같은 땅에서 앞뒤로 이어지는 항목(독일령 → 위임 통치·남서아프리카, 회사령 → 로디지아, 이탈리아령 → 군정)은 달라도 된다. 같은 색 이웃 열쇠는 data/tests/allow/colors.yaml 칸 머리 아래.
// 독일령 넷(Q1 '독일령 1919까지'): german-togoland·german-kamerun·german-east-africa·german-south-west-africa는 1919까지 칠하고(항목 to 1920), 점령은 관계 occupied_by로만
//   (토고 1914 uk·france·남서아프리카 1915 south-africa·카메룬 1916 uk·france·동아프리카 1916 uk·belgium ~1919). 본국 관계는 M-F4-6 ㉮ — vassal_of german-empire 성립 해~1917·
//   vassal_of weimar-republic 1918~1919 두 줄. 점령 지역 항목·임시 분할선(1914 토고·1916 카메룬 피코 선)은 없음(기본값 5). 위임 통치 여섯은 1920부터(베르사유 발효 1920-01-10),
//   노이카메룬이 프랑스령 적도 아프리카로 돌아가는 지도 해도 1920.
// 소말리 데르비시 국가(Q2, 1895~1920 약 13만 km²): 지역 항목 없이 영국령 소말릴란드·이탈리아령 소말릴란드·에티오피아를 법적 주인 색 그대로 — mapNote·사건 글로(13만 km²는 단계 끝 장부).
// 술탄국 둘(M-F4-7): majeerteen-sultanate·sultanate-of-hobyo는 1910~1926 칠하고(항목 to 1927), 관계 vassal_of italy to 1926. 1927부터 italian-somaliland.
// 칸 사이 id 참조 다섯(주인 id는 어느 칸 것이든 쓸 수 있고 블록 글은 소유 칸 하나 — COMMON 4절 '칸을 넘는 항목'): french-sudan(WA 블록 — GW가 BFA 1910~1918·와이구야 몫 1932~1944를 칠함)·
//   french-niger(GW 블록 — CE-E가 TD-TI 1929~1930을 칠함)·german-kamerun(CE-N 블록 — CE-E가 노이카메룬 1911~1919를 칠함)·british-kenya(E1 블록 — H1이 K2 서쪽 1910~1923을 칠함)·
//   anglo-egyptian-sudan(H2 블록 — E1이 서나일 8구 1910~1913을 칠함, M-F4-2).
// BET 비움(기본값 1): 보르쿠 TD-BO·엔네디 TCD-5579·티베스티 TD-TI(합 568,719 km²)는 실효 지배가 굳은 해 앞까지 주인 null + CE-E voids(티베스티 1910~1928, 1929~1930 french-niger·1931~ french-chad,
//   보르쿠·엔네디는 칸이 사료로 닫고 못 닫으면 1929부터). 그 밖에 비운 땅은 S2의 세인트헬레나·어센션 SHN 1910~1944(0단계 기본값 4)뿐(코모로 세 섬 COM은 창구 ③ R-Q1로 1910부터 칠함 — 기본값 30 고침).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f4.mjs F4_*_IDS — F3 여섯 칸과 다른 아홉 칸 WA·GW·CE-N·CE-E·H1·H2·E1·S1·S2)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F4 <칸> 머리)과
//   그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GW_·CEN_·CEE_·H1_·H2_·E1_·S1_·S2_(칸 id CE-N·CE-E의 하이픈은 JS 이름이 못 됨 —
//   특별 지시 9), import도 별칭(예: CEN_CUT_NCAM), ownSplit 묶음 이름도 앞머리(예: 'CEE_…'). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다
//   (바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f4.mjs에 칸 머리 아홉이 있다. 새 칼선 여섯 — CE-E 노이카메룬 남·북(CEE_CUT_NKAM_S·_N, 1911~1919)·H1 주바강 K2(H1_CUT_JUBA)·마제르테인–호비오 K3(H1_CUT_MAJ)·
//   호비오–베나디르 K4(H1_CUT_HOB)·E1 투르카나 K1(E1_CUT_TURKANA), 조건부 CE-N 북·남 나이지리아(CEN_CUT_NNIG). 칸은 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고,
//   이 파일 칸 머리 안에서 import { <앞머리>_CUT_… } from './cuts-f4.mjs'로 가져온다. 재사용 둘 — GW import { GW_CUT_TOGOLAND } from './cuts-f3.mjs'(F4 내내 같은 나눔)·
//   CE-N import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs'(좌표를 베끼지 않음 — 별칭, F4 뼈대 장치 시험 ⑤). 오트볼타 1932~1946 몫 묶음 GW_BFA_NER·_SDN·_CIV는 cuts-f4.mjs GW 머리에
//   한 번 쓰고 이 파일 GW 칸과 F3 postwar.mjs GW 블록이 함께 가져온다(GW 칸 예외 ①).
// 칸 조각 목록: 칸 머리 안의 import { F4_<칸>_IDS } from './cuts-f4.mjs'는 칸 안 확인용(나라별 묶음 합 = 칸 몫)으로만 쓰고, 나라별 묶음은 칸 안에서 idsOf('<adm0>')·minus(idsOf('TZA'), …) 꼴로 다시 적는다.
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F4_START·F4_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인 — 뼈대가 박은 값: CEE_BOUNDS 1911·1920,
//   H1_BOUNDS 1924·1927, E1_BOUNDS 1926. CE-N 남북 칼선을 그으면 CEN_BOUNDS에 1914를 더함).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F4_START(1910)부터, 해는 늘어나고 F4_END(1945) 전이다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(GW_TGO, [[F4_START, 'german-togoland'], [1920, 'french-togoland']]) · own(CEE_TI, [[F4_START, null], [1929, 'french-niger'], [1931, 'french-chad']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄 — BET·SHN)만. 그 밖 F4 땅은 모두 1910부터 주인이 있다.
// 늘림 나라: 앞 권역 나라(uk·france·german-empire·belgium·italy·portugal·spain 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이 단계에 늘림은 없다(창구 ② 자동 승인 0건),
//   서아시아 italian-libya(사라 삼각지대·아우주 띠 포함)·british-egypt·french-algeria 쪽 블록은 바이트 그대로.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1~F3 공통·칸 머리·F4 공통·F4 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('colonial');

const F4_START = 1910; // 이 시대 파일의 첫 해(1910년 말 모습). 그 앞(1885~1909)은 F5 시대 파일 partition.mjs 몫(그 파일의 F5_END와 F4_START가 같은지 그 파일이 확인)
const F4_END = 1945; // 마지막 표의 끝(미포함) = 뒤 시대 파일 postwar.mjs의 F3_START(1945)
const F3_START = 1945; // postwar.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F4_END !== F3_START) throw new Error(`sub-saharan-africa colonial: F4_END ${F4_END}가 F3 첫 해 ${F3_START}와 다름(1944/1945 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F3 postwar.mjs와 같은 꼴 — F4 뼈대가 옮김, table.mjs·postwar.mjs·decolonization.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <앞머리>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F4_START || e[0] >= F4_END)) {
    throw new Error(`sub-saharan-africa colonial: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F4_START} 이상 ${F4_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa colonial: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F4_START, to = F4_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa colonial: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa colonial: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa colonial: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa colonial: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa colonial: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F4 WA 서아프리카 대서양 쪽·서사헬 (최상위 이름 WA_) ──
// 조각 F4_WA_IDS(라이베리아 15·시에라리온 4·감비아 6·기니비사우 9·카보베르데 21·세네갈 14·기니 34·모리타니 13·말리 9 = 125), 구현 F4-WA
// 새 항목 0(항목 파일 WA 머리는 빈 채)
// 앞 잇는 항목 9: F1 liberia · F2 british-sierra-leone·british-gambia·portuguese-guinea·portuguese-cape-verde · F3 french-senegal·french-sudan(MLI — 1904 오트세네갈-니제르·1921 이름은 글)·french-mauritania·french-guinea
// 점프: 없음(WA 조각은 1910~1944 내내 같은 주인). french-sudan의 BFA 몫(1910~1918 전부·1932~1944 와이구야)은 GW 칸이 칠함(칸 사이 id 참조 — 블록 글·관계·허용 열쇠는 WA)
import { F4_WA_IDS } from './cuts-f4.mjs';
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
const WA_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// 이 칸 땅은 1910~1944 내내 한 주인(조사 나라 표 from 그대로 — 1910 앞 성립은 첫 버전 F4_START, F5가 같은 id로 앞을 이음).
//   이름만 바뀐 해는 글: 1904 오트세네갈-니제르 → 1921-01-01 프랑스령 수단, 1920-12-04 모리타니 식민지, 1904 프랑스령 서아프리카(연방은 글 — 결정 3),
//   1940~1942 비시 프랑스 쪽 서아프리카(기본값 13). 칠하지 않는 것: 가오 서클 1910-06~1911-06 니제르 군사 영토 소속(기본값 11 — 프랑스령 수단 색),
//   1911 라이베리아–시에라리온 앵무새 부리 맞바꿈(기본값 15). 1944 말 모양 = F3 WA 1945 모양(점프 0)
const WA_OWN = [
  ['LBR', [[F4_START, 'liberia']]],
  ['SLE', [[F4_START, 'british-sierra-leone']]],
  ['GMB', [[F4_START, 'british-gambia']]],
  ['GNB', [[F4_START, 'portuguese-guinea']]], // 비자고스 제도 포함
  ['CPV', [[F4_START, 'portuguese-cape-verde']]],
  ['SEN', [[F4_START, 'french-senegal']]], // 다카르 — 프랑스령 서아프리카 수도
  ['GIN', [[F4_START, 'french-guinea']]],
  ['MRT', [[F4_START, 'french-mauritania']]], // 서사하라 쪽 서아시아 조각은 건드리지 않음
  ['MLI', [[F4_START, 'french-sudan']]], // BFA 몫(1910~1918 전부·1932~1944 와이구야 쪽)은 GW 칸이 칠함
];
const WA_IDS = WA_OWN.flatMap(([adm0]) => idsOf(adm0));
// 칸 안 확인: 나라별 묶음을 합치면 F4_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음)
if (WA_IDS.length !== F4_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F4_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa colonial: WA 칸 나라별 조각 ${WA_IDS.length}개가 F4_WA_IDS ${F4_WA_IDS.length}개와 다름`);
}
for (const [adm0, line] of WA_OWN) own(idsOf(adm0), line);
// ── F4 WA 끝 ──

// ── F4 GW 기니만 서쪽·사헬 가운데 (최상위 이름 GW_) ──
// 조각 F4_GW_IDS(코트디부아르 19·가나 10·토고 5·베냉 12·부르키나파소 45·니제르 8 = 99), 구현 F4-GW
// 새 항목 1: german-togoland(1910~1919 TGO 5 + GHA 중 토골란드 칼선 안 — 90,215 km²)
// 앞 잇는 항목 7: F3 french-ivory-coast·british-gold-coast·british-togoland(from 1920)·french-togoland(from 1920)·french-dahomey·french-upper-volta(1919~1931)·french-niger(from 1900)
// 점프: 1919 BFA french-sudan → french-upper-volta(275,029) · 1920 german-togoland → british-togoland(GHA 칼선 안)·french-togoland(TGO) · 1932 BFA french-upper-volta → 세 몫
//   (french-niger 도리·파다응구르마 · french-sudan 와이구야 · french-ivory-coast 나머지 — 몫 묶음 GW_BFA_NER·_SDN·_CIV, 기본값 9). 이음 1945: 세 몫 그대로(F3 GW 블록도 같은 몫 — 칸 예외 ①)
// 칼선: 재사용 GW_CUT_TOGOLAND(import { GW_CUT_TOGOLAND } from './cuts-f3.mjs' — F4 내내 같은 나눔, 기본 기간). 칸 사이 id 참조: french-sudan(WA 블록)
import { F4_GW_IDS } from './cuts-f4.mjs';
const GW_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
const GW_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
import { GW_CUT_TOGOLAND } from './cuts-f3.mjs';
import { GW_BFA_NER, GW_BFA_SDN, GW_BFA_CIV } from './cuts-f4.mjs';
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_GW_IDS 99). 오트볼타 몫 셋은 cuts-f4.mjs GW 머리(1932-09-05 칙령 서클 몫에 맞춘 주 조각 — 니제르 8·수단 8·코트디부아르 29)
const GW_CIV = idsOf('CIV'); // 코트디부아르 19
const GW_GHA = idsOf('GHA'); // 가나 10(재사용 칼선으로 토골란드/골드코스트)
const GW_TGO = idsOf('TGO'); // 토고 5
const GW_BEN = idsOf('BEN'); // 베냉 12
const GW_NER = idsOf('NER'); // 니제르 8
{
  const all = [GW_CIV, GW_GHA, GW_TGO, GW_BEN, GW_BFA_NER, GW_BFA_SDN, GW_BFA_CIV, GW_NER].flat();
  if (all.length !== F4_GW_IDS.length || new Set(all).size !== all.length || all.some((id) => !F4_GW_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa colonial: GW 묶음 합 ${all.length}개가 F4_GW_IDS ${F4_GW_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표)
own(GW_CIV, [[F4_START, 'french-ivory-coast']]); // 1893-03-10 식민지, 1895 프랑스령 서아프리카 — 1932~1946 오트볼타 몫은 아래 GW_BFA_CIV
ownSplit('GW_GHA', GW_GHA, [['토골란드', GW_CUT_TOGOLAND]], '골드코스트', {
  토골란드: [[F4_START, 'german-togoland'], [1920, 'british-togoland']], // 1914-08-26 항복·영국 점령(관계 occupied_by — Q1, 1916 임시 분할선은 그리지 않음), 1919-07-10 밀너-시몽 선언, 1920-01-10 베르사유 발효로 위임
  골드코스트: [[F4_START, 'british-gold-coast']], // 1874 직할 식민지, 1901 아샨티 합병·북부 준주 보호령(같은 항목)
});
own(GW_TGO, [[F4_START, 'german-togoland'], [1920, 'french-togoland']]); // 1914-08-26 항복·프랑스 점령(관계 — Q1), 1920 프랑스 위임(1922-07-20 국제 연맹 확정)
own(GW_BEN, [[F4_START, 'french-dahomey']]); // 1894 식민지, 1904 프랑스령 서아프리카
// 오트볼타 땅: 1910~1918 오트세네갈-니제르(french-sudan — WA 항목), 1919-03-01 오트볼타 식민지, 1932-09-05 폐지·세 식민지에 나눔(기본값 9), 1947-09-04 복원은 F3
own(GW_BFA_NER, [[F4_START, 'french-sudan'], [1919, 'french-upper-volta'], [1932, 'french-niger']]); // 파다응구르마·도리 서클
own(GW_BFA_SDN, [[F4_START, 'french-sudan'], [1919, 'french-upper-volta'], [1932, 'french-sudan']]); // 와이구야 서클·아리빈다 칸통·데두구 서클 서쪽
own(GW_BFA_CIV, [[F4_START, 'french-sudan'], [1919, 'french-upper-volta'], [1932, 'french-ivory-coast']]); // 와가두구·보보디울라소·가우아 등 — 1937 오트코트디부아르 구역(글)
own(GW_NER, [[F4_START, 'french-niger']]); // 1900-07-23 지더 군사 영토, 1910-06-22 니제르 군사 영토, 1922-10-13 식민지(이름 — 글). 티베스티 1929~1930은 CE-E가 이 항목으로 칠함
// ── F4 GW 끝 ──

// ── F4 CE-N 나이지리아·카메룬·기니만 섬 (최상위 이름 CEN_) ──
// 조각 F4_CEN_IDS(나이지리아 37·카메룬 10·적도 기니 6·상투메 프린시페 2 = 55), 구현 F4-CE-N
// 새 항목 3: german-kamerun(1910~1919 CMR 10 + NGA 중 북부 카메룬 띠 — 515,591 km²)·northern-nigeria-protectorate·southern-nigeria-protectorate(1910~1913 NGA 띠 밖 — 남부 17조각 188,186이 어림, 기본값 6)
// 앞 잇는 항목 5: F3 british-nigeria(1914~)·french-cameroons(from 1920) · F2 british-cameroons(from 1920)·spanish-guinea·portuguese-sao-tome
// 점프: 1914 북·남 보호령 → british-nigeria(띠 뺀 867,439) · 1920 german-kamerun → british-cameroons(CM-NW·CM-SW + 띠)·french-cameroons(CMR 8). 노이카메룬 몫은 CE-E 칸이 칠함
// 칼선: 재사용 CE_CUT_NCAM(import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs' — 기본 기간), 조건부 CEN_CUT_NNIG(cuts-f4.mjs CE-N 머리 — 그으면 ownSplit { from: F4_START, to: 1914 }·CEN_BOUNDS에 1914)
import { F4_CEN_IDS } from './cuts-f4.mjs';
import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs';
const CEN_BOUNDS = []; // 재사용 칼선은 시대 내내 같은 나눔(기본 기간). 남북 경계는 주 조각으로 닫혀 칼선을 긋지 않음(결과 노트 2절)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_CEN_IDS 55)
// 남나이지리아 17조각(188,186 km²) = 지금 남부 17주. 북나이지리아 보호령의 카바(지금 코기 서부·동부 이갈라)·일로린(크와라)·문시(베누에) 지방은 북쪽 — 주 경계가 1906~1913 보호령 경계와 같은 선(위키 en Northern Region, Nigeria)
const CEN_NG_SOUTH = ['NG-LA', 'NG-OG', 'NG-ON', 'NG-OS', 'NG-EK', 'NG-ED', 'NG-DE', 'NG-BY', 'NG-RI', 'NG-AK', 'NG-CR', 'NG-AB', 'NG-IM', 'NG-AN', 'NG-EB', 'NG-EN', 'NG-OY'];
const CEN_NG_NORTH = minus(idsOf('NGA'), ...CEN_NG_SOUTH); // 북부 20(북부 카메룬 띠 칼선이 보르노·아다마와·타라바에 걸침)
const CEN_CM_SOUTH = ['CM-NW', 'CM-SW']; // 남카메룬(지금 북서·남서 지방) 41,940 km²
const CEN_CMR = minus(idsOf('CMR'), ...CEN_CM_SOUTH); // 카메룬 나머지 8(424,952 km²). 1911 프랑스에 넘긴 오리부리(로곤강–샤리강 사이)는 지금 차드 조각이라 CE-E 땅(1910 한 해 근사 — 결과 노트 6절)
const CEN_GNQ = idsOf('GNQ'); // 적도 기니 6(비오코·리오무니·아노본)
const CEN_STP = idsOf('STP'); // 상투메 프린시페 2
{
  const all = [CEN_NG_SOUTH, CEN_NG_NORTH, CEN_CM_SOUTH, CEN_CMR, CEN_GNQ, CEN_STP].flat();
  if (all.length !== F4_CEN_IDS.length || new Set(all).size !== all.length || all.some((id) => !F4_CEN_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa colonial: CE-N 묶음 합 ${all.length}개가 F4_CEN_IDS ${F4_CEN_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1944 말 = F3 CE 블록 1945(띠·남카메룬 british-cameroons, 본토 british-nigeria, 나머지 french-cameroons)
// 독일령 카메룬은 1914-09 두알라 함락·1916-02 모라 항복으로 영국·프랑스가 차지했으나 1919년까지 독일령 색(Q1 — 점령은 관계 occupied_by, 1916 피코 임시선은 그리지 않음 — 기본값 5)
own(CEN_NG_SOUTH, [[F4_START, 'southern-nigeria-protectorate'], [1914, 'british-nigeria']]); // 1900-01-01 니제르 해안 보호령 + 왕립 니제르 회사 남쪽 땅, 1906-05-01 라고스 식민지 합침 — 점프: 1914-01-01 남·북 합침
ownSplit('CEN_NGN', CEN_NG_NORTH, [['띠', CEN_CUT_NCAM]], '본토', {
  띠: [[F4_START, 'german-kamerun'], [1920, 'british-cameroons']], // 북부 카메룬 띠 — 독일령 카메룬(1916 영국 점령), 1920 영국 위임(1922-07-20 연맹 확정)
  본토: [[F4_START, 'northern-nigeria-protectorate'], [1914, 'british-nigeria']], // 1900-01-01 왕립 니제르 회사 특허 회수, 수도 로코자 → 1902 주게루 — 점프: 1914-01-01 남·북 합침
});
own(CEN_CM_SOUTH, [[F4_START, 'german-kamerun'], [1920, 'british-cameroons']]); // 부에아(1901~1909 독일령 수도) 둘레 — 1916 영국 점령, 1920 영국 위임
own(CEN_CMR, [[F4_START, 'german-kamerun'], [1920, 'french-cameroons']]); // 두알라·야운데 — 1916 프랑스 점령, 1920 프랑스 위임. 노이카메룬(1911~1919)은 CE-E 칸이 칠함
own(CEN_GNQ, [[F4_START, 'spanish-guinea']]); // 1926 섬과 본토를 한 식민지로 묶음 — 이름만
own(CEN_STP, [[F4_START, 'portuguese-sao-tome']]); // 카카오 농장 — 모양 그대로
const CEN_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F4 CE-N 끝 ──

// ── F4 CE-E 적도 아프리카·차드 (최상위 이름 CEE_) ──
// 조각 F4_CEE_IDS(차드 22·중앙아프리카 17·가봉 9·콩고 공화국 12 = 60), 구현 F4-CE-E
// 새 항목 1: wadai(1910~1911 TD-OD·TD-SI·TD-WF 124,146 km², 관계 없음 — 기본값 10)
// 앞 잇는 항목 4: F3 french-chad(from 1900 — 칠함 1920~)·french-ubangi-shari(1910~1919 차드 땅까지 — 기본값 7)·french-gabon·french-middle-congo
// 점프: 1911 노이카메룬(CEE_CUT_NKAM_S·_N 안 — 가봉·중앙콩고·우방기샤리 → german-kamerun, 약 29.5만) · 1912 와다이 → french-ubangi-shari · 1920 노이카메룬 반환·차드 분리(→ french-chad) ·
//   1913 보르쿠·엔네디 첫 칠함(장악 해 — 기본값 1, 우방기샤리) · 1929 티베스티 첫 칠함(french-niger) · 1931 티베스티 french-niger → french-chad
// 칼선: 새 2(cuts-f4.mjs CE-E 머리 — ownSplit 기간 { from: 1911, to: 1920 }). 칸 사이 id 참조: german-kamerun(CE-N 블록)·french-niger(GW 블록)
// 비운 땅: BET(TD-TI 1910~1928, TD-BO·TCD-5579 1910~1912 — 1913 말 장악)는 주인 null + CEE_voids에 V(…) — 기본값 1
import { F4_CEE_IDS, CEE_CUT_NKAM_S, CEE_CUT_NKAM_N } from './cuts-f4.mjs';
const CEE_BOUNDS = [1911, 1920]; // 노이카메룬 칼선 묶음 기간 { from: 1911, to: 1920 }의 처음·끝(fillTables가 확인)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_CEE_IDS 60)
const CEE_TI = ['TD-TI']; // 티베스티 120,941 — 1929 니제르 군사 영토가 장악(기본값 1), 1931 차드로
const CEE_BE = ['TD-BO', 'TCD-5579']; // 보르쿠 251,802·엔네디 194,052 — 1913-11-27 아인갈라카·12-03 파야·12-24 우니앙가케비르 장악, 1914-01-08 보르쿠-엔네디 구역(※ fr Borkou-Ennedi-Tibesti)
const CEE_WADAI = ['TD-OD', 'TD-SI', 'TD-WF']; // 와다이 술탄국 124,146(기본값 10 — 1909 아베셰 점령 뒤 괴뢰 술탄, 1912 끝)
const CEE_NK_TCD = ['TD-MO']; // 마요케비 서부(레레 우체국 지역) — 통째로 노이카메룬
const CEE_NK_TCD_SPLIT = ['TD-LO', 'TD-LR', 'TD-ME', 'TD-TA']; // 로곤강 서쪽만 노이카메룬(칼선 CEE_CUT_NKAM_N)
const CEE_TCD = minus(idsOf('TCD'), ...CEE_TI, ...CEE_BE, ...CEE_WADAI); // 차드 나머지 16(노이카메룬 몫 다섯 포함)
const CEE_NK_CAF = ['CF-SE', 'CF-HS', 'CF-LB', 'CF-NM']; // 상가-음바에레(놀라)·맘베레-카데이(베르베라티·카르노)·로바예(음바이키)·나나-맘베레(부아르) — 통째로 노이카메룬
const CEE_NK_CAF_SPLIT = ['CF-OP', 'CF-MP', 'CF-AC']; // 우암-펜데·옴벨라-음포코·우암의 서쪽만(칼선 CEE_CUT_NKAM_N)
const CEE_CAF = idsOf('CAF'); // 중앙아프리카 17
const CEE_NK_GAB_SPLIT = ['GA-1', 'GA-9', 'GA-6']; // 에스튀에르 북쪽(코코비치)·우엘레은템·오고우에이빈도 북쪽(칼선 CEE_CUT_NKAM_S)
const CEE_GAB = idsOf('GAB'); // 가봉 9
const CEE_NK_COG = ['CG-13']; // 상가(우에소·수앙케) — 통째로 노이카메룬
const CEE_NK_COG_SPLIT = ['CG-15', 'CG-8', 'CG-7']; // 퀴베트우에스트 북쪽 끝·상가강 '더듬이'(퀴베트·리쿠알라 서쪽 띠 — 칼선 CEE_CUT_NKAM_S)
const CEE_COG = idsOf('COG'); // 콩고 공화국 12
{
  const all = [CEE_TI, CEE_BE, CEE_WADAI, CEE_TCD, CEE_CAF, CEE_GAB, CEE_COG].flat();
  if (all.length !== F4_CEE_IDS.length || new Set(all).size !== all.length || all.some((id) => !F4_CEE_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa colonial: CE-E 묶음 합 ${all.length}개가 F4_CEE_IDS ${F4_CEE_IDS.length}개와 다름`);
  }
  const nk = [CEE_NK_TCD, CEE_NK_TCD_SPLIT, CEE_NK_CAF, CEE_NK_CAF_SPLIT, CEE_NK_GAB_SPLIT, CEE_NK_COG, CEE_NK_COG_SPLIT].flat();
  if (nk.some((id) => !F4_CEE_IDS.includes(id)) || new Set(nk).size !== nk.length) throw new Error('sub-saharan-africa colonial: CE-E 노이카메룬 조각 목록이 틀림');
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표). 1910~1919 차드 땅은 우방기샤리 색(1906 우방기샤리-차드 — 기본값 7), 1920 차드 식민지로 분리
own(CEE_TI, [[F4_START, null], [1929, 'french-niger'], [1931, 'french-chad']]); // 1910~1928 비움(실효 지배 앞 — 기본값 1) · 1929 장악(니제르 군사 영토 바르다이 소구역) · 1931 차드로(기본값 1. fr판은 1929-11-01 이관 — 2년 차, 결과 노트 2절)
own(CEE_BE, [[F4_START, null], [1913, 'french-ubangi-shari'], [1920, 'french-chad']]); // 1910~1912 비움 · 1913 말 프랑스 장악(라르조 대령) · 1920 차드 식민지
own(CEE_WADAI, [[F4_START, 'wadai'], [1912, 'french-ubangi-shari'], [1920, 'french-chad']]); // 1909 아베셰 점령·1911 두드 무라 항복 — 1912 술탄국 끝(기본값 10)
own(minus(CEE_TCD, ...CEE_NK_TCD), [[F4_START, 'french-ubangi-shari'], [1920, 'french-chad']]); // 우방기샤리-차드 → 1920 차드 민정 식민지
own(minus(CEE_CAF, ...CEE_NK_CAF), [[F4_START, 'french-ubangi-shari']]); // 1910-01-15 프랑스령 적도 아프리카 소속(글)
own(CEE_GAB, [[F4_START, 'french-gabon']]);
own(minus(CEE_COG, ...CEE_NK_COG), [[F4_START, 'french-middle-congo']]);
// 노이카메룬 1911~1919(기본값 3·Q1 — 1911-11-04 조약 해부터 독일령, 1916 프랑스가 되찾았으나 법적 반환은 1920-01-10 베르사유 발효 → 지도 1920 반환)
//   통째 조각은 한 줄로(1911 german-kamerun · 1920 원래 땅 — 차드 몫은 french-chad), 걸치는 조각은 ownSplit 묶음(기간 1911~1919)으로 가른다(1910·1920~는 위 통째 줄)
own(CEE_NK_TCD, [[F4_START, 'french-ubangi-shari'], [1911, 'german-kamerun'], [1920, 'french-chad']]);
own(CEE_NK_CAF, [[F4_START, 'french-ubangi-shari'], [1911, 'german-kamerun'], [1920, 'french-ubangi-shari']]);
own(CEE_NK_COG, [[F4_START, 'french-middle-congo'], [1911, 'german-kamerun'], [1920, 'french-middle-congo']]);
const CEE_NK_OWN = { 노이카메룬: [[1911, 'german-kamerun']] };
ownSplit('CEE_NK_UBS', [...CEE_NK_CAF_SPLIT, ...CEE_NK_TCD_SPLIT], [['노이카메룬', CEE_CUT_NKAM_N]], '우방기샤리', { ...CEE_NK_OWN, 우방기샤리: [[1911, 'french-ubangi-shari']] }, { from: 1911, to: 1920 });
ownSplit('CEE_NK_GAB', CEE_NK_GAB_SPLIT, [['노이카메룬', CEE_CUT_NKAM_S]], '가봉', { ...CEE_NK_OWN, 가봉: [[1911, 'french-gabon']] }, { from: 1911, to: 1920 });
ownSplit('CEE_NK_COG', CEE_NK_COG_SPLIT, [['노이카메룬', CEE_CUT_NKAM_S]], '중앙콩고', { ...CEE_NK_OWN, 중앙콩고: [[1911, 'french-middle-congo']] }, { from: 1911, to: 1920 });
// 일부러 비운 땅: BET는 프랑스 실효 지배 앞(기본값 1 — 주변 구역 sahara-south). 티베스티 1910~1928, 보르쿠·엔네디 1910~1912
const CEE_voids = () => [V(F4_START, 1929, ...CEE_TI), V(F4_START, 1913, ...CEE_BE)];
// ── F4 CE-E 끝 ──

// ── F4 H1 소말리아 쪽 (최상위 이름 H1_) ──
// 조각 F4_H1_IDS(소말리아 13·소말릴란드 SOL 1 = 14), 구현 F4-H1
// 새 항목 3: italian-somaliland(1910~1940)·majeerteen-sultanate(1910~1926 SO-BR·SO-NU + SO-MU 중 K3 북쪽)·sultanate-of-hobyo(1910~1926 SO-MU K3 남쪽 + SO-GA 중 K4 북쪽 — M-F4-7)
// 앞 잇는 항목 2: F3 somalia-british-admin(1941~)·british-somaliland(1910~ — 데르비시 국가는 이 색, Q2)
// 점프: 1924 주바랜드(K2 서쪽 british-kenya → italian-somaliland 약 91,082) · 1927 술탄국 둘 → italian-somaliland · 1941 italian-somaliland → somalia-british-admin(474,398)
// 칼선: 새 3(cuts-f4.mjs H1 머리 — K2 ownSplit { from: F4_START, to: 1924 }·K3·K4 { from: F4_START, to: 1927 }). 칸 사이 id 참조: british-kenya(E1 블록 — K2 서쪽 1910~1923)
import { F4_H1_IDS } from './cuts-f4.mjs';
import { H1_CUT_JUBA, H1_CUT_MAJ, H1_CUT_HOB } from './cuts-f4.mjs';
const H1_BOUNDS = [1924, 1927]; // K2 묶음 기간의 끝 1924·K3·K4 묶음 기간의 끝 1927(fillTables가 확인)
// 사료(※ 연도 — 결과 노트 2절): 이탈리아 보호 조약 호비오 1889-02-08·마제르테인 1889-04-07(위키 en Sultanate of Hobyo·Majeerteen Sultanate), 호비오 술탄국 성립 1878(같은 문서 — Metz 『Somalia: A Country Study』),
//   올트레 주바 1924-07-15 조약·07-16 이탈리아 총독(위키 en Oltre Giuba — 91,082 km², 기본값 22), 술탄국 정복 1925~1927 말(위키 en Majeerteen Sultanate — 마지막 칠한 해 1926, M-F4-7),
//   이탈리아령 소말리아 영국 점령 1941-02-26(위키 en Italian Somaliland — 이어 F3 군정 항목). 영국령 소말릴란드 안쪽의 데르비시 국가(1920 무너짐)는 영국령 색(Q2), 1940-08~1941-03 이탈리아 점령은 칠하지 않음(기본값 20)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_H1_IDS 14)
const H1_SOL = idsOf('SOL'); // 1 — 영국령 소말릴란드
const H1_MAJ = ['SO-BR', 'SO-NU']; // 바리·누갈 — 마제르테인 술탄국(104,494)
const H1_MU = ['SO-MU']; // 무둑 — K3 북쪽 마제르테인·남쪽 호비오
const H1_GA = ['SO-GA']; // 갈구두드 — K4 북쪽 호비오·남쪽 이탈리아 직할
const H1_JUBA = ['SO-GE', 'SO-JD', 'SO-JH']; // 게도·중주바·하주바 — K2 서쪽 올트레 주바(1910~1923 케냐 쪽)·동쪽 이탈리아 직할
const H1_BEN = minus(idsOf('SOM'), ...H1_MAJ, ...H1_MU, ...H1_GA, ...H1_JUBA); // 베나디르 나머지 여섯(바콜·바나디르·바이·히란·중셰벨레·하셰벨레)
{
  const all = [H1_SOL, H1_MAJ, H1_MU, H1_GA, H1_JUBA, H1_BEN].flat();
  const want = new Set(F4_H1_IDS);
  if (H1_BEN.length !== 6 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa colonial: H1 나라별 묶음 합 ${all.length}(베나디르 ${H1_BEN.length})이 F4_H1_IDS ${want.size}와 다름`);
  }
}
own(H1_SOL, [[F4_START, 'british-somaliland']]); // 영국 보호령(1910~1920 안쪽 데르비시 국가도 이 색 — Q2), 1945~는 postwar.mjs HN 줄
own(H1_MAJ, [[F4_START, 'majeerteen-sultanate'], [1927, 'italian-somaliland'], [1941, 'somalia-british-admin']]); // 1927 말 정복 끝(M-F4-7)·1941-02 영국 군정
ownSplit('H1_MU', H1_MU, [['마제르테인', H1_CUT_MAJ]], '호비오', {
  마제르테인: [[F4_START, 'majeerteen-sultanate']],
  호비오: [[F4_START, 'sultanate-of-hobyo']],
}, { from: F4_START, to: 1927 }); // K3
own(H1_MU, [[1927, 'italian-somaliland'], [1941, 'somalia-british-admin']]);
ownSplit('H1_GA', H1_GA, [['호비오', H1_CUT_HOB]], '베나디르', {
  호비오: [[F4_START, 'sultanate-of-hobyo']],
  베나디르: [[F4_START, 'italian-somaliland']],
}, { from: F4_START, to: 1927 }); // K4
own(H1_GA, [[1927, 'italian-somaliland'], [1941, 'somalia-british-admin']]);
ownSplit('H1_JUBA', H1_JUBA, [['올트레주바', H1_CUT_JUBA]], '주바동쪽', {
  올트레주바: [[F4_START, 'british-kenya']], // 칸 사이 id 참조 — E1 블록(동아프리카 보호령, 1920 케냐 식민지)
  주바동쪽: [[F4_START, 'italian-somaliland']],
}, { from: F4_START, to: 1924 }); // K2
own(H1_JUBA, [[1924, 'italian-somaliland'], [1941, 'somalia-british-admin']]); // 1924-07 조약으로 올트레 주바 편입(1926 이탈리아령 소말리아에 합침 — 글)
own(H1_BEN, [[F4_START, 'italian-somaliland'], [1941, 'somalia-british-admin']]); // 1905 직할 식민지 베나디르, 1941-02-26 영국 점령
const H1_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F4 H1 끝 ──

// ── F4 H2 에티오피아·나일 (최상위 이름 H2_) ──
// 조각 F4_H2_IDS(에티오피아 11·에리트레아 6·지부티 6·수단 17·남수단 10 = 50 — 서나일 8구는 E1 조각), 구현 F4-H2
// 새 항목 2: italian-eritrea(1910~1940 ERI 6 — 땅 자름 123,658)·darfur(1910~1915 SD-DN·SD-DW·SD-DE·SDN-5856·SDN-5857 519,494 — 다르 마살리트 포함, 기본값 24)
// 앞 잇는 항목 4: F1 ethiopia(1910~ 한 버전 — 1936~1940 occupied_by italy, 티그레·오가덴도 에티오피아 색, 기본값 18)·djibouti · F3 eritrea-british-admin(1941~)·anglo-egyptian-sudan(관계 없음)
// 점프: 1916 다르푸르 → anglo-egyptian-sudan(519,494) · 1941 italian-eritrea → eritrea-british-admin(125,161). 서나일 8구 1914(수단 → 우간다)는 E1 칸이 칠함
import { F4_H2_IDS } from './cuts-f4.mjs';
const H2_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 사료(※ 연도 — 결과 노트 2절): 다르푸르 술탄국 1603 술레이만 솔롱 성립~1916-11-06 알리 디나르 전사(위키 en List of sultans of Darfur 정보 상자 formation 1603·abolition 1916-11-06,
//   en Sultanate of Darfur — 1874 멸망·1898 다시 섬·1916 영국 원정), 이탈리아령 에리트레아 1890-01-01 칙령~1941 영국 점령(위키 en Italian Eritrea — 1941-04-01 아스마라 함락),
//   에티오피아 1936-05-05 아디스아바바 함락~1941-05-05 황제 복귀(점령은 관계 occupied_by italy 1936~1940 — 결정 6·기본값 18), 지부티는 1910~1944 내내 프랑스령 소말릴란드(이름만 — 글)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_H2_IDS 50)
const H2_ETH = idsOf('ETH'); // 11 — 티그레 ET-TI·오가덴 ET-SO 포함: 1936~1941 이탈리아령 동아프리카 에리트레아·소말리아 총독부에 붙은 땅도 에티오피아 색(기본값 18), 1920년까지 오가덴의 데르비시 국가는 글(Q2)
const H2_ERI = idsOf('ERI'); // 6
const H2_DJI = idsOf('DJI'); // 6
const H2_DAR = ['SD-DN', 'SD-DW', 'SD-DE', 'SDN-5856', 'SDN-5857']; // 5 — 다르푸르 술탄국(519,494 km², 다르 마살리트 SD-DW 쪽도 함께 — 기본값 24, 장부 후보)
const H2_SDN = minus([...idsOf('SDN'), ...idsOf('SDS')], ...H2_DAR); // 12 + 10 — 공동 통치 수단(라도 구역 SS-EC는 1910-06 콩고에서 넘어와 1910 말 수단, 사라 삼각지대는 서아시아 italian-libya가 칠함)
{
  const all = [H2_ETH, H2_ERI, H2_DJI, H2_DAR, H2_SDN].flat();
  const want = new Set(F4_H2_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa colonial: H2 나라별 묶음 합 ${all.length}이 F4_H2_IDS ${want.size}와 다름`);
  }
}
own(H2_ETH, [[F4_START, 'ethiopia']]); // 에티오피아 제국 — 1936~1940 이탈리아 점령은 occupied_by italy(한 버전, 결정 6)
own(H2_ERI, [[F4_START, 'italian-eritrea'], [1941, 'eritrea-british-admin']]); // 1941-04-01 아스마라 함락 → 영국 군정(F3 항목을 1941로 앞당김 — 기본값 19)
own(H2_DJI, [[F4_START, 'djibouti']]); // 프랑스령 소말릴란드(1940~1942 비시 프랑스 쪽 — 글, 기본값 13), vassal_of france는 F1 줄
own(H2_DAR, [[F4_START, 'darfur'], [1916, 'anglo-egyptian-sudan']]); // 1916-11-06 알리 디나르 전사(그해 말 실효 지배 — 1917 편입은 글, 기본값 24)
own(H2_SDN, [[F4_START, 'anglo-egyptian-sudan']]); // 서나일 8구(1910~1913 수단 몫)는 E1 칸이 이 id로 칠함(M-F4-2)
const H2_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F4 H2 끝 ──

// ── F4 E1 대호수·동 (최상위 이름 E1_) ──
// 조각 F4_E1_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112(서나일 8구 포함)·케냐 8·탄자니아 30 = 183), 구현 F4-E1
// 새 항목 1: german-east-africa(1910~1919 TZA 본토 25 + RWA 5 + BDI 17 — 약 997,779 km²)
// 앞 잇는 항목 6: F3 belgian-congo · F2 british-uganda·british-kenya(from 1895)·british-tanganyika(from 1920)·ruanda-urundi(from 1920)·sultanate-of-zanzibar
// 점프: 1914 서나일 8구 anglo-egyptian-sudan → british-uganda(16,259 — M-F4-2) · 1920 german-east-africa → british-tanganyika·ruanda-urundi · 1926 투르카나(K1 안 british-uganda → british-kenya 약 77,000).
//   케냐 K2 서쪽(주바랜드)은 H1 칸이 1910~1923 british-kenya로 칠함
// 칼선: 새 1(cuts-f4.mjs E1 머리 — K1 ownSplit { from: F4_START, to: 1926 }). 칸 사이 id 참조: anglo-egyptian-sudan(H2 블록 — 서나일 8구 1910~1913)
import { F4_E1_IDS } from './cuts-f4.mjs';
import { E1_CUT_TURKANA } from './cuts-f4.mjs';
const E1_BOUNDS = [1926]; // K1 묶음 기간의 끝(1910~1925 투르카나를 가르고 1926~ 케냐 통째 — fillTables가 이 해를 확인)
// 사료(※ 연도 — 결과 노트 2절): 독일 동아프리카 회사 칙허장 1885-02-27(위키 en German East Africa — 1891 제국 직할), 동아프리카 보호령 선포 1895-07-01(위키 en East Africa Protectorate — 1920-07-23 케냐 식민지),
//   서나일(라도 구역 남쪽) 1914-01-01 수단 → 우간다(위키 en Lado Enclave), 루돌프주(투르카나) 1926 우간다 → 케냐(위키 en Turkana District·Turkana County 77,598 km²),
//   키갈리 1916-05-06·타보라 1916-09-19 점령, 1919-05-30 오르트-밀너 협정(르완다·부룬디 벨기에 몫), 1920-01-10 베르사유 발효(위키 en German East Africa·Ruanda-Urundi)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_E1_IDS 183)
const E1_COD = idsOf('COD'); // 11 — 벨기에령 콩고(라도 구역은 1910-06 수단 땅이라 콩고 조각 밖)
const E1_RWA = idsOf('RWA'); // 5 — 독일령 동아프리카 → 1920 루안다-우룬디
const E1_BDI = idsOf('BDI'); // 17 — 같음(1923 기사카 조정은 1만 밑 — 알려진 근사)
const E1_WEST_NILE = ['UG-301', 'UG-303', 'UG-309', 'UG-310', 'UG-313', 'UG-316', 'UG-320', 'UG-331']; // 서나일 8구(16,259) — 1910~1913 수단 땅(H2 항목 id 참조, M-F4-2)
const E1_UGA = minus(idsOf('UGA'), ...E1_WEST_NILE); // 104 — 우간다 보호령
const E1_RIFT = ['KE-700']; // 리프트밸리 — K1 안 투르카나(루돌프주)는 1910~1925 우간다 보호령
const E1_KEN = minus(idsOf('KEN'), ...E1_RIFT); // 7 — 동아프리카 보호령(1920 케냐 식민지, 해안 16 km 띠 포함 — 알려진 근사)
const E1_ZANZIBAR = ['TZ-06', 'TZ-07', 'TZ-10', 'TZ-11', 'TZ-15']; // 웅구자섬·펨바섬 다섯 조각(F3 EA_ZANZIBAR와 같음)
const E1_TZ_MAINLAND = minus(idsOf('TZA'), ...E1_ZANZIBAR); // 본토 25 — 독일령 동아프리카 → 1920 영국령 탕가니카(키옹가 삼각지대는 모잠비크 조각 — 알려진 근사)
{
  const all = [E1_COD, E1_RWA, E1_BDI, E1_WEST_NILE, E1_UGA, E1_RIFT, E1_KEN, E1_ZANZIBAR, E1_TZ_MAINLAND].flat();
  const want = new Set(F4_E1_IDS);
  if (E1_UGA.length !== 104 || E1_KEN.length !== 7 || E1_TZ_MAINLAND.length !== 25 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa colonial: E1 나라별 묶음 합 ${all.length}이 F4_E1_IDS ${want.size}와 다름`);
  }
}
own(E1_COD, [[F4_START, 'belgian-congo']]); // 1908-11-15 벨기에 식민지, 1945~는 postwar.mjs EA 줄
own(E1_RWA, [[F4_START, 'german-east-africa'], [1920, 'ruanda-urundi']]); // 1916-05 벨기에 점령(관계 occupied_by), 1920-01-10 베르사유 발효
own(E1_BDI, [[F4_START, 'german-east-africa'], [1920, 'ruanda-urundi']]);
own(E1_TZ_MAINLAND, [[F4_START, 'german-east-africa'], [1920, 'british-tanganyika']]); // 1916 영국 점령(관계 occupied_by), 1920-01-10 탕가니카 영토
own(E1_ZANZIBAR, [[F4_START, 'sultanate-of-zanzibar']]); // 1890~ 영국 보호국
own(E1_WEST_NILE, [[F4_START, 'anglo-egyptian-sudan'], [1914, 'british-uganda']]); // 칸 사이 id 참조 — H2 블록(라도 구역 남쪽), 1914-01-01 우간다로
own(E1_UGA, [[F4_START, 'british-uganda']]);
ownSplit('E1_RIFT', E1_RIFT, [['투르카나', E1_CUT_TURKANA]], '리프트밸리', {
  투르카나: [[F4_START, 'british-uganda']], // 루돌프주(우간다 보호령)
  리프트밸리: [[F4_START, 'british-kenya']],
}, { from: F4_START, to: 1926 }); // K1
own(E1_RIFT, [[1926, 'british-kenya']]); // 1926 루돌프주가 케냐 식민지 투르카나 지구로(기본값 23)
own(E1_KEN, [[F4_START, 'british-kenya']]); // 1895-07-01 동아프리카 보호령, 1920-07-23 케냐 식민지(이름만 — 글)
const E1_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F4 E1 끝 ──

// ── F4 S1 남쪽 (최상위 이름 S1_) ──
// 조각 F4_S1_IDS(남아프리카 9·나미비아 13·보츠와나 15·레소토 10·에스와티니 4·앙골라 18 = 69), 구현 F4-S1
// 새 항목 1: german-south-west-africa(1910~1919 NAM 13 — 831,840 km² area:geo 땅 자름, 조사 835,983은 땅 자름 없음 — 월비스베이 근사)
// 앞 잇는 항목 6: F1 south-africa(1910-05-31 연방)·south-west-africa(1920~) · F2 bechuanaland·basutoland·swaziland-protectorate·portuguese-angola
// 점프: 1920 german-south-west-africa → south-west-africa(831,840 — 같은 땅, 주인만 바뀜)
import { F4_S1_IDS } from './cuts-f4.mjs';
const S1_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_S1_IDS 69)
const S1_ZAF = idsOf('ZAF'); // 9 — 남아프리카 연방(1910-05-31)
const S1_NAM = idsOf('NAM'); // 13 — 월비스베이 NA-ER(1910~1919 케이프 땅인데 독일령 남서아프리카 색 — F1 근사)·카프리비 띠 NA-CA(1929까지 베추아날란드 시정 — 글) 포함
const S1_BWA = idsOf('BWA'); // 15
const S1_LSO = idsOf('LSO'); // 10
const S1_SWZ = idsOf('SWZ'); // 4
const S1_AGO = idsOf('AGO'); // 18 — 카빈다 AO-CAB 포함
{
  const all = [S1_ZAF, S1_NAM, S1_BWA, S1_LSO, S1_SWZ, S1_AGO].flat();
  const want = new Set(F4_S1_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa colonial: S1 나라별 묶음 합 ${all.length}이 F4_S1_IDS ${want.size}와 다름`);
  }
}
own(S1_ZAF, [[F4_START, 'south-africa']]); // 1910-05-31 남아프리카 연방(케이프·나탈·트란스발·오렌지강 식민지), 1931 웨스트민스터 헌장은 글
own(S1_NAM, [[F4_START, 'german-south-west-africa'], [1920, 'south-west-africa']]); // 1915-07-09 코라브 항복 뒤 남아프리카 점령은 관계 occupied_by(Q1 — 1919까지 독일령 색), 1920-01-10 베르사유 발효·C식 위임
own(S1_BWA, [[F4_START, 'bechuanaland']]);
own(S1_LSO, [[F4_START, 'basutoland']]);
own(S1_SWZ, [[F4_START, 'swaziland-protectorate']]);
own(S1_AGO, [[F4_START, 'portuguese-angola']]); // 1926 쿠네네강 경계 조정(약 1,000 km²)은 근사
const S1_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── F4 S1 끝 ──

// ── F4 S2 로디지아·인도양 (최상위 이름 S2_) ──
// 조각 F4_S2_IDS(짐바브웨 10·잠비아 10·말라위 28·모잠비크 11·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹 FR-RE·마요트 FR-YT 2·세인트헬레나 SHN 2 = 124), 구현 F4-S2
// 새 항목 2: bsac-southern-rhodesia(1910~1922 ZWE 391,760)·bsac-northern-rhodesia(1910~1923 ZMB 758,598 — 1911 합침 앞 1910도 한 덩어리)
// 앞 잇는 항목 10: F1 rhodesia(1923~)·seychelles·reunion·mayotte · F2 northern-rhodesia(1924~)·nyasaland·portuguese-mozambique·british-mauritius·french-comoros · F3 french-madagascar
// 점프: 1923 bsac-southern-rhodesia → rhodesia · 1924 bsac-northern-rhodesia → northern-rhodesia. 모잠비크·니아사 회사 영지는 포르투갈령 모잠비크 색(기본값 28)
// 비운 땅: SHN 1910~1944(0단계 기본값 4)는 주인 null + S2_voids에 V(…). 코모로 세 섬 COM은 1910부터 french-comoros(창구 ③ R-Q1 — 1886 보호령)
// 사료: 위키 en Company rule in Rhodesia(1889 헌장, 1890-09-13 개척대가 솔즈베리에 국기, 1911 북서·북동 로디지아 합침·수도 리빙스턴, 1922-10-27 주민 투표, 1923-09-12 병합·10-01 책임 자치,
// 1924-04-01 북로디지아 보호령), 위키 en Niassa Company(1891 인가~1929-10-27 연장 거부로 폐지), en Mozambique Company(1891-02-11~1942-07-18), en Battle of Madagascar(1942-05-05~11-06 — 따로 칠하지 않음)
import { F4_S2_IDS } from './cuts-f4.mjs';
const S2_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F4_S2_IDS 124)
const S2_ZWE = idsOf('ZWE'); // 10 — 남로디지아(1910~1922 회사령, 1923~ 자치 식민지)
const S2_ZMB = idsOf('ZMB'); // 10 — 북로디지아(1910 북서·북동 로디지아 두 행정 구역도 한 덩어리 — 알려진 근사)
const S2_MWI = idsOf('MWI'); // 28 — 니아살랜드(말라위호 리코마섬·치주물루섬 포함)
const S2_MOZ = idsOf('MOZ'); // 11 — 모잠비크 회사(마니카·소팔라)·니아사 회사(니아사·카부델가두) 영지도 포르투갈령 모잠비크 색(기본값 28), 키옹가 삼각지대는 MZ-P 안(1910~1918 근사)
const S2_MDG = idsOf('MDG'); // 22 — 1942 영국 점령은 색 변화 0(기본값 29)
const S2_MUS = idsOf('MUS'); // 14
const S2_SYC = idsOf('SYC'); // 22
const S2_COM = idsOf('COM'); // 3 — 그랑드코모르섬·앙주앙섬·모엘리섬
const S2_REU = ['FR-RE']; // 레위니옹
const S2_MYT = ['FR-YT']; // 마요트
const S2_SHN = idsOf('SHN'); // 2 — SH-HL·SH-AC
{
  const all = [S2_ZWE, S2_ZMB, S2_MWI, S2_MOZ, S2_MDG, S2_MUS, S2_SYC, S2_COM, S2_REU, S2_MYT, S2_SHN].flat();
  const want = new Set(F4_S2_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa colonial: S2 나라별 묶음 합 ${all.length}이 F4_S2_IDS ${want.size}와 다름`);
  }
}
own(S2_ZWE, [[F4_START, 'bsac-southern-rhodesia'], [1923, 'rhodesia']]); // 1923-10-01 책임 자치 식민지 — F3 SF 줄과 이어짐
own(S2_ZMB, [[F4_START, 'bsac-northern-rhodesia'], [1924, 'northern-rhodesia']]); // 1911 북서·북동 합침(글), 1924-04-01 영국 보호령
own(S2_MWI, [[F4_START, 'nyasaland']]); // 1907~ 영국 보호령, 1915 칠렘브웨 봉기는 글
own(S2_MOZ, [[F4_START, 'portuguese-mozambique']]);
own(S2_MDG, [[F4_START, 'french-madagascar']]); // 1940~1942 비시 정부, 1942 영국 점령·자유 프랑스 인계는 글(기본값 13·29)
own(S2_MUS, [[F4_START, 'british-mauritius']]);
own(S2_SYC, [[F4_START, 'seychelles']]); // 1903 모리셔스에서 떼어 낸 직할 식민지
own(S2_COM, [[F4_START, 'french-comoros']]); // 1886 보호 조약·1908 마다가스카르 부속·1912 병합 — 1910부터 칠함(창구 ③ R-Q1, 기본값 30 고침)
own(S2_REU, [[F4_START, 'reunion']]);
own(S2_MYT, [[F4_START, 'mayotte']]);
// 세인트헬레나·어센션(SHN): 줄을 적지 않아 시대 내내 주인 null
const S2_voids = () => [
  V(F4_START, F4_END, ...S2_SHN), // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(0단계 기본값 4)
];
// ── F4 S2 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F4_START, ...WA_BOUNDS, ...GW_BOUNDS, ...CEN_BOUNDS, ...CEE_BOUNDS, ...H1_BOUNDS, ...H2_BOUNDS, ...E1_BOUNDS, ...S1_BOUNDS, ...S2_BOUNDS, F4_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F4_START || BOUNDS.at(-1) !== F4_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa colonial: 표 경계 해 ${BOUNDS.join(', ')}는 ${F4_START}~${F4_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa colonial: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa colonial: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa colonial: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa colonial: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa colonial: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F4_END) throw new Error(`sub-saharan-africa colonial: 마지막 표의 끝이 ${joined.TO} (${F4_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F4_END(1945) 그대로(끝 없음 null을 쓰지 않음 — 1945~는 postwar.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만 걸림): 모든 버전은 F4_START~F4_END 안(1944/1945 이음은 postwar.mjs가 같은 id로)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < F4_START || t === null || t > F4_END)) throw new Error(`sub-saharan-africa colonial: ${id}의 버전 기간이 ${F4_START}~${F4_END} 밖(끝 없음 null 금지 — 1945~는 postwar.mjs 몫)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GW_voids(), ...CEN_voids(), ...CEE_voids(), ...H1_voids(), ...H2_voids(), ...E1_voids(), ...S1_voids(), ...S2_voids()];
if (voids.some(([f, t]) => f < F4_START || t === null || t > F4_END)) throw new Error(`sub-saharan-africa colonial: 비운 땅의 기간은 ${F4_START}~${F4_END} 안이어야 함(끝 없음 null 금지 — 1945~는 postwar.mjs 몫)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F4_START(1910)~F4_END(1945, 미포함)만 만든다(1885~1909는 partition.mjs 구역 '사하라 이남 분할 …'이, 1945~는 postwar.mjs 구역 '사하라 이남 전후 …'가 이음 — M-F4-4·F5 특별 지시 2. 1884 이하에는 이 권역 구역이 없음).
// 비운 땅이 바뀌는 해마다 구역 하나(CE-E 장악 해·S2 1912가 경계가 됨), 마지막 구역의 끝은 F4_END. 이름 '사하라 이남 식민 <from>~<to-1>'(F3 '사하라 이남 전후 …'·F2 '사하라 이남 탈식민 …'·F1 '사하라 이남 현대 …'와 겹치지 않음).
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F4_START, F4_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => F4_START < y && y < F4_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `사하라 이남 식민 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void geomOfUnit; // 아홉 칸이 쓰지 않는 이름 경고 막기

export const era = {
  name: 'colonial',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F3 postwar.mjs·F2 decolonization.mjs·F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
