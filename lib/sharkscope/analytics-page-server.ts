import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { loadAnalyticsClientProps } from "@/lib/sharkscope/analytics-page-load";

export async function getAnalyticsPageProps() {
  const session = await requireSession();
  if (!canWriteOperations(session)) redirect("/dashboard");
  return loadAnalyticsClientProps();
}
