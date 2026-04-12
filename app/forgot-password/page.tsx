import { ResetForm } from "./reset-form";
import { ShieldCheck } from "lucide-react";
import { forgotPasswordPageMetadata } from "@/lib/constants/metadata";

export const metadata = forgotPasswordPageMetadata;

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 selection:bg-primary/20 selection:text-primary">
      {/* Background (mesmo estilo do login) */}
      <div className="fixed inset-0 z-0 bg-background">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -top-1/2 h-full w-[800px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-lg shadow-black/20 ring-1 ring-primary/20 backdrop-blur-xl">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recuperar Acesso
            </h1>
            <p className="text-sm text-muted-foreground/80 font-mono">
              Redefina sua senha usando seu email
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 blur-xl" />
          
          <div className="relative rounded-3xl border border-border/50 bg-card/40 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <ResetForm />
          </div>
        </div>
      </div>
    </main>
  );
}
