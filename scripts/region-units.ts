// 나라별 권역 단위 목록 만들기 (2026-11-21): 여러 권역에 걸치는 나라와 아메리카의 북·라틴 나눔을 영토 도형으로 계산해 src/schema/region-units.ts를 쓴다.
// 사용: npm run gen:region-units            (표를 다시 씀)
//       npm run gen:region-units -- --check (표가 지금 자료와 같은지만 봄. 다르면 종료 코드 1)
// 국경(data/geo)이나 나라 파일(data/entities)을 고친 뒤 다시 돌린다. build:data는 표의 id가 실제로 있는지만 본다.
//
// 방법
//  1. 오늘날 나라 경계(world-atlas 110m)를 0.25° 칸으로 칠해 칸마다 '땅의 권역'을 정한다(zoneOf). 나라 단위가 기본이고 몇 곳만 나라 안에서 가른다:
//     튀르키예의 아시아 쪽·키프로스·캅카스 세 나라는 서아시아, 신장은 중앙아시아, 우랄 동쪽 러시아는 권역 없음, 하와이는 오세아니아, 프랑스령 기아나는 라틴아메리카.
//     수단·모리타니는 사하라 이남, 아프가니스탄은 중앙아시아, 멕시코 이남은 라틴아메리카(나라 파일이 든 권역과 같게).
//  2. 나라의 영토 버전마다 권역별 넓이를 잰다. 한 버전에서 어떤 권역의 넓이가 SPAN_AREA 이상이거나, 그 버전 넓이의 SPAN_SHARE 이상이면서 SPAN_MIN_AREA 이상이면 '걸침'.
//  3. 걸친 햇수를 모두 더해 SPAN_YEARS 이상이면 그 권역을 나라의 단위에 더한다(전쟁 중의 짧은 점령은 빠진다).
//  4. 나라의 첫 단위(기본 단위)는 나라 파일의 단위(regions.ts REGION_FILTER_OF)다. 아메리카 파일만 북아메리카·라틴아메리카 가운데 영토가 더 넓은 쪽이고,
//     영토가 없는 항목은 아래 NO_GEO_UNITS에 손으로 적는다(없으면 오류).
// 표에는 단위 목록이 기본 단위 하나와 다른 나라만 적는다.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { REGION_FILTERS, REGION_FILTER_OF, type RegionFilterUnit } from '../src/schema/regions.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/schema/region-units.ts');
const CHECK = process.argv.includes('--check');

/** 한 권역에 이만큼(km²) 영토가 있으면 걸침 */
const SPAN_AREA = 300_000;
/** 또는 그 해 영토의 이 비율 이상이면서 SPAN_MIN_AREA(km²) 이상이면 걸침 */
const SPAN_SHARE = 0.15;
const SPAN_MIN_AREA = 10_000;
/** 걸친 햇수가 모두 합쳐 이 이상이어야 단위에 더한다 */
const SPAN_YEARS = 10;
const THIS_YEAR = 2026;

/** 영토 도형이 없는 아메리카 항목의 단위 (문화·문명 항목 등) */
const NO_GEO_NORTH = ['poverty-point-culture', 'adena-culture', 'hopewell-culture', 'norse-greenland', 'mississippian-culture', 'ancestral-puebloan-culture', 'hohokam-culture', 'thule-culture', 'dorset-culture', 'haudenosaunee'];
const NO_GEO_LATIN = [
  'monte-alban', 'teotihuacan', 'olmec-culture', 'norte-chico', 'valdivia', 'chavin-culture', 'paracas-culture', 'nasca-culture', 'moche-culture', 'wari', 'tiwanaku',
  'muisca', 'neo-inca-state', 'barbados', 'grenada', 'dominica', 'saint-lucia', 'saint-vincent-and-the-grenadines', 'antigua-and-barbuda', 'saint-kitts-and-nevis',
  'toltec', 'chichen-itza', 'mayapan', 'mixtec', 'sican-culture', 'chancay-culture', 'taino-culture', 'carib', 'maya-civilization', 'tairona-culture',
];
const NO_GEO_UNITS: Record<string, RegionFilterUnit[]> = Object.fromEntries([
  ...NO_GEO_NORTH.map((id) => [id, ['north-america']]),
  ...NO_GEO_LATIN.map((id) => [id, ['latin-america']]),
]);

// ── 칸 ──
const STEP = 0.25;
const COLS = 360 / STEP;
const ROWS = 180 / STEP;
const latOf = (r: number) => -90 + STEP / 2 + r * STEP;
const lonOf = (c: number) => -180 + STEP / 2 + c * STEP;
const CELL_KM2 = (STEP * 111.32) ** 2;

