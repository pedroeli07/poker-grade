import { NextResponse } from "next/server";
import { cronSecret } from "@/lib/constants";
import { ErrorTypes } from "@/lib/types";

export async function GET(request: Request) {
  if (!cronSecret) {
    return NextResponse.json({ error: ErrorTypes.NOT_CONFIGURED }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
