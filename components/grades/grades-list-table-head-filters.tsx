import { memo } from "react";
import { GradesColumnFilters, GradesColumnKey, GradesColumnOptions, GradesSetCol } from "@/lib/types";
import { GRADES_LIST_TABLE_HEAD_COLUMNS } from "@/lib/constants/grades-list-ui";
import GradesTableColumnFilter from "@/components/grades/grades-table-column-filter";
import { TableHead } from "@/components/ui/table";
import { TableColumnSortButton } from "@/components/table-column-sort-button";
import type { SortDir } from "@/lib/table-sort";

const GradesListTableHeadFilters = memo(function GradesListTableHeadFilters({
  options,
  filters,
  setCol,
  sort,
  onSort,
}: {
  options: GradesColumnOptions;
  filters: GradesColumnFilters;
  setCol: GradesSetCol;
  sort: { key: GradesColumnKey; dir: SortDir } | null;
  onSort: (key: GradesColumnKey, kind: "number" | "string") => void;
}) {
  return (
    <>
      {GRADES_LIST_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => {
        const kind: "number" | "string" = col === "rules" || col === "players" ? "number" : "string";
        const active = sort?.key === col;
        return (
          <TableHead key={id} className={`${w} align-bottom`}>
            <div className="flex items-center gap-0.5">
              <TableColumnSortButton
                ariaLabel={`Ordenar por ${label}`}
                isActive={active}
                direction={active ? sort!.dir : null}
                onClick={() => onSort(col, kind)}
              />
              <GradesTableColumnFilter
                columnId={id}
                col={col}
                label={label}
                options={options}
                filters={filters}
                setCol={setCol}
              />
            </div>
          </TableHead>
        );
      })}
    </>
  );
});

GradesListTableHeadFilters.displayName = "GradesListTableHeadFilters";

export default GradesListTableHeadFilters;
