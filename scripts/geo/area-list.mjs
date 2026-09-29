// 권역 목록 (DESIGN.md §5.2): 국경 생성기에 들어가는 권역 파일과 그 순서. 생성기(generate-geo.mjs)·빈 땅 검사(check-gaps.ts)·생성기 검사(check-generator.mjs)가 함께 쓴다.
// 가져와도 되는 것: areas/의 권역 파일뿐. scripts/geo의 다른 파일은 이 파일을 가져오지 않는다(권역 파일이 가져오면 순환이 된다).
// - 이름은 areas/의 파일 이름(확장자 제외)과 같다
// - 순서가 곧 층 순서다: 권역 파일은 lib·shared와, 이 목록에서 자기보다 앞에 있는 권역 파일만 import한다
// - versions를 합치는 순서, 채우기 specs를 이어 붙이는 순서, 빈 땅 검사 구역(gapZones)을 모으는 순서이기도 하다. 그래서 새 권역은 끝에 붙인다
// - areas/의 .mjs 파일은 모두 여기 있어야 한다. 파일만 두고 등록을 빠뜨리면 생성기가 지우기 전에 멈춘다
// .ts 스크립트가 가져올 때 tsc가 쓰는 타입 선언은 area-list.d.mts에 있다.
import * as koreaArea from './areas/korea.mjs';
import * as innerAsiaArea from './areas/inner-asia.mjs';
import * as chinaArea from './areas/china.mjs';
import * as westArea from './areas/west.mjs';
import * as japanArea from './areas/japan.mjs';
import * as southeastAsiaArea from './areas/southeast-asia.mjs';

export const AREAS = [
  ['korea', koreaArea],
  ['inner-asia', innerAsiaArea],
  ['china', chinaArea],
  ['west', westArea],
  ['japan', japanArea],
  ['southeast-asia', southeastAsiaArea],
];
