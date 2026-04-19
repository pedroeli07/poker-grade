"use client";

import { useState, memo } from "react";
import { ListFilter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FilteredColumnTitle from "@/components/data-table/filtered-column-title";
import {
  COLUMN_FILTER_BTN_APPLY,
  COLUMN_FILTER_BTN_CANCEL,
  COLUMN_FILTER_BTN_CLEAR,
} from "@/lib/constants";
import { toast } from "@/lib/toast";

export const NotificationTextSearchFilter = memo(function NotificationTextSearchFilter({
  applied,
  onApply,
}: {
  applied: string | null;
  onApply: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState("");
  const active = Boolean(applied?.length);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setPending(applied ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10",
            active && "text-primary"
          )}
          aria-label="Filtrar título e mensagem"
        >
          <FilteredColumnTitle active={active}>Título e mensagem</FilteredColumnTitle>
          <ListFilter
            className={cn("h-4 w-4 shrink-0 text-muted-foreground", active && "text-primary")}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 sm:w-[22rem]" align="start">
        <Input
          placeholder="Buscar em título ou mensagem…"
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          className="h-9 text-sm mb-3"
          maxLength={200}
        />
        <div className="flex justify-end gap-2 flex-wrap">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            {COLUMN_FILTER_BTN_CANCEL}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onApply(null);
              setOpen(false);
            }}
          >
            {COLUMN_FILTER_BTN_CLEAR}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const t = pending.trim();
              onApply(t.length ? t : null);
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

NotificationTextSearchFilter.displayName = "NotificationTextSearchFilter";

export const NotificationDateRangeFilter = memo(function NotificationDateRangeFilter({
  dateFrom,
  dateTo,
  onApply,
}: {
  dateFrom: string | null;
  dateTo: string | null;
  onApply: (next: { dateFrom: string | null; dateTo: string | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingFrom, setPendingFrom] = useState("");
  const [pendingTo, setPendingTo] = useState("");
  const active = Boolean(dateFrom || dateTo);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setPendingFrom(dateFrom ?? "");
          setPendingTo(dateTo ?? "");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "cursor-pointer inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 -mx-1 text-left font-semibold text-foreground hover:bg-primary/10",
            active && "text-primary"
          )}
          aria-label="Filtrar por data"
        >
          <FilteredColumnTitle active={active}>Data</FilteredColumnTitle>
          <ListFilter
            className={cn("h-4 w-4 shrink-0 text-muted-foreground", active && "text-primary")}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 sm:w-[22rem]" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">De</span>
            <Input
              type="date"
              value={pendingFrom}
              onChange={(e) => setPendingFrom(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Até</span>
            <Input
              type="date"
              value={pendingTo}
              onChange={(e) => setPendingTo(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 flex-wrap mt-4">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            {COLUMN_FILTER_BTN_CANCEL}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onApply({ dateFrom: null, dateTo: null });
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
              onApply({ dateFrom: from, dateTo: to });
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

NotificationDateRangeFilter.displayName = "NotificationDateRangeFilter";
