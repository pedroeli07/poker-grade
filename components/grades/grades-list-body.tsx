"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardClassName } from "@/lib/constants";
import GradeCard from "@/components/grades/grade-card";
import GradeTableRow from "@/components/grades/grade-table-row";
import GradesEmptyState from "@/components/grades/grades-view-components";
import GradesListTableHeadFilters from "@/components/grades/grades-list-table-head-filters";
import type {
  GradesColumnFilters,
  GradesColumnKey,
  GradesColumnOptions,
  GradeListRow,
  GradesSetCol,
} from "@/lib/types";
import { memo, useCallback, useMemo, useState } from "react";
import {
  compareNumber,
  compareString,
  nextSortState,
  type SortDir,
} from "@/lib/table-sort";

const GradesListBody = memo(function GradesListBody({
  view,
  manage,
  filtered,
  options,
  filters,
  setCol,
  anyFilter,
  clearFilters,
}: {
  view: "cards" | "table";
  manage: boolean;
  filtered: GradeListRow[];
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: GradesSetCol;
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  const [sort, setSort] = useState<{ key: GradesColumnKey; dir: SortDir } | null>(null);

  const onSort = useCallback((key: GradesColumnKey, kind: "number" | "string") => {
    setSort((prev) => nextSortState(prev, key, kind));
  }, []);

  const sortedTableRows = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const copy = [...filtered];
    copy.sort((a, b) => {
      switch (key) {
        case "name":
          return compareString(a.name, b.name, dir);
        case "description":
          return compareString(a.description ?? "", b.description ?? "", dir);
        case "rules":
          return compareNumber(a.rulesCount, b.rulesCount, dir);
        case "players":
          return compareNumber(a.assignmentsCount, b.assignmentsCount, dir);
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sort]);

  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((grade) => (
          <GradeCard key={grade.id} grade={grade} manage={manage} />
        ))}
        {filtered.length === 0 && (
          <GradesEmptyState anyFilter={anyFilter} clearFilters={clearFilters} />
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table className="min-w-[720px] w-full table-fixed">
        <TableHeader>
          <TableRow
            className={`border-b border-border bg-blue-500/20 hover:bg-blue-500/20 ${cardClassName}`}
          >
            <GradesListTableHeadFilters
              options={options}
              filters={filters}
              setCol={setCol}
              sort={sort}
              onSort={onSort}
            />
            <TableHead className="text-right w-[140px] align-bottom text-foreground font-semibold">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTableRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                Nenhuma grade com os filtros atuais.
              </TableCell>
            </TableRow>
          ) : (
            sortedTableRows.map((grade) => (
              <GradeTableRow key={grade.id} grade={grade} manage={manage} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

GradesListBody.displayName = "GradesListBody";

export default GradesListBody;
