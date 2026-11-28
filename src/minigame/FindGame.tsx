// 3번 게임: 나라 찾기 (2026-11-17, 11-18 움직이는 지도로 바꿈, 11-23 난이도 셋·힌트 고침). 이름표 없는 지도에서 나라를 눌러 답한다.
// 쉬움은 이름과 해를 주고, 정답 나라가 있는 권역 화면(본 지도의 권역 단추와 같은 화면)에서 시작한다.
// 보통은 쉬움과 같되 세계 화면에서 시작하고, 권역은 힌트로 준다(열면 그 권역 화면으로 옮긴다).
// 어려움은 이름만 주고 세계 화면에서 시작해, 그 나라가 있던 해를 직접 찾게 한다.
// 나라를 누르면 바로 답이 되지 않고(2026-11-27, 잘못 누름 방지) 그 나라를 화면 가운데로 옮기고 '이 국가를 선택하시겠습니까?'를 묻는다. '예'를 눌러야 답이 된다.
import { useEffect, useMemo, useState } from 'react';
import { parseYearInput } from '../lib/year.ts';
import { activeTerritories } from '../data/staticData.ts';
import { REGION_FILTER_INFO, regionFocusBounds } from '../schema/regions.ts';
import { FindMap, type MapItem } from './FindMap.tsx';
import { Gain, HINT_COST, Hints, POINTS, Result, Status, findBorderNeighbor, type Hint, type PlayProps } from './parts.tsx';
import { neighborsOf, peakOf, span, unitOf, yearText, type Question } from './questions.ts';

