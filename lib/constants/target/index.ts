import { type ComponentType } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { StrengthLevel } from "@/lib/types/auth";
import type { ColKey } from "@/lib/types/columnKeys";
// ─── target-status ───────────────────────────────────────────────────────────

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

// ─── target-list-ui ──────────────────────────────────────────────────────────

/** Superfície do card de resumo (borda + fundo). */
export const TARGET_SUMMARY_CARD_SURFACE: Record<TargetStatusKey, string> = {
  ON_TRACK: "border border-emerald-500/20 bg-emerald-500/5",
  ATTENTION: "border border-amber-500/20 bg-amber-500/5",
  OFF_TRACK: "border border-red-500/20 bg-red-500/5",
};

/** Cor da track da barra de progresso por estado. */
export const TARGET_PROGRESS_TRACK_COLOR_CLASS: Record<TargetStatusKey, string> = {
  ON_TRACK: "bg-emerald-500",
  ATTENTION: "bg-amber-500",
  OFF_TRACK: "bg-red-500",
};

export const TARGET_STATUS_SUMMARY_ORDER: readonly TargetStatusKey[] = [
  "ON_TRACK",
  "ATTENTION",
  "OFF_TRACK",
];

export const TARGET_DISPLAY_PLACEHOLDER = "—";

// ─── targets-page ────────────────────────────────────────────────────────────

/** Chave localStorage do modo de visualização (cards / tabela). */
export { TARGETS_LS_VIEW } from "@/lib/constants/metadata";

/** Colunas dos filtros compactos na visão em cards. */
export const TARGETS_CARD_FILTER_COLUMNS: [string, ColKey, string][] = [
  ["t-name", "name", "Meta"],
  ["t-cat", "category", "Categoria"],
  ["t-type", "targetType", "Tipo"],
  ["t-player", "player", "Jogador"],
  ["t-status", "status", "Status"],
];

/** Cabeçalho da tabela (colunas com filtro/sort): [largura Tailwind, id DOM, chave de filtro, rótulo]. */
export const TARGETS_TABLE_HEAD_COLUMNS: [string, string, ColKey, string][] = [
  ["w-[13%]", "t-player-t", "player", "Jogador"],
  ["w-[18%]", "t-name-t", "name", "Meta"],
  ["w-[12%]", "t-cat-t", "category", "Categoria"],
  ["w-[15%]", "t-progr-t", "targetType", "Progresso"],
  ["w-[11%]", "t-status-t", "status", "Status"],
  ["w-[10%]", "t-limit-t", "limitAction", "Gatilho"],
];

/** Colunas estáticas (sem filtro/sort): [largura, id DOM, rótulo]. Renderizadas após as filtráveis. */
export const TARGETS_TABLE_STATIC_COLUMNS: [string, string, string][] = [
  ["w-[13%]", "t-notes-t", "Nota do coach"],
  ["w-[6%]", "t-upd-t", "Atualizado"],
  ["w-[2%]", "t-act-t", ""],
];

// ─── target-forms ────────────────────────────────────────────────────────────

const toOptions = <V extends string>(rows: readonly (readonly [V, string])[]) =>
  rows.map(([value, label]) => ({ value, label }));

export const CATEGORIES = toOptions([
  ["performance", "Performance (ROI, ABI, ITM)"],
  ["volume", "Volume (sessões, torneios)"],
  ["discipline", "Disciplina (grade, estudo)"],
  ["financial", "Financeiro (lucro, bankroll)"],
  ["qualitative", "Qualitativo (comportamento)"],
] as const);

export const LIMIT_ACTIONS = toOptions([
  ["none", "Sem ação associada"],
  ["UPGRADE", "Subida de limite"],
  ["MAINTAIN", "Manutenção"],
  ["DOWNGRADE", "Descida de limite"],
] as const);

export const HOVER_PREVIEW_MIN_CHARS = 44;

export const filterListScrollClass =
  "max-h-[min(280px,50vh)] overflow-y-auto overflow-x-hidden p-2 space-y-1 pr-1.5 " +
  "[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)] " +
  "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:min-h-8 " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35 " +
  "[&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/50 " +
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/70";

export const LEVEL_LABEL: Record<StrengthLevel, string> = {
  empty: "Digite uma senha",
  weak: "Fraca",
  fair: "Média",
  good: "Boa",
  strong: "Forte",
};

// ─── new-target-modal ─────────────────────────────────────────────────────────

/** Valores iniciais do formulário ao abrir / após fechar o modal "Novo Target". */
export const NEW_TARGET_MODAL_DEFAULT_TYPE = "NUMERIC" as const;
export const NEW_TARGET_MODAL_DEFAULT_CATEGORY = "performance" as const;
export const NEW_TARGET_MODAL_DEFAULT_LIMIT_ACTION = "none" as const;
