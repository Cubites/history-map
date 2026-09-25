// 데이터 빌드 (DESIGN.md §5.3). P0 단계에서는 기본 지도만 public/data/로 복사한다.
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const outDir = path.join(root, 'public/data/base');

await mkdir(outDir, { recursive: true });
await copyFile(
  require.resolve('world-atlas/land-50m.json'),
  path.join(outDir, 'land-50m.topo.json'),
);
console.log('build:data  base/land-50m.topo.json');
