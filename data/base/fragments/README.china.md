# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region china .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `china.topo.json` | 126,427B | `4dda1b70da9475bbbf72fd934b8db536f9b58e2e3386776fde2830d5b1fa0012` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 31개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 98개, 점 11,253개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `CN-BJ`)가 알맞고 겹치지 않으면 그 값: 31개
- 아니면 NE adm1_code(`ABC-1234`, 예: 베이징 `CHN-1155`): 0개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3: 0개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): CHN
- 버린 나라(조각에도 이웃에도 넣지 않고, 그 땅은 해안 맞추기에서 옆 조각이 덮음): HKG, MAC
- 범위 상자 [서, 남, 동, 북] = [72, 17.5, 136, 55]. 상자 밖에 통째로 있는 폴리곤은 뺐다: CHN Paracel Islands(-): 폴리곤 6/6개
- 육지: world-atlas 2.0.2의 land-50m ∪ land-110m(Natural Earth 4.1.0, 빌드가 해안선으로 자를 때 쓰는 것과 같음). 구멍 조각 이름: world-atlas countries-10m.

| 매개변수 | 값 | 뜻 |
|---|---|---|
| `grid` | 0.0001 | 격자(도). 좌표를 소수 넷째 자리로 반올림한다(국경 생성기 출력과 같은 격자) |
| `simplifyWeight` | 0.0002 | 간략화 문턱(제곱도): Visvalingam 유효 넓이가 이보다 작은 꼭짓점을 뺀다. arc 끝점(세 조각이 만나는 점)은 남는다 |
| `keepSmallKm2` | 50 | 원래 넓이가 이보다 작은 조각의 arc는 간략화하지 않는다(km²) |
| `fullSimplifyKm2` | 1000 | 원래 넓이가 이보다 작은 조각의 arc는 문턱을 simplifyWeight × 넓이 / 이 값으로 낮춘다(km², 두 조각이 함께 쓰는 arc는 낮은 쪽) |
| `attachKm` | 50 | 닿는 조각이 없는 해안 조각을 붙일 거리(km) |
| `microMinKm2` | 1 | 사방이 조각으로 둘러싸인 구멍을 새 조각으로 만드는 넓이(km²) |
| `splitKm2` | 20 | 이보다 큰 해안 조각은 가까운 조각끼리 나눈다(km²) |
| `splitCell` | 0.05 | 나눌 때 가장 작은 칸(도) |
| `coastMargin` | 0.0002 | 해안 조각을 뺄 육지를 부풀리는 폭(도, 격자 두 칸) |
| `tjunctionTol` | 0.0001 | T자 접점: 다른 조각의 변에서 이 거리(도) 안의 꼭짓점을 그 변에 끼운다 |
| `untwistMaxKm2` | 5 | arc 꼬임 풀기: 이보다 큰 고리는 자르지 않고 보고한다(km²) |
| `overlapMaxKm2` | 1 | (a) 조각 쌍 겹침 기준(km²) |
| `gapMaxKm2` | 0.01 | (b) 덮이지 않은 육지 기준(km²) |
| `crackMaxKm` | 0.1 | (c) 공유하지 않은 이웃 경계 기준(km) |
| `sizeWarnBytes` | 1000000 | (d) 이보다 크면 경고(바이트) |

## 가공 결과

- 고르기: 1개 나라에서 조각 31개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 26개, 그래서 통째로 빠진 조각 0개(없음).
- 격자·간략화: 꼭짓점 53,214개(조각별 합) → 19,433개. 간략화하지 않은 작은 조각 0개, 넓이에 비례해 덜 간략화한 조각 0개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 0개(없음). 격자에 맞추며 스스로 엇갈린 arc 고리 0개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.14%, 조각 가운데값 0.24%, 큰 것 CN-SH 0.7%, CN-ZJ 0.7%, CN-TJ 0.6%, CN-HI 0.6%, CN-GD 0.6%.
- 해안 맞추기: 조각에 붙인 해안 조각 413개 41,927km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 59,026km². 가까운 조각끼리 나눈 큰 해안 조각 50개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 759개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 3,412km² (120.00, 26.55): CN-FJ 3396km², CN-ZJ 10km²
  - 3,149km² (121.18, 31.71): CN-JS 1669km², CN-SH 1480km²
  - 2,809km² (130.49, 32.71): 이웃 JPN Kumamoto 1312km², 이웃 JPN Nagasaki 993km², 이웃 JPN Saga 330km², 이웃 JPN Fukuoka 174km²
  - 2,719km² (134.53, 34.55): 이웃 JPN Hyōgo 1388km², 이웃 JPN Ōsaka 605km², 이웃 JPN Kagawa 466km², 이웃 JPN Okayama 259km²
  - 2,240km² (126.43, 36.23): 이웃 KOR South Chungcheong 1606km², 이웃 KOR North Jeolla 629km²
  - 2,222km² (118.28, 24.50): CN-FJ 1768km², 이웃 TWN Kinmen 453km²
  - 2,059km² (121.15, 30.38): CN-ZJ 2057km², CN-SH 2km²
  - 1,652km² (134.57, 33.68): 이웃 JPN Kōchi 836km², 이웃 JPN Tokushima 814km²
  - 1,607km² (126.61, 37.32): 이웃 KOR Gyeonggi 1025km², 이웃 KOR Incheon 339km², 이웃 PRK Hwanghae-namdo 95km², 이웃 KOR South Chungcheong 83km², 이웃 PRK Hwanghae-bukto 64km²
  - 1,585km² (132.37, 34.13): 이웃 JPN Hiroshima 1203km², 이웃 JPN Yamaguchi 359km², 이웃 JPN Ehime 22km²
  - 1,564km² (130.82, 34.06): 이웃 JPN Yamaguchi 1237km², 이웃 JPN Fukuoka 327km²
  - 1,371km² (134.01, 35.59): 이웃 JPN Tottori 989km², 이웃 JPN Hyōgo 319km², 이웃 JPN Kyōto 34km², 이웃 JPN Shimane 29km²
- T자 접점: 꼭짓점 0개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 80개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 3조각 0.000059km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 -0.000km 김(공유하지 않은 이웃 경계 약 -0.000km, 기준 0.1km 이하), 합친 폴리곤 7개 / 합집합 7개
  - 통과: (d) 파일 크기 126,427B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 중국(CHN): 성·자치구·직할시 31개. id는 NE의 ISO 3166-2 값(`CN-BJ` 등)이다. 국경은 NE v5.1.2 기본 파일 그대로(실제 지배 기준)이고, 시대별 나라 경계는 생성기가 바깥 손그림 도형과의 교집합과 칼선으로 정한다.
- 홍콩·마카오: 조각으로 넣지 않고(NE에서 광둥과 국경이 맞지 않아 arc를 공유하지 못함) 그 땅은 해안 맞추기에서 광둥(`CN-GD`)이 덮는다. 그래서 광둥 조각에 홍콩 땅(주룽·신계·홍콩섬·란터우)이 들어 있다. 마카오는 빌드가 쓰는 육지(50m·110m)에서 바다라 어느 조각에도 들지 않는다.
- 넣지 않은 것: 대만(TWN, 진먼·펑후 포함)은 이웃으로 경계 간략화에만 쓴다. 파라셀 제도(NE의 CHN 조각)는 범위 상자 남쪽 변 밖이라 뺐고, 육지(50m·110m)와 닿지 않는 작은 섬 폴리곤도 빠진다. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| CHN | China | 31 | Province 22, Autonomous Region 5, Municipality 4 |
