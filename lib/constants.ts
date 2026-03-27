import {
  Grid3X3,
  LayoutDashboard,
  Upload,
  Users,
  AlertTriangle,
  Target,
  History,
  UserRoundCog,
  Bell,
  UserCircle,
  TrendingDown,
  Minus,
  CheckCircle2,
  ChevronsUp,
  ChevronsDown,
  XCircle,
  TrendingUp,
  Layers,
} from "lucide-react";
import { canViewPlayer } from "./utils";
import { notFound, redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireSession } from "./auth/session";

export const SIDEBAR_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Minha Grade",
    href: "/dashboard/minha-grade",
    icon: Layers,
  },
  {
    title: "Jogadores",
    href: "/dashboard/players",
    icon: Users,
  },
  {
    title: "Grades",
    href: "/dashboard/grades",
    icon: Grid3X3,
  },
  {
    title: "Importações",
    href: "/dashboard/imports",
    icon: Upload,
  },
  {
    title: "Revisão",
    href: "/dashboard/review",
    icon: AlertTriangle,
  },
  {
    title: "Targets",
    href: "/dashboard/targets",
    icon: Target,
  },
  {
    title: "Histórico",
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "Usuários",
    href: "/dashboard/usuarios",
    icon: UserRoundCog,
  },
] as const;

export const SIDEBAR_SECONDARY_ITEMS = [
  {
    title: "Notificações",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Meu Perfil",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
] as const;

export const TOPBAR_PAGE_TITLES: Record<string, string> = {
  "/dashboard": "",
  "/dashboard/players": "",
  "/dashboard/grades": "",
  "/dashboard/imports": "",
  "/dashboard/review": "",
  "/dashboard/targets": "",
  "/dashboard/history": "",
  "/dashboard/usuarios": "",
  "/dashboard/notifications": "",
  "/dashboard/profile": "",
};


export const GRADE_TYPE_LABEL: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ABOVE: { label: "Grade Acima", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: ChevronsUp },
  MAIN: { label: "Grade Principal", color: "text-primary bg-primary/10 border-primary/20", icon: Grid3X3 },
  BELOW: { label: "Grade Abaixo", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: ChevronsDown },
};

export const TARGET_STATUS_CONFIG = {
  ON_TRACK: { label: "No Caminho", icon: CheckCircle2, color: "text-emerald-500" },
  ATTENTION: { label: "Atenção", icon: AlertTriangle, color: "text-amber-500" },
  OFF_TRACK: { label: "Fora da Meta", icon: XCircle, color: "text-red-500" },
};

export const LIMIT_ACTION_CONFIG = {
  UPGRADE: { label: "Subida", icon: TrendingUp, color: "text-emerald-500" },
  MAINTAIN: { label: "Manutenção", icon: Minus, color: "text-muted-foreground" },
  DOWNGRADE: { label: "Descida", icon: TrendingDown, color: "text-red-500" },
};
