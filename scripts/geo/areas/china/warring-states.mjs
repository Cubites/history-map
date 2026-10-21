// china 시대 파일 warring-states (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 전국(M2): 기원전 475년(천문 −474) ~ 기원전 221년(천문 −220). 동아시아 손그림 바깥 도형(shared.mjs의 CHINA 등) 안을 M1 칸(pre-qin.mjs의 PRE_QIN_CELLS)과 칼선으로 나눈다(docs/china/00-scope.md 2절)
// 짝 항목 파일: data/entities/china-warring-states.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china/의 다른 도우미 모듈. areas/china.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/china/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/china.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 중국 M2 (2026-10-21): 전국 7웅(진·초·제·연·조·위·한)과 월·중산·송 ──────────────────────────
// 등급 '일반'(00-scope 2·3절: 땅 1만 km², 선 평균 10 / 최대 25 km). 영토는 기원전 475년(천문 −474)부터 기원전 222년(천문 −221)까지(−220 미포함),
//   천문 −220부터는 권역 파일의 진 제국(qin)이 잇는다.
// 짜임: M1 칸(PRE_QIN_CELLS)을 칼선·경위도 상자로 다시 쪼갠 '칸'과 M1에 없던 성 조각(쓰촨·충칭·간쑤 동부·닝샤 남부·네이멍구 남부)의 칸. 쪼갠 칸은 원래 칸을
//   (앞 칸을 뺀 나머지) ∩ 도형으로 나눠 합치면 원래 칸이고 겹침·틈이 없다. 나라 버전은 칸 이름 목록이고, 같은 해에 두 나라가 한 칸을 가지면 멈춘다(M1과 같음).
//   어느 나라도 갖지 않은 칸이 그 해의 비운 땅(voids), 빈 땅 검사 구역(gapZones)은 칸 전체에서 그 해 비운 땅을 뺀 것이다.
// M1에서 이어지는 나라(진(晉)·진(秦)·제·초·오·동주)는 같은 id로 이 파일이 −474부터 버전을 더 낸다(shared.mjs joinEras가 M1 버전 뒤에 이어 붙임). M1 버전(−474 전)은 그대로다.
// 연(yan-state)은 권역 파일(areas/china.mjs)의 버전이다. 남쪽 경계를 연 남장성·역수 선(L_YAN_S, 2026-10-21 운영자 승인)으로 줄이도록 그 남쪽 띠(YAN_SOUTH)를 내보내고,
//   여기서는 연이 가진 칸(Y_…)을 표에 넣어 겹침 검사에만 쓴다. 연의 북쪽 경계와 요서·요동은 그대로. 연 상자 서쪽 끝의 대(代) 땅(YAN_DAI)은 조 땅이라 연 도형에서 빼고(FIX1),
//   기원전 226년(천문 −225) 계가 함락된 뒤의 허베이·베이징(YAN_TO_QIN_226)은 진(秦) 땅이라 연 도형에서 뺀다(2026-10-21 운영자 결정).
// 선: 강 자료(data/base/rivers)에 황허강·뤄허강·역수 키가 없어 강을 따르는 칼선(L_LUO, L_YAN_S의 역수 구간)에 꼬리표를 달지 못했다(강에서 10km 안팎 어림). 그 밖의 칼선은 경위도 상자다.
// 근거: 위키백과 en·zh(scratchpad m2/research/notes.md, 결과 노트 1절). 수도 정답표: data/tests/places/east-asia.yaml(중국 M2 줄)
import { D, I, U, box, ring } from '../../lib.mjs';
import { loadFragments } from '../../lib.mjs';
import { CHINA, LIAOXI } from '../../shared.mjs';
import { PRE_QIN_CELLS as M1 } from './pre-qin.mjs';

