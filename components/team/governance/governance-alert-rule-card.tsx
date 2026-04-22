"use client";

import { memo } from "react";
import { BellRing, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  governanceAlertRuleCardFrameCls,
  governanceAlertRuleCardOverlayFromCls,
  sevIconWrapCls,
  sevPillCls,
} from "@/lib/constants/team/governance-mural-ui";
import { SEVERITY_LABELS_PT } from "@/lib/constants/team/severity";
import { cn } from "@/lib/utils/cn";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";

export const GovernanceAlertRuleCard = memo(function GovernanceAlertRuleCard({
  rule,
  onEdit,
  onRequestDelete,
}: {
  rule: GovernanceAlertRuleDTO;
  onEdit: (r: GovernanceAlertRuleDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border py-0",
        "gap-0 ring-0 transition-all duration-300 ease-out",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:to-transparent",
        "before:opacity-0 before:transition-opacity hover:before:opacity-100",
        governanceAlertRuleCardFrameCls(rule.severity),
        governanceAlertRuleCardOverlayFromCls(rule.severity),
      )}
    >
      <CardContent className="space-y-2.5 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex min-w-0 items-start gap-2.5">
            <div
              className={cn(
                sevIconWrapCls(rule.severity),
                "h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-[1.03]",
              )}
            >
              <BellRing className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-foreground">
                {rule.name}
              </h4>
              <Badge
                variant="outline"
                className="h-6 min-h-6 border-border/60 bg-muted/40 px-2.5 text-[11px] font-medium leading-none text-foreground/80 dark:bg-muted/30"
              >
                {rule.area}
              </Badge>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 border px-2.5 py-1 text-[11px] font-bold leading-tight",
              sevPillCls(rule.severity),
            )}
          >
            {SEVERITY_LABELS_PT[rule.severity] ?? rule.severity}
          </Badge>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/25 px-2.5 py-2 dark:border-border/50 dark:bg-muted/20">
          <p className="mb-1 text-[9px] font-bold uppercase leading-none tracking-[0.12em] text-muted-foreground">
            Condição
          </p>
          <p className="text-sm leading-snug text-foreground/90">
            <span className="font-medium">{rule.metric}</span>{" "}
            <span className="font-mono tabular-nums text-foreground/85">
              {rule.operator} {rule.threshold}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
          <p className="min-w-0 text-xs text-muted-foreground">
            <span className="text-[10px] font-medium uppercase tracking-wide">Resp.</span>{" "}
            <span className="font-semibold text-foreground">
              {rule.assignee?.displayName || rule.responsibleName || "Geral"}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => onEdit(rule)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRequestDelete(rule.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GovernanceAlertRuleCard.displayName = "GovernanceAlertRuleCard";
