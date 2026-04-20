import { Trash2 } from "lucide-react";
import { memo } from "react";

const TargetsBulkSelectionBar = memo(function TargetsBulkSelectionBar({
  selectedSize,
  isPending,
  onClearSelection,
  onRequestBulkDelete,
}: {
  selectedSize: number;
  isPending: boolean;
  onClearSelection: () => void;
  onRequestBulkDelete: () => void;
}) {
  if (selectedSize === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-semibold">
        {selectedSize} selecionada{selectedSize > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={onRequestBulkDelete}
          disabled={isPending}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/30 px-3 py-1.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir ({selectedSize})
        </button>
      </div>
    </div>
  );
});

TargetsBulkSelectionBar.displayName = "TargetsBulkSelectionBar";

export default TargetsBulkSelectionBar;
