// 1944~1945 스냅샷. 진영 본토(entities)를 깔고, 전선 경유점으로 만든 다각형(world-war-2/europe/*.geojson)을 차례로 덮는다
import { G, P as poly } from '../../engine.mjs';
import { P } from './fronts.mjs';
import { SNAPSHOTS, T, U, minus, clean, side, W, northAfrica, channelIslands } from './spec.mjs';
import { finnishFront } from './spec41.mjs';

const ussr = (y) => U(T('soviet-union', y), T('soviet-occupied', y));
// 스렘 전선 동쪽(해방된 스렘 동부)을 뺀 크로아티아 독립국
const ndhWest = (front) => minus(T('croatia-ndh', 1944), poly([...front, [19.6, 46.2], [21, 45.5], [20.5, 44.0], [19.3, 44.3]]));
// 1945-02-04 서부 전선: 12월 선에 블랙콕 작전(1945-01-14~26, 루르몬트 삼각지 → 루르강)과 북알자스 모데르강 선을 바꿔 붙임
const westFeb45 = () => {
  const w = P.west441216;
  const venlo = w.findIndex((p) => p[0] === 6.15 && p[1] === 51.37);
  const linnich = w.findIndex((p) => p[0] === 'Linnich');
  const forbach = w.findIndex((p) => p[0] === 6.90 && p[1] === 49.19);
  return [...w.slice(0, venlo + 1), [5.95, 51.2], [6.05, 51.13], [6.15, 51.06], [6.2, 51.0], ...w.slice(linnich, forbach), ...P.westAlsace450204];
};
const geo = (faction, name, note, fn) => ({ faction, name, note, geo: fn });
const pocket = (faction, name, note, pts, y, within) => geo(faction, name, note, () => (within ? G.intersect(poly(W(pts)), within()) : clean(poly(W(pts)), y)));
// 핀란드가 1941~1944년 쥔 땅: 저장소의 1943년 핀란드 영토와 핀란드 점령 동카렐리야 항목
const finnishHeld = () => U(T('finland', 1943), T('karelia-occupied', 1943));
// 소련 쪽 다각형을 닫는 꼭짓점 (흑해 동쪽 → 캅카스 → 우랄 동쪽 → 바렌츠해 → 카렐리야). 핀란드·노르웨이·중립국은 뺀다
const EAST_FAR = [[33, 44.5], [42, 42.5], [60, 42], [60, 72], [36, 72], [31.5, 70], [29.3, 61.0]];
const ITALY_SEA = [[19.5, 40.5], [16, 35.0], [7.5, 35.0], [7.5, 38]]; // 람페두사·판텔레리아까지 덮음
const italyLand = () => U(T('italy', 1939), T('france', 1939));
const atlanticPockets = (date, list) =>
  list.map((k) => pocket('axis', `pocket-${k}`, { dunkirk: '됭케르크', lorient: '로리앙', stnazaire: '생나제르', larochelle: '라로셸·레섬', royan: '루아양·푸앵트드그라브', brest: '브레스트' }[k] + ' 독일군 거점', P[k], 1944, () => T('france', 1939)));
const creteWest = () => pocket('axis', 'crete-west', '크레타 서부 하니아 일대 독일군 (1945년 5월 항복)', [[23.5, 35.15], [24.4, 35.15], [24.4, 35.7], [23.5, 35.7]], 1944, () => T('greece', 1944));
const dodecanese = () => pocket('axis', 'dodecanese', '도데카네스 제도 독일군 (1945년 5월 항복)', [[26.3, 35.3], [28.4, 35.3], [28.4, 36.7], [27.6, 37.0], [26.6, 37.6], [26.3, 37.0]], 1944, () => T('italy', 1939));
const finnmarkSoviet = () => geo('soviet', 'finnmark', '소련군이 해방한 동핀마르크 (1944년 10월 키르케네스)', () => G.intersect(poly([[28.4, 68.8], [32, 68.8], [32, 71.5], [28.4, 71.5]]), T('norway', 1944)));
// 1945년에는 나치 독일 항목이 없으므로(독일 점령 지구들로 바뀜) 1944년의 독일·보호령·위성국 영토를 추축국 본토로 깐다
const reich44 = () => geo('axis', 'reich-1944', '독일과 보호령·위성국 (1944년 영토)', () =>
  U(T('nazi-germany', 1944), T('bohemia-moravia', 1944), T('slovakia', 1944), T('hungary', 1944), T('croatia-ndh', 1944), T('general-government', 1944), T('poland', 1944)));

