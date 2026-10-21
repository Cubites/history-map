// china 시대 파일 sixteen-kingdoms (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 5호 16국(M3): 304 ~ 439
// 짝 항목 파일: data/entities/china-sixteen-kingdoms.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china/의 다른 도우미 모듈. areas/china.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/china/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/china.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 중국 M3a (2026-10-21): 5호 16국 앞쪽 304 ~ 383년(영토는 384 미포함까지) ──────────────────────────
// 등급 '일반'(00-scope 2·3절: 땅 1만 km², 선 평균 10 / 최대 25 km). 새 나라: 한/전조·성한·후조·전량·대(代). 384년부터의 나라(후진·서진(西秦)·허시의 네 량·남연·하·서연·서촉)는 아래 M3b 절(같은 파일)에 있다.
// 짜임: M2 칸(warring-states.mjs의 WARRING_STATES_CELLS)을 이어 쓰고, 몇 칸을 칼선으로 더 쪼개며(합치면 원래 칸, M2 split 꼴), M2에 없던 성 조각
//   (허시 회랑·간쑤 나머지·칭하이 동부·닝샤 북부·네이멍구 나머지·랴오닝 서부·쓰촨 나머지·윈난·구이저우 서부)의 칸을 더한 '바탕 칸'을 만든다.
//   바탕 칸은 다시 기존 나라 도형(areas/china.mjs)의 경계선으로 '조각'을 낸다: 북위 33°선(shared.mjs NORTH_BOX, 동진 SOUTH_PART의 북쪽 변) 남쪽 S,
//   그 북쪽을 동경 111°(전진 351~370 NORTH_WEST의 동쪽 변) 서쪽 W, 111~113° C, 요서(shared.mjs LIAOXI) L, 동경 113° 동쪽·북위 34.5° 북쪽 Y(전연 352~370 YAN_CHINA),
//   그 남쪽 H. 조각 이름은 '<바탕 칸>.<구역>'이고, 표에 바탕 칸 이름만 쓰면 그 칸의 모든 조각(N(…)은 S를 뺀 조각)이다.
//   기존 나라가 어느 해 어느 조각을 덮는지는 existing()이 구역으로 정하고(겹침 검사·비운 땅 계산에만 씀), 새 나라 표(TABLE)와 같은 해 한 조각을 함께 가지면 멈춘다.
//   다만 00-scope 5절 운영자 승인 줄(2026-10-21: 서진 304~316 성한·한/전조 땅과 310~316 대 땅, 동진 317~346 성한 땅(320 월수·333 닝주 포함)·373~383 쓰촨·충칭,
//   전진 351~375 전량·대 땅·373~383 쓰촨·충칭 더함, 전연 352~369 산시 중부 더함)은
//   권역 파일이 기존 도형에서 그 땅을 빼므로(아래 export) 겹침이 아니다.
// 전연 YAN_CHINA의 동쪽 변은 (119.5, 34.5)에서 (123, 39)로 비스듬히 가 자오둥 반도 동쪽 끝(웨이하이·룽청)을 덮지 않는다. 그 좌표를 베끼지 않으려고
//   자오둥 동쪽 칸(SD_JDE, 동경 121° 동쪽)은 352~370년에 비운 땅으로 셈한다(실제로는 일부를 전연이 덮음 — 빈 땅 검사에서만 빠짐).
// 근거: 위키백과 en·zh(scratchpad m3/research/notes-a.md, 결과 노트 1절). 수도 정답표: data/tests/places/east-asia.yaml(중국 M3 줄)
import { D, I, U, box } from '../../lib.mjs';
import { loadFragments } from '../../lib.mjs';
import { CHINA, LIAOXI, NORTH_BOX } from '../../shared.mjs';
import { WARRING_STATES_CELLS as M2 } from './warring-states.mjs';

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
const cut = (name, parts, restName) => split(M2[name], parts, restName);

// ── 칼선 (near:fragments로 근처 조각 확인: 결과 노트 1절). 모두 경위도 상자 변이다 ─────────────
// 동경 105°: 쓰촨 분지의 촉(청두 평원·몐양·러산·쯔궁)과 파(쑤이닝·난충·광안·다저우) 사이. 동경 111.9°: 뤼량산(시허·리스)과 신딩 분지·양취안 사이(M1 타이위안 분지 칸의 서쪽 변과 같은 경도).
// 동경 116°: 장자커우 북부(대의 대녕 둘레)와 청더 서부 사이. 동경 104°·북위 35°: 간쑤의 허시 회랑·란저우·린샤(전량)와 룽유 북부·간난·룽난 사이.
// 북위 32.6°·동경 105.5°·동경 103°·북위 28.5°·동경 103.8°: M2 쓰촨 분지 칸(SC_B) 밖의 쓰촨 북부(인핑)·동북 끝(파서)·서부 고원(원산·한자 서쪽)·량산(월수)·이빈 남부.
// 동경 106.5°·북위 29.5°: 구이저우 서부(흥고·장가 서부, 츠수이 북쪽 끝까지)와 나머지.
// 동경 116°(네이멍구): 펑전·싱허(대)와 그 동쪽 장성 선 가 조각(청더 북쪽 237km², 대 땅에 넣으면 선비 채우기 도형에 꼭짓점이 하나 늘어 비움). 동경 121°: 자오둥 동쪽 끝(위 머리 주석, 기존 전연 도형 셈에만 씀)

