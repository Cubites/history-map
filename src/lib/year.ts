// 연도 처리 (DESIGN.md §4.4). 내부는 천문 연도(기원전 1년 = 0)로 계산하고 표시할 때만 변환한다.

export function formatYear(year: number, suffix = '년'): string {
  return year <= 0 ? `기원전 ${1 - year}${suffix}` : `${year}${suffix}`;
}

export function formatRange(from: number, to: number | null): string {
  return `${formatYear(from)} – ${to === null ? '현재' : formatYear(to)}`;
}

export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function formatDecade(year: number): string {
  const start = decadeOf(year);
  const end = start + 9;
  if (start > 0) return `${start}–${end}년`;
  if (end <= 0) return `기원전 ${1 - start}–${1 - end}년`;
  return `${formatYear(start)} – ${formatYear(end)}`;
}

/** "668", "668년", "기원전 57", "BC 57", "-57"(기원전 57년)을 천문 연도로 바꾼다. */
export function parseYearInput(text: string): number | null {
  const s = text.trim().replace(/년$/, '').trim();
  const bc = s.match(/^(?:기원전|bc|b\.c\.?)\s*(\d+)$/i) ?? s.match(/^-(\d+)$/);
  if (bc) return 1 - Number(bc[1]);
  const ad = s.match(/^(?:서기|ad|a\.d\.?)?\s*(\d+)$/i);
  return ad ? Number(ad[1]) : null;
}

export function clampYear(year: number, [start, end]: [number, number]): number {
  return Math.min(end, Math.max(start, year));
}

export function isAlive(entity: { from: number; to: number | null }, year: number): boolean {
  return entity.from <= year && (entity.to === null || year <= entity.to);
}
