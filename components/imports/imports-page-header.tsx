import NewImportModal from "@/components/modals/new-import-modal";
import { importsPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";
import type { PlayerSelectOption } from "@/lib/types/grade/index";
const ImportsPageHeader = memo(function ImportsPageHeader({
  canImport,
  players,
}: {
  canImport: boolean;
  players: PlayerSelectOption[];
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">{importsPageMetadata.title}</h2>
        <p className="text-muted-foreground mt-1">{importsPageMetadata.description}</p>
      </div>
      {canImport ? <NewImportModal players={players} /> : null}
    </div>
  );
});

ImportsPageHeader.displayName = "ImportsPageHeader";

export default ImportsPageHeader;
