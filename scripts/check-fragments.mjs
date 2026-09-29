// 행정구역 조각 검사 (DESIGN.md §5.2 '행정구역 조각'): data/base/fragments/<권역>.topo.json을 국경 생성기와 같은 길(scripts/geo/lib.mjs의 loadFragments·F)로 읽어 본다.
// 사용: npm run check:fragments [-- 권역]   (권역을 주지 않으면 data/base/fragments의 모든 .topo.json)
// [1] 나라별 대조: 조각을 adm0별로 합쳐(F) land-50m으로 자른 것과, world-atlas countries-50m의 그 나라를 권역 바깥선 안으로 자른 것의 대칭차 면적.
//     조각은 Natural Earth 10m admin-1(v5.1.2), countries-50m은 NE 50m admin-0(4.1.0, 양자화)이라 국경선이 서로 다르다. 표는 어긋남의 크기를 보는 것이지 오류 목록이 아니다
// [2] 조각끼리: 쌍마다 겹침(1km² 이상이면 실패)과 조각 사이 내륙 빈틈(권역 바깥선의 구멍 가운데 육지가 있는 것, 1km² 이상이면 실패)
// [3] 해안 맞춤: 빌드가 해안선으로 자를 때 쓰는 육지(low는 land-110m, mid·high는 land-50m)마다, 조각에 닿는데 덮이지 않은 육지.
//     1km² 미만(해안 부스러기)의 합이 0.01km²를 넘으면 실패. 1km² 이상은 권역 밖 이웃 땅(카자흐스탄·시리아 등)이라 목록만 보인다
// 조각 파일을 만드는 것은 npm run prep:fragments다(자체 검사를 같은 기준으로 한 번 더 한다). 이 검사는 원본(.cache) 없이 돈다.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  SegIndex, areaKm2, bboxOf, boxesApart, inPolygon, interiorPoint, loadCountries, loadLand, pairOverlaps, planarArea, localKm2, pointSeg, polyclip,
} from './fragments/common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data/base/fragments');
const { loadFragments } = await import(pathToFileURL(path.join(ROOT, 'scripts/geo/lib.mjs')).href);

const args = process.argv.slice(2);
if (args.some((a) => a.startsWith('-')) || args.length > 1) {
  console.error(`사용: npm run check:fragments [-- 권역] (받은 인자: ${args.join(' ')})`);
  process.exit(2);
}
const names = args.length ? args : readdirSync(DIR).filter((f) => f.endsWith('.topo.json')).map((f) => f.slice(0, -'.topo.json'.length)).sort();
if (!names.length) { console.error('data/base/fragments에 조각 파일이 없음 (npm run prep:fragments)'); process.exit(2); }

// Natural Earth adm0_a3 → world-atlas countries-50m 이름. 50m에 따로 없는 곳(지브롤터, 아크로티리·데켈리아)은 비교하지 않는다
const ADM0_50M = {
  ALB: 'Albania', AND: 'Andorra', AUT: 'Austria', BEL: 'Belgium', BGR: 'Bulgaria', BIH: 'Bosnia and Herz.', BLR: 'Belarus', CHE: 'Switzerland', CYP: 'Cyprus',
  CYN: 'N. Cyprus', CZE: 'Czechia', DEU: 'Germany', DNK: 'Denmark', ESP: 'Spain', EST: 'Estonia', FIN: 'Finland', FRA: 'France', GBR: 'United Kingdom',
  GRC: 'Greece', HRV: 'Croatia', HUN: 'Hungary', IRL: 'Ireland', ISL: 'Iceland', ITA: 'Italy', KOS: 'Kosovo', LIE: 'Liechtenstein', LTU: 'Lithuania',
  LUX: 'Luxembourg', LVA: 'Latvia', MCO: 'Monaco', MDA: 'Moldova', MKD: 'Macedonia', MLT: 'Malta', MNE: 'Montenegro', NLD: 'Netherlands', NOR: 'Norway',
  POL: 'Poland', PRT: 'Portugal', ROU: 'Romania', SMR: 'San Marino', SRB: 'Serbia', SVK: 'Slovakia', SVN: 'Slovenia', SWE: 'Sweden', UKR: 'Ukraine',
  VAT: 'Vatican', TUR: 'Turkey', GEO: 'Georgia', ARM: 'Armenia', AZE: 'Azerbaijan', RUS: 'Russia', ALD: 'Åland', FRO: 'Faeroe Is.', IMN: 'Isle of Man',
  JEY: 'Jersey', GGY: 'Guernsey',
};
const km = (v) => (v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(v >= 1 ? 1 : 3));
const pct = (a, b) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '-');

