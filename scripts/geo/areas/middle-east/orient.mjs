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
// ── A5a-1 메소포타미아·이란 ──
// (이라크·쿠웨이트·이란 모든 조각과 시리아 자지라(하사카·락카·다이르에조르)의 기원전 800~551년(−799~−550) 줄. 칼선 없음: 모두 조각 통째)
// 등급: 일반(1만 km², 해 어긋남 5만 이상 3년·1만~5만 10년). 근거 문서: 조사 노트 a5 notes-1(위키 영어 Neo-Assyrian Empire·Tiglath-Pileser III·Sargon II·Sennacherib·
//   Ashurbanipal·Fall of Nineveh·Nabopolassar·Neo-Babylonian Empire·List of kings of Babylon·Marduk-apla-iddina II·Chaldea·Medes·Median Empire·Elam·
//   List of kings of Elam·Mannaeans·Urartu·Teispes). 당대 기록: 림무 목록·아시리아 왕 비문, 바빌로니아 연대기(ABC 1~3), 나보니두스 연대기, 키루스 원통.
// 운영자 결정(A5 창구 ①·②): 바빌로니아는 독립기만 바빌로니아 왕국, 아시리아 왕이 바빌론 왕을 겸한 해는 아시리아 색(D1 안 A), 남쪽 바닷가(칼데아 부족)와 쿠웨이트는
//   기원전 621년(−620)까지 비움(D1-2), 메디아는 자그로스 6조각과 아라파(D3 안 A), 니네베 뒤 아시리아 본토 북부는 메디아(창구 ② 2), 엘람은 후제스탄만(D4 안 B),
//   마나이·우라르투 우르미아호 쪽·이란 중부·북부·동부는 비움(D5·D6), 안샨은 키루스 2세의 기원전 559년(−558)부터 파르스·부셰르(창구 ② 1).
// 해는 그해 말 모습: 기원전 612년(−611) 말 = 니네베 함락 뒤, 하란 함락(기원전 610년 말~609년 초)은 기원전 609년(−608) 말 모습으로 쳐 자지라를 그해 신바빌로니아로.
// 아나톨리아·캅카스(유럽 조각, 하란·카르케미시 둘레 포함)는 칠하지 않는다. 레반트는 A5a-2, 이집트는 A5b가 같은 아시리아 id로 자기 조각만 적는다.
const NAS = 'neo-assyrian-empire'; // 신아시리아 제국, 지도 기원전 800년(−799)부터(이 칸의 땅은 기원전 610년(−609) 말까지)
const BAB = 'babylonia-kingdom'; // 바빌로니아 왕국, 독립기만(기원전 800~730년·721~711년)
const NBE = 'neo-babylonian-empire'; // 신바빌로니아 제국(A4 항목 앞쪽), 지도 기원전 626년(−625)부터
const MED = 'media-kingdom'; // 메디아 왕국, 기원전 615년(−614)부터
const ELM = 'elam-neo-elamite'; // 신엘람 왕국, 기원전 760년 무렵(−759)부터
const ANS = 'anshan-kingdom'; // 안샨 왕국, 기원전 559년(−558)부터
// 조각 묶음(ancient.mjs의 ASSYRIA·ADIABENE·BABYLONIA·CHARACENE·MEDIA·ELYMAIS·PERSIS와 같은 조각을 이 시대 쓰임에 맞게 다시 묶음 — ancient.mjs는 바이트 그대로)
const ASSYRIA_N = ['IQ-NI', 'IQ-DA', 'IQ-AR', 'IQ-SU']; // 니나와(니네베)·두호크·아르빌·술라이마니야(자무아): 아시리아 본토 북부
const ARRAPHA = ['IQ-TS']; // 타밈(키르쿠크 = 아라파)
const ASSUR = ['IQ-SD']; // 살라딘(아슈르·티크리트)
const BABYLON_LAND = ['IQ-BG', 'IQ-BB', 'IQ-KA', 'IQ-NA', 'IQ-QA', 'IQ-WA', 'IQ-DI', 'IQ-AN', 'IQ-MU']; // 바그다드·바빌·카르발라·나자프·카디시야(니푸르)·와시트·디얄라와 안바르·무탄나(우루크) 사막(통째, A4 결정 ② 1)
const SEALAND = ['IQ-BA', 'IQ-MA', 'IQ-DQ']; // 바스라·마이산·디카르: 남쪽 바닷가(칼데아 비트야킨의 땅)
const KUWAIT = idsOf('KWT'); // 쿠웨이트 6조각
const JAZIRA = ['SY-HA', 'SY-RA', 'SY-DY']; // 하사카(하부르)·락카(발리크·틸바르시프)·다이르에조르(중간 유프라테스)
const MEDIA_CORE = ['IR-24', 'IR-22', 'IR-17', 'IR-16', 'IR-20', 'IR-05']; // 하마단(엑바타나)·마르카지·케르만샤·쿠르디스탄·로레스탄·일람: 메디아 핵심 자그로스
const KHUZESTAN = ['IR-10']; // 후제스탄(수사·마다크투): 신엘람 중심부
const ANSHAN = ['IR-14', 'IR-06']; // 파르스(안샨 = 탈레 말리얀)·부셰르
const IRAN_REST = minus(idsOf('IRN'), ...MEDIA_CORE, ...KHUZESTAN, ...ANSHAN); // 이란의 나머지 22조각(아제르바이잔·이란 중부·북부·동부·바흐티아리·코길루예)
// 아시리아 본토: 기원전 612년(−611) 니네베 함락 뒤 메디아(창구 ② 2). 아라파는 기원전 615년(−614)부터 메디아 군대가 있음(바빌로니아 연대기)
own(ASSYRIA_N, [[-799, NAS], [-611, MED]]);
own(ARRAPHA, [[-799, NAS], [-614, MED]]);
own(ASSUR, [[-799, NAS], [-611, NBE]]); // 아슈르: 기원전 614년 메디아가 약탈, 기원전 612년(−611)부터 신바빌로니아(네리글리사르 때 아슈르 총독)
own(JAZIRA, [[-799, NAS], [-608, NBE]]); // 시리아 자지라: 하란 정권(아슈르우발리트 2세)이 기원전 609년(−608) 무너진 뒤 신바빌로니아
// 바빌로니아: 기원전 729년(−728) 티글라트필레세르 3세가 바빌론 왕, 기원전 721년(−720) 마르두크아플라이딘나 2세, 기원전 710년(−709) 사르곤 2세,
//   기원전 626년(−625) 나보폴라사르(신바빌로니아). 기원전 692~689년 무셰지브마르두크의 자립은 5년 미만이라 아시리아 색 그대로
own(BABYLON_LAND, [[-799, BAB], [-728, NAS], [-720, BAB], [-709, NAS], [-625, NBE]]);
//   우루크(무탄나)는 기원전 620년 무렵까지 아시리아 편이었으나 결정(D1 안 A)대로 바빌로니아 중부와 함께 칠함(운영자 확인 후보, 결과 노트 6절)
own([...SEALAND, ...KUWAIT], [[-799, null], [-619, NBE]]); // 바닷가·쿠웨이트: 기원전 620년(−619) 남쪽 도시들이 나보폴라사르 손에 굳어진 해부터 신바빌로니아
own(MEDIA_CORE, [[-799, null], [-614, MED]]); // 메디아 핵심: 기원전 615년(−614)부터(데이오케스·프라오르테스 전승은 헤로도토스뿐)
own(KHUZESTAN, [[-799, null], [-759, ELM]]); // 후제스탄: 바빌로니아 자료가 이름을 대는 첫 신엘람 왕 훔반타흐라(기원전 760년 무렵)부터
own(ANSHAN, [[-799, null], [-558, ANS]]); // 파르스·부셰르: 키루스 2세가 안샨 왕이 된 기원전 559년(−558)부터
own(IRAN_REST, [[-799, null]]); // 이란의 나머지: 시대 내내 비움(아래 voids)
// ── A5a-1 끝 ──

