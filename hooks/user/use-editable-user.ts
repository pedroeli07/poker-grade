"use client";

import { useState } from "react";
import type { UserDirectoryRow } from "@/lib/types/user/index";
import { UserRole } from "@prisma/client";
import { isSuperAdminEmail } from "@/lib/utils/auth-session";
import { updateAuthAccount } from "@/lib/queries/db/user/admin-account-mutations";
import { updatePendingInvite } from "@/lib/queries/db/user/invite-mutations";

export function useEditableUser(
  row: UserDirectoryRow,
  runAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void
) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<UserRole>(row.role);

  const isBootstrap = row.kind === "account" && isSuperAdminEmail(row.email);

  const save = () => {
    const fd = new FormData();
    fd.set("id", row.id);
    fd.set("email", email.trim());
    fd.set("role", role);

    runAction(
      async () =>
        row.kind === "pending" ? updatePendingInvite(fd) : updateAuthAccount(fd),
      () => setEditing(false)
    );
  };

  const cancel = () => {
    setEditing(false);
    setEmail(row.email);
    setRole(row.role);
  };

  return {
    editing,
    setEditing,
    deleteOpen,
    setDeleteOpen,
    email,
    setEmail,
    role,
    setRole,
    save,
    cancel,
    isBootstrap,
  };
}