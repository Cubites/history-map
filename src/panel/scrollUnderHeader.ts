/**
 * 패널 안의 항목(사건·전쟁 보기의 날짜)을 붙어 있는 이름 머리(.panel-header-sticky) 바로 아래로 스크롤한다(항목 사이 간격만큼 띄움).
 * 그만큼 내릴 수 없으면 맨 아래까지만 내린다. 붙은 머리가 없는 패널이면 false를 돌려준다(부르는 쪽이 scrollIntoView 등으로 갈음)
 */
export function scrollUnderHeader(item: HTMLElement): boolean {
  const panel = item.closest<HTMLElement>('.panel');
  const header = panel?.querySelector<HTMLElement>('.panel-header-sticky');
  if (!panel || !header) return false;
  const gap = parseFloat(getComputedStyle(item.parentElement!).rowGap) || 0;
  const scrollportTop = panel.getBoundingClientRect().top + panel.clientTop;
  const itemTop = item.getBoundingClientRect().top - scrollportTop + panel.scrollTop;
  // 머리가 붙었을 때 아래 끝 = 패널 안쪽 여백 + 붙는 위치(top, 음수일 수 있음) + 머리 높이
  // (sticky는 스크롤 영역의 안쪽 여백 끝을 기준으로 붙는다)
  const headerBottom =
    (parseFloat(getComputedStyle(panel).paddingTop) || 0) + (parseFloat(getComputedStyle(header).top) || 0) + header.offsetHeight;
  const max = panel.scrollHeight - panel.clientHeight;
  panel.scrollTo({ top: Math.max(0, Math.min(itemTop - headerBottom - gap, max)), behavior: 'smooth' });
  return true;
}
