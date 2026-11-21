// 나라별 권역 단위 목록 — scripts/region-units.ts가 만든 파일이다. 손으로 고치지 않는다(npm run gen:region-units).
// 단위 목록이 나라 파일의 기본 단위 하나(regions.ts REGION_FILTER_OF)와 다른 나라만 있다: 여러 권역에 걸치는 나라, 아메리카 파일의 북아메리카 나라.
// 첫 단위가 그 나라의 기본 단위다. 기준(넓이·비율·햇수)과 땅의 권역 나눔은 scripts/region-units.ts 첫머리.
// build:data만 이 파일을 읽어 entities.json·events.json의 `units`에 넣는다(앱 묶음에는 들어가지 않는다).
// EVENT_UNITS는 관련 나라에 아메리카 나라가 없는 아메리카 사건의 단위다(scripts/region-units.ts에 손으로 적은 표 그대로).
import type { RegionFilterUnit } from './regions.ts';

export const ENTITY_UNITS: Record<string, RegionFilterUnit[]> = {
  'abbasid-caliphate': ['middle-east', 'south-asia', 'central-asia'], // 아바스 칼리프국 — south-asia 104년·최대 358천km², central-asia 142년·최대 581천km²
  abkhazia: ['europe', 'middle-east'], // 압하지야 (분리 지역) — middle-east 33년·최대 10천km²
  'abkhazia-kingdom': ['europe', 'middle-east'], // 아브하지아 왕국 — middle-east 230년·최대 58천km²
  acadia: ['north-america'], // 아카디아
  'achaemenid-empire': ['europe', 'middle-east', 'south-asia', 'central-asia'], // 아케메네스 제국 — middle-east 219년·최대 4060천km², south-asia 183년·최대 443천km², central-asia 210년·최대 792천km²
  'adena-culture': ['north-america'], // 아데나 문화 — 영토 없음, 손으로 정함
  'alchon-huns': ['south-asia', 'central-asia'], // 알촌 훈족 — central-asia 69년·최대 63천km²
  almohads: ['europe', 'middle-east'], // 알모하드 칼리프국 — middle-east 122년·최대 743천km²
  almoravids: ['europe', 'middle-east'], // 알모라비드 왕조 — middle-east 91년·최대 431천km²
  'anatolian-beyliks': ['europe', 'middle-east'], // 아나톨리아 베이국들 (묶음) — middle-east 148년·최대 192천km²
  'ancestral-puebloan-culture': ['north-america'], // 조상 푸에블로인 — 영토 없음, 손으로 정함
  'antigonid-asia': ['europe', 'middle-east'], // 안티고노스 1세의 왕국 — middle-east 19년·최대 1965천km²
  antioch: ['europe', 'middle-east'], // 안티오크 공국 — middle-east 34년·최대 15천km²
  armenia: ['europe', 'middle-east'], // 아르메니아 — middle-east 34년·최대 31천km²
  'armenian-kingdoms': ['europe', 'middle-east'], // 아르메니아 왕국들 (묶음) — middle-east 233년·최대 73천km²
  'arsacid-armenia': ['europe', 'middle-east'], // 아르메니아 왕국 — middle-east 709년·최대 392천km²
  azerbaijan: ['europe', 'middle-east'], // 아제르바이잔 — middle-east 34년·최대 86천km²
  'bithynia-kingdom': ['europe', 'middle-east'], // 비티니아 왕국 — middle-east 260년·최대 39천km²
  'british-columbia': ['north-america'], // 브리티시컬럼비아 식민지
  'british-florida': ['north-america'], // 영국령 플로리다
  'british-raj': ['south-asia', 'southeast-asia'], // 영국령 인도 — southeast-asia 51년·최대 505천km²
  'byzantine-empire': ['europe', 'middle-east'], // 동로마 제국 — middle-east 868년·최대 2342천km²
  canada: ['north-america'], // 캐나다
  'candar-beylik': ['europe', 'middle-east'], // 잔다르 베이국 (이스펜디야르) — middle-east 142년·최대 46천km²
  'cappadocia-kingdom': ['europe', 'middle-east'], // 카파도키아 왕국 — middle-east 347년·최대 122천km²
  carthage: ['europe', 'middle-east'], // 카르타고 — middle-east 654년·최대 78천km²
  'caucasian-albania': ['europe', 'middle-east'], // 캅카스 알바니아 — middle-east 525년·최대 81천km²
  'cilicia-kingdom': ['europe', 'middle-east'], // 킬리키아 왕국 (시엔네시스 왕조) — middle-east 185년·최대 39천km²
  'cilicia-principality': ['europe', 'middle-east'], // 킬리키아 아르메니아 공국 — middle-east 36년·최대 33천km²
  'cilician-armenia': ['europe', 'middle-east'], // 킬리키아 아르메니아 왕국 — middle-east 161년·최대 33천km²
  colchis: ['europe', 'middle-east'], // 콜키스 — middle-east 518년·최대 45천km²
  commagene: ['europe', 'middle-east'], // 콤마게네 왕국 — middle-east 213년·최대 30천km²
  'connecticut-colony': ['north-america'], // 코네티컷 식민지
  danishmendids: ['europe', 'middle-east'], // 다니슈멘드 베이국 — middle-east 107년·최대 131천km²
  'dorset-culture': ['north-america'], // 도싯 문화 — 영토 없음, 손으로 정함
  'durrani-empire': ['south-asia', 'central-asia'], // 두라니 제국 — central-asia 76년·최대 583천km²
  'eastern-anatolian-beyliks': ['europe', 'middle-east'], // 동아나톨리아 베이국들 (묶음) — middle-east 157년·최대 46천km²
  'edessa-county': ['europe', 'middle-east'], // 에데사 백국 — middle-east 52년·최대 50천km²
  eretnids: ['europe', 'middle-east'], // 에레트나 왕조·카디 부르하네딘 — middle-east 63년·최대 145천km²
  'french-louisiana': ['north-america'], // 프랑스령 루이지애나
  'galatia-kingdom': ['europe', 'middle-east'], // 갈라티아 — middle-east 253년·최대 147천km²
  georgia: ['europe', 'middle-east'], // 조지아 — middle-east 34년·최대 66천km²
  'georgia-kingdom': ['europe', 'middle-east'], // 조지아 왕국 — middle-east 482년·최대 106천km²
  'ghaznavid-empire': ['middle-east', 'south-asia', 'central-asia'], // 가즈니 왕조 — south-asia 176년·최대 254천km², central-asia 182년·최대 470천km²
  'ghurid-dynasty': ['south-asia', 'central-asia'], // 구르 왕조 — central-asia 40년·최대 200천km²
  'golden-horde': ['europe', 'central-asia'], // 킵차크 칸국 (대오르다) — central-asia 136년·최대 2385천km²
  'greek-city-states': ['europe', 'middle-east'], // 그리스 도시국가 (묶음) — middle-east 603년·최대 53천km²
  greenland: ['north-america'], // 그린란드
  haudenosaunee: ['north-america'], // 이로쿼이 연맹 — 영토 없음, 손으로 정함
  'hindu-shahi': ['south-asia', 'central-asia'], // 힌두 샤히 — central-asia 133년·최대 33천km²
  'hohokam-culture': ['north-america'], // 호호캄 — 영토 없음, 손으로 정함
  'hopewell-culture': ['north-america'], // 호프웰 문화 — 영토 없음, 손으로 정함
  'hotak-dynasty': ['middle-east', 'central-asia'], // 호타키 왕조 — central-asia 29년·최대 132천km²
  'iberia-kingdom': ['europe', 'middle-east'], // 이베리아 왕국 (카르틀리) — middle-east 878년·최대 45천km²
  'iberia-principate': ['europe', 'middle-east'], // 이베리아 공국 (카르틀리) — middle-east 199년·최대 45천km²
  'ile-royale': ['north-america'], // 일루아얄
  imereti: ['europe', 'middle-east'], // 이메레티 왕국과 서조지아 공국들 (묶음) — middle-east 320년·최대 34천km²
  'indian-reserve': ['north-america'], // 인디언 보호지
  'indo-greek-kingdom': ['south-asia', 'central-asia'], // 인도-그리스 왕국 — central-asia 100년·최대 148천km²
  kakheti: ['europe', 'middle-east'], // 카헤티 왕국 — middle-east 261년·최대 10천km²
  'kakheti-hereti': ['europe', 'middle-east'], // 카헤티-헤레티 왕국 — middle-east 318년·최대 10천km²
  'karaman-beylik': ['europe', 'middle-east'], // 카라만 베이국 — middle-east 162년·최대 102천km²
  kartli: ['europe', 'middle-east'], // 카르틀리 왕국 — middle-east 252년·최대 18천km²
  'kartli-kakheti': ['europe', 'middle-east'], // 카르틀리-카헤티 왕국 — middle-east 39년·최대 35천km²
  'khotan-kingdom': ['central-asia', 'east-asia'], // 호탄 왕국 — east-asia 155년·최대 52천km²
  'khwarazmian-empire': ['middle-east', 'central-asia'], // 호라즘 제국 — central-asia 144년·최대 874천km²
  'kidarite-kingdom': ['south-asia', 'central-asia'], // 키다라 왕국 — central-asia 110년·최대 251천km²
  'kushan-empire': ['south-asia', 'central-asia'], // 쿠샨 제국 — central-asia 210년·최대 251천km²
  'kushano-sasanian-kingdom': ['south-asia', 'central-asia'], // 쿠샨샤르 왕국 — central-asia 120년·최대 251천km²
  'latin-empire': ['europe', 'middle-east'], // 라틴 제국 — middle-east 21년·최대 12천km²
  lazica: ['europe', 'middle-east'], // 라지카 왕국 (에그리시) — middle-east 661년·최대 34천km²
  'lesser-armenia': ['europe', 'middle-east'], // 소아르메니아 — middle-east 219년·최대 15천km²
  'lower-canada': ['north-america'], // 로어캐나다
  lydia: ['europe', 'middle-east'], // 리디아 — middle-east 133년·최대 233천km²
  'lysimachus-kingdom': ['europe', 'middle-east'], // 리시마코스 왕국 — middle-east 20년·최대 278천km²
  'macedonia-kingdom': ['europe', 'middle-east', 'central-asia'], // 마케도니아 왕국 — middle-east 17년·최대 3777천km², central-asia 13년·최대 360천km²
  'maryland-colony': ['north-america'], // 메릴랜드 식민지
  'massachusetts-bay': ['north-america'], // 매사추세츠만 식민지
  mauritania: ['middle-east', 'sub-saharan-africa'], // 모리타니 — sub-saharan-africa 66년·최대 1039천km²
  mexico: ['latin-america', 'north-america'], // 멕시코 — north-america 27년·최대 2473천km²
  'mississippian-culture': ['north-america'], // 미시시피 문화 — 영토 없음, 손으로 정함
  'mongol-empire': ['east-asia', 'middle-east', 'central-asia'], // 몽골 제국 — middle-east 39년·최대 1283천km², central-asia 42년·최대 4281천km²
  'mrauk-u': ['southeast-asia', 'south-asia'], // 므라우우 왕국 — south-asia 207년·최대 18천km²
  'mughal-empire': ['south-asia', 'central-asia'], // 무굴 제국 — central-asia 32년·최대 223천km²
  'nagorno-karabakh': ['europe', 'middle-east'], // 나고르노카라바흐 (분리 지역) — middle-east 26년·최대 11천km²
  nanyue: ['southeast-asia', 'east-asia'], // 남월 — east-asia 93년·최대 421천km²
  'new-brunswick': ['north-america'], // 뉴브런즈윅
  'new-france-canada': ['north-america'], // 누벨프랑스 캐나다
  'new-hampshire': ['north-america'], // 뉴햄프셔 식민지
  'new-netherland': ['north-america'], // 뉴네덜란드
  'new-spain-viceroyalty': ['latin-america', 'north-america'], // 누에바에스파냐 부왕령 — north-america 223년·최대 2473천km²
  newfoundland: ['north-america'], // 뉴펀들랜드
  nicaea: ['europe', 'middle-east'], // 니케아 제국 — middle-east 57년·최대 113천km²
  'norse-greenland': ['north-america'], // 노르드인 그린란드 정착 — 영토 없음, 손으로 정함
  'north-carolina': ['north-america'], // 노스캐롤라이나 식민지
  'north-western-territory': ['north-america'], // 북서부 영토
  'nova-scotia': ['north-america'], // 노바스코샤
  osroene: ['europe', 'middle-east'], // 오스로에네 왕국 — middle-east 345년·최대 18천km²
  ottoman: ['europe', 'middle-east'], // 오스만 제국 — middle-east 624년·최대 3834천km²
  'paphlagonia-kingdom': ['europe', 'middle-east'], // 파플라고니아 왕국 — middle-east 262년·최대 26천km²
  'parthian-empire': ['middle-east', 'central-asia'], // 파르티아 제국 — central-asia 14년·최대 147천km²
  'pergamon-kingdom': ['europe', 'middle-east'], // 페르가몬 왕국 (아탈로스 왕조) — middle-east 85년·최대 191천km²
  phrygia: ['europe', 'middle-east'], // 프리기아 — middle-east 105년·최대 72천km²
  'polemonid-pontus': ['europe', 'middle-east'], // 폰토스 왕국 (폴레몬 왕조) — middle-east 100년·최대 110천km²
  'pontus-kingdom': ['europe', 'middle-east'], // 폰토스 왕국 (미트리다테스 왕조) — middle-east 218년·최대 166천km²
  'poverty-point-culture': ['north-america'], // 포버티 포인트 문화 — 영토 없음, 손으로 정함
  prc: ['east-asia', 'central-asia'], // 중화인민공화국 — central-asia 77년·최대 1539천km²
  'province-of-canada': ['north-america'], // 캐나다주
  'province-of-carolina': ['north-america'], // 캐롤라이나 식민지
  'province-of-georgia': ['north-america'], // 조지아 식민지
  'province-of-new-jersey': ['north-america'], // 뉴저지 식민지
  'province-of-new-york': ['north-america'], // 뉴욕 식민지
  'province-of-pennsylvania': ['north-america'], // 펜실베이니아 식민지
  'province-of-quebec': ['north-america'], // 퀘벡 주
  'ptolemaic-kingdom': ['europe', 'middle-east'], // 프톨레마이오스 왕국 — middle-east 293년·최대 1226천km²
  qing: ['east-asia', 'central-asia'], // 청 — central-asia 141년·최대 1691천km²
  rhodes: ['europe', 'middle-east'], // 로도스 — middle-east 21년·최대 22천km²
  roc: ['east-asia', 'central-asia'], // 중화민국 — central-asia 37년·최대 1533천km²
  'roman-empire': ['europe', 'middle-east'], // 로마 제국 — middle-east 421년·최대 2627천km²
  'roman-republic': ['europe', 'middle-east'], // 로마 공화정 — middle-east 79년·최대 1816천km²
  'rum-sultanate': ['europe', 'middle-east'], // 룸 술탄국 — middle-east 231년·최대 426천km²
  'ruperts-land': ['north-america'], // 루퍼츠랜드
  russia: ['europe', 'central-asia'], // 러시아 제국 — central-asia 96년·최대 3756천km²
  'russian-america': ['north-america'], // 러시아령 아메리카
  'safavid-iran': ['middle-east', 'central-asia'], // 사파비 왕조 — central-asia 107년·최대 339천km²
  'saffarid-dynasty': ['middle-east', 'central-asia'], // 사파르 왕조 — central-asia 119년·최대 384천km²
  'samanid-empire': ['middle-east', 'central-asia'], // 사만 왕조 — central-asia 108년·최대 720천km²
  'seleucid-empire': ['europe', 'middle-east', 'central-asia'], // 셀레우코스 제국 — middle-east 233년·최대 2306천km², central-asia 55년·최대 366천km²
  'seljuk-empire': ['middle-east', 'central-asia'], // 셀주크 제국 — central-asia 117년·최대 313천km²
  'sophene-kingdom': ['europe', 'middle-east'], // 소페네 왕국 — middle-east 94년·최대 52천km²
  'south-carolina': ['north-america'], // 사우스캐롤라이나 식민지
  'south-vietnam': ['east-asia', 'southeast-asia'], // 베트남 공화국 — southeast-asia 21년·최대 180천km²
  'soviet-union': ['europe', 'central-asia'], // 소련 — central-asia 74년·최대 4003천km²
  'spanish-florida': ['north-america'], // 스페인령 플로리다
  'spanish-louisiana': ['north-america'], // 스페인령 루이지애나
  'tahirid-dynasty': ['middle-east', 'central-asia'], // 타히르 왕조 — central-asia 52년·최대 144천km²
  tang: ['east-asia', 'central-asia'], // 당 — central-asia 120년·최대 781천km²
  'tao-klarjeti': ['europe', 'middle-east'], // 타오-클라르제티 (이베리아인의 왕국) — middle-east 187년·최대 41천km²
  'texas-republic': ['north-america'], // 텍사스 공화국
  'thule-culture': ['north-america'], // 툴레인 — 영토 없음, 손으로 정함
  tibet: ['east-asia', 'central-asia'], // 토번 — central-asia 22년·최대 580천km²
  'timurid-empire': ['middle-east', 'central-asia'], // 티무르 왕조 — central-asia 137년·최대 900천km²
  trebizond: ['europe', 'middle-east'], // 트레비존드 제국 — middle-east 257년·최대 46천km²
  'turk-shahi': ['south-asia', 'central-asia'], // 투르크 샤히 — central-asia 157년·최대 94천km²
  turkey: ['europe', 'middle-east'], // 튀르키예 — middle-east 103년·최대 766천km²
  'umayyad-caliphate': ['europe', 'middle-east', 'south-asia', 'central-asia'], // 우마이야 칼리프국 — middle-east 89년·최대 5605천km², south-asia 39년·최대 358천km², central-asia 41년·최대 346천km²
  'upper-canada': ['north-america'], // 어퍼캐나다
  urartu: ['europe', 'middle-east'], // 우라르투 — middle-east 210년·최대 159천km²
  usa: ['north-america'], // 미국
  'vancouver-island': ['north-america'], // 밴쿠버섬 식민지
  'vandal-kingdom': ['europe', 'middle-east'], // 반달 왕국 — middle-east 95년·최대 223천km²
  'virginia-colony': ['north-america'], // 버지니아 식민지
  'west-georgia-kingdom': ['europe', 'middle-east'], // 서조지아 왕국 (이메레티) — middle-east 71년·최대 34천km²
  'western-roman-empire': ['europe', 'middle-east'], // 서로마 제국 — middle-east 44년·최대 423천km²
};

export const EVENT_UNITS: Record<string, RegionFilterUnit[]> = {
  'cabot-1497': ['north-america'],
  'cartier-1534': ['north-america'],
  'roanoke-1584': ['north-america'],
  'mayflower-1620': ['north-america'],
  'bering-1741': ['north-america'],
  'cabral-1500': ['latin-america'],
  'magellan-strait-1519': ['latin-america'],
  'brazil-captaincies-1534': ['latin-america'],
  'buenos-aires-1536': ['latin-america'],
  'iberian-union-1580': ['latin-america'],
  'drake-1577': ['north-america', 'latin-america'],
};
