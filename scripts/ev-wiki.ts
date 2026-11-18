// 사건 sources의 위키백과 문서 확인(ev:check --wiki, 2026-11-18 개선 ⑤): sources에 적은 위키백과 문서 제목이 그 언어판에 실제로 있는지, 동음이의 문서가 아닌지 위키백과 API로 본다.
// 왜: 오세아니아 사건 1묶음 사실 대조의 [서지] 15건 가운데 12건이 '그 제목의 문서가 없음(404)'(한국어판 탐험가 문서 여섯·영어판 'Pritchard Affair' 등)이거나
//   '동음이의 문서'(한국어판 '제1함대')였다 — 대조가 문서를 하나하나 열어 잡던 것을 기계로 미리 잡는다. 나머지 셋(본문이 이름으로 든 책이 sources에 없음, 숫자의 근거 책을 더함)은 ③ 인용 저자·안내서 규칙 몫.
// 읽는 꼴(sources 한 줄에서):
//   '위키백과 [한국어판|영어판|…판] 제목' — 판이 없으면 제목에 한글이 있으면 한국어판, 아니면 영어판. 제목을 '·'로 이은 것은 여럿으로 나눈다.
//     제목 뒤 '(https://xx.wikipedia.org/wiki/…)'가 있으면 그 주소의 언어·제목을 쓴다. 제목 끝의 띄어쓰기 든 한글 괄호('(몰리 길런의 값 인용)')는 떼고(한국어판 제목의 '제1함대 (오스트레일리아)'는 둠), 한글 없는 괄호('Battle of Guam (1944)')는 제목의 일부로 둔다.
//   '제목, Wikipedia (en)' · 다른 글 속 '(위키백과 영어판 제목 참조)'. 제목 없는 '(위키백과 영어판 참조)'는 보지 않는다.
// 네트워크: 언어판마다 https://<언어>.wikipedia.org/w/api.php 에 제목 50개씩(action=query·redirects·pageprops=disambiguation). 보내는 것은 sources의 문서 제목뿐.
//   요청 사이 0.5초 쉬고, 막히면('too many requests') 10초 뒤 한 번 더 묻는다. 넘겨주기(redirect)는 있는 문서로 친다. 결과는 .cache/ev-check/wiki.json에 30일 둔다(같은 제목을 다시 묻지 않음).
//   API에 닿지 못하면 '못 봄'으로 알리고 항목으로 세지 않는다(종료 코드에 넣지 않음).
// 한계: 문서가 있어도 본문이 그 사실을 다루는지는 모른다(사실 대조 몫). 책·논문 서지(판·출판 연도)는 보지 않는다.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface WikiRef {
  lang: string;
  title: string;
  /** sources 원문 */
  src: string;
}

const LANG: Record<string, string> = {
  한국어판: 'ko', 영어판: 'en', 일본어판: 'ja', 중국어판: 'zh', 프랑스어판: 'fr', 독일어판: 'de', 스페인어판: 'es', 포르투갈어판: 'pt', 이탈리아어판: 'it',
  러시아어판: 'ru', 네덜란드어판: 'nl', 아랍어판: 'ar', 튀르키예어판: 'tr', 터키어판: 'tr', 페르시아어판: 'fa', 베트남어판: 'vi', 폴란드어판: 'pl',
};
const HANGUL = /[가-힣]/;

