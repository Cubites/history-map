// central-asia 시대 파일 ancient-bc (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 799~1: 아케메네스·그리스-박트리아·월지·오손·강거·차사
// 짝 항목 파일: data/entities/central-asia-ancient-bc.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 다른 시대 파일 항목(C3 ferghana-kingdom 등)·늘린 나라는 그 파일 그대로)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/central-asia.mjs가 shared.mjs의 joinEras로 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다. 권역 파일 시대 목록 [ancientBcEra, lateAntiquityEra, earlyMedievalEra, highMedievalEra, lateMedievalEra, earlyModernEra, modernEra](과거 먼저)
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도 — 기원전 N년 = 1−N, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source·trims는 두지 않는다(C1~C3 era와 같음 — joinEras가 이어 붙이도록, 깎기는 C4에 없음)
//
// ── 중앙아시아 C4 짜임 안내 (C4 뼈대 2026-11-07 — 근거: docs/central-asia/00-scope.md, C4 권장안 결정 Q1~Q11(Q3·Q10 빼고)·운영자 답 E1~E4·기본값 B1~B26 — ca4/c4/COMMON.md 2·3절) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 다섯 구역(taklamakan-desert·karakum-desert·kyzylkum-desert·betpak-dala·ustyurt-plateau) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습(조약 해, 없으면 실효 지배가 굳은 해). 원정·약탈·되돌려진 점령·명목 복속은 칠하지 않음. 그 나라 땅이 아니면 비운다(voids에 이유). 새 버전은 1만 km² 넘게 바뀔 때만.
// 칸(부딪침 막기, COMMON 4절): 칸 경계는 조각 경계(신장은 E 칸 혼자)라 칼선은 칸을 넘지 않는다. 각 칸은 이 파일의 자기 칸 머리('C4 <칸> …' 겹줄 머리)와 그 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수 모두). 최상위 이름·import 별칭·ownSplit 묶음 이름은 칸 앞머리: SW(C4SW_ — 서남: 아프가니스탄 34·UZ-SU·TJ-KT·TJ-DU·TJ-GB·TJK-368 — 39조각) · W(C4W_ — 서: 트란스옥시아나·호라즘·마르기아나·페르가나·타슈켄트 — UZ 13·TJ-SU·TM-A B D L M·KG-B J O 22조각) · N(C4N_ — 북: 카자흐 초원·세미레치예·키르기스 북부 — KZ 14·KAZ-3207·KAZ-4829·KAB·KG-C GB N T Y 22조각) · E(C4E_ — 동: 신장 CN-XJ 한 조각(칼선으로 나눔)).
//   자기 몫이 아닌 조각은 줄을 적지 않는다(fillTables가 주인 null로 채움). 칸 밖 공통 줄(import·도우미·BOUNDS·표 만들기·버전·맞물림 검사·빈 땅 검사 구역)은 고치지 않는다(결과 노트 6절).
//   칸 조각 목록은 ./cuts-c4.mjs의 C4_SW_IDS·C4_W_IDS·C4_N_IDS·C4_E_IDS(칸 땅 직접 재기의 --pieces도 이 목록).
// 칼선·도형 상수: C1·C2 상수는 ./cuts.mjs, C3 칼선은 ./cuts-c3.mjs, C4 새 칼선은 ./cuts-c4.mjs(칸마다 자기 머리 아래 <앞머리>CUT_…)에 둔다.
//   자기 앞머리 별칭으로 가져온다: import { E_S_ILI as C4E_S_ILI } from './cuts.mjs' · import { W1A_CUT_MERV as C4W_CUT_MERV } from './cuts-c3.mjs'. 좌표를 베끼지 않는다(check:generator).
// 앞 권역 나라 늘리기(권역 파일 EXTENDABLE — 칸은 그 파일을 고치지 않음, 값은 [첫 해, 끝 해(미포함)]):
//   achaemenid-empire [−538, −328)·macedonia-kingdom [−328, −315)(E1)·seleucid-empire [−304, −247)·maurya-empire [−304, −183)·indo-greek-kingdom [−183, −83)(E1)·parthian-empire [−154, 224)·
//   kushan-empire [30, 240)·kushano-sasanian-kingdom [240, 360)·kidarite-kingdom [360, 470)·alchon-huns [470, 565)·sasanian-empire [224, 651)(C3 [600, 651)을 넓힘).
//   칸별: SW 열하나(마우리아·인도-그리스·쿠샨·쿠샨샤르·키다라·알촌은 SW만) / W 아케메네스·마케도니아·셀레우코스·파르티아·사산 / N·E 없음.
//   중국 왕조·흉노·선비·유연·돌궐·토욕혼·인도-스키타이·인도-파르티아는 칠하지 않는다(운영자 답 E2·E3 — 주인으로 쓰면 늘림 줄이 없어 생성기가 멈춤).
//   늘릴 땅은 그해 원래 도형과 겹치면 안 된다(1 km² 넘으면 멈춤) — 이 시대 이 권역 안 원래 도형은 신장 동쪽 띠뿐(서·카자흐 0 km² — ca4/c4/skel/prev-overlap.txt).
// 다른 권역 도형 빼기: ./prev.mjs의 prevMinusOf(from, to, except)·prevListOf(id). 이 시대 신장 안: 중국 왕조 띠 1,393 km²(qin·western-han·xin·eastern-han·cao-wei·western-jin·former-liang·former-qin·later-liang-lu·
//   western-liang·northern-liang·northern-wei·western-wei·northern-zhou·sui)·유목 채우기 2,250(xiongnu −317~90·xianbei 91~401·rouran 402~551·gokturk 552~582·eastern-turks)·tuyuhun 21,292(329~608) — C4 뼈대가 PREV_IDS에 더함.
// 시대 경계 맞물림(COMMON 3절): 앞·뒤 시대가 이어 그리는 항목은 이 시대 끝 해까지 칠하고 다음 시대 첫 해부터 이어 칠한다 — 아래 SEAM_OUT(마지막 버전 to = ERA_END)·SEAM_IN(첫 버전 from = ERA_START)이 확인한다.
//   같은 id는 경계 앞뒤에 같은 조각·같은 칼선 상수로 그린다(대칭차 목표 0 — ca4/c4/skel/seam.mjs <사본> <뒤 해> <id…>로 잰다). 뒤 시대: late-antiquity.mjs
// 표 경계 해: 칸마다 <앞머리>BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(ERA_START·ERA_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = COMMON 2·3절 결정 해(주인이 바뀌는 첫 해) + 신장은 앞 권역 도형이 바뀌는 해. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 ERA_START(-799)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';
import { C4_SW_IDS, C4_W_IDS, C4_N_IDS, C4_E_IDS } from './cuts-c4.mjs'; // 칸 조각 목록(칸 땅 직접 재기·칸 안 확인용)

