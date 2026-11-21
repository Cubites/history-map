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
// 아메리카는 2026-11-21에 북아메리카(미국·캐나다·그린란드)와 라틴아메리카(멕시코 이남·카리브)로 나눴다. 이 배열 순서는 자동 고르기(view.ts regionOfView)의 우선순위다:
// 두 범위가 겹치는 북위 24~32.7°(멕시코 북부)는 라틴아메리카가 먼저 골라지고, 미국 남쪽 가장자리(텍사스·플로리다)는 view.ts REGION_PICK_FIRST가 북아메리카로 먼저 고른다
export const REGION_FILTERS = ['east-asia', 'europe', 'middle-east', 'south-asia', 'central-asia', 'southeast-asia', 'sub-saharan-africa', 'oceania', 'latin-america', 'north-america'] as const;
export type RegionFilterUnit = (typeof REGION_FILTERS)[number];
export type RegionFilter = 'all' | RegionFilterUnit;
/** 지도 왼쪽 아래 권역 단추의 순서(세계 다음). 아시아 → 유럽 → 아프리카 → 아메리카 → 오세아니아 */
export const REGION_BUTTONS: readonly RegionFilterUnit[] = ['east-asia', 'central-asia', 'south-asia', 'southeast-asia', 'middle-east', 'europe', 'sub-saharan-africa', 'north-america', 'latin-america', 'oceania'];

/**
 * 권역(데이터 파일 이름) → 필터 단위 대응표. **새 권역 파일을 만들면 여기에 한 줄을 더한다.**
 * 여기에 없는 나라 파일이 있으면 build:data·check:data가 멈춘다.
 * 이 표는 파일의 **기본 단위**다. 한 나라가 여러 단위에 걸치거나(오스만 제국 → 유럽·서아시아) 파일의 기본 단위와 다른 단위에 있으면(아메리카 파일의 미국 → 북아메리카)
 * region-units.ts의 ENTITY_UNITS가 그 나라의 단위 목록을 따로 준다(빌드가 entities.json·events.json의 `units`에 넣음). 아메리카 파일의 기본 단위는 라틴아메리카다.
 */
export const REGION_FILTER_OF: Record<string, RegionFilterUnit> = {
  korea: 'east-asia',
  'china-early': 'east-asia',
  china: 'east-asia',
  'inner-asia': 'east-asia',
  japan: 'east-asia',
  'southeast-asia': 'east-asia',
  europe: 'europe',
  'china-pre-qin': 'east-asia',
  'china-warring-states': 'east-asia',
  'china-sixteen-kingdoms': 'east-asia',
  'china-ten-kingdoms': 'east-asia',
  'middle-east': 'middle-east',
  'middle-east-modern': 'middle-east',
  'middle-east-early-modern': 'middle-east',
  'middle-east-medieval': 'middle-east',
  'middle-east-ancient': 'middle-east',
  'middle-east-orient': 'middle-east',
  'south-asia': 'south-asia',
  'south-asia-modern': 'south-asia',
  'south-asia-colonial': 'south-asia',
  'south-asia-sultanate': 'south-asia',
  'south-asia-ancient': 'south-asia',
  'central-asia': 'central-asia',
  'central-asia-modern': 'central-asia',
  'central-asia-early-modern': 'central-asia',
  'central-asia-early-medieval': 'central-asia',
  'central-asia-high-medieval': 'central-asia',
  'central-asia-late-medieval': 'central-asia',
  'central-asia-ancient-bc': 'central-asia',
  'central-asia-late-antiquity': 'central-asia',
  'southeast-asia-modern': 'southeast-asia', // 동남아 E1(2026-11-08): 새 단위 southeast-asia. 남베트남 파일 'southeast-asia'만 'east-asia' 그대로(docs/southeast-asia/00-scope.md 결정 8)
  'southeast-asia-colonial': 'southeast-asia', // 동남아 E2(2026-11-08): E1과 같은 새 단위 southeast-asia
  'southeast-asia-early-modern': 'southeast-asia', // 동남아 E3(2026-11-09): E1·E2와 같은 새 단위 southeast-asia
  'southeast-asia-ancient': 'southeast-asia', // 동남아 E4(2026-11-09): E1~E3과 같은 새 단위 southeast-asia
  'sub-saharan-africa': 'sub-saharan-africa', // 사하라 이남 F1(2026-11-11): 새 단위 sub-saharan-africa
  'sub-saharan-africa-modern': 'sub-saharan-africa', // 사하라 이남 F1(2026-11-11): 새 단위 sub-saharan-africa
  'sub-saharan-africa-decolonization': 'sub-saharan-africa', // 사하라 이남 F2(2026-11-11): F1과 같은 단위 sub-saharan-africa
  'sub-saharan-africa-postwar': 'sub-saharan-africa', // 사하라 이남 F3(2026-11-12): F1과 같은 단위 sub-saharan-africa
  'sub-saharan-africa-colonial': 'sub-saharan-africa', // 사하라 이남 F4(2026-11-12): F1과 같은 단위 sub-saharan-africa
  'sub-saharan-africa-partition': 'sub-saharan-africa', // 사하라 이남 F5(2026-11-13): F1과 같은 단위 sub-saharan-africa
  'sub-saharan-africa-prepartition': 'sub-saharan-africa', // 사하라 이남 F6(2026-11-13): F1과 같은 단위 sub-saharan-africa
  'sub-saharan-africa-precolonial': 'sub-saharan-africa', // 사하라 이남 F7(2026-11-14): F1과 같은 단위 sub-saharan-africa
  americas: 'latin-america', // 아메리카 M1 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  'americas-modern': 'latin-america', // 아메리카 M1 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  'americas-independence': 'latin-america', // 아메리카 M2 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  'americas-colonial': 'latin-america', // 아메리카 M3 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  'americas-precolumbian': 'latin-america', // 아메리카 M4 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  'americas-ancient': 'latin-america', // 아메리카 M5 — 기본 단위는 라틴아메리카, 북아메리카 나라는 region-units.ts
  oceania: 'oceania', // 오세아니아 M1(2026-11-17): 새 단위 oceania
  'oceania-modern': 'oceania', // 오세아니아 M1(2026-11-17): 새 단위 oceania
  'oceania-colonial': 'oceania', // 오세아니아 M2(2026-11-18): M1과 같은 단위 oceania
};

