import { useMediaQuery } from '../lib/useMediaQuery.ts';

/**
 * 휴대폰 폭인지 — 휴대폰의 연도 막대는 지도 영역 맨 아래(국가 정보 판 바로 위)에 띄운 가로 막대(.flat)다.
 * 2026-11-25(사본 시험): '기존(지도 오른쪽 세로 막대) | 가로 연도바'를 고르던 단추(BarDesignSwitch)를 없애고 가로 막대로 굳혔다. 세로 막대는 없앴다
 */
export function useFlatBar(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
