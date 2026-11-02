// middle-east 시대 파일 orient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 800~551: 신아시리아·신바빌로니아·메디아 핵심·엘람·레반트 왕국, 이집트 25·26왕조·키레네·카르타고
// 짝 항목 파일: data/entities/middle-east-orient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다. 아래 '늘린 나라'와 'A4 항목 앞쪽'은 예외)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east/의 다른 도우미 모듈. areas/middle-east.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/middle-east/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/middle-east.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 이 파일은 source를 두지 않는다: ancient.mjs와 이어 붙는 neo-babylonian-empire·saite-egypt·cyrene-kingdom의
//   출처 문구가 두 시대 파일에서 같아야 하므로(joinEras가 다르면 멈춤) 둘 다 권역 기본 문구를 쓴다
//
// ── A5 짜임 안내 (2026-11-02 A5 뼈대, 구현 A5a·A5b가 표를 채움) ─────────────────
// 범위는 '확실한 핵심만'(docs/middle-east/00-scope.md 10절 A5): 해와 땅을 당대 기록이 받치는 것만 칠하고, 후대 서술뿐인 땅은 비운다.
// 천문 연도: 저장소의 해는 천문 연도다(기원전 N년 = 1−N: 기원전 800년 = −799, 기원전 551년 = −550). 표 줄의 해는 천문 연도,
//   주석에는 '기원전 N년(−N+1)' 꼴로 둘 다 적는다(예: 기원전 612년(−611)). test:geo --only years는 '기원전'이 붙은 숫자만 기원전으로 읽는다.
// 표: ancient.mjs와 같은 꼴의 조각 소유표(table.mjs). tableKit('orient')로 자기 꾸러미를 받아 단위 이름이 다른 시대 파일과 부딪치지 않는다.
//   표는 하나다(기원전 800~551년, 유럽 T800BC 안). 조각은 A1 조각(loadFragments('middle-east'))을 그대로 쓰고 새로 만들지 않는다. 옛 경계는 칼선으로 나눈다.
//   마지막 해(미포함)는 A5_END(−549) = ancient.mjs의 첫 해. 이 파일의 버전은 모두 −549 전에 끝난다.
// 해 줄 넣는 법은 ancient.mjs 머리 '해 줄 넣는 법'과 같다: own(단위들, [[해, 주인], …]), 나눈 조각은 ownSplit(…). 주인 null은 비운 땅(이유는 voids에 한 줄).
//   첫 줄의 첫 해는 A5_START(−799). 줄을 적지 않은 단위는 맨 아래 fillTables가 시대 내내 주인 null로 채운다.
// 칸 나눔(부딪침 막기, a5-plan 3절): 구현 A5a(동)는 '── A5a 동 ──' 칸, A5b(서)는 '── A5b 서 ──' 칸 아래에만 쓴다(칼선·상수·own 줄·voids 줄 모두).
//   맞닿는 땅: 아시리아의 이집트 지배와 이집트 쪽 시나이·서부 사막 오아시스·키레나이카 경계는 A5b, 가자·필리스티아·레반트 남부와 신바빌로니아의 레반트는 A5a.
//   같은 조각을 두 칸이 own하지 않는다(own이 같은 단위의 두 번째 줄을 '이은 줄'로 받아 해가 겹치면 멈춤).
// A4 항목 앞쪽: neo-babylonian-empire(A5a)·saite-egypt·cyrene-kingdom(A5b)은 항목이 data/entities/middle-east-ancient.yaml에 있다. 이 파일 표의 주인으로 쓰면
//   joinEras가 ancient.mjs의 −549부터 버전 앞에 붙인다(권역 파일 시대 목록이 [orientEra, ancientEra, …]로 과거가 앞). 항목은 ancient 항목 파일에 그대로 두고
//   mapNote의 '지도에는 기원전 550년부터' 같은 문장만 고친다. −550 줄은 ancient.mjs −549 줄과 견준다(같은 땅의 주인이 이어지거나 바뀌는지).
// 늘린 나라: 소유표의 주인으로 원래 권역 나라 id를 그대로 쓴다(ancient.mjs의 CAR 꼴). 권역 파일 EXTENDABLE에 있는 나라·기간만 쓸 수 있다(밖이면 생성기가 멈춤).
//   carthage는 A5b가 EXTENDABLE A4 줄의 첫 해를 앞으로 당긴다. 그 밖의 나라는 운영자 승인(00-scope 5절 영향표) 뒤에만 더한다.
// 이 지역 나라의 아나톨리아·캅카스(유럽 조각)는 칠하지 않는다. 이 파일은 이 권역 조각만 칠한다(유럽 조각 파일·유럽 도형은 바이트 그대로).
// 월경지: data/exclaves.yaml 끝에 '서아시아·북아프리카 A5 …' 절을 두고 A4 절과 같은 꼴로 한 줄씩 더한다(두 줄기는 줄 목록이라 합칠 때 둘 다 남김).
// 빈 땅 검사 구역: 표마다 주인 없는 단위를 뺀 권역 바깥선(아래 gapZonesOf, 이름 '서아시아 오리엔트 …'). 주인 있는 단위가 하나도 없는 해는 구역을 만들지 않는다(빈 틀).
// 가져오기: 아래 두 줄은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, U, box } from '../../lib.mjs';
import { ME, idsOf, minus, tableKit } from './table.mjs';

