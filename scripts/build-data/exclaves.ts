// 월경지 검사 (DESIGN.md §5.5): 해안선으로 자른 영토에서 같은 육지 덩어리 위의 본토와 떨어진 조각을 찾는다.
// 생성기(scripts/generate-geo.mjs)의 직선 경계가 만·반도·해협을 가로지르면, 생성기 좌표에서는 바다를 통해
// 본토와 이어져 보이던 조각이 해안선으로 자를 때 떨어져 나온다. 실제로 떨어져 있던 영토는 data/exclaves.yaml에 근거와 함께 적는다.
import { z } from 'zod';
import { anchorPoint, areaKm2, type BBox, type MultiCoords, type PolygonCoords, type Ring } from './geo.ts';

/** 이보다 작은 조각은 보지 않는다 (해안선 자르기에서 생기는 부스러기) */
export const EXCLAVE_MIN_KM2 = 5;
/** 허용 목록에 없는 떨어진 조각이 이보다 크면 문제로, 작으면 참고로 알린다 */
export const EXCLAVE_REPORT_KM2 = 30;

/** data/exclaves.yaml: 실제로 본토와 떨어져 있던 영토 */
export const AllowedExclaveSchema = z.object({
  entity: z.string(),
  from: z.number().int(),
  to: z.number().int().nullable(),
  /** 이 점을 품은 조각만 허용한다 (면적이 아니라 위치로 건다) */
  at: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
  reason: z.string().min(1),
  sources: z.array(z.string().min(1)).default([]),
});
export type AllowedExclave = z.infer<typeof AllowedExclaveSchema>;

export interface ExclaveTerritory {
  entityId: string;
  from: number;
  to: number | null;
  where: string;
  clipped: MultiCoords;
}

export interface ExclavePiece {
  entityId: string;
  from: number;
  to: number | null;
  where: string;
  km2: number;
  at: [number, number];
  coords: PolygonCoords;
  /** 같은 육지 덩어리 위 본토(가장 큰 조각)의 대표점 */
  mainAt: [number, number];
}

function inRing(pt: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inPolygon(pt: [number, number], polygon: PolygonCoords): boolean {
  return inRing(pt, polygon[0]) && !polygon.slice(1).some((hole) => inRing(pt, hole));
}

/** 나라·기간마다 육지 덩어리별로 조각을 묶어, 가장 큰 조각(본토)과 떨어진 나머지 조각을 돌려준다. 섬 조각은 떨어진 조각이 아니다. */
export function findExclaves(territories: ExclaveTerritory[], land: { coords: PolygonCoords; bbox: BBox }[], minKm2 = EXCLAVE_MIN_KM2): ExclavePiece[] {
  const landOf = (pt: [number, number]) =>
    land.findIndex((l) => pt[0] >= l.bbox[0] && pt[0] <= l.bbox[2] && pt[1] >= l.bbox[1] && pt[1] <= l.bbox[3] && inPolygon(pt, l.coords));
  const found: ExclavePiece[] = [];
  for (const t of territories) {
    if (t.clipped.length < 2) continue;
    const pieces = t.clipped
      .map((coords) => ({ coords, km2: areaKm2([coords]) }))
      .filter((p) => p.km2 >= minKm2)
      .map((p) => ({ ...p, at: anchorPoint([p.coords]) as [number, number] }));
    if (pieces.length < 2) continue;
    const groups = new Map<number, typeof pieces>();
    for (const p of pieces) {
      const li = landOf(p.at);
      if (li >= 0) groups.set(li, [...(groups.get(li) ?? []), p]);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      group.sort((a, b) => b.km2 - a.km2);
      const [main, ...rest] = group;
      for (const p of rest) found.push({ entityId: t.entityId, from: t.from, to: t.to, where: t.where, km2: p.km2, at: p.at, coords: p.coords, mainAt: main.at });
    }
  }
  return found;
}

const overlaps = (a: { from: number; to: number | null }, b: { from: number; to: number | null }) =>
  a.from < (b.to ?? Infinity) && b.from < (a.to ?? Infinity);

/** 떨어진 조각을 허용 목록과 맞춰 본다. stale: 어떤 조각에도 맞지 않는 허용 항목 (도형이 바뀌어 낡았을 수 있음) */
export function matchExclaves(pieces: ExclavePiece[], allow: AllowedExclave[]) {
  const used = new Set<AllowedExclave>();
  const unexpected: ExclavePiece[] = [];
  const allowed: { piece: ExclavePiece; entry: AllowedExclave }[] = [];
  for (const piece of pieces) {
    const entry = allow.find((a) => a.entity === piece.entityId && overlaps(a, piece) && inPolygon(a.at, piece.coords));
    if (entry) {
      used.add(entry);
      allowed.push({ piece, entry });
    } else unexpected.push(piece);
  }
  return { allowed, unexpected, stale: allow.filter((a) => !used.has(a)) };
}

export const formatPiece = (p: ExclavePiece, name = p.entityId) =>
  `${name}(${p.entityId}) ${p.from}~${p.to ?? '현재'}: ${Math.round(p.km2).toLocaleString()}km² 조각 @${p.at.map((v) => v.toFixed(2)).join(',')} (본토 @${p.mainAt.map((v) => v.toFixed(2)).join(',')})`;
