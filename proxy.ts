import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants/session-rbac";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { logPerf } from "@/lib/utils/perf";
import { UserRole } from "@prisma/client";

const PLAYER_HOME = "/jogador/dashboard";
const ADMIN_HOME = "/admin/dashboard";

export async function proxy(request: NextRequest) {
  const t0 = performance.now();
  const { pathname } = request.nextUrl;

  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    let payload;
    try {
      payload = await verifySessionJwt(token);
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    const role = payload.role as string;

    if (role === UserRole.PLAYER) {
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL(PLAYER_HOME, request.url));
      }
    } else {
      if (pathname.startsWith("/jogador")) {
        return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
      }
    }

    return NextResponse.next();
  } finally {
    logPerf("proxy.dashboard", "total", t0, { pathname });
  }
}

export const config = {
  matcher: ["/admin/:path*", "/jogador/:path*"],
};