const { F } = loadFragments('china');
/** 성 조각(들)을 손그림 중국 바깥선 안으로 자른 것 */
const prov = (...ids) => I(F(...ids), [CHINA]);
/** 도형 하나를 [이름, 멀티폴리곤] 차례대로 나눈다: 칸 = (앞 칸을 뺀 나머지) ∩ 도형, 마지막 이름은 나머지 전부 */
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
// 연 남쪽 경계: 연 남장성(역수 장성)을 어림. 서쪽은 타이항산 안 북위 39.1°(링추·라이위안은 북쪽, 푸핑은 남쪽), 이현(연하도) 남쪽 역수를 따라 쉬수이·슝현,
//   원안·다청 쪽으로 내려가 톈진 남쪽 바닷가에 이른다(강 키 없음, 역수에서 10km 안팎 어림). 바다에서는 요동반도 끝(북위 38.5°)보다 남쪽으로 동경 122.7°까지 그어
//   요동(shared.mjs LIAODONG)에 닿지 않는다
export const L_YAN_S = [[113.4, 39.1], [114.4, 39.1], [115.0, 39.2], [115.4, 39.25], [115.7, 39.1], [116.1, 39.0], [116.6, 38.75], [117.2, 38.6], [117.7, 38.55], [118.5, 38.45], [122.7, 38.4]];
/** 연 도형(areas/china.mjs)에서 빼는 남쪽 띠: 연 상자(동경 113.5°~122.6°, 북위 36°~) 가운데 L_YAN_S 남쪽 */
export const YAN_SOUTH = [ring(L_YAN_S, [[122.7, 35.8], [113.4, 35.8]])];
// 연 상자(areas/china.mjs의 YAN_EARLY·YAN_281과 같은 경위도) 안에서 남쪽 띠를 뺀 곳: 이 안의 칸은 연이 가진다
const YAN_A = D(box(113.5, 36.0, 119.8, 42.5), YAN_SOUTH);
const YAN_B = D(box(119.8, 36.0, 122.6, 42.5), YAN_SOUTH);
/** 대(代) 땅: 연 상자 서쪽 끝(위현·양위안·화이안·링추·광링). 조 양자(기원전 475년) 때부터 조의 대군이라 연 도형(areas/china.mjs)에서 뺀다(FIX1, 검토 반영) */
export const YAN_DAI = I(YAN_A, box(113.5, 39.1, 115.0, 40.75));
/** 기원전 226년(천문 −225) 계가 함락된 뒤 진(秦)이 차지한 연 땅(허베이·베이징·톈진): 연 상자에서 대·요서를 뺀 곳. 연은 요서·요동만 남는다(2026-10-21 운영자 결정) */
export const YAN_TO_QIN_226 = D(YAN_A, YAN_DAI, LIAOXI);
// 뤄허강 하류(황룽에서 다리·화인까지 지금 물길 어림, 강 키 없음): 동쪽이 하서(위(魏)가 기원전 409년에 차지한 서하군)
export const L_LUO = [[110.1, 34.4], [110.05, 34.6], [109.95, 34.8], [109.88, 35.05], [109.8, 35.3], [109.65, 35.6], [109.5, 35.9]];
const EAST_OF_LUO = [ring(L_LUO, [[111.5, 35.9], [111.5, 34.4]])];
// 진(秦) 소왕 장성(의거를 멸한 기원전 272년 뒤 쌓음): 린타오에서 웨이위안·퉁웨이·징닝·구위안·환현·우치·징볜·헝산을 거쳐 선무 쪽 황허강까지를 어림.
//   그 동남쪽이 진(秦)의 농서·북지·상군(의거와 서융의 옛 땅), 서북쪽은 융·호의 땅으로 비운다
export const L_QIN_WALL = [[103.6, 34.6], [103.9, 35.0], [104.2, 35.25], [105.2, 35.3], [105.7, 35.55], [106.2, 36.05], [106.6, 36.4], [107.1, 36.65], [107.7, 37.1], [108.6, 37.6], [109.4, 38.2], [110.2, 38.8], [110.7, 39.3]];
const INSIDE_WALL = [ring(L_QIN_WALL, [[111.5, 39.3], [111.5, 33.5], [103.6, 33.5]])];

