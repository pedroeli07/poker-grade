import { Suspense } from "react";
import { AuthMarketingShell } from "@/components/auth/auth-marketing-shell";
import { RegisterForm } from "./register-form";
import { registerPageMetadata } from "@/lib/constants/metadata";

export const metadata = registerPageMetadata;

export default function RegisterPage() {
  return (
    <AuthMarketingShell subtitle="Crie sua conta">
      <Suspense
        fallback={
          <p className="text-center font-mono text-xs text-zinc-500">
            Carregando…
          </p>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthMarketingShell>
  );
}
