import { requireSession } from "@/lib/auth/session";
import { loadGradeDetailClientProps } from "@/lib/grades/grade-detail-page-load";

export async function getGradeDetailPageProps(id: string) {
  const session = await requireSession();
  return loadGradeDetailClientProps(session, id);
}
