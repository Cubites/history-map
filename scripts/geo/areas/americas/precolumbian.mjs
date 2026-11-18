// americas 시대 파일 precolumbian (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 아메리카 콜럼버스 이전(1001~1491)
// 짝 항목 파일: data/entities/americas-precolumbian.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 땅 없는 항목 17은 항목 파일에만 있음,
//   앞 잇는 M3 항목 aztec·tarascan·inca는 이 파일이 1001~1491 버전을 내고 항목 블록은 data/entities/americas-colonial.yaml)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 다른 도우미 모듈. areas/americas.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/americas/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/americas.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다 — 권역 파일 joinEras 차례는 과거 시대가 앞: ancient·precolumbian·colonial·independence·modern).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 아메리카 M4 짜임 안내 (M4 뼈대 2026-11-18 — 근거: docs/americas/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 4·5, 창구 ② 9·10), M3 Q4 A·창구 ③ E2·G3-39,
//    M4 창구 ②(Q1 A·Q2 A·Q3 A — border-stages/am-m4/decisions.md), 기본값 G4-1~G4-22, 지시문 am-m4/m4/COMMON.md 2~4절·notes.md C-M4-1~17) ─────────────────
// 등급(00-scope 3절): 일반(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). '주변'은 data/tests/zones.yaml greenland-ice-sheet 안만(땅 5만·선 25/50 km).
// 해 규칙(P1): 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(아즈텍 1472 톨루카 재정복·1479 타라스코에 패배, 잉카 원정, 1480~1510 타라스코의 콜리마·할리스코 점령 — 글, P9).
//   새 버전은 1만 km² 넘게 바뀔 때만. 버전 해는 결정 Q2·Q3가 전부 — aztec 1440·1469·1486, tarascan 1435·1450, inca 1438·1463·1470·1481, chimu 1375(그 밖에 1만 km² 넘게 주인이 바뀌면 칸 결과 노트 2절에 까닭).
//   Q2 잣대: ① 문서가 해를 직접 주면 그 해 ② 앞 대가 끝난 모습은 후임 즉위 해 ③ 문서가 해를 안 주는 한 대 안의 큰 변화는 그 대 가운데 해(M3 1492 앞). 해를 못 닫은 큰 걸음은 알려진 근사(km²·년).
// 1000 앞 버전 없음: 첫 해는 M4_START(1001, 1001년 말 모습). 1000 이하는 M5 ancient.mjs가 −2332~1000(끝 해 = M4_START — 칠한 나라 0, C-M4-16·C-M5-13) — 1001 앞에 성립한 나라(chimu 900)도 이 단계에서는 1001 앞을 칠하지 않는다.
// 끝 해(이음): 이 파일 표의 주인은 1491까지(M4_END = 1492 = M3 colonial.mjs의 M3_START — 아래 확인 줄). 1491 모양 = M3 1492 모양(G4-2 — 모양 점프 0, m4/SKEL-NOTE.md 3절 이음 표):
//   aztec 1486~·tarascan 1450~·inca 1481~ 버전은 M3 1492 줄과 같은 조각 묶음·같은 칼선 별칭·같은 비운 띠로 재현한다(새로 긋지 않음). 같은 모양이면 joinEras가 두 파일 버전을 이어 붙이고
//   사건 검사가 M3 허용 줄 '1492 aztec·tarascan·inca 버전'을 낡았다고 낸다 — 칸이 del/(P6·C-M4-13). 1492에 칠하지 않는 땅(키체·투투테펙·틀락스칼라 밖·무이스카·카리브·북미)은 1491도 비움.
// 칠할 나라(Q1 A): aztec·tarascan·inca(M3 항목에 앞 버전)와 새 chimu 넷뿐. 마야판·믹스텍·톨텍·치첸이트사와 북미·카리브 문화 17은 땅 없는 항목(level region — 항목 파일에만, versions 없음),
//   키체·칵치켈·쿠스코 왕국(1438 앞)·찬카·콜랴·루파카·틀락스칼라·테파넥은 비움(G4-7·G4-19). 치무(Q3 A): from 900·to 1470, 칠함 1375~1469 한 버전, 1001~1374 비움, 1470에 inca 1470 버전이 같은 땅을 이음.
// 손 도형 꼴(C-M4-4·G4-4): 앞 버전 땅은 모두 M3 1492 도형의 부분집합 — I(<M3 손 도형 별칭>, <M4 새 고리 별칭>)로 만들고 ownSplit(…, { from, to })로 조각을 안/밖으로 가른다.
//   같은 나라 버전은 앞이 뒤의 부분집합(아즈텍 1440 ⊂ 1469 ⊂ 1486, 잉카 1438 ⊂ 1463 ⊂ 1470 ⊂ 1481), 치무 땅 ⊂ 잉카 1470·치무 ∩ 잉카 1438·1463 = 0. 안의 독립 땅(틀락스칼라 등)은 구멍 없이(G4-1).
//   한 조각을 두 나라 고리가 함께 지나면(MX-MEX·MX-GRO — 아즈텍·타라스코, 페루 해안 조각 — 치무·잉카) 한 ownSplit에 부분 둘(겹침 0). 고리가 바뀌는 해마다 { from, to }를 나누고 다른 묶음 이름(M2 BNE2_NL 꼴).
// 공통 비운 땅·빈 땅 검사 구역(특별 지시 2·C-M4-2 — 이 파일 공통 줄이 만든다, 칸은 고치지 않음): 칸이 내보내는 <앞머리>_RINGS = [[from, to, 그해 칠하는 땅(교집합 뒤 도형)], …]의 합으로
//   ① 공통 비운 땅 = D(DOMAIN, 그해 RINGS 합)(이유 '1001~1491 칠할 나라 밖 — Q1 A, 결정 9') ② 빈 땅 검사 구역 = I(DOMAIN, 그해 RINGS 합) − 칸 voids(이름 '아메리카 콜럼버스 이전 <from>~<to-1>').
//   고리가 없는 1001~1374는 구역 없음(공통 비운 땅이 권역 바깥선 전부). 칸 voids는 고리 안인데 칠하지 않는 조각 몫만(예 잉카 1481~1491 오리엔테 EC-Z·EC-S·EC-N·AR-M 몫과 M1 1909 띠 — M3 AND3_voids와 같게).
// 늘림 나라: 없음(권역 파일 EXTENDABLE 그대로 — russia 1778~는 M4 기간 밖, M4 창구 ② 자동 승인 0건 — 노르드인 그린란드 정착은 땅 없는 norse-greenland, G4-9). 관계 줄 0(P2·C-M4-7).
// 칸 나눔(지리 칸 셋, 한 라운드): MXC-M4(메소아메리카 — 조각 cuts-m4.mjs M4_MXC_IDS 125)·AND-M4(안데스 — M4_AND_IDS 210)·NAC-M4(북미·카리브·땅 없는 항목 — 조각 없음, 이 파일에 줄 없음).
//   나머지 329조각은 어느 칸도 줄을 쓰지 않는다(fillTables가 주인 null로 채우고 공통 비운 땅이 덮음). 칸 경계는 조각 경계라 고리는 칸을 넘지 않는다.
//   각 칸은 자기 머리 줄('// ── M4 <칸> …')과 그 칸 '끝' 줄 사이에만 쓴다(import·상수·own 줄·ownSplit·RINGS·voids 함수 모두). 최상위 이름은 칸 앞머리 MXC4_·AND4_, import도 별칭(예: MXC4_AZ3),
//   ownSplit 묶음 이름도 앞머리(예: 'MXC4_T'). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·확인 줄·공통 비운 땅·빈 땅 검사 구역·끝 void 줄·era)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
//   M3 colonial.mjs의 칸 묶음 상수(MXC3_AZ_WHOLE·MXC3_AZ_PART·MXC3_BOTH·MXC3_TA_PART·AND3_INCA_IDS 등)는 export되지 않으니 같은 조각 id 목록을 자기 칸 안에 다시 적는다(id 목록은 좌표가 아님).
// 칼선 파일: cuts-m4.mjs에 칸 머리 둘(뼈대는 고리 0 — 자리 이름만: MXC4_CUT_AZ1440·MXC4_CUT_AZ1469·MXC4_CUT_TA1435·AND4_CUT_INCA1438·AND4_CUT_INCA1463·AND4_CUT_INCA1470·AND4_CUT_CHIMU).
//   칸이 고리를 더하면 그 파일 자기 머리 아래 export const <앞머리>_CUT_…으로 쓰고, 이 파일 칸 머리에서 '<앞머리>_CUT_… as <앞머리>_…' 별칭으로 가져온다.
//   M3 손 도형(cuts-m3.mjs MXC3_CUT_AZTEC·MXC3_CUT_TARASCAN·AND3_CUT_INCA)·M1 칼선(cuts-m1.mjs SC_CUT_1909)도 별칭 import로(예 'MXC3_CUT_AZTEC as MXC4_AZ3') — 좌표를 베끼지 않음(check:generator).
//   주석에 'import'+여는 괄호 글자를 쓰지 않는다(check:generator가 동적 import로 잡음).
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 고리가 바뀌는 해를 넣음 — MXC 1435·1440·1450·1469·1486, AND 1375·1438·1463·1470·1481)를 공통 BOUNDS가 합친다(M4_START·M4_END 포함).
//   표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M4_START(1001)부터, 해는 늘어나고 1491 이하(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(['MX-DIF'], [[M4_START, null], [1440, 'aztec']]). ownSplit 부분의 줄 첫 해는 그 묶음의 from. 주인 null은 '이 권역 나라가 칠하지 않는 땅'(고리 밖은 공통 비운 땅, 고리 안은 칸 voids에 이유).
// 시대 경계 맞물림: 앞 시대 M5 ancient.mjs가 −2332~1000(끝 해 = M4_START — 버전 없음·공통 비운 땅 한 줄, 그 파일 확인 줄). 뒤 시대 M3 colonial.mjs는 1492부터 — 이 파일 버전은 모두 1001 이상에서 시작해 1492 이하에서 끝난다(to: null 없음, 아래 확인 줄).
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 americas.mjs의 sourceOf가 table.mjs AM_SOURCE_TEXT를 붙인다(두면 aztec·tarascan·inca 이어 붙이기가 '출처 문구가 다름'으로 멈춤).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(아메리카 첫판·M1·M2·M3·M4 공통·칸 머리)과 m4/SKEL-NOTE.md 끝 공용 표기표를 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M4_MXC_IDS, M4_AND_IDS } from './cuts-m4.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('precolumbian');

