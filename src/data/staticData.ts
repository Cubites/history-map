import { useEffect, useState } from 'react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { geoArea } from 'd3-geo';
import { feature } from 'topojson-client';
import type { RegionFilterUnit } from '../schema/regions.ts';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type {
  BBox,
  Entity,
  HistoryEvent,
  Lod,
  LonLat,
  Relation,
  TerritoryIndexEntry,
  WarIndexEntry,
  TimelineIndex,
} from '../schema/index.ts';

/**
 * 권역(region: korea·europe 등 지리적 권역)은 빌드가 데이터 파일 이름에서 정해 붙인다 (src/schema/regions.ts, DESIGN.md §6.4.2).
 * 나라 항목의 `level: 'region'`(나라가 아닌 지역 항목)과는 다른 것이다
 */
export type LoadedEntity = Entity & { color: string; region: string; units?: RegionFilterUnit[] };
export type LoadedEvent = HistoryEvent & { region: string; units?: RegionFilterUnit[] };

export interface StaticData {
  timeline: TimelineIndex;
  territories: TerritoryIndexEntry[];
  entities: Map<string, LoadedEntity>;
  relations: Relation[];
  events: LoadedEvent[];
  /** 전쟁: 진영·참전국·전역별 날짜 스냅샷 (DESIGN.md §4.5) */
  wars: WarIndexEntry[];
}

export type TerritoryFeature = Feature<MultiPolygon>;

/** 데이터 파일 주소. 빌드마다 바뀌는 버전을 붙여 이전 배포본의 저장된 파일과 섞이지 않게 한다 */
export const dataUrl = (file: string) => `${import.meta.env.BASE_URL}data/${file}?v=${__DATA_VERSION__}`;

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
      getJson<LoadedEvent[]>('events.json'),
      getJson<WarIndexEntry[]>('wars.json'),
    ])
      .then(([timeline, territories, entities, relations, events, wars]) =>
        setData({ timeline, territories, entities: new Map(entities.map((e) => [e.id, e])), relations, events, wars }),
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

/** 그 해에 이 지역의 귀속 후보 나라들 (귀속 논쟁 지역이 아니면 빈 배열) */
export const claimantsAt = (relations: Relation[], entityId: string, year: number) =>
  relations.filter((r) => r.type === 'claimed_by' && r.subject === entityId && r.from <= year && (r.to === null || year <= r.to)).map((r) => r.object);

/** 그 해에 이 나라가 귀속 후보로 올라 있는 논쟁 지역들 */
export const claimedRegionsAt = (relations: Relation[], entityId: string, year: number) =>
  relations.filter((r) => r.type === 'claimed_by' && r.object === entityId && r.from <= year && (r.to === null || year <= r.to)).map((r) => r.subject);

/** 그 해에 이 나라가 종속·간섭을 받은 나라와의 관계 */
export const overlordAt = (relations: Relation[], entityId: string, year: number) => relationAt(relations, 'vassal_of', entityId, year);

export function activeTerritories(territories: TerritoryIndexEntry[], year: number): TerritoryIndexEntry[] {
  return territories.filter((t) => isActive(t, year));
}

// ── 도형 캐시 ───────────────────────────────────────────────
// 육지와 나라별 영토 파일을 단계(LOD)별로 받아 둔다. 메모리를 아끼려고(2026-11-18) 두 가지를 한다.
// ① 나라 파일에는 그 나라의 모든 시대 버전이 들어 있지만, 받은 원본(topology)만 두고 그리는 버전만 그때 푼다(LazyMap).
//    topojson을 GeoJSON으로 풀면 점마다 작은 배열이 생겨 파일의 수십 배가 되므로, 전부 풀면 연도를 몇 번만 바꿔도 힙이 수백 MB가 되었다.
// ② 오래 쓰지 않은 파일과 푼 버전은 pruneGeometry로 버린다. 마지막으로 그린 화면에 쓴 것은 버리지 않는다.

/** 받은 파일 하나. used는 마지막으로 쓴 때(performance.now) */
interface Slot {
  promise: Promise<unknown>;
  value?: unknown;
  used: number;
}
const slots = new Map<string, Slot>();
/** 마지막 그리기를 시작한 때. 이때 이후에 쓴 것은 지금 화면에 쓰이므로 버리지 않는다 */
let frameStart = 0;

/** 캐시 열쇠. 단계와 종류마다 따로 */
export const geoKeys = {
  land: (lod: Lod) => `land/${lod}`,
  landTiled: (lod: Lod) => `land-tiled/${lod}`,
  entity: (lod: Lod, entityId: string) => `geo/${lod}/${entityId}`,
  entityTiled: (lod: Lod, entityId: string) => `tiled/${lod}/${entityId}`,
};

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let slot = slots.get(key);
  if (!slot) {
    const s: Slot = { promise: load(), used: performance.now() };
    // 받으면 꺼내 쓸 수 있게 두고, 실패하면 다음에 다시 받을 수 있게 지운다
    s.promise.then(
      (value) => {
        if (slots.get(key) === s) s.value = value;
      },
      () => {
        if (slots.get(key) === s) slots.delete(key);
      },
    );
    slots.set(key, s);
    slot = s;
  }
  return slot.promise as Promise<T>;
}