// ── 바탕 칸 ─────────────────────────────────────────────
const GS_REST = D(prov('CN-GS'), M2.TS, M2.GS_E);
const SC_REST = D(prov('CN-SC'), M2.SC_B);
const BASE = {
  ...M2,
  // M2 칸을 더 쪼갬 (원래 칸은 아래에서 지움)
  ...split(M2.SC_B, [['SC_SHU', box(100.0, 26.0, 105.0, 34.0)]], 'SC_BA'), // 쓰촨 분지 서쪽(촉: 청두·더양·몐양·러산·야안 동부) / 동쪽(파: 쑤이닝·난충·광안·다저우·쯔궁 동쪽)
  ...cut('SX_XS', [['SX_LL', box(109.0, 36.0, 111.9, 40.0)]], 'SX_XD'), // 뤼량산 중부(시허·리스·팡산·린현, 한(漢)의 근거지) / 신딩 분지·양취안·우타이
  ...cut('Y_HX', [['Y_HXW', box(113.0, 39.0, 116.0, 42.5)]], 'Y_HXE'), // 장자커우 북부·충리·츠청(대의 대녕 둘레) / 청더 서부·펑닝·롼핑
  ...cut('SD_JD', [['SD_JDE', box(121.0, 35.0, 124.0, 39.0)]], 'SD_JDW'), // 자오둥 동쪽 끝(웨이하이·룽청·루산) / 옌타이·라이양·칭다오 북부
  // M2에 없던 땅
  GS_LIANG: I(GS_REST, box(92.0, 35.0, 104.0, 43.0)), // 허시 회랑(둔황·주취안·장예·우웨이)·란저우·린샤·융덩(전량)
  GS_S: I(GS_REST, box(92.0, 30.0, 111.0, 35.0)), // 간난(강족 땅)·룽난(구지)
  GS_LD: D(GS_REST, box(92.0, 30.0, 104.0, 43.0), box(92.0, 30.0, 111.0, 35.0)), // 바이인·징위안·후이닝 쪽 룽유 북부(황허강 동쪽)
  QH_C: prov('CN-QH'), // 칭하이 동부(시닝·하이둥, 전량의 서평군)
  NX_N: D(prov('CN-NX'), M2.NX_S), // 닝샤 북부(인촨 평원, 철불 흉노 쪽)
  ...split(D(prov('CN-NM'), M2.NM_YZ), [['NM_FZ', box(113.0, 39.0, 116.0, 42.0)]], 'NM_X'), // 펑전·싱허(대) / 네이멍구 나머지(오르도스·허타오 서부, 청더 북쪽 장성 선 가, 요서 북쪽 끝)
  LN_X: prov('CN-LN'), // 랴오닝 서부(요하 서쪽, 요서)
  ...split(I(SC_REST, box(100.0, 32.6, 109.0, 35.0)), [['SC_NE', box(105.5, 32.0, 109.0, 35.0)]], 'SC_N'), // 쓰촨 동북 끝(난장·퉁장·완위안 북쪽, 파서) / 쓰촨 북부(인핑·쑹판·칭촨, 저·강족과 구지 쪽)
  SC_W: I(SC_REST, box(100.0, 28.5, 103.0, 32.6)), // 쓰촨 서부 고원(원산·한자 서쪽, 강족 땅)
  ...split(I(SC_REST, box(100.0, 25.0, 109.0, 28.5)), [['SC_LS', box(100.0, 25.0, 103.8, 28.5)]], 'SC_YB'), // 량산·판즈화(월수군) / 이빈·루저우 남부(장양)
  YN_C: prov('CN-YN'), // 윈난(손그림 안: 건녕·운남·흥고·주제)
  GZH_W: I(prov('CN-GZ'), box(103.0, 24.0, 106.5, 29.5)), // 구이저우 서부(비제·류판수이·안순·싱이·츠수이)
  XJ_E: prov('CN-XJ'), // 둔황 서쪽 쿰타그 사막 동쪽 끝(손그림 허시 회랑 서쪽 띠, 허시 회랑을 가진 나라가 함께 가짐)
};
for (const k of ['SC_B', 'SX_XS', 'Y_HX', 'SD_JD']) delete BASE[k];

// ── 조각: 바탕 칸을 기존 나라 경계선(북위 33°, 동경 111°·113°, 북위 34.5°, 요서)으로 나눔 ─────────────
const ZONE_ORDER = ['S', 'W', 'C', 'L', 'Y', 'H'];
const W_BOX = box(70.0, 20.0, 111.0, 50.0);
const C_BOX = box(111.0, 20.0, 113.0, 50.0);
const Y_BOX = box(113.0, 34.5, 130.0, 50.0);
// 아주 작은 조각(경계가 맞닿아 생기는 0에 가까운 것)은 버린다: 평면 넓이 0.0001제곱도(약 1km²) 미만
const deg2 = (multi) => multi.reduce((s, poly) => s + poly.reduce((t, r, i) => { let a = 0; for (let j = 0, k = r.length - 1; j < r.length; k = j++) a += (r[k][0] + r[j][0]) * (r[k][1] - r[j][1]); return t + (i === 0 ? 1 : -1) * Math.abs(a / 2); }, 0), 0);
const CELL = {};
const ZONE = {};
const PIECES = {};
for (const [name, g] of Object.entries(BASE)) {
  const north = I(g, NORTH_BOX);
  const parts = split(north, [['W', W_BOX], ['C', C_BOX], ['L', LIAOXI], ['Y', Y_BOX]], 'H');
  parts.S = D(g, NORTH_BOX);
  PIECES[name] = [];
  for (const z of ZONE_ORDER) {
    if (deg2(parts[z]) < 0.0001) continue;
    CELL[`${name}.${z}`] = parts[z];
    ZONE[`${name}.${z}`] = z;
    PIECES[name].push(`${name}.${z}`);
  }
}
const CELL_NAMES = Object.keys(CELL);
/** 표의 이름 → 조각 이름들. '칸'이면 모든 조각, '칸.구역'이면 그 조각 */
const expand = (n) => {
  if (CELL[n]) return [n];
  if (PIECES[n]?.length) return PIECES[n];
  throw new Error(`중국 sixteen-kingdoms: 모르는 칸 ${n}`);
};
/** 북위 33° 북쪽 조각만 */
const N = (...names) => names.flatMap(expand).filter((c) => ZONE[c] !== 'S');
const all = (...names) => [...new Set(names.flatMap(expand))];
const build = (cells) => U(...cells.map((c) => CELL[c]));

// ── 나라 버전: [from, to, 조각 목록] (to 미포함) ────────────────
// 한/전조(304 한 → 319 조)
const HZ_304 = all('SX_LL');
const HZ_308 = all(...HZ_304, 'SX_JC1', 'SX_LW', 'SX_YC', 'SX_FEN', 'SX_SDS');
const HZ_GUANZHONG = all('GZ_W', 'GZ_E2', 'GZ_HX', 'SN_SL', 'SNX_SJ', 'SNX_R', ...N('SN_HZE', 'HB_SY'));
const HZ_316 = all(...HZ_308, ...HZ_GUANZHONG);
const HZ_318 = all(...HZ_GUANZHONG, 'SX_YC', 'SX_LW');
const HZ_LONGYOU = all('TS', 'GS_E', 'GS_LD', 'NX_S');
const HZ_323 = all(...HZ_318, ...HZ_LONGYOU);
// 후조
const LZ_319 = all(
  'SX_JC1', 'SX_FEN', 'SX_TY', 'SX_SDN', 'SX_SDS', 'SX_LL', 'SX_XD', 'ZS_SX', // 산시
  'HE_HDS', 'HE_HDN', 'HE_SEW_S', 'HE_SEW_N', 'HE_SEE', 'Y_HC', 'ZS_C', 'HE_CE', 'HE_CZ', 'Y_YND', 'Y_YN', 'ZS_YN', 'QI_YN', 'ZH_YN', 'ZS_X', // 허베이
  'BJ_Y', 'BJ_X', 'Y_TJ', 'TJ_S', 'HA_NW_W', 'HA_NW_E', 'HA_NE_W', 'HA_NE_E', 'HA_TQ', 'SD_WN', // 베이징·톈진·허난 황허강 북쪽·산둥 서북부
);
const LZ_323 = all(
  ...LZ_319,
  'SD_QI1', 'SD_QI2', 'SD_JDW', 'SD_JDE', 'SD_WW', 'SONG_SD', 'SD_LU', 'SD_SEN', 'SD_SES', // 산둥(조억의 청주)
  'HA_LUO', 'HA_CW', 'HA_YZ', 'HA_ZZ', 'HA_KF', 'SONG_HA', ...N('HA_CS', 'HA_NY', 'SONG_AH', 'AH_XR', 'SONG_JS', 'JS_XR', 'JS_XE'), // 허난 황허강 남쪽·화이베이(회수까지)
);
const LZ_329 = all(...LZ_323, ...HZ_323, 'HA_W');
const LZ_351 = LZ_329.filter((c) => ZONE[c] !== 'W');
// 성한
const CH_304 = all('SC_SHU');
const CH_311 = all(...CH_304, 'SC_BA', 'SC_YB', 'SC_NE', 'CQ_W');
const CH_314 = all(...CH_311, 'SN_HZW', 'CQ_SE', 'SC_W', 'SC_N.S', 'GS_S.S');
const CH_320 = all(...CH_314, 'SC_LS');
const CH_330 = all(...CH_320, 'CQ_E');
const NZ = all('YN_C', 'GZH_W'); // 닝주(333)
// 전량·대
const LIANG = all('GS_LIANG', 'QH_C', 'XJ_E');
const DAI_CORE = all(...N('NM_YZ', 'SX_XN').filter((c) => ['W', 'C'].includes(ZONE[c])));
const DAI_310 = all(...N('NM_YZ', 'SX_XN'), 'NM_FZ', 'Y_HXW');
const DAI_317 = all(...DAI_310, 'Y_SX', 'Y_HD');
// 00-scope 5절 운영자 승인(2026-10-21): 전진 373~383 쓰촨·충칭·한중 분지 남쪽, 전연 352~369 산시 중부(동경 111~113°, 대 땅 빼고)
const SHU_373_CELLS = all('SC_SHU', 'SC_BA', 'SC_YB', 'SC_LS', 'SC_W', 'SC_NE', 'SN_HZW.S', 'GS_S.S', ...expand('SC_N').filter((c) => ZONE[c] === 'S'), 'CQ_W', 'CQ_SE', 'CQ_E');
const YAN_SHANXI_CELLS = ['SX_JC1', 'SX_FEN', 'SX_TY', 'SX_SDN', 'SX_SDS', 'SX_LL', 'SX_XD', 'SX_YC', 'SX_LW'].flatMap(expand).filter((c) => ZONE[c] === 'C');

