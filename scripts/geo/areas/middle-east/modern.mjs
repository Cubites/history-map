// middle-east 시대 파일 modern (npm run new:area가 만든 틀, 시대표 하나에 파일 하나: standards.md 1절·9절 7)
// 시대·범위: 1918~현재: 위임 통치령·보호국·식민지와 독립 나라
// 짝 항목 파일: data/entities/middle-east-modern.yaml (나라 id는 그 파일과 이 파일의 versions가 같아야 한다)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs, areas/inner-asia.mjs, areas/china.mjs, areas/west.mjs, areas/japan.mjs, areas/southeast-asia.mjs, areas/europe.mjs, areas/middle-east/의 다른 도우미 모듈. areas/middle-east.mjs는 이 파일을 가져오는 쪽이라 가져올 수 없다(순환).
//   권역 파일 안 도형이 필요하면 그 도형을 areas/middle-east/의 도우미 모듈로 옮겨 둘이 함께 가져온다.
// 생성기에 들어가는 것은 export const era 하나다(칼선 같은 다른 이름은 export해도 되지만 versions·gapZones·source 같은 이름은 안 됨: check:generator). 권역 파일 areas/middle-east.mjs가 shared.mjs의 joinEras로 자기 versions·gapZones·voids에 합치고,
// 같은 나라 id를 두 파일이 내면 기간이 겹치지 않을 때만 앞 파일 버전 뒤에 이어 붙인다(겹치거나 출처 문구가 다르면 생성기가 멈춘다).
// - versions: 나라 id → [[from, to, 멀티폴리곤, 확실성?], ...] (해는 천문 연도, to는 미포함)
// - gapZones: 빈 땅 검사 구역 [{ name, zone, minus?, from?, to? }] (engine.mjs collectGapZones, 이름은 모든 권역을 통틀어 겹치지 않게)
// - voids: 일부러 비운 땅 [[from, to(끝 없음은 null), 멀티폴리곤]] (이유는 그 줄 주석에)
// - source: (선택) 이 시대 나라의 출처 문구. 없으면 권역의 source나 기본 문구
//
// ── 서아시아·북아프리카 A1a-1 (2026-10-29): 레반트·이라크·쿠웨이트 1918~현재, A1a-2 (같은 날): 아라비아 반도·이란 1918~현재 ──────────────
// 등급 '일반'(00-scope 3절: 땅 1만 km², 선 평균 10 / 최대 25 km), 아라비아 내륙은 '주변'(zones.yaml arabia-interior: 땅 5만 km², 선 25 / 50 km). 운영자 결정은 scratchpad a1/decisions.md(질문 창구 ①②), 사료는 a1/research/notes-a.md.
// 짜임: 조각 소유표 하나(T1918, 1918~지금). 표의 꼴은 도우미 모듈 table.mjs(유럽 makeTable과 같은 꼴). 표의 모든 조각을 한 번씩 쓰고,
//   아직 그리지 않은 땅(이집트·마그레브는 A1b)과 일부러 비운 땅은 주인 null로 둔다. 다음 단계는 그 줄을 나라로 바꾼다.
// 식민지·보호국·위임 통치령은 본국을 넓히지 않고 따로 항목(관계 vassal_of), 주권이 남은 군사 점령은 옛 나라 색 계열의 지역 항목(occupied_by): 운영자 결정 2.
// 내전·전쟁 중의 실효 지배는 그리지 않는다(운영자 결정 3). 하타이(TR-31)는 유럽 조각이라 이 파일이 칠하지 않는다(유럽이 1918~1938 비워 둠).
// 이음매: 튀르키예–시리아·튀르키예–이라크 선은 조각 준비(prep:fragments의 under: 'europe')에서 유럽 조각 바깥선 그대로라 이 파일은 손대지 않는다.
// 근거: 위키백과 en(Occupied Enemy Territory Administration, French Mandate for Syria and the Lebanon, Greater Lebanon, Mandatory Palestine, Emirate of Transjordan,
//   1949 Armistice Agreements, Golan Heights, Mandatory Iraq, Mosul Question, United Arab Republic, Syrian Republic (1930–1963), Kuwait), A1a-2: Kingdom of Hejaz, Emirate of Jabal Shammar, Idrisid Emirate of Asir, Asir Province, Saudi–Yemeni War (1934), Mutawakkilite Kingdom of Yemen,
//   Aden Protectorate, Sultanate of Muscat and Oman, Imamate of Oman, Trucial States, Pahlavi Iran, Qajar Iran. 수도 정답표: data/tests/places/middle-east.yaml
import { D, I, box } from '../../lib.mjs';
import { versions as EU_VERSIONS } from '../europe.mjs';
import { ME, build, idsOf, joinTables, makeTable, minus } from './table.mjs';

