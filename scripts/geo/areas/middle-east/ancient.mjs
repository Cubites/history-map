// middle-east 시대 파일 ancient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 550~631: 아케메네스·헬레니즘 왕국·로마·파르티아·사산, 카르타고·누미디아, 이슬람 이전 아라비아
// 짝 항목 파일: data/entities/middle-east-ancient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다. 아래 '늘린 나라'와 'A3 항목 앞쪽'은 예외)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east/의 다른 도우미 모듈. areas/middle-east.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/middle-east/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/middle-east.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구. 이 파일은 source를 두지 않는다: medieval.mjs와 이어 붙는 sasanian-empire의
//   출처 문구가 두 시대 파일에서 같아야 하므로(joinEras가 다르면 멈춤) 둘 다 권역 기본 문구를 쓴다
//
// ── A4 짜임 안내 (2026-10-31 A4-0 바탕, 구현 에이전트가 표를 채움) ─────────────────
// 천문 연도: 저장소의 해는 천문 연도다(기원전 N년 = 1−N: 기원전 550년 = −549, 기원전 31년 = −30, 기원전 1년 = 0, 서기 1년 = 1). 표 줄의 해는 천문 연도 숫자로 쓰고,
//   주석에는 '기원전 N년(−N+1)' 꼴로 둘 다 적는다(예: 기원전 539년(−538)). test:geo --only years는 생성기 주석의 'N년부터/까지/이후/이전'을 같은 줄 나라의
//   지도 해와 견주며, '기원전'이 붙은 숫자만 기원전으로 읽는다('−538년부터'처럼 음수에 '년'을 붙이면 서기 538년으로 읽혀 틀린 경보가 남).
// 표: medieval.mjs와 같은 꼴의 조각 소유표(table.mjs). 이 파일은 tableKit('ancient')로 자기 꾸러미를 받아 단위 이름('IQ-NI/북' 같은 나눈 조각 이름)이
//   다른 세 시대 파일과 부딪치지 않는다(꾸러미마다 단위 이름·도형 표가 따로). 칼선이 같으면 그 파일의 도형을 import해 이 꾸러미에서 다시 나눈다.
//   조각은 A1 조각(loadFragments('middle-east'))을 그대로 쓰고 새로 만들지 않는다. 옛 경계는 칼선으로 나눈다. 표마다 모든 조각을 정확히 한 번 쓴다(아래 도우미가 맞춤).
//   표 나눔은 유럽 표 경계 해에 맞춘다: 기원전 550~264년(−549~−264, 유럽 T800BC 안)·기원전 263~27년(−263~−27, 유럽 T264BC)·기원전 26년~283년(−26~283, 유럽 T27BC)·
//   284~475(유럽 T284)·476~631(유럽 T476 안). 표 경계는 버전을 나누지 않는다(joinTables가 같은 단위 목록을 잇는다). 나눈 조각(칼선)은 표 경계에서만 켜고 끈다.
//   늘린 나라가 두 권역에 걸치므로 버전이 바뀌는 해는 되도록 유럽 쪽 그 나라 버전 해에 맞춘다(어긋나면 유럽 쪽 버전이 그 해에서 나뉠 뿐 틈·겹침은 없지만 짧은 깜빡임이 생김).
//   마지막 표의 끝(미포함)은 A4_END(632) = medieval.mjs의 첫 해. 이 파일의 버전은 모두 632 전에 끝난다(to: null을 쓰지 않음).
// 해 줄 넣는 법: 조각(또는 나눈 조각 단위 '이름/부분')의 주인 줄을 own(단위들, [[해, 주인], …])로 적는다. [해, 주인]은 그 해부터 다음 줄 해 전까지 그 주인이다(그해 말 모습).
//   주인 null은 비운 땅(이유는 voids에 한 줄)이다. 첫 줄의 첫 해는 A4_START(−549)(나눈 조각 단위는 그 칼선을 켠 해).
//   같은 단위를 뒤 절에서 다시 own하면 앞 줄 뒤에 잇는다(뒤 줄의 첫 해 > 앞 줄의 마지막 해여야 함): ⑥(기원전 31년(−30)까지)이 적은 동쪽 조각의 줄을
//   ⑦이 자기 절에서 own(같은 단위, [[−29, 주인], …])으로 잇는다(⑥의 마지막 주인은 ⑦의 첫 해 전까지 이어짐). 묶는 조각이 두 절에서 달라도 된다(조각마다 잇는다).
//   예: own(idsOf('IRQ'), [[-549, ACH], [-329, MAC], [-310, SEL], [-140, PAR]]) → ⑦에서 own(idsOf('IRQ'), [[-29, PAR], [226, SAS]]) (PAR·SAS 같은 상수는 각 절에 둔다).
//   나눈 조각: ownSplit(묶음 이름, 조각 ids, [[부분, 칼선], …], 나머지 이름, { 부분: 줄, … }, { from?, to? }). from·to(미포함)는 BOUNDS의 해(기본 시대 전체)이고 그 밖의 표에서는
//   그 조각들이 통째라 통째 줄(own(ids, …))이 그 표 기간을 맡는다. 반환한 { 부분: '묶음/부분' } 단위로 뒤 절이 own해 이을 수 있다.
//   줄을 적지 않은 단위는 맨 아래 REST가 시대 내내 주인 null로 채운다(아직 그리지 않음). 구현이 끝날 때 REST에 남는 조각은 일부러 비운 땅뿐이어야 한다.
//   구현 ⑥⑦⑧은 자기 절(아래 '── ⑥ …')에만 줄을 더하고, 머리에 그 구현의 등급·근거 문서를 medieval.mjs처럼 한 덩어리로 적는다(절 이름은 메인이 나눔에 따라 바꿀 수 있음).
// 늘린 나라를 적는 곳: 소유표의 주인으로 원래 권역 나라 id를 그대로 쓴다(medieval.mjs의 UMA·BYZ, early-modern.mjs의 OTT와 같은 꼴, 아래 ACH·MAC·SEL·PTO·CAR·RRP·ROM·WRE·VAN·OSR·BYZ 상수).
//   권역 파일(areas/middle-east.mjs)의 EXTENDABLE에 있는 나라·기간만 쓸 수 있다(밖이면 생성기가 멈춤). joinEras가 그 버전을 extensions로 옮기고 생성기(engine.mjs '앞 권역 나라 늘리기')가
//   원래 권역 나라의 그 해 버전에 합집합으로 더한다. 원래 권역 버전이 없는 해는 이 권역 땅만으로 새 버전이 생긴다(확실성 기본값 estimated). 항목(data/entities/europe.yaml)과
//   원래 권역 모양(data/geo/home/<id>.geojson)은 그대로다. 늘린 땅은 이 권역 조각 안이라 유럽 조각 안 원래 모양과 겹치지 않는다. 이음매 선은 조각 준비의 under: 'europe' 그대로다.
//   EXTENDABLE에 나라를 더할 때(운영자 결정을 받은 antigonid-asia·arsacid-armenia 등)는 권역 파일 EXTENDABLE A4 절에 한 줄, 기간은 항목 기간 안(끝 해 = 항목 to+1 이하).
// 632 이음매(A3 항목 앞쪽): sasanian-empire(항목은 data/entities/middle-east-medieval.yaml, 224~651)를 이 파일 표의 주인으로 쓰면 joinEras가 medieval.mjs의 632년부터 버전 앞에
//   붙인다(권역 파일 시대 목록이 [ancientEra, medievalEra, …]로 과거가 앞). 항목은 medieval 항목 파일에 그대로 두고(두 항목 파일에 같은 id를 두지 않음) mapNote의
//   '지도에는 632년부터' 같은 문장만 고친다. byzantine-empire는 늘린 나라라 이 파일 395~631 줄과 medieval.mjs 632~698 줄이 joinEras에서 이어진 뒤 함께 유럽 버전에 더해진다.
//   631년 줄은 medieval.mjs 632년 줄(A3 632년 모습: 사산 끝·동로마 레반트·이집트·아프리카)과 견준다. 631·632 땅이 같아도 두 시대 파일 사이에서 버전이 632에서 끊길 뿐이다.
//   A3 도형과 1만 km² 넘게 다르면 medieval.mjs를 고치지 않고 결과 노트 '장부 후보'.
// 이 지역 왕조(파르티아·사산 등)의 아나톨리아·캅카스는 유럽 조각이라 칠하지 않는다(A3 결정과 같음, mapNote에 적음). 이 파일은 이 권역 조각만 칠한다.
// 월경지: 늘린 나라·이 권역 나라의 떨어진 덩어리(바다·칠하지 않은 사막 너머)는 check:exclaves 허용 목록 data/exclaves.yaml 끝에 '서아시아·북아프리카 A4 …' 절을 두고
//   A3 절(# ── 서아시아·북아프리카 A3a …)과 같은 꼴(entity·from·to·at·reason·sources)로 한 줄씩 더한다.
// 빈 땅 검사 구역: 표마다 주인 없는 단위를 뺀 권역 바깥선(아래 gapZonesOf, 이름 '서아시아 고대 …'). 주인 있는 단위가 하나도 없는 해는 구역을 만들지 않는다(빈 틀).
//   일부러 비운 땅은 voids에 이유와 함께 한 줄씩(medieval.mjs와 같은 꼴).
import { D, box } from '../../lib.mjs';
import { SISTAN } from './medieval.mjs';
import { ME, idsOf, minus, tableKit } from './table.mjs';

