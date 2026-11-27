import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Size } from './view.ts';

/**
 * 지도 위 SVG 글자(전쟁 이름·전투 이름·거점·진군로·화살표 설명)를 캔버스에 따라 그리는 층 (2026-11-27).
 *
 * 밝은 사이트를 스스로 어둡게 덧칠하는 브라우저(삼성 브라우저)는 SVG 글자의 색만 밝게 뒤집고 테두리는 그대로 둬서
 * 글자가 흐려진다. 캔버스 그림은 덧칠하지 않으므로(지도 그림·나라 이름표 LabelLayer와 같음) 사이트가 정한 색 그대로 나온다.
 *
 * 글자를 그리는 층들(WarMarkerLayer·BattlePinLayer·WarDetailLayer·FrontArrowLayer·ArrowLayer)은 그대로 두고,
 * 그 SVG 글자는 보이지 않게만 한 채(styles.css `.map-overlay text` — 자리·누름·겹침 정리는 그대로 동작) 이 층이
 * 화면에 있는 글자를 찾아 같은 자리·같은 모양(색·테두리·크기·굵기·투명도)으로 캔버스에 그린다.
 * 층 순서를 지키도록 SVG 안의 foreignObject에 캔버스를 둔다. 상황 번호 핀의 숫자(.war-step-pin)는 흰 글자라 그대로 둔다
 */
export function TextCanvasLayer({ size }: { size: Size }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<() => void>(() => {});

  drawRef.current = () => {
    const canvas = canvasRef.current;
    const svg = canvas?.closest('svg');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !svg || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const [w, h] = [Math.round(size.width * dpr), Math.round(size.height * dpr)];
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.miterLimit = 4;

    for (const el of svg.querySelectorAll<SVGTextElement>('text')) {
      if (el.closest('.war-step-pin')) continue;
      const css = getComputedStyle(el);
      if (css.display === 'none' || css.visibility === 'hidden') continue;
      // 글자와 그 위 묶음들의 투명도를 곱한다(지난 전투는 흐리게, 전쟁 아이콘의 둘째 줄은 올렸을 때만 등)
      let alpha = 1;
      for (let node: Element | null = el; node && node !== svg; node = node.parentElement) alpha *= parseFloat(getComputedStyle(node).opacity);
      if (!(alpha > 0.01)) continue;

      // 글자 조각: 글자 요소 바로 아래의 글과 tspan(날짜처럼 색이 다른 부분). 빈칸은 SVG처럼 하나로 줄인다
      const runs: { text: string; fill: string; font: string }[] = [];
      for (const child of el.childNodes) {
        const style = child instanceof SVGElement ? getComputedStyle(child) : css;
        let text = (child.textContent ?? '').replace(/\s+/g, ' ');
        if (runs.length === 0 || runs[runs.length - 1].text.endsWith(' ')) text = text.trimStart();
        if (!text) continue;
        runs.push({ text, fill: style.fill, font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}` });
      }
      if (runs.length === 0) continue;
      runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();

      // 첫 글자의 시작 자리(가운데·오른쪽 맞춤과 dx·dy가 이미 들어 있음)를 화면 좌표로
      let start: DOMPoint;
      const matrix = el.getCTM();
      try {
        start = el.getStartPositionOfChar(0);
      } catch {
        continue;
      }
      if (!matrix) continue;
      let x = matrix.a * start.x + matrix.c * start.y + matrix.e;
      const y = matrix.b * start.x + matrix.d * start.y + matrix.f;
      if (x > size.width + 50 || y < -30 || y > size.height + 30) continue;

      const strokeWidth = parseFloat(css.strokeWidth) || 0;
      const stroked = css.stroke !== 'none' && strokeWidth > 0;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = css.strokeLinejoin === 'round' ? 'round' : css.strokeLinejoin === 'bevel' ? 'bevel' : 'miter';
      // 테두리를 먼저 모두 그리고 그 위에 글자를 그린다(뒤 조각의 테두리가 앞 조각 글자를 덮지 않게)
      const starts: number[] = [];
      for (const run of runs) {
        ctx.font = run.font;
        starts.push(x);
        if (stroked) {
          ctx.strokeStyle = css.stroke;
          ctx.strokeText(run.text, x, y);
        }
        x += ctx.measureText(run.text).width;
      }
      runs.forEach((run, i) => {
        ctx.font = run.font;
        ctx.fillStyle = run.fill;
        ctx.fillText(run.text, starts[i], y);
      });
    }
    ctx.globalAlpha = 1;
  };

  // 크기가 바뀌면 다시 그린다. 그 밖의 변화는 아래에서 지켜본다
  useLayoutEffect(() => drawRef.current(), [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = canvas?.closest('svg');
    if (!canvas || !svg) return;
    const draw = () => drawRef.current();
    // 글자 층들이 다시 그려지거나(자리·글·묶음 바뀜) 겹침 정리가 글자를 숨기면 따라 그린다. 캔버스 자신의 변화는 건너뛴다
    const observer = new MutationObserver((records) => {
      if (records.some((r) => r.target !== canvas && r.target !== canvas.parentNode)) draw();
    });
    observer.observe(svg, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['x', 'y', 'dx', 'dy', 'transform', 'class', 'style', 'text-anchor'] });
    // 마우스를 올리거나 초점이 가면 CSS로 색·투명도가 바뀌는 글자가 있다(전쟁 아이콘의 둘째 줄은 0.15초에 걸쳐 나타남)
    let timer = 0;
    const later = () => {
      draw();
      window.clearTimeout(timer);
      timer = window.setTimeout(draw, 200);
    };
    const events = ['pointerover', 'pointerout', 'focusin', 'focusout'] as const;
    for (const type of events) svg.addEventListener(type, later);
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    scheme.addEventListener('change', draw);
    // 글꼴이 늦게 실리면 폭이 달라지므로 한 번 더
    void document.fonts?.ready.then(draw);
    draw();
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      for (const type of events) svg.removeEventListener(type, later);
      scheme.removeEventListener('change', draw);
    };
  }, []);

  return (
    <foreignObject className="text-canvas" x={0} y={0} width={size.width} height={size.height}>
      <canvas ref={canvasRef} className="text-canvas-canvas" style={{ width: size.width, height: size.height }} />
    </foreignObject>
  );
}
