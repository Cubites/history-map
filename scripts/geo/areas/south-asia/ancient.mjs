// south-asia 시대 파일 ancient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 기원전 800~1205: 16대국·마우리아·쿠샨·굽타·지역 왕조와 가즈니·구르
// 짝 항목 파일: data/entities/south-asia-ancient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia/의 다른 도우미 모듈. areas/south-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/south-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/south-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 남아시아 S4 짜임 안내 (2026-11-04 S4 뼈대, 구현 S4-서·S4-동·S4-남이 표를 채움) ─────────────────
// 등급 '일반'(docs/south-asia/00-scope.md 3절: 땅 1만 km², 선 평균 10 / 최대 25 km), 발루치스탄 내륙·마크란과 타르 사막은 '주변'(zones.yaml baluchistan-interior·thar-desert:
//   땅 5만 km², 선 평균 25 / 최대 50 km). 해는 천문 연도(기원전 N년 = 1−N, 예: 기원전 518년 = −517), 한 버전 = 그해 말 모습. 원정·약탈·되돌려진 점령은 칠하지 않는다.
//   근거가 약한 고대 경계는 확실성 estimated(기본값)로 그리고, 결정·기본값이 '비움'이라 한 땅은 칠하지 않는다(voids 줄에 이유). 학설이 갈린 해는 조사 노트·기본값이 고른 하나를 쓴다.
//   명목 종주는 실제 다스린 나라로 칠하고 종주는 관계(vassal_of)·글로(00-scope 3절). 토후국·소국 규칙은 standards 5절(1만 km² 이상 따로 항목, 그 밖은 종주 색 또는 비움).
// 운영자 결정(S4 질문 창구 ②, 2026-11-04 — 뒤집지 않음):
//   1 지도 시작 해 −799(기원전 800년) 유지, 첫 칠하기는 사료가 서는 해부터 — 서 칸 −517(아케메네스), 동·남 칸 −499(16대국, 아반티·아스마카 포함). −799~−500(서는 −518)은 비움.
//   2 achaemenid-empire(유럽 항목)를 늘림: 간다라 −517~·힌두시 −512~, −330까지, 445,504 km²(마크란 해안 제외). 3 마케도니아 인더스 태수령은 칠하지 않음(−324~−316 비움).
//   4 sasanian-empire(서아시아 항목)는 마크란 해안 직할(cut-makran-coast 96,481 km²)만 늘림, 투란 안 칠함, 쿠샨샤르는 새 항목 kushano-sasanian-kingdom.
//   5 ghaznavid-empire(서아시아 항목) 늘림: 1001 페샤와르 → 1010 물탄 → 1021 라호르(최대 약 314,000 km²), 1186까지.
//   6 umayyad-caliphate(711~749)·abbasid-caliphate(750~854) 늘림: 신드·물탄·바하왈푸르·마크란 약 375,000 km², 총독 자치는 mapNote.
//   7 tibet(동아시아 항목)은 라다크·발티스탄만 늘림(길기트 제외, 95,136 km², 650~842). 기존 티베트 도형(동 칸 쪽 68,477 km²)은 그대로 — 아래 cnMinusOf가 뺌.
//   8 새 항목 ghurid-dynasty(1175~1205, 서 칸 정의), 1206 delhi-sultanate·qubacha-multan에 successor_of. S3 1206 도형은 바이트 그대로.
//   9 maurya-empire는 최대 범위 한 덩어리(−296~−185 마하라슈트라 내륙 포함), 말기 상실은 글로. 10 마우리아 뒤 데칸(−184~−100)은 비움, satavahana-dynasty −99부터.
//   기본값 45건은 S4 조사 질문 파일(questions-s4.md)의 '기본값 표'(D1~D45) 그대로.
// 결정 맞춤 표(<sp>/IMPL-SPLIT.md '결정 맞춤' 1~13 요지): 1 gandhara-kingdom 안 만듦(간다라 땅 −799~−518 비움) · 2 동·남 칼선의 −599 기간은 첫 해 −499(서 −517),
//   항목 from은 사료의 해 그대로 · 3 구르 id는 ghurid-dynasty 하나 · 4 인더스 태수령 땅(PK-KP·PK-TA·PK-IS·PK-PB·PK-SD)은 −329~−316 비움, 마우리아는 그 땅에서 −315부터
//   · 5 마크란 해안 240~488 사산 → 489 라이 → 632 차치 → 711 우마이야 · 6 아케메네스 마크란 해안은 칠하지 않음(−304 마우리아) · 7 우마이야 711~749, 아바스 750~(신드 853·물탄 854까지)
//   · 8 마우리아는 모든 칸 −185까지, 데칸 −184~−100 비움 · 9 카시는 동 칸이 확인해 코살라에 붙이거나 새 항목 · 10 서 크샤트라파 하부 신드 395·구자라트·말와 408까지(409 굽타)
//   · 11 말와 1135~1174 chaulukya-dynasty, 1175 paramara-dynasty · 12 마우리아·사타바하나 mapNote 문구 · 13 동 칸은 티베트 땅을 칠하지 않음(cnMinusOf).
// 1205 ↔ 1206 이음: 1205년 모양은 sultanate.mjs 1206년 주인과 이어진다. 같은 나라면 같은 id(joinEras가 이 파일 버전 뒤에 sultanate.mjs 버전을 붙임 — 권역 파일 시대 목록이
//   [ancientEra, sultanateEra, colonialEra, modernEra]로 과거가 앞), sultanate.mjs·colonial.mjs·modern.mjs 도형은 바이트 그대로(compare:geo 대칭차 0 — 기간만 앞으로 늘어난 것은 정상).
//   나라마다 1205와 1206의 넓이 차가 1만 km²(주변 5만)를 넘으면 근거를 결과 노트에, 근거가 없으면 1205를 1206에 맞춘다(같은 선은 S3_CUTS의 그 상수를 그대로 씀).
//   정해진 예외는 셋뿐: 구르 → 델리 술탄국·카바차(이름만 바뀜, 같은 모양) · 페샤와르·아지메르 54,299 km² 1년(결정 8) · 칼추리(트리푸리) 50,041 km² 1205 끝(기본값 45).
// 표: sultanate.mjs와 같은 꼴의 조각 소유표(table.mjs). tableKit('ancient')로 자기 꾸러미를 받아 단위 이름이 다른 시대 파일과 부딪치지 않는다.
//   조각은 남아시아 조각(loadFragments('south-asia'))을 그대로 쓰고 새로 만들지 않는다. 옛 경계는 칼선으로 나눈다. 마지막 해(미포함)는 S4_END(1206) = sultanate.mjs의 첫 해.
// 표 경계 해 BOUNDS(조사 노트 서 4-3절·동 4절·남 4절 제안을 합쳐 줄인 15개 표 — 칼선 모양(나눈 조각 묶음)이 크게 바뀌는 해만 표를 나눔, 320·750은 칸 안 기간 나눔과 맞춤):
//   −799 시작(비움) · −517 아케메네스의 간다라(서)와 16대국 칼선(동·남, 칠하기는 −499부터) · −320 마우리아 성립(16대국 칼선이 사라짐) · −184 슝가·인도-그리스(마우리아 해체)
//   · 75 쿠샨 성립(서) · 240 쿠샨샤르·사산 마크란(서), 사타바하나 뒤 데칸 갈림(남 225 무렵) · 320 굽타 성립(기간 2 시작) · 475 알촌·마이트라카·라이(서), 아울리카라(남)
//   · 543 바다미 찰루키아(남)·후기 굽타 갈림(동) · 711 아랍의 신드 정복(서) · 750 팔라·라슈트라쿠타·아바스(기간 3 시작) · 871 촐라 부흥(남), 프라티하라 확장 뒤(서·동)
//   · 973 서 찰루키아(칼랴니)·파라마라 성립(남), 힌두 샤히 말기(서) · 1090 가하다발라(동)·가즈니 펀자브 뒤(서) · 1157 칼라추리(칼랴니)·세나 절정(남·동), 1206 앞 마지막 표.
//   표 안에서 바뀌는 주인(−499·−412·−344·−296·−99·1001·1186 등)은 같은 칼선의 주인 줄로 적는다. 다른 해에 칼선이 바뀌어야 하면 BOUNDS를 바꾸지 말고 결과 노트 6절.
// 해 줄 넣는 법: own(단위들, [[해, 주인], …]), 나눈 조각은 ownSplit(묶음 이름, 조각 id들, [[부분, 칼선 도형], …], 나머지 이름, { 부분: 줄 }, { from, to }).
//   주인 null은 비운 땅(이유는 voids에 한 줄). 첫 줄의 첫 해는 S4_START(−799). 줄을 적지 않은 단위는 맨 아래 fillTables가 시대 내내 주인 null로 채운다.
//   한 조각을 기간에 따라 다르게 나누려면 ownSplit의 마지막 인자 { from, to }(BOUNDS의 해만)로 묶음을 여럿 두고, 묶음 이름은 서로 달라야 한다(예: 'S_데칸-320'·'S_데칸240').
//   부분의 줄 첫 해는 그 묶음의 from이고, 묶음 기간 밖 해를 적으면 fillTables가 멈춘다(표에 들어가지 않고 조용히 사라지므로).
//   같은 묶음은 기간이 길면 표 여러 개에 그대로 이어 쓰인다(reuse). 칼선이 그대로인 표 경계에서 묶음을 새로 만들지 않는다 — 단위 이름이 바뀌면 주인·모양이 같아도
//   그 해에 새 버전이 생긴다(1만 km² 미만 버전 해가 늘어남).
//   한 표 기간 안에서 나눈 조각은 통째 줄을 적을 수 없다(그 기간은 단위 이름으로). 같은 조각을 두 칸이 own하지 않는다(own이 두 번째 줄을 '이은 줄'로 받아 해가 겹치면 멈춤).
// 여러 토막 항목(촐라·판디아·체라 — IMPL-SPLIT '확인 2'): 같은 id 하나로 줄 사이에 null을 둔다(선례 sultanate.mjs mughal-empire 1526~1540·1555~1756).
//   예: [[S4_START, null], [-259, S_CHOLA], [300, null], [871, S_CHOLA], …]. 빈 기간마다 voids 한 줄(칼라브라 시기 300~589 주인 불명 등). 항목 from을 앞으로 옮기고(촐라 848→−259 등)
//   mapNote에 그린 기간과 비운 기간·까닭을 한 구절. 별도 id(chola-sangam 같은)는 쓰지 않는다. 다시 나타난 버전이 빈 해 앞 마지막 버전과 1만 km² 넘게 다르면 허용 줄이 필요하다.
// 칸 나눔(부딪침 막기, <sp>/IMPL-SPLIT.md '칸'): 구현 S4-서는 '── S4 서 ──', S4-동은 '── S4 동 ──', S4-남은 '── S4 남 ──' 칸 아래에만 쓴다(칼선·상수·import·own 줄·voids 줄 모두),
//   칸 안에서는 기간 소제목 '─ 기간 1 (기원전 800~319) ─'·'─ 기간 2 (320~749) ─'·'─ 기간 3 (750~1205) ─' 아래에 나눠 쓴다(기간마다 중간 저장).
//   서 칸 조각: PK-*·KAS·IN-JK·IN-LA·IN-PB·IN-HR·IN-HP·IN-CH·IN-DL·IN-RJ·IN-GJ·IN-DH. 동 칸 조각: IN-UP·IN-UT·IN-BR·IN-JH·IN-WB·IN-OR·IN-CT·북동 일곱(IN-AS·IN-AR·IN-ML·IN-MN·
//   IN-MZ·IN-NL·IN-TR)·IN-SK·IN-AN·BD-*·NP-*·BT-*. 남 칸 조각: IN-MH·IN-MP·IN-GA·IN-KA·IN-TG·IN-AP·IN-TN·IN-KL·IN-PY·IN-LD(안 그림)·LK-*·MDV-*(안 그림).
//   S3와 칸이 다르다(MH·GA·KA·MP·TG·AP·TN·KL·LK가 남 칸). 칼선은 칸(조각 경계)을 넘지 않는다.
//   최상위 이름(const·import 이름)은 칸마다 앞머리: 서 W_, 동 E_, 남 S_(import도 `import { X as S_X } from …`). 공통 이름(own·ownSplit·D·SA·build·cnMinusOf·S1_CUTS·S2_CUTS·S3_CUTS 등)은 그대로,
//   ownSplit 묶음 이름(첫 인자)도 앞머리('W_간다라-517'). 같은 나라 id를 칸마다 따로 상수로 둔다(W_MAURYA·E_MAURYA·S_MAURYA = 'maurya-empire').
//   칸 밖 공통 줄(공통 import·BOUNDS·도우미·cnMinusOf)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 권역 파일 areas/south-asia.mjs(EXTENDABLE·시대 목록)도 어느 칸도 고치지 않는다.
// S1·S2·S3 칼선 다시 쓰기: modern.mjs의 S1_CUTS(9개)·colonial.mjs의 S2_CUTS(W_·E_·S_ 87개)·sultanate.mjs의 S3_CUTS(W_CUT_* 13개·W_*_BOX 8개·E_ 칼선 12개)에서만 가져온다
//   (아래 공통 import, 예: const S_TONDAI = S3_CUTS.E_TONDAI, const W_DOAB = S2_CUTS.W_DOAB). 좌표를 옮겨 적지 않고 세 파일은 고치지 않는다(모음에 없는 선이 필요하면 결과 노트).
//   S2 colonial.mjs의 S_ 상수는 S2_CUTS.S_BERAR처럼 모음으로만 부르고 같은 이름의 최상위 const를 새로 만들지 않는다(남 칸 S_ 앞머리와 부딪침).
//   W_CN·E_CN(S2)은 1757년 청 도형이라 이 시대 중국 이음매로 쓰지 않는다 — 이 시대에 남아시아 조각과 겹치는 다른 권역 도형은 tibet(618~842)뿐이다(아래 cnMinusOf).
// 늘린 나라(서 칸): 소유표의 주인으로 다른 권역 나라 id를 쓰려면 권역 파일 extendable에 있어야 한다. S4 뼈대가 운영자 결정대로 다 적었다(IMPL-SPLIT '확인 4'):
//   achaemenid-empire [−517, −329] · sasanian-empire [240, 489] · ghaznavid-empire [1001, 1187] · umayyad-caliphate [711, 750] · abbasid-caliphate [750, 855] · tibet [650, 843].
//   기존 범위 안 모양은 바이트 그대로이고, 늘린 땅이 그해 원래 도형과 1 km² 넘게 겹치면 생성기가 멈춘다(engine.mjs) — tibet 늘림 땅은 cnMinusOf(650, 843)를 뺀 땅만.
// 월경지·허용 줄·정답표·표기 사전·relations는 각 파일 끝(그 파일의 남아시아 절 끝)에 자기 머리 줄('# ── 남아시아 S4 서 …'·'동'·'남')을 두고 그 아래에만.
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, box } from '../../lib.mjs';
import { SA, tableKit } from './table.mjs';
import { S3_CUTS } from './sultanate.mjs';
import { S2_CUTS } from './colonial.mjs';
import { S1_CUTS } from './modern.mjs';
import { versions as INNER_ASIA_VERSIONS } from '../inner-asia.mjs';

const { build, joinTables, makeTable } = tableKit('ancient');

const S4_START = -799; // 이 시대 파일의 첫 해: 기원전 800년(천문 −799) 해 말 — 경계 사료가 서는 해(서 −517·동남 −499) 앞은 비움(운영자 결정 1)
const S4_END = 1206; // 이 시대 파일의 끝(미포함) = sultanate.mjs의 첫 해

