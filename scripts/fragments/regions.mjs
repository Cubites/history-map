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
