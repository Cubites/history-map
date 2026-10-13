// 강 기준선 가공 (npm run test:geo의 lines 검사용): Natural Earth 1:10m 강 v5.1.2에서, 국경 생성기 상수의 꼬리표가 가리키는 강만 뽑아 data/base/rivers/rivers.geojson에 쓴다.
// 사용: npm run prep:rivers            (원본이 없으면 .cache/natural-earth/v5.1.2/에 받는다. 크기와 sha256을 확인한다)
//       npm run prep:rivers -- --check  (파일을 쓰지 않고, 지금 꼬리표로 만든 결과가 저장소의 파일과 바이트까지 같은지만 본다. 같지 않으면 종료 코드 1)
// 원본(퍼블릭 도메인, raw.githubusercontent.com의 nvkelso/natural-earth-vector v5.1.2 태그):
//   ne_10m_rivers_lake_centerlines.geojson (7.3MB, 세계), ne_10m_rivers_europe.geojson (2.5MB, 유럽 보충판)
//   원본은 저장소에 넣지 않는다(.cache/natural-earth/v5.1.2/, .gitignore).
// 꼬리표: scripts/geo/shared.mjs와 scripts/geo/areas/*.mjs에서 `// @기준선 강 <키> ...` 줄을 찾고, 그 키(RIVER_SETS)에 적힌 이름의 강 선분만 가져온다.
//   꼬리표 문법은 scripts/test-geo/checks/lines.ts의 머리 주석에 있다. 새 강을 재려면 아래 RIVER_SETS에 키와 Natural Earth 이름을 더하고 다시 돌린다.
// 가공: 같은 이름의 선분을 모아 (1) 평면 더글러스-포이커 0.001°(약 100m)로 줄이고 (2) 소수 셋째 자리로 반올림한다. 좌표는 [경도, 위도].
//   기준선으로만 쓰므로 3km 안팎의 허용에 비해 충분히 작은 오차다. 결과: data/base/rivers/rivers.geojson (한 줄에 강 하나), README.md (출처·크기·sha256·강 표)
// 자체 검사: 꼬리표가 가리키는 키가 모두 RIVER_SETS에 있고 선분이 하나 이상 나옴, 처음부터 두 번 만들어 바이트가 같음. 하나라도 실패하면 쓰지 않는다.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_DIR = path.join(ROOT, '.cache/natural-earth/v5.1.2');
const OUT_DIR = path.join(ROOT, 'data/base/rivers');
const GEO_DIR = path.join(ROOT, 'scripts/geo');
const BASE_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/';

const SOURCES = [
  { src: 'cl', file: 'ne_10m_rivers_lake_centerlines.geojson', bytes: 7307743, sha256: 'bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a', ko: '세계 강·호수 중심선' },
  { src: 'eu', file: 'ne_10m_rivers_europe.geojson', bytes: 2534505, sha256: '90712202ac46985812e90840df9acd5101599a9c649868d5bc55ee96c2fedd4c', ko: '유럽 강 보충판' },
];

// 꼬리표 키 → Natural Earth 이름(name_en, 없으면 name이 이 목록에 있으면 그 강의 선분). 한 키가 여러 이름을 가질 수 있다(Natural Earth가 한 강을 이름 둘로 나눈 곳)
const RIVER_SETS = {
  amur: { ko: '흑룡강(아무르강)', names: ['Amur', 'Heilong Jiang'] },
  argun: { ko: '아르군강(어얼구나강)', names: ['Ergun', 'Argun’'] },
  shilka: { ko: '실카강', names: ['Shilka'] },
  ussuri: { ko: '우수리강과 숭가차강(싱카이호에서 우수리강으로 흐르는 지류)', names: ['Ussuri', 'Wusuli', 'Song’acha'] },
  yalu: { ko: '압록강', names: ['Yalu'] },
  tumen: { ko: '두만강', names: ['Tumen'] },
  liao: { ko: '요하(랴오허)', names: ['Liao'] },
  danube: { ko: '도나우강(다뉴브강)', names: ['Danube'] },
  vistula: { ko: '비스와강', names: ['Vistula'] },
  main: { ko: '마인강', names: ['Main'] },
  rhine: { ko: '라인강', names: ['Rhine', 'Rhein'] },
  volkhov: { ko: '볼호프강', names: ['Volkhov'] },
  dvina: { ko: '서드비나강', names: ['Zapadnaya Dvina'] },
  dnieper: { ko: '드니프로강', names: ['Dnieper', 'Dnipro', 'Dnepr'] },
};

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const fmt = (n) => n.toLocaleString('en-US');
const fail = (msg) => { console.error('prep:rivers 실패: ' + msg); process.exit(1); };

