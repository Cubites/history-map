// 2번 게임: 연도 맞추기 (2026-11-17, 11-18 정답 기준 바꿈).
// 쉬움은 몇 세기인지 맞춘다. 어려움은 연도를 적어 10년 단위까지 맞춘다.
// 영토가 그대로였던 기간이 여러 세기·여러 10년 단위에 걸치면 걸친 것 전부가 정답이다.
// 어려움에서 그 기간 안의 해를 정확히 적으면 가산점(BONUS)을 준다.
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { loadEntityGeometry, type TerritoryFeature } from '../data/staticData.ts';
import { QuizMap } from './QuizMap.tsx';
import { BONUS, HINT_COST, Hints, LAND_HINT, POINTS, Result, Status, useNeighbors, type Hint, type PlayProps } from './parts.tsx';
import { ERA_LABEL, centuryKey, centuryKeyText, centuryText, decadeKey, decadeKeyText, eraOf, eventHint, keepRange, regionEventHint, yearText } from './questions.ts';

export function YearGame({ data, q, level, total, outcomes, onView, onNext }: PlayProps) {
  const hard = level === 'hard';
  // 어려움은 처음에 국경선만 보이고, 둘레의 육지와 바다가 첫 힌트가 된다 (그만큼 뒤 힌트의 차례가 하나씩 밀린다)
  const shift = hard ? 1 : 0;
  // 도형 묶음은 '하나 꺼내기'만 쓴다 (본 저장소 최신 코드의 LazyMap에도 맞게, 2026-11-19)
  const [geo, setGeo] = useState<{ get(key: string): TerritoryFeature | undefined } | null>(null);
  const [failed, setFailed] = useState(false);
  const [opened, setOpened] = useState(0);
  const [text, setText] = useState('');
  const [bce, setBce] = useState(false);
  /** 낸 답. 쉬움은 세기 번호(centuryKey), 어려움은 해 */
  const [guess, setGuess] = useState<number | null>(null);

  useEffect(() => {
    let on = true;
    loadEntityGeometry('mid', q.entity.id).then((g) => on && setGeo(g)).catch(() => on && setFailed(true));
    return () => {
      on = false;
    };
  }, [q]);

  const target = geo?.get(q.version.key);
  const main = useMemo(() => (target ? { feature: target, color: q.entity.color } : null), [target, q]);
  const showNear = opened >= 2 + shift;
  const near = useNeighbors(data, q, showNear);
  const keep = useMemo(() => keepRange(q, data.timeline.range[1]), [q, data]);
  const ownEvent = useMemo(() => eventHint(data, q, 'year'), [data, q]);
  const areaEvent = useMemo(() => regionEventHint(data, q), [data, q]);

  const hints: Hint[] = [
    ...(shift ? [LAND_HINT] : []),
    ['시대', `${ERA_LABEL[eraOf(q.year)]}.`],
    ['옆 나라 영토와 이름', near.length ? '지도에 둘레 나라를 이름과 함께 표시했습니다.' : '그 해에 둘레에 그려진 나라가 없습니다.'],
    ['나라 이름', q.entity.names.ko],
    ['이 나라의 사건 (연도 가림)', ownEvent ?? '이 나라에 걸린 사건이 없습니다.'],
    ['이 무렵 같은 권역의 사건 (연도 가림)', areaEvent ?? '이 권역에 걸린 사건이 없습니다.'],
    // 쉬움은 세기가 곧 답이라 이 힌트를 두지 않는다
    ...(hard ? [['세기', `${centuryText(q.year)}에 걸친 모습입니다.`] as Hint] : []),
  ];

  // 정답 범위: 기간이 걸친 세기(쉬움) 또는 10년 단위(어려움)의 번호
  const toKey = hard ? decadeKey : centuryKey;
  const keyText = hard ? decadeKeyText : centuryKeyText;
  const [lo, hi] = [toKey(keep[0]), toKey(keep[1])];
  const guessKey = guess === null ? null : hard ? decadeKey(guess) : guess;
  const ok = guessKey !== null && guessKey >= lo && guessKey <= hi;
  const exact = hard && guess !== null && guess >= keep[0] && guess <= keep[1];
  const base = Math.max(0, POINTS - HINT_COST * opened);
  const points = ok ? base + (exact ? BONUS : 0) : 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(text);
    if (guess !== null || !Number.isInteger(n) || n < 1) return;
    // 기원전 N년은 1 - N으로 센다 (지도의 연도 세는 법과 같다). 세기는 기원전이면 음수 번호
    setGuess(hard ? (bce ? 1 - n : n) : bce ? -n : n);
  };
  const keepText = keep[0] === keep[1] ? yearText(keep[0]) : `${yearText(keep[0])}~${yearText(keep[1])}`;
  const answerText = lo === hi ? keyText(lo) : `${keyText(lo)}~${keyText(hi)}`;
  const guessText = guess === null ? '' : hard ? yearText(guess) : centuryKeyText(guess);
  const finish = () => onNext({ q, ok, hints: opened, points, note: `${guessText} → ${keepText}`, max: hard ? POINTS + BONUS : undefined });

  return (
    <div className="mg-game">
      <Status title="연도 맞추기" level={level} total={total} outcomes={outcomes} points={base} />
      <div className="mg-mapwrap">
        {main ? <QuizMap fit={main.feature} main={main} others={showNear ? near : undefined} bare={opened < shift} /> : (
          <div className="mg-loading">{failed ? '영토 도형을 불러오지 못했습니다.' : '지도를 불러오는 중…'}</div>
        )}
        <div className="mg-chip">{opened < shift ? '국경선만 표시' : '이름표 숨김'}</div>
      </div>
      <aside className="mg-panel">
        <p className="mg-q">이 영토는 <em>{hard ? '어느 해' : '몇 세기'}</em>의 모습일까요?</p>
        {hard ? (
          <p className="mg-note">
            <span>10년 단위로 정답 처리</span>
            <span>예시: 1432년~1445년 &gt; 1430년, 1440년 둘 다 정답</span>
            <span>정확히 맞추면 가산점 부여</span>
          </p>
        ) : (
          <p className="mg-note">
            <span>1세기 = 1년~100년</span>
            <span>예시: 1801년은 19세기</span>
            <span>영토가 여러 세기에 걸쳐 있으면 해당 세기 모두 정답</span>
          </p>
        )}
        <form className="mg-year" onSubmit={submit}>
          <span className="mg-seg">
            <button type="button" aria-pressed={bce} disabled={guess !== null} onClick={() => setBce(true)}>기원전</button>
            <button type="button" aria-pressed={!bce} disabled={guess !== null} onClick={() => setBce(false)}>기원후</button>
          </span>
          <input
            inputMode="numeric"
            aria-label={hard ? '연도' : '세기'}
            placeholder={hard ? '연도' : '세기'}
            autoFocus
            value={text}
            disabled={guess !== null}
            onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, hard ? 4 : 2))}
          />
          <span>{hard ? '년' : '세기'}</span>
          <button className="mg-primary" disabled={guess !== null || !text}>답하기</button>
        </form>
        {guess !== null && (
          <Result
            ok={ok}
            title={`정답 : ${answerText}`}
            sub={`${ok ? '맞았습니다' : '틀렸습니다'} · 낸 답 ${guessText} · ${q.entity.names.ko} · 영토가 그대로였던 기간 ${keepText} · ${points}점${exact ? ` (가산점 ${BONUS}점 포함)` : ''}`}
            last={outcomes.length + 1 === total}
            onView={() => onView(q)}
            onNext={finish}
          />
        )}
        <Hints hints={hints} opened={opened} answered={guess !== null} onOpen={() => setOpened(opened + 1)} />
      </aside>
    </div>
  );
}
