// 데이터 스키마 (DESIGN.md §4). 빌드 스크립트와 앱이 함께 쓴다.
// 빌드 스크립트는 Node의 타입 제거 기능으로 이 파일을 직접 불러오므로
// 상대 경로 import에는 .ts 확장자를 붙이고, enum 같은 런타임 문법은 쓰지 않는다.
import { z } from 'zod';

/** 천문 연도: 기원전 1년 = 0, 기원전 57년 = -56 */
export const Year = z.number().int();

const Names = z.object({
  ko: z.string().min(1),
  en: z.string().optional(),
  hanja: z.string().optional(),
  /** 원어 표기 (예: Königreich Preußen). 한자 이름이 없을 때 이름 옆에 보인다 (2026-10-02, 유럽 권역) */
  native: z.string().optional(),
});

export const EntitySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈만 사용'),
    /**
     * polity: 나라, region: 나라가 아닌 지역 항목(귀속 논쟁 지역, 선사 시대 한반도 등).
     * 빌드가 붙이는 권역 키 `region`(korea·europe 등 지리적 권역, regions.ts)과는 다른 것이다
     */
    level: z.enum(['polity', 'region']),
    names: Names,
    /** 존속 시작 연도 (포함) */
    from: Year,
    /** 존속 마지막 연도 (포함). null이면 현재까지 */
    to: Year.nullable(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb 형식이어야 함').optional(),
    summary: z.string().optional(),
    /** 수록 근거 (DESIGN.md D9). 나라(polity)는 필수, 지역(region)은 선택 */
    basis: z
      .object({
        type: z.enum(['primary_source', 'national_institution']),
        refs: z.array(z.string().min(1)).min(1, '수록 근거(refs)가 비어 있음'),
        foundingNote: z.string().optional(),
      })
      .optional(),
  })
  .refine((e) => e.level !== 'polity' || e.basis, { message: '나라(polity)는 수록 근거(basis)가 필수', path: ['basis'] })
  .refine((e) => e.to === null || e.to >= e.from, { message: 'to가 from보다 앞섬', path: ['to'] });
export type Entity = z.infer<typeof EntitySchema>;

export const RelationSchema = z.object({
  /**
   * claimed_by: 귀속이 불확실한 지역(subject)을 그 나라(object)의 땅으로 보는 견해가 있음.
   * 후보 나라들의 색을 번갈아 빗금으로 칠하고, 후보 나라를 고르면 선택 테두리에 이 지역도 포함한다 (DESIGN.md §4.3)
   */
  type: z.enum(['part_of', 'occupied_by', 'vassal_of', 'successor_of', 'claimed_by']),
  subject: z.string(),
  object: z.string(),
  from: Year,
  to: Year.nullable(),
});
export type Relation = z.infer<typeof RelationSchema>;

export const Certainty = z.enum(['confirmed', 'estimated', 'disputed']);
export type Certainty = z.infer<typeof Certainty>;

/** data/geo/*.geojson 각 Feature의 properties. 영토 구간은 [from, to) */
export const TerritoryPropsSchema = z.object({
  entityId: z.string(),
  from: Year,
  to: Year.nullable(),
  certainty: Certainty,
  source: z.string().min(1),
});
export type TerritoryProps = z.infer<typeof TerritoryPropsSchema>;

/** 사건의 영향 관계. 선택한 나라가 to면 들어오는 화살표, from이면 나가는 화살표 */
export const EventLinkSchema = z.object({
  from: z.string(),
  to: z.string(),
  note: z.string().optional(),
});
export type EventLink = z.infer<typeof EventLinkSchema>;

const Text = z.object({ ko: z.string().min(1), en: z.string().optional() });

export const EventSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  year: Year,
  endYear: Year.optional(),
  precision: z.enum(['year', 'decade', 'century']).default('year'),
  title: Text,
  summary: Text,
  subjects: z.array(z.string()).min(1),
  links: z.array(EventLinkSchema).default([]),
  tags: z.array(z.string()).default([]),
  sources: z.array(z.string().min(1)).min(1, '출처(sources)가 비어 있음'),
  /** 전쟁 중 사건이면 그 날짜의 전선 (data/wars/). theater가 없으면 그 전쟁의 첫 전역 */
  front: z.object({ war: z.string(), theater: z.string().optional(), date: z.string() }).optional(),
  /**
   * 싸움이 벌어진 곳. 전쟁 보기가 없는 전쟁·전투는 그 해 지도에 작은 전투 표시(⊗)로 나타난다 (DESIGN.md §4.5)
   * 전쟁 보기가 있는 사건(front)에는 적지 않는다
   */
  places: z
    .array(z.object({ name: z.string().min(1), at: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]) }))
    .default([]),
});
export type HistoryEvent = z.infer<typeof EventSchema>;

