// central-asia 도우미 모듈: 앞 권역 도형 빼기 (C1 뼈대가 modern.mjs에 짠 것을 C2 뼈대가 2026-11-05 이 모듈로 옮김 — 두 시대 파일이 함께 씀)
// prevMinusOf(from, to, except)가 [from, to) 동안 이 권역 조각·신장과 겹치는 앞 권역 나라(PREV_IDS)의 원래 버전 도형(늘리기·깎기 전, 권역 바깥선으로 자름)을 돌려준다.
// 시대 파일은 그해 주인 땅에서 이 목록을 빼서(주인 null 부분으로 떼어 둠) 겹침 0을 만든다. [from, to) 안에서 한 나라의 잘린 도형이 바뀌면 멈춘다 — 그 해를 표 경계 해(BOUNDS)에 넣는다.
// prevListOf·deg2는 C1 E 칸(E_prevIn·E_rawMinus)처럼 버전 경계 해를 직접 보는 칸이 쓴다. 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음: check:generator)
import { I } from '../../lib.mjs';
import { DOMAIN } from './table.mjs';
import { versions as EUROPE_VERSIONS } from '../europe.mjs';
import { versions as CHINA_VERSIONS } from '../china.mjs';
import { versions as INNER_ASIA_VERSIONS, fillSpecs as INNER_ASIA_FILLS } from '../inner-asia.mjs';
import { versions as MIDDLE_EAST_VERSIONS, extensions as MIDDLE_EAST_EXTENSIONS } from '../middle-east.mjs';
import { versions as SOUTH_ASIA_VERSIONS, extensions as SOUTH_ASIA_EXTENSIONS } from '../south-asia.mjs';
// ── 다른 권역 도형 빼기 (C1 뼈대가 짬, C2 뼈대가 이 모듈로 옮김 — 칸은 고치지 않음) ─────────────────────────────
// 1865~2026년 이 권역 조각(83개)·신장 조각과 1 km² 넘게 겹치는 앞 권역 나라(뼈대 측정 c1/skel/prev-overlap.txt — 해 1865·1866·1868·1873·1876·1881·1884·1895·1900·1918·1924·1946·1950·1992·2000·2022):
//   조각 83개 안: russia(1865 2,358,461 → 1895 3,845,812 km²)·soviet-union(3,845,812)·russia-fed(4,724, 카자흐스탄 북쪽 가장자리)
//   신장 조각 안: qing·roc(80,876 — 동쪽 띠)·prc(78,697)·mongolia(2,179, 1924년 판부터 — roc가 그만큼 줄어듦)·russia(6,473 → 9,491)·soviet-union(9,491, 러시아 구역의 신장 넘침 — 기본값 5로 고치지 않음)
//   이란·파키스탄·인도 쪽은 조각끼리 0 km²(under·이음매)라 할 일 없음.
//   mongolia는 inner-asia.mjs의 빈 땅 채우기(fillSpecs, 1921~)로만 생기는 나라라 버전 대신 채우기 구역을 쓴다. 채우기는 이 권역 땅을 뺀 뒤 돌므로
//   이 권역이 그 구역을 칠하면 몽골이 줄어든다 — 구역을 권역 바깥선으로 자른 땅을 통째로 빼면 몽골 땅(신장 조각 안 2,179 km²)이 그대로 남는다
//   (구역 안에서 다른 앞 권역 나라가 덮는 땅도 함께 빠지지만 그 땅은 어차피 빼므로 뺄 땅 합은 같다).
// 1500~1864년(C2 뼈대 측정 ca2/c2/skel/prev-overlap.txt — 해 1500·1509·1550·1600·1636·1644·1650·1691·1700·1720·1724·1743·1750·1752·1756·1800·1822·1824·1850·1854·1864):
//   카자흐스탄 조각 안: russia-tsardom(1556~1719 143,851 → 1720 206,003 km²)·russia(1721~ — 1752 214,681·1822 1,109,776·1824 1,639,090·1854 2,186,831·1864 2,330,904)
//   신장 조각 안: mongols(1388~1723, 1500 2,250 → 1509 23,542 → 1691 21,292)·ming(1,393, ~1643)·qing(1644~ 1,393 → 1691 3,642 → 1720 59,555 → 1724 80,876)·russia(1854 705·1864 6,473)
//   아프가니스탄·투르크멘·히바 조각 안: russia(1854~ 8,965) / 부하라·코칸트 조각 안: russia(1864 46,863). 사파비·무굴·호타크·아프샤르·두라니·카자르·티무르는 이 권역 조각과 0 km²(선만 닿음)
// 그래서 C1 목록 뒤에 russia-tsardom·mongols·ming을 더했다(셋 다 1865년 뒤 버전이 없어 C1 결과는 그대로 — gen:geo 바이트 같음으로 확인)
export const PREV_IDS = ['russia', 'soviet-union', 'russia-fed', 'qing', 'roc', 'prc', 'mongolia', 'russia-tsardom', 'mongols', 'ming'];
export const PREV_AREAS = [EUROPE_VERSIONS, CHINA_VERSIONS, INNER_ASIA_VERSIONS, MIDDLE_EAST_VERSIONS, MIDDLE_EAST_EXTENSIONS, SOUTH_ASIA_VERSIONS, SOUTH_ASIA_EXTENSIONS];
const prevLists = new Map(); // 나라 id → [[from, to(끝 없음은 Infinity), 원래 도형], ...]
export const prevListOf = (id) => {
  if (!prevLists.has(id)) {
    const list = [
      ...PREV_AREAS.flatMap((table) => table?.[id] ?? []).map(([f, t, g]) => [f, t ?? Infinity, g]),
      ...INNER_ASIA_FILLS.filter((sp) => sp.id === id).map((sp) => [sp.from, sp.to === 3000 ? Infinity : sp.to, sp.zone]), // 채우기 끝 없음은 to: 3000
    ];
    if (!list.length) throw new Error(`central-asia prev.mjs: 앞 권역에 나라 ${id}의 버전이 없음 (prevMinusOf의 PREV_IDS를 다시 잰다)`);
    prevLists.set(id, list);
  }
  return prevLists.get(id);
};
const clipped = new Map(); // 원래 도형 → 권역 바깥선(조각 83개 + 신장)으로 자른 도형
export const clipToDomain = (g) => {
  if (!clipped.has(g)) clipped.set(g, I(g, DOMAIN));
  return clipped.get(g);
};
export const deg2 = (m) => m.reduce((s, poly) => s + poly.reduce((s2, r, k) => { let a2 = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a2 += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s2 + (k === 0 ? 1 : -1) * Math.abs(a2 / 2); }, 0), 0);
// [from, to) 동안 뺄 앞 권역 도형 목록(to는 미포함, 끝 없음은 null). except: 빼지 않을 나라 id(깎기 구역 안 보호국 땅의 'russia'·'soviet-union')
export const prevMinusOf = (from, to, except = []) => {
  const T = to ?? Infinity;
  if (!Number.isInteger(from) || !(T === Infinity || (Number.isInteger(T) && from < T))) throw new Error(`central-asia prevMinusOf: 기간 [${from}, ${to})이 틀림`);
  for (const id of except) if (!PREV_IDS.includes(id)) throw new Error(`central-asia prevMinusOf: except의 ${id}는 PREV_IDS(${PREV_IDS.join(', ')})가 아님`);
  const out = [];
  for (const id of PREV_IDS) {
    if (except.includes(id)) continue;
    const hits = prevListOf(id).filter(([f, t]) => f < T && from < t).map(([f, t, g]) => [f, t, clipToDomain(g)]).filter(([, , g]) => g.length);
    if (!hits.length) continue;
    const sizes = [...new Set(hits.map(([, , g]) => Math.round(deg2(g) * 1e6)))];
    if (sizes.length > 1) throw new Error(`central-asia prevMinusOf: [${from}, ${to}) 안에서 ${id}의 도형이 바뀜(버전 ${hits.map(([f, t]) => `${f}~${t === Infinity ? '' : t - 1}`).join(', ')}) — 그 해를 BOUNDS에 넣거나 기간을 나눠 부른다`);
    out.push(hits[0][2]);
  }
  return out;
};
