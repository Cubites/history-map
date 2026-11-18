// 사건 되풀이·해 어긋남 검사 — `npm run ev:check -- --dup`가 부른다(scripts/ev-check.ts). 사건 데이터는 읽기만.
// 사건 묶음 대조에서 [되풀이]가 동남아부터 묶음마다 5건을 넘었는데(아메리카 3묶음 35건), 예전 묶음 도구 dup.mjs는 폴더 하나의 같은 문장만 봐서 0건으로 지나갔다.
// 그래서 (가) 같은 문장 (나) 말을 바꾼 같은 사실 후보 (다) 같은 사람의 재위 해 어긋남 후보를, 고른 사건과 저장소 정본·다른 갈래 초안(--with) 전부를 견주어 낸다.
// 규칙과 기준(2026-11-18, 사건 3,306개와 고치기 전 초안 백업 열두 파일·그 사실 대조의 [되풀이] 지적 65건으로 맞춤 — 기록은 인계 폴더 improve-2026-11-18/NOTES.md ② 절)
//   (가) same: 띄어쓰기·문장부호를 뗀 문장이 SAME_MIN자 이상으로 같음(한 사건 안·두 사건 사이). 「제목」 가리킴은 떼고 본다. 오탐이 거의 없어 항목(종료 1)으로 센다.
//   (나) fact: 문장을 낱말(조사 뗌)·숫자(단위와 함께 '1763년'·'70제곱킬로미터', 날짜는 '#1961-1-3'으로도)·이어진 두 낱말 구절('돌아오는 길')로 나눠 견준다.
//       두 사건 사이: 저장소에서 드문(그 말이 든 사건이 RARE_DF개 이하) 말의 증거 수(evidence — 드문 낱말이 하나는 있어야 함)가 숫자를 함께 가지면 FACT_RARE_NUM+1, 아니면
//       FACT_RARE 이상이고, 함께 가진 낱말의 무게(idf) 합이 짧은 쪽 문장 무게의 FACT_SCORE 이상. 한쪽 문장이 다른 사건을 「제목」으로 가리키면 뺀다(권하는 꼴).
//       한 사건 안: 그 사건에서 두 문장에만 나오는(주제어는 여러 문장에 나와 빠짐) 말로 IN_MIN·IN_SCORE. 경고(종료 코드에 넣지 않음).
//       잰 값: 고치기 전 초안 253개에서 대조 [되풀이] 지적 65건 가운데 그 사건에 후보가 난 것 41, 짝(같은 상대 사건·사건 안)까지 맞은 것 27, 후보는 사건당 약 0.57개.
//       정본 전체(--all)는 2,123건(사건당 0.64) — 표본을 읽으면 셋에 하나꼴이 실제 같은 사실·구절 되풀이, 나머지는 같은 일을 다른 쪽에서 쓴 정상 문장이다.
//   (다) reign: '이름(재위 A~B)' 꼴이 같은 이름으로 두 곳(사건·나라 항목 글)에 있는데 해가 다르고, 두 범위가 겹치며 시작·끝 차이가 모두 REIGN_NEAR년 안(다른 사람이 같은
//       이름이면 해가 멀고, 붙어 이어진 재위는 겹치지 않음). 칭호 낱말(샤·칸·왕 …)은 앞 낱말과 함께 이름으로 본다. 기원전 표시가 없으면 사건 해에 가까운 쪽으로 읽는다. 경고.
// 한계: (나)는 낱말이 거의 다 바뀐 되풀이와 숫자 없이 한두 낱말만 같은 되풀이를 놓친다. (다)는 두 곳이 같은 틀린 값을 쓰면 못 잡는다(아메리카 3묶음 네사우알코요틀 1429는
//   두 사건이 같은 값). 거주 해('N년 무렵부터 사람이 살았다')·조약 날짜(예비·본 조약)·나이는 보지 않는다.

