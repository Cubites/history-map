// 행정구역 조각 스크립트의 공통 도우미 (DESIGN.md §5.2 '행정구역 조각'): prep-fragments·check-fragments·compare-cshapes가 함께 쓴다.
// 국경 생성기(scripts/geo)는 이 파일을 가져오지 않는다. 생성기의 조각 불러오기와 합치기는 scripts/geo/lib.mjs의 loadFragments다.
// 좌표는 [경도, 위도], 멀티폴리곤은 폴리곤 배열, 폴리곤은 링 배열(첫 링이 바깥), 링은 닫힌 점 배열이다.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import * as polyclip from 'polyclip-ts';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
export { polyclip };

// 격자(1e-4°, 소수 넷째 자리, 약 10m)에 맞추기. 국경 생성기 출력의 반올림(engine.mjs)과 같은 식이라 생성기를 거쳐도 꼭짓점이 흔들리지 않는다
export const snap = (v) => Math.round(v * 1e4) / 1e4;
const same = (p, q) => p[0] === q[0] && p[1] === q[1];

// 링의 부호 있는 넓이(제곱도, 반시계가 양수)
export function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return -a / 2;
}

// 링 정리: (round면) 격자에 맞추고, 연달아 같은 점과 되돌아가는 점(a, b, a의 b)을 빼고 닫는다. 점이 셋 미만이거나 넓이가 0이면 null
export function cleanRing(ring, round = true) {
  const pts = [];
  for (const p of ring) {
    const q = round ? [snap(p[0]), snap(p[1])] : [p[0], p[1]];
    if (pts.length && same(pts.at(-1), q)) continue;
    pts.push(q);
    while (pts.length >= 3 && same(pts.at(-3), pts.at(-1))) pts.length -= 2; // a, b, a → a
  }
  // 끝과 처음이 이어지는 곳의 같은 점·되돌아가는 점
  for (let changed = true; changed && pts.length >= 3; ) {
    changed = false;
    if (same(pts[0], pts.at(-1))) { pts.pop(); changed = true; continue; }
    if (same(pts.at(-1), pts[1])) { pts.shift(); pts.shift(); pts.unshift(pts.at(-1)); pts.pop(); changed = true; continue; } // 첫 점이 되돌아가는 점
    if (same(pts.at(-2), pts[0])) { pts.pop(); pts.pop(); changed = true; continue; } // 마지막 점이 되돌아가는 점
  }
  if (pts.length < 3 || ringArea([...pts, pts[0]]) === 0) return null;
  return [...pts, pts[0]];
}

// 멀티폴리곤 정리: 링마다 cleanRing, 바깥 링이 없어진 폴리곤은 뺀다. 링 방향은 바깥 링 시계, 구멍 반시계로 맞춘다
// (Natural Earth와 같은 방향. polyclip 결과는 반대라, 섞인 채로 위상화해 topojson merge로 이으면 링이 엉킨다)
const orient = (r, clockwise) => ((ringArea(r) < 0) === clockwise ? r : [...r].reverse());
export function cleanMulti(multi, round = true) {
  const out = [];
  for (const poly of multi) {
    const outer = cleanRing(poly[0], round);
    if (!outer) continue;
    out.push([orient(outer, true), ...poly.slice(1).map((r) => cleanRing(r, round)).filter(Boolean).map((r) => orient(r, false))]);
  }
  return out;
}

export const toMulti = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);

// 범위 상자 [서, 남, 동, 북]
export function bboxOf(multi) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const poly of multi) for (const [x, y] of poly[0] ?? []) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
  return b;
}
export const boxesApart = (p, q) => p[0] > q[2] || p[2] < q[0] || p[1] > q[3] || p[3] < q[1];

// 넓이·길이 (km², km). 넓이는 구면 위 경위도 사다리꼴을 변마다 더한다: R² Σ (λ₂ − λ₁)(sin φ₁ + sin φ₂) / 2.
// 변마다 더하므로 조각 넓이의 합과 합집합 넓이를 견줄 수 있다(빌드의 areaKm2는 폴리곤마다 평균 위도로 바꾸므로 폴리곤이 합쳐지면 값이 달라진다)
const KM = 111.32;
const R = 6371.0088;
const RAD = Math.PI / 180;
function ringKm2(r) {
  let s = 0;
  for (let i = 0; i + 1 < r.length; i++) s += (r[i + 1][0] - r[i][0]) * RAD * (Math.sin(r[i][1] * RAD) + Math.sin(r[i + 1][1] * RAD));
  return Math.abs((s * R * R) / 2);
}
export function areaKm2(multi) {
  let total = 0;
  for (const poly of multi) poly.forEach((r, i) => { total += i === 0 ? ringKm2(r) : -ringKm2(r); });
  return total;
}
// 평면 넓이(제곱도): 일직선 위 점을 빼거나 더해도 값이 같다(위 구면 식은 긴 변에서 가운데 점 하나로 1km²쯤 달라진다).
// 꼬임·겹침처럼 polyclip 결과와 견주는 검사에 쓰고, km²가 필요하면 localKm2로 그 자리 위도에서 바꾼다
export function planarArea(multi) {
  let total = 0;
  for (const poly of multi) poly.forEach((r, i) => { const a = Math.abs(ringArea(r)); total += i === 0 ? a : -a; });
  return total;
}
export const localKm2 = (deg2, lat) => deg2 * KM * KM * Math.cos((lat * Math.PI) / 180);
export const segKm = (a, b) => { const lat = ((a[1] + b[1]) / 2) * (Math.PI / 180); return Math.hypot((b[0] - a[0]) * Math.cos(lat), b[1] - a[1]) * KM; };
export const perimeterKm = (multi) => multi.reduce((s, poly) => s + poly.reduce((s2, r) => s2 + r.slice(1).reduce((s3, p, i) => s3 + segKm(r[i], p), 0), 0), 0);

