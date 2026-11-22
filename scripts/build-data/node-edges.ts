// 긴 변에 이웃 도형의 꼭짓점 끼워 넣기 (2026-11-22)
import type { Position } from 'geojson';
import type { MultiCoords } from './geo.ts';

/** 이 길이(도) 이상인 변만 본다. 해안선·강처럼 잘게 나뉜 변은 이웃과 꼭짓점이 이미 맞는다 */
const MIN_LEN = 0.5;
const CELL = 0.5;
/** 좌표 반올림(소수 넷째 자리) 오차를 덮는 거리(도, 약 15m) */
const EPS = 1.5e-4;

/**
 * 도형들의 긴 직선 변 위에 다른 도형의 꼭짓점이 놓여 있으면 그 점을 변에 끼워 넣는다.
 * 까닭: 토폴로지(topo.ts)는 두 도형이 같은 꼭짓점으로 변을 나눠 가질 때만 공유 경계(arc)로 묶는다. 생성기가 북위 33° 선 같은 긴 직선으로 땅을 나누면
 * 한쪽(진)은 그 선을 두 점으로, 맞은편(북주·북제)은 둘이 만나는 점에서 끊어 가져서 꼭짓점이 어긋나고, 화면은 점 사이를 대권으로 이어 그리므로
 * 선이 서로 다르게 휘어 쐐기 모양으로 겹쳐 보였다(진과 북주·북제, 양과 동위·서위 등). 생성기 쪽에서 선에 점을 더해도 자르기·합치기가 직선 위의 점을 지운다.
 * 끼워 넣는 점은 변 위(EPS 안)에 있으므로 평면 도형은 바뀌지 않는다. 같은 도형의 꼭짓점은 넣지 않는다. 입력은 고치지 않고 새 배열을 돌려준다
 */
export function nodeLongEdges(shapes: MultiCoords[]): MultiCoords[] {
  type Edge = { a: Position; b: Position; s: number; id: string; len2: number };
  const grid = new Map<number, Edge[]>();
  const cellKey = (x: number, y: number) => Math.floor(x / CELL) * 100003 + Math.floor(y / CELL);
  shapes.forEach((mp, s) =>
    mp.forEach((poly, p) =>
      poly.forEach((ring, r) => {
        for (let i = 0; i + 1 < ring.length; i++) {
          const [a, b] = [ring[i], ring[i + 1]];
          const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
          if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_LEN) continue;
          const edge: Edge = { a, b, s, id: `${s}/${p}/${r}/${i}`, len2: dx * dx + dy * dy };
          // 변을 따라 걸으며 지나는 칸(과 EPS만큼 옆 칸)에 올린다
          const steps = Math.ceil(Math.hypot(dx, dy) / (CELL / 2));
          const seen = new Set<number>();
          for (let k = 0; k <= steps; k++) {
            const [x, y] = [a[0] + (dx * k) / steps, a[1] + (dy * k) / steps];
            for (const ox of [-EPS, EPS])
              for (const oy of [-EPS, EPS]) {
                const key = cellKey(x + ox, y + oy);
                if (seen.has(key)) continue;
                seen.add(key);
                if (!grid.has(key)) grid.set(key, []);
                grid.get(key)!.push(edge);
              }
          }
        }
      }),
    ),
  );
  if (grid.size === 0) return shapes;

  // 끼워 넣을 점: 변 → (변 위 위치 t → 점)
  const inserts = new Map<string, Map<number, Position>>();
  shapes.forEach((mp, s) =>
    mp.forEach((poly) =>
      poly.forEach((ring) => {
        for (let i = 0; i + 1 < ring.length; i++) {
          const v = ring[i];
          const edges = grid.get(cellKey(v[0], v[1]));
          if (!edges) continue;
          for (const e of edges) {
            if (e.s === s) continue;
            const [ex, ey] = [e.b[0] - e.a[0], e.b[1] - e.a[1]];
            const [vx, vy] = [v[0] - e.a[0], v[1] - e.a[1]];
            const t = (vx * ex + vy * ey) / e.len2;
            if (t <= 0 || t >= 1) continue;
            // 변에서 떨어진 거리와, 양 끝 점과의 거리
            if (Math.abs(vx * ey - vy * ex) / Math.sqrt(e.len2) > EPS) continue;
            if (Math.hypot(vx, vy) <= EPS || Math.hypot(v[0] - e.b[0], v[1] - e.b[1]) <= EPS) continue;
            if (!inserts.has(e.id)) inserts.set(e.id, new Map());
            // 같은 자리의 점(여러 도형이 함께 쓰는 꼭짓점)은 한 번만
            inserts.get(e.id)!.set(Math.round(t * 1e7), [v[0], v[1]]);
          }
        }
      }),
    ),
  );
  if (inserts.size === 0) return shapes;

  return shapes.map((mp, s) =>
    mp.map((poly, p) =>
      poly.map((ring, r) => {
        const out: Position[] = [];
        for (let i = 0; i < ring.length; i++) {
          out.push(ring[i]);
          const more = i + 1 < ring.length ? inserts.get(`${s}/${p}/${r}/${i}`) : undefined;
          if (more) for (const t of [...more.keys()].sort((x, y) => x - y)) out.push(more.get(t)!);
        }
        return out;
      }),
    ),
  );
}

/** 끼워 넣은 점의 수 (빌드 요약용) */
export function countAdded(before: MultiCoords[], after: MultiCoords[]): number {
  const count = (list: MultiCoords[]) => list.reduce((n, mp) => n + mp.reduce((m, poly) => m + poly.reduce((k, ring) => k + ring.length, 0), 0), 0);
  return count(after) - count(before);
}
