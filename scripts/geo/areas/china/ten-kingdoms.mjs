// china 시대 파일 ten-kingdoms (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 5대 10국(M4): 907 ~ 979
// 짝 항목 파일: data/entities/china-ten-kingdoms.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china/의 다른 도우미 모듈. areas/china.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/china/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/china.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 중국 M4a (2026-10-24): 5대 10국 북부·서부 907 ~ 979년(영토는 979년 말 모습까지, 허시 회랑의 귀의군·감주 위구르만 실제 끝까지) ──────────────
// 등급 '일반'(00-scope 2·3절: 땅 1만 km², 선 평균 10 / 최대 25 km). 새 나라: 진(晉, 하동)·기(岐)·연(燕, 유수광)·조(趙, 성덕군)·의무군·전촉·후촉·형남·북한(北漢)·귀의군·감주 위구르.
// 기존 나라 줄(00-scope 5절 영향표 2026-10-21 승인과 2026-10-24·25 운영자 결정 1~3·5·8, scratchpad m4/decisions.md): 후량 907~922 진·기·연·성덕·의무 땅과 한중·4주(915~)를 뺌,
//   후당 923~924 한중·4주를, 934~935 한중만 빼고 925~933 쓰촨을 더함, 후진(後晉) 936~946은 한중만, 후한 947~950은 한중·4주를 뺌(4주는 947~954만 후촉, 결정 8), 후주 951~959 북한 땅과 한중(951~954는 4주도)을 뺌,
//   송 960~978 형남(962까지)·후촉(964까지)·북한(978까지) 땅을 뺌. 남부·동남(오·남당·오월·민·초·남한·청원군, 후주 958 회남, 송의 그 몫)은 M4b가 이 파일에 절을 더한다.
// 짜임: M3 조각(sixteen-kingdoms.mjs의 SIXTEEN_KINGDOMS_CELLS, 이름 '<M2·M3 칸>.<M3 구역>')을 바탕으로, 몇 조각을 칼선으로 더 쪼개고(합치면 원래 조각, M2 split 꼴),
//   모든 조각을 이 시대 기존 도형의 경계선으로 다시 나눈 'M4 조각'을 쓴다: h = 5대 왕조 도형 상자 안(shared.mjs HUABEI, 북위 32.8°·동경 103°·북위 41.2°),
//   n = 연운 16주 남쪽 경계 북쪽(NORTH_OF_YANYUN), 3·6 = 요서 해안(LX923·LX916), x = 서하 상자(XIXIA, 송 도형이 뺌), l = 요서(LIAOXI), j = 건창(JIANCHANG, 대도하 남쪽), d = 대리(DALI).
//   조각 이름은 '<조각>~<구역 글자>'(구역 밖이면 꼬리 없음)이고, 표에는 M2·M3 칸 이름·M3 조각 이름·이 파일에서 쪼갠 칸 이름을 쓰면 그 아래 모든 M4 조각이다.
//   기존 나라가 어느 해 어느 조각을 덮는지는 existing()이 구역 글자로 정하고(생성물로 대조함: 거란 907~915 = 요서 중 HUABEI 밖, 요 916~/923~ = 그에 LX916/LX923,
//   요 938~ = 연운 남쪽 경계 북쪽(서하 상자 밖)과 요서, 송 960~ = n·x·l·j·d 밖), 새 나라 표(TABLE)와 같은 해 한 조각을 함께 가지면 멈춘다(승인 줄 APPROVED만 통과).
// 근거: 위키백과 en·zh(scratchpad m4/research/notes-a.md, 결과 노트 1절). 수도 정답표: data/tests/places/east-asia.yaml(중국 M4 줄)
import { D, I, U, box } from '../../lib.mjs';
import { HUABEI, LIAOXI, LX916, LX923, NORTH_OF_YANYUN, XIXIA } from '../../shared.mjs';
import { DALI, JIANCHANG } from '../inner-asia.mjs';
import { SIXTEEN_KINGDOMS_CELLS as M3 } from './sixteen-kingdoms.mjs';

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
// 평면 넓이(제곱도): 0.0001제곱도(약 1km²) 미만 조각은 나누지 않는다
const deg2 = (multi) => multi.reduce((s, poly) => s + poly.reduce((t, r, i) => { let a = 0; for (let j = 0, k = r.length - 1; j < r.length; k = j++) a += (r[k][0] + r[j][0]) * (r[k][1] - r[j][1]); return t + (i === 0 ? 1 : -1) * Math.abs(a / 2); }, 0), 0);
const bboxOf = (multi) => { const b = [180, 90, -180, -90]; for (const p of multi) for (const r of p) for (const [x, y] of r) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } return b; };
const meets = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

