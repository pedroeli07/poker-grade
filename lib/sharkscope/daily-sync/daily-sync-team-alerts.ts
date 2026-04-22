import type { Prisma } from "@prisma/client";
import { SHARKSCOPE_TEAM_METRIC_EPS } from "@/lib/constants/sharkscope/daily-sync";
import type { GroupTenDMetric } from "@/lib/types/sharkscope/daily-sync";

function mean(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Compara métricas 10d do grupo SharkScope com a média de todos os grupos sincronizados nesta corrida.
 * ROI abaixo da média = alerta; FP/FT acima da média = pior que o time (alerta).
 */
export function buildTeamRelativeAlerts(groups: GroupTenDMetric[]): Prisma.AlertLogCreateManyInput[] {
  const out: Prisma.AlertLogCreateManyInput[] = [];
  const roiVals = groups.map((g) => g.roi).filter((v): v is number => v != null);
  const fpVals = groups.map((g) => g.fp).filter((v): v is number => v != null);
  const ftVals = groups.map((g) => g.ft).filter((v): v is number => v != null);
  const avgRoi = roiVals.length >= 2 ? mean(roiVals) : null;
  const avgFp = fpVals.length >= 2 ? mean(fpVals) : null;
  const avgFt = ftVals.length >= 2 ? mean(ftVals) : null;
  const eps = SHARKSCOPE_TEAM_METRIC_EPS;

  for (const g of groups) {
    const ctxBase = { groupName: g.groupName, period: "10d" };
    if (avgRoi != null && g.roi != null && g.roi < avgRoi - eps) {
      const severity = g.roi < avgRoi - 15 ? "red" : "yellow";
      for (const playerId of g.memberIds) {
        out.push({
          playerId,
          alertType: "team_roi_below_avg",
          severity,
          metricValue: g.roi,
          threshold: avgRoi,
          context: { ...ctxBase, avgRoi, metric: "TotalROI" } as Prisma.InputJsonValue,
        });
      }
    }
    if (avgFp != null && g.fp != null && g.fp > avgFp + eps) {
      const severity = g.fp > avgFp + 5 ? "red" : "yellow";
      for (const playerId of g.memberIds) {
        out.push({
          playerId,
          alertType: "team_fp_above_avg",
          severity,
          metricValue: g.fp,
          threshold: avgFp,
          context: { ...ctxBase, avgFp, metric: "EarlyFinish" } as Prisma.InputJsonValue,
        });
      }
    }
    if (avgFt != null && g.ft != null && g.ft > avgFt + eps) {
      const severity = g.ft > avgFt + 5 ? "red" : "yellow";
      for (const playerId of g.memberIds) {
        out.push({
          playerId,
          alertType: "team_ft_above_avg",
          severity,
          metricValue: g.ft,
          threshold: avgFt,
          context: { ...ctxBase, avgFt, metric: "LateFinish" } as Prisma.InputJsonValue,
        });
      }
    }
  }
  return out;
}
