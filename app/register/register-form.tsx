"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Upload } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordStrength } from "@/components/password-strength";
import {
  getPasswordPolicyGaps,
  passwordMeetsPolicy,
} from "@/lib/auth/password-policy";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus-visible:border-rose-500/40 focus-visible:ring-2 focus-visible:ring-rose-500/20";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inviteWarned = useRef(false);

  /** Autofill do browser pode preencher o DOM sem disparar onChange no React. */
  useEffect(() => {
    const syncFromDom = () => {
      const el = (id: string) =>
        document.getElementById(id) as HTMLInputElement | null;
      const em = el("reg-email");
      const pw = el("reg-password");
      const cf = el("reg-confirm");
      const nm = el("reg-name");
      if (em?.value) setEmail((cur) => cur || em.value);
      if (pw?.value) setPassword((cur) => cur || pw.value);
      if (cf?.value) setConfirm((cur) => cur || cf.value);
      if (nm?.value) setDisplayName((cur) => cur || nm.value);
    };
    const t0 = window.setTimeout(syncFromDom, 50);
    const t1 = window.setTimeout(syncFromDom, 400);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, []);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const policyOk = passwordMeetsPolicy(password);
  const passwordsMatch =
    confirm.length > 0 && password.length > 0 && password === confirm;
  const canSubmit =
    emailOk && policyOk && passwordsMatch && !loading;

  const policyGaps = getPasswordPolicyGaps(password);

  const submitBlockerHint = (() => {
    if (loading) return "";
    const parts: string[] = [];
    if (!emailOk) parts.push("Informe um e-mail válido.");
    if (emailOk && password.length === 0) {
      parts.push("Defina uma senha.");
    }
    if (emailOk && password.length > 0 && !policyOk) {
      parts.push("Complete todos os requisitos da senha (lista acima).");
    }
    if (
      emailOk &&
      policyOk &&
      password.length > 0 &&
      confirm.length === 0
    ) {
      parts.push("Repita a senha no campo «Confirmar».");
    }
    if (confirm.length > 0 && !passwordsMatch) {
      parts.push("As duas senhas têm de ser iguais.");
    }
    return parts.join(" ");
  })();

  useEffect(() => {
    if (inviteWarned.current) return;
    if (params.get("error") === "not_invited") {
      inviteWarned.current = true;
      toast.error(
        "Este Google não está autorizado. Peça um convite ao administrador ou use o e-mail convidado."
      );
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    setLoading(true);
    const em = email.trim();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: em,
          password,
          confirmPassword: confirm,
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Não foi possível criar a conta.");
        return;
      }
      toast.success("Conta criada. Bem-vindo!");
      router.push((data as { redirect?: string }).redirect ?? "/dashboard");
      router.refresh();
    } catch {
      toast.error("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
{/*
      <div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/[0.02] text-zinc-600"
        aria-hidden
      >
        <Upload className="h-7 w-7" />
      </div>

      <p className="text-center font-mono text-[10px] text-zinc-600">
        Foto de perfil em breve
      </p>
      */}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="reg-name"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            Nome completo
          </label>
          <input
            id="reg-name"
            name="displayName"
            type="text"
            autoComplete="name"
            maxLength={200}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onInput={(e) => setDisplayName(e.currentTarget.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="reg-email"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            E-mail
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="seu@email.com"
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="reg-password"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            Senha
          </label>
          <div className="relative isolate h-11">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={(e) => setPassword(e.currentTarget.value)}
              placeholder="••••••••••••"
              className={cn(inputClass, "pr-11")}
            />
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((s) => !s)}
              className="pointer-events-auto absolute right-0 top-0 z-20 flex h-11 w-11 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={password} compact />
          {password.length > 0 && policyGaps.length > 0 ? (
            <p
              className="font-mono text-[10px] leading-relaxed text-zinc-500"
              data-testid="password-policy-gaps"
            >
              Falta: {policyGaps.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="reg-confirm"
            className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500"
          >
            Confirmar senha
          </label>
          <div className="relative isolate h-11">
            <input
              id="reg-confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              maxLength={128}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onInput={(e) => setConfirm(e.currentTarget.value)}
              placeholder="••••••••••••"
              className={cn(inputClass, "pr-11")}
            />
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowConfirm((s) => !s)}
              className="pointer-events-auto absolute right-0 top-0 z-20 flex h-11 w-11 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirm.length > 0 && password !== confirm ? (
            <p className="text-xs text-rose-400">As senhas não coincidem.</p>
          ) : null}
        </div>
        {submitted && !canSubmit && submitBlockerHint ? (
          <p
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-[10px] leading-relaxed text-zinc-500"
            data-testid="register-blockers-hint"
          >
            {submitBlockerHint}
          </p>
        ) : null}
        <button
          type="submit"
          data-testid="register-submit"
          disabled={loading}
          className={cn(
            "cursor-pointer h-12 w-full rounded-xl bg-rose-900 font-mono text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-black/40 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          {loading ? "Registrando…" : "Registrar"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          ou
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleSignInButton label="Registrar com Google" />

      <p className="text-center font-mono text-xs text-zinc-500">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="cursor-pointer text-rose-400 underline-offset-4 hover:text-rose-300 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
