// 제2차 세계 대전 유럽·북아프리카 전역의 내용(글·진영·전선 경유점). gen.mjs가 읽어 YAML과 GeoJSON을 만든다.
import { readFileSync } from 'node:fs';
import { G, P as poly, terr } from '../../engine.mjs';
import { F, P } from './fronts.mjs';
import { NA, SPANISH_MOROCCO, IFNI } from './colonies.mjs';

// ── 도우미 ─────────────────────────────────────────
/** 그 해에 영토가 있으면 그 영토, 없으면 빈 도형 */
export const T = (id, y) => {
  try {
    return terr(id, y);
  } catch {
    return [];
  }
};
export const U = (...c) => G.union(...c.filter((x) => x.length));
export const minus = (a, ...b) => (b.length ? G.difference(a, U(...b)) : a);
/** 중립국(칠하지 않음) */
const NEUTRAL = ['spain', 'portugal', 'switzerland', 'sweden', 'ireland', 'turkey', 'andorra', 'liechtenstein', 'monaco', 'san-marino', 'vatican'];
export const neutrals = (y) => U(...NEUTRAL.map((id) => T(id, y)), SPANISH_MOROCCO, IFNI);
/** 경유점 목록 [이름, 경도, 위도] → 좌표 */
// 이름 붙은 점은 위키백과 좌표(저장소 밖 인계 폴더의 wikicheck.mjs가 모아 wikicache.json에 둔 것)가 8km 안이면 그 좌표를 쓴다
const WIKI = (() => {
  try {
    return JSON.parse(readFileSync(new URL('./wikicache.json', import.meta.url), 'utf8'));
  } catch {
    return {};
  }
})();
const kmBetween = (a, b) => 6371 * Math.hypot(((b[0] - a[0]) * Math.PI) / 180 * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180), ((b[1] - a[1]) * Math.PI) / 180);
export const W = (pts) =>
  pts.map((p) => {
    if (typeof p[0] !== 'string') return p;
    const w = WIKI[p[0]];
    return w && kmBetween([p[1], p[2]], w) <= 8 ? w : [p[1], p[2]];
  });
/** 선(경유점) + 닫는 꼭짓점들로 만든 다각형 */
export const side = (line, close) => poly([...W(line), ...close]);
/** 손으로 그린 지역에서 중립국과 칠하지 않을 나라를 뺀다 */
export const clean = (c, y, unpainted = []) => minus(c, neutrals(y), ...unpainted.map((id) => T(id, y)));

