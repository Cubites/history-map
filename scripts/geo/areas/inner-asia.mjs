// 내륙 아시아 권역 (DESIGN.md §5.2, 층 3): 만주·몽골 초원·티베트와 그곳 나라(거란·여진·금·몽골·원 등)의 도형, versions, 빈 땅 채우기 specs, 빈 땅 검사 구역(만주·몽골·알라산·칭하이).
// 짝 entities 파일: data/entities/inner-asia.yaml (33개 = 이 파일 versions의 16개 + 채우기로만 만드는 17개)
// 가져와도 되는 것: lib.mjs, shared.mjs, areas/korea.mjs. 위층 권역(china·west)이 쓰는 도형은 export한다.
// 구획 제목의 '○번 묶음'은 원래 generate-geo.mjs의 조사 묶음(시대)이다. 파일 사이에서 맞물리는 점은 이름으로 가져다 쓴다('값만 같은 점'은 shared.mjs 머리 주석 참고).
import { D, I, P, U, box, bx, polyclip, rev, ring } from '../lib.mjs';
import { AMUR_BAND, CHINA, HEXI, HEXI_W, HUABEI, HUABEI_938, LIAODONG, LIAOXI, LX916, LX923, L_KHITAN_N, L_NORTH, L_WEST, MN_BUIR, MN_TRIPOINT, NORTH_BOX, NORTH_OF_YANYUN, XIXIA, YANYUN, YANYUN_N, YANYUN_REST } from '../shared.mjs';
import { BALHAE_698, BALHAE_719, BALHAE_818, BAND_6JIN, BAND_RIVERS, BOJU, BUYEO, GOGURYEO, G_BIG, KOREA, L_SSANGSEONG_W, L_YALU_TUMEN, NB_1107, NB_1258, NB_1270, NB_1356, NB_926, NB_936, NB_994, NB_994_NB, NINE_NORTH, OKJEO, SILLA_676, SOUTH_OF_RIVERS, noNokdun } from './korea.mjs';

// ── 폴리곤 ─────────────────────────────────────────────────
// 거란(요). 남쪽 끝은 연운 16주 북쪽 끝(shared.mjs의 YANYUN_N), 북쪽 변(L_KHITAN_N)은 흑룡강 띠(AMUR_BAND)의 남쪽 변과 함께 쓴다
const KHITAN = ring([YANYUN_N, [120.8, 42.1], [122.9, 42.3], [123.3, 43.4], [123.2, 44.6], ...L_KHITAN_N, [117.5, 46.5], [115.5, 44.5], [115.5, 42.5]]);

