import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { PREHISTORY, clampYear, decadeOf, formatYear, parseYearInput, prehistoryStage } from '../lib/year.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { FrontTimeline } from './FrontTimeline.tsx';
import { activeWarView } from '../lib/wars.ts';

/**
 * 슬라이더 아래 연도 눈금 (2026-10-18: 영토 기간 띠·사건 눈금 대신).
 * 100년마다 짧은 눈금, 500년마다 긴 눈금과 숫자. 휴대폰은 500년 눈금과 1000년 숫자만(CSS).
 * 자리는 천문 연도(기원전 N년 = 1 - N). 숫자는 바가 좁아 짧게: 기원전은 'BC 2000', 서기는 숫자만, 경계는 'AD 1'
 * (휴대폰 바는 약 240px. '기원전 2000'처럼 쓰면 이웃 숫자와 겹침)
 */
function yearMarks(min: number, max: number) {
  const marks: { year: number; major: boolean; label?: string; k1000: boolean; m500: boolean }[] = [];
  for (let n = 2300; n >= 100; n -= 100) marks.push({ year: 1 - n, major: n % 500 === 0, label: n % 500 === 0 ? `BC ${n}` : undefined, k1000: n % 1000 === 0, m500: n % 500 === 0 });
  marks.push({ year: 1, major: true, label: 'AD 1', k1000: true, m500: true });
  for (let n = 100; n <= 2000; n += 100) marks.push({ year: n, major: n % 500 === 0, label: n % 500 === 0 ? String(n) : undefined, k1000: n % 1000 === 0, m500: n % 500 === 0 });
  return marks.filter((m) => m.year >= min && m.year <= max);
}

/**
 * 타임라인 (DESIGN.md D7): 슬라이더는 10년 단위, 연도 직접 입력, 이전/다음 지도 변화로 이동.
 * 모바일 세로 화면에서는 화면 위쪽에 놓인다 (DESIGN.md §6.5). 연도 표시의 숫자 부분이 곧 입력 칸이다(2026-10-27, 따로 있던 입력 칸은 없앰).
 */
