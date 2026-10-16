// 제2차 세계 대전 유럽·북아프리카 전역 만들기: spec.mjs(글·화살표·전선 경유점) → 점령 지역 GeoJSON + 전쟁 YAML
// 사용: npm run gen:wars -- --only europe  (저장소 경로·--out은 engine.mjs가 명령줄에서 읽는다)
// 저장소의 data/wars/eu-02-world-war-2.yaml(머리와 europe 전역)과 data/wars/ww2-europe/를 다시 쓴다.
// 이 YAML 끝에 다른 전역(아시아·태평양, 세계 개관)이 붙어 있으면 그 부분은 그대로 두고 유럽 전역 부분만 다시 쓴다(ww2-europe 폴더는 지우고 다시 만듦)
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { G, WARS, pt, pts, pushArrowsHolds, q, resetDir, terr, writeGeojson } from '../../engine.mjs';
import { HEAD, THEATER, SNAPSHOTS, BATTLES } from './spec.mjs';
import './spec41.mjs';
import './spec44.mjs';
SNAPSHOTS.sort((a, b) => (a.date < b.date ? -1 : 1));
BATTLES.sort((a, b) => (a.date < b.date ? -1 : 1));

const OUTDIR = path.join(WARS, 'ww2-europe');
resetDir(OUTDIR);

let y = [];
y.push(...HEAD.comment.map((c) => `# ${c}`), '');
y.push(`id: ${HEAD.id}`, `name: ${HEAD.name}`, 'factions:');
for (const f of HEAD.factions) y.push(`  - { id: ${f.id}, name: ${q(f.name)}, entity: ${f.entity}${f.color ? `, color: "${f.color}"` : ''} }`);
y.push(...HEAD.participantsComment.map((c) => `# ${c}`), 'participants:');
for (const p of HEAD.participants) {
  if (p.comment) y.push(`  # ${p.comment}`);
  y.push(`  - { entity: ${p.entity}, faction: ${p.faction}${p.from ? `, from: ${p.from}` : ''}${p.to ? `, to: ${p.to}` : ''} }`);
}
y.push(`sources: [${HEAD.sources.map((s) => JSON.stringify(s)).join(', ')}]`, '', 'theaters:');
const T = THEATER;
y.push(`  - id: ${T.id}`, `    name: ${T.name}`);
for (const c of T.replacesComment) y.push(`    # ${c}`);
y.push(`    replaces: [${T.replaces.join(', ')}]`);
y.push(`    # ${T.markerComment}`, `    marker: ${pt(T.marker)}`, `    bounds: [${pt(T.bounds[0])}, ${pt(T.bounds[1])}]`);
if (BATTLES.length) y.push('    battles:');
for (const b of BATTLES) y.push(`      - { name: ${q(b.name)}, at: ${pt(b.at)}, date: ${b.date}${b.winner ? `, winner: ${b.winner}` : ''}, summary: ${JSON.stringify(b.summary)} }`);
y.push('    snapshots:');

for (const s of SNAPSHOTS) {
  const year = Number(s.date.slice(0, 4));
  y.push(`      - date: ${s.date}`, `        title: ${q(s.title)}`, `        summary: ${JSON.stringify(s.summary)}`);
  if (s.comment) for (const c of s.comment) y.push(`        # ${c}`);
  y.push('        areas:');
  // 지역 쌓기는 여기서 (해안선으로 자르기 전의) 나라 영토와 손으로 그린 다각형으로 한다: 뒤에 적은 지역이 앞의 지역을 덮는다.
  // 그 결과를 진영마다 한 덩어리(서로 겹치지 않음)로 합쳐 geojson 하나씩 쓴다. 빌드는 이 덩어리들을 해안선으로 자르기만 한다.
  // (처음에는 나라 영토 entities 위에 덮는 geojson을 여러 겹 쌓았으나, 겹이 많으면 빌드의 도형 계산(polyclip-ts)이
  //  해안·경계의 가는 조각에서 깨져(2026-10-12 시험: 1944-08 이후 스냅샷) 진영별 한 덩어리로 바꿨다)
  const RAW = (id) => {
    try {
      return terr(id, year);
    } catch {
      return [];
    }
  };
  let rl = [];
  const parts = new Map();
  for (const a of s.areas) {
    const coords = a.entities ? G.union(...a.entities.map(RAW).filter((c) => c.length)) : a.geo(year);
    if (!coords.length) continue;
    rl = rl.map((l) => ({ ...l, coords: G.difference(l.coords, coords) }));
    rl.push({ faction: a.faction, coords });
    parts.set(a.faction, [...(parts.get(a.faction) ?? []), a.entities ? `나라 영토 ${a.entities.join(', ')}` : a.note]);
  }
  for (const f of HEAD.factions) {
    const mine = rl.filter((l) => l.faction === f.id && l.coords.length);
    if (!mine.length) continue;
    const coords = G.roundCoords(G.union(...mine.map((l) => l.coords)), 4).filter((p) => G.areaKm2([p]) > 0.01);
    const file = `${s.date}-${f.id}.geojson`;
    writeGeojson(path.join(OUTDIR, file), coords, { note: `${s.date} ${f.name} 지역` }, 4);
    y.push(`          # ${f.name}: ${parts.get(f.id).join(' + ')}`);
    y.push(`          - { faction: ${f.id}, geojson: ww2-europe/${file} }`);
  }
  if (s.lines?.length) {
    y.push('        lines:');
    for (const l of s.lines) y.push(`          - ${pts(l)}`);
  }
  pushArrowsHolds(y, s.arrows, s.holds);
  y.push('');
}
// 이 파일 끝에 다른 전역(아시아·태평양, 세계 개관)이 붙어 있으면 그대로 다시 붙인다
const file = path.join(WARS, 'eu-02-world-war-2.yaml');
let tail = '';
try {
  const old = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const k = old.search(/\n  - id: (?!europe\b)[a-z0-9-]+\n/);
  if (k >= 0) {
    // 전역 바로 앞에 붙은 주석 줄(예: asia-pacific 머리 주석)도 뒤 전역에 딸린 것으로 보고 함께 남긴다
    const head = old.slice(0, k + 1).split('\n'); // 마지막 원소는 빈 문자열
    let n = head.length - 1;
    while (n > 0 && /^ {2}#/.test(head[n - 1])) n--;
    tail = old.slice(head.slice(0, n).join('\n').length + (n > 0 ? 1 : 0));
  }
} catch {}
writeFileSync(file, y.join('\n').replace(/\n+$/, '\n') + (tail ? '\n' + tail : ''));
if (tail) console.log('뒤에 붙어 있던 전역을 다시 붙임');
console.log('ok', SNAPSHOTS.length);
