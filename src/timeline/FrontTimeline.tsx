import { useEffect, useRef } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { activeWarView, entryYear, factionColor, formatFrontDate, snapshotFor } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';
import { activeEventId, useAppStore } from '../store/useAppStore.ts';

/**
 * 전쟁 보기의 타임라인 (DESIGN.md §4.5): 연도 타임라인 대신 그 전역의 날짜를 늘어놓는다.
 * 전역이 여럿이면 전역을 바꿔 볼 수 있다. 날짜를 고르면 지도가 그 날의 점령 지역·전선·작전 화살표를 보여 준다.
 */
export function FrontTimeline({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const warId = useAppStore((s) => s.warId);
  const theaterId = useAppStore((s) => s.theaterId);
  const frontDate = useAppStore((s) => s.frontDate);
  const hoveredEventId = useAppStore(activeEventId);
  const setFront = useAppStore((s) => s.setFront);
  const enterWar = useAppStore((s) => s.enterWar);
  const exitWar = useAppStore((s) => s.exitWar);
  const returnYear = useAppStore((s) => s.returnYear);
  const listRef = useRef<HTMLOListElement>(null);
  const theatersRef = useRef<HTMLDivElement>(null);

  const warView = activeWarView(data.wars, warId, theaterId, year);
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;
  const current = warView && snapshotFor(warView, year, frontDate, hoveredEvent);
  const index = warView && current ? warView.theater.snapshots.indexOf(current) : -1;

  // 고른 날짜 버튼이 목록 가운데 오도록 좌우로만 스크롤한다 (scrollIntoView는 화면 전체를 세로로도 움직일 수 있어 쓰지 않는다)
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (!list || !item) return;
    const target = item.offsetLeft - list.offsetLeft - (list.clientWidth - item.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [index, warView?.theater.id]);

  // 휴대폰에서 전역 버튼 줄이 넘칠 때 고른 전역이 보이도록 좌우로만 스크롤한다
  useEffect(() => {
    const bar = theatersRef.current;
    const item = bar?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!bar || !item || bar.scrollWidth <= bar.clientWidth) return;
    const target = item.offsetLeft - bar.offsetLeft - (bar.clientWidth - item.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, target) });
  }, [warView?.theater.id]);

  if (!warView || !current) return null;
  const { war, theater } = warView;
  const closeLabel = `닫고 ${formatYear(returnYear ?? year)} 지도로`;
  const go = (i: number) => {
    const s = theater.snapshots[i];
    if (s) setFront(s.year, s.date);
  };
  const entityColor = (id: string) => data.entities.get(id)?.color;

  return (
    <section className="front-timeline" aria-label={`${war.name} 날짜`}>
      <div className="front-timeline-head">
        <strong>{war.name}</strong>
        <span className="front-timeline-period">
          {formatYear(war.from, '')}–{formatYear(war.to, '')}
        </span>
        <span className="front-timeline-current">
          {formatFrontDate(current.date, war.calendar)} · {current.title}
        </span>
        <span className="front-timeline-legend">
          {war.factions.map((f) => (
            <span key={f.id} className="front-legend-item">
              <i className="front-legend-swatch" style={{ background: factionColor(war, f.id, entityColor) }} />
              {f.name}
            </span>
          ))}
        </span>
        <button type="button" className="front-timeline-close front-timeline-close-wide" onClick={exitWar}>
          {closeLabel}
        </button>
      </div>
      {/* 휴대폰에서는 닫기 버튼을 전역 버튼 줄 오른쪽 끝에 붙이고, 전역 버튼이 넘치면 그 줄만 좌우로 스크롤한다(2026-10-26).
          PC에서는 이 줄이 없는 것처럼(display: contents) 전역 버튼만 보이고 닫기는 머리줄에 있다 */}
      <div className="front-timeline-bar">
        {war.theaters.length > 1 && (
          <div ref={theatersRef} className="front-timeline-theaters" role="group" aria-label="전역">
            {war.theaters.map((t) => (
              <button key={t.id} type="button" aria-pressed={t.id === theater.id} onClick={() => enterWar(war.id, t.id, entryYear(t, year), null)}>
                {t.name}
              </button>
            ))}
          </div>
        )}
        <button type="button" className="front-timeline-close front-timeline-close-narrow" onClick={exitWar} aria-label={closeLabel}>
          닫기
        </button>
      </div>
      <div className="front-timeline-dates">
        <button type="button" disabled={index <= 0} onClick={() => go(index - 1)} aria-label="이전 날짜">◀</button>
        <ol ref={listRef}>
          {theater.snapshots.map((s, i) => (
            <li key={s.date}>
              <button type="button" aria-pressed={i === index} onClick={() => go(i)} title={s.title}>
                {formatFrontDate(s.date)}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" disabled={index >= theater.snapshots.length - 1} onClick={() => go(index + 1)} aria-label="다음 날짜">▶</button>
      </div>
      {/* 휴대폰에서는 머리줄의 날짜·제목을 이 글 영역 첫 줄로 옮기고, 영역 높이를 4줄로 고정해 넘치면 세로로 스크롤한다(2026-10-26).
          날짜·전역이 바뀌면 key로 새로 그려 스크롤을 맨 위로 되돌린다 */}
      <div key={`${theater.id}-${current.date}`} className="front-timeline-summary">
        <strong className="front-timeline-summary-title">
          {formatFrontDate(current.date, war.calendar)} · {current.title}
        </strong>
        <p>{current.summary}</p>
      </div>
    </section>
  );
}
