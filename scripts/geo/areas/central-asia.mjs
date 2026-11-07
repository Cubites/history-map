// central-asia 권역 (DESIGN.md §5.2, 층 10): npm run new:area가 만든 틀. 나라·도형은 시대 파일(areas/central-asia/<시대>.mjs, 시대표 하나에 파일 하나)에 두고 여기서 합친다.
// 짝 entities 파일: data/entities/central-asia.yaml(시대 파일마다 data/entities/central-asia-<시대>.yaml). 정답표: data/tests/places/central-asia.yaml.
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/europe.mjs, areas/middle-east.mjs, areas/south-asia.mjs, areas/central-asia/의 도우미 모듈. 위층 권역이 쓸 도형은 여기서 export한다.
// 권역 출처 문구(export const source)는 이 권역 나라 모두에 붙는다(없으면 엔진의 기본 문구). 시대마다 다르면 시대 파일의 era.source에 적는다.
// 빈 땅 검사 구역(gapZones: [{ name, zone, minus?, from?, to? }])은 비어 있으면 안 되는 지역을 적는다(engine.mjs collectGapZones). 일부러 비운 땅은 voids에 이유와 함께.
// 이 파일은 C1 뼈대(2026-11-05)가 다 적었고 C2 뼈대(2026-11-05)가 C2 늘림 줄·시대 잇기를, C3 뼈대(2026-11-06)가 C3 늘림 줄·시대 셋을, C4 뼈대(2026-11-07)가 C4 늘림 줄·시대 둘(ancient-bc·late-antiquity)을 더했다 — 구현 칸(C1 A·W·E, C2 A·W·EK·EX, C3 여덟, C4 SW·W·N·E)은 고치지 않는다(틀렸으면 결과 노트 6절).
import { joinEras } from '../shared.mjs';
import { era as modernEra } from './central-asia/modern.mjs';
import { era as earlyModernEra } from './central-asia/early-modern.mjs';
import { era as ancientBcEra } from './central-asia/ancient-bc.mjs';
import { era as lateAntiquityEra } from './central-asia/late-antiquity.mjs';
import { era as earlyMedievalEra } from './central-asia/early-medieval.mjs';
import { era as highMedievalEra } from './central-asia/high-medieval.mjs';
import { era as lateMedievalEra } from './central-asia/late-medieval.mjs';

// 출처 문구: 이 권역 나라 모두에 붙는다(지도 정보 패널)
export const source = '중앙아시아 쪽은 Natural Earth 1:10m admin-1(v5.1.2) 현대 행정구역 조각(신장은 중국 조각)을 그 시기 국경에 맞춰 묶고, 조각이 역사 경계와 다른 곳(부하라·히바·코칸트 보호국, 예티샤르, 아프가니스탄의 단계별 영토 등)은 위키백과·브리태니커의 넓이와 지금 주·지구 경계, 러시아 제국 정복 단계 구역에 맞춰 선을 그어 나눈 근사. 분쟁 땅은 실효 지배대로, 러시아·중국과 맞닿은 쪽은 유럽·동아시아 지도의 경계를 따름. 운영자 검수 필요';

// 이 파일에 직접 두는 나라 (나라 id: [[from, to, 멀티폴리곤, 확실성?], ...], 해는 천문 연도, to는 미포함)
const ownVersions = {};

