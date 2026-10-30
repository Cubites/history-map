// data/geo 도형 비교 (DESIGN.md §5.2 5번 '새 권역 더하기'): 기준 geojson과 지금 data/geo를 나라·기간별 대칭차 면적으로 비교한다.
// 사용: npm run compare:geo [-- 기준 폴더]   기준 폴더를 주지 않으면 git HEAD에 커밋된 data/geo와 비교한다.
// 바이트가 달라도 기간마다 대칭차 면적이 0이고 확실성·출처가 같으면 도형은 같다(일직선 위 꼭짓점이나 기간 나눔만 다름).
// 0보다 크면 도형이 실제로 바뀐 것이다. 면적은 경위도 평면 넓이(제곱도)를 그 위도의 대략적인 km²로 바꿔 보인다.
// 뒤 권역이 늘린 나라(scripts/geo/engine.mjs '앞 권역 나라 늘리기', data/geo/home/<id>.geojson이 있는 나라, 2026-10-29 A2-0)는 원래 권역 모양(home, 기준에 home이 없으면 기준 <id>.geojson)을
// 기준과 위처럼 견주고, 늘린 모양(<id>.geojson)은 원래 권역 모양을 모두 품는지(빠진 땅 0)와 기간마다 더한 땅의 넓이만 보인다. 원래 권역 모양이 같고 빠진 땅이 없으면 '늘림만 다름'(문제 아님).
// 원래 권역 버전이 없는 해의 늘린 버전(2026-10-30 A3-0)은 빠진 땅이 없고, 그 버전 넓이 전부를 '더한 땅 (원래 버전 없는 해)'로 보인다.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GEO = path.join(ROOT, 'data/geo');
const BASE = process.argv[2] ? path.resolve(process.argv[2]) : null;
const { polyclip } = await import(pathToFileURL(path.join(ROOT, 'scripts/geo/lib.mjs')).href);
const EPS = 1e-9; // 제곱도. 이보다 작으면 0으로 본다 (좌표를 소수 넷째 자리로 반올림한 뒤의 계산 오차)

const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    console.error(`git ${args[0]} 실패: git 저장소가 아니면 비교할 기준 폴더를 준다 (npm run compare:geo -- <기준 data/geo 폴더>)`);
    process.exit(2);
  }
};
const baseNames = BASE
  ? readdirSync(BASE).filter((f) => f.endsWith('.geojson'))
  : git('ls-tree', '--name-only', 'HEAD', 'data/geo/').split('\n').filter((p) => p.endsWith('.geojson')).map((p) => path.posix.basename(p));
const readBase = (f) => {
  if (!baseNames.includes(f)) return null;
  return BASE ? readFileSync(path.join(BASE, f), 'utf8') : git('show', `HEAD:data/geo/${f}`);
};
const curNames = readdirSync(GEO).filter((f) => f.endsWith('.geojson'));

const multi = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const area = (m) => m.reduce((sum, poly) => sum + poly.reduce((s2, r, k) => { let a2 = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a2 += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s2 + (k === 0 ? 1 : -1) * Math.abs(a2 / 2); }, 0), 0);
const km2 = (m, deg2) => { const ys = m.flat(2).map((c) => c[1]); const lat = (Math.min(...ys) + Math.max(...ys)) / 2; return deg2 * 111.32 ** 2 * Math.cos((lat * Math.PI) / 180); };
const points = (fs) => fs.reduce((s, f) => s + multi(f.geometry).flat(2).length, 0);
const END = 3000; // 끝 없음(to: null)을 비교할 때 쓰는 해

// 원래 권역 모양(home) 파일: 지금은 data/geo/home/, 기준은 기준 폴더의 home/ 또는 git HEAD의 data/geo/home/
const HOME = path.join(GEO, 'home');
const curHome = (f) => (existsSync(path.join(HOME, f)) ? readFileSync(path.join(HOME, f), 'utf8') : null);
const baseHomeNames = BASE
  ? (existsSync(path.join(BASE, 'home')) ? readdirSync(path.join(BASE, 'home')).filter((f) => f.endsWith('.geojson')) : [])
  : git('ls-tree', '--name-only', 'HEAD', 'data/geo/home/').split('\n').filter((p) => p.endsWith('.geojson')).map((p) => path.posix.basename(p));
const baseHome = (f) => (!baseHomeNames.includes(f) ? null : BASE ? readFileSync(path.join(BASE, 'home', f), 'utf8') : git('show', `HEAD:data/geo/home/${f}`));

