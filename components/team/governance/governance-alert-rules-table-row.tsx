"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { decisionAreaBadgeCls, sevPillCls } from "@/lib/constants/team/governance-mural-ui";
import { SEVERITY_LABELS_PT } from "@/lib/constants/team/severity";
import { cn } from "@/lib/utils/cn";
import { responsibleLabel } from "@/lib/utils/team/governance-alert-rules-filters";
import type { GovernanceAlertRuleDTO } from "@/lib/data/team/governance-page";
import { memo } from "react";

const GovernanceAlertRulesTableRow = memo(function GovernanceAlertRulesTableRow({
  rule,
  onEdit,
  onRequestDelete,
}: {
  rule: GovernanceAlertRuleDTO;
  onEdit: (r: GovernanceAlertRuleDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  return (
    <TableRow className="text-sm">
      <TableCell
        className={cn(
          "min-w-0 max-w-0 text-left align-top",
          "whitespace-normal [overflow-wrap:anywhere] break-words",
        )}
      >
        <p className="font-semibold leading-snug text-foreground">{rule.name}</p>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={cn("text-xs font-medium", decisionAreaBadgeCls(rule.area))}>
          {rule.area}
        </Badge>
      </TableCell>
      <TableCell className="min-w-0 text-center text-xs text-muted-foreground whitespace-normal [overflow-wrap:anywhere]">
        {rule.metric}
      </TableCell>
      <TableCell className="text-center align-middle">
        <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
          {rule.operator} {rule.threshold}
        </code>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={sevPillCls(rule.severity)}>
          {SEVERITY_LABELS_PT[rule.severity] ?? rule.severity}
        </Badge>
      </TableCell>
      <TableCell className="min-w-0 text-center text-xs whitespace-normal">
        <span className="line-clamp-2 break-words font-medium text-foreground">{responsibleLabel(rule)}</span>
      </TableCell>
      <TableCell className="w-[40px] text-right p-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Ações"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(rule)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => onRequestDelete(rule.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

GovernanceAlertRulesTableRow.displayName = "GovernanceAlertRulesTableRow";

export default GovernanceAlertRulesTableRow;
