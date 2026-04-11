"use client";

import { memo } from "react";
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
import type { ColKey, Filters, TargetListRow, TargetsColumnOptions } from "@/lib/types";

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
  return (
    <div className="relative w-full overflow-x-auto">
      <Table className="min-w-[720px] w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/20 hover:bg-muted/20">
            {TARGETS_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => (
              <TableHead
                key={id}
                className={`${w} h-12 align-bottom ${col === "status" ? "pr-4 text-right" : ""}`}
              >
                <ColumnFilter
                  columnId={id}
                  label={label}
                  options={options[col] || []}
                  applied={filters[col]}
                  onApply={setCol(col)}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                Nenhum target com os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((target) => <TargetTableRow key={target.id} target={target} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
});

TargetsTableSection.displayName = "TargetsTableSection";

export default TargetsTableSection;
