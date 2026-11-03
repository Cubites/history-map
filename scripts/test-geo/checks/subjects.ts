// test:geo 검사 `subjects` (사건 주체 이름). 사건 subjects의 나라 이름이 그 사건 제목·본문(title.ko·summary.ko)에 나오는지 본다.
// 사실 대조가 사건 묶음마다 손으로 잡던 '[subjects] 본문에 이름이 없음' 지적(서아시아 사건 9묶음 36건)을 초안 단계에서 기계로 미리 잡으려고 만들었다.
// 규칙의 근거: docs/guides/event.md 3절 예시 '본문에 이름이 나오는 항목만'. subjects id가 있는지·기간이 겹치는지는 check:data가, 성립·소멸 해의 사건은 events가 본다(되풀이하지 않음).
// 사용: npm run test:geo -- --only subjects [--region middle-east] [--years 1500-1600]   (--region은 사건 파일의 권역, --years는 사건 기간과 겹침)
// 도형은 읽지 않아 몇 초에 끝난다. 데이터·사이트 글은 고치지 않는다.
//
// 이름 맞추기 규칙 (틀린 경보를 줄이려고 정함, 저장소에 별칭 칸이 없어 names.ko 하나에서 변형을 만든다)
//  1. 변형 = names.ko 그대로 + 괄호를 뗀 꼴('이탈리아 왕국 (나폴레옹)' → '이탈리아 왕국', '진(晉)' → '진')
//     + 띄어 쓴 마지막 낱말이 나라 꼴 꼬리(TAILS: 왕국·왕조·제국·술탄국·칸국·공화국·'제1공화국'·'26왕조'·'공화국·공국' 등)면 그 꼬리를 뗀 꼴('사산 제국' → '사산', '이집트 26왕조' → '이집트'),
//       남은 끝이 '연합'이면 한 번 더('아라곤 연합 왕국' → '아라곤'), 꼬리 뗀 이름이 여러 낱말이면 세 글자 이상인 마지막 낱말도('예멘 무타와킬 왕국' → '무타와킬')
//     + 가운뎃점 이름은 하나씩('페잔·가다메스' → '페잔') + '… 지구'·'…반도'를 뗀 꼴과 그 마지막 낱말('요르단강 서안 지구' → '서안', '시나이반도' → '시나이')
//     + '…령' 뒤 이름('프랑스령 알제리' → '알제리', '영국 위임 통치령 팔레스타인' → '팔레스타인')
//     + 'A-B'는 'A·B'로도('폴란드-리투아니아 연방' → '폴란드·리투아니아') + 앞 '신'(새)을 뗀 꼴('신아시리아' → '아시리아', 남는 말이 세 글자 이상일 때만)
//     + 띄어 쓰지 않은 괄호 'X(Y)'의 Y를 가운뎃점·쉼표로 나눈 한글 이름('한(전한)' → '전한'). 띄어 쓴 괄호는 '(묶음)'·'(나폴레옹)'처럼 설명이라 그 말만으로는 쓰지 않고
//       꼬리가 있을 때 '괄호 말 + 꼬리'만('후우마이야 칼리프국 (코르도바)' → '코르도바 칼리프국')
//     + 묶음 항목('(묶음)'·'…들')은 첫 낱말을 가운뎃점으로 나눈 이름('그리스 도시국가 (묶음)' → '그리스', '알바니아·제타 영주국들 (묶음)' → '알바니아'·'제타').
//     이 규칙으로 HEAD 660838f의 항목이 괄호 떼기·꼬리 떼기만 할 때의 1,255개에서 954개로 줄었다(줄어든 것은 본문에 꼬리 뗀 이름 등이 있던 틀린 경보).
//     + (2026-11-03 더함) 나라 이름 맞추기 두 가지: '○○ 주'(주)와 '○○인민공화국'(앞부분 '중화')은 꼬리를 뗀 꼴도 맞고('카란 주' → '카란'),
//       본문이 흔히 쓰는 짧은 이름·옛 이름은 항목 id별 표 SHORT_OR_FORMER_NAMES로 맞는다(prc '중국', sri-lanka '실론', bangladesh '동파키스탄'·'동벵골'). 항목 yaml에 별칭·옛 이름 칸이 없어 표를 검사 코드에 둔다.
//       검사 대상·기준(본문에 그 나라가 나오는가)은 그대로이고 이름만 더 넓게 알아본다.
//  2. 두 글자 이상 변형은 제목·본문에서 띄어쓰기를 지운 글의 부분 문자열로 찾는다('동로마제국'·'동로마 제국' 모두 맞음, 조사가 붙어도 맞음).
//     띄어 쓴 변형은 낱말 사이에 '의'가 낀 꼴도 맞는다('메카 샤리프' ↔ '메카의 샤리프').
//  시험(2026-11-02, 서아시아 사건 me-04~08 초안 상태): 사실 대조의 이름 없음 지적 22건 가운데 17건을 잡음. 놓친 5건은 제목에만 이름이 있는 것 2건(이 검사는 제목도 본문으로 봄),
//     꼬리 뗀 이름이 인물·땅 이름과 같은 것 3건('티무르 왕조'의 '티무르', '이집트 술탄국'의 '이집트'). 사실 대조에 없던 항목 17건 중 표본 10건은 맞음 6·틀린 경보 4.
//  3. 한 글자 변형(원·송·당·진 등)은 앞이 한글이 아니고 뒤가 한글이 아니거나 조사(은·는·이·가·을·를·의·에·와·과·도·로·만·나라·과의·에서)일 때만 맞는다('원래'·'송환'의 글자는 세지 않음).
//  4. 「…」 안(다른 사건 제목을 가리키는 자리)은 세지 않는다. 그 안에만 이름이 있으면 따로 '「」 안에만' 꼴로 낸다(사실 대조가 같은 이유로 지적했음, me-05 fc1 `ilkhanate-abaqa-1265`).
// 열쇠: `subjects <사건 id> <나라 id>` (위치 없이). msg에 나라 이름·찾아본 변형·사건 제목.
// 기준선: data/tests/baseline/subjects.txt — 2026-11-02 HEAD 660838f에 이미 있던 것(고칠지는 운영자가 정함). 새 사건에서 나는 것만 새 실패가 된다.
//   글을 고쳐 줄었으면 `npm run test:geo -- --only subjects --update-baseline subjects`. 맞는 것으로 남길 줄은 data/tests/allow/subjects.yaml에 이유와 함께.
// 한계(틀린 경보 / 놓침):
//  - 본문이 나라를 다른 이름(왕가 이름·도읍 이름·'비잔티움'·'오스만 조정' 같은 말)으로만 부르면 틀린 경보가 난다 → 본문에 항목 이름을 한 번 넣거나 허용 줄.
//  - 짧은 변형이 다른 낱말 안에 들어 있으면 놓친다('로마 공화정'의 '로마'가 '동로마' 안에서 맞음, '오'·'제' 같은 한 글자 이름은 규칙 3으로 막지만 '오는'은 맞을 수 있음).
//  - links 노트·places 이름은 보지 않는다(화면 본문이 아니라서).
// 직접 실행: node scripts/test-geo/checks/subjects.ts [사건 id 앞머리]  → 항목 전부를 출력(보고서 대신 빠르게 보기)
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { REGION_FILTER_OF, regionOfEventFile } from '../../../src/schema/regions.ts';
import { ROOT, createContext } from '../context.ts';
import type { Context } from '../context.ts';
import type { Check, CheckResult, Item, Options } from '../types.ts';

