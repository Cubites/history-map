// 정밀도 단계(LOD)별 TopoJSON 만들기 (DESIGN.md §5.3)
import { topology } from 'topojson-server';
import { quantize } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, GeometryObject, Topology } from 'topojson-specification';
import type { Lod } from '../../src/schema/index.ts';

const QUANTIZATION = 1e5;

/**
 * 단순화 기준 (도² 단위 삼각형 면적). 이보다 작은 굴곡은 지운다.
 * 성능 측정(DESIGN.md §3.1) 기준으로 움직이는 동안 그리는 점을 2만 개 안팎으로 맞춘 값.
 */
const SIMPLIFY_WEIGHT: Record<Lod, number | null> = { low: 0.1, mid: 0.002, high: null };

type Objects = { land: GeometryCollection; territories: GeometryCollection };

/**
 * 육지와 모든 영토 버전을 하나의 토폴로지로 묶는다. 이렇게 해야
 * - 이웃 나라가 공유하는 국경과, 버전 사이에 바뀌지 않은 국경이 한 번만 저장되고
 * - 단순화해도 공유 경계가 양쪽에서 똑같이 바뀌어 틈이나 겹침이 생기지 않는다.
 */
export function buildLodTopology(
  lod: Lod,
  land: FeatureCollection<Polygon | MultiPolygon>,
  territories: Feature<MultiPolygon, { key: string }>[],
): Topology<Objects> {
  const topo = topology(
    { land, territories: { type: 'FeatureCollection', features: territories } as FeatureCollection },
    QUANTIZATION,
  ) as unknown as Topology<Objects>;
  topo.objects.territories.geometries.forEach((g, i) => (g.id = territories[i].properties.key));
  const weight = SIMPLIFY_WEIGHT[lod];
  if (weight === null) return topo;
  // presimplify는 좌표를 풀어 두므로 단순화한 뒤 다시 양자화한다.
  return quantize(simplify(presimplify(topo), weight), QUANTIZATION) as Topology<Objects>;
}

type ArcRefs = number[] | number[][] | number[][][];

function remapArcs(refs: ArcRefs, map: Map<number, number>, picked: number[]): ArcRefs {
  if (typeof refs[0] !== 'number') return (refs as ArcRefs[]).map((r) => remapArcs(r, map, picked)) as ArcRefs;
  return (refs as number[]).map((ref) => {
    const index = ref < 0 ? ~ref : ref;
    let next = map.get(index);
    if (next === undefined) {
      next = picked.length;
      map.set(index, next);
      picked.push(index);
    }
    return ref < 0 ? ~next : next;
  });
}

/** 토폴로지에서 일부 도형만 골라, 쓰는 arc만 담은 작은 토폴로지를 만든다. */
export function subTopology(source: Topology, name: string, geometries: GeometryObject[]): Topology {
  const map = new Map<number, number>();
  const picked: number[] = [];
  const remapped = geometries.map((g) => {
    if (!('arcs' in g)) return g;
    return { ...g, arcs: remapArcs(g.arcs as ArcRefs, map, picked) } as GeometryObject;
  });
  return {
    type: 'Topology',
    ...(source.transform ? { transform: source.transform } : {}),
    arcs: picked.map((i) => source.arcs[i]),
    objects: { [name]: { type: 'GeometryCollection', geometries: remapped } },
  } as Topology;
}

/**
 * 격자 조각(칠하기)과 선 조각(테두리)을 한 토폴로지로 묶는다.
 * 조각의 가장자리와 테두리 선이 같은 arc를 공유해서 용량이 조각 나누기 전과 크게 다르지 않다.
 */
export function tiledTopology(tiles: Feature[], lines: Feature[]): Topology {
  return topology(
    {
      tiles: { type: 'FeatureCollection', features: tiles } as FeatureCollection,
      lines: { type: 'FeatureCollection', features: lines } as FeatureCollection,
    },
    QUANTIZATION,
  ) as unknown as Topology;
}

export function countPoints(topo: Topology): number {
  return topo.arcs.reduce((sum, arc) => sum + arc.length, 0);
}