const TABLE = {
  // 한/전조: 304년 유연이 좌국성에서 한왕을 칭함(리스·시허 둘레 뤼량산) → 308년 평양군(린펀)·하동·상당(309 호관)·펀허강 중류 → 316년 장안 함락으로 관중·샨베이·상뤄 →
  //   318년 근준의 난 뒤 평양 동쪽을 잃고 유요가 장안에서 즉위(319 국호 조), 관중·하동만 남음 → 323년 진안을 깨고 룽유(톈수이·핑량·딩시) → 329년 후조에게 상규가 함락되어 멸망.
  //   311년 뤄양 함락과 그 뒤 노략은 칠하지 않음, 328년 하동(포판) 상실은 1년이라 새 버전 없음
  'han-zhao': [[304, 308, HZ_304], [308, 316, HZ_308], [316, 318, HZ_316], [318, 323, HZ_318], [323, 329, HZ_323]],
  // 성한: 304년 이웅이 청두를 차지(촉) → 311년 나상이 죽은 뒤 파군·재동(몐양)·장양 → 314년 한중(en Cheng-Han)·부릉 → 320년 월수(량산, 이양이 진의 월수 태수 이쇠의 항복을 받음, zh 李驤 (成漢)) →
  //   330년 파동(펑제·우산, 이수) → 333년 닝주 자사 윤봉이 항복해 남중(윈난·구이저우 서부) → 347년 환온에게 멸망. 쓰촨 서부 고원(원산·한자 서쪽 강족 땅)과 북위 33° 남쪽의 인핑·룽난 남쪽(저족·구지와 다툰 땅)은 314년 한중·한자와 함께 넣음(동진 도형에 떨어진 조각으로 남지 않게, 결과 노트 6절)
  'cheng-han': [[304, 311, CH_304], [311, 314, CH_311], [314, 320, CH_314], [320, 330, CH_320], [330, 333, CH_330], [333, 347, all(...CH_330, ...NZ)]],
  // 후조: 319년 석륵이 양국에서 조왕을 칭함 — 허베이·산시(병주, 316년 이홍이 넘김)·허난 황허강 북쪽·베이징(계)·산둥 서북부 →
  //   323년 조억의 청주(산둥), 322년 조적이 죽은 뒤 되찾은 허난 황허강 남쪽과 화이베이(325년 무렵 회수까지) → 329년 전조를 멸해 관중·룽유·하동·샨베이 →
  //   351년 석지가 죽어 멸망. 350~351년 염위·전연·단제가 떨어져 나간 것은 그리지 않고, 351년 전진이 관중을 차지한 몫(동경 111° 서쪽)만 뺌
  'later-zhao': [[319, 323, LZ_319], [323, 329, LZ_323], [329, 351, LZ_329], [351, 352, LZ_351]],
  // 전량: 317년(서진이 무너진 뒤 건흥 연호를 이어 쓰며 할거) 허시 회랑·란저우·린샤·시닝 → 376년 전진에게 멸망. 335년 뒤 서역 쪽은 손그림 중국 밖이라 그리지 않음
  'former-liang': [[317, 376, LIANG]],
  // 대(代): 310년 대공 책봉(유곤이 구주산 북쪽 형북 5현을 줌)·315년 대왕. 310년 운중(후허하오터·바오터우)·삭주·평성(다퉁, 313년 남도)과 탁발부 동부의 장자커우 북쪽·펑전 →
  //   317년 서진이 무너진 뒤 대군(링추·훈위안·위현) → 352년부터 동경 113° 동쪽은 기존 전연 도형(352~370)이 덮어 운중·삭주만(결과 노트 6a) → 376년 전진에게 멸망
  'tuoba-dai': [[310, 317, DAI_310], [317, 352, DAI_317], [352, 376, DAI_CORE]],
};

// ── 기존 나라(areas/china.mjs·inner-asia.mjs)가 그해 덮는 조각 (겹침 검사·비운 땅 계산에만 씀) ─────────────
const SHU_SET = new Set(SHU_373_CELLS);
const YAN_SX_SET = new Set(YAN_SHANXI_CELLS);
function existing(year, c) {
  const z = ZONE[c];
  if (year < 317) return 'western-jin'; // 304~316 HAN_EMPIRE
  if (z === 'S') return year >= 373 && year < 384 && SHU_SET.has(c) ? 'former-qin' : 'eastern-jin';
  if (year >= 370) return 'former-qin'; // 370~385 NORTH_PART
  if (z === 'L') return year < 337 ? 'xianbei' : 'former-yan'; // 317~336 선비 채우기, 337~ 전연 요서
  if (z === 'W' && year >= 351) return 'former-qin'; // 351~370 NORTH_WEST
  if (z === 'Y' && year >= 352) return c === 'SD_JDE.Y' ? null : 'former-yan'; // 352~370 YAN_CHINA(대각선 밖 자오둥 끝은 빈 땅으로 셈)
  if (z === 'C' && year >= 352 && YAN_SX_SET.has(c)) return 'former-yan'; // 전연 산시 중부(352~369, 승인 줄)
  return null;
}
// 승인 줄(00-scope 5절, 2026-10-21 운영자 승인): 이 기존 나라는 그해 새 나라 땅을 권역 파일에서 뺀다
const APPROVED = [
  ['western-jin', 304, 317, ['cheng-han', 'han-zhao', 'tuoba-dai']],
  ['eastern-jin', 317, 347, ['cheng-han']],
  ['former-qin', 351, 376, ['former-liang', 'tuoba-dai']],
];
const approved = (owner, year, id) => APPROVED.some(([o, f, t, ids]) => o === owner && f <= year && year < t && ids.includes(id));

