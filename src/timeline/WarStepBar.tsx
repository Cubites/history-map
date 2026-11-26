import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { activeWarView, formatFrontDate, snapshotFor } from '../lib/wars.ts';
import { activeEventId, useAppStore } from '../store/useAppStore.ts';

/**
 * 전쟁 보기의 상황 막대 (2026-11-23, DESIGN.md §4.5). 평소의 연도 막대(MapYearControls) 자리에 같은 모양으로 그린다:
 * PC·휴대폰 모두 지도 영역 맨 아래에 띄운 가로 막대(.flat, 왼쪽이 첫 상황)이고, 눈금마다 상황 번호를 막대 위에 늘 보인다
 * (2026-11-26 사본 시험: 전에는 PC가 지도 아래 띠, 휴대폰이 지도 오른쪽 세로 막대였다).
 * 눈금은 날짜 간격과 상관없이 같은 간격으로 둔다(날짜에 비례하면 며칠 사이의 상황들이 한곳에 겹친다).
 * 막대를 누르거나 끌면 가장 가까운 상황으로 옮긴다(전쟁 정보 목록에서 날짜를 누른 것과 같음). 번호는 목록·지도 번호 핀과 같다
 */
export function WarStepBar({ data }: { data: StaticData }) {
  const year = useAppStore((s) => s.year);
  const warId = useAppStore((s) => s.warId);
  const theaterId = useAppStore((s) => s.theaterId);
  const frontDate = useAppStore((s) => s.frontDate);
  const hoveredEventId = useAppStore(activeEventId);
  const setFront = useAppStore((s) => s.setFront);
  const warView = useMemo(() => activeWarView(data.wars, warId, theaterId, year), [data.wars, warId, theaterId, year]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  if (!warView) return null;
  const { war, theater } = warView;
  const snapshots = theater.snapshots;
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;
  const current = snapshotFor(warView, year, frontDate, hoveredEvent);
  const index = snapshots.indexOf(current);
  const last = snapshots.length - 1;
  const frac = (i: number) => (last > 0 ? i / last : 0.5);
  const at = (i: number) => ({ left: `${frac(i) * 100}%` });
  const pick = (i: number) => {
    const s = snapshots[Math.min(last, Math.max(0, i))];
    if (s !== current) setFront(s.year, s.date);
  };
  const indexAt = (e: ReactPointerEvent) => {
    const r = trackRef.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return Math.round(t * last);
  };

  return (
    <div
      className={['map-yearbar map-ui war-steps across flat', dragging && 'dragging'].filter(Boolean).join(' ')}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        ref={trackRef}
        className="map-yearbar-track"
        role="slider"
        tabIndex={0}
        aria-label={`${war.name} 상황`}
        aria-orientation="horizontal"
        aria-valuemin={1}
        aria-valuemax={snapshots.length}
        aria-valuenow={index + 1}
        aria-valuetext={`${index + 1}번 ${formatFrontDate(current.date, war.calendar)} ${current.title}`}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // 붙잡지 못해도 막대 위에서는 그대로 끌린다
          }
          setDragging(true);
          pick(indexAt(e));
        }}
        onPointerMove={(e) => {
          if (dragging) pick(indexAt(e));
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          // 다음 상황: → 또는 ↓
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pick(index + 1);
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') pick(index - 1);
          else return;
          e.preventDefault();
        }}
      >
        <i className="map-yearbar-rail" />
        <i className="map-yearbar-fill" style={{ right: `${(1 - frac(index)) * 100}%` }} />
        {snapshots.map((s, i) => (
          <span key={s.date} className="map-yearbar-mark m500" style={at(i)}>
            <span className={`war-step-no${i === index ? ' on' : ''}`}>{i + 1}</span>
          </span>
        ))}
        <span className="map-yearbar-thumb" style={at(index)} />
      </div>
    </div>
  );
}
