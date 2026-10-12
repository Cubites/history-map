// 전쟁 보기의 점령 지역 도형 (DESIGN.md §4.5). wars.json에는 도형이 없고 전쟁마다 wars/<전쟁 id>.json에 있어
// 전쟁 보기를 열 때 한 번 받는다 (2026-10-12, 세계 대전이 들어가 wars.json이 7MB가 되던 문제)
import { useEffect, useState } from 'react';
import type { WarShapesOut } from '../schema/index.ts';
import { dataUrl } from './staticData.ts';

const cache = new Map<string, Promise<WarShapesOut>>();

function loadWarShapes(warId: string): Promise<WarShapesOut> {
  let p = cache.get(warId);
  if (!p) {
    p = fetch(dataUrl(`wars/${warId}.json`)).then((res) => {
      if (!res.ok) throw new Error(`wars/${warId}.json: ${res.status} ${res.statusText}`);
      return res.json() as Promise<WarShapesOut>;
    });
    // 실패하면 다음에 다시 받을 수 있게 지운다
    p.catch(() => cache.delete(warId));
    cache.set(warId, p);
  }
  return p;
}

/** 열려 있는 전쟁의 도형. 받는 동안과 전쟁 보기가 아닐 때는 undefined */
export function useWarShapes(warId: string | null): WarShapesOut | undefined {
  const [loaded, setLoaded] = useState<{ warId: string; shapes: WarShapesOut } | null>(null);
  useEffect(() => {
    if (!warId) return;
    let alive = true;
    loadWarShapes(warId)
      .then((shapes) => alive && setLoaded({ warId, shapes }))
      .catch((e: Error) => console.error(e.message));
    return () => {
      alive = false;
    };
  }, [warId]);
  return warId && loaded?.warId === warId ? loaded.shapes : undefined;
}
