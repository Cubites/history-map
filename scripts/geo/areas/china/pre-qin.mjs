// china 시대 파일 pre-qin (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 상·서주·춘추(M1): 기원전 1600년 무렵(천문 −1599) ~ 기원전 476년(천문 −475). 동아시아 손그림 바깥 도형(shared.mjs의 CHINA 등) 안을 Natural Earth admin-1 조각(loadFragments('china'))과 칼선으로 나눈다(docs/china/00-scope.md 2절)
// 짝 항목 파일: data/entities/china-pre-qin.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china/의 다른 도우미 모듈. areas/china.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/china/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/china.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 생성기가 멈춘다.
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 중국 M1 (2026-10-21): 상·서주·동주 왕실과 춘추의 큰 제후국 ──────────────────────────
// 등급 '주변'(00-scope 3절: 땅 5만 km², 선 평균 25 / 최대 50 km). 영토는 모두 기원전 476년까지(천문 −474 미포함), 전국 시대는 M2가 잇는다.
// 짜임: 중국 조각(성급 31개)을 손그림 CHINA와 교집합한 뒤 성마다 칼선 고리·경위도 상자로 '칸'(CELL)으로 나눈다. 칸은 성 안에서 앞 칸을 뺀 나머지와 교집합해
//   만들어 서로 겹치지 않고 빈틈이 없다(칸을 모두 합치면 DOMAIN). 나라 버전은 칸 이름 목록이고, 같은 해에 두 나라가 한 칸을 가지면 멈춘다.
//   어느 나라도 갖지 않은 칸이 그 해의 비운 땅(voids)이고, 빈 땅 검사 구역(gapZones)은 DOMAIN에서 그 해 비운 땅을 뺀 것이다.
// 선: 강 자료(data/base/rivers, prep-rivers.mjs RIVER_SETS)에 황허강·화이허강·창장강 키가 없어 강을 따르는 칼선은 두지 않았다. 황허강 하류 선(L_HH_HENAN)만
//   허난성 안 북쪽 기슭을 나누려고 강을 대략 따라 그었다(꼭짓점 11개, 강에서 10km 안팎 어림: 강 키가 생기면 꼬리표를 단다). 그 밖의 칼선은 산줄기·분지를 어림한 경위도 선이다.
// 수도 정답표: data/tests/places/east-asia.yaml(중국 M1 줄). 근거: 위키백과 en·zh(scratchpad m1/research/notes.md, 결과 노트 1절)
import { D, I, U, box, ring } from '../../lib.mjs';
import { loadFragments } from '../../lib.mjs';
import { CHINA } from '../../shared.mjs';

const { F } = loadFragments('china');
/** 성 조각(들)을 손그림 중국 바깥선 안으로 자른 것 */
const prov = (...ids) => I(F(...ids), [CHINA]);
/** 성 하나를 [이름, 멀티폴리곤] 차례대로 나눈다: 칸 = (앞 칸을 뺀 나머지) ∩ 도형, 마지막 이름은 나머지 전부 */
function split(base, parts, restName) {
  const out = {};
  let rest = base;
  for (const [name, m] of parts) {
    out[name] = I(rest, m);
    rest = D(rest, m);
  }
  out[restName] = rest;
  return out;
}

