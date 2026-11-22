// 전역 범위 밖 땅 (2026-11-23, TheaterSchema.whole): 전역이 범위(bounds)를 정하면 진영 덩어리를 그 상자로 자르므로(wars.ts computeScene)
// 소련처럼 범위보다 훨씬 큰 나라는 상자 밖(시베리아)이 비어 보였다. whole에 적은 나라는 상자 밖 땅을 전역이 시작된 해의 영토 그대로
// 진영 색으로 칠하도록 따로 싣는다. 장면마다 같으므로 전역에 한 번만 두고(wars.json·wars/<id>.json이 커지지 않게), 전쟁 중 영토 변화는
// 전역 범위 안(장면)에만 적용된다.
// wars.ts가 아니라 여기 둔 까닭: wars.ts를 고치면 장면 캐시(war-cache.ts CODE_SALT)가 모두 버려진다
import type { WarIndexEntry } from '../../src/schema/index.ts';
import { bbox, difference, rewindForD3, roundCoords, type MultiCoords } from './geo.ts';
import type { RegionalWar, WarGeoSources } from './wars.ts';

/** wars.ts boundsBox와 같은 여백(범위 폭의 1/4) */
const MARGIN = 0.25;
/**
 * 범위 밖 땅을 상자 안쪽으로 이만큼(°) 겹치게 둔다. 범위 밖 땅과 장면의 진영 덩어리는 따로 칠하므로 딱 맞닿게 자르면
 * 경계에 가는 틈이 비친다. 범위 밖 땅을 먼저 칠하고 장면을 그 위에 칠하므로 겹친 곳은 장면이 덮는다
 */
const OVERLAP = 0.5;

/** 진영 덩어리를 자르는 상자(wars.ts boundsBox)에서 OVERLAP만큼 안으로 들인 상자. 세계 끝(경도 ±180, 위도 ±85)에 닿은 변은 그대로 */
function innerBox([[w, s], [e, n]]: [[number, number], [number, number]]): MultiCoords {
  const dx = (e - w) * MARGIN;
  const dy = (n - s) * MARGIN;
  const W = w - dx <= -180 ? -180 : w - dx + OVERLAP;
  const E = e + dx >= 180 ? 180 : e + dx - OVERLAP;
  const S = s - dy <= -85 ? -85 : s - dy + OVERLAP;
  const N = n + dy >= 85 ? 85 : n + dy - OVERLAP;
  return [[[[W, S], [E, S], [E, N], [W, N], [W, S]]]];
}

/** 고리의 평면 넓이(경위도 제곱도) */
function ringArea(ring: number[][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a / 2);
}

/** buildWars 결과에 전역마다 범위 밖 땅(rest)을 채운다. whole이 없는 전역·전쟁의 출력은 그대로 */
export function addRest(out: WarIndexEntry[], wars: RegionalWar[], geo: WarGeoSources, errors: string[]) {
  for (const entry of out) {
    const w = wars.find((x) => x.id === entry.id);
    if (!w) continue;
    for (const tOut of entry.theaters) {
      const t = w.theaters.find((x) => x.id === tOut.id);
      if (!t || !t.whole.length) continue;
      const where = `전쟁 ${w.id} 전역 ${t.id}`;
      if (!t.bounds) {
        errors.push(`${where}: whole은 범위(bounds)를 정한 전역에서만 씀`);
        continue;
      }
      const box = innerBox(t.bounds);
      const rest: NonNullable<WarIndexEntry['theaters'][number]['rest']> = [];
      for (const id of t.whole) {
        if (!t.replaces.includes(id)) {
          errors.push(`${where}: whole의 '${id}'가 replaces에 없음`);
          continue;
        }
        const faction = w.factions.find((f) => f.entity === id)?.id ?? w.participants.find((p) => p.entity === id)?.faction;
        if (!faction) {
          errors.push(`${where}: whole의 '${id}'가 어느 진영인지 모름(진영의 대표 나라도 참전국도 아님)`);
          continue;
        }
        const territory = geo.territory(id, tOut.from);
        if (!territory?.length) {
          errors.push(`${where}: whole의 '${id}'는 전역이 시작된 ${tOut.from}년 영토가 없음`);
          continue;
        }
        const outside = roundCoords(difference(territory, box), 3).filter((polygon) => ringArea(polygon[0]) > 1e-5);
        if (!outside.length) continue;
        rest.push({ faction, coords: rewindForD3(outside) as [number, number][][][], bbox: bbox(outside) });
      }
      if (rest.length) tOut.rest = rest;
    }
  }
}
