// test:geo 공유 자료: 검사들이 같은 자료를 한 번만 읽도록 러너(index.ts)가 만들어 검사에 넘긴다.
// - geo: data/geo/*.geojson 원자료(파일 이름 순서, 파일 안 순서). 줄 텍스트(line)와 범위 상자 포함. 해안선으로 자르기 전의 도형
// - entities·events: data/entities·data/events YAML에서 검사에 필요한 필드만 (스키마 검증은 build:data/check:data가 한다)
// - clipped(): 해안선(50m)으로 자른 도형. build-data의 runCached('clip')와 같은 열쇠라 캐시를 공유한다. 처음 부를 때만 읽는다(느림)
// - inRegion·inYears: --region·--years 거르기 도우미
// 사용: 검사 파일에서 `run(ctx, opt)`의 ctx로 받아 쓴다. 직접 실행하는 파일이 아님.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import type { Options } from './types.ts';
import { REGION_FILTER_OF } from '../../src/schema/regions.ts';

export type Position = number[];
export type MultiCoords = Position[][][];
export type BBox = [west: number, south: number, east: number, north: number];

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export interface GeoVersion {
  entityId: string;
  /** 영토 버전 시작 해(포함) */
  from: number;
  /** 끝 해(제외). 지금까지면 null */
  to: number | null;
  certainty: string;
  /** 'data/geo/joseon.geojson [3]' 꼴 (check:data의 where와 같음) */
  where: string;
  file: string;
  index: number;
  /** 파일 안의 그 버전 줄 텍스트(해시 열쇠용) */
  line: string;
  coords: MultiCoords;
  box: BBox;
}

export interface ClippedVersion extends GeoVersion {
  /** 해안선(50m)으로 자르고 소수 4자리로 반올림한 도형 (build:data의 clipAll과 같음). 육지가 남지 않으면 빈 배열 */
  clipped: MultiCoords;
}

export interface EntityInfo {
  id: string;
  /** 항목 파일 이름(korea·china·europe 등) = 권역 */
  region: string;
  /** 권역 필터 단위(east-asia·europe). 대응표에 없으면 null */
  unit: string | null;
  level: string;
  ko: string;
  from: number;
  to: number | null;
}

export interface EventInfo {
  id: string;
  file: string;
  year: number;
  endYear: number | null;
  subjects: string[];
  links: { from: string; to: string }[];
  title: string;
}

export interface Context {
  root: string;
  opt: Options;
  geo: GeoVersion[];
  entities: Map<string, EntityInfo>;
  events: EventInfo[];
  /** 해안선으로 자른 영토 (geo와 같은 순서). 처음 부를 때 읽는다 */
  clipped(): Promise<ClippedVersion[]>;
  /** 항목이 --region에 드는가. 모르는 항목·--region 없음이면 true */
  inRegion(entityId: string): boolean;
  /** 해 구간이 --years와 겹치는가. 버전은 [from, to), to가 null이면 지금까지 */
  overlapsYears(from: number, to: number | null): boolean;
  /** 이 해가 --years 안인가 */
  inYears(year: number): boolean;
  /** .cache/test-geo 절대 경로 */
  cacheDir: string;
}

const bboxOf = (coords: MultiCoords): BBox => {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const poly of coords) for (const [x, y] of poly[0]) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [w, s, e, n];
};

function toMulti(g: { type: string; coordinates: unknown }): MultiCoords {
  if (g.type === 'Polygon') return [g.coordinates as Position[][]];
  if (g.type === 'MultiPolygon') return g.coordinates as MultiCoords;
  return [];
}

