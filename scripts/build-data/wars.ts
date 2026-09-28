// 전쟁 (DESIGN.md §4.5): data/wars/*.yaml → 검증 → 스냅샷마다 진영별 점령 지역 계산 → wars.json
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
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

export async function readWars(files: string[], errors: string[], rel: (f: string) => string): Promise<War[]> {
  const wars: War[] = [];
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
    wars.push(result.data);
  }
  return wars;
}

export function checkWars(wars: War[], entities: Map<string, Entity>, events: HistoryEvent[], errors: string[]) {
  const ids = new Set<string>();
  for (const w of wars) {
    const where = `전쟁 ${w.id}`;
    if (ids.has(w.id)) errors.push(`전쟁 id 중복: ${w.id}`);
    ids.add(w.id);
    const factions = new Set(w.factions.map((f) => f.id));
    if (factions.size !== w.factions.length) errors.push(`${where}: 진영 id 중복`);
    const entity = (id: string, what: string) => {
      if (!entities.has(id)) errors.push(`${where}: ${what}에 없는 나라 '${id}'`);
    };
    const faction = (id: string, what: string) => {
      if (!factions.has(id)) errors.push(`${where}: ${what}에 없는 진영 '${id}'`);
    };
    w.factions.forEach((f) => entity(f.entity, `진영 ${f.id}`));
    w.participants.forEach((p) => {
      entity(p.entity, '참전국');
      faction(p.faction, `참전국 ${p.entity}`);
    });
    const theaters = new Set<string>();
    for (const t of w.theaters) {
      if (theaters.has(t.id)) errors.push(`${where}: 전역 id 중복 '${t.id}'`);
      theaters.add(t.id);
      t.replaces.forEach((id) => entity(id, `전역 ${t.id}의 replaces`));
      t.snapshots.forEach((s, i) => {
        const at = `전역 ${t.id} ${s.date}`;
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
      });
      t.routes.forEach((r) => faction(r.faction, `전역 ${t.id} 경로 ${r.name}`));
      t.battles.forEach((b) => b.winner && faction(b.winner, `전역 ${t.id} 전투 ${b.name}`));
    }
  }
  for (const ev of events) {
    if (!ev.front) continue;
    const war = wars.find((w) => w.id === ev.front!.war);
    if (!war) {
      errors.push(`사건 ${ev.id}: 없는 전쟁 '${ev.front.war}'`);
      continue;
    }
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

export async function buildWars(wars: War[], geo: WarGeoSources, errors: string[]): Promise<WarIndexEntry[]> {
  const out: WarIndexEntry[] = [];
  for (const w of wars) {
    const theaters: TheaterOut[] = [];
    for (const t of w.theaters) {
      const from = yearOfDate(t.snapshots[0].date);
      const to = yearOfDate(t.snapshots[t.snapshots.length - 1].date);
      // split이 나눌 범위: 전역이 시작된 해의 replaces 나라 영토를 합친 것
      const region = union(...t.replaces.map((id) => geo.territory(id, from)).filter((c): c is MultiCoords => !!c && c.length > 0));
      const snapshots: FrontSnapshotOut[] = [];
      for (const s of t.snapshots) {
        const year = yearOfDate(s.date);
        // 뒤에 오는 지역이 앞의 지역을 덮는다
        let layers: { faction: string; coords: MultiCoords }[] = [];
        const add = (faction: string, coords: MultiCoords) => {
          if (!coords.length) return;
          layers = layers.map((l) => ({ ...l, coords: difference(l.coords, coords) }));
          layers.push({ faction, coords });
        };
        if (s.split) {
          const north = intersect(region, northRing(s.split.line));
          add(s.split.north, north);
          add(s.split.south, difference(region, north));
        }
        for (const a of s.areas) {
          const coords = a.entities
            ? union(...a.entities.map((id) => geo.territory(id, year)).filter((c): c is MultiCoords => !!c && c.length > 0))
            : clipToLand(await readAreaGeojson(path.join(geo.dir, a.geojson!), errors), geo.land);
          if (!coords.length) errors.push(`전쟁 ${w.id} 전역 ${t.id} ${s.date}: 점령 지역이 비어 있음 (${a.entities?.join(', ') ?? a.geojson})`);
          add(a.faction, coords);
        }
        // 진영마다 한 덩어리로 합친다
        const byFaction = new Map<string, MultiCoords>();
        for (const l of layers) if (l.coords.length) byFaction.set(l.faction, byFaction.has(l.faction) ? union(byFaction.get(l.faction)!, l.coords) : l.coords);
        const areas = [...byFaction].map(([faction, coords]) => ({
          faction,
          coords: rewindForD3(roundCoords(coords, 3)) as [number, number][][][],
          bbox: bbox(coords),
        }));
        // 영토 대신 칠하는 나라의 이름표는 그 나라 진영의 점령 지역 안쪽에 둔다
        const labels = w.factions.flatMap((f) => {
          const coords = byFaction.get(f.id);
          return t.replaces.includes(f.entity) && coords?.length ? [{ entity: f.entity, anchor: anchorPoint(coords) }] : [];
        });
        snapshots.push({
          date: s.date,
          year,
          title: s.title,
          summary: s.summary,
          areas,
          lines: [...(s.split ? [s.split.line] : []), ...s.lines],
          arrows: s.arrows,
          labels,
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
        marker: t.marker ?? [(first[0] + first[2]) / 2, (first[1] + first[3]) / 2],
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
    });
  }
  return out;
}
