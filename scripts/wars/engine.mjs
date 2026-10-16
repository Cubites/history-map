// 전쟁 보기 생성기 공통 엔진 (docs/guides/war.md 2절, standards.md 8절).
// 점령 지역 geojson과 전쟁 YAML 일부를 만드는 네 생성기(world-war-1, world-war-2/europe·asia-pacific·overview)가 함께 쓰는 도우미를 한 벌로 둔다.
//   - 저장소 경로 처리: 명령줄 `[저장소 경로] [--out 폴더] [--only 이름,...]` (환경 변수에 기대지 않음)
//   - 저장소 코드·모듈 읽기(geo.ts, polyclip-ts, topojson-client, yaml), 나라 영토(data/geo)·나라 경계(world-atlas)·육지 읽기
//   - 도형 도우미(합집합·교집합·차집합·경유점 다각형·상자·껍질 안 나라 고르기), 반올림, geojson 쓰기, YAML 줄 쓰기
// 이 파일을 불러오면 명령줄을 읽고 저장소를 정한다(생성기마다 따로 쓰는 `--only` 외의 모르는 옵션은 오류).
//
// 결과가 한 바이트라도 달라지면 안 되므로, 생성기마다 방식이 달랐던 부분은 하나로 합치지 않고 옵션·별도 함수로 남겼다(각 함수 주석 참고).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs, SCRIPT_REPO } from './args.mjs';
export { parseArgs, SCRIPT_REPO };

// ── 명령줄과 저장소 경로 (args.mjs) ─────────────────────────

export const ARGS = parseArgs(process.argv.slice(2));
/** 저장소(입력 data/geo·data/base·scripts/build-data·node_modules를 읽는 곳) */
export const REPO = ARGS.repo ?? SCRIPT_REPO;
for (const f of ['package.json', 'data/geo', 'data/wars']) {
  if (!existsSync(path.join(REPO, f))) throw new Error(`저장소 폴더가 아님: ${REPO} (${f} 없음)`);
}
/** 전쟁 파일(data/wars)을 읽고 쓰는 곳. `--out 폴더`를 주면 `<폴더>/data/wars`(저장소 data/wars는 건드리지 않음) */
export const WARS = ARGS.out ? path.join(ARGS.out, 'data', 'wars') : path.join(REPO, 'data', 'wars');
if (ARGS.out && !existsSync(WARS)) {
  // 생성기가 YAML의 기존 내용(예: 손으로 쓴 아시아·태평양 전역)을 읽으므로 data/wars 맨 위의 파일(YAML)만 복사해 시작한다. geojson 폴더는 비운 채 새로 만든다.
  mkdirSync(WARS, { recursive: true });
  const src = path.join(REPO, 'data', 'wars');
  for (const f of readdirSync(src)) if (statSync(path.join(src, f)).isFile()) copyFileSync(path.join(src, f), path.join(WARS, f));
}

// ── 저장소 코드와 모듈 ───────────────────────────────────────

export const repoModule = (rel) => import(pathToFileURL(path.join(REPO, rel)).href);
export const require = createRequire(path.join(REPO, 'package.json'));
/** 저장소의 도형 계산(scripts/build-data/geo.ts) */
export const G = await repoModule('scripts/build-data/geo.ts');
export const polyclip = require('polyclip-ts');
export const topo = require('topojson-client');
export const parseYaml = require('yaml').parse;

// ── 도형 도우미 (MultiPolygon 좌표) ──────────────────────────

/** 빈 입력에 안전한 합집합·교집합·차집합 (world-war-2의 세 생성기가 씀). world-war-1은 원시판 RAW를 따로 씀 */
export const U = (...gs) => {
  const xs = gs.filter((g) => g && g.length);
  return xs.length === 0 ? [] : xs.length === 1 ? xs[0] : polyclip.union(...xs);
};
export const I = (a, b) => (a.length && b.length ? polyclip.intersection(a, b) : []);
export const D = (a, ...bs) => {
  const xs = bs.filter((g) => g && g.length);
  return a.length && xs.length ? polyclip.difference(a, ...xs) : a;
};
/** 빈 입력을 거르지 않는 polyclip 원시 연산: world-war-1 생성기가 처음부터 이 방식이라 그대로 둔다(단일 입력 합집합도 polyclip을 거침) */
export const RAW = {
  U: (...g) => (g.length ? polyclip.union(...g) : []),
  I: (a, b) => polyclip.intersection(a, b),
  D: (a, b) => polyclip.difference(a, b),
};
/** 경유점 → 고리 하나짜리 MultiPolygon */
export const P = (pts) => [[[...pts, pts[0]]]];
/** 서·남·동·북 상자 */
export const box = (w, s, e, n) => P([[w, s], [e, s], [e, n], [w, n]]);
export const overlaps = (b1, b2) => b1[0] <= b2[2] && b2[0] <= b1[2] && b1[1] <= b2[3] && b2[1] <= b1[3];

