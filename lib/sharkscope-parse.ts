import { extractStat } from "./utils/app";

/** ROI da coluna "ROI total" (10d): apenas TotalROI (sem fallback para AvROI — evita confundir métricas). */
export function extractRoiTenDayForPlayerTable(raw: unknown): number | null {
  return extractStat(raw, "TotalROI");
}

export {
  extractStat,
  extractRemainingSearches,
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "./utils/app";
