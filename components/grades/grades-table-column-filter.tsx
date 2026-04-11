import ColumnFilter from "@/components/column-filter";
import { memo } from "react";
import type { GradesColumnKey, GradesColumnOptions, GradesColumnFilters } from "@/lib/types";
import type { GradesSetCol } from "@/lib/types";

const GradesTableColumnFilter = memo(function GradesTableColumnFilter({
    columnId,
    col,
    label,
    options,
    filters,
    setCol,
  }: {
    columnId: string;
    col: GradesColumnKey;
    label: string;
    options: GradesColumnOptions;
    filters: GradesColumnFilters;
    setCol: GradesSetCol;
  }) {
    return (
      <ColumnFilter
        columnId={columnId}
        label={label}
        options={options[col]}
        applied={filters[col]}
        onApply={setCol(col)}
      />
    );
  });
  
  GradesTableColumnFilter.displayName = "GradesTableColumnFilter";

  export default GradesTableColumnFilter;