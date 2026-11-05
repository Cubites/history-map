// central-asia 시대 파일 early-modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1500~1864: 칸국 시대
// 짝 항목 파일: data/entities/central-asia-early-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 다른 도우미 모듈. areas/central-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/central-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/central-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다). 이 시대가 앞(권역 파일 시대 목록 [earlyModernEra, modernEra])
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source·trims는 두지 않는다: source가 C1 era와 다르면 joinEras가 이어 붙이지 못하고(C1 era에 source 없음), 깎기는 C2에 없다(C2 COMMON 2절 — 0단계 결정 8)
//
// ── 중앙아시아 C2 짜임 안내 (C2 뼈대 2026-11-05 — 근거: docs/central-asia/00-scope.md, C2 창구 ② 운영자 결정 Q1~Q11, 결정 맞춤 M1~M25) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 다섯 구역(taklamakan-desert·karakum-desert·kyzylkum-desert·betpak-dala·ustyurt-plateau) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습(조약 해, 없으면 실효 지배가 굳은 해). 원정·되돌려진 점령은 칠하지 않음. 그 나라 땅이 아니면 비운다(voids에 이유). 새 버전은 1만 km² 넘게 바뀔 때만.
// 운영자 결정 요지(원문 ca2/research/C2-DECISIONS.md): Q1 무굴 카불 1526~1738·칸다하르는 사파비와 번갈이(1558·1595·1622·1638·1649) / Q2 사파비·호타크·아프샤르 헤라트·칸다하르 1510~1749 /
//   Q3 두라니 본토 전부 1747~1823 / Q4 칸다하르 토후국 1818~1855·헤라트 토후국 1818~1863(아브달리 헤라트 1717~1731 비움) / Q5 바부르의 카불 왕국 1504~1525 /
//   Q6 부하라 칸국이 발흐 1506~1737·바다흐샨 1584~1737(호라즘 1505~1510 비움) / Q7 동부 부하라 1505~1746만 부하라, 1747부터 비움 / Q8 카자흐 칸국 지도 1853까지(글 끝 1847) /
//   Q9 야르칸드 칸국 지도 1514~1679, 1680부터 준가르(글 끝 1705, 1500~1513은 C3) / Q10 청 카자흐스탄 동쪽 끝 1759~1863·하미 서쪽 1696~1758 / Q11 코칸트 카자흐스탄 시르다리야 띠 1810~1863.
//   앞 결정: 0단계 결정 8(서카자흐스탄 러시아 색 — russia·russia-tsardom은 바꾸지 않음, 깎기 없음)·결정 2(신장 qing, 동쪽 띠 그대로)·C1 덧붙임(00-scope 10절).
// 결정 맞춤(ca2/c2/COMMON.md 3절): M1~M16 = C2-SEAMS 3절 기본값 / M17 타슈켄트 1505~1598 부하라·1599~1809 비움·1810~1864 코칸트 / M18 코칸트 버전 해 1709·1810·1854(1만 넘을 때)·1864 /
//   M19 티무르 1500~1506 헤라트·발흐·카불과 모굴리스탄 타림 서쪽 1500~1513은 C3 몫(비움, voids 이유 'C3 몫') / M20 카자흐 칸국 항목 to 1853 / M21 코칸트 색 #d07090 / M25 카자흐 동쪽 끝 1864 비움.
// 칸 넷(부딪침 막기, ca2/c2/COMMON.md 4·7절): 칸 경계는 조각 경계라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── C2 A …'·W·EK·EX)와 '끝' 줄 사이에만 쓴다
//   (칼선·상수·import·own 줄·voids 함수 모두). 최상위 이름·import 별칭·ownSplit 묶음 이름은 칸 앞머리:
//   A_(서남: 아프가니스탄 34·TM-A·B·D·M·UZ-XO·UZ-QR) · W_(서: UZ 12·TJ 5·KG 8·TM-L) · EK_(카자흐스탄: KZ 14·KAZ-3207·KAZ-4829·KAB) · EX_(신장: CN-XJ).
//   자기 몫이 아닌 조각은 줄을 적지 않는다(fillTables가 주인 null로 채움, voids도 그 조각 칸 몫). 칸 밖 공통 줄(import·도우미·BOUNDS·표 만들기·버전·맞물림 검사·빈 땅 검사 구역)은 고치지 않는다(결과 노트 6절).
// C1 칼선·도형 상수: 도우미 모듈 ./cuts.mjs(C1 이름 그대로 — A_·W_·E_)를 자기 앞머리로 바꿔 가져온다: import { E_S_NORTH as EX_S_NORTH } from './cuts.mjs'
//   (A·W 칸은 C1과 앞머리가 같아 이름 그대로도 되지만, 이 파일 안에서 같은 이름을 새로 만들지 않는다). 좌표를 베끼지 않는다(check:generator).
//   C1 1865년 첫 버전 모양: 부하라·코칸트는 W_FER_PARTS·W_REST_PARTS_1865(조각 W_FER_IDS·W_REST_IDS)와 W_BUKHARA_1865_PARTS·W_KOKAND_1865_PARTS, 히바는 A_K65,
//   아프가니스탄은 A_NORTH·A_BDS·A_HAZ·A_KAF를 뺀 아프가니스탄 조각 — 같은 상수·같은 빼기로 그리면 1864↔1865가 맞물린다.
// 앞 권역 나라 늘리기: 권역 파일 EXTENDABLE의 나라를 소유표 주인 id로 쓰면 joinEras가 그 나라 버전에 더한다(따로 모음 없음).
//   A 칸: mughal-empire [1526, 1739)·safavid-iran [1510, 1736)·hotak-dynasty [1709, 1738)·afsharid-iran [1736, 1750)·durrani-empire [1747, 1823) / EK·EX 칸: qing [1696, 1912)(C2 몫 1696~1863).
//   늘릴 땅은 그해 원래 도형과 겹치면 안 된다(1 km² 넘으면 생성기가 멈춤) — 단위를 나눌 때 prevMinusOf로 원래 도형을 떼어 주인 null 부분으로 둔다.
//   원래 버전이 없는 해(무굴 1541~1554·호타크 1709~1721·두라니 1747)는 더할 땅만으로 새 버전이 생긴다(engine.mjs '앞 권역 나라 늘리기' 원래 버전 없는 해).
//   깎기는 없다(결정 8 — 러시아·러시아 차르국 모양은 바이트 그대로, 이 파일에 trims를 두지 않음).
// 다른 권역 도형 빼기: ./prev.mjs의 prevMinusOf(from, to, except)가 [from, to) 동안 겹치는 앞 권역 나라(PREV_IDS — C2 측정으로 russia-tsardom·mongols·ming을 더함)의 원래 도형을 돌려준다.
//   prevMinusOf는 권역 전체를 보므로 다른 칸 땅의 버전 해에도 멈춘다 — 칸 땅으로 잘라 해마다 확인하는 A_prevSpan(from, to, 칸 땅)(cuts.mjs, 별칭으로 가져옴)을 쓰면 자기 칸 해에만 멈춘다.
// 1864↔1865 맞물림: 이어 그리는 C1 항목(khiva-khanate·afghanistan·bukhara-emirate·kokand-khanate)의 C2 마지막 버전은 to: 1865(C2_END)여야 한다 — 아래 SEAM_IDS 줄이 확인한다
//   (1864에 칠하지 않으면 1864와 C1 첫 해 사이에 틈이 생김). 대칭차는 ca2/c2/skel/seam.mjs로 잰다(허용: 타슈켄트 15,198 km² 코칸트 1864만·M25 카자흐 동쪽 끝).
// 표 경계 해: 칸마다 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(C2_START·C2_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   처음 값 = 뼈대 측정(ca2/c2/skel/cells.txt·prev-overlap.txt)에서 그 칸 안 앞 권역 도형이 바뀌는 해 + COMMON 6절의 그 칸 경계 해.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 C2_START(1500)부터, 해는 늘어난다. 줄을 적지 않은 단위는 시대 내내 주인 null(앞 권역 도형이 덮거나 voids에 한 줄).
// 확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, CA, CN, DOMAIN, F, XJ, XJ_ID, idsOf, minus, tableKit } from './table.mjs';
import { PREV_IDS, deg2, prevListOf, prevMinusOf } from './prev.mjs';
import { RU_CA_ZONES, versions as EUROPE_VERSIONS } from '../europe.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('early-modern');