const { build, joinTables, makeTable } = tableKit('ancient');

const A4_START = -549; // 이 시대 파일의 첫 해: 기원전 550년(−549)
const A4_END = 632; // 이 시대 파일의 끝(미포함) = medieval.mjs의 첫 해(A3_START)

// ── 칼선 ─────────────────────────────────────────
// (구현이 더함: 칼선마다 무엇을 나누는지·근거·나누는 조각 id를 주석에 적는다. 같은 칼선이 다른 시대 파일에 있으면 import해 쓴다)
// 시스탄 북위 29°(⑥a): medieval.mjs의 SISTAN을 가져다 IR-13만 나눈다(아래 ⑥ 절 ownSplit, 시대 전체). 어림 선이라 lines 검사 키 없음
// 와디 바이한·마르카(⑥b): 샤브와주(YE-SH)를 동경 46.5°에서 나눈다. 서쪽은 카타반의 도읍 팀나(45.7°E)·와디 바이한·와디 마르카, 동쪽은 하드라마우트의 도읍 샤브와(47.0°E)·
//   항구 카나(비르 알리 48.3°E). 두 도읍 사이의 경계 서술이 없어 어림 선(lines 검사 키 없음). 서쪽 약 1.1만 km². 시대 전체(⑦은 힘야르가 290년 통일할 때 두 단위를 같은 주인으로)
const BAYHAN = box(45.0, 13.4, 46.5, 16.0);
// 알울라 골짜기(⑥b): 메디나주(SA-03)에서 리히얀의 데단(알쿠라이바)·헤그라(마다인 살리흐) 둘레만 떼어 낸다(notes-3 정할 점 10 상자 37.5,26,38.8,27.2, 메디나주 안 약 1.5만 km²).
//   오아시스 둘레 어림 상자(lines 검사 키 없음). 시대 전체(⑦은 헤그라를 기원전 24년(−23) 나바테아·106 로마로 잇는다)
const ALULA = box(37.5, 26.0, 38.8, 27.2);
// 도파르 해안(⑥b): 도파르주(OM-ZU)에서 해안 평야와 카라·카마르·삼한 산지(유향 산지, 북위 17.6°까지)만 떼어 낸다. 하드라마우트의 수무람(코르 로리 54.6°E)·
//   사칼란 땅(notes-3 확정 3 '해안 띠만', 약 2.1만 km²). 북쪽 나지드 사막은 비움(A3 632도 도파르를 비움). 어림 상자(lines 검사 키 없음). 시대 전체
const DHOFAR_COAST = box(52.5, 16.4, 55.5, 17.6);

