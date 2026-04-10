import type { Metadata } from "next";

export const SHARKSCOPE_ANALYTICS_LS_PERIOD = "gestao-grades:sharkscope-analytics:period";
export const SHARKSCOPE_ANALYTICS_LS_TAB = "gestao-grades:sharkscope-analytics:tab";

export const sharkscopeAnalyticsPageMetadata = {
  title: "Analytics SharkScope",
  description: "Análise de performance do time por rede e período. Dados do cache.",
} satisfies Metadata;
