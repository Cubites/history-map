import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/** 손잡이를 이만큼(px) 넘게 움직여야 끌기로 친다. 그보다 짧으면 누름(펼치기·접기 바꾸기) */
const DRAG_MIN = 5;
/** 손을 뗄 때 이만큼(px) 넘게 끌었으면 그 방향으로 펼치거나 접는다. 아니면 끌기 전 상태로 돌아간다 */
const SNAP = 30;
/** 펼쳤을 때 패널 위 끝과 지도 위 검색창 아래 끝 사이 간격(px) */
const GAP_BELOW_SEARCH = 8;

/**
 * 휴대폰 아래 나라 정보 패널을 끌어 올리는 판(바텀 시트)으로 (2026-10-28, DESIGN.md §6.5).
 * 접힌 높이는 손잡이 + 나라 이름란([data-sheet-head])이고, 손잡이를 위로 끌면 지도 위 검색창 아래까지 펼쳐진다.
 * 아래로 끌거나 검색창을 누르면 접힌다. 손잡이를 짧게 누르면 펼치기·접기를 바꾼다.
 * 높이는 CSS 변수(--sheet-peek 접힌 높이, --sheet-h 지금 높이)로만 넘기고, 휴대폰 CSS(.panel.sheet)가 높이와 음수 위 여백을 같이 바꿔
 * 흐름 속 크기는 늘 접힌 높이 그대로다. 그래서 펼쳐도 지도 크기가 바뀌지 않고 패널이 지도 위를 덮는다. PC에서는 CSS가 이 변수를 쓰지 않는다
 */
export function useBottomSheet(active: boolean, contentKey: unknown) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ y: number; h: number; moved: boolean; open: boolean } | null>(null);
  const suppressClick = useRef(false);

  const peekOf = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--sheet-peek')) || el.offsetHeight;
  // 펼친 높이: 패널 아래 끝(흐름 속 자리라 펼쳐도 그대로)에서 지도 위 검색창 아래 끝 + 간격까지
  const openHeight = (el: HTMLElement) => {
    const search = document.querySelector('.map-search')?.getBoundingClientRect();
    return search ? Math.max(peekOf(el), Math.round(el.getBoundingClientRect().bottom - search.bottom - GAP_BELOW_SEARCH)) : peekOf(el);
  };

  // 접힌 높이 = 손잡이 + 나라 이름란 높이. 이름이 두 줄이 되는 등 이름란 크기가 바뀌면 다시 잰다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const head = el.querySelector<HTMLElement>('[data-sheet-head]');
    const handle = el.querySelector<HTMLElement>('.sheet-handle');
    const measure = () => el.style.setProperty('--sheet-peek', `${Math.ceil((handle?.offsetHeight ?? 0) + (head?.offsetHeight ?? 0) + 6)}px`);
    measure();
    const ro = new ResizeObserver(measure);
    if (head) ro.observe(head);
    return () => ro.disconnect();
  }, [active, contentKey]);

  // 펼침·접힘을 패널에 반영한다. 화면 크기가 바뀌면 펼친 높이를 다시 잰다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active || !open) {
      el.style.removeProperty('--sheet-h');
      el.dataset.sheet = 'closed';
      el.scrollTop = 0;
      return;
    }
    const place = () => el.style.setProperty('--sheet-h', `${openHeight(el)}px`);
    place();
    el.dataset.sheet = 'open';
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active, open]);

  // 전쟁 보기로 바뀌면(패널이 지도 위로 감) 접는다
  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);

  // 검색창을 누르면 접는다(검색 결과가 패널에 가리지 않게)
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.closest('.map-search')) setOpen(false);
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || !active || e.button !== 0) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 포인터를 붙잡지 못해도 손잡이 위에서의 끌기는 그대로 된다
      }
      drag.current = { y: e.clientY, h: el.offsetHeight, moved: false, open };
    },
    [active, open],
  );
  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
    const dy = d.y - e.clientY;
    if (!d.moved && Math.abs(dy) <= DRAG_MIN) return;
    d.moved = true;
    el.dataset.sheet = 'drag';
    el.style.setProperty('--sheet-h', `${Math.min(openHeight(el), Math.max(peekOf(el), d.h + dy))}px`);
  }, []);
  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    const d = drag.current;
    drag.current = null;
    if (!el || !d || !d.moved) return;
    suppressClick.current = true;
    const dy = d.y - e.clientY;
    const next = dy > SNAP ? true : dy < -SNAP ? false : d.open;
    // 같은 상태로 돌아가도 끌던 높이를 지우도록 반영을 다시 일으킨다
    setOpen(next);
    el.dataset.sheet = next ? 'open' : 'closed';
    if (next) el.style.setProperty('--sheet-h', `${openHeight(el)}px`);
    else {
      el.style.removeProperty('--sheet-h');
      el.scrollTop = 0;
    }
  }, []);
  const onClick = useCallback(() => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setOpen((v) => !v);
  }, []);

  return { ref, open, handleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClick } };
}
