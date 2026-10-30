// middle-east 시대 파일 medieval (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 632~1452: 칼리프 시대, 이란·이집트 왕조, 십자군 국가, 몽골과 일 칸국, 마그레브 왕조
// 짝 항목 파일: data/entities/middle-east-medieval.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다. 아래 '늘린 나라'와 'A2 항목'은 예외)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east/의 다른 도우미 모듈. areas/middle-east.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/middle-east/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/middle-east.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── A3 짜임 안내 (2026-10-30 A3-0 바탕, 구현 에이전트가 표를 채움) ─────────────────
// 표: early-modern.mjs와 같은 꼴의 조각 소유표(table.mjs). 이 파일은 tableKit('medieval')로 자기 꾸러미를 받아 단위 이름('SA-04/하사' 같은 나눈 조각 이름)이
//   early-modern.mjs·modern.mjs와 부딪치지 않는다(꾸러미마다 단위 이름·도형 표가 따로). 칼선이 같으면 그 파일의 도형을 import해 이 꾸러미에서 다시 split한다.
//   조각은 A1 조각(loadFragments('middle-east'))을 그대로 쓰고 새로 만들지 않는다. 옛 경계는 칼선(split)으로 나눈다. 표마다 모든 조각을 정확히 한 번 쓴다.
//   표 나눔은 유럽 표 경계 해에 맞춘다: T632(632~799, 유럽 T476 안)·T800(800~999)·T1000(1000~1199)·T1200(1200~1299)·T1300(1300~1399)·T1400(1400~1452).
//   늘린 나라(아래)가 두 권역에 걸치므로 이 경계에서 나누면 그 나라 버전이 유럽 쪽 버전 해와 맞물린다(경계 밖 해에 바꾸면 유럽 쪽 버전이 그 해에서 나뉠 뿐 틈·겹침은 없다).
//   마지막 표의 끝(미포함)은 A3_END(1453). 1453년부터는 early-modern.mjs라 이 파일의 버전은 모두 1453 전에 끝난다(to: null을 쓰지 않음).
// 해 줄 넣는 법: 한 조각(또는 조각 묶음)의 주인을 632~1452 전체 한 줄로 적는다. own(ids, [[632, 주인], [해, 주인], …])이 표마다 잘라 넣는다.
//   예: own(idsOf('SYR'), [[632, RAS], [661, UMA], [750, ABB], …]). 나눈 조각은 ownSplit(묶음 이름, ids, [[부분, 칼선], …], 나머지 이름, { 부분: 줄, … }).
//   [해, 주인]은 그 해부터 다음 해 전까지 그 주인이다(그해 말 모습). 주인 null은 비운 땅(이유는 voids에 한 줄)이다.
//   줄을 적지 않은 조각은 맨 아래 REST가 632~1452 내내 주인 null로 채운다(아직 그리지 않음). 구현이 끝날 때 REST에 남는 조각은 일부러 비운 땅뿐이어야 한다.
//   구현 ①~⑤는 자기 절(아래 '── ① …')에만 줄을 더하고, 머리에 그 구현의 등급·근거 문서를 early-modern.mjs처럼 한 덩어리로 적는다.
// 늘린 나라를 적는 곳: 소유표의 주인으로 원래 권역 나라 id를 그대로 쓴다(early-modern.mjs의 OTT = 'ottoman'과 같은 꼴, 아래 UMA·BYZ·COR·ALR·ALH·ANT·EDE·MON 상수).
//   권역 파일(areas/middle-east.mjs)의 EXTENDABLE에 있는 나라만 쓸 수 있다(기간 밖이거나 없는 나라는 생성기가 멈춤). joinEras가 그 버전을 extensions로 옮기고,
//   생성기(engine.mjs '앞 권역 나라 늘리기')가 원래 권역 나라의 그 해 버전에 합집합으로 더한다. 원래 권역 버전이 없는 해(우마이야 661~710·알모라비드 1040~1090·
//   알모하드 1229~1268)는 이 권역 땅만으로 새 버전이 생긴다(확실성 기본값). 항목(europe.yaml·inner-asia.yaml)과 원래 권역 모양(data/geo/home/<id>.geojson)은 그대로다.
//   늘린 땅은 이 권역 조각 안이라 유럽 조각 안 원래 모양과 겹치지 않는다(겹치면 생성기가 멈춤). 이음매 선은 조각 준비의 under: 'europe' 그대로다.
// A2 항목 앞쪽 잇기(1452 → 1453 이음매): A2 항목(mamluk-sultanate·hafsid-sultanate·zayyanid-kingdom·marinid-sultanate·qara-qoyunlu·aq-qoyunlu·timurid-empire·musha-sha·
//   sharifate-of-mecca·jabrid-emirate·nabhani-dynasty 등, id는 data/entities/middle-east-early-modern.yaml에서 grep)를 이 파일 표의 주인으로 쓰면 joinEras가
//   early-modern.mjs의 1453년부터 버전 앞에 붙인다(권역 파일의 시대 파일 목록이 과거가 앞: [medievalEra, earlyModernEra, modernEra]). 이 파일 버전의 끝은 1453이라 이어진다.
//   항목은 A2 파일에 그대로 둔다(from은 이미 실제 시작 해, mapNote의 '지도에는 1453년부터'를 고침). A2 버전(1453~)은 바이트 그대로다.
//   1452년과 1453년 땅이 같으면 두 버전이 1453에서 끊길 뿐 지도는 이어진다(합치려고 early-modern.mjs를 고치지 않는다). 1452년 표 줄은 early-modern.mjs 1453년 줄과 견준다.
// 이 지역 왕조(셀주크·일 칸국·아이유브 등)의 아나톨리아·캅카스는 유럽 조각이라 칠하지 않는다(A3 운영자 결정 4③, mapNote에 적음). 이 파일은 이 권역 조각만 칠한다.
// 몽골 월경지: 늘린 mongol-empire의 이란·이라크 덩어리는 본토와 떨어진 조각이라 check:exclaves 허용 목록 data/exclaves.yaml에 줄을 더한다(구현 ④, entity·from·to·at·reason·sources 꼴).
// 빈 땅 검사 구역: 표마다 주인 없는 단위를 뺀 권역 바깥선(아래 gapZonesOf, 이름 '서아시아 중세 …'). 주인 있는 단위가 하나도 없는 해는 구역을 만들지 않는다(빈 틀).
//   일부러 비운 땅은 voids에 이유와 함께 한 줄씩(early-modern.mjs와 같은 꼴).
import { D, box } from '../../lib.mjs';
import { HASA, TAFILALT } from './early-modern.mjs';
import { ME, idsOf, minus, tableKit } from './table.mjs';

