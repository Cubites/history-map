// 세 미니게임이 함께 쓰는 부품 (2026-11-17): 위쪽 상태 줄, 힌트 목록, 정답 뒤 상자, 옆 나라 도형 받기.
import { useEffect, useState, type ReactNode } from 'react';
import { loadEntityGeometry, type StaticData } from '../data/staticData.ts';
import type { MapShape } from './QuizMap.tsx';
import { neighborsOf, type Level, type Question } from './questions.ts';

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
/** 어려움의 첫 힌트: 국경선만 보이던 지도에 둘레의 육지와 바다(와 나라 색)를 보여 준다 */
export const LAND_HINT: Hint = ['둘레의 육지와 바다', '지도에 둘레의 육지와 바다를 표시했습니다.'];

export function Status({ title, level, total, outcomes, points }: { title: string; level?: Level; total: number; outcomes: Outcome[]; points: number }) {
  const score = outcomes.reduce((sum, o) => sum + o.points, 0);
  let streak = 0;
  for (let i = outcomes.length - 1; i >= 0 && outcomes[i].ok; i--) streak++;
  return (
    <div className="mg-status">
      <b>{title}</b>
      {level && <span className="mg-level">{level === 'hard' ? '어려움' : '쉬움'}</span>}
      <span>문제 {outcomes.length + 1} / {total}</span>
      <span className="mg-dots">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} className={i < outcomes.length ? (outcomes[i].ok ? 'ok' : 'no') : i === outcomes.length ? 'now' : ''} />
        ))}
      </span>
      <span className="mg-sp" />
      <span>연속 정답 <b>{streak}</b></span>
      <span>점수 <b>{score}</b></span>
      <span>이번 문제 <b>{points}</b>점</span>
    </div>
  );
}

/** 힌트는 위에서부터 차례로만 열린다. answered면 더 열 수 없다 */
export function Hints({ hints, opened, answered, onOpen }: { hints: Hint[]; opened: number; answered: boolean; onOpen: () => void }) {
  return (
    <div className="mg-hints">
      <h3><span>힌트</span><span>하나 열 때마다 {HINT_COST}점 감점</span></h3>
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

/** 옆 나라 도형. on이 될 때 받아 온다 (이름과 함께 그릴 수 있게 이름·기준점을 붙인다) */
export function useNeighbors(data: StaticData, q: Question, on: boolean): MapShape[] {
  const [near, setNear] = useState<MapShape[]>([]);
  useEffect(() => {
    if (!on) return;
    let alive = true;
    Promise.all(
      neighborsOf(data, q).map(async (t) => {
        const feature = (await loadEntityGeometry('mid', t.entityId)).get(t.key);
        const e = data.entities.get(t.entityId)!;
        return feature ? { feature, color: e.color, name: e.names.ko, anchor: t.anchor } : null;
      }),
    ).then((list) => alive && setNear(list.filter((s): s is NonNullable<typeof s> => s !== null))).catch(() => {});
    return () => {
      alive = false;
    };
  }, [on, data, q]);
  return near;
}
