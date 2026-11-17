// oceania 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1901~현재: 연방·자치령·위임 통치와 섬나라 독립 (M1)
// 짝 항목 파일: data/entities/oceania-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas.mjs, areas/oceania/의 다른 도우미 모듈. areas/oceania.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/oceania/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/oceania.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 오세아니아 M1 짜임 안내 (M1 뼈대 2026-11-17 — 근거: docs/oceania/00-scope.md 2·3·5·8·10절, 0단계 결정(창구 ① 3·4·5·7·8, 창구 ② 1·4·5·6·7, 기본값 1·2·9~16), M1 창구 ②(Q1~Q4 권장안), 기본값 G1-1~G1-20, 메인 결정 M-M1-1, 지시문 oc-m1/m1/COMMON.md) ─────────────────
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). 섬은 1,000 km²(어느 해에 사라질 때만).
//   '주변' 구역은 이 단계 등록 0(0단계 후보 파푸아뉴기니 고지대·세픽·플라이 저지는 칠한 땅에서 빈 땅 검사가 걸릴 때만 — 칸 결과 노트 6절).
// 해 규칙: 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(1914~1919 독일령 뉴기니·사모아 점령은 관계 occupied_by만 — Q1, 일본 점령은 글 — G1-12). 새 버전은 1만 km² 넘게 바뀔 때만.
//   이름만 바뀌는 해(파푸아뉴기니 준주 1971·서사모아→사모아 1997 이름·누벨칼레도니 1946·1998 지위·프랑스령 폴리네시아 1946·1957)는 새 버전이 아니다 — 항목 글로(P7·G1-3).
// 1901 앞 버전 없음: 이 시대 파일이 이 권역의 첫 국경 단계라 첫 해는 M1_START(1901, 1901년 말 모습 — P1, 00-scope 3절 끊는 해 1900/1901)다. 1901 앞에 성립한 나라도 첫 버전은 1901부터이고
//   (M2가 같은 id로 앞을 이음), 1901 뒤 성립이면 그 해(뉴질랜드 1907·뉴헤브리디스 1907·위임 1920·준주 1949·작은 섬나라 독립 해). 1900 이하 이 권역 땅은 하와이 usa 1898~1900(아래 extra) 말고 빈 것이 정상.
// 결정 점프(P1): 1906 british-new-guinea→territory-of-papua(모양 같음)·1907 colony-of-new-zealand→new-zealand·1907 뉴헤브리디스 빈 땅→new-hebrides·1920 german-new-guinea→territory-of-new-guinea·
//   german-samoa→western-samoa·1949 두 준주→territory-of-papua-and-new-guinea·1962 samoa·1968 nauru·1970 fiji·1975 papua-new-guinea·1978 solomon-islands·tuvalu·1979 kiribati·1980 vanuatu·
//   1986 marshall-islands·micronesia·1994 palau(작은 섬나라 독립은 빈 땅→나라). 그 밖에 1만 km² 넘게 바뀌면 칸 결과 노트 2절에 까닭.
// 파푸아/뉴기니 경계(M-M1-1): 1885 영독 협정 선 대신 파푸아뉴기니 주 조각 경계 그대로(어긋남 조각마다 1만 km² 밑 — 칼선 0). 남부하일랜즈주 PG-SHM은 파푸아 쪽(Q2), 고지대 다섯은 1901부터 문서 경계 쪽 식민지 색(Q4).
// 늘림 나라(권역 파일 EXTENDABLE — 0단계 창구 ① 결정 3·G1-14): 아메리카 항목 usa [1898, null). 땅은 하와이 US-HI(AZP-M1 own 줄 [[M1_START, 'usa']]) 하나, 아메리카 파일·usa 블록은 고치지 않는다(P3).
//   usa 1898~1900은 표 첫 해 앞이라 extra('usa', 1898, M1_START, { units: ['US-HI'] })로 더한다(M1_EARLY — 1901~ 표 줄과 같은 단위면 한 버전으로 이어져 아메리카 usa 버전이 1901에서 갈리지 않음, 장치 시험 ①).
//   다른 앞 권역 나라(uk·france·german-empire·weimar-republic·japan)는 주인으로 쓰지 않는다 — 관계로만(P2).
// 날짜변경선: 조각 파일은 상자 넷이라 피지 FJ-N·FJ-E와 키리바시 KIR은 한 조각 안에 경도 180° 양쪽 폴리곤을 가진다 — 칼선이 아니라 조각 통째로 칠한다(0단계 기본값 1).
// 141° 이음매: 파푸아뉴기니 PG-SAN·PG-WPD는 동남아 조각(ID-PA 등) 바깥선 그대로 맞물린다(조각 파일 under). 동남아 파일·도형은 고치지 않는다.
// 칸 사이 주인 공유 0(COMMON 4절): 같은 땅·같은 나라 id를 두 칸이 나누지 않는다(사모아 넷은 모두 AZP-M1). 칸 사이 열쇠는 관계 대상뿐(PNG-M1이 AZP-M1 항목 australia를 관계 대상으로 씀 — 땅은 겹치지 않음).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-m1.mjs M1_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄(M1 AZP-M1·MIC-M1·PNG-M1 머리)과 그 칸 '끝' 줄 사이에만 쓴다
//   (import·상수·own 줄·extra 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 AZP_·MIC_·PNG_, import도 별칭(예: AZP_SMALL), ownSplit 묶음 이름도 앞머리(예: 'PNG_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
// 칼선 파일: cuts-m1.mjs에 칸 머리 셋이 있다(이 단계 칼선 0 — M-M1-1). 칸이 칼선을 더하면(결과 노트로 까닭) 그 파일 자기 머리 아래에 export const <앞머리>_CUT_…으로 쓰고,
//   이 파일 칸 머리 안에서 import { <앞머리>_CUT_… as <앞머리>_… } from './cuts-m1.mjs'로 가져온다(좌표를 베끼지 않음 — check:generator '파일 사이 좌표 되풀이').
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(M1_START·M1_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다(주인은 own 줄의 해마다 바뀜). ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M1_START(1901)부터, 해는 늘어난다(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(idsOf('AUS'), [[M1_START, 'australia']]) · own(idsOf('VUT'), [[M1_START, null], [1907, 'new-hebrides'], [1980, 'vanuatu']]). 줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다.
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(칸 voids에 한 줄과 이유 — 바누아투 1901~1906·작은 섬나라 독립 앞·작은 속령·토켈라우)만.
// 시대 경계 맞물림: 앞 시대 파일이 없다(M2가 이 파일 앞에 시대 파일을 더하고 권역 파일 joinEras 목록 앞에 둠). 끝까지 이어지는 버전은 to: null(PRESENT 2026년 말 모습 = 2027년 모습).
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 oceania.mjs의 sourceOf가 이 권역 나라 모두에 table.mjs OC_SOURCE_TEXT를 붙인다(늘린 usa는 아메리카 문구 그대로).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(오세아니아 첫판·M1 공통·M1 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M1_AZP_IDS, M1_MIC_IDS, M1_PNG_IDS } from './cuts-m1.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('modern');

const M1_START = 1901; // 이 시대 파일의 첫 해(1901년 말 모습). 그 앞(1900 이하)은 M2 몫(하와이 usa 1898~1900만 아래 extra)
const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)
const M1_END = PRESENT + 1; // 마지막 표의 끝(미포함)

// ── 조각 소유표 도우미 (아메리카 modern.mjs와 같은 꼴 — 동남아·사하라 이남 F1 뼈대 꼴, 오세아니아 M1 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M1_START || e[0] >= M1_END)) {
    throw new Error(`oceania modern: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M1_START} 이상 ${M1_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`oceania modern: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M1_START, to = M1_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`oceania modern: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`oceania modern: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`oceania modern: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`oceania modern: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`oceania modern: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── 표 밖 땅 (M1 뼈대 — 칸 머리에서 부름, 이 도우미는 고치지 않음) ─────────────────────────────
// extra(나라 id, from, to(끝 없음 null), { units, shape, name }): 소유표 밖에서 그 기간 그 나라 버전에 더하는 땅.
//   - units: 조각 id·나눈 부분 이름 목록. 표 첫 해(M1_START) 앞은 M1_EARLY의 나라만(G1-14 — usa 1898~1900 US-HI). 표 줄과 같은 단위 목록이 이어지면 한 버전이 된다
//   - shape·name: 조각 밖 손 도형(멀티폴리곤 — 바다 쪽은 빌드가 육지와 교차)과 그 이름(칸 앞머리로 — 예 'AZP_…'). 같은 이름은 같은 도형이어야 한다(이 단계 손 도형 예정 0 — 0단계 결정 4)
//   버전 = 그해 표 줄의 단위 ∪ 더하는 단위 ∪ 손 도형(손 도형 하나뿐이면 그 도형 그대로). 버전은 표 줄·더하는 땅의 기간 경계에서 나뉘고 같은 모양이 이어지면 한 버전이다
const M1_EARLY = { usa: 1898 }; // 표 첫 해 앞을 쓸 수 있는 나라와 그 첫 해(아메리카 usa — 하와이 병합 1898-08-12, 0단계 창구 ② 자동 승인·G1-14. 권역 파일 EXTENDABLE usa [1898, null))
const extras = [];
const extraShapes = new Map(); // 손 도형 이름 → 도형
const extra = (id, from, to, { units = [], shape = null, name = null } = {}) => {
  const end = to ?? M1_END;
  const first = M1_EARLY[id] ?? M1_START;
  if (!Number.isInteger(from) || !Number.isInteger(end) || from >= end || from < first || end > M1_END) throw new Error(`oceania modern: ${id}의 표 밖 땅 기간 [${from}, ${to}) (첫 해 ${first} 이상, 끝 ${M1_END} 이하 또는 null)`);
  if (!Array.isArray(units) || (!units.length && !shape)) throw new Error(`oceania modern: ${id}의 표 밖 땅 ${from}~에 단위도 손 도형도 없음`);
  if (shape && !name) throw new Error(`oceania modern: ${id}의 손 도형에 이름이 없음`);
  if (name && !shape) throw new Error(`oceania modern: 손 도형 이름 ${name}에 도형이 없음`);
  if (name && extraShapes.has(name) && extraShapes.get(name) !== shape) throw new Error(`oceania modern: 손 도형 이름 ${name}이 다른 도형에 겹침`);
  if (name) extraShapes.set(name, shape);
  extras.push({ id, from, to: end, units: [...units], name });
};

// ── M1 AZP-M1 오스트레일리아·뉴질랜드·남태평양·하와이 (최상위 이름 AZP_) ──
// 조각 M1_AZP_IDS(오스트레일리아 9·뉴질랜드 20(토켈라우 NZL-5472 비움 포함)·피지 5·통가 3·사모아 11·프랑스령 폴리네시아 4·하와이 US-HI 1 + 비우는 속령 아메리칸사모아 2·쿡 1·니우에 1·핏케언 1·왈리스 푸투나 3 = 61), 구현 AZP-M1
// 항목(새 10): australia·colony-of-new-zealand(1901~1906)·new-zealand(1907~)·fiji-colony(~1969)·fiji(1970~)·kingdom-of-tonga·german-samoa(~1919)·western-samoa(1920~1961)·samoa(1962~)·french-polynesia
//   + 아메리카 usa 늘림(US-HI own 줄 [[M1_START, 'usa']]과 extra('usa', 1898, M1_START, { units: ['US-HI'] }) — 블록 글 0, P3). 칼선 0.
// voids: 토켈라우 NZL-5472(G1-10)·아메리칸사모아 ASM-*·쿡 COK-4953·니우에 NIU-5481·핏케언 PCN·왈리스 푸투나 WF-* 내내(G1-9 — 이유 '1만 km² 미만 속령 — 0단계 결정 5·G1-9'). 점프: 1907 뉴질랜드·1920 사모아·1962 사모아·1970 피지
import { M1_AZP_IDS as AZP_IDS, M1_AZP_SMALL_IDS as AZP_SMALL } from './cuts-m1.mjs';
const AZP_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음(조각 통째 — 주인만 바뀜, 1911 노던 준주·오스트레일리아 수도 준주 이관도 같은 모양 — Q3)
// 오스트레일리아 9 — 1901-01-01 여섯 식민지 연방(위키 en Territorial evolution of Australia). 자치령이라 vassal_of 없음
const AZP_AUS = idsOf('AUS');
own(AZP_AUS, [[M1_START, 'australia']]);
// 뉴질랜드 19(토켈라우 NZL-5472 뺌 — G1-10, 채텀 NZ-CIT·오클랜드 제도 NZL-5479·캠벨 NZL-5478 포함) — 1907-09-26 자치령(그해 말 모습, 위키 en Colony of New Zealand)
const AZP_TKL = ['NZL-5472'];
const AZP_NZL = minus(idsOf('NZL'), ...AZP_TKL);
own(AZP_NZL, [[M1_START, 'colony-of-new-zealand'], [1907, 'new-zealand']]);
// 피지 5(FJ-N·FJ-E는 경도 180° 양쪽 폴리곤 — 칼선 아님, 로투마 FJ-R은 1881-05-13 편입이라 1901 모양에 듦) — 1970-10-10 독립(위키 en Colony of Fiji)
const AZP_FJI = idsOf('FJI');
own(AZP_FJI, [[M1_START, 'fiji-colony'], [1970, 'fiji']]);
// 통가 3 — 왕국 내내(1900-05-18~1970-06-04 영국 보호국은 글 — G1-13, 위키 en Tonga)
const AZP_TON = idsOf('TON');
own(AZP_TON, [[M1_START, 'kingdom-of-tonga']]);
// 사모아 11 — 독일령(1914-08-29 뉴질랜드 점령은 관계 occupied_by만 — Q1)·1920-12-17 위임 서사모아(G1-4)·1962-01-01 독립(그해 1월 1일이라 1962부터, 위키 en Western Samoa Trust Territory)
const AZP_WSM = idsOf('WSM');
own(AZP_WSM, [[M1_START, 'german-samoa'], [1920, 'western-samoa'], [1962, 'samoa']]);
// 프랑스령 폴리네시아 4 — 내내(1946·1957·2003·2004 지위·이름은 글 — G1-17, 위키 en French Polynesia)
const AZP_PYF = idsOf('PYF');
own(AZP_PYF, [[M1_START, 'french-polynesia']]);
// 하와이 US-HI — 아메리카 usa 늘림(권역 파일 EXTENDABLE usa [1898, null) — 0단계 자동 승인·G1-14). 1898-08-12 이양(위키 en Annexation of Hawaii)이라 1898~1900은 표 밖 땅(SKEL-NOTE 6절 ②)
const AZP_HI = ['US-HI'];
own(AZP_HI, [[M1_START, 'usa']]);
extra('usa', 1898, M1_START, { units: AZP_HI });
// 칠하지 않는 작은 속령 8 + 토켈라우 — 내내 빈 땅(아래 voids)
const AZP_VOID_IDS = [...AZP_SMALL, ...AZP_TKL];
own(AZP_VOID_IDS, [[M1_START, null]]);
// 확인: 위 묶음이 칸 몫 61을 한 번씩 덮음(칠함 52 + 빈 땅 9)
const AZP_USED = [...AZP_AUS, ...AZP_NZL, ...AZP_FJI, ...AZP_TON, ...AZP_WSM, ...AZP_PYF, ...AZP_HI, ...AZP_VOID_IDS];
if (AZP_USED.length !== AZP_IDS.length || new Set(AZP_USED).size !== AZP_IDS.length || AZP_USED.some((id) => !AZP_IDS.includes(id))) throw new Error(`oceania modern: AZP-M1 묶음 ${AZP_USED.length}개가 칸 몫 ${AZP_IDS.length}개와 다름`);
const AZP_voids = () => [
  V(M1_START, null, ...AZP_VOID_IDS), // 1만 km² 미만 속령 — 0단계 결정 5·G1-9·G1-10(아메리칸사모아·쿡 제도·니우에·핏케언·왈리스 푸투나·토켈라우, 1,000 km² 넘는 섬 없음)
];
// ── M1 AZP-M1 끝 ──

// ── M1 MIC-M1 미크로네시아·키리바시·투발루·나우루 (최상위 이름 MIC_) ──
// 조각 M1_MIC_IDS(키리바시 1·투발루 1·나우루 14·마셜 2·미크로네시아 연방 4·팔라우 11 + 비우는 속령 괌 1·북마리아나 4 = 38), 구현 MIC-M1
// 항목(새 6): kiribati(1979~)·tuvalu(1978~)·nauru(1968~)·marshall-islands(1986~)·micronesia(1986~)·palau(1994~) — 모두 독립 해부터, 그 앞은 비움(길버트 엘리스·남양 군도·신탁 통치령·나우루 위임 — G1-9). 칼선 0.
// voids: 여섯 나라 독립 앞 해까지·괌 GUM·북마리아나 MNP-* 내내(G1-9). 점프: 1968·1978·1979·1986·1994(빈 땅→나라, 모두 1만 km² 밑)
import { M1_MIC_IDS as MIC_CELL_IDS } from './cuts-m1.mjs';
// 나라마다 조각(조각 파일 adm0 묶음 — 모두 통째, 칼선 0). 독립·자유 연합 협정 효력 해부터 칠하고 그 앞은 비움(G1-6·G1-9)
const MIC_KIR = idsOf('KIR'); // 키리바시 1(길버트·피닉스·라인 제도 — 경도 180° 양쪽 폴리곤을 가진 한 조각, 칼선 아님)
const MIC_TUV = idsOf('TUV'); // 투발루 1(엘리스 제도)
const MIC_NRU = idsOf('NRU'); // 나우루 14(NR-01~NR-14 — 산호섬 하나의 구 14)
const MIC_MHL = idsOf('MHL'); // 마셜 제도 2(MH-L 랄리크·MH-T 라타크 열도)
const MIC_FSM = idsOf('FSM'); // 미크로네시아 연방 4(FM-YAP 야프·FM-TRK 추크·FM-PNI 폰페이·FM-KSA 코스라에)
const MIC_PLW = idsOf('PLW'); // 팔라우 11(PW-*)
const MIC_SMALL = idsOf('GUM', 'MNP'); // 괌 1·북마리아나 제도 4 — 미국 속령, 내내 비움
{
  const mine = [MIC_KIR, MIC_TUV, MIC_NRU, MIC_MHL, MIC_FSM, MIC_PLW, MIC_SMALL].flat();
  const sizes = [MIC_KIR, MIC_TUV, MIC_NRU, MIC_MHL, MIC_FSM, MIC_PLW, MIC_SMALL].map((x) => x.length).join('·');
  if (sizes !== '1·1·14·2·4·11·5' || new Set(mine).size !== MIC_CELL_IDS.length || MIC_CELL_IDS.some((id) => !mine.includes(id))) {
    throw new Error(`oceania modern MIC-M1: 칸 조각 묶음 ${sizes}(1·1·14·2·4·11·5여야 함)이 M1_MIC_IDS ${MIC_CELL_IDS.length}개와 다름`);
  }
}
// 주인 줄(그해 말 모습): 독립 해 = 사료 날짜의 해(D3 — 위키 en 각 나라 문서)
own(MIC_NRU, [[M1_START, null], [1968, 'nauru']]); // 1968-01-31 독립(오스트레일리아 등 셋의 신탁 통치 끝)
own(MIC_TUV, [[M1_START, null], [1978, 'tuvalu']]); // 1978-10-01 독립(1975-10-01 길버트 제도와 갈라섬)
own(MIC_KIR, [[M1_START, null], [1979, 'kiribati']]); // 1979-07-12 독립(길버트 제도·피닉스 제도·라인 제도)
own(MIC_MHL, [[M1_START, null], [1986, 'marshall-islands']]); // 1986-10-21 미국과 자유 연합 협정 효력
own(MIC_FSM, [[M1_START, null], [1986, 'micronesia']]); // 1986-11-03 미국과 자유 연합 협정 효력
own(MIC_PLW, [[M1_START, null], [1994, 'palau']]); // 1994-10-01 미국과 자유 연합 협정 효력
own(MIC_SMALL, [[M1_START, null]]); // 괌·북마리아나 제도는 내내 칠하지 않음(G1-9)
const MIC_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음(조각 통째 — 주인만 바뀜)
const MIC_voids = () => [
  // 독립 앞 1만 km² 미만 속령 — 길버트 엘리스·나우루 위임·남양 군도·태평양 제도 신탁 통치령(0단계 결정 5·창구 ② 7·G1-9)
  V(M1_START, 1968, ...MIC_NRU), // 나우루: 독일령(1888~)·오스트레일리아 점령(1914~)·영국·오스트레일리아·뉴질랜드 위임(1920~)·일본 점령(1942~1945)·신탁(1947~1967)
  V(M1_START, 1978, ...MIC_TUV), // 투발루: 영국 보호령·길버트 엘리스 식민지(1916~1975)·엘리스 제도 식민지(1975~1978)
  V(M1_START, 1979, ...MIC_KIR), // 키리바시: 영국 보호령·길버트 엘리스 식민지(1916~1975)·길버트 제도 식민지(1976~1979)
  V(M1_START, 1986, ...MIC_MHL), // 마셜 제도: 독일령·일본 남양 군도(1914~1944)·미국 신탁 통치령(1947~1986)
  V(M1_START, 1986, ...MIC_FSM), // 미크로네시아 연방: 같은 길(독일령 캐롤라인 제도·남양 군도·신탁 통치령)
  V(M1_START, 1994, ...MIC_PLW), // 팔라우: 같은 길, 신탁 통치령 마지막 땅(1994 협정 효력까지)
  // 1만 km² 미만 속령 — G1-9(괌 미국령 1898~, 북마리아나 독일령·남양 군도·신탁 통치령·1986~ 미국 자치령)
  V(M1_START, null, ...MIC_SMALL),
];
// ── M1 MIC-M1 끝 ──

// ── M1 PNG-M1 파푸아뉴기니·솔로몬·바누아투·누벨칼레도니 (최상위 이름 PNG_) ──
// 조각 M1_PNG_IDS(파푸아뉴기니 20·솔로몬 10·바누아투 6·누벨칼레도니 3 = 39), 구현 PNG-M1(2라운드)
// 항목(새 11): british-new-guinea(1901~1905)·territory-of-papua(1906~1948)·german-new-guinea(1901~1919)·territory-of-new-guinea(1920~1948)·territory-of-papua-and-new-guinea(1949~1974)·papua-new-guinea(1975~)·
//   british-solomon-islands(~1977)·solomon-islands(1978~)·new-hebrides(1907~1979)·vanuatu(1980~)·new-caledonia. 칼선 0(M-M1-1 — 파푸아 쪽 일곱 PG-WPD·PG-GPK·PG-CPM·PG-NPP·PG-MBA·PG-NCD·PG-SHM, 나머지 열셋 뉴기니 쪽).
// voids: 바누아투 VU-* 1901~1906(G1-7). 점프: 1906·1907·1920·1949·1975·1978·1980
const PNG_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음(141° 서쪽은 동남아 조각 — 이 표에 없음). 조각 통째로 주인만 바뀌어 표 경계 해를 늘리지 않음
// 파푸아 쪽 일곱(1885 영독 협정 선 남쪽 — 남부하일랜즈주 PG-SHM 포함, Q2·M-M1-1)과 뉴기니 쪽 열셋(본섬 여덟 + 비스마르크 제도·부건빌 섬 다섯). 칼선 0 — 선과 주 경계의 어긋남은 결과 노트 7절
const PNG_PAPUA = ['PG-WPD', 'PG-GPK', 'PG-CPM', 'PG-SHM', 'PG-NPP', 'PG-MBA', 'PG-NCD'];
const PNG_NEWGUINEA = minus(idsOf('PNG'), ...PNG_PAPUA);
const PNG_SOLOMON = idsOf('SLB');
const PNG_VANUATU = idsOf('VUT');
const PNG_NEWCAL = idsOf('NCL');
{
  // 칸 안 확인: 파푸아 일곱이 모두 PNG 조각이고, 뉴기니 쪽 열셋, 다섯 묶음 합이 칸 조각 39와 같음
  const png = idsOf('PNG');
  if (PNG_PAPUA.some((id) => !png.includes(id)) || PNG_NEWGUINEA.length !== 13) throw new Error(`oceania modern: PNG-M1 파푸아/뉴기니 묶음이 틀림(파푸아 ${PNG_PAPUA.length}·뉴기니 ${PNG_NEWGUINEA.length})`);
  const mine = [...PNG_PAPUA, ...PNG_NEWGUINEA, ...PNG_SOLOMON, ...PNG_VANUATU, ...PNG_NEWCAL].sort();
  const want = [...M1_PNG_IDS].sort();
  if (mine.length !== want.length || mine.some((id, i) => id !== want[i])) throw new Error(`oceania modern: PNG-M1 묶음 합 ${mine.length}이 칸 조각 ${want.length}과 다름`);
}
// 파푸아 쪽: 1884-11-06 영국 보호령(1888 병합) → 1906-09-01 파푸아법 시행 → 1949-07-01 두 준주 합침 → 1975-09-16 독립(고지대도 1901부터 문서 경계 색 — Q4)
own(PNG_PAPUA, [[M1_START, 'british-new-guinea'], [1906, 'territory-of-papua'], [1949, 'territory-of-papua-and-new-guinea'], [1975, 'papua-new-guinea']]);
// 뉴기니 쪽: 1884-11-03 독일 보호령(1914-09~1919 오스트레일리아 점령은 관계 occupied_by만 — Q1) → 1920-12-17 위임(G1-4) → 1949 합침 → 1975 독립
own(PNG_NEWGUINEA, [[M1_START, 'german-new-guinea'], [1920, 'territory-of-new-guinea'], [1949, 'territory-of-papua-and-new-guinea'], [1975, 'papua-new-guinea']]);
// 솔로몬: 1893 영국 보호령(1900-10 북쪽 섬을 더한 뒤 모양이라 1901 한 모양) → 1978-07-07 독립
own(PNG_SOLOMON, [[M1_START, 'british-solomon-islands'], [1978, 'solomon-islands']]);
// 바누아투: 1901~1906 비움(아래 voids) → 1907 영불 공동 통치(1906-10-20 의정서, 1907 시행 — G1-7) → 1980-07-30 독립
own(PNG_VANUATU, [[M1_START, null], [1907, 'new-hebrides'], [1980, 'vanuatu']]);
// 누벨칼레도니: 1853-09-24 프랑스 병합, 지금까지(1946 해외 영토·1998 누메아 협정 지위는 글 — G1-17)
own(PNG_NEWCAL, [[M1_START, 'new-caledonia']]);
const PNG_voids = () => [
  V(M1_START, 1907, ...PNG_VANUATU), // 1906 의정서 효력 앞 영불 해군 위원회 시기 — 주권 단위가 아님(창구 ② 7·G1-7)
];
// ── M1 PNG-M1 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M1_START, ...AZP_BOUNDS, ...MIC_BOUNDS, ...PNG_BOUNDS, M1_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M1_START || BOUNDS.at(-1) !== M1_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`oceania modern: 표 경계 해 ${BOUNDS.join(', ')}는 ${M1_START}~${M1_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`oceania modern: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`oceania modern: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`oceania modern: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`oceania modern: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`oceania modern: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== M1_END) throw new Error(`oceania modern: 마지막 표의 끝이 ${joined.TO} (${M1_END}이어야 함)`);
// 버전: 표 줄의 단위 목록과 표 밖 땅(extra)을 해 구간마다 합쳐, 같은 모양(단위 목록·손 도형 이름)이 이어지는 기간이 한 버전. 끝까지 이어지는 버전은 to: null.
// 앞 권역 도형 빼기는 없다(1901~ 이 권역 조각과 겹치는 앞 권역 도형 없음 — table.mjs 머리)
const versionsOf = (id, segs) => {
  const ex = extras.filter((e) => e.id === id);
  const cuts = [...new Set([...segs.flatMap(([f, t]) => [f, t]), ...ex.flatMap((e) => [e.from, e.to])])].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [a, b] = [cuts[i], cuts[i + 1]];
    const seg = segs.find(([f, t]) => f <= a && b <= t);
    const on = ex.filter((e) => e.from <= a && b <= e.to);
    const units = [...new Set([...(seg?.[2] ?? []), ...on.flatMap((e) => e.units)])].sort();
    const names = [...new Set(on.map((e) => e.name).filter(Boolean))].sort();
    if (!units.length && !names.length) continue;
    const key = JSON.stringify([units, names]);
    const last = out.at(-1);
    if (last && last.to === a && last.key === key) last.to = b;
    else out.push({ from: a, to: b, key, units, names });
  }
  return out.map(({ from, to, units, names }) => {
    const shapes = names.map((n) => extraShapes.get(n));
    const geom = !shapes.length ? build(units) : !units.length && shapes.length === 1 ? shapes[0] : U(...(units.length ? [build(units)] : []), ...shapes);
    return [from, to === M1_END ? null : to, geom];
  });
};
const versionIds = [...new Set([...Object.keys(joined.segments), ...extras.map((e) => e.id)])];
const versions = Object.fromEntries(versionIds.map((id) => [id, versionsOf(id, joined.segments[id] ?? [])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M1_START(M1_EARLY 나라는 그 해) 이상에서 시작. 앞 시대 파일이 없어 이어지는 나라 검사는 없다(M2가 더함)
for (const [id, list] of Object.entries(versions)) {
  const first = M1_EARLY[id] ?? M1_START;
  if (list.some(([f]) => f < first)) throw new Error(`oceania modern: ${id} 버전이 ${first} 앞에서 시작함`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...AZP_voids(), ...MIC_voids(), ...PNG_voids()];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M1_START && (t === null || (Number.isInteger(t) && f < t && t <= M1_END)))) throw new Error(`oceania modern: 비운 땅 기간 [${f}, ${t}) (${M1_START} 이상, 끝은 ${M1_END} 이하 또는 null)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 138개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// M1_START(1901)부터만 만든다(첫 국경 단계 — 1900 이하에는 이 권역 구역이 없음, 특별 지시 2 — data/tests/baseline/gaps.txt에 오세아니아 줄을 넣지 않음). 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역은 끝이 없다.
// 이 권역 나라가 소유표에 하나도 없는 기간(빈 틀·뼈대)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다).
// 늘린 usa(하와이 US-HI)도 소유표 주인이라 구역 안 땅을 덮는다(엔진이 아메리카 usa 버전에 더함)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([M1_START, M1_END, ...voids.flatMap(([f, t]) => [f, t ?? M1_END]).filter((y) => M1_START < y && y < M1_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? M1_END)).map(([, , g]) => g);
  const open = to === M1_END;
  return [{ name: open ? `오세아니아 현대 ${from}~` : `오세아니아 현대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to: open ? null : to }];
});

void I; void geomOfUnit; // 칸이 쓰지 않는 이름 경고 막기(합친 뒤 남은 둘)

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 oceania.mjs의 sourceOf(table.mjs OC_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