/** (가) 같은 문장으로 볼 최소 글자 수(띄어쓰기·문장부호 뗀 꼴). 예전 묶음 도구 dup.mjs와 같은 15자(정본에서 같은 문장 18자 '원은 이곳에서 말을 기르는 목장을 운영했다.'가 있어 20자는 놓침) */
export const SAME_MIN = 15;
/** (나) 드문 낱말: 그 낱말이 든 사건 수가 이 값 이하 */
export const RARE_DF = 25;
/** (나) 함께 가진 낱말 무게 / 짧은 쪽 문장 무게 */
export const FACT_SCORE = 0.42;
/** (나) 드문 숫자(날짜 등)를 함께 가질 때 필요한 증거 수 − 1 */
export const FACT_RARE_NUM = 2;
/** (나) 드문 숫자 없이 필요한 증거 수 */
export const FACT_RARE = 4;
/** (나) 한 사건 안: 그 사건에서 두 문장에만 나오고 저장소에서 이 수 이하 사건에 든 낱말 */
export const IN_DF = 150;
/** (나) 한 사건 안: 그런 낱말의 증거 수(낱말·숫자·구절 — evidence) */
export const IN_MIN = 2;
/** (나) 한 사건 안: 그 낱말 무게 / 짧은 쪽 문장 무게 */
export const IN_SCORE = 0.2;
/** (다) 같은 사람으로 볼 시작·끝 해 차이 */
export const REIGN_NEAR = 15;

export interface DupDoc {
  /** 사건 id 또는 '나라 <항목 id>' */
  id: string;
  /** 사건 해(기원전 표시 없는 재위 해를 읽을 때 씀) */
  year: number;
  text: string;
  /** 사건 제목(「제목」 가리킴을 알아보는 데 씀) */
  title?: string;
  /** 사건이면 true(나라 항목 글은 (다)에서만 견줌) */
  event: boolean;
}

export interface DupHit {
  kind: 'same' | 'fact' | 'reign';
  id: string;
  other: string;
  score: number;
  msg: string;
}