const { build, joinTables, makeTable } = tableKit('medieval');

const A3_START = 632; // 이 시대 파일의 첫 해(A4가 앞 시대 파일을 더하면 그 파일의 끝이 이 해)
const A3_END = 1453; // 이 시대 파일의 끝(미포함). 1453년부터는 early-modern.mjs(A2)

// ── 칼선 ─────────────────────────────────────────
// (구현이 더함: 칼선마다 무엇을 나누는지·근거·나누는 조각 id를 주석에 적는다)
// 홈스 북위 34.5°(구현 ①): 함단 왕조 알레포 가지와 이집트 왕조(이흐시드·파티마)의 경계 'a line running south of Homs to the coast near Tartus'(en 'Sayf al-Dawla')를
//   조각 SY-HI(홈스 주, 약 5.0만 km², 팔미라 사막 포함) 안에서 북위 34.5° 선으로 어림한다(홈스 시 34.73°N는 북쪽, 북쪽 부분 약 2.0만 km²). 사막 속 어림 선이라 lines 검사 키 없음. 이 선으로는 SY-HI만 나눈다
const HOMS_N = box(35.0, 34.5, 42.0, 37.0);
// 시스탄 북위 29°(구현 ①): 조각 IR-13(시스탄·발루치스탄 주, 약 17.6만 km²)은 헬만드 하류의 시스탄(자볼·자헤단)과 남쪽 발루치스탄·마크란을 함께 품는다.
//   북위 29° 북쪽(약 3.8만 km²)만 시스탄으로 떼어 칠하고, 남쪽 발루치스탄은 632~999년 비운다(운영자 결정 창구 ② 5). 사막·산지 속 어림 선이라 lines 검사 키 없음. 이 선으로는 IR-13만 나눈다
const SISTAN = box(55.0, 29.0, 64.0, 32.0);
// 알하사·카티프(HASA): early-modern.mjs의 같은 상자를 가져다 SA-04만 나눈다(카르마트 국가 899~, 그 전은 칼리프국의 바레인 주)

// ── 조각 소유표 ──────────────────────────────────
// 표 나눔은 유럽 표 경계 해에 맞춘다(T632·T800·T1000·T1200·T1300·T1400). 한 조각의 주인은 632~1452 전체를 한 줄로 적고 own이 표마다 잘라 넣는다.
const BOUNDS = [A3_START, 800, 1000, 1200, 1300, 1400, A3_END];
const TABLES = BOUNDS.slice(0, -1).map((from, i) => makeTable(from, BOUNDS[i + 1]));
const painted = new Set(); // 줄을 적은 조각 id (REST가 나머지를 채움)
// 전체 기간 줄 → 한 표 기간의 줄(첫 해는 표의 첫 해)
const sliceLine = (line, FROM, TO) => [[FROM, line.filter(([y]) => y <= FROM).at(-1)[1]], ...line.filter(([y]) => y > FROM && y < TO)];
// 통째 조각들의 주인 줄
const own = (ids, line) => {
  for (const T of TABLES) T.own(T.whole(...ids), sliceLine(line, T.FROM, T.TO));
  for (const id of ids) painted.add(id);
};
// 나눈 조각: 첫 표에서 split, 다음 표부터 reuse. lines는 { 부분 이름: 줄 }
const ownSplit = (name, ids, parts, restName, lines) => {
  let out = null;
  for (const T of TABLES) {
    out = out ? T.reuse(out) : T.split(name, ids, parts, restName);
    for (const [part, line] of Object.entries(lines)) T.own([out[part]], sliceLine(line, T.FROM, T.TO));
  }
  for (const id of ids) painted.add(id);
};

// 늘린 나라(앞 권역 나라, 권역 파일 EXTENDABLE): 원래 권역 항목 그대로
const UMA = 'umayyad-caliphate'; // europe, 늘림 661~750
const BYZ = 'byzantine-empire'; // europe, 늘림 632~698
const COR = 'cordoba-caliphate'; // europe, 늘림 929~1031
const ALR = 'almoravids'; // europe, 늘림 1040~1147
const ALH = 'almohads'; // europe, 늘림 1147~1269
const ANT = 'antioch'; // europe, 늘림 1098~1268
const EDE = 'edessa-county'; // europe, 늘림 1098~1150
const MON = 'mongol-empire'; // inner-asia, 늘림 1221~1260

// 구현 ② 항목(이집트 왕조는 ① 절의 레반트·히자즈 줄에서도 쓰므로 여기 둔다)
const FIH = 'fihrid-emirate';
const AGH = 'aghlabid-dynasty';
const RUS = 'rustamid-imamate';
const IDR = 'idrisid-dynasty';
const MID = 'midrarid-dynasty';
const BAR = 'barghawata-confederacy';
const MAG = 'maghrawa-dynasty';
const TUL = 'tulunid-dynasty';
const IKH = 'ikhshidid-dynasty';
const FAT = 'fatimid-caliphate';
const ZIR = 'zirid-dynasty';

