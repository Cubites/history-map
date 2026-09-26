import { useEffect, useState } from 'react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type {
  BBox,
  Entity,
  HistoryEvent,
  Lod,
  LonLat,
  Relation,
  TerritoryIndexEntry,
  TimelineIndex,
} from '../schema/index.ts';

export type LoadedEntity = Entity & { color: string };

export interface StaticData {
  timeline: TimelineIndex;
  territories: TerritoryIndexEntry[];
  entities: Map<string, LoadedEntity>;
  relations: Relation[];
  events: HistoryEvent[];
}

export type TerritoryFeature = Feature<MultiPolygon>;

export const dataUrl = (file: string) => `${import.meta.env.BASE_URL}data/${file}`;

async function getJson<T>(file: string): Promise<T> {
  const res = await fetch(dataUrl(file));
  if (!res.ok) throw new Error(`${file}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export function useStaticData() {
  const [data, setData] = useState<StaticData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<TimelineIndex>('timeline.json'),
      getJson<TerritoryIndexEntry[]>('territories.json'),
      getJson<LoadedEntity[]>('entities.json'),
      getJson<Relation[]>('relations.json'),
      getJson<HistoryEvent[]>('events.json'),
    ])
      .then(([timeline, territories, entities, relations, events]) =>
        setData({ timeline, territories, entities: new Map(entities.map((e) => [e.id, e])), relations, events }),
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  return { data, error };
}

export const isActive = (t: { from: number; to: number | null }, year: number) => t.from <= year && (t.to === null || year < t.to);

/** 그 해에 성립한 관계 (예: occupied_by = 점령, vassal_of = 종속·간섭). 관계 기간의 to는 포함 */
export function relationAt(relations: Relation[], type: Relation['type'], entityId: string, year: number): Relation | undefined {
  return relations.find((r) => r.type === type && r.subject === entityId && r.from <= year && (r.to === null || year <= r.to));
}

/** 그 해에 이 지역을 점령한 나라와의 관계 */
export const occupierAt = (relations: Relation[], entityId: string, year: number) => relationAt(relations, 'occupied_by', entityId, year);

/** 그 해에 이 나라가 종속·간섭을 받은 나라와의 관계 */
export const overlordAt = (relations: Relation[], entityId: string, year: number) => relationAt(relations, 'vassal_of', entityId, year);

export function activeTerritories(territories: TerritoryIndexEntry[], year: number): TerritoryIndexEntry[] {
  return territories.filter((t) => isActive(t, year));
}

// ── 도형 캐시 ───────────────────────────────────────────────
// 육지와 나라별 영토 파일을 단계(LOD)별로 한 번만 받아 풀어 둔다.

/** 육지 조각 (대륙·섬 단위). 화면 밖 조각은 그리지 않으려고 나눠 둔다. */
export interface LandPiece {
  feature: Feature<Polygon>;
  bbox: BBox;
}

const landCache = new Map<Lod, Promise<LandPiece[]>>();

function ringBBox(ring: Position[]): BBox {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of ring) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
}

export function loadLand(lod: Lod): Promise<LandPiece[]> {
  let pending = landCache.get(lod);
  if (!pending) {
    pending = getJson<Topology<{ land: GeometryCollection }>>(`land-${lod}.topo.json`).then((topo) => {
      const fc = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;
      return fc.features.flatMap((f) =>
        (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map((coordinates) => ({
          feature: { type: 'Feature' as const, properties: null, geometry: { type: 'Polygon' as const, coordinates } },
          bbox: ringBBox(coordinates[0]),
        })),
      );
    });
    pending.catch(() => landCache.delete(lod));
    landCache.set(lod, pending);
  }
  return pending;
}

const geoCache = new Map<string, Promise<Map<string, TerritoryFeature>>>();

/** 한 나라의 모든 영토 버전 도형. key(`${entityId}@${from}`)로 찾는다. */
export function loadEntityGeometry(lod: Lod, entityId: string): Promise<Map<string, TerritoryFeature>> {
  const cacheKey = `${lod}/${entityId}`;
  let pending = geoCache.get(cacheKey);
  if (!pending) {
    pending = getJson<Topology<{ territories: GeometryCollection }>>(`geo/${lod}/${entityId}.topo.json`).then((topo) => {
      const fc = feature(topo, topo.objects.territories) as FeatureCollection<MultiPolygon>;
      return new Map(fc.features.map((f) => [String(f.id), f]));
    });
    pending.catch(() => geoCache.delete(cacheKey));
    geoCache.set(cacheKey, pending);
  }
  return pending;
}

// ── 격자 조각 (DESIGN.md §3.2) ────────────────────────────
// 확대했을 때만 쓴다. 칠하기용 조각(tiles)과 테두리용 선 조각(lines)에 각각 경위도 범위가 붙어 있다.

export interface Piece {
  feature: Feature;
  bbox: BBox;
}
export interface TiledGroup {
  tiles: Piece[];
  lines: Piece[];
}

type TiledTopology = Topology<{ tiles: GeometryCollection<{ key?: string; b: BBox }>; lines: GeometryCollection<{ key?: string; b: BBox }> }>;

function toPieces(topo: TiledTopology, name: 'tiles' | 'lines') {
  return (feature(topo, topo.objects[name]) as FeatureCollection<Polygon | MultiPolygon, { key?: string; b: BBox }>).features.map((f) => ({
    key: f.properties.key,
    piece: { feature: f, bbox: f.properties.b } as Piece,
  }));
}

const tiledCache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let pending = tiledCache.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = load();
    pending.catch(() => tiledCache.delete(key));
    tiledCache.set(key, pending);
  }
  return pending;
}

export function loadLandTiled(lod: Lod): Promise<TiledGroup> {
  return cached(`land/${lod}`, async () => {
    const topo = await getJson<TiledTopology>(`land-tiled-${lod}.topo.json`);
    return { tiles: toPieces(topo, 'tiles').map((p) => p.piece), lines: toPieces(topo, 'lines').map((p) => p.piece) };
  });
}

/** 한 나라의 영토 버전별 격자 조각. key(`${entityId}@${from}`)로 찾는다 */
export function loadEntityTiled(lod: Lod, entityId: string): Promise<Map<string, TiledGroup>> {
  return cached(`${lod}/${entityId}`, async () => {
    const topo = await getJson<TiledTopology>(`geo-tiled/${lod}/${entityId}.topo.json`);
    const groups = new Map<string, TiledGroup>();
    const group = (key: string) => groups.get(key) ?? groups.set(key, { tiles: [], lines: [] }).get(key)!;
    for (const { key, piece } of toPieces(topo, 'tiles')) if (key) group(key).tiles.push(piece);
    for (const { key, piece } of toPieces(topo, 'lines')) if (key) group(key).lines.push(piece);
    return groups;
  });
}

/**
 * 화살표 기준점. 그 해의 영토를 쓰고, 그 해에 영토가 없으면(예: 멸망한 해) 시간상 가장 가까운 영토를 쓴다.
 */
export function anchorAt(territories: TerritoryIndexEntry[], entityId: string, year: number): LonLat | null {
  const versions = territories.filter((t) => t.entityId === entityId);
  if (!versions.length) return null;
  const distance = (v: { from: number; to: number | null }) =>
    year < v.from ? v.from - year : v.to !== null && year >= v.to ? year - v.to + 1 : 0;
  return versions.reduce((best, v) => (distance(v) < distance(best) ? v : best)).anchor;
}