// ── 기간 나누기 ─────────────────────────────
const M3A_FROM = 304, M3A_TO = 384;
const EXISTING_CUTS = [317, 330, 333, 337, 347, 351, 352, 370, 373, 376];
const cuts = [...new Set([M3A_FROM, M3A_TO, ...EXISTING_CUTS, ...Object.values(TABLE).flatMap((list) => list.flatMap(([f, t]) => [f, t]))])].filter((y) => y >= M3A_FROM && y <= M3A_TO).sort((a, b) => a - b);
const owned = (year) => {
  const seen = new Map();
  for (const [id, list] of Object.entries(TABLE)) {
    for (const [f, t, cells] of list) {
      if (!(f <= year && year < t)) continue;
      for (const c of cells) {
        if (!CELL[c]) throw new Error(`중국 sixteen-kingdoms: 모르는 조각 ${c} (${id})`);
        if (seen.has(c)) throw new Error(`중국 sixteen-kingdoms: ${year}년 조각 ${c}를 ${seen.get(c)}와 ${id}가 함께 가짐`);
        const ex = existing(year, c);
        if (ex && !approved(ex, year, id)) throw new Error(`중국 sixteen-kingdoms: ${year}년 조각 ${c}를 기존 나라 ${ex}와 ${id}가 함께 가짐(승인 줄 밖)`);
        seen.set(c, id);
      }
    }
  }
  for (const c of CELL_NAMES) if (!seen.has(c) && existing(year, c)) seen.set(c, existing(year, c));
  return seen;
};
const DOMAIN = build(CELL_NAMES);
const segments = cuts.slice(0, -1).map((from, i) => {
  const own = owned(from);
  return { from, to: cuts[i + 1], empty: CELL_NAMES.filter((c) => !own.has(c)) };
});

// 비운 조각의 이유 (그해 아무도 갖지 않은 조각)
// - 317~318: 서진이 무너진 뒤 석륵(한의 장수, 319년 후조)과 진 장수들이 다툰 화북 평원·산시 중부, 진왕 사마보(~320)와 진안(~323)의 톈수이·룽유
// - 318: 근준의 난 뒤 평양·뤼량산(319년 석륵이 차지)
// - 317~322: 조적이 되찾은 허난·화이베이(동진 땅이나 기존 동진 도형이 북위 33° 아래뿐, 결과 노트 6a), 317~322 뤄양·317~328 산먼샤 둘레(전조·후조가 다툼)
// - 철불 흉노(유호·유위진)의 오르도스·허타오(NM_X.W)·닝샤 북부·섬서 북부 장성 밖(SNX_N), 강족 간난·구지의 룽난(GS_S), 저·강족의 쓰촨 북부(SC_N.W) — 351년 전진 도형 전까지
// - 청더 서부(Y_HXE, 우문·고막해)·네이멍구 장성 선 가(NM_X.Y)·준거얼 둘레(NM_X.C), 347~350 한중 분지 북쪽(동진이 되찾았으나 기존 동진 도형 밖)
// - 352~369: 동경 111~113°의 뤄양·하내·난양(전연에 더한 것은 산시만), 북위 33~34.5°의 허난·화이베이(전연·동진이 다툼), 자오둥 동쪽 끝(위 머리 주석)

const versions = {};
for (const [id, list] of Object.entries(TABLE)) versions[id] = list.map(([from, to, cells]) => [from, to, build(cells)]);

// ── 중국 M3b (2026-10-21): 5호 16국 뒤쪽 384 ~ 439년(영토는 439년 말 모습까지, 440 미포함) ──────────────────────────
// 새 나라: 후진(後秦)·서진(西秦)·후량(後涼)·남량·북량·서량·남연·하(夏)·서연·서촉. 기존 나라 줄(00-scope 5절 영향표와 2026-10-21 운영자 결정 4~6, scratchpad m3/decisions.md):
//   동진 405~412 서촉 땅을 뺌, 후연 385~396 산둥을 동진에게(394년부터는 광고 둘레 청주·낭야만), 북위 399~409 남연 땅·410~438 산둥 동·남부를 동진·송에게,
//   동진 385~419·송 420~438 화이베이·허난·산둥(사료 해대로)을 더함, 북위 427~438 오르도스·샨베이·관중·핑량(하 땅)을 더함, 전진 385~393 잔존 정권(부등)을 더함.
// 짜임: M3a 조각을 다시 나눈 'M3b 조각'을 쓴다(M3a 조각·표·구간은 그대로 두어 304~383년 결과가 바뀌지 않게 함).
//   - 북위 386~436 SHANXI_N(areas/china.mjs, 동경 110~113°·북위 37.5~41.5° 상자)과 같은 상자로 W·C 조각을 나눠 그 안을 구역 X(이름 '<칸>.XW'·'<칸>.XC')로 둔다.
//     X는 386년부터 늘 기존 북위 땅이라 새 나라는 갖지 않는다(서연의 타이위안, 하의 오르도스 동쪽 끝 — 결과 노트 7절).
//   - 허시 회랑(GS_LIANG.W)을 둔황(LG_DH, 동경 97° 서쪽)·주취안(LG_JQ, 97~99.3°)·장예(LG_ZY, 99.3~101.3°)·우웨이(LG_WW, 101.3° 동쪽·북위 37° 북쪽)·
//     란저우·융덩(LZ_N, 북위 35.8~37°)·린샤(LZ_S, 북위 35.8° 남쪽)로, 간쑤 동부(GS_E.W)를 룽시·남안(GS_EW, 동경 105.3° 서쪽)·톈수이 남쪽(GS_ES, 북위 34.8° 남쪽)과 핑량·칭양(GS_EE)으로 나눈다.
//   - 따로 떨어진 성 조각 끝(월경지가 되지 않게 이웃 묶음에 붙임): 칭하이의 쑤베이 남쪽 끝(QH_HX → 둔황 묶음), 간쑤의 환현·칭양 북쪽(GS_LDE → 핑량·칭양 묶음),
//     섬서의 룽현 북쪽 끝(SNX_RW → 핑량·칭양 묶음), 산둥의 선현 쪽 끝(SD_WWX → 늘 기존 후연·북위)
const SHANXI_N_BOX = box(110.0, 37.5, 113.0, 41.5); // 기존 북위 SHANXI_N과 같은 상자(좌표 베끼기 아님: 같은 기존 경계선)
// 칼선: 동경 97°(둔황/주취안, 옥문 서쪽)·99.3°(주취안/장예, 가오타이 서쪽)·101.3°(장예/우웨이, 산단 동쪽)·북위 37°(우웨이 분지/융덩·톈주 남쪽)·북위 35.8°(란저우/린샤)·
//   동경 105.3°(룽시·퉁웨이/징닝·핑량)·북위 34.8°(톈수이 남쪽/핑량). 나머지 상자는 성 조각의 떨어진 끝만 고름. 강 키 없음(경위도 상자 변)
const SUBCUT = {
  'GS_LIANG.W': [[['LG_DH', box(92.0, 35.0, 97.0, 43.0)], ['LG_JQ', box(97.0, 35.0, 99.3, 43.0)], ['LG_ZY', box(99.3, 35.0, 101.3, 43.0)], ['LG_WW', box(101.3, 37.0, 104.0, 43.0)], ['LZ_N', box(101.3, 35.8, 104.0, 37.0)]], 'LZ_S'],
  'GS_E.W': [[['GS_EW', box(103.0, 33.0, 105.3, 38.0)], ['GS_ES', box(105.3, 33.0, 108.8, 34.8)]], 'GS_EE'],
  'QH_C.W': [[['QH_HX', box(90.0, 38.3, 98.5, 41.0)]], 'QH_C'],
  'GS_LD.W': [[['GS_LDE', box(106.0, 35.0, 108.0, 38.0)]], 'GS_LD'],
  'SNX_R.W': [[['SNX_RW', box(106.0, 34.5, 107.3, 35.6)]], 'SNX_R'],
  'SD_WW.Y': [[['SD_WWX', box(114.5, 35.75, 115.6, 36.0)]], 'SD_WW'],
};
const CELL_B = {};
const ZONE_B = {};
const PIECES_B = {};
const addB = (cell, z, g, name = `${cell}.${z}`) => {
  if (deg2(g) < 0.0001) return;
  CELL_B[name] = g;
  ZONE_B[name] = z;
  (PIECES_B[cell] ??= []).push(name);
};
for (const [p, g0] of Object.entries(CELL)) {
  const cell = p.slice(0, p.lastIndexOf('.'));
  const z = ZONE[p];
  let g = g0;
  if (z === 'W' || z === 'C') {
    addB(cell, 'X', I(g0, SHANXI_N_BOX), `${cell}.X${z}`);
    g = D(g0, SHANXI_N_BOX);
  }
  if (SUBCUT[p]) {
    const [parts, restName] = SUBCUT[p];
    for (const [n, m] of Object.entries(split(g, parts, restName))) addB(n, z, m);
  } else addB(cell, z, g, p);
}
const CELL_B_NAMES = Object.keys(CELL_B);
/** 이름 → M3b 조각들. '칸'이면 X를 뺀 모든 조각, '칸.구역'이면 그 조각 */
const pb = (...names) => [...new Set(names.flatMap((n) => {
  if (CELL_B[n]) return [n];
  const list = (PIECES_B[n] ?? []).filter((c) => ZONE_B[c] !== 'X');
  if (!list.length) throw new Error(`중국 sixteen-kingdoms M3b: 모르는 칸 ${n}`);
  return list;
}))];
const buildB = (cells) => U(...cells.map((c) => CELL_B[c]));