// ── ① 동 632~999: 레반트·이라크·아라비아·이란 (구현 ①) ──
// 서아시아·북아프리카 A3a-1 (2026-10-30). 등급 '일반', 아라비아 내륙은 '주변'(zones.yaml arabia-interior). 운영자 결정은 scratchpad a3/decisions.md(질문 창구 ①②), 사료는 a3/research/notes-1.md.
// 이 절은 시리아·레바논·이스라엘·팔레스타인·요르단·이라크·쿠웨이트·이란·사우디·예멘·오만·아랍에미리트·카타르·바레인 조각의 632~999년을 칠한다(1000년부터는 구현 ③④).
// 이집트 왕조(툴룬 878~904·이흐시드 945~968·파티마 969~)의 시리아·히자즈 땅은 구현 ②가 같은 줄에 채웠다(아래 레반트 줄 머리 주석).
// 정통 칼리프국 632 아라비아 정주 지대(내륙 사막 비움, 결정 1), 637 레반트·이라크(야르무크 636 뒤 안티오크·예루살렘, 크테시폰 637 — 유럽 쪽 동로마 637 버전과 같은 해),
//   639 시리아 자지라(에데사·다라와 같은 해, 이야드 이븐 가늠), 642 후제스탄·지발·이라크 북부(니하반드), 644 아제르바이잔, 650 파르스, 651 케르만·시스탄·호라산(야즈데게르드 3세 죽음).
//   제1차 내전(656~661)·제2차 내전(683~692)·아바스 혁명(744~749)은 그리지 않는다(결정 2): 우마이야 661, 아바스 750 한 번에.
// 아바스: 762 바그다드 건설. 지방 왕조(결정 3, 따로 항목·vassal_of): 지야드 819(티하마·남부 해안만, 결정 3), 타히르 821(호라산·쿠미스), 둘라프 861(이스파한·카라지), 사파르 861 시스탄·867 케르만·870 파르스·
//   873 호라산(900 사만에 잃음, 908 파르스·케르만을 아바스에 잃음, 912~922 시스탄을 사만이 차지), 유피르 847(사나 고지), 자이드파 이맘국 897(사다), 오만 이맘국 793~892·897~944(결정 4),
//   사지 901(아제르바이잔), 카르마트 899(알하사 오아시스·카티프만, 결정 창구 ② 그 밖 줄), 함단 929 모술 가지·944 알레포 가지(북위 34.5° 넓은 범위, 메인 기본값), 지야르 931, 일리아스 932(케르만),
//   부와이 934 파르스·935 후제스탄·이스파한·943 라이·945 이라크(칼리프 직할 땅 없음, 결정 6)·967 오만·968 케르만·979 모술·980 타바리스탄, 하산와이 959, 메카 샤리프국 967, 살라르 941,
//   라와드 984(타브리즈·아르다빌), 우카일 990(모술). 나지드는 865년 무렵 야마마의 우카이디르 등 지방 소국 시대라 866부터 비운다(주변 기준 아래라 그리지 않음).
// 카스피: 사산 → 다부이 642(길란·타바리스탄) → 아바스 760(길란은 비움, 결정 창구 ② 그 밖 줄) → 알리 가문 864~899·914~927 → 사만 900·928 → 지야르 931 → 부와이 980 → 지야르 998.
// 근거(위키백과 en): Rashidun Caliphate, Muslim conquest of Persia, Muslim conquest of the Levant, Second Fitna, Umayyad Caliphate, Abbasid Caliphate, Tahirid dynasty, Saffarid dynasty,
//   Buyid dynasty, Samanid Empire, Ziyarid dynasty, Hamdanid dynasty, Qarmatians, Alavids, Sajid dynasty, Uqaylid dynasty, Ziyadid dynasty, Yu'firids, Rassids, Imamate of Oman,
//   Sharifate of Mecca, Dulafids, Sallarid dynasty, Rawwadid dynasty, Dabuyid dynasty, Ilyasids, Hasanwayhid dynasty, Tabaristan, Sayf al-Dawla.
// 이 절의 줄은 999년까지다: own1·ownSplit1이 줄 끝에 [1000, null]을 붙인다(1000년부터는 구현 ③④가 그 자리를 채움)
const UPTO_999 = (line) => [...line, [1000, null]];
const own1 = (ids, line) => own(ids, UPTO_999(line));
const ownSplit1 = (name, ids, parts, restName, lines) => ownSplit(name, ids, parts, restName, Object.fromEntries(Object.entries(lines).map(([k, l]) => [k, UPTO_999(l)])));
const RAS = 'rashidun-caliphate';
const SAS = 'sasanian-empire';
const ABB = 'abbasid-caliphate';
const DAB = 'dabuyid-dynasty';
const TAH = 'tahirid-dynasty';
const DUL = 'dulafid-dynasty';
const SFR = 'saffarid-dynasty';
const ALI = 'alid-tabaristan';
const SAJ = 'sajid-dynasty';
const SAM = 'samanid-empire';
const ILY = 'ilyasid-dynasty';
const ZIY = 'ziyarid-dynasty';
const BUY = 'buyid-dynasty';
const SAL = 'sallarid-dynasty';
const RAW = 'rawadid-dynasty';
const HAS = 'hasanwayhid-dynasty';
const HAM = 'hamdanid-dynasty';
const UQA = 'uqaylid-dynasty';
const QAR = 'qarmatian-state';
const ZYD = 'ziyadid-dynasty';
const YUF = 'yufirid-dynasty';
const ZAI = 'zaydi-imamate';
const OMI = 'ibadi-imamate-of-oman'; // 둘째·셋째 이바드 이맘국(A1 근대 이맘국 oman-imamate와 다른 항목)
const SHA = 'sharifate-of-mecca'; // A2 항목(1453~)의 앞 버전
const CALIPHS = [[632, RAS], [661, UMA], [750, ABB]]; // 아라비아: 정통 칼리프 → 우마이야 → 아바스

