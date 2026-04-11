import { memo } from "react";

const ImportsListFootnote = memo(function ImportsListFootnote({
  importsLength,
  filteredLength,
  anyFilter,
  selectedSize,
}: {
  importsLength: number;
  filteredLength: number;
  anyFilter: boolean;
  selectedSize: number;
}) {
  if (importsLength === 0) return null;

  return (
    <p className="text-xs text-muted-foreground px-1">
      {filteredLength} visível{filteredLength !== 1 ? "is" : ""}
      {anyFilter && ` (de ${importsLength} no total)`}
      {selectedSize > 0 && ` · ${selectedSize} selecionada${selectedSize > 1 ? "s" : ""}`}
    </p>
  );
});

ImportsListFootnote.displayName = "ImportsListFootnote";

export default ImportsListFootnote;
