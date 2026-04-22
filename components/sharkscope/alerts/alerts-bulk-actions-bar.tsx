"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { cardClassName } from "@/lib/constants/sharkscope/ui";
const AlertsBulkActionsBar = memo(function AlertsBulkActionsBar({
  selectedCount,
  isPending,
  onClearSelection,
  onRequestDelete,
}: {
  selectedCount: number;
  isPending: boolean;
  onClearSelection: () => void;
  onRequestDelete: () => void;
}) {
  if (selectedCount <= 0) return null;

  return (
    <div
      className={`${cardClassName} mx-auto flex w-1/4 flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between`}
    >
      <p className="px-0.5 text-sm">
        <span className="font-semibold text-foreground">{selectedCount}</span>
        <span className="text-muted-foreground">
          {" "}
          {selectedCount === 1 ? "alerta selecionado" : "alertas selecionados"}
        </span>
      </p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={onClearSelection}>
          Limpar seleção
        </Button>
        <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={onRequestDelete}>
          {isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          )}
          Excluir
        </Button>
      </div>
    </div>
  );
});

AlertsBulkActionsBar.displayName = "AlertsBulkActionsBar";

export default AlertsBulkActionsBar;
