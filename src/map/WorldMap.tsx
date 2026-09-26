import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoContains, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import {
  activeTerritories,
  occupierAt,
  overlordAt,
  loadEntityGeometry,
  loadLand,
  loadLandTiled,
  loadEntityTiled,
  type LandPiece,
  type Piece,
  type TiledGroup,
  type StaticData,
  type TerritoryFeature,
} from '../data/staticData.ts';
import { formatRange } from '../lib/year.ts';
import type { Lod, TerritoryIndexEntry } from '../schema/index.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { ArrowLayer } from './ArrowLayer.tsx';
import {
  crossesSeam,
  drawMap,
  isVisible,
  visibleBounds,
  type DrawTerritory,
  type Palette,
} from './canvasLayer.ts';
import { LabelLayer } from './LabelLayer.tsx';
import { useElementSize } from './useElementSize.ts';
import {
  baseScale,
  constrain,
  createProjection,
  DEFAULT_LON,
  EAST_ASIA_BOUNDS,
  fitBounds,
  invertPoint,
  MAX_ZOOM,
  MIN_ZOOM,
  recenter,
  toGeoView,
  toView,
  type GeoView,
  type Size,
  type View,
} from './view.ts';

/** 움직임이 멈췄다고 보는 시간(ms). 이후 정밀한 단계로 다시 그린다 */
const SETTLE_MS = 150;

/**
 * 정밀도 단계 (DESIGN.md §3.1). 움직이는 동안에는 가볍게, 멈추거나 확대하면 정밀하게 그린다.
 * 확대할수록 화면 밖 영토를 건너뛰므로 정밀한 단계를 써도 계산량이 크게 늘지 않는다.
 */
function lodFor(k: number, moving: boolean): Lod {
  if (moving) return k < 4 ? 'low' : k < 12 ? 'mid' : 'high';
  return k < 2 ? 'mid' : 'high';
}
/**
 * 화면에 보이는 경위도 넓이(경도 폭 × 위도 폭, 도²)가 이 값 이하일 때 격자 조각을 쓴다 (DESIGN.md §3.2).
 * 조각은 자른 면과 따로 그리는 테두리 때문에 점이 약 2배라, 건너뛸 조각이 충분히 많을 만큼 확대했을 때만 이득이다.
 * 경도 폭만 보면 세로로 긴 화면(모바일)에서 너무 일찍 켜져 오히려 느려져서 넓이로 판단한다.
 */
const TILE_VIEW_AREA = 3000;

const FALLBACK: Record<Lod, Lod[]> ={ low: ['low', 'mid', 'high'], mid: ['mid', 'low', 'high'], high: ['high', 'mid', 'low'] };

function readPalette(el: Element): Palette {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    ocean: v('--ocean'),
    graticule: v('--graticule'),
    land: v('--land-unassigned'),
    landStroke: v('--land-stroke'),
    territoryStroke: v('--territory-stroke'),
    outline: v('--outline'),
  };
}

