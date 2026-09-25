import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import { dataUrl, intervalAt, loadInterval, type StaticData, type TerritoryCollection } from '../data/staticData.ts';
import { formatRange } from '../lib/year.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { ArrowLayer } from './ArrowLayer.tsx';
import { LabelLayer } from './LabelLayer.tsx';
import { createProjection, EAST_ASIA, transformForBounds } from './projection.ts';
import { TerritoryLayer, type DrawnTerritory } from './TerritoryLayer.tsx';
import { useElementSize } from './useElementSize.ts';

const MAX_ZOOM = 40;

type Zoomer = ZoomBehavior<SVGSVGElement, unknown>;

export default function WorldMap({ data }: { data: StaticData }) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<Zoomer>(undefined);
  const [land, setLand] = useState<FeatureCollection | null>(null);
  const [territories, setTerritories] = useState<TerritoryCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null);

  const year = useAppStore((s) => s.year);
  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredEventId = useAppStore((s) => s.hoveredEventId);
  const selectEntity = useAppStore((s) => s.select);

  useEffect(() => {
    fetch(dataUrl('base-land-50m.topo.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json() as Promise<Topology<{ land: GeometryCollection }>>;
      })
      .then((topo) => setLand(feature(topo, topo.objects.land) as FeatureCollection))
      .catch((e: Error) => setError(e.message));
  }, []);

  // 연도가 바뀌면 그 구간의 지도 파일을 불러온다. 불러오는 동안에는 이전 지도를 그대로 보여준다.
  const interval = intervalAt(data.timeline, year);
  useEffect(() => {
    if (!interval?.file) {
      setTerritories(null);
      return;
    }
    let cancelled = false;
    loadInterval(interval.file)
      .then((fc) => !cancelled && setTerritories(fc))
      .catch((e: Error) => !cancelled && setError(e.message));
    // 앞뒤 구간을 미리 받아 둔다
    const i = data.timeline.intervals.indexOf(interval);
    for (const neighbor of [data.timeline.intervals[i - 1], data.timeline.intervals[i + 1]])
      if (neighbor?.file) loadInterval(neighbor.file).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [interval, data.timeline]);

  const projection = useMemo(() => (size ? createProjection(size) : null), [size]);

  const base = useMemo(() => {
    if (!projection) return null;
    const path = geoPath(projection);
    return {
      sphere: path({ type: 'Sphere' }) ?? '',
      graticule: path(geoGraticule10()) ?? '',
      land: land ? (path(land) ?? '') : '',
    };
  }, [projection, land]);

  const drawn = useMemo(() => {
    if (!projection || !territories) return [];
    const path = geoPath(projection);
    return territories.features.map((f) => ({
      entityId: f.properties.entityId,
      certainty: f.properties.certainty,
      anchor: f.properties.anchor,
      d: path(f) ?? '',
      bounds: path.bounds(f),
      color: data.entities.get(f.properties.entityId)?.color ?? '#999999',
    }));
  }, [projection, territories, data.entities]);

  // 확대/이동. 화면 크기가 바뀌면 투영이 새로 맞춰지므로 동아시아 시점으로 다시 맞춘다.
  useEffect(() => {
    if (!size || !projection || !svgRef.current) return;
    const svg = select(svgRef.current);
    let frame = 0;
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([[0, 0], [size.width, size.height]])
      .on('zoom', (event: { transform: ZoomTransform }) => {
        // 영토 레이어는 속성만 바꾸고, 화면 좌표 레이어(이름표·화살표)는 프레임당 한 번만 다시 그린다.
        layerRef.current?.setAttribute('transform', event.transform.toString());
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => setTransform(event.transform));
      });
    // 더블클릭은 나중에 지역 단위 드릴다운에 쓴다 (DESIGN.md §7).
    svg.call(behavior).on('dblclick.zoom', null);
    svg.call(behavior.transform, transformForBounds(projection, size, EAST_ASIA, MAX_ZOOM));
    zoomRef.current = behavior;
    return () => {
      cancelAnimationFrame(frame);
      svg.on('.zoom', null);
    };
  }, [size, projection]);

  const zoomBy = (factor: number) => {
    if (svgRef.current && zoomRef.current) select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor);
  };
  const zoomTo = (t: ZoomTransform) => {
    if (svgRef.current && zoomRef.current) select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, t);
  };

  // 툴팁 위치. mouseenter가 첫 mousemove보다 먼저 올 수 있어 포인터 위치는 항상 기록해 둔다.
  const pointer = useRef({ x: 0, y: 0 });
  const onHover = useCallback((id: string | null) => setHovered(id ? { id, ...pointer.current } : null), []);
  const onSelect = useCallback((id: string) => selectEntity(id), [selectEntity]);

  const hoveredTerritory = hovered && drawn.find((t) => t.entityId === hovered.id);
  const selectedTerritory = selectedId ? drawn.find((t) => t.entityId === selectedId) : undefined;
  const hoveredEntity = hovered ? data.entities.get(hovered.id) : undefined;
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;

  return (
    <div ref={containerRef} className="world-map">
      {size && base && projection && (
        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          role="img"
          aria-label="세계 지도"
          onClick={() => selectEntity(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            if (hovered) setHovered({ id: hovered.id, ...pointer.current });
          }}
        >
          <g ref={layerRef}>
            <path className="map-ocean" d={base.sphere} />
            <path className="map-graticule" d={base.graticule} />
            <path className="map-land" d={base.land} />
            <TerritoryLayer territories={drawn} onHover={onHover} onSelect={onSelect} />
            {selectedTerritory && <path className="territory-selected" d={selectedTerritory.d} />}
            {hoveredTerritory && <HoverLift key={hoveredTerritory.entityId} territory={hoveredTerritory} />}
            <path className="map-outline" d={base.sphere} />
          </g>
          <LabelLayer territories={drawn} entities={data.entities} selectedId={selectedId} projection={projection} transform={transform} />
          {hoveredEvent && selectedId && (
            <ArrowLayer data={data} event={hoveredEvent} selectedId={selectedId} projection={projection} transform={transform} />
          )}
        </svg>
      )}
      {hovered && hoveredEntity && (
        <div className="map-tooltip" style={{ left: hovered.x + 14, top: hovered.y + 14 }}>
          <strong>{hoveredEntity.names.ko}</strong>
          {hoveredEntity.names.hanja && <span className="hanja"> {hoveredEntity.names.hanja}</span>}
          <div>{formatRange(hoveredEntity.from, hoveredEntity.to)}</div>
        </div>
      )}
      {!land && !error && <div className="map-status">지도를 불러오는 중…</div>}
      {error && <div className="map-status map-status-error">지도를 불러오지 못했습니다: {error}</div>}
      {interval && !interval.file && <div className="map-notice">이 시기의 영토 데이터는 아직 없습니다</div>}
      <div className="map-controls">
        <button type="button" aria-label="확대" onClick={() => zoomBy(1.6)}>+</button>
        <button type="button" aria-label="축소" onClick={() => zoomBy(1 / 1.6)}>−</button>
        <button type="button" onClick={() => projection && size && zoomTo(transformForBounds(projection, size, EAST_ASIA, MAX_ZOOM))}>
          동아시아
        </button>
        <button type="button" onClick={() => zoomTo(zoomIdentity)}>세계</button>
      </div>
    </div>
  );
}

/**
 * hover한 영토를 맨 위 레이어에 복제해 살짝 키운다 (DESIGN.md §6.1).
 * 원본 순서를 바꾸지 않으므로 이웃 영토에 가려지지 않으면서도 다시 그릴 필요가 없다.
 */
function HoverLift({ territory }: { territory: DrawnTerritory }) {
  return <path className="territory-lift" d={territory.d} fill={territory.color} />;
}