// ── 전쟁 (DESIGN.md §4.5) ────────────────────────────────
// 연 단위 영토로는 보이지 않는 전쟁 중의 변화를 전역(戰域)별 날짜 스냅샷으로 적는다.
// 전쟁 → 진영·참전국 → 전역 → 스냅샷(점령 지역·전선·작전 화살표)

/** 날짜: YYYY-MM-DD (천문 연도, 기원전은 앞에 -) */
export const FrontDate = z.string().regex(/^-?\d{1,4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 함');
const LonLatSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const Id = z.string().regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈만 사용');

/** 진영: 지도에서 한 색으로 칠하는 편. entity는 색·이름표·클릭 대상이 되는 대표 나라 */
export const FactionSchema = z.object({
  id: Id,
  name: z.string().min(1),
  entity: z.string(),
  /** 대표 나라 색 대신 쓸 색 */
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

/** 참전국. 편을 바꾼 나라는 기간을 나눠 두 번 적는다 (예: 이탈리아 1940~1943 추축국, 1943~ 연합국) */
export const ParticipantSchema = z.object({
  entity: z.string(),
  faction: z.string(),
  /** 참전 시작·끝 날짜. 없으면 전쟁 전체 기간 */
  from: FrontDate.optional(),
  to: FrontDate.optional(),
});

export const FrontArrowSchema = z.object({
  faction: z.string(),
  /** 작전 방향 (출발 → 도착, 중간 점 가능) */
  path: z.array(LonLatSchema).min(2),
  label: z.string().optional(),
});

/** 선으로 가르기: 전역의 replaces 나라 영토를 합친 범위를 선의 북·서쪽(north)과 남·동쪽(south)으로 나눈다 */
export const FrontSplitSchema = z.object({
  /** 서쪽(또는 남해안) 바다에서 동쪽 바다까지 */
  line: z.array(LonLatSchema).min(2),
  north: z.string(),
  south: z.string(),
});

/**
 * 점령 지역. 방법 둘 중 하나:
 * - entities: 그 나라들의 그 해 영토 전체 (예: 독일에 점령된 폴란드 = poland)
 * - geojson: data/wars/ 기준 경로의 GeoJSON 폴리곤 (QGIS로 그림)
 * 뒤에 적은 지역이 앞의 지역(선으로 가른 지역 포함)을 덮는다.
 */
export const FrontAreaSchema = z
  .object({
    faction: z.string(),
    entities: z.array(z.string()).min(1).optional(),
    geojson: z.string().optional(),
  })
  .refine((a) => !!a.entities !== !!a.geojson, { message: 'entities와 geojson 중 하나만 적어야 함' });

/** 진군 경로: 군대가 지나간 지점들. 날짜가 있는 지점까지를 "지나온 길"로 그린다 (날짜 없는 지점은 앞 지점을 따른다) */
export const RouteSchema = z.object({
  name: z.string().min(1),
  faction: z.string(),
  points: z
    .array(z.object({ at: LonLatSchema, date: FrontDate.optional(), label: z.string().optional() }))
    .min(2),
});

/** 전투. 그 날짜부터 전쟁 보기에 나타난다 */
export const BattleSchema = z.object({
  name: z.string().min(1),
  at: LonLatSchema,
  date: FrontDate,
  /** 이긴 진영 (없으면 승패 불분명) */
  winner: z.string().optional(),
  summary: z.string().optional(),
});

/** 거점: 그 스냅샷 때 도시·요새가 어느 진영에 속했는지 (점령 지역으로 나타내기 어려운 도시 국가 등) */
export const HoldSchema = z.object({
  name: z.string().min(1),
  at: LonLatSchema,
  faction: z.string(),
});

export const FrontSnapshotSchema = z
  .object({
    date: FrontDate,
    title: z.string().min(1),
    summary: z.string().min(1),
    split: FrontSplitSchema.optional(),
    areas: z.array(FrontAreaSchema).default([]),
    /** 따로 그을 전선 (split의 선은 자동으로 들어간다) */
    lines: z.array(z.array(LonLatSchema).min(2)).default([]),
    arrows: z.array(FrontArrowSchema).default([]),
    holds: z.array(HoldSchema).default([]),
  })
  .refine((s) => s.split || s.areas.length > 0 || s.holds.length > 0, { message: '점령 지역(split·areas)이나 거점(holds)이 없음' });

/** 전역: 한 전쟁 안에서 따로 보는 지역 (예: 제2차 세계 대전의 유럽·태평양). 전역이 하나뿐인 전쟁도 있다 */
export const TheaterSchema = z.object({
  id: Id,
  name: z.string().min(1),
  /** 전쟁 보기에서 영토 대신 점령 지역으로 칠할 나라들 (split은 이 나라들의 영토를 나눈다) */
  replaces: z.array(z.string()).default([]),
  /** 평소 지도에 전쟁 표시를 둘 곳. 없으면 첫 스냅샷 범위의 가운데 */
  marker: LonLatSchema.optional(),
  /** 전쟁 보기를 열 때 확대할 범위 [[서, 남], [동, 북]]. 없으면 점령 지역 범위에 여백을 둔다 */
  bounds: z.tuple([LonLatSchema, LonLatSchema]).optional(),
  routes: z.array(RouteSchema).default([]),
  battles: z.array(BattleSchema).default([]),
  snapshots: z.array(FrontSnapshotSchema).min(1),
});

export const WarSchema = z.object({
  id: Id,
  name: z.string().min(1),
  factions: z.array(FactionSchema).min(2),
  participants: z.array(ParticipantSchema).default([]),
  sources: z.array(z.string().min(1)).min(1),
  theaters: z.array(TheaterSchema).min(1),
});
export type War = z.infer<typeof WarSchema>;
export type Faction = z.infer<typeof FactionSchema>;
export type FrontArrow = z.infer<typeof FrontArrowSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Battle = z.infer<typeof BattleSchema>;
export type Hold = z.infer<typeof HoldSchema>;

/** wars.json: 빌드가 스냅샷마다 진영별 점령 지역을 계산해 넣는다 */
export interface FrontAreaOut {
  faction: string;
  coords: MultiPolygonCoords;
  bbox: BBox;
}
export interface FrontSnapshotOut {
  date: string;
  year: Year;
  title: string;
  summary: string;
  /** 진영마다 하나 (여러 조각이면 MultiPolygon) */
  areas: FrontAreaOut[];
  lines: LonLat[][];
  arrows: FrontArrow[];
  /** 영토 대신 칠하는 나라의 이름표 위치 (그 나라 진영의 점령 지역 안쪽) */
  labels: { entity: string; anchor: LonLat }[];
  holds: Hold[];
  bbox: BBox;
}
export interface TheaterOut {
  id: string;
  name: string;
  /** 전역 기간 (포함): 첫 스냅샷 ~ 마지막 스냅샷 연도 */
  from: Year;
  to: Year;
  replaces: string[];
  marker: LonLat;
  bounds: [[number, number], [number, number]];
  routes: Route[];
  battles: Battle[];
  snapshots: FrontSnapshotOut[];
}
export interface WarIndexEntry {
  id: string;
  name: string;
  from: Year;
  to: Year;
  factions: Faction[];
  /** 참전 기간은 연도로 바꿔 둔다 (포함) */
  participants: { entity: string; faction: string; from: Year; to: Year }[];
  sources: string[];
  theaters: TheaterOut[];
  /** 권역: 빌드가 data/wars 파일 이름에서 정한다 (regions.ts) */
  region: string;
}
type MultiPolygonCoords = [number, number][][][];

// ── 빌드 결과물 (public/data/) ──────────────────────────────

export type LonLat = [lon: number, lat: number];
export type BBox = [west: number, south: number, east: number, north: number];

/**
 * 지도 정밀도 단계 (DESIGN.md §3). 움직이는 동안에는 가벼운 단계, 멈추거나 확대하면 정밀한 단계를 쓴다.
 * - low: 1:110m 해안선 + 강한 단순화
 * - mid: 1:50m 해안선 + 약한 단순화
 * - high: 1:50m 해안선 원본
 */
export const LODS = ['low', 'mid', 'high'] as const;
export type Lod = (typeof LODS)[number];

export interface TimelineIndex {
  range: [start: Year, end: Year];
  /** 지도가 바뀌는 연도 (이전/다음 변화 이동에 사용) */
  changeYears: Year[];
}

/**
 * 영토 버전 목록 (territories.json). 도형은 나라별 파일(geo/<lod>/<entityId>.topo.json)에
 * 한 번씩만 저장하고, 브라우저가 해당 연도의 버전을 모아 그린다.
 */
export interface TerritoryIndexEntry {
  /** 도형 파일 안의 geometry id: `${entityId}@${from}` */
  key: string;
  entityId: string;
  from: Year;
  to: Year | null;
  certainty: Certainty;
  /** 화살표·이름표 기준점 */
  anchor: LonLat;
  /** 화면 밖 영토를 건너뛰는 데 쓰는 경위도 범위 */
  bbox: BBox;
}

export type Year = z.infer<typeof Year>;
