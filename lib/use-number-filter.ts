import { useState, useCallback, useMemo } from "react";
import { NumberFilterOp, NumberFilterValue, isFilterActive, buildNumberFilter } from "@/lib/number-filter";

export function useNumberFilter(value: NumberFilterValue | null, uniqueValues?: number[]) {
  const [mode, setMode] = useState<"range" | "values">(value?.values?.length ? "values" : "range");
  const [op, setOp] = useState<NumberFilterOp>(value?.op ?? "between");
  const [min, setMin] = useState<string>(value?.min?.toString() ?? "");
  const [max, setMax] = useState<string>(value?.max?.toString() ?? "");
  const [selectedValues, setSelectedValues] = useState<Set<number>>(() => new Set(value?.values ?? []));

  const valueOptions = useMemo(() => uniqueValues?.slice().sort((a, b) => a - b) ?? [], [uniqueValues]);
  const active = isFilterActive(value);

  const handleApply = useCallback((onChange: (v: NumberFilterValue | null) => void) => {
    onChange(buildNumberFilter(mode, op, min, max, selectedValues));
  }, [mode, op, min, max, selectedValues]);

  const handleClear = useCallback((onChange: (v: NumberFilterValue | null) => void) => {
    onChange(null);
    setMin("");
    setMax("");
    setOp("between");
    setSelectedValues(new Set());
    setMode("range");
  }, []);

  const toggleValue = useCallback((v: string, checked: boolean) => {
    const num = parseFloat(v.replace(",", "."));
    setSelectedValues((prev) => {
      const n = new Set(prev);
      if (checked) n.add(num);
      else n.delete(num);
      return n;
    });
  }, []);

  const resetOpen = useCallback(() => {
    if (value?.values?.length) {
      setMode("values");
      setSelectedValues(new Set(value.values));
    } else if (uniqueValues?.length) {
      setMode("values");
      setSelectedValues(new Set(uniqueValues));
    } else {
      setMode("range");
      setSelectedValues(new Set());
    }
    setOp(value?.op ?? "between");
    setMin(value?.min?.toString() ?? "");
    setMax(value?.max?.toString() ?? "");
  }, [value, uniqueValues]);

  return { 
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
    resetOpen };
}