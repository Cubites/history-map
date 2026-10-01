// 근현대 국경 대조 (DESIGN.md §5.2 '행정구역 조각'): CShapes 2.0과 국경 생성기 결과·조각 조립 결과를 날짜별 대칭차 면적으로 비교한다.
// 사용: npm run compare:cshapes [-- 연도 ...]   연도를 주면 그해 1월 1일에, 주지 않으면 비교할 나라의 국경이 바뀌는 해(1886~2019)마다 비교한다
// CShapes 2.0: Schvitz, Rüegger, Girardin, Cederman, Weidmann, Gleditsch, "Mapping the International System, 1886-2019: The CShapes 2.0 Dataset",
//   Journal of Conflict Resolution 66(1), 2022, https://icr.ethz.ch/data/cshapes/ (CC BY-NC-SA 4.0).
// 원본은 저장소에 넣지 않는다: .cache/cshapes/CShapes-2.0.geojson(.gitignore)에 있을 때만 돌고, 없으면 건너뛴다(종료 코드 0).
// 좌표는 읽기만 하고 아무 파일도 쓰지 않는다(표만 출력). 도형·좌표를 저장소에 옮기지 않아야 NC·SA 조건이 저장소로 번지지 않는다(DESIGN.md §12).
// 표는 '차이 목록'이지 정답이 아니다. CShapes는 1만 km² 미만 변화, 승인되지 않은 점령, 전후 되돌려진 전시 변화를 빼고, 분쟁지는 실제 지배로 나누며,
// GW판에는 소국(모나코·리히텐슈타인·안도라·산마리노·바티칸)이 없다. 차이가 크면 사료로 확인해 생성기(조각 소유표)를 고친다(DESIGN.md §11).
// [1] 생성기: data/geo의 유럽 나라(GW_ENTITIES) 가운데 그날 살아 있는 버전과 그날의 CShapes 나라. 둘 다 land-50m으로 잘라(빌드와 같음) 비교한다
// [2] 조각 조립: data/base/fragments의 조각을 adm0별로 합친 현대 나라와 CShapes 2019-01-01 나라. 둘 다 land-50m과 권역 바깥선 안으로 잘라 비교한다
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { areaKm2, bboxOf, boxesApart, loadLand, polyclip, toMulti, unwrapAntimeridian } from './fragments/common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSHAPES = path.join(ROOT, '.cache/cshapes/CShapes-2.0.geojson');
const args = process.argv.slice(2);
if (args.some((a) => !/^\d{4}$/.test(a) || Number(a) < 1886 || Number(a) > 2019)) {
  console.error(`사용: npm run compare:cshapes [-- 연도 ...] (연도는 1886~2019, 받은 인자: ${args.join(' ')})`);
  process.exit(2);
}
if (!existsSync(CSHAPES)) {
  console.log(`CShapes 2.0이 없어 건너뜀: ${path.relative(ROOT, CSHAPES)} (받는 곳 https://icr.ethz.ch/data/cshapes/, CC BY-NC-SA 4.0. 저장소에 넣지 않고 .cache/에 둔다)`);
  process.exit(0);
}