// 두 geojson 글을 기간마다 견준다: op가 'xor'면 대칭차(같은지), 'minus'면 앞 것에만 있는 땅(뒤 것이 앞 것을 품는지), 'plus'면 뒤 것에만 있는 땅(더한 땅)
const pick = (fs, y) => fs.find((x) => x.properties.from <= y && y < (x.properties.to ?? END));
function periods(oldText, curText, op = 'xor') {
  const A = JSON.parse(oldText).features, B = JSON.parse(curText).features;
  const years = [...new Set([...A, ...B].flatMap((x) => [x.properties.from, x.properties.to ?? END]))].sort((a, b) => a - b);
  const diffs = [];
  for (let i = 0; i < years.length - 1; i++) {
    const [y0, y1] = [years[i], years[i + 1]];
    const a = pick(A, (y0 + y1) / 2), b = pick(B, (y0 + y1) / 2);
    if (!a && !b) continue;
    // 원래 권역 버전이 없는 해의 늘린 버전: 빠진 땅은 없고(minus), 그 버전 전부가 더한 땅(plus)
    if (!a && op === 'minus') continue;
    if (!a && op === 'plus') { const mb = multi(b.geometry); const d = Math.abs(area(mb)); if (d > EPS) diffs.push(`${y0}~${y1}: 더한 땅 약 ${km2(mb, d).toFixed(0)}km² (원래 버전 없는 해)`); continue; }
    if (!a || !b) { diffs.push(`${y0}~${y1}: ${a ? '지금' : '기준'}에는 영토 없음`); continue; }
    if (op === 'xor' && (a.properties.certainty !== b.properties.certainty || a.properties.source !== b.properties.source)) diffs.push(`${y0}~${y1}: 확실성·출처가 다름`);
    const [ma, mb] = [multi(a.geometry), multi(b.geometry)];
    const x = op === 'xor' ? polyclip.xor(ma, mb) : op === 'minus' ? polyclip.difference(ma, mb) : polyclip.difference(mb, ma);
    const d = Math.abs(area(x));
    if (d > EPS) diffs.push(`${y0}~${y1}: ${op === 'xor' ? '대칭차' : op === 'minus' ? '빠진 땅' : '더한 땅'} 약 ${km2(x, d).toFixed(op === 'plus' ? 0 : 3)}km²`);
  }
  return { diffs, A, B };
}

let same = 0, geomSame = 0, added = 0, problems = 0, extendedOnly = 0;
for (const f of [...new Set([...baseNames, ...curNames])].sort()) {
  const cur = curNames.includes(f) ? readFileSync(path.join(GEO, f), 'utf8') : null;
  const old = readBase(f);
  const [hCur, hOld] = [curHome(f), baseHome(f)];
  if (cur === old && hCur === hOld) { same++; continue; }
  if (old === null) { added++; console.log(`  새 파일  ${f}`); continue; }
  if (cur === null) { problems++; console.log(`  사라짐   ${f}`); continue; }
  if (hCur !== null || hOld !== null) {
    // 늘린 나라: 원래 권역 모양끼리 견주고, 늘린 모양이 원래 권역 모양을 품는지 본다
    const homeNow = hCur ?? cur, homeBefore = hOld ?? old;
    const home = homeNow === homeBefore ? { diffs: [] } : periods(homeBefore, homeNow);
    const lost = hCur === null ? { diffs: [] } : periods(hCur, cur, 'minus');
    const plus = hCur === null ? { diffs: [] } : periods(hCur, cur, 'plus');
    if (home.diffs.length || lost.diffs.length) {
      problems++;
      console.log(`  도형 다름 ${f} (늘린 나라)`);
      for (const d of home.diffs) console.log(`    원래 권역 모양 ${d}`);
      for (const d of lost.diffs) console.log(`    늘린 모양 ${d}`);
    } else {
      extendedOnly++;
      console.log(`  늘림만 다름 ${f} (원래 권역 모양 ${homeNow === homeBefore ? '바이트 같음' : '기간마다 대칭차 0'}, 늘린 모양에서 빠진 땅 0)`);
      for (const d of plus.diffs) console.log(`    ${d}`);
    }
    continue;
  }
  const { diffs, A, B } = periods(old, cur);
  if (diffs.length) { problems++; console.log(`  도형 다름 ${f}\n    ${diffs.join('\n    ')}`); }
  else { geomSame++; console.log(`  도형 같음 ${f} (바이트만 다름: 버전 ${A.length}→${B.length}개, 꼭짓점 ${points(A)}→${points(B)}개, 기간마다 대칭차 0)`); }
}
console.log(`기준 ${BASE ?? 'git HEAD'}: 바이트 같음 ${same}개, 도형 같음 ${geomSame}개, 늘림만 다름 ${extendedOnly}개, 새 파일 ${added}개, 다름·사라짐 ${problems}개`);
process.exit(problems ? 1 : 0);