// 앞 권역 나라 늘리기(engine.mjs '앞 권역 나라 늘리기'): docs/central-asia/00-scope.md 5절 영향표의 승인 줄만. 시대 파일 소유표가 이 나라 id를 주인으로 쓴다(joinEras가 extensions로 보냄).
// 값은 [첫 해, 끝 해(미포함)] = 칠하는 마지막 해 + 1이고, 끝 해는 그 항목 to(끝 해 포함) + 1을 넘을 수 없다(scripts/build-data 존속 기간 검사). null은 끝 없음(지금까지)
// 늘릴 땅은 그해 원래 도형을 뺀 땅만(1 km² 넘게 겹치면 생성기가 멈춤 — 시대 파일의 prevMinusOf를 뺀다). 허용 기간 안에서 칠하지 않는 해는 그냥 칠하지 않으면 된다
// - russia 1865~1917: 카자흐스탄 동쪽 끝(동경 80.6° 동쪽 약 2.6만 km², 1850~1991년 빈 땅)을 기존 모양 쪽으로 메움(기본값 7, E 칸). 항목 to 1917
// - soviet-union 1918~1991: 같은 땅(기본값 7, E 칸). 항목 to 1991
// - qing 1696~1911: 신장 전체(운영자 결정 2 — C1이 칠하는 해는 E 칸이 사료로: 1876 북신장·1877/78 타림·1881 일리 안팎).
//   C2(1500~1864, C2 결정 Q10): 하미 서쪽 1696~1758(EX 칸)·신장 전체 1759~1863(EX)·카자흐스탄 동쪽 끝(동경 80.6° 동쪽) 1759~1863(EK), 1864는 늘림을 풀어 동쪽 띠만(맞춤 M25·COMMON 6절).
//   0단계 결과 노트 5절 1의 두 토막 꼴([1759, 1865]·[1878, 1912])은 한 범위로 적음 — extendable은 나라마다 한 범위이고, 그 안에서 칠하지 않는 해(예티샤르 1865~1877)는 허용일 뿐이라 멈추지 않음. 항목 to 1911
// - roc 1912~1948: 신장 전체(결정 2, 동투르키스탄 공화국 1944~1949 세 지구는 비움이 기본 — 결정 맞춤 9). 1949부터는 prc. 항목 to 1949
// - prc 1949~: 신장 전체(결정 2). 끝 없음(null — 엔진이 2026-11-05부터 받음)
const EXTENDABLE = {
  russia: [1865, 1918],
  'soviet-union': [1918, 1992],
  qing: [1696, 1912], // C1 결정 2 신장 1865~1911 + C2 Q10 하미 서쪽 1696~·신장·카자흐 동쪽 끝 1759~1863 (항목 to 1912 — 끝 해 1912 ≤ to + 1)
  roc: [1912, 1949],
  prc: [1949, null],
  // ── C2(1500~1864) 늘림 (C2 뼈대 2026-11-05 — 원천 ca2/research/C2-DECISIONS.md, C2 A 칸이 칠함. 늘린 나라는 승인 범위 쪽으로만, 기존 범위 안 모양은 바이트 그대로: standards 9절 12)
  'mughal-empire': [1526, 1739], // Q1 카불 1526~1738(칸다하르는 사파비와 번갈이 1558·1595·1622·1638·1649). 1541~1554 원래 버전 없는 해는 엔진 '원래 버전 없는 해'가 받음. 항목 to 1857
  'safavid-iran': [1510, 1736], // Q2 헤라트·칸다하르 1510~1735(칸다하르는 무굴과 번갈이). 항목 to 1736
  'hotak-dynasty': [1709, 1738], // Q2 칸다하르 1709~1737(원래 버전은 1722~1728만 — 그 밖의 해는 새 버전). 항목 to 1738
  'afsharid-iran': [1736, 1750], // Q2 헤라트·칸다하르 1736~1749(남아시아가 이미 인더스 서안 1739~1747을 늘린 나라 — 두 권역 늘림). 항목 to 1796
  'durrani-empire': [1747, 1823], // Q3 아프가니스탄 본토 전부 1747~1822(최대 약 56.8만 km², 1747은 원래 버전 없는 해). 항목 to 1825
  // ── C3(600~1499) 늘림 (C3 뼈대 2026-11-06 — 원천 ca3/research/C3-DECISIONS.md·ca3/c3/COMMON.md 2·3절. 칠하는 칸은 줄 주석, 칸은 이 파일을 고치지 않음.
  //    늘린 나라는 승인 범위 쪽으로만, 기존 범위 안 모양은 바이트 그대로: standards 9절 12. 끝 해 ≤ 항목 to + 1은 entity:where로 확인)
  // sasanian-empire: C3 Q1 메르브·헤라트·시스탄 600~650(W1A)에 C4 Q4 메르브 224~·아리아·시스탄 240~483, 565~599(에프탈 484~564 빠짐 — C4 SW·W)를 더해 한 범위로 넓힘(C4 뼈대, extendable은 나라마다 한 범위).
  //   서아시아 나라 — 남아시아도 240~488을 늘림. 항목 224~651
  'sasanian-empire': [224, 651],
  'rashidun-caliphate': [651, 661], // Q1 메르브·헤라트·시스탄 651~660(서아시아 나라). W1A. 항목 632~661
  'umayyad-caliphate': [661, 750 + 1], // (끝 해를 식으로 적음 — 값 쌍 [661, 751]이 서아시아 EXTENDABLE 줄과 같아 check:generator가 좌표 되풀이로 봄. 뜻은 칠하는 마지막 해 750 + 1) Q1 661 메르브·헤라트, 705 아래 토하리스탄, 709 부하라, 712 사마르칸트·케슈, 750 끝(유럽 나라 — 서아시아도 661~750을 늘림, 세 권역 늘림). W1A·W1T. 항목 661~756
  'abbasid-caliphate': [750, 892], // Q1·B11 750~891(751 페르가나·샤시, 759 위 토하리스탄, 821 메르브 → 타히르, 892 트란스옥시아나 → 사만. 서아시아 나라 — 남아시아도 750~854를 늘림). W1A·W1T·W2. 항목 750~1258
  'tahirid-dynasty': [821, 874], // Q1 호라산·메르브 821~873(서아시아 나라). W2. 항목 821~873
  'saffarid-dynasty': [861, 1004], // Q1 시스탄·헤라트·발흐 쪽 861~1003(서아시아 나라). W2. 항목 861~1003
  'samanid-empire': [892, 1000], // Q1·B11 트란스옥시아나·호라산 892~999(서아시아 나라). W2(+E2 시르다리야). 항목 819~999
  'ghaznavid-empire': [977, 1187], // Q1·Q2 가즈니·호라산·트란스옥시아나 남쪽 977~1186, 본거지 1152~1159만(서아시아 나라 — 남아시아도 1001~1186을 늘림, 세 권역 늘림). W2. 항목 977~1186
  'seljuk-empire': [1037, 1195], // Q1 호라산·메르브 1037~1194(서아시아 나라). W2. 항목 1037~1194
  'khwarazmian-empire': [1077, 1221], // Q1·M14 호라즘 1077~1219, 1220 = 1219 말 모양 − 트란스옥시아나(서아시아 나라). W2·W3. 항목 1077~1231
  'ghurid-dynasty': [1175, 1216], // Q1·Q2·M21 구르·가즈니 본거지 1175~1215(남아시아 나라 — 항목 to를 C3 뼈대가 1206 → 1215로 고침, 글은 W2). W2. 항목 1175~1215
  'turk-shahi': [665, 822], // Q1·M16 카불·자불 665~821(821 한 해는 W2가 칠함, 남아시아 나라). W1A·W2. 항목 665~822
  'hindu-shahi': [822, 1027], // Q1 카불 822~1026(남아시아 나라). W2. 항목 822~1026
  'timurid-empire': [1370, 1507], // Q1·Q10 1370~1499(W3·E3), 1500~1506 헤라트·발흐·카불·페르가나(J)(서아시아 나라). 항목 1370~1507
  tang: [640, 791], // Q4 하미·투루판 640~790, 4진 648~670·692~790(동아시아 나라). E1. 항목 618~907
  tibet: [670, 843], // Q4 4진 670~691·호탄 790~842(내륙아시아 나라 — 원래 버전이 신장 남쪽 가장자리 65,040 km²를 이미 칠함). E1·E2. 항목 618~842
  // uyghur [792, 840]: Q4 위구르 투루판 792~839 — 내륙아시아 빈 땅 채우기(fillSpecs '{ id: uyghur, zone: STEPPE, from: 744, to: 840 }') 대상 나라라 엔진이 늘림을 받지 않는다
  //   (engine.mjs checkAllow '빈 땅 채우기 대상 나라는 늘릴 수 없음'). 그래서 줄을 두지 않았다 — E1·E2는 uyghur를 주인으로 쓰지 않는다(메인 판단 기다림, C3 뼈대 결과 참고)
  'mongol-empire': [1218, 1264], // Q6·M19 1218~1219 서요 땅, 1220~1259 초원·준가르·제티수·타림 서쪽, 트란스옥시아나 1220~1226·호라즘 1221~1263·헤라트 1221~1244(내륙아시아 나라 — 서아시아도 1221~1260을 늘림, 세 권역 늘림). E2·E3·W3. 항목 1206~1270
  'golden-horde': [1260, 1396], // Q7·M20 카자흐 초원 1260~1395(세미레치예·이리 뺌), 호라즘 북쪽 1264~1359(유럽 나라). E3·W3. 항목 1242~1502
  // ── C4(−799~599) 늘림 (C4 뼈대 2026-11-07 — 원천 ca4/research/C4-DECISIONS.md·C4-ESCALATE.md 운영자 답·ca4/c4/COMMON.md 2·3절. 칠하는 칸은 줄 주석, 칸은 이 파일을 고치지 않음.
  //    천문 연도(기원전 N년 = 1−N). 늘린 나라는 승인 범위 쪽으로만, 기존 범위 안 모양은 바이트 그대로: standards 9절 12. 끝 해 ≤ 항목 to + 1은 entity:where로 확인)
  'achaemenid-empire': [-538, -328], // Q1 박트리아·소그디아나·마르기아나·아리아·드랑기아나·아라코시아·카불·하자라자트 −538~−329, 호라즘은 −336까지(맞춤 M1 — 마지막 해 −329, −328은 마케도니아). SW·W. 유럽 나라(서아시아·남아시아도 늘림). 항목 −549~−328
  'macedonia-kingdom': [-328, -315], // 운영자 답 E1 박트리아·소그디아나·마르기아나 −328~−316(그 뒤 −315~−305 비움 — Q2). SW·W. 유럽 나라(서아시아도 −332~−317을 늘림). 항목 −699~−166
  'seleucid-empire': [-304, -247], // Q2·Q4 박트리아·아리아·드랑기아나·마르기아나 −304~−248(박트리아 북은 −250까지 — 그리스-박트리아 −249). SW·W. 유럽 나라. 항목 −311~−63
  'maurya-empire': [-304, -183], // 00-scope 5절 남아시아 넘김 몫 — 아라코시아·카불 −304~−184(Q11 하자라자트는 아케메네스만). SW. 남아시아 나라. 항목 −320~−184
  'indo-greek-kingdom': [-183, -83], // 운영자 답 E1 카불·아라코시아 −183~−84(남아시아 간다라 −179와 4년 — 데메트리오스 정복 범위 안). SW. 남아시아 나라. 항목 −199~10
  'parthian-empire': [-154, 224], // Q4 아리아·마르기아나(메르브) −154~223(미트리다테스 1세). SW(아리아)·W(메르브). 서아시아 나라. 항목 −246~224
  'kushan-empire': [30, 240], // B7·Q11 박트리아 북 30~74, 75~239 +카불(남아시아 75와 맞춤). SW. 남아시아 나라. 항목 30~375
  'kushano-sasanian-kingdom': [240, 360], // B8 박트리아 북+카불 240~359. SW. 남아시아 나라. 항목 240~360
  'kidarite-kingdom': [360, 470], // B8 박트리아 북 360~466·카불 360~469(남아시아 360~469와 맞춤). SW. 남아시아 나라. 항목 360~470
  'alchon-huns': [470, 565], // B8 카불 470~564(565~599 비움 — C3 Q3 카불 600~664 비움에 맞춤). SW. 남아시아 나라. 항목 460~565
  // 늘리지 않음(운영자 답 E2·E3): western-han·eastern-han·cao-wei·western-jin·former-liang·northern-liang·northern-wei·tuyuhun·indo-scythian-kingdom·indo-parthian-kingdom, xiongnu·xianbei·rouran·gokturk(빈 땅 채우기 대상 — 엔진이 받지 않음, 장부 한 줄)
};

