// 동남아시아 권역 (DESIGN.md §5.2, 층 끝 — 2026-11-08 동남아 0단계에서 AREAS 맨 끝으로 옮김: 앞 권역 나라(영국령 인도 등)를 늘릴 수 있게): 남베트남의 versions, 시대 파일 잇기, 앞 권역 나라 늘리기. 짝 entities 파일: data/entities/southeast-asia.yaml
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/의 다른 권역 파일 모두(AREAS에서 이 권역이 끝이다), areas/southeast-asia/의 도우미 모듈. 범위·기준은 docs/southeast-asia/00-scope.md
// 이 파일은 E1 뼈대(2026-11-08)가 늘림 줄과 남베트남 도형 옮김을, E2 뼈대(2026-11-08)가 colonial 시대 파일 잇기와 company-india 늘림 줄을, E3 뼈대(2026-11-09)가 early-modern 시대 파일 잇기를, E4 뼈대(2026-11-09)가 ancient 시대 파일 잇기를 더했다 — 구현 칸(E1 W·CL·CV·SM·SB·SI, E2 BM·SC·LO·VT·MI·BP, E3 BM·SC·VT·LO·M1·I1, E4 VC·SK·BI)은 고치지 않는다(틀렸으면 결과 노트 6절).
// 출처 문구: 이 파일에는 export const source를 두지 않는다 — 두면 남베트남의 출처 문구(엔진 기본 문구)가 바뀌어 결정 7(바이트 그대로)이 깨진다. E1~E4 나라의 출처는 시대 파일 era.source(네 시대가 같은 문구 — table.mjs SE_SOURCE_TEXT)
import { joinEras } from '../shared.mjs';
import { SOUTH_VIETNAM } from './southeast-asia/shapes.mjs';
import { era as ancientEra } from './southeast-asia/ancient.mjs';
import { era as earlyModernEra } from './southeast-asia/early-modern.mjs';
import { era as colonialEra } from './southeast-asia/colonial.mjs';
import { era as modernEra } from './southeast-asia/modern.mjs';

// 나라 id: [[from, to, 멀티폴리곤, 확실성?], ...]. to가 null이면 지금까지, 확실성은 'disputed' 등(없으면 'estimated').
// 출처(geojson의 source)는 나라별로 적지 않고 권역 파일의 source로 정한다(없으면 engine.mjs의 기본 문구)
// 남베트남 도형 SOUTH_VIETNAM은 시대 파일도 빼서 맞추므로 도우미 모듈 shapes.mjs로 옮겼다(E1 뼈대, 좌표 그대로)
const ownVersions = {
  'south-vietnam': [[1955, 1976, [[SOUTH_VIETNAM]]]],
};

// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기'): docs/southeast-asia/00-scope.md 5절 영향표의 승인 줄만. 시대 파일 소유표가 이 나라 id를 주인으로 쓴다(joinEras가 extensions로 보냄).
// 값은 [첫 해, 끝 해(미포함)] = 칠하는 마지막 해 + 1이고, 끝 해는 그 항목 to(끝 해 포함) + 1을 넘을 수 없다. 허용 기간 안에서 칠하지 않는 해는 그냥 칠하지 않으면 된다.
// E3(1293~1766)에는 늘림 줄이 없다 — 자동 승인 A6(므라우우의 치타공 1459~1665)은 늘림이 아니라 이 권역 나라가 남아시아가 비운 땅을 칠하는 것이라 시대 파일 early-modern.mjs의 권역 밖 땅 줄(BM_OUTSIDE)이 맡는다.
// E4(1292 이전)에도 늘림 줄이 없다 — 남월의 광둥·광시(E4 창구 ② Q1)는 A6와 같은 권역 밖 땅 줄(시대 파일 ancient.mjs VC_OUTSIDE)이 맡는다(중국 권역 파일은 그대로).
// 늘릴 땅은 그해 원래 도형을 뺀 땅만(1 km² 넘게 겹치면 생성기가 멈춤) — 영국령 인도·회사령 인도의 원래 도형은 이 권역 조각과 1 km² 안(E1 뼈대 측정 e1/skel/prev-overlap.txt, E2 뼈대 측정 e2/skel/prev-overlap.txt)이라 뺄 것이 없다.
// - british-raj 1858~1936: 결정 1 — 아라칸(라카인)·테나세림·하버마 1858~1885는 E2 colonial 시대 파일이 칠함, 버마 본토 1886~1936은 자동 승인 A1
//   (샨 국·카렌니는 따로 항목 — 기본값 4. E1 W 칸이 1900~1936을, E2가 1886~1899를 칠함). 1937-04-01 분리 뒤는 새 항목 british-burma. 항목 to 1946
// - company-india 1826~1857: 결정 1 — 아라칸(라카인)·테나세림 1826~(1826-02-24 얀다보 조약), 하버마 1852~(1852-06 점령, 병합 포고 1853-01-20은 사건 글). E2 BM 칸이 칠함, 항목 to 1857(E2 뼈대가 엶)
const EXTENDABLE = {
  'company-india': [1826, 1858],
  'british-raj': [1858, 1937],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/southeast-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras). 시대 목록은 과거 시대가 앞
export const { versions, gapZones, voids, sourceOf, extensions, extendable } = joinEras('southeast-asia', { versions: ownVersions, extendable: EXTENDABLE }, [ancientEra, earlyModernEra, colonialEra, modernEra]);
