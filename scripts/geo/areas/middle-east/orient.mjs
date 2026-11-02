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

  // ── A5b 끝 ──
];

export const era = {
  name: 'orient',
  versions,
  gapZones,
  voids,
};
