import type { UserRole } from "@prisma/client";
import type { BaseEntity } from "./primitives";

type BaseUsuarioRow = BaseEntity & { 
  email: string; 
  role: UserRole; 
};

export type UsuarioDirectoryRow =
  | (BaseUsuarioRow & { kind: "pending"; isRegistered: false })
  | (BaseUsuarioRow & { kind: "account"; isRegistered: true });

export interface ProfileData {
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}
