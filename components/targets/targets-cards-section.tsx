"use client";

import { memo } from "react";
import { TargetCard } from "@/components/targets/target-card";
import { TargetsEmptyState } from "@/components/targets/targets-view-components";
import type { TargetListRow } from "@/lib/types";
import { useTargetsCardsSection } from "@/hooks/targets/use-targets-cards-section";

const TargetsCardsSection = memo(function TargetsCardsSection({
  filtered,
  anyFilter,
  onClearFilters,
}: {
  filtered: TargetListRow[];
  anyFilter: boolean;
  onClearFilters: () => void;
}) {
  const viewModels = useTargetsCardsSection(filtered);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {viewModels.map((vm) => (
          <div
            key={vm.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <TargetCard vm={vm} />
          </div>
        ))}
        {viewModels.length === 0 && (
          <TargetsEmptyState anyFilter={anyFilter} clearFilters={onClearFilters} />
        )}
      </div>
    </div>
  );
});

TargetsCardsSection.displayName = "TargetsCardsSection";

export default TargetsCardsSection;