// ── 북부·서부 칼선 (near:fragments로 근처 조각 확인: 결과 노트 1절). 모두 경위도 상자 변이고 강을 따르는 선은 없다(강 키 없음) ─────────────
// 관중·간쑤(기의 경주·영주 쪽은 동경 106.7° 동쪽이면 북위 33.5°까지): 봉주(凤州, 지금 펑현) 상자 동경 106.0~107.2°·북위 33.6~34.25°(친링 남쪽 펑현·량당 동쪽, 4주의 하나), 동경 108.0°(기의 봉상·농주 / 후량의 경조 서쪽·건주),
//   북위 34.95°·동경 104.6~106.7°(톈수이 분지 둘레 진주 남부·칭수이 / 위주·농주 쪽), 동경 105.3°·북위 36.3°(기의 경주·원주·위주·영주·경주(庆州) / 서쪽 토번계 룽시·북쪽 환주),
//   동경 104.4°(성주·계주 / 간난 토번계), 섬서 북위 34.9~35.8°·동경 108.7° 서쪽(빈주·장우·순이, 기의 정난군(靜難軍)).
// 허베이·산둥: 북위 38.25°(성덕(진·기·심·조주) / 의무(정·역·기주)), 동경 116.0°(성덕 / 의창의 경주), 동경 115.75°(의무 / 연의 영·막·탁주), 북위 39.65°(의무 역주 북쪽),
//   북위 38.85°·동경 116.0~118.2°·북위 37.3° 북쪽(의창군 창·경·덕·체주, 톈진 남쪽과 산둥 서북 끝). 성덕의 남쪽은 M2 칸 경계(북위 37.45°, 형주·패주 북쪽)를 그대로 씀.
// 후베이: 협주(峽州) 상자 동경 110.9~111.6°(이창·이두·위안안), 형주(荊州, 강릉부) 상자 동경 111.6~112.7°·북위 29.5~31.15°(징저우·궁안·스서우·쑹쯔·당양),
//   시주(施州) 동경 110.9° 서쪽(언스). 귀주(歸州, 즈구이·바둥)는 M2 칸 HB_XE를 그대로 씀.
// 쓰촨 남쪽: 북위 27.74°·동경 105.6°(윈난 성 조각의 쓰촨 경계 쪽 끝, 그 남쪽 가는 땅은 구이저우에 닿음 — 대리 고리(DALI) 밖 가는 땅만 촉에 붙여 송 960~964 도형에 가는 띠가 남지 않게)
// 허시 회랑: 동경 97.0°(사주·과주의 귀의군 / 숙주), 동경 101.3°(감주 / 양주(우웨이)). 칭하이 쑤베이 남쪽 끝(북위 38.3° 북쪽·동경 98.5° 서쪽)은 둔황 쪽에 붙임(M3b와 같은 고름)
const FENG_BOX = box(106.0, 33.6, 107.2, 34.25);
const SUBCUT = {
  'GZ_W.W': [[['GZ_FENG', FENG_BOX], ['GZ_QI', box(100.0, 30.0, 108.0, 40.0)]], 'GZ_WE'], // 펑현 북쪽 / 봉상·농주(바오지·펑샹·치산·룽현) / 건주·경조 서쪽(첸현·우궁·싱핑)
  'SN_HZW.W': [[['HZ_FENG', FENG_BOX]], 'HZ_N'], // 펑현·류바 / 한중 분지 북위 33° 북쪽(난정·몐현·뤼양·청구·양현)
  'GS_E.W': [[['GS_QIN', box(104.6, 33.5, 106.7, 34.95)], ['GS_QI', U(box(105.3, 34.95, 109.0, 36.3), box(106.7, 33.5, 109.0, 34.95))]], 'GS_EX'], // 진주 둘레(우산·칭수이·리현 북쪽) / 핑량·칭양·징촨·닝현 / 룽시·딩시·환현(토번계·당항계)
  'GS_S.W': [[['GS_CJ', box(104.4, 32.0, 107.0, 35.0)]], 'GS_GN'], // 성주·계주(룽난: 우두·청현·캉현·후이현·량당) / 간난(토번계)
  'SNX_R.W': [[['SNX_BIN', box(106.0, 34.9, 108.7, 35.8)]], 'SNX_RR'], // 빈주·장우·순이·쉰이 / 샨베이 장성 안 나머지
  'ZS_C.Y': [[['CD_ZS', box(110.0, 30.0, 120.0, 38.25)]], 'YW_ZS'], // 스자좡·자오현(진주·조주) / 딩저우·신러·취양(정주)
  'HE_CZ.Y': [[['CD_CZ', box(110.0, 30.0, 116.0, 38.25)], ['YC_CZ', box(116.0, 30.0, 120.0, 38.25)], ['YW_CZ', box(110.0, 38.25, 115.75, 40.0)]], 'YAN_CZ'], // 헝수이·선저우 / 징현·푸청 / 안궈(기주) / 허젠·쑤닝(영주)
  'Y_YN.Y': [[['YW_YN', box(114.0, 38.0, 115.75, 39.65)], ['YC_YN', box(116.0, 38.0, 120.0, 38.85)]], 'YAN_YN'], // 이현·쉬수이·바오딩 서쪽(역주) / 징하이 둘레 / 베이징 남쪽·랑팡·탕산
  'ZH_YN.Y': [[['YW_ZH', box(110.0, 38.0, 115.75, 40.0)]], 'YAN_ZH'], // 가오양 서쪽 끝 / 런추·안신(막주)
  'Y_TJ.Y': [[['YC_TJ', box(110.0, 30.0, 120.0, 38.85)]], 'YAN_TJ'], // 톈진 남쪽(창주) / 톈진(유주·계주 쪽)
  'SD_QI1.Y': [[['YC_QI1', box(110.0, 37.3, 118.2, 40.0)]], 'SD_QI1R'], // 빈저우·잔화(체주) / 쯔보·웨이팡 쪽
  'SD_QI2.Y': [[['YC_QI2', box(110.0, 37.3, 118.2, 40.0)]], 'SD_QI2R'], // 더저우 동쪽·러링·후이민(덕주·체주) / 지난 둘레
  // 산둥 선현 쪽 떨어진 끝(허난 푸양 북쪽에 박힌 폴리곤, 위박) / 쥐안청·윈청: 상자로 자르지 않고 상자 안에 통째로 드는 폴리곤만 고름
  'SD_WW.Y': (g) => { const inBox = (p) => { const [w, s2, e, n] = bboxOf([p]); return w >= 114.5 && s2 >= 35.7 && e <= 115.8 && n <= 36.0; }; return { SD_WWX: g.filter(inBox), SD_WWR: g.filter((p) => !inBox(p)) }; },
  'SD_WN.Y': [[['YC_WN', box(110.0, 37.3, 118.2, 40.0)]], 'SD_WNR'], // 더저우 서쪽 끝 / 랴오청·가오탕(박주·패주)
  'HB_C1.S': [[['HB_XIA', box(110.9, 29.9, 111.6, 31.4)], ['HB_JING', box(111.6, 29.5, 112.7, 31.15)]], 'HB_C1R'], // 협주 / 형주(강릉부) / 샹양·징먼 북쪽·한수이강 동쪽
  'HB_XR.S': [[['HB_SHI', box(108.0, 28.9, 110.9, 31.5)]], 'HB_XRR'], // 시주(언스) / 후베이 나머지 끝
  'GS_LIANG.W': [[['HX_DH', box(90.0, 30.0, 97.0, 45.0)], ['HX_GZ', box(97.0, 30.0, 101.3, 45.0)]], 'HX_LW'], // 사주·과주(둔황·과저우) / 숙주·감주(주취안·장예) / 양주(우웨이)·란저우·린샤
  'QH_C.W': [[['QH_HX', box(90.0, 38.3, 98.5, 41.0)]], 'QH_R'], // 쑤베이 남쪽 끝 / 칭하이 나머지
  'YN_C.S': [[['YN_N', box(100.0, 27.74, 105.6, 30.0)]], 'YN_R'], // 윈난 북쪽 끝(쓰촨·구이저우 경계 쪽, 대리 고리 밖 가는 땅은 촉 쪽) / 윈난 나머지
};