// ── M3b 땅 묶음 ─────────────
// 허시 회랑·룽시
const DH = pb('LG_DH', 'XJ_E', 'QH_HX'); // 둔황·과저우(둔황군, 옥문 서쪽)와 그 서쪽 띠, 쑤베이 남쪽 끝
const JQ = pb('LG_JQ'); // 주취안·자위관·위먼
const ZY = pb('LG_ZY'); // 장예·가오타이(건강)·산단
const WW = pb('LG_WW'); // 우웨이 분지(고장)·융창·구랑
const LZN = pb('LZ_N'); // 란저우(금성)·융덩·톈주 남부
const LZS = pb('LZ_S'); // 린샤(포한)·허정·지스산
const QH = pb('QH_C'); // 시닝(서평)·하이둥(낙도)
const LD = pb('GS_LD'); // 위중(용사성·원천)·바이인·징위안(도견산)·후이닝
const GEW = pb('GS_EW'); // 룽시·린타오·웨이위안·퉁웨이(남안·농서)
const GEE = pb('GS_EE', 'GS_LDE', 'SNX_RW'); // 핑량·칭양·징닝·징촨(안정·고평 남쪽)과 환현, 룽현 북쪽 끝
const TSB = pb('TS', 'GS_ES'); // 톈수이(상규)와 그 남쪽·동쪽(후이현·칭수이)
const NXS = pb('NX_S'); // 구위안(고평)
const NXN = pb('NX_N'); // 닝샤 북부(인촨 평원)
// 샨베이·오르도스·관중
const ORDOS = pb('NM_X.W', 'SNX_N', 'NM_YZ.W'); // 오르도스·허타오 서부·위린 북부 장성 밖(동경 110° 동쪽은 기존 북위 SHANXI_N)
const NSX = pb('SNX_R', 'SNX_SJ'); // 샨베이 장성 안(옌안·쑤이더·위린 남부·황룽)
const GZE = pb('GZ_E2', 'GZ_HX'); // 관중 동·중부(시안·셴양·웨이난·퉁촨, 야오현 북지)·뤄허강 동쪽
const GZW = pb('GZ_W'); // 관중 서부(바오지·펑샹)
const SL = pb('SN_SL'); // 상뤄
const HEDONG = pb('SX_YC'); // 윈청 분지(하동, 포판)
// 산시 중남부(서연): 평양(린펀)·펀허강 중류·상당(창즈) 서쪽·뤼량산 남부와 북위 37.5° 남쪽 끝(타이위안 분지 남쪽 등)
const WY_SX = pb('SX_JC1', 'SX_FEN', 'SX_SDN.C', 'SX_SDS.C', 'SX_LW', 'SX_LL.W', 'SX_LL.C', 'SX_TY.C', 'SX_XD.C');
// 허난·화이베이·산둥
const LUOYANG = pb('HA_LUO.C', 'HA_CW.C', 'HA_CW.W', 'HA_W.C', 'HA_W.W', 'HA_YZ.C', 'HA_ZZ.C'); // 뤄양 분지·산먼샤·이양·쑹현(사주)
const HENAN_N = pb('HA_ZZ.H', 'HA_YZ.H', 'HA_KF.H', 'HA_LUO.H'); // 쉬창·핑딩산·위저우·웨이스(423년 북위가 차지)
const HUAI_N = pb('HA_CS.H', 'SONG_HA.H', 'HA_NY.H', 'HA_NY.C', 'HA_NY.W', 'HB_SY.W', 'HB_XR.C', 'HB_XR.W', 'AH_XR.H', 'SONG_AH.H', 'SONG_JS.H', 'JS_XR.H', 'JS_XE.H', 'SD_LU.H', 'SD_SES.H'); // 북위 33~34.5°: 저우커우·상추·난양 북쪽·화이베이·쑤저우·쉬저우(팽성)·쑤첸
const JSY = pb('JS_XE.Y', 'JS_XR.Y', 'SONG_JS.Y', 'SONG_AH.Y'); // 북위 34.5° 북쪽 장쑤·안후이 끝(롄윈강·간위·피저우 북쪽, 동해·낭야 남쪽)
const SY = [...pb('SD_QI1.Y', 'SD_QI2.Y', 'SD_JDW.Y', 'SD_JDE.Y', 'SD_SEN.Y', 'SD_SES.Y', 'SD_LU.Y'), ...JSY]; // 남연: 동쪽 바다·남쪽 사수(롄윈강·피저우 북쪽까지)·서쪽 거야택·북쪽 황허강(zh 南燕)
const SD_385 = [...SY, ...pb('SD_WW.Y', 'SONG_SD.Y')]; // 동진 385~393: 연·청·서주(옛 황허강 북쪽 랴오청·더저우와 타이첸은 후연)
const SD_394 = [...pb('SD_QI1.Y', 'SD_JDW.Y', 'SD_JDE.Y', 'SD_SEN.Y', 'SD_SES.Y'), ...JSY]; // 동진 394~396: 광고 둘레 청주·자오둥·쥐현·낭야(후연이 산둥 서·북쪽)
// 쓰촨(서촉)
const WS_405 = pb('SC_SHU', 'SC_BA', 'SC_YB', 'SC_NE', 'CQ_W'); // 청두 평원·쓰촨 분지 동쪽·이빈 남부·파군(충칭 서부)
const WS_410 = [...WS_405, ...pb('CQ_E', 'CQ_SE')]; // + 파동(펑제·우산)·부릉(충칭 동남부)

