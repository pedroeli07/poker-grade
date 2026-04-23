/**
 * Dados de exemplo para as abas de Indicadores (origem: cl-admin / protótipo).
 * Substituir por consultas reais (SharkScope, tarefas, etc.) quando integrado.
 */
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Users,
  Video,
} from "lucide-react";

export const INDICATORS_CHART_WEEKLY_ROI = [
  { name: "S1", roi: 2.1 },
  { name: "S2", roi: 3.4 },
  { name: "S3", roi: 1.8 },
  { name: "S4", roi: 4.2 },
  { name: "S5", roi: 2.9 },
  { name: "S6", roi: 3.1 },
  { name: "S7", roi: 2.4 },
  { name: "S8", roi: 3.6 },
] as const;

export const INDICATORS_PERFORMANCE_TABLE_HEADS = [
  "Jogador",
  "ABI",
  "ROI",
  "Torneios",
  "Lucro",
  "Tend.",
] as const;

export const INDICATORS_PERFORMANCE_TOP_PLAYERS: {
  name: string;
  roi: string;
  tournaments: number;
  amos?: boolean;
}[] = [
  { name: "Ana B.", roi: "+6.2%", tournaments: 142 },
  { name: "Bruno C.", roi: "+5.1%", tournaments: 128, amos: true },
  { name: "Carlos L.", roi: "+4.8%", tournaments: 156 },
  { name: "Diana M.", roi: "+4.2%", tournaments: 98 },
  { name: "Edu P.", roi: "+3.9%", tournaments: 201 },
  { name: "Fernanda R.", roi: "+3.4%", tournaments: 87, amos: true },
  { name: "Gustavo S.", roi: "+3.1%", tournaments: 134 },
  { name: "Helena T.", roi: "+2.8%", tournaments: 112 },
  { name: "Igor V.", roi: "+2.5%", tournaments: 95 },
  { name: "Julia W.", roi: "+2.2%", tournaments: 76 },
];

export const INDICATORS_PERFORMANCE_BOTTOM_PLAYERS: {
  name: string;
  roi: string;
  tournaments: number;
  amos?: boolean;
}[] = [
  { name: "Kleber X.", roi: "-2.1%", tournaments: 45, amos: true },
  { name: "Lara Y.", roi: "-1.8%", tournaments: 88 },
  { name: "Marcos Z.", roi: "-1.4%", tournaments: 102 },
  { name: "Nina A.", roi: "-1.1%", tournaments: 60 },
  { name: "Otávio B.", roi: "-0.9%", tournaments: 134 },
  { name: "Paula C.", roi: "-0.8%", tournaments: 55 },
  { name: "Ricardo D.", roi: "-0.6%", tournaments: 201 },
  { name: "Sara E.", roi: "-0.4%", tournaments: 92 },
  { name: "Tiago F.", roi: "-0.3%", tournaments: 77 },
  { name: "Ursula G.", roi: "-0.1%", tournaments: 38, amos: true },
];

export const INDICATORS_PERFORMANCE_FULL_TABLE: {
  name: string;
  abi: string;
  roi: string;
  tournaments: number;
  profit: string;
  trend: "up" | "down";
}[] = [
  { name: "Ana B.", abi: "$38", roi: "+5.1%", tournaments: 142, profit: "$1.240", trend: "up" },
  { name: "Bruno C.", abi: "$42", roi: "-0.4%", tournaments: 128, profit: "$-120", trend: "down" },
  { name: "Carlos L.", abi: "$35", roi: "+2.2%", tournaments: 156, profit: "$890", trend: "up" },
  { name: "Diana M.", abi: "$29", roi: "+1.1%", tournaments: 98, profit: "$310", trend: "up" },
  { name: "Edu P.", abi: "$55", roi: "+3.4%", tournaments: 201, profit: "$2.100", trend: "up" },
  { name: "Fernanda R.", abi: "$22", roi: "-1.2%", tournaments: 87, profit: "$-95", trend: "down" },
];

// —— Risco & variância ——

export const INDICATORS_RISCO_TOP_CARDS: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  cardClass: string;
  iconWrapClass: string;
  showTrend: boolean;
}[] = [
  {
    label: "Jogadores em alerta",
    value: "12",
    sub: "vs. semana passada",
    icon: AlertTriangle,
    cardClass: "border-amber-200/50 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/25",
    iconWrapClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    showTrend: true,
  },
  {
    label: "Exposição estimada (makeup)",
    value: "$48k",
    icon: DollarSign,
    cardClass: "border-border/60 bg-card",
    iconWrapClass: "bg-primary/10 text-primary",
    showTrend: false,
  },
  {
    label: "Jogadores em 1:1 (30d)",
    value: "7",
    icon: Users,
    cardClass: "border-border/60 bg-card",
    iconWrapClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    showTrend: false,
  },
  {
    label: "Metas de variância OK",
    value: "64%",
    sub: "time dentro do trilho",
    icon: Target,
    cardClass: "border-emerald-200/50 bg-emerald-50/35 dark:border-emerald-900/40 dark:bg-emerald-950/20",
    iconWrapClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    showTrend: false,
  },
];

export const INDICATORS_SEVERITY_BADGE: Record<string, string> = {
  Alto: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800",
  Médio: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200",
  Baixo: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200",
};

