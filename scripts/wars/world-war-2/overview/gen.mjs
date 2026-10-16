// 제2차 세계 대전 '세계 개관' 전역(overview) 만들기 (작업 A 단계 2)
//   사용: npm run gen:wars -- --only overview   (두 번 돌려도 바이트까지 같은 결과, 이미 overview가 있으면 바꿔 끼운다. 앞서 europe·asia-pacific 생성기가 돌아 있어야 한다)
//   하는 일: data/wars/eu-02-world-war-2.yaml의 theaters: 끝에 셋째 전역 overview를 붙이고, 장면·진영마다 한 덩어리 geojson을
//            data/wars/world-war-2/overview/<개관날짜>-<진영>.geojson 으로 쓴다. 기존 두 전역(europe, asia-pacific)과 그 geojson은 읽기만 한다.
//   재료: 유럽 전역 장면은 이음매 서쪽, 아시아·태평양 전역 장면은 이음매 동쪽만 (geom.mjs). 1939-09-01만 영국·프랑스 식민지 바탕 추가 (colonies39.mjs).
//   글·화살표·전투·표시는 spec.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { G, WARS, geojsonText, parseYaml, pt, pts, pushArrowsHolds, q, resetDir } from '../../engine.mjs';
import { overviewScene, FACTIONS, SEAM_X } from './geom.mjs';
import { SCENES, BOUNDS, SIMPLIFY_KM, BATTLE_NAMES } from './spec.mjs';

const FILE = path.join(WARS, 'eu-02-world-war-2.yaml');
const OUTDIR = path.join(WARS, 'world-war-2/overview');
const MARK = '  # ── 세계 개관 (overview) ──';
const raw = readFileSync(FILE, 'utf8');
const crlf = raw.includes('\r\n');
let text = raw.replace(/\r\n/g, '\n');

// 이미 있는 overview 전역(마커부터 끝까지)을 걷어 내고 기존 두 전역만 남긴다
const k = text.indexOf('\n' + MARK);
if (k >= 0) text = text.slice(0, k + 1);
text = text.replace(/\n+$/, '\n');
const doc = parseYaml(text);
const byId = (id) => doc.theaters.find((t) => t.id === id);
const eu = byId('europe'), as = byId('asia-pacific');
if (!eu || !as || doc.theaters.some((t) => t.id === 'overview')) throw new Error('기존 전역 구성이 예상과 다름');
const snap = (t, date) => {
  const s = t.snapshots.find((x) => x.date === date);
  if (!s) throw new Error(`스냅샷 없음: ${t.id} ${date}`);
  return s;
};

const FNAME = Object.fromEntries(doc.factions.map((f) => [f.id, f.name]));

// replaces: 두 전역의 합집합 (유럽 먼저, 아시아에서 새로 나온 것을 뒤에)
const replaces = [...eu.replaces];
// 아메리카는 칠하지 않으므로 미국(1867년판 usa의 쓰임은 이음매 서쪽 아메리카뿐)은 빼서 평소 영토로 보이게 한다
for (const id of as.replaces) if (!replaces.includes(id) && id !== 'usa') replaces.push(id);

// 전투: 두 전역의 기존 줄을 그대로 옮긴다
const lines = text.split('\n');
const battleLine = (name) => {
  const hits = lines.filter((l) => l.startsWith(`      - { name: ${name},`) || l.startsWith(`      - { name: "${name}",`));
  if (hits.length !== 1) throw new Error(`전투 줄을 못 찾음/여럿: ${name} (${hits.length})`);
  return hits[0];
};
const battleDate = (l) => l.match(/date: (\d{4}-\d\d-\d\d)/)[1];
const battles = BATTLE_NAMES.map(battleLine).sort((a, b) => (battleDate(a) < battleDate(b) ? -1 : battleDate(a) > battleDate(b) ? 1 : 0));

resetDir(OUTDIR);