// ── 칸 ─────────────────────────────────────────────────
const cut = (name, parts, restName) => split(M1[name], parts, restName);
const SNX = split(M1.SN_X, [['SN_SL', box(108.6, 33.0, 111.5, 34.6)], ['SN_HZW', box(105.0, 31.0, 108.2, 34.6)], ['SN_HZE', box(108.2, 31.0, 112.0, 34.6)], ['SNX_SJ', box(109.2, 35.2, 111.0, 38.0)], ['SNX_R', INSIDE_WALL]], 'SNX_N');
const SXX = split(M1.SX_X, [['Y_SX', YAN_DAI], ['SX_XN', box(109.0, 39.15, 115.0, 41.5)], ['ZS_SX', box(113.95, 38.9, 114.6, 39.1)]], 'SX_XS');
const HEX = split(M1.HE_X, [
  ['Y_HD', YAN_DAI],
  ['Y_HXL', I(YAN_A, LIAOXI)],
  ['Y_HX', YAN_A],
  ['Y_HXB', YAN_B],
  ['ZS_X', box(113.3, 38.0, 115.6, 39.4)],
], 'HE_XR');
const CELL = {
  // 섬서·간쑤·닝샤·네이멍구
  GZ_W: M1.GZ_W, // 관중 서부
  ...cut('GZ_E', [['GZ_HX', EAST_OF_LUO]], 'GZ_E2'), // 하서(뤄허강 동쪽: 다리·허양·청청·한청) / 관중 동부 나머지
  SN_SL: SNX.SN_SL, // 상뤄(상·어, 친링산맥 남동쪽)
  SN_HZW: SNX.SN_HZW, // 한중 분지(남정, 촉이 기원전 387년 무렵부터 가짐)
  SN_HZE: SNX.SN_HZE, // 안캉(초의 한중군)
  SNX_SJ: SNX.SNX_SJ, // 상군과 하서 북부(황룽·이촨·옌안·쑤이더)
  SNX_R: SNX.SNX_R, // 섬서 북부 장성 안(옌안 서부·퉁촨 북쪽·위린 남부, 의거 땅)
  SNX_N: SNX.SNX_N, // 섬서 북부 장성 밖(위린 북부·딩볜, 임호·누번 땅)
  TS: M1.TS, // 톈수이 분지
  GS_E: D(I(prov('CN-GS'), I(box(103.5, 34.0, 108.8, 37.5), INSIDE_WALL)), M1.TS), // 간쑤 동부 장성 안(칭양·핑량·딩시 남부·룽시, 의거와 서융 땅)
  NX_S: I(prov('CN-NX'), INSIDE_WALL), // 닝샤 남부 장성 안(구위안, 의거 땅)
  NM_YZ: I(prov('CN-NM'), box(109.5, 39.9, 113.5, 41.5)), // 운중(후허하오터·바오터우·투먼 평원)
  // 쓰촨·충칭
  SC_B: I(prov('CN-SC'), box(103.0, 28.5, 108.6, 32.6)), // 쓰촨 분지와 둘레(촉·파: 청두·야안·러산·이빈·몐양·광위안·난충·다저우)
  ...split(prov('CN-CQ'), [['CQ_SE', box(107.6, 28.0, 110.3, 29.9)], ['CQ_E', box(109.0, 28.0, 110.3, 32.3)]], 'CQ_W'), // 충칭 동남부(펑수이·첸장·유양, 검중) / 충칭 동부(우산·펑제, 초의 무군) / 충칭 서부·중부(파)
  // 허난
  HA_LUO: M1.HA_LUO, // 뤄양 분지(동주 왕기)
  ...cut('HA_NW', [['HA_NW_W', box(111.0, 34.5, 113.3, 36.6)]], 'HA_NW_E'), // 하내 서부(지위안·친양=야왕) / 하내 동부(우즈·훠자·후이현·신샹)
  ...cut('HA_NE', [['HA_NE_W', box(113.0, 34.5, 114.85, 36.6)]], 'HA_NE_E'), // 안양·허비·신샹 동부 / 푸양 둘레(위(衛))
  HA_W: M1.HA_W, // 산먼샤(섬·초(焦))
  HA_NY: M1.HA_NY, // 난양 분지(완)
  HA_XY: M1.HA_XY, // 신양·주마뎬 남부
  ...cut('HA_C', [
    ['HA_TQ', box(115.6, 35.6, 116.7, 36.4)], // 타이첸 동쪽 끝(옛 황허강 둘레, 위(衛)·제 사이)
    ['HA_CS', U(box(112.5, 31.3, 116.7, 33.5), box(114.1, 33.5, 115.9, 33.8))], // 중원 남부(저우커우=진(陳)·주마뎬 북부=채 옛 땅·난양 분지 동쪽)
    ['HA_CW', box(110.3, 33.0, 112.9, 35.3)], // 뤄양 남쪽·서쪽 산지(이양·루저우·쑹현·롼촨)
    ['HA_YZ', box(112.9, 33.5, 113.6, 34.3)], // 위저우(양적)·루저우 동쪽(한이 기원전 5세기 말에 가짐)
    ['HA_ZZ', box(112.9, 33.5, 114.1, 35.3)], // 정저우·신정·쉬창·핑딩산(정, 뒤에 한의 영천)
    ['SONG_HA', U(box(114.9, 33.8, 116.7, 36.4), box(115.9, 33.5, 116.7, 33.8))], // 상추 둘레(송)
  ], 'HA_KF'), // 카이펑 둘레(대량)
  // 산시(山西)
  SX_JC1: M1.SX_JC1, // 린펀 분지(평양)
  SX_YC: M1.SX_YC, // 윈청 분지(안읍, 하동)
  SX_LW: M1.SX_LW, // 뤼량산 남부(포·피씨)
  SX_FEN: M1.SX_FEN, // 펀허강 중류
  SX_TY: M1.SX_TY, // 타이위안 분지(진양)
  ...cut('SX_SD', [['SX_SDN', box(112.0, 36.5, 114.6, 37.3)]], 'SX_SDS'), // 상당 북부(우샹·친현·쭤취안) / 상당 남부(창즈·진청)
  Y_SX: SXX.Y_SX, // 산시 동북부(링추·광링·훈위안 동부, 대)
  SX_XN: SXX.SX_XN, // 산시 북부(쉬저우·다퉁, 안문)
  SX_XS: SXX.SX_XS, // 신딩 분지·뤼량산 중부·양취안
  ZS_SX: SXX.ZS_SX, // 산시 동북쪽 끝 타이항산(중산 북서쪽 산지)
  // 허베이·베이징·톈진
  ...cut('HE_HD', [['HE_HDS', box(113.3, 35.9, 115.0, 36.45)]], 'HE_HDN'), // 업(린장)·츠현 / 한단·싱타이
  ...cut('HE_SE', [['HE_SEW_S', box(115.0, 35.9, 115.6, 36.45)], ['HE_SEW_N', box(115.0, 36.45, 115.6, 37.45)]], 'HE_SEE'), // 다밍·웨이현 / 추현·광핑 / 칭허 동쪽(제)
  ...cut('HE_C', [['Y_HC', YAN_A], ['ZS_C', box(113.3, 37.6, 115.6, 38.6)], ['HE_CE', box(116.4, 37.0, 118.6, 38.6)]], 'HE_CZ'), // 황화 북쪽 바닷가(연 남장성 북쪽) / 스자좡·딩저우·싱타이 북부(중산) / 창저우 둘레(제) / 헝수이·허젠 쪽(조)
  ...cut('HE_YN', [
    ['Y_YND', YAN_DAI], // 허베이 북부 평원 서쪽 끝(대 땅 상자 안)
    ['Y_YN', YAN_A], // 바오딩 북부·랑팡·탕산 서부(연)
    ['ZS_YN', box(114.8, 38.6, 115.6, 39.4)], // 탕현·왕두·칭위안(중산)
    ['QI_YN', box(116.4, 38.6, 118.3, 39.4)], // 다청·칭현 북부(제)
  ], 'ZH_YN'), // 런추·가오양·안신(조)
  Y_HD: HEX.Y_HD, // 위현·양위안·화이안(대)
  Y_HXL: HEX.Y_HXL, // 청더 동부·친황다오(연의 요서)
  Y_HX: HEX.Y_HX, // 장자커우 북부·청더 서부·라이위안 북쪽(연)
  Y_HXB: HEX.Y_HXB, // 허베이 동쪽 끝(동경 119.8° 동쪽, 연 요서)
  ZS_X: HEX.ZS_X, // 푸핑·링서우 서쪽 산지(중산)
  BJ_Y: M1.BJ_Y, // 베이징 평원(계)
  BJ_X: M1.BJ_X, // 베이징 옌산 북쪽
  ...cut('TJ', [['Y_TJ', YAN_A]], 'TJ_S'), // 톈진 / 톈진 남쪽 끝(징하이·다강 남부)
  // 산둥
  SD_QI1: M1.SD_QI1, // 임치 둘레
  SD_QI2: M1.SD_QI2, // 지난·타이안 북부
  SD_JD: M1.SD_JD, // 자오둥 반도(래)
  ...cut('SD_W', [
    ['SD_WN', box(114.5, 35.95, 117.7, 38.5)], // 랴오청·더저우·타이안 서부(제)
    ['SONG_SD', box(114.5, 34.0, 116.3, 35.4)], // 허쩌 남부(산현·차오현·딩타오, 송)
    ['SD_WW', box(114.5, 35.4, 116.3, 35.95)], // 쥐안청·윈청(위(衛)·제 사이)
  ], 'SD_LU'), // 지닝·취푸·쩌우청·텅저우(노·주·등·설)
  ...cut('SD_SE', [['SD_SEN', box(117.7, 35.3, 121.0, 36.3)]], 'SD_SES'), // 쥐현·이수이·르자오(거) / 린이 남부·탄청(담·난링)
  // 장쑤·상하이·안후이·저장
  JS_CM: M1.JS_CM, // 충밍섬(이 시대에 없던 섬)
  JS_S: M1.JS_S, // 장쑤 남부(오 옛 땅)
  ...cut('JS_X', [['SONG_JS', box(116.3, 33.7, 118.3, 35.2)], ['JS_XE', box(119.0, 32.0, 122.0, 35.2)]], 'JS_XR'), // 쉬저우(팽성, 송) / 장쑤 북부 바닷가(롄윈강·옌청·화이안 동부) / 사수·화이허강 둘레(쑤첸·쓰훙·쉬이)
  SH_CM: M1.SH_CM,
  SH: M1.SH,
  AH_SE: M1.AH_SE, // 안후이 동남부
  AH_W: M1.AH_W, // 안후이 서부
  ...cut('AH_X', [['SONG_AH', box(115.9, 33.4, 117.5, 34.7)], ['AH_HS', box(117.6, 29.3, 119.7, 30.3)]], 'AH_XR'), // 화이베이·쑤저우(宿州)·샤오현(송) / 황산(월) / 안후이 나머지(화이허강 유역·안칭)
  ZJ_N: M1.ZJ_N, // 후저우·자싱
  ...cut('ZJ_X', [['ZJ_YN', box(118.9, 29.0, 122.5, 30.55)]], 'ZJ_XR'), // 사오싱·항저우·닝보·진화(월) / 저장 남부(동구·백월)
  // 후베이
  HB_C1: M1.HB_C1, // 한수이강 중류(영·언·영 둘레)
  HB_E: M1.HB_E, // 후베이 동부
  HB_SY: M1.HB_SY, // 스옌
  ...cut('HB_X', [['HB_XE', box(110.0, 29.0, 110.9, 31.4)]], 'HB_XR'), // 이창 서부(쯔구이·바둥) / 언스(파·만)
  // 후난·장시(FIX1, 2026-10-21 운영자 결정)
  HN_N: I(prov('CN-HN'), box(110.8, 27.5, 114.3, 30.2)), // 둥팅호·창사·창더·웨양·이양·샹탄 둘레(초)
  JX_N: I(prov('CN-JX'), box(115.6, 28.3, 118.5, 30.1)), // 포양호 둘레(번: 주장·포양·난창·징더전·상라오 북부)
};
const CELL_NAMES = Object.keys(CELL);

