// south-asia 시대 파일 sultanate (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1206~1756: 델리 술탄국·데칸·비자야나가라·무굴
// 짝 항목 파일: data/entities/south-asia-sultanate.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia/의 다른 도우미 모듈. areas/south-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/south-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/south-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 남아시아 S3 짜임 안내 (2026-11-03 S3 뼈대, 구현 S3-서·S3-동이 표를 채움) ─────────────────
// 등급 '일반'(docs/south-asia/00-scope.md 3절: 땅 1만 km², 선 평균 10 / 최대 25 km), 발루치스탄 내륙·마크란과 타르 사막은 '주변'(zones.yaml baluchistan-interior·thar-desert:
//   땅 5만 km², 선 평균 25 / 최대 50 km). 해는 천문 연도(이 시대는 모두 기원후라 서력과 같음), 한 버전 = 그해 말 모습. 원정·약탈·되돌려진 점령(1398 티무르·1739 나디르 샤의
//   델리 약탈 포함)은 칠하지 않는다. 무굴 후기 황제의 명목 종주는 실제 다스린 나라로 칠하고 종주는 관계(vassal_of)·글로(00-scope 3절).
// 토후국·보호국(standards 5절): 세습 군주 나라 1만 km² 이상은 따로 항목(vassal_of 그때의 상위국), 1만 km² 미만이 이어져 1만 km² 넘으면 '○○ 토후국들' 묶음 하나, 그 밖은 종주 색.
//   식민 본국(portugal 등)은 넓히지 않고 따로 항목(portuguese-india·portuguese-ceylon·dutch-ceylon …) + vassal_of 본국. 몰디브는 그리지 않음, 아프가니스탄·미얀마 쪽은 권역 바깥.
// 운영자 결정(S3 질문 창구 ②, 2026-11-03 — 뒤집지 않음, 원문은 00-scope 10절 S3 줄):
//   1 1398~1413 PK-PB 전체와 수틀레지 서북 칼선 땅은 비움(델리 술탄국은 델리 본령만). 2 gujarat-sultanate 도형은 1398부터(1394~1397은 델리 술탄국).
//   3 ladakh-kingdom은 1206부터(IN-LA+KAS − 중국 도형). 4 PK-BA 칼라트 무리 밖은 1747까지 비움, 1748 durrani-empire. 5 하부 신드 1593~1736 mughal-empire, 1737 talpur-sindh(상부·중부는 1701).
//   6 무굴 1756 마지막 버전은 델리·하리아나·시르힌드(서 칸 77,361 km²)와 상부 도아브(동 칸 IN-UP 나머지 34,110 km²)만, 괄리오르 북부(S2 S_GWALIOR_N)는 1738부터 비움, 1757 첫머리에 끝.
//   7 afsharid-iran을 권역 파일 extendable [1739, 1748]로 늘려 인더스 서안(PK-TA·PK-KP 칼선 밖·PK-PB 인더스 서안)을 칠함(서 칸만 extendable 줄을 적음).
//   8 곤드 세 나라 garha-mandla-kingdom·deogarh-kingdom·chanda-kingdom을 그림(동 칸 정의). 9 벵골 1206~1337 delhi-sultanate, 1338~1351 sonargaon-sultanate, 락나우티 쪽 bengal-sultanate 1338~.
//   10 gajapati-kingdom 1434~1567(끝 1568 벵골 술탄국 카라니 왕조의 정복). 기본값 46건은 조사 질문 파일의 '기본값으로 정한 것'(D1~D46).
// 1756 ↔ 1757 이음: 1756년 모양은 colonial.mjs 1757년 주인과 이어진다. 같은 나라면 같은 id(joinEras가 이 파일 버전 뒤에 colonial.mjs 버전을 붙임 — 권역 파일 시대 목록이
//   [sultanateEra, colonialEra, modernEra]로 과거가 앞), colonial.mjs·modern.mjs 도형은 바이트 그대로(compare:geo 대칭차 0). 나라마다 1756과 1757의 넓이 차가 1만 km²(주변 5만)를 넘으면
//   근거(전투·조약)를 결과 노트에, 근거가 없으면 1756을 1757에 맞춘다. 무굴만 운영자 결정 6대로 1756에서 끝난다.
// 표: modern.mjs·colonial.mjs와 같은 꼴의 조각 소유표(table.mjs). tableKit('sultanate')로 자기 꾸러미를 받아 단위 이름이 다른 시대 파일과 부딪치지 않는다.
//   조각은 남아시아 조각(loadFragments('south-asia'))을 그대로 쓰고 새로 만들지 않는다. 옛 경계는 칼선으로 나눈다. 마지막 해(미포함)는 S3_END(1757) = colonial.mjs의 첫 해.
// 표 경계 해 BOUNDS(조사 노트 서 4-3절·동 4절을 합쳐 줄인 8개 표, 기본값 D34 — 칼선 모양이 크게 바뀌는 해만 표를 나눔):
//   1206 시작(델리 술탄국 성립) · 1299 할지 왕조의 구자라트·란탐보르·치토르 정복(서 칸 땅 대부분이 델리로) · 1338 벵골 독립·마두라이·비자야나가라·무수누리(델리 동·남부 이탈)
//   · 1347 바흐마니 성립(남·서 이탈) · 1490 아마드나가르·비자푸르·베라르 갈림(데칸 칼선이 처음 필요) · 1526 무굴 성립 · 1576 무굴의 벵골 정복(오리사 1592·곤드·말와 칼선 포함)
//   · 1687 골콘다·비자푸르 병합 뒤 데칸 정리(하이데라바드 1724도 이 표 안). 표 안에서 바뀌는 주인은 같은 칼선의 주인 줄로 적는다(1398·1565·1636·1659·1724·1752 등).
// 해 줄 넣는 법: own(단위들, [[해, 주인], …]), 나눈 조각은 ownSplit(묶음 이름, 조각 id들, [[부분, 칼선 도형], …], 나머지 이름, { 부분: 줄 }, { from, to }).
//   주인 null은 비운 땅(이유는 voids에 한 줄). 첫 줄의 첫 해는 S3_START(1206). 줄을 적지 않은 단위는 맨 아래 fillTables가 시대 내내 주인 null로 채운다.
//   한 조각을 기간에 따라 다르게 나누려면 ownSplit의 마지막 인자 { from, to }(BOUNDS의 해만)로 묶음을 여럿 두고, 묶음 이름은 서로 달라야 한다(예: 'W_데칸1206'·'W_데칸1490').
//   부분의 줄 첫 해는 그 묶음의 from이고, 묶음 기간 밖 해를 적으면 fillTables가 멈춘다(표에 들어가지 않고 조용히 사라지므로).
//   같은 묶음은 기간이 길면 표 여러 개에 그대로 이어 쓰인다(reuse). 칼선이 그대로인 표 경계에서 묶음을 새로 만들지 않는다 — 단위 이름이 바뀌면 주인·모양이 같아도
//   그 해에 새 버전이 생긴다(1만 km² 미만 버전 해가 늘어남).
//   한 표 기간 안에서 나눈 조각은 통째 줄을 적을 수 없다(그 기간은 단위 이름으로). 같은 조각을 두 칸이 own하지 않는다(own이 두 번째 줄을 '이은 줄'로 받아 해가 겹치면 멈춤).
// 칸 나눔(부딪침 막기, <sp>/IMPL-SPLIT.md): 구현 S3-서는 '── S3 서 ──' 칸, S3-동은 '── S3 동 ──' 칸 아래에만 쓴다(칼선·상수·import·own 줄·voids 줄 모두).
//   서 칸 조각: PK-*·KAS·IN-JK·IN-LA·IN-PB·IN-HR·IN-HP·IN-CH·IN-DL·IN-RJ·IN-GJ·IN-DH·IN-MH·IN-GA·IN-KA. 동 칸 조각: 그 밖 전부(IN-UP·IN-UT·IN-BR·IN-JH·IN-WB·IN-OR·IN-CT·IN-MP·
//   북동 일곱·IN-SK·IN-AN·IN-TG·IN-AP·IN-TN·IN-KL·IN-PY·IN-LD·BD-*·NP-*·BT-*·LK-*·MDV-*). 칼선은 칸(조각 경계)을 넘지 않는다.
//   최상위 이름(const·import 이름)은 칸마다 앞머리: 서 W_, 동 E_(import도 `import { X as E_X } from …`). 공통 이름(own·ownSplit·D·SA·build·S2_CUTS·S1_CUTS 등)은 그대로,
//   ownSplit 묶음 이름(첫 인자)도 앞머리('W_펀자브'). 칸 밖 공통 줄은 cnMinusOf 한 줄(동 칸만 고침) 말고는 고치지 않는다. BOUNDS는 이 값 그대로(바꿔야 하면 결과 노트).
// S1·S2 칼선 다시 쓰기: colonial.mjs의 S2_CUTS(W_·E_·S_ 상수 87개)와 modern.mjs의 S1_CUTS(MARATHWADA·HK_KARNATAKA·칼라트 무리 등 9개)에서만 가져온다(아래 공통 import,
//   예: const W_JAISALMER = S2_CUTS.W_JAISALMER). 좌표를 옮겨 적지 않고 두 파일은 고치지 않는다(모음에 없는 선이 필요하면 결과 노트). 모음의 W_·S_ 상수는 링 하나 목록, E_ 상수는
//   멀티폴리곤 꼴 그대로이고 ownSplit은 둘 다 받는다. W_CN·E_CN은 1757년 청 도형이라 이 시대 중국 이음매로 쓰지 않는다(동 칸이 이 시대 중국 쪽 도형을 따로 만든다).
// 늘린 나라: 소유표의 주인으로 다른 권역 나라 id를 쓰려면 권역 파일 extendable에 있어야 한다(운영자 승인 줄만, 00-scope 5절 — S3는 afsharid-iran [1739, 1748] 하나, 서 칸이 적음).
// 월경지·허용 줄·정답표·표기 사전·relations는 각 파일 끝(그 파일의 남아시아 절 끝)에 자기 머리 줄('# ── 남아시아 S3 서 …'·'동')을 두고 그 아래에만.
// 가져오기: 아래 네 줄은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D } from '../../lib.mjs';
import { SA, tableKit } from './table.mjs';
import { S2_CUTS } from './colonial.mjs';
import { S1_CUTS } from './modern.mjs';

const { build, joinTables, makeTable } = tableKit('sultanate');

const S3_START = 1206; // 이 시대 파일의 첫 해: 쿠트브 웃딘 아이바크의 델리 술탄국 성립(1206) 해 말
const S3_END = 1757; // 이 시대 파일의 끝(미포함) = colonial.mjs의 첫 해

