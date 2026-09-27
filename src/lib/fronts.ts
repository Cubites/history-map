// 전쟁 보기 (DESIGN.md §4.5): 전쟁과 전선 스냅샷 고르기
import type { FrontIndexEntry, FrontSnapshotOut, HistoryEvent } from '../schema/index.ts';

/** 그 해에 진행 중인 전쟁들 (평소 지도의 전쟁 표시용) */
export function warsInYear(fronts: FrontIndexEntry[], year: number): FrontIndexEntry[] {
  return fronts.filter((f) => f.from <= year && year <= f.to);
}

/** 그 나라가 참전했고 [from, to] 구간과 겹치는 전쟁들 (사건 패널의 "이 시기의 전쟁") */
export function warsOf(fronts: FrontIndexEntry[], entityId: string, from: number, to: number): FrontIndexEntry[] {
  return fronts.filter((f) => f.participants.includes(entityId) && f.from <= to && from <= f.to);
}

/**
 * 보여 줄 스냅샷.
 * 1. 마우스를 올린 사건이 이 전쟁의 전선에 연결되어 있으면 그 날짜
 * 2. 사용자가 고른 날짜
 * 3. 그 해의 첫 스냅샷, 그 해에 없으면 그 해 이전의 마지막 스냅샷
 */
export function snapshotFor(
  war: FrontIndexEntry,
  year: number,
  chosenDate: string | null,
  hoveredEvent: HistoryEvent | undefined,
): FrontSnapshotOut {
  const byDate = (date: string | null | undefined) => (date ? war.snapshots.find((s) => s.date === date) : undefined);
  if (hoveredEvent?.front?.war === war.id) {
    const hit = byDate(hoveredEvent.front.date);
    if (hit) return hit;
  }
  const chosen = byDate(chosenDate);
  if (chosen) return chosen;
  return war.snapshots.find((s) => s.year === year) ?? [...war.snapshots].reverse().find((s) => s.year <= year) ?? war.snapshots[0];
}

/** 전쟁 보기를 열 때의 연도: 지금 연도가 전쟁 기간 안이면 그대로, 아니면 전쟁 첫해 */
export function entryYear(war: FrontIndexEntry, year: number): number {
  return war.from <= year && year <= war.to ? year : war.from;
}

/** YYYY-MM-DD → 1950.6.25 */
export function formatFrontDate(date: string): string {
  const [, y, m, d] = date.match(/^(-?\d+)-(\d+)-(\d+)$/)!;
  const year = Number(y);
  return `${year <= 0 ? `기원전 ${1 - year}` : year}.${Number(m)}.${Number(d)}`;
}

/** YYYY-MM-DD의 연도 (천문 연도) */
export function yearOfFrontDate(date: string): number {
  return Number(date.match(/^(-?\d+)-/)![1]);
}
