import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { distinctOptions } from "@/lib/utils/distinct-options";
import type { RitualDTO } from "@/lib/data/team/rituals-page";
import { RITUAL_LIST_COL_LABEL, RITUAL_TABLE_SORT_LABEL } from "@/lib/constants/team/rituals-list-columns";
import type {
  RitualListColKey,
  RitualListColumnFilters,
  RitualListColumnOptions,
  RitualListSortKey,
} from "@/lib/types/team/rituals-list";
import type { SortDir } from "@/lib/table-sort";
import { compareDate, compareNumber, compareString } from "@/lib/table-sort";

const SEED_MARKER = /<!--\s*gestao-grades:seed-team-rituals\s*-->/i;

const SEM_DRI = "__sem_dri__";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "concluido", label: "Concluído" },
  { value: "atrasado", label: "Atrasado" },
  { value: "agendado", label: "Agendado" },
];

export function ritualDescriptionForSearch(description: string | null | undefined): string {
  if (!description?.trim()) return "";
  return description.replace(SEED_MARKER, "").replace(/\n\n$/, "").trim();
}

export function ritualStatusKey(r: RitualDTO): "concluido" | "atrasado" | "agendado" {
  const data = new Date(r.startAt);
  if (r.executions.length > 0) return "concluido";
  if (data < new Date()) return "atrasado";
  return "agendado";
}

function driValue(r: RitualDTO): string {
  return r.driId ?? SEM_DRI;
}

function driLabel(r: RitualDTO): string {
  return r.dri?.displayName || r.responsibleName || "—";
}

function startAtDayValue(r: RitualDTO): string {
  return format(new Date(r.startAt), "yyyy-MM-dd");
}

function startAtDayLabel(r: RitualDTO): string {
  return format(new Date(r.startAt), "dd/MM/yyyy", { locale: ptBR });
}

function durationFilterValue(r: RitualDTO): string {
  return String(r.durationMin ?? 0);
}

function durationFilterLabel(r: RitualDTO): string {
  const n = r.durationMin ?? 0;
  return n > 0 ? `${n} min` : "—";
}

export function buildRitualListColumnOptions(rituals: RitualDTO[]): RitualListColumnOptions {
  const name = distinctOptions(rituals, (r) => ({ value: r.name, label: r.name }));
  const area = distinctOptions(rituals, (r) => ({ value: r.area, label: r.area || "—" }));
  const ritualType = distinctOptions(rituals, (r) => ({
    value: r.ritualType,
    label: r.ritualType || "—",
  }));
  const recurrence = distinctOptions(rituals, (r) => ({
    value: r.recurrence,
    label: r.recurrence || "—",
  }));
  const dri = distinctOptions(rituals, (r) => ({ value: driValue(r), label: driLabel(r) }));
  const startAt = distinctOptions(rituals, (r) => ({
    value: startAtDayValue(r),
    label: startAtDayLabel(r),
  }));
  const durationMin = distinctOptions(rituals, (r) => ({
    value: durationFilterValue(r),
    label: durationFilterLabel(r),
  }));
  const status = [...STATUS_OPTIONS];
  return { name, area, ritualType, recurrence, dri, startAt, durationMin, status };
}

export function filterRituals(
  rituals: RitualDTO[],
  search: string,
  filters: RitualListColumnFilters,
): RitualDTO[] {
  const q = search.trim().toLowerCase();
  return rituals.filter((r) => {
    if (q) {
      const desc = ritualDescriptionForSearch(r.description);
      const blob = [
        r.name,
        desc,
        r.ritualType,
        r.area,
        r.recurrence,
        driLabel(r),
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filters.name && !filters.name.has(r.name)) return false;
    if (filters.area && !filters.area.has(r.area || "")) return false;
    if (filters.ritualType && !filters.ritualType.has(r.ritualType || "")) return false;
    if (filters.recurrence && !filters.recurrence.has(r.recurrence || "")) return false;
    if (filters.dri && !filters.dri.has(driValue(r))) return false;
    if (filters.startAt && !filters.startAt.has(startAtDayValue(r))) return false;
    if (filters.durationMin && !filters.durationMin.has(durationFilterValue(r))) return false;
    if (filters.status && !filters.status.has(ritualStatusKey(r))) return false;
    return true;
  });
}

export function sortRituals(
  rows: RitualDTO[],
  sort: { key: RitualListSortKey; dir: SortDir } | null,
): RitualDTO[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (key) {
      case "name":
        return compareString(a.name, b.name, dir);
      case "startAt":
        return compareDate(a.startAt, b.startAt, dir);
      case "area":
        return compareString(a.area || "", b.area || "", dir);
      case "ritualType":
        return compareString(a.ritualType || "", b.ritualType || "", dir);
      case "recurrence":
        return compareString(a.recurrence || "", b.recurrence || "", dir);
      case "driName":
        return compareString(driLabel(a), driLabel(b), dir);
      case "status":
        return compareString(ritualStatusKey(a), ritualStatusKey(b), dir);
      case "durationMin":
        return compareNumber(a.durationMin, b.durationMin, dir);
      default:
        return 0;
    }
  });
  return copy;
}

export function buildRitualListFilterSummaryLines(
  options: RitualListColumnOptions,
  applied: RitualListColumnFilters,
): string[] {
  const lines: string[] = [];
  for (const key of Object.keys(RITUAL_LIST_COL_LABEL) as RitualListColKey[]) {
    const set = applied[key];
    if (set === null || set.size === 0) continue;
    const opts = options[key] ?? [];
    const parts = [...set].map((val) => opts.find((o) => o.value === val)?.label ?? val);
    const label = RITUAL_LIST_COL_LABEL[key];
    lines.push(`${label}: ${parts.join(", ")}`);
  }
  return lines;
}

export function formatRitualTableSortSummary(
  sort: { key: RitualListSortKey; dir: SortDir } | null,
): string | null {
  if (!sort) return null;
  const l = RITUAL_TABLE_SORT_LABEL[sort.key] ?? sort.key;
  const dirPt = sort.dir === "asc" ? "crescente" : "decrescente";
  return `${l} (${dirPt})`;
}
