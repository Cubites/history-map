# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region sub-saharan-africa .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `sub-saharan-africa.topo.json` | 552,884B | `b9dfadada917c993bedd8718aeb2d66991e7373a6d7216dca76ebadf4d700407` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 779개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 2,270개, 점 39,215개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `ZA-NC`)가 알맞고 겹치지 않으면 그 값: 743개
- 아니면 NE adm1_code(`ABC-1234`, 예: 소말릴란드 `SOL`(NE 고유 adm0, 조각 하나)): 35개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`SOL` 등): 1개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): SDN, SDS, ERI, DJI, ETH, SOM, SOL, KEN, UGA, RWA, BDI, TZA, MRT, MLI, NER, TCD, SEN, GMB, GNB, GIN, SLE, LBR, CIV, BFA, GHA, TGO, BEN, NGA, CMR, CAF, GNQ, GAB, COG, COD, AGO, ZMB, MWI, MOZ, ZWE, BWA, NAM, ZAF, LSO, SWZ, MDG, MUS, SYC, COM, CPV, STP, SHN
- 프랑스 해외 땅: 레위니옹·마요트(FR-RE·FR-YT). 유럽 조각의 프랑스는 본토·코르시카뿐(해외 데파르트망은 유럽 상자 밖)이라 조각 id가 부딪치지 않는다.
- 범위 상자 [서, 남, 동, 북] = [-26, -35, 58, 25.2]. 상자 밖에 통째로 있는 폴리곤은 뺐다: ZAF Western Cape(Province): 폴리곤 2/3개; SHN Tristan da Cunha(-): 폴리곤 2/2개; MUS Rodrigues(Dependency): 폴리곤 1/1개
- 아래층 조각: `middle-east.topo.json`(sha256 67715a46fe84646b…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: MLI Timbuktu 1.680km²; TCD Ennedi 1.483km²; TCD Borkou 2.839km²; TCD Tibesti 4.462km²; NER Agadez 7.458km²; MRT Tiris Zemmour 2.358km²; SDN Northern 5.935km²; SDN River Nile 0.022km²; MRT Dakhlet Nouadhibou 0.411km²; MRT Adrar 0.519km²; MLI Kidal 17.112km²; SDN North Darfur 0.211km²; SDN Red Sea 0.321km². 이음매 선은 아래층 조각 바깥선 그대로다.
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

- 고르기: 52개 나라에서 조각 779개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 39개, 그래서 통째로 빠진 조각 7개(CV-BR Brava, GQ-AN Annobón, MU-AG Agaléga, SC-07 Baie Sainte Anne, SC-14 Grand'Anse Praslin, SC-15 La Digue and Inner Islands, SYC-5197 Outer Islands).
- 격자·간략화: 꼭짓점 160,172개(조각별 합) → 69,692개. 간략화하지 않은 작은 조각 39개, 넓이에 비례해 덜 간략화한 조각 101개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 1개(NG-CR). 격자에 맞추며 스스로 엇갈린 arc 고리 1개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.17%, 조각 가운데값 0.35%, 큰 것 GW-BL 23.6%, SC-18 11.2%, TZ-10 10.3%, SC-21 4.8%, GW-QU 4.6%.
- 해안 맞추기: 조각에 붙인 해안 조각 2,295개 134,837km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 4km². 가까운 조각끼리 나눈 큰 해안 조각 52개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 3,677개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 11,209km² (5.20, 5.43): NG-LA 3173km², NG-DE 1743km², NG-BY 1724km², NG-ON 1389km², TG-M 754km², BJ-AQ 563km², BJ-MO 563km², BJ-OU 319km², NG-RI 286km², GH-TV 261km², NG-OG 225km², BJ-LI 206km²
  - 9,787km² (9.78, 2.65): GQ-LI 2785km², CM-SW 2349km², CM-LT 2230km², CM-SU 1515km², GA-1 866km², NG-CR 33km², GQ-BN 10km²
  - 9,589km² (10.65, -3.49): GA-8 3212km², GA-5 2156km², CG-5 1927km², AO-CAB 1051km², CD-BC 705km², AO-ZAI 381km², CG-16 160km²
  - 9,382km² (13.07, -9.39): AO-BGO 3070km², AO-CUS 1873km², AO-LUA 1715km², AO-ZAI 1458km², AO-BGU 1267km²
  - 6,508km² (-9.75, 5.53): LR-GB 1721km², LR-GK 1315km², LR-SI 1067km², LR-RI 543km², LR-BM 530km², LR-MO 513km², LR-MG 499km², LR-CM 198km², LR-MY 121km²
  - 5,263km² (45.94, 2.36): SO-SH 3072km², SO-SD 1284km², SO-BN 503km², SO-GA 270km², SO-JD 131km²
  - 4,788km² (-17.37, 14.72): SN-TH 1533km², SN-FK 1160km², SN-DK 745km², GM-N 450km², SN-LG 285km², GM-B 205km², GM-W 183km², GM-L 118km², MR-06 109km²
  - 4,787km² (-15.59, 11.81): GW-BL 1236km², GW-BM 1197km², GW-QU 1031km², GW-CA 911km², GW-OI 197km², GW-BS 132km², GW-TO 42km², GW-BA 41km²
  - 4,164km² (49.23, 6.57): SO-MU 3048km², SO-NU 1096km², SO-BR 16km²
  - 3,988km² (14.01, -21.84): NA-ER 2177km², NA-KU 1412km², NA-HA 404km²
  - 3,614km² (-12.50, 7.48): SL-S 3285km², LR-CM 195km², SL-W 133km²
  - 3,544km² (49.69, 11.50): SO-BR 2248km², SOL 1296km²
- T자 접점: 꼭짓점 3개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 2,603개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 8조각 0.000313km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 -0.000km 김(공유하지 않은 이웃 경계 약 -0.000km, 기준 0.1km 이하), 합친 폴리곤 34개 / 합집합 34개
  - 통과: (d) 파일 크기 552,884B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 이음매: 북쪽은 서아시아 조각(under) 바깥선 그대로다. 수단–이집트는 북위 22° 선(NE 모양)이고 할라이브 삼각지대는 이집트 홍해주(`EG-BA`, 서아시아 조각), 비르타윌은 수단 홍해주(`SD-RS`)에 들어 있다. 아우주 띠는 차드 티베스티(`TD-TI`)다.
- 섬: 잔지바르 제도는 탄자니아 조각 다섯(`TZ-06`·`TZ-07`·`TZ-10`·`TZ-11`·`TZ-15`)으로 따로 떨어진다. 비오코는 적도기니 조각이다. 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬(트리스탄다쿠냐·로드리게스·아갈레가·아노본·브라바 등, 모두 1,000 km² 미만)은 빠진다.
- 거친 곳: 수단 북부주·다르푸르·코르도판, 에티오피아 오로미아·소말리, 말리 팀북투, 니제르 아가데즈, 차드 보르쿠·티베스티, 콩고 민주 공화국(주 11개)은 한 조각이 20만 km²를 넘어 식민 분할선·옛 나라 경계는 칼선이다.
- 조각 수: 수단 17·남수단 10·에티오피아 11·소말리아 13·케냐 8·탄자니아 30·우간다 112·나이지리아 37·말리 9·콩고 민주 공화국 11·앙골라 18·남아프리카 9·마다가스카르 22. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| AGO | Angola | 18 | Province 18 |
| BDI | Burundi | 17 | Province 17 |
| BEN | Benin | 12 | Department 12 |
| BFA | Burkina Faso | 45 | Province 45 |
| BWA | Botswana | 15 | District 9, Town 3, City 2, Township 1 |
| CAF | Central African Republic | 17 | Prefecture 14, Economic Prefecture 2, Autonomous Commune 1 |
| CIV | Ivory Coast | 19 | Department 12, Region 7 |
| CMR | Cameroon | 10 | Province 10 |
| COD | Democratic Republic of the Congo | 11 | Province 10, Neutral City 1 |
| COG | Republic of the Congo | 12 | Region 12 |
| COM | Comoros | 3 | (없음) 3 |
| CPV | Cape Verde | 21 | (없음) 21 |
| DJI | Djibouti | 6 | Region 5, City 1 |
| ERI | Eritrea | 6 | Region 6 |
| ETH | Ethiopia | 11 | Administrative State 11 |
| FRA | France | 2 | Overseas department 2 |
| GAB | Gabon | 9 | Province 9 |
| GHA | Ghana | 10 | Region 10 |
| GIN | Guinea | 34 | Prefecture 33, Administrative Zone 1 |
| GMB | Gambia | 6 | Division 5, Independent City 1 |
| GNB | Guinea Bissau | 9 | Region 8, Autonomous Sector 1 |
| GNQ | Equatorial Guinea | 6 | Province 6 |
| KEN | Kenya | 8 | Province 6, National Capital Area 2 |
| LBR | Liberia | 15 | County 15 |
| LSO | Lesotho | 10 | District 10 |
| MDG | Madagascar | 22 | Autonomous Province 22 |
| MLI | Mali | 9 | Region 8, District 1 |
| MOZ | Mozambique | 11 | Province 11 |
| MRT | Mauritania | 13 | Region 12, District 1 |
| MUS | Mauritius | 14 | District 8, City 6 |
| MWI | Malawi | 28 | District 28 |
| NAM | Namibia | 13 | Region 13 |
| NER | Niger | 8 | Department 7, Capital District 1 |
| NGA | Nigeria | 37 | State 37 |
| RWA | Rwanda | 5 | Province 5 |
| SDN | Sudan | 17 | State 15, Region 2 |
| SDS | S. Sudan | 10 | State 10 |
| SEN | Senegal | 14 | Region 14 |
| SHN | Saint Helena | 2 | (없음) 2 |
| SLE | Sierra Leone | 4 | Province 4 |
| SOL | Somaliland | 1 | (없음) 1 |
| SOM | Somalia | 13 | Region 13 |
| STP | Sao Tome and Principe | 2 | (없음) 2 |
| SWZ | Swaziland | 4 | District 4 |
| SYC | Seychelles | 22 | (없음) 22 |
| TCD | Chad | 22 | Prefecture 18, Préfecture 3, Capital 1 |
| TGO | Togo | 5 | Region 5 |
| TZA | United Republic of Tanzania | 30 | Region 30 |
| UGA | Uganda | 112 | District 88, County 24 |
| ZAF | South Africa | 9 | Province 9 |
| ZMB | Zambia | 10 | Province 10 |
| ZWE | Zimbabwe | 10 | Province 8, City 2 |
