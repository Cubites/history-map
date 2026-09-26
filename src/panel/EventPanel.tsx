import { occupierAt, type StaticData } from '../data/staticData.ts';
import { eventsOf, formatEventYears, inDecade, linkDirection } from '../lib/events.ts';
import { formatDecade, formatRange, formatYear, isAlive } from '../lib/year.ts';
import type { HistoryEvent } from '../schema/index.ts';
import { useAppStore } from '../store/useAppStore.ts';

export function EventPanel({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const selectedId = useAppStore((s) => s.selectedId);
  const showAll = useAppStore((s) => s.showAllEvents);
  const setShowAll = useAppStore((s) => s.setShowAllEvents);
  const setYear = useAppStore((s) => s.setYear);
  const select = useAppStore((s) => s.select);

  const entity = selectedId ? data.entities.get(selectedId) : undefined;
  if (!entity) {
    return (
      <aside className="panel">
        <p className="panel-guide">지도에서 나라를 누르면 그 시기의 사건이 여기에 나타납니다.</p>
        <p className="panel-guide">사건에 마우스를 올리면 영향을 주고받은 나라가 화살표로 표시됩니다.</p>
        <p className="panel-note">현재는 600~935년(삼국 통일과 남북국) 한국사 자료가 들어 있습니다.</p>
      </aside>
    );
  }

  const all = eventsOf(data.events, entity.id);
  const current = all.filter((e) => inDecade(e, year));
  const shown = showAll ? all : current;
  const before = [...all].reverse().find((e) => (e.endYear ?? e.year) < year && !inDecade(e, year));
  const after = all.find((e) => e.year > year && !inDecade(e, year));
  const successors = data.relations
    .filter((r) => r.type === 'successor_of' && r.object === entity.id)
    .map((r) => ({ relation: r, entity: data.entities.get(r.subject) }))
    .filter((s) => s.entity);
  const occupation = occupierAt(data.relations, entity.id, year);
  const occupier = occupation && data.entities.get(occupation.object);

  return (
    <aside className="panel">
      <header className="panel-header">
        <span
          className="panel-swatch"
          style={{
            background: occupier
              ? `repeating-linear-gradient(135deg, ${occupier.color} 0 2px, transparent 2px 5px), ${entity.color}`
              : entity.color,
          }}
        />
        <div>
          <h2>
            {entity.names.ko}
            {entity.names.hanja && <span className="hanja"> {entity.names.hanja}</span>}
          </h2>
          <div className="panel-period">{formatRange(entity.from, entity.to)}</div>
          {occupier && occupation && (
            <div className="panel-occupation">
              {occupier.names.ko}의 점령지 ({formatRange(occupation.from, occupation.to)})
            </div>
          )}
        </div>
      </header>
      {entity.summary && <p className="panel-summary">{entity.summary}</p>}
      {entity.basis?.foundingNote && <p className="panel-note">{entity.basis.foundingNote}</p>}

      {!isAlive(entity, year) && (
        <div className="panel-absent">
          {formatYear(year)}에는 존재하지 않습니다.
          {successors.map(({ relation, entity: next }) => (
            <button
              key={next!.id}
              type="button"
              className="link-button"
              onClick={() => {
                select(next!.id);
                setYear(relation.from);
              }}
            >
              후계 국가: {next!.names.ko} ({formatYear(relation.from)}) →
            </button>
          ))}
        </div>
      )}

      <div className="panel-section-title">
        <h3>{showAll ? '전체 사건' : `${formatDecade(year)} 사건`}</h3>
        {all.length > 0 && (
          <button type="button" className="link-button" onClick={() => setShowAll(!showAll)}>
            {showAll ? '현재 구간만 보기' : `전체 사건 보기 (${all.length})`}
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="panel-empty">
          <p>이 구간에 등록된 사건이 없습니다.</p>
          <div className="panel-jump">
            {before && (
              <button type="button" className="link-button" onClick={() => setYear(before.year)}>
                ← {formatEventYears(before)} {before.title.ko}
              </button>
            )}
            {after && (
              <button type="button" className="link-button" onClick={() => setYear(after.year)}>
                {formatEventYears(after)} {after.title.ko} →
              </button>
            )}
          </div>
        </div>
      ) : (
        <ol className="event-list">
          {shown.map((event) => (
            <EventItem key={event.id} event={event} data={data} selectedId={entity.id} highlight={showAll && inDecade(event, year)} />
          ))}
        </ol>
      )}

      <footer className="panel-legend">
        <span><i className="legend-in" />영향을 준 나라 → {entity.names.ko}</span>
        <span><i className="legend-out" />{entity.names.ko} → 영향을 받은 나라</span>
      </footer>
    </aside>
  );
}

function EventItem({ event, data, selectedId, highlight }: { event: HistoryEvent; data: StaticData; selectedId: string; highlight: boolean }) {
  const hoverEvent = useAppStore((s) => s.hoverEvent);
  const hovered = useAppStore((s) => s.hoveredEventId === event.id);
  const setYear = useAppStore((s) => s.setYear);
  const name = (id: string) => data.entities.get(id)?.names.ko ?? id;

  return (
    <li
      className={['event', hovered && 'event-hovered', highlight && 'event-current'].filter(Boolean).join(' ')}
      onMouseEnter={() => hoverEvent(event.id)}
      onMouseLeave={() => hoverEvent(null)}
      onFocus={() => hoverEvent(event.id)}
      onBlur={() => hoverEvent(null)}
      onClick={() => {
        setYear(event.year);
        // 터치 화면에는 hover가 없으므로 누르면 화살표를 보여준다 (setYear가 hover를 지우므로 그 뒤에 설정)
        hoverEvent(event.id);
      }}
      tabIndex={0}
    >
      <div className="event-head">
        <span className="event-year">{formatEventYears(event)}</span>
        <span className="event-title">{event.title.ko}</span>
      </div>
      <p className="event-summary">{event.summary.ko}</p>
      {event.links.length > 0 && (
        <ul className="event-links">
          {event.links.map((link, i) => (
            <li key={i} className={`event-link event-link-${linkDirection(link, selectedId)}`}>
              <span className="event-link-path">
                {name(link.from)} → {name(link.to)}
              </span>
              {link.note && <span className="event-link-note">{link.note}</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="event-sources">{event.sources.join(' · ')}</div>
    </li>
  );
}
