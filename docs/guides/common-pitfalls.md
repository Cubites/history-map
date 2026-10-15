# 알려진 함정과 우회법 (모든 작업 공통)

> 세 안내서([border.md](border.md)·[war.md](war.md)·[event.md](event.md))가 모두 이 글을 가리킨다. 지시문에는 이 글 전체를 붙이지 말고 해당 항목만 옮긴다. 새로 겪은 함정은 아래에 한 줄씩 보탠다(날짜·증상·우회법).

## 환경·셸

- **파이썬 지리 라이브러리(shapely, geopandas, pyproj 등)가 없다.** 도형 계산은 Node로: 저장소가 쓰는 `polyclip-ts`(`createRequire('<repo>/package.json')('polyclip-ts')`로 불러온다), 점-다각형 판정은 인계 폴더 `pt-dh.mjs`의 `inRing` 같은 직접 짠 함수, 넓이는 위도 보정(`cos(lat)`)한 구면 근사.
- **셸은 둘이다.** Bash 도구(Git Bash)와 PowerShell 5.1. 5.1에는 `&&`·`||`·삼항이 없다(`A; if ($?) { B }`). 따옴표 섞인 JSON 인자(`pt-dh.mjs '[["서울",126.98,37.57]]' '[1900]'`)는 **bash 작은따옴표**로 넘기거나 파일에 쓰고 `"$(cat x.json)"`로 읽는다. PowerShell 여러 줄 글은 `@'…'@`(닫는 `'@`는 0열).
- **PowerShell 5.1 `Set-Content`/`Add-Content`는 기본이 ANSI**라 한국어 파일이 깨진다. 파일은 Write 도구나 Node(`writeFileSync`, UTF-8)로 쓴다. 생성한 글 안의 경로는 `/`로 쓴다(역슬래시가 이스케이프로 먹혀 `out\new-files` 같은 줄이 깨진 사례).
- **경고 수는 bash로 센다**: `npm run check:data > out.txt 2>&1; grep -c '^  경고' out.txt`. PowerShell로 세면 stderr 첫 줄이 감싸져 하나 적게 나온다(39를 38로 센 사례).
- `npm run gen:geo -- --prune`은 가운데 `--`가 필요하다(없으면 npm이 옵션을 가져가 같은 오류가 반복). `--prune`은 손으로 그린 파일도 지운다.
- `lifecycle.mjs`·`versions2.mjs`의 repo 인자는 **Windows 절대 경로**여야 한다(bash에서 `$(pwd -W)`). 상대 경로면 `createRequire`가 실패한다.
- 한 명령은 5분 안. 대략 `gen:geo` 60~90초, `check:generator` 약 3.5분, `check:gaps` 캐시 없이 약 60초(바뀐 것 없으면 5초), `check:fragments` 약 100초, `build` 약 2분(전체 `build` 약 5분), **`build:data`·`check:data` 6~18분(원본 `.cache` 없이 첫 빌드 약 18분)**. 오래 걸릴 명령은 timeout을 짧게 걸고 출력을 파일로 받아 필요한 줄만 읽는다. **백그라운드 명령·Monitor는 쓰지 않는다**(세션 H에서 모니터 보고가 끝없이 되풀이돼 중단시킴). 하위 에이전트의 프롬프트 캐시는 약 5분이라 명령 하나에 5~15분 기다리면 대화 전체를 다시 저장하게 된다.

## 사본·정션·줄바꿈

