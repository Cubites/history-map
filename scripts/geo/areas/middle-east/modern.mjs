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
// ── 서아시아·북아프리카 A1a-1 (2026-10-29): 레반트·이라크·쿠웨이트 1918~현재, A1a-2 (같은 날): 아라비아 반도·이란 1918~현재,
//    A1b (같은 날): 이집트·리비아·튀니지·알제리·모로코·서사하라 1918~현재(사하라 내륙은 '주변', zones.yaml sahara-interior) ──────────────
// 등급 '일반'(00-scope 3절: 땅 1만 km², 선 평균 10 / 최대 25 km), 아라비아 내륙은 '주변'(zones.yaml arabia-interior: 땅 5만 km², 선 25 / 50 km). 운영자 결정은 scratchpad a1/decisions.md(질문 창구 ①②), 사료는 a1/research/notes-a.md(A1b는 notes-b.md).
// 짜임: 조각 소유표 하나(T1918, 1918~지금). 표의 꼴은 도우미 모듈 table.mjs(유럽 makeTable과 같은 꼴). 표의 모든 조각을 한 번씩 쓰고,
//   일부러 비운 땅은 주인 null로 둔다(빈 땅 검사 구역에서 그해 빠짐, 생성기의 구멍 메우기를 막으려고 voids에도 적음).
// 식민지·보호국·위임 통치령은 본국을 넓히지 않고 따로 항목(관계 vassal_of), 주권이 남은 군사 점령은 옛 나라 색 계열의 지역 항목(occupied_by): 운영자 결정 2.
// 내전·전쟁 중의 실효 지배는 그리지 않는다(운영자 결정 3). 하타이(TR-31)는 유럽 조각이라 이 파일이 칠하지 않는다(유럽이 1918~1938 비워 둠).
// 이음매: 튀르키예–시리아·튀르키예–이라크 선은 조각 준비(prep:fragments의 under: 'europe')에서 유럽 조각 바깥선 그대로라 이 파일은 손대지 않는다.
// 근거: 위키백과 en(Occupied Enemy Territory Administration, French Mandate for Syria and the Lebanon, Greater Lebanon, Mandatory Palestine, Emirate of Transjordan,
//   1949 Armistice Agreements, Golan Heights, Mandatory Iraq, Mosul Question, United Arab Republic, Syrian Republic (1930–1963), Kuwait), A1a-2: Kingdom of Hejaz, Emirate of Jabal Shammar, Idrisid Emirate of Asir, Asir Province, Saudi–Yemeni War (1934), Mutawakkilite Kingdom of Yemen,
//   Aden Protectorate, Sultanate of Muscat and Oman, Imamate of Oman, Trucial States, Pahlavi Iran, Qajar Iran, A1b: Sultanate of Egypt, Kingdom of Egypt, Egypt–Israel peace treaty, Sinai Peninsula, Italian Libya, Italian Tripolitania,
//   Second Italo-Senussi War, French protectorate of Tunisia, French Algeria, French protectorate in Morocco, Spanish protectorate in Morocco, Tarfaya Strip, Spanish Sahara, Moroccan Wall. 수도 정답표: data/tests/places/middle-east.yaml
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

// ── A1b 칼선 (이집트·마그레브·서사하라) ──
// 시나이 중간선(운영자 결정 4): 1979 이집트–이스라엘 평화 조약의 단계 철수로 1980년 1월 이스라엘이 엘아리시(동경 33.80°·북위 31.13°)~라스무함마드(34.25°·27.73°) 선 서쪽을 돌려주고,
// 그 동쪽(약 2만 km²)은 1982년 4월까지 점령했다. 두 점을 잇는 곧은 선을 바다 쪽으로 같은 방향으로 늘였다(어림 선). 이 선으로는 북시나이 EG-SIN·남시나이 EG-JS만 나눈다.
const SINAI_E = [[[33.75, 31.6], [33.8, 31.13], [34.25, 27.73], [34.28, 27.4], [35.5, 27.4], [35.5, 31.6], [33.75, 31.6]]];
// 수에즈 운하 동쪽 기슭: 포트사이드 EG-PTS·이스마일리아 EG-IS·수에즈 EG-SUZ 주가 운하 동쪽 땅(약 4,700 km²)을 품고 있어, 1967~1979년 이스라엘 점령(운하까지)에 넣으려고
// 운하(포트사이드~칸타라~팀사호~그레이트비터호~수에즈)와 수에즈만 가운데를 잇는 어림 선으로 나눈다. 이 선으로는 이 세 조각만 나눈다.
const SUEZ_E = [[[32.3, 31.7], [32.3, 31.27], [32.32, 30.85], [32.3, 30.6], [32.33, 30.45], [32.36, 30.4], [32.45, 30.25], [32.5, 30.12], [32.55, 30.0], [32.57, 29.92],
  [32.55, 29.6], [32.62, 29.3], [32.8, 29.0], [32.95, 28.8], [33.2, 28.8], [33.2, 31.7], [32.3, 31.7]]];
