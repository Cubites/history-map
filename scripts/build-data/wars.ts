// 전쟁 (DESIGN.md §4.5): data/wars/*.yaml → 검증 → 스냅샷마다 진영별 점령 지역 계산 → wars.json
// 장면(스냅샷) 하나의 계산은 computeScene이고, 결과는 war-cache.ts가 .cache/build-data-wars/에 둔다(바뀐 장면만 다시 계산, 2026-10-13)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { feature } from 'topojson-client';
import { topology } from 'topojson-server';
import type { Topology } from 'topojson-specification';
import { parse as parseYaml } from 'yaml';
import {
  WarSchema,
  type Entity,
  type FrontSnapshotOut,
  type HistoryEvent,
  type LonLat,
  type TheaterOut,
  type War,
  type WarIndexEntry,
} from '../../src/schema/index.ts';
import { calendarDateProblem, defaultCalendar, type Calendar } from '../../src/schema/calendar.ts';
import { REGION_FILTER_OF, STORY_FILE_PREFIXES, regionOfWarFile } from '../../src/schema/regions.ts';
import { keyOf } from './cache.ts';
import { cacheKey, cached, fileHash } from './war-cache.ts';
import {
  anchorPoint,
  bbox,
  clipToLand,
  difference,
  intersect,
  rewindForD3,
  roundCoords,
  toMulti,
  union,
  type BBox,
  type MultiCoords,
  type PolygonCoords,
  type Ring,
} from './geo.ts';

/** 날짜 비교용 수 (기원전 날짜도 순서대로) */
export function dateKey(date: string): number {
  const [, y, m, d] = date.match(/^(-?\d+)-(\d+)-(\d+)$/)!;
  return Number(y) * 10000 + Number(m) * 100 + Number(d);
}

/** 날짜 문자열의 연도 (천문 연도) */
export function yearOfDate(date: string): number {
  return Number(date.match(/^(-?\d+)-/)![1]);
}

/**
 * 흐름 매핑({ ... }) 안에 따옴표 없이 쓴 글에 쉼표가 있으면 YAML은 쉼표 뒤를 값 없는 키로 읽어
 * 글이 잘린다 (예: "3,800여 명" → "3"). 값이 없고 공백이나 한글이 든 키를 찾아 오류로 알린다.
 */
export function findCutText(node: unknown, where: string, errors: string[], trail = ''): void {
  if (Array.isArray(node)) node.forEach((v, i) => findCutText(v, where, errors, `${trail}[${i}]`));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (v === null && /[\sㄱ-힣]/.test(k)) {
        errors.push(`${where} ${trail}: 쉼표 때문에 글이 잘림 ("${k.slice(0, 30)}…" 앞의 쉼표). 글 전체를 큰따옴표로 감쌀 것`);
      }
      findCutText(v, where, errors, trail ? `${trail}.${k}` : k);
    }
  }
}

/** 전쟁과 그 파일 이름이 정한 권역 (src/schema/regions.ts), 날짜의 달력(YAML에 없으면 defaultCalendar로 채움) */
export type RegionalWar = War & { region: string; calendar: Calendar };

