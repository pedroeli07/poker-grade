"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteImports } from "@/lib/queries/db/import-queries";
import { toast } from "@/lib/toast";
import { useInvalidate } from "@/hooks/use-invalidate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteImportButton({ importId, iconOnly = false }: { importId: string; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const invalidate = useInvalidate("imports");

  const handleDelete = () =>
    startTransition(async () => {
      const res = await deleteImports([importId]);
      setOpen(false);
      if (res.success) {
        toast.success("Importação excluída");
        invalidate();
        if (iconOnly) router.refresh();
        else router.push("/dashboard/imports");
      } else {
        toast.error("Erro ao excluir", res.error ?? "Tente novamente.");
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={
            iconOnly
              ? "p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-40 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
              : "flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          }
        >
          <Trash2 className="h-4 w-4" />
          {!iconOnly && (isPending ? "Excluindo..." : "Excluir importação")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir importação?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso removerá esta importação, todos os torneios contidos nela e as revisões associadas. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={isPending}
            className="bg-red-500 text-white hover:bg-red-500/90"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
