// southeast-asia 시대 파일 ancient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1292 이전: 남월·교지 독립기(응오·딘·전 레·리·쩐)·임읍·참파·부남·첸라·크메르·바간·라보·수코타이·란나·스리비자야·마타람·케디리·싱하사리 (E4, docs/southeast-asia/00-scope.md 2절 시대 단계 표)
// 짝 항목 파일: data/entities/southeast-asia-ancient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia/의 다른 도우미 모듈. areas/southeast-asia.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/southeast-asia/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/southeast-asia.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다). 이 파일은 가장 앞(과거) 시대라 joinEras 목록 맨 앞에 둔다.
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 동남아 E4 짜임 안내 (E4 뼈대 2026-11-09 — 근거: docs/southeast-asia/00-scope.md 2·3·5·10절, 0단계 결정 1~10·기본값 30건, E4 창구 ② 결정 Q1~Q8(se5/decisions.md), 지시문 e4/COMMON.md) ─────
// 짜임은 E3 시대 파일 early-modern.mjs와 같다(도우미·공통 줄·권역 밖 땅을 옮김). 다른 점: 해가 E4_START(천문 −203 = 기원전 204년, 남월 건국)~E4_END(1293, 미포함), 빈 땅 검사 구역 이름이 '동남아 고대 Y~Y',
//   칸이 셋(VC·SK·BI — 지리 칸)이다. 해는 천문 연도(기원전 N년 = 1−N): 남월 기원전 204~112년 = 천문 −203~−111.
// 등급(00-scope 3절): 일반이 기본(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km).
//   '주변'은 data/tests/zones.yaml의 두 구역(new-guinea-interior·borneo-interior) 안에서만: 땅 5만 km², 선 평균 25/최대 50 km.
// 해 규칙: 한 버전 = 그해 말 모습, 조약이 있으면 그 해, 없으면 실효 지배가 굳은 해. 원정·되돌려진 점령은 칠하지 않음(참파의 앙코르 1177~1181, 크메르의 참파 1145~1149·1190~1220,
//   남조의 쀼 약탈, 몽골·원의 원정 1257~1288, 남한의 안남 점령 930~931, 촐라의 스리비자야 원정 1025·1068 — E4 기본값). 새 버전은 1만 km²(주변 5만 km²) 넘게 바뀔 때만.
//   조공국·종속 소국 땅은 종주 색으로 칠하지 않는다(결정 10 — 그 나라 항목이 있으면 그것, 없으면 비움). 학설이 갈리는 나라(쀼·드바라바티·전 리 왕조)는 땅 없는 항목(창구 ② Q2·Q4).
// 칸 나눔(부딪침 막기): 칸 경계는 조각 경계(cuts-e4.mjs E4_*_IDS)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리('// ── E4 VC …'·SK·BI)와 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·voids 함수·OUTSIDE 모두). 최상위 이름은 칸 앞머리 VC_·SK_·BI_, import도 별칭(예: BI_PROME), ownSplit 묶음 이름도 앞머리(예: 'VC_교지').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·권역 밖 땅·빈 땅 검사 구역)은 고치지 않는다(바꿔야 하면 결과 노트 6절). 자기 몫이 아닌 조각에는 줄을 적지 않는다(fillTables가 주인 null로 채움).
//   다른 칸 항목을 주인으로 쓰는 것은 된다(글은 정의 칸, 문안은 결과 노트 9절).
// 표 경계 해: 칸마다 <칸>_BOUNDS(칸이 사료로 더함)를 공통 BOUNDS가 합친다(E4_START·E4_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다
//   — 주인만 바뀌는 해는 BOUNDS에 없어도 되고, ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다.
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 E4_START(−203)부터, 해는 늘어난다. 단위마다 여러 번 이어 적을 수 있다(뒤 줄 첫 해가 앞 줄의 마지막 해보다 뒤).
//   줄을 적지 않은 단위는 fillTables가 시대 내내 주인 null로 채운다. 주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(voids에 한 줄, 이유는 줄 주석)이거나 다른 도형이 덮는 땅
//   (중국 쪽 교지 — 진·한·위진남북조·수·당 손 도형이 덮으므로 voids에 넣지 않음, 결정 9).
// 1292 끝 모양: 이 시대 마지막 해(1292)의 모양은 E3 early-modern.mjs의 1293 첫 버전과 같은 조각·같은 주인이어야 한다(점프 0 — e4/skel/own1293.tsv·SKEL-NOTE 3절 표).
//   결정이 만든 점프만 예외(스리비자야 수마트라 네 조각 1293 비움 — 창구 ② Q8). 같은 id(pagan-empire·khmer-empire·tran-dynasty·champa·lan-na·sunda-kingdom 등)를 1292까지 칠하면
//   joinEras가 early-modern.mjs의 1293~ 버전 앞에 붙인다(1293년에 버전이 한 번 나뉨 — 도형이 같으면 넓이 변화 0).
// 앞 권역 나라 늘리기: 이 시대에는 없다. 중국 왕조(western-han·tang·song 등)·남아시아 나라를 주인으로 쓰면 생성기가 멈춘다.
// 권역 밖 땅(early-modern.mjs와 같은 장치 — E4 창구 ② Q1 남월의 광둥·광시): 칸 머리 <칸>_OUTSIDE = [[from, to(미포함), 나라 id, 도형], …]. 공통 줄이 그 나라 버전(조각 땅에서 다른 도형을 뺀 뒤)에 합친다.
//   도형은 이웃 권역 도형에서 도우미 모듈이 찾아 만든다(cuts-e4.mjs VC_NANYUE_CN — 좌표 베끼기 금지, 그해 중국 쪽 도형과 겹치지 않게 이미 뺌). 이웃 권역 파일은 고치지 않는다. 빈 땅 검사 구역에는 들어가지 않는다.
// 다른 도형 빼기는 공통 줄이 한다: 버전을 만들 때 prev.mjs의 prevPieces가 해 구간마다 돌려주는 도형(중국 쪽 교지·윈난 띠·남한·송 부스러기·티베트·몽골·원 띠 — E4 뼈대 측정 e4/skel/prev-overlap.txt)을
//   그 나라 땅에서 뺀다. 칸은 빼지 않는다(조각 통째로 적어도 겹침 0 — 예: 리 왕조가 통킹 조각 통째를 칠해도 송 154 km² 부스러기는 공통 줄이 뺌, 결정 9·F5).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(동남아 첫판·E1~E3·사건 se-05·se-06·E4 칸 머리)을 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, SE_SOURCE_TEXT, idsOf, minus, tableKit } from './table.mjs';
import { deg2, prevPieces } from './prev.mjs';
import { E4_VC_IDS, E4_SK_IDS, E4_BI_IDS } from './cuts-e4.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('ancient');

