// 제1차 세계 대전 점령 지역 geojson 생성기 (scripts/wars, 사용: npm run gen:wars)
// 방법: 전선(경유점 선)으로 '한쪽' 다각형을 만들고, 그 다각형을 그 해 나라 영토(data/geo, 저장소 자료)와 겹쳐(교집합)
//   '어느 진영이 남의 땅을 차지했는가'만 남긴다. 중립국(네덜란드·스위스 등)은 영토 가리개로 저절로 빠진다.
// 출력: <data/wars>/world-war-1/<날짜>-<진영>.geojson (좌표 소수 넷째 자리). 경유점은 fronts.mjs, 장면 구성은 이 파일.
// 저장소 경로·--out은 engine.mjs가 명령줄에서 읽는다. YAML(eu-02-world-war-1.yaml)은 손으로 쓴 파일이라 이 생성기가 쓰지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import { G, REPO, RAW, WARS, entityCollection, resetDir, topo, writeGeojson } from '../engine.mjs';
import * as L from './fronts.mjs';

const { U, I, D } = RAW;
const xy = (pts) => pts.map((p) => [p[0], p[1]]);
const ring = (pts) => { const r = xy(pts); return [...r, r[0]]; };
const P = (...rings) => [rings.map(ring)];
const box = (w, s, e, n) => P([[w, s], [e, s], [e, n], [w, n]]);

