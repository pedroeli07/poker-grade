import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { loadAlertsClientProps } from "@/lib/sharkscope/alerts-page-load";

export async function getAlertsPageProps() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");
  return loadAlertsClientProps(session);
}
