// 칼선·나눔선 근처 조각 목록 (RULES-TOOLS 작업 12, 2026-10-21): 조각을 나라에 나눠 줄 때 선 가까이 있는 조각을 하나씩 확인하게 한다(부다페스트 일, border.md 4절).
// 사용: npm run near:fragments -- [--region <지역>] (--lon <경도> | --lat <위도> | --line <파일> | --export <권역 파일>:<이름>) [--km <거리>] [--box 서,남,동,북] [--as-line] [--out <이름>]
//   --lon 110.5: 동경 110.5°선(경선), --lat 33: 북위 33°선(위선). 선은 조각 지역 범위(--box를 주면 그 상자) 안에서 긋는다
//   --line <파일>: [[경도, 위도], …] JSON이나 GeoJSON(LineString·MultiLineString·Polygon·MultiPolygon, Feature·FeatureCollection도 받음)
//   --export scripts/geo/areas/china.mjs:L_NORTH: 생성기 파일이 export한 이름(점 목록이면 선, 닫힌 링·폴리곤·멀티폴리곤이면 그 테두리. 그 파일을 import하므로 도형 계산 시간이 든다)
//   닫힌 링·폴리곤은 '안/밖'으로 나누고, --as-line이면 닫힌 링도 선으로 본다(왼쪽/오른쪽)
//   --km: 선에서 이 거리 안의 조각(기본 20), --region: scripts/fragments/regions.mjs의 지역(기본은 표의 default 지역)
// 출력: 몇 줄 요약(조각 수, 선이 지나는 조각 수, 두 쪽에 크게 걸친 조각)과 자세한 표 .cache/near-fragments/<이름>.md
//   표: 조각 id·이름·나라(adm0)·넓이(km²)·선까지 거리(km, 선이 조각을 지나면 0)·대부분이 있는 쪽과 그 비율(%)
//   쪽 비율: 경선·위선과 닫힌 도형은 polyclip 교집합 넓이로 정확히, 열린 선은 조각 안 격자 점(최대 약 900개)마다 가장 가까운 선분의 어느 쪽인지로 어림한다(진행 방향 기준 왼쪽/오른쪽)
// 거리는 그 자리 위도의 평면 근사(경도 × cos 위도, 1° = 111.32km)라 수십 km 안에서 쓸 만하다. 조각 파일은 lib.mjs의 loadFragments로 읽는다(생성기와 같은 좌표)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { areaKm2, bboxOf, inPolygon, interiorPoint, planarArea, polyclip } from './fragments/common.mjs';
import { FRAGMENT_REGIONS, defaultFragmentRegion } from './fragments/regions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.cache/near-fragments');
const USAGE = '사용: npm run near:fragments -- [--region <지역>] (--lon <경도> | --lat <위도> | --line <파일> | --export <권역 파일>:<이름>) [--km 20] [--box 서,남,동,북] [--as-line] [--out <이름>]';
const fail = (msg, code = 2) => { console.error(msg); process.exit(code); };
const t0 = performance.now();

// ── 인자 ─────────────────────────────────────────────
const o = { region: defaultFragmentRegion(), km: 20, asLine: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const val = () => (i + 1 < argv.length ? argv[++i] : fail(`${a} 뒤에 값이 없음\n${USAGE}`));
  if (a === '--region') o.region = val();
  else if (a === '--lon' || a === '--lat') { o.kind = a.slice(2); o.value = Number(val()); if (!Number.isFinite(o.value)) fail(`${a} 값이 수가 아님`); }
  else if (a === '--line') { o.kind = 'line'; o.file = val(); }
  else if (a === '--export') { o.kind = 'export'; o.spec = val(); }
  else if (a === '--km') { o.km = Number(val()); if (!(o.km > 0)) fail('--km은 양수'); }
  else if (a === '--box') { o.box = val().split(',').map(Number); if (o.box.length !== 4 || o.box.some((v) => !Number.isFinite(v))) fail('--box는 서,남,동,북 네 수'); }
  else if (a === '--as-line') o.asLine = true;
  else if (a === '--out') { o.out = val(); if (!/^[A-Za-z0-9._-]+$/.test(o.out)) fail('--out은 영문·숫자·._- 이름'); }
  else fail(`모르는 인자: ${a}\n${USAGE}`);
}
if (!o.kind) fail(`선을 주지 않음 (--lon·--lat·--line·--export 가운데 하나)\n${USAGE}`);
if (!Object.hasOwn(FRAGMENT_REGIONS, o.region)) fail(`모르는 조각 지역: ${o.region} (있는 지역: ${Object.keys(FRAGMENT_REGIONS).join(', ')})`);