// ── M3b 나라 표: [from, to, 조각 목록] (to 미포함). 기존 나라(전진·동진·송·북위)의 줄은 권역 파일이 기존 도형에 더하는 땅이고 era에는 넣지 않는다 ─────
const LQ_386 = [...GZE, ...SL, ...NSX];
const LQ_394 = [...LQ_386, ...GZW, ...GEE, ...TSB, ...NXS, ...HEDONG];
const LQ_399 = [...LQ_394, ...LUOYANG];
const LQ_400 = [...LQ_399, ...LD, ...LZN, ...LZS, ...GEW];
const minus = (list, ...drop) => { const d = new Set(drop.flat()); return list.filter((c) => !d.has(c)); };
const LQ_408 = minus(LQ_400, NSX, NXS);
const LQ_409 = minus(LQ_408, LD, LZN);
const LQ_412 = minus(LQ_409, LZS, GEW);
const LQ_413 = minus(LQ_412, GEE);
const LQ_416 = minus(LQ_413, LUOYANG);
const XIA_407 = [...ORDOS, ...NXN];
const XIA_408 = [...XIA_407, ...NXS, ...NSX];
const XIA_413 = [...XIA_408, ...GEE];
const XIA_418 = [...XIA_413, ...GZE, ...GZW, ...TSB, ...HEDONG];
const XIA_427 = [...GZE, ...GZW, ...GEE, ...NXS, ...TSB];
const XIA_430 = [...GEE, ...NXS, ...TSB];
const EJ_N = { 385: [...HENAN_N, ...HUAI_N, ...LUOYANG, ...SD_385], 394: [...HENAN_N, ...HUAI_N, ...LUOYANG, ...SD_394], 397: [...HENAN_N, ...HUAI_N, ...LUOYANG], 399: [...HENAN_N, ...HUAI_N], 410: [...HENAN_N, ...HUAI_N, ...SY], 416: [...HENAN_N, ...HUAI_N, ...SY, ...LUOYANG] };
const LS_N = { 420: EJ_N[416], 423: [...HUAI_N, ...SY] };
// 북위에 더하는 땅(키 = 버전 첫 해): 391 오르도스(결정 11), 397 산시 중남부(결정 10), 407 오르도스를 하에게, 423 뤄양·쉬창(결정 12), 427·430·431 하 옛 땅(결정 5)
const WEI_ADD = { 391: ORDOS, 397: [...ORDOS, ...WY_SX], 407: WY_SX, 423: [...WY_SX, ...LUOYANG, ...HENAN_N] };
WEI_ADD[427] = [...WEI_ADD[423], ...ORDOS, ...NSX, ...NXN];
WEI_ADD[430] = [...WEI_ADD[427], ...GZE, ...GZW];
WEI_ADD[431] = [...WEI_ADD[430], ...GEE, ...NXS, ...TSB];
const TYH_430 = [...LZS, ...LZN, ...LD]; // 토욕혼 430~438: 서진(西秦) 옛 땅(포한·금성·원천, 결정 13)
const FQ_385 = [...GEW, ...pb('GS_EE', 'SNX_RW'), ...TSB, ...GZW, ...NXS]; // 환현(GS_LDE)은 비움: 391~393 북위 오르도스와 맞닿아 색이 비슷한 두 기존 나라가 붙지 않게(4천 km²대)
const EXTERNAL = new Set(['former-qin', 'eastern-jin', 'liu-song', 'northern-wei', 'tuyuhun']);

