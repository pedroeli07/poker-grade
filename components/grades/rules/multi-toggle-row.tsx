import { cn, normText, isTextSelected } from "@/lib/utils";
import { LobbyzeFilterItem } from "@/lib/types";

export function toggleByText(
  list: LobbyzeFilterItem[],
  opt: LobbyzeFilterItem,
  on: boolean
): LobbyzeFilterItem[] {
  const t = normText(opt.item_text);
  if (on) {
    if (list.some((x) => normText(x.item_text) === t)) return list;
    return [...list, opt];
  }
  return list.filter((x) => normText(x.item_text) !== t);
}

export function MultiToggleRow({
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
}
