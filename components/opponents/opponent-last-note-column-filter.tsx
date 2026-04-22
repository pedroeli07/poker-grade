"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useCallback, memo } from "react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ListFilter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import {
  COLUMN_FILTER_ARIA_PREFIX,
  COLUMN_FILTER_BTN_APPLY,
  COLUMN_FILTER_BTN_CANCEL,
  COLUMN_FILTER_BTN_CLEAR,
  COLUMN_FILTER_BTN_DESELECT_ALL,
  COLUMN_FILTER_BTN_SELECT_ALL,
  COLUMN_FILTER_EMPTY_MESSAGE,
  COLUMN_FILTER_SEARCH_PLACEHOLDER,
} from "@/lib/constants/column-filter";
import { cn } from "@/lib/utils/cn";
import {
  columnFilterValueKeys,
  commitColumnFilterSelection,
  filterColumnOptionsBySearch,
  initialColumnFilterPending,
} from "@/lib/utils/column-filter";
import FilterOptionRow from "@/components/filter-row-option";
import { dayKeyFromDate, type OpponentsLastNoteFilterState } from "@/lib/opponents/last-note-filter";
import { toast } from "@/lib/toast";

type Option = { value: string; label: string };

function isoToLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function formatIsoDisplay(iso: string): string {
  const d = parse(iso, "yyyy-MM-dd", new Date());
  if (!isValid(d)) return iso;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

const OpponentLastNoteColumnFilter = memo(function OpponentLastNoteColumnFilter({
  columnId,
  label,
  options,
  applied,
  onApply,
  ariaLabel = "Última",
}: {
  columnId: string;
  label: ReactNode;
  options: Option[];
  applied: OpponentsLastNoteFilterState;
  onApply: (next: OpponentsLastNoteFilterState) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingUnique, setPendingUnique] = useState<Set<string>>(new Set());
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const [openFromPicker, setOpenFromPicker] = useState(false);
  const [openToPicker, setOpenToPicker] = useState(false);

  const allKeys = useMemo(() => columnFilterValueKeys(options), [options]);

  const initPending = useCallback(() => {
    setPendingUnique(initialColumnFilterPending(applied.unique, allKeys));
    setPendingFrom(applied.dateFrom ?? "");
    setPendingTo(applied.dateTo ?? "");
    setSearch("");
  }, [applied.unique, applied.dateFrom, applied.dateTo, allKeys]);

  const filteredOptions = useMemo(
    () => filterColumnOptionsBySearch(options, search),
    [options, search]
  );

  const active =
    applied.unique !== null || Boolean(applied.dateFrom) || Boolean(applied.dateTo);

  function toggle(value: string, checked: boolean) {
    setPendingUnique((prev) => {
      const n = new Set(prev);
      if (checked) n.add(value);
      else n.delete(value);
      return n;
    });
  }

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) initPending();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto gap-1.5 rounded-md px-1 py-0.5 -mx-1 font-semibold text-foreground hover:bg-primary/10",
            active && "text-primary"
          )}
          aria-label={`${COLUMN_FILTER_ARIA_PREFIX} ${ariaLabel}`}
        >
          <span>{label}</span>
          <ListFilter
            className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground", active && "text-primary")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(100vw-2rem,22rem)] gap-0 overflow-hidden p-0 sm:w-[22rem]"
        align="start"
      >
        <div className="flex flex-col gap-0">
          <div className="border-b border-border bg-muted/30 px-3 py-2.5">
            <PopoverHeader className="gap-1 border-0 p-0">
              <PopoverTitle className="text-sm">Valores na base</PopoverTitle>
              <PopoverDescription className="text-xs">Busque e marque datas específicas</PopoverDescription>
            </PopoverHeader>
            <Input
              placeholder={COLUMN_FILTER_SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-2 h-9 text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPendingUnique(new Set(allKeys))}
              >
                {COLUMN_FILTER_BTN_SELECT_ALL}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPendingUnique(new Set())}
              >
                {COLUMN_FILTER_BTN_DESELECT_ALL}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[220px]">
            <div className="p-2 pr-4">
              {filteredOptions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {COLUMN_FILTER_EMPTY_MESSAGE}
                </p>
              ) : (
                filteredOptions.map((opt) => (
                  <FilterOptionRow
                    key={`${columnId}-${opt.value}`}
                    opt={opt}
                    checked={pendingUnique.has(opt.value)}
                    onToggle={toggle}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="space-y-3 p-3">
            <PopoverHeader className="gap-1 border-0 p-0">
              <PopoverTitle className="text-sm">Intervalo de datas</PopoverTitle>
              <PopoverDescription className="text-xs">Limite por período (inclusive)</PopoverDescription>
            </PopoverHeader>

            <div className="space-y-2">
              <Label htmlFor={`${columnId}-from`} className="text-xs text-muted-foreground">
                De
              </Label>
              <Popover open={openFromPicker} onOpenChange={setOpenFromPicker} modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    id={`${columnId}-from`}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pendingFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4 opacity-70" />
                    {pendingFrom ? formatIsoDisplay(pendingFrom) : "Escolher data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={isoToLocalDate(pendingFrom)}
                    onSelect={(d) => {
                      setPendingFrom(d ? dayKeyFromDate(d) : "");
                      setOpenFromPicker(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${columnId}-to`} className="text-xs text-muted-foreground">
                Até
              </Label>
              <Popover open={openToPicker} onOpenChange={setOpenToPicker} modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    id={`${columnId}-to`}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pendingTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4 opacity-70" />
                    {pendingTo ? formatIsoDisplay(pendingTo) : "Escolher data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={isoToLocalDate(pendingTo)}
                    onSelect={(d) => {
                      setPendingTo(d ? dayKeyFromDate(d) : "");
                      setOpenToPicker(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-muted/20 px-2 py-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              {COLUMN_FILTER_BTN_CANCEL}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onApply({ unique: null, dateFrom: null, dateTo: null });
                setOpen(false);
              }}
            >
              {COLUMN_FILTER_BTN_CLEAR}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const from = pendingFrom || null;
                const to = pendingTo || null;
                if (from && to && from > to) {
                  toast.error("A data inicial não pode ser maior que a final.");
                  return;
                }
                let uniqueResult: Set<string> | null = null;
                commitColumnFilterSelection(pendingUnique, allKeys, (u) => {
                  uniqueResult = u;
                });
                onApply({
                  unique: uniqueResult,
                  dateFrom: from,
                  dateTo: to,
                });
                setOpen(false);
              }}
            >
              {COLUMN_FILTER_BTN_APPLY}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

OpponentLastNoteColumnFilter.displayName = "OpponentLastNoteColumnFilter";

export default OpponentLastNoteColumnFilter;
