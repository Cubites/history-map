import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/** 손잡이를 이만큼(px) 넘게 움직여야 끌기로 친다. 그보다 짧으면 누름(단계 바꾸기) */
const DRAG_MIN = 5;
/** 손을 뗄 때 이만큼(px) 넘게 끌었으면 그 방향의 다음 단계로 간다. 아니면 끌기 전 단계로 돌아간다 */
const SNAP = 30;
/** 펼쳤을 때 패널 위 끝과 지도 위 검색창 아래 끝 사이 간격(px) */
const GAP_BELOW_SEARCH = 8;
/** 연도 칸을 고치는 동안(화면 키보드, MapYearControls) 키보드 때문에 생긴 화면 크기 변화로는 판 높이를 다시 재지 않는다(지도가 옮겨지지 않게) */
const keyboardHeld = () => document.documentElement.classList.contains('keyboard-hold');

/** 판의 세 단계: 내림(min, 손잡이 + 나라 이름란) · 접힘(closed, 화면 1/3) · 펼침(open, 검색창 아래까지) */
export type SheetState = 'min' | 'closed' | 'open';
const ORDER: SheetState[] = ['min', 'closed', 'open'];

/**
 * 휴대폰 아래 나라 정보 패널을 끌어 올리고 내리는 판(바텀 시트)으로 (2026-10-28, DESIGN.md §6.5).
 * 접힌 높이는 화면 높이의 1/3(2026-10-28, 이름란이 그보다 크면 손잡이 + 나라 이름란([data-sheet-head]))이고, 손잡이를 위로 끌면 지도 위 검색창 아래까지 펼쳐진다.
 * 접힌 판을 아래로 더 끌면 손잡이(슬릿 막대)와 나라 이름란만 남고 그 아래는 숨는다(2026-11-05, 같은 날 손잡이만에서 이름란까지로 고침). 그만큼 뒤의 지도가 드러난다.
 * 검색창을 누르면 펼친 판이 접힌다. 손잡이를 짧게 누르면 내림 → 접힘 → 펼침 → 접힘 순으로 바뀐다. 내린 채 다른 나라를 고르면 접힘으로 올라온다.
 * 높이는 CSS 변수(--sheet-peek 접힌 높이, --sheet-min 내린 높이, --sheet-h 지금 높이)로만 넘긴다. 휴대폰 CSS(.panel.sheet)가 높이와 같은 만큼의 음수 위 여백을 줘
 * 흐름 속 크기는 늘 0이다. 지도는 화면 아래 끝까지 깔리고 판은 그 위에 뜬다(2026-11-05: 전에는 흐름 속 크기가 판 높이를 따라 바뀌어 끄는 동안 지도가 매번 크기를 바꿔 다시 그려 버벅였다).
 * 판이 늘 가리는 높이(내림이면 내린 높이, 아니면 접힌 높이)는 앱(.app)의 --sheet-cover로 넘겨 지도 아래쪽 단추와 처음 시점(WorldMap)을 그 위로 맞춘다. 끄는 동안에는 바꾸지 않고 놓을 때만 바꾼다.
 * PC에서는 CSS가 이 변수들을 쓰지 않는다
 */
