import { useMemo, useRef, useState } from 'react';
import type { LoadedEntity, LoadedEvent, StaticData } from '../data/staticData.ts';
import { useMediaQuery } from '../lib/useMediaQuery.ts';
import { eventDateText, focusTarget } from '../lib/events.ts';
import { formatRange, isAlive } from '../lib/year.ts';
import { inRegionFilter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';

type Result = { kind: 'event'; event: LoadedEvent; score: number } | { kind: 'entity'; entity: LoadedEntity; score: number };

/** 찾을 분야(2026-11-20): 검색창 왼쪽에서 고른다. 전체는 나라를 맨 위에, 그 아래 사건 */
type Scope = 'all' | 'entity' | 'event';
const SCOPES: { value: Scope; label: string; hint: string; empty: string }[] = [
  { value: 'all', label: '전체', hint: '사건·나라 찾기', empty: '찾는 사건·나라가 없습니다' },
  { value: 'entity', label: '국가명', hint: '나라 찾기', empty: '찾는 나라가 없습니다' },
  { value: 'event', label: '사건', hint: '사건 찾기', empty: '찾는 사건이 없습니다' },
];

const MAX_RESULTS = 8;
/** 권역 필터를 골랐을 때 다른 권역 결과가 있으면 목록 끝에 남겨 두는 칸 수 (DESIGN.md §6.4.2) */
const OTHER_REGION_SLOTS = 2;
/** 띄어쓰기·대소문자를 무시하고 비교한다 ("관산성전투" = "관산성 전투") */
const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase();

/**
 * 머리글의 검색 (DESIGN.md §6.4.1). 사건(제목·설명·싸운 곳)과 나라(이름·한자)를 찾는다.
 * 사건을 고르면 그 해로 가서 사건을 패널에 띄우고, 나라를 고르면 그 나라를 고른다.
 * 어느 쪽이든 지도는 그 나라(사건은 사건의 나라)의 그 해 영토로 옮기고 알맞게 확대·축소한다 (2026-11-11, focusMap).
 * 권역 필터를 고르면 그 권역의 결과를 먼저 보여 준다. 다른 권역 결과가 있으면 끝의 2칸은 그것에 남겨 두어 숨기지 않는다 (DESIGN.md §6.4.2)
 * 검색창 왼쪽에서 찾을 분야(전체·국가명·사건)를 고른다. 전체는 나라를 목록 맨 위에 놓는다 (2026-11-20)
 */
export function SearchBox({ data }: { data: StaticData }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const setYear = useAppStore((s) => s.setYear);
  const select = useAppStore((s) => s.select);
  const focusEvent = useAppStore((s) => s.focusEvent);
  const exitWar = useAppStore((s) => s.exitWar);
  const focusMap = useAppStore((s) => s.focusMap);
  const warId = useAppStore((s) => s.warId);
  const regionFilter = useAppStore((s) => s.regionFilter);
  // 휴대폰에서는 검색창이 좁아 예시를 빼고 짧게 쓴다
  const narrow = useMediaQuery('(max-width: 767px)');

  const results = useMemo<Result[]>(() => {
    const q = normalize(query);
    if (!q) return [];
    const entities: Result[] = [];
    const events: Result[] = [];
    for (const entity of scope === 'event' ? [] : data.entities.values()) {
      const name = normalize(entity.names.ko);
      const other = [entity.names.hanja, entity.names.native].some((n) => n && n.toLowerCase().includes(query.trim().toLowerCase()));
      if (name.includes(q) || other) {
        entities.push({ kind: 'entity', entity, score: name === q ? 0 : name.startsWith(q) ? 1 : 3 });
      }
    }
    for (const event of scope === 'entity' ? [] : data.events) {
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
      if (score >= 0) events.push({ kind: 'event', event, score });
    }
    // 고른 권역의 결과를 먼저, 다른 권역 결과는 뒤에. 다른 권역 결과가 있으면 끝의 OTHER_REGION_SLOTS칸은 그것에 남겨 둔다
    // (고른 권역 결과가 적으면 남는 칸도 다른 권역 결과로 채운다). 전체이면 모두 고른 권역으로 본다
    const inside = (r: Result) => (r.kind === 'event' ? inRegionFilter(regionFilter, r.event.region, r.event.units) : inRegionFilter(regionFilter, r.entity.region, r.entity.units));
    const take = (found: Result[], slots: number) => {
      found.sort((a, b) => a.score - b.score || yearOf(a) - yearOf(b));
      const mine = found.filter(inside);
      const others = found.filter((r) => !inside(r));
      const otherCount = Math.min(others.length, slots, Math.max(OTHER_REGION_SLOTS, slots - mine.length));
      return [...mine.slice(0, slots - otherCount), ...others.slice(0, otherCount)];
    };
    // 나라를 맨 위에, 남은 칸에 사건(2026-11-20). 분야를 하나만 고르면 다른 쪽은 비어 있다
    const top = take(entities, MAX_RESULTS);
    return [...top, ...take(events, MAX_RESULTS - top.length)];
  }, [data, query, regionFilter, scope]);

  const scopeInfo = SCOPES.find((s) => s.value === scope) ?? SCOPES[0];

  const pick = (r: Result) => {
    if (warId) exitWar();
    if (r.kind === 'event') {
      const { event } = r;
      // 사건 연도에 있던 나라 가운데 사건의 첫 주체를 골라 패널에 사건을 띄운다.
      // 사건 연도에 있던 주체가 없으면 사건 기간과 그 주체의 존재 기간이 겹치는 구간의 첫 해로 옮긴다 (focusTarget)
      const target = focusTarget(event, (id) => data.entities.get(id), event.year);
      setYear(target?.year ?? event.year);
      if (target) {
        focusEvent(target.subject, event.id);
        focusMap(target.subject);
      }
    } else {
      const { entity } = r;
      const year = useAppStore.getState().year;
      if (!isAlive(entity, year)) setYear(entity.from);
      select(entity.id);
      focusMap(entity.id);
    }
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="search">
      {/* 찾을 분야(2026-11-20). 바꾸면 쓰던 낱말로 바로 다시 찾는다 */}
      <select
        className="search-scope"
        aria-label="찾을 분야"
        value={scope}
        onChange={(e) => {
          setScope(e.target.value as Scope);
          setActive(0);
          if (query.trim()) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        {SCOPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {/* 분야 칸과 글 칸 사이 세로선(2026-11-21): 둘을 한 상자로 보이게 하고 이 선으로 나눈다 */}
      <span className="search-divider" aria-hidden="true" />
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder={narrow || scope !== 'all' ? scopeInfo.hint : '사건·나라 찾기 (예: 관산성, 서희)'}
        aria-label={scopeInfo.hint}
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
          {results.length === 0 && <li className="search-empty">{scopeInfo.empty}</li>}
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
                  <span className="search-year">{eventDateText(r.event)}</span>
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