// 그 밖
// 몽골 국경 남서쪽(MN_SW: 에지나 북쪽 (101.0, 42.5) ~ 알타이의 러시아 접점 (87.5, 49.2))과 남동쪽(MN_SE: (101.0, 42.5) ~ 몽골 동쪽 돌출부(할흐골 솜)의 남쪽 (119.62, 46.6)).
// Natural Earth 50m 몽골 국경에서 뽑았다 (꼭짓점 대부분 3km 안). 전에는 초원 남서쪽 끝을 (101.0, 42.5)~(96.0, 44.0)~(92.0, 47.0)~(90.0, 49.5) 직선으로 그어
// 고비알타이 남부·바양울기가 어느 나라에도 속하지 않았다 (2026-09-29)
// MN_SW의 끝점 (87.5, 49.2)는 러시아(europe.mjs의 RUSSIA_RAW)도 지난다
export const MN_SW = [[101.0, 42.5], [100.1, 42.67], [99.47, 42.57], [98.25, 42.68], [97.2, 42.79], [96.4, 42.72], [95.86, 43.28], [95.47, 43.99], [95.05, 44.26], [93.66, 44.9], [92.9, 45.02], [91.2, 45.15], [90.67, 45.6], [90.9, 45.95], [90.95, 46.75], [90.3, 47.65], [89.6, 47.92], [88.8, 48.12], [88.2, 48.5], [87.5, 49.2]];
const MN_SE = [[101.0, 42.5], [101.71, 42.47], [102.16, 42.16], [103.07, 42.01], [104.0, 41.8], [104.5, 41.66], [105.12, 41.66], [105.87, 41.99], [106.77, 42.29], [107.75, 42.4], [108.87, 42.43], [109.86, 42.61], [110.4, 42.77], [111.19, 43.39], [111.64, 43.56], [111.68, 44.04], [111.41, 44.42], [111.62, 44.83], [112.03, 45.08], [113.05, 44.81], [113.93, 44.91], [114.92, 45.38], [115.93, 45.63], [116.62, 46.31], [117.55, 46.59], [118.58, 46.69], [119.119, 46.643], [119.62, 46.6]];
// MN_SE의 (119.119, 46.643)은 Natural Earth 꼭짓점이 아니라 몽골 초원(EASTERN_TURKS) 동쪽 변 (119.0, 47.0)~(120.0, 44.0)이 이 선과 만나는 곳에 둔 점이다
// (이웃 두 꼭짓점을 이은 직선에서 약 40m 남쪽). 1932~1945년 몽골·만주국·중화민국(시린골 북부 띠 XILIN_N)이 만나는 점이라 세 나라가 같은 꼭짓점을 쓴다.
// 이 점이 없으면 소수 넷째 자리로 반올림한 뒤 만주국 경계가 스스로 꼬여 약 0.08km² 부스러기 조각이 떨어지고 몽골과 겹친다 (2026-09-29)
// 몽골 동쪽 국경(MN_E): 3국 접경 ~ 신바르가 우기 서쪽(동경 115.5~116°) ~ 부이르호(북쪽 끝만 중국) ~ 할하강 하류 동쪽 ~ MN_SE 끝점 (119.62, 46.6).
// Natural Earth 50m 몽골·중국 국경에서 뽑았다 (꼭짓점 모두 10m 국경에서 3.2km 안). 1921년부터의 외몽골(OUTER_MONGOLIA)에만 쓰고,
// 옛 시대의 몽골 초원(EASTERN_TURKS)·후룬베이얼 띠(AMUR_BAND)는 3국 접경~부이르호 직선(MN_TRIPOINT~MN_BUIR)을 그대로 쓴다 (2026-09-29)
const MN_E = [MN_TRIPOINT, [116.02, 48.78], [115.82, 48.58], [115.79, 48.25], [115.52, 48.13], [115.56, 47.95], [115.62, 47.87], [115.9, 47.69], [115.99, 47.71], [116.07, 47.79], [116.23, 47.86], [116.51, 47.84], [116.76, 47.87], [117.07, 47.81], [117.35, 47.65], [117.77, 47.99], [118.15, 48.03], [118.5, 47.98], [118.76, 47.76], [119.08, 47.65], [119.16, 47.53], [119.29, 47.47], [119.32, 47.41], [119.71, 47.15], [119.79, 46.98], [119.9, 46.86], [119.9, 46.73], [119.87, 46.67], [119.71, 46.61], MN_SE.at(-1)];
// 신장 동쪽 경계: 지도 자료 범위의 서쪽 끝. 신장(하미·투루판·뤄창)은 칠하지 않는다.
// 북쪽(XJ_E_N)은 허시 회랑 서북 끝 (93.81, 40.84)에서 둔황·과저우(싱싱샤 남쪽)·쑤베이(마쭝산)와 하미·뤄부포진의 경계를 따라 몽골 국경 (96.4, 42.72)까지.
// 남쪽(XJ_E_S)은 허시 회랑 서남 끝 (92.66, 39.57)에서 아커싸이 서쪽 끝 (92.34, 39.24)과 간쑤·칭하이·신장 3접경 (92.4, 39.02)을 지나
// 망야(칭하이) 북쪽 알툰산을 따라 (90.8, 38.7)까지, 그 남쪽은 전과 같은 근사선으로 알툰산 (89.6, 36.4)까지.
// (90.8, 38.7) 동쪽은 OpenStreetMap 행정 경계(과저우 R2707421·쑤베이 R2707423·망야 R5662612 등)에서 HEXI_W와 같은 방법으로 뽑았다.
// 전에는 기억한 수치로 그린 근사라 싱싱샤 남쪽 과저우·둔황 북쪽 끝(약 1,000km²)과 마쭝산 서북 끝(약 300km²)이 모든 시대에 비었고,
// 하미·뤄부포진 쪽 약 4,200km²(알라산)와 망야 북쪽 뤄창현 알툰산 약 2,800km²(칭하이 북부)를 칠했다 (2026-09-29)
// 두 선의 첫 점은 허시 회랑 서쪽 끝(shared.mjs의 HEXI_W)의 두 끝점 (93.81, 40.84)·(92.66, 39.57)이다
const XJ_E_N = [HEXI_W[0], [94.01, 41.11], [94.53, 41.5], [94.77, 41.57], [94.86, 41.67], [95.13, 41.77], [95.3, 41.56], [95.36, 41.67], [95.6, 41.8], [95.95, 41.88], [96.14, 42.02], [96.08, 42.15], [96.18, 42.22], [96.04, 42.32], [95.98, 42.44], [96.1, 42.6], [96.4, 42.72]];
const XJ_E_S = [HEXI_W.at(-1), [92.64, 39.51], [92.52, 39.37], [92.34, 39.24], [92.35, 39.07], [92.4, 39.02], [92.26, 39.0], [91.11, 38.71], [90.8, 38.7], [89.8, 38.0], [89.6, 37.3], [89.6, 36.4]];
// 북서쪽 끝은 러시아(RUSSIA_RAW)와 같은 점 (87.5, 49.2)·(90.0, 50.0)을 지난다. 전에는 (90.0, 49.5)라 옵스호 북쪽 띠가 러시아로 들어갔다 (2026-09-29)
// 북쪽 변(ET_NORTH)의 두 끝점 (90.0, 50.0)·(114.0, 50.2)는 러시아(europe.mjs의 RUSSIA_RAW)도 지난다
// 값만 같은 점: (120.0, 44.0)은 korea.mjs의 WEST_OF_BAEKDU 상자 모서리와 값이 같다(그쪽 결과에는 영향 없음)
export const ET_NORTH = [[90.0, 50.0], [95.0, 51.0], [102.0, 51.5], [108.0, 50.5], [114.0, 50.2]];
export const EASTERN_TURKS = ring(L_NORTH.slice(2, 9), MN_SW, ET_NORTH, [MN_TRIPOINT, MN_BUIR, [119.0, 47.0], [120.0, 44.0]]);
export const TIBET = ring([[98.5, 36.5]], L_WEST, [[98.5, 28.2], [96.0, 28.3], [92.0, 27.8], [88.5, 27.5], [85.0, 28.3], [81.0, 30.2], [78.5, 32.5], [79.5, 35.5], [85.0, 36.2], [90.0, 36.5], [95.0, 36.5]]);
// 알라산(허란산 서쪽 ~ 에지나강·베이산, 약 23만km²): 중국 북쪽 경계(L_NORTH)·허시 회랑(HEXI)과 몽골 국경(MN_SW) 사이, 서쪽은 신장 경계(XJ_E_N).
// 동쪽 변 (101.0, 42.5)~(104.5, 39.0)은 몽골 초원(EASTERN_TURKS)과 같은 변
// 칭하이 북부(칭하이호·차이다무 분지, 약 25만km²): 허시 회랑(HEXI) 남쪽, 티베트(TIBET) 북쪽, 서쪽은 신장 경계(XJ_E_S). 사각형에서 TIBET·CHINA를 빼서 만든다
// 전에는 두 곳이 모든 시대에 비어 있었다. 알라산은 초원 나라·요·서하·몽골·청에, 칭하이 북부는 토욕혼·수·토번·몽골·청에 시기마다 준다 (2026-09-29)
export const ALXA = ring(L_NORTH.slice(8), HEXI.slice(0, 3), XJ_E_N, rev(MN_SW.slice(0, 5)));
export const QH_N = polyclip.difference([ring(HEXI.slice(-4), [L_WEST[0], [102.5, 34.0], [89.6, 34.0]], rev(XJ_E_S.slice(1)))], [TIBET], [CHINA]);

