import {
  EARLY_FINISH_SEVERITY_THRESHOLDS,
  LATE_FINISH_SEVERITY_THRESHOLDS,
  REENTRY_SEVERITY_THRESHOLDS,
  ROI_SEVERITY_THRESHOLDS,
} from "@/lib/constants/severity-metrics";
import type { MetricSeverity, SeverityThreshold } from "@/lib/types/primitives";

function thresholdSeverity(
  value: number,
  thresholds: SeverityThreshold[],
  above: boolean
): MetricSeverity {
  for (const [limit, sev] of thresholds) {
    if (above ? value > limit : value < limit) return sev;
  }
  return "green";
}

const mkSeverity = (thresholds: SeverityThreshold[], above: boolean) => (value: number) =>
  thresholdSeverity(value, thresholds, above);

export const roiSeverity = mkSeverity(ROI_SEVERITY_THRESHOLDS, false);
export const reentrySeverity = mkSeverity(REENTRY_SEVERITY_THRESHOLDS, true);
export const earlyFinishSeverity = mkSeverity(EARLY_FINISH_SEVERITY_THRESHOLDS, true);
export const lateFinishSeverity = mkSeverity(LATE_FINISH_SEVERITY_THRESHOLDS, false);
