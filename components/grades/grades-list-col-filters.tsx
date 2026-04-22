import { GRADES_LIST_CARD_FILTER_COLUMNS } from "@/lib/constants/grade";
import ColumnFilter from "../column-filter";
import { memo } from "react";
import { GradesColumnFilters, GradesColumnOptions } from "@/lib/types/columnKeys";
import { GradesSetCol } from "@/lib/types/grade/index";
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