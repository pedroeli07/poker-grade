import type { Metadata } from "next";
import { UserRole } from "@prisma/client";
import { requireSession } from "@/lib/auth/session";
import { minhaGradePageMetadata } from "@/lib/constants/metadata";
import { loadMinhaGradePageData } from "@/lib/data/grades";

export async function buildMinhaGradePageMetadata(): Promise<Metadata> {
  const session = await requireSession();
  if (session.role !== UserRole.PLAYER || !session.playerId) return minhaGradePageMetadata;
  const data = await loadMinhaGradePageData(session.playerId);
  const gradeName = data?.mainGrade?.name;
  if (!gradeName) return minhaGradePageMetadata;
  return { title: `${gradeName} | Minha grade`, description: minhaGradePageMetadata.description };
}