function readGeo(root: string): GeoVersion[] {
  const dir = path.join(root, 'data/geo');
  const out: GeoVersion[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.geojson')).sort()) {
    const text = readFileSync(path.join(dir, f), 'utf8');
    const fc = JSON.parse(text) as { features: { properties: { entityId: string; from: number; to: number | null; certainty: string }; geometry: { type: string; coordinates: unknown } }[] };
    // 생성기는 영토 버전을 한 줄에 하나씩 쓴다. 그렇지 않은 파일이면 줄 텍스트는 다시 직렬화한 것으로 대신한다
    const lines = text.split('\n').filter((l) => l.startsWith('{"type":"Feature"')).map((l) => l.replace(/\r$/, '').replace(/,$/, ''));
    const lineOk = lines.length === fc.features.length;
    fc.features.forEach((ft, i) => {
      const coords = toMulti(ft.geometry);
      out.push({
        entityId: ft.properties.entityId,
        from: ft.properties.from,
        to: ft.properties.to,
        certainty: ft.properties.certainty,
        where: `data/geo/${f} [${i}]`,
        file: f,
        index: i,
        line: lineOk ? lines[i] : JSON.stringify(ft),
        coords,
        box: bboxOf(coords),
      });
    });
  }
  return out;
}

function readYamlList(file: string): Record<string, unknown>[] {
  const raw = parseYaml(readFileSync(file, 'utf8')) as unknown;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

function readEntities(root: string): Map<string, EntityInfo> {
  const dir = path.join(root, 'data/entities');
  const map = new Map<string, EntityInfo>();
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const region = f.replace(/\.yaml$/, '');
    for (const e of readYamlList(path.join(dir, f))) {
      const id = String(e.id);
      map.set(id, {
        id,
        region,
        unit: Object.hasOwn(REGION_FILTER_OF, region) ? REGION_FILTER_OF[region] : null,
        level: String(e.level ?? ''),
        ko: String((e.names as { ko?: string } | undefined)?.ko ?? id),
        from: Number(e.from),
        to: e.to === null || e.to === undefined ? null : Number(e.to),
      });
    }
  }
  return map;
}

function readEvents(root: string): EventInfo[] {
  const dir = path.join(root, 'data/events');
  const out: EventInfo[] = [];
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    for (const e of readYamlList(path.join(dir, f))) {
      out.push({
        id: String(e.id),
        file: f,
        year: Number(e.year),
        endYear: e.endYear === undefined || e.endYear === null ? null : Number(e.endYear),
        subjects: ((e.subjects as string[] | undefined) ?? []).map(String),
        links: ((e.links as { from: string; to: string }[] | undefined) ?? []).map((l) => ({ from: String(l.from), to: String(l.to) })),
        title: String((e.title as { ko?: string } | undefined)?.ko ?? e.id),
      });
    }
  }
  return out;
}

/** 해안선 자르기 결과: build:data의 clipAll과 같은 작업·같은 열쇠(runCached('clip'))라 캐시를 공유한다 */
async function clipGeo(geo: GeoVersion[]): Promise<ClippedVersion[]> {
  const { keyOf, runCached } = await import(pathToFileURL(path.join(ROOT, 'scripts/build-data/cache.ts')).href);
  const { roundCoords } = await import(pathToFileURL(path.join(ROOT, 'scripts/build-data/geo.ts')).href);
  const jobs = geo.map((g) => ({ args: { g: keyOf(g.coords), land: '50m' }, geoms: new Map([[keyOf(g.coords), g.coords]]) }));
  const results = (await runCached('clip', jobs)) as MultiCoords[];
  return geo.map((g, i) => ({ ...g, clipped: roundCoords(results[i]) as MultiCoords }));
}

export function createContext(opt: Options, root = ROOT): Context {
  const geo = readGeo(root);
  const entities = readEntities(root);
  const events = readEvents(root);
  let clippedPromise: Promise<ClippedVersion[]> | null = null;
  return {
    root,
    opt,
    geo,
    entities,
    events,
    clipped: () => (clippedPromise ??= clipGeo(geo)),
    inRegion(entityId) {
      if (opt.region === null) return true;
      const e = entities.get(entityId);
      if (!e) return true;
      return e.region === opt.region || e.unit === opt.region;
    },
    overlapsYears(from, to) {
      if (!opt.years) return true;
      return from <= opt.years[1] && (to === null || to > opt.years[0]);
    },
    inYears(year) {
      return !opt.years || (year >= opt.years[0] && year <= opt.years[1]);
    },
    cacheDir: path.join(root, '.cache/test-geo'),
  };
}
