import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { PREHISTORY, clampYear, decadeOf, erasFor, formatYear, parseYearInput, prehistoryStage } from '../lib/year.ts';
import { activeWarView } from '../lib/wars.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { useFlatBar } from './useFlatBar.ts';

/** 연도 칸 글자(styles.css의 .map-yearbox input과 같게: 16px, 800) */
const YEAR_FONT = { size: 16, weight: 800 };
let yearMeasure: CanvasRenderingContext2D | null | undefined;
/** 연도 칸 글 폭(px). 칸 폭을 글에 꼭 맞춰 아이콘(편집 아이콘, 2026-11-25에 달력에서 바꿈)과 글 사이를 3px로 둔다(2026-11-15) */
function yearTextWidth(text: string): number {
  yearMeasure ??= document.createElement('canvas').getContext('2d');
  if (!yearMeasure) return text.length * YEAR_FONT.size * 0.6;
  yearMeasure.font = `${YEAR_FONT.weight} ${YEAR_FONT.size}px ${getComputedStyle(document.body).fontFamily}`;
  return yearMeasure.measureText(text).width;
}

/**
 * 연도 눈금 (2026-10-18). 100년마다 짧은 눈금, 500년마다 긴 눈금과 숫자. 휴대폰은 500년 눈금만(CSS).
 * 자리는 천문 연도(기원전 N년 = 1 - N). 숫자는 짧게: 기원전은 'BC 2000', 서기는 숫자만, 경계는 'AD 1'
 */
/** 화면 키보드 정보(VirtualKeyboard API, Chrome Android 등). 표준 lib 타입에 아직 없어 필요한 만큼만 적는다 */
type VirtualKeyboard = EventTarget & { overlaysContent: boolean; boundingRect: DOMRectReadOnly };
const virtualKeyboard = (navigator as Navigator & { virtualKeyboard?: VirtualKeyboard }).virtualKeyboard;
// 키보드가 화면을 줄이거나 밀어 올리지 않고 위에 덮이게 한다(2026-10-28). 그래야 나라 정보 판은 키보드 뒤에 그대로 있고
// 연도 칸만 키보드 위로 올릴 수 있다(아래 MapYearControls). 이 API가 없는 브라우저(iOS Safari 등)는 visualViewport로 처리
if (virtualKeyboard) virtualKeyboard.overlaysContent = true;

/** 키보드가 떠 있는 동안 화면을 붙잡아 두는 상태(MapYearControls의 holdScreen). 붙잡는 동안 <html>에 keyboard-hold 클래스 */
type ScreenHold = { app: HTMLElement; box: HTMLElement; frame: number; until: number; shift: number; lift: number; base: number; seen: boolean; stop: () => void };

/**
 * 연도 칸을 고치는 동안 매 프레임(과 키보드·보이는 영역·스크롤 이벤트 때): 앱 높이를 묶고, 브라우저가 밀어 올린 만큼 앱을 반대로 옮기고, 연도 칸만 키보드 위로 올린다.
 * typing()이 거짓이 되고 until이 지나면 놓는다. 초점이 남은 채 키보드만 닫히면(Android 뒤로 단추) endTyping을 부른다
 */
