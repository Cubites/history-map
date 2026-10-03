// 국경 생성기 엔진 (DESIGN.md §5.2): 모든 권역을 합친 뒤 도는 단계. 권역 합치기(검사 포함) → 빈 땅 채우기 → 지우기 전 대조 → 틈새 구멍 메우기 → data/geo 쓰기.
// 빈 땅 검사(npm run check:gaps)가 쓰는 검사 구역 모으기(collectGapZones)도 여기 둔다.
// 가져와도 되는 것: node 내장 모듈과 lib.mjs. 권역 파일과 권역 목록(area-list.mjs)은 가져오지 않는다(부르는 쪽이 AREAS를 넘겨줌).
// .ts 스크립트가 가져올 때 tsc가 쓰는 타입 선언은 engine.d.mts에 있다(.ts가 쓰는 export만).
// 영토는 기간마다 서로 배타라고 본다: 빈 땅 채우기는 구역에서 다른 모든 나라를 빼고, 틈새 구멍 메우기는 다른 나라가 든 구멍을 남긴다
// (빌드의 겹침 검사도 모든 영토 쌍을 본다). 그래서 나라와 겹치는 지역 폴리곤(DESIGN.md §7의 행정구역)은 같은 기간의 나라 폴리곤과 함께 쓸 수 없다.
import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { D, U, opKey, peekOp, polyclip, runParallel, serveParallel, withOpKey, workerCount } from './lib.mjs';