const M4_START = 1001; // 이 시대 파일의 첫 해(1001년 말 모습). 그 앞(1000 이하)은 M5 ancient.mjs(그 파일 ANCIENT_END = 이 값)
const M4_END = 1492; // 마지막 표의 끝(미포함) = 뒤 시대 M3의 첫 해
const M3_START = 1492; // M3 시대 파일 colonial.mjs의 M3_START(그 파일은 export하지 않아 값을 여기 적음 — 둘이 다르면 멈춤)
if (M4_END !== M3_START) throw new Error(`americas precolumbian: 끝 해 ${M4_END}가 M3 첫 해 ${M3_START}와 다름(시대 경계 맞물림)`);

// ── 조각 소유표 도우미 (M3 colonial.mjs와 같은 꼴 — M4 뼈대가 옮김, 이름 M4_START·M4_END만 다름. 표 밖 땅 extra는 없음: 손 도형은 조각 안 땅이라 ownSplit) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M4_START || e[0] >= M4_END)) {
    throw new Error(`americas precolumbian: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M4_START} 이상 ${M4_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`americas precolumbian: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M4_START, to = M4_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`americas precolumbian: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`americas precolumbian: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`americas precolumbian: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`americas precolumbian: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`americas precolumbian: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형], to는 M4_END 이하(null 없음). 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
//   고리 밖은 공통 비운 땅이 덮으니 적지 않는다 — 고리 안인데 칠하지 않는 몫만(C-M4-2)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── M4 MXC-M4 메소아메리카·아즈텍·타라스코 앞 버전 (최상위 이름 MXC4_) ──
// 조각 M4_MXC_IDS(= M3 MXC 125), 구현 MXC-M4(1라운드). 줄을 쓰는 것은 손 도형이 지나는 12 — MX-DIF·MX-MOR·MX-TLA(M3 MXC3_AZ_WHOLE)·MX-HID·MX-PUE·MX-VER·MX-OAX(MXC3_AZ_PART)·
//   MX-MEX·MX-GRO(MXC3_BOTH — 아즈텍·타라스코 두 고리)·MX-MIC·MX-JAL·MX-GUA(MXC3_TA_PART). 나머지 113조각은 줄 없음(공통 비운 땅).
// 앞 잇기(블록 americas-colonial.yaml — 이 칸): aztec 1440·1469·1486(1486~1491 = M3 1492 도형)·tarascan 1435·1450(1450~1491 = M3 1492 도형). 새 항목 4는 땅 없음(toltec·chichen-itza·mayapan·mixtec).
// 고리 자리(cuts-m4.mjs MXC-M4 머리): MXC4_CUT_AZ1440·MXC4_CUT_AZ1469·MXC4_CUT_TA1435 — I(MXC3_CUT_AZTEC 별칭, …)·I(MXC3_CUT_TARASCAN 별칭, …). 끝 버전은 M3 MXC 1492 줄(ownSplit 'MXC3_AZ'·'MXC3_BOTH1'·'MXC3_TA'와
//   own MXC3_AZ_WHOLE 줄)을 같은 조각 묶음·같은 별칭으로 재현(묶음 이름은 MXC4_ 앞머리로).
// 기본값: 틀락스칼라는 아즈텍 도형 안 구멍 없이(G3-39·G4-1), 투투테펙·소코누스코·키체는 비움(G4-1·Q1 A), 테파넥 1428~1439 비움(G4-7), 타라스코 1450 앞 해안 띠는 1450 도형에(G4-22).
// 이음(1491 = M3 1492): m4/SKEL-NOTE.md 3절 — aztec 210,017·tarascan 80,709(M3 합치기 4절), 그 밖 이 칸 조각 1491 빈 땅(공통 비운 땅).
import { MXC3_CUT_AZTEC as MXC4_AZ3, MXC3_CUT_TARASCAN as MXC4_TA3 } from './cuts-m3.mjs';
import { MXC4_CUT_AZ1440 as MXC4_K1440, MXC4_CUT_AZ1469 as MXC4_K1469, MXC4_CUT_TA1435 as MXC4_K1435 } from './cuts-m4.mjs';
const MXC4_BOUNDS = [1435, 1440, 1450, 1469, 1486]; // 1435 타라스코 첫 칠함(탕가쑤안 1세 즉위 — Q2 ②)·1440 아즈텍 첫 칠함(몬테수마 1세 즉위)·1450 타라스코 최대(문서 해 — Q2 ①)·1469 악사야카틀 즉위·1486 아우이소틀 즉위(= M3 1492 도형)
// 조각 묶음(M3 colonial.mjs MXC-M3 묶음과 같은 id — 그 파일은 export하지 않아 다시 적음)
const MXC4_AZ_WHOLE = ['MX-DIF', 'MX-MOR', 'MX-TLA']; // 1486~ 아즈텍 도형 안에 통째(멕시코 계곡·모렐로스·틀락스칼라 — G3-39·G4-1)
const MXC4_AZ_PART = ['MX-HID', 'MX-PUE', 'MX-VER', 'MX-OAX']; // 아즈텍 도형이 지나는 조각
const MXC4_BOTH = ['MX-MEX', 'MX-GRO']; // 아즈텍·타라스코 두 도형이 함께 지나는 조각
const MXC4_TA_PART = ['MX-MIC', 'MX-JAL', 'MX-GUA']; // 타라스코 도형이 지나는 조각
const MXC4_ALL = [...MXC4_AZ_WHOLE, ...MXC4_AZ_PART, ...MXC4_BOTH, ...MXC4_TA_PART]; // 줄을 쓰는 12조각
if (MXC4_ALL.length !== 12 || MXC4_ALL.some((id) => !M4_MXC_IDS.includes(id))) throw new Error('americas precolumbian MXC-M4: 줄을 쓰는 조각 12개가 칸 몫(M4_MXC_IDS) 밖');
// 그해 칠하는 땅(교집합 뒤 도형 — 같은 나라는 앞 버전이 뒤 버전의 부분집합이 되게 뒤 버전에서 깎아 만듦)
//   1486~1491 아즈텍 = M3 1492 줄 그대로(통째 셋 + 아즈텍 조각·두 나라 조각의 M3 도형 안), 1450~1491 타라스코 = M3 1492 줄 그대로(두 나라 조각·타라스코 조각의 M3 도형 안)
const MXC4_AZ86 = U(F(...MXC4_AZ_WHOLE), I(F(...MXC4_AZ_PART, ...MXC4_BOTH), MXC4_AZ3));
const MXC4_AZ69 = I(MXC4_AZ86, MXC4_K1469); // 1469~1485 — 멕시코만 중부·믹스테카 알타·게레로 북부까지(틀락스칼라 구멍 없이)
const MXC4_AZ40 = I(MXC4_AZ69, U(F('MX-DIF', 'MX-MOR'), I(F('MX-MEX'), MXC4_K1440))); // 1440~1468 — 멕시코 분지·모렐로스·톨루카 계곡 동쪽 끝
const MXC4_TA50 = U(I(D(F(...MXC4_BOTH), MXC4_AZ3), MXC4_TA3), I(F(...MXC4_TA_PART), MXC4_TA3)); // 1450~1491 — M3 'MXC3_BOTH1'(아즈텍 몫 먼저 뺌)·'MXC3_TA' 나눔과 같은 꼴(두 도형이 맞닿는 선의 미세한 겹침까지 같게)
const MXC4_TA35 = I(MXC4_TA50, MXC4_K1435); // 1435~1449 — 파츠쿠아로·쿠이트세오 호수 분지와 메세타 푸레페차
// 1001~1434: 12조각 모두 주인 없음(줄 없음 — fillTables가 null로 채움, 공통 비운 땅). 테파넥 패권·동맹 초기(1428~1439 분지 안쪽)는 칠하지 않음(G4-7 — 1만 km² 미만)
// 1435~1485: 12조각을 한 묶음으로 기간마다 나눔(고리가 바뀌는 해마다 다른 묶음 이름) — 고리가 지나는 조각을 모두 넣어 빠진 조각이 빈 땅 구역에 잡히지 않게(SKEL-NOTE 6절 ⑤)
const MXC4_S35 = ownSplit('MXC4_S35', MXC4_ALL, [['타라스코', MXC4_TA35]], '밖', { 타라스코: [[1435, 'tarascan']], 밖: [[1435, null]] }, { from: 1435, to: 1440 });
const MXC4_S40 = ownSplit('MXC4_S40', MXC4_ALL, [['아즈텍', MXC4_AZ40], ['타라스코', MXC4_TA35]], '밖', {
  아즈텍: [[1440, 'aztec']], 타라스코: [[1440, 'tarascan']], 밖: [[1440, null]],
}, { from: 1440, to: 1450 });
const MXC4_S50 = ownSplit('MXC4_S50', MXC4_ALL, [['아즈텍', MXC4_AZ40], ['타라스코', MXC4_TA50]], '밖', {
  아즈텍: [[1450, 'aztec']], 타라스코: [[1450, 'tarascan']], 밖: [[1450, null]],
}, { from: 1450, to: 1469 });
const MXC4_S69 = ownSplit('MXC4_S69', MXC4_ALL, [['아즈텍', MXC4_AZ69], ['타라스코', MXC4_TA50]], '밖', {
  아즈텍: [[1469, 'aztec']], 타라스코: [[1469, 'tarascan']], 밖: [[1469, null]],
}, { from: 1469, to: 1486 });
// 1486~1491: M3 1492 줄을 같은 조각 묶음·같은 도형 별칭으로(1491 모양 = M3 1492 모양 — G4-2)
own(MXC4_AZ_WHOLE, [[M4_START, null], [1486, 'aztec']]);
const MXC4_A = ownSplit('MXC4_AZ', MXC4_AZ_PART, [['아즈텍', MXC4_AZ3]], '밖', { 아즈텍: [[1486, 'aztec']], 밖: [[1486, null]] }, { from: 1486, to: M4_END });
const MXC4_B1 = ownSplit('MXC4_BOTH1', MXC4_BOTH, [['아즈텍', MXC4_AZ3], ['타라스코', MXC4_TA3]], '밖', {
  아즈텍: [[1486, 'aztec']], 타라스코: [[1486, 'tarascan']], 밖: [[1486, null]],
}, { from: 1486, to: M4_END });
const MXC4_T = ownSplit('MXC4_TA', MXC4_TA_PART, [['타라스코', MXC4_TA3]], '밖', { 타라스코: [[1486, 'tarascan']], 밖: [[1486, null]] }, { from: 1486, to: M4_END });
const MXC4_RINGS = [ // [[from, to, 그해 칠하는 땅(교집합 뒤 도형)], …] — 공통 비운 땅·빈 땅 검사 구역의 바탕(특별 지시 2)
  [1435, 1450, MXC4_TA35], [1450, M4_END, MXC4_TA50], // 타라스코
  [1440, 1469, MXC4_AZ40], [1469, 1486, MXC4_AZ69], [1486, M4_END, MXC4_AZ86], // 아즈텍 삼각 동맹
];
const MXC4_voids = () => []; // 고리 안인데 칠하지 않는 몫: 없음(틀락스칼라·메스티틀란 등 안의 독립 땅은 구멍 없이 칠함 — G4-1)
void MXC4_S35; void MXC4_S40; void MXC4_S50; void MXC4_S69; void MXC4_A; void MXC4_B1; void MXC4_T; // 나눈 조각 단위 이름(돌려받은 값)은 쓰지 않음 — 고리 밖은 공통 비운 땅
// ── M4 MXC-M4 끝 ──

// ── M4 AND-M4 안데스·잉카 앞 버전·치무 (최상위 이름 AND4_) ──
// 조각 M4_AND_IDS(= M3 AND 210), 구현 AND-M4(1라운드). 줄을 쓰는 것은 M3 잉카 묶음(AND3_PE_I 21·AND3_EC_I 12·AND3_BO_I 6·AND3_CL_I 8)·AND3_PE_09I(PE-CUS·PE-PUN)·AND3_PE_09(PE-MDD·PE-UCA)·
//   AND3_CL_ML(CL-ML)·AND3_AR_I 6과 같은 조각(M3 1492 inca 줄 — ownSplit 'AND3_IN'·'AND3_I09' 등). 나머지는 줄 없음(공통 비운 땅).
// 새 항목: chimu [1375, 1470)(칠함 — 고리 AND4_CUT_CHIMU)·땅 없는 sican-culture·chancay-culture. 앞 잇기(블록 americas-colonial.yaml — 이 칸): inca 1438·1463·1470·1481(1481~1491 = M3 1492 도형).
// 고리 자리(cuts-m4.mjs AND-M4 머리): AND4_CUT_INCA1438·AND4_CUT_INCA1463·AND4_CUT_INCA1470·AND4_CUT_CHIMU — I(AND3_CUT_INCA 별칭, …), 잉카 1463 = D(…, 치무 땅)·1470 = U(…, 치무 땅).
//   끝 버전은 M3 AND 1492 줄(AND3_CUT_INCA·M1 SC_CUT_1909 별칭, 오리엔테 EC-Z·EC-S·EC-N·AR-M과 1909 띠 비움 — C-M4-17)을 같은 조각 묶음·같은 별칭으로 재현.
// 기본값: 쿠스코 왕국(1438 앞)·찬카·콜랴·루파카 비움(Q1 A), 치무 1001~1374 비움(Q3 A — 남쪽 약 6.3만은 알려진 근사), 잉카 V1~V3 넓이 G4-4(칸이 고리로 다시 잼).
// 이음(1491 = M3 1492): m4/SKEL-NOTE.md 3절 — inca 1,677,902(M3 합치기 4절), 그 밖 이 칸 조각 1491 빈 땅(공통 비운 땅 — 무이스카 등).
import { AND3_CUT_INCA as AND4_IN3 } from './cuts-m3.mjs';
import { SC_CUT_1909 as AND4_K1909 } from './cuts-m1.mjs';
import { AND4_CUT_CHIMU as AND4_KCH, AND4_CUT_INCA1438 as AND4_K1438, AND4_CUT_INCA1463 as AND4_K1463, AND4_CUT_INCA1470 as AND4_K1470 } from './cuts-m4.mjs';
// 표 경계 해: 1375 시칸(람바예케) 정복 — 치무 첫 칠함(Q3 A) · 1438 파차쿠티 즉위·찬카 격파 · 1463 투팍 잉카 유팡키 지휘(북쪽 정복 시작) · 1470 치무 정복 · 1481 투팍 잉카 치세(1471~1493) 가운데(Q2 ③ — M3 1492 도형을 앞당김)
const AND4_BOUNDS = [1375, 1438, 1463, 1470, 1481];
// 그해 칠하는 땅(교집합 뒤 도형 — C-M4-4): 앞 버전은 모두 M3 1492 잉카 도형(AND3_CUT_INCA)의 부분집합
//   치무 = M3 도형 ∩ 치무 고리, 에콰도르 쪽(로하·엘오로 조각 — 고리 끝이 국경을 넘은 몫 약 2천 km²)은 뺌(치무 북쪽 끝은 툼베스 골짜기)
//   잉카 1438 = M3 도형 ∩ 1438 고리 · 1463 = M3 도형 ∩ 1463 고리 − 치무 · 1470 = M3 도형 ∩ 1470 고리 ∪ 1463 땅 ∪ 치무(1469→1470 점프 0, 1463 ⊂ 1470)
const AND4_CH = D(I(AND4_IN3, AND4_KCH), F('EC-L', 'EC-O'));
const AND4_V1 = I(AND4_IN3, AND4_K1438);
const AND4_V2 = D(I(AND4_IN3, AND4_K1463), AND4_CH);
const AND4_V3 = U(I(AND4_IN3, AND4_K1470), AND4_V2, AND4_CH);
const AND4_RINGS = [[1375, 1470, AND4_CH], [1438, 1463, AND4_V1], [1463, 1470, AND4_V2], [1470, 1481, AND4_V3], [1481, M4_END, AND4_IN3]];
// 조각 묶음(id 목록 — M3 colonial.mjs AND-M3 머리의 묶음과 같은 조각, 상수는 export되지 않아 다시 적음)
const AND4_PE_I = ['PE-AMA', 'PE-ANC', 'PE-APU', 'PE-ARE', 'PE-AYA', 'PE-CAJ', 'PE-CAL', 'PE-HUC', 'PE-HUV', 'PE-ICA', 'PE-JUN', 'PE-LAL', 'PE-LAM', 'PE-MOQ', 'PE-PAS', 'PE-PIU', 'PE-SAM', 'PE-TAC', 'PE-TUM', 'PER-587', 'PER-591'];
const AND4_EC_I = ['EC-A', 'EC-B', 'EC-F', 'EC-G', 'EC-H', 'EC-L', 'EC-T', 'EC-O', 'EC-P', 'EC-R', 'EC-SD', 'EC-X']; // EC-T = 퉁구라우아주(안데스 고원. 2026-11-18 조각 이름표 바로잡기 앞에는 EC-N으로 적었음)
const AND4_BO_I = ['BO-L', 'BO-O', 'BO-P', 'BO-C', 'BO-H', 'BO-T']; // 라파스·오루로·포토시·코차밤바·추키사카·타리하
const AND4_CL_I = ['CL-TA', 'CL-AP', 'CL-AN', 'CL-AT', 'CL-CO', 'CL-VS', 'CL-RM', 'CL-LI']; // 칠레 북~중부(마울레강 북쪽)
const AND4_INCA_IDS = [...AND4_PE_I, ...AND4_EC_I, ...AND4_BO_I, ...AND4_CL_I];
const AND4_PE_09I = ['PE-CUS', 'PE-PUN']; // 쿠스코·푸노 — 잉카 땅과 M1 1909 띠(볼리비아 청구 띠 — 내내 비움)가 함께 지나감
const AND4_CL_ML = ['CL-ML']; // 마울레 — 마울레강이 잉카 남쪽 끝
const AND4_AR_I = ['AR-Y', 'AR-A', 'AR-T', 'AR-K', 'AR-F', 'AR-J']; // 후후이·살타·투쿠만·카타마르카·라리오하·산후안
const AND4_ALL = [...AND4_INCA_IDS, ...AND4_PE_09I, ...AND4_CL_ML, ...AND4_AR_I];
if (AND4_ALL.length !== 56 || new Set(AND4_ALL).size !== 56 || AND4_ALL.some((id) => !M4_AND_IDS.includes(id))) throw new Error('americas precolumbian AND-M4: 잉카 조각 56개가 M4_AND_IDS 안에 한 번씩이어야 함');
// 고리가 지나는 조각(그해 땅과 겹치는 것만 — 잰 값은 칸 결과 노트 3절)
const AND4_CH_IDS = ['PE-ANC', 'PE-CAJ', 'PE-LAL', 'PE-LAM', 'PE-PIU', 'PE-TUM', 'PER-587', 'PER-591']; // 치무(에콰도르 조각은 뺌)
const AND4_V1_IDS = ['PE-APU', 'PE-ARE', 'PE-AYA', 'PE-HUV', 'PE-ICA']; // 잉카 1438(+ 쿠스코·푸노 — 띠 먼저)
// 잉카 1463과 치무가 함께 지나는 조각(PE-ANC·PE-CAJ·PE-LAL·PE-LAM·PER-591) — 1463~1469는 치무 8조각을 한 ownSplit에 부분 둘로(치무 땅 단위를 1375~1462와 같은 조각 묶음으로 두어 도형 바이트가 같게)
const AND4_V2_IDS = ['BO-C', 'BO-L', 'BO-O', 'BO-P', 'PE-AMA', 'PE-APU', 'PE-ARE', 'PE-AYA', 'PE-HUC', 'PE-HUV', 'PE-ICA', 'PE-JUN', 'PE-MOQ', 'PE-PAS', 'PE-SAM', 'PE-TAC', 'CL-AP', 'CL-TA'];
const AND4_V3_IDS = [...AND4_V2_IDS, ...AND4_CH_IDS, 'PE-CAL', ...AND4_EC_I]; // 잉카 1470(오리엔테 EC-S·EC-N·EC-Z는 통째 비움 — 1481~와 같게)
if ([...AND4_V3_IDS, ...AND4_PE_09I].some((id) => !AND4_ALL.includes(id))) throw new Error('americas precolumbian AND-M4: 앞 버전 조각은 잉카 조각 56 안이어야 함(부분집합)');
const AND4_C = 'chimu';
// 1375~1437 치무(1001~1374는 통째 비움 — 핵심 모체·치카마 골짜기는 1만 km² 밑, Q3 A)
ownSplit('AND4_CH_A', AND4_CH_IDS, [['치무', AND4_CH]], '밖', { 치무: [[1375, AND4_C]], 밖: [[1375, null]] }, { from: 1375, to: 1438 });
// 1438~1462 치무 + 잉카(쿠스코·아푸리막·찬카 땅)
ownSplit('AND4_CH_B', AND4_CH_IDS, [['치무', AND4_CH]], '밖', { 치무: [[1438, AND4_C]], 밖: [[1438, null]] }, { from: 1438, to: 1463 });
ownSplit('AND4_V1', AND4_V1_IDS, [['안', AND4_V1]], '밖', { 안: [[1438, 'inca']], 밖: [[1438, null]] }, { from: 1438, to: 1463 });
ownSplit('AND4_V1_P09', AND4_PE_09I, [['띠', AND4_K1909], ['안', AND4_V1]], '밖', { 띠: [[1438, null]], 안: [[1438, 'inca']], 밖: [[1438, null]] }, { from: 1438, to: 1463 });
// 1463~1469 치무 + 잉카(카하마르카에서 티티카카호·포오포호까지, 해안 친차~타라파카)
ownSplit('AND4_CH_C', AND4_CH_IDS, [['치무', AND4_CH], ['안', AND4_V2]], '밖', { 치무: [[1463, AND4_C]], 안: [[1463, 'inca']], 밖: [[1463, null]] }, { from: 1463, to: 1470 }); // 안 = 잉카 1463(PE-PIU·PE-TUM·PER-587은 빈 몫)
ownSplit('AND4_V2', AND4_V2_IDS, [['안', AND4_V2]], '밖', { 안: [[1463, 'inca']], 밖: [[1463, null]] }, { from: 1463, to: 1470 });
const AND4_V2P = ownSplit('AND4_V2_P09', AND4_PE_09I, [['띠', AND4_K1909], ['안', AND4_V2]], '밖', { 띠: [[1463, null]], 안: [[1463, 'inca']], 밖: [[1463, null]] }, { from: 1463, to: 1470 });
// 1470~1480 잉카(치무 땅·리마 계곡·키토 분지까지 — 치무 1470 끝)
ownSplit('AND4_V3', AND4_V3_IDS, [['안', AND4_V3]], '밖', { 안: [[1470, 'inca']], 밖: [[1470, null]] }, { from: 1470, to: 1481 });
const AND4_V3P = ownSplit('AND4_V3_P09', AND4_PE_09I, [['띠', AND4_K1909], ['안', AND4_V3]], '밖', { 띠: [[1470, null]], 안: [[1470, 'inca']], 밖: [[1470, null]] }, { from: 1470, to: 1481 });
// 1481~1491 잉카 = M3 1492 줄 그대로(같은 조각 묶음·같은 별칭·같은 비운 띠 — 1491 모양 = M3 1492 모양, G4-2)
ownSplit('AND4_INCA', AND4_INCA_IDS, [['안', AND4_IN3]], '밖', { 안: [[1481, 'inca']], 밖: [[1481, null]] }, { from: 1481, to: M4_END });
const AND4_I09 = ownSplit('AND4_INCA_P09', AND4_PE_09I, [['띠', AND4_K1909], ['안', AND4_IN3]], '밖', { 띠: [[1481, null]], 안: [[1481, 'inca']], 밖: [[1481, null]] }, { from: 1481, to: M4_END });
ownSplit('AND4_INCA_ML', AND4_CL_ML, [['안', AND4_IN3]], '밖', { 안: [[1481, 'inca']], 밖: [[1481, null]] }, { from: 1481, to: M4_END });
ownSplit('AND4_INCA_AR', AND4_AR_I, [['안', AND4_IN3]], '밖', { 안: [[1481, 'inca']], 밖: [[1481, null]] }, { from: 1481, to: M4_END });
// 고리 안인데 칠하지 않는 몫(고리 밖은 공통 비운 땅 — C-M4-2·C-M4-17, M3 AND3_voids 1492 몫과 같게)
const AND4_voids = () => [
  B(1463, 1470, AND4_V2P.띠), B(1470, 1481, AND4_V3P.띠), B(1481, M4_END, AND4_I09.띠), // 1909 폴로–산체스 부스타만테 조약 앞 마드레데디오스·푸루스 띠(M3·M2·M1과 같음 — 내내 비움)
  V(1470, M4_END, 'EC-S', 'EC-N', 'EC-Z'), // 에콰도르 오리엔테(모로나산티아고·나포·사모라친치페 — 잉카 도형이 동쪽 기슭에 걸친 몫, 1563 키토 아우디엔시아 앞 원주민 땅)
  V(1481, M4_END, 'AR-M', 'BO-S'), // 멘도사(우스파야타 북쪽 끝)·산타크루스(사마이파타 둘레 — 치리과노 변경) — M3 1492와 같이 비움
];
// ── M4 AND-M4 끝 ──

// NAC-M4(북미·그린란드·카리브·땅 없는 항목 11)는 이 파일에 줄이 없다(조각·고리 0 — 항목 파일 블록과 줄 목록 파일만).

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M4_START, ...MXC4_BOUNDS, ...AND4_BOUNDS, M4_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M4_START || BOUNDS.at(-1) !== M4_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`americas precolumbian: 표 경계 해 ${BOUNDS.join(', ')}는 ${M4_START}~${M4_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`americas precolumbian: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`americas precolumbian: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`americas precolumbian: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`americas precolumbian: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`americas precolumbian: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// ── 소유표 → 버전·비운 땅·빈 땅 검사 구역 (공통) ─────────────────────────────
const joined = joinTables(TABLES);
if (joined.TO !== M4_END) throw new Error(`americas precolumbian: 마지막 표의 끝이 ${joined.TO} (${M4_END}이어야 함)`);
// 버전: 표 줄의 단위 목록이 같은 기간이 한 버전. 끝은 M4_END(1492 — to: null 없음, M3가 1492부터 이음).
// 앞 권역 도형 빼기는 없다(1001~1491 이 권역 조각과 겹치는 앞 권역 도형 0 — 유럽 norway-medieval은 그린란드를 칠하지 않음, m4/SKEL-NOTE.md 3절, prev.mjs 없음)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, units]) => [from, to, build(units)])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M4_START 이상에서 시작해 M4_END 이하에서 끝남(to: null 없음 — M3 colonial.mjs가 1492부터 이음, joinEras '기간이 겹침' 앞에 까닭을 밝힘)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < M4_START || !Number.isInteger(t) || t > M4_END)) throw new Error(`americas precolumbian: ${id} 버전이 ${M4_START}~${M4_END} 밖(끝 ${M4_END} 이하 — M3가 1492부터 이음)`);
}

// 칸이 내보낸 고리(그해 칠하는 땅): [from, to, 도형] — from·to는 정수, M4_START 이상·M4_END 이하
const RINGS = [...MXC4_RINGS, ...AND4_RINGS];
for (const r of RINGS) if (!Array.isArray(r) || !(Number.isInteger(r[0]) && Number.isInteger(r[1]) && M4_START <= r[0] && r[0] < r[1] && r[1] <= M4_END) || !Array.isArray(r[2])) throw new Error(`americas precolumbian: 고리 한 줄 [${r?.[0]}, ${r?.[1]})이 틀림 — [from, to, 도형], ${M4_START} 이상·끝 ${M4_END} 이하`);
const ringsIn = (from, to) => RINGS.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게)
//   ① 공통 비운 땅(이 줄 — 칸은 고치지 않음): 해 구간마다 D(DOMAIN, 그해 고리 합) — 1001~1491 칠할 나라 밖(Q1 A, 결정 9: 1492 이전은 학계 합의가 있는 큰 나라만). 고리가 없으면 권역 바깥선 전부
//   ② 칸 voids: 고리 안인데 칠하지 않는 조각 몫(이유는 칸 줄 주석에)
const ringYears = [...new Set([M4_START, M4_END, ...RINGS.flatMap(([f, t]) => [f, t])])].sort((a, b) => a - b);
const commonVoids = ringYears.slice(0, -1).map((from, i) => {
  const to = ringYears[i + 1];
  const active = ringsIn(from, to);
  return [from, to, active.length ? D(DOMAIN, ...active) : DOMAIN];
});
const cellVoids = [...MXC4_voids(), ...AND4_voids()];
const voids = [...commonVoids, ...cellVoids];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M4_START && Number.isInteger(t) && f < t && t <= M4_END)) throw new Error(`americas precolumbian: 비운 땅 기간 [${f}, ${t}) (${M4_START} 이상, 끝은 ${M4_END} 이하 — null 없음, 1492~는 M3)`);

// 빈 땅 검사 구역(특별 지시 2·C-M4-2): 해 구간마다 I(DOMAIN, 그해 고리 합) − 그해 칸 voids — 고리 안 땅은 이 권역 나라가 칠해야 하고 빈 곳이 없어야 한다(고리를 가르는 조각을 빠뜨린 구멍을 잡음).
// 고리가 없는 기간(1001~1374 — 뼈대에서는 1001~1491 전부)은 구역 없음. 모두 끝이 있다(1492~는 M3 구역). gaps.txt에 '아메리카' 줄을 넣지 않는다
const gapYears = [...new Set([...ringYears, ...cellVoids.flatMap(([f, t]) => [f, t])])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  const active = ringsIn(from, to);
  if (!active.length) return [];
  const inner = I(DOMAIN, active.length > 1 ? U(...active) : active[0]);
  const cut = cellVoids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `아메리카 콜럼버스 이전 ${from}~${to - 1}`, zone: R4(cut.length ? D(inner, ...cut) : inner), from, to }];
});

// 두 칸이 쓰지 않는 이름 경고 막기(칸이 쓰기 시작한 이름은 합치기가 지움)
void idsOf; void minus; void geomOfUnit;

export const era = {
  name: 'precolumbian',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 americas.mjs의 sourceOf(table.mjs AM_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
