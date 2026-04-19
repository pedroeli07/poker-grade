"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ListFilter } from "lucide-react";
import {
  COLUMN_FILTER_ARIA_PREFIX,
  COLUMN_FILTER_BTN_APPLY,
  COLUMN_FILTER_BTN_CANCEL,
  COLUMN_FILTER_BTN_DESELECT_ALL,
  COLUMN_FILTER_BTN_SELECT_ALL,
  filterListScrollClass,
  NUMBER_RANGE_FILTER_BTN_CLEAR,
  NUMBER_RANGE_FILTER_DEFAULT_ARIA_FALLBACK,
  NUMBER_RANGE_FILTER_EMPTY_UNIQUE,
  NUMBER_RANGE_FILTER_MODE_RANGE,
  NUMBER_RANGE_FILTER_MODE_VALUES,
  NUMBER_RANGE_FILTER_PLACEHOLDER_MAX,
  NUMBER_RANGE_FILTER_PLACEHOLDER_MIN,
  NUMBER_RANGE_FILTER_PLACEHOLDER_VALUE,
} from "@/lib/constants";
import { cn, resolveColumnFilterAriaLabel } from "@/lib/utils";
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
  const { 
    mode, 
    setMode, 
    op, setOp, 
    min, setMin, 
    max, setMax, 
    selectedValues, 
    setSelectedValues, 
    valueOptions, 
    active, 
    handleApply, 
    handleClear, 
    toggleValue, 
    resetOpen } = useNumberFilter(value, uniqueValues);

  const filterAria = resolveColumnFilterAriaLabel(NUMBER_RANGE_FILTER_DEFAULT_ARIA_FALLBACK, label, ariaLabel);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) resetOpen(); }}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("cursor-pointer inline-flex items-center gap-1.5 transition-colors rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10", active && "text-primary")} aria-label={`${COLUMN_FILTER_ARIA_PREFIX} ${filterAria}`}>
          <span>{label}</span>
          <ListFilter className={cn("h-4 w-4 shrink-0 text-muted-foreground", active && "text-primary")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[30rem] p-0 flex flex-col" align="start">
        <div className="p-2 border-b border-border flex gap-1">
          <Button type="button" variant={mode === "range" ? "default" : "secondary"} size="sm" className="h-7 text-xs" onClick={() => setMode("range")}>{NUMBER_RANGE_FILTER_MODE_RANGE}</Button>
          <Button type="button" variant={mode === "values" ? "default" : "secondary"} size="sm" className="h-7 text-xs" onClick={() => setMode("values")} disabled={!valueOptions.length}>{NUMBER_RANGE_FILTER_MODE_VALUES} {valueOptions.length > 0 && `(${valueOptions.length})`}</Button>
        </div>

        {mode === "values" ? (
          <div className={cn("flex-1 overflow-y-auto", filterListScrollClass)}>
            <div className="flex gap-1 flex-wrap p-2 border-b border-border">
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set(valueOptions))}>{COLUMN_FILTER_BTN_SELECT_ALL}</Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set())}>{COLUMN_FILTER_BTN_DESELECT_ALL}</Button>
            </div>
            {valueOptions.map((v) => (
              <FilterOptionRow key={v} opt={{ value: v.toString(), label: formatNumberValue(v, suffix) }} checked={selectedValues.has(v)} onToggle={toggleValue} />
            ))}
            {valueOptions.length === 0 && <p className="text-sm text-muted-foreground px-2 py-4 text-center">{NUMBER_RANGE_FILTER_EMPTY_UNIQUE}</p>}
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
                <Input placeholder={NUMBER_RANGE_FILTER_PLACEHOLDER_MIN} value={min} onChange={(e) => setMin(e.target.value)} className="h-8 text-sm" />
                <span className="text-muted-foreground">—</span>
                <Input placeholder={NUMBER_RANGE_FILTER_PLACEHOLDER_MAX} value={max} onChange={(e) => setMax(e.target.value)} className="h-8 text-sm" />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{OP_LABELS[op]}</span>
                <Input placeholder={NUMBER_RANGE_FILTER_PLACEHOLDER_VALUE} value={min} onChange={(e) => setMin(e.target.value)} className="h-8 text-sm flex-1" />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            )}
          </div>
        )}

        <div className="p-2 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>{COLUMN_FILTER_BTN_CANCEL}</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { handleClear(onChange); setOpen(false); }}>{NUMBER_RANGE_FILTER_BTN_CLEAR}</Button>
          <Button type="button" size="sm" onClick={() => { handleApply(onChange); setOpen(false); }}>{COLUMN_FILTER_BTN_APPLY}</Button>
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