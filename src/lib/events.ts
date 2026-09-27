import type { EventLink, HistoryEvent } from '../schema/index.ts';
import { decadeOf, formatYear } from './year.ts';

export function eventsOf(events: HistoryEvent[], entityId: string): HistoryEvent[] {
  return events.filter((e) => e.subjects.includes(entityId));
}

/** 사건 기간이 year가 속한 10년 구간과 겹치는가 */
export function inDecade(event: HistoryEvent, year: number): boolean {
  const start = decadeOf(year);
  return event.year <= start + 9 && (event.endYear ?? event.year) >= start;
}

/**
 * 사건 연도 표기. 정밀도(precision)에 따라
 * - year: 기원전 108 / 1950
 * - decade: 기원전 280 무렵
 * - century: 기원전 10세기 (기간이면 기원전 20세기–기원전 11세기)
 */
export function formatEventYears(event: HistoryEvent): string {
  // 선사(2만 년보다 먼 과거)는 "약 70만 년 전"처럼 (formatYear와 같은 규칙)
  const y = (v: number) => formatYear(v, '');
  const century = (v: number) => (v <= 0 ? `기원전 ${Math.ceil((1 - v) / 100)}세기` : `${Math.ceil(v / 100)}세기`);
  const one = event.precision === 'century' ? century : y;
  const hasRange = event.endYear !== undefined && event.endYear !== event.year;
  if (event.precision === 'century') {
    const [a, b] = [century(event.year), hasRange ? century(event.endYear!) : ''];
    return b && b !== a ? `${a}–${b}` : a;
  }
  const text = hasRange ? `${one(event.year)}–${one(event.endYear!)}` : one(event.year);
  return event.precision === 'decade' ? `${text} 무렵` : text;
}

export type LinkDirection = 'in' | 'out' | 'other';

/** 선택한 나라 기준 방향: 들어오는(in) / 나가는(out) / 선택한 나라와 무관(other) */
export function linkDirection(link: EventLink, selectedId: string): LinkDirection {
  if (link.to === selectedId) return 'in';
  if (link.from === selectedId) return 'out';
  return 'other';
}
