import { cn } from "../utils";

const pillBase =
  "inline-flex items-center justify-center tabular-nums px-2 py-1 rounded-md border text-xs font-bold min-w-[68px]";

export const pillClass = pillBase;
export const roiClass = `${pillBase} flex-row gap-1`;
export const roiIconClass = "h-3.5 w-3.5 shrink-0";

const playerTableBadgeBase =
  "inline-flex h-8 max-w-full items-center border-primary/20 bg-primary/5 px-1.5 py-0 shadow-blue-500/50 hover:bg-blue-500/20 hover:shadow-blue-500 shadow-lg hover:shadow-lg leading-none text-primary";

export const badgeClassName = `${playerTableBadgeBase} text-[11px]`;
export const playerTableBadgeClassName = `${playerTableBadgeBase} text-[14px]`;
/** Coach e grade: mesmo estilo do nome, texto um pouco menor. */
export const playerTableCoachGradeBadgeClassName = `${playerTableBadgeBase} text-[13px]`;

/** Coach sem atribuição / grade não atribuída — cinza, com mesma “energia” de sombra/hover que `playerTableBadgeClassName` (versão zinc em vez de azul). */
const playerTableBadgeEmptyBase =
  "inline-flex h-8 max-w-full items-center border-zinc-400/25 bg-zinc-500/5 px-1.5 py-0 leading-none text-zinc-600 shadow-zinc-500/50 hover:bg-zinc-500/20 hover:shadow-zinc-500 shadow-lg hover:shadow-lg dark:border-zinc-500/35 dark:bg-zinc-500/10 dark:text-zinc-400 dark:hover:bg-zinc-500/20";

export const playerTableBadgeEmptyClassName = `${playerTableBadgeEmptyBase} text-[14px]`;
export const playerTableCoachGradeBadgeEmptyClassName = `${playerTableBadgeEmptyBase} text-[13px]`;

/** Stat badges (ROI / FT / FP) with shadow and hover. */
const statBadgeTail = "shadow-lg hover:shadow-lg transition-all";
export const statBadgeRed = `bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/50 hover:bg-red-500/20 hover:shadow-red-500 ${statBadgeTail}`;
export const statBadgeAmber = `bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/50 hover:bg-amber-500/20 hover:shadow-amber-500 ${statBadgeTail}`;
export const statBadgeEmerald = `bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/50 hover:bg-emerald-500/20 hover:shadow-emerald-500 ${statBadgeTail}`;
export const statBadgeMuted = `bg-zinc-500/5 text-zinc-600 border-zinc-500/25 shadow-zinc-500/50 hover:bg-zinc-500/20 hover:shadow-zinc-500 ${statBadgeTail} dark:text-zinc-400`;

/** Pills de stats nas tabelas de analytics SharkScope (FP/FT, capacidade, lucro em badge). */
export const analyticsStatPillClass =
  "inline-flex flex-row items-center gap-1.5 tabular-nums px-2.5 py-1 rounded-md border text-xs font-bold";

/** Lucro em texto monoespaçado (célula simples, não badge). */
export const analyticsProfitMonoBase = "font-mono text-sm font-semibold";
export const analyticsProfitPositiveClass = "text-emerald-600";
export const analyticsProfitNegativeClass = "text-red-500";

export const gradesRulesPillClass = "bg-blue-500/12 text-blue-600 border-blue-500/25";

export const gradePlayersBaseClass = "border-primary/20 bg-primary/6 text-primary text-xs";
export const gradePlayersBadgeClass = (variant: "card" | "table") =>
  `${gradePlayersBaseClass} font-medium${variant === "card" ? " px-2 py-0.5" : " tabular-nums"}`;

/**
 * Larguras da tabela de jogadores (`table-fixed` em `players-table-client`).
 * O primeiro `<thead>` fixa as colunas — estes valores devem ser usados também nas `<td>`
 * para o layout bater certo (só mudar o corpo não altera a distribuição).
 * Soma ≈ 100%.
 */
