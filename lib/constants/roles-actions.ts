import { UserRole } from "@prisma/client";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export const ACTION_CONFIG = {
  UPGRADE: {
    label: "Subida de Limite",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  MAINTAIN: {
    label: "Manutenção",
    icon: Minus,
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border text-muted-foreground",
  },
  DOWNGRADE: {
    label: "Descida de Limite",
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20 text-red-500",
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  COACH: "Coach",
  MANAGER: "Manager",
  PLAYER: "Jogador",
  VIEWER: "Visualizador",
};