// ── 조립 ───────────────────────────────────────────────────
// 요하 서쪽 초원(호르친): 거란의 본거지. 요 이후 금·원·청 영토에 넣는다 (2026-09-27 보충, 전에는 비어 있었음)
// 값만 같은 점: 상자 모서리 (125.0, 41.2)는 shared.mjs의 HUABEI_BOX와 값이 같다 (결과에 드러나지 않음, shared.mjs 참고)
const MAN_WEST = polyclip.difference(
  [ring([[118.5, 41.2], [125.0, 41.2], [125.0, 48.5], [118.5, 48.5]])], // 후룬베이얼(북위 48.5°)까지
  [KHITAN], [LIAODONG], polyclip.difference([BALHAE_818], [SOUTH_OF_RIVERS]), [CHINA], [EASTERN_TURKS],
);
export const KHITAN_W = polyclip.union([KHITAN], MAN_WEST);
// 두만강 북쪽 동만주(목단강·연해주): 요의 지배가 미치지 않던 동여진·생여진의 땅 (2026-09-27, 함경도 여진과 이어지도록)
// 서남 끝은 압록강·두만강선(korea.mjs의 L_YALU_TUMEN) 위의 점 (128.2, 41.5)
const EAST_MAN_RING = ring([L_YALU_TUMEN[5], [128.6, 42.5], [128.8, 43.5], [128.8, 49.0], [141.5, 49.0], [141.5, 41.5]]);
const LIAO_926 = polyclip.difference(polyclip.union(KHITAN_W, [LIAODONG], polyclip.difference([BALHAE_818], [SOUTH_OF_RIVERS])), [EAST_MAN_RING]);