// 홍해 주 EG-BA의 둘째 폴리곤(약 740 km²)은 수에즈만 건너 시나이 서쪽 기슭(아부루데이스~엘투르 둘레)이다. 칼선 대신 그 폴리곤을 골라 시나이 쪽에 넣는다
const BA_SINAI = ME.F('EG-BA').filter((poly) => poly[0].every(([x, y]) => x > 32.7 && x < 33.9 && y > 27.7));
if (BA_SINAI.length !== 1) throw new Error(`middle-east modern: 홍해 주의 시나이 쪽 폴리곤을 하나로 고르지 못함 (${BA_SINAI.length}개)`);
// 스페인 보호령 북부 구역(1912 프랑스–스페인 조약): 남쪽 경계를 대서양(라라슈·크사르엘케비르는 스페인, 물레이부셀함은 프랑스)에서 와잔 북쪽, 케타마·타르기스트(스페인)와
// 타우나트·아크눌(프랑스) 사이 산지를 지나 물루야강 하류까지, 물루야강을 따라 하구까지 잇는 어림 선(수 km 오차). 탕헤르 국제 지대(382 km²)는 이 구역에 묶는다.
// 이 선으로는 탕헤르-테투안 MA-01·타자-알호세이마-타우나트 MA-03·동부 MA-04만 나눈다. 세우타·멜리야는 유럽 조각(스페인)이라 이 파일이 칠하지 않는다.
const SPANISH_ZONE = [[[-6.6, 34.98], [-6.25, 34.98], [-5.95, 34.93], [-5.55, 34.92], [-5.3, 34.9], [-5.05, 34.88], [-4.75, 34.88], [-4.45, 34.87], [-4.1, 34.8],
  [-3.8, 34.78], [-3.4, 34.72], [-3.05, 34.65], [-2.8, 34.75], [-2.6, 34.95], [-2.4, 35.05], [-2.33, 35.13], [-2.2, 35.3], [-2.2, 36.2], [-6.6, 36.2], [-6.6, 34.98]]];