export const HEAD = {
  comment: [
    '제2차 세계 대전 (DESIGN.md §4.5)',
    '전역 둘: 유럽·북아프리카(europe)와 아시아·태평양(asia-pacific, 권역 japan). 진영 다섯은 두 전역이 함께 쓴다.',
    '유럽·북아프리카 전역의 점령 지역은 스냅샷마다 진영별 한 덩어리 ww2-europe/<날짜>-<진영>.geojson (서로 겹치지 않음, 빌드가 해안선으로 자름).',
    '덩어리는 작업 스크립트가 저장소 나라 영토(data/geo, 해안선으로 자르기 전)를 깔고 그날 전선이 지난 도시·마을·강을 이은 선과 포위지 다각형으로',
    '덮어 만들었다(만든 순서는 진영마다 주석). 나라 영토(entities) 위에 geojson을 여러 겹 덮으면 빌드의 도형 계산(polyclip-ts)이 해안·경계의',
    '가는 조각에서 깨져서 이렇게 했다. 경유점·근거·어림 오차는 작업 결과 노트에 있다. 중립국(에스파냐·포르투갈·스위스·스웨덴·튀르키예·아일랜드 등)은 칠하지 않는다.',
    '북아프리카·중동은 그 시기 나라 영토가 지도에 없어 식민지 경계를 다각형으로 대략 그렸다. 운영자 검수 필요.',
    '다시 만드는 법: npm run gen:wars. 생성 스크립트와 입력(경유점·식민지 경계)은 저장소의 scripts/wars/world-war-2/europe/ 에 있다.',
    '  이 YAML의 머리와 europe 전역, ww2-europe/*.geojson을 다시 쓴다(뒤에 붙은 다른 전역은 그대로). 이 전역만 다시 만들려면 npm run gen:wars -- --only europe. 경유점은 fronts*.mjs, 장면 구성은 spec*.mjs.',
  ],
  id: 'world-war-2',
  name: '제2차 세계 대전',
  factions: [
    { id: 'allies', name: '연합국', entity: 'uk', color: '#4a72b8' },
    { id: 'axis', name: '추축국', entity: 'nazi-germany', color: '#62666e' },
    { id: 'soviet', name: '소련', entity: 'soviet-union', color: '#c2453b' },
    { id: 'japan', name: '일본', entity: 'japan', color: '#c77a9e' },
    { id: 'china', name: '중국', entity: 'roc', color: '#d9a43a' },
  ],
  participantsComment: [
    '참전국. 편을 바꾼 나라는 기간을 나눠 두 번 적는다. 소련은 독소 불가침 시기(1939~1941)와 동부 전선을 따로 보이려고 연합국과 다른 진영으로 둔다.',
    '루마니아·불가리아는 1944년 편을 바꾼 뒤 소련군 지휘 아래 독일과 싸워 소련 진영으로 적는다.',
  ],
  participants: [
    { entity: 'poland', faction: 'allies', from: '1939-09-01' },
    { comment: '영국·프랑스는 9월 3일 독일에 선전 포고. 프랑스는 1940년 6월 항복 뒤 드골의 자유 프랑스가 싸움을 이었다', entity: 'uk', faction: 'allies', from: '1939-09-03' },
    { entity: 'france', faction: 'allies', from: '1939-09-03' },
    { entity: 'norway', faction: 'allies', from: '1940-04-09' },
    { entity: 'netherlands', faction: 'allies', from: '1940-05-10' },
    { entity: 'belgium', faction: 'allies', from: '1940-05-10' },
    { entity: 'luxembourg', faction: 'allies', from: '1940-05-10' },
    { entity: 'greece', faction: 'allies', from: '1940-10-28' },
    { entity: 'yugoslavia', faction: 'allies', from: '1941-04-06' },
    { comment: '미국은 진주만 공격 이튿날(12월 8일) 일본에, 12월 11일 독일·이탈리아에 맞서 참전', entity: 'usa', faction: 'allies', from: '1941-12-08' },
    { comment: '이탈리아는 1943년 9월 8일 휴전, 10월 13일 독일에 선전 포고(공동 교전국)', entity: 'italy', faction: 'allies', from: '1943-10-13' },
    { entity: 'nazi-germany', faction: 'axis', from: '1939-09-01', to: '1945-05-08' },
    { entity: 'slovakia', faction: 'axis', from: '1939-09-01', to: '1945-04-04' },
    { entity: 'italy', faction: 'axis', from: '1940-06-10', to: '1943-09-08' },
    { entity: 'bulgaria', faction: 'axis', from: '1941-03-01', to: '1944-09-08' },
    { entity: 'croatia-ndh', faction: 'axis', from: '1941-04-10', to: '1945-05-08' },
    { entity: 'hungary', faction: 'axis', from: '1941-04-11', to: '1945-05-08' },
    { entity: 'romania', faction: 'axis', from: '1941-06-22', to: '1944-08-23' },
    { comment: '핀란드는 겨울 전쟁(1939-11-30~1940-03-13)을 홀로 치렀고, 1941년 6월 25일 독일 편으로 다시 싸웠다(계속 전쟁, 1944년 9월 19일 휴전)', entity: 'finland', faction: 'axis', from: '1941-06-25', to: '1944-09-19' },
    { comment: '소련은 1939년 9월 17일 폴란드 동부를 침공, 1945년 8월 8일 일본에 선전 포고', entity: 'soviet-union', faction: 'soviet', from: '1939-09-17' },
    { entity: 'romania', faction: 'soviet', from: '1944-08-24', to: '1945-05-08' },
    { entity: 'bulgaria', faction: 'soviet', from: '1944-09-09', to: '1945-05-08' },
    { comment: '몽골 인민 공화국은 1945년 8월 10일 일본에 선전 포고', entity: 'mongolia', faction: 'soviet', from: '1945-08-10', to: '1945-09-02' },
    { comment: '아시아·태평양: 1937년 7월 7일 루거우차오 사건으로 중일 전쟁 시작, 1945년 9월 2일 일본 항복 문서 조인', entity: 'japan', faction: 'japan', from: '1937-07-07', to: '1945-09-02' },
    { entity: 'manchukuo', faction: 'japan', from: '1937-07-07', to: '1945-08-18' },
    { entity: 'roc', faction: 'china', from: '1937-07-07', to: '1945-09-02' },
  ],
  sources: [
    '미 육군사관학교 역사학과 『제2차 세계 대전 지도첩(West Point Atlas)』',
    '미 육군 군사사 센터(CMH) 공간사(Ziemke 『Stalingrad to Berlin』, 『Moscow to Stalingrad』 등)',
    '영국 공식 전사 『The Mediterranean and Middle East』(Playfair)',
    '위키백과 각 전투·작전 문서와 커먼즈 전황도',
    '국사편찬위원회 『고등학교 세계사』 교과서',
  ],
};

// 전역: 유럽·북아프리카
export const THEATER = {
  id: 'europe',
  name: '유럽·북아프리카',
  replacesComment: [
    '영토 대신 진영 색으로 칠할 나라: 해마다 같은 모양인 연 단위 영토가 날짜별 전선과 어긋나는 나라와 점령지 항목.',
    '나머지 참전국(영국·프랑스·이탈리아·헝가리 등)은 평소 영토와 이름표를 그대로 두고 그 위를 진영 색으로 덮는다(중립이던 때는 평소 영토로 보임).',
    '비시 프랑스(1940-06~1942-11)와 그 식민지는 독일에 협력한 정부라 추축국 색으로 칠한다. 이탈리아는 참전(1940-06-10) 전 세 장면에서 칠하지 않는다.',
  ],
  replaces: [
    'soviet-union', 'soviet-occupied', 'karelia-occupied', 'general-government', 'bohemia-moravia', 'free-city-danzig',
    'italy-occupied', 'serbia-occupied', 'montenegro-occupied',
    'germany-zone-us', 'germany-zone-uk', 'germany-zone-fr', 'germany-zone-su', 'berlin-western-sectors', 'berlin-soviet-sector',
  ],
  markerComment: '평소 지도의 전쟁 표시 위치 (독일·폴란드 경계 부근)',
  marker: [15.5, 51.2],
  bounds: [[-11, 27], [50, 70.5]],
};

