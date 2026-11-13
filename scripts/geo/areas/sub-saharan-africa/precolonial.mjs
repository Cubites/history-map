// sub-saharan-africa 시대 파일 precolonial (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 2333~1799: 케르마·쿠시부터 아샨티·메리나까지 (F7 — 천문 −2332~1799, 이름 '사하라 이남 식민 이전')
// 짝 항목 파일: data/entities/sub-saharan-africa-precolonial.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 새 항목 14와 땅 없는 항목 하나만 그 파일에 있고, 앞 잇는 항목 21은
//   F6 항목 3이 sub-saharan-africa-prepartition.yaml, F5 항목 8이 …-partition.yaml, F4 항목 3이 …-colonial.yaml, F2 항목 5가 …-decolonization.yaml, F1 항목 2가 …-modern.yaml)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa/의 다른 도우미 모듈. areas/sub-saharan-africa.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/sub-saharan-africa/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/sub-saharan-africa.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게) — 이 파일은 두지 않는다(아래 '빈 땅 검사 구역 없음')
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 사하라 이남 F7 짜임 안내 (F7 뼈대 2026-11-14 — 근거: docs/sub-saharan-africa/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 1·창구 ② 1~7)·기본값 8·9·10·20·21, F1~F6 창구 ②·③(특히 F6 Q1 (다)·Q4 (A)),
//   F7 창구 ②(질문 6건 Q1~Q6·자동 승인 0·기본값 D1~D27·M-F7-1·M-F7-2·M-F7-7 ㉮), 지시문 f7/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 여섯 구역(sahara-south·eastern-desert-nubia·danakil-afar·somali-haud-ogaden·kalahari·namib) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 표기: 해는 천문 연도다(기원전 N년 = 천문 1−N, 천문 0 = 기원전 1년). own 줄·V·B·ownSplit 기간·<앞머리>_BOUNDS에 음수가 든다 — 예 [-1749, 'kerma'](기원전 1750년), V(F7_START, -1749, …).
//   해는 정수로 늘어나야 한다([F7_START, null] 다음 [-1749, …], [-1503, …] 다음 [-784, …] — −1503 < −784). 코드·주석 숫자는 천문 연도, 화면 글에는 '기원전 N년'만(COMMON 머리 '해 표기').
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음. 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌거나 도형이 같은 해(기원전 591년(천문 −590) 메로에 천도·330 무렵 에자나의
//   메로에 원정·652 바크트·1076 무렵 가나 이슬람 개종·1324 만사 무사 순례·1493 아스키아 무함마드·1545 송가이의 말리 수도 약탈·1665~1709 콩고 내전·1652 VOC 정착·1787 앞 메리나 소국기)는 새 버전이 아니다 — 항목 글로(0단계 기본값 21).
// 첫 해와 첫 칠함: 이 시대 파일의 첫 해는 F7_START(−2332, 기원전 2333년 — 00-scope 연도 막대 하한), 끝은 F7_END(1800, 미포함). 첫 칠함은 케르마 천문 −1749(기원전 1750년 — 0단계 기본값 9)이고,
//   그 앞(−2332~−1750)은 이 권역 땅이 모두 빈다(own 줄 주인 null + voids). own 줄 첫 해는 늘 F7_START(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
// 시대 경계 맞물림: 뒤 시대 파일 prepartition.mjs(F6)의 첫 해 F6_START = 1800 = 이 파일의 F7_END(미포함 — 아래 확인 줄, 시대 파일은 서로 가져오지 않으므로 손으로 맞춤). 이 파일 버전의 끝은 모두 F7_END 이하이고
//   (끝 없음 null 금지), 1800에 이어지는 나라(같은 id)는 joinEras가 이 파일 버전 뒤에 F6~F1 버전을 붙인다. **1799 말 모양은 F6의 1800 모양과 같아야 한다**(P1·D26) — 푼지만 예외
//   (funj-sultanate 1799 SD-KH·GZ·SI·NB·NW 166,622 → F6 1800 SD-GZ·SD-SI 61,662, −104,960 — D5, 사료 1802·2년). F7 새 항목 14는 모두 1799 앞에 끝나 1799에 칠한 새 항목은 0이어야 한다.
//   권역 파일의 joinEras 목록은 [precolonialEra, prepartitionEra, partitionEra, colonialEra, postwarEra, decolonizationEra, modernEra](과거가 앞).
// 앞 잇는 항목 21(같은 id — 블록은 그 자리, 파일 소유표 COMMON 5절): F6 3(oyo-empire·funj-sultanate·french-mauritius)·F5 8(fouta-djallon·asante·dahomey·benin-kingdom·kanem-bornu·buganda·merina-kingdom·cape-colony)·
//   F4 3(darfur·wadai·majeerteen-sultanate)·F2 5(portuguese-cape-verde·portuguese-sao-tome·portuguese-angola·portuguese-mozambique·swaziland-protectorate)·F1 2(ethiopia·reunion). buganda·lozi-kingdom은 Q6로 1799 앞을 칠하지 않는다.
//   항목 from 고침은 하나(cape-colony 1795 → 1652 — S-7 몫, F7 첫 버전 1745가 지금 from보다 앞이라 필수. 항목 from보다 앞 버전은 생성기가 받지 않으므로 from을 먼저 고친 뒤 own 줄).
// 비운 땅이 대부분이다: 해마다 이 권역 조각 대부분이 비고 칠한 땅만 바뀐다. 비운 땅은 own 줄 주인 null만 두지 말고 반드시 칸 <앞머리>_voids에 V(…)(조각 통째)·B(…)(칼선 몫 단위 — fillTables 뒤라야 단위 도형이 있음)로
//   (생성기 구멍 메우기가 이웃으로 채우지 않게). 늘 비는 조각은 V(F7_START, F7_END, …) 한 줄. 주인 null과 voids는 해가 같아야 한다.
// 오래된 나라의 버전 나눔(Q1 (다) 핵심 + 정점): 정복·상실 해가 문서로 닫힌 곳만 새 버전, 못 닫으면 핵심 한 버전(정점은 mapNote 글). 정점의 속국 땅은 F6 Q1 (다)대로 칠하지 않음
//   (임명 총독·세금이 들어간 땅은 그 나라 색, 자기 왕조가 남아 조공만 바친 왕국은 비움). 졸로프는 본국만 졸로프 색, 와알로·카요르·바올·시네·살룸은 비움(M-F7-1).
// 학설 갈림 해(Q2 (A) 본문 사건 해): 가나 830·쿠시 −784(기원전 785년)·악숨 100·마쿠리아 끝 1365·알로디아 끝 1504·로앙고 1561. 0단계 기본값 20이 닫은 해(가나 끝 1076·악숨 끝 960·쿠시 끝 350·
//   무타파 1430~1629·카넴-보르누 800·말리 끝 1670)와 결정 문장의 해는 칸이 다시 열지 않는다(사료 해는 결과 노트 2절 '사료 해 표'에만).
// Q3 콩고 1665·로앙고 1787에서 끝(그 뒤 F6 비움과 이어 1800 점프 0) · Q4 에티오피아 1332~1542 셰와·북 오로미아 포함 474,006, 1543부터 218,163(F6 1800 모양) · Q5 말리 핵심 밖 243,606은 1599에 비움(1599~1669 핵심 137,443)
//   · Q6 부간다·로지는 1800부터(1799 앞 칠하지 않음).
// 이집트 신왕국의 누비아(천문 −1499~−1069 = 기원전 1500~1070년)는 칠하지 않는다(0단계 결정 2 — 케르마 −1503 끝 뒤 쿠시 −784 앞은 SD-NO·SD-NR이 빔). 쿠시 25왕조의 이집트 땅은 서아시아 kushite-egypt 블록 그대로(기본값 8).
// 칸 사이 id 참조 하나(주인 id는 어느 칸 것이든 쓸 수 있고 블록 글·관계·허용 열쇠는 굵은 칸 하나 — COMMON 4절 '칸을 넘는 항목'): kanem-bornu(GN-7 블록 — HS-EI-7이 차드 TD-KA 800~1379·TD-LC 800~1799를 칠함).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-f7.mjs F7_*_IDS — F6 일곱 칸과 다른 다섯 칸 WA-7·GN-7·N-7·HS-EI-7·S-7)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(F7 <칸> 머리)과
//   그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 WA_·GN_·N_·HS_·S_(칸 id의 '-7'과 하이픈은 JS 이름이 못 됨 — 특별 지시 9,
//   F6 prepartition.mjs의 앞머리와는 파일이 달라 겹치지 않음), import도 별칭, ownSplit 묶음 이름도 앞머리(예: 'N_SNO'). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·era)은
//   고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-f7.mjs에 칸 칼선 머리 다섯이 있다. 새 칼선 둘 — WA-7 니제르강 굽이 북안(WA_CUT_NIGERBEND — ML-6 안, 말리 1324~1435·송가이 1468~1590, D8)·N-7 제3 폭포 선(N_CUT_CATARACT3 — SD-NO 안,
//   노바티아 400~624 북쪽 몫, D20). 칸은 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고, 이 파일 칸 머리 안에서 import { <앞머리>_CUT_… } from './cuts-f7.mjs'로 가져온다.
//   재사용 넷(좌표를 베끼지 않음 — 자기 앞머리 별칭, F7 뼈대 장치 시험 ⑤): HS-EI-7 import { H_CUT_BORANA as HS_CUT_BORANA } from './cuts-f5.mjs'(1332~1542 셰와·북 오로미아 = 칼선 위, 아래 몫은 비움 — Q4) ·
//   import { H1_CUT_MAJ as HS_CUT_MAJ } from './cuts-f4.mjs'(1750~ K3 마제르테인 몫, 호비오 몫은 비움) · S-7 import { S1A_CUT_CAPE1800 as S_CUT_CAPE1800, S2_CUT_MOZ as S_CUT_MOZ } from './cuts-f6.mjs'
//   (1780~ 케이프 동·북 몫·1629~ 모잠비크 잠베지 거점 몫, 칼선 밖 몫은 비움). 칼선 파일은 시대 파일을 가져오지 않으므로 순환이 없다(시대 파일끼리는 가져오지 않음).
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(F7_START·F7_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   새 칼선·재사용 칼선은 모두 시대 내내 같은 나눔(기본 기간)이고 주인만 해마다 바뀌므로 뼈대 값은 다섯 칸 모두 [](해마다 모양을 바꿔 그을 일이 생기면 칸이 더하고 결과 노트 2절).
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 F7_START(−2332)부터, 해는 늘어나고 F7_END(1800) 전이다.
//   예: own(WA_ML_CORE, [[F7_START, null], [1235, 'mali-empire'], [1670, null]]) + WA_voids에 V(F7_START, 1235, ...WA_ML_CORE)·V(1670, F7_END, ...WA_ML_CORE).
// 늘림 나라: 앞 권역 나라(portugal·france·dutch-republic·ottoman·kushite-egypt·aksumite-yemen·busaid-oman 등)를 주인으로 쓰면 생성기가 멈춘다 — 종주·점령은 관계로만. 이 단계에 늘림은 없다
//   (창구 ② 자동 승인 0건 — 팀북투 파샬릭·오스만 하베시 주·오만 동아프리카 해안·도데카스코이노스·이브림은 늘리지 않음), 서아시아·유럽·동남아 블록은 바이트 그대로.
// 빈 땅 검사 구역 없음(M-F7-5 ㉮): 이 파일은 gapZones를 만들지 않는다(아래 공통 줄 — 까닭 세 줄). F6 prepartition.mjs 구역(1800~1884)과 F5~F1 구역은 그대로다.
//   빈 땅 확인은 칸 땅 직접 재기(칠한 넓이 = 기대 넓이, 빈 땅 = voids 합)가 맡는다(COMMON 6절).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(사하라 이남 첫판·F1~F6 공통·칸 머리·F7 공통·F7 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SSA_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('precolonial');

const F7_START = -2332; // 이 시대 파일의 첫 해(기원전 2333년 말 모습 — 00-scope 연도 막대 하한). 그 앞 해는 쓰지 않는다
const F7_END = 1800; // 마지막 표의 끝(미포함) = 뒤 시대 파일 prepartition.mjs의 F6_START(1800)
const F6_START = 1800; // prepartition.mjs의 첫 해(그 파일 상수와 같게 손으로 맞춤 — 시대 파일은 서로 가져오지 않는다)
if (F7_END !== F6_START) throw new Error(`sub-saharan-africa precolonial: F7_END ${F7_END}가 F6 첫 해 ${F6_START}와 다름(1799/1800 사이가 비거나 joinEras가 '기간이 겹침'으로 멈춤)`);

// ── 조각 소유표 도우미 (F6 prepartition.mjs와 같은 꼴 — F7 뼈대가 옮김, table.mjs·prepartition.mjs·partition.mjs·colonial.mjs·postwar.mjs·decolonization.mjs·modern.mjs는 고치지 않음) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <앞머리>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < F7_START || e[0] >= F7_END)) {
    throw new Error(`sub-saharan-africa precolonial: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${F7_START} 이상 ${F7_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`sub-saharan-africa precolonial: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = F7_START, to = F7_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`sub-saharan-africa precolonial: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`sub-saharan-africa precolonial: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`sub-saharan-africa precolonial: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`sub-saharan-africa precolonial: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`sub-saharan-africa precolonial: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── F7 WA-7 서아프리카 사헬·대서양 (최상위 이름 WA_) ──
// 조각 F7_WA_IDS(라이베리아 15·시에라리온 4·감비아 6·기니비사우 9·카보베르데 21·세네갈 14·기니 34·모리타니 13·말리 9·니제르 8 = 133), 구현 F7-WA-7
// 새 항목 4: ghana-empire(830~1075 MR-01·02·03·09·10·04·05·ML-1·ML-2·SN-MT 673,475 — Q2 (A)·D24)·mali-empire(1235~1669 일곱 단계 137,443 → 1324 정점 1,145,687 → … → 1599 핵심 137,443 — Q1 (다)·Q5)·
//   songhai-empire(1464~1590 267,629 → 1468 굽이 → 1475 ML-5 → 1502 769,438)·jolof-empire(1360~1548 본국만 — M-F7-1, 기본 어림 SN-LG 25,368, 칸이 닫음)
// 앞 잇는 항목 2: F5 fouta-djallon(1727~ F6 1800 모양 11조각 62,845) · F2 portuguese-cape-verde(1462~ CPV 21 3,595 — D17)
// 점프(P1): 830·1076 가나 · 1235·1324·1436·1464·1475·1502·1537·1599·1670 말리 · 1464·1468·1475·1502·1591 송가이 · 1360·1549 졸로프 · 1462 카보베르데(섬) · 1727 푸타잘롱
// 1799 = F6 1800 모양: fouta-djallon 62,845 · portuguese-cape-verde 3,595, 나머지 비움
// 칼선: 새 하나 WA_CUT_NIGERBEND(cuts-f7.mjs WA-7 머리 — import { WA_CUT_NIGERBEND } from './cuts-f7.mjs', ML-6 안 굽이 북안 몫 말리 1324~1435·송가이 1468~1590, 조사 상자 76,677 — D8)
// 비움: D6 흐린 나라(카아부·푸타토로·카르타·세구 등)·졸로프 속국 다섯(M-F7-1)·ML-6 칼선 밖·ML-8·니제르 나머지 다섯(D27)·시에라리온·라이베리아·해안 기니 내내
import { F7_WA_IDS, WA_CUT_NIGERBEND } from './cuts-f7.mjs';
const WA_BOUNDS = []; // 조각 통째·칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 나라 안 묶음(칸 지시문 '조각 묶음' — 넓이는 조각 육지 넓이, 조사 a-area 로그)
const WA_GHANA_ONLY = ['MR-09', 'MR-10', 'MR-04', 'MR-05', 'SN-MT']; // 타간트·기디마카·고르골·브라크나·마탐 183,763 — 가나 땅(아우다고스트), 가나 끝 뒤 내내 비움
const WA_MR_WAGADU = ['MR-02', 'MR-03']; // 호드엘가르비·아사바 86,577 — 가나 → 말리 정점(와가두)
const WA_ML_CORE = ['ML-BKO', 'GN-SI', 'GN-KO', 'GN-MD', 'GN-K']; // 바마코·시기리·쿠루사·만디아나·칸칸 — 말리 핵심(니아니, ML-2는 가나 몫이 있어 따로, 칸칸은 메인 기본값 M-F7-24로 더함)
const WA_ML_PEAK = ['ML-3', 'ML-4', 'SN-TC', 'SN-KE', 'GN-DB', 'GN-FA', 'GN-DI', 'GN-KE', 'GN-BE']; // 시카소·세구·탐바쿤다·케두구·기니 북동 5 — 말리 정점, 1599 젠네 전투에 비움(Q5)
const WA_ML_KAABU = ['SN-KD', ...idsOf('GMB'), 'GW-GA']; // 콜다·감비아·가부 33,170 — 말리 정점, 1537 카아부 독립에 비움(카아부는 비움 — D6)
const WA_SONGHAI_NE = ['NE-6', 'NE-8']; // 티야베리·니아메 92,903 — 송가이 핵심(템포 강 서안)
const WA_JOLOF = ['SN-LG']; // 루가 25,368 — 졸로프 본국(린게르 군 15,375 + 서쪽 루가·케베메르 군은 카요르 땅 — 알려진 근사, M-F7-1)
const WA_GIN_COAST = ['GN-BF', 'GN-BK', 'GN-C', 'GN-CO', 'GN-DU', 'GN-FO', 'GN-FR', 'GN-GU', 'GN-KD', 'GN-KS', 'GN-LO', 'GN-MC', 'GN-NZ', 'GN-YO']; // 기니 해안·숲 14(F6 WA-6과 같은 묶음)
const WA_GIN_FOUTA = minus(idsOf('GIN'), ...WA_GIN_COAST, ...WA_ML_CORE.filter((id) => id.startsWith('GN-')), 'GN-DB', 'GN-FA', 'GN-DI', 'GN-KE', 'GN-BE'); // 푸타잘롱 11 62,845 = F6 WA_GIN_FOUTA
const WA_SEN_REST = ['SN-SL', 'SN-TH', 'SN-DB', 'SN-DK', 'SN-FK', 'SN-KL', 'SN-KA', 'SN-ZG', 'SN-SE']; // 와알로·카요르·바올·시네·살룸·카자망스 — 내내 비움(M-F7-1·D6)
const WA_MR_REST = ['MR-06', 'MR-07', 'MR-08', 'MR-11', 'MR-12', 'MR-NKC']; // 트라르자·아드라르·누아디부·티리스제무르·인시리·누악쇼트 — 사막·무어인 땅, 내내 비움
const WA_NE_REST = ['NE-1', 'NE-2', 'NE-4', 'NE-5', 'NE-7']; // 아가데즈·디파·마라디·타우아·진데르 — 내내 비움(D27 — 아가데즈는 칠하지 않음)
// ML-6(통북투) 나눔: 굽이 = 칼선 안(팀북투·니제르 굽이 강가), 사막 = 칼선 밖(아라우안·타우데니 — 내내 비움, 팀북투 파샬릭은 늘리지 않음)
const WA_ML6 = ownSplit('WA_ML6', ['ML-6'], [['굽이', WA_CUT_NIGERBEND]], '사막');
// 그해 말 주인 줄 [조각들, 줄, 비운 까닭] — 말리·송가이는 조각마다 한 줄로 두 나라 해를 함께 적어 같은 해 두 주인 0(칸 지시문 소유표)
const WA_OWN = [
  [WA_GHANA_ONLY, [[F7_START, null], [830, 'ghana-empire'], [1076, null]], '가나 앞(Q2 (A) 830)·가나 끝 뒤(기본값 20 1076, 1203 소소·무어인 땅)'],
  [['MR-01'], [[F7_START, null], [830, 'ghana-empire'], [1076, null], [1324, 'mali-empire'], [1436, null], [1502, 'songhai-empire'], [1591, null]], '가나 앞·가나 끝~말리 정점 앞·1436 왈라타를 투아레그에게 잃음~송가이 1502 앞·톤디비 뒤'],
  [WA_MR_WAGADU, [[F7_START, null], [830, 'ghana-empire'], [1076, null], [1324, 'mali-empire'], [1475, null]], '가나 앞·가나 끝~말리 정점 앞·1475 뒤(와가두 — 1477 모시 원정은 칠하지 않음)'],
  [['ML-1'], [[F7_START, null], [830, 'ghana-empire'], [1076, null], [1324, 'mali-empire'], [1502, 'songhai-empire'], [1591, null]], '가나 앞·가나 끝~말리 정점 앞·톤디비 뒤(1502 디아푸누 — 송가이)'],
  [['ML-2'], [[F7_START, null], [830, 'ghana-empire'], [1076, null], [1235, 'mali-empire'], [1670, null]], '가나 앞·가나 끝~키리나 앞(1203 소소)·말리 끝 뒤(기본값 20 1670)'],
  [WA_ML_CORE, [[F7_START, null], [1235, 'mali-empire'], [1670, null]], '말리 앞·말리 끝 뒤(1599~1669는 핵심만 — Q5)'],
  [WA_ML_PEAK, [[F7_START, null], [1324, 'mali-empire'], [1599, null]], '말리 정점 앞·1599 젠네 전투 뒤(Q5)'],
  [WA_ML_KAABU, [[F7_START, null], [1324, 'mali-empire'], [1537, null]], '말리 정점 앞·1537 카아부 독립 뒤(카아부는 비움 — D6)'],
  [['ML-5'], [[F7_START, null], [1324, 'mali-empire'], [1475, 'songhai-empire'], [1591, null]], '말리 정점 앞·톤디비 뒤(젠네 1475 — 송가이)'],
  [['ML-7'], [[F7_START, null], [1324, 'mali-empire'], [1464, 'songhai-empire'], [1591, null]], '말리 정점 앞·톤디비 뒤(가오 1464 — D9)'],
  [[WA_ML6['굽이']], [[F7_START, null], [1324, 'mali-empire'], [1436, null], [1468, 'songhai-empire'], [1591, null]], '말리 정점 앞·1433~34 팀북투를 투아레그에게 잃음~1468 송가이 앞·톤디비 뒤(D8)'],
  [[WA_ML6['사막']], [[F7_START, null]], '팀북투 북쪽 사막(타가자·아라우안 — 칠하지 않음, 팀북투 파샬릭 늘리지 않음)'],
  [WA_SONGHAI_NE, [[F7_START, null], [1464, 'songhai-empire'], [1591, null]], '송가이 앞·톤디비 뒤(덴디는 비움 — D6)'],
  [['NE-3'], [[F7_START, null], [1502, 'songhai-empire'], [1591, null]], '송가이 c.1500 모양 앞·톤디비 뒤'],
  [WA_JOLOF, [[F7_START, null], [1360, 'jolof-empire'], [1549, null]], '졸로프 앞·1549 다나기 전투 뒤(남은 졸로프 왕국은 비움 — D6)'],
  [idsOf('CPV'), [[F7_START, null], [1462, 'portuguese-cape-verde']], '무인도(1456 발견) — 1462 리베이라그란데 정착 앞(D17)'],
  [WA_GIN_FOUTA, [[F7_START, null], [1727, 'fouta-djallon']], '푸타잘롱 앞(1725 지하드·1727 타란산 승리 — D16)'],
  [['ML-8', ...WA_GIN_COAST, ...minus(idsOf('GNB'), 'GW-GA'), ...idsOf('SLE'), ...idsOf('LBR'), ...WA_SEN_REST, ...WA_MR_REST, ...WA_NE_REST], [[F7_START, null]], '키달·기니 해안·기니비사우·시에라리온·라이베리아·세네갈 서부·모리타니 북부·니제르 동부 — 내내 비움(D6·D27·M-F7-1)'],
];
// 칸 안 확인: 묶음을 합치면 F7_WA_IDS와 같아야 함(빠짐·겹침·남의 조각 없음 — 합 133, ML-6은 나눈 두 몫으로)
const WA_IDS = [...WA_OWN.flatMap(([ids]) => ids).filter((u) => !u.startsWith('WA_ML6/')), 'ML-6'];
if (WA_IDS.length !== F7_WA_IDS.length || new Set(WA_IDS).size !== WA_IDS.length || WA_IDS.some((id) => !F7_WA_IDS.includes(id))) {
  throw new Error(`sub-saharan-africa precolonial: WA-7 칸 묶음 조각 ${WA_IDS.length}개가 F7_WA_IDS ${F7_WA_IDS.length}개와 다름`);
}
for (const [ids, line] of WA_OWN) own(ids, line);
// 일부러 비운 땅: 주인 줄의 null 기간을 그대로(주인 null과 해가 같음 — 생성기 구멍 메우기가 이웃으로 채우지 않게, 까닭은 WA_OWN 셋째 칸)
const WA_nullSpans = (line) => line.flatMap(([y, o], i) => (o === null ? [[y, i + 1 < line.length ? line[i + 1][0] : F7_END]] : []));
const WA_voids = () => WA_OWN.flatMap(([ids, line]) => WA_nullSpans(line).map(([f, t]) => (ids[0].startsWith('WA_ML6/') ? B(f, t, ...ids) : V(f, t, ...ids))));
// ── F7 WA-7 끝 ──

// ── F7 GN-7 기니만·나이지리아·카메룬·보르누 (최상위 이름 GN_) ──
// 조각 F7_GN_IDS(코트디부아르 19·가나 10·토고 5·베냉 12·부르키나파소 45·나이지리아 37·카메룬 10·적도 기니 6·상투메 프린시페 2 = 146), 구현 F7-GN-7
// 새 항목 0(땅 없는 항목 sub-saharan-iron-age 글만 — 버전 0, own 줄 없음). 앞 잇는 항목 6: F6 oyo-empire(1608~ 요루바 5 + NG-KW 109,169 — D15) ·
//   F5 asante(1701 GH-AH → 1722 + GH-BA 65,112)·dahomey(1727~ 17,295)·benin-kingdom(1440~ NG-ED 19,899)·kanem-bornu(1380~ NG-BO·NG-YO·CM-EN — 블록 소유, D3) · F2 portuguese-sao-tome(1470~ STP 982 — D17)
// 점프(P1): 1380 보르누 · 1440 베닌 · 1470 상투메(섬) · 1608 오요 · 1701·1722 아샨티 · 1727 다호메이
// 1799 = F6 1800 모양: asante 65,112 · dahomey 17,295 · benin-kingdom 19,899 · oyo-empire 109,169 · kanem-bornu 152,744(+ HS-EI-7 TD-LC 20,461) · portuguese-sao-tome 982
// 블록 소유: kanem-bornu(HS-EI-7은 차드 TD-KA·TD-LC own 줄만 — 칸 사이 id 참조, 열쇠 1380·1800·800도 이 칸이). 칼선 0
// 비움: D6 흐린 나라(모시·덴키라·아콰무·이페·누페·하우사 등)·비오코 내내(D17)·부르키나파소·코트디부아르·토고 전부
import { F7_GN_IDS } from './cuts-f7.mjs';
const GN_BOUNDS = []; // 조각 통째·주인만 바뀌는 칸이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F7_GN_IDS 146)
const GN_ASANTE_CORE = ['GH-AH']; // 아샨티주 25,070 — 쿠마시
const GN_BONO = ['GH-BA']; // 브롱아하포 40,054 — 보노(테치만)
const GN_GHA_REST = minus(idsOf('GHA'), ...GN_ASANTE_CORE, ...GN_BONO); // 가나 나머지 8(판테 해안·덴키라·아킴·다곰바·곤자 등) — 내내 비움(D6·F6 Q1 (다))
const GN_BEN_S = ['BJ-AQ', 'BJ-KO', 'BJ-LI', 'BJ-MO', 'BJ-OU', 'BJ-PL', 'BJ-ZO']; // 베냉 남 7(17,295) — 다호메이 왕국(F6 1800 모양)
const GN_BEN_N = minus(idsOf('BEN'), ...GN_BEN_S); // 베냉 북 5(보르구·아타코라) — 내내 비움
const GN_EDO = ['NG-ED']; // 에도주 19,899 — 베닌시티
const GN_OYO = ['NG-OG', 'NG-OY', 'NG-OS', 'NG-ON', 'NG-EK', 'NG-KW']; // 요루바 5(73,215) + 일로린 NG-KW(35,933) = 109,148 — 오요 제국(F6 1800 모양)
const GN_BORNU = ['NG-BO', 'NG-YO', 'CM-EN']; // 보르노·요베·카메룬 극북주(약 152,740) — 보르누(차드 TD-LC는 HS-EI-7 own 줄)
const GN_NGA_REST = minus(idsOf('NGA'), ...GN_EDO, ...GN_OYO, 'NG-BO', 'NG-YO'); // 나이지리아 나머지 29(하우사·누페·이페·이갈라·콰라라파·오일 리버스 등) — 내내 비움(D6)
const GN_CMR_REST = minus(idsOf('CMR'), 'CM-EN'); // 카메룬 나머지 9 — 내내 비움
const GN_EMPTY = [...GN_GHA_REST, ...GN_BEN_N, ...GN_NGA_REST, ...GN_CMR_REST, ...idsOf('CIV'), ...idsOf('TGO'), ...idsOf('BFA'), ...idsOf('GNQ')]; // 내내 비운 129조각(비오코 GQ-BN·GQ-BS 포함 — D17)
{
  const all = [GN_ASANTE_CORE, GN_BONO, GN_BEN_S, GN_EDO, GN_OYO, GN_BORNU, idsOf('STP'), GN_EMPTY].flat();
  if (all.length !== F7_GN_IDS.length || new Set(all).size !== all.length || all.some((id) => !F7_GN_IDS.includes(id))) {
    throw new Error(`sub-saharan-africa precolonial: GN-7 묶음 합 ${all.length}개가 F7_GN_IDS ${F7_GN_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말). 1799 말 = F6 1800 모양(prepartition.mjs GN-6 줄 — 아샨티·다호메이·베닌·오요·보르누·상투메)
// 아샨티: 1701 피아세 전투로 덴키라를 꺾고 오세이 투투가 아칸 나라들을 묶음, 1722~1723 보노(보노만소) 정복(위키 en Ashanti Empire — D16). 덴키라·아킴·북 조공국은 비움
own(GN_ASANTE_CORE, [[F7_START, null], [1701, 'asante']]);
own(GN_BONO, [[F7_START, null], [1722, 'asante']]);
// 다호메이: 1600 무렵 아보메 고원에서 일어남, 1724 알라다·1727 우이다 정복(위키 en Kingdom of Dahomey — D16). 1600~1726은 약 1만 km² 밑이라 비움
own(GN_BEN_S, [[F7_START, null], [1727, 'dahomey']]);
// 베닌: 1180 무렵 오바 왕조, 1440 오바 에와레가 즉위해 나라를 넓힘(위키 en Benin Empire — D16). 1180~1439 도시 국가 시기는 비움
own(GN_EDO, [[F7_START, null], [1440, 'benin-kingdom']]);
// 오요: 1300 무렵 성립(전통 설), 1535 누페가 오요일레를 차지해 알라핀이 망명, 17세기 초 오요일레로 돌아와 제국기(위키 en Oyo Empire — D15, 한 버전). 1300~1607은 비움
own(GN_OYO, [[F7_START, null], [1608, 'oyo-empire']]);
// 카넴-보르누: 800~1379 카넴 몫은 HS-EI-7의 차드 TD-KA·TD-LC, 1380 무렵 마이 우마르 1세가 빌랄라에게 밀려 보르누로 옮김(위키 en Kanem–Bornu Empire — D3). 1472 무렵 응가자르가무 건설은 글
own(GN_BORNU, [[F7_START, null], [1380, 'kanem-bornu']]);
// 상투메: 1470 포르투갈 항해자들이 무인도를 찾음, 1493 첫 정착(D17 — 1470~1492는 알려진 근사 982). 1641~1648 네덜란드 점령은 되돌려진 점령이라 글
own(idsOf('STP'), [[F7_START, null], [1470, 'portuguese-sao-tome']]);
own(GN_EMPTY, [[F7_START, null]]);
// 일부러 비운 땅(주인 null과 같은 해 — 생성기 구멍 메우기가 이웃으로 채우지 않게)
const GN_voids = () => [
  V(F7_START, 1701, ...GN_ASANTE_CORE), // 아샨티 앞 — 덴키라 아래 아칸 소국들(D6)
  V(F7_START, 1722, ...GN_BONO), // 보노 왕국(자기 왕조 — 1722 정복 앞, D6)
  V(F7_START, 1727, ...GN_BEN_S), // 다호메이 1727 앞 — 알라다·우이다 등 작은 왕국(1만 밑, D16)
  V(F7_START, 1440, ...GN_EDO), // 베닌 1440 앞 — 이른 도시 국가(D16)
  V(F7_START, 1608, ...GN_OYO), // 오요 1608 앞 — 도시 국가·1535 누페 점령 뒤 망명기(D15)
  V(F7_START, 1380, ...GN_BORNU), // 보르누 1380 앞 — 카넴 서쪽 밖(D3)
  V(F7_START, 1470, ...idsOf('STP')), // 상투메·프린시페 1470 앞 — 무인도
  V(F7_START, F7_END, ...GN_EMPTY), // 내내 비움 — 모시·콩·덴키라·아콰무·판테·다곰바·곤자·이페·누페·하우사·이갈라·콰라라파·오일 리버스·카메룬 남부·비오코(D6·D17)
];
// ── F7 GN-7 끝 ──

// ── F7 N-7 나일(누비아·수단) (최상위 이름 N_) ──
// 조각 F7_N_IDS(수단 17·남수단 10 = 27), 구현 F7-N-7
// 새 항목 5: kerma(−1749~−1504 = 기원전 1750~1505년, SD-NO 365,071 — 기본값 9)·kush-napata(−784~349 = 기원전 785년~349, SD-NO + SD-NR 492,042 — Q2 (A))·nobatia(400~624 SD-NO 제3 폭포 북쪽 몫 — D20)·
//   makuria(500~624 SD-NO 남쪽 몫 → 625~1364 SD-NO 통째)·alodia(350~1503 SD-KH·GZ·SI·NB·NW 166,622 + SD-NR 126,971 = 293,593)
// 앞 잇는 항목 2: F6 funj-sultanate(1504~ 166,622 — D5, 1799 → 1800 −104,960 예외) · F4 darfur(1603~ 다섯 조각 519,608 → 1785 + 코르도판 385,630 — D22)
// 점프(P1): −1749·−1503 케르마 · −784 쿠시 · 350 쿠시 끝·알로디아 · 400 노바티아 · 500 마쿠리아 · 625 노바티아 → 마쿠리아 · 1365 마쿠리아 끝 · 1504 알로디아 끝·푼지 · 1603 다르푸르 · 1785 코르도판
// 1799 ≠ F6 1800은 푼지 하나(SD-KH·SD-NB·SD-NW −104,960 — P1 ㉠), darfur 906,053 같음
// 칼선: 새 하나 N_CUT_CATARACT3(cuts-f7.mjs N-7 머리 — import { N_CUT_CATARACT3 } from './cuts-f7.mjs', SD-NO 제3 폭포 선 북쪽 몫, 400~624만 두 몫의 주인이 다름)
// 비움: 이집트 신왕국 누비아(−1503~−785 — 결정 2)·쿠시 앞·350~399 SD-NO·카살라·게다레프·홍해·남수단 내내(D6)·코르도판 1785 앞
import { F7_N_IDS } from './cuts-f7.mjs';
import { N_CUT_CATARACT3 } from './cuts-f7.mjs';
const N_BOUNDS = []; // 제3 폭포 칼선은 시대 내내 같은 나눔(기본 기간)이라 표 경계 해를 더하지 않아도 됨
// 사료(※ 연도 — 결과 노트 2절): 위키 en Kerma culture(고전기 기원전 1750~1500, 투트모세 1세 병합 기원전 1504 무렵)·Kingdom of Kush(알라라 기원전 800~760 무렵, 메로에 천도 기원전 591 무렵, 끝 350 무렵)·
//   Nobatia(400 무렵, 제2~제3 폭포 사이)·Makuria(도읍 동골라 500 무렵 — ※ 성립 500을 닫음, 노바티아 합병 620년대·642 앞 — ※ 625 그대로, 1365 내전으로 동골라 잃음)·Alodia(350 무렵, 북쪽 아부함드, 소바 함락 1500 무렵 — Q2 (A) 1504)·
//   Funj Sultanate(1504 아마라 둥카스, 1802 뒤 게지라에 한정)·Darfur Sultanate(1603 — F4 닫음, 1785 무렵 코르도판)
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F7_N_IDS 27)
const N_SNO = ['SD-NO']; // 북부 365,071 — 제3 폭포 칼선으로 북쪽 몫(제2~제3 폭포)·남쪽 몫(제3 폭포~모그라트)
const N_SNR = ['SD-NR']; // 나일강 126,971 — 나파타 동쪽·메로에·아부함드
const N_ALO = ['SD-KH', 'SD-GZ', 'SD-SI', 'SD-NB', 'SD-NW']; // 하르툼·게지라·센나르·청나일·백나일 166,622 — 알로디아 → 푼지
const N_DAR = ['SD-DE', 'SD-DN', 'SD-DW', 'SDN-5856', 'SDN-5857']; // 다르푸르 다섯 519,608
const N_SKO = ['SD-KN', 'SD-KS']; // 코르도판 385,630 — 1785 다르푸르
const N_EAST = ['SD-KA', 'SD-GD', 'SD-RS']; // 카살라(가시 델타)·게다레프·홍해(베자) — 내내 비움(속국·흐린 땅, D6)
const N_SDS = idsOf('SDS'); // 남수단 10 — 내내 비움(쉴루크·딩카·아잔데 — D6)
{
  const all = [N_SNO, N_SNR, N_ALO, N_DAR, N_SKO, N_EAST, N_SDS].flat();
  const want = new Set(F7_N_IDS);
  if (N_SDS.length !== 10 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa precolonial: N-7 나라별 묶음 합 ${all.length}이 F7_N_IDS ${want.size}와 다름`);
  }
}
// 누비아 북부 — 케르마(−1749~−1504)·이집트 신왕국 누비아 비움(−1503~−785, 결정 2)·쿠시(−784~349)·350~399 비움·노바티아(북쪽 몫 400~624)·마쿠리아(남쪽 몫 500~, 625~ 통째)·1365 동골라 상실 뒤 비움
const N_NO = ownSplit('N_SNO', N_SNO, [['북', N_CUT_CATARACT3]], '남', {
  북: [[F7_START, null], [-1749, 'kerma'], [-1503, null], [-784, 'kush-napata'], [350, null], [400, 'nobatia'], [625, 'makuria'], [1365, null]],
  남: [[F7_START, null], [-1749, 'kerma'], [-1503, null], [-784, 'kush-napata'], [350, null], [500, 'makuria'], [1365, null]],
});
own(N_SNR, [[F7_START, null], [-784, 'kush-napata'], [350, 'alodia'], [1504, null]]); // 1504 뒤 압달랍 땅은 푼지 속국이라 비움(F6 Q1 (다))
own(N_ALO, [[F7_START, null], [350, 'alodia'], [1504, 'funj-sultanate']]); // 1700 무렵 푼지 정점의 속국 땅은 칠하지 않음(D5)
own(N_DAR, [[F7_START, null], [1603, 'darfur']]);
own(N_SKO, [[F7_START, null], [1785, 'darfur']]); // 1785 앞은 무사바아트·푼지 속국이라 비움(D22)
own([...N_EAST, ...N_SDS], [[F7_START, null]]);
// 비운 땅(own 줄 주인 null과 같은 해)
const N_voids = () => [
  V(F7_START, -1749, ...N_SNO), // 케르마 고전기 앞(기본값 9)
  V(-1503, -784, ...N_SNO), // 이집트 신왕국 누비아·나파타 독립 앞(결정 2 — 따로 칠하지 않음)
  V(350, 400, ...N_SNO), // 쿠시 끝 뒤 노바티아·마쿠리아 앞
  B(400, 500, N_NO.남), // 제3 폭포 남쪽 — 마쿠리아 앞(동골라 500 무렵)
  V(1365, F7_END, ...N_SNO), // 1365 동골라 상실 뒤(도도와 잔여·샤이키야·푼지 속국 — 비움)
  V(F7_START, -784, ...N_SNR), // 쿠시 앞
  V(1504, F7_END, ...N_SNR), // 압달랍(푼지 속국)
  V(F7_START, 350, ...N_ALO), // 알로디아 앞
  V(F7_START, 1603, ...N_DAR), // 다르푸르 앞(F4 닫음)
  V(F7_START, 1785, ...N_SKO), // 코르도판 — 다르푸르 앞(D22)
  V(F7_START, F7_END, ...N_EAST, ...N_SDS), // 카살라·게다레프·홍해·남수단 내내(D6)
];
// ── F7 N-7 끝 ──

// ── F7 HS-EI-7 뿔·차드·동아프리카·인도양 섬 (최상위 이름 HS_) ──
// 조각 F7_HS_IDS(에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·차드 22·중앙아프리카 17·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30·마다가스카르 22·모리셔스 14·
//   세이셸 22·코모로 3·프랑스 레위니옹·마요트 2·세인트헬레나 2 = 313), 구현 F7-HS-EI-7
// 새 항목 2: aksum(100~959 ER-AN·MA·DU·SK·DK 91,800 + ET-TI 49,498 = 141,298 — Q2 (A))·zagwe-dynasty(1137~1269 ET-TI·ET-AM·ER-AN·ER-MA 218,163 — F6 ethiopia 1800 모양)
// 앞 잇는 항목 7(블록 고침 6 + buganda 블록 고침 0 — Q6): F6 french-mauritius(1715~ MUS 14) · F5 merina-kingdom(1787~ 핵심 4 58,702 — D2)·buganda(Q6 — 1800부터) ·
//   F4 wadai(1635~ 첫 버전만 당김 — D22)·majeerteen-sultanate(1750~ K3 칼선 몫) · F1 ethiopia(1270~ 218,163 → 1332 + 셰와·북 오로미아 255,843 = 474,006 → 1543 218,163 — Q4)·reunion(1665~ FR-RE)
// 점프(P1): 100·960 악숨 · 800 카넴(차드 몫) · 1137 자그웨 · 1270 자그웨 → 에티오피아 · 1332·1543 에티오피아 · 1380 카넴 TD-KA 비움 · 1635 와다이 · 1665 레위니옹(섬) · 1715 모리셔스(섬) · 1750 마제르테인 · 1787 메리나
// 1799 = F6 1800 모양: ethiopia 218,143(F6 1800 — Q4 218,163, 칸이 이음 표로 견줌) · wadai 124,146 · kanem-bornu TD-LC 20,461 · majeerteen-sultanate K3 몫 · merina-kingdom 58,702 · french-mauritius 1,884 · reunion 2,556
// 칸 사이 id 참조(own 줄만): kanem-bornu(GN-7 블록 — 차드 TD-KA 800~1379·TD-LC 800~1799, D3)
// 칼선: 재사용 둘(좌표를 베끼지 않음 — 쓸 때 이 칸 안에 import { H_CUT_BORANA as HS_CUT_BORANA } from './cuts-f5.mjs'(1332~1542 셰와·북 오로미아 = 칼선 위, 아래 몫은 비움 — Q4) ·
//   import { H1_CUT_MAJ as HS_CUT_MAJ } from './cuts-f4.mjs'(1750~ K3 마제르테인 몫 — F6 1800 모양과 같게, 호비오 몫은 비움)). 새 칼선 0
// 비움: D6 흐린 나라(이팟·아달·아주란·하라르·바기르미·부뇨로·르완다·부룬디·킬와·사칼라바 등)·악숨 960~자그웨 1137(D22)·D19 아달 점령·잔지바르·코모로·마요트·세이셸·세인트헬레나 내내(특별 지시 12)
import { F7_HS_IDS } from './cuts-f7.mjs';
import { H_CUT_BORANA as HS_CUT_BORANA } from './cuts-f5.mjs';
import { H1_CUT_MAJ as HS_CUT_MAJ } from './cuts-f4.mjs';
const HS_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 사료(결과 노트 2절): 악숨 100(Q2 (A) — 『에리트레아해 안내기』 1세기)·960 무렵 끝(기본값 20 — 구디트 전승은 글), 자그웨 1137~1270(위키 en Zagwe dynasty — 예쿠노 암라크),
//   에티오피아 1332 아므다 시욘의 이팟 원정(Q4)·1543부터 셰와·북 오로미아 비움(Q4 — 와이나 다가 전투로 아달을 물리친 해, 그 뒤 오로모 이주로 남쪽을 잃음 — 1529~1543 아달 점령은 칠하지 않음 D19), 와다이 1635·마제르테인 1750·카넴 800/1380(D3·D22),
//   메리나 1787 안드리아남포이니메리나 재통일(D2), 레위니옹 1665·모리셔스 1715 정착(D18)
// 나라·섬별 묶음(칸 안에서 다시 적음 — 합은 F7_HS_IDS 313). 에리트레아 조각 이름표는 실제 주 이름과 어긋남(M-F6-2 — id와 넓이로 맞춤)
const HS_AKS_CORE = ['ET-TI', 'ER-AN', 'ER-MA']; // 티그라이 49,498·에리트레아 중부·남부주(이름표 ER-AN·ER-MA) 11,184 — 악숨 100~959, 자그웨 1137, 에티오피아 1270
const HS_AMH = ['ET-AM']; // 암하라 157,369(랄리벨라·곤다르) — 자그웨 1137, 에티오피아 1270
const HS_AKS_ER = ['ER-DU', 'ER-SK', 'ER-DK']; // 북홍해(이름표 ER-DU — 마사와·아둘리스)·안세바(이름표 ER-SK — 케렌)·남홍해(다흘락 제도 포함) — 악숨 100~959만
const HS_EOR = ['ET-OR']; // 오로미아 — 보라나 칼선 위는 셰와·북 오로미아(1332~1542), 아래는 내내 비움
const HS_EAA = ['ET-AA', 'ET-HA']; // 아디스아바바·하라리 — 1332~1542 에티오피아(Q4)
const HS_EREST = ['ET-SO', 'ET-SN', 'ET-AF', 'ET-GA', 'ET-DD', 'ET-BE', 'ER-GB']; // 소말리·남부 민족·아파르·감벨라·디레다와·베니샹굴·가시바르카 — 내내 비움(D6 이팟·아달·하라르 등)
const HS_DJI_SOL = idsOf('DJI', 'SOL'); // 7 — 내내 비움(제일라·이사크 — D6)
const HS_MAJ = ['SO-BR', 'SO-NU']; // 마제르테인 바리·누갈 — 1750~
const HS_MU = ['SO-MU']; // 무둑 — K3 마제르테인 몫 1750~, 호비오 몫 비움
const HS_SOM_REST = minus(idsOf('SOM'), ...HS_MAJ, ...HS_MU); // 10 — 갈구두드·베나디르·주바 등 내내 비움(아주란 — D6)
const HS_WADAI = ['TD-OD', 'TD-SI', 'TD-WF']; // 와다이 124,146 — 1635~(D22)
const HS_KA = ['TD-KA']; // 카넴 68,751 — 800~1379 카넴-보르누(칸 사이 id 참조 — GN-7 블록)
const HS_LC = ['TD-LC']; // 차드호 20,463 — 800~ 카넴-보르누(1380 뒤 보르누 몫 — F6 1800과 같음)
const HS_TCD_REST = minus(idsOf('TCD'), ...HS_WADAI, ...HS_KA, ...HS_LC); // 17 — 바기르미·보르쿠·엔네디·티베스티·남부 내내 비움(D6)
const HS_INLAND = idsOf('CAF', 'RWA', 'BDI', 'UGA', 'KEN', 'TZA'); // 189 — 중앙아프리카·대호수·케냐·탄자니아(잔지바르·펨바·킬와 포함) 내내 비움(D6·Q6 부간다)
const HS_MDG_CORE = ['MDG-5862', 'MDG-5875', 'MDG-5881', 'MDG-5871']; // 이메리나 고원 58,702 — 1787~(D2)
const HS_MDG_REST = minus(idsOf('MDG'), ...HS_MDG_CORE); // 18 — 사칼라바·베치미사라카 등 내내 비움(D6)
const HS_MUS = idsOf('MUS'); // 14 — 모리셔스섬·로드리게스 1715~(D18)
const HS_REU = ['FR-RE']; // 레위니옹 1665~(D18)
const HS_ISLES = ['FR-YT', ...idsOf('SYC', 'COM', 'SHN')]; // 마요트·세이셸 22·코모로 3·세인트헬레나 2 — 내내 비움(D18·특별 지시 12)
{
  const all = [HS_AKS_CORE, HS_AMH, HS_AKS_ER, HS_EOR, HS_EAA, HS_EREST, HS_DJI_SOL, HS_MAJ, HS_MU, HS_SOM_REST, HS_WADAI, HS_KA, HS_LC, HS_TCD_REST, HS_INLAND, HS_MDG_CORE, HS_MDG_REST, HS_MUS, HS_REU, HS_ISLES].flat();
  const want = new Set(F7_HS_IDS);
  if (HS_SOM_REST.length !== 10 || HS_TCD_REST.length !== 17 || HS_INLAND.length !== 189 || HS_MDG_REST.length !== 18 || want.size !== 313 || all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa precolonial: HS-EI-7 나라·섬별 묶음 합 ${all.length}이 F7_HS_IDS ${want.size}와 다름`);
  }
}
// 주인 줄(그해 말). 1799 말 모양 = F6 1800 모양(prepartition.mjs H-6·EI-6 — 부간다만 1800에 처음 칠함, Q6)
own(HS_AKS_CORE, [[F7_START, null], [100, 'aksum'], [960, null], [1137, 'zagwe-dynasty'], [1270, 'ethiopia']]); // 960~1136 비움(D22), 1270 예쿠노 암라크의 솔로몬 왕조
own(HS_AMH, [[F7_START, null], [1137, 'zagwe-dynasty'], [1270, 'ethiopia']]);
own(HS_AKS_ER, [[F7_START, null], [100, 'aksum'], [960, null]]); // 아둘리스·마사와 기슭과 다흘락 — 그 뒤 F6까지 비움
ownSplit('HS_EOR', HS_EOR, [['남', HS_CUT_BORANA]], '북', { 남: [[F7_START, null]], 북: [[F7_START, null], [1332, 'ethiopia'], [1543, null]] }); // 1332 아므다 시욘의 셰와·이팟 쪽(Q4), 1543 오로모 이주
own(HS_EAA, [[F7_START, null], [1332, 'ethiopia'], [1543, null]]);
own(HS_MAJ, [[F7_START, null], [1750, 'majeerteen-sultanate']]);
ownSplit('HS_MU', HS_MU, [['마제르테인', HS_CUT_MAJ]], '호비오', { 마제르테인: [[F7_START, null], [1750, 'majeerteen-sultanate']], 호비오: [[F7_START, null]] }); // K3
own(HS_WADAI, [[F7_START, null], [1635, 'wadai']]); // 다르푸르 조공은 글
own(HS_KA, [[F7_START, null], [800, 'kanem-bornu'], [1380, null]]); // 칸 사이 id 참조 — 1380 불랄라에 밀려 보르누로 옮김(카넴 땅 비움, D3)
own(HS_LC, [[F7_START, null], [800, 'kanem-bornu']]); // 칸 사이 id 참조 — GN-7 블록
own(HS_MDG_CORE, [[F7_START, null], [1787, 'merina-kingdom']]); // 1787 안드리아남포이니메리나 즉위·네 소국 재통일(1540~1786 소국기 비움 — D2)
own(HS_MUS, [[F7_START, null], [1715, 'french-mauritius']]); // 1715-09-20 뒤프렌 다르셀(네덜란드 1638~1710 정착은 칠하지 않음 — D18)
own(HS_REU, [[F7_START, null], [1665, 'reunion']]); // 1665 프랑스 동인도 회사 정착(1642 첫 유배·1663 정착 시도는 글)
// 늘 비는 묶음(HS_EREST·HS_DJI_SOL·HS_SOM_REST·HS_TCD_REST·HS_INLAND·HS_MDG_REST·HS_ISLES)은 줄을 적지 않아 시대 내내 주인 null(아래 voids)
const HS_voids = () => [
  V(F7_START, 100, ...HS_AKS_CORE, ...HS_AKS_ER), // 악숨 앞(다아마트 등 흐린 나라 — D6)
  V(960, 1137, ...HS_AKS_CORE), // 악숨 끝 960~자그웨 1137(D22 — 177년, 장부)
  V(960, F7_END, ...HS_AKS_ER), // 악숨 끝 뒤 북홍해·안세바·남홍해(F6과 같음)
  V(F7_START, 1137, ...HS_AMH), // 자그웨 앞 암하라
  B(F7_START, 1332, 'HS_EOR/북'), B(1543, F7_END, 'HS_EOR/북'), B(F7_START, F7_END, 'HS_EOR/남'), // 셰와·북 오로미아는 1332~1542만(Q4), 보라나 아래는 내내
  V(F7_START, 1332, ...HS_EAA), V(1543, F7_END, ...HS_EAA), // 아디스아바바·하라리(Q4)
  V(F7_START, F7_END, ...HS_EREST, ...HS_DJI_SOL, ...HS_SOM_REST), // 이팟·아달·하라르·아주란·제일라 등(D6), 아달 점령 1529~1543은 칠하지 않음(D19)
  V(F7_START, 1750, ...HS_MAJ), B(F7_START, 1750, 'HS_MU/마제르테인'), B(F7_START, F7_END, 'HS_MU/호비오'), // 마제르테인 앞·호비오 몫(D22)
  V(F7_START, 1635, ...HS_WADAI), // 와다이 앞(투나르 — D6)
  V(F7_START, 800, ...HS_KA, ...HS_LC), V(1380, F7_END, ...HS_KA), // 카넴 앞·1380 뒤 카넴 땅(불랄라 — D3)
  V(F7_START, F7_END, ...HS_TCD_REST, ...HS_INLAND), // 바기르미·중앙아프리카·부뇨로·르완다·부룬디·킬와 등(D6)과 부간다(Q6)
  V(F7_START, 1787, ...HS_MDG_CORE), V(F7_START, F7_END, ...HS_MDG_REST), // 메리나 소국기·사칼라바 등(D2·D6)
  V(F7_START, 1715, ...HS_MUS), V(F7_START, 1665, ...HS_REU), V(F7_START, F7_END, ...HS_ISLES), // 섬(특별 지시 12 — D18)
];
// ── F7 HS-EI-7 끝 ──

// ── F7 S-7 콩고 해안·앙골라·남부 (최상위 이름 S_) ──
// 조각 F7_S_IDS(남아프리카 9·레소토 10·에스와티니 4·짐바브웨 10·잠비아 10·말라위 28·모잠비크 11·나미비아 13·보츠와나 15·앙골라 18·가봉 9·콩고 공화국 12·콩고 민주 공화국 11 = 160), 구현 F7-S-7
// 새 항목 3: kongo-kingdom(1390~1664 CD-BC 54,607 + AO-ZAI·AO-UIG 99,110 = 153,717 — Q3)·loango-kingdom(1561~1786 CG-5·CG-16·CG-9 42,043 + GA-5 19,844 = 61,886 — Q2 (A)·Q3)·
//   mutapa-empire(1430~1628 ZW-MC·ME·MW·MA·MV·HA 210,396 + MZ-Q·T·S 271,738 = 482,134 — D7)
// 앞 잇는 항목 5(블록 고침 4 + lozi-kingdom 블록 고침 0 — Q6): F5 cape-colony(from 1795 → 1652 칸이 고침, 1745 ZA-WC 130,650 → 1780 칼선 몫 — D1·D12)·lozi-kingdom(Q6 — 1800부터) ·
//   F2 portuguese-angola(1582 AO-LUA·BGO·CNO 61,024 → 1617 + AO-BGU → 1671 + AO-CUS 156,735 — D10)·portuguese-mozambique(1629~ 잠베지 거점 몫 — D11)·swaziland-protectorate(1780~ SWZ 17,181 — D13)
// 점프(P1): 1390 콩고 · 1430 무타파 · 1561 로앙고 · 1582·1617·1671 앙골라 · 1629 무타파 끝·모잠비크 · 1665 콩고 끝 · 1745·1780 케이프 · 1780 스와지 · 1787 로앙고 끝
// 1799 = F6 1800 모양: cape-colony 1800 칼선 몫 · swaziland-protectorate 17,177 · portuguese-angola 156,735 · portuguese-mozambique 잠베지 거점 몫, 나머지 비움(lozi-kingdom 1799 비움 — Q6)
// 칼선: 재사용 둘(좌표를 베끼지 않음 — 쓸 때 이 칸 안에 import { S1A_CUT_CAPE1800 as S_CUT_CAPE1800, S2_CUT_MOZ as S_CUT_MOZ } from './cuts-f6.mjs' — 1780~ 케이프 ZA-EC·ZA-NC 안 몫(칼선 밖 몫은 비움)·
//   1629~ 모잠비크 MZ-Q·MZ-T·MZ-S 안 거점 몫(1430~1628은 안팎 모두 무타파)). 새 칼선 0
// 비움: D6 흐린 나라(티오·은동고·마탐바·카산제·토르와·로즈위·룬다·루바·쿠바·마라비 등)·1652~1744 케이프·1575~1581 앙골라·네덜란드 루안다 1641~1648(칠함 그대로 — D19)·콩고 분지·나미비아·보츠와나 내내
// 사료: 위키 en Kingdom of Kongo(c.1390 성립·1483 포르투갈 접촉·1665-10-29 음브윌라·1665~1709 내전·1914 명목 왕정 폐지)·Kingdom of Loango(가장 이른 문헌 c.1561·1787 왕 부아투 사망 뒤 공위·c.1883 해체)·
//   Kingdom of Mutapa(15세기 성립·1629 포르투갈 속국 조약)·Portuguese Angola·Kingdom of Ndongo(1582 마상가노·1671 푼구 안동고 함락)·Benguela(1617 상펠리페 드 벵겔라 건설)·
//   Dutch Cape Colony(1652-04-06·1745 스웰렌담·1780 그레이트피시강 경계)·History of Eswatini(1780 은드붕구니예), 조사 노트 d 1·2·3절
import { F7_S_IDS } from './cuts-f7.mjs';
import { S1A_CUT_CAPE1800 as S_CUT_CAPE1800, S2_CUT_MOZ as S_CUT_MOZ } from './cuts-f6.mjs';
const S_BOUNDS = []; // 조각 통째·재사용 칼선은 시대 내내 같은 나눔이라 표 경계 해를 더하지 않아도 됨
// 나라별 묶음(칸 안에서 다시 적음 — 합은 F7_S_IDS 160)
const S_KONGO = ['CD-BC', 'AO-ZAI', 'AO-UIG']; // 3 — 콩고 중앙·자이르·우이게(153,717 — 음반자콩구 둘레 콩고 왕국 핵심)
const S_LOANGO = ['CG-5', 'CG-16', 'CG-9', 'GA-5']; // 4 — 쿠일루·푸앵트누아르·니아리·냐응가(61,886 — 로앙고 해안)
const S_MASHONA = ['ZW-MC', 'ZW-ME', 'ZW-MW', 'ZW-MA', 'ZW-MV', 'ZW-HA']; // 6 — 마쇼날랜드(210,396 — 무타파 고원)
const S_MOZ_ZAMBEZI = ['MZ-Q', 'MZ-T', 'MZ-S']; // 3 — 잠베지아·테트·소팔라(271,738 — S_CUT_MOZ로 거점 지대와 밖)
const S_AGO_1582 = ['AO-LUA', 'AO-BGO', 'AO-CNO']; // 3 — 루안다·벵구·콴자노르테(61,024)
const S_AGO_1617 = ['AO-BGU']; // 1 — 벵겔라(39,880)
const S_AGO_1671 = ['AO-CUS']; // 1 — 콴자술(55,681 — 은동고 끝 뒤)
const S_CAPE_WC = ['ZA-WC']; // 1 — 웨스턴케이프(130,650)
const S_CAPE_EC = ['ZA-EC']; // 1 — 이스턴케이프(S_CUT_CAPE1800 안 몫만 1780부터)
const S_CAPE_NC = ['ZA-NC']; // 1 — 노던케이프(S_CUT_CAPE1800 안 몫만 1780부터)
const S_SWZ = idsOf('SWZ'); // 4 — 스와지 왕국(17,181)
const S_PAINTED = [S_KONGO, S_LOANGO, S_MASHONA, S_MOZ_ZAMBEZI, S_AGO_1582, S_AGO_1617, S_AGO_1671, S_CAPE_WC, S_CAPE_EC, S_CAPE_NC, S_SWZ].flat(); // 28
const S_REST = minus(F7_S_IDS, ...S_PAINTED); // 132 — 내내 비움(콩고 분지·티오·은동고·마탐바·카산제·카빈다·토르와·로즈위·로지·마라비·코이코이·츠와나·은구니 등)
{
  const all = [...S_PAINTED, ...S_REST];
  const want = new Set(F7_S_IDS);
  if (all.length !== want.size || new Set(all).size !== all.length || all.some((id) => !want.has(id))) {
    throw new Error(`sub-saharan-africa precolonial: S-7 나라별 묶음 합 ${all.length}이 F7_S_IDS ${want.size}와 다름`);
  }
}
// 콩고 왕국: c.1390 성립(정보 상자 — 0단계 기본값 20), 1665-10-29 음브윌라 전투에서 왕 안토니우 1세가 죽어 왕국이 갈라짐(Q3 (가) — 1665~1709 내전·1709 재통일·1914 명목 왕정 폐지는 글)
own(S_KONGO, [[F7_START, null], [1390, 'kongo-kingdom'], [1665, null]]);
// 로앙고 왕국: 가장 이른 문헌 c.1561(Q2 (A)), 1787 왕 부아투가 죽은 뒤 왕을 뽑지 못함(Q3 (가) — c.1883 해체는 글). 카빈다(카콩고·응고요, 6,811)는 1만 밑이라 비움
own(S_LOANGO, [[F7_START, null], [1561, 'loango-kingdom'], [1787, null]]);
// 무타파: 15세기(1430 무렵 — 기본값 20) 쇼나 고원 북쪽에서 성립, 1629 포르투갈 속국 조약으로 끝(D7 — 1683~ 로즈위·토르와는 비움)
own(S_MASHONA, [[F7_START, null], [1430, 'mutapa-empire'], [1629, null]]);
// 잠베지 계곡: 1430~1628 안팎 모두 무타파, 1629부터 테트·세나·켈리마느 둘레 프라주 띠만 포르투갈령(D11 — 1530년대 세나·테트 교역지는 1만 밑이라 비움), 띠 밖은 비움
ownSplit('S_MOZ', S_MOZ_ZAMBEZI, [['거점', S_CUT_MOZ]], '밖', {
  거점: [[F7_START, null], [1430, 'mutapa-empire'], [1629, 'portuguese-mozambique']],
  밖: [[F7_START, null], [1430, 'mutapa-empire'], [1629, null]],
});
// 앙골라: 1582 마상가노 요새로 콴자강 하류(1575~1581 루안다 2,893은 1만 밑 — 비움), 1617 벵겔라 건설, 1671 푼구 안동고 함락으로 은동고 끝(D10).
//   1641~1648 네덜란드의 루안다 점령은 되돌려진 점령이라 따로 칠하지 않고 포르투갈령 색 그대로(D19)
own(S_AGO_1582, [[F7_START, null], [1582, 'portuguese-angola']]);
own(S_AGO_1617, [[F7_START, null], [1617, 'portuguese-angola']]);
own(S_AGO_1671, [[F7_START, null], [1671, 'portuguese-angola']]);
// 케이프: 1652-04-06 얀 반 리베크의 VOC 보급 기지(1652~1744는 1만 밑 정착지·범위가 흐려 비움 — D1), 1745 스웰렌담 치안판사직으로 웨스턴케이프 통째(D12 — 동쪽 경계는 근사),
//   1780 그레이트피시강 경계로 F6 1800 경계 안(동·북 몫 — 1786 그라프레이넷은 같은 경계 안)
own(S_CAPE_WC, [[F7_START, null], [1745, 'cape-colony']]);
ownSplit('S_EC', S_CAPE_EC, [['케이프', S_CUT_CAPE1800]], '밖', { 케이프: [[F7_START, null], [1780, 'cape-colony']], 밖: [[F7_START, null]] });
ownSplit('S_NC', S_CAPE_NC, [['케이프', S_CUT_CAPE1800]], '밖', { 케이프: [[F7_START, null], [1780, 'cape-colony']], 밖: [[F7_START, null]] });
// 스와지: 1780 은드붕구니예 때 선 스와지 왕국(D13 — 1745 무렵 은과네 3세 때는 범위가 흐려 비움)
own(S_SWZ, [[F7_START, null], [1780, 'swaziland-protectorate']]);
own(S_REST, [[F7_START, null]]);
const S_voids = () => [
  V(F7_START, 1390, ...S_KONGO), // 콩고 왕국 앞 — 음판구·음빔바 소국들(범위 흐림)
  V(1665, F7_END, ...S_KONGO), // 음브윌라 뒤 — 내전으로 갈라진 콩고(Q3 (가), F6 1800~1884 비움과 이음)
  V(F7_START, 1561, ...S_LOANGO), // 로앙고 왕국 앞(문헌 없음)
  V(1787, F7_END, ...S_LOANGO), // 왕 부아투 사망 뒤 공위(Q3 (가))
  V(F7_START, 1430, ...S_MASHONA), // 무타파 앞 — 그레이트 짐바브웨 등 범위 흐림(D6)
  V(1629, F7_END, ...S_MASHONA), // 무타파 속국화 뒤 — 쇼나 수장국·로즈위(D7)
  V(F7_START, 1430, ...S_MOZ_ZAMBEZI), // 무타파 앞 잠베지 계곡
  B(1629, F7_END, 'S_MOZ/밖'), // 프라주 띠 밖 — 무타파 끝 뒤 비움(D11)
  V(F7_START, 1582, ...S_AGO_1582), // 마상가노 앞 — 은동고(루안다 거점 1575~1581은 1만 밑)
  V(F7_START, 1617, ...S_AGO_1617), // 벵겔라 건설 앞
  V(F7_START, 1671, ...S_AGO_1671), // 은동고 끝 앞(D6)
  V(F7_START, 1745, ...S_CAPE_WC), // 코이코이·산 땅(1652~1744 VOC 정착지는 1만 밑 — D1)
  V(F7_START, 1780, ...S_CAPE_EC, ...S_CAPE_NC), // 1780 그레이트피시강 경계 앞 — 코이코이·산·코사 땅
  B(1780, F7_END, 'S_EC/밖', 'S_NC/밖'), // 1780 경계 밖 — 코사·코이코이·산·코라 사람들의 땅(F6 1800과 같음)
  V(F7_START, 1780, ...S_SWZ), // 스와지 왕국 앞(D13)
  V(F7_START, F7_END, ...S_REST), // 흐린 나라·사회(D6)와 로지(Q6), 카빈다(1만 밑)
];
// ── F7 S-7 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([F7_START, ...WA_BOUNDS, ...GN_BOUNDS, ...N_BOUNDS, ...HS_BOUNDS, ...S_BOUNDS, F7_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== F7_START || BOUNDS.at(-1) !== F7_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`sub-saharan-africa precolonial: 표 경계 해 ${BOUNDS.join(', ')}는 ${F7_START}~${F7_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`sub-saharan-africa precolonial: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`sub-saharan-africa precolonial: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`sub-saharan-africa precolonial: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`sub-saharan-africa precolonial: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`sub-saharan-africa precolonial: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== F7_END) throw new Error(`sub-saharan-africa precolonial: 마지막 표의 끝이 ${joined.TO} (${F7_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간이 한 버전. 끝은 F7_END(1800) 그대로(끝 없음 null을 쓰지 않음 — 1800~는 prepartition.mjs가 같은 id로 이음). 앞 권역 도형 빼기는 없다(조각이 서아시아 바깥선으로 이미 깎임)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만 걸림): 모든 버전은 F7_START~F7_END 안(1799/1800 이음은 prepartition.mjs가 같은 id로)
for (const [id, list] of Object.entries(versions)) {
  if (list.some(([f, t]) => f < F7_START || t === null || t > F7_END)) throw new Error(`sub-saharan-africa precolonial: ${id}의 버전 기간이 ${F7_START}~${F7_END} 밖(끝 없음 null 금지 — 1800~는 prepartition.mjs 몫)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...WA_voids(), ...GN_voids(), ...N_voids(), ...HS_voids(), ...S_voids()];
if (voids.some(([f, t]) => f < F7_START || t === null || t > F7_END)) throw new Error(`sub-saharan-africa precolonial: 비운 땅의 기간은 ${F7_START}~${F7_END} 안이어야 함(끝 없음 null 금지 — 1800~는 prepartition.mjs 몫)`);

// 빈 땅 검사 구역: 두지 않는다(M-F7-5 ㉮ — F6 prepartition.mjs 구역 1800~1884와 F5~F1 구역은 그대로, data/tests/baseline/gaps.txt에 '사하라 이남' 줄도 넣지 않음). 까닭:
// ① gaps 칸은 '모든 권역 항목의 바뀌는 해 × 구역'이라 F6 꼴(voids가 바뀌는 해마다 구역)로 두면 −1749~1799의 바뀌는 해 약 1,362개마다 이 권역 칸이 생겨 gaps 계산이 F6(80개)의 약 17배가 됨
// ② 해마다 이 권역 조각 대부분이 voids라 구역 = 칠한 조각의 합뿐이고, 그 안의 빈 땅은 칸 땅 직접 재기(칠한 넓이 = 기대 넓이, 빈 땅 = voids 합)가 같은 것을 잡음 ③ 바탕도 1799 이하에 이 권역 구역이 0이었음.
// voids는 그대로 모두 적는다(생성기 구멍 메우기 막기 — 위 voids).
const gapZones = [];

void D; void DOMAIN; void I; void U; void geomOfUnit; // 다섯 칸이 쓰지 않는 이름 경고 막기(합치기가 칸이 쓰기 시작한 이름을 지움 — D·DOMAIN은 빈 땅 검사 구역이 없어 쓰지 않음)

export const era = {
  name: 'precolonial',
  versions,
  gapZones,
  voids,
  source: SSA_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(F6 prepartition.mjs·F5 partition.mjs·F4 colonial.mjs·F3 postwar.mjs·F2 decolonization.mjs·F1 modern.mjs와 같은 문구 — 같은 나라 id를 이어 붙이려면 같아야 함, joinEras)
};
