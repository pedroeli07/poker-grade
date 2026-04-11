import { historyPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const HistoryPageHeader = memo(function HistoryPageHeader() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-primary">{historyPageMetadata.title}</h2>
      <p className="text-muted-foreground mt-1">{historyPageMetadata.description}</p>
    </div>
  );
});

HistoryPageHeader.displayName = "HistoryPageHeader";

export default HistoryPageHeader;
