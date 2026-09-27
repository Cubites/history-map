/**
 * 전쟁 보기 이름표 겹침 정리 (DESIGN.md §4.5).
 * `data-label-priority`가 붙은 이름표를 실제 화면 크기로 재서, 우선순위가 높은 것부터 놓고
 * 앞서 놓은 이름표와 겹치는 것은 숨긴다. 확대해서 서로 떨어지면 다시 보인다.
 * 우선순위: 전투 5 > 거점 4 > 작전 화살표·진군로의 가장 최근 지점 3 > 진군로의 지난 지점 2 > 진군로 이름 1
 */
export function layoutLabels(root: Element) {
  const labels = [...root.querySelectorAll<SVGTextElement>('text[data-label-priority]')];
  const items = labels.map((el, order) => {
    el.style.visibility = '';
    return { el, order, priority: Number(el.dataset.labelPriority), box: el.getBoundingClientRect() };
  });
  items.sort((a, b) => b.priority - a.priority || a.order - b.order);
  const placed: DOMRect[] = [];
  const PAD = 1;
  for (const item of items) {
    const b = item.box;
    if (b.width === 0 && b.height === 0) continue;
    const hit = placed.some((p) => b.left < p.right + PAD && p.left < b.right + PAD && b.top < p.bottom + PAD && p.top < b.bottom + PAD);
    if (hit) item.el.style.visibility = 'hidden';
    else placed.push(b);
  }
}
