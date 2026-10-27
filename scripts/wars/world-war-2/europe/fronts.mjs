// 스냅샷별 전선 경유점과 작전 화살표 (좌표는 [경도, 위도]). 근거는 결과 노트 3장.
export const F = {};

F['1939-09-01'] = {
  arrows: [
    { faction: 'axis', path: [[20.6, 53.55], [20.95, 52.85], [21.0, 52.35]], label: '북부 집단군 (동프로이센)' },
    { faction: 'axis', path: [[16.9, 53.65], [18.3, 53.4]], label: '폴란드 회랑' },
    { faction: 'axis', path: [[18.7, 50.85], [19.6, 51.55], [20.8, 52.1]], label: '남부 집단군' },
    { faction: 'axis', path: [[19.9, 49.35], [21.2, 49.95], [23.4, 49.85]], label: '크라쿠프·르비우 방면' },
  ],
};

F['1939-09-28'] = {
  arrows: [
    { faction: 'soviet', path: [[27.3, 53.95], [25.3, 53.5], [23.9, 53.1]], label: '소련 벨라루스 전선군 (9월 17일)' },
    { faction: 'soviet', path: [[26.9, 50.15], [25.3, 49.95], [24.1, 49.85]], label: '소련 우크라이나 전선군' },
  ],
};

// ── 경유점 선 (이름은 영어 위키백과 문서 제목 — wikicheck.mjs로 좌표 대조) ──
export const P = {};

// 1940-05-10 노르웨이: 독일군 북쪽 끝 (선의 남쪽이 독일). 근거: en.wikipedia Actions in Nordland, Namsos campaign
P.norway400510 = [
  [11.8, 65.5], ['Velfjord', 12.60, 65.48], ['Bjørnå', 13.28, 65.72], ['Fellingfors', 13.30, 65.50], ['Hattfjelldal', 13.99, 65.60], [14.35, 65.55],
];
// 나르비크 독일군 지역 (1940-05-10 무렵). 근거: en.wikipedia Battles of Narvik, Battle of Gratangen
P.narvik400510 = [
  ['Øyjord', 17.42, 68.47], ['Bjerkvik', 17.56, 68.55], ['Elvegårdsmoen', 17.60, 68.53], ['Storebalak', 17.72, 68.60], ['Kuberget', 17.85, 68.56],
  ['Hartvikvatnet', 17.92, 68.52], [18.10, 68.50], ['Riksgränsen', 18.12, 68.43], [18.08, 68.36], ['Beisfjord', 17.70, 68.36], ['Ankenes', 17.36, 68.42],
];
// 1940-06-22 프랑스 휴전 경계선 (스위스 국경 → 스페인 국경, 북·서쪽이 점령 지구). 근거: fr.wikipedia Ligne de démarcation (France) 'Tracé'
P.demarcation = [
  ['Pougny, Ain', 5.95, 46.14], ['Bellegarde-sur-Valserine', 5.83, 46.11], ['Mijoux', 6.00, 46.37], ['La Cure', 6.07, 46.46], ['Morez', 6.03, 46.52],
  ['Saint-Laurent-en-Grandvaux', 5.96, 46.58], ['Champagnole', 5.91, 46.75], [5.74, 46.87], ['Mont-sous-Vaudrey', 5.60, 46.98], ['Parcey', 5.49, 47.02],
  ['Chaussin', 5.41, 46.97], ['Navilly', 5.15, 46.94], ['Verdun-sur-le-Doubs', 5.02, 46.90], ['Chalon-sur-Saône', 4.85, 46.78], ['Buxy', 4.70, 46.71],
  ['Montceau-les-Mines', 4.36, 46.67], [4.12, 46.44], ['Digoin', 3.98, 46.48], ['Dompierre-sur-Besbre', 3.68, 46.52], ['Thiel-sur-Acolin', 3.58, 46.52],
  ['Toulon-sur-Allier', 3.36, 46.52], ['Villeneuve-sur-Allier', 3.22, 46.67], ['Apremont-sur-Allier', 3.05, 46.90], ['Jussy-Champagne', 2.62, 46.97],
  ['Plaimpied-Givaudins', 2.46, 47.00], ['Morthomiers', 2.29, 47.04], ['Quincy, Cher', 2.16, 47.14], ['Vierzon', 2.07, 47.22], ['Châtres-sur-Cher', 1.88, 47.27],
  ['Selles-sur-Cher', 1.55, 47.27], ['Chissay-en-Touraine', 1.13, 47.34], ['Bléré', 0.99, 47.33], ['Loches', 0.95, 47.13], ['Ligueil', 0.82, 47.04],
  ['Le Grand-Pressigny', 0.80, 46.92], ['La Roche-Posay', 0.81, 46.79], ['Chauvigny', 0.65, 46.57], ['Fleuré', 0.52, 46.48], ['Usson-du-Poitou', 0.53, 46.28],
  ['Charroux, Vienne', 0.40, 46.14], ['Champagne-Mouton', 0.41, 45.99], ['Saint-Claud', 0.46, 45.89], ['Chasseneuil-sur-Bonnieure', 0.45, 45.83],
  ['La Rochefoucauld', 0.38, 45.74], [0.32, 45.65], [0.39, 45.48], ['Ribérac', 0.34, 45.25], ['Échourgnac', 0.23, 45.12], ['Montpon-Ménestérol', 0.16, 45.01],
  ['Lamothe-Montravel', 0.03, 44.85], ['Castillon-la-Bataille', -0.04, 44.85], ['Sauveterre-de-Guyenne', -0.09, 44.69], ['Langon, Gironde', -0.25, 44.55],
  ['Bazas', -0.21, 44.43], ['Captieux', -0.26, 44.29], [-0.28, 44.03], [-0.42, 43.89], [-0.50, 43.76], [-0.54, 43.66], ['Sault-de-Navailles', -0.67, 43.54],
  ['Orthez', -0.77, 43.49], ['Salies-de-Béarn', -0.93, 43.47], ['Sauveterre-de-Béarn', -0.94, 43.40], ['Saint-Palais, Pyrénées-Atlantiques', -1.03, 43.33],
  ['Larceveau-Arros-Cibits', -1.09, 43.23], ['Saint-Jean-Pied-de-Port', -1.24, 43.16], ['Arnéguy', -1.28, 43.11],
];

import { P44 } from './fronts44.mjs';
import { PW } from './frontsw.mjs';
import { P41 } from './fronts41.mjs';
Object.assign(P, P41, P44, PW);
