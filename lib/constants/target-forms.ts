import { StrengthLevel } from "@/lib/auth/password-policy";

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
