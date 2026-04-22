import {
  ALERT_AREA_OPTIONS,
  ALERT_METRIC_OPTIONS,
  ALERT_RESPONSIBLE_ROLE_OPTIONS,
} from "@/lib/constants/team/governance-mural-ui";
import { SEVERITY_INFO } from "@/lib/constants/team/severity";
import type { GovernanceAlertFormState, GovernanceDecisionFormState } from "@/lib/types/team/governance-forms";

export const EMPTY_GOVERNANCE_DECISION_FORM: GovernanceDecisionFormState = {
  title: "",
  summary: "",
  impact: "",
  area: "Geral",
  status: "PENDING",
  visibility: "ALL",
  tagsText: "",
  decidedAtLocal: "",
};

export function emptyGovernanceAlertForm(): GovernanceAlertFormState {
  return {
    name: "",
    area: ALERT_AREA_OPTIONS[0]!,
    metric: ALERT_METRIC_OPTIONS[0]!,
    operator: ">",
    threshold: 0,
    severity: SEVERITY_INFO,
    authUserId: null,
    responsibleName: ALERT_RESPONSIBLE_ROLE_OPTIONS[0]!,
  };
}
