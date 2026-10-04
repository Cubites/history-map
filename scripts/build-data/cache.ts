// 데이터 빌드·검사의 계산 캐시와 병렬 처리 (DESIGN.md §5.3, 2026-10-03)
// 해안선 자르기·겹침 넓이·빈 땅 검사의 (구역, 해) 칸처럼 무겁고 서로 독립인 계산을 worker_threads로 나눠 돌리고, 결과를 입력 해시 열쇠로 .cache/build-data/에 둔다.
// - 같은 입력이면 다시 계산하지 않는다: build:data·check:data·check:exclaves가 같은 영토를 같은 육지로 자르는 일, gen:geo 뒤 바뀌지 않은 나라의 계산
// - 계산 함수(tasks.ts)는 같은 입력에 늘 같은 값을 돌려주는 순수 함수이고, 결과는 입력 순서대로 돌려준다. 그래서 캐시가 있든 없든, worker가 몇 개든 결과가 같다
// - 열쇠: 계산 이름 + 입력(도형은 내용 해시) + 코드 판(CODE_SALT: 계산 코드 원문, 쓰는 패키지의 판과 파일 해시, 육지 파일 해시, Node 판, 숫자 표기 로캘).
//   이 가운데 하나라도 바뀌면 다시 계산한다. 캐시 파일은 내용 해시를 머리에 두어 깨진 파일은 다시 계산한다
// - 캐시는 지워도 된다(다시 계산할 뿐). 오래된 항목은 지우지 않으므로 커지면 .cache/build-data/를 지운다
// - 환경 변수 HISTORY_MAP_CACHE=0이면 캐시를 읽지도 쓰지도 않고 모두 계산한다(2026-10-05. 결과는 캐시가 있을 때와 같다)
// - worker가 오류·exit로 멈추거나 WORKER_STALL_MS 동안 끝난 계산이 없으면 나머지 worker를 모두 끝내고 오류로 멈춘다(2026-10-05. 전에는 남은 worker가 남은 계산을 다 할 때까지 기다렸다)
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deserialize, serialize } from 'node:v8';
import { Worker } from 'node:worker_threads';
import { TASKS, type TaskName } from './tasks.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(HERE, '../../.cache/build-data');
const require = createRequire(import.meta.url);

export function hashOf(...parts: (string | Uint8Array)[]): string {
  const h = createHash('sha256');
  for (const p of parts) h.update(p).update('\0');
  return h.digest('hex');
}

/** 패키지 판과 파일 해시: 그 패키지의 파일(files의 첫째)에서 위로 올라가며 package.json을 찾는다(package.json을 exports에 두지 않은 패키지도 있음) */
function packageId(name: string, files: string[]): string {
  for (let dir = path.dirname(files[0]); ; dir = path.dirname(dir)) {
    try {
      const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')) as { name?: string; version?: string };
      if (pkg.name === name) return `${name}@${pkg.version} ${files.map((f) => hashOf(readFileSync(f))).join(' ')}`;
    } catch {
      // 이 폴더에는 없음
    }
    if (path.dirname(dir) === dir) throw new Error(`${name}의 package.json을 찾지 못함`);
  }
}
const esm = (spec: string) => fileURLToPath(import.meta.resolve(spec));
const bignumberCjs = createRequire(require.resolve('polyclip-ts')).resolve('bignumber.js');
// polyclip-ts가 쓰는 splaytree-ts (2026-10-05에 더함): require 쪽(dist/cjs)과 import 쪽(dist/esm) 파일
const splaytreeCjs = createRequire(require.resolve('polyclip-ts')).resolve('splaytree-ts');

/** 코드 판: 계산 코드·패키지·육지 파일·Node·로캘이 바뀌면 열쇠가 모두 바뀐다 */
const CODE_SALT = hashOf(
  'build-data cache 3',
  ...['cache.ts', 'tasks.ts', 'geo.ts', 'worker.ts'].map((f) => readFileSync(path.join(HERE, f))),
  packageId('polyclip-ts', [esm('polyclip-ts')]),
  packageId('bignumber.js', [bignumberCjs, path.join(path.dirname(bignumberCjs), 'bignumber.mjs')]),
  packageId('splaytree-ts', [splaytreeCjs, path.join(path.dirname(splaytreeCjs), '../esm/index.js')]),
  packageId('polylabel', [esm('polylabel')]),
  packageId('topojson-client', [esm('topojson-client')]),
  packageId('world-atlas', [require.resolve('world-atlas/land-50m.json'), require.resolve('world-atlas/land-110m.json')]),
  `node ${process.version}`,
  // 빈 땅 검사 글(gapsZone)은 toLocaleString으로 쓴 숫자를 담는다
  `locale ${new Intl.NumberFormat().resolvedOptions().locale} ${(1234567.5).toLocaleString()}`,
);

