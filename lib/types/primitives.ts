import type { ReactNode } from "react";
import { POKER_NETWORKS } from "@/lib/constants";
import { createLogger } from "@/lib/logger";

export type ReadKey = "payload" | "rows" | "data";
export type QueryLogger = ReturnType<typeof createLogger>;
export type RateLimitResult = { ok: boolean; retryAfterSec: number };
export type AppProvidersProps = { children: ReactNode };
export type LogLevel = "debug" | "info" | "success" | "warn" | "error";
export type UserLimiter = (userId: string) => Promise<RateLimitResult>;

// ─── Base Structural Types ──────────────────────────────────────────────────

export type WithId = { id: string };

export type Timestamped = {
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
};

export type BaseEntity = WithId & Timestamped;

export type WithIdAndStatus<S> = WithId & { status: S };

// ─── Result Types ────────────────────────────────────────────────────────────

export type Err = { ok: false; error: string };
export type Ok = { ok: true };
export type Result<T = Record<string, never>> = ({ ok: true } & T) | Err;

// ─── Pagination Types ────────────────────────────────────────────────────────

export type PaginatedPayload<T> = {
  items: T[];
  total: number;
  unreadCount?: number; // Optional as not all lists have unread counts
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PaginatedResult<T> = Result<PaginatedPayload<T>>;

// ─── UI / Table Types ─────────────────────────────────────────────────────────

export type FilterMap<K extends string> = Record<K, Set<string> | null>;
export type SelectOption = { value: string; label: string };
export type ColumnOptions<K extends string> = Record<K, SelectOption[]>;

/** Base props for controlled modal dialogs */
export type ModalProps = { open: boolean; onOpenChange: (open: boolean) => void };

// ─── Enums & Domain Constants ────────────────────────────────────────────────

export enum ErrorTypes {
  NOT_FOUND = "Não encontrado",
  FORBIDDEN = "Proibido",
  INVALID_DATA = "Dados inválidos",
  INVALID_JSON = "JSON inválido",
  INTERNAL_ERROR = "Erro interno",
  OPERATION_FAILED = "Operação falhou",
  GRADE_NOT_FOUND = "Grade não encontrada",
  COACH_NOT_FOUND = "Coach não encontrado",
  UNAUTHORIZED = "Não autorizado",
  EMAIL_ALREADY_EXISTS = "E-mail já cadastrado",
  CRON_SECRET_NOT_CONFIGURED = "CRON_SECRET não configurado",
  NOT_CONFIGURED = "Não configurado",
  SHARK_SYNC_UNKNOWN_ERROR = "Erro desconhecido ao sincronizar",
}

export enum NotificationFilterType {
  ALL = "all",
  UNREAD = "unread",
  READ = "read",
}

export enum TargetLimit {
  UPGRADE = "UPGRADE",
  MAINTAIN = "MAINTAIN",
  DOWNGRADE = "DOWNGRADE",
}

export enum TargetPageStatus {
  ON_TRACK = "ON_TRACK",
  ATTENTION = "ATTENTION",
  OFF_TRACK = "OFF_TRACK",
}

// ─── Reference Types ─────────────────────────────────────────────────────────

export type EntityRef = WithId & { name: string };
export type PlayerRef = EntityRef & { nickname: string | null };
export type CoachOpt = EntityRef & { role: string };
export type GradeOpt = EntityRef;

export type PokerNetworkKey = keyof typeof POKER_NETWORKS;
export type PokerNetworkOption = SelectOption;

// ─── Utility Types ───────────────────────────────────────────────────────────

export type ScopedLogger = {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  success: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, cause?: Error, meta?: Record<string, unknown>) => void;
  table: (rows: Record<string, unknown>[]) => void;
  sep: (label?: string) => void;
};