// 지점 판정·미리보기용 주요 도시
export const CITIES = [
  { name: '파리', at: [2.35, 48.86] }, { name: '런던', at: [-0.13, 51.51] }, { name: '베를린', at: [13.40, 52.52] },
  { name: '바르샤바', at: [21.01, 52.23] }, { name: '모스크바', at: [37.62, 55.75] }, { name: '레닌그라드', at: [30.32, 59.94] },
  { name: '스탈린그라드', at: [44.52, 48.71] }, { name: '키이우', at: [30.52, 50.45] }, { name: '로마', at: [12.50, 41.90] },
  { name: '카이로', at: [31.24, 30.04] }, { name: '엘알라메인', at: [28.95, 30.83] }, { name: '토브루크', at: [23.95, 32.05] },
  { name: '튀니스', at: [10.18, 36.80] }, { name: '알제', at: [3.06, 36.75] }, { name: '아테네', at: [23.73, 37.98] },
  { name: '베오그라드', at: [20.46, 44.82] }, { name: '부다페스트', at: [19.04, 47.50] }, { name: '빈', at: [16.37, 48.21] },
  { name: '프라하', at: [14.42, 50.09] }, { name: '오슬로', at: [10.75, 59.91] }, { name: '코펜하겐', at: [12.45, 55.66] },
  { name: '암스테르담', at: [4.90, 52.37] }, { name: '브뤼셀', at: [4.35, 50.85] }, { name: '세바스토폴', at: [33.52, 44.60] },
  { name: '민스크', at: [27.56, 53.90] }, { name: '리가', at: [24.11, 56.95] }, { name: '헬싱키', at: [24.94, 60.17] },
  { name: '부쿠레슈티', at: [26.10, 44.43] }, { name: '소피아', at: [23.32, 42.70] }, { name: '쿠르스크', at: [36.19, 51.73] },
  { name: '하르키우', at: [36.23, 49.99] }, { name: '로스토프', at: [39.70, 47.23] }, { name: '비시', at: [3.43, 46.13] },
  { name: '나폴리', at: [14.27, 40.85] }, { name: '밀라노', at: [9.19, 45.46] }, { name: '노르망디(바이외)', at: [-0.70, 49.28] },
  { name: '바스토뉴', at: [5.72, 50.00] }, { name: '쾨니히스베르크', at: [20.51, 54.71] }, { name: '드레스덴', at: [13.74, 51.05] },
  { name: '함부르크', at: [9.99, 53.55] }, { name: '뮌헨', at: [11.58, 48.14] }, { name: '다마스쿠스', at: [36.29, 33.51] },
  { name: '바그다드', at: [44.36, 33.31] }, { name: '테헤란', at: [51.39, 35.69] }, { name: '마드리드', at: [-3.70, 40.42] },
  { name: '베른', at: [7.45, 46.95] }, { name: '스톡홀름', at: [18.07, 59.33] }, { name: '앙카라', at: [32.86, 39.93] },
  { name: '트리폴리', at: [13.19, 32.89] }, { name: '벵가지', at: [20.15, 32.05] }, { name: '그로즈니', at: [45.69, 43.32] },
  { name: '무르만스크', at: [33.08, 68.97] }, { name: '오데사', at: [30.73, 46.48] },
];

export const BATTLES = [];
export const SNAPSHOTS = [];