const PRESENT = 2026; // 지금 해. 표는 PRESENT년 말까지 정하고, 끝까지 이어지는 버전은 to: null(지금까지)

// ── 칼선 ─────────────────────────────────────────
// 골란 고원(시리아 땅, 운영자 결정 4): 조각 IL-Z(HaZafon, 이스라엘 북부 지구)가 1967년부터 이스라엘이 다스리는 골란을 품고 있어, 1923년 위임 통치 경계(1949 휴전선과 거의 같음)로 나눈다.
// 레바논 경계 쪽 단(텔단)과 바니야스 사이에서 남쪽으로 훌라 골짜기 동쪽 기슭, 요르단강(브노트 야아코브 다리)을 따라 갈릴리호 북쪽, 호수 동쪽 기슭 바로 안쪽(호수는 위임 통치령 팔레스타인),
// 하마트 가데르 서쪽에서 야르무크강(요르단 경계)까지. 대략(수 km 오차), 이 선으로는 IL-Z만 나눈다. 나머지 변은 시리아 쪽으로 넉넉히 둔다. // 강 키 없음(요르단강 상류는 Natural Earth 10m 강에 없음)
const GOLAN = [[[35.668, 33.6], [35.668, 33.27], [35.666, 33.245], [35.648, 33.2], [35.642, 33.1], [35.636, 33.03], [35.629, 33.0], [35.631, 32.92],
  [35.646, 32.88], [35.656, 32.83], [35.65, 32.77], [35.646, 32.72], [35.662, 32.69], [35.662, 32.55], [36.1, 32.55], [36.1, 33.6], [35.668, 33.6]]];

// 나지란(사우디·예멘 사이 귀속 다툼 땅, 1934 타이프 조약으로 사우디): 조각 SA-10(나지란 주)이 서쪽 나지란 오아시스·와디 나지란과 동쪽 룹알할리 사막을 함께 품고 있어,
// 오아시스 쪽(정착지가 있는 서쪽)을 동경 45도 남북선으로 떼어 낸다. 사막 쪽 경계는 정해진 적이 없어 선은 어림이고(주변 구역 끝 기준 안), 이 선으로는 SA-10만 나눈다.
const NAJRAN = [[[43.5, 16.8], [45.0, 16.8], [45.0, 19.7], [43.5, 19.7], [43.5, 16.8]]];
// 이란–투르크메니스탄 이음매: 유럽의 소련 도형(1918~1991)은 남쪽 변이 Natural Earth 50m 국경을 줄인 선이라, 이란 조각(10m 행정구역) 골레스탄·북호라산·라자비호라산과
// 약 460 km² 겹친다. 선은 아래층(유럽)이 가지므로 소련이 있는 해에는 그 겹침을 이란에서 빼고(주인 없음), 소련이 없어진 1992년부터 이란에 돌려준다.
// 소련 도형은 이 구간에서 모든 버전이 같아 마지막 버전을 쓰고, 이란 북동쪽 상자로 잘라 이 세 조각만 나눈다.
const SOVIET_IRN = I(EU_VERSIONS['soviet-union'].at(-1)[2], box(53.5, 35.0, 61.5, 38.6));
// 히자즈 북부: 조각 SA-12(Natural Earth 'Al Jawf')는 자우프·사카카 오아시스뿐 아니라 요르단 남쪽 경계를 따라 아카바만 기슭(하클)까지 띠처럼 뻗어 있다.
// 동경 37도 서쪽(하클~타부크 북쪽 띠, 약 1.37만 km²)은 히자즈 왕국 땅으로 떼어 마안·아카바와 히자즈 본토를 잇는다. 이 선으로는 SA-12만 나눈다(사막 속 어림 선).
const HEJAZ_N = box(34.0, 27.0, 37.0, 32.5);
// 하자 티하마: 조각 YE-HJ(하자 주)의 해안 평야(미디·압스·하라드)는 이드리스 가 땅이고 산지(하자)는 무타와킬 왕국 땅이었다. 동경 43.3도 서쪽을 떼어 지잔과 호데이다를 잇는다(어림 선, YE-HJ만 나눔).
const HAJJAH_TIHAMA = box(42.5, 15.4, 43.3, 16.8);
// 나흐와(샤르자의 월경지, 약 3 km²): 오만 월경지 마다(무산담 주 OM-MU) 안에 다시 박힌 땅이라 아랍에미리트 도형에 폭 1 km 안팎의 가는 띠를 만든다. 오만 쪽에 둔다(1만 km² 미만).
const NAHWA = box(56.255, 25.24, 56.29, 25.29);

