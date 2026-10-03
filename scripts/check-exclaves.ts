// 월경지 목록 (DESIGN.md §5.5): 나라·기간마다 같은 육지 위 본토와 떨어진 영토 조각을 모두 보여 준다.
// 사용: npm run check:exclaves [-- 최소넓이km²] (기본 5). 빌드(check:data)는 허용 목록에 없는 30km² 이상 조각만 알린다.
// 해안선 자르기는 build:data·check:data와 같은 계산(build-data/tasks.ts의 clip)이라 그 캐시를 함께 쓰고, 없는 것만 worker들에 나눠 자른다 (2026-10-03)
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeatureCollection } from 'geojson';
import { parse as parseYaml } from 'yaml';
import { AllowedExclaveSchema, EXCLAVE_MIN_KM2, findExclaves, formatPiece, matchExclaves } from './build-data/exclaves.ts';
import { toMulti, type MultiCoords } from './build-data/geo.ts';
import { keyOf, runCached } from './build-data/cache.ts';
import { loadLand } from './build-data/tasks.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_KM2 = Number(process.argv[2] ?? EXCLAVE_MIN_KM2);
const land = loadLand('50m').pieces;

const names = new Map<string, string>();
for (const f of readdirSync(path.join(ROOT, 'data/entities')).filter((f) => f.endsWith('.yaml')))
  for (const e of (parseYaml(readFileSync(path.join(ROOT, 'data/entities', f), 'utf8')) ?? []) as { id: string; names: { ko: string } }[]) names.set(e.id, e.names.ko);

const raw = readdirSync(path.join(ROOT, 'data/geo'))
  .filter((f) => f.endsWith('.geojson'))
  .flatMap((f) =>
    (JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as FeatureCollection).features
      .filter((ft) => ft.geometry && ft.geometry.type !== 'GeometryCollection')
      .map((ft, i) => ({
        entityId: ft.properties!.entityId as string,
        from: ft.properties!.from as number,
        to: (ft.properties!.to ?? null) as number | null,
        where: `data/geo/${f} [${i}]`,
        coords: toMulti(ft.geometry as never) as MultiCoords,
      })),
  );
const clippedAll = await runCached<MultiCoords>('clip', raw.map(({ coords }) => ({ args: { g: keyOf(coords), land: '50m' }, geoms: new Map([[keyOf(coords), coords]]) })));
const territories = raw.map(({ entityId, from, to, where }, i) => ({ entityId, from, to, where, clipped: clippedAll[i] }));

const allow = AllowedExclaveSchema.array().parse(parseYaml(readFileSync(path.join(ROOT, 'data/exclaves.yaml'), 'utf8')) ?? []);
const pieces = findExclaves(territories, land, MIN_KM2).sort((a, b) => a.entityId.localeCompare(b.entityId) || a.from - b.from);
const { allowed, unexpected, stale } = matchExclaves(pieces, allow);

console.log(`떨어진 조각 ${pieces.length}개 (허용 ${allowed.length} · 확인 필요 ${unexpected.length}, ${MIN_KM2}km² 이상)`);
for (const { piece, entry } of allowed) console.log(`  허용  ${formatPiece(piece, names.get(piece.entityId))} — ${entry.reason.slice(0, 40)}…`);
for (const p of unexpected) console.log(`  확인  ${formatPiece(p, names.get(p.entityId))}`);
for (const a of stale) console.log(`  낡음  data/exclaves.yaml ${a.entity} ${a.from}~${a.to ?? '현재'}: 맞는 조각 없음`);
