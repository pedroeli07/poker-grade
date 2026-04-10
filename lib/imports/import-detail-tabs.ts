import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  RefreshCw,
} from "lucide-react";
import type { Tab } from "@/lib/types";

export type ImportDetailTabDef = {
  id: Tab;
  label: string;
  icon: LucideIcon;
  activeCls: string;
  inactiveCls: string;
  countCls: string;
  iconClass: string;
  countNumberClass: string;
  cardActiveClass: string;
};

export const IMPORT_DETAIL_TAB_DEFS: ImportDetailTabDef[] = [
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

export const IMPORT_DETAIL_CARD_INACTIVE_CLS =
  "border-border bg-white hover:border-blue-300";

export type ImportDetailTabWithCount = ImportDetailTabDef & { count: number };

export function buildImportDetailTabs(
  counts: Record<Tab, number>
): ImportDetailTabWithCount[] {
  return IMPORT_DETAIL_TAB_DEFS.map((def) => ({
    ...def,
    count: counts[def.id],
  }));
}
