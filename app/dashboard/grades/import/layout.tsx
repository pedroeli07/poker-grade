import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { canManageGrades } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function ImportGradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (!canManageGrades(session)) {
    redirect("/dashboard/grades");
  }
  return <>{children}</>;
}
