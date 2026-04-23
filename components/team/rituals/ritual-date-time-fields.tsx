"use client";

import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";

function isoYmdToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function formatIsoDateBr(iso: string): string {
  const d = isoYmdToDate(iso);
  if (!d) return "";
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

function quarterHourTimes(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

function normalizeHhmm(raw: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

type RitualDatePickerFieldProps = {
  value: string;
  onChange: (isoYmd: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Estilo do gatilho (ex.: altura e bordas alinhadas a inputs do formulário). */
  triggerClassName?: string;
};

export function RitualDatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled,
  id,
  triggerClassName,
}: RitualDatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = isoYmdToDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 w-full justify-start gap-0 text-left font-normal",
            !value && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{value ? formatIsoDateBr(value) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected ?? new Date()}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type RitualTimePickerFieldProps = {
  value: string;
  onChange: (hhmm: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export function RitualTimePickerField({
  value,
  onChange,
  placeholder = "Horário",
  disabled,
  id,
}: RitualTimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const baseSlots = useMemo(() => quarterHourTimes(), []);
  const slots = useMemo(() => {
    const set = new Set(baseSlots);
    const n = normalizeHhmm(value);
    if (n) set.add(n);
    return [...set].sort();
  }, [baseSlots, value]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-8 w-full justify-start gap-0 text-left font-normal tabular-nums",
            !value && "text-muted-foreground",
          )}
        >
          <Clock className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0" align="start">
        <ScrollArea className="h-[min(280px,45vh)] w-full">
          <div className="flex flex-col p-1">
            {slots.map((t) => (
              <Button
                key={t}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-full justify-start px-2 font-mono text-sm",
                  normalizeHhmm(value) === t && "bg-accent font-medium text-accent-foreground",
                )}
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
              >
                {t}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