// ── 북아프리카·중동 (식민지 다각형, colonies.mjs) ─────────────
// 날짜별 상태: 비시 프랑스 쪽(1940-06~1942-11의 프랑스령 북아프리카, 1940-06~1941-07의 시리아·레바논)은 칠하지 않는다
const naGeo = (name, faction, note, fn) => ({ faction, name: `na-${name}`, note, geo: fn });
export function northAfrica(date) {
  const d = date.replace(/-/g, '');
  const out = [];
  const add = (...a) => out.push(naGeo(...a));
  const allNA = d >= '19430513';
  // 프랑스령 북아프리카: 1940-06 휴전 전 연합국, 휴전 뒤 비시 정부(독일 협력, 추축국 색), 1942-11 횃불 작전 뒤 연합국(튀니지는 추축군이 들어가 1943-05까지 추축)
  const vichy = d >= '19400622' && d < '19421108';
  add('maghreb', vichy ? 'axis' : 'allies', vichy ? '비시 프랑스령 모로코·알제리' : '프랑스령 모로코·알제리', () => NA.maghrebWest());
  add('tunisia', d >= '19400622' && !allNA ? 'axis' : 'allies', d >= '19400622' && !allNA ? '비시 프랑스령 튀니지 (1942-11부터 추축군)' : '프랑스령 튀니지', () => NA.tunisia());
  // 시리아·레바논: 1940-06 전 연합국(프랑스), 그 뒤 비시(추축국 색), 1941-07-14 아크레 협정 뒤 연합국(자유 프랑스·영국)
  add('levant-fr', d >= '19400622' && d < '19410714' ? 'axis' : 'allies', d >= '19400622' && d < '19410714' ? '비시 프랑스 위임 통치령 시리아·레바논' : '시리아·레바논', () => NA.syria());
  // 리비아: 이탈리아 참전(1940-06-10) 전에는 칠하지 않음
  if (d >= '19400610') add('libya', allNA ? 'allies' : 'axis', allNA ? '리비아 (영국·자유 프랑스 군정)' : '이탈리아령 리비아', () => NA.libya());
  add('egypt', 'allies', '이집트(영국군 주둔)', () => NA.egypt());
  add('levant-uk', 'allies', '영국 위임 통치령 팔레스타인·트란스요르단', () => NA.levantUK());
  // 이라크: 1941-05 영국-이라크 전쟁 뒤 영국 점령
  if (d >= '19410531') add('iraq', 'allies', '이라크 (1941년 5월부터 영국군 점령)', () => NA.iraq());
  // 이란: 1941-08-25 영·소 침공 뒤 북부 소련, 남서부 영국 구역 (가운데는 이란 정부 관할로 칠하지 않음)
  if (d >= '19410825') {
    add('iran-soviet', 'soviet', '이란 북부 소련 점령 구역', () => NA.iranSoviet());
    add('iran-british', 'allies', '이란 남서부 영국 점령 구역', () => NA.iranBritish());
  }
  for (const a of NA_FRONT[date] ?? []) out.push(a);
  return out;
}
// 날짜별 북아프리카·중동 전선 (뒤에 덮는 지역). 근거는 결과 노트 3장(북아프리카 조사: Playfair, 위키백과)
const egyptLand = () => NA.egypt();
const libyaLand = () => NA.libya();
export const NA_FRONT = {
  // 이탈리아군의 이집트 침공: 9월 13일 살룸, 15일 무렵 부크부크, 16일 시디바라니
  '1940-09-15': [
    naGeo('egypt-strip', 'axis', '이탈리아군이 차지한 이집트 해안 띠 (살룸~부크부크)', () =>
      G.intersect(poly([[25.15, 31.67], [25.3, 31.9], [25.7, 31.9], [25.68, 31.5], [25.5, 31.33], [24.98, 31.37]]), egyptLand())),
  ],
  // 배틀액스 작전 뒤: 추축군이 살룸·할파야를 쥠, 토브루크 요새는 영국·오스트레일리아군. 시리아는 남부를 연합군이 차지
  '1941-06-22': [
    naGeo('halfaya', 'axis', '추축군이 쥔 살룸·할파야 고개', () => G.intersect(poly([[25.15, 31.67], [25.35, 31.8], [25.22, 31.52], [25.18, 31.50], [25.08, 31.45], [24.98, 31.37]]), egyptLand())),
    naGeo('tobruk', 'allies', '토브루크 요새 (포위된 연합군)', () =>
      G.intersect(poly([[23.72, 32.2], [23.80, 32.06], [23.80, 32.0], [23.86, 31.96], [23.97, 31.95], [24.07, 31.98], [24.11, 32.02], [24.13, 32.07], [24.25, 32.2]]), libyaLand())),
    naGeo('syria-south', 'allies', '연합군이 차지한 시리아·레바논 남부 (6월 21일 다마스쿠스)', () =>
      G.intersect(
        poly([[35.0, 33.64], [35.42, 33.64], [35.58, 33.54], [35.52, 33.40], [35.62, 33.30], [35.69, 33.25], [35.83, 33.35], [36.24, 33.50], [36.32, 33.58], [36.55, 33.45], [36.40, 32.95], [36.45, 32.45], [36.45, 32.0], [35.0, 32.6]]),
        NA.syria(),
      )),
  ],
  // 크루세이더 작전 중: 토브루크 남동쪽 에드두다에서 연결이 다시 끊긴 무렵. 바르디아·살룸·할파야에 추축군 거점이 남음
  '1941-12-05': [
    naGeo('cyrenaica-east', 'allies', '크루세이더 작전으로 영국군이 되찾은 키레나이카 동부', () =>
      G.intersect(poly([[23.7, 32.3], [23.80, 32.06], [23.82, 31.98], [23.98, 31.90], [24.12, 31.56], [24.0, 31.0], [24.0, 29.0], [25.5, 29.0], [25.5, 32.3]]), libyaLand())),
    naGeo('bardia', 'axis', '바르디아의 추축군 거점 (1942년 1월 2일 항복)', () =>
      G.intersect(poly([[25.0, 31.83], [25.12, 31.85], [25.16, 31.76], [25.12, 31.69], [25.02, 31.69], [24.98, 31.76]]), libyaLand())),
    naGeo('halfaya', 'axis', '살룸·할파야의 추축군 거점 (1942년 1월 항복)', () =>
      G.intersect(poly([[25.13, 31.57], [25.22, 31.55], [25.22, 31.47], [25.12, 31.47]]), U(egyptLand(), libyaLand()))),
  ],
  // 엘알라메인 뒤 추격(11월 20일 벵가지), 횃불 작전 뒤 튀니지 북동부의 추축 교두보
  '1942-11-19': [
    naGeo('cyrenaica', 'allies', '영국 제8군이 되찾은 키레나이카 (벵가지 동쪽까지)', () =>
      G.intersect(poly([[20.57, 33.3], [20.57, 32.53], [20.27, 32.10], [20.5, 31.65], [20.59, 30.86], [20.80, 30.30], [20.8, 26.0], [25.5, 26.0], [25.5, 33.3]]), libyaLand())),
    naGeo('tunisia-west', 'allies', '연합군·자유 프랑스군이 쥔 튀니지 서부 (제벨아비오드·메제즈엘바브 앞·르케프·가프사, 동쪽 해안과 튀니스·비제르트는 추축군)', () =>
      G.intersect(poly([[8.4, 37.6], [9.22, 37.5], [9.22, 37.24], [9.15, 37.08], [9.45, 36.90], [9.62, 36.65], [9.35, 36.45], [9.2, 36.1], [9.25, 35.6], [9.15, 35.2], [8.95, 34.5], [8.6, 34.0], [7.9, 33.5], [7.0, 33.5], [7.0, 37.6]]), NA.tunisia())),
  ],
};

