import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canWriteOperations } from "@/lib/utils";
import { runDailySyncSharkScope } from "@/lib/sharkscope/run-daily-sync";
import { ErrorTypes } from "@/lib/types";

/**
 * Sincronização manual SharkScope (botão na UI).
 * Usa `request.signal`: ao cancelar o fetch no cliente, o servidor interrompe entre grupos/páginas.
 * Body JSON opcional: `{ "syncMode": "light" }` — só `statistics` (sem `completedTournaments`); omissão = `full`.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !canWriteOperations(session)) {
    return NextResponse.json({ error: ErrorTypes.UNAUTHORIZED }, { status: 401 });
  }

  let syncMode: "full" | "light" = "full";
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const body = (await request.json()) as { syncMode?: string };
      if (body?.syncMode === "light") syncMode = "light";
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