// ── 4번 묶음 (936 ~ 1392) ─────────────────────────────────
export const MANCHURIA_NORTH = D([BALHAE_818], [SOUTH_OF_RIVERS]); // 압록강·두만강 북쪽 만주
const EAST_MAN = I(MANCHURIA_NORTH, [EAST_MAN_RING]);
const LIAO_936 = D(U(KHITAN_W, [EASTERN_TURKS], [LIAODONG], MANCHURIA_NORTH), [EAST_MAN_RING]);
const LIAO_938 = U(LIAO_936, [YANYUN]);
const JIN_1115 = MANCHURIA_NORTH;
const LIAO_1115 = D(LIAO_938, JIN_1115);
// 거란 본거지와 연운 16주가 (117.0, 41.4) 한 점에서만 만나 그 사이 초원 띠가 동돌궐 영역으로 떨어져 남는다. 금(연산 북쪽 환주·창주 일대)에 준다 (2026-09-28)
const ET_WEDGE = D(I([EASTERN_TURKS], [ring([[115.5, 41.0], [118.8, 41.0], [118.8, 42.6], [115.5, 42.6]])]), [KHITAN], [YANYUN]);
const JIN_1125 = U(JIN_1115, KHITAN_W, [YANYUN], [LIAODONG], ET_WEDGE);
const JIN_1127 = U(JIN_1125, I(D([CHINA], XIXIA), NORTH_BOX));
const MONGOL_1206 = D([EASTERN_TURKS], [KHITAN], [YANYUN], ET_WEDGE);
// 서하 영토: 중국 폴리곤 안(닝샤·허시 회랑) + 알라산(흑수진연군사, 『송사』 하국전). XIXIA는 송·금·요 영토를 계산할 때 빼는 데 그대로 쓴다 (2026-09-29)
const XIXIA_FULL = U(XIXIA, [ALXA]);
// 칭하이 북부는 1227년 서하를 멸망시킨 뒤부터 몽골 제국으로 본 추정 (2026-09-29)
const MONGOL_1227 = U(MONGOL_1206, XIXIA_FULL, QH_N);
const MONGOL_1234 = U(MONGOL_1227, JIN_1127);
const YUAN_1279 = U([EASTERN_TURKS], [CHINA], JIN_1127, [TIBET], [ALXA], QH_N);
const NORTHERN_YUAN = U([EASTERN_TURKS], KHITAN_W, MANCHURIA_NORTH, [ALXA]); // 칭하이 북부는 1368~1508년 비워 둔다 (2026-09-29)

// ── 6번 묶음 (1592 ~ 1876) ─────────────────────────────────
const HUGEUM_1616 = MANCHURIA_NORTH;
export const HUGEUM_1621 = U(MANCHURIA_NORTH, [LIAODONG]);

// ── 7번 묶음 (1876 ~ 1945) ─────────────────────────────────
// 외몽골: 몽골 국경(MN_SW·MN_SE·MN_E) 안, 북쪽 변은 몽골 초원(EASTERN_TURKS)을 따른다. 1921년부터 몽골 (2026-09-29, 전에는 (87.0, 44.5)~(105.0, 42.5)~(112.0, 43.5)~(119.5, 46.5) 직선이라
// 남고비가 중국, 시린골 북부가 몽골로 칠해졌다)
// 동쪽은 실제 국경(MN_E). 전에는 3국 접경~부이르호~(119.0, 47.0) 직선이라 신바르가 우기 일대(약 2만km²)가 몽골로, 할하강 유역의 몽골 돌출부(할흐골 솜,
// 약 1.3만km²)가 중화민국·만주국·중화인민공화국으로 칠해졌다. 돌출부는 몽골 초원 밖이라 상자를 더한 뒤 국경으로 잘라 낸다 (2026-09-29)
const OM_CLIP = ring(rev(MN_SW), MN_SE.slice(1, -1), rev(MN_E), [[116.0, 52.0], [87.0, 52.0], [87.0, 49.2]]);
export const OUTER_MONGOLIA = I(U([EASTERN_TURKS], [bx(117.5, 46.5, 120.5, 48.2)]), [OM_CLIP]);
// 몽골 초원 북동쪽 모서리(북위 47.5° 북쪽). 외몽골을 빼면 실제 국경 동쪽의 신바르가 우기 일대 띠가 남는다. 이 띠는 청 이전에는 초원 쪽에 두고
// (그 동쪽 후룬베이얼은 1691년 전 대부분 시기에 비어 있다), 1921년 뒤로는 중국 쪽(1932~1945년 만주국 싱안베이성)이므로 시린골 북부 띠(XILIN_N)에서 빼고 만주국에 더한다.
// 띠만 따로 잘라 더하면 3국 접경~부이르호 선에서 만주국이 두 조각으로 갈라지므로 모서리째 더한 뒤 외몽골을 뺀다 (2026-09-29)
export const ET_NE = I([EASTERN_TURKS], [bx(115.0, 47.5, 118.5, 50.5)]);
// 옛 직선 안쪽이었다가 중국 쪽으로 넘어온 시린골 북부(동·서우줌친) 띠. 거란 본거지(KHITAN_W)가 걸쳐 있어 만주국에서 빼지 않으면
// 1932~1945년 만주국이 시린골 북부로 약 1.3만km² 넓어진다. 만주국은 전과 같게 두고 이 띠는 중화민국에 남긴다 (2026-09-29)
export const XILIN_N = D(I([EASTERN_TURKS], [ring([[87.0, 44.5], [105.0, 42.5], [112.0, 43.5], [119.5, 46.5], [120.0, 52.0], [87.0, 52.0]])]), AMUR_BAND, OUTER_MONGOLIA, ET_NE);

