// 행정구역 조각 가공 (DESIGN.md §5.2 '행정구역 조각'): Natural Earth 1:10m admin-1 v5.1.2 GeoJSON에서 권역 조각 파일을 만든다.
// 사용: npm run prep:fragments -- <원본 geojson 경로>
//   원본은 저장소에 넣지 않는다(.cache/natural-earth/v5.1.2/에 둠, .gitignore). 이 스크립트는 아무것도 내려받지 않는다.
//   결과: data/base/fragments/europe.topo.json(조각 파일)과 README.md(출처·SHA·명령·매개변수·조각 표). 자체 검사가 하나라도 실패하면 쓰지 않는다.
// 조각은 국경 생성기 안에서만 쓴다(scripts/geo/lib.mjs의 loadFragments·F). level: region Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
// 단계 (채택안의 가공 파이프라인, 작업 5)
//  1) 고르기: 권역의 나라(adm0_a3) 목록과 러시아 유럽 쪽(NE region 속성). 권역 범위 상자 밖에 통째로 있는 폴리곤(프랑스 해외 데파르트망 등)은 뺀다.
//     상자에 걸친 나머지 행정구역(북아프리카·중동·카자흐스탄·러시아 아시아 쪽 등)은 '이웃'으로 함께 가공해 권역 경계선을 같게 간략화하고 해안 조각을 나눌 때 쓴다(파일에는 넣지 않음)
//  2) id·속성: id는 ISO 3166-2 코드, 없으면 adm1_code, 그것도 알맞지 않으면 adm0_a3(조각 하나뿐인 나라). 겹치면 멈춘다
//  3) 나라별 조각 수·단위 표(README)
//  4) 1e-4° 격자 → 위상화(이웃 조각이 같은 arc를 씀) → 격자 때문에 스스로 엇갈린 arc 고리 자르기 → arc 단위 간략화(Visvalingam).
//     50km² 미만 조각은 간략화하지 않고 1,000km² 미만 조각은 넓이에 비례해 덜 간략화한다. 간략화가 링을 꼬이게 한 조각은 그 arc만 덜 간략화한다
//     → 육지(world-atlas land-50m ∪ land-110m)와 닿지 않는 섬 폴리곤 빼기
//  5) 해안 맞추기: L⁺ = 격자에 맞춘 (land-50m ∪ land-110m) ∩ 권역 상자를 격자 두 칸 부풀린 것, M = L⁺ − 조각 − 이웃 행정구역.
//     M의 조각마다 공유 경계가 가장 긴 조각(이웃 행정구역이 더 길면 버림)에 붙인다. 닿는 것이 없으면 50km 안의 가장 가까운 조각, 그것도 없으면 보고한다.
//     20km² 넘는 조각은 둘로 자르기를 되풀이해 칸마다 가장 가까운 조각·이웃 행정구역에 나눠 준다(보로노이 근사, 110m 육지가 만·다도해를 덮는 곳).
//     사방이 조각으로 둘러싸인 1km² 이상의 내륙 구멍은 새 조각(이름은 world-atlas countries-10m)으로 만든다.
//     붙이기는 polyclip 합집합이 아니라 위상에서 한다(교차점을 양쪽 링에 끼우고 topojson mergeArcs로 합침). 그다음 격자에 맞춘다
//  6) T자 접점 고치기: 한쪽 조각에만 생긴 꼭짓점을 이웃 조각의 변에 끼워 넣는다(격자 공간 색인) → 다시 위상화, 엇갈린 arc 고리 자르기, 고정 transform(scale 1e-4, translate 0,0)
//  7) 자체 검사: (a) 조각 쌍 겹침 1km² 미만 (b) 빌드가 쓰는 육지 가운데 조각 몫인데 덮이지 않은 곳 0.01km² 미만 (c) 이웃 조각이 arc를 실제로 공유
//     (topojson merge 둘레 = 합집합 둘레) (d) 파일이 1MB를 넘으면 경고 (e) 처음부터 두 번 만들어 바이트가 같음. (a)~(c)·(e)가 실패하면 쓰지 않는다
//  8) 쓰기와 보고: 이미 있는 파일과 조각별 면적 변화를 보이고 europe.topo.json과 README.md를 쓴다
// 넓이 비교(꼬임·겹침)는 평면 넓이로 한다(polyclip이 일직선 위 점을 빼도 값이 같음). 보고용 km²는 구면 식이다(scripts/fragments/common.mjs)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { topology } from 'topojson-server';
import { planarTriangleArea, presimplify, simplify } from 'topojson-simplify';
import { feature, mergeArcs, quantize } from 'topojson-client';
import {
  PolygonIndex, SegIndex, areaKm2, bboxOf, boxesApart, cleanMulti, inPolygon, interiorPoint, loadCountries, loadLand,
  pairOverlaps, perimeterKm, planarArea, pointSeg, polyclip, segKm, snap, toMulti,
} from './fragments/common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'data/base/fragments');

// 원본: Natural Earth 1:10m Admin 1 – States, Provinces, v5.1.2 태그 (퍼블릭 도메인)
const SOURCE = {
  url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson',
  bytes: 40726851,
  blobSha1: '4a8438f98ac7dfec7dc1739b1eaf91398ad33f22',
};

// 권역: 나라 목록(adm0_a3)과 러시아 유럽 쪽(NE region 속성. Northwestern·Central·Volga이고, NE의 Volga에는 남부·북캅카스 관구도 들어 있다).
// 범위 상자 [서, 남, 동, 북] 밖에 통째로 있는 폴리곤은 뺀다(프랑스 해외 데파르트망, 네덜란드 카리브 특별 기초자치단체). 카나리아·마데이라·아조레스는 상자 안이다.
// 카자흐스탄과 러시아 아시아 쪽(Urals·Siberian·Far Eastern)은 넣지 않는다(west.mjs의 손 도형으로 둔다). 권역마다 파일을 하나씩 만들고, 지금은 europe뿐이다
const REGIONS = {
  europe: {
    adm0: [
      'ALB', 'AND', 'AUT', 'BEL', 'BGR', 'BIH', 'BLR', 'CHE', 'CYP', 'CYN', 'CZE', 'DEU', 'DNK', 'ESP', 'EST', 'FIN', 'FRA', 'GBR', 'GRC', 'HRV',
      'HUN', 'IRL', 'ISL', 'ITA', 'KOS', 'LIE', 'LTU', 'LUX', 'LVA', 'MCO', 'MDA', 'MKD', 'MLT', 'MNE', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'SMR',
      'SRB', 'SVK', 'SVN', 'SWE', 'UKR', 'VAT', 'TUR', 'GEO', 'ARM', 'AZE',
      'ALD', 'FRO', 'IMN', 'JEY', 'GGY', 'GIB', 'ESB', 'WSB', // 올란드·페로·맨섬·저지·건지·지브롤터·데켈리아·아크로티리
    ],
    rusRegions: ['Northwestern', 'Central', 'Volga'],
    box: [-32, 27, 70, 82],
  },
};
const REGION = 'europe';

