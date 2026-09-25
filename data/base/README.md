# 기본 지도 (Natural Earth)

해안선과 육지 폴리곤은 [Natural Earth](https://www.naturalearthdata.com/)(퍼블릭 도메인)를 사용한다.
현재는 npm 패키지 [world-atlas](https://github.com/topojson/world-atlas)가 TopoJSON으로 변환한
`land-50m.json`을 `npm run build:data` 단계에서 `public/data/base/`로 복사해 쓴다.

국경을 해안선에 맞춰 자르는 단계(DESIGN.md §5.3)가 들어오면 더 정밀한 1:10m 데이터를 이 폴더에 둔다.
