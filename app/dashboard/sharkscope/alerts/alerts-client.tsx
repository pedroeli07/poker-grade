"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { AlertTriangle, CheckCircle2, Loader2, Bell, Trash2 } from "lucide-react";
import Link from "next/link";
import { ALERT_TYPE_LABEL, cardClassName, SEVERITY_UI } from "@/lib/constants";
import { SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS } from "@/lib/constants/sharkscope-alerts-page";
import type { SharkscopeAlertRow } from "@/lib/types";
import { useAlertsPageClient } from "@/hooks/sharkscope/alerts/use-alerts-page-client";
import { SyncSharkScopeButton } from "@/components/sharkscope/sync-button";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  formatAlertMetricValue,
  formatAlertThreshold,
  formatAlertTriggeredAt,
  getAlertMetricBadgeProps,
} from "@/lib/utils";

export function AlertsClient({
  initialAlerts,
  canAcknowledge,
}: {
  initialAlerts: SharkscopeAlertRow[];
  canAcknowledge: boolean;
}) {
  const {
    filterSeverity,
    setFilterSeverity,
    filterType,
    setFilterType,
    filterAck,
    setFilterAck,
    filtered,
    unackedCount,
    isPending,
    acknowledge,
    acknowledgeAll,
    selectedIds,
    setSelectedIds,
    bulkDeleteOpen,
    setBulkDeleteOpen,
    page,
    setPage,
    pageSize,
    setPageSize,
    paginatedRows,
    visibleSelectedIds,
    headerChecked,
    toggleSelectCurrentPage,
    confirmBulkDelete,
  } = useAlertsPageClient(initialAlerts);

  return (
    <div className="space-y-6">
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir alertas selecionados?</AlertDialogTitle>
            <AlertDialogDescription>
              {visibleSelectedIds.size === 1
                ? "Este alerta será removido permanentemente. Não é possível desfazer."
                : `Os ${visibleSelectedIds.size} alertas selecionados serão removidos permanentemente. Não é possível desfazer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                confirmBulkDelete();
              }}
            >
              {isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Alertas SharkScope
          </h2>
          <p className="text-muted-foreground mt-1">
            Alertas automáticos gerados pelo cron job diário.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canAcknowledge && <SyncSharkScopeButton />}
          {canAcknowledge && unackedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={acknowledgeAll}
            >
              {isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Reconhecer todos ({unackedCount})
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="red">🔴 Vermelho</SelectItem>
            <SelectItem value="yellow">🟡 Amarelo</SelectItem>
            <SelectItem value="green">🟢 Verde</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(ALERT_TYPE_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAck} onValueChange={setFilterAck}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unacknowledged">Não reconhecidos</SelectItem>
            <SelectItem value="acknowledged">Reconhecidos</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground self-center ml-auto">
          {filtered.length} alerta{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {canAcknowledge && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground -mt-2">
          O checkbox do cabeçalho marca só as linhas <span className="font-medium text-foreground">desta página</span>.
          Para marcar todos os alertas do filtro de uma vez, aumente &quot;Linhas por página&quot; até caber a lista
          inteira; a barra acima da tabela serve para excluir o que estiver selecionado.
        </p>
      )}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-blue-500/10">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum alerta com os filtros atuais.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {canAcknowledge && visibleSelectedIds.size > 0 && (
            <div className={`w-1/4 ${cardClassName} mx-auto flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between`}>
              <p className="text-sm px-0.5">
                <span className="font-semibold text-foreground">{visibleSelectedIds.size}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {visibleSelectedIds.size === 1 ? "alerta selecionado" : "alertas selecionados"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setSelectedIds(new Set())}
                >
                  Limpar seleção
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  {isPending ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Excluir
                </Button>
              </div>
            </div>
          )}
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[...SHARKSCOPE_ALERTS_PAGE_SIZE_OPTIONS]}
          />
          <div className="rounded-md border border-border overflow-x-auto">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="bg-blue-500/20 hover:bg-blue-500/20">
                  {canAcknowledge && (
                    <TableHead className="w-11 min-w-11 max-w-11 !px-1.5 align-middle">
                      <div
                        className="mx-auto flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-primary/45 bg-background shadow-sm"
                        title='Marca ou desmarca só os alertas desta página (ajuste "Linhas por página" para incluir todos)'
                      >
                        <Checkbox
                          checked={headerChecked}
                          onCheckedChange={(v) => toggleSelectCurrentPage(v === true)}
                          disabled={isPending || paginatedRows.length === 0}
                          aria-label="Selecionar todos os alertas desta página"
                          className="size-[15px] shrink-0 border-2 border-foreground/45 bg-background shadow-none hover:border-primary/80 data-[state=checked]:border-primary data-[state=indeterminate]:border-primary"
                        />
                      </div>
                    </TableHead>
                  )}
                  <TableHead>Severidade</TableHead>
                  <TableHead>Jogador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Limite</TableHead>
                  <TableHead>Data</TableHead>
                  {canAcknowledge && <TableHead className="text-right">Ação</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((alert) => {
                  const sev = SEVERITY_UI[alert.severity] ?? SEVERITY_UI.yellow;
                  const valueBadge = getAlertMetricBadgeProps(alert);
                  return (
                    <TableRow
                      key={alert.id}
                      className={`bg-white hover:bg-sidebar-accent/50 ${alert.acknowledged ? "opacity-50" : ""}`}
                    >
                      {canAcknowledge && (
                        <TableCell className="w-11 min-w-11 max-w-11 !p-2 !px-1.5 align-middle">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={selectedIds.has(alert.id)}
                              onCheckedChange={(v) => {
                                const on = v === true;
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (on) next.add(alert.id);
                                  else next.delete(alert.id);
                                  return next;
                                });
                              }}
                              disabled={isPending}
                              aria-label={`Selecionar alerta: ${alert.player.name}`}
                              className="size-4 border-2 border-foreground/35 bg-background shadow-sm hover:border-primary/70 data-[state=checked]:border-primary"
                            />
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge className={`${sev.badge} text-xs`}>
                          <AlertTriangle
                            className={`mr-1 h-3 w-3 ${sev.iconClass}`}
                          />
                          {sev.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/players/${alert.player.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {alert.player.name}
                        </Link>
                        {alert.player.nickname && (
                          <span className="text-xs text-muted-foreground ml-1">
                            @{alert.player.nickname}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="max-w-full truncate border-border/80 bg-muted/40 font-normal text-foreground">
                          {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={valueBadge.variant} className={valueBadge.className}>
                          {formatAlertMetricValue(alert)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs tabular-nums font-medium text-muted-foreground"
                        >
                          {formatAlertThreshold(alert)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatAlertTriggeredAt(alert.triggeredAt)}
                      </TableCell>
                      {canAcknowledge && (
                        <TableCell className="text-right">
                          {alert.acknowledged ? (
                            <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              OK
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={isPending}
                              onClick={() => acknowledge(alert.id)}
                            >
                              Reconhecer
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
