import type { PokerNetworkOption, WithId } from "../../primitives";

export type ScoutingClientProps = {
  networkOptions: PokerNetworkOption[];
  savedAnalyses: ScoutingAnalysisRow[];
};

export type SharkscopeScoutingSavedCardProps = {
  analysis: ScoutingAnalysisRow;
  expanded: boolean;
  isPending: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export type ScoutingAnalysisRow = WithId & {
  nick: string;
  network: string;
  rawData: unknown;
  nlqAnswer: unknown;
  notes: string | null;
  createdAt: string;
  savedBy: string;
};