// ── 나라 버전: [from, to, 칸 목록] (천문 연도, to 미포함) ────────────────
const JIN_452 = ['SX_JC1', 'SX_YC', 'SX_FEN', 'SX_LW', 'HA_W', 'HA_NW_W', 'HA_NW_E', 'SX_SDN', 'SX_SDS', 'SX_TY', 'HE_HDS', 'HE_HDN', 'SX_XS', 'Y_SX', 'Y_HD', 'Y_YND'];
const WU_LAND = ['JS_S', 'SH', 'AH_SE', 'ZJ_N'];
const YUE_LAND = [...WU_LAND, 'ZJ_YN', 'AH_HS', 'JX_N'];
const ZS_LAND = ['ZS_C', 'ZS_YN', 'ZS_X', 'ZS_SX'];
const SONG_N = ['SONG_HA', 'SONG_SD'];
const SONG_S = ['SONG_AH', 'SONG_JS'];
const QI_475 = ['SD_QI1', 'SD_QI2', 'SD_JD', 'SD_WN', 'HE_SEE', 'HE_CE', 'QI_YN', 'TJ_S'];
const QI_431 = [...QI_475, 'SD_SEN'];
const CHU_475 = ['HA_NY', 'HB_C1', 'HB_E', 'HB_SY', 'HA_XY', 'AH_W', 'HA_CS', 'AH_XR', 'HB_XE'];
const CHU_445 = [...CHU_475, 'JS_XR'];
const CHU_381 = [...CHU_445, 'HN_N'];
const CHU_333 = [...CHU_381, ...YUE_LAND, 'JS_XE'];
const CHU_300 = CHU_333.filter((c) => c !== 'HA_NY');
const CHU_286 = [...CHU_300, ...SONG_S, 'SD_SES'];
const CHU_278 = CHU_286.filter((c) => !['HB_C1', 'HB_SY', 'HB_XE'].includes(c));
const CHU_249 = [...CHU_278, 'SD_LU'];
const HAN_453 = ['SX_JC1', 'SX_SDS', 'HA_NW_W', 'HA_CW', 'HA_YZ'];
const HAN_375 = [...HAN_453, 'HA_ZZ'];
const HAN_260 = ['HA_ZZ', 'HA_YZ'];
const HAN_307 = HAN_375.filter((c) => c !== 'HA_CW');
const ZHAO_453 = ['SX_FEN', 'SX_TY', 'SX_SDN', 'SX_XS', 'Y_SX', 'Y_HD', 'Y_YND', 'HE_HDN', 'HE_SEW_N', 'HE_CZ', 'ZH_YN'];
const ZHAO_300 = [...ZHAO_453, 'SX_XN', 'NM_YZ'];
const ZHAO_296 = [...ZHAO_300, ...ZS_LAND];
const ZHAO_247 = ZHAO_296.filter((c) => !['SX_FEN', 'SX_TY', 'SX_SDN'].includes(c));
const WEI_NORTH = ['HE_HDS', 'HA_NW_E', 'HA_NE_W', 'HE_SEW_S'];
const WEI_453 = ['SX_YC', 'SX_LW', 'HA_W', ...WEI_NORTH, 'HA_KF'];
const WEI_409 = [...WEI_453, 'GZ_HX', 'SNX_SJ'];
const WEI_406 = [...WEI_409, ...ZS_LAND];
const WEI_328 = WEI_453.filter((c) => c !== 'HA_W');
const WEI_290 = WEI_328.filter((c) => !['SX_YC', 'SX_LW'].includes(c));
const WEI_284 = [...WEI_290, ...SONG_N];
const WEI_242 = ['HA_KF', 'SONG_HA'];
const YAN_475 = ['Y_YN', 'BJ_Y', 'Y_TJ'];
const YAN_400 = [...YAN_475, 'Y_HXL', 'Y_HX', 'BJ_X', 'Y_HC'];
const YAN_282 = [...YAN_400, 'Y_HXB'];
const YAN_TO_QIN = ['Y_YN', 'BJ_Y', 'Y_TJ', 'Y_HX', 'BJ_X', 'Y_HC'];
const YAN_226 = YAN_282.filter((c) => !YAN_TO_QIN.includes(c));
const QIN_475 = ['GZ_W', 'GZ_E2', 'GZ_HX', 'TS'];
const QIN_409 = ['GZ_W', 'GZ_E2', 'TS'];
const QIN_340 = [...QIN_409, 'SN_SL'];
const QIN_328 = [...QIN_475, 'SN_SL', 'SNX_SJ', 'HA_W'];
const QIN_316 = [...QIN_328, 'SC_B', 'CQ_W', 'SN_HZW'];
const QIN_312 = [...QIN_316, 'SN_HZE'];
const QIN_307 = [...QIN_312, 'HA_CW'];
const QIN_290 = [...QIN_307, 'SX_YC', 'SX_LW', 'HA_NY'];
const QIN_278 = [...QIN_290, 'HB_C1', 'HB_SY', 'HB_XE', 'CQ_E'];
const QIN_272 = [...QIN_278, 'GS_E', 'NX_S', 'SNX_R'];
const QIN_260 = [...QIN_272, 'SX_SDS', 'HA_NW_W', 'SX_JC1'];
const QIN_247 = [...QIN_260, 'SX_SDN', 'SX_FEN', 'SX_TY', 'HA_LUO'];
const QIN_242 = [...QIN_247, ...WEI_NORTH, 'HA_NE_E', 'HA_TQ', 'SONG_SD', 'SD_WW'];
const QIN_230 = [...QIN_242, ...HAN_260];
const QIN_228 = [...QIN_230, ...ZHAO_247.filter((c) => !QIN_230.includes(c))];
const QIN_226 = [...QIN_228, ...YAN_TO_QIN];
const QIN_225 = [...QIN_226, ...WEI_242];
const QIN_223 = [...QIN_225, ...CHU_249];
// 진(秦)이 기원전 226년 차지한 연 땅은 칸이 아니라 연 상자 모양 그대로(I(CHINA, YAN_TO_QIN_226)) 더한다: 북쪽 변이 연 도형과 같은 CHINA 북쪽 선이라
//   흉노 채우기 도형(inner-asia)이 바뀌지 않는다(칸을 합치면 성 경계 꼭짓점이 북쪽 선에 남아 흉노 생성물이 바뀜). 표의 연 칸(YAN_TO_QIN)은 겹침 검사에만 쓴다
const YAN_PART = I([CHINA], YAN_TO_QIN_226);
const TABLE = {
  // 동주 왕실: 뤄양 둘레 왕기(M1과 같은 칸). 기원전 256년(천문 −255) 서주군이 진(秦)에게 무너질 때까지
  'eastern-zhou': [[-474, -255, ['HA_LUO']]],
  // 진(晉): 지씨·범씨·중행씨가 망한 뒤 한·조·위·지 네 집안이 나눠 가진 시기. M1 마지막 모습에 조 양자가 기원전 475년 멸한 대(代)와 신딩 분지를 더함.
  //   기원전 453년(천문 −452) 진양 싸움 뒤 한·조·위가 지씨를 멸하고 실효로 나눠 가졌다(제후 인정 기원전 403년, 남은 땅 분할 기원전 376년)
  'jin-chunqiu': [[-474, -452, JIN_452]],
  // 오: 기원전 473년(천문 −472) 월에게 멸망할 때까지 M1과 같은 모습
  'wu-state': [[-474, -472, WU_LAND]],
  // 월: 오를 멸한 기원전 473년부터 옛 오 땅과 저장 북부(사오싱·항저우·닝보·진화)·황산·포양호 둘레(번: zh 鄱阳县 "越勾践灭吴，并其地，番属越"). 회수 북쪽은 차지하지 못했다(『사기』 초세가 "越已滅吳而不能正江、淮北").
  //   낭야(산둥) 천도는 패권을 위한 것이라 칠하지 않는다. 기원전 333년(천문 −332) 초 위왕이 무강을 죽이고 옛 오 땅~저장을 차지함(306년 설은 결과 노트 6절)
  'yue-state': [[-472, -332, YUE_LAND]],
  // 초: 진(陳, 기원전 479년 병합)·채 옛 땅의 중원 남부, 월이 넘겨준 회수 가 땅(『사기』 월왕구천세가 "句踐已去，渡淮南，以淮上地與楚")과 안칭·이창 서부를 −474부터.
  //   사수(泗水) 둘레는 혜왕 44년(기원전 445년, 『사기』 초세가 "楚東侵，廣地至泗上")부터, 둥팅호·창사 둘레는 오기가 죽은 기원전 381년 전(『후한서』 남만전 "吳起相悼王，南并蠻越，遂有洞庭、蒼梧")부터.
  //   기원전 333년 월 병합(포양호 둘레 포함), 301년 수사 싸움 뒤 완(난양 분지)을 잃음, 286년 송의 화이베이·담 둘레, 278년 백기가 영을 함락해 한수이강 중류·이창 서부·스옌을 잃음, 249년 노 병합
  'chu-state': [[-474, -444, CHU_475], [-444, -380, CHU_445], [-380, -332, CHU_381], [-332, -300, CHU_333], [-300, -285, CHU_300], [-285, -277, CHU_286], [-277, -248, CHU_278], [-248, -222, CHU_249]],
  // 제: 임치 둘레·지난에 래(자오둥, 기원전 567년 병합)·랴오청·더저우와 옛 황허강 동쪽(창저우·칭허 동쪽)을 −474부터. 거(쥐현 둘레)는 기원전 431년 초가 멸한 뒤(en Ju "Conquered by Chu, 431 BC", "Eventually the state was annexed by Qi") −430부터 제로 둠. 기원전 286년 송을 병합했으나
  //   284년 연·진(秦)·위·조·한 연합군에 무너져 송 땅은 위·초가 나눔(제가 가진 2년은 1만~5만 km²·10년 기준 안이라 송 북쪽 땅은 286년부터 위로 그림).
  //   284~279년 연의 점령은 되돌려진 점령이라 칠하지 않음
  'qi-state': [[-474, -430, QI_475], [-430, -220, QI_431]],
  // 진(秦): M1 관중·톈수이 → 기원전 409년 위에게 하서를 잃음 → 340년 상앙을 상·어(상뤄)에 봉함 → 330~328년 하서·상군·섬을 되찾음 → 316년 파·촉(촉이 가진 한중 분지 포함), 312년 초의 한중군(안캉), 307년 이양, 290년 무렵 하동과 완,
  //   278년 남군(영)·무군, 272년 의거를 멸해 간쑤 동부·닝샤 남부·섬서 북부(장성 안), 260년 장평 싸움 뒤 상당 남부·야왕·평양, 247년 상당 북부·태원군과 동주 땅, 242년 위의 동군(20성),
  //   230년 한, 228년 조(대 포함), 226년 연의 계(허베이·베이징, zh 秦滅燕之戰), 225년 위, 223년 초(장난·저장 포함)를 차례로 무너뜨림. 연이 망한 해(기원전 222년, −221)의 요서·요동은
  //   권역 파일의 연 버전이 −221 앞에서 끝나고 진 제국(qin)이 −220부터라 한 해 비운다(기존부터 요동은 빔). 기원전 221년 제를 무너뜨린 뒤는 진 제국(권역 파일 qin)
  'qin-state': [
    [-474, -408, QIN_475], [-408, -339, QIN_409], [-339, -327, QIN_340], [-327, -315, QIN_328], [-315, -311, QIN_316], [-311, -306, QIN_312], [-306, -289, QIN_307], [-289, -277, QIN_290],
    [-277, -271, QIN_278], [-271, -259, QIN_272], [-259, -246, QIN_260], [-246, -241, QIN_247], [-241, -229, QIN_242], [-229, -227, QIN_230], [-227, -225, QIN_228],
    [-225, -224, QIN_226, YAN_PART], [-224, -222, QIN_225, YAN_PART], [-222, -220, QIN_223, YAN_PART],
  ],
  // 한(韓): 기원전 453년 평양(린펀)·상당 남부·야왕·이양·양적(위저우, 기원전 400년 무렵 도읍) → 375년 정을 멸해 신정으로 도읍을 옮김 → 307년 이양을 잃음 → 301~291년 완을 가짐 → 262~260년 상당·야왕·평양을 잃음 → 230년 멸망
  'han-state': [[-452, -374, HAN_453], [-374, -306, HAN_375], [-306, -300, HAN_307], [-300, -289, [...HAN_307, 'HA_NY']], [-289, -259, HAN_307], [-259, -229, HAN_260]],
  // 조: 기원전 453년 진양·펀허강 중류·상당 북부·신딩 분지·대·한단·헝수이 쪽 → 300년 무렵 호복기사(307년) 뒤 임호·누번을 쳐 안문·운중(『사기』 조세가 26년 "攘地…西至雲中、九原") → 296년 중산 병합
  //   → 247년 상당 북부(260년 장평 싸움 뒤 진(秦)이 차지했으나 1만 km² 미만이라 같은 해로)와 태원군을 잃음 → 228년 한단 함락(대(代)의 임시 정권 222년까지는 칠하지 않음)
  'zhao-state': [[-452, -299, ZHAO_453], [-299, -295, ZHAO_300], [-295, -246, ZHAO_296], [-246, -227, ZHAO_247]],
  // 위(魏): 기원전 453년 안읍·하동·섬·업·하내 동부·카이펑 둘레 → 409년 하서·상군 → 328년(330년 하서, 328년 상군, 324년 섬) 진(秦)에게 잃음 → 290년 무렵 하동을 잃음
  //   (406~381년 중산을 다스림) → 286년(제의 송 병합, 284년 제가 무너진 뒤 위가 차지) 송의 북쪽 땅(상추·허쩌) → 242년 진(秦)이 황허강 북쪽과 동군을 차지 → 225년 대량 함락으로 멸망
  'wei-state': [[-452, -408, WEI_453], [-408, -405, WEI_409], [-405, -379, WEI_406], [-379, -327, WEI_409], [-327, -289, WEI_328], [-289, -285, WEI_290], [-285, -241, WEI_284], [-241, -224, WEI_242]],
  // 중산: 타이항산 동쪽 기슭의 스자좡·딩저우·바오딩 남부. 위(魏)가 태자를 봉해 다스린 기원전 406~381년(천문 −405~−380)은 위 땅(월경지, FIX1), 기원전 380년 무렵 다시 일어난 뒤 296년 조에게 멸망
  'zhongshan-state': [[-474, -405, ZS_LAND], [-379, -295, ZS_LAND]],
  // 송: 상추 둘레·허쩌 남부·화이베이·쉬저우(팽성). 기원전 286년(천문 −285) 제에게 병합됨(『묵자』 공수 "宋之地方五百里")
  'song-state': [[-474, -285, [...SONG_N, ...SONG_S]]],
  // 연: 권역 파일(areas/china.mjs)의 yan-state 버전(남쪽 띠를 뺀 모습). 여기서는 칸 겹침 검사에만 쓴다
  'yan-state': [[-474, -399, YAN_475], [-399, -281, YAN_400], [-281, -225, YAN_282], [-225, -221, YAN_226]],
};

