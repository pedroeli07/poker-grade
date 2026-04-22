import type { GovernanceDecisionDTO } from "@/lib/data/team/governance-page";

const VALID_STATUS = new Set(["PENDING", "APPROVED", "IMPLEMENTED"]);
const VALID_VISIBILITY = new Set(["ALL", "STAFF", "ADMIN_ONLY"]);

export type GovernanceDecisionFormFields = {
  title: string;
  summary: string;
  impact: string;
  area: string;
  status: string;
  visibility: string;
  /** Tags ativas (chips). */
  selectedTags: string[];
  decidedAtLocal: string;
};

export const GOVERNANCE_DECISION_FORM_EMPTY: GovernanceDecisionFormFields = {
  title: "",
  summary: "",
  impact: "",
  area: "Geral",
  status: "PENDING",
  visibility: "STAFF",
  selectedTags: [],
  decidedAtLocal: "",
};

function normalizeStatusForForm(raw: string): string {
  if (VALID_STATUS.has(raw)) return raw;
  if (raw === "ARCHIVED") return "IMPLEMENTED";
  return "PENDING";
}

function normalizeVisibilityForForm(raw: string): string {
  if (raw === "DRI") return "STAFF";
  if (VALID_VISIBILITY.has(raw)) return raw;
  return "ALL";
}

export function decisionDtoToGovernanceForm(
  initial: GovernanceDecisionDTO | null,
): GovernanceDecisionFormFields {
  if (initial) {
    return {
      title: initial.title,
      summary: initial.summary,
      impact: initial.impact,
      area: initial.area,
      status: normalizeStatusForForm(initial.status),
      visibility: normalizeVisibilityForForm(initial.visibility),
      selectedTags: initial.tags?.length ? [...initial.tags] : [],
      decidedAtLocal: initial.decidedAt
        ? new Date(initial.decidedAt).toISOString().slice(0, 16)
        : "",
    };
  }
  return { ...GOVERNANCE_DECISION_FORM_EMPTY, decidedAtLocal: "" };
}

export function toggleTagInList(tags: string[], tag: string): string[] {
  if (tags.includes(tag)) {
    return tags.filter((t) => t !== tag);
  }
  return [...tags, tag];
}
