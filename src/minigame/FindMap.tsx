// 미니게임의 움직이는 지도 (2026-11-18, 처음에는 '나라 찾기'용. 지금은 세 게임 모두 쓴다). 역사 지도처럼 끌어서 옮기고 휠·두 손가락으로 확대한다.
// 시점 계산은 본 지도의 것(map/view.ts)을 그대로 쓴다: 권역 단추를 눌렀을 때의 화면(fitBounds)과 세계 화면(배율 1)이 본 지도와 같다.
// 본 지도(WorldMap)는 건드리지 않는다. 이름표는 그리지 않고, 답한 뒤 labels로 받은 나라에만 붙인다.
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { geoContains, geoPath, type GeoProjection } from 'd3-geo';
import { loadEntityGeometry, loadLand, type LandPiece, type TerritoryFeature } from '../data/staticData.ts';
import { useElementSize } from '../map/useElementSize.ts';
import { DEFAULT_LON, MAX_ZOOM, MIN_ZOOM, baseScale, constrain, createProjection, fitBounds, fitFocus, invertPoint, recenter, toGeoView, toView, zoomAround, type Size, type View } from '../map/view.ts';
import type { LonLat } from '../schema/index.ts';

export interface MapItem {
  /** 나라 id (누르면 이 값을 알려 준다) */
  id: string;
  /** 영토 도형의 열쇠 (territories.json의 key) */
  key: string;
  color: string;
  anchor: LonLat;
  bbox: [number, number, number, number];
}

export type Bounds = [[number, number], [number, number]];

interface Props {
  /** 그릴 나라들. 앞의 것부터 그리므로 넓은 나라를 앞에 둔다 */
  items: MapItem[];
  /** 처음 화면: 권역 범위(본 지도의 권역 단추와 같은 화면), 세계, 또는 한 나라의 범위(bbox, 둘레가 함께 보이게 조금 물러난다) */
  start: Bounds | 'world' | { bbox: [number, number, number, number] };
  /** 참이면 mainId 나라의 국경선만 그리고(육지·바다·색 없음) 옮기기·확대를 막는다 (어려움의 처음 모습) */
  bare?: boolean;
  /** 참이면 멀리서 볼 때도 중간 정밀도 도형을 쓴다 (한 나라의 모양을 보여 주는 문제용) */
  detail?: boolean;
  /** 굵은 강조 테두리로 표시할 나라 (맞닿은 나라 힌트) */
  highlightId?: string;
  /** 고르는 중인 나라 (나라 찾기의 '이 국가를 선택하시겠습니까?' 동안): 굵은 테두리로 표시한다 */
  pendingId?: string | null;
  /** 주면 배율은 그대로 두고 그 자리가 화면 가운데에 오게 옮긴다 (고르는 중인 나라의 이름표 자리) */
  centerOn?: LonLat | null;
  /** 주면 그 범위로 화면을 옮긴다 (답한 뒤 정답 나라로) */
  focus?: [number, number, number, number] | null;
  /** 주면 그 권역 화면으로 옮긴다 (권역 힌트를 열었을 때. 본 지도의 권역 단추와 같은 화면) */
  area?: Bounds | null;
  /** 진한 테두리로 그릴 나라 (답한 뒤의 정답) */
  mainId?: string;
  /** 이름표를 붙일 나라 (id → 이름) */
  labels?: Record<string, string>;
  onPick?: (id: string) => void;
}

const NO_LABELS: Record<string, string> = {};
const clampZoom = (k: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, k));