// 서사하라 북쪽 경계 북위 27°40′(1904·1912 프랑스–스페인 조약): 그 남쪽은 서사하라(스페인령 사하라 → 귀속 논쟁 지역). 굴밈-에스세마라 MA-14·라윤 MA-15가 이 선을 넘어 걸친다.
const WS_SOUTH = box(-18.0, 20.0, -8.0, 27.667);
// 타르파야 띠(케이프 주비, 스페인 보호령 남부 구역): 북위 27°40′와 드라강 사이, 서경 8°40′(파리 기준 서경 11°) 서쪽. 드라강은 하구~서경 8°40′을 잇는 어림 선(주변 구역 선 기준 안).
// 1958년 4월 모로코에 돌아갔다. 이 선으로는 MA-14·MA-15만 나눈다(MA-14의 서사하라 쪽은 WS_SOUTH가 먼저 가져감).
const TARFAYA = [[[-13.6, 27.667], [-8.667, 27.667], [-8.667, 28.85], [-9.0, 28.62], [-10.0, 28.5], [-10.8, 28.55], [-11.13, 28.69], [-11.5, 29.0], [-13.6, 29.0], [-13.6, 27.667]]];

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

  // ── 이집트·리비아·마그레브·서사하라 (A1b, 2026-10-29) ──
  // 이집트: 영국 보호국 이집트 술탄국(1914-12-19) → 1922-02-28 영국의 일방 독립 선언·3월 15일 왕국(1953-06-18 공화국, 같은 항목 egypt) → 1958-02-01 아랍 연합 공화국
  // (1961년 시리아가 떨어져 나간 뒤에도 이집트가 1971-09-02까지 이 이름을 씀) → 이집트 아랍 공화국. 할라이브(EG-BA 안, 북위 22도 북쪽)는 Natural Earth대로 이집트 땅
  const EGYPT = [[1918, 'british-egypt'], [1922, 'egypt'], [1958, 'united-arab-republic']];
  const ARE = 'arab-republic-of-egypt';
  const SIO = 'sinai-israeli-occupation';
  const CANAL = split('운하', ['EG-PTS', 'EG-IS', 'EG-SUZ'], [['동쪽', SUEZ_E]], '서쪽');
  const EG_BA = split('EG-BA', ['EG-BA'], [['시나이서안', BA_SINAI]], '홍해');
  own([...whole(...minus(idsOf('EGY'), 'EG-SIN', 'EG-JS', 'EG-PTS', 'EG-IS', 'EG-SUZ', 'EG-BA')), CANAL.서쪽, EG_BA.홍해], [...EGYPT, [1971, ARE]]);
  // 시나이(운영자 결정 4): 1967년 6일 전쟁부터 이스라엘 점령(운하 동쪽 기슭까지, 이집트 땅 그대로 점령 지역 항목), 1980년 1월 중간선 서쪽 반환, 1982년 4월 25일 나머지 반환.
  // 1956~1957년 점령과 1973년 전쟁 뒤 1974·1975년 협정의 후퇴(운하 동쪽 띠 반환 등)는 그리지 않는다
  const SIN = split('SIN', ['EG-SIN', 'EG-JS'], [['동부', SINAI_E]], '서부');
  own([SIN.서부, CANAL.동쪽, EG_BA.시나이서안], [...EGYPT, [1967, SIO], [1980, ARE]]);
  own([SIN.동부], [...EGYPT, [1967, SIO], [1982, ARE]]);

  // 리비아(운영자 결정 6): 1918~1921년은 이탈리아가 해안 거점만 지배해 비움(트리폴리타니아 공화국·사누시 아미르국은 그리지 않음).
  // 이탈리아령 리비아는 실효 지배 4단계, 행정구 단위: 1922 미수라타 점령·나푸사 산지, 1928 시르테·가다메스(1924)·주프라·키레나이카(29번째 평행선 작전), 1930 페잔, 1931 쿠프라.
  // 1943년 연합군 점령 뒤 1951년까지 군정(이탈리아 주권은 1947 평화 조약까지): 영국(트리폴리타니아·키레나이카)과 프랑스(페잔·가다메스) 두 점령 지역 항목. 1951-12-24 독립
  const IL = 'italian-libya';
  const LBA = 'libya-british-admin';
  const LFZ = 'libya-french-fezzan';
  const LY_1928 = ['LY-SR', 'LY-JU', 'LY-AJ', 'LY-BA', 'LY-MJ', 'LY-JA', 'LY-QB', 'LY-BU']; // 시르테·주프라·아즈다비야·키레나이카 해안(벵가지·마르즈·제벨아흐다르·쿠바·부트난)
  const LY_FEZZAN = ['LY-SB', 'LY-WD', 'LY-MQ', 'LY-GT', 'LY-WS']; // 세브하·와디알하야·무르주크·가트·샤티
  own(whole('LY-JI', 'LY-TN', 'LY-ZA', 'LY-NQ', 'LY-MB', 'LY-MI', 'LY-MZ'), [[1918, null], [1922, IL], [1943, LBA], [1951, 'libya']]);
  own(whole(...LY_1928), [[1918, null], [1928, IL], [1943, LBA], [1951, 'libya']]);
  own(whole('LY-GD'), [[1918, null], [1928, IL], [1943, LFZ], [1951, 'libya']]);
  own(whole(...LY_FEZZAN), [[1918, null], [1930, IL], [1943, LFZ], [1951, 'libya']]);
  own(whole('LY-KF'), [[1918, null], [1931, IL], [1943, LBA], [1951, 'libya']]);

  // 튀니지: 프랑스 보호령(1881 바르도 조약) → 1956-03-20 독립(1957 공화국, 같은 항목). 지금 국경 한 모양
  own(whole(...idsOf('TUN')), [[1918, 'french-tunisia'], [1956, 'tunisia']]);
  // 알제리: 프랑스령 알제리(남부 영토·1957 사하라 도 포함 한 항목, 틴두프·베샤르 포함) → 1962-07-05 독립. 지금 국경 한 모양
  own(whole(...idsOf('DZA')), [[1918, 'french-algeria'], [1962, 'algeria']]);
  // 모로코: 프랑스 보호령(1912 페스 조약 범위 전체, 실효 평정은 1934년이나 조약 범위로 그림: 운영자 결정 7)과 스페인 보호령 북부 구역(1912-11-27) → 1956년 독립.
  // 이프니(약 1,500 km², 1934~1969 스페인)는 따로 그리지 않고 프랑스 보호령·모로코 쪽에 둔다. 타르파야 띠는 1955년까지 비우고 1956년 모로코에 넣는다(1958년 반환, 운영자 결정 5)
  const MA_N = split('MA-N', ['MA-01', 'MA-03', 'MA-04'], [['스페인', SPANISH_ZONE]], '프랑스');
  const MA_S = split('MA-S', ['MA-14', 'MA-15'], [['서사하라', WS_SOUTH], ['타르파야', TARFAYA]], '모로코');
  own([...whole(...minus(idsOf('MAR'), 'MA-01', 'MA-03', 'MA-04', 'MA-14', 'MA-15', 'MA-16')), MA_N.프랑스, MA_S.모로코], [[1918, 'french-morocco'], [1956, 'morocco']]);
  own([MA_N.스페인], [[1918, 'spanish-morocco'], [1956, 'morocco']]);
  own([MA_S.타르파야], [[1918, null], [1956, 'morocco']]); // 1916년 스페인이 케이프 주비를 차지했으나 해안 거점뿐이라 비움
  // 서사하라(운영자 결정 5): 1933년까지 스페인은 해안 거점(빌라시스네로스·케이프 보하도르)만 지배해 비움, 1934년 5월 다오라·스마라 점령부터 스페인령 사하라 한 모양.
  // 1975-11-14 마드리드 협정과 1976년 2월 스페인 철수 뒤 전체가 귀속 논쟁 지역(모로코·사하라 아랍 민주 공화국, 1979년 8월까지 모리타니: 관계),
  // 1987년 4월 모로코 장벽(모래 둑) 완성부터 장벽 동쪽(Natural Earth SAH 조각)을 따로 지역 항목. 1976~1979년 모로코·모리타니 몫은 나누지 않는다
  own([...whole('MA-16'), MA_S.서사하라], [[1918, null], [1934, 'spanish-sahara'], [1976, 'western-sahara-disputed']]);
  own(whole('SAH'), [[1918, null], [1934, 'spanish-sahara'], [1976, 'western-sahara-disputed'], [1987, 'western-sahara-free-zone']]);
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
  [1918, 1922, build(idsOf('LBY'))], // 1918~1921년 리비아: 이탈리아는 트리폴리·호무스 등 해안 거점만 지배(운영자 결정 6, 1922년 재정복 전)
  [1922, 1928, build(minus(idsOf('LBY'), 'LY-JI', 'LY-TN', 'LY-ZA', 'LY-NQ', 'LY-MB', 'LY-MI', 'LY-MZ'))], // 1922~1927년 리비아 내륙·키레나이카: 이탈리아가 아직 다스리지 않은 땅
  [1928, 1930, build(['LY-GT', 'LY-KF', 'LY-MQ', 'LY-SB', 'LY-WD', 'LY-WS'])], // 1928~1929년 페잔·쿠프라: 1930년 페잔 정복 전
  [1930, 1931, build(['LY-KF'])], // 1930년 쿠프라: 1931년 1월 점령 전
  [1918, 1934, build(['MA-16', 'MA-S/서사하라', 'SAH'])], // 1918~1933년 서사하라: 스페인은 해안 거점만 지배(1934년 다오라·스마라 점령 전, 운영자 결정 5)
  [1918, 1956, build(['MA-S/타르파야'])], // 1918~1955년 타르파야 띠: 스페인 보호령 남부 구역(해안 거점, 1958년 모로코 반환을 1956년 모로코 모양에 미리 넣음)
];

export const era = {
  name: 'modern',
  versions,
  gapZones,
  voids,
};
