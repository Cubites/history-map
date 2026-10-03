// cache.ts의 runCached가 띄우는 worker (2026-10-03): 받은 계산을 tasks.ts의 함수로 하고 결과를 돌려준다.
// 도형은 열쇠로 받아 두고 다음 계산에서도 쓴다(같은 육지·영토를 여러 계산이 함께 씀)
import { parentPort } from 'node:worker_threads';
import { TASKS, type TaskName } from './tasks.ts';

const geoms = new Map<string, unknown>();
const get = (key: string) => {
  if (!geoms.has(key)) throw new Error(`받지 않은 도형 ${key}`);
  return geoms.get(key);
};
parentPort!.on('message', ({ task, args, geoms: added }: { task: TaskName; args: never; geoms: [string, unknown][] }) => {
  for (const [k, g] of added) geoms.set(k, g);
  try {
    parentPort!.postMessage({ ok: true, value: TASKS[task](args, get) });
  } catch (e) {
    parentPort!.postMessage({ ok: false, error: String((e as Error).stack ?? e) });
  }
});
