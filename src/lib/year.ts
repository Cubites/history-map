// 연도 처리 (DESIGN.md §4.4). 내부는 천문 연도(기원전 1년 = 0)로 계산하고 표시할 때만 변환한다.

export function formatYear(year: number, suffix = '년'): string {
  // 2만 년보다 먼 과거(구석기)는 "약 70만 년 전"처럼 쓴다
  if (1 - year >= 20000) return `약 ${Math.round((1 - year) / 10000)}만 년 전`;
  return year <= 0 ? `기원전 ${1 - year}${suffix}` : `${year}${suffix}`;
}

/**
 * 선사 시대 단계 (DESIGN.md §4.4). 연도 막대 왼쪽 끝에 버튼으로 압축해 두고, 그 해로 가면 유적을 보여 준다.
 * 청동기 시대는 고조선(기원전 2333년~)과 겹치므로 연도 막대 안에서 다룬다.
 *
 * 2026-11-25(사본 시험): 구석기·신석기 대신 "빙하기"·"빙하기 후"로 가른다. 구석기·신석기는 생활 방식으로 정하는 이름이라
 * 지역마다 시작이 다르지만(서아시아 기원전 1만 년 무렵, 한국 기원전 8000년 무렵), 마지막 빙하기가 끝난 때는 세계가 같기 때문이다.
 * - year: 단추를 누르면 가는 해. 사건(data/events)의 year와 같은 10년 구간이어야 그 사건이 보이므로 옮기지 않는다
 *   (빌드 검사 scripts/build-data/index.ts의 PREHISTORY_YEARS와도 짝).
 * - from: 그 단계가 시작하는 해. 입력한 해가 어느 단계인지는 이 값으로 가른다.
 *   빙하기 후의 from은 마지막 빙하기가 끝난 약 1만 2천 년 전(기원전 9700년 무렵). 운영자 검수 필요(공식 출처로 확인하지 않은 값)
 * - hint: 단추에 마우스를 올리면 이름 옆에 보이는 시기 글
 */
export const PREHISTORY = [
  { year: -699999, from: -Infinity, name: '빙하기', short: '빙하기', hint: '약 1만 2천 년 전까지' },
  { year: -7999, from: -9699, name: '빙하기 후', short: '빙하기 후', hint: '약 1만 2천 년 전부터' },
] as const;

/** 역사 시대(연도 막대)보다 앞선 연도의 선사 단계: from이 그 해보다 앞이거나 같은 마지막 단계 */
export function prehistoryStage(year: number) {
  return [...PREHISTORY].reverse().find((s) => s.from <= year) ?? PREHISTORY[0];
}

/**
 * 시대 구분 (2026-11-23, 연도 막대에 표시). from은 그 시대가 시작하는 해(천문 연도), 다음 시대의 from 앞까지다.
 * - 한국·동아시아 권역: 한국사의 통상 구분 — 고대(~917) · 중세(고려 건국 918~) · 근세(조선 건국 1392~) · 근대(개항 1876~) · 현대(광복 1945~)
 * - 그 밖(세계와 다른 권역): 세계사의 통상 구분 — 고대(~475) · 중세(서로마 멸망 476~) · 근세(콘스탄티노폴리스 함락 1453~) · 근대(프랑스 혁명 1789~) · 현대(제2차 세계 대전 종전 1945~)
 * 경계 해는 책마다 조금씩 다르다(운영자 검수 필요). 고치려면 이 표만 바꾸면 된다
 */
export interface Era {
  from: number;
  name: string;
}
const ERAS_KOREA: Era[] = [
  { from: -Infinity, name: '고대' },
  { from: 918, name: '중세' },
  { from: 1392, name: '근세' },
  { from: 1876, name: '근대' },
  { from: 1945, name: '현대' },
];
const ERAS_WORLD: Era[] = [
  { from: -Infinity, name: '고대' },
  { from: 476, name: '중세' },
  { from: 1453, name: '근세' },
  { from: 1789, name: '근대' },
  { from: 1945, name: '현대' },
];
export function erasFor(regionFilter: string): Era[] {
  return regionFilter === 'east-asia' ? ERAS_KOREA : ERAS_WORLD;
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