// ── 조각 소유표 도우미 ─────────────────────────────
// 표 나눔은 유럽 표 경계 해에 맞춘다: 기원전 550년(−549)·기원전 263년(−263)·기원전 26년(−26)·284·476·632(끝, 미포함)
const BOUNDS = [A4_START, -263, -26, 284, 476, A4_END];
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …] (절마다 own으로 이어 붙임)
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < A4_START || e[0] >= A4_END)) {
    throw new Error(`middle-east ancient: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${A4_START} 이상 ${A4_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 절의 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`middle-east ancient: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = A4_START, to = A4_END } = {}) => {
  if (!BOUNDS.includes(from) || !BOUNDS.includes(to) || from >= to) throw new Error(`middle-east ancient: 나눈 조각 ${name}의 기간 [${from}, ${to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`middle-east ancient: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`middle-east ancient: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`middle-east ancient: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  const known = new Set([...ME.ids, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`middle-east ancient: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`middle-east ancient: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// 늘린 나라(앞 권역 나라, 권역 파일 EXTENDABLE): 원래 권역 항목 그대로. 주석의 기간은 EXTENDABLE 기간
const ACH = 'achaemenid-empire'; // europe, 기원전 550~330년(−549~−329)
const MAC = 'macedonia-kingdom'; // europe, 기원전 332~323년(−331~−322)
const SEL = 'seleucid-empire'; // europe, 기원전 312~64년(−311~−63)
const PTO = 'ptolemaic-kingdom'; // europe, 기원전 323~30년(−322~−29)
const CAR = 'carthage'; // europe, 기원전 550~146년(−549~−145)
const RRP = 'roman-republic'; // europe, 기원전 146~27년(−145~−26)
const ROM = 'roman-empire'; // europe, 기원전 27년(−26)~395
const WRE = 'western-roman-empire'; // europe, 395~481
const VAN = 'vandal-kingdom'; // europe, 429~534
const OSR = 'osroene'; // europe, 기원전 132년(−131)~214
const ANT = 'antigonid-asia'; // europe, 기원전 317~302(−316~−301) (질문 창구 ① 4)
const ARM = 'arsacid-armenia'; // europe, 티그라네스 2세 기원전 83~70(−82~−69) (질문 창구 ① 4)
const BYZ = 'byzantine-empire'; // europe, 395~631(632~698은 medieval.mjs)
// A3 항목 앞쪽(632 이음매): 항목은 data/entities/middle-east-medieval.yaml
const SAS = 'sasanian-empire'; // 224~631(632~651은 medieval.mjs)

// ── ⑥ 동 기원전 550~31(구현 A4a) ──
// (레반트·메소포타미아·이란·아라비아의 기원전 550~31년(−549~−30) 줄. ⑦이 같은 조각의 줄을 기원전 30년(−29)부터 잇는다)
// ⑥a 레반트(시리아·레바논·이스라엘·팔레스타인·요르단)·이라크·이란 (2026-10-31 구현 ⑥a)
// 등급: 일반(1만 km², 해 어긋남 5만 이상 3년·1만~5만 10년). 근거 문서: 조사 노트 notes-1(위키 영어 Neo-Babylonian Empire·Achaemenid Empire·Alexander the Great·
//   Wars of the Diadochi·Seleucid Empire·Parthian Empire·Mithridates I of Parthia·Atropatene·Kings of Persis·Elymais·Characene·Adiabene·Hasmonean dynasty·
//   Nabataean Kingdom·Ituraea·Tigranes the Great·Syria (Roman province)), 구현이 더 연 문서 Aretas III(다마스쿠스 기원전 85·72·69)·Phraates I(마르디 기원전 165).
// 운영자 결정(A4 질문 창구 ①·②): 종속 왕국은 자기 왕이 대를 이으면 따로 항목(① 2), 사막 조각은 A3 632년 잣대로 통째(② 1), 주인이 사료로 정해지지 않은 땅은 비움(② 4:
//   동부 이란 기원전 550~540·316~301, 시리아 자지라 기원전 129~83), 되돌려진 5년 미만 점령은 칠하지 않음(안티오코스 7세 기원전 130~129, 파르티아의 레반트 기원전 40~39,
//   티그라네스의 다마스쿠스 기원전 72~69), 영향권·명목 복속은 칠하지 않음(② 5: 안티오코스 3세의 파르티아 복속).
// 늘린 나라의 버전 해는 유럽 쪽 버전 해에 맞춤: 알렉산드로스의 레반트 기원전 333(−332, 티레·가자는 332), 메소포타미아·이란 기원전 331(−330),
//   안티고노스 기원전 317(−316), 셀레우코스의 바빌론 복귀 기원전 311(−310), 입소스 뒤 기원전 301(−300), 파니온 기원전 200(−199), 폼페이우스 기원전 64(−63).
// 아나톨리아·캅카스(유럽 조각)는 칠하지 않는다. 이집트·시나이는 ⑧(A4c), 아라비아 반도(쿠웨이트 포함)는 ⑥b가 이 절 아래 표지 뒤에 적는다.
const NBE = 'neo-babylonian-empire'; // 신바빌로니아 제국, 지도 기원전 550~540
const PAR = 'parthian-empire'; // 파르티아 제국, 지도 기원전 238(−237)부터
const ATR = 'atropatene'; // 아트로파테네 왕국, 기원전 323(−322)부터
const PER = 'persis-kingdom'; // 페르시스 왕국, 기원전 200 무렵(−199)부터
const ELY = 'elymais'; // 엘리마이스 왕국, 기원전 147(−146)부터(140/139~82는 파르티아 직할)
const CHA = 'characene'; // 카라케네 왕국, 기원전 127(−126)부터
const ADI = 'adiabene'; // 아디아베네 왕국, 기원전 69(−68)부터
const HAS = 'hasmonean-judea'; // 하스몬 왕국, 지도 기원전 104(−103)부터
const HER = 'herodian-judea'; // 헤롯 왕국, 기원전 37(−36)부터(⑦이 이음)
const ITU = 'ituraea'; // 이투라이아, 기원전 85 무렵(−84)부터
const NAB = 'nabataean-kingdom'; // 나바테아 왕국, 기원전 168 무렵(−167)부터(히자즈 북부 헤그라 쪽은 ⑥b가 같은 id로)
// 조각 묶음(⑦이 같은 이름으로 이어 써도 됨)
const ATROPATENE = ['IR-01', 'IR-02', 'IR-03', 'IR-11']; // 동·서아제르바이잔·아르다빌·잔잔
const MEDIA = ['IR-24', 'IR-22', 'IR-17', 'IR-16', 'IR-20', 'IR-05', 'IR-04', 'IR-26', 'IR-28', 'IRN-3216', 'IRN-5490', 'IR-19']; // 하마단·마르카지·케르만샤·쿠르디스탄·로레스탄·일람·이스파한·곰·카즈빈·테헤란·알보르즈·길란
const PERSIS = ['IR-14', 'IR-06']; // 파르스·부셰르
const ELYMAIS = ['IR-10', 'IR-08', 'IR-18']; // 후제스탄·차하르마할바흐티아리·코길루예
const PARTHIA_HOME = ['IR-30', 'IR-31', 'IR-27']; // 라자비·북호라산·골레스탄(히르카니아)
const EAST_IRAN = ['IR-15', 'IR-25', 'IR-29', 'IR-23']; // 케르만·야즈드·남호라산·호르모즈간
const ASSYRIA = ['IQ-NI', 'IQ-DA']; // 니나와·두호크
const ADIABENE = ['IQ-AR', 'IQ-SU', 'IQ-TS']; // 아르빌·술라이마니야·타밈(키르쿠크)
const BABYLONIA = ['IQ-BG', 'IQ-BB', 'IQ-KA', 'IQ-NA', 'IQ-QA', 'IQ-WA', 'IQ-DI', 'IQ-SD', 'IQ-AN', 'IQ-MU']; // 이라크 중부·남부(안바르·무탄나 사막 통째, 질문 창구 ② 1)
const CHARACENE = ['IQ-BA', 'IQ-MA', 'IQ-DQ']; // 바스라·마이산·디카르
const SYRIA_N = ['SY-HL', 'SY-ID', 'SY-HM', 'SY-LA', 'SY-TA', 'SY-HI']; // 알레포·이들리브·하마·라타키아·타르투스·홈스(팔미라 사막 통째)
const JAZIRA_S = ['SY-RA', 'SY-DY']; // 락카·다이르에조르
const DAMASCUS_HAURAN = ['SY-DI', 'SY-RD', 'SY-DR', 'SY-SU', 'JO-AM', 'JO-AZ', 'JO-MA']; // 다마스쿠스·하우란과 필라델피아(암만)·자르카·마프라크
const JUDEA = ['PS-WBK', 'IL-JM', 'IL-Z', 'IL-M', 'IL-TA', 'IL-HA', 'JO-BA', 'JO-MD', 'JO-IR', 'JO-AJ', 'JO-JA', 'SY-QU', 'SYR-5261']; // 유대·사마리아·갈릴래아·해안·페레아·길르앗·골란
const NABATAEA = ['IL-D', 'PS-GZZ', 'JO-MN', 'JO-AQ', 'JO-AT', 'JO-KA']; // 네게브·가자·에돔(페트라)·아카바·모압
const LEBANON = ['LB-AS', 'LB-BA', 'LB-BI', 'LB-JA', 'LB-JL', 'LB-NA'];
// 시스탄 북위 29°: medieval.mjs의 SISTAN(같은 선)을 가져다 IR-13을 시대 내내 나눈다(북쪽 시스탄, 남쪽 발루치스탄). ⑦은 'IR-13/시스탄'·'IR-13/발루치스탄'으로 잇는다
const IR13 = ownSplit('IR-13', ['IR-13'], [['시스탄', SISTAN]], '발루치스탄');
// 이란: 기원전 550(−549) 키루스가 메디아를 차지(서·중부와 아시리아 북부), 동부는 기원전 539(−538)에 아케메네스(결정 ② 4로 그전 비움)
own(ATROPATENE, [[-549, ACH], [-330, MAC], [-322, ATR]]); // 기원전 323 아트로파테스의 자립(셀레우코스·파르티아·티그라네스의 종주는 관계)
own(MEDIA, [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-146, PAR]]); // 메디아: 기원전 148/147 미트리다테스 1세의 엑바타나(141 설은 mapNote)
own(['IR-21'], [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-164, PAR]]); // 마잔다란(마르디): 기원전 165 프라아테스 1세가 마르디를 침
own(['IR-12'], [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-237, PAR]]); // 셈난(헤카톰필로스): 기원전 238 아르사케스 1세
own(PERSIS, [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-199, PER]]); // 기원전 200 무렵 프라타라카(셀레우코스 종속, 138 뒤 파르티아 종속)
own(ELYMAIS, [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-146, ELY], [-139, PAR], [-81, ELY]]); // 기원전 147 캄나스키레스 1세, 140/139~82 파르티아 직할
own(PARTHIA_HOME, [[-549, null], [-538, ACH], [-330, MAC], [-316, null], [-300, SEL], [-237, PAR]]); // 기원전 317~302(−316~−301) 비움(결정 ② 4), 기원전 238 파르티아
own([...EAST_IRAN, IR13['시스탄']], [[-549, null], [-538, ACH], [-330, MAC], [-316, null], [-300, SEL], [-139, PAR]]); // 동부 이란: 기원전 140/139 파르티아(기억값)
own([IR13['발루치스탄']], [[-549, null], [-538, ACH], [-330, MAC], [-316, null]]); // 발루치스탄(서부 게드로시아): 이 시기 지배 서술 없음(기원전 303 셀레우코스가 찬드라굽타에게 넘긴 것은 동부 게드로시아), 파르티아·사산 지배 근거 약함(A3와 같음)
// 이라크: 기원전 539(−538) 바빌론, 기원전 311(−310) 셀레우코스 1세, 기원전 141(−140) 미트리다테스 1세의 셀레우키아
own(ASSYRIA, [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-140, PAR]]);
own(ADIABENE, [[-549, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-140, PAR], [-68, ADI]]); // 기원전 69 무렵 아디아베네 왕(파르티아 종속)
own(BABYLONIA, [[-549, NBE], [-538, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-140, PAR]]);
own(CHARACENE, [[-549, NBE], [-538, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-140, PAR], [-126, CHA]]); // 기원전 127 히스파오시네스(124 뒤 파르티아 종속)
// 시리아 자지라: 유프라테스 동쪽은 메소포타미아와 함께 알렉산드로스 기원전 331(−330)·셀레우코스 기원전 311(−310). 기원전 129~84(−128~−83) 비움(결정 ② 4),
//   하사카는 기원전 83~70(−82~−69) 티그라네스의 미그도니아와 함께, 그 뒤 기원전 31(−30)까지 비움(주인이 사료로 정해지지 않음)
own(['SY-HA'], [[-549, NBE], [-538, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-128, null], [-82, ARM], [-68, null]]);
own(JAZIRA_S, [[-549, NBE], [-538, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-128, null]]);
// 레반트: 기원전 333(−332) 알렉산드로스, 317(−316) 안티고노스, 301(−300) 입소스 뒤 시리아 북부는 셀레우코스·코엘레시리아는 프톨레마이오스, 200(−199) 파니온
const LEVANT = [[-549, NBE], [-538, ACH], [-332, MAC], [-316, ANT], [-300, PTO], [-199, SEL]];
own(SYRIA_N, [[-549, NBE], [-538, ACH], [-332, MAC], [-316, ANT], [-300, SEL], [-82, ARM], [-68, SEL], [-63, RRP]]); // 기원전 83 티그라네스 2세, 69 안티오코스 13세, 64 폼페이우스
own(DAMASCUS_HAURAN, [...LEVANT, [-84, NAB], [-63, RRP]]); // 기원전 85 아레타스 3세의 다마스쿠스(72~69 티그라네스는 되돌려져 안 칠함), 64 폼페이우스
own(JUDEA, [...LEVANT, [-103, HAS], [-36, HER]]); // 기원전 104/103 히르카노스 1세·아리스토불로스 1세(얀나이오스의 해안·골란·길르앗은 묶음), 37 헤롯
own(NABATAEA, [...LEVANT, [-167, NAB]]); // 기원전 169/168 아레타스 1세(3세기 설은 mapNote)
own(LEBANON, [...LEVANT, [-84, ITU]]); // 기원전 85 무렵 프톨레마이오스 메나이오스(64 뒤 로마 종속)
// ── ⑥a 끝 · ⑥b(아라비아 반도: 사우디아라비아·예멘·오만·아랍에미리트·카타르·바레인·쿠웨이트) 줄은 이 아래에 ──
// ⑥b 아라비아 반도(사우디아라비아·예멘·오만·아랍에미리트·카타르·바레인·쿠웨이트) (2026-10-31 구현 ⑥b)
// 등급: 예멘·히자즈·오만·걸프 해안은 일반, 나지드·룹알할리는 주변(zones.yaml arabia-interior). 근거 문서: 조사 노트 notes-3(위키 영어 Kingdom of Saba·Qataban·
//   Kingdom of Hadramaut·Himyarite Kingdom·Lihyan·Tayma·Ma'in·Awsan·Gerrha·Arabia (satrapy)·Maka (satrapy)·Tylos), 구현이 더 연 문서 Sheba(기원전 6세기 뒤 사바는
//   마리브·시르와 핵심, 사나는 기원후 1~3세기 둘째 도읍)·Kingdom of Hadramaut(동·남은 인도양, 도파르는 영토)·Nabataean Kingdom(히자즈 땅의 해 서술 없음).
// 운영자 결정(A4 질문 창구 ②): 예멘 사막 조각은 A3 632년 잣대로 통째(② 1: 하드라마우트·마흐라 조각), 영향권·조공은 칠하지 않음(② 5: 아케메네스의 아라비아 조공,
//   나보니두스의 타이마–야스리브), 카타반 최대기는 칠함(② 6). 확정(기본) notes-3 3절: 마인·아우산·케다르·게라·바레인섬·오만 내륙·메카 메디나는 그리지 않음,
//   하드라마우트의 도파르는 기원전 250 무렵부터 해안 띠만. 그리지 않은 땅은 아래 voids에 이유.
// 기원전 6세기에 카타반·하드라마우트가 사바를 받들던 일(5세기에 자립)은 해가 흐려 관계를 걸지 않고 mapNote에 적는다.
const SAB = 'saba-kingdom'; // 사바 왕국, 지도 기원전 550년부터(⑦이 이음)
const QTB = 'qataban'; // 카타반 왕국, 지도 기원전 550년부터
const HAD = 'hadramawt-kingdom'; // 하드라마우트 왕국, 지도 기원전 550년부터
const HIM = 'himyarite-kingdom'; // 힘야르 왕국, 기원전 110(−109)부터
const LIH = 'lihyan'; // 리히얀 왕국, 기원전 400 무렵(−399)부터(⑦이 기원전 24년(−23) 나바테아로 잇는다)
// 조각 묶음
const SW_YEMEN = ['YE-TA', 'YE-IB', 'YE-DH', 'YE-RA', 'YE-DA', 'YE-LA', 'YE-AD']; // 타이즈·이브(자파르)·다마르·라이마·달리·라헤즈·아덴: 남서 고지와 밥알만답·아덴
const N_YEMEN = ['YE-SN', 'YE-SA', 'YE-AM', 'YE-SD', 'YE-HJ', 'YE-MW', 'YE-HU']; // 사나 고지·암란·사다·하자·마흐위트·후다이다(티하마)
const KUWAIT = idsOf('KWT');
const YESH = ownSplit('YE-SH', ['YE-SH'], [['바이한', BAYHAN]], '샤브와'); // 샤브와주: 서쪽 와디 바이한·마르카(카타반), 동쪽 샤브와·카나(하드라마우트)
const SA03 = ownSplit('SA-03', ['SA-03'], [['알울라', ALULA]], '메디나'); // 메디나주: 알울라 골짜기(리히얀)와 나머지
const OMZU = ownSplit('OM-ZU', ['OM-ZU'], [['해안', DHOFAR_COAST]], '내륙'); // 도파르주: 해안 평야·유향 산지와 북쪽 사막
// 예멘: 사바는 기원전 6세기 뒤 마리브·시르와 핵심(마리브주)만. 카타반은 와디 바이한·마르카와 바이다(라드만), 기원전 250 무렵 사바에서 땅을 빼앗아 밥알만답까지(결정 ② 6),
//   기원전 110 힘야르가 남서 고지를 가지고 떨어져 나감. 하드라마우트는 와디 하드라마우트·마시라, 기원전 250 무렵부터 마흐라와 도파르 해안(동쪽 해안 진출, 마흐라 조각은 결정 ② 1로 통째)
own(['YE-MA'], [[-549, SAB]]); // 마리브·시르와(하리브 쪽 카타반 몫은 1만 미만)
own([YESH['바이한'], 'YE-BA'], [[-549, QTB]]); // 팀나·와디 바이한·마르카와 바이다
own(SW_YEMEN, [[-549, null], [-249, QTB], [-109, HIM]]); // 기원전 250 무렵 카타반 최대기, 기원전 110 힘야르의 자립(도읍 자파르)
own(['YE-AB'], [[-549, null], [-249, QTB], [-109, null]]); // 아비얀: 카타반 최대기만(힘야르 자립 뒤 카타반은 바이한 둘레로 줄어듦)
own([YESH['샤브와'], 'YE-HD'], [[-549, HAD]]); // 샤브와·카나와 와디 하드라마우트·마시라
own(['YE-MR'], [[-549, null], [-249, HAD]]); // 마흐라: 기원전 250 무렵 도파르 해안과 같은 해(동쪽 해안 진출의 해가 있는 근거는 수무람·카나뿐)
own([OMZU['해안']], [[-549, null], [-249, HAD]]); // 도파르 해안: 기원전 3세기 수무람(사칼란) — notes-3 확정 3
// 히자즈 북부: 리히얀은 알울라 골짜기(데단·헤그라)만. 타이마·타부크·와디 시르한은 비움(나보니두스·아케메네스는 결정 ② 5, 나바테아의 히자즈는 기원전 31 전 해가 없음)
own([SA03['알울라']], [[-549, null], [-399, LIH]]); // 기원전 400 무렵 리히얀(전통 연대)
// 쿠웨이트: 바스라(카라케네 조각 묶음)와 같은 주인(결정 ② 1, A3 632도 쿠웨이트를 이라크 남부와 함께 칠함). 파일라카섬(이카로스)의 셀레우코스 요새
own(KUWAIT, [[-549, NBE], [-538, ACH], [-330, MAC], [-316, ANT], [-310, SEL], [-140, PAR], [-126, CHA]]);