// ── M4 조각: 쪼갠 조각을 기존 도형 경계(구역 글자)로 다시 나눔 ─────────────
const ZONES = [['h', HUABEI], ['n', [[NORTH_OF_YANYUN]]], ['3', LX923], ['6', LX916], ['x', XIXIA], ['l', LIAOXI], ['j', [[JIANCHANG]]], ['d', [[DALI]]]].map(([z, s]) => [z, s, bboxOf(s)]);
const CELL = {};
const FLAG = {};
const OF = {}; // 표에 쓰는 이름(M2·M3 칸, M3 조각, 쪼갠 칸) → M4 조각 목록
const keep = (keys, name, g, flags) => {
  CELL[name] = g;
  FLAG[name] = flags;
  for (const k of keys) (OF[k] ??= []).push(name);
};
for (const [p, g0] of Object.entries(M3)) {
  const base = p.slice(0, p.lastIndexOf('.'));
  const subs = SUBCUT[p] ? Object.entries(typeof SUBCUT[p] === 'function' ? SUBCUT[p](g0) : split(g0, ...SUBCUT[p])) : [[p, g0]];
  for (const [sub, gs] of subs) {
    if (deg2(gs) < 0.0001) continue;
    let parts = [[gs, '']];
    for (const [z, s, sb] of ZONES) {
      const next = [];
      for (const [g, f] of parts) {
        if (!meets(bboxOf(g), sb)) { next.push([g, f]); continue; }
        const a = I(g, s);
        const b = D(g, s);
        // 한쪽이 1km² 미만이면 나누지 않고 큰 쪽 구역으로 셈(조각 경계와 거의 겹치는 선)
        if (deg2(a) < 0.0001) next.push([g, f]);
        else if (deg2(b) < 0.0001) next.push([g, f + z]);
        else next.push([a, f + z], [b, f]);
      }
      parts = next;
    }
    for (const [g, f] of parts) keep([...new Set([base, p, sub])], f ? `${sub}~${f}` : sub, g, f);
  }
}
const CELL_NAMES = Object.keys(CELL);
/** 이름들 → M4 조각들(겹침 없이). 표의 이름(OF)을 먼저 본다: 구역 꼬리가 없는 조각은 이름이 원래 조각·쪼갠 칸과 같다 */
const pc = (...names) => [...new Set(names.flatMap((n) => {
  if (OF[n]?.length) return OF[n];
  if (CELL[n]) return [n];
  throw new Error(`중국 ten-kingdoms: 모르는 칸 ${n}`);
}))];
const has = (z) => (c) => FLAG[c].includes(z);
const not = (z) => (c) => !FLAG[c].includes(z);
const minus = (list, ...drop) => { const d = new Set(drop.flat()); return list.filter((c) => !d.has(c)); };
const build = (cells) => U(...cells.map((c) => CELL[c]));