// ── 1944-06-06 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1944-06-06',
  title: '노르망디 상륙 작전',
  summary: '6월 6일 아이젠하워가 이끄는 미국·영국·캐나다군이 프랑스 노르망디 해안에 상륙했습니다(오버로드 작전). 이틀 전 이탈리아에서는 연합군이 로마를 해방했고, 동부 전선의 소련군은 우크라이나와 크림반도를 되찾아 루마니아 국경을 넘었습니다.',
  comment: ['노르망디는 그날 해 질 무렵의 교두보. 핀란드 쪽은 1941~1944년 고정된 전선(저장소의 핀란드 점령 동카렐리야 항목)'],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'poland', 'bohemia-moravia', 'slovakia', 'hungary', 'romania', 'bulgaria', 'croatia-ndh', 'yugoslavia', 'greece', 'albania', 'italy', 'italy-occupied', 'france', 'denmark', 'norway', 'netherlands', 'belgium', 'luxembourg'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied'] },
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (나르바 → 드네스트르 리만)', () => clean(side(P.east440606, [[29.9, 45.0], [24, 44.3], [16, 46.5], [13.5, 54.6], [19.5, 56.5], [20.8, 59.85], [27.5, 59.85]]), 1944)),
    geo('soviet', 'east-soviet', '동부 전선의 소련 쪽 (루마니아 북동부 포함)', () => clean(side(P.east440606, [...EAST_FAR, [29.0, 60.1]]), 1944, ['finland', 'norway'])),
    finnishFront(1944),
    geo('allies', 'italy-south', '이탈리아 남부와 사르데냐·코르시카 (로마 해방 6월 4일)', () =>
      G.intersect(side(P.italy440606, [...ITALY_SEA, [7.5, 43.2], [9.8, 43.15], [10.0, 42.5]]), italyLand())),
    geo('allies', 'normandy', '노르망디 교두보 (6월 6일 해 질 무렵)', () => U(...[P.utah, P.omaha, P.goldJunoSword].map((p) => poly(W(p))))),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    ...northAfrica('1944-06-06'),
  ],
  arrows: [
    { faction: 'allies', path: [[-1.0, 50.4], [-0.9, 49.75], [-0.75, 49.4]], label: '오버로드 작전 (상륙)' },
    { faction: 'allies', path: [[-1.6, 49.9], [-1.25, 49.45]], label: '유타 해안 (미군)' },
    { faction: 'allies', path: [[12.5, 41.9], [12.15, 42.05], [11.8, 42.09]], label: '미 제5군 (치비타베키아)' },
  ],
});

