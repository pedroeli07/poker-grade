import type { ColumnOptions, FilterMap } from "@/lib/types/primitives";

export const GOVERNANCE_DECISION_FILTER_COLS = [
  "area",
  "status",
  "visibility",
  "author",
  "tag",
] as const;

export type GovernanceDecisionColKey = (typeof GOVERNANCE_DECISION_FILTER_COLS)[number];
export type GovernanceDecisionColumnFilters = FilterMap<GovernanceDecisionColKey>;
export type GovernanceDecisionColumnOptions = ColumnOptions<GovernanceDecisionColKey>;

export type GovernanceDecisionsSetCol = (col: GovernanceDecisionColKey) => (next: Set<string> | null) => void;

export type GovernanceDecisionSortKey =
  | "title"
  | "decidedAt"
  | "area"
  | "status"
  | "visibility"
  | "authorName";
