import { useMemo, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { useMediaQuery } from '../lib/useMediaQuery.ts';
import { formatEventYears } from '../lib/events.ts';
import { formatRange, isAlive } from '../lib/year.ts';
import type { Entity, HistoryEvent } from '../schema/index.ts';
import { useAppStore } from '../store/useAppStore.ts';

type Result = { kind: 'event'; event: HistoryEvent; score: number } | { kind: 'entity'; entity: Entity; score: number };

const MAX_RESULTS = 8;
/** 띄어쓰기·대소문자를 무시하고 비교한다 ("관산성전투" = "관산성 전투") */
const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase();

/**
 * 머리글의 검색 (DESIGN.md §6.4.1). 사건(제목·설명·싸운 곳)과 나라(이름·한자)를 찾는다.
 * 사건을 고르면 그 해로 가서 사건을 패널에 띄우고, 나라를 고르면 그 나라를 고른다.
 */
export function SearchBox({ data }: { data: StaticData }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setYear = useAppStore((s) => s.setYear);
  const select = useAppStore((s) => s.select);
  const focusEvent = useAppStore((s) => s.focusEvent);
  const exitWar = useAppStore((s) => s.exitWar);
  const warId = useAppStore((s) => s.warId);
  // 휴대폰에서는 검색창이 좁아 예시를 빼고 짧게 쓴다
  const narrow = useMediaQuery('(max-width: 767px)');

  const results = useMemo<Result[]>(() => {
    const q = normalize(query);
    if (!q) return [];
    const found: Result[] = [];
    for (const entity of data.entities.values()) {
      const name = normalize(entity.names.ko);
      if (name.includes(q) || (entity.names.hanja && entity.names.hanja.includes(query.trim()))) {
        found.push({ kind: 'entity', entity, score: name === q ? 0 : name.startsWith(q) ? 1 : 3 });
      }
    }
    for (const event of data.events) {
      const title = normalize(event.title.ko);
      const places = (event.places ?? []).map((p) => normalize(p.name));
      const score = title.includes(q)
        ? title.startsWith(q)
          ? 1
          : 2
        : places.some((p) => p.includes(q))
          ? 3
          : normalize(event.summary.ko).includes(q)
            ? 4
            : -1;
      if (score >= 0) found.push({ kind: 'event', event, score });
    }
    return found
      .sort((a, b) => a.score - b.score || yearOf(a) - yearOf(b))
      .slice(0, MAX_RESULTS);
  }, [data, query]);

  const pick = (r: Result) => {
    if (warId) exitWar();
    if (r.kind === 'event') {
      const { event } = r;
      setYear(event.year);
      // 그 해에 있던 나라 가운데 사건의 첫 주체를 골라 패널에 사건을 띄운다
      const subject = event.subjects.find((id) => {
        const entity = data.entities.get(id);
        return entity && isAlive(entity, event.year);
      });
      if (subject) focusEvent(subject, event.id);
    } else {
      const { entity } = r;
      const year = useAppStore.getState().year;
      if (!isAlive(entity, year)) setYear(entity.from);
      select(entity.id);
    }
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="search">
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder={narrow ? '사건·나라 찾기' : '사건·나라 찾기 (예: 관산성, 서희)'}
        aria-label="사건·나라 찾기"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && results[active]) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && query.trim() && (
        <ul className="search-results" role="listbox">
          {results.length === 0 && <li className="search-empty">찾는 사건·나라가 없습니다</li>}
          {results.map((r, i) => (
            <li
              key={r.kind === 'event' ? `e:${r.event.id}` : `n:${r.entity.id}`}
              role="option"
              aria-selected={i === active}
              className={`search-result${i === active ? ' search-result-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(r);
              }}
            >
              {r.kind === 'event' ? (
                <>
                  <span className="search-year">{formatEventYears(r.event)}</span>
                  <span className="search-title">{r.event.title.ko}</span>
                </>
              ) : (
                <>
                  <span className="search-year">나라</span>
                  <span className="search-title">
                    {r.entity.names.ko} <span className="search-sub">{formatRange(r.entity.from, r.entity.to)}</span>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const yearOf = (r: Result) => (r.kind === 'event' ? r.event.year : r.entity.from);