export function Timeline({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  // 입력 중인 글(고치는 동안만 값이 있음). 없으면 지금 연도를 보여 준다
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // 입력 칸을 누르면 글이 음수 표기로 바뀐 뒤(다시 그린 뒤) 전체를 골라, 바로 새 연도를 칠 수 있게 한다
  const selectAfterRender = useRef(false);
  useLayoutEffect(() => {
    if (!selectAfterRender.current) return;
    selectAfterRender.current = false;
    inputRef.current?.select();
  }, [draft]);
  const inWar = useAppStore((s) => !!activeWarView(data.wars, s.warId, s.theaterId, s.year));

  const range = data.timeline.range;
  const [min, max] = [decadeOf(range[0]), decadeOf(range[1])];
  // 역사 시대 앞으로 가면 선사 단계로 옮긴다 (DESIGN.md §4.4)
  const go = (y: number) => setYear(y < range[0] ? prehistoryStage(y).year : clampYear(y, range));
  const percent = (y: number) => ((y - min) / (max - min)) * 100;
  const prehistoric = year < range[0];
  const stage = prehistoric ? prehistoryStage(year) : undefined;

  const stops = [...PREHISTORY.map((s) => s.year), range[0], ...data.timeline.changeYears.filter((y) => y > range[0])];
  const prevChange = [...stops].reverse().find((y) => y < year);
  const nextChange = stops.find((y) => y > year && y <= range[1]);
  // 선사 단계에서 +10년은 다음 단계(또는 역사 시대의 시작)로
  const forward = () => (prehistoric ? go(stops.find((y) => y > year) ?? range[0]) : go(year + 10));
  const marks = useMemo(() => yearMarks(min, max), [min, max]);

  // 연도 입력(Enter로만 옮김): 0은 서기 1년, 음수는 기원전(-57 → 기원전 57년), 올해 뒤는 막대 끝 해(range[1]).
  // 막대 왼쪽 끝(기원전 2333년)보다 앞이면 go가 선사 단계로 옮긴다: 기원전 8000년까지는 신석기, 그보다 앞은 구석기
  const submit = (text: string) => {
    const parsed = parseYearInput(text);
    if (parsed === null) {
      setInvalid(true);
      return false;
    }
    // '기원전 1'·'-1'도 천문 연도 0이므로, 글 자체가 0일 때만 서기 1년으로 바꾼다
    go(parsed === 0 && /^\s*0+\s*년?\s*$/.test(text) ? 1 : parsed);
    setDraft(null);
    setInvalid(false);
    return true;
  };
  const bc = year <= 0;
  // 입력 칸에 보이는 숫자: 평소엔 앞의 '기원전'과 함께 절댓값, 고치는 중엔 음수로(기원전 57년 → -57)
  const shown = draft ?? String(bc ? 1 - year : year);

  // 전쟁 보기에서는 연도 타임라인 대신 그 전쟁의 날짜 축을 보여 준다 (DESIGN.md §4.5)
  if (inWar) {
    return (
      <div className="timeline timeline-war">
        <FrontTimeline data={data} />
      </div>
    );
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button type="button" disabled={prevChange === undefined} onClick={() => prevChange !== undefined && go(prevChange)} title="이전 지도 변화" aria-label="이전 지도 변화">
          ◀<span className="timeline-button-label"> 이전 변화</span>
        </button>
        <button type="button" onClick={() => go(year - 10)} aria-label="10년 전">−10년</button>
        <form
          className="timeline-year"
          title="연도를 고치고 Enter (음수는 기원전, 0은 서기 1년)"
          onSubmit={(e) => {
            e.preventDefault();
            if (submit(shown)) (document.activeElement as HTMLElement | null)?.blur();
          }}
        >
          {stage && <span className="timeline-year-stage">{stage.short} · </span>}
          {bc && draft === null && <span>기원전 </span>}
          <input
            ref={inputRef}
            value={shown}
            size={Math.max(2, shown.length)}
            onFocus={() => {
              selectAfterRender.current = true;
              setDraft(String(bc ? -(1 - year) : year));
            }}
            onChange={(e) => {
              setDraft(e.target.value);
              setInvalid(false);
            }}
            onBlur={() => {
              // Enter 없이 벗어나면 옮기지 않고 지금 연도로 되돌린다
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
          <span>년</span>
        </form>
        <button type="button" onClick={forward} aria-label="10년 후">+10년</button>
        <button type="button" disabled={nextChange === undefined} onClick={() => nextChange !== undefined && go(nextChange)} title="다음 지도 변화" aria-label="다음 지도 변화">
          <span className="timeline-button-label">다음 변화 </span>▶
        </button>
      </div>
      <div className="timeline-row">
      <div className="timeline-prehistory" role="group" aria-label="선사 시대">
        {PREHISTORY.map((s) => (
          <button key={s.year} type="button" aria-pressed={stage?.year === s.year} onClick={() => setYear(s.year)} title={`${s.name} (${formatYear(s.year)})`}>
            {s.short}
          </button>
        ))}
      </div>
      <div className="timeline-track">
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={Math.max(min, decadeOf(year))}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="연도"
          aria-valuetext={formatYear(year)}
        />
        <div className="timeline-years" aria-hidden>
          {marks.map((m) => (
            <span key={m.year} className={['timeline-mark', m.major && 'major', m.m500 && 'm500'].filter(Boolean).join(' ')} style={{ left: `${percent(m.year)}%` }}>
              {m.label && (
                <span className={['timeline-mark-label', m.k1000 && 'k1000', percent(m.year) > 95 && 'edge-r', percent(m.year) < 5 && 'edge-l'].filter(Boolean).join(' ')}>{m.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