/**
 * 도형(중첩 배열)의 내용 열쇠: 배열 모양(길이)과 수(float64)를 따로 모아 해시한다.
 * v8 직렬화는 배열의 내부 표현에 따라 바이트가 달라 같은 값이라도 열쇠가 달라질 수 있어 쓰지 않는다. 같은 객체는 한 번만 계산한다(도형은 만든 뒤 고치지 않는다)
 */
const keys = new WeakMap<object, string>();
/** 도형의 수 개수 (계산이 무거운 순서로 나눠 주는 데 쓴다) */
const sizes = new WeakMap<object, number>();
export function keyOf(value: object): string {
  let k = keys.get(value);
  if (k) return k;
  const shape: number[] = [];
  const nums: number[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      shape.push(v.length);
      for (const x of v) walk(x);
    } else if (typeof v === 'number') {
      shape.push(-1);
      nums.push(v);
    } else throw new Error(`도형 열쇠: 수나 배열이 아닌 값 ${JSON.stringify(v)}`);
  };
  walk(value);
  k = hashOf(new Uint8Array(Int32Array.from(shape).buffer), new Uint8Array(Float64Array.from(nums).buffer));
  keys.set(value, k);
  sizes.set(value, nums.length);
  return k;
}

/** 계산 하나: 입력(args)은 JSON으로 적을 수 있는 값이고, 도형은 geoms에 열쇠로 넣고 args에서는 그 열쇠로 가리킨다 */
export interface Job {
  args: unknown;
  /** args가 가리키는 도형: 열쇠 → 도형 */
  geoms: Map<string, unknown>;
}

