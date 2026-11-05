// central-asia 권역 (DESIGN.md §5.2, 층 10): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/central-asia/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/central-asia.yaml(시대 파일마다 data/entities/central-asia-<시대>.yaml). 정답표: data/tests/places/central-asia.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
// 이 파일은 C1 뼈대(2026-11-05)가 다 적었고 C2 뼈대(2026-11-05)가 C2 늘림 줄·시대 잇기를 더했다 — 구현 칸(C1 A·W·E, C2 A·W·EK·EX)은 고치지 않는다(틀렸으면 결과 노트 6절).
import { joinEras } from '../shared.mjs';
import { era as modernEra } from './central-asia/modern.mjs';
import { era as earlyModernEra } from './central-asia/early-modern.mjs';

// 출처 문구: 이 권역 나라 모두에 붙는다(지도 정보 패널)
export const source = '중앙아시아 쪽은 Natural Earth 1:10m admin-1(v5.1.2) 현대 행정구역 조각(신장은 중국 조각)을 그 시기 국경에 맞춰 묶고, 조각이 역사 경계와 다른 곳(부하라·히바·코칸트 보호국, 예티샤르, 아프가니스탄의 단계별 영토 등)은 위키백과·브리태니커의 넓이와 지금 주·지구 경계, 러시아 제국 정복 단계 구역에 맞춰 선을 그어 나눈 근사. 분쟁 땅은 실효 지배대로, 러시아·중국과 맞닿은 쪽은 유럽·동아시아 지도의 경계를 따름. 운영자 검수 필요';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기'): docs/central-asia/00-scope.md 5절 영향표의 승인 줄만. 시대 파일 소유표가 이 나라 id를 주인으로 쓴다(joinEras가 extensions로 보냄).
// 값은 [첫 해, 끝 해(미포함)] = 칠하는 마지막 해 + 1이고, 끝 해는 그 항목 to(끝 해 포함) + 1을 넘을 수 없다(scripts/build-data 존속 기간 검사). null은 끝 없음(지금까지)
// 늘릴 땅은 그해 원래 도형을 뺀 땅만(1 km² 넘게 겹치면 생성기가 멈춤 — 시대 파일의 prevMinusOf를 뺀다). 허용 기간 안에서 칠하지 않는 해는 그냥 칠하지 않으면 된다
// - russia 1865~1917: 카자흐스탄 동쪽 끝(동경 80.6° 동쪽 약 2.6만 km², 1850~1991년 빈 땅)을 기존 모양 쪽으로 메움(기본값 7, E 칸). 항목 to 1917
// - soviet-union 1918~1991: 같은 땅(기본값 7, E 칸). 항목 to 1991
// - qing 1696~1911: 신장 전체(운영자 결정 2 — C1이 칠하는 해는 E 칸이 사료로: 1876 북신장·1877/78 타림·1881 일리 안팎).
//   C2(1500~1864, C2 결정 Q10): 하미 서쪽 1696~1758(EX 칸)·신장 전체 1759~1863(EX)·카자흐스탄 동쪽 끝(동경 80.6° 동쪽) 1759~1863(EK), 1864는 늘림을 풀어 동쪽 띠만(맞춤 M25·COMMON 6절).
//   0단계 결과 노트 5절 1의 두 토막 꼴([1759, 1865]·[1878, 1912])은 한 범위로 적음 — extendable은 나라마다 한 범위이고, 그 안에서 칠하지 않는 해(예티샤르 1865~1877)는 허용일 뿐이라 멈추지 않음. 항목 to 1911
// - roc 1912~1948: 신장 전체(결정 2, 동투르키스탄 공화국 1944~1949 세 지구는 비움이 기본 — 결정 맞춤 9). 1949부터는 prc. 항목 to 1949
// - prc 1949~: 신장 전체(결정 2). 끝 없음(null — 엔진이 2026-11-05부터 받음)
const EXTENDABLE = {
  russia: [1865, 1918],
  'soviet-union': [1918, 1992],
  qing: [1696, 1912], // C1 결정 2 신장 1865~1911 + C2 Q10 하미 서쪽 1696~·신장·카자흐 동쪽 끝 1759~1863 (항목 to 1912 — 끝 해 1912 ≤ to + 1)
  roc: [1912, 1949],
  prc: [1949, null],
  // ── C2(1500~1864) 늘림 (C2 뼈대 2026-11-05 — 원천 ca2/research/C2-DECISIONS.md, C2 A 칸이 칠함. 늘린 나라는 승인 범위 쪽으로만, 기존 범위 안 모양은 바이트 그대로: standards 9절 12)
  'mughal-empire': [1526, 1739], // Q1 카불 1526~1738(칸다하르는 사파비와 번갈이 1558·1595·1622·1638·1649). 1541~1554 원래 버전 없는 해는 엔진 '원래 버전 없는 해'가 받음. 항목 to 1857
  'safavid-iran': [1510, 1736], // Q2 헤라트·칸다하르 1510~1735(칸다하르는 무굴과 번갈이). 항목 to 1736
  'hotak-dynasty': [1709, 1738], // Q2 칸다하르 1709~1737(원래 버전은 1722~1728만 — 그 밖의 해는 새 버전). 항목 to 1738
  'afsharid-iran': [1736, 1750], // Q2 헤라트·칸다하르 1736~1749(남아시아가 이미 인더스 서안 1739~1747을 늘린 나라 — 두 권역 늘림). 항목 to 1796
  'durrani-empire': [1747, 1823], // Q3 아프가니스탄 본토 전부 1747~1822(최대 약 56.8만 km², 1747은 원래 버전 없는 해). 항목 to 1825
};

// 앞 권역 나라 깎기(engine.mjs '앞 권역 나라 깎기', 2026-11-05 이 권역에서 처음): 00-scope 5절 영향표 '줄임' 승인 줄만(운영자 결정 1).
// 시대 파일이 era.trims({ id: [[from, to, 멀티폴리곤], ...] }, 칸마다 A_TRIMS·W_TRIMS를 모음)에 뺄 땅을 적고, 그 땅의 새 주인(보호국)은 소유표에 따로 적는다.
// 값은 [첫 해, 끝 해(미포함)]. 원래 모양은 data/geo/home/<id>.geojson(전쟁 화면은 그대로), 뺄 땅 목록은 data/geo/home/<id>.trims.json
// - russia 1866~1917: 부하라 토후국 1868~(보호국), 코칸트 칸국 1868~1875(1866 구역에 든 코칸트 몫은 1866~1867에도 — 00-scope 5절 russia 줄), 히바 칸국 1873~(보호국). W 칸(부하라·코칸트)·A 칸(히바)
// - soviet-union 1918~1923: 부하라·히바(1920~1924 부하라·호라즘 인민 소비에트 공화국 포함), 1924년 10월 민족 경계 획정부터 소련 한 항목(결정 맞춤 5)
const TRIMMABLE = {
  russia: [1866, 1918],
  'soviet-union': [1918, 1924],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/central-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅·뺄 땅을 붙인다(shared.mjs joinEras)
export const { versions, gapZones, voids, sourceOf, extensions, extendable, trims, trimmable } = joinEras('central-asia', { versions: ownVersions, gapZones: [], voids: [], extendable: EXTENDABLE, trimmable: TRIMMABLE }, [earlyModernEra, modernEra]);
