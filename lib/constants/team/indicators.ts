import {
  Activity,
  BookOpen,
  LineChart,
  type LucideIcon,
  PieChart,
  Settings,
  ShieldAlert,
} from "lucide-react";

export const INDICATORS_FILTER_SELECTS: {
  defaultValue: string;
  width: string;
  placeholder: string;
  options: { value: string; label: string }[];
}[] = [
  {
    defaultValue: "semana-atual",
    width: "w-[160px]",
    placeholder: "Período",
    options: [
      { value: "semana-atual", label: "Semana Atual" },
      { value: "ultimas-4-semanas", label: "Últimas 4 Semanas" },
      { value: "serie", label: "Série (Range)" },
      { value: "personalizado", label: "Personalizado" },
    ],
  },
  {
    defaultValue: "todos-sites",
    width: "w-[150px]",
    placeholder: "Site de Poker",
    options: [
      { value: "todos-sites", label: "Todos os Sites" },
      { value: "gg-poker", label: "GG Poker" },
      { value: "poker-stars", label: "Poker Stars" },
      { value: "888-poker", label: "888 Poker" },
      { value: "party-poker", label: "Party Poker" },
      { value: "chico-poker", label: "Chico Poker" },
      { value: "ipoker", label: "iPoker" },
    ],
  },
  {
    defaultValue: "time-todo",
    width: "w-[170px]",
    placeholder: "Público",
    options: [
      { value: "time-todo", label: "Time Todo" },
      { value: "pool", label: "Pool" },
      { value: "por-coach", label: "Por Coach" },
      { value: "estanca-sangria", label: "Estanca Sangria" },
      { value: "jogadores-foco", label: "Jogadores em Foco" },
    ],
  },
  {
    defaultValue: "ambos",
    width: "w-[130px]",
    placeholder: "Tipo",
    options: [
      { value: "ambos", label: "Ambos" },
      { value: "resultado", label: "Resultado" },
      { value: "processo", label: "Processo" },
    ],
  },
];

export const INDICATORS_TABS: {
  value: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "visao-geral", label: "Visão Geral", icon: PieChart },
  { value: "performance", label: "Performance", icon: LineChart },
  { value: "risco", label: "Risco & Variância", icon: ShieldAlert },
  { value: "execucao", label: "Execução & Rituais", icon: Activity },
  { value: "qualidade", label: "Qualidade Técnica", icon: BookOpen },
  { value: "catalogo", label: "Catálogo (Admin)", icon: Settings },
];
