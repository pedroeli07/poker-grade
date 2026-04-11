"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AlertsTableRow from "@/components/sharkscope/alerts/alerts-table-row";
import type { SharkscopeAlertRow } from "@/lib/types";

const AlertsTable = memo(function AlertsTable({
  canAcknowledge,
  paginatedRows,
  selectedIds,
  onToggleRowSelect,
  headerChecked,
  onToggleSelectCurrentPage,
  isPending,
  onAcknowledge,
}: {
  canAcknowledge: boolean;
  paginatedRows: SharkscopeAlertRow[];
  selectedIds: Set<string>;
  onToggleRowSelect: (id: string, selected: boolean) => void;
  headerChecked: boolean | "indeterminate";
  onToggleSelectCurrentPage: (checked: boolean) => void;
  isPending: boolean;
  onAcknowledge: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
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
                    onCheckedChange={(v) => onToggleSelectCurrentPage(v === true)}
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
          {paginatedRows.map((alert) => (
            <AlertsTableRow
              key={alert.id}
              alert={alert}
              canAcknowledge={canAcknowledge}
              isSelected={selectedIds.has(alert.id)}
              isPending={isPending}
              onToggleSelect={onToggleRowSelect}
              onAcknowledge={onAcknowledge}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

AlertsTable.displayName = "AlertsTable";

export default AlertsTable;
