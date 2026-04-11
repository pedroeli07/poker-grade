import { Suspense } from "react";
import { AuthMarketingShell } from "@/components/auth/auth-marketing-shell";
import { LoginForm } from "./login-form";
import { loginPageMetadata } from "@/lib/constants/metadata";

export const metadata = loginPageMetadata;

export default function LoginPage() {
  return (
    <AuthMarketingShell subtitle="Acesse sua conta">
      <Suspense
        fallback={
          <p className="text-center font-mono text-xs text-zinc-500">
            Carregando…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthMarketingShell>
  );
}
