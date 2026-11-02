# 행정구역 조각 (Natural Earth admin-1 파생)

이 폴더의 파일은 Natural Earth 1:10m Admin 1 v5.1.2(퍼블릭 도메인)에서 만든 파생 자료다. 원본: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson (git blob SHA-1 4a8438f98ac7dfec7dc1739b1eaf91398ad33f22, 40,726,851B). Made with Natural Earth.

- 이 폴더는 `npm run prep:fragments`(`scripts/prep-fragments.mjs`)가 쓴다. 손으로 고치지 않는다(아래 sha256을 `npm run check:generator`가 확인한다).
- 조각은 국경 생성기 안에서만 쓴다(`scripts/geo/lib.mjs`의 `loadFragments`·`F(...ids)`). 조각을 `level: region` Entity로 내보내지 않는다(DESIGN.md §7 6번의 배타 가정).
- 현대 행정구역이므로 역사 경계와 다르다. 시대별 나라 영토는 이 조각을 묶은 근사이고, 조각을 가로지르는 경계는 생성기에서 따로 긋는다.
- 검사: `npm run check:fragments`(나라별 대조·겹침·빈틈·해안), 근현대 국경 대조는 `npm run compare:cshapes`(CShapes 2.0이 `.cache/cshapes/`에 있을 때만, 좌표는 저장소에 쓰지 않음).

## 다시 만들기

1. 위 원본을 받아 `.cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`에 둔다(`.cache/`는 git에서 뺀다). 스크립트가 크기와 git blob SHA-1을 확인한다.
2. `npm run prep:fragments -- --region south-asia .cache/natural-earth/v5.1.2/ne_10m_admin_1_states_provinces.geojson`
3. 처음부터 두 번 만들어 바이트가 같고 자체 검사를 모두 통과해야 쓴다. 이미 있는 파일과 다르면 조각별 면적 변화를 보인다.

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `south-asia.topo.json` | 142,630B | `9fbd7382ec2cb404d547c82dd95f3832fcb59c49fbe154074ccf6b3d03837e9a` |

- TopoJSON. transform은 scale [0.0001, 0.0001], translate [0, 0]이라 좌표 = 정수 × 0.0001°다. 다른 권역 파일도 같은 transform을 쓰므로 복호화한 좌표가 같다.
- `objects.fragments`: 조각 112개. `id`와 `properties` { adm0(NE adm0_a3), name, type(NE type_en), region(NE region, 있으면), unit(NE geonunit이 나라 이름과 다를 때) }
- `objects.domain`: 모든 조각을 arc로 합친 권역 바깥선(MultiPolygon).
- arc 356개, 점 11,560개.

## 조각 id

- ISO 3166-2 코드(`XX-YYY`, 예: `IN-TG`)가 알맞고 겹치지 않으면 그 값: 110개
- 아니면 NE adm1_code(`ABC-1234`, 예: 시아첸 빙하 `-99-X06~`): 1개
- 그것도 아니면 조각이 하나뿐인 나라의 adm0_a3(`KAS` 등): 1개
- id는 NE 판을 올리면 바뀔 수 있다. 판을 바꿀 때는 생성기의 조각 소유표를 함께 고친다.

## 권역과 매개변수

- 나라(adm0_a3): IND, PAK, BGD, NPL, BTN, LKA, MDV, KAS
- 범위 상자 [서, 남, 동, 북] = [60.5, -1, 97.5, 37.2]. 상자 밖에 통째로 있는 폴리곤은 뺐다: 없음
- 아래층 조각: `middle-east.topo.json`(sha256 67715a46fe84646b…)의 조각을 그 지역 원본 행정구역 대신 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺐다: PAK Baluchistan 29.349km². 이음매 선은 아래층 조각 바깥선 그대로다.
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