function holdScreen(app: HTMLElement, box: HTMLElement, typing: () => boolean, endTyping: () => void, ref: { current: ScreenHold | null }): ScreenHold {
  const h: ScreenHold = { app, box, frame: 0, until: Infinity, shift: 0, lift: 0, base: window.innerHeight, seen: false, stop: () => {} };
  app.style.height = `${app.getBoundingClientRect().height}px`;
  document.documentElement.classList.add('keyboard-hold');
  const vv0 = window.visualViewport;
  const step = () => {
    if (ref.current !== h) return;
    const vv = window.visualViewport;
    const vvTop = vv?.offsetTop ?? 0;
    const vvHeight = vv?.height ?? window.innerHeight;
    const now = typing();
    // 감싼 틀의 스크롤은 늘, 문서 스크롤은 입력이 끝난 뒤에만 되돌린다(입력 중에는 브라우저에 맡기고 앱을 옮겨 맞춤)
    for (let n = box.parentElement; n && n !== document.body; n = n.parentElement) if (n.scrollTop || n.scrollLeft) n.scrollTo(0, 0);
    if (!now && (window.scrollY || window.scrollX)) window.scrollTo(0, 0);
    // 앱 위 끝을 보이는 영역 위 끝에 맞춘다(getBoundingClientRect는 레이아웃 뷰포트 기준)
    const shift = Math.round(vvTop - (app.getBoundingClientRect().top - h.shift));
    if (shift !== h.shift) app.style.transform = shift ? `translateY(${shift}px)` : '';
    h.shift = shift;
    // 키보드 위 끝(보이는 영역 기준): VirtualKeyboard API가 있으면 화면 높이 − 키보드 높이, 없으면 보이는 영역의 아래 끝
    const kb = virtualKeyboard?.overlaysContent ? virtualKeyboard.boundingRect.height : 0;
    const keyboardTop = kb > 0 ? window.innerHeight - kb - vvTop : vvHeight;
    const lift = now ? Math.max(0, Math.round(box.getBoundingClientRect().bottom + h.lift - vvTop + 8 - keyboardTop)) : 0;
    if (lift !== h.lift) box.style.transform = lift ? `translate(-50%, ${-lift}px)` : '';
    h.lift = lift;
    const open = kb > 0 || vvHeight < h.base - 80;
    if (open) h.seen = true;
    else if (h.seen && now) endTyping();
    if (!now && performance.now() >= h.until) releaseScreen(ref);
  };
  const tick = () => {
    step();
    if (ref.current === h) h.frame = requestAnimationFrame(tick);
  };
  // 프레임이 멈춘 화면(백그라운드 등)에서도 놓을 수 있게 0.1초마다도 맞춘다
  const timer = window.setInterval(step, 100);
  const targets: [EventTarget | null | undefined, string][] = [[vv0, 'resize'], [vv0, 'scroll'], [window, 'scroll'], [window, 'resize'], [virtualKeyboard, 'geometrychange']];
  for (const [t, type] of targets) t?.addEventListener(type, step);
  h.stop = () => {
    cancelAnimationFrame(h.frame);
    window.clearInterval(timer);
    for (const [t, type] of targets) t?.removeEventListener(type, step);
  };
  h.frame = requestAnimationFrame(tick);
  return h;
}

function releaseScreen(ref: { current: ScreenHold | null }) {
  const h = ref.current;
  if (!h) return;
  h.stop();
  h.app.style.removeProperty('height');
  h.app.style.removeProperty('transform');
  h.box.style.removeProperty('transform');
  document.documentElement.classList.remove('keyboard-hold');
  ref.current = null;
}

/** 휴대폰 가로 막대의 선사 구간(2026-11-25): 막대 왼쪽 끝에서 빙하기·빙하기 후 눈금 자리(px)와, 연도가 시작하는 자리(px).
 * 이름이 "빙하기 후"로 길어져 두 이름이 겹치지 않게 간격을 넓혔다(16·54·92 → 18·68·110) */
const PRE_SLOTS = [18, 68];
const PRE_LEN = 110;

function yearMarks(min: number, max: number) {
  // m1000: 휴대폰 가로 막대(2026-11-25)에서 끄는 동안 숫자를 보이는 눈금(1000년마다 + AD 1)
  const marks: { year: number; major: boolean; label?: string; m500: boolean; m1000: boolean }[] = [];
  for (let n = 2300; n >= 100; n -= 100) marks.push({ year: 1 - n, major: n % 500 === 0, label: n % 500 === 0 ? `BC ${n}` : undefined, m500: n % 500 === 0, m1000: n % 1000 === 0 });
  marks.push({ year: 1, major: true, label: 'AD 1', m500: true, m1000: true });
  for (let n = 100; n <= 2000; n += 100) marks.push({ year: n, major: n % 500 === 0, label: n % 500 === 0 ? String(n) : undefined, m500: n % 500 === 0, m1000: n % 1000 === 0 });
  return marks.filter((m) => m.year >= min && m.year <= max);
}