// 비운 칸의 이유 (칸 → 이유). 나라가 갖지 않은 칸은 모두 비운다
// - HA_TQ 타이첸 동쪽 끝(위(衛)와 제 사이, 기원전 242년 진(秦) 동군)
// - 화하 밖 집단: SNX_R·GS_E·NX_S 의거·서융(기원전 272년까지), SX_XN·NM_YZ 누번·임호(기원전 301년까지), Y_HX·BJ_X 산융·동호(기원전 400년까지), SC_B·CQ_W 파·촉(기원전 316년까지),
//   SNX_N 진(秦) 장성 밖 임호·누번, CQ_E·HB_XR 파·만, CQ_SE 검중(초·파·만 사이), ZJ_XR 동구·백월, SN_HZW 한중 분지(진(秦)·촉이 다툼, 기원전 316년까지)·SN_HZE 안캉(초·파 사이, 기원전 312년까지), SN_SL 상(기원전 340년까지),
//   JS_XE 장쑤 북부 바닷가(회이와 월의 낭야 길, 기원전 333년까지), JS_XR 사수 둘레(기원전 446년까지), JX_N 포양호 둘레(오 멸망 전), HN_N 둥팅호 둘레(만·월, 기원전 382년까지)
// - 1만 km² 미만 소국: HA_ZZ 정(기원전 375년까지), HA_NE_E·SD_WW 위(衛)(기원전 242년 진(秦) 동군), SD_LU 노·주·등·설(기원전 249년 초가 노를 병합), SD_SES 담·난링(기원전 286년까지), SD_SEN 거(기원전 431년까지)
// - 진(晉) 삼분 전 HE_SEW_S·HE_SEW_N·HE_CZ·ZH_YN 백적·선우 둘레, 오 전 ZJ_YN·AH_HS 월(기원전 473년 전)
// - 연이 망한 해(기원전 222년, 천문 −221) 요서 칸 Y_HXL·Y_HXB(권역 파일의 연 버전이 그 앞에서 끝남)
// - 동주가 무너진 뒤 HA_LUO 동주군(기원전 249년까지)·진(秦) 삼천군 전(기원전 256~248년), 충밍섬 JS_CM·SH_CM(이 시대에 없던 섬)

