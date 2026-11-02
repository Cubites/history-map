// 나라 찾기 (TOOLS-ANALYSIS 2·3절 4번, 2026-11-02): 한 나라가 어느 파일 몇째 줄에 있는지·영토 버전 해·이웃을 몇 줄로 보인다. 에이전트가 grep·cat으로 큰 파일을 통째로 읽던 일을 줄이려고 만듦.
// 사용: npm run entity:where -- <id> [--year <Y>] [--no-clip]
//   Y는 자료의 해(천문 해: 기원전 N년 = 1−N, 예 기원전 550년 → -549).
// 하는 일 (모두 읽기만 한다):
//  - 항목: data/entities/*.yaml에서 `- id: <id>` 줄과 블록 끝 줄, 이름(ko)·기간·level.
//  - 영토: data/geo/*.geojson에서 entityId가 그 나라인 버전의 파일·줄 번호(생성기는 버전을 한 줄에 하나씩 씀)·해 목록, data/geo/home/<id>.geojson(뒤 권역이 늘린 나라의 원래 모양) 버전 수.
//    --year Y면 그 해에 효력 있는 버전(from ≤ Y < to) 하나만.
//  - 생성기: scripts/geo/ 아래 .mjs·.ts에서 id를 따옴표로 쓴 줄·표의 열쇠(`id:`)로 쓴 줄. `const X = '<id>'`·열쇠 줄은 정의로, 나머지는 쓰임으로 센다(상수 X의 쓰임 줄 수도).
//  - 사건: data/events/*.yaml에서 subjects에 그 id가 든 사건 수와 앞 몇 개 id, links에 나온 수. 관계: data/relations.yaml에서 그 id가 나온 줄.
//  - 이웃: 같은 해에 경계 선분을 함께 쓰는 나라. 판정은 test:geo colors 검사(scripts/test-geo/checks/colors.ts의 findTouchingPairs)를 그대로 쓴다:
//    원도형에서 4자리 반올림 선분을 하나 이상 함께 쓰고, 해안선(50m)으로 자른 도형에서도 함께 쓰는 쌍(바다 위에서만 닿는 쌍은 뺌). 귀속 논쟁 구간 빼기(색 검사 전용)는 하지 않는다.
//    그 나라 버전과 시간·상자가 겹치는 버전만 골라 자르므로 빠르다(자르기는 build:data와 같은 캐시 .cache/build-data를 씀. 캐시가 없으면 처음 한 번 느릴 수 있음).
//    --no-clip: 해안선 자르기를 건너뛰고 원도형만 본다(빠르지만 바다 위에서만 닿는 쌍도 이웃으로 셈).
// 출력: 몇 줄 요약(이웃은 앞 12개). 버전마다 이웃·생성기 줄 전부는 .cache/entity-where/<id>.md.
// 종료 코드: 0 찾음, 1 그런 id가 항목·영토 어디에도 없음, 2 사용법 오류.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, clipGeo, createContext, type ClippedVersion, type Context, type GeoVersion } from './test-geo/context.ts';
import { findTouchingPairs, spansText } from './test-geo/checks/colors.ts';

const USAGE = '사용: npm run entity:where -- <id> [--year <Y(천문 해, 기원전 N년 = 1−N)>] [--no-clip]';
const OUT_DIR = path.join(ROOT, '.cache/entity-where');
const SHOW_NEIGHBORS = 12;

class UsageError extends Error {}

function parseArgs(argv: string[]): { id: string; year: number | null; noClip: boolean } {
  let id: string | null = null;
  let year: number | null = null;
  let noClip = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--year') {
      const v = argv[++i];
      if (v === undefined || !/^-?\d+$/.test(v)) throw new UsageError(`--year 뒤에 정수 해가 필요함\n${USAGE}`);
      year = Number(v);
    } else if (a === '--no-clip') noClip = true;
    else if (a.startsWith('-')) throw new UsageError(`알 수 없는 옵션: ${a}\n${USAGE}`);
    else if (id === null) id = a;
    else throw new UsageError(USAGE);
  }
  if (!id) throw new UsageError(USAGE);
  return { id, year, noClip };
}

const yearText = (y: number) => (y <= 0 ? `기원전 ${1 - y}` : `${y}`);
const rangeText = (from: number, to: number | null) => (to === null ? `${yearText(from)}~현재` : to - 1 === from ? yearText(from) : `${yearText(from)}~${yearText(to - 1)}`);
const rel = (p: string) => path.relative(ROOT, p).replace(/\\/g, '/');
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function walk(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (e.isFile() && ext.test(e.name)) out.push(p);
  }
  return out.sort();
}

// ── 항목 YAML ───────────────────────────────────────────────