// ── 칼선 (near:fragments로 근처 조각 확인: 결과 노트 1절) ─────────────
// 관중(위수 분지): 남쪽 변은 친링산맥 북쪽 기슭, 북쪽 변은 웨이베이 황토 고원 남쪽 기슭(징허강 하류·뤄허강 하류 포함)을 어림. 동쪽·서쪽은 성 경계(황허강·간쑤)
export const L_GUANZHONG = ring(
  [[106.2, 34.25], [107.0, 34.12], [107.8, 34.02], [108.6, 33.92], [109.4, 33.98], [110.1, 34.3], [110.7, 34.45]],
  [[110.7, 35.8], [109.9, 35.45], [109.3, 35.25], [108.5, 35.15], [107.5, 35.1], [106.2, 35.0]],
);
// 톈수이 분지(위수 상류): 진(秦)의 규·기현(기원전 688년) 일대. 간쑤 조각 안만 쓴다
export const L_TIANSHUI = ring([[104.85, 34.15], [105.6, 34.05], [106.6, 34.15], [106.7, 35.0], [105.8, 35.15], [104.85, 35.0]]);
// 뤄양 분지: 동주 왕기(성주 둘레). 서쪽 이수·뤄수 상류 산지, 동쪽 쑹산 서쪽 기슭, 북쪽 황허강까지
export const L_LUOYANG = ring([[111.9, 34.45], [112.4, 34.35], [112.9, 34.4], [113.15, 34.6], [113.05, 34.85], [112.5, 34.95], [112.0, 34.88]]);
// 허난성 안 황허강 하류(지금 물길, 지린에서 타이첸까지)를 어림한 선: 북쪽 기슭(하내)과 남쪽(중원)을 나눈다
export const L_HH_HENAN = [[111.95, 35.05], [112.35, 34.92], [112.8, 34.86], [113.2, 34.9], [113.65, 34.94], [114.2, 34.92], [114.65, 34.88], [114.95, 35.05], [115.25, 35.35], [115.55, 35.75], [115.95, 36.05]];
const NORTH_OF_HH = [ring(L_HH_HENAN, [[116.6, 36.6], [111.4, 36.6], [111.4, 35.3]])];
// 충밍섬(창장강 어귀): 7세기 무렵부터 모래톱이 쌓여 생긴 섬이라 이 시대 나라에 넣지 않는다(test:geo islands가 오가 끝난 뒤 '사라진 섬'으로 보지 않게). 섬 둘레를 감싸는 고리
export const L_CHONGMING = ring([[121.18, 31.84], [121.5, 31.82], [121.75, 31.7], [122.05, 31.52], [121.95, 31.42], [121.6, 31.49], [121.3, 31.585], [121.15, 31.72]]);

