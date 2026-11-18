// 사건 해 칸 검사(ev:check ⑦, 2026-11-18 개선 ⑤): 사건의 해 칸(year·endYear)·id 끝 해·제목 끝 괄호의 '기원전 N년'이 천문 연도 규칙(기원전 N년 = 1−N, 기원전 1년 = 0)대로
// 서로 맞는지 본다. 사건 yaml(ev:check ⑦)과 지시문의 고정 제목 표(ev:check --table <md>) 둘 다에 쓴다. 사건 데이터·지시문은 고치지 않는다(읽기만).
// 왜: 오세아니아 사건 1묶음에서 지시문의 고정 제목 표가 '기원전 1300'을 −1300으로 옮겨(`lapita-1600bc` 등 셋의 endYear) 초안이 그대로 따랐다.
//   test:geo years는 제목의 기원전 해와 year만 보고 endYear는 보지 않으며(제목 괄호가 하위 사건 해인 일이 많아서), id 끝 해는 [year, endYear] 안이면 넘어간다 — 그 빈틈을 메운다.
// 규칙
//   사건 yaml(제목 괄호가 사건 기간일 때만 견줌 — 괄호 시작이 year와 같아야 기간으로 봄):
//     (가) 제목 끝 괄호가 범위 'A~B'이고 A = year인데 B ≠ endYear이며 차이가 1이고 기원전 쪽(B ≤ 0 또는 endYear ≤ 0) → 항목.
//         서기 쪽 1 차이(`(286~296)` ↔ 297)나 먼 차이는 사건이 제목의 마지막 해 뒤까지 이어지는 정상 사례가 많아 보지 않는다.
//     (나) id 끝 `-NNNbc`의 천문 연도 1−NNN이 year와 1 다름 → 항목(안내서 규칙 'id 끝 N = 1−year'). 더 먼 차이는 test:geo years(id 끝 해가 기간 밖)가 본다.
//   고정 제목 표(마크다운 표 줄 — `id` 칸·'시작~끝' 천문 연도 칸·끝 괄호에 해가 든 제목 칸이 있는 줄):
//     표는 기간을 직접 적으므로 더 엄하게 — 제목 괄호가 범위면 그 시작 ≠ 기간 시작, 끝 ≠ 기간 끝, 그리고 id 끝 `-NNNbc` ≠ 기간 시작이면 항목(차이가 얼마든).
//     제목 괄호가 해 하나면: 기간도 한 해면 같아야 하고, 기간이 범위면 괄호가 하위 사건 해('퍼스 조약(1266)')일 수 있어 기원전 쪽 한 해 차이만 항목.
//     기간 칸 끝이 null(이어짐)이면 끝은 보지 않는다. 기간 칸은 id 칸 뒤의 '시작~끝' 칸(앞의 갈래 번호 칸은 건너뜀).
//     예전 사건 단계 표(am-ev1~3·ssa-ev1~2·oc-ev1 COMMON)로 잰 것: oc-ev1의 셋(lapita-1600bc·lapita-southwest-1300bc·polynesia-800bc)만 항목, 나머지 표 0.
// 괄호 꼴: '(기원전 1600~기원전 1300)', '(기원전 674~667)'(뒤 숫자도 기원전), '(기원전 300~기원후 500)', '(1914~1918)', '(1788)', 끝에 '년'이 붙어도 됨.
//   해가 아닌 괄호('(민정 문서)')·여러 해 나열('(기원전 49~45)와 암살(44)' 같은 끝 아닌 괄호)은 보지 않는다.
// 잰 값(2026-11-18 저장소 사건 3,419개): 제목 끝 괄호가 해로 읽히는 사건 1,919개 — (가) 4건(assyria-egypt-674bc·nebuchadnezzar-exile-605bc·arsaces-parni-247bc·
//   darius-gandhara-518bc), (나) 6건(tarim-khotan-oasis-states-223bc 등). 개선 ⑤는 목록만 남겼고, 개선 ⑥(2026-11-18)에서 (가) 4건은 endYear를 제목대로 고치고
//   (나) 6건은 값이 사실대로 맞아(id 끝만 어긋남) 아래 ID_YEAR_OK 예외로 올림 — 새 사건은 id 끝을 1−year로 맞추고 이 목록에 더하지 않는다.
//   요약 첫 문장의 해는 넣지 않았다: year와 1 다른 것이 기원전 13·서기 162건인데 거의 다 앞선 배경 해('기원전 686년 … 이듬해')라 잡음이 크다.
// 한계: 제목 괄호가 사건 기간이 아니라 하위 사건 해인데 그 시작이 우연히 year와 같으면 (가)가 틀린 경보를 낼 수 있다. 본문 속 날짜·기간 말('천 년 동안')은 보지 않는다(사실 대조 몫).

