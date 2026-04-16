import type { ImportsColumnKey, ImportDetailTabDef } from "@/lib/types";
import { AlertTriangle, CheckCircle2, MinusCircle, RefreshCw } from "lucide-react";

// ─── imports-columns ─────────────────────────────────────────────────────────

const IMPORT_COLS = [
  ["fileName", "Arquivo", "imp-file"],
  ["player", "Jogador", "imp-player"],
  ["totalRows", "Total", "imp-total"],
  ["played", "Jogados", "imp-played"],
  ["extraPlay", "Extra Play", "imp-extra"],
  ["didntPlay", "Não Jogados", "imp-didnt"],
  ["date", "Data", "imp-date"],
] as const satisfies readonly (readonly [ImportsColumnKey, string, string])[];

const IMPORTS_TABLE_COLUMN_ORDER: ImportsColumnKey[] = IMPORT_COLS.map((r) => r[0]);

const IMPORTS_COLUMN_LABELS = Object.fromEntries(
  IMPORT_COLS.map(([k, label]) => [k, label]),
) as Record<ImportsColumnKey, string>;

export const IMPORTS_COLUMN_IDS = Object.fromEntries(
  IMPORT_COLS.map(([k, , id]) => [k, id]),
) as Record<ImportsColumnKey, string>;

// ─── imports-list-ui ───────────────────────────────────────────────────────────

/** Padrão `date-fns` para data/hora na listagem de importações. */
const IMPORT_LIST_ROW_DATE_FORMAT = "dd/MM/yyyy • HH:mm";

/** Texto quando um filtro de coluna está ativo mas sem valores selecionados no resumo. */
const IMPORTS_FILTER_SUMMARY_EMPTY_SELECTION = "(nenhum valor selecionado)";

const IMPORT_DETAIL_TAB_DEFS: ImportDetailTabDef[] = [
  { 
    id: "extra",
    label: "Extra Play",
    icon: AlertTriangle,
    activeCls: "border-red-500 text-red-500 bg-red-500/10",
    inactiveCls: "border-transparent text-muted-foreground",
    countCls: "bg-red-500/20 text-red-500",
    iconClass: "text-red-500",
    countNumberClass: "text-red-500",
    cardActiveClass:
      "border-red-500/30 bg-red-500/20 shadow-md shadow-red-500 hover:shadow-lg hover:shadow-red-400",
  },
  {
    id: "rebuy",
    label: "Com Rebuy",
    icon: RefreshCw,
    activeCls: "border-orange-500 text-orange-500 bg-orange-500/10",
    inactiveCls: "border-transparent text-muted-foreground",
    countCls: "bg-orange-500/20 text-orange-500",
    iconClass: "text-orange-500",
    countNumberClass: "text-orange-500",
    cardActiveClass:
      "border-orange-500/30 bg-orange-500/20 shadow-md shadow-orange-500 hover:shadow-lg hover:shadow-orange-400",
  },
  {
    id: "played",
    label: "Jogados",
    icon: CheckCircle2,
    activeCls: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
    inactiveCls: "border-transparent text-muted-foreground",
    countCls: "bg-emerald-500/20 text-emerald-500",
    iconClass: "text-emerald-500",
    countNumberClass: "text-emerald-500",
    cardActiveClass:
      "border-emerald-500/30 bg-emerald-500/20 shadow-md shadow-emerald-500 hover:shadow-lg hover:shadow-emerald-400",
  },
  {
    id: "missed",
    label: "Não Jogados",
    icon: MinusCircle,
    activeCls: "border-zinc-400 text-zinc-500 bg-zinc-500/10",
    inactiveCls: "border-transparent text-muted-foreground",
    countCls: "bg-zinc-500/20 text-zinc-500",
    iconClass: "text-zinc-500",
    countNumberClass: "text-zinc-600",
    cardActiveClass:
      "border-zinc-500/30 bg-zinc-500/20 shadow-md shadow-zinc-500 hover:shadow-lg hover:shadow-zinc-400",
  },
];

const IMPORT_DETAIL_CARD_INACTIVE_CLS =
  "border-border bg-white hover:border-blue-300";

export { 
  IMPORTS_TABLE_COLUMN_ORDER, 
  IMPORTS_COLUMN_LABELS,  
  IMPORT_LIST_ROW_DATE_FORMAT, 
  IMPORTS_FILTER_SUMMARY_EMPTY_SELECTION, 
  IMPORT_DETAIL_TAB_DEFS, 
  IMPORT_DETAIL_CARD_INACTIVE_CLS 
};