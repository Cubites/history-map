// americas 시대 파일 independence (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 아메리카 독립·확장 시대(1776~1899)
// 짝 항목 파일: data/entities/americas-independence.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 다른 도우미 모듈. areas/americas.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/americas/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/americas.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 아메리카 M2 짜임 안내 (M2 뼈대 2026-11-16 — 근거: docs/americas/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 3·6, 창구 ② 2·3·4·5·6·7·8·10, 기본값 1·7·13·17·18·19·23),
//    M1 Q1 (B)·G7·G15·G16, M2 창구 ②(Q1 A·Q2·Q3), 메인 결정 M-M2-1~3, 기본값 G2-1~G2-38, 지시문 am-m2/m2/COMMON.md 2~4절·notes.md C-M2-1~15) ─────────────────
// 등급(00-scope 3절): 일반(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). '주변'은 data/tests/zones.yaml greenland-ice-sheet 안만(땅 5만·선 25/50 km).
// 해 규칙(P1): 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음(점령은 관계 occupied_by — G2 점령 표). 새 버전은 1만 km² 넘게 바뀔 때만.
//   이름만 바뀌는 해(멕시코 제1·2제국·누에바그라나다 공화국·콜롬비아 합중국·리오데라플라타 합중국·브라질 왕국 1815·제국 1822·공화국 1889·1811 아이티 북부 왕국 선포)는 새 버전이 아니다 — 항목 글로(P7).
// 1776 앞 버전 없음: 첫 해는 M2_START(1776, 1776년 말 모습). 1776 앞에 성립한 나라·식민 단위도 첫 버전은 1776부터이고(M3 1492~1775가 같은 id로 앞을 이음), 1775 이하 이 권역 땅은 빈 것이 정상(빈 땅 검사 구역도 1776부터만).
// 끝 해(이음): 이 파일 표의 주인은 1899까지(M2_END = 1900 = M1 modern.mjs의 M1_START — 아래 확인 줄). 1899 모양 = M1 1900 모양이 원칙이고(m2/SKEL-NOTE.md 3절 이음 표),
//   결정이 만든 1899→1900 점프는 아마파 북 띠 92,070 km²(G7 — 1899 비움, 1900 brazil)뿐. 그 밖에 1만 km² 넘게 주인이 바뀌면 칸 결과 노트 2절에 까닭.
// 큰 내륙(Q1 A): 조약·헌장·허가 문서가 생긴 해부터 안쪽 전부(명목이면 mapNote '명목'), 문서 없는 청구는 비움 — 루퍼츠랜드 1776~·북서부 영토 1821~·북극 제도 1880·누에바에스파냐 북부 내륙 1819~·
//   루이지애나 1762 조약 땅 전체 1776~1802 spanish-louisiana, 1803~ usa(같은 모양, 서쪽 끝 두 시기 모두 1819 선 — M-M2-2)·동부 내륙 1783 파리 조약선·오하이오 쪽 1776~1782 province-of-quebec(Q2·M-M2-1)·
//   팜파스 알시나 참호선 안만·파타고니아·라팜파·차코 오스트랄 1881·1879·1884. 맞선 두 나라 분쟁 띠는 비움(결정 7 — 오리건 1818~1845·뉴에이서스강 띠·31°~32°28′ 1783~1795·텍사스 서쪽 1836~1847).
//   메인 결정 M-M2-3: C-M2-4(미시시피·앨라배마 32°28′ 북쪽 1776~1782)·C-M2-9(래브라도 1776~1808)는 지시문 권장 ㉮로 짜고 창구 ③에서 물음 —
//   결과(decisions-end.md): C-M2-4 비움 그대로, C-M2-9는 래브라도 본토 1776~1790 province-of-quebec·1791~1808 lower-canada(BNA-E-M2 머리 — 반영), 키호스 1802~1818 peru-viceroyalty(AND-N-M2 머리 — 반영).
// usa(미국): 블록은 data/entities/americas-modern.yaml(US-M2 — mapNote·summary·출처, P3). 1776~1899는 조각 바탕(US-M2 머리 줄과 다른 칸의 usa 줄 FL-M2·MX-M2·NW-M2) — 옛 손그림(뼈대 임시 줄·도우미 usa-hand.mjs)과
//   권역 파일 SOURCE_KEEP은 US-M2가 지움.
// 늘림 나라(권역 파일 EXTENDABLE — 0단계 창구 ② 결정 3·C-M2-11): 유럽 항목 russia [1778, 1918). 이 파일은 RU-CHU(추코트카 서경 쪽)를 1778~1897만 칠한다(NW-M2 —
//   1898~1899는 M1 modern.mjs의 extra(M1_EARLY)라 [1898, null]로 끝냄 — 아래 확인 줄). 다른 앞 권역 나라(spain·uk·france·portugal·dutch-republic·batavian-republic·denmark-norway 등)는 주인으로 쓰지 않는다 — 관계로만(P2).
// 칸 나눔(부딪침 막기 — 지리 칸 열둘, 네 라운드): 칸 경계는 조각 경계(cuts-m2.mjs M2_*_IDS — 664를 한 번씩)라 칼선은 칸을 넘지 않는다. 각 칸은 자기 머리 줄('// ── M2 <칸> …')과 그 칸 '끝' 줄 사이에만 쓴다
//   (칼선 import·상수·own 줄·extra 줄·voids 함수 모두). 최상위 이름은 칸 앞머리 FL2_·BNW2_·SCE2_·US2_·BNE2_·SCW2_·MX2_·ANN2_·CAM2_·CAR2_·NW2_·BRG2_, import도 별칭(예: US2_K1), ownSplit 묶음 이름도 앞머리(예: 'US2_…').
//   칸 밖 공통 줄(import·도우미·BOUNDS 합치기·표 만들기·버전·확인 줄·빈 땅 검사 구역·끝 void 줄·era)은 고치지 않는다(바꿔야 하면 결과 노트 6절).
// 칸을 넘는 주인 줄(COMMON 4절 '칸을 넘는 항목' — 조각의 own 줄은 그 조각을 가진 칸 하나가 쓰고, 다른 칸 항목을 주인으로 쓸 때 그 항목 글·관계·허용 열쇠는 블록 칸이):
//   usa — FL-M2(US-MS·AL 1783·1796·1813, US-LA·AR·MO 1803·1810, US-FL 1821)·MX-M2(US-TX 1845·1848, 서남 1848·1853, US-CO 1803)·NW-M2(US-AK 1867) · canada — BNA-E-M2(CA-ON·QC·NS·NB 1867·CA-PE 1871)·NW-M2(CA-BC 1871) ·
//   ruperts-land — BNA-E-M2(CA-ON·CA-QC 허드슨만 물길 1776~1869)·US-M2(US-MN·ND·SD 레드강 1776~1818) · north-western-territory — NW-M2(CA-BC 1821·1846~1857) · province-of-quebec — US-M2(오하이오 땅 1776~1782) ·
//   spanish-louisiana — US-M2(대평원 1776~1802)·MX-M2(US-CO 1819선 북·동 1776~1802) · new-spain-viceroyalty·mexico — US-M2(US-KS 서남·US-OK 팬핸들·US-WY 서남 1819~1835·1847)·CAM-M2(mexico 1822 다섯 주) ·
//   guatemala-captaincy — MX-M2(MX-CHP 1776~1821) · rio-de-la-plata-viceroyalty — AND-N-M2(BO-*·BR-AC 1776~1809)·SC-W-M2(CL-AN 24°S 북쪽 1776~1809) · peru-viceroyalty — SC-W-M2(칠레 1776~1788·CL-AN 북 1810~1824·CL-TA·CL-AP ~1820)·SC-E-M2(푸나 1810~1824) ·
//   bolivia — SC-W-M2(CL-AN 북 1825~1878·푸나 칠레 몫)·SC-E-M2(푸나 1825~1878) · chile·argentina — AND-N-M2(PE-TAC 1883 chile) · peru — SC-W-M2(CL-TA·CL-AP 1821~1882) · portuguese-brazil·brazil — SC-E-M2(UY-* 1817~1827).
//   그 밖에 칸은 자기 몫이 아닌 조각에 줄을 적지 않는다(fillTables가 주인 null로 채움).
// 칼선 파일: cuts-m2.mjs에 칸 머리 열둘(뼈대는 새 칼선 0 — 자리 이름만). 칸이 칼선을 더하면 그 파일 자기 머리 아래 export const <앞머리>_CUT_…으로 쓰고, 이 파일 칸 머리에서
//   import { <앞머리>_CUT_… as <앞머리>_… } from './cuts-m2.mjs'로 가져온다. 앞 단계 M1 칼선·손 도형(cuts-m1.mjs — C-M2-10)도 별칭 import로(예 import { NA_CUT_GLSM as NW2_GLSM } from './cuts-m1.mjs').
//   앞 라운드 칸 칼선(특별 지시 4 — BNW2_CUT_HBS·SCE2_CUT_PUNA_CL·US2_CUT_1819_ARK·US2_CUT_1819_42N·US2_CUT_1848)도 별칭 import. 좌표를 베끼지 않음(check:generator '파일 사이 좌표 되풀이').
// 표 경계 해: 칸마다 <앞머리>_BOUNDS(칸이 사료로 더하고 뺌)를 공통 BOUNDS가 합친다(M2_START·M2_END 포함). 표 하나 안에서는 단위(조각·나눈 부분)의 모양이 같고 주인만 해마다 바뀐다.
//   조각 통째로만 칠하면 BOUNDS를 늘리지 않아도 된다. ownSplit의 { from, to }는 BOUNDS의 해여야 한다(fillTables가 확인).
// 주인 줄: own(단위 목록, [[해, 나라 id|null], ...]) — 첫 해는 M2_START(1776)부터, 해는 늘어나고 1899 이하(첫 해가 늦으면 생성기가 '표 첫 해의 주인이 없음'으로 멈춤).
//   예: own(idsOf('PRY'), [[M2_START, 'rio-de-la-plata-viceroyalty'], [1811, 'paraguay']]) · own(['US-NV', 'US-UT'], [[M2_START, null], [1819, 'new-spain-viceroyalty'], [1822, 'mexico'], [1848, 'usa']]).
//   주인 null은 '이 권역 나라가 칠하지 않는 땅'이다: 일부러 비운 땅(칸 voids에 한 줄과 이유 — 문서 없는 청구·분쟁 띠·1만 km² 미만 속령 섬 등)만.
// 표 밖 땅 extra(id, from, to, { units, shape, name }): 손 도형(조각 밖 — 러시아령 아메리카 해안 띠·M1 알류샨 동경 쪽·180° 틈 띠)과 그 기간 더하는 단위. to는 1900 이하(null은 M2_END).
// 시대 경계 맞물림: 앞 시대 파일이 없다(M3 colonial 1492~1775가 생기면 그 끝 해 = M2_START). 뒤 시대 M1 modern.mjs는 1900부터 — 이 파일 버전은 모두 1900 이하에서 끝난다(to: null 없음, 아래 확인 줄).
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 americas.mjs의 sourceOf가 table.mjs AM_SOURCE_TEXT를 붙인다(usa도 같은 문구 — M-M1-9).
// 이름·확실성: 근거가 약한 경계는 estimated(기본값). 이름은 data/tests/spelling.yaml(아메리카 첫판·M1 공통·M2 공통·칸 머리)과 m2/SKEL-NOTE.md 끝 공용 표기표를 먼저 본다.
//
// 가져오기: 아래 줄들은 공통이다. 각 칸이 더 가져올 것은 자기 칸 머리에 import 줄을 따로 둔다(import는 모듈 맨 위로 끌어올려지므로 칸 안에 두어도 된다)
import { D, I, U } from '../../lib.mjs';
import { ALL_IDS, DOMAIN, F, idsOf, minus, tableKit } from './table.mjs';
import { M2_FL_IDS, M2_BNW_IDS, M2_SCE_IDS, M2_US_IDS, M2_BNE_IDS, M2_SCW_IDS, M2_MX_IDS, M2_ANN_IDS, M2_CAM_IDS, M2_CAR_IDS, M2_NW_IDS, M2_BRG_IDS } from './cuts-m2.mjs';

const { build, geomOfUnit, joinTables, makeTable } = tableKit('independence');

const M2_START = 1776; // 이 시대 파일의 첫 해(1776년 말 모습). 그 앞(1775 이하)은 M3 colonial 몫
const M2_END = 1900; // 마지막 표의 끝(미포함) = 뒤 시대 M1의 첫 해
const M1_START = 1900; // M1 시대 파일 modern.mjs의 M1_START(그 파일은 export하지 않아 값을 여기 적음 — 둘이 다르면 멈춤)
if (M2_END !== M1_START) throw new Error(`americas independence: 끝 해 ${M2_END}가 M1 첫 해 ${M1_START}와 다름(시대 경계 맞물림)`);
const M1_EARLY = { russia: 1898 }; // M1 modern.mjs가 표 첫 해 앞(1898~1899)을 extra로 칠하는 나라 — 이 파일 버전은 그 해 앞에서 끝나야 함(아래 확인 줄)

