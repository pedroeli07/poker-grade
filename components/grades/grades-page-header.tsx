import ImportGradeModal from "@/components/modals/grade-modals";
import NewGradeModal from "@/components/modals/new-grade-modal";
import { gradesPageMetadata } from "@/lib/constants/metadata";
import { memo } from "react";

const GradesPageHeader = memo(function GradesPageHeader({ manage }: { manage: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">{gradesPageMetadata.title}</h2>
        <p className="text-muted-foreground mt-1">{gradesPageMetadata.description}</p>
      </div>
      {manage ? (
        <div className="flex gap-2">
          <ImportGradeModal />
          <NewGradeModal />
        </div>
      ) : null}
    </div>
  );
});

GradesPageHeader.displayName = "GradesPageHeader";

export default GradesPageHeader;