// ── ⑦ 동 기원전 30~631(구현 A4b) ──
// (⑥ 줄을 own(같은 단위, [[−29, 주인], …])으로 잇는다. 631년 줄은 medieval.mjs 632년 줄과 견준다)

// ── ⑧ 서 전 시대(구현 A4c) ──
// (이집트·리비아·마그레브의 기원전 550년(−549)~631 줄)

// ── A4a 임시 끝(⑦ A4b가 지움): ⑦이 기원전 30년(−29)부터 줄을 잇기 전까지 ⑥ 단위를 −29부터 주인 null로 둔다 ──
//   ⑥의 마지막 주인이 631년까지 이어지지 않게(로마 공화정은 늘리기 기간이 기원전 27년(−26)에 끝남). ⑦은 이 블록을 지우고 같은 단위를 own(…, [[-29, 주인], …])으로 잇는다.
//   ⑥b는 자기 단위를 이 목록에 더한다. 이 블록의 null은 아직 그리지 않은 땅이라 voids에 적지 않는다
const A4A_UNTIL_A4B = [...ATROPATENE, ...MEDIA, 'IR-21', 'IR-12', ...PERSIS, ...ELYMAIS, ...PARTHIA_HOME, ...EAST_IRAN, IR13['시스탄'], IR13['발루치스탄'],
  ...ASSYRIA, ...ADIABENE, ...BABYLONIA, ...CHARACENE, 'SY-HA', ...JAZIRA_S, ...SYRIA_N, ...DAMASCUS_HAURAN, ...JUDEA, ...NABATAEA, ...LEBANON,
  'YE-MA', YESH['바이한'], 'YE-BA', ...SW_YEMEN, 'YE-AB', YESH['샤브와'], 'YE-HD', 'YE-MR', OMZU['해안'], SA03['알울라'], ...KUWAIT]; // ⑥b 단위(칠한 아라비아 단위)
