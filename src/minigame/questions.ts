// 미니게임 문제 만들기 (2026-11-17). 본 지도의 자료(territories.json·entities.json·events.json)만 쓴다.
import { activeTerritories, type LoadedEntity, type StaticData } from '../data/staticData.ts';
import type { TerritoryIndexEntry } from '../schema/index.ts';
import { inRegionFilter, unitsOf, type RegionFilter } from '../schema/regions.ts';

/** 시대 구분 (연도 맞추기의 '시대' 힌트에 쓴다. 출제 범위를 시대로 고르는 기능은 2026-11-18에 뺐다: 시대가 곧 답의 일부라서) */
export type Era = 'ancient' | 'medieval' | 'modern';
export type Level = 'easy' | 'normal' | 'hard';
export const LEVELS: Level[] = ['easy', 'normal', 'hard'];
export const LEVEL_LABEL: Record<Level, string> = { easy: '쉬움', normal: '보통', hard: '어려움' };
/** 문제로 낼 나라와 모습: top은 넓은 나라의 전성기, peak는 모든 나라의 전성기, any는 모든 나라의 아무 시기 */
export type Pool = 'top' | 'peak' | 'any';

/** 한 문제: 나라 + 해 한 쌍. 해는 영토가 그대로였던 구간(version)의 가운데 해 */
export interface Question {
  entity: LoadedEntity;
  version: TerritoryIndexEntry;
  year: number;
  /** 4지선다 보기(정답 포함, 섞은 순서) */
  options: LoadedEntity[];
}

/** 한 판의 문제 수: 고를 수 있는 값과 기본값 (2026-11-23, 게임 고르기 화면에서 고른다) */
export const ROUNDS = [5, 10, 20] as const;
export const ROUND = 5;
/** 화면에서 점처럼 보이는 아주 작은 나라는 내지 않는다 (경위도 범위의 넓이, 제곱도) */
const MIN_SPAN = 4;
/** top은 넓이 순으로 위쪽 이 비율의 나라만 낸다 */
const EASY_TOP = 0.35;

export const span = ({ bbox: [w, s, e, n] }: TerritoryIndexEntry) => (e < w ? e + 360 - w : e - w) * (n - s);
export const eraOf = (year: number): Era => (year < 500 ? 'ancient' : year < 1500 ? 'medieval' : 'modern');
/** 나라의 기본 권역 단위(여러 권역에 걸치는 나라는 첫 단위) */
export const unitOf = (e: LoadedEntity) => unitsOf(e)[0];

export const ERA_LABEL = { ancient: '고대 (기원후 500년 이전)', medieval: '중세 (500~1500년)', modern: '근대 이후 (1500년 이후)' } as const;

/** 영토가 그대로였던 기간 [첫 해, 마지막 해]. 연도 맞추기의 정답은 이 기간이 걸친 세기(쉬움)·10년 단위(어려움) 전부다 */
export const keepRange = (q: Question, end: number): [number, number] => [q.version.from, (q.version.to ?? end + 1) - 1];

// 세기와 10년 단위를 차례대로 이어지는 번호로 바꾼다 (기원전은 음수. 해가 늦을수록 번호가 크다)
// 세기: 1년~100년 = 1, 101년~200년 = 2, 기원전 100년~기원전 1년 = -1
export const centuryKey = (year: number) => (year >= 1 ? Math.ceil(year / 100) : -Math.ceil((1 - year) / 100));
export const centuryKeyText = (k: number) => (k > 0 ? `${k}세기` : `기원전 ${-k}세기`);
// 10년 단위: 1830년~1839년 = 183, 1년~9년 = 0, 기원전 1년~9년 = -1, 기원전 10년~19년 = -2
export const decadeKey = (year: number) => (year >= 1 ? Math.floor(year / 10) : -1 - Math.floor((1 - year) / 10));
export const decadeKeyText = (k: number) => (k > 0 ? `${k * 10}년대` : k === 0 ? '1년~9년' : k === -1 ? '기원전 1년~9년' : `기원전 ${(-1 - k) * 10}년대`);

