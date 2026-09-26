// 데이터 빌드 (DESIGN.md §5.3): 원본 YAML/GeoJSON → 검증 → 지오 처리 → public/data/
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import {
  EntitySchema,
  EventSchema,
  LODS,
  RelationSchema,
  TerritoryPropsSchema,
  type Entity,
  type HistoryEvent,
  type Lod,
  type Relation,
  type TerritoryIndexEntry,
  type TerritoryProps,
  type TimelineIndex,
} from '../../src/schema/index.ts';
import { buildLodTopology, countPoints, subTopology, tiledTopology } from './topo.ts';
import { chunkOutlines, tilePolygons } from './tiles.ts';
import {
  anchorPoint,
  areaKm2,
  bbox,
  bboxIntersects,
  clipToLand,
  intersect,
  rewindForD3,
  roundCoords,
  toMulti,
  type BBox,
  type MultiCoords,
} from './geo.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(ROOT, 'public/data');
const require = createRequire(import.meta.url);
/** --check: 검증만 하고 public/data/에 쓰지 않는다 */
const CHECK_ONLY = process.argv.includes('--check');

/** 타임라인 범위: 고조선 건국(기원전 2333년) ~ 올해 (DESIGN.md D9) */
const RANGE: [number, number] = [-2332, new Date().getFullYear()];
/** 서로 다른 나라 영토가 이 면적(km²)보다 많이 겹치면 오류 */
const OVERLAP_TOLERANCE_KM2 = 5;
/** color가 없는 나라에 쓰는 기본 색 */
const FALLBACK_PALETTE = ['#c8745a', '#7d9b5b', '#d4a93f', '#5b7fa8', '#9a6fb0', '#b86b8a', '#8f8a5a', '#5f9e9a'];

const errors: string[] = [];
const warnings: string[] = [];
const rel = (file: string) => path.relative(ROOT, file).replaceAll('\\', '/');

// ── 읽기와 스키마 검증 ────────────────────────────────────

async function listFiles(dir: string, ext: string): Promise<string[]> {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith(ext)).sort().map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

function validate<T>(schema: z.ZodType<T>, value: unknown, where: string): T | null {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) errors.push(`${where} ${issue.path.join('.')}: ${issue.message}`);
  return null;
}

async function readYamlList<T>(file: string, schema: z.ZodType<T>): Promise<T[]> {
  let raw: unknown;
  try {
    raw = parseYaml(await readFile(file, 'utf8')) ?? [];
  } catch (e) {
    errors.push(`${rel(file)}: YAML 문법 오류 - ${(e as Error).message}`);
    return [];
  }
  if (!Array.isArray(raw)) {
    errors.push(`${rel(file)}: 최상위는 목록이어야 함`);
    return [];
  }
  return raw.flatMap((item, i) => {
    const label = `${rel(file)} [${i}${item?.id ? ` ${item.id}` : ''}]`;
    const parsed = validate(schema, item, label);
    return parsed ? [parsed] : [];
  });
}

interface Territory extends TerritoryProps {
  coords: MultiCoords;
  where: string;
}

async function readTerritories(): Promise<Territory[]> {
  const territories: Territory[] = [];
  for (const file of await listFiles(path.join(DATA, 'geo'), '.geojson')) {
    const fc = JSON.parse(await readFile(file, 'utf8')) as FeatureCollection;
    fc.features.forEach((f, i) => {
      const where = `${rel(file)} [${i}]`;
      const props = validate(TerritoryPropsSchema, f.properties, where);
      if (!props) return;
      if (f.geometry?.type !== 'Polygon' && f.geometry?.type !== 'MultiPolygon') {
        errors.push(`${where}: Polygon 또는 MultiPolygon이어야 함`);
        return;
      }
      const coords = toMulti(f.geometry);
      // QGIS에서 좌표계를 EPSG:4326이 아닌 것으로 저장하면 미터 단위 좌표가 들어온다.
      const outOfRange = coords.flat(2).find(([x, y]) => !(x >= -180 && x <= 180 && y >= -90 && y <= 90));
      if (outOfRange) {
        errors.push(`${where}: 경위도 범위를 벗어난 좌표 [${outOfRange.join(', ')}]. 좌표계가 EPSG:4326(WGS 84)인지 확인`);
        return;
      }
      territories.push({ ...props, coords, where });
    });
  }
  return territories;
}

// ── 참조 무결성 (DESIGN.md §5.3 ②) ─────────────────────────

const alive = (e: Entity, year: number) => e.from <= year && (e.to === null || year <= e.to);
const active = (t: { from: number; to: number | null }, year: number) => t.from <= year && (t.to === null || year < t.to);