// ── 조각 소유표 (1918~지금) ─────────────────────────
const T1918 = makeTable(1918, PRESENT + 1);
{
  const { whole, split, own } = T1918;
  const FMS = 'french-mandate-syria';
  const SYRIA = [[1920, FMS], [1946, 'syria-republic'], [1958, 'united-arab-republic'], [1961, 'syria']]; // 1920 위임 통치(7월 마이살룬 뒤 프랑스 지배), 1946 프랑스군 철수(4월 17일), 1958 아랍 연합 공화국(2월 1일), 1961 이탈(9월 28일)
  const LEB = [[1920, 'greater-lebanon'], [1943, 'lebanon']]; // 1920-09-01 대레바논 선포, 1943-11-22 독립
  const MP = 'mandatory-palestine'; // 1920 민간 행정(7월 1일), 1948-05-14 위임 통치 끝
  const IL_Z = split('IL-Z', ['IL-Z'], [['골란', GOLAN]], '갈릴리');

  // 시리아: 1918~1919 점령지 행정 동부(내륙)·서부(라타키아·타르투스 해안). 골란은 시리아 땅 그대로(1981 이스라엘 병합 선언은 글로)
  own([...whole(...minus(idsOf('SYR'), 'SY-LA', 'SY-TA')), IL_Z.골란], [[1918, 'oeta-east'], ...SYRIA]);
  own(whole('SY-LA', 'SY-TA'), [[1918, 'oeta-west'], ...SYRIA]);
  // 레바논: 베카(LB-BI)는 1918년 점령지 행정 동부(1919년 11월 영국군 철수 뒤 프랑스 쪽으로 넘어간 변화는 1만 km² 미만이라 1918년 모습 하나)
  own(whole('LB-BI'), [[1918, 'oeta-east'], ...LEB]);
  own(whole(...minus(idsOf('LBN'), 'LB-BI')), [[1918, 'oeta-west'], ...LEB]);
  // 팔레스타인: 1948년부터 이스라엘은 1949 휴전선 모습 한 버전(동예루살렘 IL-JM 안 약 70 km²는 나누지 않음, 글로)
  own([...whole(...minus(idsOf('ISR'), 'IL-Z')), IL_Z.갈릴리], [[1918, 'oeta-south'], [1920, MP], [1948, 'israel']]);
  // 서안·가자: 1948년은 휴전 전 전쟁 중의 지배라 비우고(운영자 결정 3), 1949년 휴전 협정부터 따로 지역 항목(요르단·이집트 점령, 1967년부터 이스라엘 점령: 관계)
  own(whole('PS-WBK'), [[1918, 'oeta-south'], [1920, MP], [1948, null], [1949, 'west-bank']]);
  own(whole('PS-GZZ'), [[1918, 'oeta-south'], [1920, MP], [1948, null], [1949, 'gaza-strip']]);
  // 요르단: 1918~1919 점령지 행정 동부, 1920년은 마이살룬 전투 뒤 지방 정부들만 선 무주 상태라 비움(1921-04-11 아브둘라 정부부터 트란스요르단)
  own(whole(...minus(idsOf('JOR'), 'JO-MN', 'JO-AQ')), [[1918, 'oeta-east'], [1920, null], [1921, 'transjordan'], [1946, 'jordan']]);
  // 마안·아카바: 1924년까지 히자즈 왕국 땅, 1925년 트란스요르단 편입(히자즈 소멸, 1927 지다 조약에서 이븐 사우드가 사적으로 받아들임)
  own(whole('JO-MN', 'JO-AQ'), [[1918, 'hejaz-kingdom'], [1925, 'transjordan'], [1946, 'jordan']]);
  // 이라크: 1918년 11월 모술 점령까지 영국 점령(모술 주 포함, 1925 연맹 결정), 1921-08-23 파이살 1세 즉위, 1958-07-14 공화국
  own(whole(...idsOf('IRQ')), [[1918, 'british-mesopotamia'], [1921, 'iraq-kingdom'], [1958, 'iraq']]);
  // 쿠웨이트: 지금 국경 한 버전(1922 우카이르 의정서 전 모습과의 차이·사우디 중립 지대 약 5,770 km²는 1만 km² 미만)
  own(whole(...idsOf('KWT')), [[1918, 'kuwait']]);

  // ── 아라비아 반도·이란 (A1a-2, 2026-10-29) ──
  // 사우디 쪽: 네지드(사우드 가) → 1926 히자즈·네지드 왕국(1932 사우디아라비아로 이름만 바뀜, 같은 항목 saudi-arabia). 사막 내륙은 지금 국경대로 그 조각의 나라 땅(주변 구역)
  const SA = 'saudi-arabia';
  // 히자즈(메카·메디나·타부크·바하): 1925년 12월 제다·메디나 항복으로 히자즈 왕국 소멸, 그해 말은 네지드 땅, 1926년 1월 이븐 사우드가 히자즈 왕
  // (1924년 10월 메카·타이프 함락부터 1년 동안 메카 주가 네지드 쪽이던 것은 기준(5만 km² 3년) 안이라 1925년 하나로 둠)
  const SA_12 = split('SA-12', ['SA-12'], [['히자즈북부', HEJAZ_N]], '자우프');
  own([...whole('SA-02', 'SA-03', 'SA-07', 'SA-11'), SA_12.히자즈북부], [[1918, 'hejaz-kingdom'], [1925, 'nejd'], [1926, SA]]);
  // 네지드 본토(리야드·카심·하사(1913 점령)·룹알할리)
  const SA_10 = split('SA-10', ['SA-10'], [['나지란', NAJRAN]], '룹알할리');
  own([...whole('SA-01', 'SA-04', 'SA-05'), SA_10.룹알할리], [[1918, 'nejd'], [1926, SA]]);
  // 하일: 자발 샴마르(라시드 가), 1921년 11월 2일 항복
  own(whole('SA-06'), [[1918, 'jabal-shammar'], [1921, 'nejd'], [1926, SA]]);
  // 북부 국경·자우프: 1921년까지 루왈라 부족(누리 샤을란)과 유목 부족 땅이라 비움, 1922년 자우프 점령·우카이르 의정서(12월 2일)부터 네지드
  own([...whole('SA-08'), SA_12.자우프], [[1918, null], [1922, 'nejd'], [1926, SA]]);
  // 아시르 고원: 1918~1919년 오스만 수비대 철수 뒤 아이드 가 땅이라 비움, 1920년 사우디가 아브하를 차지(1923년까지 나머지 아시르)
  own(whole('SA-14'), [[1918, null], [1920, 'nejd'], [1926, SA]]);
  // 지잔: 이드리스 가 아시르 에미르국(1930년 11월 20일부터 히자즈·네지드의 보호국: 관계), 1934 타이프 조약으로 사우디 병합
  own(whole('SA-09'), [[1918, 'idrisid-emirate'], [1934, SA]]);
  // 나지란 오아시스: 1933년까지 귀속이 정해지지 않은 얌 부족 땅이라 비움, 1934년 4월 사우디가 차지하고 6월 타이프 조약
  own([SA_10.나지란], [[1918, null], [1934, SA]]);

  // 예멘: 북쪽은 무타와킬 왕국(1918-10-30 독립) → 1962-09-26 혁명으로 예멘 아랍 공화국, 남쪽은 아덴 보호령 → 1967-11-30 남예멘, 1990-05-22 통일
  // 지금 주 경계로 옛 남북 경계를 대신한다(다르는 땅은 달리 주 등 1만 km² 미만). 달리(YE-DA)는 보호령의 달리 아미르국 쪽에 둔다
  const YAR = [[1962, 'yemen-arab-republic'], [1990, 'yemen']];
  const YE_HJ = split('YE-HJ', ['YE-HJ'], [['티하마', HAJJAH_TIHAMA]], '산지');
  own([YE_HJ.티하마], [[1918, 'idrisid-emirate'], [1925, 'yemen-kingdom'], ...YAR]); // 1924~1925년 전쟁으로 미디 등 해안을 무타와킬 왕국이 차지
  own([YE_HJ.산지, ...whole('YE-AM', 'YE-BA', 'YE-DH', 'YE-IB', 'YE-JA', 'YE-MA', 'YE-MW', 'YE-RA', 'YE-SA', 'YE-SD', 'YE-SN', 'YE-TA')], [[1918, 'yemen-kingdom'], ...YAR]);
  // 호데이다(티하마): 1918년 12월~1921년 영국군이 항구를 점령하고 내륙은 부족 땅이라 비움, 1921년 영국이 이드리스 가에 넘김, 1925년 무타와킬 왕국이 차지
  own(whole('YE-HU'), [[1918, null], [1921, 'idrisid-emirate'], [1925, 'yemen-kingdom'], ...YAR]);
  // 아덴 보호령(서·동 한 항목, 마흐라 술탄국의 소코트라(YE-HD 둘째 폴리곤) 포함). 아덴 식민지(약 194 km²)는 따로 그리지 않음
  own(whole('YE-AB', 'YE-AD', 'YE-DA', 'YE-HD', 'YE-LA', 'YE-MR', 'YE-SH'), [[1918, 'aden-protectorate'], [1967, 'south-yemen'], [1990, 'yemen']]);

  // 오만: 무스카트 오만 술탄국(1970년 8월 오만 술탄국으로 이름만 바뀜, 같은 항목). 1920-09-25 시브 조약부터 내륙(다힐리야·자히라·북샤르키야)은 오만 이맘국,
  // 1959년 1월 자발 아크다르 평정으로 술탄 땅(1955~1959 전쟁 중 지배 변화는 그리지 않음: 운영자 결정 3). 1918~1919년 이맘 봉기 중의 내륙도 그리지 않고 술탄 땅
  const AE_SH = split('AE-SH', ['AE-SH'], [['나흐와', NAHWA]], '샤르자');
  own([...whole(...minus(idsOf('OMN'), 'OM-DA', 'OM-ZA', 'OM-SS')), AE_SH.나흐와], [[1918, 'oman']]);
  own(whole('OM-DA', 'OM-ZA', 'OM-SS'), [[1918, 'oman'], [1920, 'oman-imamate'], [1959, 'oman']]);
  // 걸프: 트루셜 국가들 → 1971-12-02 아랍에미리트, 카타르·바레인은 보호국에서 1971년 독립(같은 항목). 모두 지금 국경 한 모양
  own([...whole(...minus(idsOf('ARE'), 'AE-SH')), AE_SH.샤르자], [[1918, 'trucial-states'], [1971, 'united-arab-emirates']]);
  own(whole(...idsOf('QAT')), [[1918, 'qatar']]);
  own(whole(...idsOf('BHR')), [[1918, 'bahrain']]);
  // 이란: 카자르 왕조(1925-10-31 의회가 폐위) → 팔라비 왕조(1925-12-15 레자 샤 즉위) → 1979년 이슬람 공화국. 지금 국경 한 모양(1941~1946 영국·소련 점령, 길란·아제르바이잔·마하바드 정부는 그리지 않음)
  const IRAN = [[1918, 'qajar-iran'], [1925, 'pahlavi-iran'], [1979, 'iran']];
  const IR_NE = split('IR-NE', ['IR-27', 'IR-30', 'IR-31'], [['소련겹침', SOVIET_IRN]], '이란');
  own([...whole(...minus(idsOf('IRN'), 'IR-27', 'IR-30', 'IR-31')), IR_NE.이란], IRAN);
  own([IR_NE.소련겹침], [[1918, null], [1992, 'iran']]); // 소련 도형이 덮는 해(1918~1991)는 주인 없음(유럽 쪽 선), 1992년부터 이란

  // 아직 그리지 않은 땅: 이집트·마그레브·서사하라는 A1b가 이 줄을 나라로 바꾼다
  own(whole(...idsOf('EGY', 'LBY', 'TUN', 'DZA', 'MAR', 'SAH')), [[1918, null]]);
}

