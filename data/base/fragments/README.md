# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `europe.topo.json` | 1,239,591B | `87bb89b1a4529396e0dca6292a0ec8e94eeba187aeb3ea8af910efccbae1342c` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 1832개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 5,630개, 점 85,467개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `FR-67`)가 알맞고 겹치지 않으면 그 값: 1733개
- 아니면 NE adm1_code(`ABC-1234`, 예: 코소보 `KOS-5899`): 92개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`MCO`·`VAT`·`GIB`·`CYN` 등): 7개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): ALB, AND, AUT, BEL, BGR, BIH, BLR, CHE, CYP, CYN, CZE, DEU, DNK, ESP, EST, FIN, FRA, GBR, GRC, HRV, HUN, IRL, ISL, ITA, KOS, LIE, LTU, LUX, LVA, MCO, MDA, MKD, MLT, MNE, NLD, NOR, POL, PRT, ROU, SMR, SRB, SVK, SVN, SWE, UKR, VAT, TUR, GEO, ARM, AZE, ALD, FRO, IMN, JEY, GGY, GIB, ESB, WSB
- 러시아(RUS): NE region 속성이 Northwestern·Central·Volga인 연방 주체(NE의 Volga에는 남부·북캅카스 관구도 들어 있음). Urals·Siberian·Far Eastern과 카자흐스탄은 넣지 않는다(권역 바깥선이 된다).
- 범위 상자 [서, 남, 동, 북] = [-32, 27, 70, 82]. 상자 밖에 통째로 있는 폴리곤은 뺐다: FRA Guyane française(Overseas department): 폴리곤 1/1개; NLD Bonaire(Special Municipality): 폴리곤 1/1개; FRA Martinique(Overseas department): 폴리곤 1/1개; FRA Guadeloupe(Overseas department): 폴리곤 6/6개; NLD St. Eustatius(Special Municipality): 폴리곤 1/1개; FRA La Réunion(Overseas department): 폴리곤 1/1개; FRA Mayotte(Overseas department): 폴리곤 2/2개; NOR Bouvet Island(-): 폴리곤 1/1개; NLD Saba(Special Municipality): 폴리곤 1/1개
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

- 고르기: 59개 나라에서 조각 1832개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 225개, 그래서 통째로 빠진 조각 8개(ALD-4818 Lemland, ALD-4819 Lumparland, ALD-4820 Vårdö, ALD-4821 Sottunga, ALD-4822 Kumlinge, ALD-4823 Brändö, ALD-4824 Kökar, GB-IOS Isles of Scilly).
- 격자·간략화: 꼭짓점 348,028개(조각별 합) → 144,996개. 간략화하지 않은 작은 조각 213개, 넓이에 비례해 덜 간략화한 조각 663개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 3개(DE-MV, IE-MO, SE-E). 격자에 맞추며 스스로 엇갈린 arc 고리 2개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.48%, 조각 가운데값 0.65%, 큰 것 GB-ORK 12.0%, FRO-1443 12.0%, GB-ZET 10.6%, GB-ELS 7.1%, GR-A1 5.3%.
- 해안 맞추기: 조각에 붙인 해안 조각 7,852개 294,205km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 92,585km². 가까운 조각끼리 나눈 큰 해안 조각 233개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 13,407개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 13,693km² (10.18, 64.25): NO-15 4589km², NO-17 3315km², NO-18 2948km², NO-16 2851km², NO-14 48km²
  - 5,945km² (-8.88, 40.33): PT-15 1255km², ES-PO 1107km², PT-11 844km², PT-10 678km², PT-13 487km², PT-01 444km², PT-16 441km², PT-06 343km², PT-03 218km², ES-C 129km²
  - 5,549km² (33.05, 28.83): 이웃 EGY Janub Sina' 4264km², 이웃 EGY Al Bahr al Ahmar 781km², 이웃 EGY As Suways 492km²
  - 4,988km² (53.78, 37.97): 이웃 IRN Mazandaran 2557km², 이웃 TKM Balkan 1732km², 이웃 IRN Golestan 415km², 이웃 IRN Gilan 286km²
  - 4,550km² (-7.42, 33.76): 이웃 MAR Doukkala - Abda 1475km², 이웃 MAR Gharb - Chrarda - Béni Hssen 1127km², 이웃 MAR Rabat - Salé - Zemmour - Zaer 637km², 이웃 MAR Grand Casablanca 605km², 이웃 MAR Chaouia - Ouardigha 403km², 이웃 MAR Tanger - Tétouan 297km², 이웃 MAR Marrakech - Tensift - Al Haouz 16km²
  - 4,203km² (23.37, 64.13): FI-12 1694km², FI-14 1502km², FI-07 1050km²
  - 3,977km² (-4.60, 50.96): GB-CON 1807km², GB-DEV 691km², GB-SOM 556km², GB-VGL 441km², GB-NSM 204km², GB-NWP 123km², GB-GLS 48km², GB-MON 40km², GB-SGC 38km², GB-CRF 33km², GB-BST 14km²
  - 3,845km² (-28.16, 70.61): 이웃 GRL Kommuneqarfik Sermersooq 3835km², 이웃 GRL Nationalparken 10km²
  - 3,752km² (4.64, 52.87): NL-NH 1409km², NL-FR 961km², DE-NI 526km², NL-ZH 521km², NL-GR 345km²
  - 3,751km² (22.53, 38.21): GR-G 1725km², GR-H 1181km², GR-J 752km², GR-A1 92km²
  - 3,730km² (-1.29, 44.50): FR-33 1368km², FR-40 865km², ES-SS 647km², FR-64 395km², FR-17 290km², ES-BI 174km²
  - 3,593km² (-4.93, 35.45): 이웃 MAR Tanger - Tétouan 1666km², 이웃 MAR Taza - Al Hoceima - Taounate 1025km², 이웃 MAR Oriental 902km²