/** 뗄 수 있는 나라 꼴 꼬리(띄어 쓴 마지막 낱말). 'X 왕국'의 X로도 본문에서 흔히 부르는 꼴만. 지역·묶음 설명 꼬리(지역·땅·점령지)는 넣지 않음(떼면 너무 넓음) */
const TAILS = [
  '왕국', '왕조', '제국', '공국', '대공국', '전제공국', '공화국', '공화정', '백국', '후국', '술탄국', '토후국', '칸국', '칼리프국', '베이국', '이맘국', '아미르국', '에미르국',
  '샤리프국', '차르국', '기사단국', '헤트만국', '군주국', '연방', '합중국', '자유국', '자치국', '자유시', '보호령', '정권', '가문', '연맹', '판관국', '영주령', '총독부',
  '공국들', '영주국들', '왕국들', '도시국가들',
  '주', // '카란 주'·'마크란 주'·'라스벨라 주'(2026-11-03)
];

/** 본문이 흔히 쓰는 짧은 이름·옛 이름(항목 id → 이름들). 항목 yaml에 별칭·옛 이름 칸이 없어 여기 둔다(2026-11-03). 실론은 1972년 앞, 동파키스탄은 1947~1971년의 이름 */
const SHORT_OR_FORMER_NAMES: Record<string, string[]> = {
  prc: ['중국'],
  'sri-lanka': ['실론'],
  bangladesh: ['동파키스탄', '동벵골'],
};
const TAIL_RE = new RegExp(`^(?:제?\\d+)?(?:${[...TAILS].sort((a, b) => b.length - a.length).join('|')})$`);
const HANGUL = /[가-힣]/;
/** 한 글자 이름 뒤에 올 수 있는 조사·말 */
const JOSA = /^(?:은|는|이|가|을|를|의|에|와|과|도|로|만|나라|과의|에서)/;