/** src/panel/aboutText.tsx의 splitSentences와 같은 규칙(그 파일은 JSX라 node로 불러올 수 없어 옮김): 괄호·낫표 밖의 '. '에서 자름 */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '「' || c === '『') depth++;
    else if ((c === ')' || c === '」' || c === '』') && depth > 0) depth--;
    else if (c === '.' && depth === 0 && (i + 1 === text.length || text[i + 1] === ' ')) {
      out.push(text.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

/** 「제목」(앞의 사건) 가리킴 — 떼고 본다 */
const REF = /「[^」]*」(?:\((?:앞의|뒤의|같은 시기의|같은 해의) 사건\))?/g;

const JOSA = ['에서부터', '으로부터', '에서는', '에서도', '으로는', '으로도', '에게서', '까지는', '부터는', '이라는', '이라고', '이었다', '였다', '이다', '에서', '에게', '으로', '까지', '부터', '처럼', '보다',
  '마다', '이나', '이며', '이고', '라는', '라고', '와는', '과는', '에는', '에도', '에의', '와의', '과의', '로는', '로도', '은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '로', '만', '나'];
function stem(w: string): string {
  for (const j of JOSA) if (w.length - j.length >= 2 && w.endsWith(j)) return w.slice(0, -j.length);
  return w;
}

const DATE = /(기원전 ?)?(\d{1,4})년 (\d{1,2})월(?: (\d{1,2})일)?/g;
const NUM = /(기원전 ?)?(\d[\d,.]*\d|\d)(?: ?(만|천|억))?(?: ?([가-힣]+|km²|km|m|%))?/g;

interface Sent {
  doc: number;
  idx: number;
  text: string;
  norm: string;
  toks: Set<string>;
}

/** 문장 → 낱말 모음. 숫자는 '#'로 시작(단위 붙임), 낱말은 조사 뗌, 로마자는 소문자 */
function tokens(sen: string): Set<string> {
  const out = new Set<string>();
  // 날짜는 '#해-달(-날)'로도 넣는다(해만 같은 것보다 훨씬 드묾)
  for (const m of sen.replace(REF, ' ').matchAll(DATE)) {
    const y = `${m[1] ? '기원전' : ''}${m[2]}`;
    out.add(`#${y}-${m[3]}`);
    if (m[4]) out.add(`#${y}-${m[3]}-${m[4]}`);
  }
  const t = sen.replace(REF, ' ');
  const rest = t.replace(NUM, (_m, bc: string | undefined, d: string, big: string | undefined, unit: string | undefined) => {
    const u = unit ? unit.replace(/(?:에서|에게|으로|부터|까지|에는|에도|의|에|은|는|이|가|을|를|과|와|도|로|만)$/, '').slice(0, 6) : '';
    out.add(`#${bc ? '기원전' : ''}${d.replace(/,/g, '')}${big ?? ''}${u}`);
    return ' ';
  });
  // 낱말과, 문장부호 없이 이어진 두 낱말(구절 '돌아오는 길'·'흙 둔덕' — 되풀이는 구절째 되풀이되는 일이 많음)
  for (const part of rest.split(/[,()「」『』·:;"“”'‘’]/)) {
    let prev = '';
    for (const m of part.matchAll(/[가-힣]+|[A-Za-zÀ-ɏḀ-ỿ][A-Za-zÀ-ɏḀ-ỿ'’-]{2,}/g)) {
      const w = /[가-힣]/.test(m[0]) ? stem(m[0]) : m[0].toLowerCase();
      if (w.length < 2) {
        prev = '';
        continue;
      }
      out.add(w);
      if (prev) out.add(`~${prev} ${w}`);
      prev = w;
    }
  }
  return out;
}

const normSame = (sen: string) => sen.replace(REF, '').replace(/[\s.,·:;!?"'“”‘’()「」『』\-~]/g, '');

const short = (x: string, n = 48) => (x.length > n ? `${x.slice(0, n)}…` : x);

// ── (다) 재위 ─────────────────────────────────────────────
const REIGN = /((?:[가-힣]+ ){0,3}[가-힣]+(?: \d+세)?)\((?:[^()]*?, )?재위 (기원전 )?(\d{1,4})(?:년)?( 무렵)?~(기원전 )?(\d{1,4})(?:년)?( 무렵)?\)/g;
/** 이름 끝에 오는 칭호 — 앞 낱말과 함께 이름으로 */
const TITLE = new Set(['칸', '샤', '왕', '대왕', '황제', '술탄', '비', '싱', '라야', '세나', '베이', '파샤', '에미르', '아미르', '공', '제', '후', '태자', '왕자', '여왕', '군주', '카간', '칼리프', '이맘', '데바', '바르만']);

interface Reign {
  doc: number;
  key: string;
  a: number;
  b: number;
  at: string;
}

function reigns(docs: DupDoc[]): Reign[] {
  const out: Reign[] = [];
  docs.forEach((d, doc) => {
    for (const m of d.text.matchAll(REIGN)) {
      const words = m[1].split(' ');
      const k = [words.pop()!];
      if (/^\d+세$/.test(k[0]) && words.length) k.unshift(words.pop()!);
      // 칭호·한 글자·아랍어 관사로 시작하는 뒷이름('바하 앗다울라'의 '앗다울라')은 앞 낱말과 함께
      if ((TITLE.has(k[0]) || k[0].length < 2 || /^(?:앗|알|안|아드|아르|아즈|아스|웃|엘)/.test(k[0])) && words.length) k.unshift(words.pop()!);
      const key = k.join(' ');
      // '올랐고(재위 …)'처럼 이름이 아닌 말, 칭호만 남은 것은 뺌
      if (/(?:다|고|며|서|면|니)$/.test(k[k.length - 1]) || TITLE.has(key) || key.length < 2) continue;
      let a = Number(m[3]);
      let b = Number(m[6]);
      if (m[2]) {
        a = -a;
        b = -b; // '기원전 685~643'은 둘 다 기원전
      } else if (m[5]) b = -b;
      else if (d.year <= 0 && Math.abs(-a - d.year) < Math.abs(a - d.year)) {
        a = -a;
        b = -b;
      }
      out.push({ doc, key, a, b, at: m[0] });
    }
  });
  return out;
}

const yr = (y: number) => (y < 0 ? `기원전 ${-y}` : String(y));

/**
 * picked: 검사할 사건 id. docs: 견줄 전부(사건 + 나라 항목 글). 사건 쌍마다 가장 높은 문장 쌍 하나만 낸다.
 * 같은 사건 안 두 문장도 본다(id === other).
 */
export function findDup(picked: Set<string>, docs: DupDoc[]): DupHit[] {
  const hits: DupHit[] = [];
  const evDocs = docs.map((d, i) => ({ d, i })).filter((x) => x.d.event);
  const sents: Sent[] = [];
  for (const { d, i } of evDocs) splitSentences(d.text).forEach((text, idx) => sents.push({ doc: i, idx, text, norm: normSame(text), toks: tokens(text) }));
  const isPicked = (s: Sent) => picked.has(docs[s.doc].id);

  // (가) 같은 문장
  const bySame = new Map<string, Sent[]>();
  for (const s of sents) if (s.norm.length >= SAME_MIN) bySame.set(s.norm, [...(bySame.get(s.norm) ?? []), s]);
  for (const xs of bySame.values()) {
    if (xs.length < 2 || !xs.some(isPicked)) continue;
    const a = xs.find(isPicked)!;
    for (const b of xs) {
      if (b === a) continue;
      hits.push({ kind: 'same', id: docs[a.doc].id, other: docs[b.doc].id, score: 1, msg: `같은 문장${a.doc === b.doc ? '(사건 안)' : ''}: "${short(a.text, 60)}"` });
    }
  }

  // (나) 같은 사실 후보 — 드문 낱말 색인으로 짝을 좁힌다
  const df = new Map<string, number>();
  const docToks = new Map<number, Set<string>>();
  for (const s of sents) {
    const set = docToks.get(s.doc) ?? new Set<string>();
    for (const t of s.toks) set.add(t);
    docToks.set(s.doc, set);
  }
  for (const set of docToks.values()) for (const t of set) df.set(t, (df.get(t) ?? 0) + 1);
  const N = Math.max(1, docToks.size);
  const idf = (t: string) => Math.log(N / (df.get(t) ?? 1));
  /** 문장 무게 — 낱말만(구절 '~'은 증거 수에만 셈) */
  const weight = (set: Set<string>) => [...set].reduce((n, t) => (t.startsWith('~') ? n : n + idf(t)), 0);
  /** 증거 수: 드문 낱말 + 드문 숫자 + 그 낱말 밖의 말을 더하는 드문 구절(둘까지). 드문 낱말이 하나도 없으면 0 */
  const evidence = (xs: string[]) => {
    const uni = xs.filter((x) => !x.startsWith('#') && !x.startsWith('~'));
    if (!uni.length) return 0;
    const set = new Set(uni);
    const bi = xs.filter((x) => x.startsWith('~') && x.slice(1).split(' ').some((w) => !set.has(w)));
    return uni.length + xs.filter((x) => x.startsWith('#')).length + Math.min(2, bi.length);
  };
  const gain = (xs: string[]) => xs.reduce((n, t) => (t.startsWith('~') ? n : n + idf(t)), 0);
  const rare = (t: string) => (df.get(t) ?? 0) <= RARE_DF;
  const index = new Map<string, number[]>();
  sents.forEach((s, si) => {
    for (const t of s.toks) if (rare(t)) index.set(t, [...(index.get(t) ?? []), si]);
  });
  const best = new Map<string, DupHit>();
  const keep = (s: Sent, t: Sent, score: number, words: string[]) => {
    const a = docs[s.doc].id;
    const b = docs[t.doc].id;
    const ek = a <= b ? `${a} ${b}` : `${b} ${a}`;
    const prev = best.get(ek);
    if (prev && prev.score >= score) return;
    const w = words.filter((x) => !x.startsWith('#') && !x.startsWith('~')).slice(0, 5).join('·');
    const n = words.filter((x) => x.startsWith('#')).slice(0, 3).map((x) => x.slice(1)).join('·');
    best.set(ek, {
      kind: 'fact',
      id: a,
      other: b,
      score,
      msg: `같은 사실 후보${a === b ? '(사건 안)' : ''} ${score.toFixed(2)} — 함께 ${w}${n ? ` · 숫자 ${n}` : ''}: "${short(s.text)}" ↔ "${short(t.text)}"`,
    });
  };
  const plainTitle = (x: string) => x.replace(/\s*\([^()]*\)$/, '');
  const cites = (s: Sent, doc: number) => {
    const t = docs[doc].title;
    if (!t) return false;
    for (const m of s.text.matchAll(/「([^」]+)」/g)) if (m[1] === t || m[1] === plainTitle(t)) return true;
    return false;
  };
  // 두 사건 사이: 저장소 전체에서 드문 낱말
  const seen = new Set<string>();
  sents.forEach((s, si) => {
    if (!isPicked(s)) return;
    const cnt = new Map<number, number>();
    for (const t of s.toks) if (rare(t)) for (const sj of index.get(t) ?? []) if (sents[sj].doc !== s.doc) cnt.set(sj, (cnt.get(sj) ?? 0) + 1);
    const ws = weight(s.toks);
    for (const [sj, c] of cnt) {
      if (c < FACT_RARE_NUM) continue;
      const pk = si < sj ? `${si} ${sj}` : `${sj} ${si}`;
      if (seen.has(pk)) continue;
      seen.add(pk);
      const t = sents[sj];
      if (s.norm === t.norm && s.norm.length >= SAME_MIN) continue; // (가)가 냄
      if (cites(s, t.doc) || cites(t, s.doc)) continue; // 「제목」으로 가리키며 한 구절로 줄인 것은 권하는 꼴
      const shared = [...s.toks].filter((x) => t.toks.has(x));
      const rs = shared.filter(rare);
      const ev = evidence(rs);
      if (ev < (rs.some((x) => x.startsWith('#')) ? FACT_RARE_NUM + 1 : FACT_RARE)) continue;
      const score = gain(shared) / Math.max(1e-9, Math.min(ws, weight(t.toks)));
      if (score < FACT_SCORE) continue;
      keep(s, t, score, rs);
    }
  });
  // 한 사건 안: 그 사건에서 이 두 문장에만 나오는 낱말(사건의 주제어는 여러 문장에 나와 빠짐) 가운데 저장소에서 IN_DF개 사건 이하에 든 것
  const byDoc = new Map<number, Sent[]>();
  for (const s of sents) if (isPicked(s)) byDoc.set(s.doc, [...(byDoc.get(s.doc) ?? []), s]);
  for (const xs of byDoc.values()) {
    const local = new Map<string, number>();
    for (const s of xs) for (const t of s.toks) local.set(t, (local.get(t) ?? 0) + 1);
    for (let i = 0; i < xs.length; i++)
      for (let j = i + 1; j < xs.length; j++) {
        const s = xs[i];
        const t = xs[j];
        if (s.norm === t.norm && s.norm.length >= SAME_MIN) continue;
        const L = [...s.toks].filter((x) => t.toks.has(x) && local.get(x) === 2 && (df.get(x) ?? 0) <= IN_DF);
        if (evidence(L) < IN_MIN) continue;
        const score = gain(L) / Math.max(1e-9, Math.min(weight(s.toks), weight(t.toks)));
        if (score < IN_SCORE) continue;
        keep(s, t, score, L);
      }
  }
  hits.push(...[...best.values()].sort((x, y) => y.score - x.score));

  // (다) 재위 해 어긋남
  const rs = reigns(docs);
  const byKey = new Map<string, Reign[]>();
  for (const r of rs) byKey.set(r.key, [...(byKey.get(r.key) ?? []), r]);
  const rseen = new Set<string>();
  for (const [key, xs] of byKey) {
    for (const x of xs) {
      if (!picked.has(docs[x.doc].id)) continue;
      for (const y of xs) {
        if (x === y || (x.a === y.a && x.b === y.b)) continue;
        if (Math.abs(x.a - y.a) > REIGN_NEAR || Math.abs(x.b - y.b) > REIGN_NEAR) continue;
        if (Math.min(x.b, y.b) <= Math.max(x.a, y.a)) continue; // 겹치지 않음(붙어 이어진 재위)
        const pk = [docs[x.doc].id, docs[y.doc].id, `${x.a}~${x.b}`, `${y.a}~${y.b}`].sort().join(' ');
        if (rseen.has(pk)) continue;
        rseen.add(pk);
        hits.push({ kind: 'reign', id: docs[x.doc].id, other: docs[y.doc].id, score: 0, msg: `재위 해 어긋남 후보 '${key}': ${yr(x.a)}~${yr(x.b)} ↔ ${docs[y.doc].id}의 ${yr(y.a)}~${yr(y.b)} — 그 사람 문서·군주 목록으로 맞춤` });
      }
    }
  }
  return hits;
}
