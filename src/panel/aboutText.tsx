import type { ReactNode } from 'react';

// 나라 설명 글 도우미: 문장 나누기, 글 속 해 굵게, 문장 목록 (EntityTabs가 씀)

/** 문장이 이만큼 넘으면 펼친 설명을 문장별 목록으로 보인다(한두 문장은 그냥 문단) */
export const ABOUT_LIST_MIN = 3;

/** 괄호·낫표 밖의 '. '에서 문장으로 나눈다(괄호 안의 마침표에서는 자르지 않음) */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(' || c === '「' || c === '『') depth++;
    else if ((c === ')' || c === '」' || c === '』') && depth > 0) depth--;
    else if (c === '.' && depth === 0 && (i + 1 === text.length || text[i + 1] === ' ')) {
      sentences.push(text.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  const tail = text.slice(start).trim();
  if (tail) sentences.push(tail);
  return sentences;
}

/** 글 속 해(1453, 1801~1803, 기원전 108년, 57년 …)를 굵게. '6·25'·'2천여 리'·'16주' 같은 수는 두지 않는다 */
const YEAR_RE = /(?:기원전 )?(?:\d{3,4}|\d{1,2}(?=년))(?:년)?(?:~(?:\d{1,4})?(?:년)?)?/g;
export function withYears(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(YEAR_RE)) {
    const at = m.index;
    // 더 긴 수의 한가운데는 건너뜀
    if (at > 0 && /\d/.test(text[at - 1])) continue;
    if (at > last) out.push(text.slice(last, at));
    out.push(<b key={at} className="about-year">{m[0]}</b>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** 문장들을 문단(짧을 때) 또는 문장별 목록(길 때)으로 보인다 */
export function Sentences({ sentences, className, list }: { sentences: string[]; className: string; list: boolean }) {
  if (!list) return <p className={className}>{withYears(sentences.join(' '))}</p>;
  return (
    <ul className={`${className} about-sentences`}>
      {sentences.map((s, i) => (
        <li key={i}>{withYears(s)}</li>
      ))}
    </ul>
  );
}
