import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { DeleteImportButton } from "@/components/imports/delete-import-button";
import type { ImportDetailRecord } from "@/lib/types/imports/index";
import { memo } from "react";

const ImportDetailHeader = memo(function ImportDetailHeader({
  importId,
  importRecord,
  canDelete,
  totalTournaments,
}: {
  importId: string;
  importRecord: ImportDetailRecord;
  canDelete: boolean;
  totalTournaments: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/grades/importacoes">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-bold tracking-tight truncate text-primary">{importRecord.fileName}</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-0.5">
          {importRecord.playerName && (
            <span className="font-medium text-foreground">{importRecord.playerName}</span>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(importRecord.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm", {
              locale: ptBR,
            })}
          </span>
          <span>·</span>
          <span>{totalTournaments} torneios no total</span>
        </div>
      </div>
      {canDelete && <DeleteImportButton importId={importId} />}
    </div>
  );
});

ImportDetailHeader.displayName = "ImportDetailHeader";

export default ImportDetailHeader;