/** 사건·전쟁 파일 이름 앞머리 → 권역. 앞에서부터 처음 맞는 것을 쓴다 (예: eu-01-revolutions-1789-1914.yaml → europe) */
export const STORY_FILE_PREFIXES: [prefix: string, region: string][] = [['eu-', 'europe'], ['cn-', 'china'], ['me-', 'middle-east'], ['sa-', 'south-asia'], ['ca-', 'central-asia'], ['sea-', 'southeast-asia'], ['ssa-', 'sub-saharan-africa'], ['am-', 'americas'], ['oc-', 'oceania']];
/** 한국사 사건 파일(01-gojoseon.yaml~08-contemporary.yaml)과 앞머리가 없는 전쟁 파일(imjin-war.yaml 등)의 권역 */
export const DEFAULT_STORY_REGION = 'korea';

/** 화면의 필터 단추와 권역을 고를 때 옮겨 갈 지도 범위 [[서, 남], [동, 북]] */
// bounds: 자동 고르기(화면 가운데가 이 안이면 그 권역)와 배율 기준에 쓰는 권역 전체 범위. focus: 단추를 눌렀을 때 옮겨 갈 범위(없으면 bounds).
// focus는 범위가 너무 넓어 한가운데가 엉뚱한 곳(리비아 사막·태평양)에 떨어지는 권역에만 둔다(2026-11-21). focus의 한가운데는 자기 bounds 안이고 자동 고르기에서 자기 권역이어야 한다
export const REGION_FILTER_INFO: Record<RegionFilter, { label: string; short: string; bounds?: [[number, number], [number, number]]; focus?: [[number, number], [number, number]] }> = {
  all: { label: '전체', short: '전체' },
  // view.ts의 EAST_ASIA_BOUNDS(첫 화면·"동아시아" 단추)가 이 범위를 쓴다
  'east-asia': { label: '한국·동아시아', short: '동아시아', bounds: [[88, 18], [146, 54]] },
  // 아일랜드·포르투갈 ~ 볼가강(스탈린그라드), 크레타·키프로스 ~ 노르웨이 북단
  europe: { label: '유럽', short: '유럽', bounds: [[-11, 34], [48, 71]] },
  // 서사하라·모로코 대서양 기슭 ~ 이란 동쪽 끝, 예멘·사헬 북쪽 가장자리 ~ 튀르키예 북쪽 해안. 유럽 범위와 겹치는 곳의 자동 고르기는 view.ts의 REGION_PICK_FIRST
  // focus: 튀니지 ~ 이란 동쪽, 예멘 ~ 캅카스. 한가운데는 요르단·시리아 사막(동경 38°, 북위 31°) — 이집트·레반트·메소포타미아가 가운데 오고 모로코·알제리 서부는 화면 밖
  'middle-east': { label: '서아시아·북아프리카', short: '서아시아', bounds: [[-17, 12], [63.5, 42]], focus: [[8, 12], [68, 50]] },
  // 발루치스탄 서쪽 끝(이란 국경) ~ 아루나찰 동쪽 끝, 스리랑카 남쪽 끝 ~ 카라코람·길기트 북쪽 끝. 서아시아·동아시아 범위와 겹치는 곳은 앞 단위가 먼저 골라짐
  'south-asia': { label: '남아시아', short: '남아시아', bounds: [[60.5, 5], [97.5, 37.2]] },
  // 카스피해 동쪽 기슭(망기스타우) ~ 신장 동쪽 끝(하미), 아프가니스탄 남쪽 끝 ~ 카자흐스탄 북쪽 끝. 앞 단위와 겹치는 곳은 앞 단위가 먼저 골라짐
  'central-asia': { label: '중앙아시아', short: '중앙아시아', bounds: [[46.4, 29.3], [96.5, 55.6]] },
  // 미얀마 서쪽 끝(나프강) ~ 서뉴기니 동쪽 끝(동경 141°), 티모르·자와 남쪽 ~ 미얀마 북쪽 끝(00-scope 기본값 22). 앞 단위(동아시아 북위 18° 북쪽·남아시아 동경 97.5° 서쪽)와 겹치는 곳은 앞 단위가 먼저 골라짐
  'southeast-asia': { label: '동남아시아', short: '동남아', bounds: [[92, -11], [141, 29]] },
  // 카보베르데 서쪽 끝(서경 26°) ~ 모리셔스 본섬 동쪽(동경 58° — 로드리게스는 밖), 남아프리카 남쪽 끝(남위 35°) ~ 모리타니 북쪽 끝(북위 25.2°, 00-scope 2절). 앞 단위(서아시아 북위 12° 북쪽)와 겹치는 곳은 앞 단위가 먼저 골라짐
  'sub-saharan-africa': { label: '사하라 이남 아프리카', short: '사하라 이남', bounds: [[-26, -35], [58, 25.2]] },
  // 멕시코 북쪽 끝(북위 32.7°) ~ 티에라델푸에고 남쪽(남위 56°), 바하칼리포르니아 서쪽 끝(서경 118°) ~ 브라질 동쪽 끝(서경 34°). 한가운데는 페루 중부(리마 부근).
  // 미국 남쪽 가장자리(북위 24~32.7°의 텍사스·플로리다 등)와 겹치는 곳은 view.ts REGION_PICK_FIRST가 북아메리카로 먼저 고른다
  'latin-america': { label: '라틴아메리카', short: '라틴아메리카', bounds: [[-118, -56], [-34, 32.7]] },
  // 알류샨 서쪽 끝(서경 180°) ~ 그린란드 동쪽 끝(서경 11°), 플로리다 남쪽(북위 24°) ~ 그린란드 북쪽 끝(북위 84°). 앞 단위(오세아니아·라틴아메리카)와 겹치는 곳은 앞 단위가 먼저 골라짐.
  // focus: 미국 본토와 캐나다 남반부. 한가운데는 미국 북부 평원(서경 98°, 북위 45°) — 알래스카·그린란드·캐나다 북극 섬은 화면 밖
  'north-america': { label: '북아메리카', short: '북아메리카', bounds: [[-180, 24], [-11, 84]], focus: [[-138, 20], [-58, 70]] },
  // 인도양 쪽 오스트레일리아 서쪽 끝(동경 112.5°) ~ 핏케언·이스터섬 서쪽(서경 124° = 236 — 경도 180°를 넘는 범위, view.ts inBox가 lon + 360도 봄), 매쿼리섬 남쪽(남위 54°) ~ 하와이·북마리아나 북쪽(북위 29°, 00-scope 2절). 앞 단위(동남아 동경 141° 서쪽)와 겹치는 곳은 앞 단위가 먼저 골라짐(팔라우·야프는 view.ts REGION_PICK_FIRST)
  // focus: 오스트레일리아·뉴질랜드·멜라네시아·사모아. 한가운데는 오스트레일리아 동부(동경 150°, 남위 22°) — 하와이·타히티·이스터섬은 화면 밖
  oceania: { label: '오세아니아', short: '오세아니아', bounds: [[112.5, -54], [236, 29]], focus: [[110, -50], [190, 6]] },
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

/**
 * 필터가 이 권역을 보여 주는지. 권역 값이 없거나 대응표에 없으면(이전 데이터) 늘 보여 준다.
 * units(빌드가 붙인 단위 목록 — 여러 권역에 걸치는 나라, 아메리카의 나라·사건)가 있으면 그 목록에 필터가 들어 있는지로 정한다
 */
export function inRegionFilter(filter: RegionFilter, region: string | undefined, units?: readonly string[]): boolean {
  if (filter === 'all') return true;
  if (units?.length) return units.includes(filter);
  if (region === undefined) return true;
  const unit = Object.hasOwn(REGION_FILTER_OF, region) ? REGION_FILTER_OF[region] : undefined;
  return unit === undefined || unit === filter;
}

/** 나라·사건의 필터 단위 목록: units가 있으면 그것, 없으면 파일의 기본 단위 하나 */
export function unitsOf(item: { region: string; units?: readonly RegionFilterUnit[] }): readonly RegionFilterUnit[] {
  if (item.units?.length) return item.units;
  return Object.hasOwn(REGION_FILTER_OF, item.region) ? [REGION_FILTER_OF[item.region]] : [];
}

/** 권역 단추를 눌렀을 때 옮겨 갈 범위(focus가 없으면 권역 전체 범위) */
export function regionFocusBounds(filter: RegionFilter) {
  const info = REGION_FILTER_INFO[filter];
  return info.focus ?? info.bounds;
}

/** URL 값 등을 필터로. 모르는 값은 '전체' */
export function parseRegionFilter(value: string | null | undefined): RegionFilter {
  return value === 'all' || (REGION_FILTERS as readonly string[]).includes(value ?? '') ? (value as RegionFilter) : 'all';
}
