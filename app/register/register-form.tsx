"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { PasswordStrength } from "@/components/password-strength";
import { PasswordInput } from "@/components/auth/password-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AUTH_INPUT_CLASS, REGISTER_OTP_INPUT_PATTERN } from "@/lib/constants";
import { useRegisterForm } from "@/hooks/use-register-form";

export function RegisterForm() {
  const {
    loading,
    password,
    setPassword,
    confirm,
    setConfirm,
    displayName,
    setDisplayName,
    email,
    setEmail,
    submitted,
    step,
    code,
    setCode,
    canSubmit,
    policyGaps,
    submitBlockerHint,
    sendCode,
    completeRegister,
    goBackToCredentials,
    otpLength,
  } = useRegisterForm();

  return (
    <div className="space-y-6">
      {step === "CREDENTIALS" ? (
        <form onSubmit={sendCode} noValidate className="space-y-5">
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
              <p
                className="font-mono text-[10px] leading-relaxed text-muted-foreground"
                data-testid="password-policy-gaps"
              >
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
            <p
              className="rounded-lg border border-border bg-red-500/90 px-3 py-2 font-mono text-[12px] shadow-lg shadow-red-500 leading-relaxed text-white animate-bounce"
              data-testid="register-blockers-hint"
            >
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
        <form onSubmit={completeRegister} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-foreground">Verifique seu E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Enviamos um código de {otpLength} dígitos para o e-mail: <br />
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={otpLength}
              value={code}
              onChange={setCode}
              pattern={REGISTER_OTP_INPUT_PATTERN}
            >
              <InputOTPGroup>
                {Array.from({ length: otpLength }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="w-12 h-14 text-xl bg-card border-border/80" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || code.length !== otpLength}
              className="cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Registrando…" : "Concluir Cadastro"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={goBackToCredentials}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Voltar e corrigir dados
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          ou
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton label="Registrar com Google" />

      <p className="text-center font-mono text-xs text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="cursor-pointer text-primary underline-offset-4 hover:text-primary/80 hover:underline font-semibold"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
