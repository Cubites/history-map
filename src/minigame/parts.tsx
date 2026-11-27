// 세 미니게임이 함께 쓰는 부품 (2026-11-17): 위쪽 상태 줄, 힌트 목록, 정답 뒤 상자, 문제 지도에 그릴 나라 묶음.
import { useEffect, useMemo, type ReactNode } from 'react';
import { loadEntityGeometry, type StaticData } from '../data/staticData.ts';
import type { MapItem } from './FindMap.tsx';
import { LEVEL_LABEL, neighborsOf, type Level, type Question } from './questions.ts';

/** 점수 숫자는 임시값이다 */
export const POINTS = 100;
export const HINT_COST = 10;
/** 연도 맞추기 어려움: 영토가 그대로였던 기간 안의 해를 적으면 더 주는 점수 */
export const BONUS = 20;

export interface Outcome {
  q: Question;
  ok: boolean;
  hints: number;
  points: number;
  /** 결과 목록의 '출제한 해' 칸에 대신 적을 글 (연도 맞추기: 낸 답) */
  note?: string;
  /** 이 문제에서 받을 수 있던 가장 높은 점수 (없으면 POINTS. 가산점이 있는 문제만 적는다) */
  max?: number;
}

export interface PlayProps {
  data: StaticData;
  q: Question;
  level: Level;
  total: number;
  outcomes: Outcome[];
  onView: (q: Question) => void;
  onNext: (o: Outcome) => void;
}

export type Hint = [title: string, body: ReactNode];
/**
 * 옆 나라 힌트. 보통·어려움(withLand)은 국경선만 보이던 지도에 둘레의 육지와 바다(와 나라 색)도 이 힌트가 함께 연다
 * (2026-11-23: 전에는 육지·바다가 따로 첫 힌트였다)
 */
export const nearHint = (withLand: boolean, hasNear: boolean): Hint => [
  withLand ? '둘레의 육지·바다, 옆 나라 영토와 이름' : '옆 나라 영토와 이름',
  (withLand ? '지도에 둘레의 육지와 바다를 표시했습니다. ' : '') + (hasNear ? '둘레 나라도 이름과 함께 표시했습니다.' : '그 해에 둘레에 그려진 나라가 없습니다.'),
];

/** 문제 지도(FindMap)에 그릴 것: 문제의 나라와 (showNear면) 옆 나라들. 옆 나라에만 이름표를 붙인다 */
export function useQuizItems(data: StaticData, q: Question, showNear: boolean) {
  const near = useMemo(() => neighborsOf(data, q), [data, q]);
  return useMemo(() => {
    const own: MapItem = { id: q.entity.id, key: q.version.key, color: q.entity.color, anchor: q.version.anchor, bbox: q.version.bbox };
    if (!showNear) return { items: [own], labels: undefined, near };
    const others = near.map((t): MapItem => ({ id: t.entityId, key: t.key, color: data.entities.get(t.entityId)!.color, anchor: t.anchor, bbox: t.bbox }));
    return { items: [...others, own], labels: Object.fromEntries(near.map((t) => [t.entityId, data.entities.get(t.entityId)!.names.ko])), near };
  }, [data, q, near, showNear]);
}

/**
 * 위쪽 상태 줄 (2026-11-27 고침). 첫 줄: 게임 이름·난이도, 오른쪽 끝에 점수. 둘째 줄: '문제 N / N'과 그 오른쪽에 진행 점,
 * (points를 주면) 오른쪽 끝에 이번 문제 점수. 연속 정답 표시는 없앴다. 나라 이름 맞추기는 이번 문제 점수를 보이지 않는다(points 없음)
 */
export function Status({ title, level, total, outcomes, points }: { title: string; level?: Level; total: number; outcomes: Outcome[]; points?: number }) {
  const score = outcomes.reduce((sum, o) => sum + o.points, 0);
  return (
    <div className="mg-status">
      <div className="mg-status-row">
        <b>{title}</b>
        {level && <span className="mg-level">{LEVEL_LABEL[level]}</span>}
        <span className="mg-sp" />
        <span>점수 <b>{score}</b></span>
      </div>
      <div className="mg-status-row">
        <span>문제 {outcomes.length + 1} / {total}</span>
        <span className="mg-dots">
          {Array.from({ length: total }, (_, i) => (
            <i key={i} className={i < outcomes.length ? (outcomes[i].ok ? 'ok' : 'no') : i === outcomes.length ? 'now' : ''} />
          ))}
        </span>
        {points !== undefined && <span className="mg-status-points">이번 문제 <b>{points}</b>점</span>}
      </div>
    </div>
  );
}

/** 힌트는 위에서부터 차례로만 열린다. answered면 더 열 수 없다 */
export function Hints({ hints, opened, answered, onOpen }: { hints: Hint[]; opened: number; answered: boolean; onOpen: () => void }) {
  return (
    <div className="mg-hints">
      <h3><span>힌트</span><span>힌트 당 {HINT_COST}점 감점</span></h3>
      <ol>
        {hints.map(([title, body], i) => (
          <li key={title} className={i < opened ? 'open' : i === opened ? '' : 'locked'}>
            <span className="n">{i + 1}</span>
            <div><div className="t">{title}</div>{i < opened && <div className="c">{body}</div>}</div>
            {i === opened && !answered && <button onClick={onOpen}>열기</button>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Result({ ok, title, sub, last, onView, onNext }: { ok: boolean; title: string; sub: string; last: boolean; onView: () => void; onNext: () => void }) {
  // 답한 뒤 Enter로 넘어간다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Enter' && onNext();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <div className={`mg-result${ok ? '' : ' bad'}`}>
      <strong>{title}</strong>
      <p className="mg-sub">{sub}</p>
      <div className="mg-row">
        <button className="mg-ghost" onClick={onView}>지도에서 보기</button>
        <button className="mg-primary" onClick={onNext}>{last ? '결과 보기' : '다음 문제'}</button>
      </div>
    </div>
  );
}

/**
 * 문제의 나라와 국경을 맞댄 나라 하나 (없으면 null). 둘레 나라들 가운데 국경선의 점이 문제 나라의 국경선에 가장 많이 붙어 있는 나라를 고른다.
 * 국경선의 점이 약 0.15~0.3° 안에 있으면 붙은 것으로 치므로, 좁은 해협을 사이에 둔 나라가 뽑힐 수도 있다
 */
export async function findBorderNeighbor(data: StaticData, q: Question): Promise<string | null> {
  const CELL = 0.15;
  const points = (feature: { geometry: { coordinates: number[][][][] } }, each: (cx: number, cy: number) => void) => {
    for (const polygon of feature.geometry.coordinates) for (const ring of polygon) for (const [x, y] of ring) each(Math.round(x / CELL), Math.round(y / CELL));
  };
  const own = (await loadEntityGeometry('mid', q.entity.id)).get(q.version.key);
  if (!own) return null;
  const grid = new Set<string>();
  points(own, (cx, cy) => {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) grid.add(`${cx + dx},${cy + dy}`);
  });
  let best: string | null = null;
  let most = 1;
  for (const t of neighborsOf(data, q, 30)) {
    const feature = (await loadEntityGeometry('mid', t.entityId)).get(t.key);
    if (!feature) continue;
    let near = 0;
    points(feature, (cx, cy) => {
      if (grid.has(`${cx},${cy}`)) near++;
    });
    if (near > most) {
      most = near;
      best = t.entityId;
    }
  }
  return best;
}