// ── 영토 보충 (2026-09-27): 전 시기 공백 검사에서 기록으로 주인을 채울 수 있는 곳 ──
// 만주 동북부 끝(흑룡강 하류·연해주 북부): 발해 전성기 경계 밖. 말갈(흑수말갈) → 여진이 살았다
// 값만 같은 점: 상자 모서리 (141.5, 48.5)는 shared.mjs의 PRIMORYE와 값이 같다 (바다 쪽 점, shared.mjs 참고)
export const NE_FAR = D([ring([[123.0, 44.5], [141.5, 44.5], [141.5, 48.5], [123.0, 48.5]])], [BALHAE_818], [EASTERN_TURKS], KHITAN_W);
// 만주 동부(부여·고구려·옥저 바깥): 읍루(『삼국지』) → 물길(『위서』) → 말갈(『수서』)
const NE_ALL = U(D(I(MANCHURIA_NORTH, box(127.0, 42.0, 141.5, 49.5)), [G_BIG], [BUYEO], [GOGURYEO], OKJEO), I(NE_FAR, box(127.0, 44.0, 142.0, 49.0)));
// 고구려 멸망 뒤 옛 땅 중 안동도호부(요동)·신라(대동강 이남)를 뺀 곳: 발해 건국·확장 전까지 말갈·고구려 유민
const OLD_GOG = D([GOGURYEO], [LIAODONG], [SILLA_676]);
const MALGAL_676 = U(NE_ALL, OLD_GOG);

// ── 금 전성기와 동하 ──
// 금의 전성기 영토와 1215년 이후 남은 화북 (연운 16주·요서·만주·함경도 북부를 몽골에 빼앗김)
const JIN_ALL = U(JIN_1127, NB_994, NE_FAR);
const JIN_1215 = I(JIN_ALL, D([CHINA], [YANYUN], [NORTH_OF_YANYUN]));
const JIN_LOST_1215 = D(JIN_ALL, JIN_1215);
// 동하(동진, 大眞·東夏): 포선만노가 1215년 요동에서 대진을 세우고 1216년 몽골에 항복했다가, 1217년 두만강 유역으로 옮겨 다시 자립한 뒤의 영역 (2026-09-29).
// 금의 갈라로(함경도, 고려 정주 북쪽)·휼품로(쑤이펀강, 우수리스크)·호리개로(이란, 목단강 하구)와 연변(남경 = 성자산성, 투먼 마반촌).
// 서쪽은 장광재령·위호령(동경 약 128°), 북쪽은 송화강 하류(혼동강) 남쪽, 한반도에서는 낭림산맥 동쪽. 금 잔존 세력과 다툰 상경(아청)은 넣지 않는다.
// 바다 쪽 점으로 연해주·함경도 해안을 두르고, 남쪽 끝은 고려 땅 안의 점(127.0, 39.6)에서 고려 경계(L_1033)의 꼭짓점(127.0, 39.95)으로 올라간다. 선분 중간에서 만나면 몽골 쪽에 부스러기가 남는다
// 그 두 점은 쌍성총관부·동녕부 경계(korea.mjs의 L_SSANGSEONG_W)다
const DX_RING = ring([[127.6, 41.543], [127.9, 42.4], [127.9, 43.6], [128.3, 44.6], [128.6, 45.4], [129.3, 46.5], [130.6, 46.6], [132.0, 46.3], [133.5, 45.8], [135.5, 45.2], [137.8, 45.2], [136.0, 43.0], [133.0, 42.2], [130.5, 40.8], [129.2, 39.7], [128.5, 39.1], ...L_SSANGSEONG_W, [127.25, 40.3], [127.3, 40.9]]);
const DONGXIA = I([DX_RING], JIN_LOST_1215);

