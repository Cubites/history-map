# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region oceania .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `oceania.topo.json` | 162,950B | `f8f4e5bd5e9d79bc55e172ce7ce22bd1d46afc33cfd682eb27d3a918ebcf5379` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 138개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 431개, 점 13,986개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `PG-NCD`)가 알맞고 겹치지 않으면 그 값: 113개
- 아니면 NE adm1_code(`ABC-1234`, 예: 솔로몬 웨스턴 `SLB-3507`·초이슬 `SLB-3508`(둘이 ISO `SB-CH`를 함께 씀)·니우에 `NIU-5481`·저비스베이 `AUS-1932`): 21개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`GUM`·`KIR`·`PCN`·`TUV` 등): 4개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): AUS, NZL, PNG, SLB, VUT, NCL, FJI, WSM, ASM, TON, TUV, KIR, NRU, MHL, FSM, PLW, GUM, MNP, PYF, COK, NIU, WLF, PCN, NFK
- 버린 행정구역(NE adm1_code, 조각에도 이웃에도 넣지 않음 — 그 땅은 해안 맞추기에서 옆 조각이 덮거나 내륙 구멍 조각이 됨): KIR+99?
- 미국 하와이(US-HI): 아메리카 조각의 미국은 하와이를 뺀 주 50개라 조각 id가 부딪치지 않는다. 북서 하와이 제도 작은 섬은 육지 자료와 닿지 않으면 빠진다.
- 범위 상자 4개(날짜변경선 양쪽, 각 [서, 남, 동, 북]) = [112.5, -54, 154, -9] · [165, -53, 180, -12] · [128, -23, 180, 22] · [-180, -46, -124, 29]. 어느 상자에도 걸치지 않는 폴리곤은 뺐다: AUS Macquarie Island(-): 폴리곤 1/1개; AUS Lord Howe Island(Territory): 폴리곤 1/1개
- 아래층 조각: `southeast-asia.topo.json`(sha256 219ff5caabb0f177…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: PNG Sandaun 0.231km²; PNG Western 13.114km². 이음매 선은 아래층 조각 바깥선 그대로다.
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
| `crackMaxKm` | 0.2 (이 지역만 — regions.mjs params) | (c) 공유하지 않은 이웃 경계 기준(km) |
| `sizeWarnBytes` | 1000000 | (d) 이보다 크면 경고(바이트) |

## 가공 결과

- 고르기: 24개 나라에서 조각 138개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 281개, 그래서 통째로 빠진 조각 26개(ASM-4999 Manu's, ASM-5000 Rose Atoll, ASM-5001 Swain's Island, COK-4950 Atiu, COK-4951 Aitutaki, COK-4952 Mangaia, COK-4954 Mitiaro, COK-4955 Mauke, COK-4956 Palmerston, COK-4959 Pukapuka, COK-4960 Rakahanga, COK-4961 Manihiki, COK-4962 Penrhyn, NFK Norfolk Island, NZL-5471 Kermadec Islands, NZL-5476 Three Kings Islands, NZL-5477 Antipodes Islands, NZL-5480 The Snares, PW-010 Angaur, PW-100 Kayangel, PW-150 Koror, PW-350 Peleliu, PW-370 Sonsorol, PYF-4966 Austral Islands, TO-02 Ha'apai, TO-03 Niuas).
- 격자·간략화: 꼭짓점 38,760개(조각별 합) → 16,020개. 간략화하지 않은 작은 조각 52개, 넓이에 비례해 덜 간략화한 조각 49개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 2개(KIR, PYF-4965). 격자에 맞추며 스스로 엇갈린 arc 고리 0개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.13%, 조각 가운데값 0.40%, 큰 것 NZL-5479 17.6%, FJ-E 11.8%, SB-CE 10.3%, VU-SEE 4.6%, SB-TE 4.4%.
- 해안 맞추기: 조각에 붙인 해안 조각 2,173개 139,756km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 10km². 가까운 조각끼리 나눈 큰 해안 조각 27개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 6개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 4,277개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 6,698km² (165.73, -21.16): NCL-559 5000km², NCL-1259 1696km²
  - 1,506km² (174.71, -37.39): NZ-AUK 785km², NZ-WKO 722km²
  - 1,012km² (176.13, -41.09): NZ-WGN 863km², NZ-MWT 152km²
  - 970km² (174.19, -36.27): NZ-NTL 487km², NZ-AUK 483km²
  - 795km² (178.04, -38.83): NZ-GIS 640km², NZ-HKB 155km²
  - 781km² (178.66, -17.66): FJ-C 476km², FJ-W 269km², FJ-E 36km²
  - 733km² (144.90, -4.12): PG-MPM 615km², PG-ESW 118km²
  - 677km² (160.47, -9.48): SB-GU 627km², SB-CT 50km²
  - 675km² (150.31, -35.71): AU-NSW 637km², AUS-1932 39km²
  - 671km² (147.52, -7.64): PG-MPL 622km², PG-NPP 48km²
  - 492km² (151.65, -4.70): PG-EBR 280km², PG-WBK 211km²
  - 409km² (146.35, -8.56): PG-CPM 257km², PG-GPK 153km²
- T자 접점: 꼭짓점 2개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 237개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 58조각 0.013612km² (기준 0.05km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 0.260km 김(공유하지 않은 이웃 경계 약 0.130km, 기준 0.2km 이하), 합친 폴리곤 200개 / 합집합 200개
  - 통과: (d) 파일 크기 162,950B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 이음매: 서뉴기니 쪽은 동남아 조각(under) 바깥선 그대로다. 파푸아뉴기니 샌다운 `PG-SAN`·웨스턴 `PG-WPD`가 인도네시아 파푸아 `ID-PA`와 동경 141° 자오선(NE 선은 약 140.98°)에서 맞물리고, 플라이강 굽이(남쪽 141° 서쪽 약 2,393 km²)는 동남아 조각의 원본 국경 그대로 인도네시아 쪽이다.
- 날짜변경선: 범위 상자가 넷이다(동경 쪽 셋·서경 쪽 하나, 아래 매개변수). NE가 경도 180°에서 폴리곤을 나눠 두어 피지 동부 `FJ-E`·북부 `FJ-N`만 양쪽 폴리곤을 한 조각에 가진다. 키리바시 `KIR`(길버트·피닉스·라인 제도)는 한 조각이 양쪽에 흩어져 있다. 이스터섬(약 130 km²)은 아메리카 칠레 발파라이소주 `CL-VS`에 남는다.
- 섬: 로드하우섬(뉴사우스웨일스 `AU-NSW`와 ISO를 함께 쓰는 NE 칸, 약 15 km²)과 매쿼리섬(약 119 km²)은 어느 범위 상자에도 걸치지 않아 뺐다(그래서 뉴사우스웨일스 조각 id는 `AU-NSW`). 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬은 빠진다(쿡 제도 라로통가 밖 열 칸, 노퍽, 케르마덱·스리킹스·앤티포디스·스네어스, 팔라우 남부, 미국령 사모아 마누아, 통가 하아파이·니우아스, 오스트랄 제도 등 — 모두 1,000 km² 미만). 1,000 km² 넘는 섬(뉴기니·뉴질랜드 두 섬·태즈메이니아·뉴브리튼·뉴아일랜드·부건빌·과달카날·비티레부·바누아레부·누벨칼레도니·에스피리투산토·하와이섬 등)은 모두 조각에 있다.
- 거친 곳: 오스트레일리아 서오스트레일리아 `AU-WA`·퀸즐랜드 `AU-QLD`·노던 테리토리 `AU-NT`·남오스트레일리아 `AU-SA`·뉴사우스웨일스 `AU-NSW`·빅토리아 `AU-VIC`는 한 조각이 20만 km²를 넘어 식민지 문서 경계(동경 135°·129°·138°·132°, 남위 26° 등)는 칼선이다.
- 조각 수: 오스트레일리아 9·뉴질랜드 20·파푸아뉴기니 20·솔로몬 10·바누아투 6·누벨칼레도니 3·피지 5·사모아 11·통가 3·나우루 14·팔라우 11·쿡 제도 1·프랑스령 폴리네시아 4·미국 하와이 1. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| ASM | American Samoa | 2 | (없음) 2 |
| AUS | Australia | 9 | State 6, Territory 3 |
| COK | Cook Islands | 1 | (없음) 1 |
| FJI | Fiji | 5 | Division 5 |
| FSM | Federated States of Micronesia | 4 | (없음) 4 |
| GUM | Guam | 1 | (없음) 1 |
| KIR | Kiribati | 1 | (없음) 1 |
| MHL | Marshall Islands | 2 | (없음) 2 |
| MNP | Northern Mariana Islands | 4 | (없음) 4 |
| NCL | New Caledonia | 3 | Province 3 |
| NIU | Niue | 1 | (없음) 1 |
| NRU | Nauru | 14 | (없음) 14 |
| NZL | New Zealand | 20 | Regional Council 11, Unitary Authority 5, (없음) 3, Special Island Authority 1 |
| PCN | Pitcairn Islands | 1 | (없음) 1 |
| PLW | Palau | 11 | (없음) 11 |
| PNG | Papua New Guinea | 20 | Province 20 |
| PYF | French Polynesia | 4 | (없음) 4 |
| SLB | Solomon Islands | 10 | Province 10 |
| TON | Tonga | 3 | (없음) 3 |
| TUV | Tuvalu | 1 | (없음) 1 |
| USA | United States of America | 1 | State 1 |
| VUT | Vanuatu | 6 | Province 6 |
| WLF | Wallis and Futuna | 3 | (없음) 3 |
| WSM | Samoa | 11 | (없음) 11 |
