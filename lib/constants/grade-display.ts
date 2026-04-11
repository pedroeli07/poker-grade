import {
  ArrowDownCircle,
  ArrowUpCircle,
  Circle,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export const GRADE_TYPE_CONFIG = {
  ABOVE: {
    label: "Grade Acima",
    desc: "Disponível após cumprir os targets",
    icon: ArrowUpCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5 border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  MAIN: {
    label: "Minha Grade",
    desc: "Grade atual - você está aqui",
    icon: Circle,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  BELOW: {
    label: "Grade Abaixo",
    desc: "Grade de reconstrução se necessário",
    icon: ArrowDownCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/5 border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

export const TARGET_STATUS_CONFIG = {
  ON_TRACK: { icon: TrendingUp, color: "text-emerald-500", label: "Na meta" },
  ATTENTION: { icon: Minus, color: "text-amber-500", label: "Atenção" },
  OFF_TRACK: { icon: TrendingDown, color: "text-red-500", label: "Fora da Meta" },
};

export const gradeOrder = ["ABOVE", "MAIN", "BELOW"] as const;