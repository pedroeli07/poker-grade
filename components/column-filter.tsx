"use client";

import { useMemo, useState, useCallback } from "react";
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
import { cn } from "@/lib/utils";

const HOVER_PREVIEW_MIN_CHARS = 44;

function filterOptionPreviewText(opt: { value: string; label: string }) {
  if (opt.label.endsWith("…") || opt.label.endsWith("...")) return opt.value;
  if (opt.value.length > opt.label.length) return opt.value;
  return opt.label;
}

function filterOptionNeedsHoverPreview(opt: {
  value: string;
  label: string;
}) {
  return filterOptionPreviewText(opt).length > HOVER_PREVIEW_MIN_CHARS;
}

const filterListScrollClass =
  "max-h-[min(280px,50vh)] overflow-y-auto overflow-x-hidden p-2 space-y-1 pr-1.5 " +
  "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)] " +
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:min-h-8 " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35 " +
  "[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50 " +
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/70";

function FilterOptionRow({
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
}

export function ColumnFilter({
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
}
