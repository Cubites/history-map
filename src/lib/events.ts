import type { EventLink, HistoryEvent } from '../schema/index.ts';
import { decadeOf, formatYear, isAlive } from './year.ts';

export function eventsOf(events: HistoryEvent[], entityId: string): HistoryEvent[] {
  return events.filter((e) => e.subjects.includes(entityId));
}

type Lifespan = { from: number; to: number | null };

/**
 * 사건을 볼 해: year를 '사건 기간과 나라의 존재 기간이 겹치는 구간'으로 맞춘 해(구간 안이면 year 그대로).
 * 사건 연도 규칙이 '사건 기간과 겹치면 됨'이라(2026-10-06, DATA_GUIDE.md §3) 사건 연도에 그 나라가 없을 수 있다.
 * 사건을 눌러 연도를 옮길 때 선택한 나라가 없던 해로 가지 않게 한다. 겹치지 않으면 null
 */
export function eventYearFor(event: HistoryEvent, entity: Lifespan, year: number): number | null {
  const from = Math.max(event.year, entity.from);
  const to = Math.min(event.endYear ?? event.year, entity.to ?? Infinity);
  return from <= to ? Math.min(to, Math.max(from, year)) : null;
}

/**
 * 사건을 패널에 띄울 주체와 연도 (전투 표시·검색 결과를 누를 때).
 * year에 있던 나라 가운데 첫 주체를 고른다. 그런 주체가 없으면 사건 기간과 존재 기간이 겹치는 첫 주체와,
 * 그 겹치는 구간에서 year에 가장 가까운 해를 고른다(eventYearFor). 겹치는 주체가 없으면 null
 */
export function focusTarget(
  event: HistoryEvent,
  entityOf: (id: string) => Lifespan | undefined,
  year: number,
): { subject: string; year: number } | null {
  const atYear = event.subjects.find((id) => {
    const entity = entityOf(id);
    return entity && isAlive(entity, year);
  });
  if (atYear) return { subject: atYear, year };
  for (const id of event.subjects) {
    const entity = entityOf(id);
    const y = entity ? eventYearFor(event, entity, year) : null;
    if (y !== null) return { subject: id, year: y };
  }
  return null;
}

/**
 * 전투 표시(⊗)를 그 해에 보일까. place.year(그 장소에서 싸운 해, 기간이면 [from, to])가 있으면 그 해에만,
 * 없으면 사건 기간 내내 보인다 (2026-10-06, 긴 사건에서 나중 전투가 앞당겨 보이지 않게)
 */
export function placeActive(event: HistoryEvent, place: HistoryEvent['places'][number], year: number): boolean {
  const [from, to] = place.year === undefined ? [event.year, event.endYear ?? event.year] : typeof place.year === 'number' ? [place.year, place.year] : place.year;
  return from <= year && year <= to;
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
