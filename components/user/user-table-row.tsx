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
import { cn, getInitials } from "@/lib/utils";
import { ROLE_OPTIONS } from "@/lib/constants";
import { useEditableUser } from "@/hooks/user/use-editable-user";
import { useUserPermissions } from "@/hooks/user/use-user-permissions";
import { RoleBadge, StatusBadge } from "./user-badges";
import UserDeleteDialog from "./user-delete-dialog";
import UserActions from "./user-actions";
import { UserRole } from "@prisma/client";
import type { UserTableRowProps } from "@/lib/types";
import { userTableRowClassName } from "@/lib/constants";

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
    <TableRow className={userTableRowClassName}>
      {/* Coluna Membro — diálogo dentro de <td> (filho direto de <tr> só pode ser célula) */}
      <TableCell className="text-center">
        <UserDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          row={row}
          disabled={disabled}
          onAction={onAction}
        />
        <div className="flex min-w-0 items-center justify-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/50 bg-muted text-xs font-semibold overflow-hidden transition-transform duration-300 hover:scale-[3] hover:z-50 hover:shadow-xl hover:ring-2 hover:ring-primary/20">
            {row.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(row.email)
            )}
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
