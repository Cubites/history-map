// 전쟁 날짜의 달력 (docs/guides/standards.md 4절). 빌드 스크립트와 앱이 함께 쓴다.
// 빌드 스크립트가 Node의 타입 제거 기능으로 직접 불러오므로 enum 같은 런타임 문법과 외부 패키지는 쓰지 않는다.
// 날짜는 출처 달력 그대로 YYYY-MM-DD(천문 연도, 모르는 달·날은 00)로 적고, 어느 달력인지는 전쟁마다 `calendar`로 밝힌다.
// 새 달력(이슬람력 등)이 필요하면 CALENDARS에 값을 더하고 이 파일의 daysInMonth·CALENDAR_SUFFIX·defaultCalendar를 함께 고친다.

/** 달력 종류: lunar 음력, julian 율리우스력, gregorian 그레고리력(양력) */
export const CALENDARS = ['lunar', 'julian', 'gregorian'] as const;
export type Calendar = (typeof CALENDARS)[number];

/** 화면에서 날짜 뒤에 붙이는 달력 표시. 양력(gregorian)은 표시하지 않는다 */
export const CALENDAR_SUFFIX: Record<Calendar, string> = {
  lunar: '(음력)',
  julian: '(율리우스력)',
  gregorian: '',
};

/** 조선이 양력(그레고리력)을 쓰기 시작한 해. 이 해 앞의 한국 날짜는 음력이다 */
export const KOREA_SOLAR_FROM = 1896;
/** 유럽이 그레고리력으로 바꾼 해(교황청 1582, 나라마다 더 늦었지만 기준은 하나로 둔다). 이 해 앞의 유럽 날짜는 율리우스력이다 */
export const EUROPE_GREGORIAN_FROM = 1582;

/**
 * 전쟁에 `calendar`가 없을 때의 기본값. region은 전쟁 파일 이름이 정한 권역(korea·europe 등), year는 첫 장면의 연도(천문 연도).
 * 한국 전근대(1896년 앞)는 lunar, 유럽 1582년 앞은 julian, 그 밖은 gregorian.
 */
export function defaultCalendar(region: string, year: number): Calendar {
  if (region === 'korea' && year < KOREA_SOLAR_FROM) return 'lunar';
  if (region === 'europe' && year < EUROPE_GREGORIAN_FROM) return 'julian';
  return 'gregorian';
}

/** 율리우스력의 윤년: 천문 연도가 4로 나눠지는 해 (음수도 같은 규칙) */
const isJulianLeap = (y: number) => y % 4 === 0;
const isGregorianLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);

/** 그 달의 날수 (month는 1~12). 음력은 큰달 30일까지만 허용하고 작은달(29일)과 구분하지 않는다 */
function daysInMonth(calendar: Calendar, y: number, m: number): number {
  if (calendar === 'lunar') return 30;
  const leap = calendar === 'julian' ? isJulianLeap(y) : isGregorianLeap(y);
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/**
 * 날짜가 그 달력에 있는 날이 아니면 이유를, 맞으면 null.
 * 모르는 달·날은 00으로 적을 수 있다 (달이 00이면 날도 00). 형식(YYYY-MM-DD)은 스키마가 먼저 검사한다.
 */
export function calendarDateProblem(date: string, calendar: Calendar): string | null {
  const m = date.match(/^(-?\d+)-(\d+)-(\d+)$/);
  if (!m) return '날짜 형식이 YYYY-MM-DD가 아님';
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo === 0) return d === 0 ? null : '달을 모르면(00) 날도 00이어야 함';
  if (mo > 12) return `${mo}월이 없음`;
  if (d === 0) return null;
  if (d > daysInMonth(calendar, y, mo)) return `${y}년 ${mo}월에 ${d}일이 없음`;
  if (calendar === 'gregorian' && y === 1582 && mo === 10 && d >= 5 && d <= 14) return '그레고리력 1582년 10월 5~14일은 없는 날(달력 개정으로 건너뜀)';
  return null;
}