export async function readWars(files: string[], errors: string[], rel: (f: string) => string): Promise<RegionalWar[]> {
  const wars: RegionalWar[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = parseYaml(await readFile(file, 'utf8'));
    } catch (e) {
      errors.push(`${rel(file)}: YAML 문법 오류 - ${(e as Error).message}`);
      continue;
    }
    findCutText(raw, rel(file), errors);
    const result = WarSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) errors.push(`${rel(file)} ${issue.path.join('.')}: ${issue.message}`);
      continue;
    }
    // 권역은 파일 이름에서 정한다 (src/schema/regions.ts). `<영문자>-<두 자리 수>-` 꼴인데 앞머리를 모르면 오류
    const region = regionOfWarFile(file);
    if (region === undefined) {
      errors.push(`${rel(file)}: 파일 이름 앞머리 '${path.basename(file).split('-')[0]}-'를 모름. src/schema/regions.ts의 STORY_FILE_PREFIXES(지금 ${STORY_FILE_PREFIXES.map(([p]) => p).join(', ')})에 한 줄 더할 것`);
      continue;
    }
    for (const t of result.data.theaters) {
      if (t.region !== undefined && !Object.hasOwn(REGION_FILTER_OF, t.region)) {
        errors.push(`${rel(file)} 전역 ${t.id}: region '${t.region}'을 모름. src/schema/regions.ts의 REGION_FILTER_OF 키(${Object.keys(REGION_FILTER_OF).join(', ')}) 가운데 하나`);
      }
    }
    // 달력은 YAML에 적은 값, 없으면 권역과 첫 장면 해로 정한 기본값 (src/schema/calendar.ts)
    const firstYear = Math.min(...result.data.theaters.map((t) => yearOfDate(t.snapshots[0].date)));
    wars.push({ ...result.data, region, calendar: result.data.calendar ?? defaultCalendar(region, firstYear) });
  }
  return wars;
}

export function checkWars(wars: RegionalWar[], entities: Map<string, Entity>, events: HistoryEvent[], errors: string[]) {
  const ids = new Set<string>();
  for (const w of wars) {
    const where = `전쟁 ${w.id}`;
    if (ids.has(w.id)) errors.push(`전쟁 id 중복: ${w.id}`);
    ids.add(w.id);
    const factions = new Set(w.factions.map((f) => f.id));
    if (factions.size !== w.factions.length) errors.push(`${where}: 진영 id 중복`);
    // 모든 날짜를 이 전쟁의 달력으로 검사 (장면·전투·진군로 지점·참전 기간. 사건의 front.date는 아래에서)
    const date = (value: string | undefined, what: string) => {
      const problem = value === undefined ? null : calendarDateProblem(value, w.calendar);
      if (problem) errors.push(`${where}: ${what} 날짜 ${value}가 ${w.calendar} 달력에 맞지 않음 - ${problem}`);
    };
    const entity = (id: string, what: string) => {
      if (!entities.has(id)) errors.push(`${where}: ${what}에 없는 나라 '${id}'`);
    };
    const faction = (id: string, what: string) => {
      if (!factions.has(id)) errors.push(`${where}: ${what}에 없는 진영 '${id}'`);
    };
    w.factions.forEach((f) => entity(f.entity, `진영 ${f.id}`));
    w.participants.forEach((p) => {
      entity(p.entity, '참전국');
      date(p.from, `참전국 ${p.entity} from`);
      date(p.to, `참전국 ${p.entity} to`);
      faction(p.faction, `참전국 ${p.entity}`);
    });
    const theaters = new Set<string>();
    for (const t of w.theaters) {
      if (theaters.has(t.id)) errors.push(`${where}: 전역 id 중복 '${t.id}'`);
      theaters.add(t.id);
      t.replaces.forEach((id) => entity(id, `전역 ${t.id}의 replaces`));
      t.snapshots.forEach((s, i) => {
        const at = `전역 ${t.id} ${s.date}`;
        date(s.date, `전역 ${t.id} 장면`);
        if (i > 0 && dateKey(s.date) <= dateKey(t.snapshots[i - 1].date)) errors.push(`${where}: ${at} 스냅샷이 날짜 순서대로가 아님`);
        if (s.split) {
          faction(s.split.north, `${at} split.north`);
          faction(s.split.south, `${at} split.south`);
          if (t.replaces.length === 0) errors.push(`${where}: ${at} split은 전역의 replaces 나라 영토를 나누므로 replaces가 필요함`);
        }
        s.areas.forEach((a) => {
          faction(a.faction, `${at} areas`);
          a.entities?.forEach((id) => entity(id, `${at} areas`));
        });
        s.arrows.forEach((a) => faction(a.faction, `${at} arrows`));
        s.holds.forEach((h) => faction(h.faction, `${at} holds ${h.name}`));
        s.labelAs.forEach((l) => {
          entity(l.entity, `${at} labelAs`);
          l.instead.forEach((id) => entity(id, `${at} labelAs ${l.entity}의 instead`));
        });
      });
      t.routes.forEach((r) => {
        faction(r.faction, `전역 ${t.id} 경로 ${r.name}`);
        r.points.forEach((p, i) => date(p.date, `전역 ${t.id} 경로 ${r.name} 지점 ${i + 1}`));
      });
      t.battles.forEach((b) => {
        if (b.winner) faction(b.winner, `전역 ${t.id} 전투 ${b.name}`);
        date(b.date, `전역 ${t.id} 전투 ${b.name}`);
      });
    }
  }
  for (const ev of events) {
    if (!ev.front) continue;
    const war = wars.find((w) => w.id === ev.front!.war);
    if (!war) {
      errors.push(`사건 ${ev.id}: 없는 전쟁 '${ev.front.war}'`);
      continue;
    }
    const problem = calendarDateProblem(ev.front.date, war.calendar);
    if (problem) errors.push(`사건 ${ev.id}: front.date ${ev.front.date}가 전쟁 ${war.id}의 ${war.calendar} 달력에 맞지 않음 - ${problem}`);
    const theater = ev.front.theater ? war.theaters.find((t) => t.id === ev.front!.theater) : war.theaters[0];
    if (!theater) errors.push(`사건 ${ev.id}: 전쟁 ${war.id}에 없는 전역 '${ev.front.theater}'`);
    else if (!theater.snapshots.some((s) => s.date === ev.front!.date))
      errors.push(`사건 ${ev.id}: 전쟁 ${war.id} 전역 ${theater.id}에 ${ev.front.date} 스냅샷이 없음`);
  }
}

