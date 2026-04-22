import type { Prisma } from "@prisma/client";

/** Registro inicial em `team_culture` — vazio; conteúdo vem do banco (edição / seed explícito). */
export const EMPTY_CULTURE: Prisma.TeamCultureCreateInput = {
  purpose: "",
  vision: "",
  mission: "",
  values: [] as Prisma.InputJsonValue,
};