// ── 조각 소유표 도우미 (M1 modern.mjs와 같은 꼴 — M2 뼈대가 옮김, 끝 해 M2_END·to: null 없음만 다름) ─────────────────────────────
// 표 경계 해(BOUNDS)는 칸 머리의 <칸>_BOUNDS를 칸 줄 뒤에서 합친다 — 그래서 아래 도우미는 BOUNDS를 fillTables에서만 본다
const lines = new Map(); // 단위 이름(조각 id 또는 '묶음/부분') → 주인 줄 [[해, 주인], …]
const layouts = []; // 나눈 조각 { name, ids, parts, restName, from, to, units }
const checkLine = (u, line) => {
  if (!Array.isArray(line) || !line.length || line.some((e, i) => !Array.isArray(e) || e.length !== 2 || !Number.isInteger(e[0]) || (i && e[0] <= line[i - 1][0]) || e[0] < M2_START || e[0] >= M2_END)) {
    throw new Error(`americas independence: ${u}의 줄 ${JSON.stringify(line)} (해는 정수로 늘어나고 ${M2_START} 이상 ${M2_END} 전)`);
  }
};
// 주인 줄 적기: 단위마다 앞 줄 뒤에 잇는다(첫 줄이 아니면 첫 해가 앞 줄의 마지막 해보다 뒤)
const own = (units, line) => {
  for (const u of units) {
    checkLine(u, line);
    const prev = lines.get(u);
    if (prev && line[0][0] <= prev.at(-1)[0]) throw new Error(`americas independence: ${u}의 이은 줄 첫 해 ${line[0][0]}가 앞 줄의 마지막 해 ${prev.at(-1)[0]} 이하`);
    lines.set(u, prev ? [...prev, ...line] : [...line]);
  }
};
// 나눈 조각: parts는 [[부분 이름, 칼선 도형], …](첫 부분 = 칼선1 안, 다음 = 칼선2 안 − 앞 칼선, …, 나머지 = 모든 칼선 밖). 반환 { 부분: '묶음/부분' }
// 마지막 인자 { from, to }는 이 묶음을 쓰는 기간(BOUNDS의 해 — fillTables가 확인). 같은 조각을 기간마다 다르게 나누면 묶음 이름을 달리해 여럿 둔다
const ownSplit = (name, ids, parts, restName, partLines = {}, { from = M2_START, to = M2_END } = {}) => {
  if (!(Number.isInteger(from) && Number.isInteger(to) && from < to)) throw new Error(`americas independence: 나눈 조각 ${name}의 기간 [${from}, ${to})이 틀림`);
  if (layouts.some((l) => l.name === name)) throw new Error(`americas independence: 나눈 조각 묶음 이름 ${name}이 겹침(기간마다 다른 이름)`);
  for (const l of layouts) {
    const shared = l.ids.filter((id) => ids.includes(id));
    if (shared.length && l.from < to && from < l.to) throw new Error(`americas independence: 나눈 조각 ${name}과 ${l.name}이 같은 기간에 조각 ${shared.join(', ')}를 함께 씀`);
  }
  const units = Object.fromEntries([...parts.map(([p]) => [p, `${name}/${p}`]), [restName, `${name}/${restName}`]]);
  layouts.push({ name, ids, parts, restName, from, to, units, out: null });
  for (const [p, line] of Object.entries(partLines)) {
    if (!units[p]) throw new Error(`americas independence: 나눈 조각 ${name}에 없는 부분 ${p}`);
    own([units[p]], line);
  }
  return units;
};
// 한 표 기간의 줄(첫 해는 표의 첫 해). 그 표 첫 해에 주인이 정해지지 않았으면 멈춘다
const sliceLine = (u, line, FROM, TO) => {
  const head = line.filter(([y]) => y <= FROM).at(-1);
  if (!head) throw new Error(`americas independence: ${u}의 줄이 ${line[0][0]}년에 시작해 ${FROM}~${TO - 1} 표 첫 해의 주인이 없음`);
  return [[FROM, head[1]], ...line.filter(([y]) => y > FROM && y < TO)];
};
// 일부러 비운 땅 한 줄: V(from, to, 조각 id…)·B(from, to, 단위 이름…) — [from, to, 도형], to는 M2_END 이하(null 없음). 칸의 voids 함수 안에서만 부른다(B는 fillTables 뒤라야 단위 도형이 있음)
const V = (from, to, ...ids) => [from, to, F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)];
// ── 표 밖 땅 (M1 꼴 — 칸 머리에서 부름, 이 도우미는 고치지 않음) ─────────────────────────────
// extra(나라 id, from, to(null = M2_END), { units, shape, name }): 소유표 밖에서 그 기간 그 나라 버전에 더하는 땅.
//   - units: 조각 id·나눈 부분 이름 목록(표 줄과 같은 단위 목록이 이어지면 한 버전)
//   - shape·name: 조각 밖 손 도형(멀티폴리곤 — 바다 쪽은 빌드가 육지와 교차)과 그 이름(칸 앞머리로 — 예 'NW2_RUSAM_COAST'). 같은 이름은 같은 도형이어야 한다
//   버전 = 그해 표 줄의 단위 ∪ 더하는 단위 ∪ 손 도형(손 도형 하나뿐이면 그 도형 그대로). 버전은 표 줄·더하는 땅의 기간 경계에서 나뉘고 같은 모양이 이어지면 한 버전이다
const extras = [];
const extraShapes = new Map(); // 손 도형 이름 → 도형
const extra = (id, from, to, { units = [], shape = null, name = null } = {}) => {
  const end = to ?? M2_END;
  if (!Number.isInteger(from) || !Number.isInteger(end) || from >= end || from < M2_START || end > M2_END) throw new Error(`americas independence: ${id}의 표 밖 땅 기간 [${from}, ${to}) (${M2_START} 이상, 끝 ${M2_END} 이하 또는 null)`);
  if (!Array.isArray(units) || (!units.length && !shape)) throw new Error(`americas independence: ${id}의 표 밖 땅 ${from}~에 단위도 손 도형도 없음`);
  if (shape && !name) throw new Error(`americas independence: ${id}의 손 도형에 이름이 없음`);
  if (name && !shape) throw new Error(`americas independence: 손 도형 이름 ${name}에 도형이 없음`);
  if (name && extraShapes.has(name) && extraShapes.get(name) !== shape) throw new Error(`americas independence: 손 도형 이름 ${name}이 다른 도형에 겹침`);
  if (name) extraShapes.set(name, shape);
  extras.push({ id, from, to: end, units: [...units], name });
};

// ── M2 FL-M2 플로리다·루이지애나 (최상위 이름 FL2_) ──
// 조각 M2_FL_IDS(US-FL·US-LA·US-MS·US-AL·US-AR·US-MO = 6), 구현 FL-M2(1라운드)
// 항목(새 3): spanish-louisiana [1776, 1803)·spanish-florida [1783, 1821)·british-florida [1776, 1783). 칸을 넘는 주인: usa 줄(US-MS·AL 1783·1796·1813, US-LA·AR·MO 1803·1810, US-FL 1821 — usa 블록 글은 US-M2)
// 칼선 자리(cuts-m2.mjs FL-M2 머리): FL2_CUT_31N·FL2_CUT_3228N·FL2_CUT_IBERVILLE. voids 자리: 31°~32°28′ 띠 1783~1795(G2-3)·32°28′ 북쪽 1776~1782(C-M2-4 ㉮ — 창구 ③)
import { FL2_CUT_31N as FL2_K31, FL2_CUT_3228N as FL2_K3228, FL2_CUT_IBERVILLE as FL2_KIBV } from './cuts-m2.mjs';
// 1776~1812 표에서만 US-MS·US-AL·US-LA를 나누고, 1813(모빌 지구 병합 — 세 조각 모두 usa가 됨)부터는 조각 통째(1899 모양 = M1 1900 usa 조각 통째)
const FL2_BOUNDS = [1813];
{ // 칸 안 확인: 이 칸이 쓰는 조각 = M2_FL_IDS
  const mine = ['US-FL', 'US-LA', 'US-MS', 'US-AL', 'US-AR', 'US-MO'];
  if (mine.length !== M2_FL_IDS.length || mine.some((id) => !M2_FL_IDS.includes(id))) throw new Error('americas independence: FL-M2 조각 목록이 M2_FL_IDS와 다름');
}
// 미시시피·앨라배마: 북위 31° 남쪽(서플로리다 기슭)·31°~32°28′ 띠(나체즈 지구 등)·32°28′ 북쪽(1763 국왕 선언 인디언 보호구)
const FL2_MSAL = ownSplit('FL2_MSAL', ['US-MS', 'US-AL'], [['남', FL2_K31], ['띠', FL2_K3228]], '북', {
  남: [[M2_START, 'british-florida'], [1783, 'spanish-florida']], // 1783-09-03 파리 조약(영국–스페인)으로 스페인이 되찾음, 1813-04 모빌 점령으로 usa(아래 통째 줄)
  띠: [[M2_START, 'british-florida'], [1783, null], [1796, 'usa']], // 1783~1795 미국·스페인 분쟁(G2-3), 1795 핀크니 조약 발효 1796 usa(C-M2-5)
  북: [[M2_START, null], [1783, 'usa']], // 1776~1782 어느 식민 단위 문서도 이름으로 가리키지 않은 원주민 땅(C-M2-4 ㉮), 1783 파리 조약선 안
}, { from: M2_START, to: 1813 });
// 루이지애나: 미시시피강·이버빌강·호수 북쪽 플로리다 교구(서플로리다)와 그 밖(강 서쪽 + 오를레앙 섬 — 1762 퐁텐블로 조약 땅)
ownSplit('FL2_LA', ['US-LA'], [['동', FL2_KIBV]], '서', {
  동: [[M2_START, 'british-florida'], [1783, 'spanish-florida'], [1810, 'usa']], // 1810-12-10 미국 병합 선포(G2-4)
  서: [[M2_START, 'spanish-louisiana'], [1803, 'usa']], // 1803-11-30 프랑스 거쳐 이양, 12-20 미국 인수(M-M2-2)
}, { from: M2_START, to: 1813 });
own(['US-MS', 'US-AL', 'US-LA'], [[1813, 'usa']]);
own(['US-AR', 'US-MO'], [[M2_START, 'spanish-louisiana'], [1803, 'usa']]); // 1762 조약 땅 — 1803 루이지애나 매입
own(['US-FL'], [[M2_START, 'british-florida'], [1783, 'spanish-florida'], [1821, 'usa']]); // 애덤스-오니스 조약 발효 1821-02-22·이양 1821-07(G2-5)
const FL2_voids = () => [
  B(M2_START, 1783, FL2_MSAL['북']), // 미시시피·앨라배마 32°28′ 북쪽: 1776~1782 영국 식민 단위 밖 원주민 땅(1763 국왕 선언 보호구 — C-M2-4 ㉮)
  B(1783, 1796, FL2_MSAL['띠']), // 31°~32°28′ 띠: 1783~1795 미국·스페인 분쟁(1783 조약이 경계를 정하지 않음 — G2-3)
];
// ── M2 FL-M2 끝 ──

// ── M2 BNA-W-M2 캐나다 서쪽·허드슨만 (최상위 이름 BNW2_) ──
// 조각 M2_BNW_IDS(CA-MB·CA-SK·CA-AB·CA-NT·CA-NU·CA-YT = 6), 구현 BNA-W-M2(1라운드)
// 항목(새 2): ruperts-land [1776, 1870)·north-western-territory [1821, 1870). 앞 잇기 canada(블록 — americas-modern.yaml). 칼선 자리: BNW2_CUT_HBS(K9 — BNA-E-M2가 읽음)·BNW2_CUT_HBW(K10)·BNW2_CUT_ARCTIC(K12)
// 1899 = M1 1900 canada(이음 표). 북극 제도 1880(추밀원령)·밀크강(C-M2-12 — 반영 F1: 칼선 BNW2_CUT_MILK, 1776~1802 spanish-louisiana·1803~1818 usa·1819~ ruperts-land)
const BNW2_BOUNDS = []; // 이 칸 안 앞 권역 도형이 바뀌는 해 없음. 나눈 조각 묶음 하나(K12·K10)는 시대 내내 같은 모양으로 나누고 주인만 바뀌어 표 경계 해를 더하지 않음
import { BNW2_CUT_ARCTIC as BNW2_K12, BNW2_CUT_HBW as BNW2_K10, BNW2_CUT_MILK as BNW2_KMILK } from './cuts-m2.mjs';
const BNW2_SPLIT = ['CA-SK', 'CA-AB', 'CA-NT', 'CA-NU']; // 분수령·섬 가름이 지나는 조각(서스캐처원·앨버타·노스웨스트 준주·누나부트)
// 허드슨만 물길(Q1 A — 1670 헌장·1713 위트레흐트 조약, 1870-07-15 캐나다 이양): 매니토바 통째 + 나눈 조각의 K10 안(북극 제도는 K12가, 49°선 북쪽 미주리 물길(밀크강)은 BNW2_KMILK가 먼저 뗌)
own(['CA-MB'], [[M2_START, 'ruperts-land'], [1870, 'canada']]);
// 물길 밖 본토(매켄지강·유콘강·북극해 물길): 1821 허드슨 베이 회사 독점 허가 앞은 비움(Q1 A — 문서 없는 청구), 1821~1869 북서부 영토, 1870 캐나다
own(['CA-YT'], [[M2_START, null], [1821, 'north-western-territory'], [1870, 'canada']]);
const BNW2_N = ownSplit('BNW2_N', BNW2_SPLIT, [['제도', BNW2_K12], ['밀크', BNW2_KMILK], ['물길', BNW2_K10]], '물길밖', {
  제도: [[M2_START, null], [1880, 'canada']], // 북극 제도 — 1880-07-31 추밀원령(인접 영토 이양) 앞은 영국의 청구뿐(Q1 A·R3)
  // 49°선 북쪽 미주리 물길(밀크강): 1762 퐁텐블로 조약 루이지애나 땅(M-M2-2) → 1803 루이지애나 매입 → 1818-10-20 협약 49°선(비준 1819 — 레드강과 같은 해 규칙 C-M2-3) 루퍼츠랜드(반영 F1)
  밀크: [[M2_START, 'spanish-louisiana'], [1803, 'usa'], [1819, 'ruperts-land'], [1870, 'canada']],
  물길: [[M2_START, 'ruperts-land'], [1870, 'canada']],
  물길밖: [[M2_START, null], [1821, 'north-western-territory'], [1870, 'canada']],
});
{ // 칸 안 확인: 칸 몫 조각 6을 한 번씩 다 씀(통째 2 + 나눈 조각 4)
  const used = ['CA-MB', 'CA-YT', ...BNW2_SPLIT];
  if (used.length !== M2_BNW_IDS.length || new Set(used).size !== used.length || used.some((id) => !M2_BNW_IDS.includes(id)) || used.some((id) => !idsOf('CAN').includes(id))) throw new Error(`americas independence: BNA-W-M2 칸 조각 ${used.length}개가 M2_BNW_IDS ${M2_BNW_IDS.length}개와 다름`);
}
const BNW2_voids = () => [
  B(M2_START, 1821, BNW2_N.물길밖), // 허드슨만 물길 밖 본토 — 1821 허드슨 베이 회사 독점 허가 앞은 문서 없는 청구(Q1 A)
  V(M2_START, 1821, 'CA-YT'), // 같은 까닭(유콘강 물길)
  B(M2_START, 1880, BNW2_N.제도), // 북극 제도 — 1880-07-31 추밀원령 앞은 영국의 청구뿐(Q1 A·R3)
];
// ── M2 BNA-W-M2 끝 ──