const TABLE_B = {
  // 후진(後秦): 384년 요장이 북지(야오현)에서 만년진왕 → 386년 장안을 차지해 관중 동·중부·상뤄·샨베이 → 394년 전진 잔존 정권을 멸해 관중 서부·핑량·톈수이·구위안과 하동(포판) →
  //   399년 뤄양 → 400년 서진(西秦) 땅(위중·란저우·린샤·룽시) → 408년 샨베이·고평을 하에게(en Yao Xing "all of modern northern Shaanxi to fall into Xia hands") →
  //   409년 서진(西秦) 복국으로 위중·란저우 → 412년 린샤·룽시(서진(西秦) 포한 천도 무렵) → 413년 핑량·칭양을 하에게 → 416년 뤄양을 동진에게 → 417년 장안 함락으로 멸망.
  //   403~406 고장(우웨이) 지배는 3년이라, 405년 한수 북쪽 12군 반환은 범위가 불확실해 그리지 않음
  'later-qin': [[386, 394, LQ_386], [394, 399, LQ_394], [399, 400, LQ_399], [400, 408, LQ_400], [408, 409, LQ_408], [409, 412, LQ_409], [412, 413, LQ_412], [413, 416, LQ_413], [416, 417, LQ_416]],
  // 서진(西秦): 385년 걸복국인이 용사천(위중)에서 일어남(388 금성 천도) → 394년 부등이 죽은 뒤 룽시·남안 → 400년 후진에게 망함 → 409년 원천·도견산(위중·징위안)에서 복국 →
  //   412년 포한(린샤)으로 옮기며 린샤·룽시 → 414년 남량을 멸해 시닝·하이둥 → 429년 북량에게 서평(시닝)을 잃음(en Qifu_Mumo "In spring 429, Juqu Mengxun captured Xiping.") → 430년 토욕혼에게 서쪽 땅을 잃고 남안만 → 431년 하에게 멸망
  'western-qin': [[385, 394, [...LD, ...LZN, ...LZS]], [394, 400, [...LD, ...LZN, ...LZS, ...GEW]], [409, 412, [...LD, ...LZN]], [412, 414, [...LD, ...LZN, ...LZS, ...GEW]], [414, 429, [...LD, ...LZN, ...LZS, ...GEW, ...QH]], [429, 430, [...LD, ...LZN, ...LZS, ...GEW]], [430, 431, GEW]],
  // 후량(後涼): 386년 여광이 고장에 들어가 허시 회랑(둔황~우웨이)·시닝 → 397년 남량·북량이 갈라져 우웨이 분지만 → 403년 여륭이 후진에게 항복
  'later-liang-lu': [[386, 397, [...DH, ...JQ, ...ZY, ...WW, ...QH]], [397, 403, WW]],
  // 남량: 397년 독발오고가 서평왕(시닝·하이둥) → 406년 후진에게서 고장을 받음 → 410년 고장을 떠나 낙도로 → 414년 서진(西秦)에게 멸망
  'southern-liang': [[397, 406, QH], [406, 410, [...QH, ...WW]], [410, 414, QH]],
  // 북량: 397년 단업이 건강(가오타이)에서 일어나 장예·주취안·둔황 → 400년 둔황이 서량으로 → 401년 주취안이 서량으로 → 411년 고장(우웨이)을 차지(412 천도) →
  //   420년 주취안 → 421년 둔황(서량 멸망) → 429년 서진(西秦)의 서평·낙도(시닝·하이둥, zh 沮渠安周 낙도 태수) → 439년 북위에게 멸망(고창 잔존은 그리지 않음)
  'northern-liang': [[397, 400, [...DH, ...JQ, ...ZY]], [400, 401, [...JQ, ...ZY]], [401, 411, ZY], [411, 420, [...ZY, ...WW]], [420, 421, [...JQ, ...ZY, ...WW]], [421, 429, [...DH, ...JQ, ...ZY, ...WW]], [429, 439, [...DH, ...JQ, ...ZY, ...WW, ...QH]]],
  // 서량: 400년 이고가 둔황에서 자립(옥문 서쪽) → 401년 주취안 → 420년 주취안을 북량에게 잃음 → 421년 둔황 함락으로 멸망
  'western-liang': [[400, 401, DH], [401, 420, [...DH, ...JQ]], [420, 421, DH]],
  // 남연: 398년 모용덕이 활대에서 연왕(활대 시기는 2년이라 그리지 않음) → 399년 청주를 차지해 광고에 자리 잡음(400년 칭제) → 410년 유유가 광고를 함락
  'southern-yan': [[399, 410, SY]],
  // 하(夏): 407년 혁련발발이 고평에서 몰혁간을 치고 오르도스(대성)·닝샤 북부 → 408년 샨베이·고평 → 413년 통만성을 쌓고 핑량·칭양(417년 전 룽둥) →
  //   418년 장안을 함락해 관중·톈수이·하동 → 427년 북위가 통만성을 함락(오르도스·샨베이를 잃음, 하동은 426년 포기) → 430년 관중을 북위에게 → 431년 토욕혼에게 사로잡혀 멸망.
  //   426~427 북위의 장안 점령은 428년 하가 되찾아(2년) 관중은 430년까지 하로 둠
  'helian-xia': [[407, 408, XIA_407], [408, 413, XIA_408], [413, 418, XIA_413], [418, 427, XIA_418], [427, 430, XIA_427], [430, 431, XIA_430]],
  // 서연: 384년 모용홍이 일어나 385~386 장안(1년, 그리지 않음) → 386년 모용영이 장자(창즈)에 도읍해 산시 중남부와 하동 → 394년 후연에게 멸망.
  //   타이위안 둘레(북위 37.5° 북쪽)는 기존 북위 SHANXI_N, 타이항산 동쪽은 기존 후연 YAN_CHINA라 비켜 감(결과 노트 7절)
  'western-yan': [[386, 394, [...WY_SX, ...HEDONG]]],
  // 서촉: 405년 초종이 청두에서 성도왕(촉·파 서부) → 410년 무렵 파동·부릉 → 413년 주령석이 청두를 함락. 동진 405~412에서 뺌(승인 줄)
  'western-shu': [[405, 410, WS_405], [410, 413, WS_410]],
  // 기존 나라에 더하는 땅(권역 파일이 씀): 전진 385~393 잔존 정권(결정 6), 동진·송의 회수 북쪽(결정 4), 북위 391~406 오르도스(결정 11, en Emperor_Daowu 391 열박)·397~438 산시 중남부(결정 10, 396 가을 병주)·
//   423~438 뤄양·쉬창(결정 12, en Taiwu)·427~438 하 옛 땅(결정 5), 토욕혼 430~438 서진(西秦) 서쪽 옛 땅(결정 13, zh 乞伏暮末 "西秦故地已為吐谷渾所佔領")
  'former-qin': [[385, 394, FQ_385]],
  'eastern-jin': [[385, 394, EJ_N[385]], [394, 397, EJ_N[394]], [397, 399, EJ_N[397]], [399, 410, EJ_N[399]], [410, 416, EJ_N[410]], [416, 420, EJ_N[416]]],
  'liu-song': [[420, 423, LS_N[420]], [423, 439, LS_N[423]]],
  'northern-wei': [[391, 397, WEI_ADD[391]], [397, 407, WEI_ADD[397]], [407, 423, WEI_ADD[407]], [423, 427, WEI_ADD[423]], [427, 430, WEI_ADD[427]], [430, 431, WEI_ADD[430]], [431, 439, WEI_ADD[431]]],
  // 토욕혼(inner-asia.mjs)에 더하는 땅(결정 13): 430년 서진(西秦)의 서쪽 옛 땅
  tuyuhun: [[430, 439, TYH_430]],
};

// 기존 나라(areas/china.mjs)가 그해 덮는 M3b 조각 (겹침 검사·비운 땅 계산에만 씀)
function existingB(year, c) {
  const z = ZONE_B[c];
  if (z === 'S') return year < 420 ? 'eastern-jin' : 'liu-song'; // SOUTH_PART
  if (year < 385) return 'former-qin'; // 384 NORTH_PART
  if (year >= 439) return 'northern-wei'; // 439~ NORTH_PART
  if (z === 'L') return year < 407 ? 'later-yan' : year < 436 ? 'northern-yan' : 'northern-wei'; // 요서
  if (z === 'Y') return c === 'SD_JDE.Y' ? null : year < 397 ? 'later-yan' : 'northern-wei'; // YAN_CHINA(대각선 밖 자오둥 끝은 빈 땅으로 셈 — M3a와 같음)
  if (z === 'X') return year >= 386 ? 'northern-wei' : null; // SHANXI_N
  return null;
}
// 승인 줄(00-scope 5절 동진 405~413 서촉, 2026-10-21 운영자 결정 4): 이 기존 나라는 그해 새 나라·동진 땅을 권역 파일에서 뺀다
const APPROVED_B = [
  ['eastern-jin', 405, 413, ['western-shu']],
  ['later-yan', 385, 397, ['eastern-jin']],
  ['northern-wei', 399, 410, ['southern-yan']],
  ['northern-wei', 410, 439, ['eastern-jin', 'liu-song']],
];
const approvedB = (owner, year, id) => APPROVED_B.some(([o, f, t, ids]) => o === owner && f <= year && year < t && ids.includes(id));
const M3B_FROM = 384, M3B_TO = 440;
const EXISTING_CUTS_B = [385, 386, 397, 407, 420, 436, 439];
const cutsB = [...new Set([M3B_FROM, M3B_TO, ...EXISTING_CUTS_B, ...Object.values(TABLE_B).flatMap((list) => list.flatMap(([f, t]) => [f, t]))])].filter((y) => y >= M3B_FROM && y <= M3B_TO).sort((a, b) => a - b);
const ownedB = (year) => {
  const seen = new Map();
  for (const [id, list] of Object.entries(TABLE_B)) {
    for (const [f, t, cells] of list) {
      if (!(f <= year && year < t)) continue;
      for (const c of cells) {
        if (!CELL_B[c]) throw new Error(`중국 sixteen-kingdoms M3b: 모르는 조각 ${c} (${id})`);
        if (seen.has(c)) throw new Error(`중국 sixteen-kingdoms M3b: ${year}년 조각 ${c}를 ${seen.get(c)}와 ${id}가 함께 가짐`);
        const ex = existingB(year, c);
        if (ex && ex !== id && !approvedB(ex, year, id)) throw new Error(`중국 sixteen-kingdoms M3b: ${year}년 조각 ${c}를 기존 나라 ${ex}와 ${id}가 함께 가짐(승인 줄 밖)`);
        seen.set(c, id);
      }
    }
  }
  for (const c of CELL_B_NAMES) if (!seen.has(c) && existingB(year, c)) seen.set(c, existingB(year, c));
  return seen;
};
const DOMAIN_B = buildB(CELL_B_NAMES);
const segmentsB = cutsB.slice(0, -1).map((from, i) => {
  const own = ownedB(from);
  return { from, to: cutsB[i + 1], empty: CELL_B_NAMES.filter((c) => !own.has(c)) };
});
// 비운 조각의 이유 (그해 아무도 갖지 않은 조각, 384~439)
// - 385: 전진이 무너진 해 — 관중 동부(서연 모용충의 장안, 1년)·북지(요장)·산시 중남부(진양 부비, 1년)·허시 회랑(여광이 돌아오기 전)·시닝, 북위 SHANXI_N 서기 전의 산시 북부(X)
// - 철불 흉노 유위신(386~390)의 오르도스·허타오 서부·위린 북부(391년부터 북위, 결정 11)와 386~406 닝샤 북부(인촨 평원), 385~393 환현(GS_LDE, 전진 잔존 정권과 북위 오르도스 사이)
// - 강족·구지(양씨)의 간난·룽난(GS_S), 저·강족의 쓰촨 북부(SC_N.W), 동진과 구지·서촉이 다툰 한중 분지 북쪽(SN_HZW.W·SN_HZE.W), 하내 서부(지위안, HA_NW_W.C)
// - 394~396: 서연이 망한 뒤 후연이 가진 산시 중남부(기존 후연 도형 밖, 397년부터 북위 — 결정 10), 417: 후진이 망하고 하가 오기 전 관중·톈수이·하동·상뤄(동진 유유의 1년 점령은 그리지 않음),
//   418~: 상뤄(동진·하·북위가 다툼), 427~: 북위가 다시 차지한 하동, 431~: 톈수이 서쪽 서진(西秦) 옛 땅(토욕혼·북량이 다툼)
// - 403~405·410: 우웨이 분지(후진의 고장 3년, 남량이 떠나고 북량이 오기 전 1년), 429: 위중·란저우·린샤 밖은 없음(시닝·하이둥은 429년부터 북량, 린샤·란저우·위중은 430년부터 토욕혼)
// - 397~398: 자오둥 동쪽 끝(기존 북위 도형 대각선 밖). 423년부터 뤄양·쉬창은 북위(결정 12, 430년 도언지 북벌은 그리지 않음)
for (const [id, list] of Object.entries(TABLE_B)) if (!EXTERNAL.has(id)) versions[id] = list.map(([from, to, cells]) => [from, to, buildB(cells)]);

