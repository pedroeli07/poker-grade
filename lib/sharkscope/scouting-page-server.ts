import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageGrades } from "@/lib/utils";
import { loadScoutingClientProps } from "@/lib/sharkscope/scouting-page-load";

export async function getScoutingPageProps() {
  const session = await requireSession();
  if (!canManageGrades(session)) redirect("/dashboard");
  return loadScoutingClientProps();
}
