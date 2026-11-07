// central-asia 시대 파일 late-antiquity (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1~599: 쿠샨·사산·에프탈·이스테미 야브구국·타림 오아시스
// 짝 항목 파일: data/entities/central-asia-late-antiquity.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 다른 시대 파일 항목(C3 ferghana-kingdom 등)·늘린 나라는 그 파일 그대로)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
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
//   같은 id는 경계 앞뒤에 같은 조각·같은 칼선 상수로 그린다(대칭차 목표 0 — ca4/c4/skel/seam.mjs <사본> <뒤 해> <id…>로 잰다). 앞 시대: ancient-bc.mjs · 뒤 시대: early-medieval.mjs
// 표 경계 해: 칸마다 <앞머리>BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(ERA_START·ERA_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = COMMON 2·3절 결정 해(주인이 바뀌는 첫 해) + 신장은 앞 권역 도형이 바뀌는 해. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 ERA_START(1)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';
import { C4_SW_IDS, C4_W_IDS, C4_N_IDS, C4_E_IDS } from './cuts-c4.mjs'; // 칸 조각 목록(칸 땅 직접 재기·칸 안 확인용)

const { build, geomOfUnit, joinTables, makeTable } = tableKit('late-antiquity');

const ERA_START = 1; // 이 시대 파일의 첫 해(1년 말 모습)
const ERA_END = 600; // 마지막 표의 끝(미포함) = early-medieval.mjs의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < ERA_START || e[0] >= ERA_END)) {
    throw new Error(`central-asia late-antiquity: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${ERA_START} 이상 ${ERA_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia late-antiquity: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = ERA_START, to = ERA_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia late-antiquity: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia late-antiquity: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia late-antiquity: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia late-antiquity: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia late-antiquity: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── C4 SW 서남 (아프가니스탄 34·UZ-SU·TJ-KT·TJ-DU·TJ-GB·TJK-368 — 39조각 — 최상위 이름 C4SW_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-SW.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 표 경계 해: 30 쿠줄라 카드피세스의 쿠샨 통일(박트리아 북) · 75 쿠샨의 카불(남아시아 쿠샨 75와 같은 해 — B7) · 224 파르티아 끝(아리아 비움 — 맞춤 M6) · 240 샤푸르 1세의 동방(사산 아리아·시스탄, 쿠샨샤르 — B8) ·
//   360 키다라 · 467 에프탈의 발흐(키다라 무너짐 — B9) · 470 알촌의 카불(남아시아 알촌 470과 같은 해) · 484 페로즈 전사(에프탈의 아리아·시스탄 — Q4) · 565 사산의 아리아·시스탄 회복(돌궐·사산의 에프탈 분할, 카불 비움 — B8)
const C4SW_BOUNDS = [30, 75, 224, 240, 360, 467, 470, 484, 565];
// 짜임(SW 칸 2026-11-07): 단위는 ancient-bc SW와 같은 땅 묶음, 나눔 묶음은 C3 W1A_AF_IDS·W1A_AF_PARTS 그대로(599 시스탄 = C3 600 사산 시스탄 — 맞춤 M7). (ancient-bc와 같은 나눔 — 이름만 다름)
import { W1A_AF_IDS as C4SW_AF_IDS, W1A_AF_PARTS as C4SW_AF_PARTS } from './cuts-c3.mjs';
const C4SW_AF = ownSplit('C4SW_아프간A', C4SW_AF_IDS, C4SW_AF_PARTS, '사막');
const C4SW_BN = ['AF-BAL', 'AF-SAM', 'AF-KDZ', 'AF-TAK', 'AF-BGL', 'AF-JOW', 'AF-SAR', 'AF-FYB', 'UZ-SU', 'TJ-KT', 'TJ-DU', 'TJK-368']; // 박트리아 북(토하리스탄 — C3 tokhara-yabghus 600 열두 조각)
const C4SW_ARIA_IDS = ['AF-HER', 'AF-BDG']; // 아리아(헤라트·바드기스)
const C4SW_KABUL = [C4SW_AF.카불, C4SW_AF.카피리스탄, 'AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AF-NUR', 'AF-PKA', 'AF-WAR', 'AFG-1769', 'AFG-1772']; // 카불(파로파미사다이)
const C4SW_ARACH = [C4SW_AF.헬만드, C4SW_AF.자불, 'AF-ZAB', 'AF-PIA', 'AF-KHO']; // 아라코시아
const C4SW_HAZ = [C4SW_AF.하자라자트, 'AF-BAM', 'AF-GHO', 'AFG-1753']; // 하자라자트
// 그해 말 주인 줄(근거는 결과 노트 2절):
//   박트리아 북: 월지(ancient-bc에서 이음) · 30 쿠샨 · 240 쿠샨샤르 · 360 키다라 · 467 에프탈(560~599는 돌궐·사산에 무너진 뒤의 제후국 시기도 같은 모양 — B9, 600부터 C3 tokhara-yabghus가 같은 열두 조각)
own(C4SW_BN, [[ERA_START, 'yuezhi'], [30, 'kushan-empire'], [240, 'kushano-sasanian-kingdom'], [360, 'kidarite-kingdom'], [467, 'hephthalites']]);
//   아리아: 파르티아(ancient-bc에서 이음) · 224~239 비움(M6 — 사산의 이란 동부는 240부터, 서아시아 사산 줄과 같음) · 240 사산 · 484 에프탈 · 565 사산(= C3 600 모양)
own(C4SW_ARIA_IDS, [[ERA_START, 'parthian-empire'], [224, null], [240, 'sasanian-empire'], [484, 'hephthalites'], [565, 'sasanian-empire']]);
//   드랑기아나(시스탄): 1~239 비움(Q4 — 인도-스키타이·인도-파르티아는 칠하지 않음, E2) · 240 사산 · 484 에프탈 · 565 사산(= C3 600 모양)
own([C4SW_AF.시스탄], [[ERA_START, null], [240, 'sasanian-empire'], [484, 'hephthalites'], [565, 'sasanian-empire']]);
//   카불: 1~74 비움(인도-스키타이·인도-파르티아 — E2) · 75 쿠샨 · 240 쿠샨샤르 · 360 키다라(469까지 — 남아시아 키다라와 같음) · 470 알촌 · 565 비움(C3 Q3 600~664 비움에 맞춤 — B8)
own(C4SW_KABUL, [[ERA_START, null], [75, 'kushan-empire'], [240, 'kushano-sasanian-kingdom'], [360, 'kidarite-kingdom'], [470, 'alchon-huns'], [565, null]]);
// 시대 내내 주인 없음(줄을 적지 않음): 아라코시아·하자라자트·바다흐샨·파미르·사막 — 까닭은 아래 voids
const C4SW_G = (...units) => U(...units.map((u) => (u.includes('/') ? geomOfUnit(u) : F(u)))); // 조각 id·나눈 부분 이름을 한 도형으로
const C4SW_voids = () => [
  // 시대 내내: 아라코시아(인도-스키타이·인도-파르티아는 칠하지 않음 — E2, 쿠샨의 아라코시아는 근거 약함 — B7)·하자라자트(산지, Q11)·바다흐샨·파미르(B3)·헬만드 칼선 밖 사막(C3 600과 같음)
  [ERA_START, ERA_END, C4SW_G(...C4SW_ARACH, ...C4SW_HAZ, 'AF-BDS', 'TJ-GB', C4SW_AF.사막)],
  // 1~239 시스탄: 사카스탄 — 인도-스키타이·인도-파르티아는 칠하지 않음(Q4·E2)
  [ERA_START, 240, C4SW_G(C4SW_AF.시스탄)],
  // 1~74 카불: 인도-스키타이·인도-파르티아는 칠하지 않음(E2), 쿠샨은 75부터(남아시아 쿠샨과 같은 해 — B7)
  [ERA_START, 75, C4SW_G(...C4SW_KABUL)],
  // 224~239 아리아: 파르티아가 무너진 뒤 사산이 이란 동부를 굳히기 전(M6 — 서아시아 사산 225~239 이란 동부 비움과 같음)
  [224, 240, C4SW_G(...C4SW_ARIA_IDS)],
  // 565~599 카불: 네자크 훈족 등(항목 없음) — C3 600~664 비움에 맞춤(B8)
  [565, ERA_END, C4SW_G(...C4SW_KABUL)],
];
// ── C4 SW 끝 ──

// ── C4 W 서 (트란스옥시아나·호라즘·마르기아나·페르가나·타슈켄트 — UZ 13·TJ-SU·TM-A B D L M·KG-B J O 22조각 — 최상위 이름 C4W_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-W.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 표 경계 해: 224 아르다시르 1세의 메르브(사산 — Q4) · 271 강거가 크시오네스에게 복속된 뒤(샤시 비움 — B13) · 305 아프리그 왕조(호라즘 — C3 항목 from) ·
//   479 에프탈의 소그디아나(소그드 도시 군주국들 — Q5) · 484 페로즈 전사 뒤 에프탈의 메르브(Q4) · 565 돌궐·사산의 에프탈 분할 뒤 사산의 메르브 회복(Q4, 맞춤 M10)
const C4W_BOUNDS = [224, 271, 305, 479, 484, 565];
// 짜임(W 칸 2026-11-07): ancient-bc W와 같은 땅 묶음·같은 나눔(이름만 다름) — 599 모양 = C3 600 모양(sasanian-empire 메르브·아할·아무, afrighid-dynasty 호라즘, sogdian-city-states·ferghana-kingdom — 맞춤 M7)
import { W1A_TM_IDS as C4W_TM_IDS, W1A_TM_PARTS as C4W_TM_PARTS, W1A_KH_IDS as C4W_KH_IDS, W1A_KH_PARTS as C4W_KH_PARTS, W1T_CUT_KASHKA as C4W_CUT_KASHKA, W1T_CUT_USTRU as C4W_CUT_USTRU } from './cuts-c3.mjs';
import { W_CUT_BUKHARA_KYZYLKUM as C4W_CUT_KYZYLKUM, W_CUT_TURKESTAN as C4W_CUT_TURKESTAN, W_CUT_KHUJAND as C4W_CUT_KHUJAND, W_KOKAND_IDS as C4W_KOKAND_IDS } from './cuts.mjs';
const C4W_TM = ownSplit('C4W_투르크멘A', C4W_TM_IDS, C4W_TM_PARTS, '카라쿰');
const C4W_KH = ownSplit('C4W_호라즘A', C4W_KH_IDS, C4W_KH_PARTS, '밖');
const C4W_BU = ownSplit('C4W_부하라A', ['UZ-BU', 'UZ-NW'], [['키질쿰', C4W_CUT_KYZYLKUM]], '오아시스');
const C4W_QA = ownSplit('C4W_카슈카다리야A', ['UZ-QA'], [['오아시스', C4W_CUT_KASHKA]], '사막산지');
const C4W_SU = ownSplit('C4W_소그드주A', ['TJ-SU'], [['자라프샨', C4W_CUT_TURKESTAN], ['페르가나', C4W_CUT_KHUJAND], ['우스루샤나', C4W_CUT_USTRU]], '후잔드');
const C4W_JI = ownSplit('C4W_지작A', ['UZ-JI'], [['우스루샤나', C4W_CUT_USTRU]], '지작');
const C4W_MARG = [C4W_TM.메르브, C4W_TM.아할, C4W_TM.아무]; // 마르기아나·아할(니사)·아무다리야 왼쪽 띠
const C4W_KHW = [C4W_KH.호라즘]; // 호라즘 오아시스
const C4W_SOG = [C4W_BU.오아시스, 'UZ-SA', C4W_SU.자라프샨, C4W_QA.오아시스]; // 소그디아나 오아시스
const C4W_USTR = [C4W_SU.우스루샤나, C4W_JI.우스루샤나]; // 우스루샤나
const C4W_FER = [...C4W_KOKAND_IDS, C4W_SU.페르가나]; // 페르가나 분지
const C4W_SHASH = ['UZ-TO', 'UZ-TK', 'UZ-SI']; // 샤시(타슈켄트)·미르자출 초원
const C4W_NONE = [C4W_TM.카라쿰, 'TM-B', C4W_KH.밖, C4W_BU.키질쿰, C4W_QA.사막산지, C4W_JI.지작, C4W_SU.후잔드];
// 그해 말 주인 줄(근거는 결과 노트 2절):
//   마르기아나·아할·아무: 파르티아(ancient-bc에서 이음) · 224 사산(아르다시르 1세에게 승복 — Q4) · 484 에프탈(페로즈 전사 — Q4) · 565 사산(= C3 600 모양, 맞춤 M7·M10)
own(C4W_MARG, [[ERA_START, 'parthian-empire'], [224, 'sasanian-empire'], [484, 'hephthalites'], [565, 'sasanian-empire']]);
//   호라즘: 호라즘 왕국(ancient-bc에서 이음 — 쿠샨 주화를 본뜬 것은 통치 근거가 아님) · 305 아프리그 왕조(C3 항목 from, 600부터 C3가 같은 모양으로 이어 칠함)
own(C4W_KHW, [[ERA_START, 'khwarazm-kingdom'], [305, 'afrighid-dynasty']]);
//   소그디아나 오아시스: 1~478 비움(강거 종주는 명목, 쿠샨·키다라의 소그디아나 지배는 근거 약함 — Q5) · 479 소그드 도시 군주국들(에프탈 아래 — Q5)
own(C4W_SOG, [[ERA_START, null], [479, 'sogdian-city-states']]);
//   페르가나: 대완(ancient-bc에서 이음 — 3~6세기 사료 약함, 600부터 C3가 같은 모양으로 이어 칠함)
own(C4W_FER, [[ERA_START, 'ferghana-kingdom']]);
//   샤시: 강거(ancient-bc에서 이음) · 271 비움(크시오네스에게 복속 — B13, C3 600~750 비움과 같음)
own(C4W_SHASH, [[ERA_START, 'kangju'], [271, null]]);
// 시대 내내 주인 없음(줄을 적지 않음): 우스루샤나와 C4W_NONE — 까닭은 아래 voids
const C4W_G = (...units) => U(...units.map((u) => (u.includes('/') ? geomOfUnit(u) : F(u)))); // 조각 id·나눈 부분 이름을 한 도형으로
const C4W_voids = () => [
  // 시대 내내: 카라쿰·발칸과 우스튜르트·호라즘 밖·키질쿰·카르시 초원과 히사르 산지·지작과 누라타우 초원·후잔드와 쿠라마 산지(오아시스 나라 땅 밖 — C3 600과 같음)와
  //   우스루샤나(아프신 왕조는 C3 600부터 — 600 앞을 칠하려면 항목 from을 바꿔야 해 이번 범위 밖, 장부 후보)
  [ERA_START, ERA_END, C4W_G(...C4W_NONE, ...C4W_USTR)],
  // 1~478 소그디아나 오아시스: 강거의 명목 종주·쿠샨·키다라 지배 근거 약함 — 에프탈 정복(479) 앞(Q5, 장부 후보)
  [ERA_START, 479, C4W_G(...C4W_SOG)],
  // 271~599 샤시·미르자출: 강거가 크시오네스에게 복속된 뒤 따로 그릴 나라가 없음(B13 — C3 600~750 비움과 같음)
  [271, ERA_END, C4W_G(...C4W_SHASH)],
];
// ── C4 W 끝 ──

// ── C4 N 북 (카자흐 초원·세미레치예·키르기스 북부 — KZ 14·KAZ-3207·KAZ-4829·KAB·KG-C GB N T Y 22조각 — 최상위 이름 C4N_) ──
// 이 칸의 몫·정의 항목·늘림은 ca4/c4/IMPL-N.md. 표 경계 해 처음 값은 COMMON 2·3절 결정 해 — 칸이 사료로 더하고 뺀다
// 정의 항목: istami-yabghu-state(글은 이 칸 — 600~602는 이 칸이 C3 early-medieval.mjs E1 머리 줄을 고쳐 칠함), wusun·kangju는 ancient-bc에서 이어 칠함.
//   일리 몫(오손·이스테미)은 E 칸, 강거 타슈켄트 세 조각은 W 칸이 같은 id로 칠함. 새 칼선 없음, 늘림 없음(선비·유연·돌궐은 칠하지 않음 — 운영자 답 E3·B18).
// 표 경계 해: 271 강거가 크시오네스에게 복속(270 무렵 — B13) · 437 오손 마지막 기록 436 뒤(B14) · 555 이스테미의 세미레치예 장악(결정 Q6)
const C4N_BOUNDS = [271, 437, 555];
// 칼선은 C2 것을 이름 그대로(좌표를 베끼지 않음 — C3 E1 남카·크질오르다 나눔과 같은 상수·같은 조각이라 599↔600 대칭차 0, 기준 도시는 cuts.mjs 줄 주석)
import { EK_CUT_KARATAU as C4N_CUT_KARATAU, EK_CUT_KOK as C4N_CUT_KOK } from './cuts.mjs';
// 세미레치예 8조각(C3 E1_ZHETYSU와 같은 조각, 탈라스 KG-T 포함)
const C4N_ZHETYSU = ['KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KG-C', 'KG-GB', 'KG-N', 'KG-T', 'KG-Y'];
// 초원 11조각 + 바이코누르(KAB)
const C4N_STEPPE = [...minus(idsOf('KAZ'), 'KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KZ-YUZ', 'KZ-KZY'), 'KAB'];
if (C4N_STEPPE.length !== 12) throw new Error(`central-asia late-antiquity N: 초원 조각이 ${C4N_STEPPE.length}개(12여야 함)`);
const C4N_IY = 'istami-yabghu-state';
// 주인 줄(그해 말 모습):
//   세미레치예: 오손(ancient-bc에서 이어 칠함 — 마지막 중국 기록 436년, B14) · 437 비움(열반·유연 사이 유목지 — 늘림 없음, B12·B18) · 555 이스테미 야브구국(결정 Q6 — 600~602는 C3 파일)
own(C4N_ZHETYSU, [[ERA_START, 'wusun'], [437, null], [555, C4N_IY]]);
//   시르다리야 중류 띠: 강거(ancient-bc에서 이어 칠함) · 271 비움(270 무렵 크시오네스 복속 뒤 굳은 주인 사료 없음 — B13) · 555 이스테미(C3 서돌궐 603과 같은 띠)
const C4N_YUZ = ownSplit('C4N_남카', ['KZ-YUZ'], [['시르다리야', C4N_CUT_KARATAU]], '초원', { 시르다리야: [[ERA_START, 'kangju'], [271, null], [555, C4N_IY]] });
//   악메체트 띠(KZ-KZY의 시르다리야 하류 — 자나코르간·크질오르다): 555 이스테미(C3 서돌궐 603~657이 칠하는 띠와 같은 모양 — 602↔603 같은 땅). 그 앞은 비움
const C4N_KZY = ownSplit('C4N_크질오르다', ['KZ-KZY'], [['악메체트', C4N_CUT_KOK]], '초원', { 악메체트: [[ERA_START, null], [555, C4N_IY]] });
//   초원(나머지 KZ 11조각·KAB·두 띠 밖): 시대 내내 비움
const C4N_voids = () => [
  // 437~554 세미레치예: 오손이 기록에서 사라진 뒤 열반·유연 사이 유목지 — 열반은 수도·땅 크기 사료가 없고 유연은 원거리 수탈뿐이라 늘리지 않음(B12·B18·운영자 답 E3)
  B(437, 555, ...C4N_ZHETYSU),
  // 271~554 시르다리야 중류 띠: 강거가 270 무렵 크시오네스에게 복속된 뒤 이 띠의 굳은 주인 사료가 없음(B13 — 키다라·에프탈 몫은 W·SW 판단)
  B(271, 555, C4N_YUZ.시르다리야),
  // 1~554 악메체트 띠: 시르다리야 하류는 강거 유적 범위(오트라르~타슈켄트) 밖, 그 뒤 유목지(B13·B18)
  B(ERA_START, 555, C4N_KZY.악메체트),
  // 시대 내내 초원: 사르마트·훈·선비·유연·돌궐의 유목지 — 늘림 없음(명목 종주·원거리 수탈 — B18·운영자 답 E3)
  B(ERA_START, ERA_END, ...C4N_STEPPE, C4N_YUZ.초원, C4N_KZY.초원),
];
// ── C4 N 끝 ──

// ── C4 E 동 (신장 CN-XJ 한 조각(칼선으로 나눔) — 최상위 이름 C4E_) ──
// 정의 항목: jushi-kingdom·tarim-oasis-states(글은 이 칸), 이어 칠함: khotan-kingdom·qu-gaochang(C3 항목 — 글 이 칸)·wusun·istami-yabghu-state(이리 몫 — 정의·글은 N 칸). 늘림 없음.
// 표 경계 해: 주인이 바뀌는 해 61·86(우전의 사차 병합)·330(선선 띠 빠짐)·437(오손 끝)·442(고창국)·555(이스테미). 신장 나눔은 시대 내내 하나라 앞 권역 도형 변화 해(24·25·329·385·386·534·535)는 넣지 않는다
const C4E_BOUNDS = [61, 86, 330, 437, 442, 555];
// 주인 줄(그해 말 모습 — 결정 Q7·Q8·Q9, 기본값 B18~B21·B23·B26, 조사 노트 E 2·3절). 첫 해는 ERA_START(1) — 앞 시대 끝 해(0)의 주인을 그대로 잇는다(맞물림)
const C4E_NONE = [[ERA_START, null]];
// 오아시스 띠(소륵·고묵구자·언기 쪽): 묶음 항목 그대로(반초 73~102·서역장사 123~·383 전진의 구자 원정은 칠하지 않음 — B20, 한·위·진·량·북위 색 없음 — 운영자 답 E2). 600~647은 C3 파일이 이어 칠함(운영자 답 E4)
const C4E_OASIS = [[ERA_START, 'tarim-oasis-states']];
const C4E_LINES = {
  소륵: C4E_OASIS, 구자: C4E_OASIS, 언기: C4E_OASIS,
  // 사차 띠: 61 우전 광덕이 사차왕 현을 죽이고 사차를 병합(조사 노트 E 3-3) · 86 묶음으로 돌아옴(86년 반초의 사차 평정 — 위키백과 Yarkand, 반초 문서는 88년)
  사차: [[ERA_START, 'tarim-oasis-states'], [61, 'khotan-kingdom'], [86, 'tarim-oasis-states']],
  // 선선 띠: 330부터 비움 — 타림강 물길이 바뀌어 누란 둔전을 버린 330년(결정 Q9, 조사 노트 E 2 — 그 뒤 선선 땅의 주인은 사료로 잡지 못함, 토욕혼 몫 21,292 km²는 동 단위의 앞 권역 도형)
  선선: [[ERA_START, 'tarim-oasis-states'], [330, null]],
  // 우전 띠: 호탄 왕국 내내(600~647은 C3 파일)
  우전: [[ERA_START, 'khotan-kingdom']],
  // 투루판(EX_T1): 차사국 · 442 북량 잔여 저거무휘·안주가 고창으로 옮겨 온 해부터 고창국(결정 Q8 — 460 감씨·488 장씨·496 마씨·501 국씨 왕가 바뀜은 mapNote, 이름 그대로 B23)
  투루판: [[ERA_START, 'jushi-kingdom'], [442, 'qu-gaochang']],
  // 이리: 오손(마지막 중국 기록 436년까지 — 결정 Q7) · 437 비움(유연·고차 사이 유목지, 늘림 없음 — B18) · 555 이스테미 야브구국(결정 Q6 — 600~602는 N 칸이 C3 파일에서)
  이리: [[ERA_START, 'wusun'], [437, null], [555, 'istami-yabghu-state']],
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
      if (x.length && deg2(x) > 1e-4) throw new Error(`central-asia late-antiquity E: 칠하는 부분 ${p}가 앞 권역 ${id}(${f}~)와 겹침 — 그 해를 나눠 빼야 함`);
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
if (BOUNDS[0] !== ERA_START || BOUNDS.at(-1) !== ERA_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia late-antiquity: 표 경계 해 ${BOUNDS.join(', ')}는 ${ERA_START}~${ERA_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia late-antiquity: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia late-antiquity: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia late-antiquity: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia late-antiquity: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia late-antiquity: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== ERA_END) throw new Error(`central-asia late-antiquity: 마지막 표의 끝이 ${joined.TO} (${ERA_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 ERA_END = 600 — early-medieval.mjs 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 시대 경계 맞물림 검사(COMMON 6절 '시대 경계', 맞춤 M24): 앞·뒤 시대가 이어 그리는 항목은 이 시대에 버전이 있으면
// SEAM_OUT — 마지막 버전이 이 시대 끝 해까지(to = ERA_END = 다음 시대 첫 해), SEAM_IN — 첫 버전이 이 시대 첫 해부터(from = ERA_START). 버전이 없으면 지나감(뼈대)
// (끝 해까지 칠하지 않으면 경계 앞에 틈이, 첫 해부터 칠하지 않으면 경계 뒤에 틈이 생김. 늘린 나라도 이 시대의 versions에 있는 동안 같이 본다 — joinEras가 extensions로 옮기기 전)
const SEAM_OUT = ['sasanian-empire', 'afrighid-dynasty', 'sogdian-city-states', 'ferghana-kingdom', 'qu-gaochang', 'tarim-oasis-states', 'khotan-kingdom', 'istami-yabghu-state'];
const SEAM_IN = ['parthian-empire', 'yuezhi', 'wusun', 'kangju', 'jushi-kingdom', 'tarim-oasis-states', 'khotan-kingdom', 'ferghana-kingdom'];
for (const id of SEAM_OUT) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== ERA_END) throw new Error(`central-asia late-antiquity: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — 다음 시대가 ${ERA_END}년부터 이어 그리므로 ${ERA_END - 1}년까지 칠해야 함(맞물림)`);
}
for (const id of SEAM_IN) {
  const first = versions[id]?.[0];
  if (first && first[0] !== ERA_START) throw new Error(`central-asia late-antiquity: ${id}의 첫 버전이 ${first[0]}~${first[1] - 1} — 앞 시대가 ${ERA_START - 1}년까지 칠하므로 ${ERA_START}년부터 칠해야 함(맞물림)`);
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
  return [{ name: `중앙아시아 고대 말(기원후) ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void C4_SW_IDS; void C4_W_IDS; void C4_N_IDS; void C4_E_IDS; void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'late-antiquity',
  versions,
  gapZones,
  voids,
};
