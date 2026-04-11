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
import { cn, distinctOptions } from "@/lib/utils";
import { filterListScrollClass } from "@/lib/constants";
import FilterOptionRow from "./filter-row-option";

export type NumberFilterOp = "eq" | "gt" | "lt" | "gte" | "lte" | "between" | "in";

export interface NumberFilterValue {
  op: NumberFilterOp;
  min: number | null;
  max: number | null;
  values?: number[];
}

const OP_LABELS: Record<NumberFilterOp, string> = {
  eq: "=",
  gt: ">",
  lt: "<",
  gte: "≥",
  lte: "≤",
  between: "entre",
  in: "em",
};

const OPS_WITH_RANGE = ["between", "eq", "gt", "lt", "gte", "lte"] as NumberFilterOp[];

function isActive(v: NumberFilterValue | null): boolean {
  if (!v) return false;
  if (v.values && v.values.length > 0) return true;
  return v.min !== null || v.max !== null;
}

function fmtValue(v: number, suffix: string): string {
  if (suffix === "%") return `${v.toFixed(1)}%`;
  if (suffix === "$") return `$${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  if (suffix === "") return v.toLocaleString("pt-BR");
  return `${v}${suffix}`;
}

const NumberRangeFilter = memo(function NumberRangeFilter({
  columnId,
  label,
  value,
  onChange,
  suffix = "",
  uniqueValues,
}: {
  columnId: string;
  label: React.ReactNode;
  value: NumberFilterValue | null;
  onChange: (v: NumberFilterValue | null) => void;
  suffix?: string;
  uniqueValues?: number[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"range" | "values">(value?.values && value.values.length > 0 ? "values" : "range");
  const [op, setOp] = useState<NumberFilterOp>(value?.op ?? "between");
  const [min, setMin] = useState<string>(value?.min?.toString() ?? "");
  const [max, setMax] = useState<string>(value?.max?.toString() ?? "");

  const valueOptions = useMemo(() => {
    if (!uniqueValues || uniqueValues.length === 0) return [];
    return [...uniqueValues].sort((a, b) => a - b);
  }, [uniqueValues]);

  const [selectedValues, setSelectedValues] = useState<Set<number>>(() => {
    if (value?.values && value.values.length > 0) return new Set(value.values);
    return new Set();
  });

  const active = isActive(value);

  const handleApply = useCallback(() => {
    if (mode === "values") {
      if (selectedValues.size === 0) {
        onChange(null);
      } else {
        onChange({ op: "in", min: null, max: null, values: [...selectedValues] });
      }
    } else {
      const minNum = min === "" ? null : parseFloat(min.replace(",", "."));
      const maxNum = max === "" ? null : parseFloat(max.replace(",", "."));

      if (op === "eq" && minNum !== null) {
        onChange({ op, min: minNum, max: minNum });
      } else if ((op === "between" || op === "eq") && minNum === null && maxNum === null) {
        onChange(null);
      } else if (op === "between") {
        onChange({ op, min: minNum, max: maxNum });
      } else {
        onChange({ op, min: minNum, max: minNum });
      }
    }
    setOpen(false);
  }, [mode, selectedValues, op, min, max, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setMin("");
    setMax("");
    setOp("between");
    setSelectedValues(new Set());
    setMode("range");
    setOpen(false);
  }, [onChange]);

  const toggleValue = useCallback((v: string, checked: boolean) => {
    const num = parseFloat(v.replace(",", "."));
    setSelectedValues((prev) => {
      const n = new Set(prev);
      if (checked) n.add(num);
      else n.delete(num);
      return n;
    });
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          if (value?.values && value.values.length > 0) {
            setMode("values");
            setSelectedValues(new Set(value.values));
          } else if (uniqueValues && uniqueValues.length > 0) {
            setMode("values");
            setSelectedValues(new Set(uniqueValues));
          } else {
            setMode("range");
            setSelectedValues(new Set());
          }
          setOp(value?.op ?? "between");
          setMin(value?.min?.toString() ?? "");
          setMax(value?.max?.toString() ?? "");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer inline-flex items-center gap-1.5 transition-colors rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10",
            active && "text-primary"
          )}
          aria-label={`Filtrar ${label}`}
        >
          <span>{label}</span>
          <ListFilter className={cn("h-4 w-4 shrink-0 text-muted-foreground", active && "text-primary")} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[30rem] p-0 flex flex-col" align="start">
        <div className="p-2 border-b border-border flex gap-1">
          <Button
            type="button"
            variant={mode === "range" ? "default" : "secondary"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setMode("range")}
          >
            Range
          </Button>
          <Button
            type="button"
            variant={mode === "values" ? "default" : "secondary"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setMode("values")}
            disabled={valueOptions.length === 0}
          >
            Valores {valueOptions.length > 0 && `(${valueOptions.length})`}
          </Button>
        </div>

        {mode === "values" ? (
          <div className={cn("flex-1 overflow-y-auto", filterListScrollClass)}>
            <div className="flex gap-1 flex-wrap p-2 border-b border-border">
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set(valueOptions))}>
                Marcar todos
              </Button>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setSelectedValues(new Set())}>
                Desmarcar todos
              </Button>
            </div>
            {valueOptions.map((v) => (
              <FilterOptionRow
                key={v}
                opt={{ value: v.toString(), label: fmtValue(v, suffix) }}
                checked={selectedValues.has(v)}
                onToggle={toggleValue}
              />
            ))}
            {valueOptions.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                Sem valores únicos
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 border-b border-border space-y-3">
            <div className="flex gap-1 flex-wrap">
              {OPS_WITH_RANGE.map((o) => (
                <Button
                  key={o}
                  type="button"
                  variant={op === o ? "default" : "secondary"}
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setOp(o)}
                >
                  {OP_LABELS[o]}
                </Button>
              ))}
            </div>

            {op === "between" ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Mín"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="h-8 text-sm"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  placeholder="Máx"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  className="h-8 text-sm"
                />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{OP_LABELS[op]}</span>
                <Input
                  placeholder="Valor"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  className="h-8 text-sm flex-1"
                />
                {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
              </div>
            )}
          </div>
        )}

        <div className="p-2 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            Limpar
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

NumberRangeFilter.displayName = "NumberRangeFilter";

export default NumberRangeFilter;
export { isActive };