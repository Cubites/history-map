# 강 기준선 (Natural Earth 파생)

`rivers.geojson`은 Natural Earth 1:10m 강 v5.1.2(퍼블릭 도메인)에서 뽑은 파생 자료다. 국경 생성기 상수 가운데 강을 따라 그은 선이 실제 강에서 얼마나 떨어졌는지 `npm run test:geo -- --only lines`(`scripts/test-geo/checks/lines.ts`)가 잴 때 기준으로만 쓴다. 지도에는 그리지 않는다.

- 이 폴더는 `npm run prep:rivers`(`scripts/prep-rivers.mjs`)가 쓴다. 손으로 고치지 않는다. `npm run prep:rivers -- --check`는 파일을 쓰지 않고 지금 꼬리표로 만든 결과가 이 파일과 같은지만 본다.
- 어느 강이 들어가는지는 `scripts/geo/shared.mjs`와 `scripts/geo/areas/*.mjs`의 꼬리표(`// @기준선 강 <키> ...`)가 정한다. 새 강을 재려면 `scripts/prep-rivers.mjs`의 `RIVER_SETS`에 키와 Natural Earth 이름을 더하고 다시 돌린다.
- 현대 강줄기(1:10m, 일반화됨)이므로 오래된 시대에 물길이 바뀐 곳(예: 황허)과는 다르다. 지금은 시대에 상관없이 현대 물길을 쓰는 상수(국경이 현대 강을 따른다고 적힌 선)만 단다.
- 원본에 없는 강(올자강·아이더강·푸위안 물길 등)에는 꼬리표를 달 수 없다.

## 다시 만들기

1. `npm run prep:rivers` — 원본 두 파일이 `.cache/natural-earth/v5.1.2/`에 없으면 아래 주소에서 받고(`.cache/`는 git에서 뺀다), 크기와 sha256을 확인한다.
2. 처음부터 두 번 만들어 바이트가 같고 모든 꼬리표 키에 선분이 있어야 쓴다.

## 원본

| 파일 | 내용 | 크기 | sha256 |
|---|---|---|---|
| `ne_10m_rivers_lake_centerlines.geojson` | 세계 강·호수 중심선 | 7,307,743B | `bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a` |
| `ne_10m_rivers_europe.geojson` | 유럽 강 보충판 | 2,534,505B | `90712202ac46985812e90840df9acd5101599a9c649868d5bc55ee96c2fedd4c` |

주소: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/<파일 이름> (nvkelso/natural-earth-vector, v5.1.2 태그)

## 파일

| 파일 | 크기 | sha256 |
|---|---|---|
| `rivers.geojson` | 92,076B | `6408b61691998acf72d2954b83fd3b486bdc3c5140625ece0aeb7df87bca3aa3` |

- GeoJSON FeatureCollection, 한 줄에 선 하나. `properties`: `set`(꼬리표 키), `name`(Natural Earth 이름), `src`(`cl` = 세계판, `eu` = 유럽 보충판). geometry는 MultiLineString, 좌표는 [경도, 위도].
- 가공: 같은 이름의 선분을 모아 평면 더글러스-포이커 0.001°(약 100m)로 줄이고 소수 셋째 자리로 반올림했다.

## 강 표

| 키 | 강 | Natural Earth 이름 | 선 수 | 점 수(원본 → 가공) | 꼬리표를 단 상수 |
|---|---|---|---|---|---|
| `amur` | 흑룡강(아무르강) | Amur | 6 | 958 → 903 | `L_AMUR_KH`, `L_AMUR_UP`, `L_AMUR_LOW` |
| `argun` | 아르군강(어얼구나강) | Ergun | 1 | 316 → 282 | `L_ARGUN` |
| `danube` | 도나우강(다뉴브강) | Danube | 7 | 911 → 846 | `L_DANUBE_AT_W`, `L_DANUBE_AT_E` |
| `dnieper` | 드니프로강 | Dnieper | 12 | 812 → 726 | `L_1772` |
| `dvina` | 서드비나강 | Zapadnaya Dvina | 1 | 459 → 412 | `L_1772` |
| `liao` | 요하(랴오허) | Liao | 1 | 275 → 245 | `L_LIAO` |
| `main` | 마인강 | Main | 1 | 260 → 225 | `L_MAIN` |
| `rhine` | 라인강 | Rhine, Rhein | 7 | 512 → 467 | `L_RHINE_LEFT` |
| `shilka` | 실카강 | Shilka | 1 | 182 → 173 | `L_SHILKA` |
| `tumen` | 두만강 | Tumen | 1 | 199 → 186 | `L_YALU_TUMEN` |
| `ussuri` | 우수리강과 숭가차강(싱카이호에서 우수리강으로 흐르는 지류) | Ussuri, Wusuli, Song’acha | 3 | 376 → 351 | `L_USSURI` |
| `vistula` | 비스와강 | Vistula | 3 | 463 → 414 | `L_VISTULA_UP` |
| `volkhov` | 볼호프강 | Volkhov | 3 | 109 → 56 | `L_VOLKHOV` |
| `yalu` | 압록강 | Yalu | 3 | 308 → 280 | `L_YALU_TUMEN` |

## 출처 표기

Natural Earth는 퍼블릭 도메인이라 표기 의무가 없지만 CREDITS.md에 적는다. 같은 선을 재는 OpenStreetMap에서 딴 손그림 선(흑룡강 하류 등)은 OpenStreetMap 기여자의 ODbL 자료에서 왔고, 이 폴더의 파일에는 OpenStreetMap 자료가 들어 있지 않다.
