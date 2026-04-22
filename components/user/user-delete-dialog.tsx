import { deleteAuthAccount } from "@/lib/queries/db/user/admin-account-mutations";
import { deletePendingInvite } from "@/lib/queries/db/user/invite-mutations";
import { UserDirectoryRow } from "@/lib/types/user/index";
import {
  AlertDialog as AD,
  AlertDialogAction as ADA,
  AlertDialogCancel as ADC,
  AlertDialogContent as ADContent,
  AlertDialogDescription as ADD,
  AlertDialogFooter as ADF,
  AlertDialogHeader as ADH,
  AlertDialogTitle as ADT,
} from "@/components/ui/alert-dialog";
import {
  DestructiveAlertDivider,
  DestructiveAlertIconHeader,
  DestructiveAlertWarningNote,
} from "@/components/modals/primitives/destructive-alert-dialog";
import { memo } from "react";
import { 
  destructiveAlertDialogContentClassName, 
  destructiveAlertHeaderClassName, 
  destructiveAlertTitleClassName, 
  destructiveAlertDescriptionWrapClassName, 
  destructiveAlertFooterClassName, 
  destructiveAlertCancelButtonClassName, 
  destructiveAlertConfirmButtonClassName } from "@/lib/constants/classes";

const UserDeleteDialog = memo(function UserDeleteDialog({
  open,
  onOpenChange,
  row,
  disabled,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: UserDirectoryRow;
  disabled: boolean;
  onAction: (
    fn: () => Promise<{ error?: string; success?: boolean }>,
    onSuccess?: () => void
  ) => void;
}) {
  const isPendingInvite = row.kind === "pending";

  return (
    <AD
      open={open}
      onOpenChange={(next) => {
        if (!next && disabled) return;
        onOpenChange(next);
      }}
    >
      <ADContent className={destructiveAlertDialogContentClassName}>
        <DestructiveAlertIconHeader />
        <ADH className={destructiveAlertHeaderClassName}>
          <ADT className={destructiveAlertTitleClassName}>
            {isPendingInvite ? "Cancelar convite?" : "Excluir conta?"}
          </ADT>
          <ADD asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              <p>
                <span className="font-mono text-sm text-foreground">{row.email}</span>
              </p>
              <p>
                {isPendingInvite
                  ? "Este e-mail sai da lista de convites. Quem ainda não se cadastrou precisará de um novo convite."
                  : "A conta de acesso será removida deste sistema. Dados vinculados ao usuário podem ser afetados conforme as regras do app."}
              </p>
              <DestructiveAlertWarningNote>Esta ação não pode ser desfeita.</DestructiveAlertWarningNote>
            </div>
          </ADD>
        </ADH>
        <DestructiveAlertDivider />
        <ADF className={destructiveAlertFooterClassName}>
          <ADC type="button" disabled={disabled} className={destructiveAlertCancelButtonClassName}>
            Voltar
          </ADC>
          <ADA
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("id", row.id);
              onAction(
                async () =>
                  isPendingInvite ? deletePendingInvite(fd) : deleteAuthAccount(fd),
                () => onOpenChange(false)
              );
            }}
            className={destructiveAlertConfirmButtonClassName}
          >
            {disabled ? "Excluindo…" : "Excluir"}
          </ADA>
        </ADF>
      </ADContent>
    </AD>
  );
});

UserDeleteDialog.displayName = "UserDeleteDialog";

export default UserDeleteDialog;