export default function WorldMap({ data }: { data: StaticData }) {
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>(undefined);

  const year = useAppStore((s) => s.year);
  const selectedId = useAppStore((s) => s.selectedId);
  const hoveredEventId = useAppStore((s) => s.hoveredEventId);
  const selectEntity = useAppStore((s) => s.select);

  // 시점은 매 프레임 바뀌므로 ref에 두고, 화면 좌표 레이어(SVG)를 위해 프레임당 한 번 state로 복사한다.
  const viewRef = useRef<View>({ lon: DEFAULT_LON, k: 1, ty: 0, dx: 0 });
  const [view, setView] = useState<View>(viewRef.current);
  const movingRef = useRef(false);
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoVersion, setGeoVersion] = useState(0);

  const s0 = useMemo(() => (size ? baseScale(size) : 1), [size]);

  // 화면 크기가 정해지거나 바뀌면 시점을 다시 맞춘다. 처음에는 동아시아가 꽉 차게,
  // 이후(창 크기 변경, 모바일 회전)에는 보던 곳과 배율을 유지한다.
  const sized = useRef<{ size: Size; s0: number } | null>(null);
  if (size && sized.current?.size !== size) {
    const prev = sized.current;
    viewRef.current = prev ? toView(size, s0, toGeoView(prev.size, prev.s0, viewRef.current)) : fitBounds(size, s0, EAST_ASIA_BOUNDS);
    sized.current = { size, s0 };
  }
  const active = useMemo(() => activeTerritories(data.territories, year), [data.territories, year]);

  // ── 도형 불러오기 ─────────────────────────────────────────
  const geo = useRef(new Map<string, Map<string, TerritoryFeature>>());
  const land = useRef(new Map<Lod, LandPiece[]>());
  /** 이미 요청한 파일. 매 프레임 같은 요청을 다시 걸지 않도록 기록한다 */
  const requested = useRef(new Set<string>());

  const ensureLoaded = useCallback(
    (lod: Lod, entityIds: string[]) => {
      if (!requested.current.has(`land/${lod}`)) {
        requested.current.add(`land/${lod}`);
        loadLand(lod)
          .then((pieces) => {
            land.current.set(lod, pieces);
            setGeoVersion((v) => v + 1);
          })
          .catch((e: Error) => {
            requested.current.delete(`land/${lod}`);
            setError(e.message);
          });
      }
      for (const id of entityIds) {
        const key = `${lod}/${id}`;
        if (requested.current.has(key)) continue;
        requested.current.add(key);
        loadEntityGeometry(lod, id)
          .then((m) => {
            geo.current.set(key, m);
            setGeoVersion((v) => v + 1);
          })
          .catch((e: Error) => {
            // 한 나라의 한 단계 파일이 없어도 다른 단계로 대신 그리므로(featureFor) 지도 전체 오류로 띄우지 않는다.
            // 매 프레임 다시 요청하지 않도록 요청 기록은 남겨 둔다.
            console.warn(`영토 파일을 불러오지 못함 (${key}): ${e.message}`);
          });
      }
    },
    [],
  );

  // 격자 조각 (DESIGN.md §3.2): 확대했을 때만 받아서 보이는 조각만 그린다
  const landTiled = useRef(new Map<Lod, TiledGroup>());
  const geoTiled = useRef(new Map<string, Map<string, TiledGroup>>());

  const ensureTiled = useCallback((lod: Lod, entityIds: string[]) => {
    const request = (key: string, load: () => Promise<void>) => {
      if (requested.current.has(key)) return;
      requested.current.add(key);
      load()
        .then(() => setGeoVersion((v) => v + 1))
        // 조각 파일이 없어도 원래 도형으로 그리므로 오류로 띄우지 않는다
        .catch((e: Error) => console.warn(`격자 조각을 불러오지 못함 (${key}): ${e.message}`));
    };
    request(`tiled/land/${lod}`, () => loadLandTiled(lod).then((g) => void landTiled.current.set(lod, g)));
    for (const id of entityIds)
      request(`tiled/${lod}/${id}`, () => loadEntityTiled(lod, id).then((m) => void geoTiled.current.set(`${lod}/${id}`, m)));
  }, []);

  /** 원하는 단계가 아직 없으면 받아 둔 다른 단계로 대신 그린다 */
  const featureFor = useCallback((entry: TerritoryIndexEntry, lod: Lod) => {
    for (const l of FALLBACK[lod]) {
      const f = geo.current.get(`${l}/${entry.entityId}`)?.get(entry.key);
      if (f) return f;
    }
    return undefined;
  }, []);
  const landFor = useCallback((lod: Lod) => {
    for (const l of FALLBACK[lod]) {
      const pieces = land.current.get(l);
      if (pieces) return pieces;
    }
    return [];
  }, []);

  // ── 그리기 ────────────────────────────────────────────────
  const paletteRef = useRef<Palette | null>(null);
  const drawnRef = useRef<{ entry: TerritoryIndexEntry; feature: TerritoryFeature }[]>([]);
  const frame = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const v = viewRef.current;
    const lod = lodFor(v.k, movingRef.current);
    const entityIds = [...new Set(active.map((t) => t.entityId))];
    ensureLoaded(lod, entityIds);
    const projection = createProjection(size, s0, v);
    const bounds = visibleBounds(projection, size, v);
    // 충분히 확대했을 때만 격자 조각을 쓴다. 넓게 볼 때는 건너뛸 조각이 적고 점만 늘어 오히려 느리다 (측정 결과)
    const useTiles = lod !== 'low' && !bounds.all && (bounds.e - bounds.w) * (bounds.n - bounds.s) <= TILE_VIEW_AREA;
    if (useTiles) ensureTiled(lod, entityIds);
    const visiblePieces = (pieces: Piece[]) => pieces.filter((p) => isVisible(p.bbox, bounds, v));

    const territories: DrawTerritory[] = [];
    const drawn: typeof drawnRef.current = [];
    for (const entry of active) {
      if (!isVisible(entry.bbox, bounds, v)) continue;
      const feature = featureFor(entry, lod);
      if (!feature) continue;
      const tiled = useTiles ? geoTiled.current.get(`${lod}/${entry.entityId}`)?.get(entry.key) : undefined;
      const plain = [{ feature, bbox: entry.bbox }];
      const shapes = tiled ? { fill: visiblePieces(tiled.tiles), stroke: visiblePieces(tiled.lines) } : { fill: plain, stroke: plain };
      const color = data.entities.get(entry.entityId)?.color ?? '#999999';
      const occupier = occupierAt(data.relations, entry.entityId, year);
      const hatch = occupier && data.entities.get(occupier.object)?.color;
      const overlord = overlordAt(data.relations, entry.entityId, year);
      const border = overlord && data.entities.get(overlord.object)?.color;
      territories.push({ ...shapes, color, certainty: entry.certainty, hatch, border });
      // 클릭 판정과 hover 테두리는 원래 도형으로 한다
      drawn.push({ entry, feature });
    }
    drawnRef.current = drawn;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paletteRef.current ??= readPalette(canvas);
    const tiledLand = useTiles ? landTiled.current.get(lod) : undefined;
    const plainLand = landFor(lod).filter((p) => isVisible(p.bbox, bounds, v));
    const land = tiledLand ? { fill: visiblePieces(tiledLand.tiles), stroke: visiblePieces(tiledLand.lines) } : { fill: plainLand, stroke: plainLand };
    drawMap(ctx, projection, createProjection(size, s0, v, true), v, size, land, territories, paletteRef.current);
    setView(v);
  }, [size, s0, year, active, data.entities, data.relations, ensureLoaded, ensureTiled, featureFor, landFor]);

  const requestDraw = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => {
    requestDraw();
  }, [requestDraw, geoVersion]);

  // 다크 모드 전환 시 색을 다시 읽는다
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      paletteRef.current = null;
      requestDraw();
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [requestDraw]);

  // 캔버스 크기 (고해상도 화면 대응)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    requestDraw();
  }, [size, requestDraw]);

  // ── 끌기·확대 ──────────────────────────────────────────────
  // d3-zoom은 끌기, 휠, 핀치 제스처만 담당한다. 이동량을 받아 도법 회전(중앙 경선 이동)으로 바꾼다.
  const lastTransform = useRef<ZoomTransform>(zoomIdentity);
  const syncing = useRef(false);
  const settleTimer = useRef(0);

  const setMoving = useCallback(
    (moving: boolean) => {
      window.clearTimeout(settleTimer.current);
      if (moving) {
        movingRef.current = true;
        return;
      }
      settleTimer.current = window.setTimeout(() => {
        movingRef.current = false;
        requestDraw();
      }, SETTLE_MS);
    },
    [requestDraw],
  );

  /** d3-zoom 내부 배율을 현재 시점과 맞춘다 (버튼으로 시점을 바꾼 뒤) */
  const syncZoom = useCallback(() => {
    const el = containerRef.current;
    if (!el || !zoomRef.current) return;
    syncing.current = true;
    const t = zoomIdentity.scale(viewRef.current.k);
    select(el).call(zoomRef.current.transform, t);
    lastTransform.current = t;
    syncing.current = false;
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !size) return;
    const behavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .clickDistance(4)
      .on('start', () => {
        if (!syncing.current) setMoving(true);
      })
      .on('zoom', (event: { transform: ZoomTransform }) => {
        if (syncing.current) return;
        const t0 = lastTransform.current;
        const t1 = event.transform;
        lastTransform.current = t1;
        // 새 화면 가운데에 올 점을, 옮기기 전 화면 좌표로 구한다 (끌기와 기준점 확대 모두 처리)
        const center: [number, number] = [size.width / 2, size.height / 2];
        const target = t0.apply(t1.invert(center)) as [number, number];
        viewRef.current = recenter(size, s0, viewRef.current, target, t1.k);
        setHovered(null);
        requestDraw();
      })
      .on('end', () => {
        if (!syncing.current) setMoving(false);
      });
    zoomRef.current = behavior;
    // 더블클릭은 나중에 지역 단위 드릴다운에 쓴다 (DESIGN.md §7).
    select(el).call(behavior).on('dblclick.zoom', null);
    syncZoom();
    return () => {
      select(el).on('.zoom', null);
    };
  }, [containerRef, size, s0, requestDraw, setMoving, syncZoom]);

  const animation = useRef(0);
  /** 경위도 시점으로 부드럽게 이동 (버튼). 한 프레임마다 지도 끝 붙이기 규칙을 적용한다 */
  const animateTo = useCallback(
    (target: GeoView | View) => {
      if (!size) return;
      cancelAnimationFrame(animation.current);
      const startView = viewRef.current;
      const from = toGeoView(size, s0, startView);
      const to = 'lat' in target ? target : toGeoView(size, s0, target);
      // 경도는 짧은 쪽으로 돈다
      const dLon = ((((to.lon - from.lon + 180) % 360) + 360) % 360) - 180;
      const start = performance.now();
      const DURATION = 500;
      movingRef.current = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const next = toView(size, s0, {
          lon: from.lon + dLon * e,
          lat: from.lat + (to.lat - from.lat) * e,
          k: from.k * (to.k / from.k) ** e,
        });
        // 세계가 화면보다 좁을 때의 가로 위치도 부드럽게 가운데로
        viewRef.current = constrain(size, s0, { ...next, dx: startView.dx * (1 - e) });
        draw();
        if (t < 1) animation.current = requestAnimationFrame(step);
        else {
          syncZoom();
          setMoving(false);
        }
      };
      animation.current = requestAnimationFrame(step);
    },
    [size, s0, draw, setMoving, syncZoom],
  );
  const zoomButton = (factor: number) => {
    if (size) animateTo({ ...toGeoView(size, s0, viewRef.current), k: viewRef.current.k * factor });
  };

  // ── 마우스·터치 ────────────────────────────────────────────
  const hitTest = useCallback(
    (x: number, y: number): string | null => {
      if (!size) return null;
      const lonLat = invertPoint(createProjection(size, s0, viewRef.current), [x, y]);
      if (!lonLat) return null;
      const [lon, lat] = lonLat;
      const drawn = drawnRef.current;
      for (let i = drawn.length - 1; i >= 0; i--) {
        const { entry, feature } = drawn[i];
        const [w, s, e, n] = entry.bbox;
        if (lat < s || lat > n) continue;
        if (e - w < 360 && (lon < w || lon > e)) continue;
        if (geoContains(feature, lonLat)) return entry.entityId;
      }
      return null;
    },
    [size, s0],
  );

  const localPoint = (e: React.MouseEvent | React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top] as const;
  };

  // ── 화면 좌표 레이어 (SVG) ─────────────────────────────────
  const projection = useMemo(() => (size ? createProjection(size, s0, view) : null), [size, s0, view]);
  const overlayLod = lodFor(view.k, false);
  const precise = useMemo(() => (size ? createProjection(size, s0, view, true) : null), [size, s0, view]);
  const sphereD = useMemo(() => (precise ? (geoPath(precise)({ type: 'Sphere' }) ?? '') : ''), [precise]);
  const overlayPath = (id: string | null) => {
    if (!id || !projection || !precise) return null;
    const entry = active.find((t) => t.entityId === id);
    const feature = entry && featureFor(entry, overlayLod);
    if (!entry || !feature) return null;
    return geoPath(crossesSeam(entry.bbox, view) ? precise : projection)(feature) ?? '';
  };
  const selectedShape = overlayPath(selectedId);
  const hoveredShape = overlayPath(hovered?.id ?? null);
  const hoveredEntity = hovered ? data.entities.get(hovered.id) : undefined;
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;

  return (
    <div
      ref={containerRef}
      className="world-map"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || e.buttons) return;
        const [x, y] = localPoint(e);
        const id = hitTest(x, y);
        setHovered(id ? { id, x, y } : null);
      }}
      onPointerLeave={() => setHovered(null)}
      onClick={(e) => {
        const [x, y] = localPoint(e);
        selectEntity(hitTest(x, y));
      }}
    >
      <canvas ref={canvasRef} className="map-canvas" />
      {size && projection && (
        <svg className="map-overlay" width={size.width} height={size.height} aria-hidden>
          <defs>
            <clipPath id="map-sphere-clip">
              <path d={sphereD} />
            </clipPath>
          </defs>
          {/* 강조 도형도 지구 테두리 밖으로 나가지 않게 자른다 */}
          <g clipPath="url(#map-sphere-clip)">
            {selectedShape && <path className="territory-selected" d={selectedShape} />}
            {hoveredShape && <path className="territory-hover" d={hoveredShape} />}
          </g>
          <LabelLayer territories={active} entities={data.entities} selectedId={selectedId} projection={projection} view={view} size={size} />
          {hoveredEvent && selectedId && (
            <ArrowLayer data={data} event={hoveredEvent} selectedId={selectedId} projection={projection} />
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
      {error && <div className="map-status map-status-error">지도를 불러오지 못했습니다: {error}</div>}
      {active.length === 0 && <div className="map-notice">이 시기의 영토 데이터는 아직 없습니다</div>}
      <div className="map-controls" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" className="map-zoom-button" aria-label="확대" onClick={() => zoomButton(1.6)}>+</button>
        <button type="button" className="map-zoom-button" aria-label="축소" onClick={() => zoomButton(1 / 1.6)}>−</button>
        <button type="button" onClick={() => size && animateTo(fitBounds(size, s0, EAST_ASIA_BOUNDS))}>동아시아</button>
        <button type="button" onClick={() => animateTo({ lon: viewRef.current.lon, lat: 0, k: MIN_ZOOM })}>세계</button>
      </div>
    </div>
  );
}
