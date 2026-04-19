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

const NotificationsDeleteDialog = memo(function NotificationsDeleteDialog({
  open,
  onOpenChange,
  count,
  disabled,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const isMultiple = count > 1;

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
            {isMultiple ? "Excluir notificações?" : "Excluir notificação?"}
          </ADT>
          <ADD asChild>
            <div className={destructiveAlertDescriptionWrapClassName}>
              <p>
                {isMultiple
                  ? `Você está prestes a excluir ${count} notificações.`
                  : "A notificação será removida permanentemente deste sistema."}
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
              onConfirm();
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

NotificationsDeleteDialog.displayName = "NotificationsDeleteDialog";

export default NotificationsDeleteDialog;
