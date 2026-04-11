"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ListFilter } from "lucide-react";
import { cn, filterOptionPreviewText, filterOptionNeedsHoverPreview } from "@/lib/utils";
import { filterListScrollClass } from "@/lib/constants";
import FilterOptionRow from "./filter-row-option";

const ColumnFilter = memo(function ColumnFilter({
  columnId,
  label,
  options,
  applied,
  onApply,
  compact = false,
  triggerClassName,
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
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<Set<string>>(new Set());

  const allKeys = useMemo(
    () => new Set(options.map((o) => o.value)),
    [options]
  );

  const initPending = useCallback(() => {
    setPending(applied === null ? new Set(allKeys) : new Set(applied));
    setSearch("");
  }, [applied, allKeys]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const active = applied !== null;

  function applyFromPending(next: Set<string>) {
    if (next.size === 0) {
      onApply(new Set());
      return;
    }
    if (next.size === allKeys.size) {
      onApply(null);
      return;
    }
    onApply(next);
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
          aria-label={`Filtrar ${label}`}
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
            placeholder="Buscar…"
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
              Marcar todos
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setPending(new Set())}
            >
              Desmarcar todos
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
              Limpar filtro
            </Button>
          </div>
        </div>
        <div className={filterListScrollClass}>
          {filteredOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-4 text-center">
              Nenhum valor
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
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              applyFromPending(pending);
              setOpen(false);
            }}
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

ColumnFilter.displayName = "ColumnFilter";

export default ColumnFilter;