// ── 북부·서부 땅 묶음 ─────────────
// 진(晉, 하동): 태원부(타이위안)·분주·석주·남주·흔주·대주·운주·삭주·울주(링추·위현·양위안·라이위안)·심주·요주·노주(창즈, 906년 말부터 진, 택주(진청)는 1만 km² 미만이라 함께)·진무군(후허하오터)·부주 둘레
const JIN_907 = pc('SX_TY', 'SX_FEN', 'SX_LL', 'SX_XD', 'SX_XN', 'Y_SX', 'ZS_SX', 'SX_SDN', 'SX_SDS', 'Y_HD', 'Y_YND', 'NM_FZ', 'NM_YZ', 'NM_X.C', 'SNX_R.C', 'SNX_N.C');
// 연(燕, 유수광): 노룡군 — 유·계·단·순·탁·영·막·평주와 산후의 규·유(儒)·무·신주(베이징·톈진 북쪽·탕산·랑팡·허젠·청더 남부·친황다오, 장자커우 동쪽). 장성 선 밖(HUABEI 밖)은 거란 쪽이라 뺌.
// 평주(노룡현, 친황다오 서쪽)는 허베이성 안이라 포함. 유관(산하이관) 동쪽 요서 회랑(랴오닝 조각 LN_X의 HUABEI 안, 진저우·후루다오 쪽 해안)은 노룡군이 다스린 땅이 아니라 넣지 않음.
// 이 땅은 기존 후량(907~915 HUABEI)·916~ 후량/요(LX916) 도형이 그대로 덮는다: 비우면 만주 빈 땅 채우기(inner-asia 거란 907~916 요서 채우기)가 거란에게 줘 거란 도형이 바뀌므로 비우지 않음(알려진 근사)
const YAN_907 = pc('YAN_YN', 'YAN_ZH', 'YAN_CZ', 'YAN_TJ', 'BJ_Y', 'BJ_X', 'Y_HXW', 'Y_HXE', 'Y_HXL', 'Y_HXB').filter(has('h'));
// 의창군(창·경·덕·체주): 909년 유수광이 형 유수문을 사로잡고 차지 → 913년 진
const YICHANG = pc('HE_CE', 'YC_CZ', 'YC_YN', 'QI_YN', 'YC_TJ', 'TJ_S', 'Y_HC', 'YC_QI1', 'YC_QI2', 'YC_WN');
const YAN_909 = [...YAN_907, ...YICHANG];
// 위박(위·박·패·상·위(衛)·전주)과 형·명·자주: 915년 위주 반란 뒤 916년까지 진에 넘어감
const WEIBO = pc('HE_HDS', 'HE_HDN', 'HE_SEW_S', 'HE_SEW_N', 'HE_SEE', 'HA_NE_W', 'HA_NE_E', 'HA_TQ', 'SD_WNR', 'SD_WWX');
// 성덕군(조, 진·기·심·조주)·의무군(정·역·기주): 910년 후량과 끊고 진과 손잡음
const CHENGDE = pc('CD_ZS', 'CD_CZ');
const YIWU = pc('YW_ZS', 'YW_CZ', 'YW_YN', 'YW_ZH', 'ZS_X', 'ZS_YN');
const JIN_913 = [...JIN_907, ...YAN_909];
const JIN_916 = [...JIN_913, ...WEIBO].filter(not('6')); // 유관 동쪽 요서 해안(LX916)은 진도 넣지 않음(916년부터 기존 요 도형)
const JIN_922 = [...JIN_916, ...CHENGDE];
// 기(岐): 봉상부·농주 둘레(915~)와 907년의 건주·빈주(정난군(靜難軍))·경주·원주·위주(핑량)·영주·경주(慶州)와 천웅군 4주(진·봉·성·계주)
const QIN4 = pc('TS', 'GS_QIN', 'GS_CJ', 'GZ_FENG', 'HZ_FENG'); // 진(秦)·봉·성·계 4주: 톈수이·룽난·펑현
const QI_915 = pc('GZ_QI');
const QI_907 = [...QI_915, ...pc('GZ_WE', 'SNX_BIN', 'GS_QI', 'NX_S'), ...QIN4];
// 전촉·후촉: 쓰촨 분지와 둘레(대도하 남쪽 건창·대리는 뺌)·충칭·시주(언스)·귀주·협주·한중(흥원부·양주)·문주(원현)와 32.8° 북쪽 리주·용주 끝
const SHU_CORE = pc('SC_SHU', 'SC_BA', 'SC_YB', 'SC_W', 'SC_LS', 'YN_N', 'SC_NE', 'SC_N.S', 'CQ_W', 'CQ_E', 'CQ_SE', 'HB_SHI', 'HZ_N', 'SN_HZW.S', 'GS_S.S').filter((c) => !FLAG[c].includes('j') && !FLAG[c].includes('d'));
const GUI_XIA = pc('HB_XE', 'HB_XIA'); // 귀주·협주: 전촉 → 925년 뒤 형남
const FS_907 = [...SHU_CORE, ...GUI_XIA];
const FS_915 = [...FS_907, ...QIN4];
// 후촉이 4주를 가진 해: 운영자 결정 8(2026-10-25)대로 947~954년만. zh 後蜀 "晋雄武军节度使何重建不附辽，以辖区归附后蜀"(947년, 요가 후진을 멸할 때). 934~946년 4주는 기존 후당·후진 도형
const QIN4_SHU_FROM = 947;
const LS_934 = SHU_CORE; // 934~946: 한중만 후촉
const LS_947 = [...SHU_CORE, ...QIN4]; // 947~954: 4주도 후촉
const LS_955 = SHU_CORE;
const JINGNAN = pc('HB_XE', 'HB_XIA', 'HB_JING'); // 형남: 강릉부(형주)·귀주·협주
const LT_SHU = SHU_CORE.filter(not('h')); // 후당 925~933에 더하는 쓰촨(한중·4주는 기존 후당 도형이 이미 덮음)
// 북한(北漢): 병·분·흔·대·남·헌·심·요·석주(타이위안·펀양·신저우·다이현·란현·친위안·쭤취안·리스), 연운 남쪽 경계 북쪽(요 938~)은 뺌
const NH = pc('SX_TY', 'SX_FEN', 'SX_LL', 'SX_XD', 'SX_SDN', 'SX_XN').filter(not('n')); // 산시 북부(선츠·닝우·우자이·허취 둘레, 연운 남쪽 경계 남쪽)도 북한 쪽
// 허시 회랑
const GUIYI = pc('HX_DH', 'XJ_E', 'QH_HX'); // 사주(둔황)·과주(과저우)와 서쪽 띠
const GANZHOU = pc('HX_GZ'); // 감주(장예)·숙주(주취안)
// 빈 땅 검사에만 넣는 조각(그해 주인이 없으면 비운 땅): 양주(우웨이)·란저우, 건창, 쓰촨 북부 고원(쑹판·뤄얼가이), 강릉
const EXTRA_DOMAIN = pc('HX_LW', 'SC_LS', 'SC_N.W', 'HB_JING'); // YN_N의 대리 쪽은 넣지 않음(윈난은 M4a 범위 밖)