const land50 = loadLand('50m');
const land110 = loadLand('110m');
const countries50 = loadCountries('50m');
let failed = 0;

for (const name of names) {
  const t0 = performance.now();
  const set = loadFragments(name);
  const frags = set.ids.map((id) => ({ id, props: set.props.get(id), multi: set.F(id) }));
  const box = bboxOf(set.domain);
  const near = (multi) => multi.filter((poly) => !boxesApart(bboxOf([poly]), box));
  const L50 = near(land50), L110 = near(land110);
  console.log(`=== ${name}: 조각 ${frags.length}개, 권역 범위 [${box.map((v) => v.toFixed(2)).join(', ')}] ===`);

  // [1] 나라별 대조
  console.log('[1] 나라별 대조: 조각 합(F) ∩ land-50m 과 countries-50m ∩ 권역 바깥선의 대칭차');
  const byAdm0 = new Map();
  for (const f of frags) byAdm0.set(f.props.adm0 || '(구멍)', [...(byAdm0.get(f.props.adm0 || '(구멍)') ?? []), f.id]);
  const rows = [];
  for (const [adm0, ids] of [...byAdm0].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const mine = polyclip.intersection(set.F(...ids), L50);
    const c = countries50.find((x) => x.name === ADM0_50M[adm0]);
    const theirs = c ? polyclip.intersection(c.multi, set.domain) : null;
    const x = theirs ? polyclip.xor(mine, theirs) : null;
    rows.push({ adm0, n: ids.length, mine: areaKm2(mine), theirs: theirs ? areaKm2(theirs) : null, diff: x ? areaKm2(x) : null, name: c?.name ?? '-' });
  }
  console.log('  adm0  조각   조각∩육지km²   50m(권역 안)km²   대칭차km²   비율   50m 이름');
  for (const r of rows) {
    console.log(`  ${r.adm0.padEnd(5)} ${String(r.n).padStart(4)} ${km(r.mine).padStart(14)} ${(r.theirs === null ? '-' : km(r.theirs)).padStart(17)} ${(r.diff === null ? '-' : km(r.diff)).padStart(11)} ${(r.diff === null ? '-' : pct(r.diff, r.theirs)).padStart(6)}   ${r.name}`);
  }
  const big = rows.filter((r) => r.diff !== null).sort((a, b) => b.diff / b.theirs - a.diff / a.theirs).slice(0, 5);
  console.log(`  비율이 큰 나라: ${big.map((r) => `${r.adm0} ${pct(r.diff, r.theirs)}`).join(', ')}`);
  // 크림·세바스토폴: NE v5.1.2 admin-1은 RUS로, countries-50m(NE 4.1.0)은 어느 나라로 두는지
  for (const id of ['UA-43', 'UA-40']) {
    if (!set.props.has(id)) continue;
    const at = interiorPoint(set.F(id)[0]);
    const c = countries50.find((x) => x.multi.some((poly) => inPolygon(at, poly)));
    const adm0 = set.props.get(id).adm0;
    const same = c && c.name === ADM0_50M[adm0];
    console.log(`  참고: ${id} ${set.props.get(id).name}는 조각 adm0 ${adm0}, countries-50m에서는 ${c?.name ?? '(없음)'} → ${same ? '같은 나라라 위 표의 차이에 들지 않음' : '두 나라 줄의 차이에 들어감'}`);
  }

  // [2] 조각끼리 겹침·빈틈
  const ov = pairOverlaps(frags);
  // 구멍 안에 다른 조각이 섬처럼 들어 있을 수 있으므로(흑해 안의 킨번 곶 등) 구멍 안 육지에서 권역(모든 조각)을 뺀다
  const holes = set.domain.flatMap((poly) => poly.slice(1).map((r) => [r]));
  const holeLand = holes.map((h) => ({ h, land: polyclip.difference(polyclip.intersection([h], L50), set.domain) })).filter((x) => x.land.length);
  const holeKm2 = holeLand.reduce((s, x) => s + areaKm2(x.land), 0);
  const ovBad = ov.worst.km2 >= 1, holeBad = holeKm2 >= 1;
  failed += ovBad + holeBad;
  console.log('[2] 조각끼리');
  console.log(`  ${ovBad ? '실패' : '통과'}  겹침: 가장 큰 쌍 ${ov.worst.km2.toFixed(4)}km²${ov.worst.a ? ` (${ov.worst.a}·${ov.worst.b})` : ''}, 겹친 쌍 ${ov.count}개 합 ${ov.total.toFixed(4)}km² (살핀 쌍 ${ov.pairs.toLocaleString('en-US')}개, 기준 쌍마다 1km² 미만)`);
  console.log(`  ${holeBad ? '실패' : '통과'}  조각 사이 빈틈: 권역 바깥선의 구멍 ${holes.length}개(흑해 같은 바다 포함) 가운데 조각이 덮지 않은 육지(land-50m)가 있는 것 ${holeLand.length}개 ${holeKm2.toFixed(4)}km² (기준 1km² 미만)`
    + (holeLand.length ? ` — ${holeLand.slice(0, 5).map((x) => interiorPoint([x.h[0]]).map((v) => v.toFixed(3)).join(',')).join(' / ')}` : ''));

  // [3] 해안 맞춤: 육지 − 조각 가운데 조각 경계에 닿는 조각
  console.log('[3] 해안 맞춤 (빌드가 자를 때 쓰는 육지마다, 조각에 닿는데 덮이지 않은 육지)');
  const edge = new SegIndex(0.05);
  for (const f of frags) edge.addMulti(f.multi, 0);
  const touches = (poly) => poly.some((r) => r.slice(1).some((p, k) => {
    const m = [(r[k][0] + p[0]) / 2, (r[k][1] + p[1]) / 2];
    for (const si of edge.query(m[0] - 1e-9, m[1] - 1e-9, m[0] + 1e-9, m[1] + 1e-9)) { const s = edge.segs[si]; if (pointSeg(m, s.a, s.b).d < 1e-9) return true; }
    return false;
  }));
  for (const [label, L] of [['low  (land-110m)', L110], ['mid·high (land-50m)', L50]]) {
    const covered = areaKm2(polyclip.intersection(L, ...[set.domain]));
    const left = polyclip.difference(L, ...frags.map((f) => f.multi)).filter(touches).map((poly) => ({ poly, km2: localKm2(planarArea([poly]), interiorPoint(poly)[1]) }));
    const small = left.filter((x) => x.km2 < 1), large = left.filter((x) => x.km2 >= 1).sort((a, b) => b.km2 - a.km2);
    const smallKm2 = small.reduce((s, x) => s + x.km2, 0);
    const bad = smallKm2 >= 0.01;
    failed += bad;
    console.log(`  ${bad ? '실패' : '통과'}  ${label}: 조각이 덮은 육지 ${km(covered)}km². 조각에 닿는 덮이지 않은 해안 부스러기(1km² 미만) ${small.length}곳 ${smallKm2.toFixed(5)}km² (기준 0.01km² 미만)`);
    console.log(`        1km² 이상 ${large.length}곳(권역 밖 이웃 땅): ${large.slice(0, 6).map((x) => `${km(x.km2)}km² @${interiorPoint(x.poly).map((v) => v.toFixed(2)).join(',')}`).join(' / ') || '없음'}`);
  }
  console.log(`  (${((performance.now() - t0) / 1000).toFixed(1)}초)`);
}
console.log(failed ? `=== 실패 ${failed}개 ===` : '=== 전체 통과 ===');
process.exit(failed ? 1 : 0);