/** 작업용: 조각 모음(결과 노트의 넓이 재기·M3b 조각의 바탕. 객체는 고치지 말고 U·D·I로 새 도형을 만든다) */
export const SIXTEEN_KINGDOMS_CELLS = CELL;
/** 권역 파일이 기존 나라 도형에서 새 나라 땅을 뺄 때 쓴다: D(base, ...parts) 뒤 조각 경계의 어긋남으로 남는 넓이 0에 가까운 폴리곤(0.0001제곱도 미만)을 버린다 */
export const cutOut = (base, ...parts) => D(base, ...parts).filter((poly) => deg2([poly]) >= 0.0001);
// 권역 파일(areas/china.mjs)이 기존 나라 도형에서 빼거나 더하는 땅 (00-scope 5절 승인 줄)
/** 성한 버전 땅(키 = 버전 첫 해): 서진 304~316·동진 317~346에서 뺀다 */
export const CHENG_HAN_LAND = { 304: build(CH_304), 311: build(CH_311), 314: build(CH_314), 320: build(CH_320), 330: build(CH_330) };
/** 한/전조 버전 땅: 서진 304~316에서 뺀다 */
export const HAN_ZHAO_LAND = { 304: build(HZ_304), 308: build(HZ_308), 316: build(HZ_316) };
/** 성한의 닝주(333~346, 윈난·구이저우 서부) — 동진에서 뺀다 */
export const NINGZHOU = build(NZ);
/** 전량 땅·대의 운중·삭주(352~376 모습): 전진 351~375에서 뺀다 */
export const LIANG_LAND = build(LIANG);
export const DAI_LAND = build(DAI_CORE);
/** 대의 310~316 땅: 서진 310~316에서 뺀다 */
export const DAI_310_LAND = build(DAI_310);
/** 전진이 373년 차지한 양·익 두 주(쓰촨·충칭·한중 분지 남쪽) — 동진 373~383에서 빼고 전진에 더한다 */
export const SHU_373 = build(SHU_373_CELLS);
/** 전연 352~369의 산시 중부(동경 111~113°, 대 땅 빼고) — 전연에 더한다 */
export const YAN_SHANXI = build(YAN_SHANXI_CELLS);

// 중국 M3b: 권역 파일이 기존 나라 도형에 더하거나 빼는 땅 (00-scope 5절 동진 405~413 서촉 줄, 2026-10-21 운영자 결정 4~6)
/** 서촉 버전 땅(405·410): 동진 405~412에서 뺀다 */
export const WESTERN_SHU_LAND = { 405: buildB(WS_405), 410: buildB(WS_410) };
/** 동진(385~419)·송(420~438)의 북위 33° 북쪽 땅(키 = 버전 첫 해): SOUTH_PART에 더한다 */
export const EASTERN_JIN_NORTH = Object.fromEntries(Object.entries(EJ_N).map(([y, c]) => [y, buildB(c)]));
export const LIU_SONG_NORTH = Object.fromEntries(Object.entries(LS_N).map(([y, c]) => [y, buildB(c)]));
/** 후연에서 뺄 산둥: 385~393 연·청·서주(SHANDONG_385), 394~396 광고 둘레 청주·낭야(SHANDONG_394) */
export const SHANDONG_385 = buildB(SD_385);
export const SHANDONG_394 = buildB(SD_394);
/** 북위에서 뺄 산둥: 399~409 남연 땅, 410~438 남연 옛 땅과 롄윈강·피저우 북쪽(동진·송) */
export const SOUTHERN_YAN_LAND = buildB(SY);
export const SHANDONG_410 = buildB(SY);
/** 북위에 더할 땅(키 = 버전 첫 해): 391 오르도스, 397 + 산시 중남부, 407 오르도스를 하에게, 423 + 뤄양·쉬창, 427 + 하의 오르도스·샨베이·닝샤 북부, 430 + 관중, 431 + 핑량·칭양·구위안·톈수이 */
export const WEI_XIA_LAND = Object.fromEntries(Object.entries(WEI_ADD).map(([y, c]) => [y, buildB(c)]));
/** 토욕혼 430~438에 더할 서진(西秦) 서쪽 옛 땅(린샤·란저우·위중, 결정 13) */
export const TUYUHUN_430 = buildB(TYH_430);
/** 전진 385~393 잔존 정권(부등의 남안·룽둥·톈수이·관중 서부·고평) */
export const FORMER_QIN_385 = buildB(FQ_385);

export const era = {
  name: 'sixteen-kingdoms',
  versions,
  gapZones: [
    ...segments.map(({ from, to, empty }) => ({ name: `중국 5호 16국 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN, build(empty)) : DOMAIN, from, to })),
    ...segmentsB.map(({ from, to, empty }) => ({ name: `중국 5호 16국 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN_B, buildB(empty)) : DOMAIN_B, from, to })),
  ],
  voids: [
    ...segments.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
    ...segmentsB.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, buildB(empty)]),
  ],
};
