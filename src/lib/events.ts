import type { EventLink, HistoryEvent } from '../schema/index.ts';
import { decadeOf } from './year.ts';

export function eventsOf(events: HistoryEvent[], entityId: string): HistoryEvent[] {
  return events.filter((e) => e.subjects.includes(entityId));
}

/** 사건 기간이 year가 속한 10년 구간과 겹치는가 */
export function inDecade(event: HistoryEvent, year: number): boolean {
  const start = decadeOf(year);
  return event.year <= start + 9 && (event.endYear ?? event.year) >= start;
}

export function formatEventYears(event: HistoryEvent): string {
  const y = (v: number) => (v <= 0 ? `기원전 ${1 - v}` : String(v));
  return event.endYear !== undefined && event.endYear !== event.year ? `${y(event.year)}–${y(event.endYear)}` : y(event.year);
}

export type LinkDirection = 'in' | 'out' | 'other';

/** 선택한 나라 기준 방향: 들어오는(in) / 나가는(out) / 선택한 나라와 무관(other) */
export function linkDirection(link: EventLink, selectedId: string): LinkDirection {
  if (link.to === selectedId) return 'in';
  if (link.from === selectedId) return 'out';
  return 'other';
}