export interface Span {
  a: number;
  b: number | null;
  raw: string;
}

const NUM = String.raw`(\d{1,4})\s*년?`;
const ERA = String.raw`(기원전|기원후|서기)?\s*`;
const SPAN_RE = new RegExp(String.raw`^\s*${ERA}${NUM}(?:\s*[~∼–-]\s*${ERA}${NUM})?\s*$`);

/** 제목 끝 괄호의 해를 천문 연도로. 해 괄호가 아니면 null. 뒤 숫자에 시대 말이 없으면 앞 숫자의 시대를 따른다 */
export function titleSpan(title: string): Span | null {
  const m = title.match(/\(([^()]*)\)\s*$/);
  if (!m) return null;
  const r = m[1].match(SPAN_RE);
  if (!r) return null;
  const bcA = r[1] === '기원전';
  const a = bcA ? 1 - Number(r[2]) : Number(r[2]);
  if (r[4] === undefined) return { a, b: null, raw: m[1] };
  const bcB = r[3] ? r[3] === '기원전' : bcA;
  return { a, b: bcB ? 1 - Number(r[4]) : Number(r[4]), raw: m[1] };
}

/** id 끝 `-NNNbc`의 천문 연도(1−NNN). 없으면 null */
export function idBcYear(id: string): number | null {
  const m = /-(\d{1,4})bc$/.exec(id);
  return m ? 1 - Number(m[1]) : null;
}

/** 천문 연도를 사람 글로: −1299 → '기원전 1300년(천문 −1299)' */
export const fmtAstro = (n: number) => (n <= 0 ? `기원전 ${1 - n}년(천문 ${n})` : `${n}년`);

/** (나) 예외: id 끝 해만 한 해 어긋나고 year·endYear·제목은 사실대로 맞는 예전 사건(id는 화면·전쟁·링크가 참조해 바꾸지 않음). 2026-11-18 개선 ⑥에서 건마다 확인 */
export const ID_YEAR_OK: Record<string, string> = {
  'tarim-khotan-oasis-states-223bc': "year −223 = 본문 '호탄의 시작 … 기원전 224년이라는 기록'",
  'yuezhi-westward-175bc': '제목(기원전 176~126 무렵)·묵돌 선우 편지(기원전 176) = year −175',
  'greco-bactria-end-170bc': '제목(기원전 171~129 무렵)·에우크라티데스 1세 집권(기원전 171) = year −170',
  'qin-qi-221bc': '제목(기원전 222~221) — 연의 요동·대 평정(기원전 222)부터 = year −221',
  'syracuse-siege-213bc': '제목(기원전 214~212)·마르켈루스 포위 시작(기원전 214) = year −213',
  'carrhae-han-53bc': '원정 시작(기원전 54, 크라수스 시리아 부임)~카레 전투(기원전 53) = year −53·endYear −52',
};

