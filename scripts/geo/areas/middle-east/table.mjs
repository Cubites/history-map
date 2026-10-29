// middle-east 도우미 모듈: 행정구역 조각 소유표 (서아시아·북아프리카 A1a-1, 2026-10-29)
// 유럽 권역(areas/europe.mjs)의 makeTable과 같은 꼴을 이 권역 조각(loadFragments('middle-east'))에 맞춰 옮겼다. 유럽의 것은 EU 조각에 묶인 지역 함수라 그대로 쓸 수 없다.
// 시대 파일(areas/middle-east/<시대>.mjs)이 이 모듈을 가져와 표를 만들고, 표를 이어 나라별 버전·주인 없는 땅을 얻는다.
// - 단위: 조각 하나를 통째로 쓰면 그 조각 id, 선으로 나눴으면 '이름/부분'. own(단위들, [[해, 나라], ...])는 그 해부터 다음 해 전까지 그 나라 땅이라는 뜻이다.
// - 나라가 null이면 주인 없는 땅이다(일부러 비운 땅이거나 아직 그리지 않은 땅). 빈 땅 검사 구역에서 그 해에 뺀다.
// - 표마다 모든 조각을 정확히 한 번 쓴다(안 쓴 조각이 있으면 멈춤). 단위 이름과 도형은 표 사이에서 함께 쓴다(다른 표의 나눈 조각은 reuse).
// - renames: 나라 이름(항목)만 바뀌고 땅은 그대로 넘어간 해. 그 해부터 그 나라의 모든 단위 주인을 새 항목으로 바꿔 읽는다.
// - 꾸러미(2026-10-29 A2-0): 단위 이름·도형 표는 시대 파일마다 따로다. 시대 파일은 const { makeTable, joinTables, build, geomOfUnit } = tableKit('<시대>')로 자기 꾸러미를 받아 쓴다
//   (modern.mjs의 'SA-12/자우프'와 early-modern.mjs의 같은 이름이 서로 부딪치지 않음). 한 꾸러미 안의 표끼리는 단위 이름·도형을 함께 쓴다(reuse).
// - 앞 권역 나라(ottoman 등)를 주인으로 써도 된다: 권역 파일의 extendable에 있으면 joinEras가 그 버전을 extensions로 옮겨 원래 권역 나라에 더한다(engine.mjs '앞 권역 나라 늘리기').
import { D, I, U, loadFragments } from '../../lib.mjs';

export const ME = loadFragments('middle-east');
const { F } = ME;

// adm0(Natural Earth 나라 코드)별 조각 id
export const idsOf = (...adm0s) => {
  const out = ME.ids.filter((id) => adm0s.includes(ME.props.get(id).adm0));
  if (!out.length) throw new Error(`middle-east table.mjs: 조각이 없는 나라 코드 ${adm0s.join(', ')}`);
  return out;
};
// ids에서 빼기. 빼려는 id가 목록에 없으면 멈춘다(조각 id 오타를 잡는다)
export const minus = (ids, ...out) => {
  for (const id of out) if (!ids.includes(id)) throw new Error(`middle-east table.mjs: 빼려는 조각 ${id}가 목록에 없음`);
  return ids.filter((id) => !out.includes(id));
};

