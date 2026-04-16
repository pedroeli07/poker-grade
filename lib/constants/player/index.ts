import { Prisma } from "@prisma/client";
import type { PlayerStatus } from "@prisma/client";
import type { PlayersTableSortKey } from "@/lib/types/player";

/** Prefixos monetários colados ao valor (ex.: `$12`). */
export const PLAYER_ABI_ALVO_CURRENCY_PREFIXES = new Set(["$", "€", "¥"]);

export const PLAYER_ABI_ALVO_MAX_NUMERIC = 1_000_000;

export const PLAYER_ABI_ALVO_UNIT_MAX_LEN = 30;

/** Heurística para detetar meta “ABI alvo” pelo nome. */
export const PLAYER_ABI_ALVO_TARGET_NAME_REGEX = /\babi\b/i;

export const DELETE_PLAYER_ERROR_MESSAGES: Record<string, string> = {
    FORBIDDEN: "Sem permissão para excluir este jogador.",
    NOT_FOUND: "Jogador não encontrado.",
  };
  
  export const DELETE_PLAYER_GENERIC_ERROR = "Não foi possível excluir. Tente novamente.";

export const playerProfileInclude = {
  coach: true,
  gradeAssignments: {
    where: { isActive: true },
    include: {
      gradeProfile: {
        include: { rules: true, _count: { select: { rules: true } } },
      },
    },
    orderBy: { assignedAt: "desc" as const },
  },
  targets: {
    where: { isActive: true },
    orderBy: { createdAt: "desc" as const },
  },
  limitChanges: {
    orderBy: { createdAt: "desc" as const },
    take: 5,
  },
  nicks: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      nick: true,
      network: true,
      isActive: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      playedTournaments: true,
      reviewItems: true,
    },
  },
} satisfies Prisma.PlayerInclude;

/** Include para página "Minha grade" (jogador) — mais leve que o perfil completo. */
export const minhaGradePlayerInclude = {
  coach: { select: { name: true } },
  gradeAssignments: {
    where: { isActive: true },
    include: {
      gradeProfile: {
        include: {
          rules: true,
          _count: { select: { rules: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" as const },
  },
  targets: {
    where: { isActive: true },
    orderBy: { category: "asc" as const },
  },
  limitChanges: {
    orderBy: { createdAt: "desc" as const },
    take: 3,
  },
} satisfies Prisma.PlayerInclude;

/**
 * Colunas do resumo de filtros (chave em `PlayersTableColumnFilters` / label PT).
 */
export const PLAYERS_TABLE_FILTER_SUMMARY_COLUMNS = [
    ["name", "Nome"],
    ["nicks", "Nicks"],
    ["playerGroup", "Grupo Shark"],
    ["coach", "Coach"],
    ["grade", "Grade"],
    ["abi", "ABI"],
    ["status", "Status"],
  ] as const;
  
  /** Filtros numéricos: chave em `numFilters`, label, sufixo. */
  export const PLAYERS_TABLE_FILTER_NUMERIC_COLUMNS = [
    ["roiTenDay", "ROI (10d)", "%"],
    ["fpTenDay", "FP (10d)", "%"],
    ["ftTenDay", "FT (10d)", "%"],
  ] as const;
  
  /** Rótulos por defeito em `toTableRows` e células derivadas. */
export const PLAYERS_TABLE_ROW_LABELS = {
    noCoach: "Sem Coach",
    noGrade: "Não atribuída",
    abiEmpty: "—",
  } as const;
  
  export const PLAYER_AVATAR_COLOR_CLASS = "bg-primary/15 text-primary";
  
/** Labels da ordenação (resumo no topo da tabela). */
export const PLAYERS_TABLE_SORT_LABELS: Record<PlayersTableSortKey, string> = {
  name: "Nome",
  email: "E-mail",
  nicks: "Nicks",
  playerGroup: "Grupo Shark",
  coachLabel: "Coach",
  gradeLabel: "Grade",
  abiNumericValue: "ABI",
  roiTenDay: "ROI (10d)",
  fpTenDay: "FP (10d)",
  ftTenDay: "FT (10d)",
  status: "Status",
};

/** Limiar FP 10d acima do qual o badge fica “atenção” (âmbar). */
export const PLAYERS_TABLE_FP_ATTENTION_THRESHOLD = 8;

/** Limiar FT 10d abaixo do qual o badge fica vermelho. */
export const PLAYERS_TABLE_FT_LOW_THRESHOLD = 8;

/** Faixas de ROI (%) para cor do badge na tabela (abaixo de `softNegative` e ≥0: cores distintas). */
export const PLAYERS_TABLE_ROI_BADGE_THRESHOLDS = {
  strongNegative: -40,
  softNegative: -20,
} as const;

export const PLAYER_TABLE_STATUS_LABEL: Record<PlayerStatus, string> = {
  ACTIVE: "Ativo",
  SUSPENDED: "Suspenso",
  INACTIVE: "Inativo",
};

export const PLAYER_TABLE_STATUS_ACTIVE_BADGE_CLASS =
  "shadow-lg shadow-emerald-500 glow-success h-8 shrink-0 border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[13px] leading-none text-emerald-500 hover:bg-emerald-500/20";

export const PLAYER_TABLE_STATUS_SUSPENDED_BADGE_CLASS =
  "h-8 shrink-0 border-amber-500/25 bg-amber-500/10 px-1.5 py-0 text-[13px] leading-none text-amber-700";

export const PLAYER_TABLE_STATUS_INACTIVE_BADGE_CLASS =
  "h-6 shrink-0 px-1.5 py-0 text-[13px] leading-none";
