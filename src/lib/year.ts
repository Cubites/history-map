// 연도 처리 (DESIGN.md §4.4). 내부는 천문 연도(기원전 1년 = 0)로 계산하고 표시할 때만 변환한다.

export function formatYear(year: number, suffix = '년'): string {
  // 2만 년보다 먼 과거(구석기)는 "약 70만 년 전"처럼 쓴다
  if (1 - year >= 20000) return `약 ${Math.round((1 - year) / 10000)}만 ${suffix ? '년 ' : ''}전`;
  return year <= 0 ? `기원전 ${1 - year}${suffix}` : `${year}${suffix}`;
}

/**
 * 선사 시대 단계 (DESIGN.md §4.4). 연도 막대 왼쪽 끝에 버튼으로 압축해 두고, 그 해로 가면 유적을 보여 준다.
 * 청동기 시대는 고조선(기원전 2333년~)과 겹치므로 연도 막대 안에서 다룬다.
 */
export const PREHISTORY = [
  { year: -699999, name: '구석기 시대', short: '구석기' },
  { year: -7999, name: '신석기 시대', short: '신석기' },
] as const;

/** 역사 시대(연도 막대)보다 앞선 연도의 선사 단계. 단계 사이의 연도는 앞 단계로 본다 */
export function prehistoryStage(year: number) {
  return [...PREHISTORY].reverse().find((s) => s.year <= year) ?? PREHISTORY[0];
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
