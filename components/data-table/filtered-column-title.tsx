"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import type { FilteredColumnTitleProps } from "@/lib/types/dataTable";

const FilteredColumnTitle = memo(function FilteredColumnTitle({
  active,
  children,
}: FilteredColumnTitleProps) {
  if (!active) return <>{children}</>;
  return (
    <Badge className="max-w-[min(100%,13rem)] animate-pulse truncate border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-semibold leading-snug text-primary shadow-sm sm:max-w-[16rem] sm:text-sm">
      {children}
    </Badge>
  );
});

FilteredColumnTitle.displayName = "FilteredColumnTitle";

export default FilteredColumnTitle;
