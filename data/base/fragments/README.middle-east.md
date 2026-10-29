# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region middle-east .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `middle-east.topo.json` | 211,837B | `67715a46fe84646b2a0f5fa938cdd5dcedb8f7556117ee303f8e205c2f0baf8b` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 298개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 948개, 점 15,113개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `IR-07`)가 알맞고 겹치지 않으면 그 값: 292개
- 아니면 NE adm1_code(`ABC-1234`, 예: 팔레스타인 서안 `WEB+00?`): 5개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`SAH` 등): 1개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): IRN, IRQ, SYR, LBN, ISR, PSX, JOR, SAU, YEM, OMN, ARE, QAT, BHR, KWT, EGY, LBY, TUN, DZA, MAR, SAH
- 범위 상자 [서, 남, 동, 북] = [-17.5, 11.5, 63.6, 40]. 상자 밖에 통째로 있는 폴리곤은 뺐다: 없음
- 아래층 조각: `europe.topo.json`(sha256 87bb89b1a4529396…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: MAR Tanger - Tétouan 0.006km²; IRQ Dihok 9.077km²; IRQ Arbil 8.717km²; IRN West Azarbaijan 33.240km²; MAR Oriental 0.009km²; IRN East Azarbaijan 4.125km²; IRN Ardebil 13.751km²; IRN Gilan 0.033km²; SYR Hasaka (Al Haksa) 5.483km²; SYR Ar Raqqah 1.071km²; SYR Aleppo 9.202km²; SYR Idlib 2.359km²; SYR Lattakia 0.793km². 이음매 선은 아래층 조각 바깥선 그대로다.
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

- 고르기: 20개 나라에서 조각 298개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 37개, 그래서 통째로 빠진 조각 1개(BH-15 Al Muḩarraq).
- 격자·간략화: 꼭짓점 51,359개(조각별 합) → 23,954개. 간략화하지 않은 작은 조각 5개, 넓이에 비례해 덜 간략화한 조각 32개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 0개(없음). 격자에 맞추며 스스로 엇갈린 arc 고리 1개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.11%, 조각 가운데값 0.31%, 큰 것 EG-DT 4.1%, OM-MU 3.9%, LB-JA 3.8%, YE-SA 3.4%, LB-NA 3.2%. (polyclip이 대칭차를 계산하지 못해 뺀 조각: IQ-MU)
- 해안 맞추기: 조각에 붙인 해안 조각 1,515개 74,756km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 23,859km². 가까운 조각끼리 나눈 큰 해안 조각 70개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 0개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 2,282개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 5,549km² (33.05, 28.83): EG-JS 4294km², EG-BA 744km², EG-SUZ 498km²
  - 4,988km² (53.78, 37.97): IR-21 2557km², 이웃 TKM Balkan 1732km², IR-27 415km², IR-19 286km²
  - 4,550km² (-7.42, 33.76): MA-10 1490km², MA-02 1106km², MA-07 659km², MA-08 605km², MA-09 388km², MA-01 297km², MA-11 16km²
  - 4,381km² (-15.40, 11.93): 이웃 GNB Biombo 1186km², 이웃 GNB Bolama 1082km², 이웃 GNB Cacheu 931km², 이웃 GNB Quinara 836km², 이웃 GNB Oio 212km², 이웃 GNB Bissau 93km², 이웃 GNB Bafatá 41km²
  - 3,718km² (-16.85, 13.98): 이웃 SEN Fatick 1176km², 이웃 SEN Thiès 1022km², 이웃 SEN Dakar 553km², 이웃 GMB North Bank 404km², 이웃 GMB Banjul 240km², 이웃 GMB West Coast 188km², 이웃 GMB Lower River 132km²
  - 3,593km² (-4.93, 35.45): MA-01 1620km², MA-03 1072km², MA-04 902km²
  - 3,183km² (-1.46, 35.46): DZ-13 1623km², DZ-46 801km², MA-04 395km², DZ-31 367km²
  - 2,995km² (-16.11, 17.80): 이웃 MRT Trarza 2221km², 이웃 MRT Nouakchott 721km², 이웃 MRT Inchiri 53km²
  - 2,983km² (47.65, 13.83): YE-AB 1200km², YE-HD 1062km², YE-SH 701km², YE-AD 20km²
  - 2,628km² (5.92, 36.88): DZ-21 1488km², DZ-18 820km², DZ-06 262km², DZ-23 60km²
  - 2,500km² (20.08, 31.10): LY-AJ 1685km², LY-BA 724km², LY-SR 91km²
  - 2,155km² (29.74, 31.16): EG-ALX 883km², EG-MT 868km², EG-BH 404km², EG-KFS 2km²
- T자 접점: 꼭짓점 3개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 947개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 6조각 0.004945km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 -0.000km 김(공유하지 않은 이웃 경계 약 -0.000km, 기준 0.1km 이하), 합친 폴리곤 14개 / 합집합 14개
  - 통과: (d) 파일 크기 211,837B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 서사하라: NE v5.1.2 admin-1은 모로코가 다스리는 서쪽(장벽 서쪽)을 모로코(MAR) 조각 셋에 넣는다. 라윤-부즈두르-사키아엘함라(`MA-15`)·우에드에드다합(`MA-16`)은 서사하라 땅, 굴밈-에스세마라(`MA-14`)는 북위 27°40′ 선을 넘어 모로코 본토와 서사하라 북부(스마라)에 걸친다. 서사하라(`SAH`, 조각 1개)는 장벽 동쪽만이다. 법적 서사하라 경계는 생성기의 칼선으로 정한다.
- 골란 고원: 이스라엘이 다스리는 쪽은 이스라엘 북부 지구(`IL-Z`)에, 유엔 완충지대는 시리아 `SYR-5261`(UNDOF), 나머지는 쿠네이트라(`SY-QU`)에 들어 있다. 동예루살렘은 이스라엘 예루살렘 지구(`IL-JM`)에 들어 있고, 서안(`WEB+00?`)·가자(`GAZ+00?`)는 팔레스타인(PSX) 조각 하나씩이다.
- 할라이브 삼각지대는 이집트 홍해주(`EG-BA`)에 들어 있고 비르타윌은 수단(이웃)이다. 사우디–쿠웨이트 옛 중립 지대는 북쪽이 쿠웨이트 아흐마디(`KW-AH`), 남쪽이 사우디 동부주(`SA-04`)로 나뉘어 있다. 원본에서 이란 호르모즈간(`IR-23`)에 든 아부무사와 대툰브·소툰브, 바레인의 하와르 제도·무하라크(`BH-15`)는 육지(50m·110m)와 닿지 않는 섬이라 조각에 없다. 소코트라는 하드라마우트(`YE-HD`)의 둘째 폴리곤이다. 시나이는 북시나이(`EG-SIN`)·남시나이(`EG-JS`) 두 조각이다.
- 조각 수: 이란 31·이라크 18·시리아 15·사우디 13·예멘 21·이집트 27·리비아 22·튀니지 23·알제리 48·모로코 16. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| ARE | United Arab Emirates | 9 | Emirate 9 |
| BHR | Bahrain | 4 | Governorate 4 |
| DZA | Algeria | 48 | Province 48 |
| EGY | Egypt | 27 | Governorate 27 |
| IRN | Iran | 31 | Province 31 |
| IRQ | Iraq | 18 | Province 18 |
| ISR | Israel | 6 | District 6 |
| JOR | Jordan | 12 | Province 12 |
| KWT | Kuwait | 6 | Province 6 |
| LBN | Lebanon | 6 | Province 6 |
| LBY | Libya | 22 | Municipality\|Governarate 22 |
| MAR | Morocco | 16 | Region 16 |
| OMN | Oman | 11 | Region 7, Province 4 |
| PSX | Gaza Strip | 2 | (없음) 2 |
| QAT | Qatar | 7 | Municipality 7 |
| SAH | Western Sahara | 1 | (없음) 1 |
| SAU | Saudi Arabia | 13 | Region 13 |
| SYR | Syria | 15 | Province 14, (없음) 1 |
| TUN | Tunisia | 23 | Governorate 23 |
| YEM | Yemen | 21 | Governorate 21 |
