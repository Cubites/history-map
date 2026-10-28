import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { PREHISTORY, clampYear, decadeOf, formatYear, parseYearInput, prehistoryStage } from '../lib/year.ts';
import { activeWarView } from '../lib/wars.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { useMediaQuery } from '../lib/useMediaQuery.ts';

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

function yearMarks(min: number, max: number) {
  const marks: { year: number; major: boolean; label?: string; m500: boolean }[] = [];
  for (let n = 2300; n >= 100; n -= 100) marks.push({ year: 1 - n, major: n % 500 === 0, label: n % 500 === 0 ? `BC ${n}` : undefined, m500: n % 500 === 0 });
  marks.push({ year: 1, major: true, label: 'AD 1', m500: true });
  for (let n = 100; n <= 2000; n += 100) marks.push({ year: n, major: n % 500 === 0, label: n % 500 === 0 ? String(n) : undefined, m500: n % 500 === 0 });
  return marks.filter((m) => m.year >= min && m.year <= max);
}

/**
 * 지도 위 연도 조절 (2026-10-28 시험 중, DESIGN.md D7). 전쟁 보기에서는 아래 줄의 전쟁 날짜 축(Timeline)을 쓰므로 그리지 않는다.
 * - 휴대폰은 지도 오른쪽: 세로 연도 막대(위가 최근). 눈금은 막대 위에 그리고, 눈금 숫자(BC 2000 등)는 막대를 끄는 동안만 보인다.
 *   막대 아래에 신석기·구석기 단추(신석기가 위).
 * - PC는 지도 아래 따로 둔 띠: 가로 연도 막대(오른쪽이 최근), 눈금 숫자는 늘 막대 아래, 막대 왼쪽에 구석기·신석기 단추(2026-10-28).
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
  // PC는 가로 막대(지도 아래 띠), 휴대폰은 세로 막대(지도 오른쪽)
  const across = useMediaQuery('(min-width: 769px)');
  // 막대 위 자리: 세로는 위가 최근(max), 가로는 오른쪽이 최근
  const at = (y: number) => {
    const p = ((y - min) / (max - min)) * 100;
    return across ? { left: `${p}%` } : { top: `${100 - p}%` };
  };
  // 채운 부분은 막대의 오래된 끝(세로는 아래, 가로는 왼쪽)부터 손잡이까지
  const fillTo = (y: number) => {
    const p = ((y - min) / (max - min)) * 100;
    return across ? { right: `${100 - p}%` } : { top: `${100 - p}%` };
  };

  // ── 세로 막대 끌기 ──
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const yearAt = (e: ReactPointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, across ? (e.clientX - r.left) / r.width : (r.bottom - e.clientY) / r.height));
    return min + Math.round((t * (max - min)) / 10) * 10;
  };
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
    go(yearAt(e));
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) go(yearAt(e));
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
  // 막대 왼쪽 끝(기원전 2333년)보다 앞이면 go가 선사 단계로 옮긴다: 기원전 8000년까지는 신석기, 그보다 앞은 구석기
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

  // 선사 단계 단추: 세로 막대에서는 막대 아래(신석기가 구석기 위), 가로 막대에서는 막대 왼쪽(구석기, 신석기 차례)
  const prehistory = (
    <div className="map-yearbar-prehistory" role="group" aria-label="선사 시대">
      {(across ? PREHISTORY : [...PREHISTORY].reverse()).map((s) => (
        <button key={s.year} type="button" aria-pressed={stage?.year === s.year} onClick={() => setYear(s.year)} title={`${s.name} (${formatYear(s.year)})`}>
          {s.short}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={['map-yearbar map-ui', across && 'across', dragging && 'dragging'].filter(Boolean).join(' ')} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        {across && prehistory}
        <div
          ref={trackRef}
          className="map-yearbar-track"
          role="slider"
          tabIndex={0}
          aria-label="연도"
          aria-orientation={across ? 'horizontal' : 'vertical'}
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
            <span key={m.year} className={['map-yearbar-mark', m.major && 'major', m.m500 && 'm500', m.year === 1 && 'ad1'].filter(Boolean).join(' ')} style={at(m.year)}>
              {m.label && <span className="map-yearbar-label">{m.label}</span>}
            </span>
          ))}
          {!prehistoric && <span className="map-yearbar-thumb" style={at(Math.max(min, decadeOf(year)))} />}
        </div>
        {!across && prehistory}
      </div>

      <div ref={boxRef} className="map-yearbox map-ui" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" disabled={prevChange === undefined} onClick={() => prevChange !== undefined && go(prevChange)} title="이전 지도 변화" aria-label="이전 지도 변화">
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
          <input
            ref={inputRef}
            value={shown}
            // 폭은 평소 글("1700년")과 입력 중 숫자 가운데 긴 쪽에 맞춘다. 숫자만 보일 때 칸이 줄어들지 않게(2026-10-28)
            size={Math.max(5, label.length, draft?.length ?? 0) + 1}
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
        </form>
        <button type="button" disabled={nextChange === undefined} onClick={() => nextChange !== undefined && go(nextChange)} title="다음 지도 변화" aria-label="다음 지도 변화">
          ▶
        </button>
      </div>
    </>
  );
}
