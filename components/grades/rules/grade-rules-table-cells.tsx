import { memo } from "react";
import { TrendingUp, Infinity as InfinityIcon } from "lucide-react";
import type { GradeRuleCardRule, LobbyzeFilterItem } from "@/lib/types";
import { gradesRulesPillClass } from "@/lib/constants/classes";
import { GRADE_RULE_GTD_OPEN_MAX_TITLE } from "@/lib/constants/grade-rule-display";
import {
  formatGradeRuleUsdInt,
} from "@/lib/utils/grade-rule-display";
import { cn } from "@/lib/utils";

export const StackedPills = memo(function StackedPills({ items }: { items: LobbyzeFilterItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <span
          key={`${String(item.item_id)}-${i}`}
          className={cn(
            "inline-flex w-fit max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight",
            gradesRulesPillClass
          )}
        >
          <span className="truncate">{item.item_text}</span>
        </span>
      ))}
    </div>
  );
});
StackedPills.displayName = "StackedPills";

export const BuyInCell = memo(function BuyInCell({ rule }: { rule: GradeRuleCardRule }) {
  const has = rule.buyInMin != null || rule.buyInMax != null;
  if (!has) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-col items-start gap-0.5 tabular-nums">
      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
        ${rule.buyInMin ?? "—"}
      </span>
      <span className="text-muted-foreground/70">–</span>
      <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
        ${rule.buyInMax ?? "—"}
      </span>
    </div>
  );
});
BuyInCell.displayName = "BuyInCell";

export const TipoTorneioCell = memo(function TipoTorneioCell({ rule }: { rule: GradeRuleCardRule }) {
  const tt = rule.tournamentType;
  const gt = rule.gameType;
  if (tt.length === 0 && gt.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="space-y-1.5">
      {tt.length > 0 && <StackedPills items={tt} />}
      {gt.length > 0 &&
        (tt.length > 0 ? (
          <div className="text-[10px] leading-snug text-muted-foreground">
            {gt.map((g) => g.item_text).join(" · ")}
          </div>
        ) : (
          <StackedPills items={gt} />
        ))}
    </div>
  );
});
TipoTorneioCell.displayName = "TipoTorneioCell";

export const GtdCell = memo(function GtdCell({ rule }: { rule: GradeRuleCardRule }) {
  const hasPrize = rule.prizePoolMin != null || rule.prizePoolMax != null;
  if (!hasPrize) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex min-w-0 max-w-[min(220px,100%)] flex-wrap items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-1 text-[11px] font-semibold leading-snug text-emerald-700 dark:text-emerald-400">
      <TrendingUp className="h-3.5 w-3.5 shrink-0" />
      <span className="inline-flex min-w-0 flex-wrap items-center gap-1 tabular-nums">
        <span>
          GTD $
          {rule.prizePoolMin != null ? formatGradeRuleUsdInt(rule.prizePoolMin) : "0"}
        </span>
        {rule.prizePoolMax != null ? (
          <>
            <span aria-hidden>–</span>
            <span>${formatGradeRuleUsdInt(rule.prizePoolMax)}</span>
          </>
        ) : (
          <span
            className="inline-flex items-center gap-1"
            title={GRADE_RULE_GTD_OPEN_MAX_TITLE}
          >
            <span aria-hidden>–</span>
            <InfinityIcon className="h-3.5 w-3.5 shrink-0" aria-label="sem limite" />
          </span>
        )}
      </span>
    </span>
  );
});
GtdCell.displayName = "GtdCell";

export const FieldCell = memo(function FieldCell({ rule }: { rule: GradeRuleCardRule }) {
  if (rule.minParticipants == null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
      Mín. {rule.minParticipants}
    </span>
  );
});
FieldCell.displayName = "FieldCell";

export const ExcludeCell = memo(function ExcludeCell({ rule }: { rule: GradeRuleCardRule }) {
  const p = rule.excludePattern?.trim();
  if (!p) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span
      className="break-all text-left font-mono text-[11px] leading-snug text-rose-800 dark:text-rose-400"
      title={p}
    >
      {p}
    </span>
  );
});
ExcludeCell.displayName = "ExcludeCell";