// ── 칸 ─────────────────────────────────────────────────
const SN = split(prov('CN-SN'), [['GZ', [L_GUANZHONG]]], 'SN_X');
const CELL = {
  GZ_E: I(SN.GZ, box(108.5, 33.0, 111.0, 36.0)), // 관중 동부(시안 동쪽·화현·한청)
  GZ_W: D(SN.GZ, box(108.5, 33.0, 111.0, 36.0)), // 관중 서부(기산·펑샹·바오지·셴양)
  SN_X: SN.SN_X, // 섬서 북부 황토 고원, 한중·안캉·상뤄
  TS: I(prov('CN-GS'), [L_TIANSHUI]), // 톈수이 분지
  ...split(prov('CN-HA'), [
    ['HA_LUO', [L_LUOYANG]], // 뤄양 분지
    ['HA_NW', I(NORTH_OF_HH, box(111.0, 34.5, 114.0, 36.6))], // 하내 서부(지위안·자오쭤·신샹 서부, 진(晉)의 남양)
    ['HA_NE', NORTH_OF_HH], // 하내 동부(신샹 동부·허비·안양·푸양)
    ['HA_W', box(110.3, 34.25, 111.75, 35.3)], // 산먼샤(괵·초(焦))
    ['HA_NY', box(110.3, 31.3, 113.35, 33.55)], // 난양 분지(신·여·등, 단양)
    ['HA_XY', box(113.35, 31.3, 116.7, 32.7)], // 신양과 주마뎬 남부(식·황·강)
  ], 'HA_C'), // 중원(정저우·카이펑·쉬창·저우커우 등)과 루산·롼촨 산지
  ...split(prov('CN-SX'), [
    ['SX_JC1', box(111.15, 35.4, 112.0, 36.2)], // 펀허강 하류 린펀 분지(익·곡옥·강)
    ['SX_YC', box(110.0, 34.4, 112.15, 35.4)], // 윈청 분지와 중탸오산
    ['SX_FEN', box(111.2, 36.2, 112.6, 37.35)], // 펀허강 중류(훠저우·제슈·핑야오)
    ['SX_LW', box(110.3, 35.4, 111.2, 37.0)], // 뤼량산 남부(포·굴: 헌공이 공자 중이·이오에게 준 땅)
    ['SX_TY', box(111.9, 37.35, 113.2, 38.45)], // 타이위안 분지
    ['SX_SD', box(112.0, 35.0, 114.2, 37.2)], // 상당(창즈·진청)
  ], 'SX_X'), // 산시 북부·뤼량산
  ...split(prov('CN-HE'), [
    ['HE_HD', box(113.3, 35.9, 115.0, 37.45)], // 한단·싱타이 서부
    ['HE_SE', box(115.0, 35.9, 118.0, 37.45)], // 허베이 동남부
    ['HE_C', box(113.3, 37.45, 118.5, 38.6)], // 허베이 중부(스자좡·형수이·창저우)
    ['HE_YN', box(114.8, 38.6, 118.3, 40.6)], // 허베이 북부 평원(바오딩 북부·랑팡·탕산 서부)
  ], 'HE_X'), // 장자커우·청더·친황다오와 타이항산 북부
  ...split(prov('CN-BJ'), [['BJ_Y', box(115.0, 39.0, 118.0, 40.6)]], 'BJ_X'), // 베이징 평원 / 옌산 북쪽
  TJ: prov('CN-TJ'),
  ...split(prov('CN-SD'), [
    ['SD_QI1', box(117.7, 36.2, 119.3, 38.5)], // 쯔보·둥잉·웨이팡 서부(임치 둘레)
    ['SD_QI2', box(116.3, 35.95, 117.7, 38.5)], // 지난·타이안 북부·더저우 동부
    ['SD_JD', box(119.3, 35.8, 123.0, 38.5)], // 자오둥 반도(래)
    ['SD_W', box(114.5, 34.0, 117.7, 38.5)], // 산둥 서부(허쩌·지닝·랴오청·취푸)
  ], 'SD_SE'), // 산둥 동남부(린이·르자오, 거·담)
  ...split(prov('CN-JS'), [['JS_CM', [L_CHONGMING]], ['JS_S', box(118.0, 30.5, 122.5, 32.45)]], 'JS_X'), // 충밍섬 북쪽 / 장쑤 남부(창장강 남쪽과 양저우) / 장쑤 북부(회이·서)
  ...split(prov('CN-SH'), [['SH_CM', [L_CHONGMING]]], 'SH'), // 충밍섬 / 상하이 본토
  ...split(prov('CN-AH'), [
    ['AH_SE', box(117.9, 30.3, 119.8, 31.95)], // 안후이 동남부(마안산·우후·쉬안청)
    ['AH_W', box(115.3, 30.95, 117.4, 32.55)], // 안후이 서부(루안·허페이, 군서·육·요)
  ], 'AH_X'),
  ...split(prov('CN-ZJ'), [['ZJ_N', box(119.2, 30.55, 122.0, 31.3)]], 'ZJ_X'), // 후저우·자싱 / 저장 나머지(월)
  ...split(prov('CN-HB'), [
    ['HB_C1', box(110.9, 29.5, 113.6, 32.8)], // 한수이강 중류(샹양·징먼·징저우·이창 동부)
    ['HB_E', box(113.6, 29.0, 116.2, 31.8)], // 후베이 동부(우한·샤오간·황강)
    ['HB_SY', box(109.4, 31.4, 110.9, 33.4)], // 스옌(용)
  ], 'HB_X'), // 은스·이창 서부(파)
};
const CELL_NAMES = Object.keys(CELL);
/** 칸 모음(M2 이후 시대 파일이 같은 칼선으로 이어 그릴 때 쓴다. 객체는 고치지 말고 U·D·I로 새 도형을 만든다) */
export const PRE_QIN_CELLS = CELL;