export const playersTableCol = {
  name: "w-[9%] min-w-0",
  nicks: "w-[24%] min-w-0",
  grupoShark: "w-[12%] min-w-0",
  status: "w-[5%] min-w-0 px-1.5",
  coach: "w-[8%] min-w-0",
  /** Grade um pouco mais larga que antes (8%). */
  grade: "w-[10%] min-w-0",
  /** ABI + ROI + FP + FT mais estreitas. */
  abi: "w-[5%] min-w-0 px-0.5",
  roi: "w-[6%] min-w-0 px-0.5",
  fp: "w-[6%] min-w-0 px-0.5",
  ft: "w-[6%] min-w-0 px-0.5",
  actions: "w-[2%] min-w-0 px-1.5",
} as const;

/** Cabeçalho das três colunas de stats (ROI / FP / FT): alinhamento + tipografia. */
export const playersTableStatsHeadClass = `${playersTableCol.roi} align-middle text-center text-[13px] leading-tight`;

/** Barra superior: estado “ativo” (filtro ou ordenação). */
export const dataTableToolbarActiveClass =
  "rounded-xl border border-primary/40 bg-gradient-to-r from-primary/[0.12] via-primary/[0.07] to-transparent shadow-[inset_0_1px_0_0_rgba(59,130,246,0.15)]";
export const dataTableToolbarIdleClass = "text-muted-foreground";

/** Contorno da tabela quando há filtro/ordenação. */
export const dataTableShellActiveClass =
  "rounded-xl border-2 border-primary/40 bg-primary/[0.03] shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_16px_48px_-16px_rgba(37,99,235,0.18)]";
export const dataTableShellIdleClass = "border-y border-border";

/** Cabeçalho de tabela (ex.: jogadores / analytics). */
export const dataTableHeaderRowClass = "bg-blue-500/20 hover:bg-blue-500/20 transition-colors";
export const dataTableHeaderRowActiveRingClass = "bg-primary/20 ring-1 ring-inset ring-primary/15";

/** Shell do `AlertDialogContent` (padding zerado, cantos alinhados ao rodapé). */
export const destructiveAlertDialogContentClassName =
  "sm:max-w-[440px] border-border/80 bg-card/95 p-0 gap-0 overflow-hidden shadow-xl";
export const destructiveAlertFooterClassName =
  "!mx-0 !mb-0 border-t border-border/50 bg-gradient-to-b from-muted/25 to-destructive/[0.06] px-6 pt-5 pb-6 sm:justify-end gap-3 rounded-b-xl";
export const destructiveAlertCancelButtonClassName = "mt-0 min-w-[5.5rem] rounded-lg border-border/80";
export const destructiveAlertConfirmButtonClassName =
  "min-w-[5.5rem] rounded-lg bg-red-500/15 font-medium text-red-600 shadow-sm hover:bg-red-500/25 hover:text-red-600 focus-visible:ring-red-500/30";
export const destructiveAlertHeaderClassName = "space-y-2 px-6 pb-0 pt-2 text-left";
export const destructiveAlertTitleClassName = "text-xl font-semibold tracking-tight";
export const destructiveAlertDescriptionWrapClassName = "space-y-4 text-[15px] leading-relaxed text-muted-foreground";

/** Evita confundir placeholder com valor digitado. */
export const phSubtle = "placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/45";

export const STAT_CARD_CLS =
  "bg-[oklch(1_0_0/80%)] backdrop-blur-md border border-[oklch(0.9_0.01_240)] shadow-[0_4px_20px_-4px_oklch(0_0_0/4%)] transition-all duration-200 hover:border-[oklch(0.85_0.01_240)] hover:shadow-[0_8px_24px_-6px_oklch(0_0_0/6%)]";
export const TIMELINE_CARD_CLS = STAT_CARD_CLS;

/** Linhas de `<tbody>`: sem `backdrop-blur`/`transition-all` do card (evita “ghosting” ao dar refresh após mutação). */
export const userTableRowClassName = cn(
  "group border-b border-border/60 bg-card/80",
  "transition-colors duration-150 hover:bg-muted/35"
);

/** Conteúdo do hover em `FilterOptionRow` (pré-visualização de texto longo). */
export const FILTER_OPTION_ROW_HOVER_CARD_CONTENT_CLASS =
  "z-[100] w-[min(92vw,36rem)] max-h-[min(72vh,28rem)] overflow-y-auto overflow-x-hidden p-4 text-sm leading-relaxed bg-blue-500/10 backdrop-blur-md border border-blue-500/20 shadow-2xl shadow-blue-500/20 [scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--muted-foreground)_45%,transparent)_color-mix(in_oklab,var(--muted)_80%,transparent)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35";
