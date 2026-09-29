// 국경 생성기 공통 기반 (DESIGN.md §5.2, 층 0): polyclip-ts 불러오기, 도형 도우미, 행정구역 조각 불러오기와 합치기.
// 가져와도 되는 것: node 내장 모듈과 topojson-client(조각 합치기)뿐. 생성기의 다른 파일(shared·engine·권역 파일)은 polyclip·도우미·조각을 모두 여기서 가져다 쓴다.
// polyclip은 이 파일에서 한 번만 불러온다(이 파일 위치 기준으로 찾음). 프로젝트 폴더와 명령줄 인자는 모른다(진입 파일이 정함).
// 그래서 다른 스크립트도 인자와 상관없이 권역 파일을 import할 수 있다.
// polyclip.setPrecision은 부르지 않는다: polyclip-ts 0.16.8의 precision.reset()은 아무 일도 하지 않아, 한 번 켜면 전역 스냅이 남고 계산 순서에 따라 결과가 달라진다.
// 반환 모양: ring·bx는 닫힌 링, box는 [링](폴리곤), P는 [[링]](멀티폴리곤), U·D·I와 union은 polyclip 결과(멀티폴리곤), F는 조각을 합친 멀티폴리곤
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { feature, merge } from 'topojson-client';

const require = createRequire(import.meta.url);
export const polyclip = await import(pathToFileURL(require.resolve('polyclip-ts')).href);

// 선 뒤집기, 선·점을 이어 닫힌 링 만들기
export const rev = (line) => [...line].reverse();
export const ring = (...parts) => {
  const pts = parts.flat();
  return [...pts, pts[0]];
};

// 링 하나를 멀티폴리곤으로, 링 여럿의 합집합
export const P = (r) => [[r]];
export const union = (...rings) => polyclip.union(...rings.map((r) => [r]));

// 합집합·차집합·교집합 (polyclip의 얇은 별칭)
export const U = (...geoms) => polyclip.union(...geoms);
export const D = (a, ...b) => polyclip.difference(a, ...b);
export const I = (a, b) => polyclip.intersection(a, b);

// 경위도 상자 (서, 남, 동, 북): bx는 링, box는 폴리곤
export const bx = (w, s, e, n) => ring([[w, s], [e, s], [e, n], [w, n]]);
export const box = (w, s, e, n) => [ring([[w, s], [e, s], [e, n], [w, n]])];

// 행정구역 조각 (DESIGN.md §5.2 '행정구역 조각', 2026-09-30): data/base/fragments/<권역>.topo.json(scripts/prep-fragments.mjs가 Natural Earth admin-1에서 만듦)을 읽는다.
// 권역 파일은 const { F } = loadFragments('europe')처럼 쓰고, 조각 파일을 읽는 곳은 이 함수뿐이다(check:generator가 본다).
// 파일은 처음 부를 때 한 번 읽는다. 지금 권역은 조각을 쓰지 않으므로 생성기는 이 파일을 읽지 않는다.
// - F(...ids): 조각들을 topojson-client merge로 arc 단위로 합친 멀티폴리곤. polyclip 합집합이 아니라서 부동소수 오차가 없고, 이웃 조각과 같은 꼭짓점을 쓴다.
//   좌표는 격자(소수 넷째 자리, engine.mjs의 출력 반올림과 같은 식)에 맞춰 돌려준다. 같은 조각 묶음(순서 무관)이면 같은 객체를 돌려주므로(memo) 고치지 말고 U·D·I로 새 도형을 만든다.
//   id를 주지 않거나, 모르는 id, 같은 id를 두 번 주면 멈춘다
// - ids: 조각 id 목록(파일 순서), props: id → 속성 { adm0, name, type, region?, unit? }(Natural Earth 값), domain: 권역 바깥선(모든 조각을 합친 멀티폴리곤, 격자)
// 조각은 생성기 안에서만 쓴다. level: region Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정)
const FRAGMENT_DIR = new URL('../../data/base/fragments/', import.meta.url);
const fragmentSets = new Map();
const onGrid = (multi) => multi.map((poly) => poly.map((r) => r.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4])));
const multiOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
export function loadFragments(name) {
  const loaded = fragmentSets.get(name);
  if (loaded) return loaded;
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`조각 권역 이름이 알맞지 않음: ${JSON.stringify(name)}`);
  let topo;
  try {
    topo = JSON.parse(readFileSync(new URL(`${name}.topo.json`, FRAGMENT_DIR), 'utf8'));
  } catch (e) {
    throw new Error(`조각 파일을 읽지 못함: data/base/fragments/${name}.topo.json (${e.message}). npm run prep:fragments로 만든다`);
  }
  const t = topo?.transform;
  if (topo?.type !== 'Topology' || t?.scale?.[0] !== 1e-4 || t?.scale?.[1] !== 1e-4 || t?.translate?.[0] !== 0 || t?.translate?.[1] !== 0
    || topo.objects?.fragments?.type !== 'GeometryCollection' || !topo.objects?.domain) {
    throw new Error(`조각 파일 형식이 다름: data/base/fragments/${name}.topo.json (transform scale 1e-4·translate 0, objects.fragments·domain이 있어야 함)`);
  }
  const byId = new Map();
  for (const g of topo.objects.fragments.geometries) {
    if (typeof g.id !== 'string' || !g.id || byId.has(g.id)) throw new Error(`조각 id가 없거나 겹침: ${name} ${JSON.stringify(g.id)}`);
    byId.set(g.id, g);
  }
  const memo = new Map();
  const F = (...ids) => {
    if (!ids.length) throw new Error(`F(): 조각 id가 없음 (${name})`);
    const sorted = [...ids].sort();
    sorted.forEach((id, i) => {
      if (!byId.has(id)) throw new Error(`모르는 조각 id: ${JSON.stringify(id)} (${name})`);
      if (i && id === sorted[i - 1]) throw new Error(`같은 조각 id를 두 번 줌: ${id} (${name})`);
    });
    const key = sorted.join(' ');
    let multi = memo.get(key);
    if (!multi) {
      multi = onGrid(multiOf(merge(topo, sorted.map((id) => byId.get(id)))));
      memo.set(key, multi);
    }
    return multi;
  };
  const set = {
    name,
    ids: [...byId.keys()],
    props: new Map([...byId].map(([id, g]) => [id, g.properties ?? {}])),
    domain: onGrid(multiOf(feature(topo, topo.objects.domain).geometry)),
    F,
  };
  fragmentSets.set(name, set);
  return set;
}