// ── 조각 소유표 도우미 (colonial.mjs와 같은 꼴, 표가 여럿) ─────────────────────────────
const BOUNDS = [S4_START, -517, -320, -184, 75, 240, 320, 475, 543, 711, 750, 871, 973, 1090, 1157, S4_END];
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < S4_START || e[0] >= S4_END)) {
    throw new Error(`south-asia ancient: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${S4_START} 이상 ${S4_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`south-asia ancient: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = S4_START, to = S4_END } = {}) => {
  if (!BOUNDS.includes(from) || !BOUNDS.includes(to) || from >= to) throw new Error(`south-asia ancient: 나눈 조각 ${name}의 기간 [${from}, ${to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  if (layouts.some((l) => l.name === name)) throw new Error(`south-asia ancient: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`south-asia ancient: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`south-asia ancient: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`south-asia ancient: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  const known = new Set([...SA.ids, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`south-asia ancient: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`south-asia ancient: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`south-asia ancient: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`south-asia ancient: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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

// 빈 땅 검사 구역에서 그해 통째로 뺄 다른 권역 도형. S4 뼈대가 짬(칸은 고치지 않음): 기원전 800~1205년 동안 남아시아 조각과 겹치는 앞 권역 도형은
// tibet(inner-asia.mjs, 618~662·663~842 두 판, 남아시아 조각 안 75,728 km² = 서 칸 라다크 쪽 7,251 + 동 칸 히말라야 쪽 68,477)뿐이다(뼈대가 data/geo 전체를 재어 확인).
// 세 칸이 모두 이 도형을 그해 주인 땅에서 빼서(주인 null 부분으로 떼어 둠) 겹침 0, 서 칸 tibet 늘림 땅(라다크·발티스탄)도 이 도형을 뺀 것. [from, to) 기간에 뺄 멀티폴리곤 목록을 돌려준다.
// 두 판은 남아시아 상자 안에서 북쪽 끝(조각 밖)만 다르고 남아시아 조각 안 땅은 같다. 구멍은 버리고 바깥 링만 쓴다(sultanate.mjs E_YUAN과 같은 꼴)
const CN_BOX = box(60.4, 4.9, 97.6, 37.3);
const CN_SHAPES = Object.entries({ tibet: INNER_ASIA_VERSIONS.tibet }).flatMap(([id, vs]) => {
  if (!vs?.length) throw new Error(`south-asia ancient: inner-asia.mjs에 ${id} 버전이 없음 (cnMinusOf를 다시 잰다)`);
  return vs.filter(([f, t]) => f < S4_END && (t == null || S4_START < t)).map(([f, t, g]) => [f, t ?? Infinity, I(g.map((poly) => [poly[0]]), CN_BOX)]);
});
const cnMinusOf = (from, to) => CN_SHAPES.filter(([f, t]) => f < to && from < t).map(([, , g]) => g); // 티베트(618~842)

// ── S4 서 (파키스탄·카슈미르·라다크·펀자브·하리아나·히마찰·델리·라자스탄·구자라트, 구현 S4-서): 칼선·상수·own 줄은 이 아래에, 최상위 이름은 W_ ──
// 짜임: 조각마다 나눈 묶음 하나를 시대 내내 쓴다(IN-LA만 티베트 도형을 떼는 543~870 묶음을 따로 둠). 1205년 모양이 sultanate.mjs 1206년과 같은 넓이가 되게
//   부분의 순서는 S3 서 칸 묶음(W_서펀자브·W_KP·W_신드·W_카슈미르·W_펀자브·W_구자라트·W_라자스탄1206)과 같게 두고, 새 칼선은 그 뒤나 S2 선 안을 다시 가르는 데만 쓴다.
//   해는 천문 연도(기원전 N년 = 1−N), 한 버전 = 그해 말 모습. 근거가 약한 고대 경계는 확실성 estimated(기본값).
import { U as W_U } from '../../lib.mjs';
const W_ring = (pts) => [[[...pts, pts[0]]]];
const { W_CHITRAL, W_MALAKAND, W_HAZARA, W_BAHAWALPUR, W_MULTAN, W_DOAB, W_MAJHA, W_PHULKIAN, W_BALTISTAN, W_JAISALMER, W_BIKANER, W_JODHPUR, W_MEWAR,
  W_JAIPUR, W_KOTA, W_EAST_RJ, W_SOUTH_RJ, W_CUTCH, W_KATHIAWAR, W_KADI, W_BARODA, W_PALANPUR, W_REWA_KANTHA, W_MAHI_KANTHA } = S2_CUTS;
const { W_CUT_INDUS_W, W_PP_TIP_BOX, W_CUT_LOWER_SINDH, W_CUT_KASHMIR, W_CUT_RANTHAMBORE } = S3_CUTS;
// 나라 id (서 칸 상수)
const W_ACH = 'achaemenid-empire'; // 유럽 항목 늘림(결정 2)
const W_MAU = 'maurya-empire';
const W_IG = 'indo-greek-kingdom';
const W_ISC = 'indo-scythian-kingdom';
const W_IP = 'indo-parthian-kingdom';
const W_KU = 'kushan-empire';
const W_WS = 'western-satraps';
const W_KS = 'kushano-sasanian-kingdom';
const W_SAS = 'sasanian-empire'; // 서아시아 항목 늘림(결정 4)
const W_KID = 'kidarite-kingdom';
const W_ALC = 'alchon-huns';
const W_GUP = 'gupta-empire';
const W_MAIT = 'maitraka-dynasty';
const W_RAI = 'rai-dynasty';
const W_CHACH = 'chach-dynasty';
const W_VAR = 'vardhana-dynasty';
const W_KAR = 'karkota-dynasty';
const W_UMA = 'umayyad-caliphate'; // 유럽 항목 늘림(결정 6)
const W_TIBET = 'tibet'; // 동아시아 항목 늘림(결정 7)
const W_TS = 'turk-shahi';
const W_GP = 'gurjara-pratihara-dynasty';
const W_MEWAR_ST = 'mewar-state';
const W_ABB = 'abbasid-caliphate'; // 서아시아 항목 늘림(결정 6)
const W_HAB = 'habbarid-emirate';
const W_MUL = 'multan-emirate';
const W_UTP = 'utpala-dynasty';
const W_HS = 'hindu-shahi';
const W_LAD = 'ladakh-kingdom';
const W_CHAUL = 'chaulukya-dynasty';
const W_GHAZ = 'ghaznavid-empire'; // 서아시아 항목 늘림(결정 5)
const W_LOH = 'lohara-dynasty';
const W_SOO = 'soomra-dynasty';
const W_TOM = 'tomara-dynasty';
const W_CHA = 'chahamana-dynasty';
const W_CUTCH_ST = 'cutch-state';
const W_JAIS = 'jaisalmer-state';
const W_GHUR = 'ghurid-dynasty';

// 새 칼선(서 노트 4-1절 초안을 다듬음 — 넓이·안/밖 도시는 결과 노트 3절)
// cut-potwar-jhelum: 인더스강과 젤룸강 사이 포트와르 고원(동쪽 끝 = 젤룸강 경도 73.55, 남쪽 끝 = 소금 산맥 위도 32.6, 북쪽 끝은 펀자브 조각 북단 너머 34.4 — 34.0이면 머리 부스러기 띠가 남음). 간다라(타실라)를 펀자브 평원에서 가름
const W_CUT_POTWAR = W_ring([[71.7, 34.4], [73.55, 34.4], [73.55, 32.6], [72.0, 32.6], [71.7, 33.0]]);
// cut-makran-coast: 발루치스탄 남쪽 마크란 해안(북쪽 끝 = 시아한·중앙 마크란 산줄기 위도 27.3, 동쪽 끝 = 라스벨라 서쪽 경도 66.5)
const W_CUT_MAKRAN = W_ring([[61.5, 24.8], [66.5, 24.8], [66.5, 27.3], [61.5, 27.3]]);
// cut-sapadalaksha: 차하마나의 사파달락샤(아지메르·삼바르·나가우르·세카르) — 조드푸르(마르와르)와 아지메르 쪽 나머지 땅 안만 가름(자이푸르는 통째)
const W_CUT_SAPA = W_ring([[73.4, 26.0], [75.4, 25.9], [76.2, 26.6], [76.4, 27.9], [75.6, 28.3], [74.0, 28.3], [73.45, 27.4]]); // 서쪽 꼭짓점 73.45: S2 비카네르 선의 (73.4, 27.4)와 값만 겹치지 않게
// cut-abu-marwar: 아부산·시로히·잘로르(차울루키아의 남 라자스탄, 프라티하라의 빈말) — 메와르 선 밖만
const W_CUT_ABU = W_ring([[71.3, 24.0], [73.6, 24.0], [73.6, 25.5], [72.3, 26.1], [71.3, 25.6]]);
// cut-bhinmal-mandor: 프라티하라 서부 핵심(빈말·만도르) — 조드푸르(마르와르) 선 안만 가름
// 라스벨라(마크란 해안과 신드 사이 허브강 쪽): 아랍·차치 시대 아르마빌 — 마크란 해안이 신드와 떨어지지 않게 따로 떼어 신드 쪽 나라와 같이 칠함(사산 240~488은 칠하지 않음)
const W_CUT_LASBELA = W_ring([[66.5, 24.8], [67.9, 24.8], [67.9, 26.8], [66.5, 26.8]]);
// 라자스탄 '나머지' 땅 가운데 남동쪽 흩어진 부스러기(통크·잘라와르 쪽 고립 땅) — 아지메르 쪽 나머지와 떼어 둠
const W_RJ_SE_BOX = W_ring([[74.9, 23.0], [77.65, 23.0], [77.65, 25.2], [74.9, 25.2]]); // 동쪽 끝 77.65: S2 데칸 선의 (77.6, 23)과 값만 겹치지 않게
const W_CUT_BHIN = W_ring([[71.5, 24.9], [73.9, 24.9], [73.9, 27.6], [72.2, 27.6], [71.55, 26.5]]); // 서쪽 꼭짓점 71.55: S2 자이살메르·조드푸르 선의 (71.5, 26.5)와 값만 겹치지 않게
// cut-delhi-hr(델리·하리아나)는 조각 IN-HR·IN-DL 합(45,588 km²)과 거의 같아 칼선 대신 조각 통째로 쓴다.
// cut-lata-gujarat-plain(구자라트 평원)은 S2 선(카디·바로다·팔란푸르·레와칸타·마히칸타·평원)의 합과 같은 땅이라 S2 선으로 쓴다.
// 티베트(inner-asia.mjs) 도형이 라다크 동쪽에서 남아시아 조각과 겹치는 땅(7,251 km²) — 650~842 늘림 땅에서 뺌(결정 7)
// 빼는 도형을 동쪽으로 0.00002°(약 2 m) 밀어 늘린 땅이 기존 도형과 실오라기만큼(1 km² 안) 겹치게 함 — 꼭 맞춰 빼면 두 도형 사이 틈으로 라다크가 티베트 본토와 떨어진 조각이 됨
const W_TIB = W_U(...cnMinusOf(650, 843)).map((poly) => poly.map((r) => r.map(([x, y]) => [x + 0.00002, y])));

// 나눈 조각(시대 내내 하나 — 부분 순서는 S3와 같게, 새 칼선은 뒤에)
const W_KP = ownSplit('W_KP', ['PK-KP'], [['치트랄', W_CHITRAL], ['말라칸드', W_MALAKAND], ['하자라', W_HAZARA]], '페샤와르');
const W_PP = ownSplit('W_서펀자브', ['PK-PB'], [['서안', W_CUT_INDUS_W], ['바하왈푸르', W_BAHAWALPUR], ['남끝', I(W_MULTAN, W_PP_TIP_BOX)], ['물탄', W_MULTAN],
  ['포트와르', W_CUT_POTWAR]], '중부');
const W_SD = ownSplit('W_신드', ['PK-SD'], [['하부', W_CUT_LOWER_SINDH]], '상부');
const W_BA = ownSplit('W_발루치', ['PK-BA'], [['마크란', W_CUT_MAKRAN], ['라스벨라', W_CUT_LASBELA]], '내륙');
const W_JK = ownSplit('W_카슈미르', ['IN-JK', 'PK-JK'], [['골짜기', W_CUT_KASHMIR]], '잠무');
const W_GB = ownSplit('W_길기트', ['PK-GB'], [['발티스탄', W_BALTISTAN]], '길기트');
const W_PB = ownSplit('W_펀자브', ['IN-PB'], [['도아브', W_DOAB], ['마자', W_MAJHA], ['펄키안', W_PHULKIAN]], '시스틀레지');
const W_GJ = ownSplit('W_구자라트', ['IN-GJ'], [['쿠치', W_CUTCH], ['카티아와르', W_KATHIAWAR], ['카디', W_KADI], ['바로다', W_BARODA], ['팔란푸르', W_PALANPUR],
  ['레와칸타', W_REWA_KANTHA], ['마히칸타', W_MAHI_KANTHA]], '평원');
const W_RJ = ownSplit('W_라자스탄', ['IN-RJ'], [['란탐보르', W_CUT_RANTHAMBORE], ['자이살메르', W_JAISALMER], ['비카네르', W_BIKANER],
  ['조드푸르사파', I(W_JODHPUR, W_CUT_SAPA)], ['조드푸르아부', I(W_JODHPUR, W_CUT_ABU)], ['조드푸르빈말', I(W_JODHPUR, W_CUT_BHIN)], ['조드푸르', W_JODHPUR],
  ['메와르', W_MEWAR], ['자이푸르', W_JAIPUR], ['코타', W_KOTA], ['동부', W_EAST_RJ], ['남부', W_SOUTH_RJ], ['나머지아부', W_CUT_ABU], ['나머지사파', W_CUT_SAPA], ['나머지남', W_RJ_SE_BOX]], '나머지');
const W_LA = ownSplit('W_라다크650', ['IN-LA'], [['티베트', W_TIB]], '라다크', {}, { from: 543, to: 871 });

// 땅 묶음(같은 줄을 받는 단위)
const W_GANDHARA_W = [W_KP.치트랄, W_KP.말라칸드, W_KP.하자라, 'PK-TA']; // 간다라 서·북 산지(스와트·치트랄·하자라·부족 지역) — 565 뒤 비움
const W_GANDHARA_E = [W_KP.페샤와르, 'PK-IS', W_PP.포트와르]; // 페샤와르 골짜기·탁실라(포트와르)
const W_MB = [W_PP.서안, W_PP.바하왈푸르, W_PP.남끝, W_PP.물탄]; // 물탄·바하왈푸르·인더스 서안(1206 카바차 땅)
const W_EP = [W_PB.도아브, W_PB.마자]; // 인도 쪽 펀자브 수틀레지강 서쪽
const W_CS = [W_PB.펄키안, W_PB.시스틀레지, 'IN-HR', 'IN-DL', 'IN-CH']; // 수틀레지강 동쪽·하리아나·델리
const W_GJ_MAIN = [W_GJ.카티아와르, W_GJ.평원, W_GJ.바로다, W_GJ.레와칸타, 'IN-DH']; // 사우라슈트라·구자라트 평원(마이트라카 — 바로다·레와칸타를 빼면 수라트 쪽이 떨어진 조각이 됨)
const W_GJ_N = [W_GJ.카디, W_GJ.팔란푸르, W_GJ.마히칸타]; // 북 구자라트(아나르타)
const W_RJ_WS = [W_RJ.메와르, W_RJ.남부, W_RJ.조드푸르아부, W_RJ.나머지아부]; // 남 라자스탄(서 크샤트라파 119~408)
const W_RJ_REST = [W_RJ.란탐보르, W_RJ.비카네르, W_RJ.조드푸르사파, W_RJ.조드푸르빈말, W_RJ.조드푸르, W_RJ.자이푸르, W_RJ.코타, W_RJ.동부, W_RJ.나머지사파, W_RJ.나머지남, W_RJ.나머지];

// ─ 기간 1 (기원전 800~319) ─
// 기원전 800~519년은 서 칸 전체 비움(결정 1 — 경계 사료가 서는 첫 해는 기원전 518년 아케메네스의 간다라). 간다라 왕국은 만들지 않음(맞춤 1)
// 기원전 518 간다라·513 힌두시 아케메네스 → 기원전 330 뒤 인더스 태수령 땅 비움(결정 3) → 기원전 316 마우리아(맞춤 4) → 기원전 185 해체 뒤 비움
// → 인도-그리스(기원전 180·165·130·85·55) → 인도-스키타이(기원전 85·55) → 인도-파르티아(19) → 쿠샨(75·127) → 쿠샨샤르(240, 간다라)
own(W_GANDHARA_W, [[S4_START, null], [-517, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-179, W_IG], [-84, W_ISC], [19, W_IP], [75, W_KU], [240, W_KS]]);
own(W_GANDHARA_E, [[S4_START, null], [-517, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-179, W_IG], [-84, W_ISC], [19, W_IP], [75, W_KU], [240, W_KS]]);
own([W_PP.중부], [[S4_START, null], [-512, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-179, W_IG], [-54, W_ISC], [19, W_IP], [75, W_KU]]);
own(W_MB, [[S4_START, null], [-512, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-164, W_IG], [-129, null], [-84, W_ISC], [19, W_IP], [75, W_KU]]);
own([W_SD.상부], [[S4_START, null], [-512, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-54, W_ISC], [19, W_IP], [127, W_KU]]);
own([W_SD.하부], [[S4_START, null], [-512, W_ACH], [-329, null], [-315, W_MAU], [-184, null], [-54, W_ISC], [19, W_IP], [130, W_WS]]); // 하부 신드 130~395 서 크샤트라파(D1)
own([W_BA.마크란], [[S4_START, null], [-304, W_MAU], [-184, null], [19, W_IP], [226, null], [240, W_SAS]]); // 아케메네스 마크란은 칠하지 않음(맞춤 6), 기원전 305 셀레우코스 조약(D14)
own([W_BA.내륙], [[S4_START, null], [-304, W_MAU], [-184, null]]);
own([W_BA.라스벨라], [[S4_START, null], [-304, W_MAU], [-184, null], [19, W_IP], [226, null], [489, W_RAI], [632, W_CHACH], [711, W_UMA], [750, W_ABB], [854, null]]); // 기간 2·3 줄도 여기(신드 쪽 나라와 같이)
own([W_JK.골짜기, W_JK.잠무], [[S4_START, null], [-320, W_MAU], [-184, null], [127, W_KU]]);
own(W_EP, [[S4_START, null], [-320, W_MAU], [-184, null], [-164, W_IG], [10, W_ISC], [19, W_IP], [75, W_KU]]);
own(W_CS, [[S4_START, null], [-320, W_MAU], [-184, null], [127, W_KU]]);
own(['IN-HP'], [[S4_START, null], [-320, W_MAU], [-184, null], [920, 'punjab-hill-states']]); // 920 무렵 참바 천도(사힐 바르만)부터 산지 소국 묶음 — 1206 모양과 같게(창구 ③ 결정 6)
own([W_GJ.쿠치], [[S4_START, null], [-320, W_MAU], [-184, null], [130, W_WS]]);
own([...W_GJ_MAIN, ...W_GJ_N], [[S4_START, null], [-320, W_MAU], [-184, null], [119, W_WS]]);
own(W_RJ_WS, [[S4_START, null], [-320, W_MAU], [-184, null], [119, W_WS]]);
own(W_RJ_REST, [[S4_START, null], [-320, W_MAU], [-184, null]]);
own([W_RJ.자이살메르], [[S4_START, null]]); // 타르 사막 서부는 마우리아도 칠하지 않음(서 노트 2-5)
own(['IN-LA'], [[S4_START, null]]); // 라다크: 650~842 티베트는 W_라다크650 묶음, 930부터 라다크 왕국(기간 3)
own(['KAS', W_GB.발티스탄], [[S4_START, null]]);
own([W_GB.길기트], [[S4_START, null]]); // 길기트: 시대 내내 비움(D11)

// ─ 기간 2 (320~749) ─
// 간다라: 360 키다라 → 470 알촌 → 565 비움 → 665 투르크 샤히(페샤와르 골짜기·탁실라만, 서·북 산지는 비움)
own(W_GANDHARA_W, [[360, W_KID], [470, W_ALC], [565, null]]);
own(W_GANDHARA_E, [[360, W_KID], [470, W_ALC], [565, null], [665, W_TS]]);
// 펀자브 중부: 360 키다라 → 470 알촌 → 542 알촌이 펀자브를 잃음
own([W_PP.중부], [[360, W_KID], [470, W_ALC], [542, null]]);
// 물탄 쪽: 360~374 쿠샨 잔존 → 375 비움 → 470 알촌 → 542 라이 왕조 → 632 차치 왕조 → 711 우마이야(결정 6)
own(W_MB, [[375, null], [470, W_ALC], [542, W_RAI], [632, W_CHACH], [711, W_UMA]]);
// 신드: 상부 375 쿠샨 끝, 하부 396 서 크샤트라파 끝(D1) → 489 라이 → 632 차치 → 711 우마이야(D4)
own([W_SD.상부], [[375, null], [489, W_RAI], [632, W_CHACH], [711, W_UMA]]);
own([W_SD.하부], [[396, null], [489, W_RAI], [632, W_CHACH], [711, W_UMA]]);
// 마크란 해안: 240~488 사산 직할 → 489 라이 → 632 차치 → 711 우마이야(맞춤 5)
own([W_BA.마크란], [[489, W_RAI], [632, W_CHACH], [711, W_UMA]]);
// 카슈미르: 360 키다라 → 470 알촌 → 565 비움(D12) → 골짜기 625 카르코타
own([W_JK.골짜기], [[360, W_KID], [470, W_ALC], [565, null], [625, W_KAR]]);
own([W_JK.잠무], [[360, W_KID], [470, W_ALC], [565, null]]);
// 인도 쪽 펀자브·하리아나·델리: 375 쿠샨 끝 → 502 알촌(토라마나) → 528 손다니 패전 → 수틀레지강 동쪽·하리아나·델리는 606~646 바르다나(하르샤)
own(W_EP, [[375, null], [502, W_ALC], [528, null]]);
own(W_CS, [[375, null], [502, W_ALC], [528, null], [606, W_VAR], [647, null]]);
// 구자라트: 409 굽타(맞춤 10) → 475 마이트라카(사우라슈트라·평원), 쿠치·북·동부는 비움
own([W_GJ.쿠치, ...W_GJ_N], [[409, W_GUP], [475, null]]);
own(W_GJ_MAIN, [[409, W_GUP], [475, W_MAIT]]);
// 남 라자스탄: 409 서 크샤트라파 끝 → 730 프라티하라(아부·잘로르·빈말 쪽), 734 메와르(구힐라)
own([W_RJ.메와르], [[409, null], [734, W_MEWAR_ST]]);
own([W_RJ.남부], [[409, null]]);
own([W_RJ.조드푸르아부, W_RJ.나머지아부], [[409, null], [730, W_GP]]);
own([W_RJ.조드푸르사파, W_RJ.조드푸르빈말], [[730, W_GP]]); // 프라티하라 서부 핵심(빈말·만도르·나가우르)
// 라다크·발티스탄: 650~842 티베트(결정 7 — 티베트 기존 도형과 겹치는 땅은 뺌, 길기트 제외)
own([W_LA.티베트], [[543, null]]); // 티베트 기존 도형(inner-asia.mjs)이 덮는 땅
own([W_LA.라다크], [[543, null], [650, W_TIBET]]);
own(['KAS', W_GB.발티스탄], [[650, W_TIBET]]);

// ─ 기간 3 (750~1205) ─
// 1205년 모양은 sultanate.mjs 1206년과 같게(부분 순서가 S3와 같음): 구르 땅 → 델리 술탄국(펀자브·하리아나·델리)·카바차(물탄·신드 북부) 이름만 바뀜,
//   페샤와르 골짜기와 아지메르 쪽 나머지(사파달락샤 안)만 1206년에 비워지는 1년 어긋남(결정 8). 차하마나는 1205년 란탐보르만.
// 페샤와르 골짜기: 822 힌두 샤히 → 1001 가즈니(페샤와르 전투) → 1179 구르
own([W_KP.페샤와르], [[822, W_HS], [1001, W_GHAZ], [1179, W_GHUR]]);
// 탁실라(포트와르·이슬라마바드): 822 힌두 샤히(1001~1020 인더스강 동쪽에 남음, D13) → 1021 가즈니 → 1186 구르
own(['PK-IS', W_PP.포트와르], [[822, W_HS], [1021, W_GHAZ], [1186, W_GHUR]]);
// 펀자브 중부(라호르): 998 힌두 샤히 → 1021 가즈니 → 1186 구르
own([W_PP.중부], [[998, W_HS], [1021, W_GHAZ], [1186, W_GHUR]]);
// 물탄 쪽: 750 아바스 → 855 물탄 에미르국(D5) → 1010 가즈니 → 1175 구르(→ 1206 카바차)
own(W_MB, [[750, W_ABB], [855, W_MUL], [1010, W_GHAZ], [1175, W_GHUR]]);
// 신드: 750 아바스 → 854 하바리 에미르국(맞춤 7) → 1026 소마라 → 상부는 1175 구르(→ 1206 카바차)
own([W_SD.상부], [[750, W_ABB], [854, W_HAB], [1026, W_SOO], [1175, W_GHUR]]);
own([W_SD.하부], [[750, W_ABB], [854, W_HAB], [1026, W_SOO]]);
own([W_BA.마크란], [[750, W_ABB], [854, null]]);
// 카슈미르 골짜기: 855 우트팔라 → 1003 로하라
own([W_JK.골짜기], [[855, W_UTP], [1003, W_LOH]]);
// 인도 쪽 펀자브 수틀레지강 서쪽: 1021 가즈니(라호르 총독) → 1186 구르
own(W_EP, [[1021, W_GHAZ], [1186, W_GHUR]]);
// 수틀레지강 동쪽·하리아나·델리: 836 프라티하라(미히라 보자) → 1019 비움(카나우지 함락 뒤) → 1060 토마라(D6) → 1151 차하마나 → 1192 구르(타라인 2차), 델리는 1193
own([W_PB.펄키안, W_PB.시스틀레지], [[836, W_GP], [1019, null], [1192, W_GHUR]]); // 수틀레지강 동쪽 펀자브는 토마라·차하마나 땅 밖
own(['IN-HR', 'IN-CH', 'IN-DL'], [[836, W_GP], [1019, null], [1060, W_TOM], [1151, W_CHA], [1192, W_GHUR]]); // 델리 함락(1193)은 1만 km² 미만이라 하리아나와 같은 해로
// 라다크·발티스탄: 843 티베트 뒤 비움 → 라다크 930 라다크 왕국(D7)
own([W_LA.라다크], [[843, null]]);
own(['KAS'], [[843, null], [930, W_LAD]]);
own([W_GB.발티스탄], [[843, null]]);
own(['IN-LA'], [[930, W_LAD]]);
// 구자라트: 사우라슈트라·평원 776 마이트라카 끝 → 1022 차울루키아(비마 1세) / 북 구자라트 836 프라티하라 → 942 차울루키아(물라라자)
//   / 동부 1022 차울루키아 / 쿠치 1022 차울루키아 → 1147 쿠치 왕국. 라슈트라쿠타의 라타 가지는 칠하지 않음(결과 노트 2절)
own(W_GJ_MAIN, [[776, null], [1022, W_CHAUL]]);
own(W_GJ_N, [[836, W_GP], [942, W_CHAUL]]);
own([W_GJ.쿠치], [[1022, W_CHAUL], [1147, W_CUTCH_ST]]);
// 라자스탄: 836 프라티하라(자이살메르·메와르 밖) → 960 서부 가지·소국 자립(비움) → 사파달락샤 1100 차하마나(D8) → 아지메르 쪽 1195 구르(아이바크 총독)
//   아부·잘로르·시로히 1094 차울루키아 → 1197 비움(카사흐라다 패전 뒤 아부 파라마라 등 소국), 란탐보르 1164 차하마나(1205년에도 남음), 자이살메르 1156 바티
own([W_RJ.란탐보르], [[836, W_GP], [960, null], [1164, W_CHA]]);
own([W_RJ.자이살메르], [[1156, W_JAIS]]);
own([W_RJ.비카네르, W_RJ.조드푸르, W_RJ.코타, W_RJ.동부, W_RJ.나머지남], [[836, W_GP], [960, null]]);
own([W_RJ.남부], [[836, W_GP], [942, null]]); // 바가드(반스와라·둥가르푸르): 942년 북 구자라트를 잃은 뒤 프라티하라 본토와 떨어지므로 비움
own([W_RJ.조드푸르빈말], [[960, null]]);
own([W_RJ.조드푸르사파], [[960, null], [1100, W_CHA], [1195, null]]);
own([W_RJ.자이푸르], [[836, W_GP], [960, null], [1100, W_CHA], [1195, null]]);
own([W_RJ.나머지사파, W_RJ.나머지], [[836, W_GP], [960, null], [1100, W_CHA], [1195, W_GHUR]]);
own([W_RJ.조드푸르아부, W_RJ.나머지아부], [[960, null], [1094, W_CHAUL], [1197, null]]);

// 서 칸 비운 땅(voids): 위 줄에서 주인이 null인 기간을 단위마다 그대로 뽑아 같은 기간끼리 묶는다(손으로 옮겨 적다 어긋나지 않게). 까닭은 땅과 기간별로 —
//   서 칸 전체 기원전 800~519년: 경계 사료가 서는 첫 해 전(결정 1) · 펀자브 중·남부·신드 기원전 518~514년: 다리우스 1세의 힌두시 병합 전
//   · 인도 쪽(카슈미르·인도 쪽 펀자브·하리아나·델리·라자스탄·구자라트·히마찰) 기원전 518~322년: 16대국·부족 국가의 서쪽 경계 사료가 불전·푸라나 열거뿐(결정 1)
//   · 인더스 태수령 땅 기원전 330~317년: 알렉산드로스 원정·태수령은 칠하지 않음(결정 3) · 발루치스탄 기원전 306년까지: 아케메네스 마크란은 칠하지 않고(맞춤 6) 셀레우코스는 늘리지 않음(D14)
//   · 마우리아 해체 뒤(기원전 185~) 인도-그리스가 오기 전 간다라·펀자브, 사카가 오기 전 신드, 쿠샨 전 카슈미르·하리아나: 1만 km² 넘는 한 나라의 사료 없음(우두 부족 국가 등)
//   · 발루치스탄 내륙·자이살메르(타르 사막 서부): 마우리아 뒤 시대 내내, 히마찰 919년까지: 한 나라 사료 없음(서 노트 1-3 — 히마찰은 920부터 산지 소국 묶음) · 길기트: 시대 내내(D11), 발티스탄·라다크: 티베트 시기(650~842) 밖
//   · 마크란 해안 226~239년: 인도-파르티아 뒤 사산 전 · 375년 뒤 쿠샨 잔존 땅(물탄·신드 북부·인도 쪽 펀자브·하리아나): 굽타는 조공국만(D22)
//   · 하부 신드 396~488년: 서 크샤트라파 뒤 라이 왕조 전 · 간다라 서·북 산지(스와트·치트랄·하자라·부족 지역) 565년 뒤: S3와 같이 부족 땅·소국(1만 km² 넘는 한 나라 없음)
//   · 간다라 565~664년: 알촌 뒤 투르크 샤히 전 · 펀자브 중부 542~997년: 알촌 뒤 힌두 샤히 전 · 카슈미르 골짜기 565~624년(D12)·잠무: 소국
//   · 구자라트 475년 뒤 북·동부, 776~1021년 사우라슈트라·평원: 소국(차브다·사인다바)·라슈트라쿠타 라타 가지(종주 색 — 결과 노트) · 라자스탄 960~1099년: 프라티하라 서부 가지·소국
//   · 수틀레지강 동쪽·하리아나·델리 647~835년·1019~1059년: 하르샤 뒤·프라티하라 뒤 소국(D6) · 마크란 해안 854년 뒤: 아바스 뒤 지방 세력(1만 km² 넘는 한 나라 없음)
const W_UNITS = [...W_GANDHARA_W, ...W_GANDHARA_E, W_PP.중부, ...W_MB, W_SD.상부, W_SD.하부, W_BA.마크란, W_BA.라스벨라, W_BA.내륙, W_JK.골짜기, W_JK.잠무, ...W_EP, ...W_CS, 'IN-HP',
  W_GJ.쿠치, ...W_GJ_MAIN, ...W_GJ_N, ...W_RJ_WS, ...W_RJ_REST, W_RJ.자이살메르, 'IN-LA', 'KAS', W_GB.발티스탄, W_GB.길기트, W_LA.티베트, W_LA.라다크];
const W_voids = () => {
  const end = (u) => layouts.find((l) => Object.values(l.units).includes(u))?.to ?? S4_END;
  const spans = new Map(); // 'from|to' → 단위들
  for (const u of W_UNITS) {
    const line = lines.get(u);
    line.forEach(([y, owner], i) => {
      if (owner !== null) return;
      const to = line[i + 1]?.[0] ?? end(u);
      const key = `${y}|${to}`;
      if (!spans.has(key)) spans.set(key, []);
      spans.get(key).push(u);
    });
  }
  return [...spans].map(([key, us]) => { const [from, to] = key.split('|').map(Number); return [from, to, build(us)]; });
};

// ── S4 서 끝 ──

// ── S4 동 (갠지스 평원·비하르·벵골·오리사·차티스가르·북동·네팔·부탄·시킴·방글라데시, 구현 S4-동): 칼선·상수·own 줄은 이 아래에, 최상위 이름은 E_ ──
// 남아시아 S4 동(2026-11-04): 조각 IN-UP·IN-UT·IN-BR·IN-JH·IN-WB·IN-OR·IN-CT·북동 일곱·IN-SK·IN-AN·BD-*·NP-*·BT-*. 해는 그해 말 모습, 항목 to는 끝 해(그해부터 다음 주인)·버전 to는 미포함.
// 기원전 경계는 팔리 경전·푸라나의 지역 이름과 아소카 비문 자리뿐이라 새 칼선은 지금 지구·강줄기를 어림한 선이다(확실성은 생성기 기본값). 1205년 모양은 sultanate.mjs 1206년 줄과 같은 칼선(S2_CUTS·S3_CUTS)을 같은 순서로 다시 써서 잇는다.
// 근거: 위키백과 en(Mahajanapadas, Kosala, Nanda Empire, Maurya Empire, Shunga Empire, Gupta Empire, Maukhari dynasty, Harsha, Kamarupa, Licchavi (kingdom), Pala Empire,
//   Gurjara-Pratihara dynasty, Gahadavala dynasty, Sena dynasty, History of Odisha, History of Bengal, Kumaon Kingdom)
import { P as E_P, U as E_U, D as E_D, ring as E_ring } from '../../lib.mjs';
import { idsOf as E_idsOf } from './table.mjs';

// 조각 묶음
const E_NP = E_idsOf('NPL');
const E_BT = E_idsOf('BTN');
const E_BD_ALL = E_idsOf('BGD');
const E_HILLS = ['IN-AS', 'IN-AR', 'IN-ML', 'IN-NL', 'IN-MZ', 'IN-TR', 'IN-AN', 'IN-MN', 'IN-SK', ...E_BT, 'IN-CT'];
const E_ALL = ['IN-UP', 'IN-UT', 'IN-BR', 'IN-JH', 'IN-WB', 'IN-OR', ...E_BD_ALL, ...E_NP, ...E_HILLS];
// 나라 id(여러 번 쓰는 것만)
const E_MAG = 'magadha-kingdom';
const E_NAN = 'nanda-empire';
const E_MAU = 'maurya-empire';
const E_SHU = 'shunga-empire';

// ── 새 칼선 (좌표 [경도, 위도]) ──
const E_cut = (...pts) => E_P(E_ring(pts));
// 마가다 핵심(IN-BR 갠지스 남쪽, 파트나·가야·라지기르·나왈다·보드가야 안, 아라·사사람(손강 서쪽)·바갈푸르·문게르·무자파르푸르 바깥): 서쪽은 손강, 북쪽은 갠지스강(S3 미틸라 선보다 조금 북쪽 — 미틸라를 앞에 둠), 동쪽은 킬강 어림
const E_CUT_MAGADHA_CORE = E_cut([84.15, 24.2], [86.3, 24.2], [86.3, 25.53], [86.0, 25.56], [85.5, 25.64], [85.15, 25.7], [84.87, 25.72], [84.7, 25.5], [84.45, 25.2], [84.2, 24.85]);
// 앙가(IN-BR·IN-JH, 바갈푸르·문게르·데오가르·고다 안, 파트나·푸르니아·란치 바깥): 갠지스 남안, 동쪽은 라지마할 구릉
const E_CUT_ANGA = E_cut([86.3, 24.0], [87.9, 24.0], [87.9, 25.2], [87.6, 25.33], [87.2, 25.36], [86.5, 25.46], [86.3, 25.53]);
const E_MAGADHA = E_U(E_CUT_MAGADHA_CORE, E_CUT_ANGA); // 마가다 왕국은 첫 그린 해(기원전 500년)부터 앙가를 합친 모습이라 한 부분으로 씀
// 코살라(IN-UP, 아요디아·슈라바스티·락나우·고라크푸르·파이자바드 안, 바라나시·프라야그라지·바레일리·칸푸르 바깥): 남쪽은 사이강·고마티강 어림, 서쪽은 판찰라와의 사이
const E_CUT_KOSALA = E_cut([80.5, 25.95], [82.5, 25.95], [83.4, 26.0], [84.2, 26.5], [84.2, 27.2], [83.5, 27.6], [81.0, 28.2], [80.5, 27.5]);
// 카시(IN-UP, 바라나시·미르자푸르·가지푸르 안, 프라야그라지·고라크푸르·파트나 바깥): 기원전 500년 무렵 이미 코살라 땅(위키 Kosala: 마하코살라 때 정복)이라 코살라와 한 부분
const E_CUT_KASHI = E_cut([82.4, 24.7], [83.9, 24.7], [83.9, 25.95], [82.4, 25.95]);
// 말라(IN-UP, 쿠시나가르·데오리아 안, 고라크푸르·가야 바깥): 1만 km² 미만이라 비움(기본값 D19) — 코살라보다 앞에 두어 떼어 냄
const E_CUT_MALLA = E_cut([83.5, 26.5], [84.4, 26.5], [84.4, 27.4], [83.5, 27.4]);
// 바트사(IN-UP, 프라야그라지·카우샴비·프라타프가르 안, 바라나시·락나우·칸푸르 바깥)
const E_CUT_VATSA = E_cut([80.9, 24.5], [82.4, 24.5], [82.4, 25.95], [80.9, 25.95]);
// 판찰라(IN-UP, 바레일리·바다운·파루카바드·카나우지·에타 안, 마투라·락나우·델리 바깥)
const E_CUT_PANCHALA = E_cut([78.3, 26.5], [80.3, 26.5], [80.3, 28.7], [79.4, 29.0], [78.3, 28.5]);
// 네팔 테라이(NP 남부 평야, 룸비니·자낙푸르·비라트나가르·네팔간지 안, 카트만두·포카라·헤타우다(안쪽 골짜기) 바깥): 북쪽 변은 추리아(시왈리크) 산줄기 남쪽 기슭 어림
const E_CUT_NEPAL_TERAI = E_cut([80.0, 29.2], [80.6, 29.0], [81.2, 28.75], [81.8, 28.35], [82.4, 28.05], [83.0, 27.75], [83.6, 27.6], [84.2, 27.55], [84.8, 27.45], [85.3, 27.3],
  [85.9, 27.1], [86.6, 26.95], [87.3, 26.85], [88.3, 26.8], [88.3, 25.9], [80.0, 25.9]);
// ─ 기간 1 (기원전 800~319) ─
// 갠지스 16대국(기원전 500~346년): 마가다(앙가 포함)·밧지(S3 미틸라 선)·코살라(카시 포함)·바트사·판찰라. 그 밖(쿠루·슈라세나 쪽 상부 도아브, 말라, 칸푸르·분델칸드, 초타나그푸르)은 비움.
// 기원전 468년 아자타샤트루의 밧지 정복, 기원전 345년 마하파드마 난다가 갠지스 평원·오리사를 한꺼번에 합침(기본값 D20 — 코살라·바트사·판찰라의 개별 병합 해는 글로)
const E_UP517 = ownSplit('E_UP-517', ['IN-UP'], [['말라', E_CUT_MALLA], ['코살라', E_U(E_CUT_KOSALA, E_CUT_KASHI)], ['바트사', E_CUT_VATSA], ['판찰라', E_CUT_PANCHALA]], '나머지', {
  말라: [[-517, null], [-344, E_NAN]],
  코살라: [[-517, null], [-499, 'kosala-kingdom'], [-344, E_NAN]],
  바트사: [[-517, null], [-499, 'vatsa-kingdom'], [-344, E_NAN]],
  판찰라: [[-517, null], [-499, 'panchala-kingdom'], [-344, E_NAN]],
  나머지: [[-517, null], [-344, E_NAN]],
}, { from: -517, to: -320 });
const E_BJ517 = ownSplit('E_BRJH-517', ['IN-BR', 'IN-JH'], [['밧지', S3_CUTS.E_MITHILA], ['마가다', E_MAGADHA]], '나머지', {
  밧지: [[-517, null], [-499, 'vajji-confederacy'], [-467, E_MAG], [-344, E_NAN]],
  마가다: [[-517, null], [-499, E_MAG], [-344, E_NAN]],
  나머지: [[-517, null], [-344, E_NAN]],
}, { from: -517, to: -320 });
// 마우리아(기원전 321~186년): 기원전 321년 갠지스 평원·벵골(마하스탄 비문), 기원전 261년 칼링가 정복으로 오리사, 우타라칸드(칼시 비문)·실헤트·치타공·네팔 테라이(룸비니 비문)를 더함.
// 운영자 결정 9: 말기(기원전 233년 무렵부터) 잃은 땅은 범위를 알 수 없어 최대 범위로 기원전 186년까지. 아삼·북동·부탄·시킴·차티스가르는 비문이 없어 비움
own(['IN-UP'], [[S4_START, null], [-320, E_MAU], [-184, E_SHU], [-99, null], [127, 'kushan-empire'], [231, null]]); // 슝가는 기원전 100년 무렵 마가다만(위키 Shunga Empire), 쿠샨은 카니슈카 때 사르나트·코삼비 비문(기본값 D21)
own(['IN-BR', 'IN-JH'], [[S4_START, null], [-320, E_MAU], [75, null]]);
own(['IN-OR'], [[S4_START, null], [-344, E_NAN], [-320, null], [-260, E_MAU], [-184, null]]); // 기원전 321~261년 칼링가는 독립 왕국(하티굼파 비문의 난다 운하), 기원전 185년 뒤 마하메가바하나(카라벨라) 칼링가는 경계 사료가 없어 비움
own(['IN-WB', 'BD-A', 'BD-C', 'BD-D', 'BD-E', 'BD-F'], [[S4_START, null], [-320, E_MAU], [-184, null]]);
own(['IN-UT', 'BD-B', 'BD-G'], [[S4_START, null], [-260, E_MAU], [-184, null]]);
const E_NP320 = ownSplit('E_NP-320', E_NP, [['테라이', E_CUT_NEPAL_TERAI]], '산지', {
  테라이: [[-320, null], [-260, E_MAU]],
  산지: [[-320, null]],
}, { from: -320, to: -184 });
// 슝가(기원전 185~29년, 칸바 왕조 포함): 처음 갠지스 평원(UP·BR·JH), 기원전 100년 무렵부터 마가다만, 기원전 28년 칸바 왕조가 끝난 뒤 마가다도 비움
const E_BJ184 = ownSplit('E_BRJH-184', ['IN-BR', 'IN-JH'], [['미틸라', S3_CUTS.E_MITHILA], ['마가다', E_MAGADHA]], '나머지', {
  미틸라: [[-184, E_SHU], [-99, null]],
  마가다: [[-184, E_SHU], [-27, null]],
  나머지: [[-184, E_SHU], [-99, null]],
}, { from: -184, to: 75 });

// ─ 기간 2 (320~749) ─
const E_GUP = 'gupta-empire';
const E_KAM = 'kamarupa-kingdom';
const E_LG = 'later-gupta-dynasty';
const E_VAR = 'vardhana-dynasty';
const E_GAUDA = 'gauda-kingdom';
const E_PALA = 'pala-empire';
const E_SENA = 'sena-dynasty';
const E_GHUR = 'ghurid-dynasty';
// 굽타 초기 땅(IN-UP 동부: 프라야가(프라야그라지)·사케타(아요디아)·바라나시·카우샴비 안, 락나우·칸푸르·바레일리·슈라바스티 바깥): 마가다 서쪽 갠지스 평원 동부를 어림
const E_CUT_GUPTA_EARLY = E_cut([81.3, 23.8], [84.8, 23.8], [84.8, 27.0], [81.3, 27.0]);
// 카마루파 서쪽(IN-WB·BD-F, 쿠치비하르·잘파이구리·랑푸르·판차가르 안, 실리구리·말다·발루르가트 바깥): 서쪽 변은 카라토야강(전통적 서쪽 경계) 어림 — 잘파이구리 서쪽에서 보그라 북쪽으로.
//   실리구리 동쪽 좁은 목(판차가르)은 넣어 코치 칼선 남서 끝이 떨어진 조각으로 남지 않게 함
const E_CUT_KAMARUPA_WEST = E_cut([88.45, 27.0], [90.2, 27.0], [90.2, 25.2], [89.3, 25.2], [88.95, 25.9], [88.42, 26.25], [88.47, 26.6]);
// 리차비 핵심(NP, 카트만두·바크타푸르·고르카·반에파 안, 룸비니·포카라·비라트나가르 바깥): 카트만두 골짜기와 동쪽 순코시강·서쪽 부리간다키강 어림. 북쪽 히말라야의 티베트 도형 땅(약 3,200 km²)은 뺌
const E_CUT_LICCHAVI_CORE = E_D(E_cut([84.0, 27.2], [86.2, 27.2], [86.2, 28.4], [84.0, 28.4]), ...cnMinusOf(618, 843));
// 굽타(320~542년): 320년 마가다와 우타르프라데시 동부, 350년 무렵 사무드라굽타의 갠지스 평원·서벵골, 400년 무렵 벵골 동·북부(푼드라바르다나 동판), 510년부터 서·중부 갠지스 평원을 잃음(조공국은 칠하지 않음, 기본값 D22)
const E_UP320 = ownSplit('E_UP320', ['IN-UP'], [['동부', E_CUT_GUPTA_EARLY]], '서부', {
  동부: [[320, E_GUP]],
  서부: [[320, null], [350, E_GUP], [510, null]],
}, { from: 320, to: 543 });
own(['IN-BR'], [[320, E_GUP]]);
own(['IN-JH'], [[320, null], [350, E_GUP]]);
// 서벵골·랑푸르: 카마루파 서쪽(640년 바스카르바르만의 서쪽 확장부터 카마루파), 나머지는 굽타 → 600년 샤샹카의 가우다(637~646년 비움, 기본값 D29) → 750년 팔라
const E_WB320 = ownSplit('E_WB320', ['IN-WB'], [['카마루파서', E_CUT_KAMARUPA_WEST]], '벵골', {
  카마루파서: [[320, null], [350, E_GUP], [543, null], [640, E_KAM]],
  벵골: [[320, null], [350, E_GUP], [543, null], [600, E_GAUDA], [637, null], [750, E_PALA]],
}, { from: 320, to: 973 });
const E_BDF = ownSplit('E_BDF', ['BD-F'], [['카마루파서', E_CUT_KAMARUPA_WEST]], '나머지', {
  카마루파서: [[320, null], [400, E_GUP], [543, null], [640, E_KAM], [1141, null]],
  나머지: [[320, null], [400, E_GUP], [543, null], [600, E_GAUDA], [637, null], [750, E_PALA], [1159, E_SENA], [1205, null]], // 1205 비움은 sultanate.mjs 1206과 같음
}, { from: 320, to: S4_END });
own(['BD-E'], [[320, null], [400, E_GUP], [543, null], [600, E_GAUDA], [637, null], [750, E_PALA], [1159, E_SENA], [1205, E_GHUR]]); // 바렌드라: 1159 발랄라세나, 1205 바크티야르 할지의 락나우티(구르 왕조 장군)
own(['BD-A', 'BD-C', 'BD-D'], [[320, null], [400, E_GUP], [543, null], [1096, E_SENA]]); // 남·동벵골: 543~1095년 찬드라·바르만 등 경계를 알 수 없는 왕조라 비움(기본값 D26), 1096 비자야세나의 방가
// 아삼: 카마루파(350~1140년)는 브라마푸트라 골짜기(S2 고알파라·아홈 칼선), 산기슭 두아르와 카차르·카르비 구릉은 비움
const E_AS320 = ownSplit('E_AS320', ['IN-AS'], [['두아르', S2_CUTS.E_DUARS_E], ['골짜기', E_U(S2_CUTS.E_GOALPARA, S2_CUTS.E_AHOM)]], '카차르', {
  골짜기: [[320, null], [350, E_KAM], [1141, null]],
}, { from: 320, to: 1157 });
// 네팔: 리차비(464~879년, 첫 비문 464년), 879년 뒤 타쿠리는 골짜기만이라 1만 km² 미만(기본값 D27)
const E_NPL = ownSplit('E_NPL', E_NP, [['리차비', E_CUT_LICCHAVI_CORE]], '나머지', {
  리차비: [[320, null], [464, 'licchavi-kingdom'], [880, null]],
}, { from: 320, to: 1090 });
// 굽타 뒤(543~749년): 550년 마우카리(카나우지)·후기 굽타(마가다), 606~646년 하르샤의 바르다나, 647년 뒤 카나우지는 비움, 마가다는 후기 굽타
const E_maukhari = [[543, null], [550, 'maukhari-dynasty'], [606, E_VAR], [647, null]];
const E_UP543 = ownSplit('E_UP543', ['IN-UP'], [['오우드', S2_CUTS.E_OUDH], ['로힐칸드', S2_CUTS.E_ROHILKHAND], ['하부도아브', S2_CUTS.E_LOWER_DOAB], ['바라나시', S2_CUTS.E_BENARES],
  ['고라크푸르', S2_CUTS.E_GORAKHPUR], ['분델칸드', S2_CUTS.E_BUNDELKHAND]], '상부도아브', {
  오우드: E_maukhari,
  로힐칸드: E_maukhari,
  하부도아브: E_maukhari,
  바라나시: E_maukhari,
  고라크푸르: E_maukhari,
  분델칸드: [[543, null], [606, E_VAR], [647, null]],
  상부도아브: [[543, null], [606, E_VAR], [647, null]],
}, { from: 543, to: 711 });
const E_BR543 = ownSplit('E_BR543', ['IN-BR'], [['마가다', E_MAGADHA]], '나머지', {
  마가다: [[543, null], [550, E_LG], [606, E_VAR], [647, E_LG]],
  나머지: [[543, null], [606, E_VAR], [647, null]],
}, { from: 543, to: 750 });
const E_JH543 = ownSplit('E_JH543', ['IN-JH'], [['앙가', E_MAGADHA]], '나머지', {
  앙가: [[543, null], [550, E_LG], [606, E_VAR], [647, E_LG]],
}, { from: 543, to: 750 });

// ─ 기간 3 (750~1205) ─
const E_GAH = 'gahadavala-dynasty';
const E_EG = 'eastern-ganga-dynasty';
const E_SOMA = 'somavamshi-dynasty';
const E_BHAUMA = 'bhauma-kara-dynasty';
const E_RAT = 'ratanpur-kingdom';
// 라르(IN-WB 바기라티·후글리강 서쪽, 부르드완·반쿠라·볼푸르·푸룰리아·하우라 안, 콜카타·무르시다바드·말다·실리구리 바깥): 동쪽 변은 바기라티·후글리강, 북쪽 변은 북위 24.4° 어림(미드나포르는 S3 선을 앞에 둠)
const E_CUT_RARH = E_cut([85.8, 21.5], [88.1, 21.5], [88.05, 22.0], [88.12, 22.45], [88.34, 22.6], [88.38, 22.95], [88.33, 23.35], [88.12, 23.65], [88.2, 24.1], [88.05, 24.4], [85.8, 24.4]);
// 바렌드라(IN-WB 북부, 말다·가우르·발루르가트·실리구리 안, 콜카타·부르드완·무르시다바드 바깥): 갠지스(파드마)강 북쪽 어림
const E_CUT_VARENDRA_WB = E_cut([87.6, 24.4], [88.9, 24.4], [89.95, 25.6], [89.95, 27.3], [87.6, 27.3]); // 북쪽 끝 다르질링 산지까지(남동 나머지에 떨어진 조각이 남지 않게)
// 쿠르다(IN-OR 칠리카 호수 북서, 쿠르다·반푸르·나야가르 동부 안): 해안과 남부(간잠)를 잇는 땅 — 해안·남부 칼선 사이에 남는 토후국 쪽 땅을 떼어 해안과 같은 주인으로
const E_CUT_KHURDA = E_cut([84.9, 19.5], [85.6, 19.5], [85.6, 20.35], [84.9, 20.35]);
// 사란·참파란(IN-BR 갠지스 북쪽, 미틸라 선 서쪽: 고팔간지·시완·베티아 안, 무자파르푸르·파트나 바깥): 1097년 미틸라가 카르나타 땅이 된 뒤 팔라 본토와 떨어지는 땅
const E_CUT_SARAN = E_cut([83.0, 25.9], [84.35, 25.9], [84.35, 28.0], [83.0, 28.0]); // 상자 — 앞에 둔 미틸라·푸르니아·샤르키 선이 먼저 떼어 가므로 그 나머지(남쪽 변은 샤르키 선)
// 우타르프라데시: 750~815년 비움(카나우지의 아유다 왕조는 경계 불명, 기본값 D23), 816~1018년 프라티하라(카나우지), 1019~1089년 비움(분델칸드는 찬델라, 기본값 D30),
//   1090~1193년 가하다발라(아와드·하부 도아브·바라나시·고라크푸르), 1193 델리 쪽 상부 도아브·1194 찬다와르 전투 뒤 가하다발라 땅·1197 바다운(로힐칸드)이 구르 왕조 땅
own(['IN-UP'], [[750, null], [816, 'gurjara-pratihara-dynasty']]);
// 우타르프라데시 쪽 분델칸드(마호바·칼린자르)는 925년 무렵 야소바르만의 칼린자르(D44)부터 찬델라 — 마디아프라데시 쪽 찬델라 땅(925~, 남 칸)과 이어지게(합치기: 메인 추가 지시 2)
const E_UP871 = ownSplit('E_UP871', ['IN-UP'], [['분델칸드', S2_CUTS.E_BUNDELKHAND]], '나머지', {
  분델칸드: [[871, 'gurjara-pratihara-dynasty'], [925, 'chandela-dynasty']],
  나머지: [[871, 'gurjara-pratihara-dynasty']],
}, { from: 871, to: 973 });
const E_UP973 = ownSplit('E_UP973', ['IN-UP'], [['분델칸드', S2_CUTS.E_BUNDELKHAND]], '나머지', {
  분델칸드: [[973, 'chandela-dynasty']],
  나머지: [[973, 'gurjara-pratihara-dynasty'], [1019, null]],
}, { from: 973, to: 1090 });
const E_gah = [[1090, E_GAH], [1194, E_GHUR]];
const E_UP1090 = ownSplit('E_UP1090', ['IN-UP'], [['오우드', S2_CUTS.E_OUDH], ['로힐칸드', S2_CUTS.E_ROHILKHAND], ['하부도아브', S2_CUTS.E_LOWER_DOAB], ['바라나시', S2_CUTS.E_BENARES],
  ['고라크푸르', S2_CUTS.E_GORAKHPUR], ['분델칸드', S2_CUTS.E_BUNDELKHAND]], '상부도아브', {
  오우드: E_gah,
  하부도아브: E_gah,
  바라나시: E_gah,
  고라크푸르: E_gah,
  로힐칸드: [[1090, null], [1197, E_GHUR]],
  분델칸드: [[1090, 'chandela-dynasty']],
  상부도아브: [[1090, null], [1193, E_GHUR]],
}, { from: 1090, to: S4_END });
// 비하르·자르칸드: 750년 팔라는 벵골만, 770년 다르마팔라 때 비하르·자르칸드. 1090 비하르 서부(S3 샤르키 선)는 가하다발라, 1097 미틸라는 카르나타,
//   1144년 무렵 자르칸드를 잃고, 1162년 팔라가 끊긴 뒤 비하르 남부는 비움, 1200년 무렵 바크티야르 할지(구르 왕조 장군)의 비하르 정복
own(['IN-BR'], [[750, null], [770, E_PALA]]);
own(['IN-JH'], [[750, null], [770, E_PALA], [1144, null]]);
const E_BR973 = ownSplit('E_BR973', ['IN-BR'], [['미틸라', S3_CUTS.E_MITHILA], ['푸르니아', S3_CUTS.E_PURNIA], ['샤르키', S3_CUTS.E_SHARQI], ['사란', E_CUT_SARAN]], '남비하르', {
  미틸라: [[973, E_PALA], [1097, 'karnat-dynasty']],
  푸르니아: [[973, E_PALA], [1162, null], [1200, E_GHUR]],
  샤르키: [[973, E_PALA], [1090, E_GAH], [1194, null], [1200, E_GHUR]],
  사란: [[973, E_PALA], [1097, null], [1200, E_GHUR]],
  남비하르: [[973, E_PALA], [1162, null], [1200, E_GHUR]],
}, { from: 973, to: S4_END });
// 서벵골: sultanate.mjs 1206년과 같은 칼선 순서(서두아르·칼림퐁·코치·미드나포르) 뒤에 라르·카마루파 서쪽·바렌드라. 1070 사만타세나의 라르, 1096 비자야세나의 방가(남동),
//   1135 초다강가의 미드나포르, 1141 카마루파가 끊긴 뒤 북벵골 서쪽은 팔라, 1159 발랄라세나의 가우다·바렌드라, 1205 바크티야르 할지의 락나우티(1204 나디아)
const E_WB973 = ownSplit('E_WB973', ['IN-WB'], [['서두아르', S2_CUTS.E_DUARS_W], ['칼림퐁', S2_CUTS.E_KALIMPONG], ['코치', S3_CUTS.E_KOCH_WB], ['미드나포르', S3_CUTS.E_MIDNAPORE],
  ['라르', E_CUT_RARH], ['카마루파서', E_CUT_KAMARUPA_WEST], ['바렌드라', E_CUT_VARENDRA_WB]], '남동', {
  서두아르: [[973, E_KAM], [1141, null]],
  코치: [[973, E_KAM], [1141, null]],
  미드나포르: [[973, E_PALA], [1070, E_SENA], [1135, E_EG]],
  라르: [[973, E_PALA], [1070, E_SENA], [1205, E_GHUR]],
  카마루파서: [[973, E_KAM], [1141, E_PALA], [1159, E_SENA], [1205, E_GHUR]],
  바렌드라: [[973, E_PALA], [1159, E_SENA], [1205, E_GHUR]],
  남동: [[973, E_PALA], [1096, E_SENA], [1205, E_GHUR]],
}, { from: 973, to: S4_END });
// 코라푸트 산지(IN-OR 남부 칼선 안의 서쪽: 코라푸트·라야가다·나바랑푸르·말칸기리 안, 간잠·가자파티(베르함푸르·아스카·모하나·파랄라케문디·카시나가르) 바깥):
//   동쪽 변은 라야가다·가자파티 군 경계(동가츠 산줄기 동쪽 끝, 구누푸르 동쪽) 어림, 북쪽은 남부 칼선(칸다말 남쪽 끝)이 정함 — 검토 1 F1
const E_CUT_KORAPUT = E_cut([81.3, 17.7], [83.55, 18.2], [83.8, 18.75], [83.95, 19.25], [84.05, 19.75], [83.6, 20.3], [81.3, 20.3]);
// 오리사: 736~939년 바우마카라(해안·간잠, S2 칼선 둘), 940~1109년 소마바시(서오리사에서 해안까지), 1078 아난타바르만 초다강가의 남부, 1110 우트칼라 정복(1135 카타크 천도), 1100 마유르반즈
//   코라푸트 산지는 바우마카라·소마바시 비문이 없고 날라 왕조·친다카 나가(1023~)의 땅이라 1077년까지 비움(바스타르와 같이), 1078부터 남부와 같은 동부 강가(1205=1206 모양)
const E_OR711 = ownSplit('E_OR711', ['IN-OR'], [['코라푸트', I(S2_CUTS.E_OR_SOUTH, E_CUT_KORAPUT)], ['남부', S2_CUTS.E_OR_SOUTH], ['해안', S2_CUTS.E_OR_COAST], ['쿠르다', E_CUT_KHURDA], ['삼발푸르', S2_CUTS.E_SAMBALPUR], ['마유르반즈', S2_CUTS.E_MAYURBHANJ]], '토후국', {
  코라푸트: [[711, null], [1078, E_EG]],
  남부: [[711, null], [736, E_BHAUMA], [940, E_SOMA], [1078, E_EG]],
  해안: [[711, null], [736, E_BHAUMA], [940, E_SOMA], [1110, E_EG]],
  쿠르다: [[711, null], [736, E_BHAUMA], [940, E_SOMA], [1110, E_EG]],
  삼발푸르: [[711, null], [940, E_SOMA], [1110, E_EG]],
  마유르반즈: [[711, null], [1100, 'mayurbhanj-state']],
  토후국: [[711, null], [940, E_SOMA], [1110, E_EG]],
}, { from: 711, to: S4_END });
// 차티스가르: 940 소마바시(다크시나 코살라 평지), 1000 라탄푸르 칼추리(평지·북부·수르구자 — S3 1206년과 같음), 바스타르는 비움
const E_CT871 = ownSplit('E_CT871', ['IN-CT'], [['바스타르', S2_CUTS.E_BASTAR], ['수르구자', S2_CUTS.E_SURGUJA], ['북부토후국', S2_CUTS.E_CH_NORTH]], '평지', {
  수르구자: [[871, null], [1000, E_RAT]],
  북부토후국: [[871, null], [1000, E_RAT]],
  평지: [[871, null], [940, E_SOMA], [1000, E_RAT]],
}, { from: 871, to: S4_END });
// 네팔 서부(카르날리·세티·마하칼리): 1100 무렵 카사 말라(S3 1206년과 같은 통째 조각), 마니푸르: 1110 무렵 캉레이팍 왕국(S3 1206년과 같음)
own(['NP-KA', 'NP-SE', 'NP-MA'], [[S4_START, null], [1100, 'khasa-malla-kingdom']]);
own(['IN-MN'], [[S4_START, null], [1110, 'manipur']]);

// ── S4 동 끝 ──

// ── S4 남 (마하라슈트라·마디아프라데시·고아·카르나타카·텔랑가나·안드라·타밀·케랄라·스리랑카, 구현 S4-남): 칼선·상수·own 줄은 이 아래에, 최상위 이름은 S_ ──
// 남 칸 짜임(조사 노트 notes-south 3·4절, 결정 맞춤 2·8·10·11·12, 확인 2·3): 조각 묶음과 기간
//   마디아프라데시: 가(−517~−321 아반티)·나(−320~749 말와 서부·나르마다 북)·다(750~1205, sultanate.mjs 1206과 같은 S2 선·같은 차례 — 1205=1206)
//   마하라슈트라·카르나타카: −517~−185·−184~542는 주마다 따로, 543~1205는 sultanate.mjs '데칸1206'과 같은 선(+ 강가바디·칼랴니·북카르나타카)으로 함께 나눔
//   텔랑가나: −517~319·320~1205. 안드라·타밀나두·케랄라·스리랑카: 시대 내내 한 묶음. 고아·퐁디셰리·락샤드위프·몰디브: 통째
// 칼선은 조사 노트 4절 꼭짓점을 강(나르마다·크리슈나·고다바리·콜리담)·산줄기(사햐드리·사트푸라)·지구 경계 어림으로 다듬은 손그림 선이다. 안/밖 기준 도시는 결과 노트 3절 표(pt-dh 판정).
import { idsOf as S_idsOf } from './table.mjs';
const S_ring = (pts) => [[[...pts, pts[0]]]];
const S_box = (w, s, e, n) => S_ring([[w, s], [e, s], [e, n], [w, n]]);
// 나라 id
const S_AVANTI = 'avanti-kingdom';
const S_ASSAKA = 'assaka-kingdom';
const S_MAGADHA = 'magadha-kingdom';
const S_NANDA = 'nanda-empire';
const S_MAURYA = 'maurya-empire';
const S_SHUNGA = 'shunga-empire';
const S_SATA = 'satavahana-dynasty';
const S_WSAT = 'western-satraps';
const S_IKSH = 'andhra-ikshvaku-dynasty';
const S_ABHIRA = 'abhira-kingdom';
const S_CHUTU = 'chutu-kingdom';
const S_PALLAVA = 'pallava-dynasty';
const S_VAKA = 'vakataka-dynasty';
const S_KADAMBA = 'kadamba-dynasty';
const S_WGANGA = 'western-ganga-dynasty';
const S_SALAN = 'salankayana-dynasty';
const S_VISHNU = 'vishnukundin-dynasty';
const S_AULI = 'aulikara-dynasty';
const S_KMAHI = 'kalachuri-mahishmati';
const S_GUPTA = 'gupta-empire';
const S_ALCHON = 'alchon-huns';
const S_BADAMI = 'badami-chalukya-dynasty';
const S_ECH = 'eastern-chalukya-dynasty';
const S_RK = 'rashtrakuta-dynasty';
const S_WCH = 'western-chalukya-dynasty';
const S_KKAL = 'kalachuri-kalyani';
const S_KTRI = 'kalachuri-tripuri';
const S_ANURA = 'anuradhapura-kingdom';
const S_CHERA = 'chera-dynasty';
const S_CHOLA = 'chola-dynasty';
const S_PANDYA = 'pandya-dynasty';
const S_HOY = 'hoysala-dynasty';
const S_YAD = 'yadava-dynasty';
const S_KAK = 'kakatiya-dynasty';
const S_PARA = 'paramara-dynasty';
const S_CHAND = 'chandela-dynasty';
const S_SIN = 'sinhalese-kingdom';
const S_PRAT = 'gurjara-pratihara-dynasty';
const S_CHAUL = 'chaulukya-dynasty';
const S_EGANGA = 'eastern-ganga-dynasty';
const S_GHURID = 'ghurid-dynasty';
const S_LK = S_idsOf('LKA');

// ── 새 칼선 ──
// 아반티(말와·니마르, 우자인·인도르·비디샤·에란 안, 괄리오르·잡발푸르·사가르·나그푸르 밖): 서는 마히강 상류, 북은 참발강 중류(만다소르 위), 동은 베트와강·비나강 사이, 남은 사트푸라 북쪽 기슭(니마르 포함)
const S_CUT_AVANTI = S_ring([[73.9, 21.9], [74.0, 23.2], [74.4, 24.6], [75.5, 25.1], [77.0, 25.0], [78.3, 24.3], [78.5, 23.4], [78.3, 22.9], [77.7, 22.6], [77.0, 21.9], [76.2, 21.5], [75.0, 21.5]]);
// 아스마카(고다바리강 중류 포타나 둘레, 바단·니자마바드·바사르·난데드 안, 하이데라바드·아우랑가바드·와랑갈 밖)
const S_CUT_ASSAKA = S_ring([[77.0, 19.5], [78.2, 19.6], [79.0, 19.2], [78.9, 18.4], [78.4, 18.1], [77.5, 18.0], [77.0, 18.5]]);
// 나르마다강 북쪽(마우리아 −320·슝가 −184): 남 변은 나르마다강 본류(아마르칸타크 → 만들라 → 잡발푸르 남쪽 베다가트 → 호샹가바드 → 옴카레슈와르 → 마헤슈와르 → 바르와니)
const S_CUT_NARMADA_N = S_ring([[72.5, 27.5], [83.5, 27.5], [83.5, 22.7], [81.75, 22.67], [81.2, 22.55], [80.9, 22.45], [80.37, 22.55], [80.0, 22.95], [79.95, 23.12], [79.3, 23.02],
  [78.5, 22.95], [77.72, 22.75], [77.0, 22.45], [76.6, 22.3], [76.15, 22.24], [75.59, 22.15], [74.9, 22.0], [74.3, 21.95], [72.5, 21.95]]);
// 말와 서부(아카라·아반티와 아누파 — 사타바하나 −69·서 크샤트라파 150~408·굽타 409·아울리카라 440·칼추리 550·프라티하라 730): 우자인·인도르·비디샤·만다소르·마헤슈와르 안,
//   에란·사가르·잡발푸르·괄리오르·부르한푸르 밖. 동 변은 베트와강 동쪽 비나강 어림, 남 변은 사트푸라 북쪽 기슭
const S_CUT_MP_WEST = S_ring([[73.0, 21.9], [74.2, 21.6], [75.4, 21.6], [76.4, 21.6], [77.0, 22.3], [77.7, 22.65], [78.05, 22.9], [78.0, 23.6], [77.92, 24.2], [77.4, 24.9], [76.0, 25.4], [75.0, 25.4], [73.0, 25.4]]);
// 북콩칸·나식·푸네·아마드나가르(서 크샤트라파 150~179, 아비라 225~335): 소파라·나식·푸네·아마드나가르 안, 파이탄·아우랑가바드·솔라푸르·콜라푸르 밖. 남 변은 닐라강(비마강 상류) 어림
const S_CUT_KONKAN_NASHIK_PUNE = S_ring([[72.5, 18.0], [74.0, 17.9], [74.9, 18.3], [75.1, 19.0], [74.9, 19.8], [74.6, 20.6], [74.0, 21.1], [73.2, 20.9], [72.5, 20.3]]);
// 바나바시(추투 225·카담바 345): 바나바시·시르시·후블리·시모가 안, 벵갈루루·칼라부라기·벨라가비 밖. 북 변은 다르와드 북쪽, 동 변은 퉁가바드라강 어림
const S_CUT_BANAVASI = S_ring([[74.0, 13.6], [75.6, 13.4], [76.2, 14.0], [76.0, 15.0], [75.6, 15.55], [74.9, 15.6], [74.2, 15.1]]);
// 할라시·벨가움(카담바 435 카쿠스타바르만 때 더한 땅): 벨라가비·할라시 안, 비자푸르·바다미 밖
const S_CUT_KADAMBA_N = S_ring([[74.0, 15.1], [74.9, 15.6], [75.6, 15.55], [75.7, 16.3], [74.2, 16.4], [74.0, 15.9]]);
// 강가바디(서 강가 350~1003·촐라 1004·호이살라 1116): 탈라카드·마이소르·콜라르·벵갈루루·툼쿠루 안, 하산·시모가·첸나이·마두라이 밖. 서 변은 헤마바티강 어림
const S_CUT_GANGAVADI = S_ring([[76.1, 11.3], [77.9, 11.3], [78.7, 12.4], [78.7, 13.6], [77.4, 13.7], [76.4, 13.2], [75.9, 12.4]]); // 남·동 변은 카르나타카 남쪽 끝(차마라자나가르)·콜라르 동쪽 끝까지(조각 경계가 정함)
// 칼랴니(칼추리 비잘라 1157~1183): 바사바칼랴나·비다르·칼라부라기·비자푸르(비잘라의 옛 근거지 탈다바디) 안, 하이데라바드·솔라푸르·후블리 밖. 남 변은 크리슈나강 어림(카르나타카·마하라슈트라 쪽만, 텔랑가나 쪽은 카카티야 땅)
const S_CUT_KALYANI = S_ring([[75.6, 16.5], [76.6, 16.5], [77.6, 16.9], [78.0, 17.6], [77.9, 18.2], [77.2, 18.5], [76.4, 18.3], [76.1, 17.8], [75.95, 17.3], [75.6, 17.0]]);
// 벵기(고다바리강–크리슈나강 사이 삼각주, 살란카야나 320·비슈누쿤딘 441·동 찰루키아 624): 엘루루·라자문드리·마출리파트남 안, 아마라바티·군투르·쿠르눌·넬로르·비사카파트남 밖.
//   남서 변은 크리슈나강 본류(나가르주나사가르 아래 → 비자야와다 → 어귀), 북 변은 고다바리강 북쪽 구릉
const S_CUT_VENGI = S_ring([[80.0, 16.85], [80.62, 16.55], [80.9, 16.2], [81.15, 15.7], [83.0, 16.3], [83.0, 17.2], [81.9, 17.4], [81.0, 17.9], [80.3, 17.9]]);
// 크리슈나강 남쪽 하류(이크슈바쿠 225~325, 군투르·팔나두): 나가르주나콘다·군투르·아마라바티 안, 하이데라바드·넬로르·카키나다 밖
const S_CUT_IKSHVAKU = S_ring([[78.7, 15.4], [78.7, 16.9], [79.3, 16.65], [80.0, 16.85], [80.62, 16.55], [80.9, 16.2], [81.15, 15.7], [80.3, 15.4]]);
// 안드라 남부 해안(넬로르·프라카삼 남부, 팔라바 275): 넬로르·카발리 안, 군투르·티루파티 밖
const S_CUT_AP_SOUTH = S_ring([[79.2, 13.4], [80.5, 13.4], [80.5, 15.5], [79.4, 15.5], [79.2, 14.6]]);
// 텔랑가나 동남(비슈누쿤딘 420의 텔랑가나 쪽, 날곤다·카맘·수랴페트): 하이데라바드 밖
const S_CUT_VK_TG = S_box(78.7, 16.3, 81.5, 18.0);
// 북위 14.3° 위(마우리아 −296 빈두사라의 남쪽 한계 — 아소카 비문 시다푸라·브라마기리 안, 마이소르·벵갈루루 밖)
const S_CUT_DECCAN_14N = S_box(70.0, 14.3, 90.0, 30.0);
// 안드라의 북위 14.3° 위: 서쪽(77.7° 서쪽)은 13.5°까지 내려 아난타푸르 남서쪽 돌출부(힌두푸르·마다카시라)를 한 단위로 둠(부스러기 막기)
const S_CUT_AP_14N = S_ring([[70.0, 13.5], [77.7, 13.5], [77.7, 14.3], [90.0, 14.3], [90.0, 30.0], [70.0, 30.0]]);
// 북위 15° 위 카르나타카(사타바하나 124 고타미푸트라)
const S_CUT_KA_15N = S_box(73.0, 15.0, 79.0, 19.0);
// 판디아(마두라이·티루넬벨리·라마나타푸람 안, 탄자부르·살렘·코임바토르·카루르 밖): 북 변은 바이가이강 북쪽 구릉(시루말라이·피란말라이)
const S_CUT_PANDYA = S_ring([[76.6, 8.1], [77.2, 10.3], [78.5, 10.5], [79.1, 10.4], [79.9, 10.3], [80.3, 9.8], [80.3, 8.0]]);
// 촐라 본령(카베리강 삼각주, 탄자부르·쿰바코남·나가파티남·티루치라팔리 안, 마두라이·첸나이·살렘 밖): 북 변은 콜리담강(북타밀 선이 먼저)
const S_CUT_CHOLA_CORE = S_ring([[78.5, 10.3], [79.9, 10.1], [80.1, 11.3], [79.1, 11.9], [78.5, 11.4]]);
// 콩구(체라 상감 시대의 카루르·코임바토르·에로드, 케랄라 팔라카드 쪽): 마두라이·첸나이·탄자부르 밖
const S_CUT_KONGU = S_ring([[76.2, 9.8], [78.5, 10.5], [78.5, 12.0], [77.0, 12.3], [76.22, 11.5]]);
// 실론 북부(라자라타, 촐라 993~1016): 아누라다푸라·자프나·폴론나루와 안, 콜롬보·함반토타·캔디 밖 — 북위 7.8°
const S_CUT_LK_NORTH = S_box(79.0, 7.8, 82.5, 10.2);
// 실론 중부(말라야 산지, 아누라다푸라 −249에 더한 땅): 캔디 안, 콜롬보·함반토타 밖 — 북위 7.0~7.8°
const S_CUT_LK_MID = S_box(79.0, 7.0, 82.5, 7.8);
// S1·S2·S3 선(모음에서만 가져옴): 1205년 모양을 1206년(sultanate.mjs)과 같은 선으로 맞춤
const S_KONKAN = S3_CUTS.W_CUT_KONKAN;
const S_KHANDESH = S3_CUTS.W_CUT_KHANDESH;
const S_KA_SOUTH = S3_CUTS.W_CUT_KA_SOUTH;
const S_NAGPUR_N = I(S2_CUTS.S_NAGPUR, S3_CUTS.W_NAGPUR_N_BOX);
const S_KALINGA_N = S3_CUTS.E_KALINGA_N;
const S_TONDAI = S3_CUTS.E_TONDAI;
const S_TN_NORTH = S3_CUTS.E_TN_NORTH;
// 카르나타카 북부(북위 14.6° 위, 바다미 543 본령·벨가움·비자푸르·바갈코트): 데칸 묶음의 나머지에서 카르나타카 쪽만 떼어 냄(조각 도형으로 자름). 남 변을 남카르나타카 선(14.65~14.8°)보다 낮춰 사이 띠가 남지 않게
const S_KA_N = I(SA.F('IN-KA'), box(73.0, 14.6, 79.0, 19.0));
export const S_CUTS = { S_CUT_AVANTI, S_CUT_ASSAKA, S_CUT_NARMADA_N, S_CUT_MP_WEST, S_CUT_KONKAN_NASHIK_PUNE, S_CUT_BANAVASI, S_CUT_KADAMBA_N, S_CUT_GANGAVADI, S_CUT_KALYANI,
  S_CUT_VENGI, S_CUT_IKSHVAKU, S_CUT_AP_SOUTH, S_CUT_VK_TG, S_CUT_DECCAN_14N, S_CUT_AP_14N, S_CUT_KA_15N, S_CUT_PANDYA, S_CUT_CHOLA_CORE, S_CUT_KONGU, S_CUT_LK_NORTH, S_CUT_LK_MID };

// ── 조각 나누기 (묶음 기간은 BOUNDS의 해) ──
// 서부·북부(아반티 밖 말와 서부·나르마다 북 = 마우리아 −320 땅): 난다 −344부터(단계 끝 창구 ③ 결정 5 — 마우리아가 이어받은 땅과 같게)
const S_MP1 = ownSplit('S_MP-517', ['IN-MP'], [['아반티', S_CUT_AVANTI], ['서부', S_CUT_MP_WEST], ['북부', S_CUT_NARMADA_N]], '나머지', {}, { from: -517, to: -320 });
const S_MP2 = ownSplit('S_MP-320', ['IN-MP'], [['서부', S_CUT_MP_WEST], ['북부', S_CUT_NARMADA_N]], '남동', {}, { from: -320, to: 750 });
// 750~1205: sultanate.mjs 1206 'E_MP'와 같은 선·같은 차례(1205년 파라마라·찬델라·델리(구르) 모양이 1206과 같게)
const S_MP3 = ownSplit('S_MP750', ['IN-MP'], [['괄리오르북부', S2_CUTS.S_GWALIOR_N], ['괄리오르말와', S2_CUTS.S_GWALIOR_MALWA], ['인도르', S2_CUTS.S_INDORE], ['보팔', S2_CUTS.S_BHOPAL],
  ['레와', S2_CUTS.S_REWA_LAND], ['소하그푸르', S2_CUTS.S_SOHAGPUR], ['분델칸드', S2_CUTS.S_BUNDELKHAND], ['나르마다', S2_CUTS.S_NARMADA], ['베툴세오니', S2_CUTS.S_BETUL_SEONI], ['니마르', S2_CUTS.S_NIMAR],
  ['본슬레남부', S2_CUTS.S_BHONSLE_S], ['말와', S2_CUTS.S_MALWA], ['서부잔여', box(73.0, 20.0, 76.9, 26.0)]], '사가르', {}, { from: 750, to: S4_END });
const S_MH1 = ownSplit('S_MH-517', ['IN-MH'], [['아스마카', S_CUT_ASSAKA]], '나머지', {}, { from: -517, to: -184 });
const S_MH2 = ownSplit('S_MH-184', ['IN-MH'], [['서북', S_CUT_KONKAN_NASHIK_PUNE], ['베라르', S2_CUTS.S_BERAR], ['나그푸르', S2_CUTS.S_NAGPUR], ['마라트와다', S1_CUTS.MARATHWADA]], '나머지', {}, { from: -184, to: 543 });
const S_KA1 = ownSplit('S_KA-517', ['IN-KA'], [['북부', S_CUT_DECCAN_14N]], '남부', {}, { from: -517, to: -184 });
const S_KA2 = ownSplit('S_KA-184', ['IN-KA'], [['바나바시', S_CUT_BANAVASI], ['벨가움', S_CUT_KADAMBA_N], ['강가바디', S_CUT_GANGAVADI], ['북부', S_CUT_KA_15N]], '나머지', {}, { from: -184, to: 543 });
// 543~1205: sultanate.mjs '데칸1206'과 같은 선·차례 + 강가바디(남카르나타카 앞)·칼랴니(하이데라바드 앞)·북카르나타카(맨 뒤)
// 신두두르그 남쪽 끝(마하라슈트라의 북위 15.7° 남쪽, 콘칸 선 밖): 콘칸과 같은 주인으로 두어 콘칸이 고아와 이어지게(부스러기 막기), 1189부터는 1206과 같이 데칸(야다바)
const S_KONKAN_TIP = I(SA.F('IN-MH'), box(73.3, 15.4, 74.4, 15.75));
const S_DK = ownSplit('S_데칸543', ['IN-MH', 'IN-KA'], [['콘칸', S_KONKAN], ['콘칸남끝', S_KONKAN_TIP], ['칸데시', S_KHANDESH], ['베라르', S2_CUTS.S_BERAR], ['나그푸르북', S_NAGPUR_N], ['나그푸르남', S2_CUTS.S_NAGPUR],
  ['강가바디', S_CUT_GANGAVADI], ['남카르나타카', S_KA_SOUTH], ['칼랴니', S_CUT_KALYANI], ['하이데라바드', S1_CUTS.HK_KARNATAKA], ['벨라리', S2_CUTS.S_BELLARY], ['북카르나타카', S_KA_N]],
  '데칸', {}, { from: 543, to: S4_END });
const S_TG1 = ownSplit('S_TG-517', ['IN-TG'], [['아스마카', S_CUT_ASSAKA]], '나머지', {}, { from: -517, to: 320 });
const S_TG2 = ownSplit('S_TG320', ['IN-TG'], [['동남', S_CUT_VK_TG]], '나머지', {}, { from: 320, to: S4_END });
const S_AP = ownSplit('S_AP', ['IN-AP'], [['북칼링가', S_KALINGA_N], ['벵기', S_CUT_VENGI], ['군투르', S_CUT_IKSHVAKU], ['넬로르남', I(S_CUT_AP_SOUTH, S_box(70.0, 5.0, 90.0, 14.3))], ['넬로르', S_CUT_AP_SOUTH], ['북부', S_CUT_AP_14N]], '남부', {}, { from: -517, to: S4_END });
const S_TN = ownSplit('S_TN', ['IN-TN'], [['칸야쿠마리', S2_CUTS.S_KANYAKUMARI], ['톤다이', S_TONDAI], ['북부', S_TN_NORTH], ['판디아', S_CUT_PANDYA], ['촐라', S_CUT_CHOLA_CORE], ['콩구', S_CUT_KONGU]],
  '나머지', {}, { from: -517, to: S4_END });
const S_KL = ownSplit('S_KL', ['IN-KL'], [['판디아', S_CUT_PANDYA], ['트라방코르', S2_CUTS.S_TRAVANCORE], ['콩구', S_CUT_KONGU]], '나머지', {}, { from: -517, to: S4_END });
const S_LKS = ownSplit('S_LK', S_LK, [['북부', S_CUT_LK_NORTH], ['중부', S_CUT_LK_MID]], '남부', {}, { from: -517, to: S4_END });
const S_N = null; // 비운 땅(이유는 voids 남 칸 줄)

// ─ 기간 1 (기원전 800~319) ─
// 마디아프라데시 가(−517~−321): 아반티 −499(결정 1), −412 시슈나가의 병합(마가다, D35), −344 난다
own([S_MP1.아반티], [[-517, S_N], [-499, S_AVANTI], [-412, S_MAGADHA], [-344, S_NANDA]]);
own([S_MP1.서부, S_MP1.북부], [[-517, S_N], [-344, S_NANDA]]); // 난다의 나르마다강 북쪽 중부 인도(분델칸드 남부·사가르·괄리오르 쪽, 푸라나의 '단일 군주' 구절 — 어림)
own([S_MP1.나머지], [[-517, S_N]]); // 체디·다할라 등 경계 사료가 없는 땅
// 마디아프라데시 나(−320~749): 말와 서부·나르마다 북·남동(사트푸라·곤드 땅). −320 찬드라굽타, −296 빈두사라(결정 9), −184 슝가(나르마다 북만, −100까지 — 결정 맞춤 8),
//   −69 사타카르니 1세의 아카라·아반티·아누파, 150 루드라다만(서 크샤트라파, 408까지 — 맞춤 10)
own([S_MP2.서부], [[-320, S_MAURYA], [-184, S_SHUNGA], [-99, S_N], [-69, S_SATA], [150, S_WSAT]]);
own([S_MP2.북부], [[-320, S_MAURYA], [-184, S_SHUNGA], [-99, S_N]]);
own([S_MP2.남동], [[-320, S_N], [-296, S_MAURYA], [-184, S_N], [270, S_VAKA]]); // 270 빈디야샤크티·프라바라세나 1세의 바카타카(베툴·친드와라·세오니)
// 마하라슈트라 −517~−185: 아스마카(포타나) −499, −344 난다(D35), −296 마우리아(결정 9 — 마하라슈트라 내륙 포함)
own([S_MH1.아스마카], [[-517, S_N], [-499, S_ASSAKA], [-344, S_NANDA], [-320, S_N], [-296, S_MAURYA]]);
own([S_MH1.나머지], [[-517, S_N], [-296, S_MAURYA]]);
// 마하라슈트라 −184~542: −184~−100 비움(결정 10), −99 사타바하나(D32), −69 비다르바, 150 서 크샤트라파의 북콩칸·나식·푸네(179까지 — 확인 3), 225 아비라(나식)
own([S_MH2.서북], [[-184, S_N], [-99, S_SATA], [150, S_WSAT], [180, S_SATA], [225, S_ABHIRA]]);
own([S_MH2.베라르, S_MH2.나그푸르], [[-184, S_N], [-69, S_SATA], [225, S_N], [270, S_VAKA]]);
own([S_MH2.마라트와다, S_MH2.나머지], [[-184, S_N], [-99, S_SATA], [225, S_N]]);
// 카르나타카 −517~−185: 북위 14.3° 위만 마우리아(−296, 아소카 비문 남쪽 끝)
own([S_KA1.북부], [[-517, S_N], [-296, S_MAURYA]]);
own([S_KA1.남부], [[-517, S_N]]);
// 카르나타카 −184~542: 124 고타미푸트라(북위 15° 위), 225 추투(바나바시), 345 카담바
own([S_KA2.바나바시, S_KA2.벨가움], [[-184, S_N], [124, S_SATA], [225, S_CHUTU]]);
own([S_KA2.강가바디, S_KA2.나머지], [[-184, S_N]]);
own([S_KA2.북부], [[-184, S_N], [124, S_SATA], [225, S_N]]);
// 텔랑가나 −517~319
own([S_TG1.아스마카], [[-517, S_N], [-499, S_ASSAKA], [-344, S_NANDA], [-320, S_N], [-296, S_MAURYA], [-184, S_N], [-99, S_SATA], [225, S_N]]);
own([S_TG1.나머지], [[-517, S_N], [-296, S_MAURYA], [-184, S_N], [-99, S_SATA], [225, S_N]]);
// 안드라: 북칼링가는 −260 아소카의 칼링가 정복부터 마우리아, 남쪽은 −296 빈두사라(북위 14.3° 위)·124 사타바하나·225 이크슈바쿠·275 팔라바(넬로르)
own([S_AP.북칼링가], [[-517, S_N], [-260, S_MAURYA], [-184, S_N]]);
own([S_AP.벵기, S_AP.북부], [[-517, S_N], [-296, S_MAURYA], [-184, S_N], [124, S_SATA], [225, S_N]]);
own([S_AP.군투르], [[-517, S_N], [-296, S_MAURYA], [-184, S_N], [124, S_SATA], [225, S_IKSH]]);
own([S_AP.넬로르], [[-517, S_N], [-296, S_MAURYA], [-184, S_N], [124, S_SATA], [225, S_N], [275, S_PALLAVA]]);
own([S_AP.넬로르남], [[-517, S_N], [275, S_PALLAVA]]); // 넬로르 남쪽(북위 14.3° 아래): 마우리아·사타바하나 밖
own([S_AP.남부], [[-517, S_N]]);
// 타밀나두·케랄라: 상감 시대 세 나라 −259~299(D31 — 아소카 비문과 망굴람 비문), 300부터 칼라브라 시기 비움
own([S_TN.칸야쿠마리, S_TN.판디아], [[-517, S_N], [-259, S_PANDYA], [300, S_N]]);
own([S_TN.촐라], [[-517, S_N], [-259, S_CHOLA], [300, S_N]]);
own([S_TN.콩구], [[-517, S_N], [-259, S_CHERA], [300, S_N]]);
own([S_TN.톤다이, S_TN.북부, S_TN.나머지], [[-517, S_N]]);
own([S_KL.판디아], [[-517, S_N], [-259, S_PANDYA], [300, S_N]]);
own([S_KL.트라방코르, S_KL.콩구, S_KL.나머지], [[-517, S_N], [-259, S_CHERA], [300, S_N]]); // 상감 체라의 무지리스(코둥갈루르)·카루르
// 스리랑카: −249 데바남피야 티사(라자라타·말라야), −160 두타가마니의 통일
own([S_LKS.북부, S_LKS.중부], [[-517, S_N], [-249, S_ANURA]]);
own([S_LKS.남부], [[-517, S_N], [-160, S_ANURA]]);
// 고아(3,325 km²)·퐁디셰리·락샤드위프·몰디브
own(['IN-GA'], [[S4_START, S_N], [-296, S_MAURYA], [-184, S_N], [124, S_SATA], [225, S_N]]);
own(['IN-PY', 'IN-LD', 'MDV-5234'], [[S4_START, S_N]]); // 1,000 km² 미만 조각(sultanate.mjs와 같이 비움)

// ─ 기간 2 (320~749) ─
// 말와 서부: 409 찬드라굽타 2세(맞춤 10), 440 아울리카라(만다소르), 541~549 비움, 550 칼추리(마히슈마티), 610 풀라케신 2세의 붓다라자 격파 뒤 비움, 730 나가바타 1세의 프라티하라
own([S_MP2.서부], [[409, S_GUPTA], [440, S_AULI], [541, S_N], [550, S_KMAHI], [610, S_N], [730, S_PRAT]]);
// 나르마다 북(에란·사가르·괄리오르·분델칸드·레와): 350 사무드라굽타(에란 비문), 510 토라마나(에란 멧돼지상)·미히라쿨라(괄리오르 비문), 528 손다니 전투 뒤 비움
own([S_MP2.북부], [[350, S_GUPTA], [510, S_ALCHON], [528, S_N]]);
own([S_MP2.남동], [[511, S_N]]); // 바카타카 끝(510, D43)
own([S_MH2.서북], [[336, S_N]]); // 아비라 끝(335)
own([S_MH2.베라르, S_MH2.나그푸르], [[511, S_N]]);
own([S_MH2.마라트와다], [[475, S_VAKA], [511, S_N]]); // 475 하리셰나(아잔타) — 정복 주장(쿤탈라·라타 등)은 칠하지 않음(D43)
own([S_KA2.바나바시], [[345, S_KADAMBA], [540, S_N]]); // 345 마유라샤르마, 540 무렵 바다미 찰루키아
own([S_KA2.벨가움], [[345, S_N], [435, S_KADAMBA], [540, S_N]]); // 435 카쿠스타바르마 때 할라시·벨가움
own([S_KA2.강가바디], [[350, S_WGANGA]]);
// 데칸 543~: 543 풀라케신 1세(바다미), 566 키르티바르만 1세(카담바·콘칸 마우리아), 610 풀라케신 2세(나르마다~카베리 — 칼추리·하이데라바드 카르나타카 쪽), 바타피 642 점령은 안 그림(D36)
own([S_DK.콘칸, S_DK.콘칸남끝, S_DK.남카르나타카], [[543, S_N], [566, S_BADAMI]]);
own([S_DK.칸데시], [[543, S_N], [550, S_KMAHI], [610, S_BADAMI]]);
own([S_DK.베라르, S_DK.벨라리, S_DK.데칸], [[543, S_N], [610, S_BADAMI]]);
own([S_DK.나그푸르북, S_DK.나그푸르남], [[543, S_N]]); // 곤드 숲(sultanate.mjs 1206과 같이 비움)
own([S_DK.강가바디], [[543, S_WGANGA]]);
own([S_DK.칼랴니, S_DK.북카르나타카, S_DK.하이데라바드], [[543, S_BADAMI]]); // 바다미 본령(바갈코트·비자푸르)과 라이추르·칼라부라기
// 텔랑가나 320~: 420 비슈누쿤딘(날곤다·카맘), 624 바다미(풀라케신 2세의 벵기 정복 뒤)
own([S_TG2.동남], [[320, S_N], [420, S_VISHNU], [624, S_BADAMI]]);
own([S_TG2.나머지], [[320, S_N], [624, S_BADAMI]]);
// 안드라: 320 살란카야나(벵기), 326 팔라바(이크슈바쿠 뒤 군투르)·420 비슈누쿤딘·436 팔라바, 441 비슈누쿤딘(벵기), 600 마헨드라바르만 1세(남부), 610 바다미(북부), 624 동 찰루키아(쿠브자 비슈누바르다나)
own([S_AP.벵기], [[320, S_SALAN], [441, S_VISHNU], [624, S_ECH]]);
own([S_AP.군투르], [[326, S_PALLAVA], [420, S_VISHNU], [436, S_PALLAVA], [624, S_ECH]]); // 436 시마바르만 2세가 크리슈나강 하구를 되찾음(노트 2-4)
own([S_AP.북부], [[610, S_BADAMI]]);
own([S_AP.남부], [[600, S_PALLAVA]]);
// 타밀나두: 340 비슈누고파의 칸치(톤다이), 575 시마비슈누(콜리담강까지), 590 케둥곤의 판디아 부흥
own([S_TN.톤다이], [[340, S_PALLAVA]]);
own([S_TN.북부], [[575, S_PALLAVA]]);
own([S_TN.칸야쿠마리, S_TN.판디아], [[590, S_PANDYA]]);
own([S_KL.판디아], [[590, S_PANDYA]]);
own(['IN-GA'], [[566, S_BADAMI]]);

// ─ 기간 3 (750~1205) ─
// 마디아프라데시 다(750~1205, 1206 E_MP와 같은 선): 말와는 프라티하라 → 915 인드라 3세의 라슈트라쿠타(파라마라는 그 신하) → 972 시야카의 파라마라 → 1135 시다라자의 차울루키아(맞춤 11) → 1175 빈디야바르만
const S_malwa = [[750, S_PRAT], [915, S_RK], [972, S_PARA], [1135, S_CHAUL], [1175, S_PARA]];
own([S_MP3.괄리오르말와, S_MP3.인도르, S_MP3.보팔, S_MP3.니마르, S_MP3.말와, S_MP3.서부잔여], S_malwa);
own([S_MP3.괄리오르북부], [[750, S_N], [836, S_PRAT], [1000, S_CHAND], [1196, S_GHURID]]); // 836 미히라 보자(괄리오르 비문), 1000 무렵 단가, 1196 구르의 괄리오르 함락(1206 델리 술탄국과 같은 땅)
own([S_MP3.분델칸드, S_MP3.사가르], [[750, S_N], [836, S_PRAT], [925, S_CHAND]]); // 925 무렵 야소바르만의 칼린자르(D44)
own([S_MP3.나르마다, S_MP3.소하그푸르], [[750, S_N], [1015, S_KTRI]]); // 1015 강게야데바의 다할라(트리푸리) — 1206부터 비움(D45)
own([S_MP3.레와, S_MP3.베툴세오니, S_MP3.본슬레남부], [[750, S_N]]);
// 데칸: 753 단티두르가의 라슈트라쿠타, 973 타일라파 2세의 서 찰루키아(D38), 1004 라자라자 1세의 탈라카드(강가바디), 1116 호이살라 비슈누바르다나(D41),
//   1157 칼추리 비잘라의 칼랴니(1183까지), 1187 빌라마 5세의 데바기리(야다바), 1189 서 찰루키아 끝 — 1205년은 1206년(야다바·호이살라)과 같은 땅
own([S_DK.콘칸], [[753, S_RK], [973, S_WCH], [1189, S_N]]);
own([S_DK.콘칸남끝], [[753, S_RK], [973, S_WCH], [1189, S_YAD]]); // 1189부터 실라하라 소국(1만 km² 미만, 1206과 같이 비움)
own([S_DK.칸데시, S_DK.베라르, S_DK.데칸], [[753, S_RK], [973, S_WCH], [1187, S_YAD]]);
own([S_DK.강가바디], [[1004, S_CHOLA], [1116, S_HOY]]);
own([S_DK.남카르나타카], [[753, S_RK], [973, S_WCH], [1116, S_HOY]]);
own([S_DK.칼랴니], [[753, S_RK], [973, S_WCH], [1157, S_KKAL], [1184, S_WCH], [1189, S_YAD]]);
own([S_DK.하이데라바드, S_DK.북카르나타카], [[753, S_RK], [973, S_WCH], [1189, S_YAD]]);
own([S_DK.벨라리], [[753, S_RK], [973, S_WCH], [1189, S_HOY]]); // 1189 발랄라 2세가 퉁가바드라강 북쪽까지
own([S_TG2.동남, S_TG2.나머지], [[753, S_RK], [973, S_WCH], [1163, S_KAK]]); // 1163 루드라데바의 카카티야
// 안드라: 1070 쿨로퉁가 1세가 벵기를 촐라에 합침, 1118 비크라마디티야 6세(서 찰루키아), 1135 비크라마 촐라의 되찾음(벨라나티 초다), 1199 가나파티의 카카티야(1206과 같은 땅),
//   북칼링가 1078 아난타바르만 초다강가(동 강가)
own([S_AP.북칼링가], [[1078, S_EGANGA]]);
own([S_AP.벵기, S_AP.군투르], [[1070, S_CHOLA], [1118, S_WCH], [1135, S_CHOLA], [1199, S_KAK]]);
own([S_AP.넬로르, S_AP.넬로르남, S_AP.남부], [[898, S_CHOLA], [1199, S_KAK]]); // 897 아디티야 1세가 아파라지타를 꺾음(팔라바 끝)
own([S_AP.북부], [[753, S_RK], [973, S_WCH], [1163, S_KAK]]);
// 타밀나두: 871 아디티야 1세(콩구·카베리), 898 톤다이만달람, 910 파란타카 1세의 마두라이(판디아 땅은 1215년까지 촐라 색 — D42), 949 타콜람(라슈트라쿠타, D37), 966 되찾음
own([S_TN.촐라, S_TN.콩구, S_TN.나머지], [[871, S_CHOLA]]);
own([S_TN.톤다이], [[898, S_CHOLA], [949, S_RK], [966, S_CHOLA]]);
own([S_TN.북부], [[898, S_CHOLA]]);
own([S_TN.칸야쿠마리, S_TN.판디아], [[910, S_CHOLA]]);
// 케랄라: 800 마호다야푸람 체라, 985 라자라자 1세의 칸달루르(남부), 1103부터 소국(1206과 같이 비움)
own([S_KL.판디아, S_KL.트라방코르], [[800, S_CHERA], [985, S_CHOLA], [1103, S_N]]);
own([S_KL.콩구, S_KL.나머지], [[800, S_CHERA], [1103, S_N]]);
// 스리랑카: 993 라자라자 1세의 북부 점령(D40), 1017 라젠드라 1세의 전 섬, 1055 비자야바후 1세의 루후나, 1070 폴론나루와 탈환
own([S_LKS.북부], [[993, S_CHOLA], [1070, S_SIN]]);
own([S_LKS.중부, S_LKS.남부], [[1017, S_CHOLA], [1055, S_SIN]]);
own(['IN-GA'], [[753, S_RK], [973, S_WCH], [1189, S_N]]);

// ── S4 남 끝 ──

// ── 나머지: 줄을 적지 않은 단위는 시대 내내 주인 null(아직 그리지 않음) ──
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역 ──
// 버전의 to는 숫자 그대로 둔다(마지막 표 끝 S4_END = sultanate.mjs의 첫 해)
const joined = joinTables(TABLES);
if (joined.TO !== S4_END) throw new Error(`south-asia ancient: 마지막 표의 끝이 ${joined.TO} (${S4_END}이어야 sultanate.mjs와 이어짐)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));
// 주인 있는 단위가 하나도 없는 기간(빈 틀·기원전 800~518년)은 구역을 만들지 않는다. 그해 다른 권역 도형이 덮는 땅(cnMinusOf)은 통째로 뺀다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapZones = joined.nullSegments.filter(([from, to]) => ownedIn(from, to)).map(([from, to, list]) => {
  const minus = [...cnMinusOf(from, to), ...(list.length ? [build(list)] : [])];
  return { name: `남아시아 고대 ${from}~${to - 1}`, zone: minus.length ? D(SA.domain, ...minus) : SA.domain, from, to };
});

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). [from, to, 도형], // 이유
// V(from, to, 조각 id…)·B(from, to, 단위 이름…)로 한 줄씩 적는다. 자기 칸 머리 아래 기간 소제목에
const V = (from, to, ...ids) => [from, to, SA.F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)]; // 나눈 조각 단위(이름/부분)도 받음
const voids = [
  // ── S4 서 ──
  ...W_voids(), // 서 칸 모든 기간(까닭은 W_voids 위 주석)
  // ── S4 서 끝 ──
  // ── S4 동 ──
  // ─ 기간 1 ─
  V(S4_START, -499, ...E_ALL), // 기원전 800~501년: 경계를 말하는 사료가 후대 불전·푸라나의 나라 목록뿐(운영자 결정 1)
  V(-499, 320, ...E_HILLS), // 아삼·북동 산지·시킴·부탄·안다만·차티스가르: 1만 km² 넘는 나라를 말하는 사료가 없음(아삼 카마루파는 350년부터)
  V(-499, -320, 'IN-WB', ...E_BD_ALL, 'IN-UT', ...E_NP), // 벵골(방가)·우타라칸드·네팔: 16대국·난다 밖, 경계 사료 없음
  V(-499, -344, 'IN-OR'), // 칼링가: 16대국 목록 밖, 난다 정복 전
  B(-499, -344, E_UP517.말라, E_UP517.나머지, E_BJ517.나머지), // 말라(1만 km² 미만, 기본값 D19)·쿠루·슈라세나 쪽 상부 도아브·칸푸르·분델칸드·초타나그푸르·푸르니아: 16대국 땅 밖이거나 1만 km² 미만
  V(-320, -260, 'IN-OR', 'IN-UT', 'BD-B', 'BD-G'), B(-320, -260, E_NP320.테라이), // 칼링가 독립 왕국(기원전 261년 아소카 정복 전)·우타라칸드·실헤트·치타공·테라이: 아소카 전 마우리아 땅이라는 근거 없음
  B(-320, -184, E_NP320.산지), // 네팔 산지: 마우리아 비문 없음
  V(-184, 320, 'IN-OR', 'IN-WB', ...E_BD_ALL, 'IN-UT', ...E_NP), // 마우리아 뒤 칼링가(카라벨라)·벵골·네팔: 경계 사료 없음
  V(-99, 127, 'IN-UP'), B(-99, 75, E_BJ184.미틸라, E_BJ184.나머지), B(-27, 75, E_BJ184.마가다), V(75, 320, 'IN-BR', 'IN-JH'), V(231, 320, 'IN-UP'), // 슝가·칸바 뒤 갠지스 평원: 미트라·나가·무룬다 등 1만 km² 안팎 소국(경계 불명), 쿠샨은 127~230년 UP만(기본값 D21)
  // ─ 기간 2 ─
  V(320, 736, 'IN-OR'), V(320, 750, 'IN-UT', 'BD-B', 'BD-G', ...E_HILLS.filter((id) => id !== 'IN-AS')), // 오리사(마타라·샤일로드바바 등 경계 불명)·우타라칸드(카튜리 전)·치타공·실헤트·북동 산지·시킴·부탄·차티스가르: 1만 km² 넘는 나라의 경계 사료 없음(굽타 조공국은 칠하지 않음, 기본값 D22)
  B(320, 350, E_UP320.서부), V(320, 350, 'IN-JH'), B(320, 350, E_WB320.카마루파서, E_WB320.벵골), B(320, 400, E_BDF.카마루파서, E_BDF.나머지), V(320, 400, 'BD-A', 'BD-C', 'BD-D', 'BD-E'), // 사무드라굽타 정복 전
  B(510, 543, E_UP320.서부), // 510년 무렵 훈족 침입 뒤 굽타가 잃은 갠지스 평원 서·중부: 마우카리 독립(550) 전 경계 불명
  B(543, 550, E_UP543.오우드, E_UP543.로힐칸드, E_UP543.하부도아브, E_UP543.바라나시, E_UP543.고라크푸르, E_BR543.마가다, E_JH543.앙가), // 굽타 끝 뒤 마우카리·후기 굽타 독립 전
  B(543, 606, E_UP543.분델칸드, E_UP543.상부도아브, E_BR543.나머지), B(543, 750, E_JH543.나머지), // 분델칸드·상부 도아브·비하르 북부와 서부·초타나그푸르: 굽타 뒤 경계 불명
  B(647, 711, E_UP543.오우드, E_UP543.로힐칸드, E_UP543.하부도아브, E_UP543.바라나시, E_UP543.고라크푸르, E_UP543.분델칸드, E_UP543.상부도아브), V(711, 750, 'IN-UP'), B(647, 750, E_BR543.나머지), // 하르샤 뒤 카나우지(아루나슈바·야쇼바르만 등 경계 불명)
  B(543, 600, E_WB320.벵골, E_BDF.나머지), B(637, 750, E_WB320.벵골, E_BDF.나머지), V(543, 600, 'BD-E'), V(637, 750, 'BD-E'), // 굽타 뒤·샤샹카 뒤 벵골(마츠야니아야, 기본값 D29)
  B(543, 640, E_WB320.카마루파서, E_BDF.카마루파서), V(543, 1096, 'BD-A', 'BD-C', 'BD-D'), // 카마루파 서쪽 확장 전, 남·동벵골(기본값 D26)
  B(320, 350, E_AS320.골짜기), B(320, 1157, E_AS320.두아르, E_AS320.카차르), // 아삼 두아르·카차르·카르비 구릉: 부족 땅
  B(320, 464, E_NPL.리차비), B(320, 1090, E_NPL.나머지), B(880, 1090, E_NPL.리차비), // 네팔: 리차비 첫 비문 전, 리차비 밖 산지·테라이 소국, 타쿠리(1만 km² 미만, 기본값 D27)
  // ─ 기간 2 ─
  // ─ 기간 3 ─
  V(750, 816, 'IN-UP'), B(1019, 1090, E_UP973.나머지), B(1090, 1197, E_UP1090.로힐칸드), B(1090, 1193, E_UP1090.상부도아브), // 카나우지의 아유다 왕조(경계 불명, 기본값 D23)·1018년 가즈니 약탈 뒤 카나우지(기본값 D30)·가하다발라 밖 로힐칸드·상부 도아브 소국
  V(750, 770, 'IN-BR', 'IN-JH'), V(1144, S4_END, 'IN-JH'), B(1162, 1200, E_BR973.푸르니아, E_BR973.남비하르), B(1194, 1200, E_BR973.샤르키), B(1097, 1200, E_BR973.사란), // 팔라의 비하르 정복 전, 팔라가 물러난 뒤 초타나그푸르(나그반시 등 부족 땅), 팔라·가하다발라가 끝난 뒤 구르 왕조 정복 전 비하르, 미틸라를 잃은 팔라 본토와 떨어진 사란·참파란(경계 불명)
  B(973, S4_END, E_WB973.칼림퐁), B(1141, S4_END, E_WB973.서두아르, E_WB973.코치, E_BDF.카마루파서), B(1205, S4_END, E_BDF.나머지), // 산기슭 부족 땅, 카마루파가 끊긴 뒤 북벵골·서아삼 소국(sultanate.mjs 1206년 비움과 이음)
  V(750, S4_END, 'BD-B', 'BD-G'), // 치타공·코밀라(하리켈라·사마타타)·실헤트: 찬드라 등 경계를 알 수 없는 왕조(기본값 D26)
  V(711, 736, 'IN-OR'), B(736, 940, E_OR711.삼발푸르, E_OR711.토후국), B(736, 1100, E_OR711.마유르반즈), B(736, 1078, E_OR711.코라푸트), // 바우마카라 전 오리사, 바우마카라 밖 서오리사 내륙(샤라바푸리야·판두방시 쪽 경계 불명), 마유르반즈 성립 전,
  //   코라푸트 산지(날라·친다카 나가 등 산지 왕조 땅 — 바우마카라·소마바시 비문 없음, 동부 강가 남부 정복 전)
  V(750, 871, 'IN-CT'), B(871, S4_END, E_CT871.바스타르), B(871, 1000, E_CT871.수르구자, E_CT871.북부토후국), B(871, 940, E_CT871.평지), // 다크시나 코살라(판두방시 뒤 경계 불명)·바스타르(나가 왕조 등 1만 km² 안팎, sultanate.mjs 1206년 비움과 이음)
  V(750, S4_END, 'IN-UT'), // 우타라칸드: 카튜리 왕조(7~11세기, 경계 불명)와 그 뒤 소국들(쿠마온 찬드 왕조가 쿠마온 대부분을 다스린 것은 15세기 — 위키 Kumaon Kingdom)
  V(1090, S4_END, ...E_NP.filter((id) => !['NP-KA', 'NP-SE', 'NP-MA'].includes(id))), V(1090, 1100, 'NP-KA', 'NP-SE', 'NP-MA'), // 네팔: 타쿠리·말라 골짜기 왕국(1만 km² 미만)과 산지 소국, 카사 말라 전 서부
  B(1141, 1157, E_AS320.골짜기), V(1157, S4_END, 'IN-AS'), // 카마루파가 끊긴 뒤 아삼 소국들(카마타·아홈 전, sultanate.mjs 1206년 비움과 이음)
  V(750, S4_END, 'IN-ML', 'IN-NL', 'IN-MZ', 'IN-TR', 'IN-AN', 'IN-SK', 'IN-AR', ...E_BT), V(750, 1110, 'IN-MN'), // 북동 산지·시킴·부탄·안다만: 부족 땅(기본값 D28), 마니푸르 성립 전
  // ── S4 동 끝 ──
  // ── S4 남 ──
  // ─ 기간 1 ─
  V(S4_START, -499, 'IN-MP', 'IN-MH', 'IN-KA', 'IN-GA', 'IN-TG', 'IN-AP', 'IN-TN', 'IN-KL', ...S_LK), // 기원전 800~501년: 경계 사료가 후대 불전·푸라나 열거뿐(결정 1)
  B(-499, -320, S_MP1.나머지), B(-499, -344, S_MP1.서부, S_MP1.북부), // 체디·다할라 등 16대국 열거에만 나오는 땅(경계 사료 없음), 난다 전 아반티 밖 중부 인도
  B(-499, -296, S_MH1.나머지, S_KA1.북부, S_TG1.나머지, S_AP.벵기, S_AP.군투르, S_AP.넬로르, S_AP.북부), // 아스마카 밖 데칸: 마우리아 빈두사라 전 주인 불명
  B(-320, -296, S_MH1.아스마카, S_TG1.아스마카, S_MP2.남동), // 난다 뒤 빈두사라 전 데칸(주인 불명)
  B(-499, -260, S_AP.북칼링가), // 아소카의 칼링가 정복 전 칼링가 남부
  B(-499, -184, S_KA1.남부), // 북위 14.3° 남쪽 카르나타카: 마우리아 밖(경계 사료 없음)
  B(-184, -99, S_MH2.서북, S_MH2.베라르, S_MH2.나그푸르, S_MH2.마라트와다, S_MH2.나머지, S_TG1.아스마카, S_TG1.나머지, 'IN-GA'), // 마우리아 뒤 데칸: 주인 불명(결정 10)
  B(-184, 124, S_KA2.바나바시, S_KA2.벨가움, S_KA2.북부, S_AP.벵기, S_AP.군투르, S_AP.넬로르, S_AP.북부), // 마우리아 뒤 카르나타카·안드라: 사타바하나가 오기 전 주인 불명(결정 10)
  B(-184, 350, S_KA2.강가바디), // 서 강가 전 남카르나타카(경계 사료 없음)
  B(-184, 543, S_KA2.나머지), // 카르나타카 중남부: 바다미 찰루키아 전 주인 불명
  B(-99, -69, S_MP2.서부, S_MH2.베라르, S_MH2.나그푸르), // 슝가 뒤 말와·비다르바: 사타카르니 1세 전 주인 불명
  B(-99, 350, S_MP2.북부), // 슝가 뒤 나르마다 북: 나가 등 소국(경계 사료 없음)
  B(-184, 270, S_MP2.남동), // 사트푸라·곤드 땅: 바카타카 전 주인 불명
  B(-517, 340, S_TN.톤다이), B(-517, 575, S_TN.북부), B(-517, 871, S_TN.나머지), // 상감 세 나라 밖 타밀 북부·중부(D31)
  B(-499, -259, S_TN.칸야쿠마리, S_TN.판디아, S_TN.촐라, S_TN.콩구, S_KL.판디아, S_KL.트라방코르, S_KL.콩구, S_KL.나머지), // 상감 시대 앞(아소카 비문 전)
  B(-499, -249, S_LKS.북부, S_LKS.중부), B(-499, -160, S_LKS.남부), // 데바남피야 티사 전 실론(전설 시대)·두타가마니 통일 전 루후나
  B(225, 320, S_AP.벵기, S_TG1.아스마카, S_TG1.나머지), B(225, 275, S_AP.넬로르), B(225, 610, S_AP.북부), // 사타바하나 뒤 안드라·텔랑가나 내륙: 주인 불명
  B(225, 270, S_MH2.베라르, S_MH2.나그푸르), B(225, 475, S_MH2.마라트와다), B(225, 543, S_MH2.나머지, S_KA2.북부), // 사타바하나 뒤 데칸 갈림(위키: 다섯 갈래) — 1만 km² 넘는 나라가 없는 땅
  B(-499, 275, S_AP.넬로르남), B(-499, 600, S_AP.남부), // 라얄라시마 남부: 팔라바 전 주인 불명
  // ─ 기간 2 ─
  B(300, 590, S_TN.칸야쿠마리, S_TN.판디아, S_KL.판디아), B(300, 871, S_TN.촐라, S_TN.콩구), B(300, 800, S_KL.트라방코르, S_KL.콩구, S_KL.나머지), // 칼라브라 시기(300~589) 주인 불명(D31), 체라 부흥 전 케랄라
  B(336, 543, S_MH2.서북), // 아비라 뒤 나식·콘칸: 트라이쿠타카 등 1만 km² 미만
  B(320, 420, S_TG2.동남), B(320, 624, S_TG2.나머지), // 텔랑가나 내륙: 비슈누쿤딘·바다미 전 주인 불명
  B(345, 435, S_KA2.벨가움), B(540, 543, S_KA2.바나바시, S_KA2.벨가움), // 추투 뒤·카담바 끝 뒤
  B(511, 543, S_MH2.베라르, S_MH2.나그푸르, S_MH2.마라트와다), B(511, 750, S_MP2.남동), // 바카타카 끝(510) 뒤 비다르바·사트푸라: 주인 불명
  B(528, 750, S_MP2.북부), // 손다니 전투(528) 뒤 나르마다 북: 아울리카라·후기 굽타·마우카리가 다툰 땅(직접 지배 범위 불명)
  B(541, 550, S_MP2.서부), B(610, 730, S_MP2.서부), // 아울리카라 끝 뒤·칼추리 끝 뒤 말와: 주인 불명(하르샤·마이트라카·후기 굽타의 다툼)
  B(543, 566, S_DK.콘칸, S_DK.콘칸남끝, S_DK.남카르나타카), B(543, 550, S_DK.칸데시), B(543, 610, S_DK.베라르, S_DK.벨라리, S_DK.데칸), // 바다미 찰루키아가 넓히기 전 데칸
  V(225, 566, 'IN-GA'), // 고아: 1만 km² 미만 해안 소국(콘칸 마우리아)
  // ─ 기간 3 ─
  B(543, S4_END, S_DK.나그푸르북, S_DK.나그푸르남, S_MP3.베툴세오니, S_MP3.본슬레남부), // 곤드 숲(sultanate.mjs 1206과 같이 비움)
  B(750, 836, S_MP3.괄리오르북부, S_MP3.분델칸드, S_MP3.사가르), // 프라티하라 미히라 보자 전 분델칸드·괄리오르: 주인 불명
  B(750, 1015, S_MP3.나르마다, S_MP3.소하그푸르), B(750, S4_END, S_MP3.레와), // 칼추리(트리푸리) 강게야데바 전 다할라·바겔칸드(1만 km² 넘는 나라로 그릴 사료 부족)
  B(1189, S4_END, S_DK.콘칸), V(1189, S4_END, 'IN-GA'), // 서 찰루키아 끝 뒤 콘칸·고아: 실라하라·카담바 소국(각 1만 km² 미만, 1206과 같이 비움)
  B(-184, 1078, S_AP.북칼링가), // 북칼링가: 초기 동 강가(칼링가나가라)는 이 항목 전이라 비움(장부 후보)
  B(1103, S4_END, S_KL.판디아, S_KL.트라방코르, S_KL.콩구, S_KL.나머지), // 체라 끝(1102) 뒤 케랄라: 베나드·코친 등 소국(1206과 같이 비움)
  V(S4_START, S4_END, 'IN-PY', 'IN-LD', 'MDV-5234'), // 퐁디셰리·락샤드위프·몰디브: 1,000 km² 미만 조각
  // ── S4 남 끝 ──
];
void V; void B; void S3_CUTS; void S2_CUTS; void S1_CUTS; // 칸이 비어 있는 뼈대에서 쓰지 않는 이름 경고 막기(칸을 채우면 지워도 됨)

export const era = {
  name: 'ancient',
  versions,
  gapZones,
  voids,
};
