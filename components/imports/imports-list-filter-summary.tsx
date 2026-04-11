import { Button } from "@/components/ui/button";
import { memo } from "react";

const ImportsListFilterSummary = memo(function ImportsListFilterSummary({
  importsLength,
  filteredLength,
  anyFilter,
  onClearFilters,
}: {
  importsLength: number;
  filteredLength: number;
  anyFilter: boolean;
  onClearFilters: () => void;
}) {
  if (importsLength === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        Mostrando <span className="font-medium text-foreground">{filteredLength}</span> de{" "}
        <span className="font-medium text-foreground">{importsLength}</span> importaç
        {importsLength === 1 ? "ão" : "ões"}
      </span>
      {anyFilter && (
        <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onClearFilters}>
          Limpar todos os filtros
        </Button>
      )}
    </div>
  );
});

ImportsListFilterSummary.displayName = "ImportsListFilterSummary";

export default ImportsListFilterSummary;