const TABLE = {
  // 진(晉, 하동): 907년 후량이 당을 이은 뒤에도 하동의 이극용(908년 죽음, 이존욱이 이음)이 당 연호를 쓰며 맞섬 → 913년 연을 멸해 노룡·의창 →
  //   915~916년 위주 반란으로 위박과 형·명·자주 → 921~922년 성덕(진주 함락 922) → 923년 이존욱이 위주에서 칭제(후당). 919년 황허강 북쪽 남은 땅과 921년 위주(衛州) 상실은 1만 km² 미만이라 버전 없음
  'jin-hedong': [[907, 913, JIN_907], [913, 916, JIN_913], [916, 922, JIN_916], [922, 923, JIN_922]],
  // 기(岐): 이무정이 봉상에서 당 연호를 쓰며 후량을 인정하지 않음 → 915년 정난군(靜難軍)이 후량에, 천웅군(진·봉·성·계)이 전촉에 넘어가 봉상·농주만 남음 →
  //   924년 후당에 신복(지도는 후당 도형이 서는 923년까지; 923년 후당 몫은 승인 줄 밖이라 그대로). 908년 보새·보대(옌안·푸현)는 그해 후량에 항복해 그리지 않음
  'qi-fengxiang': [[907, 915, QI_907], [915, 923, QI_915]],
  // 연(燕, 유수광): 907년 유수광이 아버지 유인공을 가두고 유주를 차지 → 909년 의창군 → 911년 대연 황제 → 913년 말 진에게 유주가 함락됨
  'yan-liu': [[907, 909, YAN_907], [909, 913, YAN_909]],
  // 조(趙, 성덕군 왕용): 910년 후량과 끊고 진과 손잡음(911 백향 싸움) → 921년 장문례가 왕용을 죽이고 922년 진이 진주를 함락
  chengde: [[910, 922, CHENGDE]],
  // 의무군(왕처직): 910년 성덕과 함께 진과 손잡음 → 922년 왕도가 아버지를 몰아내고 진(923년 후당)에 붙음
  yiwu: [[910, 923, YIWU]],
  // 전촉: 907년 왕건이 성도에서 칭제(902년 한중을 얻음) → 915년 천웅군 4주 → 925년 후당 곽숭도에게 멸망
  'former-shu': [[907, 915, FS_907], [915, 925, FS_915]],
  // 후촉: 934년 맹지상이 성도에서 칭제, 같은 해 산남서도·무정군(한중·양주)이 귀순 → 947년 후진의 웅무군 절도사 하중건이 진·계·성주를, 이어 봉주가 귀순(4주) → 955년 4주를 후주에게 → 965년 정월 송에 항복
  'later-shu': [[934, QIN4_SHU_FROM, LS_934], [QIN4_SHU_FROM, 955, LS_947], [955, 965, LS_955]],
  // 형남(남평): 고계흥이 강릉 한 성을 지키다(1만 km² 미만, 비움) 924년 남평왕, 925년 전촉이 망한 뒤 귀·협주를 얻음 → 963년 송에게 납지
  jingnan: [[925, 963, JINGNAN]],
  // 북한(北漢): 951년 유숭이 태원에서 칭제 → 979년 송 태종에게 항복. 954년 고평 싸움 뒤 후주의 일시 점령과 963~964년 요주·낙평 상실은 그리지 않음
  'northern-han': [[951, 979, NH]],
  // 귀의군: 사주·과주(914년 조의금 뒤 조씨) → 1036년 무렵 서하. 감주 위구르: 감주·숙주 → 1028년 서하가 감주를 함락
  guiyi: [[907, 1036, GUIYI]],
  'ganzhou-uyghur': [[907, 1028, GANZHOU]],
  // 기존 나라에 더하는 땅(권역 파일이 씀, era에는 넣지 않음): 후당 925~933 쓰촨(승인 줄)
  'later-tang': [[925, 934, LT_SHU]],
};
const EXTERNAL = new Set(['later-tang']);

