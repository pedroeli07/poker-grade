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
import { governanceAreaBadgeCls } from "@/lib/constants/team/governance-ui";
import type { GovernanceDriDTO } from "@/lib/data/team/governance-page";
import { memo } from "react";

const GovernanceDriMatrixTableRow = memo(function GovernanceDriMatrixTableRow({
  dri,
  onEdit,
  onRequestDelete,
}: {
  dri: GovernanceDriDTO;
  onEdit: (d: GovernanceDriDTO) => void;
  onRequestDelete: (id: string) => void;
}) {
  return (
    <TableRow className="text-sm">
      <TableCell>
        <Badge variant="outline" className={governanceAreaBadgeCls(dri.area)}>
          {dri.area}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-background">
            {(dri.user?.displayName || dri.responsibleName || "NA")
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="font-medium">
            {dri.user?.displayName || dri.responsibleName || "Responsável não definido"}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-md min-w-0 whitespace-normal [overflow-wrap:anywhere] break-words text-sm text-muted-foreground">
        {dri.rules.trim() ? dri.rules : "—"}
      </TableCell>
      <TableCell className="w-10 p-1 text-right align-middle">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label={`Ações: ${dri.area}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(dri)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={() => onRequestDelete(dri.id)}
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

GovernanceDriMatrixTableRow.displayName = "GovernanceDriMatrixTableRow";

export default GovernanceDriMatrixTableRow;