function checkIntegrity(entities: Map<string, Entity>, territories: Territory[], events: HistoryEvent[], relations: Relation[]) {
  const byEntity = new Map<string, Territory[]>();
  for (const t of territories) {
    const entity = entities.get(t.entityId);
    if (!entity) {
      errors.push(`${t.where}: 없는 나라 '${t.entityId}'`);
      continue;
    }
    if (t.to !== null && t.to <= t.from) errors.push(`${t.where}: to(${t.to})가 from(${t.from})보다 커야 함`);
    const lastYear = t.to === null ? Infinity : t.to - 1;
    const entityEnd = entity.to ?? Infinity;
    if (t.from < entity.from || lastYear > entityEnd)
      errors.push(`${t.where}: 영토 기간 [${t.from}, ${t.to})이 ${entity.id}의 존속 기간 ${entity.from}~${entity.to ?? '현재'}을 벗어남`);
    byEntity.set(t.entityId, [...(byEntity.get(t.entityId) ?? []), t]);
  }

  for (const [id, list] of byEntity) {
    list.sort((a, b) => a.from - b.from);
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1];
      if (prev.to === null || prev.to > list[i].from)
        errors.push(`${list[i].where}: ${id}의 영토 기간이 앞 버전(${prev.from}~${prev.to})과 겹침`);
      else if (prev.to < list[i].from) warnings.push(`${id}: ${prev.to}~${list[i].from - 1}년 영토 없음`);
    }
  }
  for (const e of entities.values()) {
    if (e.level === 'polity' && !byEntity.has(e.id)) warnings.push(`${e.id}: 영토 데이터 없음`);
  }

  const eventIds = new Set<string>();
  for (const ev of events) {
    const where = `사건 ${ev.id}`;
    if (eventIds.has(ev.id)) errors.push(`${where}: id 중복`);
    eventIds.add(ev.id);
    if (ev.endYear !== undefined && ev.endYear < ev.year) errors.push(`${where}: endYear가 year보다 앞섬`);
    if (ev.year < RANGE[0] || (ev.endYear ?? ev.year) > RANGE[1])
      errors.push(`${where}: 연도가 타임라인 범위(${RANGE[0]}~${RANGE[1]})를 벗어남`);
    const refs = [...ev.subjects.map((id) => ['subjects', id]), ...ev.links.flatMap((l) => [['links.from', l.from], ['links.to', l.to]])];
    for (const [field, id] of refs) {
      const entity = entities.get(id);
      if (!entity) errors.push(`${where}: ${field}의 '${id}'는 없는 나라`);
      else if (!alive(entity, ev.year)) errors.push(`${where}: ${field}의 '${id}'는 ${ev.year}년에 존재하지 않음`);
    }
    for (const l of ev.links) if (l.from === l.to) errors.push(`${where}: 같은 나라 사이의 link (${l.from})`);
  }

  for (const r of relations) {
    const where = `관계 ${r.type} ${r.subject}→${r.object}`;
    for (const id of [r.subject, r.object]) if (!entities.has(id)) errors.push(`${where}: 없는 나라 '${id}'`);
    if (r.to !== null && r.to < r.from) errors.push(`${where}: to가 from보다 앞섬`);
    const subject = entities.get(r.subject);
    if (subject && !alive(subject, r.from)) errors.push(`${where}: ${r.from}년에 ${r.subject}가 존재하지 않음`);
    if (r.subject === r.object) errors.push(`${where}: 자기 자신과의 관계`);
  }
}

/** 화살표를 그릴 수 없는 사건: 영토 데이터가 하나도 없는 나라가 links에 있음 */
function checkArrowAnchors(events: HistoryEvent[], territories: Territory[]) {
  const withTerritory = new Set(territories.map((t) => t.entityId));
  for (const ev of events)
    for (const l of ev.links)
      for (const id of [l.from, l.to])
        if (!withTerritory.has(id)) warnings.push(`사건 ${ev.id}: '${id}'의 영토 데이터가 없어 화살표를 그릴 수 없음`);
}

// ── 지오 처리 (DESIGN.md §5.3 ③) ────────────────────────────

type Land = Awaited<ReturnType<typeof loadLand>>;

/** Natural Earth 육지. 1:50m은 mid·high 단계와 검사에, 1:110m은 low 단계에 쓴다. */
async function loadLand(scale: '50m' | '110m') {
  const topo = JSON.parse(await readFile(require.resolve(`world-atlas/land-${scale}.json`), 'utf8')) as Topology<{ land: GeometryCollection }>;
  const fc = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;
  const pieces = fc.features.flatMap((f) => toMulti(f.geometry)).map((coords) => ({ coords, bbox: bbox([coords]) }));
  return { fc, pieces };
}

