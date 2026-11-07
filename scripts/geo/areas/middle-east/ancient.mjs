// middle-east 시대 파일 ancient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 550~631: 아케메네스·헬레니즘 왕국·로마·파르티아·사산, 카르타고·누미디아, 이슬람 이전 아라비아
// 짝 항목 파일: data/entities/middle-east-ancient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다. 아래 '늘린 나라'와 'A3 항목 앞쪽'은 예외)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east/의 다른 도우미 모듈. areas/middle-east.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
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
import { D, U, box } from '../../lib.mjs';
import { HASA } from './early-modern.mjs';
import { SISTAN } from './medieval.mjs';
import { SPANISH_ZONE } from './modern.mjs';
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
// 물루야강 하류(⑧b): 모로코 동부 조각 MA-04를 물루야강에서 나눈다. 마우레타니아와 마사이실리·누미디아의 옛 경계(물루차강, notes-5 정할 점 2 확정(기본)).
//   강 하류를 따른 선은 modern.mjs의 SPANISH_ZONE(1912 스페인 보호령 동쪽 끝이 물루야강 하류·하구)을 가져다 쓴다: MA-04 안에서 그 안쪽이 강 서쪽(나도르·드리우치, 약 7,100 km²).
//   보호령 남쪽 경계 아래 MA-04 서쪽 끝 자투리(서경 3.34~3.63°, 약 280 km², 게르시프 북쪽 강 서쪽)는 상자 하나를 더해 같은 쪽에 넣는다(어림, lines 검사 키 없음)
const MOULOUYA_W = U(SPANISH_ZONE, box(-4.0, 34.1, -3.3, 34.8));
// 모로코 동부 텔 남쪽 끝(⑧b): MA-04에서 강 동쪽 텔(우지다·베르칸·제라다)과 남쪽 고원(피기그·아인베니마타르)을 북위 34.1°로 가른다. 알제리 쪽 틀렘센 DZ-13 남쪽 끝(34.09°)과
//   나아마 DZ-45 북쪽 끝(34.31°) 사이의 어림 선(lines 검사 키 없음). 고원은 마시니사 누미디아 고원 전체를 칠하지 않는 결정 창구 ② 5와 같은 까닭으로 비운다. 강 동쪽 텔 약 1.2만 km²
const ORIENTAL_TELL = box(-4.0, 34.1, -1.0, 35.6);
// 볼루빌리스 둘레(⑧c): 메크네스–타필랄트 조각 MA-06의 북쪽 끝(사이스 평야의 볼루빌리스·메크네스)을 북위 33.6°로 가른다. 유바 2세의 둘째 도읍이자 팅기타나 속주의 남쪽 끝
//   (결정 창구 ② 5 '볼루빌리스 둘레는 MA-06 북부만 칼선', 남쪽 중부 아틀라스·타필랄트는 칠하지 않음). 어림 선(약 3,762 km²), lines 검사 키 없음
const VOLUBILIS = box(-6.5, 33.6, -4.9, 34.5);

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
const NAB = 'nabataean-kingdom'; // 나바테아 왕국, 기원전 168 무렵(−167)부터(히자즈 북부 헤그라 쪽은 ⑦c가 같은 id로)
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
// ⑦a 레반트(시리아·레바논·이스라엘·팔레스타인·요르단)·시리아 자지라 (2026-10-31 구현 ⑦a)
// 등급: 일반(1만 km², 해 어긋남 5만 이상 3년·1만~5만 10년). 근거 문서: 조사 노트 notes-2(위키 영어 Syria (Roman province)·Judea (Roman province)·Herod the Great·
//   Herodian kingdom·Agrippa II·Ituraea·Nabataean Kingdom·Mesopotamia (Roman province)·Palmyrene Empire·Byzantine–Sasanian War of 602–628).
// 운영자 결정(A4 질문 창구 ①·②): 종속 왕국은 따로 항목과 종주 관계(① 2), 사막 조각은 A3 632년 잣대로 통째(② 1: 홈스·마프라크·마안·네게브),
//   사산 점령은 5년을 넘어 칠함(② 2 B: 시리아 자지라 610~628, 레반트 615~628, 629부터 동로마 — 트라야누스 114~117은 칠하지 않음),
//   팔미라 제국 270~272는 그리지 않고 로마 색(② 3), 시리아 자지라 기원전 30년~기원후 194는 비움(② 4, 하트라는 따로 그리지 않음).
// 늘린 나라의 버전 해는 유럽 쪽 버전 해에 맞춤: 로마 공화정 기원전 30(−29)~28(−27), 로마 제국 기원전 27(−26)부터, 이투라이아 병합 47(실제 49, 유럽 47 버전),
//   아라비아 속주 106, 메소포타미아 속주 195(세베루스의 재편 195~198), 동로마 395. 유대 속주 6과 아그리파 2세 끝 92는 유럽 쪽 가까운 해가 없어 새 버전.
// 헤롯 왕국은 한 왕조 안의 나눔(기원전 4년 헤롯의 세 아들)을 한 항목으로 둔다. 1만 km² 미만 변화(아그리파 1세의 41~44 재통일 8,900 km² 안팎·3년,
//   필리포스 땅의 34~37 시리아 편입, 44~53 아그리파 2세 전 공백, 칼키스)는 버전을 만들지 않는다.
const JUDEA_CORE = ['PS-WBK', 'IL-JM', 'IL-M', 'IL-TA', 'IL-HA']; // 유대·사마리아·이두메아 북부와 해안 평야(카이사레아·욥바): 6년 아르켈라오스 폐위 뒤 유대 속주
const DECAPOLIS_S = ['JO-IR', 'JO-AJ', 'JO-JA']; // 가다라·펠라·게라사 둘레(데카폴리스): 헤롯 뒤 시리아 속주(기원전 4년 가다라 반환을 6과 한데 묶음, 1만 km² 미만)
const GALILEE_PERAEA = ['IL-Z', 'JO-BA', 'JO-MD', 'SY-QU', 'SYR-5261']; // 갈릴래아·페레아(안티파스)와 골란(필리포스): 아그리파 1세·2세로 이어짐
const HAURAN = ['SY-DR', 'SY-SU']; // 바타나이아·트라코니티스·아우라니티스(하우란): 제노도로스(이투라이아) → 기원전 22 헤롯 → 필리포스 → 아그리파 2세
const LEVANT7 = [[395, BYZ], [615, SAS], [629, BYZ]]; // 395 동로마, 615~628 사산 점령(결정 ② 2 B), 629 헤라클레이오스에게 반환
own([...SYRIA_N, 'SY-DI', 'SY-RD', 'JO-AM', 'JO-AZ', 'JO-MA'], [[-29, RRP], [-26, ROM], ...LEVANT7]); // 시리아 속주: 시리아 북부·홈스(에메사·팔미라는 종속 도시라 로마 색)·다마스쿠스·필라델피아,
//   마프라크 사막은 ⑥a처럼 로마(움엘지말 둘레 나바테아 정주는 1만 km² 미만, 사막은 결정 ② 1로 이웃 조각 주인과 함께 — 나바테아로 두면 암만주에 막혀 월경지가 됨)
own([...JUDEA_CORE, ...DECAPOLIS_S], [[-29, HER], [6, ROM], ...LEVANT7]); // 기원전 30 아우구스투스가 해안 도시·가다라·히포스를 헤롯에게 돌려줌, 6 유대 속주
own(GALILEE_PERAEA, [[-29, HER], [92, ROM], ...LEVANT7]); // 안티파스·필리포스, 아그리파 1세(37·39), 아그리파 2세(53·54)가 이음. 92 무렵 아그리파 2세가 죽은 뒤 시리아 속주
own(HAURAN, [[-29, ITU], [-21, HER], [92, ROM], ...LEVANT7]); // 기원전 23/22 아우구스투스가 제노도로스에게서 떼어 헤롯에게 줌
own(LEBANON, [[-29, ITU], [47, ROM], ...LEVANT7]); // 이투라이아(칼키스·베카, 해안 자유 도시는 근사로 함께), 49 소하이무스가 죽은 뒤 시리아 속주
own(NABATAEA, [[-29, NAB], [106, ROM], ...LEVANT7]); // 나바테아(에돔·모압·아카바·네게브, 보스트라 둘레 하우란 남부는 1만 km² 미만이라 하우란과 함께), 106 트라야누스의 아라비아 속주
// 시리아 자지라(하사카·락카·다이르에조르): 기원전 30~기원후 194 비움(결정 ② 4), 195 세베루스의 메소포타미아 속주(유럽 195 버전), 610~628 사산 점령(에데사 610)
own(['SY-HA', ...JAZIRA_S], [[-29, null], [195, ROM], [395, BYZ], [610, SAS], [629, BYZ]]);
// ── ⑦a 끝 · ⑦b(이라크·이란) 줄은 이 아래에 ──
// ⑦b 이라크·이란 (2026-10-31 구현 ⑦b)
// 등급: 일반(1만 km², 해 어긋남 5만 이상 3년·1만~5만 10년). 근거 문서: 조사 노트 notes-2(위키 영어 Parthian Empire·Sasanian Empire·Ardashir I·Ctesiphon·Hatra·
//   Lakhmids·Al-Hirah·Sasanian civil war of 628–632, 위키 한국어 아디아베네), notes-1(Atropatene·Kings of Persis·Elymais·Characene·Adiabene).
// 운영자 결정(A4 질문 창구 ①·②): 종속 왕국은 따로 항목과 종주 관계(① 2: 아트로파테네·페르시스·엘리마이스·카라케네·아디아베네, 라흠 왕국), 사막 조각은 A3 632년 잣대로 통째
//   (② 1: 안바르·무탄나, 라흠은 나자프·카르발라·카디시야·바빌 조각 통째), 5년 미만 원정·점령은 칠하지 않음(② 2 B: 트라야누스 114~117, 카루스 283, 샤푸르 1세·2세의 시리아 침공),
//   동부 이란 226~239 비움(② 4, 파르티아 항목이 224에 끝나 225부터 비움), 하트라는 따로 그리지 않음(② 4). 발루치스탄은 A3 632년 모습처럼 시대 내내 비움.
// 해: 카라케네 222(페르시스의 아르다시르가 차지), 페르시스·엘리마이스 224(아르다시르 1세가 아르타바누스 4세를 이긴 해, 사산 항목 시작), 이란 서·중부와 이라크 225
//   (파르티아 항목 끝 224의 다음 해, 크테시폰은 226 무렵), 아트로파테네 226, 이란 동부 240(아르다시르 말년, 하트라 함락과 같은 해), 아디아베네 379,
//   라흠 293(나르세의 파이쿨리 비문) ~ 602(호스로 2세가 누만 3세를 없애고 직할). 363 조약으로 얻은 싱가라 둘레와 628~631 내전은 버전을 만들지 않는다.
const LAK = 'lakhmid-kingdom'; // 라흠 왕국, 293~601(602 사산 직할)
const IRAN_WEST7 = [...MEDIA, 'IR-21', 'IR-12', 'IR-15', 'IR-25', 'IR-23']; // 이란 서·중부(메디아 묶음)·마잔다란·셈난·케르만·야즈드·호르모즈간
const IRAN_EAST7 = [...PARTHIA_HOME, 'IR-29', IR13['시스탄']]; // 라자비·북호라산·골레스탄(고르간)·남호라산·시스탄
const HIRA = ['IQ-NA', 'IQ-KA', 'IQ-QA', 'IQ-BB']; // 나자프·카르발라·카디시야·바빌: 알히라 둘레(라흠 왕국, 사막 쪽 조각 통째)
own(ATROPATENE, [[-29, ATR], [226, SAS]]); // 226 무렵 아르다시르 1세에게 넘어감
own([...IRAN_WEST7, ...ASSYRIA, ...minus(BABYLONIA, ...HIRA)], [[-29, PAR], [225, SAS]]); // 파르티아 → 사산(224 호르모즈간 싸움, 크테시폰 226 무렵)
own(HIRA, [[-29, PAR], [225, SAS], [293, LAK], [602, SAS]]); // 알히라 둘레: 293 라흠 왕국(사산 종속), 602 사산 직할
own(IRAN_EAST7, [[-29, PAR], [225, null], [240, SAS]]); // 이란 동부: 파르티아 끝 뒤 225~239 비움(결정 ② 4), 240 사산
own(PERSIS, [[-29, PER], [224, SAS]]); // 224 페르시스 왕 아르다시르 1세가 사산 제국을 세움
own(ELYMAIS, [[-29, ELY], [224, SAS]]); // 224 무렵 아르다시르 1세가 정복
own(CHARACENE, [[-29, CHA], [222, PER], [224, SAS]]); // 222 무렵 페르시스의 아르다시르가 메세네를 차지, 224 사산
own(ADIABENE, [[-29, ADI], [379, SAS]]); // 379 무렵 사산 속주(마지막 왕 아르다시르 2세)
own([IR13['발루치스탄']], [[-29, null]]); // 발루치스탄: 파르티아·사산의 지배 서술이 없음(A3 632년 모습과 같음)
// ── ⑦b 끝 · ⑦c(아라비아 반도: 쿠웨이트 포함) 줄은 이 아래에 ──
// ⑦c 아라비아 반도(사우디아라비아·예멘·오만·아랍에미리트·카타르·바레인·쿠웨이트) (2026-10-31 구현 ⑦c)
// 등급: 예멘·히자즈·오만·걸프 해안은 일반, 나지드·룹알할리는 주변(zones.yaml arabia-interior). 근거 문서: 조사 노트 notes-3(위키 영어 Himyarite Kingdom·Kingdom of Saba·
//   Qataban·Kingdom of Hadramaut·Kingdom of Aksum·Abraha·Aksumite–Persian wars·Mazun (Sasanian province)·Tylos·Lihyan·Arabia Petraea·Ridda wars), 구현이 더 연 문서
//   Sanaa(사바가 1세기에 둘째 도읍으로 세움)·Hegra (Mada'in Salih)(아레타스 4세 때 나바테아의 둘째 도읍, 로마군은 2세기 말~3세기 초에 떠남).
// 운영자 결정(A4 질문 창구 ②): 예멘 사막 조각은 A3 632년 잣대로 통째(② 1: 하드라마우트·마흐라·자우프 조각, A3가 비운 나지란 조각은 비움), 힘야르의 나지드·마아드는
//   칠하지 않음(② 5), 사산의 마준·바레인·알하사 해안 띠 240~627 칠함(② 6, estimated), 사산의 예멘·마준은 627년 말 모습이 마지막이고 628~631 반도는 비움(② 7),
//   종주는 실제 다스린 나라 색(① 2: 악숨령 예멘은 따로 항목, 사산 예멘은 총독령이라 사산 색). 타부크는 기원전 24년~기원후 194년 나바테아·로마(검토 Q1 운영자 답 B).
// 해: 리히얀 끝 기원전 24년(−23) 나바테아, 50 무렵 사바의 사나(1세기 둘째 도읍, 해 흐림), 106 로마 아라비아 속주의 헤그라, 195 로마군이 헤그라를 떠남(유럽 195 버전),
//   200 무렵 카타반 끝(하드라마우트), 240 아르다시르 1세의 동아라비아 정복, 275 무렵 힘야르의 사바 합병, 290 무렵 힘야르의 하드라마우트 병합(남아라비아 통일),
//   525 악숨의 정복, 570 사산의 사나 함락(와흐리즈), 628 사산 내전 속 예멘·마준 총독의 이탈.
const AKS = 'aksumite-yemen'; // 악숨령 예멘, 525~569(570 사산)
const SANA = ['YE-SN', 'YE-SA']; // 사나 고지(사나주·사나시)
const N_YEMEN_REST = minus(N_YEMEN, ...SANA); // 암란·사다·하자·마흐위트·후다이다(티하마)
const SA04 = ownSplit('SA-04', ['SA-04'], [['하사', HASA]], '사막'); // 동부 주: 알하사 오아시스·카티프 해안(early-modern.mjs의 HASA 상자)과 룹알할리 사막
const MAZUN = ['OM-MU', 'OM-BA', 'OM-BJ', 'OM-MA', 'AE-RK', 'AE-FU', 'AE-SH', 'AE-UQ', 'AE-AJ', 'AE-DU', 'ARE-344', 'ARE-347']; // 무산담·바티나·무스카트와 아랍에미리트 북부 해안(소하르·루스타크·디바 쪽 해안 수비대)
const OMAN_IN = ['OM-DA', 'OM-ZA', 'OM-BU', 'OM-SS', 'OM-SH', 'OM-WU', 'AE-AZ']; // 오만 내륙(줄란다 가문 땅)·샤르키야·알우스타와 아부다비 사막
const YEMEN7 = [[525, AKS], [570, SAS], [628, null]]; // 525 악숨, 570 사산 총독령, 628 사산 내전 속 이탈(결정 ② 7)
// 남아라비아: 카타반은 200 무렵 하드라마우트가 바이한(팀나)·바이다를 차지해 끝남(바이다 9천 km²는 힘야르와 나눈 몫을 따로 버전으로 만들지 않음),
//   275 무렵 힘야르가 사바(마리브·사나)를, 290 무렵 하드라마우트와 남은 땅(북예멘 고지·티하마·자우프·아비얀·지잔)을 합쳐 남아라비아를 통일
own(['YE-MA'], [[-29, SAB], [275, HIM], ...YEMEN7]); // 마리브·시르와
own(SANA, [[-549, null], [50, SAB], [275, HIM], ...YEMEN7]); // 사나: 1세기 사바의 둘째 도읍(해 흐림, 50으로 둠, ⑥에는 줄이 없어 기원전 550년부터 적음)
own([YESH['바이한'], 'YE-BA'], [[-29, QTB], [200, HAD], [290, HIM], ...YEMEN7]); // 팀나·와디 바이한과 바이다: 200 무렵 하드라마우트가 팀나를 무너뜨림
own(SW_YEMEN, [[-29, HIM], ...YEMEN7]); // 자파르·남서 고지와 아덴
own([YESH['샤브와'], 'YE-HD', 'YE-MR', OMZU['해안']], [[-29, HAD], [290, HIM], ...YEMEN7]); // 샤브와·와디 하드라마우트·마흐라·도파르 해안(소코트라 포함)
own(['YE-AB'], [[-29, null], [290, HIM], ...YEMEN7]); // 아비얀: 290 통일 때부터
own(['YE-JA', ...N_YEMEN_REST, 'SA-09'], [[-549, null], [290, HIM], ...YEMEN7]); // 자우프·북예멘 고지·티하마·지잔(두 누와스의 파라산): 290 통일 때부터(⑥에는 줄이 없어 기원전 550년부터 적음)
// 히자즈 북부: 알울라 골짜기(데단·헤그라)는 기원전 24년(−23) 리히얀이 나바테아에 합쳐지고 106 로마 아라비아 속주, 195 로마군이 떠난 뒤 비움
own([SA03['알울라']], [[-29, LIH], [-23, NAB], [106, ROM], [195, null]]);
own(['SA-07'], [[-549, null], [-23, NAB], [106, ROM], [195, null]]); // 타부크(히스마·마디안·레우케 코메 해안): 기원전 24년 무렵 헤그라와 함께 나바테아(레우케 코메는 기원전 26~25년 이미 나바테아 땅), 106 로마 아라비아 속주(루와파 비문 165~169), 195 로마군이 떠난 뒤 비움
// 쿠웨이트: 바스라(카라케네 조각 묶음)와 같은 길(결정 ② 1, A3 632도 사산) — 222 페르시스의 아르다시르, 224 사산
own(KUWAIT, [[-29, CHA], [222, PER], [224, SAS]]);
// 동아라비아: 240 무렵 아르다시르 1세가 정복한 알하사·카티프 해안과 카타르·바레인(사산의 바레인 주), 마준(오만 바티나·무산담 해안)은 사산 색(결정 ② 6, estimated), 628 이탈
own([SA04['하사'], ...idsOf('QAT', 'BHR'), ...MAZUN], [[-549, null], [240, SAS], [628, null]]); // ⑥에는 줄이 없어 기원전 550년부터 적음

