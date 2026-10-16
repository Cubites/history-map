// 1939-09-01 개관 장면용 영국·프랑스 식민지·자치령 바탕 (운영자 결정 4, 2026-10-13)
// asia-pacific 생성기(../asia-pacific/gen.mjs)의 alliedBase·indochina 방식 그대로: 껍질(hull) 안에서 대상 나라와 바다만 남기고, 해안선은 빌드가 육지로 자른다.
// 칠하는 곳: 영국령 인도(파키스탄·방글라데시 포함)·버마·실론·몰디브·말라야·싱가포르·북보르네오(사바)·사라와크·브루나이·홍콩,
//   오스트레일리아(파푸아·뉴기니 위임 통치령, 나우루 포함)·뉴질랜드·피지·솔로몬·길버트(키리바시)·뉴칼레도니아·바누아투, 프랑스령 인도차이나.
// 칠하지 않는 곳: 네덜란드령 동인도(인도네시아)·미국령 필리핀·괌·하와이·알류샨·포르투갈령 티모르·마카오·타이 (1939년 9월에는 중립이거나 아직 참전 전).
import { D, I, P, U, countryTable, makeRegion, terrOrEmpty as terr, box } from '../../engine.mjs';

const countries = countryTable('50m');
const H = (_name, pts) => P(pts);

/** 다각형을 GROW도(약 220m) 바깥으로 부풀린 어림(원래 모양과 8방향으로 옮긴 사본의 합집합).
 *  껍질에서 외국 땅을 빼 만든 구멍이 육지 자료(land-50m) 해안선과 정확히 같으면, 소수 셋째 자리 반올림 뒤 구멍 가장자리가 몇십 m 어긋나
 *  외국 해안을 따라 너비 몇 m의 찌꺼기와 나라 경계 자료에 없는 작은 섬(네덜란드·미국령)이 칠해졌다(2026-10-13 시험). 구멍을 해안선 바깥으로 넉넉히 둔다. */
const GROW = 0.002;
const grow = (m) => U(m, ...[[GROW, 0], [-GROW, 0], [0, GROW], [0, -GROW], [GROW, GROW], [GROW, -GROW], [-GROW, GROW], [-GROW, -GROW]].map(([dx, dy]) => m.map((poly) => poly.map((r) => r.map(([x, y]) => [x + dx, y + dy])))));
/** 껍질 hull 안에서 targets 나라와 바다만 남긴다 (다른 나라 땅과 protect를 뺀다). ignore 나라는 빼지 않는다(protect로 따로 넉넉히 뺄 때).
 *  asia-pacific 생성기와 같은 함수(엔진 makeRegion)에 외국 땅을 grow로 부풀리는 옵션만 더 준다 */
const region = makeRegion(countries, { foreignMap: grow });

// ── 껍질 (asia-pacific 생성기와 같은 경유점) ──
const H_INDIA = H('영국령 인도·버마', [[61.7, 24.6], [60.8, 26.5], [60.5, 38.5], [75, 38.5], [80, 36.5], [97, 30], [100, 28.5], [101.5, 21.5], [99.5, 16], [99.2, 11.5], [98.75, 10.3], [98.35, 9.85], [97.5, 9.0], [92, 5], [78, 4], [70, 8]]);
const H_SEA = H('동남아시아·오세아니아', [[90, -48], [90, 6.0], [99.62, 6.42], [100.2, 6.62], [101.0, 6.0], [101.8, 5.8], [102.12, 6.22], [103.5, 6.6], [109, 7.6], [116, 7.6], [116.7, 10], [119, 13], [119.2, 18.6], [120, 21.5], [122.5, 21.5], [127, 19], [127.5, 10], [128.6, 4.5], [130.5, 1.5], [136, 1.2], [150, 0.5], [163, -5], [180, -15], [180, -48]]);
const H_HK = H('홍콩', [[113.78, 22.15], [114.55, 22.15], [114.55, 22.42], [114.42, 22.6], [114.1, 22.58], [113.95, 22.52], [113.8, 22.4]]);
const TL_HULL = U(H('포르투갈령 티모르', [[125.0, -8.6], [125.35, -8.0], [125.9, -8.0], [127.4, -8.1], [127.4, -9.2], [125.2, -9.75], [125.0, -9.4], [124.95, -9.1]]), H('오에쿠시', [[124.0, -9.05], [124.55, -9.05], [124.55, -9.5], [124.05, -9.45]]));
const TIMOR_PT = region(TL_HULL, ['Timor-Leste']);
const H_EXTRA = [box(166.6, -0.8, 167.2, -0.3) /* 나우루 */, box(169.3, -1.1, 169.8, -0.6) /* 바나바 */, box(172.3, -1.0, 174.8, 3.6) /* 길버트 */];
const VN_GEN = region(H('통킹·라오스 북부', [[100.0, 22.0], [101.5, 23.2], [103.5, 23.2], [105.0, 23.6], [106.5, 23.3], [107.6, 22.6], [107.9, 22.0], [108.1, 21.2], [108.3, 19.5], [107.5, 17.0], [106.0, 17.0], [104.0, 18.0], [100.0, 18.0]]), ['Vietnam', 'Laos']);
const protectChina = (y) => [D(U(terr('roc', y), terr('occupied-china', y), terr('mongolia', y)), VN_GEN)];
// 1941년 12월: 프랑스령 인도차이나만 (타이 쪽 경계는 타이 땅 안을 지나 핫렉 부근에서 바다로)
const H_INDOCHINA = H('인도차이나', [[102.4, 10.5], [102.95, 11.8], [101.0, 14.0], [99.5, 18.5], [99.8, 21.5], [101.0, 23.8], [108.5, 23.8], [109.0, 21.0], [108.0, 17.5], [110.5, 12.0], [107.5, 8.0], [104.0, 8.0]]);
const indochina = (y) => region(H_INDOCHINA, ['Vietnam', 'Laos', 'Cambodia'], protectChina(y));

// 1939년 9월 연합국 식민지·자치령 (영국령·프랑스령·영연방 자치령). 네덜란드·미국·포르투갈령은 뺀다.
const ALLIED_1939 = ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Maldives', 'Myanmar', 'Malaysia', 'Singapore', 'Brunei', 'Papua New Guinea', 'Solomon Is.', 'Australia', 'New Caledonia', 'Vanuatu', 'Fiji', 'New Zealand', 'Kiribati', 'Nauru', 'Indian Ocean Ter.', 'Ashmore and Cartier Is.', 'Hong Kong'];
/** 연합국 식민지 바탕 (인도차이나·홍콩 제외). 중국 땅(그해 roc·occupied-china)은 지킨다 */
export function alliedBase1939(year) {
  const protect = [terr('roc', year), terr('occupied-china', year)];
  return U(region(H_INDIA, ALLIED_1939, protect), D(region(H_SEA, ALLIED_1939, protect, ['Timor-Leste']), TIMOR_PT), ...H_EXTRA.map((h) => region(h, ALLIED_1939)));
}
/** 홍콩과 프랑스령 인도차이나 (중국 쪽 층 위에 덮는다: 저장소 중화민국 영토가 통킹을 덮고 있어서) */
export function alliedTop1939(year) {
  return { hongkong: region(H_HK, ['Hong Kong']), indochina: indochina(year) };
}