// 앞 권역 나라 깎기(engine.mjs '앞 권역 나라 깎기', 2026-11-05 이 권역에서 처음): 00-scope 5절 영향표 '줄임' 승인 줄만(운영자 결정 1).
// 시대 파일이 era.trims({ id: [[from, to, 멀티폴리곤], ...] }, 칸마다 A_TRIMS·W_TRIMS를 모음)에 뺄 땅을 적고, 그 땅의 새 주인(보호국)은 소유표에 따로 적는다.
// 값은 [첫 해, 끝 해(미포함)]. 원래 모양은 data/geo/home/<id>.geojson(전쟁 화면은 그대로), 뺄 땅 목록은 data/geo/home/<id>.trims.json
// - russia 1866~1917: 부하라 토후국 1868~(보호국), 코칸트 칸국 1868~1875(1866 구역에 든 코칸트 몫은 1866~1867에도 — 00-scope 5절 russia 줄), 히바 칸국 1873~(보호국). W 칸(부하라·코칸트)·A 칸(히바)
// - soviet-union 1918~1923: 부하라·히바(1920~1924 부하라·호라즘 인민 소비에트 공화국 포함), 1924년 10월 민족 경계 획정부터 소련 한 항목(결정 맞춤 5)
const TRIMMABLE = {
  russia: [1866, 1918],
  'soviet-union': [1918, 1924],
};

// 시대 파일 잇기 (npm run new:area): 이 파일의 나라 다음에 시대 파일(areas/central-asia/<시대>.mjs)의 나라·빈 땅 검사 구역·비운 땅·뺄 땅을 붙인다(shared.mjs joinEras)
export const { versions, gapZones, voids, sourceOf, extensions, extendable, trims, trimmable } = joinEras('central-asia', { versions: ownVersions, gapZones: [], voids: [], extendable: EXTENDABLE, trimmable: TRIMMABLE }, [ancientBcEra, lateAntiquityEra, earlyMedievalEra, highMedievalEra, lateMedievalEra, earlyModernEra, modernEra]);
