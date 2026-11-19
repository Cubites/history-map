// 3번 게임: 지도에서 나라 찾기 (2026-11-17, 11-18 움직이는 지도로 바꿈). 이름표 없는 지도에서 나라를 눌러 답한다.
// 쉬움은 이름과 해를 주고, 정답 나라가 있는 권역 화면(본 지도의 권역 단추와 같은 화면)에서 시작한다.
// 어려움은 이름만 주고 세계 화면에서 시작해, 그 나라가 있던 해를 직접 찾게 한다. 한 번 누르면 바로 답이 된다.
import { useEffect, useMemo, useState } from 'react';
import { activeTerritories } from '../data/staticData.ts';
import { REGION_FILTER_INFO } from '../schema/regions.ts';
import { FindMap, type MapItem } from './FindMap.tsx';
import { HINT_COST, Hints, POINTS, Result, Status, findBorderNeighbor, type Hint, type PlayProps } from './parts.tsx';
import { centuryText, neighborsOf, span, unitOf, yearText } from './questions.ts';

export function FindGame({ data, q, level, total, outcomes, onView, onNext }: PlayProps) {
  const hard = level === 'hard';
  const [min, max] = data.timeline.range;
  const [year, setYear] = useState(hard ? Math.round((min + max) / 2) : q.year);
  /** 지도에 그리는 해. 막대를 끄는 동안 매번 다시 그리지 않게 조금 늦게 따라간다 */
  const [shown, setShown] = useState(year);
  const [picked, setPicked] = useState<string | null>(null);
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShown(year), 120);
    return () => clearTimeout(timer);
  }, [year]);

  // 그 해에 있던 나라 전부. 넓은 것부터 그려 작은 나라가 위에 오게 한다
  const items = useMemo<MapItem[]>(
    () =>
      activeTerritories(data.territories, shown)
        .filter((t) => data.entities.get(t.entityId)?.level === 'polity')
        .sort((a, b) => span(b) - span(a))
        .map((t) => ({ id: t.entityId, key: t.key, color: data.entities.get(t.entityId)!.color, anchor: t.anchor, bbox: t.bbox })),
    [data, shown],
  );

  const nameOf = (id: string) => data.entities.get(id)?.names.ko ?? '';
  const isTarget = (id: string) => nameOf(id) === q.entity.names.ko;
  const ok = picked !== null && isTarget(picked);
  const points = Math.max(0, POINTS - HINT_COST * opened);
  const unit = unitOf(q.entity);
  const start = useMemo(() => (hard ? 'world' : REGION_FILTER_INFO[unit]?.bounds ?? 'world'), [hard, unit]);

  const pick = (id: string) => {
    if (picked !== null) return;
    setPicked(id);
    // 고른 해에 정답 나라가 없었다면, 정답을 보여 주려고 그 나라가 있던 해로 옮긴다
    if (!items.some((it) => isTarget(it.id))) {
      setYear(q.year);
      setShown(q.year);
    }
  };

  // 답한 뒤: 정답 나라로 화면을 옮겨 진한 테두리와 이름으로 보이고, 잘못 누른 나라에도 이름을 붙인다
  const target = picked === null ? undefined : items.find((it) => isTarget(it.id));
  // 마지막 힌트: 국경을 맞댄 나라 하나를 지도에 굵은 테두리와 이름으로 표시한다 (undefined는 찾는 중, null은 없음)
  const borderAt = hard ? 3 : 1;
  const borderOpen = opened > borderAt;
  const [border, setBorder] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!borderOpen) return;
    let on = true;
    findBorderNeighbor(data, q).then((id) => on && setBorder(id)).catch(() => on && setBorder(null));
    return () => {
      on = false;
    };
  }, [borderOpen, data, q]);
  const borderShown = borderOpen && border ? border : undefined;

  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    if (borderShown) out[borderShown] = nameOf(borderShown);
    if (target) out[target.id] = nameOf(target.id);
    if (picked) out[picked] = nameOf(picked);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id, picked, borderShown]);
  const focus = useMemo(() => target?.bbox ?? null, [target?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // 나라가 있던 세기 범위 (끝 해는 그 해를 포함한다. null이면 지금까지)
  const [firstCentury, lastCentury] = [centuryText(q.entity.from), centuryText(q.entity.to ?? max)];
  const lifeCenturies = firstCentury === lastCentury ? firstCentury : `${firstCentury}~${lastCentury}`;
  const neighborNames = useMemo(() => [...new Set(neighborsOf(data, q).map((t) => nameOf(t.entityId)))], [data, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const hints: Hint[] = [
    // 쉬움은 그 권역 화면에서 시작하므로 권역 힌트를 두지 않는다
    ...(hard ? [['권역', unit ? REGION_FILTER_INFO[unit].label : '권역 정보가 없습니다.'] as Hint] : []),
    // 어려움: 해를 옮길 때 그 나라가 있는지 없는지는 알려 주지 않는다(밀어 보기만 해도 찾게 되므로, 2026-11-18).
    // 대신 있던 시기를 세기 단위로만 알려 주는 힌트를 둔다. 쉬움은 해를 주므로 두지 않는다
    ...(hard ? [['있던 시기', `${lifeCenturies}에 있던 나라입니다.`] as Hint] : []),
    ['이웃 나라 이름', neighborNames.length ? neighborNames.join(', ') : '둘레에 그려진 나라가 없습니다.'],
    ['국경을 맞댄 나라 하나 표시',
      border === undefined ? '찾는 중…'
      : border === null ? '국경을 맞댄 나라를 찾지 못했습니다.'
      : items.some((it) => it.id === border) ? `지도에 굵은 테두리로 표시한 나라가 ${nameOf(border)}입니다. 정답 나라와 국경을 맞대고 있습니다.`
      : `${nameOf(border)}. 지금 지도의 해에는 이 나라가 없습니다.`],
  ];
  const life = `${yearText(q.entity.from)}~${q.entity.to === null ? '지금' : yearText(q.entity.to)}`;

  return (
    <div className="mg-game">
      <Status title="지도에서 나라 찾기" level={level} total={total} outcomes={outcomes} points={points} />
      <div className="mg-mapwrap">
        <FindMap items={items} start={start} focus={focus} mainId={target?.id} labels={labels} highlightId={borderShown} onPick={picked === null ? pick : undefined} />
        <div className="mg-chip">이름표 숨김 · {yearText(shown)}</div>
      </div>
      <aside className="mg-panel">
        <p className="mg-q">지도에서 <em>{q.entity.names.ko}</em> 찾기</p>
        <p className="mg-sub">
          {hard
            ? '이 나라가 있던 해로 지도를 옮긴 뒤 나라를 누르세요. 한 번 누르면 바로 답이 됩니다.'
            : `${yearText(q.year)}의 지도입니다. 한 번 누르면 바로 답이 됩니다.`}
          {' '}지도는 끌어서 옮기고, 휠이나 +/− 단추로 확대합니다.
        </p>
        {hard && (
          <div className="mg-yearpick">
            <b>{yearText(year)}</b>
            <input type="range" aria-label="지도의 해" min={min} max={max} value={year} disabled={picked !== null} onChange={(e) => setYear(Number(e.target.value))} />
            <div className="mg-row">
              {[-100, -10, 10, 100].map((d) => (
                <button key={d} className="mg-ghost" disabled={picked !== null} onClick={() => setYear(Math.min(max, Math.max(min, year + d)))}>
                  {d > 0 ? '+' : '−'}{Math.abs(d)}년
                </button>
              ))}
            </div>
          </div>
        )}
        {picked !== null && (
          <Result
            ok={ok}
            title={ok ? '정답입니다.' : `아쉽습니다. 누른 곳은 ${nameOf(picked)}`}
            sub={`${q.entity.names.ko} · ${hard ? `${life}에 있던 나라` : yearText(q.year)} · ${ok ? points : 0}점`}
            last={outcomes.length + 1 === total}
            onView={() => onView(q)}
            onNext={() => onNext({ q, ok, hints: opened, points: ok ? points : 0 })}
          />
        )}
        <Hints hints={hints} opened={opened} answered={picked !== null} onOpen={() => setOpened(opened + 1)} />
      </aside>
    </div>
  );
}