// ── 1939 ────────────────────────────────────────────
// 전쟁 전 폴란드: 저장소의 1922~1938년 폴란드 영토
const prewarPoland = () => terr('poland', 1938);

SNAPSHOTS.push({
  date: '1939-09-01',
  title: '독일의 폴란드 침공',
  summary: '독일군이 선전 포고 없이 폴란드로 쳐들어가 제2차 세계 대전이 시작되었습니다. 9월 3일 영국과 프랑스가 독일에 선전 포고했지만 서부 전선에서는 큰 싸움이 없었습니다. 독일과 강철 조약을 맺은 이탈리아는 아직 참전하지 않았습니다(비교전국).',
  comment: ['폴란드는 전쟁 전 국경(저장소 1922~1938년 영토). 단치히는 이날 독일이 병합을 선언해 추축국 쪽에 둔다', '이탈리아(리비아·알바니아 포함)는 1940-06-10 참전 전이라 칠하지 않는다(운영자 결정 2026-10-12)'],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'bohemia-moravia', 'slovakia'] },
    { faction: 'soviet', entities: ['soviet-union'] },
    { faction: 'allies', entities: ['uk', 'france'] },
    { faction: 'allies', name: 'poland', note: '전쟁 전 폴란드 (1939년 9월 1일 국경)', geo: () => prewarPoland() },
    ...northAfrica('1939-09-01'),
  ],
  arrows: F['1939-09-01'].arrows,
});

SNAPSHOTS.push({
  date: '1939-09-28',
  title: '폴란드 분할',
  summary: '9월 17일 소련군이 폴란드 동부로 들어왔고, 27일 바르샤바가 항복했습니다. 28일 독일과 소련은 국경 우호 조약으로 폴란드를 부크강을 경계로 나누었습니다. 이탈리아는 아직 참전하지 않았습니다.',
  comment: ['경계는 9월 28일 조약선(피사·나레프·부크·산강). 빌뉴스 지역은 10월 10일 리투아니아에 넘기기 전까지 소련군이 차지'],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia'] },
    { faction: 'soviet', entities: ['soviet-union'] },
    { faction: 'soviet', name: 'vilnius', note: '소련군이 차지한 빌뉴스 지역(10월 10일 리투아니아에 넘김)', geo: () => G.intersect(terr('lithuania', 1939), prewarPoland()) },
    { faction: 'allies', entities: ['uk', 'france'] },
    ...northAfrica('1939-09-28'),
  ],
  arrows: F['1939-09-28'].arrows,
  holds: [
    { name: '헬반도 (10월 2일 항복)', at: [18.80, 54.61], faction: 'allies' },
    { name: '모들린 요새 (9월 29일 항복)', at: [20.70, 52.44], faction: 'allies' },
  ],
});

