"use client";

import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { cardClassName, ROLE_OPTIONS } from "@/lib/constants";
import { useEditableUser } from "@/hooks/user/use-editable-user";
import { useUserPermissions } from "@/hooks/user/use-user-permissions";
import { RoleBadge, StatusBadge } from "./user-badges";
import { UsuarioDeleteDialog } from "./user-delete-dialog";
import { UserActions } from "./user-actions";
import { UserRole } from "@prisma/client";
import type { UserTableRowProps } from "@/lib/types";

export const UserTableRow = memo(function UserTableRow({
  row,
  disabled,
  onAction,
}: UserTableRowProps) {
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
    <TableRow className={`group ${cardClassName}`}>
      <UsuarioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        row={row}
        disabled={disabled}
        onAction={onAction}
      />
      
      {/* Coluna Membro */}
      <TableCell className="text-center">
        <div className="flex min-w-0 items-center justify-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold">
            {getInitials(row.email)}
          </div>
          {editing ? (
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 bg-background font-mono text-sm max-w-[280px]"
              disabled={isBootstrap}
            />
          ) : (
            <span className="truncate font-mono text-sm text-foreground" title={row.email}>
              {row.email}
            </span>
          )}
        </div>
      </TableCell>

      {/* Coluna Cargo */}
      <TableCell className="text-center">
        <div className="flex justify-center">
        {editing ? (
          <Select
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            disabled={isBootstrap}
          >
            <SelectTrigger className="h-8 bg-background text-sm w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={row.role} />
        )}
        </div>
      </TableCell>

      {/* Coluna Status */}
      <TableCell className="text-center">
        <div className="flex justify-center">
          <StatusBadge registered={row.isRegistered} />
        </div>
      </TableCell>

      {/* Coluna WhatsApp */}
      <TableCell className="text-center text-[15px] font-mono text-muted-foreground">
        {row.whatsapp || <span className="opacity-30">—</span>}
      </TableCell>

      {/* Coluna Discord */}
      <TableCell className="text-center text-[15px] font-mono text-muted-foreground">
        {row.discord || <span className="opacity-30">—</span>}
      </TableCell>

      {/* Coluna Ações */}
      {canManage && (
        <TableCell className="text-right">
          <div className="inline-flex items-center justify-end gap-1">
            <UserActions
              editing={editing}
              disabled={disabled}
              onSave={save}
              onCancel={cancel}
              onEdit={() => setEditing(true)}
              onOpenDelete={() => setDeleteOpen(true)}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});