// 매개변수 (README에 그대로 적는다)
const PARAMS = {
  grid: 1e-4, // 격자(도). 국경 생성기 출력의 반올림과 같다
  simplifyWeight: 2e-4, // 간략화: Visvalingam 유효 넓이(제곱도)가 이보다 작은 꼭짓점을 뺀다. arc 끝점(세 조각이 만나는 점)은 남는다
  keepSmallKm2: 50, // 원래 넓이가 이보다 작은 조각의 arc는 간략화하지 않는다
  fullSimplifyKm2: 1000, // 원래 넓이가 이보다 작은 조각의 arc는 문턱을 넓이에 비례해 낮춘다
  attachKm: 50, // 닿는 조각이 없는 해안 조각을 붙일 거리
  microMinKm2: 1, // 사방이 조각으로 둘러싸인 구멍을 새 조각으로 만드는 넓이
  splitKm2: 20, // 이보다 큰 해안 조각은 가까운 조각끼리 나눈다
  splitCell: 0.05, // 나눌 때 가장 작은 칸(도)
  coastMargin: 2e-4, // 해안 조각을 뺄 육지를 부풀리는 폭(도, 격자 두 칸)
  tjunctionTol: 1e-4, // T자 접점: 다른 조각의 변에서 이 거리(도) 안의 꼭짓점을 그 변에 끼운다
  untwistMaxKm2: 5, // arc 꼬임 풀기: 이보다 큰 고리는 자르지 않고 보고한다
  overlapMaxKm2: 1, // (a) 조각 겹침
  gapMaxKm2: 0.01, // (b) 덮이지 않은 육지
  crackMaxKm: 0.1, // (c) 공유하지 않은 이웃 경계(합친 둘레 − 합집합 둘레)의 절반
  sizeWarnBytes: 1_000_000, // (d)
};
const TRANSFORM = { scale: [1e-4, 1e-4], translate: [0, 0] };

const log = (...a) => console.log(...a);
const t0 = performance.now();
const stamp = () => `${((performance.now() - t0) / 1000).toFixed(1)}초`;

// ── 인자와 원본 확인 ─────────────────────────────────────
const args = process.argv.slice(2);
if (args.some((a) => a.startsWith('-')) || args.length !== 1) {
  console.error(`사용: npm run prep:fragments -- <원본 geojson 경로> (받은 인자: ${args.join(' ') || '없음'})\n원본: ${SOURCE.url}`);
  process.exit(2);
}
const srcPath = path.resolve(args[0]);
if (!existsSync(srcPath)) {
  console.error(`원본이 없음: ${srcPath}\n받는 곳: ${SOURCE.url} (프로젝트의 .cache/natural-earth/v5.1.2/에 둔다)`);
  process.exit(2);
}
const buf = readFileSync(srcPath);
const blobSha1 = createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
if (buf.length !== SOURCE.bytes || blobSha1 !== SOURCE.blobSha1) {
  console.error(`원본이 기록과 다름: ${buf.length}B, git blob SHA-1 ${blobSha1} (기록: ${SOURCE.bytes}B, ${SOURCE.blobSha1})`);
  process.exit(1);
}
log(`원본 ${srcPath}: ${buf.length}B, git blob SHA-1 ${blobSha1} (기록과 같음)`);

// 세계 육지(권역 상자에 걸친 것만): landTrue = (land-50m ∪ land-110m) ∩ 상자(빌드가 해안선으로 자를 때 쓰는 육지 그대로), L = 그것을 격자에 맞춘 것.
// 해안 조각은 L을 격자 두 칸(PARAMS.coastMargin)만큼 부풀린 L⁺(L과, 대각선 네 방향으로 두 칸씩 옮긴 L의 합집합. 곧은 해안이면 어느 방향으로도 두 칸 이상 부푼다)에서 뺀다. 해안 조각의 꼭짓점 가운데
// 조각 해안선과의 교차점은 격자에 맞출 때 최대 0.71칸 움직이므로, 부풀려 두어야 움직인 뒤에도 육지를 빈틈없이 덮는다(부푼 띠는 바다라 빌드가 잘라 낸다)
const B = REGIONS[REGION].box;
const boxPoly = [[[B[0], B[1]], [B[2], B[1]], [B[2], B[3]], [B[0], B[3]], [B[0], B[1]]]];
const near = (multi) => multi.filter((poly) => !boxesApart(bboxOf([poly]), B));
const landTrue = polyclip.intersection(polyclip.union(near(loadLand('50m')), near(loadLand('110m'))), boxPoly);
const L = cleanMulti(landTrue);
const cm = PARAMS.coastMargin;
const Lplus = polyclip.union(L, ...[[cm, cm], [cm, -cm], [-cm, cm], [-cm, -cm]].map(([dx, dy]) => cleanMulti(L.map((poly) => poly.map((r) => r.map(([x, y]) => [x + dx, y + dy]))))));
const landIndex = new PolygonIndex(L);
const landVertexIndex = new SegIndex(0.1);
for (const poly of L) for (const r of poly) for (const p of r) landVertexIndex.add(p, p, 'L');
const countries10 = loadCountries('10m');
log(`[${stamp()}] 육지 L: 폴리곤 ${L.length}개, 꼭짓점 ${L.flat(2).length}개, ${Math.round(areaKm2(L)).toLocaleString()}km²`);

// ── 만들기 (두 번 해서 같은지 본다: (e)) ─────────────────────
const first = build(JSON.parse(buf.toString('utf8')), REGIONS[REGION], true);
const second = build(JSON.parse(buf.toString('utf8')), REGIONS[REGION], false);
const deterministic = first.text === second.text;
log(`[${stamp()}] (e) 결정적 출력: ${deterministic ? '두 번 만든 결과가 바이트 단위로 같음' : '두 번 만든 결과가 다름'}`);

// ── 자체 검사 (a)~(d) ────────────────────────────────────
const checks = selfCheck(first);
const failed = checks.filter((c) => c.fail);
for (const c of checks) log(`  ${c.fail ? '실패' : c.warn ? '경고' : '통과'}  ${c.msg}`);
if (!deterministic) failed.push({ msg: '(e) 결정적 출력' });
if (failed.length) {
  console.error(`자체 검사 실패 ${failed.length}개: 파일을 쓰지 않음`);
  process.exit(1);
}

// ── 쓰기와 보고 ─────────────────────────────────────────
const outFile = path.join(OUT_DIR, `${REGION}.topo.json`);
if (existsSync(outFile)) reportChange(readFileSync(outFile, 'utf8'), first.text);
const readmeText = readme(first, checks);
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(outFile, first.text);
writeFileSync(path.join(OUT_DIR, 'README.md'), readmeText);
log(`[${stamp()}] 씀: ${path.relative(ROOT, outFile)} ${Buffer.byteLength(first.text).toLocaleString()}B, sha256 ${sha256(first.text)} 와 README.md`);

// ════════════════════════════════════════════════════════
function sha256(text) { return createHash('sha256').update(text).digest('hex'); }

