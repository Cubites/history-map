// central-asia 시대 파일 late-medieval (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1220~1499: 몽골·차가타이·티무르
// 짝 항목 파일: data/entities/central-asia-late-medieval.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
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
// 이 시대의 운영자 결정 요지(원문 ca3/research/C3-DECISIONS.md, 기본값 B1~B32·C3-SEAMS M1~M11 그대로): Q1 호라즘 1220·티무르 1370~1499 / Q6 몽골 제국 1220~ 트란스옥시아나·호라즘·헤라트, 초원 1259까지 제국 한 색, 차가타이 1227부터 / Q7 킵차크 칸국 1260~1395 초원·호라즘 북쪽 1264~1359, 카라타우 동쪽 비움 /
//   Q8 카르트 헤라트 1245~1380 + 칸다하르 1281~ / Q9 아르군 왕조(칸다하르) 1479~ vassal_of 티무르 / Q11 모굴리스탄 타림 서쪽·세미레치예 / Q12 카라델 1389~(명에 vassal_of), 북신장 비움.
// 결정 맞춤(COMMON 3절): M12 카자흐 칸국 앞 버전 없음(첫 버전 1509 — C2) / M13 yuan 늘림 없음, 투루판·우루무치 띠·하미는 1220부터 고창 위구르(vassal_of 몽골 제국·원) / M14 1220 호라즘 = 1219 말 모양 − 트란스옥시아나 /
//   M19 몽골 제국 초원·준가르(E_S_NORTH − E_S_ILI)·제티수·타림 서쪽 1220~1259(1227부터 차가타이 몫 뺌), 트란스옥시아나 1220~1226·호라즘 1221~1263·헤라트 1221~1244, 준가르 1260~1499 비움 /
//   M20 킵차크 칸국 1260~1395 카자흐 초원(세미레치예·이리 뺌)·1264~1359 호라즘 북쪽, 1396~1499 초원 비움
// 칸(부딪침 막기, COMMON 4절): 칸 경계는 조각 경계 또는 시대 경계라 칼선은 칸을 넘지 않는다. 각 칸은 이 파일의 자기 칸 머리('C3 <칸> …' 겹줄 머리)와 그 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수 모두). 최상위 이름·import 별칭·ownSplit 묶음 이름은 칸 앞머리. 이 시대의 칸: W3(W3_ — 서 61조각(W2와 같음)) · E3(E3_ — 동 23조각(E1과 같음)).
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
//   같은 id는 경계 앞뒤에 같은 조각·같은 칼선 상수로 그린다(대칭차 목표 0 — ca3/c3/skel/seam.mjs <사본> <뒤 해> <id…>로 잰다). 앞 시대: high-medieval.mjs · 뒤 시대: early-modern.mjs
// 표 경계 해: 칸마다 <앞머리>BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(ERA_START·ERA_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = 뼈대 측정(ca3/c3/skel/cells.txt·prev-overlap.txt)에서 그 칸 안 앞 권역 도형이 바뀌는 해 + COMMON 5절의 그 칸 경계 해.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 ERA_START(1220)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(앞 권역 도형이 덮거나 voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('late-medieval');

