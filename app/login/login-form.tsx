"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const EMAIL_STORAGE = "gg_auth_email";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Não foi possível entrar com o Google. Tente de novo.",
  oauth_state: "Sessão expirada. Tente «Entrar com Google» novamente.",
  oauth_config: "Login Google não configurado no servidor.",
  access_denied: "Login com Google cancelado.",
  account_conflict: "Conflito na conta. Fale com o administrador.",
  email_not_verified: "Confirme o e-mail na conta Google antes de continuar.",
};

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus-visible:border-rose-500/40 focus-visible:ring-2 focus-visible:ring-rose-500/20";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const warned = useRef(false);
  const oauthWarned = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(EMAIL_STORAGE);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (warned.current) return;
    if (params.get("error") === "forbidden") {
      warned.current = true;
      toast.error("Sem permissão para acessar este recurso.");
    }
  }, [params]);

  useEffect(() => {
    if (oauthWarned.current) return;
    const err = params.get("error");
    if (!err || err === "forbidden") return;
    oauthWarned.current = true;
    toast.error(OAUTH_ERRORS[err] ?? "Erro ao entrar com Google.");
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const pwd = String(fd.get("password") || "");
    const em = String(fd.get("email") || "").trim();

    try {
      if (remember) {
        localStorage.setItem(EMAIL_STORAGE, em);
      } else {
        localStorage.removeItem(EMAIL_STORAGE);
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em, password: pwd }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Não foi possível entrar.");
        return;
      }
      toast.success("Sessão iniciada");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            E-mail
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={320}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            Senha
          </label>
          <PasswordInput
            id="login-password"
            name="password"
            required
            maxLength={512}
            autoComplete="current-password"
            placeholder="••••••••"
            className="border-white/10 bg-white/[0.04] pr-11 pl-3.5"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] text-zinc-500">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-3.5 rounded border-white/20 bg-white/5 accent-rose-500"
          />
          Lembrar e-mail
        </label>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "cursor-pointer h-12 w-full rounded-xl bg-rose-600 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-rose-950/40 transition hover:bg-rose-500 disabled:opacity-60"
          )}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          ou
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleSignInButton />

      <p className="text-center font-mono text-xs text-zinc-500">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="cursor-pointer text-rose-400 underline-offset-4 hover:text-rose-300 hover:underline"
        >
          Registre-se
        </Link>
      </p>
    </div>
  );
}
