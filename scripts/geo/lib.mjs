// 국경 생성기 공통 기반 (DESIGN.md §5.2, 층 0): polyclip-ts 불러오기와 도형 도우미.
// 가져와도 되는 것: node 내장 모듈뿐. 생성기의 다른 파일(shared·engine·권역 파일)은 polyclip과 도우미를 모두 여기서 가져다 쓴다.
// polyclip은 이 파일에서 한 번만 불러온다(이 파일 위치 기준으로 찾음). 프로젝트 폴더와 명령줄 인자는 모른다(진입 파일이 정함).
// 그래서 다른 스크립트도 인자와 상관없이 권역 파일을 import할 수 있다.
// polyclip.setPrecision은 부르지 않는다: polyclip-ts 0.16.8의 precision.reset()은 아무 일도 하지 않아, 한 번 켜면 전역 스냅이 남고 계산 순서에 따라 결과가 달라진다.
// 반환 모양: ring·bx는 닫힌 링, box는 [링](폴리곤), P는 [[링]](멀티폴리곤), U·D·I와 union은 polyclip 결과(멀티폴리곤)
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
export const polyclip = await import(pathToFileURL(require.resolve('polyclip-ts')).href);

// 선 뒤집기, 선·점을 이어 닫힌 링 만들기
export const rev = (line) => [...line].reverse();
export const ring = (...parts) => {
  const pts = parts.flat();
  return [...pts, pts[0]];
};

// 링 하나를 멀티폴리곤으로, 링 여럿의 합집합
export const P = (r) => [[r]];
export const union = (...rings) => polyclip.union(...rings.map((r) => [r]));

// 합집합·차집합·교집합 (polyclip의 얇은 별칭)
export const U = (...geoms) => polyclip.union(...geoms);
export const D = (a, ...b) => polyclip.difference(a, ...b);
export const I = (a, b) => polyclip.intersection(a, b);

// 경위도 상자 (서, 남, 동, 북): bx는 링, box는 폴리곤
export const bx = (w, s, e, n) => ring([[w, s], [e, s], [e, n], [w, n]]);
export const box = (w, s, e, n) => [ring([[w, s], [e, s], [e, n], [w, n]])];
