import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySessionJwt } from "@/lib/auth/jwt";
import { logPerf } from "@/lib/utils/perf";

/**
 * Routes that PLAYER role cannot access.
 * Checked via startsWith so sub-routes are also covered.
 */
const PLAYER_BLOCKED_PREFIXES = [
  "/dashboard/players",
  "/dashboard/grades",
  "/dashboard/imports",
  "/dashboard/review",
  "/dashboard/targets",
  "/dashboard/users",
];

/** The landing page for a PLAYER after login */
const PLAYER_HOME = "/dashboard/minha-grade";

export async function proxy(request: NextRequest) {
  const t0 = performance.now();
  const { pathname } = request.nextUrl;

  try {
    // ── Auth check ────────────────────────────────────────────────────────────
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

    // ── Role-based route protection ───────────────────────────────────────────
    if (role === "PLAYER") {
      // Redirect root dashboard to player home
      if (pathname === "/dashboard") {
        return NextResponse.redirect(new URL(PLAYER_HOME, request.url));
      }

      // Block access to staff-only sections
      const blocked = PLAYER_BLOCKED_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
      );
      if (blocked) {
        return NextResponse.redirect(new URL(PLAYER_HOME, request.url));
      }
    }

    return NextResponse.next();
  } finally {
    logPerf("proxy.dashboard", "total", t0, { pathname });
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
