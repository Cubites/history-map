import { useMemo, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { PREHISTORY, clampYear, decadeOf, formatYear, parseYearInput, prehistoryStage } from '../lib/year.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { FrontTimeline } from './FrontTimeline.tsx';
import { activeWarView } from '../lib/wars.ts';

/** 영토 데이터가 있는 기간을 겹치지 않게 합친다 (슬라이더 뒤 표시용) */
function coverageRanges(data: StaticData): [number, number][] {
  const end = data.timeline.range[1] + 1;
  const sorted = data.territories.map((t) => [t.from, t.to ?? end] as [number, number]).sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [from, to] of sorted) {
    const last = merged[merged.length - 1];
    if (last && from <= last[1]) last[1] = Math.max(last[1], to);
    else merged.push([from, to]);
  }
  return merged;
}

/**
 * 타임라인 (DESIGN.md D7): 슬라이더는 10년 단위, 연도 직접 입력, 이전/다음 지도 변화로 이동.
 * 모바일 세로 화면에서는 화면 위쪽에 놓이고, 연도를 누르면 입력 칸이 열린다 (DESIGN.md §6.5).
 */
export function Timeline({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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
  const coverage = useMemo(() => coverageRanges(data), [data]);

  const submit = () => {
    const parsed = parseYearInput(input);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    go(parsed);
    setInput('');
    setInvalid(false);
    setEditing(false);
  };

  // 전쟁 보기에서는 연도 타임라인 대신 그 전쟁의 날짜 축을 보여 준다 (DESIGN.md §4.5)
  if (inWar) {
    return (
      <div className="timeline timeline-war">
        <FrontTimeline data={data} />
      </div>
    );
  }

  return (
    <div className="timeline" data-editing={editing}>
      <div className="timeline-controls">
        <button type="button" disabled={prevChange === undefined} onClick={() => prevChange !== undefined && go(prevChange)} title="이전 지도 변화" aria-label="이전 지도 변화">
          ◀<span className="timeline-button-label"> 이전 변화</span>
        </button>
        <button type="button" onClick={() => go(year - 10)} aria-label="10년 전">−10년</button>
        <button
          type="button"
          className="timeline-year"
          aria-live="polite"
          title="연도 직접 입력"
          onClick={() => {
            setEditing((v) => !v);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          {stage ? `${stage.name} · ${formatYear(year)}` : formatYear(year)}
        </button>
        <button type="button" onClick={forward} aria-label="10년 후">+10년</button>
        <button type="button" disabled={nextChange === undefined} onClick={() => nextChange !== undefined && go(nextChange)} title="다음 지도 변화" aria-label="다음 지도 변화">
          <span className="timeline-button-label">다음 변화 </span>▶
        </button>
        <form
          className="timeline-input"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInvalid(false);
            }}
            placeholder="예: 668, 기원전 57"
            aria-label="연도 입력"
            aria-invalid={invalid}
            inputMode="text"
          />
          <button type="submit">이동</button>
        </form>
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
        <div className="timeline-bands" aria-hidden>
          {coverage.map(([from, to]) => (
            <span key={from} className="timeline-band" style={{ left: `${percent(from)}%`, width: `${Math.max(0.3, percent(to) - percent(from))}%` }} />
          ))}
          {data.events.filter((e) => e.year >= min).map((e) => (
            <span key={e.id} className="timeline-tick" style={{ left: `${percent(e.year)}%` }} />
          ))}
        </div>
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
        <div className="timeline-scale" aria-hidden>
          <span>{formatYear(range[0])}</span>
          <span>{formatYear(range[1])}</span>
        </div>
      </div>
      </div>
    </div>
  );
}