// 좌표는 소수 넷째 자리로 반올림하고, 조각이 하나면 Polygon, 여럿이면 MultiPolygon으로 쓴다
const round = (g) => JSON.parse(JSON.stringify(g, (_, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
function geometry(multi) {
  return round(multi.length === 1 ? { type: 'Polygon', coordinates: multi[0] } : { type: 'MultiPolygon', coordinates: multi });
}

// 권역 파일이 source를 내보내지 않을 때 쓰는 기본 출처 문구 (지금 권역은 모두 이 문구를 쓴다)
const ESTIMATED = '중고등학교 한국사 교과서 시대별 지도의 일반적인 경계를 따른 대략적인 추정. 운영자 검수 필요';

// 권역 파일이 내보내는 약속된 이름. fill·version·source·gap으로 시작하는 다른 이름(대소문자 무시)은 이 넷의 오타로 보고 멈춘다
const AREA_EXPORTS = new Set(['versions', 'fillSpecs', 'source', 'gapZones']);

// 권역 파일들의 versions·fillSpecs·source를 AREAS 순서대로 합친다. 아래 경우에는 data/geo를 지우기 전에 멈춘다.
// - 권역이 versions를 내보내지 않거나, 약속된 이름과 헷갈리는 이름(fillSpec, version, sources, gapZone 등)을 내보냄
// - fillSpecs가 배열이 아니거나 spec 모양이 틀림, source가 비어 있지 않은 문자열이 아님
// - 같은 나라 id가 두 권역에 있음 (나라 id가 곧 data/geo 파일 이름)
// - 채우기 spec의 id가 다른 권역의 나라이거나, 같은 새 id를 두 권역이 채움
// - 빈 땅 검사 구역(gapZones)의 모양이 틀림 (collectGapZones의 검사. 생성기는 구역을 쓰지 않지만 check:gaps보다 먼저 잡는다)
// - areaDir(권역 파일 폴더)에 AREAS 목록에 없는 권역 파일이나, 등록된 권역 이름이 아닌 하위 폴더가 있음
//   (areas/ 바로 아래에는 권역 파일만 둔다. 한 권역만 쓰는 도우미 모듈은 areas/<권역>/에, 두 권역 이상이 쓰는 것은 앞 권역 파일(export)이나 shared.mjs에 둔다)
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
      if (/^(fill|version|source|gap)/i.test(key) && !AREA_EXPORTS.has(key)) throw new Error(`권역 ${name}의 export '${key}': versions·fillSpecs·source·gapZones의 오타가 아닌지 확인`);
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
  collectGapZones(areas);
  if (areaDir) {
    const listed = new Set(areas.map(([name]) => name));
    const entries = readdirSync(areaDir, { withFileTypes: true });
    const strayDirs = entries.filter((e) => e.isDirectory() && !listed.has(e.name)).map((e) => e.name + '/');
    if (strayDirs.length) throw new Error(`areas/의 하위 폴더 ${strayDirs.join(', ')}: 등록된 권역 이름이 아님 (하위 폴더에는 같은 이름 권역의 도우미 모듈만 둔다)`);
    const unlisted = entries.filter((e) => e.isFile() && e.name.endsWith('.mjs')).map((e) => e.name.slice(0, -'.mjs'.length)).filter((n) => !listed.has(n));
    if (unlisted.length) throw new Error(`권역 파일 ${unlisted.join(', ')}이(가) AREAS 목록에 없음 (scripts/geo/area-list.mjs에 등록)`);
  }
  return { versions, fillSpecs, sources };
}

// 빈 땅 검사 구역 (DESIGN.md §5.4): 권역 파일의 gapZones를 AREAS 순서대로 모은다. npm run check:gaps가 이 순서대로 검사해 출력하고,
// mergeAreas도 불러 모양을 검사한다(틀리면 생성기가 data/geo를 지우기 전에 멈춘다). 새 권역은 AREAS에 등록하고 gapZones만 내보내면 검사에 들어간다.
// 권역 파일의 gapZones: [{ name, zone, minus?, from?, to? }] (없으면 그 권역은 검사 구역이 없다)
// - name: 구역 이름(check:gaps 출력에 그대로 나온다). 비어 있지 않은 문자열이고 모든 권역을 통틀어 겹치지 않는다
// - zone: 멀티폴리곤 (링 하나면 P(링), 폴리곤이면 [폴리곤]). 링은 닫혀 있고 점이 넷 이상이다. check:gaps가 해안선으로 자른다
// - minus: (선택) 앞에 모은 구역 이름의 배열. 검사 범위에서 그 구역(해안선으로 자르고 그 구역의 minus까지 뺀 것)을 뺀다 (예: 만주 상자에서 한반도)
// - from·to: (선택, 2026-10-01) 이 구역을 검사하는 해 [from, to). 정수이고 from < to, 끝 없음은 to를 빼거나 null. 빼면 모든 해를 검사한다.
//   권역의 나라를 아직 채우지 않은 시대에 빈 땅이 대량으로 보고되지 않게, 뼈대를 채우는 시대만 검사할 때 쓴다(예: 유럽은 1789년부터, 마지막 구역은 to 없음)
// 반환: [{ area, name, zone, minus, from, to }] (area는 권역 이름, minus가 없으면 [], from·to가 없으면 null). export 이름 오타(gapZone 등)나 구역의 모르는 속성(minsu 등)이 있으면 멈춘다
const GAP_ZONE_KEYS = new Set(['name', 'zone', 'minus', 'from', 'to']);
const isPoint = (p) => Array.isArray(p) && p.length === 2 && p.every((v) => Number.isFinite(v));
const isClosedRing = (r) => Array.isArray(r) && r.length >= 4 && r.every(isPoint) && r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1];
const isMultiPolygon = (m) => Array.isArray(m) && m.length > 0 && m.every((poly) => Array.isArray(poly) && poly.length > 0 && poly.every(isClosedRing));
export function collectGapZones(areas) {
  const out = [];
  const seen = new Map(); // 구역 이름 → 권역 이름
  for (const [name, area] of areas) {
    // gapZone·GAP_ZONES 같은 오타는 멈춘다 (그냥 건너뛰면 check:gaps가 그 권역의 구역을 조용히 빠뜨린다)
    for (const key of Object.keys(area)) if (/^gap/i.test(key) && key !== 'gapZones') throw new Error(`권역 ${name}의 export '${key}': gapZones의 오타가 아닌지 확인`);
    if (area.gapZones === undefined) continue;
    if (!Array.isArray(area.gapZones)) throw new Error(`권역 ${name}의 gapZones가 배열이 아님`);
    for (const gz of area.gapZones) {
      const label = `권역 ${name}의 빈 땅 검사 구역 ${JSON.stringify(gz?.name)}`;
      if (typeof gz?.name !== 'string' || !gz.name.trim()) throw new Error(`${label}: name은 비어 있지 않은 문자열이어야 함`);
      if (seen.has(gz.name)) throw new Error(`${label}: 같은 이름이 ${seen.get(gz.name)} 권역에도 있음`);
      const unknown = Object.keys(gz).filter((k) => !GAP_ZONE_KEYS.has(k));
      if (unknown.length) throw new Error(`${label}: 모르는 속성 ${unknown.join(', ')} (name·zone·minus·from·to만 쓴다)`);
      if (!isMultiPolygon(gz.zone)) throw new Error(`${label}: zone은 닫힌 링으로 된 멀티폴리곤이어야 함 (링 하나면 P(링), 폴리곤이면 [폴리곤])`);
      const minus = gz.minus ?? [];
      if (!Array.isArray(minus) || minus.some((m) => !seen.has(m)) || new Set(minus).size !== minus.length) {
        throw new Error(`${label}: minus는 앞에 모은 구역 이름의 배열이어야 함 (앞에 모은 구역: ${[...seen.keys()].join(', ') || '없음'})`);
      }
      const from = gz.from ?? null, to = gz.to ?? null;
      if ((from !== null && !Number.isInteger(from)) || (to !== null && !Number.isInteger(to)) || (from !== null && to !== null && from >= to)) {
        throw new Error(`${label}: from·to는 정수이고 from < to여야 함 (끝 없음은 to를 빼거나 null)`);
      }
      seen.set(gz.name, name);
      out.push({ area: name, name: gz.name, zone: gz.zone, minus, from, to });
    }
  }
  return out;
}

// 범위 상자 거르기 (2026-09-30): 채우기와 틈새 구멍 메우기가 먼 나라를 계산에서 빼는 데 쓴다.
// boundsOf(멀티폴리곤) = [서, 남, 동, 북]. 바깥 링만 본다(구멍은 바깥 링 안에 있다). 같은 도형 객체는 한 번만 계산한다(권역 파일의 도형은 여러 버전·기간이 함께 쓴다).
// apart(p, q)는 두 상자가 떨어져 있으면 참이다. 변이나 꼭짓점만 닿으면 떨어진 것으로 보지 않는다(polyclip의 범위 비교와 같다).
const boundsCache = new WeakMap();
function boundsOf(multi) {
  let b = boundsCache.get(multi);
  if (!b) {
    b = [Infinity, Infinity, -Infinity, -Infinity];
    for (const poly of multi) {
      for (const [x, y] of poly[0] ?? []) {
        if (x < b[0]) b[0] = x;
        if (y < b[1]) b[1] = y;
        if (x > b[2]) b[2] = x;
        if (y > b[3]) b[3] = y;
      }
    }
    boundsCache.set(multi, b);
  }
  return b;
}
const apart = (p, q) => p[0] > q[2] || p[2] < q[0] || p[1] > q[3] || p[3] < q[1];

// 빈 땅 채우기 (2026-09-27): 권역 파일의 fillSpecs({ id, zone, from, to })마다, 기간을 나라 영토가 바뀌는 해로 잘라
// 구역(zone)에서 그 기간에 살아 있는 다른 모든 나라의 영토와 앞서 채운 땅을 뺀 나머지를 그 id에 준다.
// versions에 이미 있는 나라는 그 기간 영토에 덧붙이고, 없는 id는 새 나라로 만든다. 끝 없음(to: 3000)은 마지막에 null로 바꾼다.
// specs 순서가 땅 배분을 정한다(앞 spec이 먼저 채움). specs는 AREAS 순서로 이어 붙으므로 새 권역의 specs는 끝에 온다.
// 지금 specs는 inner-asia 권역의 만주·몽골 초원 채우기 28개다(나라 id 20개 가운데 17개는 채우기로만 만들고, eupru·mulgil·malgal은 덧붙임).
// versions는 제자리에서 고친다(새 나라를 더하고, 덧붙인 나라는 새 배열로 바꾼다). 권역 파일의 versions는 끝 없음을 null로 적고 3000을 쓰지 않는다.
// 빼는 나라는 범위 상자로 거른다 (2026-09-30): 구역(zone)의 범위 상자와 떨어진 나라는 빼지 않는다. 그래서 먼 곳에 나라를 더해도 채우기 결과가 그대로이고 시간도 거의 늘지 않는다
// (가짜 나라 100·300개를 유럽에 더한 시험: 채우기 28.6초·113.8초 → 1.7초·2.2초, 결과 바이트 동일).
// 대신 뺄셈이 끝나면 D(gap)으로 한 번 정리한다. polyclip의 차집합은 범위가 떨어진 도형을 버리고 남은 도형만 다시 계산해
// 가까운 꼭짓점을 합치고 일직선 위 점을 빼는데, 거르기 전에는 먼 나라를 뺄 때마다 이 정리가 일어났다. 정리 없이 거르면 바이트가 달라진다
// (시험: mongolia 1946~ 버전에 반올림 뒤 같은 점 (100.0282, 51.3592)이 두 번 남아 1921~ 한 버전이 1921~1946·1946~ 둘로 나뉨, 도형은 같음).
// 끝에 한 번 정리하면 지금 data/geo 118개가 거르기 전과 바이트까지 같다.
// 같은 계산은 한 번만 한다: 구역과 뺄 도형 목록(범위 상자로 거른 뒤, 도형 객체로 구별)이 앞서 계산한 기간과 같으면 그 결과를 그대로 쓴다
// (먼 나라의 연도 경계로만 나뉜 기간). 권역 파일의 도형은 고치지 않고, 앞서 채운 땅(earlier)도 이 표의 결과 객체를 쓰므로 목록이 같으면 결과도 같다.
export function fillEmptyLand(versions, specs) {
  if (!specs.length) throw new Error('빈 땅 채우기 specs가 0개임 (권역 파일의 fillSpecs가 모이지 않음)');
  const cuts = [...new Set(Object.values(versions).flatMap((list) => list.flatMap(([f, t]) => [f, t ?? 3000])).concat(specs.flatMap((sp) => [sp.from, sp.to])))].sort((a, b) => a - b);
  const alive = (list, a, b) => list.filter(([f, t]) => f < b && a < (t ?? Infinity)).map(([, , m]) => m);
  const area = (m) => m.reduce((sum, poly) => sum + poly.reduce((s2, r, k) => { let a2 = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a2 += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s2 + (k === 0 ? 1 : -1) * Math.abs(a2 / 2); }, 0), 0);
  // 계산한 결과: 구역과 뺄 도형 목록(도형 객체마다 붙인 일련번호) → 남은 땅
  const serials = new WeakMap();
  let lastSerial = 0;
  const serialOf = (m) => { let n = serials.get(m); if (n === undefined) serials.set(m, (n = ++lastSerial)); return n; };
  const done = new Map();
  const fills = [];
  for (const sp of specs) {
    for (let k = 0; k < cuts.length - 1; k++) {
      const [a, b] = [cuts[k], cuts[k + 1]];
      if (a < sp.from || b > sp.to) continue;
      const others = Object.entries(versions).filter(([id]) => id !== sp.id).flatMap(([, list]) => alive(list, a, b));
      const mine = alive(versions[sp.id] ?? [], a, b);
      // 앞서 다른 구역에 준 땅도 뺀다 (구역이 겹치는 곳: 317~337년 요동)
      const earlier = fills.filter((f) => f.a < b && a < f.b).map((f) => f.gap);
      const zoneBox = boundsOf(sp.zone);
      const subtract = [...others, ...mine, ...earlier].filter((o) => !apart(zoneBox, boundsOf(o)));
      const key = [sp.zone, ...subtract].map(serialOf).join(' ');
      let gap = done.get(key);
      if (!gap) {
        gap = sp.zone;
        for (const o of subtract) if (gap.length) gap = D(gap, o);
        if (gap.length) gap = D(gap); // 정리 (위 설명)
        gap = gap.filter((poly) => area([poly]) > 0.02); // 0.02제곱도(약 200km²) 미만 조각은 버린다
        done.set(key, gap);
      }
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

/**
 * 틈새 구멍 메우기: 조각을 합칠 때 경계가 살짝 어긋나 영토 안에 생긴 틈새 구멍을 메운다 (2026-09-27).
 * 그대로 두면 구멍 테두리가 영토 안의 점선으로 보였다 (동예·고구려·청 등).
 * 같은 시기에 다른 나라 영토가 들어 있는 구멍(마한 안의 백제, 금 안의 몽골 등)은 남긴다.
 * 구멍의 범위 상자와 떨어진 나라는 교집합을 구하지 않는다 (2026-09-30, 교집합이 비는 것이 확실하므로 결과는 같다. 나라가 늘어도 느려지지 않게).
 * holeOwners(versions): 모든 영토 버전 [{ entityId, from, to(끝 없음은 Infinity), multi, box }]
 * keepHoles: 버전 하나의 구멍 가운데 그 기간 다른 나라가 든 구멍(occupied(구멍 링, 다른 버전)이 참)만 남긴 멀티폴리곤. 메운 구멍마다 onFilled()
 */
const holeOwners = (versions) => Object.entries(versions).flatMap(([entityId, list]) => list.map(([from, to, multi]) => ({ entityId, from, to: to ?? Infinity, multi, box: boundsOf(multi) })));
const overlapsInTime = (a, b) => a.from < b.to && b.from < a.to;
function keepHoles(all, entityId, from, to, multi, occupied, onFilled) {
  const me = { from, to: to ?? Infinity };
  const others = all.filter((o) => o.entityId !== entityId && overlapsInTime(me, o));
  return multi.map(([outer, ...holes]) => [
    outer,
    ...holes.filter((h) => {
      const holeBox = boundsOf([[h]]);
      const kept = others.some((o) => !apart(holeBox, o.box) && occupied(h, o));
      if (!kept) onFilled();
      return kept;
    }),
  ]);
}
/**
 * 구멍 판정 병렬 미리 계산 (2026-10-03): 구멍 판정의 교집합은 큰 나라(러시아·오스만 등)를 통째로 계산해 무겁다.
 * 연산 메모(lib.mjs)에 아직 없는 판정이 있는 버전만 골라 worker들(이 파일을 worker로 띄움)이 writeGeo와 같은 순서로 판정해 메모에 넣는다.
 * 그 뒤 writeGeo는 원래대로 판정하며 메모에서 읽으므로 결과가 미리 계산하지 않을 때와 같다.
 * 고르기: 메모만 보고 판정해 보다가(peekOp) 메모에 없는 교집합을 만나면 그 버전을 고른다
 */
function prefetchHoles(all) {
  if (workerCount() === 0) return;
  const targets = [];
  all.forEach((v, i) => {
    if (!v.multi.some((poly) => poly.length > 1)) return;
    let missing = false;
    keepHoles(all, v.entityId, v.from, v.to, v.multi, (h, o) => {
      if (missing) return true;
      const r = peekOp('intersection', [[h]], o.multi);
      if (r === undefined) missing = true;
      return missing || r.length > 0;
    }, () => {});
    if (missing) targets.push(i);
  });
  runParallel(import.meta.url, 'engine-holes', { all: all.map((o) => ({ ...o, key: opKey(o.multi) })), targets }, targets.length);
}
serveParallel('engine-holes', (data, i) => {
  if (!data.keyed) {
    for (const o of data.all) withOpKey(o.multi, o.key);
    data.keyed = true;
  }
  const v = data.all[data.targets[i]];
  keepHoles(data.all, v.entityId, v.from, v.to, v.multi, (h, o) => polyclip.intersection([[h]], o.multi).length > 0, () => {});
});

// data/geo 쓰기: 지우기 전 대조 → 기존 geojson 삭제 → 틈새 구멍 메우기 → 나라마다 <id>.geojson(FeatureCollection 하나, 버전마다 한 줄 + 개행).
// sources는 mergeAreas가 만든 나라 id → 출처 문구 표다. 없는 나라는 ESTIMATED를 쓴다
export function writeGeo(project, versions, { prune = false, sources = {} } = {}) {
  const outDir = path.join(project, 'data/geo');
  mkdirSync(outDir, { recursive: true });
  // 지우기 전 대조: 이번에 쓰지 않을 geojson이 이미 있으면 멈춘다 (권역 등록 빠뜨림, 생성기 밖에서 손으로 그린 파일 등).
  // 나라를 일부러 없애거나 id를 바꿀 때만 --prune으로 지운다. --prune은 손으로 그린 파일도 지우므로 그런 파일은 먼저 권역 파일로 옮긴다
  const vanishing = readdirSync(outDir).filter((f) => f.endsWith('.geojson') && !Object.hasOwn(versions, f.slice(0, -'.geojson'.length)));
  if (vanishing.length && !prune) throw new Error(`data/geo에서 사라질 파일 ${vanishing.length}개: ${vanishing.join(', ')}. 나라를 일부러 없앴거나 id를 바꿨으면 --prune을 붙여 다시 실행한다. 생성기 밖에서 그린 파일이면 먼저 권역 파일로 옮긴다(--prune은 그 파일도 지운다)`);
  // 구멍 판정 미리 계산은 지우기 전에 한다(미리 계산이 실패해 멈춰도 data/geo가 그대로 남게)
  const all = holeOwners(versions);
  prefetchHoles(all);
  for (const f of readdirSync(outDir)) if (f.endsWith('.geojson')) rmSync(path.join(outDir, f));
  let filled = 0;
  const occupiedBy = (h, o) => polyclip.intersection([[h]], o.multi).length > 0;
  const fillEmptyHoles = (entityId, from, to, multi) => keepHoles(all, entityId, from, to, multi, occupiedBy, () => filled++);

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
    // 버전(feature)마다 한 줄로 쓴다. 들여쓰기 형식보다 약 3분의 1 크기이고, git diff는 바뀐 버전 줄만 보인다 (2026-10-01)
    const lines = fc.features.map((f) => JSON.stringify(f)).join(',\n');
    writeFileSync(path.join(outDir, `${entityId}.geojson`), `{"type":"FeatureCollection","features":[\n${lines}\n]}\n`);
    console.log(entityId, list.map(([f, t, m]) => `${f}-${t}:${m.length}`).join(' '));
  }
  console.log(`빈 틈새 구멍 ${filled}개를 메움`);
}
