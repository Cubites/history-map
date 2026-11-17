// oceania 권역 (DESIGN.md §5.2, 층 12): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/oceania/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/oceania.yaml(시대 파일마다 data/entities/oceania-<시대>.yaml). 정답표: data/tests/places/oceania.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia.mjs, areas/southeast-asia.mjs, areas/sub-saharan-africa.mjs, areas/americas.mjs, areas/oceania/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { joinEras } from '../shared.mjs';
import { OC_SOURCE_TEXT } from './oceania/table.mjs';
import { era as modernEra } from './oceania/modern.mjs';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기' — 값은 [첫 해, 끝 해(미포함)], 끝 해 ≤ 항목 to + 1). 원천: docs/oceania/00-scope.md 5절 영향표·0단계 창구 ① 결정 3(하와이 US-HI는 이 권역 조각, 병합 해부터 usa 늘림)·창구 ② 자동 승인·M1 G1-14.
//   땅은 시대 파일 칸(AZP-M1 — US-HI own 줄과 1898~1900 extra)이 칠한다. 칸은 이 파일을 고치지 않음. 아메리카 파일·usa 블록은 고치지 않는다(00-scope 10절)
// - usa(아메리카 항목 americas-modern.yaml, 1776~): US-HI 1898~ 끝 없음 — 1898~1900은 시대 파일 modern.mjs extra(M1_EARLY), 1901~는 modern.mjs 표
const EXTENDABLE = {
  usa: [1898, null],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/oceania/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
//   차례는 과거 시대가 앞(M2가 modern 앞에 더함 — 거꾸로면 같은 id 이어 붙이기가 '기간이 겹침'으로 멈춤)
const joined = joinEras('oceania', { versions: ownVersions, extendable: EXTENDABLE, gapZones: [], voids: [] }, [modernEra]);
export const { versions, gapZones, voids, extensions, extendable } = joined;
// 출처 문구(sourceOf — 나라 id → 문구, 엔진이 권역 source보다 먼저 씀): 이 권역 나라 모두 table.mjs의 OC_SOURCE_TEXT(늘린 usa는 joinEras가 versions에서 빼 아메리카 문구 그대로).
//   시대 파일은 era.source를 두지 않는다(두면 joinEras가 '출처 문구가 다름'으로 멈출 수 있음)
export const sourceOf = Object.fromEntries(Object.keys(versions).map((id) => [id, OC_SOURCE_TEXT]));
if (Object.keys(joined.sourceOf).length) throw new Error('oceania 권역 파일: 시대 파일이 era.source를 두었음 — 출처 문구는 이 파일 sourceOf 한 곳(OC_SOURCE_TEXT)');
