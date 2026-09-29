// 국경 생성기 엔진 (DESIGN.md §5.2): 모든 권역을 합친 뒤 도는 단계. 권역 합치기(검사 포함) → 빈 땅 채우기 → 지우기 전 대조 → 틈새 구멍 메우기 → data/geo 쓰기.
// 가져와도 되는 것: node 내장 모듈과 lib.mjs. 권역 파일은 가져오지 않는다(진입 파일이 AREAS로 넘겨줌).
// 영토는 기간마다 서로 배타라고 본다: 빈 땅 채우기는 구역에서 다른 모든 나라를 빼고, 틈새 구멍 메우기는 다른 나라가 든 구멍을 남긴다
// (빌드의 겹침 검사도 모든 영토 쌍을 본다). 그래서 나라와 겹치는 지역 폴리곤(DESIGN.md §7의 행정구역)은 같은 기간의 나라 폴리곤과 함께 쓸 수 없다.
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { D, U, polyclip } from './lib.mjs';

// 좌표는 소수 넷째 자리로 반올림하고, 조각이 하나면 Polygon, 여럿이면 MultiPolygon으로 쓴다
const round = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
function geometry(multi) {
  return round(multi.length === 1 ? { type: 'Polygon', coordinates: multi[0] } : { type: 'MultiPolygon', coordinates: multi });
}

// 권역 파일이 source를 내보내지 않을 때 쓰는 기본 출처 문구 (지금 권역은 모두 이 문구를 쓴다)
const ESTIMATED = '중고등학교 한국사 교과서 시대별 지도의 일반적인 경계를 따른 대략적인 추정. 운영자 검수 필요';

// 권역 파일이 내보내는 약속된 이름. fill·version·source로 시작하는 다른 이름(대소문자 무시)은 이 셋의 오타로 보고 멈춘다
const AREA_EXPORTS = new Set(['versions', 'fillSpecs', 'source']);

// 권역 파일들의 versions·fillSpecs·source를 AREAS 순서대로 합친다. 아래 경우에는 data/geo를 지우기 전에 멈춘다.
// - 권역이 versions를 내보내지 않거나, 약속된 이름과 헷갈리는 이름(fillSpec, version, sources 등)을 내보냄
// - fillSpecs가 배열이 아니거나 spec 모양이 틀림, source가 비어 있지 않은 문자열이 아님
// - 같은 나라 id가 두 권역에 있음 (나라 id가 곧 data/geo 파일 이름)
// - 채우기 spec의 id가 다른 권역의 나라이거나, 같은 새 id를 두 권역이 채움
// - areaDir(권역 파일 폴더)에 AREAS 목록에 없는 권역 파일이나, 등록된 권역 이름이 아닌 하위 폴더가 있음
//   (areas/ 바로 아래에는 권역 파일만 둔다. 한 권역만 쓰는 도우미 모듈은 areas/<권역>/에, 두 권역 이상이 쓰는 것은 shared.mjs에 둔다)
// sources(나라 id → 출처 문구)에는 source를 내보낸 권역의 나라와, 그 권역의 채우기가 새로 만드는 나라만 들어간다. 나머지는 writeGeo가 ESTIMATED를 쓴다
export function mergeAreas(areas, areaDir) {
  const versions = {};
  const fillSpecs = [];
  const sources = {};
  const owner = {};
  const filler = {};
  for (const [name, area] of areas) {
    if (!area.versions || typeof area.versions !== 'object') throw new Error(`권역 ${name}이 versions를 내보내지 않음`);
    for (const key of Object.keys(area)) {
      if (/^(fill|version|source)/i.test(key) && !AREA_EXPORTS.has(key)) throw new Error(`권역 ${name}의 export '${key}': versions·fillSpecs·source의 오타가 아닌지 확인`);
    }
    if (area.fillSpecs !== undefined && !Array.isArray(area.fillSpecs)) throw new Error(`권역 ${name}의 fillSpecs가 배열이 아님`);
    if (area.source !== undefined && (typeof area.source !== 'string' || !area.source.trim())) throw new Error(`권역 ${name}의 source가 비어 있지 않은 문자열이 아님`);
    for (const [id, list] of Object.entries(area.versions)) {
      if (Object.hasOwn(owner, id)) throw new Error(`나라 id '${id}'가 ${owner[id]}와 ${name} 두 곳에 있음`);
      owner[id] = name;
      versions[id] = list;
      if (area.source !== undefined) sources[id] = area.source;
    }
  }
  for (const [name, area] of areas) {
    for (const sp of area.fillSpecs ?? []) {
      // 끝 없음은 3000으로 적는다(fillEmptyLand가 마지막에 null로 바꿈)
      if (typeof sp?.id !== 'string' || !sp.id || !Array.isArray(sp.zone) || !Number.isInteger(sp.from) || !Number.isInteger(sp.to) || !(sp.from < sp.to && sp.to <= 3000)) {
        throw new Error(`권역 ${name}의 채우기 spec ${JSON.stringify(sp?.id)}: id는 문자열, zone은 멀티폴리곤, from·to는 from < to ≤ 3000인 정수여야 함 (끝 없음은 3000)`);
      }
      if (Object.hasOwn(owner, sp.id) && owner[sp.id] !== name) throw new Error(`권역 ${name}의 채우기 spec '${sp.id}'는 ${owner[sp.id]} 권역의 나라임`);
      if (Object.hasOwn(filler, sp.id) && filler[sp.id] !== name) throw new Error(`채우기 id '${sp.id}'를 ${filler[sp.id]}와 ${name} 두 권역이 채움`);
      filler[sp.id] = name;
      if (!Object.hasOwn(owner, sp.id) && area.source !== undefined) sources[sp.id] = area.source;
      fillSpecs.push(sp);
    }
  }
  if (areaDir) {
    const listed = new Set(areas.map(([name]) => name));
    const entries = readdirSync(areaDir, { withFileTypes: true });
    const strayDirs = entries.filter((e) => e.isDirectory() && !listed.has(e.name)).map((e) => e.name + '/');
    if (strayDirs.length) throw new Error(`areas/의 하위 폴더 ${strayDirs.join(', ')}: 등록된 권역 이름이 아님 (하위 폴더에는 같은 이름 권역의 도우미 모듈만 둔다)`);
    const unlisted = entries.filter((e) => e.isFile() && e.name.endsWith('.mjs')).map((e) => e.name.slice(0, -'.mjs'.length)).filter((n) => !listed.has(n));
    if (unlisted.length) throw new Error(`권역 파일 ${unlisted.join(', ')}이(가) AREAS 목록에 없음 (generate-geo.mjs에 등록)`);
  }
  return { versions, fillSpecs, sources };
}