/** 받아 둔 파일을 꺼낸다(받는 중이거나 없으면 undefined). 꺼내면 쓴 것으로 친다 */
function peek<T>(key: string): T | undefined {
  const slot = slots.get(key);
  if (!slot || slot.value === undefined) return undefined;
  slot.used = performance.now();
  return slot.value as T;
}

/** 받았거나 받는 중인가 (쓴 것으로 치지 않는다) */
export const hasGeometry = (key: string) => slots.has(key);

/** 받았거나 받는 중이면 true를 돌려주고 쓴 것으로 친다. 화면 밖이라 그리지 않은 그 해 나라의 파일도 버리지 않게 한다 */
export function touchGeometry(key: string): boolean {
  const slot = slots.get(key);
  if (slot) slot.used = performance.now();
  return !!slot;
}

/** 그리기 시작을 알린다. 이 뒤에 꺼낸 것은 pruneGeometry가 버리지 않는다 */
export function beginGeometryFrame() {
  frameStart = performance.now();
}

/** idleMs 넘게 쓰지 않았고 마지막 화면에도 쓰지 않은 파일·푼 버전을 버린다. 받는 중인 파일은 둔다 */
export function pruneGeometry(idleMs: number) {
  const before = Math.min(frameStart, performance.now() - idleMs);
  for (const [key, slot] of slots) {
    if (slot.value === undefined) continue;
    if (slot.used < before) slots.delete(key);
    else if (slot.value instanceof LazyMap) slot.value.prune(before);
  }
}

/** 열쇠별로 처음 꺼낼 때 푸는 지도. 오래 쓰지 않은 것은 prune으로 버리고, 다시 꺼내면 원본에서 다시 푼다 */
export class LazyMap<V> {
  private readonly decoded = new Map<string, { value: V; used: number }>();
  private readonly makers: Map<string, () => V>;
  constructor(makers: Map<string, () => V>) {
    this.makers = makers;
  }
  get(key: string): V | undefined {
    const now = performance.now();
    const hit = this.decoded.get(key);
    if (hit) {
      hit.used = now;
      return hit.value;
    }
    const make = this.makers.get(key);
    if (!make) return undefined;
    const value = make();
    this.decoded.set(key, { value, used: now });
    return value;
  }
  prune(before: number) {
    for (const [key, d] of this.decoded) if (d.used < before) this.decoded.delete(key);
  }
}

/** 육지 조각 (대륙·섬 단위). 화면 밖 조각은 그리지 않으려고 나눠 둔다. */
export interface LandPiece {
  feature: Feature<Polygon>;
  bbox: BBox;
}

/**
 * d3는 구면 위의 고리 방향(시계 방향 = 안쪽)으로 면을 정하므로, 방향이 뒤집힌 면은 "그 도형을 뺀 지구 전체"가 되어
 * 화면이 한 색으로 덮인다. 단순화(특히 low 단계)나 도형 연산으로 생긴 가느다란 조각에서 방향이 뒤집힐 수 있어,
 * 불러올 때 반구보다 큰 면은 고리 방향을 뒤집고, 뒤집어도 이상하면 버린다.
 */
function fixWinding<G extends Feature['geometry'] | null>(geometry: G): G {
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) return geometry;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const fixed = polygons.flatMap((polygon) => {
    if (geoArea({ type: 'Polygon', coordinates: polygon }) <= 2 * Math.PI) return [polygon];
    const reversed = polygon.map((ring) => [...ring].reverse());
    return geoArea({ type: 'Polygon', coordinates: reversed }) <= 2 * Math.PI ? [reversed] : [];
  });
  return (geometry.type === 'Polygon'
    ? { type: 'MultiPolygon', coordinates: fixed }
    : { ...geometry, coordinates: fixed }) as G;
}

