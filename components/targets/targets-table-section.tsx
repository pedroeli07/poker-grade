"use client";

import { memo, useCallback, useMemo, useState } from "react";
import ColumnFilter from "@/components/column-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TargetTableRow } from "@/components/targets/target-table-row";
import { TARGETS_TABLE_HEAD_COLUMNS } from "@/lib/constants/targets-page";
import { STATUS_CONFIG } from "@/lib/constants";
import type { ColKey, Filters, TargetListRow, TargetsColumnOptions } from "@/lib/types";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import { compareString, nextSortState, type SortDir } from "@/lib/table-sort";

function statusLabel(status: TargetListRow["status"]): string {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status;
}

const TargetsTableSection = memo(function TargetsTableSection({
  filtered,
  options,
  filters,
  setCol,
}: {
  filtered: TargetListRow[];
  options: TargetsColumnOptions;
  filters: Filters;
  setCol: (col: ColKey) => (next: Set<string> | null) => void;
}) {
  const [sort, setSort] = useState<{ key: ColKey; dir: SortDir } | null>(null);

  const toggleSort = useCallback((key: ColKey, kind: "number" | "string") => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "name":
          return compareString(a.name, b.name, dir);
        case "player":
          return compareString(a.playerName, b.playerName, dir);
        case "targetType":
          return compareString(a.targetType, b.targetType, dir);
        case "status":
          return compareString(statusLabel(a.status), statusLabel(b.status), dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  return (
    <div className="relative w-full overflow-x-auto">
      <Table className="min-w-[720px] w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
            {TARGETS_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => {
              const active = sort?.key === col;
              return (
                <TableHead
                  key={id}
                  className={`${w} h-12 align-bottom ${col === "status" ? "pr-4 text-right" : ""}`}
                >
                  <div
                    className={`flex items-center gap-0.5 ${col === "status" ? "justify-end" : ""}`}
                  >
                    <TableColumnSortButton
                      ariaLabel={`Ordenar por ${label}`}
                      isActive={active}
                      direction={active ? sort!.dir : null}
                      onClick={() => toggleSort(col, "string")}
                    />
                    <ColumnFilter
                      columnId={id}
                      label={label}
                      options={options[col] || []}
                      applied={filters[col]}
                      onApply={setCol(col)}
                    />
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                Nenhum target com os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((target) => <TargetTableRow key={target.id} target={target} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
});

TargetsTableSection.displayName = "TargetsTableSection";

export default TargetsTableSection;
