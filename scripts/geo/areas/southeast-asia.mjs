// 동남아시아 권역 (DESIGN.md §5.2, 층 끝 — 2026-11-08 동남아 0단계에서 AREAS 맨 끝으로 옮김: 앞 권역 나라(영국령 인도 등)를 늘릴 수 있게): 남베트남의 도형과 versions. 짝 entities 파일: data/entities/southeast-asia.yaml
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/의 다른 권역 파일 모두(AREAS에서 이 권역이 끝이다), areas/southeast-asia/의 도우미 모듈. 범위·기준은 docs/southeast-asia/00-scope.md
import { ring } from '../lib.mjs';
import { joinEras } from '../shared.mjs';
import { era as modernEra } from './southeast-asia/modern.mjs';

// ── 8번 묶음 (1945 ~ 현재) ─────────────────────────────────
// 베트남 공화국(남베트남, 1955~1975): 북위 17도선 이남 (라오스·캄보디아 경계는 대략)
const SOUTH_VIETNAM = ring([[106.6, 17.0], [107.3, 17.2], [109.8, 15.0], [109.8, 11.0], [107.0, 9.3], [104.3, 8.2], [104.3, 10.4], [105.1, 10.9], [106.2, 11.8], [107.5, 12.3], [107.5, 14.5], [107.2, 15.8]]);

// 나라 id: [[from, to, 멀티폴리곤, 확실성?], ...]. to가 null이면 지금까지, 확실성은 'disputed' 등(없으면 'estimated').
// 출처(geojson의 source)는 나라별로 적지 않고 권역 파일의 source로 정한다(없으면 engine.mjs의 기본 문구)
const ownVersions = {
  'south-vietnam': [[1955, 1976, [[SOUTH_VIETNAM]]]],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/southeast-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅을 붙인다(shared.mjs joinEras)
export const { versions, gapZones, voids, sourceOf } = joinEras('southeast-asia', { versions: ownVersions }, [modernEra]);
