"use client";

import { type ReactNode, memo } from "react";
import { cn } from "@/lib/utils/cn";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";

const IndicatorsCatalogToolbar = memo(function IndicatorsCatalogToolbar({
  leading,
  matchedCount,
  page,
  pageSize,
  totalPages,
  onChangePage,
  onChangePageSize,
  pageItemCount,
}: {
  leading: ReactNode;
  matchedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
  pageItemCount: number;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
      )}
    >
      <div className="flex shrink-0 items-center sm:shrink-0">{leading}</div>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 sm:ml-auto sm:justify-end sm:pl-2">
        <PaginationToolbarControls
          countSummary={
            <span className="text-sm text-muted-foreground sm:text-right">
              Mostrando{" "}
              <span className="font-medium text-foreground tabular-nums">{pageItemCount}</span> de{" "}
              <span className="font-medium text-foreground tabular-nums">{matchedCount}</span>{" "}
              {matchedCount === 1 ? "indicador" : "indicadores"}
            </span>
          }
          page={page}
          pageSize={pageSize}
          total={matchedCount}
          totalPages={totalPages}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      </div>
    </div>
  );
});

IndicatorsCatalogToolbar.displayName = "IndicatorsCatalogToolbar";

export default IndicatorsCatalogToolbar;