/** 선의 북·서쪽을 닫는 큰 고리. 선은 서쪽(또는 남해안)에서 시작해 동쪽 바다에서 끝난다 */
function northRing(line: LonLat[]): MultiCoords {
  const [first, last] = [line[0], line[line.length - 1]];
  const ring = [...line, [last[0] + 5, last[1]], [last[0] + 5, 85], [first[0] - 5, 85], [first[0] - 5, first[1]], line[0]];
  return [[ring]];
}

const mergeBox = (boxes: BBox[]): BBox => [
  Math.min(...boxes.map((b) => b[0])),
  Math.min(...boxes.map((b) => b[1])),
  Math.max(...boxes.map((b) => b[2])),
  Math.max(...boxes.map((b) => b[3])),
];

export interface WarGeoSources {
  /** 그 해의 (해안선으로 자른) 나라 영토 */
  territory: (entityId: string, year: number) => MultiCoords | null;
  /** 육지 조각 (GeoJSON으로 그린 점령 지역을 해안선으로 자를 때) */
  land: { coords: PolygonCoords; bbox: BBox }[];
  /** data/wars/ 폴더 (geojson 경로의 기준) */
  dir: string;
}

/** 전역 범위에 여백(기본 경도·위도 폭의 1/4)을 둔 상자. 경도는 ±180, 위도는 ±85를 넘지 않는다 */
function boundsBox([[w, s], [e, n]]: [[number, number], [number, number]], margin = 0.25): MultiCoords {
  const dx = (e - w) * margin;
  const dy = (n - s) * margin;
  const W = Math.max(-180, w - dx), E = Math.min(180, e + dx), S = Math.max(-85, s - dy), N = Math.min(85, n + dy);
  return [[[[W, S], [E, S], [E, N], [W, N], [W, S]]]];
}

/** 링의 평면 넓이(경위도 제곱도) */
function ringArea(ring: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a / 2);
}