// [1]에서 비교할 생성기 나라: GW 번호 → data/geo의 나라 id(기간이 이어지는 id들). 유럽 권역을 넣으면 여기에 더한다.
// 키가 '390+395'처럼 +로 이어지면 CShapes의 그 나라들을 합쳐 비교한다(덴마크 본국과 아이슬란드: 생성기는 덴마크에 아이슬란드를 넣음).
// 2026-10-02(작업 E2): 1815~1914 유럽 뼈대의 나라를 더함. 3461은 CShapes의 보스니아(1886~1908, 오스트리아-헝가리 점령지)
const GW_ENTITIES = {
  200: ['uk'], 220: ['france'], 365: ['russia', 'soviet-union', 'russia-fed'],
  210: ['netherlands'], 211: ['belgium'], 212: ['luxembourg'], 225: ['switzerland'], 230: ['spain'], 235: ['portugal'],
  255: ['german-empire'], 300: ['austria-hungary'], 3461: ['bosnia-occupied'], 325: ['italy'],
  '390+395': ['denmark'], 380: ['sweden-norway', 'sweden'], 385: ['norway'],
  640: ['ottoman'], 350: ['greece'], 340: ['serbia'], 341: ['montenegro'], 360: ['romania'], 355: ['bulgaria'], 339: ['albania'],
};
// 권역 바깥선(조각 domain) 안만 비교하는 나라: 생성기가 권역 바깥선 안만 그린 나라(오스만 제국. CShapes는 중동·북아프리카까지 넣음)
const DOMAIN_ONLY = new Set(['640']);
// [2] 조각 adm0 → CShapes 2019의 GW 번호. 속령·주권 기지는 본국과 묶고, 소국은 CShapes에 없어 뺀다
const GW_FRAGMENTS = [
  [200, ['GBR', 'IMN', 'JEY', 'GGY', 'GIB']], [205, ['IRL']], [210, ['NLD']], [211, ['BEL']], [212, ['LUX']], [220, ['FRA']], [225, ['CHE']],
  [230, ['ESP']], [235, ['PRT']], [260, ['DEU']], [290, ['POL']], [305, ['AUT']], [310, ['HUN']], [316, ['CZE']], [317, ['SVK']], [325, ['ITA']],
  [338, ['MLT']], [339, ['ALB']], [340, ['SRB']], [341, ['MNE']], [343, ['MKD']], [344, ['HRV']], [346, ['BIH']], [347, ['KOS']], [349, ['SVN']],
  [350, ['GRC']], [352, ['CYP', 'CYN', 'ESB', 'WSB']], [355, ['BGR']], [359, ['MDA']], [360, ['ROU']], [365, ['RUS']], [366, ['EST']], [367, ['LVA']],
  [368, ['LTU']], [369, ['UKR']], [370, ['BLR']], [371, ['ARM']], [372, ['GEO']], [373, ['AZE']], [375, ['FIN', 'ALD']], [380, ['SWE']],
  [385, ['NOR']], [390, ['DNK', 'FRO']], [395, ['ISL']], [640, ['TUR']],
];

const t0 = performance.now();
const cs = JSON.parse(readFileSync(CSHAPES, 'utf8')).features.map((f) => {
  const p = f.properties;
  return { gw: p.gwcode, name: p.cntry_name, from: p.gwsyear * 1e4 + p.gwsmonth * 100 + p.gwsday, to: p.gweyear * 1e4 + p.gwemonth * 100 + p.gweday, fromYear: p.gwsyear, geom: f.geometry };
});
const shape = (gw, day) => cs.find((c) => c.gw === gw && c.from <= day && day <= c.to);
// GW_ENTITIES의 키(번호 하나 또는 '390+395')로 그날의 CShapes 나라들
const shapesOf = (key, day) => String(key).split('+').map((g) => shape(Number(g), day)).filter(Boolean);
const multiOf = (c) => toMulti(c.geom).flatMap(unwrapAntimeridian);
const land50 = loadLand('50m');
const onLand = (multi) => { const b = bboxOf(multi); const near = land50.filter((poly) => !boxesApart(bboxOf([poly]), b)); return near.length ? polyclip.intersection(multi, near) : []; };
const km = (v) => Math.round(v).toLocaleString('en-US');
const pct = (a, b) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : '-');
console.log(`CShapes 2.0: 나라-기간 ${cs.length}개 (${path.relative(ROOT, CSHAPES)}, 좌표는 읽기만 함)`);

