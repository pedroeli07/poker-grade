import type { UserRole } from "@prisma/client";
import type { BaseEntity, FilterMap, ModalProps } from "../primitives";

type BaseUserRow = BaseEntity & {
  email: string;
  role: UserRole;
  whatsapp: string | null;
  discord: string | null;
  avatarUrl: string | null;
};

export type UserDirectoryRow =
  | (BaseUserRow & { kind: "pending"; isRegistered: false })
  | (BaseUserRow & { kind: "account"; isRegistered: true });

export interface ProfileData {
  email: string;
  displayName: string | null;
  whatsapp: string | null;
  discord: string | null;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
}

export type UserClientProps = { initialRows: UserDirectoryRow[] };

export type UserInviteModalProps = ModalProps;

type UserAsyncAction = () => Promise<{ error?: string; success?: boolean }>;

export type UserViewProps = {
  row: UserDirectoryRow;
  disabled: boolean;
  onAction: (fn: UserAsyncAction, onSuccess?: () => void) => void;
};

export type UserCardProps = UserViewProps;
export type UserTableRowProps = UserViewProps;
  
export type UserColumnKey = "email" | "role" | "status";
export type UserColumnFilters = FilterMap<UserColumnKey>;

  