// southeast-asia 도우미 모듈: E3(1293~1766) 칸별 조각 목록과 칼선 (동남아 E3 뼈대 2026-11-09 — cuts-e2.mjs와 같은 꼴)
// 칸 경계는 조각 경계다(칼선은 칸을 넘지 않는다). 칸마다 자기 머리 '// ── E3 <칸> 칼선 …'과 '// ── E3 <칸> 끝 ──' 사이에만 칼선·상수를 쓰고, 최상위 이름은 칸 앞머리(BM_·SC_·VT_·LO_·M1_·I1_)로 시작한다.
// 칼선 좌표는 조사 꼭짓점을 그대로 쓰지 않고 강·산줄기·주 경계로 다듬는다(기준 도시 안/밖을 pt-dh.mjs로 확인). E1·E2 칼선(cuts-e1.mjs·cuts-e2.mjs의 VT_CUT_GIANH·BP_CUT_SABAH 등)이나 다른 권역 상수를 쓰려면
// 별칭으로 가져온다 — 좌표를 베끼지 않음(check:generator). 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음). 칸 몫 조각 목록(E3_*_IDS)은 뼈대가 정했고 칸은 고치지 않는다
import { ALL_IDS, idsOf } from './table.mjs';
import { voids as SOUTH_ASIA_VOIDS } from '../south-asia.mjs';

// ── 칸 몫 조각 (뼈대 — 모두 합쳐 384개를 한 번씩) ──
// 대륙 넷은 E2와 같은 나눔(이산 20주·라타나키리·스퉁트렝은 LO — 크메르·란쌍·아유타야·라오 세 왕국이 갈라 쥔 땅), 해양은 둘:
//   M1 = 말레이 반도·싱가포르·수마트라·보르네오 북부(사바·사라왁·라부안·브루나이)·필리핀, I1 = 자와·발리·소순다·칼리만탄·술라웨시·말루쿠·서뉴기니·동티모르
const ISAN = ['TH-30', 'TH-31', 'TH-32', 'TH-33', 'TH-34', 'TH-35', 'TH-36', 'TH-37', 'TH-38', 'TH-39', 'TH-40', 'TH-41', 'TH-42', 'TH-43', 'TH-44', 'TH-45', 'TH-46', 'TH-47', 'TH-48', 'TH-49'];
const LAO_KH = ['KH-16', 'KH-19'];
// 수마트라 열 주(아체·북·서·리아우·잠비·남·벵쿨루·람풍·방카블리퉁·리아우 제도) — 말라카·조호르·아체·반튼(람풍)과 같은 바다 세계라 M1
const SUMATRA = ['ID-AC', 'ID-SU', 'ID-SB', 'ID-RI', 'ID-JA', 'ID-SS', 'ID-BE', 'ID-LA', 'ID-BB', 'ID-KR'];
export const E3_BM_IDS = idsOf('MMR'); // 버마: 미얀마 14
export const E3_SC_IDS = [...idsOf('THA').filter((id) => !ISAN.includes(id)), ...idsOf('KHM').filter((id) => !LAO_KH.includes(id))]; // 시암·캄보디아: 타이 57 + 캄보디아 22
export const E3_VT_IDS = idsOf('VNM'); // 베트남·참파: 베트남 63
export const E3_LO_IDS = [...idsOf('LAO'), ...ISAN, ...LAO_KH]; // 라오: 라오스 17 + 이산 20 + 라타나키리·스퉁트렝 2
export const E3_M1_IDS = [...idsOf('MYS', 'SGP', 'BRN', 'PHL'), ...SUMATRA]; // 말레이시아 16 + 싱가포르 5 + 브루나이 4 + 필리핀 118 + 수마트라 10
export const E3_I1_IDS = [...idsOf('IDN').filter((id) => !SUMATRA.includes(id)), ...idsOf('TLS')]; // 인도네시아 23 + 동티모르 13
for (const id of [...ISAN, ...LAO_KH, ...SUMATRA]) if (!ALL_IDS.includes(id)) throw new Error(`southeast-asia cuts-e3.mjs: 모르는 조각 id ${id}`);
const all = [E3_BM_IDS, E3_SC_IDS, E3_VT_IDS, E3_LO_IDS, E3_M1_IDS, E3_I1_IDS].flat();
if (all.length !== ALL_IDS.length || new Set(all).size !== ALL_IDS.length) throw new Error(`southeast-asia cuts-e3.mjs: 칸 몫 조각이 ${all.length}개(겹침 없이 ${ALL_IDS.length}개여야 함)`);

