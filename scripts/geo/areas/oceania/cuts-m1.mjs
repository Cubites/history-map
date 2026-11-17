// oceania 도우미 모듈: M1(1901~현재) 칸별 조각 목록과 칼선 (오세아니아 M1 뼈대 2026-11-17)
// 칸 경계는 조각 경계다(칼선은 칸을 넘지 않는다). 칸마다 자기 머리 '// ── M1 <칸> 칼선 …'과 '// ── M1 <칸> 끝 ──' 사이에만 `export const <앞머리>_CUT_…`을 쓰고,
//   최상위 이름은 칸 앞머리(AZP_·MIC_·PNG_)로 시작한다(붙임표는 이름에 못 씀 — 칸 id AZP-M1·MIC-M1·PNG-M1).
// 이 단계 칼선은 0이다(메인 결정 M-M1-1 — 1885 영독 협정 선과 파푸아뉴기니 주 조각 경계의 어긋남이 조각마다 1만 km² 밑이라 조각 경계 그대로, M1 창구 ② Q2·Q4·G1-19).
//   칸도 긋지 않는다. 그래도 생기면(결과 노트로 까닭) 그 조각을 가진 칸 하나만 자기 머리 아래 `export const <앞머리>_CUT_…`으로 긋고, 좌표 주석에 안/밖 기준 도시
//   (안 3·밖 3 이상 — <h>/pt-dh.mjs로 확인, 좌표는 위키백과)를 적고, 끝 꼭짓점은 가를 조각 경계 밖까지 넉넉히 낸다(ownSplit이 그 조각 안만 씀).
//   시대 파일 칸 머리에서는 별칭으로 가져온다(import { PNG_CUT_… as PNG_… } from './cuts-m1.mjs' — 좌표를 베끼지 않음, check:generator '파일 사이 좌표 되풀이')
// 날짜변경선: 피지 FJ-N·FJ-E와 키리바시 KIR은 한 조각 안에 경도 180° 양쪽 폴리곤을 가진다(조각 파일 상자 넷 — 0단계 기본값 1). 칼선이 아니다(조각 통째로 칠함)
// 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음). 칸 몫 조각 목록(M1_*_IDS)은 뼈대가 정했고 칸은 고치지 않는다
import { ALL_IDS, idsOf } from './table.mjs';

// ── 칸 몫 조각 (뼈대 — 모두 합쳐 138개를 한 번씩, 나라 코드는 조각 파일 adm0) ──
// AZP 오스트레일리아·뉴질랜드·남태평양·하와이: 오스트레일리아 9·뉴질랜드 20(토켈라우 NZL-5472 포함 — 비움, G1-10)·피지 5·통가 3·사모아 11·프랑스령 폴리네시아 4·하와이 US-HI 1
//   + 칠하지 않는 작은 속령(1만 km² 미만 — 0단계 결정 5·G1-9) 아메리칸사모아 2·쿡 제도 1·니우에 1·핏케언 1·왈리스 푸투나 3 = 61
export const M1_AZP_SMALL_IDS = idsOf('ASM', 'COK', 'NIU', 'PCN', 'WLF');
export const M1_AZP_IDS = [...idsOf('AUS', 'NZL', 'FJI', 'TON', 'WSM', 'PYF', 'USA'), ...M1_AZP_SMALL_IDS];
// MIC 미크로네시아·키리바시·투발루·나우루: 키리바시 1·투발루 1·나우루 14·마셜 제도 2·미크로네시아 연방 4·팔라우 11
//   + 칠하지 않는 작은 속령(G1-9) 괌 1·북마리아나 4 = 38
export const M1_MIC_SMALL_IDS = idsOf('GUM', 'MNP');
export const M1_MIC_IDS = [...idsOf('KIR', 'TUV', 'NRU', 'MHL', 'FSM', 'PLW'), ...M1_MIC_SMALL_IDS];
// PNG 파푸아뉴기니·솔로몬·바누아투·누벨칼레도니(2라운드): 파푸아뉴기니 20·솔로몬 제도 10·바누아투 6·누벨칼레도니 3 = 39
export const M1_PNG_IDS = idsOf('PNG', 'SLB', 'VUT', 'NCL');
const all = [M1_AZP_IDS, M1_MIC_IDS, M1_PNG_IDS].flat();
if (all.length !== ALL_IDS.length || new Set(all).size !== ALL_IDS.length || all.some((id) => !ALL_IDS.includes(id))) throw new Error(`oceania cuts-m1.mjs: 칸 몫 조각이 ${all.length}개(겹침 없이 ${ALL_IDS.length}개여야 함)`);
const counts = [[M1_AZP_IDS, 61], [M1_MIC_IDS, 38], [M1_PNG_IDS, 39]];
if (counts.some(([ids, n]) => ids.length !== n)) throw new Error(`oceania cuts-m1.mjs: 칸 몫 조각 수 ${counts.map(([ids]) => ids.length).join('·')} (61·38·39여야 함)`);
if (M1_AZP_SMALL_IDS.length !== 8 || M1_MIC_SMALL_IDS.length !== 5) throw new Error(`oceania cuts-m1.mjs: 작은 속령 조각 ${M1_AZP_SMALL_IDS.length}·${M1_MIC_SMALL_IDS.length}개(8·5여야 함)`);

// ── M1 AZP-M1 칼선 (오스트레일리아·뉴질랜드·남태평양·하와이, 구현 AZP-M1) ──
// 칼선 0(노던 준주·오스트레일리아 수도 준주 1911 이관은 글 — Q3, 하와이는 조각 US-HI 통째)
// ── M1 AZP-M1 끝 ──

// ── M1 MIC-M1 칼선 (미크로네시아·키리바시·투발루·나우루, 구현 MIC-M1) ──
// 칼선 0(독립국·속령 모두 조각 통째)
// ── M1 MIC-M1 끝 ──

// ── M1 PNG-M1 칼선 (파푸아뉴기니·솔로몬·바누아투·누벨칼레도니, 구현 PNG-M1 — 2라운드) ──
// 칼선 0(M-M1-1 — 파푸아/뉴기니 경계는 주 조각 경계 그대로, PG-SHM 남부하일랜즈주는 파푸아 쪽 Q2·부건빌 PG-NSB는 뉴기니 쪽)
// ── M1 PNG-M1 끝 ──
