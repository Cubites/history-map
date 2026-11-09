// southeast-asia 도우미 모듈: E4(천문 −203~1292) 칸별 조각 목록과 칼선·권역 밖 땅 (동남아 E4 뼈대 2026-11-09 — cuts-e3.mjs와 같은 꼴)
// 칸 경계는 조각 경계다(칼선은 칸을 넘지 않는다). 칸마다 자기 머리 '// ── E4 <칸> 칼선 …'과 '// ── E4 <칸> 끝 ──' 사이에만 칼선·상수를 쓰고, 최상위 이름은 칸 앞머리(VC_·SK_·BI_)로 시작한다.
// 칼선 좌표는 조사 꼭짓점을 그대로 쓰지 않고 강·산줄기·주 경계로 다듬는다(기준 도시 안/밖을 pt-dh.mjs로 확인). E1~E3 칼선(cuts-e3.mjs의 BM_CUT_PROME 등)이나 다른 권역 상수를 쓰려면
// 별칭으로 가져온다 — 좌표를 베끼지 않음(check:generator). 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음). 칸 몫 조각 목록(E4_*_IDS)은 뼈대가 정했고 칸은 고치지 않는다
import { D, U, I, loadFragments } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, idsOf } from './table.mjs';
import { prevListOf } from './prev.mjs';

// ── 칸 몫 조각 (뼈대 — 모두 합쳐 384개를 한 번씩) ──
// 칸 셋(지리 칸 — 같은 나라 무리가 한 칸 안에 들게): 메콩 삼각주 19조각은 이 시대 내내 부남·첸라·수진랍·크메르 땅이라 SK, 베트남 나머지 44는 VC.
//   버마(BI)와 섬 세계(BI)는 맞닿는 항목이 없어 한 칸에 둠(쀼·아라칸·바간·항따와디 / 타루마나가라·순다·마타람·케디리·싱하사리·스리비자야·트르나테·크다).
// 메콩 삼각주 = E2 colonial.mjs VT_COCHIN_E·VT_COCHIN_W·VT_DONG_THAP과 같은 19조각(= E3 1293 khmer-empire의 베트남 쪽 조각)
const DELTA = ['VN-37', 'VN-39', 'VN-41', 'VN-43', 'VN-46', 'VN-57', 'VN-58', 'VN-SG', 'VN-44', 'VN-47', 'VN-49', 'VN-50', 'VN-51', 'VN-52', 'VN-55', 'VN-59', 'VN-73', 'VN-CT', 'VN-45'];
export const E4_VC_IDS = idsOf('VNM').filter((id) => !DELTA.includes(id)); // 베트남 북·중부·참파: 베트남 44
export const E4_SK_IDS = [...idsOf('THA', 'KHM', 'LAO'), ...DELTA]; // 타이 77 + 캄보디아 24 + 라오스 17 + 메콩 삼각주 19
export const E4_BI_IDS = idsOf('MMR', 'MYS', 'SGP', 'BRN', 'PHL', 'IDN', 'TLS'); // 미얀마 14 + 말레이시아 16 + 싱가포르 5 + 브루나이 4 + 필리핀 118 + 인도네시아 33 + 동티모르 13
for (const id of DELTA) if (!ALL_IDS.includes(id)) throw new Error(`southeast-asia cuts-e4.mjs: 모르는 조각 id ${id}`);
const all = [E4_VC_IDS, E4_SK_IDS, E4_BI_IDS].flat();
if (all.length !== ALL_IDS.length || new Set(all).size !== ALL_IDS.length) throw new Error(`southeast-asia cuts-e4.mjs: 칸 몫 조각이 ${all.length}개(겹침 없이 ${ALL_IDS.length}개여야 함)`);

// 중국 쪽 버전 하나 찾기(좌표를 베끼지 않고 동아시아 권역 versions에서 — 없거나 둘이면 멈춤)
const versionOf = (id, from, to) => {
  const hit = prevListOf(id).filter(([f, t]) => f === from && t === to);
  if (hit.length !== 1) throw new Error(`southeast-asia cuts-e4.mjs: ${id} ${from}~${to} 버전이 ${hit.length}개(하나여야 함 — china.mjs versions를 다시 볼 것)`);
  return hit[0][2];
};

// ── E4 VC 칼선 (베트남 북·중부·참파, 구현 E4-VC) — 중국 쪽 교지 선(재사용)·남월 권역 밖 땅 ──
// 중국 쪽 교지 선(뼈대): 중국 왕조 손 도형이 통킹·타인호아~하띤에서 칠한 땅 = 동아시아 china.mjs의 서한 기원전 111~110년(천문 −110~−109) 버전을 동남아 권역 바깥선으로 자른 것.
//   진·서한·신·후한·오·위·서진·동진·송·남제·양·진·수·당이 모두 같은 선(L_CN_SW로 그은 OUT_SW 바깥 = 북위 17.5° 위, 윈난 빼고)을 쓴다 — 뼈대 측정 e4/skel/prev-overlap.txt(90,531~90,686 km², 사인 도법 어림).
//   통킹 25조각 가운데 북서 산지(라이쩌우·디엔비엔·선라 쪽 약 3.3만 km²)와 꽝빈 이남은 이 선 밖이라 중국 쪽이 칠한 적이 없다.
//   쓰는 곳: 남월(천문 −203~−111) 베트남 쪽, 쿡씨·응오·딘·전 레(907~1008) — 중국 쪽이 비운 해에 '중국 쪽 선 안'만 칠할 때 ownSplit의 칼선 도형으로.
export const VC_JIAO_HAN = I(versionOf('western-han', -110, -108), DOMAIN);
// 당 마지막 버전(751~906 — 윈난을 뺀 모양)의 같은 선 — 907~1008 쿡씨·응오·딘·전 레가 쓴다(서한 선과 대칭차 0 — 뼈대가 잼, SKEL-NOTE 3절. 이름만 해에 맞춰 둘)
export const VC_JIAO_TANG = I(versionOf('tang', 751, 907), DOMAIN);
// 권역 밖 땅(뼈대 — E4 창구 ② Q1): 남월의 광둥 CN-GD·광시 CN-GX(중국 권역 조각, 하이난 CN-HI는 비움). 중국 쪽 도형은 바이트 그대로이고, 그해(천문 −203~−111) 중국 쪽이 비운 땅만 칠한다
//   = 두 조각에서 서한 −201~−111 버전이 걸친 몫(조각 북쪽 가장자리 약 293 km²)을 뺀 것. −203·−202년에는 그 몫도 비어 있으나 1만 km² 미만이라 근사(뼈대 e4/skel/nanyue-cn.txt).
//   시대 파일 VC 칸이 VC_OUTSIDE에 [−203, −110, 'nanyue', VC_NANYUE_CN]으로 적는다(E3 A6 치타공 BM_OUTSIDE와 같은 장치)
const CN = loadFragments('china');
export const VC_NANYUE_CN = D(U(CN.F('CN-GD'), CN.F('CN-GX')), versionOf('western-han', -201, -110));
// ── E4 VC 끝 ──

// ── E4 SK 칼선 (타이·캄보디아·라오·메콩 삼각주, 구현 E4-SK) — 조각 경계로 안 되는 곳만 ──
// ── E4 SK 끝 ──

// ── E4 BI 칼선 (버마·해양, 구현 E4-BI) — 바고 북·남은 E3 BM_CUT_PROME을 별칭으로(시대 파일 BI 칸 import) ──
// ── E4 BI 끝 ──
