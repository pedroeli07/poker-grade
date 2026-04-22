import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/constants/session-rbac";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { assertSameOrigin } from "@/lib/api/origin";
import { logLogout } from "@/lib/security-log";
import { ErrorTypes } from "@/lib/types/primitives";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: ErrorTypes.FORBIDDEN }, { status: 403 });
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      const payload = await verifySessionJwt(token);
      const jti = typeof payload.jti === "string" ? payload.jti : null;
      const sub = typeof payload.sub === "string" ? payload.sub : null;
      if (jti && sub) {
        await prisma.authSession.deleteMany({
          where: { id: jti, userId: sub },
        });
        logLogout(sub);
      }
    } catch {
      /* token inválido — só limpa cookie */
    }
  }

  jar.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
