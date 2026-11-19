// 미니게임 (2026-11-17). 본 지도 위에 덮어 띄우는 화면: 고르기 → 문제 10개 → 결과.
// 게임 셋: 나라 이름 맞추기(이 파일), 연도 맞추기(YearGame), 지도에서 나라 찾기(FindGame). 점수 숫자는 임시값이다(parts.tsx).
import { useEffect, useMemo, useState } from 'react';
import { geoArea } from 'd3-geo';
import { loadEntityGeometry, type StaticData, type TerritoryFeature } from '../data/staticData.ts';
import { REGION_FILTERS, REGION_FILTER_INFO, type RegionFilter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { FindGame } from './FindGame.tsx';
import { FindMap, type MapItem } from './FindMap.tsx';
import { QuizMap } from './QuizMap.tsx';
import { YearGame } from './YearGame.tsx';
import { HINT_COST, Hints, LAND_HINT, POINTS, Result, Status, type Hint, type Outcome, type PlayProps } from './parts.tsx';
import { ROUND, buildQuestions, centuryText, eventHint, neighborsOf, yearText, type Level, type Question } from './questions.ts';

type Game = 'name' | 'year' | 'find';
const GAMES: { id: Game; title: string; about: string; rule: string; play: (p: PlayProps) => JSX.Element }[] = [
  {
    id: 'name',
    title: '나라 이름 맞추기',
    about: '색칠된 영토를 보고 어느 나라인지 맞춥니다.',
    rule: '쉬움은 넓은 나라의 전성기 모습만, 어려움은 작은 나라와 모든 시기 모습을 냅니다. 어려움은 처음에 국경선만 보이고, 둘레의 육지와 바다는 첫 힌트로 엽니다. 쉬움과 어려움 모두 4지선다입니다.',
    play: NameGame,
  },
  {
    id: 'year',
    title: '연도 맞추기',
    about: '영토 모습을 보고 어느 해인지 맞춥니다.',
    rule: '쉬움은 몇 세기인지 맞춥니다(넓은 나라의 전성기 모습만 냅니다). 어려움은 연도를 적어 10년 단위까지 맞추고, 영토가 그대로였던 기간 안의 해를 적으면 가산점을 받습니다. 어려움은 처음에 국경선만 보이고, 둘레의 육지와 바다는 첫 힌트로 엽니다.',
    play: YearGame,
  },
  {
    id: 'find',
    title: '지도에서 나라 찾기',
    about: '이름표 없는 지도에서 나라를 찾아 누릅니다.',
    rule: '쉬움은 이름과 해를 주고, 그 나라가 있는 권역 화면에서 시작합니다. 어려움은 이름만 주고 세계 화면에서 시작하므로, 그 나라가 있던 해를 직접 찾아야 합니다. 지도는 역사 지도처럼 끌어서 옮기고 휠로 확대합니다.',
    play: FindGame,
  },
];

export function MiniGame({ data, onClose }: { data: StaticData; onClose: () => void }) {
  const [game, setGame] = useState<Game>('name');
  const [level, setLevel] = useState<Level>('easy');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [empty, setEmpty] = useState(false);
  const setYear = useAppStore((s) => s.setYear);
  const selectFocus = useAppStore((s) => s.selectFocus);

  const start = () => {
    const qs = buildQuestions(data, level, region);
    setEmpty(!qs.length);
    setOutcomes([]);
    setQuestions(qs.length ? qs : null);
  };
  /** 본 지도를 그 나라·그 해로 옮기고 게임을 닫는다 */
  const viewOnMap = (q: Question) => {
    setYear(q.year);
    selectFocus(q.entity.id);
    onClose();
  };

  const now = GAMES.find((g) => g.id === game)!;
  const Play = now.play;
  const index = outcomes.length;
  const done = questions !== null && index >= questions.length;
  return (
    <div className="mg" role="dialog" aria-label="미니게임">
      <header className="mg-top">
        <strong>역사 지도 <span>· 미니게임</span></strong>
        {questions && <button className="mg-ghost" onClick={() => setQuestions(null)}>처음으로</button>}
        <button className="mg-ghost mg-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" />
            <path d="M9 4v13.5M15 6.5V20" />
          </svg>
          지도로
        </button>
      </header>
      {!questions && (
        <div className="mg-lobby">
          <h2>어떤 게임을 할까요?</h2>
          <p className="mg-sub">역사 지도의 영토와 사건으로 푸는 문제입니다. 한 판은 {ROUND}문제입니다.</p>
          <div className="mg-cards">
            {GAMES.map((g) => (
              <button key={g.id} className={`mg-card${g.id === game ? ' on' : ''}`} aria-pressed={g.id === game} onClick={() => setGame(g.id)}>
                <h3>{g.title}</h3><p>{g.about}</p>
              </button>
            ))}
          </div>
          <div className="mg-setup">
            <label>난이도
              <span className="mg-seg">
                <button aria-pressed={level === 'easy'} onClick={() => setLevel('easy')}>쉬움</button>
                <button aria-pressed={level === 'hard'} onClick={() => setLevel('hard')}>어려움</button>
              </span>
            </label>
            <label>권역
              <select value={region} onChange={(e) => setRegion(e.target.value as RegionFilter)}>
                <option value="all">모든 권역</option>
                {REGION_FILTERS.map((id) => <option key={id} value={id}>{REGION_FILTER_INFO[id].label}</option>)}
              </select>
            </label>
            <button className="mg-primary" onClick={start}>시작하기</button>
          </div>
          <p className="mg-sub">{now.rule}</p>
          {empty && <p className="mg-warn">이 조건에 맞는 문제가 없습니다. 권역을 바꿔 보세요.</p>}
        </div>
      )}
      {questions && !done && (
        <Play
          key={index}
          data={data}
          q={questions[index]}
          level={level}
          total={questions.length}
          outcomes={outcomes}
          onView={viewOnMap}
          onNext={(o) => setOutcomes([...outcomes, o])}
        />
      )}
      {questions && done && <End game={game} outcomes={outcomes} onAgain={start} onLobby={() => setQuestions(null)} onView={viewOnMap} />}
    </div>
  );
}

/** 1번 게임: 나라 이름 맞추기 (4지선다) */
function NameGame({ data, q, level, total, outcomes, onView, onNext }: PlayProps) {
  // 어려움은 처음에 국경선만 보이고, 둘레의 육지와 바다가 첫 힌트가 된다 (그만큼 뒤 힌트의 차례가 하나씩 밀린다)
  const shift = level === 'hard' ? 1 : 0;
  // 도형 묶음은 '하나 꺼내기'만 쓴다: 본 저장소 최신 코드는 Map 대신 하나씩만 꺼내는 묶음(LazyMap)을 주므로 둘 다에 맞춘다 (2026-11-19)
  const [geo, setGeo] = useState<{ get(key: string): TerritoryFeature | undefined } | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [opened, setOpened] = useState(0);

  // 최소·최대 영토 힌트에 쓸 이 나라의 모든 시기 도형
  useEffect(() => {
    let on = true;
    loadEntityGeometry('mid', q.entity.id).then((g) => on && setGeo(g)).catch(() => {});
    return () => {
      on = false;
    };
  }, [q]);

  // 힌트 2: 가장 작았을 때와 가장 컸을 때 (구면 넓이로 고른다)
  const extremes = useMemo(() => {
    if (!geo) return null;
    // 이 나라의 영토 열쇠를 목록에서 찾아 하나씩 꺼낸다 (묶음에서 전부 훑는 기능은 최신 코드에 없다)
    const versions = data.territories
      .filter((t) => t.entityId === q.entity.id)
      .map((t) => geo.get(t.key))
      .filter((f): f is TerritoryFeature => f !== undefined)
      .map((feature) => ({ feature, area: geoArea(feature) }))
      .sort((a, b) => a.area - b.area);
    return versions.length ? { min: versions[0].feature, max: versions[versions.length - 1].feature, one: versions.length === 1 } : null;
  }, [geo, data, q]);

  // 힌트 3: 옆 나라는 열 때 도형을 받아 지도에 이름과 함께 그린다
  const showNear = opened >= 3 + shift;
  const near = useMemo(() => neighborsOf(data, q), [data, q]);
  // 지도에 그릴 것: 문제의 나라와 (힌트를 열었으면) 옆 나라들. 옆 나라에만 이름표를 붙인다
  const { items, labels } = useMemo(() => {
    const own: MapItem = { id: q.entity.id, key: q.version.key, color: q.entity.color, anchor: q.version.anchor, bbox: q.version.bbox };
    if (!showNear) return { items: [own], labels: undefined };
    const others = near.map((t): MapItem => ({ id: t.entityId, key: t.key, color: data.entities.get(t.entityId)!.color, anchor: t.anchor, bbox: t.bbox }));
    return { items: [...others, own], labels: Object.fromEntries(near.map((t) => [t.entityId, data.entities.get(t.entityId)!.names.ko])) };
  }, [data, q, near, showNear]);
  const start = useMemo(() => ({ bbox: q.version.bbox }), [q]);
  const event = useMemo(() => eventHint(data, q), [data, q]);
  const hints: Hint[] = [
    ...(shift ? [LAND_HINT] : []),
    ['시대', `${centuryText(q.year)}의 모습입니다.`],
    ['최소 영토와 최대 영토', extremes ? (
      extremes.one ? '이 나라는 지도에서 영토가 한 가지 모습뿐입니다.' : (
        <span className="mg-minis">
          <figure><QuizMap fit={extremes.max} main={{ feature: extremes.min, color: q.entity.color }} zoomOut={0.8} /><figcaption>가장 작았을 때</figcaption></figure>
          <figure><QuizMap fit={extremes.max} main={{ feature: extremes.max, color: q.entity.color }} zoomOut={0.8} /><figcaption>가장 컸을 때</figcaption></figure>
        </span>
      )
    ) : '불러오는 중…'],
    ['옆 나라 영토와 이름', near.length ? '지도에 둘레 나라를 이름과 함께 표시했습니다.' : '그 해에 둘레에 그려진 나라가 없습니다.'],
    ['역사적 사건', event ?? '이 나라에 걸린 사건이 없습니다.'],
  ];

  const points = Math.max(0, POINTS - HINT_COST * opened);
  const ok = picked === q.entity.id;
  // 숫자 글쇠 1~4로 고른다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= q.options.length) setPicked(q.options[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="mg-game">
      <Status title="나라 이름 맞추기" level={level} total={total} outcomes={outcomes} points={points} />
      <div className="mg-mapwrap">
        {/* 쉬움, 그리고 어려움에서 첫 힌트(둘레의 육지와 바다)를 연 뒤에는 본 지도처럼 끌어서 옮기고 확대할 수 있다 */}
        <FindMap items={items} start={start} mainId={q.entity.id} labels={labels} bare={opened < shift} detail />
        <div className="mg-chip">{opened < shift ? '국경선만 표시' : '이름표 숨김 · 끌어서 이동'}</div>
      </div>
      <aside className="mg-panel">
        <p className="mg-q">색칠된 곳은 <em>어느 나라</em>일까요?</p>
        <div className="mg-opts">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className={picked === null ? '' : o.id === q.entity.id ? 'right' : o.id === picked ? 'wrong' : ''}
              disabled={picked !== null}
              onClick={() => picked === null && setPicked(o.id)}
            >
              <kbd>{i + 1}</kbd>{o.names.ko}
            </button>
          ))}
        </div>
        {picked !== null && (
          <Result
            ok={ok}
            title={`${ok ? '정답입니다.' : '아쉽습니다. 정답은'} ${q.entity.names.ko}`}
            sub={`${yearText(q.year)}의 모습 · ${ok ? points : 0}점`}
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

function End({ game, outcomes, onAgain, onLobby, onView }: { game: Game; outcomes: Outcome[]; onAgain: () => void; onLobby: () => void; onView: (q: Question) => void }) {
  const score = outcomes.reduce((sum, o) => sum + o.points, 0);
  let best = 0;
  let run = 0;
  for (const o of outcomes) best = Math.max(best, (run = o.ok ? run + 1 : 0));
  return (
    <div className="mg-end">
      <h2>한 판이 끝났습니다</h2>
      <div className="mg-score">
        <div className="main"><span>점수</span><b>{score} <small>/ {outcomes.reduce((sum, o) => sum + (o.max ?? POINTS), 0)}</small></b></div>
        <div><span>정답</span><b>{outcomes.filter((o) => o.ok).length} <small>/ {outcomes.length}</small></b></div>
        <div><span>가장 긴 연속 정답</span><b>{best}</b></div>
        <div><span>연 힌트</span><b>{outcomes.reduce((sum, o) => sum + o.hints, 0)} <small>개</small></b></div>
      </div>
      <div className="mg-log">
        <div className="hd"><span /><span>나라</span><span>{game === 'year' ? '낸 답 → 영토가 그대로였던 기간' : '출제한 해'}</span><span>힌트</span><span>점수</span><span /></div>
        {outcomes.map((o, i) => (
          <div key={i}>
            <span className={`mark${o.ok ? '' : ' no'}`}>{o.ok ? '○' : '×'}</span>
            <b>{o.q.entity.names.ko}</b>
            <span>{o.note ?? yearText(o.q.year)}</span>
            <span>{o.hints ? `${o.hints}개` : '없음'}</span>
            <span>{o.points}점</span>
            <button className="mg-link" onClick={() => onView(o.q)}>지도</button>
          </div>
        ))}
      </div>
      <div className="mg-row">
        <button className="mg-primary" onClick={onAgain}>다시 하기</button>
        <button className="mg-ghost" onClick={onLobby}>게임 고르기</button>
      </div>
    </div>
  );
}
