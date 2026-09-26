// 격자 조각 (DESIGN.md §3.2): 확대했을 때 화면에 보이는 부분만 계산하려고 도형을 잘게 나눈다.
// - 칠하기용: 폴리곤을 10°×10° 격자 칸으로 자른 조각. 같은 나라의 조각은 앱이 한 경로로 칠해 이음매가 보이지 않는다.
// - 테두리용: 고리를 64점 이하의 선 조각으로 나눈 것. 격자 칸의 경계선은 테두리로 그리지 않기 위해 따로 둔다.
import type { Feature, LineString, MultiPolygon, Position } from 'geojson';
import { bbox, type BBox, type MultiCoords, type Ring } from './geo.ts';

export const TILE_SIZE = 10;
const LINE_CHUNK = 64;

export interface PieceProps {
  /** 영토 버전 키 (`${entityId}@${from}`). 육지는 없음 */
  key?: string;
  /** 경위도 범위 (앱이 화면 밖 조각을 건너뛰는 데 씀) */
  b: BBox;
}

const round2 = (b: BBox): BBox => b.map((v) => Math.round(v * 100) / 100) as BBox;

/**
 * 고리를 축에 나란한 사각형으로 자른다 (Sutherland–Hodgman).
 * 일반 폴리곤 연산(polyclip)보다 수십 배 빠르다. 오목한 모양에서는 칸 경계를 따라 폭이 0인 선이 생길 수 있지만,
 * 조각은 칠하기에만 쓰고 테두리는 따로 그리므로 화면에는 드러나지 않는다.
 * 입력 고리의 감긴 방향이 그대로 유지되므로 d3용 방향을 다시 맞출 필요가 없다.
 */
function clipRing(ring: Ring, [x0, y0, x1, y1]: BBox): Ring | null {
  let points: Position[] = ring.slice(0, -1);
  const edges: [(p: Position) => boolean, (a: Position, b: Position) => Position][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  for (const [inside, cross] of edges) {
    if (points.length === 0) return null;
    const next: Position[] = [];
    for (let i = 0; i < points.length; i++) {
      const cur = points[i];
      const prev = points[(i + points.length - 1) % points.length];
      if (inside(cur)) {
        if (!inside(prev)) next.push(cross(prev, cur));
        next.push(cur);
      } else if (inside(prev)) next.push(cross(prev, cur));
    }
    points = next;
  }
  if (points.length < 3) return null;
  const round = (v: number) => Math.round(v * 1e4) / 1e4;
  const closed = points.map(([x, y]) => [round(x), round(y)]);
  return [...closed, closed[0]];
}

export function tilePolygons(polygons: MultiCoords, key?: string): Feature<MultiPolygon, PieceProps>[] {
  // 격자 칸마다 그 칸에 걸친 조각을 모은다
  const cells = new Map<string, MultiCoords>();
  for (const polygon of polygons) {
    const [w, s, e, n] = bbox([polygon]);
    for (let x = Math.floor(w / TILE_SIZE) * TILE_SIZE; x < e; x += TILE_SIZE)
      for (let y = Math.floor(s / TILE_SIZE) * TILE_SIZE; y < n; y += TILE_SIZE) {
        const cell: BBox = [x, y, x + TILE_SIZE, y + TILE_SIZE];
        const outer = clipRing(polygon[0], cell);
        if (!outer) continue;
        const holes = polygon.slice(1).map((h) => clipRing(h, cell)).filter((h): h is Ring => h !== null);
        const id = `${x},${y}`;
        cells.set(id, [...(cells.get(id) ?? []), [outer, ...holes]]);
      }
  }
  return [...cells.values()].map((coords) => ({
    type: 'Feature',
    properties: { key, b: round2(bbox(coords)) },
    geometry: { type: 'MultiPolygon', coordinates: coords },
  }));
}

export function chunkOutlines(polygons: MultiCoords, key?: string): Feature<LineString, PieceProps>[] {
  const out: Feature<LineString, PieceProps>[] = [];
  for (const polygon of polygons)
    for (const ring of polygon)
      for (let i = 0; i < ring.length - 1; i += LINE_CHUNK - 1) {
        const coordinates = ring.slice(i, i + LINE_CHUNK);
        if (coordinates.length < 2) continue;
        out.push({ type: 'Feature', properties: { key, b: round2(bbox([[coordinates]])) }, geometry: { type: 'LineString', coordinates } });
      }
  return out;
}
