import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { PREHISTORY, clampYear, decadeOf, formatYear, parseYearInput, prehistoryStage } from '../lib/year.ts';
import { activeWarView } from '../lib/wars.ts';
import { useAppStore } from '../store/useAppStore.ts';

/**
 * 연도 눈금 (2026-10-18). 100년마다 짧은 눈금, 500년마다 긴 눈금과 숫자. 휴대폰은 500년 눈금만(CSS).
 * 자리는 천문 연도(기원전 N년 = 1 - N). 숫자는 짧게: 기원전은 'BC 2000', 서기는 숫자만, 경계는 'AD 1'
 */
function yearMarks(min: number, max: number) {
  const marks: { year: number; major: boolean; label?: string; m500: boolean }[] = [];
  for (let n = 2300; n >= 100; n -= 100) marks.push({ year: 1 - n, major: n % 500 === 0, label: n % 500 === 0 ? `BC ${n}` : undefined, m500: n % 500 === 0 });
  marks.push({ year: 1, major: true, label: 'AD 1', m500: true });
  for (let n = 100; n <= 2000; n += 100) marks.push({ year: n, major: n % 500 === 0, label: n % 500 === 0 ? String(n) : undefined, m500: n % 500 === 0 });
  return marks.filter((m) => m.year >= min && m.year <= max);
}

/**
 * 지도 위 연도 조절 (2026-10-28 시험 중, DESIGN.md D7). 전쟁 보기에서는 아래 줄의 전쟁 날짜 축(Timeline)을 쓰므로 그리지 않는다.
 * - 지도 오른쪽: 세로 연도 막대(위가 최근). 눈금은 막대 위에 그리고, 눈금 숫자(BC 2000 등)는 막대를 끄는 동안만 보인다.
 *   막대 아래에 신석기·구석기 단추(신석기가 위).
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
  // 막대 위 자리(%): 위가 최근(max)
  const topOf = (y: number) => ((max - y) / (max - min)) * 100;

  // ── 세로 막대 끌기 ──
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const yearAt = (clientY: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (r.bottom - clientY) / r.height));
    return min + Math.round((t * (max - min)) / 10) * 10;
  };
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // 붙잡지 못해도 막대 위에서는 그대로 끌린다
    }
    setDragging(true);
    go(yearAt(e.clientY));
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) go(yearAt(e.clientY));
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

  // 휴대폰에서 고치는 동안 화면 키보드가 입력 칸을 가리면 가려진 만큼 위로 올린다(Timeline.tsx에서 옮김, 2026-10-28)
  const boxRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const el = boxRef.current;
    if (!typing || !vv || !el) return;
    const place = () => {
      el.style.transform = '';
      const hidden = Math.max(0, Math.round(el.getBoundingClientRect().bottom + 8 - (vv.height + vv.offsetTop)));
      el.style.transform = hidden ? `translate(-50%, ${-hidden}px)` : '';
    };
    place();
    vv.addEventListener('resize', place);
    vv.addEventListener('scroll', place);
    return () => {
      vv.removeEventListener('resize', place);
      vv.removeEventListener('scroll', place);
      el.style.transform = '';
    };
  }, [typing]);

  if (inWar) return null;

  return (
    <>
      <div className={dragging ? 'map-yearbar map-ui dragging' : 'map-yearbar map-ui'} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <div
          ref={trackRef}
          className="map-yearbar-track"
          role="slider"
          tabIndex={0}
          aria-label="연도"
          aria-orientation="vertical"
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
          {!prehistoric && <i className="map-yearbar-fill" style={{ top: `${topOf(Math.max(min, decadeOf(year)))}%` }} />}
          {marks.map((m) => (
            <span key={m.year} className={['map-yearbar-mark', m.major && 'major', m.m500 && 'm500', m.year === 1 && 'ad1'].filter(Boolean).join(' ')} style={{ top: `${topOf(m.year)}%` }}>
              {m.label && <span className="map-yearbar-label">{m.label}</span>}
            </span>
          ))}
          {!prehistoric && <span className="map-yearbar-thumb" style={{ top: `${topOf(Math.max(min, decadeOf(year)))}%` }} />}
        </div>
        {/* 선사 단계 단추: 눈금 아래, 신석기가 구석기 위 */}
        <div className="map-yearbar-prehistory" role="group" aria-label="선사 시대">
          {[...PREHISTORY].reverse().map((s) => (
            <button key={s.year} type="button" aria-pressed={stage?.year === s.year} onClick={() => setYear(s.year)} title={`${s.name} (${formatYear(s.year)})`}>
              {s.short}
            </button>
          ))}
        </div>
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