/**
 * 반올림으로 넓이가 거의 0이 된 조각(약 0.1 km² 미만)을 뺀다. 점령 지역을 빼고 남은 해안의 가는 띠가 선처럼 남아,
 * 칠해지지는 않지만 그 진영을 고를 때 강조선이 그 선을 따라 그려졌다
 */
function dropSlivers(coords: MultiCoords): MultiCoords {
  return coords.filter((polygon) => ringArea(polygon[0] as [number, number][]) > 1e-5);
}

/** 점 p에서 선분 ab까지 거리(km). p 위도의 등장방형 근사 (수 km 허용 오차를 재는 데 충분) */
function segmentKm(p: number[], a: number[], b: number[]): number {
  const kx = 111.32 * Math.cos((p[1] * Math.PI) / 180);
  const ky = 110.57;
  const [ax, ay, bx, by] = [(a[0] - p[0]) * kx, (a[1] - p[1]) * ky, (b[0] - p[0]) * kx, (b[1] - p[1]) * ky];
  const [dx, dy] = [bx - ax, by - ay];
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
}

/** 더글러스-포이커: 양 끝은 남기고, 남긴 선에서 km보다 멀리 벗어난 점이 없을 때까지 점을 고른다 (되부름 대신 쌓기) */
function douglasPeucker(line: number[][], km: number): number[][] {
  if (line.length <= 2) return line;
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    let far = -1;
    let best = km;
    for (let k = i + 1; k < j; k++) {
      const d = segmentKm(line[k], line[i], line[j]);
      if (d > best) [best, far] = [d, k];
    }
    if (far < 0) continue;
    keep[far] = 1;
    stack.push([i, far], [far, j]);
  }
  return line.filter((_, k) => keep[k]);
}

/**
 * 진영 사이 경계 맞추기(노딩): 한 진영의 꼭짓점이 다른 진영 고리의 변 위(eps° 안, 양 끝 점 근처는 빼고)에 있으면 그 변에 끼워 넣는다.
 * 점령 지역은 뒤 지역을 뺀 차집합이라 앞 지역 경계에는 뒤 지역 변 위의 교차점이 있지만 뒤 지역에는 그 점이 없다. 그대로 토폴로지로
 * 묶으면 그 둘레가 양쪽에서 따로 줄어 진영 사이에 가는 삼각형 겹침·틈이 생겼다(시험: 뉴기니 전선에서 한 장면 34 km²).
 * eps는 반올림(소수 셋째 자리) 오차를 덮는 0.002°(약 200m)
 */