// 경도 180°를 넘는 폴리곤 펴기: scripts/build-data/geo.ts의 unwrapAntimeridian과 같은 처리다(유라시아의 추코트카처럼 한 링 안에서 180°와 -180°를 오가면
// 평면 계산에서 지도 전체를 가로지르는 이음새가 생긴다). 링을 끊기지 않게 펴고(±360°), 한쪽으로 넘친 폴리곤은 반대쪽으로 옮긴 사본도 함께 돌려준다
export function unwrapAntimeridian(polygon) {
  const crosses = polygon.some((ring) => ring.some((p, i) => i > 0 && Math.abs(p[0] - ring[i - 1][0]) > 180));
  if (!crosses) return [polygon];
  const unwrapRing = (ring) => {
    let shift = 0;
    const out = ring.map((p, i) => {
      if (i > 0) {
        const d = p[0] - ring[i - 1][0];
        if (d > 180) shift -= 360;
        else if (d < -180) shift += 360;
      }
      return [p[0] + shift, p[1]];
    });
    return shift === 0 ? out : null;
  };
  const rings = polygon.map(unwrapRing);
  if (rings.some((r) => r === null)) return [polygon];
  const center = (r) => (Math.min(...r.map((p) => p[0])) + Math.max(...r.map((p) => p[0]))) / 2;
  const outerCenter = center(rings[0]);
  const aligned = rings.map((r) => {
    const k = Math.round((outerCenter - center(r)) / 360);
    return k === 0 ? r : r.map(([x, y]) => [x + 360 * k, y]);
  });
  const xs = aligned[0].map((p) => p[0]);
  const shiftAll = (d) => aligned.map((r) => r.map(([x, y]) => [x + d, y]));
  if (Math.max(...xs) > 180) return [aligned, shiftAll(-360)];
  if (Math.min(...xs) < -180) return [aligned, shiftAll(360)];
  return [aligned];
}

// world-atlas(Natural Earth 4.1.0, 퍼블릭 도메인)의 육지·나라. 빌드가 해안선으로 자를 때 쓰는 것과 같은 파일이다(low는 110m, mid·high는 50m).
// 폴리곤은 경도 180°에서 편다(unwrapAntimeridian)
export function loadWorldAtlas(file) {
  return JSON.parse(readFileSync(require.resolve(`world-atlas/${file}`), 'utf8'));
}
export function loadLand(res) {
  const topo = loadWorldAtlas(`land-${res}.json`);
  return feature(topo, topo.objects.land).features.flatMap((f) => toMulti(f.geometry)).flatMap(unwrapAntimeridian);
}
export function loadCountries(res) {
  const topo = loadWorldAtlas(`countries-${res}.json`);
  return feature(topo, topo.objects.countries).features.map((f) => ({ id: f.id, name: f.properties.name, multi: toMulti(f.geometry).flatMap(unwrapAntimeridian) }));
}

