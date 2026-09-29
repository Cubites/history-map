// 동남아시아 권역 (DESIGN.md §5.2, 잎): 남베트남의 도형과 versions. 짝 entities 파일: data/entities/southeast-asia.yaml
// 가져와도 되는 것: lib.mjs, shared.mjs (다른 권역 파일은 가져오지 않는 잎이다)
import { ring } from '../lib.mjs';

// ── 8번 묶음 (1945 ~ 현재) ─────────────────────────────────
// 베트남 공화국(남베트남, 1955~1975): 북위 17도선 이남 (라오스·캄보디아 경계는 대략)
const SOUTH_VIETNAM = ring([[106.6, 17.0], [107.3, 17.2], [109.8, 15.0], [109.8, 11.0], [107.0, 9.3], [104.3, 8.2], [104.3, 10.4], [105.1, 10.9], [106.2, 11.8], [107.5, 12.3], [107.5, 14.5], [107.2, 15.8]]);

// 나라 id: [[from, to, 멀티폴리곤, 확실성?], ...]. to가 null이면 지금까지, 확실성은 'disputed' 등(없으면 'estimated').
// 출처(geojson의 source)는 나라별로 적지 않고 권역 파일의 source로 정한다(없으면 engine.mjs의 기본 문구)
export const versions = {
  'south-vietnam': [[1955, 1976, [[SOUTH_VIETNAM]]]],
};
