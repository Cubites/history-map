# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region americas .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `americas.topo.json` | 887,563B | `8dacc639ec08d4764d9f17f13163d215d22c4fbe5aea59eb4699fcd31b21d41a` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 664개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 2,194개, 점 74,022개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `CA-NU`)가 알맞고 겹치지 않으면 그 값: 624개
- 아니면 NE adm1_code(`ABC-1234`, 예: 그린란드 국립공원 `GRL-2742`): 33개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`CYM`·`SGS`·`VGB` 등): 3개, 내륙 구멍으로 만든 조각(`HOLE-n`) 4개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): CAN, GRL, MEX, GTM, BLZ, SLV, HND, NIC, CRI, PAN, CUB, JAM, HTI, DOM, BHS, TTO, ATG, BRB, DMA, GRD, KNA, LCA, VCT, ABW, CUW, SXM, MAF, BLM, AIA, MSR, VGB, VIR, PRI, CYM, TCA, BMU, SPM, FLK, SGS, NLD, COL, VEN, GUY, SUR, ECU, PER, BRA, BOL, PRY, URY, ARG, CHL
- 버린 나라(조각에도 이웃에도 넣지 않고, 그 땅은 해안 맞추기에서 옆 조각이 덮음): USG
- 버린 행정구역(NE adm1_code, 조각에도 이웃에도 넣지 않음 — 그 땅은 해안 맞추기에서 옆 조각이 덮거나 내륙 구멍 조각이 됨): COL+99?, VEN+99?, MEX+99?, BRA-599
- 미국: 하와이(`US-HI`, 오세아니아 몫)를 뺀 주 50개(워싱턴 D.C. 포함) US-AK·US-AL·US-AR·US-AZ·US-CA·US-CO·US-CT·US-DC·US-DE·US-FL·US-GA·US-IA·US-ID·US-IL·US-IN·US-KS·US-KY·US-LA·US-MA·US-MD·US-ME·US-MI·US-MN·US-MO·US-MS·US-MT·US-NC·US-ND·US-NE·US-NH·US-NJ·US-NM·US-NV·US-NY·US-OH·US-OK·US-OR·US-PA·US-RI·US-SC·US-SD·US-TN·US-TX·US-UT·US-VA·US-VT·US-WA·US-WI·US-WV·US-WY
- 프랑스 해외 땅: 기아나·마르티니크·과들루프(FR-GF·FR-MQ·FR-GP). 유럽 조각의 프랑스는 본토·코르시카뿐이라 조각 id가 부딪치지 않는다.
- 러시아 추코트카(RU-CHU): 범위 상자가 서경 쪽(서경 169.6~180°) 폴리곤만 남긴다. 동경 쪽 추코트카는 유럽 권역 손 도형(러시아 아시아 쪽)이 그린다.
- 범위 상자 [서, 남, 동, 북] = [-180, -60, -11, 84]. 상자 밖에 통째로 있는 폴리곤은 뺐다: NLD Groningen(Province): 폴리곤 2/2개; NLD Drenthe(Province): 폴리곤 1/1개; NLD Overijssel(Province): 폴리곤 1/1개; NLD Gelderland(Province): 폴리곤 1/1개; NLD Limburg(Province): 폴리곤 1/1개; NLD Zeeland(Province): 폴리곤 5/5개; NLD Noord-Brabant(Province): 폴리곤 1/1개; USA Alaska(State): 폴리곤 9/181개; RUS Chukchi Autonomous Okrug(Autonomous Province): 폴리곤 4/10개; NLD Zuid-Holland(Province): 폴리곤 1/1개; NLD Noord-Holland(Province): 폴리곤 2/2개; NLD Friesland(Province): 폴리곤 5/5개; NLD Flevoland(Province): 폴리곤 1/1개; NLD Utrecht(Province): 폴리곤 1/1개
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

