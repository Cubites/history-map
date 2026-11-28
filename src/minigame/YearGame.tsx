// 2번 게임: 연도 맞추기 (2026-11-17, 11-18 정답 기준 바꿈, 11-23 난이도 셋·움직이는 지도).
// 쉬움·보통은 몇 세기인지 맞춘다. 어려움은 연도를 적어 10년 단위까지 맞춘다.
// 영토가 그대로였던 기간이 여러 세기·여러 10년 단위에 걸치면 걸친 것 전부가 정답이다.
// 어려움에서 그 기간 안의 해를 정확히 적으면 가산점(BONUS)을 준다.
// 보통·어려움은 처음에 국경선만 보이고, 둘레의 육지·바다는 옆 나라 힌트와 함께 열린다. 지도는 육지·바다가 보일 때부터 끌어서 옮기고 확대할 수 있다.
import { useMemo, useState, type FormEvent } from 'react';
import { FindMap } from './FindMap.tsx';
import { BONUS, HINT_COST, Hints, POINTS, Result, Status, nearHint, useQuizItems, type Hint, type PlayProps } from './parts.tsx';
import { ERA_LABEL, centuryKey, centuryKeyText, centuryText, decadeKey, decadeKeyText, eraOf, eventHint, keepRange, regionEventHint, yearText } from './questions.ts';

/** 옆 나라 힌트의 차례(둘째). 보통·어려움은 이 힌트가 둘레의 육지·바다도 함께 연다 */
const NEAR_AT = 2;

export function YearGame({ data, q, level, total, outcomes, onView, onNext }: PlayProps) {
  const hard = level === 'hard';
  const [opened, setOpened] = useState(0);
  const [text, setText] = useState('');
  const [bce, setBce] = useState(false);
  /** 낸 답. 쉬움·보통은 세기 번호(centuryKey), 어려움은 해 */
  const [guess, setGuess] = useState<number | null>(null);

  const showNear = opened >= NEAR_AT;
  const bare = level !== 'easy' && !showNear;
  const { items, labels, near } = useQuizItems(data, q, showNear);
  const start = useMemo(() => ({ bbox: q.version.bbox }), [q]);
  const keep = useMemo(() => keepRange(q, data.timeline.range[1]), [q, data]);
  const ownEvent = useMemo(() => eventHint(data, q, 'year'), [data, q]);
  const areaEvent = useMemo(() => regionEventHint(data, q), [data, q]);

  const hints: Hint[] = [
    ['시대', `${ERA_LABEL[eraOf(q.year)]}.`],
    nearHint(level !== 'easy', near.length > 0),
    ['나라 이름', q.entity.names.ko],
    ['이 나라의 사건 (연도 가림)', ownEvent ?? '이 나라에 걸린 사건이 없습니다.'],
    ['이 무렵 같은 권역의 사건 (연도 가림)', areaEvent ?? '이 권역에 걸린 사건이 없습니다.'],
    // 쉬움·보통은 세기가 곧 답이라 이 힌트를 두지 않는다
    ...(hard ? [['세기', `${centuryText(q.year)}에 걸친 모습입니다.`] as Hint] : []),
  ];

  // 정답 범위: 기간이 걸친 세기(쉬움·보통) 또는 10년 단위(어려움)의 번호
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
      <Status title="연도 맞추기" level={level} total={total} outcomes={outcomes} />
      <div className="mg-mapwrap">
        <FindMap items={items} start={start} mainId={q.entity.id} labels={labels} bare={bare} detail />
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
            <button type="button" aria-label="기원전" aria-pressed={bce} disabled={guess !== null} onClick={() => setBce(true)}>BC</button>
            <button type="button" aria-label="기원후" aria-pressed={!bce} disabled={guess !== null} onClick={() => setBce(false)}>AC</button>
          </span>
          <input
            inputMode="numeric"
            aria-label={hard ? '연도' : '세기'}
            placeholder={hard ? '연도' : '세기'}
            value={text}
            disabled={guess !== null}
            onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, hard ? 4 : 2))}
          />
          <span>{hard ? '년' : '세기'}</span>
          <button className="mg-primary" disabled={guess !== null || !text}>제출</button>
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
