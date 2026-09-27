import type { StaticData } from '../data/staticData.ts';
import { activeFront, formatFrontDate, snapshotFor } from '../lib/fronts.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 전쟁 중 하위 타임라인 (DESIGN.md §4.5): 연도 타임라인 아래에 전선 날짜를 늘어놓는다.
 * 날짜를 고르면 지도가 그 날의 전선과 작전 화살표를 보여 준다. 다른 해의 날짜를 고르면 연도도 옮긴다.
 */
export function FrontTimeline({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const frontDate = useAppStore((s) => s.frontDate);
  const hoveredEventId = useAppStore((s) => s.hoveredEventId);
  const setFront = useAppStore((s) => s.setFront);

  const war = activeFront(data.fronts, year);
  if (!war) return null;
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;
  const current = snapshotFor(war, year, frontDate, hoveredEvent);
  const index = war.snapshots.indexOf(current);
  const go = (i: number) => {
    const s = war.snapshots[i];
    if (s) setFront(s.year, s.date);
  };

  return (
    <section className="front-timeline" aria-label={`${war.name} 전선`}>
      <div className="front-timeline-head">
        <strong>{war.name} 전선</strong>
        <span className="front-timeline-current">
          {formatFrontDate(current.date)} · {current.title}
        </span>
        <span className="front-timeline-legend">
          <i className="front-legend-north" />
          {war.sides.north.name}
          <i className="front-legend-south" />
          {war.sides.south.name}
        </span>
      </div>
      <div className="front-timeline-dates">
        <button type="button" disabled={index <= 0} onClick={() => go(index - 1)} aria-label="이전 전선">◀</button>
        <ol>
          {war.snapshots.map((s, i) => (
            <li key={s.date}>
              <button type="button" aria-pressed={i === index} onClick={() => go(i)} title={s.title}>
                {formatFrontDate(s.date)}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" disabled={index >= war.snapshots.length - 1} onClick={() => go(index + 1)} aria-label="다음 전선">▶</button>
      </div>
      <p className="front-timeline-summary">{current.summary}</p>
    </section>
  );
}