function build(src, region, verbose) {
  const say = verbose ? log : () => {};
  const report = { dropped: [], islands: 0, islandFrags: [], keptSmall: 0, graded: 0, untwisted: new Set(), untwist: { count: 0, km2: 0 }, twistLeft: [], attached: 0, attachedKm2: 0, nearest: [], neighborKm2: 0, micro: [], split: [], unassigned: [], tfix: 0 };

  // 1) 고르기
  const adm0Set = new Set(region.adm0), rusSet = new Set(region.rusRegions);
  let chosen = [];
  let neighbors = [];
  for (const f of src.features) {
    const p = f.properties;
    const isChosen = adm0Set.has(p.adm0_a3) || (p.adm0_a3 === 'RUS' && rusSet.has(p.region));
    const all = toMulti(f.geometry);
    const polys = all.filter((poly) => !boxesApart(bboxOf([poly]), region.box));
    if (isChosen && polys.length < all.length) report.dropped.push(`${p.adm0_a3} ${p.name}(${p.type_en ?? '-'}): 폴리곤 ${all.length - polys.length}/${all.length}개`);
    if (!polys.length) continue;
    (isChosen ? chosen : neighbors).push({ p, multi: polys });
  }
  const missing = region.adm0.filter((a) => !chosen.some((c) => c.p.adm0_a3 === a));
  if (missing.length) throw new Error(`원본에 없는 나라: ${missing.join(', ')}`);
  say(`[${stamp()}] 1) 고르기: 조각 ${chosen.length}개, 범위 상자에 걸친 이웃 행정구역 ${neighbors.length}개, 상자 밖이라 뺀 것 ${report.dropped.length}건`);

  // 2) id·속성
  const isoOk = (s) => typeof s === 'string' && /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(s);
  const isoCount = new Map(), codeCount = new Map(), adm0Count = new Map();
  for (const { p } of chosen) {
    if (isoOk(p.iso_3166_2)) isoCount.set(p.iso_3166_2, (isoCount.get(p.iso_3166_2) ?? 0) + 1);
    codeCount.set(p.adm1_code, (codeCount.get(p.adm1_code) ?? 0) + 1);
    adm0Count.set(p.adm0_a3, (adm0Count.get(p.adm0_a3) ?? 0) + 1);
  }
  for (const c of chosen) {
    const p = c.p;
    c.id = isoOk(p.iso_3166_2) && isoCount.get(p.iso_3166_2) === 1 ? p.iso_3166_2
      : /^[A-Z]{3}-\d+$/.test(p.adm1_code ?? '') && codeCount.get(p.adm1_code) === 1 ? p.adm1_code
        : adm0Count.get(p.adm0_a3) === 1 ? p.adm0_a3 : null;
    if (!c.id) throw new Error(`id를 정할 수 없음: ${p.adm0_a3} ${p.name} (iso ${p.iso_3166_2}, adm1_code ${p.adm1_code})`);
    c.idRule = c.id === p.iso_3166_2 ? 'iso' : c.id === p.adm1_code ? 'adm1' : 'adm0';
    c.props = { adm0: p.adm0_a3, name: p.name ?? '', type: p.type_en ?? '' };
    if (p.region) c.props.region = p.region;
    if (p.geonunit && p.geonunit !== p.admin) c.props.unit = p.geonunit;
  }
  const idSeen = new Map();
  for (const c of chosen) {
    if (idSeen.has(c.id)) throw new Error(`id가 겹침: ${c.id} (${idSeen.get(c.id)} / ${c.p.name})`);
    idSeen.set(c.id, c.p.name);
  }
  chosen.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // 3) 나라별 조각 수·단위 표는 마지막 조각으로 만든다(맨 끝, makeTable)

  // 4) 격자 → 위상화 → 간략화 → 섬 빼기
  for (const x of [...chosen, ...neighbors]) x.multi = cleanMulti(x.multi);
  chosen = chosen.filter((c) => c.multi.length);
  neighbors = neighbors.filter((n) => n.multi.length);
  const rawPoints = chosen.reduce((s, c) => s + c.multi.flat(2).length, 0);
  const gridMulti = new Map(chosen.map((c) => [c.id, c.multi]));
  const topoIn = topology({ f: { type: 'FeatureCollection', features: [...chosen, ...neighbors].map((x) => ({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: x.multi } })) } });
  untwistArcs(topoIn.arcs, report);
  const geoms = topoIn.objects.f.geometries;
  const all = [...chosen, ...neighbors];
  all.forEach((x, i) => { x.multi = cleanMulti(toMulti(feature(topoIn, geoms[i]).geometry), false); });
  const pre = presimplify(topoIn, planarTriangleArea);
  // 간략화가 링을 꼬이게 하면(스스로 겹침) 그 조각이 쓰는 arc만 문턱을 1/8씩 낮춰 다시 간략화한다(세 번째에는 간략화하지 않음).
  // 꼬임은 넓이 − 자기 합집합 넓이로 잰다. 격자에 맞출 때 이미 생긴 작은 꼬임(10m 안에서 가까운 두 변이 반올림으로 엇갈림)은 간략화 전 값과 비교해 뺀다
  const twist = (m) => planarArea(m) - planarArea(polyclip.union(m)); // 제곱도. 일직선 위 점을 빼도 변하지 않는 평면 넓이로 잰다
  const gridTwist = chosen.map((c) => twist(c.multi));
  const arcsOf = (g) => { const set = new Set(); const walk = (a) => (Array.isArray(a) ? a.forEach(walk) : set.add(a < 0 ? ~a : a)); walk(g.arcs); return set; };
  const localWeight = new Map();
  // 작은 조각(원래 넓이 PARAMS.keepSmallKm2 미만: 바티칸·모나코·산마리노·리히텐슈타인·몰타 등)은 간략화하면 고리가 무너지거나 모양이 뭉개지므로 그 arc를 간략화하지 않고,
  // PARAMS.fullSimplifyKm2 미만인 조각은 넓이에 비례해 문턱을 낮춘다(작은 조각일수록 덜 간략화). 두 조각이 함께 쓰는 arc는 낮은 쪽 문턱을 쓴다
  chosen.forEach((c, i) => {
    const km2 = areaKm2(c.multi);
    if (km2 >= PARAMS.fullSimplifyKm2) return;
    const w = km2 < PARAMS.keepSmallKm2 ? 0 : (PARAMS.simplifyWeight * km2) / PARAMS.fullSimplifyKm2;
    if (w === 0) report.keptSmall++; else report.graded++;
    for (const a of arcsOf(geoms[i])) localWeight.set(a, Math.min(localWeight.get(a) ?? PARAMS.simplifyWeight, w));
  });
  for (let round = 0; ; round++) {
    const simple = { ...pre, arcs: pre.arcs.map((arc, i) => arc.filter((p) => p[2] >= (localWeight.get(i) ?? PARAMS.simplifyWeight)).map((p) => [p[0], p[1]])) };
    all.forEach((x, i) => { x.multi = cleanMulti(toMulti(feature(simple, geoms[i]).geometry), false); });
    const twisted = chosen.map((c, i) => [c, i]).filter(([c, i]) => Math.abs(twist(c.multi) - gridTwist[i]) > 1e-10);
    if (!twisted.length) break;
    if (round >= 3) throw new Error(`간략화 뒤 꼬인 조각이 남음: ${twisted.map(([c]) => c.id).join(', ')}`);
    for (const [c, i] of twisted) {
      report.untwisted.add(c.id);
      for (const a of arcsOf(geoms[i])) localWeight.set(a, round >= 2 ? 0 : (localWeight.get(a) ?? PARAMS.simplifyWeight) / 8);
    }
  }
  // 육지와 닿지 않는 섬 폴리곤: 꼭짓점이 육지 안에 하나도 없고, 육지 꼭짓점도 폴리곤 안에 없으면 뺀다
  const touchesLand = (poly) => {
    if (poly[0].some((p) => landIndex.contains(p))) return true;
    const [x0, y0, x1, y1] = bboxOf([poly]);
    for (const i of landVertexIndex.query(x0, y0, x1, y1)) { const q = landVertexIndex.segs[i].a; if (q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1 && inPolygon(q, poly)) return true; }
    return false;
  };
  for (const c of chosen) {
    const kept = c.multi.filter(touchesLand);
    report.islands += c.multi.length - kept.length;
    c.multi = kept;
  }
  report.islandFrags = chosen.filter((c) => !c.multi.length).map((c) => `${c.id} ${c.props.name}`);
  chosen = chosen.filter((c) => c.multi.length);
  const simplePoints = chosen.reduce((s, c) => s + c.multi.flat(2).length, 0);
  // 간략화 정도(처음 만들 때만): 조각마다 격자에 맞춘 원래 도형과 간략화한 도형의 대칭차 넓이 / 원래 넓이 (섬 폴리곤을 뺀 몫은 넣지 않는다)
  if (verbose) {
    const rows = chosen.map((c) => {
      const raw = gridMulti.get(c.id).filter((poly) => c.multi.some((q) => !boxesApart(bboxOf([q]), bboxOf([poly]))));
      const x = planarArea(polyclip.xor(raw, c.multi)), a = planarArea(raw);
      return { id: c.id, x, a, r: a > 0 ? x / a : 0 };
    }).sort((u, v) => v.r - u.r || (u.id < v.id ? -1 : 1));
    const med = rows.map((r) => r.r).sort((u, v) => u - v)[Math.floor(rows.length / 2)];
    report.fidelity = { mean: rows.reduce((t, r) => t + r.x, 0) / rows.reduce((t, r) => t + r.a, 0), median: med, worst: rows.slice(0, 5).map((r) => `${r.id} ${(r.r * 100).toFixed(1)}%`) };
  }
  say(`[${stamp()}] 4) 격자·위상화·간략화: 꼭짓점 ${rawPoints.toLocaleString()} → ${simplePoints.toLocaleString()}개(조각별 합), 육지와 닿지 않아 뺀 섬 폴리곤 ${report.islands}개, 육지와 닿지 않아 빠진 조각 ${report.islandFrags.length}개(${report.islandFrags.join(", ")}), 간략화하지 않은 작은 조각 ${report.keptSmall}개, 덜 간략화한 조각 ${report.graded}개, 꼬여서 덜 간략화한 조각 ${report.untwisted.size}개(${[...report.untwisted].join(", ")}), 격자에 맞춰 꼬인 arc 고리 ${report.untwist.count}개 잘라 냄(${report.untwist.km2.toFixed(3)}km²)`);

  // 5) 해안 맞추기
  const idx = new SegIndex(0.05);
  chosen.forEach((c, i) => idx.addMulti(c.multi, i));
  neighbors.forEach((n, i) => idx.addMulti(n.multi, -1 - i));
  const M = polyclip.difference(Lplus, ...chosen.map((c) => c.multi), ...neighbors.map((n) => n.multi));
  say(`[${stamp()}] 5) 해안 맞추기: 덮이지 않은 육지 조각 ${M.length}개, ${areaKm2(M).toFixed(1)}km²`);
  const pieces = classify(M, idx);
  // 큰 해안 조각(PARAMS.splitKm2 초과)은 가까운 조각끼리 나눈다: 둘로 자르기를 되풀이해 칸(가장 작게 PARAMS.splitCell°)마다 가장 가까운 조각·이웃 행정구역에 준다
  // (보로노이 근사). 110m 육지가 만·다도해·갯벌을 덮는 곳에서 한 조각이 이웃 조각(이웃 나라) 앞바다까지 가져가지 않게 한다. 이웃 행정구역에 간 칸은 버린다
  const parts = [];
  for (const pc of pieces) {
    if (pc.kind === 'enclosed' && pc.km2 >= PARAMS.microMinKm2) {
      const at = interiorPoint(pc.poly);
      const unit = countries10.find((u) => u.multi.some((poly) => inPolygon(at, poly)));
      report.micro.push({ pc, name: unit?.name ?? '(이름 없음)', at });
      continue;
    }
    if (pc.kind !== 'enclosed' && pc.km2 > PARAMS.splitKm2) {
      const sub = splitByNearest(pc.poly, idx);
      const owners = [...new Set(sub.map((x) => x.owner))];
      if (owners.length > 1) {
        const byOwner = new Map();
        for (const x of sub) {
          const km2 = areaKm2([x.poly]);
          byOwner.set(x.owner, (byOwner.get(x.owner) ?? 0) + km2);
          parts.push({ poly: x.poly, to: x.owner ?? -1, kind: x.owner === null ? 'unassigned' : x.owner >= 0 ? 'split' : 'neighbor', km2, at: interiorPoint(x.poly) });
        }
        const name = (o) => (o === null ? '(없음)' : o >= 0 ? chosen[o].id : `이웃 ${neighbors[-1 - o].p.adm0_a3} ${neighbors[-1 - o].p.name}`);
        report.split.push({ km2: pc.km2, at: pc.at, cells: sub.length, owners: [...byOwner].sort((a, b) => b[1] - a[1]).map(([o, k]) => `${name(o)} ${k.toFixed(0)}km²`) });
        continue;
      }
    }
    parts.push(pc);
  }
  for (const pc of parts) {
    if (pc.to >= 0) {
      report.attached++;
      report.attachedKm2 += pc.km2;
      if (pc.kind === 'nearest') report.nearest.push(`${chosen[pc.to].id} ← ${pc.km2.toFixed(2)}km² @${pc.at.map((v) => v.toFixed(2)).join(',')} (${pc.distKm.toFixed(1)}km)`);
    } else if (pc.kind === 'neighbor') report.neighborKm2 += pc.km2;
    else report.unassigned.push(`${pc.km2.toFixed(2)}km² @${pc.at.map((v) => v.toFixed(2)).join(',')}`);
  }
  report.micro.forEach(({ pc, name }, k) => chosen.push({ id: `HOLE-${k + 1}`, props: { adm0: '', name, type: '구멍' }, multi: cleanMulti([pc.poly], false) }));
  // 붙이기는 polyclip 합집합이 아니라 위상에서 한다: 해안 조각의 변은 조각 변의 일부이고, 그 위의 교차점만 조각 링에 없다.
  // 그래서 (1) 조각 변 위(1e-9° 안)의 해안 조각 꼭짓점을 조각 링에, 조각 꼭짓점을 해안 조각 링에 끼워 두 링이 같은 점을 쓰게 하고
  // (2) 조각과 해안 조각을 함께 위상화해 조각마다 자기 해안 조각과 arc로 합친다(topojson mergeArcs). 이웃 조각과의 경계는 좌표가 그대로라 공유가 깨지지 않는다
  const attachList = parts.filter((pc) => pc.to >= 0).map((pc) => ({ owner: pc.to, multi: cleanMulti([pc.poly], false) })).filter((a) => a.multi.length);
  const exact = 1e-9;
  report.pieceInserts = insertVertices(chosen, attachList.map((a) => a.multi), exact) + insertVertices(attachList, chosen.map((c) => c.multi), exact)
    + insertVertices(attachList, attachList.map((a) => a.multi), exact, true);
  const topoAttach = topology({ f: { type: 'FeatureCollection', features: [...chosen, ...attachList].map((x) => ({ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: x.multi } })) } });
  const ag = topoAttach.objects.f.geometries;
  const mine = chosen.map((c, i) => [ag[i]]);
  attachList.forEach((a, k) => mine[a.owner].push(ag[chosen.length + k]));
  chosen.forEach((c, i) => { if (mine[i].length > 1) c.multi = toMulti(feature(topoAttach, mergeArcs(topoAttach, mine[i])).geometry); });
  // 격자에 맞춘다(같은 좌표는 같은 값으로 반올림되므로 이웃 조각이 함께 쓰는 경계는 그대로 같다)
  for (const c of chosen) c.multi = cleanMulti(c.multi);
  say(`[${stamp()}]    붙인 조각 ${report.attached}개 ${report.attachedKm2.toFixed(1)}km² (나눈 큰 조각 ${report.split.length}개, 가까운 조각에 붙인 것 ${report.nearest.length}개, 끼운 교차점 ${report.pieceInserts}개), 이웃 땅 ${report.neighborKm2.toFixed(1)}km², 새 구멍 조각 ${report.micro.length}개, 붙일 곳 없음 ${report.unassigned.length}개`);

  // 6) T자 접점 고치기 → 위상화 → 고정 transform
  report.tfix = fixTJunctions(chosen);
  say(`[${stamp()}] 6) T자 접점: 꼭짓점 ${report.tfix}개를 이웃 변에 끼움`);
  chosen.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const rawTopo = topology({ fragments: { type: 'FeatureCollection', features: chosen.map((c) => ({ type: 'Feature', id: c.id, properties: c.props, geometry: { type: 'MultiPolygon', coordinates: c.multi } })) } });
  untwistArcs(rawTopo.arcs, report);
  const topo = quantize(rawTopo, TRANSFORM);
  const domain = mergeArcs(topo, topo.objects.fragments.geometries);
  const out = { type: 'Topology', bbox: topo.bbox, transform: TRANSFORM, objects: { fragments: topo.objects.fragments, domain }, arcs: topo.arcs };
  const text = JSON.stringify(out) + '\n';
  say(`[${stamp()}]    최종 위상의 꼬인 arc 고리까지 모두 ${report.untwist.count}개 잘라 냄, 남은 큰 고리 ${report.twistLeft.length}개`);
  say(`[${stamp()}]    조각 ${chosen.length}개, arc ${topo.arcs.length}개, 점 ${topo.arcs.reduce((s, a) => s + a.length, 0).toLocaleString()}개, ${Buffer.byteLength(text).toLocaleString()}B`);
  return { text, report, table: makeTable(chosen), rawPoints, simplePoints, neighbors: neighbors.map((n) => n.multi), givenAway: parts.filter((pc) => pc.to < 0).map((pc) => [pc.poly]) };
}