function fixFeature<F extends Feature>(f: F): F {
  return { ...f, geometry: fixWinding(f.geometry) };
}

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
  return cached(geoKeys.land(lod), async () => {
    const topo = await getJson<Topology<{ land: GeometryCollection }>>(`land-${lod}.topo.json`);
    const fc = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;
    return fc.features.map(fixFeature).flatMap((f) =>
      (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map((coordinates) => ({
        feature: { type: 'Feature' as const, properties: null, geometry: { type: 'Polygon' as const, coordinates } },
        bbox: ringBBox(coordinates[0]),
      })),
    );
  });
}

/** 받아 둔 육지 (없으면 undefined) */
export const landAt = (lod: Lod) => peek<LandPiece[]>(geoKeys.land(lod));

/** 한 나라의 모든 영토 버전 도형. key(`${entityId}@${from}`)로 찾으면 그때 그 버전만 푼다 */
export function loadEntityGeometry(lod: Lod, entityId: string): Promise<LazyMap<TerritoryFeature>> {
  return cached(geoKeys.entity(lod, entityId), async () => {
    const topo = await getJson<Topology<{ territories: GeometryCollection }>>(`geo/${lod}/${entityId}.topo.json`);
    return new LazyMap(
      new Map(topo.objects.territories.geometries.map((g) => [String(g.id), () => fixFeature(feature(topo, g) as TerritoryFeature)])),
    );
  });
}

/** 받아 둔 나라 도형 (없으면 undefined) */
export const entityAt = (lod: Lod, entityId: string) => peek<LazyMap<TerritoryFeature>>(geoKeys.entity(lod, entityId));

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

type TiledProps = { key?: string; b: BBox };
type TiledTopology = Topology<{ tiles: GeometryCollection<TiledProps>; lines: GeometryCollection<TiledProps> }>;
type TiledGeometry = TiledTopology['objects']['tiles']['geometries'][number] & { properties: TiledProps };

/** 조각 하나를 푼다. 칠하기용(tiles)만 고리 방향을 고친다 */
function toPiece(topo: TiledTopology, g: TiledGeometry, fill: boolean): Piece {
  const f = feature(topo, g) as Feature<Polygon | MultiPolygon, TiledProps>;
  return { feature: fill ? fixFeature(f) : f, bbox: g.properties.b };
}

export function loadLandTiled(lod: Lod): Promise<TiledGroup> {
  return cached(geoKeys.landTiled(lod), async () => {
    const topo = await getJson<TiledTopology>(`land-tiled-${lod}.topo.json`);
    return {
      tiles: (topo.objects.tiles.geometries as TiledGeometry[]).map((g) => toPiece(topo, g, true)),
      lines: (topo.objects.lines.geometries as TiledGeometry[]).map((g) => toPiece(topo, g, false)),
    };
  });
}

/** 받아 둔 육지 격자 조각 (없으면 undefined) */
export const landTiledAt = (lod: Lod) => peek<TiledGroup>(geoKeys.landTiled(lod));

/** 한 나라의 영토 버전별 격자 조각. key(`${entityId}@${from}`)로 찾으면 그때 그 버전만 푼다 */
export function loadEntityTiled(lod: Lod, entityId: string): Promise<LazyMap<TiledGroup>> {
  return cached(geoKeys.entityTiled(lod, entityId), async () => {
    const topo = await getJson<TiledTopology>(`geo-tiled/${lod}/${entityId}.topo.json`);
    const groups = new Map<string, { tiles: TiledGeometry[]; lines: TiledGeometry[] }>();
    const group = (key: string) => groups.get(key) ?? groups.set(key, { tiles: [], lines: [] }).get(key)!;
    for (const g of (topo.objects.tiles.geometries as TiledGeometry[])) if (g.properties.key) group(g.properties.key).tiles.push(g);
    for (const g of (topo.objects.lines.geometries as TiledGeometry[])) if (g.properties.key) group(g.properties.key).lines.push(g);
    return new LazyMap(
      new Map(
        [...groups].map(([key, gs]) => [
          key,
          () => ({ tiles: gs.tiles.map((g) => toPiece(topo, g, true)), lines: gs.lines.map((g) => toPiece(topo, g, false)) }),
        ]),
      ),
    );
  });
}

/** 받아 둔 나라 격자 조각 (없으면 undefined) */
export const entityTiledAt = (lod: Lod, entityId: string) => peek<LazyMap<TiledGroup>>(geoKeys.entityTiled(lod, entityId));

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
