import { Trash2 } from "lucide-react";
import {
  deleteAuthAccount,
  deletePendingInvite,
} from "@/lib/queries/db/user";
import { UserDirectoryRow } from "@/lib/types";

// Re-checking imports from monolith
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
import { memo } from "react";

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
      <ADContent className="sm:max-w-[440px] border-border/80 bg-card/95 p-0 gap-0 overflow-hidden shadow-xl">
        <div className="bg-linear-to-b from-destructive/8 to-transparent px-6 pt-6 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
        </div>
        <ADH className="space-y-2 px-6 text-left">
          <ADT className="text-xl font-semibold tracking-tight">
            {isPendingInvite ? "Cancelar convite?" : "Excluir conta?"}
          </ADT>
          <ADD asChild>
            <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                <span className="font-mono text-sm text-foreground">
                  {row.email}
                </span>
              </p>
              <p>
                {isPendingInvite
                  ? "Este e-mail sai da lista de convites. Quem ainda nÃ£o se cadastrou precisarÃ¡ de um novo convite."
                  : "A conta de acesso serÃ¡ removida deste sistema. Dados vinculados ao usuÃ¡rio podem ser afetados conforme as regras do app."}{" "}
                <span className="font-medium text-foreground">
                  Esta aÃ§Ã£o nÃ£o pode ser desfeita.
                </span>
              </p>
            </div>
          </ADD>
        </ADH>
        <ADF className="border-t border-border/60 bg-muted/30 px-6 py-4 sm:justify-end gap-2">
          <ADC
            type="button"
            disabled={disabled}
            className="mt-0 border-border/80"
          >
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
                  isPendingInvite
                    ? deletePendingInvite(fd)
                    : deleteAuthAccount(fd),
                () => onOpenChange(false)
              );
            }}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
          >
            {disabled ? "Removendoâ€¦" : "Remover"}
          </ADA>
        </ADF>
      </ADContent>
    </AD>
  );
});

UserDeleteDialog.displayName = "UserDeleteDialog";

export default UserDeleteDialog;