// M의 조각 나누기: 변마다 어느 조각·이웃의 변 위에 있는지 보고, 공유 길이로 붙일 곳을 정한다
function classify(M, idx) {
  const out = [];
  for (const poly of M) {
    const shared = new Map();
    let coast = 0;
    for (const r of poly) for (let k = 0; k + 1 < r.length; k++) {
      const a = r[k], b = r[k + 1], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      let owner = null;
      for (const si of idx.query(mid[0] - 1e-9, mid[1] - 1e-9, mid[0] + 1e-9, mid[1] + 1e-9)) {
        const s = idx.segs[si];
        if (pointSeg(mid, s.a, s.b).d < 1e-9) { owner = s.owner; break; }
      }
      const len = segKm(a, b);
      if (owner === null) coast += len;
      else shared.set(owner, (shared.get(owner) ?? 0) + len);
    }
    const km2 = areaKm2([poly]);
    const at = interiorPoint(poly);
    const frag = [...shared].filter(([o]) => o >= 0).map(([owner, len]) => ({ owner, len })).sort((x, y) => y.len - x.len || x.owner - y.owner);
    const nbLen = [...shared].filter(([o]) => o < 0).reduce((s, [, l]) => s + l, 0);
    const fragLen = frag.reduce((s, f) => s + f.len, 0);
    const pc = { poly, km2, at, best: frag[0], second: frag[1], to: -1 };
    if (frag.length && coast === 0 && nbLen === 0) { pc.kind = 'enclosed'; pc.to = frag[0].owner; }
    else if (frag.length && fragLen >= nbLen) { pc.kind = 'shared'; pc.to = frag[0].owner; }
    else if (nbLen > 0) pc.kind = 'neighbor';
    else {
      const nearest = nearestOwner(poly, idx);
      if (nearest && nearest.km <= PARAMS.attachKm) {
        pc.distKm = nearest.km;
        if (nearest.owner >= 0) { pc.kind = 'nearest'; pc.to = nearest.owner; } else pc.kind = 'neighbor';
      } else pc.kind = 'unassigned';
    }
    out.push(pc);
  }
  return out;
}

