"use client";

import Link from "next/link";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Checkbox } from "@/components/ui/checkbox";
import { AUTH_INPUT_CLASS } from "@/lib/constants";
import { useLoginForm } from "@/hooks/use-login-form";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    remember,
    setRemember,
    submit,
  } = useLoginForm();

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-5">
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
            className="block font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
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
              onCheckedChange={(checked) =>
                setRemember(checked === "indeterminate" ? false : checked)
              }
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
