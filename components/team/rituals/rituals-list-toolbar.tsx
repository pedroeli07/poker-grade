"use client";

import { memo } from "react";
import PaginationToolbarControls from "@/components/data-table/pagination-toolbar-controls";

const RitualsListToolbar = memo(function RitualsListToolbar({
  matchedCount,
  page,
  pageSize,
  totalPages,
  onChangePage,
  onChangePageSize,
  pageItemCount,
}: {
  matchedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onChangePage: (p: number) => void;
  onChangePageSize: (size: number) => void;
  pageItemCount: number;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
      <div className="flex flex-wrap items-center justify-end gap-3 sm:shrink-0">
        <PaginationToolbarControls
          countSummary={
            <span className="text-sm text-muted-foreground sm:text-right">
              Mostrando{" "}
              <span className="font-medium text-foreground tabular-nums">{pageItemCount}</span> de{" "}
              <span className="font-medium text-foreground tabular-nums">{matchedCount}</span>{" "}
              {matchedCount === 1 ? "ritual" : "rituais"}
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

RitualsListToolbar.displayName = "RitualsListToolbar";

export default RitualsListToolbar;