// ── 1944-08-25 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1944-08-25',
  title: '파리 해방',
  summary: '노르망디에서 빠져나온 연합군이 8월 25일 파리를 해방했고, 15일에는 남프랑스에도 상륙했습니다. 루아르강 남쪽에서는 독일군이 물러나던 중이었습니다. 소련군은 6월 22일부터 바그라티온 작전으로 독일 중부 집단군을 무너뜨려 바르샤바 앞 비스와강에 이르렀고, 8월 23일 루마니아가 편을 바꾸었습니다.',
  comment: [
    '프랑스: 북서부는 센강·루아르강 선, 남동부는 드라군 작전 지역. 루아르강 남쪽과 론강 서쪽은 독일군이 철수하던 중이라 독일 쪽으로 남겨 두었다(툴루즈·리모주 등은 이미 레지스탕스가 해방)',
    '루마니아는 23일 편을 바꾸어 소련 진영으로 칠한다. 바르샤바에서는 8월 1일부터 국내군이 봉기 중',
  ],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'poland', 'bohemia-moravia', 'slovakia', 'hungary', 'bulgaria', 'croatia-ndh', 'yugoslavia', 'greece', 'albania', 'italy', 'italy-occupied', 'france', 'denmark', 'norway', 'netherlands', 'belgium', 'luxembourg'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied'] },
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (시니메 → 카르파티아)', () => clean(side(P.east440825, [[25.5, 47.3], [22, 45.5], [16, 46.5], [13.5, 54.6], [19.5, 56.5], [20.8, 59.85], [27.5, 59.8]]), 1944)),
    geo('soviet', 'east-soviet', '동부 전선의 소련 쪽', () => clean(side(P.east440825, [[27.5, 46.5], ...EAST_FAR, [28.6, 60.0]]), 1944, ['finland', 'norway'])),
    geo('soviet', 'romania', '편을 바꾼 루마니아 (8월 23일)', () => T('romania', 1941)),
    geo('axis', 'n-transylvania', '헝가리가 쥔 북트란실바니아 (1940년 2차 빈 중재)', () => G.intersect(T('hungary', 1941), T('romania', 1939))),
    geo('axis', 'finland-front', '핀란드군이 쥔 지역 (비보르크 공세 뒤의 선)', () =>
      G.intersect(finnishHeld(), side(P.finland4408, [[31.6, 70.5], [20, 70.5], [20, 59.5], [28.0, 60.2]]))),
    geo('allies', 'france-nw', '연합군이 해방한 프랑스 북서부 (센강·루아르강 선)', () =>
      G.intersect(side(P.france440825, [[-6, 47], [-6, 50.5], [0.15, 49.9]]), T('france', 1939))),
    geo('allies', 'dragoon', '드라군 작전으로 해방한 남프랑스', () => G.intersect(poly(W(P.dragoon440825)), T('france', 1939))),
    ...atlanticPockets('1944-08-25', ['brest', 'lorient', 'stnazaire']),
    geo('allies', 'italy-south', '이탈리아 남·중부 (아르노강 선)', () => G.intersect(side(P.italy440825, [...ITALY_SEA, [7.5, 43.6], [9.9, 43.7]]), italyLand())),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    ...northAfrica('1944-08-25'),
  ],
  arrows: [
    { faction: 'allies', path: [[2.4, 48.6], [3.3, 48.3], [4.08, 48.3], [4.58, 48.73]], label: '패튼의 미 제3군' },
    { faction: 'allies', path: [[1.48, 49.09], [1.9, 49.5], [2.3, 49.89]], label: '영국·캐나다군 센강 도하' },
    { faction: 'allies', path: [[6.4, 43.3], [5.94, 44.2], [4.9, 44.6]], label: '드라군 작전 (남프랑스)' },
    { faction: 'soviet', path: [[27.59, 47.16], [27.67, 46.23], [27.18, 45.7]], label: '야시-키시너우 공세' },
  ],
  holds: [{ name: '바르샤바 봉기 (8월 1일~10월 2일)', at: [21.01, 52.23], faction: 'allies' }],
});

// ── 1944-12-16 ──────────────────────────────────────
const dalmatia = () => geo('allies', 'dalmatia', '파르티잔이 해방한 달마티아 해안 (스플리트 10월 26일, 크닌 12월 4일)', () =>
  G.intersect(poly([[14.8, 44.0], [15.1, 44.3], [15.7, 44.25], [16.2, 44.0], [16.6, 43.7], [17.2, 43.4], [17.6, 43.1], [18.2, 42.9], [18.5, 42.5], [18.3, 42.3], [16.0, 42.8]]), U(T('croatia-ndh', 1944), T('italy', 1939))));