// ── 조각 소유표 도우미 (colonial.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
const BOUNDS = [S3_START, 1299, 1338, 1347, 1490, 1526, 1576, 1687, S3_END];
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < S3_START || e[0] >= S3_END)) {
    throw new Error(`south-asia sultanate: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${S3_START} 이상 ${S3_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`south-asia sultanate: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = S3_START, to = S3_END } = {}) => {
  if (!BOUNDS.includes(from) || !BOUNDS.includes(to) || from >= to) throw new Error(`south-asia sultanate: 나눈 조각 ${name}의 기간 [${from}, ${to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  if (layouts.some((l) => l.name === name)) throw new Error(`south-asia sultanate: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`south-asia sultanate: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`south-asia sultanate: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`south-asia sultanate: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  const known = new Set([...SA.ids, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`south-asia sultanate: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`south-asia sultanate: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`south-asia sultanate: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
    for (const id of SA.ids) {
      if (splitHere.has(id)) {
        const line = lines.get(id);
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`south-asia sultanate: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// 빈 땅 검사 구역에서 그해 통째로 뺄 다른 권역 도형(중국 쪽 원·티베트·명·청 도형이 덮는 땅). 동 칸만 이 한 줄을 고친다(기본: 없음).
// 그 도형과 겹치는 조각 땅은 동 칸이 주인 null 부분으로 떼어 두고(colonial.mjs E_CN 꼴, 같은 모양 기간끼리 묶음), 여기서는 [from, to) 기간에 뺄 멀티폴리곤 목록을 돌려준다.
// 서 칸 라다크·히마찰 쪽(IN-LA·IN-HP·KAS)의 중국 도형 몫도 이 한 줄이 함께 뺀다(서 칸 사본에서 그 땅의 gaps가 나는 것은 정상)
const cnMinusOf = (from, to) => [...(from < 1368 && 1279 < to ? [E_YUAN] : []), ...(1720 < to ? [E_CN] : [])]; // 원(1279~1367)·청(1720~) 도형의 이 권역 상자 안 모양(동 칸 E_YUAN·E_CN)

// ── S3 서 (파키스탄·카슈미르·펀자브·하리아나·델리·라지푸타나·구자라트·마하라슈트라·고아·카르나타카, 구현 S3-서): 칼선·상수·own 줄은 이 아래에, 최상위 이름은 W_ ──
// 짜임: 조각 묶음마다 ownSplit 하나. 칼선이 시대 내내 같은 묶음(펀자브·신드·카슈미르·구자라트 등)은 1206~1756 한 묶음이라 1756년 모양이 colonial.mjs 1757년 줄과 같은 선으로 이어진다.
//   라자스탄은 란탐보르 선을 쓰는 1206~1525와 S2 선만 쓰는 1526~1756 두 묶음, 데칸(마하라슈트라·카르나타카)은 1206~1489·1490~1686·1687~1756 세 묶음(마지막은 S2 선 그대로).
// 칼선은 조사 노트 4-1절 꼭짓점을 바탕으로 한 손그림 선이다(강·산줄기·지금 지구 경계 어림). 안/밖 기준 도시는 결과 노트 3절 표(pt-dh 판정).
import { I as W_I } from '../../lib.mjs';
const W_ring = (pts) => [[[...pts, pts[0]]]];
const W_box = (w, s, e, n) => W_ring([[w, s], [e, s], [e, n], [w, n]]);
const W_DS = 'delhi-sultanate';
const W_MG = 'mughal-empire';
const W_SUR = 'sur-empire';
const W_BAH = 'bahmani-sultanate';
const W_BJP = 'bijapur-sultanate';
const W_AHN = 'ahmadnagar-sultanate';
const W_VIJ = 'vijayanagara-empire';
const W_HYD = 'hyderabad-state';
const W_PESH = 'maratha-peshwa';
const W_DUR = 'durrani-empire';
const W_AFS = 'afsharid-iran';
const W_YAD = 'yadava-dynasty';
const W_HOY = 'hoysala-dynasty';
const W_GUJ = 'gujarat-sultanate';
const W_CHAUL = 'chaulukya-dynasty';
// S2·S1 선(colonial.mjs·modern.mjs 모음에서만 가져옴)
const { W_CN, W_JAISALMER, W_BIKANER, W_JODHPUR, W_MEWAR, W_JAIPUR, W_KOTA, W_EAST_RJ, W_SOUTH_RJ, W_CUTCH, W_KATHIAWAR, W_KADI, W_BARODA, W_PALANPUR, W_REWA_KANTHA,
  W_MAHI_KANTHA, W_DOAB, W_MAJHA, W_PHULKIAN, W_KULLU, W_KANGRA, W_GORKHA, W_CHITRAL, W_MALAKAND, W_HAZARA, W_BAHAWALPUR, W_MULTAN, W_KALAT_PARTS, W_BA_REST } = S2_CUTS;
const { S_BERAR: W_S_BERAR, S_NAGPUR: W_S_NAGPUR, S_HYD_STRIP: W_S_HYD_STRIP, S_KOLHAPUR: W_S_KOLHAPUR, S_SATARA: W_S_SATARA, S_OLD_MYSORE: W_S_OLD_MYSORE, S_MYSORE: W_S_MYSORE,
  S_KANARA: W_S_KANARA, S_COORG: W_S_COORG, S_KOLLEGAL: W_S_KOLLEGAL, S_DHARWAD: W_S_DHARWAD, S_BELLARY: W_S_BELLARY } = S2_CUTS;
const { MARATHWADA: W_MARATHWADA, HK_KARNATAKA: W_HK } = S1_CUTS;

// ── 새 칼선 ──
// 칸데시(파루키 술탄국): 북은 사트푸라 산줄기(마디아프라데시 경계 — 북쪽 변은 마하라슈트라 북쪽 끝 너머 22.3°까지 두어 조각 경계가 정함), 남은 아잔타·사트말라 구릉(타프티 골짜기 남쪽 가장자리), 서는 난두르바르 서쪽, 동은 부사왈 너머
const W_CUT_KHANDESH = W_ring([[73.3, 22.3], [76.3, 22.3], [76.3, 20.7], [75.8, 20.55], [75.2, 20.5], [74.6, 20.45], [74.1, 20.4], [73.5, 20.7]]);
// 아마드나가르(니잠 샤히) 몸통: 북은 칸데시 선, 서는 사햐드리(서쪽 변은 마하라슈트라 서쪽 끝 너머 72.9°, 북서쪽은 21.0°까지 두어 콘칸·칸데시 선과 빈틈 없이 맞물림 — 겹친 곳은 칸데시가 먼저), 남은 비마강, 동은 파르바니·비드 너머(난데드 밖)
const W_CUT_AHMADNAGAR = W_ring([[72.9, 20.3], [72.9, 21.0], [73.6, 21.0], [73.5, 20.7], [74.1, 20.4], [74.6, 20.45], [75.2, 20.5], [75.8, 20.55], [76.3, 20.6], [77.2, 20.2], [77.2, 19.6], [77.0, 18.7], [76.4, 18.55],
  [75.9, 18.5], [75.4, 18.2], [74.8, 18.15], [74.2, 18.15], [73.6, 18.15], [73.35, 18.45], [73.4, 18.9], [73.5, 19.4], [73.6, 19.95]]);
// 비다르(바리드 샤히): 비다르·우드기르·후남라바드·바사바칼랴나(마하라슈트라 라투르 동부 + 카르나타카 비다르 지구)
const W_CUT_BIDAR = W_ring([[76.3, 18.7], [77.2, 18.7], [77.8, 18.4], [78.0, 17.9], [77.9, 17.5], [77.2, 17.5], [76.6, 17.7], [76.3, 18.0]]);
// 콘칸 해안: 동은 사햐드리 마루(아마드나가르 선과 같은 꼭짓점), 남은 고아 경계
const W_CUT_KONKAN = W_ring([[73.65, 15.7], [73.8, 16.15], [73.78, 16.85], [73.62, 17.4], [73.5, 17.95], [73.35, 18.45], [73.4, 18.9], [73.5, 19.4], [73.6, 19.95], [73.5, 20.3], [71.5, 20.3], [71.5, 15.7]]);
// 니잠 샤히 콘칸(북)과 아딜 샤히 콘칸(남)의 경계: 사비트리강 어귀(반코트) 위도
const W_CUT_KONKAN_N = W_I(W_CUT_KONKAN, W_box(71, 17.98, 74.5, 21));
// 카르나타카 남부(호이살라·비자야나가라 남부): 북은 퉁가바드라강 남쪽(치트라두르가 안, 벨라리·다르와드 밖)
const W_CUT_KA_SOUTH = W_ring([[73.5, 14.7], [75.0, 14.75], [75.7, 14.8], [76.4, 14.75], [77.2, 14.65], [78.9, 14.65], [78.9, 11.0], [73.5, 11.0]]);
// 비자푸르의 카르나타카 정복지(1638~1687 방갈루루·콜라르·호스코테·시라·툼쿠루): 마이소르·치트라두르가 밖
const W_CUT_BJP_KA = W_ring([[76.85, 14.25], [77.4, 14.25], [78.6, 13.9], [78.6, 12.75], [77.3, 12.75], [76.85, 13.3]]);
// 카슈미르 골짜기와 둘레(로하라 왕조·카슈미르 술탄국): 남은 피르판잘 남쪽 가장자리(라자우리 안, 잠무·미르푸르·키슈트와르 밖)
const W_CUT_KASHMIR = W_box(72.8, 33.35, 75.9, 35.2);
// 란탐보르(차하마나 하미르): 바나스강·참발강 사이, 통크·카라울리까지
const W_CUT_RANTHAMBORE = W_ring([[75.7, 25.6], [77.5, 25.6], [77.5, 26.7], [76.1, 26.7], [75.7, 26.1]]);
// 하부 신드(타타·하이데라바드·카라치·타르파르카르): 북은 나와브샤 남쪽
const W_CUT_LOWER_SINDH = W_box(66, 23.5, 71.5, 26);
// 시바지의 스와라지(콘칸 밖 몫): 푸네·마발·사타라·판할라 산록(아마드나가르·솔라푸르 밖)
const W_CUT_SWARAJ = W_ring([[73.65, 15.7], [74.45, 16.4], [74.75, 17.2], [74.8, 17.85], [74.55, 18.45], [74.2, 18.65], [73.85, 18.85], [73.62, 19.25], [73.6, 19.9], [71.5, 19.9], [71.5, 16.05]]);
// 스와라지 북(푸네·주나르, 니잠 샤히 땅)과 남(사타라·판할라, 아딜 샤히 땅): 아마드나가르 선 남쪽 변 위도
const W_SWARAJ_N_BOX = W_box(71, 18.15, 75, 20);
// 인더스 서안(서펀자브 데라 가지 칸·라잔푸르·미안왈리 이사 켈): 동은 인더스강 본류(물탄·라호르·바하왈푸르 밖)
const W_CUT_INDUS_W = W_ring([[69, 34], [71.75, 33.2], [71.7, 32.5], [71.3, 32.1], [71.05, 31.6], [70.95, 31.2], [70.8, 30.7], [70.9, 30.2], [70.85, 29.8], [70.65, 29.3], [70.45, 28.9], [70.2, 28.4], [69, 28.4]]);
// 나그푸르 구역의 북(데오가르 곤드 → 나그푸르)과 남(찬다 곤드): 와르다강 아래 찬드라푸르 지구 북쪽 위도
const W_NAGPUR_N_BOX = W_box(77, 20.55, 82.5, 23);
// 라이추르 도아브(크리슈나강–퉁가바드라강 사이, 남 변은 하이데라바드 카르나타카 선보다 조금 남쪽 — 그 안 벨라리 선 땅은 도아브벨라리로 떼어 벨라리 줄을 따름, 선 꼭짓점이 겹치면 넓이 0 조각이 남아 일부러 엇갈림, 라이추르·무드갈·링가수구르·쿠시타기 안, 쇼라푸르·바갈코트·벨라리 밖): 1520 라이추르 전투로 비자야나가라, 1565 탈리코타로 비자푸르
const W_CUT_RAICHUR_DOAB = W_ring([[75.9, 15.4], [76.1, 15.33], [76.5, 15.33], [76.9, 15.5], [77.37, 15.75], [77.65, 15.8], [77.65, 16.42], [77.3, 16.42], [76.9, 16.3], [76.35, 16.22], [75.9, 16.3]]);
// 라주라·코르파나(와르다강 남서, 1956년까지 하이데라바드 땅이라 마라트와다 선 안): 1490~1686년에는 아마드나가르 본령과 떨어져 있어 발라르푸르(찬다 곤드의 옛 도읍) 쪽 찬다 왕국 땅으로 떼어 냄
const W_RAJURA_BOX = W_box(78.85, 19.2, 79.8, 20.1);
// 마라트와다 선이 페인강가강을 따라 와니 남쪽(베라르 야와트말 쪽)까지 들어간 띠: 1490~1686년에는 베라르 줄을 따름(키나왓 쪽 본령과 떨어진 약 560 km² — 상자 안 베라르 땅은 같은 줄이라 모양이 같음, 마라트와다 선과 겹쳐 자르면 넓이 0 조각이 남아 상자를 그대로 씀)
const W_PENGANGA_BOX = W_box(78.3, 19.2, 78.85, 20.1);
// 아지메르 쪽 나머지에서 떼는 시로히(데오라 차우한, 1573 구자라트 정복 뒤 무굴 종주)와 잘라와르 쪽(1562 말와 정복 뒤 무굴)
const W_SIROHI_BOX = W_box(71.9, 24.2, 73.45, 25.3);
const W_JHALAWAR_BOX = W_box(75.4, 23.7, 76.95, 24.95);
// 바하왈푸르 주 선에 둘러싸인 물탄 선 남쪽 끝(라힘야르칸 서쪽 약 100 km²): 1748~1751년 바하왈푸르 땅과 이음
const W_PP_TIP_BOX = W_box(69.5, 28.0, 70.2, 28.6);
// 분디(하다 차우한): 코타 선 밖 분디 지구 어림(1631부터는 코타 선이 먼저) — 아지메르 쪽 무굴 땅과 나눔
const W_BUNDI_BOX = W_box(75.2, 24.95, 76.2, 25.85);

// ── 조각 나누기 ──
const W_A = 1206, W_B = 1490, W_C = 1526, W_E = 1687; // 묶음 기간 경계(BOUNDS의 해)
// 펀자브(인도): 도아브·마자 = 수틀레지 서북(1398~1413 비움, 1752 두라니), 펄키안·시스틀레지 = 시르힌드 벨트(1756까지 무굴)
const W_PB = ownSplit('W_펀자브', ['IN-PB'], [['도아브', W_DOAB], ['마자', W_MAJHA], ['펄키안', W_PHULKIAN]], '시스틀레지');
const W_HR = ownSplit('W_하리아나', ['IN-HR'], [['펄키안', W_PHULKIAN]], '나머지');
const W_PP = ownSplit('W_서펀자브', ['PK-PB'], [['서안', W_CUT_INDUS_W], ['바하왈푸르', W_BAHAWALPUR], ['남끝', W_I(W_MULTAN, W_PP_TIP_BOX)], ['물탄', W_MULTAN]], '중부');
const W_KP = ownSplit('W_KP', ['PK-KP'], [['치트랄', W_CHITRAL], ['말라칸드', W_MALAKAND], ['하자라', W_HAZARA]], '페샤와르');
const W_SD = ownSplit('W_신드', ['PK-SD'], [['하부', W_CUT_LOWER_SINDH]], '상부');
const W_BA = ownSplit('W_발루치', ['PK-BA'], [['카란', W_KALAT_PARTS[0]], ['마크란', W_KALAT_PARTS[1]], ['라스벨라', W_KALAT_PARTS[2]], ['칼라트', W_KALAT_PARTS[3]],
  ['직할지', W_BA_REST]], '부스러기');
const W_JK = ownSplit('W_카슈미르', ['IN-JK', 'PK-JK'], [['골짜기', W_CUT_KASHMIR]], '잠무');
const W_LA = ownSplit('W_라다크', ['IN-LA'], [['중국', W_CN]], '라다크');
const W_HP = ownSplit('W_히마찰', ['IN-HP'], [['중국', W_CN], ['쿨루', W_KULLU], ['캉그라', W_KANGRA], ['고르카', W_GORKHA]], '산지');
const W_GJ = ownSplit('W_구자라트', ['IN-GJ'], [['쿠치', W_CUTCH], ['카티아와르', W_KATHIAWAR], ['카디', W_KADI], ['바로다', W_BARODA], ['팔란푸르', W_PALANPUR],
  ['레와칸타', W_REWA_KANTHA], ['마히칸타', W_MAHI_KANTHA]], '평원');
const W_RJ1 = ownSplit('W_라자스탄1206', ['IN-RJ'], [['란탐보르', W_CUT_RANTHAMBORE], ['자이살메르', W_JAISALMER], ['비카네르', W_BIKANER], ['조드푸르', W_JODHPUR],
  ['메와르', W_MEWAR], ['자이푸르', W_JAIPUR], ['코타', W_KOTA], ['동부', W_EAST_RJ], ['남부', W_SOUTH_RJ]], '나머지', {}, { from: W_A, to: W_C });
const W_RJ2 = ownSplit('W_라자스탄1526', ['IN-RJ'], [['란탐보르', W_CUT_RANTHAMBORE], ['자이살메르', W_JAISALMER], ['비카네르', W_BIKANER], ['조드푸르', W_JODHPUR], ['메와르', W_MEWAR], ['자이푸르', W_JAIPUR],
  ['코타', W_KOTA], ['동부', W_EAST_RJ], ['남부', W_SOUTH_RJ], ['분디', W_BUNDI_BOX], ['시로히', W_SIROHI_BOX], ['잘라와르', W_JHALAWAR_BOX]], '나머지', {}, { from: W_C, to: S3_END });
// 데칸 1206~1489: 콘칸·칸데시·베라르·나그푸르 구역·카르나타카 남부·하이데라바드 카르나타카·벨라리, 나머지(마라트와다·데시·북카르나타카)
const W_DK1 = ownSplit('W_데칸1206', ['IN-MH', 'IN-KA'], [['콘칸', W_CUT_KONKAN], ['칸데시', W_CUT_KHANDESH], ['베라르', W_S_BERAR], ['나그푸르북', W_I(W_S_NAGPUR, W_NAGPUR_N_BOX)],
  ['나그푸르남', W_S_NAGPUR], ['남카르나타카', W_CUT_KA_SOUTH], ['하이데라바드', W_HK], ['벨라리', W_S_BELLARY]], '데칸', {}, { from: W_A, to: W_B });
// 데칸 1490~1686: 다섯 술탄국 갈림(비다르·아마드나가르·베라르·비자푸르)과 시바지의 스와라지
const W_DK2 = ownSplit('W_데칸1490', ['IN-MH', 'IN-KA'], [['비다르', W_CUT_BIDAR], ['콘칸북', W_CUT_KONKAN_N], ['콘칸남', W_CUT_KONKAN],
  ['스와라지북', W_I(W_CUT_SWARAJ, W_SWARAJ_N_BOX)], ['스와라지남', W_CUT_SWARAJ], ['라주라', W_I(W_MARATHWADA, W_RAJURA_BOX)], ['페인강가', W_PENGANGA_BOX], ['마라트와다', W_MARATHWADA], ['베라르', W_S_BERAR],
  ['칸데시', W_CUT_KHANDESH], ['아마드나가르', W_CUT_AHMADNAGAR], ['나그푸르북', W_I(W_S_NAGPUR, W_NAGPUR_N_BOX)], ['나그푸르남', W_S_NAGPUR],
  ['도아브벨라리', W_I(W_CUT_RAICHUR_DOAB, W_S_BELLARY)], ['라이추르도아브', W_CUT_RAICHUR_DOAB], ['하이데라바드', W_HK], ['벨라리', W_S_BELLARY], ['비자푸르카르나타카', W_CUT_BJP_KA],
  ['남카르나타카', W_CUT_KA_SOUTH]], '데칸', {}, { from: W_B, to: W_E });
// 데칸 1687~1756: colonial.mjs 1757년과 같은 선(S_마하라슈트라·S_카르나타카) + 스와라지·칸데시–아마드나가르(페슈와령 안에서만 떼어 냄)
const W_MH3 = ownSplit('W_마하라슈트라1687', ['IN-MH'], [['마라트와다', W_MARATHWADA], ['베라르', W_S_BERAR], ['나그푸르북', W_I(W_S_NAGPUR, W_NAGPUR_N_BOX)], ['나그푸르남', W_S_NAGPUR],
  ['하이데라바드띠', W_S_HYD_STRIP], ['콜하푸르', W_S_KOLHAPUR], ['사타라', W_S_SATARA], ['스와라지', W_CUT_SWARAJ], ['칸데시', W_CUT_KHANDESH], ['아마드나가르', W_CUT_AHMADNAGAR]],
  '남서', {}, { from: W_E, to: S3_END });
const W_KA3 = ownSplit('W_카르나타카1687', ['IN-KA'], [['하이데라바드', W_HK], ['하이데라바드띠', W_S_HYD_STRIP], ['옛마이소르', W_S_OLD_MYSORE], ['마이소르', W_S_MYSORE],
  ['카나라', W_S_KANARA], ['쿠르그', W_S_COORG], ['콜레갈', W_S_KOLLEGAL], ['다르와드', W_S_DHARWAD], ['벨라리', W_S_BELLARY]], '북카르나타카', {}, { from: W_E, to: S3_END });

// ── 주인 줄 ──
// 델리 둘레(하리아나 나머지·델리): 1206 아이바크 → 1526 파니파트 → 1540 수르 → 1555 후마윤 복귀, 1756년 끝(1757 colonial.mjs 비움 — 운영자 결정 6)
own([W_HR.나머지, 'IN-DL'], [[1206, W_DS], [1526, W_MG], [1540, W_SUR], [1555, W_MG]]);
// 시르힌드 벨트(펄키안·시스틀레지·찬디가르): 1756년까지 무굴(1757 두라니 — 결정 6)
own([W_PB.펄키안, W_PB.시스틀레지, W_HR.펄키안, 'IN-CH'], [[1206, W_DS], [1526, W_MG], [1540, W_SUR], [1555, W_MG]]);
// 수틀레지 서북(잘란다르 도아브·마자)과 라호르 쪽 서펀자브: 1398년 티무르 약탈 뒤 1413년까지 여러 세력이 갈라 쥠(결정 1, voids), 1414 키지르 칸, 1752 무굴이 두라니에 펀자브 할양
own([W_PB.도아브, W_PB.마자, W_PP.중부, 'PK-IS'], [[1206, W_DS], [1398, null], [1414, W_DS], [1526, W_MG], [1540, W_SUR], [1555, W_MG], [1752, W_DUR]]);
// 물탄·바하왈푸르·인더스 서안: 1206 카바차 → 1228 일투트미시 → 1398 비움 → 1414 델리 → 1445 랑가 왕조 → 1528 무굴(1528~29 아르군 점령은 짧아 칠하지 않음) → 1541 수르 → 1555 무굴
own([W_PP.물탄], [[1206, 'qubacha-multan'], [1228, W_DS], [1398, null], [1414, W_DS], [1445, 'multan-sultanate'], [1528, W_MG], [1541, W_SUR], [1555, W_MG], [1752, W_DUR]]);
// 물탄 선 남쪽 끝(바하왈푸르 주 선에 둘러싸인 곳): 물탄과 같고 1748~1751년만 바하왈푸르(무굴 부스러기 막음), 1752 두라니
own([W_PP.남끝], [[1206, 'qubacha-multan'], [1228, W_DS], [1398, null], [1414, W_DS], [1445, 'multan-sultanate'], [1528, W_MG], [1541, W_SUR], [1555, W_MG], [1748, 'bahawalpur-state'], [1752, W_DUR]]);
own([W_PP.바하왈푸르], [[1206, 'qubacha-multan'], [1228, W_DS], [1398, null], [1414, W_DS], [1445, 'multan-sultanate'], [1528, W_MG], [1541, W_SUR], [1555, W_MG], [1748, 'bahawalpur-state']]);
// 인더스 서안: 1739년 나디르 샤가 인더스 서쪽을 병합(결정 7), 1748 두라니
own([W_PP.서안], [[1206, 'qubacha-multan'], [1228, W_DS], [1398, null], [1414, W_DS], [1445, 'multan-sultanate'], [1528, W_MG], [1541, W_SUR], [1555, W_MG], [1739, W_AFS], [1748, W_DUR]]);
// 페샤와르 골짜기·하자라: 1586 아크바르의 카불 지방 → 1739 아프샤르 → 1748 두라니. 그 앞 유수프자이 등 파슈툰 부족 땅은 비움(voids)
own([W_KP.페샤와르], [[1206, null], [1586, W_MG], [1739, W_AFS], [1748, W_DUR]]);
own([W_KP.하자라], [[1206, null], [1586, W_MG], [1752, W_DUR]]); // 하자라는 인더스 동쪽이라 1739 병합 밖, 1752 무굴 할양으로 두라니
own([W_KP.치트랄], [[1206, null], [1585, 'chitral-kingdom']]); // 카토르 왕조 성립 무렵(1585) 전은 비움
own([W_KP.말라칸드], [[1206, null]]); // 스와트·디르 부족 땅(colonial.mjs와 같이 비움)
own(['PK-TA'], [[1206, null], [1739, W_AFS], [1748, W_DUR]]); // 부족 지역: 1739 나디르 샤 병합 전은 비움
// 신드: 하부(타타)는 소마라 → 1351 삼마 → 1520 아르군(1555 타르칸) → 1593 무굴 → 1737 칼호라(결정 5), 상부는 카바차 → 1228 델리 → 1351 삼마 … → 1701 칼호라
own([W_SD.하부], [[1206, 'soomra-dynasty'], [1351, 'samma-dynasty'], [1520, 'arghun-dynasty'], [1593, W_MG], [1737, 'talpur-sindh']]);
own([W_SD.상부], [[1206, 'qubacha-multan'], [1228, W_DS], [1351, 'samma-dynasty'], [1520, 'arghun-dynasty'], [1593, W_MG], [1701, 'talpur-sindh']]);
// 발루치스탄: 칼라트 무리는 modern.mjs 선 그대로 각 나라 성립 해부터, 나머지 내륙은 1747년까지 비움(결정 4)
own([W_BA.칼라트], [[1206, null], [1666, 'kalat']]);
own([W_BA.카란], [[1206, null], [1697, 'kharan']]);
own([W_BA.마크란], [[1206, null], [1740, 'makran']]);
own([W_BA.라스벨라], [[1206, null], [1742, 'las-bela']]);
own([W_BA.직할지], [[1206, null], [1748, W_DUR]]);
own([W_BA.부스러기], [[1206, null]]); // 넓이 0에 가까운 부스러기(colonial.mjs와 같음)
own(['PK-GB'], [[1206, null]]); // 발티스탄·길기트: 1만 km² 미만 소국 연합(colonial.mjs와 같이 비움)
// 카슈미르: 로하라 왕조 → 1339 샤 미르 → 1586 무굴 → 1752 두라니, 잠무·키슈트와르·미르푸르 산지 소국은 1586부터 무굴·1752부터 두라니 종주 색
own([W_JK.골짜기], [[1206, 'lohara-dynasty'], [1339, 'kashmir-sultanate'], [1586, W_MG], [1752, W_DUR]]);
own([W_JK.잠무], [[1206, null], [1586, W_MG], [1752, W_DUR]]);
// 라다크: 1206년부터(결정 3). 중국 쪽 도형(원 1279~1367·청 1720~)이 덮는 땅은 그 기간 비움
own([W_LA.라다크, 'KAS'], [[1206, 'ladakh-kingdom']]);
own([W_LA.중국], [[1206, 'ladakh-kingdom'], [1279, null], [1368, 'ladakh-kingdom'], [1720, null]]);
// 히마찰 산지: 1206년부터 펀자브 산지 토후국들 묶음(캉그라 성채의 무굴 점령 1620은 1만 km² 미만)
own([W_HP.산지, W_HP.쿨루, W_HP.캉그라, W_HP.고르카], [[1206, 'punjab-hill-states']]);
own([W_HP.중국], [[1206, 'punjab-hill-states'], [1279, null], [1368, 'punjab-hill-states'], [1720, null]]);
// 구자라트: 찰루키아(1244 바겔라) → 1304 델리 → 1398 자파르 칸 독립(결정 2) → 1573 무굴 → 1730 카티아와르 소국들(S3 결정 ③-1) · 1753 마라타 가이크와드(평원)
own([W_GJ.쿠치], [[1206, 'cutch-state']]);
own([W_GJ.평원, W_GJ.팔란푸르, W_GJ.마히칸타, W_GJ.레와칸타], [[1206, W_CHAUL], [1304, W_DS], [1398, W_GUJ], [1573, W_MG], [1753, 'baroda-state']]);
own([W_GJ.카디, W_GJ.바로다], [[1206, W_CHAUL], [1304, W_DS], [1398, W_GUJ], [1573, W_MG], [1734, 'baroda-state']]); // 1734 필라지 가이크와드의 바로다
own([W_GJ.카티아와르], [[1206, W_CHAUL], [1304, W_DS], [1398, W_GUJ], [1573, W_MG], [1730, 'kathiawar-states']]); // 1730 주나가드가 무굴 구자라트 총독에게서 독립한 무렵부터 소국들(운영자 결정, S3 창구 ③ 1)
own(['IN-DH'], [[1206, W_CHAUL], [1304, W_DS], [1398, W_GUJ], [1535, 'portuguese-india']]); // 디우 1535·다만 1559(합쳐 1만 km² 미만이라 조각 통째)
// 라자스탄 1206~1525
own([W_RJ1.란탐보르], [[1206, 'chahamana-dynasty'], [1301, W_DS]]); // 1301 알라웃딘의 란탐보르 함락
own([W_RJ1.자이살메르], [[1206, 'jaisalmer-state']]);
own([W_RJ1.비카네르], [[1206, null], [1465, 'bikaner-state']]);
own([W_RJ1.조드푸르], [[1206, null], [1459, 'jodhpur-state']]);
own([W_RJ1.메와르], [[1206, 'mewar-state'], [1303, W_DS], [1326, 'mewar-state']]); // 1303 치토르 함락, 1326 하미르 싱 복귀(D6)
own([W_RJ1.자이푸르], [[1206, null], [1503, 'jaipur-state']]);
own([W_RJ1.코타, W_RJ1.동부, W_RJ1.남부, W_RJ1.나머지], [[1206, null]]); // 분디·메와트·바가드·아지메르 쪽은 1만 km² 넘는 한 나라가 없음(voids)
// 라자스탄 1526~1756(colonial.mjs와 같은 선)
own([W_RJ2.란탐보르], [[1526, W_MG], [1540, W_SUR], [1555, W_MG], [1754, 'jaipur-state']]); // 1754 마도 싱 1세가 무굴에게서 란탐보르를 받음
own([W_RJ2.자이살메르], [[1526, 'jaisalmer-state']]);
own([W_RJ2.비카네르], [[1526, 'bikaner-state']]);
own([W_RJ2.조드푸르], [[1526, 'jodhpur-state']]);
own([W_RJ2.메와르], [[1526, 'mewar-state']]);
own([W_RJ2.자이푸르], [[1526, 'jaipur-state']]);
own([W_RJ2.코타], [[1526, null], [1631, 'kota-state']]);
// 동부(메와트·알와르·바라트푸르): 1527 칸와 전투 뒤 바부르가 메와트를 얻음(아그라·델리 수바 직할), 1722 바단 싱의 바라트푸르 자트(1만 km² 넘는 한 나라 아님, voids — 장부 후보)
own([W_RJ2.동부], [[1526, null], [1527, W_MG], [1540, W_SUR], [1555, W_MG], [1722, null]]);
// 남부(둔가르푸르·반스와라·프라타프가르): 1527 반스와라가 바가드에서 갈린 뒤 세습 소국 묶음(1577 무렵부터 무굴 종주는 관계)
own([W_RJ2.남부], [[1526, null], [1527, 'south-rajputana-states']]);
// 아지메르 쪽 나머지(아지메르·키샨가르·통크 서쪽): 1559 무렵 무굴 아지메르 수바, 1721 무굴 지배가 무너진 뒤 라토르·마라타가 다툼(voids)
own([W_RJ2.나머지], [[1526, null], [1559, W_MG], [1721, null]]);
own([W_RJ2.분디], [[1526, null]]);
own([W_RJ2.시로히], [[1526, null], [1573, W_MG], [1721, null]]); // 시로히: 1573 구자라트 정복으로 무굴 땅과 이어진 뒤 종주 색(1만 km² 미만)
own([W_RJ2.잘라와르], [[1526, null], [1562, W_MG], [1721, null]]); // 잘라와르 쪽: 1562 말와 정복 뒤 무굴 // 분디 하다(D9, 1만 km² 미만 — voids)
// 데칸 1206~1489
own([W_DK1.콘칸], [[1206, null], [1317, W_DS], [1347, W_BAH]]); // 실라하라 뒤 야다바 변경(1만 km² 넘는 한 나라 아님, voids)
own([W_DK1.칸데시], [[1206, W_YAD], [1317, W_DS], [1382, 'khandesh-sultanate']]);
own([W_DK1.베라르, W_DK1.데칸], [[1206, W_YAD], [1317, W_DS], [1347, W_BAH]]); // 1296~1316 공납 기간도 야다바(D20), 1317 하르팔데바 처형
own([W_DK1.나그푸르북], [[1206, null]]); // 곤드 땅(데오가르 성립 전, voids)
own([W_DK1.나그푸르남], [[1206, null], [1470, 'chanda-kingdom']]);
own([W_DK1.남카르나타카], [[1206, W_HOY], [1343, W_VIJ]]); // 1343 발랄라 3세 전사
own([W_DK1.하이데라바드], [[1206, W_YAD], [1317, W_DS], [1347, W_BAH]]);
own([W_DK1.벨라리], [[1206, W_HOY], [1327, W_DS], [1336, W_VIJ]]); // 1327 캄필리 함락, 1336 하리하라(D13: 캄필리는 따로 그리지 않음)
// 데칸 1490~1686
own([W_DK2.비다르], [[1490, W_BAH], [1492, 'bidar-sultanate'], [1619, W_BJP], [1657, W_MG]]); // 1657 아우랑제브의 비다르·칼랴니 점령
own([W_DK2.콘칸북, W_DK2.스와라지북], [[1490, W_AHN], [1636, W_BJP], [1659, W_PESH]]); // 1636 조약으로 비자푸르(D21), 1657~59 시바지의 칼리안·푸네
own([W_DK2.콘칸남, W_DK2.스와라지남], [[1490, W_BJP], [1674, W_PESH]]); // 1673 판할라·사타라, 1674 라이가드 즉위 무렵의 남콘칸
own([W_DK2.칸데시], [[1490, 'khandesh-sultanate'], [1601, W_MG]]); // 1601 아시르가르 함락
own([W_DK2.아마드나가르, W_DK2.마라트와다], [[1490, W_AHN], [1636, W_MG]]); // 1636 니잠 샤히 끝
own([W_DK2.라주라], [[1490, 'chanda-kingdom']]);
own([W_DK2.페인강가], [[1490, 'berar-sultanate'], [1574, W_AHN], [1596, W_MG]]); // 와니 남쪽 페인강가 띠: 베라르와 같은 줄 // 와르다강 남서 라주라·코르파나: 찬다 곤드(발라르푸르) 땅, 1687부터는 마라트와다 줄
own([W_DK2.도아브벨라리], [[1490, W_VIJ], [1565, W_BJP], [1686, W_MG]]); // 도아브 칼선 안 벨라리 선 땅: 벨라리와 같은 줄
own([W_DK2.라이추르도아브], [[1490, W_BJP], [1520, W_VIJ], [1565, W_BJP], [1686, W_MG]]); // 1520 라이추르 전투(크리슈나데바 라야), 1530 무렵 잠깐 잃었다가 아추타 라야가 되찾음, 1565 탈리코타
own([W_DK2.베라르], [[1490, 'berar-sultanate'], [1574, W_AHN], [1596, W_MG]]); // 1574 니잠 샤히 병합, 1596 찬드 비비의 할양
own([W_DK2.나그푸르북], [[1490, null], [1600, 'deogarh-kingdom']]);
own([W_DK2.나그푸르남], [[1490, 'chanda-kingdom']]);
own([W_DK2.하이데라바드, W_DK2.데칸], [[1490, W_BJP], [1686, W_MG]]); // 1686 비자푸르 함락
own([W_DK2.벨라리], [[1490, W_VIJ], [1565, W_BJP], [1686, W_MG]]); // 1565 탈리코타
own([W_DK2.비자푸르카르나타카], [[1490, W_VIJ], [1565, null], [1646, W_BJP], [1686, W_MG]]); // 1565 뒤 나야카 소국들(voids), 1638~46 비자푸르의 방갈루루·시라(D22)
own([W_DK2.남카르나타카], [[1490, W_VIJ], [1565, null]]); // 마이소르·켈라디·치트라두르가 나야카(D15, voids)
// 데칸 1687~1756(colonial.mjs 1757과 같은 선)
own([W_MH3.마라트와다, W_MH3.베라르, W_MH3.하이데라바드띠, W_KA3.하이데라바드, W_KA3.하이데라바드띠, W_KA3.벨라리], [[1687, W_MG], [1724, W_HYD]]); // 1724 니잠 울 물크(D38)
own([W_MH3.콜하푸르, W_MH3.사타라, W_MH3.스와라지], [[1687, W_PESH]]); // 1689~1707 무굴 점령은 되돌려져 마라타 색(D2)
own([W_MH3.칸데시, W_MH3.아마드나가르], [[1687, W_MG], [1724, W_HYD], [1752, W_PESH]]); // 1724 니잠의 데칸 여섯 주, 1752 발키 조약으로 칸데시·바글란을 페슈와에
own([W_MH3.남서, W_KA3.다르와드, W_KA3.북카르나타카], [[1687, W_MG], [1707, W_PESH]]); // 1707 샤후 귀환 뒤 차우트·사르데슈무키로 되찾음
own([W_MH3.나그푸르북], [[1687, 'deogarh-kingdom'], [1739, 'nagpur-kingdom']]); // 1739 라구지 본슬레
own([W_MH3.나그푸르남], [[1687, 'chanda-kingdom'], [1751, 'nagpur-kingdom']]);
own([W_KA3.옛마이소르, W_KA3.콜레갈], [[1687, 'mysore']]); // 1687 치카 데바라자의 방갈루루(D23)
own([W_KA3.마이소르, W_KA3.카나라, W_KA3.쿠르그], [[1687, null]]); // 시라·치트라두르가·켈라디·코다구(colonial.mjs 1757과 같이 비움)
// 고아: 1347 바흐마니 → 1490 비자푸르 → 1510 알부케르크(비자야나가라 1370~1469는 1만 km² 미만이라 바흐마니 색)
own(['IN-GA'], [[1206, null], [1347, W_BAH], [1490, W_BJP], [1510, 'portuguese-india']]);
// ── S3 서 끝 ──

// ── S3 동 (갠지스 평원·벵골·북동·오리사·차티스가르·마디아프라데시·네팔·부탄·텔랑가나·안드라·타밀·케랄라·스리랑카, 구현 S3-동): 칼선·상수·own 줄은 이 아래에, 최상위 이름은 E_ ──
// 남아시아 S3 동(2026-11-03): 조각 IN-UP·IN-UT·IN-BR·IN-JH·IN-WB·IN-OR·IN-CT·IN-MP·북동 일곱·IN-SK·IN-AN·IN-TG·IN-AP·IN-TN·IN-KL·IN-PY·IN-LD·BD-*·NP-*·BT-*·LK-*·MDV-*.
// 해는 그해 말 모습(standards 3절), 항목 to는 포함·버전 to는 미포함. 1756년 모양은 colonial.mjs 1757년 줄과 같은 주인으로 잇는다(S2 칼선을 같은 순서로 다시 씀).
// 칼선은 S2 칼선(S2_CUTS)을 다시 쓰고, 새로 그은 선은 아래 E_cut 여덟 개다(지금 지구 경계·강줄기 어림, 안/밖 기준 도시와 넓이는 결과 노트).
// 근거: 위키백과 en(Bengal Sultanate, Jaunpur Sultanate, Sur Empire, Malwa Sultanate, Gajapati Kingdom, Eastern Ganga dynasty, Kakatiya dynasty, Vijayanagara Empire,
//   Golconda Sultanate, Madurai Nayak dynasty, Gond kingdoms, Koch dynasty, Ahom kingdom, History of Bhutan, Kingdom of Kotte, Sitawaka, Portuguese Ceylon, Nawabs of Bengal, Oudh State)
import { I as E_I, P as E_P, U as E_U, box as E_box, ring as E_ring } from '../../lib.mjs';
import { versions as E_YUAN_VERSIONS } from '../inner-asia.mjs';
import { versions as E_QING_VERSIONS } from '../china.mjs';
import { idsOf as E_idsOf } from './table.mjs';

// 나라 id(여러 번 쓰는 것만)
const E_DS = 'delhi-sultanate';
const E_MG = 'mughal-empire';
const E_SUR = 'sur-empire';
const E_BEN = 'bengal-sultanate';
const E_BN = 'bengal-nawabs';
const E_JAU = 'jaunpur-sultanate';
const E_EG = 'eastern-ganga-dynasty';
const E_GAJ = 'gajapati-kingdom';
const E_KAK = 'kakatiya-dynasty';
const E_VN = 'vijayanagara-empire';
const E_GOL = 'golconda-sultanate';
const E_HYD = 'hyderabad-state';
const E_MAL = 'malwa-sultanate';
const E_KAM = 'kamata-kingdom';
const E_KOCH = 'koch-kingdom';
const E_PESH = 'maratha-peshwa';
const E_NAG = 'nagpur-kingdom';

// ── 중국 이음매: 원(1279~1367)·청(1720~) 도형이 히말라야 가장자리(우타라칸드·네팔·부탄·시킴·아루나찰)를 덮는다 ──
// 원 도형은 1279·1290·1356년 판이 이 권역 상자 안에서 모양이 같고, 1271~1278년 판(몽골 1234 도형)은 이 권역 조각과 겹치지 않는다(아래 검사).
// 청 도형은 1720~1723년 판과 1724년 판이 이 권역 조각 안에서 같은 땅(두 판의 차는 조각 밖)이고, 1724년 판은 S2의 1757년 모양 E_CN과 같다.
// 원 도형은 아루나찰(약 86 km²)을 빼면 청 도형 안에 들어가므로, 조각은 두 도형을 합친 한 부분('중국')으로 떼어 원·청 기간에 주인 null로 둔다(voids는 '중국' 밖 부분과 원·청 기간 밖 '중국'만)
const E_outer = (m) => m.map((poly) => [poly[0]]);
const E_BOX = E_box(60.4, 4.9, 97.6, 37.3);
const E_CN = S2_CUTS.E_CN;
const E_YUAN = E_I(E_outer(E_YUAN_VERSIONS.yuan.find(([f]) => f === 1279)[2]), E_BOX);
{
  for (const [f, t, g] of E_YUAN_VERSIONS.yuan) {
    if (f < 1279) continue;
    if (JSON.stringify(E_I(E_outer(g), E_BOX)) !== JSON.stringify(E_YUAN)) throw new Error(`south-asia sultanate: 원 ${f}~${t}년 판의 남아시아 쪽 모양이 1279년 판과 다름 (E_YUAN을 기간별로 나눈다)`);
  }
  for (const [f, , g] of E_QING_VERSIONS.qing) {
    if (f < 1724 || f >= S3_END) continue;
    if (JSON.stringify(E_I(E_outer(g), E_BOX)) !== JSON.stringify(E_CN)) throw new Error(`south-asia sultanate: 청 ${f}년 판의 남아시아 쪽 모양이 1757년 모양과 다름`);
  }
  if (!E_QING_VERSIONS.qing.some(([f]) => f === 1720)) throw new Error('south-asia sultanate: 청 1720년 판이 없음 (남아시아 쪽 청 도형 시작 해를 다시 잰다)');
}
const E_CN_PART = ['중국', E_U(E_CN, E_YUAN)];
const E_cnLine = (before, after = before) => [[S3_START, before], [1279, null], [1368, after], [1720, null]]; // 원·청 기간에 null

// ── 새 칼선 (좌표 [경도, 위도]) ──
const E_cut = (...pts) => E_P(E_ring(pts));
// 미틸라(IN-BR 갠지스 북쪽, 다르방가·무자파르푸르·시타마르히·마두바니·사마스티푸르·하지푸르 안, 파트나·가야·바갈푸르·아라·문게르 바깥): 갠지스 북안, 동쪽은 마하난다강 어림(푸르니아 안, 키샨간지 바깥)
const E_MITHILA = E_cut([84.3, 27.7], [87.6, 27.7], [87.6, 25.55], [87.2, 25.3], [86.5, 25.4], [86.0, 25.5], [85.5, 25.58], [85.15, 25.64], [84.7, 25.76], [84.3, 26.0]);
// 샤르키 비하르(IN-BR 서남, 아라·북사르·사사람·아우랑가바드·가야 안, 파트나·날란다·라즈기르 바깥): 손강 동쪽 기슭과 팔구강 사이를 어림
// 푸르니아(IN-BR 갠지스 북쪽 마하난다강 동쪽, 키샨간지·카티하르 동부): 무굴 때 벵골 수바의 푸르니아 사르카르라 벵골 쪽 주인을 따름
const E_PURNIA = E_cut([87.6, 27.7], [88.5, 27.7], [88.5, 25.3], [87.6, 25.3]);
const E_SHARQI = E_cut([83.3, 24.3], [85.2, 24.3], [85.2, 25.68], [84.8, 25.82], [84.3, 26.0], [83.3, 26.6]);
// 미드나포르(IN-WB 서남, 미드나포르·탐루크·하우라·가탈·콘타이·자르그람·가르베타 안, 푸룰리아·반쿠라·비슈누푸르·바라크푸르·바르다만·수리 바깥): 후글리강 서쪽과 다모다르강 남쪽,
//   북쪽 변은 반쿠라 지구(말라붐) 남쪽 경계(실라바티강 어림)
const E_MIDNAPORE = E_cut([86.3, 22.6], [86.8, 22.75], [87.2, 22.85], [87.5, 22.98], [87.78, 22.95], [88.33, 22.6], [88.33, 21.4], [86.3, 21.4]);
// 북벵골 코치 땅(IN-WB, 쿠치비하르·잘파이구리·알리푸르두아르·두프구리 안, 이슬람푸르·다르질링·발루르가트·라이간지 바깥): 티스타강 서쪽 기슭에서 동쪽
const E_KOCH_WB = E_cut([88.35, 26.95], [88.35, 26.45], [88.6, 26.2], [88.9, 25.95], [89.9, 25.95], [89.9, 26.95]);
// 북칼링가(IN-AP 고다바리강 북쪽, 비사카파트남·스리카쿨람·비지아나가람·파데루 안, 라자문드리·카키나다·엘루루·비자야와다 바깥)
const E_KALINGA_N = E_cut([81.0, 17.15], [85.2, 17.15], [85.2, 20.0], [81.0, 20.0]);
// 치타공(BD-B 남부, 치타공·콕스바자르·랑가마티 안, 페니·코밀라·노아칼리·락슈미푸르 바깥): 페니강 남쪽과 치타공 구릉
const E_CHITTAGONG = E_cut([91.35, 22.85], [91.6, 22.98], [91.66, 23.1], [91.66, 23.85], [93.0, 23.85], [93.0, 20.5], [91.3, 20.5]); // 북쪽 끝 카그라차리(트리푸라에 막힌 곳)까지
// 북타밀(IN-TN 톤다이만달람과 나두 나두, 첸나이·칸치푸람·벨로르·티루반나말라이·진지·빌루푸람·쿠달로르 안, 치담바람·티루치라팔리·탄자부르·쿰바코남·페람발루르·아리얄루르 바깥): 콜레룬강(콜리담) 북쪽 어림(어귀의 섬들은 남부 쪽)
// 톤다이만달람 북부(팔라르강 어림 북쪽, 벨로르·아르코트·칸치푸람·첸나이 안, 진지·티루반나말라이·빌루푸람 바깥): 진지 나야크가 16세기 중반 아라비두 왕조에 잃은 땅(1600~1645 비자야나가라)
const E_TONDAI = E_cut([78.3, 13.6], [80.5, 13.6], [80.5, 12.5], [80.15, 12.52], [79.7, 12.72], [79.13, 12.87], [78.6, 12.65], [78.3, 12.62]);
// 라이추르 도아브 동쪽 끝(IN-TG 크리슈나강 남쪽, 가드왈·알람푸르 안, 쿠르눌·마흐부브나가르 바깥): 서 칸 라이추르 도아브와 같은 주인(1520~1564 비자야나가라)
const E_TG_DOAB = E_cut([77.6, 15.7], [78.15, 15.7], [78.3, 16.0], [77.9, 16.45], [77.6, 16.42]);
const E_TN_NORTH = E_cut([78.3, 13.6], [80.5, 13.6], [80.5, 11.45], [79.85, 11.45], [79.4, 11.5], [79.0, 11.6], [78.6, 11.75], [78.3, 12.2]);
// 아홈 1523(추티아 병합 뒤): 남안 단시리강 동쪽(골라가트 안, 보카칼 바깥), 북안 수반시리강 동쪽(노스 라킴푸르 안) — E_AHOM 안만
const E_AHOM1523 = E_I(S2_CUTS.E_AHOM, E_P(E_ring([[94.0, 28.6], [94.0, 26.9], [93.88, 26.75], [93.85, 25.4], [98.0, 25.4], [98.0, 28.6]])));
// 아홈 1536(카차리를 몰아낸 뒤 콜롱강까지): 남안 나가온 안·모리가온 바깥, 북안 비스와나트 안·망갈도이 바깥 — E_AHOM 안만
const E_AHOM1536 = E_I(S2_CUTS.E_AHOM, E_P(E_ring([[92.85, 28.6], [92.85, 26.65], [92.45, 26.4], [92.45, 25.4], [98.0, 25.4], [98.0, 28.6]])));

// ── 조각 소유 ──
// 우타르프라데시: S2와 같은 칼선 순서(오우드 → 로힐칸드 → 하부 도아브 → 바라나시 → 고라크푸르 → 분델칸드, 나머지 = 상부 도아브)
const E_upEast = [[S3_START, E_DS], [1394, E_JAU], [1479, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG], [1722, 'awadh']]; // 1394 말리크 사르와르 독립, 1479 바흘룰 로디의 자운푸르 함락(학설 1494는 잔존 세력), 1555 후마윤 복귀, 1722 사아다트 칸
ownSplit('E_UP', ['IN-UP'], [['오우드', S2_CUTS.E_OUDH], ['로힐칸드', S2_CUTS.E_ROHILKHAND], ['하부도아브', S2_CUTS.E_LOWER_DOAB], ['바라나시', S2_CUTS.E_BENARES], ['고라크푸르', S2_CUTS.E_GORAKHPUR], ['분델칸드', S2_CUTS.E_BUNDELKHAND]], '상부도아브', {
  오우드: E_upEast,
  하부도아브: E_upEast, // 운영자 기본값 D4: 1722부터 아와드(S2 1757 모양)
  바라나시: E_upEast,
  고라크푸르: E_upEast,
  로힐칸드: [[S3_START, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG], [1721, 'rohilkhand']], // 1721 알리 무함마드 칸의 카테르
  분델칸드: [[S3_START, 'chandela-dynasty'], [1315, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG], [1731, E_PESH]], // 1731 차트라살이 페슈와에게 분델칸드 3분의 1을 줌(S2 1757 페슈와)
  상부도아브: [[S3_START, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG]], // 운영자 결정 6: 무굴은 1756년까지, 1757 비움(colonial.mjs)
});
// 우타라칸드: 쿠마온(찬드 왕조)·가르왈(1358 무렵 아자이 팔의 통일 전은 52 소국이라 비움). 중국 부분(약 250 km², 넬랑 골짜기·리풀레크 쪽 고개 땅)은 원·청 기간 밖에도 비움(S2와 같은 꼴, 쿠마온·가르왈로 나누면 넓이 0 부스러기와 도형 계산 오류가 남)
ownSplit('E_UT', ['IN-UT'], [E_CN_PART, ['쿠마온', S2_CUTS.E_KUMAON], ['테흐리', S2_CUTS.E_TEHRI]], '가르왈', {
  중국: [[S3_START, null]],
  쿠마온: [[S3_START, 'kumaon-kingdom']],
  테흐리: [[S3_START, null], [1358, 'garhwal-kingdom']],
  가르왈: [[S3_START, null], [1358, 'garhwal-kingdom']],
});
// 비하르: 미틸라(카르나타 왕조 → 1324 기야스웃딘 투글루크의 심라운가르흐 점령 → 1415 벵골 술탄국), 서남(샤르키 자운푸르 1394~1478), 나머지(파트나·바갈푸르·푸르니아)
ownSplit('E_BR', ['IN-BR'], [['미틸라', E_MITHILA], ['푸르니아', E_PURNIA], ['샤르키', E_SHARQI]], '남비하르', {
  푸르니아: [[S3_START, E_DS], [1338, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, E_MG], [1717, E_BN]],
  미틸라: [[S3_START, 'karnat-dynasty'], [1324, E_DS], [1394, E_JAU], [1415, E_BEN], [1540, E_SUR], [1557, E_BEN], [1576, E_MG], [1733, E_BN]], // 1394 오이나와르 왕가가 자운푸르에 공납, 1557 수라지가르 전투(벵골의 바하두르 샤가 아딜 샤 수르를 죽임), 1733 비하르가 벵골 나와브 관할로
  샤르키: [[S3_START, E_DS], [1394, E_JAU], [1479, E_DS], [1526, E_MG], [1540, E_SUR], [1557, E_BEN], [1576, E_MG], [1733, E_BN]], // 1526 파니파트 뒤 무굴(비하르 아프간은 1529 가그라 전투에서 항복)
  남비하르: [[S3_START, E_DS], [1394, E_JAU], [1479, E_DS], [1498, E_BEN], [1529, E_MG], [1540, E_SUR], [1557, E_BEN], [1576, E_MG], [1733, E_BN]], // 1498~1528 후세인 샤히 벵골
});
// 자르칸드(초타나그푸르): 나그반시 왕국 등 고원 소국 땅은 1585 아크바르의 원정으로 무굴 공납국이 되기 전 비움(장부 후보), 1733 비하르와 함께 벵골 나와브
own(['IN-JH'], [[S3_START, null], [1585, E_MG], [1733, E_BN]]);
// 서벵골: 두아르·칼림퐁(1만 km² 미만, 부탄 1651), 북벵골 코치 땅, 미드나포르(동부 강가 → 가자파티 → 1510 벵골 술탄국), 나머지(락나우티·사트가온)
ownSplit('E_WB', ['IN-WB'], [['서두아르', S2_CUTS.E_DUARS_W], ['칼림퐁', S2_CUTS.E_KALIMPONG], ['코치', E_KOCH_WB], ['미드나포르', E_MIDNAPORE]], '벵골', {
  서두아르: [[S3_START, null], [1257, E_KAM], [1498, E_BEN], [1515, E_KOCH], [1612, E_MG], [1651, 'bhutan']], // 알리푸르두아르·두프구리 쪽 산기슭은 코치 땅과 같이, 1651 무렵 부탄(시작 해는 어림)
  칼림퐁: [[S3_START, null], [1651, 'bhutan']],
  코치: [[S3_START, null], [1257, E_KAM], [1498, E_BEN], [1515, E_KOCH], [1612, E_MG], [1717, E_BN]], // 1257 상디아의 카마타푸르, 1498 후세인 샤가 닐람바르를 무너뜨림, 1515 비스와 싱하, 1612 무굴의 코치 하조 병합(쿠치비하르는 1만 km² 미만 속국)
  미드나포르: [[S3_START, E_EG], [1434, E_GAJ], [1510, E_BEN], [1540, E_SUR], [1554, E_BEN], [1592, E_MG], [1717, E_BN]], // 1592 만 싱의 오리사 정복
  벵골: [[S3_START, E_DS], [1338, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, E_MG], [1717, E_BN]], // 운영자 결정 9: 1206~1337 델리 술탄국(이와즈·부그라 칸 계 독립기는 글), 1554 무함마드 칸 수르의 독립(무함마드 샤히)
});
// 방글라데시: 동벵골(세나 → 1245 데바 → 1281 발반의 소나르가온 → 1338 소나르가온 술탄국 → 1352 일리야스 샤의 통일), 북벵골 랑푸르(카마타·코치), 실헤트(1303 샤 잘랄), 치타공(1459~1665 아라칸, 비움)
const E_bdEast = [[S3_START, 'sena-dynasty'], [1245, 'deva-dynasty-bengal'], [1281, E_DS], [1338, 'sonargaon-sultanate'], [1352, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, E_MG], [1717, E_BN]];
own(['BD-A', 'BD-C', 'BD-D'], E_bdEast);
own(['BD-E'], [[S3_START, E_DS], [1338, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, E_MG], [1717, E_BN]]);
own(['BD-F'], [[S3_START, null], [1257, E_KAM], [1498, E_BEN], [1515, E_KOCH], [1612, E_MG], [1717, E_BN]]);
own(['BD-G'], [[S3_START, null], [1303, E_DS], [1338, 'sonargaon-sultanate'], [1352, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, null], [1612, E_MG], [1717, E_BN]]); // 1576~1611 아프간 우스만 칸의 실헤트(비움), 1612 무굴
ownSplit('E_BDB', ['BD-B'], [['치타공', E_CHITTAGONG]], '코밀라', {
  치타공: [[S3_START, null], [1340, 'sonargaon-sultanate'], [1352, E_BEN], [1459, null], [1666, E_MG], [1717, E_BN]], // 1340 파크루딘의 치타공 점령, 1459~1665 아라칸(동남아 영향표), 1666 샤이스타 칸
  코밀라: [[S3_START, null], [1245, 'deva-dynasty-bengal'], [1281, E_DS], [1338, 'sonargaon-sultanate'], [1352, E_BEN], [1540, E_SUR], [1554, E_BEN], [1576, E_MG], [1717, E_BN]],
});
// 아삼: 두아르(부탄 1651), 고알파라·캄루프(카마타 → 코치 → 1612 무굴 → 캄루프는 1682 이타쿨리 뒤 아홈), 아홈(1523 동부, 1536 콜롱강까지), 나머지 카차르·카르비 구릉은 비움
ownSplit('E_AS', ['IN-AS'], [['두아르', S2_CUTS.E_DUARS_E], ['고알파라', S2_CUTS.E_GOALPARA], ['아홈1523', E_AHOM1523], ['아홈1536', E_AHOM1536], ['캄루프', S2_CUTS.E_AHOM]], '카차르', {
  두아르: [[S3_START, null], [1651, 'bhutan']], // 시작 해는 부탄 통일(1651)로 어림(알려진 근사)
  고알파라: [[S3_START, null], [1257, E_KAM], [1498, E_BEN], [1515, E_KOCH], [1612, E_MG], [1717, E_BN]],
  아홈1523: [[S3_START, null], [1523, 'ahom-kingdom']], // 1523 추티아 병합 전 아홈·추티아는 각 1만 km² 안팎(장부 후보)
  아홈1536: [[S3_START, null], [1536, 'ahom-kingdom']], // 1536 카차리 왕국을 콜롱강 남쪽으로 밀어냄
  캄루프: [[S3_START, null], [1257, E_KAM], [1498, E_BEN], [1515, E_KOCH], [1612, E_MG], [1667, 'ahom-kingdom'], [1679, E_MG], [1682, 'ahom-kingdom']], // 1667 아홈이 구와하티를 되찾고 1671 사라이가트에서 지킴, 1679 라루크 솔라 보르푸칸이 넘김, 1682 이타쿨리 전투(1658~1662 아홈 점령은 5년이라 칠하지 않음)
  카차르: [[S3_START, null]],
});
own(['IN-MN'], [[S3_START, 'manipur']]);
own(['IN-TR'], [[S3_START, null], [1400, 'tripura']]); // 마니캬 왕조(1400 무렵)
own(['IN-ML', 'IN-NL', 'IN-MZ', 'IN-AN'], [[S3_START, null]]); // 카시·자인티아·가로·나가·루샤이 구릉(1만 km² 미만 소국과 부족 땅)·안다만
ownSplit('E_AR', ['IN-AR'], [E_CN_PART], '아루나찰', { 중국: [[S3_START, null]], 아루나찰: [[S3_START, null]] }); // 부족 땅
ownSplit('E_SK', ['IN-SK'], [E_CN_PART], '시킴', { 중국: [[S3_START, null]], 시킴: [[S3_START, null]] }); // 1642 남걀 왕조(1만 km² 미만, S2 1757 비움과 이음)
// 네팔: 카사 말라 왕국(서부 카르날리·세티·마하칼리, 1390 무렵 줌라·도티·둘루로 갈림), 나머지(카트만두 말라·고르카 등 통일 전 소국)는 비움
const E_NP = E_idsOf('NPL');
const E_NPW = ['NP-KA', 'NP-SE', 'NP-MA'];
ownSplit('E_NPW', E_NPW, [E_CN_PART], '네팔', {
  중국: E_cnLine('khasa-malla-kingdom', null),
  네팔: [[S3_START, 'khasa-malla-kingdom'], [1391, null]],
});
ownSplit('E_NPE', E_NP.filter((id) => !E_NPW.includes(id)), [E_CN_PART], '네팔', { 중국: [[S3_START, null]], 네팔: [[S3_START, null]] });
// 부탄: 1634 다섯 라마 전투 뒤 샤브드룽이 서부(파로·팀푸·푸나카·왕디), 1651 무렵 중동부까지
const E_BT = E_idsOf('BTN');
const E_BTW = ['BT-11', 'BT-12', 'BT-13', 'BT-14', 'BT-15', 'BT-21', 'BT-22', 'BT-23', 'BT-24'];
ownSplit('E_BTW', E_BTW, [E_CN_PART], '부탄', { 중국: [[S3_START, null], [1634, 'bhutan'], [1720, null]], 부탄: [[S3_START, null], [1634, 'bhutan']] });
ownSplit('E_BTE', E_BT.filter((id) => !E_BTW.includes(id)), [E_CN_PART], '부탄', { 중국: [[S3_START, null], [1651, 'bhutan'], [1720, null]], 부탄: [[S3_START, null], [1651, 'bhutan']] });
// 오리사: 해안·남부(동부 강가 → 1434 가자파티 → 1568 카라니 벵골 술탄국 → 1592 무굴), 남부 간잠은 1571 골콘다. 토후국(가르자트)은 종주 색, 1592부터 오리사 토후국들(기본값 D25)
const E_orGarjat = [[S3_START, E_EG], [1434, E_GAJ], [1568, E_BEN], [1592, 'orissa-states']];
ownSplit('E_OR', ['IN-OR'], [['남부', S2_CUTS.E_OR_SOUTH], ['해안', S2_CUTS.E_OR_COAST], ['삼발푸르', S2_CUTS.E_SAMBALPUR], ['마유르반즈', S2_CUTS.E_MAYURBHANJ]], '토후국', {
  남부: [[S3_START, E_EG], [1434, E_GAJ], [1568, E_BEN], [1571, E_GOL], [1687, E_MG], [1724, E_HYD]], // 1571 이브라힘 쿠틉 샤의 칼링가 남부, 1687 골콘다 함락
  해안: [[S3_START, E_EG], [1434, E_GAJ], [1568, E_BEN], [1592, E_MG], [1717, E_BN], [1751, E_NAG]], // 1568 칼라파하르, 1576 뒤에도 카라니 아프간이 1592까지 버팀, 1751 알리바르디 칸의 할양
  삼발푸르: E_orGarjat,
  마유르반즈: [[S3_START, 'mayurbhanj-state']],
  토후국: E_orGarjat,
});
// 차티스가르: 평지·북부 토후국·수르구자는 라탄푸르 칼추리(1741 본슬레의 바스카르 판트 점령), 바스타르는 1324 카카티야 왕족의 바스타르 왕국(그 전은 비움)
ownSplit('E_CT', ['IN-CT'], [['바스타르', S2_CUTS.E_BASTAR], ['수르구자', S2_CUTS.E_SURGUJA], ['북부토후국', S2_CUTS.E_CH_NORTH]], '평지', {
  바스타르: [[S3_START, null], [1324, 'bastar-state']],
  수르구자: [[S3_START, 'ratanpur-kingdom'], [1613, 'surguja-state']],
  북부토후국: [[S3_START, 'ratanpur-kingdom'], [1741, 'chhattisgarh-states']], // 기본값 D25
  평지: [[S3_START, 'ratanpur-kingdom'], [1741, E_NAG]],
});
// 마디아프라데시: S2와 같은 칼선 순서. 말와(파라마라 → 1305 델리 → 1401 말와 술탄국 → 1531 구자라트 → 1537 카디르 샤 → 1542 수르 → 1555 바즈 바하두르 → 1562 무굴 → 1738 보팔 조약)
const E_malwa = (end) => [[S3_START, 'paramara-dynasty'], [1305, E_DS], [1401, E_MAL], [1531, 'gujarat-sultanate'], [1537, E_MAL], [1542, E_SUR], [1555, E_MAL], [1562, E_MG], end];
const E_sagar = [[S3_START, 'chandela-dynasty'], [1315, E_DS], [1401, E_MAL], [1531, 'gujarat-sultanate'], [1537, E_MAL], [1542, E_SUR], [1555, E_MAL], [1562, E_MG], [1731, E_PESH]];
const E_rewa = [[S3_START, null], [1597, E_MG], [1617, 'rewa-state']]; // 바겔라 왕국(반다브가르)은 장부 후보, 1597 아크바르의 반다브가르 점령, 1617 레와 천도
ownSplit('E_MP', ['IN-MP'], [['괄리오르북부', S2_CUTS.S_GWALIOR_N], ['괄리오르말와', S2_CUTS.S_GWALIOR_MALWA], ['인도르', S2_CUTS.S_INDORE], ['보팔', S2_CUTS.S_BHOPAL], ['레와', S2_CUTS.S_REWA_LAND],
  ['소하그푸르', S2_CUTS.S_SOHAGPUR], ['분델칸드', S2_CUTS.S_BUNDELKHAND], ['나르마다', S2_CUTS.S_NARMADA], ['베툴세오니', S2_CUTS.S_BETUL_SEONI], ['니마르', S2_CUTS.S_NIMAR], ['본슬레남부', S2_CUTS.S_BHONSLE_S], ['말와', S2_CUTS.S_MALWA], ['서부잔여', E_P(E_box(73.0, 20.0, 76.9, 26.0)[0])]], '사가르', {
  괄리오르북부: [[S3_START, E_DS], [1394, null], [1518, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG], [1738, null]], // 1394~1517 토마르 왕국(장부 후보), 1518 이브라힘 로디, 운영자 결정 6: 1738부터 비움
  괄리오르말와: E_malwa([1738, 'gwalior-state']),
  인도르: E_malwa([1738, 'indore-state']),
  보팔: E_malwa([1707, 'bhopal-state']), // 1707 도스트 무함마드 칸
  레와: E_rewa,
  소하그푸르: E_rewa,
  분델칸드: [[S3_START, 'chandela-dynasty'], [1315, E_DS], [1526, E_MG], [1540, E_SUR], [1555, E_MG], [1731, 'bundelkhand-states']], // 1531 오르차 분델라 등은 1만 km² 미만 무굴 속국
  나르마다: [[S3_START, null], [1480, 'garha-mandla-kingdom'], [1742, E_PESH]], // 운영자 결정 8: 곤드 가르하-만들라(1564 무굴 침공 뒤에도 실제 다스림), 1742 페슈와
  베툴세오니: [[S3_START, null], [1600, 'deogarh-kingdom'], [1743, E_NAG]], // 1743 라고지 본슬레
  니마르: E_malwa([1738, E_PESH]), // 부르한푸르 쪽(약 3,400 km²)은 칸데시 술탄국(1601까지) — 알려진 근사
  본슬레남부: [[S3_START, null], [1600, 'deogarh-kingdom'], [1743, E_NAG]],
  말와: E_malwa([1738, E_PESH]),
  서부잔여: E_malwa([1738, E_PESH]), // S2 칼선 사이에 남은 니마르·말와 쪽 부스러기(S2는 사가르와 같은 페슈와 색)
  사가르: E_sagar,
});
// 텔랑가나: 카카티야 → 1323 와랑갈 함락 → 1330 무수누리 → 1368 바흐마니(레체를라 벨라마는 같은 색, D33) → 1518 골콘다 → 1687 무굴 → 1724 하이데라바드
ownSplit('E_TG', ['IN-TG'], [['도아브', E_TG_DOAB]], '텔랑가나', {
  도아브: [[S3_START, E_KAK], [1323, E_DS], [1330, 'musunuri-nayakas'], [1368, 'bahmani-sultanate'], [1518, E_GOL], [1520, E_VN], [1565, E_GOL], [1687, E_MG], [1724, E_HYD]], // 1520 라이추르 전투, 1565 탈리코타
  텔랑가나: [[S3_START, E_KAK], [1323, E_DS], [1330, 'musunuri-nayakas'], [1368, 'bahmani-sultanate'], [1518, E_GOL], [1687, E_MG], [1724, E_HYD]],
});
// 안드라: 북칼링가(동부 강가 → 가자파티 → 1550 골콘다), 시르카르 남부(고다바리·크리슈나 삼각주), 군투르(콘다비두 레디), 라야랄라시마, 넬로르
const E_rayala = [[S3_START, E_KAK], [1323, E_DS], [1336, E_VN], [1646, E_GOL], [1687, E_MG], [1724, E_HYD]]; // 1646 비자야나가라 끝(미르 줌라의 간디코타 1652는 같은 묶음)
ownSplit('E_AP', ['IN-AP'], [['북칼링가', E_KALINGA_N], ['군투르', S2_CUTS.S_GUNTUR], ['시르카르', S2_CUTS.S_CIRCARS], ['아난타푸르', S2_CUTS.S_ANANTAPUR], ['양도지구', S2_CUTS.S_CEDED]], '넬로르', {
  북칼링가: [[S3_START, E_EG], [1434, E_GAJ], [1550, E_GOL], [1687, E_MG], [1724, E_HYD]],
  군투르: [[S3_START, E_KAK], [1323, E_DS], [1330, 'reddi-kingdom'], [1446, E_GAJ], [1515, E_VN], [1579, E_GOL], [1687, E_MG], [1724, E_HYD]], // 1515 크리슈나데바 라야의 콘다비두, 1579 골콘다
  시르카르: [[S3_START, E_KAK], [1323, E_DS], [1330, 'musunuri-nayakas'], [1368, 'reddi-kingdom'], [1446, E_GAJ], [1550, E_GOL], [1687, E_MG], [1724, E_HYD]], // 1368 라자문드리 레디, 1446 카필렌드라
  아난타푸르: E_rayala,
  양도지구: E_rayala,
  넬로르: [[S3_START, E_KAK], [1323, E_DS], [1346, E_VN], [1446, E_GAJ], [1470, E_VN], [1646, E_GOL], [1687, E_MG], [1692, 'carnatic-nawab']], // 1692 줄피카르 칸의 카르나타카 나와브(S2 1757과 이음)
});
// 타밀나두: 북부(톤다이만달람: 1335~1360 삼부바라야는 비움, 1446~1469 가자파티, 1600 진지 나야크 → 1649 비자푸르 → 1677 시바지 → 1698 카르나타카 나와브)·칸야쿠마리(1746 트라방코르)·나머지 남부
const E_tnSouth = [[S3_START, 'chola-dynasty'], [1216, 'pandya-dynasty'], [1323, E_DS], [1335, 'madurai-sultanate'], [1378, E_VN], [1600, 'madurai-nayak'], [1736, 'carnatic-nawab']]; // 운영자 기본값 D3·D30
ownSplit('E_TN', ['IN-TN'], [['칸야쿠마리', S2_CUTS.S_KANYAKUMARI], ['톤다이', E_TONDAI], ['북부', E_TN_NORTH]], '남부', {
  칸야쿠마리: [...E_tnSouth, [1746, 'travancore']], // 1736~1745 카르나타카 나와브(명목), 1746 트라방코르
  톤다이: [[S3_START, 'chola-dynasty'], [1216, 'pandya-dynasty'], [1323, E_DS], [1335, null], [1361, E_VN], [1446, E_GAJ], [1470, E_VN], [1646, 'gingee-nayak'], [1649, 'bijapur-sultanate'], [1677, E_PESH], [1698, 'carnatic-nawab']], // 벨로르·찬드라기리가 아라비두 왕조의 근거지(1646 비자야나가라 끝)
  북부: [[S3_START, 'chola-dynasty'], [1216, 'pandya-dynasty'], [1323, E_DS], [1335, null], [1361, E_VN], [1446, E_GAJ], [1470, E_VN], [1600, 'gingee-nayak'], [1649, 'bijapur-sultanate'], [1677, E_PESH], [1698, 'carnatic-nawab']],
  남부: E_tnSouth,
});
// 케랄라: 1746 마르탄다 바르마의 트라방코르(그 전 베나드·코친·캘리컷 자모린 등은 각 1만 km² 미만이라 비움)
ownSplit('E_KL', ['IN-KL'], [['트라방코르', S2_CUTS.S_TRAVANCORE]], '말라바르', { 트라방코르: [[S3_START, null], [1746, 'travancore']], 말라바르: [[S3_START, null]] });
own(['IN-PY'], [[S3_START, null], [1674, 'french-india']]); // 프랑스 상관(1674 퐁디셰리) 전 1,000 km² 미만 조각은 비움
own(['IN-LD', ...E_idsOf('MDV')], [[S3_START, null]]); // 락샤드위프·몰디브: 1,000 km² 미만 섬 조각뿐이라 그리지 않음
// 스리랑카: 1206~1214 폴론나루와 왕조(싱할라 왕국), 1215 칼링가 마가의 라자라타 → 1256 반니·자프나(1만 km² 미만)는 비움, 1412 코테, 1565 시타와카, 1592 칸디, 1597 포르투갈령 실론, 1658 네덜란드령 실론
const E_SIN = 'sinhalese-kingdom';
const E_KOT = 'kotte-kingdom';
const E_SIT = 'sitawaka-kingdom';
const E_PC = 'portuguese-ceylon';
own(['LK-11'], [[S3_START, E_SIN], [1412, E_KOT], [1597, E_PC], [1658, 'dutch-ceylon']]);
own(['LK-12', 'LK-13'], [[S3_START, E_SIN], [1412, E_KOT], [1565, E_SIT], [1594, E_KOT], [1597, E_PC], [1658, 'dutch-ceylon']]); // 1565 코테가 콜롬보로 물러남, 1593 라자싱하 1세가 죽어 시타와카가 무너짐
own(['LK-31', 'LK-32', 'LK-33', 'LK-62'], [[S3_START, E_SIN], [1412, E_KOT], [1597, E_PC], [1658, 'dutch-ceylon']]);
own(['LK-61', 'LK-91', 'LK-92'], [[S3_START, E_SIN], [1412, E_KOT], [1565, E_SIT], [1594, 'kandy']]);
own(['LK-21', 'LK-22', 'LK-23'], [[S3_START, E_SIN], [1412, E_KOT], [1582, E_SIT], [1592, 'kandy']]); // 칸디(1469~)는 1591년까지 1만 km² 미만이라 코테 색, 1582 라자싱하 1세의 칸디 정복, 1592 비말라다르마수리야
own(['LK-81', 'LK-82', 'LK-52'], [[S3_START, E_SIN], [1412, E_KOT], [1592, 'kandy']]);
own(['LK-51'], [[S3_START, E_SIN], [1412, E_KOT], [1592, 'kandy'], [1658, 'dutch-ceylon']]);
own(['LK-71', 'LK-72', 'LK-44'], [[S3_START, E_SIN], [1215, 'magha-kingdom'], [1256, null], [1592, 'kandy']]); // 1256~1591 반니 소족장 땅은 비움
own(['LK-45'], [[S3_START, E_SIN], [1215, 'magha-kingdom'], [1256, null], [1592, 'kandy']]);
own(['LK-53'], [[S3_START, E_SIN], [1215, 'magha-kingdom'], [1256, null], [1592, 'kandy'], [1658, 'dutch-ceylon']]);
own(['LK-41', 'LK-42', 'LK-43'], [[S3_START, E_SIN], [1215, 'magha-kingdom'], [1256, null], [1619, E_PC], [1658, 'dutch-ceylon']]); // 자프나 왕국(8,540 km², 1만 km² 미만)은 비움, 1619 포르투갈의 자프나 정복
const E_CN_GAPS = (unit) => [B(S3_START, 1279, unit), B(1368, 1720, unit)]; // 원·청 기간 밖의 '중국' 부분

// ── S3 동 끝 ──

// ── 나머지: 줄을 적지 않은 단위는 시대 내내 주인 null(아직 그리지 않음) ──
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역 ──
// 버전의 to는 숫자 그대로 둔다(마지막 표 끝 S3_END = colonial.mjs의 첫 해)
const joined = joinTables(TABLES);
if (joined.TO !== S3_END) throw new Error(`south-asia sultanate: 마지막 표의 끝이 ${joined.TO} (${S3_END}이어야 colonial.mjs와 이어짐)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));
// 주인 있는 단위가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다. 그해 중국 쪽 도형이 덮는 땅(cnMinusOf)은 통째로 뺀다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapZones = joined.nullSegments.filter(([from, to]) => ownedIn(from, to)).map(([from, to, list]) => {
  const minus = [...cnMinusOf(from, to), ...(list.length ? [build(list)] : [])];
  return { name: `남아시아 술탄국·무굴 ${from}~${to - 1}`, zone: minus.length ? D(SA.domain, ...minus) : SA.domain, from, to };
});

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). [from, to, 도형], // 이유
// V(from, to, 조각 id…)·B(from, to, 단위 이름…)로 한 줄씩 적는다. 자기 칸 머리 아래에
const V = (from, to, ...ids) => [from, to, SA.F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)]; // 나눈 조각 단위(이름/부분)도 받음
const voids = [
  // ── S3 서 ──
  B(1398, 1414, W_PB.도아브, W_PB.마자, W_PP.중부, W_PP.남끝, W_PP.물탄, W_PP.바하왈푸르, W_PP.서안), // 1398 티무르 약탈 뒤 1413년까지 라호르(호카르)·물탄·디팔푸르를 여러 세력이 갈라 쥠(결정 1)
  V(1398, 1414, 'PK-IS'), // 같은 까닭
  B(1206, 1586, W_KP.페샤와르, W_KP.하자라, W_JK.잠무), // 유수프자이 등 파슈툰 부족 땅·잠무 산지 소국(1만 km² 넘는 한 나라 없음), 1586 무굴
  B(1206, 1585, W_KP.치트랄), // 카토르 왕조 성립 전 치트랄 소국
  B(1206, S3_END, W_KP.말라칸드, W_BA.부스러기), // 스와트·디르 부족 땅, 넓이 0에 가까운 부스러기
  V(1206, 1739, 'PK-TA'), // 부족 지역(1739 나디르 샤 병합 전)
  V(1206, S3_END, 'PK-GB'), // 발티스탄·길기트 소국 연합(D12)
  B(1206, 1666, W_BA.칼라트), // 칼라트 칸국 성립 전 림드 부족 연합
  B(1206, 1697, W_BA.카란), // 카란 성립 전
  B(1206, 1740, W_BA.마크란), // 마크란 성립 전
  B(1206, 1742, W_BA.라스벨라), // 라스벨라 성립 전
  B(1206, 1748, W_BA.직할지), // 퀘타·피신·시비·조브 부족 땅(결정 4)
  B(1206, 1465, W_RJ1.비카네르), // 자잘 부족(조힐라 등) 땅, 1465 비카 라토르
  B(1206, 1459, W_RJ1.조드푸르), // 마르와르 소국, 1459 라오 조다
  B(1206, 1503, W_RJ1.자이푸르), // 암베르 카치와하는 1만 km² 미만(D23)
  B(1206, 1526, W_RJ1.코타, W_RJ1.동부, W_RJ1.남부, W_RJ1.나머지), // 분디 하다(D9)·메와트 칸자다(D14)·바가드·아지메르 쪽 소국
  B(1526, 1631, W_RJ2.코타), // 분디(D9)
  B(1526, 1527, W_RJ2.동부, W_RJ2.남부), // 칸와 전투 전 메와트 칸자다(D14)·바가드
  B(1722, S3_END, W_RJ2.동부), // 바라트푸르 자트와 알와르 쪽 소국(1757 colonial.mjs 묶음 전, 장부 후보)
  B(1526, 1559, W_RJ2.나머지), // 아지메르 쪽: 마르와르·메와르가 다툰 땅(1만 km² 넘는 한 나라 아님)
  B(1721, S3_END, W_RJ2.나머지), // 아지메르 쪽: 무굴 지배가 무너진 뒤 조드푸르 라토르·마라타가 다툼
  B(1526, S3_END, W_RJ2.분디), // 분디(D9, 1만 km² 미만)
  B(1526, 1573, W_RJ2.시로히), B(1721, S3_END, W_RJ2.시로히), // 시로히 데오라 차우한(1만 km² 미만), 1721 뒤는 아지메르 쪽과 같은 까닭
  B(1526, 1562, W_RJ2.잘라와르), B(1721, S3_END, W_RJ2.잘라와르), // 잘라와르 쪽 소국(말와 정복 전), 1721 뒤는 아지메르 쪽과 같은 까닭
  B(1206, 1317, W_DK1.콘칸), // 실라하라 뒤 야다바 변경 해안 소국
  B(1206, 1490, W_DK1.나그푸르북), // 곤드 땅(데오가르 성립 전)
  B(1206, 1470, W_DK1.나그푸르남), // 곤드 땅(찬다 성립 전)
  B(1490, 1600, W_DK2.나그푸르북), // 곤드 땅(데오가르 성립 전)
  B(1565, 1646, W_DK2.비자푸르카르나타카), // 탈리코타 뒤 나야카 소국(방갈루루 켐페 가우다 등)
  B(1565, 1687, W_DK2.남카르나타카), // 마이소르·켈라디·치트라두르가 나야카(D15)
  B(1687, S3_END, W_KA3.마이소르, W_KA3.카나라, W_KA3.쿠르그), // 시라·치트라두르가·켈라디·코다구(colonial.mjs 1757과 같음)
  V(1206, 1347, 'IN-GA'), // 카담바 고아(1만 km² 미만)
  // ── S3 서 끝 ──
  // ── S3 동 ──
  B(1206, 1358, 'E_UT/테흐리', 'E_UT/가르왈'), // 1206~1357년 가르왈: 52 가르(소국)로 갈려 1만 km² 넘는 나라가 없음, 1358 무렵 아자이 팔의 통일 전
  ...E_CN_GAPS('E_UT/중국'), // 우타라칸드 북쪽 가장자리(약 250 km², 원·청 기간 밖): 넬랑 골짜기·리풀레크 쪽 고개 땅
  V(1206, 1585, 'IN-JH'), // 1206~1584년 초타나그푸르 고원: 나그반시 왕국과 부족 땅(장부 후보), 1585 아크바르의 원정으로 무굴 공납국이 되기 전
  B(1206, 1651, 'E_WB/칼림퐁'), // 1206~1650년 칼림퐁: 산기슭 부족 땅(1만 km² 미만), 부탄 통일 전
  B(1206, 1257, 'E_WB/코치', 'E_WB/서두아르', 'E_AS/고알파라', 'E_AS/캄루프'), V(1206, 1257, 'BD-F'), // 1206~1256년 카마루파가 무너진 뒤 북벵골·서아삼 소국들, 1257 상디아의 카마타 전
  V(1206, 1303, 'BD-G'), // 1206~1302년 실헤트: 가우르 왕국 등 소국(1만 km² 안팎), 1303 샤 잘랄의 정복 전
  V(1576, 1612, 'BD-G'), // 1576~1611년 실헤트: 아프간 우스만 칸 로하니의 땅, 1612 무굴 정복 전
  B(1206, 1340, 'E_BDB/치타공'), // 1206~1339년 치타공: 하리켈라 등 소국(1만 km² 미만), 1340 파크루딘 무바라크 샤의 정복 전
  B(1459, 1666, 'E_BDB/치타공'), // 1459~1665년 치타공: 아라칸 므라우우 왕국(동남아 권역 영향표), 1666 샤이스타 칸이 되찾기 전
  B(1206, 1245, 'E_BDB/코밀라'), // 1206~1244년 코밀라·노아칼리: 사마타타 소국들(1만 km² 미만), 데바 왕조 전
  B(1206, 1651, 'E_AS/두아르'), // 1206~1650년 아삼 두아르: 산기슭 부족 땅, 부탄 통일 전
  B(1206, 1523, 'E_AS/아홈1523'), // 1206~1522년 상부 아삼: 아홈·추티아 두 나라가 각 1만 km² 안팎(장부 후보), 1523 아홈의 추티아 병합 전
  B(1206, 1536, 'E_AS/아홈1536'), // 1206~1535년 중부 아삼(나가온·소니트푸르): 카차리(디마사)와 바로 부이얀 땅, 1536 아홈의 콜롱강 진출 전
  B(1206, 1757, 'E_AS/카차르'), // 카차르·카르비·디마하사오 구릉: 디마사 왕국(장부 후보)과 부족 땅
  V(1206, 1400, 'IN-TR'), // 1206~1399년 트리푸라: 마니캬 왕조 성립 전 소국
  V(1206, 1757, 'IN-ML', 'IN-NL', 'IN-MZ', 'IN-AN'), // 메갈라야·나갈랜드·미조람·안다만: 카시·자인티아·가로·나가·루샤이 부족 땅과 섬(1만 km² 미만)
  B(1206, 1757, 'E_AR/아루나찰'), ...E_CN_GAPS('E_AR/중국'), // 아루나찰: 부족 땅
  B(1206, 1757, 'E_SK/시킴'), ...E_CN_GAPS('E_SK/중국'), // 시킴: 1642 남걀 왕조 성립 뒤에도 1만 km² 미만(S2 1757 비움과 이음)
  B(1391, 1757, 'E_NPW/네팔'), B(1368, 1720, 'E_NPW/중국'), // 1391~1756년 네팔 서부: 카사 말라가 줌라·도티·둘루 등 바이시 소국으로 갈림
  B(1206, 1757, 'E_NPE/네팔'), ...E_CN_GAPS('E_NPE/중국'), // 네팔 중·동부: 카트만두 말라 왕국들·고르카·마크완푸르 등 통일 전 소국(각 1만 km² 미만)
  B(1206, 1634, 'E_BTW/부탄'), B(1206, 1279, 'E_BTW/중국'), B(1368, 1634, 'E_BTW/중국'), // 1206~1633년 부탄 서부: 샤브드룽 통일 전 씨족·사원 영지
  B(1206, 1651, 'E_BTE/부탄'), B(1206, 1279, 'E_BTE/중국'), B(1368, 1651, 'E_BTE/중국'), // 1206~1650년 부탄 중·동부: 통일 전 소영주 땅
  B(1206, 1324, 'E_CT/바스타르'), // 1206~1323년 바스타르: 차크라코타 나가 왕조(1만 km² 안팎, 확인 못 함), 1324 카카티야 왕족의 바스타르 왕국 전
  B(1394, 1518, 'E_MP/괄리오르북부'), // 1394~1517년 괄리오르: 토마르 왕국(장부 후보), 1518 이브라힘 로디의 점령 전
  B(1738, 1757, 'E_MP/괄리오르북부'), // 1738~1756년 괄리오르 북부: 무굴 총독·고하드 자트·마라타가 갈라 쥠(운영자 결정 6)
  B(1206, 1597, 'E_MP/레와', 'E_MP/소하그푸르'), // 1206~1596년 바겔칸드: 반다브가르의 바겔라 왕국(장부 후보), 1597 아크바르의 점령 전
  B(1206, 1480, 'E_MP/나르마다'), // 1206~1479년 나르마다 상류: 트리푸리 칼추리가 무너진 뒤 곤드 소국들, 가르하-만들라 통일 전
  B(1206, 1600, 'E_MP/베툴세오니', 'E_MP/본슬레남부'), // 1206~1599년 사트푸라 곤드 땅: 케를라 등 소국, 데오가르 왕국 전
  B(1335, 1361, 'E_TN/톤다이', 'E_TN/북부'), // 1335~1360년 톤다이만달람: 삼부바라야 왕국(장부 후보), 비자야나가라의 쿠마라 캄파나 원정 전
  B(1206, 1746, 'E_KL/트라방코르'), B(1206, 1757, 'E_KL/말라바르'), // 케랄라: 베나드·코친·캘리컷 자모린 등 각 1만 km² 미만, 1746 트라방코르 전
  V(1206, 1674, 'IN-PY'), // 퐁디셰리·카라이칼·마헤·야남: 1674 프랑스 상관 전 1,000 km² 미만 조각
  V(1206, 1757, 'IN-LD', ...E_idsOf('MDV')), // 락샤드위프·몰디브: 1,000 km² 미만 섬 조각
  V(1256, 1592, 'LK-71', 'LK-72', 'LK-44', 'LK-45', 'LK-53'), // 1256~1591년 실론 북중부 반니: 반니 소족장 땅, 칸디 왕국 전
  V(1256, 1619, 'LK-41', 'LK-42', 'LK-43'), // 1256~1618년 자프나 왕국(8,540 km², 1만 km² 미만), 1619 포르투갈 정복 전
  // ── S3 동 끝 ──
];
void V; void B; void S2_CUTS; void S1_CUTS; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'sultanate',
  versions,
  gapZones,
  voids,
};

