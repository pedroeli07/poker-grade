import { requireSession } from "@/lib/auth/session";
import { loadTargetsPageProps } from "@/lib/targets/targets-page-load";

export async function getTargetsPageProps() {
  const session = await requireSession();
  return loadTargetsPageProps(session);
}
