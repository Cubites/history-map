import { useState } from 'react';
import { formatYear } from '../lib/year.ts';
import type { Entity, HistoryEvent } from '../schema/index.ts';
import { ABOUT_LIST_MIN, Sentences, splitSentences, withYears } from './aboutText.tsx';

/**
 * 나라 이름·기간 아래를 '개요 / 시작과 끝 / 특징' 세 탭으로 나눈다(2026-10-18).
 * 동로마 제국은 손으로 고른 글(TEXTS)을, 다른 나라는 기존 summary·details·foundingNote·mapNote·refs에서 자동으로 나눈 글을 쓴다.
 */
interface TabText {
  overview: string;
  refs: string[];
  start: { note?: string; events: HistoryEvent[] };
  end: { note?: string; lead?: string; events: HistoryEvent[] };
  features: string[];
  details?: string;
}

/** 손으로 고른 글(동로마 제국). 사건은 id로 지정한다 */
const TEXTS: Record<string, Omit<TabText, 'start' | 'end'> & { start: { note: string; events: string[] }; end: { note: string; lead?: string; events: string[] } }> = {
  'byzantine-empire': {
    overview: '로마 제국이 동서로 나뉜 뒤(395) 콘스탄티노폴리스를 수도로 이어진 동쪽 로마 제국(비잔티움 제국).',
    refs: ['두카스, 『비잔티움사』', '스프란체스, 『연대기』', '갈리폴리 조약(1403)'],
    start: { note: '테오도시우스 1세가 죽어 제국이 동서로 나뉜 395년을 시작으로 봄.', events: ['theodosius-i-379'] },
    end: {
      note: '1453년 5월 29일 메흐메트 2세에게 콘스탄티노폴리스가 함락되어 무너짐.',
      events: ['rumeli-hisari-1452', 'constantinople-1453'],
      lead: '1402년 앙카라 전투 뒤 1403년 갈리폴리 조약으로 테살로니키와 트라키아·마케도니아·테살리아 해안을 되찾았으나 1423년 테살로니키를 베네치아에 넘기고 1424년 오스만에 공물을 바치기로 함.',
    },
    features: [
      '수도는 콘스탄티노폴리스.',
      '유스티니아노스 때 재정복으로 땅을 넓힘(534·535·540·552·554).',
      '568~615년 롬바르드·슬라브·아바르에, 637~653년 아랍에 변경 땅을 잃음.',
      '1204~1260년 라틴 제국·니케아 제국·에피루스·트레비존드 등으로 나뉘었다가 1261년 콘스탄티노폴리스를 되찾음.',
      '말기에는 황족이 다스린 모레아 전제공국(펠로폰네소스)이 마지막까지 남음.',
    ],
  },
};

/** 끝을 말하는 문장으로 볼 낱말(자동으로 나눌 때) */
const END_RE = /멸망|무너|망함|병합되|합쳐지|해체|폐지되|사라짐|끝남|흡수되|넘어감|넘겨짐|이어짐|바뀜|바뀌|항복|정복되|점령되|폐위/;
/** 시작·끝 무렵 사건을 해로 고를 때 한 쪽에 보일 최대 수 */
const EVENTS_PER_SIDE = 3;

function buildText(entity: Entity, events: HistoryEvent[]): TabText {
  const hand = TEXTS[entity.id];
  const byId = (ids: string[]) => ids.flatMap((id) => events.find((e) => e.id === id) ?? []);
  if (hand) return { ...hand, start: { ...hand.start, events: byId(hand.start.events) }, end: { ...hand.end, events: byId(hand.end.events) } };
  // 자동: 시작·끝 무렵 사건은 해(또는 끝 해)가 창 안에 드는 것. 시작과 무관한 사건이 걸릴 수 있어, 고르려면 TEXTS에 id로 적는다
  const near = (lo: number, hi: number) =>
    events.filter((e) => (e.year >= lo && e.year <= hi) || (e.endYear != null && e.endYear >= lo && e.endYear <= hi)).slice(0, EVENTS_PER_SIDE);
  const sentences = splitSentences(entity.summary ?? '');
  const [first, ...rest] = sentences;
  // 끝 문장: 끝이 있는 나라면 설명에서 끝을 말하는 마지막 문장, 없으면 자세한 흐름에서. 고른 문장은 특징에서 뺀다
  const lastEnd = (list: string[]) => [...list].reverse().find((s) => END_RE.test(s));
  const endNote = entity.to === null ? undefined : (lastEnd(rest) ?? lastEnd(splitSentences(entity.details ?? '')));
  return {
    overview: first ?? '',
    refs: entity.basis?.refs ?? [],
    start: { note: entity.basis?.foundingNote, events: near(entity.from - 1, entity.from + 1) },
    end: { note: endNote, events: entity.to === null ? [] : near(entity.to - 2, entity.to + 1) },
    features: rest.filter((s) => s !== endNote),
    details: entity.details,
  };
}

