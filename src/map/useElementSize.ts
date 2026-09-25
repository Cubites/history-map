import { useEffect, useRef, useState } from 'react';
import type { Size } from './view.ts';

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 백그라운드 탭에서 열리면 ResizeObserver가 화면에 보일 때까지 호출되지 않으므로 처음 크기는 직접 읽는다.
    const initial = el.getBoundingClientRect();
    if (initial.width > 0 && initial.height > 0) setSize({ width: initial.width, height: initial.height });
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
