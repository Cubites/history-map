// central-asia 시대 파일 high-medieval (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 821~1219: 사만·카라한·가즈니·서요
// 짝 항목 파일: data/entities/central-asia-high-medieval.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/central-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/central-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다). 권역 파일 시대 목록 [earlyMedievalEra, highMedievalEra, lateMedievalEra, earlyModernEra, modernEra](과거 먼저)
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source·trims는 두지 않는다: source가 다른 시대 era와 다르면 joinEras가 이어 붙이지 못하고(C1·C2 era에 source 없음), 깎기는 C3에 없다(COMMON 2절 — 0단계 결정 8)
//
// ── 중앙아시아 C3 짜임 안내 (C3 뼈대 2026-11-06 — 근거: docs/central-asia/00-scope.md, C3 창구 ② 운영자 결정 Q1~Q12, 결정 맞춤 M12~M24 — ca3/c3/COMMON.md 2·3절) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 다섯 구역(taklamakan-desert·karakum-desert·kyzylkum-desert·betpak-dala·ustyurt-plateau) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습(조약 해, 없으면 실효 지배가 굳은 해). 원정·약탈·되돌려진 점령·명목 복속은 칠하지 않음. 그 나라 땅이 아니면 비운다(voids에 이유). 새 버전은 1만 km² 넘게 바뀔 때만.
// 이 시대의 운영자 결정 요지(원문 ca3/research/C3-DECISIONS.md, 기본값 B1~B32·C3-SEAMS M1~M11 그대로): Q1 아바스 ~891·타히르 821~873·사파르·사만 892~999·가즈니·셀주크·호라즘 ~1219·투르크 샤히 821·힌두 샤히 822~·구르 / Q2 가즈니 본거지 1152~1159만(1160~1172 비움), 구르 끝 1215 /
//   Q4 토번 호탄 790~842·위구르 투루판 792~839 / Q5 카라한은 시르다리야 도시 띠·제티수·이리만 / Q6 몽골 제국 1218~1219 신장·제티수(서요 땅).
// 결정 맞춤(COMMON 3절): M16 투르크 샤히 821 한 해는 W2가 칠함, 822 힌두 샤히 / M21 구르 왕조 항목 to 1215(뼈대가 고침) / M22 새 항목 from은 사료의 시작 해 / M19 몽골 제국 1218~1219 서요 땅
// 칸(부딪침 막기, COMMON 4절): 칸 경계는 조각 경계 또는 시대 경계라 칼선은 칸을 넘지 않는다. 각 칸은 이 파일의 자기 칸 머리('C3 <칸> …' 겹줄 머리)와 그 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수 모두). 최상위 이름·import 별칭·ownSplit 묶음 이름은 칸 앞머리. 이 시대의 칸: W2(W2_ — 서 61조각(W1A 46 + W1T 15)) · E2(E2_ — 동 23조각(E1과 같음)).
//   자기 몫이 아닌 조각은 줄을 적지 않는다(fillTables가 주인 null로 채움). 칸 밖 공통 줄(import·도우미·BOUNDS·표 만들기·버전·맞물림 검사·빈 땅 검사 구역)은 고치지 않는다(결과 노트 6절).
//   칸 조각 목록은 ./cuts-c3.mjs의 C3_W1A_IDS·C3_W1T_IDS·C3_W_IDS·C3_E_IDS(칸 땅 직접 재기의 --pieces도 이 목록).
// 칼선·도형 상수: C1·C2 상수는 ./cuts.mjs(C1 A_·W_·E_, C2 A_GROUPS·EK_CUT_W1·EK_CUT_KOK·EK_CUT_KARATAU·EX_T1·EX_T2), C3 새 칼선은 ./cuts-c3.mjs(칸마다 자기 머리 아래 <앞머리>CUT_…)에 둔다.
//   자기 앞머리 별칭으로 가져온다: import { E_S_KASH as E1_S_KASH, EX_T2 as E1_T2 } from './cuts.mjs' · import { W1A_CUT_MERV } from './cuts-c3.mjs'. 좌표를 베끼지 않는다(check:generator).
//   다음 라운드 칸(W2·W3·E3·J)은 앞 라운드 칸이 cuts-c3.mjs에 둔 칼선을 가져다 쓰기만 한다.
// 앞 권역 나라 늘리기(권역 파일 EXTENDABLE — 칸은 그 파일을 고치지 않음): 나라 id를 소유표 주인으로 쓰면 joinEras가 그 나라 버전에 더한다. 칸별:
//   W1A: sasanian-empire [600, 651)·rashidun-caliphate [651, 661)·umayyad-caliphate [661, 751)·abbasid-caliphate [750, 892)·turk-shahi [665, 822) / W1T: umayyad·abbasid /
//   E1: tang [640, 791)·tibet [670, 843) / W2: abbasid·tahirid-dynasty [821, 874)·saffarid-dynasty [861, 1004)·samanid-empire [892, 1000)·ghaznavid-empire [977, 1187)·seljuk-empire [1037, 1195)
//   ·khwarazmian-empire [1077, 1221)·ghurid-dynasty [1175, 1216)·turk-shahi·hindu-shahi [822, 1027) / E2: tibet·samanid·mongol-empire [1218, 1264) / W3: khwarazmian·mongol-empire·golden-horde [1260, 1396)·timurid-empire [1370, 1507) /
//   E3: mongol-empire·golden-horde·timurid. (uyghur는 내륙아시아 빈 땅 채우기 대상이라 늘림 줄이 없다 — 권역 파일 주석)
//   늘릴 땅은 그해 원래 도형과 겹치면 안 된다(1 km² 넘으면 생성기가 멈춤) — 단위를 나눌 때 prevMinusOf로 원래 도형을 떼어 주인 null 부분으로 둔다(이 권역 안 원래 도형은 신장 쪽 tang·tibet·mongol-empire만 — prev.mjs 주석).
//   원래 버전이 없는 해는 더할 땅만으로 새 버전이 생긴다(engine.mjs '앞 권역 나라 늘리기' 원래 버전 없는 해). 깎기는 없다(이 파일에 trims를 두지 않음).
// 다른 권역 도형 빼기: ./prev.mjs의 prevMinusOf(from, to, except)가 [from, to) 동안 겹치는 앞 권역 나라(PREV_IDS — C3 측정으로 신장 쪽 열일곱을 더함)의 원래 도형을 돌려준다.
//   이 시대에 앞 권역 도형이 있는 땅은 신장(CN-XJ)뿐(동쪽 띠 1,393~2,250 km²와 토번·토욕혼·수·몽골 제국·원 — ca3/c3/skel/cells.txt). 서 61조각·카자흐스탄·키르기스는 0 km².
//   prevMinusOf는 권역 전체를 보므로 칸 땅으로 잘라 해마다 확인하는 A_prevSpan(from, to, 칸 땅)(cuts.mjs, 별칭으로 가져옴)을 쓰면 자기 칸 해에만 멈춘다.
// 시대 경계 맞물림(COMMON 3절 M24·6절): 앞·뒤 시대가 이어 그리는 항목은 이 시대 끝 해까지 칠하고 다음 시대 첫 해부터 이어 칠한다 — 아래 SEAM_OUT(마지막 버전 to = ERA_END)·SEAM_IN(첫 버전 from = ERA_START)이 확인한다.
//   같은 id는 경계 앞뒤에 같은 조각·같은 칼선 상수로 그린다(대칭차 목표 0 — ca3/c3/skel/seam.mjs <사본> <뒤 해> <id…>로 잰다). 앞 시대: early-medieval.mjs · 뒤 시대: late-medieval.mjs
// 표 경계 해: 칸마다 <앞머리>BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(ERA_START·ERA_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = 뼈대 측정(ca3/c3/skel/cells.txt·prev-overlap.txt)에서 그 칸 안 앞 권역 도형이 바뀌는 해 + COMMON 5절의 그 칸 경계 해.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 ERA_START(821)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(앞 권역 도형이 덮거나 voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('high-medieval');

