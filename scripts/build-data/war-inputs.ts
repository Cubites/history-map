// 전쟁 결과가 '지금 입력으로 만든 것인가' 판정 (세션 T 검토 반영, 2026-10-13).
// build:data가 전쟁 결과(public/data/wars.json, wars/<id>.json)를 쓸 때 전쟁마다 {inputs, shapes, entry} 기록을 .cache/build-data-wars/built.json에 남기고,
// test:geo의 places는 같은 해시를 파일 읽기만으로(1초 안) 다시 계산해 비교한다. 파일 시각을 쓰지 않으므로 gen:geo·git checkout·복사로 시각만 바뀌어도 거짓 '오래됨'이 없고,
// 입력이 진짜 바뀌었는데 빌드를 안 했으면 잡힌다. public 출력 바이트는 이 기록과 무관하다(기록은 .cache에만 둔다).
// - inputs: 그 전쟁 YAML 파일 + YAML이 가리키는 손그림 geojson(data/wars/ 아래) + YAML이 쓰는 나라의 data/geo/<id>.geojson + 계산 코드(wars.ts·geo.ts·war-cache.ts·이 파일·tasks.ts·index.ts·src/schema/index.ts, topojson-client 판) + 육지 파일(land-50m) 내용 해시
// - shapes: public/data/wars/<id>.json 파일의 sha256, entry: wars.json 안 그 전쟁 항목(JSON.stringify)의 sha256
// 이 파일을 읽는 쪽: scripts/build-data/index.ts(쓰기), scripts/test-geo/checks/places.ts(대조)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

/** 저장소 루트 기준 기록 파일 */
export const BUILT_FILE = '.cache/build-data-wars/built.json';

export interface BuiltRecord {
  inputs: string;
  shapes: string;
  entry: string;
}
export type BuiltFile = Record<string, BuiltRecord>;

const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const fileSha = (file: string) => (existsSync(file) ? sha(readFileSync(file)) : 'missing');
export const shaOf = sha;

/** YAML 안에서 이 전쟁이 읽는 나라 id와 손그림 geojson 경로를 모은다 (replaces·entities·factions[].entity, areas[].geojson) */
function collect(node: unknown, entities: Set<string>, geojsons: Set<string>): void {
  if (Array.isArray(node)) {
    for (const v of node) collect(v, entities, geojsons);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'replaces' || k === 'entities') && Array.isArray(v)) {
        for (const id of v) if (typeof id === 'string') entities.add(id);
      } else if (k === 'entity' && typeof v === 'string') entities.add(v);
      else if (k === 'geojson' && typeof v === 'string') geojsons.add(v);
      else collect(v, entities, geojsons);
    }
  }
}

/** 전쟁 id → 입력 해시 (data/wars/*.yaml 마다) */
export function warInputHashes(root: string): Map<string, string> {
  const dir = path.join(root, 'data/wars');
  const code = ['wars.ts', 'geo.ts', 'war-cache.ts', 'war-inputs.ts', 'tasks.ts', 'index.ts'].map((f) => fileSha(path.join(root, 'scripts/build-data', f)));
  code.push(fileSha(path.join(root, 'src/schema/index.ts')), fileSha(path.join(root, 'node_modules/topojson-client/package.json')));
  const land = fileSha(path.join(root, 'node_modules/world-atlas/land-50m.json'));
  const out = new Map<string, string>();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const text = readFileSync(path.join(dir, f), 'utf8');
    let raw: unknown;
    try {
      raw = parseYaml(text);
    } catch {
      continue;
    }
    const id = (raw as { id?: unknown } | null)?.id;
    if (typeof id !== 'string') continue;
    const entities = new Set<string>();
    const geojsons = new Set<string>();
    collect(raw, entities, geojsons);
    out.set(
      id,
      sha(
        JSON.stringify([
          'war-inputs 1',
          sha(text.replace(/\r\n/g, '\n')),
          [...geojsons].sort().map((g) => [g, fileSha(path.join(dir, g))]),
          [...entities].sort().map((e) => [e, fileSha(path.join(root, 'data/geo', `${e}.geojson`))]),
          code,
          land,
        ]),
      ),
    );
  }
  return out;
}

/** 기록 파일 읽기 (없거나 깨졌으면 빈 기록) */
export function readBuilt(root: string): BuiltFile {
  try {
    const v = JSON.parse(readFileSync(path.join(root, BUILT_FILE), 'utf8')) as BuiltFile;
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
