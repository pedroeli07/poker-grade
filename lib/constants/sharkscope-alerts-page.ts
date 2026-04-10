import type { Metadata } from "next";

export const SHARKSCOPE_ALERTS_LS_PAGE_SIZE = "gestao-grades:sharkscope-alerts:pageSize";
export const SHARKSCOPE_ALERTS_LS_PAGE = "gestao-grades:sharkscope-alerts:page";
export const SHARKSCOPE_ALERTS_LS_SELECTED = "gestao-grades:sharkscope-alerts:selectedIds";

export const SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 300] as const;
export const SHARKSCOPE_ALERTS_ALLOWED_PAGE_SIZE = new Set<number>(
  SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS
);

export const sharkscopeAlertsPageMetadata = {
  title: "Alertas SharkScope",
  description: "Alertas de performance do SharkScope para os jogadores do time.",
} satisfies Metadata;