const ERA_START = 821; // 이 시대 파일의 첫 해(821년 말 모습). 그 앞은 early-medieval.mjs
const ERA_END = 1220; // 마지막 표의 끝(미포함) = late-medieval.mjs의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < ERA_START || e[0] >= ERA_END)) {
    throw new Error(`central-asia high-medieval: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${ERA_START} 이상 ${ERA_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia high-medieval: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = ERA_START, to = ERA_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia high-medieval: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia high-medieval: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia high-medieval: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia high-medieval: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia high-medieval: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── C3 W2 서 가운데 (아프가니스탄·트란스옥시아나·호라즘·페르가나 — 최상위 이름 W2_) ──
// 조각: 서 61조각(W1A 46 + W1T 15). 정의 항목 mamunid-dynasty·western-karakhanid. 블록 글: khwarazmian-empire(COMMON 5절), 구르 왕조 항목 글(Q2·M21)
// 늘리는 나라: abbasid-caliphate(821~891)·tahirid-dynasty [821, 874)·saffarid-dynasty [861, 1004)·samanid-empire [892, 1000)·ghaznavid-empire [977, 1187)·seljuk-empire [1037, 1195)·khwarazmian-empire(1077~1219)·ghurid-dynasty [1175, 1216)·turk-shahi(821)·hindu-shahi [822, 1027). 남의 항목 칠함: zunbils·afrighid-dynasty·ustrushana-afshins(앞 시대 이음)·karakhanid-dynasty(999 트란스옥시아나 — 정의 E2)·qara-khitai(vassal_of만)
// 표 경계 해 처음 값: 앞 권역 도형 없음(측정 0 km²) — COMMON 5절·늘림 표의 해 822·861·870·874·892·977·995·999·1000·1004·1017·1027·1037·1041·1077·1152·1160·1175·1187·1195·1213·1216
// 짜임(W2 칸 2026-11-06): 주인 줄의 해는 표 경계와 상관없이 적을 수 있어(sliceLine) 표 경계는 나눔 묶음이 바뀌는 해 둘만 둔다 —
//   892 트란스옥시아나 나눔(앞 칸 W1T 나눔 → C2 1505 부하라 칸국 모양) · 995 호라즘 나눔(아프리그 A_K65 → 구르간지 중심 왼쪽 기슭 A_K73, 맞춤 M14)
const W2_BOUNDS = [892, 995];
// 앞 칸(W1A·W1T)의 부분 목록·칼선과 C1 상수를 그대로 가져온다(같은 조각·같은 차례로 나누어 820↔821 모양이 같음 — 맞춤 M24, 좌표를 다시 적지 않음)
import { W1A_TM_IDS as W2_TM_IDS, W1A_TM_PARTS as W2_TM_PARTS, W1A_AF_IDS as W2_AF_IDS, W1A_AF_PARTS as W2_AF_PARTS, W1A_KH_IDS as W2_KH_IDS, W1A_KH_PARTS as W2_KH_PARTS,
  W1T_CUT_KASHKA as W2_CUT_KASHKA, W1T_CUT_USTRU as W2_CUT_USTRU, C3_W1T_IDS as W2_W1T_IDS } from './cuts-c3.mjs';
import { A_HAZ as W2_HAZ, A_K73 as W2_K73, W_CUT_BUKHARA_KYZYLKUM as W2_CUT_KYZYLKUM, W_CUT_TURKESTAN as W2_CUT_TURKESTAN, W_CUT_KHUJAND as W2_CUT_KHUJAND,
  W_KOKAND_IDS as W2_KOKAND_IDS, W_Z_OLD as W2_Z_OLD, W_Z66 as W2_Z66 } from './cuts.mjs';
const W2_ABB = 'abbasid-caliphate', W2_TAH = 'tahirid-dynasty', W2_SAF = 'saffarid-dynasty', W2_SAM = 'samanid-empire', W2_GHZ = 'ghaznavid-empire', W2_SEL = 'seljuk-empire';
const W2_KHW = 'khwarazmian-empire', W2_GHU = 'ghurid-dynasty', W2_KRK = 'karakhanid-dynasty', W2_WKR = 'western-karakhanid';
// 그해 말 주인 줄(근거는 결과 노트 2절). 늘린 나라는 권역 파일 EXTENDABLE 범위 안에서만(아바스 ~891·사만 892~999·구르 1175~ 등)
//   메르브 띠·아할 기슭·아무다리야 띠: 821 타히르(호라산 총독, 도읍 메르브) · 873 사파르(니샤푸르 점령) · 900 사만(발흐 승리) · 1000 가즈니(999 호라산, 이란 쪽 칠하기와 같은 해) ·
//   1040 셀주크(단다나칸) · 1157 비움(산자르 죽음 뒤 오구즈·토후 다툼 — 이란 쪽 호라산 1157~1197 비움과 같은 까닭) · 1181 호라즘(술탄 샤가 메르브·사라흐스를 쥠, 1193 테케시가 이음)
const W2_KHORASAN = [[821, W2_TAH], [873, W2_SAF], [900, W2_SAM], [1000, W2_GHZ], [1040, W2_SEL], [1157, null], [1181, W2_KHW]];
//   헤라트·바드기스: 821 타히르 · 870 사파르 · 900 사만 · 1000 가즈니 · 1040 셀주크 · 1157 비움(기본값 B12) · 1175 구르 · 1206 호라즘
const W2_HERAT = [[821, W2_TAH], [870, W2_SAF], [900, W2_SAM], [1000, W2_GHZ], [1040, W2_SEL], [1157, null], [1175, W2_GHU], [1206, W2_KHW]];
//   시스탄(자란즈·파라 오아시스): 821 아바스(이란 쪽 시스탄과 같음) · 861 사파르 · 912 사만 · 923 사파르(이란 쪽 시스탄 줄과 같은 해) · 1002 가즈니 · 1041 비움(이란 쪽 1000~ 비움과 이어 맞춤 — 기본값 D11)
const W2_SISTAN = [[821, W2_ABB], [861, W2_SAF], [912, W2_SAM], [923, W2_SAF], [1002, W2_GHZ], [1041, null]];
//   자불·가즈니·위쪽 헬만드: 821 준빌 · 870 사파르(야쿠브의 준빌 정복) · 900 비움(사파르가 시스탄만 남기고 무너진 뒤 라위크 가문·튀르크 군벌) · 977 가즈니 ·
//   1151 비움(구르의 가즈니 불태움) · 1152 가즈니(산자르의 도움으로 되찾음) · 1160 비움(왕조가 라호르로 옮긴 뒤 오구즈 — 결정 Q2) · 1175 구르(1173 가즈니 차지, 늘림 범위 1175부터) · 1215 호라즘
const W2_ZABUL = [[821, 'zunbils'], [870, W2_SAF], [900, null], [977, W2_GHZ], [1151, null], [1152, W2_GHZ], [1160, null], [1175, W2_GHU], [1215, W2_KHW]];
//   카불 골짜기: 821 투르크 샤히(맞춤 M16) · 822 힌두 샤히 · 870 사파르 · 880 힌두 샤히 · 965 비움(기본값 B13) · 977 가즈니 · 1151 비움 · 1175 구르 · 1215 호라즘
const W2_KABUL = [[821, 'turk-shahi'], [822, 'hindu-shahi'], [870, W2_SAF], [880, 'hindu-shahi'], [965, null], [977, W2_GHZ], [1151, null], [1175, W2_GHU], [1215, W2_KHW]];
//   구르 고원(AF-GHO − 하자라자트): 비움(산지 토후) · 1011 가즈니(마흐무드의 구르 정복) · 1150 비움(알라 앗딘의 자립) · 1175 구르(항목 시작) · 1215 호라즘
const W2_GHUR = [[821, null], [1011, W2_GHZ], [1150, null], [1175, W2_GHU], [1215, W2_KHW]];
//   아무다리야 남쪽 토하리스탄(발흐·주즈잔·파르얍·사르이풀·사망간 + 쿤두즈·타하르·바글란): 821 아바스 · 873 사파르(호라산과 함께) · 900 사만(발흐 승리) · 1000 가즈니 · 1040 셀주크 ·
//   1157 비움(산자르 뒤 오구즈·서요 종주 아래 토후들) · 1206 호라즘
const W2_TOKH_S = [[821, W2_ABB], [873, W2_SAF], [900, W2_SAM], [1000, W2_GHZ], [1040, W2_SEL], [1157, null], [1206, W2_KHW]];
//   아무다리야 북쪽 토하리스탄(테르메즈·차가니얀·후탈 — UZ-SU·TJ-KT·TJK-368·TJ-DU): 821 아바스 · 892 사만 · 999 카라한(아무다리야가 가즈니와의 경계) · 1041 서카라한 · 1206 호라즘
const W2_TOKH_N = [[821, W2_ABB], [892, W2_SAM], [999, W2_KRK], [1041, W2_WKR], [1206, W2_KHW]];
// 투르크멘·아프간 나눔(W1A 부분 목록 그대로, 시대 내내)
const W2_TM = ownSplit('W2_투르크멘', W2_TM_IDS, W2_TM_PARTS, '카라쿰', { 메르브: W2_KHORASAN, 아할: W2_KHORASAN, 아무: W2_KHORASAN, 카라쿰: [[ERA_START, null]] });
const W2_AF = ownSplit('W2_아프간', W2_AF_IDS, W2_AF_PARTS, '사막', {
  하자라자트: [[ERA_START, null]], 카피리스탄: [[ERA_START, null]], 시스탄: W2_SISTAN, 헬만드: W2_ZABUL, 자불: W2_ZABUL, 카불: W2_KABUL, 사막: [[ERA_START, null]],
});
// 구르 고원: AF-GHO에서 C1 하자라자트(A_HAZ)를 뗀 나머지(새 칼선 없음)
const W2_GO = ownSplit('W2_구르', ['AF-GHO'], [['하자라자트', W2_HAZ]], '구르', { 하자라자트: [[ERA_START, null]], 구르: W2_GHUR });
// 호라즘: 821~994 아프리그 왕조(W1A 모양 A_K65 그대로) / 995~ 마문 왕조·가즈니·셀주크·호라즘 제국(구르간지 중심 왼쪽 기슭 A_K73 — 1219 말 모양 맞춤 M14와 같음)
const W2_KHA = ownSplit('W2_호라즘앞', W2_KH_IDS, W2_KH_PARTS, '밖', { 호라즘: [[ERA_START, 'afrighid-dynasty']], 밖: [[ERA_START, null]] }, { from: ERA_START, to: 995 });
//   995 마문 왕조(구르간지의 마문이 카트의 아프리그를 무너뜨림) · 1017 가즈니(마흐무드의 호라즘 편입) · 1041 셀주크(1041~1043 샤 말리크를 거쳐 셀주크 — 3년 안) · 1077 호라즘 제국(아누슈티긴 총독)
const W2_KHB = ownSplit('W2_호라즘뒤', W2_KH_IDS, [['호라즘', W2_K73]], '밖', { 호라즘: [[995, 'mamunid-dynasty'], [1017, W2_GHZ], [1041, W2_SEL], [1077, W2_KHW]], 밖: [[995, null]] }, { from: 995, to: ERA_END });
// 트란스옥시아나 821~891: W1T 나눔 그대로(부하라 키질쿰 칼선·카슈카다리야 오아시스·소그드주 넷·지작 우스루샤나)
const W2_BUA = ownSplit('W2_부하라앞', ['UZ-BU', 'UZ-NW'], [['키질쿰', W2_CUT_KYZYLKUM]], '오아시스', { 키질쿰: [[ERA_START, null]], 오아시스: [[ERA_START, W2_ABB]] }, { from: ERA_START, to: 892 });
const W2_QAA = ownSplit('W2_카슈카다리야앞', ['UZ-QA'], [['오아시스', W2_CUT_KASHKA]], '사막산지', { 오아시스: [[ERA_START, W2_ABB]], 사막산지: [[ERA_START, null]] }, { from: ERA_START, to: 892 });
const W2_SUA = ownSplit('W2_소그드주앞', ['TJ-SU'], [['자라프샨', W2_CUT_TURKESTAN], ['페르가나', W2_CUT_KHUJAND], ['우스루샤나', W2_CUT_USTRU]], '후잔드', {
  자라프샨: [[ERA_START, W2_ABB]], 페르가나: [[ERA_START, W2_ABB]], 우스루샤나: [[ERA_START, 'ustrushana-afshins']], 후잔드: [[ERA_START, null]],
}, { from: ERA_START, to: 892 });
const W2_JIA = ownSplit('W2_지작앞', ['UZ-JI'], [['우스루샤나', W2_CUT_USTRU]], '지작', { 우스루샤나: [[ERA_START, 'ustrushana-afshins']], 지작: [[ERA_START, null]] }, { from: ERA_START, to: 892 });
//   통째 조각 821~891: 사마르칸트·페르가나 분지·샤시 아바스(사만 가문 총독도 아바스 색 — 기본값 B11), 미르자출 비움(W1T와 같음). 892부터는 아래 나눔이 받으므로 891까지만 적는다
own(['UZ-SA', ...W2_KOKAND_IDS, 'UZ-TO', 'UZ-TK'], [[ERA_START, W2_ABB]]);
own(['UZ-SI'], [[ERA_START, null]]);
// 트란스옥시아나 892~1219: C2 1505 부하라 칸국 모양(맞춤 M14 — W3의 1220 몽골 제국과 같은 모양). C2 나눔 차례 그대로 러시아 1854·1864·1866 구역(타슈켄트·일라크는 먼저 떼어 남김)과
//   키질쿰 칼선 북쪽을 빼고 나머지 전부 — 892 이스마일의 부하라 천도로 사만 왕조가 후잔드·지작·미르자출까지 한 나라로 다스림(우스루샤나도 892 사만 주)
//   892 사만 · 999 카라한(부하라 차지) · 1041 서카라한(동서 분열, 1089 셀주크·1141 서요 속국) · 1210 호라즘(사마르칸트 차지, 1212 서카라한 끝은 1년 차라 고치지 않음)
const W2_TR = ownSplit('W2_트란스', W2_W1T_IDS, [['러시아', D(U(W2_Z_OLD, W2_Z66), F('UZ-TO', 'UZ-TK'))], ['키질쿰', I(F('UZ-BU', 'UZ-NW'), W2_CUT_KYZYLKUM)]], '본토', {
  러시아: [[892, null]], 키질쿰: [[892, null]], 본토: [[892, W2_SAM], [999, W2_KRK], [1041, W2_WKR], [1210, W2_KHW]],
}, { from: 892, to: ERA_END });
// 통째 조각
own(['AF-HER', 'AF-BDG'], W2_HERAT);
own(['AF-ZAB'], W2_ZABUL);
own(['AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AFG-1769', 'AFG-1772'], W2_KABUL);
own(['AF-BAL', 'AF-JOW', 'AF-FYB', 'AF-SAR', 'AF-SAM', 'AF-KDZ', 'AF-TAK', 'AF-BGL'], W2_TOKH_S);
own(['UZ-SU', 'TJ-KT', 'TJK-368', 'TJ-DU'], W2_TOKH_N);
// 시대 내내 주인 없음(줄을 적지 않음): 바미안·와르다크·다이쿤디·누리스탄·호스트·팍티아·팍티카·바다흐샨·파미르·발칸(까닭은 아래 voids)
const W2_NONE = ['AF-BAM', 'AF-WAR', 'AFG-1753', 'AF-NUR', 'AF-KHO', 'AF-PIA', 'AF-PKA', 'AF-BDS', 'TJ-GB', 'TM-B'];
const W2_voids = () => [
  // 시대 내내: 바미안(바미안 샤 — 경계 사료 없음, 기본값 D9)·하자라자트·와르다크·다이쿤디(산지)·누리스탄과 카피리스탄(카피르 부족 땅)·호스트·팍티아·팍티카(파슈툰 부족 땅)·
  //   바다흐샨·파미르(실효 지배 근거 없음 — 기본값 B9)·발칸과 카라쿰(유목·사막 — 기본값 B8)·헬만드 칼선 밖 사막(다시티마르고·레지스탄)
  [ERA_START, ERA_END, U(F(...W2_NONE), geomOfUnit(W2_TM.카라쿰), geomOfUnit(W2_AF.하자라자트), geomOfUnit(W2_AF.카피리스탄), geomOfUnit(W2_AF.사막), geomOfUnit(W2_GO.하자라자트))],
  B(ERA_START, 995, W2_KHA.밖), // 호라즘 오아시스 밖(카라칼파크 사막·옛 아랄해 기슭) — W1A와 같음
  B(995, ERA_END, W2_KHB.밖), // 호라즘 왼쪽 기슭 밖: 위 땅 + 오른쪽 기슭(카트 둘레 강가 띠는 1만 km² 미만이라 1219 말 모양 A_K73에 맞춰 뺌 — 결과 노트 7절)
  B(ERA_START, 892, W2_BUA.키질쿰, W2_QAA.사막산지, W2_JIA.지작, W2_SUA.후잔드), // 821~891 키질쿰·카르시 초원과 히사르 산지·지작·후잔드: W1T와 같은 까닭(오아시스 나라 밖, 기본값 B8)
  V(ERA_START, 892, 'UZ-SI'), // 821~891 미르자출 초원(W1T와 같음)
  B(892, ERA_END, W2_TR.키질쿰, W2_TR.러시아), // 892~ 키질쿰 사막(유목민 땅)과 C2 1505 모양 밖 러시아 구역 몫(시르다리야 아래쪽 초원)
  B(ERA_START, 1011, W2_GO.구르), // 구르 고원 821~1010: 산지 토후(마흐무드 정복 전)
  B(1150, 1175, W2_GO.구르), // 구르 1150~1174: 알라 앗딘 후사인이 가즈니에서 자립한 뒤(구르 왕조 항목은 1175부터 — 결정 Q2)
  B(900, 977, W2_AF.헬만드, W2_AF.자불), V(900, 977, 'AF-ZAB'), // 자불·가즈니·위쪽 헬만드 900~976: 사파르가 시스탄만 남긴 뒤 라위크 가문·알프티긴 등 튀르크 군벌(항목 없음)
  B(1151, 1152, W2_AF.헬만드, W2_AF.자불), V(1151, 1152, 'AF-ZAB'), // 1151: 구르 알라 앗딘이 가즈니를 불태우고 물러남(결정 Q2)
  B(1160, 1175, W2_AF.헬만드, W2_AF.자불), V(1160, 1175, 'AF-ZAB'), // 1160~1174: 가즈니 왕조가 라호르로 옮긴 뒤 오구즈가 쥠(결정 Q2 ①, 구르는 1175부터)
  B(965, 977, W2_AF.카불), V(965, 977, 'AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AFG-1769', 'AFG-1772'), // 카불 965~976: 힌두 샤히가 잃은 뒤 가즈니 전(기본값 B13)
  B(1151, 1175, W2_AF.카불), V(1151, 1175, 'AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AFG-1769', 'AFG-1772'), // 카불 1151~1174: 가즈니 왕조 본거지가 무너진 뒤 구르 전
  B(1157, 1181, W2_TM.메르브, W2_TM.아할, W2_TM.아무), // 메르브·아할·아무다리야 띠 1157~1180: 산자르 죽음 뒤 오구즈·토후 다툼(결과 노트 6절)
  V(1157, 1175, 'AF-HER', 'AF-BDG'), // 헤라트·바드기스 1157~1174: 셀주크 총독 뒤 알려진 주인 없음(기본값 B12)
  V(1157, 1206, 'AF-BAL', 'AF-JOW', 'AF-FYB', 'AF-SAR', 'AF-SAM', 'AF-KDZ', 'AF-TAK', 'AF-BGL'), // 아무다리야 남쪽 토하리스탄 1157~1205: 산자르 뒤 카를루크·오구즈 토후(서요 종주) — 결과 노트 6절
  B(1041, ERA_END, W2_AF.시스탄), // 시스탄 1041~: 자란즈의 나스르 말리크 왕조(셀주크·구르·호라즘에 명목 복속 — 이란 쪽 시스탄 1000~ 비움과 같음)
];
// ── C3 W2 끝 ──

// ── C3 E2 동 가운데 (카라한·고창 위구르·호탄·서요 — 최상위 이름 E2_) ──
// 조각: 동 23조각(E1과 같음). 정의 항목 karakhanid-dynasty·eastern-karakhanid·qocho-uyghur-kingdom·khotan-kingdom·qara-khitai. 블록 글: karakhanid-dynasty·qara-khitai·qocho-uyghur-kingdom(COMMON 5절)
// 늘리는 나라: tibet(821~842)·samanid-empire(시르다리야 쪽)·mongol-empire(1218~1219 서요 땅)·khwarazmian-empire(1210~1219 시르다리야 도시 띠 — 창구 ③ 결정 Q-D). 남의 항목 칠함: karluk-yabgu-state(821~839, 글 E1). uyghur는 늘림 줄이 없어 쓰지 않는다(E1 칸 머리)
// 표 경계 해 처음 값: 칸 땅(신장) 안 앞 권역 도형이 바뀌는 해 840·843·907·936·1036·1038·1125·1206(skel/prev-overlap.txt) + COMMON 5절의 해 851·866·892·934·1000·1006·1041·1134·1218
//   구현에서 더한 해: 876(고창 위구르의 하미)·893(사만 왕조의 타라즈)·980(카라한 왕조의 이스피자브)·1096(동카라한의 악수·쿠차)·1212(쿠출루크의 타림 서쪽). 1000은 뺌(이 칸 땅은 1000에 바뀌지 않음)
const E2_BOUNDS = [840, 843, 851, 866, 876, 892, 893, 907, 934, 936, 980, 1006, 1036, 1038, 1041, 1096, 1125, 1134, 1206, 1212, 1218];
// C1·C2 땅 상수(cuts.mjs — 이름·식 그대로, 좌표를 베끼지 않음). 신장은 C2 EX와 같은 차례(하미 → 북 → 카슈가르 → 악수 → 호탄 → 투루판 → 코를라)로 앞 도형을 빼서 겹침 0,
//   다만 '북'(톈산 북쪽) 앞에 이리 골짜기(E_S_ILI ∩ 북)와 우루무치 띠(E_S_URUM + 북정 띠 E2_CUT_BEITING ∩ 북)를 먼저 떼어 준가르와 가른다(E1과 같은 묶음 — 시대 경계 821 맞물림)
import { E_S_HAMI as E2_S_HAMI, E_S_NORTH as E2_S_NORTH, E_S_ILI as E2_S_ILI, E_S_URUM as E2_S_URUM, E_S_KASH as E2_S_KASH, E_S_AKSU as E2_S_AKSU, E_S_KHOTAN as E2_S_KHOTAN } from './cuts.mjs';
import { E2_CUT_BEITING } from './cuts-c3.mjs'; // 북정(비슈발리크) 띠 — C1 우루무치 띠 동쪽에 붙임(이 칸의 새 칼선)
import { EX_T1 as E2_T1, EX_T2 as E2_T2, EK_CUT_KARATAU as E2_CUT_KARATAU, EK_CUT_KOK as E2_CUT_KOK } from './cuts.mjs';
const E2_KL = 'karluk-yabgu-state'; // 카를루크 야브구국(766~839 — 정의·글은 E1, 821~839는 이 칸이 칠함)
const E2_KAR = 'karakhanid-dynasty'; // 카라한 왕조 840~1040(840 카를루크의 야브구가 카간을 칭함 — 발라사군)
const E2_EKH = 'eastern-karakhanid'; // 동카라한 왕조 1041~1211(1041 동·서 분열 — 발라사군, 1134 뒤 카슈가르)
const E2_QK = 'qara-khitai'; // 서요 1134~1217(1134 발라사군, 1211 나이만 쿠출루크가 빼앗음 — 이름은 그대로)
const E2_MO = 'mongol-empire'; // 몽골 제국 1218~1219(M19 — 1218 제베가 쿠출루크를 죽임, 서요 땅만. 시르다리야 도시 띠는 1210~1219 호라즘 — 창구 ③ 결정 Q-D. 1220부터 E3)
const E2_KHW = 'khwarazmian-empire'; // 호라즘 제국 1210~1219 시르다리야 도시 띠(창구 ③ 결정 Q-D — 늘림 [1077, 1221) 안)
const E2_QO = 'qocho-uyghur-kingdom'; // 고창 위구르 왕국 866~(1220부터 E3 — M13)
// 주인 줄(그해 말 모습 — 결정 Q4·Q5·Q6, 기본값 B1·B2·B3·B27·B30, 맞춤 M13·M19)
const E2_LINES = {
  // 세미레치예(제티수 — 알마티 주·추강·탈라스·이식쿨·나린과 잠빌의 카라타우 밖)와 이리 골짜기: 카를루크(발라사군·수야브) → 840 카라한(발라사군 도읍) → 1041 동카라한 →
  //   1134 서요(야율대석이 발라사군을 얻음) → 1218 몽골 제국(쿠출루크 피살, M19). 1211~1217 쿠출루크(나이만)는 서요의 이름 그대로
  제티수: [[821, E2_KL], [840, E2_KAR], [1041, E2_EKH], [1134, E2_QK], [1218, E2_MO]],
  // 시르다리야 도시 띠 중 이스피자브(사이람)·투르키스탄·오트라르 쪽(남카자흐스탄의 카라타우 칼선 안): 840 사만 가문의 누흐가 이스피자브를 얻음 — 사만 왕조 늘림은 892부터라
  //   840~891은 비움(사만 가문을 섬긴 현지 튀르크 왕가 — 사만 가문은 타히르 왕조 아래 총독, 늘림 줄 밖), 892 사만 왕조(이스마일 — 현지 왕가가 군역·주화로 섬김), 980 카라한 왕조(누흐 2세 때 이스피자브를 빼앗음 — 위키백과 Isfijab),
  //   1041 동카라한(사이람은 동카라한 땅), 1134 서요, 1210 호라즘 제국(창구 ③ 결정 Q-D — 1210 탈라스 싸움 뒤 무함마드 2세가 시르다리야 도시를 쥠, 1218 오트라르 총독 이날추크의 몽골 상단 학살,
  //   1219년 12월~1220년 2월 몽골의 포위·함락 — 위키백과 Siege of Otrar: 1219년 말 호라즘 땅, 1220부터 E3 몽골 제국)
  시르다리야: [[821, E2_KL], [840, null], [892, 'samanid-empire'], [980, E2_KAR], [1041, E2_EKH], [1134, E2_QK], [1210, E2_KHW]],
  // 타라즈(잠빌의 카라타우 칼선 안): 840 카라한, 893 사만 왕조 이스마일의 탈라스 정복, 980 카라한(이스피자브와 같은 해 — 더 북쪽이라 늦어도 그해), 1041 동카라한, 1134 서요, 1218 몽골 제국
  타라즈: [[821, E2_KL], [840, E2_KAR], [893, 'samanid-empire'], [980, E2_KAR], [1041, E2_EKH], [1134, E2_QK], [1218, E2_MO]],
  // 시르다리야 중류(크질오르다의 칼선 안 — 사브란·시그나크 쪽 도시): 821~979 비움(E1은 투르기시·카를루크를 세미레치예 정주권만 칠해 699~820 비움 — 합치기가 821 맞물림으로 맞춤), 840~979도 비움(이스피자브 쪽이 사만 가문·사만 왕조 땅이라
  //   카라한 본토와 떨어지고, 시르다리야 하류는 오구즈 야브구국 유목지와 맞닿은 변경 — B2), 980 카라한(이스피자브와 함께 이어짐), 1041 동카라한, 1134 서요,
  //   1210 호라즘 제국(창구 ③ 결정 Q-D — 오트라르 쪽 띠와 함께, 잔드·시그나크는 호라즘 땅으로 1219년 몽골 침입을 받음)
  악메체트: [[821, null], [980, E2_KAR], [1041, E2_EKH], [1134, E2_QK], [1210, E2_KHW]],
  // 카자흐 초원(카라타우 북쪽·크질오르다 칼선 밖·중부·북부·서부·동카자흐스탄): 오구즈 야브구국·키메크–킵차크 유목지라 시대 내내 비움(B2 — 실효 지배 근거 없음, 결정 Q5 ①)
  초원: [[821, null]],
  // 이리 골짜기(쿨자·알말리크): 세미레치예와 같은 주인(결정 Q5 ① — 이리 포함)
  이리: [[821, E2_KL], [840, E2_KAR], [1041, E2_EKH], [1134, E2_QK], [1218, E2_MO]],
  // 우루무치 띠(베슈발리크 — 고창 위구르의 여름 도읍): 821~865 비움(위구르 카간국 땅이나 uyghur는 늘림 줄이 없음 — 뼈대 결과 5, 840~865 위구르 난민은 B3), 866 고창 위구르
  우루무치: [[821, null], [866, E2_QO]],
  // 투루판 분지(고창·카라샤르 분지 북쪽): 821~839 비움(결정 Q4의 위구르 투루판 792~839 — uyghur 늘림 줄이 없어 창구 ③ 질문, 지금은 비움), 840~865 비움(B3), 866 고창 위구르(푸구 쥔의 고창 확보)
  투루판: [[821, null], [866, E2_QO]],
  // 카라샤르–코를라(언기 — C2 칼선 T2): 821~865 비움(토번·위구르 다툼, 843 위구르 난민의 카라샤르는 B3), 866 고창 위구르(언기·쿠차가 고창 위구르의 서쪽 땅)
  코를라: [[821, null], [866, E2_QO]],
  // 하미(이주): 821~875 비움(위구르 카간국·토번·귀의군 사이 — 하미를 쥔 나라가 굳지 않음), 876 고창 위구르가 이주를 얻음(904~911 금산국은 B3 — 칠하지 않음)
  하미: [[821, null], [876, E2_QO]],
  // 준가르(톈산 북쪽에서 이리·우루무치 띠를 뺀 땅 — 알타이·타르바가타이·준가르 분지): 키메크·바스밀·나이만 유목지라 시대 내내 비움(B2·B27, M19 — 몽골 제국의 준가르는 1220부터 E3)
  북: [[821, null]],
  // 카슈가르(소륵): 821~933 비움(토번 물러난 뒤 카를루크·야그마 사이 — 주인이 굳지 않음), 934 사투크 부그라 칸의 카슈가르(카라한), 1041 동카라한(1134 뒤 도읍),
  //   1212 쿠출루크(서요 — 1211 동카라한 마지막 왕자 피살 뒤 카슈가르·호탄 정복), 1218 몽골 제국
  카슈가르: [[821, null], [934, E2_KAR], [1041, E2_EKH], [1212, E2_QK], [1218, E2_MO]],
  // 악수·쿠차(구자): 821~865 비움(토번 물러난 뒤 — 843 위구르 난민의 쿠차는 B3), 866 고창 위구르, 1096 동카라한(고창 위구르에게서 악수·쿠차를 빼앗음), 1212 쿠출루크(서요), 1218 몽골 제국
  악수: [[821, null], [866, E2_QO], [1096, E2_EKH], [1212, E2_QK], [1218, E2_MO]],
  // 호탄(우전 — 타클라마칸 안쪽을 따로 빼지 않음, B30): 821~842 토번(결정 Q4 — 792 재점령, 842 랑다르마 뒤 무너짐), 843~850 비움(토번 물러난 뒤 호탄 독립 전),
  //   851 호탄 왕국(울람 왕조 독립), 1006 카라한 왕조(유수프 카디르 칸의 정복), 1041 동카라한, 1212 쿠출루크(서요), 1218 몽골 제국
  호탄: [[821, 'tibet'], [843, null], [851, 'khotan-kingdom'], [1006, E2_KAR], [1041, E2_EKH], [1212, E2_QK], [1218, E2_MO]],
  // 나머지 '동'(롭노르·체르첸·차클리크 쪽 남동부 사막과 쿠루크타그): 사막·유목지라 시대 내내 비움(B27 — C2 창구 ③ 결정 4)
  동: [[821, null]],
};
const E2_cutLine = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];
const E2_ownerAt = (line, y) => line.filter(([yy]) => yy <= y).at(-1)[1];
// 카자흐스탄·키르기스 북부(앞 권역 도형 0 km² — skel/prev-overlap.txt): 시대 내내 한 나눔
const E2_ZHETYSU_IDS = ['KAZ-3207', 'KAZ-4829', 'KG-C', 'KG-GB', 'KG-N', 'KG-T', 'KG-Y']; // 알마티 주·알마티 시·추·비슈케크·나린·탈라스·이식쿨
const E2_KZ_SPLITS = [
  ['E2_잠빌', ['KZ-ZHA'], [['타라즈', E2_CUT_KARATAU]], '세미레치예'],
  ['E2_남카', ['KZ-YUZ'], [['시르다리야', E2_CUT_KARATAU]], '초원'],
  ['E2_크질오르다', ['KZ-KZY', 'KAB'], [['악메체트', E2_CUT_KOK]], '초원'],
];
const E2_SPLIT_IDS = E2_KZ_SPLITS.flatMap(([, ids]) => ids);
const E2_STEPPE_IDS = idsOf('KAZ', 'KAB').filter((id) => !E2_ZHETYSU_IDS.includes(id) && !E2_SPLIT_IDS.includes(id)); // 나머지 카자흐스탄 조각(초원 — 비움)
own(E2_ZHETYSU_IDS, E2_LINES.제티수);
own(E2_STEPPE_IDS, E2_LINES.초원);
const E2_KZ_UNITS = E2_KZ_SPLITS.map(([name, ids, parts, rest]) => {
  const linesOf = (p) => (p === '세미레치예' ? E2_LINES.제티수 : E2_LINES[p]);
  const names = [...parts.map(([p]) => p), rest];
  return { units: ownSplit(name, ids, parts, rest, Object.fromEntries(names.map((p) => [p, linesOf(p)]))), names, linesOf };
});
// 신장(CN-XJ): 앞 권역 도형(위구르·zubu·요·초원 부족 채우기 구역, 당·귀의군·서하·몽골 제국 동쪽 띠, 토번 남쪽 가장자리)이 바뀌는 해마다 나눔
//   — 같은 넓이라도 나라 id가 바뀌는 해(840·907·936·1125)는 모양이 같은지 모르니 나눈다. 늘리는 토번·몽골 제국은 그해 원래 도형을 뺀 땅에만 칠함(겹침 0)
const E2_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]); // 작은 구멍(약 0.01제곱도 미만)은 메운 모양으로 뺀다(C2 EX와 같은 식)
const E2_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6); // 넓이 거의 0인 바늘 조각을 버림
// 앞 권역 원래 도형은 나라 전체라 신장 둘레 상자(신장 바깥 1°)로 먼저 자른다(C2 EX와 같은 식). prevMinusOf는 한 나라에 겹친 버전 둘(토번 663~842 원래·650~842 다른 권역 늘림)을
//   만나면 멈추므로 prevListOf로 그해 버전을 모두 뺀다. [from, to) 안에서 신장 안 넓이가 1 km² 넘게 바뀌면 멈춤(E2_XJ_YEARS를 나눔)
import { box as E2_box } from '../../lib.mjs';
const E2_BOX = (() => {
  const xs = XJ.flat(2);
  return E2_box(Math.min(...xs.map((q) => q[0])) - 1, Math.min(...xs.map((q) => q[1])) - 1, Math.max(...xs.map((q) => q[0])) + 1, Math.max(...xs.map((q) => q[1])) + 1);
})();
const E2_boxed = new Map();
const E2_inBox = (g) => {
  if (!E2_boxed.has(g)) E2_boxed.set(g, E2_noDust(I(E2_filled(g), E2_BOX)));
  return E2_boxed.get(g);
};
const E2_sizeIn = new Map();
const E2_rawMinus = (from, to) => {
  const at = (y) => PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= y && y < t).map(([, , g]) => E2_inBox(g))).filter((g) => g.length);
  const sizeAt = (y) => at(y).reduce((s, b) => {
    if (!E2_sizeIn.has(b)) E2_sizeIn.set(b, deg2(E2_noDust(I(b, XJ))));
    return s + E2_sizeIn.get(b);
  }, 0);
  const ys = new Set();
  for (const id of PREV_IDS) for (const [f, t] of prevListOf(id)) for (const y of [f, t]) if (y > from && y < to) ys.add(y);
  const s0 = sizeAt(from);
  for (const y of ys) if (Math.abs(sizeAt(y) - s0) > 1e-4) throw new Error(`central-asia high-medieval E2: [${from}, ${to}) 안 ${y}년에 신장 안 앞 권역 도형이 바뀜 — E2_XJ_YEARS를 나눈다`);
  const raw = at(from);
  return E2_noDust(raw.length ? D(XJ, ...raw) : XJ);
};
const E2_XJ_SHAPES = [['하미', E2_S_HAMI], ['이리', I(E2_S_NORTH, E2_S_ILI)], ['우루무치', U(E2_S_URUM, I(E2_S_NORTH, E2_CUT_BEITING))], ['북', E2_S_NORTH], ['카슈가르', E2_S_KASH], ['악수', E2_S_AKSU], ['호탄', E2_S_KHOTAN], ['투루판', E2_T1], ['코를라', E2_T2]];
const E2_XJ_YEARS = [ERA_START, 840, 843, 907, 936, 1036, 1038, 1125, 1206, ERA_END];
const E2_XJ_LAYOUTS = E2_XJ_YEARS.slice(0, -1).map((from, i) => {
  const to = E2_XJ_YEARS[i + 1];
  const rest = E2_rawMinus(from, to);
  // 부스러기(0.03제곱도 미만 — 앞 도형 가장자리의 가는 띠)는 칠하지 않고 '앞'(주인 없음)에 둔다(C2 EX와 같은 꼴)
  let left = rest.filter((p) => deg2([p]) >= 0.03);
  const parts = [];
  for (const [name, shape] of E2_XJ_SHAPES) {
    let g = E2_noDust(I(left, shape));
    // 우루무치 띠: C1 E_S_URUM 고리의 마나스강 북쪽 끝(북위 44.75° 위 약 100 km² 세모)이 띠 본체와 떨어진 조각이 되므로 작은 덩어리(0.02제곱도 미만)는 '북'(준가르 — 비움)에 남김
    if (name === '우루무치') g = g.filter((q) => deg2([q]) >= 0.02);
    parts.push([name, g]);
    left = E2_noDust(D(left, name === '우루무치' ? g : shape));
  }
  parts.push(['동', left]);
  const names = parts.map(([p]) => p);
  const units = ownSplit(`E2_신장${from}`, [XJ_ID], parts, '앞', Object.fromEntries(names.map((p) => [p, E2_cutLine(E2_LINES[p], from, to)])), { from, to });
  return { from, to, units, names, linesOf: (p) => E2_LINES[p] };
});
// 비운 땅(fillTables 뒤에 부름): 주인 없는 부분이 같은 기간끼리 한 줄 — 이유는 E2_LINES 줄 주석
//   (카자흐 초원·준가르·남동부 사막은 시대 내내, 우루무치 띠·투루판·코를라 821~865, 하미 821~875, 카슈가르 821~933, 악수 821~865, 호탄 843~850, 이스피자브 쪽 840~891, 크질오르다 쪽 821~979)
const E2_runs = ({ from = ERA_START, to = ERA_END, units, names, linesOf }) => {
  const out = [];
  let run = null;
  for (let y = from; y <= to; y++) {
    const nulls = y < to ? names.filter((p) => E2_ownerAt(linesOf(p), y) === null) : null;
    const key = nulls ? nulls.join('|') : '끝';
    if (run && run.key !== key) {
      if (run.nulls.length) out.push(B(run.from, y, ...run.nulls.map((p) => units[p])));
      run = null;
    }
    if (!run && nulls) run = { key, from: y, nulls };
  }
  return out;
};
const E2_voids = () => [V(ERA_START, ERA_END, ...E2_STEPPE_IDS), ...E2_KZ_UNITS.flatMap(E2_runs), ...E2_XJ_LAYOUTS.flatMap(E2_runs)];
// ── C3 E2 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([ERA_START, ...W2_BOUNDS, ...E2_BOUNDS, ERA_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== ERA_START || BOUNDS.at(-1) !== ERA_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia high-medieval: 표 경계 해 ${BOUNDS.join(', ')}는 ${ERA_START}~${ERA_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia high-medieval: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia high-medieval: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia high-medieval: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia high-medieval: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia high-medieval: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== ERA_END) throw new Error(`central-asia high-medieval: 마지막 표의 끝이 ${joined.TO} (${ERA_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 ERA_END = 1220 — late-medieval.mjs 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 시대 경계 맞물림 검사(COMMON 6절 '시대 경계', 맞춤 M24): 앞·뒤 시대가 이어 그리는 항목은 이 시대에 버전이 있으면
// SEAM_OUT — 마지막 버전이 이 시대 끝 해까지(to = ERA_END = 다음 시대 첫 해), SEAM_IN — 첫 버전이 이 시대 첫 해부터(from = ERA_START). 버전이 없으면 지나감(뼈대)
// (끝 해까지 칠하지 않으면 경계 앞에 틈이, 첫 해부터 칠하지 않으면 경계 뒤에 틈이 생김. 늘린 나라도 이 시대의 versions에 있는 동안 같이 본다 — joinEras가 extensions로 옮기기 전)
const SEAM_OUT = ['khwarazmian-empire', 'mongol-empire', 'qocho-uyghur-kingdom'];
const SEAM_IN = ['abbasid-caliphate', 'turk-shahi', 'zunbils', 'afrighid-dynasty', 'ustrushana-afshins', 'karluk-yabgu-state', 'tibet', 'uyghur'];
for (const id of SEAM_OUT) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== ERA_END) throw new Error(`central-asia high-medieval: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — 다음 시대가 ${ERA_END}년부터 이어 그리므로 ${ERA_END - 1}년까지 칠해야 함(맞물림)`);
}
for (const id of SEAM_IN) {
  const first = versions[id]?.[0];
  if (first && first[0] !== ERA_START) throw new Error(`central-asia high-medieval: ${id}의 첫 버전이 ${first[0]}~${first[1] - 1} — 앞 시대가 ${ERA_START - 1}년까지 칠하므로 ${ERA_START}년부터 칠해야 함(맞물림)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...W2_voids(), ...E2_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 83개 + 신장)에서 그해 비운 땅(voids)을 뺀 곳 — 앞 권역 도형(토번·당·몽골 제국·원 등)이 덮는 땅과 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
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
  return [{ name: `중앙아시아 사만·카라한 시대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'high-medieval',
  versions,
  gapZones,
  voids,
};