interface ClippedTerritory extends Territory {
  key: string;
  clipped: MultiCoords;
  box: BBox;
  anchor: [number, number];
}

function clipAll(territories: Territory[], land: Land): ClippedTerritory[] {
  return territories.flatMap((t) => {
    const clipped = roundCoords(clipToLand(t.coords, land.pieces));
    if (clipped.length === 0) {
      errors.push(`${t.where}: 해안선으로 자르고 나니 육지가 남지 않음`);
      return [];
    }
    return [{ ...t, key: `${t.entityId}@${t.from}`, clipped, box: bbox(clipped), anchor: anchorPoint(clipped) }];
  });
}

/** 도형 연산과 해안선 자르기에서 생기는 면적이 거의 없는 조각. 방향이 흔들려 지구 전체를 칠하는 원인이 된다 */
const SLIVER_KM2 = 0.5;

function toFeature(key: string, coords: MultiCoords): Feature<MultiPolygon, { key: string }> {
  const solid = coords.filter((polygon) => areaKm2([polygon]) >= SLIVER_KM2);
  return { type: 'Feature', properties: { key }, geometry: { type: 'MultiPolygon', coordinates: rewindForD3(solid) } };
}

/** 단계별 토폴로지를 만들어 육지 파일과 나라별 영토 파일로 나눠 쓴다. */
async function writeLods(clipped: ClippedTerritory[], land50: Land, land110: Land) {
  const byEntity = new Map<string, string[]>();
  for (const t of clipped) byEntity.set(t.entityId, [...(byEntity.get(t.entityId) ?? []), t.key]);

  // low 단계는 1:110m 해안선에 맞춰 다시 자른다 (육지 레이어와 해안선이 정확히 겹치도록)
  const low = clipped.flatMap((t) => {
    const coords = roundCoords(clipToLand(t.coords, land110.pieces));
    return coords.length ? [toFeature(t.key, coords)] : [];
  });
  const detailed = clipped.map((t) => toFeature(t.key, t.clipped));
  const summary: string[] = [];

  for (const lod of LODS) {
    const topo = buildLodTopology(lod, lod === 'low' ? land110.fc : land50.fc, lod === 'low' ? low : detailed);
    await writeJson(path.join(OUT, `land-${lod}.topo.json`), subTopology(topo, 'land', topo.objects.land.geometries));
    const byKey = new Map(topo.objects.territories.geometries.map((g) => [g.id as string, g]));
    for (const [entityId, keys] of byEntity) {
      // 간략 단계(1:110m)에는 작은 섬이 없어 도형이 비는 나라가 있다 (예: 제주의 탐라총관부).
      // 앱이 파일을 찾다 실패하지 않도록 비어 있어도 파일을 만든다. 앱은 다른 단계로 대신 그린다.
      const geometries = keys.flatMap((k) => byKey.get(k) ?? []);
      await writeJson(path.join(OUT, 'geo', lod, `${entityId}.topo.json`), subTopology(topo, 'territories', geometries));
    }
    summary.push(`${lod} ${countPoints(topo).toLocaleString()}점`);
    if (TILED_LODS.includes(lod)) await writeTiled(lod, topo, byEntity);
  }
  return summary.join(' · ');
}

/** 격자 조각을 만드는 단계. low는 넓게 볼 때만 쓰여 건너뛸 조각이 없으므로 만들지 않는다 */
const TILED_LODS: Lod[] = ['mid', 'high'];

/** 확대했을 때 쓰는 격자 조각 파일 (DESIGN.md §3.2) */
async function writeTiled(lod: Lod, topo: ReturnType<typeof buildLodTopology>, byEntity: Map<string, string[]>) {
  const land = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;
  const landPolygons = land.features.flatMap((f) => toMulti(f.geometry));
  await writeJson(path.join(OUT, `land-tiled-${lod}.topo.json`), tiledTopology(tilePolygons(landPolygons), chunkOutlines(landPolygons)));

  const territories = feature(topo, topo.objects.territories) as FeatureCollection<Polygon | MultiPolygon>;
  const byKey = new Map(territories.features.map((f) => [String(f.id), toMulti(f.geometry)]));
  for (const [entityId, keys] of byEntity) {
    const tiles = keys.flatMap((k) => (byKey.has(k) ? tilePolygons(byKey.get(k)!, k) : []));
    const lines = keys.flatMap((k) => (byKey.has(k) ? chunkOutlines(byKey.get(k)!, k) : []));
    await writeJson(path.join(OUT, 'geo-tiled', lod, `${entityId}.topo.json`), tiledTopology(tiles, lines));
  }
}