// 레반트: 동로마 632~636(637 안티오크·예루살렘), 시리아 자지라는 638까지(639 에데사·다라와 같은 해). 툴룬(878 남부·886 북부, 898 알레포·킨나스린 반환, 905 아바스 재정복)·
//   이흐시드(945 남부)·파티마 땅은 구현 ②가 채움(아래). 함단 알레포 가지 944(알레포·이들리브·라까·함마·타르투스·라타키아·홈스 북쪽), 969년 뒤 동로마의 라타키아 해안은 1만 km² 미만이라 칠하지 않음.
const LEVANT = [[632, BYZ], [637, RAS], [661, UMA], [750, ABB]];
const JAZIRA = [[632, BYZ], [639, RAS], [661, UMA], [750, ABB]];
// 이집트 왕조 땅(구현 ②, notes-2 3.11~3.13, 결정 창구 ② 12): 툴룬 878 남부(다마스쿠스·요르단 골짜기)·886 북부(886년 조약, 890 타르수스까지), 898 알레포·킨나스린을 칼리프에 돌려줌.
//   이흐시드 945(944년 이집트·시리아·히자즈 총독직 위임, 947 사이프 앗다울라와 홈스 남쪽~타르투스 선으로 나눔), 시리아 남부는 969년 말까지 이흐시드 총독(970년 라믈라 패배).
//   970~978년은 파티마·카르마트·알프타킨이 되풀이해 빼앗아(970~971 점령은 되돌려짐) 비우고, 파티마는 979(978년 타와힌 승리 뒤 라믈라)·983(카삼의 다마스쿠스 항복) 두 단계.
//   요르단 사막(JO-MA·JO-MN)은 요르단과 같은 주인(결정 창구 ② 14의 '요르단 사막 통째'와 같은 기준)
const LEV_PJ = idsOf('ISR', 'PSX', 'JOR'); // 팔레스타인·요르단
const LEV_DL = [...idsOf('LBN'), 'SY-DI', 'SY-DR', 'SY-QU', 'SY-RD', 'SY-SU', 'SYR-5261']; // 시리아 남부(다마스쿠스·하우란)·레바논
own1(LEV_PJ, [...LEVANT, [878, TUL], [905, ABB], [945, IKH], [970, null], [979, FAT]]);
own1(LEV_DL, [...LEVANT, [878, TUL], [905, ABB], [945, IKH], [970, null], [983, FAT]]);
own1(['SY-HM', 'SY-TA', 'SY-LA'], [...LEVANT, [886, TUL], [905, ABB], [944, HAM]]); // 함마·타르투스·라타키아
ownSplit1('SY-HI', ['SY-HI'], [['북', HOMS_N]], '남', { 북: [...LEVANT, [886, TUL], [905, ABB], [944, HAM]], 남: [...LEVANT, [886, TUL], [905, ABB], [945, IKH], [970, null], [983, FAT]] }); // 남쪽(팔미라 사막)은 다마스쿠스 쪽 길
own1(['SY-HL', 'SY-ID'], [...LEVANT, [886, TUL], [898, ABB], [944, HAM]]); // 알레포·이들리브
own1(['SY-RA'], [...JAZIRA, [886, TUL], [898, ABB], [944, HAM]]); // 라까
own1(['SY-HA', 'SY-DY'], [...JAZIRA, [929, HAM], [979, BUY], [990, UQA]]); // 하사카·데이르에조르(디야르 라비아·라흐바): 함단 모술 가지 929, 부와이 979, 우카일 990

// 이라크: 사산 632~636(633년 할리드의 히라 점령은 되돌려져 칠하지 않음), 637 정통 칼리프(카디시야 636, 크테시폰 637년 3월, 잘룰라·모술 637), 북부 쿠르드 산지는 642.
//   모술 둘레는 함단 929·부와이 979·우카일 990, 아르빌은 979부터 부와이 그대로. 잔지의 난(869~883)은 그리지 않음. 쿠웨이트(카지마)는 바스라와 같은 길
own1([...minus(idsOf('IRQ'), 'IQ-NI', 'IQ-DA', 'IQ-AR', 'IQ-SU'), ...idsOf('KWT')], [[632, SAS], [637, RAS], [661, UMA], [750, ABB], [945, BUY]]);
own1(['IQ-NI'], [[632, SAS], [637, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY], [990, UQA]]); // 니나와(모술)
own1(['IQ-DA'], [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY], [990, UQA]]); // 두호크
own1(['IQ-AR'], [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY]]); // 아르빌
own1(['IQ-SU'], [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [945, BUY]]); // 술라이마니야(샤흐리조르)

// 아라비아: 정주 지대만 칠한다(결정 1). 히자즈(메카·메디나·바하)는 945~966 이흐시드(②), 967 메카 샤리프국(A2 1453 모양과 같은 조각). 타부크·아시르도 945~966 이흐시드(결정 창구 ② 6 '히자즈 945~967 이흐시드 색'의 히자즈+타부크 땅), 967년 뒤는 다스린 나라의 근거가 없어 비움.
//   나지드(리야드·카심·하일)는 866부터 비움. 북부 국경·나지란·자우프와 동부 주 사막은 모든 해 비움(A2와 같음). 알하사·카티프는 899 카르마트, 바레인·카타르는 899부터 비움(카르마트 지배 근거가 약함).
own1(['SA-02', 'SA-03', 'SA-11'], [...CALIPHS, [945, IKH], [967, SHA]]); // 945~966 이흐시드(구현 ②, 944년 히자즈 총독직 위임·964년 무렵 카푸르의 샤리프 임명)
own1(['SA-07', 'SA-14'], [...CALIPHS, [945, IKH], [967, null]]); // 타부크·아시르: 히자즈와 같은 해에 이흐시드가 끝남
own1(['SA-01', 'SA-05', 'SA-06'], [...CALIPHS, [866, null]]); // 리야드(야마마)·카심·하일
own1(['SA-08', 'SA-10', 'SA-12'], [[632, null]]); // 북부 국경·나지란·자우프: 사막 내륙
ownSplit1('SA-04', ['SA-04'], [['하사', HASA]], '사막', { 하사: [...CALIPHS, [899, QAR]], 사막: [[632, null]] });
own1(idsOf('BHR', 'QAT'), [...CALIPHS, [899, null]]);
// 예멘: 지야드 819(티하마·지잔·아덴·라헤즈·타이즈·아비얀 해안, 약 8.6만 km² — 결정 3 좁은 안), 유피르 847(사나 고지), 자이드파 이맘국 897(사다·암란), 997 유피르 권위 소멸 뒤 사나 고지 비움.
//   하드라마우트·샤브와·마흐라·자우프·마리브는 819부터 비움(다스린 나라 근거 약함). 904~916 카르마트의 사나 점령은 되돌려져 칠하지 않음
own1(['SA-09', 'YE-HU', 'YE-HJ', 'YE-LA', 'YE-AD', 'YE-TA', 'YE-AB', 'YE-DA'], [...CALIPHS, [819, ZYD]]);
own1(['YE-SN', 'YE-SA', 'YE-DH', 'YE-IB', 'YE-BA', 'YE-MW', 'YE-RA'], [...CALIPHS, [847, YUF], [997, null]]);
own1(['YE-SD', 'YE-AM'], [...CALIPHS, [847, YUF], [897, ZAI]]);
own1(['YE-HD', 'YE-SH', 'YE-MR', 'YE-JA', 'YE-MA'], [...CALIPHS, [819, null]]);
// 오만·아랍에미리트: 아바스 750(줄란다 가문 총독, 751년 첫 이맘국은 1년이라 칠하지 않음), 이맘국 793~892·897~944(Imamate of Oman: 'Third Imamate (897–940s)', 끝 해는 940년대 가운데로 어림),
//   893~896 아바스(무함마드 이븐 누르의 정복), 945~966 비움(지방 세력·카르마트 사이), 967 부와이. 931~934 카르마트 지배는 5년 미만이라 칠하지 않음. 알우스타(사막)·도파르는 모든 해 비움
own1([...minus(idsOf('OMN'), 'OM-WU', 'OM-ZU'), ...idsOf('ARE')], [...CALIPHS, [793, OMI], [893, ABB], [897, OMI], [945, null], [967, BUY]]);
own1(['OM-WU', 'OM-ZU'], [[632, null]]);

