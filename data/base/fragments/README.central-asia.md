# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region central-asia .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `central-asia.topo.json` | 99,776B | `ef3ae1e560af2f904cea109624bf651ef22892708d2ce68af94d45158e86f75e` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 83개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 245개, 점 8,000개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `KZ-KAR`)가 알맞고 겹치지 않으면 그 값: 75개
- 아니면 NE adm1_code(`ABC-1234`, 예: 타지키스탄 공화국 직할 구 `TJK-368`): 7개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`KAB` 등): 1개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): KAZ, UZB, TKM, KGZ, TJK, AFG, KAB
- 범위 상자 [서, 남, 동, 북] = [46.4, 29.3, 87.5, 55.6]. 상자 밖에 통째로 있는 폴리곤은 뺐다: 없음
- 아래층 조각: `south-asia.topo.json`(sha256 9fbd7382ec2cb404…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: AFG Badakhshan 20.588km²; AFG Nimroz 0.267km²; AFG Kunar 6.083km²; AFG Nuristan 6.237km²; AFG Nangarhar 6.588km²; AFG Khost 5.746km²; AFG Paktya 0.628km²; AFG Paktika 9.026km²; AFG Zabul 2.285km²; AFG Kandahar 15.882km²; AFG Hilmand 0.306km². 이음매 선은 아래층 조각 바깥선 그대로다.
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

- 고르기: 7개 나라에서 조각 83개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 2개, 그래서 통째로 빠진 조각 0개(없음).
- 격자·간략화: 꼭짓점 29,753개(조각별 합) → 13,208개. 간략화하지 않은 작은 조각 0개, 넓이에 비례해 덜 간략화한 조각 5개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 0개(없음). 격자에 맞추며 스스로 엇갈린 arc 고리 0개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.12%, 조각 가운데값 0.41%, 큰 것 UZ-SI 1.2%, AF-KAP 1.0%, UZ-FA 0.9%, AF-LOG 0.9%, AFG-1769 0.9%.
- 해안 맞추기: 조각에 붙인 해안 조각 85개 10,228km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 10,834km². 가까운 조각끼리 나눈 큰 해안 조각 11개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 165개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 4,988km² (53.78, 37.97): 이웃 IRN Mazandaran 2557km², TM-B 1732km², 이웃 IRN Golestan 415km², 이웃 IRN Gilan 286km²
  - 1,352km² (49.47, 39.89): 이웃 AZE Bakı 1117km², 이웃 AZE Salyan 149km², 이웃 AZE Neftçala 85km²
  - 769km² (47.97, 29.44): 이웃 KWT Al Jahrah 500km², 이웃 KWT Al Asimah 179km², 이웃 KWT Hawalli 90km²
  - 689km² (48.96, 38.04): 이웃 IRN Gilan 687km², 이웃 AZE Astara 3km², 이웃 AZE Lankaran 0km²
  - 675km² (49.85, 30.10): 이웃 IRN Khuzestan 603km², 이웃 IRN Bushehr 72km²
  - 452km² (49.00, 38.97): 이웃 AZE Lankaran 434km², 이웃 AZE Masallı 16km², 이웃 AZE Lankaran 1km²
  - 309km² (48.00, 29.87): 이웃 KWT Al Jahrah 197km², 이웃 IRQ Al-Basrah 112km²
  - 176km² (49.26, 39.19): 이웃 AZE Neftçala 140km², 이웃 AZE Lankaran 35km²
  - 164km² (49.25, 41.04): 이웃 AZE Siyəzən 137km², 이웃 AZE Dəvəçi 23km², 이웃 AZE Xizı 5km²
  - 119km² (49.60, 40.65): 이웃 AZE Sumqayıt 68km², 이웃 AZE Xizı 27km², 이웃 AZE Bakı 25km²
  - 99km² (47.58, 45.60): 이웃 RUS Astrakhan' 82km², 이웃 RUS Kalmyk 17km²
- T자 접점: 꼭짓점 1개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 268개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 5조각 0.001369km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 0.000km 김(공유하지 않은 이웃 경계 약 0.000km, 기준 0.1km 이하), 합친 폴리곤 5개 / 합집합 5개
  - 통과: (d) 파일 크기 99,776B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 카자흐스탄: 조각 16개와 바이코누르 임차지(`KAB`, 러시아가 1994년부터 빌려 쓰는 우주 기지 땅, 크질오르다 `KZ-KZY` 안의 구멍) 하나. 주가 커서(10만 km² 넘는 것이 대부분) 시대별 나라 경계는 대부분 칼선이다. 알마티는 주(`KAZ-3207`)와 시(`KAZ-4829`)가 같은 ISO 코드라 NE adm1_code가 id다.
- 아프가니스탄: 조각 34개. 와한 회랑은 바다흐샨(`AF-BDS`) 안이고, 듀랜드선은 남아시아 조각 바깥선 그대로다. 2004년에 갈라진 다이쿤디(`AFG-1753`)·판지시르(`AFG-1769`)가 NE에서 옛 주 이름·ISO 코드(우루즈간 `AFG-1752`·파르완 `AFG-1772`와 같음)로 남아 있어 네 조각은 adm1_code가 id다.
- 우즈베키스탄 14·투르크메니스탄 5·키르기스스탄 8·타지키스탄 5. 카라칼파크스탄(`UZ-QR`)은 우즈베키스탄 조각 하나, 타슈켄트는 주(`UZ-TO`)와 시(`UZ-TK`) 둘이다. 타지키스탄 공화국 직할 구(`TJK-368`)는 ISO 코드가 없다. 조각 사이의 내륙 구멍은 없었다.
- 신장: 이 파일에 없다. 중국 조각 파일(`china.topo.json`)의 `CN-XJ` 한 조각(약 164만 km²)을 생성기가 읽어 칼선으로 나눈다. 이 파일과 `CN-XJ`의 이음매는 원본 행정구역끼리 따로 간략화한 것이라 수십 km² 어긋나며 생성기가 맞춘다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| AFG | Afghanistan | 34 | Province 34 |
| KAB | Baykonur Cosmodrome | 1 | (없음) 1 |
| KAZ | Kazakhstan | 16 | Region 14, City 2 |
| KGZ | Kyrgyzstan | 8 | Region 8 |
| TJK | Tajikistan | 5 | Region 4, Independent City 1 |
| TKM | Turkmenistan | 5 | Province 5 |
| UZB | Uzbekistan | 14 | Region 13, Automonous Region 1 |