/**
 * 지도 위 연도 조절 (2026-10-28부터, DESIGN.md D7). 전쟁 보기에서는 전쟁 정보 패널(WarPanel)의 날짜 목록을 쓰므로 그리지 않는다.
 * - PC는 지도 아래 따로 둔 띠: 가로 연도 막대(오른쪽이 최근), 눈금 숫자는 늘 막대 아래, 막대 왼쪽에 빙하기·빙하기 후 단추(2026-10-28).
 * - 휴대폰은 지도 영역 맨 아래에 띄운 가로 막대(2026-11-25, 사본 시험): 단추 없이 막대 왼쪽 끝에 빙하기·빙하기 후 눈금 두 칸. 연도에서 왼쪽으로 끌면 그대로 선사 눈금으로 넘어간다.
 *   눈금 숫자(BC 2000 등)는 막대를 끄는 동안만 보인다. 처음에는 지도 오른쪽 세로 막대였으나 같은 날 없앴다.
 * - 지도 아래 가운데: ◀ 이전 변화 · 연도 입력 칸 · 다음 변화 ▶ (2026-10-28 −10·+10 단추와 감싼 상자를 없앰).
 *   입력 칸은 평소 "1700년"(기원전은 "기원전 57년", 선사 시대는 "신석기"·"구석기"만)으로 보이고, 누르면 숫자만 입력(음수는 기원전), Enter로 옮긴다.
 */
