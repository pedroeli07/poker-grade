import { UserRole } from "@prisma/client";

/** Staff usa prefixo `/admin`; jogadores são bloqueados em `/admin/*` pelo proxy e devem usar `/jogador/...`. */
export function accountProfileHref(role: UserRole): string {
  return role === UserRole.PLAYER ? "/jogador/meu-perfil" : "/admin/meu-perfil";
}

export function accountNotificationsHref(role: UserRole): string {
  return role === UserRole.PLAYER ? "/jogador/notificacoes" : "/admin/notificacoes";
}
import { SharkIcon } from "@/components/shark-icon";
import type { SidebarNavEntry } from "@/lib/types/dashboard/index";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BellRing,
  Binoculars,
  Bug,
  Building2,
  CalendarClock,
  FlaskConical,
  GitBranch,
  Grid2x2Check,
  Grid3X3,
  History,
  Home,
  Layers,
  LineChart,
  ListChecks,
  ListOrdered,
  NotebookPen,
  Sparkles,
  Target,
  Upload,
  UserCircle,
  UserRoundCog,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { STAFF_WRITE_ROLES } from "./session-rbac";
import { nodeEnv } from "./env";

type PrimaryNavRow = { title: string; href: string; icon: LucideIcon; exact?: true };

const PRIMARY_NAV: PrimaryNavRow[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Home, exact: true },
  { title: "Início", href: "/jogador/dashboard", icon: Home, exact: true },
  { title: "Minha Grade", href: "/jogador/minha-grade", icon: Layers },
  { title: "Meus Torneios", href: "/jogador/meus-torneios", icon: ListOrdered },
  { title: "Metas", href: "/jogador/metas", icon: Target },
  { title: "Histórico", href: "/jogador/historico", icon: History },
  { title: "Jogadores", href: "/admin/jogadores", icon: Users },
  { title: "Adversários", href: "/admin/adversarios", icon: NotebookPen },
  { title: "Adversários", href: "/jogador/adversarios", icon: NotebookPen },
  { title: "Usuários", href: "/admin/usuarios", icon: UserRoundCog },
];

const GRADES_GROUP_ICON: LucideIcon = Grid3X3;

const TIME_GROUP_ICON: LucideIcon = Building2;

const TIME_ITEMS = [
  { title: "Identidade", href: "/admin/time/identidade", icon: Sparkles },
  { title: "Governança", href: "/admin/time/governanca", icon: GitBranch },
  { title: "Rituais", href: "/admin/time/rituais", icon: CalendarClock },
  { title: "Execução", href: "/admin/time/execucao", icon: ListChecks },
  { title: "Indicadores", href: "/admin/time/indicadores", icon: BarChart3 },
  { title: "Financeiro", href: "/admin/time/financeiro", icon: Wallet },
];

const GRADES_ITEMS = [
  { title: "Perfis", href: "/admin/grades/perfis", icon: Grid2x2Check },
  { title: "Importações", href: "/admin/grades/importacoes", icon: Upload },
  { title: "Revisão", href: "/admin/grades/revisao", icon: AlertTriangle },
  { title: "Metas", href: "/admin/grades/metas", icon: Target },
  { title: "Histórico", href: "/admin/grades/historico", icon: History },
];

const SHARKSCOPE_ITEMS = [
  { title: "Alertas", href: "/admin/sharkscope/alertas", icon: BellRing },
  { title: "Análises", href: "/admin/sharkscope/analises", icon: LineChart },
  { title: "Avaliação", href: "/admin/sharkscope/avaliacao", icon: Binoculars },
  ...(nodeEnv === "development"
    ? [
        { title: "Debug Grupo", href: "/admin/sharkscope/group-compare", icon: FlaskConical },
        { title: "Debug 1 Jogador", href: "/admin/sharkscope/player-debug", icon: Bug },
        { title: "Debug Análises", href: "/admin/sharkscope/analytics-debug", icon: LineChart },
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
    title: "Time",
    icon: TIME_GROUP_ICON,
    items: [...TIME_ITEMS],
  },
  {
    kind: "group" as const,
    title: "Grades",
    icon: GRADES_GROUP_ICON,
    items: [...GRADES_ITEMS],
  },
  {
    kind: "group" as const,
    title: "SharkScope",
    icon: SharkIcon,
    items: [...SHARKSCOPE_ITEMS],
  },
];

export const SIDEBAR_SECONDARY_ITEMS = [
  { title: "Notificações", href: "/admin/notificacoes", icon: Bell },
  { title: "Meu Perfil", href: "/admin/meu-perfil", icon: UserCircle },
] as const;

/** Rotas `kind: "link"` mostradas a PLAYER (entradas em grupo não entram nesta lista). */
export const SIDEBAR_PLAYER_LINK_HREFS = [
  "/jogador/dashboard",
  "/jogador/minha-grade",
  "/jogador/meus-torneios",
  "/jogador/metas",
  "/jogador/historico",
  "/jogador/adversarios",
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