// ── M2 SC-E-M2 라플라타 (최상위 이름 SCE2_) ──
// 조각 M2_SCE_IDS(아르헨티나 24·우루과이 19·HOLE-3·파라과이 18 = 62), 구현 SC-E-M2(1라운드)
// 항목(새 1): rio-de-la-plata-viceroyalty [1776, 1816). 앞 잇기 argentina·uruguay·paraguay. 칼선 자리: SCE2_CUT_PUNA_AR·SCE2_CUT_PUNA_CL(SC-W-M2가 읽음)·SCE2_CUT_ALSINA
// 칸을 넘는 주인: peru-viceroyalty·bolivia 줄(푸나 1810~1824·1825~1878 — 블록 글은 AND-N-M2), portuguese-brazil·brazil 줄(UY-* 1817~1827 — 블록 글은 BRG-M2). 1899 = M1 1900(차코 PY-15·16·19 비움 포함)
import { SCE2_CUT_PUNA_AR as SCE2_PUNA, SCE2_CUT_ALSINA as SCE2_ALSINA } from './cuts-m2.mjs';
const SCE2_BOUNDS = [1879, 1899]; // 1879 알시나선 밖·라팜파가 아르헨티나로(나눈 조각 끝) · 1899 부캐넌 판정(푸나 나눈 조각 끝 — 뒤는 조각 통째)
// 조각 묶음(합 62 — 아래 확인 줄)
const SCE2_AR_ALSINA = ['AR-B', 'AR-X', 'AR-D', 'AR-M']; // 부에노스아이레스·코르도바·산루이스·멘도사 — 알시나 참호선·서쪽 요새선 바깥 원주민 땅을 1878까지 비움(Q1 A)
const SCE2_AR_PUNA = ['AR-Y', 'AR-A', 'AR-K']; // 후후이·살타·카타마르카 — 푸나 데 아타카마 아르헨티나 몫(1899 판정)을 품음
const SCE2_AR_CORE = ['AR-C', 'AR-E', 'AR-F', 'AR-G', 'AR-J', 'AR-N', 'AR-S', 'AR-T', 'AR-W']; // 정착 16의 나머지 아홉(미시오네스 AR-N은 최종선 처음부터 — G2-24)
const SCE2_AR_PAMPA = ['AR-L']; // 라팜파 — 1879 리오네그로 원정(G2-20)
const SCE2_AR_PATAGONIA = ['AR-Q', 'AR-R', 'AR-U', 'AR-Z', 'AR-V']; // 네우켄·리오네그로·추부트·산타크루스·티에라델푸에고 — 1881-07-23 칠레–아르헨티나 조약(G2-20)
const SCE2_AR_CHACO = ['AR-H', 'AR-P']; // 차코·포르모사(차코 오스트랄) — 1884 차코 준주(G2-20)
const SCE2_UY = [...idsOf('URY'), 'HOLE-3']; // 우루과이 19 + 구멍
const SCE2_PY_CHACO = ['PY-15', 'PY-16', 'PY-19']; // 차코 보레알 — 1776~1899 내내 비움(M1 1900~1937과 같음)
const SCE2_PY = idsOf('PRY').filter((id) => !SCE2_PY_CHACO.includes(id)); // 파라과이 동쪽 15
const SCE2_ALL = [...SCE2_AR_ALSINA, ...SCE2_AR_PUNA, ...SCE2_AR_CORE, ...SCE2_AR_PAMPA, ...SCE2_AR_PATAGONIA, ...SCE2_AR_CHACO, ...SCE2_UY, ...SCE2_PY_CHACO, ...SCE2_PY];
if (SCE2_ALL.length !== M2_SCE_IDS.length || new Set(SCE2_ALL).size !== SCE2_ALL.length || SCE2_ALL.some((id) => !M2_SCE_IDS.includes(id))) throw new Error(`americas independence SC-E-M2: 칸 조각 ${SCE2_ALL.length}개(M2_SCE_IDS ${M2_SCE_IDS.length}개와 같아야 함)`);
// 정착 땅: 1776-08-01 부왕령 설치 → 1816-07-09 투쿠만 독립 선언(G2-15 — 후니타 1810~1815는 식민 색)
own(SCE2_AR_CORE, [[M2_START, 'rio-de-la-plata-viceroyalty'], [1816, 'argentina']]);
const SCE2_AL = ownSplit('SCE2_ALSINA', SCE2_AR_ALSINA, [['밖', SCE2_ALSINA]], '안', {
  밖: [[M2_START, null]], // 알시나선·요새선 바깥 원주민 땅 — 1879 리오네그로 원정 앞 비움(Q1 A)
  안: [[M2_START, 'rio-de-la-plata-viceroyalty'], [1816, 'argentina']],
}, { from: M2_START, to: 1879 });
own(SCE2_AR_ALSINA, [[1879, 'argentina']]); // 1879 원정 뒤 조각 통째
const SCE2_PU = ownSplit('SCE2_PUNA', SCE2_AR_PUNA, [['푸나', SCE2_PUNA]], '나머지', {
  푸나: [[M2_START, 'rio-de-la-plata-viceroyalty'], [1810, 'peru-viceroyalty'], [1825, 'bolivia'], [1879, null]], // 아타카마(포토시 관할) — 1810 상페루와 함께 페루 부왕령, 1825 볼리비아, 1879 칠레 점령 뒤 1898까지 분쟁 비움
  나머지: [[M2_START, 'rio-de-la-plata-viceroyalty'], [1816, 'argentina']],
}, { from: M2_START, to: 1899 });
own(SCE2_AR_PUNA, [[1899, 'argentina']]); // 1899 부캐넌 판정 뒤 조각 통째(= M1 1900)
own(SCE2_AR_PAMPA, [[M2_START, null], [1879, 'argentina']]);
own(SCE2_AR_PATAGONIA, [[M2_START, null], [1881, 'argentina']]);
own(SCE2_AR_CHACO, [[M2_START, null], [1884, 'argentina']]);
// 우루과이: 1816 아르티가스(비움) → 1817-01-20 포르투갈군 몬테비데오 → 1822 브라질 독립 → 1828-08-27 예비 평화 조약(G2-25)
own(SCE2_UY, [[M2_START, 'rio-de-la-plata-viceroyalty'], [1816, null], [1817, 'portuguese-brazil'], [1822, 'brazil'], [1828, 'uruguay']]);
own(SCE2_PY, [[M2_START, 'rio-de-la-plata-viceroyalty'], [1811, 'paraguay']]); // 1811-05-14 아순시온
own(SCE2_PY_CHACO, [[M2_START, null]]);
const SCE2_voids = () => [
  B(M2_START, 1879, SCE2_AL.밖), // 알시나 참호선·서쪽 요새선 바깥 원주민 땅 — Q1 A(문서 없는 청구 비움)
  V(M2_START, 1879, ...SCE2_AR_PAMPA), // 라팜파 원주민 땅 — 1879 원정 앞(G2-20)
  V(M2_START, 1881, ...SCE2_AR_PATAGONIA), // 파타고니아·티에라델푸에고 — 1881 조약 앞(G2-20)
  V(M2_START, 1884, ...SCE2_AR_CHACO), // 차코 오스트랄 — 1884 앞 원주민 땅·볼리비아와 다툼(G2-20·결정 7)
  B(1879, 1899, SCE2_PU.푸나), // 푸나 데 아타카마 — 1879 칠레 점령부터 1899 판정 앞까지 세 나라 다툼(결정 7)
  V(1816, 1817, ...SCE2_UY), // 우루과이 — 아르티가스 연방 동맹 땅, 부왕령 끝과 포르투갈 점령 사이(G2-25)
  V(M2_START, M2_END, ...SCE2_PY_CHACO), // 차코 보레알 — 볼리비아·파라과이 다툼(M1 1900~1937과 같음)
];
// ── M2 SC-E-M2 끝 ──

// ── M2 US-M2 미국 (최상위 이름 US2_) ──
// 조각 M2_US_IDS(미국 50 − FL 6 − MX 7 − US-AK = 36, 워싱턴 D.C. 포함), 구현 US-M2(2라운드)
// 항목: 새 항목 없음 — 앞 잇기 usa(블록 americas-modern.yaml — mapNote·summary·출처 문구). 칼선 자리: US2_CUT_MISS(K1)·US2_CUT_DIVIDE(K3)·US2_CUT_REDRIVER(K4)·US2_CUT_1819_ARK(K5)·US2_CUT_1819_42N(K6)·US2_CUT_1848(K7) — 뒤 셋은 MX-M2가 읽음
// 칸을 넘는 주인: province-of-quebec(오하이오 땅 1776~1782 — 블록 BNA-E-M2)·ruperts-land(US-MN·ND·SD 레드강 1776~1818 — BNA-W-M2)·spanish-louisiana(대평원 1776~1802 — FL-M2)·new-spain-viceroyalty·mexico(US-KS·OK·WY 서남 1819~1847 — MX-M2)
// usa 1899 = M1 1900(조각 50 + 알류샨 동경 쪽 — 이음 표). 옛 손그림(임시 줄 넷·usa-hand.mjs)과 권역 파일 SOURCE_KEEP은 지움(장치 시험 ② 꼴)
// 손그림(M1 뼈대 usa 1848~1899)은 지웠다 — usa 1776~1899는 아래 조각 줄과 다른 칸의 usa 줄(FL-M2·MX-M2·NW-M2)로만 그린다
import { US2_CUT_MISS as US2_K1, US2_CUT_DIVIDE as US2_K3, US2_CUT_REDRIVER as US2_K4_RED, US2_CUT_RAINY as US2_K4_RAINY, US2_CUT_1819_ARK as US2_K5, US2_CUT_1819_42N as US2_K6 } from './cuts-m2.mjs';
const US2_BOUNDS = []; // 조각 통째·나눈 부분의 주인 줄만 해마다 바뀜(나눈 묶음은 시대 내내 같은 모양) — 표 경계를 늘리지 않음
// 조각 묶음(합 36 — M2_US_IDS와 같은지 아래 확인)
const US2_COLONIES = ['US-ME', 'US-NH', 'US-VT', 'US-MA', 'US-RI', 'US-CT', 'US-NY', 'US-NJ', 'US-PA', 'US-DE', 'US-MD', 'US-VA', 'US-WV', 'US-NC', 'US-SC', 'US-GA', 'US-DC', 'US-KY', 'US-TN'];
const US2_OHIO = ['US-OH', 'US-IN', 'US-IL', 'US-MI', 'US-WI'];
const US2_PLAINS = ['US-IA', 'US-NE'];
const US2_OREGON = ['US-WA', 'US-OR', 'US-ID'];
const US2_SPLIT = ['US-MN', 'US-ND', 'US-SD', 'US-KS', 'US-OK', 'US-MT', 'US-WY'];
{
  const all = [...US2_COLONIES, ...US2_OHIO, ...US2_PLAINS, ...US2_OREGON, ...US2_SPLIT];
  if (all.length !== 36 || new Set(all).size !== 36 || all.length !== M2_US_IDS.length || !all.every((id) => M2_US_IDS.includes(id))) throw new Error('americas independence: US-M2 조각 묶음이 M2_US_IDS(36)와 다름');
}
// 주인 줄(그해 말). 루이지애나(1762 퐁텐블로 조약 땅 — 서쪽 끝은 1819선·대륙 분수령)는 1776~1802 스페인령, 1803 미국(M-M2-2). 오하이오 땅은 1774 퀘벡법 땅(Q2·M-M2-1)
const US2_LOUISIANA = [[M2_START, 'spanish-louisiana'], [1803, 'usa']];
const US2_QUEBEC = [[M2_START, 'province-of-quebec'], [1783, 'usa']];
const US2_SPANISH_PLAINS = [[M2_START, null], [1819, 'new-spain-viceroyalty'], [1821, 'mexico'], [1836, null], [1848, 'usa']]; // 1836~1847 텍사스 공화국 청구 땅(C-M2-7)
const US2_GREEN_RIVER = [[M2_START, null], [1819, 'new-spain-viceroyalty'], [1821, 'mexico'], [1848, 'usa']];
const US2_OREGON_LINE = [[M2_START, null], [1846, 'usa']]; // 오리건 컨트리 1818~1845 영미 공동 점유(결정 7)
own(US2_COLONIES, [[M2_START, 'usa']]); // 13개 주(G2-2) + 켄터키·테네시(버지니아·노스캐롤라이나 군)
own(US2_OHIO, US2_QUEBEC);
own(US2_PLAINS, US2_LOUISIANA);
own(US2_OREGON, US2_OREGON_LINE);
ownSplit('US2_MN', ['US-MN'], [['레드강', US2_K4_RED], ['레이니강', US2_K4_RAINY], ['동쪽', US2_K1]], '서쪽', {
  레드강: [[M2_START, 'ruperts-land'], [1819, 'usa']], // C-M2-3 — 1818 영미 협약(1819 비준)으로 북위 49°
  레이니강: [[M2_START, 'ruperts-land'], [1783, 'usa']], // 1783 파리 조약 2조 국경(레이니호·레이니강·우즈호)
  동쪽: US2_QUEBEC,
  서쪽: US2_LOUISIANA,
});
for (const id of ['US-ND', 'US-SD']) {
  ownSplit(`US2_${id.slice(3)}`, [id], [['레드강', US2_K4_RED]], '미주리강', { 레드강: [[M2_START, 'ruperts-land'], [1819, 'usa']], 미주리강: US2_LOUISIANA });
}
for (const id of ['US-KS', 'US-OK']) {
  ownSplit(`US2_${id.slice(3)}`, [id], [['서남', US2_K5]], '루이지애나', { 서남: US2_SPANISH_PLAINS, 루이지애나: US2_LOUISIANA });
}
ownSplit('US2_WY', ['US-WY'], [['서남', US2_K6], ['서쪽', US2_K3]], '동쪽', { 서남: US2_GREEN_RIVER, 서쪽: US2_OREGON_LINE, 동쪽: US2_LOUISIANA });
ownSplit('US2_MT', ['US-MT'], [['서쪽', US2_K3]], '동쪽', { 서쪽: US2_OREGON_LINE, 동쪽: US2_LOUISIANA });
const US2_voids = () => [
  B(M2_START, 1819, 'US2_KS/서남', 'US2_OK/서남', 'US2_WY/서남'), // 1819 애덤스-오니스 조약 앞 누에바에스파냐 북부 내륙 — 문서 없는 청구(Q1 A)
  B(1836, 1848, 'US2_KS/서남', 'US2_OK/서남'), // 텍사스 공화국이 청구했으나 다스리지 못한 땅 — 멕시코와 맞선 띠(C-M2-7)
  [M2_START, 1846, U(F(...US2_OREGON), build(['US2_MT/서쪽', 'US2_WY/서쪽']))], // 오리건 컨트리 — 1818년까지 주인 없는 청구, 1818~1845 영미 공동 점유(결정 7)
];
// ── M2 US-M2 끝 ──

