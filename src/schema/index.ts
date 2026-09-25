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
});
export type HistoryEvent = z.infer<typeof EventSchema>;

// ── 빌드 결과물 (public/data/) ──────────────────────────────

export type LonLat = [lon: number, lat: number];

export interface TimelineInterval {
  from: Year;
  /** 구간 끝 (미포함) */
  to: Year;
  /** map/ 아래 TopoJSON 파일명. 영토 데이터가 없는 구간은 null */
  file: string | null;
}

export interface TimelineIndex {
  range: [start: Year, end: Year];
  /** 지도가 바뀌는 연도 (이전/다음 변화 이동에 사용) */
  changeYears: Year[];
  intervals: TimelineInterval[];
}

/** 구간별 TopoJSON 안의 영토 Feature properties */
export interface MapFeatureProps {
  entityId: string;
  certainty: Certainty;
  anchor: LonLat;
}

/** 나라별 화살표 기준점. 영토 버전마다 하나 */
export type AnchorIndex = Record<string, { from: Year; to: Year | null; anchor: LonLat }[]>;

export type Year = z.infer<typeof Year>;
