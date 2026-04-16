import { NotificationType } from "@prisma/client";
import {
  AlertTriangle,
  Check,
  Grid3X3,
  Info,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import z from "zod";
import type { NotificationStyle } from "@/lib/types/notification";

// ─── notifications-config ──────────────────────────────────────────────────────

const TYPE_ROWS = [
  [NotificationType.GRADE_ASSIGNED, Grid3X3, "text-primary", "bg-primary/10", "Grade"],
  [NotificationType.GRADE_CREATED, Grid3X3, "text-blue-500", "bg-blue-500/10", "Grade"],
  [NotificationType.IMPORT_DONE, Upload, "text-emerald-500", "bg-emerald-500/10", "Importação"],
  [NotificationType.EXTRA_PLAY, AlertTriangle, "text-amber-500", "bg-amber-500/10", "Extra Play"],
  [NotificationType.REVIEW_DECISION, Check, "text-violet-500", "bg-violet-500/10", "Revisão"],
  [NotificationType.PLAYER_CREATED, Users, "text-blue-500", "bg-blue-500/10", "Jogador"],
  [NotificationType.LIMIT_CHANGED, TrendingUp, "text-emerald-500", "bg-emerald-500/10", "Limite"],
  [NotificationType.SYSTEM, Info, "text-muted-foreground", "bg-muted", "Sistema"],
] as const satisfies readonly (readonly [NotificationType, NotificationStyle["icon"], string, string, string])[];

export const TYPE_CONFIG = Object.fromEntries(
  TYPE_ROWS.map(([type, icon, color, bg, label]) => [type, { icon, color, bg, label }]),
) as Record<NotificationType, NotificationStyle>;

export const TYPE_LABELS = Object.fromEntries(TYPE_ROWS.map(([type, , , , label]) => [type, label])) as Record<
  NotificationType,
  string
>;

export const NOTIFICATION_PAGE_SIZE = 10;
export const notificationIdSchema = z.cuid();

const DATA_TYPE_ROWS = [
  ["stats_10d", "", "?filter=Date:10D", 24],
  ["stats_30d", "", "?filter=Date:30D", 24],
  ["stats_90d", "", "?filter=Date:90D", 24],
  ["summary", "", "", 12],
  ["insights", "/insights", "", 24],
] as const;

export const DATA_TYPE_CONFIG: Record<
  string,
  { pathSuffix: string; defaultQuery: string; ttlHours: number }
> = Object.fromEntries(
  DATA_TYPE_ROWS.map(([key, pathSuffix, defaultQuery, ttlHours]) => [
    key,
    { pathSuffix, defaultQuery, ttlHours },
  ]),
);

// ─── notifications-page (LS keys) ─────────────────────────────────────────────

/** Barrel: chaves localStorage da página de notificações. */
export { NOTIFICATIONS_LS_FILTER, NOTIFICATIONS_LS_PAGE } from "@/lib/constants/metadata";
