import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { runDailySyncSharkScope } from "@/lib/sharkscope/run-daily-sync";
import { ErrorTypes } from "@/lib/types";
import type { SharkScopeSyncMode } from "@/lib/types/sharkScopeTypes";

function parseSyncModeFromBody(body: unknown): SharkScopeSyncMode {
  if (
    typeof body === "object" &&
    body !== null &&
    "syncMode" in body &&
    typeof (body as { syncMode?: unknown }).syncMode === "string"
  ) {
    const m = (body as { syncMode: string }).syncMode;
    if (
      m === "full" ||
      m === "light" ||
      m === "players" ||
      m === "analytics" ||
      m === "analytics_nick"
    )
      return m;
  }
  return "full";
}

/**
 * Sincronização manual SharkScope (botão na UI).
 * Usa `request.signal`: ao cancelar o fetch no cliente, o servidor interrompe entre grupos/páginas.
 * Body JSON opcional: `{ "syncMode": "players" | "analytics" | "analytics_nick" | "light" | "full" }`; omissão = `full`.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canWriteOperations(session)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  let syncMode: SharkScopeSyncMode = "full";
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const body = await request.json();
      syncMode = parseSyncModeFromBody(body);
    }
  } catch {
    /* body vazio ou inválido */
  }

  try {
    const result = await runDailySyncSharkScope(true, { signal: request.signal, syncMode });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : ErrorTypes.SHARK_SYNC_UNKNOWN_ERROR;
    if (msg === ErrorTypes.SHARK_SYNC_CREDENTIALS_NOT_CONFIGURED) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
