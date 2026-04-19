"use client";

import Link from "next/link";
import { PasswordStrength } from "@/components/password-strength";
import { PasswordInput } from "@/components/auth/password-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AUTH_INPUT_CLASS, FORGOT_PASSWORD_OTP_INPUT_PATTERN } from "@/lib/constants";
import { useForgotPasswordResetForm } from "@/hooks/use-forgot-password-reset-form";
import { cn } from "@/lib/utils";

export function ResetForm() {
  const {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    step,
    code,
    setCode,
    emailOk,
    policyOk,
    policyGaps,
    sendCode,
    completeReset,
    goBackToEmailStep,
    otpLength,
  } = useForgotPasswordResetForm();

  return (
    <div className="space-y-6">
      {step === "EMAIL" ? (
        <form onSubmit={sendCode} noValidate className="space-y-5">
          <div className="text-center space-y-1 mb-4">
            <p className="text-sm text-muted-foreground">
              Vamos enviar um código para o seu e-mail para validar a alteração de senha.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reset-email"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              E-mail da Conta
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={AUTH_INPUT_CLASS}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !emailOk}
            className={cn(
              "cursor-pointer mt-4 h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            {loading ? "Aguarde…" : "Enviar Código"}
          </button>
        </form>
      ) : (
        <form onSubmit={completeReset} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-foreground">Verifique seu E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Código enviado para <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={otpLength}
              value={code}
              onChange={setCode}
              pattern={FORGOT_PASSWORD_OTP_INPUT_PATTERN}
            >
              <InputOTPGroup>
                {Array.from({ length: otpLength }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="w-11 h-12 text-lg bg-card border-border/80" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2 mt-2">
            <label
              htmlFor="new-pwd"
              className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              Nova Senha
            </label>
            <PasswordInput
              id="new-pwd"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="placeholder:text-muted-foreground/50"
            />
            <PasswordStrength password={password} compact />
            {password.length > 0 && policyGaps.length > 0 && (
              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                Falta: {policyGaps.join(" · ")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || code.length !== otpLength || !policyOk}
              className={cn(
                "cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              {loading ? "Processando…" : "Salvar Nova Senha"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={goBackToEmailStep}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Lembrar outra conta (Voltar)
            </button>
          </div>
        </form>
      )}

      <p className="text-center font-mono text-xs text-muted-foreground">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="cursor-pointer text-primary underline-offset-4 hover:text-primary/80 hover:underline font-semibold"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}
