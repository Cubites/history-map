import { useEffect, useRef, useState } from 'react';
import type { StaticData } from '../data/staticData.ts';
import { factionColor, formatFrontDate, snapshotFor, type WarTheater } from '../lib/wars.ts';
import { formatYear } from '../lib/year.ts';
import { activeEventId, useAppStore, warShareUrl } from '../store/useAppStore.ts';
import { ABOUT_LIST_MIN, Sentences, splitSentences } from './aboutText.tsx';
import { CopyLink } from './CopyLink.tsx';
import { scrollUnderHeader } from './scrollUnderHeader.ts';

/**
 * 전쟁 보기의 정보 패널 (2026-11-21, DESIGN.md §4.5). 나라 정보 패널 자리(PC 왼쪽 칸, 휴대폰 아래 판)에 나라 정보 대신 그린다.
 * 머리는 나라 이름란과 같은 모양: 이름 자리에 전쟁 이름, 원문 이름 자리에 기간(전역이 여럿이면 전역 이름도), 그 아래 진영 색 설명, 오른쪽 끝 ×로 전쟁 보기를 닫는다.
 * 그 아래는 사건 목록과 같은 모양의 날짜 목록: 앞에 날짜, 제목에 그때 상황 한 줄, 펼치면 자세한 글. 누른 날짜의 점령 지역·전선을 지도가 그린다.
 * 링크 복사(2026-11-21, 나라 이름·펼친 사건 제목과 같은 CopyLink): 전쟁 이름을 누르면 이 전쟁(전역) 보기의 첫 날짜 화면, 펼친 날짜의 제목을 누르면 그 날짜 화면의 바로 가기 링크를 복사한다.
 * 전에는 화면 아래 날짜 줄(FrontTimeline)과 지도 아래 가운데 '닫기' 띠가 이 일을 했다
 */
export function WarPanel({ data, warView }: { data: StaticData; warView: WarTheater }) {
  const year = useAppStore((s) => s.year);
  const frontDate = useAppStore((s) => s.frontDate);
  const hoveredEventId = useAppStore(activeEventId);
  const setFront = useAppStore((s) => s.setFront);
  const exitWar = useAppStore((s) => s.exitWar);
  const { war, theater } = warView;
  const hoveredEvent = hoveredEventId ? data.events.find((e) => e.id === hoveredEventId) : undefined;
  const current = snapshotFor(warView, year, frontDate, hoveredEvent);
  const entityColor = (id: string) => data.entities.get(id)?.color;

  // 지도에 그린 날짜는 펼쳐 둔다. 그 날짜를 다시 누르면 접고(지도는 그대로), 다른 날짜를 누르면 그 날짜로 옮겨 펼친다
  const [foldedDate, setFoldedDate] = useState<string | null>(null);
  const currentRef = useRef<HTMLLIElement>(null);
  // 날짜·전역이 바뀌면(처음 열 때도) 그 날짜를 머리 바로 아래로 스크롤한다.
  // 조금 늦춰서 한다: 휴대폰 판이 내림에서 접힘으로 올라올 때 스크롤을 맨 위로 되돌리므로(useBottomSheet) 그 뒤에 해야 남는다
  useEffect(() => {
    const timer = setTimeout(() => currentRef.current && scrollUnderHeader(currentRef.current), 60);
    return () => clearTimeout(timer);
  }, [current.date, theater.id]);

  return (
    <>
      <header className="panel-header panel-header-sticky" data-sheet-head>
        <div className="war-head">
          <h2>
            <CopyLink url={() => warShareUrl(war.id, theater.id, theater.snapshots[0].year)} label={war.name}>
              {war.name}
            </CopyLink>
            <span className="hanja">
              {formatYear(war.from, '')}–{formatYear(war.to)}
              {war.theaters.length > 1 && ` · ${theater.name}`}
            </span>
          </h2>
          <div className="war-legend">
            {war.factions.map((f) => (
              <span key={f.id} className="war-legend-item">
                <i className="war-legend-swatch" style={{ background: factionColor(war, f.id, entityColor) }} />
                {f.name}
              </span>
            ))}
          </div>
        </div>
        {/* 전쟁 보기 닫기: 나라 선택 해제 ×와 같은 자리·모양. PC는 Esc도 같음(EventPanel) */}
        <button type="button" className="panel-deselect" onClick={exitWar} aria-label="전쟁 보기 닫기" title="전쟁 보기 닫기 (Esc)">
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
            <path d="M2 2 12 12M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <ol className="event-list war-fronts" aria-label={`${war.name} 날짜별 상황`}>
        {theater.snapshots.map((s) => {
          const on = s === current;
          const expanded = on && foldedDate !== s.date;
          const activate = () => {
            if (on) setFoldedDate(expanded ? s.date : null);
            else {
              setFoldedDate(null);
              setFront(s.year, s.date);
            }
          };
          const sentences = splitSentences(s.summary);
          return (
            <li
              key={s.date}
              ref={on ? currentRef : undefined}
              aria-expanded={expanded}
              aria-current={on || undefined}
              className={`event${on ? ' event-hovered event-pinned' : ''}`}
              onClick={activate}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
                e.preventDefault();
                activate();
              }}
              tabIndex={0}
            >
              <div className="event-head">
                <span className="event-year">{formatFrontDate(s.date, war.calendar)}</span>
                {/* 펼친 날짜만 제목 끝에 복사 아이콘. 제목을 누르면 접히지 않고 이 날짜 화면의 링크를 복사한다 */}
                <span className="event-title">
                  {expanded ? (
                    <CopyLink url={() => warShareUrl(war.id, theater.id, s.year, s.date)} label={s.title}>
                      {s.title}
                    </CopyLink>
                  ) : (
                    s.title
                  )}
                </span>
                <span className="event-toggle" aria-hidden="true">{expanded ? '▴' : '▾'}</span>
              </div>
              {expanded && <Sentences sentences={sentences} className="event-summary" list={sentences.length >= ABOUT_LIST_MIN} />}
            </li>
          );
        })}
      </ol>
    </>
  );
}
