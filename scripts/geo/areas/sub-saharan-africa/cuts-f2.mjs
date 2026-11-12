// sub-saharan-africa 도우미 모듈: F2(1960~1974) 칸별 조각 목록과 칼선 (사하라 이남 F2 뼈대 2026-11-11)
// 칸 경계는 조각 경계다(칼선은 칸을 넘지 않는다). 칸마다 자기 머리 '// ── F2 <칸> 칼선 …'과 '// ── F2 <칸> 끝 ──' 사이에만 `export const <칸>_CUT_…`을 쓰고, 최상위 이름은 칸 앞머리(WA_·GU_·EA_·SH_·SE_·SF_)로 시작한다.
// 새 칼선 0 — F2의 나라·식민지·변화는 모두 지금 나라 경계(adm0)와 조각 경계로 그려진다(조사 노트 3절: 영국령 카메룬 남부는 CM-NW·CM-SW, 잔지바르는 섬 다섯 조각,
//   루안다-우룬디는 RWA+BDI, 에리트레아 연방은 ERI, 아우주 띠는 TD-TI. 영국령 카메룬 북부 띠는 이 파일에 칼선을 긋지 않음 — F3 CE 칼선(cuts-f3.mjs CE 머리)이
//   1960 띠도 가름: decolonization.mjs GU 블록이 별칭으로 가져옴, F3 기본값 5 — F2 기본값 2 '1960 나이지리아 색'을 바꿈).
//   칸이 칼선을 더하면 자기 머리 아래에, 좌표 주석에 안/밖 기준 도시(안 3·밖 3 이상 — pt-dh.mjs로 확인)를 적는다. 좌표는 조사 꼭짓점을 그대로 쓰지 않고 강·산줄기·주 경계로 다듬는다.
//   다른 권역·앞 단계 칼선을 쓰려면 별칭으로 가져온다(import { X as GU_X } …) — 좌표를 베끼지 않음(check:generator)
// 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음). 칸 몫 조각 목록(F2_*_IDS)은 뼈대가 정했고 칸은 고치지 않는다.
//   F1 칸 목록(cuts-f1.mjs F1_*_IDS)과 나눔이 다르다(F1 다섯 칸 → F2 여섯 칸 — 지리로 다시 나눔, f2/SKEL-NOTE.md 0절)
import { ALL_IDS, idsOf } from './table.mjs';

// ── 칸 몫 조각 (뼈대 — 모두 합쳐 779개를 한 번씩, 나라 코드는 조각 파일 adm0) ──
// WA 서아프리카 대서양 쪽: 라이베리아 15·시에라리온 4·기니 34·기니비사우 9·세네갈 14·감비아 6·카보베르데 21·코트디부아르 19 = 122
export const F2_WA_IDS = idsOf('LBR', 'SLE', 'GIN', 'GNB', 'SEN', 'GMB', 'CPV', 'CIV');
// GU 기니만·적도: 가나 10·토고 5·나이지리아 37·베냉 12·카메룬 10·중앙아프리카 17·가봉 9·콩고 공화국 12·적도 기니 6·상투메 프린시페 2 = 120
export const F2_GU_IDS = idsOf('GHA', 'TGO', 'NGA', 'BEN', 'CMR', 'CAF', 'GAB', 'COG', 'GNQ', 'STP');
// EA 대호수·동아프리카: 콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30(본토 25 + 잔지바르 제도 5) = 183
export const F2_EA_IDS = idsOf('COD', 'RWA', 'BDI', 'UGA', 'KEN', 'TZA');
// SH 사헬·뿔·나일: 말리 9·모리타니 13·니제르 8·부르키나파소 45·차드 22(TD-TI 포함)·에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 SOL 1·수단 17·남수단 10 = 161
export const F2_SH_IDS = idsOf('MLI', 'MRT', 'NER', 'BFA', 'TCD', 'ETH', 'ERI', 'DJI', 'SOM', 'SOL', 'SDN', 'SDS');
// SE 남동·인도양: 잠비아 10·말라위 28·모잠비크 11·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹 FR-RE·마요트 FR-YT 2 = 112
export const F2_SE_IDS = idsOf('ZMB', 'MWI', 'MOZ', 'MDG', 'MUS', 'SYC', 'COM', 'FRA');
// SF 남부: 짐바브웨 10·앙골라 18(카빈다 포함)·보츠와나 15·레소토 10·에스와티니 4·나미비아 13·남아프리카 9·세인트헬레나(어센션 포함) SHN 2 = 81
export const F2_SF_IDS = idsOf('ZWE', 'AGO', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZAF', 'SHN');
const all = [F2_WA_IDS, F2_GU_IDS, F2_EA_IDS, F2_SH_IDS, F2_SE_IDS, F2_SF_IDS].flat();
if (all.length !== ALL_IDS.length || new Set(all).size !== ALL_IDS.length) throw new Error(`sub-saharan-africa cuts-f2.mjs: 칸 몫 조각이 ${all.length}개(겹침 없이 ${ALL_IDS.length}개여야 함)`);
const counts = [[F2_WA_IDS, 122], [F2_GU_IDS, 120], [F2_EA_IDS, 183], [F2_SH_IDS, 161], [F2_SE_IDS, 112], [F2_SF_IDS, 81]];
if (counts.some(([ids, n]) => ids.length !== n)) throw new Error(`sub-saharan-africa cuts-f2.mjs: 칸 몫 조각 수 ${counts.map(([ids]) => ids.length).join('·')} (122·120·183·161·112·81이어야 함)`);

// ── F2 WA 칼선 (서아프리카 대서양 쪽, 구현 F2-WA) ──
// ── F2 WA 끝 ──

// ── F2 GU 칼선 (기니만·적도, 구현 F2-GU) ──
// ── F2 GU 끝 ──

// ── F2 EA 칼선 (대호수·동아프리카, 구현 F2-EA) ──
// ── F2 EA 끝 ──

// ── F2 SH 칼선 (사헬·뿔·나일, 구현 F2-SH) ──
// ── F2 SH 끝 ──

// ── F2 SE 칼선 (남동·인도양, 구현 F2-SE) ──
// ── F2 SE 끝 ──

// ── F2 SF 칼선 (남부, 구현 F2-SF) ──
// ── F2 SF 끝 ──
