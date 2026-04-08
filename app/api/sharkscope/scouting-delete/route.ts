import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isScoutingStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation } from "@/lib/rate-limit";

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || !isScoutingStaffRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/sharkscope/scouting-delete"
  );
  if (limited) return limited;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  const analysis = await prisma.scoutingAnalysis.findUnique({
    where: { id },
    select: { savedBy: true },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  if (session.role !== "ADMIN" && analysis.savedBy !== session.userId) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.scoutingAnalysis.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