function nodeFactions(factions: MultiCoords[], eps = 2e-3): MultiCoords[] {
  const CELL = 0.1;
  const at = (v: number) => Math.floor(v / CELL);
  // 변 색인: 칸 → 변(진영·조각·고리·변 번호). 변은 eps만큼 넓힌 범위가 걸치는 칸마다 넣는다
  const grid = new Map<string, [number, number, number, number][]>();
  factions.forEach((mp, f) =>
    mp.forEach((poly, p) =>
      poly.forEach((ring, r) => {
        for (let i = 0; i + 1 < ring.length; i++) {
          const [a, b] = [ring[i], ring[i + 1]];
          for (let x = at(Math.min(a[0], b[0]) - eps); x <= at(Math.max(a[0], b[0]) + eps); x++)
            for (let y = at(Math.min(a[1], b[1]) - eps); y <= at(Math.max(a[1], b[1]) + eps); y++) {
              const key = `${x},${y}`;
              if (!grid.has(key)) grid.set(key, []);
              grid.get(key)!.push([f, p, r, i]);
            }
        }
      }),
    ),
  );
  // 끼워 넣을 점: 변 → [변 위 위치 t, 점]
  const inserts = new Map<string, [number, number[]][]>();
  const near = (u: number[], v: number[]) => Math.abs(u[0] - v[0]) < eps && Math.abs(u[1] - v[1]) < eps;
  factions.forEach((mp, f) =>
    mp.forEach((poly) =>
      poly.forEach((ring) => {
        for (const v of ring) {
          for (const [g, p, r, i] of grid.get(`${at(v[0])},${at(v[1])}`) ?? []) {
            if (g === f) continue;
            const [a, b] = [factions[g][p][r][i], factions[g][p][r][i + 1]];
            if (near(v, a) || near(v, b)) continue;
            const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
            const t = ((v[0] - a[0]) * dx + (v[1] - a[1]) * dy) / (dx * dx + dy * dy);
            if (!(t > 0 && t < 1) ||Math.hypot(a[0] + t * dx - v[0], a[1] + t * dy - v[1]) >= eps) continue;
            const key = `${g},${p},${r},${i}`;
            if (!inserts.has(key)) inserts.set(key, []);
            inserts.get(key)!.push([t, v]);
          }
        }
      }),
    ),
  );
  if (!inserts.size) return factions;
  return factions.map((mp, f) =>
    mp.map((poly, p) =>
      poly.map((ring, r) => {
        const out: Ring = [];
        const push = (v: Ring[number]) => {
          const last = out[out.length - 1];
          if (!last || last[0] !== v[0] || last[1] !== v[1]) out.push(v);
        };
        ring.forEach((v, i) => {
          push(v);
          const extra = inserts.get(`${f},${p},${r},${i}`);
          if (extra) for (const [, u] of extra.sort((x, y) => x[0] - y[0])) push(u);
        });
        return out;
      }),
    ),
  );
}

/**
 * 전역 simplify(km): 한 장면의 진영 덩어리를 한 토폴로지(topojson-server, topo.ts의 LOD와 같은 방법)로 묶고 경계선(arc)마다
 * 더글러스-포이커로 줄인다. 두 진영이 맞닿은 선은 한 arc라 양쪽이 똑같이 줄어 진영 사이에 틈·겹침이 생기지 않고(먼저 nodeFactions로 꼭짓점을 맞춤),
 * arc의 양 끝(세 덩어리 이상이 만나는 점)은 그대로 남는다. 넓이 기준인 topojson-simplify 대신 거리 기준을 쓴 것은 허용 오차를 km로 적기 위해서다.
 * 줄인 뒤 점이 4개 미만이거나 넓이가 거의 0인 고리는 빼고(바깥 고리가 빠지면 그 조각째), 줄이며 생긴 자기 교차·자기 접촉은
 * 반올림 → 자기 자신과 합집합을 결과가 안 변할 때까지(최대 3번) 되풀이해 푼다. 결과는 반올림(소수 셋째 자리)된 좌표다
 */
export function simplifyFactions(byFaction: Map<string, MultiCoords>, km: number): Map<string, MultiCoords> {
  const ids = [...byFaction.keys()].filter((f) => byFaction.get(f)!.length);
  const noded = nodeFactions(ids.map((f) => roundCoords(byFaction.get(f)!, 3)));
  const topo = topology(
    Object.fromEntries(ids.map((f, i) => [f, { type: 'MultiPolygon', coordinates: noded[i] } as MultiPolygon])),
  ) as unknown as Topology;
  topo.arcs = topo.arcs.map((arc) => douglasPeucker(arc, km) as typeof arc);
  const ok = (ring: Ring) => ring.length >= 4 && ringArea(ring as [number, number][]) > 1e-5;
  const out = new Map(byFaction);
  for (const f of ids) {
    const geom = (feature(topo, topo.objects[f]) as Feature<Polygon | MultiPolygon | null>).geometry;
    let coords: MultiCoords = (geom ? toMulti(geom) : []).flatMap(([outer, ...holes]) => (ok(outer) ? [[outer, ...holes.filter(ok)]] : []));
    for (let n = 0; n < 3 && coords.length; n++) {
      const next = roundCoords(union(coords), 3);
      const same = JSON.stringify(next) === JSON.stringify(coords);
      coords = next;
      if (same) break;
    }
    out.set(f, coords);
  }
  // 그래도 남은 겹침(입력에 이미 있던 폭이 거의 0인 가시 둘레 등, 시험에서 한 장면 14 km²)은 뒤 진영이 이기도록 앞 진영에서 뺀다
  for (let i = 0; i + 1 < ids.length; i++) {
    const later = ids.slice(i + 1).map((f) => out.get(f)!).filter((c) => c.length);
    if (later.length && out.get(ids[i])!.length) out.set(ids[i], roundCoords(difference(out.get(ids[i])!, union(...later)), 3));
  }
  return out;
}