- T자 접점: 꼭짓점 9개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 6,010개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 90조각 0.004516km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 0.027km 김(공유하지 않은 이웃 경계 약 0.014km, 기준 0.1km 이하), 합친 폴리곤 178개 / 합집합 178개
  - 경고: (d) 파일 크기 1,239,591B (1MB를 넘음)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 크림(`UA-43`)·세바스토폴(`UA-40`): NE v5.1.2 기본 파일에서 adm0가 RUS·RUS이다(실제 지배 기준). id가 ISO 코드라 id는 소속과 상관없고, 어느 나라 것인지는 생성기의 조각 소유표가 정한다.
- 코소보: KOS 30개 구(id는 NE adm1_code). 세르비아(SRB) 25개 조각과 겹치지 않는다.
- 키프로스: 북키프로스는 조각 하나(`CYN`), 아크로티리(`WSB-5133`)·데켈리아(`ESB-5132`)는 영국 주권 기지 지역 조각이다. 유엔 완충지대는 따로 조각이 없고 키프로스(CYP)의 니코시아·파마구스타 구(`CY-01`·`CY-04`)에 들어 있다.
- 소국: 안도라 7·리히텐슈타인 11·산마리노 9개 행정구역, 모나코(`MCO`)·바티칸(`VAT`)·지브롤터(`GIB`)는 한 조각씩 들어 있다(NE v5.1.2에는 이들의 admin-1이 있음). 원래 넓이가 50km² 미만인 조각은 간략화하지 않아 모양이 그대로다. 조각 사이의 내륙 구멍은 없었다.
- 바티칸(`VAT`): NE admin-1 원본에서 이미 점 7개, 약 0.012km²짜리 작은 다각형이다(실제 넓이 약 0.44km²의 나머지는 로마 `IT-RM`에 들어 있음). 바티칸 시국을 그릴 때는 이 조각을 그대로 쓰지 말고 따로 긋는다.
- 러시아: 유럽 쪽 조각 58개. 칼리닌그라드(`RU-KGD`)는 월경지로 한 조각이다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| ALB | Albania | 12 | County 12 |
| ALD | Aland | 4 | (없음) 4 |
| AND | Andorra | 7 | (없음) 7 |
| ARM | Armenia | 11 | Province 10, City 1 |
| AUT | Austria | 9 | State 9 |
| AZE | Azerbaijan | 78 | District 67, Municipality 11 |
| BEL | Belgium | 11 | Province 10, Capital Region 1 |
| BGR | Bulgaria | 28 | Province 28 |
| BIH | Bosnia and Herzegovina | 18 | Canton 10, (없음) 8 |
| BLR | Belarus | 7 | Region 6, Municipality 1 |
| CHE | Switzerland | 26 | Canton 26 |
| CYN | Northern Cyprus | 1 | (없음) 1 |
| CYP | Cyprus | 5 | District 5 |
| CZE | Czech Republic | 14 | Region 14 |
| DEU | Germany | 16 | State 16 |
| DNK | Denmark | 5 | Region 5 |
| ESB | Dhekelia Sovereign Base Area | 1 | (없음) 1 |
| ESP | Spain | 52 | Autonomous Community 50, Autonomous City 2 |
| EST | Estonia | 15 | County 14, Municipality 1 |
| FIN | Finland | 18 | Province 14, Region 4 |
| FRA | France | 96 | Metropolitan department 96 |
| FRO | Faroe Islands | 1 | Region 1 |
| GBR | United Kingdom | 231 | Unitary Authority 50, Metropolitan Borough 36, London Borough 28, Administrative County 26, Unitary District 26, District 24, Unitary Authority (wales) 21, Unitary District (city) 5, Unitary Single-Tier County 5, London Borough (royal) 3, London Borough (city) 2, City Corporation 1, Island Area 1, Kingdom 1, Principality 1, Province 1 |
| GEO | Georgia | 12 | Region 9, Autonomous Republic 2, Independent City 1 |
| GGY | Guernsey | 1 | (없음) 1 |
| GIB | Gibraltar | 1 | (없음) 1 |
| GRC | Greece | 14 | Region 13, Autonomous Monastic State 1 |
| HRV | Croatia | 21 | County 20, City 1 |
| HUN | Hungary | 43 | Urban county 23, County 19, Capital City 1 |
| IMN | Isle of Man | 1 | (없음) 1 |
| IRL | Ireland | 34 | County 29, City 4, Administrative County 1 |
| ISL | Iceland | 9 | Region 8, Independent Town 1 |
| ITA | Italy | 110 | Province 110 |
| JEY | Jersey | 1 | (없음) 1 |
| KOS | Kosovo | 30 | District 30 |
| LIE | Liechtenstein | 11 | (없음) 11 |
| LTU | Lithuania | 10 | County 10 |
| LUX | Luxembourg | 3 | District 3 |
| LVA | Latvia | 119 | Municipality 110, Republican City 9 |
| MCO | Monaco | 1 | (없음) 1 |
| MDA | Moldova | 40 | District 35, City 3, Autonomous Territory 1, Territorial Unit 1 |
| MKD | Macedonia | 84 | Statistical Region 72, Municipality 12 |
| MLT | Malta | 68 | (없음) 68 |
| MNE | Montenegro | 21 | Municipality 21 |
| NLD | Netherlands | 12 | Province 12 |
| NOR | Norway | 20 | County 19, Territory 1 |
| POL | Poland | 16 | Voivodeship\|Province 16 |
| PRT | Portugal | 20 | District 18, Autonomous region 2 |
| ROU | Romania | 42 | County 41, City 1 |
| RUS | Russia | 58 | Region 34, Republic 16, Federal City 3, Territory 3, Autonomous Province 1, Autonomous Republic 1 |
| SMR | San Marino | 9 | (없음) 9 |
| SRB | Republic of Serbia | 25 | District 24, City 1 |
| SVK | Slovakia | 8 | Region 8 |
| SVN | Slovenia | 193 | Commune\|Municipality 181, Statistical Region 12 |
| SWE | Sweden | 21 | County 21 |
| TUR | Turkey | 81 | Province 81 |
| UKR | Ukraine | 25 | Region 23, (없음) 1, Municipality 1 |
| VAT | Vatican | 1 | (없음) 1 |
| WSB | Akrotiri Sovereign Base Area | 1 | (없음) 1 |