// ── M2 BNA-E-M2 캐나다 동쪽 (최상위 이름 BNE2_) ──
// 조각 M2_BNE_IDS(CA-ON·CA-QC·CA-NB·CA-NS·CA-PE·CA-NL = 6), 구현 BNA-E-M2(2라운드)
// 항목(새 6): province-of-quebec [1776, 1791)·nova-scotia [1776, 1867)·new-brunswick [1784, 1867)·upper-canada·lower-canada [1791, 1841)·province-of-canada [1841, 1867). 앞 잇기 newfoundland
// 칸을 넘는 주인: canada 줄(CA-ON·QC·NS·NB 1867·CA-PE 1871 — 블록 BNA-W-M2)·ruperts-land 줄(CA-ON·CA-QC 허드슨만 물길 1776~1869 — BNA-W-M2의 BNW2_CUT_HBS 별칭 import). 새 칼선 0
// 래브라도 본토 1776~1790 province-of-quebec·1791~1808 lower-canada·1809~ newfoundland(창구 ③ Q-R2 — 칼선 BNE2_CUT_BELLEISLE), PEI CA-PE 1873 앞 비움(C-M2-15)
const BNE2_BOUNDS = [1809]; // 1809 뉴펀들랜드법 — 래브라도 나눈 조각(BNE2_NL) 끝, 뒤는 CA-NL 조각 통째(1899 = M1 1900). 나눈 조각 묶음 둘(K9)은 시대 내내 같은 모양
import { BNW2_CUT_HBS as BNE2_K9, BNE2_CUT_BELLEISLE as BNE2_KBI } from './cuts-m2.mjs'; // K9 허드슨만 물길 고리(안 = 북쪽 물길) — BNA-W-M2가 그은 선을 받음(특별 지시 4) · 벨아일 해협(안 = 래브라도 본토)
// 허드슨만 물길(1670 헌장 땅): 1869-11-19 헌장 반납, 1870-07-15 캐나다 이양. 웅가바만 물길(조지강·코크속강 — 허드슨 해협으로 흐름)도 K9 안
const BNE2_HB = [[M2_START, 'ruperts-land'], [1870, 'canada']];
// 온타리오 남쪽(오대호·오타와강 물길): 1774 퀘벡법 땅 → 1791-12-26 헌법법 어퍼캐나다 → 1841-02-10 연합법 캐나다주 → 1867-07-01 연방
const BNE2_ON = ownSplit('BNE2_ON', ['CA-ON'], [['물길', BNE2_K9]], '남', {
  물길: BNE2_HB,
  남: [[M2_START, 'province-of-quebec'], [1791, 'upper-canada'], [1841, 'province-of-canada'], [1867, 'canada']],
});
// 퀘벡 남쪽(세인트로렌스강 물길·가스페·북쪽 기슭): 같은 해에 로어캐나다
const BNE2_QC = ownSplit('BNE2_QC', ['CA-QC'], [['물길', BNE2_K9]], '남', {
  물길: BNE2_HB,
  남: [[M2_START, 'province-of-quebec'], [1791, 'lower-canada'], [1841, 'province-of-canada'], [1867, 'canada']],
});
own(['CA-NS'], [[M2_START, 'nova-scotia'], [1867, 'canada']]); // 케이프브레턴 1784~1820 별도 식민지는 1만 km² 미만 근사(결과 노트 7절)
own(['CA-NB'], [[M2_START, 'nova-scotia'], [1784, 'new-brunswick'], [1867, 'canada']]); // 1784-06-18 노바스코샤에서 갈라짐
own(['CA-PE'], [[M2_START, null], [1871, 'canada']]); // 1769~1873 별도 영국 식민지(1만 km² 미만 — 칠하지 않음), 1873-07-01 가입을 1871 캐나다 버전부터(C-M2-15)
// 래브라도 본토(창구 ③ Q-R2): 1774 퀘벡법이 1763년 뉴펀들랜드에 붙인 래브라도 해안을 퀘벡 주에 넣음 → 1791-12-26 헌법법 로어캐나다 → 1809 뉴펀들랜드법으로 되돌림.
//   모양은 1809~1899·M1 1900~1926과 같은 본토 통째(1927 추밀원 판결 해석 — 내륙은 명목). 섬은 내내 뉴펀들랜드
ownSplit('BNE2_NL', ['CA-NL'], [['본토', BNE2_KBI]], '섬', {
  본토: [[M2_START, 'province-of-quebec'], [1791, 'lower-canada']],
  섬: [[M2_START, 'newfoundland']],
}, { from: M2_START, to: 1809 });
own(['CA-NL'], [[1809, 'newfoundland']]); // 1809부터 조각 통째. 1899 = M1 1900 CA-NL 통째
{ // 칸 안 확인: 칸 몫 조각 6을 한 번씩 다 씀(나눈 조각 2 + 통째 4)
  const used = ['CA-ON', 'CA-QC', 'CA-NS', 'CA-NB', 'CA-PE', 'CA-NL'];
  if (used.length !== M2_BNE_IDS.length || new Set(used).size !== used.length || used.some((id) => !M2_BNE_IDS.includes(id)) || used.some((id) => !idsOf('CAN').includes(id))) throw new Error(`americas independence: BNA-E-M2 칸 조각 ${used.length}개가 M2_BNE_IDS ${M2_BNE_IDS.length}개와 다름`);
}
const BNE2_voids = () => [
  V(M2_START, 1871, 'CA-PE'), // 프린스에드워드섬 — 1769~1873 별도 영국 식민지지만 1만 km² 미만이라 칠하지 않음(C-M2-15)
];
// ── M2 BNA-E-M2 끝 ──

// ── M2 SC-W-M2 칠레·마푸체·포클랜드 (최상위 이름 SCW2_) ──
// 조각 M2_SCW_IDS(칠레 16·FLK-5152·SGS·HOLE-2 = 19), 구현 SC-W-M2(2라운드)
// 항목(새 3): chile-captaincy-general [1789, 1818)·mapuche-araucania [1776, 1883)·spanish-falkland-islands [1776, 1811). 앞 잇기 chile·falkland-islands. 칼선 자리: SCW2_CUT_24S·SCW2_CUT_BIOBIO·SCW2_CUT_MALLECO(+ SC-E-M2 SCE2_CUT_PUNA_CL 별칭)
// 칸을 넘는 주인: peru-viceroyalty(칠레 1776~1788·CL-AN 북 1810~1824·CL-TA·CL-AP ~1820)·rio-de-la-plata-viceroyalty(CL-AN 24°S 북쪽 1776~1809)·bolivia(CL-AN 북 1825~1878)·peru(CL-TA·CL-AP 1821~1882)
import { SCW2_CUT_24S as SCW2_24S, SCW2_CUT_BIOBIO as SCW2_BIOBIO, SCW2_CUT_MALLECO as SCW2_MALLECO, SCE2_CUT_PUNA_CL as SCW2_PUNA } from './cuts-m2.mjs';
const SCW2_BOUNDS = [1870, 1883, 1899]; // 1870 말레코선(비오비오 나눈 조각 끝·말레코 나눈 조각 시작) · 1883 아라우카니아 끝(말레코 나눈 조각 끝) · 1899 푸나 판정(아타카마 나눈 조각 끝 — 뒤는 조각 통째)
// 조각 묶음(합 19 — 아래 확인 줄)
const SCW2_CORE = ['CL-RM', 'CL-VS', 'CL-CO', 'CL-LI', 'CL-ML', 'CL-NB', 'CL-LR', 'CL-LL']; // 중부 정착·발디비아·로스라고스(칠로에섬 1826까지 스페인은 근사 — 결과 노트 7절)
const SCW2_ATACAMA = ['CL-AN', 'CL-AT']; // 안토파가스타·아타카마 — 남위 24° 칼선과 푸나 칠레 몫(SC-E-M2 선)이 지나감
const SCW2_BI = ['CL-BI']; // 비오비오 — 강 남쪽은 마푸체 땅(K-c4)
const SCW2_AR = ['CL-AR']; // 아라우카니아 — 말레코선(K-c5)
const SCW2_NORTH = ['CL-TA', 'CL-AP']; // 타라파카·아리카 이 파리나코타(G2-19)
const SCW2_MA = ['CL-MA']; // 마가야네스(G2-21)
const SCW2_AI = ['CL-AI']; // 아이센(1881 조약)
const SCW2_FLK = ['FLK-5152']; // 포클랜드 제도
const SCW2_EMPTY = ['SGS', 'HOLE-2']; // 사우스조지아(1만 km² 미만 속령)·남부 파타고니아 빙원 미획정 구간(M1과 같음)
const SCW2_ALL = [...SCW2_CORE, ...SCW2_ATACAMA, ...SCW2_BI, ...SCW2_AR, ...SCW2_NORTH, ...SCW2_MA, ...SCW2_AI, ...SCW2_FLK, ...SCW2_EMPTY];
if (SCW2_ALL.length !== M2_SCW_IDS.length || new Set(SCW2_ALL).size !== SCW2_ALL.length || SCW2_ALL.some((id) => !M2_SCW_IDS.includes(id)) || idsOf('CHL').some((id) => !SCW2_ALL.includes(id))) throw new Error(`americas independence SC-W-M2: 칸 조각 ${SCW2_ALL.length}개(M2_SCW_IDS ${M2_SCW_IDS.length}개와 같아야 함)`);
// 칠레 정착 땅: 1776~1788 페루 부왕령 → 1789 칠레 총사령부(G2-17) → 1818-02-12 독립 선언(후니타 1810~1817은 식민 색 — c 노트 P2)
const SCW2_LINE_CL = [[M2_START, 'peru-viceroyalty'], [1789, 'chile-captaincy-general'], [1818, 'chile']];
own(SCW2_CORE, SCW2_LINE_CL);
const SCW2_AT = ownSplit('SCW2_ATACAMA', SCW2_ATACAMA, [['푸나', SCW2_PUNA], ['북', SCW2_24S]], '남', {
  푸나: [[M2_START, 'rio-de-la-plata-viceroyalty'], [1810, 'peru-viceroyalty'], [1825, 'bolivia'], [1879, null]], // 푸나 칠레 몫 — 1879 칠레 점령부터 1899 판정 앞까지 세 나라 다툼(결정 7)
  북: [[M2_START, 'rio-de-la-plata-viceroyalty'], [1810, 'peru-viceroyalty'], [1825, 'bolivia'], [1879, 'chile']], // 볼리비아 해안(G2-18 — 1879-02-14 안토파가스타 점령, 실효)
  남: SCW2_LINE_CL,
}, { from: M2_START, to: 1899 });
own(SCW2_ATACAMA, [[1899, 'chile']]); // 1899 부캐넌 판정 뒤 조각 통째(= M1 1900)
ownSplit('SCW2_BIOBIO', SCW2_BI, [['남', SCW2_BIOBIO]], '북', {
  남: [[M2_START, 'mapuche-araucania']], // 비오비오강 남쪽 마푸체 땅(기본값 18)
  북: SCW2_LINE_CL,
}, { from: M2_START, to: 1870 });
own(SCW2_BI, [[1870, 'chile']]); // 1869 말레코선까지 나아간 뒤 조각 통째(G2-12)
own(SCW2_AR, [[M2_START, 'mapuche-araucania']]);
ownSplit('SCW2_MALLECO', SCW2_AR, [['남', SCW2_MALLECO]], '북', {
  남: [[1870, 'mapuche-araucania']], // 말레코강 남쪽 — 1883-01-01 비야리카 재건까지
  북: [[1870, 'chile']], // 말레코강 북쪽(앙골·콜리풀리) — 1869 말레코선(G2-12)
}, { from: 1870, to: 1883 });
own(SCW2_AR, [[1883, 'chile']]); // 1883 아라우카니아 점령 끝
own(SCW2_NORTH, [[M2_START, 'peru-viceroyalty'], [1821, 'peru'], [1883, 'chile']]); // 1821 페루 독립 · 1883-10-20 안콘 조약(G2-19)
own(SCW2_MA, [[M2_START, null], [1843, 'chile']]); // 1843-09-21 안쿠드호가 산타아나곶에 닿아 불네스 요새를 세움(G2-21 — en Fuerte_Bulnes)
own(SCW2_AI, [[M2_START, null], [1881, 'chile']]); // 1881-07-23 칠레–아르헨티나 경계 조약(남위 52°까지 안데스 분수령 — en Boundary_treaty_of_1881)
own(SCW2_FLK, [[M2_START, 'spanish-falkland-islands'], [1811, null], [1833, 'falkland-islands']]); // 1811 스페인 철수 · 1833-01-03 영국 재점령
own(SCW2_EMPTY, [[M2_START, null]]);
const SCW2_voids = () => [
  V(M2_START, 1843, ...SCW2_MA), // 마가야네스 — 1843 불네스 요새 앞 원주민 땅(Q1 A — 문서 없는 청구 비움)
  V(M2_START, 1881, ...SCW2_AI), // 아이센 — 1881 조약 앞 원주민 땅(Q1 A)
  B(1879, 1899, SCW2_AT.푸나), // 푸나 칠레 몫 — 1879 칠레 점령부터 1899 판정 앞까지 세 나라 다툼(결정 7)
  V(1811, 1833, ...SCW2_FLK), // 포클랜드 — 스페인 철수 뒤 영국 재점령 앞(주인이 굳지 않음)
  V(M2_START, M2_END, ...SCW2_EMPTY), // 사우스조지아(1만 km² 미만 속령)·남부 파타고니아 빙원 미획정 구간(M1 1900~와 같음)
];
// ── M2 SC-W-M2 끝 ──