async function readAreaGeojson(file: string, errors: string[]): Promise<MultiCoords> {
  try {
    const fc = JSON.parse(await readFile(file, 'utf8')) as FeatureCollection;
    return fc.features.flatMap((f) =>
      f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon' ? toMulti(f.geometry as Polygon | MultiPolygon) : [],
    );
  } catch (e) {
    errors.push(`점령 지역 파일을 읽지 못함 (${file}): ${(e as Error).message}`);
    return [];
  }
}

/** 전역이 시작된 해의 replaces 나라 영토를 합친 것 */
function regionOf(t: RegionalWar['theaters'][number], from: number, geo: WarGeoSources): MultiCoords {
  return union(...t.replaces.map((id) => geo.territory(id, from)).filter((c): c is MultiCoords => !!c && c.length > 0));
}

/** 장면 하나의 계산 결과 (캐시에 두는 것). errors는 계산 중 알린 오류 글 — 캐시에서 읽어도 같은 순서로 다시 알린다 */
interface SceneOut {
  areas: FrontSnapshotOut['areas'];
  labels: FrontSnapshotOut['labels'];
  errors: string[];
}

/** 장면 하나의 진영별 점령 지역과 이름표. getRegion은 전역 범위(split을 쓰는 장면에서만 부름) */
async function computeScene(w: RegionalWar, t: RegionalWar['theaters'][number], s: RegionalWar['theaters'][number]['snapshots'][number], getRegion: () => Promise<MultiCoords>, geo: WarGeoSources): Promise<SceneOut> {
  const errors: string[] = [];
  const year = yearOfDate(s.date);
  // 뒤에 오는 지역이 앞의 지역을 덮는다
  let layers: { faction: string; coords: MultiCoords }[] = [];
  const add = (faction: string, coords: MultiCoords) => {
    if (!coords.length) return;
    layers = layers.map((l) => ({ ...l, coords: difference(l.coords, coords) }));
    layers.push({ faction, coords });
  };
  if (s.split) {
    const region = await getRegion();
    const north = intersect(region, northRing(s.split.line));
    add(s.split.north, north);
    add(s.split.south, difference(region, north));
  }
  for (const a of s.areas) {
    let coords: MultiCoords;
    if (a.entities) {
      coords = union(...a.entities.map((id) => geo.territory(id, year)).filter((c): c is MultiCoords => !!c && c.length > 0));
    } else {
      // 손으로 그린 점령 지역은 먼저 칠한 지역 안에서는 그 지역의 해안선으로 자른다. 육지 도형으로만 자르면
      // 해안선이 영토 도형과 조금 어긋나 해안을 따라 앞 지역의 가는 띠가 남고, 그 진영을 고를 때 강조선이 그 띠를 둘렀다
      const raw = await readAreaGeojson(path.join(geo.dir, a.geojson!), errors);
      const under = union(...layers.map((l) => l.coords));
      coords = under.length ? union(intersect(raw, under), difference(clipToLand(raw, geo.land), under)) : clipToLand(raw, geo.land);
    }
    if (!coords.length) errors.push(`전쟁 ${w.id} 전역 ${t.id} ${s.date}: 점령 지역이 비어 있음 (${a.entities?.join(', ') ?? a.geojson})`);
    add(a.faction, coords);
  }
  // 진영마다 한 덩어리로 합친다
  const byFaction = new Map<string, MultiCoords>();
  for (const l of layers) if (l.coords.length) byFaction.set(l.faction, byFaction.has(l.faction) ? union(byFaction.get(l.faction)!, l.coords) : l.coords);
  // 전역 범위(bounds)를 정했으면 진영 덩어리를 그 범위에 여백을 둔 상자로 자른다. 소련 영토 전체(시베리아)처럼
  // 전역 밖의 점이 wars.json을 키우고, 이름표 자리(덩어리 안쪽)가 화면 밖으로 가던 문제 (2026-10-12)
  if (t.bounds) {
    const box = boundsBox(t.bounds);
    for (const [faction, coords] of byFaction) byFaction.set(faction, intersect(coords, box));
  }
  // 전역 simplify(km)를 정했으면 진영 덩어리를 함께 줄인다 (이름표·범위도 줄인 도형으로 정함)
  if (t.simplify) for (const [faction, coords] of simplifyFactions(byFaction, t.simplify)) byFaction.set(faction, coords);
  const areas = [...byFaction].map(([faction, coords]) => ({
    faction,
    coords: rewindForD3(dropSlivers(roundCoords(coords, 3))) as [number, number][][][],
    bbox: bbox(coords),
  }));
  // 영토 대신 칠하는 나라의 이름표는 그 나라 진영의 점령 지역 안쪽에 둔다
  const labels = w.factions.flatMap((f) => {
    const coords = byFaction.get(f.id);
    if (!t.replaces.includes(f.entity) || !coords?.length) return [];
    // 전역 범위를 정했으면 이름표는 여백 없는 범위 안쪽 땅에 둔다 (덩어리를 여백까지 잘라도 무게중심이 화면 밖일 수 있음)
    const inView = t.bounds ? intersect(coords, boundsBox(t.bounds, 0)) : [];
    return [{ entity: f.entity, anchor: anchorPoint(inView.length ? inView : coords) }];
  });
  return { areas, labels, errors };
}