// 시대 파일 하나의 꾸러미: 소유표 만들기·잇기·도형. era는 오류 글에 쓰는 시대 이름
export const tableKit = (era) => {
  const unitMake = new Map(); // 단위 이름 → null(통째 조각) 또는 도형을 만드는 함수 (이 꾸러미의 모든 표가 함께 씀)
  const splitIds = new Map(); // split이 돌려준 단위 이름 객체 → 그 묶음의 조각 id (reuse가 씀)

  const makeTable = (FROM, TO, renames = {}) => {
    const label = `middle-east ${era} ${FROM}~${TO - 1} 소유표`;
    const claimed = new Map();
    const used = new Set();
    const ownership = new Map();
    const claim = (id, by) => {
      if (!ME.props.has(id)) throw new Error(`${label}: 모르는 조각 id ${id}`);
      if (claimed.has(id)) throw new Error(`${label}: 조각 ${id}를 ${claimed.get(id)}와 ${by}에서 함께 씀`);
      claimed.set(id, by);
    };
    const use = (name) => {
      if (used.has(name)) throw new Error(`${label}: 단위 이름 ${name}이 겹침`);
      used.add(name);
    };
    const define = (name, make) => {
      if (unitMake.has(name) && (make !== null || unitMake.get(name) !== null)) {
        throw new Error(`${label}: 단위 이름 ${name}을 다시 정의함 (다른 표에서 나눈 조각을 쓰려면 reuse)`);
      }
      unitMake.set(name, make);
    };
    // 통째 조각. 단위 이름 = 조각 id
    const whole = (...ids) => {
      for (const id of ids) {
        claim(id, id);
        use(id);
        define(id, null);
      }
      return ids;
    };
    // 나눈 조각: 조각 묶음 ids를 parts의 도형으로 차례로 자른다(첫 부분 = I(F(ids), 도형1), 나머지 = D(F(ids), 도형1, …)). 반환: { 부분 이름: '묶음/부분' }
    const split = (name, ids, parts, restName) => {
      for (const id of ids) claim(id, name);
      const out = {};
      const shapes = [];
      for (const [part, shape] of parts) {
        const before = [...shapes];
        out[part] = `${name}/${part}`;
        use(out[part]);
        define(out[part], () => I(before.length ? D(F(...ids), ...before) : F(...ids), shape));
        shapes.push(shape);
      }
      out[restName] = `${name}/${restName}`;
      use(out[restName]);
      define(out[restName], () => D(F(...ids), ...shapes));
      splitIds.set(out, ids);
      return out;
    };
    const reuse = (out) => {
      const ids = splitIds.get(out);
      if (!ids) throw new Error(`${label}: reuse에는 split이 돌려준 객체를 준다`);
      for (const id of ids) claim(id, Object.values(out)[0]);
      for (const name of Object.values(out)) use(name);
      return out;
    };
    const own = (list, timeline) => {
      if (timeline[0]?.[0] !== FROM || timeline.some(([y], i) => !Number.isInteger(y) || (i && y <= timeline[i - 1][0]) || y >= TO)) {
        throw new Error(`${label}: ${list[0]} 등의 기간 ${JSON.stringify(timeline)} (첫 해는 ${FROM}, 해는 늘어나고 ${TO} 전)`);
      }
      for (const u of list) {
        if (!used.has(u)) throw new Error(`${label}: 이 표에서 정의하지 않은 단위 ${u}`);
        if (ownership.has(u)) throw new Error(`${label}: 단위 ${u}의 주인을 두 번 적음`);
        ownership.set(u, timeline);
      }
    };
    // 표 검사 뒤 해마다 [해, 나라|null, 단위 목록]
    const finish = () => {
      const unused = ME.ids.filter((id) => !claimed.has(id));
      if (unused.length) throw new Error(`${label}: 쓰지 않은 조각 ${unused.length}개 (${unused.slice(0, 10).join(', ')} …)`);
      const ownerless = [...used].filter((u) => !ownership.has(u));
      if (ownerless.length) throw new Error(`${label}: 주인을 적지 않은 단위 ${ownerless.join(', ')}`);
      const ownerAt = (timeline, year) => {
        const owner = timeline.filter(([y]) => y <= year).at(-1)[1];
        const rename = renames[owner];
        return rename && year >= rename[0] ? rename[1] : owner;
      };
      const rows = [];
      for (let year = FROM; year < TO; year++) {
        const byOwner = new Map();
        for (const [u, timeline] of ownership) {
          const owner = ownerAt(timeline, year);
          if (!byOwner.has(owner)) byOwner.set(owner, []);
          byOwner.get(owner).push(u);
        }
        for (const [owner, list] of byOwner) rows.push([year, owner, list.sort()]);
      }
      return rows;
    };
    return { FROM, TO, whole, split, reuse, own, finish };
  };

  // 표들(시대 순서, 기간이 이어져야 함)을 이어 해마다 나라별 단위 목록을 만들고, 같은 목록이 이어지는 기간을 한 버전으로 묶는다.
  // 반환: segments(나라 → [[from, to, 단위 목록]]), nullSegments(주인 없는 단위의 [[from, to, 목록]], 해마다 하나), TO(마지막 표의 끝)
  const joinTables = (tables) => {
    const segments = {};
    const nullSegments = [];
    tables.forEach((table, i) => {
      if (i && table.FROM !== tables[i - 1].TO) throw new Error(`middle-east ${era} table.mjs: 소유표 기간이 이어지지 않음`);
      for (const [year, owner, list] of table.finish()) {
        const segs = owner === null ? nullSegments : (segments[owner] ??= []);
        const last = segs.at(-1);
        if (last && last[1] === year && last[2].join('|') === list.join('|')) last[1] = year + 1;
        else segs.push([year, year + 1, list]);
      }
    });
    // 주인 없는 단위가 하나도 없는 해도 빈 목록으로 채운다(빈 땅 검사 구역이 해마다 이어지게)
    const TO = tables.at(-1).TO;
    const gaps = [];
    for (let year = tables[0].FROM; year < TO; year++) {
      const list = nullSegments.find(([from, to]) => from <= year && year < to)?.[2] ?? [];
      const last = gaps.at(-1);
      if (last && last[1] === year && last[2].join('|') === list.join('|')) last[1] = year + 1;
      else gaps.push([year, year + 1, list]);
    }
    return { segments, nullSegments: gaps, TO };
  };

  // 단위 목록 → 도형: 통째 조각은 F로 한 번에 합치고(arc 병합), 나눈 조각은 polyclip 합집합으로 더한다. 같은 목록은 한 번만 계산한다
  const unitGeom = new Map();
  const geomOfUnit = (u) => {
    if (!unitMake.has(u)) throw new Error(`middle-east ${era} table.mjs: 모르는 단위 ${u}`);
    if (!unitGeom.has(u)) unitGeom.set(u, unitMake.get(u)());
    return unitGeom.get(u);
  };
  const builtGeom = new Map();
  const build = (list) => {
    const key = list.join('|');
    if (!builtGeom.has(key)) {
      const ids = list.filter((u) => unitMake.get(u) === null);
      const parts = list.filter((u) => unitMake.get(u) !== null).map(geomOfUnit);
      builtGeom.set(key, parts.length ? U(...(ids.length ? [F(...ids)] : []), ...parts) : F(...list));
    }
    return builtGeom.get(key);
  };
  return { makeTable, joinTables, geomOfUnit, build };
};