// 빈 땅 채우기 (2026-09-27): 권역 파일의 fillSpecs({ id, zone, from, to })마다, 기간을 나라 영토가 바뀌는 해로 잘라
// 구역(zone)에서 그 기간에 살아 있는 다른 모든 나라의 영토와 앞서 채운 땅을 뺀 나머지를 그 id에 준다.
// versions에 이미 있는 나라는 그 기간 영토에 덧붙이고, 없는 id는 새 나라로 만든다. 끝 없음(to: 3000)은 마지막에 null로 바꾼다.
// specs 순서가 땅 배분을 정한다(앞 spec이 먼저 채움). specs는 AREAS 순서로 이어 붙으므로 새 권역의 specs는 끝에 온다.
// 지금 specs는 inner-asia 권역의 만주·몽골 초원 채우기 28개다(나라 id 20개 가운데 17개는 채우기로만 만들고, eupru·mulgil·malgal은 덧붙임).
// versions는 제자리에서 고친다(새 나라를 더하고, 덧붙인 나라는 새 배열로 바꾼다). 권역 파일의 versions는 끝 없음을 null로 적고 3000을 쓰지 않는다.
export function fillEmptyLand(versions, specs) {
  if (!specs.length) throw new Error('빈 땅 채우기 specs가 0개임 (권역 파일의 fillSpecs가 모이지 않음)');
  const cuts = [...new Set(Object.values(versions).flatMap((list) => list.flatMap(([f, t]) => [f, t ?? 3000])).concat(specs.flatMap((sp) => [sp.from, sp.to])))].sort((a, b) => a - b);
  const alive = (list, a, b) => list.filter(([f, t]) => f < b && a < (t ?? Infinity)).map(([, , m]) => m);
  const area = (m) => m.reduce((sum, poly) => sum + poly.reduce((s2, r, k) => { let a2 = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a2 += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s2 + (k === 0 ? 1 : -1) * Math.abs(a2 / 2); }, 0), 0);
  const fills = [];
  for (const sp of specs) {
    for (let k = 0; k < cuts.length - 1; k++) {
      const [a, b] = [cuts[k], cuts[k + 1]];
      if (a < sp.from || b > sp.to) continue;
      const others = Object.entries(versions).filter(([id]) => id !== sp.id).flatMap(([, list]) => alive(list, a, b));
      const mine = alive(versions[sp.id] ?? [], a, b);
      let gap = sp.zone;
      // 앞서 다른 구역에 준 땅도 뺀다 (구역이 겹치는 곳: 317~337년 요동)
      const earlier = fills.filter((f) => f.a < b && a < f.b).map((f) => f.gap);
      for (const o of [...others, ...mine, ...earlier]) if (gap.length) gap = D(gap, o);
      gap = gap.filter((poly) => area([poly]) > 0.02); // 0.02제곱도(약 200km²) 미만 조각은 버린다
      if (gap.length) fills.push({ id: sp.id, a, b, gap });
    }
  }
  // 이미 있는 나라는 해당 기간의 영토에 덧붙이고, 새 나라는 기간마다 버전을 만든다 (같은 모양이 이어지면 합친다)
  for (const { id, a, b, gap } of fills) {
    const list = versions[id] ?? (versions[id] = []);
    const out = [];
    let covered = false;
    for (const v of list) {
      const [f, t, m, ...rest] = v;
      const T = t ?? Infinity;
      if (T <= a || f >= b) { out.push(v); continue; }
      covered = true;
      if (f < a) out.push([f, a, m, ...rest]);
      out.push([Math.max(f, a), Math.min(T, b), U(m, gap), ...rest]);
      if (T > b) out.push([b, t, m, ...rest]);
    }
    if (!covered) out.push([a, b, gap]);
    out.sort((x, y) => x[0] - y[0]);
    const merged = [];
    for (const v of out) {
      const last = merged[merged.length - 1];
      if (last && last[1] === v[0] && JSON.stringify(last[2]) === JSON.stringify(v[2]) && last[3] === v[3]) last[1] = v[1];
      else merged.push([...v]);
    }
    versions[id] = merged;
  }
  // 끝이 없는(현재까지 이어지는) 나라는 끝 연도를 비운다
  for (const list of Object.values(versions)) for (const v of list) if (v[1] === 3000) v[1] = null;
  console.log(`만주·몽골 빈 땅 채우기: ${fills.length}개 기간`);
}

