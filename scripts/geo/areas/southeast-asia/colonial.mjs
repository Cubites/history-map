// southeast-asia 시대 파일 colonial (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1767~1899: 콘바웅·시암과 란나·라오 세 왕국·떠이선과 응우옌·말레이 술탄국·VOC와 네덜란드령 동인도·스페인령 필리핀 (E2, docs/southeast-asia/00-scope.md 2절 시대 단계 표)
// 짝 항목 파일: data/entities/southeast-asia-colonial.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia/의 다른 도우미 모듈. areas/southeast-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/southeast-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/southeast-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다). 이 파일은 modern.mjs보다 앞(과거) 시대라 joinEras 목록에서 앞에 둔다.
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 동남아 E2 짜임 안내 (E2 뼈대 2026-11-08 — 근거: docs/southeast-asia/00-scope.md 2·3·5·10절, 0단계 결정 1~10·기본값 30건, E2 창구 ② 결정 일곱(se2/decisions.md), 지시문 e2/COMMON.md) ─────
// 짜임은 E1 시대 파일 modern.mjs와 같다(도우미·공통 줄을 옮김). 다른 점: 해가 E2_START(1767)~E2_END(1900, 미포함)이고, 마지막 빈 땅 검사 구역도 끝 해(1900)가 있다.
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 두 구역(new-guinea-interior·borneo-interior) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습, 조약이 있으면 그 해, 없으면 실효 지배가 굳은 해. 원정·되돌려진 점령은 칠하지 않음(콘바웅의 아삼·마니푸르 1819~1825, 베트남의 캄보디아 병합 1835~1840,
//   영국의 자와 1811~1816 점령 등 — E2 창구 ② Q1·Q3, 기본값 B2). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름만 바뀌는 해(톤부리→라따나꼬신 1782 등)는 새 버전이 아니다 — 항목 글로.
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-e2.mjs E2_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── E2 BM …'·SC·LO·VT·MI·BP)와 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 BM_·SC_·LO_·VT_·MI_·BP_, import도 별칭(예: LO_X), ownSplit 묶음 이름도 앞머리(예: 'LO_참파삭').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
//   다른 칸 항목을 주인으로 쓰는 것은 된다(예: LO 칸이 이산·라오스 조각에 thailand — 항목 글은 정의 칸 SC, 문안은 결과 노트 9절).
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더함)를 공통 BOUNDS가 합친다(E2_START·E2_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다
//   — 주인만 바뀌는 해는 BOUNDS에 없어도 되고, ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 E2_START(1767)부터, 해는 늘어난다. 단위마다 여러 번 이어 적을 수 있다(뒤 줄 첫 해가 앞 줄의 마지막 해보다 뒤).
//   줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다. 주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄, 이유는 줄 주석)이거나 다른 도형이 덮는 땅.
// 앞 권역 나라 늘리기: 권역 파일 EXTENDABLE의 나라(company-india [1826, 1858]·british-raj [1858, 1937])를 주인 id로 쓰면 joinEras가 그 나라 버전에 더한다.
//   그 밖의 앞 권역 나라(qing·ahom-kingdom·manipur·uk·netherlands·spain·portugal·france 등)를 주인으로 쓰면 생성기가 멈춘다(본국은 관계로만).
// 다른 도형 빼기는 공통 줄이 한다: 버전을 만들 때 prev.mjs의 prevPieces가 해 구간마다 돌려주는 도형(중국 쪽 qing 손 도형 띠 1,414 km² — 1767~1899 모든 해. E2 뼈대 측정
//   e2/skel/prev-overlap.txt: 그 밖의 다른 권역 버전(company-india·ahom-kingdom·manipur·british-raj 원래 모양 등)은 이 권역 조각과 1 km² 안)을 그 나라 땅에서 뺀다. 칸은 빼지 않는다.
// 이어 붙임: E1 항목(thailand·cambodia·laos·shan-states 등)을 같은 id로 1899까지 칠하면 joinEras가 modern.mjs의 1900~ 버전 앞에 붙인다(1900년에 버전이 한 번 나뉨 — 도형이 같으면 넓이 변화 0).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(동남아 첫판·E1·E2 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SE_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';
import { deg2, prevPieces } from './prev.mjs';
import { E2_BM_IDS, E2_SC_IDS, E2_LO_IDS, E2_VT_IDS, E2_MI_IDS, E2_BP_IDS } from './cuts-e2.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('colonial');

const E2_START = 1767; // 이 시대 파일의 첫 해(1767년 말 모습 — 1767-04 아유타야 함락 뒤). 그 앞(1293~1766)은 E3 시대 파일(early-modern) 몫
const E2_END = 1900; // 마지막 표의 끝(미포함) — 1900년부터는 E1 시대 파일 modern.mjs

// ── 조각 소유표 도우미 (modern.mjs와 같은 꼴 — E2 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < E2_START || e[0] >= E2_END)) {
    throw new Error(`southeast-asia colonial: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${E2_START} 이상 ${E2_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`southeast-asia colonial: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = E2_START, to = E2_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`southeast-asia colonial: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`southeast-asia colonial: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`southeast-asia colonial: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`southeast-asia colonial: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`southeast-asia colonial: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── E2 BM 버마 (조각 E2_BM_IDS: 미얀마 14, 구현 E2-BM): 칼선 import·상수·own 줄·voids는 이 아래에, 최상위 이름은 BM_ ──
// 항목: konbaung-dynasty·mrauk-u(새 — 이 칸 글), shan-states·karenni-states(E1 항목을 같은 id로 1767~1899 — 이 칸 글),
//   company-india [1826, 1858]·british-raj [1858, 1937](남아시아 항목 늘림 — 결정 1·자동 승인 A1, 남아시아 항목 블록의 글 줄은 이 칸)
import { BM_CUT_SALWEEN } from './cuts-e2.mjs';
// 표 경계 해: 1826~1851에만 몬·카인을 살윈강으로 나눔(1826 얀다보 조약으로 강 동쪽·남쪽이 테나세림 주, 1852 강 서쪽·북쪽이 페구 주). 그 밖의 해는 주인만 바뀜
const BM_BOUNDS = [1826, 1852];
// 조각 몫(E1 W와 같은 나눔 — 1899년 모양이 E1 1900년 모양과 이어짐: 버마 본토 12조각 british-raj·샨·카레니)
const BM_ARAKAN = ['MM-16']; // 라카인 = 아라칸
const BM_TENASSERIM = ['MM-05']; // 타닌타리 = 테나세림(타보이·머귀). 1791~1793 시암 쪽으로 돌아선 타보이는 되돌려진 일이라 칠하지 않음
const BM_SALWEEN = ['MM-15', 'MM-13']; // 몬·카인: 살윈강 동쪽·남쪽 1826, 서쪽·북쪽 1852
const BM_LOWER = ['MM-02', 'MM-06', 'MM-07']; // 바고·양곤·에야와디 = 하버마 핵심(1852 페구 주)
// 상버마: 사가잉·마궤·만달레이(네피도 포함)와 카친·친 구릉(Q2 — 콘바웅의 이름뿐인 지배를 콘바웅 색으로, 1886~ 영국령과 이어짐).
//   마궤 MM-03의 1852 선(미예데 북쪽 위도선) 남쪽 몫(따예묘 쪽 약 9,300 km²)은 1만 미만이라 나누지 않고 통째 콘바웅(결과 노트 7절 근사)
const BM_UPPER = ['MM-01', 'MM-03', 'MM-04', 'MM-11', 'MM-14'];
const BM_SHAN = ['MM-17']; // 샨 국(D1 — 콘바웅에 조공한 사오파 소국들, 직접 지배가 아니라 따로)
const BM_KARENNI = ['MM-12']; // 카레니 국(D2 — 콘바웅이 다스리지 못한 소국들, 1875 영국·버마가 독립 인정)
{
  const all = [...BM_ARAKAN, ...BM_TENASSERIM, ...BM_SALWEEN, ...BM_LOWER, ...BM_UPPER, ...BM_SHAN, ...BM_KARENNI];
  if (all.length !== E2_BM_IDS.length || new Set(all).size !== all.length || all.some((id) => !E2_BM_IDS.includes(id))) throw new Error('southeast-asia colonial: BM 칸 조각 나눔이 E2_BM_IDS와 다름');
}
// 아라칸: 므라우우 왕국, 1785-01-02 콘바웅 병합(D3 — 마지막 버전 1784), 1826 얀다보 조약으로 회사령(D4), 1858 영국령 인도
own(BM_ARAKAN, [[E2_START, 'mrauk-u'], [1785, 'konbaung-dynasty'], [1826, 'company-india'], [1858, 'british-raj']]);
own(BM_TENASSERIM, [[E2_START, 'konbaung-dynasty'], [1826, 'company-india'], [1858, 'british-raj']]);
// 몬·카인: 통째 줄은 나누지 않는 해(1767~1825·1852~)만 — 1852 강 서쪽도 회사령이 되어 다시 한 주인
own(BM_SALWEEN, [[E2_START, 'konbaung-dynasty'], [1852, 'company-india'], [1858, 'british-raj']]);
ownSplit('BM_살윈', BM_SALWEEN, [['동남', BM_CUT_SALWEEN]], '서북', { 동남: [[1826, 'company-india']], 서북: [[1826, 'konbaung-dynasty']] }, { from: 1826, to: 1852 });
// 하버마: 1852-06 점령(D5·결정 1 — 병합 포고 1853-01-20은 사건 글), 1858 영국령 인도
own(BM_LOWER, [[E2_START, 'konbaung-dynasty'], [1852, 'company-india'], [1858, 'british-raj']]);
// 상버마: 1885-11-29 만달레이 점령·띠버 왕 폐위, 1886-01-01 병합(D13 — 마지막 버전 1885), 자동 승인 A1(영국령 인도의 버마 주)
own(BM_UPPER, [[E2_START, 'konbaung-dynasty'], [1886, 'british-raj']]);
own(BM_SHAN, [[E2_START, 'shan-states']]);
own(BM_KARENNI, [[E2_START, 'karenni-states']]);
// 콘바웅의 아삼·마니푸르 점령(1817~1826)은 남아시아 조각이라 이 칸에 줄이 없음(Q1 — 칠하지 않음, 남아시아 비움 그대로)
const BM_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음(중국 쪽 띠는 공통 줄이 뺌)
// ── E2 BM 끝 ──

// ── E2 SC 시암·캄보디아 (조각 E2_SC_IDS: 타이 57(이산 20 뺌)·캄보디아 22(라타나키리·스퉁트렝 뺌), 구현 E2-SC): 최상위 이름은 SC_ ──
// 항목: lan-na·patani-sultanate(새 — 이 칸 글), thailand·cambodia(E1 항목을 같은 id로 1767~1899 — 이 칸 글, thailand 글은 LO 칸 9절 문안을 합침)
// 땅은 프레아비히어(E1 칼선 별칭) 말고 모두 조각 통째. 새 칼선 없음, 나눈 조각은 시대 내내 한 묶음이라 표 경계 해가 필요 없다(주인만 바뀌는 해)
const SC_BOUNDS = [];
// 조각 몫(타이 57 = 이산 20 뺀 지금 타이, 캄보디아 22 = 라타나키리·스퉁트렝 뺀 지금 캄보디아)
const SC_TH = idsOf('THA').filter((id) => E2_SC_IDS.includes(id));
const SC_KH = idsOf('KHM').filter((id) => E2_SC_IDS.includes(id));
// 톤부리 중심(1767년 말 딱신이 쥔 땅 — E2 결정 Q4, LO 칸이 같은 기준으로 봄): 1767-06 짠타부리를 잡아 방쁘라소이(촌부리)~뜨랏 동부 해안을 쥐고,
//   10~11월 짜오프라야강을 올라 톤부리를 되찾고 포삼똔에서 버마 주둔군을 깨 아유타야 둘레 중부 평야를 다시 세움(12월 톤부리 즉위). 경쟁 정권이 없던 서부
//   (랏차부리·펫차부리·깐짜나부리·쁘라쭈압 — 1768 방꿍에서 톤부리군이 버마군을 막음)는 중심에 넣었다(Q4 대상이 아님)
const SC_THONBURI = ['TH-10', 'TH-11', 'TH-12', 'TH-13', 'TH-14', 'TH-15', 'TH-16', 'TH-17', 'TH-18', 'TH-19', // 방콕·사뭇쁘라깐·논타부리·빠툼타니·아유타야·앙통·롭부리·싱부리·차이낫·사라부리
  'TH-20', 'TH-21', 'TH-22', 'TH-23', 'TH-24', 'TH-25', 'TH-26', 'TH-27', // 촌부리·라용·짠타부리·뜨랏·차청사오·쁘라찐부리·나콘나욕·사깨오
  'TH-70', 'TH-71', 'TH-72', 'TH-73', 'TH-74', 'TH-75', 'TH-76', 'TH-77']; // 랏차부리·깐짜나부리·수판부리·나콘빠톰·사뭇사콘·사뭇송크람·펫차부리·쁘라쭈압키리칸
// 1767~1769 비움(Q4): 아유타야 함락 뒤 갈라선 지방 정권 — 북중부는 피사눌록 정권(1768 팡 정권이 삼킴)·사왕카부리(팡) 정권, 남부는 나콘시탐마랏 정권.
//   1770 톤부리가 다시 묶음(1769-10 나콘시탐마랏, 1770-08 피사눌록·사왕카부리 — 남부의 1769는 1년 어긋남, 5만 km² 넘는 땅 3년 안이라 Q4 결정 해 1770 그대로)
const SC_NORTH_CENTRAL = ['TH-53', 'TH-60', 'TH-61', 'TH-62', 'TH-63', 'TH-64', 'TH-65', 'TH-66', 'TH-67']; // 웃따라딧·나콘사완·우타이타니·깜팽펫·딱·수코타이·피사눌록·피칫·펫차분
const SC_SOUTH = ['TH-80', 'TH-81', 'TH-82', 'TH-83', 'TH-84', 'TH-85', 'TH-86', 'TH-90', 'TH-91', 'TH-92', 'TH-93']; // 나콘시탐마랏·끄라비·팡응아·푸껫·수랏타니·라농·춤폰·송클라·사뚠·뜨랑·팟탈룽
// 란나(북부 8주 — 기본값 D7): 1767~1774 콘바웅 종주(치앙마이에 버마 관리), 1775 카윌라·짜반이 시암 편으로 돌아섬, 1899-12 몬톤 파얍으로 시암 직할(1900 E1 thailand)
const SC_LANNA = ['TH-50', 'TH-51', 'TH-52', 'TH-54', 'TH-55', 'TH-56', 'TH-57', 'TH-58']; // 치앙마이·람푼·람빵·프래·난·파야오·치앙라이·매홍손
// 파타니(뼈대 기본값 K1): 1786 시암 정복 뒤 종속, 1808 일곱 무앙으로 나뉜 뒤도 같은 항목, 1902 시암 직할(1900 E1 thailand — 2년 어긋남, 1만~5만 km² 10년 안)
const SC_PATANI = ['TH-94', 'TH-95', 'TH-96']; // 빠따니·얄라·나라티왓
// 캄보디아 서북(바탐방·파일린·반테아이민체이·오다르민체이·시엠레아프)과 코콩: 1794 앙 엥 즉위 때 시암 직할(코콩은 1795 — 1년 어긋남, 1만~5만 km² 10년 안), 1907·1904 E1과 이음
const SC_KH_NW = ['KH-2', 'KH-24', 'KH-1', 'KH-22', 'KH-17', 'KH-9'];
if (SC_TH.length + SC_KH.length !== E2_SC_IDS.length || [...SC_THONBURI, ...SC_NORTH_CENTRAL, ...SC_SOUTH, ...SC_LANNA, ...SC_PATANI].sort().join() !== [...SC_TH].sort().join()) throw new Error('southeast-asia colonial: SC 칸 타이 조각 나눔이 E2_SC_IDS와 다름');
own(SC_THONBURI, [[E2_START, 'thailand']]);
own([...SC_NORTH_CENTRAL, ...SC_SOUTH], [[E2_START, null], [1770, 'thailand']]);
// 1767~1774 버마 총독이 직접 다스린 북서쪽 다섯 도(치앙마이·람푼·파야오·치앙라이·매홍손)는 콘바웅 색, 토착 군주가 남은 람빵·난·프래는 란나 색 + 종속 관계(창구 ③ Q-E1 — 결정 10)
const SC_LANNA_BURMA = ['TH-50', 'TH-51', 'TH-56', 'TH-57', 'TH-58']; // 치앙마이·람푼·파야오·치앙라이·매홍손
own(SC_LANNA_BURMA, [[E2_START, 'konbaung-dynasty'], [1775, 'lan-na']]);
own(minus(SC_LANNA, ...SC_LANNA_BURMA), [[E2_START, 'lan-na']]);
own(SC_PATANI, [[E2_START, 'patani-sultanate']]);
own(SC_KH_NW, [[E2_START, 'cambodia'], [1794, 'thailand']]);
// 나머지 캄보디아(프놈펜·우동·캄퐁톰·푸르사트·크라티에·몬둘끼리 등): 1835~1840 베트남이 트란떠이 성으로 병합했으나 캄보디아 색(E2 결정 Q3 — 관계 occupied_by), 1863-08-11 프랑스 보호
own(minus(SC_KH, ...SC_KH_NW, 'KH-13'), [[E2_START, 'cambodia']]);
// 프레아비히어: 북쪽 믈루프레이(9,752 km²)는 1814 시암이 톤레레포·스퉁트렝과 함께 가져가 1904 파리 조약까지 시암 땅, 남쪽(로비엥·상콤트마이 — 캄퐁톰)은 내내 캄보디아.
//   경계는 E1 CL이 1904 믈루프레이 할양 땅에 쓴 도쿄 조약선을 별칭으로 다시 씀(좌표를 베끼지 않음) — 1899년 모양이 E1 1900년 모양과 그대로 이어짐
import { CL_CUT_TOKYO as SC_TOKYO } from './cuts-e1.mjs';
ownSplit('SC_프레아비히어', ['KH-13'], [['믈루프레이', SC_TOKYO]], '남', { 믈루프레이: [[E2_START, 'cambodia'], [1814, 'thailand']], 남: [[E2_START, 'cambodia']] });
const SC_voids = () => [V(E2_START, 1770, ...SC_NORTH_CENTRAL, ...SC_SOUTH)]; // 아유타야 함락 뒤 갈라선 지방 정권(피사눌록·팡·나콘시탐마랏) — 1770 톤부리가 다시 묶음(E2 결정 Q4)
// ── E2 SC 끝 ──

// ── E2 LO 라오 (조각 E2_LO_IDS: 라오스 17·이산 20·라타나키리 KH-16·스퉁트렝 KH-19, 구현 E2-LO): 최상위 이름은 LO_ ──
// 항목: luang-prabang-kingdom·vientiane-kingdom·champasak-kingdom(새 — 이 칸 글), laos(E1 항목을 같은 id로 1893~1899 — 이 칸 글). 이 칸 조각에 thailand(SC 정의)도 칠함
// 표 경계 해는 1893 하나(메콩 선으로 참파삭·스퉁트렝을 나누는 기간 1893~1899). 1770·1792·1828은 주인만 바뀌는 해라 경계가 필요 없음
const LO_BOUNDS = [1893]; // 1893-10-03 프랑스–시암 조약(메콩강 왼쪽 기슭이 프랑스 보호령)
import { CL_CUT_MEKONG as LO_MEKONG } from './cuts-e1.mjs';
// 새 칼선 없음: 세 왕국과 시암 직할 땅의 경계는 사료가 지금 주 경계보다 촘촘하지 않아 주 경계로 묶었고(1만 km² 넘게 다르다는 근거 없음 — 알려진 근사),
//   1893년의 메콩 선만 E1 칼선 CL_CUT_MEKONG을 별칭으로 다시 씀(좌표를 베끼지 않음)
// 루앙프라방 왕국: 루앙프라방·우돔사이·퐁살리·루앙남타·보께오와 메콩강 오른쪽 기슭 사야부리(1765~1777 콘바웅, 1778~1892 시암에 조공 — 관계 줄)
const LO_LP_LEFT = ['LA-LP', 'LA-OU', 'LA-PH', 'LA-LM', 'LA-BK'];
// 후아판(LA-HO): 1767~1827 루앙프라방 왕국, 1828 아누웡 반란 뒤 시암 직할(기본값 D11), 1893 라오스
// 시앙쿠앙(LA-XI — 무앙푸안): 1767~1827 비엔티안 왕국에 조공한 공국이라 비엔티안 색(따로 항목이 없어 종주 색 — 2절), 1828 시암(D11, 1832~1834 베트남의 짠닌 편입은 글로), 1893 라오스
// 비엔티안 왕국 왼쪽 기슭: 비엔티안 수도·비엔티안도·볼리캄사이·캄무안
const LO_VT_LEFT = ['LAO-3283', 'LAO-3284', 'LA-BL', 'LA-KH'];
// 비엔티안 왕국 오른쪽 기슭(이산 북부·동북): 러이·농카이·븡깐·우돈타니·농부아람푸·사꼰나콘·나콘파놈 — 1828 시암 합병(D9)
const LO_VT_RIGHT = ['TH-42', 'TH-43', 'TH-38', 'TH-41', 'TH-39', 'TH-47', 'TH-48'];
// 참파삭 왕국 왼쪽 기슭: 사완나켓·살라완·세꽁·아타프(참파삭 LA-CH와 스퉁트렝 KH-19는 1893에 메콩 선으로 나눔), 라타나키리(그때 스퉁트렝 땅의 동쪽)
const LO_CP_LEFT = ['LA-SV', 'LA-SL', 'LA-XE', 'LA-AT', 'KH-16'];
// 참파삭 왕국 오른쪽 기슭(이산 동남·문강 아래쪽과 치강 쪽): 우본·야소톤·암낫짜런·묵다한·로이엣·마하사라캄·깔라신 — 1718 참파삭이 세운 수완나품(로이엣) 이래의 무앙들.
//   1792 우본이 방콕 직속 무앙이 된 해부터 시암(https://en.wikipedia.org/wiki/Ubon_Ratchathani_province — 톤부리 때 비엔티안에서 시암으로 넘어온 무리가 세움, 1792 무앙).
//   몬톤 라오까오(1891, https://en.wikipedia.org/wiki/Monthon)는 이미 시암 직할이던 무앙을 묶은 것이라 경계 해로 쓰지 않음
const LO_CP_RIGHT = ['TH-34', 'TH-35', 'TH-37', 'TH-49', 'TH-45', 'TH-44', 'TH-46'];
// 시암 직할 몫(코랏 고원 서남): 나콘랏차시마(코랏)·부리람·수린·시사껫·차이야품·콘깬. 1767~1769 피마이 정권(코랏)과 그 둘레라 비움(E2 창구 ② Q4 — SC의 톤부리 밖 땅과 같은 기준),
//   1770 thailand. 수린·시사껫·상카의 크메르계 무앙은 1759~1763 아유타야 직속(코랏 아래)이 된 뒤 그대로 시암 직할로 봄
const LO_SIAM = ['TH-30', 'TH-31', 'TH-32', 'TH-33', 'TH-36', 'TH-40'];
{
  const all = [...LO_LP_LEFT, 'LA-XA', 'LA-HO', 'LA-XI', ...LO_VT_LEFT, ...LO_VT_RIGHT, ...LO_CP_LEFT, 'LA-CH', 'KH-19', ...LO_CP_RIGHT, ...LO_SIAM];
  if (all.length !== E2_LO_IDS.length || new Set(all).size !== all.length || all.some((id) => !E2_LO_IDS.includes(id))) throw new Error('southeast-asia colonial: LO 칸 조각 묶음이 E2_LO_IDS와 다름');
}
own(LO_LP_LEFT, [[1767, 'luang-prabang-kingdom'], [1893, 'laos']]);
own(['LA-XA'], [[1767, 'luang-prabang-kingdom'], [1893, 'thailand']]); // 사야부리: 1893 조약 뒤에도 1904 파리 조약까지 시암(E1 1900~1903과 이음)
own(['LA-HO'], [[1767, 'luang-prabang-kingdom'], [1828, 'thailand'], [1893, 'laos']]);
own(['LA-XI'], [[1767, 'vientiane-kingdom'], [1828, 'thailand'], [1893, 'laos']]);
own(LO_VT_LEFT, [[1767, 'vientiane-kingdom'], [1828, 'thailand'], [1893, 'laos']]);
own(LO_VT_RIGHT, [[1767, 'vientiane-kingdom'], [1828, 'thailand']]);
own(LO_CP_LEFT, [[1767, 'champasak-kingdom'], [1893, 'laos']]);
own(['LA-CH', 'KH-19'], [[1767, 'champasak-kingdom']]);
// 1893~1899: 메콩강 오른쪽 기슭(참파삭의 바싹, 스퉁트렝의 톤레레포)은 시암에 남고 왼쪽 기슭은 라오스(E1 'CL_참파삭'·'CL_스퉁트렝' 1900~1903과 같은 모양). 오른쪽 기슭 25 km 비무장 띠는 그리지 않음
ownSplit('LO_메콩1893', ['LA-CH', 'KH-19'], [['오른쪽', LO_MEKONG]], '왼쪽', { 오른쪽: [[1893, 'thailand']], 왼쪽: [[1893, 'laos']] }, { from: 1893, to: E2_END });
own(LO_CP_RIGHT, [[1767, 'champasak-kingdom'], [1792, 'thailand']]);
own(LO_SIAM, [[1767, null], [1770, 'thailand']]);
// 비운 땅: 1767~1769 코랏 고원 서남(피마이 정권 — 1768 톤부리가 정복했으나 E2 창구 ② Q4에 따라 통일 해 1770부터 칠함)
const LO_voids = () => [V(1767, 1770, ...LO_SIAM)];
// ── E2 LO 끝 ──

// ── E2 VT 베트남 (조각 E2_VT_IDS: 베트남 63, 구현 E2-VT): 최상위 이름은 VT_ ──
// 항목: later-le-dynasty·nguyen-lords·tay-son-dynasty·nguyen-dynasty(새 — 이 칸 글), cochinchina·annam-protectorate·tonkin-protectorate(E1 항목을 같은 id로 1862·1883·1884~1899 — 이 칸 글)
// 표 경계 해(나눈 조각 기간만): 1802 잔강 칼선을 쓰는 끝(그 뒤 꽝빈 남북 주인이 같음), 1862·1867 동탑을 띠엔강으로 나누는 기간(제1차 사이공 조약 1862-06-05 — 1867-06 서쪽 세 성 병합)
//   주인만 바뀌는 해(1773·1774·1775·1777·1778·1783·1786·1788·1793·1801·1883·1884·1889·1893)는 표 안에서 바뀐다
const VT_BOUNDS = [1802, 1862, 1867];
import { VT_CUT_GIANH, VT_CUT_1862 } from './cuts-e2.mjs';
// 조각 묶음은 E1 CV 칸(modern.mjs)의 통킹·안남·코친차이나 목록을 그대로 따른다(1899년 모양이 E1 1900년 모양과 이어지게)
//   통킹 25조각(서북 산지 시프송 쭈 타이 = 라이쩌우·디엔비엔·선라 포함 — 기본값 D19: 그 시기 주인 색, 토사 간접 지배)
const VT_TONKIN = ['VN-01', 'VN-02', 'VN-03', 'VN-04', 'VN-05', 'VN-06', 'VN-07', 'VN-09', 'VN-13', 'VN-14', 'VN-18', 'VN-20', 'VN-53', 'VN-54', 'VN-56', 'VN-61', 'VN-63', 'VN-66', 'VN-67', 'VN-68', 'VN-69', 'VN-70', 'VN-71', 'VN-HN', 'VN-HP'];
//   타인호아·응에안·하띤(꽝빈 VN-24는 잔강 칼선으로 따로)
const VT_THANH_NGHE = ['VN-21', 'VN-22', 'VN-23'];
//   투언화(꽝빈 잔강 남쪽은 칼선 부분): 꽝찌·트어티엔후에
const VT_THUAN_HOA = ['VN-25', 'VN-26'];
//   꽝남(다낭 포함)·꽝응아이와 빈딘(꾸이년)·푸옌·카인호아와 닌투언·빈투언
const VT_QUANG_NAM = ['VN-27', 'VN-DN'];
const VT_QUY_NHON = ['VN-29', 'VN-31', 'VN-32'];
const VT_KHANH_THUAN = ['VN-34', 'VN-36', 'VN-40'];
//   중부 고원(꼰뚬·자라이·럼동·닥농, 다를락은 따로)
const VT_HIGHLANDS = ['VN-28', 'VN-30', 'VN-35', 'VN-72'];
const VT_DARLAC = ['VN-33'];
//   코친차이나 동쪽 세 성(비엔호아·자딘·딘뜨엉 + 꼰다오 — 지금 떠이닌·동나이·롱안·바리아붕따우·띠엔장·빈즈엉·빈프억·호찌민, 동탑은 띠엔강 칼선)
const VT_COCHIN_E = ['VN-37', 'VN-39', 'VN-41', 'VN-43', 'VN-46', 'VN-57', 'VN-58', 'VN-SG'];
//   코친차이나 서쪽 세 성(빈롱·안장·하띠엔 — 지금 안장·끼엔장·빈롱·벤째·짜빈·속짱·박리에우·까마우·하우장·껀터)
const VT_COCHIN_W = ['VN-44', 'VN-47', 'VN-49', 'VN-50', 'VN-51', 'VN-52', 'VN-55', 'VN-59', 'VN-73', 'VN-CT'];
const VT_DONG_THAP = ['VN-45'];
{
  const all = [VT_TONKIN, VT_THANH_NGHE, ['VN-24'], VT_THUAN_HOA, VT_QUANG_NAM, VT_QUY_NHON, VT_KHANH_THUAN, VT_HIGHLANDS, VT_DARLAC, VT_COCHIN_E, VT_COCHIN_W, VT_DONG_THAP].flat();
  if (all.length !== E2_VT_IDS.length || new Set(all).size !== all.length || all.some((id) => !E2_VT_IDS.includes(id))) throw new Error('southeast-asia colonial VT: 조각 목록이 E2_VT_IDS와 다름');
}
// 북부(통킹): 1767 후 레 왕조(찐 씨 실권 — 기본값 D16), 1788 떠이선(1788-12 꽝쭝 즉위, 1789-01 동다에서 청군 격퇴 — 1788-12 청군의 탕롱 점령은 되돌려진 점령이라 칠하지 않음),
//   1802 응우옌 왕조(1802-07 탕롱), 1884 통킹 보호령(1884-06 파트노트르 조약 — 기본값 D17)
own(VT_TONKIN, [[1767, 'later-le-dynasty'], [1788, 'tay-son-dynasty'], [1802, 'nguyen-dynasty'], [1884, 'tonkin-protectorate']]);
// 타인호아·응에안·하띤: 통킹과 같되 1883 안남 보호령(1883-08 아르망 조약 — E1 CV_ANNAM_N과 같음)
own(VT_THANH_NGHE, [[1767, 'later-le-dynasty'], [1788, 'tay-son-dynasty'], [1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 꽝빈: 잔강 북쪽은 타인호아와 같은 줄, 남쪽은 투언화와 같은 줄(1802부터 통째 — 응우옌 왕조, 1883 안남)
ownSplit('VT_잔강', ['VN-24'], [['북', VT_CUT_GIANH]], '남', {
  북: [[1767, 'later-le-dynasty'], [1788, 'tay-son-dynasty']],
  남: [[1767, 'nguyen-lords'], [1775, 'later-le-dynasty'], [1786, 'tay-son-dynasty'], [1801, 'nguyen-lords']],
}, { from: 1767, to: 1802 });
own(['VN-24'], [[1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 투언화: 1767 응우옌 주(푸쑤언), 1775 찐 씨 점령(1774 말 잔강을 건너 1775 초 푸쑤언 — 1786까지 찐 씨가 다스림), 1786 떠이선(1786-06 응우옌 후에가 푸쑤언을 빼앗음),
//   1801 응우옌 주(1801-06 응우옌 아인이 푸쑤언을 되찾음), 1802 응우옌 왕조, 1883 안남 보호령
own(VT_THUAN_HOA, [[1767, 'nguyen-lords'], [1775, 'later-le-dynasty'], [1786, 'tay-son-dynasty'], [1801, 'nguyen-lords'], [1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 꽝남: 1775 떠이선(찐 군이 꼼사에서 떠이선을 친 뒤 응우옌 냑을 꽝남 장수로 삼고 물러남), 1801 응우옌 주(후에와 함께 되찾음)
own(VT_QUANG_NAM, [[1767, 'nguyen-lords'], [1775, 'tay-son-dynasty'], [1801, 'nguyen-lords'], [1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 꽝응아이·빈딘·푸옌: 1773 떠이선(1771 봉기, 1773 꾸이년), 1802 응우옌 왕조(1799~1801 꾸이년 공방은 1만 km² 미만 어림)
own(VT_QUY_NHON, [[1767, 'nguyen-lords'], [1773, 'tay-son-dynasty'], [1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 카인호아·닌투언·빈투언: 1774 떠이선(꾸이년에서 남으로 빈투언까지), 1793 응우옌 주(1793 냐짱 원정 — 1794 지엔카인 성 지킴), 1802 응우옌 왕조
own(VT_KHANH_THUAN, [[1767, 'nguyen-lords'], [1774, 'tay-son-dynasty'], [1793, 'nguyen-lords'], [1802, 'nguyen-dynasty'], [1883, 'annam-protectorate']]);
// 중부 고원: 정할 점 M-E3 기본값 = 비움(응우옌 주·왕조는 자라이 왕 등에게서 조공만 받고 직접 다스리지 않음 — 결정 10), 1889 프랑스가 안남에 넣음(위키백과 Central Highlands (Vietnam))
own(VT_HIGHLANDS, [[1767, null], [1889, 'annam-protectorate']]);
// 다를락: 비움, 1893 프랑스-시암 조약으로 메콩 왼쪽 기슭과 함께 라오스(반돈 — 1899-11 라오스 소속 다를락 대리청, 1904 안남 다를락 성은 E1)
own(VT_DARLAC, [[1767, null], [1893, 'laos']]);
// 코친차이나: 1767 응우옌 주(자딘 — 하띠엔 막 씨 땅 포함), 떠이선과 뒤바뀜(기본값 D14·D15: 1777 떠이선·1778 응우옌·1783 떠이선·1788 응우옌 아인), 1802 응우옌 왕조,
//   동쪽 세 성 1862 프랑스령 코친차이나(제1차 사이공 조약), 서쪽 세 성 1867(기본값 D18)
const VT_GIA_DINH = [[1767, 'nguyen-lords'], [1777, 'tay-son-dynasty'], [1778, 'nguyen-lords'], [1783, 'tay-son-dynasty'], [1788, 'nguyen-lords'], [1802, 'nguyen-dynasty']];
own(VT_COCHIN_E, [...VT_GIA_DINH, [1862, 'cochinchina']]);
own(VT_COCHIN_W, [...VT_GIA_DINH, [1867, 'cochinchina']]);
own(VT_DONG_THAP, VT_GIA_DINH);
ownSplit('VT_동탑1862', VT_DONG_THAP, [['동북', VT_CUT_1862]], '서남', { 동북: [[1862, 'cochinchina']], 서남: [[1862, 'nguyen-dynasty']] }, { from: 1862, to: 1867 });
own(VT_DONG_THAP, [[1867, 'cochinchina']]);
// 비운 땅: 중부 고원 — 베트남 왕조의 직접 지배 밖(자라이·에데 등 고원 사람들, 조공만), 1889년부터 프랑스가 안남에 넣음. 다를락은 1893년부터 라오스
const VT_voids = () => [V(1767, 1889, ...VT_HIGHLANDS), V(1767, 1893, ...VT_DARLAC)];
// ── E2 VT 끝 ──

// ── E2 MI 말레이 반도·인도네시아·티모르 (조각 E2_MI_IDS: 말레이반도 13·싱가포르 5·인도네시아 33·동티모르 13, 구현 E2-MI): 최상위 이름은 MI_ ──
// 항목: voc(새 — 이 칸 글), straits-settlements·perak-sultanate·pahang-sultanate·selangor-negeri-sembilan·johor-sultanate·kedah-perlis·kelantan-sultanate·terengganu-sultanate·
//   dutch-east-indies·aceh-sultanate·portuguese-timor(E1 항목을 같은 id로 1767~1899 — 이 칸 글)
const MI_BOUNDS = []; // 모든 땅이 조각 통째(칼선 0)라 주인만 바뀌는 해 — 표 경계 해가 필요 없음
const MI_IDS = new Set(E2_MI_IDS);
const MI_own = (ids, line) => {
  for (const id of ids) if (!MI_IDS.has(id)) throw new Error(`southeast-asia colonial: MI 칸 조각이 아님 ${id}`);
  own(ids, line);
};
// ── 말레이 반도·싱가포르 (E1 SM 1900 모양과 같은 조각 묶음) ──
const MI_SG = idsOf('SGP'); // 싱가포르 다섯 조각
// 크다·프를리스: 1821~1842 시암 점령은 되돌려져 칠하지 않음(기본값 B2와 같은 규칙 — 글), 1843 프를리스 분리는 묶음 그대로(기본값 3)
MI_own(['MY-02', 'MY-09'], [[E2_START, 'kedah-perlis']]);
// 페낭(웰즐리 주 포함): 1786-08 영국 동인도 회사가 크다 술탄에게서 받음(1800 웰즐리 주는 1만 km² 미만 — 조각 통째)
MI_own(['MY-07'], [[E2_START, 'kedah-perlis'], [1786, 'straits-settlements']]);
MI_own(['MY-08'], [[E2_START, 'perak-sultanate']]); // 페락(1874 팡코르 조약·주재관은 관계)
MI_own(['MY-03'], [[E2_START, 'kelantan-sultanate']]); // 클란탄
MI_own(['MY-11'], [[E2_START, 'terengganu-sultanate']]); // 트렝가누
MI_own(['MY-10', 'MY-14', 'MY-16', 'MY-05'], [[E2_START, 'selangor-negeri-sembilan']]); // 슬랑오르·느그리슴빌란 묶음(1773 연합 전 느그리슴빌란 땅 6,862 km²는 1만 미만 — 근사)
// 파항: 1767~1852 조호르 제국의 븐다하라 영지, 1853 툰 알리의 독립 선언부터 파항(1861 조호르와 경계 조약·1881 술탄 칭호는 글 — 기본값 B3)
MI_own(['MY-06'], [[E2_START, 'johor-sultanate'], [1853, 'pahang-sultanate']]);
MI_own(['MY-01'], [[E2_START, 'johor-sultanate']]); // 조호르(1824 영국·네덜란드 조약으로 리아우와 갈림)
MI_own(MI_SG, [[E2_START, 'johor-sultanate'], [1819, 'straits-settlements']]); // 싱가포르: 1819-02 래플스 상관, 1824 조호르가 섬을 넘김
// 말라카: VOC → 1800 네덜란드령 동인도(1795~1818 영국 점령은 되돌려져 칠하지 않음 — B2), 1824 조약으로 1825 영국에 넘어감
MI_own(['MY-04'], [[E2_START, 'voc'], [1800, 'dutch-east-indies'], [1825, 'straits-settlements']]);
// ── 인도네시아 (E2 창구 ② Q-B1·Q-B3 — 조각마다 첫 조약·보호·병합 해부터 voc(~1799)/dutch-east-indies(1800~), 그 앞은 비움) ──
// 그해 말 주인 줄: y가 1800 앞이면 voc → 1800 dutch-east-indies, 1800 이후면 그 해부터 dutch-east-indies(앞은 비움)
const MI_dutch = (y) => [...(y > E2_START ? [[E2_START, null]] : []), ...(y < 1800 ? [[y, 'voc'], [1800, 'dutch-east-indies']] : [[y, 'dutch-east-indies']])];
// 1767에 이미 VOC 땅·속국(B7 — 자와 토후국도 VOC 색): 자와 여섯(반튼 1684 속국, 1755 기얀티 조약), 람풍(1752 반튼에게서 넘겨받음), 북술라웨시(미나하사)·고론탈로,
//   남·서술라웨시(1667 붕아야 조약), 말루쿠 둘(암본·테르나테·티도레), 서·동누사틍가라(비마·숨바와 1669·1674 계약, 쿠팡 1653 — 롬복 약 4,700 km²는 1894까지 발리 왕국 땅이나 1만 미만)
// 영국의 자와 점령 1811~1816·말루쿠 1810~1817은 되돌려진 점령이라 칠하지 않음(B2)
MI_own(['ID-BT', 'ID-JK', 'ID-JB', 'ID-JT', 'ID-YO', 'ID-JI', 'ID-LA', 'ID-SA', 'ID-GO', 'ID-SN', 'ID-SR', 'ID-MA', 'ID-MU', 'ID-NB', 'ID-NT'], MI_dutch(E2_START));
MI_own(['ID-KB'], MI_dutch(1779)); // 서칼리만탄: 1779-07-05 폰티아낙 술탄과 VOC 협정
// 남·중칼리만탄: 1787 반자르 술탄국이 VOC의 봉토가 됨(중칼리만탄 다야크 땅은 반자르의 지배 아래 — 내륙은 명목), 1809 네덜란드 철수 뒤 1817-01 새 협정까지 비움(창구 ③ Q-E4)
MI_own(['ID-KS', 'ID-KT'], [...MI_dutch(1787), [1809, null], [1817, 'dutch-east-indies']]);
MI_own(['ID-BB'], MI_dutch(1816)); // 방카: 1812 팔렘방이 영국에 넘긴 섬을 1816 네덜란드가 돌려받음
MI_own(['ID-SB'], MI_dutch(1821)); // 서수마트라: 1821-02-10 파가루융 왕가와 조약(1833 왕국 폐지)
MI_own(['ID-SS'], MI_dutch(1823)); // 남수마트라: 1823-10-07 팔렘방 술탄국 해체
MI_own(['ID-KR'], MI_dutch(1824)); // 리아우 제도: 1824 영국·네덜란드 조약으로 리아우-링가가 네덜란드 쪽(5,601 km² — 1만 미만)
MI_own(['ID-ST'], MI_dutch(1824)); // 중술라웨시: 1824 팔루·바나와 왕국의 짧은 서약(포소 1888)
MI_own(['ID-BE'], MI_dutch(1825)); // 벵쿨루: 1824 조약으로 1825 영국이 넘김
MI_own(['ID-JA'], MI_dutch(1833)); // 잠비: 1833 술탄이 네덜란드 권위를 받아들임
MI_own(['ID-KI'], MI_dutch(1844)); // 동·북칼리만탄: 1844 쿠타이 술탄국 조약(베라우·불룽안 계약은 1834~1850 — 내륙은 명목)
MI_own(['ID-PA', 'ID-PB'], MI_dutch(1848)); // 서뉴기니: 1848 테르나테·티도레 종주를 근거로 한 주장(141° 자오선 — 결정 6·Q-B3, 내륙은 명목)
MI_own(['ID-BA'], MI_dutch(1844)); // 발리: 1841~1843 발리 왕들이 네덜란드 주권을 인정한 조약(1849 북발리 정복, 남발리는 1906~1908) — 섬이 1만 km² 미만이라 새 해를 만들지 않고 1844 쿠타이 조약과 같은 해
MI_own(['ID-RI'], MI_dutch(1858)); // 리아우 본토: 1858 시악 조약
MI_own(['ID-SG'], MI_dutch(1858)); // 동남술라웨시: 1858 라이우이(켄다리) 계약(부톤 섬의 VOC 동맹은 앞서나 섬은 작음)
MI_own(['ID-SU'], MI_dutch(1862)); // 북수마트라: 1862 델리 술탄국 계약(바탁 내륙은 1907 무렵까지 — 명목)
MI_own(['ID-AC'], [[E2_START, 'aceh-sultanate']]); // 아체: 1873~1904 아체 전쟁, 1904부터 네덜란드령(E1)
MI_own(idsOf('TLS'), [[E2_START, 'portuguese-timor']]); // 티모르 동쪽·오에쿠시(기본값 B6 — 통째, 내륙 왕국 자치는 글)
{
  const left = E2_MI_IDS.filter((id) => !lines.has(id));
  if (left.length) throw new Error(`southeast-asia colonial: MI 칸 조각에 주인 줄이 없음 ${left.join(', ')}`);
}
const MI_voids = () => [
  V(E2_START, 1779, 'ID-KB'), // 서칼리만탄: 삼바스·수카다나·란닥 등 말레이·다야크 왕국 땅 — 네덜란드와 첫 협정(1779년, 폰티아낙) 전
  V(E2_START, 1787, 'ID-KS', 'ID-KT'), // 남·중칼리만탄: 반자르 술탄국 땅 — VOC 봉토가 된 해(1787년) 전
  V(1809, 1817, 'ID-KS', 'ID-KT'), // 남·중칼리만탄: 네덜란드 철수 — 반자르 술탄국·영국 계약기(1809년 철수~1817년 1월 새 협정 전)
  V(E2_START, 1816, 'ID-BB'), // 방카: 팔렘방 술탄국 땅(1812~1815 영국 점령) — 네덜란드에 넘어온 해(1816년) 전
  V(E2_START, 1821, 'ID-SB'), // 서수마트라: 파가루융 왕국 땅(파당 해안 상관만 VOC·영국) — 네덜란드와 첫 조약(1821년) 전
  V(E2_START, 1823, 'ID-SS'), // 남수마트라: 팔렘방 술탄국 땅 — 술탄국 해체(1823년) 전
  V(E2_START, 1824, 'ID-KR', 'ID-ST'), // 리아우 제도: 조호르-리아우 제국 땅(반도 조호르 술탄국에는 넣지 않음) / 중술라웨시: 팔루·바나와 등 카일리 왕국 땅 — 네덜란드와 조약(1824년) 전
  V(E2_START, 1825, 'ID-BE'), // 벵쿨루: 영국 동인도 회사의 요새(말보로 요새)와 토착 족장 땅 — 네덜란드에 넘어온 해(1825년) 전
  V(E2_START, 1833, 'ID-JA'), // 잠비: 잠비 술탄국 땅(VOC 상관은 1770 철수) — 네덜란드 권위를 받아들인 해(1833년) 전
  V(E2_START, 1844, 'ID-KI', 'ID-BA'), // 동·북칼리만탄: 쿠타이·파시르·베라우·불룽안 술탄국 땅 — 쿠타이 조약(1844년) 전 / 발리: 발리 왕국들 땅 — 네덜란드 주권을 인정한 조약(1841~1843년) 전
  V(E2_START, 1848, 'ID-PA', 'ID-PB'), // 서뉴기니: 파푸아 사람들의 땅(티도레의 해안 조공만) — 네덜란드 주장(1848년) 전
  V(E2_START, 1858, 'ID-RI', 'ID-SG'), // 리아우 본토: 시악 술탄국 땅 / 동남술라웨시: 코나웨·라이우이·므콩가 왕국 땅 — 네덜란드와 조약(1858년) 전
  V(E2_START, 1862, 'ID-SU'), // 북수마트라: 델리·랑캇·스르당·아사한 술탄국과 바탁 땅 — 델리 계약(1862년) 전
];
// ── E2 MI 끝 ──

// ── E2 BP 보르네오 북부·필리핀 (조각 E2_BP_IDS: 사바·사라왁·라부안 3·브루나이 4·필리핀 118, 구현 E2-BP): 최상위 이름은 BP_ ──
// 항목: spanish-philippines·sulu-sultanate(새 — 이 칸 글), sarawak·north-borneo·brunei·american-philippines(E1 항목을 같은 id로 1767~1899 — 이 칸 글)
import { BP_CUT_1841, BP_CUT_1852, BP_CUT_1861, BP_CUT_1882, BP_CUT_SABAH } from './cuts-e2.mjs';
const BP_BOUNDS = [1882, 1890]; // 사바 나눔은 1767~1881(1882 북보르네오 통째), 사라왁 나눔은 1767~1889(1890 림방 뒤 지금 사라왁주 통째 — E1 1900 모양과 이음)
// 조각 몫: 사라왁 MY-13 = 칼선 넷으로 다섯 부분(1841 쿠칭·1852 바탕루파르·1861 라장·1882 바람·나머지 림방), 사바 MY-12 = 칼선 하나로 서(브루나이)·동(술루), 라부안 MY-15, 브루나이 4조각, 필리핀 118조각
const BP_SARAWAK = ['MY-13'];
const BP_SABAH = ['MY-12'];
const BP_LABUAN = ['MY-15'];
const BP_BRUNEI = idsOf('BRN');
const BP_PHIL = idsOf('PHL');
if (BP_SARAWAK.length + BP_SABAH.length + BP_LABUAN.length + BP_BRUNEI.length + BP_PHIL.length !== E2_BP_IDS.length || [...BP_SARAWAK, ...BP_SABAH, ...BP_LABUAN, ...BP_BRUNEI, ...BP_PHIL].some((id) => !E2_BP_IDS.includes(id))) throw new Error('southeast-asia colonial: BP 칸 조각 나눔이 E2_BP_IDS와 다름');
// 사라왁(Q-B2): 1767 브루나이 술탄국 땅, 브룩 라자국이 넓어진 해마다 사라왁 색 — 1841-09-24 쿠칭 둘레, 1852 사리바스·스크랑, 1861 라장·무카·빈툴루, 1882 바람, 1890 림방
//   (1884 트루산은 림방 부분 안 1만 km² 미만이라 1890에 함께, 1905 라와스는 E1처럼 1890부터 사라왁 색 — 근사)
ownSplit('BP_사라왁', BP_SARAWAK, [['쿠칭', BP_CUT_1841], ['바탕루파르', BP_CUT_1852], ['라장', BP_CUT_1861], ['바람', BP_CUT_1882]], '림방', {
  쿠칭: [[E2_START, 'brunei'], [1841, 'sarawak']],
  바탕루파르: [[E2_START, 'brunei'], [1852, 'sarawak']],
  라장: [[E2_START, 'brunei'], [1861, 'sarawak']],
  바람: [[E2_START, 'brunei'], [1882, 'sarawak']],
  림방: [[E2_START, 'brunei']],
}, { from: E2_START, to: 1890 });
own(BP_SARAWAK, [[1890, 'sarawak']]);
// 사바(Q-B2): 서쪽 바닷가·내륙(판다산강 서쪽)은 브루나이, 동쪽(마루두만~시부쿠강)은 술루 술탄국. 1877-12 브루나이·1878-01 술루 양허 뒤 1881-11-01 특허 전은 비움(기본값 — 결과 노트 6절 질문 초안),
//   1882 영국 북보르네오 회사(B10). 파다스·클리아스 등 1884년 뒤에 회사에 넘어간 서남쪽 바닷가는 1만 km² 미만이라 1882부터 북보르네오 색(근사)
ownSplit('BP_사바', BP_SABAH, [['서', BP_CUT_SABAH]], '동', {
  서: [[E2_START, 'brunei'], [1878, null]],
  동: [[E2_START, 'sulu-sultanate'], [1878, null]],
}, { from: E2_START, to: 1882 });
own(BP_SABAH, [[1882, 'north-borneo']]);
// 라부안(526 km², B8): 1846-12-18 영국에 할양(1848 직할 식민지 — 이 권역 항목이 없어 비움), 1890 북보르네오 회사 관리(E1 이음)
own(BP_LABUAN, [[E2_START, 'brunei'], [1846, null], [1890, 'north-borneo']]);
// 브루나이: 1888-09-17 영국 보호 협정은 관계로
own(BP_BRUNEI, [[E2_START, 'brunei']]);
// 필리핀(B5): 법적 국경 — 술루 군도·민다나오 술탄국 땅·코르디예라·남팔라완도 스페인령(실효 지배 밖은 mapNote), 1898-12-10 파리 조약으로 미국령
own(BP_PHIL, [[E2_START, 'spanish-philippines'], [1898, 'american-philippines']]);
const BP_voids = () => [
  V(1846, 1890, ...BP_LABUAN), // 라부안: 영국 직할 식민지(1848~1889) — 이 권역에 칠할 항목이 없음
  V(1878, 1882, ...BP_SABAH), // 사바: 브루나이·술루 양허 뒤 특허 전 — 영국 북보르네오 임시 협회(덴트·오버벡)
];
// ── E2 BP 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([E2_START, ...BM_BOUNDS, ...SC_BOUNDS, ...LO_BOUNDS, ...VT_BOUNDS, ...MI_BOUNDS, ...BP_BOUNDS, E2_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== E2_START || BOUNDS.at(-1) !== E2_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`southeast-asia colonial: 표 경계 해 ${BOUNDS.join(', ')}는 ${E2_START}~${E2_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`southeast-asia colonial: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`southeast-asia colonial: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`southeast-asia colonial: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`southeast-asia colonial: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`southeast-asia colonial: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== E2_END) throw new Error(`southeast-asia colonial: 마지막 표의 끝이 ${joined.TO} (${E2_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간을 prevPieces 구간(뺄 도형 목록이 같은 구간)으로 다시 나누고, 그 구간에서 이 나라 땅과 실제로 겹치는 도형(중국 쪽 띠)만 뺀다.
// 겹치는 도형 목록이 같은 구간은 다시 잇는다(modern.mjs와 같은 줄 — 1767~1899는 뺄 도형이 qing 띠 하나라 구간이 나뉘지 않음)
const hitKey = (shapes) => shapes.map((s) => Math.round(deg2(s) * 1e6)).sort((a, b) => a - b).join('|');
const cutPrev = ([from, to, list]) => {
  const g = build(list);
  const out = [];
  for (const [f, t, shapes] of prevPieces(from, to)) {
    const hit = shapes.filter((s) => deg2(I(g, s)) > 1e-6);
    const key = hitKey(hit);
    const last = out.at(-1);
    if (last && last.key === key && last.t === f) last.t = t;
    else out.push({ f, t, key, hit });
  }
  return out.map(({ f, t, hit }) => [f, t, hit.length ? D(g, ...hit) : g]).filter(([, , m]) => m.length);
};
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.flatMap(cutPrev)]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...BM_voids(), ...SC_voids(), ...LO_voids(), ...VT_voids(), ...MI_voids(), ...BP_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 384개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅·늘린 회사령 인도·영국령 인도·중국 쪽 띠를 합쳐 빈 곳이 없어야 한다.
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역의 끝은 E2_END(1900 — 그 뒤는 modern.mjs의 '동남아 현대' 구역). 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([E2_START, E2_END, ...voids.flatMap(([f, t]) => [f, t ?? E2_END]).filter((y) => E2_START < y && y < E2_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(modern.mjs와 같음 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? E2_END)).map(([, , g]) => g);
  return [{ name: `동남아 근대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void U; void geomOfUnit; void B; // 여섯 칸이 쓰지 않는 이름 경고 막기(E3·E4가 쓰면 지움)

export const era = {
  name: 'colonial',
  versions,
  gapZones,
  voids,
  source: SE_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳 — modern.mjs와 같은 값이라야 같은 나라 id(thailand 등)를 이어 붙일 수 있다(joinEras). 문구를 바꾸면 E1 나라 geojson이 모두 바뀐다
};
