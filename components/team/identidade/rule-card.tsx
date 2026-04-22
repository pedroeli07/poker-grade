"use client";

import { memo } from "react";
import { AlertTriangle, Zap } from "lucide-react";
import type { TeamOperationalRule } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { RULE_STYLE_BY_TYPE } from "@/lib/constants/team/identity";
import {
  SEVERITY_COLOR,
  SEVERITY_LABELS_PT,
  SEVERITY_NONE,
  coerceSeverity,
} from "@/lib/constants/team/severity";
import { RULE_TYPE_MANDATORY, coerceRuleType } from "@/lib/constants/team/rule-type";
import EditRuleModal from "./edit-rule-modal";
import RuleToggle from "./rule-toggle";
import DeleteRuleButton from "./delete-rule-button";

const RuleCard = memo(function RuleCard({ rule }: { rule: TeamOperationalRule }) {
  const ruleType = coerceRuleType(rule.type);
  const cfg = RULE_STYLE_BY_TYPE[ruleType] ?? RULE_STYLE_BY_TYPE[RULE_TYPE_MANDATORY];
  const Icon = cfg.icon;
  const sev = coerceSeverity(rule.severity);
  const sevLabel = SEVERITY_LABELS_PT[sev] ?? sev;
  const sevColor = SEVERITY_COLOR[sev] ?? "text-muted-foreground";

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        cfg.border,
        !rule.active && "opacity-60 grayscale-[0.4]",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("rounded-md p-1.5", cfg.iconBg)}>
              <Icon className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold">{rule.title}</CardTitle>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wide",
                cfg.badge,
              )}
            >
              {cfg.badgeLabel}
            </span>
            {rule.monitoring && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-card text-muted-foreground text-[11px] font-semibold">
                <Zap className="w-3 h-3" /> Monitoramento automático
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                {rule.active ? "Ativa" : "Inativa"}
              </span>
              <RuleToggle ruleId={rule.id} initialActive={rule.active} />
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-1">
              <EditRuleModal
                initialData={{
                  id: rule.id,
                  title: rule.title,
                  description: rule.description,
                  type: ruleType,
                  monitoring: rule.monitoring,
                  severity: rule.severity ?? SEVERITY_NONE,
                  source: rule.source ?? "",
                  limit: rule.limit ?? "",
                  consequence: rule.consequence ?? "",
                }}
                trigger={{
                  label: "Editar",
                  icon: "edit",
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 px-2 text-xs",
                }}
              />
              <DeleteRuleButton ruleId={rule.id} ruleTitle={rule.title} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {rule.description && (
          <p className="text-sm leading-relaxed">
            <span className="font-bold">Por que existe: </span>
            {rule.description}
          </p>
        )}
        {(sev || rule.source || rule.limit) && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {sev && sev !== SEVERITY_NONE && (
              <span className={cn("flex items-center gap-1.5 font-semibold", sevColor)}>
                <AlertTriangle className="w-3.5 h-3.5" /> {sevLabel}
              </span>
            )}
            {rule.source && (
              <span>
                <span className="font-semibold">Fonte:</span> {rule.source}
              </span>
            )}
            {rule.limit && (
              <span>
                <span className="font-semibold">Limite:</span> {rule.limit}
              </span>
            )}
          </div>
        )}
        {rule.consequence && (
          <div className={cn("rounded-lg border p-3 text-sm leading-relaxed", cfg.consecBg)}>
            <span className="font-bold">Consequência: </span>
            {rule.consequence}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default RuleCard;
