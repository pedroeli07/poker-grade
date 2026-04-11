import { memo } from "react";
import { GradesColumnFilters, GradesColumnOptions, GradesSetCol } from "@/lib/types";
import { GRADES_LIST_TABLE_HEAD_COLUMNS } from "@/lib/constants/grades-list-ui";
import GradesTableColumnFilter from "@/components/grades/grades-table-column-filter";
import { TableHead } from "@/components/ui/table";

const GradesListTableHeadFilters = memo(function GradesListTableHeadFilters({
    options,
    filters,
    setCol,
  }: {
    options: GradesColumnOptions;
    filters: GradesColumnFilters;
    setCol: GradesSetCol;
  }) {
    return (
      <>
        {GRADES_LIST_TABLE_HEAD_COLUMNS.map(([w, id, col, label]) => (
          <TableHead key={id} className={`${w} align-bottom`}>
            <GradesTableColumnFilter
              columnId={id}
              col={col}
              label={label}
              options={options}
              filters={filters}
              setCol={setCol}
            />
          </TableHead>
        ))}
      </>
    );
  });
  
  GradesListTableHeadFilters.displayName = "GradesListTableHeadFilters";
  
  export default GradesListTableHeadFilters;
  