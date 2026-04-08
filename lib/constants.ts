import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { PlayerStatus, UserRole } from "@prisma/client";
import { SharkIcon } from "@/components/shark-icon";
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
  BellRing,
  LineChart,
  Binoculars,
  Home,
  Globe,
  Trophy,
  Zap,
} from "lucide-react";
import { PokerNetworkKey, SharkscopeAnalyticsTab } from "./types";

export const INVITE_ROLES: { value: UserRole; label: string }[] = [
  { value: UserRole.VIEWER, label: "Viewer" },
  { value: UserRole.PLAYER, label: "Player" },
  { value: UserRole.COACH, label: "Coach" },
  { value: UserRole.MANAGER, label: "Manager" },
  { value: UserRole.ADMIN, label: "Admin" },
];



export const SESSION_COOKIE_NAME = "gg_session";

/** CSRF state para OAuth Google (cookie httpOnly). */
export const GOOGLE_OAUTH_STATE_COOKIE = "gg_oauth_state";

/** Access token / cookie max age (segundos) — máx. 24h conforme política */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;


/** Escrita operacional (import, jogadores, revisão) */
export const STAFF_WRITE_ROLES: UserRole[] = ["ADMIN", "MANAGER", "COACH"];

/** Gestão de grades (criar / importar / apagar) */
export const GRADE_ADMIN_ROLES: UserRole[] = ["ADMIN", "MANAGER"];

/** Só leitura no dashboard */
export const READ_ALL_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "COACH",
  "VIEWER",
  "PLAYER",
];


/** Importação Excel — jogador pode enviar apenas a própria aba (checado na action). */
export const IMPORT_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "COACH",
  "PLAYER",
];

export const TOOLTIP_DELAY_MS = 0;

export const APP_TOASTER_PROPS = {
  position: "top-right" as const,
  richColors: true,
  closeButton: true,
};


export const STATUS_OPTIONS: { value: PlayerStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "SUSPENDED", label: "Suspenso" },
  { value: "INACTIVE", label: "Inativo" },
];

export const POKER_NETWORKS_UI = [
  { value: 'gg', label: 'GGPoker', icon: '/gg-poker-logo.png' },
  { value: 'pokerstars', label: 'PokerStars', icon: '/poker-stars-logo.jpeg' },
  { value: '888', label: '888 Poker', icon: '/888-poker-logo.png' },
  { value: 'partypoker', label: 'Party Poker', icon: '/party-poker-logo.png' },
  { value: 'ipoker', label: 'iPoker', icon: '/i-poker-logo.png' },
  { value: 'wpt', label: 'WPT Global', icon: '/wpt-poker-logo.png' },
  { value: 'coinpoker', label: 'CoinPoker', icon: '/coin-poker-logo.jpeg' },
];


export const LOBBYZE_TO_SHARKSCOPE: Record<number, string> = {
  2: "gg",
  3: "partypoker",
  10: "pokerstars",
  335: "wpt",
  6: "ipoker",
  406: "coinpoker",
  1: "pokerstars",
  5: "888",
};

export const POKER_NETWORKS = {
  gg: { label: "GGPoker", sharkscopeCode: "gg" },
  pokerstars: { label: "PokerStars", sharkscopeCode: "pokerstars" },
  "888": { label: "888 Poker", sharkscopeCode: "888" },
  partypoker: { label: "Party Poker", sharkscopeCode: "partypoker" },
  ipoker: { label: "iPoker", sharkscopeCode: "ipoker" },
  wpt: { label: "WPT Global", sharkscopeCode: "wpt" },
  coinpoker: { label: "CoinPoker", sharkscopeCode: "coinpoker" },
} as const;


export const NETWORK_OPTS = Object.entries(POKER_NETWORKS).map(([k, v]) => ({
  value: k as PokerNetworkKey,
  label: v.label,
}));


export const ABI_ALVO_TARGET_NAME = "ABI alvo";

export const TAB_ICONS: Record<SharkscopeAnalyticsTab, LucideIcon> = {
  site: Globe,
  ranking: Trophy,
  tier: Layers,
  bounty: Zap,
};

export const TAB_IDS = Object.keys(TAB_ICONS) as SharkscopeAnalyticsTab[];