// 점에서 가장 가까운 조각·이웃 행정구역 변의 주인(조각 번호, 이웃은 음수). 약 2.5° 안에 없으면 null
function nearestEdgeOwner(q, idx) {
  const cos = Math.max(0.05, Math.cos((q[1] * Math.PI) / 180));
  for (let r = 0.02; r < 3; r *= 2) {
    let best = null;
    for (const si of idx.query(q[0] - r / cos, q[1] - r, q[0] + r / cos, q[1] + r)) {
      const s = idx.segs[si];
      const { t } = pointSeg(q, s.a, s.b);
      const km = segKm(q, [s.a[0] + t * (s.b[0] - s.a[0]), s.a[1] + t * (s.b[1] - s.a[1])]);
      if (!best || km < best.km || (km === best.km && s.owner > best.owner)) best = { km, owner: s.owner };
    }
    if (best && best.km <= r * 111.32 * 0.99) return best.owner;
  }
  return null;
}

// 큰 해안 조각 나누기: 표본 점(안쪽 점과 테두리 꼭짓점 최대 64개)의 가장 가까운 주인이 하나면 그대로 두고, 아니면 긴 쪽을 격자에 맞춘 가운데에서 둘로 자른다.
// 칸이 PARAMS.splitCell°보다 작아지면 안쪽 점의 가장 가까운 주인에게 준다. 자른 선의 두 쪽은 같은 상자 변과의 교차점을 쓰므로 좌표가 같다
function splitByNearest(poly, idx) {
  const out = [];
  const stack = [poly];
  while (stack.length) {
    const p = stack.pop();
    const [x0, y0, x1, y1] = bboxOf([p]);
    const ring = p[0];
    const step = Math.max(1, Math.floor(ring.length / 63));
    const samples = [interiorPoint(p), ...ring.filter((_, k) => k % step === 0)];
    const owners = new Set(samples.map((q) => nearestEdgeOwner(q, idx)));
    if (owners.size === 1) { out.push({ poly: p, owner: [...owners][0] }); continue; }
    if (x1 - x0 <= PARAMS.splitCell && y1 - y0 <= PARAMS.splitCell) { out.push({ poly: p, owner: nearestEdgeOwner(samples[0], idx) }); continue; }
    const vertical = x1 - x0 >= y1 - y0;
    const m = snap(vertical ? (x0 + x1) / 2 : (y0 + y1) / 2);
    const boxes = vertical ? [[x0 - 1, y0 - 1, m, y1 + 1], [m, y0 - 1, x1 + 1, y1 + 1]] : [[x0 - 1, y0 - 1, x1 + 1, m], [x0 - 1, m, x1 + 1, y1 + 1]];
    for (const b of boxes) for (const q of polyclip.intersection([p], [[[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]]])) stack.push(q);
  }
  return out;
}

function nearestOwner(poly, idx) {
  const lat = poly[0][0][1];
  const dy = PARAMS.attachKm / 111.32, dx = dy / Math.max(0.05, Math.cos((lat * Math.PI) / 180));
  let best = null;
  const [x0, y0, x1, y1] = bboxOf([poly]);
  for (const si of idx.query(x0 - dx, y0 - dy, x1 + dx, y1 + dy)) {
    const s = idx.segs[si];
    for (const p of poly[0]) {
      const { t } = pointSeg(p, s.a, s.b);
      const q = [s.a[0] + t * (s.b[0] - s.a[0]), s.a[1] + t * (s.b[1] - s.a[1])];
      const km = segKm(p, q);
      if (!best || km < best.km || (km === best.km && s.owner > best.owner)) best = { km, owner: s.owner };
    }
  }
  return best;
}