// ── 원본 받기·확인 ────────────────────────────────────────────
async function loadSource(s) {
  const file = path.join(CACHE_DIR, s.file);
  if (!existsSync(file)) {
    console.log(`받는 중: ${BASE_URL + s.file}`);
    // User-Agent에는 도구 이름만 둔다
    const res = await fetch(BASE_URL + s.file, { headers: { 'User-Agent': 'history-map-prep-rivers' } });
    if (!res.ok) fail(`${s.file} 받기 실패 (HTTP ${res.status})`);
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const buf = readFileSync(file);
  if (buf.length !== s.bytes) fail(`${s.file}: 크기 ${buf.length}B (기대 ${s.bytes}B). 판이 다른 파일이면 지우고 다시 받는다`);
  if (sha256(buf) !== s.sha256) fail(`${s.file}: sha256이 다름 (기대 ${s.sha256})`);
  return JSON.parse(buf.toString('utf8'));
}

// ── 꼬리표 훑기: 쓰는 키 모으기 ────────────────────────────────
function usedKeys() {
  const files = ['shared.mjs', ...readdirSync(path.join(GEO_DIR, 'areas')).filter((f) => f.endsWith('.mjs')).sort().map((f) => 'areas/' + f)];
  const keys = new Map(); // 키 → 쓰는 상수들
  for (const rel of files) {
    const lines = readFileSync(path.join(GEO_DIR, rel), 'utf8').split('\n');
    let pending = [];
    for (const line of lines) {
      const tag = line.match(/^\/\/ @기준선 강 ([a-z][a-z0-9-]*)/);
      if (tag) { pending.push(tag[1]); continue; }
      const decl = line.match(/^(?:export )?const (\w+) =/);
      if (decl) for (const k of pending) keys.set(k, [...(keys.get(k) ?? []), decl[1]]);
      pending = [];
    }
  }
  return keys;
}

// ── 줄이기 ────────────────────────────────────────────────────
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let worst = -1, wi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segDist(pts[i], pts[a], pts[b]);
      if (d > worst) { worst = d; wi = i; }
    }
    if (worst > tol) { keep[wi] = 1; stack.push([a, wi], [wi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const round3 = (v) => Math.round(v * 1e3) / 1e3;
function simplify(line) {
  const out = [];
  for (const p of dp(line, 0.001)) {
    const q = [round3(p[0]), round3(p[1])];
    if (!out.length || out.at(-1)[0] !== q[0] || out.at(-1)[1] !== q[1]) out.push(q);
  }
  return out;
}

// ── 만들기 (같은 입력이면 항상 같은 바이트) ──────────────────────
function build(sources, keys) {
  const features = [];
  const stats = new Map();
  for (const key of [...keys.keys()].sort()) {
    const set = RIVER_SETS[key];
    if (!set) fail(`꼬리표 키 '${key}'(${keys.get(key).join('·')})가 RIVER_SETS에 없음. scripts/prep-rivers.mjs에 Natural Earth 이름을 더할 것`);
    const st = { features: 0, parts: 0, pointsIn: 0, pointsOut: 0, names: new Set() };
    for (const { src, json } of sources) {
      const byName = new Map();
      for (const f of json.features) {
        const nm = f.properties.name_en || f.properties.name;
        if (!set.names.includes(nm)) continue;
        const parts = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.type === 'MultiLineString' ? f.geometry.coordinates : [];
        if (!byName.has(nm)) byName.set(nm, []);
        byName.get(nm).push(...parts);
      }
      for (const nm of set.names) {
        const parts = byName.get(nm);
        if (!parts) continue;
        st.names.add(nm);
        const lines = parts.map((l) => { st.pointsIn += l.length; const s = simplify(l); st.pointsOut += s.length; return s; }).filter((l) => l.length >= 2);
        if (!lines.length) continue;
        st.features++;
        st.parts += lines.length;
        features.push({ type: 'Feature', properties: { set: key, name: nm, src }, geometry: { type: 'MultiLineString', coordinates: lines } });
      }
    }
    if (!st.features) fail(`꼬리표 키 '${key}'에 해당하는 선분이 원본에 없음 (이름 ${set.names.join(', ')})`);
    stats.set(key, st);
  }
  const text = '{"type":"FeatureCollection","features":[\n' + features.map((f) => JSON.stringify(f)).join(',\n') + '\n]}\n';
  return { text, stats };
}

// ── README ───────────────────────────────────────────────────
function readme(riversText, stats, keys) {
  const L = [];
  L.push('# 강 기준선 (Natural Earth 파생)');
  L.push('');
  L.push('`rivers.geojson`은 Natural Earth 1:10m 강 v5.1.2(퍼블릭 도메인)에서 뽑은 파생 자료다. 국경 생성기 상수 가운데 강을 따라 그은 선이 실제 강에서 얼마나 떨어졌는지 `npm run test:geo -- --only lines`(`scripts/test-geo/checks/lines.ts`)가 잴 때 기준으로만 쓴다. 지도에는 그리지 않는다.');
  L.push('');
  L.push('- 이 폴더는 `npm run prep:rivers`(`scripts/prep-rivers.mjs`)가 쓴다. 손으로 고치지 않는다. `npm run prep:rivers -- --check`는 파일을 쓰지 않고 지금 꼬리표로 만든 결과가 이 파일과 같은지만 본다.');
  L.push('- 어느 강이 들어가는지는 `scripts/geo/shared.mjs`와 `scripts/geo/areas/*.mjs`의 꼬리표(`// @기준선 강 <키> ...`)가 정한다. 새 강을 재려면 `scripts/prep-rivers.mjs`의 `RIVER_SETS`에 키와 Natural Earth 이름을 더하고 다시 돌린다.');
  L.push('- 현대 강줄기(1:10m, 일반화됨)이므로 오래된 시대에 물길이 바뀐 곳(예: 황허)과는 다르다. 지금은 시대에 상관없이 현대 물길을 쓰는 상수(국경이 현대 강을 따른다고 적힌 선)만 단다.');
  L.push('- 원본에 없는 강(올자강·아이더강·푸위안 물길 등)에는 꼬리표를 달 수 없다.');
  L.push('');
  L.push('## 다시 만들기');
  L.push('');
  L.push('1. `npm run prep:rivers` — 원본 두 파일이 `.cache/natural-earth/v5.1.2/`에 없으면 아래 주소에서 받고(`.cache/`는 git에서 뺀다), 크기와 sha256을 확인한다.');
  L.push('2. 처음부터 두 번 만들어 바이트가 같고 모든 꼬리표 키에 선분이 있어야 쓴다.');
  L.push('');
  L.push('## 원본');
  L.push('');
  L.push('| 파일 | 내용 | 크기 | sha256 |');
  L.push('|---|---|---|---|');
  for (const s of SOURCES) L.push(`| \`${s.file}\` | ${s.ko} | ${fmt(s.bytes)}B | \`${s.sha256}\` |`);
  L.push('');
  L.push(`주소: ${BASE_URL}<파일 이름> (nvkelso/natural-earth-vector, v5.1.2 태그)`);
  L.push('');
  L.push('## 파일');
  L.push('');
  L.push('| 파일 | 크기 | sha256 |');
  L.push('|---|---|---|');
  L.push(`| \`rivers.geojson\` | ${fmt(Buffer.byteLength(riversText))}B | \`${sha256(riversText)}\` |`);
  L.push('');
  L.push('- GeoJSON FeatureCollection, 한 줄에 선 하나. `properties`: `set`(꼬리표 키), `name`(Natural Earth 이름), `src`(`cl` = 세계판, `eu` = 유럽 보충판). geometry는 MultiLineString, 좌표는 [경도, 위도].');
  L.push('- 가공: 같은 이름의 선분을 모아 평면 더글러스-포이커 0.001°(약 100m)로 줄이고 소수 셋째 자리로 반올림했다.');
  L.push('');
  L.push('## 강 표');
  L.push('');
  L.push('| 키 | 강 | Natural Earth 이름 | 선 수 | 점 수(원본 → 가공) | 꼬리표를 단 상수 |');
  L.push('|---|---|---|---|---|---|');
  for (const key of [...keys.keys()].sort()) {
    const st = stats.get(key);
    L.push(`| \`${key}\` | ${RIVER_SETS[key].ko} | ${[...st.names].join(', ')} | ${st.parts} | ${fmt(st.pointsIn)} → ${fmt(st.pointsOut)} | ${[...new Set(keys.get(key))].map((c) => '`' + c + '`').join(', ')} |`);
  }
  L.push('');
  L.push('## 출처 표기');
  L.push('');
  L.push('Natural Earth는 퍼블릭 도메인이라 표기 의무가 없지만 CREDITS.md에 적는다. 같은 선을 재는 OpenStreetMap에서 딴 손그림 선(흑룡강 하류 등)은 OpenStreetMap 기여자의 ODbL 자료에서 왔고, 이 폴더의 파일에는 OpenStreetMap 자료가 들어 있지 않다.');
  return L.join('\n') + '\n';
}

// ── 실행 ─────────────────────────────────────────────────────
const checkOnly = process.argv.includes('--check');
const keys = usedKeys();
if (!keys.size) fail('꼬리표(// @기준선 강 ...)가 하나도 없음');
const sources = [];
for (const s of SOURCES) sources.push({ src: s.src, json: await loadSource(s) });
const first = build(sources, keys);
const second = build(sources, keys);
if (first.text !== second.text) fail('처음부터 두 번 만든 결과의 바이트가 다름');
const target = path.join(OUT_DIR, 'rivers.geojson');
if (checkOnly) {
  const now = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (now !== first.text) { console.error('prep:rivers --check: data/base/rivers/rivers.geojson이 지금 꼬리표로 만든 결과와 다름. npm run prep:rivers로 다시 만들 것'); process.exit(1); }
  console.log(`prep:rivers --check: 같음 (${keys.size}개 키, ${fmt(Buffer.byteLength(first.text))}B)`);
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(target, first.text);
  writeFileSync(path.join(OUT_DIR, 'README.md'), readme(first.text, first.stats, keys));
  console.log(`prep:rivers: ${keys.size}개 키, ${fmt(Buffer.byteLength(first.text))}B → data/base/rivers/rivers.geojson, README.md`);
  for (const key of [...keys.keys()].sort()) { const st = first.stats.get(key); console.log(`  ${key.padEnd(8)} 선 ${st.parts} 점 ${fmt(st.pointsIn)} → ${fmt(st.pointsOut)}`); }
}
