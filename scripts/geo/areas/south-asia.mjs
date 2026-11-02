// south-asia 권역 (DESIGN.md §5.2, 층 9): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/south-asia/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/south-asia.yaml(시대 파일마다 data/entities/south-asia-<시대>.yaml). 정답표: data/tests/places/south-asia.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { joinEras } from '../shared.mjs';
import { era as modernEra } from './south-asia/modern.mjs';

// 출처 문구: 이 권역 나라 모두에 붙는다(지도 정보 패널)
export const source = '남아시아 쪽은 Natural Earth 1:10m admin-1(v5.1.2) 현대 행정구역 조각을 그 시기 국경에 맞춰 묶고, 조각이 역사 경계와 다른 곳(하이데라바드 주·칼라트 칸국과 속령 등)은 위키백과·브리태니커의 넓이와 지금 지구 경계에 맞춰 선을 그어 나눈 근사. 카슈미르는 실효 지배선대로, 중국과 맞닿은 쪽은 동아시아 지도의 중국 경계를 따름. 운영자 검수 필요';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/south-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
export const { versions, gapZones, voids, sourceOf } = joinEras('south-asia', { versions: ownVersions, gapZones: [], voids: [] }, [modernEra]);
