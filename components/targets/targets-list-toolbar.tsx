"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";

const TargetsListToolbar = memo(function TargetsListToolbar({
  filteredCount,
  totalCount,
  anyFilter,
  onClearFilters,
}: {
  filteredCount: number;
  totalCount: number;
  anyFilter: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/5 px-6 py-3 text-xs text-muted-foreground">
      <span>
        <span className="font-medium text-foreground">{filteredCount}</span> /{" "}
        <span className="font-medium text-foreground">{totalCount}</span> targets
      </span>
      {anyFilter ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 bg-primary/5 text-xs text-primary hover:bg-primary/15"
          onClick={onClearFilters}
        >
          Limpar filtros
        </Button>
      ) : null}
    </div>
  );
});

TargetsListToolbar.displayName = "TargetsListToolbar";

export default TargetsListToolbar;
