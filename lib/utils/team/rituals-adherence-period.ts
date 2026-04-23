import {
  addMonths,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { RitualDTO } from "@/lib/data/team/rituals-page";

export type RitualAdherenceSegment = "fulfilled" | "scheduled" | "overdue" | "outside";

export type RitualAdherenceRowModel = {
  ritual: RitualDTO;
  execCountInPeriod: number;
  segment: RitualAdherenceSegment;
  /** 0–100 para barra de progresso (cumprido no mês) */
  progressPct: number;
  driLabel: string;
};

export type RitualAdherenceSummary = {
  /** Rituais que já deveriam contar no mês (início ≤ fim do mês) */
  applicableCount: number;
  /** Pelo menos 1 execução no período */
  fulfilledCount: number;
  /** Aplicáveis, sem execução no período (agendado ou atrasado) */
  pendingCount: number;
  /** Soma de execuções com data no período */
  executionsInPeriodTotal: number;
  /** Taxa: cumpridos / aplicáveis (0–100) */
  adherenceRatePct: number;
};

export function ritualAdherencePeriodBounds(refMonth: Date): { start: Date; end: Date } {
  const start = startOfDay(startOfMonth(refMonth));
  const end = endOfDay(endOfMonth(refMonth));
  return { start, end };
}

export function countExecutionsInPeriod(
  ritual: RitualDTO,
  periodStart: Date,
  periodEnd: Date,
): number {
  let n = 0;
  for (const e of ritual.executions) {
    const t = new Date(e.executedAt);
    if (t >= periodStart && t <= periodEnd) n += 1;
  }
  return n;
}

function driLabel(r: RitualDTO): string {
  return r.dri?.displayName || r.responsibleName || "—";
}

/**
 * Adesão por mês: conta execuções cuja data cai no mês de referência.
 * Rituais com `startAt` após o fim do mês aparecem como "fora do período".
 */
export function buildRitualsAdherenceRows(
  rituals: RitualDTO[],
  refMonth: Date,
  now: Date = new Date(),
): RitualAdherenceRowModel[] {
  const { start, end } = ritualAdherencePeriodBounds(refMonth);

  return rituals.map((ritual) => {
    const startAt = new Date(ritual.startAt);
    const execCountInPeriod = countExecutionsInPeriod(ritual, start, end);

    let segment: RitualAdherenceSegment;
    if (startAt > end) {
      segment = "outside";
    } else if (execCountInPeriod > 0) {
      segment = "fulfilled";
    } else if (startAt > now) {
      segment = "scheduled";
    } else {
      segment = "overdue";
    }

    const progressPct = execCountInPeriod > 0 ? 100 : 0;

    return {
      ritual,
      execCountInPeriod,
      segment,
      progressPct,
      driLabel: driLabel(ritual),
    };
  });
}

export function summarizeRitualsAdherence(rows: RitualAdherenceRowModel[]): RitualAdherenceSummary {
  let applicableCount = 0;
  let fulfilledCount = 0;
  let pendingCount = 0;
  let executionsInPeriodTotal = 0;

  for (const row of rows) {
    executionsInPeriodTotal += row.execCountInPeriod;
    if (row.segment === "outside") continue;
    applicableCount += 1;
    if (row.segment === "fulfilled") fulfilledCount += 1;
    else if (row.segment === "scheduled" || row.segment === "overdue") pendingCount += 1;
  }

  const adherenceRatePct =
    applicableCount > 0 ? Math.round((fulfilledCount / applicableCount) * 100) : 0;

  return {
    applicableCount,
    fulfilledCount,
    pendingCount,
    executionsInPeriodTotal,
    adherenceRatePct,
  };
}

export function shiftAdherenceMonth(refMonth: Date, delta: number): Date {
  return addMonths(startOfMonth(refMonth), delta);
}