// 캐시 파일: 'BDC1' + 내용(v8 직렬화)의 sha256(32바이트) + 내용. 머리가 맞지 않으면(깨진 파일·다른 형식) 없는 것으로 보고 다시 계산해 덮어쓴다
const MAGIC = Buffer.from('BDC1');
const fileOf = (key: string) => path.join(CACHE_DIR, key.slice(0, 2), `${key}.bin`);
function readCache(key: string): { hit: true; value: unknown } | { hit: false } {
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
function writeCache(key: string, value: unknown) {
  const file = fileOf(key);
  // 다른 프로세스가 반쯤 쓴 파일을 읽지 않게 임시 이름으로 쓰고 옮긴다. 못 쓰면(동시에 쓰는 프로세스가 있는 Windows 등) 임시 파일을 지우고 결과만 쓴다
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

/**
 * 병렬 worker 수: 환경 변수 HISTORY_MAP_WORKERS(0이면 worker 없이 주 스레드에서 계산), 없으면 min(8, 논리 프로세서 수). 주 스레드는 나눠 주고 기다리기만 한다.
 * worker마다 육지·영토를 따로 들고 있어 메모리를 많이 쓴다(차가운 build:data에서 worker 8개 약 3GB)
 */
function workerCount(jobs: number): number {
  const v = process.env.HISTORY_MAP_WORKERS;
  let n = Math.min(8, availableParallelism());
  if (v !== undefined && v !== '') {
    if (!/^\d+$/.test(v)) throw new Error(`HISTORY_MAP_WORKERS는 0 이상의 정수여야 함: ${JSON.stringify(v)}`);
    n = Number(v);
  }
  return Math.min(n, jobs);
}

/** 캐시를 쓰는지 (2026-10-05): 환경 변수 HISTORY_MAP_CACHE가 0이면 읽지도 쓰지도 않고 모두 계산한다. 없거나 비었거나 1이면 쓴다 */
function cacheEnabled(): boolean {
  const v = process.env.HISTORY_MAP_CACHE;
  if (v === undefined || v === '' || v === '1') return true;
  if (v === '0') return false;
  throw new Error(`HISTORY_MAP_CACHE는 0(캐시를 쓰지 않음)이나 1이어야 함: ${JSON.stringify(v)}`);
}

/**
 * worker들이 이 시간 동안 계산을 하나도 끝내지 못하면 죽었거나 멈춘 것으로 보고 모든 worker를 끝내고 오류로 멈춘다(lib.mjs의 병렬 미리 계산과 같은 3분).
 * 지금 가장 무거운 빈 땅 검사 칸(유럽)은 약 4~6초에 끝난다(2026-10-05 잼). 멈춘 worker가 있어도 다른 worker가 남은 계산을 다 한 뒤 이 시간이 지나면 멈춘다
 */
const WORKER_STALL_MS = 3 * 60 * 1000;

/** runCached가 더해 가는 수: 캐시에서 읽은 계산(hits)과 새로 한 계산(computed) */
export interface RunStats {
  hits: number;
  computed: number;
}

/**
 * 계산(task)을 입력마다 하고 결과를 입력 순서대로 돌려준다. 캐시에 있으면 읽고, 없는 것만 worker들에 나눠 계산한 뒤 캐시에 쓴다.
 * extraKey: 입력 밖에서 결과를 정하는 것. stats를 주면 캐시에서 읽은 수와 계산한 수를 더한다
 */
export async function runCached<T>(task: TaskName, jobs: Job[], extraKey = '', stats?: RunStats): Promise<T[]> {
  const useCache = cacheEnabled();
  const out: T[] = new Array(jobs.length);
  const misses: { i: number; key: string }[] = [];
  jobs.forEach((job, i) => {
    const key = hashOf(CODE_SALT, task, extraKey, JSON.stringify(job.args));
    const c = useCache ? readCache(key) : { hit: false as const };
    if (c.hit) out[i] = c.value as T;
    else misses.push({ i, key });
  });
  if (stats) {
    stats.hits += jobs.length - misses.length;
    stats.computed += misses.length;
  }
  if (!misses.length) return out;
  const save = (key: string, value: unknown) => {
    if (useCache) writeCache(key, value);
  };
  const n = workerCount(misses.length);
  if (n === 0) {
    // worker 없이 주 스레드에서 같은 함수로 계산한다(주 스레드 계산이라 3분 멈춤 한도는 없다)
    for (const { i, key } of misses) {
      const job = jobs[i];
      const value = (TASKS[task] as (args: never, get: (k: string) => unknown) => unknown)(job.args as never, (k) => job.geoms.get(k));
      out[i] = value as T;
      save(key, value);
    }
    return out;
  }
  // 큰 도형을 다루는 계산부터 나눠 준다(끝에 큰 계산 하나만 남아 기다리지 않게). 결과는 입력 순서대로 놓으므로 순서는 결과에 영향이 없다
  const weight = (i: number) => [...jobs[i].geoms.values()].reduce((s: number, g) => s + (g && typeof g === 'object' ? (sizes.get(g) ?? 0) : 0), 0);
  const weights = new Map(misses.map((m) => [m, weight(m.i)]));
  misses.sort((a, b) => weights.get(b)! - weights.get(a)! || a.i - b.i);
  let next = 0;
  await new Promise<void>((resolve, reject) => {
    const workers: Worker[] = [];
    const ended: Promise<number>[] = [];
    let running = n;
    let failed = false;
    let stall: ReturnType<typeof setTimeout> | undefined;
    // 하나라도 실패하면 나머지 worker도 바로 끝낸다(남은 계산을 다 할 때까지 기다리지 않음)
    const fail = (e: Error) => {
      if (failed) return;
      failed = true;
      clearTimeout(stall);
      for (const w of workers) void w.terminate();
      console.error(`경고: ${task} 계산을 멈춤: ${e.message}`);
      reject(e);
    };
    const armStall = () => {
      clearTimeout(stall);
      stall = setTimeout(() => fail(new Error(`${task}: ${WORKER_STALL_MS / 60000}분 동안 끝난 계산이 없어 기다림을 그만둠(worker가 메모리 부족 등으로 죽었을 수 있음). 환경 변수 HISTORY_MAP_WORKERS=0이면 worker 없이 돈다`)), WORKER_STALL_MS);
    };
    armStall();
    for (let w = 0; w < n; w++) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url));
      workers.push(worker);
      const sent = new Set<string>();
      let current: { i: number; key: string } | null = null;
      let finished = false;
      const feed = () => {
        if (failed) return;
        if (next >= misses.length) {
          finished = true;
          current = null;
          ended.push(worker.terminate());
          if (--running === 0) {
            clearTimeout(stall);
            void Promise.all(ended).then(() => resolve());
          }
          return;
        }
        current = misses[next++];
        const job = jobs[current.i];
        // 이 worker에 아직 보내지 않은 도형만 보낸다(육지·영토를 여러 계산이 함께 씀)
        const geoms: [string, unknown][] = [];
        for (const [k, g] of job.geoms) if (!sent.has(k)) {
          sent.add(k);
          geoms.push([k, g]);
        }
        worker.postMessage({ task, args: job.args, geoms });
      };
      worker.on('message', (m: { ok: true; value: unknown } | { ok: false; error: string }) => {
        if (failed) return;
        if (!m.ok) return fail(new Error(`${task} 계산 실패: ${m.error}`));
        out[current!.i] = m.value as T;
        save(current!.key, m.value);
        armStall();
        feed();
      });
      worker.on('error', (e: Error) => fail(e));
      // 결과를 보내지 않고 끝난 worker(exit·메모리 부족 등)는 실패로 본다
      worker.on('exit', (code) => {
        if (!finished) fail(new Error(`${task} 계산 worker가 결과 없이 끝남 (코드 ${code}). 환경 변수 HISTORY_MAP_WORKERS=0이면 worker 없이 돈다`));
      });
      feed();
    }
  });
  return out;
}
