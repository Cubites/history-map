// sub-saharan-africa 시대 파일 prepartition (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1800~1884: 소코토 지하드부터 베를린 회의 앞까지 (F6)
// 짝 항목 파일: data/entities/sub-saharan-africa-prepartition.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 앞 잇는 F5 항목 19는 sub-saharan-africa-partition.yaml, F4 항목 4는
//   sub-saharan-africa-colonial.yaml, F3 항목 4는 sub-saharan-africa-postwar.yaml, F2 항목 12는 sub-saharan-africa-decolonization.yaml, F1 항목 6은 sub-saharan-africa-modern.yaml)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F6 짜임 안내 (F6 뼈대 2026-11-13 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 1~6), F1~F5 창구 ②·③, 서아시아 A1 창구 ①, F6 창구 ②(질문 6건 Q1~Q6·자동 승인 0·기본값 46·M-F6-1~3), 지시문 f6/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음. 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(1806 보나파르트섬·1814 파리 조약·1814 런던 협약·
//   1841 이집트령 수단 주 편입·1846 보르누 마이 폐지·1855 테워드로스 2세·1856 나탈 따로 식민지·1860 카프라리아 왕령 식민지·1868 바수톨란드·1871 요하네스 4세·1873 그리콸란드 웨스트 왕령 식민지·
//   1879 줄루 열세 족장령·1882 리비에르뒤쉬드)는 새 버전이 아니다 — 항목 글로(기본값 39·43, 0단계 기본값 21).
// 1800 앞 버전: 이 시대 파일의 첫 해는 F6_START(1800)다. 1800 앞에 성립한 나라·식민지도 이 파일의 첫 버전은 1800부터이고, 앞 시대 파일 precolonial(F7, −2332~1799)이 같은 id로 앞을 이음
//   (1799 말 모양 = 이 파일의 1800 모양 — 푼지만 예외, F7 P1). F7은 빈 땅 검사 구역을 두지 않음(구역은 이 파일 1800~1884부터 — 아래 gapZones). 1800 뒤에 칠하기 시작하는 항목은 그 해부터(mapNote '지도에는 ○년부터' = 첫 칠한 해).
// 시대 경계 맞물림: 뒤 시대 파일 partition.mjs(F5)의 첫 해 F5_START = 1885 = 이 파일의 F6_END(미포함 — 아래 확인 줄). 이 파일 버전의 끝은 모두 F6_END 이하이고(끝 없음 null 금지),
//   1885에 이어지는 나라(같은 id)는 joinEras가 이 파일 버전 뒤에 F5~F1 버전을 붙인다. 1884 말 모양은 F5의 1885 모양과 같아야 한다 — F5 결정이 만든 1885 점프(P1 ㉠~㉦)만 예외:
//   ㉠ 프랑스령 세네갈 +178,501 ㉡ 독일령 토고·카메룬 서남·오일 리버스(기본값 8) ㉢ 스페인령 기니 리오무니 ㉣ 앙골라 해안 밖·모잠비크 거점 밖(Q6)·독일령 남서아프리카·베추아날란드·콩고 자유국
//   ㉤ 이집트령 수단 → 마흐디 국가(같은 조각 색만 — 적도주 SS-EC·SS-EE·SS-EW·에리트레아 ER-GB·ER-SK는 1885 비움) ㉥ 에리트레아 고원 −11,442(M-F6-2 — 고원 ER-AN·ER-MA 11,184 등, 조각 파일 이름표가 실제 주 이름과 어긋남) ㉦ 노던케이프 오렌지강 북쪽·스텔라랜드·고센.
//   앞 시대 파일 precolonial.mjs(F7)의 끝 F7_END = 1800 = 이 파일의 F6_START(그 파일이 손으로 맞춘 확인 줄).
//   권역 파일의 joinEras 목록은 [precolonialEra, prepartitionEra, partitionEra, colonialEra, postwarEra, decolonizationEra, modernEra](과거가 앞 — F7 뼈대 2026-11-14).
// 앞 잇는 항목 45: F5 항목 19(sub-saharan-africa-partition.yaml)·F4 항목 4(…-colonial.yaml)·F3 항목 4(…-postwar.yaml)·F2 항목 12(…-decolonization.yaml)·F1 항목 6(…-modern.yaml) — 같은 id, 블록은 그 자리
//   (파일 소유표 — COMMON 5절, 글과 from 고침만 칸이). 항목 from 고침 넷(필수 — F6 첫 버전이 지금 from보다 앞): cape-colony 1806 → 1795·basutoland 1884 → 1824·swaziland-protectorate 1894 → 1780·
//   french-congo 1882 → 1849. 항목 from보다 앞 버전은 생성기가 받지 않으므로 from을 먼저 고친 뒤 own 줄. 짝 항목 파일 밖 id도 주인으로 쓸 수 있다(F2~F6 뼈대 장치 시험 ①).
// 비운 땅이 많다(Q1 (다)·결정 2·Q4·Q6·기본값 9·16·17·23·26·27·28·35·36): 조공만 바친 자기 왕조 왕국·범위가 흐린 나라(세구·마시나·루바·룬다·부뇨로 등)·첫 조약·병합 앞 조각·Q3 셰와 1800~1877·
//   Q6 앙골라 내륙·모잠비크 거점 밖·콩고 분지·코모로·세인트헬레나 SHN 내내. 비운 땅은 own 줄 주인 null만 두지 말고 반드시 칸 <앞머리>_voids에 V(…)(조각 통째)·B(…)(칼선 몫 단위 —
//   fillTables 뒤라야 단위 도형이 있음)로 — 생성기 구멍 메우기가 이웃으로 채우지 않게. 명목 지배(상나일 늪지 230,903 — 기본값 13·라이베리아 내륙 55,727 — 기본값 3·적도주)는 법적 주인 색 + mapNote 한 줄('명목').
// 식민지 항목 색: 새 항목 10(토착 나라·식민지·보호령·보어 공화국)은 본국 색이 아니라 자기 색(뼈대가 같은 해 맞닿는 이웃과 ΔE 26 넘게 — F2~F5 식민지 선례, COMMON P4). 본국은 data/relations.yaml의
//   vassal_of·occupied_by(칸 머리 아래). 같은 땅에서 앞뒤로 이어지는 항목(푼지 → 이집트령 수단 → 마흐디 국가, 나탈리아 → 나탈, 주권령 → 오라녀, 트란스발 ↔ 영국령 트란스발, 로지 ↔ 콜롤로,
//   프랑스령 → 영국령 모리셔스, 카프라리아·그리콸란드 웨스트 → 케이프)은 달라도 된다.
// 토착 나라의 속국·조공 땅(Q1 (다) 섞음): 임명 총독·에미르·세금이 들어간 땅은 그 나라 색, 자기 왕조가 남아 조공만 바친 왕국은 결정 2 목록(과 Q4로 더한 오요·푼지·콜롤로)이면 따로 항목·아니면 비움.
// 소코토(Q2 (B′)): sokoto-caliphate 1809~1884 핵심 346,017 + 에미르국 297,159(누페·일로린 NG-NI·NG-KW, 아다마와 동쪽 CM-AD·CM-NO, 타라바 NG-TA — 합 643,560, 일로린은 1823부터 — M-F6-6, 타라바는 1817·누페는 1835부터 — 창구 ③ Q-E2)를 칠하고,
//   F5가 아무 항목도 칠하지 않은 해만 소코토로 채운다(누페·일로린·타라바 1885, 아다마와 동쪽 1885~1893). 그 F5 줄은 GN-6 칸 예외 하나 — partition.mjs CE-N-5 블록 CEN_NIGER·CEN_NGTA·CEN_CM_NORTH own 줄과
//   CEN_voids만(왕립 니제르 회사·독일령 카메룬·북나이지리아 해·주인은 바이트 그대로). 그 밖의 칸은 앞 시대 파일(F1~F5 시대 파일·칼선 파일) 코드를 고치지 않는다.
// 이집트령 수단(결정 1·기본값 10~13): egyptian-sudan 여섯 단계 1821 1,103,322 · 1840 +84,820 · 1861 +76,624 · 1865 +225,436 · 1870 +428,247 · 1874 +645,776 = 2,564,225, vassal_of muhammad-ali-egypt 1821~1884.
//   마흐디 봉기 1881~1884는 칠하지 않고 법적 주인 색(글) — 서아시아 muhammad-ali-egypt·ottoman 블록을 늘리거나 땅을 비우지 않는다. 푼지 1800~1820·코르도판 1800~1820 다르푸르 색(기본값 15).
// 에티오피아(Q3 (D)·M-F6-2): ethiopia 1800~1884 티그라이·암하라 206,867 + 에리트레아 고원 ER-AN·ER-MA 11,184(아스마라 중부·남부주 — 조각 파일 이름표 기준), 셰와·오로미아 북쪽 255,551(ET-OR 보라나 칼선 위 + ET-AA·ET-HA)은 1878부터(요하네스 4세에게 복속).
//   1800~1854 자메네 메사펀트는 글. 셰와 1879~1886 정복지를 일찍 칠하는 몫은 알려진 근사.
// 메리나(Q1 표): merina-kingdom 세 단계 — 핵심 1800~ 58,702 → 1817 베칠레오·동해안(232,797) → 1824 서해안·북부·남동(465,630, ※ — EI-6이 사료로), 남서 셋 비움 내내(기본값 28).
// 같은 id 빈 기간 넷: lozi-kingdom 1800~1844·1864~(한 파일 안 — 1845~1863 콜롤로), south-african-republic 1852~1876·1881~(한 파일 안 — 1877~1880 영국령 트란스발),
//   darfur F6 1800~1873·F5 1898~(시대 파일 사이 — 이집트령 수단·마흐디 국가), swaziland-protectorate F6 ~1884·F5 1894~(시대 파일 사이 — 1885~1893 F5 비움, 기본값 44). fillTables·joinEras가 받는다(F6 뼈대 장치 시험 ②).
// 칸 사이 id 참조 하나(주인 id는 어느 칸 것이든 쓸 수 있고 블록 글·관계·허용 열쇠는 굵은 칸 하나 — COMMON 4절 '칸을 넘는 항목'): kanem-bornu(GN-6 블록 — H-6이 차드 TD-LC 1800~1884를 칠함).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f6.mjs F6_*_IDS — F5 열 칸과 다른 일곱 칸 WA-6·GN-6·H-6·S1A-6·S1B-6·S2-6·EI-6)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F6 <칸> 머리)과
//   그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GN_·H_·S1A_·S1B_·S2_·EI_(칸 id의 '-6'과 하이픈은 JS 이름이 못 됨 — 특별 지시 9,
//   F5 partition.mjs의 같은 앞머리와는 파일이 달라 겹치지 않음), import도 별칭, ownSplit 묶음 이름도 앞머리(예: 'H_ETOR'). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은
//   고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f6.mjs에 칸 머리 일곱이 있다. 새 칼선 넷~다섯 — S1A-6 케이프 1800 경계(S1A_CUT_CAPE1800, 1800~1821)·1822 경계(S1A_CUT_CAPE1822 — 따로 그을 때만)·카프라리아(S1A_CUT_KAFFRARIA, 1847~1865)·
//   케이강 동쪽(S1A_CUT_KEI, 1866~1876)·그리콸란드 웨스트(S1A_CUT_GRIQUALAND_W, 1871~1879), 후보 S2-6 모잠비크 거점 지대(S2_CUT_MOZ — Q6 조건일 때만).
//   칸은 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <앞머리>_CUT_… } from './cuts-f6.mjs'로 가져온다.
//   재사용 일곱(좌표를 베끼지 않음 — 자기 앞머리 별칭, F6 뼈대 장치 시험 ⑤): GN-6 import { GW_CUT_TOGOLAND as GN_CUT_TOGOLAND } from './cuts-f3.mjs' ·
//   H-6 import { H_CUT_BORANA } from './cuts-f5.mjs'·import { H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs' ·
//   S1B-6 import { S1A_CUT_ZULU as S1B_CUT_ZULU, S1A_CUT_VRYHEID as S1B_CUT_VRYHEID, S1A_CUT_BB_TVL as S1B_CUT_BB_TVL } from './cuts-f5.mjs' · (쓸 때만) S1A-6 import { S1A_CUT_BB_CAPE } from './cuts-f5.mjs'.
//   칼선 파일은 시대 파일을 가져오지 않으므로 순환이 없다(시대 파일끼리는 가져오지 않음).
// 칸 조각 목록: 칸 머리 안의 import { F6_<칸>_IDS } from './cuts-f6.mjs'는 칸 안 확인용(나라별 묶음 합 = 칸 몫)으로만 쓰고, 나라별 묶음은 칸 안에서 idsOf('<adm0>')·minus(idsOf('ETH'), …) 꼴로 다시 적는다.
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F6_START·F6_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인 — 뼈대가 박은 값: S1A_BOUNDS 1822·1847·1866·1871·1877·1880).
//   재사용 칼선(토골란드·보라나·K3·K4·줄루란드·빌크레이·BB–트란스발)은 F6 내내 같은 나눔(기본 기간)이고 주인만 해마다 바뀌어 BOUNDS가 필요 없다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F6_START(1800)부터, 해는 늘어나고 F6_END(1885) 전이다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(EI_MDG_EAST, [[F6_START, null], [1817, 'merina-kingdom']]) + EI_voids에 V(F6_START, 1817, ...EI_MDG_EAST).
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄)과 해가 같아야 한다. 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
// 늘림 나라: 앞 권역 나라(uk·france·portugal·spain·batavian-republic·muhammad-ali-egypt·ottoman·busaid-oman 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이 단계에 늘림은 없다
//   (창구 ② 자동 승인 0건 — 오만 → 잔지바르 섬 1800~1855 늘리지 않음 기본값 34, 바타비아 공화국은 케이프에 관계만 기본값 42), 서아시아 이집트·오스만·오만 쪽 블록과 유럽 본국 블록은 바이트 그대로.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1~F5 공통·칸 머리·F6 공통·F6 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('prepartition');

