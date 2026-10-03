// 국경 생성기 공통 기반 (DESIGN.md §5.2, 층 0): polyclip-ts 불러오기, 도형 도우미, 행정구역 조각 불러오기와 합치기.
// 가져와도 되는 것: node 내장 모듈과 topojson-client(조각 합치기)뿐. 생성기의 다른 파일(shared·engine·권역 파일)은 polyclip·도우미·조각을 모두 여기서 가져다 쓴다.
// polyclip은 이 파일에서 한 번만 불러온다(이 파일 위치 기준으로 찾음). 프로젝트 폴더와 명령줄 인자는 모른다(진입 파일이 정함).
// 그래서 다른 스크립트도 인자와 상관없이 권역 파일을 import할 수 있다.
// polyclip.setPrecision은 부르지 않는다: polyclip-ts 0.16.8의 precision.reset()은 아무 일도 하지 않아, 한 번 켜면 전역 스냅이 남고 계산 순서에 따라 결과가 달라진다.
// 반환 모양: ring·bx는 닫힌 링, box는 [링](폴리곤), P는 [[링]](멀티폴리곤), U·D·I와 union은 polyclip 결과(멀티폴리곤), F는 조각을 합친 멀티폴리곤
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { availableParallelism } from 'node:os';
import { env, version as nodeVersion } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deserialize, serialize } from 'node:v8';
import { Worker, isMainThread, workerData } from 'node:worker_threads';
import { feature, merge } from 'topojson-client';

const require = createRequire(import.meta.url);
const polyclipFile = require.resolve('polyclip-ts');
const polyclipRaw = await import(pathToFileURL(polyclipFile).href);

