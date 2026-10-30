// middle-east 권역 (DESIGN.md §5.2, 층 8): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/middle-east/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/middle-east.yaml(시대 파일마다 data/entities/middle-east-<시대>.yaml). 정답표: data/tests/places/middle-east.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { joinEras } from '../shared.mjs';
import { era as medievalEra } from './middle-east/medieval.mjs';
import { era as earlyModernEra } from './middle-east/early-modern.mjs';
import { era as modernEra } from './middle-east/modern.mjs';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 늘려도 되는 앞 권역 나라 (engine.mjs '앞 권역 나라 늘리기'): 나라 id → [첫 해, 끝 해(미포함)]. 원천은 docs/middle-east/00-scope.md 5절 영향표(A2는 운영자 결정 2로
// '새 범위 안 실제 지배 땅 전부'로 넓힘). 기간은 넓게(항목 존속 끝 1922년까지) 둔다. 시대 파일 소유표에 이 나라 id를 주인으로 쓰면 그 땅이 원래 권역 나라에 더해지고,
// 여기 없는 앞 권역 나라(spain 등)를 주인으로 쓰면 생성기가 멈춘다. A4가 영향표 줄(achaemenid-empire 등)을 이 표에 더한다
// A3(632~1452, 2026-10-30 A3-0): 영향표 A3 줄 나라. 끝 해는 미포함(ottoman 줄과 같은 꼴). 원래 권역 버전이 없는 해(우마이야 661~710·알모라비드 1040~1090·
// 알모하드 1229~1268)도 이 기간 안이면 이 권역 땅만으로 버전이 생긴다. mongol-empire는 inner-asia 권역(AREAS 2번째)이라 이 권역보다 앞이다
const EXTENDABLE = {
  'umayyad-caliphate': [661, 751],
  'byzantine-empire': [632, 699],
  'cordoba-caliphate': [929, 1032],
  almoravids: [1040, 1148],
  almohads: [1147, 1270],
  antioch: [1098, 1269],
  'edessa-county': [1098, 1151],
  'mongol-empire': [1221, 1261],
  ottoman: [1453, 1923],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/middle-east/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
// 시대 파일 목록은 과거 시대가 앞이다(A1 항목 qajar-iran·kuwait 등의 1918년 전 버전이 1918년부터 버전 앞에, A2 항목 mamluk-sultanate 등의 1453년 전 버전이 1453년부터 버전 앞에 붙음).
// new:area는 새 시대를 끝에 붙이므로 손으로 옮긴다(medieval은 A3-0에서 맨 앞으로 옮김)
export const { versions, gapZones, voids, sourceOf, extensions, extendable } = joinEras('middle-east', { versions: ownVersions, gapZones: [], voids: [], extendable: EXTENDABLE }, [medievalEra, earlyModernEra, modernEra]);