const { build, joinTables, makeTable } = tableKit('orient');

const A5_START = -799; // 이 시대 파일의 첫 해: 기원전 800년(−799)
const A5_END = -549; // 이 시대 파일의 끝(미포함) = ancient.mjs의 첫 해(A4_START)

// ── 조각 소유표 도우미 (ancient.mjs와 같은 꼴) ─────────────────────────────
// 표 나눔: 기원전 800년(−799)~기원전 551년(−550) 하나(유럽 T800BC 안)
const BOUNDS = [A5_START, A5_END];
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …] (절마다 own으로 이어 붙임)
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < A5_START || e[0] >= A5_END)) {
    throw new Error(`middle-east orient: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${A5_START} 이상 ${A5_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 절의 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`middle-east orient: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = A5_START, to = A5_END } = {}) => {
  if (!BOUNDS.includes(from) || !BOUNDS.includes(to) || from >= to) throw new Error(`middle-east orient: 나눈 조각 ${name}의 기간 [${from}, ${to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`middle-east orient: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`middle-east orient: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`middle-east orient: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  const known = new Set([...ME.ids, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`middle-east orient: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  for (const T of TABLES) {
    const splitHere = new Set();
    for (const l of layouts.filter((x) => x.from <= T.FROM && T.TO <= x.to)) {
      l.out = l.out ? T.reuse(l.out) : T.split(l.name, l.ids, l.parts, l.restName);
      for (const u of Object.values(l.units)) T.own([u], lines.has(u) ? sliceLine(u, lines.get(u), T.FROM, T.TO) : [[T.FROM, null]]);
      for (const id of l.ids) splitHere.add(id);
    }
    // 통째 조각: 같은 줄끼리 묶어 한 번에(묶음은 도형에 영향 없음: 버전은 해마다 단위 목록으로 만든다)
    const groups = new Map();
    for (const id of ME.ids) {
      if (splitHere.has(id)) {
        const line = lines.get(id);
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`middle-east orient: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// ── A5a 동 (신아시리아·신바빌로니아·메디아 핵심·엘람·레반트, 구현 A5a): 칼선·상수·own 줄은 이 아래에 ──

// ── A5a 끝 ──

// ── A5b 서 (이집트·시나이·키레나이카·카르타고, 구현 A5b): 칼선·상수·own 줄은 이 아래에 ──
// 등급: 나일 골짜기·삼각주·시나이·동부 사막·키레나이카 해안·튀니지 북부는 일반, 서부 사막과 리비아·마그레브 내륙은 주변(zones.yaml sahara-interior).
// 근거 문서: 조사 노트 notes-3(위키 영어 Third Intermediate Period of Egypt·Twenty-fifth Dynasty of Egypt·Kashta·Piye·Victory Stele of Piye·Shabaka·Tantamani·
//   Assyrian conquest of Egypt·Psamtik I·Cyrene, Libya·Carthage·History of Carthage·Utica, Tunisia).
// 운영자 결정(A5 질문 창구 ①·②): 분열기 이집트는 비움(② 3: 기원전 800~748년 이집트 전체, 하이집트는 쿠시가 장악한 기원전 714년(−713) 전까지, 제22~24왕조 항목 없음),
//   아시리아의 하이집트 지배는 섞어 칠하기(① 1 보충: 기원전 671~670년(−670·−669)과 667~665년(−666~−664) 아시리아 색, 669~668년(−668·−667) 쿠시 색),
//   사막 셋은 이집트 전체가 한 왕조 아래일 때만(조사 줄 2 안 A), 사이스는 기원전 664년(−663) 하이집트·656년(−655) 이집트 전체(줄 4 안 A),
//   시나이는 사이스가 이집트 전체를 얻은 기원전 656년(−655)부터(줄 5 안 A), 카르타고는 비제르트를 넣은 6주(② 4).
// 아시리아 몫(임시): 이 묶음은 아시리아 항목보다 먼저 들어가므로 하이집트의 아시리아 해는 주인 null과 임시 voids 줄로 두고, A5a 커밋에서 W_NAS로 바꾼다.
// 버전 해: 카르타고는 유럽 쪽 첫 버전(−649) 앞이라 새 버전 −799 하나. 아시리아가 하이집트를 가진 해에는 이집트가 두 주인으로 나뉘므로
//   사막 셋도 조사 줄 2 안 A대로 비운다(쿠시 색으로 둘지는 결과 노트 운영자 확인 후보).
const W_KUS = 'kushite-egypt'; // 이집트 제25왕조(쿠시 왕조), 지도 기원전 747~657년(−746~−656)
const W_SAI = 'saite-egypt'; // 이집트 제26왕조(A4 항목 앞쪽), 지도 기원전 664년(−663)부터
const W_CYR = 'cyrene-kingdom'; // 키레네(A4 항목 앞쪽), 지도 기원전 631년(−630)부터
const W_CAR = 'carthage'; // europe 늘림, 아프리카 쪽 기원전 800년(−799)부터
const W_EGYPT = idsOf('EGY'); // 이집트 27조각(ancient.mjs EGYPT27과 같은 조각)
const W_THEBAID = ['EG-ASN', 'EG-KN', 'EG-LX', 'EG-SHG']; // 테바이스(아스완·키나·룩소르·소하그)
const W_MIDDLE = ['EG-MN', 'EG-AST']; // 중이집트(민야·아시우트: 헤르모폴리스)
const W_DELTA = ['EG-ALX', 'EG-BH', 'EG-C', 'EG-DK', 'EG-DT', 'EG-GH', 'EG-IS', 'EG-KB', 'EG-KFS', 'EG-MNF', 'EG-PTS', 'EG-SHR', 'EG-SUZ', 'EG-GZ', 'EG-FYM']; // 삼각주 13조각과 멤피스(기자)·파이윰
const W_LOWER = [...W_DELTA, 'EG-BNS']; // 하이집트: 삼각주·멤피스·파이윰과 헤라클레오폴리스(베니수에프)
const W_DESERT3 = ['EG-WAD', 'EG-BA', 'EG-MT']; // 서부 사막과 오아시스·동부 사막·마트루와 시와
const W_SINAI = ['EG-SIN', 'EG-JS']; // 시나이 북부·남부
const W_CYRENAICA = ['LY-JA', 'LY-QB', 'LY-MJ']; // 키레네·아폴로니아(제벨아흐다르)·쿠바·타우케이라와 바르카(마르즈)
const W_CARTHAGE = ['TN-11', 'TN-13', 'TN-14', 'TN-21', 'TN-22', 'TN-23']; // 튀니스·벤아루스·마누바·나블(본곶)·자그완·비제르트(우티카): 도시 둘레 12,115 km²
{
  const all = [...W_THEBAID, ...W_MIDDLE, ...W_LOWER, ...W_DESERT3, ...W_SINAI];
  if (all.length !== W_EGYPT.length || W_EGYPT.some((id) => !all.includes(id))) throw new Error('middle-east orient A5b: 이집트 묶음이 이집트 27조각과 맞지 않음');
}
own(W_THEBAID, [[-799, null], [-746, W_KUS], [-655, W_SAI]]); // 기원전 747년 무렵 카슈타(엘레판티네 석비, 아메니르디스 1세 입양), 656년 프삼티크 1세의 니토크리스 입양 석비
own(W_MIDDLE, [[-799, null], [-727, W_KUS], [-655, W_SAI]]); // 기원전 728년 피예 원정(승전비: 헤르모폴리스의 님로트 항복), 656년 같은 입양 석비
own(['EG-BNS'], [[-799, null], [-727, W_KUS], [-670, null], [-668, W_KUS], [-666, null], [-663, W_SAI]]); // 헤라클레오폴리스: 피예 승전비의 누비아 속국 왕(기원전 728년), 그 뒤는 하이집트와 같음
own(W_DELTA, [[-799, null], [-713, W_KUS], [-670, null], [-668, W_KUS], [-666, null], [-663, W_SAI]]); // 기원전 714년 샤바카(새 연대 샤바타카)의 삼각주 장악, 671년 에사르하돈의 멤피스 함락(임시 null), 669년 타하르카 수복, 667년 아슈르바니팔(임시 null), 664년 프삼티크 1세
own(W_DESERT3, [[-799, null], [-713, W_KUS], [-670, null], [-668, W_KUS], [-666, null], [-655, W_SAI]]); // 이집트 전체가 한 왕조 아래일 때만: 기원전 714년 쿠시, 671~670년·667~657년(아시리아·사이스와 쿠시로 나뉨)은 비움, 669년 타하르카 수복, 656년 사이스
own(W_SINAI, [[-799, null], [-655, W_SAI]]); // 시나이: 사이스가 이집트 전체를 얻은 기원전 656년부터(A4 기원전 550년 모습과 이음)
own(W_CYRENAICA, [[-799, null], [-630, W_CYR]]); // 기원전 631년 바토스 1세의 키레네 건설(그리스 도기가 7세기 중엽 정착을 받침), 타우케이라도 같은 때
own(W_CARTHAGE, [[-799, W_CAR]]); // 카르타고 도시 둘레: 기원전 8세기 도시 핵(고고학), 기원전 550년(−549)부터 ancient.mjs의 본령·엠포리아로 이어짐
// ── A5b 끝 ──

// ── 나머지: 줄을 적지 않은 단위는 시대 내내 주인 null(아직 그리지 않음) ──
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역 ──
// 버전의 to는 숫자 그대로 둔다(마지막 표 끝 A5_END = ancient.mjs의 첫 해). 늘린 나라의 버전은 joinEras가 extensions로 옮긴다
const joined = joinTables(TABLES);
if (joined.TO !== A5_END) throw new Error(`middle-east orient: 마지막 표의 끝이 ${joined.TO} (${A5_END}이어야 ancient.mjs와 이어짐)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));
// 주인 있는 단위가 하나도 없는 기간(빈 틀·아직 그리지 않은 시대)은 구역을 만들지 않는다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapZonesOf = (nullSegments) => nullSegments.filter(([from, to]) => ownedIn(from, to)).map(([from, to, list]) => ({ name: `서아시아 오리엔트 ${from}~${to - 1}`, zone: list.length ? D(ME.domain, build(list)) : ME.domain, from, to }));
const gapZones = gapZonesOf(joined.nullSegments);

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). [from, to, 도형], // 이유
// V(from, to, 조각 id…)·B(from, to, 단위 이름…)로 한 줄씩 적는다(ancient.mjs와 같은 꼴). 자기 칸 머리 아래에
const V = (from, to, ...ids) => [from, to, ME.F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)]; // 나눈 조각 단위(이름/부분)도 받음
const voids = [
  // ── A5a 동 ──

  // ── A5a 끝 ──
  // ── A5b 서 ──
  V(-799, -746, ...W_THEBAID), // 테바이스 기원전 800~748년: 분열기(제22·23왕조) — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -727, ...W_MIDDLE, 'EG-BNS'), // 중이집트·헤라클레오폴리스 기원전 800~729년: 분열기 — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -713, ...W_DELTA), // 삼각주·멤피스·파이윰 기원전 800~715년: 분열기(제22~24왕조와 피예 뒤의 군주들) — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -713, ...W_DESERT3), // 사막 셋 기원전 800~715년: 이집트 전체가 한 왕조 아래일 때만 칠함(조사 줄 2 안 A)
  V(-670, -668, ...W_DESERT3), // 사막 셋 기원전 671~670년: 아시리아(하이집트)와 쿠시(상이집트)로 나뉨(조사 줄 2 안 A)
  V(-666, -655, ...W_DESERT3), // 사막 셋 기원전 667~657년: 아시리아·사이스(하이집트)와 쿠시(상이집트)로 나뉨(조사 줄 2 안 A)
  V(-799, -655, ...W_SINAI), // 시나이 기원전 800~657년: 쿠시·아시리아 시기의 주인을 적은 당대 문서 없음(조사 줄 5 안 A)
  V(-670, -668, ...W_LOWER), // 하이집트 기원전 671~670년: 아시리아 지배(결정 창구 ① 1 보충) // 임시: A5a 커밋에서 W_NAS로 바꿈
  V(-666, -663, ...W_LOWER), // 하이집트 기원전 667~665년: 아시리아 지배(결정 창구 ① 1 보충) // 임시: A5a 커밋에서 W_NAS로 바꿈
  V(-799, -630, ...W_CYRENAICA), // 키레나이카 해안 기원전 800~632년: 키레네 건설 전 리비아 부족 땅
  V(-799, A5_END, 'LY-BA'), // 벵가지(에우에스페리데스): 1만 km² 미만 그리스 도시, 기원전 550년(−549)부터 ancient.mjs가 키레네 땅으로 칠함
  V(-799, A5_END, ...minus(idsOf('LBY'), ...W_CYRENAICA, 'LY-BA')), // 리비아의 나머지(마르마리카·시르테·트리폴리타니아·페잔·사막): 리비아 부족 땅과 사막 내륙, 렙티스 같은 페니키아 거점은 1만 km² 미만
  V(-799, A5_END, ...minus(idsOf('TUN'), ...W_CARTHAGE)), // 튀니지의 나머지: 카르타고 도시 둘레 밖 리비아인 땅(기원전 550년까지 카르타고가 땅 값을 냄), 하드루메툼 같은 거점은 1만 km² 미만
  V(-799, A5_END, ...idsOf('DZA', 'MAR', 'SAH')), // 알제리·모로코·서사하라: 마그레브 내륙 부족 땅(후대 서술뿐), 릭수스 같은 페니키아 거점은 1만 km² 미만
  // ── A5b 끝 ──
];

export const era = {
  name: 'orient',
  versions,
  gapZones,
  voids,
};