// ── 기존 나라(areas/china.mjs·inner-asia.mjs)가 그해 덮는 조각 (겹침 검사·비운 땅 계산에만 씀) ─────────────
function existing(year, c) {
  const f = FLAG[c];
  const h = f.includes('h'), n = f.includes('n'), x = f.includes('x'), l = f.includes('l');
  if (year < 916) return h ? 'later-liang' : l ? 'khitan' : null; // HUABEI / 거란(요서 중 HUABEI 밖)
  if (year < 923) return h && !f.includes('6') ? 'later-liang' : (l && !h) || f.includes('6') ? 'liao' : null; // D(HUABEI, LX916)
  if (year < 938) return h && !f.includes('3') ? (year < 936 ? 'later-tang' : 'later-jin') : (l && !h) || f.includes('3') ? 'liao' : null; // D(HUABEI, LX923)
  if (year < 960) return h && !n ? (year < 947 ? 'later-jin' : year < 951 ? 'later-han' : 'later-zhou') : (n && !x) || l ? 'liao' : null; // HUABEI_938
  if ((n && !x) || l) return 'liao';
  return !n && !x && !f.includes('j') && !f.includes('d') ? 'song' : null; // D(SONG_960, LIAOXI, OUT_SW, DALI, JIANCHANG)
}
// 승인 줄(00-scope 5절 2026-10-21, 2026-10-24 운영자 결정 1~3): 이 기존 나라는 그해 새 나라 땅을 권역 파일에서 뺀다
const APPROVED = [
  ['later-liang', 907, 923, ['jin-hedong', 'qi-fengxiang', 'yan-liu', 'chengde', 'yiwu', 'former-shu']],
  ['later-tang', 923, 925, ['former-shu']],
  ['later-tang', 934, 936, ['later-shu']],
  ['later-jin', 936, 947, ['later-shu']],
  ['later-han', 947, 951, ['later-shu']],
  ['later-zhou', 951, 960, ['northern-han', 'later-shu']],
  ['song', 960, 979, ['jingnan', 'later-shu', 'northern-han']],
];
const approved = (owner, year, id) => APPROVED.some(([o, f, t, ids]) => o === owner && f <= year && year < t && ids.includes(id));