export interface NameVariants {
  /** 두 글자 이상(띄어쓰기는 한 칸으로 맞춘 꼴. 견줄 때 지움) */
  long: string[];
  /** 한 글자 */
  short: string[];
}

/** names.ko 하나에서 맞출 변형 만들기 (규칙 1) */
export function nameVariants(ko: string, id?: string): NameVariants {
  const set = new Set<string>();
  const add = (s: string) => {
    const t = s.trim();
    if (t) set.add(t);
  };
  add(ko);
  const noParen = ko.replace(/\s*\([^)]*\)/g, '').trim();
  add(noParen);
  // 띄어 쓰지 않은 '○○인민공화국'은 앞부분도('중화인민공화국' → '중화')
  const inmin = noParen.match(/^([가-힣]{2,})인민공화국$/);
  if (inmin) add(inmin[1]);
  for (const x of (id !== undefined ? SHORT_OR_FORMER_NAMES[id] : undefined) ?? []) add(x);
  const isTail = (w: string) => w.split('·').every((p) => TAIL_RE.test(p));
  // 꼬리 떼기: 마지막 낱말이 꼬리면 뗀다. 남은 마지막 낱말이 '연합'이면 한 번 더('아라곤 연합 왕국' → '아라곤')
  let words = noParen.split(/\s+/);
  let tail = '';
  if (words.length > 1 && isTail(words[words.length - 1])) {
    tail = words[words.length - 1].split('·')[0];
    words = words.slice(0, -1);
    add(words.join(' '));
    if (words.length > 1 && words[words.length - 1] === '연합') add(words.slice(0, -1).join(' '));
  }
  // 'A-B 연방'은 'A·B'로도 쓴다
  for (const s of [...set]) if (s.includes('-')) add(s.replace(/-/g, '·'));
  // '신아시리아'·'신바빌로니아'처럼 앞 '신'(새)을 뗀 꼴(남는 말이 세 글자 이상일 때만)
  for (const s of [...set]) if (/^신[가-힣]{3,}/.test(s)) add(s.slice(1));
  // 띄어 쓰지 않은 괄호 'X(Y)': Y를 나눈 한글 이름
  for (const m of ko.matchAll(/(?<=\S)\(([^)]*)\)/g)) for (const part of m[1].split(/[,·]/)) if (HANGUL.test(part) && !/[^가-힣\s]/.test(part.trim())) add(part);
  // 띄어 쓴 괄호는 설명이라 그 말만으로는 쓰지 않고, 꼬리가 있을 때 '괄호 말 + 꼬리'만('후우마이야 칼리프국 (코르도바)' → '코르도바 칼리프국')
  if (tail) for (const m of ko.matchAll(/\s\(([^)]*)\)/g)) if (!/[^가-힣\s]/.test(m[1])) add(`${m[1]} ${tail}`);
  // 묶음 항목('그리스 도시국가 (묶음)', '알바니아·제타 영주국들 (묶음)')은 첫 낱말(가운뎃점으로 나눔)로도 부른다
  if (/\((?:영방 )?묶음\)|들$/.test(ko) && words.length > 1) for (const p of words[0].split('·')) if (p.length >= 2) add(p);
  // 꼬리 뗀 이름이 두 낱말 이상이면 마지막 낱말(세 글자 이상만: '예멘 무타와킬' → '무타와킬'. '신성 로마' → '로마'처럼 짧은 것은 너무 넓어 뺌)
  if (tail && words.length > 1 && words[words.length - 1].length >= 3) add(words[words.length - 1]);
  // 가운뎃점으로 이은 이름은 하나씩('히자즈·네지드' → '히자즈'·'네지드', '페잔·가다메스' → '페잔')
  for (const s of [...set]) if (!s.includes(' ') && s.includes('·')) for (const p of s.split('·')) if (p.length >= 2) add(p);
  // '… 지구'·'…반도'는 떼고, 남은 것이 여러 낱말이면 마지막 낱말도('요르단강 서안 지구' → '요르단강 서안'·'서안', '가자 지구' → '가자', '시나이반도' → '시나이')
  for (const s of [...set]) {
    const m = s.match(/^(.+?)(?: 지구|반도)$/);
    if (!m) continue;
    add(m[1]);
    const ws = m[1].split(' ');
    if (ws.length > 1 && ws[ws.length - 1].length >= 2) add(ws[ws.length - 1]);
  }
  // '프랑스령 알제리'·'영국 위임 통치령 팔레스타인'은 '…령' 뒤 이름만으로도 부른다
  const nw = noParen.split(/\s+/);
  const ryeong = nw.findIndex((w) => /령$/.test(w));
  if (ryeong >= 0 && ryeong < nw.length - 1) add(nw.slice(ryeong + 1).join(' '));
  const long: string[] = [];
  const short: string[] = [];
  for (const v of set) {
    const flat = v.replace(/\s+/g, '');
    if (flat.length >= 2) long.push(v.replace(/\s+/g, ' '));
    else if (flat.length === 1) short.push(flat);
  }
  return { long: [...new Set(long)], short: [...new Set(short)] };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** 띄어 쓴 변형('메카 샤리프')은 낱말 사이에 '의'가 들어간 꼴('메카의 샤리프')도 맞는다. 띄어쓰기는 지우고 견준다 */