// ── 나라 버전: [from, to, 칸 목록] (천문 연도, to 미포함) ────────────────
const WZ_CELLS = ['GZ_E', 'GZ_W', 'HA_LUO', 'HA_NW', 'HA_NE', 'HA_W', 'HA_NY', 'HA_XY', 'HA_C', 'SX_JC1', 'SX_YC', 'SX_FEN', 'SX_SD', 'HE_HD', 'HE_SE', 'HE_C', 'HE_YN', 'BJ_Y', 'TJ', 'SD_QI1', 'SD_QI2', 'SD_W', 'SD_SE'];
const YAN_CELLS = ['HE_YN', 'BJ_Y', 'TJ'];
const TABLE = {
  // 상: 앞 시기(얼리강 문화, 정저우 상성)는 허난 전역·산시 남부·허베이 남부·산둥 서부·관중 동부. 뒤 시기(은허, 반경 천도 기원전 1300년 무렵)는
  //   zh 위키 '北至河北定州、曲陽，東至山東泰安、泗水，南至淮陽、郾城，西至山西翼城、洪洞、靈石'(왕기). 외복(영향권)·반룽청 거점은 칠하지 않는다
  shang: [
    [-1599, -1299, ['GZ_E', 'HA_LUO', 'HA_NW', 'HA_NE', 'HA_W', 'HA_NY', 'HA_XY', 'HA_C', 'SX_JC1', 'SX_YC', 'HE_HD', 'HE_SE', 'SD_W']],
    [-1299, -1045, ['HA_LUO', 'HA_NW', 'HA_NE', 'HA_W', 'HA_C', 'SX_JC1', 'SX_YC', 'SX_SD', 'HE_HD', 'HE_SE', 'HE_C', 'SD_W', 'SD_QI2']],
  ],
  // 서주: 왕기(관중·뤄양)와 제후국(연·제·노·진(晉)·위·송 등)을 한 나라로. 서쪽 육반산·남쪽 친링, 동쪽 산둥(래 빼고), 북동쪽 연(베이징). 5만 km² 넘게 바뀐 근거가 없어 한 버전
  'western-zhou': [[-1045, -769, WZ_CELLS]],
  // 동주 왕실: 뤄양 둘레 왕기만(5만 km² 미만이지만 00-scope 2절대로 그림)
  'eastern-zhou': [[-769, -474, ['HA_LUO']]],
  // 진(晉): 기원전 770년 펀허강 하류 린펀 분지 → 헌공의 병합(괵·우는 기원전 655년)으로 펀허강 중하류·윈청·산먼샤·뤼량산 남부(포·굴), 하내 남양(기원전 635년, 5만 km² 미만이라 같은 버전)
  //   → 기원전 594년 적적 노씨를 멸해 상당, 타이위안 분지(기원전 541년)·한단(기원전 6세기 말)까지(둘 다 5만 km² 미만이라 같은 버전)
  'jin-chunqiu': [
    [-769, -654, ['SX_JC1']],
    [-654, -593, ['SX_JC1', 'SX_YC', 'SX_FEN', 'SX_LW', 'HA_W', 'HA_NW']],
    [-593, -474, ['SX_JC1', 'SX_YC', 'SX_FEN', 'SX_LW', 'HA_W', 'HA_NW', 'SX_SD', 'SX_TY', 'HE_HD']],
  ],
  // 제: 임치 둘레와 지난·타이산 북쪽. 환공이 담(기원전 684년) 등을 병합해 넓힌 몫(SD_QI2, 약 2.5만 km²)과 래(자오둥) 병합(기원전 567년)은 5만 km² 미만이라
  //   새 버전을 두지 않는다(앞은 처음부터 넣고, 래는 비움)
  'qi-state': [[-769, -474, ['SD_QI1', 'SD_QI2']]],
  // 초: 신(난양 분지)을 멸한 기원전 688년부터(그 전은 5만 km² 미만) → 식·황·강·요·육·용·서료를 병합한 기원전 600년 무렵 후베이 동부·신양·안후이 서부까지
  'chu-state': [
    [-687, -599, ['HA_NY', 'HB_C1']],
    [-599, -474, ['HA_NY', 'HB_C1', 'HB_E', 'HB_SY', 'HA_XY', 'AH_W']],
  ],
  // 진(秦): 무공이 기원전 688년 규·기현(톈수이), 기원전 687년 두·정현(시안·화현)을 두어 관중과 톈수이 분지를 가진 해부터(그 전은 5만 km² 미만). 서융 땅은 비운다
  'qin-state': [[-686, -474, ['GZ_W', 'GZ_E', 'TS']]],
  // 오: 합려(기원전 514년 즉위) 때 중심이 쑤저우 쪽으로 넓어져 5만 km²를 넘는 기원전 506년 무렵부터(그 전 핵심 땅은 5만 km² 미만으로 봄, zh 吳國). 장쑤 남부·상하이·안후이 동남부·후저우·자싱. 월(기원전 494년 복속)은 칠하지 않는다
  'wu-state': [[-505, -474, ['JS_S', 'SH', 'AH_SE', 'ZJ_N']]],
  // 연(춘추): 베이징·톈진·허베이 북부 평원. 권역 파일(areas/china.mjs)의 yan-state 버전으로 내보내고 여기서는 칸 겹침 검사에만 쓴다
  'yan-state': [[-769, -399, YAN_CELLS]],
};

