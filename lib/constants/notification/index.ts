import { NotificationType } from "@prisma/client";
import {
  AlertTriangle,
  Check,
  Grid3X3,
  History,
  Info,
  PencilLine,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserCog,
  Users,
} from "lucide-react";
import z from "zod";
import type { NotificationStyle } from "@/lib/types/notification";

// ─── notifications-config ──────────────────────────────────────────────────────

const BASE = {
  grade: ["text-primary", "bg-primary/10", "Grade"],
  import: ["text-emerald-500", "bg-emerald-500/10", "Importação"],
  extra: ["text-red-500", "bg-red-500/10", "Extra Play"],
  review: ["text-violet-500", "bg-violet-500/10", "Revisão"],
  player: ["text-blue-500", "bg-blue-500/10", "Jogador"],
  limit: ["text-violet-500", "bg-violet-500/10", "Limite"],
  target: ["text-fuchsia-500", "bg-fuchsia-500/10", "Meta"],
  user: ["text-sky-500", "bg-sky-500/10", "Usuário"],
  danger: ["text-red-500", "bg-red-500/10"],
  system: ["text-muted-foreground", "bg-muted", "Sistema"],
} as const;

const TYPE_ROWS = [
  [NotificationType.GRADE_ASSIGNED, Grid3X3, ...BASE.grade],
  [NotificationType.GRADE_CREATED, Grid3X3, "text-blue-500", "bg-blue-500/10", "Grade"],

  [NotificationType.IMPORT_DONE, Upload, ...BASE.import],
  [NotificationType.EXTRA_PLAY, AlertTriangle, ...BASE.extra],
  [NotificationType.REVIEW_DECISION, Check, ...BASE.review],

  [NotificationType.PLAYER_CREATED, Users, ...BASE.player],
  [NotificationType.PLAYER_UPDATED, PencilLine, ...BASE.player],
  [NotificationType.PLAYER_DELETED, Trash2, ...BASE.danger, "Jogador"],

  [NotificationType.LIMIT_CHANGED, TrendingUp, ...BASE.limit],

  [NotificationType.TARGET_CREATED, Target, ...BASE.target],
  [NotificationType.TARGET_UPDATED, PencilLine, ...BASE.target],
  [NotificationType.TARGET_DELETED, Trash2, ...BASE.danger, "Meta"],

  [NotificationType.USER_UPDATED, UserCog, ...BASE.user],
  [NotificationType.USER_DELETED, Trash2, ...BASE.danger, "Usuário"],

  [NotificationType.IMPORT_DELETED, Trash2, ...BASE.danger, "Importação"],
  [NotificationType.HISTORY_DELETED, History, ...BASE.danger, "Histórico"],

  [NotificationType.SYSTEM, Info, ...BASE.system],
] as const satisfies readonly (readonly [NotificationType, NotificationStyle["icon"], string, string, string])[];

export const TYPE_CONFIG = Object.fromEntries(
  TYPE_ROWS.map(([type, icon, color, bg, label]) => [type, { icon, color, bg, label }]),
) as Record<NotificationType, NotificationStyle>;

export const TYPE_LABELS = Object.fromEntries(TYPE_ROWS.map(([type, , , , label]) => [type, label])) as Record<
  NotificationType,
  string
>;

export const NOTIFICATION_PAGE_SIZE = 10;

/** Título genérico do toast de erro no painel de notificações. */
export const NOTIFICATION_SHEET_TOAST_ERROR_TITLE = "Erro";
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
export {
  NOTIFICATIONS_LS_FILTER,
  NOTIFICATIONS_LS_PAGE,
  NOTIFICATIONS_LS_PAGE_SIZE,
  NOTIFICATIONS_LS_VIEW_MODE,
} from "@/lib/constants/metadata";