const { build, geomOfUnit, joinTables, makeTable } = tableKit('ancient-bc');

const ERA_START = -799; // 이 시대 파일의 첫 해(기원전 800년 말 모습) — 00-scope 기본값 12·C4 B1. 첫 칠함은 −538(아케메네스), 그 앞은 비움
const ERA_END = 1; // 마지막 표의 끝(미포함) = late-antiquity.mjs의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < ERA_START || e[0] >= ERA_END)) {
    throw new Error(`central-asia ancient-bc: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${ERA_START} 이상 ${ERA_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia ancient-bc: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = ERA_START, to = ERA_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia ancient-bc: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia ancient-bc: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia ancient-bc: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia ancient-bc: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia ancient-bc: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── C4 SW 서남 (아프가니스탄 34·UZ-SU·TJ-KT·TJ-DU·TJ-GB·TJK-368 — 39조각 — 최상위 이름 C4SW_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-SW.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 표 경계 해: −538 키루스 동방(아케메네스) · −328 알렉산드로스의 박트리아 장악(마케도니아 — 아케메네스 마지막 칠한 해 −329, 맞춤 M1) · −315 디아도코이 공백(Q2) · −304 셀레우코스–마우리아 조약 ·
//   −249 디오도토스 독립(B4) · −247 아리아 그리스-박트리아(Q4) · −183 인도-그리스(E1) · −154 파르티아 미트리다테스 1세의 아리아(Q4) · −129 월지(B6) · −83 인도-그리스가 카불·아라코시아를 잃음(B7·E2)
const C4SW_BOUNDS = [-538, -328, -315, -304, -249, -247, -183, -154, -129, -83];
// 짜임(SW 칸 2026-11-07): 단위는 C3 W1A와 같은 조각·같은 나눔 묶음(599↔600 같은 모양 — 맞춤 M7). 이 칸 땅 안 앞 권역 도형은 0 km²(뼈대 측정)라 떼지 않는다.
//   나눔 묶음 = C3 W1A_AF_IDS·W1A_AF_PARTS 그대로(하자라자트·카피리스탄·시스탄·헬만드·자불·카불, 나머지 '사막' = 헬만드 칼선 밖 니므로즈·파라·헬만드·칸다하르주 — C3 모든 시대와 같이 비움)
import { W1A_AF_IDS as C4SW_AF_IDS, W1A_AF_PARTS as C4SW_AF_PARTS } from './cuts-c3.mjs';
const C4SW_AF = ownSplit('C4SW_아프간B', C4SW_AF_IDS, C4SW_AF_PARTS, '사막');
// 땅 묶음(조각·나눈 부분)
const C4SW_BN = ['AF-BAL', 'AF-SAM', 'AF-KDZ', 'AF-TAK', 'AF-BGL', 'AF-JOW', 'AF-SAR', 'AF-FYB', 'UZ-SU', 'TJ-KT', 'TJ-DU', 'TJK-368']; // 박트리아 북(토하리스탄 — C3 tokhara-yabghus 600 열두 조각)
const C4SW_ARIA_IDS = ['AF-HER', 'AF-BDG']; // 아리아(헤라트·바드기스)
const C4SW_ARACH = [C4SW_AF.헬만드, C4SW_AF.자불, 'AF-ZAB', 'AF-PIA', 'AF-KHO']; // 아라코시아(헬만드·아르간다브 골짜기의 칸다하르·라슈카르가와 자불·가즈니·팍티카·호스트 — 칸다하르주 헬만드 칼선 밖 레지스탄 쪽은 '사막')
const C4SW_KABUL = [C4SW_AF.카불, C4SW_AF.카피리스탄, 'AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AF-NUR', 'AF-PKA', 'AF-WAR', 'AFG-1769', 'AFG-1772']; // 카불(파로파미사다이 — 카불·카피사·파르완·로가르·와르다크·낭가르하르·라그만·쿠나르·누리스탄·팍티아)
const C4SW_HAZ = [C4SW_AF.하자라자트, 'AF-BAM', 'AF-GHO', 'AFG-1753']; // 하자라자트(바미안·구르·다이쿤디와 가즈니·우루즈간 산지)
// 그해 말 주인 줄(근거는 결과 노트 2절, 천문 연도 — 기원전 N년 = 1−N):
//   박트리아 북: 키루스 동방 −538 · 알렉산드로스 −328(운영자 답 E1) · 디아도코이 −315 비움(Q2) · 셀레우코스 −304 · 디오도토스 −249(B4) · 월지 −129(B6, 29까지 — late-antiquity가 이어 칠함)
own(C4SW_BN, [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, 'macedonia-kingdom'], [-315, null], [-304, 'seleucid-empire'], [-249, 'greco-bactrian-kingdom'], [-129, 'yuezhi']]);
//   아리아: 아케메네스 · −328~−305 비움(마케도니아 늘림 승인 범위 밖 — 맞춤 M2) · 셀레우코스 −304 · 그리스-박트리아 −247 · 파르티아 −154(미트리다테스 1세, Q4 — 223까지 late-antiquity가 이어 칠함)
own(C4SW_ARIA_IDS, [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, null], [-304, 'seleucid-empire'], [-247, 'greco-bactrian-kingdom'], [-154, 'parthian-empire']]);
//   드랑기아나(시스탄 — 헬만드 칼선 안 자란즈·파라): 아케메네스 · −328 비움(M2) · 셀레우코스 −304 · −247 비움(Q4 — 파르티아·인도-스키타이는 칠하지 않음, 운영자 답 E2)
own([C4SW_AF.시스탄], [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, null], [-304, 'seleucid-empire'], [-247, null]]);
//   아라코시아·카불: 아케메네스 · −328 비움(M2) · 마우리아 −304(셀레우코스–마우리아 조약) · 인도-그리스 −183(E1) · −83 비움(인도-스키타이·인도-파르티아는 칠하지 않음 — B7·E2)
own([...C4SW_ARACH, ...C4SW_KABUL], [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, null], [-304, 'maurya-empire'], [-183, 'indo-greek-kingdom'], [-83, null]]);
//   하자라자트: 아케메네스만(Q11) · −328부터 비움
own(C4SW_HAZ, [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, null]]);
// 시대 내내 주인 없음(줄을 적지 않음): AF-BDS·TJ-GB(바다흐샨·파미르)와 사막(헬만드 칼선 밖) — 까닭은 아래 voids
const C4SW_G = (...units) => U(...units.map((u) => (u.includes('/') ? geomOfUnit(u) : F(u)))); // 조각 id·나눈 부분 이름을 한 도형으로
const C4SW_voids = () => [
  // 시대 내내: 바다흐샨·파미르(실효 지배 근거 없음 — B3)·헬만드 칼선 밖 사막(다시티마르고·가우디지레·레지스탄과 파라주 북쪽·칸다하르주 북쪽 산지 — 오아시스 나라의 땅 밖, C3 모든 시대와 같은 비움)
  [ERA_START, ERA_END, C4SW_G('AF-BDS', 'TJ-GB', C4SW_AF.사막)],
  // −799~−539: 키루스 동방 원정 앞 — 이 땅에 그릴 나라가 사료에 없음(B1)
  [ERA_START, -538, C4SW_G(...C4SW_BN, ...C4SW_ARIA_IDS, C4SW_AF.시스탄, ...C4SW_ARACH, ...C4SW_KABUL, ...C4SW_HAZ)],
  // −328~−305 아리아·드랑기아나·아라코시아·카불: −328~−316은 마케도니아 늘림 승인 범위 밖(운영자 답 E1 — 승인은 박트리아·소그디아나·마르기아나만), −315~−305는 디아도코이 공백(Q2)
  [-328, -304, C4SW_G(...C4SW_ARIA_IDS, C4SW_AF.시스탄, ...C4SW_ARACH, ...C4SW_KABUL)],
  // −315~−305 박트리아 북: 디아도코이 공백(Q2 — 셀레우코스의 동방 원정 311~302, 박트리아는 조약 뒤에야 셀레우코스 땅)
  [-315, -304, C4SW_G(...C4SW_BN)],
  // −328~0 하자라자트: 산지 — 아케메네스 뒤 실효 지배 근거 없음(Q11)
  [-328, ERA_END, C4SW_G(...C4SW_HAZ)],
  // −247~0 드랑기아나(시스탄): 그리스-박트리아·파르티아의 실효 지배가 불분명하고 사카(인도-스키타이)는 칠하지 않음(Q4·운영자 답 E2)
  [-247, ERA_END, C4SW_G(C4SW_AF.시스탄)],
  // −83~0 아라코시아·카불: 인도-스키타이·인도-파르티아는 칠하지 않음(B7·운영자 답 E2)
  [-83, ERA_END, C4SW_G(...C4SW_ARACH, ...C4SW_KABUL)],
];
// ── C4 SW 끝 ──

// ── C4 W 서 (트란스옥시아나·호라즘·마르기아나·페르가나·타슈켄트 — UZ 13·TJ-SU·TM-A B D L M·KG-B J O 22조각 — 최상위 이름 C4W_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-W.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 표 경계 해: −538 키루스 동방(아케메네스 — 소그디아나·마르기아나·호라즘) · −335 호라즘 독립(다레이오스 3세 때 — 아케메네스 호라즘 끝 −336, 결정 Q1) · −328 알렉산드로스의 소그디아나·마르기아나(운영자 답 E1, 맞춤 M1) ·
//   −315 디아도코이 공백(Q2) · −304 셀레우코스의 마르기아나(바빌론 전쟁 뒤) · −247 그리스-박트리아의 마르기아나(Q4) · −228 에우티데모스 1세의 소그디아나·페르가나(B5, 맞춤 M5) ·
//   −154 파르티아 미트리다테스 1세의 메르브(Q4) · −144 사카가 그리스-박트리아 북쪽을 덮침(소그디아나·페르가나 비움 — Q5) · −129 대완(장건 보고 — Q5) · −127 강거(장건 보고 — B13)
const C4W_BOUNDS = [-538, -335, -328, -315, -304, -247, -228, -154, -144, -129, -127];
// 짜임(W 칸 2026-11-07): 단위는 C3 W1A·W1T와 같은 조각·같은 칼선·같은 나눔 차례(599↔600 같은 모양 — 맞춤 M7). 이 칸 땅 안 앞 권역 도형은 0 km²(뼈대 측정)라 떼지 않는다. 새 칼선 없음.
//   나눔 묶음: 투르크멘(C3 W1A_TM_IDS·W1A_TM_PARTS — 메르브·아할·아무, 나머지 카라쿰)·호라즘(W1A_KH_IDS·W1A_KH_PARTS — 호라즘, 나머지 밖)·
//   부하라·나보이(C1 키질쿰 칼선 남쪽 오아시스)·카슈카다리야(C3 오아시스 칼선)·소그드주(C1 위 자라프샨 → 후잔드 동쪽 페르가나 → C3 우스루샤나, 나머지 후잔드)·지작(C3 우스루샤나 칼선)
import { W1A_TM_IDS as C4W_TM_IDS, W1A_TM_PARTS as C4W_TM_PARTS, W1A_KH_IDS as C4W_KH_IDS, W1A_KH_PARTS as C4W_KH_PARTS, W1T_CUT_KASHKA as C4W_CUT_KASHKA, W1T_CUT_USTRU as C4W_CUT_USTRU } from './cuts-c3.mjs';
import { W_CUT_BUKHARA_KYZYLKUM as C4W_CUT_KYZYLKUM, W_CUT_TURKESTAN as C4W_CUT_TURKESTAN, W_CUT_KHUJAND as C4W_CUT_KHUJAND, W_KOKAND_IDS as C4W_KOKAND_IDS } from './cuts.mjs';
const C4W_TM = ownSplit('C4W_투르크멘B', C4W_TM_IDS, C4W_TM_PARTS, '카라쿰');
const C4W_KH = ownSplit('C4W_호라즘B', C4W_KH_IDS, C4W_KH_PARTS, '밖');
const C4W_BU = ownSplit('C4W_부하라B', ['UZ-BU', 'UZ-NW'], [['키질쿰', C4W_CUT_KYZYLKUM]], '오아시스');
const C4W_QA = ownSplit('C4W_카슈카다리야B', ['UZ-QA'], [['오아시스', C4W_CUT_KASHKA]], '사막산지');
const C4W_SU = ownSplit('C4W_소그드주B', ['TJ-SU'], [['자라프샨', C4W_CUT_TURKESTAN], ['페르가나', C4W_CUT_KHUJAND], ['우스루샤나', C4W_CUT_USTRU]], '후잔드');
const C4W_JI = ownSplit('C4W_지작B', ['UZ-JI'], [['우스루샤나', C4W_CUT_USTRU]], '지작');
// 땅 묶음
const C4W_MARG = [C4W_TM.메르브, C4W_TM.아할, C4W_TM.아무]; // 마르기아나(메르브 오아시스)·아할(코페트다그 북쪽 기슭의 니사)·아무다리야 왼쪽 띠(아물) — 세 부분 같은 주인(니사 앞당김은 장부 후보 — 2만 km² 안팎)
const C4W_KHW = [C4W_KH.호라즘]; // 호라즘 오아시스(아무다리야 하류 양쪽 기슭 — C3 아프리그 600 모양)
const C4W_SOG = [C4W_BU.오아시스, 'UZ-SA', C4W_SU.자라프샨, C4W_QA.오아시스]; // 소그디아나 오아시스(부하라·사마르칸트·판자켄트·케슈·나사프 — C3 소그드 도시 군주국들 600 모양)
const C4W_USTR = [C4W_SU.우스루샤나, C4W_JI.우스루샤나]; // 우스루샤나(키로폴리스 — 지금 이스타라프샨)
const C4W_FER = [...C4W_KOKAND_IDS, C4W_SU.페르가나]; // 페르가나 분지(C3 페르가나 왕국 600 모양)
const C4W_SHASH = ['UZ-TO', 'UZ-TK', 'UZ-SI']; // 샤시(타슈켄트)·미르자출 초원 — 강거 몫(B13)
const C4W_NONE = [C4W_TM.카라쿰, 'TM-B', C4W_KH.밖, C4W_BU.키질쿰, C4W_QA.사막산지, C4W_JI.지작, C4W_SU.후잔드]; // 시대 내내 비움(까닭은 voids)
// 그해 말 주인 줄(근거는 결과 노트 2절, 천문 연도 — 기원전 N년 = 1−N):
//   마르기아나·아무(아할은 아래 한 곳만 다름): 키루스 −538 · 알렉산드로스 −328(크라테로스의 메르브 — E1) · 디아도코이 −315 비움(Q2) · 셀레우코스 −304 · 그리스-박트리아 −247(Q4) · 파르티아 −154(223까지 — late-antiquity가 이어 칠함)
own([C4W_TM.메르브, C4W_TM.아무], [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, 'macedonia-kingdom'], [-315, null], [-304, 'seleucid-empire'], [-247, 'greco-bactrian-kingdom'], [-154, 'parthian-empire']]);
//   아할(니사)만 −247~−155 비움: 기원전 238년 무렵 아르사케스 1세가 이 기슭(아사크·니사)에서 파르티아를 일으킨 본거지라 그리스-박트리아 땅이 아니고, 파르티아 늘림은 −154부터(권역 파일 범위 — 앞당김은 장부 후보)
own([C4W_TM.아할], [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, 'macedonia-kingdom'], [-315, null], [-304, 'seleucid-empire'], [-247, null], [-154, 'parthian-empire']]);
//   호라즘: 아케메네스 −538~−336(결정 Q1) · 호라즘 왕국 −335(304까지 — late-antiquity가 이어 칠함, 알렉산드로스에게는 우호만 제의해 마케도니아로 칠하지 않음)
own(C4W_KHW, [[ERA_START, null], [-538, 'achaemenid-empire'], [-335, 'khwarazm-kingdom']]);
//   소그디아나 오아시스·우스루샤나: 키루스 −538 · 알렉산드로스 −328(스피타메네스를 꺾고 합병 — E1) · −315 비움(셀레우코스의 소그디아나는 출처 약함 — Q2) · 에우티데모스 1세 −228(B5) · −144 비움(사카·월지, 강거 종주는 명목 — Q5)
own([...C4W_SOG, ...C4W_USTR], [[ERA_START, null], [-538, 'achaemenid-empire'], [-328, 'macedonia-kingdom'], [-315, null], [-228, 'greco-bactrian-kingdom'], [-144, null]]);
//   페르가나: 아케메네스 페르가나는 근거 약함(비움) · 에우티데모스 1세 −228(B5) · −144 비움 · 대완 −129(장건 보고 — Q5, 기원전 104~101 한의 원정은 괴뢰 왕을 세웠을 뿐이라 칠하지 않음 — B16)
own(C4W_FER, [[ERA_START, null], [-228, 'greco-bactrian-kingdom'], [-144, null], [-129, 'ferghana-kingdom']]);
//   샤시: 강거 −127(B13 — 정의 N 칸, 270까지 late-antiquity가 이어 칠함)
own(C4W_SHASH, [[ERA_START, null], [-127, 'kangju']]);
const C4W_G = (...units) => U(...units.map((u) => (u.includes('/') ? geomOfUnit(u) : F(u)))); // 조각 id·나눈 부분 이름을 한 도형으로
const C4W_voids = () => [
  // 시대 내내: 카라쿰(투르크멘 나눔 밖)·발칸과 우스튜르트(TM-B — 유목·사막)·호라즘 밖(카라칼파크 사막·옛 아랄해 기슭·다쇼구즈 남쪽 사막)·부하라·나보이 북쪽 키질쿰·카슈카다리야 서쪽 카르시 초원과 히사르 산지·
  //   지작 오아시스와 누라타우 초원·후잔드 오아시스와 쿠라마 산지 — 오아시스 나라의 땅 밖(C3 600과 같은 비움)
  [ERA_START, ERA_END, C4W_G(...C4W_NONE)],
  // −799~−539: 키루스 동방 원정 앞 — 이 땅에 그릴 나라가 사료에 없음(호라즘 시야부시 왕조는 전설 — B1)
  [ERA_START, -538, C4W_G(...C4W_MARG, ...C4W_KHW, ...C4W_SOG, ...C4W_USTR)],
  // −799~−229 페르가나: 아케메네스가 페르가나를 다스렸다는 근거가 약하고 그 앞뒤 그릴 나라가 없음 — 에우티데모스 1세(−228)부터
  [ERA_START, -228, C4W_G(...C4W_FER)],
  // −799~−128 샤시(타슈켄트)·미르자출: 강거가 기록되기 전 — 그릴 나라가 사료에 없음(아케메네스 소그디아나 사트라피는 시르다리야 남쪽 오아시스까지로 봄)
  [ERA_START, -127, C4W_G(...C4W_SHASH)],
  // −315~−305 마르기아나·아할·아무: 디아도코이 공백(Q2 — 셀레우코스의 마르기아나는 바빌론 전쟁 뒤 −304부터)
  [-315, -304, C4W_G(...C4W_MARG)],
  // −247~−155 아할(코페트다그 북쪽 기슭의 니사): 파르티아의 본거지(아르사케스 1세, 기원전 238년 무렵) — 그리스-박트리아 땅이 아니고 파르티아 늘림은 −154부터라 비움(장부 후보)
  [-247, -154, C4W_G(C4W_TM.아할)],
  // −315~−229 소그디아나·우스루샤나: 셀레우코스의 소그디아나 지배는 '한동안'뿐인 약한 서술이고, 그리스-박트리아는 에우티데모스 1세(−228)부터 소그디아나를 가짐(Q2·B5)
  [-315, -228, C4W_G(...C4W_SOG, ...C4W_USTR)],
  // −144~0 소그디아나·우스루샤나: 사카·월지의 유목 지배와 강거의 명목 종주(5소왕) — 칠하지 않음(Q5, 장부 후보)
  [-144, ERA_END, C4W_G(...C4W_SOG, ...C4W_USTR)],
  // −144~−130 페르가나: 사카가 그리스-박트리아 북쪽을 덮친 뒤 대완이 기록되기 전(Q5)
  [-144, -129, C4W_G(...C4W_FER)],
];
// ── C4 W 끝 ──

// ── C4 N 북 (카자흐 초원·세미레치예·키르기스 북부 — KZ 14·KAZ-3207·KAZ-4829·KAB·KG-C GB N T Y 22조각 — 최상위 이름 C4N_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-N.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 정의 항목: wusun·kangju(글은 이 칸 — 오손 일리 몫은 E 칸, 강거 타슈켄트 세 조각은 W 칸이 같은 id로 칠함). 새 칼선 없음, 늘림 없음(흉노·선비·유연은 칠하지 않음 — 운영자 답 E3·B18).
// 표 경계 해: −131 오손이 일리·세미레치예로 옮겨 자리 잡음(결정 Q7) · −127 장건이 다녀간 강거(B13)
const C4N_BOUNDS = [-131, -127];
// 칼선은 C2 것을 이름 그대로(좌표를 베끼지 않음 — C3 E1 남카 나눔과 같은 상수·같은 조각, 기준 도시는 cuts.mjs 줄 주석)
import { EK_CUT_KARATAU as C4N_CUT_KARATAU } from './cuts.mjs';
// 세미레치예 8조각(잠빌·알마티 주·알마티 시·키르기스 북부 추·탈라스·이시크쿨·나린 — C3 E1_ZHETYSU와 같은 조각, 탈라스 KG-T 포함)
const C4N_ZHETYSU = ['KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KG-C', 'KG-GB', 'KG-N', 'KG-T', 'KG-Y'];
// 초원 11조각 + 바이코누르(KAB): 카자흐 초원 중부·북부·서부(우스튜르트·벳파크달라 포함)
const C4N_STEPPE = [...minus(idsOf('KAZ'), 'KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KZ-YUZ', 'KZ-KZY'), 'KAB'];
if (C4N_STEPPE.length !== 12) throw new Error(`central-asia ancient-bc N: 초원 조각이 ${C4N_STEPPE.length}개(12여야 함)`);
// 주인 줄(그해 말 모습 — 천문 연도, 기원전 N년 = 1−N):
//   세미레치예: 기원전 133~132년 오손이 월지를 몰아내고 일리·세미레치예에 자리 잡음(−131, 결정 Q7 — 8조각 통째). 그 앞 사카·마사게타이는 땅을 그릴 정치체 사료가 없어 비움(B12)
own(C4N_ZHETYSU, [[ERA_START, null], [-131, 'wusun']]);
//   시르다리야 중류 띠(KZ-YUZ의 카라타우 남서쪽 — 투르키스탄·오트라르·시므켄트): 장건이 다녀간 기원전 128년 무렵의 강거(B13). 그 앞은 비움(B12)
const C4N_YUZ = ownSplit('C4N_남카', ['KZ-YUZ'], [['시르다리야', C4N_CUT_KARATAU]], '초원', { 시르다리야: [[ERA_START, null], [-127, 'kangju']] });
//   악메체트 띠(KZ-KZY의 시르다리야 하류 — 자나코르간·크질오르다)와 초원: 시대 내내 비움. 이 시대에는 KZ-KZY를 나누지 않는다(띠와 나머지가 모두 비움 — late-antiquity에서 555부터 나눔)
const C4N_voids = () => [
  // −799~−132 세미레치예: 사카·마사게타이 — 유목 연합이라 땅을 그릴 정치체가 사료에 없음(B12)
  B(ERA_START, -131, ...C4N_ZHETYSU),
  // −799~−128 시르다리야 중류 띠: 강거가 기록에 나오기 앞 — 그릴 정치체가 사료에 없음(B12)
  B(ERA_START, -127, C4N_YUZ.시르다리야),
  // 시대 내내 초원·악메체트 띠: 사카·사르마트·흉노의 유목지 — 흉노는 명목 종주라 늘리지 않음(B18·운영자 답 E3), 시르다리야 하류는 강거 유적 범위(오트라르~타슈켄트) 밖(B13)
  B(ERA_START, ERA_END, ...C4N_STEPPE, 'KZ-KZY', C4N_YUZ.초원),
];
// ── C4 N 끝 ──

// ── C4 E 동 (신장 CN-XJ 한 조각(칼선으로 나눔) — 최상위 이름 C4E_) ──
// 정의 항목: jushi-kingdom·tarim-oasis-states(글은 이 칸), 이어 칠함: khotan-kingdom(C3 항목 — 글 이 칸)·wusun(이리 몫 — 정의·글은 N 칸). 늘림 없음.
// 표 경계 해: 주인이 바뀌는 해 −175(묶음·우전)·−131(오손 이리)·−107(차사). 신장 나눔은 시대 내내 하나라 앞 권역 도형 변화 해(−317·−220·−204·−201)는 넣지 않는다
const C4E_BOUNDS = [-175, -131, -107];
// 주인 줄(그해 말 모습 — 결정 Q7·Q8·Q9, 기본값 B18~B21·B26, 조사 노트 E 2·3절)
const C4E_NONE = [[ERA_START, null]];
// 오아시스 띠 다섯(소륵·사차·고묵구자·언기 쪽·선선): 기원전 176년 앞은 정치체 이름·땅 사료 없음(조사 노트 E 1 — 고고학 문화뿐) · −175 묵돌의 편지에 누란·오손 등 서역 26국(묶음 항목 — 결정 Q9).
//   기원전 60년(−59) 서한 서역도호부는 감독뿐이라 오아시스 왕국 색 그대로(운영자 답 E2)
const C4E_OASIS = [[ERA_START, null], [-175, 'tarim-oasis-states']];
const C4E_LINES = {
  소륵: C4E_OASIS, 사차: C4E_OASIS, 구자: C4E_OASIS, 언기: C4E_OASIS, 선선: C4E_OASIS,
  // 우전 띠: −175부터 호탄 왕국(결정 Q9 — 항목 from −223은 쿠스타나 건국 전설, 지도는 묶음과 같은 첫 기록 해부터)
  우전: [[ERA_START, null], [-175, 'khotan-kingdom']],
  // 투루판 분지·카라샤르 분지 북쪽(EX_T1 — C3 고창국과 같은 단위): −107 차사국(결정 Q8, 기원전 108년 한의 누란·고사 원정 뒤 기록). 기원전 60년 전·후차사 갈림 뒤 후차사(북정 쪽)는 준가르 단위에서 비움(B19)
  투루판: [[ERA_START, null], [-107, 'jushi-kingdom']],
  // 이리 골짜기(E_S_ILI ∩ E_S_NORTH): −131 오손이 일리로 옮겨 자리 잡음(결정 Q7 — 정의 N 칸). 그 앞은 사카·월지(항목 없음)
  이리: [[ERA_START, null], [-131, 'wusun']],
  // 늘 비움: 하미(이오 — 한·흉노가 번갈아 다툰 땅, 둔전은 1만 km² 미만: B19)·우루무치와 준가르(후차사 북정 띠와 흉노·선비·유연·고차의 유목지 — 늘림 없음: B18·B19, 운영자 답 E3)·
  //   카슈가르·악수·호탄·코를라 단위의 띠 밖(파미르·톈산·곤륜 산지, 바얀불락 목지, 타클라마칸 사막)과 동(롭노르·쿠루크타그·알틴타그와 사막) — 오아시스 나라 땅 밖(한 둔전·원정은 칠하지 않음: B20)
  하미: C4E_NONE, 우루무치: C4E_NONE, 준가르: C4E_NONE, 카슈가르: C4E_NONE, 악수: C4E_NONE, 호탄: C4E_NONE, 코를라: C4E_NONE, 동: C4E_NONE,
};
// 신장 나눔: cuts-c4.mjs의 C4E_xjParts(C3 E1과 같은 차례·상수 — 하미 → 이리 → 우루무치 → 준가르 → 카슈가르(소륵·사차 띠) → 악수(고묵·구자 띠) → 호탄(우전 띠) → 투루판 EX_T1 → 코를라 EX_T2(언기 쪽 띠) → 동(선선 띠)).
//   이 시대 내내 한 가지 나눔(묶음 'C4E_신장'). 앞 권역 도형(동쪽 띠 1,393·채우기 2,250·토욕혼 21,292 km²)은 하미·준가르·동에만 있어 빼지 않고, 칠하는 부분과 겹치지 않음을 아래에서 해마다 확인한다
//   (중국 왕조·흉노·선비·유연·돌궐·토욕혼 색은 칠하지 않음 — 운영자 답 E2·E3).
import { C4E_xjParts } from './cuts-c4.mjs';
const C4E_PARTS = C4E_xjParts();
const C4E_XJ = ownSplit('C4E_신장', [XJ_ID], C4E_PARTS, '앞', Object.fromEntries(C4E_PARTS.map(([p]) => [p, C4E_LINES[p]])));
// 칠하는 부분이 그해 앞 권역 도형과 1 km²(약 1e-4제곱도) 넘게 겹치면 멈춘다(겹치면 그 해 그 도형을 빼는 나눔을 따로 둬야 함)
for (const [p, g] of C4E_PARTS) {
  const line = C4E_LINES[p];
  const spans = line.map(([y, o], k) => [y, k + 1 < line.length ? line[k + 1][0] : ERA_END, o]).filter(([, , o]) => o !== null);
  for (const id of PREV_IDS) {
    for (const [f, tt, pg] of prevListOf(id)) {
      if (!spans.some(([a, b]) => f < b && a < tt)) continue;
      const x = I(g, pg);
      if (x.length && deg2(x) > 1e-4) throw new Error(`central-asia ancient-bc E: 칠하는 부분 ${p}가 앞 권역 ${id}(${f}~)와 겹침 — 그 해를 나눠 빼야 함`);
    }
  }
}
// 비운 땅: 해마다 주인 없는 부분이 같은 기간끼리 한 줄(C3 E1_voids와 같은 꼴 — 이유는 C4E_LINES 줄 주석)
const C4E_voids = () => {
  const out = [];
  let run = null;
  for (let y = ERA_START; y <= ERA_END; y++) {
    const nulls = y < ERA_END ? Object.keys(C4E_LINES).filter((p) => C4E_LINES[p].filter(([yy]) => yy <= y).at(-1)[1] === null) : null;
    const key = nulls ? nulls.join('|') : '끝';
    if (run && run.key !== key) {
      if (run.nulls.length) out.push(B(run.from, y, ...run.nulls.map((p) => C4E_XJ[p])));
      run = null;
    }
    if (!run && nulls) run = { key, from: y, nulls };
  }
  return out;
};
// ── C4 E 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([ERA_START, ...C4SW_BOUNDS, ...C4W_BOUNDS, ...C4N_BOUNDS, ...C4E_BOUNDS, ERA_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== ERA_START || BOUNDS.at(-1) !== ERA_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia ancient-bc: 표 경계 해 ${BOUNDS.join(', ')}는 ${ERA_START}~${ERA_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia ancient-bc: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia ancient-bc: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia ancient-bc: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia ancient-bc: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia ancient-bc: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
// ── 소유표 → 버전·맞물림 검사·빈 땅 검사 구역·비운 땅 (공통) ─────────────────────────────
const joined = joinTables(TABLES);
if (joined.TO !== ERA_END) throw new Error(`central-asia ancient-bc: 마지막 표의 끝이 ${joined.TO} (${ERA_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 ERA_END = 1 — late-antiquity.mjs 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 시대 경계 맞물림 검사(COMMON 6절 '시대 경계', 맞춤 M24): 앞·뒤 시대가 이어 그리는 항목은 이 시대에 버전이 있으면
// SEAM_OUT — 마지막 버전이 이 시대 끝 해까지(to = ERA_END = 다음 시대 첫 해), SEAM_IN — 첫 버전이 이 시대 첫 해부터(from = ERA_START). 버전이 없으면 지나감(뼈대)
// (끝 해까지 칠하지 않으면 경계 앞에 틈이, 첫 해부터 칠하지 않으면 경계 뒤에 틈이 생김. 늘린 나라도 이 시대의 versions에 있는 동안 같이 본다 — joinEras가 extensions로 옮기기 전)
const SEAM_OUT = ['parthian-empire', 'yuezhi', 'wusun', 'kangju', 'jushi-kingdom', 'tarim-oasis-states', 'khotan-kingdom', 'ferghana-kingdom'];
const SEAM_IN = [];
for (const id of SEAM_OUT) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== ERA_END) throw new Error(`central-asia ancient-bc: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — 다음 시대가 ${ERA_END}년부터 이어 그리므로 ${ERA_END - 1}년까지 칠해야 함(맞물림)`);
}
for (const id of SEAM_IN) {
  const first = versions[id]?.[0];
  if (first && first[0] !== ERA_START) throw new Error(`central-asia ancient-bc: ${id}의 첫 버전이 ${first[0]}~${first[1] - 1} — 앞 시대가 ${ERA_START - 1}년까지 칠하므로 ${ERA_START}년부터 칠해야 함(맞물림)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...C4SW_voids(), ...C4W_voids(), ...C4N_voids(), ...C4E_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 83개 + 신장)에서 그해 비운 땅(voids)을 뺀 곳 — 앞 권역 도형(신장 동쪽 띠의 중국 왕조·유목 채우기·토욕혼)이 덮는 땅과 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// 비운 땅이 바뀌는 해마다 구역 하나(마지막 구역의 끝은 ERA_END — 그 뒤는 다음 시대 구역). 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상 — 그 칸 땅임을 결과 노트에 한 줄. gaps 검사는 돌리지 않고 칸 땅 직접 재기로 갈음 — COMMON 7절)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([ERA_START, ERA_END, ...voids.flatMap(([f, t]) => [f, t ?? ERA_END]).filter((y) => ERA_START < y && y < ERA_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(C1 합치기에서 더함 — 비운 땅 변이 앞 권역 도형 변과 거의 겹쳐 gaps의 빈 땅 계산이 polyclip 예외로 멈추는 것을 막음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? ERA_END)).map(([, , g]) => g);
  return [{ name: `중앙아시아 고대(기원전) ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void C4_SW_IDS; void C4_W_IDS; void C4_N_IDS; void C4_E_IDS; void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'ancient-bc',
  versions,
  gapZones,
  voids,
};