// ── ⑧ 서 전 시대(구현 A4c) ──
// (이집트·리비아·마그레브의 기원전 550년(−549)~631 줄)
// ⑧a 이집트·시나이·키레나이카 (2026-11-01 구현 ⑧a)
// 등급: 나일 골짜기·삼각주·시나이·동부 사막·키레나이카 해안은 일반, 서부 사막(나일 서쪽)은 주변(zones.yaml sahara-interior). 근거 문서: 조사 노트 notes-4(위키 영어
//   Twenty-sixth/Twenty-seventh/Twenty-ninth/Thirty-first Dynasty of Egypt·Amasis II·Cyrene, Libya·Cyrenaica·Magas of Cyrene·Ptolemy VIII Physcon·Ptolemy Apion·
//   Ptolemaic Kingdom·Roman Egypt·Diocese of Egypt·Byzantine Egypt·Sasanian conquest of Egypt·Marmarica).
// 운영자 결정(A4 질문 창구 ①·②): 이집트 27조각(시나이·사막 셋·아스완 남쪽 포함)은 A3 632년 잣대로 통째, A3가 비운 마르마리카·시르테는 비움(② 1),
//   키레네는 따로 항목과 아케메네스 종주(① 2), 키레나이카 왕국은 세 토막 따로(② 9), 키레나이카 기원전 96~74년은 비움(② 4), 사산 이집트 621~628 칠함(② 2 B),
//   팔미라의 이집트 270~272는 로마 색(② 3). 테바이스 반란(기원전 205~186)·이나로스·카바바시·안토니우스의 키레나이카 증여는 칠하지 않음(notes-4 확정).
// 늘린 나라의 버전 해는 유럽 쪽 버전 해에 맞춤(3년 안): 아케메네스의 이집트 상실은 기원전 400년(−399, 상이집트가 401년까지 아르타크세르크세스 2세를 인정),
//   마케도니아의 이집트는 기원전 331년(−330, 알렉산드리아를 세우고 사트라피를 정비, 332년 말 입성과 1년 차이), 프톨레마이오스 기원전 323년(−322), 로마 공화정의 키레나이카
//   기원전 74년(−73)·이집트 기원전 30년(−29), 로마 제국 기원전 27년(−26), 동로마 395. 아케메네스의 정복 기원전 525년(−524)·재정복 343년(−342)은 유럽 쪽 가까운 해가 없어 새 버전.
const SAI = 'saite-egypt'; // 이집트 제26왕조(사이스 왕조), 지도 기원전 550~526(−549~−525)
const CYR = 'cyrene-kingdom'; // 키레네, 지도 기원전 550~323(−549~−322)
const ELD = 'egypt-late-dynasties'; // 이집트 후기 왕조(제28~30왕조), 지도 기원전 400~344(−399~−343)
const CYK = 'cyrenaica-kingdom'; // 키레나이카 왕국, 세 토막 기원전 276~247·163~146·116~97(−275~−246, −162~−145, −115~−96)
const EGYPT27 = idsOf('EGY'); // 이집트 27조각(나일 골짜기·삼각주·시나이·서부 사막과 오아시스·마트루와 시와·동부 사막·아스완 남쪽 22°N까지)
const CYR4 = ['LY-BA', 'LY-MJ', 'LY-JA', 'LY-QB']; // 키레나이카 해안(벵가지·마르즈·제벨아흐다르·쿠바): 펜타폴리스, A3 결정 11과 같은 조각
own(EGYPT27, [[-549, SAI], [-524, ACH], [-399, ELD], [-342, ACH], [-330, MAC], [-322, PTO], [-29, RRP], [-26, ROM], [395, BYZ], [621, SAS], [629, BYZ]]); // 기원전 525 캄비세스 2세의 펠루시움 승리, 400 후기 왕조, 343 아르타크세르크세스 3세, 331 알렉산드로스, 323 바빌론 분할, 30 옥타비아누스, 621 사산 총독령(619 알렉산드리아 함락), 629 철수
own(CYR4, [[-549, CYR], [-321, PTO], [-275, CYK], [-245, PTO], [-162, CYK], [-144, PTO], [-115, CYK], [-95, null], [-73, RRP], [-26, ROM], [395, BYZ]]); // 기원전 322 오펠라스, 276 마가스의 왕호, 246 베레니케의 혼인, 163 프톨레마이오스 8세, 145 8세의 이집트 복귀, 116 아피온, 96 로마에 유증(자유 도시, 비움), 74 로마 속주
// ── ⑧a 끝 · ⑧b(트리폴리타니아·페잔·튀니지·알제리·모로코 기원전 550~31) 줄은 이 아래에 ──
// ⑧b 트리폴리타니아·페잔·튀니지·알제리·모로코 기원전 550~31 (2026-11-01 구현 ⑧b)
// 등급: 마그레브 해안과 텔 지대는 일반, 리비아 내륙·알제리 고원 남쪽·사하라는 주변(zones.yaml sahara-interior). 근거 문서: 조사 노트 notes-5(위키 영어 Carthage·Leptis Magna·
//   Numidia·Masinissa·Syphax·Mauretania·Jugurthine War·Third Punic War·Africa (Roman province)·Mercenary War).
// 운영자 결정(A4 질문 창구 ①·②): 카르타고는 본령에 카이르완·시디부지드와 엠포리아를 더한 땅(notes-5 정할 점 1 확정(기본), 한노의 테베스테 땅은 칠하지 않음),
//   마시니사 누미디아의 고원 전체와 메크네스–타필랄트 MA-06은 칠하지 않음(② 5), 시르테(LY-MI·LY-SR)·트리폴리타니아 고원·가다미스·페잔은 A3 632처럼 비움(② 1),
//   가라만테스는 150년부터라 이 몫에는 칠하지 않음(② 6), 마우레타니아는 보쿠스 2세가 물려준 기원전 33~26년 로마 색(① 2: 왕이 없는 동안은 종주국 색).
// 버전 해: 카르타고의 엠포리아 상실 기원전 162년(−161)은 유럽 쪽 가까운 해가 없어 새 버전. 로마 공화정의 아프리카 속주 기원전 146년(−145)·마우레타니아 기원전 33년(−32)은
//   유럽 쪽 해와 같음. 아프리카 노바 기원전 46년(−45)은 유럽 쪽 −43과 2년이지만 누미디아 항목의 끝(탑수스, 46년)과 이어야 틈이 없어 그해에 둠(유럽 쪽 모양은 그 해에 바뀌지 않음).
const MSY = 'masaesyli'; // 마사이실리 왕국, 지도 기원전 220~203(−219~−202)
const NUM = 'numidia'; // 누미디아 왕국, 지도 기원전 220~47(−219~−46)
const MAU = 'mauretania'; // 마우레타니아 왕국, 지도 기원전 225(−224)부터(⑧c가 이음)
const CAR_AFRICA = ['TN-11', 'TN-13', 'TN-14', 'TN-21', 'TN-22', 'TN-23', 'TN-31', 'TN-51', 'TN-52', 'TN-53', 'TN-61', 'TN-81', 'TN-41', 'TN-43']; // 카르타고 본령(바그라다스 하류·본곶·사헬·스팍스·가베스와 카이르완·시디부지드) = 아프리카 속주
const EMPORIA = ['TN-82', 'LY-JI', 'LY-TN', 'LY-ZA', 'LY-NQ', 'LY-MB']; // 엠포리아: 메데닌(제르바 포함)과 트리폴리타니아 해안(사브라타·오에아·렙티스 마그나)
const TN_WEST = ['TN-32', 'TN-33', 'TN-34', 'TN-42', 'TN-71']; // 튀니지 서부 내륙(젠두바·케프·실리아나·카세린·가프사): 누미디아인 땅
const TN_SOUTH = ['TN-72', 'TN-73', 'TN-83']; // 튀니지 남부(토제르·케빌리·타타윈): 제리드와 사하라 가장자리
const NUMIDIA_E = ['DZ-23', 'DZ-24', 'DZ-36', 'DZ-41', 'DZ-25', 'DZ-43', 'DZ-21', 'DZ-18', 'DZ-04', 'DZ-12']; // 동누미디아 텔(안나바·겔마·키르타·스킥다·지젤·테베스테): 마실리 왕국
const AURES_N = ['DZ-05', 'DZ-40']; // 바트나·켄셸라(아우레스 북쪽)
const MASAESYLI = ['DZ-13', 'DZ-22', 'DZ-46', 'DZ-31', 'DZ-29', 'DZ-27', 'DZ-48', 'DZ-02', 'DZ-38', 'DZ-44', 'DZ-42', 'DZ-09', 'DZ-16', 'DZ-35', 'DZ-15', 'DZ-10', 'DZ-26',
  'DZ-06', 'DZ-34', 'DZ-19', 'DZ-14', 'DZ-20']; // 서누미디아: 서텔 17조각(틀렘센~부이라)·베자이아·시티피스와 티아레트·사이다(물루야강~암프사가강)
