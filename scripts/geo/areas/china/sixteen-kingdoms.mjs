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
// 등급 '일반'(00-scope 2·3절: 땅 1만 km², 선 평균 10 / 최대 25 km). 새 나라: 한/전조·성한·후조·전량·대(代). 384년부터의 나라(후연·후진 등)는 M3b가 이 파일에 더한다.
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

/** 작업용: 조각 모음(결과 노트의 넓이 재기·M3b가 쓴다. 객체는 고치지 말고 U·D·I로 새 도형을 만든다) */
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

export const era = {
  name: 'sixteen-kingdoms',
  versions,
  gapZones: segments.map(({ from, to, empty }) => ({ name: `중국 5호 16국 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN, build(empty)) : DOMAIN, from, to })),
  voids: segments.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
};
