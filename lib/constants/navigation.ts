import { UserRole } from "@prisma/client";
import { SharkIcon } from "@/components/shark-icon";
import type { SidebarNavEntry } from "@/lib/types";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Binoculars,
  Bug,
  FlaskConical,
  Grid3X3,
  History,
  Home,
  Layers,
  LineChart,
  Target,
  Upload,
  UserCircle,
  UserRoundCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STAFF_WRITE_ROLES } from "./session-rbac";
import { nodeEnv } from "./env";

type PrimaryNavRow = { title: string; href: string; icon: LucideIcon; exact?: true };

const PRIMARY_NAV: PrimaryNavRow[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home, exact: true },
  { title: "Minha Grade", href: "/dashboard/minha-grade", icon: Layers },
  { title: "Jogadores", href: "/dashboard/players", icon: Users },
  { title: "Grades", href: "/dashboard/grades", icon: Grid3X3 },
  { title: "Importações", href: "/dashboard/imports", icon: Upload },
  { title: "Revisão", href: "/dashboard/review", icon: AlertTriangle },
  { title: "Targets", href: "/dashboard/targets", icon: Target },
  { title: "Histórico", href: "/dashboard/history", icon: History },
  { title: "Usuários", href: "/dashboard/users", icon: UserRoundCog },
];

const SHARKSCOPE_ITEMS = [
  { title: "Alertas", href: "/dashboard/sharkscope/alerts", icon: BellRing },
  { title: "Analytics", href: "/dashboard/sharkscope/analytics", icon: LineChart },
  { title: "Scouting", href: "/dashboard/sharkscope/scouting", icon: Binoculars },
  ...(nodeEnv === "development"
    ? [
        { title: "Debug grupo", href: "/dashboard/sharkscope/group-compare", icon: FlaskConical },
        { title: "Debug 1 jogador", href: "/dashboard/sharkscope/player-debug", icon: Bug },
        { title: "Debug analytics", href: "/dashboard/sharkscope/analytics-debug", icon: LineChart },
      ]
    : []),
];

export const SIDEBAR_NAV_ITEMS: SidebarNavEntry[] = [
  ...PRIMARY_NAV.map((row) => ({
    kind: "link" as const,
    title: row.title,
    href: row.href,
    icon: row.icon,
    ...(row.exact ? { exact: true as const } : {}),
  })),
  {
    kind: "group" as const,
    title: "SharkScope",
    icon: SharkIcon,
    items: [...SHARKSCOPE_ITEMS],
  },
];

export const SIDEBAR_SECONDARY_ITEMS = [
  { title: "Notificações", href: "/dashboard/notifications", icon: Bell },
  { title: "Meu Perfil", href: "/dashboard/profile", icon: UserCircle },
] as const;

function collectSidebarHrefs(entries: SidebarNavEntry[]): string[] {
  const hrefs: string[] = [];
  for (const e of entries) {
    if (e.kind === "link") hrefs.push(e.href);
    else for (const sub of e.items) hrefs.push(sub.href);
  }
  return hrefs;
}

export const TOPBAR_PAGE_TITLES = Object.fromEntries(
  [...collectSidebarHrefs(SIDEBAR_NAV_ITEMS), ...SIDEBAR_SECONDARY_ITEMS.map((i) => i.href)].map((href) => [
    href,
    "",
  ]),
) as Record<string, string>;

export function canCreate(session: { role: UserRole }): boolean {
  return STAFF_WRITE_ROLES.includes(session.role);
}

export function canEditPlayers(session: { role: UserRole }): boolean {
  return STAFF_WRITE_ROLES.includes(session.role);
}