// ── 소유표 → 버전 ─────────────────────────────────
const { segments, nullSegments, TO } = joinTables([T1918]);
const versions = Object.fromEntries(Object.entries(segments).map(([id, segs]) => [id, segs.map(([from, to, list]) => [from, to === TO ? null : to, build(list)])]));

// 빈 땅 검사 구역: 권역 바깥선(이 권역 조각 전체)에서 그해 주인 없는 단위를 뺀 곳. 주인 없는 단위가 같은 기간마다 구역 하나, 마지막 구역은 끝이 없다
const gapZones = nullSegments.map(([from, to, list]) => {
  const open = to === TO;
  return { name: open ? `서아시아 현대 ${from}~` : `서아시아 현대 ${from}~${to - 1}`, zone: list.length ? D(ME.domain, build(list)) : ME.domain, from, to: open ? null : to };
});

// 일부러 비운 땅(생성기의 구멍 메우기가 이웃으로 채우지 않게)
const voids = [
  [1920, 1921, build(minus(idsOf('JOR'), 'JO-MN', 'JO-AQ'))], // 1920년 트란스요르단: 마이살룬 전투(7월) 뒤 아브둘라 정부(1921년 4월) 전까지 지방 정부들만 선 무주 상태
  [1948, 1949, build(['PS-GZZ', 'PS-WBK'])], // 1948년 서안·가자: 1949년 휴전 협정 전 전쟁 중의 지배(운영자 결정 3)
  [1918, 1920, build(['SA-14'])], // 1918~1919년 아시르 고원: 오스만 수비대 철수 뒤 아이드 가 땅(1920년 사우디의 아브하 점령 전)
  [1918, 1921, build(['YE-HU'])], // 1918~1920년 호데이다: 영국군 항구 점령과 티하마 부족 땅(1921년 이드리스 가에 넘김 전)
  [1918, 1922, build(['SA-08', 'SA-12/자우프'])], // 1918~1921년 북부 국경·자우프: 루왈라 부족과 유목 부족 땅(1922년 네지드 전)
  [1918, 1934, build(['SA-10/나지란'])], // 1918~1933년 나지란 오아시스: 귀속이 정해지지 않은 얌 부족 땅(1934년 사우디 전)
];

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
};