interface EntityLine {
  file: string;
  line: number;
  endLine: number;
}
function findEntityLines(id: string): EntityLine[] {
  const dir = path.join(ROOT, 'data/entities');
  const re = new RegExp(`^- id: ['"]?${esc(id)}['"]?\\s*(#.*)?$`);
  const out: EntityLine[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const lines = readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => {
      if (!re.test(l)) return;
      let end = i;
      for (let k = i + 1; k < lines.length && !/^- /.test(lines[k]) && !/^#/.test(lines[k]); k++) if (lines[k].trim()) end = k;
      out.push({ file: `data/entities/${f}`, line: i + 1, endLine: end + 1 });
    });
  }
  return out;
}

// ── 영토 버전 줄 번호 ───────────────────────────────────────

/** 버전마다 파일 안 줄 번호(1부터). 생성기는 `{"type":"Feature"`로 시작하는 줄에 버전 하나씩 쓴다. 꼴이 다르면 null */
const lineCache = new Map<string, number[] | null>();
function featureLine(dir: string, file: string, index: number): number | null {
  const key = `${dir}/${file}`;
  if (!lineCache.has(key)) {
    const lines = readFileSync(path.join(dir, file), 'utf8').split('\n');
    const at: number[] = [];
    lines.forEach((l, i) => l.startsWith('{"type":"Feature"') && at.push(i + 1));
    lineCache.set(key, at);
  }
  return lineCache.get(key)?.[index] ?? null;
}

function homeVersions(id: string): { file: string; versions: { from: number; to: number | null; line: number | null }[] } | null {
  const dir = path.join(ROOT, 'data/geo/home');
  const file = `${id}.geojson`;
  try {
    const fc = JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as { features: { properties: { from: number; to: number | null } }[] };
    return { file: `data/geo/home/${file}`, versions: fc.features.map((f, i) => ({ from: f.properties.from, to: f.properties.to, line: featureLine(dir, file, i) })) };
  } catch {
    return null;
  }
}

// ── 생성기 ──────────────────────────────────────────────────

interface GenHit {
  file: string;
  line: number;
  text: string;
  def: boolean;
  alias: string | null;
  aliasUses: number;
}
function findGenerator(id: string): GenHit[] {
  const quoted = new RegExp(`(['"\`])${esc(id)}\\1`);
  const key = new RegExp(`(^\\s*|[{,]\\s*)(['"]?)${esc(id)}\\2\\s*:`);
  const constDef = new RegExp(`const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(['"\`])${esc(id)}\\2`);
  const keyDef = new RegExp(`^\\s*(['"]?)${esc(id)}\\1\\s*:`);
  const out: GenHit[] = [];
  for (const f of walk(path.join(ROOT, 'scripts/geo'), /\.(mjs|ts|js)$/)) {
    const lines = readFileSync(f, 'utf8').split(/\r?\n/);
    lines.forEach((l, i) => {
      if (!quoted.test(l) && !key.test(l)) return;
      const m = constDef.exec(l);
      let aliasUses = 0;
      if (m) {
        const use = new RegExp(`(^|[^\\w$.])${esc(m[1])}(?![\\w$])`);
        aliasUses = lines.filter((x, k) => k !== i && use.test(x)).length;
      }
      out.push({ file: rel(f), line: i + 1, text: l.trim(), def: !!m || keyDef.test(l), alias: m ? m[1] : null, aliasUses });
    });
  }
  return out;
}

// ── 이웃 ────────────────────────────────────────────────────

interface Neighbor {
  id: string;
  spans: [number, number][];
}

/** 대상 버전들과 시간·상자가 겹치는 다른 나라 버전을 골라 그것만 자르고, colors 검사의 findTouchingPairs로 맞닿은 나라를 찾는다 */
async function neighborsOf(ctx: Context, id: string, targets: GeoVersion[], years: [number, number] | null, noClip: boolean) {
  const lo = years ? years[0] : -Infinity;
  const hi = years ? years[1] + 1 : Infinity;
  const live = (g: GeoVersion) => g.from < hi && (g.to ?? Infinity) > lo;
  const tv = targets.filter(live);
  const touches = (g: GeoVersion, t: GeoVersion) => g.from < (t.to ?? Infinity) && t.from < (g.to ?? Infinity) && g.box[0] <= t.box[2] && t.box[0] <= g.box[2] && g.box[1] <= t.box[3] && t.box[1] <= g.box[3];
  const cands = ctx.geo.filter((g) => g.entityId !== id && live(g) && tv.some((t) => touches(g, t)));
  const sub = [...tv, ...cands];
  const clipped: ClippedVersion[] = noClip ? sub.map((g) => ({ ...g, clipped: g.coords })) : await clipGeo(sub);
  const clipOf = new Map(sub.map((g, i) => [g, clipped[i]]));

  const run = async (versions: GeoVersion[], ys: [number, number] | null): Promise<Neighbor[]> => {
    const pick = sub.filter((g) => versions.includes(g) || (g.entityId !== id && versions.some((t) => touches(g, t))));
    const subCtx: Context = { ...ctx, geo: pick, clipped: async () => pick.map((g) => clipOf.get(g)!) };
    const pairs = await findTouchingPairs(subCtx, new Map(), ys);
    return pairs
      .filter((p) => p.a === id || p.b === id)
      .map((p) => ({ id: p.a === id ? p.b : p.a, spans: p.spans }))
      .sort((x, y) => x.spans[0][0] - y.spans[0][0] || x.id.localeCompare(y.id));
  };
  const all = await run(tv, years);
  // 버전마다(파일에만 씀)
  const perVersion: { v: GeoVersion; n: Neighbor[] }[] = [];
  for (const v of tv) {
    const vy: [number, number] = [Math.max(v.from, lo), Math.min(v.to ?? 9999, hi) - 1];
    perVersion.push({ v, n: await run([v], vy) });
  }
  return { all, perVersion, candidates: cands.length };
}