const MAURETANIA_N = ['MA-01', 'MA-02', 'MA-03', 'MA-05', 'MA-07']; // 모로코 북부(탕헤르·릭수스·가르브·타자·페스·살라)
const MA04 = ownSplit('MA-04', ['MA-04'], [['물루야서', MOULOUYA_W], ['동텔', ORIENTAL_TELL]], '고원', {}, { from: -263, to: 476 }); // 모로코 동부(⑧c가 같은 단위로 이음)
own(CAR_AFRICA, [[-549, CAR], [-145, RRP]]); // 기원전 146 카르타고 함락과 아프리카 속주(수도 우티카)
own(EMPORIA, [[-549, CAR], [-161, NUM], [-45, RRP]]); // 기원전 162 마시니사가 엠포리아를 빼앗음, 46 탑수스 뒤 아프리카 노바
own(TN_WEST, [[-549, null], [-201, NUM], [-45, RRP]]); // 기원전 202 마시니사의 통일, 46 아프리카 노바
own(NUMIDIA_E, [[-549, null], [-219, NUM], [-45, RRP]]); // 기원전 220 가이아의 마실리, 46 아프리카 노바(시티우스의 키르타 영지 46~44는 그리지 않음)
own(AURES_N, [[-549, null], [-219, NUM], [-45, null]]); // 기원전 46 아프리카 노바 밖(로마는 105 람바이시스부터 — ⑧c)
own(MASAESYLI, [[-549, null], [-219, MSY], [-201, NUM], [-104, MAU], [-32, RRP]]); // 기원전 220 시팍스, 202 마시니사, 105 보쿠스 1세(유구르타 전쟁 뒤), 33 보쿠스 2세의 유증
own([MA04['동텔']], [[-263, null], [-219, MSY], [-201, NUM], [-104, MAU], [-32, RRP]]); // 물루야강 동쪽 텔: 서누미디아와 같은 길
own(MAURETANIA_N, [[-549, null], [-224, MAU], [-32, RRP]]); // 기원전 225 바가, 33 보쿠스 2세의 유증
own([MA04['물루야서']], [[-263, null], [-224, MAU], [-32, RRP]]); // 물루야강 서쪽(나도르·드리우치): 모로코 북부와 같은 길
// ── ⑧b 끝 · ⑧c(같은 땅 기원전 30~631) 줄은 이 아래에(위 단위의 줄 끝에 −29부터 잇거나 새 줄) ──
// ⑧c 트리폴리타니아·페잔·튀니지·알제리·모로코 기원전 30~631 (2026-11-01 구현 ⑧c)
// 등급: ⑧b와 같음(마그레브 해안·텔은 일반, 리비아 내륙·알제리 고원 남쪽·사하라는 주변). 근거 문서: 조사 노트 notes-5(위키 영어 Mauretania·Mauretania Tingitana·
//   Mauretania Caesariensis·Volubilis·Numidia (Roman province)·Fossatum Africae·Garamantes·Vandal Kingdom·Vandals·Gaiseric·Praetorian prefecture of Africa·
//   Mauro-Roman Kingdom·Kingdom of Altava·Kingdom of the Aurès).
// 운영자 결정(A4 질문 창구 ①·②): 마우레타니아는 유바 2세 때 로마 종속(① 2, 관계 vassal_of), 탕기타나는 해안 평야와 볼루빌리스 둘레만(메크네스–타필랄트 남쪽·고원은 안 칠함 ② 5),
//   튀니지 남부는 로마 리메스 뒤부터 칠하고 미즈다·가다미스·시르테는 A3 632처럼 비움(② 1), 반달은 439년 말 모습을 442년 조약 땅으로(창구 ② 확정(기본)),
//   마우레타니아 카이사리엔시스·시티펜시스 455~476과 아우레스 455~483은 비움(② 4), 무어 왕국은 마우로로마→알타바·아우레스 낱낱(② 8, 와르세니스·호드나·도르살레는 안 그림),
//   동로마의 아우레스 539~543 점령은 동로마 색(② 2 B), 가라만테스는 페잔 핵을 150년부터(② 6). 라과탄의 트리폴리타니아(523~534)·도르살레(510~534)는 반달 색 그대로(notes-5 확정 11).
// 버전 해(유럽 쪽 해에 맞춤): 로마 제국의 마우레타니아 넘김 기원전 25년(−24)·두 속주 43·아우레스 105(람바이시스)·팅기타나 축소 286은 유럽 쪽 해와 같고,
//   튀니지 남부는 세베루스 때 리메스(notes-5의 198)를 유럽 쪽 195에 맞춤(3년 안). 서로마 429(팅기타나 해안)·439(반달)·455는 유럽 쪽 해와 같음. 반달의 아프리카 439는
//   유럽 쪽 버전이 없는 해(유럽 쪽은 456부터)라 새 버전. 동로마 534는 유럽 쪽과 같고, 아우레스 539·544는 결정 창구 ② 2 B의 해 그대로(유럽 쪽 540과 1년, 모양은 그해 바뀌지 않음).
const GAR = 'garamantes'; // 가라만테스, 지도 150~631(페잔 핵)
const MRK = 'mauro-roman-kingdom'; // 마우로로마 왕국, 지도 477~577
const ALT = 'altava-kingdom'; // 알타바 왕국, 지도 578~631
const AUR = 'aures-kingdom'; // 아우레스 왕국, 지도 484~631(539~543은 동로마)
const SITIFENSIS = ['DZ-06', 'DZ-19', 'DZ-34']; // 베자이아·세티프·보르즈부아레리즈: 마우레타니아 시티펜시스(293년 카이사리엔시스에서 나뉨), 534 동로마
const ALTAVA = minus(MASAESYLI, ...SITIFENSIS); // 서텔 17조각과 티아레트·사이다: 마우레타니아 카이사리엔시스 = 마우로로마·알타바 왕국 땅
const AURES_S = ['DZ-07', 'DZ-28']; // 비스크라·음실라(아우레스 남쪽 자브·호드나): 바트나·켄셸라(AURES_N)와 함께 아우레스 4조각
const TINGITANA = ['MA-02', 'MA-07']; // 가르브·라바트–살레(릭수스 남쪽 해안 평야와 살라): 팅기타나 속주(탕헤르–테투안 MA-01은 따로 줄)
const RIF_FES = ['MA-03', 'MA-05']; // 타자–알호세이마·페스–불만: 마우레타니아 왕국 땅이었으나 팅기타나 속주 밖(리프·중부 아틀라스 부족 땅)
const FEZZAN = ['LY-WD', 'LY-SB', 'LY-WS']; // 와디 알하야(가라마)·세브하·샤티: 페잔 핵(가라만테스)
const MA06 = ownSplit('MA-06', ['MA-06'], [['볼루빌리스', VOLUBILIS]], '남쪽', {}, { from: -26, to: 476 }); // 메크네스–타필랄트: 북쪽 끝 볼루빌리스 둘레만 칠함
const AFRICA_LINE = [[-29, RRP], [-26, ROM], [395, WRE], [439, VAN], [534, BYZ]]; // 아프리카 프로콘술라리스·비자케나·트리폴리타니아·누미디아 동텔: 395 서로마, 439 가이세리크의 카르타고, 534 벨리사리우스
const MAU_LINE = [[-29, RRP], [-26, ROM], [-24, MAU]]; // 기원전 25 아우구스투스가 유바 2세에게 마우레타니아를 줌(로마 종속, 42년까지)
own([...CAR_AFRICA, ...EMPORIA, ...TN_WEST, ...NUMIDIA_E], AFRICA_LINE);
own(TN_SOUTH, [[-549, null], [195, ROM], [395, WRE], [439, VAN], [534, BYZ]]); // 튀니지 남부: 세베루스 때 리메스(트리폴리타니아 리메스·포사툼 아프리카이) 뒤 로마 땅(⑧b까지 줄이 없어 기원전 550년부터 적음)
own(SITIFENSIS, [...MAU_LINE, [43, ROM], [395, WRE], [455, null], [534, BYZ]]); // 43 카이사리엔시스, 455 서로마가 떠난 뒤 비움(결정 ② 4, 477 뒤로도 마우로로마 밖 — 호드나 쪽은 안 그림), 534 동로마
own(ALTAVA, [...MAU_LINE, [43, ROM], [395, WRE], [455, null], [477, MRK], [578, ALT]]); // 43 카이사리엔시스, 455 비움(결정 ② 4), 477 마우로로마 왕국(가이세리크가 죽은 해), 578 가르물 뒤 알타바 왕국
own([MA04['동텔']], [...MAU_LINE, [43, ROM], [395, WRE], [455, null]]); // 물루야강 동쪽 텔(우지다): 카이사리엔시스 서쪽 끝, 455 비움(476부터는 MA-04 통째 줄)
own([MA04['물루야서']], [...MAU_LINE, [43, null]]); // 물루야강 서쪽(나도르): 팅기타나 속주 밖 리프 동쪽(루사디르는 1만 km² 미만 거점)
own(['MA-01'], [...MAU_LINE, [43, ROM], [395, WRE], [429, null]]); // 탕헤르–테투안: 팅기타나 해안(286 뒤로도 남은 연안 띠), 429 반달이 건너간 뒤 비움
own(TINGITANA, [...MAU_LINE, [43, ROM], [286, null]]); // 릭수스 남쪽 해안 평야·살라: 286 무렵 로마가 남쪽을 거둠(릭수스–팅기스–셉템 연안 띠만 남음)
own(RIF_FES, [...MAU_LINE, [43, null]]); // 리프·페스 쪽: 왕국 땅이었으나 43 팅기타나 속주 밖
own([MA06['볼루빌리스']], [[-26, ROM], [-24, MAU], [43, ROM], [286, null]]); // 볼루빌리스: 유바 2세의 둘째 도읍, 팅기타나의 남쪽 끝 도시, 286 무렵 로마가 떠남
own(AURES_N, [[105, ROM], [395, WRE], [455, null], [484, AUR], [539, BYZ], [544, AUR]]); // 105 트라야누스의 람바이시스·타무가디, 455 비움(결정 ② 4), 484 마스티스의 반란, 539 솔로몬의 정복(결정 ② 2 B), 544 킬리움 싸움 뒤
own(AURES_S, [[-549, null], [105, ROM], [395, WRE], [455, null], [484, AUR], [539, BYZ], [544, AUR]]); // 자브·호드나: 아우레스 남쪽 리메스(⑧b까지 줄이 없어 기원전 550년부터 적음)
own(FEZZAN, [[-549, null], [150, GAR]]); // 페잔 핵: 2세기 중엽 지역 세력(결정 ② 6, estimated), 631 뒤 A3는 비움
// ── ⑧c 끝 ──

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
  V(-29, 195, 'SY-HA', ...JAZIRA_S), // 시리아 자지라 기원전 30~기원후 194: 파르티아·오스로에네·하트라·로마 사이로 이 땅을 직접 다스린 나라의 서술 없음(결정 창구 ② 4, 하트라는 따로 그리지 않음)
  B(225, 240, ...IRAN_EAST7), // 이란 동부(호라산·고르간·시스탄) 225~239: 파르티아 항목이 224에 끝난 뒤 아르다시르 1세의 동방 정복 해가 사료에 없음(결정 창구 ② 4)
  B(-29, A4_END, 'IR-13/발루치스탄'), // 발루치스탄(서부 게드로시아): 파르티아·사산의 지배 서술 없음(A3 632년 모습과 같음, notes-2 확정 12)
  // ⑦c 아라비아 반도
  V(-29, 50, ...SANA), // 사나 고지 기원전 30~기원후 49: 사바가 1세기에 둘째 도읍을 세우기 전 다스린 나라 근거 없음
  V(-29, 290, 'YE-AB', 'YE-JA', ...N_YEMEN_REST, 'SA-09'), // 아비얀·자우프(마인 뒤)·북예멘 고지·티하마·지잔 기원전 30~기원후 289: 힘야르의 통일 전 다스린 나라 근거 없음(마인·다시 일어난 아우산은 1만 km² 미만)
  V(-29, A4_END, 'SA-10', 'SA-14'), // 나지란·아시르: 나지란 조각은 사막 내륙(A3 632도 비움, 오아시스는 1만 km² 미만), 아시르 고원은 힘야르 지배 서술 없음(운영자 확인 후보)
  B(-29, A4_END, 'OM-ZU/내륙'), // 도파르 북쪽 사막: 사막 내륙(A3 632도 비움)
  V(-29, A4_END, ...OMAN_IN), // 오만 내륙·샤르키야·알우스타와 아부다비 사막: 줄란다 가문 등 현지 집단 땅(사산은 해안 수비대만, notes-3 확정 8·정할 점 7)
  V(-29, 240, ...idsOf('QAT', 'BHR'), ...MAZUN), // 카타르·바레인·마준 기원전 30~기원후 239: 아르다시르 1세의 동아라비아 정복 전 다스린 나라 근거 없음
  B(-29, 240, 'SA-04/하사'), // 알하사·카티프 기원전 30~기원후 239: 같은 까닭(게라는 위치·영토가 정해지지 않음)
  B(-29, A4_END, 'SA-04/사막'), // 동부 주 사막(룹알할리): 사막 내륙(A3 632도 비움)
  V(-29, A4_END, 'SA-01', 'SA-05', 'SA-06', 'SA-02', 'SA-11'), // 나지드·히자즈 중부: 부족 땅(힘야르·킨다의 마아드 복속은 결정 창구 ② 5로 칠하지 않음), 메카는 이슬람 전 나라 없음
  B(-29, A4_END, 'SA-03/메디나'), // 메디나주(알울라 골짜기 밖): 야스리브는 다스린 나라 없음
  B(195, A4_END, 'SA-03/알울라'), // 알울라 골짜기 195~631: 로마군이 2세기 말~3세기 초에 헤그라를 떠난 뒤 다스린 나라 근거 없음
  V(-29, -23, 'SA-07'), // 타부크·타이마 기원전 30~25년: 창구 ③ 2와 같은 땅, 헤그라를 합치기 전
  V(195, A4_END, 'SA-07'), // 타부크·타이마 195~631: 로마군이 떠난 뒤 다스린 나라 근거 없음
  V(-29, A4_END, 'SA-08', 'SA-12'), // 북부 국경·자우프(두마·와디 시르한): 사막 내륙(A3 632도 비움, 두마의 나바테아 거점은 칠하지 않음)
  B(628, A4_END, 'YE-MA', ...SANA, YESH['바이한'], 'YE-BA', ...SW_YEMEN, YESH['샤브와'], 'YE-HD', 'YE-MR', OMZU['해안'], 'YE-AB', 'YE-JA', ...N_YEMEN_REST, 'SA-09',
    SA04['하사'], ...idsOf('QAT', 'BHR'), ...MAZUN), // 예멘·동아라비아 628~631: 사산 철수 뒤 메디나 국가 전(A3 632 정통 칼리프국 전, 결정 창구 ② 7)
  // ── ⑧ 서 전 시대 ──
  // ⑧a 이집트·시나이·키레나이카
  V(-549, A4_END, 'LY-BU', 'LY-AJ'), // 마르마리카(토브루크 둘레와 남쪽 사막)·아즈다비야(시르테만 동쪽과 남쪽 사막): 리비아 부족 땅과 사막 내륙(A3 632도 비움, 결정 창구 ② 1)
  V(-95, -73, 'LY-BA', 'LY-MJ', 'LY-JA', 'LY-QB'), // 키레나이카 기원전 96~74: 아피온의 유증 뒤 원로원이 도시들을 자유 도시로 두고 속주를 세우지 않음(결정 창구 ② 4)
  // ⑧b 트리폴리타니아·페잔·튀니지·알제리·모로코 기원전 550~31
  V(-549, -29, 'LY-MI', 'LY-SR'), // 미스라타 남쪽·시르테만(필라이니 제단 둘레): 사막 해안의 리비아 부족 땅(A3 632도 비움, 결정 창구 ② 1, notes-5 정할 점 7)
  V(-549, -29, 'LY-MZ', 'LY-GD'), // 트리폴리타니아 고원(미즈다)·가다미스: 카르타고·누미디아의 지배 서술 없음(A3 632도 비움, 결정 창구 ② 1)
  V(-549, -29, 'LY-WD', 'LY-SB', 'LY-WS', 'LY-GT', 'LY-MQ', 'LY-JU', 'LY-KF'), // 페잔과 리비아 사막: 가라만테스는 기원후 2세기 중엽부터 칠함(결정 창구 ② 6), 사막 내륙
  V(-549, -29, ...TN_SOUTH), // 튀니지 남부(제리드·네프자와·타타윈): 카르타고 본령 밖 사하라 가장자리(로마 리메스 뒤 198부터 — 결정 창구 ② 1, notes-5 정할 점 5)
  V(-549, -201, ...TN_WEST), // 튀니지 서부 내륙: 카르타고 본령 밖 누미디아인 땅(한노의 테베스테 원정은 용병 전쟁으로 흔들려 칠하지 않음), 마시니사의 통일 전
  V(-549, -219, ...NUMIDIA_E, ...AURES_N, ...MASAESYLI), // 동·서누미디아: 마실리·마사이실리 왕국이 사료에 나라로 나오기 전(가이아·시팍스 전)
  V(-45, -29, ...AURES_N), // 바트나·켄셸라 기원전 46~31: 아프리카 노바 밖 아우레스 산지(로마의 람바이시스 전)
  V(-549, -224, ...MAURETANIA_N), // 모로코 북부: 마우리 왕 바가가 사료에 나오기 전
  V(-549, -263, 'MA-04'), // 모로코 동부: 같은 까닭(물루야강 칼선을 켜기 전)
  B(-263, -224, MA04['물루야서']), // 물루야강 서쪽: 바가 전
  B(-263, -219, MA04['동텔']), // 물루야강 동쪽 텔: 시팍스 전
  B(-263, -29, MA04['고원']), // 모로코 동부 고원(피기그 둘레): 마시니사 누미디아의 고원과 같은 가이툴리 땅(결정 창구 ② 5)
  V(-549, -29, 'DZ-45', 'DZ-32', 'DZ-17', 'DZ-03', 'DZ-28', 'DZ-07'), // 알제리 고원과 호드나·자브(나아마·엘바야드·젤파·라그와트·음실라·비스크라): 가이툴리 땅(결정 창구 ② 5)
  V(-549, -29, 'DZ-01', 'DZ-08', 'DZ-11', 'DZ-30', 'DZ-33', 'DZ-37', 'DZ-39', 'DZ-47'), // 알제리 사하라: 사막 내륙(A3 632도 비움)
  V(-549, -29, 'MA-06', 'MA-08', 'MA-09', 'MA-10', 'MA-11', 'MA-12', 'MA-13', 'MA-14', 'MA-15', 'MA-16', ...idsOf('SAH')), // 메크네스–타필랄트(결정 창구 ② 5)와 모로코 중·남부·서사하라: 마우레타니아 남쪽 한계 밖 부족 땅
  // ⑧c 트리폴리타니아·페잔·튀니지·알제리·모로코 기원전 30~631
  V(-29, A4_END, 'LY-MI', 'LY-SR'), // 미스라타 남쪽·시르테만: 트리폴리타니아 속주 동쪽 끝(필라이니 제단)까지의 사막 해안(A3 632도 비움, 결정 창구 ② 1, notes-5 정할 점 7)
  V(-29, A4_END, 'LY-MZ', 'LY-GD'), // 트리폴리타니아 고원(미즈다)·가다미스: 리메스 바깥 전초(가다미스 주둔·가라마 원정)는 칠하지 않음(A3 632도 비움, 결정 창구 ② 1, notes-5 정할 점 5)
  V(-29, 150, ...FEZZAN), // 페잔 핵 기원전 30~기원후 149: 가라만테스가 지역 세력으로 서기 전(결정 창구 ② 6, 기원전 19년 발부스 원정은 칠하지 않음)
  V(-29, A4_END, 'LY-GT', 'LY-MQ', 'LY-JU', 'LY-KF'), // 가트·무르주크·주프라·쿠프라: 사막 내륙(A3 632도 비움)
  V(-29, 195, ...TN_SOUTH), // 튀니지 남부 기원전 30~기원후 194: 세베루스 때 리메스 전 사하라 가장자리(notes-5 정할 점 5)
  V(-29, 105, ...AURES_N, ...AURES_S), // 아우레스 기원전 30~기원후 104: 트라야누스의 람바이시스 전 산지·자브 부족 땅(notes-5 정할 점 6)
  V(455, 484, ...AURES_N, ...AURES_S), // 아우레스 455~483: 서로마가 떠난 뒤 마스티스의 반란 전, 주인이 사료로 정해지지 않음(결정 창구 ② 4)
  V(-29, A4_END, 'DZ-45', 'DZ-32', 'DZ-17', 'DZ-03'), // 알제리 고원(나아마·엘바야드·젤파·라그와트): 가이툴리 땅, 로마의 카스텔룸 디미디 같은 전초는 칠하지 않음(결정 창구 ② 5)
  V(-29, A4_END, 'DZ-01', 'DZ-08', 'DZ-11', 'DZ-30', 'DZ-33', 'DZ-37', 'DZ-39', 'DZ-47'), // 알제리 사하라: 사막 내륙(A3 632도 비움)
  V(455, 534, ...SITIFENSIS), // 마우레타니아 시티펜시스 455~533: 서로마가 떠난 뒤 반달 땅 밖, 호드나 쪽 무어 왕국은 그리지 않음(결정 창구 ② 4·8)
  V(455, 477, ...ALTAVA), // 마우레타니아 카이사리엔시스 455~476: 서로마가 떠난 뒤 마우로로마 왕국 전(결정 창구 ② 4)
  B(455, 476, MA04['동텔']), // 물루야강 동쪽 텔 455~475: 같은 까닭
  V(476, A4_END, 'MA-04'), // 모로코 동부 476~631: 알타바 왕국 서쪽 밖(우지다 둘레는 다스린 나라 근거 없음, A3 632도 비움)
  B(-29, 476, MA04['고원']), // 모로코 동부 고원(피기그 둘레): 가이툴리 땅(결정 창구 ② 5)
  B(43, 476, MA04['물루야서']), // 물루야강 서쪽(나도르) 43~475: 팅기타나 속주 밖 리프 동쪽
  V(43, A4_END, ...RIF_FES), // 리프·페스 쪽 43~631: 팅기타나 속주 밖 부족 땅(바쿠아테스·마케니테스)
  V(286, A4_END, ...TINGITANA), // 릭수스 남쪽 해안 평야·살라 286~631: 로마가 남쪽을 거둔 뒤 다스린 나라 근거 없음(A3 632도 비움)
  V(429, A4_END, 'MA-01'), // 탕헤르–테투안 429~631: 반달이 건너간 뒤(셉템의 동로마 수비대는 1만 km² 미만, A3 632도 비움)
  V(-29, -26, 'MA-06'), // 메크네스–타필랄트 기원전 30~27: 볼루빌리스 칼선을 켜기 전(결정 창구 ② 5)
  B(-26, 476, MA06['남쪽']), // 메크네스–타필랄트(볼루빌리스 둘레 밖): 중부 아틀라스와 타필랄트(결정 창구 ② 5)
  B(286, 476, MA06['볼루빌리스']), // 볼루빌리스 둘레 286~475: 로마가 떠난 뒤 현지 공동체(다스린 나라 근거 없음)
  V(476, A4_END, 'MA-06'), // 메크네스–타필랄트 476~631: 같은 까닭
  V(-29, A4_END, 'MA-08', 'MA-09', 'MA-10', 'MA-11', 'MA-12', 'MA-13', 'MA-14', 'MA-15', 'MA-16', ...idsOf('SAH')), // 모로코 중·남부·서사하라: 마우레타니아·팅기타나 남쪽 한계 밖 부족 땅
];

export const era = {
  name: 'ancient',
  versions,
  gapZones,
  voids,
};
