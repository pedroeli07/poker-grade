import { memo } from "react";
import { GradesColumnFilters, GradesColumnKey, GradesColumnOptions } from "@/lib/types/columnKeys";
import { GradesSetCol } from "@/lib/types/grade/index";
import { GRADES_LIST_TABLE_HEAD_COLUMNS } from "@/lib/constants/grade";
import GradesTableColumnFilter from "@/components/grades/grades-table-column-filter";
import { TableHead } from "@/components/ui/table";
import SortButton from "@/components/sort-button";
import type { ColumnSortKind } from "@/lib/types/dataTable";
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
  onSort: (key: GradesColumnKey, kind: ColumnSortKind) => void;
}) {
  return (
    <>
      {GRADES_LIST_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => {
        const kind: ColumnSortKind = col === "rules" ? "number" : "string";
        return (
          <TableHead key={id} className={`${w} align-middle text-center`}>
            <div className="flex items-center justify-center gap-0.5">
              <SortButton
                columnKey={col}
                sort={sort}
                toggleSort={onSort}
                kind={kind}
                label={label}
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
