// 전선 (DESIGN.md §4.5): data/fronts/*.yaml → 검증 → 스냅샷마다 두 편의 점령 지역 계산 → fronts.json
import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import {
  FrontSchema,
  type Entity,
  type Front,
  type FrontIndexEntry,
  type HistoryEvent,
} from '../../src/schema/index.ts';
import { anchorPoint, bbox, difference, intersect, rewindForD3, roundCoords, union, type MultiCoords } from './geo.ts';

/** 날짜 문자열의 연도 (천문 연도) */
export function yearOfDate(date: string): number {
  return Number(date.match(/^(-?\d+)-/)![1]);
}

export async function readFronts(files: string[], errors: string[], rel: (f: string) => string): Promise<Front[]> {
  const fronts: Front[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = parseYaml(await readFile(file, 'utf8'));
    } catch (e) {
      errors.push(`${rel(file)}: YAML 문법 오류 - ${(e as Error).message}`);
      continue;
    }
    const result = FrontSchema.safeParse(raw);
    if (!result.success) {
      for (const issue of result.error.issues) errors.push(`${rel(file)} ${issue.path.join('.')}: ${issue.message}`);
      continue;
    }
    fronts.push(result.data);
  }
  return fronts;
}

export function checkFronts(fronts: Front[], entities: Map<string, Entity>, events: HistoryEvent[], errors: string[]) {
  const ids = new Set<string>();
  for (const f of fronts) {
    if (ids.has(f.id)) errors.push(`전선 id 중복: ${f.id}`);
    ids.add(f.id);
    for (const id of [...f.region, f.sides.north.entity, f.sides.south.entity, ...f.participants])
      if (!entities.has(id)) errors.push(`전선 ${f.id}: 없는 나라 '${id}'`);
    f.snapshots.forEach((s, i) => {
      if (i > 0 && s.date <= f.snapshots[i - 1].date && yearOfDate(s.date) >= yearOfDate(f.snapshots[i - 1].date))
        errors.push(`전선 ${f.id}: 스냅샷 날짜가 순서대로가 아님 (${f.snapshots[i - 1].date} → ${s.date})`);
    });
  }
  for (const ev of events) {
    if (!ev.front) continue;
    const war = fronts.find((f) => f.id === ev.front!.war);
    if (!war) errors.push(`사건 ${ev.id}: 없는 전선 '${ev.front.war}'`);
    else if (!war.snapshots.some((s) => s.date === ev.front!.date))
      errors.push(`사건 ${ev.id}: 전선 ${war.id}에 ${ev.front.date} 스냅샷이 없음`);
  }
}

/** 선의 북·서쪽을 닫는 큰 고리. 선은 서쪽(또는 남해안)에서 시작해 동쪽 바다에서 끝난다 */
function northRing(line: [number, number][]): MultiCoords {
  const [first, last] = [line[0], line[line.length - 1]];
  const ring = [...line, [last[0] + 5, last[1]], [last[0] + 5, 85], [first[0] - 5, 85], [first[0] - 5, first[1]], line[0]];
  return [[ring]];
}

/**
 * @param regionCoords 전선으로 대신 칠할 범위를 구하는 함수: 나라 id와 연도를 받아 그 해의 (해안선으로 자른) 영토를 돌려준다
 */
export function buildFronts(fronts: Front[], regionCoords: (entityId: string, year: number) => MultiCoords | null): FrontIndexEntry[] {
  return fronts.map((f) => {
    const from = yearOfDate(f.snapshots[0].date);
    const to = yearOfDate(f.snapshots[f.snapshots.length - 1].date);
    const parts = f.region.map((id) => regionCoords(id, from)).filter((c): c is MultiCoords => !!c && c.length > 0);
    const area = union(...parts);
    const [w, s, e, n] = bbox(area);
    // 참전국: region·sides 나라를 빠짐없이 넣는다
    const participants = [...new Set([...f.region, f.sides.north.entity, f.sides.south.entity, ...f.participants])];
    return {
      ...f,
      participants,
      from,
      to,
      marker: f.marker ?? [(w + e) / 2, (s + n) / 2],
      bounds: f.bounds ?? [[w - 1.5, s - 1], [e + 1.5, n + 1]],
      snapshots: f.snapshots.map((s) => {
        const north = intersect(area, northRing(s.line as [number, number][]));
        const south = difference(area, north);
        const out = (c: MultiCoords) => rewindForD3(roundCoords(c, 3)) as [number, number][][][];
        // 이름표 위치: 각 편 점령 지역의 가장 큰 조각 안쪽
        const anchors = { north: north.length ? anchorPoint(north) : null, south: south.length ? anchorPoint(south) : null };
        return { ...s, year: yearOfDate(s.date), north: out(north), south: out(south), bbox: bbox(area), anchors };
      }),
    };
  });
}
