import { useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { clampYear, decadeOf, formatYear, parseYearInput } from '../lib/year.ts';
import { useAppStore } from '../store/useAppStore.ts';

/** 타임라인 (DESIGN.md D7): 슬라이더는 10년 단위, 연도 직접 입력, 이전/다음 지도 변화로 이동 */
export function Timeline({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);

  const range = data.timeline.range;
  const [min, max] = [decadeOf(range[0]), decadeOf(range[1])];
  const go = (y: number) => setYear(clampYear(y, range));
  const percent = (y: number) => ((y - min) / (max - min)) * 100;

  const prevChange = [...data.timeline.changeYears].reverse().find((y) => y < year);
  const nextChange = data.timeline.changeYears.find((y) => y > year && y <= range[1]);
  const coverage = data.timeline.intervals.filter((i) => i.file);

  const submit = () => {
    const parsed = parseYearInput(input);
    if (parsed === null) {
      setInvalid(true);
      return;
    }
    go(parsed);
    setInput('');
    setInvalid(false);
  };

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button type="button" disabled={prevChange === undefined} onClick={() => prevChange !== undefined && go(prevChange)} title="이전 지도 변화">
          ◀ 이전 변화
        </button>
        <button type="button" onClick={() => go(year - 10)} aria-label="10년 전">−10년</button>
        <output className="timeline-year" aria-live="polite">{formatYear(year)}</output>
        <button type="button" onClick={() => go(year + 10)} aria-label="10년 후">+10년</button>
        <button type="button" disabled={nextChange === undefined} onClick={() => nextChange !== undefined && go(nextChange)} title="다음 지도 변화">
          다음 변화 ▶
        </button>
        <form
          className="timeline-input"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInvalid(false);
            }}
            placeholder="예: 668, 기원전 57"
            aria-label="연도 입력"
            aria-invalid={invalid}
          />
          <button type="submit">이동</button>
        </form>
      </div>
      <div className="timeline-track">
        <div className="timeline-bands" aria-hidden>
          {coverage.map((i) => (
            <span key={i.from} className="timeline-band" style={{ left: `${percent(i.from)}%`, width: `${Math.max(0.3, percent(i.to) - percent(i.from))}%` }} />
          ))}
          {data.events.map((e) => (
            <span key={e.id} className="timeline-tick" style={{ left: `${percent(e.year)}%` }} />
          ))}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={decadeOf(year)}
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
  );
}
