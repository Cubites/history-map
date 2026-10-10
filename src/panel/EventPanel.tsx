import { useEffect, useRef } from 'react';
import { useMediaQuery } from '../lib/useMediaQuery.ts';
import { claimantsAt, claimedRegionsAt, occupierAt, overlordAt, type StaticData } from '../data/staticData.ts';
import { eventYearFor, eventsOf, formatEventYears, inDecade, linkDirection } from '../lib/events.ts';
import { entryYear, formatFrontDate, warsOf, yearOfFrontDate } from '../lib/wars.ts';
import { formatDecade, formatRange, formatYear, isAlive, prehistoryStage } from '../lib/year.ts';
import type { HistoryEvent } from '../schema/index.ts';
import { useAppStore } from '../store/useAppStore.ts';

/** 고정한 사건을 풀 때 클릭으로 칠 움직임 한도(px). 지도의 끌기 판정(WorldMap의 d3-zoom clickDistance)과 같다 */
const CLICK_DISTANCE = 4;

export function EventPanel({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const selectedId = useAppStore((s) => s.selectedId);
  const showAll = useAppStore((s) => s.showAllEvents);
  const setShowAll = useAppStore((s) => s.setShowAllEvents);
  const setYear = useAppStore((s) => s.setYear);
  const select = useAppStore((s) => s.select);
  const enterWar = useAppStore((s) => s.enterWar);
  const warId = useAppStore((s) => s.warId);
  // 마우스가 없는 화면(휴대폰·태블릿)에서는 안내 문구를 바꾼다
  const touch = useMediaQuery('(hover: none)');
  // 눌러서 고정한 사건은 사건 밖(지도·패널의 다른 곳 등)을 '클릭'하면 풀린다. 다른 사건을 누르면 그 사건으로 바뀐다 (EventItem)
  // 지도를 끌어 옮기거나 두 손가락으로 확대·축소할 때는 풀리지 않는다(2026-10-09): 누른 자리에서 CLICK_DISTANCE 넘게 움직였거나,
  // 다른 포인터가 함께 눌렸거나, 브라우저가 스크롤로 가져가면(pointercancel) 클릭으로 치지 않는다
  const pinned = useAppStore((s) => s.pinnedEventId);
  const pinEvent = useAppStore((s) => s.pinEvent);
  useEffect(() => {
    if (!pinned) return;
    const downs = new Map<number, { x: number; y: number; outside: boolean; moved: boolean }>();
    const onPointerDown = (e: PointerEvent) => {
      // 이미 눌린 포인터가 있으면(두 손가락 확대 등) 모두 클릭이 아니다
      const multi = downs.size > 0;
      for (const d of downs.values()) d.moved = true;
      const outside = !(e.target instanceof Element && e.target.closest('.event'));
      downs.set(e.pointerId, { x: e.clientX, y: e.clientY, outside, moved: multi });
    };
    const onPointerMove = (e: PointerEvent) => {
      const d = downs.get(e.pointerId);
      if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > CLICK_DISTANCE) d.moved = true;
    };
    const onPointerUp = (e: PointerEvent) => {
      const d = downs.get(e.pointerId);
      downs.delete(e.pointerId);
      if (!d || d.moved || !d.outside) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > CLICK_DISTANCE) return;
      pinEvent(null);
    };
    const onPointerCancel = (e: PointerEvent) => {
      downs.delete(e.pointerId);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerCancel);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [pinned, pinEvent]);

  const entity = selectedId ? data.entities.get(selectedId) : undefined;
  if (!entity) {
    return (
      <aside className="panel">
        <p className="panel-guide">지도에서 나라를 누르면 그 시기의 사건이 여기에 나타납니다.</p>
        <p className="panel-guide">사건에 {touch ? '손가락을 대면' : '마우스를 올리면'} 영향을 주고받은 나라가 화살표로 표시됩니다. 사건을 누르면 화살표가 계속 남아 지도를 옮기거나 확대해도 그대로이고, 그 사건을 다시 누르거나 사건 밖을 클릭하면 사라집니다.</p>
        <p className="panel-note">현재는 선사 시대(구석기·신석기)와 고조선(기원전 2333년)부터 현대까지의 한국사 전 시대 자료와 유럽(국경 기원전 800년~, 사건 284년~현재) 자료가 들어 있습니다.</p>
      </aside>
    );
  }

  const all = eventsOf(data.events, entity.id);
  const current = all.filter((e) => inDecade(e, year));
  const shown = showAll ? all : current;
  const before = [...all].reverse().find((e) => (e.endYear ?? e.year) < year && !inDecade(e, year));
  const after = all.find((e) => e.year > year && !inDecade(e, year));
  // 앞뒤 사건으로 옮길 때 이 나라가 있던 해로 맞춘다(사건 연도에 이 나라가 없을 수 있음, eventYearFor)
  const jumpTo = (e: HistoryEvent) => setYear(eventYearFor(e, entity, e.year) ?? e.year);
  const successors = data.relations
    .filter((r) => r.type === 'successor_of' && r.object === entity.id)
    .map((r) => ({ relation: r, entity: data.entities.get(r.subject) }))
    .filter((s) => s.entity);
  // 이 나라가 참전한 전쟁 중 지금 보는 10년 구간과 겹치는 것 (DESIGN.md §4.5)
  const decade = Math.floor(year / 10) * 10;
  const wars = warsOf(data.wars, entity.id, decade, decade + 9);
  const occupation = occupierAt(data.relations, entity.id, year);
  const occupier = occupation && data.entities.get(occupation.object);
  const vassalage = overlordAt(data.relations, entity.id, year);
  const overlord = vassalage && data.entities.get(vassalage.object);
  // 귀속 논쟁 (DESIGN.md §4.3): 이 지역의 후보 나라들 / 이 나라가 후보로 오른 논쟁 지역들
  const claimants = claimantsAt(data.relations, entity.id, year).flatMap((id) => data.entities.get(id) ?? []);
  const claimedRegions = claimedRegionsAt(data.relations, entity.id, year).flatMap((id) => data.entities.get(id) ?? []);
  const stripeBackground = (colors: string[]) =>
    `repeating-linear-gradient(135deg, ${colors.map((c, i) => `${c} ${i * 4}px ${(i + 1) * 4}px`).join(', ')})`;

  return (
    <aside className="panel">
      <header className="panel-header">
        <span
          className="panel-swatch"
          style={{
            background: claimants.length
              ? stripeBackground(claimants.length > 1 ? claimants.map((c) => c.color) : [claimants[0].color, 'var(--land-unassigned)'])
              : occupier
                ? `repeating-linear-gradient(135deg, ${occupier.color} 0 2px, transparent 2px 5px), ${entity.color}`
                : entity.color,
            boxShadow: overlord ? `0 0 0 2px ${overlord.color}` : undefined,
          }}
        />
        <div>
          <h2>
            {entity.names.ko}
            {(entity.names.hanja ?? entity.names.native) && <span className="hanja"> {entity.names.hanja ?? entity.names.native}</span>}
          </h2>
          <div className="panel-period">{formatRange(entity.from, entity.to)}</div>
          {occupier && occupation && (
            <div className="panel-occupation">
              {occupier.names.ko}의 점령지 ({formatRange(occupation.from, occupation.to)})
            </div>
          )}
          {overlord && vassalage && (
            <div className="panel-occupation">
              {overlord.names.ko}의 간섭·종속 ({formatRange(vassalage.from, vassalage.to)})
            </div>
          )}
          {claimants.length > 0 && (
            <div className="panel-claims">
              귀속 논쟁 · 학설에 따라{' '}
              {claimants.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ' 또는 '}
                  <button type="button" className="link-button" onClick={() => select(c.id)}>
                    {c.names.ko}
                  </button>
                </span>
              ))}
              의 땅으로 봄
            </div>
          )}
          {claimedRegions.length > 0 && (
            <div className="panel-claims">
              귀속 논쟁 지역 포함:{' '}
              {claimedRegions.map((r, i) => (
                <span key={r.id}>
                  {i > 0 && ', '}
                  <button type="button" className="link-button" onClick={() => select(r.id)}>
                    {r.names.ko}
                  </button>
                </span>
              ))}
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

      {wars.length > 0 && (
        <div className="panel-wars">
          <h3>이 시기의 전쟁</h3>
          <ul>
            {wars.map((w) => (
              <li key={w.id}>
                <span className="panel-war-name">{w.name}</span>
                <span className="panel-war-period">
                  {formatYear(w.from, '')}–{formatYear(w.to, '')}
                </span>
                {warId === w.id ? (
                  <span className="panel-war-open">보는 중</span>
                ) : (
                  <button type="button" className="link-button" onClick={() => enterWar(w.id, null, entryYear(w, year), null)}>
                    전선 보기 →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="panel-section-title">
        <h3>{showAll ? '전체 사건' : year < data.timeline.range[0] ? `${prehistoryStage(year).name}` : `${formatDecade(year)} 사건`}</h3>
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
              <button type="button" className="link-button" onClick={() => jumpTo(before)}>
                ← {formatEventYears(before)} {before.title.ko}
              </button>
            )}
            {after && (
              <button type="button" className="link-button" onClick={() => jumpTo(after)}>
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
  const pinEvent = useAppStore((s) => s.pinEvent);
  const hovered = useAppStore((s) => s.hoveredEventId === event.id);
  const pinned = useAppStore((s) => s.pinnedEventId === event.id);
  const focused = useAppStore((s) => s.focusedEventId === event.id);
  const itemRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (focused) itemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focused]);
  const setYear = useAppStore((s) => s.setYear);
  const setFront = useAppStore((s) => s.setFront);
  const enterWar = useAppStore((s) => s.enterWar);
  const warId = useAppStore((s) => s.warId);
  const name = (id: string) => data.entities.get(id)?.names.ko ?? id;
  const war = event.front && data.wars.find((w) => w.id === event.front!.war);
  const theaterId = useAppStore((s) => s.theaterId);
  const openFront = () => event.front && enterWar(event.front.war, event.front.theater ?? null, yearOfFrontDate(event.front.date), event.front.date);
  // 지금 보고 있는 전역의 사건인가 (전역을 적지 않은 사건은 첫 전역)
  const inCurrentView = !!event.front && event.front.war === warId && (event.front.theater ?? war?.theaters[0].id) === (theaterId ?? war?.theaters[0].id);
  const activate = () => {
    // 이미 고정한 사건을 다시 누르면 고정을 푼다. 연도 이동(setYear 등)이 고정을 지우므로 누르기 전 상태를 먼저 본다
    const wasPinned = useAppStore.getState().pinnedEventId === event.id;
    // 전쟁 보기 중이면 그 전쟁의 사건은 그 날짜의 전선으로 옮긴다 (DESIGN.md §4.5)
    if (event.front && inCurrentView) setFront(yearOfFrontDate(event.front.date), event.front.date);
    else if (event.front && event.front.war === warId) openFront();
    else {
      // 선택한 나라가 사건 연도에 없으면(사건 기간 중에 생긴 나라) 그 나라가 있던 해로 맞춘다 (eventYearFor)
      const entity = data.entities.get(selectedId);
      setYear((entity && eventYearFor(event, entity, event.year)) ?? event.year);
    }
    // 누르면 화살표를 고정한다(터치 화면에는 hover가 없음). 다시 누르면 마우스가 위에 있어도 화살표를 지운다
    if (wasPinned) {
      pinEvent(null);
      hoverEvent(null);
    } else pinEvent(event.id);
  };

  return (
    <li
      ref={itemRef}
      className={['event', (hovered || pinned || focused) && 'event-hovered', pinned && 'event-pinned', highlight && 'event-current'].filter(Boolean).join(' ')}
      onMouseEnter={() => hoverEvent(event.id)}
      onMouseLeave={() => hoverEvent(null)}
      onFocus={() => hoverEvent(event.id)}
      onBlur={() => hoverEvent(null)}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        activate();
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
      {event.front && war && !inCurrentView && (
        <button
          type="button"
          className="link-button event-front"
          onClick={(e) => {
            e.stopPropagation();
            openFront();
          }}
        >
          {war.name} · {formatFrontDate(event.front.date)} 전선 보기 →
        </button>
      )}
      <div className="event-sources">{event.sources.join(' · ')}</div>
    </li>
  );
}
