import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memo } from "react";

const TargetsEmptyState = memo(function TargetsEmptyState({
  anyFilter,
  clearFilters,
}: {
  anyFilter: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="col-span-full py-20 px-6 text-center border border-dashed rounded-2xl bg-muted/10">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Target className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Nenhum target encontrado
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto text-sm mb-6 leading-relaxed">
        {anyFilter
          ? "Tente ajustar seus filtros para ver mais resultados."
          : "Não há targets cadastrados no sistema. Acesse o perfil de um jogador para adicionar novas metas."}
      </p>
      {anyFilter && (
        <Button onClick={clearFilters} variant="outline" className="min-w-[140px]">
          Limpar Filtros
        </Button>
      )}
    </div>
  );
});

TargetsEmptyState.displayName = "TargetsEmptyState";

export default TargetsEmptyState;
