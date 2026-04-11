import { memo } from "react";
import { cn, filterOptionPreviewText, filterOptionNeedsHoverPreview } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";

const FilterOptionRow = memo(function FilterOptionRow({
    opt,
    checked,
    onToggle,
  }: {
    opt: { value: string; label: string };
    checked: boolean;
    onToggle: (value: string, next: boolean) => void;
  }) {
    const preview = filterOptionPreviewText(opt);
    const showHover = filterOptionNeedsHoverPreview(opt);
  
    const textEl = showHover ? (
      <HoverCard openDelay={280} closeDelay={120}>
        <HoverCardTrigger asChild>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-left cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2 hover:decoration-primary/60"
            )}
          >
            {opt.label}
          </span>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={10}
          collisionPadding={16}
          className={cn(
            "z-[100] w-[min(92vw,36rem)] max-h-[min(72vh,28rem)] overflow-y-auto overflow-x-hidden p-4 text-sm leading-relaxed bg-blue-500/10 backdrop-blur-md border border-blue-500/20 shadow-2xl shadow-blue-500/20",
            "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)]",
            "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35"
          )}
        >
          <p className="whitespace-pre-wrap break-words text-foreground">
            {preview}
          </p>
        </HoverCardContent>
      </HoverCard>
    ) : (
      <span className="min-w-0 flex-1 truncate text-left">{opt.label}</span>
    );
  
    return (
      <label className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/80 cursor-pointer text-sm">
        <Checkbox
          checked={checked}
          onCheckedChange={(c) => onToggle(opt.value, c === true)}
        />
        {textEl}
      </label>
    );
  });
  
  FilterOptionRow.displayName = "FilterOptionRow";
  
  export default FilterOptionRow;
  