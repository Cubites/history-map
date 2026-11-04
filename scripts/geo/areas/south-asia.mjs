// south-asia 권역 (DESIGN.md §5.2, 층 9): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/south-asia/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/south-asia.yaml(시대 파일마다 data/entities/south-asia-<시대>.yaml). 정답표: data/tests/places/south-asia.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
import { joinEras } from '../shared.mjs';
import { era as modernEra } from './south-asia/modern.mjs';
import { era as colonialEra } from './south-asia/colonial.mjs';
import { era as sultanateEra } from './south-asia/sultanate.mjs';
import { era as ancientEra } from './south-asia/ancient.mjs';

// 출처 문구: 이 권역 나라 모두에 붙는다(지도 정보 패널)
export const source = '남아시아 쪽은 Natural Earth 1:10m admin-1(v5.1.2) 현대 행정구역 조각을 그 시기 국경에 맞춰 묶고, 조각이 역사 경계와 다른 곳(하이데라바드 주·칼라트 칸국과 속령 등)은 위키백과·브리태니커의 넓이와 지금 지구 경계에 맞춰 선을 그어 나눈 근사. 카슈미르는 실효 지배선대로, 중국과 맞닿은 쪽은 동아시아 지도의 중국 경계를 따름. 운영자 검수 필요';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/south-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
// 시대 파일 목록은 과거 시대가 앞이다(S1 항목 nepal·bhutan·sikkim·hyderabad-state·kalat 등의 1947년 전 버전이 1947년부터 버전 앞에 붙음). new:area는 새 시대를 끝에 붙이므로 colonial은 S2 뼈대에서, sultanate(1206~1756)는 S3 뼈대에서, ancient(기원전 800~1205)는 S4 뼈대에서 맨 앞으로 옮김(ancient → sultanate → colonial → modern: S3 항목(촐라·판디아·호이살라 등)의 1206년 전 버전이 1206년부터 버전 앞에 붙음)
// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기'): docs/south-asia/00-scope.md 5절 영향표의 승인 줄만. 시대 파일 소유표가 이 나라 id를 주인으로 쓴다. 값은 [첫 해, 끝 해(미포함)] = 칠하는 마지막 해 + 1이고, 끝 해는 그 항목 to(끝 해 포함) + 1을 넘을 수 없다
// S4 줄 여섯은 S4 뼈대(2026-11-04)가 운영자 결정(S4 질문 창구 ②)대로 다 적음 — 구현 칸은 이 파일을 고치지 않고 소유표 주인으로 그 id를 쓴다(서 칸)
// - afsharid-iran 1739~1747: 1739년 나디르 샤가 델리 약탈 뒤 인더스강 서쪽(페샤와르·부족 지역·데라 가지 칸 쪽)을 병합(S3 운영자 결정 7, 2026-11-03)
// - achaemenid-empire 기원전 518~331년(천문 −517~−330): 간다라(기원전 518년부터)·힌두시(기원전 513년부터), 445,504 km² — 마크란 해안은 칠하지 않음(S4 결정 2)
// - sasanian-empire 240~488: 마크란 해안 직할(cut-makran-coast 96,481 km²)만, 489 라이 왕조·632 차치 왕조로 넘어감 — 투란은 칠하지 않음(S4 결정 4, 해의 끝은 기본값 4에 맞춤)
// - ghaznavid-empire 1001~1186: 1001 페샤와르 → 1010 물탄 → 1021 라호르, 최대 약 314,000 km²(S4 결정 5)
// - umayyad-caliphate 711~749: 신드·물탄·바하왈푸르·마크란 약 375,000 km², 750부터는 아바스(S4 결정 6, 그해 말 모습)
// - abbasid-caliphate 750~854: 같은 땅, 신드 쪽은 853까지(854 하바리 에미르국)·물탄 쪽은 854까지(855 물탄 에미르국)(S4 결정 6, 기본값 5)
// - tibet 650~842: 라다크·발티스탄만(길기트 제외) 95,136 km², 기존 티베트 도형과 겹치는 땅(cnMinusOf)은 뺌(S4 결정 7)
const EXTENDABLE = {
  'afsharid-iran': [1739, 1748],
  'achaemenid-empire': [-517, -329],
  'sasanian-empire': [240, 489],
  'ghaznavid-empire': [1001, 1187],
  'umayyad-caliphate': [711, 750],
  'abbasid-caliphate': [750, 855],
  tibet: [650, 843],
};
export const { versions, gapZones, voids, sourceOf, extensions, extendable } = joinEras('south-asia', { versions: ownVersions, gapZones: [], voids: [], extendable: EXTENDABLE }, [ancientEra, sultanateEra, colonialEra, modernEra]);
