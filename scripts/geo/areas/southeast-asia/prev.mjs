// southeast-asia 도우미 모듈: 다른 도형 빼기 (동남아 E1 뼈대 2026-11-08 — 중앙아시아 areas/central-asia/prev.mjs와 같은 꼴, 칸은 고치지 않음)
// 이 권역 조각과 겹치는 '이미 있는 도형'(앞 권역 나라의 원래 버전 + 이 권역 권역 파일의 남베트남 손그림)을 시대 파일이 그해 나라 땅에서 뺀다.
// 시대 파일 modern.mjs는 이 빼기를 공통 줄(버전 만들기)에서 한 번에 한다 — 칸은 따로 빼지 않는다(prevPieces가 해 구간마다 뺄 도형 목록을 돌려줌).
// 측정(E1 뼈대 e1/skel/prev-overlap.txt — data/geo의 1900년 뒤 버전 전부를 이 권역 조각 바깥선과 겹쳐 잼, 사인 도법 어림):
//   qing(1898~1911)·roc(1912~1948)·prc(1949~) 모두 1,414 km²로 같은 모양(동아시아 손 도형 L_CN_SW가 조각 중국 국경과 조금 어긋난 띠 — 베트남·라오스·미얀마 북쪽 가장자리).
//   south-vietnam(1955~1975, 이 권역 권역 파일) 186,507 km²(베트남 176,949·라오스 3,075·캄보디아 6,004 — e1/skel/sv-overlap.txt). 그 밖의 나라(british-raj·manipur·japan 등)는 1 km² 안
// 이 모듈은 나라를 만들지 않는다(versions 같은 이름을 내보내지 않음: check:generator). E2~E4 뼈대가 PREV_IDS에 그 시대 나라(ming 교지 등)를 더한다
// E2 뼈대 측정(e2/skel/prev-overlap.txt, 2026-11-08): 1767~1899에 걸치는 다른 권역 버전 가운데 1 km² 넘게 겹치는 것은 qing(1759~1909 모든 버전) 1,414 km² 띠뿐 — PREV_IDS 그대로(company-india·ahom-kingdom·manipur·british-raj 원래 모양은 1 km² 안)
import { I } from '../../lib.mjs';
import { DOMAIN } from './table.mjs';
import { SOUTH_VIETNAM } from './shapes.mjs';
import { versions as CHINA_VERSIONS } from '../china.mjs';
import { versions as INNER_ASIA_VERSIONS } from '../inner-asia.mjs';
import { versions as SOUTH_ASIA_VERSIONS, extensions as SOUTH_ASIA_EXTENSIONS } from '../south-asia.mjs';
import { extensions as CENTRAL_ASIA_EXTENSIONS } from '../central-asia.mjs';

// E3 뼈대 측정(e3/skel/prev-overlap.txt, 2026-11-09): 1293~1766에 걸치는 다른 권역 버전 가운데 1 km² 넘게 겹치는 것은 yuan(1290~1367) 1,414 · ming(1368~1643) 154~1,375, 1407~1426 명 교지 172,010 · qing(1644~) 1,375~1,414 km²뿐
//   — yuan·ming을 더함(그 밖의 bengal-sultanate·mughal-empire·manipur·ahom-kingdom 원래 모양은 1 km² 안). 1767 뒤 해에는 둘 다 버전이 없어 E1·E2 버전은 바뀌지 않는다
export const PREV_IDS = ['yuan', 'ming', 'qing', 'roc', 'prc'];
const PREV_AREAS = [CHINA_VERSIONS, INNER_ASIA_VERSIONS, SOUTH_ASIA_VERSIONS, SOUTH_ASIA_EXTENSIONS, CENTRAL_ASIA_EXTENSIONS];
// 이 권역 권역 파일에 있는 도형(시대 파일이 가져올 수 없는 권역 파일 나라 — 좌표는 shapes.mjs 한 곳): [나라 id, from, to(미포함), 도형]
const OWN_FIXED = [['south-vietnam', 1955, 1976, [[SOUTH_VIETNAM]]]];

const prevLists = new Map(); // 나라 id → [[from, to(끝 없음은 Infinity), 원래 도형], ...]
export const prevListOf = (id) => {
  if (!prevLists.has(id)) {
    const list = PREV_AREAS.flatMap((table) => table?.[id] ?? []).map(([f, t, g]) => [f, t ?? Infinity, g]);
    if (!list.length) throw new Error(`southeast-asia prev.mjs: 앞 권역에 나라 ${id}의 버전이 없음 (PREV_IDS를 다시 잰다)`);
    prevLists.set(id, list);
  }
  return prevLists.get(id);
};
const clipped = new Map(); // 원래 도형 → 권역 바깥선으로 자른 도형
export const clipToDomain = (g) => {
  if (!clipped.has(g)) clipped.set(g, I(g, DOMAIN));
  return clipped.get(g);
};
export const deg2 = (m) => m.reduce((s, poly) => s + poly.reduce((s2, r, k) => { let a2 = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a2 += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return s2 + (k === 0 ? 1 : -1) * Math.abs(a2 / 2); }, 0), 0);
// 뺄 도형 줄: [id, from, to(Infinity), 잘린 도형] — 권역 바깥선과 닿는 것만
const allHits = () => [
  ...PREV_IDS.flatMap((id) => prevListOf(id).map(([f, t, g]) => [id, f, t, clipToDomain(g)])),
  ...OWN_FIXED.map(([id, f, t, g]) => [id, f, t, clipToDomain(g)]),
].filter(([, , , g]) => g.length && deg2(g) > 1e-6);
let HITS = null;
// [from, to)를 뺄 도형 목록이 같은 구간으로 나눠 [[f, t, 도형 목록], ...]을 돌려준다(to는 미포함, 끝 없음은 null). 목록이 같은지는 나라마다 잘린 도형 넓이로 견준다
// (qing·roc·prc는 모양이 같아 한 구간으로 이어지고, 남베트남이 있는 1955~1975는 따로 나뉜다)
export const prevPieces = (from, to) => {
  HITS ??= allHits();
  const T = to ?? Infinity;
  if (!Number.isInteger(from) || !(T === Infinity || (Number.isInteger(T) && from < T))) throw new Error(`southeast-asia prevPieces: 기간 [${from}, ${to})이 틀림`);
  const cuts = [...new Set([from, T, ...HITS.flatMap(([, f, t]) => [f, t]).filter((y) => from < y && y < T)])].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const [f, t] = [cuts[i], cuts[i + 1]];
    const shapes = HITS.filter(([, hf, ht]) => hf <= f && t <= ht).map(([, , , g]) => g);
    const key = [...new Set(shapes.map((g) => Math.round(deg2(g) * 1e6)))].sort((a, b) => a - b).join('|');
    const last = out.at(-1);
    if (last && last.key === key) last.t = t;
    else out.push({ f, t, key, shapes });
  }
  return out.map(({ f, t, shapes }) => [f, t === Infinity ? null : t, shapes]);
};
