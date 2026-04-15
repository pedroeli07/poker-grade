import type { ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  Grid3X3,
  Minus,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

export const GRADE_TYPE_LABEL: Record<
  string,
  { label: string; color: string; icon: ComponentType<{ className?: string }> }
> = {
  ABOVE: {
    label: "Grade Acima",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: ChevronsUp,
  },
  MAIN: {
    label: "Grade Principal",
    color: "text-primary bg-primary/10 border-primary/20",
    icon: Grid3X3,
  },
  BELOW: {
    label: "Grade Abaixo",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: ChevronsDown,
  },
};

export const LIMIT_ACTION_CONFIG = {
  UPGRADE: {
    label: "Subida",
    icon: TrendingUp,
    color: "text-emerald-500",
    tableColor: "text-emerald-600",
  },
  MAINTAIN: {
    label: "Manutenção",
    icon: Minus,
    color: "text-muted-foreground",
    tableColor: "text-muted-foreground",
  },
  DOWNGRADE: {
    label: "Descida",
    icon: TrendingDown,
    color: "text-red-500",
    tableColor: "text-red-600",
  },
} as const;

const LIMIT_ACTION_KEYS = ["UPGRADE", "MAINTAIN", "DOWNGRADE"] as const;

export const LIMIT_ACTION_LABEL: Record<
  (typeof LIMIT_ACTION_KEYS)[number],
  { label: string; color: string }
> = Object.fromEntries(
  LIMIT_ACTION_KEYS.map((k) => [
    k,
    { label: LIMIT_ACTION_CONFIG[k].label, color: LIMIT_ACTION_CONFIG[k].tableColor },
  ]),
) as Record<(typeof LIMIT_ACTION_KEYS)[number], { label: string; color: string }>;

export const STATUS_CONFIG = {
  ON_TRACK: {
    label: "No Caminho",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  ATTENTION: {
    label: "Atenção",
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
  OFF_TRACK: {
    label: "Fora da Meta",
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
  },
} as const;

export const NONE_LIMIT = "__none__";

export const STALE_TIME = 30_000;

const FIELD_STRING = [
  "filterName",
  "fromTime",
  "toTime",
  "excludePattern",
] as const;
const FIELD_FLOAT = [
  "buyInMin",
  "buyInMax",
  "prizePoolMin",
  "prizePoolMax",
] as const;
const FIELD_INT = ["minParticipants", "timezone"] as const;
const FIELD_ARRAY = [
  "sites",
  "speed",
  "variant",
  "tournamentType",
  "gameType",
  "playerCount",
  "weekDay",
] as const;
const FIELD_BOOL = ["autoOnly", "manualOnly"] as const;

export const FIELD_CONFIG = {
  ...Object.fromEntries(FIELD_STRING.map((k) => [k, { type: "string" as const }])),
  ...Object.fromEntries(FIELD_FLOAT.map((k) => [k, { type: "float" as const }])),
  ...Object.fromEntries(FIELD_INT.map((k) => [k, { type: "int" as const }])),
  ...Object.fromEntries(FIELD_ARRAY.map((k) => [k, { type: "array" as const }])),
  ...Object.fromEntries(FIELD_BOOL.map((k) => [k, { type: "boolean" as const }])),
} as const;