export function MapYearControls({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  const inWar = useAppStore((s) => !!activeWarView(data.wars, s.warId, s.theaterId, s.year));

  const range = data.timeline.range;
  const [min, max] = [decadeOf(range[0]), decadeOf(range[1])];
  // 역사 시대 앞으로 가면 선사 단계로 옮긴다 (DESIGN.md §4.4)
  const go = (y: number) => setYear(y < range[0] ? prehistoryStage(y).year : clampYear(y, range));
  const prehistoric = year < range[0];
  const stage = prehistoric ? prehistoryStage(year) : undefined;
  const stops = [...PREHISTORY.map((s) => s.year), range[0], ...data.timeline.changeYears.filter((y) => y > range[0])];
  const prevChange = [...stops].reverse().find((y) => y < year);
  const nextChange = stops.find((y) => y > year && y <= range[1]);
  // 선사 단계에서 +10년은 다음 단계(또는 역사 시대의 시작)로
  const forward = () => (prehistoric ? go(stops.find((y) => y > year) ?? range[0]) : go(year + 10));
  const marks = useMemo(() => yearMarks(min, max), [min, max]);
  // 연도 막대는 PC·휴대폰 모두 지도 위에 띄운 가로 막대(.flat, 오른쪽이 최근)다.
  // 2026-11-25(사본 시험): 휴대폰의 세로 막대(지도 오른쪽)와 디자인 고르기 단추를 없애고 가로 막대로 굳혔다.
  // 2026-11-26(사본 시험): PC도 지도 아래 띠와 선사 단추를 없애고 휴대폰과 같은 막대로 맞췄다
  const mobile = useFlatBar();
  // 막대 위 자리: 오른쪽이 최근(max)
  // 선사 단추 대신 막대 왼쪽 끝 pre(px)를 선사 구간으로 쓴다(2026-11-25): 눈금 두 칸(PRE_SLOTS), 그 오른쪽부터 연도
  const pre = PRE_LEN;
  const at = (y: number) => ({ left: `calc(${pre}px + (100% - ${pre}px) * ${(y - min) / (max - min)})` });
  // 채운 부분은 막대의 오래된 끝(왼쪽)부터 손잡이까지
  const fillTo = (y: number) => ({ right: `calc((100% - ${pre}px) * ${1 - (y - min) / (max - min)})` });

  // ── 막대 끌기 ──
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // ── 시대 표시(2026-11-23): PC는 막대 위, 휴대폰은 막대 왼쪽에 고대·중세·근세·근대·현대. 시대 경계에 가는 선 ──
  // 막대는 연도에 비례하므로 근대·현대처럼 짧은 시대는 이름이 겹친다. 이름 자리는 그 시대 구간의 가운데로 하되,
  // 최근 쪽부터 차례로 놓으며 앞 이름과 최소 간격(30px)을 지키게 오래된 쪽으로 민다
  const regionFilter = useAppStore((s) => s.regionFilter);
  const [trackLen, setTrackLen] = useState(0);
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTrackLen(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [inWar]);
  const eras = useMemo(() => {
    const list = erasFor(regionFilter);
    const spans = list
      .map((e, i) => ({ name: e.name, from: Math.max(min, e.from), to: Math.min(max, list[i + 1]?.from ?? max), start: e.from }))
      .filter((e) => e.to > e.from);
    const gap = 30;
    // 2026-11-25(사본 시험): 평소에는 지금 연도의 시대 이름 하나만 보인다. 혼자 보이므로 밀 필요 없이 그 시대 구간의 가운데(solo)에 두되,
    // 이름이 막대 끝을 넘지 않게 당긴다(half: 이름 크기의 절반 — 바탕 여백까지 휴대폰 26px·PC 28px 폭. 막대는 둥근 끝이 5px 더 나와 있다).
    // 막대를 끄는 동안에는 모든 시대 이름이 예전처럼 밀어 놓은 자리(pos)에 나온다
    const half = mobile ? 13 : 14;
    const [lo, hi] = [half - 5, trackLen + 5 - half];
    let before = Infinity;
    const placed = [...spans].reverse().map((e) => {
      const center = pre + (((e.from + e.to) / 2 - min) / (max - min)) * (trackLen - pre);
      const pos = Math.min(center, before - gap);
      before = pos;
      return { ...e, pos, solo: Math.min(hi, Math.max(lo, center)) };
    });
    return placed.reverse();
  }, [regionFilter, min, max, mobile, trackLen, pre]);
  // 휴대폰 가로 막대: 선사 구간에서는 가까운 눈금(구석기·신석기)으로, 그 오른쪽은 연도로. 걸림 없이 한 번에 끌어 넘어간다(2026-11-25에 걸림을 넣었다가 뺌)
  const preEdge = (PRE_SLOTS[1] + PRE_LEN) / 2;
  const flatYearAt = (e: ReactPointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < preEdge) return PREHISTORY[x < (PRE_SLOTS[0] + PRE_SLOTS[1]) / 2 ? 0 : 1].year;
    const t = Math.min(1, Math.max(0, (x - pre) / (r.width - pre)));
    return clampYear(min + Math.round((t * (max - min)) / 10) * 10, range);
  };
  const moveTo = (e: ReactPointerEvent) => setYear(flatYearAt(e));
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // 끄는 동안 글자가 선택되며 파란 네모가 비치지 않게 기본 동작을 막는다(2026-10-28)
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 붙잡지 못해도 막대 위에서는 그대로 끌린다
    }
    setDragging(true);
    moveTo(e);
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) moveTo(e);
  };
  const onTrackUp = () => setDragging(false);

  // ── 연도 입력 칸 ──
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectAfterRender = useRef(false);
  useLayoutEffect(() => {
    if (!selectAfterRender.current) return;
    selectAfterRender.current = false;
    inputRef.current?.select();
  }, [draft]);
  // 연도 입력(Enter로만 옮김): 0은 서기 1년, 음수는 기원전(-57 → 기원전 57년), 올해 뒤는 막대 끝 해(range[1]).
  // 막대 왼쪽 끝(기원전 2333년)보다 앞이면 go가 선사 단계로 옮긴다: 기원전 9700년 무렵까지는 빙하기 후, 그보다 앞은 빙하기(year.ts의 PREHISTORY.from)
  const submit = (text: string) => {
    const parsed = parseYearInput(text);
    if (parsed === null) {
      setInvalid(true);
      return false;
    }
    go(parsed === 0 && /^\s*-?0+\s*$/.test(text) ? 1 : parsed);
    setDraft(null);
    setInvalid(false);
    return true;
  };
  const bc = year <= 0;
  // 평소 보이는 글: 선사 시대는 단계 이름만, 기원전은 "기원전 N년", 서기는 "N년". 고치는 중에는 숫자(기원전은 음수)
  const label = stage ? stage.short : bc ? `기원전 ${1 - year}년` : `${year}년`;
  const shown = draft ?? label;

  // 휴대폰 화면 키보드 (2026-10-28 다시 고침: 실제 휴대폰에서 키보드가 뜨면 지도 자리가 옮겨졌음).
  // 입력하는 동안 지도·나라 정보 판은 키보드가 뜨기 전 화면 자리 그대로 두고, 연도 칸(◀ 칸 ▶)만 키보드 바로 위(8px)로 올린다.
  // 브라우저마다 키보드가 화면을 바꾸는 방식이 달라 모두 되돌린다(holdScreen):
  //  · 화면 높이를 줄임(100dvh·innerHeight가 작아짐) → 앱 높이를 입력 시작 때 높이(px)로 묶어 지도 크기가 바뀌지 않게
  //  · 입력 칸을 보이려고 보이는 영역(visualViewport)을 밀거나 문서를 스크롤(iOS Safari 등) → 앱 전체를 그만큼 반대로 옮겨 화면에서는 제자리
  //  · 연도 칸을 감싼 틀(.app-main 등)이 스크롤됨 → 바로 되돌림
  // 키보드가 열리고 닫히는 동안 값이 계속 바뀌므로 입력하는 동안과 끝난 뒤 0.8초는 매 프레임 다시 맞춘다
  const boxRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);
  const typingRef = useRef(false);
  typingRef.current = typing;
  const hold = useRef<ScreenHold | null>(null);
  useEffect(() => {
    if (hold.current) {
      // 입력이 끝나면 0.8초 더 맞추고 놓는다. 그동안 다시 누르면 그대로 이어 간다
      hold.current.until = typing ? Infinity : performance.now() + 800;
      return;
    }
    const box = boxRef.current;
    const app = box?.closest<HTMLElement>('.app');
    if (typing && box && app) hold.current = holdScreen(app, box, () => typingRef.current, () => inputRef.current?.blur(), hold);
  }, [typing]);
  useEffect(() => () => releaseScreen(hold), []);

  if (inWar) return null;

  return (
    <>
      <div className={['map-yearbar map-ui across flat', dragging && 'dragging'].filter(Boolean).join(' ')} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <div
          ref={trackRef}
          className="map-yearbar-track"
          role="slider"
          tabIndex={0}
          aria-label="연도"
          aria-orientation="horizontal"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Math.max(min, decadeOf(year))}
          aria-valuetext={formatYear(year)}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerCancel={onTrackUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') forward();
            else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') go(year - 10);
            else return;
            e.preventDefault();
          }}
        >
          {/* 두꺼운 막대와, 막대 아래 끝부터 손잡이까지 채운 부분(2026-10-28) */}
          <i className="map-yearbar-rail" />
          {!prehistoric && <i className="map-yearbar-fill" style={fillTo(Math.max(min, decadeOf(year)))} />}
          {marks.map((m) => (
            <span key={m.year} className={['map-yearbar-mark', m.major && 'major', m.m500 && 'm500', m.m1000 && 'm1000', m.year === 1 && 'ad1'].filter(Boolean).join(' ')} style={at(m.year)}>
              {m.label && <span className="map-yearbar-label">{m.label}</span>}
            </span>
          ))}
          {!prehistoric && <span className="map-yearbar-thumb" style={at(Math.max(min, decadeOf(year)))} />}
          {/* 휴대폰 가로 막대의 선사 구간: 눈금 두 칸과 막대 위 이름(시대 이름과 같은 글자), 연도가 시작하는 자리에 경계선. 선사 단계에서는 손잡이가 그 눈금에 놓인다 */}
          <>
              {PREHISTORY.map((s, i) => (
                <span key={s.year} aria-hidden>
                  <span className="map-yearbar-mark m500" style={{ left: `${PRE_SLOTS[i]}px` }} />
                  <span className={`map-yearbar-era pre${stage?.year === s.year ? ' on' : ''}`} style={{ left: `${PRE_SLOTS[i]}px` }}>
                    {s.short}
                  </span>
                </span>
              ))}
              <i className="map-yearbar-eraline" style={{ left: `${pre}px` }} aria-hidden />
              {stage && <i className="map-yearbar-fill" style={{ right: `calc(100% - ${PRE_SLOTS[PREHISTORY.findIndex((s) => s.year === stage.year)]}px)` }} />}
              {stage && <span className="map-yearbar-thumb" style={{ left: `${PRE_SLOTS[PREHISTORY.findIndex((s) => s.year === stage.year)]}px` }} />}
          </>
          {trackLen > 0 &&
            eras.map((e, i) => {
              // 지금 연도의 시대만 보인다(.on). 끄는 동안(.dragging)에는 나머지도 연하게 보이고 지금 시대는 바탕을 불투명하게 해 도드라지게 한다(styles.css)
              const on = !prehistoric && year >= e.start && year < (eras[i + 1]?.start ?? Infinity);
              const p = on && !dragging ? e.solo : e.pos;
              return (
                <span key={e.name} aria-hidden>
                  {i > 0 && <i className="map-yearbar-eraline" style={at(e.from)} />}
                  <span className={`map-yearbar-era${on ? ' on' : ''}`} style={{ left: `${p}px` }}>
                    {e.name}
                  </span>
                </span>
              );
            })}
        </div>
      </div>

      <div ref={boxRef} className="map-yearbox map-ui" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" disabled={prevChange === undefined} onClick={() => prevChange !== undefined && go(prevChange)} title="이전 지도 변화" aria-label="이전 지도 변화">
          <span className="ui-bg" aria-hidden="true" />
          ◀
        </button>
        <form
          className="map-yearbox-form"
          title="연도를 고치고 Enter (숫자만, 음수는 기원전, 0은 서기 1년)"
          onSubmit={(e) => {
            e.preventDefault();
            if (submit(shown)) (document.activeElement as HTMLElement | null)?.blur();
          }}
        >
          {/* 칸 테두리는 label(.map-yearbox-field)이 맡고, 그 안에 아이콘과 글을 3px 띄워 나란히 둔다(2026-11-15).
              아이콘은 글자 높이(16px)와 같은 크기이고, 누르면 label이라 글 칸으로 들어간다.
              2026-11-25(사본 시험): 달력 아이콘을 편집(연필) 아이콘으로 바꿨다 — 이 칸은 날짜를 고르는 창이 아니라 연도를 직접 써 넣는 칸이다 */}
          <label className="map-yearbox-field">
          <svg className="map-yearbox-icon" viewBox="0 0 16 16" aria-hidden>
            {/* 네모 종이(오른쪽 위 모서리가 열림)와 그 위에 걸친 펜 */}
            <path d="M7.5 2.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5h8a1.5 1.5 0 0 0 1.5-1.5V8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.4 9.6 6.9 7.4 12.2 2.1a1.15 1.15 0 0 1 1.7 1.7L8.6 9.1 6.4 9.6Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <input
            ref={inputRef}
            value={shown}
            // 폭은 글에 꼭 맞춘다(2026-11-15, 아이콘과 글 사이 3px). 고치는 중에는 평소 글("1700년")과 입력 중 숫자 가운데 긴 쪽에 맞춰 칸이 줄어들지 않게(2026-10-28)
            size={Math.max(5, label.length, draft?.length ?? 0) + 1}
            style={{ width: `${Math.ceil(Math.max(yearTextWidth(label), draft ? yearTextWidth(draft) : 0)) + 2}px` }}
            inputMode="numeric"
            onFocus={() => {
              setTyping(true);
              selectAfterRender.current = true;
              setDraft(String(bc ? -(1 - year) : year));
            }}
            onChange={(e) => {
              // 숫자만(맨 앞의 - 하나는 기원전 표시로 허용)
              const v = e.target.value;
              if (!/^-?\d*$/.test(v)) return;
              setDraft(v);
              setInvalid(false);
            }}
            onBlur={() => {
              // Enter 없이 벗어나면 옮기지 않고 지금 연도로 되돌린다
              setTyping(false);
              setDraft(null);
              setInvalid(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') e.currentTarget.blur();
            }}
            aria-label={`연도 입력, 지금 ${stage ? stage.name + ' ' : ''}${formatYear(year)}`}
            aria-invalid={invalid}
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
          />
          </label>
        </form>
        <button type="button" disabled={nextChange === undefined} onClick={() => nextChange !== undefined && go(nextChange)} title="다음 지도 변화" aria-label="다음 지도 변화">
          <span className="ui-bg" aria-hidden="true" />
          ▶
        </button>
      </div>
    </>
  );
}