own(A4A_UNTIL_A4B, [[-29, null]]);

// ── 나머지: 줄을 적지 않은 단위는 시대 내내 주인 null(아직 그리지 않음) ──
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역 ──
// 버전의 to는 숫자 그대로 둔다(마지막 표 끝 A4_END = medieval.mjs의 첫 해). 늘린 나라의 버전은 joinEras가 extensions로 옮긴다
const joined = joinTables(TABLES);
if (joined.TO !== A4_END) throw new Error(`middle-east ancient: 마지막 표의 끝이 ${joined.TO} (${A4_END}이어야 medieval.mjs와 이어짐)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));
// 주인 있는 단위가 하나도 없는 기간(빈 틀·아직 그리지 않은 시대)은 구역을 만들지 않는다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapZonesOf = (nullSegments) => nullSegments.filter(([from, to]) => ownedIn(from, to)).map(([from, to, list]) => ({ name: `서아시아 고대 ${from}~${to - 1}`, zone: list.length ? D(ME.domain, build(list)) : ME.domain, from, to }));
const gapZones = gapZonesOf(joined.nullSegments);

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). [from, to, 도형], // 이유
// V(from, to, 조각 id…)·B(from, to, 단위 이름…)로 한 줄씩 적는다(medieval.mjs와 같은 꼴). 절마다 '// ── ⑥ …' 머리 아래에
const V = (from, to, ...ids) => [from, to, ME.F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)]; // 나눈 조각 단위(이름/부분)도 받음
const voids = [
  // ── ⑥ 동 기원전 550~31 ──
  V(-549, -538, ...PARTHIA_HOME, ...EAST_IRAN, 'IR-13'), // 동부 이란 기원전 550~540: 키루스의 동방 정복이 539 전으로 확인되지 않음(결정 창구 ② 4)
  V(-316, -300, ...PARTHIA_HOME, ...EAST_IRAN, 'IR-13'), // 동부 이란 기원전 317~302: 알렉산드로스 뒤 동방 사트라프의 자립, 셀레우코스는 305~303 원정·301 뒤(결정 창구 ② 4)
  B(-300, -29, 'IR-13/발루치스탄'), // 발루치스탄(서부 게드로시아): 이 시기 셀레우코스·파르티아의 지배 서술 없음(기원전 303 셀레우코스가 마우리아에 넘긴 것은 동부 게드로시아, 결정 ② 4와 같은 원칙, A3 632와 같음, 운영자 확인 후보)
  V(-128, -82, 'SY-HA', ...JAZIRA_S), // 시리아 자지라 기원전 129~84: 오스로에네·파르티아·셀레우코스 사이로 직접 지배 서술 없음(결정 창구 ② 4)
  V(-82, -29, ...JAZIRA_S), // 락카·다이르에조르 기원전 83~31: 같은 까닭(⑦이 기원전 30부터 잇는 비움과 같음)
  V(-68, -29, 'SY-HA'), // 하사카 기원전 69~31: 티그라네스가 물러난 뒤 주인이 사료로 정해지지 않음
  // ⑥b 아라비아 반도
  V(-549, -29, 'YE-JA'), // 와디 자우프: 마인 왕국(정주 땅 1만 km² 안팎이라 그리지 않음, notes-3 확정 3 — 사바에 넣지 않고 비움)
  V(-549, -29, ...N_YEMEN), // 사나 고지·암란·사다·하자·티하마: 기원전 6세기 뒤 사바는 마리브·시르와 핵심으로 줄었고(사나는 기원후 1세기부터 둘째 도읍) 고지·해안 부족 땅을 다스린 나라 근거 없음
  V(-549, -249, ...SW_YEMEN, 'YE-AB'), // 남서 고지·아덴·아비얀 기원전 550~251: 카타반이 밥알만답까지 넓히기 전, 아우산은 기원전 7세기 사바에 파괴됨(다스린 나라 근거 없음)
  V(-109, -29, 'YE-AB'), // 아비얀 기원전 110~31: 힘야르 자립 뒤 카타반은 바이한 둘레로 줄고, 다시 일어난 아우산은 1만 km² 미만이라 그리지 않음
  V(-549, -249, 'YE-MR'), // 마흐라 기원전 550~251: 하드라마우트가 동쪽 해안·도파르로 나간 기원전 3세기 전, 마흐라 지배 서술 없음
  B(-549, -249, 'OM-ZU/해안'), // 도파르 해안 기원전 550~251: 하드라마우트가 수무람을 세운 기원전 3세기 전(notes-3 확정 3)
  B(-549, -29, 'OM-ZU/내륙'), // 도파르 북쪽 사막(나지드·룹알할리 가장자리): 사막 내륙(A3 632도 비움)
  V(-549, -29, ...minus(idsOf('OMN'), 'OM-ZU'), ...idsOf('ARE')), // 오만·아랍에미리트: 아케메네스의 마카는 메크란으로 보고(notes-3 확정 8) 오만 내륙·해안 집단을 땅으로 적은 사료가 없음
  V(-549, -29, ...idsOf('QAT', 'BHR'), 'SA-04'), // 카타르·바레인·알하사: 게라는 위치·영토가 정해지지 않고(notes-3 확정 6) 틸로스(바레인섬)는 1만 km² 미만, 안티오코스 3세의 기원전 205 원정은 칠하지 않음
  V(-549, -29, 'SA-01', 'SA-05', 'SA-06', 'SA-02', 'SA-11'), // 나지드·히자즈 중부: 부족 땅, 메카·메디나는 이슬람 전 나라 없음(notes-3 확정 12)
  B(-549, -29, 'SA-03/메디나'), // 메디나주(알울라 골짜기 밖): 야스리브는 다스린 나라 없음, 나보니두스의 야스리브는 칠하지 않음(결정 창구 ② 5)
  B(-549, -399, 'SA-03/알울라'), // 알울라 골짜기 기원전 550~401: 리히얀 앞 데단 왕들(땅 서술 없음)과 나보니두스의 데단 원정(결정 창구 ② 5)
  V(-549, -29, 'SA-07'), // 타부크·타이마: 나보니두스의 타이마·아케메네스의 아라비아 조공은 칠하지 않음(결정 창구 ② 5), 나바테아의 히자즈 지배는 기원전 31 전 해가 없음
  V(-549, -29, 'SA-08', 'SA-12'), // 북부 국경·자우프(두마·와디 시르한): 케다르 부족 연합(영토 불명, notes-3 확정 5)과 사막 내륙(A3 632도 비움)
  V(-549, -29, 'SA-09', 'SA-10', 'SA-14'), // 지잔·나즈란·아시르: 카리브일 와타르의 기원전 7세기 원정 뒤 다스린 나라 근거 없음
  // ── ⑦ 동 기원전 30~631 ──
  // ── ⑧ 서 전 시대 ──
];

export const era = {
  name: 'ancient',
  versions,
  gapZones,
  voids,
};