/** 사건 yaml 하나: 항목 글 목록(없으면 빈 배열) */
export function checkEventYears(e: { id: string; year: number; endYear: number | null; title: string }): string[] {
  const out: string[] = [];
  const sp = titleSpan(e.title);
  if (sp && sp.b !== null && sp.a === e.year && e.endYear !== null && sp.b !== e.endYear && Math.abs(sp.b - e.endYear) === 1 && (sp.b <= 0 || e.endYear <= 0))
    out.push(`제목 끝 '${sp.raw}'의 끝은 ${fmtAstro(sp.b)}인데 endYear ${e.endYear}(${fmtAstro(e.endYear)}) — 천문 연도 실수 의심(기원전 N년 = 1−N). endYear를 ${sp.b}(으)로 하거나 제목을 고침`);
  const idY = idBcYear(e.id);
  if (idY !== null && idY !== e.year && Math.abs(idY - e.year) === 1 && !(e.id in ID_YEAR_OK))
    out.push(`id 끝 '${e.id.match(/\d+bc$/)![0]}'은 천문 ${idY}인데 year ${e.year}(${fmtAstro(e.year)}) — 천문 연도 실수 의심(id 끝 N = 1−year)`);
  return out;
}

export interface TableRow {
  file: string;
  line: number;
  id: string;
  from: number;
  to: number | null;
  title: string;
}

/** 마크다운 표에서 고정 제목 줄을 뽑는다: `id`(백틱) 칸, '시작~끝'(천문 연도, 끝은 null 가능) 칸, 끝 괄호에 해가 든 제목 칸이 모두 있는 줄 */
export function tableRows(file: string, text: string): TableRow[] {
  const rows: TableRow[] = [];
  text.split(/\r?\n/).forEach((l, i) => {
    if (!/^\s*\|/.test(l)) return;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    let id: string | null = null;
    let from: number | null = null;
    let to: number | null = null;
    let title: string | null = null;
    for (const c of cells) {
      const im = c.match(/^[★☆*\s]*`([a-z0-9][a-z0-9-]*)`/);
      if (im && id === null) {
        id = im[1];
        continue;
      }
      const pm = c.match(/^(-?\d{1,7})(?:\s*~\s*(-?\d{1,7}|null))?$/);
      if (pm && from === null && id !== null) {
        // 기간 칸은 id 칸 뒤에서만(앞의 '| 08 |' 같은 갈래 번호를 기간으로 읽지 않게)
        from = Number(pm[1]);
        to = pm[2] === undefined ? from : pm[2] === 'null' ? null : Number(pm[2]);
        continue;
      }
      if (title === null && titleSpan(c)) title = c;
    }
    if (id !== null && from !== null && title !== null) rows.push({ file, line: i + 1, id, from, to, title });
  });
  return rows;
}

/** 고정 제목 표 한 줄: 항목 글 목록 */
export function checkTableRow(r: TableRow): string[] {
  const out: string[] = [];
  const sp = titleSpan(r.title)!;
  const hint = (want: number, got: number) => (Math.abs(want - got) === 1 && (want <= 0 || got <= 0) ? ' — 천문 연도 실수 의심(기원전 N년 = 1−N)' : '');
  const bcOff1 = (x: number, y: number) => Math.abs(x - y) === 1 && (x <= 0 || y <= 0);
  // 제목 괄호가 해 하나인데 기간이 범위면 괄호가 하위 사건 해(조약 해 등)일 수 있어 기원전 쪽 한 해 차이만 본다
  const loose = sp.b === null && r.to !== r.from;
  if (sp.a !== r.from && (!loose || bcOff1(sp.a, r.from))) out.push(`제목 '${sp.raw}'의 시작은 ${fmtAstro(sp.a)}인데 기간 칸 시작 ${r.from}${hint(sp.a, r.from)}`);
  if (sp.b !== null && r.to !== null && sp.b !== r.to) out.push(`제목 '${sp.raw}'의 끝은 ${fmtAstro(sp.b)}인데 기간 칸 끝 ${r.to}${hint(sp.b, r.to)}`);
  const idY = idBcYear(r.id);
  if (idY !== null && idY !== r.from) out.push(`id 끝 '${r.id.match(/\d+bc$/)![0]}'은 천문 ${idY}인데 기간 칸 시작 ${r.from}${hint(idY, r.from)}`);
  return out;
}
