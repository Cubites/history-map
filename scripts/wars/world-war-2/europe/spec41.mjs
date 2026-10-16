// 1941-12 ~ 1943-09 스냅샷 (동부 전선 경유점은 fronts41.mjs)
import { G, P as poly } from '../../engine.mjs';
import { P } from './fronts.mjs';
import { SNAPSHOTS, T, U, clean, side, W, northAfrica, channelIslands, occupiedFrance } from './spec.mjs';

const geo = (faction, name, note, fn) => ({ faction, name, note, geo: fn });
const ussr = (y) => U(T('soviet-union', y), T('soviet-occupied', y), T('karelia-occupied', y));
// 소련 땅(그 해 소련·독일 점령 소련·핀란드 점령 동카렐리야)과 핀란드 안에서 선의 서쪽
const westOfLine = (line, y, close) => clean(side(line, close), y);
// 핀란드·북극 전선의 서쪽 (핀란드·독일군이 쥔 카렐리야·콜라반도 서부)
export const finnishFront = (y) => geo('axis', 'finland-front', '핀란드·독일군이 쥔 카렐리야와 리차강 서쪽 (1941-12 ~ 1944-06 고정)', () =>
  G.intersect(side(P.finland, [[29.5, 59.95], [20, 59.5], [20, 70.5], [31.2, 70.4]]), U(ussr(y), T('finland', y))));
// 선의 서쪽을 닫는 꼭짓점: 아조프해 → 케르치 해협 → 크림 남쪽 흑해 → 중부 유럽 → 발트해(고틀란드 동쪽) → 핀란드만
const BALTIC = [[16, 46.5], [13.5, 54.6], [19.5, 56.5], [20.8, 59.9]];
const WEST_CLOSE = [[36.62, 45.5], [36.64, 45.35], [36.55, 45.15], [36.4, 44.7], [33, 44.2], [28, 43.5], ...BALTIC, [27.5, 60.25]];
const WEST_CLOSE_43 = [[36.62, 45.5], [36.64, 45.35], [36.55, 45.15], [36.4, 44.7], [33, 44.2], [28, 43.5], ...BALTIC.slice(0, 3), [20.8, 59.85], [29.5, 59.9]];
const AXIS_BASE = ['nazi-germany', 'general-government', 'bohemia-moravia', 'slovakia', 'italy', 'albania', 'denmark', 'norway', 'netherlands', 'belgium',
  'hungary', 'romania', 'bulgaria', 'croatia-ndh', 'serbia-occupied', 'montenegro-occupied', 'greece', 'finland'];
const pocket = (faction, name, note, pts, within) => geo(faction, name, note, () => G.intersect(poly(W(pts)), within()));

// ── 1941-12-05 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1941-12-05',
  title: '모스크바 앞에서 멈춘 독일군',
  summary: '독일군은 레닌그라드를 에워싸고 우크라이나를 차지한 뒤 모스크바를 30km 앞에 두었으나, 추위와 소련군의 저항에 막혀 멈춰 섰습니다. 12월 5일 소련군이 모스크바 앞에서 반격을 시작했고, 이틀 뒤 일본의 진주만 공격으로 미국이 참전했습니다. 북아프리카에서는 영국군의 크루세이더 작전으로 토브루크 포위가 풀려 갔습니다.',
  comment: ['레닌그라드·오라니엔바움·세바스토폴은 에워싸인 소련군 지역. 툴라는 세 면이 포위된 채 소련군이 지켰다'],
  areas: [
    { faction: 'axis', entities: [...AXIS_BASE, 'france'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied', 'karelia-occupied'] },
    geo('axis', 'france-occupied', '독일 점령 지구', occupiedFrance),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (라도가호 → 타간로크만)', () => westOfLine(P.east411205, 1941, WEST_CLOSE)),
    finnishFront(1941),
    pocket('soviet', 'leningrad', '포위된 레닌그라드', P.leningrad, () => ussr(1941)),
    pocket('soviet', 'tula', '세 면이 포위된 채 소련군이 지킨 툴라', P.tula, () => ussr(1941)),
    pocket('soviet', 'oranienbaum', '오라니엔바움 교두보', P.oranienbaum, () => ussr(1941)),
    pocket('soviet', 'sevastopol', '포위된 세바스토폴', P.sevastopol, () => ussr(1941)),
    ...northAfrica('1941-12-05'),
  ],
  arrows: [
    { faction: 'soviet', path: [[36.05, 56.75], [35.92, 56.86]], label: '칼리닌 전선군 반격' },
    { faction: 'soviet', path: [[37.48, 56.28], [36.73, 56.33], [35.96, 56.03]], label: '클린-솔네치노고르스크 작전' },
    { faction: 'soviet', path: [[38.15, 54.83], [38.22, 54.58], [38.27, 54.35], [38.27, 54.03]], label: '툴라 반격' },
    { faction: 'soviet', path: [[33.70, 59.75], [33.54, 59.64], [32.45, 59.29]], label: '티흐빈 탈환 (12월 9일)' },
    { faction: 'allies', path: [[24.95, 31.4], [24.5, 31.8], [24.08, 31.99]], label: '크루세이더 작전' },
  ],
  holds: [{ name: '툴라 (세 면이 포위됨)', at: [37.62, 54.20], faction: 'soviet' }],
});

