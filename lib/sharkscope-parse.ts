import { extractStat } from "@/lib/utils/sharkscope-extract";

/** ROI da coluna "ROI total" (10d): apenas TotalROI (sem fallback para AvROI — evita confundir métricas). */
export function extractRoiTenDayForPlayerTable(raw: unknown): number | null {
  return extractStat(raw, "TotalROI");
}

export { extractStat, extractRemainingSearches } from "@/lib/utils/sharkscope-extract";

export {
  roiSeverity,
  reentrySeverity,
  earlyFinishSeverity,
  lateFinishSeverity,
} from "@/lib/utils/severity-thresholds";