const { loadFragments } = await import(pathToFileURL(path.join(ROOT, 'scripts/geo/lib.mjs')).href);
const set = loadFragments(o.region);
const domainBox = bboxOf(set.domain);
const range = o.box ?? domainBox;

// ── 선 만들기: lines(열린 선 목록), area(닫힌 도형, 멀티폴리곤), halfBox(경선·위선의 한쪽 상자) ─────
const isPt = (p) => Array.isArray(p) && p.length >= 2 && typeof p[0] === 'number' && typeof p[1] === 'number';
const depth = (v) => (isPt(v) ? 0 : Array.isArray(v) && v.length ? 1 + depth(v[0]) : -1);
const closed = (r) => r.length >= 4 && r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1];
let lines = [];
let area = null;
let halfBox = null;
let label, sides, outName;
const fmt = (v) => String(Math.round(v * 1e4) / 1e4);
function fromCoords(v, what) {
  const d = depth(v);
  if (d === 1) {
    if (closed(v) && !o.asLine) area = [[v.map((p) => [p[0], p[1]])]];
    else lines.push(v.map((p) => [p[0], p[1]]));
  } else if (d === 2) {
    if (v.every(closed) && !o.asLine) area = [v.map((r) => r.map((p) => [p[0], p[1]]))];
    else lines.push(...v.map((l) => l.map((p) => [p[0], p[1]])));
  } else if (d === 3) {
    if (o.asLine) lines.push(...v.flat(1).map((l) => l.map((p) => [p[0], p[1]])));
    else area = v.map((poly) => poly.map((r) => r.map((p) => [p[0], p[1]])));
  } else fail(`${what}: 좌표 목록·링·폴리곤·멀티폴리곤이 아님`);
}
function fromGeoJSON(g, what) {
  if (Array.isArray(g)) return fromCoords(g, what);
  if (g?.type === 'FeatureCollection') return g.features.forEach((f) => fromGeoJSON(f, what));
  if (g?.type === 'Feature') return fromGeoJSON(g.geometry, what);
  if (g?.type === 'LineString') return lines.push(g.coordinates.map((p) => [p[0], p[1]]));
  if (g?.type === 'MultiLineString') return lines.push(...g.coordinates.map((l) => l.map((p) => [p[0], p[1]])));
  if (g?.type === 'Polygon') return fromCoords(g.coordinates, what);
  if (g?.type === 'MultiPolygon') return fromCoords(g.coordinates, what);
  fail(`${what}: 모르는 GeoJSON 꼴 ${g?.type}`);
}
if (o.kind === 'lon' || o.kind === 'lat') {
  const [w, s, e, n] = [range[0] - 1, range[1] - 1, range[2] + 1, range[3] + 1];
  if (o.kind === 'lon') {
    lines = [[[o.value, s], [o.value, n]]];
    halfBox = [[[w, s], [o.value, s], [o.value, n], [w, n], [w, s]]];
    label = `동경 ${o.value}°선`; sides = ['서', '동']; outName = `${o.region}-lon${o.value}`;
  } else {
    lines = [[[w, o.value], [e, o.value]]];
    halfBox = [[[w, s], [e, s], [e, o.value], [w, o.value], [w, s]]];
    label = `북위 ${o.value}°선`; sides = ['남', '북']; outName = `${o.region}-lat${o.value}`;
  }
} else if (o.kind === 'line') {
  const file = path.resolve(o.file);
  if (!existsSync(file)) fail(`파일이 없음: ${o.file}`);
  let g;
  try { g = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { fail(`JSON이 아님: ${o.file} (${e.message})`); }
  fromGeoJSON(g, o.file);
  label = `선 파일 ${path.basename(o.file)}`; outName = `${o.region}-line-${path.basename(o.file).replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9._-]/g, '_')}`;
} else {
  const at = o.spec.lastIndexOf(':');
  if (at <= 0) fail(`--export는 <권역 파일>:<이름> (받은 값 ${o.spec})`);
  const [file, name] = [path.resolve(ROOT, o.spec.slice(0, at)), o.spec.slice(at + 1)];
  if (!existsSync(file)) fail(`파일이 없음: ${o.spec.slice(0, at)}`);
  const mod = await import(pathToFileURL(file).href);
  if (!Object.hasOwn(mod, name)) fail(`${o.spec.slice(0, at)}가 ${name}을(를) export하지 않음`);
  fromCoords(mod[name], o.spec);
  label = `${path.basename(file)}의 ${name}`; outName = `${o.region}-${path.basename(file, '.mjs')}-${name}`;
}
if (area && lines.length) fail('닫힌 도형과 열린 선이 섞임: 한 가지만 주거나 --as-line');
if (area) {
  sides = ['안', '밖'];
  lines = area.flatMap((poly) => poly.map((r) => r));
} else if (!sides) sides = ['왼쪽', '오른쪽'];
lines = lines.filter((l) => l.length >= 2);
if (!lines.length) fail('선에 점이 둘 이상인 선분이 없음');
if (o.out) outName = o.out;

// ── 거리: 그 자리 위도의 평면 근사 ─────────────────────────
const KM = 111.32;
const proj = (p, cos) => [p[0] * cos * KM, p[1] * KM];
function ptSegKm(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const crosses = (a, b, c, d) => {
  const d1 = orient(a, b, c), d2 = orient(a, b, d), d3 = orient(c, d, a), d4 = orient(c, d, b);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
};
const segSegKm = (a, b, c, d) => (crosses(a, b, c, d) ? 0 : Math.min(ptSegKm(a, c, d), ptSegKm(b, c, d), ptSegKm(c, a, b), ptSegKm(d, a, b)));
const lineSegs = lines.flatMap((l) => l.slice(1).map((p, k) => [l[k], p]));
const segBox = lineSegs.map(([a, b]) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
function distanceKm(multi, box) {
  const lat = (box[1] + box[3]) / 2, cos = Math.max(0.05, Math.cos((lat * Math.PI) / 180));
  const mx = o.km / (KM * cos), my = o.km / KM;
  const near = lineSegs.filter((_, i) => !(segBox[i][0] > box[2] + mx || segBox[i][2] < box[0] - mx || segBox[i][1] > box[3] + my || segBox[i][3] < box[1] - my));
  if (!near.length) return Infinity;
  // 선 위 점이 조각 안에 있으면 0 (선이 조각 안에서 시작·끝나는 경우)
  if (near.some(([a]) => multi.some((poly) => inPolygon(a, poly)))) return 0;
  const L = near.map(([a, b]) => [proj(a, cos), proj(b, cos)]);
  let best = Infinity;
  for (const poly of multi) for (const r of poly) for (let k = 0; k + 1 < r.length; k++) {
    const a = proj(r[k], cos), b = proj(r[k + 1], cos);
    for (const [c, d] of L) { const v = segSegKm(a, b, c, d); if (v < best) { best = v; if (best === 0) return 0; } }
  }
  return best;
}

// ── 쪽 비율 ───────────────────────────────────────────
// 열린 선: 점에서 가장 가까운 선분이 정한다. 가장 가까운 곳이 선 가운데의 꺾인 점이면 꺾임의 바깥쪽(왼쪽으로 꺾이면 오른쪽)이다
function sideOfPoint(p) {
  const cos = Math.max(0.05, Math.cos((p[1] * Math.PI) / 180));
  let best = null;
  for (const l of lines) for (let k = 0; k + 1 < l.length; k++) {
    const a = l[k], b = l[k + 1];
    const ax = a[0] * cos, bx = b[0] * cos, px = p[0] * cos;
    const dx = bx - ax, dy = b[1] - a[1], len2 = dx * dx + dy * dy;
    const t = len2 ? ((px - ax) * dx + (p[1] - a[1]) * dy) / len2 : 0;
    const tc = Math.max(0, Math.min(1, t));
    const d = Math.hypot(px - (ax + tc * dx), p[1] - (a[1] + tc * dy));
    if (!best || d < best.d) best = { d, l, k, t };
  }
  const { l, k, t } = best;
  const cr = (a, b, q) => (b[0] - a[0]) * cos * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]) * cos;
  let s;
  if (t > 0 && t < 1) s = cr(l[k], l[k + 1], p);
  else {
    const v = t <= 0 ? k : k + 1; // 가장 가까운 꼭짓점
    if (v === 0 || v === l.length - 1) s = cr(l[Math.max(0, v - 1)], l[Math.max(1, v)], p); // 선 끝: 끝 선분을 늘인 선의 어느 쪽
    else {
      const s1 = cr(l[v - 1], l[v], p), s2 = cr(l[v], l[v + 1], p);
      s = Math.sign(s1) === Math.sign(s2) ? s1 : -cr(l[v - 1], l[v], l[v + 1]);
    }
  }
  return s > 0 ? 0 : 1; // 0 = 왼쪽, 1 = 오른쪽
}
function shareOf(multi, box) {
  const all = planarArea(multi);
  if (halfBox || area) {
    const part = planarArea(polyclip.intersection(multi, halfBox ?? area));
    return all > 0 ? part / all : 0;
  }
  const N = 30, pts = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const p = [box[0] + ((i + 0.5) * (box[2] - box[0])) / N, box[1] + ((j + 0.5) * (box[3] - box[1])) / N];
    if (multi.some((poly) => inPolygon(p, poly))) pts.push(p);
  }
  if (!pts.length) pts.push(...multi.map((poly) => interiorPoint(poly)));
  return pts.filter((p) => sideOfPoint(p) === 0).length / pts.length;
}

