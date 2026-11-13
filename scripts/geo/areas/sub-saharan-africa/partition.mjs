// sub-saharan-africa 시대 파일 partition (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1885~1909: 베를린 회의 뒤 분할부터 남아프리카 연방 앞까지 (F5)
// 짝 항목 파일: data/entities/sub-saharan-africa-partition.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 앞 잇는 F4 항목 14는 sub-saharan-africa-colonial.yaml, F3 항목 16은
//   sub-saharan-africa-postwar.yaml, F2 항목 17은 sub-saharan-africa-decolonization.yaml, F1 항목 6은 sub-saharan-africa-modern.yaml)
//   앞 시대 파일 prepartition.mjs(F6, 1800~1884)가 같은 id로 앞을 잇는다(이 파일 항목 19·F4·F3·F2·F1 항목 중 1800~1884에 있는 것 — 짝 항목 파일 sub-saharan-africa-prepartition.yaml은 F6 새 항목 10, 사하라 이남 F6 뼈대 2026-11-13)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F5 짜임 안내 (F5 뼈대 2026-11-13 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 1~6), F1~F4 창구 ②·③, 서아시아 A1 창구 ①, F5 창구 ②(질문 4건 Q1~Q4·자동 승인 0·기본값 38·M-F5-1~10), 지시문 f5/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(이탈리아의 카살라 점령 1894~1897 — 기본값 22, 우찰레 조약의 보호령 주장 — 기본값 19). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만.
//   이름만 바뀌는 해(1890 프랑스령 수단·1891 프랑스령 기니·1893 영국령 중앙아프리카·1894 니제르 코스트·1896 프랑스령 소말리 해안·1898 남로디지아·1899~1904 수단 나눔 이름·1900 북·남나이지리아·
//   1903 우방기샤리·1906 우방기샤리-차드·1907 니아살랜드)는 새 버전이 아니다 — 항목 글로(기본값 6·24·27, 0단계 기본값 21. 연방 AOF 1895·1904는 글 — 0단계 결정 3·기본값 8).
// 1885 앞 버전: 이 시대 파일의 첫 해는 F5_START(1885)다. 1885 앞에 성립한 나라·식민지도 이 파일의 첫 버전은 1885부터이고, 1800~1884는 앞 시대 파일 prepartition.mjs(F6)가 같은 id로 앞을 이음
//   (1884 말 모양 = 이 파일의 1885 모양 — F5 결정이 만든 1885 점프만 예외, F6 P1 ㉠~㉦). 빈 땅 검사 구역은 이 파일이 1885~1909, prepartition.mjs가 1800~1884(아래 gapZones). 1799 이하에는 이 권역 땅이 비는 것이 정상이다.
// 시대 경계 맞물림: 앞 시대 파일 prepartition.mjs(F6)의 끝 F6_END = 1885 = 이 파일의 F5_START(그 파일이 손으로 맞춘 확인 줄). 뒤 시대 파일 colonial.mjs(F4)의 첫 해 F4_START = 1910 = 이 파일의 F5_END(미포함 — 아래 확인 줄). 이 파일 버전의 끝은 모두 F5_END 이하이고(끝 없음 null 금지),
//   1910에 이어지는 나라(같은 id)는 joinEras가 이 파일 버전 뒤에 F4~F1 버전을 붙인다. 1909 말 모양은 F4의 1910 모양과 같아야 한다 — 결정 점프 셋만 예외(P1):
//   ㉠ 남아프리카 연방(cape-colony·natal·transvaal-colony·orange-river-colony → south-africa, 같은 땅 주인만 바뀜) ㉡ 라도 SS-EC + 서나일 8구(belgian-congo → anglo-egyptian-sudan, 1910-06 이관)
//   ㉢ 투르카나 K1(M-F5-10 — E-5가 사료로 닫은 해부터 british-uganda, 1910 모양과 이어짐). 권역 파일의 joinEras 목록은 [prepartitionEra, partitionEra, colonialEra, postwarEra, decolonizationEra, modernEra](과거가 앞 — F6 뼈대 2026-11-13).
// 앞 잇는 항목 53: F4 항목 14(sub-saharan-africa-colonial.yaml)·F3 항목 16(…-postwar.yaml)·F2 항목 17(…-decolonization.yaml)·F1 항목 6(…-modern.yaml) — 같은 id, 블록은 그 자리(파일 소유표 —
//   COMMON 5절, 글과 from 고침만 칸이). 항목 from 고침: french-sudan 1890 → 1880·french-guinea 1891 → 1882(M-F5-12 — 1885 해안 버전 앞이라 필수)·southern-nigeria-protectorate 1900 → 1884·
//   swaziland-protectorate 1903 → 1894·nyasaland 1907 → 1891(기본값 24~27)·bsac-northern-rhodesia 1900 → 1899(M-F5-9 — 1899 버전은 로지 땅 ZM-01·ZM-06·ZM-07만, S2-5).
//   항목 from보다 앞 버전은 생성기가 받지 않으므로 from을 먼저 고친 뒤 own 줄. 짝 항목 파일 밖 id도 주인으로 쓸 수 있다(F2~F5 뼈대 장치 시험 ①).
// 비운 땅이 많다(Q1 (다)·결정 2·기본값 9): 조각마다 첫 조약·보호·병합 해 앞, 범위가 흐린 토착 나라 땅(사모리·모시·부뇨로 등), Q2 마흐디 재정복 땅(SD-NO 1896~·SD-NR·SD-KA 1897~·옴두르만 쪽 1898 —
//   1898까지 비움, 서아시아 이집트로 채우지 않음), Q3 에티오피아 남부(오가덴 ET-SO 1885~1890·나머지 남부와 보라나 칼선 아래 1885~1896·베니샹굴 ET-BE 1885~1897), 에콰토리아 SS-EE·SS-EW 1885~1898(기본값 17·M-F5-4),
//   스와질란드 1885~1893(기본값 32), 마다가스카르 남서 셋 1885~1896(기본값 34), 코모로 1885(독립 술탄국 — 1886 보호 조약), 세인트헬레나·어센션 SHN 내내(0단계 기본값 4).
//   비운 땅은 own 줄 주인 null만 두지 말고 반드시 칸 <앞머리>_voids에 V(…)(조각 통째)·B(…)(칼선 몫 단위 — fillTables 뒤라야 단위 도형이 있음)로 — 생성기 구멍 메우기가 이웃으로 채우지 않게.
//   명목 지배(앙골라 내륙·모잠비크 북부·나미비아 북부·콩고 자유국 안쪽·마다가스카르 남서 1897~)·데르비시 국가(1899~ — 기본값 23)·회사 영지(모잠비크·니아사 회사 — 기본값 33)·라도 차는
//   법적 주인 색 + mapNote 한 줄('명목'), 장부 후보로.
// 식민지 항목 색: 새 항목 27(토착 나라·식민지·보호령·회사령)은 본국 색이 아니라 자기 색(뼈대가 같은 해 맞닿는 이웃과 ΔE 26 넘게 — F2~F4 식민지 선례, COMMON P4). 본국은 data/relations.yaml의
//   vassal_of·occupied_by(칸 머리 아래). 같은 땅에서 앞뒤로 이어지는 항목(콩고 자유국 → 벨기에령 콩고, 보어 공화국 → 식민지, 회사령 → 보호령, 토착 나라 → 식민지)은 달라도 된다.
// 분할기 식민지(Q1 (다) 섞음): 조각마다 첫 조약·보호·병합 해부터 식민지 색. 결정 2 목록 나라와 Q4로 더한 셋(은데벨레 1885~1892·로지 1885~1898·라바 국가 1893~1899)이 선 땅은 정복·보호 해까지 그 나라 색.
//   북나이지리아(M-F5-2): northern-nigeria-protectorate는 1900부터 옛 회사 땅(소코토 범위 밖), 소코토 핵심 11조각은 1902까지 칼리프국·1903부터 북나이지리아.
//   보어 공화국 둘(기본값 28·M-F5-11): 1902(조약)까지 공화국 색, 1900~1901은 관계 occupied_by uk만. 콩고 자유국은 1885 통째(관계 없음 — 기본값 35·36).
// 마흐디 국가(Q2 (B)): mahdist-state 1885~1898, 1896·1897·1898에 줄어든 버전(1898 = 옴두르만 함락 뒤 그해 말 코르도판 쪽), 되찾은 땅은 1898까지 비움, 1899~ anglo-egyptian-sudan. 다르푸르는 1885~1897 마흐디 색·1898~ darfur(기본값 16).
// 에티오피아(Q3 (A′)): ethiopia 1885 핵심(ET-TI·ET-AM·ET-AA·ET-HA + ET-OR 중 보라나 칼선 위) → 1891 + 오가덴 ET-SO → 1897 + 나머지 남부(ET-SN·ET-AF·ET-GA·ET-DD·보라나 칼선 아래) → 1898 + 베니샹굴 ET-BE — 네 버전.
// 칸 사이 id 참조 네 무리(주인 id는 어느 칸 것이든 쓸 수 있고 블록 글·관계·허용 열쇠는 굵은 칸 하나 — COMMON 4절 '칸을 넘는 항목'): french-sudan(WA-5 블록 — GW-5가 BFA 1900~를 칠함)·
//   rabih-state·kanem-bornu(CE-N-5 블록 — CE-E-5가 차드 TD-CB·TD-HL·TD-ND·TD-LC를 칠함)·congo-free-state·belgian-congo(E-5 블록 — H-5가 라도 SS-EC 1894~1909, CE-E-5가 젬비오·라파이 후보를 칠함)·
//   british-kenya·ibea-company(E-5 블록 — H-5가 K2 서쪽 1895~1909를 칠함)·south-african-republic·transvaal-colony(S1BC-5 블록 — S1A-5가 ZA-NW 칼선 동쪽·ZA-NL 빌크레이를 칠함).
// 같은 id 빈 기간: kanem-bornu 1885~1892·1900~1901(한 파일 안 — 1893~1899 라바 국가), french-chad F5 1900~1905·F4 1920~(시대 파일 사이 — 기본값 21·M-F5-3)는 fillTables·joinEras가 받는다(F5 뼈대 장치 시험 ②).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f5.mjs F5_*_IDS — F4 아홉 칸과 다른 열 칸 WA-5·GW-5·CE-N-5·H-5·S1A-5·S1BC-5·CE-E-5·E-5·I-5·S2-5)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F5 <칸> 머리)과
//   그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GW_·CEN_·H_·S1A_·S1BC_·CEE_·E_·I_·S2_(칸 id의 '-5'와 하이픈은 JS 이름이 못 됨 — 특별 지시 9,
//   F4 colonial.mjs의 같은 앞머리와는 파일이 달라 겹치지 않음), import도 별칭, ownSplit 묶음 이름도 앞머리(예: 'H_ETOR'). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은
//   고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f5.mjs에 칸 머리 열이 있다. 새 칼선 일곱 — H-5 보라나(H_CUT_BORANA, 1885~1896)·S1A-5 영국령 베추아날란드–케이프(S1A_CUT_BB_CAPE)·–트란스발(S1A_CUT_BB_TVL, F5 내내)·줄루(S1A_CUT_ZULU, 1885~1896)·
//   빌크레이(S1A_CUT_VRYHEID, 1885~1902)·S1BC-5 22°S(S1BC_CUT_BECH22S, 1885~1889)·E-5 우간다 동부주(E_CUT_EASTPROV, 1888~1901), 후보 CE-E-5 젬비오·라파이(CEE_CUT_ZEMIO — 사료로 닫을 때만).
//   칸은 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <앞머리>_CUT_… } from './cuts-f5.mjs'로 가져온다.
//   재사용 여섯(좌표를 베끼지 않음 — 앞머리 별칭, F5 뼈대 장치 시험 ⑤): GW-5 import { GW_CUT_TOGOLAND } from './cuts-f3.mjs' · CE-N-5 import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs' ·
//   H-5 import { H1_CUT_JUBA as H_CUT_JUBA, H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs' · E-5 import { E1_CUT_TURKANA as E_CUT_TURKANA } from './cuts-f4.mjs'.
// 칸 조각 목록: 칸 머리 안의 import { F5_<칸>_IDS } from './cuts-f5.mjs'는 칸 안 확인용(나라별 묶음 합 = 칸 몫)으로만 쓰고, 나라별 묶음은 칸 안에서 idsOf('<adm0>')·minus(idsOf('ETH'), …) 꼴로 다시 적는다.
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F5_START·F5_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인 — 뼈대가 박은 값: H_BOUNDS 1897,
//   S1A_BOUNDS 1895·1897·1903, S1BC_BOUNDS 1890, E_BOUNDS 1888·1902. CE-E-5 젬비오를 그으면 CEE_BOUNDS에 1894·1909를 더함). 재사용 칼선은 F5 내내 같은 나눔(기본 기간)이면 BOUNDS가 필요 없다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F5_START(1885)부터, 해는 늘어나고 F5_END(1910) 전이다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(I_MDG_SW, [[F5_START, null], [1897, 'french-madagascar']]) + I_voids에 V(F5_START, 1897, ...I_MDG_SW) · own(H_SNO, [[F5_START, 'mahdist-state'], [1896, null], [1899, 'anglo-egyptian-sudan']]) + V(1896, 1899, 'SD-NO').
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄)과 해가 같아야 한다. 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
// 늘림 나라: 앞 권역 나라(uk·france·german-empire·belgium·italy·portugal·spain 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이 단계에 늘림은 없다(창구 ② 자동 승인 0건),
//   서아시아 이집트·리비아·알제리·스페인령 사하라 쪽 블록과 유럽 본국 블록은 바이트 그대로.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1~F4 공통·칸 머리·F5 공통·F5 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('partition');