SNAPSHOTS.push({
  date: '1944-12-16',
  title: '벌지 전투',
  summary: '가을에 독일 국경까지 밀린 독일군은 12월 16일 아르덴 숲에서 마지막 대반격을 시작했습니다(벌지 전투). 동쪽에서는 소련군이 루마니아·불가리아를 거쳐 베오그라드를 해방하고(10월 20일) 부다페스트를 에워싸기 시작했으며, 핀란드는 9월 소련과 휴전했습니다.',
  comment: [
    '서부 전선은 벌지 전투 첫날 선(Cole 『The Ardennes』 4장). 핀란드는 휴전 뒤라 칠하지 않는다(라플란드의 독일군은 노르웨이로 물러나는 중)',
    '유고슬라비아는 파르티잔이 해방한 지역을 연합국, 크로아티아 독립국과 독일군 지역을 추축국으로 칠한다(보스니아의 경계는 대략)',
  ],
  areas: [
    { faction: 'axis', entities: ['nazi-germany', 'general-government', 'poland', 'bohemia-moravia', 'slovakia', 'hungary', 'croatia-ndh', 'italy-occupied', 'denmark', 'norway', 'netherlands'] },
    { faction: 'allies', entities: ['uk', 'france', 'belgium', 'luxembourg', 'italy', 'greece', 'albania', 'yugoslavia'] },
    dalmatia(),
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied', 'romania', 'bulgaria'] },
    geo('allies', 'west', '서부 전선의 연합군 쪽 (북해 → 스위스)', () => clean(side(P.west441216, [[7.0, 47.0], [-6, 43], [-6, 52], [3.3, 52.0]]), 1944)),
    pocket('axis', 'colmar', '콜마르 포위지 (독일군)', P.colmar441216, 1944, () => T('france', 1939)),
    ...atlanticPockets('1944-12-16', ['dunkirk', 'lorient', 'stnazaire', 'larochelle', 'royan']),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    geo('soviet', 'east-soviet', '동부 전선의 소련 쪽 (쿠르스키 석호 → 사바강)', () =>
      clean(side(P.east441216, [[19.4, 44.85], [19.8, 44.6], [20.2, 44.5], [22.7, 44.6], [29.8, 44.8], ...EAST_FAR, [27, 59.9], [21.3, 57.9], [20.6, 55.6]]), 1944, ['finland', 'norway'])),
    geo('allies', 'yugoslavia', '파르티잔이 해방한 유고슬라비아 (스렘 동부·보이보디나 포함)', () => T('yugoslavia', 1944)),
    pocket('axis', 'courland', '쿠를란트 포위지', P.courland, 1944, () => ussr(1944)),
    pocket('axis', 'memel', '메멜 교두보', P.memel, 1944, () => U(ussr(1944), T('nazi-germany', 1944))),
    finnmarkSoviet(),
    creteWest(),
    dodecanese(),
    geo('allies', 'italy-south', '이탈리아 남·중부 (고딕 선 겨울 선)', () => G.intersect(side(P.italy441216, [...ITALY_SEA, [7.5, 43.6], [9.9, 43.9]]), italyLand())),
    ...northAfrica('1944-12-16'),
  ],
  arrows: [
    { faction: 'axis', path: [[6.34, 50.4], [6.03, 50.43], [5.57, 50.63]], label: '독일 제6 친위 기갑군' },
    { faction: 'axis', path: [[6.13, 50.05], [5.72, 50.0], [4.91, 50.26]], label: '독일 제5 기갑군 (뫼즈강)' },
    { faction: 'soviet', path: [[18.95, 48.07], [18.85, 47.9], [18.74, 47.79]], label: '부다페스트 북쪽 포위' },
    { faction: 'soviet', path: [[18.6, 47.2], [18.64, 47.49], [18.74, 47.79]], label: '부다페스트 남쪽 포위' },
  ],
});

