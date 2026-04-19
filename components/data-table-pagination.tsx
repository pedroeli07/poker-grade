"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATA_TABLE_DEFAULT_PAGE_SIZE_OPTIONS,
  DATA_TABLE_PAGINATION_NEXT_ARIA,
  DATA_TABLE_PAGINATION_NONE_ITEMS,
  DATA_TABLE_PAGINATION_PREV_ARIA,
  DATA_TABLE_PAGINATION_RANGE_OF,
  DATA_TABLE_PAGINATION_ROWS_LABEL,
} from "@/lib/constants";
import { cn, getDataTablePaginationState } from "@/lib/utils";

export type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
};

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DATA_TABLE_DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: DataTablePaginationProps) {
  const { totalPages, currentPage, from, to } = getDataTablePaginationState(
    page,
    pageSize,
    totalItems
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card/80 px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">{DATA_TABLE_PAGINATION_ROWS_LABEL}</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v));
            onPageChange(1);
          }}
        >
          <SelectTrigger className="h-8 w-[4.75rem]" aria-label={DATA_TABLE_PAGINATION_ROWS_LABEL}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs sm:text-sm">
          {totalItems === 0 ? (
            DATA_TABLE_PAGINATION_NONE_ITEMS
          ) : (
            <>
              <span className="font-medium text-foreground">{from}</span>
              <span className="mx-0.5">–</span>
              <span className="font-medium text-foreground">{to}</span>
              <span className="mx-1">{DATA_TABLE_PAGINATION_RANGE_OF}</span>
              <span className="font-medium text-foreground">{totalItems}</span>
            </>
          )}
        </span>
      </div>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          disabled={currentPage <= 1 || totalItems === 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={DATA_TABLE_PAGINATION_PREV_ARIA}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[5rem] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {totalItems === 0 ? "—" : `${currentPage} / ${totalPages}`}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          disabled={currentPage >= totalPages || totalItems === 0}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={DATA_TABLE_PAGINATION_NEXT_ARIA}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
