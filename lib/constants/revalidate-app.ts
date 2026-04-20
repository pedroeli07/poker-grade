import "server-only";

import { revalidatePath } from "next/cache";
import { IMPORT_PATHS, PLAYER_PATHS } from "@/lib/constants/query-result";

export const revalidateTargets = () => revalidatePath("/admin/grades/metas");

export const revalidateImports = (...extra: string[]) => {
  for (const p of [...IMPORT_PATHS, ...extra]) revalidatePath(p);
};

export const revalidatePlayers = (...extra: string[]) => {
  for (const p of [...PLAYER_PATHS, ...extra]) revalidatePath(p);
};

export const GRADE_PATHS = ["/admin/grades/perfis", "/jogador/minha-grade"] as const;

export const revalidateGrades = (...extra: string[]) => {
  for (const p of [...GRADE_PATHS, ...extra]) revalidatePath(p);
};

export const revalidateReview = () => revalidatePath("/admin/grades/revisao");
