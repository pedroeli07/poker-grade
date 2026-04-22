"use client";

import { memo } from "react";
import { Target as TargetWatermarkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TargetCard } from "@/components/targets/target-card";
import TargetsEmptyState from "@/components/targets/targets-view-components";
import type { TargetListRow } from "@/lib/types/target/index";
import { useTargetsCardsSection } from "@/hooks/targets/use-targets-cards-section";

const TargetsCardsSection = memo(function TargetsCardsSection({
  filtered,
  anyFilter,
  onClearFilters,
  hidePlayerLine = false,
}: {
  filtered: TargetListRow[];
  anyFilter: boolean;
  onClearFilters: () => void;
  hidePlayerLine?: boolean;
}) {
  const viewModels = useTargetsCardsSection(filtered);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {viewModels.map((vm) => (
          <Card
            key={vm.id}
            className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:from-blue-500/10 hover:to-blue-500/20 hover:shadow-blue-500/20 group"
          >
            <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <TargetWatermarkIcon className="h-32 w-32 text-blue-500" />
            </div>
            <CardContent className="p-5 relative z-10">
              <TargetCard vm={vm} hidePlayerLine={hidePlayerLine} />
            </CardContent>
          </Card>
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
