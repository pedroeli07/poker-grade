import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isSharkscopeStaffRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { enforceUserRate } from "@/lib/api/enforce-rate";
import { limitSharkscopeMutation } from "@/lib/rate-limit";
import { coachNestedPlayerWhere } from "@/lib/queries/db/shared";
import { bulkDeleteAlertsBodySchema } from "@/lib/schemas/sharkscope";
import { ErrorTypes } from "@/lib/types/primitives";
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isSharkscopeStaffRole(session.role)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const limited = await enforceUserRate(
    req,
    session.userId,
    limitSharkscopeMutation,
    "api/alerts/bulk-delete"
  );
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: ErrorTypes.INVALID_JSON }, { status: 400 });
  }

  const parsed = bulkDeleteAlertsBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: ErrorTypes.INVALID_DATA }, { status: 400 });
  }

  const scope = coachNestedPlayerWhere(session);
  const existing = await prisma.alertLog.findMany({
    where: {
      id: { in: parsed.data.ids },
      ...scope,
    },
    select: { id: true },
  });

  if (existing.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, ids: [] as string[] });
  }

  const ids = existing.map((e) => e.id);
  await prisma.alertLog.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json({ ok: true, deleted: ids.length, ids });
}