const longRe = (v: string) => new RegExp(v.split(' ').map(escapeRe).join('(?:의)?'));

/** 「…」 안을 같은 길이의 빈칸으로 바꾼 글(위치를 지키려고 지우지 않음) */
export const blankQuoted = (text: string): string => text.replace(/「[^」]*」/g, (m) => ' '.repeat(m.length));

/** 글에 변형이 나오는가 (규칙 2·3) */
export function mentions(text: string, v: NameVariants): boolean {
  const flat = text.replace(/\s+/g, '');
  if (v.long.some((n) => longRe(n).test(flat))) return true;
  for (const ch of v.short) {
    for (let i = text.indexOf(ch); i >= 0; i = text.indexOf(ch, i + 1)) {
      const before = i > 0 ? text[i - 1] : '';
      const after = text.slice(i + 1);
      if (HANGUL.test(before)) continue;
      if (after === '' || !HANGUL.test(after[0]) || JOSA.test(after)) return true;
    }
  }
  return false;
}

const readList = (file: string): Record<string, unknown>[] => {
  const raw = parseYaml(readFileSync(file, 'utf8')) as unknown;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
};
const ko = (v: unknown): string => {
  const t = (v as { ko?: unknown } | undefined)?.ko;
  return typeof t === 'string' ? t : '';
};