- 고르기: 8개 나라에서 조각 112개. 육지(50m·110m)와 닿지 않아 뺀 섬 폴리곤 202개, 그래서 통째로 빠진 조각 20개(MDV-5236 Meemu, MV-00 Alifu Dhaalu, MV-01 Addu, MV-02 Alifu Alifu, MV-03 Lhaviyani, MV-04 Vaavu, MV-05 Laamu, MV-07 Haa Alifu, MV-08 Thaa, MV-13 Raa, MV-14 Faafu, MV-17 Dhaalu, MV-20 Baa, MV-23 Haa Dhaalu, MV-24 Shaviyani, MV-25 Noonu, MV-26 Kaafu, MV-27 Gaafu Alifu, MV-28 Gaafu Dhaalu, MV-29 Gnaviyani).
- 격자·간략화: 꼭짓점 53,527개(조각별 합) → 19,293개. 간략화하지 않은 작은 조각 22개, 넓이에 비례해 덜 간략화한 조각 9개. 간략화가 링을 꼬이게 해 그 arc만 덜 간략화한 조각 0개(없음). 격자에 맞추며 스스로 엇갈린 arc 고리 8개를 잘라 냈다(0.000km²).
- 간략화 정도(격자에 맞춘 원래 도형과의 대칭차 / 원래 넓이): 전체 0.31%, 조각 가운데값 0.72%, 큰 것 IN-PY 5.1%, IN-AN 4.5%, BD-A 4.4%, IN-DH 3.7%, LK-41 3.4%.
- 해안 맞추기: 조각에 붙인 해안 조각 569개 31,981km²(110m 육지가 만·다도해·갯벌을 덮는 곳이 대부분). 이웃 행정구역 쪽으로 보고 버린 것 14,032km². 가까운 조각끼리 나눈 큰 해안 조각 19개, 닿는 조각 없이 가까운 조각에 붙인 것 0개, 붙일 곳이 없는 것 1개, 내륙 구멍으로 만든 조각 0개. 해안 조각과 조각 변의 교차점 1,086개를 양쪽 링에 끼웠다.
- 나눈 큰 해안 조각(넓은 것 12개):
  - 3,475km² (96.74, 16.64): 이웃 MMR Yangon 1143km², 이웃 MMR Ayeyarwady 894km², 이웃 MMR Bago 735km², 이웃 MMR Mon 700km²
  - 2,669km² (94.32, 18.34): 이웃 MMR Rakhine 2554km², 이웃 MMR Ayeyarwady 114km²
  - 1,716km² (79.90, 8.78): LK-43 704km², LK-62 649km², LK-42 364km²
  - 1,303km² (90.63, 22.90): BD-A 690km², BD-C 375km², BD-B 237km²
  - 1,221km² (88.09, 21.96): IN-WB 1159km², IN-OR 62km²
  - 975km² (72.84, 20.78): IN-GJ 955km², IN-DH 19km²
  - 773km² (92.44, 20.63): 이웃 MMR Rakhine 750km², BD-B 23km²
  - 665km² (79.85, 11.27): IN-TN 596km², IN-PY 70km²
  - 551km² (81.06, 8.89): LK-53 341km², LK-45 210km²
  - 362km² (80.26, 9.55): LK-42 267km², LK-41 95km²
  - 275km² (81.50, 8.09): LK-51 232km², LK-53 43km²
  - 222km² (89.87, 22.24): BD-A 118km², BD-D 104km²
- T자 접점: 꼭짓점 0개를 이웃 조각의 변에 끼웠다.
- 자체 검사:
  - 통과: (a) 조각 쌍 겹침: 가장 큰 쌍 0.0000km², 겹친 쌍 0개 합 0.0000km² (살핀 쌍 354개, 기준 쌍마다 1km² 미만)
  - 통과: (b) 덮이지 않은 육지(빌드가 쓰는 land-50m ∪ land-110m 그대로, 가장 가까운 것이 조각인 곳) 11조각 0.005454km² (기준 0.01km² 미만)
  - 통과: (c) arc 공유: 모두 합친 둘레가 합집합보다 -0.000km 김(공유하지 않은 이웃 경계 약 -0.000km, 기준 0.1km 이하), 합친 폴리곤 22개 / 합집합 22개
  - 통과: (d) 파일 크기 142,630B (1MB 이하)
  - 통과: (e) 처음부터 두 번 만든 결과가 바이트 단위로 같음

## 따로 볼 곳

- 카슈미르: NE v5.1.2 admin-1은 실제 지배 기준이다. 인도 쪽은 잠무 카슈미르(`IN-JK`)·라다크(`IN-LA`), 파키스탄 쪽은 아자드 카슈미르(`PK-JK`)·길기트발티스탄(`PK-GB`, NE 이름 Northern Areas), 시아첸 빙하는 따로 조각 하나(`-99-X06~`, adm0 undefined)다. 악사이친과 샥스감은 중국(이웃이 아니라 넣지 않음) 땅이다.
- 인도 행정구역은 주·연방 직할지 36개뿐이라 거칠다(텔랑가나 `IN-TG` 등). 다드라 나가르 하벨리와 다만 디우는 2020년 합친 한 조각(`IN-DH`, 떨어진 조각 여럿)이다. 찬다나가르는 서벵골(`IN-WB`) 안이다.
- 파키스탄 행정구역은 8개(펀자브·신드·발루치스탄·카이베르파크툰크와·연방 직할 부족 지역·수도·아자드 카슈미르·길기트발티스탄)로 가장 거칠다. 방글라데시 7·네팔 14·부탄 20·스리랑카 25·몰디브 1. 조각 사이의 내륙 구멍은 없었다.

## 나라별 조각 표

| adm0 | 이름(NE admin) | 조각 수 | 단위(NE type_en) |
|---|---|---|---|
| BGD | Bangladesh | 7 | Division 7 |
| BTN | Bhutan | 20 | District 20 |
| IND | India | 36 | State 26, Union Territory 9, (없음) 1 |
| KAS | Siachen Glacier | 1 | (없음) 1 |
| LKA | Sri Lanka | 25 | District 25 |
| MDV | Maldives | 1 | Capital 1 |
| NPL | Nepal | 14 | Administrative Zone 9, District 5 |
| PAK | Pakistan | 8 | Province 4, Centrally Administered Area 2, Capital Territory 1, Territory 1 |