// ── 전투 (summary는 imjin-war.yaml처럼 평서문) ──────────────────
BATTLES.push(
  { name: '겨울 전쟁', at: [28.95, 60.6], date: '1939-11-30', winner: 'soviet', summary: '소련이 핀란드를 침공했다. 핀란드군은 만네르헤임 선에서 석 달 넘게 버텼으나 1940년 3월 모스크바 강화 조약으로 카렐리야 지협 등을 내주었다.' },
  { name: '스당 돌파', at: [4.94, 49.70], date: '1940-05-13', winner: 'axis', summary: '독일 기갑 부대가 아르덴 숲을 지나 스당에서 뫼즈강을 건너 프랑스군 전선을 뚫고 영국 해협으로 내달렸다.' },
  { name: '됭케르크 철수', at: [2.38, 51.03], date: '1940-05-26', summary: '해안에 몰린 영국·프랑스군 33만여 명이 6월 4일까지 크고 작은 배로 영국에 철수했다.' },
  { name: '나르비크 전투', at: [17.43, 68.44], date: '1940-05-28', winner: 'allies', summary: '영국·프랑스·폴란드·노르웨이군이 나르비크를 되찾았으나, 프랑스 전선이 무너지자 6월 8일 철수했다.' },
  { name: '영국 본토 항공전', at: [0.1, 51.3], date: '1940-09-15', winner: 'allies', summary: '영국 공군이 레이더와 전투기로 독일 공군의 큰 공습을 물리쳤다. 히틀러는 영국 상륙(바다사자 작전)을 미루었다.' },
  { name: '콤파스 작전 (베다폼)', at: [20.27, 31.63], date: '1941-02-07', winner: 'allies', summary: '영국군이 이집트에서 반격해 이탈리아 제10군을 베다폼에서 에워싸 무너뜨리고 키레나이카를 차지했다.' },
  { name: '토브루크 포위전', at: [23.96, 32.08], date: '1941-04-10', winner: 'allies', summary: '롬멜의 독일·이탈리아군에 에워싸인 토브루크 요새를 오스트레일리아군 등이 241일 동안 지켜 냈다.' },
  { name: '크레타 전투', at: [23.85, 35.52], date: '1941-05-20', winner: 'axis', summary: '독일 공수 부대가 말레메 비행장을 차지하고 크레타섬을 점령했다. 공수 부대의 손실이 커서 독일은 이후 대규모 공수 작전을 하지 않았다.' },
  { name: '레닌그라드 포위전', at: [30.32, 59.94], date: '1941-09-08', winner: 'soviet', summary: '독일군과 핀란드군이 레닌그라드를 에워쌌다. 시민 수십만 명이 굶주림으로 죽었으나 도시는 1944년 1월 27일 포위가 풀릴 때까지 872일을 버텼다.' },
  { name: '키이우 포위전', at: [30.52, 50.45], date: '1941-09-19', winner: 'axis', summary: '독일군이 키이우 동쪽에서 소련 남서 전선군을 에워싸 60만여 명을 사로잡았다.' },
  { name: '모스크바 전투', at: [37.62, 55.75], date: '1941-12-05', winner: 'soviet', summary: '모스크바 30km 앞까지 온 독일군을 주코프의 소련군이 시베리아 증원군과 함께 반격해 100~250km 밀어냈다. 독일군의 첫 큰 패배였다.' },
  { name: '가잘라 전투·토브루크 함락', at: [23.36, 32.14], date: '1942-06-21', winner: 'axis', summary: '롬멜이 가잘라 선의 영국군을 깨뜨리고 6월 21일 토브루크를 함락한 뒤 이집트로 들어가 엘알라메인까지 나아갔다.' },
  { name: '세바스토폴 함락', at: [33.52, 44.60], date: '1942-07-04', winner: 'axis', summary: '250일 동안 버틴 크림반도의 해군 기지 세바스토폴이 독일·루마니아군의 공격에 함락되었다.' },
  { name: '스탈린그라드 전투', at: [44.52, 48.71], date: '1942-08-23', winner: 'soviet', summary: '볼가강 가의 스탈린그라드에서 시가전이 벌어졌다. 11월 소련군의 반격(천왕성 작전)으로 에워싸인 독일 제6군이 1943년 2월 2일 항복해 독소 전쟁의 흐름이 바뀌었다.' },
  { name: '제2차 엘알라메인 전투', at: [28.95, 30.83], date: '1942-11-04', winner: 'allies', summary: '몽고메리의 영국 제8군이 10월 23일부터 공격해 11월 4일 롬멜의 독일·이탈리아군을 무너뜨렸다. 추축군은 리비아로 물러났다.' },
  { name: '횃불 작전', at: [3.06, 36.75], date: '1942-11-08', winner: 'allies', summary: '미국·영국군이 프랑스령 모로코·알제리의 카사블랑카·오랑·알제에 상륙했다. 비시 프랑스군은 사흘 만에 싸움을 멈추었다.' },
  { name: '튀니스 함락', at: [10.18, 36.80], date: '1943-05-13', winner: 'allies', summary: '5월 7일 튀니스와 비제르트가 함락되고 13일 튀니지의 독일·이탈리아군 약 25만 명이 항복해 북아프리카 전역이 끝났다.' },
  { name: '쿠르스크 전투', at: [36.73, 51.04], date: '1943-07-05', winner: 'soviet', summary: '독일군이 쿠르스크 돌출부를 남북에서 공격했으나(성채 작전) 깊은 방어선에 막혔다. 7월 12일 프로호로프카에서 큰 전차전이 벌어졌고, 소련군은 곧 반격으로 넘어갔다.' },
  { name: '시칠리아 상륙', at: [14.25, 37.07], date: '1943-07-10', winner: 'allies', summary: '미국·영국군이 시칠리아 남동 해안에 상륙해 8월 17일 섬을 차지했다. 그사이 7월 25일 무솔리니가 실각했다.' },
  { name: '살레르노 상륙', at: [14.95, 40.55], date: '1943-09-09', winner: 'allies', summary: '이탈리아의 휴전 발표 이튿날 미국·영국군이 살레르노에 상륙해 독일군의 반격을 막고 10월 1일 나폴리에 들어갔다.' },
  { name: '안치오 상륙', at: [12.63, 41.45], date: '1944-01-22', winner: 'allies', summary: '연합군이 구스타프 선 뒤쪽 안치오에 상륙했으나 독일군에 막혀 넉 달 동안 교두보에 갇혔다.' },
  { name: '몬테카시노 전투', at: [13.81, 41.49], date: '1944-05-18', winner: 'allies', summary: '로마로 가는 길을 막은 구스타프 선의 몬테카시노를 네 번째 공격 끝에 폴란드군이 차지했다. 연합군은 6월 4일 로마에 들어갔다.' },
  { name: '노르망디 상륙 작전', at: [-0.85, 49.37], date: '1944-06-06', winner: 'allies', summary: '미국·영국·캐나다군이 노르망디 해안 다섯 곳(유타·오마하·골드·주노·소드)에 상륙했다. 첫날에만 15만여 명이 땅을 밟았다.' },
  { name: '바그라티온 작전', at: [28.5, 54.0], date: '1944-06-22', winner: 'soviet', summary: '소련군이 벨라루스에서 대공세를 펴 독일 중부 집단군을 무너뜨리고 7월 3일 민스크를 되찾은 뒤 바르샤바 앞 비스와강까지 나아갔다.' },
  { name: '바르샤바 봉기', at: [21.01, 52.23], date: '1944-08-01', winner: 'axis', summary: '폴란드 국내군이 바르샤바에서 봉기했으나 소련군은 비스와강 건너편에 머물렀고, 63일 만인 10월 2일 독일군에 진압되었다.' },
  { name: '마켓 가든 작전', at: [5.90, 51.98], date: '1944-09-17', winner: 'axis', summary: '연합군이 네덜란드의 다리들을 공수 부대로 차지해 라인강을 건너려 했으나 아른험 다리에서 막혔다.' },
  { name: '벌지 전투', at: [5.72, 50.00], date: '1944-12-16', winner: 'allies', summary: '독일군이 아르덴 숲에서 마지막 대반격을 했다. 미군이 바스토뉴를 지켜 냈고, 1945년 1월 말 독일군은 처음 선으로 밀려났다.' },
  { name: '부다페스트 포위전', at: [19.04, 47.50], date: '1944-12-26', winner: 'soviet', summary: '소련군이 부다페스트를 에워쌌다. 페스트는 1945년 1월 18일, 부다는 2월 13일 함락되었다.' },
  { name: '비스와-오데르 공세', at: [21.75, 50.68], date: '1945-01-12', winner: 'soviet', summary: '소련군이 비스와강 교두보에서 공세를 펴 3주 만에 바르샤바(1월 17일)·크라쿠프를 지나 오데르강에 이르렀다.' },
  { name: '베를린 전투', at: [13.40, 52.52], date: '1945-04-16', winner: 'soviet', summary: '소련군이 오데르강의 젤로 고지를 넘어 베를린을 에워쌌다. 4월 30일 히틀러가 자살하고 5월 2일 베를린 수비대가 항복했다.' },
);