// ── 1942-11-19 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1942-11-19',
  title: '스탈린그라드 반격',
  summary: '1942년 여름 캅카스 유전과 스탈린그라드를 노린 독일군의 공세로 추축국의 점령지가 가장 넓어졌습니다. 11월 4일 영국군이 엘알라메인에서 이기고 8일 미국·영국군이 모로코·알제리에 상륙하자, 독일은 비시 프랑스 땅도 점령했습니다. 11월 19일 소련군은 스탈린그라드의 독일 제6군을 에워싸는 반격을 시작했습니다(천왕성 작전).',
  comment: ['스탈린그라드 시내는 볼가강 가의 소련 제62군 띠만 남았다. 칼미크 초원과 캅카스 고개 지대는 이어진 전선이 아니라 거점이 흩어진 곳이라 어림(±20~30km)'],
  areas: [
    { faction: 'axis', entities: [...AXIS_BASE, 'france', 'france-occupied', 'france-italian-occupied'] },
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied', 'karelia-occupied'] },
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (라도가호 → 스탈린그라드 → 캅카스)', () => westOfLine(P.east421119, 1942, [[37.0, 44.3], [33, 44.2], [28, 43.5], ...BALTIC, [27.5, 60.25]])),
    finnishFront(1942),
    pocket('soviet', 'leningrad', '포위된 레닌그라드', P.leningrad, () => ussr(1942)),
    pocket('soviet', 'oranienbaum', '오라니엔바움 교두보', P.oranienbaum, () => ussr(1942)),
    geo('soviet', 'stalingrad', '스탈린그라드 시내의 소련군 (제62군·고로호프 집단)', () => G.intersect(U(...P.stalingradStrips.map((p) => poly(p))), ussr(1942))),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    ...northAfrica('1942-11-19'),
  ],
  arrows: [
    { faction: 'soviet', path: [[42.73, 49.58], [42.48, 49.15], [43.53, 48.68]], label: '천왕성 작전 (북쪽)' },
    { faction: 'soviet', path: [[43.06, 49.31], [43.10, 48.95], [43.5, 48.7]], label: '제21·65군' },
    { faction: 'soviet', path: [[44.65, 48.17], [44.13, 48.13], [43.63, 48.60]], label: '천왕성 작전 (남쪽, 11월 20일)' },
    { faction: 'allies', path: [[23.96, 32.08], [22.64, 32.76], [20.08, 32.12]], label: '영국 제8군 추격' },
    { faction: 'allies', path: [[3.06, 36.75], [7.75, 36.9], [9.06, 37.02]], label: '튀니스로 (횃불 작전 뒤)' },
  ],
});

// ── 1943-07-12 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1943-07-12',
  title: '쿠르스크 전투와 시칠리아 상륙',
  summary: '스탈린그라드의 독일 제6군(2월 2일)과 튀니지의 추축군(5월 13일)이 항복해 전세가 연합국 쪽으로 기울었습니다. 7월 5일 독일군이 쿠르스크 돌출부를 공격했으나 12일 프로호로프카 전차전 무렵 막혔고, 같은 날 소련군이 오룔에서 반격에 나섰습니다. 7월 10일에는 미국·영국군이 시칠리아에 상륙했습니다.',
  comment: ['레닌그라드는 1월 이스크라 작전으로 라도가호 남쪽에 좁은 육로가 열려 포위 지역이 아니다(남쪽 포위선은 그대로). 시칠리아 교두보는 대략 ±10km'],
  areas: [
    { faction: 'axis', entities: [...AXIS_BASE, 'france', 'france-occupied'] },
    geo('axis', 'italy-1941', '이탈리아 (1941~1943년 영토, 1943년 영토가 휴전 뒤 모양이라 덮음)', () => U(T('italy', 1941), T('italy-occupied', 1943))),
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied', 'karelia-occupied'] },
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (핀란드만 → 쿠르스크 → 미우스강)', () => westOfLine(P.east430712, 1943, WEST_CLOSE_43)),
    finnishFront(1943),
    pocket('soviet', 'oranienbaum', '오라니엔바움 교두보', P.oranienbaum, () => ussr(1943)),
    pocket('axis', 'kuban', '쿠반 교두보 (푸른 선)', P.kuban, () => ussr(1943)),
    pocket('soviet', 'malaya-zemlya', '말라야 제믈랴 (노보로시스크 남쪽 소련 교두보)', P.malayaZemlya, () => ussr(1943)),
    geo('allies', 'pantelleria', '판텔레리아(6월 11일 항복)·람페두사(6월 12일)', () => G.intersect(U(poly([[11.8, 36.6], [12.2, 36.6], [12.2, 36.95], [11.8, 36.95]]), poly([[12.3, 35.4], [12.75, 35.4], [12.75, 35.65], [12.3, 35.65]])), T('italy', 1939))),
    geo('allies', 'sicily', '시칠리아 연합군 교두보 (7월 12일 무렵)', () => G.intersect(poly(W(P.sicily430712)), T('italy', 1943))),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    ...northAfrica('1943-07-12'),
  ],
  arrows: [
    { faction: 'soviet', path: [[36.73, 51.03], [36.66, 51.02], [36.62, 50.99]], label: '제5 근위 전차군 (프로호로프카)' },
    { faction: 'axis', path: [[36.79, 50.70], [36.83, 50.87], [36.80, 50.95]], label: '독일 제3 기갑 군단' },
    { faction: 'soviet', path: [[35.60, 53.85], [35.54, 53.72], [35.40, 53.10]], label: '쿠투조프 작전 (오룔)' },
    { faction: 'soviet', path: [[37.05, 52.97], [36.57, 53.28], [36.08, 52.97]], label: '브랸스크 전선군' },
    { faction: 'allies', path: [[14.3, 36.5], [14.25, 37.0]], label: '허스키 작전 (시칠리아 상륙)' },
  ],
});

