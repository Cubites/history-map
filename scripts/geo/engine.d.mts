// engine.mjs의 타입 선언: .ts 스크립트가 가져오는 것만 적는다(지금은 check-gaps.ts의 collectGapZones). 실행할 때는 .mjs를 쓴다.
// 다른 export(mergeAreas·fillEmptyLand·writeGeo)를 .ts에서 쓰게 되면 여기에 선언을 더한다. 선언한 이름이 .mjs의 export와 맞는지는 npm run check:generator가 본다.
import type { AreaModule, MultiPolygon } from './area-list.mjs';

/** collectGapZones가 모은 빈 땅 검사 구역: area는 그 구역을 내보낸 권역 이름, minus는 없으면 빈 배열, from·to(검사하는 해 [from, to))는 없으면 null */
export interface CollectedGapZone {
  readonly area: string;
  readonly name: string;
  readonly zone: MultiPolygon;
  readonly minus: readonly string[];
  readonly from: number | null;
  readonly to: number | null;
}

/** 권역 파일의 gapZones를 권역 목록 순서대로 모은다. 모양이 틀리면 오류를 던진다 */
export declare function collectGapZones(areas: readonly (readonly [string, AreaModule])[]): CollectedGapZone[];