- 작업은 원본이 아닌 사본에서: `git clone --no-hardlinks <원본> <작업 폴더>\repo`. 객체가 없다는 오류면 `--reference`나 alternates. (2026-10-09에 원본 `.git`에서 빈 트리 객체 4b825dc…가 빠져 있던 것을 `git hash-object -w -t tree`로 써넣어 `fsck`가 깨끗해졌다. 다시 같은 오류면 이 방법.)
- 로컬 `git clone --no-hardlinks`가 원본의 느슨한 객체 일부와 `.cache`의 admin-1 파일을 빠뜨려 `git show HEAD:…`(compare:geo)가 실패한 일이 있다(세션 N3). 사본은 `git clone --no-local`로 만들고, 빠졌으면 원본 `.git/objects`를 `cp -rn`으로 사본에 복사한다(원본은 읽기만).
- **`node_modules`는 정션**: PowerShell에서 `cmd /c mklink /J <사본>\node_modules <원본>\node_modules`. **지울 때는 정션부터 떼고 지운다**: `cmd /c rmdir "<사본>\node_modules"`(`/s` 없이 — 정션만 사라진다), 그다음에 사본을 지운다. **`rm -rf`·`Remove-Item -Recurse`를 정션이 붙은 채로 돌리면 원본 `node_modules`가 지워진다**(2026-10-12 세계 대전 W2에서 실제로 일어날 뻔함 — package-lock과 대조해 이상 없음을 확인). 끝난 뒤에도 사본은 지우지 않는 것이 기본.
- 원본 `.cache`(빌드 캐시)는 **읽기만**. 사본에서 쓰려면 사본 안에 복사(`robocopy`). 원본에는 아무것도 쓰지 않는다.
- **줄바꿈(CRLF)**: 원본 일부 파일은 CRLF다. 사본에 원본 파일을 덮어쓰면 git이 바뀐 파일로 보고 `apply.mjs`가 '작업 트리가 깨끗하지 않음'으로 멈춘다 — clone 그대로 쓴다. `apply.mjs`는 LF로 맞춘 sha256을 대조하고 **원래 줄바꿈을 유지**, 새 파일은 LF로 쓴다. 사건 patch는 CRLF 사본에도 시험한다.
- **`apply.mjs` 출력은 파이프(`| head`, `| tail`)로 자르지 않는다** — 종료 코드와 '멈춤: …' 메시지를 놓친다.
- `gen:geo` 뒤 `git status`의 바뀐 파일 수가 묶음 수와 같아야 한다. 더 많으면 의도 밖 도형이 바뀐 것이다(`compare:geo`로 기간별 대칭차 확인).

## 외부 자료·요청

- **외부 요청(웹·API)의 User-Agent·본문·질의에 개인정보(이메일 등)를 넣지 않는다.** 2026-10-12 W2 구현 에이전트가 Nominatim 요청 한 번의 User-Agent에 사용자 이메일을 넣었다가 빼고 운영자에게 알렸다. User-Agent는 `history-map-research/1.0 (personal project)`처럼 용도만.
- **Nominatim 사용 규칙**: 초당 1회 이하, 식별 가능한 User-Agent(용도만), 대량·반복 조회 금지, 결과를 캐시. 지명 좌표는 가능하면 **위키백과 API(coordinates 속성)**로 대조한다 — 인계 폴더 `ww-generators/w2/wikicheck.mjs`(이름 붙은 경유점 255개 중 43개가 1~8km 어긋나 있었다). 좌표를 기억에서 옮겨 적지 않는다.
- **Overpass(OSM)가 504·500을 자주 낸다.** 같은 질의를 **다른 서버 주소로 번갈아** 재시도한다:
  `https://overpass-api.de/api/interpreter` → `https://overpass.kumi.systems/api/interpreter` → `https://overpass.private.coffee/api/interpreter`(POST, 본문 `data=<질의>`, 응답이 `{`로 시작하고 `remark`에 error가 없을 때만 성공, 시도 사이 3초 쉼, 9번까지). 세션 I의 재시도 도구 `ovp.mjs`(15줄, 사본을 이 안내서 결과 폴더에 둠 — 메인이 인계 폴더 `tools/`로 옮길 것, 사용: `node ovp.mjs <출력.json> '<질의>'`)가 이 방식이다. 새로 짜지 말고 같은 꼴로.
- 자료 라이선스는 `docs/REGION_GUIDE.md` §4를 먼저: Natural Earth는 퍼블릭 도메인(가공 조각을 저장소에 넣어도 됨), **CShapes 좌표는 저장소에 넣지 않음**(`.cache`에서 대조만), Eurostat·GADM·geoBoundaries·Euratlas 등은 쓰지 않음. 새 외부 선(OSM 점 등)은 점 수십 개로 줄여 넣고 출처를 결과 노트·주석에 적는다.
- 큰 자료를 받으려면 출처·크기·지문을 적고 **허락을 받은 뒤** 받는다(REGION_GUIDE §7). 웹 조사 결과로 뒷받침하는 문장은 그 쪽에 실제로 있는 것만 인용한다.

## 도형 계산(polyclip-ts)이 깨지는 모양

