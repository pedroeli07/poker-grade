import { endOfISOWeek, getISOWeek, getISOWeekYear, startOfISOWeek } from "date-fns";

export function formatIsoWeekLabel(d = new Date()): string {
  const y = getISOWeekYear(d);
  const w = getISOWeek(d);
  return `Semana ${y}-W${String(w).padStart(2, "0")}`;
}

export function getIsoWeekRange(d = new Date()): { start: Date; end: Date } {
  return {
    start: startOfISOWeek(d),
    end: endOfISOWeek(d),
  };
}