export function useBottomSheet(active: boolean, contentKey: unknown) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<SheetState>('closed');
  const drag = useRef<{ y: number; h: number; moved: boolean; state: SheetState } | null>(null);
  const suppressClick = useRef(false);

  const peekOf = (el: HTMLElement) => parseFloat(el.style.getPropertyValue('--sheet-peek')) || el.offsetHeight;
  // 내린 높이: 손잡이 + 나라 이름란(--sheet-min, 아래 measure). 재기 전이면 손잡이 + 판 테두리
  const minOf = (el: HTMLElement) =>
    parseFloat(el.style.getPropertyValue('--sheet-min')) || (el.querySelector<HTMLElement>('.sheet-handle')?.offsetHeight ?? 22) + (el.offsetHeight - el.clientHeight);
  // 펼친 높이: 패널 아래 끝(흐름 속 자리라 펼쳐도 그대로)에서 지도 위 검색창 아래 끝 + 간격까지
  const openHeight = (el: HTMLElement) => {
    const search = document.querySelector('.map-search')?.getBoundingClientRect();
    return search ? Math.max(peekOf(el), Math.round(el.getBoundingClientRect().bottom - search.bottom - GAP_BELOW_SEARCH)) : peekOf(el);
  };
  const heightOf = (el: HTMLElement, s: SheetState) => (s === 'min' ? minOf(el) : s === 'open' ? openHeight(el) : peekOf(el));
  // 판이 지도를 늘 가리는 높이를 앱에 넘긴다(펼침은 접힌 높이로 친다: 펼친 판 밑 단추는 가려져도 된다)
  const setCover = (el: HTMLElement, s: SheetState) =>
    el.closest<HTMLElement>('.app')?.style.setProperty('--sheet-cover', `${s === 'min' ? minOf(el) : peekOf(el)}px`);

  // 접힌 높이 = 화면 높이의 1/3과 (손잡이 + 나라 이름란 높이) 가운데 큰 것, 내린 높이 = 손잡이 + 나라 이름란 높이. 이름란이나 화면 크기가 바뀌면 다시 잰다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const head = el.querySelector<HTMLElement>('[data-sheet-head]');
    const handle = el.querySelector<HTMLElement>('.sheet-handle');
    const measure = () => {
      const byHead = Math.ceil((handle?.offsetHeight ?? 0) + (head?.offsetHeight ?? 0) + 6);
      // 처음 잴 때는 움직임 없이 바로 맞춘다(그러지 않으면 화면을 열 때 CSS 기본 높이에서 늘어나는 움직임이 보임, 2026-10-28)
      const first = !el.style.getPropertyValue('--sheet-peek');
      if (first) el.style.transition = 'none';
      el.style.setProperty('--sheet-peek', `${Math.max(byHead, Math.round(window.innerHeight / 3))}px`);
      el.style.setProperty('--sheet-min', `${byHead}px`);
      // 내린 채 이름란 높이가 바뀌면(나라 선택 해제 등) 판 높이도 같이. 끄는 중이 아니면 가리는 높이도 다시
      if (el.dataset.sheet === 'min') el.style.setProperty('--sheet-h', `${byHead}px`);
      if (el.dataset.sheet !== 'drag') setCover(el, el.dataset.sheet === 'min' ? 'min' : 'closed');
      if (first) {
        void el.offsetHeight;
        requestAnimationFrame(() => el.style.removeProperty('transition'));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (head) ro.observe(head);
    const onResize = () => !keyboardHeld() && measure();
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [active, contentKey]);

  // 단계를 패널에 반영한다. 화면 크기가 바뀌면 펼친 높이를 다시 잰다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = active ? state : 'closed';
    el.dataset.sheet = s;
    if (s !== 'open') el.scrollTop = 0;
    if (!active) {
      el.closest<HTMLElement>('.app')?.style.removeProperty('--sheet-cover');
      el.style.removeProperty('--sheet-h');
      return;
    }
    setCover(el, s);
    if (s === 'closed') {
      el.style.removeProperty('--sheet-h');
      return;
    }
    const place = () => el.style.setProperty('--sheet-h', `${heightOf(el, s)}px`);
    place();
    const onResize = () => !keyboardHeld() && place();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, state]);

  // 전쟁 보기로 바뀌면(패널이 지도 위로 감) 접힘으로 돌린다
  useEffect(() => {
    if (!active) setState('closed');
  }, [active]);

  // 내린 채 다른 나라를 고르면 접힘으로 올린다
  useEffect(() => {
    if (contentKey) setState((s) => (s === 'min' ? 'closed' : s));
  }, [contentKey]);

  // 검색창을 누르면 펼친 판을 접는다(검색 결과가 패널에 가리지 않게)
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.closest('.map-search')) setState((s) => (s === 'open' ? 'closed' : s));
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
      drag.current = { y: e.clientY, h: el.offsetHeight, moved: false, state };
    },
    [active, state],
  );
  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
    const dy = d.y - e.clientY;
    if (!d.moved && Math.abs(dy) <= DRAG_MIN) return;
    d.moved = true;
    el.dataset.sheet = 'drag';
    const h = Math.min(openHeight(el), Math.max(minOf(el), d.h + dy));
    // 판 높이만 바꾼다(지도는 판 뒤에 깔려 있어 크기가 바뀌지 않음)
    el.style.setProperty('--sheet-h', `${h}px`);
  }, []);
  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    const d = drag.current;
    drag.current = null;
    if (!el || !d || !d.moved) return;
    suppressClick.current = true;
    const dy = d.y - e.clientY;
    const h = el.offsetHeight;
    const heights = ORDER.map((s) => heightOf(el, s));
    // 위로 끌었으면 지금 높이 이상인 가장 낮은 단계, 아래로 끌었으면 지금 높이 이하인 가장 높은 단계(이름란이 1/3보다 커 내림·접힘 높이가 같으면 접힘)
    const next =
      dy > SNAP
        ? (ORDER.find((_, i) => heights[i] >= h - 1) ?? 'open')
        : dy < -SNAP
          ? ([...ORDER].reverse().find((s) => heights[ORDER.indexOf(s)] <= h + 1) ?? 'min')
          : d.state;
    // 같은 단계로 돌아가도 끌던 높이를 지우도록 반영을 다시 일으킨다
    el.dataset.sheet = next;
    if (next === 'closed') el.style.removeProperty('--sheet-h');
    else el.style.setProperty('--sheet-h', `${heights[ORDER.indexOf(next)]}px`);
    setCover(el, next);
    if (next !== 'open') el.scrollTop = 0;
    setState(next);
  }, []);
  const onClick = useCallback(() => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setState((s) => (s === 'closed' ? 'open' : 'closed'));
  }, []);

  return { ref, state, open: state === 'open', handleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClick } };
}
