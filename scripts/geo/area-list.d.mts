// area-list.mjs의 타입 선언: .ts 스크립트(check-gaps.ts)가 권역 목록을 가져올 때 tsc가 쓴다. 실행할 때는 .mjs를 쓴다.
// 권역 파일(areas/*.mjs)은 타입 검사를 받지 않으므로, 여기에는 약속된 export(DESIGN.md §5.2)의 모양만 적는다.
// 선언한 이름이 .mjs의 export와 맞는지는 npm run check:generator가 본다.

/** [경도, 위도] */
export type Position = number[];
/** 멀티폴리곤: 폴리곤 배열, 폴리곤은 링 배열(첫 링이 바깥), 링은 닫힌 점 배열 */
export type MultiPolygon = Position[][][];

/** 빈 땅 검사 구역 (DESIGN.md §5.4): name은 check:gaps 출력의 구역 이름, minus는 앞에 모은 구역 이름(검사 범위에서 뺌), from·to는 검사하는 해 [from, to)(없으면 모든 해) */
export interface GapZone {
  readonly name: string;
  readonly zone: MultiPolygon;
  readonly minus?: readonly string[];
  readonly from?: number;
  readonly to?: number | null;
}

/** 권역 파일이 내보내는 것: versions는 꼭, fillSpecs·source·gapZones·voids·sourceOf·extendable·extensions는 선택. 위층 권역이 쓰는 도형도 export한다 */
export interface AreaModule {
  readonly versions: Readonly<Record<string, readonly unknown[]>>;
  readonly fillSpecs?: readonly unknown[];
  readonly source?: string;
  readonly gapZones?: readonly GapZone[];
  /** 일부러 비운 땅 [from, to(끝 없음은 null), 멀티폴리곤] */
  readonly voids?: readonly unknown[];
  /** 나라 id → 출처 문구 (시대 파일의 source를 joinEras가 모은 것. 권역 source보다 먼저 씀) */
  readonly sourceOf?: Readonly<Record<string, string>>;
  /** 늘려도 되는 앞 권역 나라 id → [첫 해, 끝 해(미포함)] (engine.mjs '앞 권역 나라 늘리기') */
  readonly extendable?: Readonly<Record<string, readonly [number, number]>>;
  /** 앞 권역 나라에 더할 땅: 나라 id → [from, to(미포함), 멀티폴리곤] 목록 */
  readonly extensions?: Readonly<Record<string, readonly unknown[]>>;
  readonly [name: string]: unknown;
}

/** 권역 목록: [이름(areas/의 파일 이름), 권역 파일 모듈]. 순서가 곧 층 순서다 */
export declare const AREAS: readonly (readonly [name: string, area: AreaModule])[];
