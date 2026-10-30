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
import { HEJAZ_N } from './modern.mjs';
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
// 나흐르 이브라힘 북쪽(구현 ③): 트리폴리 백국과 예루살렘 왕국(베이루트 영주령)의 경계인 나흐르 이브라힘(아도니스강, 하구 북위 약 34.07°, 비블로스는 북쪽)을
//   조각 LB-JL(산레바논 주, 약 2,200 km²) 안에서 북위 34.07° 선으로 어림한다. 북쪽(주바일 군)은 1109~1288년 트리폴리 백국, 남쪽은 베이루트·시돈 쪽 길.
//   강 골짜기를 위도 선으로 어림했을 뿐이라 lines 검사 키 없음. 이 선으로는 LB-JL만 나눈다(1000년부터, 999년까지는 통째)
export const NAHR_IBRAHIM_N = box(35.4, 34.07, 36.3, 34.8);
// 십자군 해안 띠(구현 ③, 운영자 결정 '십자군 해안(예외)'): 1192년 라믈라 조약 뒤 예루살렘 왕국(아크레 시대)이 지킨 야파~티레~시돈~베이루트 해안 띠를
//   해안에서 안쪽 약 10~15 km까지 어림한 선(야파 남쪽 북위 32.0°, 카이사레아·하이파·아크레·몽포르·티레·시돈·다무르·베이루트를 해안에서 동쪽으로 옮긴 점, 북쪽 끝은 나흐르 이브라힘 34.07°).
//   바다 쪽 변은 넉넉히 둔다. 내륙 변은 손그림 어림 선이라 lines 검사 키 없음. 이 선으로는 IL-Z·IL-HA·IL-M·LB-JA·LB-JL만 나눈다(IL-TA·LB-BA는 통째로 띠 줄, 1000년부터)
export const CRUSADER_COAST = [[[34.0, 32.0], [34.9, 32.0], [34.95, 32.3], [35.0, 32.5], [35.06, 32.7], [35.2, 32.9], [35.26, 33.1], [35.3, 33.3], [35.42, 33.55], [35.52, 33.75], [35.62, 33.95], [35.68, 34.07], [34.0, 34.07], [34.0, 32.0]]];
// 히자즈 북부(하클 띠): modern.mjs의 HEJAZ_N(SA-12의 동경 37° 서쪽)을 가져다 1263년부터 맘루크 땅으로 떼어 낸다(운영자 결정 창구 ② 14, A2 1453 모양과 같은 선)

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
// 1000년부터 나누는 조각(구현 ③): 999년까지 표(T632·T800)는 통째 조각으로 line999를 적어 A3a 버전 도형을 바이트 그대로 두고, T1000부터 split·reuse한다.
//   lines는 { 부분 이름: 1000년부터의 줄 }
const ownSplitFrom1000 = (name, ids, parts, restName, line999, lines) => {
  let out = null;
  for (const T of TABLES) {
    if (T.TO <= 1000) {
      T.own(T.whole(...ids), sliceLine(line999, T.FROM, T.TO));
      continue;
    }
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

// 구현 ③ 항목(아래 ③ 절의 줄이 쓴다. 이집트 왕조 상수와 함께 둔다)
const LUL = 'luluids-of-aleppo';
const MIR = 'mirdasid-dynasty';
const SOS = 'seljuks-of-syria';
const BUR = 'burid-dynasty';
const ART = 'artuqid-dynasty';
const JER = 'jerusalem-kingdom';
const TRI = 'tripoli-county';
const ZEN = 'zengid-dynasty';
const AYY = 'ayyubid-dynasty';
const MAM = 'mamluk-sultanate'; // A2 항목(1453~)의 앞 버전
const NAJ = 'najahid-dynasty';
const SUL = 'sulayhid-dynasty';
const ZUR = 'zurayid-dynasty';
const HSN = 'hamdanid-sultanate-of-sanaa';
const MAH = 'mahdid-dynasty';
const AYE = 'ayyubid-yemen';
const RSL = 'rasulid-dynasty';
const UYU = 'uyunid-dynasty';
const USF = 'usfurid-dynasty';
const JAR = 'jarwanid-dynasty';
const JAB = 'jabrid-emirate'; // A2 항목(1453~)의 앞 버전
const NAB = 'nabhani-dynasty'; // A2 항목(1453~)의 앞 버전

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
// 레반트 조각의 632~999년 줄(A3b 구현 ③이 아래 ③ 절에서 1000년부터를 이어 붙여 적는다 — 999년까지 줄은 그대로)
const PJ999 = [...LEVANT, [878, TUL], [905, ABB], [945, IKH], [970, null], [979, FAT]]; // LEV_PJ
const DL999 = [...LEVANT, [878, TUL], [905, ABB], [945, IKH], [970, null], [983, FAT]]; // LEV_DL
const HAMN999 = [...LEVANT, [886, TUL], [905, ABB], [944, HAM]]; // 함마·타르투스·라타키아·홈스 북쪽
const HOMSS999 = [...LEVANT, [886, TUL], [905, ABB], [945, IKH], [970, null], [983, FAT]]; // 홈스 남쪽(팔미라 사막)은 다마스쿠스 쪽 길
const ALEPPO999 = [...LEVANT, [886, TUL], [898, ABB], [944, HAM]]; // 알레포·이들리브
const RAQQA999 = [...JAZIRA, [886, TUL], [898, ABB], [944, HAM]]; // 라까
const KHABUR999 = [...JAZIRA, [929, HAM], [979, BUY], [990, UQA]]; // 하사카·데이르에조르(디야르 라비아·라흐바): 함단 모술 가지 929, 부와이 979, 우카일 990

// 이라크: 사산 632~636(633년 할리드의 히라 점령은 되돌려져 칠하지 않음), 637 정통 칼리프(카디시야 636, 크테시폰 637년 3월, 잘룰라·모술 637), 북부 쿠르드 산지는 642.
//   모술 둘레는 함단 929·부와이 979·우카일 990, 아르빌은 979부터 부와이 그대로. 잔지의 난(869~883)은 그리지 않음. 쿠웨이트(카지마)는 바스라와 같은 길
const IRQ999 = [[632, SAS], [637, RAS], [661, UMA], [750, ABB], [945, BUY]];
// 이라크 남·중부(니나와·두호크·아르빌·술라이마니야 밖)는 IRQ999, 쿠웨이트(같은 줄)는 ③ 절, 이라크 조각은 ④ 절에서 1000년부터를 이어 적음
const NI999 = [[632, SAS], [637, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY], [990, UQA]]; // 니나와(모술): ③ 절이 장기 왕조 1127~1233을 이어 적음
const DA999 = [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY], [990, UQA]]; // 두호크: 같음
const AR999 = [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [929, HAM], [979, BUY]]; // 아르빌
const SU999 = [[632, SAS], [642, RAS], [661, UMA], [750, ABB], [945, BUY]]; // 술라이마니야(샤흐리조르)

// 아라비아: 정주 지대만 칠한다(결정 1). 히자즈(메카·메디나·바하)는 945~966 이흐시드(②), 967 메카 샤리프국(A2 1453 모양과 같은 조각). 타부크·아시르도 945~966 이흐시드(결정 창구 ② 6 '히자즈 945~967 이흐시드 색'의 히자즈+타부크 땅), 967년 뒤는 다스린 나라의 근거가 없어 비움.
//   나지드(리야드·카심·하일)는 866부터 비움. 북부 국경·나지란·자우프와 동부 주 사막은 모든 해 비움(A2와 같음). 알하사·카티프는 899 카르마트, 바레인·카타르는 899부터 비움(카르마트 지배 근거가 약함).
// (아라비아·예멘·오만 조각의 줄은 999년까지 상수로 두고 ③ 절에서 1000년부터를 이어 적는다)
const HEJAZ999 = [...CALIPHS, [945, IKH], [967, SHA]]; // 메카·메디나·바하: 945~966 이흐시드(구현 ②, 944년 히자즈 총독직 위임·964년 무렵 카푸르의 샤리프 임명)
const TABUK999 = [...CALIPHS, [945, IKH], [967, null]]; // 타부크·아시르: 히자즈와 같은 해에 이흐시드가 끝남
const NAJD999 = [...CALIPHS, [866, null]]; // 리야드(야마마)·카심·하일
const DESERT999 = [[632, null]]; // 북부 국경·나지란·자우프: 사막 내륙
const HASA999 = [...CALIPHS, [899, QAR]];
const BQ999 = [...CALIPHS, [899, null]]; // 바레인·카타르
// 예멘: 지야드 819(티하마·지잔·아덴·라헤즈·타이즈·아비얀 해안, 약 8.6만 km² — 결정 3 좁은 안), 유피르 847(사나 고지), 자이드파 이맘국 897(사다·암란), 997 유피르 권위 소멸 뒤 사나 고지 비움.
//   하드라마우트·샤브와·마흐라·자우프·마리브는 819부터 비움(다스린 나라 근거 약함). 904~916 카르마트의 사나 점령은 되돌려져 칠하지 않음
const ZYD999 = [...CALIPHS, [819, ZYD]]; // 지잔·티하마·라헤즈·아덴·타이즈·아비얀·달리
const YUF999 = [...CALIPHS, [847, YUF], [997, null]]; // 사나·다마르·이브·바이다·마흐위트·라이마
const ZAI999 = [...CALIPHS, [847, YUF], [897, ZAI]]; // 사다·암란
const YINT999 = [...CALIPHS, [819, null]]; // 하드라마우트·샤브와·마흐라·자우프·마리브
// 오만·아랍에미리트: 아바스 750(줄란다 가문 총독, 751년 첫 이맘국은 1년이라 칠하지 않음), 이맘국 793~892·897~944(Imamate of Oman: 'Third Imamate (897–940s)', 끝 해는 940년대 가운데로 어림),
//   893~896 아바스(무함마드 이븐 누르의 정복), 945~966 비움(지방 세력·카르마트 사이), 967 부와이. 931~934 카르마트 지배는 5년 미만이라 칠하지 않음. 알우스타(사막)·도파르는 모든 해 비움
const OMAN999 = [...CALIPHS, [793, OMI], [893, ABB], [897, OMI], [945, null], [967, BUY]]; // 오만(알우스타·도파르 뺌)·아랍에미리트
// 알우스타·도파르는 DESERT999와 같은 줄(모든 해 비움)

// 이란 고원(조각의 999년까지 줄 상수, ④ 절이 1000년부터를 이어 적음. 시스탄·발루치스탄과 길란은 1000년부터도 비워 own1 그대로)
const IRAN = (y) => [[632, SAS], [y, RAS], [661, UMA], [750, ABB]]; // 사산 → 정통 칼리프(y년) → 우마이야 → 아바스
const KHR999 = [...IRAN(651), [821, TAH], [873, SFR], [900, SAM]]; // 호라산 IR-29·30·31: 사만 900(발흐 전투)~999
const SMN999 = [...IRAN(651), [821, TAH], [873, SFR], [900, SAM], [931, ZIY], [980, BUY], [998, ZIY]]; // 셈난(쿠미스) IR-12: 고르간 쪽과 같은 길
ownSplit1('IR-13', ['IR-13'], [['시스탄', SISTAN]], '발루치스탄', { 시스탄: [...IRAN(651), [861, SFR], [912, SAM], [923, SFR]], 발루치스탄: [[632, null]] }); // 시스탄: 912 사만이 사파르를 쫓아냄, 923 아부 자파르 아흐마드의 복귀(기억값)
const KRM999 = [...IRAN(651), [867, SFR], [908, ABB], [932, ILY], [968, BUY]]; // 케르만 IR-15·호르모즈간 IR-23(옛 호르무즈는 케르만 주)
const FRS999 = [...IRAN(650), [870, SFR], [908, ABB], [934, BUY]]; // 파르스 IR-14·부셰르 IR-06·코길루예 IR-18·야즈드 IR-25(931~934 지야르의 시라즈는 칠하지 않음)
const KHZ999 = [...IRAN(642), [935, BUY]]; // 후제스탄 IR-10(875~876 사파르 점령은 되돌려져 칠하지 않음)
const ESF999 = [...IRAN(642), [861, DUL], [896, ABB], [931, ZIY], [935, BUY]]; // 이스파한 IR-04·차하르마할 IR-08·마르카지(카라지) IR-22·곰 IR-26
const HMD999 = [...IRAN(642), [931, ZIY], [935, BUY]]; // 하마단 IR-24
const KSH999 = [...IRAN(642), [931, ZIY], [935, BUY], [959, HAS]]; // 케르만샤(디나바르) IR-17
const LOR999 = [...IRAN(642), [935, BUY], [959, HAS]]; // 로레스탄 IR-20
const ILM999 = [...IRAN(642), [935, BUY]]; // 일람 IR-05
const KRD999 = [...IRAN(642), [943, BUY]]; // 코르데스탄 IR-16
const RAY999 = [...IRAN(642), [931, ZIY], [943, BUY]]; // 테헤란(라이) IRN-3216·알보르즈 IRN-5490·카즈빈 IR-28: 지야르 931~942, 부와이 943(라이)
// 아제르바이잔·잔잔: 사지 901(아르다빌 천도), 929~940 비움(다이삼 등의 다툼), 살라르 941, 984 라와드(동아제르바이잔·아르다빌; 서아제르바이잔은 비움, 잔잔(타롬)은 살라르 그대로).
//   아란·아르메니아(캅카스)는 유럽 조각이라 칠하지 않음(결정 4③)
const AZE999 = [...IRAN(644), [901, SAJ], [929, null], [941, SAL], [984, RAW]]; // 동아제르바이잔 IR-01·아르다빌 IR-03
const AZW999 = [...IRAN(644), [901, SAJ], [929, null], [941, SAL], [984, null]]; // 서아제르바이잔 IR-02
const ZNJ999 = [...IRAN(644), [901, SAJ], [929, null], [941, SAL]]; // 잔잔 IR-11
// 카스피: 길란은 760부터 알리 가문 때만 칠함
own1(['IR-19'], [[632, SAS], [642, DAB], [760, null], [864, ALI], [900, null], [914, ALI], [928, null]]);
const CASP999 = [[632, SAS], [642, DAB], [760, ABB], [864, ALI], [900, SAM], [914, ALI], [928, SAM], [931, ZIY], [980, BUY], [998, ZIY]]; // 마잔다란 IR-21·골레스탄 IR-27

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
own1(['LY-BA', 'LY-MJ', 'LY-JA', 'LY-QB'], EGYPT); // 키레나이카 해안(벵가지·마르즈·제벨아흐다르·쿠바). 이집트 조각은 같은 줄을 ③ 절에서 1000년부터 이어 적음
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
// 서아시아·북아프리카 A3b-3 (2026-10-30). 등급 '일반', 아라비아 내륙은 '주변'(zones.yaml arabia-interior). 운영자 결정은 scratchpad a3/decisions.md(질문 창구 ② 14~16과 '십자군 해안(예외)'),
//   사료는 a3/research/notes-3.md. 이집트·시리아·레바논·이스라엘·팔레스타인·요르단·사우디·예멘·오만·아랍에미리트·카타르·바레인·쿠웨이트 조각과 장기 왕조의 모술·두호크를 칠한다.
//   ① ② 절의 999년까지 줄 상수(PJ999 등)에 1000년부터를 이어 붙인다(999년까지 버전은 그대로). 이라크·이란 조각은 장기 왕조 땅 밖이면 주인 null(구현 ④가 채움).
// 이집트: 파티마 → 아이유브 1171(살라딘이 알아디드의 이름을 뺌) → 맘루크 1250(투란샤 살해). 시나이·서부 사막 포함 한 모양(A2와 같음).
// 시리아 남부·요르단·팔레스타인: 파티마(1000) → 시리아 셀주크 1076(아트시즈의 다마스쿠스, 1079 투투시; 팔레스타인 내륙·갈릴리·요르단·홈스·하마 — 결정 15)
//   → 부리 왕조 1104(투그테긴) → 장기 1154(누르 앗딘의 다마스쿠스, 홈스·하마는 1138) → 아이유브 1174(살라딘의 다마스쿠스) → 맘루크 1260(아인 잘루트 뒤).
//   요르단 사막(JO-MA·JO-MN)은 그 땅 정착지를 가진 나라 색으로 통째(결정 14, 가르지 않음): 마프라크·자르카·길르앗·암만은 다마스쿠스 쪽, 카라크·타필라·아카바·마안·마다바는
//   오트르조르댕(1118 예루살렘 왕국, 1188~1189 아이유브, 1260~1262 카라크 아이유브 분가는 비움, 1263 바이바르스).
// 해안: 파티마가 해안 도시를 지키다 십자군에게 넘김 — 예루살렘 왕국 1099(예루살렘·야파·갈릴리), 1110 베이루트·시돈, 1118 오트르조르댕, 1153 아스칼론·가자(네게브 통째),
//   1187 하틴 뒤 아이유브, 1192 라믈라 조약의 해안 띠(칼선 CRUSADER_COAST, 1만 km² 미만이어도 그림 — 운영자 결정 '십자군 해안(예외)') ~1290, 1291 아크레 함락 뒤 맘루크.
//   트리폴리 백국 1109(트리폴리 함락)~1288: 타르투스·북레바논과 나흐르 이브라힘 북쪽(칼선 NAHR_IBRAHIM_N), 1289 맘루크. 바누 암마르의 트리폴리 등 1076~1108 레바논 해안은 파티마 색(1만 km² 미만).
//   안티오키아·에데사·동로마의 시리아 쪽(라타키아 등)은 늘리지 않고 라타키아를 비운다(결정 '십자군 해안(예외)').
// 북시리아: 알레포·이들리브는 함단 1000~1003 → 루울루 가문 1004 → 파티마 1017(파타크) → 미르다스 1025(1038~1041 파티마 직할은 5년 미만) → 우카일 1080 → 시리아 셀주크 1086
//   → 아르투크 1118(일가지) → 장기 1128 → 아이유브 1183 → 1260 몽골 점령 뒤 비움 → 맘루크 1261. 라까는 미르다스 1025~1037(1022 병합)·장기 1144·아이유브 1183·맘루크 1263만 칠하고,
//   그 밖 해와 하사카·데이르에조르(우카일 1095년까지, 결정 15)는 비운다. 장기 1127~1233 모술·두호크(1234 룰루, 구현 ④).
// 아라비아: 히자즈는 메카 샤리프국 한 모양(결정 14), 타부크와 하클 띠(HEJAZ_N)는 1263부터 맘루크(결정 14). 알하사·카티프(HASA)는 카르마트 → 우윤 1077 → 우스푸르 1253 → 자르완 1320 → 자브르 1417.
//   나지드·아시르·지잔·사막·바레인·카타르·쿠웨이트는 비움(다스린 나라 근거 약함). 오만 내륙은 넷째 이바드 이맘국 1016 → 나브하니 1154, 해안·아랍에미리트는 비움(notes-3 P10).
// 예멘(결정 16, 코어만): 지야드 1018년까지 → 나자흐 1022(티하마) → 술라이흐 1060 티하마·1063 코어(사다·암란 뺌) → 주라이 1083(아덴·남부) → 나자흐 1089(티하마) → 사나 함단 1098(사나)
//   → 1138 아르와 여왕 죽음 뒤 고지 비움 → 마흐디 1159(티하마) → 아이유브 예멘 1174(사나는 1189) → 라술 1229(사나는 1324부터 비움). 자이드파 이맘국은 사다·암란, 내륙은 모든 해 비움.
// 그리지 않음: 몽골의 시리아 점령(1260·1299~1300)·티무르의 약탈(1400~1401)·바론의 십자군 회복(1239~1247)·1229 야파 조약의 예루살렘 회랑(1만 km² 미만)·하마 아이유브 분가(맘루크 색).
// 근거(위키백과 en): Fatimid Caliphate, Kingdom of Jerusalem, County of Tripoli, Lordship of Oultrejordain, Treaty of Ramla, Tutush I, Mirdasid dynasty, Lu'lu' al-Kabir, Burid dynasty,
//   Ilghazi, Zengid dynasty, Ayyubid dynasty, Mamluk Sultanate, Mongol invasions of the Levant, Sharifate of Mecca, Sulayhid dynasty, Najahid dynasty, Zurayid dynasty, Rasulid dynasty,
//   History of Yemen, Qarmatians, Uyunid dynasty, Jarwanid dynasty, History of Oman, Imamate of Oman.
const EGY_C = [[1171, AYY], [1250, MAM]];
own(idsOf('EGY'), [...EGYPT, ...EGY_C]);
// 시리아 남부(다마스쿠스·하우란·골란)·베카·요르단 북·동부: 다마스쿠스 쪽 길
const DAMASCUS = [[1000, FAT], [1076, SOS], [1104, BUR], [1154, ZEN], [1174, AYY], [1260, MAM]];
own(['SY-DI', 'SY-DR', 'SY-QU', 'SY-RD', 'SY-SU', 'SYR-5261', 'LB-BI'], [...DL999, ...DAMASCUS]);
own(['JO-MA', 'JO-AZ', 'JO-AJ', 'JO-BA', 'JO-IR', 'JO-JA', 'JO-AM'], [...PJ999, ...DAMASCUS]);
// 오트르조르댕(카라크·타필라·아카바·마안·마다바)
own(['JO-KA', 'JO-AT', 'JO-AQ', 'JO-MN', 'JO-MD'], [...PJ999, [1000, FAT], [1076, SOS], [1104, BUR], [1118, JER], [1189, AYY], [1260, null], [1263, MAM]]);
// 홈스·하마(결정 15: 셀주크 → 부리 → 장기)
const HOMS = [[1000, FAT], [1076, SOS], [1104, BUR], [1138, ZEN], [1174, AYY], [1260, MAM]];
own(['SY-HM'], [...HAMN999, ...HOMS]);
ownSplit('SY-HI', ['SY-HI'], [['북', HOMS_N]], '남', { 북: [...HAMN999, ...HOMS], 남: [...HOMSS999, ...HOMS] });
// 팔레스타인 내륙(예루살렘·서안)과 네게브·가자
own(['IL-JM', 'PS-WBK'], [...PJ999, [1000, FAT], [1076, SOS], [1099, JER], [1187, AYY], [1253, MAM]]);
own(['IL-D', 'PS-GZZ'], [...PJ999, [1000, FAT], [1153, JER], [1187, AYY], [1253, MAM]]);
// 해안 띠(CRUSADER_COAST)를 가르는 이스라엘 조각: 띠는 1192~1290 예루살렘 왕국, 내륙은 1253 맘루크
const JCOAST = [[1000, FAT], [1099, JER], [1187, AYY], [1192, JER], [1291, MAM]];
own(['IL-TA'], [...PJ999, ...JCOAST]);
ownSplitFrom1000('IL-Z', ['IL-Z'], [['해안', CRUSADER_COAST]], '내륙', PJ999, { 해안: JCOAST, 내륙: [[1000, FAT], [1076, SOS], [1099, JER], [1187, AYY], [1253, MAM]] }); // 갈릴리 내륙은 1076 셀주크
ownSplitFrom1000('IL-HA', ['IL-HA'], [['해안', CRUSADER_COAST]], '내륙', PJ999, { 해안: JCOAST, 내륙: [[1000, FAT], [1099, JER], [1187, AYY], [1253, MAM]] });
ownSplitFrom1000('IL-M', ['IL-M'], [['해안', CRUSADER_COAST]], '내륙', PJ999, { 해안: JCOAST, 내륙: [[1000, FAT], [1099, JER], [1187, AYY], [1253, MAM]] });
// 레바논: 베이루트·시돈은 1110 예루살렘 왕국, 내륙(슈프·자발 아밀)은 1187 아이유브 → 1260 맘루크
const LCOAST = [[1000, FAT], [1110, JER], [1187, AYY], [1192, JER], [1291, MAM]];
const LINLAND = [[1000, FAT], [1110, JER], [1187, AYY], [1260, MAM]];
own(['LB-BA'], [...DL999, ...LCOAST]);
own(['LB-NA'], [...DL999, ...LINLAND]);
ownSplitFrom1000('LB-JA', ['LB-JA'], [['해안', CRUSADER_COAST]], '내륙', DL999, { 해안: LCOAST, 내륙: LINLAND });
const TRIPOLI = [[1000, FAT], [1109, TRI], [1289, MAM]];
ownSplitFrom1000('LB-JL', ['LB-JL'], [['북', NAHR_IBRAHIM_N], ['해안', CRUSADER_COAST]], '내륙', DL999, { 북: TRIPOLI, 해안: LCOAST, 내륙: LINLAND });
own(['LB-AS'], [...DL999, ...TRIPOLI]);
own(['SY-TA'], [...HAMN999, ...TRIPOLI]);
// 북시리아
own(['SY-LA'], [...HAMN999, [1000, null], [1086, SOS], [1098, null], [1188, AYY], [1260, null], [1287, MAM]]); // 라타키아: 동로마(~1084)·안티오키아(1098~1187)·보에몽 6세(1260~1286) 때는 비움
own(['SY-HL', 'SY-ID'], [...ALEPPO999, [1000, HAM], [1004, LUL], [1017, FAT], [1025, MIR], [1080, UQA], [1086, SOS], [1118, ART], [1128, ZEN], [1183, AYY], [1260, null], [1261, MAM]]);
own(['SY-RA'], [...RAQQA999, [1000, null], [1025, MIR], [1038, null], [1144, ZEN], [1183, AYY], [1260, null], [1263, MAM]]);
own(['SY-HA', 'SY-DY'], [...KHABUR999, [1000, UQA], [1096, null]]);
// 모술·두호크: 장기 1127~1233(그 앞은 구현 ④ — 우카일 1095년까지, 1096 케르보가의 셀주크, 1118 이라크 셀주크.
//   1234년부터는 구현 ④b — 바드르 앗딘 루울루 정권 1234~1261, 1262 일 칸국 직할(훌라구의 모술 파괴), 1335 잘라이르(결정 창구 ② 20), 1410 카라코윤루)
const MOSUL = [[1000, UQA], [1096, 'seljuk-empire'], [1118, 'iraq-seljuk-sultanate'], [1127, ZEN], [1234, 'lulu-dynasty'], [1262, 'ilkhanate'], [1335, 'jalayirid-sultanate'], [1410, 'qara-qoyunlu']];
own(['IQ-NI'], [...NI999, ...MOSUL]);
own(['IQ-DA'], [...DA999, ...MOSUL]);
own(idsOf('KWT'), [...IRQ999, [1000, null]]); // 쿠웨이트: 바스라 쪽 정권의 실효 지배 근거가 약해 비움(A2 1453과 같음)
// 아라비아
own(['SA-02', 'SA-03', 'SA-11'], HEJAZ999); // 메카 샤리프국 그대로(1453 A2와 같은 모양)
own(['SA-07'], [...TABUK999, [1263, MAM]]); // 타부크: 1263 맘루크(순례길 요새, 결정 14)
own(['SA-14'], TABUK999); // 아시르: 비움
own(['SA-01', 'SA-05', 'SA-06'], NAJD999);
own(['SA-08', 'SA-10'], DESERT999);
ownSplitFrom1000('SA-12', ['SA-12'], [['히자즈북부', HEJAZ_N]], '자우프', DESERT999, { 히자즈북부: [[1000, null], [1263, MAM]], 자우프: [[1000, null]] });
ownSplit('SA-04', ['SA-04'], [['하사', HASA]], '사막', { 하사: [...HASA999, [1077, UYU], [1253, USF], [1320, JAR], [1417, JAB]], 사막: DESERT999 });
own(idsOf('BHR', 'QAT'), BQ999);
// 예멘
own(['SA-09'], [...ZYD999, [1019, null]]); // 지잔(술라이만 샤리프 땅): 지야드 끝 뒤 비움
const TIHAMA = [[1019, null], [1022, NAJ], [1060, SUL], [1089, NAJ], [1159, MAH], [1174, AYE], [1229, RSL]];
own(['YE-HU', 'YE-HJ'], [...ZYD999, ...TIHAMA]);
own(['YE-LA', 'YE-AD', 'YE-AB', 'YE-DA'], [...ZYD999, [1019, null], [1063, SUL], [1083, ZUR], [1174, AYE], [1229, RSL]]); // 아덴·라헤즈·아비얀·달리
const HIGHLAND = [[1063, SUL], [1138, null], [1174, AYE], [1229, RSL]]; // 다마르·이브·바이다·라이마·타이즈
own(['YE-TA'], [...ZYD999, [1019, null], ...HIGHLAND]);
own(['YE-DH', 'YE-IB', 'YE-BA', 'YE-RA'], [...YUF999, ...HIGHLAND]);
own(['YE-MW'], [...YUF999, [1063, SUL], [1098, HSN], [1189, AYE], [1229, RSL]]); // 마흐위트(사나 북서): 1098년부터 사나 쪽 길(지블라 쪽 고지와 떨어짐)
own(['YE-SN', 'YE-SA'], [...YUF999, [1063, SUL], [1098, HSN], [1189, AYE], [1229, RSL], [1324, null]]); // 사나: 1324 자이드파 점령 뒤 되풀이해 바뀌어 비움(확정 9)
own(['YE-SD', 'YE-AM'], ZAI999); // 자이드파 이맘국 그대로
own(['YE-HD', 'YE-SH', 'YE-MR', 'YE-JA', 'YE-MA'], YINT999);
// 오만
own(['OM-DA', 'OM-ZA'], [...OMAN999, [1000, null], [1016, OMI], [1154, NAB]]); // 내륙(니즈와·바흘라)
own([...minus(idsOf('OMN'), 'OM-WU', 'OM-ZU', 'OM-DA', 'OM-ZA'), ...idsOf('ARE')], [...OMAN999, [1000, null]]); // 해안·바티나·아랍에미리트
own(['OM-WU', 'OM-ZU'], DESERT999);

// ── ④ 1000~1452: 이라크·이란 (구현 ④) ──
// 서아시아·북아프리카 A3b-4a (2026-10-30). 등급 '일반'. 운영자 결정은 scratchpad a3/decisions.md(질문 창구 ② 17·19·20과 notes-4 2절 그 밖 줄·4절 확정(기본) 추천 그대로),
//   사료는 a3/research/notes-4.md. 이란·이라크 조각의 1000~1220년을 칠한다(장기 왕조의 모술·두호크 1127~1233은 ③ 절). 1221년부터는 구현 ④b가 각 줄 끝에 이어 적었다(아래 ④b 절 상수).
//   ① 절의 999년까지 줄 상수(KHR999 등)에 1000년부터를 이어 붙인다(999년까지 버전은 그대로).
// 가즈니·셀주크 본토·호라즘은 지금 이란 땅 안쪽만 칠한다(결정 4②, 아프가니스탄·투르크메니스탄·아나톨리아·캅카스는 칠하지 않음).
// 부와이: 999년 모습을 이어 1008 이스파한(카쿠이), 1012 힐라 둘레(마즈야드), 1023 하마단·마르카지(카쿠이), 1029 라이·곰·카즈빈(가즈니, 결정 17),
//   1041 케르만(케르만 셀주크), 1051 코르데스탄, 1055 이라크·후제스탄·일람(투그릴의 바그다드)을 잃고 1062 파르스(셀주크)로 끝.
// 가즈니 1000 호라산(999년 사만 끝)·1029 라이 쪽(가신 지야르 왕조의 쿠미스 너머라 떨어진 땅) → 1040 단다나칸 뒤 셀주크(투그릴의 라이 1042와 2년 차, 같은 해에 넘김).
// 셀주크 1040 호라산·쿠미스·라이, 1051 이스파한·하마단(카쿠이를 야즈드로 옮김), 1054 아제르바이잔(라와드), 1055 이라크·자그로스, 1062 파르스·잔잔(살라르), 1090 고르간(지야르 끝),
//   1096 모술(케르보가). 1118 마흐무드 2세의 이라크 셀주크가 서쪽(이란 서부·이라크)을 갈라 가지고, 산자르의 셀주크 제국은 호라산·쿠미스·고르간만 남아 1157 산자르 죽음으로 끝.
// 이라크 셀주크 1118 → 1136 엘디구즈의 아제르바이잔, 1148 파르스(살구르)·로레스탄·일람(하자라스프), 1152 이라크 중부(칼리프 알무크타피), 1160 잔잔·카즈빈·코르데스탄·하마단·
//   케르만샤(엘디구즈, 아르슬란샤 즉위 뒤 아타베그가 실권), 1169 라이(엘디구즈), 1175 이스파한·야즈드(파흘라반) — 술탄을 내세운 아타베그의 땅은 엘디구즈 색(명목 종주는 관계로).
//   1175~1193은 후제스탄과 바스라 쪽만 남고 1194 토그릴 3세가 테키시에게 져 끝.
// 호라즘 1194 라이·하마단·이스파한·쿠미스(테키시가 페르시아 이라크를 정복), 1196 케르만(확정(기본) K15)·야즈드, 1198 호라산(칼리프가 술탄으로 인정, 결정 17),
//   1200~1203 페르시아 이라크는 테키시 죽음 뒤 무정부(비움), 1204~1216 엘디구즈 맘루크(아이두그미시·멩글리) 땅, 1210 마잔다란(바반드 끝)·고르간, 1217 페르시아 이라크 전부.
// 지방 왕조(결정 3, 따로 항목·vassal_of): 카쿠이 1008(이스파한 → 1051 야즈드, 1141 끝), 마즈야드 1012(힐라 둘레, 1152 칼리프), 안나즈 1015(케르만샤, 1055 끝 — 디얄라 평야는 부와이의 바그다드와 이어지게 바그다드 쪽 길),
//   케르만 셀주크 1041(1187~1195 오구즈 말리크 디나르는 비움), 바반드 1090(마잔다란), 엘디구즈 1136, 살구르 1148(파르스·부셰르·코길루예), 하자라스프 1148(로레스탄·일람).
// 아바스 칼리프국 직할: 1152 바그다드·안바르·와시트·힐라 둘레·살라딘·키르쿠크·디얄라(알무크타피), 1194 바스라 쪽(알나시르, 기억값).
// 비움: 호라산 1157~1197(결정 17)·쿠미스 1157~1193·고르간 1157~1209(산자르 뒤 오구즈·무아이야드 아이아바·바반드가 다툰 땅), 시스탄·발루치스탄·호르모즈간·무탄나·길란(모든 해),
//   서아제르바이잔 1000~1053, 로레스탄 1015~1054, 아르빌·술라이마니야 1144~(베그티긴 가문, 이름만), 후제스탄 1194~(결정 19), 케르만 1187~1195, 페르시아 이라크 1200~1203.
// 그리지 않음: 니자르 이스마일파 성채망(K6), 1030년 무렵 가즈니의 이스파한 점령·1203~1204 살구르의 이스파한·1217 호라즘의 바그다드 진군(되돌려짐), 마라게 아타베그(1만 km² 미만).
// 근거(위키백과 en): Buyid dynasty, Ghaznavid Empire, Seljuk Empire, Kakuyids, Ziyarid dynasty, Banu Mazyad, Uqaylid dynasty, Kerman Seljuk Sultanate, Eldiguzids, Salghurids,
//   Hazaraspids, Khwarazmian Empire, Bavand dynasty, Al-Muqtafi, Rawadid dynasty, Hasanwayhid dynasty, Annazids, Ala al-Din Tekish, Shams al-Din Ildeniz, Muhammad II of Khwarazm.
const GHA = 'ghaznavid-empire';
const KAK = 'kakuyid-dynasty';
const ANN = 'annazid-dynasty';
const MAZ = 'mazyadid-dynasty';
const BAV = 'bavandid-dynasty';
const SEL = 'seljuk-empire';
const KRS = 'kirman-seljuk-sultanate';
const ISQ = 'iraq-seljuk-sultanate';
const ELD = 'eldiguzid-dynasty';
const SLG = 'salghurid-dynasty';
const HZR = 'hazaraspid-dynasty';
const KHW = 'khwarazmian-empire';
// ── ④b 1221~1452: 몽골 늘림·일 칸국과 그 뒤 (구현 ④b) ──
// 서아시아·북아프리카 A3b-4b (2026-10-30). 등급 '일반'. 운영자 결정은 질문 창구 ② 18~21, 사료는 a3/research/notes-4.md 5~10절. 아래 ④ 절 줄 끝의 1221년부터 자리를 이 상수로 채운다.
// 몽골 제국(동아시아 권역 나라를 늘림, MON): 1221 호라산·쿠미스·고르간(호라즘 정복, 결정 18), 1231 아제르바이잔·잔잔·카즈빈·코르데스탄·라이·하마단·케르만샤·야즈드(잘랄 앗딘 죽음,
//   초르마간 1230 겨울 부임), 1237 이스파한·차하르마할(1236년 포위 때도 항복하지 않음 — en 'Chormaqan', 함락 해는 기억값), 1258 이라크(모술 뺌)·후제스탄(바그다드 함락). 1260년부터 일 칸국(결정 18: 항목 1256, 도형 1260).
//   본토(몽골 초원)와는 그리지 않은 중앙아시아로 떨어져 있어 data/exclaves.yaml에 허용 줄. 마잔다란은 1221~1237 비움(K2), 1238 바반드(몽골 가신)
// 일 칸국 1260(몽골 땅을 이어받음), 1262 모술(루울루 정권 끝), 1282 파르스(살구르 끝), 1306 케르만(쿠틀루그 칸 끝) — 1335 아부 사이드 죽음으로 끝.
// 1335년 뒤: 잘라이르 1335 이라크(모술·아르빌·술라이마니야 포함, 결정 20)와 이란 서부(하산 부주르그가 세운 무함마드 칸이 1337~1338년 호라산 밖 모든 땅에서 인정됨 — en 'Jalayirid Sultanate'),
//   초바니 1338 아제르바이잔·잔잔·카즈빈·코르데스탄·라이·하마단·케르만샤('west central Persia'), 이스파한 1338~1342·파르스 1339~1342(피르 후사인, en 'Chobanids'·'Injuids').
//   1357 황금 군단의 타브리즈(2년 남짓, 그리지 않음 K8)로 초바니 끝, 1358 잘라이르(우와이스)가 아제르바이잔과 술타니예 쪽(잔잔·카즈빈·코르데스탄)을 다스림(1384 술타니예·1386 타브리즈를 티무르에게 잃음).
//   라이 둘레는 테헤란·알보르즈 1357~1370년·곰·마르카지 1357~1383년, 하마단·케르만샤는 1357~1392년 다스린 나라의 근거가 없어 비움(운영자 확인 후보).
//   1371 잘라이르 라이(테헤란·알보르즈 — 우와이스가 아미르 왈리를 깨고 라이 총독을 둠, 1384 티무르까지, en 'Shaikh Uvais').
//   인주 1335 파르스(1343 시라즈 회복)·1343 이스파한, 무자파르 1319 야즈드(결정 20)·1340 케르만·1353 파르스·1357 이스파한(1387~1392는 티무르가 되돌려 앉힌 무자파르 왕자들, en 'Muzaffarids (Iran)').
//   사르바다르 1337 호라산 서부(동경 59° 서쪽, 결정 20 서부만 — 세브제바르·니샤푸르·주바인·자자름), 호라산 동부·쿠미스·고르간 1335~ 비움(토가 테무르·카르트·아미르 왈리, 이름만).
// 티무르 1381 호라산, 1384 라이·쿠미스·고르간·잔잔·카즈빈·코르데스탄(술타니예), 1386 아제르바이잔, 1393 파르스·야즈드·케르만·이스파한·하마단·케르만샤·후제스탄(무자파르 끝) →
//   1406 아제르바이잔·1410 잔잔·카즈빈·코르데스탄을 카라코윤루에게, 1405 후제스탄 비움(결정 19), 1447 샤 루흐 죽음 뒤 호라산·고르간만(결정 21, A2 1453 모양).
// 카라코윤루 1406 아제르바이잔(카라 유수프의 타브리즈), 1410 이라크 중·북부와 잔잔·카즈빈·코르데스탄(아흐마드 처형), 1431 힐라·와시트(잘라이르 잔당 끝),
//   1452 라이·곰·마르카지·하마단·케르만샤·일람·이스파한·파르스·야즈드(자한 샤 — A2 1453 첫 모양과 같은 조각). 잘라이르 잔당 1410~1431 힐라·와시트·바스라(en: 'ruling Hillah, Wasit, and Basra'), 1432~ 바스라 쪽 비움.
// 그 밖: 쿠틀루그 칸 1222 케르만, 하자라스프 1424 끝(로레스탄·일람 비움), 무샤샤 1441 후제스탄(A2 항목 앞 버전), 바반드 1349 끝(마잔다란 비움). 티무르의 이라크(1393~1394·1401~1405)는 그리지 않음(K10).
// 근거(위키백과 en): Ilkhanate, Chormaqan, Qutlugh-Khanids, Salghurids, Jalayirid Sultanate, Chobanids, Injuids, Muzaffarids (Iran), Sarbadars, Timur, Shah Rukh, Qara Yusuf, Hazaraspids, Bavand dynasty.
const ILK = 'ilkhanate';
const JAL = 'jalayirid-sultanate';
const CHO = 'chobanid-dynasty';
const INJ = 'injuid-dynasty';
const MUZ = 'muzaffarid-dynasty';
const SRB = 'sarbadar-dynasty';
const QKH = 'qutlugh-khanid-dynasty';
const TIM = 'timurid-empire'; // A2 항목(1453~)의 앞 버전
const QQ = 'qara-qoyunlu'; // A2 항목(1453~)의 앞 버전
const MSH = 'musha-sha'; // A2 항목(1453~)의 앞 버전
// 1300년부터 나누는 조각(구현 ④b): 1299년까지 표는 통째 조각으로 lineBefore를 적어 앞 버전 도형을 그대로 두고, T1300부터 split·reuse한다. lines는 { 부분 이름: 1300년부터의 줄 }
const ownSplitFrom1300 = (name, ids, parts, restName, lineBefore, lines) => {
  let out = null;
  for (const T of TABLES) {
    if (T.TO <= 1300) {
      T.own(T.whole(...ids), sliceLine(lineBefore, T.FROM, T.TO));
      continue;
    }
    out = out ? T.reuse(out) : T.split(name, ids, parts, restName);
    for (const [part, line] of Object.entries(lines)) T.own([out[part]], sliceLine(line, T.FROM, T.TO));
  }
  for (const id of ids) painted.add(id);
};
// 사르바다르 서부(구현 ④b, 결정 창구 ② 20 '서부만'): 라자비 호라산 IR-30을 동경 59° 선으로 나눈다(서쪽 = 세브제바르·니샤푸르·주바인, 동쪽 = 투스·마슈하드·토르바트).
//   notes-4 P8 안 B의 '경도 약 58.7°'를 니샤푸르(58.80°)가 들게 59°로 어림. 산지·사막 속 어림 선이라 lines 검사 키 없음. 이 선으로는 IR-30만 나눈다(북호라산 IR-31은 통째로 서쪽 줄, 1300년부터)
const SARBADAR_W = box(54.0, 32.0, 59.0, 39.0);
// 1221년부터의 줄 묶음
const RAY1221 = [[1231, MON], [1260, ILK], [1335, JAL], [1338, CHO], [1357, null], [1384, TIM], [1447, null], [1452, QQ]]; // 라이·곰·마르카지
const HKL1221 = [[1231, MON], [1260, ILK], [1335, JAL], [1338, CHO], [1357, null], [1393, TIM], [1447, null], [1452, QQ]]; // 하마단·케르만샤
const ZQK1221 = [[1231, MON], [1260, ILK], [1335, JAL], [1338, CHO], [1357, null], [1358, JAL], [1384, TIM], [1410, QQ]]; // 잔잔·카즈빈·코르데스탄
const AZ1225 = [[1225, KHW], [1231, MON], [1260, ILK], [1335, JAL], [1338, CHO], [1357, null], [1358, JAL], [1386, TIM], [1406, QQ]]; // 아제르바이잔(1225 잘랄 앗딘의 타브리즈)
const ESF1221 = [[1231, null], [1237, MON], [1260, ILK], [1335, JAL], [1338, CHO], [1343, INJ], [1357, MUZ], [1393, TIM], [1447, null]]; // 이스파한·차하르마할(1231~1236 이스파한은 항복하지 않음)
const FARS1221 = [[1282, ILK], [1335, INJ], [1339, CHO], [1343, INJ], [1353, MUZ], [1393, TIM], [1447, null]]; // 파르스·부셰르·코길루예(살구르는 1281년까지)
const KHR1221 = [[1221, MON], [1260, ILK], [1335, null]]; // 호라산(1335~ 동부는 토가 테무르·카르트 등 이름만)
const IRQ1258 = [[1258, MON], [1260, ILK], [1335, JAL]]; // 이라크(바그다드 함락 1258, 잘라이르 1335)
// 동쪽: 호라산·쿠미스·카스피
const KHR1220 = [...KHR999, [1000, GHA], [1040, SEL], [1157, null], [1198, KHW]];
own(['IR-29'], [...KHR1220, ...KHR1221, [1381, TIM]]); // 남호라산
own(['IR-31'], [...KHR1220, ...KHR1221, [1337, SRB], [1381, TIM]]); // 북호라산: 사르바다르(서부)
ownSplitFrom1300('IR-30', ['IR-30'], [['서부', SARBADAR_W]], '동부', [...KHR1220, ...KHR1221], { 서부: [[1300, ILK], [1335, null], [1337, SRB], [1381, TIM]], 동부: [[1300, ILK], [1335, null], [1381, TIM]] }); // 라자비 호라산
own(['IR-12'], [...SMN999, [1000, ZIY], [1040, SEL], [1157, null], [1194, KHW], [1221, MON], [1260, ILK], [1335, null], [1384, TIM], [1447, null]]); // 쿠미스: 1194 테키시의 서진 길, 1335~1383 비움(사르바다르·토가 테무르·아미르 왈리가 오감)
own(['IR-27'], [...CASP999, [1000, ZIY], [1090, SEL], [1157, null], [1210, KHW], [1221, MON], [1260, ILK], [1335, null], [1384, TIM]]); // 고르간: 1335~1383 토가 테무르·아미르 왈리(이름만, K2)
own(['IR-21'], [...CASP999, [1000, ZIY], [1090, BAV], [1210, KHW], [1221, null], [1238, BAV], [1349, null]]); // 마잔다란(타바리스탄): 1238 킨흐와리야 갈래(몽골 가신), 1349~ 비움(마르아시는 A2 1453이 비어 있어 그리지 않음, K2)
// 남쪽: 케르만·파르스·야즈드·후제스탄
own(['IR-15'], [...KRM999, [1000, BUY], [1041, KRS], [1187, null], [1196, KHW], [1222, QKH], [1306, ILK], [1335, null], [1340, MUZ], [1393, TIM], [1447, null]]); // 케르만: 1335~1339 일 칸국 총독 뒤 다툼(무자파르는 1340년 말부터)
own(['IR-23'], [...KRM999, [1000, null]]); // 호르모즈간: 모든 해 비움(결정 19, A2 1453과 같음)
own(['IR-14'], [...FRS999, [1000, BUY], [1062, SEL], [1118, ISQ], [1148, SLG], ...FARS1221, [1452, QQ]]); // 파르스
own(['IR-06', 'IR-18'], [...FRS999, [1000, BUY], [1062, SEL], [1118, ISQ], [1148, SLG], ...FARS1221]); // 부셰르·코길루예(A2 1453 비움)
// 야즈드: 1051 카쿠이(셀주크 봉토), 1141 카트완 전투 뒤 야즈드 아타베그의 땅은 종주국 색(결정 20) — 1175부터 이스파한을 가진 나라와 같은 길
const ISFAHAN = [[1175, ELD], [1194, KHW], [1200, null], [1204, ELD], [1217, KHW]];
own(['IR-25'], [...FRS999, [1000, BUY], [1051, KAK], [1141, ISQ], ...ISFAHAN, [1231, MON], [1260, ILK], [1319, MUZ], [1393, TIM], [1447, null], [1452, QQ]]); // 야즈드: 1319 무바리즈 앗딘(결정 20)
own(['IR-10'], [...KHZ999, [1000, BUY], [1055, SEL], [1118, ISQ], [1194, null], [1258, MON], [1260, ILK], [1335, null], [1393, TIM], [1405, null], [1441, MSH]]); // 후제스탄: 1194~1257·1335~1392·1405~1440 비움(결정 19)
// 자발(이란 서부)
own(['IR-04'], [...ESF999, [1000, BUY], [1008, KAK], [1051, SEL], [1118, ISQ], ...ISFAHAN, ...ESF1221, [1452, QQ]]); // 이스파한
own(['IR-08'], [...ESF999, [1000, BUY], [1008, KAK], [1051, SEL], [1118, ISQ], ...ISFAHAN, ...ESF1221]); // 차하르마할(A2 1453 비움)
const JIBAL_W = [[1160, ELD], [1194, KHW], [1200, null], [1204, ELD], [1217, KHW]]; // 하마단 쪽: 1160 엘디구즈 … 1217 호라즘
own(['IR-22'], [...ESF999, [1000, BUY], [1023, KAK], [1051, SEL], [1118, ISQ], ...JIBAL_W, ...RAY1221]); // 마르카지: 카쿠이의 이스파한과 하마단 사이
own(['IR-24'], [...HMD999, [1000, BUY], [1023, KAK], [1051, SEL], [1118, ISQ], ...JIBAL_W, ...HKL1221]); // 하마단
own(['IR-17'], [...KSH999, [1000, HAS], [1015, ANN], [1055, SEL], [1118, ISQ], ...JIBAL_W, ...HKL1221]); // 케르만샤(디나바르)
const RAYL = [[1000, BUY], [1029, GHA], [1040, SEL], [1118, ISQ], [1169, ELD], [1194, KHW], [1200, null], [1204, ELD], [1217, KHW], ...RAY1221];
own(['IRN-3216', 'IRN-5490'], [...RAY999, ...RAYL.filter(([y]) => y < 1384), [1371, JAL], ...RAYL.filter(([y]) => y >= 1384)]); // 테헤란(라이)·알보르즈: 1371 우와이스가 아미르 왈리를 라이에서 깨고 총독을 둠(en 'Shaikh Uvais')
own(['IR-26'], [...ESF999, ...RAYL]); // 곰: 라이와 같은 길
own(['IR-28'], [...RAY999, [1000, BUY], [1029, GHA], [1040, SEL], [1118, ISQ], [1160, ELD], [1217, KHW], ...ZQK1221]); // 카즈빈
own(['IR-11'], [...ZNJ999, [1000, SAL], [1062, SEL], [1118, ISQ], [1160, ELD], [1217, KHW], ...ZQK1221]); // 잔잔(타롬): 살라르 왕조 1062년까지
own(['IR-16'], [...KRD999, [1000, BUY], [1051, SEL], [1118, ISQ], [1160, ELD], [1217, KHW], ...ZQK1221]); // 코르데스탄
own(['IR-20'], [...LOR999, [1000, HAS], [1015, null], [1055, SEL], [1118, ISQ], [1148, HZR], [1424, null]]); // 로레스탄(K5: 하산와이 뒤 1055 셀주크 전 비움, 1424~ 비움 — A2 1453과 같음)
own(['IR-05'], [...ILM999, [1000, BUY], [1055, SEL], [1118, ISQ], [1148, HZR], [1424, null], [1452, QQ]]); // 일람
// 아제르바이잔: 라와드 1054년까지(서아제르바이잔은 비움, K4), 1054 셀주크, 1136 엘디구즈
own(['IR-01', 'IR-03'], [...AZE999, [1000, RAW], [1054, SEL], [1118, ISQ], [1136, ELD], ...AZ1225]);
own(['IR-02'], [...AZW999, [1000, null], [1054, SEL], [1118, ISQ], [1136, ELD], ...AZ1225]);
// 이라크(안바르는 바그다드를 가진 나라 색, K1)
own(['IQ-BG', 'IQ-AN', 'IQ-SD', 'IQ-TS', 'IQ-DI'], [...IRQ999, [1055, SEL], [1118, ISQ], [1152, ABB], ...IRQ1258, [1410, QQ]]); // 디얄라 평야(바쿠바)는 바그다드 쪽 길(안나즈의 훌완은 케르만샤 쪽)
own(['IQ-WA'], [...IRQ999, [1055, SEL], [1118, ISQ], [1152, ABB], ...IRQ1258, [1431, QQ]]); // 와시트: 1410~1430 잘라이르 잔당(힐라·와시트·바스라), 1431 카라코윤루(아스판의 힐라 점령)
own(['IQ-BB', 'IQ-KA', 'IQ-NA', 'IQ-QA'], [...IRQ999, [1012, MAZ], [1152, ABB], ...IRQ1258, [1431, QQ]]); // 힐라 둘레(바빌·카르발라·나자프·카디시야): 마즈야드 1012~1151
own(['IQ-BA', 'IQ-DQ', 'IQ-MA'], [...IRQ999, [1055, SEL], [1118, ISQ], [1194, ABB], ...IRQ1258, [1432, null]]); // 바스라 쪽: 1152~1193 후제스탄과 함께 이라크 셀주크 쪽 아타베그, 1194 칼리프(기억값), 1432~ 비움(잘라이르 끝, A2 1453과 같음)
own(['IQ-MU'], [...IRQ999, [1000, null]]); // 무탄나(남서 사막): 모든 해 비움(결정 19)
own(['IQ-AR'], [...AR999, [1055, SEL], [1118, ISQ], [1144, null], [1232, ABB], ...IRQ1258, [1410, QQ]]); // 아르빌: 1144~1231 베그티긴 가문(이름만, K17), 1232 칼리프(쿠크부리 죽음)
own(['IQ-SU'], [...SU999, [1055, SEL], [1118, ISQ], [1144, null], ...IRQ1258, [1410, QQ]]); // 술라이마니야(샤흐리조르): 1144~1257 비움

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
  // ── ③ 1000~1452 ──
  V(1000, 1086, 'SY-LA'), // 라타키아: 동로마의 라오디케아(1084년까지, 동로마의 시리아 쪽은 1만 km² 미만이라 늘리지 않음)
  V(1098, 1188, 'SY-LA'), // 라타키아: 안티오키아 공국 땅(늘리지 않음, 운영자 결정 '십자군 해안(예외)')
  V(1260, 1287, 'SY-LA'), // 라타키아: 몽골이 보에몽 6세에게 돌려준 뒤 1287년 맘루크 정복 전(안티오키아·트리폴리 쪽, 늘리지 않음)
  V(1260, 1261, 'SY-HL', 'SY-ID'), // 알레포: 1260년 1월 몽골 함락 뒤 점령·철수·재습격이 이어져(되돌려진 점령은 칠하지 않음) 맘루크 지배는 1261년부터
  V(1000, 1025, 'SY-RA'), // 라까: 누마이르 부족(하란)과 우카일 사이에서 다스린 나라의 근거가 약함(1022 미르다스 병합 전)
  V(1038, 1144, 'SY-RA'), // 라까: 1038 무렵 누마이르 가문에게 넘어간 뒤 우카일·셀주크 아미르들이 오간 유프라테스 중류(장기 1144 전)
  V(1260, 1263, 'SY-RA'), // 라까: 몽골 침입 뒤 맘루크의 유프라테스 방어선이 서기 전
  V(1260, 1263, 'JO-KA', 'JO-AT', 'JO-AQ', 'JO-MN', 'JO-MD'), // 오트르조르댕: 아이유브 왕조 끝(1260) 뒤 카라크 분가 알무기스 우마르가 1263년 바이바르스에게 넘기기 전
  V(1096, 1453, 'SY-HA', 'SY-DY'), // 하사카·데이르에조르: 우카일 왕조 뒤 유목 부족과 모술·자지라 아미르들 사이(시리아 자지라는 라까만 칠함, 결정 15; A2 1453과 같음)
  V(1000, 1453, ...idsOf('KWT')), // 쿠웨이트(카지마): 바스라 쪽 정권의 실효 지배 근거가 약함(A2 1453과 같음)
  V(1000, 1263, 'SA-07'), // 타부크: 맘루크의 순례길 관할(1263) 전 베두인 부족 땅
  V(1000, 1453, 'SA-14'), // 아시르: 다스린 나라의 근거가 없음(베두인·고원 부족 땅, A2 1453과 같음)
  V(1000, 1453, 'SA-01', 'SA-05', 'SA-06'), // 나지드: 야마마 등 지방 부족 땅(주변 기준 아래, A2 1453과 같음)
  V(1000, 1453, 'SA-08', 'SA-10'), // 북부 국경·나지란: 사막 내륙
  B(1000, 1263, 'SA-12/히자즈북부'), // 하클 띠: 맘루크의 순례길 관할(1263) 전 베두인 부족 땅
  B(1000, 1453, 'SA-12/자우프'), // 자우프: 사막 내륙
  B(1000, 1453, 'SA-04/사막'), // 동부 주 사막(룹알할리): 사막 내륙
  V(1000, 1453, ...idsOf('BHR', 'QAT')), // 바레인·카타르: 카르마트·우윤 등의 지배 근거가 약함(바레인섬은 작음, A2 1453과 같음)
  V(1019, 1453, 'SA-09'), // 지잔(미흘라프 술라이마니): 지야드 왕조 뒤 술라이만 가문 샤리프 등 지방 세력 땅(A2 1453과 같음)
  V(1019, 1022, 'YE-HU', 'YE-HJ'), // 티하마: 지야드 왕조 끝 뒤 나자흐가 자비드를 잡기 전 노예 출신 재상들의 다툼
  V(1019, 1063, 'YE-LA', 'YE-AD', 'YE-AB', 'YE-DA', 'YE-TA'), // 아덴·라헤즈·타이즈 쪽: 지야드 왕조 뒤 아덴의 마안 가문 등 지방 세력 땅(술라이흐 1063 전)
  V(1000, 1063, 'YE-SN', 'YE-SA', 'YE-DH', 'YE-IB', 'YE-BA', 'YE-MW', 'YE-RA'), // 사나 고지: 유피르 왕조 뒤 부족 다툼(술라이흐 1063 전)
  V(1138, 1174, 'YE-TA', 'YE-DH', 'YE-IB', 'YE-BA', 'YE-RA'), // 지블라·타이즈 쪽 고지: 1138년 아르와 여왕 죽음 뒤 주라이 왕조 등의 영향권(아이유브 1174 전)
  V(1324, 1453, 'YE-SN', 'YE-SA'), // 사나: 1324년 자이드파 점령 뒤 자이드파와 라술 왕조가 되풀이해 바꿈(A2 1453과 같음)
  V(1000, 1453, 'YE-HD', 'YE-SH', 'YE-MR', 'YE-JA', 'YE-MA'), // 하드라마우트·샤브와·마흐라·자우프·마리브: 다스린 나라 근거 약함(내륙)
  V(1000, 1016, 'OM-DA', 'OM-ZA'), // 오만 내륙: 셋째 이맘국 뒤 넷째 이맘국(1016) 전 이바드파 부족 땅
  V(1000, 1453, ...minus(idsOf('OMN'), 'OM-WU', 'OM-ZU', 'OM-DA', 'OM-ZA'), ...idsOf('ARE')), // 오만 해안·아랍에미리트: 부와이·셀주크 총독령과 호르무즈 거점(실효 지배 근거 부족, notes-3 P10)
  V(1000, 1453, 'OM-WU', 'OM-ZU'), // 알우스타·도파르: 사막과 부족 땅(라술 왕조의 자파르는 영향권)
  // ── ④ 1000~1452 (이라크·이란, 1221년부터는 구현 ④b) ──
  B(1000, 1453, 'IR-13/시스탄', 'IR-13/발루치스탄'), // 시스탄·발루치스탄: 도읍 자란즈(지금 아프가니스탄)의 말리크 왕조와 발루치 부족 땅, 이란 쪽 지배 근거가 얇음(결정 19, notes-4 P5)
  V(1000, 1453, 'IR-23'), // 호르모즈간: 케르만 정권·호르무즈 왕국의 지배가 1만 km² 넘게 이어진 근거 없음(결정 19, A2 1453과 같음)
  V(1000, 1453, 'IR-19'), // 길란: 다일람·길란 지방 영주 땅(K2)
  V(1000, 1453, 'IQ-MU'), // 무탄나: 남서 사막(결정 19, A2 1453과 같음)
  V(1000, 1054, 'IR-02'), // 서아제르바이잔: 라와드 왕조 밖 쿠르드·아르메니아 영주 땅(K4), 1054 셀주크부터 칠함
  V(1015, 1055, 'IR-20'), // 로레스탄: 하산와이 왕조 뒤 쿠르드·루르 부족 땅(K5), 1055 셀주크부터 칠함
  V(1157, 1198, 'IR-29', 'IR-30', 'IR-31'), // 호라산: 1153 오구즈가 산자르를 사로잡고 1157 죽은 뒤 오구즈·무아이야드 아이아바·호라즘이 다툰 땅(결정 17)
  V(1157, 1194, 'IR-12'), // 쿠미스: 산자르 뒤 호라산과 같은 다툼(1194 테키시의 서진 전)
  V(1157, 1210, 'IR-27'), // 고르간: 산자르 뒤 호라산 아미르·바반드·호라즘이 다툰 땅(1210 호라즘 직할 전)
  V(1187, 1196, 'IR-15'), // 케르만: 케르만 셀주크를 몰아낸 오구즈 말리크 디나르의 땅(9년, K15)
  V(1194, 1258, 'IR-10'), // 후제스탄: 이라크 셀주크 끝 뒤 칼리프·아타베그·호라즘이 뒤섞인 땅(결정 19, notes-4 P9 — 1258 몽골부터 칠함)
  V(1200, 1204, 'IRN-3216', 'IRN-5490', 'IR-26', 'IR-22', 'IR-24', 'IR-17', 'IR-04', 'IR-08', 'IR-25'), // 페르시아 이라크·야즈드: 1200년 테키시 죽음 뒤 엘디구즈 맘루크가 차지하기(1203~1204) 전 무정부
  V(1144, 1232, 'IQ-AR'), // 아르빌: 베그티긴 가문(장기 왕조 가신, 이름만 — K17) 땅, 1232 쿠크부리 죽음 뒤 칼리프가 거둠
  V(1144, 1258, 'IQ-SU'), // 술라이마니야(샤흐리조르): 베그티긴 가문과 쿠르드 영주 땅(K17), 1258 몽골부터 칠함
  // ── ④b 1221~1452 (이라크·이란) ──
  V(1221, 1238, 'IR-21'), // 마잔다란: 1220~1221 몽골의 약탈 뒤 바반드 킨흐와리야 갈래(1238) 전 지방 영주 땅(K2)
  V(1349, 1453, 'IR-21'), // 마잔다란: 바반드 끝 뒤 촐라비·마르아시 등 지방 정권(A2 1453이 비어 있어 그리지 않음, K2)
  V(1231, 1237, 'IR-04', 'IR-08'), // 이스파한·차하르마할: 호라즘 끝 뒤 몽골에 항복하지 않은 도시 세력(1236 초르마간의 포위, en 'Chormaqan')
  V(1335, 1337, 'IR-30', 'IR-31'), // 라자비·북호라산: 아부 사이드 죽음 뒤 사르바다르 봉기(1337 세브제바르) 전 일 칸 후보·아미르들이 다툰 땅
  V(1335, 1381, 'IR-29'), // 남호라산: 카르트 왕조(헤라트)·카라우나스 영향권(이란 쪽 땅은 1만 km² 근거 없음, K7)
  B(1337, 1381, 'IR-30/동부'), // 라자비 호라산 동부(투스·마슈하드): 토가 테무르·자니 쿠르바니·데르비시 정권이 오간 땅(사르바다르는 서부만, 결정 20)
  V(1335, 1384, 'IR-12', 'IR-27'), // 쿠미스·고르간: 토가 테무르(1353까지)·아미르 왈리와 사르바다르가 오간 땅(이름만, K2 — 운영자 확인 후보)
  V(1447, 1453, 'IR-12'), // 쿠미스: 샤 루흐 죽음 뒤 티무르 왕조를 호라산·고르간으로 줄임(결정 21, A2 1453 비움)
  V(1335, 1340, 'IR-15'), // 케르만: 일 칸국 끝 뒤 몽골 총독과 무바리즈 앗딘이 다툰 땅(무자파르는 1340년 말부터, en 'Muzaffarids (Iran)')
  V(1447, 1453, 'IR-15', 'IR-06', 'IR-18', 'IR-08'), // 케르만·부셰르·코길루예·차하르마할: 샤 루흐 죽음 뒤 티무르 왕자들이 다툰 땅(결정 21, A2 1453 비움)
  V(1447, 1452, 'IR-14', 'IR-25', 'IR-04', 'IRN-3216', 'IRN-5490', 'IR-26', 'IR-22', 'IR-24', 'IR-17'), // 파르스·야즈드·이스파한·라이·하마단 쪽: 같은 다툼(결정 21), 1452 카라코윤루(자한 샤)
  V(1335, 1393, 'IR-10'), // 후제스탄: 일 칸국 끝 뒤 잘라이르·무자파르·하자라스프가 다툰 땅(결정 19)
  V(1405, 1441, 'IR-10'), // 후제스탄: 티무르 죽음 뒤 잘라이르 잔당·티무르 총독이 다툰 땅(결정 19), 1441 무샤샤
  V(1357, 1358, 'IR-01', 'IR-02', 'IR-03', 'IR-11', 'IR-28', 'IR-16'), // 아제르바이잔·술타니예 쪽: 1357 황금 군단의 타브리즈 점령(2년 남짓이라 그리지 않음, K8)
  V(1357, 1384, 'IRN-3216', 'IRN-5490', 'IR-26', 'IR-22'), // 라이·곰·마르카지: 초바니 끝 뒤 다스린 나라의 근거가 없음(잘라이르·무자파르·아미르 왈리가 오감, 운영자 확인 후보)
  V(1357, 1393, 'IR-24', 'IR-17'), // 하마단·케르만샤: 초바니 끝 뒤 다스린 나라의 근거가 없음(운영자 확인 후보)
  V(1424, 1453, 'IR-20'), // 로레스탄: 하자라스프 끝 뒤 루르 부족 땅(A2 1453 비움)
  V(1424, 1452, 'IR-05'), // 일람: 같음, 1452 카라코윤루(A2 1453과 같은 조각)
  V(1432, 1453, 'IQ-BA', 'IQ-DQ', 'IQ-MA'), // 바스라 쪽: 잘라이르 잔당 끝 뒤 무샤샤·부족 땅(A2 1453 비움)
];

export const era = {
  name: 'medieval',
  versions,
  gapZones,
  voids,
};
