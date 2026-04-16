import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { POKER_NETWORKS } from "@/lib/constants";
import type { PokerNetworkOption } from "@/lib/types";

export const redirectTo = (baseUrl: string, path: string) =>
  NextResponse.redirect(new URL(path, baseUrl));

export function getAppBaseUrl(): string {
  const pub = globalThis.process?.env?.["NEXT_PUBLIC_APP_URL"]?.replace(/\/$/, "");
  if (pub) return pub;
  const vercel = globalThis.process?.env?.["VERCEL_URL"];
  return vercel ? `https://${vercel}` : "";
}

export function buildNetworkOptions(): PokerNetworkOption[] {
  return Object.entries(POKER_NETWORKS).map(([value, v]) => ({ value, label: v.label }));
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min`;
  if (h < 24) return `${h}h`;
  if (d === 1) return "ontem";
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

export function getInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const clean = local.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 2) return clean.slice(0, 2).toUpperCase();
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase() || "?";
}
