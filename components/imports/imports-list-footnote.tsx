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
    <p
      className="px-1 font-medium leading-normal text-muted-foreground"
      style={{ fontSize: "0.8rem" }}
    >
      {filteredLength} {filteredLength === 1 ? "visível" : "visíveis"}
      {anyFilter && ` (de ${importsLength} no total)`}
      {selectedSize > 0 && ` · ${selectedSize} selecionada${selectedSize > 1 ? "s" : ""}`}
    </p>
  );
});

ImportsListFootnote.displayName = "ImportsListFootnote";

export default ImportsListFootnote;
