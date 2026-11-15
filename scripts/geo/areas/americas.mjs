// americas 권역 (DESIGN.md §5.2, 층 12): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/americas/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/americas.yaml(시대 파일마다 data/entities/americas-<시대>.yaml). 정답표: data/tests/places/americas.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { P, U } from '../lib.mjs';
import { joinEras } from '../shared.mjs';
import { AM_SOURCE_TEXT } from './americas/table.mjs';
import { USA_MAIN, ALASKA } from './americas/usa-hand.mjs';
import { era as modernEra } from './americas/modern.mjs';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
// usa(미국) 1848~1899 손그림: 아메리카 M1 뼈대(2026-11-15)가 scripts/geo/areas/west.mjs에서 옮김(고리는 도우미 usa-hand.mjs에 좌표 바이트 그대로 — 0단계 기본값 4).
//   1900~는 시대 파일 americas/modern.mjs US-M1 머리. M2(1776~1899)가 조각 바탕으로 그리면 이 줄과 usa-hand.mjs를 지운다
const ownVersions = {
  usa: [[1848, 1867, P(USA_MAIN)], [1867, 1900, U([USA_MAIN], [ALASKA])]],
};


// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기' — 값은 [첫 해, 끝 해(미포함)], 끝 해 ≤ 항목 to + 1). 원천: docs/americas/00-scope.md 5절 영향표·0단계 창구 ② 결정 3(추코트카 서경 쪽 끝을 러시아 계열로 1778년부터)·G6.
//   M1은 1900을 걸치는 russia 1898~1905 버전부터(M2가 첫 해를 1778로 넓힘 — 나라마다 한 범위). 땅은 시대 파일 US-M1 칸(RU-CHU own 줄·180° 틈 띠 손 도형)이 칠한다. 칸은 이 파일을 고치지 않음
// - russia(유럽 항목 1721~1917): RU-CHU 1898~1917. 1898~1899는 시대 파일 extra(M1_EARLY)
// - soviet-union(유럽 항목 1917~1991): 1918~1991 (끝 해를 식으로 적음 — 값 쌍 [1918, 1992]가 중앙아시아 EXTENDABLE 줄과 같아 check:generator가 좌표 되풀이로 볼 수 있음)
// - russia-fed(유럽 항목 1991~): 1992~ 끝 없음
const EXTENDABLE = {
  russia: [1898, 1918],
  'soviet-union': [1918, 1991 + 1],
  'russia-fed': [1992, null],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/americas/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
const joined = joinEras('americas', { versions: ownVersions, extendable: EXTENDABLE, gapZones: [], voids: [] }, [modernEra]);
export const { versions, gapZones, voids, extensions, extendable } = joined;
// 출처 문구(sourceOf — 나라 id → 문구, 엔진이 권역 source보다 먼저 씀): usa 말고 이 권역 나라 모두 table.mjs의 AM_SOURCE_TEXT.
//   usa는 권역 파일 손그림과 시대 파일 버전을 이어 붙여 출처 문구가 하나라서(geojson source) 손그림 때 문구(엔진 기본 문구) 그대로 둔다 — M2가 손그림을 없애면 이 예외를 지움(아메리카 M1 뼈대).
//   시대 파일은 era.source를 두지 않는다(두면 joinEras가 usa에서 '출처 문구가 다름'으로 멈춤)
const SOURCE_KEEP = new Set(['usa']);
export const sourceOf = Object.fromEntries(Object.keys(versions).filter((id) => !SOURCE_KEEP.has(id)).map((id) => [id, AM_SOURCE_TEXT]));
if (Object.keys(joined.sourceOf).length) throw new Error('americas 권역 파일: 시대 파일이 era.source를 두었음 — 출처 문구는 이 파일 sourceOf 한 곳(AM_SOURCE_TEXT)');
