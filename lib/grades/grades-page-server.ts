import { requireSession } from "@/lib/auth/session";
import { loadGradesListPageProps } from "@/lib/grades/grades-page-load";

export async function getGradesPageProps() {
  const session = await requireSession();
  return loadGradesListPageProps(session);
}
