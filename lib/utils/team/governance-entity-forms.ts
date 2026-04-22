import { format } from "date-fns";
import { ALERT_RESPONSIBLE_ROLE_OPTIONS } from "@/lib/constants/team/governance-mural-ui";
import { SEVERITY_ALERT, SEVERITY_CRITICAL, SEVERITY_INFO, SEVERITY_WARNING } from "@/lib/constants/team/severity";
import type { TeamAlertRuleUpsert } from "@/lib/types/team/alerts";
import type { TeamDecisionUpsert } from "@/lib/types/team/governance";
import type { GovernanceAlertRuleDTO, GovernanceDecisionDTO } from "@/lib/data/team/governance-page";
import type { GovernanceAlertFormState, GovernanceDecisionFormState } from "@/lib/types/team/governance-forms";

export function parseDecisionTagsInput(text: string): string[] {
  return text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function decisionDtoToForm(d: GovernanceDecisionDTO): GovernanceDecisionFormState {
  return {
    title: d.title,
    summary: d.summary,
    impact: d.impact,
    area: d.area,
    status: d.status,
    visibility: d.visibility,
    tagsText: d.tags?.join(", ") ?? "",
    decidedAtLocal: d.decidedAt ? format(new Date(d.decidedAt), "yyyy-MM-dd'T'HH:mm") : "",
  };
}

export function buildTeamDecisionUpsert(
  form: GovernanceDecisionFormState,
  editingId: string | null,
): TeamDecisionUpsert {
  const tags = parseDecisionTagsInput(form.tagsText);
  const base: TeamDecisionUpsert = {
    title: form.title.trim(),
    summary: form.summary.trim(),
    impact: form.impact.trim(),
    area: form.area,
    tags,
    status: form.status,
    visibility: form.visibility,
  };
  if (editingId) {
    return {
      ...base,
      id: editingId,
      ...(form.decidedAtLocal ? { decidedAt: new Date(form.decidedAtLocal) } : {}),
    };
  }
  return base;
}

function normalizeAlertResponsibleName(r: GovernanceAlertRuleDTO): string {
  const allow = ALERT_RESPONSIBLE_ROLE_OPTIONS as readonly string[];
  if (r.responsibleName && allow.includes(r.responsibleName)) return r.responsibleName;
  if (r.responsibleName?.trim()) return r.responsibleName.trim();
  if (r.assignee) {
    return (r.assignee.displayName || r.assignee.email || allow[0])!;
  }
  return allow[0]!;
}

function normalizeAlertSeverity(sev: string): string {
  if (sev === SEVERITY_ALERT) return SEVERITY_WARNING;
  const allowed = [SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_CRITICAL];
  if (allowed.includes(sev as (typeof allowed)[number])) return sev;
  return SEVERITY_INFO;
}

export function alertRuleDtoToForm(r: GovernanceAlertRuleDTO): GovernanceAlertFormState {
  return {
    name: r.name,
    area: r.area,
    metric: r.metric,
    operator: r.operator,
    threshold: r.threshold,
    severity: normalizeAlertSeverity(r.severity),
    authUserId: null,
    responsibleName: normalizeAlertResponsibleName(r),
  };
}

export function buildTeamAlertRuleUpsert(
  form: GovernanceAlertFormState,
  editingId: string | null,
): TeamAlertRuleUpsert {
  return {
    name: form.name.trim(),
    area: form.area,
    metric: form.metric,
    operator: form.operator,
    threshold: Number(form.threshold),
    severity: form.severity,
    authUserId: null,
    responsibleName: form.responsibleName?.trim() || ALERT_RESPONSIBLE_ROLE_OPTIONS[0]!,
    ...(editingId ? { id: editingId } : {}),
  };
}