const F6_START = 1800; // 이 시대 파일의 첫 해(1800년 말 모습). 그 앞(−2332~1799)은 F7 시대 파일 precolonial.mjs 몫(그 파일의 F7_END와 F6_START가 같은지 그 파일이 확인)
const F6_END = 1885; // 마지막 표의 끝(미포함) = 뒤 시대 파일 partition.mjs의 F5_START(1885)
const F5_START = 1885; // partition.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F6_END !== F5_START) throw new Error(`sub-saharan-africa prepartition: F6_END ${F6_END}가 F5 첫 해 ${F5_START}와 다름(1884/1885 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F5 partition.mjs와 같은 꼴 — F6 뼈대가 옮김, table.mjs·partition.mjs·colonial.mjs·postwar.mjs·decolonization.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <앞머리>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F6_START || e[0] >= F6_END)) {
    throw new Error(`sub-saharan-africa prepartition: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F6_START} 이상 ${F6_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa prepartition: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F6_START, to = F6_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa prepartition: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa prepartition: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa prepartition: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa prepartition: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa prepartition: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F6 WA-6 서아프리카 대서양 쪽·서사헬 (최상위 이름 WA_) ──
// 조각 F6_WA_IDS(라이베리아 15·시에라리온 4·감비아 6·기니비사우 9·카보베르데 21·세네갈 14·기니 34·모리타니 13·말리 9 = 125), 구현 F6-WA-6
// 새 항목 0. 앞 잇는 항목 9: F5 tukulor-empire(1855 ML-1 → 1861 + ML-2·ML-4·ML-BKO → 1862 + ML-5 = 361,074 — 기본값 2)·fouta-djallon(1800~ F5 모양) · F3 french-senegal(1855~ SN-SL·SN-DK 19,721 — 기본값 4)·
//   french-guinea(1882~ 해안 — 기본값 5) · F2 british-sierra-leone(1808~)·british-gambia(1821~)·portuguese-guinea(1879~)·portuguese-cape-verde(1800~) · F1 liberia(1847~ 전국 95,881 — 내륙은 명목, 기본값 3)
// 점프(P1): 1808 시에라리온 · 1821 감비아 · 1847 라이베리아 · 1855 투쿨로르·세네갈 · 1861 투쿨로르 세구 · 1862 마시나 땅 · 1879 포르투갈령 기니 · 1882 프랑스령 기니. 1884→1885 점프 ㉠ 프랑스령 세네갈 +178,501
// 비움: Q1 (다) 첫 조약 앞 조각·세네갈 나머지 12(1800~1884)·딩기라예 GN-DI(기본값 9)·세구·마시나 등 범위 흐린 나라(Q4)·1만 km² 미만 거점(기본값 7). 칼선 0
import { F6_WA_IDS } from './cuts-f6.mjs';
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라 안 묶음(조사 a 3절·a-area.log 묶음 그대로 — 넓이는 조각 육지 넓이, F5 WA-5 묶음과 같은 id)
const WA_SEN_COL = ['SN-SL', 'SN-DK']; // 생루이·다카르 19,721 — 와알로 병합 1855(페데르브 총독 1854-12~, 1857 다카르)
const WA_SEN_REST = minus(idsOf('SEN'), ...WA_SEN_COL); // 세네갈 나머지 12 — 카요르·졸로프·바올·신·살룸·푸타토로(F5 1885 프랑스령 세네갈 +178,501 — P1 ㉠)
const WA_SLE_COL = ['SL-W']; // 프리타운 반도 식민지 664 — 1808-01-01 왕령 식민지
const WA_SLE_PROT = minus(idsOf('SLE'), ...WA_SLE_COL); // 시에라리온 내륙 3조각 71,292 — 1896 보호령(F5)
const WA_GIN_COAST = ['GN-BF', 'GN-BK', 'GN-C', 'GN-CO', 'GN-DU', 'GN-FO', 'GN-FR', 'GN-GU', 'GN-KD', 'GN-KS', 'GN-LO', 'GN-MC', 'GN-NZ', 'GN-YO']; // 해안·숲 14 69,502 — 리비에르뒤쉬드 1882(숲 여섯 33,616은 근사 — M-F6-14)
const WA_GIN_HAUTE = ['GN-K', 'GN-KO', 'GN-SI', 'GN-MD', 'GN-KE', 'GN-BE', 'GN-DB', 'GN-DI', 'GN-FA']; // 고지 기니 9 113,265 — 와술루·사모리·딩기라예(비움 — 기본값 9·Q4)
const WA_GIN_FOUTA = minus(idsOf('GIN'), ...WA_GIN_COAST, ...WA_GIN_HAUTE); // 푸타잘롱 11 62,845 — 1800부터 F5 모양(기본값 6)
const WA_ML_KAARTA = ['ML-1']; // 카예 123,830 — 니오로·카르타 1855-04(조각 통째 — 근사, 기본값 2)
const WA_ML_SEGOU = ['ML-2', 'ML-4', 'ML-BKO']; // 쿨리코로·세구·바마코 154,297 — 세구 1861-03-10
const WA_ML_MASINA = ['ML-5']; // 모프티 82,560 — 함달라히 1862-05
const WA_ML_REST = ['ML-3', 'ML-6', 'ML-7', 'ML-8']; // 시카소·팀북투·가오·키달 — 케네두구·투아레그 땅(비움 — 기본값 9)
// 그해 말 주인 줄(Q1 (다) — 조각마다 첫 조약·식민지·정복 해, 그 앞은 비움)
const WA_OWN = [
  [WA_SEN_COL, [[F6_START, null], [1855, 'french-senegal']]], // 와알로 병합 1855(생루이·고레 거점은 1만 밑 — 기본값 4·7)
  [WA_SEN_REST, [[F6_START, null]]], // 월로프 왕국들·푸타토로 내내 비움(기본값 9)
  [idsOf('GMB'), [[F6_START, null], [1821, 'british-gambia']]], // 1816 배서스트, 1821 시에라리온 아래 식민지(전국 모양 근사 — 기본값 5)
  [idsOf('GNB'), [[F6_START, null], [1879, 'portuguese-guinea']]], // 1879 카보베르데에서 따로 식민지(그 앞 거점 6,175는 1만 밑 — 기본값 5)
  [idsOf('CPV'), [[F6_START, 'portuguese-cape-verde']]], // 1800부터 F5 모양(기본값 6)
  [idsOf('LBR'), [[F6_START, null], [1847, 'liberia']]], // 1847-07-26 독립(내륙은 명목 — 기본값 3, 메릴랜드 1834~1857 2,343은 1만 밑)
  [WA_SLE_COL, [[F6_START, null], [1808, 'british-sierra-leone']]], // 1808-01-01 왕령 식민지
  [WA_SLE_PROT, [[F6_START, null]]], // 내륙 내내 비움(1896 보호령 — F5)
  [WA_GIN_COAST, [[F6_START, null], [1882, 'french-guinea']]], // 리비에르뒤쉬드 1882
  [WA_GIN_FOUTA, [[F6_START, 'fouta-djallon']]], // 알파야·소리야 번갈아는 글(기본값 6)
  [WA_GIN_HAUTE, [[F6_START, null]]], // 내내 비움(F5 1885도 비움 — 1891 프랑스령 수단)
  [WA_ML_KAARTA, [[F6_START, null], [1855, 'tukulor-empire']]], // 니오로 1855-04
  [WA_ML_SEGOU, [[F6_START, null], [1861, 'tukulor-empire']]], // 세구 1861-03-10(세구 밤바라 왕국은 비움 — Q4)
  [WA_ML_MASINA, [[F6_START, null], [1862, 'tukulor-empire']]], // 함달라히 1862-05(마시나 제국은 비움 — Q4)
  [WA_ML_REST, [[F6_START, null]]], // 내내 비움(F5 1885도 비움)
  [idsOf('MRT'), [[F6_START, null]]], // 트라르자·브라크나 에미르국 내내 비움(F5 1885도 비움)
];
const WA_IDS = WA_OWN.flatMap(([ids]) => ids);
// 칸 안 확인: 묶음을 합치면 F6_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음 — 합 125)
if (WA_IDS.length !== F6_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F6_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa prepartition: WA-6 칸 묶음 조각 ${WA_IDS.length}개가 F6_WA_IDS ${F6_WA_IDS.length}개와 다름`);
}
for (const [ids, line] of WA_OWN) own(ids, line);
// 일부러 비운 땅(주인 null과 같은 해 — 생성기 구멍 메우기가 이웃으로 채우지 않게)
const WA_voids = () => [
  V(F6_START, 1855, ...WA_SEN_COL), // 생루이·다카르 — 와알로 병합 앞(거점은 1만 밑 — 기본값 4)
  V(F6_START, F6_END, ...WA_SEN_REST), // 세네갈 나머지 — 월로프 왕국들·푸타토로(기본값 9)
  V(F6_START, 1821, ...idsOf('GMB')), // 감비아 — 식민지 앞(배서스트 1816은 1만 밑)
  V(F6_START, 1879, ...idsOf('GNB')), // 기니비사우 — 카보베르데에서 따로 식민지가 되기 앞(거점 1만 밑)
  V(F6_START, 1847, ...idsOf('LBR')), // 라이베리아 — 독립 앞(1822 정착지는 1만 밑)
  V(F6_START, 1808, ...WA_SLE_COL), // 프리타운 반도 — 왕령 식민지 앞
  V(F6_START, F6_END, ...WA_SLE_PROT), // 시에라리온 내륙 — 보호령 선언 앞(Q1 (다))
  V(F6_START, 1882, ...WA_GIN_COAST), // 기니 해안·숲 — 리비에르뒤쉬드 앞
  V(F6_START, F6_END, ...WA_GIN_HAUTE), // 고지 기니 — 와술루·사모리·딩기라예(범위 흐림 — 기본값 9·Q4)
  V(F6_START, 1855, ...WA_ML_KAARTA), // 카르타 — 투쿨로르 정복 앞(Q4)
  V(F6_START, 1861, ...WA_ML_SEGOU), // 세구 밤바라 왕국 — 투쿨로르 정복 앞(Q4)
  V(F6_START, 1862, ...WA_ML_MASINA), // 마시나 제국 — 투쿨로르 정복 앞(Q4)
  V(F6_START, F6_END, ...WA_ML_REST), // 케네두구·팀북투·가오·키달(기본값 9)
  V(F6_START, F6_END, ...idsOf('MRT')), // 모리타니 — 무어인 에미르국들(F5 기본값 13)
];
// ── F6 WA-6 끝 ──