type Ring = number[][];
/** 도형(고리 묶음)이 덮는 칸마다 fn(행, 열)을 부른다. 짝홀 규칙의 가로줄 채우기 */
function fill(rings: Ring[], fn: (r: number, c: number) => void) {
  const rows = new Map<number, number[]>();
  for (const ring of rings) {
    for (let i = 0; i + 1 < ring.length; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[i + 1];
      if (y1 === y2 || Math.abs(x2 - x1) > 180) continue;
      const lo = Math.min(y1, y2);
      const hi = Math.max(y1, y2);
      const r0 = Math.max(0, Math.ceil((lo - latOf(0)) / STEP));
      for (let r = r0; r < ROWS && latOf(r) < hi; r++) {
        const y = latOf(r);
        if (y < lo) continue;
        const x = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
        let list = rows.get(r);
        if (!list) rows.set(r, (list = []));
        list.push(x);
      }
    }
  }
  for (const [r, xs] of rows) {
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const c0 = Math.ceil((xs[i] - lonOf(0)) / STEP);
      for (let c = c0; lonOf(0) + c * STEP < xs[i + 1]; c++) fn(r, ((c % COLS) + COLS) % COLS);
    }
  }
}
type Geometry = { type: 'Polygon'; coordinates: Ring[] } | { type: 'MultiPolygon'; coordinates: Ring[][] };
const ringsOf = (g: Geometry): Ring[] => (g.type === 'Polygon' ? g.coordinates : g.coordinates.flat());

// ── 땅의 권역 ──
const BY_COUNTRY: Record<RegionFilterUnit, string[]> = {
  'east-asia': ['156', '392', '408', '410', '496', '158'],
  'central-asia': ['398', '417', '762', '795', '860', '004'],
  'south-asia': ['356', '586', '050', '524', '064', '144'],
  'southeast-asia': ['096', '116', '360', '418', '458', '104', '608', '702', '764', '626', '704'],
  'middle-east': ['368', '376', '400', '414', '422', '512', '634', '682', '275', '760', '784', '887', '048', '364', '012', '818', '434', '504', '788', '732',
    '792', '196', 'N. Cyprus', '268', '051', '031'],
  europe: ['112', '100', '203', '348', '616', '498', '642', '643', '703', '804', '208', '233', '246', '352', '372', '428', '440', '578', '752', '826',
    '008', '070', '191', '300', '380', '807', '499', '620', '688', '705', '724', '470', 'Kosovo', '040', '056', '250', '276', '442', '528', '756'],
  'sub-saharan-africa': ['729', '478', '204', '854', '132', '384', '270', '288', '324', '624', '430', '466', '562', '566', '686', '694', '768',
    '024', '120', '140', '148', '178', '180', '226', '266', '678', '108', '174', '262', '232', '231', '404', '450', '454', '480', '508', '646', '690', '706', '728', '800', '834', '894', '716', 'Somaliland',
    '072', '748', '426', '516', '710'],
  'north-america': ['124', '840', '304'],
  'latin-america': ['084', '188', '222', '320', '340', '484', '558', '591', '044', '192', '214', '332', '388', '630', '780',
    '032', '068', '076', '152', '170', '218', '238', '328', '600', '604', '740', '858', '862'],
  oceania: ['036', '554', '242', '540', '598', '090', '548'],
};
const unitOfCountry = new Map<string, RegionFilterUnit>();
for (const [unit, ids] of Object.entries(BY_COUNTRY)) for (const id of ids) unitOfCountry.set(id, unit as RegionFilterUnit);

/** 오늘날 나라(id 또는 이름)의 한 점이 어느 권역 땅인지. 권역 없음은 null */
function zoneOf(country: string, lon: number, lat: number): RegionFilterUnit | null {
  if (country === '792') return lon < 29 && lat > 40.4 ? 'europe' : 'middle-east'; // 튀르키예: 동트라키아만 유럽
  if (country === '643') return lon < 60 && lon > 0 ? 'europe' : null; // 러시아: 우랄 동쪽(시베리아·극동)은 권역 없음
  if (country === '156') {
    // 신장(쿤룬·알툰산맥 북쪽, 하미 서쪽)은 중앙아시아
    const xinjiang = (lon <= 90 && lat >= 36) || (lon > 90 && lon <= 93 && lat >= 39) || (lon > 93 && lon <= 96 && lat >= 41.5);
    return xinjiang && lon >= 73 ? 'central-asia' : 'east-asia';
  }
  if (country === '840') return lon < -150 && lat < 30 ? 'oceania' : 'north-america'; // 하와이
  if (country === '250') return lon < -40 ? 'latin-america' : 'europe'; // 프랑스령 기아나
  return unitOfCountry.get(country) ?? null;
}

