"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Check,
} from "lucide-react";
import { deleteImports } from "./actions";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ImportRow = {
  id: string;
  fileName: string;
  playerName: string | null;
  totalRows: number;
  matchedInGrade: number;
  suspect: number;
  outOfGrade: number;
  createdAt: Date;
};

export function ImportsClient({
  imports,
  canDelete,
}: {
  imports: ImportRow[];
  canDelete: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [idsToDelete, setIdsToDelete] = useState<string[] | null>(null);
  const router = useRouter();

  const allSelected = selected.size === imports.length && imports.length > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(imports.map((i) => i.id)));
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function requestDelete(ids: string[]) {
    if (!ids.length) return;
    setIdsToDelete(ids);
  }

  function confirmDelete() {
    if (!idsToDelete) return;
    const ids = idsToDelete;
    const count = ids.length;

    startTransition(async () => {
      const res = await deleteImports(ids);
      if (res.success) {
        toast.success(
          count === 1 ? "Importação excluída" : `${count} importações excluídas`,
        );
        setSelected(new Set());
        setIdsToDelete(null);
        router.refresh();
      } else {
        toast.error("Erro ao excluir", res.error ?? "Tente novamente.");
        setIdsToDelete(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar — appears when items are selected */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
          <span className="text-sm font-semibold text-foreground">
            {selected.size} selecionada{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Limpar seleção
            </button>
            <button
              type="button"
              onClick={() => requestDelete(Array.from(selected))}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/30 text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir ({selected.size})
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-blue-100">
              {canDelete && (
                <TableHead className="w-12 pl-4">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                      allSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-blue-300 bg-white hover:border-blue-400"
                    )}
                  >
                    {allSelected && <Check className="h-3 w-3 text-white" />}
                  </button>
                </TableHead>
              )}
              <TableHead className="text-blue-900 font-semibold">Arquivo</TableHead>
              <TableHead className="text-blue-900 font-semibold">Jogador</TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">Total</TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">Jogados</TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">Extra Play</TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">Não Jogados</TableHead>
              <TableHead className="text-right text-blue-900 font-semibold">Data</TableHead>
              {canDelete && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 9 : 7} className="text-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma importação realizada ainda.</p>
                </TableCell>
              </TableRow>
            ) : (
              imports.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "group transition-colors bg-white",
                      isSelected ? "bg-blue-100/50" : "hover:bg-blue-50"
                    )}
                  >
                    {canDelete && (
                      <TableCell className="pl-4 w-12" onClick={(e) => { e.stopPropagation(); toggleRow(item.id); }}>
                        <button
                          type="button"
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-border hover:border-primary/60"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </button>
                      </TableCell>
                    )}

                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/imports/${item.id}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[280px]" title={item.fileName}>
                          {item.fileName}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      </Link>
                    </TableCell>

                    <TableCell>
                      {item.playerName || (
                        <span className="text-muted-foreground italic text-sm">
                          Não Identificado
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-bold tabular-nums">
                      {item.totalRows}
                    </TableCell>

                      {/* matchedInGrade = played, outOfGrade = extra play, suspect = didn't play */}
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          {item.matchedInGrade}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        {item.outOfGrade > 0 ? (
                          <Badge variant="outline" className="border-red-500/30 text-red-600 bg-red-500/10">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {item.outOfGrade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.suspect > 0 ? (
                          <Badge variant="outline" className="border-zinc-400/50 text-zinc-500 bg-zinc-100">
                            {item.suspect}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>

                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {format(item.createdAt, "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                    </TableCell>

                    {canDelete && (
                      <TableCell className="w-12 pr-3">
                        <button
                          type="button"
                          title="Excluir"
                          onClick={() => requestDelete([item.id])}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-40 group-hover:opacity-100 cursor-pointer disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {imports.length > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          {imports.length} importaç{imports.length === 1 ? "ão" : "ões"} no total
          {selected.size > 0 && ` · ${selected.size} selecionada${selected.size > 1 ? "s" : ""}`}
        </p>
      )}

      <AlertDialog open={!!idsToDelete} onOpenChange={(open) => !open && setIdsToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {idsToDelete?.length === 1 ? "importação" : "importações"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá {idsToDelete?.length === 1 ? "esta importação" : "as importações selecionadas"}, todos os torneios contidos nelas e as revisões associadas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