// 선분 공간 색인: 격자 칸마다 선분을 모아 점 가까이의 선분을 찾는다. 선분은 { a, b, owner }
export class SegIndex {
  constructor(cell = 0.05) {
    this.cell = cell;
    this.cells = new Map();
    this.segs = [];
  }
  #key(ix, iy) { return (ix + 8000) * 16000 + (iy + 8000); }
  add(a, b, owner, extra) {
    const i = this.segs.push({ a, b, owner, ...extra }) - 1;
    const c = this.cell;
    const x0 = Math.floor(Math.min(a[0], b[0]) / c), x1 = Math.floor(Math.max(a[0], b[0]) / c);
    const y0 = Math.floor(Math.min(a[1], b[1]) / c), y1 = Math.floor(Math.max(a[1], b[1]) / c);
    for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) {
      const k = this.#key(ix, iy);
      const list = this.cells.get(k);
      if (list) list.push(i); else this.cells.set(k, [i]);
    }
    return i;
  }
  addMulti(multi, owner) {
    for (let pi = 0; pi < multi.length; pi++) for (let ri = 0; ri < multi[pi].length; ri++) {
      const r = multi[pi][ri];
      for (let k = 0; k + 1 < r.length; k++) this.add(r[k], r[k + 1], owner, { pi, ri, k });
    }
  }
  // 상자 [x0, y0, x1, y1]와 칸이 겹치는 선분 번호
  query(x0, y0, x1, y1) {
    const c = this.cell, out = new Set();
    for (let ix = Math.floor(x0 / c); ix <= Math.floor(x1 / c); ix++) for (let iy = Math.floor(y0 / c); iy <= Math.floor(y1 / c); iy++) {
      const list = this.cells.get(this.#key(ix, iy));
      if (list) for (const i of list) out.add(i);
    }
    return out;
  }
}

// 점과 선분의 거리(평면 도)와 선분 위 매개변수 t
export function pointSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = a[0] + t * dx, qy = a[1] + t * dy;
  return { d: Math.hypot(p[0] - qx, p[1] - qy), t };
}

// 점이 폴리곤(바깥 링과 구멍) 안에 있는지 (짝홀 규칙)
export function inPolygon(p, poly) {
  let inside = false;
  for (const r of poly) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

// 큰 멀티폴리곤의 점 포함 검사 색인: 위도 띠마다 변을 모아 둔다 (해안선처럼 꼭짓점이 많은 육지에 쓴다)
export class PolygonIndex {
  constructor(multi, band = 0.1) {
    this.band = band;
    this.polys = multi.map((poly) => {
      const bands = new Map();
      for (const r of poly) for (let k = 0; k + 1 < r.length; k++) {
        const a = r[k], b = r[k + 1];
        if (a[1] === b[1]) continue;
        const y0 = Math.floor(Math.min(a[1], b[1]) / band), y1 = Math.floor(Math.max(a[1], b[1]) / band);
        for (let iy = y0; iy <= y1; iy++) { const l = bands.get(iy); if (l) l.push([a, b]); else bands.set(iy, [[a, b]]); }
      }
      return { box: bboxOf([poly]), bands };
    });
  }
  contains(p) {
    for (const { box, bands } of this.polys) {
      if (p[0] < box[0] || p[0] > box[2] || p[1] < box[1] || p[1] > box[3]) continue;
      let inside = false;
      for (const [a, b] of bands.get(Math.floor(p[1] / this.band)) ?? []) {
        if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }
}

// 폴리곤 안의 한 점: 위아래 가운데 높이의 가로선이 폴리곤 안을 지나는 가장 긴 구간의 가운데
export function interiorPoint(poly) {
  const [, y0, , y1] = bboxOf([poly]);
  for (const f of [0.5, 0.37, 0.63, 0.25, 0.75, 0.13, 0.87]) {
    const y = y0 + (y1 - y0) * f + 1e-7;
    const xs = [];
    for (const r of poly) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y)) xs.push(((xj - xi) * (y - yi)) / (yj - yi) + xi);
    }
    xs.sort((a, b) => a - b);
    let best = null;
    for (let k = 0; k + 1 < xs.length; k += 2) if (!best || xs[k + 1] - xs[k] > best[1] - best[0]) best = [xs[k], xs[k + 1]];
    if (best && best[1] > best[0]) return [(best[0] + best[1]) / 2, y];
  }
  return poly[0][0];
}

// 조각 쌍 겹침: 범위 상자가 겹치는 쌍만 polyclip 교집합을 구한다. frags는 { id, multi } 목록. 넓이는 교집합의 평면 넓이를 그 자리 위도에서 km²로 바꾼 값
export function pairOverlaps(frags) {
  const boxes = frags.map((f) => bboxOf(f.multi));
  const order = boxes.map((_, i) => i).sort((a, b) => boxes[a][0] - boxes[b][0] || a - b);
  let total = 0, count = 0, pairs = 0, worst = { km2: 0 };
  for (let u = 0; u < order.length; u++) {
    const i = order[u];
    for (let v = u + 1; v < order.length; v++) {
      const k = order[v];
      if (boxes[k][0] > boxes[i][2]) break;
      if (boxesApart(boxes[i], boxes[k])) continue;
      pairs++;
      const x = polyclip.intersection(frags[i].multi, frags[k].multi);
      if (!x.length) continue;
      const b = bboxOf(x);
      const km2 = localKm2(planarArea(x), (b[1] + b[3]) / 2);
      if (km2 <= 0) continue;
      total += km2;
      count++;
      if (km2 > worst.km2) worst = { km2, a: frags[i].id, b: frags[k].id };
    }
  }
  return { total, count, pairs, worst };
}
