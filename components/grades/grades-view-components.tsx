import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardClassName } from "@/lib/constants";
import { memo } from "react";

/** Nenhuma grade no sistema (antes de importar). */
export function GradesListInitialEmpty() {
  return (
    <div className={`${cardClassName} py-12 text-center`}>
      <Archive className="h-10 w-10 mx-auto mb-4 opacity-50" />
      <p>Nenhuma grade cadastrada.</p>
      <p className="text-sm">Importe um JSON da Lobbyze para começar.</p>
    </div>
  );
}

const GradesEmptyState = memo(function GradesEmptyState({
  anyFilter,
  clearFilters,
}: {
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="col-span-full py-16 text-center rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground">
      <Archive className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
      <p className="text-foreground/80 font-medium">
        Nenhuma grade com a seleção atual.
      </p>
      {anyFilter && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 text-primary"
          onClick={clearFilters}
        >
          Limpar
        </Button>
      )}
    </div>
  );
});

GradesEmptyState.displayName = "GradesEmptyState";

export default GradesEmptyState;
