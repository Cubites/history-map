// central-asia 시대 파일 early-medieval (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 600~820: 서돌궐과 아랍 정복
// 짝 항목 파일: data/entities/central-asia-early-medieval.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
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
// 이 시대의 운영자 결정 요지(원문 ca3/research/C3-DECISIONS.md, 기본값 B1~B32·C3-SEAMS M1~M11 그대로): Q1 사산 600~650·정통 칼리프국 651~660·우마이야 661~750·아바스 750~·투르크 샤히 665~ / Q3 토하리스탄 야브구국 600부터, 카불 600~664 비움 /
//   Q4 당 하미·투루판 640~790·4진 648~670·692~790, 토번 4진 670~692·호탄 790~842, 위구르 투루판 792~839 / Q5 서돌궐·투르기시는 시르다리야 도시 띠·제티수·이리만(초원 중부·북부 비움).
// 결정 맞춤(COMMON 3절): M15 4진 = E_S_KASH·E_S_AKSU·E_S_KHOTAN·EX_T2 그대로(새 칼선 없음, 수야브 안 넣음) / M22 새 항목 from은 사료의 시작 해(토하리스탄 야브구국만 600), mapNote '지도에는 600년부터'
// 칸(부딪침 막기, COMMON 4절): 칸 경계는 조각 경계 또는 시대 경계라 칼선은 칸을 넘지 않는다. 각 칸은 이 파일의 자기 칸 머리('C3 <칸> …' 겹줄 머리)와 그 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수 모두). 최상위 이름·import 별칭·ownSplit 묶음 이름은 칸 앞머리. 이 시대의 칸: W1A(W1A_ — 아프가니스탄 34·TM-A·TM-B·TM-D·TM-L·TM-M·UZ-XO·UZ-QR·UZ-SU·TJ-DU·TJ-GB·TJ-KT·TJK-368(46)) · W1T(W1T_ — UZ-AN·UZ-BU·UZ-FA·UZ-JI·UZ-NG·UZ-NW·UZ-QA·UZ-SA·UZ-SI·UZ-TK·UZ-TO·TJ-SU·KG-B·KG-J·KG-O(15)) · E1(E1_ — KZ 14·KAZ-3207·KAZ-4829·KAB·KG-C·KG-GB·KG-N·KG-T·KG-Y·CN-XJ(23)).
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
//   같은 id는 경계 앞뒤에 같은 조각·같은 칼선 상수로 그린다(대칭차 목표 0 — ca3/c3/skel/seam.mjs <사본> <뒤 해> <id…>로 잰다). 뒤 시대: high-medieval.mjs
// 표 경계 해: 칸마다 <앞머리>BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(ERA_START·ERA_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = 뼈대 측정(ca3/c3/skel/cells.txt·prev-overlap.txt)에서 그 칸 안 앞 권역 도형이 바뀌는 해 + COMMON 5절의 그 칸 경계 해.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 ERA_START(600)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(앞 권역 도형이 덮거나 voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('early-medieval');