export function FindGame({ data, q, level, total, outcomes, onView, onNext }: PlayProps) {
  const easy = level === 'easy';
  const hard = level === 'hard';
  const [min, max] = data.timeline.range;
  const [year, setYear] = useState(hard ? Math.round((min + max) / 2) : q.year);
  /** 지도에 그리는 해. 막대를 끄는 동안 매번 다시 그리지 않게 조금 늦게 따라간다 */
  const [shown, setShown] = useState(year);
  const [picked, setPicked] = useState<string | null>(null);
  /** 누른 나라(아직 답이 아님). '예'를 누르면 답이 되고 '아니오'를 누르면 풀린다 */
  const [pending, setPending] = useState<string | null>(null);
  const [opened, setOpened] = useState(0);
  /** 어려움의 연도 입력 칸에 적는 중인 글 (null이면 지도의 해를 그대로 보인다). Enter를 누르거나 칸을 벗어나면 그 해로 옮긴다 */
  const [typed, setTyped] = useState<string | null>(null);
  const commitYear = () => {
    const y = typed === null ? null : parseYearInput(typed);
    if (y !== null) setYear(Math.min(max, Math.max(min, y)));
    setTyped(null);
  };
  const stepButton = (d: number) => (
    <button key={d} type="button" className="mg-ghost" disabled={picked !== null} onClick={() => setYear(Math.min(max, Math.max(min, year + d)))}>
      {d > 0 ? '+' : '−'}{Math.abs(d)}년
    </button>
  );

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
  const start = useMemo(() => (easy && unit ? regionFocusBounds(unit) ?? 'world' : 'world'), [easy, unit]);

  // 정답 나라가 가장 넓었던 모습과 그 해: '있던 시기' 힌트가 이 해로 옮기고, 이웃 나라 목록도 이 해를 기준으로 한다
  // (쉬움·보통은 문제 자체가 이 모습이다. 어려움은 문제의 모습이 아무 시기라 따로 구한다)
  const peak = useMemo<Question>(() => ({ ...q, ...peakOf(data, q) }), [data, q]);
  const goYear = (y: number) => {
    setYear(y);
    setShown(y);
  };

  // 힌트 차례 (없는 힌트는 -1): 쉬움은 그 권역 화면에서 시작하므로 권역 힌트가 없고, 해를 주는 쉬움·보통은 있던 시기 힌트가 없다
  const order = [...(easy ? [] : ['area']), ...(hard ? ['life'] : []), 'near', 'border'];
  const isOpen = (id: string) => order.includes(id) && opened > order.indexOf(id);
  const areaOpen = isOpen('area');
  const nearOpen = isOpen('near');
  const borderOpen = isOpen('border');
  /** 권역 힌트를 열면 지도를 그 권역 화면으로 옮긴다 */
  const area = areaOpen && unit ? regionFocusBounds(unit) ?? null : null;
  const openHint = () => {
    // '있던 시기'를 열면 지도의 해를 영토가 가장 넓었던 해로 옮긴다
    if (order[opened] === 'life') goYear(peak.year);
    setOpened(opened + 1);
  };

  const pick = (id: string) => {
    if (picked !== null) return;
    setPending(null);
    setPicked(id);
    // 고른 해에 정답 나라가 없었다면 정답을 보여 주려고, 이웃 나라 힌트를 열었다면 그 나라들에 이름을 붙이려고 영토가 가장 넓었던 해로 옮긴다
    if (!items.some((it) => isTarget(it.id)) || (nearOpen && shown !== peak.year)) goYear(peak.year);
  };

  // 답한 뒤: 정답 나라로 화면을 옮겨 진한 테두리와 이름으로 보이고, 잘못 누른 나라에도 이름을 붙인다
  const target = picked === null ? undefined : items.find((it) => isTarget(it.id));
  // 마지막 힌트: 국경을 맞댄 나라 하나를 지도에 굵은 테두리와 이름으로 표시한다 (undefined는 찾는 중, null은 없음)
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

  const nearIds = useMemo(() => [...new Set(neighborsOf(data, peak).map((t) => t.entityId))], [data, peak]);
  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    // 이웃 나라 힌트를 열고 답했으면 그 이웃 나라들에도 이름을 붙인다
    if (picked && nearOpen) for (const id of nearIds) out[id] = nameOf(id);
    if (borderShown) out[borderShown] = nameOf(borderShown);
    if (target) out[target.id] = nameOf(target.id);
    if (picked) out[picked] = nameOf(picked);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id, picked, borderShown, nearOpen, nearIds]);
  const focus = useMemo(() => target?.bbox ?? null, [target?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  // 고르는 중인 나라: 지도의 해가 바뀌어 그 나라가 사라지면 풀린다. 그 나라의 이름표 자리를 화면 가운데로 옮긴다
  const pendingItem = pending === null ? undefined : items.find((it) => it.id === pending);
  useEffect(() => {
    if (pending !== null && !pendingItem) setPending(null);
  }, [pending, pendingItem]);
  const centerOn = useMemo(() => pendingItem?.anchor ?? null, [pendingItem?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const life = `${yearText(q.entity.from)}~${q.entity.to === null ? '지금' : yearText(q.entity.to)}`;
  const neighborNames = [...new Set(nearIds.map(nameOf))];
  const all: Record<string, Hint> = {
    area: ['권역', unit ? `${REGION_FILTER_INFO[unit].label}. 지도를 이 권역으로 옮겼습니다.` : '권역 정보가 없습니다.'],
    // 어려움: 해를 옮길 때 그 나라가 있는지 없는지는 알려 주지 않는다(밀어 보기만 해도 찾게 되므로, 2026-11-18).
    // 대신 있던 기간을 알려 주고 지도의 해를 영토가 가장 넓었던 해로 옮기는 힌트를 둔다
    life: ['있던 시기', `${life}에 있던 나라입니다. 지도의 해를 영토가 가장 넓었던 ${yearText(peak.year)}으로 옮겼습니다.`],
    near: ['이웃 나라 이름', neighborNames.length ? neighborNames.join(', ') : '둘레에 그려진 나라가 없습니다.'],
    border: ['국경을 맞댄 나라 하나 표시',
      border === undefined ? '찾는 중…'
      : border === null ? '국경을 맞댄 나라를 찾지 못했습니다.'
      : items.some((it) => it.id === border) ? `지도에 굵은 테두리로 표시한 나라가 ${nameOf(border)}입니다. 정답 나라와 국경을 맞대고 있습니다.`
      : `${nameOf(border)}. 지금 지도의 해에는 이 나라가 없습니다.`],
  };
  const hints = order.map((id) => all[id]);

  return (
    <div className="mg-game">
      <Status title="나라 찾기" level={level} total={total} outcomes={outcomes} />
      <div className="mg-mapwrap">
        <FindMap items={items} start={start} area={area} focus={focus} mainId={target?.id} labels={labels} highlightId={borderShown} pendingId={picked === null ? pending : null} centerOn={centerOn} onPick={picked === null ? setPending : undefined} />
        {picked === null && pendingItem && (
          <div className="mg-confirm" role="dialog" aria-label="나라 선택 확인">
            <p>이 국가를 선택하시겠습니까?</p>
            <div className="mg-row">
              <button className="mg-primary" onClick={() => pick(pendingItem.id)}>예</button>
              <button className="mg-ghost" onClick={() => setPending(null)}>아니오</button>
            </div>
          </div>
        )}
        {ok && <Gain points={points} />}
      </div>
      <aside className="mg-panel">
        <p className="mg-q">지도에서 <em>{q.entity.names.ko}</em> 찾기</p>
        <p className="mg-sub">
          {hard
            ? '해당 국가가 있는 연도를 찾고 지도에서 선택하세요'
            : `${yearText(q.year)}의 지도입니다. 나라를 누른 뒤 '예'를 누르면 답이 됩니다. 지도는 끌어서 옮기고, 휠이나 +/− 단추로 확대합니다.`}
        </p>
        {hard && (
          <div className="mg-yearpick">
            {/* 연도 막대 위 한 줄(2026-11-28): 가운데에 연도 입력 칸, 왼쪽 끝에 −100년·−10년, 오른쪽 끝에 +10년·+100년 */}
            <form className="mg-yearrow" onSubmit={(e) => { e.preventDefault(); commitYear(); }}>
              {[-100, -10].map(stepButton)}
              <input
                aria-label="지도의 해 입력"
                value={typed ?? yearText(year)}
                disabled={picked !== null}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setTyped(e.target.value)}
                onBlur={commitYear}
              />
              {[10, 100].map(stepButton)}
            </form>
            <input type="range" aria-label="지도의 해" min={min} max={max} value={year} disabled={picked !== null} onChange={(e) => setYear(Number(e.target.value))} />
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
        <Hints hints={hints} opened={opened} answered={picked !== null} onOpen={openHint} />
      </aside>
    </div>
  );
}