// ── 연산 메모 (2026-10-03) ─────────────────────────────────
// polyclip의 합집합·차집합·교집합 결과를 입력 열쇠로 .cache/geo-ops/에 저장해 두고, 같은 입력이면 다시 계산하지 않고 읽는다.
// polyclip-ts는 같은 입력에 늘 같은 결과를 내므로(전역 스냅을 켜지 않음, 위 setPrecision 참고) 읽은 결과는 계산한 결과와 값이 같다(v8 직렬화라 -0까지 같음).
// 그래서 gen:geo·check:generator(생성기를 여러 번 돎)·check:gaps(권역 파일을 import함)가 같은 계산을 되풀이하지 않고, 권역 파일 하나를 고치면 그 영향을 받는 연산만 다시 계산한다.
// 열쇠: 도형 객체마다 하나. 연산 결과는 '연산 이름 + 입력 열쇠'의 해시(결과를 보지 않고 정해짐), 조각 합치기(F)·권역 바깥선은 '조각 파일 해시 + 조각 id',
// 그 밖의 배열(손으로 적은 링 등)은 내용(배열 모양과 float64 값)의 해시다. 열쇠는 객체마다 한 번 정하므로 도형은 만든 뒤 고치지 않는다(지금 생성기는 고치지 않음).
// 모든 열쇠에 계산 코드의 판(OPS_SALT: 이 파일 원문, polyclip-ts·bignumber.js·topojson-client의 판과 불러오는 파일 원문, Node 판)이 들어가므로
// 그 가운데 하나라도 바뀌면 캐시를 쓰지 않고 다시 계산한다. 캐시 파일은 내용 해시를 머리에 두어 깨진 파일은 다시 계산한다.
// 캐시는 지워도 결과가 같다(다시 계산할 뿐). 오래된 항목은 지우지 않으므로 커지면 .cache/geo-ops/를 지운다.
const OPS_FORMAT = 2;
const OPS_DIR = fileURLToPath(new URL('../../.cache/geo-ops/', import.meta.url));
const hash = (...parts) => {
  const h = createHash('sha256');
  for (const p of parts) h.update(p).update('\0');
  return h.digest('hex');
};
// 패키지 판: package.json을 exports에 두지 않은 패키지가 있어, 불러올 파일에서 위로 올라가며 그 이름의 package.json을 찾는다.
// '이름@판 파일 해시'를 돌려준다(node_modules 안의 파일을 손으로 고쳐도 열쇠가 바뀌게)
const packageId = (file, name) => {
  for (let dir = new URL('.', pathToFileURL(file)); ; dir = new URL('..', dir)) {
    try {
      const pkg = JSON.parse(readFileSync(new URL('package.json', dir), 'utf8'));
      if (pkg.name === name) return `${name}@${pkg.version} ${hash(readFileSync(file))}`;
    } catch {
      // 이 폴더에는 없음
    }
    if (dir.href === new URL('..', dir).href) throw new Error(`${name}의 package.json을 찾지 못함`);
  }
};
const OPS_SALT = hash(
  `geo-ops ${OPS_FORMAT}`,
  readFileSync(new URL(import.meta.url)),
  packageId(polyclipFile, 'polyclip-ts'),
  packageId(createRequire(polyclipFile).resolve('bignumber.js'), 'bignumber.js'),
  packageId(require.resolve('topojson-client'), 'topojson-client'),
  `node ${nodeVersion}`,
);
const opKeys = new WeakMap(); // 도형 객체 → 열쇠
// 내용 열쇠: 중첩 배열의 모양(길이)과 수(float64)를 따로 모아 해시한다. v8 직렬화는 배열의 내부 표현(정수 배열·실수 배열 등)에 따라 바이트가 달라
// 같은 값이라도 계산한 배열과 캐시에서 읽은 배열의 열쇠가 달라지므로 열쇠에는 쓰지 않는다
const contentKey = (g) => {
  const shape = [];
  const nums = [];
  const walk = (v) => {
    if (Array.isArray(v)) {
      shape.push(v.length);
      for (const x of v) walk(x);
    } else if (typeof v === 'number') {
      shape.push(-1);
      nums.push(v);
    } else throw new Error(`연산 메모: 도형에 수나 배열이 아닌 값 ${JSON.stringify(v)}`);
  };
  walk(g);
  return `c${hash(OPS_SALT, new Uint8Array(Int32Array.from(shape).buffer), new Uint8Array(Float64Array.from(nums).buffer))}`;
};
// 도형의 열쇠 (worker에 도형을 보낼 때 열쇠도 함께 보내 같은 열쇠를 쓰게 한다: withOpKey)
export const opKey = (g) => {
  let k = opKeys.get(g);
  if (!k) opKeys.set(g, (k = contentKey(g)));
  return k;
};
export const withOpKey = (g, key) => {
  opKeys.set(g, key);
  return g;
};
// 캐시 파일: 'GOPS' + 내용(v8 직렬화)의 sha256(32바이트) + 내용. 머리가 맞지 않으면(깨진 파일·다른 형식) 없는 것으로 보고 다시 계산해 덮어쓴다
const MAGIC = Buffer.from('GOPS');
const opDir = (key) => `${OPS_DIR}${key.slice(0, 2)}`;
const opFile = (key) => `${opDir(key)}/${key}.bin`;
const readEntry = (file) => {
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    return { hit: false };
  }
  const body = buf.subarray(36);
  if (buf.length < 36 || !buf.subarray(0, 4).equals(MAGIC) || !buf.subarray(4, 36).equals(createHash('sha256').update(body).digest())) return { hit: false };
  return { hit: true, value: deserialize(body) };
};
const writeEntry = (key, value) => {
  // 다른 프로세스가 반쯤 쓴 파일을 읽지 않게 임시 이름으로 쓰고 옮긴다. 못 쓰면(동시에 쓰는 프로세스가 있는 Windows 등) 임시 파일을 지우고 결과만 쓴다
  const body = serialize(value);
  const file = opFile(key);
  const tmp = `${file}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  try {
    mkdirSync(opDir(key), { recursive: true });
    writeFileSync(tmp, Buffer.concat([MAGIC, createHash('sha256').update(body).digest(), body]));
    renameSync(tmp, file);
  } catch {
    try {
      unlinkSync(tmp);
    } catch {
      // 임시 파일이 없음
    }
  }
};
const memoKey = (op, geoms) => hash(OPS_SALT, op, ...geoms.map(opKey));
const memoOp = (op) => (...geoms) => {
  const key = memoKey(op, geoms);
  const entry = readEntry(opFile(key));
  let out;
  if (entry.hit) out = entry.value;
  else {
    out = polyclipRaw[op](...geoms);
    writeEntry(key, out);
  }
  opKeys.set(out, `r${key}`);
  return out;
};
// 메모에 있으면 그 결과, 없으면 undefined (계산하지 않음)
export const peekOp = (op, ...geoms) => {
  const entry = readEntry(opFile(memoKey(op, geoms)));
  return entry.hit ? entry.value : undefined;
};
// polyclip: 합집합·차집합·교집합은 연산 메모를 거치고, 나머지(xor 등)는 그대로
export const polyclip = { ...polyclipRaw, union: memoOp('union'), difference: memoOp('difference'), intersection: memoOp('intersection') };

// ── 병렬 미리 계산 (2026-10-03) ─────────────────────────────
// 서로 독립인 무거운 연산을 worker_threads로 나눠 미리 계산해 연산 메모(.cache/geo-ops/)에 넣는다. 미리 계산한 뒤 부르는 쪽은 원래 순서대로 같은 연산을 부르고
// 메모에서 읽으므로 결과·순서가 미리 계산하지 않을 때와 같다. 캐시를 못 쓰면 부르는 쪽이 그냥 계산한다(느릴 뿐 결과는 같음).
// 생성기 함수는 동기라서 worker가 끝날 때까지 Atomics.wait로 기다린다.
// runParallel(모듈 URL, 일 이름, 자료, 일 개수): 자료를 한 번 직렬화해 worker마다 넘기고, worker들은 0..개수-1의 일을 하나씩 가져가 그 모듈이 serveParallel로 등록한 함수로 한다.
// worker 수(workerCount): 환경 변수 HISTORY_MAP_WORKERS(0이면 worker를 쓰지 않음), 없으면 min(8, 논리 프로세서 수). 주 스레드는 기다리기만 한다.
// worker마다 자료를 따로 들고 있어 메모리를 많이 쓴다.
// worker가 오류로 멈추거나(모듈 오류·exit 포함) 끝난 일 없이 WORKER_STALL_MS가 지나면(메모리 부족 등) stderr에 알리고 오류로 멈춘다.
const WORKER_STALL_MS = 3 * 60 * 1000;
export function workerCount() {
  const v = env.HISTORY_MAP_WORKERS;
  if (v !== undefined && v !== '') {
    if (!/^\d+$/.test(v)) throw new Error(`HISTORY_MAP_WORKERS는 0 이상의 정수여야 함: ${JSON.stringify(v)}`);
    return Number(v);
  }
  return Math.min(8, availableParallelism());
}
// worker 진입: 대상 모듈을 불러온 뒤(그 안의 serveParallel이 일 함수를 등록함) 일 함수를 부르고, 끝나거나 오류·exit로 멈추면 끝난 worker 수를 올린다.
// 오류는 실패 수와 첫 오류 글로 알린다. 일은 모듈을 다 불러온 뒤 한다(모듈을 불러오는 도중 exit하면 Node가 통째로 죽는 일이 있어서)
const WORKER_BOOT = `
const { workerData } = require('node:worker_threads');
const { counters, message } = workerData;
let counted = false;
const finish = (error) => {
  if (counted) return;
  counted = true;
  if (error !== undefined && Atomics.add(counters, 2, 1) === 0) message.set(Buffer.from(String(error)).subarray(0, message.length - 1));
  Atomics.add(counters, 1, 1);
  Atomics.notify(counters, 1);
};
require('node:process').on('exit', (code) => finish(code === 0 ? undefined : 'worker가 코드 ' + code + '로 끝남'));
import(workerData.moduleUrl)
  .then(() => {
    const work = globalThis[Symbol.for('history-map.parallel')];
    if (typeof work !== 'function') throw new Error('일 함수가 등록되지 않음: ' + workerData.task);
    work();
  })
  .then(() => finish(), (e) => finish((e && e.stack) || e));
`;
export function runParallel(moduleUrl, task, data, count) {
  const n = Math.min(count, workerCount());
  if (n < 1 || count < 2) return;
  const bytes = serialize(data);
  const shared = new SharedArrayBuffer(bytes.length);
  new Uint8Array(shared).set(bytes);
  // [가져간 일, 끝난 worker, 실패한 worker, (빈칸), 끝난 일]
  const counters = new Int32Array(new SharedArrayBuffer(5 * 4));
  const message = new Uint8Array(new SharedArrayBuffer(4096));
  const workers = Array.from({ length: n }, () => new Worker(WORKER_BOOT, { eval: true, workerData: { moduleUrl: String(moduleUrl), task, shared, counters, message, count } }));
  let progress = '';
  let since = Date.now();
  let stalled = false;
  for (let done; (done = Atomics.load(counters, 1)) < n; ) {
    Atomics.wait(counters, 1, done, 1000);
    const now = `${Atomics.load(counters, 4)} ${Atomics.load(counters, 1)}`;
    if (now !== progress) [progress, since] = [now, Date.now()];
    else if (Date.now() - since > WORKER_STALL_MS) {
      stalled = true;
      break;
    }
  }
  for (const w of workers) void w.terminate();
  const failed = Atomics.load(counters, 2);
  if (stalled || failed) {
    const first = Buffer.from(message).toString('utf8').replace(/\0+$/, '');
    const why = stalled ? `${WORKER_STALL_MS / 60000}분 동안 끝난 일이 없어 기다림을 그만둠(worker가 메모리 부족 등으로 죽었을 수 있음)` : `worker ${failed}개가 오류로 멈춤`;
    console.error(`경고: 병렬 미리 계산(${task}) 실패: ${why}${first ? `\n${first}` : ''}`);
    throw new Error(`병렬 미리 계산(${task}) 실패: ${why}. 환경 변수 HISTORY_MAP_WORKERS=0이면 worker 없이 돈다`);
  }
}
// worker 쪽: 이 worker가 task 일을 하도록 띄워졌으면 일 함수를 등록한다. worker 진입(WORKER_BOOT)이 모듈을 다 불러온 뒤 부르고, 일 함수는 일마다 handle(자료, 번호)를 부른다.
// 오류는 그대로 던져 worker 진입이 실패로 알린다
export function serveParallel(task, handle) {
  if (isMainThread || workerData?.task !== task) return;
  globalThis[Symbol.for('history-map.parallel')] = () => serveJobs(task, handle);
}
function serveJobs(task, handle) {
  const { shared, counters, count } = workerData;
  const data = deserialize(Buffer.from(new Uint8Array(shared)));
  for (let i; (i = Atomics.add(counters, 0, 1)) < count; ) {
    handle(data, i);
    Atomics.add(counters, 4, 1);
    Atomics.notify(counters, 1);
  }
}
// 연산 미리 계산: jobs = [[연산 이름, 도형...], ...]. 메모에 이미 있는 연산은 빼고 나머지를 worker들에 나눠 계산한다
export function prefetch(jobs) {
  if (workerCount() === 0) return;
  // 메모에 없는 연산만, 도형이 큰 연산부터(끝에 큰 연산 하나만 남아 기다리지 않게)
  const size = (v) => (Array.isArray(v) ? v.reduce((s, x) => s + size(x), 0) : 1);
  const todo = jobs.filter(([op, ...geoms]) => !readEntry(opFile(memoKey(op, geoms))).hit)
    .map((job) => [job, size(job.slice(1))]).sort((a, b) => b[1] - a[1]).map(([job]) => job);
  runParallel(import.meta.url, 'geo-ops', todo.map(([op, ...geoms]) => [op, ...geoms.map((g) => [opKey(g), g])]), todo.length);
}
serveParallel('geo-ops', (jobs, i) => {
  const [op, ...geoms] = jobs[i];
  polyclip[op](...geoms.map(([k, g]) => withOpKey(g, k)));
});

// 선 뒤집기, 선·점을 이어 닫힌 링 만들기
export const rev = (line) => [...line].reverse();
export const ring = (...parts) => {
  const pts = parts.flat();
  return [...pts, pts[0]];
};

// 링 하나를 멀티폴리곤으로, 링 여럿의 합집합
export const P = (r) => [[r]];
export const union = (...rings) => polyclip.union(...rings.map((r) => [r]));

// 합집합·차집합·교집합 (polyclip의 얇은 별칭)
export const U = (...geoms) => polyclip.union(...geoms);
export const D = (a, ...b) => polyclip.difference(a, ...b);
export const I = (a, b) => polyclip.intersection(a, b);

// 경위도 상자 (서, 남, 동, 북): bx는 링, box는 폴리곤
export const bx = (w, s, e, n) => ring([[w, s], [e, s], [e, n], [w, n]]);
export const box = (w, s, e, n) => [ring([[w, s], [e, s], [e, n], [w, n]])];

// 행정구역 조각 (DESIGN.md §5.2 '행정구역 조각', 2026-09-30): data/base/fragments/<권역>.topo.json(scripts/prep-fragments.mjs가 Natural Earth admin-1에서 만듦)을 읽는다.
// 권역 파일은 const { F } = loadFragments('europe')처럼 쓰고, 조각 파일을 읽는 곳은 이 함수뿐이다(check:generator가 본다).
// 파일은 처음 부를 때 한 번 읽는다. 지금 권역은 조각을 쓰지 않으므로 생성기는 이 파일을 읽지 않는다.
// - F(...ids): 조각들을 topojson-client merge로 arc 단위로 합친 멀티폴리곤. polyclip 합집합이 아니라서 부동소수 오차가 없고, 이웃 조각과 같은 꼭짓점을 쓴다.
//   좌표는 격자(소수 넷째 자리, engine.mjs의 출력 반올림과 같은 식)에 맞춰 돌려준다. 같은 조각 묶음(순서 무관)이면 같은 객체를 돌려주므로(memo) 고치지 말고 U·D·I로 새 도형을 만든다.
//   id를 주지 않거나, 모르는 id, 같은 id를 두 번 주면 멈춘다
// - ids: 조각 id 목록(파일 순서), props: id → 속성 { adm0, name, type, region?, unit? }(Natural Earth 값), domain: 권역 바깥선(모든 조각을 합친 멀티폴리곤, 격자)
// 조각은 생성기 안에서만 쓴다. level: region Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정)
const FRAGMENT_DIR = new URL('../../data/base/fragments/', import.meta.url);
const fragmentSets = new Map();
const onGrid = (multi) => multi.map((poly) => poly.map((r) => r.map(([x, y]) => [Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4])));
const multiOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : []);
export function loadFragments(name) {
  const loaded = fragmentSets.get(name);
  if (loaded) return loaded;
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`조각 권역 이름이 알맞지 않음: ${JSON.stringify(name)}`);
  let topo, text;
  try {
    text = readFileSync(new URL(`${name}.topo.json`, FRAGMENT_DIR), 'utf8');
    topo = JSON.parse(text);
  } catch (e) {
    throw new Error(`조각 파일을 읽지 못함: data/base/fragments/${name}.topo.json (${e.message}). npm run prep:fragments로 만든다`);
  }
  const t = topo?.transform;
  if (topo?.type !== 'Topology' || t?.scale?.[0] !== 1e-4 || t?.scale?.[1] !== 1e-4 || t?.translate?.[0] !== 0 || t?.translate?.[1] !== 0
    || topo.objects?.fragments?.type !== 'GeometryCollection' || !topo.objects?.domain) {
    throw new Error(`조각 파일 형식이 다름: data/base/fragments/${name}.topo.json (transform scale 1e-4·translate 0, objects.fragments·domain이 있어야 함)`);
  }
  const byId = new Map();
  for (const g of topo.objects.fragments.geometries) {
    if (typeof g.id !== 'string' || !g.id || byId.has(g.id)) throw new Error(`조각 id가 없거나 겹침: ${name} ${JSON.stringify(g.id)}`);
    byId.set(g.id, g);
  }
  const memo = new Map();
  // 연산 메모의 열쇠: 코드 판(OPS_SALT, 이 파일의 합치기·격자 맞추기 코드와 topojson-client 판 포함)과 조각 파일 내용의 해시 + 조각 id
  const fileKey = hash(OPS_SALT, text);
  const F = (...ids) => {
    if (!ids.length) throw new Error(`F(): 조각 id가 없음 (${name})`);
    const sorted = [...ids].sort();
    sorted.forEach((id, i) => {
      if (!byId.has(id)) throw new Error(`모르는 조각 id: ${JSON.stringify(id)} (${name})`);
      if (i && id === sorted[i - 1]) throw new Error(`같은 조각 id를 두 번 줌: ${id} (${name})`);
    });
    const key = sorted.join(' ');
    let multi = memo.get(key);
    if (!multi) {
      multi = onGrid(multiOf(merge(topo, sorted.map((id) => byId.get(id)))));
      memo.set(key, multi);
      opKeys.set(multi, `f${hash(fileKey, key)}`);
    }
    return multi;
  };
  const domain = onGrid(multiOf(feature(topo, topo.objects.domain).geometry));
  opKeys.set(domain, `d${fileKey}`);
  const set = {
    name,
    ids: [...byId.keys()],
    props: new Map([...byId].map(([id, g]) => [id, g.properties ?? {}])),
    domain,
    F,
  };
  fragmentSets.set(name, set);
  return set;
}
