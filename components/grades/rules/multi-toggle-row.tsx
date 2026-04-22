import { cn } from "@/lib/utils/cn";
import { isTextSelected } from "@/lib/utils/lobbyze-filters";
import { toggleByText } from "./toggle-by-text";
import { LobbyzeFilterItem } from "@/lib/types/lobbyzeTypes";
import { memo } from "react";

const MultiToggleRow = memo(function MultiToggleRow({
  options,
  selected,
  onChange,
}: {
  options: LobbyzeFilterItem[];
  selected: LobbyzeFilterItem[];
  onChange: (next: LobbyzeFilterItem[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = isTextSelected(selected, opt);
        return (
          <button
            key={`${String(opt.item_id)}-${opt.item_text}`}
            type="button"
            onClick={() => onChange(toggleByText(selected, opt, !on))}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors select-none",
              on
                ? "border-blue-500 bg-blue-500/15 text-blue-600"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50"
            )}
          >
            {opt.item_text}
          </button>
        );
      })}
    </div>
  );
});

MultiToggleRow.displayName = "MultiToggleRow";

export default MultiToggleRow;
