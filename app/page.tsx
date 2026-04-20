import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { logPerf } from "@/lib/utils/perf";
import { UserRole } from "@prisma/client";

export default async function Home() {
  const t0 = performance.now();
  const session = await getSession();
  logPerf("app.route", "/", t0);
  if (session) {
    redirect(session.role === UserRole.PLAYER ? "/jogador/dashboard" : "/admin/dashboard");
  }
  redirect("/login");
}
