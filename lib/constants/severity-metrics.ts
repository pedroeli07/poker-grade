import type { SeverityThreshold } from "@/lib/types/primitives";

export const ROI_SEVERITY_THRESHOLDS: SeverityThreshold[] = [
  [-40, "red"],
  [-20, "yellow"],
];

export const REENTRY_SEVERITY_THRESHOLDS: SeverityThreshold[] = [
  [25, "red"],
  [18, "yellow"],
];

export const EARLY_FINISH_SEVERITY_THRESHOLDS: SeverityThreshold[] = [
  [8, "red"],
  [6, "yellow"],
];

export const LATE_FINISH_SEVERITY_THRESHOLDS: SeverityThreshold[] = [
  [8, "red"],
  [10, "yellow"],
];
