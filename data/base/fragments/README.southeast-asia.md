# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region southeast-asia .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `southeast-asia.topo.json` | 352,216B | `219ff5caabb0f177823171a4931a7aaed0c389eb2125041d1bf8c8e58b855fb0` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 384개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 1,227개, 점 27,182개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `VN-SG`)가 알맞고 겹치지 않으면 그 값: 328개
- 아니면 NE adm1_code(`ABC-1234`, 예: 세부 `PHL-2514`(필리핀은 고도 도시화 시가 주와 ISO 코드를 함께 써 둘 다 adm1_code)·비엔티안 `LAO-3283`·`LAO-3284`): 56개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3: 0개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): MMR, THA, LAO, KHM, VNM, MYS, SGP, BRN, IDN, TLS, PHL
- 범위 상자 [서, 남, 동, 북] = [92, -11.2, 141.1, 28.6]. 상자 밖에 통째로 있는 폴리곤은 뺐다: 없음
- 아래층 조각: `china.topo.json`(sha256 4dda1b70da9475bb…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: LAO Phôngsali 17.406km²; LAO Oudômxai 1.828km²; LAO Louang Namtha 10.256km²; MMR Kachin 52.827km²; MMR Shan 34.064km²; VNM Điện Biên 4.000km²; VNM Hà Giang 10.114km²; VNM Cao Bằng 13.274km²; VNM Lào Cai 5.733km²; VNM Lai Chau 9.241km²; VNM Lạng Sơn 8.516km²; VNM Quảng Ninh 6.459km². 이음매 선은 아래층 조각 바깥선 그대로다.
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
| `gapMaxKm2` | 0.05 (이 지역만 — regions.mjs params) | (b) 덮이지 않은 육지 기준(km²) |
| `crackMaxKm` | 0.1 | (c) 공유하지 않은 이웃 경계 기준(km) |
| `sizeWarnBytes` | 1000000 | (d) 이보다 크면 경고(바이트) |

## 가공 결과

- 고르기: 11개 나라에서 조각 384개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 189개, 그래서 통째로 빠진 조각 0개(없음).
- 격자·간략화: 꼭짓점 97,752개(조각별 합) → 36,940개. 간략화하지 않은 작은 조각 14개, 넓이에 비례해 덜 간략화한 조각 60개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 3개(MY-08, VN-43, VN-SG). 격자에 맞추며 스스로 엇갈린 arc 고리 0개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.63%, 조각 가운데값 0.83%, 큰 것 PH-TAW 9.7%, ID-KR 9.2%, VN-13 6.2%, PH-ALB 5.4%, KH-18 4.4%.
- 해안 맞추기: 조각에 붙인 해안 조각 4,115개 211,893km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 2,818km². 가까운 조각끼리 나눈 큰 해안 조각 107개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 7,191개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 4,240km² (120.12, 0.06): ID-ST 2423km², ID-GO 1816km²
  - 4,045km² (114.44, -8.25): ID-BA 2511km², ID-JI 1534km²
  - 3,475km² (96.74, 16.64): MM-06 1143km², MM-07 894km², MM-02 735km², MM-15 700km²
  - 3,356km² (123.42, 10.18): PHL-2514 2084km², PH-NER 1056km², PH-NEC 216km²
  - 3,269km² (122.54, 7.37): PH-ZSI 1960km², PHL-4932 950km², PH-ZAS 359km²
  - 3,126km² (115.26, 5.00): BN-BM 795km², MY-12 778km², MY-13 523km², MY-15 434km², BN-TU 372km², BN-BE 141km², BN-TE 84km²
  - 2,868km² (106.89, 10.20): VN-50 1236km², VN-43 600km², VN-SG 519km², VN-46 282km², VN-51 123km², VN-41 54km², VN-49 42km², VN-39 11km²
  - 2,669km² (94.32, 18.34): MM-16 2554km², MM-07 114km²
  - 2,516km² (122.75, 13.49): PHL-2538 1337km², PHL-2572 1055km², PH-ALB 123km²
  - 1,989km² (97.81, 14.78): MM-05 1152km², MM-15 836km²
  - 1,813km² (100.23, 7.59): TH-90 1345km², TH-93 388km², TH-80 52km², TH-94 29km²
  - 1,746km² (105.54, 8.98): VN-55 896km², VN-59 631km², VN-52 217km²
- T자 접점: 꼭짓점 5개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 1,056개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 57조각 0.019355km² (기준 0.05km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 0.089km 김(공유하지 않은 이웃 경계 약 0.044km, 기준 0.1km 이하), 합친 폴리곤 184개 / 합집합 184개
  - 통과: (d) 파일 크기 352,216B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 서뉴기니: 인도네시아 파푸아·서파푸아 조각이고 동쪽 끝은 동경 141° 자오선(파푸아뉴기니는 이웃으로만 간략화에 쓰고 넣지 않음, 오세아니아 권역 몫). 플라이강 굽이(남쪽 141° 서쪽)는 원본 국경 그대로다.
- 작은 섬: 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬 폴리곤은 빠진다. 1,000 km² 넘는 섬은 모두 육지 자료 안에 있다(0단계 측정, 00-scope 2절 조각 준비). 파라셀·스프래틀리 제도는 넣지 않는다(NE에서 따로 단위, 합쳐도 20 km² 안팎).
- 거친 곳: 미얀마는 주·관구 14개(라카인 `MM-16`·타닌타리 `MM-05`는 1826 양도 땅과 거의 맞고 하버마·샨 국 경계는 칼선), 인도네시아는 주 33개(NE v5.1.2라 2012년 북칼리만탄 분리 전, 파푸아 `ID-PA` 약 31.5만 km²), 사바 `MY-12`·사라와크 `MY-13`. 필리핀은 고도 도시화 시가 따로 조각이라 118개로 가장 많다.
- 조각 수: 미얀마 14·타이 77·라오스 17·캄보디아 24·베트남 63·말레이시아 16·싱가포르 5·브루나이 4·인도네시아 33·동티모르 13·필리핀 118. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| BRN | Brunei | 4 | District 4 |
| IDN | Indonesia | 33 | Province 30, Autonomous Province 1, Special district 1, Special region 1 |
| KHM | Cambodia | 24 | Province 21, Municipality 3 |
| LAO | Laos | 17 | Province 16, Municipality\|Prefecture 1 |
| MMR | Myanmar | 14 | Division 7, State 7 |
| MYS | Malaysia | 16 | State 13, Federal Territory 3 |
| PHL | Philippines | 118 | Province 80, Highly Urbanized City 32, Independent Component City 5, Independent Municipality 1 |
| SGP | Singapore | 5 | (없음) 5 |
| THA | Thailand | 77 | Province 77 |
| TLS | East Timor | 13 | District\|Regencies 13 |
| VNM | Vietnam | 63 | Province 52, Region 9, City\|Municipality\|Thanh Pho 2 |