// 이란 고원
const IRAN = (y) => [[632, SAS], [y, RAS], [661, UMA], [750, ABB]]; // 사산 → 정통 칼리프(y년) → 우마이야 → 아바스
own1(['IR-29', 'IR-30', 'IR-31'], [...IRAN(651), [821, TAH], [873, SFR], [900, SAM]]); // 호라산: 사만 900(발흐 전투)~999
own1(['IR-12'], [...IRAN(651), [821, TAH], [873, SFR], [900, SAM], [931, ZIY], [980, BUY], [998, ZIY]]); // 셈난(쿠미스): 고르간 쪽과 같은 길
ownSplit1('IR-13', ['IR-13'], [['시스탄', SISTAN]], '발루치스탄', { 시스탄: [...IRAN(651), [861, SFR], [912, SAM], [923, SFR]], 발루치스탄: [[632, null]] }); // 시스탄: 912 사만이 사파르를 쫓아냄, 923 아부 자파르 아흐마드의 복귀(기억값)
own1(['IR-15', 'IR-23'], [...IRAN(651), [867, SFR], [908, ABB], [932, ILY], [968, BUY]]); // 케르만·호르모즈간(옛 호르무즈는 케르만 주)
own1(['IR-14', 'IR-06', 'IR-18', 'IR-25'], [...IRAN(650), [870, SFR], [908, ABB], [934, BUY]]); // 파르스·부셰르·코길루예·야즈드(931~934 지야르의 시라즈는 칠하지 않음)
own1(['IR-10'], [...IRAN(642), [935, BUY]]); // 후제스탄(875~876 사파르 점령은 되돌려져 칠하지 않음)
own1(['IR-04', 'IR-08', 'IR-22', 'IR-26'], [...IRAN(642), [861, DUL], [896, ABB], [931, ZIY], [935, BUY]]); // 이스파한·차하르마할·마르카지(카라지)·곰
own1(['IR-24'], [...IRAN(642), [931, ZIY], [935, BUY]]); // 하마단
own1(['IR-17'], [...IRAN(642), [931, ZIY], [935, BUY], [959, HAS]]); // 케르만샤(디나바르)
own1(['IR-20'], [...IRAN(642), [935, BUY], [959, HAS]]); // 로레스탄
own1(['IR-05'], [...IRAN(642), [935, BUY]]); // 일람
own1(['IR-16'], [...IRAN(642), [943, BUY]]); // 코르데스탄
own1(['IRN-3216', 'IRN-5490', 'IR-28'], [...IRAN(642), [931, ZIY], [943, BUY]]); // 테헤란(라이)·알보르즈·카즈빈: 지야르 931~942, 부와이 943(라이)
// 아제르바이잔·잔잔: 사지 901(아르다빌 천도), 929~940 비움(다이삼 등의 다툼), 살라르 941, 984 라와드(동아제르바이잔·아르다빌; 서아제르바이잔은 비움, 잔잔(타롬)은 살라르 그대로).
//   아란·아르메니아(캅카스)는 유럽 조각이라 칠하지 않음(결정 4③)
own1(['IR-01', 'IR-03'], [...IRAN(644), [901, SAJ], [929, null], [941, SAL], [984, RAW]]);
own1(['IR-02'], [...IRAN(644), [901, SAJ], [929, null], [941, SAL], [984, null]]);
own1(['IR-11'], [...IRAN(644), [901, SAJ], [929, null], [941, SAL]]);
// 카스피: 길란은 760부터 알리 가문 때만 칠함
own1(['IR-19'], [[632, SAS], [642, DAB], [760, null], [864, ALI], [900, null], [914, ALI], [928, null]]);
own1(['IR-21', 'IR-27'], [[632, SAS], [642, DAB], [760, ABB], [864, ALI], [900, SAM], [914, ALI], [928, SAM], [931, ZIY], [980, BUY], [998, ZIY]]);

