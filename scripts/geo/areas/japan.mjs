// 일본 권역 (DESIGN.md §5.2, 잎): 왜·일본·미군정 류큐의 도형과 versions. 짝 entities 파일: data/entities/japan.yaml
// 가져와도 되는 것: lib.mjs, shared.mjs (다른 권역 파일은 가져오지 않는 잎이다. 여러 나라가 나눠 쓰는 타이완·사할린 남부·관동주는 shared.mjs에 있다)
import { P, U, bx, ring } from '../lib.mjs';
import { KWANTUNG, SAKHALIN_S, TAIWAN } from '../shared.mjs';

const JAPAN_ISLANDS = ring([[128.3, 32.5], [130.0, 30.5], [132.0, 31.5], [133.5, 32.5], [135.5, 33.2], [137.5, 34.2], [139.5, 34.5], [141.0, 35.5], [141.3, 36.5], [141.3, 37.8], [140.5, 38.0], [139.8, 38.3], [139.3, 38.4], [138.0, 38.5], [136.5, 37.8], [135.0, 36.3], [133.3, 36.6], [132.0, 35.8], [130.8, 34.8], [129.2, 34.8]]);

// ── 7번 묶음 (1876 ~ 1945) ─────────────────────────────────
const RYUKYU = bx(123.0, 24.0, 131.5, 29.0);
const TOHOKU_N = bx(139.3, 38.2, 142.2, 41.6);
const HOKKAIDO = ring([[139.4, 41.3], [141.3, 41.3], [145.9, 43.2], [145.5, 44.4], [141.6, 45.7], [139.6, 43.3]]);
const JAPAN_1869 = U([JAPAN_ISLANDS], [TOHOKU_N], [HOKKAIDO]);
const JAPAN_1879 = U(JAPAN_1869, [RYUKYU]);
const JAPAN_1895 = U(JAPAN_1879, [TAIWAN]);
const JAPAN_1905 = U(JAPAN_1895, [SAKHALIN_S], [KWANTUNG]);

// 나라 id: [[from, to, 멀티폴리곤, 확실성?], ...]. to가 null이면 지금까지, 확실성은 'disputed' 등(없으면 'estimated').
// 출처(geojson의 source)는 나라별로 적지 않고 권역 파일의 source로 정한다(없으면 engine.mjs의 기본 문구)
export const versions = {
  wa: [[57, 701, P(JAPAN_ISLANDS)]],
  japan: [[701, 1869, P(JAPAN_ISLANDS)], [1869, 1879, JAPAN_1869], [1879, 1895, JAPAN_1879], [1895, 1905, JAPAN_1895], [1905, 1946, JAPAN_1905], [1946, 1972, JAPAN_1869], [1972, null, JAPAN_1879]],
  'ryukyu-us': [[1946, 1972, [[RYUKYU]]]],
};