// ── 1945-02-04 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1945-02-04',
  title: '얄타 회담',
  summary: '1월 소련군이 비스와강에서 오데르강까지 밀고 나가 베를린을 70km 앞에 두었고, 서부 전선에서는 벌지의 독일군이 밀려났습니다. 2월 4일 크림반도의 얄타에서 루스벨트·처칠·스탈린이 독일 분할 점령과 전후 처리를 논의했습니다.',
  comment: ['1945년 지도에는 나치 독일 항목이 없어(독일 점령 지구로 바뀜) 1944년의 독일·위성국 영토를 추축국 본토로 깐다. 부다는 2월 13일까지 포위된 채 버텼다'],
  areas: [
    reich44(),
    { faction: 'axis', entities: ['denmark', 'norway', 'netherlands'] },
    { faction: 'allies', entities: ['uk', 'france', 'belgium', 'luxembourg', 'italy', 'greece', 'albania', 'yugoslavia'] },
    { faction: 'soviet', entities: ['soviet-union', 'romania', 'bulgaria'] },
    geo('axis', 'italy-north', '독일군이 쥔 이탈리아 북부', () => T('italy-occupied', 1944)),
    geo('allies', 'west', '서부 전선의 연합군 쪽 (벌지 해소 뒤)', () =>
      clean(side(westFeb45(), [[7.0, 47.0], [-6, 43], [-6, 52], [3.3, 52.0]]), 1945)),
    pocket('axis', 'colmar', '콜마르 포위지 잔여 (2월 9일 소멸)', P.colmar450204, 1945, () => T('france', 1939)),
    ...atlanticPockets('1945-02-04', ['dunkirk', 'lorient', 'stnazaire', 'larochelle', 'royan']),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    geo('soviet', 'east-soviet', '동부 전선의 소련 쪽 (프리셰스 하프 → 사바강)', () =>
      clean(side(P.east450204, [[19.4, 44.85], [19.8, 44.6], [20.2, 44.5], [22.7, 44.6], [29.8, 44.8], ...EAST_FAR, [27, 59.9], [21.3, 57.9], [20.9, 55.6], [20.5, 54.95], [19.9, 54.6]]), 1945, ['finland', 'norway'])),
    geo('allies', 'yugoslavia', '파르티잔이 해방한 유고슬라비아 (스렘 동부·보이보디나 포함)', () => T('yugoslavia', 1945)),
    geo('axis', 'ndh', '크로아티아 독립국·독일군 지역', () =>
      ndhWest([[19.21, 44.99], [19.15, 45.17], [18.92, 45.55]])),
    geo('axis', 'slovenia', '독일·이탈리아가 병합했던 슬로베니아 (1945년 5월까지 독일군)', () =>
      minus(G.intersect(T('yugoslavia', 1938), poly([[13.3, 45.4], [13.3, 46.8], [16.7, 46.95], [17.1, 46.6], [16.95, 46.25], [15.7, 45.8], [15.2, 45.4]])), T('croatia-ndh', 1944))),
    dalmatia(),
    pocket('axis', 'courland', '쿠를란트 포위지', P.courland, 1945, () => ussr(1945)),
    pocket('axis', 'samland', '잠란트 (필라우)', P.samland, 1945, () => U(T('soviet-union', 1945), T('nazi-germany', 1944))),
    pocket('axis', 'koenigsberg', '쾨니히스베르크', P.koenigsberg, 1945, () => U(T('soviet-union', 1945), T('nazi-germany', 1944))),
    pocket('axis', 'heiligenbeil', '하일리겐바일 포위지 (독일 제4군)', P.heiligenbeil, 1945, () => U(T('soviet-union', 1945), T('nazi-germany', 1944), T('poland', 1945))),
    pocket('axis', 'buda', '부다 (2월 13일 함락)', P.buda, 1945, () => T('hungary', 1944)),
    pocket('axis', 'poznan', '포즈난 요새 (1월 24일~2월 23일 포위)', P.poznan, 1945, () => U(T('nazi-germany', 1944), T('poland', 1945))),
    pocket('axis', 'schneidemuehl', '슈나이데뮐 요새 (2월 14일 함락)', P.schneidemuehl, 1945, () => U(T('nazi-germany', 1944), T('poland', 1945))),
    pocket('axis', 'kuestrin', '퀴스트린 요새 (3월 30일 함락)', P.kuestrin, 1945, () => U(T('nazi-germany', 1944), T('poland', 1945))),
    pocket('axis', 'graudenz', '그라우덴츠 요새 (3월 6일 함락)', P.graudenz, 1945, () => U(T('nazi-germany', 1944), T('poland', 1945))),
    pocket('axis', 'glogau', '글로가우 요새 (4월 1일 함락)', P.glogau, 1945, () => U(T('nazi-germany', 1944), T('poland', 1945))),
    finnmarkSoviet(),
    creteWest(),
    dodecanese(),
    geo('allies', 'italy-south', '이탈리아 남·중부 (겨울 선)', () => G.intersect(side(P.italy450204, [...ITALY_SEA, [7.5, 43.6], [9.9, 43.9]]), italyLand())),
    ...northAfrica('1945-02-04'),
  ],
  arrows: [
    { faction: 'soviet', path: [[21.37, 51.78], [19.46, 51.76], [16.93, 52.41], [14.44, 52.67]], label: '제1 벨라루스 전선군 (오데르강)' },
    { faction: 'soviet', path: [[21.5, 50.55], [20.63, 50.87], [19.12, 50.81], [16.42, 51.4]], label: '제1 우크라이나 전선군' },
    { faction: 'soviet', path: [[21.4, 52.88], [20.38, 53.11], [19.53, 54.32]], label: '제2 벨라루스 전선군' },
  ],
  holds: [{ name: '얄타 회담', at: [34.16, 44.50], faction: 'soviet' }],
});