// 꼭짓점 끼우기: sources(멀티폴리곤 목록)의 꼭짓점 가운데 targets(.multi를 가진 객체 목록)의 변에서 tol(도) 안에 있고 변 끝점이 아닌 것을 그 변에 끼운다.
// skipSame이면 같은 번호의 source와 target은 짝짓지 않는다(조각끼리 볼 때). 끼운 꼭짓점 수를 돌려준다
function insertVertices(targets, sources, tol, skipSame = false) {
  const idx = new SegIndex(0.05);
  targets.forEach((t, ti) => idx.addMulti(t.multi, ti));
  const ins = new Map(); // 선분 번호 → [{ t, p }]
  sources.forEach((m, oi) => {
    for (const poly of m) for (const r of poly) for (let k = 0; k + 1 < r.length; k++) {
      const v = r[k];
      for (const si of idx.query(v[0] - tol, v[1] - tol, v[0] + tol, v[1] + tol)) {
        const s = idx.segs[si];
        if ((skipSame && s.owner === oi) || (v[0] === s.a[0] && v[1] === s.a[1]) || (v[0] === s.b[0] && v[1] === s.b[1])) continue;
        const { d, t } = pointSeg(v, s.a, s.b);
        if (d > tol || t <= 0 || t >= 1) continue;
        const list = ins.get(si) ?? [];
        if (!list.some((q) => q.p[0] === v[0] && q.p[1] === v[1])) list.push({ t, p: v });
        ins.set(si, list);
      }
    }
  });
  if (!ins.size) return 0;
  let total = 0;
  const bySeg = new Map();
  for (const [si, list] of ins) {
    const s = idx.segs[si];
    bySeg.set(`${s.owner}/${s.pi}/${s.ri}/${s.k}`, list.sort((x, y) => x.t - y.t || x.p[0] - y.p[0] || x.p[1] - y.p[1]));
    total += list.length;
  }
  targets.forEach((tg, ti) => {
    tg.multi = cleanMulti(tg.multi.map((poly, pi) => poly.map((r, ri) => {
      const o = [];
      for (let k = 0; k < r.length; k++) {
        o.push(r[k]);
        for (const q of bySeg.get(`${ti}/${pi}/${ri}/${k}`) ?? []) o.push(q.p);
      }
      return o;
    })), false);
  });
  return total;
}

// arc 꼬임 풀기: 격자에 맞추면 10m 안에서 나란히 가던 경계가 스스로 엇갈려 작은 고리(두 조각에서 넓이가 ±로 뒤집힘)가 생긴다.
// arc 안에서 서로 이웃하지 않은 두 변이 엇갈리면 그 사이 고리를 잘라 내고 교차점(격자에 맞춤)을 넣는다. arc를 고치므로 그 arc를 함께 쓰는 두 조각이 똑같이 고쳐진다.
// 닫힌 arc(섬 한 바퀴)는 두 고리 가운데 작은 쪽을 자른다. 자를 고리가 PARAMS.untwistMaxKm2보다 크면 자르지 않고 보고한다
function untwistArcs(arcs, report) {
  const I = (v) => Math.round(v * 1e4);
  const orient = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  const firstCrossing = (arc) => {
    const q = arc.map(([x, y]) => [I(x), I(y)]);
    const n = q.length - 1; // 변 수
    const closed = q[0][0] === q[n][0] && q[0][1] === q[n][1];
    const cells = new Map(), C = 200; // 격자 칸 0.02°
    for (let k = 0; k < n; k++) {
      const x0 = Math.floor(Math.min(q[k][0], q[k + 1][0]) / C), x1 = Math.floor(Math.max(q[k][0], q[k + 1][0]) / C);
      const y0 = Math.floor(Math.min(q[k][1], q[k + 1][1]) / C), y1 = Math.floor(Math.max(q[k][1], q[k + 1][1]) / C);
      for (let ix = x0; ix <= x1; ix++) for (let iy = y0; iy <= y1; iy++) { const key = ix * 1e6 + iy; const l = cells.get(key); if (l) l.push(k); else cells.set(key, [k]); }
    }
    let best = null;
    for (const list of cells.values()) {
      for (let u = 0; u < list.length; u++) for (let v = u + 1; v < list.length; v++) {
        const i = Math.min(list[u], list[v]), j = Math.max(list[u], list[v]);
        if (j - i < 2 || (closed && i === 0 && j === n - 1)) continue;
        const a = q[i], b = q[i + 1], c = q[j], d = q[j + 1];
        if (orient(a, b, c) * orient(a, b, d) < 0 && orient(c, d, a) * orient(c, d, b) < 0 && (!best || i < best.i || (i === best.i && j < best.j))) best = { i, j };
      }
    }
    if (!best) return null;
    const [a, b, c, d] = [arc[best.i], arc[best.i + 1], arc[best.j], arc[best.j + 1]];
    const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
    const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
    return { ...best, closed, x: [Math.round((a[0] + t * (b[0] - a[0])) * 1e4) / 1e4, Math.round((a[1] + t * (b[1] - a[1])) * 1e4) / 1e4] };
  };
  const loopKm2 = (pts) => areaKm2([[[...pts, pts[0]]]]);
  for (let ai = 0; ai < arcs.length; ai++) {
    let arc = arcs[ai];
    for (let guard = 0; guard < 100; guard++) {
      const hit = firstCrossing(arc);
      if (!hit) break;
      const inner = [hit.x, ...arc.slice(hit.i + 1, hit.j + 1)];
      const outer = [hit.x, ...arc.slice(hit.j + 1, -1), ...arc.slice(0, hit.i + 1)];
      const cutInner = !hit.closed || loopKm2(inner) <= loopKm2(outer);
      const km2 = loopKm2(cutInner ? inner : outer);
      if (km2 > PARAMS.untwistMaxKm2) { report.twistLeft.push(`arc ${ai} ${km2.toFixed(3)}km² @${hit.x.join(',')}`); break; }
      const next = cutInner ? [...arc.slice(0, hit.i + 1), hit.x, ...arc.slice(hit.j + 1)] : [...inner, hit.x];
      arc = next.filter((p, k) => k === 0 || p[0] !== next[k - 1][0] || p[1] !== next[k - 1][1]);
      report.untwist.count++;
      report.untwist.km2 += km2;
    }
    arcs[ai] = arc;
  }
}

// T자 접점: 다른 조각의 변 가까이(PARAMS.tjunctionTol 안) 있는 꼭짓점을 그 변에 끼운다. 끼울 것이 없을 때까지(최대 4번) 되풀이한다
function fixTJunctions(frags) {
  let total = 0;
  for (let pass = 0; pass < 4; pass++) {
    const n = insertVertices(frags, frags.map((f) => f.multi), PARAMS.tjunctionTol, true);
    total += n;
    if (!n) break;
  }
  return total;
}

// ── 자체 검사 (a)~(d): 쓴 글을 다시 읽어(생성기의 F와 같은 방식으로 복호화) 본다 ────
function selfCheck({ text, neighbors, givenAway }) {
  const topo = JSON.parse(text);
  const geoms = topo.objects.fragments.geometries;
  const snapMulti = (m) => m.map((poly) => poly.map((r) => r.map(([x, y]) => [snap(x), snap(y)])));
  const frags = geoms.map((g) => ({ id: g.id, multi: snapMulti(toMulti(feature(topo, g).geometry)) }));
  const out = [];
  // (a) 겹침: 범위 상자가 겹치는 조각 쌍마다 교집합 넓이(그 자리 위도로 km²)
  const ov = pairOverlaps(frags);
  out.push({ fail: ov.worst.km2 >= PARAMS.overlapMaxKm2, msg: `(a) 조각 쌍 겹침: 가장 큰 쌍 ${ov.worst.km2.toFixed(4)}km²${ov.worst.a ? ` (${ov.worst.a}·${ov.worst.b})` : ''}, 겹친 쌍 ${ov.count}개 합 ${ov.total.toFixed(4)}km² (살핀 쌍 ${ov.pairs.toLocaleString()}개, 기준 쌍마다 ${PARAMS.overlapMaxKm2}km² 미만)` });
  // (b) 덮이지 않은 육지: 빌드가 쓰는 육지에서 조각, 이웃 행정구역, 이웃에 준 해안 칸(5단계)을 빼고 남은 조각 가운데
  //     가장 가까운 것이 이웃 행정구역이 아니라 조각인 것의 넓이(이웃 쪽 해안의 반올림 띠는 이 권역 몫이 아니다)
  const idx = new SegIndex(0.05);
  frags.forEach((f, i) => idx.addMulti(f.multi, i));
  neighbors.forEach((n, i) => idx.addMulti(n, -1 - i));
  const left = polyclip.difference(landTrue, ...frags.map((f) => f.multi), ...neighbors, ...givenAway).filter((q) => (nearestEdgeOwner(interiorPoint(q), idx) ?? -1) >= 0);
  const leftKm2 = areaKm2(left);
  const U = polyclip.union(...frags.map((f) => f.multi));
  out.push({ fail: leftKm2 >= PARAMS.gapMaxKm2, msg: `(b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) ${left.length}조각 ${leftKm2.toFixed(6)}km² (기준 ${PARAMS.gapMaxKm2}km² 미만)` });
  // (c) arc 공유: topojson merge의 둘레와 polyclip 합집합의 둘레
  const merged = snapMulti(feature(topo, mergeArcs(topo, geoms)).geometry.coordinates);
  const crackKm = (perimeterKm(merged) - perimeterKm(U)) / 2;
  out.push({ fail: crackKm > PARAMS.crackMaxKm, msg: `(c) arc 공유: 모두 합친 둘레가 합집합보다 ${(crackKm * 2).toFixed(3)}km 김(공유하지 않은 이웃 경계 약 ${crackKm.toFixed(3)}km, 기준 ${PARAMS.crackMaxKm}km 이하), 합친 폴리곤 ${merged.length}개 / 합집합 ${U.length}개` });
  const bytes = Buffer.byteLength(text);
  out.push({ warn: bytes > PARAMS.sizeWarnBytes, msg: `(d) 파일 크기 ${bytes.toLocaleString()}B (${bytes > PARAMS.sizeWarnBytes ? '1MB를 넘음' : '1MB 이하'})` });
  return out;
}

