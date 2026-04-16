"use client";

import { memo } from "react";
import { getInitials } from "@/lib/utils";
import { useEditableUser } from "@/hooks/user/use-editable-user";
import { useUserPermissions } from "@/hooks/user/use-user-permissions";
import UserDeleteDialog from "./user-delete-dialog";
import { UserRowContent } from "./user-row-content";
import { UserActions } from "./user-actions";
import { cardClassName } from "@/lib/constants";
import { UserCardProps } from "@/lib/types/index";

export const UserCard = memo(function UserCard({
  row,
  disabled,
  onAction,
}: UserCardProps) {
  const { canManage } = useUserPermissions();
  const {
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
  } = useEditableUser(row, onAction);

  return (
    <div className={`${cardClassName} p-4 transition-colors hover:bg-card/60`}>
      <UserDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        row={row}
        disabled={disabled}
        onAction={onAction}
      />
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
          {getInitials(row.email)}
        </div>
        
        <UserRowContent
          editing={editing}
          email={email}
          setEmail={setEmail}
          role={role}
          setRole={setRole}
          isBootstrap={isBootstrap}
          row={row}
        />

        {canManage && (
          <div className="flex shrink-0 flex-col gap-1">
            <UserActions
              editing={editing}
              disabled={disabled}
              onSave={save}
              onCancel={cancel}
              onEdit={() => setEditing(true)}
              onOpenDelete={() => setDeleteOpen(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
});