- **나라 영토(entities) 위에 geojson을 여러 겹 덮기**: 해안·경계의 가는 조각에서 계산이 깨진다(2026-10-12 W2 시험에서 1944-08 이후 스냅샷). 우회: 겹마다 쌓지 말고 **스냅샷·진영마다 한 덩어리**(서로 겹치지 않음)를 스크립트에서 미리 만들어 geojson 하나로 내보내고, 빌드는 해안선으로 자르기만 하게 한다.
- **반올림 뒤 퇴화한 고리**(점이 겹치거나 자기 접촉): 빌드의 polyclip이 멈춘다. 우회: 반올림 → 자기 자신과 `union` → 다시 반올림을 결과가 안 변할 때까지(최대 3번) 반복(W3 `round`).
- **넓이 0 조각·가는 띠**: 해안선으로 자르고 반올림하면 생긴다. 빌드가 넓이 0 조각은 빼지만, 앞 지역이 해안을 따라 남은 띠는 강조선을 해안으로 끌어낸다 → 바다 쪽은 넉넉히 바깥으로 그리고, 결과 `wars.json`에서 조각별 넓이를 뽑아 점검.
- **생성기의 구멍 메우기(`engine.mjs` `keepHoles`)**: 한 나라에 둘러싸인 빈 땅(주인 `null`)은 그 나라로 메워진다(리카오니아·피시디아 6.5만 km²). 일부러 비운 땅은 권역 파일의 `voids`로 지킨다.
- 겹침이 5 km²를 넘으면 빌드가 실패한다. 조각을 같은 기간에 두 나라가 가지면 안 된다(`makeTable`이 멈춤). 물을 건너는 직선 경계는 월경지(30 km² 이상)를 만든다 — 바다 쪽 점을 거쳐 돌린다(`check:exclaves`).
- 지도 육지 자료(Natural Earth 50m)에 **없는 섬**(람페두사, 레로스, 예니칼레, 지브롤터를 자르면 사라짐, 올란드 바깥 섬 7곳, 실리 제도, 웨이크·미드웨이·마킨)은 칠할 수 없다 → 전쟁 보기는 `holds`, 국경은 근사 목록.
- 전쟁 보기 전역 `bounds`의 경도는 스키마 한계로 ≤180(진주만·미드웨이가 화면 밖).

## 지점 판정·자료 해석

- 판정 도구: `node ../history-map-handoff/pt-dh.mjs . '<[[이름,경도,위도],…]>' '<[해,…] 또는 {"from":a,"to":b}>'`(history-map 폴더에서). 영토 `to`는 미포함, 버전은 그해 말 모습. **강·경계선 위의 점은 판정이 엉뚱하게 나온다** — 실제 좌표(OSM 마을 좌표)로 다시 찍는다.
- 천문 연도(기원전 N년 = 1−N)를 항목 `from`·`to`(포함), 영토 `from`·`to`(미포함), 표의 해, relations, 글 본문 모두에서 확인.
- `check:data`의 `영토 없음` 경고는 일부러 비운 기간이면 정상이다(경고 52가 기준; 늘면 이유를 적는다).
- 큰 파일(`docs/europe/08b-medieval-stages.md`·`09b-ancient-stages.md`·`06-progress-table.md` 각 12만~15만 바이트·`scripts/geo/areas/europe.mjs` 1.3MB·`docs/REVIEW.md` 24만·`docs/DESIGN.md` 11만)은 통째로 읽지 않는다(읽기 도구는 한 번에 약 2.5만 토큰까지). `grep -n`으로 줄 번호를 찾고 `offset`/`limit`로 필요한 줄만.
- 화면 확인: 스크린샷은 최소(이미지는 끝까지 다시 읽힌다). 글자 판정(지점 표)을 먼저 쓰고 마지막에 한두 장만. 브라우저를 쓰면 소리를 음소거(`--mute-audio`, 열린 페이지는 `audio,video`의 `muted = true`).

## 절차

- 원본 저장소는 고치지 않는다(적용·커밋·푸시는 메인). 커밋 메시지는 한국어, 마지막 줄은 그 세션이 정한 Co-Authored-By. 강제 푸시·이력 고쳐 쓰기 금지, CShapes 좌표는 저장소에 넣지 않음.
- 저장소에 들어갈 글(문서·주석·출력 문구)은 한국어이고, 사용자 개인 경로와 세션 임시 폴더 이름은 넣지 않는다(`<작업 폴더>`로).
- 에이전트 보고는 10줄 안팎, 자세한 것은 결과 노트 파일. 같은 확인을 손으로 두 번 넘게 하면 도구로 만들자고 메인에게 제안한다.
- 반영 에이전트를 SendMessage로 다시 부르면 앞 맥락을 다시 읽어 토큰이 처음만큼 든다 — 지점 몇 곳 고치기는 새 작은 에이전트에게.
