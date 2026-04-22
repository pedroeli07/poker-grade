import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { POKER_NETWORKS } from "@/lib/constants/poker-networks";
import { MODAL_DIALOG_SIZES } from "@/lib/constants/modals";
import { createLogger } from "@/lib/logger";
import { DialogContent } from "@/components/ui/dialog";

export type ReadKey = "payload" | "rows" | "data";
export type QueryLogger = ReturnType<typeof createLogger>;
export type RateLimitResult = { ok: boolean; retryAfterSec: number };
export type AppProvidersProps = { children: ReactNode };
export type LogLevel = "debug" | "info" | "success" | "warn" | "error";
export type UserLimiter = (userId: string) => Promise<RateLimitResult>;

export type WithId = { id: string };
export type Timestamped = {
  createdAt: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | Date | null;
};
export type BaseEntity = WithId & Timestamped;
export type WithIdAndStatus<S> = WithId & { status: S };

export type Err = { ok: false; error: string };
export type Ok = { ok: true };
export type Result<T = Record<string, never>> = ({ ok: true } & T) | Err;

/** Ordenação de tabelas — fonte única em `lib/table-sort.ts`. */
export type { SortDir, TableSortState } from "@/lib/table-sort";

/** Conta de torneios por scheduling (dashboard jogador, agregados SQL, etc.). */
export type PlayerTournamentSchedulingStats = {
  played: number;
  extraPlay: number;
  didntPlay: number;
  reentries: number;
};

/** Página async que exige conta vinculada (ex.: jogador sem `playerId`). */
export type AccountPendingResult = { kind: "account_pending" };

export type PaginatedPayload<T> = {
  items: T[];
  total: number;
  unreadCount?: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
export type PaginatedResult<T> = Result<PaginatedPayload<T>>;

export type FilterMap<K extends string> = Record<K, Set<string> | null>;
export type SelectOption = { value: string; label: string };
export type ColumnOptions<K extends string> = Record<K, SelectOption[]>;
export type ModalProps = { open: boolean; onOpenChange: (open: boolean) => void };

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
  SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED = "Credenciais do SharkScope não configuradas",
  SHARK_SYNC_CANCELLED = "Sincronização cancelada.",
  SHARK_GROUP_NOT_FOUND = "Grupo não encontrado no SharkScope",
  NICK_ALREADY_EXISTS = "Este nick já está cadastrado nessa rede.",
  NICK_NOT_FOUND = "Nick não encontrado ou inativo.",
  SHARK_SEARCH_ERROR = "Erro ao consultar SharkScope.",
  ID_REQUIRED = "ID obrigatório.",
  SHARK_SYNC_APP_NAME_NOT_CONFIGURED = "Nome do app SharkScope não configurado.",
  SHARK_SYNC_APP_KEY_NOT_CONFIGURED = "Chave do app SharkScope não configurada.",
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

export type EntityRef = WithId & { name: string };
export type PlayerRef = EntityRef & { nickname: string | null };
export type CoachOpt = EntityRef & { role: string };
export type GradeOpt = EntityRef;
export type PokerNetworkKey = keyof typeof POKER_NETWORKS;
export type PokerNetworkOption = SelectOption;

type ScopedLogLine = (message: string, meta?: Record<string, unknown>) => void;
export type ScopedLogger = {
  debug: ScopedLogLine;
  info: ScopedLogLine;
  success: ScopedLogLine;
  warn: ScopedLogLine;
  error: (message: string, cause?: Error, meta?: Record<string, unknown>) => void;
  table: (rows: Record<string, unknown>[]) => void;
  sep: (label?: string) => void;
};
export type GenerateMetadataProps = { params: Promise<{ id: string }> };

export type ModalDialogSize = keyof typeof MODAL_DIALOG_SIZES;
export type ModalDensity = "comfortable" | "compact";
export type ModalHeaderVariant = "standard" | "import";
export type ModalGradientHeaderProps = {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  density?: ModalDensity;
  variant?: ModalHeaderVariant;
  className?: string;
};
export type ModalFormFooterProps = { children: ReactNode; className?: string };
export type ModalDialogContentOwnProps = { size?: ModalDialogSize };
export type ModalDialogContentProps = ComponentProps<typeof DialogContent> & ModalDialogContentOwnProps;

/** Estados visuais para métricas agregadas (ROI, reentry, early/late finish). */
export type MetricSeverity = "red" | "yellow" | "green";
export type SeverityThreshold = [number, MetricSeverity];