// ── F6 GN-6 기니만·나이지리아·카메룬·보르누 (최상위 이름 GN_) ──
// 조각 F6_GN_IDS(코트디부아르 19·가나 10·토고 5·베냉 12·부르키나파소 45·니제르 8·나이지리아 37·카메룬 10·적도 기니 6·상투메 프린시페 2 = 154), 구현 F6-GN-6
// 새 항목 1: oyo-empire(1800~1835 요루바 5 NG-OG·NG-OY·NG-OS·NG-ON·NG-EK 73,215 + 1800~1816 일로린 NG-KW 35,933 = 109,148 — Q4·M-F6-6)
// 앞 잇는 항목 9: F5 asante·dahomey·benin-kingdom(1800~ F5 모양 — 기본값 6)·sokoto-caliphate(1809~ — Q2 (B′), 타라바 1817~·일로린 1823~·누페 1835~ — 창구 ③ Q-E2, 1835~ 643,560)·lagos-colony(1861~)·kanem-bornu(1800~1884 175,196 — 기본값 16) ·
//   F3 british-gold-coast(1874~ — 기본값 5) · F2 spanish-guinea(1843~ 비오코)·portuguese-sao-tome(1800~)
// 점프(P1): 1809 소코토 · 1817 오요 일로린 빠짐·타라바 → 소코토 · 1823 일로린 → 소코토 · 1835 누페 → 소코토 · 1836 오요 끝 · 1843 비오코 · 1861 라고스 · 1874 골드코스트. 1884→1885 점프 ㉡ 독일령 토고·카메룬 서남·오일 리버스(기본값 8)·㉢ 리오무니
// 칸 예외(이 칸 하나): F5 partition.mjs CE-N-5 블록 소코토 에미르국 줄(CEN_NIGER·CEN_NGTA·CEN_CM_NORTH own 줄·CEN_voids — Q2 (B′) 1885 누페·일로린·타라바, 1885~1893 아다마와 동쪽)
// 칼선: 재사용 GN_CUT_TOGOLAND(import { GW_CUT_TOGOLAND as GN_CUT_TOGOLAND } from './cuts-f3.mjs' — 1874~ 골드코스트 볼타남은 칼선 밖, 칼선 안 토고 몫은 비움, F6 내내 같은 나눔·기본 기간).
//   F5 GW-5 GW_GHA의 '볼타남' 상자 bx(-1.5, 4.5, 2, 7)는 칼선이 아니라 상자라 같은 값을 이 칸 안에 다시 씀(F5 1885 모양과 같게)
// 블록 소유: kanem-bornu(H-6은 차드 TD-LC own 줄만 — 칸 사이 id 참조). 비움: Q1 (다) 조공국·아샨티 북부 조공국·모시·니제르 대부분·기본값 5·7·8
import { F6_GN_IDS } from './cuts-f6.mjs';
import { GW_CUT_TOGOLAND as GN_CUT_TOGOLAND } from './cuts-f3.mjs';
import { P as GN_P, bx as GN_bx } from '../../lib.mjs';
const GN_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F6_GN_IDS 154). F6 내내 조각마다 한 주인이라 북카메룬 띠로 NG-AD·NG-TA·NG-BO를 나누지 않음(F5 1885 띠·본토 주인이 같음)
const GN_HAUSA = ['NG-SO', 'NG-KE', 'NG-ZA', 'NG-KT', 'NG-KN', 'NG-JI', 'NG-KD', 'NG-BA', 'NG-GO', 'NG-PL', 'NG-AD']; // 하우사 핵심 10 + 아다마와 서쪽 NG-AD(346,068) — 소코토 칼리프국 직할·임명 에미르
const GN_NUPE = ['NG-NI']; // 누페 에미르국 70,931 — 1835~ 소코토(창구 ③ Q-E2)
const GN_TARABA = ['NG-TA']; // 타라바(무리·아다마와 남) 60,893 — 1817~ 소코토(창구 ③ Q-E2)
const GN_ADAMAWA_E = ['CM-AD', 'CM-NO']; // 아다마와 동쪽 129,404 — Q2 (B′) 1809~
const GN_EMIRATES = [...GN_NUPE, ...GN_TARABA, ...GN_ADAMAWA_E]; // 에미르국 넷(묶음 합 확인용)
const GN_ILORIN = ['NG-KW']; // 일로린 35,933 — 1800~1816 오요 제국, 1817~1822 비움(아폰자 반란), 1823~ 소코토(M-F6-6 ㉮)
const GN_NIGER = ['NG-KO', 'NG-NA', 'NG-FC', 'NG-BE']; // 니제르·베누에 넷(코기·나사라와·연방 수도·베누에) — 에미르국 밖, 내내 비움(장부 후보)
const GN_YORUBA = ['NG-OG', 'NG-OY', 'NG-OS', 'NG-ON', 'NG-EK']; // 요루바 5(73,215) — 오요 제국 1800~1835
const GN_OILRIVERS = ['NG-AB', 'NG-AK', 'NG-AN', 'NG-BY', 'NG-CR', 'NG-DE', 'NG-EB', 'NG-EN', 'NG-IM', 'NG-RI']; // 오일 리버스 10(91,302) — 1885 F5 점프 ㉡(기본값 8)
const GN_BORNU = ['NG-BO', 'NG-YO', 'CM-EN']; // 보르누·요베·디크와(약 152,800 — 차드 TD-LC는 H-6 own 줄)
const GN_CM_SW = ['CM-LT', 'CM-SW', 'CM-SU', 'CM-CE', 'CM-OU', 'CM-NW']; // 카메룬 서남 6(193,297) — 1885 F5 점프 ㉡
const GN_GHA_SPLIT = ['GH-TV', 'GH-NP', 'GH-UE']; // 토골란드 칼선이 지나는 가나 조각 셋(F5 GW_GHA와 같은 나눔)
const GN_GHA_SOUTH = ['GH-WP', 'GH-CP', 'GH-EP', 'GH-AA']; // 가나 남 4(57,849) — 1874 골드코스트 식민지
const GN_GHA_ASANTE = ['GH-AH', 'GH-BA']; // 아샨티 2(65,112)
const GN_BEN_S = ['BJ-AQ', 'BJ-KO', 'BJ-LI', 'BJ-MO', 'BJ-OU', 'BJ-PL', 'BJ-ZO']; // 베냉 남 7(17,295) — 다호메이 왕국
const GN_BEN_N = minus(idsOf('BEN'), ...GN_BEN_S); // 베냉 북 5(99,507) — 보르구·아타코라
const GN_BIOKO = ['GQ-BN', 'GQ-BS']; // 비오코(1,950) — 1843 스페인 깃발(산타이사벨)
const GN_GNQ_REST = minus(idsOf('GNQ'), ...GN_BIOKO); // 리오무니·아노본(24,803) — 1885 F5 점프 ㉢
const GN_EMPTY = [...['GH-UW'], ...idsOf('TGO'), ...GN_BEN_N, ...idsOf('CIV'), ...idsOf('BFA'), ...idsOf('NER')]; // 다곰바·모시·콩·구르마·보르구·니제르 — 내내 비움(기본값 9 잣대)
{
  const all = [GN_HAUSA, GN_EMIRATES, GN_ILORIN, GN_NIGER, GN_YORUBA, ['NG-ED'], ['NG-LA'], GN_OILRIVERS, GN_BORNU, GN_CM_SW, ['CM-ES'], GN_GHA_SPLIT, GN_GHA_SOUTH, GN_GHA_ASANTE, GN_BEN_S, GN_BIOKO, GN_GNQ_REST, idsOf('STP'), GN_EMPTY].flat();
  if (all.length !== F6_GN_IDS.length || new Set(all).size !== all.length || all.some((id) => !F6_GN_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa prepartition: GN-6 묶음 합 ${all.length}개가 F6_GN_IDS ${F6_GN_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1884 말 = F5 1885 모양(Q2 (B′)로 고친 CE-N-5·GW-5 줄 — 오일 리버스·카메룬 서남·토고 몫·리오무니만 1885 점프 ㉡㉢)
// 소코토 칼리프국: 1804-02-21 지하드, 1808-10 알칼라와 함락, 1809 소코토 건설(위키 en Sokoto_Caliphate — 기본값 1), 아다마와는 1809-03 모디보 아다마가 깃발을 받음(위키 en Adamawa_Emirate)
own(GN_HAUSA, [[F6_START, null], [1809, 'sokoto-caliphate']]);
// 에미르국(창구 ③ Q-E2, 2026-11-13): 아다마와 동쪽은 1809, 타라바는 1817 무리 에미르국 성립(함만 루와 — 위키 en Muri,_Nigeria),
//   누페는 1835 첫 에미르 우스만 자키(브리태니커 Bida). 1810년대 말람 덴도의 진출과 1830년 무렵 실권은 글.
own(GN_ADAMAWA_E, [[F6_START, null], [1809, 'sokoto-caliphate']]);
own(GN_TARABA, [[F6_START, null], [1817, 'sokoto-caliphate']]);
own(GN_NUPE, [[F6_START, null], [1835, 'sokoto-caliphate']]);
// 오요 제국: 1817 아폰자의 일로린 이탈, 1823 일로린 소코토 편입, 1835 오요일레 파괴·정보 상자 끝 c.1836(위키 en Oyo_Empire — M-F6-6 ㉮)
own(GN_ILORIN, [[F6_START, 'oyo-empire'], [1817, null], [1823, 'sokoto-caliphate']]);
own(GN_YORUBA, [[F6_START, 'oyo-empire'], [1836, null]]); // 1836~ 이바단·아베오쿠타 등 요루바 소국(범위 흐림 — Q4 잣대로 비움)
own(GN_NIGER, [[F6_START, null]]);
own(['NG-ED'], [[F6_START, 'benin-kingdom']]); // 베닌시티 — F5 1885 모양 그대로(기본값 6)
own(['NG-LA'], [[F6_START, null], [1861, 'lagos-colony']]); // 1851 영국 포격, 1861-08-06 할양 조약(1만 밑이나 F5 항목 — 기본값 7)
own(GN_OILRIVERS, [[F6_START, null]]); // 1884 보호 조약은 새 버전 없음(기본값 8)
own(GN_BORNU, [[F6_START, 'kanem-bornu']]); // 1808 풀라니 침공·1814 알카네미 쿠카와·1846 사이파와 왕조 끝은 글(기본값 16)
own(GN_CM_SW, [[F6_START, null]]); // 1884 두알라 보호 조약은 새 버전 없음(기본값 8)
own(['CM-ES'], [[F6_START, null]]); // 베르투아 쪽 — 1894 협정 앞
const GN_GHA = ownSplit('GN_GHA', GN_GHA_SPLIT, [['토골란드', GN_CUT_TOGOLAND], ['볼타남', GN_P(GN_bx(-1.5, 4.5, 2, 7))]], '북부', {
  토골란드: [[F6_START, null]], // 에웨 땅 — 1884-07-05 독일 보호 조약은 새 버전 없음(기본값 8)
  볼타남: [[F6_START, null], [1874, 'british-gold-coast']], // 안로·케타 해안(1874-07-24 골드코스트 식민지)
  북부: [[F6_START, null]], // 다곰바·맘프루시·곤자(기본값 9 — 범위 흐림)
});
own(GN_GHA_SOUTH, [[F6_START, null], [1874, 'british-gold-coast']]); // 1874-07-24 골드코스트 직할 식민지(1844 판테 보호 조약·1850 덴마크·1872 네덜란드 요새 인수는 글)
own(GN_GHA_ASANTE, [[F6_START, 'asante']]); // 쿠마시 — 북 조공국·판테 해안은 비움(Q1 (다))
own(GN_BEN_S, [[F6_START, 'dahomey']]); // 아보메 — 오요 조공 끝(1823 무렵)은 글
own(GN_BIOKO, [[F6_START, null], [1843, 'spanish-guinea']]); // 1827~1843 영국 기지 임대, 1843 레레나가 산타이사벨에 스페인 깃발
own(GN_GNQ_REST, [[F6_START, null]]); // 리오무니·아노본 — 1885 F5 점프 ㉢
own(idsOf('STP'), [[F6_START, 'portuguese-sao-tome']]);
own(GN_EMPTY, [[F6_START, null]]);
// 일부러 비운 땅(주인 null과 같은 해 — 생성기 구멍 메우기가 이웃으로 채우지 않게)
const GN_voids = () => [
  V(F6_START, 1809, ...GN_HAUSA, ...GN_ADAMAWA_E), // 하우사 왕국들·아다마와 동쪽 — 1809 소코토 앞(1804 지하드·1808 알칼라와는 글, 기본값 1)
  V(F6_START, 1817, ...GN_TARABA), // 타라바 — 1817 무리 에미르국 앞(주쿤 우카리 왕국·추장 땅)
  V(F6_START, 1835, ...GN_NUPE), // 누페 — 1835 첫 에미르 앞(누페 왕국 내전, 말람 덴도의 진출은 글)
  V(1817, 1823, ...GN_ILORIN), // 일로린 — 1817 아폰자 반란 뒤 오요에서 떨어지고 1823 풀라니 에미르국 앞(M-F6-6 ㉮)
  V(F6_START, F6_END, ...GN_NIGER), // 니제르·베누에 넷 — 에미르국 밖 이갈라·티브·이도마 등(범위 흐림)
  V(1836, F6_END, ...GN_YORUBA), // 요루바 땅 — 오요 제국 끝 뒤 이바단·아베오쿠타·이제샤 등 소국(Q4 잣대)
  V(F6_START, 1861, 'NG-LA'), // 라고스 — 1861 할양 앞(라고스 왕국 1만 밑)
  V(F6_START, F6_END, ...GN_OILRIVERS, ...GN_CM_SW, 'CM-ES'), // 니제르 삼각주 도시국가·이그보·두알라·바뭄 등 — 보호 조약 앞(기본값 8)
  V(F6_START, 1874, ...GN_GHA_SOUTH), B(F6_START, 1874, GN_GHA['볼타남']), // 판테·가·안로 해안 — 골드코스트 식민지 앞(요새 거점 1만 밑 — 기본값 7)
  B(F6_START, F6_END, GN_GHA['토골란드'], GN_GHA['북부']), // 에웨 땅·다곰바·맘프루시(기본값 8·9)
  V(F6_START, F6_END, ...GN_EMPTY), // 어퍼웨스트·토고·베냉 북·코트디부아르·부르키나파소·니제르 — 모시·콩·구르마·보르구·다마가람 등(기본값 9, 그랑바삼·아시니·포르토노보 거점 1만 밑)
  V(F6_START, 1843, ...GN_BIOKO), // 비오코 — 스페인 깃발 앞(영국 기지 임대 1827~1843)
  V(F6_START, F6_END, ...GN_GNQ_REST), // 리오무니·아노본 — 1885 F5부터
];
// ── F6 GN-6 끝 ──

// ── F6 H-6 수단·에티오피아·뿔·차드·적도 아프리카 (최상위 이름 H_) ──
// 조각 F6_H_IDS(수단 17·남수단 10·에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·차드 22·중앙아프리카 17·가봉 9·콩고 공화국 12 = 124), 구현 F6-H-6
// 새 항목 2: egyptian-sudan(1821~1884 여덟 단계 — 1821·1840·1861·1865·1870·1872·1873·1874, 1874 29조각(가시바르카 뺌) 약 2,569,000 — 기본값 10~13, vassal_of muhammad-ali-egypt)·funj-sultanate(1800~1820 SD-GZ·SD-SI 61,662 — Q4)
// 앞 잇는 항목 8: F5 french-congo(from 1849 — 1849~1881 가봉 해안 GA-1·GA-8 48,335, 1882~ 608,967, 기본값 20) · F4 darfur(1800~1873 — 1800~1820 코르도판 포함, 기본값 15)·majeerteen-sultanate(1800~ K3 칼선 몫)·
//   sultanate-of-hobyo(1878~ K3·K4 칼선 몫)·wadai(1800~1884 124,146 — 기본값 16) · F3 british-somaliland(1884) · F1 ethiopia(Q3 (D)·M-F6-2 — 1800~ 티그라이·암하라·에리트레아 고원, 1878~ 셰와)·djibouti(1884 — 기본값 18)
// 점프(P1): 1821 이집트령 수단·푼지 끝·코르도판 · 1840 카살라(가시바르카는 비움) · 1849 가봉 해안 · 1861 상나일 · 1865 홍해·에리트레아 해안 · 1870 적도주·상나일 늪지 · 1872 에리트레아 안세바(케렌) · 1873 바르엘가잘 · 1874 다르푸르 · 1878 셰와·호비오 ·
//   1882 프랑스령 콩고 · 1884 영국령 소말릴란드·지부티. 1884→1885 점프 ㉤ 이집트령 수단 → 마흐디 국가(같은 조각 색만 — 적도주·에리트레아 북홍해 ER-DU·안세바 ER-SK는 1885 비움)·㉥ 에리트레아 고원 ER-AN·ER-MA −11,184(M-F6-2 — 조각 이름표가 실제 주와 어긋나 땅 이름대로 고름, 결과 노트 6절)
// 칼선: 재사용 셋(import { H_CUT_BORANA } from './cuts-f5.mjs' — 1878~ 셰와·오로미아 북쪽 = 칼선 위, 아래 몫은 비움 · import { H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs' —
//   K3 1800~ 마제르테인 몫·1878~ 호비오 몫, K4 1878~ 호비오 몫·베나디르 몫 비움). F6 내내 같은 나눔(기본 기간)
// 칸 사이 id 참조(own 줄만): kanem-bornu(GN-6 블록 — 차드 TD-LC 1800~1884 20,463)
// 비운 땅: 바기르미·TD-KA(기본값 16)·쉴루크·아잔데·기베 오로모·카파·하라르·아우사·게레디·이사크·사누시(기본값 17)·셰와 1800~1877(Q3)·중앙아프리카·콩고 분지(기본값 23)·연안 항구 1만 미만(기본값 19)
import { F6_H_IDS } from './cuts-f6.mjs';
import { H_CUT_BORANA } from './cuts-f5.mjs';
import { H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs';
const H_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 사료(※ 연도 — 결과 노트 2절): 센나르 항복 1821-06-14·코르도판 1821·카살라·타카 1840·1865 오스만이 홍해 연안을 넘김·1874 가을 마나와시로 다르푸르(위키 en Turco-Egyptian Sudan·Funj Sultanate·Darfur Sultanate),
//   마사와 1865(en History of Eritrea)·케렌 수비대 1872(en Ethiopian–Egyptian War), 적도주 1870 베이커(en Equatoria), 바르엘가잘은 1873 이스마일이 주바이르를 총독으로 인정(en Al-Zubayr Rahma Mansur — 조사 '기억' 1874를 1873으로 닫음),
//   가시바르카 ER-GB는 이집트 지배 해를 주는 문서를 못 찾아 기본값 12대로 비움(알려진 근사), 셰와 1878-03-20 와다라(en Menelik II — Q3), 리브르빌 1849·1882-11-30 프랑스령 콩고(기본값 20)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F6_H_IDS 124)
const H_SNO = ['SD-NO', 'SD-NR', 'SD-KH', 'SD-NB', 'SD-NW', 'SD-GD']; // 북부·나일강·하르툼·청나일·백나일·게다레프 — 1821 이집트령(게다레프는 센나르 주로 봄)
const H_FUNJ = ['SD-GZ', 'SD-SI']; // 게지라·센나르 61,662 — 1800~1820 푼지 술탄국(Q4)
const H_SKO = ['SD-KN', 'SD-KS']; // 코르도판 385,630 — 1800~1820 다르푸르(기본값 15)
const H_SKA = ['SD-KA']; // 카살라 50,941 — 1840 타카
const H_EGB = ['ER-GB']; // 가시바르카 33,879 — 이집트 지배 해를 못 닫아 비움(기본값 12)
const H_SNU = ['SS-NU']; // 상나일 76,624 — 1861 쉴루크 정복
const H_SRS = ['SD-RS', 'ER-DU']; // 홍해 202,928·에리트레아 북홍해 33,411(마사와·나크파 — 조각 이름표 ER-DU가 실제로는 북홍해주) — 1865 오스만이 넘김(마사와·수아킨)
const H_ESK = ['ER-SK']; // 에리트레아 안세바 22,509(케렌·보고스 — 조각 이름표 ER-SK가 실제로는 안세바주) — 1872 이집트 케렌 수비대
const H_SEQ = ['SS-EC', 'SS-EE', 'SS-EW', 'SS-JG', 'SS-LK', 'SS-UY', 'SS-WR']; // 적도주 197,344·늪지 안쪽 230,903 — 1870 베이커(늪지 안쪽은 명목, 기본값 13)
const H_SBG = ['SS-BN', 'SS-BW']; // 바르엘가잘 126,168 — 1873 주바이르 총독
const H_DAR = ['SD-DE', 'SD-DN', 'SD-DW', 'SDN-5856', 'SDN-5857']; // 다르푸르 5 519,608 — 1874 이집트령
const H_ETC = ['ET-TI', 'ET-AM', 'ER-AN', 'ER-MA']; // 티그라이·암하라·에리트레아 고원(아스마라 중부주 1,567·남부주 9,617 — 조각 이름표 ER-AN·ER-MA가 실제로는 중부·남부주) — 1800~ 에티오피아(Q3·M-F6-2)
const H_EOR = ['ET-OR']; // 오로미아 — 보라나 칼선 위는 1878 셰와, 아래는 내내 비움
const H_EAA = ['ET-AA', 'ET-HA']; // 아디스아바바·하라리 918 — 1878 셰와(칼선 위와 함께)
const H_EREST = ['ET-SO', 'ET-SN', 'ET-AF', 'ET-GA', 'ET-DD', 'ET-BE', 'ER-DK']; // 아우사·하라르·카파·기베·아파르 기슭 등 — 내내 비움(기본값 17·19)
const H_DJI = idsOf('DJI'); // 6 — 1884 지부티(기본값 18)
const H_SOL = idsOf('SOL'); // 1 — 1884 영국령 소말릴란드(기본값 18)
const H_MAJ = ['SO-BR', 'SO-NU']; // 마제르테인
const H_MU = ['SO-MU']; // 무둑 — K3
const H_GA = ['SO-GA']; // 갈구두드 — K4
const H_SOM_REST = minus(idsOf('SOM'), ...H_MAJ, ...H_MU, ...H_GA); // 베나디르 여섯·주바 셋 — 내내 비움(잔지바르 명목 거점 1만 밑)
const H_WADAI = ['TD-OD', 'TD-SI', 'TD-WF']; // 와다이 124,146(기본값 16)
const H_LC = ['TD-LC']; // 차드호 20,463 — 카넴-보르누(칸을 넘는 항목 — GN-6 블록, own 줄만)
const H_TCD_REST = minus(idsOf('TCD'), ...H_WADAI, ...H_LC); // 바기르미 3·카넴·보르쿠·엔네디·티베스티·남·동 = 18 — 내내 비움(기본값 16·17)
const H_CAF = idsOf('CAF'); // 중앙아프리카 17 — 내내 비움
const H_GAB_COAST = ['GA-1', 'GA-8']; // 에스튀에르주·오고웨마리팀주 48,335 — 1849 리브르빌
const H_GAB_COG = [...minus(idsOf('GAB'), ...H_GAB_COAST), ...idsOf('COG')]; // 가봉 나머지 7·콩고 공화국 12 — 1882 프랑스령 콩고
{
  const all = [H_SNO, H_FUNJ, H_SKO, H_SKA, H_EGB, H_SNU, H_SRS, H_ESK, H_SEQ, H_SBG, H_DAR, H_ETC, H_EOR, H_EAA, H_EREST, H_DJI, H_SOL, H_MAJ, H_MU, H_GA, H_SOM_REST, H_WADAI, H_LC, H_TCD_REST, H_CAF, H_GAB_COAST, H_GAB_COG].flat();
  const want = new Set(F6_H_IDS);
  if (H_SOM_REST.length !== 9 || H_TCD_REST.length !== 18 || H_GAB_COG.length !== 19 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa prepartition: H-6 나라별 묶음 합 ${all.length}이 F6_H_IDS ${want.size}와 다름`);
  }
}
// 수단 — 푼지·다르푸르 → 투르코-이집트 수단(기본값 10~13: 1881~1884 마흐디 봉기는 칠하지 않고 법적 주인 색, 1885~는 partition.mjs 마흐디 국가)
own(H_SNO, [[F6_START, null], [1821, 'egyptian-sudan']]);
own(H_FUNJ, [[F6_START, 'funj-sultanate'], [1821, 'egyptian-sudan']]);
own(H_SKO, [[F6_START, 'darfur'], [1821, 'egyptian-sudan']]);
own(H_SKA, [[F6_START, null], [1840, 'egyptian-sudan']]);
own(H_EGB, [[F6_START, null]]);
own(H_SNU, [[F6_START, null], [1861, 'egyptian-sudan']]);
own(H_SRS, [[F6_START, null], [1865, 'egyptian-sudan']]);
own(H_ESK, [[F6_START, null], [1872, 'egyptian-sudan']]); // 1872 베르너 뮌칭거가 보고스(케렌)를 차지해 수비대를 둠
own(H_SEQ, [[F6_START, null], [1870, 'egyptian-sudan']]);
own(H_SBG, [[F6_START, null], [1873, 'egyptian-sudan']]);
own(H_DAR, [[F6_START, 'darfur'], [1874, 'egyptian-sudan']]); // 1874~1897 같은 id 빈 기간(1898~ partition.mjs darfur)
// 에티오피아(Q3 (D)·M-F6-2) — 셰와·오로미아 북쪽은 1878 메넬리크 복속
own(H_ETC, [[F6_START, 'ethiopia']]);
ownSplit('H_EOR', H_EOR, [['남', H_CUT_BORANA]], '북', { 남: [[F6_START, null]], 북: [[F6_START, null], [1878, 'ethiopia']] });
own(H_EAA, [[F6_START, null], [1878, 'ethiopia']]);
own(H_EREST, [[F6_START, null]]);
// 지부티·소말릴란드·소말리아(K3·K4는 F6 내내 같은 나눔 — 기본 기간)
own(H_DJI, [[F6_START, null], [1884, 'djibouti']]); // 오보크 1862는 1만 밑 거점
own(H_SOL, [[F6_START, null], [1884, 'british-somaliland']]);
own(H_MAJ, [[F6_START, 'majeerteen-sultanate']]);
ownSplit('H_MU', H_MU, [['마제르테인', H_CUT_MAJ]], '호비오', { 마제르테인: [[F6_START, 'majeerteen-sultanate']], 호비오: [[F6_START, null], [1878, 'sultanate-of-hobyo']] }); // K3
ownSplit('H_GA', H_GA, [['호비오', H_CUT_HOB]], '베나디르', { 호비오: [[F6_START, null], [1878, 'sultanate-of-hobyo']], 베나디르: [[F6_START, null]] }); // K4
own(H_SOM_REST, [[F6_START, null]]);
// 차드·중앙아프리카·가봉·콩고
own(H_WADAI, [[F6_START, 'wadai']]); // 1805 바기르미 조공은 글
own(H_LC, [[F6_START, 'kanem-bornu']]); // 칸 사이 id 참조 — GN-6 블록
own(H_TCD_REST, [[F6_START, null]]);
own(H_CAF, [[F6_START, null]]);
own(H_GAB_COAST, [[F6_START, null], [1849, 'french-congo']]); // 1838·1841 해안 조약, 1849 리브르빌
own(H_GAB_COG, [[F6_START, null], [1882, 'french-congo']]); // 1880 마코코 조약은 글, 1882-11-30 프랑스령 콩고
// 일부러 비운 땅: 이집트 정복 앞(수단·남수단)·가시바르카 내내(기본값 12)·셰와 앞과 보라나 아래(Q3)·에티오피아 나머지·뿔 1884 앞·호비오 앞·베나디르와 주바·차드 나머지·중앙아프리카·가봉과 콩고 조약 앞
const H_voids = () => [
  V(F6_START, 1821, ...H_SNO), V(F6_START, 1840, ...H_SKA), V(F6_START, F6_END, ...H_EGB), V(F6_START, 1861, ...H_SNU),
  V(F6_START, 1865, ...H_SRS), V(F6_START, 1872, ...H_ESK), V(F6_START, 1870, ...H_SEQ), V(F6_START, 1873, ...H_SBG),
  V(F6_START, 1878, ...H_EAA), B(F6_START, 1878, 'H_EOR/북'), B(F6_START, F6_END, 'H_EOR/남'), V(F6_START, F6_END, ...H_EREST),
  V(F6_START, 1884, ...H_DJI, ...H_SOL), B(F6_START, 1878, 'H_MU/호비오', 'H_GA/호비오'), B(F6_START, F6_END, 'H_GA/베나디르'), V(F6_START, F6_END, ...H_SOM_REST),
  V(F6_START, F6_END, ...H_TCD_REST, ...H_CAF), V(F6_START, 1849, ...H_GAB_COAST), V(F6_START, 1882, ...H_GAB_COG),
];
// ── F6 H-6 끝 ──

// ── F6 S1A-6 케이프 (최상위 이름 S1A_) ──
// 조각 F6_S1A_IDS(남아프리카 ZA-WC 130,650·ZA-EC 170,983·ZA-NC 374,752 = 3), 구현 F6-S1A-6
// 새 항목 2: british-kaffraria(1847~1865 ZA-EC 칼선 몫 약 13,000 — vassal_of uk)·griqualand-west(1871~1879 ZA-NC 칼선 몫 약 40,000 — vassal_of uk)
// 앞 잇는 항목 1: F5 cape-colony(from 1795 — 기본값 42: occupied_by uk 1795~1802·vassal_of batavian-republic 1803~1805·vassal_of uk 1806~, 1800 경계 약 250,000 → 1822 331,907 → 칼선 몫마다 늘어남)
// 점프(P1): 1822 케이프 북동(창구 ③ Q-E1) · 1847 카프라리아·케이프 부시먼랜드·나마콸란드 북부 · 1866 카프라리아 → 케이프 · 1871 그리콸란드 웨스트 · 1877 트란스케이(S1A-6이 사료로) · 1880 그리콸란드 → 케이프. 1884→1885 점프 ㉦ 노던케이프 오렌지강 북쪽(F5 1885 케이프 근사)
// 칼선: 새 넷~다섯(cuts-f6.mjs S1A-6 머리 — S1A_CUT_CAPE1800 { from: F6_START, to: 1822 }·S1A_CUT_CAPE1822(따로 그을 때만)·S1A_CUT_KAFFRARIA { from: 1847, to: 1866 }·S1A_CUT_KEI { from: 1866, to: 1877 }·
//   S1A_CUT_GRIQUALAND_W { from: 1871, to: 1880 } — 뼈대 어림, 칸이 사료로 고침). 재사용(쓸 때만): import { S1A_CUT_BB_CAPE } from './cuts-f5.mjs'(노던케이프 북쪽 몫)
// 비운 땅: 케이프 경계 밖 칼선 몫(코사·트란스케이·그리콸란드·오렌지강 북쪽 — 모두 B(…)). 칼선 몫이 케이프를 둘로 가르지 않는지 월경지로 봄
import { F6_S1A_IDS } from './cuts-f6.mjs';
import { S1A_CUT_CAPE1800, S1A_CUT_CAPE1822, S1A_CUT_CAPE1822NE, S1A_CUT_GRIQUALAND_W, S1A_CUT_KAFFRARIA, S1A_CUT_KEI } from './cuts-f6.mjs';
const S1A_BOUNDS = [1822, 1847, 1871, 1877]; // 칼선 묶음 기간의 처음·끝(케이프 1822 경계·카프라리아와 케이강 1847~1876·그리콸란드 웨스트 1871~ — fillTables가 확인. 1866 카프라리아 → 케이프·1880 그리콸란드 → 케이프는 같은 묶음 안에서 주인만 바뀜)
// 조각 묶음(칸 안에서 다시 적음 — 합은 F6_S1A_IDS 3)
const S1A_WC = ['ZA-WC']; // 웨스턴케이프 — 1800부터 통째 케이프(1798 경계 안)
const S1A_EC = ['ZA-EC']; // 이스턴케이프 — 케이프 1800·1822 경계 / 피시강~키스카마강 / 영국령 카프라리아 / 케이강 동쪽 트란스케이
const S1A_NC = ['ZA-NC']; // 노던케이프 — 케이프 1800 경계 / 오렌지강 남쪽 / 그리콸란드 웨스트 / 오렌지강 북쪽 나머지(고르도니아·쿠루만 쪽 — 내내 비움)
{
  const all = [S1A_WC, S1A_EC, S1A_NC].flat();
  const want = new Set(F6_S1A_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa prepartition: S1A 조각 묶음 합 ${all.length}이 F6_S1A_IDS ${want.size}와 다름`);
  }
}
// 웨스턴케이프: 1795-09 영국 점령(관계 occupied_by uk 1795~1802)·1803-02 바타비아 공화국 인수(vassal_of batavian-republic 1803~1805)·1806-01-08 영국 재점령·1814 런던 협약 양도(글)
own(S1A_WC, [[F6_START, 'cape-colony']]);
// 이스턴케이프: 1800~1821 1798 경계(타르카강·바비안스강·그레이트피시강) 안 → 1822~1846 북동은 스톰버그·오렌지강까지 → 1847-12-17 해리 스미스 선포로 동쪽은 키스카마강까지 케이프,
//   키스카마강~케이강은 1847-12-23 영국령 카프라리아(1866 케이프 합침), 케이강 동쪽 트란스케이는 1877부터 케이프(1876 템부랜드 병합법·1877~1878 제9차 코사 전쟁 뒤 갈레카랜드 — 1879~1894 차례로 병합한 것을 1877에 한꺼번에 칠한 근사)
ownSplit('S1A_EC1', S1A_EC, [['케이프', S1A_CUT_CAPE1800]], '밖', { 케이프: [[F6_START, 'cape-colony']], 밖: [[F6_START, null]] }, { from: F6_START, to: 1822 });
ownSplit('S1A_EC2', S1A_EC, [['케이프', S1A_CUT_CAPE1822]], '밖', { 케이프: [[1822, 'cape-colony']], 밖: [[1822, null]] }, { from: 1822, to: 1847 });
ownSplit('S1A_EC3', S1A_EC, [['카프라리아', S1A_CUT_KAFFRARIA], ['트란스케이', S1A_CUT_KEI]], '케이프', {
  카프라리아: [[1847, 'british-kaffraria'], [1866, 'cape-colony']], // 1860 왕령 식민지(글), 1865 합병법·1866 케이프 합침
  트란스케이: [[1847, null]],
  케이프: [[1847, 'cape-colony']], // 피시강~키스카마강(옛 중립 지대·빅토리아이스트)·퀸스타운 쪽·스톰버그~알리월노스
}, { from: 1847, to: 1877 });
own(S1A_EC, [[1877, 'cape-colony']]);
// 노던케이프: 1800~1821 1798 경계(버펄스강·한탐·삭강·뉴벨트 산줄기) 안 → 1822~1846 1822 재정의 땅(오렌지강 호프타운 동쪽·프람베르흐 선 안 — 창구 ③ Q-E1) →
//   1847-12-17 해리 스미스 선포로 오렌지강 남쪽 전부(부시먼랜드·나마콸란드 북부 더함) → 1871-10-27 그리콸란드 웨스트(1880-10-18 케이프 합침).
//   오렌지강 북쪽 나머지(고르도니아·쿠루만 쪽)는 1884까지 비움(1885 F5 케이프·영국령 베추아날란드 — 점프 ㉦)
ownSplit('S1A_NC1', S1A_NC, [['케이프', S1A_CUT_CAPE1800]], '밖', { 케이프: [[F6_START, 'cape-colony']], 밖: [[F6_START, null]] }, { from: F6_START, to: 1822 });
ownSplit('S1A_NC2A', S1A_NC, [['케이프', S1A_CUT_CAPE1822NE]], '북쪽', { 케이프: [[1822, 'cape-colony']], 북쪽: [[1822, null]] }, { from: 1822, to: 1847 });
ownSplit('S1A_NC2', S1A_NC, [['케이프', S1A_CUT_CAPE1822]], '북쪽', { 케이프: [[1847, 'cape-colony']], 북쪽: [[1847, null]] }, { from: 1847, to: 1871 });
ownSplit('S1A_NC3', S1A_NC, [['그리콸란드', S1A_CUT_GRIQUALAND_W], ['케이프', S1A_CUT_CAPE1822]], '북쪽', {
  그리콸란드: [[1871, 'griqualand-west'], [1880, 'cape-colony']],
  케이프: [[1871, 'cape-colony']],
  북쪽: [[1871, null]],
}, { from: 1871, to: F6_END });
const S1A_voids = () => [
  B(F6_START, 1822, 'S1A_EC1/밖', 'S1A_NC1/밖'), // 1798 경계 밖 — 코사·코이코이·산 사람들의 땅(케이프 식민지 밖)
  B(1822, 1847, 'S1A_EC2/밖'), // 피시강 동쪽(1819 중립 지대·1835~1836 퀸아델레이드주는 되돌려짐)·코사 땅
  B(1822, 1847, 'S1A_NC2A/북쪽'), // 1822 재정의 땅 밖 — 부시먼랜드·나마콸란드 북부(산·코라 사람들)와 오렌지강 북쪽 그리콰·츠와나·코라 땅
  B(1847, 1871, 'S1A_NC2/북쪽'), // 오렌지강 북쪽 — 그리콰 사람들의 나라(그리콰타운·캄플라위스)와 츠와나·코라 땅
  B(1847, 1877, 'S1A_EC3/트란스케이'), // 케이강 동쪽 — 갈레카·템부·폰도 사람들의 나라
  B(1871, F6_END, 'S1A_NC3/북쪽'), // 오렌지강 북쪽 그리콸란드 웨스트 밖 — 고르도니아(1885 케이프)·쿠루만 쪽(1885 영국령 베추아날란드)
];
// ── F6 S1A-6 끝 ──

// ── F6 S1B-6 보어 공화국·나탈·줄루·소토·스와지 (최상위 이름 S1B_) ──
// 조각 F6_S1B_IDS(남아프리카 ZA-NW·ZA-NL·ZA-FS·ZA-GT·ZA-MP·ZA-LP 6·레소토 10·에스와티니 4 = 20), 구현 F6-S1B-6
// 새 항목 3: natalia(1839~1842 ZA-NL 투겔라강 남쪽 — 재사용 칼선 줄루란드·빌크레이 몫을 뺀 '나탈' 몫 51,292)·orange-river-sovereignty(1848~1853 ZA-FS 130,253 — vassal_of uk)·transvaal-territory(1877~1880 트란스발 1876 모양 276,469 — Q5, vassal_of uk, M-F6-12 ㉮로 successor_of 없음)
// 앞 잇는 항목 6: F5 south-african-republic(1852~1876·1881~ — 같은 id 빈 기간, vassal_of uk 1881~1883)·orange-free-state(1854~ ZA-FS)·zulu(1816~ 94,041 → 1839 줄루란드+빌크레이 43,054 → 1884 줄루란드 28,897 — 기본값 32·M-F6-9)·
//   natal(1843~ '나탈' 몫 51,292 — 기본값 37) · F2 basutoland(from 1824 — '소토 왕국' 1824~1867·'바수톨란드' 1868~, 기본값 43)·swaziland-protectorate(from 1780 — '스와지 왕국', 기본값 43·44)
// 점프(P1): 1816 줄루 · 1824 소토 · 1839 나탈리아·줄루 투겔라 북쪽만 · 1843 나탈 · 1848 오렌지강 주권령 · 1852 트란스발 · 1854 오라녀 · 1877 영국령 트란스발 · 1881 트란스발 공화국 복귀 · 1884 빌크레이(뉴 리퍼블릭 → 트란스발 색)
// 칼선: 재사용 셋(import { S1A_CUT_ZULU as S1B_CUT_ZULU, S1A_CUT_VRYHEID as S1B_CUT_VRYHEID, S1A_CUT_BB_TVL as S1B_CUT_BB_TVL } from './cuts-f5.mjs' — F6 내내 같은 나눔·기본 기간, 주인만 해마다 바뀜)
// 비운 땅: 스텔라랜드·고센(BB–트란스발 서쪽 몫 — 기본값 35)·페디·츠와나 나라들(기본값 36)·첫 성립 앞 조각(1800~1815 줄루 땅 등)
import { F6_S1B_IDS } from './cuts-f6.mjs';
import { S1A_CUT_ZULU as S1B_CUT_ZULU, S1A_CUT_VRYHEID as S1B_CUT_VRYHEID, S1A_CUT_BB_TVL as S1B_CUT_BB_TVL } from './cuts-f5.mjs';
const S1B_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 조각 묶음(칸 안에서 다시 적음 — 합은 F6_S1B_IDS 20)
const S1B_TVL = ['ZA-GT', 'ZA-MP', 'ZA-LP']; // 3 — 트란스발(발강 북쪽, 220,245). ZA-NW 칼선 동쪽 몫도 같은 주인
const S1B_NW = ['ZA-NW']; // 1 — 트란스발 몫(S1B_CUT_BB_TVL 안, 약 55,700) / 서쪽(츠와나 나라들·스텔라랜드·고센 — 내내 비움, 약 49,000)
const S1B_NL = ['ZA-NL']; // 1 — 빌크레이(S1B_CUT_VRYHEID, 약 14,100) / 줄루란드(S1B_CUT_ZULU, 약 28,900) / 나탈(투겔라강 남쪽, 약 51,300). 빌크레이 칼선이 줄루 칼선보다 앞
const S1B_OFS = ['ZA-FS']; // 1 — 오렌지강 주권령 → 오라녀 자유국(130,253)
const S1B_LSO = idsOf('LSO'); // 10 — 소토 왕국 → 바수톨란드(30,201)
const S1B_SWZ = idsOf('SWZ'); // 4 — 스와지 왕국(17,181)
{
  const all = [S1B_TVL, S1B_NW, S1B_NL, S1B_OFS, S1B_LSO, S1B_SWZ].flat();
  const want = new Set(F6_S1B_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa prepartition: S1B 조각 묶음 합 ${all.length}이 F6_S1B_IDS ${want.size}와 다름`);
  }
}
// 트란스발: 1838~1851 포체프스트롬·오리흐스타트·사우트판스베르흐 정착지와 페디 왕국은 범위가 흐려 비움(기본값 36),
//   1852-01-17 샌드리버 협약으로 독립 인정, 1877-04-12 셰프스톤의 병합 선언으로 영국령 트란스발(Q5 — 관계 vassal_of uk 1877~1880, M-F6-12 ㉮로 successor_of 없음),
//   1880-12 파르데크라알 봉기·1881-08-03 프리토리아 협약으로 자치를 되찾음(관계 vassal_of uk 1881~1883 — 1884-02-27 런던 협약으로 끝)
const S1B_TVL_LINE = [[F6_START, null], [1852, 'south-african-republic'], [1877, 'transvaal-territory'], [1881, 'south-african-republic']];
own(S1B_TVL, S1B_TVL_LINE);
// 노스웨스트: 동쪽(포체프스트롬·러스텐버그·제이러스트)은 트란스발, 서쪽(츠와나 나라들·1882~1885 스텔라랜드·고센)은 비움(기본값 35·36 — 1885 영국령 베추아날란드, P1 ㉦)
ownSplit('S1B_NW', S1B_NW, [['트란스발', S1B_CUT_BB_TVL]], '서쪽', {
  트란스발: S1B_TVL_LINE,
  서쪽: [[F6_START, null]],
});
// 콰줄루나탈: 1816 무렵 샤카가 줄루를 일으켜 투겔라강 남쪽까지 아우름(기본값 32), 1838-12-16 블러드강 전투 뒤 1839 투겔라강 남쪽에 나탈리아 공화국(기본값 33),
//   1843-05-04 영국 나탈 식민지(기본값 37 — 1866 알프레드 카운티 약 3,000 km²·남서쪽 끝 그리콸란드 이스트 쪽은 근사), 투겔라강 북쪽은 줄루(1879 열세 족장령은 글 — 기본값 39),
//   1884-08 뉴 리퍼블릭(빌크레이)은 트란스발 색 근사(기본값 35·M-F6-9 — F5 1885 모양과 같음). 위트레흐트(1859 트란스발에 합침)는 1883까지 줄루 색 근사
ownSplit('S1B_NL', S1B_NL, [['빌크레이', S1B_CUT_VRYHEID], ['줄루란드', S1B_CUT_ZULU]], '나탈', {
  빌크레이: [[F6_START, null], [1816, 'zulu'], [1884, 'south-african-republic']],
  줄루란드: [[F6_START, null], [1816, 'zulu']],
  나탈: [[F6_START, null], [1816, 'zulu'], [1839, 'natalia'], [1843, 'natal']],
});
// 프리스테이트: 1848-02-03 해리 스미스가 오렌지강 주권령을 선포(관계 vassal_of uk 1848~1853), 1854-02-23 블룸폰테인 협약으로 오라녀 자유국(기본값 33·38)
own(S1B_OFS, [[F6_START, null], [1848, 'orange-river-sovereignty'], [1854, 'orange-free-state']]);
// 레소토: 1824 모쇼에쇼에 1세가 타바보시우에 자리 잡아 소토 왕국(기본값 43 — 1868 영국 보호·1871 케이프 소속·1884 영국 직할은 관계, 1869 알리왈노스 조약 앞 칼레돈강 서쪽 땅은 근사)
own(S1B_LSO, [[F6_START, null], [1824, 'basutoland']]);
// 에스와티니: 1780 무렵 은드붕구니예 때 선 스와지 왕국(기본값 43·44 — 1881·1884 협약의 독립 보장은 글, 음스와티 2세 때 넓은 땅은 근사). 1885~1893은 F5가 비움(기본값 44 — 근사)
own(S1B_SWZ, [[F6_START, 'swaziland-protectorate']]);
const S1B_voids = () => [
  V(F6_START, 1852, ...S1B_TVL), // 트란스발 — 1852 샌드리버 협약 앞(보어 정착지·페디 왕국 범위 흐림, 기본값 36)
  B(F6_START, 1852, 'S1B_NW/트란스발'), // 노스웨스트 동쪽 — 같은 까닭
  B(F6_START, F6_END, 'S1B_NW/서쪽'), // 노스웨스트 서쪽 — 츠와나 나라들·스텔라랜드·고센(기본값 35·36)
  V(F6_START, 1816, ...S1B_NL), // 콰줄루나탈 — 1816 샤카의 줄루 왕국 앞(응와네·음테트와 등 범위 흐림)
  V(F6_START, 1848, ...S1B_OFS), // 프리스테이트 — 1848 오렌지강 주권령 앞(그리콰·바롤롱·보어 이주민 범위 흐림)
  V(F6_START, 1824, ...S1B_LSO), // 레소토 — 1824 소토 왕국 앞
];
// ── F6 S1B-6 끝 ──

// ── F6 S2-6 짐바브웨·잠비아·말라위·모잠비크·앙골라·나미비아·보츠와나 (최상위 이름 S2_) ──
// 조각 F6_S2_IDS(짐바브웨 10·잠비아 10·말라위 28·모잠비크 11·나미비아 13·보츠와나 15·앙골라 18(카빈다 포함) = 105), 구현 F6-S2-6
// 새 항목 1: kololo-kingdom(1845~1863 ZM-01·ZM-06·ZM-07 341,936 — Q4·기본값 30)
// 앞 잇는 항목 5: F5 ndebele-kingdom(1840~ 약 181,000 — 기본값 29)·lozi-kingdom(1800~1844·1864~ — 같은 id 빈 기간, 기본값 30)·gaza(1827~ 233,500 — 기본값 31·M-F6-8) ·
//   F2 portuguese-angola(1800~ 해안 5조각 156,735 — Q6)·portuguese-mozambique(거점 조각 — Q6, S2-6이 잼)
// 점프(P1): 1827 가자 · 1840 은데벨레 · 1845 콜롤로 · 1864 로지 복귀. 1884→1885 점프 ㉣ 앙골라 해안 밖 +1,103,020·모잠비크 거점 밖·독일령 남서아프리카 811,719·베추아날란드 남쪽 310,142(F5 결정)
// 칼선: 새 0, 후보 S2_CUT_MOZ(Q6 조건일 때만 — cuts-f6.mjs S2-6 머리, 칼선 1로 올리면 메인에 알림 — M-F6-11). 월비스베이 1,124는 이 칸 근사(F4 그대로)
// 비운 땅: 앙골라 내륙·모잠비크 거점 밖(Q6)·무타파·로즈위·헤레로·나마·오밤보·츠와나 나라들(기본값 36)·말라위·잠비아 나머지
// 사료: 위키 en Makololo(1845년까지 세벳와네가 바로체랜드 정복, 1851 세벳와네 죽음 → 마모치사네 → 세케레투, 1863~1864 계승 싸움 끝에 로지 시포파가 왕위 — 콜롤로 끝),
//   en Portuguese Mozambique(1752~1836 '모잠비크·소팔라·세나강 유역 총독령', 해안 거점과 잠베지 분지 교역지, 19세기 중엽 프라주 쇠퇴), en Prazo(잠베지 계곡 프라주, 19세기 테테에 프라주 57),
//   F5 S2-5 사료(en Barotseland·en Gaza Empire·en Matabeleland)·조사 노트 d 1-A·3절
import { F6_S2_IDS } from './cuts-f6.mjs';
import { S2_CUT_MOZ } from './cuts-f6.mjs';
const S2_BOUNDS = []; // 조각 통째와 S2_CUT_MOZ 한 나눔(시대 내내 같은 나눔·기본 기간)이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F6_S2_IDS 105)
const S2_MATABELE = ['ZW-MN', 'ZW-MS', 'ZW-MI', 'ZW-BU']; // 4 — 마타벨레랜드(약 181,000)
const S2_MASHONA = ['ZW-MC', 'ZW-ME', 'ZW-MW', 'ZW-MA', 'ZW-MV', 'ZW-HA']; // 6 — 마쇼날랜드(약 210,000)
const S2_LOZI = ['ZM-01', 'ZM-06', 'ZM-07']; // 3 — 바로체 평원과 둘레(웨스턴·노스웨스턴·서던주 341,936 — 문서 약 390,000, 알려진 근사)
const S2_ZMB_REST = minus(idsOf('ZMB'), ...S2_LOZI); // 7 — 잠비아 나머지(약 417,500)
const S2_MWI = idsOf('MWI'); // 28 — 말라위
const S2_GAZA = ['MZ-G', 'MZ-I', 'MZ-B', 'MOZ-1927', 'MOZ-5854']; // 5 — 가자·이냠바네·마니카·마푸투 둘(236,365 — F5 가자 제국 모양)
const S2_MOZ_ZAMBEZI = ['MZ-Q', 'MZ-T', 'MZ-S']; // 3 — 잠베지아·테테·소팔라(271,738 — S2_CUT_MOZ로 거점 지대와 밖)
const S2_MOZ_NORTH = ['MZ-A', 'MZ-N', 'MZ-P']; // 3 — 니아사·남풀라·카보델가두(287,014 — 모잠비크섬·이보 거점은 각 1만 km² 밑)
const S2_AGO_COAST = ['AO-LUA', 'AO-BGO', 'AO-CNO', 'AO-CUS', 'AO-BGU']; // 5 — 루안다·벵구·콴자노르테·콴자술·벵겔라(156,735 — Q6)
const S2_AGO_REST = minus(idsOf('AGO'), ...S2_AGO_COAST); // 13 — 앙골라 나머지(후암보·후일라·카빈다 포함 약 1,103,020)
const S2_NAM = idsOf('NAM'); // 13 — 나미비아(카프리비 NA-CA·월비스베이가 든 NA-ER 포함)
const S2_BWA = idsOf('BWA'); // 15 — 보츠와나
{
  const all = [S2_MATABELE, S2_MASHONA, S2_LOZI, S2_ZMB_REST, S2_MWI, S2_GAZA, S2_MOZ_ZAMBEZI, S2_MOZ_NORTH, S2_AGO_COAST, S2_AGO_REST, S2_NAM, S2_BWA].flat();
  const want = new Set(F6_S2_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa prepartition: S2-6 나라별 묶음 합 ${all.length}이 F6_S2_IDS ${want.size}와 다름`);
  }
  if (S2_MASHONA.length + S2_MATABELE.length !== idsOf('ZWE').length || S2_MOZ_ZAMBEZI.length + S2_MOZ_NORTH.length + S2_GAZA.length !== idsOf('MOZ').length) {
    throw new Error('sub-saharan-africa prepartition: S2-6 짐바브웨·모잠비크 묶음이 ZWE·MOZ와 다름');
  }
}
// 은데벨레: 므질리카지가 이끈 은데벨레가 1837~1838 보어인에게 밀려 림포포강 북쪽으로 옮겨 1840 무렵 마타벨레랜드에 자리 잡음(기본값 29). 1885~ F5 모양 그대로
own(S2_MATABELE, [[F6_START, null], [1840, 'ndebele-kingdom']]);
// 쇼나 땅(무타파·로즈위 쪽 — 은데벨레 조공 땅 포함)은 범위가 흐려 비움(기본값 36, F5 1885~1889와 같음)
own(S2_MASHONA, [[F6_START, null]]);
// 로지: 1800~1844 로지 왕국 → 1845 세벳와네의 콜롤로 정복(Q4·기본값 30 — 위키 en Makololo 1845) → 1864 계승 싸움 끝에 로지 시포파가 왕위(로지 복귀). 같은 id 빈 기간 1845~1863
own(S2_LOZI, [[F6_START, 'lozi-kingdom'], [1845, 'kololo-kingdom'], [1864, 'lozi-kingdom']]);
// 잠비아 나머지·말라위·나미비아·보츠와나: 벰바·응고니·체와·야오·츠와나·헤레로·나마·오밤보 땅 — 범위가 흐려 비움(기본값 36, F5 1885 앞 첫 조약 해까지 비움과 같음)
own(S2_ZMB_REST, [[F6_START, null]]);
own(S2_MWI, [[F6_START, null]]);
own(S2_NAM, [[F6_START, null]]); // 월비스베이(NA-ER 안 1,124)는 1878 영국 병합·1884 케이프 편입이나 1만 km² 밑이라 비움(알려진 근사 — F4 그대로)
own(S2_BWA, [[F6_START, null]]);
// 가자: 소샹가네가 1824 가자 제국을 세우고 1827 무렵 림포포강 하류로 옮겨 자리 잡음(기본값 31 — M-F6-8). 로렌수마르케스·이냠바네 포르투갈 거점은 1만 km² 밑이라 가자 색 안(F5와 같음)
own(S2_GAZA, [[F6_START, null], [1827, 'gaza']]);
// 모잠비크 잠베지 계곡(Q6 (A) + M-F6-11 칼선): 테테·세나·켈리마느 둘레 프라주 띠만 포르투갈령, 띠 밖 잠베지아·테테·소팔라는 비움(1885 F5 통째 — P1 ㉣)
ownSplit('S2_MOZ_ZAMBEZI', S2_MOZ_ZAMBEZI, [['거점', S2_CUT_MOZ]], '밖', {
  거점: [[F6_START, 'portuguese-mozambique']],
  밖: [[F6_START, null]],
});
// 모잠비크 북부: 모잠비크섬(총독 자리)·이보 같은 해안 거점은 각 1만 km² 밑이라 비움(기본값 7 잣대), 내륙 마쿠아·야오 땅도 비움(1885 F5 통째 — P1 ㉣)
own(S2_MOZ_NORTH, [[F6_START, null]]);
// 앙골라: 루안다(1575)·벵겔라(1617) 둘레 해안 다섯 조각만 1800부터(Q6 (A)), 1838 내륙 원정은 글. 후암보·후일라·카빈다 등은 1885 F5 통째(P1 ㉣)
own(S2_AGO_COAST, [[F6_START, 'portuguese-angola']]);
own(S2_AGO_REST, [[F6_START, null]]);
const S2_voids = () => [
  V(F6_START, 1840, ...S2_MATABELE), // 마타벨레랜드 — 은데벨레가 옮겨 오기 앞(기본값 29)
  V(F6_START, 1827, ...S2_GAZA), // 모잠비크 남부 — 가자 제국이 림포포강 하류로 옮겨 오기 앞(기본값 31)
  V(F6_START, F6_END, ...S2_MASHONA), // 마쇼날랜드 — 쇼나 여러 수장 땅, 범위가 흐림(기본값 36)
  V(F6_START, F6_END, ...S2_ZMB_REST, ...S2_MWI), // 잠비아 동·북과 말라위 — 벰바·응고니·체와·야오 땅, 범위가 흐림(기본값 36)
  V(F6_START, F6_END, ...S2_NAM, ...S2_BWA), // 나미비아·보츠와나 — 헤레로·나마·오밤보·츠와나 나라들, 범위가 흐림(기본값 36)
  V(F6_START, F6_END, ...S2_MOZ_NORTH), // 모잠비크 북부 — 해안 거점은 1만 km² 밑, 내륙은 포르투갈 지배 밖(Q6 (A))
  B(F6_START, F6_END, 'S2_MOZ_ZAMBEZI/밖'), // 잠베지아·테테·소팔라의 프라주 띠 밖(Q6 (A)·M-F6-11)
  V(F6_START, F6_END, ...S2_AGO_REST), // 앙골라 내륙·남부·카빈다 — 1885 조약 해 앞(Q6 (A))
];
// ── F6 S2-6 끝 ──

// ── F6 EI-6 콩고·대호수·동·인도양 섬 (최상위 이름 EI_) ──
// 조각 F6_EI_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹·마요트 2·세인트헬레나 SHN 2 = 248), 구현 F6-EI-6
// 새 항목 1: french-mauritius(1800~1809 MUS 14조각 — 모리셔스섬·로드리게스, vassal_of france 1715~1809)
// 앞 잇는 항목 7: F5 buganda(1800~1884 우간다 중부 24조각 61,984 — 기본값 21)·merina-kingdom(세 단계 1800 핵심 → 1817 → 1824, 남서 셋 비움 — ※) · F2 sultanate-of-zanzibar(1856~ 섬 2,608 — 기본값 22)·
//   british-mauritius(1810~) · F1 seychelles(1814~)·reunion(1800~)·mayotte(1841~ — 기본값 25)
// 점프(P1): 1817 메리나 베칠레오·동해안(※) · 1824 메리나 서해안·북부·남동(※). 섬(1만 km² 밑 — 버전 열쇠 없음): 1810 모리셔스 영국령 · 1814 세이셸 · 1841 마요트 · 1856 잔지바르
// 비운 땅: 콩고 분지(기본값 23 — 1885 자유국 점프)·르완다·부룬디·부뇨로·토로·앙콜레·미람보·코모로(기본값 26)·적도주와 우간다 북부 서나일 8구(기본값 27)·마다가스카르 남서 셋(기본값 28)·
//   잔지바르 본토 해안 띠·1800~1855 잔지바르 섬(기본값 22·34)·세인트헬레나·어센션 SHN 내내(0단계 기본값 4)·세이셸 1800~1813·마요트 1800~1840
import { F6_EI_IDS } from './cuts-f6.mjs';
const EI_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 사료(※ 연도 — 결과 노트 2절): 라다마 1세(재위 1810~1828) 1817-10-23 영국과 조약·1817 토아마시나 군 주둔지, 1823 북동 해안(마루안체트라·틴틴게·마난자리) 주둔지,
//   1824 보에마르·디에고수아레스·마하장가 주둔지, 1825 파라팡가나·포르도팽(위키 en Radama I — 1823·1825 땅은 결정 해 그대로 두고 알려진 근사), 베칠레오는 라다마 1세가 정복(위키 en Betsileo people — 해 없음),
//   일드프랑스 1715-09-20 점유·1721 정착·1810-12-03 항복·1814-05-30 파리 조약(위키 en Isle de France (Mauritius)), 레위니옹 1810-07 영국 점령·1814 파리 조약으로 반환(위키 en History of Réunion),
//   잔지바르 1856 사이드 빈 술탄 사후 분리·마지드 1856-10-19 즉위(위키 en Said bin Sultan·Majid bin Said of Zanzibar)
// 나라·섬별 묶음(칸 안에서 다시 적음 — 합은 F6_EI_IDS 248)
const EI_COD = idsOf('COD'); // 11 — 콩고 분지(루바·룬다·예케·쿠바·콩고 왕국은 범위가 흐려 비움 — Q4 (A)·기본값 23·26), 1885 콩고 자유국은 F5
const EI_RWA_BDI = idsOf('RWA', 'BDI'); // 22 — 르완다·부룬디 왕국(범위 흐림 — 기본값 26)
const EI_WEST_NILE = ['UG-301', 'UG-303', 'UG-309', 'UG-310', 'UG-313', 'UG-316', 'UG-320', 'UG-331']; // 서나일 8구(16,259 — 이집트 적도주 쪽, 기본값 27)
const EI_BUGANDA = Array.from({ length: 24 }, (_, i) => `UG-${101 + i}`); // 우간다 중부 24조각(61,984 — 부간다 왕국, 조공국은 비움 — 기본값 21)
const EI_UGA_REST = minus(idsOf('UGA'), ...EI_WEST_NILE, ...EI_BUGANDA); // 80 — 부뇨로·토로·앙콜레·부소가·북부(기본값 26)
const EI_KEN = idsOf('KEN'); // 8 — 1888 IBEA 앞(해안 도시 몸바사 등은 1만 밑)
const EI_ZANZIBAR = ['TZ-06', 'TZ-07', 'TZ-10', 'TZ-11', 'TZ-15']; // 웅구자섬·펨바섬(2,608 — F5 E_ZANZIBAR와 같음)
const EI_TZ_MAINLAND = minus(idsOf('TZA'), ...EI_ZANZIBAR); // 본토 25(마피아섬 포함 — 미람보·니용고 등 비움, 술탄의 해안 띠 약 20,800은 근사)
const EI_MDG_CORE = ['MDG-5862', 'MDG-5875', 'MDG-5881', 'MDG-5871']; // 이메리나 고원(아날라망가·이타시·바키난카라트라·봉골라바 58,702 — M-F6-18)
const EI_MDG_1817 = ['MDG-5873', 'MDG-5861', 'MDG-5874', 'MDG-5868', 'MDG-5863', 'MDG-5860', 'MDG-5882', 'MDG-5867']; // 베칠레오 3(오트마치아트라·아모로니마니아·이호롬베 63,459)·동해안 5(아치나나나·아날란지로푸·알라오트라망고로·바토바비피토비나니·아치모아치나나나 110,636)
const EI_MDG_1824 = ['MDG-5870', 'MDG-5869', 'MDG-5876', 'MDG-5880', 'MDG-5872', 'MDG-5879', 'MDG-5865']; // 서해안 4(보에니·베치보카·멜라키·소피아 154,527)·북부 2(디아나·사바 43,380)·남동 1(아노시 30,629)
const EI_MDG_SW = ['MDG-5864', 'MDG-5866', 'MDG-5878']; // 남서 3(안드로이·아치모안드레파나·메나베 136,288 — 사칼라바·안드로이·바라 등, 기본값 28)
const EI_MUS = idsOf('MUS'); // 14 — 모리셔스섬·로드리게스섬
const EI_SYC = idsOf('SYC'); // 22
const EI_COM = idsOf('COM'); // 3 — 그랑드코모르섬·앙주앙섬·모엘리섬(독립 술탄국들 — 기본값 26)
const EI_REU = ['FR-RE']; // 레위니옹
const EI_MYT = ['FR-YT']; // 마요트
const EI_SHN = idsOf('SHN'); // 2 — 세인트헬레나·어센션(0단계 기본값 4)
{
  const all = [EI_COD, EI_RWA_BDI, EI_WEST_NILE, EI_BUGANDA, EI_UGA_REST, EI_KEN, EI_ZANZIBAR, EI_TZ_MAINLAND, EI_MDG_CORE, EI_MDG_1817, EI_MDG_1824, EI_MDG_SW, EI_MUS, EI_SYC, EI_COM, EI_REU, EI_MYT, EI_SHN].flat();
  const want = new Set(F6_EI_IDS);
  if (EI_UGA_REST.length !== 80 || EI_TZ_MAINLAND.length !== 25 || want.size !== 248 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa prepartition: EI-6 나라·섬별 묶음 합 ${all.length}이 F6_EI_IDS ${want.size}와 다름`);
  }
}
// 주인 줄(그해 말). 1884 말 모양 = F5 1885 모양(partition.mjs E-5·I-5 — 콩고 자유국 1885 점프 P1 ㉣ 말고 같음)
own(EI_BUGANDA, [[F6_START, 'buganda']]); // 카바카의 왕국(조공국 비움 — Q1 (다)·기본값 21)
own(EI_ZANZIBAR, [[F6_START, null], [1856, 'sultanate-of-zanzibar']]); // 1856 사이드 빈 술탄 사후 오만과 갈라짐(1800~1855 오만 몫 — busaid-oman 늘리지 않음, 기본값 22·34)
own(EI_MDG_CORE, [[F6_START, 'merina-kingdom']]); // 안드리아남포이니메리나의 이메리나 고원 통일(M-F6-18)
own(EI_MDG_1817, [[F6_START, null], [1817, 'merina-kingdom']]); // 1817 라다마 1세 영국 조약·토아마시나 주둔지(북동 해안 1823·파라팡가나 1825는 근사)
own(EI_MDG_1824, [[F6_START, null], [1824, 'merina-kingdom']]); // 1824 마하장가·디에고수아레스·보에마르 주둔지(포르도팽 1825는 근사)
own(EI_MUS, [[F6_START, 'french-mauritius'], [1810, 'british-mauritius']]); // 1810-12-03 항복(1814 파리 조약은 글)
own(EI_SYC, [[F6_START, null], [1814, 'seychelles']]); // 1814 파리 조약(1794 항복·1811 영국 식민지 선언은 글)
own(EI_REU, [[F6_START, 'reunion']]); // 프랑스 식민지(1810~1814 영국 점령은 글 — 기본값 25)
own(EI_MYT, [[F6_START, null], [1841, 'mayotte']]); // 1841 프랑스 취득
// 콩고 분지·르완다·부룬디·우간다 나머지·서나일·케냐·탄자니아 본토·마다가스카르 남서·코모로·세인트헬레나는 줄을 적지 않아 시대 내내 주인 null(아래 voids)
const EI_voids = () => [
  V(F6_START, F6_END, ...EI_COD), // 콩고 분지: 루바·룬다·예케·쿠바·콩고 왕국 범위 흐림(Q4 (A)·기본값 23·26 — 1885 콩고 자유국)
  V(F6_START, F6_END, ...EI_RWA_BDI), // 르완다·부룬디 왕국(범위 흐림 — 기본값 26)
  V(F6_START, F6_END, ...EI_UGA_REST), // 부뇨로·토로·앙콜레·부소가 등(범위 흐림 — 기본값 26)
  V(F6_START, F6_END, ...EI_WEST_NILE), // 서나일: 이집트 적도주 거점 땅에 넣지 않음(기본값 27)
  V(F6_START, F6_END, ...EI_KEN), // 케냐 땅(1888 IBEA 칙허 앞 — 마사이 등, 해안 도시는 1만 밑)
  V(F6_START, F6_END, ...EI_TZ_MAINLAND), // 탄자니아 본토(미람보·니용고 등 범위 흐림, 잔지바르 술탄 해안 띠는 근사 — 기본값 22·26)
  V(F6_START, 1856, ...EI_ZANZIBAR), // 잔지바르·펨바: 1856 분리 앞은 오만 몫(오만 항목을 늘리지 않음 — 기본값 34)
  V(F6_START, 1817, ...EI_MDG_1817), // 베칠레오·동해안: 라다마 1세 정복 앞
  V(F6_START, 1824, ...EI_MDG_1824), // 서해안·북부·남동: 1824 정복 앞
  V(F6_START, F6_END, ...EI_MDG_SW), // 마다가스카르 남서: 메리나 밖 사칼라바·안드로이 등 독립 정치체(기본값 28)
  V(F6_START, 1814, ...EI_SYC), // 세이셸: 1814 파리 조약 앞(섬마다 1,000 km² 밑)
  V(F6_START, F6_END, ...EI_COM), // 코모로 세 섬: 1886 보호 조약 앞 독립 술탄국들(기본값 26)
  V(F6_START, 1841, ...EI_MYT), // 마요트: 1841 프랑스 취득 앞(사칼라바계 술탄 땅)
  V(F6_START, F6_END, ...EI_SHN), // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(0단계 기본값 4)
];
// ── F6 EI-6 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F6_START, ...WA_BOUNDS, ...GN_BOUNDS, ...H_BOUNDS, ...S1A_BOUNDS, ...S1B_BOUNDS, ...S2_BOUNDS, ...EI_BOUNDS, F6_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F6_START || BOUNDS.at(-1) !== F6_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa prepartition: 표 경계 해 ${BOUNDS.join(', ')}는 ${F6_START}~${F6_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa prepartition: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa prepartition: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa prepartition: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa prepartition: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa prepartition: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F6_END) throw new Error(`sub-saharan-africa prepartition: 마지막 표의 끝이 ${joined.TO} (${F6_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F6_END(1885) 그대로(끝 없음 null을 쓰지 않음 — 1885~는 partition.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만 걸림): 모든 버전은 F6_START~F6_END 안(1884/1885 이음은 partition.mjs가 같은 id로)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < F6_START || t === null || t > F6_END)) throw new Error(`sub-saharan-africa prepartition: ${id}의 버전 기간이 ${F6_START}~${F6_END} 밖(끝 없음 null 금지 — 1885~는 partition.mjs 몫)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GN_voids(), ...H_voids(), ...S1A_voids(), ...S1B_voids(), ...S2_voids(), ...EI_voids()];
if (voids.some(([f, t]) => f < F6_START || t === null || t > F6_END)) throw new Error(`sub-saharan-africa prepartition: 비운 땅의 기간은 ${F6_START}~${F6_END} 안이어야 함(끝 없음 null 금지 — 1885~는 partition.mjs 몫)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F6_START(1800)~F6_END(1885, 미포함)만 만든다(1799 이하에는 이 권역 구역이 없음 — 앞 시대 파일 precolonial(F7, −2332~1799)이 같은 id로 앞을 이으나 F7은 빈 땅 검사 구역을 두지 않음(M-F7-5). 1885~는 partition.mjs 구역 '사하라 이남 분할 …'이 이음 — 특별 지시 2).
// 비운 땅이 바뀌는 해마다 구역 하나(F6은 85년에 첫 조약·정복 해·Q1·Q3·Q4 비움이 해마다 바뀌어 구역이 마흔 개 안팎일 수 있음 — 정상), 마지막 구역의 끝은 F6_END. 이름 '사하라 이남 분할 앞 <from>~<to-1>'(F5 '사하라 이남 분할 …'·F4 '사하라 이남 식민 …'·F3 '사하라 이남 전후 …'·F2 '사하라 이남 탈식민 …'·F1 '사하라 이남 현대 …'와 겹치지 않음 — 'F5 이름 + 앞'이라 F5 이름 '분할 1885~…'과 글자가 다름).
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F6_START, F6_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => F6_START < y && y < F6_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `사하라 이남 분할 앞 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void U; void geomOfUnit; // 일곱 칸이 쓰지 않는 이름 경고 막기(합치기가 칸이 쓰기 시작한 이름을 지움)

export const era = {
  name: 'prepartition',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F5 partition.mjs·F4 colonial.mjs·F3 postwar.mjs·F2 decolonization.mjs·F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
