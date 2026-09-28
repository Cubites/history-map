// 월경지 목록 (DESIGN.md §5.5): 나라·기간마다 같은 육지 위 본토와 떨어진 영토 조각을 모두 보여 준다.
// 사용: npm run check:exclaves [-- 최소넓이km²] (기본 5). 빌드(check:data)는 허용 목록에 없는 30km² 이상 조각만 알린다.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { parse as parseYaml } from 'yaml';
import { AllowedExclaveSchema, EXCLAVE_MIN_KM2, findExclaves, formatPiece, matchExclaves } from './build-data/exclaves.ts';
import { bbox, clipToLand, toMulti, unwrapAntimeridian, type MultiCoords } from './build-data/geo.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const MIN_KM2 = Number(process.argv[2] ?? EXCLAVE_MIN_KM2);

const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = (feature(topo, topo.objects.land) as unknown as FeatureCollection).features
  .flatMap((f) => toMulti(f.geometry as never))
  .flatMap(unwrapAntimeridian)
  .map((coords) => ({ coords, bbox: bbox([coords]) }));

const names = new Map<string, string>();
for (const f of readdirSync(path.join(ROOT, 'data/entities')).filter((f) => f.endsWith('.yaml')))
  for (const e of (parseYaml(readFileSync(path.join(ROOT, 'data/entities', f), 'utf8')) ?? []) as { id: string; names: { ko: string } }[]) names.set(e.id, e.names.ko);

const territories = readdirSync(path.join(ROOT, 'data/geo'))
  .filter((f) => f.endsWith('.geojson'))
  .flatMap((f) =>
    (JSON.parse(readFileSync(path.join(ROOT, 'data/geo', f), 'utf8')) as FeatureCollection).features
      .filter((ft) => ft.geometry && ft.geometry.type !== 'GeometryCollection')
      .map((ft, i) => ({
        entityId: ft.properties!.entityId as string,
        from: ft.properties!.from as number,
        to: (ft.properties!.to ?? null) as number | null,
        where: `data/geo/${f} [${i}]`,
        clipped: clipToLand(toMulti(ft.geometry as never), land) as MultiCoords,
      })),
  );

const allow = AllowedExclaveSchema.array().parse(parseYaml(readFileSync(path.join(ROOT, 'data/exclaves.yaml'), 'utf8')) ?? []);
const pieces = findExclaves(territories, land, MIN_KM2).sort((a, b) => a.entityId.localeCompare(b.entityId) || a.from - b.from);
const { allowed, unexpected, stale } = matchExclaves(pieces, allow);

console.log(`떨어진 조각 ${pieces.length}개 (허용 ${allowed.length} · 확인 필요 ${unexpected.length}, ${MIN_KM2}km² 이상)`);
for (const { piece, entry } of allowed) console.log(`  허용  ${formatPiece(piece, names.get(piece.entityId))} — ${entry.reason.slice(0, 40)}…`);
for (const p of unexpected) console.log(`  확인  ${formatPiece(p, names.get(p.entityId))}`);
for (const a of stale) console.log(`  낡음  data/exclaves.yaml ${a.entity} ${a.from}~${a.to ?? '현재'}: 맞는 조각 없음`);