/** 그 해 나라 영토의 내용 열쇠 (없거나 비었으면 null) */
const territoryKey = (geo: WarGeoSources, id: string, year: number) => {
  const c = geo.territory(id, year);
  return c && c.length > 0 ? keyOf(c) : null;
};

/**
 * 장면 캐시 열쇠: 계산에 들어가는 모든 것. 설명글·화살표·표시(holds)·경로는 계산에 안 쓰이므로 넣지 않는다.
 * 전쟁·전역 id와 날짜는 오류 글에 들어가므로 넣는다
 */
function sceneKey(w: RegionalWar, t: RegionalWar['theaters'][number], s: RegionalWar['theaters'][number]['snapshots'][number], from: number, geo: WarGeoSources, landKey: string): string {
  const year = yearOfDate(s.date);
  return cacheKey('scene', {
    war: w.id,
    theater: t.id,
    date: s.date,
    split: s.split ?? null,
    areas: s.areas,
    replaces: t.replaces,
    bounds: t.bounds ?? null,
    simplify: t.simplify ?? null,
    factions: w.factions.map((f) => [f.id, f.entity]),
    entities: s.areas.map((a) => a.entities?.map((id) => [id, territoryKey(geo, id, year)]) ?? null),
    region: s.split ? t.replaces.map((id) => [id, territoryKey(geo, id, from)]) : null,
    geojson: s.areas.map((a) => (a.geojson ? fileHash(path.join(geo.dir, a.geojson)) : null)),
    land: landKey,
  });
}