const F5_START = 1885; // 이 시대 파일의 첫 해(1885년 말 모습). 그 앞(1800~1884)은 F6 시대 파일 prepartition.mjs 몫(그 파일의 F6_END와 F5_START가 같은지 그 파일이 확인)
const F5_END = 1910; // 마지막 표의 끝(미포함) = 뒤 시대 파일 colonial.mjs의 F4_START(1910)
const F4_START = 1910; // colonial.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F5_END !== F4_START) throw new Error(`sub-saharan-africa partition: F5_END ${F5_END}가 F4 첫 해 ${F4_START}와 다름(1909/1910 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F4 colonial.mjs와 같은 꼴 — F5 뼈대가 옮김, table.mjs·colonial.mjs·postwar.mjs·decolonization.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <앞머리>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F5_START || e[0] >= F5_END)) {
    throw new Error(`sub-saharan-africa partition: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F5_START} 이상 ${F5_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa partition: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F5_START, to = F5_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa partition: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa partition: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa partition: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa partition: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa partition: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F5 WA-5 서아프리카 대서양 쪽·서사헬 (최상위 이름 WA_) ──
// 조각 F5_WA_IDS(라이베리아 15·시에라리온 4·감비아 6·기니비사우 9·카보베르데 21·세네갈 14·기니 34·모리타니 13·말리 9 = 125), 구현 F5-WA-5
// 새 항목 2: tukulor-empire(1885~1892 ML-1·ML-2·ML-4·ML-5·ML-BKO 361,074 km² 조각 통째 — 기본값 2)·fouta-djallon(1885~1895 기니 푸타잘론 11조각 약 62,800)
// 앞 잇는 항목 9: F1 liberia · F2 british-sierra-leone·british-gambia·portuguese-guinea·portuguese-cape-verde · F3 french-senegal·french-sudan(from 1880 — MLI 첫 칠함 1893, M-F5-14)·french-mauritania(남 1904·북 1909 — 기본값 13)·
//   french-guinea(from 1882 — M-F5-12, 1885 해안 버전 앞이라 from 고침이 필수)
// 점프(P1): 1891 고지 기니(→ french-sudan, 창구 ③ Q-E3) · 1893 투쿨로르 끝(→ french-sudan)·1894 팀북투 · 1896 푸타잘론 끝·시에라리온 보호령 · 1898 시카소 · 1899 고지 기니 → french-guinea(관할 바뀜) · 1900 가오 · 1904 모리타니 남 · 1908 키달(창구 ③ Q-E4) · 1909 모리타니 북. 비움: Q1 (다) 첫 조약 앞 조각·사모리 등(기본값 9)·기니비사우 내륙 없음(기본값 11 — 1885 통째)
// 칸 사이 id 참조: french-sudan(WA-5 블록 — GW-5가 BFA 1900~를 칠함, 열쇠는 WA-5)
import { F5_WA_IDS } from './cuts-f5.mjs';
const WA_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라 안 묶음(조사 a 3절·a-measure.mjs 묶음 그대로 — 넓이는 1910 조각 육지 넓이)
const WA_SLE_COL = ['SL-W']; // 프리타운 반도 식민지 664
const WA_SLE_PROT = minus(idsOf('SLE'), ...WA_SLE_COL); // 보호령 3조각 71,292 — 1896-08-31 보호령 선언
const WA_GIN_COAST = ['GN-BF', 'GN-BK', 'GN-C', 'GN-CO', 'GN-DU', 'GN-FO', 'GN-FR', 'GN-GU', 'GN-KD', 'GN-KS', 'GN-LO', 'GN-MC', 'GN-NZ', 'GN-YO']; // 해안·숲 14 — 리비에르뒤쉬드(숲 여섯은 결과 노트 6절)
const WA_GIN_HAUTE = ['GN-K', 'GN-KO', 'GN-SI', 'GN-MD', 'GN-KE', 'GN-BE', 'GN-DB', 'GN-DI', 'GN-FA']; // 고지 기니 9 — 사모리 땅, 1891 프랑스령 수단 → 1899 프랑스령 기니(창구 ③ Q-E3)
const WA_GIN_FOUTA = minus(idsOf('GIN'), ...WA_GIN_COAST, ...WA_GIN_HAUTE); // 푸타잘롱 11 — 1896-11 보호령
const WA_MRT_S = ['MR-01', 'MR-02', 'MR-03', 'MR-04', 'MR-05', 'MR-06', 'MR-09', 'MR-10', 'MR-NKC']; // 모리타니 남 9 — 1904 민정 영토(기본값 13)
const WA_MRT_N = minus(idsOf('MRT'), ...WA_MRT_S); // 모리타니 북 4(아드라르·인치리·다흘레트누아디부·티리스제무르) — 1909 아드라르 정복
const WA_ML_TUK = ['ML-1', 'ML-2', 'ML-4', 'ML-5', 'ML-BKO']; // 투쿨로르 제국 361,074(카예·쿨리코로·세구·모프티·바마코 — 사막 몫은 근사, 기본값 2)
// 그해 말 주인 줄(Q1 (다) — 조각마다 첫 조약·보호·병합 해, 그 앞은 비움)
const WA_OWN = [
  [idsOf('SEN'), [[F5_START, 'french-senegal']]], // 카요르·졸로프 1886 병합은 글(기본값 9)
  [idsOf('GMB'), [[F5_START, 'british-gambia']]], // 1888 따로 식민지·1889 영국-프랑스 협정 경계는 글
  [idsOf('GNB'), [[F5_START, 'portuguese-guinea']]], // 비자고스 제도 포함 — 내륙은 명목 지배(기본값 11, 1886 프랑스 협약은 글)
  [idsOf('CPV'), [[F5_START, 'portuguese-cape-verde']]],
  [idsOf('LBR'), [[F5_START, 'liberia']]], // 1885·1892·1907 잃은 땅은 장부(넓이 미확인)
  [WA_SLE_COL, [[F5_START, 'british-sierra-leone']]],
  [WA_SLE_PROT, [[F5_START, null], [1896, 'british-sierra-leone']]], // 1896-08-31 보호령
  [WA_GIN_COAST, [[F5_START, 'french-guinea']]], // 리비에르뒤쉬드 1882 → 1891 프랑스령 기니(이름만)
  [WA_GIN_FOUTA, [[F5_START, 'fouta-djallon'], [1896, 'french-guinea']]], // 1896-11 보카르 비로 폐위·보호령
  [WA_GIN_HAUTE, [[F5_START, null], [1891, 'french-sudan'], [1899, 'french-guinea']]], // 1891-03 칸칸 점령·1892-06 비산두구 함락 → 1899-10-17 법령으로 기니 관할(파라나 관구 1895 기니도 1899에 함께 — 창구 ③ Q-E3)
  [WA_ML_TUK, [[F5_START, 'tukulor-empire'], [1893, 'french-sudan']]], // 세구 1890·니오로 1891·반디아가라 1893-04 — 최종 장악 1893
  [['ML-3'], [[F5_START, null], [1898, 'french-sudan']]], // 시카소 함락 1898-05-01(케네두구 비움 — 기본값 9)
  [['ML-6'], [[F5_START, null], [1894, 'french-sudan']]], // 팀북투 1893-12 보와퇴 함대·1894-02 조프르 부대
  [['ML-7'], [[F5_START, null], [1900, 'french-sudan']]], // 가오(조사 a 3절 1900)
  [['ML-8'], [[F5_START, null], [1908, 'french-sudan']]], // 키달 — 1908 첫 군사 초소(창구 ③ Q-E4)
  [WA_MRT_S, [[F5_START, null], [1904, 'french-mauritania']]], // 1904 민정 영토(트라르자·브라크나 1902~1903 보호)
  [WA_MRT_N, [[F5_START, null], [1909, 'french-mauritania']]], // 아드라르 1909 정복
];
const WA_IDS = WA_OWN.flatMap(([ids]) => ids);
// 칸 안 확인: 묶음을 합치면 F5_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음 — 합 125)
if (WA_IDS.length !== F5_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F5_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa partition: WA-5 칸 묶음 조각 ${WA_IDS.length}개가 F5_WA_IDS ${F5_WA_IDS.length}개와 다름`);
}
for (const [ids, line] of WA_OWN) own(ids, line);
// 일부러 비운 땅(주인 null과 같은 해 — 생성기 구멍 메우기가 이웃으로 채우지 않게)
const WA_voids = () => [
  V(F5_START, 1896, ...WA_SLE_PROT), // 시에라리온 내륙 — 보호령 선언 앞(Q1 (다))
  V(F5_START, 1891, ...WA_GIN_HAUTE), // 고지 기니 — 사모리의 와술루 제국 쪽(범위 흐림 — 기본값 9), 1891 칸칸 점령 앞
  V(F5_START, 1898, 'ML-3'), // 시카소 — 케네두구 왕국(범위 흐림 — 기본값 9)
  V(F5_START, 1894, 'ML-6'), // 팀북투 — 프랑스 점령 앞
  V(F5_START, 1900, 'ML-7'), // 가오 — 투아레그 땅, 프랑스 점령 앞
  V(F5_START, 1908, 'ML-8'), // 키달 — 켈 아다그 땅, 초소 앞(창구 ③ Q-E4)
  V(F5_START, 1904, ...WA_MRT_S), // 모리타니 남 — 무어인 토후국들(기본값 13)
  V(F5_START, 1909, ...WA_MRT_N), // 모리타니 북 — 아드라르 정복 앞(기본값 13)
];
// ── F5 WA-5 끝 ──