// 비운 칸의 이유 (시기별, 칸 → 이유). 나라가 갖지 않은 칸은 모두 비운다(아래 줄에 없는 칸도 비우되 이유는 '화하 밖 이웃')
// - 상 시기: 관중 서부·톈수이(주와 융), 산시 중북부(귀방 등), 허베이 북부·베이징·톈진(이웃 문화), 산둥 동부(동이), 화이허강 남쪽·창장강(삼성퇴·우청 등 이웃 문화, 반룽청 거점은 칠하지 않음)
// - 서주 시기: 섬서 북부·톈수이(융), 산시 북부·타이위안(융적), 자오둥(래이), 화이허강 남쪽(회이·초·오·월), 한수이강 남쪽(초)
// - 춘추 시기(5만 km² 미만 소국과 화하 밖 집단, 00-scope 3절):
//   HA_C 정·송·진(陳)·채·허와 육혼융 / HA_NE 위(衛) / SD_W·SD_SE 노·조·위 일부·송 일부·거·담·주(邾) / SD_JD 래(기원전 567년 제에 병합, 5만 km² 미만 변화)
//   JS_CM·SH_CM 충밍섬(이 시대에 없던 섬) / HE_SE·HE_C 형·선우(중산)·비·고 등 백적 / HE_X·BJ_X 산융 / SX_X 누번 등 적·융 / SN_X 융적·파·촉·초 경계 / JS_X·AH_X 회이·서·종리
//   ZJ_X 월(기원전 476년 전은 5만 km² 미만)·백월 / HB_X 파·용 / 나라가 커지기 전 칸(초 전 HA_NY·HB_C1 신·등·초 초기, 진(秦) 전 관중·톈수이 진 초기와 융,
//   오 전 장쑤 남부 등 오 초기, 진(晉) 전 SX_YC 순·가·경·위(魏), SX_SD 적적 노씨, HA_W 괵·초, SX_LW 융적)

// ── 기간 나누기: 모든 버전 경계 해 ─────────────────────────────
const M1_FROM = -1599, M1_TO = -474;
const cuts = [...new Set([M1_FROM, M1_TO, ...Object.values(TABLE).flatMap((list) => list.flatMap(([f, t]) => [f, t]))])].filter((y) => y >= M1_FROM && y <= M1_TO).sort((a, b) => a - b);
const owned = (year) => {
  const seen = new Map();
  for (const [id, list] of Object.entries(TABLE)) {
    for (const [f, t, cells] of list) {
      if (!(f <= year && year < t)) continue;
      for (const c of cells) {
        if (!CELL[c]) throw new Error(`중국 pre-qin: 모르는 칸 ${c} (${id})`);
        if (seen.has(c)) throw new Error(`중국 pre-qin: ${year}년 칸 ${c}를 ${seen.get(c)}와 ${id}가 함께 가짐`);
        seen.set(c, id);
      }
    }
  }
  return seen;
};
const build = (cells) => U(...cells.map((c) => CELL[c]));
export const DOMAIN = build(CELL_NAMES);
const segments = cuts.slice(0, -1).map((from, i) => {
  const own = owned(from);
  const empty = CELL_NAMES.filter((c) => !own.has(c));
  return { from, to: cuts[i + 1], empty };
});

const versions = {};
for (const [id, list] of Object.entries(TABLE)) {
  if (id === 'yan-state') continue;
  versions[id] = list.map(([from, to, cells]) => [from, to, build(cells)]);
}
/** 연(춘추) 영토: areas/china.mjs의 yan-state 첫 버전(기원전 770 ~ 400년) */
export const YAN_CHUNQIU = build(YAN_CELLS);

export const era = {
  name: 'pre-qin',
  versions,
  gapZones: segments.map(({ from, to, empty }) => ({ name: `중국 상·주·춘추 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN, build(empty)) : DOMAIN, from, to })),
  voids: segments.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
};