// ── ② 서 632~999: 이집트·리비아·마그레브 (구현 ②) ──
// 서아시아·북아프리카 A3a-2 (2026-10-30). 등급 '일반', 리비아·알제리 남부·이집트 서부 사막은 '주변'(zones.yaml sahara-interior). 운영자 결정은 scratchpad a3/decisions.md(질문 창구 ② 7~13),
//   사료는 a3/research/notes-2.md(999년 뒤로 이어지는 마그라와·바르가와타의 끝 해·땅은 notes-5.md). 이집트·리비아·튀니지·알제리·모로코·서사하라 조각의 632~999년을 칠한다(1000년부터는 구현 ③⑤).
// 이집트(조각 27개, 시나이·서부 사막 포함 — 모든 해 이집트 땅, 결정 13)와 키레나이카 해안(바르카, 결정 11)은 한 덩어리로 주인만 바뀐다:
//   동로마 → 정통 칼리프 642(641년 조약·642년 9월 알렉산드리아 입성, 한 번에) → 우마이야 661 → 아바스 750 → 툴룬 868 → 아바스 905(1월 푸스타트 재정복) → 이흐시드 935 → 파티마 969.
//   645~646년 동로마의 알렉산드리아 탈환, 656~661년 내전은 그리지 않는다. 마르마리카(부트난)·시르테와 리비아 내륙은 모든 해 비움(다스린 나라 근거 없음).
// 트리폴리타니아는 해안 다섯 조각만(내륙 미스라타·미즈다는 비움, 결정 11): 동로마 → 정통 칼리프 647 → 우마이야 → 이프리키야와 같은 길, 972~977년은 파티마 직할, 978 지리 왕조.
// 이프리키야(튀니지·알제리 동부): 동로마 아프리카 총독부(알제리 몫은 누미디아 텔, 아우레스·비스크라·음실라의 마우리 왕국은 뺌 — 결정 13), 670 카이라완 건설과 튀니지 중남부(바카세나),
//   698 카르타고 함락(튀니지 북부·누미디아 텔), 705 알제리 텔·고원·아우레스 전부(무사 이븐 누사이르, 결정 8), 709 모로코 북부 여섯 조각(탕헤르 점령, 결정 8 — 그중 대서양 평야의
//   라바트·살레는 744년부터 바르가와타 땅), 741 베르베르 반란으로 서·중부를 잃음, 745 피흐르 토후국(결정 7), 757~761 비움(카리지 정권들, 5년 미만), 762 아바스, 800 아글라브 왕조,
//   909 파티마(라카다 입성·타헤르트 정복), 972 지리 왕조(부룩킨, 아시르·알제 둘레 포함). 683~688 쿠사일라·698~701 알카히나는 5년 미만이라 그리지 않는다.
// 알제리 중·서부: 루스탐 이맘국 777(타헤르트 둘레 일곱 조각, 결정 9 좁은 안), 885 타헤르트 둘레 세 조각으로 줄어듦, 909 파티마, 972년 뒤 비움(제나타 부족 땅).
//   서알제리(틀렘센 둘레)는 790 이드리스의 틀렘센, 921~931 파티마 총독 무사 이븐 아비 알아피야(결정 10), 그 밖 해는 비움(이프란 등은 기록이 얇아 그리지 않음).
// 모로코: 이드리스 왕조 790(탕헤르~오리엔탈·틀렘센, 결정 9 좁은 안), 921 페스를 파티마 총독에 잃고 리프(탕헤르·테투안, 타자·알호세이마)만 남음(921~927 파티마를 받든 가신이라 이드리스 색),
//   974 가리브가 가문을 코르도바로 데려감. 페스 둘레는 932~986 비움(960~973 파티마·979~985 지리의 원정은 칠하지 않음, 결정 10), 987 마그라와 왕조(코르도바의 마그레브 아미르).
//   바르가와타 연합 744(대서양 평야 타메스나 네 조각, notes-5 3.5), 미드라르 왕조 758(타필랄트 오아시스 — early-modern.mjs의 TAFILALT 칼선을 그대로, MA-06만 나눔), 976 마그라와(시질마사).
//   메크네스·중부 아틀라스, 마라케시·수스 이남, 서사하라는 모든 해 비움. 코르도바의 세우타·탕헤르는 1만 km² 미만이라 늘리지 않음(결정 13).
// 근거(위키백과 en): Muslim conquest of Egypt, Muslim conquest of the Maghreb, Exarchate of Africa, Berber Revolt, Ifriqiya, Musa ibn Nusayr, Aghlabids, Rustamid dynasty,
//   Idrisid dynasty, Midrarid dynasty, Sijilmasa, Barghawata, Maghrawa (tribe), Tulunid dynasty, Abbasid Egypt, Ikhshidid dynasty, Fatimid Caliphate, Fatimid conquest of Egypt,
//   Al-Aziz Billah, Zirid dynasty, Cyrenaica, Sayf al-Dawla.
// 이 절의 줄도 999년까지다(own1·ownSplit1).
const EGYPT = [[632, BYZ], [642, RAS], [661, UMA], [750, ABB], [868, TUL], [905, ABB], [935, IKH], [969, FAT]];
own1([...idsOf('EGY'), 'LY-BA', 'LY-MJ', 'LY-JA', 'LY-QB'], EGYPT); // 이집트와 키레나이카 해안(벵가지·마르즈·제벨아흐다르·쿠바)
own1(['LY-JI', 'LY-TN', 'LY-ZA', 'LY-NQ', 'LY-MB'], [[632, BYZ], [647, RAS], [661, UMA], [745, FIH], [757, null], [762, ABB], [800, AGH], [909, FAT], [978, ZIR]]); // 트리폴리타니아 해안
own1(['LY-SR', 'LY-BU', 'LY-MI', 'LY-MZ', 'LY-AJ', 'LY-JU', 'LY-KF', 'LY-GD', 'LY-GT', 'LY-WD', 'LY-SB', 'LY-MQ', 'LY-WS'], [[632, null]]); // 리비아 내륙·시르테·마르마리카
const IFRIQIYA = [[745, FIH], [757, null], [762, ABB], [800, AGH], [909, FAT], [972, ZIR]]; // 745년부터 이프리키야 핵심의 길
const TN_N = ['TN-11', 'TN-13', 'TN-14', 'TN-21', 'TN-22', 'TN-23', 'TN-31', 'TN-32', 'TN-33', 'TN-34']; // 튀니지 북부(카르타고·튀니스·비제르트·베자·케프)
const NUMIDIA = ['DZ-23', 'DZ-24', 'DZ-36', 'DZ-41', 'DZ-25', 'DZ-43', 'DZ-21', 'DZ-18', 'DZ-19', 'DZ-34', 'DZ-04', 'DZ-12', 'DZ-06']; // 누미디아·시티펜시스 텔(안나바~베자이아·테베사)
own1([...TN_N, ...NUMIDIA], [[632, BYZ], [698, UMA], ...IFRIQIYA]);
own1(minus(idsOf('TUN'), ...TN_N), [[632, BYZ], [670, UMA], ...IFRIQIYA]); // 튀니지 중남부(비자케나): 670 카이라완 건설
own1(['DZ-05', 'DZ-40', 'DZ-07', 'DZ-28'], [[632, null], [705, UMA], ...IFRIQIYA]); // 아우레스·켄셸라·비스크라·음실라: 705년 전은 마우리·베르베르 왕국 땅
own1(['DZ-14', 'DZ-38', 'DZ-20'], [[632, null], [705, UMA], [741, null], [777, RUS], [909, FAT], [972, null]]); // 티아렛(타헤르트)·티셈실트·사이다
own1(['DZ-29', 'DZ-48', 'DZ-17', 'DZ-03'], [[632, null], [705, UMA], [741, null], [777, RUS], [885, null], [909, FAT], [972, null]]); // 마스카라·렐리잔·젤파·라구아트: 880년대 루스탐 쇠퇴
own1(['DZ-13'], [[632, null], [705, UMA], [741, null], [790, IDR], [921, FAT], [932, null]]); // 틀렘센
own1(['DZ-22', 'DZ-31', 'DZ-46', 'DZ-27', 'DZ-45'], [[632, null], [705, UMA], [741, null], [921, FAT], [932, null]]); // 시디벨아베스·오랑·아인테무셴트·모스타가넴·나아마
own1(['DZ-26', 'DZ-10', 'DZ-15', 'DZ-35', 'DZ-09', 'DZ-16', 'DZ-42', 'DZ-44', 'DZ-02'], [[632, null], [705, UMA], [741, null], [972, ZIR]]); // 아시르·알제 둘레(메데아~셸리프)
own1(['DZ-01', 'DZ-08', 'DZ-11', 'DZ-30', 'DZ-32', 'DZ-33', 'DZ-37', 'DZ-39', 'DZ-47'], [[632, null]]); // 알제리 사하라·엘바야드 고원
own1(['MA-01'], [[632, null], [709, UMA], [741, null], [790, IDR], [974, null]]); // 탕헤르·테투안
own1(['MA-03'], [[632, null], [709, UMA], [741, null], [790, IDR], [974, null], [987, MAG]]); // 타자·알호세이마(리프)
own1(['MA-02', 'MA-04', 'MA-05'], [[632, null], [709, UMA], [741, null], [790, IDR], [921, FAT], [932, null], [987, MAG]]); // 가르브·오리엔탈·페스
own1(['MA-07'], [[632, null], [709, UMA], [741, null], [744, BAR]]); // 라바트·살레
own1(['MA-08', 'MA-09', 'MA-10'], [[632, null], [744, BAR]]); // 카사블랑카·샤위아·두칼라(타메스나)
ownSplit1('MA-06', ['MA-06'], [['타필랄트', TAFILALT]], '메크네스', { 타필랄트: [[632, null], [758, MID], [976, MAG]], 메크네스: [[632, null]] });
own1(['MA-11', 'MA-12', 'MA-13', 'MA-14', 'MA-15', 'MA-16', 'SAH'], [[632, null]]); // 마라케시·타들라·수스 이남과 서사하라