/** 이미 검사한 영토 버전 쌍. 같은 쌍이 여러 구간에 걸쳐 있어도 한 번만 검사하고 보고한다. */
const checkedPairs = new Set<string>();

function checkOverlaps(intervalTerritories: ClippedTerritory[], from: number) {
  for (let i = 0; i < intervalTerritories.length; i++)
    for (let j = i + 1; j < intervalTerritories.length; j++) {
      const [a, b] = [intervalTerritories[i], intervalTerritories[j]];
      const pair = `${a.where}|${b.where}`;
      if (checkedPairs.has(pair) || !bboxIntersects(a.box, b.box)) continue;
      checkedPairs.add(pair);
      const overlap = areaKm2(intersect(a.clipped, b.clipped));
      if (overlap > OVERLAP_TOLERANCE_KM2)
        errors.push(`${from}년: ${a.entityId}와 ${b.entityId}의 영토가 약 ${Math.round(overlap)}km² 겹침 (${a.where}, ${b.where})`);
    }
}

// ── 출력 ─────────────────────────────────────────────────

/** 지도가 바뀌는 연도로 나눈 구간. 겹침 검사와 "이전/다음 변화" 이동에 쓴다. */
function buildIntervals(territories: ClippedTerritory[]) {
  const [start, end] = RANGE;
  const bounds = new Set<number>([start, end + 1]);
  for (const t of territories) {
    if (t.from > start && t.from <= end) bounds.add(t.from);
    if (t.to !== null && t.to > start && t.to <= end) bounds.add(t.to);
  }
  const sorted = [...bounds].sort((a, b) => a - b);
  const intervals = sorted.slice(0, -1).map((from) => ({ from, members: territories.filter((t) => active(t, from)) }));
  return { intervals, changeYears: sorted.slice(1, -1) };
}

function colorFor(entity: Entity, index: number): string {
  return entity.color ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

async function writeJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(value));
}

async function main() {
  const entityList = (await Promise.all((await listFiles(path.join(DATA, 'entities'), '.yaml')).map((f) => readYamlList(f, EntitySchema)))).flat();
  const entities = new Map<string, Entity>();
  for (const e of entityList) {
    if (entities.has(e.id)) errors.push(`나라 id 중복: ${e.id}`);
    entities.set(e.id, e);
  }
  const relations = await readYamlList(path.join(DATA, 'relations.yaml'), RelationSchema);
  const events = (await Promise.all((await listFiles(path.join(DATA, 'events'), '.yaml')).map((f) => readYamlList(f, EventSchema)))).flat();
  const territories = await readTerritories();

  checkIntegrity(entities, territories, events, relations);
  checkArrowAnchors(events, territories);
  if (errors.length) return finish();

  const [land50, land110] = await Promise.all([loadLand('50m'), loadLand('110m')]);
  const clipped = clipAll(territories, land50);
  const { intervals, changeYears } = buildIntervals(clipped);
  for (const interval of intervals) checkOverlaps(interval.members, interval.from);
  if (errors.length) return finish();

  if (CHECK_ONLY) {
    console.log(`check:data  이상 없음 (나라 ${entities.size} · 영토 ${clipped.length} · 사건 ${events.length})`);
    return finish();
  }

  await rm(OUT, { recursive: true, force: true });
  const lodSummary = await writeLods(clipped, land50, land110);

  const timeline: TimelineIndex = { range: RANGE, changeYears };
  const index: TerritoryIndexEntry[] = [...clipped]
    .sort((a, b) => a.from - b.from || a.entityId.localeCompare(b.entityId))
    .map(({ key, entityId, from, to, certainty, anchor, box }) => ({ key, entityId, from, to, certainty, anchor, bbox: box }));

  await writeJson(path.join(OUT, 'timeline.json'), timeline);
  await writeJson(path.join(OUT, 'territories.json'), index);
  await writeJson(path.join(OUT, 'entities.json'), entityList.map((e, i) => ({ ...e, color: colorFor(e, i) })));
  await writeJson(path.join(OUT, 'relations.json'), relations);
  await writeJson(path.join(OUT, 'events.json'), [...events].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id)));

  console.log(`build:data  나라 ${entities.size} · 영토 ${clipped.length} · 사건 ${events.length} · ${lodSummary}`);
  finish();
}

function finish() {
  for (const w of new Set(warnings)) console.warn(`  경고: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`  오류: ${e}`);
    console.error(`build:data 실패 (오류 ${errors.length}건)`);
    process.exit(1);
  }
}

await main();
