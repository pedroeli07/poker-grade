import type { UserRole } from "@prisma/client";

export type UsuarioDirectoryRow =
  | {
      kind: "pending";
      id: string;
      email: string;
      role: UserRole;
      createdAt: string;
      isRegistered: false;
    }
  | {
      kind: "account";
      id: string;
      email: string;
      role: UserRole;
      createdAt: string;
      isRegistered: true;
    };
