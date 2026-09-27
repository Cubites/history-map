// 전쟁 보기 (DESIGN.md §4.5): 전쟁·전역·스냅샷 고르기와 진영 색
import type { FrontSnapshotOut, HistoryEvent, TheaterOut, WarIndexEntry } from '../schema/index.ts';

export interface WarTheater {
  war: WarIndexEntry;
  theater: TheaterOut;
}

const inRange = (r: { from: number; to: number }, year: number) => r.from <= year && year <= r.to;

/** 그 해에 진행 중인 전역들 (평소 지도의 전쟁 표시용) */
export function theatersInYear(wars: WarIndexEntry[], year: number): WarTheater[] {
  return wars.flatMap((war) => war.theaters.filter((t) => inRange(t, year)).map((theater) => ({ war, theater })));
}

/** 그 나라가 [from, to] 구간에 참전한 전쟁들 (사건 패널의 "이 시기의 전쟁") */
export function warsOf(wars: WarIndexEntry[], entityId: string, from: number, to: number): WarIndexEntry[] {
  return wars.filter((w) => w.participants.some((p) => p.entity === entityId && p.from <= to && from <= p.to));
}

/** 전역 고르기: 지정한 전역 → 그 해에 진행 중인 첫 전역 → 첫 전역 */
export function theaterFor(war: WarIndexEntry, theaterId: string | null, year: number): TheaterOut {
  return war.theaters.find((t) => t.id === theaterId) ?? war.theaters.find((t) => inRange(t, year)) ?? war.theaters[0];
}

/** 지금 열려 있는 전쟁 보기. 그 해가 전역 기간 밖이면 없음 */
export function activeWarView(wars: WarIndexEntry[], warId: string | null, theaterId: string | null, year: number): WarTheater | undefined {
  const war = warId ? wars.find((w) => w.id === warId) : undefined;
  if (!war) return undefined;
  const theater = theaterFor(war, theaterId, year);
  return inRange(theater, year) ? { war, theater } : undefined;
}

/**
 * 보여 줄 스냅샷.
 * 1. 마우스를 올린 사건이 이 전역의 전선에 연결되어 있으면 그 날짜
 * 2. 사용자가 고른 날짜
 * 3. 그 해의 첫 스냅샷, 그 해에 없으면 그 해 이전의 마지막 스냅샷
 */
export function snapshotFor(
  { war, theater }: WarTheater,
  year: number,
  chosenDate: string | null,
  hoveredEvent: HistoryEvent | undefined,
): FrontSnapshotOut {
  const byDate = (date: string | null | undefined) => (date ? theater.snapshots.find((s) => s.date === date) : undefined);
  const front = hoveredEvent?.front;
  if (front?.war === war.id && (front.theater ?? war.theaters[0].id) === theater.id) {
    const hit = byDate(front.date);
    if (hit) return hit;
  }
  const chosen = byDate(chosenDate);
  if (chosen) return chosen;
  return theater.snapshots.find((s) => s.year === year) ?? [...theater.snapshots].reverse().find((s) => s.year <= year) ?? theater.snapshots[0];
}

/** 전쟁 보기를 열 때의 연도: 지금 연도가 기간 안이면 그대로, 아니면 첫해 */
export function entryYear(range: { from: number; to: number }, year: number): number {
  return inRange(range, year) ? year : range.from;
}

/** 진영 색: 지정한 색, 없으면 대표 나라 색 */
export function factionColor(war: WarIndexEntry, factionId: string, entityColor: (id: string) => string | undefined): string {
  const f = war.factions.find((x) => x.id === factionId);
  return f?.color ?? (f && entityColor(f.entity)) ?? '#999999';
}

/** 화살표 모양 번호: 진영 순서 (0: 실선, 1: 긴 점선, 2 이상: 짧은 점선) */
export const factionIndex = (war: WarIndexEntry, factionId: string) => Math.max(0, war.factions.findIndex((f) => f.id === factionId));

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

/** 날짜 비교용 수 (기원전 날짜도 순서대로) */
export function dateKey(date: string): number {
  const [, y, m, d] = date.match(/^(-?\d+)-(\d+)-(\d+)$/)!;
  return Number(y) * 10000 + Number(m) * 100 + Number(d);
}

/** 화살표·경로 색: 첫째·둘째 진영은 지도 위에서 잘 보이는 전용 색(CSS 변수), 셋째부터 진영 색 */
export function factionStroke(war: WarIndexEntry, factionId: string, entityColor: (id: string) => string | undefined): string {
  const i = factionIndex(war, factionId);
  return i === 0 ? 'var(--front-north)' : i === 1 ? 'var(--front-south)' : factionColor(war, factionId, entityColor);
}