// ── 1945-04-25 ──────────────────────────────────────
const yugoAxis45 = (pts) => geo('axis', 'yugo-axis', '독일군·크로아티아군이 아직 쥔 유고슬라비아 북서부', () => G.intersect(poly(pts), U(T('yugoslavia', 1938), T('italy', 1939))));
SNAPSHOTS.push({
  date: '1945-04-25',
  title: '엘베강의 만남',
  summary: '소련군이 베를린을 에워싸고 시가전을 벌이던 4월 25일, 미군과 소련군이 엘베강 가의 토르가우에서 만나 독일이 남북으로 갈라졌습니다. 이탈리아 북부에서는 연합군의 진격과 파르티잔 봉기로 독일군이 무너졌습니다.',
  comment: ['베를린·할베·브레슬라우와 쿠를란트·헬반도·비스와강 삼각주, 대서양 거점은 독일군이 쥔 포위지. 홀란트(네덜란드 서부)도 독일군'],
  areas: [
    reich44(),
    { faction: 'axis', entities: ['denmark', 'norway', 'netherlands'] },
    { faction: 'allies', entities: ['uk', 'france', 'belgium', 'luxembourg', 'italy', 'greece', 'albania', 'yugoslavia'] },
    { faction: 'soviet', entities: ['soviet-union', 'romania', 'bulgaria'] },
    geo('axis', 'italy-north', '독일군이 쥔 이탈리아 북부', () => T('italy-occupied', 1944)),
    geo('soviet', 'east-soviet', '동부 전선의 소련 쪽 (슈비네뮌데 → 슬라보니아)', () =>
      clean(side(P.east450425, [[20.5, 44.2], [22.7, 44.6], [29.8, 44.8], ...EAST_FAR, [27, 59.9], [21.3, 57.9], [20.9, 55.6], [16.0, 55.5], [15.6, 54.6]]), 1945, ['finland', 'norway'])),
    geo('allies', 'yugoslavia', '파르티잔이 해방한 유고슬라비아', () => T('yugoslavia', 1945)),
    geo('allies', 'west', '서방 연합군 진출선의 서쪽', () => clean(side(P.west450425, [[8.5, 47.3], [-6, 43], [-6, 58], [6.0, 54.5]]), 1945)),
    pocket('axis', 'holland', '홀란트 요새 (독일군)', P.hollandFortress, 1945, () => T('netherlands', 1945)),
    pocket('axis', 'berlin', '베를린 (포위된 독일군)', P.berlin450425, 1945, () => T('nazi-germany', 1944)),
    pocket('axis', 'halbe', '할베 포위지 (독일 제9군)', P.halbe, 1945, () => T('nazi-germany', 1944)),
    pocket('axis', 'breslau', '브레슬라우 요새', P.breslau, 1945, () => T('nazi-germany', 1944)),
    pocket('axis', 'courland', '쿠를란트 포위지', P.courland, 1945, () => ussr(1945)),
    pocket('axis', 'hel', '헬반도', P.hel, 1945, () => T('nazi-germany', 1944)),
    pocket('axis', 'vistula-delta', '비스와강 삼각주·프리셰 네룽', P.vistulaDelta, 1945, () => U(T('nazi-germany', 1944), T('soviet-union', 1945), T('poland', 1945))),
    ...atlanticPockets('1945-04-25', ['dunkirk', 'lorient', 'stnazaire', 'larochelle']),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    yugoAxis45([[13.4, 45.65], [13.5, 44.9], [14.44, 45.25], [15.0, 45.15], [15.55, 45.49], [16.37, 45.48], [17.38, 45.26], [16.50, 46.30], [16.0, 46.7], [13.7, 46.55]]),
    finnmarkSoviet(),
    creteWest(),
    dodecanese(),
    geo('allies', 'italy-south', '연합군·파르티잔이 해방한 이탈리아 (포강 북쪽까지)', () => G.intersect(side(P.italy450425, [...ITALY_SEA, [7.5, 43.8]]), italyLand())),
    ...northAfrica('1945-04-25'),
  ],
  arrows: [
    { faction: 'soviet', path: [[14.38, 52.53], [13.9, 52.52], [13.4, 52.52]], label: '제1 벨라루스 전선군 (베를린)' },
    { faction: 'soviet', path: [[14.65, 51.74], [13.45, 52.22], [12.85, 52.48]], label: '제1 우크라이나 전선군' },
    { faction: 'allies', path: [[12.4, 51.4], [12.75, 51.5], [13.0, 51.56]], label: '미 제1군 (토르가우)' },
    { faction: 'allies', path: [[11.0, 48.6], [11.4, 48.3], [11.58, 48.14]], label: '미 제7군 (뮌헨)' },
  ],
  holds: [{ name: '토르가우 (미·소 연결)', at: [13.0, 51.56], faction: 'allies' }],
});

