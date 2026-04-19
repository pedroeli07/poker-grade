"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ListFilter } from "lucide-react";
import {
  COLUMN_FILTER_ARIA_PREFIX,
  COLUMN_FILTER_BTN_APPLY,
  COLUMN_FILTER_BTN_CANCEL,
  COLUMN_FILTER_BTN_CLEAR,
  COLUMN_FILTER_BTN_DESELECT_ALL,
  COLUMN_FILTER_BTN_SELECT_ALL,
  COLUMN_FILTER_EMPTY_MESSAGE,
  COLUMN_FILTER_SEARCH_PLACEHOLDER,
  filterListScrollClass,
} from "@/lib/constants";
import {
  cn,
  columnFilterValueKeys,
  commitColumnFilterSelection,
  filterColumnOptionsBySearch,
  initialColumnFilterPending,
  resolveColumnFilterAriaLabel,
} from "@/lib/utils";
import FilterOptionRow from "./filter-row-option";

const ColumnFilter = memo(function ColumnFilter({
  columnId,
  label,
  options,
  applied,
  onApply,
  compact = false,
  triggerClassName,
  /** Texto para aria-label quando `label` não é string (ex.: badge). */
  ariaLabel,
}: {
  columnId: string;
  label: React.ReactNode;
  options: { value: string; label: string }[];
  applied: Set<string> | null;
  onApply: (next: Set<string> | null) => void;
  /** Estilo de botão outline para toolbar (ex.: grades em cards). */
  compact?: boolean;
  /** Classes extras no trigger (ex.: coluna estreita, centralizar). */
  triggerClassName?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());

  const allKeys = useMemo(() => columnFilterValueKeys(options), [options]);

  const initPending = useCallback(() => {
    setPending(initialColumnFilterPending(applied, allKeys));
    setSearch("");
  }, [applied, allKeys]);

  const filteredOptions = useMemo(
    () => filterColumnOptionsBySearch(options, search),
    [options, search]
  );

  const active = applied !== null;

  const filterAria = resolveColumnFilterAriaLabel(columnId, label, ariaLabel);

  function applyFromPending(next: Set<string>) {
    commitColumnFilterSelection(next, allKeys, onApply);
  }

  function toggle(value: string, checked: boolean) {
    setPending((prev) => {
      const n = new Set(prev);
      if (checked) n.add(value);
      else n.delete(value);
      return n;
    });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) initPending();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer inline-flex items-center gap-1.5 transition-colors",
            compact
              ? cn(
                  "h-8 shrink-0 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-sm hover:border-primary/25 hover:bg-primary/[0.04]",
                  active && "border-primary/30 bg-primary/[0.06] text-primary"
                )
              : cn(
                  "rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10",
                  active && "text-primary"
                ),
            triggerClassName
          )}
          aria-label={`${COLUMN_FILTER_ARIA_PREFIX} ${filterAria}`}
        >
          <span>{label}</span>
          <ListFilter
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground",
              !compact && "h-4 w-4",
              active && "text-primary"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 sm:w-[22rem]" align="start">
        <div className="p-2 border-b border-border space-y-2">
          <Input
            placeholder={COLUMN_FILTER_SEARCH_PLACEHOLDER}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm"
          />
          <div className="flex gap-1 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setPending(new Set(allKeys))}
            >
              {COLUMN_FILTER_BTN_SELECT_ALL}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setPending(new Set())}
            >
              {COLUMN_FILTER_BTN_DESELECT_ALL}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onApply(null);
                setOpen(false);
              }}
            >
              {COLUMN_FILTER_BTN_CLEAR}
            </Button>
          </div>
        </div>
        <div className={filterListScrollClass}>
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              {COLUMN_FILTER_EMPTY_MESSAGE}
            </p>
          ) : (
            filteredOptions.map((opt) => (
              <FilterOptionRow
                key={`${columnId}-${opt.value}`}
                opt={opt}
                checked={pending.has(opt.value)}
                onToggle={toggle}
              />
            ))
          )}
        </div>
        <div className="p-2 border-t border-border flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            {COLUMN_FILTER_BTN_CANCEL}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              applyFromPending(pending);
              setOpen(false);
            }}
          >
            {COLUMN_FILTER_BTN_APPLY}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

ColumnFilter.displayName = "ColumnFilter";

export default ColumnFilter;