"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterListScrollClass } from "@/lib/constants";
import FilterOptionRow from "./filter-row-option";
import {
  OPS_WITH_RANGE,
  OP_LABELS,
  formatNumberValue,
  type NumberFilterValue,
  isFilterActive,
} from "@/lib/number-filter";
import { useNumberFilter } from "@/lib/use-number-filter";

const NumberRangeFilter = memo(function NumberRangeFilter({
  label,
  value,
  onChange,
  suffix = "",
  uniqueValues,
  /** Texto para aria-label quando `label` não é string (ex.: badge). */
  ariaLabel,
}: {
  label: React.ReactNode;
  value: NumberFilterValue | null;
  onChange: (v: NumberFilterValue | null) => void;
  suffix?: string;
  uniqueValues?: number[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const { mode, setMode, op, setOp, min, setMin, max, setMax, selectedValues, setSelectedValues, valueOptions, active, handleApply, handleClear, toggleValue, resetOpen } = useNumberFilter(value, uniqueValues);

  const filterAria =
    ariaLabel ??
    (typeof label === "string" || typeof label === "number" ? String(label) : "valor numérico");

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) resetOpen(); }}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("cursor-pointer inline-flex items-center gap-1.5 transition-colors rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10", active && "text-primary")} aria-label={`Filtrar ${filterAria}`}>
          <span>{label}</span>
          <ListFilter className={cn("h-4 w-4 shrink-0 text-muted-foreground", active && "text-primary")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[30rem] p-0 flex flex-col" align="start">
        <div className="p-2 border-b border-border flex gap-1">
          <Button type="button" variant={mode === "range" ? "default" : "secondary"} size="sm" className="h-7 text-xs" onClick={() => setMode("range")}>Range</Button>
          <Button type="button" variant={mode === "values" ? "default" : "secondary"} size="sm" className="h-7 text-xs" onClick={() => setMode("values")} disabled={!valueOptions.length}>Valores {valueOptions.length > 0 && `(${valueOptions.length})`}</Button>
        </div>

        {mode === "values" ? (
          <div className={cn("flex-1 overflow-y-auto", filterListScrollClass)}>
            <div className="flex gap-1 flex-wrap p-2 border-b border-border">
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set(valueOptions))}>Marcar todos</Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set())}>Desmarcar todos</Button>
            </div>
            {valueOptions.map((v) => (
              <FilterOptionRow key={v} opt={{ value: v.toString(), label: formatNumberValue(v, suffix) }} checked={selectedValues.has(v)} onToggle={toggleValue} />
            ))}
            {valueOptions.length === 0 && <p className="text-sm text-muted-foreground px-2 py-4 text-center">Sem valores únicos</p>}
          </div>
        ) : (
          <div className="p-3 border-b border-border space-y-3">
            <div className="flex gap-1 flex-wrap">
              {OPS_WITH_RANGE.map((o) => (
                <Button key={o} type="button" variant={op === o ? "default" : "secondary"} size="sm" className="h-7 text-xs px-2" onClick={() => setOp(o)}>{OP_LABELS[o]}</Button>
              ))}
            </div>
            {op === "between" ? (
              <div className="flex items-center gap-2">
                <Input placeholder="Mín" value={min} onChange={(e) => setMin(e.target.value)} className="h-8 text-sm" />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="Máx" value={max} onChange={(e) => setMax(e.target.value)} className="h-8 text-sm" />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{OP_LABELS[op]}</span>
                <Input placeholder="Valor" value={min} onChange={(e) => setMin(e.target.value)} className="h-8 text-sm flex-1" />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            )}
          </div>
        )}

        <div className="p-2 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { handleClear(onChange); setOpen(false); }}>Limpar</Button>
          <Button type="button" size="sm" onClick={() => { handleApply(onChange); setOpen(false); }}>Aplicar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

NumberRangeFilter.displayName = "NumberRangeFilter";

export default NumberRangeFilter;
export type { NumberFilterValue };
/** @deprecated use isFilterActive from @/lib/number-filter */
export const isActive = isFilterActive;