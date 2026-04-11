import { ScoutingSavedCard } from "@/components/sharkscope/scouting-saved-card";
import type { ScoutingAnalysisRow } from "@/lib/types";
import { memo } from "react";

const ScoutingSavedSection = memo(function ScoutingSavedSection({
  saved,
  expandedId,
  isPending,
  toggleExpanded,
  removeSaved,
}: {
  saved: ScoutingAnalysisRow[];
  expandedId: string | null;
  isPending: boolean;
  toggleExpanded: (id: string) => void;
  removeSaved: (id: string) => void;
}) {
  if (saved.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Análises Salvas</h3>
      <div className="space-y-2">
        {saved.map((analysis) => (
          <ScoutingSavedCard
            key={analysis.id}
            analysis={analysis}
            expanded={expandedId === analysis.id}
            isPending={isPending}
            onToggle={toggleExpanded}
            onDelete={removeSaved}
          />
        ))}
      </div>
    </div>
  );
});

ScoutingSavedSection.displayName = "ScoutingSavedSection";

export default ScoutingSavedSection;
