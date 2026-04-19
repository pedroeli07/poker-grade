import type { GradeRuleCardRule, LobbyzeFilterItem } from "@/lib/types";
import {
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Tag,
  CalendarDays,
  Zap,
  Trophy,
  Gamepad2,
  Globe2,
  Timer,
  Infinity as InfinityIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { gradesRulesPillClass } from "@/lib/constants/classes";
import {
  GRADE_RULE_GTD_OPEN_MAX_TITLE,
  type GradeRuleDisplayFieldKey,
} from "@/lib/constants/grade-rule-display";
import { useRuleDisplay } from "@/hooks/grades/use-rule-display";
import {
  formatGradeRuleUsdInt,
  formatRuleTimezoneUtcSuffix,
} from "@/lib/utils/grade-rule-display";

const RULE_FIELD_ICONS: Record<GradeRuleDisplayFieldKey, LucideIcon> = {
  sites: Globe2,
  speed: Zap,
  variant: Trophy,
  tournamentType: Timer,
  gameType: Gamepad2,
  playerCount: Users,
  weekDay: CalendarDays,
};

const InlinePills = memo(function InlinePills({ items }: { items: LobbyzeFilterItem[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span
          key={i}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${gradesRulesPillClass}`}
        >
          {item.item_text}
        </span>
      ))}
    </div>
  );
});
InlinePills.displayName = "InlinePills";

const RuleDisplay = memo(function RuleDisplay({ rule }: { rule: GradeRuleCardRule }) {
  const { meta, fieldRows } = useRuleDisplay(rule);
  const {
    hasBuyIn,
    hasPrize,
    hasTime,
    hasMinP,
    hasExclude,
    hasMeta,
  } = meta;

  return (
    <div className="flex h-full flex-col gap-3 text-[13px]">
      {hasBuyIn ? (
        <div className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] via-blue-500/[0.04] to-transparent px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <DollarSign className="h-3 w-3 text-blue-500" />
            Buy-in
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold tabular-nums leading-tight text-blue-500">
              ${rule.buyInMin ?? "—"}
            </span>
            <span className="text-muted-foreground/60">–</span>
            <span className="font-mono text-lg font-bold tabular-nums leading-tight text-blue-500">
              ${rule.buyInMax ?? "—"}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
          Buy-in sem restrição
        </div>
      )}

      {fieldRows.length > 0 && (
        <div className="space-y-1.5">
          {fieldRows.map(({ key, label, items }) => {
            const Icon = RULE_FIELD_ICONS[key];
            return (
              <div key={key} className="grid grid-cols-[76px_minmax(0,1fr)] items-start gap-2">
                <div className="flex items-center gap-1 pt-[3px] text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3 w-3 text-blue-500/80" />
                  {label}
                </div>
                <InlinePills items={items} />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1" />

      {hasMeta && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2">
          {hasPrize && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-[14px] font-semibold leading-snug text-emerald-600">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap tabular-nums">
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
                    title={GRADE_RULE_GTD_OPEN_MAX_TITLE}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span aria-hidden>–</span>
                    <InfinityIcon className="h-4 w-4 shrink-0" aria-label="sem limite" />
                  </span>
                )}
              </span>
            </span>
          )}
          {hasMinP && (
            <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/25 bg-blue-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-blue-600">
              <Users className="h-3 w-3" />
              Mín. {rule.minParticipants}
            </span>
          )}
          {hasTime && (
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/25 bg-violet-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-violet-600">
              <Clock className="h-3 w-3" />
              {rule.fromTime ?? "00:00"}–{rule.toTime ?? "23:59"}
              {formatRuleTimezoneUtcSuffix(rule.timezone)}
            </span>
          )}
          {hasExclude && (
            <span
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-rose-500/25 bg-rose-500/[0.08] px-2 py-0.5 text-[11px] font-semibold text-rose-600"
              title={rule.excludePattern ?? undefined}
            >
              <Tag className="h-3 w-3 shrink-0" />
              <span className="max-w-[160px] truncate">Excluir: {rule.excludePattern}</span>
            </span>
          )}
          {rule.autoOnly && (
            <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              Apenas auto
            </span>
          )}
          {rule.manualOnly && (
            <span className="inline-flex items-center rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-600">
              Apenas manual
            </span>
          )}
        </div>
      )}
    </div>
  );
});

RuleDisplay.displayName = "RuleDisplay";

export default RuleDisplay;