const UNIT_INDEX = new Map(REGION_FILTERS.map((u, i) => [u, i + 1]));
const zone = new Uint8Array(ROWS * COLS); // 0 = 권역 없음(바다·남극·시베리아), 그 밖은 REGION_FILTERS 순서 + 1
{
  const topo = JSON.parse(readFileSync(path.join(ROOT, 'node_modules/world-atlas/countries-110m.json'), 'utf8'));
  const countries = (feature(topo, topo.objects.countries) as unknown as { features: { id?: string; properties: { name: string }; geometry: Geometry }[] }).features;
  for (const f of countries) {
    const key = f.id !== undefined && (unitOfCountry.has(String(f.id)) || ['792', '643', '156', '840', '250'].includes(String(f.id))) ? String(f.id) : f.properties.name;
    fill(ringsOf(f.geometry), (r, c) => {
      const unit = zoneOf(key, lonOf(c), latOf(r));
      if (unit) zone[r * COLS + c] = UNIT_INDEX.get(unit)!;
    });
  }
}

// ── 나라 ──
type Item = { id: string; file: string; name: string };
const items: Item[] = [];
for (const f of readdirSync(path.join(ROOT, 'data/entities')).filter((n) => n.endsWith('.yaml')).sort()) {
  const file = f.replace(/\.yaml$/, '');
  const lines = readFileSync(path.join(ROOT, 'data/entities', f), 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = /^- id: ["']?([^"'\s#]+)["']?\s*$/.exec(lines[i].replace(/\r$/, ''));
    if (!m) continue;
    let name = m[1];
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const n = /names:\s*\{\s*ko:\s*["']?([^,"'}]+)/.exec(lines[j]);
      if (n) { name = n[1].trim(); break; }
    }
    items.push({ id: m[1], file, name });
  }
}

type Version = { from: number; to: number | null; geometry: Geometry | null };
function versionsOf(id: string): Version[] {
  let text: string;
  try {
    text = readFileSync(path.join(ROOT, 'data/geo', `${id}.geojson`), 'utf8');
  } catch {
    return [];
  }
  const fc = JSON.parse(text) as { features: { properties: { entityId: string; from: number; to: number | null }; geometry: Geometry | null }[] };
  return fc.features.filter((f) => f.properties.entityId === id).map((f) => ({ from: f.properties.from, to: f.properties.to, geometry: f.geometry }));
}

/** 넓이로는 북아메리카가 더 넓지만 중심지(수도 멕시코시티)가 라틴아메리카인 나라의 기본 단위 */
const HOME_OVERRIDE: Record<string, RegionFilterUnit> = { mexico: 'latin-america', 'new-spain-viceroyalty': 'latin-america' };

/** 관련 나라(subjects)에 아메리카 나라가 없는 아메리카 사건의 단위 — 유럽 나라의 항해·정착 사건. build:data가 빠진 사건을 오류로 알린다 */
const EVENT_UNITS: Record<string, RegionFilterUnit[]> = {
  'cabot-1497': ['north-america'],
  'cartier-1534': ['north-america'],
  'roanoke-1584': ['north-america'],
  'mayflower-1620': ['north-america'],
  'bering-1741': ['north-america'],
  'cabral-1500': ['latin-america'],
  'magellan-strait-1519': ['latin-america'],
  'brazil-captaincies-1534': ['latin-america'],
  'buenos-aires-1536': ['latin-america'],
  'iberian-union-1580': ['latin-america'],
  'drake-1577': ['north-america', 'latin-america'],
};

const N = REGION_FILTERS.length;
const AMERICAS: RegionFilterUnit[] = ['north-america', 'latin-america'];
const table: [id: string, units: RegionFilterUnit[], note: string][] = [];
const errors: string[] = [];
for (const item of items) {
  const fileUnit = REGION_FILTER_OF[item.file];
  if (!fileUnit) continue; // build:data가 오류로 알린다
  const versions = versionsOf(item.id);
  const years = new Float64Array(N + 1); // 권역별 걸친 햇수
  const peak = new Float64Array(N + 1); // 권역별 가장 넓었던 넓이
  for (const v of versions) {
    if (!v.geometry) continue;
    const area = new Float64Array(N + 1);
    let total = 0;
    fill(ringsOf(v.geometry), (r, c) => {
      const a = CELL_KM2 * Math.cos((latOf(r) * Math.PI) / 180);
      area[zone[r * COLS + c]] += a;
      total += a;
    });
    const span = (v.to ?? THIS_YEAR) - v.from;
    for (let z = 1; z <= N; z++) {
      peak[z] = Math.max(peak[z], area[z]);
      if (area[z] >= SPAN_AREA || (area[z] >= SPAN_MIN_AREA && area[z] >= total * SPAN_SHARE)) years[z] += span;
    }
  }
  let home = fileUnit;
  const isAmericas = item.file === 'americas' || item.file.startsWith('americas-');
  if (isAmericas) {
    const [n, l] = AMERICAS.map((u) => peak[UNIT_INDEX.get(u)!]);
    if (n === 0 && l === 0) {
      const manual = NO_GEO_UNITS[item.id];
      if (!manual) errors.push(`${item.id} (${item.name}, ${item.file}): 영토가 없어 북·라틴을 정할 수 없음 — NO_GEO_UNITS에 적을 것`);
      else if (manual[0] !== fileUnit) table.push([item.id, manual, `${item.name} — 영토 없음, 손으로 정함`]);
      continue;
    }
    home = HOME_OVERRIDE[item.id] ?? (n > l ? 'north-america' : 'latin-america');
  }
  const units = [home, ...REGION_FILTERS.filter((u) => u !== home && years[UNIT_INDEX.get(u)!] >= SPAN_YEARS)];
  if (units.length === 1 && units[0] === fileUnit) continue;
  const extra = units.slice(1).map((u) => `${u} ${Math.round(years[UNIT_INDEX.get(u)!])}년·최대 ${Math.round(peak[UNIT_INDEX.get(u)!] / 1000)}천km²`);
  table.push([item.id, units, `${item.name}${extra.length ? ' — ' + extra.join(', ') : ''}`]);
}
for (const id of Object.keys(NO_GEO_UNITS)) if (!items.some((i) => i.id === id)) errors.push(`NO_GEO_UNITS의 '${id}'는 없는 나라`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

table.sort((a, b) => a[0].localeCompare(b[0]));
const body = `// 나라별 권역 단위 목록 — scripts/region-units.ts가 만든 파일이다. 손으로 고치지 않는다(npm run gen:region-units).
// 단위 목록이 나라 파일의 기본 단위 하나(regions.ts REGION_FILTER_OF)와 다른 나라만 있다: 여러 권역에 걸치는 나라, 아메리카 파일의 북아메리카 나라.
// 첫 단위가 그 나라의 기본 단위다. 기준(넓이·비율·햇수)과 땅의 권역 나눔은 scripts/region-units.ts 첫머리.
// build:data만 이 파일을 읽어 entities.json·events.json의 \`units\`에 넣는다(앱 묶음에는 들어가지 않는다).
// EVENT_UNITS는 관련 나라에 아메리카 나라가 없는 아메리카 사건의 단위다(scripts/region-units.ts에 손으로 적은 표 그대로).
import type { RegionFilterUnit } from './regions.ts';

export const ENTITY_UNITS: Record<string, RegionFilterUnit[]> = {
${table.map(([id, units, note]) => `  ${/^[a-z_$][\w$]*$/i.test(id) ? id : `'${id}'`}: [${units.map((u) => `'${u}'`).join(', ')}], // ${note}`).join('\n')}
};

export const EVENT_UNITS: Record<string, RegionFilterUnit[]> = {
${Object.entries(EVENT_UNITS).map(([id, units]) => `  '${id}': [${units.map((u) => `'${u}'`).join(', ')}],`).join('\n')}
};
`;
let before = '';
try {
  before = readFileSync(OUT, 'utf8');
} catch {
  // 처음 만든다
}
const spanning = table.filter(([, u]) => u.length > 1).length;
if (CHECK) {
  if (before.replace(/\r\n/g, '\n') !== body) {
    console.error('region-units.ts가 지금 자료와 다름 — npm run gen:region-units로 다시 만들 것');
    process.exit(1);
  }
  console.log(`gen:region-units --check  이상 없음 (표 ${table.length}줄, 걸치는 나라 ${spanning})`);
} else {
  writeFileSync(OUT, body, 'utf8');
  console.log(`gen:region-units  표 ${table.length}줄 (걸치는 나라 ${spanning}, 나라 ${items.length}개 가운데) → ${path.relative(ROOT, OUT)}`);
}
