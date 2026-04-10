import type { Metadata } from "next";

export const SHARKSCOPE_SCOUTING_LS_NICK = "gestao-grades:sharkscope-scouting:nick";
export const SHARKSCOPE_SCOUTING_LS_NETWORK = "gestao-grades:sharkscope-scouting:network";
export const SHARKSCOPE_SCOUTING_LS_NOTES = "gestao-grades:sharkscope-scouting:notes";
export const SHARKSCOPE_SCOUTING_LS_NLQ = "gestao-grades:sharkscope-scouting:nlqQuestion";
export const SHARKSCOPE_SCOUTING_LS_EXPANDED = "gestao-grades:sharkscope-scouting:expandedId";

export const sharkscopeScoutingPageMetadata = {
  title: "Scouting SharkScope",
  description: "Scouting de jogadores do SharkScope para os jogadores do time.",
} satisfies Metadata;
