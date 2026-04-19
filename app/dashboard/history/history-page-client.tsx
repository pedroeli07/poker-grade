"use client";

import { useState, useMemo, memo, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { HistoryPageData } from "@/lib/data/history";
import HistoryPageHeader from "@/components/history/history-page-header";
import HistorySummaryCards from "@/components/history/history-summary-cards";
import HistoryTimeline from "@/components/history/history-timeline";
import HistoryToolbar from "@/components/history/history-toolbar";
import HistoryDeleteDialog from "@/components/history/history-delete-dialog";
import ColumnFilter from "@/components/column-filter";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { deleteHistoryItems } from "@/lib/queries/db/history";

const HistoryPageClient = memo(function HistoryPageClient({
  history,
  upgrades,
  downgrades,
  maintains,
  isPlayer,
  page,
  pageSize,
  total,
  totalPages,
}: HistoryPageData) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPlayers, setSelectedPlayers] = useState<Set<string> | null>(null);
  const [selectedActions, setSelectedActions] = useState<Set<string> | null>(null);
  const [selectedAuthors, setSelectedAuthors] = useState<Set<string> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "multiple" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const playerOptions = useMemo(() => {
    const playersMap = new Map<string, string>();
    for (const h of history) {
      if (!playersMap.has(h.playerId)) playersMap.set(h.playerId, h.player.name);
    }
    return Array.from(playersMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [history]);

  const actionOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of history) {
      if (!m.has(h.action)) {
        if (h.action === "UPGRADE") m.set(h.action, "Subida");
        else if (h.action === "DOWNGRADE") m.set(h.action, "Descida");
        else if (h.action === "MAINTAIN") m.set(h.action, "Manutenção");
        else m.set(h.action, h.action);
      }
    }
    return Array.from(m.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [history]);

  const authorOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of history) {
      if (h.decidedBy && !m.has(h.decidedBy)) {
        m.set(h.decidedBy, h.decidedByName || "Desconhecido");
      }
    }
    return Array.from(m.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      if (selectedPlayers && selectedPlayers.size > 0 && !selectedPlayers.has(h.playerId)) return false;
      if (selectedActions && selectedActions.size > 0 && !selectedActions.has(h.action)) return false;
      if (selectedAuthors && selectedAuthors.size > 0) {
        if (!h.decidedBy || !selectedAuthors.has(h.decidedBy)) return false;
      }
      return true;
    });
  }, [history, selectedPlayers, selectedActions, selectedAuthors]);

  const hasAnyFilter =
    (selectedPlayers && selectedPlayers.size > 0) ||
    (selectedActions && selectedActions.size > 0) ||
    (selectedAuthors && selectedAuthors.size > 0);

  const clearAllFilters = () => {
    setSelectedPlayers(null);
    setSelectedActions(null);
    setSelectedAuthors(null);
  };

  const pushParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === undefined) params.delete(k);
        else params.set(k, String(v));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const onChangePage = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setSelected(new Set());
    pushParams({ page: next === 1 ? null : next });
  };

  const onChangePageSize = (size: number) => {
    setSelected(new Set());
    pushParams({ pageSize: size, page: null });
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const allSelected =
    filteredHistory.length > 0 && selected.size === filteredHistory.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredHistory.map((h) => h.id)));
  };

  const runDelete = (ids: string[], onDone?: () => void) => {
    if (ids.length === 0) return;
    startTransition(async () => {
      const r = await deleteHistoryItems(ids);
      if (!r.ok) {
        toast.error("Erro", r.error);
        return;
      }
      toast.success(
        ids.length === 1 ? "Registro excluído." : `${ids.length} registros excluídos.`
      );
      setSelected(new Set());
      onDone?.();
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <HistoryPageHeader isPlayer={isPlayer} />

      <HistorySummaryCards
        upgrades={upgrades}
        downgrades={downgrades}
        maintains={maintains}
        totalRecords={total}
      />

      <div className="space-y-3">
        {!isPlayer && (playerOptions.length > 0 || actionOptions.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-2 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 flex-wrap">
              {playerOptions.length > 0 && (
                <ColumnFilter
                  columnId="player"
                  label="Jogador"
                  options={playerOptions}
                  applied={selectedPlayers}
                  onApply={setSelectedPlayers}
                  compact
                />
              )}
              {actionOptions.length > 0 && (
                <ColumnFilter
                  columnId="action"
                  label="Tipo de Ação"
                  options={actionOptions}
                  applied={selectedActions}
                  onApply={setSelectedActions}
                  compact
                />
              )}
              {authorOptions.length > 0 && (
                <ColumnFilter
                  columnId="author"
                  label="Modificado por"
                  options={authorOptions}
                  applied={selectedAuthors}
                  onApply={setSelectedAuthors}
                  compact
                />
              )}
              {hasAnyFilter && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-primary"
                  onClick={clearAllFilters}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
            {hasAnyFilter && (
              <span className="text-xs font-medium text-muted-foreground pr-2">
                Exibindo {filteredHistory.length} nesta página
              </span>
            )}
          </div>
        )}

        <HistoryToolbar
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          selectedSize={selected.size}
          allSelected={allSelected}
          onToggleAll={toggleAll}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
          onDeleteSelected={() => setDeleteConfirm({ type: "multiple" })}
          hasItems={filteredHistory.length > 0}
        />

        <HistoryTimeline
          history={filteredHistory}
          isPlayer={isPlayer}
          selected={selected}
          onToggleSelect={toggleSelect}
        />
      </div>

      <HistoryDeleteDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
        count={selected.size}
        disabled={isPending}
        onConfirm={() => {
          runDelete(Array.from(selected), () => setDeleteConfirm(null));
        }}
      />
    </div>
  );
});

HistoryPageClient.displayName = "HistoryPageClient";

export default HistoryPageClient;
