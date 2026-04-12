"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordStrength } from "@/components/password-strength";
import {
  getPasswordPolicyGaps,
  passwordMeetsPolicy,
} from "@/lib/auth/password-policy";
import { toast } from "@/lib/toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AUTH_INPUT_CLASS } from "@/lib/constants";
import { PasswordInput } from "@/components/auth/password-input";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [code, setCode] = useState("");
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
  const passwordsMatch = confimValMatch(password, confirm);
  const canSubmit = emailOk && policyOk && passwordsMatch && !loading;

  const policyGaps = getPasswordPolicyGaps(password);

  const submitBlockerHint = getSubmitHint(loading, emailOk, password, policyOk, confirm, passwordsMatch);

  useEffect(() => {
    if (inviteWarned.current) return;
    if (params.get("error") === "not_invited") {
      inviteWarned.current = true;
      toast.error(
        "Este Google não está autorizado. Peça um convite ao administrador ou use o e-mail convidado."
      );
    }
  }, [params]);

  async function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "REGISTER" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Acesso negado para este e-mail.");
        return;
      }
      toast.success("Código enviado para " + email);
      setStep("OTP");
    } catch {
      toast.error("Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  }

  async function onCompleteRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Preencha o código de 6 dígitos.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          confirmPassword: confirm,
          displayName: displayName.trim() || undefined,
          code,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "Não foi possível criar a conta.");
        return;
      }
      toast.success("Conta criada. Bem-vindo!");
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      toast.error("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {step === "CREDENTIALS" ? (
        <form onSubmit={onSendCode} noValidate className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="reg-name"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              Nome completo
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              maxLength={200}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className={AUTH_INPUT_CLASS}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="reg-email"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              E-mail
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
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
              htmlFor="reg-password"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              Senha
            </label>
            <PasswordInput
              id="reg-password"
              required
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="placeholder:text-muted-foreground/50"
            />
            <PasswordStrength password={password} compact />
            {password.length > 0 && policyGaps.length > 0 && (
              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground" data-testid="password-policy-gaps">
                Falta: {policyGaps.join(" · ")}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="reg-confirm"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              Confirmar senha
            </label>
            <PasswordInput
              id="reg-confirm"
              required
              maxLength={128}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••••••"
              className="placeholder:text-muted-foreground/50"
            />
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-destructive">As senhas não coincidem.</p>
            )}
          </div>
          {submitted && !canSubmit && submitBlockerHint && (
            <p className="rounded-lg border border-border bg-red-500/90 px-3 py-2 font-mono text-[12px] shadow-lg shadow-red-500 leading-relaxed text-white animate-bounce" data-testid="register-blockers-hint">
              {submitBlockerHint}
            </p>
          )}
          <button
            type="submit"
            data-testid="register-submit"
            disabled={loading}
            className="cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Aguarde…" : "Avançar"}
          </button>
        </form>
      ) : (
        <form onSubmit={onCompleteRegister} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-foreground">Verifique seu E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Enviamos um código de 6 dígitos para o e-mail: <br />
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>
          
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={code} onChange={setCode} pattern="^[0-9]+$">
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl bg-card border-border/80" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Registrando…" : "Concluir Cadastro"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep("CREDENTIALS")}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Voltar e corrigir dados
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton label="Registrar com Google" />

      <p className="text-center font-mono text-xs text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="cursor-pointer text-primary underline-offset-4 hover:text-primary/80 hover:underline font-semibold">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function confimValMatch(password: string, confirm: string) {
  return confirm.length > 0 && password.length > 0 && password === confirm;
}

function getSubmitHint(loading: boolean, emailOk: boolean, password: string, policyOk: boolean, confirm: string, passwordsMatch: boolean) {
  if (loading) return "";
  const parts: string[] = [];
  if (!emailOk) parts.push("Informe um e-mail válido.");
  if (emailOk && password.length === 0) parts.push("Defina uma senha.");
  if (emailOk && password.length > 0 && !policyOk) parts.push("Complete todos os requisitos da senha (lista acima).");
  if (emailOk && policyOk && password.length > 0 && confirm.length === 0) parts.push("Repita a senha no campo «Confirmar».");
  if (confirm.length > 0 && !passwordsMatch) parts.push("As duas senhas têm de ser iguais.");
  return parts.join(" ");
}