// ── ③ 1000~1452: 이집트·레반트·아라비아 (구현 ③) ──

// ── ④ 1000~1452: 이라크·이란 (구현 ④) ──

// ── ⑤ 1000~1452: 리비아·마그레브 (구현 ⑤) ──

// ── 나머지: 줄을 적지 않은 조각은 632~1452 내내 주인 null(아직 그리지 않음) ──
const REST = ME.ids.filter((id) => !painted.has(id));
if (REST.length) own(REST, [[A3_START, null]]);

// ── 소유표 → 버전·빈 땅 검사 구역 ──
// 버전의 to는 숫자 그대로 둔다(마지막 표 끝 A3_END = early-modern.mjs의 첫 해). 늘린 나라의 버전은 joinEras가 extensions로 옮긴다
const joined = joinTables(TABLES);
if (joined.TO !== A3_END) throw new Error(`middle-east medieval: 마지막 표의 끝이 ${joined.TO} (${A3_END}이어야 early-modern.mjs와 이어짐)`);
const versions = Object.fromEntries(Object.entries(joined.segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to, build(list)])]));
// 주인 있는 단위가 하나도 없는 기간(빈 틀·아직 그리지 않은 시대)은 구역을 만들지 않는다
const ownedIn = (from, to) => Object.values(joined.segments).some((segs) => segs.some(([f, t]) => f < to && from < t));
const gapZonesOf = (nullSegments) => nullSegments.filter(([from, to]) => ownedIn(from, to)).map(([from, to, list]) => ({ name: `서아시아 중세 ${from}~${to - 1}`, zone: list.length ? D(ME.domain, build(list)) : ME.domain, from, to }));
const gapZones = gapZonesOf(joined.nullSegments);

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게). [from, to, 도형], // 이유
// V(from, to, 조각 id…)·B(from, to, 단위 이름…)로 한 줄씩 적는다(early-modern.mjs와 같은 꼴)
const V = (from, to, ...ids) => [from, to, ME.F(...ids)];
const B = (from, to, ...units) => [from, to, build(units)]; // 나눈 조각 단위(이름/부분)도 받음
const voids = [
  // ── ① 동 632~999 ──
  B(632, 1000, 'IR-13/발루치스탄'), // 발루치스탄·마크란: 쿠프스·발루치 부족 땅, 칼리프국·왕조의 지배 근거가 약해 비움(운영자 결정 창구 ② 5)
  V(760, 864, 'IR-19'), // 길란(다일람): 아바스가 직접 다스리지 않은 산지(결정 창구 ② 그 밖 줄)
  V(900, 914, 'IR-19'), // 길란: 사만의 타바리스탄 점령 동안 다일람 지방 세력 땅
  V(928, 1000, 'IR-19'), // 길란: 알리 가문 토후국 뒤 다일람 지방 세력 땅(지야르·부와이의 고향이나 직접 지배 근거 없음)
  V(929, 941, 'IR-01', 'IR-02', 'IR-03', 'IR-11'), // 아제르바이잔·잔잔: 사지 왕조 끝 뒤 다이삼 등 장수들이 다툰 땅
  V(984, 1000, 'IR-02'), // 서아제르바이잔: 라와드 왕조 밖 쿠르드·아르메니아 영주 땅
  V(866, 1000, 'SA-01', 'SA-05', 'SA-06'), // 나지드: 야마마의 우카이디르 등 지방 소국(주변 기준 아래라 그리지 않음)
  V(632, 1000, 'SA-08', 'SA-10', 'SA-12'), // 북부 국경·나지란·자우프: 사막 내륙(영향권은 칠하지 않음)
  B(632, 1000, 'SA-04/사막'), // 동부 주 사막(룹알할리): 사막 내륙
  V(967, 1000, 'SA-07', 'SA-14'), // 타부크·아시르: 이흐시드의 히자즈 지배가 끝난 뒤 다스린 나라의 근거가 없음(베두인 부족 땅)
  V(899, 1000, ...idsOf('BHR', 'QAT')), // 바레인·카타르: 카르마트 지배 근거가 약함(1000년 뒤와 같음)
  V(819, 1000, 'YE-HD', 'YE-SH', 'YE-MR', 'YE-JA', 'YE-MA'), // 하드라마우트·샤브와·마흐라·자우프·마리브: 지야드 왕조 밖, 다스린 나라 근거 약함(결정 창구 ② 3)
  V(997, 1000, 'YE-SN', 'YE-SA', 'YE-DH', 'YE-IB', 'YE-BA', 'YE-MW', 'YE-RA'), // 사나 고지: 유피르 왕조 권위가 사라진 뒤 부족 다툼
  V(945, 967, ...minus(idsOf('OMN'), 'OM-WU', 'OM-ZU'), ...idsOf('ARE')), // 오만: 셋째 이맘국 뒤 부와이 정복(967) 전 지방 세력·카르마트 사이
  V(632, 1000, 'OM-WU', 'OM-ZU'), // 알우스타·도파르: 사막과 부족 땅
  // ── ② 서 632~999 ──
  V(970, 979, ...LEV_PJ), // 팔레스타인·요르단: 이흐시드 끝 뒤 파티마·카르마트·알프타킨이 되풀이해 빼앗은 땅(970~971 파티마 점령은 되돌려짐)
  V(970, 983, ...LEV_DL), // 다마스쿠스·레바논: 같은 다툼, 975~978년 알프타킨의 다마스쿠스
  B(970, 983, 'SY-HI/남'), // 홈스 남쪽(팔미라 사막): 다마스쿠스 쪽과 같은 다툼
  V(632, 1000, 'LY-SR', 'LY-BU', 'LY-MI', 'LY-MZ', 'LY-AJ', 'LY-JU', 'LY-KF', 'LY-GD', 'LY-GT', 'LY-WD', 'LY-SB', 'LY-MQ', 'LY-WS'), // 리비아 내륙·시르테·마르마리카: 부족·아바디파 땅(사막 내륙, 결정 11), 페잔의 바누 하탑은 오아시스라 그리지 않음
  V(757, 762, 'LY-JI', 'LY-TN', 'LY-ZA', 'LY-NQ', 'LY-MB', ...idsOf('TUN'), ...NUMIDIA, 'DZ-05', 'DZ-40', 'DZ-07', 'DZ-28'), // 이프리키야: 카리지 정권들(수프리파 카이라완·아바디파 트리폴리, 5년 미만, 결정 7)
  V(632, 705, 'DZ-05', 'DZ-40', 'DZ-07', 'DZ-28', 'DZ-14', 'DZ-38', 'DZ-20', 'DZ-29', 'DZ-48', 'DZ-17', 'DZ-03', 'DZ-13', 'DZ-22', 'DZ-31', 'DZ-46', 'DZ-27', 'DZ-45', 'DZ-26', 'DZ-10', 'DZ-15', 'DZ-35', 'DZ-09', 'DZ-16', 'DZ-42', 'DZ-44', 'DZ-02'), // 알제리 아우레스·중·서부: 무사의 정복 전 마우리·베르베르 왕국과 부족 땅(동로마 몫은 누미디아 텔만, 결정 13)
  V(741, 777, 'DZ-14', 'DZ-38', 'DZ-20', 'DZ-29', 'DZ-48', 'DZ-17', 'DZ-03'), // 타헤르트 둘레: 베르베르 반란 뒤 루스탐 이맘국 전 부족 땅
  V(885, 909, 'DZ-29', 'DZ-48', 'DZ-17', 'DZ-03'), // 마스카라·렐리잔·젤파·라구아트: 880년대 루스탐 이맘국이 타헤르트 둘레로 줄어든 뒤 부족 땅
  V(972, 1000, 'DZ-14', 'DZ-38', 'DZ-20', 'DZ-29', 'DZ-48', 'DZ-17', 'DZ-03'), // 타헤르트 둘레: 파티마가 이집트로 옮긴 뒤 지리 왕조 밖 제나타(마그라와·바누 이프란) 부족 땅
  V(741, 790, 'DZ-13'), // 틀렘센: 베르베르 반란 뒤 이드리스 왕조 전(바누 이프란 등, 기록이 얇음)
  V(932, 1000, 'DZ-13', 'DZ-22', 'DZ-31', 'DZ-46', 'DZ-27', 'DZ-45'), // 서알제리: 파티마 총독이 코르도바 쪽으로 넘어간 뒤 바누 이프란·마그라와 땅(기록이 얇아 그리지 않음)
  V(741, 921, 'DZ-22', 'DZ-31', 'DZ-46', 'DZ-27', 'DZ-45'), // 오랑 둘레: 베르베르 반란 뒤 부족 땅
  V(741, 972, 'DZ-26', 'DZ-10', 'DZ-15', 'DZ-35', 'DZ-09', 'DZ-16', 'DZ-42', 'DZ-44', 'DZ-02'), // 아시르·알제 둘레: 산하자 부족 땅(지리 이븐 마나드의 아시르는 파티마 편 부족장, 972 지리 왕조부터 칠함)
  V(632, 1000, 'DZ-01', 'DZ-08', 'DZ-11', 'DZ-30', 'DZ-32', 'DZ-33', 'DZ-37', 'DZ-39', 'DZ-47'), // 알제리 사하라·엘바야드 고원: 사막 내륙(우아르글라 등 오아시스는 그리지 않음)
  V(632, 709, 'MA-01', 'MA-02', 'MA-03', 'MA-04', 'MA-05', 'MA-07'), // 모로코 북부: 무사의 정복 전 베르베르 부족 땅(세우타는 유럽 조각)
  V(741, 790, 'MA-01', 'MA-02', 'MA-03', 'MA-04', 'MA-05'), // 모로코 북부: 베르베르 반란 뒤 이드리스 왕조 전 부족 땅
  V(741, 744, 'MA-07'), // 라바트·살레: 바르가와타 전
  V(632, 744, 'MA-08', 'MA-09', 'MA-10'), // 타메스나: 바르가와타 전 부족 땅(우마이야 정복 범위 밖, 결정 8)
  V(974, 1000, 'MA-01'), // 탕헤르·테투안: 이드리스 왕조 뒤 코르도바의 세우타·탕헤르(1만 km² 미만)와 그 총독들의 땅
  V(974, 987, 'MA-03'), // 리프: 이드리스 왕조 뒤 마그라와 전(나코르 토후국은 작아 그리지 않음)
  V(932, 987, 'MA-02', 'MA-04', 'MA-05'), // 페스 둘레: 미크나사·이드리스·제나타가 파티마와 코르도바 사이를 오간 땅(960~973 파티마·979~985 지리의 원정은 칠하지 않음, 결정 10)
  B(632, 758, 'MA-06/타필랄트'), // 타필랄트: 미드라르 왕조의 시질마사 전 부족 땅
  B(632, 1000, 'MA-06/메크네스'), // 메크네스·중부 아틀라스: 다스린 나라 근거 약함(이드리스·마그라와는 좁은 안, 결정 9)
  V(632, 1000, 'MA-11', 'MA-12', 'MA-13', 'MA-14', 'MA-15', 'MA-16', 'SAH'), // 마라케시·타들라·수스 이남과 서사하라: 마스무다·산하자 부족 땅(사막 내륙 포함)
];

export const era = {
  name: 'medieval',
  versions,
  gapZones,
  voids,
};
