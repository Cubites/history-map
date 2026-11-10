// 행정구역 조각 지역 표 (RULES-TOOLS 작업 11, 2026-10-21): prep:fragments·check:fragments·near:fragments가 읽는다.
// 지역 이름과 지역마다 다른 값(나라 목록·하위 지역 거르기·범위 상자·README 글)은 프로그램이 아니라 이 표에만 둔다. 새 지역은 여기에 한 항목을 더하고
// npm run prep:fragments -- --region <지역> <원본>으로 data/base/fragments/<지역>.topo.json과 README(아래 readme 이름)를 만든다.
// 이 표의 값이 바뀌면 그 지역 조각 파일이 바뀐다(생성기의 조각 소유표와 함께 고친다). europe 항목은 지금 europe.topo.json·README.md를 바이트까지 그대로 내는 값이다.
//
// 항목 칸:
// - default: true인 지역은 --region 없이 부를 때 쓴다(옛 사용법 `npm run prep:fragments -- <원본>`). 하나만 둔다
// - readme: 이 지역 README 파일 이름(data/base/fragments 안). 다른 지역 README를 덮지 않게 지역마다 다르게 둔다
// - adm0: 통째로 넣는 나라(Natural Earth adm0_a3)
// - include: 나라 일부만 넣을 때 [{ adm0, prop(NE 속성 이름), values(그 속성 값 목록), note(README 한 줄, {values}는 값을 '·'로 이은 것) }]
// - drop: (선택) 조각에도 이웃에도 넣지 않는 나라(adm0_a3). 그 땅은 해안 맞추기에서 옆 조각이 덮는다(옆 행정구역과 국경이 맞지 않아 arc를 공유하지 못하는 아주 작은 단위)
// - under: (선택) 아래층 지역 이름. 그 지역이 고르는 행정구역은 원본 대신 이미 만든 그 지역 조각 파일의 조각을 이웃으로 쓰고(그 arc는 간략화하지 않음), 이 지역 조각에서 그와 겹치는 땅을 뺀다.
//   이음매 선이 아래층 조각 바깥선 그대로가 된다(아래층 파일은 읽기만 하고 바뀌지 않음, 2026-10-29 서아시아)
// - box: 범위 상자 [서, 남, 동, 북]. 상자 밖에 통째로 있는 폴리곤은 빼고, 상자에 걸친 다른 행정구역은 '이웃'으로 함께 가공한다(파일에는 넣지 않음)
// - idExamples: README '조각 id' 절의 보기 { iso: ISO 3166-2 보기, adm1: adm1_code 보기 글(마크다운), adm0: adm0_a3 보기 목록(없으면 []) }
// - notes: README '따로 볼 곳' 줄(마크다운). {adm0:<조각 id>}는 그 조각의 adm0, {count:<adm0>}는 그 나라 조각 수, {param:<매개변수>}는 매개변수 값,
//   {micro}는 내륙 구멍으로 만든 조각 목록(없으면 '없었다')으로 바꾼다
// - countries50m: check:fragments [1] 나라별 대조에 쓰는 adm0 → world-atlas countries-50m 이름(없는 나라는 비교하지 않음)
// - checkIds: check:fragments가 조각 adm0와 countries-50m의 소속을 따로 견줘 보이는 조각 id(실효 지배 기준이 갈리는 곳)
// - params: (선택) 이 지역만 prep-fragments.mjs의 PARAMS 값을 바꾼다 { 이름: 값 }. README 매개변수 표에 바꾼 값이 '이 지역만'으로 보인다(2026-11-08 동남아)
export const FRAGMENT_REGIONS = {
  europe: {
    default: true,
    readme: 'README.md',
    adm0: [
      'ALB', 'AND', 'AUT', 'BEL', 'BGR', 'BIH', 'BLR', 'CHE', 'CYP', 'CYN', 'CZE', 'DEU', 'DNK', 'ESP', 'EST', 'FIN', 'FRA', 'GBR', 'GRC', 'HRV',
      'HUN', 'IRL', 'ISL', 'ITA', 'KOS', 'LIE', 'LTU', 'LUX', 'LVA', 'MCO', 'MDA', 'MKD', 'MLT', 'MNE', 'NLD', 'NOR', 'POL', 'PRT', 'ROU', 'SMR',
      'SRB', 'SVK', 'SVN', 'SWE', 'UKR', 'VAT', 'TUR', 'GEO', 'ARM', 'AZE',
      'ALD', 'FRO', 'IMN', 'JEY', 'GGY', 'GIB', 'ESB', 'WSB', // 올란드·페로·맨섬·저지·건지·지브롤터·데켈리아·아크로티리
    ],
    // 러시아 유럽 쪽: NE region 속성이 Northwestern·Central·Volga(NE의 Volga에는 남부·북캅카스 관구도 들어 있다). 카자흐스탄과 러시아 아시아 쪽은 넣지 않는다(areas/europe.mjs가 손 도형으로 둔다)
    include: [{
      adm0: 'RUS', prop: 'region', values: ['Northwestern', 'Central', 'Volga'],
      note: '러시아(RUS): NE region 속성이 {values}인 연방 주체(NE의 Volga에는 남부·북캅카스 관구도 들어 있음). Urals·Siberian·Far Eastern과 카자흐스탄은 넣지 않는다(권역 바깥선이 된다).',
    }],
    // 프랑스 해외 데파르트망, 네덜란드 카리브 특별 기초자치단체는 상자 밖이라 빠진다. 카나리아·마데이라·아조레스는 상자 안이다
    box: [-32, 27, 70, 82],
    idExamples: { iso: 'FR-67', adm1: '코소보 `KOS-5899`', adm0: ['MCO', 'VAT', 'GIB', 'CYN'] },
    notes: [
      '크림(`UA-43`)·세바스토폴(`UA-40`): NE v5.1.2 기본 파일에서 adm0가 {adm0:UA-43}·{adm0:UA-40}이다(실제 지배 기준). id가 ISO 코드라 id는 소속과 상관없고, 어느 나라 것인지는 생성기의 조각 소유표가 정한다.',
      '코소보: KOS {count:KOS}개 구(id는 NE adm1_code). 세르비아(SRB) {count:SRB}개 조각과 겹치지 않는다.',
      '키프로스: 북키프로스는 조각 하나(`CYN`), 아크로티리(`WSB-5133`)·데켈리아(`ESB-5132`)는 영국 주권 기지 지역 조각이다. 유엔 완충지대는 따로 조각이 없고 키프로스(CYP)의 니코시아·파마구스타 구(`CY-01`·`CY-04`)에 들어 있다.',
      '소국: 안도라 {count:AND}·리히텐슈타인 {count:LIE}·산마리노 {count:SMR}개 행정구역, 모나코(`MCO`)·바티칸(`VAT`)·지브롤터(`GIB`)는 한 조각씩 들어 있다(NE v5.1.2에는 이들의 admin-1이 있음). 원래 넓이가 {param:keepSmallKm2}km² 미만인 조각은 간략화하지 않아 모양이 그대로다. 조각 사이의 내륙 구멍은 {micro}.',
      '바티칸(`VAT`): NE admin-1 원본에서 이미 점 7개, 약 0.012km²짜리 작은 다각형이다(실제 넓이 약 0.44km²의 나머지는 로마 `IT-RM`에 들어 있음). 바티칸 시국을 그릴 때는 이 조각을 그대로 쓰지 말고 따로 긋는다.',
      '러시아: 유럽 쪽 조각 {count:RUS}개. 칼리닌그라드(`RU-KGD`)는 월경지로 한 조각이다.',
    ],
    // 50m에 따로 없는 곳(지브롤터, 아크로티리·데켈리아)은 비교하지 않는다
    countries50m: {
      ALB: 'Albania', AND: 'Andorra', AUT: 'Austria', BEL: 'Belgium', BGR: 'Bulgaria', BIH: 'Bosnia and Herz.', BLR: 'Belarus', CHE: 'Switzerland', CYP: 'Cyprus',
      CYN: 'N. Cyprus', CZE: 'Czechia', DEU: 'Germany', DNK: 'Denmark', ESP: 'Spain', EST: 'Estonia', FIN: 'Finland', FRA: 'France', GBR: 'United Kingdom',
      GRC: 'Greece', HRV: 'Croatia', HUN: 'Hungary', IRL: 'Ireland', ISL: 'Iceland', ITA: 'Italy', KOS: 'Kosovo', LIE: 'Liechtenstein', LTU: 'Lithuania',
      LUX: 'Luxembourg', LVA: 'Latvia', MCO: 'Monaco', MDA: 'Moldova', MKD: 'Macedonia', MLT: 'Malta', MNE: 'Montenegro', NLD: 'Netherlands', NOR: 'Norway',
      POL: 'Poland', PRT: 'Portugal', ROU: 'Romania', SMR: 'San Marino', SRB: 'Serbia', SVK: 'Slovakia', SVN: 'Slovenia', SWE: 'Sweden', UKR: 'Ukraine',
      VAT: 'Vatican', TUR: 'Turkey', GEO: 'Georgia', ARM: 'Armenia', AZE: 'Azerbaijan', RUS: 'Russia', ALD: 'Åland', FRO: 'Faeroe Is.', IMN: 'Isle of Man',
      JEY: 'Jersey', GGY: 'Guernsey',
    },
    // 크림·세바스토폴: NE v5.1.2 admin-1은 RUS로, countries-50m(NE 4.1.0)은 어느 나라로 두는지
    checkIds: ['UA-43', 'UA-40'],
  },
  // 중국 (2026-10-21, 중국사 M1 첫머리): 중국 M1~M4가 동아시아 손그림 바깥 도형(shared.mjs의 CHINA 등) 안을 이 조각과 칼선으로 나눈다(docs/china/00-scope.md 2절).
  // 본토 성급 단위 31개(하이난 포함). 대만·진먼은 이웃이다(M1~M4 시대에 중국 왕조 땅이 아니고, 넣으면 생성기가 쓰지 않는 조각만 늘어남)
  china: {
    readme: 'README.china.md',
    adm0: ['CHN'],
    // 홍콩(HKG, 18개 구)·마카오(MAC)는 NE에서 광둥(CN-GD)과 국경이 맞지 않아(마카오 겹침 약 0.03km²·공유하지 않는 경계 약 0.6km, 홍콩 위안랑 약 0.002km²·0.16km)
    // 자체 검사 (c)가 실패하므로 버리고, 그 땅은 해안 맞추기에서 광둥 조각이 덮게 한다(M1~M4에는 따로 그릴 일이 없음)
    drop: ['HKG', 'MAC'],
    // 하이난 남쪽 끝(약 북위 18.2°)과 헤이룽장 북쪽 끝(약 53.6°), 파미르(약 동경 73.5°)와 우쑤리강 하구(약 134.8°)를 덮는다.
    // 남쪽 변 북위 17.5°는 파라셀 제도(NE의 CHN 조각 'Paracel Islands', id를 정할 수 없는 단위)를 상자 밖으로 빼려는 값이다
    box: [72, 17.5, 136, 55],
    idExamples: { iso: 'CN-BJ', adm1: '베이징 `CHN-1155`', adm0: [] },
    notes: [
      '중국(CHN): 성·자치구·직할시 {count:CHN}개. id는 NE의 ISO 3166-2 값(`CN-BJ` 등)이다. 국경은 NE v5.1.2 기본 파일 그대로(실제 지배 기준)이고, 시대별 나라 경계는 생성기가 바깥 손그림 도형과의 교집합과 칼선으로 정한다.',
      '홍콩·마카오: 조각으로 넣지 않고(NE에서 광둥과 국경이 맞지 않아 arc를 공유하지 못함) 그 땅은 해안 맞추기에서 광둥(`CN-GD`)이 덮는다. 그래서 광둥 조각에 홍콩 땅(주룽·신계·홍콩섬·란터우)이 들어 있다. 마카오는 빌드가 쓰는 육지(50m·110m)에서 바다라 어느 조각에도 들지 않는다.',
      '넣지 않은 것: 대만(TWN, 진먼·펑후 포함)은 이웃으로 경계 간략화에만 쓴다. 파라셀 제도(NE의 CHN 조각)는 범위 상자 남쪽 변 밖이라 뺐고, 육지(50m·110m)와 닿지 않는 작은 섬 폴리곤도 빠진다. 조각 사이의 내륙 구멍은 {micro}.',
    ],
    // 조각 합에는 홍콩·마카오가 들어 있어 50m China와 그만큼(약 1,100km²) 다르다
    countries50m: { CHN: 'China' },
    checkIds: [],
  },
  // 서아시아·북아프리카 (2026-10-29, A1-0 등록): 이 지역 A1~A4가 이 조각과 칼선으로 나라를 만든다(docs/middle-east/00-scope.md 2절).
  // 튀르키예·캅카스·키프로스·세우타·멜리야는 유럽 조각(europe.topo.json)이라 이웃이다. 원본 NE에서 이란과 아제르바이잔(아라스강)·모로코와 세우타 행정구역이 서로 겹치거나 비어
  // 따로 가공하면 이음매가 어긋나므로(겹침 약 7.5km²), under로 유럽 조각을 그대로 이웃으로 쓰고 겹치는 땅을 뺀다
  'middle-east': {
    readme: 'README.middle-east.md',
    under: 'europe',
    adm0: ['IRN', 'IRQ', 'SYR', 'LBN', 'ISR', 'PSX', 'JOR', 'SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'BHR', 'KWT', 'EGY', 'LBY', 'TUN', 'DZA', 'MAR', 'SAH'],
    // 서사하라 서쪽 끝(라구에라 약 서경 17.1°)·남쪽 끝(약 북위 20.8°), 소코트라(약 북위 12.1°·동경 54.6°), 이란 동쪽 끝(약 동경 63.3°)·북쪽 끝(약 북위 39.8°), 튀니지 북쪽 끝(약 북위 37.4°)을 덮는다
    box: [-17.5, 11.5, 63.6, 40],
    idExamples: { iso: 'IR-07', adm1: '팔레스타인 서안 `WEB+00?`', adm0: ['SAH'] },
    notes: [
      '서사하라: NE v5.1.2 admin-1은 모로코가 다스리는 서쪽(장벽 서쪽)을 모로코(MAR) 조각 셋에 넣는다. 라윤-부즈두르-사키아엘함라(`MA-15`)·우에드에드다합(`MA-16`)은 서사하라 땅, 굴밈-에스세마라(`MA-14`)는 북위 27°40′ 선을 넘어 모로코 본토와 서사하라 북부(스마라)에 걸친다. 서사하라(`SAH`, 조각 {count:SAH}개)는 장벽 동쪽만이다. 법적 서사하라 경계는 생성기의 칼선으로 정한다.',
      '골란 고원: 이스라엘이 다스리는 쪽은 이스라엘 북부 지구(`IL-Z`)에, 유엔 완충지대는 시리아 `SYR-5261`(UNDOF), 나머지는 쿠네이트라(`SY-QU`)에 들어 있다. 동예루살렘은 이스라엘 예루살렘 지구(`IL-JM`)에 들어 있고, 서안(`WEB+00?`)·가자(`GAZ+00?`)는 팔레스타인(PSX) 조각 하나씩이다.',
      '할라이브 삼각지대는 이집트 홍해주(`EG-BA`)에 들어 있고 비르타윌은 수단(이웃)이다. 사우디–쿠웨이트 옛 중립 지대는 북쪽이 쿠웨이트 아흐마디(`KW-AH`), 남쪽이 사우디 동부주(`SA-04`)로 나뉘어 있다. 원본에서 이란 호르모즈간(`IR-23`)에 든 아부무사와 대툰브·소툰브, 바레인의 하와르 제도·무하라크(`BH-15`)는 육지(50m·110m)와 닿지 않는 섬이라 조각에 없다. 소코트라는 하드라마우트(`YE-HD`)의 둘째 폴리곤이다. 시나이는 북시나이(`EG-SIN`)·남시나이(`EG-JS`) 두 조각이다.',
      '조각 수: 이란 {count:IRN}·이라크 {count:IRQ}·시리아 {count:SYR}·사우디 {count:SAU}·예멘 {count:YEM}·이집트 {count:EGY}·리비아 {count:LBY}·튀니지 {count:TUN}·알제리 {count:DZA}·모로코 {count:MAR}. 조각 사이의 내륙 구멍은 {micro}.',
    ],
    countries50m: {
      IRN: 'Iran', IRQ: 'Iraq', SYR: 'Syria', LBN: 'Lebanon', ISR: 'Israel', PSX: 'Palestine', JOR: 'Jordan', SAU: 'Saudi Arabia', YEM: 'Yemen', OMN: 'Oman',
      ARE: 'United Arab Emirates', QAT: 'Qatar', BHR: 'Bahrain', KWT: 'Kuwait', EGY: 'Egypt', LBY: 'Libya', TUN: 'Tunisia', DZA: 'Algeria', MAR: 'Morocco', SAH: 'W. Sahara',
    },
    // 서사하라 장벽 서쪽(모로코 조각)과 골란·동예루살렘(이스라엘 조각): countries-50m의 소속과 따로 견준다
    checkIds: ['MA-15', 'MA-16', 'MA-14', 'IL-Z', 'IL-JM'],
  },
  // 남아시아 (2026-11-02, 0단계 등록): 이 지역 S1~S4가 이 조각과 칼선으로 나라를 만든다(docs/south-asia/00-scope.md 2절).
  // 이란은 서아시아 조각(middle-east.topo.json)이라 under로 그대로 이웃으로 쓴다(파키스탄–이란 이음매가 그 바깥선 그대로). 아프가니스탄·미얀마·중국은 넣지 않는다
  // (중국 쪽 이음매는 동아시아 손그림 도형이 정하고 생성기가 그 도형을 빼서 맞춘다)
  'south-asia': {
    readme: 'README.south-asia.md',
    under: 'middle-east',
    adm0: ['IND', 'PAK', 'BGD', 'NPL', 'BTN', 'LKA', 'MDV', 'KAS'],
    // 파키스탄 서쪽 끝(약 동경 60.9°)·인도 동쪽 끝(아루나찰 약 97.4°)·북쪽 끝(카라코람 약 북위 37.1°)·몰디브 남쪽 끝(아두 약 남위 0.7°)을 덮는다
    box: [60.5, -1, 97.5, 37.2],
    idExamples: { iso: 'IN-TG', adm1: '시아첸 빙하 `-99-X06~`', adm0: ['KAS'] },
    notes: [
      '카슈미르: NE v5.1.2 admin-1은 실제 지배 기준이다. 인도 쪽은 잠무 카슈미르(`IN-JK`)·라다크(`IN-LA`), 파키스탄 쪽은 아자드 카슈미르(`PK-JK`)·길기트발티스탄(`PK-GB`, NE 이름 Northern Areas), 시아첸 빙하는 따로 조각 하나(`-99-X06~`, adm0 {adm0:-99-X06~})다. 악사이친과 샥스감은 중국(이웃이 아니라 넣지 않음) 땅이다.',
      '인도 행정구역은 주·연방 직할지 {count:IND}개뿐이라 거칠다(텔랑가나 `IN-TG` 등). 다드라 나가르 하벨리와 다만 디우는 2020년 합친 한 조각(`IN-DH`, 떨어진 조각 여럿)이다. 찬다나가르는 서벵골(`IN-WB`) 안이다.',
      '파키스탄 행정구역은 {count:PAK}개(펀자브·신드·발루치스탄·카이베르파크툰크와·연방 직할 부족 지역·수도·아자드 카슈미르·길기트발티스탄)로 가장 거칠다. 방글라데시 {count:BGD}·네팔 {count:NPL}·부탄 {count:BTN}·스리랑카 {count:LKA}·몰디브 {count:MDV}. 조각 사이의 내륙 구멍은 {micro}.',
    ],
    countries50m: { IND: 'India', PAK: 'Pakistan', BGD: 'Bangladesh', NPL: 'Nepal', BTN: 'Bhutan', LKA: 'Sri Lanka', MDV: 'Maldives' },
    // 카슈미르 실제 지배선 양쪽: countries-50m의 소속과 따로 견준다
    checkIds: ['IN-JK', 'IN-LA', 'PK-JK', 'PK-GB'],
  },
  // 중앙아시아 (2026-11-05, 0단계 등록): 이 지역 C1~C4가 이 조각과 칼선으로 나라를 만든다(docs/central-asia/00-scope.md 2절).
  // 파키스탄은 남아시아 조각(south-asia.topo.json)이라 under로 그대로 이웃으로 쓴다(듀랜드선·와한–길기트 이음매가 그 바깥선 그대로, 이음매가 가장 길다).
  // 이란(서아시아)·러시아(유럽)·중국 쪽은 under가 하나뿐이라 원본 행정구역을 이웃으로 가공하고, 생성기가 그 조각·손 도형을 빼서 맞춘다.
  // 신장은 넣지 않는다: 중국 조각 파일의 CN-XJ 한 조각을 생성기가 loadFragments('china')로 읽어 쓴다(이 파일에 한 번 더 넣으면 같은 땅 조각이 두 파일에 생김)
  'central-asia': {
    readme: 'README.central-asia.md',
    under: 'south-asia',
    adm0: ['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK', 'AFG', 'KAB'], // KAB: 바이코누르 임차지(크질오르다 안, NE에서 따로 나라 단위)
    // 카자흐스탄 서쪽 끝(약 동경 46.5°)·북쪽 끝(약 북위 55.4°)·동쪽 끝(알타이 약 87.4°)과 아프가니스탄 남쪽 끝(약 북위 29.4°)을 덮는다
    box: [46.4, 29.3, 87.5, 55.6],
    idExamples: { iso: 'KZ-KAR', adm1: '타지키스탄 공화국 직할 구 `TJK-368`', adm0: ['KAB'] },
    notes: [
      '카자흐스탄: 조각 {count:KAZ}개와 바이코누르 임차지(`KAB`, 러시아가 1994년부터 빌려 쓰는 우주 기지 땅, 크질오르다 `KZ-KZY` 안의 구멍) 하나. 주가 커서(10만 km² 넘는 것이 대부분) 시대별 나라 경계는 대부분 칼선이다. 알마티는 주(`KAZ-3207`)와 시(`KAZ-4829`)가 같은 ISO 코드라 NE adm1_code가 id다.',
      '아프가니스탄: 조각 {count:AFG}개. 와한 회랑은 바다흐샨(`AF-BDS`) 안이고, 듀랜드선은 남아시아 조각 바깥선 그대로다. 2004년에 갈라진 다이쿤디(`AFG-1753`)·판지시르(`AFG-1769`)가 NE에서 옛 주 이름·ISO 코드(우루즈간 `AFG-1752`·파르완 `AFG-1772`와 같음)로 남아 있어 네 조각은 adm1_code가 id다.',
      '우즈베키스탄 {count:UZB}·투르크메니스탄 {count:TKM}·키르기스스탄 {count:KGZ}·타지키스탄 {count:TJK}. 카라칼파크스탄(`UZ-QR`)은 우즈베키스탄 조각 하나, 타슈켄트는 주(`UZ-TO`)와 시(`UZ-TK`) 둘이다. 타지키스탄 공화국 직할 구(`TJK-368`)는 ISO 코드가 없다. 조각 사이의 내륙 구멍은 {micro}.',
      '신장: 이 파일에 없다. 중국 조각 파일(`china.topo.json`)의 `CN-XJ` 한 조각(약 164만 km²)을 생성기가 읽어 칼선으로 나눈다. 이 파일과 `CN-XJ`의 이음매는 원본 행정구역끼리 따로 간략화한 것이라 수십 km² 어긋나며 생성기가 맞춘다.',
    ],
    countries50m: { KAZ: 'Kazakhstan', UZB: 'Uzbekistan', TKM: 'Turkmenistan', KGZ: 'Kyrgyzstan', TJK: 'Tajikistan', AFG: 'Afghanistan' },
    // 와한·파미르(아프가니스탄·타지키스탄 쪽 끝): countries-50m의 소속과 따로 견준다
    checkIds: ['AF-BDS', 'TJ-GB'],
  },
  // 동남아 (2026-11-08, 0단계 등록): 이 지역 E1~E4가 이 조각과 칼선으로 나라를 만든다(docs/southeast-asia/00-scope.md 2절).
  // 중국(윈난·광시·광둥·하이난)은 중국 조각(china.topo.json)이라 under로 그대로 이웃으로 쓴다(베트남·라오스·미얀마–중국 이음매가 그 바깥선 그대로, 이음매가 가장 길다).
  // 인도·방글라데시(남아시아 조각) 쪽은 under가 하나뿐이라 원본 행정구역을 이웃으로 가공하고, 생성기가 그 조각을 빼서 맞춘다(중앙아시아의 이란·러시아 쪽과 같은 방법).
  // 파라셀·스프래틀리 제도(NE에서 따로 단위, 1,000 km² 미만)와 파푸아뉴기니·오스트레일리아(오세아니아 몫)는 넣지 않는다
  'southeast-asia': {
    readme: 'README.southeast-asia.md',
    under: 'china',
    // (b) 덮이지 않은 육지: 방글라데시–미얀마 나프강 하구(약 동경 92.3°·북위 20.8~21.0°)에서 원본 행정구역 둘(BD 치타공·MMR 라카인)이 육지 자료와 맞지 않아
    // 0.017 km²가 남는다(첫 실행 57조각 0.019 km², 기본 기준 0.01). 이웃이 남아시아 조각이 아니라 원본이라 생기는 몫이고 지도 기준(1만 km²)과 견줄 수 없이 작아 이 지역만 0.05
    params: { gapMaxKm2: 0.05 },
    adm0: ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'MYS', 'SGP', 'BRN', 'IDN', 'TLS', 'PHL'],
    // 미얀마 서쪽 끝(약 동경 92.2°)·북쪽 끝(카친 약 북위 28.5°), 인도네시아 남쪽 끝(로테 섬 쪽 약 남위 11.0°)·동쪽 끝(파푸아 141.0° 자오선)을 덮는다
    box: [92, -11.2, 141.1, 28.6],
    idExamples: { iso: 'VN-SG', adm1: '세부 `PHL-2514`(필리핀은 고도 도시화 시가 주와 ISO 코드를 함께 써 둘 다 adm1_code)·비엔티안 `LAO-3283`·`LAO-3284`', adm0: [] },
    notes: [
      '서뉴기니: 인도네시아 파푸아·서파푸아 조각이고 동쪽 끝은 동경 141° 자오선(파푸아뉴기니는 이웃으로만 간략화에 쓰고 넣지 않음, 오세아니아 권역 몫). 플라이강 굽이(남쪽 141° 서쪽)는 원본 국경 그대로다.',
      '작은 섬: 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬 폴리곤은 빠진다. 1,000 km² 넘는 섬은 모두 육지 자료 안에 있다(0단계 측정, 00-scope 2절 조각 준비). 파라셀·스프래틀리 제도는 넣지 않는다(NE에서 따로 단위, 합쳐도 20 km² 안팎).',
      '거친 곳: 미얀마는 주·관구 {count:MMR}개(라카인 `MM-16`·타닌타리 `MM-05`는 1826 양도 땅과 거의 맞고 하버마·샨 국 경계는 칼선), 인도네시아는 주 {count:IDN}개(NE v5.1.2라 2012년 북칼리만탄 분리 전, 파푸아 `ID-PA` 약 31.5만 km²), 사바 `MY-12`·사라와크 `MY-13`. 필리핀은 고도 도시화 시가 따로 조각이라 {count:PHL}개로 가장 많다.',
      '조각 수: 미얀마 {count:MMR}·타이 {count:THA}·라오스 {count:LAO}·캄보디아 {count:KHM}·베트남 {count:VNM}·말레이시아 {count:MYS}·싱가포르 {count:SGP}·브루나이 {count:BRN}·인도네시아 {count:IDN}·동티모르 {count:TLS}·필리핀 {count:PHL}. 조각 사이의 내륙 구멍은 {micro}.',
    ],
    countries50m: {
      MMR: 'Myanmar', THA: 'Thailand', LAO: 'Laos', KHM: 'Cambodia', VNM: 'Vietnam', MYS: 'Malaysia', SGP: 'Singapore', BRN: 'Brunei', IDN: 'Indonesia',
      TLS: 'Timor-Leste', PHL: 'Philippines',
    },
    // 사바(필리핀이 주장, 말레이시아 실효 지배): countries-50m의 소속과 따로 견준다
    checkIds: ['MY-12'],
  },
  // 사하라 이남 (2026-11-10, 0단계 등록): 이 지역 F1~F7이 이 조각과 칼선으로 나라를 만든다(docs/sub-saharan-africa/00-scope.md 2절).
  // 북아프리카 여섯 나라(EGY·LBY·TUN·DZA·MAR·SAH)와 소코트라는 서아시아 조각(middle-east.topo.json)이라 under로 그대로 이웃으로 쓴다
  // (수단·차드·니제르·말리·모리타니–북아프리카 이음매가 그 바깥선 그대로). 카나리아·마데이라는 유럽 조각이고 바다로 떨어져 있어 따로 맞출 이음매가 없다.
  // 섬나라(마다가스카르·모리셔스·세이셸·코모로·카보베르데·상투메프린시페)와 세인트헬레나(NE 고유 adm0 SHN)는 adm0로, 프랑스 해외 땅(레위니옹·마요트)은 include로 넣는다.
  // 남수단은 NE 고유 코드 SDS, 소말릴란드는 SOL(조각 하나, id도 SOL). 차고스(영국령 인도양, 동경 71~72°)와 프랑스령 남방 흩어진 섬은 상자 밖이라 넣지 않는다
  'sub-saharan-africa': {
    readme: 'README.sub-saharan-africa.md',
    under: 'middle-east',
    adm0: [
      'SDN', 'SDS', 'ERI', 'DJI', 'ETH', 'SOM', 'SOL', 'KEN', 'UGA', 'RWA', 'BDI', 'TZA',
      'MRT', 'MLI', 'NER', 'TCD', 'SEN', 'GMB', 'GNB', 'GIN', 'SLE', 'LBR', 'CIV', 'BFA', 'GHA', 'TGO', 'BEN', 'NGA',
      'CMR', 'CAF', 'GNQ', 'GAB', 'COG', 'COD', 'AGO',
      'ZMB', 'MWI', 'MOZ', 'ZWE', 'BWA', 'NAM', 'ZAF', 'LSO', 'SWZ',
      'MDG', 'MUS', 'SYC', 'COM', 'CPV', 'STP', 'SHN', // 섬나라와 세인트헬레나·어센션·트리스탄다쿠냐(트리스탄은 육지 자료에 없어 빠짐)
    ],
    include: [{ adm0: 'FRA', prop: 'iso_3166_2', values: ['FR-RE', 'FR-YT'], note: '프랑스 해외 땅: 레위니옹·마요트({values}). 유럽 조각의 프랑스는 본토·코르시카뿐(해외 데파르트망은 유럽 상자 밖)이라 조각 id가 부딪치지 않는다.' }],
    // 카보베르데 서쪽 끝(약 서경 25.4°)·케이프 남쪽 끝(약 남위 34.9°)·모리셔스 동쪽 끝(약 동경 57.8°)·말리 북쪽 끝(약 북위 25.0°)을 덮는다
    box: [-26, -35, 58, 25.2],
    idExamples: { iso: 'ZA-NC', adm1: '소말릴란드 `SOL`(NE 고유 adm0, 조각 하나)', adm0: ['SOL'] },
    notes: [
      '이음매: 북쪽은 서아시아 조각(under) 바깥선 그대로다. 수단–이집트는 북위 22° 선(NE 모양)이고 할라이브 삼각지대는 이집트 홍해주(`EG-BA`, 서아시아 조각), 비르타윌은 수단 홍해주(`SD-RS`)에 들어 있다. 아우주 띠는 차드 티베스티(`TD-TI`)다.',
      '섬: 잔지바르 제도는 탄자니아 조각 다섯(`TZ-06`·`TZ-07`·`TZ-10`·`TZ-11`·`TZ-15`)으로 따로 떨어진다. 비오코는 적도기니 조각이다. 빌드가 쓰는 육지(50m·110m)와 닿지 않는 작은 섬(트리스탄다쿠냐·로드리게스·아갈레가·아노본·브라바 등, 모두 1,000 km² 미만)은 빠진다.',
      '거친 곳: 수단 북부주·다르푸르·코르도판, 에티오피아 오로미아·소말리, 말리 팀북투, 니제르 아가데즈, 차드 보르쿠·티베스티, 콩고 민주 공화국(주 {count:COD}개)은 한 조각이 20만 km²를 넘어 식민 분할선·옛 나라 경계는 칼선이다.',
      '조각 수: 수단 {count:SDN}·남수단 {count:SDS}·에티오피아 {count:ETH}·소말리아 {count:SOM}·케냐 {count:KEN}·탄자니아 {count:TZA}·우간다 {count:UGA}·나이지리아 {count:NGA}·말리 {count:MLI}·콩고 민주 공화국 {count:COD}·앙골라 {count:AGO}·남아프리카 {count:ZAF}·마다가스카르 {count:MDG}. 조각 사이의 내륙 구멍은 {micro}.',
    ],
    countries50m: {
      SDN: 'Sudan', SDS: 'S. Sudan', ERI: 'Eritrea', DJI: 'Djibouti', ETH: 'Ethiopia', SOM: 'Somalia', SOL: 'Somaliland', KEN: 'Kenya', UGA: 'Uganda', RWA: 'Rwanda',
      BDI: 'Burundi', TZA: 'Tanzania', MRT: 'Mauritania', MLI: 'Mali', NER: 'Niger', TCD: 'Chad', SEN: 'Senegal', GMB: 'Gambia', GNB: 'Guinea-Bissau', GIN: 'Guinea',
      SLE: 'Sierra Leone', LBR: 'Liberia', CIV: "Côte d'Ivoire", BFA: 'Burkina Faso', GHA: 'Ghana', TGO: 'Togo', BEN: 'Benin', NGA: 'Nigeria', CMR: 'Cameroon',
      CAF: 'Central African Rep.', GNQ: 'Eq. Guinea', GAB: 'Gabon', COG: 'Congo', COD: 'Dem. Rep. Congo', AGO: 'Angola', ZMB: 'Zambia', MWI: 'Malawi', MOZ: 'Mozambique',
      ZWE: 'Zimbabwe', BWA: 'Botswana', NAM: 'Namibia', ZAF: 'South Africa', LSO: 'Lesotho', SWZ: 'eSwatini', MDG: 'Madagascar', MUS: 'Mauritius', SYC: 'Seychelles',
      COM: 'Comoros', CPV: 'Cabo Verde', STP: 'São Tomé and Principe', SHN: 'Saint Helena',
    },
    // 소말릴란드(미승인, 법적으로 소말리아)와 비르타윌이 든 수단 홍해주: countries-50m의 소속과 따로 견준다
    checkIds: ['SOL', 'SD-RS'],
  },
};

/** 지역 이름 → 항목. 모르는 이름이면 오류(알려진 이름을 함께 적음) */
export function fragmentRegion(name) {
  if (!Object.hasOwn(FRAGMENT_REGIONS, name)) throw new Error(`모르는 조각 지역: ${JSON.stringify(name)} (scripts/fragments/regions.mjs에 있는 지역: ${Object.keys(FRAGMENT_REGIONS).join(', ')})`);
  return FRAGMENT_REGIONS[name];
}

/** --region 없이 부를 때의 지역 이름 (default: true인 항목) */
export function defaultFragmentRegion() {
  const names = Object.keys(FRAGMENT_REGIONS).filter((n) => FRAGMENT_REGIONS[n].default);
  if (names.length !== 1) throw new Error(`scripts/fragments/regions.mjs: default: true인 지역이 하나가 아님 (${names.join(', ') || '없음'})`);
  return names[0];
}
