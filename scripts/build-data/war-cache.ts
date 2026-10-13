// 전쟁 장면 계산 캐시 (세션 T, 2026-10-13): wars.ts의 buildWars가 장면(스냅샷)마다 하는 polyclip 합·차·교 계산 결과를 .cache/build-data-wars/에 둔다.
// 전쟁 장면 계산은 build:data의 가장 큰 몫(world-war-2 약 245초, 전체 약 5분)이고 장면끼리 서로 독립이므로, 바뀌지 않은 장면은 다시 계산하지 않는다.
// - 열쇠 = 장면 정의(split·areas, 설명글·화살표·표시는 제외) + 전역의 replaces·bounds·simplify +진영(id→나라) + 그 장면이 쓰는 나라 영토의 내용 열쇠(cache.ts의 keyOf)
//   + 손그림 geojson 파일 내용 해시 + 장면을 자를 때 쓰는 육지 자료의 내용 열쇠(빌드마다 한 번, wars.ts가 geo.land로 만듦: 육지 파일·그것을 읽는 tasks.ts의 loadLand·topojson-client 판·index.ts가 고르는 축척이 바뀌면 열쇠도 바뀜)
//   + 코드 판(wars.ts·geo.ts·war-cache.ts 원문, polyclip-ts·bignumber.js·splaytree-ts·polylabel·topojson-server·topojson-client 판, Node 판)
// - 전역 범위(replaces 나라 영토의 합)도 따로 캐시한다(split이 있는 장면에서만 쓰임)
// - cache.ts의 캐시(.cache/build-data/)와 따로 둔다: 이 파일들은 cache.ts·tasks.ts·geo.ts·worker.ts의 원문을 열쇠에 담지 않으므로 그 파일을 고쳐도 영향을 받지 않고,
//   반대로 이 파일을 고쳐도 해안선 자르기·겹침 캐시(744MB)는 그대로다
// - 캐시는 지워도 된다(다시 계산할 뿐). 환경 변수 HISTORY_MAP_CACHE=0이면 읽지도 쓰지도 않는다(cache.ts와 같음). 결과는 캐시가 있을 때와 같다
// - 캐시 파일은 'WSC1' + 내용(v8 직렬화)의 sha256 + 내용이라 깨진 파일은 없는 것으로 보고 다시 계산한다
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deserialize, serialize } from 'node:v8';
import { hashOf } from './cache.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(HERE, '../../.cache/build-data-wars');
const require = createRequire(import.meta.url);

/** 패키지 판: 그 패키지 파일에서 위로 올라가며 package.json을 찾는다 (cache.ts의 packageId와 같은 방법) */
function packageVersion(name: string, file: string): string {
  for (let dir = path.dirname(file); ; dir = path.dirname(dir)) {
    try {
      const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')) as { name?: string; version?: string };
      if (pkg.name === name) return `${name}@${pkg.version}`;
    } catch {
      // 이 폴더에는 없음
    }
    if (path.dirname(dir) === dir) throw new Error(`${name}의 package.json을 찾지 못함`);
  }
}
const esm = (spec: string) => fileURLToPath(import.meta.resolve(spec));

/** 코드 판: 장면 계산 코드·패키지·육지 파일·Node가 바뀌면 열쇠가 모두 바뀐다 */
const CODE_SALT = hashOf(
  'war-cache 2',
  ...['wars.ts', 'geo.ts', 'war-cache.ts'].map((f) => readFileSync(path.join(HERE, f))),
  packageVersion('polyclip-ts', esm('polyclip-ts')),
  packageVersion('bignumber.js', createRequire(require.resolve('polyclip-ts')).resolve('bignumber.js')),
  packageVersion('splaytree-ts', createRequire(require.resolve('polyclip-ts')).resolve('splaytree-ts')),
  packageVersion('polylabel', esm('polylabel')),
  // 전역 simplify가 쓰는 토폴로지 묶기·풀기
  packageVersion('topojson-server', require.resolve('topojson-server')),
  packageVersion('topojson-client', require.resolve('topojson-client')),
  `node ${process.version}`,
);

const MAGIC = Buffer.from('WSC1');
const enabled = () => process.env.HISTORY_MAP_CACHE !== '0';
const fileOf = (key: string) => path.join(CACHE_DIR, key.slice(0, 2), `${key}.bin`);

/** 이번 실행의 적중·계산 수 (index.ts가 한 줄로 알림) */
export const stats = { sceneHit: 0, sceneMiss: 0, regionHit: 0, regionMiss: 0 };

function read(key: string): { hit: true; value: unknown } | { hit: false } {
  if (!enabled()) return { hit: false };
  let buf: Buffer;
  try {
    buf = readFileSync(fileOf(key));
  } catch {
    return { hit: false };
  }
  const body = buf.subarray(36);
  if (buf.length < 36 || !buf.subarray(0, 4).equals(MAGIC) || !buf.subarray(4, 36).equals(createHash('sha256').update(body).digest())) return { hit: false };
  return { hit: true, value: deserialize(body) };
}

function write(key: string, value: unknown) {
  if (!enabled()) return;
  const file = fileOf(key);
  const tmp = `${file}.${process.pid}-${Math.random().toString(36).slice(2)}.tmp`;
  const body = serialize(value);
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(tmp, Buffer.concat([MAGIC, createHash('sha256').update(body).digest(), body]));
    renameSync(tmp, file);
  } catch {
    try {
      unlinkSync(tmp);
    } catch {
      // 임시 파일이 없음
    }
  }
}

/** 열쇠 재료(JSON으로 적을 수 있는 값)로 열쇠를 만든다 */
export function cacheKey(kind: 'scene' | 'region', parts: unknown): string {
  return hashOf(kind, CODE_SALT, JSON.stringify(parts));
}

/** 파일 내용 해시 (없으면 'missing': 읽기 오류는 계산 쪽에서 알림) */
export function fileHash(file: string): string {
  try {
    return hashOf(readFileSync(file));
  } catch {
    return 'missing';
  }
}

/** 캐시에 있으면 그 값을, 없으면 계산해서 두고 돌려준다. kind에 따라 적중·계산 수를 센다 */
export async function cached<T>(kind: 'scene' | 'region', key: string, compute: () => Promise<T> | T): Promise<T> {
  const r = read(key);
  if (r.hit) {
    stats[`${kind}Hit`]++;
    return r.value as T;
  }
  stats[`${kind}Miss`]++;
  const value = await compute();
  write(key, value);
  return value;
}
