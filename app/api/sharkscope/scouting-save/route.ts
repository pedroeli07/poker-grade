import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isScoutingStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation } from "@/lib/rate-limit";
import { scoutBodySchema } from "@/lib/validation/schemas";


export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isScoutingStaffRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/sharkscope/scouting-save"
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = scoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  const { nick, network, rawData, nlqAnswer, notes } = parsed.data;

  const analysis = await prisma.scoutingAnalysis.create({
    data: {
      nick,
      network,
      rawData: rawData as never,
      nlqAnswer: nlqAnswer ? (nlqAnswer as never) : undefined,
      notes: notes ?? null,
      savedBy: session.userId,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      analysis: { ...analysis, createdAt: analysis.createdAt.toISOString() },
    },
    { status: 201 }
  );
}