// ── M2 MX-M2 멕시코·텍사스·미국 서남 (최상위 이름 MX2_) ──
// 조각 M2_MX_IDS(멕시코 32 + US-TX·US-NM·US-AZ·US-CA·US-NV·US-UT·US-CO = 39), 구현 MX-M2(3라운드)
// 항목(새 3): new-spain-viceroyalty·yucatan-captaincy [1776, 1821)·texas-republic [1836, 1845). 앞 잇기 mexico. 칼선 자리: MX2_CUT_99W·MX2_CUT_NUECES·MX2_CUT_CORE_AZ·MX2_CUT_CORE_2(+ US-M2 US2_CUT_1819_ARK·US2_CUT_1819_42N·US2_CUT_1848 별칭)
// 칸을 넘는 주인: usa 줄(US-TX 1845·1848, 서남 1848·1853, US-CO 1803)·spanish-louisiana(US-CO 1819선 북·동 1776~1802)·guatemala-captaincy(MX-CHP 1776~1821 — 블록 CAM-M2). 북부 내륙 1776~1818 비움(Q1 A·C-M2-8)
import { US2_CUT_1819_ARK as MX2_K5, US2_CUT_1819_42N as MX2_K6, US2_CUT_1848 as MX2_K7, MX2_CUT_99W as MX2_W99, MX2_CUT_NUECES as MX2_NUECES, MX2_CUT_ELPASO as MX2_ELPASO } from './cuts-m2.mjs';
const MX2_BOUNDS = []; // 조각 통째·나눈 부분의 주인 줄만 해마다 바뀜(나눈 묶음은 시대 내내 같은 모양) — 표 경계를 늘리지 않음
// 조각 묶음(합 39 — M2_MX_IDS와 같은지 아래 확인)
const MX2_YUCATAN = ['MX-YUC', 'MX-CAM', 'MX-ROO']; // 유카탄 총사령부(1617~1821 — 위키 en Captaincy General of Yucatan)
const MX2_CORE_MX = idsOf('MEX').filter((id) => !MX2_YUCATAN.includes(id) && id !== 'MX-CHP'); // 지금 멕시코 28(치아파스·유카탄반도 뺌)
const MX2_INLAND = ['US-NV', 'US-UT']; // 그레이트베이슨 — 누에바에스파냐 북부 내륙 통째(C-M2-8)
const MX2_SPLIT = ['US-TX', 'US-NM', 'US-AZ', 'US-CO'];
{
  const all = [...MX2_CORE_MX, ...MX2_YUCATAN, 'MX-CHP', 'US-CA', ...MX2_INLAND, ...MX2_SPLIT];
  if (all.length !== 39 || new Set(all).size !== 39 || all.length !== M2_MX_IDS.length || !all.every((id) => M2_MX_IDS.includes(id))) throw new Error('americas independence: MX-M2 조각 묶음이 M2_MX_IDS(39)와 다름');
}
// 주인 줄(그해 말). 코어 = 멕시코 본토·텍사스·뉴멕시코·애리조나 남부(피메리아알타)·캘리포니아(C-M2-8), 내륙 = 1819 애덤스-오니스 조약 앞 문서 없는 청구(Q1 A)
const MX2_CORE = [[M2_START, 'new-spain-viceroyalty'], [1821, 'mexico'], [1848, 'usa']]; // 1821-09-28 독립 · 1848-02-02 과달루페이달고 조약
const MX2_GADSDEN = [[M2_START, 'new-spain-viceroyalty'], [1821, 'mexico'], [1853, 'usa']]; // 1848선 남쪽 — 1853-12-30 개즈던 매입
const MX2_INLAND_LINE = [[M2_START, null], [1819, 'new-spain-viceroyalty'], [1821, 'mexico'], [1848, 'usa']];
const MX2_TX_CLAIM = [[M2_START, null], [1819, 'new-spain-viceroyalty'], [1821, 'mexico'], [1836, null], [1848, 'usa']]; // 1836~1847 텍사스 공화국 청구 땅(C-M2-7)
const MX2_TX_STRIP = [[M2_START, 'new-spain-viceroyalty'], [1821, 'mexico'], [1836, null], [1848, 'usa']]; // 뉴에이서스강 띠·서경 99° 서쪽(G2-27·결정 7)
own(MX2_CORE_MX, [[M2_START, 'new-spain-viceroyalty'], [1821, 'mexico']]);
own(MX2_YUCATAN, [[M2_START, 'yucatan-captaincy'], [1821, 'mexico']]); // 1821-11-02 멕시코 제국에 듦
own(['MX-CHP'], [[M2_START, 'guatemala-captaincy'], [1822, 'mexico'], [1823, null], [1824, 'mexico']]); // 1822 이투르비데 칙령으로 멕시코 · 1823 다시 독립 선언 · 1824 멕시코의 주(위키 en Chiapas)
own(['US-CA'], MX2_CORE);
own(MX2_INLAND, MX2_INLAND_LINE);
ownSplit('MX2_TX', ['US-TX'], [['서쪽', MX2_W99], ['띠', MX2_NUECES]], '정착', {
  서쪽: MX2_TX_STRIP,
  띠: MX2_TX_STRIP,
  정착: [[M2_START, 'new-spain-viceroyalty'], [1821, 'mexico'], [1836, 'texas-republic'], [1845, 'usa']], // 1836-03-02 독립 선언 · 1845-12-29 미국 병합
});
ownSplit('MX2_NM', ['US-NM'], [['남쪽', MX2_K7], ['엘패소', MX2_ELPASO]], '북쪽', { 남쪽: MX2_GADSDEN, 엘패소: MX2_GADSDEN, 북쪽: MX2_CORE });
ownSplit('MX2_AZ', ['US-AZ'], [['남쪽', MX2_K7]], '북쪽', { 남쪽: MX2_GADSDEN, 북쪽: MX2_INLAND_LINE }); // 힐라강 = 피메리아알타 북쪽 끝(코어/내륙 갈림 겸 1848선)
ownSplit('MX2_CO', ['US-CO'], [['텍사스청구', MX2_K5], ['서쪽', MX2_K6]], '루이지애나', {
  텍사스청구: MX2_TX_CLAIM, // 아칸소강 남쪽·발원지 경선 동쪽
  서쪽: MX2_INLAND_LINE, // 발원지 경선 서쪽(1819선 남·서쪽)
  루이지애나: [[M2_START, 'spanish-louisiana'], [1803, 'usa']], // 1819선 북·동쪽 — 1762 조약 땅(M-M2-2)
});
const MX2_voids = () => [
  [M2_START, 1819, U(F(...MX2_INLAND), build(['MX2_AZ/북쪽', 'MX2_CO/서쪽', 'MX2_CO/텍사스청구']))], // 1819 애덤스-오니스 조약 앞 누에바에스파냐 북부 내륙 — 문서 없는 청구(Q1 A)
  B(1836, 1848, 'MX2_TX/서쪽', 'MX2_TX/띠', 'MX2_CO/텍사스청구'), // 텍사스 공화국이 청구했으나 다스리지 못한 땅·뉴에이서스강 남쪽 분쟁 띠 — 멕시코와 맞선 땅(결정 7·C-M2-7)
  V(1823, 1824, 'MX-CHP'), // 1823 치아파스가 멕시코·중앙아메리카 연방 어디에도 들지 않고 따로 독립을 선언한 한 해
];
// ── M2 MX-M2 끝 ──