const C2_START = 1500; // 이 시대 파일의 첫 해(1500년 말 모습). 그 앞은 C3 몫
const C2_END = 1865; // 마지막 표의 끝(미포함) = C1 시대 파일의 첫 해. 이 시대의 버전은 끝이 모두 정수(끝 없음 없음)

// ── 조각 소유표 도우미 (남아시아 S4 ancient.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 A_BOUNDS·W_BOUNDS·EK_BOUNDS·EX_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < C2_START || e[0] >= C2_END)) {
    throw new Error(`central-asia early-modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${C2_START} 이상 ${C2_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`central-asia early-modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = C2_START, to = C2_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`central-asia early-modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`central-asia early-modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`central-asia early-modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`central-asia early-modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`central-asia early-modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── C2 A 서남 (아프가니스탄·히바·투르크멘 — 최상위 이름 A_) ──
// 조각: 아프가니스탄 34(AFG-1752·1753·1769·1772 포함)·TM-A·TM-B·TM-D·TM-M·UZ-XO·UZ-QR. 정의 항목 babur-kabul-kingdom·kandahar-principality·herat-principality, 이어 그림 khiva-khanate·afghanistan
// 늘리는 나라(소유표 주인 id로): mughal-empire·safavid-iran·hotak-dynasty·afsharid-iran·durrani-empire(권역 파일 EXTENDABLE). 남의 항목 칠함: bukhara-khanate 발흐 1506~1737·바다흐샨 1584~1737·헤라트 1589~1597(C2 창구 ③ 질문 5, 정의는 W)
// 표 경계 해: 1506·1584·1737(부하라 칸국 발흐·바다흐샨 — COMMON 6절), 1854(칸 땅 안 러시아 도형이 생김 8,965 km² — 1864 버전은 이 칸 안 모양 같음),
//   1863(아프가니스탄이 헤라트를 더해 C1 1865년 첫 버전 모양이 되는 해 — 이 해부터 C1과 같은 나눔 묶음을 씀)
// 짜임(C2-A 2026-11-05): 소유표 단위는 세 무리다(새 칼선 없음 — 조각 경계와 C1 상수만).
//   ① 아프가니스탄 34조각: 1500~1862는 땅 묶음(A_GROUPS — 카불·동부·칸다하르·헤라트·발흐·쿤두즈·북부칸국·바다흐샨)마다 주인 줄 하나. 하자라자트(A_HAZ)·카피리스탄(A_KAF) 칼선이 지나는 조각 아홉만
//      나눈 묶음(A_아프간산지)으로 떼고 나머지는 조각 통째.
//      1863~1864 묶음(A_아프간1863)은 C1 A_아프간1865와 같은 부분·같은 차례(넘침·북부칸국·바다흐샨·하자라자트·카피리스탄·본토)라 1864↔1865 모양이 같다.
//      하자라자트 밖 고르(AF-GHO)는 헤라트 쪽, 우루즈간(AFG-1752)의 하자라자트 밖 몫은 칸다하르 쪽에 둔다. 다이쿤디(AFG-1753)의 하자라자트 밖 몫(약 675 km², 칼선 변의 부스러기 셋)은
//      하자라자트와 같이 비운다(칸다하르 쪽에 붙이면 넓이 0 조각이 남음 — zero 검사). 1863부터는 C1과 같이 본토(결과 노트 2절).
//   ② 히바 쪽(UZ-XO·UZ-QR·TM-D): 1500~1853은 왼쪽 기슭(A_K73, 1511~)·오른쪽 기슭(A_K65 − A_K73, 1811~), 1854~1864는 C1 1865 묶음과 같이 A_K65에서 그해 러시아 도형을 뺀 땅.
//   ③ 투르크멘 땅(TM-A·TM-B·TM-M)은 시대 내내 조각 통째, 주인 없음(유목·사막 — M5).
// 앞 권역 도형: 이 칸 땅 안 앞 권역 도형은 러시아 1854·1864 구역 링의 넘침뿐(뼈대 측정 cells.txt — 1500~1853년은 0, 아프가니스탄 쪽은 1864년까지 0)이라 1854~1864 히바·투르크멘 쪽에만 A_prevSpan으로 뗀다.
import { A_AF, A_KH, A_TM, A_DOM_AF, A_DOM_KH, A_prevSpan, A_minus, A_K73, A_K65, A_NORTH, A_BDS, A_HAZ, A_KAF } from './cuts.mjs';
const A_BOUNDS = [1506, 1584, 1737, 1854, 1863];
// 땅 묶음(조각 경계). 하자라자트·카피리스탄을 먼저 떼므로 아래 묶음은 그 밖의 몫만 남는다
const A_GROUPS = [
  ['카불', ['AF-KAB', 'AF-KAP', 'AF-LOG', 'AF-WAR', 'AF-GHA', 'AF-NAN', 'AF-LAG', 'AF-KNR', 'AF-BAM', 'AFG-1769', 'AFG-1772']], // 카불·가즈니·잘랄라바드·바미안 쪽
  ['동부', ['AF-KHO', 'AF-PIA', 'AF-PKA']], // 호스트·팍티카·팍티아(방가시 쪽 부족 땅)
  ['칸다하르', ['AF-KAN', 'AF-ZAB', 'AF-HEL', 'AFG-1752']], // 칸다하르·자불·헬만드 + 우루즈간의 하자라자트 밖 몫
  ['헤라트', ['AF-HER', 'AF-FRA', 'AF-NIM', 'AF-BDG', 'AF-GHO']], // 헤라트·파라·시스탄(니므로즈)·바드기스 + 고르의 하자라자트 밖 몫
  ['발흐', ['AF-BAL', 'AF-SAM']], // 발흐·훌름(사만간)
  ['쿤두즈', ['AF-KDZ', 'AF-TAK', 'AF-BGL']], // 쿤두즈·탈로칸·바글란
  ['북부칸국', ['AF-FYB', 'AF-JOW', 'AF-SAR']], // 마이마나·시베르간·사르이풀(C1 A_NORTH)
  ['바다흐샨', ['AF-BDS']], // 바다흐샨·와한(C1 A_BDS)
];
{
  const listed = A_GROUPS.flatMap(([, ids]) => ids).concat('AF-NUR', 'AFG-1753');
  const miss = A_AF.filter((id) => !listed.includes(id));
  const extra = listed.filter((id) => !A_AF.includes(id));
  if (miss.length || extra.length || listed.length !== A_AF.length) throw new Error(`central-asia early-modern A: 땅 묶음이 아프가니스탄 조각과 맞지 않음(빠짐 ${miss.join(', ')} · 남는 것 ${extra.join(', ')})`);
}
// 그해 말 주인 줄(시대 전체, 1500~1864). 해 근거는 결과 노트 2절
const A_LINES = {
  // 1500~1503 티무르 가문·아르군 무킴(C3 몫 — M19) · 1504 바부르 카불 점령 · 1526 무굴(1540~1554 수르 왕조 때도 카불은 캄란·후마윤 — M26) · 1738 나디르의 카불 점령은 결정 Q1대로 1739부터 · 1747 두라니 · 1823 바라크자이 카불
  카불: [[1500, null], [1504, 'babur-kabul-kingdom'], [1526, 'mughal-empire'], [1739, 'afsharid-iran'], [1747, 'durrani-empire'], [1823, 'afghanistan']],
  // 방가시(무굴 카불 주의 한 투만)로 카불과 같이. 1500~1525는 부족 땅(비움)
  동부: [[1500, null], [1526, 'mughal-empire'], [1739, 'afsharid-iran'], [1747, 'durrani-empire'], [1823, 'afghanistan']],
  // 1500~1521 아르군 왕조(늘림 승인 나라 없음 — M22, 결과 노트 6절) · 1522 바부르 · 1526 무굴 · 1558 사파비 · 1595 무굴 · 1622 사파비 · 1638 무굴 · 1649 사파비 · 1709 호타키 · 1738 아프샤르 · 1747 두라니 · 1818 칸다하르 토후국 · 1855 아프가니스탄
  칸다하르: [[1500, null], [1522, 'babur-kabul-kingdom'], [1526, 'mughal-empire'], [1558, 'safavid-iran'], [1595, 'mughal-empire'], [1622, 'safavid-iran'], [1638, 'mughal-empire'], [1649, 'safavid-iran'],
    [1709, 'hotak-dynasty'], [1738, 'afsharid-iran'], [1747, 'durrani-empire'], [1818, 'kandahar-principality'], [1855, 'afghanistan']],
  // 1500~1509 티무르(C3 몫)·1507~1509 샤이반 점령(3년, 안 칠함) · 1510 사파비 · 1589~1597 부하라 칸국 압둘라 칸 2세의 점령(C2 창구 ③ 질문 5 — 헤라트 쪽만) · 1598 사파비 · 1717~1731 아브달리(Q4 비움) · 1732 사파비 · 1736 아프샤르 · 1750 두라니 · 1818 헤라트 토후국 · 1863 아프가니스탄
  헤라트: [[1500, null], [1510, 'safavid-iran'], [1589, 'bukhara-khanate'], [1598, 'safavid-iran'], [1717, null], [1732, 'safavid-iran'], [1736, 'afsharid-iran'], [1750, 'durrani-empire'], [1818, 'herat-principality'], [1863, 'afghanistan']],
  // 1500~1505 티무르(C3 몫) · 1506 부하라 칸국(Q6) · 1737~1751 비움(Q6·1747~1751 쿤두즈 카타간) · 1752 두라니(발흐·마이마나 쪽 — 위키백과 Ahmad Shah Durrani: 1752년 여름 발흐를 되찾아 마이마나 칸국에 돌려줌, C2 검토 F1)
  //   · 쿤두즈 쪽은 1757 두라니(사료가 복속 해를 말하지 않음 — 그대로) · 1793 우즈베크 소국(M16 비움) · 1850 아프가니스탄(발흐·훌름)·1859(쿤두즈 쪽)
  발흐: [[1500, null], [1506, 'bukhara-khanate'], [1737, null], [1752, 'durrani-empire'], [1793, null], [1850, 'afghanistan']],
  쿤두즈: [[1500, null], [1506, 'bukhara-khanate'], [1737, null], [1757, 'durrani-empire'], [1793, null], [1859, 'afghanistan']],
  북부칸국: [[1500, null], [1506, 'bukhara-khanate'], [1737, null], [1752, 'durrani-empire'], [1793, null]], // C1 1873부터 아프가니스탄
  // 1500~1583 티무르 가문 미르자들(비움) · 1584 부하라 칸국(Q6) · 1737~1767 비움 · 1768 두라니(위키백과 Durrani Empire: 1768년 안에 바다흐샨 점령) · 1793 비움(C1 1883부터 아프가니스탄)
  바다흐샨: [[1500, null], [1584, 'bukhara-khanate'], [1737, null], [1768, 'durrani-empire'], [1793, null]],
};
// 줄을 묶음 기간 [from, to)로 자름(첫 해는 from)
const A_seg = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];
// 1500~1862: 하자라자트·카피리스탄 칼선이 지나는 조각 아홉만 나누고(A_아프간산지), 나머지 조각은 통째로 묶음 줄을 적는다.
//   이 칸 땅 안 앞 권역 도형은 아프가니스탄 쪽에 없다(1854~1864 넘침도 0 — A_prevSpan으로 확인, 아래 1863 묶음이 다시 확인)
const A_CUT_IDS = ['AF-BAM', 'AF-GHA', 'AF-WAR', 'AF-LAG', 'AF-KNR', 'AF-GHO', 'AFG-1752', 'AFG-1753', 'AF-NUR'];
if (A_prevSpan(1854, 1863, A_DOM_AF).length) throw new Error('central-asia early-modern A: 1854~1862 아프가니스탄 쪽에 앞 권역 도형이 생김 — 넘침 부분을 따로 뗀다');
const A_MTN = ownSplit('A_아프간산지', A_CUT_IDS, [['하자라자트', A_HAZ], ['카피리스탄', A_KAF], ['카불', F('AF-BAM', 'AF-GHA', 'AF-WAR', 'AF-LAG', 'AF-KNR')], ['헤라트', F('AF-GHO')], ['칸다하르', F('AFG-1752')]], '다이쿤디', {
  카불: A_seg(A_LINES.카불, C2_START, 1863), 헤라트: A_seg(A_LINES.헤라트, C2_START, 1863), 칸다하르: A_seg(A_LINES.칸다하르, C2_START, 1863),
}, { from: C2_START, to: 1863 });
const A_WHOLE = Object.fromEntries(A_GROUPS.map(([n, ids]) => [n, ids.filter((id) => !A_CUT_IDS.includes(id))]));
for (const [n, ids] of Object.entries(A_WHOLE)) own(ids, A_seg(A_LINES[n], C2_START, 1863));
// 1863~1864: C1 A_아프간1865와 같은 부분·같은 차례 — 본토가 C1 1865년 첫 버전과 같은 모양
const A_PREV_AF63 = A_prevSpan(1863, C2_END, A_DOM_AF);
const A_AF63 = ownSplit('A_아프간1863', A_AF, [...(A_PREV_AF63.length ? [['넘침', A_PREV_AF63]] : []), ['북부칸국', A_NORTH], ['바다흐샨', A_BDS], ['하자라자트', A_HAZ], ['카피리스탄', A_KAF]], '본토', {
  ...(A_PREV_AF63.length ? { 넘침: [[1863, null]] } : {}),
  본토: [[1863, 'afghanistan']],
}, { from: 1863, to: C2_END });
// 히바 쪽: 1511 일바르스의 칸국(왼쪽 기슭 오아시스·다쇼구즈 = C1 A_K73) · 1811 무함마드 라힘 칸 1세의 카라칼파크 정복(오른쪽 기슭 더함 = C1 A_K65)
//   1535~1538 부하라·1740~1747 나디르 샤 점령은 되돌려진 점령이라 안 칠함. 1500~1510은 비움(Q6)
const A_PREV_KH = A_prevSpan(1854, C2_END, A_DOM_KH); // 1854~1864 히바·투르크멘 쪽 러시아 구역 넘침(1864 버전도 이 칸 안 모양 같음)
const A_KH_UNITS = {
  1500: ownSplit('A_히바1500', A_KH, [['왼쪽', A_K73], ['오른쪽', A_K65]], '밖', { 왼쪽: [[C2_START, null], [1511, 'khiva-khanate']], 오른쪽: [[C2_START, null], [1811, 'khiva-khanate']] }, { from: C2_START, to: 1854 }),
  // 1854~1864: C1 A_히바1865와 같이 A_K65에서 그해 러시아 도형(1854·1864 구역 넘침, 카라칼파크스탄 754 km²)을 뺀 땅
  1854: ownSplit('A_히바1854', A_KH, [['히바', A_minus(A_K65, A_PREV_KH)]], '밖', { 히바: [[1854, 'khiva-khanate']] }, { from: 1854, to: C2_END }),
};
// 비운 땅(fillTables 뒤에 부름): 그해 이 칸의 주인 없는 단위(넘침 부분은 러시아가 덮으므로 빼고)
const A_voids = () => {
  const G = (u) => geomOfUnit(u);
  const out = [];
  // 아프가니스탄 쪽: 주인 없는 묶음이 바뀌는 해마다 한 줄. 이유 — 하자라자트(하자라 부족 땅)·카피리스탄(카피르 부족 땅)은 시대 내내(M6),
  //   카불·헤라트·발흐 1500~1505 티무르 가문(C3 몫 — M19, 카불은 1503까지), 동부 1500~1525 부족 땅, 칸다하르 1500~1521 아르군 왕조(M22),
  //   바다흐샨 1500~1583 티무르 가문 미르자들, 헤라트 1717~1731 아브달리, 발흐·북부·바다흐샨 1737~ 우즈베크 소국·미르(Q6, M16)
  const years = [...new Set([C2_START, ...Object.values(A_LINES).flatMap((l) => l.map(([y]) => y)).filter((y) => y > C2_START && y < 1863), 1863])].sort((a, b) => a - b);
  for (let i = 0; i + 1 < years.length; i++) {
    const y = years[i];
    const nul = Object.keys(A_LINES).filter((n) => A_LINES[n].filter(([yy]) => yy <= y).at(-1)[1] === null);
    const whole = nul.flatMap((n) => A_WHOLE[n]);
    const split = nul.filter((n) => A_MTN[n]).map((n) => G(A_MTN[n]));
    out.push([y, years[i + 1], U(...(whole.length ? [F(...whole)] : []), ...split, G(A_MTN.하자라자트), G(A_MTN.카피리스탄), G(A_MTN.다이쿤디))]);
  }
  out.push([1863, C2_END, U(G(A_AF63.북부칸국), G(A_AF63.바다흐샨), G(A_AF63.하자라자트), G(A_AF63.카피리스탄))]);
  // 히바·투르크멘 쪽: 히바 칸국 밖(우스튜르트 고원·키질쿰·옛 아랄해 기슭 — 카자흐·투르크멘 유목지, 1500~1510은 호라즘 전부 — Q6)과 투르크멘 부족 땅(아할·발칸·마리 — M5), 1854부터 러시아 도형을 뺌
  const kh = A_KH_UNITS[1500];
  out.push([C2_START, 1511, U(G(kh.왼쪽), G(kh.오른쪽), G(kh.밖), F(...A_TM))]);
  out.push([1511, 1811, U(G(kh.오른쪽), G(kh.밖), F(...A_TM))]);
  out.push([1811, 1854, U(G(kh.밖), F(...A_TM))]);
  out.push([1854, C2_END, A_minus(U(G(A_KH_UNITS[1854].밖), F(...A_TM)), A_PREV_KH)]);
  return out.filter(([, , g]) => g.length);
};
// ── C2 A 끝 ──

// ── C2 W 서 (부하라·코칸트·우즈베크·타지크·키르기스 — 최상위 이름 W_) ──
// 조각: UZ-AN·BU·FA·JI·NG·NW·QA·SA·SI·SU·TK·TO, TJ-DU·GB·KT·SU·TJK-368, KG-B·C·GB·J·N·O·T·Y, TM-L. 정의 항목 bukhara-khanate, 이어 그림 bukhara-emirate·kokand-khanate
// 늘리는 나라 없음
// 표 경계 해: 1501(샤이바니 칸이 사마르칸트를 되찾아 부하라 칸국이 굳음)·1505(타슈켄트·페르가나·히사르 들어옴)·1599(샤이반 왕조 끝 — 타슈켄트 빠짐)·1709(코칸트 갈라섬)·
//   1747(망기트 실권 — 동부 부하라 빠짐)·1762(차르주이 — 레바프 강가 띠)·1785(에미르 칭호 — 부하라 토후국)·1810(코칸트 타슈켄트)·1864(칸 땅 안 러시아 1864 구역 46,863 km² — 코칸트 카자흐 띠 빠짐도)
const W_BOUNDS = [1501, 1505, 1599, 1709, 1747, 1762, 1785, 1810, 1864];
// C1 칼선·부분 목록을 그대로 가져온다(좌표를 다시 적지 않음). C1 1865 첫 버전과 같은 부분 목록으로 나누고 필요한 곳에만 부분을 끼워 넣는다
//   (나눔은 앞 부분을 차례로 빼므로, 끼운 부분이 C1 1865 부하라·코칸트 부분과 겹치지 않으면 1864 모양 = C1 1865 모양)
import { W_FER_IDS, W_REST_IDS, W_FER_PARTS, W_REST_PARTS_1865, W_BUKHARA_1865_PARTS, W_KOKAND_1865_PARTS, A_prevSpan as W_prevSpan } from './cuts.mjs';
// 'W_서쪽' 묶음(조각 W_REST_IDS): C1 'W_1865' 부분 목록에 둘을 끼움 — 타슈켄트(UZ-TO·UZ-TK 통째, 러시아 구역 다음)·레바프띠(레바프남 다음에 남는 TM-L = 차르주이–케르키 강가 띠)
const W_REST_PARTS = W_REST_PARTS_1865.flatMap(([p, g]) => {
  if (p === '타슈켄트쪽') return [['타슈켄트', F('UZ-TO', 'UZ-TK')], [p, g]];
  if (p === '지작') return [['레바프띠', F('TM-L')], [p, g]];
  // 동부부하라: 고르노바다흐샨 조각 ∩ 러시아 1868 구역의 북쪽 알라이 쪽 따로 떨어진 다각형(약 104 km², 0.011제곱도)은 뺀다 — 코칸트가 갈라선 1709~1746에
  //   부하라 칸국의 떨어진 부스러기가 되므로(C1 1868 보호국도 이 땅을 파미르와 함께 비움). 뺀 땅은 다음 부분 '파미르'가 받아 비움
  if (p === '동부부하라') return [[p, g.filter((poly) => deg2([poly]) > 0.05)]];
  return [[p, g]];
});
const W_BUKHARA_CORE = [[1500, null], [1501, 'bukhara-khanate'], [1785, 'bukhara-emirate']]; // 서트란스옥시아나 핵심(부하라·사마르칸트·카르시·지작·제라프샨 골짜기·후잔드·우라튜베)
const W_FERGANA = [[1500, null], [1505, 'bukhara-khanate'], [1709, 'kokand-khanate']]; // 페르가나 분지와 둘레 산(맞춤 M1 — 1709 코칸트 갈라섬)
const W_R = ownSplit('W_서쪽', W_REST_IDS, W_REST_PARTS, '나머지', {
  러시아: [[1500, null]],
  타슈켄트: [[1500, null], [1505, 'bukhara-khanate'], [1599, null], [1810, 'kokand-khanate']], // 맞춤 M17
  타슈켄트쪽: [[1500, null]],
  톈산: [[1500, null]],
  키질쿰북: [[1500, null]],
  동부부하라: [[1500, null], [1505, 'bukhara-khanate'], [1747, null]], // 결정 Q7
  파미르: [[1500, null]],
  레바프남: [[1500, null]],
  레바프띠: [[1500, null], [1762, 'bukhara-khanate'], [1785, 'bukhara-emirate']],
  지작: W_BUKHARA_CORE,
  부하라: W_BUKHARA_CORE,
  나머지: [[1500, null]],
});
// 'W_페르가나쪽' 묶음(조각 W_FER_IDS): C1 'W_페르가나' 부분 목록 그대로
const W_FP = ownSplit('W_페르가나쪽', W_FER_IDS, W_FER_PARTS, '나머지', {
  러시아: [[1500, null]],
  알라이남: W_FERGANA,
  코칸트: W_FERGANA,
  후잔드: W_BUKHARA_CORE,
  제라프샨: W_BUKHARA_CORE,
  나머지: [[1500, null]],
});
// C1 1865 첫 버전과 같은 부분인지 확인(부분 이름이 바뀌면 맞물림이 깨짐)
for (const p of [...W_BUKHARA_1865_PARTS.fer, ...W_KOKAND_1865_PARTS.fer]) if (!W_FP[p]) throw new Error(`central-asia early-modern W: 페르가나쪽 부분 ${p}가 없음`);
for (const p of W_BUKHARA_1865_PARTS.rest) if (!W_R[p]) throw new Error(`central-asia early-modern W: 서쪽 부분 ${p}가 없음`);
// 비운 땅 g를 1500~1863과 1864(러시아 1864 구역 해 — 그해 앞 권역 도형을 뺌)로 나눈다. 1863년까지 이 칸 땅에 앞 권역 도형이 없음(뼈대 prev-overlap.txt — W는 1864 러시아뿐)
const W_minusPrev = (g) => {
  const p = W_prevSpan(1864, 1865, g);
  return [[C2_START, 1864, g], [1864, 1865, p.length ? D(g, p) : g]].filter(([, , v]) => v.length);
};
const W_voids = () => [
  B(1500, 1501, W_R.지작, W_R.부하라, W_FP.후잔드, W_FP.제라프샨), // 1500년 말 사마르칸트는 티무르 왕조 바부르가 되찾아 쥠(1501 사르이풀 싸움 뒤 샤이바니): C3 몫
  B(1500, 1505, W_FP.알라이남, W_FP.코칸트, W_R.타슈켄트, W_R.동부부하라), // 바부르의 페르가나·모굴 칸의 타슈켄트·쿠스라우 샤의 히사르(1503~1505 샤이바니 정복 전): C3 몫
  B(1599, 1810, W_R.타슈켄트), // 타슈켄트: 샤이반 왕조 뒤 카자흐 칸국·준가르·타슈켄트 도시 정권(1784~1807)이 번갈아 쥐어 한 나라를 고를 수 없음(맞춤 M17, 장부 후보)
  B(1747, 1865, W_R.동부부하라), // 동부 부하라(히사르·쿨롭·카라테긴·다르바즈)·샤흐리삽즈: 망기트 시기 반독립 벡국들(결정 Q7 — C1 1865~1867 비움과 이어짐)
  B(1500, 1762, W_R.레바프띠), // 레바프 강가 띠(차르주이–케르키): 1762년 11월 차르주이 정복 전에는 투르크멘 부족 땅
  B(1500, 1865, W_R.레바프남), // 레바프 남서쪽 카라쿰: 투르크멘 부족 땅(부하라·히바 땅 아님)
  B(1500, 1865, W_R.키질쿰북), // 부하라 북쪽 키질쿰 사막: 유목민 땅(어느 나라 땅도 아님)
  B(1500, 1865, W_R.파미르), // 파미르(슈그난·로샨·무르가브): 산악 소국·유목민 땅
  // 톈산 안쪽·추 골짜기·탈라스·이식쿨·나린(키르기스 부족 땅 — 코칸트 요새 피슈페크·토크마크 둘레도 비움, 알려진 근사)와 페르가나 북쪽 차트칼 비탈. 1864는 러시아 구역을 뺌
  ...W_minusPrev(build([W_R.러시아, W_R.타슈켄트쪽, W_R.톈산, W_R.나머지, W_FP.러시아, W_FP.나머지])),
].filter(([, , g]) => g.length);
// ── C2 W 끝 ──

// ── C2 EK 카자흐스탄 (카자흐 칸국·준가르 꼬리·청 꼬리·코칸트 띠 — 최상위 이름 EK_) ──
// 조각: KZ 14·KAZ-3207·KAZ-4829·KAB. 정의 항목 kazakh-khanate. 남의 항목 칠함: dzungar-khanate 꼬리(정의 EX)·kokand-khanate 시르다리야 띠 1810~1863(정의 W)
// 늘리는 나라(소유표 주인 id로): qing — 카자흐스탄 동쪽 끝(러시아 1854 구역 동쪽: 러시아 1864 구역 링 + cuts.mjs E_KZ_EAST_ZONE) 1759~1863, 1864는 비움(M25)
// 표 경계 해 처음 값: 칸 땅 안 앞 권역 도형이 바뀌는 해 1556(러시아 차르국 처음 겹침)·1720·1743·1752·1756·1822·1824·1854·1864(러시아 구역),
//   1634·1759(준가르 — COMMON 6절), 1759(청 꼬리), 1810·1854·1864(코칸트 띠). 1721은 russia-tsardom → russia로 id만 바뀜(모양 같음 — 넣지 않음)
//   주인만 바뀌는 해(1511 카심 칸·1700 소주즈·1817 악메체트)는 표 안 줄로 적는다(나눈 조각 모양은 앞 권역 도형이 바뀌는 해에만 바뀜)
import { box as EK_box, ring as EK_ring } from '../../lib.mjs';
import { A_prevSpan as EK_prevSpan, E_KZ_EAST_ZONE as EK_EAST_ZONE } from './cuts.mjs';
import { clipToDomain as EK_clip } from './prev.mjs';
const EK_BOUNDS = [1556, 1634, 1720, 1743, 1752, 1756, 1759, 1810, 1822, 1824, 1854, 1864];
const EK_IDS = idsOf('KAZ', 'KAB'); // 카자흐스탄 조각 16 + 바이코누르(KAB — 둘레 KZ-KZY와 같이 칠함)
const EK_ALL = F(...EK_IDS);
// 앞 권역 도형 빼기(C1 E 칸 E_rawMinus와 같은 방법): [from, to) 동안 칸 땅 안 앞 권역 도형이 같은지 EK_prevSpan으로 확인하고,
// 빼기는 앞 권역의 원래 도형(권역 바깥선으로 자르기 전, 작은 구멍 메운 모양)으로 한 번에 한다(자른 도형을 다시 빼면 국경 위에 넓이 0 가시가 남음)
const EK_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]);
const EK_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6);
const EK_hit = new Map(); // 원래 도형 → 칸 땅과 겹치는지
const EK_rawOf = new Map(); // 'from~to' → 그 기간 뺄 원래 도형(구멍 메운 모양) 목록 — 기간마다 한 번만 확인·계산(묶음 여덟이 함께 씀)
const EK_rawMinus = (zone, from, to) => {
  const k = `${from}~${to}`;
  if (!EK_rawOf.has(k)) {
    EK_prevSpan(from, to, EK_ALL);
    EK_rawOf.set(k, PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= from && from < t).map(([, , g]) => g)).filter((g) => {
      if (!EK_hit.has(g)) EK_hit.set(g, I(EK_clip(g), EK_ALL).length > 0);
      return EK_hit.get(g);
    }).map(EK_filled));
  }
  const raw = EK_rawOf.get(k);
  return EK_noDust(raw.length ? D(zone, ...raw) : zone);
};
// 떨어진 작은 조각(0.03제곱도 — 대략 300 km² 미만, 자르기 부스러기)은 칠하지 않고 '앞'(주인 없음)에 둔다(C1 E_KZ_FILL과 같음 — 떨어진 섬이 생기지 않게)
const EK_big = (m) => m.filter((p) => deg2([p]) >= 0.03);

// 칼선 K-W1(소주즈 앞 서쪽 한계, 1511~1699): KZ-AKT 안 무고자르 구릉 서쪽 기슭 → 엠바강 위쪽(엠바 마을 부근) → 남쪽으로 아랄해 북서 사막(동경 약 57~58.5°).
//   기준 도시: 안(동) 이르기즈(61.27,48.62)·샬카르(59.62,47.83)·카라부타크(60.2,49.95), 밖(서) 악퇴베(57.2,50.28)·칸디아가시(57.42,49.47)·우일(54.68,49.07).
//   강 자료가 없어 엠바강 위쪽·무고자르 구릉의 어림 위치로 그은 손그림(estimated). 링 = 선 동쪽(1511 카자흐 땅 쪽)
const EK_CUT_W1 = [EK_ring([[58.2, 51.6], [58.25, 50.9], [58.4, 50.3], [58.55, 49.6], [58.45, 49.1], [58.1, 48.8], [57.75, 48.5], [57.5, 48.15], [57.4, 47.5],
  [57.2, 46.8], [57.0, 45.9], [56.9, 45.0], [65.0, 45.0], [65.0, 51.6]])];
// 칼선 K-KOK(코칸트의 시르다리야 요새 띠, KZ-KZY 안): 남카자흐스탄 경계(자나코르간 동쪽)에서 시르다리야강을 따라 악메체트(지금 크질오르다) 아래 잘라가시 앞까지, 강 양쪽 약 35~40 km.
//   기준 도시: 안 크질오르다(악메체트 65.5,44.85)·자나코르간(67.25,43.9)·시엘리(66.75,44.17), 밖 카잘리(62.1,45.76)·바이코누르(63.32,45.62).
//   러시아 1854 구역(남쪽 변 북위 약 44.2~44.6°)이 악메체트 쪽을 덮으면 그 몫은 앞 권역 도형으로 빠진다. 강 자료가 없어 기슭 도시 사이로 그은 어림(estimated)
const EK_CUT_KOK = [EK_ring([[68.4, 44.1], [67.6, 44.4], [66.9, 44.6], [66.2, 44.9], [65.6, 45.15], [64.9, 45.35], [64.75, 45.05], [65.4, 44.6], [66.1, 44.25],
  [66.7, 43.9], [67.2, 43.55], [67.6, 43.1], [68.4, 43.2]])];
// 칼선 K-KARATAU(KZ-YUZ·KZ-ZHA): 카라타우 산줄기 북동쪽 기슭(북서 끝 자나코르간 북쪽 → 남동 끝 카라타우 읍 남쪽) → 탈라스·추강 골짜기 북쪽 가장자리(키르기스 국경 북쪽 30~40 km) → 코르다이 서쪽(동경 74.2°)에서 남쪽으로 끊음
//   (그 동쪽 추강 골짜기는 국경이 북쪽으로 휘어 띠가 끊기므로 넣지 않음 — 넣으면 683 km² 떨어진 조각이 생김).
//   링 = 선 남서쪽(코칸트 쪽: 투르키스탄·사우란·침켄트·켄타우·키질쿰 남쪽 기슭, 탈라스 골짜기의 아울리에아타 = 타라즈·메르케).
//   기준 도시: 안 투르키스탄(68.25,43.3)·사우란(67.95,43.52)·침켄트(69.6,42.3)·타라즈(71.37,42.9), 밖 카라타우 읍(70.47,43.18)·자나타스(69.75,43.57)·숄라코르간(69.17,43.77)·슈(73.76,43.6).
//   산줄기 능선의 어림 위치로 그은 손그림(estimated)
const EK_CUT_KARATAU = [EK_ring([[67.4, 44.6], [68.0, 44.3], [68.6, 43.95], [69.2, 43.6], [69.9, 43.25], [70.6, 43.03], [71.4, 43.2], [72.4, 43.22], [73.4, 43.12],
  [74.2, 43.05], [74.25, 40.0], [65.5, 40.0], [65.5, 44.6]])];
// 꼬리(Q10): 러시아 1854 구역 동쪽의 카자흐스탄 동쪽 끝 = 러시아 1864 구역 링(자이산·알라콜·타르바가타이, 이식쿨 링의 카자흐스탄 몫 — 케겐·나린콜)
//   + C1이 1865년부터 러시아로 메우는 상자(E_KZ_EAST_ZONE)의 동경 80.6° 동쪽(1854 구역 동쪽 변). 링끼리만 합치고 조각과는 부분을 나눌 때 한 번만 자른다
//   (1854 구역을 빼서 만들면 그 변과 국경의 교점이 두 번 계산되어 polyclip이 고리를 잇지 못함 — 1864 구역 링과 1854 구역 링은 동쪽 변을 함께 씀)
const EK_TAIL = U(...RU_CA_ZONES.Z1864.map((r) => [r]), I(EK_EAST_ZONE, EK_box(80.6, 41.0, 87.0, 49.0)));
// 주인 줄(그해 말 모습, 해는 C2 전체 — 묶음마다 그 기간으로 자름)
const EK_K = 'kazakh-khanate';
const EK_LINES = {
  꼬리알마티: [[C2_START, EK_K], [1634, 'dzungar-khanate'], [1759, 'qing'], [1864, null]], // 세미레치예 동쪽 끝(알라콜·케겐) — 1634 준가르, 1759 청, 1864 추구착 의정서(러시아 1864 구역 몫은 러시아, 동경 80.6° 동쪽은 비움 M25)
  꼬리동카: [[C2_START, null], [1511, EK_K], [1634, 'dzungar-khanate'], [1759, 'qing'], [1864, null]], // 자이산·타르바가타이 — 1511 카심 칸 앞은 카자흐 땅 아님
  악메체트: [[C2_START, null], [1511, EK_K], [1817, 'kokand-khanate'], [1864, null]], // 1817 악메체트 요새(1853 러시아 함락 — 1854 구역이 뗌), 1864 비움(C1 1865와 같음)
  시르다리야: [[C2_START, null], [1511, EK_K], [1810, 'kokand-khanate'], [1864, null]], // 투르키스탄·사우란·침켄트 — 1810 코칸트(타슈켄트와 같은 해, M18), 1864년 6월 투르키스탄·9월 침켄트 러시아 점령(러시아 도형은 1866부터 — 비움)
  타라즈: [[C2_START, EK_K], [1810, 'kokand-khanate'], [1864, null]], // 아울리에아타 요새(18세기 말~19세기 초) — 1810에 합침, 1864년 6월 러시아 점령(비움)
  서: [[C2_START, null], [1700, EK_K], [1854, null]], // 엠바 서쪽·망기스타우 — 1699까지 노가이·칼미크·투르크멘 유목지(M2), 1700 소주즈
  세미레치예: [[C2_START, EK_K], [1854, null]], // 1500 부르운둑 칸 때 세미레치예·탈라스·추강 쪽
  주머니: [[C2_START, null]], // 칸국 본토와 떨어진 작은 조각(러시아 요새선 도형이 둘러싼 땅, 2천 km² 미만) — 비움
  초원: [[C2_START, null], [1511, EK_K], [1854, null]], // 1511 카심 칸(시르다리야 도시·울루타우·발하시호·이심강), 1854부터 남은 땅은 비움(Q8 — 칸국 1853까지)
};
// 조각 묶음과 나눔: [묶음 이름, 조각, [[부분 이름(EK_LINES 열쇠), 칼선 도형 또는 null(남은 땅 전부)], …]]. 묶음마다 따로 나눠(한 번에 17조각을 나누면 polyclip이 고리를 잇지 못함 — 1854 구역 동쪽 변과 국경의 교점)
//   부분은 앞 권역 도형을 뺀 묶음 땅을 차례로 자르고, 나머지 '앞'은 앞 권역 도형(러시아 차르국·러시아)이 덮는 땅(주인 없음)
const EK_GROUPS = [
  ['알마티', ['KAZ-3207', 'KAZ-4829'], [['꼬리알마티', EK_TAIL], ['세미레치예', null]]],
  ['동카', ['KZ-VOS'], [['꼬리동카', EK_TAIL], ['초원', null]]],
  ['크질오르다', ['KZ-KZY', 'KAB'], [['악메체트', EK_CUT_KOK], ['초원', null]]],
  ['남카', ['KZ-YUZ'], [['시르다리야', EK_CUT_KARATAU], ['초원', null]]],
  ['잠빌', ['KZ-ZHA'], [['타라즈', EK_CUT_KARATAU], ['세미레치예', null]]],
  ['악퇴베', ['KZ-AKT'], [['초원', EK_CUT_W1], ['서', null]]],
  ['서', ['KZ-ATY', 'KZ-ZAP', 'KZ-MAN'], [['서', null]]],
  ['북', ['KZ-AKM', 'KZ-AST', 'KZ-KAR', 'KZ-KUS', 'KZ-SEV', 'KZ-PAV'], [['초원', null]]],
];
if (EK_GROUPS.flatMap(([, ids]) => ids).sort().join() !== [...EK_IDS].sort().join()) throw new Error('central-asia early-modern EK: 묶음 조각이 카자흐스탄 조각 17과 다름');
const EK_cutLine = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];
// 앞 권역 도형이 칸 땅 안에서 바뀌는 해마다 묶음 하나(1500·1556·1720·1743·1752·1756·1822·1824·1854·1864)
const EK_LAYOUT_YEARS = [C2_START, 1556, 1720, 1743, 1752, 1756, 1822, 1824, 1854, 1864, C2_END];
const EK_LAYOUTS = EK_LAYOUT_YEARS.slice(0, -1).flatMap((from, i) => {
  const to = EK_LAYOUT_YEARS[i + 1];
  return EK_GROUPS.map(([gname, ids, specs]) => {
    let left = EK_big(EK_rawMinus(F(...ids), from, to)); // 앞 권역 도형을 뺀 묶음 땅
    const parts = [];
    for (const [name, shape] of specs) {
      const g = shape ? EK_big(EK_noDust(I(left, shape))) : left;
      if (!g.length) continue; // 빈 부분은 두지 않음(그 기간 그 땅이 모두 앞 권역 도형 안)
      // 동카자흐스탄 초원에서 가장 큰 덩어리와 떨어진 작은 조각(0.3제곱도 — 대략 2천 km² 미만)은 '주머니'(주인 없음, 비운 땅)로 먼저 뗀다
      // (러시아 요새선 도형이 1720~1755년 알타이 쪽 1,237 km²를 둘러싸 칸국 본토와 떨어진 조각이 생김 — 생성기 부산물). 작은 쪽을 먼저 떼야 나눔이 polyclip에서 멈추지 않음
      if (!shape && gname === '동카' && g.length > 1) {
        const big = Math.max(...g.map((q) => deg2([q])));
        const off = g.filter((q) => deg2([q]) < Math.min(0.3, big));
        if (off.length) {
          parts.push(['주머니', off], [name, g.filter((q) => !off.includes(q))]);
          left = [];
          continue;
        }
      }
      parts.push([name, g]);
      left = shape ? EK_noDust(D(left, g)) : [];
    }
    const units = ownSplit(`EK_${gname}${from}`, ids, parts, '앞', Object.fromEntries(parts.map(([name]) => [name, EK_cutLine(EK_LINES[name], from, to)])), { from, to });
    return { from, to, units, names: parts.map(([name]) => name) };
  });
});
// 비운 땅(fillTables 뒤에 부름): 해마다 주인 없는 부분('앞' = 앞 권역 도형은 뺌)이 같은 기간끼리 한 줄 — 이유는 EK_LINES 줄 주석
//   1500~1510 세미레치예 밖(카심 칸 앞), 1500~1699 엠바 서쪽(M2), 1854~1863 러시아 구역·코칸트 띠 밖 남은 땅(Q8 — 칸국 1853까지), 1864 카자흐스탄 남부·동쪽 끝(C1 1865와 같음, M25)
const EK_voids = () => {
  const out = [];
  for (const { from, to, units, names } of EK_LAYOUTS) {
    let run = null;
    for (let y = from; y <= to; y++) {
      const nulls = y < to ? names.filter((p) => EK_LINES[p].filter(([yy]) => yy <= y).at(-1)[1] === null) : null;
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
// ── C2 EK 끝 ──

// ── C2 EX 신장 (준가르·야르칸드·투루판·청 — 최상위 이름 EX_) ──
// 조각: 신장 'CN-XJ'(table.mjs XJ). 정의 항목 dzungar-khanate·yarkand-khanate·turfan-khanate, qing 블록 글
// 늘리는 나라(소유표 주인 id로): qing — 하미 서쪽 1696~1758·신장 전체 1759~1863, 1864는 늘림을 풀어 동쪽 띠(원래 도형)만(COMMON 6절)
// 표 경계 해 처음 값: 칸 땅 안 앞 권역 도형이 바뀌는 해 1509(mongols)·1691(mongols·qing)·1720·1724(qing — mongols 끝)·1854·1864(러시아 넘침),
//   1634·1680·1696·1759(준가르·청 — COMMON 6절). 1644는 ming → qing으로 id만 바뀜(모양 같음 — 넣지 않음)
const EX_BOUNDS = [1509, 1634, 1680, 1691, 1696, 1720, 1724, 1759, 1854, 1864];
// C1 신장 땅(cuts.mjs — 이름·식 그대로, 좌표를 베끼지 않음). C1 E_XJ_SHAPES와 같은 차례(하미 → 북 → 카슈가르 → 악수 → 호탄)로 앞 도형을 빼서 겹침 0
import { E_S_HAMI as EX_S_HAMI, E_S_NORTH as EX_S_NORTH, E_S_KASH as EX_S_KASH, E_S_AKSU as EX_S_AKSU, E_S_KHOTAN as EX_S_KHOTAN } from './cuts.mjs';
import { box as EX_box, ring as EX_ring } from '../../lib.mjs';
// 앞 권역 도형 다루기(C1 E 칸 modern.mjs의 E_filled·E_noDust·E_prevIn·E_rawMinus·E_cutLine과 같은 식 — 시대 파일끼리는 가져올 수 없어 이 칸에 다시 둠)
// 작은 구멍(약 0.01제곱도 미만)은 쓰기 단계의 틈새 메우기가 그 나라로 메우므로 메운 모양으로 뺀다
const EX_filled = (m) => m.map((p) => [p[0], ...p.slice(1).filter((h) => Math.abs(deg2([[h]])) > 0.01)]);
// 넓이가 거의 0인 조각(0.01 km² 미만 — 자르기에서 생긴 바늘 모양)을 버림
const EX_noDust = (m) => m.filter((p) => deg2([p]) >= 1e-6);
// 앞 권역 원래 도형은 나라 전체(청·러시아 등 큰 도형)라 신장 둘레 상자(신장 바깥 1°)로 먼저 자른다 — 상자 변은 신장 밖이라 빼기 결과는 같고 계산만 줄어듦
const EX_BOX = (() => {
  const xs = XJ.flat(2);
  return EX_box(Math.min(...xs.map((q) => q[0])) - 1, Math.min(...xs.map((q) => q[1])) - 1, Math.max(...xs.map((q) => q[0])) + 1, Math.max(...xs.map((q) => q[1])) + 1);
})();
const EX_boxed = new Map(); // 원래 도형 → 상자로 자르고 작은 구멍을 메운 도형
const EX_inBox = (g) => {
  if (!EX_boxed.has(g)) EX_boxed.set(g, EX_noDust(I(EX_filled(g), EX_BOX)));
  return EX_boxed.get(g);
};
// [from, to) 동안 zone 안 앞 권역 도형이 같은지 확인(앞 권역 버전이 바뀌는 해마다 나라별 원래 도형 ∩ zone 넓이 합을 보고, 1 km² 넘게 바뀌면 멈춤 — EX_BOUNDS를 나눔)
const EX_sizeIn = new Map(); // 원래 도형 → zone(신장) 안 넓이(제곱도)
const EX_prevCheck = (zone, from, to) => {
  const ys = new Set([from]);
  for (const id of PREV_IDS) for (const [f, t] of prevListOf(id)) for (const y of [f, t]) if (y > from && y < to) ys.add(y);
  let size = null;
  for (const y of [...ys].sort((a, b) => a - b)) {
    let s = 0;
    for (const id of PREV_IDS) {
      for (const [f, t, g] of prevListOf(id)) {
        if (!(f <= y && y < t)) continue;
        const b = EX_inBox(g);
        if (!EX_sizeIn.has(b)) EX_sizeIn.set(b, b.length ? deg2(EX_noDust(I(b, zone))) : 0);
        s += EX_sizeIn.get(b);
      }
    }
    if (size === null) size = s;
    else if (Math.abs(s - size) > 1e-4) throw new Error(`central-asia early-modern EX: [${from}, ${to}) 안 ${y}년에 신장 안 앞 권역 도형이 바뀜 — EX_BOUNDS를 나눈다`);
  }
};
// zone에서 [from, to) 동안의 앞 권역 원래 도형을 뺀 땅(빼기는 권역 바깥선으로 자르기 전 도형으로 한 번에 — 국경 위 넓이 0 가시를 막음)
const EX_rawMinus = (zone, from, to) => {
  EX_prevCheck(zone, from, to);
  const raw = PREV_IDS.flatMap((id) => prevListOf(id).filter(([f, t]) => f <= from && from < t).map(([, , g]) => EX_inBox(g))).filter((g) => g.length);
  return EX_noDust(D(zone, ...raw));
};
const EX_cutLine = (line, from, to) => [[from, line.filter(([y]) => y <= from).at(-1)[1]], ...line.filter(([y]) => y > from && y < to)];

// 칼선 T1 투루판 분지(투루판·톡순·피찬과 카라샤르(옌치) 분지 — 투루판 칸국 본거지). 북쪽은 톈산 능선(cuts.mjs E_TS_E — 앞 차례의 '북'이 떼어 감),
// 동쪽은 투루판·하미 가름(E_HAMI_W — 앞 차례의 '하미'가 떼어 감)이라 이 고리는 서쪽·남쪽 선만 그은 것이다(북쪽·동쪽 변은 능선·하미 칼선 너머 상자).
// 서쪽 선(북 → 남): 사완 남쪽 능선 → 허징(하라샤르강 상류) 동쪽 → 카라샤르–코를라 사이 철문관(쿵췌강 협곡) 북쪽.
// 남쪽 선(서 → 동): 보스텅 호 남쪽 기슭 → 쿠루크타그 북쪽 기슭(톡순·투루판 분지 남쪽 테두리) → 산산 남쪽 → 하미 칼선 너머
const EX_T1 = [EX_ring([[86.0, 44.5], [86.0, 43.4], [86.1, 42.8], [86.2, 42.3], [86.25, 41.95]],
  [[86.6, 41.85], [87.4, 41.75], [88.0, 41.9], [88.8, 42.15], [89.6, 42.2], [90.4, 42.25], [91.2, 42.35], [92.3, 42.4]],
  [[92.3, 44.5]])];
// 칼선 T2 코를라·부구르(룬타이)·율두스(바얀불락) — C2 창구 ③ 질문 4 ②(오아시스·목지만 넣고 롭노르·체르첸·차클리크 쪽 사막은 비움).
// 서쪽은 악수 땅 동쪽 변(동경 84° — 앞 차례의 '악수'가 떼어 감), 북쪽은 톈산 능선(앞 차례의 '북'), 동쪽은 투루판 분지 고리(앞 차례의 '투루판')라 이 고리는 남쪽 선만 그은 것이다.
// 남쪽 선(서 → 동): 룬타이 남쪽 타림강 북쪽 기슭 → 오아시스 띠 남쪽 사막 가장자리 → 코를라 남쪽(콘치강 하류 위리(롭 현) 북쪽) → 쿠루크타그 서쪽 끝에서 보스텅 호 남쪽 기슭(T1 남쪽 선)
const EX_T2 = [EX_ring([[83.5, 44.5], [83.5, 41.0]],
  [[84.0, 41.0], [84.6, 41.15], [85.3, 41.3], [86.0, 41.5], [86.45, 41.6], [86.75, 41.8]],
  [[86.75, 44.5]])];
// 주인 줄(그해 말 모습 — 결정 Q9·Q10, 맞춤 M10·M11·M13·M19·M23·M24)
const EX_XJ_LINES = {
  // 하미 서쪽(하미 칼선 동쪽에서 청·몽골·명 원래 도형을 뺀 땅): 1500~1512 카라델(하미 왕국)은 비움(M24 — 명의 하미위, 이 권역 항목 없음), 1513 투루판 칸국 만수르가 빼앗음,
  //   1570 투루판이 야르칸드 지배 아래(M23), 1680 준가르(갈단), 1696 하미 아브둘라 벡이 청에 귀순(Q10 — 1698 청군 주둔), 1864 봉기로 비움(C1 하미 1865~1875 비움과 맞물림)
  하미: [[C2_START, null], [1513, 'turfan-khanate'], [1570, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1696, 'qing'], [1864, null]],
  // 톈산 북쪽(준가르 분지·이리·타르바가타이·알타이): 1500~1633 오이라트·모굴리스탄 유목지는 비움(M24 — 결과 노트 6절 질문 초안), 1634 에르데니 바투르의 준가르 칸국,
  //   1755~1758 청의 정복 뒤 1759 청(M11), 1864 둥간·타란치 봉기로 비움(M13)
  북: [[C2_START, null], [1634, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  // 타림 서쪽(카슈가르·야르칸드·호탄·악수·우치투르판·쿠차): 1500~1513 모굴리스탄 두글라트 아미르(미르자 아부 바크르)는 C3 몫(M19 — 비움),
  //   1514 사이드 칸의 야르칸드 칸국, 1680 준가르(Q9 — 1678~1680 갈단의 정복, 칸은 1705년까지 꼭두각시), 1759 청, 1864 쿠차·카슈가르 봉기로 비움(C1 1865 예티샤르와 맞물림)
  카슈가르: [[C2_START, null], [1514, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  악수: [[C2_START, null], [1514, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  호탄: [[C2_START, null], [1514, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  // 투루판 분지(T1): 1487 아흐마드 알라크의 투루판 칸국, 1570 야르칸드(M23 — 호탄 총독 압두라힘의 침입), 1680 준가르, 1759 청(투루판 에민 호자의 1720 귀순은 장부 후보), 1864 봉기로 비움
  투루판: [[C2_START, 'turfan-khanate'], [1570, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  // 코를라·룬타이·바얀불락(T2 — C2 창구 ③ 질문 4 ②): 1500~1513 비움(타림 서쪽과 같이 C3 몫 앞), 1514 야르칸드(쿠차·카라샤르와 한 오아시스 띠), 1680 준가르(율두스는 준가르의 여름 목지), 1759 청, 1864 봉기로 비움
  코를라: [[C2_START, null], [1514, 'yarkand-khanate'], [1680, 'dzungar-khanate'], [1759, 'qing'], [1864, null]],
  // 나머지 '동'(위리·뤄창·체모·롭노르 쪽 남동부와 쿠루크타그): 1500~1758 사막·유목지라 비움(어느 칸국의 땅으로도 굳지 않음), 1759 청, 1864 봉기로 비움
  동: [[C2_START, null], [1759, 'qing'], [1864, null]],
};
const EX_XJ_SHAPES = [['하미', EX_S_HAMI], ['북', EX_S_NORTH], ['카슈가르', EX_S_KASH], ['악수', EX_S_AKSU], ['호탄', EX_S_KHOTAN], ['투루판', EX_T1], ['코를라', EX_T2]];
// 기간: 신장 안 앞 권역 도형(mongols·ming·qing·russia)이 바뀌는 해마다 나눔(1509·1691·1720·1724·1854·1864)
// 부스러기(0.03제곱도 미만 — 악사이친 서쪽 가장자리의 가는 띠 등)는 칠하지 않고 '앞'(주인 없음)에 둔다(C1과 같은 꼴, 빈 땅 검사 최소 500 km² 아래)
const EX_XJ_LAYOUTS = [[C2_START, 1509], [1509, 1691], [1691, 1720], [1720, 1724], [1724, 1854], [1854, 1864], [1864, C2_END]].map(([from, to]) => {
  const rest = EX_rawMinus(XJ, from, to);
  let left = rest.filter((p) => deg2([p]) >= 0.03);
  const parts = [];
  for (const [name, shape] of EX_XJ_SHAPES) {
    parts.push([name, EX_noDust(I(left, shape))]);
    left = EX_noDust(D(left, shape));
  }
  parts.push(['동', left]);
  const units = ownSplit(`EX_신장${from}`, [XJ_ID], parts, '앞',
    Object.fromEntries(Object.entries(EX_XJ_LINES).map(([p, l]) => [p, EX_cutLine(l, from, to)])), { from, to });
  return { from, to, units };
});
// 비운 땅(fillTables 뒤에 부름): 해마다 주인 없는 부분이 같은 기간끼리 한 줄 — 이유는 EX_XJ_LINES 줄 주석
//   (1500~1513 타림 서쪽은 C3 몫 — 모굴리스탄, 1500~1512 하미는 카라델, 1500~1633 북신장은 오이라트·모굴리스탄 유목지, 1500~1513 코를라 쪽은 야르칸드 앞, 1500~1758 남동부는 사막·유목지, 1864는 둥간·위구르 봉기)
const EX_voids = () => {
  const out = [];
  for (const { from, to, units } of EX_XJ_LAYOUTS) {
    let run = null;
    for (let y = from; y <= to; y++) {
      const nulls = y < to ? Object.keys(EX_XJ_LINES).filter((p) => EX_cutLine(EX_XJ_LINES[p], from, to).filter(([yy]) => yy <= y).at(-1)[1] === null) : null;
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
// ── C2 EX 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([C2_START, ...A_BOUNDS, ...W_BOUNDS, ...EK_BOUNDS, ...EX_BOUNDS, C2_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== C2_START || BOUNDS.at(-1) !== C2_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`central-asia early-modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${C2_START}~${C2_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`central-asia early-modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`central-asia early-modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`central-asia early-modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`central-asia early-modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`central-asia early-modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== C2_END) throw new Error(`central-asia early-modern: 마지막 표의 끝이 ${joined.TO} (${C2_END}이어야 함)`);
// 이 시대의 버전은 끝이 모두 정수(마지막 표의 끝 C2_END = 1865 — C1 첫 해)
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));

// 1864↔1865 맞물림 검사: C1이 1865년부터 이어 그리는 항목은 이 시대에 버전이 있으면 마지막 버전이 1864년까지(to = C2_END) 칠해야 한다
// (1864에 칠하지 않으면 C1 첫 해 앞에 틈이 생김). 버전이 없으면 지나감(뼈대)
const SEAM_IDS = ['khiva-khanate', 'afghanistan', 'bukhara-emirate', 'kokand-khanate'];
for (const id of SEAM_IDS) {
  const last = versions[id]?.at(-1);
  if (last && last[1] !== C2_END) throw new Error(`central-asia early-modern: ${id}의 마지막 버전이 ${last[0]}~${last[1] - 1} — C1이 ${C2_END}년부터 이어 그리므로 ${C2_END - 1}년까지 칠해야 함(맞물림)`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...A_voids(), ...W_voids(), ...EK_voids(), ...EX_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 83개 + 신장)에서 그해 비운 땅(voids)을 뺀 곳 — 앞 권역 도형(러시아·청 등)이 덮는 땅과 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// 비운 땅이 바뀌는 해마다 구역 하나(마지막 구역의 끝은 C2_END — 그 뒤는 C1 구역). 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상 — 그 칸 땅임을 결과 노트에 한 줄)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([C2_START, C2_END, ...voids.flatMap(([f, t]) => [f, t ?? C2_END]).filter((y) => C2_START < y && y < C2_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(C1 합치기에서 더함 — 비운 땅 변이 앞 권역 도형 변과 거의 겹쳐 gaps의 빈 땅 계산이 polyclip 예외로 멈추는 것을 막음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? C2_END)).map(([, , g]) => g);
  return [{ name: `중앙아시아 칸국 시대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void I; void U; void CA; void CN; void XJ; void XJ_ID; void F; void idsOf; void minus; void geomOfUnit; void own; void ownSplit; void V; void B; void PREV_IDS; void deg2; void prevListOf; void prevMinusOf; void RU_CA_ZONES; void EUROPE_VERSIONS; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'early-modern',
  versions,
  gapZones,
  voids,
};