- 고르기: 55개 나라에서 조각 664개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 457개, 그래서 통째로 빠진 조각 19개(AG-11 Redonda, AI-X00 , BLM-5113 Saint Barthélemy, BS-BI Bimini, BS-BP Black Point, BS-BY Berry Islands, BS-HI Harbour Island, BS-MI Moore's Island, BS-RC Rum Cay, BS-RI Ragged Island, BS-SW Spanish Wells, CO-SAP San Andrés y Providencia, GD-10 Carriacou and Petite Martinique, NL-BQ2 Saba, NL-BQ3 St. Eustatius, TCA-5006 South Caicos and East Caicos, TCA-5007 Grand Turk, TCA-5008 Salt Cay, VC-06 Grenadines).
- 격자·간략화: 꼭짓점 332,248개(조각별 합) → 142,803개. 간략화하지 않은 작은 조각 92개, 넓이에 비례해 덜 간략화한 조각 104개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 3개(BR-MA, BR-PA, PA-8). 격자에 맞추며 스스로 엇갈린 arc 고리 2개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.18%, 조각 가운데값 0.48%, 큰 것 BS-CK 13.4%, FR-MQ 3.6%, FLK-5152 3.6%, BS-SA 3.4%, HT-SD 3.4%. (polyclip이 대칭차를 계산하지 못해 뺀 조각: US-IN)
- 해안 맞추기: 조각에 붙인 해안 조각 9,248개 853,568km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 44,134km². 가까운 조각끼리 나눈 큰 해안 조각 192개, 닿는 조각 없이 가까운 조각에 붙인 것 2개, 붙일 곳이 없는 것 6개, 내륙 구멍으로 만든 조각 4개. 해안 조각과 조각 변의 교차점 17,665개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 32,552km² (-75.17, -49.97): CL-MA 25121km², CL-AI 7431km²
  - 18,843km² (-50.90, -0.79): BR-PA 17202km², BR-AP 1640km²
  - 8,417km² (-78.90, -8.52): PE-LAL 2800km², PE-LAM 2040km², PE-ANC 1912km², PE-PIU 945km², PER-591 732km²
  - 7,003km² (-69.95, -55.05): CL-MA 6568km², AR-V 435km²
  - 6,013km² (-66.51, 80.60): GL-QA 3658km², GRL-2742 2353km², CA-NU 3km²
  - 4,797km² (-48.01, -25.26): BR-SP 2761km², BR-PR 1565km², BR-SC 481km²
  - 4,789km² (-17.37, 14.72): 이웃 SEN Thiès 1527km², 이웃 SEN Fatick 1172km², 이웃 SEN Dakar 737km², 이웃 GMB North Bank 450km², 이웃 SEN Louga 285km², 이웃 GMB Banjul 207km², 이웃 GMB West Coast 184km², 이웃 GMB Lower River 118km², 이웃 MRT Trarza 109km²
  - 4,786km² (-15.59, 11.81): 이웃 GNB Bolama 1271km², 이웃 GNB Biombo 1183km², 이웃 GNB Quinara 1020km², 이웃 GNB Cacheu 911km², 이웃 GNB Oio 197km², 이웃 GNB Bissau 122km², 이웃 GNB Tombali 42km², 이웃 GNB Bafatá 41km²
  - 4,729km² (-51.26, 64.21): GL-SM 4652km², GL-QE 76km²
  - 4,073km² (-76.77, -12.61): PER-591 2054km², PER-587 1257km², PE-ICA 704km², PE-CAL 64km²
  - 3,845km² (-28.16, 70.61): GL-SM 3824km², GRL-2742 20km²
  - 3,645km² (-77.11, 8.62): CO-ANT 2059km², CO-CHO 811km², CO-COR 521km², PA-KY 256km²
- T자 접점: 꼭짓점 9개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 1,737개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 156조각 0.003856km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 0.060km 김(공유하지 않은 이웃 경계 약 0.030km, 기준 0.1km 이하), 합친 폴리곤 300개 / 합집합 300개
  - 통과: (d) 파일 크기 887,563B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 날짜변경선: 범위 상자 서쪽 끝이 서경 180°라 알류샨 동경 쪽(애투·키스카 등 `US-AK` 폴리곤 9개, 합 약 2,039 km², 모두 1,000 km² 미만)은 상자 밖으로 빠진다 — 생성기 `scripts/geo/areas/americas.mjs`가 손 도형으로 그린다. 추코트카 `RU-CHU`는 서경 쪽만 들어오고, 러시아 손 도형 동쪽 끝(동경 179.9°)과 이 조각 서쪽 끝(서경 180°) 사이 약 0.1° 틈(약 3,000 km², 어림)은 생성기가 메운다.
- 빼거나 남긴 땅: 하와이(`US-HI`)는 include 목록에서 뺐다(오세아니아 몫). 이스터섬(약 175 km²)은 칠레 발파라이소주 `CL-VS`의 폴리곤 하나라 그 조각에 남는다(오세아니아가 따로 그림). 관타나모(`USG`)는 drop, NE 임시 칸 셋(말펠로·아베스·알라크란)과 브라질 연방구는 dropCodes로 뺐고 연방구 땅은 내륙 구멍 조각이 됐다. 내륙 구멍은 (이름 없음) 1.2km², Argentina 1403.7km², Uruguay 1.7km², Brazil 5810.0km².
- 섬: 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬(바하마 비미니·베리 제도 등, 산안드레스, 사바·신트외스타티위스, 생바르텔레미, 그레나딘, 터크스케이커스 남쪽 섬 등 — 모두 1,000 km² 미만)은 빠진다. 1,000 km² 넘는 섬(쿠바·이스파니올라·자메이카·푸에르토리코·트리니다드·안드로스·포클랜드·사우스조지아·뉴펀들랜드·밴쿠버·캐나다 북극 제도 등)은 모두 조각에 있다.
- 거친 곳: 누나부트·노스웨스트 준주·퀘벡·온타리오·브리티시컬럼비아, 알래스카·텍사스와 미국 서부 주, 아마조나스·파라·마투그로수, 그린란드 국립공원 등 한 조각이 20만 km²를 넘는 곳이 많아 조약선·식민 경계는 대부분 칼선이다.
- 조각 수: 캐나다 13·미국 50·멕시코 32·브라질 26·아르헨티나 24·칠레 16·페루 26·콜롬비아 32·베네수엘라 25·볼리비아 9·그린란드 6.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| (구멍) | (이름 없음) | 4 | 구멍 4 |
| ABW | Aruba | 1 | (없음) 1 |
| AIA | Anguilla | 14 | District 14 |
| ARG | Argentina | 24 | Province 21, Federal District 2, National Territory 1 |
| ATG | Antigua and Barbuda | 7 | Parish 6, Dependency 1 |
| BHS | The Bahamas | 22 | District 21, Capital 1 |
| BLZ | Belize | 6 | District 6 |
| BMU | Bermuda | 11 | (없음) 11 |
| BOL | Bolivia | 9 | Department 9 |
| BRA | Brazil | 26 | State 26 |
| BRB | Barbados | 11 | Parish 11 |
| CAN | Canada | 13 | Province 10, Territory 3 |
| CHL | Chile | 16 | Region 16 |
| COL | Colombia | 32 | Department 22, Commissiary 5, Intendancy 4, Federal District 1 |
| CRI | Costa Rica | 7 | Province 7 |
| CUB | Cuba | 16 | Province 15, Special Municipality 1 |
| CUW | Curaçao | 1 | (없음) 1 |
| CYM | Cayman Islands | 1 | (없음) 1 |
| DMA | Dominica | 10 | Parish 10 |
| DOM | Dominican Republic | 32 | Province 31, National District 1 |
| ECU | Ecuador | 24 | Province 24 |
| FLK | Falkland Islands | 1 | (없음) 1 |
| FRA | France | 3 | Overseas department 3 |
| GRD | Grenada | 6 | Parish 6 |
| GRL | Greenland | 6 | (없음) 6 |
| GTM | Guatemala | 22 | Department 22 |
| GUY | Guyana | 10 | Region 10 |
| HND | Honduras | 18 | Department 18 |
| HTI | Haiti | 10 | Department 10 |
| JAM | Jamaica | 14 | Parish 14 |
| KNA | Saint Kitts and Nevis | 14 | Parish 14 |
| LCA | Saint Lucia | 11 | Quarter 11 |
| MAF | Saint Martin | 1 | (없음) 1 |
| MEX | Mexico | 32 | State 31, Federal District 1 |
| MSR | Montserrat | 3 | Parish 3 |
| NIC | Nicaragua | 17 | Department 15, Autonomous Region 2 |
| NLD | Caribbean Netherlands | 1 | Special Municipality 1 |
| PAN | Panama | 12 | Province 9, Indigenous Territory 3 |
| PER | Peru | 26 | Department 24, Captial District 1, Departamento 1 |
| PRI | Puerto Rico | 1 | (없음) 1 |
| PRY | Paraguay | 18 | Department 17, Capital District 1 |
| RUS | Russia | 1 | Autonomous Province 1 |
| SGS | South Georgia and the Islands | 1 | (없음) 1 |
| SLV | El Salvador | 14 | Department 14 |
| SPM | Saint Pierre and Miquelon | 2 | Commune 2 |
| SUR | Suriname | 10 | District 10 |
| SXM | Sint Maarten | 1 | (없음) 1 |
| TCA | Turks and Caicos Islands | 3 | (없음) 3 |
| TTO | Trinidad and Tobago | 16 | Region 11, City 5 |
| URY | Uruguay | 19 | Department 19 |
| USA | United States of America | 50 | State 49, Federal District 1 |
| VCT | Saint Vincent and the Grenadines | 5 | Parish 5 |
| VEN | Venezuela | 25 | State 23, Capital District 1, Federal Dependency 1 |
| VGB | British Virgin Islands | 1 | (없음) 1 |
| VIR | United States Virgin Islands | 3 | (없음) 3 |