/** useCache가 false면 .cache/build-data-wars/를 쓰지 않는다 (결과는 같음). 환경 변수 HISTORY_MAP_CACHE=0도 같은 뜻 */
export async function buildWars(wars: RegionalWar[], geo: WarGeoSources, errors: string[], useCache = true): Promise<WarIndexEntry[]> {
  const out: WarIndexEntry[] = [];
  // 실제로 자를 때 쓰는 육지 자료의 내용 열쇠 (육지 파일·읽는 코드·축척이 바뀌면 낡은 장면을 쓰지 않도록). 빌드마다 한 번
  const landKey = useCache ? keyOf(geo.land.map((p) => p.coords)) : '';
  for (const w of wars) {
    const theaters: TheaterOut[] = [];
    for (const t of w.theaters) {
      const from = yearOfDate(t.snapshots[0].date);
      const to = yearOfDate(t.snapshots[t.snapshots.length - 1].date);
      // split이 나눌 범위: 전역이 시작된 해의 replaces 나라 영토를 합친 것 (split을 쓰는 장면이 계산될 때만 만든다)
      let region: Promise<MultiCoords> | null = null;
      const getRegion = () =>
        (region ??= useCache
          ? cached('region', cacheKey('region', t.replaces.map((id) => [id, territoryKey(geo, id, from)])), () => regionOf(t, from, geo))
          : Promise.resolve(regionOf(t, from, geo)));
      const snapshots: FrontSnapshotOut[] = [];
      for (const s of t.snapshots) {
        const year = yearOfDate(s.date);
        const scene = useCache
          ? await cached('scene', sceneKey(w, t, s, from, geo, landKey), () => computeScene(w, t, s, getRegion, geo))
          : await computeScene(w, t, s, getRegion, geo);
        errors.push(...scene.errors);
        const { areas, labels } = scene;
        snapshots.push({
          date: s.date,
          year,
          title: s.title,
          summary: s.summary,
          areas,
          lines: [...(s.split ? [s.split.line] : []), ...s.lines],
          arrows: s.arrows,
          labels,
          // 정한 장면에서만 적는다 (다른 장면·전쟁의 wars.json 출력은 그대로)
          ...(s.labelAs.length ? { labelAs: s.labelAs } : {}),
          holds: s.holds,
          bbox: areas.length
            ? mergeBox(areas.map((a) => a.bbox))
            : s.holds.length
              ? [Math.min(...s.holds.map((h) => h.at[0])), Math.min(...s.holds.map((h) => h.at[1])), Math.max(...s.holds.map((h) => h.at[0])), Math.max(...s.holds.map((h) => h.at[1]))]
              : [0, 0, 0, 0],
        });
      }
      const all = mergeBox(snapshots.map((s) => s.bbox));
      const first = snapshots[0].bbox;
      theaters.push({
        id: t.id,
        name: t.name,
        from,
        to,
        replaces: t.replaces,
        ...(t.region ? { region: t.region } : {}),
        marker: t.marker ?? [(first[0] + first[2]) / 2, (first[1] + first[3]) / 2],
        // 숨길 때만 적는다 (다른 전역의 wars.json 출력은 그대로). simplify는 빌드에서만 쓰므로 내보내지 않는다
        ...(t.hideMarker ? { hideMarker: true as const } : {}),
        bounds: t.bounds ?? [[all[0] - 1.5, all[1] - 1], [all[2] + 1.5, all[3] + 1]],
        routes: t.routes,
        battles: [...t.battles].sort((a, b) => dateKey(a.date) - dateKey(b.date)),
        snapshots,
      });
    }
    const from = Math.min(...theaters.map((t) => t.from));
    const to = Math.max(...theaters.map((t) => t.to));
    out.push({
      id: w.id,
      name: w.name,
      calendar: w.calendar,
      from,
      to,
      factions: w.factions,
      participants: w.participants.map((p) => ({
        entity: p.entity,
        faction: p.faction,
        from: p.from ? yearOfDate(p.from) : from,
        to: p.to ? yearOfDate(p.to) : to,
      })),
      sources: w.sources,
      theaters,
      region: w.region,
    });
  }
  return out;
}
