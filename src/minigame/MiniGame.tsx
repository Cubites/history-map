// 미니게임 (2026-11-17). 본 지도 위에 덮어 띄우는 화면: 고르기 → 문제(5·10·20개) → 결과.
// 2026-11-23: PC도 휴대폰과 같은 세로 배치로, 휴대폰만 한 창(.mg-win)을 화면 가운데에 띄운다. 뒤에는 누르기 전 화면이 흐리게 비치고,
// 창은 살짝 위에서 내려오며 나타나고 닫을 때는 살짝 올라가며 사라진다(창 밖을 눌러도 닫힘). 휴대폰은 전처럼 화면 전체.
// 가운데 창은 게임 고르기와 결과 화면이다. 시작하기를 누르면 PC도 화면 전체로 넓혀 문제를 풀고(지도 왼쪽·문제 오른쪽의 넓은 배치), 끝나면 가운데 창으로 돌아온다.
// 게임 고르기는 게임 블럭을 누르면 그 블럭이 아래로 펼쳐져(0.3초) 난이도·권역·문제 수·시작 단추가 나오고, 다른 블럭은 접힌다.
// 게임 셋: 나라 이름 맞추기(이 파일), 연도 맞추기(YearGame), 나라 찾기(FindGame). 점수 숫자는 임시값이다(parts.tsx).
// 난이도는 쉬움·보통·어려움 셋이다(2026-11-23). 게임마다 뜻이 다르다: 아래 GAMES의 rule과 각 게임 파일 머리 참고.
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { geoArea } from 'd3-geo';
import { loadEntityGeometry, type StaticData, type TerritoryFeature } from '../data/staticData.ts';
import { REGION_FILTERS, REGION_FILTER_INFO, type RegionFilter } from '../schema/regions.ts';
import { useAppStore } from '../store/useAppStore.ts';
import { FindGame } from './FindGame.tsx';
import { FindMap } from './FindMap.tsx';
import { QuizMap } from './QuizMap.tsx';
import { YearGame } from './YearGame.tsx';
import { HINT_COST, Hints, POINTS, Result, Status, nearHint, useQuizItems, type Hint, type Outcome, type PlayProps } from './parts.tsx';
import { LEVELS, LEVEL_LABEL, ROUND, ROUNDS, answerNames, buildQuestions, centuryText, chosung, eventHint, isNameAnswer, type Level, type Pool, type Question } from './questions.ts';

type Game = 'name' | 'year' | 'find';
/** rule은 난이도 단추 아래에 한 줄씩 적는 난이도 설명(고른 난이도 것만 보인다). pool은 난이도별로 낼 나라와 모습(questions.ts의 Pool) */
const GAMES: { id: Game; title: string; about: string; rule: Record<Level, string[]>; pool: Record<Level, Pool>; play: (p: PlayProps) => JSX.Element }[] = [
  {
    id: 'name',
    title: '나라 이름 맞추기',
    about: '색칠된 영토를 보고 어느 나라인지 맞추기',
    rule: {
      easy: ['4지선다', '해당 나라의 전성기 영토와 대륙 및 바다 표시'],
      normal: ['4지선다', '해당 나라의 전성기 영토만 표시'],
      hard: ['주관식', '해당 나라의 전성기 영토만 표시'],
    },
    pool: { easy: 'top', normal: 'peak', hard: 'peak' },
    play: NameGame,
  },
  {
    id: 'year',
    title: '연도 맞추기',
    about: '영토 모습을 보고 어느 해인지 맞추기',
    rule: {
      easy: ['몇 세기인지 맞추기', '해당 나라의 전성기 영토와 대륙 및 바다 표시'],
      normal: ['몇 세기인지 맞추기', '해당 나라의 전성기 영토만 표시'],
      hard: ['몇 년도인지 맞추기', '해당 나라의 전성기 영토만 표시'],
    },
    pool: { easy: 'top', normal: 'peak', hard: 'peak' },
    play: YearGame,
  },
  {
    id: 'find',
    title: '나라 찾기',
    about: '이름표 없는 지도에서 나라 찾기',
    rule: {
      easy: ['연도와 권역, 나라 이름을 알려주고 나라 찾기'],
      normal: ['연도와 나라 이름을 알려주고 나라 찾기'],
      hard: ['나라 이름만 보고 나라 찾기'],
    },
    pool: { easy: 'top', normal: 'top', hard: 'any' },
    play: FindGame,
  },
];