type Tab = 'overview' | 'span' | 'features';
const TAB_KEY = 'history-map:entity-tab';
const readTab = (): Tab => {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return v === 'span' || v === 'features' ? v : 'overview';
  } catch {
    return 'overview';
  }
};

export function EntityTabs({
  entity,
  events,
  successors,
  onEvent,
  onSuccessor,
}: {
  entity: Entity;
  events: HistoryEvent[];
  successors: { id: string; name: string; from: number }[];
  onEvent: (e: HistoryEvent) => void;
  onSuccessor: (id: string, year: number) => void;
}) {
  const [tab, setTab] = useState<Tab>(readTab);
  const t = buildText(entity, events);
  // 내용이 없는 탭은 숨긴다. 기억한 탭이 숨겨졌으면 개요를 연다
  const tabs: [Tab, string][] = [
    ['overview', '개요'],
    ['span', '시작과 끝'],
    ...(t.features.length > 0 || t.details ? [['features', '특징'] as [Tab, string]] : []),
  ];
  const active: Tab = tabs.some(([key]) => key === tab) ? tab : 'overview';
  const choose = (next: Tab) => {
    setTab(next);
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // 저장하지 못해도 이번 화면에서는 그대로 동작한다
    }
  };
  const eventLinks = (list: HistoryEvent[]) =>
    list.length > 0 && (
      <ul className="tab-events">
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" className="link-button" onClick={() => onEvent(e)}>
              {formatYear(e.year)} {e.title.ko} →
            </button>
          </li>
        ))}
      </ul>
    );
  const detailSentences = splitSentences(t.details ?? '');
  const mapSentences = splitSentences(entity.mapNote ?? '');
  return (
    <div className="entity-tabs">
      <div className="tab-row" role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} className={active === key ? 'tab on' : 'tab'} onClick={() => choose(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tab-body" role="tabpanel">
        {active === 'overview' && (
          <>
            <p className="tab-text">{withYears(t.overview)}</p>
            {t.refs.length > 0 && <p className="tab-refs">근거 자료: {t.refs.join(' · ')}</p>}
          </>
        )}
        {active === 'span' && (
          <>
            <h4>시작 · {formatYear(entity.from)}</h4>
            {t.start.note && <p className="tab-text">{withYears(t.start.note)}</p>}
            {eventLinks(t.start.events)}
            <h4>끝 · {entity.to === null ? '현재' : formatYear(entity.to)}</h4>
            {t.end.lead && <p className="tab-text tab-muted">{withYears(t.end.lead)}</p>}
            {t.end.note ? <p className="tab-text">{withYears(t.end.note)}</p> : entity.to === null && <p className="tab-text tab-muted">지금까지 이어짐</p>}
            {eventLinks(t.end.events)}
            {successors.length > 0 && (
              <ul className="tab-events">
                {successors.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="link-button" onClick={() => onSuccessor(s.id, s.from)}>
                      뒤를 이은 나라: {s.name} ({formatYear(s.from)}) →
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {active === 'features' && (
          <>
            {t.features.length > 0 && <Sentences sentences={t.features} className="tab-list" list />}
            {t.details && (
              <details className="about-note about-fold">
                <summary>자세한 흐름</summary>
                <Sentences sentences={detailSentences} className="panel-note" list={detailSentences.length >= ABOUT_LIST_MIN} />
              </details>
            )}
          </>
        )}
        {entity.mapNote && (
          <details className="about-note about-fold">
            <summary>지도 표시</summary>
            <Sentences sentences={mapSentences} className="panel-note" list={mapSentences.length >= ABOUT_LIST_MIN} />
          </details>
        )}
      </div>
    </div>
  );
}
