import { type ComponentType } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type TargetStatusKey = "ON_TRACK" | "ATTENTION" | "OFF_TRACK";

export interface TargetStatusConfig {
  label: string;
  icon: ComponentType<{ className?: string }>;
  bg: string;
  color: string;
}

export const TARGET_STATUS_CONFIG: Record<TargetStatusKey, TargetStatusConfig> = {
  ON_TRACK: {
    label: "No Caminho Certo",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    color: "text-emerald-500",
  },
  ATTENTION: {
    label: "Atenção Necessária",
    icon: AlertTriangle,
    bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
    color: "text-amber-500",
  },
  OFF_TRACK: {
    label: "Fora da Meta",
    icon: XCircle,
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
    color: "text-red-500",
  },
};
