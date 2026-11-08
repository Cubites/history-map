// southeast-asia 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1900~현재: 식민 지배와 독립 뒤 나라들 (E1, docs/southeast-asia/00-scope.md 2절 시대 단계 표)
// 짝 항목 파일: data/entities/southeast-asia-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia/의 다른 도우미 모듈. areas/southeast-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/southeast-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다(남베트남 SOUTH_VIETNAM은 E1 뼈대가 shapes.mjs로 옮김).
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/southeast-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 동남아 E1 짜임 안내 (E1 뼈대 2026-11-08 — 근거: docs/southeast-asia/00-scope.md 2·3·5·10절, 운영자 결정 1~10, 기본값 30건, 지시문 e1/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 두 구역(new-guinea-interior·borneo-interior) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습, 조약이 있으면 그 해, 없으면 실효 지배가 굳은 해. 원정·되돌려진 점령은 칠하지 않음(일본 점령 1941/42~1945는 관계만 — 결정 3).
//   새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만. 이름·정체만 바뀌는 해(시암→타이 1939, 버마→미얀마 1989, 필리핀 1935, 캄보디아 국호들 등)는 새 버전이 아니다 — 항목 글로.
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-e1.mjs E1_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── E1 W …'·CL·CV·SM·SB·SI)와 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 W_·CL_·CV_·SM_·SB_·SI_, import도 별칭(예: CL_X), ownSplit 묶음 이름도 앞머리(예: 'CL_참파삭1904').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
//   다른 칸 항목을 주인으로 쓰는 것은 된다(예: CL 칸이 라오스·캄보디아 조각에 thailand 1900~1906·1941~1945 — 항목 글은 정의 칸, 문안은 결과 노트 9절).
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(E1_START·E1_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 E1_START(1900)부터, 해는 늘어난다. 단위마다 여러 번 이어 적을 수 있다(뒤 줄 첫 해가 앞 줄의 마지막 해보다 뒤).
//   줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다. 주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄)이거나 다른 도형이 덮는 땅.
// 앞 권역 나라 늘리기: 권역 파일 EXTENDABLE의 나라(british-raj)를 주인 id로 쓰면 joinEras가 그 나라 버전에 더한다. 그 밖의 앞 권역 나라(uk·france·japan·prc 등)를 주인으로 쓰면 생성기가 멈춘다.
// 다른 도형 빼기는 공통 줄이 한다: 버전을 만들 때 prev.mjs의 prevPieces가 해 구간마다 돌려주는 도형(중국 쪽 qing·roc·prc 손 도형 띠 1,414 km² — 모든 해,
//   남베트남 손그림 1955~1975)을 그 나라 땅에서 뺀다. 칸은 빼지 않는다. 남베트남 손그림 밖에 남는 남부 베트남 조각 부스러기는 CV 칸이 주인 null + voids로 둔다.
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(동남아 첫판·E1 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SE_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';
import { deg2, prevPieces } from './prev.mjs';
import { E1_W_IDS, E1_CL_IDS, E1_CV_IDS, E1_SM_IDS, E1_SB_IDS, E1_SI_IDS } from './cuts-e1.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('modern');

const E1_START = 1900; // 이 시대 파일의 첫 해(1900년 말 모습). 그 앞(1767~1899)은 E2 시대 파일(colonial) 몫
const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)
const E1_END = PRESENT + 1; // 마지막 표의 끝(미포함)

// ── 조각 소유표 도우미 (중앙아시아 modern.mjs와 같은 꼴, 표가 여럿 — E1 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < E1_START || e[0] >= E1_END)) {
    throw new Error(`southeast-asia modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${E1_START} 이상 ${E1_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`southeast-asia modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = E1_START, to = E1_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`southeast-asia modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`southeast-asia modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`southeast-asia modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`southeast-asia modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`southeast-asia modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── E1 W 서 (버마·타이 — 조각 E1_W_IDS: 미얀마 14·타이 77, 구현 E1-W): 칼선 import·상수·own 줄·voids는 이 아래에, 최상위 이름은 W_ ──
// 항목: british-raj(늘림, 버마 본토 1900~1936)·british-burma·shan-states·karenni-states·myanmar·thailand(블록 글은 W)
const W_BOUNDS = [1937, 1948]; // 1937-04-01 버마가 영국령 인도에서 갈라짐(1935 버마 통치법), 1948-01-04 독립 — 그 밖의 해는 1만 km² 넘는 변화가 없음
// 조각 몫: 샨 MM-17 = 연방 샨 국(1922-10-10, 와 주 포함), 카야 MM-12 = 카레니 국(1952 몽파이를 더한 지금 카야주 — 1만 km² 미만 차이는 근사).
//   칼선 없음: 연방 샨 국 경계와 지금 샨주 차이(사가잉 쪽 샨 소국 따응둣·싱갈링캄티, 몽파이 등)는 모두 1만 km² 미만이라 조각 경계 그대로
const W_SHAN = ['MM-17'];
const W_KARENNI = ['MM-12'];
const W_BURMA = idsOf('MMR').filter((id) => !W_SHAN.includes(id) && !W_KARENNI.includes(id)); // 버마 본토 12조각(아라칸·테나세림·하버마·상버마·카친·친 구릉)
const W_SIAM = idsOf('THA'); // 지금 타이 77조각 — 1900년 시암 땅 그대로(1904~1907 프랑스가 쥔 뜨랏 약 2,800 km²·단사이는 1만 km² 미만이라 칠하지 않음)
if (W_BURMA.length + W_SHAN.length + W_KARENNI.length + W_SIAM.length !== E1_W_IDS.length || [...W_BURMA, ...W_SHAN, ...W_KARENNI, ...W_SIAM].some((id) => !E1_W_IDS.includes(id))) throw new Error('southeast-asia modern: W 칸 조각 나눔이 E1_W_IDS와 다름');
// 버마 본토: 1886-01-01 상버마 병합 뒤 영국령 인도의 주(늘림 — 자동 승인 A1, 이 시대 파일은 1900~1936만), 1937 영국령 버마, 1948 버마 연방(1989 미얀마 — 같은 항목)
own(W_BURMA, [[E1_START, 'british-raj'], [1937, 'british-burma'], [1948, 'myanmar']]);
// 샨 국·카레니 국: 사오파가 다스린 보호국(기본값 4), 1948 버마 연방의 샨주·카레니주(1952 카야주)
own(W_SHAN, [[E1_START, 'shan-states'], [1948, 'myanmar']]);
own(W_KARENNI, [[E1_START, 'karenni-states'], [1948, 'myanmar']]);
// 타이: 1939 시암→타이(같은 항목). 1943 일본이 넘긴 샨 두 주(사하랏 타이 덤)·말레이 네 주는 칠하지 않음(결정 4)
own(W_SIAM, [[E1_START, 'thailand']]);
const W_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음(중국 쪽 띠는 공통 줄이 뺌)
// ── E1 W 끝 ──

// ── E1 CL 중서 (라오스·캄보디아 — 조각 E1_CL_IDS: 라오스 17·캄보디아 24, 구현 E1-CL): 최상위 이름은 CL_ ──
// 항목: laos·cambodia. 이 칸 조각에 thailand(W 정의)도 칠함 — 1904·1907 앞 시암 땅, 1941~1945 도쿄 조약분(결정 4)
// 1953 독립은 보호 관계가 끝난 것뿐(같은 항목, 땅 그대로)이라 표 경계에서 뺐다. 1975 라오스 인민민주공화국·캄보디아 국호들도 글만(새 버전 없음)
const CL_BOUNDS = [1904, 1907, 1941, 1946]; // 1904 파리 조약(02-13), 1907 방콕 조약(03-23), 1941 도쿄 조약(05-09), 1946 워싱턴 합의로 프랑스에 반환(11-17)
import { CL_CUT_MEKONG, CL_CUT_TOKYO } from './cuts-e1.mjs';
const CL_LA = idsOf('LAO');
const CL_KH = idsOf('KHM');
// 라오스: 메콩 왼쪽 기슭은 1893-10-03 조약 뒤 프랑스 보호령(1900년부터 그대로). 루앙프라방 LA-LP의 메콩 오른쪽 기슭 몫(쫌펫·난 쪽 약 2,500 km²)은 1만 km² 미만이라 나누지 않고 라오스 색(알려진 근사)
own(minus(CL_LA, 'LA-XA', 'LA-CH'), [[1900, 'laos']]);
// 사야부리(메콩 오른쪽 기슭 전체): 1904 파리 조약으로 프랑스령, 1941 도쿄 조약으로 타이(란창 도), 1946 반환
own(['LA-XA'], [[1900, 'thailand'], [1904, 'laos'], [1941, 'thailand'], [1946, 'laos']]);
// 참파삭: 오른쪽 기슭(바싹)은 사야부리와 같은 해들, 왼쪽 기슭(팍세 쪽)은 1900년부터 라오스
ownSplit('CL_참파삭', ['LA-CH'], [['오른쪽', CL_CUT_MEKONG]], '왼쪽', { 오른쪽: [[1900, 'thailand'], [1904, 'laos'], [1941, 'thailand']], 왼쪽: [[1900, 'laos']] }, { from: 1900, to: 1946 });
own(['LA-CH'], [[1946, 'laos']]);
// 캄보디아 1907 할양 땅 '안쪽 캄보디아'(바탐방·파일린·반테아이민체이 = 시소폰·오다르민체이): 1907 방콕 조약으로 프랑스령, 1941 도쿄 조약으로 모두 타이(프라따봉·피분송크람 도), 1946 반환
own(['KH-2', 'KH-24', 'KH-1', 'KH-22'], [[1900, 'thailand'], [1907, 'cambodia'], [1941, 'thailand'], [1946, 'cambodia']]);
// 시엠레아프: 1907 할양 땅. 1941년에는 시엠레아프 읍·앙코르 유적 쪽(동남)만 프랑스에 남고 서북은 타이(도쿄 조약선 CL-2)
own(['KH-17'], [[1900, 'thailand'], [1907, 'cambodia']]);
ownSplit('CL_시엠레아프1941', ['KH-17'], [['서북', CL_CUT_TOKYO]], '앙코르', { 서북: [[1941, 'thailand']], 앙코르: [[1941, 'cambodia']] }, { from: 1941, to: 1946 });
own(['KH-17'], [[1946, 'cambodia']]);
// 프레아비히어: 북쪽 믈루프레이는 1904 파리 조약으로 프랑스령, 1941 도쿄 조약으로 타이(쫌크산은 피분송크람 도, 믈루프레이는 나콘참빠삭 도), 남쪽(로비엥·상콤트마이)은 내내 캄보디아
ownSplit('CL_프레아비히어', ['KH-13'], [['믈루프레이', CL_CUT_TOKYO]], '남', { 믈루프레이: [[1900, 'thailand'], [1904, 'cambodia'], [1941, 'thailand']], 남: [[1900, 'cambodia']] }, { from: 1900, to: 1946 });
own(['KH-13'], [[1946, 'cambodia']]);
// 스퉁트렝: 메콩 서쪽(톤레레포 — 탈라바리왓·시엠복)은 1904 파리 조약으로 프랑스령·1941 타이, 동쪽은 1893~1904 프랑스령 하(下)라오스가 다스리다 1904년 캄보디아로 넘김
ownSplit('CL_스퉁트렝', ['KH-19'], [['서쪽', CL_CUT_MEKONG]], '동쪽', { 서쪽: [[1900, 'thailand'], [1904, 'cambodia'], [1941, 'thailand']], 동쪽: [[1900, 'laos'], [1904, 'cambodia']] }, { from: 1900, to: 1946 });
own(['KH-19'], [[1946, 'cambodia']]);
// 라타나키리(그때 스퉁트렝 도의 동쪽 — 1959년 따로 도): 스퉁트렝 동쪽과 함께 1904년 라오스에서 캄보디아로
own(['KH-16'], [[1900, 'laos'], [1904, 'cambodia']]);
// 코콩: 1904 파리 조약으로 트랏과 함께 프랑스령, 1907년 트랏만 시암에 돌려줌(코콩은 캄보디아에 남음). 1941 도쿄 조약 밖
own(['KH-9'], [[1900, 'thailand'], [1904, 'cambodia']]);
// 나머지 캄보디아(프놈펜·캄퐁톰·푸르사트·크라티에·몬둘끼리 등): 1863년부터 프랑스 보호령
own(minus(CL_KH, 'KH-2', 'KH-24', 'KH-1', 'KH-22', 'KH-17', 'KH-13', 'KH-19', 'KH-16', 'KH-9'), [[1900, 'cambodia']]);
const CL_voids = () => []; // 이 칸 조각은 해마다 모두 주인이 있다(비운 땅 없음)
// ── E1 CL 끝 ──

// ── E1 CV 중동 (베트남 — 조각 E1_CV_IDS: 63, 구현 E1-CV): 최상위 이름은 CV_ ──
// 항목: cochinchina·annam-protectorate·tonkin-protectorate·vietnam. 남베트남(권역 파일, 1955~1975)은 바이트 그대로 — 공통 줄이 그 모양을 뺀다
// 남베트남 손그림은 별칭으로 가져온다(좌표를 베끼지 않음) — 1955~1975 비운 땅(손그림 밖 부스러기)에 씀
import { SOUTH_VIETNAM as CV_SV } from './shapes.mjs';
// 표 경계 해: 1904 다를락이 라오스에서 안남으로(1904-11-22 다를락 성 — 그해 말 안남), 1954 제네바(17도선 북쪽 vietnam), 1955 남베트남 손그림 시작, 1976 통일
const CV_BOUNDS = [1904, 1954, 1955, 1976];
// 1900년 무렵 세 지역(통킹 북부 Bắc Kỳ·안남 중부 Trung Kỳ·코친차이나 남부 Nam Kỳ)은 지금 성 경계와 거의 맞아 칼선 없이 조각 단위로 나눈다
//   통킹: 닌빈 북쪽(서북 산지 라이쩌우·디엔비엔·선라·호아빈과 동북 산지·홍강 삼각주)
const CV_TONKIN = ['VN-01', 'VN-02', 'VN-03', 'VN-04', 'VN-05', 'VN-06', 'VN-07', 'VN-09', 'VN-13', 'VN-14', 'VN-18', 'VN-20', 'VN-53', 'VN-54', 'VN-56', 'VN-61', 'VN-63', 'VN-66', 'VN-67', 'VN-68', 'VN-69', 'VN-70', 'VN-71', 'VN-HN', 'VN-HP'];
//   안남 17도선 북쪽(타인호아·응에안·하띤·꽝빈) — 1954년부터 vietnam. 꽝빈(VN-24)은 98%가 손그림 북쪽(남쪽 192 km²는 1955~1975 손그림이 덮음)
const CV_ANNAM_N = ['VN-21', 'VN-22', 'VN-23', 'VN-24'];
//   꽝찌(VN-25): 17도선 남쪽 성이라 1954년 말 안남, 1955~1975는 손그림이 78%를 덮고 밖 몫(약 1,116 km²)의 1,059 km²는 북위 17° 남쪽 서부 산지(흐엉호아·닥롱 — 손그림 서쪽 선이
//   라오스 국경 안쪽으로 그어짐)라 다른 남부 조각처럼 주인 null + 비운 땅. 벤하이강 북쪽 빈린은 손그림이 이미 남쪽에 둠(호싸 107.01,17.06 — 1954년 안남은 근사)
const CV_DMZ = ['VN-25'];
//   안남 17도선 남쪽(해안 후에~빈투언과 중부 고원 꼰뚬·자라이·닥농·럼동). 다를락(VN-33)은 따로
const CV_ANNAM_S = ['VN-26', 'VN-27', 'VN-28', 'VN-29', 'VN-30', 'VN-31', 'VN-32', 'VN-34', 'VN-35', 'VN-36', 'VN-40', 'VN-72', 'VN-DN'];
//   다를락: 1899년 라오스 소속 대리청(반돈·부온마투옷), 1904-11-22 안남의 성
const CV_DARLAC = ['VN-33'];
//   코친차이나(남부 Nam Kỳ — 사이공·비엔호아·떠이닌·빈프억과 메콩 삼각주)
const CV_COCHIN = ['VN-37', 'VN-39', 'VN-41', 'VN-43', 'VN-44', 'VN-45', 'VN-46', 'VN-47', 'VN-49', 'VN-50', 'VN-51', 'VN-52', 'VN-55', 'VN-57', 'VN-58', 'VN-59', 'VN-73', 'VN-CT', 'VN-SG'];
{
  const all = [CV_TONKIN, CV_ANNAM_N, CV_DMZ, CV_ANNAM_S, CV_DARLAC, CV_COCHIN].flat();
  if (all.length !== E1_CV_IDS.length || new Set(all).size !== all.length || all.some((id) => !E1_CV_IDS.includes(id))) throw new Error('southeast-asia modern CV: 세 지역 조각 목록이 E1_CV_IDS와 다름');
}
// 1955~1975 남베트남 손그림이 50% 넘게 덮는 조각(sv-overlap.txt — 꽝찌 78%~): 주인 null, 손그림 밖 부스러기는 비운 땅
const CV_SV_SIDE = [...CV_DMZ, ...CV_ANNAM_S, ...CV_DARLAC, ...CV_COCHIN];
own(CV_TONKIN, [[1900, 'tonkin-protectorate'], [1954, 'vietnam']]);
own(CV_ANNAM_N, [[1900, 'annam-protectorate'], [1954, 'vietnam']]);
own([...CV_DMZ, ...CV_ANNAM_S], [[1900, 'annam-protectorate'], [1955, null], [1976, 'vietnam']]);
own(CV_DARLAC, [[1900, 'laos'], [1904, 'annam-protectorate'], [1955, null], [1976, 'vietnam']]);
own(CV_COCHIN, [[1900, 'cochinchina'], [1955, null], [1976, 'vietnam']]);
// 비운 땅: 1955~1975 남베트남 손그림 밖에 남는 남부 조각 부스러기(라오스·캄보디아 국경과 해안 — 결정 7 근사, 손그림은 바이트 그대로)
const CV_voids = () => [[1955, 1976, D(F(...CV_SV_SIDE), [[CV_SV]])]];
// ── E1 CV 끝 ──

// ── E1 SM 남서 (말라야·싱가포르 — 조각 E1_SM_IDS: 말레이반도 13·싱가포르 5, 구현 E1-SM): 최상위 이름은 SM_ ──
// 항목: straits-settlements·perak-sultanate·pahang-sultanate·selangor-negeri-sembilan·johor-sultanate·kedah-perlis·kelantan-sultanate·terengganu-sultanate·malaysia·singapore
const SM_BOUNDS = [1946, 1963, 1965]; // 1946-04-01 말라야 연합·싱가포르 직할 식민지, 1963-09-16 말레이시아, 1965-08-09 싱가포르 분리
// 땅은 모두 조각 통째(칼선 없음). 1909 방콕 조약(북쪽 네 주의 종주가 시암→영국)은 관계만 바뀌어 새 버전이 아니고(data/relations.yaml),
// 1943~1945 타이의 북쪽 네 주 행정과 1942~1945 일본 점령도 칠하지 않는다(결정 3·4). 딘딩(페락 해안, 해협 식민지 1874~1934)은 1만 km² 미만이라 페락 색(알려진 근사)
const SM_IDS = new Set(E1_SM_IDS);
const SM_own = (ids, line) => {
  for (const id of ids) if (!SM_IDS.has(id)) throw new Error(`southeast-asia modern: SM 칸 조각이 아님 ${id}`);
  own(ids, line);
};
const SM_SG = idsOf('SGP'); // 싱가포르 다섯 조각
SM_own(['MY-07', 'MY-04'], [[E1_START, 'straits-settlements'], [1946, 'malaysia']]); // 페낭(웰즐리 주 포함)·말라카: 1946 말라야 연합에 들어감
SM_own(SM_SG, [[E1_START, 'straits-settlements'], [1946, 'singapore'], [1963, 'malaysia'], [1965, 'singapore']]); // 1946 따로 직할 식민지, 1963~1965 말레이시아의 주
SM_own(['MY-08'], [[E1_START, 'perak-sultanate'], [1946, 'malaysia']]); // 페락
SM_own(['MY-06'], [[E1_START, 'pahang-sultanate'], [1946, 'malaysia']]); // 파항
SM_own(['MY-10', 'MY-14', 'MY-16', 'MY-05'], [[E1_START, 'selangor-negeri-sembilan'], [1946, 'malaysia']]); // 슬랑오르(쿠알라룸푸르·푸트라자야 포함)·느그리슴빌란 — 기본값 3 묶음
SM_own(['MY-01'], [[E1_START, 'johor-sultanate'], [1946, 'malaysia']]); // 조호르
SM_own(['MY-02', 'MY-09'], [[E1_START, 'kedah-perlis'], [1946, 'malaysia']]); // 크다·프를리스 — 기본값 3 묶음
SM_own(['MY-03'], [[E1_START, 'kelantan-sultanate'], [1946, 'malaysia']]); // 클란탄
SM_own(['MY-11'], [[E1_START, 'terengganu-sultanate'], [1946, 'malaysia']]); // 트렝가누
{
  const left = E1_SM_IDS.filter((id) => !lines.has(id));
  if (left.length) throw new Error(`southeast-asia modern: SM 칸 조각에 주인 줄이 없음 ${left.join(', ')}`);
}
const SM_voids = () => []; // 이 칸에는 비운 땅이 없다
// ── E1 SM 끝 ──

// ── E1 SB 남동 (보르네오 북부·필리핀 — 조각 E1_SB_IDS: 사바·사라왁·라부안 3·브루나이 4·필리핀 118, 구현 E1-SB): 최상위 이름은 SB_ ──
// 항목: sarawak·north-borneo·brunei·american-philippines·philippines. 라부안(MY-15)은 이 칸 조각 — straits-settlements(SM 정의)를 1907~1945에 칠함, 1963부터 malaysia(SM 정의)
const SB_BOUNDS = [1907, 1946, 1963]; // 1907-01-01 라부안 해협 식민지 편입, 1946-07-04 필리핀 독립·07-15 라부안이 북보르네오 직할 식민지로, 1963-09-16 말레이시아 — 그 밖의 해는 1만 km² 넘는 변화가 없음
// 조각 몫: 사라왁 MY-13 = 브룩 라자국(1890 림방·1905 라와스까지 더한 지금 사라왁주), 사바 MY-12 = 북보르네오, 라부안 MY-15, 브루나이 4조각, 필리핀 118조각.
//   칼선 없음: 라와스(약 3,812 km², 1905 사라왁에 넘어감)·브루나이–사라왁 경계 차이는 1만 km² 미만이라 조각 경계 그대로
const SB_SARAWAK = ['MY-13'];
const SB_SABAH = ['MY-12'];
const SB_LABUAN = ['MY-15'];
const SB_BRUNEI = idsOf('BRN');
const SB_PHIL = idsOf('PHL');
if (SB_SARAWAK.length + SB_SABAH.length + SB_LABUAN.length + SB_BRUNEI.length + SB_PHIL.length !== E1_SB_IDS.length || [...SB_SARAWAK, ...SB_SABAH, ...SB_LABUAN, ...SB_BRUNEI, ...SB_PHIL].some((id) => !E1_SB_IDS.includes(id))) throw new Error('southeast-asia modern: SB 칸 조각 나눔이 E1_SB_IDS와 다름');
// 사라왁·북보르네오: 1888 영국 보호국, 1946 영국 직할 식민지(같은 항목 — 기본값 5), 1963 말레이시아(사라왁주·사바주 — 기본값 9, 사바 주장은 글로만)
own(SB_SARAWAK, [[E1_START, 'sarawak'], [1963, 'malaysia']]);
own(SB_SABAH, [[E1_START, 'north-borneo'], [1963, 'malaysia']]);
// 라부안(526 km²): 1890~1904 북보르네오 회사 관리(1904~1906 직할 식민지 두 해는 1만 km² 미만이라 북보르네오 색 그대로 — 결과 노트 7절 근사), 1907 해협 식민지, 1946 북보르네오 직할 식민지, 1963 말레이시아
own(SB_LABUAN, [[E1_START, 'north-borneo'], [1907, 'straits-settlements'], [1946, 'north-borneo'], [1963, 'malaysia']]);
// 브루나이: 1888 보호국, 1984-01-01 독립(같은 항목 — M5)
own(SB_BRUNEI, [[E1_START, 'brunei']]);
// 필리핀: 1898 파리 조약으로 미국령(1935 자치령 — 같은 항목, 기본값 11), 1946-07-04 독립
own(SB_PHIL, [[E1_START, 'american-philippines'], [1946, 'philippines']]);
const SB_voids = () => []; // 이 칸에는 일부러 비운 땅이 없음
// ── E1 SB 끝 ──

// ── E1 SI 남 (인도네시아·티모르 — 조각 E1_SI_IDS: 인도네시아 33·동티모르 13, 구현 E1-SI): 최상위 이름은 SI_ ──
// 항목: dutch-east-indies·aceh-sultanate·netherlands-new-guinea·indonesia·portuguese-timor·east-timor
const SI_BOUNDS = [1904, 1949, 1963, 1976, 1999, 2002]; // 1904 아체(기본값 8 — 1903 술탄 항복, 1904년 말까지 대부분 지배), 1949-12-27 주권 이양, 1963-05-01 서뉴기니, 1976-07-17 동티모르 병합 선언, 1999-10-25 유엔 과도 행정, 2002-05-20 독립
// 조각 몫(칼선 없음): 아체 ID-AC 통째 — 1900년 네덜란드가 쥔 아체 대(大)아체·피디 해안은 사료에 넓이가 없고 어림 1만 km² 미만이라 술탄국 땅으로 둠(결과 노트 7절).
//   서뉴기니 = 파푸아 ID-PA·서파푸아 ID-PB(결정 6 — 141° 자오선까지 주장 전체), 동티모르 = TL 13조각(오에쿠시 TL-OE 포함, 1914 경계 확정 차이는 1만 km² 미만)
const SI_ACEH = ['ID-AC'];
const SI_PAPUA = ['ID-PA', 'ID-PB'];
const SI_TIMOR = idsOf('TLS');
const SI_INDIES = idsOf('IDN').filter((id) => !SI_ACEH.includes(id) && !SI_PAPUA.includes(id)); // 자와·수마트라·보르네오 남부·술라웨시·말루쿠·소순다 30조각(자와 토후국·바깥섬 자치 토후국도 네덜란드령 색 — 기본값 7)
if (SI_ACEH.length + SI_PAPUA.length + SI_TIMOR.length + SI_INDIES.length !== E1_SI_IDS.length || [...SI_ACEH, ...SI_PAPUA, ...SI_TIMOR, ...SI_INDIES].some((id) => !E1_SI_IDS.includes(id))) throw new Error('southeast-asia modern: SI 칸 조각 나눔이 E1_SI_IDS와 다름');
// 네덜란드령 동인도: 1942~1945 일본 점령은 관계만(결정 3), 1945~1949 공화국의 실효 지배는 칠하지 않음(결정 5 — 법적 국경), 1949-12-27 주권 이양으로 인도네시아(연방 공화국 1949~1950 같은 항목)
own(SI_INDIES, [[E1_START, 'dutch-east-indies'], [1949, 'indonesia']]);
// 아체 술탄국: 1873~1904 아체 전쟁, 1903 술탄 항복, 1904년 말 네덜란드령(1912 마지막 항복은 글 — 기본값 8)
own(SI_ACEH, [[E1_START, 'aceh-sultanate'], [1904, 'dutch-east-indies'], [1949, 'indonesia']]);
// 서뉴기니: 1949 이양에서 빠져 네덜란드령 뉴기니, 1962-10-01~1963-04-30 유엔 임시 행정(1962년 말 주인은 네덜란드령 뉴기니로 둠 — mapNote), 1963-05-01 인도네시아(기본값 17)
own(SI_PAPUA, [[E1_START, 'dutch-east-indies'], [1949, 'netherlands-new-guinea'], [1963, 'indonesia']]);
// 티모르 동쪽·오에쿠시: 1975-11-28 독립 선포·12-07 인도네시아 침공, 1976 병합(유엔 불승인 — 기본값 10), 1999~2001 유엔 과도 행정은 비움, 2002 독립
own(SI_TIMOR, [[E1_START, 'portuguese-timor'], [1976, 'indonesia'], [1999, null], [2002, 'east-timor']]);
const SI_voids = () => [
  V(1999, 2002, ...SI_TIMOR), // 유엔 동티모르 과도 행정 1999-10~2002-05(주민 투표 뒤 인도네시아가 물러나고 독립 전 — 어느 나라 땅도 아님)
];
// ── E1 SI 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([E1_START, ...W_BOUNDS, ...CL_BOUNDS, ...CV_BOUNDS, ...SM_BOUNDS, ...SB_BOUNDS, ...SI_BOUNDS, E1_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== E1_START || BOUNDS.at(-1) !== E1_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`southeast-asia modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${E1_START}~${E1_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`southeast-asia modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`southeast-asia modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`southeast-asia modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`southeast-asia modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`southeast-asia modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== E1_END) throw new Error(`southeast-asia modern: 마지막 표의 끝이 ${joined.TO} (${E1_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간을 prevPieces 구간(뺄 도형 목록이 같은 구간)으로 다시 나누고, 그 구간에서 이 나라 땅과 실제로 겹치는 도형(중국 쪽 띠·남베트남 손그림)만 뺀다.
// 겹치는 도형 목록이 같은 구간은 다시 잇는다 — 그래서 남베트남과 닿는 나라(라오스·캄보디아·베트남 쪽)만 1955·1976에 버전이 나뉜다(넓이 변화는 그 겹침만큼 — 결정 7의 근사)
const hitKey = (shapes) => shapes.map((s) => Math.round(deg2(s) * 1e6)).sort((a, b) => a - b).join('|');
const cutPrev = ([from, to, list]) => {
  const g = build(list);
  const out = [];
  for (const [f, t, shapes] of prevPieces(from, to === E1_END ? null : to)) {
    const hit = shapes.filter((s) => deg2(I(g, s)) > 1e-6);
    const key = hitKey(hit);
    const last = out.at(-1);
    if (last && last.key === key && last.t === f) last.t = t;
    else out.push({ f, t, key, hit });
  }
  return out.map(({ f, t, hit }) => [f, t === null || t === E1_END ? null : t, hit.length ? D(g, ...hit) : g]).filter(([, , m]) => m.length);
};
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.flatMap(cutPrev)]).filter(([, list]) => list.length));

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...W_voids(), ...CL_voids(), ...CV_voids(), ...SM_voids(), ...SB_voids(), ...SI_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 384개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅·늘린 영국령 인도·중국 쪽 띠·남베트남을 합쳐 빈 곳이 없어야 한다.
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역은 끝이 없다. 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([E1_START, E1_END, ...voids.flatMap(([f, t]) => [f, t ?? E1_END]).filter((y) => E1_START < y && y < E1_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? E1_END)).map(([, , g]) => g);
  const open = to === E1_END;
  return [{ name: open ? `동남아 현대 ${from}~` : `동남아 현대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to: open ? null : to }];
});

void U; void geomOfUnit; void B; void E1_CL_IDS; // 여섯 칸이 쓰지 않는 이름 경고 막기(E2~E4가 쓰면 지움)

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
  source: SE_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳(E2~E4 시대 파일도 같은 문구를 써야 같은 나라 id를 이어 붙일 수 있음 — joinEras)
};