// ── 1943-09-08 ──────────────────────────────────────
SNAPSHOTS.push({
  date: '1943-09-08',
  title: '이탈리아의 항복',
  summary: '무솔리니가 실각한 뒤 이탈리아의 바돌리오 정부는 9월 3일 연합국과 비밀리에 휴전하고 8일 이를 발표했습니다. 독일군은 곧바로 로마와 이탈리아 중·북부를 차지했습니다. 동부 전선에서는 소련군이 하르키우를 되찾고(8월 23일) 이날 돈바스의 스탈리노를 해방하며 드네프르강으로 나아갔습니다.',
  comment: ['연합군은 시칠리아 전체(8월 17일)와 칼라브리아 남부(9월 3일 상륙)를 쥐었다. 이탈리아 본토와 점령지는 아직 독일·이탈리아군 쪽으로 칠한다'],
  areas: [
    { faction: 'axis', entities: [...AXIS_BASE, 'france', 'france-occupied'] },
    geo('axis', 'italy-1941', '이탈리아 (1941~1943년 영토, 1943년 영토가 휴전 뒤 모양이라 덮음)', () => U(T('italy', 1941), T('italy-occupied', 1943))),
    { faction: 'allies', entities: ['uk'] },
    { faction: 'soviet', entities: ['soviet-union', 'soviet-occupied', 'karelia-occupied'] },
    geo('axis', 'east-axis', '동부 전선의 독일 쪽 (스몰렌스크 앞 → 돈바스)', () => westOfLine(P.east430908, 1943, WEST_CLOSE_43)),
    finnishFront(1943),
    pocket('soviet', 'oranienbaum', '오라니엔바움 교두보', P.oranienbaum, () => ussr(1943)),
    pocket('axis', 'kuban', '쿠반 교두보 (푸른 선)', P.kuban, () => ussr(1943)),
    pocket('soviet', 'malaya-zemlya', '말라야 제믈랴', P.malayaZemlya, () => ussr(1943)),
    geo('allies', 'pantelleria', '판텔레리아(6월 11일 항복)·람페두사(6월 12일)', () => G.intersect(U(poly([[11.8, 36.6], [12.2, 36.6], [12.2, 36.95], [11.8, 36.95]]), poly([[12.3, 35.4], [12.75, 35.4], [12.75, 35.65], [12.3, 35.65]])), T('italy', 1939))),
    geo('allies', 'south-italy', '연합군이 차지한 시칠리아와 칼라브리아 남부', () => G.intersect(side(P.italy430908, [[17.5, 38.0], [15.6, 36.4], [12.0, 36.4], [12.0, 38.4], [15.3, 38.4]]), T('italy', 1939))),
    geo('axis', 'channel-islands', '채널 제도', channelIslands),
    ...northAfrica('1943-09-08'),
  ],
  arrows: [
    { faction: 'allies', path: [[15.55, 38.19], [15.65, 38.11], [16.1, 38.6]], label: '베이타운 작전 (칼라브리아)' },
    { faction: 'allies', path: [[14.5, 39.9], [15.0, 40.45]], label: '살레르노 상륙 (9월 9일)' },
    { faction: 'soviet', path: [[33.17, 54.57], [32.6, 54.7], [32.04, 54.78]], label: '스몰렌스크 작전' },
    { faction: 'soviet', path: [[33.20, 51.24], [32.83, 51.18], [31.89, 51.05], [30.5, 50.95]], label: '중앙 전선군 (드네프르강으로)' },
    { faction: 'soviet', path: [[37.80, 48.00], [37.48, 47.60], [37.56, 47.13]], label: '남부 전선군 (마리우폴)' },
  ],
});
