"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/lib/table-sort";
import { memo } from "react";

const TableColumnSortButton = memo(function TableColumnSortButton({
  ariaLabel,
  isActive,
  direction,
  onClick,
  className,
}: {
  ariaLabel: string;
  isActive: boolean;
  direction: SortDir | null;
  onClick: () => void;
  className?: string;
}) {
  const Icon = !isActive || !direction ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-7 shrink-0 text-muted-foreground hover:text-foreground",
        isActive && "text-primary",
        className
      )}
      aria-label={ariaLabel}
      aria-sort={!isActive ? "none" : direction === "asc" ? "ascending" : "descending"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Icon className="size-3.5" />
    </Button>
  );
});

TableColumnSortButton.displayName = "TableColumnSortButton";

export default TableColumnSortButton;