// ── 나라 영토 (data/geo, to는 그 해를 빼는 끝) ──
const geoCache = new Map();
function T(id, year) {
  const key = `${id}@${year}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const fc = entityCollection(id);
  const f = fc.features.find((x) => x.properties.from <= year && year < (x.properties.to ?? 3000));
  let g = !f ? [] : f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  // 시베리아·극동은 빼고 계산한다 (날짜 변경선을 넘는 고리 때문)
  g = g.filter((poly) => !(poly[0].some(([x]) => x < -170) && poly[0].some(([x]) => x > 170)));
  if (g.length) g = I(g, box(-30, 25, 75, 80));
  geoCache.set(key, g);
  return g;
}
const W = (year, ...ids) => U(...ids.map((id) => T(id, year)).filter((g) => g.length));

// ── 행정구역 조각 (Natural Earth admin-1, 저장소 data/base/fragments) ──
const topoData = JSON.parse(fs.readFileSync(path.join(REPO, 'data/base/fragments/europe.topo.json'), 'utf8'));
const fragIds = new Map(topoData.objects.fragments.geometries.map((g) => [g.id, g]));
function F(...ids) {
  const geoms = ids.map((id) => { if (!fragIds.has(id)) throw new Error('조각 없음 ' + id); return fragIds.get(id); });
  const m = topo.merge(topoData, geoms);
  return m.type === 'Polygon' ? [m.coordinates] : m.coordinates;
}
const fragsOf = (adm0) => topoData.objects.fragments.geometries.filter((g) => g.properties.adm0 === adm0).map((g) => g.id);

// 갈리치아·부코비나 (오스트리아-헝가리 영토 가운데 현대 폴란드·우크라이나(자카르파티아 뺌)·루마니아 수체아바 쪽)
const AH14 = T('austria-hungary', 1914);
const GALBUK = I(AH14, F(...fragsOf('POL'), ...fragsOf('UKR').filter((x) => x !== 'UA-21'), 'RO-SV'));
// 1918년 우크라이나 국가(독일군 점령 지역)의 대략: 현대 우크라이나 + 스타로두브·노보지브코프 쪽 + 벨고로드 쪽 + 타간로크·로스토프 쪽
const UKR1918 = U(
  F(...fragsOf('UKR'), 'UA-43', 'UA-40'), // 크림·세바스토폴은 NE에서 adm0가 RUS
  P([[31.3, 52.15], [31.3, 52.75], [32.3, 52.95], [33.3, 52.6], [33.6, 52.2], [32.5, 52.0]]),
  P([[35.3, 51.15], [36.2, 51.0], [37.0, 50.8], [38.2, 50.35], [38.3, 50.0], [36.5, 50.2], [35.5, 50.6]]),
  P([[38.2, 47.1], [38.6, 47.6], [39.4, 47.55], [40.0, 47.45], [40.0, 47.0], [39.2, 46.9], [38.3, 46.9]]),
);

// ── 선으로 한쪽 다각형 만들기 ──
// line: 경유점, tail: 선 끝에서 시작점으로 돌아가는 바깥 점들 (선의 '안쪽'을 감싸도록)
const side = (line, tail) => P([...xy(line), ...tail]);
// 프랑스군이 차지한 독일 땅은 알자스·로렌 쪽에만 있다
const ALSACE_BOX = box(5.5, 47.3, 8.5, 49.6);
// 벨기에 앞바다: 영토 가리개에 더해 해안의 가는 띠가 남지 않게 한다 (빌드가 해안선으로 자름. 다른 나라 땅은 없음)
const SEA_BE = P([[2.3, 51.05], [3.0, 51.21], [3.36, 51.34], [3.36, 51.7], [2.3, 51.7]]);
const FRBE = (y) => U(W(y, 'france', 'belgium'), SEA_BE);

// 서부 전선: 선 동쪽(독일 쪽)
// 스위스 국경 끝점에서 스위스 땅(영토 가리개로 빠짐)을 지나 동쪽으로 돌아 독일 남부를 모두 넣는다
const westEast = (line) => side(line, [[7.5, 47.42], [9.0, 47.42], [10.5, 47.3], [10.5, 54.5], [3.0, 53.5], [line[0][0] - 0.3, line[0][1] + 0.4]]);
const westLine = (...segs) => segs.flat();
// 동부 전선: 선 서쪽(동맹국 쪽). 선은 북(발트해)에서 남(루마니아 국경)으로
const eastWest = (line) => {
  const last = line[line.length - 1], first = line[0];
  // 부코비나 끝(루마니아 국경)에서 끝나면 남부코비나가 선 서쪽에 들도록 루마니아 땅(가리개로 빠짐)을 지나 돌아온다
  const south = last[0] > 26 && last[0] < 26.3 && last[1] > 48.2 ? [[26.6, 48.18], [26.85, 47.9], [26.85, 47.2], [25.85, 46.5], [14, 46]] : [[last[0] - 0.3, 46.5], [14, 46]];
  // 리가만에서 시작하면 쿠를란트 북쪽 끝은 넣고 사레마섬(러시아)은 빼도록 이르베 해협으로 돌아온다
  const north = first[1] < 58 ? [[14, 56], [20.5, 57.0], [21.0, 57.9], [22.3, 57.85], [23.4, 57.5]] : [[14, 60], [first[0] - 1, first[1] + 1.5]];
  return side(line, [...south, ...north]);
};

// ── 지역 다각형 (손으로 그림, 근거와 오차는 결과 노트) ──
const circle = (cx, cy, rx, ry, n = 24) => P(Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((2 * Math.PI * i) / n), cy + ry * Math.sin((2 * Math.PI * i) / n)]));
const MAUBEUGE = circle(3.97, 50.28, 0.1, 0.065); // 모뵈주 요새 (9.7 함락)
const PRZEMYSL = circle(22.77, 49.79, 0.2, 0.13); // 프셰미실 요새 포위망 (1914.11.9 ~ 1915.3.22)
// 동프로이센의 러시아군 점령 지역
const EPRUSSIA_1914SEP = P([[21.0, 55.6], [21.1, 54.9], [21.13, 54.62], [21.3, 54.4], [21.4, 54.3], [21.75, 54.2], [21.82, 54.05], [22.1, 54.0], [22.6, 54.1], [23.2, 54.3], [23.2, 55.5]]);
const EPRUSSIA_1914DEC = P([[22.1, 55.4], [22.1, 55.1], [22.1, 54.75], [22.05, 54.45], [22.0, 54.25], [21.95, 54.0], [21.95, 53.75], [21.85, 53.55], [21.9, 53.4], [23.2, 53.4], [23.2, 55.4]]);
// 1914.9.5 갈리치아 (리비우(렘베르크) 9.3 함락, 그로데크선 동쪽이 러시아군) — 대략
const GALICIA_1914SEP = P([[23.55, 50.5], [23.6, 50.2], [23.7, 49.85], [23.95, 49.55], [24.4, 49.25], [24.65, 49.05], [24.6, 48.85], [24.8, 48.5], [25.2, 48.1], [25.6, 47.9], [26.0, 47.95], [26.6, 48.15], [27.5, 49.0], [26.5, 51.0]]);
// 1914.9.5 러시아령 폴란드의 동맹국 점령 지역 (서부 국경 지대 + 루블린 남쪽) — 대략
const POLAND_1914SEP = P([[17.5, 52.6], [18.2, 52.4], [18.6, 52.0], [18.9, 51.6], [19.4, 51.2], [20.2, 51.0], [20.7, 50.95], [21.4, 50.85], [21.85, 50.88], [21.95, 51.0], [22.5, 51.1], [23.0, 51.0], [23.3, 50.8], [23.55, 50.5], [23.6, 50.25], [22.0, 49.5], [18.0, 49.5]]);
// 1914.12.31 폴란드 전선 (니다강 ~ 피리차강 ~ 라프카강 ~ 브주라강, 북쪽은 므와바 부근) — 대략
const POLAND_1914DEC_LINE = [[20.1, 53.25], [20.0, 52.85], [19.75, 52.6], [20.2, 52.39], [20.25, 52.23], [20.16, 52.08], [20.08, 51.95], [20.2, 51.77], [20.22, 51.53], [20.3, 51.38], [20.45, 51.19], [20.7, 50.95], [20.55, 50.75], [20.52, 50.52], [20.7, 50.35], [20.81, 50.3], [20.73, 50.235], [20.85, 50.08], [20.84, 49.96], [20.81, 49.86], [20.95, 49.75], [21.14, 49.66], [21.2, 49.5], [21.3, 49.0]];
const POLAND_1914DEC = side(POLAND_1914DEC_LINE, [[18, 48.8], [17, 53.5], [20.1, 53.6]]);
// 1915.4.25: 수바우키 쪽 독일군 점령 지역이 더해짐 (2차 마주리 호수 전투 뒤) — 대략
const POLAND_1915APR_LINE = [[21.07, 55.88], [21.6, 55.6], [22.0, 55.25], [22.6, 55.05], [23.2, 54.8], [23.35, 54.55], [23.4, 54.25], [23.25, 54.0], [23.0, 53.85], [22.7, 53.65], [22.3, 53.45], [21.95, 53.4], [21.0, 53.3], [20.6, 53.2], [20.6, 53.05], [20.3, 52.95], [19.9, 52.7], [19.75, 52.6], ...POLAND_1914DEC_LINE.slice(3)];
const POLAND_1915APR = side(POLAND_1915APR_LINE, [[18, 48.8], [17, 56], [21.0, 56.0]]);
// 1915.4.25 갈리치아: 러시아군은 두나예츠강 동쪽, 프셰미실 함락(3.22). 부코비나·포쿠티아는 오스트리아-헝가리군 (2월 반격) — 대략
const GALICIA_1915APR_S = P([[24.0, 48.7], [24.4, 48.75], [24.75, 48.7], [25.1, 48.6], [25.5, 48.7], [25.75, 48.65], [26.1, 48.6], [26.4, 48.55], [27.5, 47.5], [24.0, 47.5]]);

// 이탈리아 전선: 이탈리아군이 차지한 오스트리아-헝가리 땅 (선의 서쪽·남쪽, AH 영토로 자름)
const ISONZO_1915 = P([[13.0, 46.6], [13.47, 46.4], [13.6, 46.36], [13.66, 46.285], [13.7, 46.23], [13.705, 46.19], [13.665, 46.15], [13.63, 46.1], [13.605, 46.06], [13.6, 46.0], [13.585, 45.96], [13.535, 45.925], [13.51, 45.89], [13.525, 45.87], [13.525, 45.83], [13.545, 45.8], [13.56, 45.78], [13.5, 45.6], [12.5, 45.6]]);
const ISONZO_1916 = P([[13.0, 46.6], [13.47, 46.4], [13.6, 46.36], [13.66, 46.285], [13.7, 46.23], [13.705, 46.19], [13.665, 46.15], [13.63, 46.1], [13.605, 46.06], [13.625, 45.99], [13.645, 45.955], [13.665, 45.92], [13.635, 45.88], [13.625, 45.85], [13.6, 45.82], [13.59, 45.79], [13.575, 45.778], [13.5, 45.6], [12.5, 45.6]]);
const ISONZO_1917 = P([[13.0, 46.6], [13.47, 46.4], [13.6, 46.36], [13.66, 46.285], [13.7, 46.23], [13.705, 46.19], [13.72, 46.13], [13.78, 46.1], [13.82, 46.05], [13.78, 46.0], [13.7, 45.975], [13.665, 45.94], [13.672, 45.91], [13.655, 45.86], [13.615, 45.81], [13.595, 45.79], [13.585, 45.778], [13.5, 45.6], [12.5, 45.6]]);
// 트렌티노·카도레에서 이탈리아군이 차지한 땅 (1915~): 콘디노·레드로, 알라·주냐(발라가리나), 발수가나 아래쪽, 코르티나담페초
const TRENTINO_GAINS = U(
  P([[10.35, 45.7], [10.45, 45.8], [10.62, 45.92], [10.75, 45.92], [10.8, 45.88], [10.75, 45.7]]), // 콘디노·레드로 계곡 남쪽
  P([[10.8, 45.6], [10.85, 45.72], [10.97, 45.84], [11.06, 45.835], [11.12, 45.8], [11.15, 45.6]]), // 알라·세라발레 (로베레토 남쪽)
  P([[11.55, 45.95], [11.52, 46.03], [11.62, 46.06], [11.72, 46.02], [11.75, 45.95]]), // 발수가나 (그리뇨·스트리뇨 남쪽, 1916.5 뒤)
  P([[12.0, 46.42], [11.98, 46.52], [12.1, 46.6], [12.25, 46.62], [12.32, 46.5], [12.2, 46.45]]), // 코르티나담페초 (1915.5 ~ 1917.11)
);
// 1915.8 ~ 1916.5: 발수가나에서 보르고까지 나아갔을 때
const VALSUGANA_1915 = P([[11.42, 45.97], [11.4, 46.04], [11.5, 46.09], [11.72, 46.06], [11.75, 45.95]]);
const TRENTINO_GAINS_1917NOV = U(
  P([[10.35, 45.7], [10.45, 45.8], [10.62, 45.92], [10.75, 45.92], [10.8, 45.88], [10.75, 45.7]]),
  P([[10.8, 45.6], [10.85, 45.72], [10.97, 45.84], [11.06, 45.835], [11.12, 45.8], [11.15, 45.6]]),
);
// 1916년 징벌 원정 뒤 오스트리아-헝가리군이 차지한 아시아고 고원 북쪽 (이탈리아 땅) — 대략
const ASIAGO_1916 = P([[11.3, 45.9], [11.42, 45.915], [11.5, 45.9], [11.58, 45.91], [11.62, 45.95], [11.6, 46.05], [11.3, 46.05]]);
// 피아베강 선 (1917.11 ~ 1918.10): 아시아고 고원 ~ 그라파산 ~ 피아베강 ~ 바다. 북동쪽이 동맹국
const PIAVE_LINE = [[11.4, 45.86], [11.5, 45.85], [11.6, 45.84], [11.66, 45.85], [11.73, 45.88], [11.8, 45.885], [11.88, 45.89], [11.94, 45.88], [12.05, 45.86], [12.21, 45.82], [12.35, 45.77], [12.46, 45.72], [12.57, 45.63], [12.65, 45.57], [12.72, 45.535], [12.8, 45.45]];
const PIAVE = side(PIAVE_LINE, [[14.0, 45.3], [14.5, 47.0], [11.3, 47.0], [11.3, 46.2], [11.38, 45.95]]);

// 발칸
// 살로니카 전선 (1916.11 ~ 1918.9): 블로러 북쪽 ~ 코르처 ~ 프레스파호 ~ 비톨라 북쪽 ~ 카이막찰란 ~ 도브로폴레 ~ 게브겔리야 남쪽 ~ 도이란호 남쪽 ~ 루펠 ~ 스트루마강. 북·동쪽이 동맹국
const SALONIKA_LINE = [[19.38, 40.68], [19.7, 40.55], [20.02, 40.3], [20.35, 40.25], [20.6, 40.42], [20.7, 40.55], [20.75, 40.75], [20.9, 40.85], [21.1, 40.95], [21.27, 41.07], [21.45, 41.1], [21.65, 41.05], [21.8, 40.99], [21.9, 41.06], [22.1, 41.06], [22.35, 41.1], [22.52, 41.11], [22.7, 41.16], [22.9, 41.2], [23.1, 41.25], [23.27, 41.26], [23.35, 41.1], [23.5, 40.95], [23.7, 40.85], [23.86, 40.78], [24.2, 40.84], [24.5, 40.9], [25.0, 40.88]];
const SALONIKA_N = side(SALONIKA_LINE, [[27, 40.9], [27, 45], [18.5, 45], [18.5, 41.0]]);
const SALONIKA_S = side(SALONIKA_LINE, [[25.0, 34.5], [19.0, 34.5], [19.0, 40.6]]);
// 1915.12 ~ 1916.2 살로니카 진지 (연합군이 그리스 땅 테살로니키 둘레에 세운 진지) — 대략
const SALONIKA_CAMP = P([[22.45, 40.45], [22.58, 40.78], [22.85, 40.88], [23.1, 40.8], [23.45, 40.74], [23.72, 40.7], [23.85, 40.55], [23.0, 40.3]]);
// 그리스: 1916.12 ~ 1917.6 연합국·베니젤로스 정부 쪽 (마케도니아 서쪽, 크레타, 북에게해 섬들) — 대략
const GREECE_ENTENTE_1916 = U(
  I(SALONIKA_S, P([[20.6, 40.3], [21.8, 40.15], [22.7, 40.2], [24.2, 40.4], [24.2, 41.6], [20.6, 41.6]])),
  box(23.4, 34.7, 26.5, 35.75), // 크레타
  box(24.9, 39.7, 25.5, 40.1), // 림노스 (무드로스)
  box(25.8, 38.9, 26.7, 39.5), // 레스보스
  box(25.8, 38.1, 26.2, 38.65), // 히오스
  box(26.5, 37.6, 27.1, 37.85), // 사모스
);
// 그리스: 1915.12 테살로니키 진지와 에게해 섬(연합군 기지)
const GREECE_ENTENTE_1915 = U(SALONIKA_CAMP, box(24.9, 39.7, 25.5, 40.1));
// 알바니아·몬테네그로
const VLORE_1914 = P([[19.25, 40.62], [19.6, 40.6], [19.7, 40.4], [19.55, 40.2], [19.2, 40.3]]); // 블로러 (1914.12 이탈리아 점령)
const DURRES_1916 = circle(19.46, 41.32, 0.09, 0.07); // 두러스 이탈리아군 교두보 (1916.2.26까지)
const ALBANIA_N_1916FEB = P([[19.2, 41.06], [19.45, 41.06], [19.8, 41.1], [20.08, 41.08], [20.6, 41.1], [20.6, 43.0], [19.2, 43.0]]); // 시쿰빈강 북쪽
const MONTENEGRO_N_1915DEC = P([[18.9, 43.6], [19.1, 43.5], [19.3, 43.2], [19.65, 42.95], [19.9, 42.75], [20.05, 42.6], [20.25, 42.35], [20.5, 42.1], [21.0, 42.1], [21.0, 43.6]]); // 산자크·메토히야 (1915.12 동맹국 점령) — 대략

// 갈리폴리 교두보 (연합군)
const HELLES = P([[26.13, 40.03], [26.2, 40.0], [26.27, 40.03], [26.27, 40.07], [26.24, 40.085], [26.205, 40.09], [26.13, 40.09]]);
const ANZAC = P([[26.24, 40.22], [26.275, 40.22], [26.295, 40.235], [26.3, 40.255], [26.285, 40.27], [26.24, 40.27]]);
const SUVLA = P([[26.2, 40.27], [26.285, 40.27], [26.31, 40.3], [26.34, 40.335], [26.3, 40.36], [26.2, 40.36]]);

// 캅카스 전선: 러시아군이 차지한 오스만 땅 (선 동쪽)
const CAUC_1916FEB = P([[41.3, 42.0], [41.3, 41.4], [41.0, 40.9], [40.95, 40.48], [40.85, 40.15], [40.9, 39.75], [41.2, 39.3], [41.3, 38.8], [41.6, 38.58], [42.2, 38.55], [42.5, 38.4], [43.2, 38.25], [43.7, 38.0], [44.3, 37.75], [46, 37.5], [46, 42.5]]);
const CAUC_1916DEC = P([[38.95, 41.6], [38.95, 41.1], [39.3, 40.7], [39.4, 40.4], [39.3, 40.0], [39.2, 39.72], [39.45, 39.45], [40.3, 39.25], [40.9, 39.05], [41.3, 38.8], [41.8, 38.45], [42.0, 38.3], [42.5, 38.3], [43.2, 38.1], [44.0, 37.8], [46, 37.5], [46, 42.5], [41.5, 42.0]]);
// 1914.11 ~ 1915: 러시아군이 차지한 동아나톨리아 국경 띠 (쾨프뤼쾨이 동쪽·엘레슈키르트 골짜기·아으르·도우베야즈트) — 대략
const CAUC_1914 = P([[42.3, 40.45], [41.95, 39.97], [42.4, 39.8], [42.9, 39.6], [44.1, 39.4], [44.7, 39.6], [44.2, 40.3], [43.0, 40.6]]);
// 1918.7 ~ 11 오스만군이 차지한 캅카스 남쪽 (브레스트-리토프스크·바투미 조약의 바투미·아르다한·카르스, 알렉산드로폴·수르말루·나히체반). 독일 보호 아래의 조지아와 아제르바이잔은 칠하지 않음 — 대략
const CAUC_1918 = P([[41.0, 41.5], [41.55, 41.9], [42.2, 41.85], [42.6, 41.6], [43.2, 41.3], [43.9, 41.28], [44.05, 40.95], [44.25, 40.7], [44.05, 40.4], [43.8, 40.15], [44.3, 40.0], [44.8, 39.85], [45.3, 39.55], [45.8, 39.3], [46.2, 38.9], [46.2, 38.82], [45.4, 39.05], [44.8, 39.5], [44.3, 39.4], [43.0, 39.55], [42.4, 39.7], [41.0, 40.2]]);
// (바쿠 1918.9.15 ~ 11.17 오스만군 점령: 11-11 장면에서 이웃 칠과 떨어진 섬처럼 보여 상자를 빼고, 전쟁 YAML의 holds 점 하나로 나타냄. 세션 K3, 2026-10-14)

// 루마니아
// 1916.12.6 (부쿠레슈티 함락): 왈라키아 서쪽·도브루자 남쪽이 동맹국 — 대략
const ROMANIA_1916DEC = U(
  side([[25.85, 45.45], [26.1, 45.2], [26.3, 44.95], [26.45, 44.75], [26.6, 44.55], [26.65, 44.4], [26.64, 44.08]], [[26.64, 43.6], [22, 43.0], [22, 46.5], [25.5, 46.0]]),
  side([[27.97, 44.66], [28.3, 44.7], [28.7, 44.72], [29.2, 44.72]], [[29.2, 43.0], [27.0, 43.0], [27.25, 43.95], [27.97, 44.2]]),
);
// 1917.1 ~ 1918.11 (마러셰슈티·시레트강 선): 오이투즈 ~ 포크샤니 ~ 시레트강 ~ 갈라치 서쪽 ~ 도나우강 ~ 성게오르기 하구. 남·서쪽이 동맹국
const ROMANIA_LINE_1917 = [[25.4, 47.3], [25.6, 46.9], [25.85, 46.55], [26.3, 46.22], [26.42, 46.17], [26.55, 46.0], [26.8, 45.9], [27.1, 45.75], [27.25, 45.68], [27.45, 45.55], [27.8, 45.45], [28.0, 45.42], [28.2, 45.38], [28.46, 45.31], [28.8, 45.22], [29.2, 45.1], [29.6, 44.88], [30.0, 44.8]];
const ROMANIA_1917 = side(ROMANIA_LINE_1917, [[30, 43.0], [22, 43.0], [22, 47.3]]);

// 에스토니아 서쪽 섬들 (1917.10 알비온 작전으로 독일군 점령)
const MOON_ISLANDS = P([[21.6, 57.85], [23.0, 57.85], [23.43, 58.5], [23.42, 58.7], [23.3, 58.9], [23.2, 59.15], [21.6, 59.15]]);

// ── 스냅샷별 점령 지역 ──
const out = {};
const add = (date, faction, geom, note) => { (out[date] ??= {})[faction] = { geom, note }; };

// 1914-09-05 마른 전투 직전
{
  const y = 1914;
  const occW = D(I(westEast(L.WEST_1914SEP), FRBE(y)), MAUBEUGE);
  add('1914-09-05', 'central', U(occW, I(POLAND_1914SEP, W(y, 'russia'))), '서부: 독일군 점령 벨기에·북프랑스(모뵈주 요새 제외), 동부: 러시아령 폴란드 서부와 루블린 남쪽 (대략)');
  add('1914-09-05', 'entente', I(D(ALSACE_BOX, westEast(L.WEST_1914SEP)), W(y, 'german-empire')), '프랑스군이 지킨 알자스 남부 (탄·당마리)');
  add('1914-09-05', 'russia', U(I(EPRUSSIA_1914SEP, W(y, 'german-empire')), I(GALICIA_1914SEP, GALBUK)), '러시아 제1군의 동프로이센 북동부, 동갈리치아·북부코비나 (대략)');
}
// 서부 전선만 바뀌는 스냅샷의 공통 처리
function westAreas(date, y, line) {
  const R = westEast(line);
  return { occ: I(R, FRBE(y)), alsace: I(D(ALSACE_BOX, R), W(y, y >= 1918 ? 'weimar-republic' : 'german-empire')) };
}
// 1914-12-31 참호전
{
  const y = 1914, d = '1914-12-31';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1914, L.FLANDERS_1914, L.ARTOIS_1914, L.SOMME_1915, L.NOYON_1915, L.CHEMIN_1915, L.CHAMPAGNE_1915, L.ARGONNE, L.VERDUN_1915, L.STMIHIEL, L.LORRAINE));
  add(d, 'central', U(w.occ, I(POLAND_1914DEC, W(y, 'russia')), I(PRZEMYSL, GALBUK)), '서부 참호선 동쪽, 러시아령 폴란드 서부 (브주라·라프카·니다강 서쪽), 프셰미실 요새');
  add(d, 'entente', w.alsace, '알자스 남부');
  add(d, 'russia', U(I(EPRUSSIA_1914DEC, W(y, 'german-empire')), D(D(GALBUK, POLAND_1914DEC), PRZEMYSL), I(CAUC_1914, W(y, 'ottoman'))), '동프로이센 동쪽 띠, 두나예츠강 동쪽 갈리치아·부코비나 (프셰미실 요새 제외), 동아나톨리아 국경 띠');
}
// 1915-04-25 갈리폴리 상륙
{
  const y = 1915, d = '1915-04-25';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1915, L.FLANDERS, L.ARTOIS_1914, L.SOMME_1915, L.NOYON_1915, L.CHEMIN_1915, L.CHAMPAGNE_1915, L.ARGONNE, L.VERDUN_1915, L.STMIHIEL, L.LORRAINE));
  add(d, 'central', U(w.occ, I(POLAND_1915APR, W(y, 'russia'))), '서부 참호선 동쪽, 러시아령 폴란드 서부와 수바우키 쪽');
  add(d, 'entente', U(w.alsace, I(U(HELLES, ANZAC), W(y, 'ottoman'))), '알자스 남부, 갈리폴리 헬레스·안작 교두보');
  add(d, 'russia', U(D(D(GALBUK, POLAND_1914DEC), GALICIA_1915APR_S), I(CAUC_1914, W(y, 'ottoman'))), '두나예츠강 동쪽 갈리치아 (프셰미실 3.22 함락), 남쪽 포쿠티아·부코비나는 제외, 동아나톨리아 국경 띠');
}
// 동부 1915년 가을 선
const EAST_1915 = [...L.EAST_1915_N, ...L.EAST_1915_S];
const EAST_1916 = [...L.EAST_1915_N, ...L.EAST_1916_S];
const EAST_1917 = [...L.RIGA_1917, ...L.EAST_1915_N.slice(15), ...L.EAST_1917_S];
// 1915-12-15 세르비아 점령
{
  const y = 1915, d = '1915-12-15';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1915, L.FLANDERS, L.ARTOIS_1915, L.SOMME_1915, L.NOYON_1915, L.CHEMIN_1915, L.CHAMPAGNE_1916, L.ARGONNE, L.VERDUN_1915, L.STMIHIEL, L.LORRAINE));
  const E = eastWest(EAST_1915);
  add(d, 'central', U(w.occ, I(E, W(y, 'russia')), W(y, 'serbia'), I(MONTENEGRO_N_1915DEC, W(y, 'montenegro'))), '서부 참호선 동쪽, 동부 대후퇴선 서쪽, 세르비아 전역과 몬테네그로 북동부');
  add(d, 'entente', U(w.alsace, I(U(ISONZO_1915, TRENTINO_GAINS, VALSUGANA_1915), W(y, 'austria-hungary')), I(U(HELLES, ANZAC, SUVLA), W(y, 'ottoman')), I(GREECE_ENTENTE_1915, W(y, 'greece')), I(VLORE_1914, W(y, 'albania'))), '알자스 남부, 이손초·트렌티노의 이탈리아군 점령 지역, 갈리폴리 교두보, 테살로니키 진지, 블로러');
  add(d, 'russia', U(D(GALBUK, E), I(CAUC_1914, W(y, 'ottoman'))), '동갈리치아 동쪽 끝 (테르노필·즈바라시 쪽), 동아나톨리아 국경 띠');
}
// 1916-02-21 베르됭 전투
{
  const y = 1916, d = '1916-02-21';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1915, L.FLANDERS, L.ARTOIS_1915, L.SOMME_1915, L.NOYON_1915, L.CHEMIN_1915, L.CHAMPAGNE_1916, L.ARGONNE, L.VERDUN_1915, L.STMIHIEL, L.LORRAINE));
  const E = eastWest(EAST_1915);
  add(d, 'central', U(w.occ, I(E, W(y, 'russia')), W(y, 'serbia', 'montenegro'), D(I(ALBANIA_N_1916FEB, W(y, 'albania')), DURRES_1916)), '서부 참호선 동쪽, 동부 대후퇴선 서쪽, 세르비아·몬테네그로, 알바니아 북부·중부');
  add(d, 'entente', U(w.alsace, I(U(ISONZO_1915, TRENTINO_GAINS, VALSUGANA_1915), W(y, 'austria-hungary')), I(GREECE_ENTENTE_1915, W(y, 'greece')), I(U(VLORE_1914, DURRES_1916), W(y, 'albania'))), '알자스 남부, 이탈리아군 점령 지역, 테살로니키 진지, 블로러·두러스');
  add(d, 'russia', U(D(GALBUK, E), I(CAUC_1916FEB, W(y, 'ottoman'))), '동갈리치아 동쪽 끝, 에르주룸(2.16)·무시 등 동아나톨리아');
}
// 1916-12-06 부쿠레슈티 함락
{
  const y = 1916, d = '1916-12-06';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1915, L.FLANDERS, L.ARTOIS_1915, L.SOMME_1916, L.NOYON_FROM_CHAULNES, L.CHEMIN_1915, L.CHAMPAGNE_1916, L.ARGONNE, L.VERDUN_1915.slice(0, 0), L.VERDUN_1916, L.STMIHIEL, L.LORRAINE));
  const E = eastWest(EAST_1916);
  add(d, 'central', U(w.occ, I(E, W(y, 'russia')), W(y, 'serbia', 'montenegro'), I(ROMANIA_1916DEC, W(y, 'romania')), I(ASIAGO_1916, W(y, 'italy')), I(SALONIKA_N, W(y, 'albania', 'greece'))), '서부 참호선 동쪽, 동부 선 서쪽, 세르비아·몬테네그로, 왈라키아·도브루자 남부, 아시아고 고원 북쪽, 알바니아 북부, 그리스 동마케도니아');
  add(d, 'entente', U(w.alsace, I(U(ISONZO_1916, TRENTINO_GAINS), W(y, 'austria-hungary')), I(SALONIKA_S, W(y, 'serbia', 'albania')), I(GREECE_ENTENTE_1916, W(y, 'greece'))), '알자스 남부, 고리치아까지의 이탈리아군 점령 지역, 비톨라 쪽 세르비아 땅, 알바니아 남부, 그리스 북부·섬');
  add(d, 'russia', U(D(GALBUK, E), I(CAUC_1916DEC, W(y, 'ottoman'))), '브루실로프 공세로 되찾은 동갈리치아·부코비나, 트라브존·에르진잔까지의 동아나톨리아');
}
// 1917-04-06 미국 참전
{
  const y = 1917, d = '1917-04-06';
  const w = westAreas(d, y, westLine(L.YSER, L.YPRES_1915, L.FLANDERS, L.ARTOIS_1915, L.HINDENBURG_1917, L.CHEMIN_1915, L.CHAMPAGNE_1916, L.ARGONNE, L.VERDUN_1916.slice(0, 5), L.VERDUN_1917A.slice(5), L.STMIHIEL, L.LORRAINE));
  const E = eastWest(EAST_1916);
  add(d, 'central', U(w.occ, I(E, W(y, 'russia')), W(y, 'serbia', 'montenegro'), I(ROMANIA_1917, W(y, 'romania')), I(ASIAGO_1916, W(y, 'italy')), I(SALONIKA_N, W(y, 'albania', 'greece'))), '힌덴부르크선 동쪽, 동부 선 서쪽, 세르비아·몬테네그로, 왈라키아·도브루자, 아시아고 북쪽, 알바니아 북부, 그리스 동마케도니아');
  add(d, 'entente', U(w.alsace, I(U(ISONZO_1916, TRENTINO_GAINS), W(y, 'austria-hungary')), I(SALONIKA_S, W(y, 'serbia', 'albania')), I(GREECE_ENTENTE_1916, W(y, 'greece'))), '알자스 남부, 이탈리아군 점령 지역, 비톨라 쪽, 알바니아 남부, 그리스 북부·섬');
  add(d, 'russia', U(D(GALBUK, E), I(CAUC_1916DEC, W(y, 'ottoman'))), '동갈리치아·부코비나, 동아나톨리아');
}
// 1917-11-12 카포레토 뒤
{
  const y = 1917, d = '1917-11-12';
  const w = westAreas(d, y, westLine(L.YSER.slice(0, 7), L.YPRES_1917, L.FLANDERS.slice(1), L.ARTOIS_1917, L.HINDENBURG_1917NOV, L.CHEMIN_1917B, L.CHAMPAGNE_1917, L.ARGONNE, L.VERDUN_1917, L.STMIHIEL, L.LORRAINE));
  const E = eastWest(EAST_1917);
  add(d, 'central', U(w.occ, I(E, W(y, 'russia')), I(MOON_ISLANDS, W(y, 'russia')), W(y, 'serbia', 'montenegro'), I(ROMANIA_1917, W(y, 'romania')), I(PIAVE, W(y, 'italy')), I(SALONIKA_N, W(y, 'albania', 'greece'))), '서부 선 동쪽, 리가·에스토니아 섬들, 동부 선 서쪽, 세르비아·몬테네그로, 루마니아 점령지, 피아베강 동쪽 이탈리아, 알바니아 북부, 그리스 동마케도니아');
  add(d, 'entente', U(w.alsace, I(TRENTINO_GAINS_1917NOV, W(y, 'austria-hungary')), I(SALONIKA_S, W(y, 'serbia', 'albania'))), '알자스 남부, 트렌티노 남쪽 끝, 비톨라 쪽, 알바니아 남부');
  add(d, 'russia', U(I(D(GALBUK, E), box(24, 49.6, 27, 51)), I(CAUC_1916DEC, W(y, 'ottoman'))), '브로디~즈바라시 사이 갈리치아 동쪽 끝(즈브루치강 남쪽은 국경이 곧 전선), 동아나톨리아');
}
// 1918년: 영토가 전쟁 뒤 나라(1918년 판)로 바뀌어, 오스트리아-헝가리 옛 땅(이탈리아·루마니아 1918년 판에 든 곳)을 따로 덮는다
const AH17 = T('austria-hungary', 1917);
const RU17 = T('russia', 1917);
function west1918(y, line) {
  const R = westEast(line);
  return { occ: I(R, FRBE(y)), alsace: I(D(ALSACE_BOX, R), W(y, 'weimar-republic')) };
}
const ROM_AH = (y) => I(W(y, 'romania'), AH17);
// 이탈리아 1918년 판에 든 옛 오스트리아-헝가리 땅(트렌티노·남티롤·트리에스테·이스트리아 등, 이탈리아군이 차지한 트렌티노 남쪽 끝은 뺌)과 피아베강 동쪽
const ITALY_AH = (y) => U(I(PIAVE, W(y, 'italy')), D(I(W(y, 'italy'), AH17), TRENTINO_GAINS_1917NOV)); // 트란실바니아·바나트·부코비나 (1918.12 전까지 헝가리·오스트리아 땅)
{
  const y = 1918, d = '1918-03-03';
  const w = west1918(y, westLine(L.YSER.slice(0, 7), L.YPRES_1917, L.FLANDERS.slice(1), L.ARTOIS_1917, L.CAMBRAI_1918, L.CHEMIN_1917B, L.CHAMPAGNE_1917, L.ARGONNE, L.VERDUN_1917, L.STMIHIEL, L.LORRAINE));
  const E = eastWest(L.EAST_1918MAR);
  add(d, 'central', U(w.occ, I(E, W(y, 'soviet-union', 'estonia')), ITALY_AH(y), ROM_AH(y), I(ROMANIA_1917, W(y, 'romania')), I(SALONIKA_N, W(y, 'albania', 'greece'))), '서부 선 동쪽, 나르바~프스코프~보브루이스크~키이우 서쪽, 피아베강 동쪽과 트렌티노·남티롤·트리에스테·이스트리아, 트란실바니아·왈라키아·도브루자, 살로니카 전선 북쪽');
  add(d, 'entente', U(w.alsace, I(SALONIKA_S, W(y, 'yugoslavia', 'albania'))), '알자스 남부, 비톨라 쪽, 알바니아 남부');
}
{
  const y = 1918, d = '1918-07-15';
  const w = west1918(y, L.WEST_1918JUL);
  const E = U(eastWest(L.EAST_1918_BY), UKR1918);
  add(d, 'central', U(w.occ, I(E, W(y, 'soviet-union')), I(CAUC_1918, W(y, 'soviet-union')), ITALY_AH(y), ROM_AH(y), I(ROMANIA_1917, W(y, 'romania')), I(SALONIKA_N, W(y, 'albania', 'greece'))), '서부 선 동쪽(춘계 공세 돌출부), 발트·벨라루스·우크라이나·크림·돈강 하류, 캅카스 남쪽, 피아베강 동쪽, 트란실바니아·왈라키아·도브루자, 살로니카 전선 북쪽');
  add(d, 'entente', U(w.alsace, I(SALONIKA_S, W(y, 'yugoslavia', 'albania'))), '알자스 남부, 비톨라 쪽, 알바니아 남부');
}
{
  const y = 1918, d = '1918-11-11';
  const w = west1918(y, L.WEST_1918NOV);
  const E = U(eastWest(L.EAST_1918_BY), UKR1918);
  add(d, 'central', U(w.occ, I(E, W(y, 'soviet-union')), I(CAUC_1918, W(y, 'soviet-union')), ROM_AH(y), I(ROMANIA_1917, W(y, 'romania'))), '휴전선 동쪽 벨기에, 동부 점령 지역(아직 철수 전), 캅카스 남쪽, 트란실바니아(12.1 루마니아와 합병 결의 전), 왈라키아(독일군 철수 중)');
  add(d, 'entente', w.alsace, '알자스 남부');
}

// ── 쓰기 ──
const round = (g) => G.roundCoords(g, 4);
const outDir = path.join(WARS, 'world-war-1');
resetDir(outDir);
const summary = [];
for (const [date, byF] of Object.entries(out)) {
  for (const [faction, { geom, note }] of Object.entries(byF)) {
    const g = round(geom).filter((poly) => poly[0].length >= 4);
    if (!g.length) { summary.push(`${date} ${faction}: 비어 있음`); continue; }
    const file = path.join(outDir, `${date}-${faction}.geojson`);
    writeGeojson(file, g, { war: 'world-war-1', date, faction, note, source: '경유점 선과 저장소 영토(data/geo)를 겹쳐 만든 근사. 근거·경유점은 W1 결과 노트' });
    summary.push(`${date} ${faction}: 조각 ${g.length}, 점 ${g.flat(2).length}, ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
}
console.log(summary.join('\n'));
