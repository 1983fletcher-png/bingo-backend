/**
 * Observance schema: facts in rule, verification auditable, authorship clear.
 * @see docs/OBSERVANCES-SCHEMA-AND-WORKFLOW (when added)
 */

export type ObservanceType =
  | "official"
  | "informal"
  | "awareness"
  | "religious"
  | "commercial"
  | "community-created";

export type ObservanceCategory =
  | "food"
  | "drink"
  | "candy"
  | "holiday"
  | "music"
  | "games"
  | "wellness"
  | "education"
  | "family"
  | "seniors"
  | "community";

export type ObservanceRuleKind = "fixed" | "relative" | "computed";

export type ObservanceRule = {
  kind: ObservanceRuleKind;
  month?: number;
  day?: number;
  after_holiday_id?: string;
  offset_days?: number;
  algorithm?: "easter_based" | "nth_weekday";
  params?: Record<string, unknown>;
};

export type VerificationSource = {
  name: string;
  url?: string;
  checked_at: string;
};

export type ObservanceVerification = {
  confidence: "high" | "medium" | "low";
  method: "multi-source" | "single-source" | "authoritative" | "original";
  sources_checked: VerificationSource[];
  notes?: string;
  last_verified_at: string;
};

export type ObservanceAuthorship = {
  created_by: "community" | "playroom" | "external";
  creator_name?: string;
  created_at?: string;
  attribution_text?: string;
};

export type ObservanceStatus = "active" | "deprecated" | "experimental";

export type Observance = {
  id: string;
  name: string;
  short_name?: string;
  type: ObservanceType;
  categories: ObservanceCategory[];
  country: string;
  subdivisions?: string[];
  rule: ObservanceRule;
  verification: ObservanceVerification;
  authorship: ObservanceAuthorship;
  status: ObservanceStatus;
  activity_hint?: string;
  why_matters?: string;
  search_keywords?: string[];
  first_observed_year?: number;
  last_updated_at: string;
};

/** Calendar API returns observances with resolved month/day for a given year. */
export type CalendarObservance = Observance & {
  month: number;
  day: number;
};