const E4_START = -203; // 이 시대 파일의 첫 해(천문 −203 = 기원전 204년 말 모습 — 남월 건국, 창구 ② 기본값). 그 앞(청동기)은 땅 없는 항목 southeast-asia-bronze-age와 사건 글만
const E4_END = 1293; // 마지막 표의 끝(미포함) — 1293년부터는 E3 시대 파일 early-modern.mjs

// ── 조각 소유표 도우미 (early-modern.mjs와 같은 꼴 — E4 뼈대가 옮김) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < E4_START || e[0] >= E4_END)) {
    throw new Error(`southeast-asia ancient: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${E4_START} 이상 ${E4_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`southeast-asia ancient: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = E4_START, to = E4_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`southeast-asia ancient: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`southeast-asia ancient: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`southeast-asia ancient: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`southeast-asia ancient: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`southeast-asia ancient: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형]. 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];

// ── E4 VC 베트남 북·중부·참파 (조각 E4_VC_IDS: 베트남 44 — 메콩 삼각주 19는 SK, 구현 E4-VC): 칼선 import·상수·own 줄·voids·OUTSIDE는 이 아래에, 최상위 이름은 VC_ ──
// 항목: southeast-asia-bronze-age(땅 없음)·nanyue·early-ly-dynasty(땅 없음 — Q2)·khuc-clan·ngo-dynasty·dinh-dynasty·early-le-dynasty·ly-dynasty(새 — 이 칸 글, 짝 파일 southeast-asia-ancient.yaml),
//   tran-dynasty·champa(E3 항목을 같은 id로 1225·192~1292 — 이 칸 글, southeast-asia-early-modern.yaml)
// E4 창구 ② Q1(남월 — 베트남 쪽은 중국 쪽 서한 −110 선 안, 광둥·광시는 VC_OUTSIDE 권역 밖 땅)·Q2(전 리 544~601 땅 없음)·Q3(쿡씨 907~937 칠함)·결정 9(교지는 중국 도형 그대로)
// 중국 쪽 교지 선·남월 권역 밖 땅: cuts-e4.mjs VC_JIAO_HAN·VC_JIAO_TANG·VC_NANYUE_CN(뼈대). 1292 끝 모양 = E3 1293(쩐 29조각·참파 10조각, 중부 고원 5조각 비움)
// 표 경계 해: 907(당 멸망 — 타인호아~하띤은 조각 통째로, 통킹만 중국 쪽 선으로 나눔)·1009(리 왕조 — 북서 산지까지 통째로 칠함, 기본값 DA11). 그 밖의 해는 조각 경계라 주인만 바뀜
import { VC_JIAO_HAN, VC_NANYUE_CN } from './cuts-e4.mjs';
const VC_BOUNDS = [907, 1009];
// 권역 밖 땅(창구 ② Q1): 남월의 광둥·광시(중국 권역 조각 CN-GD·CN-GX에서 그해 서한 몫을 뺀 것 — 하이난 CN-HI는 비움). 천문 −203~−111(기원전 204~112년), 기원전 111년 한의 정복으로 끝
const VC_OUTSIDE = [[-203, -110, 'nanyue', VC_NANYUE_CN]];
// 조각 묶음(합 44 = E4_VC_IDS). 통킹·타인호아~하띤은 E2·E3 VT 칸 목록과 같은 조각(1292 모양이 E3 1293 쩐 왕조 모양과 이어지게 — 그 목록 상수는 export되지 않아 다시 적음)
const VC_TONKIN = ['VN-01', 'VN-02', 'VN-03', 'VN-04', 'VN-05', 'VN-06', 'VN-07', 'VN-09', 'VN-13', 'VN-14', 'VN-18', 'VN-20', 'VN-53', 'VN-54', 'VN-56', 'VN-61', 'VN-63', 'VN-66', 'VN-67', 'VN-68', 'VN-69', 'VN-70', 'VN-71', 'VN-HN', 'VN-HP']; // 통킹 25(까오방·랑선 포함)
const VC_THANH_NGHE = ['VN-21', 'VN-22', 'VN-23']; // 타인호아·응에안·하띤(한의 구진군·일남군 북부 — 중국 쪽 선은 타인호아 바닷가까지만 덮음)
const VC_JIAO = [...VC_TONKIN, ...VC_THANH_NGHE]; // 교지 28(중국 쪽 교지·구진 땅)
const VC_QUANG_BINH = ['VN-24']; // 꽝빈(1069 리 왕조가 참파에게서 얻은 지리·마링·보찐 세 현 — 한 조각으로 어림, DA12)
const VC_THUAN_HOA = ['VN-25', 'VN-26']; // 꽝찌·트어티엔후에 = 투언화(임읍의 발상지 쪽 — 한의 상림현 북쪽)
const VC_QUANG = ['VN-27', 'VN-DN', 'VN-29', 'VN-31']; // 꽝남·다낭·꽝응아이·빈딘 = 참파의 아마라바티(미선·인드라푸라)·비자야
const VC_SOUTH = ['VN-32', 'VN-34', 'VN-36', 'VN-40']; // 푸옌·카인호아·닌투언·빈투언 = 카우타라·판두랑가
const VC_HIGHLANDS = ['VN-28', 'VN-30', 'VN-33', 'VN-35', 'VN-72']; // 중부 고원(꼰뚬·자라이·다를락·럼동·닥농)
{
  const all = [VC_JIAO, VC_QUANG_BINH, VC_THUAN_HOA, VC_QUANG, VC_SOUTH, VC_HIGHLANDS].flat();
  if (all.length !== E4_VC_IDS.length || new Set(all).size !== all.length || all.some((id) => !E4_VC_IDS.includes(id))) throw new Error('southeast-asia ancient VC: 조각 목록이 E4_VC_IDS와 다름');
}
// 교지 28(−203~906): 중국 쪽 교지 선(VC_JIAO_HAN — 서한 −110 선 = 당 751~906 선, 뼈대)으로 나눔. 이 선은 통킹 평야와 타인호아 바닷가까지만 덮는다(빈·하띤은 선 밖 — 기준 도시로 확인).
//   안(88,402 km²): −178 남월(Q1 — 결정 문구 그대로 '서한 −110 도형이 칠한 선', 첫 해는 창구 ③ R-Q1: 기원전 179년 어우락 병합 — 위키백과 Nanyue·『사기』 남월열전.
//     그 앞 −203~−179는 아래 voids — 어우락은 전설과 섞인 나라라 땅을 그리지 않음) · −110 주인 null(서한·신·후한·오·진·남조·수·당 손 도형이 덮음 — 결정 9, voids 아님. 중국 쪽이 비운 24·220~221은 아래 voids).
//     544~602 전 리 왕조는 땅 없는 항목(Q2 — 같은 해 양·진·수 도형이 덮음)
//   밖(북서 산지 약 3.3만 + 타인호아 서쪽·응에안·하띤 약 2.8만 km²): 906까지 주인 null(아래 voids — 중국 쪽 도형이 그리지 않은 땅)
ownSplit('VC_교지', VC_JIAO, [['안', VC_JIAO_HAN]], '밖', {
  안: [[-203, null], [-178, 'nanyue'], [-110, null]],
  밖: [[-203, null]],
}, { from: E4_START, to: 907 });
// 통킹 25(907~1008): 같은 선으로 나눔. 안: 907 쿡씨(Q3 — 당 멸망 뒤 정해군 절도사 집안의 자치, 930~931 남한 점령은 되돌려진 점령이라 칠하지 않음) · 938 응오 왕조(DA13 — 938년 말 박당강 승리)
//     · 968 딘 왕조 · 980 전 레 왕조. 밖(북서 산지 약 3.3만 km² — 라이쩌우·디엔비엔·선라·호아빈·라오까이 쪽): 1008까지 주인 null(아래 voids — 직접 다스린 근거가 없는 토착 수령 땅, DA11)
ownSplit('VC_통킹', VC_TONKIN, [['안', VC_JIAO_HAN]], '밖', {
  안: [[907, 'khuc-clan'], [938, 'ngo-dynasty'], [968, 'dinh-dynasty'], [980, 'early-le-dynasty']],
  밖: [[907, null]],
}, { from: 907, to: 1009 });
// 타인호아·응에안·하띤(907~): 조각 통째 — 정해군(당의 안남)의 애주·환주·연주는 쿡씨·응오~전 레가 다스린 땅(즈엉딘응에·레호안이 애주 사람). 중국 쪽 선으로 자르면
//   응에안·하띤 약 2.8만 km²가 1008까지 비었다가 1009에 나타나(1만~5만 km², 100년) 끝 기준 2에 걸려 조각 통째로 칠함(결과 노트 2절). 1009 리 왕조, 1225 쩐 왕조
own(VC_THANH_NGHE, [[907, 'khuc-clan'], [938, 'ngo-dynasty'], [968, 'dinh-dynasty'], [980, 'early-le-dynasty'], [1009, 'ly-dynasty'], [1225, 'tran-dynasty']]);
// 1009부터 통킹 25 통째: 리 왕조(DA11 — 북서 산지의 타이족 수령도 대월에 딸린 땅으로 E3 쩐 왕조 1293 모양과 같게), 1225 쩐 왕조(리 왕조의 왕위를 넘겨받음)
own(VC_TONKIN, [[1009, 'ly-dynasty'], [1225, 'tran-dynasty']]);
// 꽝빈: 192 참파(임읍 — 북쪽 끝을 호안선(횡산) 아래 꽝빈까지로 봄, 8,405 km²), 1069 리 왕조(리 타인 똥의 참파 원정 뒤 루드라바르만 3세가 지리·마링·보찐 세 현을 넘김), 1225 쩐 왕조
own(VC_QUANG_BINH, [[-203, null], [192, 'champa'], [1069, 'ly-dynasty'], [1225, 'tran-dynasty']]);
// 투언화·꽝남~빈딘: 192 참파(임읍 — 한의 일남군 상림현에서 구련이 자립. 상림현은 지금 꽝남 쪽이라 꽝남~빈딘도 192부터, 미선 성지는 4세기 말 바드라바르만)
own([...VC_THUAN_HOA, ...VC_QUANG], [[-203, null], [192, 'champa']]);
// 푸옌~빈투언: 758 참파(남쪽 카우타라·판두랑가 왕가가 중심이 되어 중국 사서의 이름이 환왕으로 바뀐 해 — 포나가르 비문 774·784). 그 앞은 북쪽 임읍과 하나의 나라로 그린 근거가 약해 비움
own(VC_SOUTH, [[-203, null], [758, 'champa']]);
// 중부 고원: 비움(저지 왕국의 직접 지배 밖 — E3 1293~ 비움과 이음)
own(VC_HIGHLANDS, [[-203, null]]);
// 비운 땅(이유는 줄마다)
const VC_voids = () => [
  B(E4_START, -178, 'VC_교지/안'), // 홍강 유역 — 남월이 어우락을 아우른 기원전 179년(천문 −178) 앞. 어우락은 전설과 섞인 나라라 땅을 그리지 않음(창구 ③ R-Q1)
  B(24, 25, 'VC_교지/안'), // 신이 망하고(23) 후한이 서기 전 한 해 — 중국 쪽 도형이 비운 해(DA4, 1년)
  B(220, 222, 'VC_교지/안'), // 후한이 끝나고(220) 오가 교주를 차지하기 전 두 해 — 중국 쪽 도형이 비운 해(DA4)
  B(E4_START, 907, 'VC_교지/밖'), // 북서 산지·타인호아 서쪽·응에안·하띤 — 중국 쪽 교지 선 밖(남월은 Q1 결정대로 선 안만, 중국 왕조 도형은 바이트 그대로)
  B(907, 1009, 'VC_통킹/밖'), // 북서 산지 — 쿡씨~전 레의 직접 지배 근거가 없는 토착 수령 땅(1009 리 왕조부터 칠함 — DA11)
  V(E4_START, 192, ...VC_QUANG_BINH, ...VC_THUAN_HOA, ...VC_QUANG), // 꽝빈~빈딘 — 임읍 앞. 기원전 111년부터는 한의 일남군 남부이나 중국 쪽 도형이 북위 18° 언저리까지만 그려 비움(조사 R-A 2-3)
  V(E4_START, 758, ...VC_SOUTH), // 푸옌~빈투언 — 환왕(758) 앞의 남쪽 참족 나라들, 하나의 나라 경계를 그릴 근거가 약함
  V(E4_START, E4_END, ...VC_HIGHLANDS), // 중부 고원 — 고원 사람들의 땅(E3 1293~ 비움과 이음)
];
// ── E4 VC 끝 ──

// ── E4 SK 타이·캄보디아·라오·메콩 삼각주 (조각 E4_SK_IDS: 타이 77·캄보디아 24·라오스 17·베트남 메콩 삼각주 19, 구현 E4-SK): 최상위 이름은 SK_ ──
// 항목: funan·chenla·land-chenla·water-chenla·dvaravati(땅 없음 — Q4)·hariphunchai(새 — 이 칸 글, southeast-asia-ancient.yaml),
//   khmer-empire·lavo-kingdom·sukhothai-kingdom(E3 항목을 같은 id로 802·648·1238~1292 — 이 칸 글, southeast-asia-early-modern.yaml), lan-na(E2 항목 첫 버전 1293→1292 — 이 칸 글, southeast-asia-colonial.yaml)
// E4 창구 ② Q4(드바라바티 땅 없음)·Q5(부남·첸라 핵심만)·Q7(라보 648~1292 한 색 + 크메르 종속 관계). 1292 끝 모양 = E3 1293(크메르 56조각·라보 26·수코타이 9·란나 8, 타이 남부·파타니·라오스 북부·이산 북부·라타나키리 비움)
// 새 칼선 없음: 부남·첸라·육진랍·수진랍·크메르·라보·수코타이·하리푼차이·란나 사이 경계는 사료가 지금 주 경계보다 촘촘하지 않아 조각 통째로 묶음(주인만 바뀌는 해라 표 경계 해도 없음)
const SK_BOUNDS = [];
const SK_OUTSIDE = [];
// 조각 묶음(합 137 — 아래 확인). E3 SC·LO·VT 칸 목록과 같은 조각(early-modern.mjs의 목록 상수는 export되지 않아 id만 다시 적음 — 1292년 모양이 E3 1293년 모양과 이어지게)
const SK_DELTA = ['VN-37', 'VN-39', 'VN-41', 'VN-43', 'VN-46', 'VN-57', 'VN-58', 'VN-SG', // 메콩 삼각주 동쪽(E3 VT_COCHIN_E)
  'VN-44', 'VN-47', 'VN-49', 'VN-50', 'VN-51', 'VN-52', 'VN-55', 'VN-59', 'VN-73', 'VN-CT', 'VN-45']; // 메콩 삼각주 서쪽·동탑(E3 VT_COCHIN_W)
// 남부 캄보디아(부남 핵심 — 따께오의 앙코르보레이·깜뽓·껩·깐달·프놈펜·쁘레이벵·스바이리엥)
const SK_KH_SOUTH = ['KH-21', 'KH-7', 'KH-23', 'KH-8', 'KH-12', 'KH-14', 'KH-20'];
// 캄보디아 북·중부 15(첸라·육진랍 — 반띠어이민쩨이·바탐방·껌퐁짬·껌퐁츠낭·껌퐁스푸·껌퐁톰·꺼꽁·끄라쩨·몬돌끼리·프레아비히어·뽀삿·시엠레아프·시하누크빌·오다르민쩨이·파일린).
//   꺼꽁·시하누크빌·몬돌끼리 같은 변두리도 통째로 넣음(첸라의 직접 지배가 닿았는지 알 수 없는 어림 — 결과 노트 7절)
const SK_KH_NORTH = ['KH-1', 'KH-2', 'KH-3', 'KH-4', 'KH-5', 'KH-6', 'KH-9', 'KH-10', 'KH-11', 'KH-13', 'KH-15', 'KH-17', 'KH-18', 'KH-22', 'KH-24'];
const SK_WAT_PHU = ['KH-19', 'LA-CH']; // 스퉁트렝·참파삭(왓푸 — 첸라 때부터 크메르 왕실의 성지)
const SK_RATANAKIRI = ['KH-16']; // 라타나키리(내내 비움 — E3 LO 하라오 비움과 이음)
const SK_LAO = minus(idsOf('LAO'), 'LA-CH'); // 라오스 나머지 16(내내 비움 — 라오 무앙들, E3 1293~1352·1356 비움과 이음)
const SK_ISAN_S = ['TH-30', 'TH-31', 'TH-32', 'TH-33', 'TH-36', 'TH-40', // 코랏 고원 서남(나콘랏차시마·부리람·수린·시사껫·차이야품·콘깬 — E3 LO_SIAM)
  'TH-34', 'TH-35', 'TH-37', 'TH-49', 'TH-45', 'TH-44', 'TH-46']; // 이산 동남(우본·야소톤·암낫짜런·묵다한·로이엣·마하사라캄·깔라신 — E3 LO_CP_RIGHT)
const SK_ISAN_N = ['TH-42', 'TH-43', 'TH-38', 'TH-41', 'TH-39', 'TH-47', 'TH-48']; // 이산 북부(러이·농카이·븡깐·우돈타니·농부아람푸·사꼰나콘·나콘파놈 — 내내 비움, E3 LO_VT_RIGHT)
const SK_LAVO = ['TH-10', 'TH-11', 'TH-12', 'TH-13', 'TH-14', 'TH-15', 'TH-16', 'TH-17', 'TH-18', 'TH-19', 'TH-20', 'TH-21', 'TH-22', 'TH-23', 'TH-24', 'TH-25', 'TH-26', 'TH-27',
  'TH-70', 'TH-71', 'TH-72', 'TH-73', 'TH-74', 'TH-75', 'TH-76', 'TH-77']; // 중부 평야·동부 해안·서부(E3 SC_CENTRAL)
const SK_SUKHOTHAI = ['TH-53', 'TH-60', 'TH-61', 'TH-62', 'TH-63', 'TH-64', 'TH-65', 'TH-66', 'TH-67']; // 북중부 아홉 도(E3 SC_NORTH_CENTRAL)
const SK_HARIPHUNCHAI = ['TH-50', 'TH-51']; // 치앙마이·람푼(핑강 골짜기)
const SK_LANNA_REST = ['TH-52', 'TH-54', 'TH-55', 'TH-56', 'TH-57', 'TH-58']; // 람빵·프래·난·파야오·치앙라이·매홍손(E3 SC_LANNA 나머지)
const SK_SOUTH = ['TH-80', 'TH-81', 'TH-82', 'TH-83', 'TH-84', 'TH-85', 'TH-86', 'TH-90', 'TH-91', 'TH-92', 'TH-93', 'TH-94', 'TH-95', 'TH-96']; // 타이 남부 14(E3 SC_SOUTH·SC_PATANI)
{
  const all = [SK_DELTA, SK_KH_SOUTH, SK_KH_NORTH, SK_WAT_PHU, SK_RATANAKIRI, SK_LAO, SK_ISAN_S, SK_ISAN_N, SK_LAVO, SK_SUKHOTHAI, SK_HARIPHUNCHAI, SK_LANNA_REST, SK_SOUTH].flat();
  if (all.length !== E4_SK_IDS.length || new Set(all).size !== all.length || all.some((id) => !E4_SK_IDS.includes(id))) throw new Error('southeast-asia ancient: SK 칸 조각 묶음이 E4_SK_IDS와 다름');
}
// 부남 핵심(창구 ② Q5): 50 부남(위키백과 Funan 정보상자 — 68년 설도 있음, 기본값 30으로 50), 627 첸라가 부남을 아우름(이샤나바르만 1세 때 — 위키백과 Chenla),
//   706 첸라가 육진랍·수진랍으로 나뉨(『신당서』 진랍전 '신룡 뒤'), 802 자야바르만 2세가 크메르 제국을 세움(수진랍 쪽 남부도 이때 합침으로 봄 — 790 무렵 자와 쪽 종속은 글만)
own([...SK_DELTA, ...SK_KH_SOUTH], [[E4_START, null], [50, 'funan'], [627, 'chenla'], [706, 'water-chenla'], [802, 'khmer-empire']]);
// 첸라 북·중부(창구 ② Q5): 550 무렵 부남에 딸린 첸라가 일어섬(바바바르만 1세 — 『수서』 진랍전 '본디 부남의 속국'), 706 육진랍, 802 크메르 제국
//   (뼈대가 고친 기본값 — 스퉁트렝·참파삭(왓푸)도 802부터 크메르. 조사 R-A 1-2의 '1002에 더함'은 첸라·육진랍·E3 1293과 끊김)
own([...SK_KH_NORTH, ...SK_WAT_PHU], [[E4_START, null], [550, 'chenla'], [706, 'land-chenla'], [802, 'khmer-empire']]);
// 이산 남부(창구 ③ R-Q2 — 기본값 DA8의 1002를 앞당김): 944 라젠드라바르만 2세 즉위(위키백과 Phimai Historical Park '944~968 크메르의 지배가 동북 타이로 퍼짐',
//   Phanom Rung Historical Park '10~13세기 부왕의 중심지'). 13도가 모두 944에 들었는지는 어림(E3 1293 13도와 같은 어림). 그 앞은 한 왕권의 직접 지배 근거가 약해 비움
own(SK_ISAN_S, [[E4_START, null], [944, 'khmer-empire']]);
// 라보(창구 ② Q7): 648 건국 전승부터 1292까지 한 색 — 크메르 종속 946~1052·1181~1218은 관계 줄(드바라바티는 땅 없는 항목)
own(SK_LAVO, [[E4_START, null], [648, 'lavo-kingdom']]);
// 수코타이(R-A 1-3): 1238 시인트라팃이 크메르 총독을 몰아냄 — 그 앞 크메르 전초(수코타이·시사차날라이)는 직접 지배 근거가 약해 비움
own(SK_SUKHOTHAI, [[E4_START, null], [1238, 'sukhothai-kingdom']]);
// 하리푼차이(기본값 DA10): 750 무렵(위키백과 Hariphunchai — 629·661 짜마테위 전승은 글), 1292 멩라이가 람푼을 차지해 란나(E2 항목 첫 버전을 1293→1292로 내림 — F1)
own(SK_HARIPHUNCHAI, [[E4_START, null], [750, 'hariphunchai'], [1292, 'lan-na']]);
// 란나 나머지 여섯 도: 1292 란나(1262 치앙라이·응언양(치앙센) 시기는 글만 — 1292 모양 = E3 1293 여덟 도, 람빵·프래·난은 직접 지배가 아닌 어림)
own(SK_LANNA_REST, [[E4_START, null], [1292, 'lan-na']]);
own([...SK_RATANAKIRI, ...SK_LAO, ...SK_ISAN_N, ...SK_SOUTH], [[E4_START, null]]);
// 비운 땅(이유는 줄마다) — 1292년 비움은 E3 1293년 비움(라오스 북·중부·하라오·라타나키리·이산 북부·타이 남부)과 이음
const SK_voids = () => [
  V(E4_START, 50, ...SK_DELTA, ...SK_KH_SOUTH), // 메콩 삼각주·남부 캄보디아: 부남 앞(사후인·옥에오 앞 시기 마을들 — 하나의 나라 근거 없음)
  V(E4_START, 550, ...SK_KH_NORTH, ...SK_WAT_PHU), // 캄보디아 북·중부·왓푸: 첸라가 일어서기 전(부남이 이 내륙을 직접 다스린 근거 없음 — Q5 핵심만)
  V(E4_START, 648, ...SK_LAVO), // 짜오프라야강 유역: 라보 앞 드바라바티 몬 도시들(느슨한 도시 모임 — Q4 땅 없는 항목)
  V(E4_START, 750, ...SK_HARIPHUNCHAI), // 핑강 골짜기: 하리푼차이 앞(629·661 짜마테위 전승은 학설 — DA10 750)
  V(E4_START, 944, ...SK_ISAN_S), // 이산 남부: 크메르 직접 지배 앞(드바라바티·첸라 계 소국과 크메르 영향권 — 창구 ③ R-Q2 944)
  V(E4_START, 1238, ...SK_SUKHOTHAI), // 북중부: 수코타이 앞(크메르 전초·타이족 무앙 — 직접 지배 근거 약함)
  V(E4_START, 1292, ...SK_LANNA_REST), // 타이 북부: 란나 앞(응언양·파야오 등 타이족 무앙들)
  V(E4_START, E4_END, ...SK_RATANAKIRI, ...SK_LAO, ...SK_ISAN_N), // 라오스·라타나키리·이산 북부: 라오 무앙들(하나의 나라 근거 없음 — E3 란쌍 앞 비움과 이음)
  V(E4_START, E4_END, ...SK_SOUTH), // 타이 남부: 탐브랄링가·랑카수카 등 항구 소국(스리비자야 종주는 학설 — E3 남부·파타니 비움과 이음)
];
// ── E4 SK 끝 ──

// ── E4 BI 버마·해양 (조각 E4_BI_IDS: 미얀마 14·말레이시아 16·싱가포르 5·브루나이 4·필리핀 118·인도네시아 33·동티모르 13, 구현 E4-BI): 최상위 이름은 BI_ ──
// 항목: pyu-city-states(땅 없음 — Q4)·arakan-kingdom·tarumanagara·mataram-kingdom·kediri-kingdom·singhasari·srivijaya(새 — 이 칸 글, southeast-asia-ancient.yaml),
//   pagan-empire·hanthawaddy-kingdom·sunda-kingdom·ternate-sultanate(E3 항목을 같은 id로 1044·1287·669·1257~1292 — southeast-asia-early-modern.yaml), kedah-perlis(E1 항목 1136~1292 — southeast-asia-modern.yaml)
// E4 창구 ② Q4(쀼·타톤 땅 없음)·Q6(바간 최대 판도 안 칠함)·Q8(스리비자야 비문 근거 네 조각 + 크다 685~1135, 끝 1292). 아라칸은 E3 early-modern.mjs BM 칸의 1293~1429 비움 줄을 지우고 같은 id로 이음(F4 — 이 칸이 그 줄도 고침)
// 1292 끝 모양 = E3 1293(바간 상버마 + 바고 북부 BM_CUT_PROME, 항따와디 하버마 + 바고 남부, 순다·트르나테·크다 그대로, 마자파힛 자리 동자와·발리는 싱하사리)
//   결정이 만든 1293 점프는 스리비자야 수마트라 네 조각(Q8)뿐 — 싱하사리 → 마자파힛은 같은 조각에 항목만 바뀜
import { BM_CUT_PROME as BI_PROME } from './cuts-e3.mjs';
// 표 경계 해: 1287~1292에만 바고를 E3와 같은 프롬·따웅우 위도선(BI_PROME)으로 나눔 — 1287 와레루의 독립으로 바고 남쪽(페구·따야와디)이 항따와디, 북쪽(프롬·따웅우)은 바간에 남음.
//   그 앞(1057~1286)은 바고 통째가 바간 땅이라 나누지 않음. 나머지는 모두 조각 통째(주인만 바뀌는 해는 표 경계가 필요 없음)
const BI_BOUNDS = [1287];
const BI_OUTSIDE = [];
const BI_IDS = new Set(E4_BI_IDS);
const BI_own = (ids, line) => {
  for (const id of ids) if (!BI_IDS.has(id)) throw new Error(`southeast-asia ancient: BI 칸 조각이 아님 ${id}`);
  own(ids, line);
};
// ── 버마 (E3 BM 칸과 같은 조각 묶음 — 1292 모양이 E3 1293 모양과 이어짐) ──
const BI_UPPER = ['MM-01', 'MM-03', 'MM-04']; // 사가잉·마궤·만달레이 = 상버마(바간·쀼 도시 베익타노·할린)
const BI_BAGO = ['MM-02']; // 바고(북쪽 프롬·따웅우 — 쀼의 스리크세트라, 남쪽 페구)
const BI_LOWER = ['MM-06', 'MM-07', 'MM-15', 'MM-13']; // 양곤·에야와디·몬·카인 = 하버마(따통·마르타반)
const BI_ARAKAN = ['MM-16']; // 라카인 = 아라칸
const BI_TENASSERIM = ['MM-05']; // 타닌타리 = 테나세림
const BI_HILLS = ['MM-11', 'MM-14']; // 카친·친 구릉
const BI_KARENNI = ['MM-12']; // 카야
const BI_SHAN = ['MM-17']; // 샨 고원
{
  const all = [...BI_UPPER, ...BI_BAGO, ...BI_LOWER, ...BI_ARAKAN, ...BI_TENASSERIM, ...BI_HILLS, ...BI_KARENNI, ...BI_SHAN];
  const mmr = idsOf('MMR');
  if (all.length !== mmr.length || new Set(all).size !== all.length || all.some((id) => !mmr.includes(id))) throw new Error('southeast-asia ancient: BI 칸 버마 묶음이 미얀마 14조각과 다름');
}
// 상버마: 쀼 도시국가(스리크세트라·베익타노·할린)는 하나의 나라가 아니라 땅 없는 항목(Q4) → 1044 아노라타 즉위로 바간(DA5 — 849 건국 전승은 글). 1287~1292도 바간(E3 1293과 같음)
BI_own(BI_UPPER, [[E4_START, null], [1044, 'pagan-empire']]);
// 바고·하버마: 1057 아노라타가 따통(타톤)을 정복해 하버마까지 바간 땅 → 1287 와레루가 마르타반에서 독립(항따와디 — 위키백과 영어판 Hanthawaddy Kingdom '1287~1539 하버마').
//   바고는 1287부터 북·남으로 나눔(북쪽 프롬·따웅우는 바간, 남쪽 페구는 항따와디 — E3 1293과 같은 선).
BI_own(BI_BAGO, [[E4_START, null], [1057, 'pagan-empire']]);
ownSplit('BI_바고', BI_BAGO, [['북', BI_PROME]], '남', { 북: [[1287, 'pagan-empire']], 남: [[1287, 'hanthawaddy-kingdom']] }, { from: 1287, to: E4_END });
BI_own(BI_LOWER, [[E4_START, null], [1057, 'pagan-empire'], [1287, 'hanthawaddy-kingdom']]);
// 아라칸: 웨탈리 찬드라 왕조가 선 370년(전승 연대 — 위키백과 영어판 Waithali 370~818)부터(DA7 788을 합치기가 메인 메모 1로 당김 — 다냐와디 전설 해는 글), 레므로·렝옛으로 도읍을 옮기며 1429까지 같은 항목(E3 BM 칸이 1293~1429를 같은 id로 이음 — F4).
//   바간에 조공한 시기(11~13세기)는 땅 그대로(결정 10)
BI_own(BI_ARAKAN, [[E4_START, null], [370, 'arakan-kingdom']]);
// 테나세림·카친·친·카야·샨: 바간의 최대 판도(조공·원정)라도 칠하지 않음(Q6 — E3 비움과 이음). 줄을 적지 않아 주인 null(아래 voids)
// ── 자와·발리 (E3 I1 칸과 같은 조각 — 1292 모양이 E3 1293 모양과 이어짐) ──
// 서자와·반튼·자카르타: 358 타루마나가라(B2 — 푸르나와르만 비문, 위키백과 영어판 Tarumanagara 358~669) → 669 순다 왕국(B3 — 932 건국설은 글)
BI_own(['ID-BT', 'ID-JK', 'ID-JB'], [[E4_START, null], [358, 'tarumanagara'], [669, 'sunda-kingdom']]);
// 중자와·욕야카르타: 732 산자야의 캉갈 비문(B4) → 929 음푸 신독이 동부로 옮겨 비움(B5 — E3 1293 비움과 이음, 6~7세기 칼링가는 위치가 갈려 비움 B8)
BI_own(['ID-JT', 'ID-YO'], [[E4_START, null], [732, 'mataram-kingdom'], [929, null]]);
// 동자와: 929 마타람(B5 — 898 발리퉁 때 동부 일부는 글) → 1019 아이를랑가가 다시 묶음(B6 — 위키백과 영어판 Kahuripan 1019~1045, 1045 장갈라·판잘루(케디리) 분할은 글)
//   → 1222 켄 아록의 싱하사리(1292 자야카트왕의 케디리 부활 한 해는 글) → 1293부터 E3 마자파힛(같은 조각)
BI_own(['ID-JI'], [[E4_START, null], [929, 'mataram-kingdom'], [1019, 'kediri-kingdom'], [1222, 'singhasari']]);
// 발리(5,559 km² — 1만 미만): 914 바르마데와 왕조의 발리 왕국은 비움(B9) → 1284 크르타나가라의 발리 정복으로 싱하사리(E3 1293 마자파힛 모양과 이음)
BI_own(['ID-BA'], [[E4_START, null], [1284, 'singhasari']]);
// ── 스리비자야(Q8 — 비문 근거 네 조각과 크다, 끝 1292. 내륙은 명목 — mapNote) ──
BI_own(['ID-SS', 'ID-BB'], [[E4_START, null], [682, 'srivijaya']]); // 팔렘방·방카: 682 크둑 부킷 비문(683 갈림), 686 코타 카푸르 비문(방카)
BI_own(['ID-JA', 'ID-LA'], [[E4_START, null], [692, 'srivijaya']]); // 잠비·람풍: 692 말라유(잠비) 흡수, 람풍 팔라스 파세마 비문
BI_own(['MY-02', 'MY-07', 'MY-09'], [[E4_START, null], [685, 'srivijaya'], [1136, 'kedah-perlis']]); // 크다·프를리스·페낭: 682~685 크다 정복(B10 — 앞의 고대 크다·부장 계곡은 글) → 1136 왕의 이슬람 개종(E1 항목)
// ── 말루쿠 ──
BI_own(['ID-MU'], [[E4_START, null], [1257, 'ternate-sultanate']]); // 북말루쿠: 1257 트르나테섬의 왕국(B11 — E3 1293과 같은 조각 통째)
// 그 밖(수마트라 나머지·말레이 반도 나머지·싱가포르·보르네오·술라웨시·소순다·말루쿠·뉴기니·티모르·필리핀): 줄을 적지 않아 시대 내내 주인 null(아래 voids — E3 비움과 이음)
const BI_PH = idsOf('PHL');
const BI_voids = () => [
  V(E4_START, 1044, ...BI_UPPER), // 상버마: 쀼 사람의 성곽 도시들(스리크세트라·베익타노·할린)이 따로 선 땅 — 하나의 나라가 아님(Q4, 832 남조의 약탈도 칠하지 않음), 1044 아노라타 즉위 전
  V(E4_START, 1057, ...BI_BAGO, ...BI_LOWER), // 바고·하버마: 몬 사람의 항구 도시 땅(따통 왕국은 전승이라 칠하지 않음 — Q4), 1057 바간의 따통 정복 전
  V(E4_START, 370, ...BI_ARAKAN), // 아라칸: 다냐와디 왕국의 전승기 — 370 웨탈리 찬드라 왕조(아라칸 왕국 첫 해) 전
  V(E4_START, E4_END, ...BI_TENASSERIM), // 테나세림: 몬·바간·타이 쪽이 번갈아 다툰 땅 — 바간의 최대 판도라도 칠하지 않음(Q6, E3 1293~1764 비움과 이음)
  V(E4_START, E4_END, ...BI_HILLS, ...BI_SHAN, ...BI_KARENNI), // 카친·친 구릉·샨 고원·카야: 부족과 샨 소국 땅 — 바간이 조공을 받았어도 직접 다스리지 않음(Q6, E3 비움과 이음)
  V(E4_START, 358, 'ID-BT', 'ID-JK', 'ID-JB'), // 서자와: 타루마나가라 왕국 첫 해(358) 전 — 부니 문화 같은 바닷가 마을 땅(B1)
  V(E4_START, 732, 'ID-JT', 'ID-YO'), // 중자와: 칼링가(훌링) 같은 나라는 자리가 갈려 칠하지 않음(B8) — 732 캉갈 비문 전
  V(929, E4_END, 'ID-JT', 'ID-YO'), // 중자와: 929 마타람 왕실이 동자와로 옮긴 뒤 도읍이 없어진 땅(B5 — E3 1293 비움과 이음)
  V(E4_START, 929, 'ID-JI'), // 동자와: 마타람 왕실이 옮겨 오기(929) 전 — 칸주루한(760 디노요 비문) 같은 작은 나라 땅
  V(E4_START, 1284, 'ID-BA'), // 발리: 바르마데와 왕조 등 발리 왕국 땅(B9 — 1만 km² 미만) — 1284 싱하사리의 정복 전
  V(E4_START, 682, 'ID-SS', 'ID-BB'), // 팔렘방·방카: 스리비자야 첫 비문(682) 전 — 강어귀 항구 마을 땅
  V(E4_START, 692, 'ID-JA', 'ID-LA'), // 잠비·람풍: 말라유(믈라유 왕국)가 스리비자야에 들기(692) 전 — 말라유는 땅을 그리지 않음(B9)
  V(E4_START, 685, 'MY-02', 'MY-07', 'MY-09'), // 크다: 부장 계곡의 고대 크다 항구 땅 — 근거가 약해 칠하지 않음(B10), 685 스리비자야의 정복 전
  V(E4_START, 1257, 'ID-MU'), // 북말루쿠: 트르나테 왕국이 서기(1257년) 전 — 정향 섬들의 족장 땅
  V(E4_START, E4_END, 'ID-AC', 'ID-SU', 'ID-SB', 'ID-RI', 'ID-BE', 'ID-KR'), // 수마트라 나머지: 페를락·사무드라 파사이(1267)·다르마스라야 같은 강어귀 소국 땅 — 직접 지배 범위가 조각보다 훨씬 작음(B9, E3 비움과 이음)
  V(E4_START, E4_END, 'MY-01', 'MY-03', 'MY-04', 'MY-05', 'MY-06', 'MY-08', 'MY-10', 'MY-11', 'MY-14', 'MY-16', ...idsOf('SGP')), // 말레이 반도 남·동부와 싱가포르: 랑카수카·판판 등 항구 소국과 스리비자야의 조공 땅(결정 10 — E3 비움과 이음)
  V(E4_START, E4_END, 'MY-12', 'MY-13', 'MY-15', ...idsOf('BRN'), 'ID-KB', 'ID-KI', 'ID-KS', 'ID-KT'), // 보르네오: 쿠타이(무아라카만 비문)·보니(포니) 등 강어귀 소국과 다야크 사람들 땅(B9 — E3 비움과 이음)
  V(E4_START, E4_END, 'ID-SN', 'ID-SR', 'ID-GO', 'ID-SA', 'ID-ST', 'ID-SG'), // 술라웨시: 루우 등 소국과 토착 사회 땅(B9 — E3 비움과 이음)
  V(E4_START, E4_END, 'ID-NB', 'ID-NT', 'ID-MA', 'ID-PA', 'ID-PB', ...idsOf('TLS')), // 소순다·남말루쿠·뉴기니 서부·티모르: 웨할리 같은 토착 왕국과 파푸아 사람들 땅(B9 — E3 비움과 이음)
  V(E4_START, E4_END, ...BI_PH), // 필리핀: 부투안·톤도·마이 같은 항구 소국(바랑가이) 땅 — 영역 근거가 없음(B9, E3 비움과 이음)
];
// ── E4 BI 끝 ──

// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([E4_START, ...VC_BOUNDS, ...SK_BOUNDS, ...BI_BOUNDS, E4_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== E4_START || BOUNDS.at(-1) !== E4_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`southeast-asia ancient: 표 경계 해 ${BOUNDS.join(', ')}는 ${E4_START}~${E4_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`southeast-asia ancient: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`southeast-asia ancient: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`southeast-asia ancient: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`southeast-asia ancient: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
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
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`southeast-asia ancient: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
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
if (joined.TO !== E4_END) throw new Error(`southeast-asia ancient: 마지막 표의 끝이 ${joined.TO} (${E4_END}이어야 함)`);
// 버전: 같은 단위 목록이 이어지는 기간을 prevPieces 구간(뺄 도형 목록이 같은 구간)으로 다시 나누고, 그 구간에서 이 나라 땅과 실제로 겹치는 도형(중국 쪽 교지·띠·부스러기)만 뺀다.
// 겹치는 도형 목록이 같은 구간은 다시 잇는다(early-modern.mjs와 같은 줄 — 중국 왕조 손 도형은 해마다 바뀌어 구간이 여럿으로 나뉠 수 있음, 겹치는 몫이 같으면 한 구간)
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
const OUTSIDE = [...VC_OUTSIDE, ...SK_OUTSIDE, ...BI_OUTSIDE];
for (const o of OUTSIDE) {
  if (!Array.isArray(o) || o.length !== 4 || !Number.isInteger(o[0]) || !Number.isInteger(o[1]) || !(E4_START <= o[0] && o[0] < o[1] && o[1] <= E4_END) || typeof o[2] !== 'string' || !Array.isArray(o[3]) || !o[3].length) {
    throw new Error(`southeast-asia ancient: 권역 밖 땅 줄 모양이 틀림 — [from, to(미포함), 나라 id, 멀티폴리곤], 해는 ${E4_START}~${E4_END} 안`);
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
const voids = [...VC_voids(), ...SK_voids(), ...BI_voids()];

// 빈 땅 검사 구역: 권역 바깥선(조각 384개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅·중국 쪽 교지·띠를 합쳐 빈 곳이 없어야 한다(권역 밖 땅은 구역 밖).
// 비운 땅이 바뀌는 해마다 구역 하나, 마지막 구역의 끝은 E4_END(1293 — 그 뒤는 early-modern.mjs의 '동남아 근세' 구역). 이 권역 나라가 하나도 없는 기간(빈 틀)은 구역을 만들지 않는다
// (칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 사본·원본 어디서도 5분 안에 못 돎 — 칸 땅 직접 재기와 CI 첫 job으로 갈음)
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([E4_START, E4_END, ...voids.flatMap(([f, t]) => [f, t ?? E4_END]).filter((y) => E4_START < y && y < E4_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(early-modern.mjs와 같음 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= (t ?? E4_END)).map(([, , g]) => g);
  return [{ name: `동남아 고대 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

void geomOfUnit; // 세 칸이 쓰지 않는 이름 경고 막기

export const era = {
  name: 'ancient',
  versions,
  gapZones,
  voids,
  source: SE_SOURCE_TEXT, // 출처 문구는 table.mjs 한 곳 — early-modern.mjs·colonial.mjs·modern.mjs와 같은 값이라야 같은 나라 id(pagan-empire·khmer-empire·lan-na·kedah-perlis 등)를 이어 붙일 수 있다(joinEras). 문구를 바꾸면 E1~E3 나라 geojson이 모두 바뀐다
};
