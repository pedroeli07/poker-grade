import { NextResponse } from "next/server";
import { cronSecret } from "@/lib/constants/env";
import { ErrorTypes } from "@/lib/types/primitives";
export async function GET(request: Request) {
  if (!cronSecret) {
    return NextResponse.json({ error: ErrorTypes.CRON_SECRET_NOT_CONFIGURED }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
