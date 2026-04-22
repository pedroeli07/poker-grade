import { requireSession } from "@/lib/auth/session";
import { listTeamAlertRules } from "@/lib/queries/db/team/alerts/read";
import { listTeamDri } from "@/lib/queries/db/team/governance/dri-read";
import { listTeamDecisions } from "@/lib/queries/db/team/governance/decision-read";
import { listStaffUsersForSelect } from "@/lib/queries/db/team/staff-users";
import { UserRole } from "@prisma/client";

export type GovernanceAuthorDTO = { id: string; displayName: string | null; email: string };

export type GovernanceDecisionDTO = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  decidedAt: string;
  area: string;
  tags: string[];
  status: string;
  visibility: string;
  author: GovernanceAuthorDTO | null;
};

export type GovernanceAlertRuleDTO = {
  id: string;
  name: string;
  area: string;
  metric: string;
  operator: string;
  threshold: number;
  severity: string;
  authUserId: string | null;
  responsibleName: string | null;
  assignee: GovernanceAuthorDTO | null;
};

export type GovernanceDriDTO = {
  id: string;
  area: string;
  rules: string;
  authUserId: string | null;
  responsibleName: string | null;
  user: { id: string; displayName: string | null; email: string } | null;
};

export type GovernanceStaffOption = {
  id: string;
  name: string;
  role: UserRole;
};

export type GovernancePageData = {
  dris: GovernanceDriDTO[];
  decisions: GovernanceDecisionDTO[];
  alertRules: GovernanceAlertRuleDTO[];
  staff: GovernanceStaffOption[];
};

const DRI_STAFF_ROLE_ORDER: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
  UserRole.VIEWER,
];

export async function getGovernancePageData(): Promise<GovernancePageData> {
  await requireSession();
  const [dris, decisions, rules, staff] = await Promise.all([
    listTeamDri(),
    listTeamDecisions(),
    listTeamAlertRules(),
    listStaffUsersForSelect(),
  ]);

  const driDtos: GovernanceDriDTO[] = dris.map((d) => ({
    id: d.id,
    area: d.area,
    rules: d.rules,
    authUserId: d.authUserId,
    responsibleName: d.responsibleName,
    user: d.authUser
      ? {
          id: d.authUser.id,
          displayName: d.authUser.displayName,
          email: d.authUser.email,
        }
      : null,
  }));

  const decisionDtos: GovernanceDecisionDTO[] = decisions.map((d) => ({
    id: d.id,
    title: d.title,
    summary: d.summary,
    impact: d.impact,
    decidedAt: d.decidedAt.toISOString(),
    area: d.area,
    tags: d.tags ?? [],
    status: d.status,
    visibility: d.visibility,
    author: d.author
      ? {
          id: d.author.id,
          displayName: d.author.displayName,
          email: d.author.email,
        }
      : null,
  }));

  const alertDtos: GovernanceAlertRuleDTO[] = rules.map((r) => ({
    id: r.id,
    name: r.name,
    area: r.area,
    metric: r.metric,
    operator: r.operator,
    threshold: r.threshold,
    severity: r.severity,
    authUserId: r.authUserId,
    responsibleName: r.responsibleName,
    assignee: r.assignee
      ? {
          id: r.assignee.id,
          displayName: r.assignee.displayName,
          email: r.assignee.email,
        }
      : null,
  }));

  const staffList: GovernanceStaffOption[] = staff
    .map((u) => ({
      id: u.id,
      name: (u.displayName || u.email).trim(),
      role: u.role,
    }))
    .sort((a, b) => {
      const oa = DRI_STAFF_ROLE_ORDER.indexOf(a.role);
      const ob = DRI_STAFF_ROLE_ORDER.indexOf(b.role);
      if (oa !== ob) return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob);
      return a.name.localeCompare(b.name, "pt", { sensitivity: "base" });
    });

  return { dris: driDtos, decisions: decisionDtos, alertRules: alertDtos, staff: staffList };
}