const ERA_START = 600; // 이 시대 파일의 첫 해(600년 말 모습). 그 앞은 C4 몫(지도에 없음)
const ERA_END = 821; // 마지막 표의 끝(미포함) = high-medieval.mjs의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < ERA_START || e[0] >= ERA_END)) {
    throw new Error(`central-asia early-medieval: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${ERA_START} 이상 ${ERA_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia early-medieval: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = ERA_START, to = ERA_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia early-medieval: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia early-medieval: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia early-medieval: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia early-medieval: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia early-medieval: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── C3 W1A 서남 앞 (아프가니스탄·투르크멘·호라즘·토하리스탄 — 최상위 이름 W1A_) ──
// 조각: 아프가니스탄 34·TM-A·TM-B·TM-D·TM-L·TM-M·UZ-XO·UZ-QR·UZ-SU·TJ-DU·TJ-GB·TJ-KT·TJK-368(46). 정의 항목 tokhara-yabghus·zunbils·afrighid-dynasty(글은 이 칸, zunbils·afrighid-dynasty는 W2가 이어 칠함)
// 늘리는 나라(소유표 주인 id로): sasanian-empire [600, 651)·rashidun-caliphate [651, 661)·umayyad-caliphate [661, 751)·abbasid-caliphate(이 시대 750~820)·turk-shahi(이 시대 665~820). 블록 글: umayyad·abbasid·turk-shahi·zunbils·afrighid(COMMON 5절)
// 표 경계 해 처음 값: 앞 권역 도형 없음(측정 0 km²) — COMMON 5절·늘림 표의 해 651·661(사산 → 정통 → 우마이야)·665(투르크 샤히)·680(준빌)·705(우마이야 아래 토하리스탄)·750(아바스)·759(위 토하리스탄 아바스·야브구국 끝)
const W1A_BOUNDS = [651, 661, 665, 680, 705, 750, 759];
// 짜임(W1A 칸 2026-11-06): 소유표 단위는 세 나눔 묶음(cuts-c3.mjs의 W1A_TM_PARTS·W1A_AF_PARTS·W1A_KH_PARTS — 시대 내내 한 묶음씩)과 통째 조각이다. 이 칸 땅 안 앞 권역 도형은 0 km²(뼈대 측정)라 떼지 않는다.
// 그해 말 주인 줄(근거는 결과 노트 2절):
//   호라산 쪽(메르브 띠·아할 기슭·아무다리야 띠·헤라트·바드기스·시스탄): 사산 600 · 651 메르브 무혈 점령(헤라트 652 함락·자란즈 652 — 1년 차는 고치지 않음) 정통 칼리프국(결정 Q1) · 661 우마이야 · 750 아바스
const W1A_KHORASAN = [[600, 'sasanian-empire'], [651, 'rashidun-caliphate'], [661, 'umayyad-caliphate'], [750, 'abbasid-caliphate']];
//   자불·가즈니와 위쪽 헬만드(보스트·자민다와르·칸다하르): 600~664 비움(기본값 B14 — 654 아랍 점령 뒤 주인 불분명) · 665 투르크 샤히(카불 왕가가 자불리스탄까지) · 680 준빌(카불 왕가에서 갈라섬)
const W1A_ZABUL = [[600, null], [665, 'turk-shahi'], [680, 'zunbils']];
//   카불 골짜기: 600~664 비움(결정 Q3 — 네자크 훈족은 항목 없음, 664~665 아랍 점령은 되돌려진 점령) · 665 투르크 샤히(821부터 W2 — 맞춤 M16)
const W1A_KABUL = [[600, null], [665, 'turk-shahi']];
//   아래 토하리스탄(발흐·주즈잔·파르얍·사르이풀·사망간): 600 야브구국(결정 Q3 — 625 앞은 에프탈 제후국들) · 705 쿠타이바의 발흐 회복 우마이야 · 750 아바스
const W1A_TOKH_LOW = [[600, 'tokhara-yabghus'], [705, 'umayyad-caliphate'], [750, 'abbasid-caliphate']];
//   위 토하리스탄(쿤두즈·타하르·바글란과 차가니얀·후탈 — UZ-SU·TJ-KT·TJK-368·TJ-DU): 600 야브구국 · 759 아바스(야브구국 끝 뒤 토후들이 아바스 종주 아래)
const W1A_TOKH_UP = [[600, 'tokhara-yabghus'], [759, 'abbasid-caliphate']];
//   바다크샨: 600~704 비움(기본값 B9) · 705 야브구국(판투 닐리가 바다크샨에서 다스림 — 기본값 D3) · 759 비움
const W1A_BDS = [[600, null], [705, 'tokhara-yabghus'], [759, null]];
// 나눔 묶음 셋(부분 차례는 cuts-c3.mjs — W2·W3가 같은 목록으로 이어 나눔)
import { W1A_TM_IDS, W1A_TM_PARTS, W1A_AF_IDS, W1A_AF_PARTS, W1A_KH_IDS, W1A_KH_PARTS } from './cuts-c3.mjs';
const W1A_TM = ownSplit('W1A_투르크멘', W1A_TM_IDS, W1A_TM_PARTS, '카라쿰', { 메르브: W1A_KHORASAN, 아할: W1A_KHORASAN, 아무: W1A_KHORASAN, 카라쿰: [[ERA_START, null]] });
const W1A_AF = ownSplit('W1A_아프간', W1A_AF_IDS, W1A_AF_PARTS, '사막', {
  하자라자트: [[ERA_START, null]], 카피리스탄: [[ERA_START, null]], 시스탄: W1A_KHORASAN, 헬만드: W1A_ZABUL, 자불: W1A_ZABUL, 카불: W1A_KABUL, 사막: [[ERA_START, null]],
});
// 호라즘 양쪽 기슭: 아프리그 왕조 시대 내내(712 쿠타이바의 파괴는 되돌려진 점령 — 기본값 B10)
const W1A_KH = ownSplit('W1A_호라즘', W1A_KH_IDS, W1A_KH_PARTS, '밖', { 호라즘: [[ERA_START, 'afrighid-dynasty']], 밖: [[ERA_START, null]] });
// 통째 조각
own(['AF-HER', 'AF-BDG'], W1A_KHORASAN); // 헤라트·바드기스(마르 알루드 포함)
own(['AF-ZAB'], W1A_ZABUL);
own(['AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AFG-1769', 'AFG-1772'], W1A_KABUL); // 카불·카피사·로가르·낭가르하르·파르완
own(['AF-BAL', 'AF-JOW', 'AF-FYB', 'AF-SAR', 'AF-SAM'], W1A_TOKH_LOW);
own(['AF-KDZ', 'AF-TAK', 'AF-BGL', 'UZ-SU', 'TJ-KT', 'TJK-368', 'TJ-DU'], W1A_TOKH_UP);
own(['AF-BDS'], W1A_BDS);
// 시대 내내 주인 없음(줄을 적지 않음 — fillTables가 null): AF-BAM·AF-GHO·AF-WAR·AFG-1753·AF-NUR·AF-KHO·AF-PIA·AF-PKA·TJ-GB·TM-B (까닭은 아래 voids)
const W1A_NONE = ['AF-BAM', 'AF-GHO', 'AF-WAR', 'AFG-1753', 'AF-NUR', 'AF-KHO', 'AF-PIA', 'AF-PKA', 'TJ-GB', 'TM-B'];
const W1A_voids = () => [
  // 시대 내내: 바미안(바미안 왕국 — 사료로 경계를 못 잡음, 기본값 D9)·구르(산지 토후, 실효 지배 근거 없음)·와르다크·다이쿤디와 하자라자트(산지)·누리스탄과 카피리스탄(카피르 부족 땅)·
  //   호스트·팍티카·팍티아(파슈툰 부족 땅)·파미르(기본값 B9)·발칸과 카라쿰·키질쿰·우스튜르트(유목·사막 — 기본값 B8)·호라즘 밖(카라칼파크 사막·옛 아랄해 기슭)·헬만드 칼선 밖 사막(다시티마르고·레지스탄·가우디지레)
  [ERA_START, ERA_END, U(F(...W1A_NONE), geomOfUnit(W1A_TM.카라쿰), geomOfUnit(W1A_AF.하자라자트), geomOfUnit(W1A_AF.카피리스탄), geomOfUnit(W1A_AF.사막), geomOfUnit(W1A_KH.밖))],
  // 600~664 카불 골짜기·자불·가즈니·위쪽 헬만드: 네자크 훈족 카피사 왕국(항목 없음 — 결정 Q3)과 654 아랍 점령 뒤 주인 불분명(기본값 B14)
  [ERA_START, 665, U(F('AF-ZAB', 'AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-NAN', 'AFG-1769', 'AFG-1772'), geomOfUnit(W1A_AF.헬만드), geomOfUnit(W1A_AF.자불), geomOfUnit(W1A_AF.카불))],
  // 바다크샨 600~704·759~820: 토번·당·아랍 사이 실효 지배 근거 없음(기본값 B9)
  V(ERA_START, 705, 'AF-BDS'),
  V(759, ERA_END, 'AF-BDS'),
];
// ── C3 W1A 끝 ──

// ── C3 W1T 서 앞 (소그디아나·페르가나·우스루샤나·샤시 — 최상위 이름 W1T_) ──
// 조각: UZ-AN·UZ-BU·UZ-FA·UZ-JI·UZ-NG·UZ-NW·UZ-QA·UZ-SA·UZ-SI·UZ-TK·UZ-TO·TJ-SU·KG-B·KG-J·KG-O(15). 정의 항목 sogdian-city-states·ferghana-kingdom·ustrushana-afshins(글은 이 칸, ustrushana-afshins는 W2가 이어 칠함)
// 늘리는 나라: umayyad-caliphate(709 부하라·712 사마르칸트·케슈)·abbasid-caliphate(751 샤시·819 페르가나 — 창구 ③ 결정 Q-A) — 블록 글은 W1A. western-turkic-khaganate는 vassal_of 줄만(정의·글은 E1)
// 표 경계 해 처음 값: 앞 권역 도형 없음(측정 0 km²) — COMMON 5절의 해 709·712(우마이야 부하라·사마르칸트, 소그드 도시 군주국 끝)·750·751(아바스, 페르가나 왕국 끝)
const W1T_BOUNDS = [709, 712, 750, 751];
import { W_CUT_BUKHARA_KYZYLKUM as W1T_CUT_KYZYLKUM, W_CUT_TURKESTAN as W1T_CUT_TURKESTAN, W_CUT_KHUJAND as W1T_CUT_KHUJAND, W_KOKAND_IDS as W1T_KOKAND_IDS } from './cuts.mjs';
import { W1T_CUT_KASHKA, W1T_CUT_USTRU } from './cuts-c3.mjs';
// 나눈 조각(시대 내내 한 가지 나눔): 부하라·나보이는 C1 키질쿰 칼선 남쪽이 오아시스, 카슈카다리야는 새 칼선 안이 오아시스,
// 소그드주(TJ-SU)는 C1 칼선 차례 그대로(위 자라프샨 → 후잔드 동쪽 페르가나 몫 = C1 W_KOKAND의 TJ-SU 몫) 뒤 우스루샤나, 지작은 우스루샤나 칼선 안만
const W1T_BU = ownSplit('W1T_부하라', ['UZ-BU', 'UZ-NW'], [['키질쿰', W1T_CUT_KYZYLKUM]], '오아시스');
const W1T_QA = ownSplit('W1T_카슈카다리야', ['UZ-QA'], [['오아시스', W1T_CUT_KASHKA]], '사막산지');
const W1T_SU = ownSplit('W1T_소그드주', ['TJ-SU'], [['자라프샨', W1T_CUT_TURKESTAN], ['페르가나', W1T_CUT_KHUJAND], ['우스루샤나', W1T_CUT_USTRU]], '후잔드');
const W1T_JI = ownSplit('W1T_지작', ['UZ-JI'], [['우스루샤나', W1T_CUT_USTRU]], '지작');
// 소유표(그해 말 주인 — 원정·되돌려진 점령은 칠하지 않음: 715 쿠타이바의 페르가나, 720~737 소그드 반란·투르기시, 712~713 샤시 원정)
// 부하라 오아시스: 709 쿠타이바가 부하라를 차지(우마이야), 750 아바스
own([W1T_BU['오아시스']], [[600, 'sogdian-city-states'], [709, 'umayyad-caliphate'], [750, 'abbasid-caliphate']]);
// 사마르칸트·위 자라프샨(판자켄트)·카슈카다리야(케슈·나사프): 712 사마르칸트 항복(우마이야), 750 아바스
own(['UZ-SA', W1T_SU['자라프샨'], W1T_QA['오아시스']], [[600, 'sogdian-city-states'], [712, 'umayyad-caliphate'], [750, 'abbasid-caliphate']]);
// 페르가나(C1 W_KOKAND와 같은 모양): 이크시드의 페르가나 왕국, 819 아바스(창구 ③ 결정 Q-A — 751 탈라스 뒤에도 8세기 말까지 아랍 지배 밖, 819 사만 가문 아흐마드가 페르가나 총독이 되며 왕가 끝: 위키백과 Principality of Farghana)
own([...W1T_KOKAND_IDS, W1T_SU['페르가나']], [[600, 'ferghana-kingdom'], [819, 'abbasid-caliphate']]);
// 우스루샤나: 아프신 왕조(아랍에 조공·794 복속, 821~891은 W2가 이어 칠함)
own([W1T_SU['우스루샤나'], W1T_JI['우스루샤나']], [[600, 'ustrushana-afshins']]);
// 샤시(타슈켄트·일라크): 750까지 비움(B5 — 서돌궐 투둔은 감시용), 751 탈라스 뒤 아바스
own(['UZ-TO', 'UZ-TK'], [[600, null], [751, 'abbasid-caliphate']]);
const W1T_voids = () => [
  V(600, 751, 'UZ-TO', 'UZ-TK'), // 샤시: 토착 툰(군주)이 서돌궐 투둔의 감시 아래 다스림 — 서돌궐 직접 지배도 아니고 따로 그릴 항목도 없어 비움(B5), 751 아바스
  V(600, ERA_END, 'UZ-SI'), // 미르자출(굶주림) 초원: 시르다리야 왼쪽의 물 없는 초원, 어느 오아시스 나라의 땅도 아님(B8)
  B(600, ERA_END, W1T_BU['키질쿰']), // 키질쿰 사막(부하라·나보이 북쪽): 유목민 땅, 오아시스 나라 밖(B8)
  B(600, ERA_END, W1T_QA['사막산지']), // 카슈카다리야 서쪽 카르시 초원·남쪽 사막·히사르 산지: 오아시스 밖(B8)
  B(600, ERA_END, W1T_JI['지작']), // 지작 오아시스와 누라타우·아르나사이 초원: 소그드·우스루샤나 사이 주인이 분명하지 않은 땅(B8)
  B(600, ERA_END, W1T_SU['후잔드']), // 후잔드 오아시스와 쿠라마 산지: 후잔드는 소그드·우스루샤나·페르가나 사이 작은 도시로 따로 그리지 않음(B8)
];
// ── C3 W1T 끝 ──

// ── C3 E1 동 앞 (카자흐스탄·키르기스 북부·신장 — 최상위 이름 E1_) ──
// 조각: KZ 14·KAZ-3207·KAZ-4829·KAB·KG-C·KG-GB·KG-N·KG-T·KG-Y·CN-XJ(23). 정의 항목 western-turkic-khaganate·turgesh-khaganate·karluk-yabgu-state(글은 이 칸, karluk-yabgu-state는 E2가 이어 칠함)
// 늘리는 나라: tang [640, 791)·tibet(이 시대 670~691·790~820, 블록 글 이 칸). uyghur(위구르 투루판 792~839)는 내륙아시아 빈 땅 채우기 대상이라 권역 파일이 늘림 줄을 두지 못함 — 주인으로 쓰지 않는다(메인 판단 기다림)
// 표 경계 해 처음 값: 칸 땅(신장) 안 앞 권역 도형이 바뀌는 해 609·618·630·646·663·682·744(수·토욕혼·당·토번·채우기 구역 — skel/prev-overlap.txt) + COMMON 5절·결정 Q4의 해 603·640·648·658·670·692·699·766·790·791·792
//   792(위구르 투루판)는 뺌 — uyghur를 주인으로 쓰지 못해 791~820 투루판이 비움 한 줄이라 표를 나눌 까닭이 없음
const E1_BOUNDS = [603, 609, 618, 630, 640, 646, 648, 658, 663, 670, 682, 692, 699, 744, 766, 790, 791];
// 새 칼선 없음 — C1 신장 땅·C2 칼선을 이름 그대로 가져온다(좌표를 베끼지 않음). 기준 도시·근거는 cuts.mjs 줄 주석
import { box as E1_box } from '../../lib.mjs';
import {
  E_S_HAMI as E1_S_HAMI, E_S_NORTH as E1_S_NORTH, E_S_ILI as E1_S_ILI, E_S_URUM as E1_S_URUM, E_S_KASH as E1_S_KASH, E_S_AKSU as E1_S_AKSU, E_S_KHOTAN as E1_S_KHOTAN,
  EX_T1 as E1_T1, EX_T2 as E1_T2, EK_CUT_KOK as E1_CUT_KOK, EK_CUT_KARATAU as E1_CUT_KARATAU,
} from './cuts.mjs';
const E1_W = 'western-turkic-khaganate';
const E1_TG = 'turgesh-khaganate';
const E1_K = 'karluk-yabgu-state';
// 주인 줄(그해 말 모습 — 결정 Q4·Q5 ①, 기본값 B1·B2·B4·B28·B30·B31, 맞춤 M15·M22·M24)
const E1_LINES = {
  // 세미레치예(잠빌·알마티 주·알마티 시·키르기스 북부 추·탈라스·이시크쿨·나린)와 이리 골짜기: 600~602 비움(B28 — 돌궐 서쪽 몫, 서돌궐 독립 앞),
  //   603 서돌궐 독립(수야브·천산 북쪽 여름 도읍), 658 비움(B4 — 657 소정방이 아시나하로를 이긴 뒤 당 기미부주 명목 복속·돌궐 제2 사이),
  //   699 투르기시 우즈일리 건국(703 수야브), 766 카를루크가 투르기시를 꺾고 수야브를 차지(B1 — 821~839는 E2가 같은 단위로 이어 칠함)
  세미레치예: [[600, null], [603, E1_W], [658, null], [699, E1_TG], [766, E1_K]],
  // 시르다리야 중류 도시 띠(KZ-YUZ의 카라타우 남서쪽 — 투르키스탄·오트라르(파라브)·시므켄트(이스피자브)): 세미레치예와 같은 주인(노트 E1 3-1~3-3, Q5 ①)
  시르다리야: [[600, null], [603, E1_W], [658, null], [699, E1_TG], [766, E1_K]],
  // 크질오르다 시르다리야 띠(EK_CUT_KOK 안 — 자나코르간·크질오르다): 서돌궐 603~657만(노트 E1 3-1). 투르기시·카를루크는 세미레치예 정주권만(3-2·3-3) —
  //   그 뒤 하류 쪽은 오구즈 유목지라 비움(B2)
  악메체트: [[600, null], [603, E1_W], [658, null]],
  // 카자흐 초원(나머지 KZ 조각·KAB, 남카·크질오르다의 띠 밖): 비움(Q5 ① — 초원 중부·북부, B2 오구즈·키메크–킵차크 유목지)
  초원: [[600, null]],
  // 하미(이오·이주, E_S_HAMI에서 동쪽 띠의 앞 권역 도형을 뺀 땅): 600~639 비움(B28 — 수 이오군 610~618은 8년, 당 이주 630은 결정 Q4의 640을 따름 — 결과 노트 6절),
  //   640 당(Q4), 791 비움(790 토번이 북정을 빼앗은 뒤 토번·위구르가 다툼 — 굳은 주인 없음, 토번 하미는 결정 밖)
  하미: [[600, null], [640, 'tang'], [791, null]],
  // 투루판 분지·카라샤르 분지(EX_T1): 600~639 국씨 고창국(창구 ③ 결정 Q-B — 새 항목, 서돌궐 vassal_of 603~639), 640 당의 고창 정복(서주), 791 비움(790~792 토번·위구르 다툼,
  //   792 위구르(Q4)는 uyghur가 내륙아시아 채우기 대상이라 늘릴 수 없어 비움 — 창구 ③ 결정 Q-C 비움 그대로)
  투루판: [[600, 'qu-gaochang'], [640, 'tang'], [791, null]],
  // 우루무치 띠(E_S_URUM — 베슈발리크 쪽 오아시스): 640 당 정주(庭州, 702 북정도호부), 791 비움(790 토번이 북정을 잠시 점령, 그 뒤 위구르 — 투루판과 같은 까닭)
  우루무치: [[600, null], [640, 'tang'], [791, null]],
  // 4진 가운데 카슈가르(소륵)·악수–쿠차(구자·고묵)·카라샤르–코를라(언기, EX_T2): 648 당이 구자를 꺾고 안서도호부를 옮김, 670 토번(대비천), 692 당이 되찾음(왕효걸),
  //   790 비움(Q4는 호탄만 토번 — 카슈가르·쿠차의 790년대 주인은 사료 없음)
  카슈가르: [[600, null], [648, 'tang'], [670, 'tibet'], [692, 'tang'], [790, null]],
  악수: [[600, null], [648, 'tang'], [670, 'tibet'], [692, 'tang'], [790, null]],
  코를라: [[600, null], [648, 'tang'], [670, 'tibet'], [692, 'tang'], [790, null]],
  // 호탄(우전, E_S_KHOTAN — B30 타클라마칸 안쪽을 따로 빼지 않음): 648 당, 670 토번, 692 당, 790 토번(Q4 — 821~842는 E2가 같은 단위로 이어 칠함)
  호탄: [[600, null], [648, 'tang'], [670, 'tibet'], [692, 'tang'], [790, 'tibet']],
  // 톈산 북쪽 나머지(준가르 분지·알타이·타르바가타이 — E_S_NORTH − 이리·우루무치): 비움(Q5 ① — 유목지, B27)
  준가르: [[600, null]],
  // 남동부(롭노르·체르첸·차클리크 쪽 사막과 쿠루크타그): 비움(B27)
  동: [[600, null]],
};
// ── 카자흐스탄·키르기스 북부: 이 시대 앞 권역 도형 0 km²(skel/cells.txt)라 빼기 없이 조각을 통째·나눠 쓴다 ──
const E1_ZHETYSU = ['KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KG-C', 'KG-GB', 'KG-N', 'KG-T', 'KG-Y']; // 알마티 주 동쪽 끝(알라콜·자르켄트)도 세미레치예·이리 골짜기라 통째로
const E1_STEPPE = minus(idsOf('KAZ'), 'KZ-ZHA', 'KAZ-3207', 'KAZ-4829', 'KZ-YUZ', 'KZ-KZY');
if (E1_STEPPE.length !== 11) throw new Error(`central-asia early-medieval E1: 초원 조각이 ${E1_STEPPE.length}개(11이어야 함)`);
own(E1_ZHETYSU, E1_LINES.세미레치예);
own([...E1_STEPPE, 'KAB'], E1_LINES.초원);
const E1_KZ_SPLITS = [
  ownSplit('E1_남카', ['KZ-YUZ'], [['시르다리야', E1_CUT_KARATAU]], '초원', { 시르다리야: E1_LINES.시르다리야, 초원: E1_LINES.초원 }),
  ownSplit('E1_크질오르다', ['KZ-KZY'], [['악메체트', E1_CUT_KOK]], '초원', { 악메체트: E1_LINES.악메체트, 초원: E1_LINES.초원 }),
];
// ── 신장: 앞 권역 도형(토욕혼·수·당·토번·동쪽 띠의 돌궐·설연타·안북도호부·돌궐 제2·위구르 채우기)을 빼고 C2 EX와 같은 차례로 나눈다 ──
// 차례: 하미 → 이리 → 우루무치 → 준가르(톈산 북쪽 나머지) → 카슈가르 → 악수 → 호탄 → 투루판(T1) → 코를라(T2) → 동(나머지). 이리·우루무치·준가르 셋을 합치면 C2 '북'과 같은 땅
//   (E2가 821부터 같은 차례·같은 상수로 이어 그림 — 맞물림 M24)
const E1_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]);
const E1_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6);
const E1_BOX = (() => {
  const xs = XJ.flat(2);
  return E1_box(Math.min(...xs.map((q) => q[0])) - 1, Math.min(...xs.map((q) => q[1])) - 1, Math.max(...xs.map((q) => q[0])) + 1, Math.max(...xs.map((q) => q[1])) + 1);
})();
const E1_boxed = new Map();
const E1_inBox = (g) => {
  if (!E1_boxed.has(g)) E1_boxed.set(g, E1_noDust(I(E1_filled(g), E1_BOX)));
  return E1_boxed.get(g);
};
// [from, to) 동안 신장 안 앞 권역 도형 넓이가 같은지 확인(바뀌면 E1_XJ_YEARS를 나눔)
const E1_sizeIn = new Map();
const E1_prevCheck = (from, to) => {
  const ys = new Set([from]);
  for (const id of PREV_IDS) for (const [f, t] of prevListOf(id)) for (const y of [f, t]) if (y > from && y < to) ys.add(y);
  let size = null;
  for (const y of [...ys].sort((a, b) => a - b)) {
    let s = 0;
    for (const id of PREV_IDS) {
      for (const [f, t, g] of prevListOf(id)) {
        if (!(f <= y && y < t)) continue;
        const b = E1_inBox(g);
        if (!E1_sizeIn.has(b)) E1_sizeIn.set(b, b.length ? deg2(E1_noDust(I(b, XJ))) : 0);
        s += E1_sizeIn.get(b);
      }
    }
    if (size === null) size = s;
    else if (Math.abs(s - size) > 1e-4) throw new Error(`central-asia early-medieval E1: [${from}, ${to}) 안 ${y}년에 신장 안 앞 권역 도형이 바뀜 — E1_XJ_YEARS를 나눈다`);
  }
};
const E1_rawMinus = (from, to) => {
  E1_prevCheck(from, to);
  const raw = PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= from && from < t).map(([, , g]) => E1_inBox(g))).filter((g) => g.length);
  return E1_noDust(raw.length ? D(XJ, ...raw) : XJ);
};
const E1_cutLine = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];
const E1_XJ_SHAPES = [['하미', E1_S_HAMI], ['이리', I(E1_S_ILI, E1_S_NORTH)], ['우루무치', E1_S_URUM], ['준가르', E1_S_NORTH], ['카슈가르', E1_S_KASH], ['악수', E1_S_AKSU], ['호탄', E1_S_KHOTAN], ['투루판', E1_T1], ['코를라', E1_T2]];
const E1_XJ_LINE_OF = { ...E1_LINES, 이리: E1_LINES.세미레치예 };
// 신장 안 앞 권역 도형이 바뀌는 해(609 수·토욕혼, 618 당·토번, 630·646·682·744 채우기 구역 나라, 663 토욕혼 끝·토번 65,040)
const E1_XJ_YEARS = [ERA_START, 609, 618, 630, 646, 663, 682, 744, ERA_END];
const E1_XJ_LAYOUTS = E1_XJ_YEARS.slice(0, -1).map((from, i) => {
  const to = E1_XJ_YEARS[i + 1];
  let left = E1_rawMinus(from, to).filter((p) => deg2([p]) >= 0.03); // 부스러기(0.03제곱도 미만)는 '앞'(주인 없음)
  const parts = [];
  for (const [name, shape] of E1_XJ_SHAPES) {
    // 칼선 부스러기(0.03제곱도 — 대략 300 km² 미만, 본 덩어리와 떨어진 조각)는 이 부분에 넣지 않고 다음 차례로 넘긴다
    //   (우루무치 띠 북서 끝 마나스강 선과 상자 변 사이 103 km² — 그대로 두면 당 640~790 월경지 부스러기)
    const got = E1_noDust(I(left, shape));
    const keep = got.length > 1 ? got.filter((q) => deg2([q]) >= 0.03) : got;
    const crumbs = got.filter((q) => !keep.includes(q));
    parts.push([name, keep]);
    left = E1_noDust(D(left, shape));
    if (crumbs.length) left = U(left, crumbs);
  }
  parts.push(['동', left]);
  const units = ownSplit(`E1_신장${from}`, [XJ_ID], parts, '앞', Object.fromEntries(parts.map(([p]) => [p, E1_cutLine(E1_XJ_LINE_OF[p], from, to)])), { from, to });
  return { from, to, units, lineOf: E1_XJ_LINE_OF };
});
// 비운 땅(fillTables 뒤에 부름): 해마다 주인 없는 단위가 같은 기간끼리 한 줄 — 이유는 E1_LINES 줄 주석
//   (600~602 세미레치예·시르다리야 띠, 658~698 같은 땅(B4), 초원·준가르·남동부 내내, 하미·투루판·우루무치 600~639·791~820, 4진 600~647·카슈가르·악수·코를라 790~820, 크질오르다 띠 600~602·658~820)
const E1_GROUPS = [
  { from: ERA_START, to: ERA_END, units: Object.fromEntries([...E1_ZHETYSU, ...E1_STEPPE, 'KAB'].map((id) => [id, id])), lineOf: Object.fromEntries([...E1_ZHETYSU.map((id) => [id, E1_LINES.세미레치예]), ...[...E1_STEPPE, 'KAB'].map((id) => [id, E1_LINES.초원])]) },
  ...E1_KZ_SPLITS.map((units) => ({ from: ERA_START, to: ERA_END, units, lineOf: E1_LINES })),
  ...E1_XJ_LAYOUTS,
];
const E1_voids = () => {
  const out = [];
  for (const { from, to, units, lineOf } of E1_GROUPS) {
    let run = null;
    for (let y = from; y <= to; y++) {
      const nulls = y < to ? Object.keys(units).filter((p) => lineOf[p] && lineOf[p].filter(([yy]) => yy <= y).at(-1)[1] === null) : null;
      const key = nulls ? nulls.join('|') : '끝';
      if (run && run.key !== key) {
        if (run.nulls.length) out.push(B(run.from, y, ...run.nulls.map((p) => units[p])));
        run = null;
      }
      if (!run && nulls) run = { key, from: y, nulls };
    }
  }
  return out;
};
// ── C3 E1 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([ERA_START, ...W1A_BOUNDS, ...W1T_BOUNDS, ...E1_BOUNDS, ERA_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== ERA_START || BOUNDS.at(-1) !== ERA_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia early-medieval: 표 경계 해 ${BOUNDS.join(', ')}는 ${ERA_START}~${ERA_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia early-medieval: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia early-medieval: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia early-medieval: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia early-medieval: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia early-medieval: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== ERA_END) throw new Error(`central-asia early-medieval: 마지막 표의 끝이 ${joined.TO} (${ERA_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 ERA_END = 821 — high-medieval.mjs 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 시대 경계 맞물림 검사(COMMON 6절 '시대 경계', 맞춤 M24): 앞·뒤 시대가 이어 그리는 항목은 이 시대에 버전이 있으면
// SEAM_OUT — 마지막 버전이 이 시대 끝 해까지(to = ERA_END = 다음 시대 첫 해), SEAM_IN — 첫 버전이 이 시대 첫 해부터(from = ERA_START). 버전이 없으면 지나감(뼈대)
// (끝 해까지 칠하지 않으면 경계 앞에 틈이, 첫 해부터 칠하지 않으면 경계 뒤에 틈이 생김. 늘린 나라도 이 시대의 versions에 있는 동안 같이 본다 — joinEras가 extensions로 옮기기 전)
const SEAM_OUT = ['abbasid-caliphate', 'turk-shahi', 'zunbils', 'afrighid-dynasty', 'ustrushana-afshins', 'karluk-yabgu-state', 'tibet', 'uyghur'];
const SEAM_IN = [];
for (const id of SEAM_OUT) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== ERA_END) throw new Error(`central-asia early-medieval: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — 다음 시대가 ${ERA_END}년부터 이어 그리므로 ${ERA_END - 1}년까지 칠해야 함(맞물림)`);
}
for (const id of SEAM_IN) {
  const first = versions[id]?.[0];
  if (first && first[0] !== ERA_START) throw new Error(`central-asia early-medieval: ${id}의 첫 버전이 ${first[0]}~${first[1] - 1} — 앞 시대가 ${ERA_START - 1}년까지 칠하므로 ${ERA_START}년부터 칠해야 함(맞물림)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...W1A_voids(), ...W1T_voids(), ...E1_voids()];

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
  return [{ name: `중앙아시아 서돌궐·아랍 정복 시대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'early-medieval',
  versions,
  gapZones,
  voids,
};