// [1] 생성기
const geo = (id) => {
  const file = path.join(ROOT, 'data/geo', `${id}.geojson`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).features : [];
};
const versions = Object.fromEntries(Object.entries(GW_ENTITIES).map(([gw, ids]) => [gw, ids.flatMap((id) => geo(id).map((f) => ({ id, from: f.properties.from, to: f.properties.to ?? 3000, multi: toMulti(f.geometry) })))]));
let years = args.map(Number);
if (!years.length) {
  const set = new Set([1886, 2019]);
  for (const [gw, list] of Object.entries(versions)) {
    for (const v of list) for (const y of [v.from, v.to]) if (y >= 1886 && y <= 2019) set.add(y);
    const gws = String(gw).split('+').map(Number);
    for (const c of cs) if (gws.includes(c.gw) && c.fromYear >= 1886 && c.fromYear <= 2019) set.add(c.fromYear);
  }
  years = [...set].sort((a, b) => a - b);
}
console.log(`[1] 생성기와 CShapes (그해 1월 1일, land-50m 안. ${[...DOMAIN_ONLY].join('·')}은 권역 바깥선 안만): ${years.length}개 해 × ${Object.keys(GW_ENTITIES).length}개 나라`);
console.log('  날짜        GW   CShapes 이름                 생성기 버전                CShapes km²   생성기 km²   대칭차 km²   비율');
const { loadFragments } = await import(pathToFileURL(path.join(ROOT, 'scripts/geo/lib.mjs')).href);
const europeDomain = DOMAIN_ONLY.size ? loadFragments('europe').domain : [];
for (const y of years) {
  for (const [gw, list] of Object.entries(versions)) {
    const found = shapesOf(gw, y * 1e4 + 101);
    const v = list.find((x) => x.from <= y && y < x.to);
    if (!found.length && !v) continue;
    const c = found.length ? { name: found.map((f) => f.name).join('+'), multi: found.length === 1 ? multiOf(found[0]) : polyclip.union(...found.map(multiOf)) } : null;
    const clip = (m) => (DOMAIN_ONLY.has(gw) ? polyclip.intersection(m, europeDomain) : m);
    const a = c ? onLand(clip(c.multi)) : [], b = v ? onLand(clip(v.multi)) : [];
    const x = polyclip.xor(a, b);
    const label = v ? `${v.id} ${v.from}~${v.to === 3000 ? '' : v.to}` : '(없음)';
    console.log(`  ${y}-01-01  ${String(gw).padStart(3)}  ${(c?.name ?? '(없음)').padEnd(28)} ${label.padEnd(26)} ${km(areaKm2(a)).padStart(11)} ${km(areaKm2(b)).padStart(12)} ${km(areaKm2(x)).padStart(12)} ${pct(areaKm2(x), areaKm2(a)).padStart(6)}`);
  }
}

// [2] 조각 조립 (2019-01-01)
const fragDir = path.join(ROOT, 'data/base/fragments');
const fragFiles = existsSync(fragDir) ? readdirSync(fragDir).filter((f) => f.endsWith('.topo.json')).sort() : [];
if (!fragFiles.length) console.log('[2] 조각 파일이 없어 건너뜀 (npm run prep:fragments)');
for (const file of fragFiles) {
  const set = loadFragments(file.slice(0, -'.topo.json'.length));
  const byAdm0 = new Map();
  for (const id of set.ids) byAdm0.set(set.props.get(id).adm0, [...(byAdm0.get(set.props.get(id).adm0) ?? []), id]);
  console.log(`[2] 조각 조립(${file})과 CShapes 2019-01-01 (land-50m과 권역 바깥선 안)`);
  console.log('  GW   CShapes 이름                   조각 adm0            CShapes km²   조각 km²   대칭차 km²   비율');
  const rows = [];
  for (const [gw, adm0s] of GW_FRAGMENTS) {
    const ids = adm0s.flatMap((a) => byAdm0.get(a) ?? []);
    const c = shape(gw, 20190101);
    if (!ids.length || !c) { console.log(`  ${String(gw).padStart(3)}  ${(c?.name ?? '(CShapes에 없음)').padEnd(30)} ${adm0s.join('+').padEnd(20)} (조각 ${ids.length}개) 건너뜀`); continue; }
    const a = onLand(polyclip.intersection(multiOf(c), set.domain));
    const b = onLand(set.F(...ids));
    const d = areaKm2(polyclip.xor(a, b));
    rows.push({ gw, d, a: areaKm2(a) });
    console.log(`  ${String(gw).padStart(3)}  ${c.name.padEnd(30)} ${adm0s.join('+').padEnd(20)} ${km(areaKm2(a)).padStart(11)} ${km(areaKm2(b)).padStart(10)} ${km(d).padStart(12)} ${pct(d, areaKm2(a)).padStart(6)}`);
  }
  const unmatched = [...byAdm0.keys()].filter((a) => !GW_FRAGMENTS.some(([, list]) => list.includes(a)));
  console.log(`  CShapes GW판에 없어 비교하지 않은 조각 adm0: ${unmatched.join(', ') || '없음'}`);
  console.log(`  합: CShapes ${km(rows.reduce((s, r) => s + r.a, 0))}km², 대칭차 ${km(rows.reduce((s, r) => s + r.d, 0))}km²`);
}
console.log(`(${((performance.now() - t0) / 1000).toFixed(1)}초, 파일은 쓰지 않음)`);
