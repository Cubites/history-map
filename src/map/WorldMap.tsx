import { useEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import { createProjection, EAST_ASIA, transformForBounds } from './projection';
import { useElementSize } from './useElementSize';

const MAX_ZOOM = 40;
const LAND_URL = `${import.meta.env.BASE_URL}data/base/land-50m.topo.json`;

type Zoomer = ZoomBehavior<SVGSVGElement, unknown>;

export default function WorldMap() {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<Zoomer>();
  const [land, setLand] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(LAND_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json() as Promise<Topology<{ land: GeometryCollection }>>;
      })
      .then((topo) => setLand(feature(topo, topo.objects.land) as FeatureCollection))
      .catch((e: Error) => setError(e.message));
  }, []);

  const projection = useMemo(() => (size ? createProjection(size) : null), [size]);

  const paths = useMemo(() => {
    if (!projection) return null;
    const path = geoPath(projection);
    return {
      sphere: path({ type: 'Sphere' }) ?? '',
      graticule: path(geoGraticule10()) ?? '',
      land: land ? path(land) ?? '' : '',
    };
  }, [projection, land]);

  const eastAsiaTransform = () =>
    projection && size ? transformForBounds(projection, size, EAST_ASIA, MAX_ZOOM) : zoomIdentity;

  // 확대/이동. 화면 크기가 바뀌면 투영이 새로 맞춰지므로 동아시아 시점으로 다시 맞춘다.
  useEffect(() => {
    if (!size || !projection || !svgRef.current) return;
    const svg = select(svgRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([[0, 0], [size.width, size.height]])
      .on('zoom', (event: { transform: ZoomTransform }) => {
        layerRef.current?.setAttribute('transform', event.transform.toString());
      });
    // 더블클릭은 나중에 지역 단위 드릴다운에 쓴다 (DESIGN.md §7).
    svg.call(behavior).on('dblclick.zoom', null);
    svg.call(behavior.transform, transformForBounds(projection, size, EAST_ASIA, MAX_ZOOM));
    zoomRef.current = behavior;
    return () => {
      svg.on('.zoom', null);
    };
  }, [size, projection]);

  const zoomBy = (factor: number) => {
    if (svgRef.current && zoomRef.current)
      select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor);
  };
  const zoomTo = (transform: ZoomTransform) => {
    if (svgRef.current && zoomRef.current)
      select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, transform);
  };

  return (
    <div ref={containerRef} className="world-map">
      {size && paths && (
        <svg ref={svgRef} width={size.width} height={size.height} role="img" aria-label="세계 지도">
          <g ref={layerRef}>
            <path className="map-ocean" d={paths.sphere} />
            <path className="map-graticule" d={paths.graticule} />
            <path className="map-land" d={paths.land} />
            <path className="map-outline" d={paths.sphere} />
          </g>
        </svg>
      )}
      {!land && !error && <div className="map-status">지도를 불러오는 중…</div>}
      {error && <div className="map-status map-status-error">지도를 불러오지 못했습니다: {error}</div>}
      <div className="map-controls">
        <button type="button" aria-label="확대" onClick={() => zoomBy(1.6)}>+</button>
        <button type="button" aria-label="축소" onClick={() => zoomBy(1 / 1.6)}>−</button>
        <button type="button" onClick={() => zoomTo(eastAsiaTransform())}>동아시아</button>
        <button type="button" onClick={() => zoomTo(zoomIdentity)}>세계</button>
      </div>
    </div>
  );
}
