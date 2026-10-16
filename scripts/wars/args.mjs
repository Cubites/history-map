// 전쟁 생성기 명령줄 처리: `[저장소 경로] [--out 폴더] [--only 이름,...]`. 가볍게 읽히도록 엔진(engine.mjs)과 따로 둔다(index.mjs도 씀).
import path from 'node:path';

/** 이 스크립트가 든 저장소 (scripts/wars/engine.mjs의 두 단계 위) */
export const SCRIPT_REPO = path.resolve(import.meta.dirname, '..', '..');

/** `[저장소 경로] [--out 폴더] [--only 이름,...]`을 읽는다. 모르는 옵션이나 폴더 둘 이상은 오류 */
export function parseArgs(argv) {
  const a = { repo: null, out: null, only: null };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--out' || v === '--only') {
      const val = argv[++i];
      if (!val || val.startsWith('--')) throw new Error(`${v} 뒤에 값이 필요합니다`);
      if (v === '--out') a.out = path.resolve(val);
      else a.only = [...(a.only ?? []), ...val.split(',').filter(Boolean)];
    } else if (v.startsWith('-')) throw new Error(`모르는 옵션: ${v}`);
    else if (a.repo) throw new Error(`저장소 경로는 하나만 줍니다: ${a.repo} ${v}`);
    else a.repo = path.resolve(v);
  }
  return a;
}