// ── A5a-2 레반트·아라비아 (2026-11-02 구현 A5a-2: 유프라테스 서쪽 시리아·레바논·이스라엘·팔레스타인·요르단·아라비아 반도) ──
// 등급: 레반트·히자즈·예멘·오만·걸프 해안은 일반, 나지드·룹알할리는 주변. 근거: 아시리아 왕 비문·연대기(림무 목록으로 해가 굳음)·바빌로니아 연대기·자쿠르 비문·
//   세피레 조약 비문·사마리아 항아리 글·센나케리브 연대기, 성서 『열왕기』(후대 편집이 섞인 넓은 영토 서술은 칠하지 않음). 사료 노트 research/notes-2.md.
// 소국(운영자 결정 창구 ① 3과 그 보충): 이스라엘·유다·아람 다마스쿠스는 1만 km² 미만이어도 칼선으로 따로 그린다. 페니키아 도시·아르와드·필리스티아 도시와
//   암몬·모압·에돔은 독립기에 비우고, 티글라트필레세르 3세에게 공물을 바친 기원전 734년 무렵부터 아시리아 색(공물 해 기원전 734년(−733)을 그 원정이 끝난
//   기원전 732년(−731)에 묶음: 2년, 1만~5만 km² 해 어긋남 기준 아래), 아시리아가 끝난 기원전 609년(−608)부터 비우고, 하티 왕들이 네부카드네자르 2세에게
//   공물을 바친 기원전 604년(−603)부터 신바빌로니아 색. 하맛·아르파드는 1만 km²를 넘어 따로 항목.
// 아시리아 서쪽의 끝(결정 창구 ② 줄 2 안 A): 아슈르우발리트 2세가 하란을 되찾지 못한 기원전 609년(−608)부터 비움(네코 2세의 시리아 지배 기원전 609~605년은
//   5년 미만이라 칠하지 않음). 카르케미시 싸움 뒤 하맛까지 쫓은 기원전 605년(−604)에 시리아 북부·다마스쿠스, 아스글론을 무너뜨린 기원전 604년(−603)에 레반트 남부가 신바빌로니아.
// 이 칸의 아시리아·신바빌로니아는 레반트 땅만 적는다(본토는 A5a-1 칸). −550 줄은 ancient.mjs −549의 SYRIA_N·DAMASCUS_HAURAN·JUDEA·NABATAEA·LEBANON(모두 신바빌로니아)과 같은 조각 집합.
const LV_NAS = 'neo-assyrian-empire'; // 신아시리아 제국(항목은 A5a-1 칸), 이 칸은 레반트 땅
const LV_NBE = 'neo-babylonian-empire'; // 신바빌로니아 제국(A4 항목의 앞쪽), 이 칸은 레반트 땅
const LV_DAM = 'aram-damascus'; // 아람 다마스쿠스, 지도 기원전 800~733년
const LV_ISR = 'israel-kingdom'; // 이스라엘 왕국(북왕국), 지도 기원전 800~723년
const LV_JUD = 'judah-kingdom'; // 유다 왕국, 지도 기원전 800~588년
const LV_HAM = 'hamath-kingdom'; // 하맛 왕국, 지도 기원전 800~721년
const LV_ARP = 'arpad-kingdom'; // 아르파드 왕국(비트 아구시), 지도 기원전 800~741년
// 칼선(A5a-2) — 모두 어림 상자(lines 검사 키 없음), 시대 전체
// 사마리아(LV_SAMARIA): 웨스트뱅크(PS-WBK)를 북위 31.93°(벧엘과 미스바 사이)에서 나눈다. 북쪽 사마리아 구릉은 이스라엘, 남쪽 베냐민·유다 구릉은 유다(notes-2 줄 3 안 B)
const LV_SAMARIA = box(34.8, 31.93, 35.7, 32.7);
// 필리스티아 해안(LV_PHILISTIA): 하다롬(IL-D)의 동경 34.75° 서쪽·북위 31.2° 북쪽 해안 평야(아스돗·아스글론). 가자(PS-GZZ)와 함께 필리스티아 도시 땅
const LV_PHILISTIA = box(34.2, 31.2, 34.75, 32.1);
// 유다 남부(LV_JUDAH_S): 하다롬의 동경 34.75° 동쪽·북위 31.2° 북쪽(쉐펠라 남부 라기스·브엘세바 골짜기·아랏·사해 서쪽 광야). 그 남쪽 네게브 사막은 비움
const LV_JUDAH_S = box(34.75, 31.2, 35.6, 32.1);
const LV_WBK = ownSplit('LV_PS-WBK', ['PS-WBK'], [['사마리아', LV_SAMARIA]], '유다');
const LV_ILD = ownSplit('LV_IL-D', ['IL-D'], [['필리스티아', LV_PHILISTIA], ['유다', LV_JUDAH_S]], '네게브');
// 조각 묶음
const LV_ARPAD = ['SY-HL', 'SY-ID']; // 알레포·이들리브: 아르파드(비트 아구시)
const LV_DAMASCUS = ['SY-DI', 'SY-RD', 'SY-DR', 'SY-SU', 'SY-QU', 'SYR-5261']; // 다마스쿠스와 둘레(동쪽 사막 통째)·하우란(다라·스웨이다)·골란
const LV_GALILEE = ['IL-Z', 'IL-HA', 'IL-M', 'IL-TA', 'JO-IR', 'JO-AJ', 'JO-JA']; // 갈릴리·이스르엘 골짜기·해안 평야(도르·샤론)·길르앗(이르비드·아즐룬·제라시)
const LV_COAST_N = ['SY-LA', 'SY-TA']; // 라타키아·타르투스: 아르와드·시미라
const LV_PHOENICIA = ['LB-AS', 'LB-BA', 'LB-JL', 'LB-NA', 'LB-JA']; // 레바논 해안·레바논산: 비블로스·베이루트·시돈·티레
const LV_TRANSJORDAN = ['JO-AM', 'JO-AZ', 'JO-BA', 'JO-MD', 'JO-KA', 'JO-AT']; // 암몬(암만·자르카·발카)·모압(마다바·카라크)·에돔 북부(타필라, 보스라)
const LV_DESERT = ['JO-MN', 'JO-AQ']; // 마안·아카바: 에돔 남부 고지와 사막(조각 통째, A4와 같은 사막 잣대)
const LV_ARABIA = idsOf('SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'BHR'); // 아라비아 반도(쿠웨이트는 A5a-1 칸)
// 시리아 북부·중부: 기원전 740년(−739) 티글라트필레세르 3세가 3년 포위 끝에 아르파드를 무너뜨림, 기원전 720년(−719) 사르곤 2세가 카르카르에서 이기고 하맛을 합침
own(LV_ARPAD, [[-799, LV_ARP], [-739, LV_NAS], [-608, null], [-604, LV_NBE]]);
own(['SY-HM'], [[-799, LV_HAM], [-719, LV_NAS], [-608, null], [-604, LV_NBE]]); // 기원전 738년(−737) 북쪽·해안 고을을 떼인 뒤 남은 하마는 속국(관계)
own(['SY-HI'], [[-799, null], [-719, LV_NAS], [-608, null], [-604, LV_NBE]]); // 홈스·팔미라 사막(조각 통째, 결정 창구 ② 줄 1 안 A): 하맛 병합 때 함께 속주
// 기원전 732년(−731) 다마스쿠스 함락: 다마스쿠스·하우란·카르니니 속주, 시미라 속주(기원전 738년(−737)은 1만 km² 미만이라 이 해에 묶음)와 베카
own(LV_DAMASCUS, [[-799, LV_DAM], [-731, LV_NAS], [-608, null], [-604, LV_NBE]]);
own(['JO-MA', 'LB-BI', ...LV_COAST_N], [[-799, null], [-731, LV_NAS], [-608, null], [-604, LV_NBE]]);
// 이스라엘: 기원전 732년(−731) 므깃도·도르·길르앗 속주가 떨어져 나가고, 기원전 722년(−721) 사마리아 함락(사르곤 2세가 내세운 기원전 720년 설은 mapNote)
own(LV_GALILEE, [[-799, LV_ISR], [-731, LV_NAS], [-608, null], [-603, LV_NBE]]);
own([LV_WBK['사마리아']], [[-799, LV_ISR], [-721, LV_NAS], [-608, null], [-603, LV_NBE]]);
// 유다: 기원전 587년(−586) 예루살렘 함락(기원전 586년 설은 mapNote). 기원전 701년 센나케리브에게 잃은 쉐펠라 일부는 1만 km² 미만이라 그리지 않음
own([LV_WBK['유다'], 'IL-JM', LV_ILD['유다']], [[-799, LV_JUD], [-586, LV_NBE]]);
// 소국(결정 창구 ① 3 보충): 페니키아·필리스티아·암몬·모압·에돔 북부
own([...LV_PHOENICIA, ...LV_TRANSJORDAN, 'PS-GZZ', LV_ILD['필리스티아']], [[-799, null], [-731, LV_NAS], [-608, null], [-603, LV_NBE]]);
// 네게브·마안·아카바 사막(결정 창구 ② 줄 7 안 A): 기원전 553년(−552) 나보니두스의 에돔 원정과 타이마 체류부터 신바빌로니아
own([LV_ILD['네게브'], ...LV_DESERT], [[-799, null], [-552, LV_NBE]]);
// ── A5a-2 끝 ──

// ── A5a 끝 ──

// ── A5b 서 (이집트·시나이·키레나이카·카르타고, 구현 A5b): 칼선·상수·own 줄은 이 아래에 ──
// 등급: 나일 골짜기·삼각주·시나이·동부 사막·키레나이카 해안·튀니지 북부는 일반, 서부 사막과 리비아·마그레브 내륙은 주변(zones.yaml sahara-interior).
// 근거 문서: 조사 노트 notes-3(위키 영어 Third Intermediate Period of Egypt·Twenty-fifth Dynasty of Egypt·Kashta·Piye·Victory Stele of Piye·Shabaka·Tantamani·
//   Assyrian conquest of Egypt·Psamtik I·Cyrene, Libya·Carthage·History of Carthage·Utica, Tunisia).
// 운영자 결정(A5 질문 창구 ①·②): 분열기 이집트는 비움(② 3: 기원전 800~748년 이집트 전체, 하이집트는 쿠시가 장악한 기원전 714년(−713) 전까지, 제22~24왕조 항목 없음),
//   아시리아의 하이집트 지배는 섞어 칠하기(① 1 보충: 기원전 671~670년(−670·−669)과 667~665년(−666~−664) 아시리아 색, 669~668년(−668·−667) 쿠시 색),
//   사막 셋은 이집트 전체가 한 왕조 아래일 때만(조사 줄 2 안 A), 사이스는 기원전 664년(−663) 하이집트·656년(−655) 이집트 전체(줄 4 안 A),
//   시나이는 사이스가 이집트 전체를 얻은 기원전 656년(−655)부터(줄 5 안 A), 카르타고는 비제르트를 넣은 6주(② 4).
// 아시리아 몫: 하이집트의 아시리아 해는 W_NAS(항목은 A5a 칸의 neo-assyrian-empire, 색칠만 이 칸).
// 버전 해: 카르타고는 유럽 쪽 첫 버전(−649) 앞이라 새 버전 −799 하나. 아시리아가 하이집트를 가진 해에는 이집트가 두 주인으로 나뉘므로
//   사막 셋도 조사 줄 2 안 A대로 비운다(쿠시 색으로 둘지는 결과 노트 운영자 확인 후보).
const W_KUS = 'kushite-egypt'; // 이집트 제25왕조(쿠시 왕조), 지도 기원전 747~657년(−746~−656)
const W_SAI = 'saite-egypt'; // 이집트 제26왕조(A4 항목 앞쪽), 지도 기원전 664년(−663)부터
const W_CYR = 'cyrene-kingdom'; // 키레네(A4 항목 앞쪽), 지도 기원전 631년(−630)부터
const W_CAR = 'carthage'; // europe 늘림, 아프리카 쪽 기원전 800년(−799)부터
const W_NAS = 'neo-assyrian-empire'; // 신아시리아 제국(A5a 칸 항목): 하이집트 기원전 671~670년(−670·−669)과 667~665년(−666~−664)
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
own(['EG-BNS'], [[-799, null], [-727, W_KUS], [-670, W_NAS], [-668, W_KUS], [-666, W_NAS], [-663, W_SAI]]); // 헤라클레오폴리스: 피예 승전비의 누비아 속국 왕(기원전 728년), 그 뒤는 하이집트와 같음
own(W_DELTA, [[-799, null], [-713, W_KUS], [-670, W_NAS], [-668, W_KUS], [-666, W_NAS], [-663, W_SAI]]); // 기원전 714년 샤바카(새 연대 샤바타카)의 삼각주 장악, 671년 에사르하돈의 멤피스 함락, 669년 타하르카 수복, 667년 아슈르바니팔, 664년 프삼티크 1세
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
  // ── A5a-1 메소포타미아·이란 ──
  V(-799, -619, ...SEALAND, ...KUWAIT), // 이라크 남쪽 바닷가·쿠웨이트 기원전 800~621년: 칼데아 부족(비트야킨 등)의 땅으로 경계가 기록에 없음(D1-2, A4 결정 ② 4·5)
  V(-799, -614, ...MEDIA_CORE), // 자그로스 기원전 800~616년: 아시리아 속주(파르수아·비트함반·하르하르)와 메디아 군주들의 경계가 기록에 없음, 마나이도 비움(D3·D5)
  V(-799, -759, ...KHUZESTAN), // 후제스탄 기원전 800~761년: 이름이 기록된 신엘람 왕이 없음(D4 안 B)
  V(-799, -558, ...ANSHAN), // 파르스·부셰르 기원전 800~560년: 테이스페스·키루스 1세·캄비세스 1세의 해와 땅이 당대 기록에 없음(창구 ② 1)
  V(-799, A5_END, ...IRAN_REST), // 이란 아제르바이잔·중부·북부·동부와 바흐티아리·코길루예: 메디아 '제국'·마나이·우라르투 쪽은 후대 서술뿐이거나 경계가 없음(범위 ②, D5·D6·D8)
  // ── A5a-1 끝 ──

  // ── A5a-2 레반트·아라비아 ──
  V(-799, -731, ...LV_PHOENICIA, ...LV_TRANSJORDAN, ...LV_COAST_N, 'PS-GZZ'), // 1만 km² 미만 독립 소국(페니키아·아르와드·필리스티아·암몬·모압·에돔): 아시리아에 공물을 바치기 전(결정 창구 ① 3)
  B(-799, -731, 'LV_IL-D/필리스티아'), // 같은 까닭(아스돗·아스글론 해안 평야)
  V(-799, -731, 'JO-MA', 'LB-BI'), // 마프라크(하우란 동쪽 사막)·베카: 다마스쿠스·이스라엘 땅으로 적은 당대 문서가 없음
  V(-799, -719, 'SY-HI'), // 홈스·팔미라 사막: 하맛 왕국 땅은 하마 조각만, 이 땅의 주인은 사료로 정해지지 않음(결정 창구 ② 줄 1)
  V(-799, -552, ...LV_DESERT), // 마안·아카바 사막: 에돔 남부·아랍 부족 땅, 나보니두스의 기원전 553년(−552) 원정 전 다스린 나라 근거 없음(결정 창구 ② 줄 7)
  B(-799, -552, 'LV_IL-D/네게브'), // 네게브 사막: 같은 까닭
  V(-608, -604, ...LV_ARPAD, 'SY-HM', 'SY-HI', ...LV_DAMASCUS, 'JO-MA', 'LB-BI', ...LV_COAST_N), // 기원전 609~606년(−608~−605): 아시리아가 끝나고 네코 2세의 시리아 지배는 5년 미만(결정 창구 ② 줄 2)
  V(-608, -603, ...LV_GALILEE, ...LV_PHOENICIA, ...LV_TRANSJORDAN, 'PS-GZZ'), // 기원전 609~605년(−608~−604): 같은 까닭, 레반트 남부는 아스글론이 무너진 기원전 604년(−603)부터 신바빌로니아
  B(-608, -603, 'LV_PS-WBK/사마리아', 'LV_IL-D/필리스티아'), // 같은 까닭
  V(-799, A5_END, ...LV_ARABIA), // 아라비아 반도: 케다르 등 아랍 부족 연합은 공물·원정만 기록되고 영토가 없으며, 두마·타이마 오아시스는 1만 km² 미만, 남아라비아(사바)는 기원전 551년 전 연대 학설 폭이 커 비움(범위 ②)
  // ── A5a-2 끝 ──

  // ── A5a 끝 ──
  // ── A5b 서 ──
  V(-799, -746, ...W_THEBAID), // 테바이스 기원전 800~748년: 분열기(제22·23왕조) — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -727, ...W_MIDDLE, 'EG-BNS'), // 중이집트·헤라클레오폴리스 기원전 800~729년: 분열기 — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -713, ...W_DELTA), // 삼각주·멤피스·파이윰 기원전 800~715년: 분열기(제22~24왕조와 피예 뒤의 군주들) — 땅 주인을 적은 당대 문서 없음(결정 창구 ② 3)
  V(-799, -713, ...W_DESERT3), // 사막 셋 기원전 800~715년: 이집트 전체가 한 왕조 아래일 때만 칠함(조사 줄 2 안 A)
  V(-670, -668, ...W_DESERT3), // 사막 셋 기원전 671~670년: 아시리아(하이집트)와 쿠시(상이집트)로 나뉨(조사 줄 2 안 A)
  V(-666, -655, ...W_DESERT3), // 사막 셋 기원전 667~657년: 아시리아·사이스(하이집트)와 쿠시(상이집트)로 나뉨(조사 줄 2 안 A)
  V(-799, -655, ...W_SINAI), // 시나이 기원전 800~657년: 쿠시·아시리아 시기의 주인을 적은 당대 문서 없음(조사 줄 5 안 A)
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