// ── 본문 ────────────────────────────────────────────────────

async function main(argv: string[]): Promise<number> {
  const t0 = Date.now();
  const { id, year, noClip } = parseArgs(argv);
  const ctx = createContext({ region: null, years: null, only: null, skip: [], ci: false });
  const info = ctx.entities.get(id);
  const entLines = findEntityLines(id);
  const versions = ctx.geo.filter((g) => g.entityId === id);
  if (!info && !entLines.length && !versions.length) {
    const near = [...ctx.entities.keys()].filter((k) => k.includes(id) || id.includes(k)).slice(0, 8);
    console.log(`없음: '${id}'는 항목 YAML·data/geo 어디에도 없음${near.length ? ` (비슷한 id: ${near.join(', ')})` : ''}`);
    return 1;
  }
  const out: string[] = [];
  const file: string[] = [`# entity:where ${id}${year !== null ? ` --year ${year}` : ''} (${new Date().toISOString()})`, ''];
  const say = (s: string) => {
    out.push(s);
    file.push(s);
  };

  // 항목
  const head = info ? `${info.ko}(${id}) ${yearText(info.from)}~${info.to === null ? '현재' : yearText(info.to)} · level ${info.level || '-'}` : `${id} (항목 YAML 없음)`;
  say(`항목: ${head}${entLines.length ? ' — ' + entLines.map((e) => `${e.file}:${e.line}~${e.endLine}`).join(', ') : ''}`);

  // 영토
  const lineOf = (g: GeoVersion) => featureLine(path.join(ROOT, 'data/geo'), g.file, g.index);
  const shown = year === null ? versions : versions.filter((g) => g.from <= year && (g.to === null || g.to > year));
  const files = [...new Set(versions.map((g) => `data/geo/${g.file}`))];
  if (!versions.length) say('영토: data/geo에 버전 없음');
  else if (year !== null) {
    say(`영토: ${files.join(', ')} 버전 ${versions.length}개 중 ${yearText(year)}년 효력 ${shown.length}개` + (shown.length ? ' — ' + shown.map((g) => `${rangeText(g.from, g.to)} [${g.certainty}] 줄 ${lineOf(g) ?? '?'}`).join(', ') : ''));
  } else {
    const lines = versions.map(lineOf).filter((n): n is number => n !== null);
    say(`영토: ${files.join(', ')} 버전 ${versions.length}개 (줄 ${lines.length ? `${Math.min(...lines)}~${Math.max(...lines)}` : '?'}), ${rangeText(versions[0].from, versions[versions.length - 1].to)}`);
    const starts = versions.map((g) => yearText(g.from));
    say(`  버전 시작 해: ${starts.length > 30 ? starts.slice(0, 30).join(', ') + ` … 외 ${starts.length - 30}개` : starts.join(', ')}`);
  }
  file.push('', '## 영토 버전', ...versions.map((g) => `- ${rangeText(g.from, g.to)} [${g.certainty}] ${g.where} 줄 ${lineOf(g) ?? '?'}`));
  const home = homeVersions(id);
  if (home) {
    say(`  원래 권역 모양: ${home.file} 버전 ${home.versions.length}개`);
    file.push('', '## 원래 권역 모양(home)', ...home.versions.map((v) => `- ${rangeText(v.from, v.to)} 줄 ${v.line ?? '?'}`));
  }

  // 생성기
  const gen = findGenerator(id);
  const defs = gen.filter((g) => g.def);
  const genFiles = new Set(gen.map((g) => g.file));
  const aliasUses = defs.reduce((s, d) => s + d.aliasUses, 0);
  say(`생성기: 정의 ${defs.length}줄 · id를 직접 쓴 줄 ${gen.length - defs.length}${aliasUses ? ` · 상수로 쓴 줄 ${aliasUses}` : ''} (파일 ${genFiles.size}개)`);
  const cut = (s: string) => (s.length > 110 ? s.slice(0, 110) + '…' : s);
  for (const d of (defs.length ? defs : gen).slice(0, 5)) say(`  ${d.file}:${d.line} ${cut(d.text)}${d.alias ? ` (${d.alias} 쓰임 ${d.aliasUses}줄)` : ''}`);
  if ((defs.length || gen.length) > 5) say(`  … 외 ${(defs.length || gen.length) - 5}줄`);
  file.push('', '## 생성기 줄', ...gen.map((g) => `- ${g.def ? '[정의] ' : ''}${g.file}:${g.line} ${g.text}${g.alias ? ` (${g.alias} 쓰임 ${g.aliasUses}줄)` : ''}`));

  // 사건·관계
  const subj = ctx.events.filter((e) => e.subjects.includes(id));
  const inYear = year === null ? subj : subj.filter((e) => e.year <= year && (e.endYear ?? e.year) >= year);
  const linkN = ctx.events.filter((e) => e.links.some((l) => l.from === id || l.to === id)).length;
  const evFiles = [...new Set(subj.map((e) => e.file))];
  say(
    `사건: subjects ${subj.length}개${year !== null ? `(그 해 ${inYear.length}개)` : ''} · links ${linkN}개${evFiles.length ? ` — ${evFiles.join(', ')}` : ''}` +
      (inYear.length ? `\n  ${inYear.slice(0, 6).map((e) => `${e.id}(${yearText(e.year)})`).join(', ')}${inYear.length > 6 ? ` … 외 ${inYear.length - 6}개` : ''}` : ''),
  );
  file.push('', '## 사건 (subjects)', ...subj.map((e) => `- ${e.id} ${yearText(e.year)} ${e.title} (${e.file})`));
  const relLines = readFileSync(path.join(ROOT, 'data/relations.yaml'), 'utf8')
    .split(/\r?\n/)
    .map((l, i) => ({ l, n: i + 1 }))
    .filter(({ l }) => !l.trimStart().startsWith('#') && new RegExp(`(subject|object):\\s*['"]?${esc(id)}['"]?\\s*[,}]`).test(l));
  say(`관계: data/relations.yaml ${relLines.length}줄${relLines.length ? ` (줄 ${relLines.slice(0, 8).map((r) => r.n).join(', ')}${relLines.length > 8 ? ' …' : ''})` : ''}`);

  // 이웃
  if (versions.length && shown.length) {
    const years: [number, number] | null = year === null ? null : [year, year];
    const nb = await neighborsOf(ctx, id, versions, years, noClip);
    const names = (n: Neighbor) => `${ctx.entities.get(n.id)?.ko ?? n.id}(${n.id})`;
    const how = noClip ? ', 해안선 자르기 건너뜀' : '';
    if (year !== null) {
      say(`이웃(${yearText(year)}년${how}): ${nb.all.length}개${nb.all.length ? ' — ' + nb.all.slice(0, SHOW_NEIGHBORS).map(names).join(', ') : ''}${nb.all.length > SHOW_NEIGHBORS ? ` … 외 ${nb.all.length - SHOW_NEIGHBORS}개` : ''}`);
    } else {
      say(`이웃(버전 전체${how}): ${nb.all.length}개, 맞닿은 해 앞 구간 순`);
      for (const n of nb.all.slice(0, SHOW_NEIGHBORS)) say(`  ${names(n)} ${spansText(n.spans)}`);
      if (nb.all.length > SHOW_NEIGHBORS) say(`  … 외 ${nb.all.length - SHOW_NEIGHBORS}개 (버전마다 이웃은 파일)`);
    }
    file.push('', '## 이웃 (나라별, 맞닿은 해)', ...nb.all.map((n) => `- ${names(n)} ${spansText(n.spans)}`));
    file.push('', '## 버전마다 이웃', ...nb.perVersion.map(({ v, n }) => `- ${rangeText(v.from, v.to)} 줄 ${lineOf(v) ?? '?'}: ${n.map((x) => x.id).join(', ') || '(없음)'}`));
  } else if (versions.length) say(`이웃: ${yearText(year!)}년에 효력 있는 버전이 없음`);

  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${id}${year !== null ? `-${year}` : ''}.md`);
  writeFileSync(outFile, file.join('\n') + '\n', 'utf8');
  out.push(`자세히: ${rel(outFile)} (${((Date.now() - t0) / 1000).toFixed(1)}초)`);
  console.log(out.join('\n'));
  return 0;
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (e) {
  if (e instanceof UsageError) {
    console.error(e.message);
    process.exitCode = 2;
  } else throw e;
}
