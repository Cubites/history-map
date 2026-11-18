// oceania 시대 파일 colonial (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 오세아니아 식민 시대(하한~1900, 도형 1788~)
// 짝 항목 파일: data/entities/oceania-colonial.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 땅 없는 항목 17은 항목 파일에만 있음)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas.mjs, areas/oceania/의 다른 도우미 모듈. areas/oceania.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/oceania/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/oceania.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다 — 권역 파일 joinEras 차례는 과거 시대가 앞: colonial·modern).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 오세아니아 M2 짜임 안내 (M2 뼈대 2026-11-18 — 근거: docs/oceania/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 3·5·6·7, 창구 ② 1~7, 기본값 6·9·12~17),
//    M1 Q1~Q4·G1-1~G1-20·M-M1-1·E1, M2 창구 ②(Q1~Q4 권장안 — border-stages/oc-m2/decisions.md), 메인 결정 M-M2-1, 기본값 G2-1~G2-24, 지시문 oc-m2/m2/COMMON.md 2~4절·notes.md C-M2-1~19) ─────────────────
// 등급(00-scope 3절): 일반(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). '주변' 구역은 이 단계 등록 0(C-M2-12). 섬은 1,000 km²(어느 해에 사라질 때만).
// 해 규칙(P1): 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음. 새 버전은 1만 km² 넘게 바뀔 때만. 1788~1900 선언·위임장·병합·조약 문서 경계를 그해 칠하고(창구 ① 7),
//   문서 없는 청구·맞선 분쟁 띠는 비움. 이름만 바뀌는 해(스완강 식민지 → 웨스턴오스트레일리아 1832·반디먼즈랜드 → 태즈메이니아 1856·하와이 임시 정부 → 공화국 1894)는 새 버전이 아니다 — 항목 글로(P7).
// 1788 앞 버전 없음: 첫 해는 M2_START(1788, 1788년 말 모습). 이 권역의 마지막 국경 단계라(0단계 창구 ② 1) 1787 이하에는 도형이 없고 땅 없는 항목 17(level: region — versions 없음,
//   항목 파일 oceania-colonial.yaml에만)만 있다. 빈 땅 검사 구역도 1788부터만(특별 지시 2 — data/tests/baseline/gaps.txt에 오세아니아 줄을 넣지 않음).
// 끝 해(이음): 이 파일 표의 주인은 1900까지(M2_END = 1901 = M1 modern.mjs의 M1_START — 아래 확인 줄). 1900 모양 = M1 1901 모양이 원칙(m2/SKEL-NOTE.md 3절 이음 표 — 칸이 그대로 따라 칠함),
//   결정이 만든 1900→1901 바뀜은 주인만 바뀌는 하나 — 여섯 식민지(new-south-wales·van-diemens-land·western-australia·south-australia·victoria·queensland) → australia(1901-01-01 연방,
//   여섯 조각 합 = M1 australia 9조각, 모양 점프 0). 그 밖에 1만 km² 넘게 주인이 바뀌면 칸 결과 노트 2절에 까닭.
// 앞 잇는 M1 아홉(메인 결정 M-M2-1·C-M2-1 — 아메리카 M2 e47c293·M3 465ba55 선례): colony-of-new-zealand 1840·british-new-guinea 1884·british-solomon-islands 1893·new-caledonia 1853·fiji-colony 1874·
//   kingdom-of-tonga 1845·german-samoa 1900·french-polynesia 1880·german-new-guinea 1884(1884 본섬 앞 버전 + 1885~ M1 모양)은 이 파일이 자기 칸 own 줄로 from 해부터 1900까지 칠하고,
//   M1 modern.mjs는 고치지 않는다(코드 줄 0 — M1_EARLY·extra는 usa만). joinEras가 두 파일 버전을 이어 붙여 1901에 같은 모양 버전 경계가 남는다(data/geo/newfoundland.geojson [1809, 1900]·[1900, 1949] 꼴).
//   1901 줄을 이 파일에 쓰면 '기간이 겹침'으로 멈춘다(아래 확인 줄). M1 허용 사건 줄 '1901 <id> 버전' 6줄은 사건 검사가 낡았다고 낼 때만 그 id 블록 칸이 지움(P6).
// 하와이 맞물림(P3·C-M2-8): HPO-M2 US-HI 줄은 [[M2_START, null], [1795, 'hawaiian-kingdom'], [1893, 'republic-of-hawaii'], [1898, null]]로 끝낸다 — 1898~1900은 M1 modern.mjs
//   extra('usa', 1898, M1_START, { units: ['US-HI'] })가 칠함(아메리카 M2 independence.mjs RU-CHU [1898, null] 꼴). 이 파일은 usa를 내지 않는다(아래 확인 줄 — M1_EARLY usa 1898). voids 줄 없음.
// 칼선(P4): AUS-M2의 경도선 셋(cuts-m2.mjs AUS-M2 머리 — K1 AUS2_CUT_135E 1788~1824·K2 AUS2_CUT_132E 1836~1860·K3 AUS2_CUT_141E 1859~1861)뿐이다. 칸 머리에서 별칭으로 받아
//   ownSplit(…, { from: M2_START, to: 1825 / 1861 / 1862 })로 조각을 가르고, 그 해부터 같은 조각을 통째 own 줄로 잇는다(BOUNDS에 그 해 — 아메리카 M3 손 도형 장치 ② 꼴, C-M2-9).
//   조각 경계로 되는 선(129°·138°·141° 26°S~29°S·26°S·29°S와 국경 강·머리강)은 칼선이 아니다. 노스오스트레일리아 1846~1847은 칠하지 않음(Q4 — 그 땅 계속 new-south-wales).
//   1885 영독 선은 M-M1-1 근사(주 조각 경계), 1899 북솔로몬 선·사모아 171°는 바다 — MEL·SPC·HPO 칼선 0.
// 늘림 나라: 없음(권역 파일 EXTENDABLE 그대로 — usa [1898, null)의 1898~1900은 M1 extra, M2 창구 ② 자동 승인 0건). 본국 uk·france·german-empire는 주인으로 쓰지 않는다 — 관계로만(P2).
// 날짜변경선: 피지 FJ-N·FJ-E와 키리바시 KIR은 한 조각 안에 경도 180° 양쪽 폴리곤을 가진다 — 칼선이 아니라 조각 통째로 칠한다(0단계 기본값 1). 141° 서쪽은 동남아 조각 그대로(동남아 파일 고치지 않음).
// 칸 나눔(부딪침 막기 — 지리 칸 넷, 두 라운드: 1라운드 AUS-M2·MEL-M2, 2라운드 SPC-M2·HPO-M2): 칸 경계는 조각 경계(cuts-m2.mjs M2_*_IDS — 138을 한 번씩)라 칼선은 칸을 넘지 않는다.
//   각 칸은 자기 머리 줄('// ── M2 <칸> …')과 그 칸 '끝' 줄 사이에만 쓴다(칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 AUS2_·MEL2_·SPC2_·HPO2_,
//   import도 별칭(예: AUS2_K1), ownSplit 묶음 이름도 앞머리(예: 'AUS2_NT'). 칸 사이 주인 공유 0(같은 땅·같은 id를 두 칸이 나누지 않음 — new-caledonia·french-polynesia는 SPC-M2,
//   뉴기니·솔로몬 셋은 MEL-M2). 칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·확인 줄·빈 땅 검사 구역·끝 void 줄·era)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
// 칼선 파일: cuts-m2.mjs에 칸 머리 넷(뼈대는 새 칼선 0 — 자리 이름만). 칸이 칼선을 더하면 그 파일 자기 머리 아래 export const <앞머리>_CUT_…으로 쓰고,
//   이 파일 칸 머리에서 import { <앞머리>_CUT_… as <앞머리>_… } from './cuts-m2.mjs'로 가져온다. 좌표를 베끼지 않음(check:generator '파일 사이 좌표 되풀이'). 앞 단계 M1 칼선은 0.
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(M2_START·M2_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 가르면 기간마다 다른 묶음 이름.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M2_START(1788)부터, 해는 늘어나고 1900 이하(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(['AU-VIC'], [[M2_START, 'new-south-wales'], [1851, 'victoria']]) · own(idsOf('NZL'), [[M2_START, null], [1840, 'colony-of-new-zealand']]).
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(칸 voids에 한 줄과 이유 — 문서 앞 섬·135°/129° 서쪽·뉴헤브리디스 1906 앞·미크로네시아·작은 속령)과 하와이 1898~1900(M1 extra 몫 — voids 없음)만.
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 oceania.mjs의 sourceOf가 table.mjs OC_SOURCE_TEXT를 붙인다.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(오세아니아 첫판·M1 공통·M2 공통·칸 머리)과 m2/SKEL-NOTE.md 끝 공용 표기표를 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M2_AUS_IDS, M2_MEL_IDS, M2_SPC_IDS, M2_HPO_IDS } from './cuts-m2.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('colonial');

const M2_START = 1788; // 이 시대 파일의 첫 해(1788년 말 모습). 그 앞(1787 이하)은 도형 없음(땅 없는 항목만)
const M2_END = 1901; // 마지막 표의 끝(미포함) = 뒤 시대 M1의 첫 해
const M1_START = 1901; // M1 시대 파일 modern.mjs의 M1_START(그 파일은 export하지 않아 값을 여기 적음 — 둘이 다르면 멈춤)
if (M2_END !== M1_START) throw new Error(`oceania colonial: 끝 해 ${M2_END}가 M1 첫 해 ${M1_START}와 다름(시대 경계 맞물림)`);
const M1_EARLY = { usa: 1898 }; // M1 modern.mjs가 표 첫 해 앞(1898~1900)을 extra로 칠하는 나라 — 이 파일 버전은 그 해 앞에서 끝나야 함(이 파일은 usa를 내지 않음 — 아래 확인 줄)

// ── 조각 소유표 도우미 (M1 modern.mjs와 같은 꼴 — M2 뼈대가 옮김, 끝 해 M2_END·to: null 없음·표 밖 땅(extra) 없음만 다름) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M2_START || e[0] >= M2_END)) {
    throw new Error(`oceania colonial: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M2_START} 이상 ${M2_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`oceania colonial: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M2_START, to = M2_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`oceania colonial: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`oceania colonial: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`oceania colonial: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`oceania colonial: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`oceania colonial: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형], to는 M2_END 이하(null 없음). 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── M2 AUS-M2 오스트레일리아 식민지 여섯 (최상위 이름 AUS2_) ──
// 조각 M2_AUS_IDS(오스트레일리아 9 = 구면 7,771,757 km² — AU-ACT·저비스베이 AUS-1932는 1788~1900 뉴사우스웨일스, 노던 준주 AU-NT는 1863~ 사우스오스트레일리아 — G2-12), 구현 AUS-M2(1라운드)
// 항목(새 6): new-south-wales 1788~·van-diemens-land 1825~·western-australia 1829~·south-australia 1836~·victoria 1851~·queensland 1859~(모두 to 1901 → 1901 australia, M1 — 주인만 바뀜)
// 칼선(cuts-m2.mjs AUS-M2 머리에 칸이 그음): K1 AUS2_CUT_135E(AU-NT·AU-SA, to 1825)·K2 AUS2_CUT_132E(AU-SA, 1836~ to 1861)·K3 AUS2_CUT_141E(AU-QLD 26°S 북쪽, 1859~ to 1862) — 별칭 import, BOUNDS에 1825·1861·1862(C-M2-9)
// voids: 135° 서쪽 1788~1824·129° 서쪽 1788~1828(창구 ② 3), 그 밖 문서 앞 땅(칸이 정함). 노스오스트레일리아 1846~1847 칠하지 않음(Q4). 교대 끊는 자리(C-M2-5): ① 칼선 셋·AU-NT·AU-SA·AU-QLD 나눔 own 줄·BOUNDS → ② 나머지
// 1900 모양 = M1 australia 1901 모양(9조각 통째 — 모양 점프 0)
import { AUS2_CUT_135E as AUS2_K1, AUS2_CUT_132E as AUS2_K2, AUS2_CUT_141E as AUS2_K3 } from './cuts-m2.mjs';
// 칼선 기간 끝 해(나눈 조각 → 조각 통째): 1825 K1(129°까지 넓힘)·1861 K2(사우스오스트레일리아 서쪽 129°까지)·1862 K3(퀸즐랜드 서쪽 138°까지)
const AUS2_BOUNDS = [1825, 1861, 1862];
const AUS2_IDS = idsOf('AUS'); // 아홉(AU-WA·AU-QLD·AU-NT·AU-SA·AU-NSW·AU-VIC·AU-TAS·AU-ACT·AUS-1932) — 칸 몫 조각과 같은지 확인
if (AUS2_IDS.length !== 9 || AUS2_IDS.some((id) => !M2_AUS_IDS.includes(id)) || M2_AUS_IDS.length !== 9) throw new Error(`oceania colonial: AUS-M2 조각 ${AUS2_IDS.join(', ')} (M2_AUS_IDS 아홉과 같아야 함)`);
// 웨스턴오스트레일리아: 1829-05-02 프리맨틀 함장이 뉴사우스웨일스 밖 서쪽 전부(동경 129° 서쪽)를 영유 선언, 06-17 스완강 정착(G2-9 — 위키 en Swan River Colony). 1829 앞은 비움(창구 ② 3)
own(['AU-WA'], [[M2_START, null], [1829, 'western-australia']]);
// 노던 준주 조각: 1788~1824 동경 135°(K1)로 서(비움)/동(뉴사우스웨일스) → 1825-07-16 서쪽 경계를 129°로 넓혀 통째 뉴사우스웨일스 →
//   1863-07-06 특허장으로 사우스오스트레일리아 땅(지금의 노던 준주 — G2-12). 1846~1847 노스오스트레일리아는 칠하지 않음(Q4 — 행정 없이 철수, 그 땅 계속 뉴사우스웨일스)
ownSplit('AUS2_NT', ['AU-NT'], [['서', AUS2_K1]], '동', { 서: [[M2_START, null]], 동: [[M2_START, 'new-south-wales']] }, { from: M2_START, to: 1825 });
own(['AU-NT'], [[1825, 'new-south-wales'], [1863, 'south-australia']]);
// 사우스오스트레일리아 조각: 132°(K2)·135°(K1)로 셋 — 129°~132°는 1825 뉴사우스웨일스 → 1861 사우스오스트레일리아(Q2 — 법 1861-07-22·특허장 1861-10-10),
//   132°~135°는 1825 뉴사우스웨일스 → 1836 사우스오스트레일리아(1836-02-19 특허장 132°~141°), 135° 동쪽은 1788 뉴사우스웨일스 → 1836 사우스오스트레일리아. 1861부터 통째
ownSplit('AUS2_SA', ['AU-SA'], [['서132', AUS2_K2], ['가운데', AUS2_K1]], '동135', {
  서132: [[M2_START, null], [1825, 'new-south-wales']],
  가운데: [[M2_START, null], [1825, 'new-south-wales'], [1836, 'south-australia']],
  동135: [[M2_START, 'new-south-wales'], [1836, 'south-australia']],
}, { from: M2_START, to: 1861 });
own(['AU-SA'], [[1861, 'south-australia']]);
// 퀸즐랜드 조각: 141°(K3, 남위 26° 북쪽)로 서/동 — 동쪽은 1859-06-06 특허장(12-10 선포)으로 퀸즐랜드, 서쪽(138°~141°)은 1862-03-13 퀸즐랜드로 옮김(위키 en Colony of Queensland). 1862부터 통째
ownSplit('AUS2_QLD', ['AU-QLD'], [['서', AUS2_K3]], '동', { 서: [[M2_START, 'new-south-wales']], 동: [[M2_START, 'new-south-wales'], [1859, 'queensland']] }, { from: M2_START, to: 1862 });
own(['AU-QLD'], [[1862, 'queensland']]);
// 뉴사우스웨일스 조각과 오스트레일리아 수도 준주·저비스베이(1911·1915 이관은 M1 — G2-12): 1788~1900 내내 뉴사우스웨일스
own(['AU-NSW', 'AU-ACT', 'AUS-1932'], [[M2_START, 'new-south-wales']]);
// 빅토리아: 1851-07-01 포트필립 지구가 머리강 남쪽 땅으로 갈라짐(머리강은 조각 경계)
own(['AU-VIC'], [[M2_START, 'new-south-wales'], [1851, 'victoria']]);
// 태즈메이니아섬: 1825-12-03 반디먼즈랜드로 갈라짐(위키 en Van Diemen's Land — 1856-01-01 태즈메이니아 개칭은 글, G2-8)
own(['AU-TAS'], [[M2_START, 'new-south-wales'], [1825, 'van-diemens-land']]);
const AUS2_voids = () => [
  B(M2_START, 1825, 'AUS2_NT/서', 'AUS2_SA/서132', 'AUS2_SA/가운데'), // 필립 위임장 135° 서쪽 — 문서 없는 땅, 창구 ② 3(1825-07-16 129°까지 넓힘)
  V(M2_START, 1829, 'AU-WA'), // 129° 서쪽 — 1829 영유 선언 앞, 창구 ② 3
];
// ── M2 AUS-M2 끝 ──

// ── M2 MEL-M2 뉴기니·솔로몬·바누아투 (최상위 이름 MEL2_) ──
// 조각 M2_MEL_IDS(파푸아뉴기니 20·솔로몬 제도 10·바누아투 6 = 36), 구현 MEL-M2(1라운드). 땅 없는 항목 8(aboriginal-australians·torres-strait-islanders·papuans·lapita-culture·
//   austronesian-culture·melanesian-societies·solomon-islanders·ni-vanuatu)은 항목 파일 블록만(own 줄 없음)
// 앞 잇는 M1 항목(블록 글 — 파일 소유표): british-new-guinea 1884~(Q3 — M1 1901 모양 한 모양, 파푸아 쪽 일곱)·german-new-guinea 1884 본섬 앞 버전(1884~1885) + 1885~ M1 모양(뉴기니 쪽 열셋·PG-NSB — G2-13)·
//   british-solomon-islands 1893~(G2-14 — 한 모양, 1899 이관 효력 1900). 1885 영독 선은 M-M1-1 근사(주 조각 경계)
// voids: 1884 앞 뉴기니·1893 앞 솔로몬(문서 앞 땅)·바누아투 1788~1900 내내(뉴헤브리디스 1906 앞 — 창구 ② 7·G2-20). 칼선 0
// 1900 모양 = M1 1901 모양(british-new-guinea 7조각·german-new-guinea 13조각·british-solomon-islands 10조각 — SKEL-NOTE 3절 이음 표)
const MEL2_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음(141° 서쪽은 동남아 조각 — 이 표에 없음). 조각 통째로 주인만 바뀌어 표 경계 해를 늘리지 않음
// 조각 묶음(M1 modern.mjs PNG_PAPUA·PNG_NEWGUINEA와 같은 나눔 — 그 파일 상수는 export되지 않아 여기 다시 적음, M-M1-1 근사)
const MEL2_PAPUA = ['PG-WPD', 'PG-GPK', 'PG-CPM', 'PG-SHM', 'PG-NPP', 'PG-MBA', 'PG-NCD']; // 파푸아 쪽 7(구면 234,985) — 영국령 뉴기니
const MEL2_ISLANDS = ['PG-WBK', 'PG-EBR', 'PG-NIK', 'PG-MRL', 'PG-NSB']; // 비스마르크 제도 4(58,305) + 북솔로몬 부건빌·부카(11,513) — 1885 독일 보호령 넓힘
const MEL2_MAINLAND = minus(idsOf('PNG'), ...MEL2_PAPUA, ...MEL2_ISLANDS); // 뉴기니 본섬 북동부 8(186,823) — 1884 카이저빌헬름슬란트
const MEL2_SOLOMON = idsOf('SLB'); // 솔로몬 제도 10(34,408)
const MEL2_VANUATU = idsOf('VUT'); // 바누아투 6(14,216) — 1906 앞 비움
{
  // 칸 안 확인: 묶음 합 = M2_MEL_IDS(36), 본섬 8
  const mine = [...MEL2_PAPUA, ...MEL2_MAINLAND, ...MEL2_ISLANDS, ...MEL2_SOLOMON, ...MEL2_VANUATU].sort();
  const want = [...M2_MEL_IDS].sort();
  if (MEL2_MAINLAND.length !== 8 || [...MEL2_PAPUA, ...MEL2_ISLANDS].some((id) => !idsOf('PNG').includes(id)) || mine.length !== want.length || mine.some((id, i) => id !== want[i])) {
    throw new Error(`oceania colonial: MEL-M2 조각 묶음이 M2_MEL_IDS와 다름(본섬 ${MEL2_MAINLAND.length}·합 ${mine.length})`);
  }
}
// 영국령 뉴기니: 1884-11-06 보호령 선포(1888-09-04 병합은 지위만 — 글). Q3 — 1884~1900 M1 1901 모양 한 모양(1884 내륙 앞섬·1885 협정 앞 북쪽 선 미정은 근사)
own(MEL2_PAPUA, [[M2_START, null], [1884, 'british-new-guinea']]);
// 독일령 뉴기니 ① 1884-11-03 본섬 북동부(카이저빌헬름슬란트) → ② 1885 비스마르크 제도·북솔로몬을 더함(G2-13 — ②가 M1 1901 모양)
own(MEL2_MAINLAND, [[M2_START, null], [1884, 'german-new-guinea']]);
own(MEL2_ISLANDS, [[M2_START, null], [1885, 'german-new-guinea']]);
// 영국령 솔로몬 제도: 1893-06 보호령(G2-14 — 1897~1898 산타크루스 등·1900 초이슬·산타이사벨·쇼틀랜드 확장은 1893부터 한 모양으로 앞서 칠함, 근사)
own(MEL2_SOLOMON, [[M2_START, null], [1893, 'british-solomon-islands']]);
// 바누아투: 1788~1900 내내 주인 null(뉴헤브리디스 1906 앞 — 줄을 적지 않아 fillTables가 null로 채움, voids 한 줄)
const MEL2_voids = () => [
  V(M2_START, 1884, ...MEL2_PAPUA, ...MEL2_MAINLAND), // 1884 보호령 선포 앞 — 문서 없는 땅(창구 ① 7)
  V(M2_START, 1885, ...MEL2_ISLANDS), // 1885 독일 보호령 앞 비스마르크 제도·부건빌 — 문서 없는 땅(창구 ① 7)
  V(M2_START, 1893, ...MEL2_SOLOMON), // 1893 영국 보호령 앞 솔로몬 제도 — 문서 없는 땅(창구 ① 7)
  V(M2_START, M2_END, ...MEL2_VANUATU), // 1906 협약 앞 주권 단위 없음(영불 해군 위원회 1887 — 창구 ② 7·G2-20)
];
// ── M2 MEL-M2 끝 ──

// ── M2 SPC-M2 뉴질랜드·피지·통가·사모아·타히티·누벨칼레도니 (최상위 이름 SPC2_) ──
// 조각 M2_SPC_IDS(뉴질랜드 20·피지 5·통가 3·사모아 11·프랑스령 폴리네시아 4·누벨칼레도니 3 + 비우는 작은 속령 M2_SPC_SMALL_IDS 8 = 54), 구현 SPC-M2(2라운드)
// 항목(새 3): kingdom-of-fiji 1871~1873(4조각 — 로투마 FJ-R 뺌, G2-17)·samoa-kingdom 1889~1899(G2-19)·kingdom-of-tahiti 1791~1879(PYF-4963 한 조각 — G2-15)
// 앞 잇는 M1 항목(블록 글 — 파일 소유표): colony-of-new-zealand 1840~(NZL 20 − 토켈라우 NZL-5472, 채텀 앞섬 근사 — G2-22)·fiji-colony 1874~·kingdom-of-tonga 1845~(G2-18)·german-samoa 1900·
//   french-polynesia 1880~(PYF 4 — 마르키즈 앞 땅 비움, G2-3)·new-caledonia 1853~(로열티 1853부터 한 모양 — G2-21)
// voids: 문서 앞 섬들·토켈라우·작은 속령 8 내내(이유 '1만 km² 미만 속령·섬 — 0단계 결정 5·G2-11'). 칼선 0. 날짜변경선 조각 FJ-N·FJ-E는 통째(build:data 경위도 범위 — COMMON 9절 첫 줄)
// 1900 모양 = M1 1901 모양(SKEL-NOTE 3절 이음 표)
import { M2_SPC_SMALL_IDS as SPC2_SMALL_CUTS } from './cuts-m2.mjs';
const SPC2_BOUNDS = []; // 조각 통째로만 칠해 표 경계 해를 늘리지 않음(칼선 0, 앞 권역 도형 겹침 0)
// 조각 묶음(칸 안에서 다시 적음 — M1 modern.mjs AZP_·PNG_ 묶음과 같은 조각이라 1900 모양 = 1901 모양)
const SPC2_TKL = ['NZL-5472']; // 토켈라우(1만 km² 미만 — 비움)
const SPC2_NZL = minus(idsOf('NZL'), ...SPC2_TKL); // 뉴질랜드 19(채텀 NZ-CIT·오클랜드 제도 NZL-5479·캠벨 NZL-5478 포함)
const SPC2_ROTUMA = ['FJ-R']; // 로투마(1881-05-13 편입 — 피지 왕국 땅 아님)
const SPC2_FJI = minus(idsOf('FJI'), ...SPC2_ROTUMA); // 피지 4(FJ-C·FJ-E·FJ-N·FJ-W — FJ-N·FJ-E는 경도 180° 양쪽 폴리곤, 통째)
const SPC2_TON = idsOf('TON');
const SPC2_WSM = idsOf('WSM');
const SPC2_TAHITI = ['PYF-4963']; // 윈드워드 제도(타히티·모오레아)
const SPC2_PYF_REST = minus(idsOf('PYF'), ...SPC2_TAHITI); // 리워드 PYF-4964·투아모투 감비에 PYF-4965·마르키즈 PYF-4967
const SPC2_NCL = idsOf('NCL');
const SPC2_SMALL = idsOf('ASM', 'COK', 'NIU', 'PCN', 'WLF'); // 비우는 작은 속령 8
{
  const used = [...SPC2_NZL, ...SPC2_TKL, ...SPC2_FJI, ...SPC2_ROTUMA, ...SPC2_TON, ...SPC2_WSM, ...SPC2_TAHITI, ...SPC2_PYF_REST, ...SPC2_NCL, ...SPC2_SMALL];
  const want = new Set(M2_SPC_IDS);
  if (used.length !== M2_SPC_IDS.length || new Set(used).size !== used.length || used.some((id) => !want.has(id))) throw new Error(`oceania colonial SPC-M2: 칸 묶음 ${used.length}개가 M2_SPC_IDS ${M2_SPC_IDS.length}개와 다름`);
  if (SPC2_SMALL.length !== SPC2_SMALL_CUTS.length || SPC2_SMALL.some((id) => !SPC2_SMALL_CUTS.includes(id))) throw new Error('oceania colonial SPC-M2: 작은 속령 묶음이 M2_SPC_SMALL_IDS와 다름');
}
// 뉴질랜드: 1840-05-21 영국 주권 선포(1840 말 전체 — 창구 ② 4, 채텀 1842 편입 등 앞섬 약 1,600은 근사 — G2-22)
own(SPC2_NZL, [[M2_START, null], [1840, 'colony-of-new-zealand']]);
// 피지: 1871-06-05 카코바우 정부(로투마 뺀 피지 전체 — G2-17), 1874-10-10 영국에 할양
own(SPC2_FJI, [[M2_START, null], [1871, 'kingdom-of-fiji'], [1874, 'fiji-colony']]);
// 로투마: 1881-05-13 편입이지만 1874부터 식민지 한 모양(앞섬 약 47 — G2-3)
own(SPC2_ROTUMA, [[M2_START, null], [1874, 'fiji-colony']]);
// 통가: 1845-12-04 조지 투포우 1세 즉위(G2-18 — 관계 없음)
own(SPC2_TON, [[M2_START, null], [1845, 'kingdom-of-tonga']]);
// 사모아: 1889-06-14 베를린 조약 중립 왕국(G2-19), 1900-02-16 삼국 조약 효력 → 독일령(서쪽 섬 — 투투일라 ASM은 비움)
own(SPC2_WSM, [[M2_START, null], [1889, 'samoa-kingdom'], [1900, 'german-samoa']]);
// 타히티: 1791 포마레 1세 통일(창구 ② 6·G2-15), 1880-06-29 포마레 5세 양도
own(SPC2_TAHITI, [[M2_START, null], [1791, 'kingdom-of-tahiti'], [1880, 'french-polynesia']]);
// 리워드(1888 병합 — 앞섬 약 210)·투아모투 감비에·마르키즈(1842~1879 프랑스 땅이지만 1만 km² 미만 — 비움): 1880부터 한 모양(G2-3)
own(SPC2_PYF_REST, [[M2_START, null], [1880, 'french-polynesia']]);
// 누벨칼레도니: 1853-09-24 프랑스 병합(로열티 1,981 앞섬 — G2-21)
own(SPC2_NCL, [[M2_START, null], [1853, 'new-caledonia']]);
// 작은 속령·토켈라우: 내내 비움
own([...SPC2_SMALL, ...SPC2_TKL], [[M2_START, null]]);
const SPC2_voids = () => [
  V(M2_START, 1840, ...SPC2_NZL), // 영국 주권 선포 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1871, ...SPC2_FJI), // 피지 왕국 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1874, ...SPC2_ROTUMA), // 피지 식민지 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1845, ...SPC2_TON), // 통가 통일 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1889, ...SPC2_WSM), // 베를린 조약 앞 왕위 다툼 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1791, ...SPC2_TAHITI), // 포마레 1세 통일 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, 1880, ...SPC2_PYF_REST), // 프랑스 병합 앞(마르키즈 1842~1879 프랑스 땅 포함 — 1만 km² 미만, G2-3)
  V(M2_START, 1853, ...SPC2_NCL), // 프랑스 병합 앞 — 문서 없는 땅(창구 ① 7·G2-4)
  V(M2_START, M2_END, ...SPC2_SMALL, ...SPC2_TKL), // 1만 km² 미만 속령 — 0단계 결정 5·기본값 9
];
// ── M2 SPC-M2 끝 ──

// ── M2 HPO-M2 하와이·폴리네시아·미크로네시아 (최상위 이름 HPO2_) ──
// 조각 M2_HPO_IDS(하와이 US-HI 1 + 미크로네시아 38 — 키리바시 1·투발루 1·나우루 14·마셜 2·미크로네시아 연방 4·팔라우 11·괌 1·북마리아나 4 = 39), 구현 HPO-M2(2라운드)
// 항목(새 11): hawaiian-kingdom 1795~1892·republic-of-hawaii 1893~1897(US-HI 조각 통째 — G2-16) + 땅 없는 9(polynesian-culture·micronesian-culture·chamorro·saudeleur·rapa-nui·maori·
//   tui-tonga·hawaiian-chiefdoms·tahitian-chiefdoms — 항목 파일 블록만)
// 하와이 줄 꼴(C-M2-8): own(['US-HI'], [[M2_START, null], [1795, 'hawaiian-kingdom'], [1893, 'republic-of-hawaii'], [1898, null]]) — 1898~1900은 M1 extra가 usa로 칠함(voids 줄 없음, usa 블록·도형 고치지 않음)
// voids: US-HI 1788~1794(왕국 앞), 미크로네시아 38 1788~1900 내내(이유 '1만 km² 미만 속령·섬 — 0단계 결정 5·G2-13'). 칼선 0
const HPO2_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음(1788~1900 스페인 계열 마리아나·캐롤라인 도형 0 — SKEL-NOTE 3절), 조각 통째로만 칠해 더할 해 없음
// 하와이 US-HI(조각 구면 18,444 km², 땅 16,318 — 카우아이·니하우 같은 조각): 1795-05 카메하메하 1세의 오아후 정복으로 왕국 성립(위키 en Hawaiian Kingdom — 카우아이·니하우 1810 귀속은
//   같은 조각이라 1795부터 함께 칠함, 약 1,610 km² 알려진 근사 — G2-3·H1), 1893-01-17 전복 → 임시 정부(1894-07-04 공화국 이름은 항목 글 — H4), 1898-08-12 미국 이양 → 1898부터 주인 null
//   (1898~1900은 M1 modern.mjs extra('usa', 1898, M1_START, …)가 usa로 칠함 — P3·C-M2-8, voids 줄 없음)
const HPO2_HI = ['US-HI'];
own(HPO2_HI, [[M2_START, null], [1795, 'hawaiian-kingdom'], [1893, 'republic-of-hawaii'], [1898, null]]);
// 미크로네시아 38(키리바시·투발루·나우루·마셜·미크로네시아 연방·팔라우·괌·북마리아나): 1788~1900 내내 비움(G2-13 — 스페인 마리아나·괌·캐롤라인, 독일 마셜 1885·나우루 1888·
//   미크로네시아 1899 모두 1만 km² 미만이고 1,000 km² 넘는 섬 없음 — 0단계 결정 5, M1 G1-9와 같은 잣대). 이 칸은 own 줄을 적지 않는다(나머지 단위는 주인 null)
const HPO2_MIC = idsOf('KIR', 'TUV', 'NRU', 'MHL', 'FSM', 'PLW', 'GUM', 'MNP');
// 칸 안 확인: 하와이 1 + 미크로네시아 38 = cuts-m2.mjs M2_HPO_IDS 39(다르면 멈춤)
{
  const mine = [...HPO2_HI, ...HPO2_MIC];
  const want = new Set(M2_HPO_IDS);
  if (mine.length !== 39 || mine.length !== want.size || mine.some((id) => !want.has(id))) throw new Error(`oceania colonial: HPO-M2 조각 ${mine.length}개가 M2_HPO_IDS ${want.size}개와 다름`);
}
const HPO2_voids = () => [
  V(M2_START, 1795, ...HPO2_HI), // 통일 앞 족장 사회 — 땅 없는 항목 hawaiian-chiefdoms(고대 하와이), 0단계 창구 ① 6
  V(M2_START, M2_END, ...HPO2_MIC), // 1만 km² 미만·1,000 km² 넘는 섬 없는 속령·섬 — 0단계 결정 5·G2-13
];
// ── M2 HPO-M2 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M2_START, ...AUS2_BOUNDS, ...MEL2_BOUNDS, ...SPC2_BOUNDS, ...HPO2_BOUNDS, M2_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M2_START || BOUNDS.at(-1) !== M2_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`oceania colonial: 표 경계 해 ${BOUNDS.join(', ')}는 ${M2_START}~${M2_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`oceania colonial: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`oceania colonial: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`oceania colonial: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`oceania colonial: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`oceania colonial: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== M2_END) throw new Error(`oceania colonial: 마지막 표의 끝이 ${joined.TO} (${M2_END}이어야 함)`);
// 버전: 표 줄의 단위 목록이 같은 기간이 한 버전(같은 모양이 이어지면 합침). 끝은 M2_END(1901 — to: null 없음, M1이 1901부터 이음).
// 앞 권역 도형 빼기는 없다(1788~1900 이 권역 조각과 겹치는 다른 권역 도형 0 — m2/SKEL-NOTE.md 3절, prev.mjs 없음). 표 밖 땅(extra)도 없다(손 도형 0 — 하와이 1898~1900은 M1 extra)
const versionsOf = (segs) => {
  const out = [];
  for (const [f, t, units] of segs) {
    if (!units.length) continue;
    const key = JSON.stringify([...units].sort());
    const last = out.at(-1);
    if (last && last.to === f && last.key === key) last.to = t;
    else out.push({ from: f, to: t, key, units });
  }
  return out.map(({ from, to, units }) => [from, to, build(units)]);
};
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, versionsOf(segs)]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M2_START 이상에서 시작해 M2_END 이하에서 끝남(to: null 없음 — M1 modern.mjs가 1901부터 이음, joinEras '기간이 겹침' 앞에 까닭을 밝힘),
//   M1이 표 첫 해 앞을 칠하는 나라(M1_EARLY — usa 1898)는 그 해 이하에서 끝남. 이 파일은 usa를 내지 않는다(늘림 usa는 권역 파일 EXTENDABLE·M1 extra 몫 — P3·C-M2-8)
if (versions.usa) throw new Error('oceania colonial: usa 버전을 냄 — 하와이 US-HI는 1898부터 주인 null(1898~1900은 M1 modern.mjs extra가 usa로 칠함, P3·C-M2-8)');
for (const [id, list] of Object.entries(versions)) {
  const end = M1_EARLY[id] ?? M2_END;
  if (list.some(([f, t]) => f < M2_START || !Number.isInteger(t) || t > end)) throw new Error(`oceania colonial: ${id} 버전이 ${M2_START}~${end} 밖(끝 ${end} 이하 — ${end < M2_END ? 'M1 modern.mjs M1_EARLY가 그 해부터 칠함' : 'M1이 1901부터 이음'})`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...AUS2_voids(), ...MEL2_voids(), ...SPC2_voids(), ...HPO2_voids()];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M2_START && Number.isInteger(t) && f < t && t <= M2_END)) throw new Error(`oceania colonial: 비운 땅 기간 [${f}, ${t}) (${M2_START} 이상, 끝은 ${M2_END} 이하 — null 없음, 1901~는 M1)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 138개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// M2_START~M2_END(1788~1900)만 만든다(특별 지시 2 — 1787 이하에는 이 권역 구역이 없음, data/tests/baseline/gaps.txt에 오세아니아 줄을 넣지 않음). 비운 땅이 바뀌는 해마다 구역 하나, 모두 끝이 있다(1901~는 M1 구역).
// 이 권역 나라가 소유표에 하나도 없는 기간(빈 틀·뼈대)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다).
// 하와이 US-HI 1898~1900은 이 파일 주인 null이지만 M1 extra가 usa로 덮는다(엔진이 아메리카 usa 버전에 더함 — 구역 안 땅을 덮음, voids에 넣지 않음)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t, units]) => units.length && f < to && from < t));
const gapYears = [...new Set([M2_START, M2_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => M2_START < y && y < M2_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `오세아니아 식민 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

// 쓰이지 않는 이름 경고 막기(네 칸을 합친 뒤 남은 이름만)
void I; void U; void geomOfUnit;

export const era = {
  name: 'colonial',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 oceania.mjs의 sourceOf(table.mjs OC_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