// ── 1940 ────────────────────────────────────────────
SNAPSHOTS.push({
  date: '1940-05-10',
  title: '독일의 서부 공세',
  summary: '4월 9일 덴마크와 노르웨이를 침공한 독일은 5월 10일 네덜란드·벨기에·룩셈부르크로 쳐들어가 서부 공세를 시작했습니다. 같은 날 영국에서는 처칠이 총리가 되었습니다. 3월에는 소련과 싸운 핀란드가 모스크바 강화 조약으로 카렐리야 지협 등을 내주었습니다. 이탈리아는 아직 참전 전이었습니다.',
  comment: ['노르웨이는 독일군이 남·중부(모셰엔 남쪽까지)와 나르비크를 쥐고 북부는 노르웨이·연합군. 발트 3국과 베사라비아는 아직 소련 땅이 아님(칠하지 않음)'],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia', 'denmark'] },
    { faction: 'allies', entities: ['uk', 'france', 'france-occupied', 'netherlands', 'belgium', 'norway'] },
    { faction: 'allies', name: 'west-border', note: '알자스-모젤·룩셈부르크·오이펜-말메디 (1940년 뒤 독일 영토로 그린 곳)', geo: () => G.intersect(T('nazi-germany', 1940), U(T('france', 1939), T('belgium', 1939), T('luxembourg', 1939))) },
    { faction: 'soviet', name: 'ussr', note: '소련 (발트 3국·베사라비아 제외, 3월 모스크바 강화로 얻은 카렐리야 포함)', geo: () => minus(T('soviet-union', 1940), T('estonia', 1939), T('latvia', 1939), T('lithuania', 1939), T('romania', 1939)) },
    { faction: 'axis', name: 'norway', note: '독일군이 쥔 남·중부 노르웨이', geo: () => G.intersect(side(P.norway400510, [[14.6, 57.5], [4.0, 57.5], [4.0, 65.5]]), T('norway', 1940)) },
    { faction: 'axis', name: 'narvik', note: '나르비크의 독일군 지역', geo: () => G.intersect(poly(W(P.narvik400510)), T('norway', 1940)) },
    ...northAfrica('1940-05-10'),
  ],
  arrows: [
    { faction: 'axis', path: [[7.0, 52.05], [6.0, 52.0], [5.0, 51.95]], label: 'B 집단군 (네덜란드)' },
    { faction: 'axis', path: [[6.4, 50.85], [5.6, 50.8], [4.7, 50.85]], label: 'B 집단군 (벨기에)' },
    { faction: 'axis', path: [[6.6, 50.1], [5.6, 49.85], [4.95, 49.7]], label: 'A 집단군 (아르덴)' },
    { faction: 'axis', path: [[12.32, 64.46], [13.3, 65.5], [13.19, 65.84]], label: '북진 (모셰엔)' },
  ],
  holds: [{ name: '헴네스베르게트 (독일군 상륙)', at: [13.72, 66.22], faction: 'axis' }],
});

SNAPSHOTS.push({
  date: '1940-06-22',
  title: '프랑스의 항복',
  summary: '됭케르크에서 영국·프랑스군이 철수하고(6월 4일) 14일 파리가 함락되자, 프랑스는 6월 22일 콩피에뉴에서 독일과 휴전 협정을 맺었습니다. 북부와 대서양 해안은 독일 점령 지구가 되고, 남부와 식민지는 독일에 협력한 페탱의 비시 정부가 다스렸습니다. 6월 10일 참전한 이탈리아는 알프스 국경의 좁은 땅을 차지했습니다.',
  comment: [
    '점령 지구는 휴전 협정의 경계선(6월 25일 발효). 그날 독일군은 이 선보다 남쪽(리옹·클레르몽페랑·앙굴렘 등)까지 나가 있었으나 7월 초 물러났다',
    '독일에 협력한 비시 정부 땅(남부)과 그 식민지(프랑스령 북아프리카·시리아·레바논)는 추축국 색(운영자 결정 2026-10-12). 소련은 6월 중순 발트 3국을 점령했고 베사라비아는 6월 28일에 차지했다',
  ],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia', 'italy', 'albania', 'denmark', 'norway', 'netherlands', 'belgium', 'france'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', name: 'ussr', note: '소련 (발트 3국 포함, 베사라비아 제외)', geo: () => minus(T('soviet-union', 1940), T('romania', 1939)) },
    {
      faction: 'axis',
      name: 'france-occupied',
      note: '휴전 경계선 북·서쪽의 독일 점령 지구',
      geo: () => G.intersect(side(P.demarcation, [[-1.6, 42.9], [-6.0, 43.6], [-6.0, 50.5], [2.0, 51.5], [8.3, 49.3], [7.0, 47.0], [6.6, 46.4]]), T('france', 1939)),
    },
    ...northAfrica('1940-06-22'),
  ],
  arrows: [
    { faction: 'axis', path: [[5.04, 47.32], [4.84, 45.76], [5.64, 45.29]], label: '클라이스트 기갑 집단' },
    { faction: 'axis', path: [[5.59, 47.45], [6.36, 46.9]], label: '구데리안 (스위스 국경)' },
    { faction: 'axis', path: [[-1.55, 47.22], [-1.03, 45.62]], label: '대서양 해안 남하' },
    { faction: 'axis', path: [[7.61, 43.79], [7.5, 43.78]], label: '이탈리아군 (6월 21일)' },
  ],
  holds: [{ name: '망통 (이탈리아 점령)', at: [7.50, 43.78], faction: 'axis' }],
});