function fromUrl(u: string, src: string): WikiRef | null {
  const m = u.match(/https?:\/\/([a-z-]+)\.(?:m\.)?wikipedia\.org\/wiki\/((?:[^\s?#()]|\([^\s()]*\))+)/);
  if (!m) return null;
  let title = m[2];
  try {
    title = decodeURIComponent(title);
  } catch {
    /* 그대로 */
  }
  return { lang: m[1], title: title.replace(/_/g, ' '), src };
}

function split(lang: string | undefined, body: string, src: string): WikiRef[] {
  const url = body.match(/\((https?:\/\/[^\s]+wikipedia\.org\/wiki\/[^\s]+)\)\s*$/);
  if (url) {
    const r = fromUrl(url[1], src);
    return r ? [r] : [];
  }
  // 끝의 한글 괄호를 뗀다(여러 번)
  let t = body.trim();
  for (let m = t.match(/\s*\(([^()]*)\)\s*$/); m && HANGUL.test(m[1]) && /\s/.test(m[1].trim()); m = t.match(/\s*\(([^()]*)\)\s*$/)) t = t.slice(0, m.index).trim();
  if (!t) return [];
  return t
    .split('·')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((title) => ({ lang: lang ?? (HANGUL.test(title) ? 'ko' : 'en'), title, src }));
}

/** sources 한 줄에서 위키백과 문서 참조를 뽑는다 */
export function wikiRefs(src: string): WikiRef[] {
  const s = src.trim();
  const en = s.match(/^(.+),\s*Wikipedia\s*\(([a-z-]+)\)$/);
  if (en) return [{ lang: en[2], title: en[1].trim(), src }];
  const head = s.match(/^위키백과\s*(\S+판)?\s*(.*)$/);
  if (head) {
    if (head[1] && !LANG[head[1]]) return [];
    return split(head[1] ? LANG[head[1]] : undefined, head[2], src);
  }
  const out: WikiRef[] = [];
  for (const m of s.matchAll(/위키백과\s*(\S+판)\s+([^()]+?)\s*참조\)/g)) if (LANG[m[1]]) out.push(...split(LANG[m[1]], m[2], src));
  for (const m of s.matchAll(/https?:\/\/[a-z-]+\.(?:m\.)?wikipedia\.org\/wiki\/[^\s)]+/g)) {
    const r = fromUrl(m[0], src);
    if (r && !out.some((x) => x.lang === r.lang && x.title === r.title)) out.push(r);
  }
  return out;
}

type Status = 'ok' | 'missing' | 'disambig' | 'invalid';
interface CacheEntry {
  s: Status;
  t: number;
}
const DAY = 86_400_000;
const KEEP_DAYS = 30;
const BATCH = 50;
const UA = 'history-map-ev-check/1.0 (sources title check)';

/** 제목들의 상태. 닿지 못한 언어판은 errors에 */
export async function wikiStatus(refs: WikiRef[], cacheDir: string): Promise<{ status: Map<string, Status>; errors: string[]; asked: number; cached: number }> {
  const file = path.join(cacheDir, 'wiki.json');
  let cache: Record<string, CacheEntry> = {};
  try {
    if (existsSync(file)) cache = JSON.parse(readFileSync(file, 'utf8')) as Record<string, CacheEntry>;
  } catch {
    cache = {};
  }
  const now = Date.now();
  const key = (lang: string, title: string) => `${lang}|${title}`;
  const status = new Map<string, Status>();
  const want = new Map<string, Set<string>>();
  let cached = 0;
  for (const r of refs) {
    const k = key(r.lang, r.title);
    const c = cache[k];
    if (c && now - c.t < KEEP_DAYS * DAY) {
      status.set(k, c.s);
      cached++;
    } else (want.get(r.lang) ?? want.set(r.lang, new Set()).get(r.lang)!).add(r.title);
  }
  const errors: string[] = [];
  let asked = 0;
  for (const [lang, set] of want) {
    const titles = [...set];
    for (let i = 0; i < titles.length; i += BATCH) {
      const part = titles.slice(i, i + BATCH);
      const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1&prop=pageprops&ppprop=disambiguation&titles=${encodeURIComponent(part.join('|'))}`;
      try {
        // 위키백과는 잦은 요청을 막는다('too many requests' 글이나 429) — 요청 사이 0.5초 쉬고, 막히면 10초 뒤 한 번 더
        let text = '';
        for (let tryNo = 0; tryNo < 2; tryNo++) {
          if (asked + tryNo > 0) await new Promise((r) => setTimeout(r, tryNo ? 10_000 : 500));
          const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20_000) });
          text = await res.text();
          if (res.ok && text.startsWith('{')) break;
          if (tryNo) throw new Error(res.ok ? text.slice(0, 60) : `HTTP ${res.status}`);
        }
        const j = JSON.parse(text) as {
          query?: { normalized?: { from: string; to: string }[]; redirects?: { from: string; to: string }[]; pages?: { title: string; missing?: boolean; invalid?: boolean; pageprops?: { disambiguation?: string } }[] };
        };
        asked++;
        const q = j.query ?? {};
        const norm = new Map((q.normalized ?? []).map((x) => [x.from, x.to]));
        const redir = new Map((q.redirects ?? []).map((x) => [x.from, x.to]));
        const page = new Map((q.pages ?? []).map((p) => [p.title, p]));
        for (const t of part) {
          let cur = norm.get(t) ?? t;
          cur = redir.get(cur) ?? cur;
          const p = page.get(cur);
          const s: Status = !p ? 'invalid' : p.invalid ? 'invalid' : p.missing ? 'missing' : p.pageprops?.disambiguation !== undefined ? 'disambig' : 'ok';
          status.set(key(lang, t), s);
          cache[key(lang, t)] = { s, t: now };
        }
      } catch (e) {
        errors.push(`${lang}.wikipedia.org: ${(e as Error).message}`);
        break;
      }
    }
  }
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(file, JSON.stringify(cache));
  return { status, errors, asked, cached };
}

export const WIKI_LABEL: Record<Exclude<Status, 'ok'>, string> = {
  missing: '그 제목의 문서가 없음(404)',
  disambig: '동음이의 문서(여러 뜻을 모은 목록) — 뜻에 맞는 문서 제목으로',
  invalid: '제목으로 읽을 수 없음',
};
