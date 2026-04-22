import crypto from "node:crypto";
import { sharkScopeAppKey, sharkScopeAppName, sharkScopePasswordHash, sharkScopeUsername } from "@/lib/constants/env";
import type { SharkScopeResponse } from "@/lib/types/sharkScopeTypes";
export function encodeSharkScopePassword(): string {
  const combined = sharkScopePasswordHash!.toLowerCase() + sharkScopeAppKey!;
  return crypto.createHash("md5").update(combined).digest("hex").toLowerCase();
}

export const sharkScopeBaseUrl = () => `https://www.sharkscope.com/api/${sharkScopeAppName}`;

export const sharkScopeHeaders = (): HeadersInit => ({
  Accept: "application/json",
  "User-Agent": "CLTeamApp/1.0",
  Username: sharkScopeUsername!,
  Password: encodeSharkScopePassword(),
});

export function sharkScopeResponseErrorMessage(data: unknown): string | null {
  const r = (data as Record<string, unknown>)?.Response as Record<string, unknown> | undefined;
  if (!r) return null;
  if (r["@success"] !== "false" && r.success !== "false" && r["@success"] !== false) return null;
  const errEl = ((r.ErrorResponse as Record<string, unknown>)?.Error) as
    | Record<string, unknown>
    | string
    | undefined;
  if (typeof errEl === "string") return errEl;
  if (errEl && typeof errEl === "object") {
    const msg = (errEl as Record<string, unknown>)["$"];
    if (typeof msg === "string") return msg;
  }
  return "SharkScope retornou success=false";
}

/**
 * Mensagens de indisponibilidade do Player Group na API SharkScope (EN + PT).
 * O sync diário usa isto para `AlertLog` `group_not_found`; antes só se reconhecia inglês ("not found"),
 * e a API documenta erros em PT (ex.: cód. 105001 / 200039 — "Grupo de jogadores não encontrado").
 */
export function isSharkScopePlayerGroupUnavailableMessage(message: string): boolean {
  const s = message.toLowerCase();
  if (s.includes("not found") || s.includes("opted out") || s.includes("opt out")) {
    return true;
  }
  const n = s.normalize("NFD").replace(/\p{M}/gu, "");
  if (n.includes("grupo de jogadores") && n.includes("nao encontrado")) {
    return true;
  }
  if (n.includes("nao encontrado") && n.includes("opt out")) {
    return true;
  }
  return false;
}

export async function sharkScopeGet<T = unknown>(
  path: string,
  init?: { signal?: AbortSignal }
): Promise<SharkScopeResponse<T>> {
  const res = await fetch(`${sharkScopeBaseUrl()}${path}`, {
    headers: sharkScopeHeaders(),
    next: { revalidate: 0 },
    signal: init?.signal,
  });
  if (!res.ok) throw new Error(`SharkScope HTTP ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as SharkScopeResponse<T>;
  const err = sharkScopeResponseErrorMessage(data);
  if (err) throw new Error(`SharkScope: ${err}`);
  return data;
}
