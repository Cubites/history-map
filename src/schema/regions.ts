// 권역과 권역 필터 (DESIGN.md §6.4.2, 2026-10-05). 빌드 스크립트와 앱이 함께 쓴다.
// 권역 값은 YAML에 적지 않고 빌드가 데이터 파일 이름에서 정해 entities.json·events.json·wars.json의 `region`에 넣는다.
// (이 `region`은 지리적 권역이다. 나라 스키마의 `level: 'region'`(나라가 아닌 지역 항목)과는 다른 것이다)
// - 나라: data/entities/<권역>.yaml의 <권역> (예: korea, europe). 대응표에 없으면 빌드가 멈춘다
// - 사건: data/events 파일 이름이 알려진 앞머리(STORY_FILE_PREFIXES)로 시작하면 그 권역, 두 자리 수로 시작하면(01-gojoseon.yaml 등) 한국사(korea).
//   둘 다 아니면 빌드가 멈춘다
// - 전쟁: data/wars 파일 이름이 알려진 앞머리로 시작하면 그 권역. `<영문자>-<두 자리 수>-` 꼴인데 앞머리를 모르면 빌드가 멈추고, 그 밖(imjin-war.yaml 등)은 한국사(korea)
// 화면의 권역 필터는 권역을 몇 개의 큰 단위로 묶어 쓴다 (REGION_FILTER_OF).
// 빌드 스크립트가 Node의 타입 제거 기능으로 직접 불러오므로 enum 같은 런타임 문법과 외부 패키지는 쓰지 않는다.

/** 화면의 권역 필터 단위. '전체'(all)는 따로 둔다 */
export const REGION_FILTERS = ['east-asia', 'europe'] as const;
export type RegionFilterUnit = (typeof REGION_FILTERS)[number];
export type RegionFilter = 'all' | RegionFilterUnit;

/**
 * 권역(데이터 파일 이름) → 필터 단위 대응표. **새 권역 파일을 만들면 여기에 한 줄을 더한다.**
 * 여기에 없는 나라 파일이 있으면 build:data·check:data가 멈춘다.
 * west(미국)는 한국사와 닿는 시기만 그린 유럽 밖 서양 나라라서 한국·동아시아에 둔다 (운영자가 정함)
 */
export const REGION_FILTER_OF: Record<string, RegionFilterUnit> = {
  korea: 'east-asia',
  'china-early': 'east-asia',
  china: 'east-asia',
  'inner-asia': 'east-asia',
  japan: 'east-asia',
  'southeast-asia': 'east-asia',
  west: 'east-asia',
  europe: 'europe',
};

/** 사건·전쟁 파일 이름 앞머리 → 권역. 앞에서부터 처음 맞는 것을 쓴다 (예: eu-01-revolutions-1789-1914.yaml → europe) */
export const STORY_FILE_PREFIXES: [prefix: string, region: string][] = [['eu-', 'europe']];
/** 한국사 사건 파일(01-gojoseon.yaml~08-contemporary.yaml)과 앞머리가 없는 전쟁 파일(imjin-war.yaml 등)의 권역 */
export const DEFAULT_STORY_REGION = 'korea';

/** 화면의 필터 단추와 권역을 고를 때 옮겨 갈 지도 범위 [[서, 남], [동, 북]] */
export const REGION_FILTER_INFO: Record<RegionFilter, { label: string; short: string; bounds?: [[number, number], [number, number]] }> = {
  all: { label: '전체', short: '전체' },
  // view.ts의 EAST_ASIA_BOUNDS(첫 화면·"동아시아" 단추)가 이 범위를 쓴다
  'east-asia': { label: '한국·동아시아', short: '동아시아', bounds: [[88, 18], [146, 54]] },
  // 아일랜드·포르투갈 ~ 볼가강(스탈린그라드), 크레타·키프로스 ~ 노르웨이 북단
  europe: { label: '유럽', short: '유럽', bounds: [[-11, 34], [48, 71]] },
};

/** 파일 경로에서 확장자를 뺀 이름 (경로 구분자는 / 와 \ 모두) */
const baseName = (file: string) => file.split(/[\\/]/).pop()!.replace(/\.[^.]+$/, '');

/** 나라 파일의 권역. 대응표에 없으면 undefined (빌드가 오류로 알린다) */
export function regionOfEntityFile(file: string): string | undefined {
  const name = baseName(file);
  return Object.hasOwn(REGION_FILTER_OF, name) ? name : undefined;
}

const knownPrefix = (name: string) => STORY_FILE_PREFIXES.find(([prefix]) => name.startsWith(prefix))?.[1];

/** 사건 파일(data/events)의 권역. 알려진 앞머리도, 한국사 시대 파일(두 자리 수로 시작)도 아니면 undefined (빌드가 오류로 알린다) */
export function regionOfEventFile(file: string): string | undefined {
  const name = baseName(file);
  return knownPrefix(name) ?? (/^\d{2}-/.test(name) ? DEFAULT_STORY_REGION : undefined);
}

/** 전쟁 파일(data/wars)의 권역. `<영문자>-<두 자리 수>-` 꼴인데 앞머리를 모르면 undefined (빌드가 오류로 알린다) */
export function regionOfWarFile(file: string): string | undefined {
  const name = baseName(file);
  return knownPrefix(name) ?? (/^([a-z]+)-\d{2}-/.test(name) ? undefined : DEFAULT_STORY_REGION);
}

/** 필터가 이 권역을 보여 주는지. 권역 값이 없거나 대응표에 없으면(이전 데이터) 늘 보여 준다 */
export function inRegionFilter(filter: RegionFilter, region: string | undefined): boolean {
  if (filter === 'all' || region === undefined) return true;
  const unit = Object.hasOwn(REGION_FILTER_OF, region) ? REGION_FILTER_OF[region] : undefined;
  return unit === undefined || unit === filter;
}

/** URL 값 등을 필터로. 모르는 값은 '전체' */
export function parseRegionFilter(value: string | null | undefined): RegionFilter {
  return value === 'all' || (REGION_FILTERS as readonly string[]).includes(value ?? '') ? (value as RegionFilter) : 'all';
}