/** 글 속의 연도·세기 숫자를 가린다 (연도 맞추기의 사건 힌트) */
// '656년', '7세기'뿐 아니라 제목의 '(656~661)' 같은 범위와 서너 자리 숫자도 가린다
export const maskYears = (text: string) => text.replace(/\d{3,4}|\d+(?=\s*(년|세기|~))|(?<=~\s*)\d+/g, (d) => '■'.repeat(d.length));

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 구간의 가운데 해. to는 그 해부터 다음 모습이므로 빼고 센다 */
export function midYear(v: TerritoryIndexEntry, end: number): number {
  const last = (v.to ?? end + 1) - 1;
  return Math.floor((v.from + last) / 2);
}

/** 이 나라가 가장 넓었던 모습(전성기)과 그 구간의 가운데 해. 귀속 논쟁 도형은 빼고 고른다(그것뿐이면 그 가운데서) */
export function peakOf(data: StaticData, q: Question): { version: TerritoryIndexEntry; year: number } {
  const own = data.territories.filter((t) => t.entityId === q.entity.id);
  const sure = own.filter((t) => t.certainty !== 'disputed');
  const list = sure.length ? sure : own;
  if (!list.length) return { version: q.version, year: q.year };
  const version = list.reduce((a, b) => (span(b) > span(a) ? b : a));
  return { version, year: midYear(version, data.timeline.range[1]) };
}

export function buildQuestions(data: StaticData, pool: Pool, region: RegionFilter, count: number = ROUND): Question[] {
  const end = data.timeline.range[1];
  // 나라별로 낼 수 있는 구간을 모은다: 나라(polity)만, 귀속 논쟁 도형은 빼고, 너무 작은 것도 뺀다
  const byEntity = new Map<string, TerritoryIndexEntry[]>();
  for (const t of data.territories) {
    const e = data.entities.get(t.entityId);
    if (!e || e.level !== 'polity' || t.certainty === 'disputed' || span(t) < MIN_SPAN) continue;
    if (!inRegionFilter(region, e.region, e.units)) continue;
    byEntity.set(t.entityId, [...(byEntity.get(t.entityId) ?? []), t]);
  }
  // 나라마다 구간 하나: 가장 넓었던 구간(전성기), any만 아무 구간
  let picks = [...byEntity.values()].map((vs) =>
    pool === 'any' ? vs[Math.floor(Math.random() * vs.length)] : vs.reduce((a, b) => (span(b) > span(a) ? b : a)),
  );
  if (pool === 'top') {
    picks.sort((a, b) => span(b) - span(a));
    picks = picks.slice(0, Math.max(count, Math.ceil(picks.length * EASY_TOP)));
  }
  const withGeo = new Set(data.territories.map((t) => t.entityId));
  const polities = [...data.entities.values()].filter((e) => e.level === 'polity' && withGeo.has(e.id));
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const version of shuffle(picks)) {
    const entity = data.entities.get(version.entityId)!;
    if (seen.has(entity.names.ko)) continue;
    seen.add(entity.names.ko);
    const year = midYear(version, end);
    // 오답 보기: 같은 권역, 비슷한 시대(앞뒤 200년 안에 있던 나라). 모자라면 다른 권역에서 채운다
    const alive = (e: LoadedEntity) => e.from <= year + 200 && (e.to === null || e.to >= year - 200);
    const others = polities.filter((e) => e.names.ko !== entity.names.ko && alive(e));
    const near = shuffle(others.filter((e) => unitOf(e) === unitOf(entity)));
    const wrong: LoadedEntity[] = [];
    for (const e of [...near, ...shuffle(others)]) {
      if (wrong.length === 3) break;
      if (!wrong.some((w) => w.names.ko === e.names.ko)) wrong.push(e);
    }
    out.push({ entity, version, year, options: shuffle([entity, ...wrong]) });
    if (out.length === count) break;
  }
  return out;
}