/** 볼록 껍질 */
export function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (const p of pts.reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// ── 나라 영토·나라 경계·육지 ─────────────────────────────────

const geoCache = new Map();
/** data/geo/<id>.geojson (한 번만 읽음) */
export function entityCollection(id) {
  let fc = geoCache.get(id);
  if (!fc) {
    fc = JSON.parse(readFileSync(path.join(REPO, 'data', 'geo', `${id}.geojson`), 'utf8'));
    geoCache.set(id, fc);
  }
  return fc;
}
/** 그 해(from <= year < to)에 걸친 영토 조각들(MultiPolygon 좌표 목록) */
export const terrParts = (id, year) =>
  entityCollection(id).features.filter((f) => f.properties.from <= year && (f.properties.to == null || year < f.properties.to)).map((f) => G.toMulti(f.geometry));
/** 나라 영토(해안선으로 자르기 전 원본). 그 해 영토가 없으면 오류 (world-war-2 europe) */
export function terr(id, year) {
  const parts = terrParts(id, year);
  if (!parts.length) throw new Error(`영토 없음: ${id} ${year}`);
  return parts.length === 1 ? parts[0] : G.union(...parts);
}
/** 위와 같되 그 해 영토가 없으면 [] (world-war-2 overview). 파일이 없으면 오류 */
export const terrOrEmpty = (id, year) => U(...terrParts(id, year));

/** Natural Earth 나라 경계(world-atlas) 피처 목록 */
export function loadCountries(scale = '50m') {
  const t = JSON.parse(readFileSync(require.resolve(`world-atlas/countries-${scale}.json`), 'utf8'));
  return topo.feature(t, t.objects.countries).features;
}
/** 나라 경계 표: [{ name, geom(MultiPolygon), bbox }] */
export function countryTable(scale = '50m') {
  const table = loadCountries(scale).map((f) => ({ name: f.properties.name, geom: G.toMulti(f.geometry) }));
  for (const c of table) c.bbox = G.bbox(c.geom);
  return table;
}
/** 나라 이름 찾기(없으면 오류) */
export const countryByName = (table, n) => {
  const c = table.find((x) => x.name === n);
  if (!c) throw new Error(`나라 없음: ${n}`);
  return c;
};
/** 육지(world-atlas land) 조각 목록. 빌드와 같이 날짜 변경선을 넘는 조각을 펴서 돌려준다(MultiPolygon의 폴리곤마다) */
export function loadLandPolygons(scale = '50m') {
  const t = JSON.parse(readFileSync(require.resolve(`world-atlas/land-${scale}.json`), 'utf8'));
  const fc = topo.feature(t, t.objects.land);
  return fc.features.flatMap((f) => G.toMulti(f.geometry)).flatMap(G.unwrapAntimeridian);
}

/** 껍질 hull 안에서 targets 나라와 바다만 남기는 함수를 만든다(다른 나라 땅과 protect를 뺌. ignore 나라는 빼지 않음).
 *  asia-pacific(foreignMap 없음)과 overview 식민지 바탕(foreignMap으로 외국 땅을 조금 부풀림)이 씀 */
export function makeRegion(table, { foreignMap = (g) => g } = {}) {
  return function region(hull, targets, protect = [], ignore = []) {
    targets.forEach((n) => countryByName(table, n));
    const hb = G.bbox(hull);
    // 다른 나라는 껍질보다 1도 넓은 네모로 잘라 뺀다 (껍질 가장자리와 겹친 변이 생기면 그 변을 따라 가는 띠가 남았다)
    const big = box(hb[0] - 1, hb[1] - 1, hb[2] + 1, hb[3] + 1);
    const foreign = table.filter((c) => !targets.includes(c.name) && !ignore.includes(c.name) && overlaps(c.bbox, hb)).map((c) => foreignMap(I(c.geom, big)));
    return D(hull, U(...foreign), ...protect);
  };
}

// ── 반올림·geojson 쓰기 ─────────────────────────────────────

/** 경위도 반올림 + 자기 자신과 합집합을 결과가 안 변할 때까지(최대 3번) — 반올림 뒤 퇴화 고리를 정리 (빌드의 polyclip이 퇴화한 고리에서 멈추지 않게) */
export function roundSafe(coords, digits = 3) {
  let c = G.roundCoords(coords, digits);
  for (let i = 0; i < 3; i++) {
    const before = JSON.stringify(c);
    c = G.roundCoords(polyclip.union(c), digits);
    if (JSON.stringify(c) === before) break;
  }
  return c;
}

/** geojson 파일 내용: MultiPolygon 피처 하나. props는 피처 properties */
export const geojsonText = (coords, props) => JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: props, geometry: { type: 'MultiPolygon', coordinates: coords } }] }) + '\n';
/** geojson 쓰기. digits를 주면 그 자리로 반올림해서 쓴다(안 주면 받은 좌표 그대로). 쓴 글자 수를 돌려준다 */
export function writeGeojson(file, coords, props, digits) {
  mkdirSync(path.dirname(file), { recursive: true });
  const text = geojsonText(digits == null ? coords : G.roundCoords(coords, digits), props);
  writeFileSync(file, text);
  return text;
}
/** 폴더를 비우고 다시 만든다(옛 판 파일이 남지 않게) */
export function resetDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

// ── YAML 줄 쓰기 (europe·overview가 같은 꼴을 씀) ─────────────

/** 값에 YAML 예약 글자가 있으면 JSON 따옴표로 */
export const q = (s) => (/[,:#{}\[\]"']|^[-?!&*|>%@`]/.test(s) ? JSON.stringify(s) : s);
export const pt = ([x, y]) => `[${+x.toFixed(2)}, ${+y.toFixed(2)}]`;
export const pts = (a) => `[${a.map(pt).join(', ')}]`;
/** 스냅샷의 arrows·holds 줄을 y에 더한다 (여덟 칸 들여쓰기) */
export function pushArrowsHolds(y, arrows, holds) {
  if (arrows?.length) {
    y.push('        arrows:');
    for (const a of arrows) y.push(`          - { faction: ${a.faction}, path: ${pts(a.path)}, label: ${q(a.label)} }`);
  }
  if (holds?.length) {
    y.push('        holds:');
    for (const h of holds) y.push(`          - { name: ${q(h.name)}, at: ${pt(h.at)}, faction: ${h.faction} }`);
  }
}
