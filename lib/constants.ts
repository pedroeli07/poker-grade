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
} from "lucide-react";

export const SIDEBAR_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
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
  "/dashboard": "Dashboard",
  "/dashboard/players": "Jogadores",
  "/dashboard/grades": "Grades",
  "/dashboard/imports": "Importações",
  "/dashboard/review": "Revisão de Torneios",
  "/dashboard/targets": "Targets",
  "/dashboard/history": "Histórico",
  "/dashboard/usuarios": "Usuários",
  "/dashboard/notifications": "Notificações",
  "/dashboard/profile": "Meu Perfil",
};
