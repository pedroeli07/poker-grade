import { GRADES_LIST_CARD_FILTER_COLUMNS } from "@/lib/constants/grade/grades-list-ui";
import ColumnFilter from "../column-filter";
import { memo } from "react";
import { GradesColumnFilters, GradesColumnOptions, GradesSetCol } from "@/lib/types";

const GradesListColFilters = memo(function GradesListColFilters({
    compact,
    options,
    filters,
    setCol,
  }: {
    compact?: boolean;
    options: GradesColumnOptions;
    filters: GradesColumnFilters;
    setCol: GradesSetCol;
  }) {
    return (
      <>
        {GRADES_LIST_CARD_FILTER_COLUMNS.map(([id, col, label]) => (
          <ColumnFilter
            key={id}
            columnId={id}
            label={label}
            options={options[col]}
            applied={filters[col]}
            onApply={setCol(col)}
            compact={compact}
          />
        ))}
      </>
    );
  });
  
  GradesListColFilters.displayName = "GradesListColFilters";
  
  export default GradesListColFilters;