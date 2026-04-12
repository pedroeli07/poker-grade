"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { AUTH_INPUT_CLASS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

const EMAIL_STORAGE = "gg_auth_email";
const PWD_STORAGE = "gg_auth_pwd";

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: "Não foi possível entrar com o Google. Tente de novo.",
  oauth_state: "Sessão expirada. Tente «Entrar com Google» novamente.",
  oauth_config: "Login Google não configurado no servidor.",
  access_denied: "Login com Google cancelado.",
  account_conflict: "Conflito na conta. Fale com o administrador.",
  email_not_verified: "Confirme o e-mail na conta Google antes de continuar.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const warned = useRef(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(EMAIL_STORAGE);
      const savedPwd = localStorage.getItem(PWD_STORAGE);
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
      if (savedPwd) {
        setPassword(savedPwd);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (warned.current) return;
    const err = params.get("error");
    if (!err) return;
    warned.current = true;
    
    if (err === "forbidden") {
      toast.error("Sem permissão para acessar este recurso.");
    } else {
      toast.error(OAUTH_ERRORS[err] ?? "Erro ao entrar com Google.");
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      if (remember) {
        localStorage.setItem(EMAIL_STORAGE, email);
        localStorage.setItem(PWD_STORAGE, password);
      } else {
        localStorage.removeItem(EMAIL_STORAGE);
        localStorage.removeItem(PWD_STORAGE);
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
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
            className="block font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
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
            className={AUTH_INPUT_CLASS}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="block font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foregroun"
          >
            Senha
          </label>
          <PasswordInput
            id="login-password"
            name="password"
            required
            maxLength={512}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="text-foreground placeholder:text-muted-foreground/50"
          />
    
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground mt-2">
          <label className="cursor-pointer flex items-center gap-2">
            <Checkbox
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
              className="size-3.5 border-border bg-card data-[state=checked]:bg-primary"
            />
      
            Lembrar e-mail e senha
          </label>
          <Link 
            href="/forgot-password" 
            className="text-primary hover:text-primary/80 hover:underline cursor-pointer"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
          )}
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ou
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton />

      <p className="text-center font-mono text-xs text-muted-foreground">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="cursor-pointer text-primary underline-offset-4 hover:text-primary/80 hover:underline font-semibold"
        >
          Registre-se
        </Link>
      </p>
    </div>
  );
}
