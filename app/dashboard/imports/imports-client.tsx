"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { ColumnFilter } from "@/components/column-filter";
import { distinctOptions } from "@/lib/distinct-options";

export type ImportRow = {
  id: string;
  fileName: string;
  playerName: string | null;
  totalRows: number;
  matchedInGrade: number;
  suspect: number;
  outOfGrade: number;
  createdAt: Date | string;
};

const EMPTY_PLAYER = "__empty__";

type ColKey =
  | "fileName"
  | "player"
  | "totalRows"
  | "played"
  | "extraPlay"
  | "didntPlay"
  | "date";

type Filters = Record<ColKey, Set<string> | null>;

function rowDateLabel(r: ImportRow) {
  return format(new Date(r.createdAt), "dd/MM/yyyy • HH:mm", { locale: ptBR });
}

export function ImportsClient({
  imports,
  canDelete,
}: {
  imports: ImportRow[];
  canDelete: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({
    fileName: null,
    player: null,
    totalRows: null,
    played: null,
    extraPlay: null,
    didntPlay: null,
    date: null,
  });
  const [isPending, startTransition] = useTransition();
  const [idsToDelete, setIdsToDelete] = useState<string[] | null>(null);
  const router = useRouter();

  const options = useMemo(
    () => ({
      fileName: distinctOptions(imports, (r) => ({
        value: r.fileName,
        label: r.fileName,
      })),
      player: distinctOptions(imports, (r) => {
        const v = r.playerName ?? EMPTY_PLAYER;
        return {
          value: v,
          label: r.playerName ?? "(não identificado)",
        };
      }),
      totalRows: distinctOptions(imports, (r) => ({
        value: String(r.totalRows),
        label: String(r.totalRows),
      })),
      played: distinctOptions(imports, (r) => ({
        value: String(r.matchedInGrade),
        label: String(r.matchedInGrade),
      })),
      extraPlay: distinctOptions(imports, (r) => ({
        value: String(r.outOfGrade),
        label: String(r.outOfGrade),
      })),
      didntPlay: distinctOptions(imports, (r) => ({
        value: String(r.suspect),
        label: String(r.suspect),
      })),
      date: distinctOptions(imports, (r) => {
        const label = rowDateLabel(r);
        return { value: label, label };
      }),
    }),
    [imports]
  );

  const filtered = useMemo(() => {
    return imports.filter((r) => {
      if (filters.fileName && !filters.fileName.has(r.fileName))
        return false;
      const pk = r.playerName ?? EMPTY_PLAYER;
      if (filters.player && !filters.player.has(pk)) return false;
      if (filters.totalRows && !filters.totalRows.has(String(r.totalRows)))
        return false;
      if (filters.played && !filters.played.has(String(r.matchedInGrade)))
        return false;
      if (filters.extraPlay && !filters.extraPlay.has(String(r.outOfGrade)))
        return false;
      if (filters.didntPlay && !filters.didntPlay.has(String(r.suspect)))
        return false;
      const dl = rowDateLabel(r);
      if (filters.date && !filters.date.has(dl)) return false;
      return true;
    });
  }, [imports, filters]);

  const anyFilter = Object.values(filters).some((x) => x !== null);

  const allSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.add(i.id));
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const setCol = (col: ColKey) => (next: Set<string> | null) => {
    setFilters((f) => ({ ...f, [col]: next }));
  };

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
          count === 1 ? "Importação excluída" : `${count} importações excluídas`
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

  const colCount = canDelete ? 9 : 7;

  return (
    <div className="space-y-3">
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

      {imports.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando{" "}
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            de{" "}
            <span className="font-medium text-foreground">{imports.length}</span>{" "}
            importaç{imports.length === 1 ? "ão" : "ões"}
          </span>
          {anyFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() =>
                setFilters({
                  fileName: null,
                  player: null,
                  totalRows: null,
                  played: null,
                  extraPlay: null,
                  didntPlay: null,
                  date: null,
                })
              }
            >
              Limpar todos os filtros
            </Button>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-blue-100">
              {canDelete && (
                <TableHead className="w-12 pl-4">
                  <button
                    type="button"
                    onClick={toggleAll}
                    disabled={filtered.length === 0}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                      allSelected
                        ? "bg-blue-500 border-blue-500"
                        : "border-blue-300 bg-white hover:border-blue-400",
                      filtered.length === 0 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {allSelected && <Check className="h-3 w-3 text-white" />}
                  </button>
                </TableHead>
              )}
              <TableHead className="text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-file"
                  label="Arquivo"
                  options={options.fileName}
                  applied={filters.fileName}
                  onApply={setCol("fileName")}
                />
              </TableHead>
              <TableHead className="text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-player"
                  label="Jogador"
                  options={options.player}
                  applied={filters.player}
                  onApply={setCol("player")}
                />
              </TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-total"
                  label="Total"
                  options={options.totalRows}
                  applied={filters.totalRows}
                  onApply={setCol("totalRows")}
                />
              </TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-played"
                  label="Jogados"
                  options={options.played}
                  applied={filters.played}
                  onApply={setCol("played")}
                />
              </TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-extra"
                  label="Extra Play"
                  options={options.extraPlay}
                  applied={filters.extraPlay}
                  onApply={setCol("extraPlay")}
                />
              </TableHead>
              <TableHead className="text-center text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-didnt"
                  label="Não Jogados"
                  options={options.didntPlay}
                  applied={filters.didntPlay}
                  onApply={setCol("didntPlay")}
                />
              </TableHead>
              <TableHead className="text-right text-blue-900 font-semibold">
                <ColumnFilter
                  columnId="imp-date"
                  label="Data"
                  options={options.date}
                  applied={filters.date}
                  onApply={setCol("date")}
                />
              </TableHead>
              {canDelete && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="text-center py-12 text-muted-foreground"
                >
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhuma importação realizada ainda.</p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className="text-center py-12 text-muted-foreground"
                >
                  Nenhuma importação com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
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
                      <TableCell
                        className="pl-4 w-12"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(item.id);
                        }}
                      >
                        <button
                          type="button"
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-border hover:border-primary/60"
                          )}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </TableCell>
                    )}

                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/imports/${item.id}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span
                          className="truncate max-w-[280px]"
                          title={item.fileName}
                        >
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

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {item.matchedInGrade}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      {item.outOfGrade > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-red-500/30 text-red-600 bg-red-500/10"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.outOfGrade}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {item.suspect > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-zinc-400/50 text-zinc-500 bg-zinc-100"
                        >
                          {item.suspect}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">0</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {rowDateLabel(item)}
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
          {filtered.length} visível{filtered.length !== 1 ? "is" : ""}
          {anyFilter && ` (de ${imports.length} no total)`}
          {selected.size > 0 &&
            ` · ${selected.size} selecionada${selected.size > 1 ? "s" : ""}`}
        </p>
      )}

      <AlertDialog
        open={!!idsToDelete}
        onOpenChange={(open) => !open && setIdsToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {idsToDelete?.length === 1 ? "importação" : "importações"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá{" "}
              {idsToDelete?.length === 1
                ? "esta importação"
                : "as importações selecionadas"}
              , todos os torneios contidos nelas e as revisões associadas. Esta
              ação não pode ser desfeita.
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