// ── 기간 나누기: 907~979(북부·서부 전체), 980~1035(허시 회랑만) ─────────────
const M4A_FROM = 907, M4A_TO = 980, HEXI_TO = 1036;
const EXISTING_CUTS = [916, 923, 936, 938, 947, 951, 960];
const owned = (year) => {
  const seen = new Map();
  for (const [id, list] of Object.entries(TABLE)) {
    for (const [f, t, cells] of list) {
      if (!(f <= year && year < t)) continue;
      for (const c of cells) {
        if (!CELL[c]) throw new Error(`중국 ten-kingdoms: 모르는 조각 ${c} (${id})`);
        if (seen.has(c)) throw new Error(`중국 ten-kingdoms: ${year}년 조각 ${c}를 ${seen.get(c)}와 ${id}가 함께 가짐`);
        const ex = existing(year, c);
        if (ex && ex !== id && !approved(ex, year, id)) throw new Error(`중국 ten-kingdoms: ${year}년 조각 ${c}를 기존 나라 ${ex}와 ${id}가 함께 가짐(승인 줄 밖)`);
        seen.set(c, id);
      }
    }
  }
  for (const c of CELL_NAMES) if (!seen.has(c) && existing(year, c)) seen.set(c, existing(year, c));
  return seen;
};
const DOMAIN_CELLS = [...new Set([...Object.values(TABLE).flatMap((list) => list.flatMap(([, , cells]) => cells)), ...EXTRA_DOMAIN])];
const HEXI_CELLS = [...GUIYI, ...GANZHOU, ...pc('HX_LW')];
const DOMAIN = build(DOMAIN_CELLS);
const DOMAIN_HEXI = build(HEXI_CELLS);
const tableYears = Object.values(TABLE).flatMap((list) => list.flatMap(([f, t]) => [f, t]));
const segs = (from, to, cells) => {
  const cuts = [...new Set([from, to, ...EXISTING_CUTS, ...tableYears])].filter((y) => y >= from && y <= to).sort((a, b) => a - b);
  return cuts.slice(0, -1).map((y, i) => { const own = owned(y); return { from: y, to: cuts[i + 1], empty: cells.filter((c) => !own.has(c)) }; });
};
const SEGMENTS = segs(M4A_FROM, M4A_TO, DOMAIN_CELLS);
const SEGMENTS_HEXI = segs(M4A_TO, HEXI_TO, HEXI_CELLS);
// 비운 조각의 이유 (그해 아무도 갖지 않은 조각)
// - 907~924 강릉(형주): 고계흥의 형남이 강릉 한 성만 지킴(1만 km² 미만, 925년 귀·협주를 얻은 뒤부터 그림)
// - 양주(우웨이)·톈주 서쪽(HX_LW의 HUABEI 밖): 육곡부 등 토번계가 다스림(그리지 않음), 960년부터는 송 도형이 서하 상자를 빼서 란저우 북쪽 HUABEI 안 조각도 빔
// - 대도하 남쪽 건창(량산·판즈화·야안 남쪽 끝): 대리(남조 계승) 땅이라 그리지 않음(송도 뺌). 쓰촨 북부 고원(쑹판·뤄얼가이, HUABEI 밖): 토번계
// - 장성 선 밖 청더 북쪽(HUABEI 밖, 거란·요 도형도 938년 전에는 덮지 않음)과 979년 산시 서쪽 띠(동경 111° 서쪽, 송 도형이 서하 상자로 뺌)
// - 1028~1035 감주·숙주: 서하가 감주를 함락한 뒤(서하 도형은 1038년부터)

