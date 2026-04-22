import { BellRing, FileText, GitBranch, type LucideIcon, Users } from "lucide-react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils/cn";
import type { GovernanceStaffOption } from "@/lib/data/team/governance-page";

export const DRI_STAFF_GROUP_ORDER: UserRole[] = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.COACH,
  UserRole.VIEWER,
];

/** Rótulos para grupos no select de responsável (matriz DRI). */
export const DRI_STAFF_GROUP_LABEL: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administradores",
  [UserRole.MANAGER]: "Gestores",
  [UserRole.COACH]: "Coaches",
  [UserRole.VIEWER]: "Leitores e outros",
  [UserRole.PLAYER]: "Jogadores",
};

export function groupDriStaffByRole(
  list: readonly GovernanceStaffOption[],
): { role: UserRole; members: GovernanceStaffOption[] }[] {
  const map = new Map<UserRole, GovernanceStaffOption[]>();
  for (const r of DRI_STAFF_GROUP_ORDER) {
    map.set(r, []);
  }
  for (const m of list) {
    if (m.role === UserRole.PLAYER) continue;
    if (!map.has(m.role)) map.set(m.role, []);
    map.get(m.role)!.push(m);
  }
  return DRI_STAFF_GROUP_ORDER.map((role) => ({
    role,
    members: (map.get(role) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "pt", { sensitivity: "base" }),
    ),
  })).filter((g) => g.members.length > 0);
}

export const GOVERNANCE_TABS = [
  { value: "matriz-dri", icon: Users, label: "Matriz DRI" },
  { value: "fluxo", icon: GitBranch, label: "Fluxo de Decisão" },
  { value: "historico", icon: FileText, label: "Histórico de Decisões" },
  { value: "regras-alerta", icon: BellRing, label: "Regras de Alerta" },
] as const;

export type GovernancePageTab = (typeof GOVERNANCE_TABS)[number]["value"];

/** Badges por área (governança / decisões). */
export const GOVERNANCE_AREA_COLORS: Record<string, string> = {
  Técnica: "bg-blue-50 text-blue-600 border-blue-100",
  Mental: "bg-purple-50 text-purple-600 border-purple-100",
  Financeiro: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Financeira: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Grades: "bg-orange-50 text-orange-600 border-orange-100",
  Cultura: "bg-pink-50 text-pink-600 border-pink-100",
  Geral: "bg-slate-50 text-slate-600 border-slate-100",
  Operação: "bg-cyan-50 text-cyan-600 border-cyan-100",
};

export const governanceAreaBadgeCls = (area: string) =>
  cn(
    "rounded-full border px-3 py-1 text-sm font-medium",
    GOVERNANCE_AREA_COLORS[area] ?? "bg-muted text-muted-foreground border-border",
  );

/** Chip compacto para células de tabela (área) — evita o padding grande dos badges de card. */
export function governanceAreaTableChipCls(area: string) {
  return cn(
    "inline-flex max-w-full items-center justify-center gap-1 rounded-md border leading-none",
    "px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs",
    "[&_svg]:size-3 shrink-0",
    GOVERNANCE_AREA_COLORS[area] ?? "bg-muted text-muted-foreground border-border",
  );
}

export const GOVERNANCE_STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-600",
  IMPLEMENTED: "bg-sky-50 text-sky-800",
  /** Legado */
  ARCHIVED: "bg-slate-100 text-slate-600",
  Aprovado: "bg-emerald-50 text-emerald-600",
  Implementado: "bg-blue-50 text-blue-600",
};

export const GOVERNANCE_DECISION_FILTERS = [
  "Todas",
  "Técnica",
  "Mental",
  "Financeira",
  "Grades",
  "Cultura",
] as const;

/** Valores de `area` na matriz DRI (único no banco). */
export const GOVERNANCE_DRI_AREA_OPTIONS = [
  "Técnica",
  "Mental",
  "Financeira",
  "Grades",
  "Cultura",
  "Operação",
  "Geral",
] as const;

export const GOVERNANCE_FLOW_CARDS = [
  {
    bg: "bg-emerald-50/50 border-emerald-100",
    icon: "✓",
    iconBg: "bg-emerald-100",
    titleColor: "text-emerald-700",
    title: "Coach pode decidir",
    items: [
      "Ajustes de grade ±20% do ABI",
      "Feedback e planos de ação técnicos",
      "Reagendamento de rituais (com aviso)",
      "Mudanças na seleção de torneios",
    ],
    itemColor: "text-emerald-800/80",
  },
  {
    bg: "bg-orange-50/50 border-orange-100",
    icon: "⚠",
    iconBg: "bg-orange-100",
    titleColor: "text-orange-700",
    title: "Requer Head Coach",
    items: [
      "Mudança de ABI >20% e ≤30%",
      "Planos de recuperação formais",
      "Realocação de jogador entre coaches",
      "Decisões sobre metas trimestrais",
    ],
    itemColor: "text-orange-800/80",
  },
  {
    bg: "bg-red-50/50 border-red-100",
    icon: "⛔",
    iconBg: "bg-red-100",
    titleColor: "text-red-700",
    title: "Requer Gestor",
    items: [
      "Mudança de ABI >30%",
      "Suspensão de jogador",
      "Adiantamentos >$2000",
      "Alteração de regras do time",
    ],
    itemColor: "text-red-800/80",
  },
  {
    bg: "bg-blue-50/50 border-blue-100",
    icon: "💰",
    iconBg: "bg-blue-100",
    titleColor: "text-blue-700",
    title: "Financeiro decide",
    items: [
      "Adiantamentos até $2000",
      "Cálculo e pagamento de bônus",
      "Despesas operacionais",
      "Relatórios de compliance",
    ],
    itemColor: "text-blue-800/80",
  },
] as const;