// ── M2 AND-N-M2 그란콜롬비아·안데스 (최상위 이름 ANN2_) ──
// 조각 M2_ANN_IDS(콜롬비아 32·베네수엘라 25·에콰도르 24·파나마 12·페루 26·볼리비아 9·BR-AC = 129), 구현 AND-N-M2(3라운드)
// 항목(새 4): gran-colombia [1819, 1831)·new-granada-viceroyalty [1776, 1819)·venezuela-captaincy-general [1777, 1819)·peru-viceroyalty [1776, 1825). 앞 잇기 colombia·venezuela·ecuador·peru·bolivia
// 칼선 자리: ANN2_CUT_MARANON(K-c6 — 마이나스 Q3). M1 칼선 SAN_CUT_PUTUMAYO·SAN_CUT_1942_EC·SAN_CUT_1942_PE·SC_CUT_1909 별칭 import로(C-M2-10 — 1899 = 1900 모양)
// 칸을 넘는 주인: rio-de-la-plata-viceroyalty 줄(BO-*·BR-AC 1776~1809 — 블록 SC-E-M2)·chile 줄(PE-TAC 1883 — 블록 SC-W-M2)
import { ANN2_CUT_MARANON as ANN2_MARANON } from './cuts-m2.mjs';
import { SAN_CUT_PUTUMAYO as ANN2_PUTUMAYO, SAN_CUT_1942_EC as ANN2_X42A, SAN_CUT_1942_PE as ANN2_X42B, SC_CUT_1909 as ANN2_K1909 } from './cuts-m1.mjs';
const ANN2_BOUNDS = [1830]; // 1830부터 푸투마요–카케타 띠와 1942 교환 땅 A를 나눔(그란콜롬비아가 갈라지며 M1 1900 모양을 뒤로 늘임 — C-M2-10). 그 앞은 조각 통째
// 조각 묶음(합 129 — 아래 확인 줄)
const ANN2_VE = idsOf('VEN'); // 베네수엘라 25
const ANN2_CO_FT = ['CO-AMA', 'CO-PUT']; // 푸투마요–카케타 띠를 품는 콜롬비아 조각(아마소나스·푸투마요)
const ANN2_CO = [...idsOf('COL').filter((id) => !ANN2_CO_FT.includes(id)), ...idsOf('PAN')]; // 콜롬비아 30 + 파나마 12(파나마는 1903까지 같은 주인 — M1 G19)
const ANN2_EC_A = ['EC-U', 'EC-D']; // 1942 교환 땅 A(페루가 1936 현상 유지선까지 가진 아과리코 아래쪽 띠)를 품는 에콰도르 조각
// 나포 — 키호스(1802 칙령이 페루 부왕령에 넘긴 '파팔락타를 뺀 키호스 마을' — 창구 ③ Q-R3, 나포강 유역 세 조각 가운데 교환 땅 A를 품지 않는 하나).
//   조각 자료의 이름표가 뒤바뀜: id EC-T(name Tungurahua)의 도형이 지금 나포주(테나·아르치도나·바에사·파팔락타)이고, id EC-N(name Napo)의 도형은 퉁구라우아주(암바토·바뇨스 — 안데스 고원).
//   결정 문장의 'EC-N(나포강 유역)'은 뜻대로 나포주 도형 EC-T로 칠함(조각 파일은 고치지 않음 — 반영 fix1.md)
const ANN2_EC_Q = ['EC-T'];
const ANN2_EC_GAL = ['EC-W']; // 갈라파고스 제도 — 1832-02-12 에콰도르 병합 앞은 어느 나라도 다스리지 않음(1만 km² 미만)
const ANN2_EC = idsOf('ECU').filter((id) => !ANN2_EC_A.includes(id) && !ANN2_EC_GAL.includes(id) && !ANN2_EC_Q.includes(id)); // 에콰도르 20(오리엔테 포함 — M1 Q1 (B))
const ANN2_PE_LOR = ['PE-LOR']; // 로레토 — 마라뇬강 북쪽 마이나스(Q3)와 1942 교환 땅 B를 품음
const ANN2_PE_1909 = ['PE-MDD', 'PE-UCA', 'PE-CUS', 'PE-PUN']; // 1909 앞 볼리비아 청구 띠(마드레데디오스·푸루스)를 품는 페루 조각
const ANN2_PE_TAC = ['PE-TAC']; // 타크나 — 1883 안콘 조약 뒤 칠레가 다스림(M1 1900~1928 chile와 이음)
const ANN2_PE = idsOf('PER').filter((id) => ![...ANN2_PE_LOR, ...ANN2_PE_1909, ...ANN2_PE_TAC].includes(id)); // 페루 나머지 20
const ANN2_BO = [...idsOf('BOL'), 'BR-AC']; // 볼리비아 9 + 아크리(1903까지 볼리비아 — M1 G3·G2-22)
const ANN2_ALL = [...ANN2_VE, ...ANN2_CO_FT, ...ANN2_CO, ...ANN2_EC_A, ...ANN2_EC_Q, ...ANN2_EC_GAL, ...ANN2_EC, ...ANN2_PE_LOR, ...ANN2_PE_1909, ...ANN2_PE_TAC, ...ANN2_PE, ...ANN2_BO];
if (ANN2_ALL.length !== M2_ANN_IDS.length || new Set(ANN2_ALL).size !== ANN2_ALL.length || ANN2_ALL.some((id) => !M2_ANN_IDS.includes(id))) throw new Error(`americas independence AND-N-M2: 칸 조각 ${ANN2_ALL.length}개(M2_ANN_IDS ${M2_ANN_IDS.length}개와 같아야 함)`);
// 베네수엘라: 1777-09-08 총사령부 설치 → 1819-12-17 앙고스투라 회의 그란콜롬비아 → 1830 분리(G2-16 — 카라보보 1821·최종 항복 1823은 3년 안)
own(ANN2_VE, [[M2_START, 'new-granada-viceroyalty'], [1777, 'venezuela-captaincy-general'], [1819, 'gran-colombia'], [1830, 'venezuela']]);
// 콜롬비아·파나마: 1819 보야카 → 그란콜롬비아, 1831-11-19 해체 뒤 누에바그라나다 공화국(파나마는 1821-11-28 합류 — 2년 어긋남, 5만 넘는 땅 3년 안)
own(ANN2_CO, [[M2_START, 'new-granada-viceroyalty'], [1819, 'gran-colombia'], [1831, 'colombia']]);
own(ANN2_CO_FT, [[M2_START, 'new-granada-viceroyalty'], [1819, 'gran-colombia']]); // 1829까지 조각 통째
const ANN2_FT = ownSplit('ANN2_CO_FT', ANN2_CO_FT, [['띠', ANN2_PUTUMAYO]], '나머지', {
  띠: [[1830, null]], // 푸투마요강–카케타강 사이 — 그란콜롬비아가 갈라진 뒤 행정이 문서로 분명하지 않은 띠(M1 1900~1929 비움과 같음)
  나머지: [[1830, 'gran-colombia'], [1831, 'colombia']],
}, { from: 1830, to: M2_END });
// 에콰도르: 1822 피친차까지 스페인(3년 안 — G2-16), 1830-05-13 그란콜롬비아에서 분리
own(ANN2_EC, [[M2_START, 'new-granada-viceroyalty'], [1819, 'gran-colombia'], [1830, 'ecuador']]);
// 키호스(창구 ③ Q-R3): 나포강 유역 세 조각(EC-U·EC-T(나포주 도형 — 위 줄)·EC-D) 1802-07-15 칙령으로 페루 부왕령, 1819 그란콜롬비아(1822 피친차 — 3년 안). 칙령의 '강가' 몫(모로나·파스타사·사모라 등)은 장부 칙령 판본 갈림 줄
own(ANN2_EC_Q, [[M2_START, 'new-granada-viceroyalty'], [1802, 'peru-viceroyalty'], [1819, 'gran-colombia'], [1830, 'ecuador']]);
own(ANN2_EC_A, [[M2_START, 'new-granada-viceroyalty'], [1802, 'peru-viceroyalty'], [1819, 'gran-colombia']]); // 1829까지 조각 통째(키호스 — 위 줄과 같은 해)
ownSplit('ANN2_EC_A', ANN2_EC_A, [['교환', ANN2_X42A]], '나머지', {
  교환: [[1830, 'peru']], // 아과리코강 아래쪽 북동 띠 — M1 1900~1941 peru와 같게(C-M2-10)
  나머지: [[1830, 'ecuador']],
}, { from: 1830, to: M2_END });
own(ANN2_EC_GAL, [[M2_START, null], [1832, 'ecuador']]); // 1832-02-12 병합
// 페루 로레토: 마라뇬강 북쪽 마이나스 1776~1801 누에바그라나다(키토 관할), 1802-07-15 칙령 페루 부왕령(Q3), 1821 페루. 교환 땅 B는 1830부터 ecuador(M1 1900~1941과 같게)
ownSplit('ANN2_PE_LOR', ANN2_PE_LOR, [['교환', ANN2_X42B], ['마이나스', ANN2_MARANON]], '남쪽', {
  교환: [[M2_START, 'new-granada-viceroyalty'], [1802, 'peru-viceroyalty'], [1821, 'peru'], [1830, 'ecuador']], // 파스타사강·티그레강·쿠라라이강 위쪽 띠
  마이나스: [[M2_START, 'new-granada-viceroyalty'], [1802, 'peru-viceroyalty'], [1821, 'peru']],
  남쪽: [[M2_START, 'peru-viceroyalty'], [1821, 'peru']], // 마라뇬강·아마존강 남쪽(우알라가·우카얄리 하류 — 리마 관할)
});
// 페루 남동: 1909 앞 볼리비아 청구 띠는 내내 비움(M1 1900~1908과 같음)
const ANN2_P09 = ownSplit('ANN2_PE_1909', ANN2_PE_1909, [['띠', ANN2_K1909]], '나머지', {
  띠: [[M2_START, null]],
  나머지: [[M2_START, 'peru-viceroyalty'], [1821, 'peru']],
});
own(ANN2_PE_TAC, [[M2_START, 'peru-viceroyalty'], [1821, 'peru'], [1883, 'chile']]); // 1883-10-20 안콘 조약 — 타크나·아리카는 칠레가 다스림(M1 1900 chile와 이음)
own(ANN2_PE, [[M2_START, 'peru-viceroyalty'], [1821, 'peru']]); // 1821-07-28 리마 독립 선언(G2-16 — 아야쿠초 1824와 3년)
// 볼리비아(알토페루)·아크리: 1776 리오데라플라타 부왕령, 1810 페루 부왕령에 다시 붙음, 1825-08-06 독립(G2-22)
own(ANN2_BO, [[M2_START, 'rio-de-la-plata-viceroyalty'], [1810, 'peru-viceroyalty'], [1825, 'bolivia']]);
const ANN2_voids = () => [
  B(M2_START, M2_END, ANN2_P09.띠), // 1909 폴로–산체스 부스타만테 조약 앞 볼리비아 청구 땅(마드레데디오스·푸루스) — 행정 문서가 분명하지 않은 띠(M1 1900~1908과 같음)
  B(1830, M2_END, ANN2_FT.띠), // 푸투마요강–카케타강 사이 — 콜롬비아·페루·에콰도르가 다툰 띠(M1 1900~1929와 같음)
  V(M2_START, 1832, ...ANN2_EC_GAL), // 갈라파고스 제도 — 1832 에콰도르 병합 앞 주인 없는 섬(1만 km² 미만)
];
// ── M2 AND-N-M2 끝 ──

// ── M2 CAM-M2 중앙아메리카 (최상위 이름 CAM2_) ──
// 조각 M2_CAM_IDS(과테말라 22·벨리즈 6·온두라스 18·엘살바도르 14·니카라과 17·코스타리카 7 = 84), 구현 CAM-M2(3라운드)
// 항목(새 3): guatemala-captaincy [1776, 1822)·central-american-federation [1823, 1839)·mosquito-kingdom [1776, 1894). 앞 잇기 guatemala·belize(from 1798)·honduras·el-salvador·nicaragua·costa-rica
// 칼선: CAM2_CUT_RESERVE(1860 마나과 조약 모스키토 보호구 — 반영 F2, 1911 브리태니커·1890 니카라과 행정 명령). 칸을 넘는 주인: mexico 줄(1822 다섯 주 — 블록 MX-M2). 1899 = M1 1900(HN-GD honduras — G15)
const CAM2_BOUNDS = [1860, 1894]; // 1860~1893만 NI-AN·NI-AS를 보호구 안/밖으로 나눔(나눈 조각 CAM2_NI_MOS), 그 앞뒤는 조각 통째(1899 = M1 1900)
import { CAM2_CUT_RESERVE as CAM2_KRES } from './cuts-m2.mjs';
// 조각 묶음(합 84 — 아래 확인 줄)
const CAM2_GT = idsOf('GTM'); // 과테말라 22
const CAM2_BZ = idsOf('BLZ'); // 벨리즈 6
const CAM2_HN_GD = ['HN-GD']; // 그라시아스아디오스(모스키티아 북쪽)
const CAM2_HN = idsOf('HND').filter((id) => !CAM2_HN_GD.includes(id)); // 온두라스 17
const CAM2_SV = idsOf('SLV'); // 엘살바도르 14
const CAM2_NI_MOS = ['NI-AN', 'NI-AS']; // 카리브 북·남 자치 지역(모스키토 해안)
const CAM2_NI = idsOf('NIC').filter((id) => !CAM2_NI_MOS.includes(id)); // 니카라과 15
const CAM2_CR = idsOf('CRI'); // 코스타리카 7
const CAM2_ALL = [...CAM2_GT, ...CAM2_BZ, ...CAM2_HN_GD, ...CAM2_HN, ...CAM2_SV, ...CAM2_NI_MOS, ...CAM2_NI, ...CAM2_CR];
if (CAM2_ALL.length !== M2_CAM_IDS.length || new Set(CAM2_ALL).size !== CAM2_ALL.length || CAM2_ALL.some((id) => !M2_CAM_IDS.includes(id))) throw new Error(`americas independence: CAM-M2 조각 ${CAM2_ALL.length}개(M2_CAM_IDS ${M2_CAM_IDS.length}개와 같아야 함)`);
// 다섯 주: 과테말라 총사령부 → 1821-09-15 독립 뒤 1822-01-05 멕시코 제1제국 합류 → 1823-07-01 연방 독립 → 1838~1841 해체(G2-26)
const CAM2_LINE = (last) => [[M2_START, 'guatemala-captaincy'], [1822, 'mexico'], [1823, 'central-american-federation'], ...last];
own(CAM2_GT, CAM2_LINE([[1839, 'guatemala']])); // 1839-04-17 카레라의 연방 해체 포고
own(CAM2_HN, CAM2_LINE([[1839, 'honduras']])); // 1838-10-26 이탈 선언 — M1 from 1839 그대로(1년, 결과 노트 2절)
own(CAM2_NI, CAM2_LINE([[1838, 'nicaragua']])); // 1838-04-30 이탈
own(CAM2_CR, CAM2_LINE([[1838, 'costa-rica']])); // 1838-11 이탈
own(CAM2_SV, CAM2_LINE([[1839, null], [1841, 'el-salvador']])); // 1839~1840 연방 끝 공백 · 1841-01-30 독립 공화국 선포
own(CAM2_BZ, [[M2_START, 'guatemala-captaincy'], [1798, 'belize']]); // 1798-09-10 세인트조지스키 싸움 뒤 영국 정착지가 굳음(G2-9)
own(CAM2_HN_GD, [[M2_START, 'mosquito-kingdom'], [1860, 'honduras']]); // 1859 와이크–크루스 조약 — 영국이 북쪽 해안을 온두라스에 넘김(G2-12·G15)
own(CAM2_NI_MOS, [[M2_START, 'mosquito-kingdom'], [1894, 'nicaragua']]); // 1776~1859 조각 통째 왕국 · 1894-11-20 니카라과 병합(1894부터 조각 통째)
// 1860-01-28 마나과 조약: 보호구(남쪽 라마강~북쪽 와와강 해안 지대)만 모스키토 왕국, 그 밖 카리브 해안은 니카라과 주권(반영 F2)
ownSplit('CAM2_NI_MOS', CAM2_NI_MOS, [['보호구', CAM2_KRES]], '밖', {
  보호구: [[1860, 'mosquito-kingdom']],
  밖: [[1860, 'nicaragua']],
}, { from: 1860, to: 1894 });
const CAM2_voids = () => [
  V(1839, 1841, ...CAM2_SV), // 엘살바도르 — 1839 연방 해체 뒤 1841-01-30 독립 공화국 선포 앞(b D11)
];
// ── M2 CAM-M2 끝 ──

