import { SCHEDULING_DASHBOARD_TONE } from "@/lib/constants/jogador";
import { schedulingCategory } from "@/lib/utils/player";
export function schedulingDashboardTone(scheduling: string | null) {
  const cat = schedulingCategory(scheduling);
  if (cat === "extra") return SCHEDULING_DASHBOARD_TONE.extra;
  if (cat === "played") return SCHEDULING_DASHBOARD_TONE.played;
  return SCHEDULING_DASHBOARD_TONE.missed;
}