// ── 기간 나누기: 모든 버전 경계 해 ─────────────────────────────
const M2_FROM = -474, M2_TO = -220;
const cuts = [...new Set([M2_FROM, M2_TO, ...Object.values(TABLE).flatMap((list) => list.flatMap(([f, t]) => [f, t]))])].filter((y) => y >= M2_FROM && y <= M2_TO).sort((a, b) => a - b);
const owned = (year) => {
  const seen = new Map();
  for (const [id, list] of Object.entries(TABLE)) {
    for (const [f, t, cells] of list) {
      if (!(f <= year && year < t)) continue;
      for (const c of cells) {
        if (!CELL[c]) throw new Error(`중국 warring-states: 모르는 칸 ${c} (${id})`);
        if (seen.has(c)) throw new Error(`중국 warring-states: ${year}년 칸 ${c}를 ${seen.get(c)}와 ${id}가 함께 가짐`);
        seen.set(c, id);
      }
    }
  }
  return seen;
};
const build = (cells) => U(...cells.map((c) => CELL[c]));
const DOMAIN = build(CELL_NAMES);
const segments = cuts.slice(0, -1).map((from, i) => {
  const own = owned(from);
  const empty = CELL_NAMES.filter((c) => !own.has(c));
  return { from, to: cuts[i + 1], empty };
});

const versions = {};
for (const [id, list] of Object.entries(TABLE)) {
  if (id === 'yan-state') continue;
  versions[id] = list.map(([from, to, cells, extra]) => [from, to, extra ? U(build(cells.filter((c) => !YAN_TO_QIN.includes(c))), extra) : build(cells)]);
}
/** 작업용: 칸 모음(결과 노트의 넓이 재기·다음 시대 파일이 쓴다. 객체는 고치지 말고 U·D·I로 새 도형을 만든다) */
export const WARRING_STATES_CELLS = CELL;

export const era = {
  name: 'warring-states',
  versions,
  gapZones: segments.map(({ from, to, empty }) => ({ name: `중국 전국 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN, build(empty)) : DOMAIN, from, to })),
  voids: segments.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
};