// ── M2 CAR-M2 카리브 (최상위 이름 CAR2_) ──
// 조각 M2_CAR_IDS(쿠바 16·아이티 10·도미니카 공화국 32·자메이카 14·바하마 22·HOLE-1 + 칠하지 않는 속령 섬 44·FR-GP·FR-MQ·작은 앤틸리스 80 = 221), 구현 CAR-M2(4라운드)
// 항목(새 4): cuba-captaincy-general [1776, 1899)·santo-domingo-captaincy [1776, 1822)·saint-domingue [1776, 1804)·kingdom-of-haiti [1807, 1820). 앞 잇기 haiti·dominican-republic·jamaica·bahamas. 새 칼선 0
// 1만 km² 미만 섬은 칠하지 않음(G2-32 — 카리브 둘만 칠함). 1899 = M1 1900(CU-* 비움 1899 — 쿠바 1899-01-01 미국 군정, G2-29)
const CAR2_BOUNDS = []; // 조각 통째 — 주인만 바뀜(새 칼선 0, 아이티 남북 선은 도 경계 근사)
import { M1_NA_ISLAND_IDS as CAR2_NA_ISLAND_IDS, M1_LA_IDS as CAR2_LA_IDS } from './cuts-m1.mjs';
// 조각 묶음(합 221 — 아래 확인 줄)
const CAR2_CU = idsOf('CUB'); // 쿠바 16
const CAR2_HT_N = ['HT-ND', 'HT-NE', 'HT-NO', 'HT-AR', 'HT-CE']; // 아이티 북부(크리스토프의 북부 국가·왕국 — 도 경계 근사)
const CAR2_HT_S = ['HT-OU', 'HT-SE', 'HT-SD', 'HT-GA', 'HT-NI']; // 아이티 남부(페티옹의 공화국)
const CAR2_DO = idsOf('DOM'); // 도미니카 공화국 32
const CAR2_JM = idsOf('JAM'); // 자메이카 14
const CAR2_BS = [...idsOf('BHS'), 'HOLE-1']; // 바하마 22 + 이나과섬 둘레 HOLE-1
const CAR2_ISLANDS = [...CAR2_NA_ISLAND_IDS, 'FR-GP', 'FR-MQ', ...CAR2_LA_IDS]; // 칠하지 않는 속령 섬 44·과들루프·마르티니크·작은 앤틸리스 80
const CAR2_ALL = [...CAR2_CU, ...CAR2_HT_N, ...CAR2_HT_S, ...CAR2_DO, ...CAR2_JM, ...CAR2_BS, ...CAR2_ISLANDS];
if (CAR2_ALL.length !== M2_CAR_IDS.length || new Set(CAR2_ALL).size !== CAR2_ALL.length || CAR2_ALL.some((id) => !M2_CAR_IDS.includes(id)) || [...CAR2_HT_N, ...CAR2_HT_S].sort().join() !== idsOf('HTI').sort().join()) throw new Error(`americas independence: CAR-M2 조각 ${CAR2_ALL.length}개(M2_CAR_IDS ${M2_CAR_IDS.length}개와 같아야 함)`);
own(CAR2_CU, [[M2_START, 'cuba-captaincy-general'], [1899, null]]); // 1898-12-10 파리 조약 · 1899-01-01 미국 군정(G2-28 — M1 1900~1901 비움과 이음)
own(CAR2_HT_N, [[M2_START, 'saint-domingue'], [1804, 'haiti'], [1807, 'kingdom-of-haiti'], [1820, 'haiti']]); // 1804-01-01 독립 · 1807-02-17 북부 국가(1811-03-28 왕국) · 1820-10 크리스토프 죽음 뒤 부아예가 합침
own(CAR2_HT_S, [[M2_START, 'saint-domingue'], [1804, 'haiti']]); // 1804-01-01 독립 · 1807~1819 페티옹·부아예의 남부 공화국(haiti)
own(CAR2_DO, [[M2_START, 'santo-domingo-captaincy'], [1822, 'haiti'], [1844, 'dominican-republic']]); // 1822-02-09 아이티 입성 · 1844-02-27 독립(G2-30 — 1861~1865 스페인 재병합은 글)
own(CAR2_JM, [[M2_START, 'jamaica']]);
own(CAR2_BS, [[M2_START, 'bahamas']]); // 1782-05~1783-04 스페인 점령은 되돌려진 점령이라 글
own(CAR2_ISLANDS, [[M2_START, null]]); // 1만 km² 미만 섬(G2-32·0단계 기본값 7)
const CAR2_voids = () => [
  V(1899, M2_END, ...CAR2_CU), // 쿠바 1899 — 주권자 없음(미국 군정, G2-28 — M1 1900~1901과 같은 이유)
  V(M2_START, M2_END, ...CAR2_ISLANDS), // 1만 km² 미만 섬 — 0단계 기본값 7·G2-32(속령·작은 앤틸리스)
];
// ── M2 CAR-M2 끝 ──

// ── M2 NW-M2 알래스카·추코트카·그린란드·브리티시컬럼비아 (최상위 이름 NW2_) ──
// 조각 M2_NW_IDS(US-AK·RU-CHU·그린란드 6·CA-BC = 9) + 손 도형(M1 알류샨 동경 쪽·180° 틈 띠 별칭, 러시아령 해안 띠 NW2_RUSAM_COAST), 구현 NW-M2(4라운드)
// 항목(새 3): russian-america [1799, 1867)·vancouver-island [1849, 1866)·british-columbia [1858, 1871). 앞 잇기 greenland·유럽 russia(늘림 1778~1897 — RU-CHU own 줄 [[M2_START, null], [1778, 'russia'], [1898, null]] 꼴, 장치 시험 ①)
// 칼선: NW2_RUSAM_COAST(해안 띠)·NW2_CUT_VANCOUVER·NW2_CUT_5440N(C-M2-6)·NW2_CUT_1858N(1858 식민지 북·동 한계 — ※ 닫기에서 더함). M1 NA_CUT_GLSM·NA_CUT_75N·US_ALEUT_EAST·US_RU_GAP180·US_CUT_W180 별칭 import로(C-M2-10). 칸을 넘는 주인: usa(US-AK 1867)·canada(CA-BC 1871)·north-western-territory(CA-BC 1821·1846~1857)
// 그린란드 1776~1813 denmark-norway(G2-14·37 — 관계로만, 땅은 greenland 항목)
// 표 경계 1825·1871: 알래스카는 1825부터, 브리티시컬럼비아는 1871부터 조각 통째(나눈 부분을 합친 모양이 아니라 M1 1900과 같은 조각 통째 모양 — 1899 = 1900)
const NW2_BOUNDS = [1825, 1871]; // 유럽 러시아 손 도형은 동경 179.9° 서쪽 — 조각 RU-CHU와 겹치지 않음
import { NW2_RUSAM_COAST as NW2_COAST, NW2_CUT_VANCOUVER as NW2_VAN, NW2_CUT_5440N as NW2_S5440, NW2_CUT_1858N as NW2_C1858 } from './cuts-m2.mjs';
import { NA_CUT_GLSM as NW2_K1, NA_CUT_75N as NW2_N75, US_ALEUT_EAST as NW2_ALEUT, US_RU_GAP180 as NW2_GAP180, US_CUT_W180 as NW2_W180 } from './cuts-m1.mjs';
const NW2_GRL = idsOf('GRL'); // 그린란드 6
const NW2_GL_WS = ['GL-KU', 'GL-QE']; // 그린란드 남부(쿠야레크)·서부(케케타) — 1721~ 덴마크·노르웨이 식민지 서·남 해안
const NW2_GL_EN = ['GRL-2742', 'GRL-2738']; // 북동 그린란드 국립공원·피투피크 — 1933 판결 앞 비움(M1과 같음)
{
  const ids = ['US-AK', 'RU-CHU', ...NW2_GRL, 'CA-BC'];
  if (ids.length !== 9 || new Set(ids).size !== 9 || M2_NW_IDS.length !== 9 || !ids.every((id) => M2_NW_IDS.includes(id))
    || ![...NW2_GL_WS, 'GL-SM', 'GL-QA', ...NW2_GL_EN].every((id) => NW2_GRL.includes(id)) || NW2_GRL.length !== 6) throw new Error('americas independence: NW-M2 조각 묶음이 M2_NW_IDS(9)와 다름');
}
// 러시아령 아메리카(G2-13): 1799 헌장 해안 띠(북위 55° 북쪽 해안·알류샨·코디액), 1825 영국–러시아 협약으로 서경 141° 서쪽 전체, 1867 알래스카 매입(usa — 이 칸은 주인 줄만, 블록은 US-M2)
const NW2_AK = ownSplit('NW2_AK', ['US-AK'], [['해안', NW2_COAST]], '내륙', { 해안: [[M2_START, null], [1799, 'russian-america']], 내륙: [[M2_START, null]] }, { to: 1825 });
own(['US-AK'], [[1825, 'russian-america'], [1867, 'usa']]);
extra('russian-america', 1799, 1867, { shape: NW2_ALEUT, name: 'NW2_ALEUTIAN_E' }); // 알류샨 동경 쪽(조각 밖 — 0단계 기본값 1, M1 손 도형 별칭)
extra('usa', 1867, null, { shape: NW2_ALEUT, name: 'NW2_ALEUTIAN_E' }); // 1867~1899 — M1 1900~ usa와 같은 모양으로 이어짐
// 추코트카(0단계 창구 ② 결정 3·C-M2-11): 1778 러시아 늘림, 1898~1899는 M1 modern.mjs extra(M1_EARLY). 서경 180° 밖 띠(폭 약 10 m)는 M1처럼 떼어 비움(build:data 경위도 범위)
const NW2_RUCHU = ownSplit('NW2_RUCHU', ['RU-CHU'], [['서경밖', NW2_W180]], '본토', { 서경밖: [[M2_START, null]], 본토: [[M2_START, null], [1778, 'russia'], [1898, null]] });
extra('russia', 1778, 1898, { shape: NW2_GAP180, name: 'NW2_RU_GAP180' }); // 유럽 러시아 손 도형 동변(동경 179.9°)과 서경 180° 사이 띠
// 그린란드(G2-14·37): 1776~1899 서·남 해안(M1 1900~1932와 같은 모양 — K1 서쪽·북위 75° 남쪽), 동·북은 1933 판결 앞이라 비움
own(NW2_GL_WS, [[M2_START, 'greenland']]);
const NW2_GLSM = ownSplit('NW2_GLSM', ['GL-SM'], [['동쪽', NW2_K1]], '서쪽', { 동쪽: [[M2_START, null]], 서쪽: [[M2_START, 'greenland']] });
const NW2_GLQA = ownSplit('NW2_GLQA', ['GL-QA'], [['북쪽', NW2_N75]], '남쪽', { 북쪽: [[M2_START, null]], 남쪽: [[M2_START, 'greenland']] });
own(NW2_GL_EN, [[M2_START, null]]);
// 브리티시컬럼비아(C-M2-6·K11): 섬 1849 밴쿠버섬 식민지·1866 합병 / 54°40′ 남쪽 본토 1818~1845 공동 점유 비움·1846 북서부 영토·1858 식민지 /
//   54°40′ 북쪽 1821 북서부 영토 — 그 가운데 나스강·핀레이강 남쪽·로키산맥 서쪽은 1858, 나머지(북부·피스강 쪽)는 1863-07-28 넓힘부터 식민지 / 1871-07-20 캐나다
const NW2_BC = ownSplit('NW2_BC', ['CA-BC'], [['섬', NW2_VAN], ['남', NW2_S5440], ['식민지북', NW2_C1858]], '북', {
  섬: [[M2_START, null], [1849, 'vancouver-island'], [1866, 'british-columbia']],
  남: [[M2_START, null], [1846, 'north-western-territory'], [1858, 'british-columbia']],
  식민지북: [[M2_START, null], [1821, 'north-western-territory'], [1858, 'british-columbia']],
  북: [[M2_START, null], [1821, 'north-western-territory'], [1863, 'british-columbia']],
}, { to: 1871 });
own(['CA-BC'], [[1871, 'canada']]);
const NW2_voids = () => [
  V(M2_START, 1799, 'US-AK'), // 알래스카 — 러시아-아메리카 회사 헌장(1799) 앞(코디액 1784 정착 등 교역소는 칠하지 않음 — 0단계 기본값 1)
  B(1799, 1825, NW2_AK.내륙), // 알래스카 내륙·북극 해안과 북위 55° 남쪽 — 헌장 해안 띠 밖(1825 영국–러시아 협약 앞)
  B(M2_START, 1778, NW2_RUCHU.본토), // 추코트카 — 1778 러시아 늘림 앞(결정 3)
  B(M2_START, M2_END, NW2_RUCHU.서경밖), // 서경 180° 밖 띠(폭 약 10 m — 경위도 범위 밖 꼭짓점)
  B(M2_START, M2_END, NW2_GLSM.동쪽, NW2_GLQA.북쪽), // 그린란드 동·북 — 1933 상설국제사법재판소 판결 앞(M1 결정 1·Q2와 같음)
  V(M2_START, M2_END, ...NW2_GL_EN), // 북동 그린란드·피투피크 — 같은 까닭
  B(M2_START, 1849, NW2_BC.섬), // 밴쿠버섬 — 1849 식민지 앞(1846 오리건 조약 앞은 공동 점유 — 결정 7)
  B(M2_START, 1846, NW2_BC.남), // 북위 54°40′ 남쪽 본토 — 오리건 컨트리 다툼·1818~1845 공동 점유(결정 7)
  B(M2_START, 1821, NW2_BC.식민지북, NW2_BC.북), // 북위 54°40′ 북쪽 — 1821 허드슨 베이 회사 독점 허가 앞(문서 없는 교역 — Q1 A)
];
// ── M2 NW-M2 끝 ──

