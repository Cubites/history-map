// 세계 개관 장면의 진영별 한 덩어리 도형 계산: 유럽 전역 장면(이음매 서쪽) + 아시아·태평양 전역 장면(이음매 동쪽)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { D, G, I, P, U, WARS, box, loadCountries, roundSafe, terrOrEmpty as terr } from '../../engine.mjs';
import { alliedBase1939, alliedTop1939 } from './colonies39.mjs';

/** 덩어리 좌표 소수 자리 (3자리 = 약 110m, 파일 크기를 줄이려고) */
export const DIGITS = 3;
export const FACTIONS = ['allies', 'axis', 'soviet', 'japan', 'china'];

/** 빌드의 boundsBox와 같은 식: 전역 범위에 폭의 1/4 여백. 빌드가 진영 덩어리를 이 상자로 자른다 */
export function boundsBox([[w, s], [e, n]], margin = 0.25) {
  const dx = (e - w) * margin, dy = (n - s) * margin;
  const W = Math.max(-180, w - dx), E = Math.min(180, e + dx), S = Math.max(-85, s - dy), N = Math.min(85, n + dy);
  return [W, S, E, N];
}

// ── 이음매 ──
// 유럽 전역 장면은 이음매 서쪽(E 구역), 아시아·태평양 전역 장면은 동쪽(A 구역)만 쓴다.
// 이음매 = 이란의 실제 동쪽 국경(Natural Earth 50m)을 따라 내려오다가, 이란 북동 모서리 위로는 동경 SEAM_X의 곧은 선으로 북극해까지.
// E 구역 = 이란 ∪ (동경 SEAM_W 서쪽 전부) ∪ (북위 SEAM_S 북쪽에서 동경 SEAM_X 서쪽).
// 이란은 실제 국경으로 잘라 파키스탄(발루치스탄)·아프가니스탄 쪽은 모두 아시아 쪽 자료(영국령 인도)가 맡는다.
export const SEAM_X = 61.3;
export const SEAM_S = 35.5;
export const SEAM_W = 60.4;
const iranNE = (() => {
  const f = loadCountries('50m').find((c) => c.properties.name === 'Iran');
  return G.toMulti(f.geometry);
})();
export const E_ZONE = U(iranNE, box(-180, -90, SEAM_W, 90), box(SEAM_W - 0.5, SEAM_S, SEAM_X, 90));
export const A_ZONE = D(box(-180, -90, 180, 90), E_ZONE);

const dirWars = WARS;
const geoCache = new Map();
const readGeojson = (rel) => {
  if (!geoCache.has(rel)) {
    const fc = JSON.parse(readFileSync(path.join(dirWars, rel), 'utf8'));
    geoCache.set(rel, U(...fc.features.flatMap((f) => (f.geometry ? [G.toMulti(f.geometry)] : []))));
  }
  return geoCache.get(rel);
};

/** 장면의 areas를 빌드와 같은 순서로 쌓는다(뒤가 앞을 덮음). 결과: 진영 → 서로 겹치지 않는 한 덩어리(해안선으로 자르기 전).
 *  extraFirst / extraLast: [{faction, coords}] 맨 앞 / 맨 뒤에 더하는 층 */
export function stackScene(areas, year, { extraFirst = [], extraLast = [] } = {}) {
  let layers = [];
  const add = (faction, coords, what) => {
    if (!coords.length) throw new Error(`빈 층: ${faction} ${what}`);
    layers = layers.map((l) => ({ ...l, coords: D(l.coords, coords) }));
    layers.push({ faction, coords });
  };
  for (const l of extraFirst) add(l.faction, l.coords, l.what ?? 'extraFirst');
  for (const a of areas) {
    const coords = a.entities ? U(...a.entities.map((id) => terr(id, year))) : readGeojson(a.geojson);
    add(a.faction, coords, a.entities?.join(',') ?? a.geojson);
  }
  for (const l of extraLast) add(l.faction, l.coords, l.what ?? 'extraLast');
  const by = new Map();
  for (const l of layers) if (l.coords.length) by.set(l.faction, by.has(l.faction) ? U(by.get(l.faction), l.coords) : l.coords);
  return by;
}

/** 개관 장면 하나: 진영별 덩어리. sc = { eu: 유럽 장면 areas, as: 아시아 장면 areas, asYear, colonies } */
export function overviewScene(sc, bounds) {
  const eu = stackScene(sc.eu, sc.euYear);
  const first = [], last = [];
  if (sc.colonies) {
    first.push({ faction: 'allies', coords: alliedBase1939(sc.asYear), what: '영국·프랑스 식민지 바탕' });
    const t = alliedTop1939(sc.asYear);
    last.push({ faction: 'allies', coords: t.hongkong, what: '홍콩' }, { faction: 'allies', coords: t.indochina, what: '프랑스령 인도차이나' });
  }
  const as = stackScene(sc.as, sc.asYear, { extraFirst: first, extraLast: last });
  // 장면 날짜보다 늦은 점령을 되돌린다: 영토를 장면 해(asYear)로 계산하면 그 해 말 점령 범위가 들어오므로, 상자 안에서 (asYear년판에만 있는 from 진영 땅)을 to 진영으로 돌려 준다
  for (const r of sc.revert ?? []) {
    const base = stackScene(sc.as, sc.asYear - 1);
    const piece = D(I(as.get(r.from), box(...r.box)), base.get(r.from));
    as.set(r.from, D(as.get(r.from), piece));
    as.set(r.to, U(as.get(r.to), piece));
  }
  const [W, S, E, N] = boundsBox(bounds);
  const BOX = box(W, S, E, N);
  const out = new Map();
  for (const f of FACTIONS) {
    const west = eu.has(f) ? I(eu.get(f), E_ZONE) : [];
    const east = as.has(f) ? I(as.get(f), A_ZONE) : [];
    let c = U(west, east);
    if (!c.length) continue;
    c = I(c, BOX);
    c = roundSafe(c, DIGITS).filter((p) => G.areaKm2([p]) > 0.01);
    if (c.length) out.set(f, c);
  }
  return { out, eu, as };
}
