import type { Metadata } from "next";

export const NOTIFICATIONS_LS_FILTER = "gestao-grades:notifications:filter";
export const NOTIFICATIONS_LS_PAGE = "gestao-grades:notifications:page";

export const notificationsPageMetadata = {
  title: "Notificações",
  description: "Visualize suas notificações e marque como lidas.",
} satisfies Metadata;
