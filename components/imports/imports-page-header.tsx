import { NewImportModal } from "@/components/new-import-modal";
import { importsPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const ImportsPageHeader = memo(function ImportsPageHeader({ canImport }: { canImport: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">{importsPageMetadata.title}</h2>
        <p className="text-muted-foreground mt-1">{importsPageMetadata.description}</p>
      </div>
      {canImport ? <NewImportModal /> : null}
    </div>
  );
});

ImportsPageHeader.displayName = "ImportsPageHeader";

export default ImportsPageHeader;
