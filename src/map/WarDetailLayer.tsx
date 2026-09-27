import type { GeoProjection } from 'd3-geo';
import { dateKey, factionColor, factionStroke, formatFrontDate, formatShortFrontDate } from '../lib/wars.ts';
import type { FrontSnapshotOut, TheaterOut, WarIndexEntry } from '../schema/index.ts';

/** 경로 지점 이름 사이의 최소 화면 거리(px) */
const LABEL_GAP = 46;

interface Props {
  war: WarIndexEntry;
  theater: TheaterOut;
  snapshot: FrontSnapshotOut;
  projection: GeoProjection;
  entityColor: (id: string) => string | undefined;
}

/**
 * 전쟁 보기의 진군 경로·전투·거점 (DESIGN.md §4.5).
 * - 경로: 고른 날짜까지 지나온 길은 굵게, 남은 길은 흐린 점선. 가장 최근에 닿은 지점에 화살촉
 * - 전투: 고른 날짜까지 일어난 것만. 직전 날짜 이후의 전투는 크게 이름과 함께, 지난 전투는 작고 흐리게
 * - 거점: 그 날짜의 도시·요새 소속을 진영 색 점으로
 */
export function WarDetailLayer({ war, theater, snapshot, projection, entityColor }: Props) {
  const now = dateKey(snapshot.date);
  const index = theater.snapshots.indexOf(snapshot);
  const prev = index > 0 ? dateKey(theater.snapshots[index - 1].date) : -Infinity;
  const xy = (p: [number, number]) => projection(p) ?? null;
  const pathOf = (pts: ([number, number] | null)[]) => {
    const ok = pts.filter((p): p is [number, number] => !!p);
    return ok.length >= 2 ? `M${ok.join('L')}` : '';
  };

  const routes = theater.routes.map((route, ri) => {
    // 날짜 없는 지점은 앞 지점의 날짜를 따른다
    let last = -Infinity;
    const keys = route.points.map((p) => (p.date ? (last = dateKey(p.date)) : last));
    let reached = -1;
    keys.forEach((k, i) => {
      if (k <= now) reached = i;
    });
    const screen = route.points.map((p) => xy(p.at));
    // 지점 이름이 겹치지 않게, 앞에서 이름을 붙인 지점과 화면에서 가까우면 건너뛴다 (가장 최근 지점은 항상 붙인다)
    const labeled = new Set<number>();
    let lastLabeled: [number, number] | null = null;
    for (let i = reached; i >= 0; i--) {
      const p = screen[i];
      if (!p) continue;
      if (i === reached || !lastLabeled || Math.hypot(p[0] - lastLabeled[0], p[1] - lastLabeled[1]) > LABEL_GAP) {
        labeled.add(i);
        lastLabeled = p;
      }
    }
    // 직전 날짜보다 먼저 끝난 경로는 흐리게 (예: 후퇴 뒤에도 남아 있는 지난 진격로)
    const finished = reached === route.points.length - 1 && keys[keys.length - 1] <= prev;
    return { ri, route, reached, screen, labeled, finished, stroke: factionStroke(war, route.faction, entityColor) };
  });

  const battles = theater.battles
    .filter((b) => dateKey(b.date) <= now)
    .map((b, i) => ({ b, i, p: xy(b.at), fresh: dateKey(b.date) > prev }))
    .filter((x) => x.p);

  return (
    <g className="war-details">
      <defs>
        {routes.map((r) => (
          <marker key={r.ri} id={`route-head-${r.ri}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0,0L10,5L0,10z" fill={r.stroke} />
          </marker>
        ))}
      </defs>

      {routes.map((r) => (
        <g key={r.ri} className={`war-route${r.finished ? ' war-route-finished' : ''}`} aria-hidden>
          <path className="war-route-ahead" d={pathOf(r.screen)} style={{ stroke: r.stroke }} />
          {r.reached >= 1 && <path className="war-route-halo" d={pathOf(r.screen.slice(0, r.reached + 1))} />}
          {r.reached >= 1 && (
            <path className="war-route-done" d={pathOf(r.screen.slice(0, r.reached + 1))} style={{ stroke: r.stroke }} markerEnd={`url(#route-head-${r.ri})`} />
          )}
          {r.screen.slice(0, r.reached + 1).map((p, i) => {
            if (!p) return null;
            const point = r.route.points[i];
            return (
              <g key={i}>
                <circle className="war-route-stop" cx={p[0]} cy={p[1]} r={3.2} style={{ stroke: r.stroke }} />
                {r.labeled.has(i) && (point.label || point.date) && (
                  <text className="war-route-label" x={p[0] + 6} y={p[1] - 5}>
                    {point.label}
                    {point.date && formatShortFrontDate(point.date) && <tspan className="war-route-date"> {formatShortFrontDate(point.date)}</tspan>}
                  </text>
                )}
              </g>
            );
          })}
          {r.screen[0] && (
            <text className="war-route-name" x={r.screen[0][0] - 6} y={r.screen[0][1] + 16} textAnchor="end" style={{ fill: r.stroke }}>
              {r.route.name}
            </text>
          )}
        </g>
      ))}

      {snapshot.holds.map((h, i) => {
        const p = xy(h.at);
        if (!p) return null;
        return (
          <g key={`h${i}`} className="war-hold" aria-hidden>
            <circle cx={p[0]} cy={p[1]} r={5} style={{ fill: factionColor(war, h.faction, entityColor) }} />
            <text className="war-hold-label" x={p[0] + 7} y={p[1] + 4}>
              {h.name}
            </text>
          </g>
        );
      })}

      {battles.map(({ b, i, p, fresh }) => {
        const color = b.winner ? factionStroke(war, b.winner, entityColor) : 'var(--muted)';
        const winner = b.winner && war.factions.find((f) => f.id === b.winner)?.name;
        return (
          <g
            key={`b${i}`}
            className={`war-battle ${fresh ? 'war-battle-fresh' : 'war-battle-past'}`}
            transform={`translate(${p![0]},${p![1]})`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <title>{`${b.name} (${formatFrontDate(b.date)})${winner ? ` · ${winner} 승리` : ''}${b.summary ? `\n${b.summary}` : ''}`}</title>
            <circle r={fresh ? 8 : 4.5} style={{ stroke: color }} />
            {/* 교차한 칼 모양 */}
            {fresh && <path d="M-4,-4 L4,4 M4,-4 L-4,4" style={{ stroke: color }} />}
            {fresh && (
              <text className="war-battle-label" x={11} y={4} style={{ fill: color }}>
                {b.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
