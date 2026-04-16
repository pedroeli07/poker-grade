import { NextResponse } from "next/server";
import { cronSecret } from "@/lib/constants";
import { sharkscopeCronSyncMode } from "@/lib/constants/sharkscope-group-site";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";
import { runDailySyncSharkScope } from "@/lib/sharkscope/run-daily-sync";
import { ErrorTypes } from "@/lib/types";

export async function GET(request: Request) {
  if (!cronSecret) {
    return NextResponse.json({ error: ErrorTypes.CRON_SECRET_NOT_CONFIGURED }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  const url = new URL(request.url);
  const forceRefresh =
    url.searchParams.get("force") === "1" || url.searchParams.get("force") === "true";
  const modeParam = url.searchParams.get("mode");
  const syncMode: SharkScopeSyncMode =
    modeParam === "full" ||
    modeParam === "light" ||
    modeParam === "players" ||
    modeParam === "analytics" ||
    modeParam === "analytics_nick"
      ? modeParam
      : sharkscopeCronSyncMode();

  try {
    const result = await runDailySyncSharkScope(forceRefresh, { syncMode });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
