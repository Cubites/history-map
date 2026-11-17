// americas 시대 파일 ancient (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 아메리카 고대(기원전 2333년~기원후 1000년)
// 짝 항목 파일: data/entities/americas-ancient.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다 — 이 단계는 칠하는 나라가 없어 versions가 비고, 땅 없는 항목 14는 항목 파일에만 있음)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 다른 도우미 모듈. areas/americas.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/americas/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/americas.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다 — 권역 파일 joinEras 차례는 과거 시대가 앞: ancient·precolumbian·colonial·independence·modern).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 아메리카 M5 짜임 안내 (M5 뼈대 2026-11-18 — 근거: docs/americas/00-scope.md 2·3·5·6·8·10절, 0단계 결정(창구 ① 4·5, 창구 ② 9·10),
//    M5 창구 ②(Q1 A·Q2 A — border-stages/am-m5/decisions.md), 기본값 G5-1~G5-18, 지시문 am-m5/m5/COMMON.md 2·3절·notes.md C-M5-1~17) ─────────────────
// 등급(00-scope 3절): 일반(땅 1만 km², 해 어긋남 5만 km² 이상 3년·1만~5만 km² 10년, 손그림 선 평균 10/최대 25 km). '주변'은 data/tests/zones.yaml greenland-ice-sheet 안만(땅 5만·선 25/50 km).
// 해 표기: 해는 천문 연도다(기원전 N년 = 천문 1−N — 기원전 2333년 = −2332, 기원전 3500년 = −3499). 코드·주석·항목 칸 숫자는 천문 연도, 화면 글에는 '기원전 N년'만.
// 해 규칙(P1): 한 버전 = 그해 말 모습. 원정·되돌려진 점령은 칠하지 않음. 새 버전은 1만 km² 넘게 바뀔 때만 — 이 단계는 버전 0.
// 칠한 나라 0(Q1 A·Q2 A·결정 9): M4 Q1 잣대(결정 9에 이름이 오르거나 단일 나라로 서술 + 범위 값이 문서에 + 1만 km² 이상)로 몬테알반·모체·티칼·칼라크물·테오티우아칸·와리·티와나쿠를
//   다시 판정해 모두 미달이거나 결정 9가 땅 없게 둔 나라 — 칠하지 않는다. 그래서 이 파일에는 versions·칸 머리·own 줄·<칸>_BOUNDS·<칸>_voids·칼선 파일(cuts-m5.mjs — C-M5-2)이 없다.
// 땅 없는 항목 14(level region — 항목 파일 data/entities/americas-ancient.yaml에만, versions 없음): 메소아메리카·북미 monte-alban·teotihuacan·olmec-culture·poverty-point-culture·
//   adena-culture·hopewell-culture(MXN-M5), 안데스 norte-chico·valdivia·chavin-culture·paracas-culture·nasca-culture·moche-culture·wari·tiwanaku(AND-M5). 모두 사건의 주체·글로만 쓴다.
// 하한 앞 from 둘: norte-chico·valdivia의 from은 −3499(기원전 3500년 — 연도 막대 하한 −2332보다 앞, G5-3·남아시아 indus-civilization −2599 꼴). 항목 칸에는 실제 해 그대로, 땅이 없어 이 파일과 상관없음.
// 칸 머리 없음: 칸(MXN-M5·AND-M5)은 이 파일을 고치지 않는다(항목 파일 자기 칸 머리 블록과 공유 목록 add/·del/만 — COMMON 5절). 고칠 거리는 칸 결과 노트 6절.
// 늘림 나라: 없음(권역 파일 EXTENDABLE 그대로 — M5 창구 ② 자동 승인 0건). 관계 줄 0(P2·C-M5-7).
// 시대 경계 맞물림: 이 파일은 ANCIENT_START(−2332)부터 ANCIENT_END(1001, 미포함)까지 — 뒤 시대 M4 precolumbian.mjs는 1001(M4_START)부터(아래 확인 줄, 시대 파일은 서로 가져오지 않아 값을 손으로 맞춤).
//   1000·1001 모두 이 권역 땅 0 → 점프 0(G5-9). 앞 시대 없음(기원전 2333년 앞은 연도 막대 밖).
// 공통 비운 땅(G5-11·C-M5-1 — M4 commonVoids 꼴): 기원전 2333년~1000 권역 바깥선 DOMAIN 전부를 비운 땅 한 줄로 둔다(아래 voids). 빈 땅 검사 구역(gapZones)은 만들지 않는다.
// 출처 문구: 이 시대 파일은 era.source를 두지 않는다 — 권역 파일 americas.mjs의 sourceOf가 table.mjs AM_SOURCE_TEXT를 붙인다(칠한 나라가 없어 이 파일 몫은 0).
// 이름: data/tests/spelling.yaml(아메리카 첫판·M1~M4 공통·M5 공통·칸 머리)과 am-m5/m5/SKEL-NOTE.md 끝 공용 표기표를 먼저 본다.
//
import { DOMAIN } from './table.mjs';

const ANCIENT_START = -2332; // 이 시대 파일의 첫 해(기원전 2333년 말 모습 — 00-scope 연도 막대 하한, 사하라 이남 F7_START 꼴). 그 앞 해는 쓰지 않는다
const ANCIENT_END = 1001; // 끝(미포함) = 뒤 시대 M4 precolumbian.mjs의 첫 해
const M4_START = 1001; // M4 시대 파일 precolumbian.mjs의 M4_START(그 파일은 export하지 않아 값을 여기 적음 — 둘이 다르면 멈춤)
if (ANCIENT_END !== M4_START) throw new Error(`americas ancient: 끝 해 ${ANCIENT_END}가 M4 첫 해 ${M4_START}와 다름(시대 경계 맞물림 — 1000/1001 사이가 비거나 겹침)`);

// 버전: 없음(칠한 나라 0 — Q1 A·Q2 A·결정 9). 시대 경계 검사 줄은 버전이 생길 때 둔다(그때는 결정 밖 — 멈추고 결과 노트 6절)
const versions = {};

// 빈 땅 검사 구역: 없음(G5-11 — 칠할 땅이 없어 비어 있으면 안 되는 지역이 없다). gaps.txt에 아메리카 줄을 넣지 않는다
const gapZones = [];

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게):
//   기원전 2333년~1000 권역 바깥선 전부 — 칠할 나라 없음(Q1 A·Q2 A, 결정 9: 1492 이전은 학계 합의가 있는 큰 나라만 근사 도형, 테오티우아칸·와리·티와나쿠는 땅 없는 항목). M4 commonVoids 첫 줄과 같은 꼴
const voids = [[ANCIENT_START, ANCIENT_END, DOMAIN]];

export const era = {
  name: 'ancient',
  versions,
  gapZones,
  voids,
  // source는 두지 않는다 — 권역 파일 americas.mjs의 sourceOf(table.mjs AM_SOURCE_TEXT)가 붙음(짜임 안내 '출처 문구')
};
