import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GradesEmptyState({
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
        Nenhuma grade neste filtro.
      </p>
      {anyFilter && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="mt-2 text-primary"
          onClick={clearFilters}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
