// southeast-asia 시대 파일 early-modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1293~1766: 바간 끝·아바·항따와디·따웅우·므라우우·아유타야·란나·란쌍·대월(쩐·호·레·막·찐·응우옌)·참파·크메르·마자파힛·말라카·자와 술탄국·VOC 거점·스페인령 필리핀 (E3, docs/southeast-asia/00-scope.md 2절 시대 단계 표)
// 짝 항목 파일: data/entities/southeast-asia-early-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia/의 다른 도우미 모듈. areas/southeast-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/southeast-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/southeast-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다). 이 파일은 colonial.mjs·modern.mjs보다 앞(과거) 시대라 joinEras 목록 맨 앞에 둔다.
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 동남아 E3 짜임 안내 (E3 뼈대 2026-11-09 — 근거: docs/southeast-asia/00-scope.md 2·3·5·10절, 0단계 결정 1~10·기본값 30건, E3 창구 ② 결정 열하나(se4/decisions.md), 지시문 e3/COMMON.md) ─────
// 짜임은 E2 시대 파일 colonial.mjs와 같다(도우미·공통 줄을 옮김). 다른 점: 해가 E3_START(1293)~E3_END(1767, 미포함), 빈 땅 검사 구역 이름이 '동남아 근세 Y~Y',
//   그리고 권역 밖 땅 줄(<칸>_OUTSIDE — 아래 '권역 밖 땅')이 있다.
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 두 구역(new-guinea-interior·borneo-interior) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습, 조약이 있으면 그 해, 없으면 실효 지배가 굳은 해. 원정·되돌려진 점령은 칠하지 않음(원의 자와 원정 1293, 아라칸의 하버마 1599~1603,
//   란쌍의 버마 지배기 1574~1597·아유타야의 따웅우 종속 1569~1584는 땅 그대로 관계만 — E3 기본값 D7·D14). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만.
//   조공국·종속 소국 땅은 종주 색으로 칠하지 않는다(결정 10 — 그 나라 항목이 있으면 그것, 없으면 비움).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-e3.mjs E3_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── E3 BM …'·SC·VT·LO·M1·I1)와 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수·OUTSIDE 모두). 최상위 이름은 칸 앞머리 BM_·SC_·VT_·LO_·M1_·I1_, import도 별칭(예: VT_GIANH), ownSplit 묶음 이름도 앞머리(예: 'VT_꽝찌').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·권역 밖 땅·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
//   다른 칸 항목을 주인으로 쓰는 것은 된다(예: LO 칸이 이산 조각에 khmer-empire·ayutthaya-kingdom, VT 칸이 메콩 삼각주에 cambodia — 항목 글은 정의 칸, 문안은 결과 노트 9절).
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더함)를 공통 BOUNDS가 합친다(E3_START·E3_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다
//   — 주인만 바뀌는 해는 BOUNDS에 없어도 되고, ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 E3_START(1293)부터, 해는 늘어난다. 단위마다 여러 번 이어 적을 수 있다(뒤 줄 첫 해가 앞 줄의 마지막 해보다 뒤).
//   줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다. 주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄, 이유는 줄 주석)이거나 다른 도형이 덮는 땅
//   (1407~1426 명 교지 — 중국 쪽 ming 손 도형이 덮으므로 voids에 넣지 않음, 결정 9·기본값 20).
// 앞 권역 나라 늘리기: 이 시대에는 없다(권역 파일 EXTENDABLE의 company-india·british-raj는 1826 뒤). ming·yuan·qing·bengal-sultanate·mughal-empire·manipur·ahom-kingdom·portugal·spain·netherlands 등을 주인으로 쓰면 생성기가 멈춘다.
// 권역 밖 땅(E3 뼈대 — 자동 승인 A6 므라우우의 치타공): 이 권역 나라가 이웃 권역이 비운 땅을 칠할 때 칸 머리 <칸>_OUTSIDE = [[from, to(미포함), 나라 id, 도형], …]에 적는다.
//   공통 줄이 그 나라 버전(조각 땅에서 다른 도형을 뺀 뒤)에 합친다 — 그 기간에 이 권역 조각 땅이 없으면 권역 밖 땅만으로 버전을 만든다. 도형은 이웃 권역의 voids 줄을 도우미 모듈에서 찾아 쓴다(cuts-e3.mjs BM_CHITTAGONG — 좌표 베끼기 금지).
//   이웃 권역 파일은 고치지 않는다(그쪽 비움 줄이 그대로 있어도 겹침 검사는 나라끼리만 본다). 빈 땅 검사 구역(권역 바깥선)에는 들어가지 않는다.
// 다른 도형 빼기는 공통 줄이 한다: 버전을 만들 때 prev.mjs의 prevPieces가 해 구간마다 돌려주는 도형(중국 쪽 yuan·ming·qing 손 도형 — 윈난·광시 띠 154~1,414 km², 1407~1426 명 교지 172,010 km²
//   — E3 뼈대 측정 e3/skel/prev-overlap.txt)을 그 나라 땅에서 뺀다. 칸은 빼지 않는다.
// 이어 붙임: E2·E1 항목(konbaung-dynasty·later-le-dynasty·voc·brunei 등)을 같은 id로 1766까지 칠하면 joinEras가 colonial.mjs의 1767~ 버전 앞에 붙인다(1767년에 버전이 한 번 나뉨 — 도형이 같으면 넓이 변화 0).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(동남아 첫판·E1·E2·사건 se-05·se-06·E3 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SE_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';
import { deg2, prevPieces } from './prev.mjs';
import { E3_BM_IDS, E3_SC_IDS, E3_VT_IDS, E3_LO_IDS, E3_M1_IDS, E3_I1_IDS } from './cuts-e3.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('early-modern');

const E3_START = 1293; // 이 시대 파일의 첫 해(1293년 말 모습 — 마자파힛 건국·원의 자와 원정 철수). 그 앞(1292 이전)은 E4 시대 파일 ancient.mjs 몫(같은 id를 1292까지 칠하면 joinEras가 앞에 붙임)
const E3_END = 1767; // 마지막 표의 끝(미포함) — 1767년부터는 E2 시대 파일 colonial.mjs

// ── 조각 소유표 도우미 (colonial.mjs와 같은 꼴 — E3 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < E3_START || e[0] >= E3_END)) {
    throw new Error(`southeast-asia early-modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${E3_START} 이상 ${E3_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`southeast-asia early-modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = E3_START, to = E3_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`southeast-asia early-modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`southeast-asia early-modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`southeast-asia early-modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`southeast-asia early-modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`southeast-asia early-modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── E3 BM 버마 (조각 E3_BM_IDS: 미얀마 14, 구현 E3-BM): 칼선 import·상수·own 줄·voids·OUTSIDE는 이 아래에, 최상위 이름은 BM_ ──
// 항목: pagan-empire·pinya-kingdom·ava-kingdom·hanthawaddy-kingdom·toungoo-dynasty(새 — 이 칸 글, 짝 파일 southeast-asia-early-modern.yaml),
//   konbaung-dynasty·mrauk-u(E2 항목을 같은 id로 1752·1430~1766 — 이 칸 글, southeast-asia-colonial.yaml), shan-states(E1 항목을 같은 id로 1557~1766 — 이 칸 글, southeast-asia-modern.yaml)
// E3 창구 ② Q1(샨 1557부터, 앞은 비움)·Q2(란나 — SC 땅, 1763~1766 직할 다섯 도만 이 칸 항목 konbaung-dynasty 색을 SC가 칠함)·Q3(카친·친 1752부터, 앞은 비움)·자동 승인 A6(치타공 1459~1665 — BM_OUTSIDE에 cuts-e3.mjs BM_CHITTAGONG)
import { BM_CHITTAGONG, BM_CUT_PAGAN, BM_CUT_PROME } from './cuts-e3.mjs';
// 표 경계 해: 1293~1538에만 바고를 북위 18.25° 위도선으로 나눔(북쪽 프롬·따웅우는 상버마 왕실 쪽, 1510 따웅우 독립 — 1539부터 하버마와 같은 줄).
//   1544~1554에만 마궤·만달레이를 바간 위도선으로 나눔(1544년 4월까지 따웅우가 바간까지의 중부 버마를 차지, 1545 페구 조약으로 아바가 넘김 — 1555년 1월 아바 함락으로 상버마 전체)
const BM_BOUNDS = [1539, 1544, 1555];
// 조각 몫(E2 BM과 같은 나눔 — 1766년 모양이 E2 1767년 모양과 이어짐: 상·하버마·테나세림·카친·친은 konbaung-dynasty, 라카인 mrauk-u, 샨 shan-states, 카야는 비움)
const BM_UPPER = ['MM-01', 'MM-03', 'MM-04']; // 사가잉·마궤·만달레이 = 상버마(바간·아바·핀야·사가잉·쉐보)
const BM_HILLS = ['MM-11', 'MM-14']; // 카친·친 구릉(Q3 — 1752 콘바웅 첫 버전부터, 그 앞은 왕조의 지배 서술이 없어 비움)
const BM_LOWER = ['MM-02', 'MM-06', 'MM-07', 'MM-15', 'MM-13']; // 바고·양곤·에야와디·몬·카인 = 하버마(페구·마르타반). 카인 산지도 마르타반 몫으로 같은 줄(카렌 땅을 따로 다룬 사료 없음)
const BM_DELTA = ['MM-06', 'MM-07', 'MM-15', 'MM-13']; // 하버마 가운데 바고(MM-02 — 1293~1538 나눔) 밖
const BM_TENASSERIM = ['MM-05']; // 타닌타리 = 테나세림(타보이·머귀)
const BM_ARAKAN = ['MM-16']; // 라카인 = 아라칸
const BM_SHAN = ['MM-17']; // 샨 고원
const BM_KARENNI = ['MM-12']; // 카야(D17 — E2 1767 karenni-states 그대로, 그 앞은 비움)
{
  const all = [...BM_UPPER, ...BM_HILLS, ...BM_LOWER, ...BM_TENASSERIM, ...BM_ARAKAN, ...BM_SHAN, ...BM_KARENNI];
  if (all.length !== E3_BM_IDS.length || new Set(all).size !== all.length || all.some((id) => !E3_BM_IDS.includes(id))) throw new Error('southeast-asia early-modern: BM 칸 조각 나눔이 E3_BM_IDS와 다름');
}
// 상버마: 1297-12 마인사잉 삼형제가 바간 왕 짜스와를 폐위(D16 — 바간 마지막 버전 1296), 1364 샨의 사가잉·핀야 약탈 뒤 1365 아바 왕국. 1527 샨 연맹(모닌)의 아바 점령은 땅 그대로.
//   사가잉(MM-01)과 바간 위도선 북쪽 만달레이는 1555-01 바인나웅의 아바 함락부터 따웅우. 1599 제국이 무너진 뒤에도 아바의 냥얀 정권(복원 따웅우)이 상버마를 쥠.
//   1752-03 항따와디가 아바를 함락 — 그해 10월까지 알라웅브야가 아바 북쪽(쉐보·무 골짜기와 마다야)에서 항따와디 군을 몰아냄: 사가잉만 콘바웅, 아바 쪽 만달레이와 마궤는 항따와디(아바 북쪽 만달레이 몫은 근사 — 결과 노트 7절).
//   1753년 말 아바 성만 남기고 상버마 전체가 콘바웅(1754-01-03 아바 탈환) — 1753부터 콘바웅
own(BM_UPPER, [[E3_START, 'pagan-empire'], [1297, 'pinya-kingdom'], [1365, 'ava-kingdom']]);
own(['MM-01'], [[1555, 'toungoo-dynasty'], [1752, 'konbaung-dynasty']]);
own(['MM-03', 'MM-04'], [[1555, 'toungoo-dynasty'], [1752, 'hanthawaddy-kingdom'], [1753, 'konbaung-dynasty']]);
// 1544~1554: 바간 위도선 남쪽의 마궤·만달레이(바간·파꼬꾸·메이크틸라·야메틴)는 따웅우, 북쪽(밍잔·짜욱세·아바·강고)은 아바 왕국
ownSplit('BM_중부', ['MM-03', 'MM-04'], [['남', BM_CUT_PAGAN]], '북', { 남: [[1544, 'toungoo-dynasty']], 북: [[1544, 'ava-kingdom']] }, { from: 1544, to: 1555 });
own(BM_HILLS, [[E3_START, null], [1752, 'konbaung-dynasty']]);
// 하버마: 1287 와레루의 마르타반 독립(항따와디), 1538~1539 다빙슈웨디가 페구를 차지(1541 마르타반) — 1539부터 따웅우. 1599 페구 함락·제국 붕괴 뒤 아라칸·포르투갈(시리암)·지방 세력이 갈라 쥐어
//   비움(D7 — 아라칸의 하버마 점령 1599~1603은 되돌려진 점령이라 칠하지 않음), 1613 아나욱펫룬의 시리암 함락으로 다시 따웅우(1608 프롬·1610 따웅우·1613 시리암).
//   1740-11 몬의 봉기로 항따와디 부활, 1755 콘바웅이 프롬·삼각주·다곤, 1756-07 시리암, 1757-05-06 페구 함락(D15 — 항따와디 마지막 버전 1756) — 1757부터 콘바웅(1755~1756 삼각주 몫은 근사 — 결과 노트 7절)
own(BM_DELTA, [[E3_START, 'hanthawaddy-kingdom']]);
own(BM_LOWER, [[1539, 'toungoo-dynasty'], [1599, null], [1613, 'toungoo-dynasty'], [1740, 'hanthawaddy-kingdom'], [1757, 'konbaung-dynasty']]);
// 1293~1538 바고: 위도선 남쪽(페구·따야와디)은 항따와디, 북쪽(프롬·따웅우)은 바간·핀야·아바 쪽이다가 1510 따웅우가 아바에서 독립(바고 북부 18,911 km² — 1482~1542 프롬 왕국 몫 약 7,200 km²는 1만 미만이라 같은 줄, 결과 노트 7절)
ownSplit('BM_바고', ['MM-02'], [['북', BM_CUT_PROME]], '남', { 북: [[E3_START, 'pagan-empire'], [1297, 'pinya-kingdom'], [1365, 'ava-kingdom'], [1510, 'toungoo-dynasty']], 남: [[E3_START, 'hanthawaddy-kingdom']] }, { from: E3_START, to: 1539 });
// 테나세림: 아유타야·항따와디·따웅우가 번갈아 다툰 땅이라 비움(D5), 콘바웅이 1757~1759 이름뿐인 지배 뒤 1760 위쪽 바닷가를 쥐고 1765 몬 저항을 몰아냄 — 1765부터 콘바웅(E2 1767과 이음)
own(BM_TENASSERIM, [[E3_START, null], [1765, 'konbaung-dynasty']]);
// 아라칸: 렝옛 왕조까지 E4 항목 arakan-kingdom(같은 id — ancient.mjs BI 칸의 788~1292에 이음, 1406~1429 왕의 벵골 망명기도 같은 색), 1430 민소몬이 므라우우에 도읍(from 1429→1430). 치타공 1459~1665는 아래 BM_OUTSIDE
own(BM_ARAKAN, [[E3_START, 'arakan-kingdom'], [1430, 'mrauk-u']]);
// 샨 고원: 사오파 소국들이 따로 섬(Q1 — 비움), 1557 바인나웅이 샨 소국들을 정복한 뒤 따웅우·콘바웅에 매인 소국 묶음(관계 vassal_of)
own(BM_SHAN, [[E3_START, null], [1557, 'shan-states']]);
own(BM_KARENNI, [[E3_START, null]]);
// 권역 밖 땅: 치타공(A6 — 1459 므라우우가 차지, 1666-01 무굴의 샤이스타 칸이 빼앗음). 남아시아 비움 줄(sultanate.mjs 'E_BDB/치타공')의 도형을 cuts-e3.mjs가 찾아 줌
const BM_OUTSIDE = [[1459, 1666, 'mrauk-u', BM_CHITTAGONG]];
const BM_voids = () => [
  V(E3_START, 1752, ...BM_HILLS), // 카친·친 구릉: 바간·핀야·아바·따웅우가 이 구릉을 다스렸다는 서술이 없음(Q3 — 모닌·모가웅 같은 샨 소국과 카친·친 부족 땅)
  V(E3_START, 1557, ...BM_SHAN), // 샨 고원: 사오파 소국들이 따로 섬(Q1 — 1557 따웅우 정복 앞은 하나의 나라가 아님, 1527 모닌의 아바 점령도 소국 연합)
  V(E3_START, E3_END, ...BM_KARENNI), // 카야: 카레니 소국들의 지배 서술 없음(D17 — 1767부터 karenni-states)
  V(E3_START, 1765, ...BM_TENASSERIM), // 테나세림: 수코타이·아유타야·항따와디·따웅우가 번갈아 다툰 땅(D5 — 직접 지배가 굳지 않음)
  V(1599, 1613, ...BM_LOWER), // 하버마: 1599 페구 함락 뒤 아라칸·포르투갈(시리암의 데 브리투)·따웅우·프롬 세력이 갈라 쥠(D7)
];
// ── E3 BM 끝 ──

// ── E3 SC 시암·캄보디아 (조각 E3_SC_IDS: 타이 57(이산 20 뺌)·캄보디아 22(라타나키리·스퉁트렝 뺌), 구현 E3-SC): 최상위 이름은 SC_ ──
// 항목: khmer-empire·lavo-kingdom·sukhothai-kingdom·ayutthaya-kingdom(새 — 이 칸 글), lan-na·patani-sultanate·cambodia(E1·E2 항목을 같은 id로 1293·1457·1431~1766 — 이 칸 글)
// E3 창구 ② Q2(란나 1558~1727 란나 색 + 종속, 1763~1766 직할 다섯 도는 konbaung-dynasty 색)·Q4(타이 남부 11도 — 15세기 중반 개혁 뒤부터 아유타야, 앞은 비움)·Q5(코랏은 LO 칸)·Q6(메콩 삼각주는 VT 칸이 cambodia 색)
// 땅은 모두 조각 통째(칼선·나눈 조각 없음 — 주인만 바뀌는 해라 표 경계 해가 필요 없음). 1766년 모양은 E2 1767년 모양과 이음(COMMON P1):
//   톤부리 중심은 ayutthaya-kingdom → thailand, 북중부·남부는 ayutthaya-kingdom → 비움(1767-04-07 함락 해 점프 — E2 결정 Q4), 란나·파타니·캄보디아는 같은 주인.
const SC_BOUNDS = [];
const SC_OUTSIDE = [];
// 조각 몫(E2 SC 목록과 같은 조각 — colonial.mjs의 목록 상수는 export되지 않아 id만 다시 적음)
const SC_TH = idsOf('THA').filter((id) => E3_SC_IDS.includes(id));
const SC_KH = idsOf('KHM').filter((id) => E3_SC_IDS.includes(id));
// 중부·서부·동부(E2 SC_THONBURI와 같은 조각): 1293~1350 라보(롭부리)와 수판부리(기본값 D8 — 경계는 짐작), 1351-03-04 우통(라마티보디 1세)이 아유타야를 세워 합침(기본값 D1)
const SC_CENTRAL = ['TH-10', 'TH-11', 'TH-12', 'TH-13', 'TH-14', 'TH-15', 'TH-16', 'TH-17', 'TH-18', 'TH-19', // 방콕·사뭇쁘라깐·논타부리·빠툼타니·아유타야·앙통·롭부리·싱부리·차이낫·사라부리
  'TH-20', 'TH-21', 'TH-22', 'TH-23', 'TH-24', 'TH-25', 'TH-26', 'TH-27', // 촌부리·라용·짠타부리·뜨랏·차청사오·쁘라찐부리·나콘나욕·사깨오
  'TH-70', 'TH-71', 'TH-72', 'TH-73', 'TH-74', 'TH-75', 'TH-76', 'TH-77']; // 랏차부리·깐짜나부리·수판부리·나콘빠톰·사뭇사콘·사뭇송크람·펫차부리·쁘라쭈압키리칸
// 북중부(E2 SC_NORTH_CENTRAL): 수코타이 왕국 — 1378 아유타야에 신복(땅 그대로, 관계 줄), 1438 아유타야가 흡수. 딱(TH-63)의 1321 란나 쪽 이탈은 칠하지 않음(기본값 D9)
const SC_NORTH_CENTRAL = ['TH-53', 'TH-60', 'TH-61', 'TH-62', 'TH-63', 'TH-64', 'TH-65', 'TH-66', 'TH-67']; // 웃따라딧·나콘사완·우타이타니·깜팽펫·딱·수코타이·피사눌록·피칫·펫차분
// 남부 11도(E2 SC_SOUTH, 창구 ② Q4): 나콘시탐마랏(탐브랄링가 뒤)과 그 아래 므앙은 조공국이라 비움, 1454 뜨라이록까낫의 정부 개혁(삭디나 위계를 처음 정함 —
//   https://en.wikipedia.org/wiki/Borommatrailokkanat) 뒤부터 아유타야 직접 지배로 칠함. 나콘시탐마랏이 1등 므앙(직할 주)이 된 것은 나레수안 때(1590~1605)라는 서술이 있어 결과 노트 6절 질문 초안
const SC_SOUTH = ['TH-80', 'TH-81', 'TH-82', 'TH-83', 'TH-84', 'TH-85', 'TH-86', 'TH-90', 'TH-91', 'TH-92', 'TH-93']; // 나콘시탐마랏·끄라비·팡응아·푸껫·수랏타니·라농·춤폰·송클라·사뚠·뜨랑·팟탈룽
const SC_Q4 = 1454;
// 란나 북부 여덟 도(E2 SC_LANNA, 기본값 D2 from 1292): 1293~1557 란나, 1558~1726 버마(따웅우) 종속 — 란나 색 + 관계(창구 ② Q2), 1727 치앙마이 독립.
//   1763 콘바웅이 치앙마이를 다시 잡은 뒤 총독이 직접 다스린 다섯 도(E2 SC_LANNA_BURMA — 치앙마이·람푼·파야오·치앙라이·매홍손)만 콘바웅 색(BM 정의 항목), 람빵·프래·난은 란나 색 + 종속 관계
const SC_LANNA = ['TH-50', 'TH-51', 'TH-52', 'TH-54', 'TH-55', 'TH-56', 'TH-57', 'TH-58']; // 치앙마이·람푼·람빵·프래·난·파야오·치앙라이·매홍손
const SC_LANNA_BURMA = ['TH-50', 'TH-51', 'TH-56', 'TH-57', 'TH-58']; // 치앙마이·람푼·파야오·치앙라이·매홍손
// 파타니(E2 SC_PATANI): 1293~1456 랑카수카 뒤 소국들이라 비움, 1457 무렵 왕 인타라의 개종으로 술탄국(from 1457 그대로)
const SC_PATANI = ['TH-94', 'TH-95', 'TH-96']; // 빠따니·얄라·나라티왓
if (SC_TH.length + SC_KH.length !== E3_SC_IDS.length || [...SC_CENTRAL, ...SC_NORTH_CENTRAL, ...SC_SOUTH, ...SC_LANNA, ...SC_PATANI].sort().join() !== [...SC_TH].sort().join()) throw new Error('southeast-asia early-modern: SC 칸 타이 조각 나눔이 E3_SC_IDS와 다름');
own(SC_CENTRAL, [[E3_START, 'lavo-kingdom'], [1351, 'ayutthaya-kingdom']]);
own(SC_NORTH_CENTRAL, [[E3_START, 'sukhothai-kingdom'], [1438, 'ayutthaya-kingdom']]);
own(SC_SOUTH, [[E3_START, null], [SC_Q4, 'ayutthaya-kingdom']]);
own(SC_LANNA_BURMA, [[E3_START, 'lan-na'], [1763, 'konbaung-dynasty']]);
own(minus(SC_LANNA, ...SC_LANNA_BURMA), [[E3_START, 'lan-na']]);
own(SC_PATANI, [[E3_START, null], [1457, 'patani-sultanate']]);
// 캄보디아 22조각(라타나키리·스퉁트렝은 LO, 메콩 삼각주는 VT): 1293~1430 크메르 제국(1352~1353·1393~1394 아유타야의 앙코르 함락은 되돌려진 점령이라 칠하지 않음),
//   1431 포냐 얏이 앙코르를 버리고 남쪽으로 옮긴 뒤 캄보디아. 서북(바탐방·시엠레아프 등)·프레아비히어도 1766까지 캄보디아(E2 1794·1814 시암과 이음).
//   1594 롱벡 함락 뒤 1617까지의 시암 종속은 땅 그대로 관계 줄
own(SC_KH, [[E3_START, 'khmer-empire'], [1431, 'cambodia']]);
// 비운 땅: 남부 11도 1293~1453(조공국 — Q4), 파타니 1293~1456(이슬람 술탄국 앞 소국)
const SC_voids = () => [V(E3_START, SC_Q4, ...SC_SOUTH), V(E3_START, 1457, ...SC_PATANI)];
// ── E3 SC 끝 ──

// ── E3 VT 베트남·참파 (조각 E3_VT_IDS: 베트남 63, 구현 E3-VT): 최상위 이름은 VT_ ──
// 항목: tran-dynasty·ho-dynasty·mac-dynasty·champa(새 — 이 칸 글), later-le-dynasty·nguyen-lords(E2 항목을 같은 id로 1427·1600~1766 — 이 칸 글)
// E3 창구 ② Q6(메콩 삼각주 1431~1697 cambodia 색, 1698 동쪽·1757 서쪽 nguyen-lords)·기본값 D3(후 레 from 1427)·D4(응우옌 주 from 1600)·결정 9·기본값 20(명 교지 1407~1426 — 주인 null, voids 아님)
// 표 경계 해: 1600부터 꽝빈 VN-24를 잔강으로 나눔(응우옌 호앙이 레 조정에서 떨어져 나온 해 — 투언화 진수 땅은 잔강 남쪽 보찐 남부까지였고 1627~1672 찐–응우옌 전쟁도 이 강을 경계로 함).
//   그 밖의 해는 조각 경계라 주인만 바뀜. 벤하이강(꽝찌 북쪽 빈린 쪽, 쩐 땅)은 1만 km² 미만이라 칼선 없이 꽝찌 통째(결과 노트 7절 근사)
const VT_BOUNDS = [1600];
const VT_OUTSIDE = [];
import { VT_CUT_GIANH as VT_GIANH } from './cuts-e2.mjs';
// 조각 묶음은 E2 VT 칸(colonial.mjs)의 목록을 그대로 다시 적는다(1766년 모양이 E2 1767년 모양과 이어지게). 통킹에서 까오방·랑선(막 왕조 1592~1676)만 따로
const VT_TONKIN = ['VN-01', 'VN-02', 'VN-03', 'VN-05', 'VN-06', 'VN-07', 'VN-13', 'VN-14', 'VN-18', 'VN-20', 'VN-53', 'VN-54', 'VN-56', 'VN-61', 'VN-63', 'VN-66', 'VN-67', 'VN-68', 'VN-69', 'VN-70', 'VN-71', 'VN-HN', 'VN-HP'];
const VT_CAO_LANG = ['VN-04', 'VN-09']; // 까오방·랑선
const VT_THANH = ['VN-21']; // 타인호아(레 중흥의 근거지, 서도 떠이도)
const VT_NGHE = ['VN-22', 'VN-23']; // 응에안·하띤
const VT_THUAN_HOA = ['VN-25', 'VN-26']; // 꽝찌·트어티엔후에 = 투언화(1306 참파가 넘긴 오·리 두 주)
const VT_QUANG = ['VN-27', 'VN-DN', 'VN-29', 'VN-31']; // 꽝남·다낭·꽝응아이·빈딘 = 참파의 아마라바티·비자야(1471 레 타인 똥이 차지)
const VT_PHU_YEN = ['VN-32']; // 푸옌(1611 응우옌 주)
const VT_KAUTHARA = ['VN-34']; // 카인호아 = 카우타라(1653 응우옌 주)
const VT_PANDURANGA = ['VN-36', 'VN-40']; // 닌투언·빈투언 = 판두랑가(1693 응우옌 주에 종속)
const VT_HIGHLANDS = ['VN-28', 'VN-30', 'VN-35', 'VN-72', 'VN-33']; // 중부 고원(꼰뚬·자라이·럼동·닥농)과 다를락
const VT_COCHIN_E = ['VN-37', 'VN-39', 'VN-41', 'VN-43', 'VN-46', 'VN-57', 'VN-58', 'VN-SG']; // 메콩 삼각주 동쪽(동나이·사이공 쪽 — 1698 자딘부)
const VT_COCHIN_W = ['VN-44', 'VN-47', 'VN-49', 'VN-50', 'VN-51', 'VN-52', 'VN-55', 'VN-59', 'VN-73', 'VN-CT', 'VN-45']; // 메콩 삼각주 서쪽과 동탑(1757)
{
  const all = [VT_TONKIN, VT_CAO_LANG, VT_THANH, VT_NGHE, ['VN-24'], VT_THUAN_HOA, VT_QUANG, VT_PHU_YEN, VT_KAUTHARA, VT_PANDURANGA, VT_HIGHLANDS, VT_COCHIN_E, VT_COCHIN_W].flat();
  if (all.length !== E3_VT_IDS.length || new Set(all).size !== all.length || all.some((id) => !E3_VT_IDS.includes(id))) throw new Error('southeast-asia early-modern VT: 조각 목록이 E3_VT_IDS와 다름');
}
// 대월 북부: 1293 쩐 왕조, 1400 호 왕조(1400-03 호꾸이리 찬탈), 1407~1426 주인 null(명 교지 — 중국 쪽 ming 손 도형이 덮음, voids 아님), 1427 후 레 왕조(기본값 D3 — 1427 말 동관 맹약으로 명군 철수),
//   1527 막 왕조(막 당 중 찬탈), 1592 후 레 왕조(찐 뚱의 탕롱 탈환). 까오방·랑선은 막 왕조가 1677까지 지킴(기본값 D11)
const VT_DAI_VIET = [[1293, 'tran-dynasty'], [1400, 'ho-dynasty'], [1407, null], [1427, 'later-le-dynasty'], [1527, 'mac-dynasty']];
own(VT_TONKIN, [...VT_DAI_VIET, [1592, 'later-le-dynasty']]);
own(VT_CAO_LANG, [...VT_DAI_VIET, [1677, 'later-le-dynasty']]);
// 레 중흥(남조): 1533 타인호아(응우옌 낌이 레 장 똥을 세움), 1543 응에안·하띤(서도 떠이도를 되찾음 — 위키백과 Revival Lê dynasty 도읍 표 1542~1546),
//   1554 투언화·꽝남(찐 끼엠이 막에게서 되찾음 — 위키백과 Lê–Mạc War. 조사의 '1545 무렵'을 사료로 닫음)
own(VT_THANH, [...VT_DAI_VIET, [1533, 'later-le-dynasty']]);
own(VT_NGHE, [...VT_DAI_VIET, [1543, 'later-le-dynasty']]);
// 꽝빈: 쩐 땅(1069 리 왕조가 얻은 보찐·지리·마린). 1600부터 잔강 북쪽은 후 레(찐 씨), 남쪽은 응우옌 주 — E2 1767년 모양과 같은 칼선
own(['VN-24'], [...VT_DAI_VIET, [1554, 'later-le-dynasty']]);
ownSplit('VT_잔강E3', ['VN-24'], [['북', VT_GIANH]], '남', { 북: [[1600, 'later-le-dynasty']], 남: [[1600, 'nguyen-lords']] }, { from: 1600, to: E3_END });
// 투언화: 1293 참파(1306 혼인으로 쩐에 넘긴 오·리 두 주는 1만 km² 미만이라 버전 없음 — 기본값 D10), 1400 호 왕조, 1407 명 교지, 1427 후 레, 1527 막, 1554 후 레,
//   1600 응우옌 주(기본값 D4 — 1558~1599 응우옌 호앙은 레 조정의 투언화 진수라 레 색)
own(VT_THUAN_HOA, [[1293, 'champa'], [1400, 'ho-dynasty'], [1407, null], [1427, 'later-le-dynasty'], [1527, 'mac-dynasty'], [1554, 'later-le-dynasty'], [1600, 'nguyen-lords']]);
// 꽝남~빈딘: 참파(1402~1406 호 왕조가 얻은 땅은 5년이라 칠하지 않음 — D10), 1471 후 레(레 타인 똥의 비자야 함락), 1527 막, 1554 후 레, 1600 응우옌 주
own(VT_QUANG, [[1293, 'champa'], [1471, 'later-le-dynasty'], [1527, 'mac-dynasty'], [1554, 'later-le-dynasty'], [1600, 'nguyen-lords']]);
// 참파 남쪽: 1611 푸옌(응우옌 주가 푸옌부를 둠 — 1578 무렵 학설도 있으나 5,423 km²라 하나 고름), 1653 카인호아(카우타라), 1693 판두랑가(응우옌 주 종속 — 기본값 D13, 1697 학설은 글)
own(VT_PHU_YEN, [[1293, 'champa'], [1611, 'nguyen-lords']]);
own(VT_KAUTHARA, [[1293, 'champa'], [1653, 'nguyen-lords']]);
own(VT_PANDURANGA, [[1293, 'champa'], [1693, 'nguyen-lords']]);
// 중부 고원·다를락: 비움(저지 왕국의 직접 지배 밖 — E2 1767~ 비움과 이음)
own(VT_HIGHLANDS, [[1293, null]]);
// 메콩 삼각주(창구 ② Q6): 1293 크메르 제국, 1431 캄보디아(앙코르 포기 뒤 — 두 항목 글은 SC 칸), 동쪽은 1698 응우옌 주(응우옌 흐우 까인의 자딘부 — 위키백과 Nguyễn Hữu Cảnh),
//   서쪽·동탑은 1757 응우옌 주(앙 똥·우테이 2세가 남은 삼각주를 넘김 — 위키백과 Mekong Delta). 하띠엔 막 끄우 정권(1708~ 응우옌 주 종속)은 끼엔장 조각 일부라 1만 km² 미만 — 캄보디아 색 그대로(mapNote)
own(VT_COCHIN_E, [[1293, 'khmer-empire'], [1431, 'cambodia'], [1698, 'nguyen-lords']]);
own(VT_COCHIN_W, [[1293, 'khmer-empire'], [1431, 'cambodia'], [1757, 'nguyen-lords']]);
// 비운 땅: 중부 고원 — 베트남·참파 왕조의 직접 지배 밖(자라이·에데 등 고원 사람들, 조공만). E2 비움(1767~1888·다를락 1767~1892)과 이음
const VT_voids = () => [V(1293, E3_END, ...VT_HIGHLANDS)];
// ── E3 VT 끝 ──

// ── E3 LO 라오 (조각 E3_LO_IDS: 라오스 17·이산 20·라타나키리 KH-16·스퉁트렝 KH-19, 구현 E3-LO): 최상위 이름은 LO_ ──
// 항목: lan-xang(새 — 이 칸 글), luang-prabang-kingdom·vientiane-kingdom·champasak-kingdom(E2 항목을 같은 id로 1707·1713~1766 — 이 칸 글). 이 칸 조각에 khmer-empire·ayutthaya-kingdom(SC 정의)도 칠함
// E3 창구 ② Q5(이산 오른쪽 기슭 1293~1430 khmer-empire, 1431~1706 lan-xang, 코랏은 아유타야 — E2 1767 모양과 이음)·기본값 D12(메인이 고침 — 후아판·시앙쿠앙 1353~1706 란쌍, 1707~ E2 1767과 같은 두 왕국 색)
// 새 칼선 없음: 란쌍·크메르·아유타야·세 왕국 사이 경계는 사료가 지금 주 경계보다 촘촘하지 않아 주 경계로 묶음(E2 LO와 같은 묶음 — 조각 id만 다시 적음)
const LO_BOUNDS = [];
const LO_OUTSIDE = [];
// 루앙프라방 쪽 북부(루앙프라방·우돔사이·퐁살리·루앙남타·보께오) — E2 LO_LP_LEFT와 같은 조각
const LO_LP_LEFT = ['LA-LP', 'LA-OU', 'LA-PH', 'LA-LM', 'LA-BK'];
// 비엔티안 쪽 왼쪽 기슭(비엔티안 수도·비엔티안도·볼리캄사이·캄무안) — E2 LO_VT_LEFT
const LO_VT_LEFT = ['LAO-3283', 'LAO-3284', 'LA-BL', 'LA-KH'];
// 이산 북·동북(러이·농카이·븡깐·우돈타니·농부아람푸·사꼰나콘·나콘파놈) — E2 LO_VT_RIGHT
const LO_VT_RIGHT = ['TH-42', 'TH-43', 'TH-38', 'TH-41', 'TH-39', 'TH-47', 'TH-48'];
// 하라오(사완나켓·살라완·세꽁·아타프·라타나키리) — E2 LO_CP_LEFT
const LO_CP_LEFT = ['LA-SV', 'LA-SL', 'LA-XE', 'LA-AT', 'KH-16'];
// 이산 동남(우본·야소톤·암낫짜런·묵다한·로이엣·마하사라캄·깔라신) — E2 LO_CP_RIGHT
const LO_CP_RIGHT = ['TH-34', 'TH-35', 'TH-37', 'TH-49', 'TH-45', 'TH-44', 'TH-46'];
// 코랏 고원 서남(나콘랏차시마·부리람·수린·시사껫·차이야품·콘깬) — E2 LO_SIAM
const LO_SIAM = ['TH-30', 'TH-31', 'TH-32', 'TH-33', 'TH-36', 'TH-40'];
{
  const all = [...LO_LP_LEFT, 'LA-XA', 'LA-HO', 'LA-XI', ...LO_VT_LEFT, ...LO_VT_RIGHT, ...LO_CP_LEFT, 'LA-CH', 'KH-19', ...LO_CP_RIGHT, ...LO_SIAM];
  if (all.length !== E3_LO_IDS.length || new Set(all).size !== all.length || all.some((id) => !E3_LO_IDS.includes(id))) throw new Error('southeast-asia early-modern: LO 칸 조각 묶음이 E3_LO_IDS와 다름');
}
// 1353 파응움이 루앙프라방(무앙 사와)에서 란쌍을 세움(후아판·무앙푸안도 이때 듦 — D12 고친 기본값), 1357 비엔티안과 그 남쪽·코랏 고원 북부까지 넓힘(R-A 1-3),
//   1707 루앙프라방·비엔티안으로 갈라짐, 1713 남쪽이 참파삭 왕국으로 갈라짐(https://en.wikipedia.org/wiki/Kingdom_of_Champasak)
own([...LO_LP_LEFT, 'LA-XA', 'LA-HO'], [[1293, null], [1353, 'lan-xang'], [1707, 'luang-prabang-kingdom']]);
own(['LA-XI'], [[1293, null], [1353, 'lan-xang'], [1707, 'vientiane-kingdom']]); // 무앙푸안: 대월에도 조공한 양속 공국 — E2와 같이 비엔티안에 조공한 공국으로 보아 비엔티안 색
own([...LO_VT_LEFT, ...LO_VT_RIGHT], [[1293, null], [1357, 'lan-xang'], [1707, 'vientiane-kingdom']]);
own(LO_CP_LEFT, [[1293, null], [1357, 'lan-xang'], [1707, 'vientiane-kingdom'], [1713, 'champasak-kingdom']]);
// 크메르 몫: 이산 남부(문강·치강 유역 — 피마이·파놈룽의 코랏 고원 서남과 우본 쪽)와 왓푸(참파삭)·스퉁트렝 — 1431 앙코르를 버린 해에 끝남(SC 결과 노트 2-2, https://en.wikipedia.org/wiki/Nakhon_Ratchasima_province 연표)
own(['LA-CH', 'KH-19', ...LO_CP_RIGHT], [[1293, 'khmer-empire'], [1431, 'lan-xang'], [1707, 'vientiane-kingdom'], [1713, 'champasak-kingdom']]);
// 코랏은 1431부터 아유타야(창구 ② Q5 문장 — 사료의 1664와 어긋남은 결과 노트 6절 질문 초안), 1767~1769 비움은 E2
own(LO_SIAM, [[1293, 'khmer-empire'], [1431, 'ayutthaya-kingdom']]);
// 비운 땅: 란쌍이 서기 전 라오 땅의 무앙들
const LO_voids = () => [
  V(1293, 1353, ...LO_LP_LEFT, 'LA-XA'), // 무앙사와(루앙프라방) 등 라오 소국 — 란쌍 전
  V(1293, 1353, 'LA-HO', 'LA-XI'), // 대월·란쌍 양속 이전 — 무앙푸안 공국
  V(1293, 1357, ...LO_VT_LEFT, ...LO_VT_RIGHT, ...LO_CP_LEFT), // 비엔티안 평야·이산 북부·하라오의 무앙들 — 크메르가 물러난 뒤 란쌍 전(1293 뒤 크메르 지배 근거 없음)
];
// ── E3 LO 끝 ──

// ── E3 M1 말레이 반도·수마트라·보르네오 북부·필리핀 (조각 E3_M1_IDS: 말레이시아 16·싱가포르 5·브루나이 4·필리핀 118·수마트라 10, 구현 E3-M1): 최상위 이름은 M1_ ──
// 항목: malacca-sultanate·portuguese-malacca(새 — 이 칸 글), kedah-perlis·johor-sultanate·perak-sultanate·selangor-negeri-sembilan·kelantan-sultanate·terengganu-sultanate·aceh-sultanate·brunei(E1 항목)·
//   sulu-sultanate·spanish-philippines(E2 항목)를 같은 id로 1766까지 — 이 칸 글. 이 칸 조각에 voc(말라카 1641~·람풍 1752~)·banten-sultanate(람풍 1527~1751) — I1 정의 — 도 칠함
// E3 창구 ② Q-1(E2가 비운 수마트라는 비움 이어 감)·Q-2(말라카 술탄국 1446 반도 핵심 다섯·1470 파항, 수마트라·리아우 비움)·Q-P(스페인령 필리핀 1565·1571·1583·1596 넷, 모로·코르디예라·팔라완 1767 앞 비움)·Q-A(아체 1293~1495 비움)·Q-B(브루나이 1485·술루 사바 동쪽 1658 → 창구 ③ M-Q1로 1704)
import { BP_CUT_SABAH as M1_SABAH } from './cuts-e2.mjs';
const M1_BOUNDS = []; // 사바 나눔(E2 BP_CUT_SABAH 별칭)은 시대 내내 같은 모양이라 표 경계 해가 필요 없음 — 나머지는 조각 통째, 주인만 바뀜
const M1_OUTSIDE = [];
const M1_IDS = new Set(E3_M1_IDS);
const M1_own = (ids, line) => {
  for (const id of ids) if (!M1_IDS.has(id)) throw new Error(`southeast-asia early-modern: M1 칸 조각이 아님 ${id}`);
  own(ids, line);
};
// ── 말레이 반도·싱가포르 (E2 MI 1767 모양과 같은 조각 묶음) ──
// 크다·프를리스·페낭: 1293 앞부터 크다 술탄국(from 1136 — 그 앞은 E4). 17세기 초 아체의 크다 정복은 되돌려져 칠하지 않음, 시암 종주는 관계로(결정 10)
M1_own(['MY-02', 'MY-09', 'MY-07'], [[E3_START, 'kedah-perlis']]);
// 말라카: 1400 무렵 파라메스와라가 세운 항구(앞은 작은 어촌 — 비움) → 1511-08 포르투갈 점령 → 1641-01 VOC 점령(E2 1767 voc와 이음)
M1_own(['MY-04'], [[E3_START, null], [1400, 'malacca-sultanate'], [1511, 'portuguese-malacca'], [1641, 'voc']]);
// 반도 핵심(Q-2): 1446 무자파르 샤 때 딘딩스~조호르가 말라카 땅. 1511~1527 술탄이 빈탄·캄파르로 옮겨 다스림을 이음, 1528 페락·조호르로 갈라짐
M1_own(['MY-08'], [[E3_START, null], [1446, 'malacca-sultanate'], [1528, 'perak-sultanate']]); // 페락
M1_own(['MY-01', ...idsOf('SGP')], [[E3_START, null], [1446, 'malacca-sultanate'], [1528, 'johor-sultanate']]); // 조호르·싱가포르(513 km² — 싱가푸라 1299~1398은 글)
// 슬랑오르(+쿠알라룸푸르·푸트라자야)·느그리슴빌란: 1528~1765 조호르 땅, 1766 라자 루무의 슬랑오르 술탄국(E2 1767 묶음과 같게 — 느그리슴빌란 6,847 km²는 1만 미만 근사)
M1_own(['MY-10', 'MY-14', 'MY-16', 'MY-05'], [[E3_START, null], [1446, 'malacca-sultanate'], [1528, 'johor-sultanate'], [1766, 'selangor-negeri-sembilan']]);
// 파항(Q-2): 1470 무렵 만수르 샤가 아들 무함마드 샤를 술탄으로 앉혀 말라카 땅, 1528부터 조호르 색(E2와 같게 — 1623 조호르와 왕가 합침은 결과 노트 질문 초안). 아체 점령 1617~1623은 안 칠함
M1_own(['MY-06'], [[E3_START, null], [1470, 'malacca-sultanate'], [1528, null], [1623, 'johor-sultanate']]);
M1_own(['MY-03'], [[E3_START, null], [1760, 'kelantan-sultanate']]); // 클란탄(B11 — 1506 말라카의 정복은 5년 남짓이라 안 칠함)
M1_own(['MY-11'], [[E3_START, null], [1708, 'terengganu-sultanate']]); // 트렝가누(B11)
// ── 수마트라 ──
M1_own(['ID-AC'], [[E3_START, null], [1496, 'aceh-sultanate']]); // 아체(Q-A — 1293~1495는 사무데라 파사이 등 소국 병립이라 비움)
M1_own(['ID-LA'], [[E3_START, null], [1527, 'banten-sultanate'], [1752, 'voc']]); // 람풍: 반튼 술탄국 땅, 1752 VOC가 넘겨받음(E2 1767 voc와 이음)
// 수마트라 나머지 여덟(Q-1 — E2가 비운 땅을 비움 이어 감): 줄을 적지 않아 주인 null(voids에 이유)
// ── 보르네오 북부 ──
// 사라왁·라부안(Q-B): 1485 볼키아 즉위부터 브루나이의 바닷가 지배(E2 1767 모양 — 사라왁 통째, 내륙은 이름뿐)
M1_own(['MY-13', 'MY-15'], [[E3_START, null], [1485, 'brunei']]);
// 사바(Q-B): 서쪽(E2 BP_CUT_SABAH 안)은 1485부터 브루나이, 동쪽은 1485 브루나이 → 1704 술루(내전을 도운 보답으로 넘겨받음 — 창구 ③ M-Q1, 1658·1673으로 적는 자료도 있음)
ownSplit('M1_사바', ['MY-12'], [['서', M1_SABAH]], '동', {
  서: [[E3_START, null], [1485, 'brunei']],
  동: [[E3_START, null], [1485, 'brunei'], [1704, 'sulu-sultanate']],
});
M1_own(idsOf('BRN'), [[E3_START, null], [1368, 'brunei']]); // 브루나이(1368 무렵 무함마드 샤의 개종 — 지도 첫 해)
// ── 필리핀 118조각(Q-P — 정복 해 단계 넷, 모로·코르디예라·팔라완은 E2 법적 기준대로 1767부터) ──
// 비사야(1565 세부 정착, 1569 파나이 — 1만 미만 차): 파나이·네그로스·세부·보홀·레이테·사마르·시키호르 등
const M1_PH_VISAYAS = ['PH-AKL', 'PH-ANT', 'PH-BCD', 'PH-BIL', 'PH-BOH', 'PH-CAP', 'PH-EAS', 'PH-GUI', 'PH-LAP', 'PH-MDE', 'PH-NEC', 'PH-NER', 'PH-NSA', 'PH-SIG', 'PH-SLE', 'PH-WSA',
  'PHL-2514', 'PHL-2529', 'PHL-2583', 'PHL-5522', 'PHL-5526', 'PHL-5534', 'PHL-5535'];
// 루손 중·남부·비콜·민도로(1571 마닐라, 1571~1572 살세도의 팜팡가·일로코스·팡가시난 정복까지 한 단계): 메트로 마닐라·중부 루손·칼라바르손·비콜·민도로·마스바테·롬블론·마린두케·일로코스·팡가시난
const M1_PH_LUZON = ['PHL-5542', 'PHL-5543', 'PHL-5544', 'PHL-5545', 'PHL-5546', 'PHL-5547', 'PHL-5549', 'PHL-5550', 'PHL-5551', 'PHL-5552', 'PHL-5553', 'PHL-5554', 'PHL-5555', 'PHL-5556', 'PHL-5557', 'PHL-5558', 'PHL-5559',
  'PH-BAN', 'PH-BTG', 'PH-BUL', 'PH-CAV', 'PH-LAG', 'PH-RIZ', 'PH-NUE', 'PH-TAR', 'PHL-2558', 'PHL-5538', 'PHL-2560', 'PHL-5540', 'PHL-2572', 'PHL-5560', 'PH-AUR',
  'PH-ALB', 'PH-CAN', 'PH-CAT', 'PH-SOR', 'PHL-2538', 'PHL-5536', 'PH-MAS', 'PH-MAD', 'PH-ROM', 'PH-MDC', 'PH-MDR', 'PH-ILN', 'PH-ILS', 'PH-LUN', 'PHL-2562', 'PHL-5541'];
// 북루손(1581 누에바세고비아, 1583 카가얀 주): 카가얀·이사벨라·누에바비스카야·키리노·바타네스
const M1_PH_NORTH = ['PH-CAG', 'PHL-2550', 'PHL-5537', 'PH-NUV', 'PH-QUI', 'PH-BTN'];
// 민다나오 북동·카라가(1596 부투안·카라가 원정, 1609 탄닥 요새): 아구산·수리가오·미사미스·카미긴·부키드논(내륙 8,916 km²는 1만 미만 근사)·라나오 북부·일리간(1642 일리간 요새 — 미사미스 옥시덴탈이 떨어지지 않게 해안을 이음, 1만 미만)
const M1_PH_CARAGA = ['PH-AGS', 'PH-SUN', 'PH-SUR', 'PHL-2587', 'PHL-5532', 'PH-CAM', 'PH-MSC', 'PHL-2595', 'PHL-5531', 'PH-BUK', 'PHL-2573', 'PHL-5530'];
// 모로(미국 모로 주 1903~1913의 다섯 땅 — 술루 군도·코타바토·라나오 남부·다바오·삼보앙가 반도): 마긴다나오·술루 술탄국과 라나오 술탄국 땅, 스페인은 삼보앙가 요새(1635~1662·1718~)뿐
const M1_PH_MORO = ['PH-SLU', 'PH-TAW', 'PH-BAS', 'PH-MAG', 'PHL-2579', 'PHL-5527', 'PH-SUK', 'PH-SAR', 'PHL-2599', 'PHL-5529', 'PH-LAS',
  'PH-DAS', 'PH-DAO', 'PH-COM', 'PHL-2591', 'PHL-5528', 'PHL-2520', 'PH-ZAS', 'PH-ZSI', 'PHL-4932'];
const M1_PH_CORDILLERA = ['PH-ABR', 'PH-APA', 'PHL-2559', 'PH-IFU', 'PH-KAL', 'PH-MOU', 'PHL-5539']; // 코르디예라 산지(이고로트 땅)
const M1_PH_PALAWAN = ['PHL-2534', 'PHL-5533']; // 팔라완(술루 술탄국이 1705 스페인에 넘김 — 남부는 실효 지배 밖, 칼라미안 제도는 1만 미만)
{
  const all = [...M1_PH_VISAYAS, ...M1_PH_LUZON, ...M1_PH_NORTH, ...M1_PH_CARAGA, ...M1_PH_MORO, ...M1_PH_CORDILLERA, ...M1_PH_PALAWAN];
  const phl = idsOf('PHL');
  if (all.length !== phl.length || new Set(all).size !== all.length || all.some((id) => !phl.includes(id))) throw new Error('southeast-asia early-modern: M1 필리핀 묶음이 PHL 118조각과 다름');
}
M1_own(M1_PH_VISAYAS, [[E3_START, null], [1565, 'spanish-philippines']]);
M1_own(M1_PH_LUZON, [[E3_START, null], [1571, 'spanish-philippines']]);
M1_own(M1_PH_NORTH, [[E3_START, null], [1583, 'spanish-philippines']]);
M1_own(M1_PH_CARAGA, [[E3_START, null], [1596, 'spanish-philippines']]);
// 모로·코르디예라·팔라완: 줄을 적지 않아 1766까지 주인 null(voids — E2가 1767부터 법적 주권으로 칠함). 1762~1764 영국의 마닐라 점령은 되돌려져 안 칠함(B16)
const M1_voids = () => [
  V(E3_START, 1400, 'MY-04'), // 말라카: 파라메스와라가 항구를 세우기 전(1400년 무렵) — 작은 어촌
  V(E3_START, 1446, 'MY-01', 'MY-05', 'MY-08', 'MY-10', 'MY-14', 'MY-16', ...idsOf('SGP')), // 반도 남·서부: 시암·마자파힛에 조공하던 작은 강어귀 소국과 싱가푸라(1299~1398) — 말라카가 다스리기(1446년 무자파르 샤) 전
  V(E3_START, 1470, 'MY-06'), // 파항: 시암에 조공하던 옛 파항 땅 — 말라카가 술탄을 앉히기(1470년 무렵) 전
  V(1528, 1623, 'MY-06'), // 파항: 말라카 함락 뒤 파항 술탄국 — 독자 왕계, 1623 조호르와 합침(위키백과 Pahang Sultanate, 합치기가 기본값 고침 — M1 결과 노트 6절 나)
  V(E3_START, 1708, 'MY-11'), // 트렝가누: 말라카·조호르·파타니에 딸린 바닷가 땅 — 술탄국이 서기(1708년) 전
  V(E3_START, 1760, 'MY-03'), // 클란탄: 여러 왕족이 나눠 다스린 땅(1506 말라카 정복은 짧게 끝남) — 롱 유누스가 하나로 묶기(1760년 무렵) 전
  V(E3_START, 1496, 'ID-AC'), // 아체: 사무데라 파사이·페디르·라무리 소국 병립 — 아체 술탄국이 서기(1496년 무렵) 전
  V(E3_START, 1527, 'ID-LA'), // 람풍: 순다 왕국 변방의 토착 족장 땅 — 반튼 술탄국이 서기(1527년) 전
  V(E3_START, E3_END, 'ID-SU', 'ID-SB', 'ID-RI', 'ID-JA', 'ID-SS', 'ID-BE', 'ID-BB', 'ID-KR'), // 수마트라 나머지: 토착 소국(팔렘방·잠비·파가루융·시악·인드라기리 등) — 직접 지배 범위가 조각보다 훨씬 작음(E2 비움과 이음)
  V(E3_START, 1485, 'MY-12', 'MY-13', 'MY-15'), // 사바·사라왁·라부안: 강어귀마다 선 말레이·다야크 족장 땅 — 브루나이가 넓히기(1485년 볼키아 즉위) 전
  V(E3_START, 1368, ...idsOf('BRN')), // 브루나이: 보르네오 북쪽 항구 소국(포니) — 술탄국이 서기(1368년 무렵) 전
  V(E3_START, 1565, ...M1_PH_VISAYAS), // 비사야: 세부·파나이 등 항구 소국(라자국) — 스페인 첫 정착(1565년 세부) 전
  V(E3_START, 1571, ...M1_PH_LUZON), // 루손 중·남부: 마닐라·톤도 등 항구 소국 — 스페인의 마닐라 점령(1571년) 전
  V(E3_START, 1583, ...M1_PH_NORTH), // 북루손: 카가얀 골짜기의 토착 사회 — 스페인의 카가얀 정복(1581~1583년) 전
  V(E3_START, 1596, ...M1_PH_CARAGA), // 민다나오 북동: 부투안 등 토착 소국 — 스페인의 카라가 원정(1596년) 전
  V(E3_START, E3_END, ...M1_PH_MORO, ...M1_PH_CORDILLERA, ...M1_PH_PALAWAN), // 모로(마긴다나오·술루·라나오 술탄국 땅)·코르디예라(이고로트 땅)·팔라완: 스페인의 실효 지배 밖 — E2가 1767부터 법적 주권으로 칠함
];
// ── E3 M1 끝 ──

// ── E3 I1 자와·칼리만탄·술라웨시·말루쿠·티모르 (조각 E3_I1_IDS: 인도네시아 23(수마트라 10 뺌)·동티모르 13, 구현 E3-I1): 최상위 이름은 I1_ ──
// 항목: majapahit·sunda-kingdom·demak-sultanate·pajang-sultanate·mataram-sultanate·banten-sultanate·gowa-tallo·ternate-sultanate·banjar-sultanate(새 — 이 칸 글),
//   voc(E2 항목을 같은 id로 1605~1766 — 이 칸 글, M1 몫 말라카·람풍 버전 포함)·portuguese-timor(E1 항목을 같은 id로 1702~1766 — 이 칸 글)
// E3 창구 ② Q-1(E2가 비운 칼리만탄·술라웨시는 비움 이어 감, E2 VOC 첫 해와 바로 이어지는 반자르·반튼·마타람 후계는 칠함)·기본값 B1~B17(R-B 5절 — 마자파힛은 동자와+발리만, 끝 1527)
const I1_BOUNDS = []; // 모든 땅이 조각 통째(칼선 0)라 주인만 바뀌는 해 — 표 경계 해가 필요 없음
const I1_OUTSIDE = [];
const I1_IDS = new Set(E3_I1_IDS);
const I1_own = (ids, line) => {
  for (const id of ids) if (!I1_IDS.has(id)) throw new Error(`southeast-asia early-modern: I1 칸 조각이 아님 ${id}`);
  own(ids, line);
};
// ── 자와·발리 (결정 10 — 직접 지배 땅만, 기본값 B1~B8) ──
// 동자와: 1293-11 라덴 위자야 즉위(마자파힛, 도읍 트로울란) · 1527 드막이 다하(케디리)를 쳐 마자파힛 끝 · 1568 파장 · 1586 마타람 · 1743 파쿠부워노 2세가 북해안과 동자와를 VOC에 넘김
I1_own(['ID-JI'], [[E3_START, 'majapahit'], [1527, 'demak-sultanate'], [1568, 'pajang-sultanate'], [1586, 'mataram-sultanate'], [1743, 'voc']]);
// 발리(8,232 km² — 1만 미만): 1343 가자 마다의 정복 뒤 마자파힛 땅(1293부터 근사), 1527 뒤 겔겔 등 발리 왕국 땅이라 비움(E2 1844 앞 비움과 이음)
I1_own(['ID-BA'], [[E3_START, 'majapahit'], [1527, null]]);
// 중자와·욕야카르타: 마자파힛 직접 지배 밖(B1) → 1478 드막 · 1568 파장 · 1586 마타람 · 1755 기얀티 조약(두 토후국은 VOC 색 — E2 기본값 7과 같음)
I1_own(['ID-JT', 'ID-YO'], [[E3_START, null], [1478, 'demak-sultanate'], [1568, 'pajang-sultanate'], [1586, 'mataram-sultanate'], [1755, 'voc']]);
// 서자와: 순다 왕국(파자자란) → 1579 반튼이 파쿠안 파자자란을 무너뜨림(체리본·수메당 소국 땅이라 비움) → 1620 마타람의 프리앙안 → 1680 VOC(체리본 보호·프리앙안 할양)
I1_own(['ID-JB'], [[E3_START, 'sunda-kingdom'], [1579, null], [1620, 'mataram-sultanate'], [1680, 'voc']]);
// 반튼: 순다 왕국 → 1527 반튼 술탄국(하사누딘) → 1752 VOC(술탄국이 VOC의 봉토가 됨 — M1 칸의 람풍과 같은 해)
I1_own(['ID-BT'], [[E3_START, 'sunda-kingdom'], [1527, 'banten-sultanate'], [1752, 'voc']]);
// 자카르타(1,081 km² — 1만 미만): 순다 칼라파 → 1527 자야카르타(반튼 쪽) → 1619 바타비아(VOC)
I1_own(['ID-JK'], [[E3_START, 'sunda-kingdom'], [1527, 'banten-sultanate'], [1619, 'voc']]);
// ── 소순다·칼리만탄·술라웨시·말루쿠 (E3 창구 ② Q-1 — E2가 비운 땅은 비움을 이어 감, E2 VOC 첫 해와 이어지는 소국과 VOC 단계만 칠함) ──
I1_own(['ID-NB'], [[E3_START, null], [1669, 'voc']]); // 서누사틍가라: 1669-12-08 비마가 VOC에 항복(숨바와 여러 왕국이 VOC의 종속 동맹국 — E2 1767 voc와 이음)
I1_own(['ID-NT'], [[E3_START, null], [1653, 'voc']]); // 동누사틍가라: 1653 쿠팡에 VOC 거점(1652/1653 갈림 → 1653)
// 남·중칼리만탄: 1526-09-24 수리안샤가 이슬람으로 개종하며 반자르 술탄국을 세움(처음엔 드막에 조공), 다야크 내륙은 명목
I1_own(['ID-KS', 'ID-KT'], [[E3_START, null], [1526, 'banjar-sultanate']]);
I1_own(['ID-SN'], [[E3_START, null], [1512, 'gowa-tallo'], [1667, 'voc']]); // 남술라웨시: 1512 무렵 고와·탈로 연합(1611 보네 정복은 조각 안) → 1667-11-18 봉가야 조약
I1_own(['ID-SR', 'ID-GO'], [[E3_START, null], [1667, 'voc']]); // 서술라웨시(만다르)·고론탈로: 고와의 속령이 봉가야 조약(1667)으로 VOC에 넘어감 — E2 1767과 이음
I1_own(['ID-SA'], [[E3_START, null], [1679, 'voc']]); // 북술라웨시: 1679 말루쿠 총독 파트브루허와 미나하사 족장들의 조약(마나도)
I1_own(['ID-MA'], [[E3_START, null], [1605, 'voc']]); // 말루쿠: 1605-02 VOC가 암본의 포르투갈 요새를 빼앗음(반다 1621은 글)
I1_own(['ID-MU'], [[E3_START, 'ternate-sultanate'], [1683, 'voc']]); // 북말루쿠: 트르나테 술탄국(티도레 몫은 조각 안 — mapNote) → 1683 VOC 종속
I1_own(idsOf('TLS'), [[E3_START, null], [1702, 'portuguese-timor']]); // 티모르 동쪽·오에쿠시: 웨할리·손바이 등 토착 왕국 → 1702 리파우에 포르투갈 총독(통째 — E2 1767과 같음)
// 줄을 적지 않은 조각(서·동칼리만탄 KB·KI, 중·동남술라웨시 ST·SG, 서뉴기니 PA·PB)은 시대 내내 주인 null — 아래 voids
const I1_voids = () => [
  V(E3_START, 1478, 'ID-JT', 'ID-YO'), // 중자와·욕야카르타: 마자파힛의 직접 지배 밖인 자와 소국들 땅 — 드막 술탄국이 선 해(1478년) 전
  V(1527, E3_END, 'ID-BA'), // 발리: 겔겔(뒤에 클룽쿵 등) 발리 왕국들 땅 — 마자파힛이 끝난 뒤(E2 1844 앞 비움과 이음)
  V(1579, 1620, 'ID-JB'), // 서자와: 파자자란이 무너진 뒤 체리본·수메당 라랑안 같은 소국 땅 — 마타람이 프리앙안을 차지한 해(1620년) 전
  V(E3_START, 1669, 'ID-NB'), // 서누사틍가라: 롬복·숨바와의 토착 왕국들 땅 — 비마가 VOC와 조약을 맺은 해(1669년) 전
  V(E3_START, 1653, 'ID-NT'), // 동누사틍가라: 플로레스·숨바·티모르 서부의 토착 왕국들 땅 — VOC가 쿠팡에 자리 잡은 해(1653년) 전
  V(E3_START, 1526, 'ID-KS', 'ID-KT'), // 남·중칼리만탄: 느가라 다하와 다야크 사람들 땅 — 반자르 술탄국이 선 해(1526년) 전
  V(E3_START, E3_END, 'ID-KB', 'ID-KI'), // 서칼리만탄: 수카다나·삼바스·란닥 등 소국 / 동·북칼리만탄: 쿠타이·파시르·베라우 등 소국 땅 — E2의 1779·1844 앞 비움과 이음(창구 ② Q-1)
  V(E3_START, 1512, 'ID-SN'), // 남술라웨시: 루우·보네와 마카사르 소국들 땅 — 고와·탈로 연합(1512년 무렵) 전
  V(E3_START, 1667, 'ID-SR', 'ID-GO'), // 서술라웨시: 만다르 소국 / 고론탈로: 고론탈로·림보토 왕국 땅 — 봉가야 조약(1667년) 전
  V(E3_START, 1679, 'ID-SA'), // 북술라웨시: 미나하사 사람들과 볼랑몽온도우 왕국 땅 — 미나하사 조약(1679년) 전
  V(E3_START, E3_END, 'ID-ST', 'ID-SG'), // 중술라웨시: 팔루·바나와 등 카일리 왕국 / 동남술라웨시: 코나웨·부톤 등 왕국 땅 — E2의 1824·1858 앞 비움과 이음(창구 ② Q-1)
  V(E3_START, 1605, 'ID-MA'), // 말루쿠: 히투·암본·반다 등 토착 땅(포르투갈 요새는 1만 km² 미만) — VOC가 암본을 빼앗은 해(1605년) 전
  V(E3_START, E3_END, 'ID-PA', 'ID-PB'), // 서뉴기니: 파푸아 사람들의 땅(트르나테·티도레의 해안 조공만 — 결정 10) — E2 1848 앞 비움과 이음
  V(E3_START, 1702, ...idsOf('TLS')), // 티모르 동쪽·오에쿠시: 웨할리·손바이 등 토착 왕국 땅 — 포르투갈 총독이 리파우에 자리 잡은 해(1702년) 전
];
{
  const left = E3_I1_IDS.filter((id) => !lines.has(id) && !['ID-KB', 'ID-KI', 'ID-ST', 'ID-SG', 'ID-PA', 'ID-PB'].includes(id));
  if (left.length) throw new Error(`southeast-asia early-modern: I1 칸 조각에 주인 줄이 없음 ${left.join(', ')}`);
}
// ── E3 I1 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([E3_START, ...BM_BOUNDS, ...SC_BOUNDS, ...VT_BOUNDS, ...LO_BOUNDS, ...M1_BOUNDS, ...I1_BOUNDS, E3_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== E3_START || BOUNDS.at(-1) !== E3_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`southeast-asia early-modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${E3_START}~${E3_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`southeast-asia early-modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`southeast-asia early-modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`southeast-asia early-modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`southeast-asia early-modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`southeast-asia early-modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== E3_END) throw new Error(`southeast-asia early-modern: 마지막 표의 끝이 ${joined.TO} (${E3_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간을 prevPieces 구간(뺄 도형 목록이 같은 구간)으로 다시 나누고, 그 구간에서 이 나라 땅과 실제로 겹치는 도형(중국 쪽 띠·명 교지)만 뺀다.
// 겹치는 도형 목록이 같은 구간은 다시 잇는다(colonial.mjs와 같은 줄 — 1293~1766은 yuan·ming·qing 띠가 해마다 바뀌어 구간이 여럿으로 나뉠 수 있음, 띠 넓이가 같으면 한 구간)
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
// 권역 밖 땅(위 '권역 밖 땅'): 칸의 <칸>_OUTSIDE 줄을 그 나라 버전에 합친다. 버전 해 구간을 권역 밖 땅의 from·to로 다시 나누고, 겹치는 구간에서 U로 합침
const OUTSIDE = [...BM_OUTSIDE, ...SC_OUTSIDE, ...VT_OUTSIDE, ...LO_OUTSIDE, ...M1_OUTSIDE, ...I1_OUTSIDE];
for (const o of OUTSIDE) {
  if (!Array.isArray(o) || o.length !== 4 || !Number.isInteger(o[0]) || !Number.isInteger(o[1]) || !(E3_START <= o[0] && o[0] < o[1] && o[1] <= E3_END) || typeof o[2] !== 'string' || !Array.isArray(o[3]) || !o[3].length) {
    throw new Error(`southeast-asia early-modern: 권역 밖 땅 줄 모양이 틀림 — [from, to(미포함), 나라 id, 멀티폴리곤], 해는 ${E3_START}~${E3_END} 안`);
  }
}
const addOutside = (id, list) => {
  const extra = OUTSIDE.filter(([, , o]) => o === id);
  if (!extra.length) return list;
  const cuts = [...new Set([...list.flatMap(([f, t]) => [f, t]), ...extra.flatMap(([f, t]) => [f, t])])].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const [f, t] = [cuts[i], cuts[i + 1]];
    const bi = list.findIndex(([lf, lt]) => lf <= f && t <= lt);
    const adds = extra.map((e, k) => [e, k]).filter(([[ef, et]]) => ef <= f && t <= et);
    if (bi < 0 && !adds.length) continue;
    const key = `${bi}|${adds.map(([, k]) => k).join(',')}`;
    const last = out.at(-1);
    if (last && last.key === key && last.t === f) { last.t = t; continue; }
    out.push({ f, t, key, bi, adds: adds.map(([e]) => e[3]) });
  }
  return out.map(({ f, t, bi, adds }) => [f, t, bi < 0 ? (adds.length > 1 ? U(...adds) : adds[0]) : adds.length ? U(list[bi][2], ...adds) : list[bi][2]]);
};
const segIds = new Set([...Object.keys(joined.segments), ...OUTSIDE.map(([, , id]) => id)]);
const versions = Object.fromEntries([...segIds].map((id) => [id, addOutside(id, (joined.segments[id] ?? []).flatMap(cutPrev))]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...BM_voids(), ...SC_voids(), ...VT_voids(), ...LO_voids(), ...M1_voids(), ...I1_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 384개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅·중국 쪽 띠·명 교지를 합쳐 빈 곳이 없어야 한다(권역 밖 땅은 구역 밖).
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역의 끝은 E3_END(1767 — 그 뒤는 colonial.mjs의 '동남아 근대' 구역). 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([E3_START, E3_END, ...voids.flatMap(([f, t]) => [f, t ?? E3_END]).filter((y) => E3_START < y && y < E3_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(colonial.mjs와 같음 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? E3_END)).map(([, , g]) => g);
  return [{ name: `동남아 근세 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void geomOfUnit; void B; // 여섯 칸이 쓰지 않는 이름 경고 막기(E4가 쓰면 지움)

export const era = {
  name: 'early-modern',
  versions,
  gapZones,
  voids,
  source: SE_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳 — colonial.mjs·modern.mjs와 같은 값이라야 같은 나라 id(konbaung-dynasty·voc 등)를 이어 붙일 수 있다(joinEras). 문구를 바꾸면 E1·E2 나라 geojson이 모두 바뀐다
};
