import { Trash2 } from "lucide-react";
import { memo } from "react";

const ImportsBulkSelectionBar = memo(function ImportsBulkSelectionBar({
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
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
      <span className="text-sm font-semibold">
        {selectedSize} selecionada{selectedSize > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={onRequestBulkDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/30 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir ({selectedSize})
        </button>
      </div>
    </div>
  );
});

ImportsBulkSelectionBar.displayName = "ImportsBulkSelectionBar";

export default ImportsBulkSelectionBar;
