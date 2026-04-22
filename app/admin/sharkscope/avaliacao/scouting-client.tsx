"use client";

import { memo } from "react";
import type { ScoutingClientProps } from "@/lib/types/sharkscope/scouting/index";
import { useScoutingPageClient } from "@/hooks/sharkscope/scouting/use-scouting-page-client";
import ScoutingPageHeader from "@/components/sharkscope/scouting/scouting-page-header";
import ScoutingSearchCard from "@/components/sharkscope/scouting/scouting-search-card";
import ScoutingResultCard from "@/components/sharkscope/scouting/scouting-result-card";
import ScoutingSavedSection from "@/components/sharkscope/scouting/scouting-saved-section";

const ScoutingClient = memo(function ScoutingClient({
  networkOptions,
  savedAnalyses: initialSaved,
}: ScoutingClientProps) {
  const {
    nick,
    setNick,
    network,
    setNetwork,
    searchResult,
    nickId,
    nlqQuestion,
    setNlqQuestion,
    nlqAnswer,
    notes,
    setNotes,
    saved,
    expandedId,
    isPending,
    searchStats,
    handleSearch,
    handleNlq,
    handleSave,
    toggleExpanded,
    removeSaved,
  } = useScoutingPageClient(networkOptions, initialSaved);

  return (
    <div className="space-y-8">
      <ScoutingPageHeader />

      <ScoutingSearchCard
        nick={nick}
        setNick={setNick}
        network={network}
        setNetwork={setNetwork}
        networkOptions={networkOptions}
        isPending={isPending}
        handleSearch={handleSearch}
      />

      {searchResult && (
        <ScoutingResultCard
          nick={nick}
          network={network}
          searchStats={searchStats}
          nickId={nickId}
          nlqQuestion={nlqQuestion}
          setNlqQuestion={setNlqQuestion}
          nlqAnswer={nlqAnswer}
          notes={notes}
          setNotes={setNotes}
          isPending={isPending}
          handleNlq={handleNlq}
          handleSave={handleSave}
        />
      )}

      <ScoutingSavedSection
        saved={saved}
        expandedId={expandedId}
        isPending={isPending}
        toggleExpanded={toggleExpanded}
        removeSaved={removeSaved}
      />
    </div>
  );
});

ScoutingClient.displayName = "ScoutingClient";

export default ScoutingClient;
