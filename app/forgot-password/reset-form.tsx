"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "@/components/password-strength";
import {
  getPasswordPolicyGaps,
  passwordMeetsPolicy,
} from "@/lib/auth/password-policy";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-card/50 px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20";

export function ResetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState<"EMAIL" | "OTP_NEW_PASSWORD">("EMAIL");
  const [code, setCode] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const policyOk = passwordMeetsPolicy(password);
  const policyGaps = getPasswordPolicyGaps(password);

  async function onSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailOk) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "RESET" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Houve um problema. Tente novamente.");
        return;
      }
      toast.success("Se a conta existir, um código foi enviado para " + email);
      setStep("OTP_NEW_PASSWORD");
    } catch {
      toast.error("Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  }

  async function onCompleteReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Preencha o código de 6 dígitos.");
      return;
    }
    if (!policyOk) {
      toast.error("A senha não atende os requisitos mínimos.");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code,
          newPassword: password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        toast.error(data.error || "Não foi possível redefinir a senha.");
        return;
      }
      toast.success("Senha redefinida com sucesso!");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {step === "EMAIL" ? (
        <form onSubmit={onSendCode} noValidate className="space-y-5">
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
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={inputClass}
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
        <form onSubmit={onCompleteReset} className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-foreground">Verifique seu E-mail</h3>
            <p className="text-sm text-muted-foreground">
              Código enviado para <strong className="text-foreground">{email}</strong>
            </p>
          </div>
          
          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              pattern="^[0-9]+$"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-11 h-12 text-lg bg-card border-border/80" />
                <InputOTPSlot index={1} className="w-11 h-12 text-lg bg-card border-border/80" />
                <InputOTPSlot index={2} className="w-11 h-12 text-lg bg-card border-border/80" />
                <InputOTPSlot index={3} className="w-11 h-12 text-lg bg-card border-border/80" />
                <InputOTPSlot index={4} className="w-11 h-12 text-lg bg-card border-border/80" />
                <InputOTPSlot index={5} className="w-11 h-12 text-lg bg-card border-border/80" />
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
            <div className="relative isolate h-11">
              <input
                id="new-pwd"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={cn(inputClass, "pr-11")}
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((s) => !s)}
                className="pointer-events-auto absolute right-0 top-0 z-20 flex h-11 w-11 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
              disabled={loading || code.length !== 6 || !policyOk}
              className={cn(
                "cursor-pointer h-12 w-full rounded-xl bg-primary font-mono text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              {loading ? "Processando…" : "Salvar Nova Senha"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep("EMAIL")}
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