// data/geo 쓰기: 지우기 전 대조 → 기존 geojson 삭제 → 틈새 구멍 메우기 → 나라마다 <id>.geojson(FeatureCollection 하나, JSON.stringify(fc, null, 1) + 개행).
// sources는 mergeAreas가 만든 나라 id → 출처 문구 표다. 없는 나라는 ESTIMATED를 쓴다
export function writeGeo(project, versions, { prune = false, sources = {} } = {}) {
  const outDir = path.join(project, 'data/geo');
  mkdirSync(outDir, { recursive: true });
  // 지우기 전 대조: 이번에 쓰지 않을 geojson이 이미 있으면 멈춘다 (권역 등록 빠뜨림, 생성기 밖에서 손으로 그린 파일 등).
  // 나라를 일부러 없애거나 id를 바꿀 때만 --prune으로 지운다. --prune은 손으로 그린 파일도 지우므로 그런 파일은 먼저 권역 파일로 옮긴다
  const vanishing = readdirSync(outDir).filter((f) => f.endsWith('.geojson') && !Object.hasOwn(versions, f.slice(0, -'.geojson'.length)));
  if (vanishing.length && !prune) throw new Error(`data/geo에서 사라질 파일 ${vanishing.length}개: ${vanishing.join(', ')}. 나라를 일부러 없앴거나 id를 바꿨으면 --prune을 붙여 다시 실행한다. 생성기 밖에서 그린 파일이면 먼저 권역 파일로 옮긴다(--prune은 그 파일도 지운다)`);
  for (const f of readdirSync(outDir)) if (f.endsWith('.geojson')) rmSync(path.join(outDir, f));
  /**
   * 조각을 합칠 때 경계가 살짝 어긋나 영토 안에 생긴 틈새 구멍을 메운다 (2026-09-27).
   * 그대로 두면 구멍 테두리가 영토 안의 점선으로 보였다 (동예·고구려·청 등).
   * 같은 시기에 다른 나라 영토가 들어 있는 구멍(마한 안의 백제, 금 안의 몽골 등)은 남긴다.
   */
  const all = Object.entries(versions).flatMap(([entityId, list]) => list.map(([from, to, multi]) => ({ entityId, from, to: to ?? Infinity, multi })));
  const overlapsInTime = (a, b) => a.from < b.to && b.from < a.to;
  let filled = 0;
  function fillEmptyHoles(entityId, from, to, multi) {
    const me = { from, to: to ?? Infinity };
    const others = all.filter((o) => o.entityId !== entityId && overlapsInTime(me, o));
    return multi.map(([outer, ...holes]) => [
      outer,
      ...holes.filter((h) => {
        const occupied = others.some((o) => polyclip.intersection([[h]], o.multi).length > 0);
        if (!occupied) filled++;
        return occupied;
      }),
    ]);
  }

  for (const [entityId, list] of Object.entries(versions)) {
    const fc = {
      type: 'FeatureCollection',
      // 네 번째 값으로 확실성을 바꿀 수 있다 (예: 'disputed' — 학설 차이가 큰 고조선 초기). 출처는 권역의 source(없으면 ESTIMATED)
      features: list.map(([from, to, multi, certainty]) => ({
        type: 'Feature',
        properties: { entityId, from, to, certainty: certainty ?? 'estimated', source: Object.hasOwn(sources, entityId) ? sources[entityId] : ESTIMATED },
        geometry: geometry(fillEmptyHoles(entityId, from, to, multi)),
      })),
    };
    writeFileSync(path.join(outDir, `${entityId}.geojson`), JSON.stringify(fc, null, 1) + '\n');
    console.log(entityId, list.map(([f, t, m]) => `${f}-${t}:${m.length}`).join(' '));
  }
  console.log(`빈 틈새 구멍 ${filled}개를 메움`);
}
