"use client";

import TableColumnSortButton from "@/components/table-column-sort-button";
import type { ColumnSortButtonProps } from "@/lib/types/sortButton";

function SortButton<K extends string>({
  columnKey,
  sort,
  toggleSort,
  kind,
  label,
}: ColumnSortButtonProps<K>) {
  const active = sort?.key === columnKey;
  return (
    <TableColumnSortButton
      ariaLabel={`Ordenar por ${label}`}
      isActive={active}
      direction={active ? sort!.dir : null}
      onClick={() => toggleSort(columnKey, kind)}
    />
  );
}

SortButton.displayName = "SortButton";

export default SortButton;
