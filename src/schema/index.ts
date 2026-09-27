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
});

export const EntitySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈만 사용'),
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
  type: z.enum(['part_of', 'occupied_by', 'vassal_of', 'successor_of']),
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
  /** 전쟁 중 사건이면 그 날짜의 전선 (data/fronts/). 사건에 마우스를 올리면 그 전선과 작전 화살표를 보여 준다 */
  front: z.object({ war: z.string(), date: z.string() }).optional(),
});
export type HistoryEvent = z.infer<typeof EventSchema>;

// ── 전선 (DESIGN.md §4.5) ────────────────────────────────
// 연 단위 영토로는 보이지 않는 전쟁 중의 전선 변화를 날짜별 스냅샷으로 적는다.

/** 날짜: YYYY-MM-DD (천문 연도, 기원전은 앞에 -) */
export const FrontDate = z.string().regex(/^-?\d{1,4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식이어야 함');
const LonLatSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const FrontArrowSchema = z.object({
  /** north: 선의 북·서쪽 편, south: 남·동쪽 편 */
  side: z.enum(['north', 'south']),
  /** 작전 방향 (출발 → 도착, 중간 점 가능) */
  path: z.array(LonLatSchema).min(2),
  label: z.string().optional(),
});

export const FrontSnapshotSchema = z.object({
  date: FrontDate,
  title: z.string().min(1),
  summary: z.string().min(1),
  /** 전선: 서쪽 바다에서 동쪽 바다까지. 선의 북·서쪽이 north 편 점령 지역 */
  line: z.array(LonLatSchema).min(2),
  arrows: z.array(FrontArrowSchema).default([]),
});

export const FrontSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  /** 전쟁 동안 전선으로 대신 칠할 나라 (그 나라들의 영토를 합친 범위를 두 편으로 나눈다) */
  region: z.array(z.string()).min(1),
  sides: z.object({
    north: z.object({ name: z.string(), entity: z.string() }),
    south: z.object({ name: z.string(), entity: z.string() }),
  }),
  sources: z.array(z.string().min(1)).min(1),
  snapshots: z.array(FrontSnapshotSchema).min(1),
});
export type Front = z.infer<typeof FrontSchema>;

/** fronts.json: 빌드가 스냅샷마다 두 편의 점령 지역을 계산해 넣는다 */
export interface FrontSnapshotOut extends z.infer<typeof FrontSnapshotSchema> {
  year: Year;
  north: MultiPolygonCoords;
  south: MultiPolygonCoords;
  bbox: BBox;
}
export interface FrontIndexEntry extends Omit<Front, 'snapshots'> {
  /** 전선을 보여 주는 연도 범위 (포함) */
  from: Year;
  to: Year;
  snapshots: FrontSnapshotOut[];
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
