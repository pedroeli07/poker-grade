import type { TeamIndicatorKpiStatus } from "@/lib/utils/team/team-indicator-kpi";

export const TEAM_INDICATOR_KPI_STATUS: Record<
  TeamIndicatorKpiStatus,
  {
    border: string;
    dot: string;
    badge: string;
    label: string;
  }
> = {
  success: {
    border: "border-l-4 border-l-emerald-500",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
    label: "No alvo",
  },
  warning: {
    border: "border-l-4 border-l-amber-400",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-800",
    label: "Atenção",
  },
  danger: {
    border: "border-l-4 border-l-red-500",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800",
    label: "Crítico",
  },
  neutral: {
    border: "border-l-4 border-l-muted-foreground/40",
    dot: "bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
    label: "Neutro",
  },
};

export function getTeamIndicatorKpiStatusConfig(
  s: string,
): (typeof TEAM_INDICATOR_KPI_STATUS)[TeamIndicatorKpiStatus] {
  return (
    TEAM_INDICATOR_KPI_STATUS[s as TeamIndicatorKpiStatus] ?? TEAM_INDICATOR_KPI_STATUS.neutral
  );
}