// ── F5 GW-5 기니만 서쪽·사헬 가운데 (최상위 이름 GW_) ──
// 조각 F5_GW_IDS(코트디부아르 19·가나 10·토고 5·베냉 12·부르키나파소 45·니제르 8 = 99), 구현 F5-GW-5
// 새 항목 2: asante(1885~1900 GH-AH·GH-BA 65,112 — 기본값 14)·dahomey(1885~1893 베냉 남부 7조각 17,295 — 기본값 10)
// 앞 잇는 항목 5: F3 french-ivory-coast(1893~)·british-gold-coast·french-dahomey(1894~)·french-niger(1900~) · F4 german-togoland
// 점프(P1): 1893 코트디부아르 남부 · 1894 다호메이 끝 · 1898 코트디부아르 북부(사모리 땅)·시카소 · 1899 골드코스트 북부 · 1900 니제르 남·다호메이 북부·BFA(french-sudan) · 1901 아샨티 · 1904 니제르 사막
// 칼선: 재사용 GW_CUT_TOGOLAND(import { GW_CUT_TOGOLAND } from './cuts-f3.mjs' — F5 내내 같은 나눔, 기본 기간). 칸 사이 id 참조: french-sudan(WA-5 블록 — own 줄만)
import { F5_GW_IDS } from './cuts-f5.mjs';
import { GW_CUT_TOGOLAND } from './cuts-f3.mjs';
import { P as GW_P, bx as GW_bx } from '../../lib.mjs';
const GW_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_GW_IDS 99)
const GW_CIV_N = ['CI-03', 'CI-04', 'CI-08', 'CI-10', 'CI-14', 'CI-17']; // 코트디부아르 북 6(사바네·발레뒤반다마·잔잔·뎅겔레·워로두구·바핑 159,781 — 사모리·콩 쪽)
const GW_CIV_S = minus(idsOf('CIV'), ...GW_CIV_N); // 코트디부아르 남 13(162,904)
const GW_GHA_SPLIT = ['GH-TV', 'GH-NP', 'GH-UE']; // 토골란드 칼선이 지나는 가나 조각 셋(칼선 안 = 독일령 토고, GH-TV 칼선 밖 = 골드코스트, GH-NP·GH-UE 칼선 밖 = 북부)
const GW_GHA_SOUTH = ['GH-WP', 'GH-CP', 'GH-EP', 'GH-AA']; // 가나 남 4(57,839 — 1874 골드코스트 식민지)
const GW_GHA_ASANTE = ['GH-AH', 'GH-BA']; // 아샨티 2(65,112 — 기본값 14)
const GW_GHA_UW = ['GH-UW']; // 어퍼웨스트(북부 준주 몫, 칼선 밖 GH-NP·GH-UE와 함께 97,206)
const GW_TGO = idsOf('TGO'); // 토고 5(57,262)
const GW_BEN_S = ['BJ-AQ', 'BJ-KO', 'BJ-LI', 'BJ-MO', 'BJ-OU', 'BJ-PL', 'BJ-ZO']; // 베냉 남 7(아틀랑티크·쿠포·리토랄·모노·우에메·플라토·주 17,297 — 다호메이 왕국·포르토노보, 기본값 10)
const GW_BEN_N = minus(idsOf('BEN'), ...GW_BEN_S); // 베냉 북 5(아타코라·알리보리·보르구·콜린·동가 99,507)
const GW_BFA = idsOf('BFA'); // 부르키나파소 45(255,622 — 오트볼타 땅, french-sudan은 WA-5 블록)
const GW_NER_S = ['NE-3', 'NE-4', 'NE-5', 'NE-6', 'NE-7', 'NE-8']; // 니제르 남 6(도소·마라디·타우아(조사 a 남 3 177,379) + 티야베리·니아메·진데르 — 1900-07-23 진데르 군사 영토가 덮은 니제르강~진데르 띠, 타우아가 빠지면 띠가 끊김)
const GW_NER_N = minus(idsOf('NER'), ...GW_NER_S); // 니제르 나머지 2(아가데즈·디파 776,538 — 아이르·사막·진데르 동쪽, 주변 구역 sahara-south)
{
  const all = [GW_CIV_N, GW_CIV_S, GW_GHA_SPLIT, GW_GHA_SOUTH, GW_GHA_ASANTE, GW_GHA_UW, GW_TGO, GW_BEN_S, GW_BEN_N, GW_BFA, GW_NER_S, GW_NER_N].flat();
  if (all.length !== F5_GW_IDS.length || new Set(all).size !== all.length || all.some((id) => !F5_GW_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa partition: GW-5 묶음 합 ${all.length}개가 F5_GW_IDS ${F5_GW_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 — ※ 해는 결과 노트 2절 표). 1909 말 모양 = F4 1910 모양(colonial.mjs GW 칸 — 오트볼타 땅 french-sudan, 나머지 같은 항목)
// 볼타남 = 칼선 밖 땅 중 북위 7° 아래(GH-TV 남쪽 안로·케타 띠만 — F('GH-TV')로 자르면 GH-TV·GH-NP 맞닿은 선에 넓이 0 부스러기가 남아 거친 상자로 자름, 선은 새로 긋지 않음)
const GW_GHA = ownSplit('GW_GHA', GW_GHA_SPLIT, [['토골란드', GW_CUT_TOGOLAND], ['볼타남', GW_P(GW_bx(-1.5, 4.5, 2, 7))]], '북부', {
  토골란드: [[F5_START, 'german-togoland']], // 1884-07-05 보호 조약, 내륙 경계는 1897 프랑스·1899 영국 협정(글) — 칼선은 F3·F4와 같은 나눔
  볼타남: [[F5_START, 'british-gold-coast']], // 안로·케타 해안(1874 골드코스트 식민지)
  북부: [[F5_START, null], [1899, 'british-gold-coast']], // 1898-06-14 영국-프랑스 협약(비준 1899-06-13)으로 경계가 서고 1899부터 골드코스트 색(북부 준주 1902 보호령 선언은 글)
});
own(GW_GHA_SOUTH, [[F5_START, 'british-gold-coast']]); // 1874-07-24 골드코스트 직할 식민지
own(GW_GHA_ASANTE, [[F5_START, 'asante'], [1901, 'british-gold-coast']]); // 1900 황금 의자 전쟁, 1901-09-26 병합 칙령(1902-01-01 발효 — 기본값 14)
own(GW_GHA_UW, [[F5_START, null], [1899, 'british-gold-coast']]); // 북부 준주 몫 — 위 북부와 같은 해
own(GW_TGO, [[F5_START, 'german-togoland']]); // 1884-07-05 보호 조약(명목 내륙은 mapNote)
own(GW_CIV_S, [[F5_START, null], [1893, 'french-ivory-coast']]); // 1893-03-10 식민지(그랑바삼·아시니 해안 거점은 1만 밑 근사)
own(GW_CIV_N, [[F5_START, null], [1898, 'french-ivory-coast']]); // 1898-09-29 사모리 투레 사로잡힘 — 북부(콩·사모리 땅) 장악
own(GW_BEN_S, [[F5_START, 'dahomey'], [1894, 'french-dahomey']]); // 1894-01 베한진 항복, 1894-06-22 다호메이 식민지 칙령(포르토노보 보호령 1882~는 1만 밑 근사)
own(GW_BEN_N, [[F5_START, null], [1900, 'french-dahomey']]); // 1897 프랑스-독일·1898 영국-프랑스 협약 뒤 보르구·아타코라 장악(1900 — 조사 a 3절)
own(GW_BFA, [[F5_START, null], [1900, 'french-sudan']]); // 1896 와가두구 진입~1901 저항 끝(사료 갈림 — 1900 그대로), 1899 프랑스령 수단 나눔·1904 오트세네갈-니제르(이름 — 글)
own(GW_NER_S, [[F5_START, null], [1900, 'french-niger']]); // 1900-07-23 진데르 군사 영토(남부 니제르 — 진데르 동쪽·타누트 북쪽은 명목)
own(GW_NER_N, [[F5_START, null], [1904, 'french-niger']]); // 1904 아이르 쪽 진출(조사 a), 아가데즈를 다스린 것은 1906(위키 en Agadez — 2년 차, 표 해 1904 그대로). 아이르·사막·디파(진데르 동쪽)는 명목
const GW_voids = () => [
  V(F5_START, 1899, ...GW_GHA_UW), B(F5_START, 1899, GW_GHA['북부']), // 가나 북부: 1898 협약 앞은 다곰바·맘프루시·곤자 등 흐린 토착 땅(기본값 9 — 범위 흐림)
  V(F5_START, 1893, ...GW_CIV_S), // 코트디부아르 남: 1893 식민지 앞(Q1 (다))
  V(F5_START, 1898, ...GW_CIV_N), // 코트디부아르 북: 콩·사모리 땅(기본값 9)
  V(F5_START, 1900, ...GW_BEN_N), // 베냉 북: 보르구·아타코라(범위 흐림)
  V(F5_START, 1900, ...GW_BFA), // 오트볼타 땅: 모시·구룬시·로비(기본값 9)
  V(F5_START, 1900, ...GW_NER_S), // 니제르 남: 다마가람·자르마 등(진데르 군사 영토 앞)
  V(F5_START, 1904, ...GW_NER_N), // 니제르 북: 아이르 투아레그(아가데즈 주둔 앞)
];
// ── F5 GW-5 끝 ──

// ── F5 CE-N-5 나이지리아·카메룬·기니만 섬·보르누 (최상위 이름 CEN_) ──
// 조각 F5_CEN_IDS(나이지리아 37·카메룬 10·적도 기니 6·상투메 프린시페 2 = 55), 구현 F5-CE-N-5
// 새 항목 6: sokoto-caliphate(1885~1902 하우사 핵심 11조각 346.1k — 기본값 1·M-F5-2, F6 창구 ② Q2 (B′)로 1885 누페·일로린·타라바 + 1885~1893 아다마와 동쪽을 더함 — 1885 643.6k)·benin-kingdom(1885~1896 NG-ED 19.9k)·royal-niger-company(1886~1899 NG-KO·NG-NI·NG-KW·NG-NA·NG-FC·NG-BE·NG-TA 262.3k)·
//   lagos-colony(1885~1905 NG-LA 3.7k → 1893~ 배후지 76.9k — 기본값 7)·rabih-state(1893~1899 NG-BO·NG-YO·CM-EN + 차드 넷은 CE-E-5)·kanem-bornu(1885~1892·1900~1901 — 같은 id 빈 기간)
// 앞 잇는 항목 5: F4 german-kamerun·northern-nigeria-protectorate(1900~ — M-F5-2)·southern-nigeria-protectorate(from 1884) · F2 spanish-guinea·portuguese-sao-tome
// 점프(P1): 1886 왕립 니제르 회사(소코토 에미르국 누페·일로린·타라바 몫이 넘어감 — Q2 (B′)) · 1893 라바 국가·라고스 배후지 · 1894 카메룬 동부·카메룬 북부(창구 ③ Q-E2 — 아다마와 동쪽 소코토 색 → 독일령) · 1897 베닌 왕국 끝 · 1900 옛 회사 땅 → 북나이지리아·라바 끝 · 1902 카넴-보르누 끝 · 1903 소코토 → 북나이지리아 · 1906 라고스 → 남나이지리아
// 칼선: 재사용 CEN_CUT_NCAM(import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs' — 북카메룬 띠, NG-BO 몫 1902~·NG-AD·NG-TA 몫 1903~1909 독일령 카메룬, 그 앞 보르누·소코토·회사 몫). 블록 소유: rabih-state·kanem-bornu(CE-E-5는 own 줄만)
import { F5_CEN_IDS } from './cuts-f5.mjs';
import { CE_CUT_NCAM as CEN_CUT_NCAM } from './cuts-f3.mjs';
const CEN_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_CEN_IDS 55). 북카메룬 띠(CEN_CUT_NCAM)가 걸치는 NG-BO·NG-AD·NG-TA는 조각마다 따로 나눔(띠 밖 주인이 셋 다 달라서)
const CEN_HAUSA = ['NG-SO', 'NG-KE', 'NG-ZA', 'NG-KT', 'NG-KN', 'NG-JI', 'NG-KD', 'NG-BA', 'NG-GO', 'NG-PL']; // 하우사 핵심 11 중 NG-AD(띠가 걸침)를 뺀 10 — 소코토 칼리프국(기본값 1)
const CEN_NUPE_ILORIN = ['NG-NI', 'NG-KW']; // 누페·일로린 에미르국 2(106,862) — 1885 소코토 칼리프국(F6 창구 ② Q2 (B′)), 1886 왕립 니제르 회사
const CEN_NIGER = ['NG-KO', 'NG-NA', 'NG-FC', 'NG-BE']; // 니제르·베누에 나머지 4(에미르국 밖) — 1885 비움, 1886 왕립 니제르 회사(기본값 3)
const CEN_YORUBA = ['NG-OG', 'NG-OY', 'NG-OS', 'NG-ON', 'NG-EK']; // 라고스 배후지(요루바 땅) 76.9k
const CEN_OILRIVERS = ['NG-AB', 'NG-AK', 'NG-AN', 'NG-BY', 'NG-CR', 'NG-DE', 'NG-EB', 'NG-EN', 'NG-IM', 'NG-RI']; // 동남 해안 10 — 오일 리버스·니제르 코스트 보호령 91.3k
const CEN_CM_SW = ['CM-LT', 'CM-SW', 'CM-SU', 'CM-CE', 'CM-OU', 'CM-NW']; // 카메룬 서남 6(두알라·부에아·야운데) 193.3k
const CEN_CM_NORTH = ['CM-AD', 'CM-NO']; // 카메룬 북(응가운데레·가루아 — 아다마와 에미르국 동쪽, 1885~1893 소코토 칼리프국(F6 창구 ② Q2 (B′)), 1894 협정 해부터 독일령 — 창구 ③ Q-E2)
const CEN_GNQ = idsOf('GNQ'); // 적도 기니 6(비오코·리오무니·안노본)
const CEN_STP = idsOf('STP'); // 상투메 프린시페 2
{
  const all = [CEN_HAUSA, ['NG-AD'], CEN_NUPE_ILORIN, CEN_NIGER, ['NG-TA'], ['NG-BO', 'NG-YO'], ['NG-ED'], ['NG-LA'], CEN_YORUBA, CEN_OILRIVERS, CEN_CM_SW, ['CM-ES'], CEN_CM_NORTH, ['CM-EN'], CEN_GNQ, CEN_STP].flat();
  if (all.length !== F5_CEN_IDS.length || new Set(all).size !== all.length || all.some((id) => !F5_CEN_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa partition: CE-N-5 묶음 합 ${all.length}개가 F5_CEN_IDS ${F5_CEN_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1909 말 = F4 CE-N 블록 1910(남부 17 southern-nigeria-protectorate, 북부 20 띠 밖 northern-nigeria-protectorate, 띠·카메룬 10 german-kamerun, GNQ·STP 그대로)
// 소코토 칼리프국: 1903-02 카노, 1903-03-13 소코토 함락(위키 en Sokoto Caliphate) — 1900-01-01 북나이지리아 보호령 선언은 글(M-F5-2)
own(CEN_HAUSA, [[F5_START, 'sokoto-caliphate'], [1903, 'northern-nigeria-protectorate']]);
ownSplit('CEN_NGAD', ['NG-AD'], [['띠', CEN_CUT_NCAM]], '본토', {
  띠: [[F5_START, 'sokoto-caliphate'], [1903, 'german-kamerun']], // 마다갈리·미치카·무비·자다·간예 쪽 — 1901~1902 독일의 아다마와 원정 뒤 칼리프국 함락 해에 맞춤(1902로 두면 띠 남쪽 덩어리 아래 31 km² 부스러기가 소코토에서 떨어짐 — 재사용 칼선이라 고치지 않음)
  본토: [[F5_START, 'sokoto-caliphate'], [1903, 'northern-nigeria-protectorate']], // 욜라(아다마와 토후국 도읍)는 1901-09-02 영국이 차지했으나 칼리프국 함락 해에 맞춤(기본값 1·5)
});
// 왕립 니제르 회사: 1886-07 특허, 1899 특허 취소·1900-01-01 정부가 넘겨받음(위키 en Royal Niger Company). 그 앞 1885는 에미르국 땅(누페·일로린·무리)만 소코토 칼리프국 색(F6 창구 ② Q2 (B′) —
//   F5가 아무도 칠하지 않은 해만 채움), 에미르국 밖 니제르·베누에 넷은 비움(Q1 (다) — 특허 앞 회사 조약은 글)
own(CEN_NUPE_ILORIN, [[F5_START, 'sokoto-caliphate'], [1886, 'royal-niger-company'], [1900, 'northern-nigeria-protectorate']]); // 비다·일로린
own(CEN_NIGER, [[F5_START, null], [1886, 'royal-niger-company'], [1900, 'northern-nigeria-protectorate']]); // 로코자·미나·아부자·마쿠르디 쪽
ownSplit('CEN_NGTA', ['NG-TA'], [['띠', CEN_CUT_NCAM]], '본토', {
  띠: [[F5_START, 'sokoto-caliphate'], [1886, 'royal-niger-company'], [1900, 'northern-nigeria-protectorate'], [1903, 'german-kamerun']], // 가샤카·맘빌라 쪽(1885 아다마와 에미르국 — Q2 (B′)) — 띠 밖과 같은 주인, 띠 남쪽 덩어리(NG-AD 몫과 함께) 1903 독일령(1902로 두면 558 km²가 독일령에서 떨어짐)
  본토: [[F5_START, 'sokoto-caliphate'], [1886, 'royal-niger-company'], [1900, 'northern-nigeria-protectorate']], // 무리 에미르국 쪽(1885 소코토 칼리프국 — Q2 (B′))
});
// 보르누: 1893 라바가 쿠카와를 빼앗음(통치 시작 1893-10-02 — 위키 en Rabih az-Zubayr), 1900-04-22 쿠세리에서 라바 죽음·1900-01-14 산다 쿠라 복위(위키 en Kanem–Bornu Empire),
//   1902-03 영국이 보르누 대부분을 차지해 북나이지리아로, 디크와는 1902 독일령 카메룬(기본값 37 — 차드 TD- 넷은 CE-E-5 own 줄)
ownSplit('CEN_NGBO', ['NG-BO'], [['띠', CEN_CUT_NCAM]], '본토', {
  띠: [[F5_START, 'kanem-bornu'], [1893, 'rabih-state'], [1900, 'kanem-bornu'], [1902, 'german-kamerun']], // 은갈라·디크와 남쪽·그워자 쪽(옛 디크와 토후국 서쪽)
  본토: [[F5_START, 'kanem-bornu'], [1893, 'rabih-state'], [1900, 'kanem-bornu'], [1902, 'northern-nigeria-protectorate']], // 쿠카와·마이두구리
});
own(['NG-YO'], [[F5_START, 'kanem-bornu'], [1893, 'rabih-state'], [1900, 'kanem-bornu'], [1902, 'northern-nigeria-protectorate']]); // 보르누 서쪽(바데·피카 — 근사, 결과 노트 7절)
own(['CM-EN'], [[F5_START, 'kanem-bornu'], [1893, 'rabih-state'], [1900, 'kanem-bornu'], [1902, 'german-kamerun']]); // 디크와 — 1893~1899 라바 국가의 도읍
// 남쪽: 오일 리버스 보호령 1884(1885 베를린 회의 인정) → 1893-05-12 니제르 코스트 보호령 → 1900-01-01 남나이지리아 보호령(이름만 — 기본값 6·25, 위키 en Niger Coast Protectorate)
own(CEN_OILRIVERS, [[F5_START, 'southern-nigeria-protectorate']]); // 칼라바르·보니·오포보 — 이그보 내륙은 명목(1901~1902 아로 원정은 글)
own(['NG-ED'], [[F5_START, 'benin-kingdom'], [1897, 'southern-nigeria-protectorate']]); // 베닌시티 — 1897-02-18 영국 원정대가 함락
own(['NG-LA'], [[F5_START, 'lagos-colony'], [1906, 'southern-nigeria-protectorate']]); // 라고스 섬 — 1906-05-01 남나이지리아 식민지 및 보호령에 합침
// 요루바 배후지: 1893-02-03 오요·1893-08-15 이바단 보호 조약(위키 en Lagos Colony — 1890~1897 요루바 땅 대부분에 보호령), 그 앞 비움(Q1 (다)). 에그바(아베오쿠타)는 1914까지 명목상 독립 — 근사
own(CEN_YORUBA, [[F5_START, null], [1893, 'lagos-colony'], [1906, 'southern-nigeria-protectorate']]);
// 카메룬: 1884 두알라 보호 조약, 1893-11-15 영국·독일·1894-03-15 독일·프랑스 협정으로 동쪽·북쪽 경계(CM-ES·CM-AD·CM-NO — 위키 en Kamerun·Adamawa Emirate), 북부는 1901~1902 아다마와 원정(가루아 1901·마루아 1902)까지 명목
own(CEN_CM_SW, [[F5_START, 'german-kamerun']]);
own(['CM-ES'], [[F5_START, null], [1894, 'german-kamerun']]); // 베르투아 쪽
own(CEN_CM_NORTH, [[F5_START, 'sokoto-caliphate'], [1894, 'german-kamerun']]); // 응가운데레·가루아 — 1885~1893 아다마와 에미르국(소코토 칼리프국 색 — F6 창구 ② Q2 (B′)), 1894 협정 해(창구 ③ Q-E2), 1894~1901 명목
own(CEN_GNQ, [[F5_START, 'spanish-guinea']]); // 리오무니 본토는 1900-06-27 파리 조약으로 경계가 정해짐 — 1885부터 통째(기본값 12, 근사)
own(CEN_STP, [[F5_START, 'portuguese-sao-tome']]); // 카카오 농장 — 모양 그대로
const CEN_voids = () => [
  V(F5_START, 1886, ...CEN_NIGER), // 왕립 니제르 회사 특허(1886-07) 앞 — 1885 에미르국 밖 니제르·베누에 넷은 아무도 칠하지 않음(Q1 (다) — 누페·일로린·타라바는 소코토 색, Q2 (B′))
  V(F5_START, 1893, ...CEN_YORUBA), // 요루바 배후지 — 1893 오요·이바단 보호 조약 앞(Q1 (다))
  V(F5_START, 1894, 'CM-ES'), // 카메룬 동부 — 1894 독일·프랑스 협정 앞(Q1 (다))
];
// ── F5 CE-N-5 끝 ──

// ── F5 H-5 수단·에티오피아·에리트레아·소말리 (최상위 이름 H_) ──
// 조각 F5_H_IDS(수단 17·남수단 10·에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1 = 64), 구현 F5-H-5
// 새 항목 1: mahdist-state(1885~1898 수단 + 남수단(에콰토리아·라도 뺌) 2,347,397 → Q2 (B) 1896·1897·1898 줄어듦, 다르푸르는 1898 뺌 — 기본값 16)
// 앞 잇는 항목 9: F1 ethiopia(Q3 네 버전)·djibouti · F3 british-somaliland·anglo-egyptian-sudan(1899~) · F4 italian-somaliland(1893~)·majeerteen-sultanate·sultanate-of-hobyo·italian-eritrea(1890~)·darfur(1898~)
// 점프(P1): 1890 에리트레아 · 1891 오가덴(ethiopia) · 1893 이탈리아령 소말리아 · 1896 동골라 비움 · 1897 베르베르·카살라 비움·에티오피아 남부 · 1898 옴두르만 쪽 비움·다르푸르·베니샹굴 · 1899 공동 통치
// 칼선: 새 1 H_CUT_BORANA(cuts-f5.mjs H-5 머리 — ownSplit { from: F5_START, to: 1897 }). 재사용 셋(import { H1_CUT_JUBA as H_CUT_JUBA, H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs')
// 칸 사이 id 참조(own 줄만): congo-free-state·belgian-congo(E-5 블록 — 라도 SS-EC 1894~1909)·british-kenya·ibea-company(E-5 블록 — K2 서쪽 1895~1909)
// 비운 땅: 에콰토리아 SS-EE·SS-EW 1885~1898(기본값 17)·라도 SS-EC 1885~1893·Q2 재정복 땅·Q3 에티오피아 남부(보라나 칼선 아래 몫은 B(…))
import { F5_H_IDS } from './cuts-f5.mjs';
import { H_CUT_BORANA } from './cuts-f5.mjs';
import { H1_CUT_JUBA as H_CUT_JUBA, H1_CUT_MAJ as H_CUT_MAJ, H1_CUT_HOB as H_CUT_HOB } from './cuts-f4.mjs';
const H_BOUNDS = [1897]; // 보라나 칼선 묶음 기간 { from: F5_START, to: 1897 }의 끝(fillTables가 확인)
// 사료(※ 연도 — 결과 노트 2절): 마흐디 국가 1885-01-26 하르툼 함락~1898-09-02 옴두르만~1899-11-24 움 디와이카라트(위키 en Mahdist State·Mahdist War — 동골라 1896, 아부하메드 1897-08-07·베르베르 1897,
//   카살라 1897-12 이탈리아가 이집트에 넘김, 가다리프·센나르·청나일 1898), 공동 통치 협정 1899-01-19(en Anglo-Egyptian Sudan), 알리 디나르 1898-09 엘파셰르 복위(en Ali Dinar),
//   라도 1894-05-12 영국-콩고 조약(en Lado Enclave), 이탈리아령 에리트레아 1890-01-01, 메넬리크 2세 오가덴 1891부터·보라나 1896~97·카파 1897·베니샹굴 1898(en Menelik II),
//   메르카·모가디슈 1893(en Italian Somaliland). 홍해 SD-RS는 1891-02 토카르를 영국-이집트군이 되찾은 뒤 오스만 디그나가 산지로 물러났고(en Osman Digna) 1897 베르베르 함락으로 수아킨–베르베르 길이 열려 베르베르와 함께 1897
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_H_IDS 64)
const H_SNO = ['SD-NO']; // 동골라(북부주) 365,071 — 1896 되찾음
const H_SNR = ['SD-NR', 'SD-KA', 'SD-RS']; // 베르베르(나일강주) 126,971·카살라 50,941·홍해 202,928 — 1897 되찾음(카살라 이탈리아 점령 1894~1897은 칠하지 않음 — 기본값 22, 홍해는 베르베르 함락으로 수아킨–베르베르 길이 열려 함께)
const H_SOM = ['SD-KH', 'SD-GZ', 'SD-SI', 'SD-GD', 'SD-NB', 'SD-NW']; // 옴두르만 쪽(하르툼·게지라·센나르·가다리프·청나일·백나일) — 1898 되찾음
const H_SKO = ['SD-KN', 'SD-KS']; // 코르도판 쪽 — 1898 말에도 칼리프 압둘라히(1899-11-24 전사)
const H_DAR = ['SD-DN', 'SD-DW', 'SD-DE', 'SDN-5856', 'SDN-5857']; // 다르푸르 5 — 1898 알리 디나르(기본값 16)
const H_SSU = ['SS-BN', 'SS-BW', 'SS-JG', 'SS-LK', 'SS-NU', 'SS-UY', 'SS-WR']; // 바르엘가잘·상나일 7 — 마흐디 명목, 1898 비움(Q2 '1898 = 코르도판 쪽')
const H_SEQ = ['SS-EE', 'SS-EW']; // 에콰토리아 — 1885~1898 비움(기본값 17·M-F5-4)
const H_LADO = ['SS-EC']; // 라도 — 1894 콩고 자유국(기본값 18)
const H_ERI = idsOf('ERI'); // 6
const H_ETC = ['ET-TI', 'ET-AM', 'ET-AA', 'ET-HA']; // 에티오피아 핵심 넷(+ ET-OR 칼선 위)
const H_EOR = ['ET-OR']; // 오로미아 — 보라나 칼선으로 가름(1885~1896), 1897~ 통째
const H_ESO = ['ET-SO']; // 오가덴 — 1891(Q3)
const H_ESN = ['ET-SN', 'ET-AF', 'ET-GA', 'ET-DD']; // 남부민족주·아파르·감벨라·디레다와 — 1897(Q3)
const H_EBE = ['ET-BE']; // 베니샹굴 — 1898(Q3)
const H_DJI = idsOf('DJI'); // 6
const H_SOL = idsOf('SOL'); // 1
const H_MAJ = ['SO-BR', 'SO-NU']; // 마제르테인
const H_MU = ['SO-MU']; // 무둑 — K3
const H_GA = ['SO-GA']; // 갈구두드 — K4
const H_JUBA = ['SO-GE', 'SO-JD', 'SO-JH']; // 게도·중주바·하주바 — K2
const H_BEN = minus(idsOf('SOM'), ...H_MAJ, ...H_MU, ...H_GA, ...H_JUBA); // 베나디르 나머지 여섯
{
  const all = [H_SNO, H_SNR, H_SOM, H_SKO, H_DAR, H_SSU, H_SEQ, H_LADO, H_ERI, H_ETC, H_EOR, H_ESO, H_ESN, H_EBE, H_DJI, H_SOL, H_MAJ, H_MU, H_GA, H_JUBA, H_BEN].flat();
  const want = new Set(F5_H_IDS);
  if (H_BEN.length !== 6 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa partition: H-5 나라별 묶음 합 ${all.length}(베나디르 ${H_BEN.length})이 F5_H_IDS ${want.size}와 다름`);
  }
}
// 수단 — 마흐디 국가(Q2 (B): 되찾은 땅은 1898까지 비움, 1899 공동 통치)
own(H_SNO, [[F5_START, 'mahdist-state'], [1896, null], [1899, 'anglo-egyptian-sudan']]);
own(H_SNR, [[F5_START, 'mahdist-state'], [1897, null], [1899, 'anglo-egyptian-sudan']]);
own(H_SOM, [[F5_START, 'mahdist-state'], [1898, null], [1899, 'anglo-egyptian-sudan']]);
own(H_SKO, [[F5_START, 'mahdist-state'], [1899, 'anglo-egyptian-sudan']]); // 1898 마흐디 버전 = 코르도판 쪽
own(H_DAR, [[F5_START, 'mahdist-state'], [1898, 'darfur']]); // 1916 공동 통치는 colonial.mjs
own(H_SSU, [[F5_START, 'mahdist-state'], [1898, null], [1899, 'anglo-egyptian-sudan']]); // 남쪽은 명목(mapNote)
own(H_SEQ, [[F5_START, null], [1899, 'anglo-egyptian-sudan']]);
own(H_LADO, [[F5_START, null], [1894, 'congo-free-state'], [1908, 'belgian-congo']]); // 칸 사이 id 참조 — E-5 블록(1910-06 수단 이관은 colonial.mjs)
// 에리트레아·에티오피아(Q3 (A′))
own(H_ERI, [[F5_START, null], [1890, 'italian-eritrea']]); // 1885~1889 마사와·아사브 거점은 1만 밑(근사)
own(H_ETC, [[F5_START, 'ethiopia']]); // 하라르 1887 등 1만 밑 단계는 근사, 우찰레 보호령 주장은 글(기본값 19)
ownSplit('H_EOR', H_EOR, [['남', H_CUT_BORANA]], '북', { 남: [[F5_START, null]], 북: [[F5_START, 'ethiopia']] }, { from: F5_START, to: 1897 });
own(H_EOR, [[1897, 'ethiopia']]);
own(H_ESO, [[F5_START, null], [1891, 'ethiopia']]);
own(H_ESN, [[F5_START, null], [1897, 'ethiopia']]);
own(H_EBE, [[F5_START, null], [1898, 'ethiopia']]);
// 지부티·소말릴란드·소말리아(K2·K3·K4는 F5 내내 같은 나눔 — 기본 기간)
own(H_DJI, [[F5_START, 'djibouti']]); // 1896 프랑스령 소말리 해안 — 이름만
own(H_SOL, [[F5_START, 'british-somaliland']]); // 1899~ 안쪽 데르비시 국가도 이 색(기본값 23)
own(H_MAJ, [[F5_START, 'majeerteen-sultanate']]);
ownSplit('H_MU', H_MU, [['마제르테인', H_CUT_MAJ]], '호비오', { 마제르테인: [[F5_START, 'majeerteen-sultanate']], 호비오: [[F5_START, 'sultanate-of-hobyo']] }); // K3
ownSplit('H_GA', H_GA, [['호비오', H_CUT_HOB]], '베나디르', { 호비오: [[F5_START, 'sultanate-of-hobyo']], 베나디르: [[F5_START, null], [1893, 'italian-somaliland']] }); // K4
ownSplit('H_JUBA', H_JUBA, [['주바서쪽', H_CUT_JUBA]], '주바동쪽', {
  주바서쪽: [[F5_START, null], [1895, 'british-kenya']], // 칸 사이 id 참조 — E-5 블록(동아프리카 보호령 1895-07-01)
  주바동쪽: [[F5_START, null], [1893, 'italian-somaliland']],
}); // K2
own(H_BEN, [[F5_START, null], [1893, 'italian-somaliland']]); // 1893 메르카·모가디슈(조사 b 기본값 12)
// 일부러 비운 땅: Q2 되찾은 땅(영국-이집트 군정 — 1899 공동 통치부터 칠함)·에콰토리아·라도 앞·에리트레아 앞·Q3 에티오피아 정복 앞·베나디르와 주바 쪽 보호·점령 앞
const H_voids = () => [
  V(1896, 1899, ...H_SNO), V(1897, 1899, ...H_SNR), V(1898, 1899, ...H_SOM, ...H_SSU),
  V(F5_START, 1899, ...H_SEQ), V(F5_START, 1894, ...H_LADO), V(F5_START, 1890, ...H_ERI),
  V(F5_START, 1891, ...H_ESO), V(F5_START, 1897, ...H_ESN), B(F5_START, 1897, 'H_EOR/남'), V(F5_START, 1898, ...H_EBE),
  V(F5_START, 1893, ...H_BEN), B(F5_START, 1893, 'H_GA/베나디르', 'H_JUBA/주바동쪽'), B(F5_START, 1895, 'H_JUBA/주바서쪽'),
];
// ── F5 H-5 끝 ──

// ── F5 S1A-5 케이프·나탈·영국령 베추아날란드 (최상위 이름 S1A_) ──
// 조각 F5_S1A_IDS(남아프리카 ZA-WC·ZA-EC·ZA-NC·ZA-NW·ZA-NL = 5), 구현 F5-S1A-5
// 새 항목 4: cape-colony(1885~1909 ZA-WC·ZA-EC·ZA-NC 칼선 몫, 1895 + 영국령 베추아날란드)·natal(1885~1909 ZA-NL 칼선 몫, 1897 + 줄루랜드·1903 + 빌크레이)·british-bechuanaland(1885~1894 133,190 — 기본값 29)·
//   zulu(1885~1896 ZA-NL 칼선 몫 약 27,000)
// 앞 잇는 항목 0. 1909 말 모양 → 1910 south-africa(P1 ㉠ — 같은 땅 주인만 바뀜)
// 점프(P1): 1895 영국령 베추아날란드 → 케이프 · 1897 줄루랜드 → 나탈 · 1903 빌크레이 → 나탈 · 1910 남아프리카 연방(F4)
// 칼선: 새 4(cuts-f5.mjs S1A-5 머리 — BB–케이프 { from: F5_START, to: 1895 }·BB–트란스발 기본 기간(F5 내내)·줄루 { from: F5_START, to: 1897 }·빌크레이 { from: F5_START, to: 1903 })
// 칸 사이 id 참조(own 줄만): south-african-republic·transvaal-colony(S1BC-5 블록 — ZA-NW 칼선 동쪽 1885~1909·ZA-NL 빌크레이 1885~1902)
import { F5_S1A_IDS } from './cuts-f5.mjs';
import { S1A_CUT_BB_CAPE, S1A_CUT_BB_TVL, S1A_CUT_VRYHEID, S1A_CUT_ZULU } from './cuts-f5.mjs';
const S1A_BOUNDS = [1895, 1897, 1903]; // 칼선 묶음 기간의 끝 — BB–케이프 1895·줄루 1897·빌크레이 1903(fillTables가 확인 — BB–트란스발은 F5 내내라 해가 필요 없음)
// 조각 묶음(칸 안에서 다시 적음 — 합은 F5_S1A_IDS 5)
const S1A_CAPE = ['ZA-WC', 'ZA-EC']; // 케이프 통째(1894 폰도랜드 병합 약 1만 km²·트란스케이 땅은 1885부터 케이프 색 — 근사)
const S1A_NC = ['ZA-NC']; // 케이프 / 영국령 베추아날란드(S1A_CUT_BB_CAPE — 1885~1894)
const S1A_NW = ['ZA-NW']; // 영국령 베추아날란드(1895~ 케이프) / 트란스발(S1A_CUT_BB_TVL — F5 내내)
const S1A_NL = ['ZA-NL']; // 나탈 / 줄루랜드(S1A_CUT_ZULU — 1885~1896) / 빌크레이(S1A_CUT_VRYHEID — 1885~1902)
{
  const all = [S1A_CAPE, S1A_NC, S1A_NW, S1A_NL].flat();
  const want = new Set(F5_S1A_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa partition: S1A 조각 묶음 합 ${all.length}이 F5_S1A_IDS ${want.size}와 다름`);
  }
}
own(S1A_CAPE, [[F5_START, 'cape-colony']]); // 1806-01-08 영국 영구 점령, 1872 책임 자치(글), 1910-05-31 남아프리카 연방(F4)
// 노던케이프: 1885-09-30 몰로포·노소브강 남쪽이 영국령 베추아날란드 직할 식민지, 1895-11-16 케이프에 합병(기본값 29)
ownSplit('S1A_NC1', S1A_NC, [['영국령 베추아날란드', S1A_CUT_BB_CAPE]], '케이프', {
  '영국령 베추아날란드': [[F5_START, 'british-bechuanaland']],
  케이프: [[F5_START, 'cape-colony']], // 그리콸란드 웨스트(1880 케이프 병합)·나마콸란드·고르도니아(업링턴 — 병합 해 1885~1889 사이는 근사)
}, { from: F5_START, to: 1895 });
own(S1A_NC, [[1895, 'cape-colony']]);
// 노스웨스트: 서쪽은 영국령 베추아날란드(브라이버그·마피켕) → 1895 케이프, 동쪽은 트란스발(S1BC-5 항목 — 칸 사이 id 참조, own 줄만)
ownSplit('S1A_NW', S1A_NW, [['트란스발', S1A_CUT_BB_TVL]], '서쪽', {
  트란스발: [[F5_START, 'south-african-republic'], [1902, 'transvaal-colony']], // 1900~1901 영국 점령은 관계 occupied_by(기본값 28·M-F5-11), 1902-05-31 페리니깅 조약
  서쪽: [[F5_START, 'british-bechuanaland'], [1895, 'cape-colony']], // 1885 스텔라랜드·고센 합침은 근사(1만 밑)
});
// 콰줄루나탈: 빌크레이 칼선이 줄루 칼선보다 앞(겹친 땅은 빌크레이). 1887 영국의 줄루랜드 병합은 관계 vassal_of(색 그대로 — 조사 d 기본값 12)
ownSplit('S1A_NL1', S1A_NL, [['빌크레이', S1A_CUT_VRYHEID], ['줄루랜드', S1A_CUT_ZULU]], '나탈', {
  빌크레이: [[F5_START, 'south-african-republic']], // 위트레흐트(1859~ 트란스발)·뉴 리퍼블릭(1884~1888, 1888-07-20 트란스발에 합침 — 근사)
  줄루랜드: [[F5_START, 'zulu']], // 1895 통가랜드 편입 약 3,000 km²는 근사
  나탈: [[F5_START, 'natal']],
}, { from: F5_START, to: 1897 });
ownSplit('S1A_NL2', S1A_NL, [['빌크레이', S1A_CUT_VRYHEID]], '나탈', {
  빌크레이: [[1897, 'south-african-republic'], [1902, 'transvaal-colony']],
  나탈: [[1897, 'natal']], // 1897-12 줄루랜드가 나탈에 합쳐짐
}, { from: 1897, to: 1903 });
own(S1A_NL, [[1903, 'natal']]); // 1903-01 빌크레이·위트레흐트·와케르스트룸 일부가 나탈로(1902 법)
const S1A_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음(1885부터 다섯 조각 모두 주인이 있음)
// ── F5 S1A-5 끝 ──

// ── F5 S1BC-5 보어 공화국·바수톨란드·스와질란드·남서·베추아날란드·앙골라 (최상위 이름 S1BC_) ──
// 조각 F5_S1BC_IDS(남아프리카 ZA-FS·ZA-GT·ZA-MP·ZA-LP 4·레소토 10·에스와티니 4·나미비아 13·보츠와나 15·앙골라 18 = 64), 구현 F5-S1BC-5
// 새 항목 4: south-african-republic(1885~1901 ZA-GT·ZA-MP·ZA-LP + S1A-5 몫, occupied_by uk 1900~1901)·orange-free-state(1885~1901 ZA-FS 130,253)·transvaal-colony·orange-river-colony(1902~1909)
// 앞 잇는 항목 5: F4 german-south-west-africa · F2 bechuanaland·basutoland·swaziland-protectorate(from 1894)·portuguese-angola
// 점프(P1): 1890 베추아날란드 북부(22°S 위)·카프리비 · 1894 스와질란드(ZAR 보호) · 1902 보어 공화국 둘 → 식민지 · 1910 남아프리카 연방(F4)
// 칼선: 새 1 S1BC_CUT_BECH22S(cuts-f5.mjs S1BC-5 머리 — ownSplit { from: F5_START, to: 1890 }). 블록 소유: south-african-republic·transvaal-colony(S1A-5는 own 줄만)
// 비운 땅: 스와질란드 1885~1893(기본값 32)·베추아날란드 22°S 북쪽 1885~1889(기본값 30)·카프리비 회랑 1885~1889(Q1 (다) 첫 조약 앞)
import { F5_S1BC_IDS } from './cuts-f5.mjs';
import { S1BC_CUT_BECH22S } from './cuts-f5.mjs';
const S1BC_BOUNDS = [1890]; // 22°S 칼선 묶음 기간 { from: F5_START, to: 1890 }의 끝(fillTables가 확인)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_S1BC_IDS 64)
const S1BC_TVL = ['ZA-GT', 'ZA-MP', 'ZA-LP']; // 3 — 트란스발 공화국(발강 북쪽). ZA-NW 칼선 동쪽·ZA-NL 빌크레이 몫은 S1A-5가 같은 주인으로 칠함
const S1BC_OFS = ['ZA-FS']; // 1 — 오라녀 자유국(130,253)
const S1BC_LSO = idsOf('LSO'); // 10 — 바수톨란드(30,201)
const S1BC_SWZ = idsOf('SWZ'); // 4 — 스와질란드(17,181)
const S1BC_CAPRIVI = ['NA-CA']; // 1 — 카프리비 회랑(20,121)
const S1BC_NAM = minus(idsOf('NAM'), ...S1BC_CAPRIVI); // 12 — 월비스베이 NA-ER 안 1,124는 케이프 식민지 땅인데 독일령 남서아프리카 색(F1~F4와 같은 근사)
const S1BC_BWA = idsOf('BWA'); // 15 — 22°S 칼선으로 남·북
const S1BC_AGO = idsOf('AGO'); // 18 — 카빈다 AO-CAB 포함
{
  const all = [S1BC_TVL, S1BC_OFS, S1BC_LSO, S1BC_SWZ, S1BC_CAPRIVI, S1BC_NAM, S1BC_BWA, S1BC_AGO].flat();
  const want = new Set(F5_S1BC_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa partition: S1BC-5 나라별 묶음 합 ${all.length}이 F5_S1BC_IDS ${want.size}와 다름`);
  }
}
// 보어 공화국 둘: 1900 영국 병합 선언(오렌지 05-28·트란스발 09-01)과 점령(블룸폰테인 1900-03-13·프리토리아 1900-06-05)은 관계 occupied_by uk 1900~1901로만,
//   땅은 1902-05-31 페레이니힝 조약까지 공화국 색(기본값 28·M-F5-11). 1902부터 영국 식민지(1910-05-31 남아프리카 연방 — colonial.mjs south-africa)
own(S1BC_TVL, [[F5_START, 'south-african-republic'], [1902, 'transvaal-colony']]);
own(S1BC_OFS, [[F5_START, 'orange-free-state'], [1902, 'orange-river-colony']]);
own(S1BC_LSO, [[F5_START, 'basutoland']]); // 1884 영국 직할 식민지(1868 보호)
// 스와질란드: 1885~1893 독립 스와지 왕국(1881·1884 협약이 독립 인정 — 기본값 32 비움), 1894-12 협약으로 트란스발 공화국 보호국(관계 vassal_of south-african-republic),
//   1899 개전 뒤 트란스발 관리가 물러남, 1903 영국 고등 판무관 아래(관계 vassal_of uk 1903~) — 땅은 1894부터 swaziland-protectorate 색(기본값 26)
own(S1BC_SWZ, [[F5_START, null], [1894, 'swaziland-protectorate']]);
// 카프리비 회랑: 1890-07-01 헬골란트–잔지바르 조약으로 독일령 남서아프리카에 붙음(그 앞은 로지 왕국 남쪽 끝 땅이나 범위가 흐려 비움 — Q1 (다)·기본값 9)
own(S1BC_CAPRIVI, [[F5_START, null], [1890, 'german-south-west-africa']]);
// 남서아프리카: 1884-04-24 보호, 1885 베를린 회의 뒤 해안~내륙 전부(북부 오밤보랜드·카방고는 1915년까지 명목 지배 — mapNote '명목'·장부 후보)
own(S1BC_NAM, [[F5_START, 'german-south-west-africa']]);
// 베추아날란드 보호령: 1885-03-31 남위 22° 남쪽, 1890-06-30 북쪽(응가미랜드) 연장 — 1890부터 BWA 통째(1895 회사 이관 시도는 실패해 변화 없음, 기본값 30)
ownSplit('S1BC_BWA', S1BC_BWA, [['북', S1BC_CUT_BECH22S]], '남', {
  북: [[F5_START, null]],
  남: [[F5_START, 'bechuanaland']],
}, { from: F5_START, to: 1890 });
own(S1BC_BWA, [[1890, 'bechuanaland']]);
// 앙골라: 1575 루안다, 1885-02-01 시물람부쿠 조약으로 카빈다 보호령, 1886 독일·프랑스와 경계 조약, 1891 콩고 자유국과 룬다 경계 — 내륙은 20세기 초까지 명목 지배(mapNote '명목'·장부 후보)
own(S1BC_AGO, [[F5_START, 'portuguese-angola']]);
const S1BC_voids = () => [
  V(F5_START, 1894, ...S1BC_SWZ), // 스와지 왕국 — 1894 트란스발 보호 앞(기본값 32, 17,181 km² 9년 — 장부 후보)
  V(F5_START, 1890, ...S1BC_CAPRIVI), // 카프리비 회랑 — 1890 독일령 앞(Q1 (다))
  B(F5_START, 1890, 'S1BC_BWA/북'), // 베추아날란드 남위 22° 북쪽 — 1890 보호령 연장 앞(기본값 30)
];
// ── F5 S1BC-5 끝 ──

// ── F5 CE-E-5 적도 아프리카·차드 (최상위 이름 CEE_) ──
// 조각 F5_CEE_IDS(차드 22·중앙아프리카 17·가봉 9·콩고 공화국 12 = 60), 구현 F5-CE-E-5
// 새 항목 1: french-congo(1885~1905 가봉 9 + 콩고 12 608,967, 1894~1902 + 중앙아프리카 17 622,601 — 기본값 20)
// 앞 잇는 항목 5: F4 wadai · F3 french-chad(1900~1905 — 1906~1919 틈, 기본값 21·M-F5-3)·french-ubangi-shari(1903~)·french-gabon·french-middle-congo(1906~)
// 점프(P1): 1893 라바(rabih-state — 바기르미·차드호) · 1894 우방기(french-congo) · 1900 라바 끝(french-chad) · 1903 우방기샤리 나뉨 · 1906 french-congo → 가봉·중앙콩고·차드 → 우방기샤리
// 칼선: 없음 — 후보 젬비오·라파이는 긋지 않음(1909 벨기에령 콩고 → 우방기샤리 행정 이관은 확인되나 술탄국 범위를 주는 사료가 없음). 1894 협정선(음보무강) 북쪽이라 법적 주인 프랑스 색 통째 — 알려진 근사·장부 후보
// 칸 사이 id 참조(own 줄만): rabih-state·kanem-bornu(CE-N-5 블록 — TD-CB·TD-HL·TD-ND·TD-LC)
import { F5_CEE_IDS } from './cuts-f5.mjs';
const CEE_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨(젬비오·라파이 칼선 없음)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_CEE_IDS 60)
const CEE_WADAI = ['TD-OD', 'TD-SI', 'TD-WF']; // 와다이 술탄국 124,138(1909 아베셰 점령 뒤도 F4가 1910~1911 와다이 — 이음 같음)
const CEE_BET = ['TD-BO', 'TCD-5579', 'TD-TI']; // 보르쿠·엔네디·티베스티 566,778 — F5 내내 비움(기본값 11, F4 voids와 이어짐)
const CEE_BAG = ['TD-CB', 'TD-HL', 'TD-ND']; // 바기르미 쪽 약 77,000 — 1885~1892 비움(기본값 9), 1893 라바 국가
const CEE_LC = ['TD-LC']; // 차드호 20,463 — 1885~1892 카넴-보르누, 1893 라바 국가
const CEE_TCD_REST = minus(idsOf('TCD'), ...CEE_WADAI, ...CEE_BET, ...CEE_BAG, ...CEE_LC); // 카넴 TD-KA + 남·동 11 = 12 — 1900 차드 군사 영토 앞 비움
const CEE_CAF = idsOf('CAF'); // 중앙아프리카 17 622,601 — 1894 오트우방기(프랑스령 콩고), 1903 우방기샤리
const CEE_GAB = idsOf('GAB'); // 가봉 9 261,455
const CEE_COG = idsOf('COG'); // 콩고 공화국 12 347,512
{
  const all = [CEE_WADAI, CEE_BET, CEE_BAG, CEE_LC, CEE_TCD_REST, CEE_CAF, CEE_GAB, CEE_COG].flat();
  if (CEE_TCD_REST.length !== 12 || all.length !== F5_CEE_IDS.length || new Set(all).size !== all.length || all.some((id) => !F5_CEE_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa partition: CE-E-5 묶음 합 ${all.length}개가 F5_CEE_IDS ${F5_CEE_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1906~1909 차드 땅은 우방기샤리 색(1906-02-11 우방기샤리-차드 — F4 1910 모양과 같음, french-chad는 1906~1919 틈 — 기본값 21·M-F5-3)
own(CEE_GAB, [[F5_START, 'french-congo'], [1906, 'french-gabon']]); // 1882-11-30 프랑스령 콩고(기본값 20), 1906 나뉨
own(CEE_COG, [[F5_START, 'french-congo'], [1906, 'french-middle-congo']]); // 같음 — 1906 중앙콩고
own(CEE_CAF, [[F5_START, null], [1894, 'french-congo'], [1903, 'french-ubangi-shari']]); // 1894-07-13 오트우방기(1894-08-14 콩고 자유국과 협정) · 1903-12-29 우방기샤리
own(CEE_WADAI, [[F5_START, 'wadai']]); // 1909 아베셰 점령은 글(F4 1910~1911 와다이)
own(CEE_BET, [[F5_START, null]]); // 실효 지배 앞(기본값 11 — 주변 구역 sahara-south)
own(CEE_LC, [[F5_START, 'kanem-bornu'], [1893, 'rabih-state'], [1900, 'french-chad'], [1906, 'french-ubangi-shari']]); // 1893-10 라바 쿠카와 함락 · 1900-04-22 쿠세리 · 1900-09-05 차드 군사 영토 · 1906 우방기샤리-차드
own(CEE_BAG, [[F5_START, null], [1893, 'rabih-state'], [1900, 'french-chad'], [1906, 'french-ubangi-shari']]); // 바기르미 범위 흐림(기본값 9) → 1893 라바 지배
own(CEE_TCD_REST, [[F5_START, null], [1900, 'french-chad'], [1906, 'french-ubangi-shari']]); // 1900 군사 영토(와다이 속국 땅 실효 1909~1911은 글 — 조사 b 기본값 10)
// 일부러 비운 땅: BET 내내(기본값 11), 중앙아프리카는 1894 오트우방기 앞(Q1 (다)), 바기르미는 라바 앞(기본값 9), 카넴·남·동은 1900 군사 영토 앞(Q1 (다))
const CEE_voids = () => [V(F5_START, F5_END, ...CEE_BET), V(F5_START, 1894, ...CEE_CAF), V(F5_START, 1893, ...CEE_BAG), V(F5_START, 1900, ...CEE_TCD_REST)];
// ── F5 CE-E-5 끝 ──

// ── F5 E-5 콩고·대호수·동 (최상위 이름 E_) ──
// 조각 F5_E_IDS(콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112(서나일 8구 포함)·케냐 8·탄자니아 30 = 183), 구현 F5-E-5
// 새 항목 3: congo-free-state(1885~1907 COD 11 2,346,991, 1894~ + 서나일 8구 — 관계 없음, 기본값 35·36)·buganda(1885~1893 우간다 중부 24조각 61,984)·ibea-company(1888~1894 KEN 8 589,850 — 기본값 4)
// 앞 잇는 항목 5: F3 belgian-congo(1908~) · F4 german-east-africa(1886~) · F2 british-uganda(1894~)·british-kenya(1895~)·sultanate-of-zanzibar
// 점프(P1): 1886 독일령 동아프리카 본토 · 1888 IBEA · 1890 르완다·부룬디(독일령) · 1894 부간다 끝(british-uganda)·서나일(congo-free-state) · 1895 IBEA → british-kenya · 1896 우간다 나머지 · 1902 우간다 동부주 → 케냐 · 1908 콩고 자유국 → 벨기에령 콩고
// 칼선: 새 1 E_CUT_EASTPROV(cuts-f5.mjs E-5 머리 — ownSplit { from: 1888, to: 1902 }), 재사용 E_CUT_TURKANA(import { E1_CUT_TURKANA as E_CUT_TURKANA } from './cuts-f4.mjs' — M-F5-10)
// 블록 소유: congo-free-state·belgian-congo(H-5 라도·CE-E-5 젬비오는 own 줄만)·british-kenya·ibea-company(H-5 K2 서쪽은 own 줄만)·british-uganda
import { F5_E_IDS } from './cuts-f5.mjs';
import { E_CUT_EASTPROV } from './cuts-f5.mjs';
import { E1_CUT_TURKANA as E_CUT_TURKANA } from './cuts-f4.mjs';
// KE-700은 1888~1894 IBEA 통째라 나눌 필요가 없고, 1895부터 K1·동부주·나머지가 갈림 → 묶음 하나 { from: 1895, to: F5_END }(뼈대 값 1888·1902를 1895 하나로 — 결과 노트 2절)
const E_BOUNDS = [1895];
// 사료(※ 연도 — 결과 노트 2절): 콩고 자유국 1885-07-01 성립·1894-05-12 라도 임차·1908-11-15 벨기에 병합(위키 en Congo Free State), 독일 동아프리카 회사 칙허장 1885-02-27·1886 영독 세력권 협정·
//   1890 헬골란트–잔지바르 조약(르완다·부룬디 독일 몫, 잔지바르 영국 보호국 — 위키 en German East Africa·Sultanate of Zanzibar), IBEA 칙허 1888-09-06(질문 묶기 웹 확인 표),
//   우간다 보호령 1894-06-18(위키 en Uganda Protectorate), 동아프리카 보호령 1895-07-01 '나이바샤호까지'(위키 en History of Kenya·East Africa Protectorate), 1902 우간다 동부주 이관(같은 문서),
//   보호령 확대 1896(우간다 나머지·동부주·루돌프주 — 웹으로 해를 못 닫음, 조사 c 기억 해 그대로. K1은 M-F5-10 '못 닫으면 동부주와 같은 첫 해'로 1896)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_E_IDS 183)
const E_COD = idsOf('COD'); // 11 — 콩고 자유국 → 1908 벨기에령 콩고
const E_RWA_BDI = idsOf('RWA', 'BDI'); // 22 — 1890 독일령 동아프리카(르완다·부룬디 왕국은 범위가 흐려 비움 — 기본값 9)
const E_WEST_NILE = ['UG-301', 'UG-303', 'UG-309', 'UG-310', 'UG-313', 'UG-316', 'UG-320', 'UG-331']; // 서나일 8구(16,259) — 라도 임차지 남쪽, 1894~ 콩고 자유국(M-F5-8), 1910 수단(F4)
const E_BUGANDA = Array.from({ length: 24 }, (_, i) => `UG-${101 + i}`); // 우간다 중부 24조각(61,984 — 위키 en Buganda 61,403, 차 581)
const E_UGA_REST = minus(idsOf('UGA'), ...E_WEST_NILE, ...E_BUGANDA); // 80 — 부뇨로·토로·앙콜레·부소가·북부(기본값 9로 1895까지 비움)
const E_KE_EAST = ['KE-600', 'KE-800']; // 니안자·웨스턴 — 통째로 우간다 동부주
const E_RIFT = ['KE-700']; // 리프트밸리 — 1895~ 칼선 둘로 나눔(K1·동부주)
const E_KEN = minus(idsOf('KEN'), ...E_KE_EAST, ...E_RIFT); // 5 — 나이로비·중부·해안·동부·북동부(1895~ 동아프리카 보호령)
const E_ZANZIBAR = ['TZ-06', 'TZ-07', 'TZ-10', 'TZ-11', 'TZ-15']; // 웅구자섬·펨바섬(F4 E1_ZANZIBAR와 같음)
const E_TZ_MAINLAND = minus(idsOf('TZA'), ...E_ZANZIBAR); // 본토 25(마피아섬 포함)
{
  const all = [E_COD, E_RWA_BDI, E_WEST_NILE, E_BUGANDA, E_UGA_REST, E_KE_EAST, E_RIFT, E_KEN, E_ZANZIBAR, E_TZ_MAINLAND].flat();
  const want = new Set(F5_E_IDS);
  if (E_UGA_REST.length !== 80 || E_KEN.length !== 5 || E_TZ_MAINLAND.length !== 25 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa partition: E-5 나라별 묶음 합 ${all.length}이 F5_E_IDS ${want.size}와 다름`);
  }
}
own(E_COD, [[F5_START, 'congo-free-state'], [1908, 'belgian-congo']]); // 1885 통째(안쪽 실효 카탕가 1891·동부 1893~1894는 글 — 기본값 35), 1908-11-15 벨기에 병합
own(E_WEST_NILE, [[F5_START, null], [1894, 'congo-free-state'], [1908, 'belgian-congo']]); // 1894-05-12 라도 임차(M-F5-8), 1910-06 수단은 F4
own(E_TZ_MAINLAND, [[F5_START, null], [1886, 'german-east-africa']]); // 1886 영독 협정 세력권(해안 16 km 띠 술탄 땅 1886~1889는 근사)
own(E_RWA_BDI, [[F5_START, null], [1890, 'german-east-africa']]); // 1890 헬골란트–잔지바르 조약
own(E_ZANZIBAR, [[F5_START, 'sultanate-of-zanzibar']]); // 1890~ 영국 보호국(관계)
own(E_BUGANDA, [[F5_START, 'buganda'], [1894, 'british-uganda']]); // 1894-06-18 보호령
own(E_UGA_REST, [[F5_START, null], [1896, 'british-uganda']]); // 1896 보호령 확대
own(E_KE_EAST, [[F5_START, null], [1888, 'ibea-company'], [1895, null], [1896, 'british-uganda'], [1902, 'british-kenya']]); // 동부주: 1895 보호령 밖(나이바샤 서쪽), 1902 이관
own(E_KEN, [[F5_START, null], [1888, 'ibea-company'], [1895, 'british-kenya']]); // 칙허 지역(실효는 해안~우간다 길목 — 기본값 4), 1895-07-01 보호령
own(E_RIFT, [[F5_START, null], [1888, 'ibea-company']]); // 1888~1894 통째 칙허 지역
const E_RIFT_UNITS = ownSplit('E_RIFT', E_RIFT, [['투르카나', E_CUT_TURKANA], ['동부주', E_CUT_EASTPROV]], '리프트밸리', {
  투르카나: [[1895, null], [1896, 'british-uganda']], // K1 루돌프주(M-F5-10 ㉯ — 동부주와 같은 첫 해, 1902 뒤에도 우간다에 남아 F4 1910~1925와 이어짐)
  동부주: [[1895, null], [1896, 'british-uganda'], [1902, 'british-kenya']], // 나이바샤 서쪽 리프트밸리
  리프트밸리: [[1895, 'british-kenya']],
}, { from: 1895, to: F5_END });
const E_voids = () => [
  V(F5_START, 1886, ...E_TZ_MAINLAND), // 1886 영독 협정 앞(독일 동아프리카 회사 칙허장만 — 내륙 조약 땅 범위 흐림)
  V(F5_START, 1890, ...E_RWA_BDI), // 르완다·부룬디 왕국(범위 흐림 — 기본값 9), 1890 독일 몫
  V(F5_START, 1894, ...E_WEST_NILE), // 서나일(1894 라도 임차 앞 — 마흐디 국가 땅에 넣지 않음, M-F5-8)
  V(F5_START, 1896, ...E_UGA_REST), // 부뇨로·토로·앙콜레 등(범위 흐림 — 기본값 9), 1896 보호령 확대
  V(F5_START, 1888, ...E_KE_EAST, ...E_KEN, ...E_RIFT), // 케냐 땅(1888 IBEA 칙허 앞)
  V(1895, 1896, ...E_KE_EAST), // 동부주(1895 보호령 서쪽 끝 나이바샤 밖, 1896 우간다 보호령 확대 앞)
  B(1895, 1896, E_RIFT_UNITS.투르카나, E_RIFT_UNITS.동부주), // 같은 해 리프트밸리 서쪽·투르카나
];
// ── F5 E-5 끝 ──

// ── F5 I-5 인도양 섬 (최상위 이름 I_) ──
// 조각 F5_I_IDS(마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹 FR-RE·마요트 FR-YT 2·세인트헬레나 SHN 2 = 65), 구현 F5-I-5
// 새 항목 1: merina-kingdom(1885~1896 마다가스카르 22 − 남서 3 약 465,630 — 기본값 34)
// 앞 잇는 항목 6: F3 french-madagascar(1897~) · F2 british-mauritius·french-comoros(1886~ — F4 R-Q1) · F1 seychelles·reunion·mayotte
// 점프(P1): 1886 코모로 · 1897 메리나 끝(french-madagascar 섬 통째 — 남서 셋도 1897부터)
// 비운 땅: 마다가스카르 남서 셋 1885~1896·코모로 COM 1885·세인트헬레나·어센션 SHN 내내(0단계 기본값 4)
import { F5_I_IDS } from './cuts-f5.mjs';
const I_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 섬별 묶음(칸 안에서 다시 적음 — 합은 F5_I_IDS 65)
const I_MDG_SW = ['MDG-5864', 'MDG-5866', 'MDG-5878']; // 마다가스카르 남서 3(안드로이·아치모안드레파나·메나베 136,288 — 사칼라바·안드로이·바라 등 메리나 밖 정치체, 기본값 34)
const I_MDG = minus(idsOf('MDG'), ...I_MDG_SW); // 마다가스카르 19(약 465,630 — 메리나 왕국 근사 도형, 조사 c 기본값 ⑤)
const I_COM = idsOf('COM'); // 3 — 그랑드코모르섬·앙주앙섬·모엘리섬(1,586)
const I_MYT = ['FR-YT']; // 마요트
const I_REU = ['FR-RE']; // 레위니옹
const I_MUS = idsOf('MUS'); // 14 — 모리셔스섬·로드리게스섬
const I_SYC = idsOf('SYC'); // 22
const I_SHN = idsOf('SHN'); // 2 — SH-HL·SH-AC
{
  const all = [I_MDG_SW, I_MDG, I_COM, I_MYT, I_REU, I_MUS, I_SYC, I_SHN].flat();
  if (all.length !== F5_I_IDS.length || new Set(all).size !== all.length || all.some((id) => !F5_I_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa partition: I-5 묶음 합 ${all.length}개가 F5_I_IDS ${F5_I_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1909 말 모양 = F4 1910 모양(colonial.mjs S2 칸 섬 줄 — 마다가스카르 22 french-madagascar·코모로 3 french-comoros·나머지 같은 항목, SHN 비움)
own(I_MDG, [[F5_START, 'merina-kingdom'], [1897, 'french-madagascar']]); // 1885-12-17 타마타브 조약(외교권만 — 노시베·생트마리·디에고수아레스 프랑스 땅은 1만 밑 근사), 1895-10-01 안타나나리보 함락, 1896-08-06 병합법, 1897-02-28 여왕 폐위(기본값 34)
own(I_MDG_SW, [[F5_START, null], [1897, 'french-madagascar']]); // 1897부터 식민지 색(Q1 (다) — 갈리에니 평정 1905 무렵까지는 명목, mapNote)
own(I_COM, [[F5_START, null], [1886, 'french-comoros']]); // 1886 세 섬 술탄과 보호 조약(F4 창구 ③ R-Q1 — 보호령 섬도 칠함), 1908 마다가스카르 부속·1912 병합은 글
own(I_MYT, [[F5_START, 'mayotte']]); // 1841 프랑스 땅(1843 점유)
own(I_REU, [[F5_START, 'reunion']]); // 프랑스 식민지
own(I_MUS, [[F5_START, 'british-mauritius']]); // 영국 식민지
own(I_SYC, [[F5_START, 'seychelles']]); // 1903 앞은 모리셔스 소속(글 — 특별 지시 12)
// 세인트헬레나·어센션(SHN): 줄을 적지 않아 시대 내내 주인 null
const I_voids = () => [
  V(F5_START, 1897, ...I_MDG_SW), // 마다가스카르 남서: 메리나 밖 사칼라바·안드로이 등 독립 정치체(기본값 34 — 1897부터 프랑스령)
  V(F5_START, 1886, ...I_COM), // 코모로 세 섬: 1886 보호 조약 앞 독립 술탄국들
  V(F5_START, F5_END, ...I_SHN), // 세인트헬레나·어센션 — 영국 해외 영토라 이 권역 나라 땅이 아님(0단계 기본값 4)
];
// ── F5 I-5 끝 ──

// ── F5 S2-5 로디지아·니아살랜드·모잠비크 (최상위 이름 S2_) ──
// 조각 F5_S2_IDS(짐바브웨 10·잠비아 10·말라위 28·모잠비크 11 = 59), 구현 F5-S2-5
// 새 항목 3: ndebele-kingdom(1885~1892 ZW-MN·ZW-MS·ZW-MI·ZW-BU 약 181,000)·lozi-kingdom(1885~1898 ZM-01·ZM-06·ZM-07 341,000)·gaza(1885~1894 MZ-G·MZ-I·MZ-B·MOZ-1927·MOZ-5854 233,500 — 기본값 31)
// 앞 잇는 항목 4: F4 bsac-southern-rhodesia(1890~)·bsac-northern-rhodesia(from 1899 — M-F5-9: 1899 버전은 로지 땅만, 1900~ 북동까지) · F2 nyasaland(from 1891)·portuguese-mozambique
// 점프(P1): 1890 마쇼날랜드(회사령) · 1891 니아살랜드 · 1893 은데벨레 끝(회사령) · 1895 가자 끝 · 1899 로지 끝(bsac-northern-rhodesia — M-F5-9) · 1900 북로디지아 나머지
// 비운 땅: Q1 (다) 첫 조약 앞 조각(니아살랜드 1885~1890 등). 모잠비크·니아사 회사 영지는 portuguese-mozambique 색(기본값 33)
// 사료: 위키 en Barotseland(17세기 성립, 1890 로흐너 양허·1898 롤리 양허, 1899 추밀원령 보호령, 19세기 말 약 390,000 km²), en North-Western Rhodesia(1899-11-28 바로체랜드-북서 로디지아 추밀원령),
//   en Lobengula(1868~1894 재위, 1888-10-30 러드 양허, 1893-10 제1차 마타벨레 전쟁, 1894년 초 사망), en Gaza Empire(1824 소샹가네, 1895 패배), en Gungunhana(1895-12-28 차이미테에서 붙잡힘),
//   en British Central Africa Protectorate(1889 샤이어 고지 보호령 선포, 1891-05 영국 정부 비준, 1907-07-06 니아살랜드), en Company rule in Rhodesia(1890-09-13 개척대 솔즈베리)
import { F5_S2_IDS } from './cuts-f5.mjs';
const S2_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F5_S2_IDS 59)
const S2_MASHONA = ['ZW-MC', 'ZW-ME', 'ZW-MW', 'ZW-MA', 'ZW-MV', 'ZW-HA']; // 6 — 마쇼날랜드(약 210,000)
const S2_MATABELE = ['ZW-MN', 'ZW-MS', 'ZW-MI', 'ZW-BU']; // 4 — 마타벨레랜드(약 181,000)
const S2_LOZI = ['ZM-01', 'ZM-06', 'ZM-07']; // 3 — 로지 왕국(바로체랜드, 341,000 — 문서 약 390,000, 알려진 근사)
const S2_ZMB_REST = minus(idsOf('ZMB'), ...S2_LOZI); // 7 — 잠비아 나머지(약 417,500)
const S2_MWI = idsOf('MWI'); // 28 — 니아살랜드(말라위호 리코마섬·치주물루섬 포함)
const S2_GAZA = ['MZ-G', 'MZ-I', 'MZ-B', 'MOZ-1927', 'MOZ-5854']; // 5 — 가자 제국(233,500)
const S2_MOZ_REST = minus(idsOf('MOZ'), ...S2_GAZA); // 6 — 모잠비크 나머지(약 563,000 — 북부 명목 지배·회사 영지, 키옹가 삼각지대는 MZ-P 안)
{
  const all = [S2_MASHONA, S2_MATABELE, S2_LOZI, S2_ZMB_REST, S2_MWI, S2_GAZA, S2_MOZ_REST].flat();
  const want = new Set(F5_S2_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa partition: S2 나라별 묶음 합 ${all.length}이 F5_S2_IDS ${want.size}와 다름`);
  }
  if (S2_MASHONA.length + S2_MATABELE.length !== idsOf('ZWE').length) throw new Error('sub-saharan-africa partition: S2 짐바브웨 묶음이 ZWE와 다름');
}
own(S2_MASHONA, [[F5_START, null], [1890, 'bsac-southern-rhodesia']]); // 1890-09-13 개척대가 솔즈베리에 국기(그 앞 쇼나 땅은 범위가 흐려 비움 — 기본값 9 잣대)
own(S2_MATABELE, [[F5_START, 'ndebele-kingdom'], [1893, 'bsac-southern-rhodesia']]); // 1893-11 회사군 불라와요 점령, 1894년 초 로벵굴라 사망(기본값 31 — 그해 말 규칙으로 1893부터)
own(S2_LOZI, [[F5_START, 'lozi-kingdom'], [1899, 'bsac-northern-rhodesia']]); // 1899-11-28 바로체랜드-북서 로디지아 추밀원령(M-F5-9 ㉯ — 1899 한 해는 로지 땅만)
own(S2_ZMB_REST, [[F5_START, null], [1900, 'bsac-northern-rhodesia']]); // 1900 북동 로디지아 칙령(북서 로디지아 동쪽 몫도 1900부터 — 1899는 로지 땅만, M-F5-9)
own(S2_MWI, [[F5_START, null], [1891, 'nyasaland']]); // 1889 샤이어 고지 보호령 선포, 1891-05 영국 정부 비준(기본값 27), 1907-07-06 니아살랜드 이름
own(S2_GAZA, [[F5_START, 'gaza'], [1895, 'portuguese-mozambique']]); // 1895 포르투갈 원정, 1895-12-28 응궁구냐네가 차이미테에서 붙잡힘(기본값 31)
own(S2_MOZ_REST, [[F5_START, 'portuguese-mozambique']]); // 북부 내륙은 명목 지배, 모잠비크 회사·니아사 회사(1891~) 영지도 포르투갈령 색(기본값 33)
const S2_voids = () => [
  V(F5_START, 1890, ...S2_MASHONA), // 마쇼날랜드 — 회사 개척대 앞, 쇼나 여러 수장 땅은 범위가 흐림(기본값 9 잣대·Q1 (다))
  V(F5_START, 1900, ...S2_ZMB_REST), // 잠비아 나머지 — 북동·북서 로디지아 칙령 앞(벰바·응고니 등 범위가 흐린 땅, Q1 (다)·M-F5-9)
  V(F5_START, 1891, ...S2_MWI), // 말라위 — 영국령 중앙아프리카 보호령 비준 앞(기본값 27, Q1 (다))
];
// ── F5 S2-5 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F5_START, ...WA_BOUNDS, ...GW_BOUNDS, ...CEN_BOUNDS, ...H_BOUNDS, ...S1A_BOUNDS, ...S1BC_BOUNDS, ...CEE_BOUNDS, ...E_BOUNDS, ...I_BOUNDS, ...S2_BOUNDS, F5_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F5_START || BOUNDS.at(-1) !== F5_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa partition: 표 경계 해 ${BOUNDS.join(', ')}는 ${F5_START}~${F5_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa partition: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa partition: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa partition: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa partition: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa partition: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F5_END) throw new Error(`sub-saharan-africa partition: 마지막 표의 끝이 ${joined.TO} (${F5_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F5_END(1910) 그대로(끝 없음 null을 쓰지 않음 — 1910~는 colonial.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만 걸림): 모든 버전은 F5_START~F5_END 안(1909/1910 이음은 colonial.mjs가 같은 id로)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < F5_START || t === null || t > F5_END)) throw new Error(`sub-saharan-africa partition: ${id}의 버전 기간이 ${F5_START}~${F5_END} 밖(끝 없음 null 금지 — 1910~는 colonial.mjs 몫)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GW_voids(), ...CEN_voids(), ...H_voids(), ...S1A_voids(), ...S1BC_voids(), ...CEE_voids(), ...E_voids(), ...I_voids(), ...S2_voids()];
if (voids.some(([f, t]) => f < F5_START || t === null || t > F5_END)) throw new Error(`sub-saharan-africa partition: 비운 땅의 기간은 ${F5_START}~${F5_END} 안이어야 함(끝 없음 null 금지 — 1910~는 colonial.mjs 몫)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 779개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// F5_START(1885)~F5_END(1910, 미포함)만 만든다(1800~1884는 prepartition.mjs 구역 '사하라 이남 분할 앞 …'이, 1910~는 colonial.mjs 구역 '사하라 이남 식민 …'이 이음 — 특별 지시 2·F6 특별 지시 2. 1799 이하에는 이 권역 구역이 없음).
// 비운 땅이 바뀌는 해마다 구역 하나(F5는 첫 조약 해·Q2·Q3 비움이 해마다 바뀌어 구역이 스무 개 안팎일 수 있음 — 정상), 마지막 구역의 끝은 F5_END. 이름 '사하라 이남 분할 <from>~<to-1>'(F4 '사하라 이남 식민 …'·F3 '사하라 이남 전후 …'·F2 '사하라 이남 탈식민 …'·F1 '사하라 이남 현대 …'와 겹치지 않음).
// 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([F5_START, F5_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => F5_START < y && y < F5_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `사하라 이남 분할 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void U; void geomOfUnit; // 열 칸이 쓰지 않는 이름 경고 막기

export const era = {
  name: 'partition',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F4 colonial.mjs·F3 postwar.mjs·F2 decolonization.mjs·F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
