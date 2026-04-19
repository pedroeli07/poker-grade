import { historyPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const HistoryPageHeader = memo(function HistoryPageHeader({ isPlayer }: { isPlayer?: boolean }) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-primary">
        {isPlayer ? "Meu Histórico de Grades" : historyPageMetadata.title}
      </h2>
      <p className="text-muted-foreground mt-1">
        {isPlayer
          ? "Acompanhe todas as alterações na sua grade ao longo do tempo."
          : historyPageMetadata.description}
      </p>
    </div>
  );
});

HistoryPageHeader.displayName = "HistoryPageHeader";

export default HistoryPageHeader;
