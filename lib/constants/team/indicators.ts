import { Activity, BookOpen, LineChart, PieChart, Settings, ShieldAlert } from "lucide-react";
import {
  INDICATOR_RESULT_OUTCOME,
  INDICATOR_RESULT_PROCESS,
  INDICATOR_RESULT_TYPE_LABEL,
} from "@/lib/constants/team/indicators-catalog-ui";

/** Multiseleção: só Resultado e Processo (valores persistidos no indicador). */
export const INDICATORS_VISAO_GERAL_TIPO_OPTIONS: { value: string; label: string }[] = [
  { value: INDICATOR_RESULT_OUTCOME, label: INDICATOR_RESULT_TYPE_LABEL[INDICATOR_RESULT_OUTCOME] ?? "Resultado" },
  { value: INDICATOR_RESULT_PROCESS, label: INDICATOR_RESULT_TYPE_LABEL[INDICATOR_RESULT_PROCESS] ?? "Processo" },
];

/** Botões compactos na toolbar da Visão Geral — fundo branco. */
export const INDICATORS_VG_FILTER_TRIGGER_CLASS =
  "!bg-white border-border shadow-sm dark:!bg-zinc-950/90";

export const INDICATORS_TABS = [
  { value: "visao-geral", label: "Visão Geral", icon: PieChart },
  { value: "performance", label: "Performance", icon: LineChart },
  { value: "risco", label: "Risco & Variância", icon: ShieldAlert },
  { value: "execucao", label: "Execução & Rituais", icon: Activity },
  { value: "qualidade", label: "Qualidade Técnica", icon: BookOpen },
  { value: "catalogo", label: "Catálogo (Admin)", icon: Settings },
] as const;

export type IndicatorsPageTab = (typeof INDICATORS_TABS)[number]["value"];