// S4 뼈대(2026-11-04): 이 파일의 칼선 도형 상수 모음(기원전 800~1205 시대 파일 ancient.mjs가 1205년 모양을 1206년 선과 맞출 때 여기서만 가져온다 — 좌표를 옮겨 적지 않음). 도형·버전은 그대로, 이름만 모음
export const S3_CUTS = { W_CUT_KHANDESH, W_CUT_AHMADNAGAR, W_CUT_BIDAR, W_CUT_KONKAN, W_CUT_KONKAN_N, W_CUT_KA_SOUTH, W_CUT_BJP_KA, W_CUT_KASHMIR, W_CUT_RANTHAMBORE, W_CUT_LOWER_SINDH, W_CUT_SWARAJ, W_CUT_INDUS_W, W_CUT_RAICHUR_DOAB, W_SWARAJ_N_BOX, W_NAGPUR_N_BOX, W_RAJURA_BOX, W_PENGANGA_BOX, W_SIROHI_BOX, W_JHALAWAR_BOX, W_PP_TIP_BOX, W_BUNDI_BOX, E_MITHILA, E_PURNIA, E_SHARQI, E_MIDNAPORE, E_KOCH_WB, E_KALINGA_N, E_CHITTAGONG, E_TONDAI, E_TG_DOAB, E_TN_NORTH, E_AHOM1523, E_AHOM1536 };