// ── 조각마다 ──────────────────────────────────────────
const rows = [];
for (const id of set.ids) {
  const multi = set.F(id);
  const box = bboxOf(multi);
  if (o.box && (box[0] > o.box[2] || box[2] < o.box[0] || box[1] > o.box[3] || box[3] < o.box[1])) continue;
  const km = distanceKm(multi, box);
  if (!(km <= o.km)) continue;
  const first = shareOf(multi, box); // sides[0] 쪽 비율
  const props = set.props.get(id);
  rows.push({ id, name: props.name ?? '', adm0: props.adm0 ?? '', km2: areaKm2(multi), km, first });
}
rows.sort((a, b) => a.km - b.km || (a.id < b.id ? -1 : 1));
const pct = (v) => `${Math.round(v * 100)}%`;
const major = (r) => (r.first >= 0.5 ? [sides[0], r.first] : [sides[1], 1 - r.first]);
const split = rows.filter((r) => Math.min(r.first, 1 - r.first) >= 0.1).sort((a, b) => Math.abs(a.first - 0.5) - Math.abs(b.first - 0.5));

// ── 쓰기와 요약 ─────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
const outFile = path.join(OUT_DIR, `${outName}.md`);
const cell = (v) => String(v).replaceAll('|', '\\|');
const md = [
  `# 선 근처 조각: ${o.region} · ${label} · ${o.km}km 안`, '',
  `- 명령: \`npm run near:fragments -- ${argv.join(' ')}\``,
  `- 쪽: ${sides.join('/')}${sides[0] === '왼쪽' ? '(선의 진행 방향 기준, 첫 점 ' + lines[0][0].map(fmt).join(',') + ' → 끝 점 ' + lines.at(-1).at(-1).map(fmt).join(',') + ')' : ''}. 비율은 ${halfBox || area ? 'polyclip 교집합 넓이' : '조각 안 격자 점의 몫(어림)'}`,
  `- 조각 ${rows.length}개 (선이 지나는 조각 ${rows.filter((r) => r.km === 0).length}개, 두 쪽에 10% 넘게 걸친 조각 ${split.length}개). 거리는 그 자리 위도의 평면 근사`, '',
  '| 조각 id | 이름 | 나라 | 넓이 km² | 선까지 km | 대부분 | 비율 |', '|---|---|---|---|---|---|---|',
  ...rows.map((r) => { const [s, v] = major(r); return `| \`${r.id}\` | ${cell(r.name)} | ${r.adm0} | ${Math.round(r.km2).toLocaleString('en-US')} | ${r.km.toFixed(1)} | ${s} | ${pct(v)} |`; }),
  '',
].join('\n');
writeFileSync(outFile, md);
console.log(`near:fragments ${o.region} · ${label}: ${o.km}km 안 조각 ${rows.length}개 (선이 지나는 조각 ${rows.filter((r) => r.km === 0).length}개), ${((performance.now() - t0) / 1000).toFixed(1)}초`);
console.log(`  두 쪽에 10% 넘게 걸친 조각 ${split.length}개${split.length ? ': ' + split.slice(0, 8).map((r) => `${r.id} ${r.name} ${sides[0]} ${pct(r.first)}`).join(', ') + (split.length > 8 ? ' …' : '') : ''}`);
console.log(`  자세한 표: ${path.relative(ROOT, outFile).replaceAll('\\', '/')}`);
