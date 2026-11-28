import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { geoContains, geoDistance } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import {
  activeTerritories,
  beginGeometryFrame,
  claimantsAt,
  entityAt,
  entityTiledAt,
  geoKeys,
  hasGeometry,
  landAt,
  landTiledAt,
  occupierAt,
  overlordAt,
  loadEntityGeometry,
  loadLand,
  loadLandTiled,
  loadEntityTiled,
  pruneGeometry,
  touchGeometry,
  type Piece,
  type StaticData,
  type TerritoryFeature,
} from '../data/staticData.ts';
import { focusTarget, placeActive } from '../lib/events.ts';
import { useWarShapes } from '../data/warShapes.ts';
import { activeWarView, dateKey, entryYear, factionColor, frontBattleSpots, majorWars, nearBy, snapshotFor, snapshotSpot } from '../lib/wars.ts';
import { formatRange } from '../lib/year.ts';
import { REGION_BUTTONS, REGION_FILTER_INFO, regionFocusBounds } from '../schema/regions.ts';
import { useRegionChoice } from '../search/RegionFilter.tsx';
import { LODS, type Lod, type TerritoryIndexEntry, type TheaterOut } from '../schema/index.ts';
import { activeEventId, useAppStore } from '../store/useAppStore.ts';
import { ArrowLayer } from './ArrowLayer.tsx';
import { FrontArrowLayer } from './FrontArrowLayer.tsx';
import { MajorEvents } from './MajorEvents.tsx';
import { WarMarkerLayer } from './WarMarkerLayer.tsx';
import { BattlePinLayer, type BattlePin } from './BattlePinLayer.tsx';
import { WarDetailLayer } from './WarDetailLayer.tsx';
import {
  drawMap,
  isVisible,
  visibleBounds,
  type DrawFront,
  type DrawTerritory,
  type Palette,
  type Shape,
} from './canvasLayer.ts';
import { LabelLayer } from './LabelLayer.tsx';
import { TextCanvasLayer } from './TextCanvasLayer.tsx';
import { layoutLabels } from './labelLayout.ts';
import { useElementSize } from './useElementSize.ts';
import { useFlatBar } from '../timeline/useFlatBar.ts';
import {
  baseScale,
  constrain,
  createProjection,
  DEFAULT_LON,
  EAST_ASIA_BOUNDS,
  fitBounds,
  fitFocus,
  invertPoint,
  MAX_ZOOM,
  MIN_ZOOM,
  normalizeLon,
  recenter,
  regionOfView,
  zoomAround,
  toGeoView,
  toView,
  type GeoView,
  type Size,
  type View,
} from './view.ts';

/** 움직임이 멈췄다고 보는 시간(ms). 이후 정밀한 단계로 다시 그린다 */
const SETTLE_MS = 150;
/** 이보다 적게 움직이고 뗀 누르기는 클릭으로 친다(px). d3-zoom의 clickDistance와 같은 값 */
const CLICK_DISTANCE = 4;
/** 선택·hover한 영토의 강조 테두리 두께(px) */
const SELECTED_WIDTH = 2.5;
const HOVER_WIDTH = 1.5;
/** 영토 파일을 받지 못했을 때 다시 시도하기까지의 시간(ms) */
const RETRY_MS = 5000;
/**
 * 받아 둔 도형을 이만큼(ms) 쓰지 않으면 버린다(2026-11-18, 메모리). 지금 화면에 쓰는 것은 버리지 않는다.
 * 다시 필요해지면 브라우저 캐시에서 다시 받는다(10분 안이면 내려받기 없음)
 */
const PRUNE_IDLE_MS = 60_000;
const PRUNE_EVERY_MS = 20_000;
/** 지도 위에 띄운 단추·블럭(.map-ui) 위의 포인터인가. 그 위에서는 지도가 강조·툴팁·끌기·휠·클릭에 반응하지 않는다(2026-10-27) */
const onMapUi = (target: EventTarget | null) => target instanceof Element && !!target.closest('.map-ui');

/**
 * 휴대폰은 지도가 나라 정보 판 뒤까지 깔리므로(2026-11-05, useBottomSheet.ts) 범위를 맞출 때는 판이 늘 가리는 아래쪽(.app의 --sheet-cover)을 뺀 크기로 맞춘다.
 * 그러면 범위가 판 위 보이는 곳 가운데에 온다(시점의 ty는 화면 위 끝 기준이라 줄인 크기로 구한 시점을 그대로 쓴다). PC는 판이 없어 그대로.
 * 전쟁 보기(2026-11-21부터 전쟁 정보도 같은 판)는 판이 접힘 단계(화면 높이 1/3)로 올라오는데, 여는 순간에는 판이 아직 내려가 있을 수 있어 접힌 높이만큼은 가린다고 본다(third)
 */
function visibleSize(size: Size, third = false): Size {
  const app = document.querySelector<HTMLElement>('.app');
  if (!app || !document.querySelector('.panel.sheet') || !window.matchMedia('(max-width: 768px)').matches) return size;
  const measured = parseFloat(getComputedStyle(app).getPropertyValue('--sheet-cover')) || 0;
  const cover = third ? Math.max(measured, Math.round(window.innerHeight / 3)) : measured;
  return { width: size.width, height: Math.max(120, size.height - cover) };
}

/** 휴대폰에서 나라 정보 판이 지도 아래쪽을 늘 가리는 높이(px). useBottomSheet.ts가 .app에 직접 적어 둔 --sheet-cover를 읽는다(판이 없는 PC는 0) */
function sheetCover(): number {
  const value = document.querySelector<HTMLElement>('.app')?.style.getPropertyValue('--sheet-cover');
  return value ? parseFloat(value) || 0 : 0;
}

/** 휴대폰 화면인가 (휴대폰 CSS와 같은 기준) */
const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/**
 * 나라로 옮길 때 쓸 그 해 영토 범위 (2026-11-11). 영토가 여럿이면(본토·떨어진 땅) 모두 합친 범위(box)와, 가장 큰 영토(main, 본토로 봄).
 * 그 해 영토가 없으면 null
 */
function focusBox(territories: TerritoryIndexEntry[], entityId: string, year: number) {
  const mine = activeTerritories(territories, year).filter((t) => t.entityId === entityId);
  if (mine.length === 0) return null;
  const area = (b: TerritoryIndexEntry['bbox']) => (b[2] - b[0]) * (b[3] - b[1]);
  const box: [number, number, number, number] = [
    Math.min(...mine.map((t) => t.bbox[0])),
    Math.min(...mine.map((t) => t.bbox[1])),
    Math.max(...mine.map((t) => t.bbox[2])),
    Math.max(...mine.map((t) => t.bbox[3])),
  ];
  return { box, main: mine.reduce((a, b) => (area(b.bbox) > area(a.bbox) ? b : a)) };
}

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

/** 원하는 단계가 없을 때 대신 쓸 순서. mid는 high를 먼저(움직이는 동안 mid를 새로 받지 않을 때 해안선이 거칠게 바뀌지 않게, 2026-11-18) */
const FALLBACK: Record<Lod, Lod[]> = { low: ['low', 'mid', 'high'], mid: ['mid', 'high', 'low'], high: ['high', 'mid', 'low'] };

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
    highlight: v('--fg'),
    frontLine: v('--front-line'),
  };
}

/** 권역 단추가 접힐 때 사라지는 움직임의 길이(ms). styles.css의 region-out 길이와 같아야 한다 */
const REGIONS_CLOSE_MS = 150;

