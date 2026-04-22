"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit2, Tag, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusLabel, decisionVisibilityLabel, DECISION_STATUS_OPTIONS } from "@/lib/constants/team/governance-mural-ui";
import { GOVERNANCE_STATUS_BADGE_CLASS, governanceAreaBadgeCls } from "@/lib/constants/team/governance-ui";
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
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm",
        "transition-all duration-200 hover:border-primary/25 hover:shadow-md",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
                {dec.title}
              </h3>
              <Badge
                className={cn(
                  "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
                  GOVERNANCE_STATUS_BADGE_CLASS[dec.status] ?? "bg-amber-50 text-amber-800 border-amber-200/80",
                )}
              >
                {statusLabel(dec.status, DECISION_STATUS_OPTIONS)}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{dec.summary}</p>
          </div>
          {areaIcon ? (
            <Badge
              variant="outline"
              className={cn("shrink-0 gap-2 border bg-background/80 py-1.5", governanceAreaBadgeCls(dec.area))}
            >
              {areaIcon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{dec.area}</span>
            </Badge>
          ) : (
            <span
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                governanceAreaBadgeCls(dec.area),
              )}
            >
              {dec.area}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent p-4">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary/90">
            Impacto esperado
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">{dec.impact?.trim() || "—"}</p>
        </div>
        <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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
                {dec.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] font-medium">
                    {tag}
                  </Badge>
                ))}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
              Vis.: {decisionVisibilityLabel(dec.visibility)}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onEdit(dec)}
            >
              <Edit2 className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
              onClick={() => onRequestDelete(dec.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GovernanceDecisionCard.displayName = "GovernanceDecisionCard";
