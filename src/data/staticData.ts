import { useEffect, useState } from 'react';
import type { FeatureCollection, MultiPolygon } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type {
  AnchorIndex,
  Entity,
  HistoryEvent,
  LonLat,
  MapFeatureProps,
  Relation,
  TimelineIndex,
  TimelineInterval,
} from '../schema/index.ts';

export type LoadedEntity = Entity & { color: string };

export interface StaticData {
  timeline: TimelineIndex;
  entities: Map<string, LoadedEntity>;
  relations: Relation[];
  anchors: AnchorIndex;
  events: HistoryEvent[];
}

export type TerritoryCollection = FeatureCollection<MultiPolygon, MapFeatureProps>;

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
      getJson<LoadedEntity[]>('entities.json'),
      getJson<Relation[]>('relations.json'),
      getJson<AnchorIndex>('anchors.json'),
      getJson<HistoryEvent[]>('events.json'),
    ])
      .then(([timeline, entities, relations, anchors, events]) =>
        setData({ timeline, entities: new Map(entities.map((e) => [e.id, e])), relations, anchors, events }),
      )
      .catch((e: Error) => setError(e.message));
  }, []);

  return { data, error };
}

export function intervalAt(timeline: TimelineIndex, year: number): TimelineInterval | undefined {
  return timeline.intervals.find((i) => i.from <= year && year < i.to);
}

const intervalCache = new Map<string, Promise<TerritoryCollection>>();

/** 구간별 지도 파일. 한 번 받은 파일은 다시 받지 않는다. */
export function loadInterval(file: string): Promise<TerritoryCollection> {
  let pending = intervalCache.get(file);
  if (!pending) {
    pending = getJson<Topology<{ territories: GeometryCollection<MapFeatureProps> }>>(`map/${file}`).then(
      (topo) => feature(topo, topo.objects.territories) as TerritoryCollection,
    );
    pending.catch(() => intervalCache.delete(file));
    intervalCache.set(file, pending);
  }
  return pending;
}

/**
 * 화살표 기준점. 그 해의 영토를 쓰고, 그 해에 영토가 없으면(예: 멸망한 해) 시간상 가장 가까운 영토를 쓴다.
 */
export function anchorAt(anchors: AnchorIndex, entityId: string, year: number): LonLat | null {
  const versions = anchors[entityId];
  if (!versions?.length) return null;
  const distance = (v: { from: number; to: number | null }) =>
    year < v.from ? v.from - year : v.to !== null && year >= v.to ? year - v.to + 1 : 0;
  return versions.reduce((best, v) => (distance(v) < distance(best) ? v : best)).anchor;
}