// 나라 id: [[from, to, 멀티폴리곤, 확실성?], ...]. to가 null이면 지금까지, 확실성은 'disputed' 등(없으면 'estimated').
// 출처(geojson의 source)는 나라별로 적지 않고 권역 파일의 source로 정한다(없으면 engine.mjs의 기본 문구)
export const versions = {
  // 읍루 → 물길 → 말갈 (만주 동부). 676년부터 고구려 옛 땅도 (발해가 차지하기 전까지)
  eupru: [[1, 450, NE_ALL]],
  mulgil: [[450, 560, NE_ALL]],
  malgal: [[560, 676, NE_ALL], [676, 698, MALGAL_676], [698, 719, D(MALGAL_676, [BALHAE_698])], [719, 818, D(MALGAL_676, [BALHAE_719])], [818, 926, D(MALGAL_676, [BALHAE_818])]],
  // 여진: 조선의 4군 6진 개척으로 압록강·두만강 남쪽 거주지를 잃는다
  jurchen: [
    [926, 936, U(NB_926, EAST_MAN, NE_FAR)],
    [936, 994, U(NB_936, EAST_MAN, NE_FAR)],
    [994, 1014, U(NB_994, EAST_MAN, NE_FAR)],
    [1014, 1107, U(NB_994_NB, EAST_MAN, NE_FAR)],
    [1107, 1110, D(U(NB_1107, EAST_MAN, NE_FAR), NINE_NORTH, BOJU)],
    [1110, 1115, U(NB_994_NB, EAST_MAN, NE_FAR)],
    // 1115~1368년은 금·원의 영토에 포함
    [1368, 1388, NB_1356],
    [1388, 1392, U(MANCHURIA_NORTH, NB_1356, NE_FAR)],
    [1392, 1443, U(MANCHURIA_NORTH, [BAND_RIVERS], NE_FAR)],
    [1443, 1449, U(MANCHURIA_NORTH, BAND_6JIN, NE_FAR)],
    [1449, 1616, noNokdun(U(MANCHURIA_NORTH, NE_FAR))],
  ],
  hugeum: [[1616, 1621, noNokdun(U(HUGEUM_1616, NE_FAR))], [1621, 1636, noNokdun(U(HUGEUM_1621, NE_FAR))]],
  xixia: [[1038, 1227, XIXIA_FULL]],
  // 금·몽골·원: 한반도 북부 여진 거주지(갈라로, 합란부·개원로)와 만주 동북부 끝을 포함
  // 1211년 야호령 전투 뒤 연산 북쪽을, 1215년 중도(베이징)·북경(대정부, 요서)을 몽골에 빼앗겨(1214년 카이펑 천도) 화북만 남는다 (2026-09-28)
  jin: [[1115, 1125, U(JIN_1115, NB_994, NE_FAR)], [1125, 1127, U(JIN_1125, LIAOXI, YANYUN_REST, NB_994, NE_FAR)], [1127, 1215, JIN_ALL], [1215, 1234, JIN_1215]],
  'mongol-empire': [
    [1206, 1215, MONGOL_1206],
    [1215, 1217, U(MONGOL_1206, JIN_LOST_1215)],
    // 1217~1232년 만주 동부·함경도는 동하 (1233년 구유크가 남경을 함락해 몽골로 돌아감)
    [1217, 1227, D(U(MONGOL_1206, JIN_LOST_1215), DONGXIA)],
    [1227, 1233, D(U(MONGOL_1227, JIN_LOST_1215), DONGXIA)],
    [1233, 1234, U(MONGOL_1227, JIN_LOST_1215)],
    [1234, 1258, U(MONGOL_1234, NB_994, NE_FAR)],
    [1258, 1270, U(MONGOL_1234, NB_1258, NE_FAR)],
    [1270, 1271, U(MONGOL_1234, NB_1270, NE_FAR)],
  ],
  // 동하: 1215~1216년 요동 시기는 몽골·동요(야율유가)·후요(야사불)와 뒤섞여 따로 그리지 않고, 두만강 유역으로 옮긴 1217년부터 그린다
  dongxia: [[1217, 1233, DONGXIA]],
  yuan: [
    [1271, 1279, U(MONGOL_1234, NB_1270, NE_FAR)],
    [1279, 1290, U(YUAN_1279, NB_1270, NE_FAR)],
    [1290, 1356, U(YUAN_1279, NB_1258, NE_FAR)],
    [1356, 1368, U(YUAN_1279, NB_1356, NE_FAR)],
  ],
  'northern-yuan': [[1368, 1387, U(NORTHERN_YUAN, [LIAODONG], NE_FAR)], [1387, 1388, U(NORTHERN_YUAN, NE_FAR)]],
  // 북원 이후의 몽골 부족(달단·오이라트·우량하·코르친): 몽골 초원과 요하 서쪽, 알라산. 1636년 내몽골은 청, 1691년 외몽골·알라산도 청
  // 칭하이 북부: 1509년 이부랄·아르투스가 칭하이호 일대로 들어간 뒤 몽골 세력(1559년 알탄 칸, 1637년 무렵 호쇼트부)의 땅. 1724년 청에 병합 (2026-09-29)
  // 1509~1690년에는 명(1644년부터 청)의 허시 회랑을 사이에 두고 초원과 떨어진 조각이 된다 (data/exclaves.yaml)
  mongols: [
    [1388, 1509, U([EASTERN_TURKS], KHITAN_W, [ALXA])],
    [1509, 1636, U([EASTERN_TURKS], KHITAN_W, [ALXA], QH_N)],
    [1636, 1691, U(D([EASTERN_TURKS], KHITAN_W), [ALXA], QH_N)],
    [1691, 1724, QH_N],
  ],
  'eastern-turks': [[583, 630, U([EASTERN_TURKS], [ALXA])]],
  // 663년 토욕혼을 무너뜨린 뒤 칭하이 북부도 토번 (2026-09-29)
  tibet: [[618, 663, P(TIBET)], [663, 843, U([TIBET], QH_N)]],
  // 토욕혼: 엽연이 할아버지 이름을 국호로 삼은 329년부터. 609~617년은 수의 군현, 663년 토번에 멸망 (2026-09-29)
  tuyuhun: [[329, 609, QH_N], [618, 663, QH_N]],
  // 요서: 5대 왕조의 화북에 들지 않은 북쪽은 요, 960년 송 건국 뒤로는 요서 전체가 요
  liao: [
    [916, 923, U(KHITAN_W, D(LIAOXI, HUABEI), LX916)],
    [923, 926, U(KHITAN_W, D(LIAOXI, HUABEI), LX923)],
    [926, 936, U(LIAO_926, D(LIAOXI, HUABEI), LX923)],
    // 936~1037년 알라산(거연)은 초원과 함께 요의 서쪽 끝으로 본 추정. 1038년부터 서하 (2026-09-29)
    [936, 938, U(LIAO_936, D(LIAOXI, HUABEI), LX923, [ALXA])],
    [938, 960, U(LIAO_938, D(LIAOXI, HUABEI_938), YANYUN_REST, [ALXA])],
    [960, 1014, U(LIAO_938, LIAOXI, YANYUN_REST, [ALXA])],
    [1014, 1038, U(LIAO_938, LIAOXI, YANYUN_REST, BOJU, [ALXA])],
    [1038, 1115, U(LIAO_938, LIAOXI, YANYUN_REST, BOJU)],
    [1115, 1125, U(LIAO_1115, LIAOXI, YANYUN_REST)],
  ],
};