export interface SubjectMiss {
  eventId: string;
  file: string;
  subject: string;
  /** 'none': 제목·본문에 없음, 'quoted': 「」 안에만 */
  kind: 'none' | 'quoted';
  name: string;
  title: string;
}

/** 사건 파일들을 읽어 이름이 없는 subjects를 모은다. 사건 거르기는 keep(사건 파일 이름, year, endYear 또는 year)이 정한다 */
export function findMisses(root: string, names: Map<string, string>, keep: (file: string, year: number, end: number) => boolean): { checked: number; misses: SubjectMiss[] } {
  const dir = path.join(root, 'data/events');
  const misses: SubjectMiss[] = [];
  let checked = 0;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readList(path.join(dir, f))) {
      const year = Number(e.year);
      const end = e.endYear === undefined || e.endYear === null ? year : Number(e.endYear);
      if (!keep(f, year, end)) continue;
      const title = ko(e.title);
      const text = `${title}\n${ko(e.summary)}`;
      const outside = blankQuoted(text);
      for (const sid of ((e.subjects as unknown[] | undefined) ?? []).map(String)) {
        checked++;
        const name = names.get(sid);
        if (name === undefined) continue; // 없는 id는 check:data가 잡는다
        const v = nameVariants(name, sid);
        if (mentions(outside, v)) continue;
        misses.push({ eventId: String(e.id), file: f, subject: sid, kind: mentions(text, v) ? 'quoted' : 'none', name, title });
      }
    }
  }
  return { checked, misses };
}

const variantsLabel = (name: string, id?: string) => {
  const v = nameVariants(name, id);
  return [...v.long, ...v.short].join('/');
};

const subjects: Check = {
  id: 'subjects',
  title: '사건 주체 이름 (subjects 나라 이름이 제목·본문에 있나)',
  async run(ctx: Context, opt: Options): Promise<CheckResult> {
    const names = new Map([...ctx.entities.values()].map((e) => [e.id, e.ko]));
    const { checked, misses } = findMisses(ctx.root, names, (f, year, end) => {
      const region = regionOfEventFile(f);
      if (opt.region !== null && region !== undefined && region !== opt.region && REGION_FILTER_OF[region] !== opt.region) return false;
      return ctx.overlapsYears(year, end + 1);
    });
    const items: Item[] = [];
    const seen = new Set<string>();
    for (const m of misses) {
      const key = `subjects ${m.eventId} ${m.subject}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const how = m.kind === 'quoted' ? '「」(다른 사건 제목) 안에만 있음' : '제목·본문에 없음';
      items.push({ key, msg: `${m.title}(${m.eventId}): subjects '${m.subject}'(${m.name}) ${how} — 찾은 변형 ${variantsLabel(m.name, m.subject)}` });
    }
    const quoted = misses.filter((m) => m.kind === 'quoted').length;
    return { checked, items, notes: quoted ? [`「」 안에만 ${quoted}`] : [] };
  },
};

export const checks: Check[] = [subjects];

// 직접 실행: 항목 전부 출력
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const prefix = process.argv[2] ?? '';
  const opt: Options = { region: null, years: null, only: null, skip: [], ci: false };
  const ctx = createContext(opt, ROOT);
  const r = await subjects.run(ctx, opt);
  const shown = r.items.filter((i) => i.key.startsWith(`subjects ${prefix}`));
  for (const i of shown) console.log(i.msg);
  console.log(`항목 ${shown.length}개 (검사한 subjects ${r.checked})`);
}
