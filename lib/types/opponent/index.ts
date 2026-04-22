import type { OpponentClassification, OpponentStyle } from "@prisma/client";

type OpponentNetworkNick = { network: string; nick: string };

export type OpponentNoteRow = {
  id: string;
  network: string;
  nick: string;
  body: string;
  classification: OpponentClassification | null;
  style: OpponentStyle | null;
  authorId: string;
  authorName: string | null;
  authorEmail: string;
  createdAt: Date;
  updatedAt: Date;
  canEdit: boolean;
};

export type OpponentListRow = OpponentNetworkNick & {
  nickKey: string;
  notesCount: number;
  lastNoteAt: Date;
  consolidated: OpponentConsolidated;
  /** Nota mais recente que o usuário atual pode editar (autor ou ADMIN), para ações na tabela. */
  editableNoteId: string | null;
};

export type OpponentConsolidated = {
  classification: OpponentClassification | null;
  classificationTie: boolean;
  classificationCounts: Record<string, number>;
  style: OpponentStyle | null;
  styleTie: boolean;
  styleCounts: Record<string, number>;
  confidence: "low" | "medium" | "high";
  notesUsed: number;
};

export type OpponentsListPageProps = {
  rows: OpponentListRow[];
  canCreate: boolean;
};

export type OpponentDetailProps = OpponentNetworkNick & {
  notes: OpponentNoteRow[];
  consolidated: OpponentConsolidated;
  canCreate: boolean;
};

export const OPPONENT_CLASSIFICATION_LABELS: Record<OpponentClassification, string> = {
  FISH: "Fish",
  REG: "Reg",
  WHALE: "Whale",
  NIT: "Nit",
  SHARK: "Shark",
  UNKNOWN: "Indefinido",
};

export const OPPONENT_STYLE_LABELS: Record<OpponentStyle, string> = {
  LAG: "LAG",
  TAG: "TAG",
  PASSIVE: "Passivo",
  AGGRESSIVE: "Agressivo",
  TIGHT: "Tight",
  LOOSE: "Loose",
  UNKNOWN: "Indefinido",
};