const y = [];
y.push(MARK);
y.push('  # 두 전역(유럽·북아프리카, 아시아·태평양)의 장면을 한 화면에 합친 거친 개관. 세밀한 전선은 앞의 두 전역에서 본다. 평소 지도에 전쟁 표시는 띄우지 않는다(hideMarker).');
y.push(`  # 장면마다 유럽 전역 장면은 이란 동쪽 국경(Natural Earth)에서 동경 ${SEAM_X}도 선을 따라 북극해까지 그은 이음매의 서쪽, 아시아·태평양 전역 장면은 그 동쪽만 가져와`);
y.push('  # 진영마다 한 덩어리(서로 겹치지 않음) geojson world-war-2/overview/<날짜>-<진영>.geojson 으로 만들었다(나라 영토 위에 geojson을 여러 겹 덮으면 빌드의 polyclip이 깨져서). 빌드가 해안선으로 자른다.');
y.push('  # 사하라 이남 아프리카·아메리카는 칠하지 않는다(두 전역 밖). 1939-09-01 장면은 아시아·태평양 전역에 없는 영국·프랑스 식민지와 영연방 자치령(영국령 인도·버마·실론·말라야·싱가포르·북보르네오·홍콩,');
y.push('  # 오스트레일리아·뉴질랜드 등, 프랑스령 인도차이나)을 연합국 색으로 더했다. 네덜란드·미국·포르투갈령은 아직 참전 전이라 칠하지 않는다.');
y.push('  # 다시 만드는 법: npm run gen:wars (생성 스크립트는 저장소의 scripts/wars/world-war-2/overview/, 이 전역만 다시 만들려면 npm run gen:wars -- --only overview)');
y.push('  - id: overview', '    name: 세계 개관', '    hideMarker: true', `    simplify: ${SIMPLIFY_KM}`);
y.push(`    replaces: [${replaces.join(', ')}]`);
y.push(`    bounds: [${pt(BOUNDS[0])}, ${pt(BOUNDS[1])}]`);
y.push('    battles:', ...battles);
y.push('    snapshots:');

const report = [];
const seen = new Set();
for (const sc of SCENES) {
  const se = snap(eu, sc.eu), sa = snap(as, sc.as);
  const t0 = Date.now();
  const { out } = overviewScene({ eu: se.areas, euYear: +sc.eu.slice(0, 4), as: sa.areas, asYear: sc.asYear ?? +sc.as.slice(0, 4), colonies: !!sc.colonies, revert: sc.revert }, BOUNDS);
  y.push(`      - date: ${sc.date}`, `        title: ${q(sc.title)}`, `        summary: ${JSON.stringify(sc.summary)}`);
  y.push(`        # 출처 장면: 유럽·북아프리카 ${sc.eu}(이음매 서쪽) + 아시아·태평양 ${sc.as}(동쪽)${sc.colonies ? ` + 영국·프랑스 식민지 바탕(영토는 ${sc.asYear}년 기준, 난닝 일대·산시 남부는 중국으로 되돌림)` : ''}`);
  y.push('        areas:');
  for (const f of FACTIONS) {
    const coords = out.get(f);
    if (!coords) continue;
    const file = `${sc.date}-${f}.geojson`;
    const body = geojsonText(coords, { note: `${sc.date} ${FNAME[f]} 지역 (세계 개관)` });
    writeFileSync(path.join(OUTDIR, file), body);
    if (seen.has(file)) throw new Error('중복 파일 ' + file);
    seen.add(file);
    y.push(`          - { faction: ${f}, geojson: world-war-2/overview/${file} }`);
    report.push({ date: sc.date, f, pieces: coords.length, km2: Math.round(G.areaKm2(coords)), kb: +(Buffer.byteLength(body) / 1024).toFixed(1) });
  }
  pushArrowsHolds(y, sc.arrows, sc.holds);
  y.push('');
  console.error(`${sc.date} ${((Date.now() - t0) / 1000).toFixed(1)}초`);
}

let out = text.replace(/\n+$/, '\n') + '\n' + y.join('\n').replace(/\n+$/, '\n');
if (crlf) out = out.replace(/\n/g, '\r\n');
writeFileSync(FILE, out);
const total = report.reduce((s, r) => s + r.kb, 0);
for (const r of report) console.log(`${r.date} ${r.f.padEnd(7)} 조각 ${String(r.pieces).padStart(3)}  ${String(r.km2).padStart(10)}km²(바다 포함)  ${r.kb}KB`);
console.log(`geojson ${report.length}개 합계 ${total.toFixed(0)}KB`);