function reportChange(oldText, newText) {
  if (oldText === newText) { log('이미 있는 파일과 바이트 단위로 같음'); return; }
  const areas = (text) => { const t = JSON.parse(text); return new Map(t.objects.fragments.geometries.map((g) => [g.id, areaKm2(toMulti(feature(t, g).geometry))])); };
  const a = areas(oldText), b = areas(newText);
  const lines = [];
  for (const id of [...new Set([...a.keys(), ...b.keys()])].sort()) {
    const x = a.get(id), y = b.get(id);
    if (x === undefined) lines.push(`  새 조각 ${id} ${y.toFixed(1)}km²`);
    else if (y === undefined) lines.push(`  없어진 조각 ${id} ${x.toFixed(1)}km²`);
    else if (Math.abs(x - y) > 0.01) lines.push(`  ${id} ${x.toFixed(2)} → ${y.toFixed(2)}km²`);
  }
  log(`이미 있는 파일과 다름: 조각별 면적 변화 ${lines.length}건\n${lines.join('\n')}`);
}

// 나라별 조각 수·단위 표: adm0 → { adm0, admin, count, types: Map(단위 → 수), rules: id 규칙별 수 }
function makeTable(frags) {
  const table = new Map();
  for (const c of frags) {
    const key = c.props.adm0 || '(구멍)';
    const row = table.get(key) ?? { adm0: key, admin: c.p?.admin ?? c.props.name, count: 0, types: new Map(), rules: new Map() };
    row.count++;
    row.types.set(c.props.type || '(없음)', (row.types.get(c.props.type || '(없음)') ?? 0) + 1);
    row.rules.set(c.idRule ?? 'hole', (row.rules.get(c.idRule ?? 'hole') ?? 0) + 1);
    table.set(key, row);
  }
  return new Map([...table].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
}

// README.md: 출처·SHA·명령·매개변수·결과·나라별 조각 표. 같은 입력이면 같은 글이 나온다(시각·절대 경로를 넣지 않음)
function paramDoc() { return {
  grid: '격자(도). 좌표를 소수 넷째 자리로 반올림한다(국경 생성기 출력과 같은 격자)',
  simplifyWeight: '간략화 문턱(제곱도): Visvalingam 유효 넓이가 이보다 작은 꼭짓점을 뺀다. arc 끝점(세 조각이 만나는 점)은 남는다',
  keepSmallKm2: '원래 넓이가 이보다 작은 조각의 arc는 간략화하지 않는다(km²)',
  fullSimplifyKm2: '원래 넓이가 이보다 작은 조각의 arc는 문턱을 simplifyWeight × 넓이 / 이 값으로 낮춘다(km², 두 조각이 함께 쓰는 arc는 낮은 쪽)',
  attachKm: '닿는 조각이 없는 해안 조각을 붙일 거리(km)',
  microMinKm2: '사방이 조각으로 둘러싸인 구멍을 새 조각으로 만드는 넓이(km²)',
  splitKm2: '이보다 큰 해안 조각은 가까운 조각끼리 나눈다(km²)',
  splitCell: '나눌 때 가장 작은 칸(도)',
  coastMargin: '해안 조각을 뺄 육지를 부풀리는 폭(도, 격자 두 칸)',
  tjunctionTol: 'T자 접점: 다른 조각의 변에서 이 거리(도) 안의 꼭짓점을 그 변에 끼운다',
  untwistMaxKm2: 'arc 꼬임 풀기: 이보다 큰 고리는 자르지 않고 보고한다(km²)',
  overlapMaxKm2: '(a) 조각 쌍 겹침 기준(km²)',
  gapMaxKm2: '(b) 덮이지 않은 육지 기준(km²)',
  crackMaxKm: '(c) 공유하지 않은 이웃 경계 기준(km)',
  sizeWarnBytes: '(d) 이보다 크면 경고(바이트)',
}; }
function num(v) { return v.toLocaleString('en-US'); }
function code(v) { return '`' + v + '`'; }
function readme(r, checks) {
  const t = JSON.parse(r.text);
  const bytes = Buffer.byteLength(r.text);
  const rp = r.report;
  const region = REGIONS[REGION];
  const frags = t.objects.fragments.geometries;
  const L = [];
  L.push('# 행정구역 조각 (Natural Earth admin-1 파생)', '');
  L.push('이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: ' + SOURCE.url + ' (git blob SHA-1 ' + SOURCE.blobSha1 + ', ' + num(SOURCE.bytes) + 'B). Made with Natural Earth.', '');
  L.push('- 이 폴더는 ' + code('npm run prep:fragments') + '(' + code('scripts/prep-fragments.mjs') + ')가 쓴다. 손으로 고치지 않는다(아래 sha256을 ' + code('npm run check:generator') + '가 확인한다).');
  L.push('- 조각은 국경 생성기 안에서만 쓴다(' + code('scripts/geo/lib.mjs') + '의 ' + code('loadFragments') + '·' + code('F(...ids)') + '). 조각을 ' + code('level: region') + ' Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).');
  L.push('- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.');
  L.push('- 검사: ' + code('npm run check:fragments') + '(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 ' + code('npm run compare:cshapes') + '(CShapes 2.0이 ' + code('.cache/cshapes/') + '에 있을 때만, 좌표는 저장소에 쓰지 않음).', '');
  L.push('## 다시 만들기', '');
  L.push('1. 위 원본을 받아 ' + code('.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson') + '에 둔다(' + code('.cache/') + '는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.');
  L.push('2. ' + code('npm run prep:fragments -- .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson'));
  L.push('3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.', '');
  L.push('## 파일', '');
  L.push('| 파일 | 크기 | sha256 |', '|---|---|---|');
  L.push('| ' + code(REGION + '.topo.json') + ' | ' + num(bytes) + 'B | ' + code(sha256(r.text)) + ' |', '');
  L.push('- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.');
  L.push('- ' + code('objects.fragments') + ': 조각 ' + frags.length + '개. ' + code('id') + '와 ' + code('properties') + ' { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }');
  L.push('- ' + code('objects.domain') + ': 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).');
  L.push('- arc ' + num(t.arcs.length) + '개, 점 ' + num(t.arcs.reduce((s2, a) => s2 + a.length, 0)) + '개.', '');
  L.push('## 조각 id', '');
  const rules = { iso: 0, adm1: 0, adm0: 0, hole: 0 };
  for (const row of r.table.values()) for (const [k, n] of row.rules) rules[k] += n;
  L.push('- ISO 3166-2 코드(' + code('XX-YYY') + ', 예: ' + code('FR-67') + ')가 알맞고 겹치지 않으면 그 값: ' + rules.iso + '개');
  L.push('- 아니면 NE adm1_code(' + code('ABC-1234') + ', 예: 코소보 ' + code('KOS-5899') + '): ' + rules.adm1 + '개');
  L.push('- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(' + ['MCO', 'VAT', 'GIB', 'CYN'].map(code).join('·') + ' 등): ' + rules.adm0 + '개' + (rules.hole ? ', 내륙 구멍으로 만든 조각(' + code('HOLE-n') + ') ' + rules.hole + '개' : ''));
  L.push('- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.', '');
  L.push('## 권역과 매개변수', '');
  L.push('- 나라(adm0_a3): ' + region.adm0.join(', '));
  L.push('- 러시아(RUS): NE region 속성이 ' + region.rusRegions.join('·') + '인 연방 주체(NE의 Volga에는 남부·북캅카스 관구도 들어 있음). Urals·Siberian·Far Eastern과 카자흐스탄은 넣지 않는다(권역 바깥선이 된다).');
  L.push('- 범위 상자 [서, 남, 동, 북] = [' + region.box.join(', ') + ']. 상자 밖에 통째로 있는 폴리곤은 뺐다: ' + rp.dropped.join('; '));
  L.push('- 육지: world-atlas 2.0.2의 land-50m ∪ land-110m(Natural Earth 4.1.0, 빌드가 해안선으로 자를 때 쓰는 것과 같음). 구멍 조각 이름: world-atlas countries-10m.', '');
  L.push('| 매개변수 | 값 | 뜻 |', '|---|---|---|');
  for (const [k, v] of Object.entries(PARAMS)) L.push('| ' + code(k) + ' | ' + v + ' | ' + (paramDoc()[k] ?? '') + ' |');
  L.push('');
  L.push('## 가공 결과', '');
  L.push('- 고르기: ' + r.table.size + '개 나라에서 조각 ' + frags.length + '개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 ' + rp.islands + '개, 그래서 통째로 빠진 조각 ' + rp.islandFrags.length + '개(' + (rp.islandFrags.join(', ') || '없음') + ').');
  L.push('- 격자·간략화: 꼭짓점 ' + num(r.rawPoints) + '개(조각별 합) → ' + num(r.simplePoints) + '개. 간략화하지 않은 작은 조각 ' + rp.keptSmall + '개, 넓이에 비례해 덜 간략화한 조각 ' + rp.graded + '개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 ' + rp.untwisted.size + '개(' + ([...rp.untwisted].join(', ') || '없음') + '). 격자에 맞추며 스스로 엇갈린 arc 고리 ' + rp.untwist.count + '개를 잘라 냈다(' + rp.untwist.km2.toFixed(3) + 'km²).');
  if (rp.fidelity) L.push('- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 ' + (rp.fidelity.mean * 100).toFixed(2) + '%, 조각 가운데값 ' + (rp.fidelity.median * 100).toFixed(2) + '%, 큰 것 ' + rp.fidelity.worst.join(', ') + '.');
  L.push('- 해안 맞추기: 조각에 붙인 해안 조각 ' + num(rp.attached) + '개 ' + num(Math.round(rp.attachedKm2)) + 'km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 ' + num(Math.round(rp.neighborKm2)) + 'km². 가까운 조각끼리 나눈 큰 해안 조각 ' + rp.split.length + '개, 닿는 조각 없이 가까운 조각에 붙인 것 ' + rp.nearest.length + '개, 붙일 곳이 없는 것 ' + rp.unassigned.length + '개, 내륙 구멍으로 만든 조각 ' + rp.micro.length + '개. 해안 조각과 조각 변의 교차점 ' + num(rp.pieceInserts) + '개를 양쪽 링에 끼웠다.');
  const bigSplit = rp.split.slice().sort((a, b) => b.km2 - a.km2).slice(0, 12);
  if (bigSplit.length) {
    L.push('- 나눈 큰 해안 조각(넓은 것 12개):');
    for (const x of bigSplit) L.push('  - ' + num(Math.round(x.km2)) + 'km² (' + x.at.map((v) => v.toFixed(2)).join(', ') + '): ' + x.owners.join(', '));
  }
  L.push('- T자 접점: 꼭짓점 ' + rp.tfix + '개를 이웃 조각의 변에 끼웠다.');
  L.push('- 자체 검사:');
  for (const c of checks) L.push('  - ' + (c.fail ? '실패' : c.warn ? '경고' : '통과') + ': ' + c.msg);
  L.push('  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음', '');
  L.push('## 따로 볼 곳', '');
  const prop = (id) => frags.find((g) => g.id === id)?.properties;
  const count = (a) => r.table.get(a)?.count ?? 0;
  L.push('- 크림(' + code('UA-43') + ')·세바스토폴(' + code('UA-40') + '): NE v5.1.2 기본 파일에서 adm0가 ' + prop('UA-43')?.adm0 + '·' + prop('UA-40')?.adm0 + '이다(실제 지배 기준). id가 ISO 코드라 id는 소속과 상관없고, 어느 나라 것인지는 생성기의 조각 소유표가 정한다.');
  L.push('- 코소보: KOS ' + count('KOS') + '개 구(id는 NE adm1_code). 세르비아(SRB) ' + count('SRB') + '개 조각과 겹치지 않는다.');
  L.push('- 키프로스: 북키프로스는 조각 하나(' + code('CYN') + '), 아크로티리(' + code('WSB-5133') + ')·데켈리아(' + code('ESB-5132') + ')는 영국 주권 기지 지역 조각이다. 유엔 완충지대는 따로 조각이 없고 키프로스(CYP)의 니코시아·파마구스타 구(' + code('CY-01') + '·' + code('CY-04') + ')에 들어 있다.');
  L.push('- 소국: 안도라 ' + count('AND') + '·리히텐슈타인 ' + count('LIE') + '·산마리노 ' + count('SMR') + '개 행정구역, 모나코(' + code('MCO') + ')·바티칸(' + code('VAT') + ')·지브롤터(' + code('GIB') + ')는 한 조각씩 들어 있다(NE v5.1.2에는 이들의 admin-1이 있음). 원래 넓이가 ' + PARAMS.keepSmallKm2 + 'km² 미만인 조각은 간략화하지 않아 모양이 그대로다. 조각 사이의 내륙 구멍은 ' + (rp.micro.length ? rp.micro.map((m) => m.name + ' ' + m.pc.km2.toFixed(1) + 'km²').join(', ') : '없었다') + '.');
  L.push('- 바티칸(' + code('VAT') + '): NE admin-1 원본에서 이미 점 7개, 약 0.012km²짜리 작은 다각형이다(실제 넓이 약 0.44km²의 나머지는 로마 ' + code('IT-RM') + '에 들어 있음). 바티칸 시국을 그릴 때는 이 조각을 그대로 쓰지 말고 따로 긋는다.');
  L.push('- 러시아: 유럽 쪽 조각 ' + count('RUS') + '개. 칼리닌그라드(' + code('RU-KGD') + ')는 월경지로 한 조각이다.', '');
  L.push('## 나라별 조각 표', '');
  L.push('| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |', '|---|---|---|---|');
  const cell = (v) => String(v).replaceAll('|', '\\|');
  for (const row of r.table.values()) L.push('| ' + row.adm0 + ' | ' + cell(row.admin) + ' | ' + row.count + ' | ' + [...row.types].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([k, n]) => cell(k) + ' ' + n).join(', ') + ' |');
  L.push('');
  return L.join('\n');
}
