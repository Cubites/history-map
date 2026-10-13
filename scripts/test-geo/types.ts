// test:geo 검사 약속 (docs/DESIGN.md 지형 테스트 절). 검사 파일(checks/*.ts)과 러너(index.ts)가 함께 쓴다.
// 검사 파일은 `export const checks: Check[]`를 내보낸다. 이 파일의 꼴은 바꾸지 말 것(여러 검사가 이 꼴에 맞춰 있음).
import type { Context } from './context.ts';

export interface Options {
  /** --region: 권역 필터 단위(east-asia·europe) 또는 항목 파일 이름(korea·china·europe 등). 없으면 null(전체) */
  region: string | null;
  /** --years 1500-1600: 이 해 범위(양끝 포함)만. 없으면 null(전체) */
  years: [number, number] | null;
  /** --only: 검사 id 또는 검사 파일 이름(places·shapes·events·lines). 없으면 null */
  only: string[] | null;
  /** --skip: 같은 꼴 */
  skip: string[];
  /** --ci: 기본 생략하는 느린 검사(gen 등)도 돌림 */
  ci: boolean;
}

/** 검사가 찾은 한 건. key는 실행마다 같아야 함(좌표는 소수 2자리, 해·id 포함). 허용 목록·기준선이 이 열쇠로 맞춘다 */
export interface Item {
  key: string;
  msg: string;
  /** true면 실패가 아니라 경고(종료 코드에 영향 없음) */
  warn?: boolean;
}

export interface CheckResult {
  /** 검사한 수(지점 수, 버전 수 등) */
  checked: number;
  /** 문제 목록 */
  items: Item[];
  /** 요약 줄에 붙일 짧은 수치 (예: '평소 611·전쟁 871', '근거 URL 필요 1,402') */
  notes?: string[];
  /** 사정이 맞지 않아 건너뛴 검사 항목 수 (예: 결과가 낡은 전쟁의 지점). 러너가 머리 줄에 `건너뜀 N`으로 보인다. 건너뛴 채 통과하면 안 되는 CI에서는 검사가 이를 실패 항목으로도 낸다 */
  skipped?: number;
}

export interface Check {
  id: string;
  title: string;
  /** true면 기준선 대조를 검사가 스스로 한다(gaps: 줄이 `열쇠<TAB>넓이`). 러너는 기준선 대조·낡음 계산을 건너뛰고, --update-baseline은 그 파일의 baselineText(id)를 쓴다 */
  selfBaseline?: boolean;
  run(ctx: Context, opt: Options): Promise<CheckResult>;
}