/** 창이 닫히며 사라지는 시간(ms). styles.css의 mg-out과 같게 */
const CLOSE_MS = 200;

export function MiniGame({ data, onClose }: { data: StaticData; onClose: () => void }) {
  // 고르기 화면에서 펼친 게임(없으면 모두 접힘). 시작하면 이 게임을 한다
  const [game, setGame] = useState<Game | null>(null);
  /** 마지막으로 펼친 게임 */
  const lastGame = useRef<Game | null>(null);
  const [level, setLevel] = useState<Level>('easy');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [count, setCount] = useState<number>(ROUND);
  const [closing, setClosing] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  // 게임 블럭을 펼치면 그 블럭이 고르기 화면 밖으로 나가지 않게 스크롤을 맞춘다(2026-11-27). 난이도를 바꿔 설명 줄 수가 달라져도 다시 맞춘다.
  // 펼쳐지는 0.3초 동안 기다리지 않고 프레임마다 맞춰, 블럭이 펼쳐지면서 화면이 함께 따라간다(다 펼친 뒤 부드러운 스크롤을 시작하던 것보다 빠름).
  // 게임을 하다가 '처음으로'로 고르기 화면에 돌아왔을 때도(블럭이 펼쳐진 채 다시 그려지고 스크롤은 맨 위) 같은 효과가 돌아 바로 맞춘다
  const cardsRef = useRef<HTMLDivElement>(null);
  const inLobby = questions === null;
  useEffect(() => {
    if (!game || !inLobby) return;
    const until = performance.now() + 340;
    let frame = 0;
    const follow = () => {
      const card = cardsRef.current?.querySelector('.mg-card.on');
      const scroller = cardsRef.current?.parentElement;
      if (card && scroller) {
        const [c, s] = [card.getBoundingClientRect(), scroller.getBoundingClientRect()];
        const margin = 12;
        // 블럭이 화면보다 길면 위 끝을 맞추고, 아니면 넘친 쪽만큼만 옮긴다
        if (c.height + margin * 2 > s.height || c.top < s.top + margin) scroller.scrollTop += c.top - s.top - margin;
        else if (c.bottom > s.bottom - margin) scroller.scrollTop += c.bottom - s.bottom + margin;
      }
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    follow();
    return () => cancelAnimationFrame(frame);
  }, [game, level, inLobby]);
  // 결과 창에서 '지도'를 눌러 본 지도를 보는 중(2026-11-23). 미니게임을 닫지 않고 숨겨 두고 '결과 창으로 돌아가기' 단추만 띄운다.
  // 그 단추를 누르거나 본 지도에서 나라 고름을 풀면(×, Esc, 바다 누르기) 결과 창으로 돌아온다
  const [away, setAway] = useState(false);
  const selectedId = useAppStore((s) => s.selectedId);
  useEffect(() => {
    if (away && selectedId === null) setAway(false);
  }, [away, selectedId]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  // 휴대폰 글자판이 올라오면(보이는 화면이 줄면) 미니게임 화면을 보이는 높이에 맞춰 줄이고 지도 칸을 낮춰, 입력 칸이 글자판 위에 보이게 한다(2026-11-28).
  // 화면이 고정(position: fixed)이라 브라우저가 입력 칸을 알아서 올려 주지 못한다. 줄어든 뒤 입력 칸을 문제 영역 안에서 보이는 자리로 스크롤한다.
  // 글자판이 올라왔는지는 '글자를 적는 칸을 누른 채, 보이는 높이가 지금까지 본 가장 큰 높이보다 120px 넘게 줄었는가'로 본다.
  // window.innerHeight와 견주면 안 된다: 안드로이드 크롬 계열은 innerHeight도 보이는 높이를 따라 줄어 차이가 0이 된다(처음 그렇게 했다가 휴대폰에서 듣지 않았다)
  const [kb, setKb] = useState<{ height: number; top: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const full = { width: 0, height: 0 };
    const fit = () => {
      // 화면을 돌리면(너비가 바뀌면) 기준 높이를 새로 잡는다
      if (full.width !== window.innerWidth) [full.width, full.height] = [window.innerWidth, 0];
      full.height = Math.max(full.height, vv.height, document.documentElement.clientHeight);
      const el = document.activeElement;
      const typing = (el instanceof HTMLInputElement && el.type !== 'range') && !!el.closest('.mg');
      const open = typing && vv.scale < 1.01 && full.height - vv.height > 120;
      setKb((cur) => (!open ? null : cur && cur.height === vv.height && cur.top === vv.offsetTop ? cur : { height: vv.height, top: vv.offsetTop }));
    };
    fit();
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
    document.addEventListener('focusin', fit);
    document.addEventListener('focusout', fit);
    return () => {
      vv.removeEventListener('resize', fit);
      vv.removeEventListener('scroll', fit);
      document.removeEventListener('focusin', fit);
      document.removeEventListener('focusout', fit);
    };
  }, []);
  // 화면이 줄어든 뒤(그려진 뒤)에 입력 칸을 보이는 자리로 옮긴다. 글자판이 올라오는 동안 높이가 여러 번 바뀌므로 그때마다 다시 맞춘다
  useEffect(() => {
    const el = document.activeElement;
    if (kb && el instanceof HTMLInputElement && el.closest('.mg')) el.scrollIntoView({ block: 'nearest' });
  }, [kb]);
  const [empty, setEmpty] = useState(false);
  const setYear = useAppStore((s) => s.setYear);
  const selectFocus = useAppStore((s) => s.selectFocus);

  const start = () => {
    const qs = buildQuestions(data, GAMES.find((g) => g.id === game)?.pool[level] ?? 'top', region, count);
    setEmpty(!qs.length);
    setOutcomes([]);
    setQuestions(qs.length ? qs : null);
  };
  /** 본 지도를 그 나라·그 해로 옮기고 게임을 닫는다 */
  /** 닫기: PC는 창이 살짝 올라가며 사라진 뒤 닫는다(휴대폰은 화면 전체라 바로) */
  const close = () => {
    if (closing) return;
    if (!window.matchMedia('(min-width: 861px)').matches) return onClose();
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  };
  const viewOnMap = (q: Question) => {
    setYear(q.year);
    selectFocus(q.entity.id);
    close();
  };

  /** 결과 창에서: 본 지도를 그 나라·그 해로 옮기고, 미니게임은 닫지 않고 숨긴다 */
  const viewFromResult = (q: Question) => {
    setYear(q.year);
    selectFocus(q.entity.id);
    setAway(true);
  };

  const Play = GAMES.find((g) => g.id === game)?.play;
  const index = outcomes.length;
  const done = questions !== null && index >= questions.length;
  // 단추는 지도 칸(.app-main) 안에 넣어 지도 영역의 위 가운데에 둔다(화면 전체의 가운데가 아님: PC는 왼쪽에 나라 정보 칸이 있다)
  if (away)
    return createPortal(
      <button className="mg-return" onClick={() => setAway(false)}>
        결과 창으로 돌아가기
      </button>,
      document.querySelector('.app-main') ?? document.body,
    );
  return (
    // 바깥(.mg)은 뒤 화면을 흐리게 덮는 막: 창 밖을 누르면 닫는다 (결과 창에서는 닫지 않는다: 잘못 눌러 결과를 잃지 않게, 2026-11-23)
    // 문제를 푸는 동안은 .playing: PC에서 창을 화면 전체로 넓힌다(2026-11-23). 결과는 게임 고르기와 같은 가운데 창으로 돌아온다
    <div className={`mg${questions && !done ? ' playing' : ''}${closing ? ' closing' : ''}${kb ? ' kb' : ''}`} style={kb ? { top: kb.top, bottom: 'auto', height: kb.height } : undefined} onClick={(e) => e.target === e.currentTarget && !done && close()}>
    <div className="mg-win" role="dialog" aria-label="미니게임">
      <header className="mg-top">
        <strong>미니게임</strong>
        {questions && <button className="mg-ghost" onClick={() => setQuestions(null)}>처음으로</button>}
        <button className="mg-ghost mg-back" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" />
            <path d="M9 4v13.5M15 6.5V20" />
          </svg>
          지도로
        </button>
      </header>
      {!questions && (
        <div className="mg-lobby">
          <div className="mg-cards" ref={cardsRef}>
            {GAMES.map((g) => {
              const open = g.id === game;
              return (
                <section key={g.id} className={`mg-card${open ? ' on' : ''}`}>
                  {/* 블럭 머리: 누르면 이 게임만 펼치고(다른 게임은 접힘), 펼친 게임을 다시 누르면 접는다 */}
                  <button className="mg-card-head" aria-expanded={open} onClick={() => {
                    // 다른 게임을 펼치면 난이도·권역·문제 수를 처음 값으로 되돌린다(2026-11-28). 같은 게임을 접었다 펴는 것은 그대로 둔다
                    if (!open && lastGame.current !== g.id) {
                      setLevel('easy');
                      setRegion('all');
                      setCount(ROUND);
                    }
                    if (!open) lastGame.current = g.id;
                    setGame(open ? null : g.id);
                    setEmpty(false);
                  }}>
                    <h3>{g.title}</h3><p>{g.about}</p>
                  </button>
                  <div className="mg-card-body" aria-hidden={!open}>
                    <div className="mg-setup">
                      <div className="mg-field">
                        <span>난이도</span>
                        <span className="mg-seg mg-seg-3">
                          {LEVELS.map((l) => <button key={l} aria-pressed={level === l} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</button>)}
                        </span>
                        <p className="mg-sub mg-rule">{g.rule[level].map((line) => <span key={line}>{line}</span>)}</p>
                      </div>
                      <label className="mg-field">
                        <span>권역</span>
                        <select value={region} onChange={(e) => setRegion(e.target.value as RegionFilter)}>
                          <option value="all">모든 권역</option>
                          {REGION_FILTERS.map((id) => <option key={id} value={id}>{REGION_FILTER_INFO[id].label}</option>)}
                        </select>
                      </label>
                      <div className="mg-field">
                        <span>문제 수</span>
                        <span className="mg-seg mg-seg-3">
                          {ROUNDS.map((n) => <button key={n} aria-pressed={count === n} onClick={() => setCount(n)}>{n}개</button>)}
                        </span>
                      </div>
                      <button className="mg-primary" onClick={start}>시작하기</button>
                      {open && empty && <p className="mg-warn">이 조건에 맞는 문제가 없습니다. 권역을 바꿔 보세요.</p>}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
      {questions && !done && Play && (
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
      {questions && done && game && <End game={game} outcomes={outcomes} onAgain={start} onLobby={() => setQuestions(null)} onView={viewFromResult} />}
    </div>
    </div>
  );
}

/** 옆 나라 힌트의 차례(셋째). 보통·어려움은 이 힌트가 둘레의 육지·바다도 함께 연다 */
const NEAR_AT = 3;

/** 1번 게임: 나라 이름 맞추기 (쉬움·보통은 4지선다, 어려움은 이름을 적는 주관식) */
function NameGame({ data, q, level, total, outcomes, onNext }: PlayProps) {
  const hard = level === 'hard';
  // 도형 묶음은 '하나 꺼내기'만 쓴다: 본 저장소 최신 코드는 Map 대신 하나씩만 꺼내는 묶음(LazyMap)을 주므로 둘 다에 맞춘다 (2026-11-19)
  const [geo, setGeo] = useState<{ get(key: string): TerritoryFeature | undefined } | null>(null);
  /** 낸 답: 4지선다는 고른 나라의 id, 어려움은 적은 이름 */
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState('');
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

  // 힌트 3: 옆 나라를 지도에 이름과 함께 그린다. 보통·어려움은 그때까지 국경선만 보인다
  const showNear = opened >= NEAR_AT;
  const bare = level !== 'easy' && !showNear;
  const { items, labels, near } = useQuizItems(data, q, showNear);
  const start = useMemo(() => ({ bbox: q.version.bbox }), [q]);
  const event = useMemo(() => eventHint(data, q), [data, q]);
  const names = useMemo(() => answerNames(q.entity), [q]);
  const hints: Hint[] = [
    ['시대', `${centuryText(q.year)}의 모습입니다.`],
    ['최소 영토와 최대 영토', extremes ? (
      extremes.one ? '이 나라는 지도에서 영토가 한 가지 모습뿐입니다.' : (
        // 국경선만 보이는 동안에는 작은 지도도 국경선만 그린다 (둘레의 육지·바다는 다음 힌트)
        <span className="mg-minis">
          <figure><QuizMap fit={extremes.max} main={{ feature: extremes.min, color: q.entity.color }} zoomOut={0.8} bare={bare} /><figcaption>가장 작았을 때</figcaption></figure>
          <figure><QuizMap fit={extremes.max} main={{ feature: extremes.max, color: q.entity.color }} zoomOut={0.8} bare={bare} /><figcaption>가장 컸을 때</figcaption></figure>
        </span>
      )
    ) : '불러오는 중…'],
    nearHint(level !== 'easy', near.length > 0),
    ['역사적 사건', event ?? '이 나라에 걸린 사건이 없습니다.'],
    // 어려움의 마지막 힌트: 정답으로 치는 이름 전부의 초성
    ...(hard ? [['초성', names.map(chosung).join(' 또는 ')] as Hint] : []),
  ];

  const points = Math.max(0, POINTS - HINT_COST * opened);
  const ok = picked !== null && (hard ? isNameAnswer(q.entity, picked) : picked === q.entity.id);
  // 4지선다는 숫자 글쇠 1~4로 고른다
  useEffect(() => {
    if (hard) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= q.options.length) setPicked(q.options[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (picked === null && text.trim()) setPicked(text.trim());
  };

  return (
    <div className="mg-game">
      <Status title="나라 이름 맞추기" level={level} total={total} outcomes={outcomes} />
      <div className="mg-mapwrap">
        {/* 육지·바다가 보이는 동안에는(쉬움은 처음부터, 보통·어려움은 옆 나라 힌트를 연 뒤) 본 지도처럼 끌어서 옮기고 확대할 수 있다 */}
        <FindMap items={items} start={start} mainId={q.entity.id} labels={labels} bare={bare} detail />
      </div>
      <aside className="mg-panel">
        <p className="mg-q">화면의 <em>나라 이름</em>은?</p>
        {hard ? (
          <>
            <p className="mg-note">
              <span>띄어쓰기와 괄호 안은 보지 않음</span>
              <span>예시: '잉카 제국'은 '잉카'만 적어도 정답</span>
            </p>
            <form className="mg-year mg-name" onSubmit={submit}>
              <input aria-label="나라 이름" placeholder="나라 이름" value={text} disabled={picked !== null} onChange={(e) => setText(e.target.value)} />
              <button className="mg-primary" disabled={picked !== null || !text.trim()}>제출</button>
            </form>
          </>
        ) : (
          <div className="mg-opts">
            {q.options.map((o, i) => (
              <button
                key={o.id}
                // 고른 보기(.picked)는 한 번 움직인다: 맞으면 위로 튕기고 틀리면 좌우로 흔들린다(2026-11-28)
                className={picked === null ? '' : `${o.id === q.entity.id ? 'right' : o.id === picked ? 'wrong' : ''}${o.id === picked ? ' picked' : ''}`}
                disabled={picked !== null}
                onClick={() => picked === null && setPicked(o.id)}
              >
                <kbd>{i + 1}</kbd>{o.names.ko}
              </button>
            ))}
          </div>
        )}
        {picked !== null && (
          <Result
            ok={ok}
            title={ok ? '정답입니다' : '틀렸습니다'}
            last={outcomes.length + 1 === total}
            onNext={() => onNext({ q, ok, hints: opened, points: ok ? points : 0 })}
          />
        )}
        <Hints hints={hints} opened={opened} answered={picked !== null} onOpen={() => setOpened(opened + 1)} />
      </aside>
    </div>
  );
}

function End({ outcomes, onAgain, onLobby, onView }: { game: Game; outcomes: Outcome[]; onAgain: () => void; onLobby: () => void; onView: (q: Question) => void }) {
  const score = outcomes.reduce((sum, o) => sum + o.points, 0);
  return (
    <div className="mg-end">
      <h2>한 판이 끝났습니다</h2>
      <div className="mg-score">
        <div className="main"><span>점수</span><b>{score} <small>/ {outcomes.reduce((sum, o) => sum + (o.max ?? POINTS), 0)}</small></b></div>
        <div><span>정답</span><b>{outcomes.filter((o) => o.ok).length} <small>/ {outcomes.length}</small></b></div>
      </div>
      <div className="mg-log">
        {/* 2026-11-23: 가장 긴 연속 정답·연 힌트 칸과 표의 출제한 해·힌트 열을 뺐다 */}
        <div className="hd"><span /><span>나라</span><span>점수</span><span /></div>
        {outcomes.map((o, i) => (
          <div key={i}>
            <span className={`mark${o.ok ? '' : ' no'}`}>{o.ok ? '○' : '×'}</span>
            <b>{o.q.entity.names.ko}</b>
            <span>{o.points}점</span>
            <button className="mg-link" onClick={() => onView(o.q)}>지도</button>
          </div>
        ))}
      </div>
      {/* 오른쪽 끝에 '다시 하기', 그 왼쪽에 '게임 고르기' (2026-11-23) */}
      <div className="mg-row mg-row-end">
        <button className="mg-ghost" onClick={onLobby}>게임 고르기</button>
        <button className="mg-primary" onClick={onAgain}>다시 하기</button>
      </div>
    </div>
  );
}