export default function WorldMap({ data }: { data: StaticData }) {
  const [containerRef, measuredSize] = useElementSize<HTMLDivElement>();
  // 판이 가리는 높이(cover)를 크기에 붙여 넘긴다(2026-11-26): 세계 보기처럼 세계가 화면보다 낮을 때 판 위 보이는 곳 가운데에 오게(view.ts constrain).
  // 판 높이는 바뀔 수 있어 쓸 때마다 읽는다. 값은 coverRef에 두고, 판 높이가 바뀌면 아래 효과가 새 높이까지 부드럽게 바꿔 가며 지도를 따라 옮긴다
  const coverRef = useRef(sheetCover());
  const size = useMemo<Size | null>(() => (measuredSize ? { ...measuredSize, get cover() { return coverRef.current; } } : null), [measuredSize]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  // 전쟁 보기의 이름표가 겹치면 우선순위가 낮은 것을 숨긴다. 그릴 때마다(확대·이동 포함) 다시 맞춘다
  useLayoutEffect(() => {
    if (overlayRef.current) layoutLabels(overlayRef.current);
  });
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown>>(undefined);

  const year = useAppStore((s) => s.year);
  const selectedId = useAppStore((s) => s.selectedId);
  // 패널 나라 목록에서 마우스를 올린 나라(나라를 고르지 않았을 때만): 지도 위 hover와 같은 테두리
  const listHoverId = useAppStore((s) => (s.selectedId ? null : s.listHoverId));
  const hoveredEventId = useAppStore(activeEventId);
  const frontDate = useAppStore((s) => s.frontDate);
  const warId = useAppStore((s) => s.warId);
  const theaterId = useAppStore((s) => s.theaterId);
  const enterWar = useAppStore((s) => s.enterWar);
  const selectEntity = useAppStore((s) => s.select);
  const selectFocus = useAppStore((s) => s.selectFocus);
  const focusEvent = useAppStore((s) => s.focusEvent);
  const setYear = useAppStore((s) => s.setYear);
  const regionFilter = useAppStore((s) => s.regionFilter);
  // 휴대폰 가로 연도바 디자인(2026-11-25): 아래 줄(권역 · 연도 입력 · 축척)이 겹치지 않게 축척 막대를 짧게 잡는다
  const flatBar = useFlatBar();
  const regionFocus = useAppStore((s) => s.regionFocus);
  const chooseRegion = useRegionChoice();
  // 권역 단추(2026-10-28 휴대폰, 2026-11-21 PC도 같게): 평소에는 지금 권역 단추만 보이고, 누르면 다른 권역이 그 위에 펼쳐진다.
  // 펼친 뒤 어느 단추든 누르면 그 권역을 고르고 다시 접힌다. 밖을 눌러도 접힌다
  // 펼칠 때는 아래에서 위로 차례로 나타나고, 접을 때는 사라지는 움직임이 끝난 뒤에 접는다(2026-11-26, regionsClosing · styles.css .map-regions)
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [regionsClosing, setRegionsClosing] = useState(false);
  const regionsRef = useRef<HTMLDivElement>(null);
  const regionsTimer = useRef(0);
  const closeRegions = useCallback(() => {
    window.clearTimeout(regionsTimer.current);
    setRegionsClosing(true);
    regionsTimer.current = window.setTimeout(() => {
      setRegionsOpen(false);
      setRegionsClosing(false);
    }, REGIONS_CLOSE_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(regionsTimer.current), []);
  const pickRegion = (choose: () => void) => {
    // 접혀 있거나 접히는 중이면 (다시) 펼친다
    if (!regionsOpen || regionsClosing) {
      window.clearTimeout(regionsTimer.current);
      setRegionsClosing(false);
      setRegionsOpen(true);
      return;
    }
    closeRegions();
    choose();
  };
  useEffect(() => {
    if (!regionsOpen || regionsClosing) return;
    const close = (e: PointerEvent) => {
      if (!regionsRef.current?.contains(e.target as Node)) closeRegions();
    };
    // 지도 위의 다른 단추·연도 막대는 누름이 밖으로 퍼지지 않게 막으므로 퍼지기 전 단계(capture)에서 듣는다(2026-11-27)
    document.addEventListener('pointerdown', close, true);
    return () => document.removeEventListener('pointerdown', close, true);
  }, [regionsOpen, regionsClosing, closeRegions]);

  // 시점은 매 프레임 바뀌므로 ref에 두고, 화면 좌표 레이어(SVG)를 위해 프레임당 한 번 state로 복사한다.
  const viewRef = useRef<View>({ lon: DEFAULT_LON, k: 1, ty: 0, dx: 0 });
  const [view, setView] = useState<View>(viewRef.current);
  const movingRef = useRef(false);
  const [hovered, setHovered] = useState<{ id: string; x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geoVersion, setGeoVersion] = useState(0);
  // 강조 테두리는 Canvas에서 그리므로(그리기 함수가 매번 새로 만들어지지 않게) ref로 넘긴다
  const highlightRef = useRef<{ selected: string | null; hovered: string | null }>({ selected: null, hovered: null });
  highlightRef.current = { selected: selectedId, hovered: hovered?.id ?? listHoverId };

  const s0 = useMemo(() => (size ? baseScale(size) : 1), [size]);

  // 화면 크기가 정해지거나 바뀌면 시점을 다시 맞춘다. 처음에는 동아시아(권역 필터를 고른 주소면 그 권역)가 꽉 차게,
  // 주소에 나라가 있으면(바로 가기 링크, 2026-11-11) 아래 나라 이동과 같게 맞춘다: PC는 첫 화면 배율 그대로 본토를 가운데에(2026-11-12),
  // 휴대폰은 그 해 영토 전체가 보이게(fitFocus). 이후(창 크기 변경, 모바일 회전)에는 보던 곳과 배율을 유지한다.
  const sized = useRef<{ size: Size; s0: number } | null>(null);
  if (size && sized.current?.size !== size) {
    const prev = sized.current;
    const linked = !prev && selectedId && !warId ? focusBox(data.territories, selectedId, year) : null;
    const shown = visibleSize(size);
    const first = fitBounds(shown, s0, regionFocusBounds(regionFilter) ?? EAST_ASIA_BOUNDS);
    viewRef.current = prev
      ? toView(size, s0, toGeoView(prev.size, prev.s0, viewRef.current))
      : linked
        ? isMobile()
          ? fitFocus(shown, s0, linked.box)
          : toView(shown, s0, { lon: linked.main.anchor[0], lat: linked.main.anchor[1], k: first.k })
        : first;
    sized.current = { size, s0 };
  }
  const active = useMemo(() => activeTerritories(data.territories, year), [data.territories, year]);
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;

  // 전쟁 중이면 해당 나라들의 영토 대신 날짜별 전선으로 칠한다 (DESIGN.md §4.5)
  // 전쟁 보기는 사용자가 골랐을 때만 켜진다. 연도만 바꿔서는 켜지지 않는다 (DESIGN.md §4.5)
  const warView = useMemo(() => activeWarView(data.wars, warId, theaterId, year), [data.wars, warId, theaterId, year]);
  const war = warView?.war;
  const theater = warView?.theater;
  const snapshot = warView ? snapshotFor(warView, year, frontDate, hoveredEvent) : undefined;
  // 점령 지역 도형은 전쟁 보기를 열 때 따로 받는다 (받는 동안은 평소 영토를 그린다)
  const warShapes = useWarShapes(war?.id ?? null);
  /**
   * 전쟁 보기에서 나라 경계·이름표를 보일 항목 (2026-10-13): 지역 항목이나 그해 점령된 땅이 아닌 나라, 그리고 전역이 시작되기 전부터
   * 있던 항목(예: 1910년부터의 일제 강점기 한국). 전쟁 중에 생긴 점령 지역 항목(임진왜란 점령지·중일 전쟁 점령지·총독부 등)은
   * 연 단위 범위가 날짜별 점령선과 어긋나므로 뺀다
   */
  const isWarCountry = useCallback(
    (entityId: string) => {
      const e = data.entities.get(entityId);
      if (!e) return false;
      if (theater && e.from < theater.from) return true;
      return e.level !== 'region' && !occupierAt(data.relations, entityId, year);
    },
    [data.entities, data.relations, year, theater],
  );
  // 전쟁 보기가 없는 전쟁·전투 사건은 그 해에 싸운 곳만 작게 표시한다 (DESIGN.md §4.5).
  // 장소에 year(싸운 해, 기간이면 [from, to])가 있으면 그 해에만, 없으면 사건 기간 내내 보인다 (placeActive, 2026-10-06).
  // 권역 필터와 상관없이 늘 전부 보여 준다 (2026-10-27, 한 해에 많아야 11개라 부담이 없음).
  // 전쟁 보기에 이어진 사건(front)은 그 전역의 전투 목록에 없는 장소만 보여 준다 (2026-10-12: 세계 대전의 칭다오·유틀란트처럼
  // 전쟁 보기 범위 밖이거나 전투로 넣지 않은 곳이 어디에도 보이지 않던 문제)
  const battlePins = useMemo<BattlePin[]>(
    () =>
      warId
        ? []
        : data.events
            .filter((e) => e.year <= year && year <= (e.endYear ?? e.year))
            .flatMap((event) => {
              const covered = event.front ? frontBattleSpots(data.wars, event.front) : [];
              return (event.places ?? [])
                .filter((p) => placeActive(event, p, year) && !covered.some((b) => nearBy(b, p.at)))
                .map((p) => ({ event, name: p.name, at: p.at }));
            }),
    [data.events, data.wars, warId, year],
  );
  // "주요 전쟁" 목록에 있는 전쟁 가운데 그 해에 진행 중인 것은 주 전장(전역의 marker)에 전쟁 아이콘을 둔다(2026-11-22, 누르면 전쟁 보기).
  // 2026-10-27에 없앤 전쟁 표시 ⚔를 목록과 같은 규칙(권역·고른 나라)으로 되살린 것
  const warMarkers = useMemo(
    () => (warId ? [] : majorWars(data.wars, regionFilter, selectedId).filter(({ theater: t }) => t.from <= year && year <= t.to)),
    [data.wars, warId, regionFilter, selectedId, year],
  );
  const openBattlePin = (pin: BattlePin) => {
    // 그 해에 있던 나라 가운데 사건의 첫 주체를 골라 패널에 사건을 띄운다.
    // 그 해에 있던 주체가 없으면 사건 기간과 그 주체의 존재 기간이 겹치는 구간에서 가장 가까운 해로 옮긴다 (focusTarget)
    const target = focusTarget(pin.event, (id) => data.entities.get(id), year);
    if (!target) return;
    if (target.year !== year) setYear(target.year);
    focusEvent(target.subject, pin.event.id);
  };
  const frontShapes = useMemo(() => {
    if (!war || !theater || !snapshot || !warShapes) return undefined;
    // 도형은 따로 받은 wars/<전쟁 id>.json에서 (전역 → 스냅샷 순서 → 점령 지역 순서)
    const snapshotShapes = warShapes[theater.id]?.[theater.snapshots.indexOf(snapshot)];
    if (!snapshotShapes) return undefined;
    const lineBox = (line: [number, number][]): [number, number, number, number] => {
      const xs = line.map((p) => p[0]);
      const ys = line.map((p) => p[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    };
    const area = (a: { faction: string; bbox: [number, number, number, number] }, coordinates: unknown, rest: boolean) => ({
      entity: war.factions.find((f) => f.id === a.faction)?.entity ?? '',
      color: factionColor(war, a.faction, (id) => data.entities.get(id)?.color),
      rest,
      shape: { feature: { type: 'Feature', properties: null, geometry: { type: 'MultiPolygon', coordinates: coordinates ?? [] } }, bbox: a.bbox } as Shape,
    });
    // 전역 범위 밖 땅(2026-11-23, 예: 2차 대전의 소련 시베리아): 장면과 상관없이 늘 같은 도형을 먼저(아래에) 칠한다
    const restShapes = warShapes[`${theater.id}:rest`]?.[0];
    return {
      replaces: new Set(theater.replaces),
      areas: [...(theater.rest ?? []).map((a, i) => area(a, restShapes?.[i], true)), ...snapshot.areas.map((a, i) => area(a, snapshotShapes[i], false))],
      lines: snapshot.lines.map((line) => ({ feature: { type: 'Feature', properties: null, geometry: { type: 'LineString', coordinates: line } }, bbox: lineBox(line) }) as Shape),
    };
  }, [war, theater, snapshot, warShapes, data.entities]);
  // 전쟁 중 영토 대신 진영 색으로 칠하는 나라(replaces)도 이름표는 그 나라 자기 영토에 둔다 (2026-10-13, 같은 진영 나라들이 한 나라처럼
  // 보이지 않게). 자기 영토의 이름표 자리가 전역 범위 밖이면(예: 소련은 시베리아) 그 나라 진영의 점령 지역 안쪽에 둔다.
  // 점령 지역용 항목(지역 항목·그해 점령된 땅, 예: 임진왜란 점령지)은 연 단위 범위가 날짜별 점령선과 어긋나므로 숨긴다
  //
  // 장면이 이름표 바꿔 달기(labelAs)를 정했으면, 숨길 나라(instead)의 이름표를 빼고 그 장면 때 있던 나라의 이름표를 대신 단다
  // (2026-10-14: 1918년 3·7월에 영토 항목이 전쟁 뒤 나라뿐이라 독일 제국·오스트리아-헝가리 이름표가 없던 문제).
  // 위치는 장면이 `at`을 정했으면 그것, 아니면 그 나라의 마지막 영토 이름표 자리
  const labelTerritories = useMemo(() => {
    if (!snapshot || !theater) return active;
    const replaces = new Set(theater.replaces);
    const [[w, s], [e, n]] = theater.bounds;
    const inBounds = ([x, y]: [number, number]) => w <= x && x <= e && s <= y && y <= n;
    const swaps = snapshot.labelAs ?? [];
    const hidden = new Set(swaps.flatMap((l) => l.instead));
    const shown = active.flatMap((t) => {
      if (hidden.has(t.entityId)) return [];
      if (!replaces.has(t.entityId)) return [t];
      if (!isWarCountry(t.entityId)) return [];
      if (inBounds(t.anchor)) return [t];
      const anchor = snapshot.labels?.find((l) => l.entity === t.entityId)?.anchor;
      return anchor ? [{ ...t, anchor }] : [];
    });
    const swapped = swaps.flatMap((l) => {
      if (shown.some((t) => t.entityId === l.entity)) return [];
      const last = data.territories.filter((t) => t.entityId === l.entity).reduce<TerritoryIndexEntry | undefined>((m, t) => (!m || t.from > m.from ? t : m), undefined);
      return last ? [{ ...last, key: `label-as:${l.entity}`, anchor: l.at ?? last.anchor }] : [];
    });
    return [...shown, ...swapped];
  }, [active, snapshot, theater, isWarCountry, data.territories]);

  // ── 도형 불러오기 ─────────────────────────────────────────
  // 받은 도형은 staticData의 캐시에 두고 그릴 때 꺼낸다(entityAt 등). 오래 쓰지 않은 것은 주기적으로 버린다(D, 2026-11-18)
  /** 받지 못해 잠시(나라 영토) 또는 계속(격자 조각) 다시 받지 않을 파일 */
  const failed = useRef(new Set<string>());
  useEffect(() => {
    const timer = window.setInterval(() => pruneGeometry(PRUNE_IDLE_MS), PRUNE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, []);

  /**
   * 그 해 나라들의 영토와 육지를 받는다. 받았거나 받는 중이면 쓴 것으로만 친다(화면 밖 나라도 버리지 않게).
   * 움직이는 동안의 mid 단계는(B, 2026-11-18) 다른 단계라도 받아 둔 것이 있으면 받지 않고 그것으로 그린다(배율 4~12에서는 high와 그리는 시간이 비슷함).
   * low는 작고(640년 나라 전부 약 100KB) 넓게 볼 때 high보다 열 배 넘게 빨리 그리므로(세계 보기 9ms 대 150ms) 움직일 때 그대로 받는다
   */
  const ensureLoaded = useCallback(
    (lod: Lod, entityIds: string[], moving: boolean) => {
      const skip = (key: (l: Lod) => string) =>
        touchGeometry(key(lod)) || (moving && lod === 'mid' && LODS.some((l) => hasGeometry(key(l))));
      if (!skip(geoKeys.land)) {
        loadLand(lod)
          .then(() => setGeoVersion((v) => v + 1))
          .catch((e: Error) => setError(e.message));
      }
      for (const id of entityIds) {
        const key = geoKeys.entity(lod, id);
        if (failed.current.has(key) || skip((l) => geoKeys.entity(l, id))) continue;
        loadEntityGeometry(lod, id)
          .then(() => setGeoVersion((v) => v + 1))
          .catch((e: Error) => {
            // 한 나라의 한 단계 파일이 없어도 다른 단계로 대신 그리므로(featureFor) 지도 전체 오류로 띄우지 않는다.
            // 매 프레임 다시 요청하지 않도록 잠시 쉬었다가, 일시적인 실패(배포 직후 등)일 수 있으니 뒤에 다시 시도한다.
            console.warn(`영토 파일을 불러오지 못함 (${key}): ${e.message}`);
            failed.current.add(key);
            window.setTimeout(() => {
              failed.current.delete(key);
              setGeoVersion((v) => v + 1);
            }, RETRY_MS);
          });
      }
    },
    [],
  );

  /**
   * 격자 조각 (DESIGN.md §3.2): 확대했을 때만 받아서 보이는 조각만 그린다.
   * 화면에 보이는 나라의 조각만 받는다(A, 2026-11-18). 전에는 그 해 나라 전부의 조각을 받아 확대 한 번에 1~2MB를 내려받고 힙이 100MB 넘게 늘었다
   */
  const ensureTiled = useCallback((lod: Lod, entityIds: string[]) => {
    const request = (key: string, load: () => Promise<unknown>) => {
      if (failed.current.has(key) || touchGeometry(key)) return;
      load()
        .then(() => setGeoVersion((v) => v + 1))
        // 조각 파일이 없어도 원래 도형으로 그리므로 오류로 띄우지 않고, 다시 받지 않는다
        .catch((e: Error) => {
          failed.current.add(key);
          console.warn(`격자 조각을 불러오지 못함 (${key}): ${e.message}`);
        });
    };
    request(geoKeys.landTiled(lod), () => loadLandTiled(lod));
    for (const id of entityIds) request(geoKeys.entityTiled(lod, id), () => loadEntityTiled(lod, id));
  }, []);

  /** 원하는 단계가 아직 없으면 받아 둔 다른 단계로 대신 그린다 */
  const featureFor = useCallback((entry: TerritoryIndexEntry, lod: Lod) => {
    for (const l of FALLBACK[lod]) {
      const f = entityAt(l, entry.entityId)?.get(entry.key);
      if (f) return f;
    }
    return undefined;
  }, []);
  const landFor = useCallback((lod: Lod) => {
    for (const l of FALLBACK[lod]) {
      const pieces = landAt(l);
      if (pieces) return pieces;
    }
    return [];
  }, []);
  /** 격자 조각. 움직이는 동안에는 받아 둔 다른 단계(low 제외)로 대신한다(B) */
  const tiledFor = useCallback((entry: TerritoryIndexEntry, lod: Lod, moving: boolean) => {
    for (const l of moving ? FALLBACK[lod] : [lod]) {
      if (l === 'low') continue;
      const group = entityTiledAt(l, entry.entityId)?.get(entry.key);
      if (group) return group;
    }
    return undefined;
  }, []);
  const landTiledFor = useCallback((lod: Lod, moving: boolean) => {
    for (const l of moving ? FALLBACK[lod] : [lod]) {
      if (l === 'low') continue;
      const group = landTiledAt(l);
      if (group) return group;
    }
    return undefined;
  }, []);

  // ── 그리기 ────────────────────────────────────────────────
  const paletteRef = useRef<Palette | null>(null);
  const drawnRef = useRef<{ entry: TerritoryIndexEntry; feature: TerritoryFeature }[]>([]);
  const frame = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const v = viewRef.current;
    const moving = movingRef.current;
    let lod = lodFor(v.k, moving);
    beginGeometryFrame();
    const entityIds = [...new Set(active.map((t) => t.entityId))];
    const projection = createProjection(size, s0, v);
    const bounds = visibleBounds(projection, size, v);
    // 충분히 확대했을 때만 격자 조각을 쓴다. 넓게 볼 때는 건너뛸 조각이 적고 점만 늘어 오히려 느리다 (측정 결과)
    const tileView = !bounds.all && (bounds.e - bounds.w) * (bounds.n - bounds.s) <= TILE_VIEW_AREA;
    // 가볍게 끌기(2026-11-28): 권역 배율(움직일 때 mid 단계, 격자 조각을 쓰기 전)에서 끄는 동안은 low로 그린다.
    // 이 배율에서 mid는 받지 않고 받아 둔 high로 대신 그려(ensureLoaded) 한 프레임에 점 약 21만 개·200ms가 들었다(세계 배율의 low는 2.4만 개·21ms).
    // 손을 떼면 다시 세밀하게 그린다. 첫 끌기부터 가볍도록 멈춰 있을 때 low를 미리 받아 둔다(작음: 한 해 나라 전부 약 100KB)
    if (moving && lod === 'mid' && !tileView) lod = 'low';
    else if (!moving && !tileView) ensureLoaded('low', entityIds, false);
    ensureLoaded(lod, entityIds, moving);
    const useTiles = lod !== 'low' && tileView;
    // 조각은 멈췄을 때 화면에 보이는 나라 것만 받는다(A·B)
    if (useTiles && !moving) ensureTiled(lod, [...new Set(active.filter((t) => isVisible(t.bbox, bounds, v)).map((t) => t.entityId))]);
    const visiblePieces = (pieces: Piece[]) => pieces.filter((p) => isVisible(p.bbox, bounds, v));

    paletteRef.current ??= readPalette(canvas);
    const territories: DrawTerritory[] = [];
    const drawn: typeof drawnRef.current = [];
    const { selected, hovered: hoveredId } = highlightRef.current;
    let front: DrawFront | undefined;
    if (frontShapes) {
      const width = (id: string) => (id === selected ? SELECTED_WIDTH : id === hoveredId ? HOVER_WIDTH : undefined);
      front = {
        areas: frontShapes.areas.map((a) => ({ shapes: [a.shape], color: a.color, highlight: width(a.entity), rest: a.rest })),
        lines: frontShapes.lines,
        borders: [],
      };
    }
    for (const entry of active) {
      if (!isVisible(entry.bbox, bounds, v)) continue;
      const feature = featureFor(entry, lod);
      if (!feature) continue;
      const tiled = useTiles ? tiledFor(entry, lod, moving) : undefined;
      const plain = [{ feature, bbox: entry.bbox }];
      const shapes = tiled ? { fill: visiblePieces(tiled.tiles), stroke: visiblePieces(tiled.lines) } : { fill: plain, stroke: plain };
      if (front) {
        // 전쟁 보기: 진영 색 위에 그해 나라 경계를 다시 긋는다. 점령 지역용 항목(지역 항목·그해 점령된 땅)의 연 단위 경계는
        // 날짜별 점령선과 어긋나므로 긋지 않는다 (2026-10-13)
        if (isWarCountry(entry.entityId)) front.borders.push({ stroke: shapes.stroke, certainty: entry.certainty });
        // replaces 나라는 영토 대신 점령 지역을 칠한다
        if (frontShapes?.replaces.has(entry.entityId)) continue;
      }
      const occupier = occupierAt(data.relations, entry.entityId, year);
      const hatch = occupier && data.entities.get(occupier.object)?.color;
      const overlord = overlordAt(data.relations, entry.entityId, year);
      const border = overlord && data.entities.get(overlord.object)?.color;
      // 귀속 논쟁 지역: 후보 나라 색을 번갈아 빗금으로. 후보가 하나면 그 나라 색과 주인 없는 땅 색을 번갈아
      const claimants = claimantsAt(data.relations, entry.entityId, year);
      // 후보 나라를 고르면 선택 테두리에 논쟁 지역도 포함한다
      const isSelected = entry.entityId === selected || (!!selected && claimants.includes(selected));
      // 나라마다 고유색 그대로 칠한다(2026-11-26: 진하게·연하게·속국만 고르기를 없애고 진하게로 고정)
      const color = data.entities.get(entry.entityId)?.color ?? '#999999';
      const claimantColors = claimants.map((id) => data.entities.get(id)?.color ?? '#999999');
      const stripes = claimants.length ? (claimantColors.length > 1 ? claimantColors : [claimantColors[0], paletteRef.current?.land ?? '#d9d5cd']) : undefined;
      const isHovered = entry.entityId === hoveredId || (!!hoveredId && claimants.includes(hoveredId));
      const highlight = isSelected ? SELECTED_WIDTH : isHovered ? HOVER_WIDTH : undefined;
      const outline = highlight && tiled ? { fill: plain, stroke: plain } : undefined;
      territories.push({ ...shapes, color, certainty: entry.certainty, hatch, border, highlight, outline, stripes });
      // 클릭 판정과 hover 테두리는 원래 도형으로 한다
      drawn.push({ entry, feature });
    }
    // 점령 지역을 누르면 그 진영의 대표 나라를 고른다 (점령 지역은 영토 위에 그리므로 나중에 판정되도록 뒤에 넣는다)
    if (frontShapes) {
      for (const a of frontShapes.areas) {
        if (!a.entity) continue;
        const base = active.find((t) => t.entityId === a.entity) ?? active[0];
        if (!base) continue;
        drawn.push({ entry: { ...base, entityId: a.entity, key: `front:${a.entity}`, bbox: a.shape.bbox }, feature: a.shape.feature as TerritoryFeature });
      }
    }
    drawnRef.current = drawn;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paletteRef.current ??= readPalette(canvas);
    const tiledLand = useTiles ? landTiledFor(lod, moving) : undefined;
    const plainLand = landFor(lod).filter((p) => isVisible(p.bbox, bounds, v));
    const land = tiledLand ? { fill: visiblePieces(tiledLand.tiles), stroke: visiblePieces(tiledLand.lines) } : { fill: plainLand, stroke: plainLand };
    drawMap(ctx, projection, createProjection(size, s0, v, true), v, size, land, territories, paletteRef.current, front);
    // 이름표·화살표(SVG)도 방금 그린 지도와 같은 프레임에 맞춘다. 늦게 그리면 움직이는 동안 지도에서 밀려 보인다
    flushSync(() => setView(v));
  }, [size, s0, year, active, frontShapes, data.entities, data.relations, ensureLoaded, ensureTiled, featureFor, landFor, tiledFor, landTiledFor, isWarCountry]);

  const requestDraw = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => {
    requestDraw();
  }, [requestDraw, geoVersion, selectedId, hovered?.id, listHoverId]);

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
  /** 이번 누르기(d3-zoom start)를 시작할 때의 변환. 클릭인지 실제 이동인지 가른다 */
  const gestureStart = useRef<ZoomTransform>(zoomIdentity);
  const syncing = useRef(false);
  const settleTimer = useRef(0);
  /** 지도가 보여 주고 있는 전쟁 보기(`전쟁 id/전역 id`). 바뀌면 그 전역 범위로 옮긴다(아래 효과). followTheater는 옮기지 않으려고 먼저 맞춰 둔다 */
  const shownWar = useRef<string | null>(null);
  /** 단추·전쟁 보기 열기로 지도가 부드럽게 옮겨 가는 중인지(animateTo) */
  const flying = useRef(false);

  // 전역이 여럿인 전쟁 보기(제2차 세계 대전)에서는 지도가 멈추면 보는 곳에 맞춰 전역을 바꾼다(2026-11-23).
  // 화면 가운데가 다른 전역의 범위(bounds) 안이고 지금 전역의 범위 밖일 때만 바꾼다(두 범위 사이·바깥에서는 그대로).
  // 날짜는 지금 장면의 날짜와 같거나 그 앞의 마지막 장면(없으면 첫 장면)으로 맞추고, 지도는 옮기지 않는다(shownWar를 먼저 맞춰 둠).
  // 세계 개관처럼 목록에서 바로 들어가지 않는 전역(hideMarker)은 스스로 고른 것이므로 거기서는 바꾸지 않고, 그리로 바꾸지도 않는다
  const followTheater = useCallback(() => {
    const s = useAppStore.getState();
    if (!size) return;
    const view = activeWarView(data.wars, s.warId, s.theaterId, s.year);
    if (!view || view.theater.hideMarker) return;
    // 그 전역 범위로 옮겨 가기 전(처음 열 때)이나 옮겨 가는 중에는 바꾸지 않는다. 아직 앞 화면을 보고 있어 엉뚱한 전역으로 바뀐다
    if (flying.current || shownWar.current !== `${view.war.id}/${view.theater.id}`) return;
    const center = invertPoint(createProjection(size, s0, viewRef.current), [size.width / 2 + viewRef.current.dx, size.height / 2]);
    if (!center) return;
    const lon = normalizeLon(center[0]);
    const inside = (t: TheaterOut) => {
      const [[w, so], [e, n]] = t.bounds;
      return so <= center[1] && center[1] <= n && ((w <= lon && lon <= e) || (w <= lon + 360 && lon + 360 <= e));
    };
    if (inside(view.theater)) return;
    const next = view.war.theaters.find((t) => t !== view.theater && !t.hideMarker && inside(t));
    if (!next) return;
    const hovered = s.hoveredEventId ? data.events.find((e) => e.id === s.hoveredEventId) : undefined;
    const now = dateKey(snapshotFor(view, s.year, s.frontDate, hovered).date);
    const snap = [...next.snapshots].reverse().find((x) => dateKey(x.date) <= now) ?? next.snapshots[0];
    shownWar.current = `${view.war.id}/${next.id}`;
    useAppStore.setState({ theaterId: next.id, year: snap.year, frontDate: snap.date, listYear: null, hoveredEventId: null, pinnedEventId: null });
  }, [size, s0, data.wars, data.events]);

  // 지도가 멈추면 보는 곳에 맞춰 권역 단추를 고른다(2026-10-27). 지도 이동(regionFocus)은 일으키지 않는다.
  // 전쟁 보기 중에는 권역 단추가 없고 시점이 전쟁 지역에 묶이므로 고르지 않는다
  const followRegion = useCallback(() => {
    const { warId: inWar, regionFilter: current } = useAppStore.getState();
    if (!size) return;
    if (inWar) {
      followTheater();
      return;
    }
    const next = regionOfView(size, s0, viewRef.current);
    if (next !== current) useAppStore.setState({ regionFilter: next });
  }, [size, s0, followTheater]);
  // 처음 화면(동아시아)과 창 크기가 바뀐 뒤에도 맞춘다
  useEffect(() => followRegion(), [followRegion]);

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
        followRegion();
      }, SETTLE_MS);
    },
    [requestDraw, followRegion],
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
      .clickDistance(CLICK_DISTANCE)
      // 지도 위 단추·블럭(.map-ui)에서 누르거나 휠을 굴린 것은 지도 끌기·확대로 가져가지 않는다
      // (d3-zoom이 누름의 기본 동작을 막아 축척 막대 손잡이를 끌 수 없었음, 2026-10-27)
      .filter((event: MouseEvent) => {
        if ((event.ctrlKey && event.type !== 'wheel') || event.button) return false;
        return !onMapUi(event.target);
      })
      .on('start', () => {
        gestureStart.current = lastTransform.current;
        // 앞 동작의 멈춤 대기 중에 다시 눌렀으면 그대로 움직이는 중으로 이어 간다
        if (!syncing.current && movingRef.current) setMoving(true);
      })
      .on('zoom', (event: { transform: ZoomTransform }) => {
        if (syncing.current) return;
        const t0 = lastTransform.current;
        const t1 = event.transform;
        // 실제로 움직였을 때만 '움직이는 중'으로 친다. 누르기만 해도(start) 움직임으로 치면, 나라를 클릭해 고르거나
        // 풀 때 그 클릭의 다시 그리기가 가벼운 단계(배율 12 아래는 mid, 4 아래는 low)로 그려져 해안선·국경이 잠깐 뭉개져 보였다 (2026-11-02)
        const g0 = gestureStart.current;
        if (!movingRef.current && (t1.k !== g0.k || Math.hypot(t1.x - g0.x, t1.y - g0.y) > CLICK_DISTANCE)) setMoving(true);
        lastTransform.current = t1;
        // 새 화면 가운데에 올 점을, 옮기기 전 화면 좌표로 구한다 (끌기와 기준점 확대 모두 처리)
        const center: [number, number] = [size.width / 2, size.height / 2];
        const target = t0.apply(t1.invert(center)) as [number, number];
        if (t1.k === t0.k) viewRef.current = recenter(size, s0, viewRef.current, target, t1.k);
        else {
          // 확대 기준점(포인터): 확대 전후 변환에서 움직이지 않는 점
          const anchor: [number, number] = [
            (t0.x * t1.k - t1.x * t0.k) / (t1.k - t0.k),
            (t0.y * t1.k - t1.y * t0.k) / (t1.k - t0.k),
          ];
          viewRef.current = zoomAround(size, s0, viewRef.current, target, t1.k, anchor);
        }
        setHovered(null);
        requestDraw();
      })
      .on('end', () => {
        if (!syncing.current && movingRef.current) setMoving(false);
      });
    zoomRef.current = behavior;
    // 더블클릭은 나중에 지역 단위 드릴다운에 쓴다 (DESIGN.md §7).
    select(el).call(behavior).on('dblclick.zoom', null);
    syncZoom();
    return () => {
      select(el).on('.zoom', null);
    };
  }, [containerRef, size, s0, requestDraw, setMoving, syncZoom]);

  // 한 손가락 확대(2026-10-27): 빠르게 두 번 터치하고 두 번째 터치를 누른 채 움직이면, 위로 올릴수록 확대·내릴수록 축소한다
  // (2026-11-05 고침: 전에는 손가락이 화면 가운데에서 멀어질수록 확대). 확대 기준점은 판에 가리지 않은 지도 가운데(visibleSize).
  // 첫 터치를 '짧게 누름'으로 기억해 두고, 그 뒤 DOUBLE_TAP_MS 안에 가까운 곳을 다시 누르면 d3-zoom보다 먼저(캡처 단계) 받아 지도 끌기로 넘기지 않는다.
  // 터치로 생긴 지도 누름(나라·전쟁 아이콘 고르기)은 DOUBLE_TAP_MS 동안 미뤄 두고, 그 안에 두 번째 터치가 오면 버린다(2026-11-05):
  // 두 번 터치의 첫 터치로 나라·아이콘이 골라지지 않고, 확실한 한 번 터치일 때만 반응한다. 지도 위 단추(.map-ui)와 마우스 누름은 미루지 않는다
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !size) return;
    const DOUBLE_TAP_MS = 300;
    const TAP_MOVE = 12; // 짧게 누름으로 치는 움직임 한도(px)
    const TAP_NEAR = 40; // 두 번째 터치가 첫 터치에서 이만큼 안이어야 함(px)
    const PX_PER_E = 120; // 위로 이만큼 올릴 때마다 e(약 2.7)배
    const TOUCH_CLICK_MS = 800; // 터치가 끝난 뒤 이 안에 온 누름은 터치에서 생긴 것으로 친다(누름 이벤트에 pointerType이 없는 브라우저용)
    let tapStart: { x: number; y: number; t: number } | null = null;
    let lastTap: { x: number; y: number; t: number } | null = null;
    let gesture: { y0: number; view: View } | null = null;
    let lastTouchEnd = -Infinity;
    // 미뤄 둔 한 번 터치 누름. 시간이 지나면 같은 자리에 다시 보낸다(replaying 동안은 그대로 통과)
    let pending: { target: EventTarget; x: number; y: number; timer: number } | null = null;
    let replaying = false;
    const dropPending = () => {
      if (pending) clearTimeout(pending.timer);
      pending = null;
    };
    const local = (t: Touch) => {
      const r = el.getBoundingClientRect();
      return [t.clientX - r.left, t.clientY - r.top] as const;
    };
    const swallow = (e: TouchEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || onMapUi(e.target)) {
        tapStart = null;
        gesture = null;
        return;
      }
      const [x, y] = local(e.touches[0]);
      const now = performance.now();
      if (lastTap && now - lastTap.t < DOUBLE_TAP_MS && Math.hypot(x - lastTap.x, y - lastTap.y) < TAP_NEAR) {
        lastTap = null;
        tapStart = null;
        // 두 번 터치이므로 첫 터치의 누름(나라·아이콘 고르기)은 버린다
        dropPending();
        cancelAnimationFrame(animation.current);
        gesture = { y0: y, view: viewRef.current };
        setMoving(true);
        swallow(e);
        return;
      }
      tapStart = { x, y, t: now };
    };
    const onMove = (e: TouchEvent) => {
      if (!gesture) {
        if (tapStart && e.touches.length === 1) {
          const [x, y] = local(e.touches[0]);
          if (Math.hypot(x - tapStart.x, y - tapStart.y) > TAP_MOVE) tapStart = null;
        }
        return;
      }
      swallow(e);
      const [, y] = local(e.touches[0]);
      const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, gesture.view.k * Math.exp((gesture.y0 - y) / PX_PER_E)));
      const shown = visibleSize(size);
      const center: [number, number] = [shown.width / 2, shown.height / 2];
      viewRef.current = zoomAround(size, s0, gesture.view, center, k, center);
      setHovered(null);
      requestDraw();
    };
    const onEnd = (e: TouchEvent) => {
      lastTouchEnd = performance.now();
      if (gesture) {
        swallow(e);
        if (e.touches.length === 0) {
          gesture = null;
          syncZoom();
          setMoving(false);
        }
        return;
      }
      if (tapStart && e.touches.length === 0 && performance.now() - tapStart.t < DOUBLE_TAP_MS) lastTap = { ...tapStart, t: performance.now() };
      else lastTap = null;
      tapStart = null;
    };
    // 터치로 생긴 누름은 React(나라 고르기·전쟁 아이콘)에 닿기 전에 붙잡아 DOUBLE_TAP_MS 뒤에 다시 보낸다
    const onClick = (e: MouseEvent) => {
      if (replaying || onMapUi(e.target)) return;
      const touch = 'pointerType' in e && e.pointerType ? e.pointerType === 'touch' : performance.now() - lastTouchEnd < TOUCH_CLICK_MS;
      if (!touch || !e.target) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      dropPending();
      const target = e.target;
      const [x, y] = [e.clientX, e.clientY];
      pending = {
        target,
        x,
        y,
        timer: window.setTimeout(() => {
          pending = null;
          if (!(target instanceof Node) || !target.isConnected) return;
          replaying = true;
          try {
            target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
          } finally {
            replaying = false;
          }
        }, DOUBLE_TAP_MS),
      };
    };
    const opts = { capture: true, passive: false } as const;
    el.addEventListener('touchstart', onStart, opts);
    el.addEventListener('touchmove', onMove, opts);
    el.addEventListener('touchend', onEnd, opts);
    el.addEventListener('touchcancel', onEnd, opts);
    el.addEventListener('click', onClick, true);
    return () => {
      dropPending();
      el.removeEventListener('touchstart', onStart, opts);
      el.removeEventListener('touchmove', onMove, opts);
      el.removeEventListener('touchend', onEnd, opts);
      el.removeEventListener('touchcancel', onEnd, opts);
      el.removeEventListener('click', onClick, true);
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
      flying.current = true;
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
          flying.current = false;
          syncZoom();
          setMoving(false);
        }
      };
      animation.current = requestAnimationFrame(step);
    },
    [size, s0, draw, setMoving, syncZoom],
  );
  // 나라 정보 판의 높이가 바뀌면(내림 ↔ 접힘, 이름란 높이 변화) 그에 맞춰 지도를 옮긴다(2026-11-26).
  // 판이 가리는 높이(.app의 --sheet-cover)가 바뀌는 것을 지켜보다가, 판이 움직이는 시간(0.22초) 동안 가린 높이를 새 값까지 바꿔 가며 시점을 다시 맞춘다.
  // 옮겨지는 것은 세계가 보이는 곳보다 낮을 때(세계 보기)의 세로 가운데다(view.ts constrain). 확대해서 보던 곳은 그대로 둔다
  useEffect(() => {
    const app = document.querySelector<HTMLElement>('.app');
    if (!app || !size) return;
    // 처음(또는 화면 크기가 바뀐 뒤)에는 움직임 없이 바로 맞춘다
    coverRef.current = sheetCover();
    viewRef.current = constrain(size, s0, viewRef.current);
    requestDraw();
    let target = coverRef.current;
    let raf = 0;
    const observer = new MutationObserver(() => {
      const next = sheetCover();
      if (next === target) return;
      target = next;
      cancelAnimationFrame(raf);
      // 버튼 이동(animateTo) 중이면 그 움직임이 프레임마다 시점을 맞추므로 값만 바꾼다
      if (flying.current) {
        coverRef.current = next;
        return;
      }
      const from = coverRef.current;
      const start = performance.now();
      const DURATION = 220;
      movingRef.current = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        coverRef.current = from + (next - from) * e;
        viewRef.current = constrain(size, s0, viewRef.current);
        draw();
        if (t < 1) raf = requestAnimationFrame(step);
        else setMoving(false);
      };
      raf = requestAnimationFrame(step);
    });
    observer.observe(app, { attributes: true, attributeFilter: ['style'] });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      coverRef.current = target;
    };
  }, [size, s0, draw, requestDraw, setMoving]);
  // 전쟁 보기를 열면 전쟁 지역으로 확대하고, 닫으면 들어오기 전 위치로 돌아간다
  const beforeWar = useRef<View | null>(null);
  useEffect(() => {
    if (!size) return;
    const target = war && theater ? `${war.id}/${theater.id}` : null;
    if (target === shownWar.current) return;
    if (target && theater) {
      if (!shownWar.current) beforeWar.current = viewRef.current;
      animateTo(fitBounds(visibleSize(size, true), s0, theater.bounds));
    } else if (beforeWar.current) {
      animateTo(beforeWar.current);
      beforeWar.current = null;
    }
    shownWar.current = target;
  }, [war, theater, size, s0, animateTo]);
  // 권역 단추를 누르면 지도를 그 권역 범위로 한 번 옮긴다 (DESIGN.md §6.4.2).
  // '전체'는 옮기지 않고, 전쟁 보기 중에는 전쟁 지역을 보고 있으므로 옮기지 않는다 (닫으면 들어오기 전 위치로 돌아감)
  const shownRegionFocus = useRef(regionFocus);
  useEffect(() => {
    if (!size || regionFocus === shownRegionFocus.current) return;
    shownRegionFocus.current = regionFocus;
    const bounds = regionFocusBounds(regionFilter);
    if (bounds && !warId) animateTo(fitBounds(visibleSize(size), s0, bounds));
  }, [regionFocus, regionFilter, warId, size, s0, animateTo]);
  // 검색·패널·지도에서 나라(사건은 사건의 나라)를 고르면 그 나라의 그 해 영토로 옮긴다 (2026-11-11). 영토가 없는 해면 옮기지 않는다.
  // PC(2026-11-12): 확대·축소하지 않고 지금 배율 그대로 본토(가장 큰 영토)의 이름표 자리를 화면 가운데로 옮긴다
  // (떨어진 땅까지 합친 범위의 가운데는 바다일 수 있음).
  // 휴대폰: 그 해 영토 전체(본토·떨어진 땅을 합친 범위)가 보이게 알맞게 확대·축소한다(fitFocus).
  // 전쟁 보기 중에는 전쟁 지역을 보고 있으므로 옮기지 않는다(검색은 전쟁 보기를 먼저 닫으므로 옮김).
  // 전쟁 보기에서 나오며 들어오기 전 위치로 돌아가는 이동(위 효과)보다 뒤에 두어, 이 이동이 그것을 대신하게 한다
  const mapFocus = useAppStore((s) => s.mapFocus);
  const shownMapFocus = useRef(mapFocus?.n ?? 0);
  useEffect(() => {
    if (!size || !mapFocus || mapFocus.n === shownMapFocus.current) return;
    shownMapFocus.current = mapFocus.n;
    if (warId) return;
    const found = focusBox(data.territories, mapFocus.entityId, year);
    if (!found) return;
    const shown = visibleSize(size);
    animateTo(
      isMobile()
        ? fitFocus(shown, s0, found.box)
        : toView(shown, s0, { lon: found.main.anchor[0], lat: found.main.anchor[1], k: viewRef.current.k }),
    );
  }, [mapFocus, year, warId, data.territories, size, s0, animateTo]);
  // 전쟁 보기에서 확대해 보고 있을 때 다른 상황을 고르면(목록·상황 막대) 그 상황의 자리(지도 번호 핀, snapshotSpot)를 화면 가운데로 옮긴다(2026-11-23).
  // 배율은 그대로 둔다. 전역 전체가 보이는 배율(전쟁 보기를 열었을 때의 배율의 1.15배까지)에서는 옮기지 않는다.
  // 전쟁 보기를 열 때·전역이 바뀔 때(지도를 옮겨 전역이 따라 바뀐 경우 포함)는 상황이 바뀌어도 옮기지 않는다
  const shownSnapshot = useRef<string | null>(null);
  useEffect(() => {
    if (!size || !war || !theater || !snapshot) {
      shownSnapshot.current = null;
      return;
    }
    const scope = `${war.id}/${theater.id}/`;
    const key = scope + snapshot.date;
    const before = shownSnapshot.current;
    shownSnapshot.current = key;
    if (!before || before === key || !before.startsWith(scope)) return;
    const shown = visibleSize(size, true);
    if (viewRef.current.k <= fitBounds(shown, s0, theater.bounds).k * 1.15) return;
    const [lon, lat] = snapshotSpot(theater, snapshot);
    animateTo(toView(shown, s0, { lon, lat, k: viewRef.current.k }));
  }, [war, theater, snapshot, size, s0, animateTo]);
  // 전쟁 보기 중에 전쟁 기간 밖의 연도로 옮기면(사건 목록의 이동 등) 전쟁 보기를 닫는다
  useEffect(() => {
    if (!warId) return;
    if (!activeWarView(data.wars, warId, theaterId, year)) useAppStore.setState({ warId: null, theaterId: null, frontDate: null, returnYear: null });
  }, [warId, theaterId, year, data.wars]);

  // 오른쪽 아래 +, − 단추: 한 번에 1.6배씩 부드럽게(2026-10-27: 그 사이의 조절 막대는 없앰)
  const zoomStep = (factor: number) => {
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

  /** 누른 곳이 나라 이름표의 누름 칸이면 그 나라 id (LabelLayer mode="hit") */
  const labelEntity = (target: EventTarget | null) =>
    target instanceof Element ? (target.closest('.label-hit')?.getAttribute('data-entity') ?? null) : null;

  const localPoint = (e: React.MouseEvent | React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top] as const;
  };

  // ── 화면 좌표 레이어 (SVG) ─────────────────────────────────
  const projection = useMemo(() => (size ? createProjection(size, s0, view) : null), [size, s0, view]);
  const hoveredEntity = hovered ? data.entities.get(hovered.id) : undefined;
  const selectedEntity = selectedId ? data.entities.get(selectedId) : undefined;
  // 거리 축척(2026-10-27): 화면 가운데 가로 100px의 실제 거리로 1·2·5×10ⁿ km 가운데 막대가 최대 80px(휴대폰 가로 연도바 디자인은 56px) 안에 드는 가장 긴 값을 고른다
  const distanceScale = useMemo(() => {
    if (!size || !projection) return null;
    const [cx, cy] = [size.width / 2, size.height / 2];
    const a = invertPoint(projection, [cx - 50, cy]);
    const b = invertPoint(projection, [cx + 50, cy]);
    if (!a || !b) return null;
    const kmPerPx = (geoDistance(a, b) * 6371) / 100;
    if (!(kmPerPx > 0)) return null;
    const max = kmPerPx * (flatBar ? 56 : 80);
    const unit = 10 ** Math.floor(Math.log10(max));
    const km = [5, 2, 1].map((m) => m * unit).find((v) => v <= max) ?? unit;
    return { km, width: km / kmPerPx };
  }, [size, projection, flatBar]);

  return (
    <div
      ref={containerRef}
      className="world-map"
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || e.buttons) return;
        if (onMapUi(e.target)) {
          setHovered((h) => (h ? null : h));
          return;
        }
        const [x, y] = localPoint(e);
        const id = labelEntity(e.target) ?? hitTest(x, y);
        setHovered(id ? { id, x, y } : null);
      }}
      onPointerLeave={() => setHovered(null)}
      onClick={(e) => {
        if (onMapUi(e.target)) return;
        const [x, y] = localPoint(e);
        // 나라를 누르면 고르고 그 나라로 옮긴다(2026-11-11, selectFocus). 바다·빈 땅을 누르면 고름만 푼다.
        // 나라 이름을 눌러도 그 나라를 고른다(2026-11-12, 작은 나라를 고르기 쉽게. 이름이 이웃 나라 땅 위에 있어도 이름의 나라)
        const id = labelEntity(e.target) ?? hitTest(x, y);
        if (id) selectFocus(id);
        else selectEntity(null);
      }}
    >
      <canvas ref={canvasRef} className="map-canvas" />
      {size && projection && (
        <svg ref={overlayRef} className="map-overlay" width={size.width} height={size.height} aria-hidden>
          {/* 화살표는 글자(나라 이름, 전투·거점·지점 이름) 아래에 그린다(2026-11-23). 작전 화살표는 전투·진군로 글자가 든 WarDetailLayer보다 먼저,
              사건 화살표는 나라 이름표(아래의 글 LabelLayer)보다 먼저 */}
          {snapshot && war && <FrontArrowLayer war={war} snapshot={snapshot} projection={projection} entityColor={(id) => data.entities.get(id)?.color} />}
          {snapshot && war && theater && (
            <WarDetailLayer war={war} theater={theater} snapshot={snapshot} projection={projection} entityColor={(id) => data.entities.get(id)?.color} />
          )}
          <LabelLayer mode="hit" territories={labelTerritories} entities={data.entities} selectedId={selectedId} projection={projection} view={view} size={size} />
          {battlePins.length > 0 && <BattlePinLayer pins={battlePins} projection={projection} onOpen={openBattlePin} />}
          {warMarkers.length > 0 && (
            <WarMarkerLayer items={warMarkers} projection={projection} onOpen={({ war: w, theater: t }) => enterWar(w.id, t.id, year, null)} />
          )}
          {hoveredEvent && selectedId && (
            <ArrowLayer data={data} event={hoveredEvent} selectedId={selectedId} projection={projection} />
          )}
          <LabelLayer territories={labelTerritories} entities={data.entities} selectedId={selectedId} projection={projection} view={view} size={size} />
          {/* 위 층들의 SVG 글자(전쟁·전투·거점·진군로 이름, 화살표 설명)와 전쟁·전투 아이콘을 캔버스에 따라 그린다(2026-11-27, TextCanvasLayer.tsx).
              나라 이름표보다 위: 전쟁·전투 아이콘과 글자가 나라 이름에 가리지 않는다 */}
          <TextCanvasLayer size={size} />
        </svg>
      )}
      {hovered && hoveredEntity && (
        <div className="map-tooltip" style={{ left: hovered.x + 14, top: hovered.y + 14 }}>
          <strong>{hoveredEntity.names.ko}</strong>
          {(hoveredEntity.names.hanja ?? hoveredEntity.names.native) && <span className="hanja"> {hoveredEntity.names.hanja ?? hoveredEntity.names.native}</span>}
          <div>{formatRange(hoveredEntity.from, hoveredEntity.to)}</div>
        </div>
      )}
      {error && <div className="map-status map-status-error">지도를 불러오지 못했습니다: {error}</div>}
      {/* 선사 단계의 안내는 지도 위 창 대신 나라 정보 판의 안내 글로 보인다(2026-11-25, 사본 시험, EventPanel.tsx) */}
      {active.length === 0 && year >= data.timeline.range[0] && <div className="map-notice map-ui">이 시기의 영토 데이터는 아직 없습니다</div>}
      {/* 전쟁 보기의 이름·닫기(×, Esc)는 나라 정보 패널 자리의 전쟁 정보 패널에 있다(2026-11-21, panel/WarPanel.tsx). 전에는 지도 아래 가운데 '닫기' 띠 */}
      {/* 권역 단추(2026-10-18: 머리글 권역 필터를 없애고 이리로 옮김)(권역 고르기·자료 없는 해면 옮기기·그 권역으로 지도 이동).
          세계는 '전체'를 고르고 세계로 축소한다. 전쟁 보기 중에는 전역 단추가 그 자리에 오므로 숨긴다(2026-10-26) */}
      {/* 지도 왼쪽 위 "주요 전쟁" 단추와 목록(2026-10-27, 지도의 전쟁 표시 ⚔ 대신). 전쟁 보기 중에는 숨긴다 */}
      {!war && (
        <div className="map-top-left">
          <MajorEvents data={data} />
          {/* 사건 화살표 뜻(2026-10-28: 권역 단추 오른쪽에서 "주요 전쟁" 단추 오른쪽으로). 나라를 골랐을 때만 */}
          {selectedEntity && (
            <div className="map-legend map-ui">
              <span><i className="legend-in" />영향을 받은 경우</span>
              <span><i className="legend-out" />영향을 준 경우</span>
            </div>
          )}
        </div>
      )}
      {!war && (
        <div className="map-bottom-left">
        <div ref={regionsRef} className="map-controls map-regions map-ui" data-open={regionsOpen || undefined} data-closing={regionsClosing || undefined} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-pressed={regionFilter === 'all'}
            style={{ '--i': REGION_BUTTONS.length } as CSSProperties}
            onClick={() =>
              pickRegion(() => {
                chooseRegion('all');
                animateTo({ lon: viewRef.current.lon, lat: 0, k: MIN_ZOOM });
              })
            }
          >
            <span className="ui-bg" aria-hidden="true" />
            세계
          </button>
          {/* 권역 열 개(2026-11-21): 순서는 regions.ts REGION_BUTTONS, 누르면 그 권역의 focus(없으면 bounds)로 옮긴다 */}
          {REGION_BUTTONS.map((id, i) => (
            <button key={id} type="button" aria-pressed={regionFilter === id} style={{ '--i': REGION_BUTTONS.length - 1 - i } as CSSProperties} onClick={() => pickRegion(() => chooseRegion(id))}>
              <span className="ui-bg" aria-hidden="true" />
              {REGION_FILTER_INFO[id].short}
            </button>
          ))}
        </div>
        </div>
      )}
      {/* 전쟁 보기의 전역 단추(2026-10-26: 타임라인에서 지도 왼쪽 아래로 옮김). 전역 순서대로 위에서 아래로.
          2026-11-26: 권역 단추와 같게 평소에는 지금 전역만 보이고, 누르면 다른 전역이 그 위에 펼쳐지며, 고르거나 밖을 누르면 접힌다.
          권역 단추와 함께 뜨는 일이 없어 같은 상태(regionsOpen·regionsClosing)·ref·모양(.map-regions)을 함께 쓴다 */}
      {war && theater && war.theaters.length > 1 && (
        <div ref={regionsRef} className="map-controls map-regions map-theaters map-ui" role="group" aria-label="전역" data-open={regionsOpen || undefined} data-closing={regionsClosing || undefined} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {war.theaters.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={t.id === theater.id}
              style={{ '--i': war.theaters.length - 1 - i } as CSSProperties}
              onClick={() => pickRegion(() => (t.id === theater.id ? undefined : enterWar(war.id, t.id, entryYear(t, year), null)))}
            >
              <span className="ui-bg" aria-hidden="true" />
              {t.name}
            </button>
          ))}
        </div>
      )}
      <div className="map-zoom-wrap">
      <div className="map-zoom map-ui" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" aria-label="확대" onClick={() => zoomStep(1.6)}>+</button>
        <button type="button" aria-label="축소" onClick={() => zoomStep(1 / 1.6)}>−</button>
      </div>
      {distanceScale && (
        <div className="map-scale map-ui" aria-label={`축척: 막대 길이 ${distanceScale.km.toLocaleString('ko-KR')} km`}>
          <span>{distanceScale.km.toLocaleString('ko-KR')} km</span>
          <i style={{ width: distanceScale.width }} />
        </div>
      )}
      </div>
    </div>
  );
}