export const INDICATORS_INCREASING_MAKEUP: { name: string; makeup: string; severity: string }[] = [
  { name: "Player A", makeup: "$3.2k", severity: "Médio" },
  { name: "Player B", makeup: "$1.1k", severity: "Baixo" },
  { name: "Player C", makeup: "$5.8k", severity: "Alto" },
  { name: "Player D", makeup: "$0.4k", severity: "Baixo" },
];

export const INDICATORS_ESTANCA_SANGRIA: {
  name: string;
  severity: string;
  makeup: string;
  roi: string;
  abi: string;
}[] = [
  { name: "Player X", severity: "Alto", makeup: "$9.1k", roi: "-4.2%", abi: "$41" },
  { name: "Player Y", severity: "Médio", makeup: "$4.3k", roi: "-1.1%", abi: "$28" },
];

export const INDICATORS_NEGATIVE_ROI_STREAK: { name: string; roi: string; weeks: string }[] = [
  { name: "João M.", roi: "-2.0%", weeks: "5" },
  { name: "Paula S.", roi: "-0.8%", weeks: "3" },
  { name: "Rui T.", roi: "-1.4%", weeks: "4" },
  { name: "Sofia V.", roi: "-0.3%", weeks: "6" },
];

// —— Execução & rituais ——

export const INDICATORS_EXEC_SUMMARY_METRICS: {
  title: string;
  value: string;
  description: string;
  progress: number;
  icon: LucideIcon;
  iconColor: string;
}[] = [
  {
    title: "Rituais fechados (semana)",
    value: "82%",
    description: "WBR + check-ins",
    progress: 82,
    icon: CheckCircle2,
    iconColor: "text-sky-600",
  },
  {
    title: "Tarefas concluídas",
    value: "54 / 70",
    description: "no prazo (rolling 2 sem.)",
    progress: 77,
    icon: Activity,
    iconColor: "text-primary",
  },
  {
    title: "1:1 realizados",
    value: "18",
    description: "agendados no mês",
    progress: 60,
    icon: Users,
    iconColor: "text-violet-600",
  },
  {
    title: "Reportes atrasados",
    value: "6",
    description: "abaixo de 80% = alerta",
    progress: 40,
    icon: Clock,
    iconColor: "text-amber-600",
  },
];

export const INDICATORS_TASK_SUMMARY: {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  cardClass: string;
}[] = [
  { label: "Abertas", value: "24", icon: Activity, colorClass: "text-amber-600", cardClass: "border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/20" },
  { label: "Em progresso", value: "31", icon: Clock, colorClass: "text-sky-600", cardClass: "border-sky-200/50 bg-sky-50/30 dark:bg-sky-950/20" },
  { label: "Concluídas (30d)", value: "112", icon: CheckCircle2, colorClass: "text-emerald-600", cardClass: "border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/20" },
];

export const INDICATORS_TOP_EXECUTORS: { name: string; progress: number }[] = [
  { name: "Carlos L.", progress: 96 },
  { name: "Ana B.", progress: 91 },
  { name: "Diana M.", progress: 88 },
  { name: "Edu P.", progress: 85 },
  { name: "Bruno C.", progress: 79 },
];

export const INDICATORS_DELAYED_ITEMS: { name: string; task: string; delayed: string }[] = [
  { name: "Fernanda R.", task: "Revisar range PKO", delayed: "5d" },
  { name: "Gustavo S.", task: "Atualizar plano de estudo", delayed: "3d" },
  { name: "Helena T.", task: "Enviar sample Week WBR", delayed: "2d" },
];

// —— Qualidade técnica ——

export const INDICATORS_STUDY_CHART = [
  { name: "S1", estudo: 3.2, review: 1.1 },
  { name: "S2", estudo: 4.0, review: 1.4 },
  { name: "S3", estudo: 2.8, review: 0.9 },
  { name: "S4", estudo: 4.5, review: 1.8 },
  { name: "S5", estudo: 3.5, review: 1.2 },
  { name: "S6", estudo: 3.9, review: 1.3 },
  { name: "S7", estudo: 2.2, review: 0.7 },
  { name: "S8", estudo: 4.1, review: 1.5 },
] as const;

export const INDICATORS_QT_BARS: { key: "estudo" | "review"; name: string; fill: string }[] = [
  { key: "estudo", name: "Hrs estudo", fill: "hsl(var(--primary))" },
  { key: "review", name: "Reviews", fill: "hsl(199 89% 48%)" },
];

export const INDICATORS_QT_KPI_CARDS: {
  title: string;
  value: string;
  progress: number;
  meta: string;
  trend: string;
  icon: LucideIcon;
}[] = [
  { title: "Média estudo / sem", value: "3.6h", progress: 72, meta: "5h", trend: "-5%", icon: BookOpen },
  { title: "Spots comentados (mês)", value: "28", progress: 56, meta: "50", trend: "-8%", icon: Video },
  { title: "Sessões de review 1:1", value: "14", progress: 70, meta: "20", trend: "-3%", icon: BookOpen },
];

export const INDICATORS_PLAYER_CONSUMPTION: {
  name: string;
  reviews: string;
  spots: string;
  study: string;
  classes: string;
}[] = [
  { name: "Ana B.", reviews: "12", spots: "34", study: "4.2h", classes: "1:1" },
  { name: "Bruno C.", reviews: "6", spots: "18", study: "2.1h", classes: "Grupo" },
  { name: "Carlos L.", reviews: "9", spots: "22", study: "3.0h", classes: "1:1" },
  { name: "Diana M.", reviews: "4", spots: "11", study: "1.4h", classes: "Grupo" },
];