const versions = {};
for (const [id, list] of Object.entries(TABLE)) if (!EXTERNAL.has(id)) versions[id] = list.map(([from, to, cells]) => [from, to, build(cells)]);

/** 작업용: M4 북부·서부 조각 모음과 구역 글자(M4b가 이 조각을 다시 나눌 수 있다. 객체는 고치지 말고 U·D·I로 새 도형을 만든다) */
export const TEN_KINGDOMS_NW_CELLS = CELL;
export const TEN_KINGDOMS_NW_FLAGS = FLAG;
// 권역 파일(areas/china.mjs)이 기존 나라 도형에서 빼거나 더하는 땅 (00-scope 5절 승인 줄, 2026-10-24 운영자 결정 1~3)
const takenIn = (year) => [...new Set(Object.entries(TABLE).filter(([id]) => !EXTERNAL.has(id)).flatMap(([, list]) => list.filter(([f, t]) => f <= year && year < t).flatMap(([, , cells]) => cells)))].filter(has('h'));
/** 후량에서 뺄 땅(키 = 버전 첫 해): 진·기·연·성덕·의무와 전촉의 한중·4주(HUABEI 안) */
export const LATER_LIANG_OUT = Object.fromEntries([907, 909, 910, 915, 916].map((y) => [y, build(takenIn(y))]));
/** 5대 왕조에서 뺄 전촉·후촉의 북쪽 땅(HUABEI 안: 한중·문주 끝·리주 끝, 4주 포함 여부는 키 = 버전 첫 해: 915·947은 4주 포함, 934·955는 한중만) */
export const SHU_NORTH = { 907: build(FS_907.filter(has('h'))), 915: build(FS_915.filter(has('h'))), 934: build(LS_934.filter(has('h'))), 947: build(LS_947.filter(has('h'))), 955: build(LS_955.filter(has('h'))) };
/** 후당 925~933에 더할 쓰촨(전촉 땅에서 귀·협주와 HUABEI 안을 뺀 것) */
export const LATER_TANG_SHU = build(LT_SHU);
/** 후주 951~959·송 960~978에서 뺄 북한 땅, 송 960~962에서 뺄 형남 땅, 송 960~964에서 뺄 후촉 땅(955~ 모습) */
export const NORTHERN_HAN_LAND = build(NH);
export const JINGNAN_LAND = build(JINGNAN);
export const LATER_SHU_LAND = build(LS_955);

export const era = {
  name: 'ten-kingdoms',
  versions,
  gapZones: [
    ...SEGMENTS.map(({ from, to, empty }) => ({ name: `중국 5대 10국 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN, build(empty)) : DOMAIN, from, to })),
    ...SEGMENTS_HEXI.map(({ from, to, empty }) => ({ name: `중국 5대 10국 허시 ${from}~${to - 1}`, zone: empty.length ? D(DOMAIN_HEXI, build(empty)) : DOMAIN_HEXI, from, to })),
  ],
  voids: [
    ...SEGMENTS.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
    ...SEGMENTS_HEXI.filter(({ empty }) => empty.length).map(({ from, to, empty }) => [from, to, build(empty)]),
  ],
};