// ── 1945-05-08 ──────────────────────────────────────
const contactNorth = P.contact450508.slice(0, P.contact450508.findIndex((p) => p[0] === 'Grimma') + 1);
SNAPSHOTS.push({
  date: '1945-05-08',
  title: '독일의 항복',
  summary: '4월 30일 히틀러가 베를린의 지하 벙커에서 자살하고 5월 2일 베를린이 함락되었습니다. 독일은 5월 7일 랭스에서, 8일 베를린에서 무조건 항복 문서에 서명해 유럽의 전쟁이 끝났습니다. 지도는 항복할 때 서방 연합군과 소련군이 차지한 지역입니다.',
  comment: [
    '추축국으로 남은 곳은 항복할 때까지 독일군이 쥐던 지역(노르웨이, 보헤미아의 중부 집단군, 쿠를란트, 대서양 거점 등). 네덜란드·덴마크의 독일군은 5월 5일 항복',
    '보헤미아의 미군 정지선(카를로비바리~플젠~체스케부데요비체)은 합의된 선으로, 그 동쪽은 소련군이 닿기 전이었다(프라하는 5월 9일)',
  ],
  areas: [
    reich44(),
    { faction: 'axis', entities: ['norway'] },
    { faction: 'allies', entities: ['uk', 'france', 'belgium', 'luxembourg', 'netherlands', 'denmark', 'italy', 'greece', 'albania', 'yugoslavia'] },
    { faction: 'soviet', entities: ['soviet-union', 'romania', 'bulgaria'] },
    geo('allies', 'west', '서방 연합군이 차지한 지역 (소련군과의 접촉선 서쪽)', () =>
      clean(side(P.contact450508, [[13.5, 45.6], [12.4, 44.5], [7.0, 43.5], [-6, 43], [-6, 60], [8.0, 57.9], [11.2, 56.5], [12.8, 55.6], [11.5, 54.4]]), 1945, ['norway'])),
    geo('allies', 'italy', '이탈리아 (4월 29일 카세르타 항복, 5월 2일 발효)', () => T('italy', 1939)),
    geo('soviet', 'east-soviet', '소련군이 차지한 지역', () =>
      clean(side([...contactNorth, ...P.soviet450508.slice(1)], [[18.9, 45.9], [22.7, 44.6], [29.8, 44.8], ...EAST_FAR, [27, 59.9], [21.3, 57.9], [20.9, 55.6], [16.0, 55.5], [14.0, 55.0], [11.8, 54.5]]), 1945, ['finland', 'norway'])),
    yugoAxis45([[13.6, 46.55], [13.7, 45.85], [14.5, 45.55], [15.6, 45.65], [16.3, 45.75], [16.4, 46.35], [15.0, 46.65]]),
    pocket('axis', 'courland', '쿠를란트 포위지 (5월 10일 항복)', P.courland, 1945, () => ussr(1945)),
    pocket('axis', 'hel', '헬반도', P.hel, 1945, () => T('nazi-germany', 1944)),
    pocket('axis', 'vistula-delta', '비스와강 삼각주·프리셰 네룽', P.vistulaDelta, 1945, () => U(T('nazi-germany', 1944), T('soviet-union', 1945), T('poland', 1945))),
    pocket('axis', 'bornholm', '보른홀름섬 (5월 9일 소련군 상륙)', [[14.6, 54.95], [15.3, 54.95], [15.3, 55.35], [14.6, 55.35]], 1945, () => T('denmark', 1945)),
    ...atlanticPockets('1945-05-08', ['dunkirk', 'lorient', 'stnazaire', 'larochelle']),
    geo('axis', 'channel-islands', '채널 제도 (5월 9일 해방)', channelIslands),
    finnmarkSoviet(),
    creteWest(),
    dodecanese(),
    ...northAfrica('1945-05-08'),
  ],
  arrows: [
    { faction: 'soviet', path: [[13.74, 51.05], [13.83, 50.64], [14.42, 50.08]], label: '프라하 공세 (5월 9일)' },
    { faction: 'soviet', path: [[16.37, 48.21], [15.63, 48.2], [14.87, 48.12]], label: '제3 우크라이나 전선군' },
  ],
  holds: [
    { name: '베를린 (5월 2일 함락)', at: [13.40, 52.52], faction: 'soviet' },
    { name: '프라하 봉기 (5월 5일~)', at: [14.42, 50.09], faction: 'allies' },
  ],
});