// 채널 제도 (1940-06-30 독일 점령 ~ 1945-05-09)
export const channelIslands = () => G.intersect(poly([[-3.0, 48.9], [-1.9, 48.9], [-1.9, 49.85], [-3.0, 49.85]]), T('uk', 1940));
export const occupiedFrance = () =>
  G.intersect(side(P.demarcation, [[-1.6, 42.9], [-6.0, 43.6], [-6.0, 50.5], [2.0, 51.5], [8.3, 49.3], [7.0, 47.0], [6.6, 46.4]]), T('france', 1939));

SNAPSHOTS.push({
  date: '1940-09-15',
  title: '영국 본토 항공전',
  summary: '프랑스를 무너뜨린 독일은 영국 상륙을 준비하며 7월부터 공군으로 영국을 공격했으나, 9월 15일 큰 공습이 영국 공군에 막혀 제공권을 얻지 못했습니다. 이탈리아군은 9월 13일 리비아에서 이집트로 쳐들어갔습니다. 소련은 6~8월 발트 3국과 베사라비아를 차지했습니다.',
  comment: ['이탈리아군은 이튿날(16일) 시디바라니까지 나아가 멈췄다. 헝가리(11월 20일)·루마니아(11월 23일)는 아직 삼국 동맹에 들기 전이라 칠하지 않는다'],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia', 'italy', 'albania', 'denmark', 'norway', 'netherlands', 'belgium', 'france'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union'] },
    { faction: 'axis', name: 'france-occupied', note: '독일 점령 지구 (휴전 경계선 북·서쪽)', geo: () => occupiedFrance() },
    { faction: 'axis', name: 'channel-islands', note: '채널 제도 (6월 30일 독일 점령)', geo: () => channelIslands() },
    ...northAfrica('1940-09-15'),
  ],
  arrows: [
    { faction: 'axis', path: [[2.2, 50.7], [0.8, 51.2], [-0.1, 51.5]], label: '독일 공군의 런던 공습' },
    { faction: 'axis', path: [[25.03, 31.6], [25.58, 31.58], [25.93, 31.62]], label: '이탈리아 제10군 (시디바라니)' },
  ],
});

// ── 1941 ────────────────────────────────────────────
const AXIS_1941 = ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia', 'italy', 'albania', 'denmark', 'norway', 'netherlands', 'belgium',
  'hungary', 'romania', 'bulgaria', 'croatia-ndh', 'serbia-occupied', 'montenegro-occupied', 'greece', 'finland', 'france'];
SNAPSHOTS.push({
  date: '1941-06-22',
  title: '독소 전쟁의 시작',
  summary: '독일은 4월 유고슬라비아와 그리스를 점령하고 5월 크레타섬까지 차지해 발칸반도를 손에 넣었습니다. 6월 22일 독일과 동맹국 군대가 불가침 조약을 깨고 세 갈래로 소련을 침공했습니다(바르바로사 작전). 북아프리카에서는 롬멜의 독일군이 토브루크를 에워싸고 이집트 국경까지 나아갔습니다.',
  comment: ['소련은 1941년 6월 22일 국경(저장소 1940년 영토). 핀란드는 25일 참전했으나 독일군이 머물던 동맹국이라 추축국에 넣는다'],
  areas: [
    { faction: 'axis', entities: AXIS_1941 },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', name: 'ussr', note: '소련 (6월 22일 국경)', geo: () => T('soviet-union', 1940) },
    { faction: 'axis', name: 'france-occupied', note: '독일 점령 지구', geo: () => occupiedFrance() },
    { faction: 'axis', name: 'channel-islands', note: '채널 제도', geo: () => channelIslands() },
    ...northAfrica('1941-06-22'),
  ],
  arrows: [
    { faction: 'axis', path: [[21.6, 55.1], [24.0, 56.6], [27.5, 58.2], [30.0, 59.6]], label: '북부 집단군 (레닌그라드)' },
    { faction: 'axis', path: [[23.6, 52.6], [27.5, 53.9], [32.0, 54.8], [37.0, 55.7]], label: '중부 집단군 (모스크바)' },
    { faction: 'axis', path: [[24.0, 50.6], [27.0, 50.2], [30.3, 50.4]], label: '남부 집단군 (키이우)' },
    { faction: 'axis', path: [[27.6, 47.3], [29.2, 46.9], [30.6, 46.5]], label: '루마니아군 (오데사)' },
  ],
});
