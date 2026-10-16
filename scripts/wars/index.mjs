// 전쟁 보기 생성기 진입점 (DESIGN.md 4.5, docs/guides/war.md 2절): 세계 대전 점령 지역 geojson과 전쟁 YAML 일부를 차례로 다시 만든다.
// 사용: npm run gen:wars [-- [저장소 경로] [--out 폴더] [--only 이름,...]]
//   저장소 경로   없으면 이 스크립트가 든 저장소. 입력(data/geo·data/base·node_modules)은 여기서 읽는다.
//   --out 폴더    data/wars를 저장소 대신 <폴더>/data/wars에 쓰고 거기서 읽는다(저장소 data/wars는 건드리지 않음. test:geo의 gen 검사가 씀).
//                 처음에는 저장소 data/wars 맨 위 파일(YAML)만 복사해 시작하고 geojson 폴더는 새로 만든다.
//   --only 이름   그 생성기만 돈다(쉼표로 여럿). 이름: world-war-1, europe, asia-pacific, overview (world-war-2 = europe·asia-pacific·overview 셋). 다른 이름·옵션은 오류
// 순서와 하는 일 (앞 결과를 뒤가 읽으므로 순서를 바꾸지 않는다):
//   1 world-war-1    data/wars/world-war-1/*.geojson
//   2 europe         data/wars/world-war-2/europe/*.geojson + eu-02-world-war-2.yaml의 머리와 europe 전역(뒤에 붙은 다른 전역은 그대로 둠)
//   3 asia-pacific   data/wars/world-war-2/asia-pacific/*.geojson (YAML은 손으로 쓴 asia-pacific 전역을 그대로 둠)
//   4 overview       data/wars/world-war-2/overview/*.geojson + eu-02-world-war-2.yaml 끝의 overview 전역 (2·3의 YAML·geojson을 읽음)
// 국경(data/geo)을 고친 뒤에는 npm run gen:geo → npm run gen:wars 순서로 돌린다. 생성기는 한 번 돌리면 같은 입력에서 바이트까지 같은 결과를 낸다.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { parseArgs } from './args.mjs';

const STEPS = [
  { id: 'world-war-1', file: 'world-war-1/gen.mjs' },
  { id: 'europe', file: 'world-war-2/europe/gen.mjs' },
  { id: 'asia-pacific', file: 'world-war-2/asia-pacific/gen.mjs' },
  { id: 'overview', file: 'world-war-2/overview/gen.mjs' },
];
const args = parseArgs(process.argv.slice(2));
const want = (args.only ?? STEPS.map((s) => s.id)).flatMap((n) => (n === 'world-war-2' ? ['europe', 'asia-pacific', 'overview'] : [n]));
const unknown = want.filter((n) => !STEPS.some((s) => s.id === n));
if (unknown.length) throw new Error(`모르는 생성기: ${unknown.join(', ')} (${STEPS.map((s) => s.id).join(', ')})`);

const passArgs = [...(args.repo ? [args.repo] : []), ...(args.out ? ['--out', args.out] : [])];
const t0 = Date.now();
const times = [];
for (const step of STEPS.filter((s) => want.includes(s.id))) {
  const t = Date.now();
  console.log(`── ${step.id} ──`);
  const r = spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(import.meta.dirname, step.file), ...passArgs], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`생성 실패: ${step.id} (코드 ${r.status ?? String(r.error)})`);
    process.exit(r.status || 1);
  }
  times.push(`${step.id} ${((Date.now() - t) / 1000).toFixed(0)}초`);
}
console.log(`전쟁 생성 끝: ${times.join(', ')}, 합계 ${((Date.now() - t0) / 1000).toFixed(0)}초`);
