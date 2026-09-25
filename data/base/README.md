# 기본 지도 (Natural Earth)

해안선과 육지 폴리곤은 [Natural Earth](https://www.naturalearthdata.com/)(퍼블릭 도메인)를 사용한다.
현재는 npm 패키지 [world-atlas](https://github.com/topojson/world-atlas)가 TopoJSON으로 변환한 `land-50m.json`을 쓴다.

- `npm run build:data`가 이 파일로 영토 폴리곤을 해안선에 맞게 자르고, `public/data/base-land-50m.topo.json`으로 복사해 화면의 회색 육지로 그린다.
- 시대별 해안선(간척 이전 등)이 필요해지면 이 폴더에 구간별 데이터를 둔다 (DESIGN.md §10).