// ── E3 BM 칼선 (버마, 구현 E3-BM) — 1544~1554 바간 위도선(마궤·만달레이)·1293~1538 프롬·따웅우 위도선(바고) ──
// 프롬 왕국(1482~1542) 동서 선·1752 아바 북쪽 선·1755 삼각주 선은 1만 km² 미만이거나 해 어긋남이 기준 안이라 칼선을 두지 않았다(결과 노트 7절 근사).
import { P as BM_P, ring as BM_ring } from '../../lib.mjs';
// 칼선 BM-1 바간 위도선(마궤 MM-03·만달레이 MM-04를 나눔 — 고리 안 = 북위 21.40° 남쪽 = 1544년 4월까지 따웅우가 차지하고 1545 페구 조약으로 아바가 넘긴 '바간까지의 중부 버마',
//   밖 = 북쪽 = 1555년 1월까지 아바 왕국). 조약 경계선은 전하지 않아 바간·파꼬꾸와 밍잔 사이 위도선으로 그은 어림(estimated) — 위키백과 Toungoo–Ava War (1538–1545).
//   기준 도시: 안 바간(94.86,21.17)·파꼬꾸(95.08,21.33)·마궤(94.93,20.15)·메이크틸라(95.86,20.88)·야메틴(96.14,20.43)·민부(94.88,20.18),
//   밖 밍잔(95.39,21.46)·아바(잉와 95.99,21.85)·짜욱세(96.13,21.61)·강고(94.13,22.17)·만달레이(96.08,21.98)
export const BM_CUT_PAGAN = BM_P(BM_ring([[93.5, 18.0], [97.8, 18.0], [97.8, 21.4], [93.5, 21.4]]));
// 칼선 BM-2 프롬·따웅우 위도선(바고 MM-02를 나눔 — 고리 안 = 북위 18.25° 북쪽 = 프롬(삐이)·따웅우 쪽, 1293~1509 바간·핀야·아바 왕실 쪽, 1510 따웅우 독립,
//   밖 = 남쪽 = 페구·따야와디 = 항따와디 왕국 땅). 프롬 왕국 남쪽 끝 빠웅데와 따웅우 남쪽 쀼·짜욱지가 안, 따야와디·레뻐단·뇨운레빈이 밖이 되는 어림(estimated, 1293~1538만).
//   기준 도시: 안 삐이(95.22,18.82)·따웅우(96.43,18.94)·빠웅데(95.51,18.49)·쀼(96.44,18.48)·예다셰(96.33,19.15)·짜욱지(96.74,18.33),
//   밖 바고(96.48,17.34)·따야와디(95.79,17.65)·레뻐단(95.75,17.78)·뇨운레빈(96.73,17.95)·다익우(96.68,17.79)
export const BM_CUT_PROME = BM_P(BM_ring([[94.0, 18.25], [97.8, 18.25], [97.8, 20.5], [94.0, 20.5]]));
// 권역 밖 땅(뼈대): 치타공(방글라데시 BD-B 남부 — 쿠투브디아·마헤시칼리·산드위프 섬 포함). 남아시아 시대 파일 sultanate.mjs가 1459~1665년 아라칸 몫으로 비운 땅(voids의 1459~1666 줄)을 그대로 쓴다
//   — 좌표를 베끼지 않고 남아시아 권역의 voids에서 찾아 쓴다(남아시아 파일은 고치지 않음). E3 창구 ② 자동 승인 A6(므라우우 1459~1665, area:geo 15,110 km²). 시대 파일 BM 칸이 BM_OUTSIDE에 적어 mrauk-u에 더한다
export const BM_CHITTAGONG = (() => {
  const hit = SOUTH_ASIA_VOIDS.filter(([f, t]) => f === 1459 && t === 1666);
  if (hit.length !== 1) throw new Error(`southeast-asia cuts-e3.mjs: 남아시아 voids에서 1459~1666 치타공 줄이 ${hit.length}개(하나여야 함 — south-asia/sultanate.mjs의 'E_BDB/치타공' 비움 줄)`);
  return hit[0][2];
})();
// ── E3 BM 끝 ──

// ── E3 SC 칼선 (시암·캄보디아, 구현 E3-SC) — 조각 경계로 안 되는 곳만 ──
// ── E3 SC 끝 ──

// ── E3 VT 칼선 (베트남·참파, 구현 E3-VT) — 꽝찌 벤하이강(쩐·호와 참파), 1533~1545 레 중흥·막 경계 등. 잔강(1627~)은 E2 VT_CUT_GIANH을 별칭으로 ──
// ── E3 VT 끝 ──

// ── E3 LO 칼선 (라오, 구현 E3-LO) — 이산의 크메르·란쌍·아유타야 몫(1293~1706), 란쌍 남북 등 ──
// ── E3 LO 끝 ──

// ── E3 M1 칼선 (말레이 반도·수마트라·보르네오 북부·필리핀, 구현 E3-M1) — 사바 서·동은 E2 BP_CUT_SABAH를 별칭으로 ──
// ── E3 M1 끝 ──

// ── E3 I1 칼선 (자와·칼리만탄·술라웨시·말루쿠·티모르, 구현 E3-I1) ──
// ── E3 I1 끝 ──