// ── M2 BRG-M2 브라질·기아나 (최상위 이름 BRG2_) ──
// 조각 M2_BRG_IDS(브라질 25(BR-AC 뺌)·HOLE-4·가이아나 10·수리남 10·FR-GF = 47), 구현 BRG-M2(4라운드)
// 항목(새 2): dutch-essequibo-berbice [1776, 1814)·portuguese-brazil [1776, 1822). 앞 잇기 brazil·british-guiana(from 1814)·dutch-suriname·french-guiana
// 칼선 자리: BRG2_CUT_ARAGUARI(아마파 북 띠 1899 비움·1900 brazil — G7, 이 단계 하나뿐인 1899→1900 점프)
import { BRG2_CUT_ARAGUARI as BRG2_ARAGUARI } from './cuts-m2.mjs';
const BRG2_BOUNDS = []; // 처음 값 그대로: 아마파 나눈 조각은 1776~1899 한 묶음(1900부터 M1 조각 통째)
// 조각 묶음(합 47 — 아래 확인 줄)
const BRG2_AP = ['BR-AP']; // 아마파 — 아라과리강 북쪽 띠를 1841~1899 비움
const BRG2_BR = [...idsOf('BRA').filter((id) => id !== 'BR-AC' && id !== 'BR-AP'), 'HOLE-4']; // 브라질 24 + 연방구 구멍(아크리 BR-AC는 AND-N-M2 몫)
const BRG2_GY = idsOf('GUY'); // 가이아나 10 — 1899 판정선(지금 국경)을 처음부터(G2-23)
const BRG2_SR = idsOf('SUR'); // 수리남 10
const BRG2_GF = ['FR-GF']; // 프랑스령 기아나
const BRG2_ALL = [...BRG2_AP, ...BRG2_BR, ...BRG2_GY, ...BRG2_SR, ...BRG2_GF];
if (BRG2_ALL.length !== M2_BRG_IDS.length || new Set(BRG2_ALL).size !== BRG2_ALL.length || BRG2_ALL.some((id) => !M2_BRG_IDS.includes(id))) throw new Error(`americas independence BRG-M2: 칸 조각 ${BRG2_ALL.length}개(M2_BRG_IDS ${M2_BRG_IDS.length}개와 같아야 함)`);
// 브라질: 1549 총독령부터 포르투갈령 브라질(1775 그랑파라·마라냥 합침, 1815-12-16 연합 왕국 — 이름 글) → 1822-09-07 독립(G2-8). 미시오네스 오리엔탈레스는 처음부터(G16)
own(BRG2_BR, [[M2_START, 'portuguese-brazil'], [1822, 'brazil']]);
const BRG2_AM = ownSplit('BRG2_AMAPA', BRG2_AP, [['북띠', BRG2_ARAGUARI]], '남', {
  북띠: [[M2_START, 'portuguese-brazil'], [1822, 'brazil'], [1841, null]], // 오야포크강–아라과리강 사이 — 1841 영국 중재로 중립, 1900-12-01 베른 판정부터 M1 brazil(G7)
  남: [[M2_START, 'portuguese-brazil'], [1822, 'brazil']],
}, { from: M2_START, to: M2_END });
// 기아나: 에세키보·데메라라·버비스 → 1814-08-13 런던 조약으로 영국(G2-10), 수리남·프랑스령 기아나는 내내 같은 주인(점령은 관계 줄)
own(BRG2_GY, [[M2_START, 'dutch-essequibo-berbice'], [1814, 'british-guiana']]);
own(BRG2_SR, [[M2_START, 'dutch-suriname']]);
own(BRG2_GF, [[M2_START, 'french-guiana']]);
const BRG2_voids = () => [
  B(1841, M2_END, BRG2_AM.북띠), // 아마파 북 띠 — 1841 중립화부터 1900 판정 앞까지 브라질·프랑스 다툼(결정 7, G7)
];
// ── M2 BRG-M2 끝 ──


// ── 표 만들기 (공통 — 칸 줄 뒤) ─────────────────────────────
const BOUNDS = [...new Set([M2_START, ...FL2_BOUNDS, ...BNW2_BOUNDS, ...SCE2_BOUNDS, ...US2_BOUNDS, ...BNE2_BOUNDS, ...SCW2_BOUNDS, ...MX2_BOUNDS, ...ANN2_BOUNDS, ...CAM2_BOUNDS, ...CAR2_BOUNDS, ...NW2_BOUNDS, ...BRG2_BOUNDS, M2_END])].sort((a, b) => a - b);
if (BOUNDS[0] !== M2_START || BOUNDS.at(-1) !== M2_END || BOUNDS.some((y) => !Number.isInteger(y))) throw new Error(`americas independence: 표 경계 해 ${BOUNDS.join(', ')}는 ${M2_START}~${M2_END} 안의 정수여야 함`);
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
// 모든 own·ownSplit 뒤에 표를 채운다(나머지 단위는 주인 null)
const fillTables = () => {
  for (const l of layouts) if (!BOUNDS.includes(l.from) || !BOUNDS.includes(l.to)) throw new Error(`americas independence: 나눈 조각 ${l.name}의 기간 [${l.from}, ${l.to})은 표 경계 해(${BOUNDS.join(', ')})여야 함`);
  const known = new Set([...ALL_IDS, ...layouts.flatMap((l) => Object.values(l.units))]);
  for (const u of lines.keys()) if (!known.has(u)) throw new Error(`americas independence: 모르는 단위 ${u} (조각 id 또는 ownSplit이 돌려준 '묶음/부분')`);
  // 나눈 조각 부분의 줄은 그 묶음 기간 안의 해만, 첫 해는 묶음의 from(기간 밖 해는 표에 들어가지 않고 조용히 사라지므로 멈춘다)
  for (const l of layouts) {
    for (const u of Object.values(l.units)) {
      const line = lines.get(u);
      if (!line) continue;
      const bad = line.filter(([y]) => y < l.from || y >= l.to);
      if (bad.length) throw new Error(`americas independence: ${u}의 줄에 묶음 기간 [${l.from}, ${l.to}) 밖의 해 ${bad.map(([y]) => y).join(', ')}`);
      if (line[0][0] !== l.from) throw new Error(`americas independence: ${u}의 줄 첫 해 ${line[0][0]}가 묶음 첫 해 ${l.from}와 다름`);
    }
  }
  for (const T of TABLES) {
    const splitHere = new Set();
    for (const l of layouts.filter((x) => x.from <= T.FROM && T.TO <= x.to)) {
      l.out = l.out ? T.reuse(l.out) : T.split(l.name, l.ids, l.parts, l.restName);
      for (const u of Object.values(l.units)) T.own([u], lines.has(u) ? sliceLine(u, lines.get(u), T.FROM, T.TO) : [[T.FROM, null]]);
      for (const id of l.ids) splitHere.add(id);
    }
    // 통째 조각: 같은 줄끼리 묶어 한 번에(묶음은 도형에 영향 없음: 버전은 해마다 단위 목록으로 만든다)
    const groups = new Map();
    for (const id of ALL_IDS) {
      if (splitHere.has(id)) {
        const line = lines.get(id);
        if (line?.some(([y]) => y >= T.FROM && y < T.TO)) throw new Error(`americas independence: 조각 ${id}는 ${T.FROM}~${T.TO - 1}에 나눈 조각이라 통째 줄을 적을 수 없음(단위 이름으로 적음)`);
        continue;
      }
      const sliced = lines.has(id) ? sliceLine(id, lines.get(id), T.FROM, T.TO) : [[T.FROM, null]];
      const key = JSON.stringify(sliced);
      if (!groups.has(key)) groups.set(key, { sliced, ids: [] });
      groups.get(key).ids.push(id);
    }
    for (const { sliced, ids } of groups.values()) T.own(T.whole(...ids), sliced);
  }
};
fillTables();

// ── 소유표 → 버전·빈 땅 검사 구역·비운 땅 (공통) ─────────────────────────────
const joined = joinTables(TABLES);
if (joined.TO !== M2_END) throw new Error(`americas independence: 마지막 표의 끝이 ${joined.TO} (${M2_END}이어야 함)`);
// 버전: 표 줄의 단위 목록과 표 밖 땅(extra)을 해 구간마다 합쳐, 같은 모양(단위 목록·손 도형 이름)이 이어지는 기간이 한 버전. 끝은 M2_END(1900 — to: null 없음, M1이 1900부터 이음).
// 앞 권역 도형 빼기는 없다(1776~1899 이 권역 조각과 겹치는 앞 권역 도형 없음 — 유럽 러시아 손 도형은 동경 179.9° 서쪽, prev.mjs 없음)
const versionsOf = (id, segs) => {
  const ex = extras.filter((e) => e.id === id);
  const cuts = [...new Set([...segs.flatMap(([f, t]) => [f, t]), ...ex.flatMap((e) => [e.from, e.to])])].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const [a, b] = [cuts[i], cuts[i + 1]];
    const seg = segs.find(([f, t]) => f <= a && b <= t);
    const on = ex.filter((e) => e.from <= a && b <= e.to);
    const units = [...new Set([...(seg?.[2] ?? []), ...on.flatMap((e) => e.units)])].sort();
    const names = [...new Set(on.map((e) => e.name).filter(Boolean))].sort();
    if (!units.length && !names.length) continue;
    const key = JSON.stringify([units, names]);
    const last = out.at(-1);
    if (last && last.to === a && last.key === key) last.to = b;
    else out.push({ from: a, to: b, key, units, names });
  }
  return out.map(({ from, to, units, names }) => {
    const shapes = names.map((n) => extraShapes.get(n));
    const geom = !shapes.length ? build(units) : !units.length && shapes.length === 1 ? shapes[0] : U(...(units.length ? [build(units)] : []), ...shapes);
    return [from, to, geom];
  });
};
const versionIds = [...new Set([...Object.keys(joined.segments), ...extras.map((e) => e.id)])];
const versions = Object.fromEntries(versionIds.map((id) => [id, versionsOf(id, joined.segments[id] ?? [])]).filter(([, list]) => list.length));
// 시대 경계 검사(버전이 있을 때만): 모든 버전이 M2_START 이상에서 시작해 M2_END 이하에서 끝남(to: null 없음),
//   M1이 표 첫 해 앞을 칠하는 나라(M1_EARLY — russia 1898)는 그 해 이하에서 끝남(joinEras '기간이 겹침' 앞에 까닭을 밝힘)
for (const [id, list] of Object.entries(versions)) {
  const end = M1_EARLY[id] ?? M2_END;
  if (list.some(([f, t]) => f < M2_START || !Number.isInteger(t) || t > end)) throw new Error(`americas independence: ${id} 버전이 ${M2_START}~${end} 밖(끝 ${end} 이하 — ${end < M2_END ? 'M1 modern.mjs M1_EARLY가 그 해부터 칠함' : 'M1이 1900부터 이음'})`);
}

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). 칸마다 자기 voids 함수에(이유는 줄 주석)
const voids = [...FL2_voids(), ...BNW2_voids(), ...SCE2_voids(), ...US2_voids(), ...BNE2_voids(), ...SCW2_voids(), ...MX2_voids(), ...ANN2_voids(), ...CAM2_voids(), ...CAR2_voids(), ...NW2_voids(), ...BRG2_voids()];
for (const [f, t] of voids) if (!(Number.isInteger(f) && f >= M2_START && Number.isInteger(t) && f < t && t <= M2_END)) throw new Error(`americas independence: 비운 땅 기간 [${f}, ${t}) (${M2_START} 이상, 끝은 ${M2_END} 이하 — null 없음, 1900~는 M1)`);

// 빈 땅 검사 구역: 권역 바깥선(조각 664개)에서 그해 비운 땅(voids)을 뺀 곳 — 이 권역 나라 땅을 합쳐 빈 곳이 없어야 한다.
// M2_START~M2_END만 만든다(특별 지시 2 — 1775 이하에는 이 권역 구역이 없음). 비운 땅이 바뀌는 해마다 구역 하나, 모두 끝이 있다(1900~는 M1 구역).
// 이 권역 나라가 소유표에 하나도 없는 기간(빈 틀·뼈대)은 구역을 만들지 않는다(칸 하나만 채운 사본에서는 다른 칸 땅이 빈 땅으로 보고되는 것이 정상. gaps는 합치기 사본에서만 공식으로 돌린다).
// 손 도형(extra)은 조각 밖 땅이라 구역과 상관없다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapYears = [...new Set([M2_START, M2_END, ...voids.flatMap(([f, t]) => [f, t]).filter((y) => M2_START < y && y < M2_END)])].sort((a, b) => a - b);
// 구역 좌표를 data/geo와 같은 소수 넷째 자리로 반올림한다(중앙아시아 C1 합치기에서 배움 — 반올림하지 않으면 test:geo gaps의 빈 땅 계산이 polyclip 예외로 멈출 수 있음)
const R4 = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const gapZones = gapYears.slice(0, -1).flatMap((from, i) => {
  const to = gapYears[i + 1];
  if (!ownedIn(from, to)) return [];
  const active = voids.filter(([f, t]) => f <= from && to <= t).map(([, , g]) => g);
  return [{ name: `아메리카 독립 ${from}~${to - 1}`, zone: R4(active.length ? D(DOMAIN, ...active) : DOMAIN), from, to }];
});

// 열두 칸이 쓰지 않는 이름 경고 막기(칸이 쓰기 시작한 이름은 합치기가 지움)
void I; void geomOfUnit;

export const era = {
  name: 'independence',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 americas.mjs의 sourceOf(table.mjs AM_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
