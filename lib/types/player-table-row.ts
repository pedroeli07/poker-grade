import type { PlayerStatus } from "@prisma/client";

export type PlayerTableRow = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  coachKey: string;
  coachLabel: string;
  gradeKey: string;
  gradeLabel: string;
  abiKey: string;
  abiLabel: string;
  abiNumericValue: number | null;
  abiUnit: string | null;
  status: PlayerStatus;
};