// ── 만주 빈 땅 채우기 (2026-09-27) ─────────────────────────────
// 기원전 7세기 ~ 926년 만주 서부(내몽골 동부·흑룡강 서부)와 동부의 빈 땅을 그 시기 기록에 나오는 민족으로 채운다.
// 시기마다(다른 나라 영토가 바뀌는 해마다) 구역에서 다른 나라 영토를 뺀 나머지를 준다.
// 서부 남쪽: 동호 → 오환(요서 북쪽)·선비 → 선비 → 거란 부족 / 서부 북쪽: 동호 → 선비 → 실위
// 동부: 숙신 → 읍루 → 물길 → 말갈 (읍루·물길·말갈은 이미 있는 영토에 덧붙인다)
// 구역 상수와 fillSpecs: 엔진(engine.mjs의 fillEmptyLand)이 모든 권역을 합친 뒤 이 순서대로 채운다. spec 순서가 땅 배분을 정하므로 바꾸지 않는다.
// spec 28개, 나라 id 20개 가운데 17개는 채우기로만 만들고, eupru·mulgil·malgal은 위 versions에 덧붙인다. 끝 없음은 to: 3000
// 요동은 늘 연·진·한·위·진·전연·고구려 등이 가졌으므로 채우지 않는다. 중국 왕조 사이 빈 해(기원전 206~201년, 24년)에는 빈 땅으로 둔다 (2026-09-28)
const MAN_REGION = D(box(118.5, 38.5, 136.0, 49.5), KOREA, [CHINA], [LIAODONG]);
const NORTH_W = I(MAN_REGION, box(118.5, 45.5, 126.5, 49.5));
const WEST_S = I(MAN_REGION, box(118.5, 38.5, 124.5, 45.5));
const WUHUAN_Z = I(WEST_S, box(118.5, 38.5, 122.3, 43.3));
const XIANBEI_S = D(WEST_S, WUHUAN_Z);
const EAST = D(MAN_REGION, NORTH_W, WEST_S);
const STEPPE = D(U([EASTERN_TURKS], [ALXA]), [CHINA]); // 알라산 포함 (2026-09-29)
// 숙신·읍루 구역(서기 56년까지): 동경 127.5° 동쪽과 부여 북쪽(북위 45.5° 이북). 그 남서쪽은 예맥
const SUSHEN_Z = I(EAST, U(box(127.5, 38.5, 136.0, 49.5), box(118.5, 45.5, 136.0, 49.5)));
export const fillSpecs = [
  { id: 'donghu', zone: U(NORTH_W, WEST_S), from: -700, to: -205 }, // 기원전 206년 묵돌에게 무너짐
  // 숙신·읍루는 부여 동북쪽(『삼국지』 읍루전: 부여 동북 천여 리). 휘발하·혼강 유역(부여·고구려·현도군 경계 지대)은 채우지 않는다 (2026-09-28)
  // 그 서쪽(지린·창춘·휘발하·혼강 유역, 서단산 문화)은 부여·고구려의 모체가 된 예맥의 땅. 부여·고구려가 차지하기 전까지 채운다 (2026-09-28)
  { id: 'yemaek', zone: D(EAST, SUSHEN_Z), from: -700, to: 56 },
  { id: 'sushen', zone: SUSHEN_Z, from: -700, to: 1 },
  { id: 'wuhuan', zone: WUHUAN_Z, from: -205, to: 207 },
  { id: 'xianbei', zone: XIANBEI_S, from: -205, to: 207 },
  { id: 'xianbei', zone: WEST_S, from: 207, to: 388 },
  { id: 'xianbei', zone: NORTH_W, from: -205, to: 400 },
  // 서진이 무너진 뒤 전연이 서기 전까지 요서·요동은 모용선비가 다스렸다
  { id: 'xianbei', zone: U(LIAOXI, [LIAODONG]), from: 317, to: 337 },
  { id: 'khitan', zone: WEST_S, from: 388, to: 916 },
  // 당이 무너진 뒤 요서 북쪽은 거란이 차지했다 (916년 요 건국 뒤로는 요의 땅)
  { id: 'khitan', zone: LIAOXI, from: 907, to: 916 },
  { id: 'shiwei', zone: NORTH_W, from: 400, to: 916 },
  // 719~818년 눈강·송화강 합류부 서쪽(발해 북서쪽 모서리)은 실위(황두실위·달구 등)의 땅으로 본 추정 (『신당서』 동이전 유귀조의 달말루·달구 기사). 말갈 조각으로 떨어지던 곳 (2026-09-28)
  { id: 'shiwei', zone: I(MAN_REGION, [ring([[124.5, 45.0], [125.4, 45.5], [124.5, 45.5]])]), from: 719, to: 818 },
  // 916년부터 요가 실위 남쪽을 막으므로, 동돌궐 영역 모서리(할하강 남쪽)는 실위 대신 초원 부족(조복)에게 간다 (2026-09-28)
  { id: 'shiwei', zone: D(NORTH_W, [EASTERN_TURKS]), from: 916, to: 926 },
  { id: 'eupru', zone: SUSHEN_Z, from: 1, to: 56 },
  { id: 'eupru', zone: EAST, from: 56, to: 450 },
  { id: 'mulgil', zone: EAST, from: 450, to: 560 },
  { id: 'malgal', zone: EAST, from: 560, to: 926 },
  // 몽골 초원 (2026-09-27): 동돌궐 영역과 알라산(2026-09-29)에서 중국 땅을 뺀 곳. 만주 쪽이 먼저 채운 땅은 제외된다
  { id: 'xiongnu', zone: STEPPE, from: -317, to: 91 }, // 기원전 318년 첫 기록
  { id: 'xianbei', zone: STEPPE, from: 91, to: 402 },
  { id: 'rouran', zone: STEPPE, from: 402, to: 552 },
  { id: 'gokturk', zone: STEPPE, from: 552, to: 583 },
  { id: 'xueyantuo', zone: STEPPE, from: 630, to: 646 },
  { id: 'anbuk-dohobu', zone: STEPPE, from: 646, to: 682 },
  { id: 'second-turks', zone: STEPPE, from: 682, to: 744 },
  { id: 'uyghur', zone: STEPPE, from: 744, to: 840 },
  { id: 'zubu', zone: STEPPE, from: 840, to: 936 },
  { id: 'steppe-tribes', zone: STEPPE, from: 1125, to: 1206 },
  // 할하강 유역의 몽골 돌출부는 몽골 초원(STEPPE) 밖이라 외몽골을 더한다 (2026-09-29)
  { id: 'mongolia', zone: U(STEPPE, OUTER_MONGOLIA), from: 1921, to: 3000 },
];

// ── 빈 땅 검사 구역 (npm run check:gaps, DESIGN.md §5.4) ──────────────
// [{ name, zone(멀티폴리곤), minus?(앞에 모은 구역 이름) }]. 권역 목록(AREAS) 순서대로 한반도(korea.mjs) 뒤에 모인다(engine.mjs의 collectGapZones)
// 만주: 요서·요동 ~ 흑룡강 이남 상자에서 한반도를 뺀 곳. 몽골: 동돌궐 영역(EASTERN_TURKS)에서 만주를 뺀 곳.
// 알라산·칭하이 북부(ALXA·QH_N): 알라산은 기원전 318년 전, 칭하이 북부는 328년까지·843~1226년·1368~1508년에 비어 있는 것이 의도한 것
export const gapZones = [
  { name: '만주', zone: [box(119.0, 38.5, 135.0, 48.5)], minus: ['한반도'] },
  { name: '몽골', zone: P(EASTERN_TURKS), minus: ['만주'] },
  { name: '알라산·칭하이', zone: [[ALXA], ...QH_N] },
];
