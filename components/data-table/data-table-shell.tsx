"use client";

import { memo } from "react";
import { cn } from "@/lib/utils/cn";
import { dataTableShellActiveClass, dataTableShellIdleClass } from "@/lib/constants/classes";
import type { DataTableShellProps } from "@/lib/types/dataTable";

const DataTableShell = memo(function DataTableShell({
  hasActiveView,
  children,
  className,
}: DataTableShellProps) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden transition-all duration-300",
        hasActiveView ? dataTableShellActiveClass : dataTableShellIdleClass,
        className
      )}
    >
      {children}
    </div>
  );
});

DataTableShell.displayName = "DataTableShell";

export default DataTableShell;