const ERA_START = 1220; // 이 시대 파일의 첫 해(1220년 말 모습). 그 앞은 high-medieval.mjs
const ERA_END = 1500; // 마지막 표의 끝(미포함) = early-modern.mjs의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < ERA_START || e[0] >= ERA_END)) {
    throw new Error(`central-asia late-medieval: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${ERA_START} 이상 ${ERA_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia late-medieval: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = ERA_START, to = ERA_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia late-medieval: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia late-medieval: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia late-medieval: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia late-medieval: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia late-medieval: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── C3 W3 서 뒤 (차가타이·카르트·수피·티무르 — 최상위 이름 W3_) ──
// 조각: 서 61조각(W2와 같음). 정의 항목 chagatai-khanate·kart-dynasty·sufi-dynasty. 블록 글: chagatai-khanate·timurid-empire(COMMON 5절)
// 늘리는 나라: khwarazmian-empire(1220, M14)·mongol-empire(트란스옥시아나 1220~1226·호라즘 1221~1263·헤라트 1221~1244)·golden-horde(호라즘 북쪽 1264~1359)·timurid-empire(1370~1499). 남의 항목 칠함: moghulistan(1484 타슈켄트, 정의 E3)·arghun-kandahar(1479~1499, 정의 J)
// 표 경계 해 처음 값: 앞 권역 도형 없음(측정 0 km²) — COMMON 5절의 해 1221·1227·1245·1264·1360·1361·1370·1381·1383·1388·1431·1479·1484
//   + 칸이 사료로 더한 해 1281(카르트 칸다하르 — 결정 Q8)·1372(호라즘 남쪽 카트·히바가 티무르로 — 위키백과 Sufi dynasty)
const W3_BOUNDS = [1221, 1227, 1245, 1264, 1281, 1360, 1361, 1370, 1372, 1381, 1383, 1388, 1431, 1479, 1484];
// 짜임(W3 칸 2026-11-06): 이 칸 땅 안 앞 권역 도형은 0 km²(뼈대 측정)라 떼지 않는다. 소유표 단위는 다섯 나눔 묶음(시대 내내 한 묶음씩)과 통째 조각이다.
//   ① 트란스옥시아나(맞춤 M14·M24): C2 W 칸 1500 단위(early-modern.mjs 'W_서쪽'·'W_페르가나쪽')와 같은 C1 부분 목록·같은 차례로 나눈다 — 1499 모양 = C2 1500 단위 모양.
//      조각 목록만 이 칸 땅으로 줄인다(동 칸 몫 KG-C·GB·N·T·Y와 아래 투르크멘 묶음이 쓰는 TM-L을 뺌 — 레바프남 부분은 TM-L에만 걸려 빠짐). 트란스옥시아나 = 지작·부하라·후잔드·제라프샨·알라이남·코칸트·타슈켄트·동부부하라
//      (C2 1505 부하라 칸국 모양). 남는 부분(러시아·타슈켄트쪽·톈산 — C1 러시아 구역 링 몫, 키질쿰북·파미르·나머지)은 C2 1500처럼 비움.
//   ② 호라즘(UZ-XO·UZ-QR·TM-D): C1 A_K73(왼쪽 기슭 오아시스)을 칼선 W3_CUT_URGENCH로 북(우르겐치)·남(히바), 나머지는 밖(사막·옛 아랄해 기슭).
//   ③ 투르크멘(TM-A·TM-M·TM-L): W1A 부분 목록 그대로(메르브 띠·아할 기슭·아무다리야 띠, 나머지 카라쿰) — 1219↔1220 맞물림(M24).
//   ④ 아프가니스탄: C2 A 칸 땅 묶음(A_GROUPS)과 같은 조각 — 하자라자트·카피리스탄 칼선이 지나는 아홉 조각은 C2 'A_아프간산지'와 같은 차례로 나누되
//      바미안·와르다크를 카불 앞에 따로 뗀다(1220 호라즘 몫에서 둘을 빼므로 — M14. 1383~1499 바미안 + 와르다크 + 카불 = C2 카불 부분).
//   ⑤ 1220 한 해 호라즘(M14·M24 — 반영 F1): 1220 호라즘 = W2 1219 모양 − 트란스옥시아나. W2가 1041~1219 비운 시스탄(파라·니므로즈 통째)과 헬만드 칼선 밖 사막은 1220에도 비우고
//      (헬만드·칸다하르는 1220 한 해만 W1A 헬만드 칼선 부분으로 나눔 — W2와 같은 상수), W2가 칠한 아할 기슭은 1220에 호라즘(니사·아비바르드 — 몽골 함락 1220~1221).
// 앞 권역 나라 늘림(권역 파일 EXTENDABLE 안): khwarazmian-empire 1220 · mongol-empire 1220~1263 · golden-horde 1264~1359 · timurid-empire 1370~1499
import { A_HAZ as W3_HAZ, A_KAF as W3_KAF, A_K73 as W3_K73, A_GROUPS as W3_GROUPS, W_FER_IDS as W3_FER_IDS, W_REST_IDS as W3_REST_IDS0, W_FER_PARTS as W3_FER_PARTS, W_REST_PARTS_1865 as W3_REST_PARTS_1865 } from './cuts.mjs';
import { C3_W_IDS as W3_IDS, W1A_TM_IDS as W3_TM_IDS, W1A_TM_PARTS as W3_TM_PARTS, W1A_AF_PARTS as W3_AF_PARTS, W3_CUT_URGENCH } from './cuts-c3.mjs';
// 그해 말 주인 줄(근거는 결과 노트 2절)
const W3_K = 'khwarazmian-empire';
const W3_M = 'mongol-empire';
const W3_T = 'timurid-empire';
//   트란스옥시아나: 1220 몽골(부하라 1220 초·사마르칸트 1220년 3월 — 1219 말까지 호라즘, M14) · 1227 차가타이 칸국(칭기즈 칸 죽음 뒤 상속 — 결정 Q6, vassal_of 몽골 1227~1259)
//   · 1370 티무르 왕조(1369 발흐·1370 건국, 꼭두각시 칸은 글로만) — 타슈켄트만 1484 모굴리스탄(유누스 칸 — 기본값 B25)
const W3_TRANS = [[1220, W3_M], [1227, 'chagatai-khanate'], [1370, W3_T]];
const W3_TASH = [...W3_TRANS, [1484, 'moghulistan']];
//   호라즘 북(우르겐치): 1220 호라즘 제국(수도 구르간지) · 1221 몽골(우르겐치 함락) · 1264 킵차크 칸국(알구 1260~1264 정복 뒤 나눔 — 결정 Q7, 끝 1359) · 1360 비움(쿵그라트 자립 해)
//   · 1361 수피 왕조 · 1388 티무르(1379 우르겐치 함락 뒤 수피는 티무르 아래, 1387 술레이만 반란·1388 우르겐치 파괴) · 1431 비움(우즈베크 우르겐치 정복 — 기본값 B18, C2 1500~1510 비움과 이어짐)
const W3_KH_N = [[1220, W3_K], [1221, W3_M], [1264, 'golden-horde'], [1360, null], [1361, 'sufi-dynasty'], [1388, W3_T], [1431, null]];
//   호라즘 남(히바·하자라스프): 1264 차가타이 칸국(1350년대까지) · 1361 수피 · 1372 티무르(후사인 죽음 뒤 유수프 수피가 카트·히바를 넘김) · 1431 비움
const W3_KH_S = [[1220, W3_K], [1221, W3_M], [1264, 'chagatai-khanate'], [1361, 'sufi-dynasty'], [1372, W3_T], [1431, null]];
//   헤라트 묶음(헤라트·바드기스·파라·니므로즈 + 고르의 하자라자트 밖): 1221 몽골(1221년 4월 함락, 1222 재함락은 되돌림 아님) · 1245 카르트 왕조 · 1381 티무르(1381년 4월)
const W3_HERAT = [[1220, W3_K], [1221, W3_M], [1245, 'kart-dynasty'], [1381, W3_T]];
//   칸다하르 묶음(칸다하르·자불·헬만드 + 우루즈간의 하자라자트 밖): 1221 비움(기본값 B15 — 1221 몽골 포위 실패, 1260~61 차가타이는 되돌려진 점령) · 1281 카르트(결정 Q8)
//   · 1381 비움(카르트 끝 — 칸다하르는 1383 티무르 함락까지 2년, 칠할 주인 없음) · 1383 티무르 · 1479 칸다하르의 아르군 왕조(결정 Q9 — vassal_of 티무르는 J)
const W3_KAND = [[1220, W3_K], [1221, null], [1281, 'kart-dynasty'], [1381, null], [1383, W3_T], [1479, 'arghun-kandahar']];
//   카불·가즈니 묶음: 1220 호라즘(잘랄 앗딘 가즈니 1220~1221) · 1221 비움(B15·B20 — 1221 파르완 뒤 인더스 패주, 카라우나스 유목 군단 땅) · 1383 티무르(기본값 B19)
const W3_KABUL = [[1220, W3_K], [1221, null], [1383, W3_T]];
const W3_BAMYAN = [[1220, null], [1383, W3_T]]; // 바미안·와르다크: 1219 호라즘 몫 밖(M14 — W2 시대 내내 비움), 1221 파괴 뒤 비움, 1383 카불과 함께 티무르(C2 1500 카불 부분과 이어짐)
//   발흐·사만간: 1221 비움(B15 — 1221 초 파괴, B20 — 1362~1369 후사인 도읍도 비움) · 1370 티무르(1369 발흐)
const W3_BALKH = [[1220, W3_K], [1221, null], [1370, W3_T]];
//   1220만 호라즘이고 그 뒤 비우는 땅: 쿤두즈·북부칸국(토하리스탄 — B20), 메르브 띠·아무다리야 띠(B17 — 1221 메르브 파괴 뒤 오아시스 경계 사료 없음)
const W3_K1220 = [[1220, W3_K], [1221, null]];
//   시스탄(파라·니므로즈 통째): 1220 비움(W2 1041~1219 비움과 같음 — 자란즈의 나스르 말리크 왕조) · 1221부터 헤라트 묶음과 같은 주인(몽골 · 1245 카르트 · 1381 티무르)
const W3_SISTAN_IDS = ['AF-FRA', 'AF-NIM'];
const W3_SISTAN = [[1220, null], ...W3_HERAT.filter(([y]) => y > 1220)];
//   헬만드·칸다하르 통째 줄은 1221부터(1220은 아래 'W3_헬만드1220' 나눔이 받음)
const W3_HK_IDS = ['AF-HEL', 'AF-KAN'];
// ① 트란스옥시아나 두 묶음. 'W3_서쪽' 부분 목록 = C2 W_REST_PARTS를 만드는 식 그대로(타슈켄트를 타슈켄트쪽 앞에, 동부부하라의 작은 떨어진 다각형은 뺌 — early-modern.mjs W 칸)에서 TM-L만 쓰는 레바프남을 뺀 것
const W3_REST_IDS = W3_REST_IDS0.filter((id) => W3_IDS.includes(id) && id !== 'TM-L');
const W3_REST_PARTS = W3_REST_PARTS_1865.flatMap(([p, g]) => {
  if (p === '타슈켄트쪽') return [['타슈켄트', F('UZ-TO', 'UZ-TK')], [p, g]];
  if (p === '레바프남') return [];
  if (p === '동부부하라') return [[p, g.filter((poly) => deg2([poly]) > 0.05)]];
  return [[p, g]];
});
const W3_R = ownSplit('W3_서쪽', W3_REST_IDS, W3_REST_PARTS, '나머지', {
  러시아: [[ERA_START, null]], 타슈켄트: W3_TASH, 타슈켄트쪽: [[ERA_START, null]], 톈산: [[ERA_START, null]], 키질쿰북: [[ERA_START, null]],
  동부부하라: W3_TRANS, 파미르: [[ERA_START, null]], 지작: W3_TRANS, 부하라: W3_TRANS, 나머지: [[ERA_START, null]],
});
const W3_FP = ownSplit('W3_페르가나쪽', W3_FER_IDS, W3_FER_PARTS, '나머지', {
  러시아: [[ERA_START, null]], 알라이남: W3_TRANS, 코칸트: W3_TRANS, 후잔드: W3_TRANS, 제라프샨: W3_TRANS, 나머지: [[ERA_START, null]],
});
// ② 호라즘
const W3_KH = ownSplit('W3_호라즘', ['UZ-XO', 'UZ-QR', 'TM-D'], [['북', I(W3_K73, W3_CUT_URGENCH)], ['남', W3_K73]], '밖', { 북: W3_KH_N, 남: W3_KH_S, 밖: [[ERA_START, null]] });
// ③ 투르크멘
const W3_TM = ownSplit('W3_투르크멘', W3_TM_IDS, W3_TM_PARTS, '카라쿰', { 메르브: W3_K1220, 아할: W3_K1220, 아무: W3_K1220, 카라쿰: [[ERA_START, null]] });
// ④ 아프가니스탄
const W3_CUT_IDS = ['AF-BAM', 'AF-GHA', 'AF-WAR', 'AF-LAG', 'AF-KNR', 'AF-GHO', 'AFG-1752', 'AFG-1753', 'AF-NUR'];
const W3_MTN = ownSplit('W3_아프간산지', W3_CUT_IDS, [['하자라자트', W3_HAZ], ['카피리스탄', W3_KAF], ['바미안', F('AF-BAM')], ['와르다크', F('AF-WAR')], ['카불', F('AF-GHA', 'AF-LAG', 'AF-KNR')],
  ['헤라트', F('AF-GHO')], ['칸다하르', F('AFG-1752')]], '다이쿤디', {
  하자라자트: [[ERA_START, null]], 카피리스탄: [[ERA_START, null]], 바미안: W3_BAMYAN, 와르다크: W3_BAMYAN, 카불: W3_KABUL, 헤라트: W3_HERAT, 칸다하르: W3_KAND, 다이쿤디: [[ERA_START, null]],
});
// 1220 한 해: 헬만드·칸다하르를 W1A 헬만드 칼선 부분(W2 '헬만드'와 같은 상수)과 사막으로 나눔(⑤)
const W3_HK = ownSplit('W3_헬만드1220', W3_HK_IDS, [W3_AF_PARTS.find(([p]) => p === '헬만드')], '사막', { 헬만드: [[ERA_START, W3_K]], 사막: [[ERA_START, null]] }, { from: ERA_START, to: 1221 });
const W3_LINES = { 카불: W3_KABUL, 동부: [[ERA_START, null]], 칸다하르: W3_KAND, 헤라트: W3_HERAT, 발흐: W3_BALKH, 쿤두즈: W3_K1220, 북부칸국: W3_K1220, 바다흐샨: [[ERA_START, null]] };
const W3_WHOLE = Object.fromEntries(W3_GROUPS.map(([n, ids]) => [n, ids.filter((id) => !W3_CUT_IDS.includes(id))]));
for (const [n, ids] of Object.entries(W3_WHOLE)) own(ids.filter((id) => !W3_SISTAN_IDS.includes(id) && !W3_HK_IDS.includes(id)), W3_LINES[n]);
own(W3_SISTAN_IDS, W3_SISTAN);
own(W3_HK_IDS, W3_KAND.filter(([y]) => y > 1220));
// 이 칸 61조각을 모두 한 번씩 썼는지(통째 줄이 없는 TM-B는 시대 내내 비움)
{
  const used = [...W3_REST_IDS, ...W3_FER_IDS, 'UZ-XO', 'UZ-QR', 'TM-D', ...W3_TM_IDS, ...W3_CUT_IDS, ...Object.values(W3_WHOLE).flat(), 'TM-B'];
  const miss = W3_IDS.filter((id) => !used.includes(id));
  if (miss.length || used.length !== W3_IDS.length) throw new Error(`central-asia late-medieval W3: 칸 조각과 맞지 않음(빠짐 ${miss.join(', ')} · 쓴 수 ${used.length})`);
}
// 비운 땅(fillTables 뒤에 부름): 주인 줄이 null인 단위를 바뀌는 해마다 한 줄. 이유 —
//   시대 내내: 하자라자트·다이쿤디(하자라 산지)·카피리스탄(카피르 부족 땅)·동부(호스트·팍티카·팍티아 — 파슈툰 부족 땅)·바다흐샨(산악 소국 — B20)·파미르·
//     카라쿰·발칸·아할 기슭(투르크멘 유목지 — B17)·키질쿰북(유목민 사막)·호라즘 밖(우스튜르트·옛 아랄해 기슭)·C2 1500 단위 나눔의 남는 부분(러시아·타슈켄트쪽·톈산·나머지 — 톈산 기슭·차트칼 비탈)
//   1220: 시스탄(파라·니므로즈)·헬만드 칼선 밖 사막(W2 1219와 같음 — ⑤)
//   1221~: 쿤두즈·북부칸국·메르브 띠·아할 기슭·아무다리야 띠(B17·B20 — 파괴 뒤 실효 지배 근거 없음, 카라우나스·투르크멘) · 1221~1369 발흐(B15·B20) · 1221~1382 카불·가즈니(카라우나스 — B20)·1220~1382 바미안·와르다크
//   · 1221~1280·1381~1382 칸다하르(B15, 카르트 끝 뒤 티무르 함락 전) · 1360 호라즘 북(킵차크 끝·수피 앞 한 해) · 1431~ 호라즘(우즈베크 정복 뒤 주인 불분명 — B18)
const W3_voids = () => {
  const units = [...Object.values(W3_R), ...Object.values(W3_FP), ...Object.values(W3_KH), ...Object.values(W3_TM), ...Object.values(W3_MTN), ...Object.values(W3_HK), ...Object.values(W3_WHOLE).flat(), 'TM-B'];
  // 기간이 정해진 나눔 부분(W3_헬만드1220)은 그 기간에만, 통째 줄이 늦게 시작하는 조각(헬만드·칸다하르 1221~)은 줄이 시작한 뒤에만 본다(그 밖은 undefined — 비움 아님)
  const period = new Map(layouts.flatMap((l) => Object.values(l.units).map((u) => [u, [l.from, l.to]])));
  const ownerAt = (u, y) => {
    const p = period.get(u);
    if (p && !(p[0] <= y && y < p[1])) return undefined;
    return (lines.get(u) ?? [[ERA_START, null]]).filter(([yy]) => yy <= y).at(-1)?.[1];
  };
  const years = [...new Set([ERA_START, ...units.flatMap((u) => (lines.get(u) ?? []).map(([y]) => y)), ERA_END])].sort((a, b) => a - b);
  return years.slice(0, -1).map((y, i) => [y, years[i + 1], build(units.filter((u) => ownerAt(u, y) === null))]).filter(([, , g]) => g.length);
};
// ── C3 W3 끝 ──

// ── C3 E3 동 뒤 (몽골 제국·킵차크·모굴리스탄·카라델 — 최상위 이름 E3_) ──
// 조각: 동 23조각(E1과 같음). 정의 항목 moghulistan·kara-del. 블록 글: mongol-empire·golden-horde·moghulistan·kara-del(COMMON 5절)
// 늘리는 나라: mongol-empire(1220~1259 초원·준가르·제티수·타림 서쪽, M19)·golden-horde(1260~1395 초원, M20)·timurid-empire(동쪽 몫이 있으면). 남의 항목 칠함: qocho-uyghur-kingdom(끝 해는 이 칸, 정의 E2)·chagatai-khanate(정의 W3)·turfan-khanate(1487~1499, C2 항목 — 정의 J)
// 표 경계 해 처음 값: 칸 땅(신장) 안 앞 권역 도형이 바뀌는 해 1227·1271·1279·1368·1388(skel/prev-overlap.txt) + COMMON 5절의 해 1260·1264·1347·1370·1389·1396·1487
//   구현에서 고친 해: 1446(아부 알카이르 칸이 시르다리야 도시를 얻음 — 티무르 왕조 몫이 빔)을 더하고, 1264·1370은 뺌(이 칸 땅은 그해 바뀌지 않음 — W3 몫)
const E3_BOUNDS = [1227, 1260, 1271, 1279, 1347, 1368, 1388, 1389, 1396, 1446, 1487];
// C1·C2·E2 땅 상수(cuts.mjs·cuts-c3.mjs — 이름·식 그대로, 좌표를 베끼지 않음). 신장은 E2와 같은 차례(하미 → 이리 → 우루무치 → 북 → 카슈가르 → 악수 → 호탄 → 투루판 → 코를라)로
//   앞 도형을 빼서 겹침 0 — 1220 맞물림은 E2 1219 단위와 같은 조각, 1499 맞물림은 이리·우루무치·북의 합이 C2 '북'과 같아(E_S_URUM·북정 띠는 E_S_NORTH 안) C2 1500 단위와 같은 땅
import { E_S_HAMI as E3_S_HAMI, E_S_NORTH as E3_S_NORTH, E_S_ILI as E3_S_ILI, E_S_URUM as E3_S_URUM, E_S_KASH as E3_S_KASH, E_S_AKSU as E3_S_AKSU, E_S_KHOTAN as E3_S_KHOTAN } from './cuts.mjs';
import { E2_CUT_BEITING as E3_CUT_BEITING } from './cuts-c3.mjs'; // 북정(비슈발리크) 띠 — E2 칼선을 가져다 씀
import { EX_T1 as E3_T1, EX_T2 as E3_T2, EK_CUT_KARATAU as E3_CUT_KARATAU, EK_CUT_KOK as E3_CUT_KOK } from './cuts.mjs';
import { box as E3_box } from '../../lib.mjs';
const E3_MO = 'mongol-empire'; // 몽골 제국(M19 — 1220~1259 초원·준가르, 1220~1226 제티수·이리·타림 서쪽. 늘림 [1218, 1264))
const E3_CH = 'chagatai-khanate'; // 차가타이 칸국(정의 W3 — 1227 칭기즈 칸이 죽고 둘째 아들 차가타이가 알말리크 쪽 울루스를 물려받음)
const E3_MG = 'moghulistan'; // 모굴리스탄(1347 두글라트 아미르 불라지가 투글루크 티무르를 칸으로 세움 — 차가타이 칸국 동부)
const E3_GH = 'golden-horde'; // 킵차크 칸국(M20 — 1260~1395 카자흐 초원, 오르다 울루스(좌익). 늘림 [1260, 1396))
const E3_QO = 'qocho-uyghur-kingdom'; // 고창 위구르 왕국(정의 E2, 항목 끝 1388 — 창구 ③ 결정 Q-F: 1389 모굴리스탄 히지르 호자의 투루판 정복)
const E3_KD = 'kara-del'; // 카라델(하미 왕국, 1389~ — 결정 Q12)
const E3_TF = 'turfan-khanate'; // 투루판 칸국(C2 항목 — 1487 모굴리스탄이 동·서로 갈라짐)
const E3_TI = 'timurid-empire'; // 티무르 왕조(늘림 [1370, 1507) — 1396~1445 시르다리야 도시)
// 주인 줄(그해 말 모습 — 결정 Q6·Q7·Q11·Q12, 기본값 B22~B27, 맞춤 M12·M13·M19·M20·M24)
const E3_LINES = {
  // 제티수(알마티 주·알마티 시·잠빌 — 타라즈·탈라스 골짜기 포함): 1220 몽골 제국(E2 1218~1219와 같은 땅), 1227 차가타이 칸국, 1347 모굴리스탄(투글루크 티무르).
  //   1499 모양 = C2 1500 세미레치예·타라즈·꼬리알마티(조각 통째 — M24). 1465 카자흐 칸국 이주는 모굴리스탄 땅 안이라 칠하지 않음(M12)
  제티수: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG]],
  // 톈산 안쪽(추·비슈케크·탈라스·이식쿨·나린): 1227 차가타이, 1347 모굴리스탄, 1487 비움(유누스 칸이 죽고 칸국이 타슈켄트(서)·투루판(동)으로 갈라선 뒤
  //   톈산 안쪽은 키르기스 부족 땅 — C2 1500 W '톈산' 비움과 이어짐. 결과 노트 6절)
  톈산: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG], [1487, null]],
  // 시르다리야 도시 띠 중 사이람·투르키스탄(야시)·사우란·오트라르(남카자흐스탄의 카라타우 칼선 안): 1220 몽골 제국, 1260 킵차크 칸국(오르다 울루스 — M20),
  //   1396 티무르 왕조(1395 티무르가 톡타미시를 이기고 야시·오트라르를 쥠 — 1405 오트라르에서 죽음), 1446 비움(아부 알카이르 칸의 시르다리야 진출 뒤 우즈베크·티무르·카자흐 다툼 — B24, C2 1500 비움과 이어짐)
  시르다리야: [[1220, E3_MO], [1260, E3_GH], [1396, E3_TI], [1446, null]],
  // 시르다리야 중류(크질오르다의 칼선 안 — 시그나크·사브란): 1220 몽골 제국, 1260 킵차크 칸국(시그나크는 오르다 울루스의 도읍), 1396 비움(티무르의 승리 뒤 킵차크 좌익이 흩어짐 — B24)
  악메체트: [[1220, E3_MO], [1260, E3_GH], [1396, null]],
  // 카자흐 초원(카라타우·크질오르다 칼선 밖, 서·북·중부와 동카자흐스탄): 1220 몽골 제국(M19 — 주치 울루스가 들어서기 전 제국 한 색), 1260 킵차크 칸국(오르다 울루스, M20),
  //   1396 비움(B24 — 킵차크 분열 뒤 유목 집단, 유목 우즈베크 칸국 항목은 두지 않음)
  초원: [[1220, E3_MO], [1260, E3_GH], [1396, null]],
  // 이리 골짜기(쿨자·알말리크): 1227 차가타이(알말리크가 칸의 본영), 1347 모굴리스탄, 1487 비움(톈산 안쪽과 같은 까닭 — 오이라트·모굴 유목지, C2 1500 '북' 비움과 이어짐)
  이리: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG], [1487, null]],
  // 우루무치 띠(비슈발리크): 1220 고창 위구르(M13 — 몽골 제국·원의 종속국, 창구 ③ 결정 Q-F로 1388까지), 1389 모굴리스탄(히지르 호자의 투루판 정복 — 명은 모굴리스탄을 별실팔리 = 비슈발리크라 부름),
  //   1487 비움(투루판 칸국은 투루판 분지만 — C2 1500 '북' 비움과 이어짐)
  우루무치: [[1220, E3_QO], [1389, E3_MG], [1487, null]],
  // 투루판 분지(고창·카라샤르): 1220 고창 위구르(1388까지 — 위키백과 Turpan: 이디쿠트 왕국이 1389 히지르 호자 침입까지), 1389 모굴리스탄, 1487 투루판 칸국(아흐마드 알라크)
  투루판: [[1220, E3_QO], [1389, E3_MG], [1487, E3_TF]],
  // 코를라·룬타이(C2 칼선 T2): 1220 고창 위구르(E2 1219와 같은 주인 — 맞물림), 1389 모굴리스탄, 1487 투루판 칸국(반영 F2 — 아흐마드 알라크가 투루판에서 타림 북쪽을 다스림,
  //   위키백과 Turpan Khanate. C2 1500~1513 코를라 투루판 칸국과 이어짐)
  코를라: [[1220, E3_QO], [1389, E3_MG], [1487, E3_TF]],
  // 하미(이주·바르쿨): 1220 고창 위구르(1284 마지막 이디쿠트가 하미·간쑤로 옮김 — 위키백과 Turpan), 1389 카라델(군나시리 — 결정 Q12)
  하미: [[1220, E3_QO], [1389, E3_KD]],
  // 준가르(톈산 북쪽에서 이리·우루무치 띠를 뺀 땅 — 알타이·타르바가타이·준가르 분지): 1220 몽골 제국(M19), 1260 비움(카이두·오이라트 유목지 — M19·B22·B27)
  북: [[1220, E3_MO], [1260, null]],
  // 카슈가르·악수·쿠차·호탄(타림 서쪽): 1220 몽골 제국, 1227 차가타이 칸국(1260~1269 카이두·두와·원의 다툼은 차가타이 한 색 — B22), 1347 모굴리스탄(두글라트 아미르가 칸의 이름으로 다스림)
  카슈가르: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG]],
  악수: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG]],
  호탄: [[1220, E3_MO], [1227, E3_CH], [1347, E3_MG]],
  // 나머지 '동'(롭노르·체르첸·차클리크 쪽 남동부 사막과 쿠루크타그): 사막·유목지라 시대 내내 비움(B27 — 1759까지)
  동: [[1220, null]],
};
const E3_ownerAt = (line, y) => line.filter(([yy]) => yy <= y).at(-1)[1];
const E3_cutLine = (line, from, to) => [[from, E3_ownerAt(line, from)], ...line.filter(([y]) => y > from && y < to)];
// 카자흐스탄·키르기스 북부(앞 권역 도형 0 km² — skel/prev-overlap.txt): 시대 내내 한 나눔(E2와 같은 칼선 — 1220 맞물림)
const E3_ZHETYSU_IDS = ['KAZ-3207', 'KAZ-4829', 'KZ-ZHA']; // 알마티 주·알마티 시·잠빌(타라즈 띠와 나머지가 시대 내내 같은 주인이라 통째)
const E3_TIANSHAN_IDS = ['KG-C', 'KG-GB', 'KG-N', 'KG-T', 'KG-Y']; // 추·비슈케크·나린·탈라스·이식쿨
const E3_KZ_SPLITS = [
  ['E3_남카', ['KZ-YUZ'], [['시르다리야', E3_CUT_KARATAU]], '초원'],
  ['E3_크질오르다', ['KZ-KZY', 'KAB'], [['악메체트', E3_CUT_KOK]], '초원'],
];
const E3_SPLIT_IDS = E3_KZ_SPLITS.flatMap(([, ids]) => ids);
const E3_STEPPE_IDS = idsOf('KAZ', 'KAB').filter((id) => !E3_ZHETYSU_IDS.includes(id) && !E3_SPLIT_IDS.includes(id)); // 나머지 카자흐스탄 조각(초원·동카자흐스탄)
own(E3_ZHETYSU_IDS, E3_LINES.제티수);
own(E3_TIANSHAN_IDS, E3_LINES.톈산);
own(E3_STEPPE_IDS, E3_LINES.초원);
const E3_WHOLE = [{ ids: E3_ZHETYSU_IDS, line: E3_LINES.제티수 }, { ids: E3_TIANSHAN_IDS, line: E3_LINES.톈산 }, { ids: E3_STEPPE_IDS, line: E3_LINES.초원 }];
const E3_KZ_UNITS = E3_KZ_SPLITS.map(([name, ids, parts, rest]) => {
  const names = [...parts.map(([p]) => p), rest];
  return { units: ownSplit(name, ids, parts, rest, Object.fromEntries(names.map((p) => [p, E3_LINES[p]]))), names, linesOf: (p) => E3_LINES[p] };
});
// 신장(CN-XJ): 앞 권역 도형(서하·몽골 제국·원·북원·명·몽골의 동쪽 띠)이 바뀌는 해마다 나눔(E2와 같은 식 — prevListOf로 그해 버전을 모두 뺌).
//   늘리는 몽골 제국은 그해 원래 도형(1227~1270 동쪽 띠 24,926 km²)을 뺀 땅에만 칠함(겹침 0)
const E3_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]); // 작은 구멍(약 0.01제곱도 미만)은 메운 모양으로 뺀다
const E3_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6); // 넓이 거의 0인 바늘 조각을 버림
const E3_BOX = (() => {
  const xs = XJ.flat(2);
  return E3_box(Math.min(...xs.map((q) => q[0])) - 1, Math.min(...xs.map((q) => q[1])) - 1, Math.max(...xs.map((q) => q[0])) + 1, Math.max(...xs.map((q) => q[1])) + 1);
})();
const E3_boxed = new Map();
const E3_inBox = (g) => {
  if (!E3_boxed.has(g)) E3_boxed.set(g, E3_noDust(I(E3_filled(g), E3_BOX)));
  return E3_boxed.get(g);
};
const E3_sizeIn = new Map();
const E3_rawMinus = (from, to) => {
  const at = (y) => PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= y && y < t).map(([, , g]) => E3_inBox(g))).filter((g) => g.length);
  const sizeAt = (y) => at(y).reduce((s, b) => {
    if (!E3_sizeIn.has(b)) E3_sizeIn.set(b, deg2(E3_noDust(I(b, XJ))));
    return s + E3_sizeIn.get(b);
  }, 0);
  const ys = new Set();
  for (const id of PREV_IDS) for (const [f, t] of prevListOf(id)) for (const y of [f, t]) if (y > from && y < to) ys.add(y);
  const s0 = sizeAt(from);
  for (const y of ys) if (Math.abs(sizeAt(y) - s0) > 1e-4) throw new Error(`central-asia late-medieval E3: [${from}, ${to}) 안 ${y}년에 신장 안 앞 권역 도형이 바뀜 — E3_XJ_YEARS를 나눈다`);
  const raw = at(from);
  return E3_noDust(raw.length ? D(XJ, ...raw) : XJ);
};
const E3_XJ_SHAPES = [['하미', E3_S_HAMI], ['이리', I(E3_S_NORTH, E3_S_ILI)], ['우루무치', U(E3_S_URUM, I(E3_S_NORTH, E3_CUT_BEITING))], ['북', E3_S_NORTH], ['카슈가르', E3_S_KASH], ['악수', E3_S_AKSU], ['호탄', E3_S_KHOTAN], ['투루판', E3_T1], ['코를라', E3_T2]];
const E3_XJ_YEARS = [ERA_START, 1227, 1271, 1279, 1368, 1388, ERA_END];
const E3_XJ_LAYOUTS = E3_XJ_YEARS.slice(0, -1).map((from, i) => {
  const to = E3_XJ_YEARS[i + 1];
  // 부스러기(0.03제곱도 미만 — 앞 도형 가장자리의 가는 띠)는 칠하지 않고 '앞'(주인 없음)에 둔다(E2·C2 EX와 같은 꼴)
  let left = E3_rawMinus(from, to).filter((p) => deg2([p]) >= 0.03);
  const parts = [];
  for (const [name, shape] of E3_XJ_SHAPES) {
    let g = E3_noDust(I(left, shape));
    // 우루무치 띠: 마나스강 북쪽 끝 작은 덩어리(0.02제곱도 미만)는 '북'(준가르)에 남김(E2와 같음 — 1220 맞물림)
    if (name === '우루무치') g = g.filter((q) => deg2([q]) >= 0.02);
    parts.push([name, g]);
    left = E3_noDust(D(left, name === '우루무치' ? g : shape));
  }
  parts.push(['동', left]);
  const names = parts.map(([p]) => p);
  const units = ownSplit(`E3_신장${from}`, [XJ_ID], parts, '앞', Object.fromEntries(names.map((p) => [p, E3_cutLine(E3_LINES[p], from, to)])), { from, to });
  return { from, to, units, names, linesOf: (p) => E3_LINES[p] };
});
// 비운 땅(fillTables 뒤에 부름): 주인 없는 부분이 같은 기간끼리 한 줄 — 이유는 E3_LINES 줄 주석
//   (초원·시르다리야 중류 1396~, 이스피자브 쪽 1446~, 톈산 안쪽·이리·우루무치 띠 1487~, 준가르 1260~, 남동부 사막 내내)
const E3_runs = ({ from = ERA_START, to = ERA_END, names, linesOf, geom }) => {
  const out = [];
  let run = null;
  for (let y = from; y <= to; y++) {
    const nulls = y < to ? names.filter((p) => E3_ownerAt(linesOf(p), y) === null) : null;
    const key = nulls ? nulls.join('|') : '끝';
    if (run && run.key !== key) {
      if (run.nulls.length) out.push(geom(run.from, y, run.nulls));
      run = null;
    }
    if (!run && nulls) run = { key, from: y, nulls };
  }
  return out;
};
const E3_voids = () => [
  ...E3_WHOLE.flatMap(({ ids, line }) => E3_runs({ names: ['통째'], linesOf: () => line, geom: (f, t) => V(f, t, ...ids) })),
  ...[...E3_KZ_UNITS, ...E3_XJ_LAYOUTS].flatMap((l) => E3_runs({ ...l, geom: (f, t, ns) => B(f, t, ...ns.map((p) => l.units[p])) })),
];
// ── C3 E3 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([ERA_START, ...W3_BOUNDS, ...E3_BOUNDS, ERA_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== ERA_START || BOUNDS.at(-1) !== ERA_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia late-medieval: 표 경계 해 ${BOUNDS.join(', ')}는 ${ERA_START}~${ERA_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia late-medieval: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia late-medieval: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia late-medieval: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia late-medieval: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia late-medieval: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== ERA_END) throw new Error(`central-asia late-medieval: 마지막 표의 끝이 ${joined.TO} (${ERA_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 ERA_END = 1500 — early-modern.mjs 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 시대 경계 맞물림 검사(COMMON 6절 '시대 경계', 맞춤 M24): 앞·뒤 시대가 이어 그리는 항목은 이 시대에 버전이 있으면
// SEAM_OUT — 마지막 버전이 이 시대 끝 해까지(to = ERA_END = 다음 시대 첫 해), SEAM_IN — 첫 버전이 이 시대 첫 해부터(from = ERA_START). 버전이 없으면 지나감(뼈대)
// (끝 해까지 칠하지 않으면 경계 앞에 틈이, 첫 해부터 칠하지 않으면 경계 뒤에 틈이 생김. 늘린 나라도 이 시대의 versions에 있는 동안 같이 본다 — joinEras가 extensions로 옮기기 전)
const SEAM_OUT = ['timurid-empire', 'moghulistan', 'kara-del', 'turfan-khanate', 'arghun-kandahar'];
const SEAM_IN = ['khwarazmian-empire', 'mongol-empire', 'qocho-uyghur-kingdom'];
for (const id of SEAM_OUT) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== ERA_END) throw new Error(`central-asia late-medieval: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — 다음 시대가 ${ERA_END}년부터 이어 그리므로 ${ERA_END - 1}년까지 칠해야 함(맞물림)`);
}
for (const id of SEAM_IN) {
  const first = versions[id]?.[0];
  if (first && first[0] !== ERA_START) throw new Error(`central-asia late-medieval: ${id}의 첫 버전이 ${first[0]}~${first[1] - 1} — 앞 시대가 ${ERA_START - 1}년까지 칠하므로 ${ERA_START}년부터 칠해야 함(맞물림)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...W3_voids(), ...E3_voids()];

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
  return [{ name: `중앙아시아 몽골·티무르 시대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'late-medieval',
  versions,
  gapZones,
  voids,
};
