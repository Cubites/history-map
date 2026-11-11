// sub-saharan-africa 도우미 모듈: F1(1975~현재) 칸별 조각 목록과 칼선 (사하라 이남 F1 뼈대 2026-11-11)
// 칸 경계는 조각 경계다(칼선은 칸을 넘지 않는다). 칸마다 자기 머리 '// ── F1 <칸> 칼선 …'과 '// ── F1 <칸> 끝 ──' 사이에만 `export const <칸>_CUT_…`을 쓰고, 최상위 이름은 칸 앞머리(WA_·EA_·SF_·CE_·HN_)로 시작한다.
// 새 칼선 0 — F1의 나라·변화는 모두 지금 나라 경계(adm0)와 조각 경계로 그려진다(조사 노트 3절: 에리트레아·남수단은 adm0, 소말릴란드는 조각 SOL 하나, 나미비아·짐바브웨는 같은 땅).
//   칸이 칼선을 더하면 자기 머리 아래에, 좌표 주석에 안/밖 기준 도시(안 3·밖 3 이상 — pt-dh.mjs로 확인)를 적는다. 좌표는 조사 꼭짓점을 그대로 쓰지 않고 강·산줄기·주 경계로 다듬는다.
//   다른 권역·앞 단계 칼선을 쓰려면 별칭으로 가져온다(import { X as CE_X } …) — 좌표를 베끼지 않음(check:generator)
// 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음). 칸 몫 조각 목록(F1_*_IDS)은 뼈대가 정했고 칸은 고치지 않는다
import { ALL_IDS, idsOf } from './table.mjs';

// ── 칸 몫 조각 (뼈대 — 모두 합쳐 779개를 한 번씩, 나라 코드는 조각 파일 adm0) ──
// WA 서아프리카 대서양 쪽: 나이지리아 37·베냉 12·토고 5·가나 10·코트디부아르 19·라이베리아 15·시에라리온 4·기니 34·기니비사우 9·카보베르데 21·세네갈 14·감비아 6 = 186
export const F1_WA_IDS = idsOf('NGA', 'BEN', 'TGO', 'GHA', 'CIV', 'LBR', 'SLE', 'GIN', 'GNB', 'CPV', 'SEN', 'GMB');
// EA 대호수·콩고 분지·인도양: 콩고 민주 공화국 11·르완다 5·부룬디 17·우간다 112·케냐 8·탄자니아 30·마다가스카르 22·모리셔스 14·세이셸 22·코모로 3·프랑스 레위니옹·마요트 2 = 246
export const F1_EA_IDS = idsOf('COD', 'RWA', 'BDI', 'UGA', 'KEN', 'TZA', 'MDG', 'MUS', 'SYC', 'COM', 'FRA');
// SF 남부: 앙골라 18·모잠비크 11·잠비아 10·말라위 28·짐바브웨 10·보츠와나 15·레소토 10·에스와티니 4·나미비아 13·남아프리카 9·세인트헬레나(어센션 포함) 2 = 130
export const F1_SF_IDS = idsOf('AGO', 'MOZ', 'ZMB', 'MWI', 'ZWE', 'BWA', 'LSO', 'SWZ', 'NAM', 'ZAF', 'SHN');
// CE 사헬·기니만 안쪽: 말리 9·모리타니 13·니제르 8·부르키나파소 45·차드 22·중앙아프리카 17·카메룬 10·적도기니 6·상투메 프린시페 2·가봉 9·콩고 공화국 12 = 153
export const F1_CE_IDS = idsOf('MLI', 'MRT', 'NER', 'BFA', 'TCD', 'CAF', 'CMR', 'GNQ', 'STP', 'GAB', 'COG');
// HN 뿔·나일: 에티오피아 11·에리트레아 6·지부티 6·소말리아 13·소말릴란드 1·수단 17·남수단 10 = 64
export const F1_HN_IDS = idsOf('ETH', 'ERI', 'DJI', 'SOM', 'SOL', 'SDN', 'SDS');
const all = [F1_WA_IDS, F1_EA_IDS, F1_SF_IDS, F1_CE_IDS, F1_HN_IDS].flat();
if (all.length !== ALL_IDS.length || new Set(all).size !== ALL_IDS.length) throw new Error(`sub-saharan-africa cuts-f1.mjs: 칸 몫 조각이 ${all.length}개(겹침 없이 ${ALL_IDS.length}개여야 함)`);
const counts = [[F1_WA_IDS, 186], [F1_EA_IDS, 246], [F1_SF_IDS, 130], [F1_CE_IDS, 153], [F1_HN_IDS, 64]];
if (counts.some(([ids, n]) => ids.length !== n)) throw new Error(`sub-saharan-africa cuts-f1.mjs: 칸 몫 조각 수 ${counts.map(([ids]) => ids.length).join('·')} (186·246·130·153·64여야 함)`);

// ── F1 WA 칼선 (서아프리카 대서양 쪽, 구현 F1-WA) ──
// ── F1 WA 끝 ──

// ── F1 EA 칼선 (대호수·콩고 분지·인도양, 구현 F1-EA) ──
// ── F1 EA 끝 ──

// ── F1 SF 칼선 (남부, 구현 F1-SF) ──
// ── F1 SF 끝 ──

// ── F1 CE 칼선 (사헬·기니만 안쪽, 구현 F1-CE) ──
// ── F1 CE 끝 ──

// ── F1 HN 칼선 (뿔·나일, 구현 F1-HN) ──
// ── F1 HN 끝 ──