export function FindMap({ items, start, focus, area, mainId, labels = NO_LABELS, onPick, bare = false, detail = false, highlightId, pendingId, centerOn }: Props) {
  const bareRef = useRef(bare);
  bareRef.current = bare;
  const [ref, size] = useElementSize<HTMLDivElement>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View | null>(null);
  const [land, setLand] = useState<LandPiece[] | null>(null);
  const [shapes, setShapes] = useState<Map<string, TerritoryFeature>>(new Map());
  const proj = useRef<GeoProjection | null>(null);
  // 끌기·확대 계산이 늘 최신 크기를 쓰게 한다
  const sizeRef = useRef<Size | null>(null);
  sizeRef.current = size ?? null;

  // 멀리서 볼 때는 거친 도형, 가까이서는 중간 도형 (본 지도와 같은 자료)
  const lod = detail || (view && view.k >= 3) ? 'mid' : 'low';

  // 처음 화면을 잡고, 창 크기가 바뀌면 지도 끝이 화면 밖으로 나가지 않게 다시 맞춘다
  useEffect(() => {
    if (!size) return;
    const s0 = baseScale(size);
    const first = (): View => {
      if (start === 'world') return toView(size, s0, { lon: DEFAULT_LON, lat: 0, k: MIN_ZOOM });
      if (Array.isArray(start)) return fitBounds(size, s0, start);
      // 한 나라: 영토가 화면에 맞는 시점에서 조금 물러나 둘레가 함께 보이게 한다
      const g = toGeoView(size, s0, fitFocus(size, s0, start.bbox));
      return toView(size, s0, { ...g, k: Math.max(MIN_ZOOM, g.k * 0.6) });
    };
    setView((v) => (v ? constrain(size, s0, v) : first()));
  }, [size, start]);

  useEffect(() => {
    const s = sizeRef.current;
    if (focus && s) setView(fitFocus(s, baseScale(s), focus));
  }, [focus]);

  useEffect(() => {
    const s = sizeRef.current;
    if (area && s) setView(fitBounds(s, baseScale(s), area));
  }, [area]);

  useEffect(() => {
    const s = sizeRef.current;
    if (!centerOn || !s) return;
    const s0 = baseScale(s);
    setView((cur) => cur && toView(s, s0, { ...toGeoView(s, s0, cur), lon: centerOn[0], lat: centerOn[1] }));
  }, [centerOn]);

  useEffect(() => {
    let on = true;
    loadLand(lod).then((l) => on && setLand(l)).catch(() => {});
    return () => {
      on = false;
    };
  }, [lod]);

  // 나라 도형 받기. 새로 다 받을 때까지는 앞의 도형을 그대로 보여 깜박이지 않게 한다
  useEffect(() => {
    let on = true;
    Promise.all(items.map(async (it) => [it.key, (await loadEntityGeometry(lod, it.id)).get(it.key)] as const))
      .then((got) => on && setShapes(new Map(got.filter((g): g is [string, TerritoryFeature] => g[1] !== undefined))))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [items, lod]);

  useEffect(() => {
    const el = canvas.current;
    if (!el || !size || !view) return;
    const { width, height } = size;
    const dpr = window.devicePixelRatio || 1;
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    const ctx = el.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(el);
    const v = (name: string) => css.getPropertyValue(name).trim();
    const s0 = baseScale(size);
    const projection = createProjection(size, s0, view);
    proj.current = projection;
    const path = geoPath(projection, ctx);

    if (bare) {
      // 빈 바탕에 문제 나라의 국경선만
      ctx.fillStyle = v('--surface');
      ctx.fillRect(0, 0, width, height);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = v('--fg');
      ctx.lineWidth = 1.6;
      for (const it of items) {
        const feature = it.id === mainId ? shapes.get(it.key) : undefined;
        if (!feature) continue;
        ctx.beginPath();
        path(feature);
        ctx.stroke();
      }
      return;
    }

    // 세계 타원 밖은 바탕색, 안은 바다
    ctx.fillStyle = v('--bg');
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    geoPath(createProjection(size, s0, view, true), ctx)({ type: 'Sphere' });
    ctx.fillStyle = v('--ocean');
    ctx.fill();

    ctx.beginPath();
    for (const piece of land ?? []) path(piece.feature);
    ctx.fillStyle = v('--land-unassigned');
    ctx.fill();
    ctx.strokeStyle = v('--land-stroke');
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.lineJoin = 'round';
    const drawn = items.filter((it) => shapes.has(it.key));
    for (const it of drawn) {
      if (it.id === mainId) continue;
      ctx.beginPath();
      path(shapes.get(it.key)!);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = it.color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = v('--territory-border');
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (const it of drawn) {
      if (it.id !== highlightId) continue;
      ctx.beginPath();
      path(shapes.get(it.key)!);
      ctx.strokeStyle = v('--accent');
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    // 고르는 중인 나라: 진한 굵은 테두리
    for (const it of drawn) {
      if (it.id !== pendingId) continue;
      ctx.beginPath();
      path(shapes.get(it.key)!);
      ctx.strokeStyle = v('--fg');
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    for (const it of drawn) {
      if (it.id !== mainId) continue;
      ctx.beginPath();
      path(shapes.get(it.key)!);
      ctx.fillStyle = it.color;
      ctx.fill();
      ctx.strokeStyle = v('--fg');
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const it of drawn) {
      const name = labels[it.id];
      const p = name ? projection(it.anchor) : null;
      if (!p) continue;
      ctx.font = `${it.id === mainId ? '800 14px' : '600 12px'} Pretendard, "Malgun Gothic", system-ui, sans-serif`;
      ctx.strokeStyle = v('--label-halo');
      ctx.lineWidth = 3;
      ctx.strokeText(name, p[0], p[1]);
      ctx.fillStyle = v('--label');
      ctx.fillText(name, p[0], p[1]);
    }
  }, [size, view, land, items, shapes, mainId, labels, bare, highlightId, pendingId]);

  /** 화면의 anchor 자리를 붙든 채 배율을 k로 바꾼다 */
  const zoomTo = (k: (now: number) => number, anchor: [number, number]) => {
    const s = sizeRef.current;
    if (!s) return;
    setView((now) => {
      if (!now) return now;
      const next = clampZoom(k(now.k));
      const r = next / now.k;
      if (r === 1) return now;
      const c: [number, number] = [s.width / 2, s.height / 2];
      // recenter의 target은 '새 화면 가운데에 올 점'이므로, anchor가 제자리에 남도록 거꾸로 구한다
      const target: [number, number] = [anchor[0] - (anchor[0] - c[0]) / r, anchor[1] - (anchor[1] - c[1]) / r];
      return zoomAround(s, baseScale(s), now, target, next, anchor);
    });
  };
  const zoomRef = useRef(zoomTo);
  zoomRef.current = zoomTo;

  // 휠 확대. 페이지가 같이 굴러가지 않게 막아야 해서 직접 건다 (React의 onWheel은 막을 수 없다)
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (bareRef.current) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomRef.current((k) => k * 2 ** (-e.deltaY / 300), [e.clientX - r.left, e.clientY - r.top]);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // 끌기(한 손가락·마우스)와 두 손가락 확대. 거의 움직이지 않고 뗐으면 누른 것으로 친다
  const ptrs = useRef(new Map<number, [number, number]>());
  const moved = useRef(0);
  const pinch = useRef<number | null>(null);
  const at = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (bare || e.button) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (ptrs.current.size === 0) moved.current = 0;
    ptrs.current.set(e.pointerId, at(e));
    pinch.current = null;
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const prev = ptrs.current.get(e.pointerId);
    const s = sizeRef.current;
    if (!prev || !s) return;
    const now = at(e);
    ptrs.current.set(e.pointerId, now);
    if (ptrs.current.size === 1) {
      const [dx, dy] = [now[0] - prev[0], now[1] - prev[1]];
      moved.current += Math.abs(dx) + Math.abs(dy);
      if (dx || dy) setView((cur) => cur && recenter(s, baseScale(s), cur, [s.width / 2 - dx, s.height / 2 - dy], cur.k));
    } else if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const last = pinch.current;
      if (last && dist > 0) zoomTo((k) => (k * dist) / last, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      pinch.current = dist;
      moved.current = 99;
    }
  };
  const up = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!ptrs.current.delete(e.pointerId)) return;
    pinch.current = null;
    if (ptrs.current.size || moved.current > 6 || !onPick || !proj.current) return;
    const p = invertPoint(proj.current, at(e));
    if (!p) return;
    // 나중에 그린(위에 놓인, 작은) 나라부터 찾는다
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const feature = shapes.get(it.key);
      if (feature && geoContains(feature, p)) return onPick(it.id);
    }
  };
  const cancel = (e: PointerEvent<HTMLCanvasElement>) => {
    ptrs.current.delete(e.pointerId);
    pinch.current = null;
  };

  const center = (): [number, number] => [(size?.width ?? 0) / 2, (size?.height ?? 0) / 2];
  return (
    <div ref={ref} className={`mg-map${bare ? '' : ' move'}${onPick ? ' pick' : ''}`}>
      <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} />
      <div className="mg-zoom" hidden={bare}>
        <button type="button" aria-label="확대" onClick={() => zoomTo((k) => k * 1.5, center())}>+</button>
        <button type="button" aria-label="축소" onClick={() => zoomTo((k) => k / 1.5, center())}>−</button>
      </div>
    </div>
  );
}