export const PLAYERS_PER_PAGE = 5;
export const NO_COACH_QUERY = "none";
export const REVIEW_NO_COACH_SENTINEL = "__no_coach__";
export const EMPTY_NICK = "__empty__";
export const EMPTY_PLAYER = "__empty__";
export const EMPTY_DESC = "__empty__";
export const NONE = "__none__";
export const cardClassName="bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_32px_-4px_oklch(0.45_0.18_250/26%),0_2px_8px_-2px_oklch(0.45_0.18_250/14%)] transition-all duration-200 hover:border-[oklch(0.45_0.18_250)] hover:shadow-[0_8px_48px_-6px_oklch(0.45_0.18_250/38%),0_4px_24px_-6px_oklch(0.45_0.18_250/20%)] overflow-hidden group"
export const playersHoverScrollClass =
  "max-h-[min(320px,50vh)] overflow-y-auto overflow-x-hidden space-y-0.5 pr-1 " +
  "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)] " +
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35";

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


export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: UserRole.VIEWER, label: "Viewer" },
  { value: UserRole.PLAYER, label: "Player" },
  { value: UserRole.COACH, label: "Coach" },
  { value: UserRole.MANAGER, label: "Manager" },
  { value: UserRole.ADMIN, label: "Admin" },
];

export type SidebarNavLink = {
  kind: "link";
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type SidebarNavGroupItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type SidebarGroupIcon =
  | LucideIcon
  | ComponentType<{ className?: string }>;

export type SidebarNavGroup = {
  kind: "group";
  title: string;
  icon: SidebarGroupIcon;
  items: SidebarNavGroupItem[];
};

export type SidebarNavEntry = SidebarNavLink | SidebarNavGroup;

export const SIDEBAR_NAV_ITEMS: SidebarNavEntry[] = [
  {
    kind: "link",
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    exact: true,
  },
  {
    kind: "link",
    title: "Minha Grade",
    href: "/dashboard/minha-grade",
    icon: Layers,
  },
  {
    kind: "link",
    title: "Jogadores",
    href: "/dashboard/players",
    icon: Users,
  },
  {
    kind: "link",
    title: "Grades",
    href: "/dashboard/grades",
    icon: Grid3X3,
  },
  {
    kind: "link",
    title: "Importações",
    href: "/dashboard/imports",
    icon: Upload,
  },
  {
    kind: "link",
    title: "Revisão",
    href: "/dashboard/review",
    icon: AlertTriangle,
  },
  {
    kind: "link",
    title: "Targets",
    href: "/dashboard/targets",
    icon: Target,
  },
  {
    kind: "link",
    title: "Histórico",
    href: "/dashboard/history",
    icon: History,
  },
  {
    kind: "link",
    title: "Usuários",
    href: "/dashboard/usuarios",
    icon: UserRoundCog,
  },
  {
    kind: "group",
    title: "SharkScope",
    icon: SharkIcon,
    items: [
      {
        title: "Alertas",
        href: "/dashboard/sharkscope/alerts",
        icon: BellRing,
      },
      {
        title: "Analytics",
        href: "/dashboard/sharkscope/analytics",
        icon: LineChart,
      },
      {
        title: "Scouting",
        href: "/dashboard/sharkscope/scouting",
        icon: Binoculars,
      },
    ],
  },
];

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
  "/dashboard/minha-grade": "",
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

export const canCreate = (session: { role: UserRole }) => STAFF_WRITE_ROLES.includes(session.role);
export const canEditPlayers = (session: { role: UserRole }) => STAFF_WRITE_ROLES.includes(session.role);

export const USUARIOS_MANAGE_ROLES = [UserRole.ADMIN, UserRole.MANAGER] as const;

export const GRADE_TYPE_LABEL: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
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

export const LIMIT_ACTION_LABEL: Record<
  "UPGRADE" | "MAINTAIN" | "DOWNGRADE",
  { label: string; color: string }
> = {
  UPGRADE: { label: "Subida", color: "text-emerald-600" },
  MAINTAIN: { label: "Manutenção", color: "text-muted-foreground" },
  DOWNGRADE: { label: "Descida", color: "text-red-600" },
};

export const NONE_LIMIT = "__none__";

export const STALE_TIME = 30_000;
