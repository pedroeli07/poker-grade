"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit2, Tag, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  statusLabel,
  decisionVisibilityLabel,
  DECISION_STATUS_OPTIONS,
} from "@/lib/constants/team/governance-mural-ui";
import {
  GOVERNANCE_STATUS_BADGE_CLASS,
  governanceAreaBadgeCls,
} from "@/lib/constants/team/governance-ui";
import { cn } from "@/lib/utils/cn";
import type { GovernanceDecisionCardProps } from "@/lib/types/team/governance";
import { memo } from "react";

export const GovernanceDecisionCard = memo(function GovernanceDecisionCard({
  decision: dec,
  onEdit,
  onRequestDelete,
  areaIcon,
}: GovernanceDecisionCardProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Card
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm",
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        )}
      >
        <CardHeader className="gap-2 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-foreground">
              {dec.title}
            </h3>
            <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(dec)}
                    aria-label="Editar decisão"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRequestDelete(dec.id)}
                    aria-label="Excluir decisão"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {areaIcon ? (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  governanceAreaBadgeCls(dec.area),
                )}
              >
                {areaIcon}
                <span>{dec.area}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  governanceAreaBadgeCls(dec.area),
                )}
              >
                {dec.area}
              </Badge>
            )}
            <Badge
              className={cn(
                "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                GOVERNANCE_STATUS_BADGE_CLASS[dec.status] ??
                  "border-amber-200 bg-amber-50 text-amber-800",
              )}
            >
              {statusLabel(dec.status, DECISION_STATUS_OPTIONS)}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 py-0.5 text-[10px] font-normal text-muted-foreground"
            >
              {decisionVisibilityLabel(dec.visibility)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 pt-0">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {dec.summary}
          </p>
          {dec.impact?.trim() ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Impacto esperado
              </p>
              <p className="line-clamp-2 text-sm leading-relaxed text-foreground/85">
                {dec.impact}
              </p>
            </div>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span className="font-medium text-foreground">
                {dec.author?.displayName || dec.author?.email || "—"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
              {format(new Date(dec.decidedAt), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            {dec.tags.length > 0 && (
              <span className="inline-flex flex-wrap items-center gap-1">
                <Tag className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {dec.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
                {dec.tags.length > 3 ? (
                  <span className="text-[10px] text-muted-foreground">
                    +{dec.tags.length - 3}
                  </span>
                ) : null}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

GovernanceDecisionCard.displayName = "GovernanceDecisionCard";