// ---- 나라 이름 맞추기 어려움(이름을 적는 주관식)의 정답 판정 (2026-11-23)
/** 이름 끝에 붙는 정체 낱말: 띄어 쓴 마지막 낱말이 이것이면 빼고 적어도 정답으로 친다 ('잉카 제국' → '잉카') */
const TAILS = ['왕국', '제국', '공화국', '대공국', '공국', '후국', '백국', '술탄국', '칸국', '한국', '왕조', '연방', '식민지', '부왕령', '총사령부', '토후국', '에미르국', '칼리프국', '연합', '동맹'];
/** 정답으로 치는 이름들: 괄호 안을 뺀 이름, 그리고 끝의 정체 낱말까지 뺀 이름 */
export function answerNames(e: LoadedEntity): string[] {
  const base = e.names.ko.replace(/\s*\([^)]*\)/g, '').trim();
  const words = base.split(' ');
  const short = words.length > 1 && TAILS.includes(words[words.length - 1]) ? words.slice(0, -1).join(' ') : base;
  return [...new Set([base, short])];
}
/** 견줄 때는 괄호 안, 띄어쓰기, 가운뎃점·붙임표를 보지 않는다 */
const plainName = (s: string) => s.replace(/\([^)]*\)/g, '').replace(/[\s·\-‐–.,'’]/g, '').toLowerCase();
export const isNameAnswer = (e: LoadedEntity, text: string) => plainName(text) !== '' && answerNames(e).some((n) => plainName(n) === plainName(text));
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
/** 한글 글자를 초성으로 바꾼다 (한글이 아닌 글자와 띄어쓰기는 그대로) */
export const chosung = (s: string) => [...s].map((c) => (c >= '가' && c <= '힣' ? CHO[Math.floor((c.charCodeAt(0) - 0xac00) / 588)] : c)).join('');

export const yearText = (year: number) => (year < 1 ? `기원전 ${1 - year}년` : `${year}년`);
export const centuryText = (year: number) => centuryKeyText(centuryKey(year));

/** 이 나라의 사건 가운데 문제의 해에 가장 가까운 것. hide가 'name'이면 글에 든 나라 이름을, 'year'면 연도를 가린다 */
export function eventHint(data: StaticData, q: Question, hide: 'name' | 'year' = 'name'): string | null {
  const list = data.events.filter((e) => e.subjects.includes(q.entity.id));
  if (!list.length) return null;
  const ev = list.reduce((a, b) => (Math.abs(b.year - q.year) < Math.abs(a.year - q.year) ? b : a));
  let text = `${ev.title.ko}: ${ev.summary.ko.split('. ')[0].replace(/\.$/, '')}.`;
  if (hide === 'year') return maskYears(text);
  const names = [q.entity.names.ko, q.entity.names.ko.split(' ')[0]].filter((n) => n.length >= 2).sort((a, b) => b.length - a.length);
  for (const n of names) text = text.split(n).join('■'.repeat(n.length));
  return text;
}

/** 같은 권역에서 그 무렵에 있던, 이 나라와 관계없는 사건 (연도는 가린다) */
export function regionEventHint(data: StaticData, q: Question): string | null {
  // 선사 유물·유적(tags의 relic)은 해가 단계의 해라 '그 무렵 사건'으로 쓰지 않는다(2026-11-25 사본 시험)
  const list = data.events.filter((e) => inRegionFilter(unitOf(q.entity) ?? 'all', e.region, e.units) && !e.subjects.includes(q.entity.id) && !e.tags.includes('relic'));
  if (!list.length) return null;
  const ev = list.reduce((a, b) => (Math.abs(b.year - q.year) < Math.abs(a.year - q.year) ? b : a));
  return maskYears(`${ev.title.ko}: ${ev.summary.ko.split('. ')[0].replace(/\.$/, '')}.`);
}

/** 그 해에 둘레에 있던 나라들 (경위도 범위가 맞닿거나 겹치는 것. 실제로 국경을 맞댔는지는 따지지 않는다) */
export function neighborsOf(data: StaticData, q: Question, max = 8): TerritoryIndexEntry[] {
  const [w, s, e, n] = q.version.bbox;
  const pad = 1;
  return activeTerritories(data.territories, q.year)
    .filter((t) => {
      const ent = data.entities.get(t.entityId);
      if (!ent || ent.level !== 'polity' || ent.names.ko === q.entity.names.ko) return false;
      const [tw, ts, te, tn] = t.bbox;
      return tw <= e + pad && te >= w - pad && ts <= n + pad && tn >= s - pad;
    })
    .sort((a, b) => span(b) - span(a))
    .slice(0, max);
}
